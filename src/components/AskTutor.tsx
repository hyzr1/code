import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { createPortal } from "react-dom";
import type { Atom } from "../types";
import type { Scene } from "../engine/scenes";
import * as tutor from "../engine/tutor";
import type { TutorTier } from "../engine/tutor";
import * as narrator from "../engine/narrator";
import * as neural from "../engine/neural";
import { useSettings } from "../settings";
import Icon from "./Icon";
import Markdown from "./Markdown";

/**
 * The in-lesson tutor — modeled on the Hyzr chat composer.
 *
 * Opens over the player already knowing which slide you're on. You type or talk
 * to it; user turns are bubbles, answers stream as plain Markdown, and each is
 * read aloud in a voice that actually plays (see `speak`). Everything runs on
 * the device via WebLLM (see `../engine/tutor`) — free and private.
 */

interface Turn {
  role: "user" | "assistant";
  content: string;
}

interface SpeechRec {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start(): void;
  stop(): void;
  onresult: ((event: SpeechResultLike) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
}
interface SpeechResultLike {
  resultIndex: number;
  results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }>;
}
function speechRecognitionCtor(): (new () => SpeechRec) | null {
  const w = window as unknown as {
    SpeechRecognition?: new () => SpeechRec;
    webkitSpeechRecognition?: new () => SpeechRec;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

function plain(text: string): string {
  return text
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/[`*_]/g, "")
    .trim();
}

function groundingPrompt(atom: Atom, scene: Scene): string {
  const code = scene.code ? `\n\nThe code on the slide right now:\n${scene.code}` : "";
  return [
    `You are a warm, patient coding tutor built directly into an interactive lesson titled "${atom.title}".`,
    `The learner is a beginner and is looking at this slide right now:`,
    `"""`,
    plain(scene.caption),
    `"""${code}`,
    ``,
    `Answer their question about it directly and simply, as if they are new to programming.`,
    `Keep answers to 2-4 short sentences. Use one tiny concrete example only when it truly helps.`,
    `Never paste long blocks of code. If they drift off-topic, gently bring them back to the lesson.`,
  ].join("\n");
}

const TIERS: { id: TutorTier; label: string; desc: string }[] = [
  { id: "auto", label: "Auto", desc: "Best model for this device" },
  { id: "fast", label: "Fast", desc: "Quicker, smaller download" },
  { id: "smart", label: "Smart", desc: "Best answers, larger download" },
];

export default function AskTutor({
  atom,
  scene,
  open,
  onClose,
}: {
  atom: Atom;
  scene: Scene;
  open: boolean;
  onClose: () => void;
}) {
  const { settings, update } = useSettings();
  const status = useSyncExternalStore(tutor.subscribe, tutor.getStatus);
  const progress = useSyncExternalStore(tutor.subscribe, tutor.getProgress);
  const tier = useSyncExternalStore(tutor.subscribe, tutor.getTier);

  const [turns, setTurns] = useState<Turn[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [speakOn, setSpeakOn] = useState(true);
  const [speaking, setSpeaking] = useState<number | null>(null);
  const [listening, setListening] = useState(false);
  const [showModels, setShowModels] = useState(false);
  const [failed, setFailed] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const taRef = useRef<HTMLTextAreaElement | null>(null);
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);
  const recognitionRef = useRef<SpeechRec | null>(null);
  const sendRef = useRef<(q: string) => void>(() => {});

  const supported = tutor.isSupported();
  const micSupported = Boolean(speechRecognitionCtor());
  const currentTier = TIERS.find((t) => t.id === tier) ?? TIERS[0];

  useEffect(() => {
    tutor.setTier(settings.watch.tutorTier);
  }, [settings.watch.tutorTier]);

  useEffect(() => {
    narrator.loadVoices().then((all) => {
      voiceRef.current =
        all.find((v) => v.voiceURI === settings.watch.voiceURI) ??
        narrator.pickVoice(all);
    });
  }, [settings.watch.voiceURI]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [turns, busy]);

  const autosize = useCallback(() => {
    const el = taRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }, []);

  useEffect(() => {
    if (open) {
      const id = setTimeout(() => taRef.current?.focus(), 120);
      const onKey = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          if (showModels) setShowModels(false);
          else onClose();
        }
      };
      window.addEventListener("keydown", onKey);
      return () => {
        clearTimeout(id);
        window.removeEventListener("keydown", onKey);
      };
    }
    narrator.cancel();
    abortRef.current?.abort();
    recognitionRef.current?.stop();
    setSpeaking(null);
    setListening(false);
    setShowModels(false);
  }, [open, onClose, showModels]);

  // Unlock the Web Audio context inside a user gesture so a spoken answer,
  // which arrives seconds later after generation, is allowed to play.
  const unlockAudio = useCallback(() => {
    try {
      void neural.audioContext().resume();
    } catch {
      // No context yet / not needed; the system voice path doesn't require it.
    }
  }, []);

  const speak = useCallback(
    (text: string, index: number) => {
      narrator.cancel();
      setSpeaking(index);
      // Use the natural voice only when its model is already loaded; otherwise
      // fall back to the always-available system voice so the tutor is never
      // silently mute waiting on a download.
      const engine =
        settings.watch.engine === "natural" && neural.getStatus() === "ready"
          ? "natural"
          : "system";
      narrator.speak(text, {
        rate: settings.watch.rate,
        voice: voiceRef.current,
        engine,
        neuralVoice: settings.watch.neuralVoice,
        onEnd: () => setSpeaking((cur) => (cur === index ? null : cur)),
      });
    },
    [settings.watch.engine, settings.watch.rate, settings.watch.neuralVoice],
  );

  const stopSpeaking = useCallback(() => {
    narrator.cancel();
    setSpeaking(null);
  }, []);

  const send = useCallback(
    async (question: string) => {
      const q = question.trim();
      if (!q || busy) return;
      unlockAudio();
      setFailed(null);
      setInput("");
      if (taRef.current) taRef.current.style.height = "auto";
      narrator.cancel();
      setSpeaking(null);

      const history = [...turns, { role: "user", content: q } as Turn];
      const assistantIndex = history.length;
      setTurns([...history, { role: "assistant", content: "" }]);
      setBusy(true);

      const controller = new AbortController();
      abortRef.current = controller;

      const messages = [
        { role: "system" as const, content: groundingPrompt(atom, scene) },
        ...history.slice(-6).map((t) => ({ role: t.role, content: t.content })),
      ];

      try {
        const answer = await tutor.ask(messages, {
          signal: controller.signal,
          onToken: (fullSoFar) =>
            setTurns((prev) => {
              const copy = prev.slice();
              copy[copy.length - 1] = { role: "assistant", content: fullSoFar };
              return copy;
            }),
        });
        if (!controller.signal.aborted && answer.trim() && speakOn) {
          speak(answer, assistantIndex);
        }
      } catch (cause) {
        setFailed(cause instanceof Error ? cause.message : "Something went wrong.");
        setTurns((prev) => prev.filter((t, i) => !(i === prev.length - 1 && !t.content)));
      } finally {
        setBusy(false);
        abortRef.current = null;
      }
    },
    [atom, scene, turns, busy, speakOn, speak, unlockAudio],
  );
  sendRef.current = send;

  const stop = useCallback(() => {
    abortRef.current?.abort();
    narrator.cancel();
    setSpeaking(null);
    setBusy(false);
  }, []);

  const startListening = useCallback(() => {
    const Ctor = speechRecognitionCtor();
    if (!Ctor) return;
    unlockAudio();
    const rec = new Ctor();
    rec.lang = "en-US";
    rec.interimResults = true;
    rec.continuous = false;
    recognitionRef.current = rec;

    let finalText = "";
    rec.onresult = (event) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i];
        const transcript = result[0].transcript;
        if (result.isFinal) finalText += transcript;
        else interim += transcript;
      }
      setInput((finalText + interim).trim());
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => {
      setListening(false);
      recognitionRef.current = null;
      const q = finalText.trim();
      if (q) sendRef.current(q);
    };

    narrator.cancel();
    setSpeaking(null);
    setListening(true);
    try {
      rec.start();
    } catch {
      setListening(false);
    }
  }, [unlockAudio]);

  const toggleMic = useCallback(() => {
    if (listening) recognitionRef.current?.stop();
    else startListening();
  }, [listening, startListening]);

  if (!open) return null;

  const loadingModel = status === "loading";
  const pct = Math.round((progress.percent || 0) * 100);
  const placeholder = listening ? "Listening…" : "Ask anything about this slide";

  return createPortal(
    <div className="tutor-overlay" role="dialog" aria-modal="true" aria-label="Ask the tutor">
      <button className="tutor-scrim" aria-label="Close tutor" onClick={onClose} />
      <div className="tutor-panel">
        <header className="tutor-head">
          <div className="tutor-head-title">
            <Icon name="sparkles" size={16} />
            <div>
              <strong>Tutor</strong>
              <span className="tutor-context">{atom.title}</span>
            </div>
          </div>
          <button className="ghost tiny tutor-close" onClick={onClose} aria-label="Close">
            <Icon name="x" size={16} />
          </button>
        </header>

        {!supported ? (
          <div className="tutor-body tutor-notice">
            <p>
              The tutor needs <strong>WebGPU</strong>, which this browser doesn't have
              yet.
            </p>
            <p className="dim">
              Try the latest Chrome or Edge on a computer, or a recent phone — it runs
              here for free, no account.
            </p>
          </div>
        ) : (
          <>
            <div className={`tutor-thread ${turns.length ? "" : "empty"}`} ref={scrollRef}>
              {turns.map((t, i) =>
                t.role === "user" ? (
                  <div key={i} className="tutor-msg user">
                    <div className="tutor-bubble">{t.content}</div>
                  </div>
                ) : (
                  <div key={i} className="tutor-msg assistant">
                    <div className="tutor-bubble">
                      {!t.content && busy ? (
                        <span className="tutor-typing">
                          <i />
                          <i />
                          <i />
                        </span>
                      ) : (
                        <Markdown source={t.content} language={atom.language} />
                      )}
                    </div>
                    {t.content ? (
                      <div className="tutor-msg-actions">
                        <button
                          className={`tutor-act ${speaking === i ? "on" : ""}`}
                          onClick={() => (speaking === i ? stopSpeaking() : speak(t.content, i))}
                          title={speaking === i ? "Stop" : "Play this answer"}
                        >
                          <Icon name={speaking === i ? "pause" : "volume"} size={14} />
                        </button>
                      </div>
                    ) : null}
                  </div>
                ),
              )}

              {loadingModel ? (
                <div className="tutor-loading">
                  <div className="tutor-progress">
                    <span style={{ width: `${pct}%` }} />
                  </div>
                  <span className="dim">
                    Setting up the tutor… {pct}%
                    {progress.text ? ` · ${progress.text.replace(/\[.*?\]\s*/, "")}` : ""}
                  </span>
                </div>
              ) : null}

              {failed ? (
                <div className="tutor-error">
                  {failed}{" "}
                  <button className="linky" onClick={() => setFailed(null)}>
                    dismiss
                  </button>
                </div>
              ) : null}
            </div>

            <form
              className="composer"
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
            >
              <textarea
                ref={taRef}
                rows={1}
                value={input}
                placeholder={placeholder}
                onChange={(e) => {
                  setInput(e.target.value);
                  autosize();
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send(input);
                  }
                }}
              />
              <div className="composer-row">
                <div className="model-picker">
                  <button
                    type="button"
                    className={`tool-btn model-trigger ${tier !== "auto" ? "active" : ""}`}
                    onClick={() => setShowModels((s) => !s)}
                    aria-label="Choose answer quality"
                  >
                    <Icon name="route" size={14} />
                    <span className="picker-name">{currentTier.label}</span>
                    <Icon name="chevronDown" size={13} className="chev" />
                  </button>
                  {showModels ? (
                    <>
                      <button
                        className="model-menu-backdrop"
                        aria-label="Close model menu"
                        onClick={() => setShowModels(false)}
                      />
                      <div className="menu simple-model-menu">
                        <div className="simple-menu-title">Answer quality</div>
                        {TIERS.map((t) => (
                          <button
                            key={t.id}
                            className={`simple-model-row ${tier === t.id ? "selected" : ""}`}
                            onClick={() => {
                              update("watch", { tutorTier: t.id });
                              setShowModels(false);
                            }}
                          >
                            <span className="simple-model-copy">
                              <strong>{t.label}</strong>
                              <small>{t.desc}</small>
                            </span>
                            {tier === t.id ? <Icon name="check" size={15} /> : null}
                          </button>
                        ))}
                      </div>
                    </>
                  ) : null}
                </div>

                <div className="spacer" />

                <button
                  type="button"
                  className={`round-btn ${speakOn ? "" : "muted"}`}
                  onClick={() => {
                    if (speakOn) narrator.cancel();
                    setSpeakOn((v) => !v);
                  }}
                  aria-pressed={speakOn}
                  title={speakOn ? "Answers are spoken aloud" : "Answers are silent"}
                >
                  <Icon name={speakOn ? "volume" : "volumeOff"} size={16} />
                </button>

                {micSupported ? (
                  <button
                    type="button"
                    className={`round-btn ${listening ? "rec" : ""}`}
                    onClick={toggleMic}
                    aria-pressed={listening}
                    title={listening ? "Stop listening" : "Ask by voice"}
                  >
                    <Icon name="mic" size={16} />
                  </button>
                ) : null}

                {busy ? (
                  <button type="button" className="send stop" onClick={stop} aria-label="Stop">
                    <Icon name="pause" size={15} />
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="send"
                    disabled={!input.trim()}
                    aria-label="Send"
                  >
                    <Icon name="arrowUp" size={16} />
                  </button>
                )}
              </div>
            </form>
          </>
        )}
      </div>
    </div>,
    document.body,
  );
}

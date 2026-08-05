import {
  useCallback,
  useEffect,
  useMemo,
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
import { useSettings } from "../settings";
import Icon from "./Icon";
import Markdown from "./Markdown";

/**
 * The in-lesson tutor.
 *
 * Opens over the player, already knowing which slide the learner is on — that
 * grounding is what makes it feel part of the lecture rather than a chatbot
 * bolted on. You can type or talk to it; answers stream in as rendered
 * Markdown and are read aloud in the lecture's own voice.
 *
 * Everything runs on the learner's device (see `../engine/tutor`): free, and
 * the conversation never leaves the browser.
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

/** Strip the markdown the caption carries so the model reads clean prose. */
function plain(text: string): string {
  return text
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/[`*_]/g, "")
    .trim();
}

/** The system message that anchors the tutor to the current slide. */
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

const SUGGESTIONS = [
  "Explain this more simply",
  "Why does this matter?",
  "Give me another example",
];

const TIERS: { id: TutorTier; label: string; hint: string }[] = [
  { id: "auto", label: "Auto", hint: "Pick the best model for this device" },
  { id: "fast", label: "Fast", hint: "Smaller model — quicker, lighter download" },
  { id: "smart", label: "Smart", hint: "Larger model — better answers, bigger download" },
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
  const [speakOn, setSpeakOn] = useState(!settings.watch.muted);
  const [speaking, setSpeaking] = useState<number | null>(null);
  const [listening, setListening] = useState(false);
  const [failed, setFailed] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);
  const recognitionRef = useRef<SpeechRec | null>(null);
  const sendRef = useRef<(q: string) => void>(() => {});

  const supported = tutor.isSupported();
  const micSupported = useMemo(() => Boolean(speechRecognitionCtor()), []);

  // Keep the engine's requested model size in sync with the saved preference.
  useEffect(() => {
    tutor.setTier(settings.watch.tutorTier);
  }, [settings.watch.tutorTier]);

  // Resolve a system voice once, matching the lecture's choice, for spoken answers.
  useEffect(() => {
    narrator.loadVoices().then((all) => {
      voiceRef.current =
        all.find((v) => v.voiceURI === settings.watch.voiceURI) ??
        narrator.pickVoice(all);
    });
  }, [settings.watch.voiceURI]);

  // Keep the transcript pinned to the newest message as it streams.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [turns, busy]);

  // Focus the input on open; Escape closes; tear everything down on close.
  useEffect(() => {
    if (open) {
      const id = setTimeout(() => inputRef.current?.focus(), 120);
      const onKey = (e: KeyboardEvent) => {
        if (e.key === "Escape") onClose();
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
  }, [open, onClose]);

  const speak = useCallback(
    (text: string, index: number) => {
      narrator.cancel();
      setSpeaking(index);
      narrator.speak(text, {
        rate: settings.watch.rate,
        voice: voiceRef.current,
        engine: settings.watch.engine,
        neuralVoice: settings.watch.neuralVoice,
        onEnd: () => setSpeaking((cur) => (cur === index ? null : cur)),
      });
    },
    [settings.watch.rate, settings.watch.engine, settings.watch.neuralVoice],
  );

  const stopSpeaking = useCallback(() => {
    narrator.cancel();
    setSpeaking(null);
  }, []);

  const send = useCallback(
    async (question: string) => {
      const q = question.trim();
      if (!q || busy) return;
      setFailed(null);
      setInput("");
      narrator.cancel();
      setSpeaking(null);

      const history = [...turns, { role: "user", content: q } as Turn];
      const assistantIndex = history.length; // the empty bubble we append next
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
    [atom, scene, turns, busy, speakOn, speak],
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
      if (q) sendRef.current(q); // heard a full question — ask it
    };

    narrator.cancel(); // don't let the mic pick up the tutor's own voice
    setSpeaking(null);
    setListening(true);
    try {
      rec.start();
    } catch {
      setListening(false);
    }
  }, []);

  const toggleMic = useCallback(() => {
    if (listening) recognitionRef.current?.stop();
    else startListening();
  }, [listening, startListening]);

  if (!open) return null;

  const needsModel = status !== "ready";
  const loadingModel = status === "loading";
  const pct = Math.round((progress.percent || 0) * 100);

  return createPortal(
    <div className="tutor-overlay" role="dialog" aria-modal="true" aria-label="Ask the tutor">
      <button className="tutor-scrim" aria-label="Close tutor" onClick={onClose} />
      <div className="tutor-panel">
        <header className="tutor-head">
          <div className="tutor-head-title">
            <Icon name="sparkles" size={16} />
            <div>
              <strong>Ask about this</strong>
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
              The on-device tutor needs <strong>WebGPU</strong>, which this browser
              doesn't have yet.
            </p>
            <p className="dim">
              Try the latest Chrome or Edge on a computer, or a recent phone, and it
              will run here for free — no account, no sign-in.
            </p>
          </div>
        ) : (
          <>
            <div className="tutor-body" ref={scrollRef}>
              {turns.length === 0 && !loadingModel ? (
                <div className="tutor-intro">
                  <p>Stuck on this slide? Ask anything — I can see what's on screen.</p>
                  <p className="dim tutor-privacy">
                    Runs entirely on your device. The first question downloads a
                    small model once, then it's instant and private.
                  </p>

                  <div className="tutor-tier">
                    <span className="tutor-tier-label">Answer quality</span>
                    <div className="tutor-seg" role="group" aria-label="Answer quality">
                      {TIERS.map((t) => (
                        <button
                          key={t.id}
                          className={tier === t.id ? "on" : ""}
                          title={t.hint}
                          onClick={() => update("watch", { tutorTier: t.id })}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="tutor-suggestions">
                    {SUGGESTIONS.map((s) => (
                      <button key={s} className="tutor-chip" onClick={() => send(s)}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              {turns.map((t, i) => (
                <div key={i} className={`tutor-row ${t.role}`}>
                  <div className={`tutor-msg ${t.role} ${speaking === i ? "speaking" : ""}`}>
                    {t.role === "assistant" ? (
                      !t.content && busy ? (
                        <span className="tutor-typing">
                          <i />
                          <i />
                          <i />
                        </span>
                      ) : (
                        <Markdown source={t.content} language={atom.language} />
                      )
                    ) : (
                      t.content
                    )}
                  </div>
                  {t.role === "assistant" && t.content ? (
                    <button
                      className={`tutor-replay ${speaking === i ? "on" : ""}`}
                      onClick={() => (speaking === i ? stopSpeaking() : speak(t.content, i))}
                      title={speaking === i ? "Stop" : "Play this answer"}
                    >
                      <Icon name={speaking === i ? "pause" : "volume"} size={13} />
                      {speaking === i ? "Speaking" : "Play"}
                    </button>
                  ) : null}
                </div>
              ))}

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
              className="tutor-input"
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
            >
              <textarea
                ref={inputRef}
                rows={1}
                value={input}
                placeholder={
                  listening
                    ? "Listening…"
                    : needsModel
                      ? "Ask a question to start the tutor…"
                      : "Ask a question…"
                }
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send(input);
                  }
                }}
              />
              <div className="tutor-input-actions">
                {micSupported ? (
                  <button
                    type="button"
                    className={`ghost tiny tutor-mic ${listening ? "on" : ""}`}
                    onClick={toggleMic}
                    aria-pressed={listening}
                    title={listening ? "Stop listening" : "Ask by voice"}
                  >
                    <Icon name="mic" size={15} />
                  </button>
                ) : null}
                <button
                  type="button"
                  className={`ghost tiny tutor-speak ${speakOn ? "on" : ""}`}
                  onClick={() => {
                    if (speakOn) narrator.cancel();
                    setSpeakOn((v) => !v);
                  }}
                  aria-pressed={speakOn}
                  title={speakOn ? "Answers are spoken aloud" : "Answers are silent"}
                >
                  <Icon name={speakOn ? "volume" : "volumeOff"} size={15} />
                </button>
                {busy ? (
                  <button type="button" className="ghost tiny tutor-stop" onClick={stop}>
                    Stop
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="primary tiny tutor-send"
                    disabled={!input.trim()}
                    aria-label="Send"
                  >
                    <Icon name="arrowRight" size={15} />
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

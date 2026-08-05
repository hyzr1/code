import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import type { Atom } from "../types";
import type { Scene } from "../engine/scenes";
import * as tutor from "../engine/tutor";
import * as narrator from "../engine/narrator";
import { useSettings } from "../settings";
import Icon from "./Icon";

/**
 * The in-lesson tutor.
 *
 * Opens over the player, already knowing exactly which slide the learner is on
 * — that grounding is what makes it feel part of the lecture rather than a
 * generic chatbot bolted on. Answers stream in as text and are read aloud in
 * the same voice as the narration, so it genuinely talks back.
 *
 * Everything runs on the learner's device (see `../engine/tutor`): free, and
 * the conversation never leaves the browser.
 */

interface Turn {
  role: "user" | "assistant";
  content: string;
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
  const { settings } = useSettings();
  const status = useSyncExternalStore(tutor.subscribe, tutor.getStatus);
  const progress = useSyncExternalStore(tutor.subscribe, tutor.getProgress);

  const [turns, setTurns] = useState<Turn[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [speakOn, setSpeakOn] = useState(!settings.watch.muted);
  const [failed, setFailed] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);

  const supported = tutor.isSupported();

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

  // Focus the input when the panel opens; stop any speech when it closes.
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
  }, [open, onClose]);

  const speak = useCallback(
    (text: string) => {
      if (!speakOn) return;
      narrator.speak(text, {
        rate: settings.watch.rate,
        voice: voiceRef.current,
        engine: settings.watch.engine,
        neuralVoice: settings.watch.neuralVoice,
      });
    },
    [speakOn, settings.watch.rate, settings.watch.engine, settings.watch.neuralVoice],
  );

  const send = useCallback(
    async (question: string) => {
      const q = question.trim();
      if (!q || busy) return;
      setFailed(null);
      setInput("");
      narrator.cancel();

      const history = [...turns, { role: "user", content: q } as Turn];
      setTurns([...history, { role: "assistant", content: "" }]);
      setBusy(true);

      const controller = new AbortController();
      abortRef.current = controller;

      // A small window of recent turns keeps the grounded context inside the
      // model's budget while still remembering the last few exchanges.
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
        if (!controller.signal.aborted && answer.trim()) speak(answer);
      } catch (cause) {
        const message =
          cause instanceof Error ? cause.message : "Something went wrong.";
        setFailed(message);
        // Drop the empty assistant bubble the failed turn left behind.
        setTurns((prev) => prev.filter((t, i) => !(i === prev.length - 1 && !t.content)));
      } finally {
        setBusy(false);
        abortRef.current = null;
      }
    },
    [atom, scene, turns, busy, speak],
  );

  const stop = useCallback(() => {
    abortRef.current?.abort();
    narrator.cancel();
    setBusy(false);
  }, []);

  if (!open) return null;

  const needsModel = status !== "ready";
  const loadingModel = status === "loading";
  const pct = Math.round((progress.percent || 0) * 100);

  // Portalled to <body> so the fixed overlay escapes the route-transition
  // transform on an ancestor (a transformed ancestor traps position: fixed,
  // which would otherwise pin the panel inside the page column instead of the
  // viewport).
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
                  <p>
                    Stuck on this slide? Ask anything — I can see what's on screen.
                  </p>
                  <p className="dim tutor-privacy">
                    Runs entirely on your device. The first question downloads a
                    small model once, then it's instant and private.
                  </p>
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
                <div key={i} className={`tutor-msg ${t.role}`}>
                  {t.role === "assistant" && !t.content && busy ? (
                    <span className="tutor-typing">
                      <i />
                      <i />
                      <i />
                    </span>
                  ) : (
                    t.content
                  )}
                </div>
              ))}

              {loadingModel ? (
                <div className="tutor-loading">
                  <div className="tutor-progress">
                    <span style={{ width: `${pct}%` }} />
                  </div>
                  <span className="dim">
                    Setting up the tutor… {pct}%{progress.text ? ` · ${progress.text.replace(/\[.*?\]\s*/, "")}` : ""}
                  </span>
                </div>
              ) : null}

              {failed ? (
                <div className="tutor-error">
                  {failed}
                  {" "}
                  <button className="linky" onClick={() => setFailed(null)}>dismiss</button>
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
                placeholder={needsModel ? "Ask a question to start the tutor…" : "Ask a question…"}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send(input);
                  }
                }}
              />
              <div className="tutor-input-actions">
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
                  <button type="submit" className="primary tiny tutor-send" disabled={!input.trim()}>
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

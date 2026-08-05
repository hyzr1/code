import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import type { Atom } from "../types";
import type { Scene, FocusStep } from "../engine/scenes";
import { focusedLinesAt, focusStepsFor } from "../engine/scenes";
import * as tutor from "../engine/tutor";
import type { TutorTier } from "../engine/tutor";
import * as narrator from "../engine/narrator";
import * as neural from "../engine/neural";
import { useSettings } from "../settings";
import Icon from "./Icon";
import Markdown from "./Markdown";
import CodeStage from "./CodeStage";

/**
 * The tutor, engraved into the lecture.
 *
 * Instead of a popup, this takes over the lecture stage itself: your question
 * becomes an adaptive slide in the exact same frame — course type, real code
 * panel with the highlight following the af_heart narration — and "Resume
 * lecture" slides you back to where you were. Answers come from Groq (Cloud) or
 * an on-device model; see `../engine/tutor`.
 */

interface Slide {
  q: string;
  a: string;
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
    `Answer directly and simply, as if they are new to programming.`,
    `Structure the answer like a short lesson slide: 1-2 sentences of plain-English explanation, then — when it helps — ONE short fenced code block (\`\`\`python) with a tiny concrete example (a handful of lines).`,
    `After the code, add one or two sentences that walk through what the key lines do in order, the way a lecture explains code line by line (for example: "the first line creates the dictionary, and the next line adds a new key"). Keep it brief.`,
    `Put the teaching in the prose, not in code comments. Never paste long code. If they drift off-topic, gently bring them back to the lesson.`,
    ``,
    `Accuracy matters more than sounding confident. Only state Python facts you are sure are correct.`,
    `If you are unsure, say "I'm not certain" instead of guessing — never invent syntax rules or make up behavior.`,
    `Do not confuse similar things (lists vs sets, [] vs {}, tuples vs lists); if a detail is subtle, keep it simple and correct.`,
  ].join("\n");
}

/** Split an answer into prose and code blocks (tolerates a streaming, unclosed final block). */
type Block = { type: "text" | "code"; value: string };
function splitBlocks(content: string): Block[] {
  const blocks: Block[] = [];
  let mode: Block["type"] = "text";
  let buf: string[] = [];
  const flush = () => {
    if (buf.length && buf.join("\n").trim()) blocks.push({ type: mode, value: buf.join("\n") });
    buf = [];
  };
  for (const line of content.split("\n")) {
    if (line.trim().startsWith("```")) {
      flush();
      mode = mode === "text" ? "code" : "text";
      continue;
    }
    buf.push(line);
  }
  flush();
  return blocks;
}

const focusStepsCache = new Map<string, FocusStep[] | undefined>();
function focusStepsCached(prose: string, code: string): FocusStep[] | undefined {
  const key = `${prose} ${code}`;
  if (!focusStepsCache.has(key)) focusStepsCache.set(key, focusStepsFor(prose, code));
  return focusStepsCache.get(key);
}

/**
 * The clean spoken text of an answer: prose only (no code blocks), and with
 * Markdown stripped so the voice never reads "star star" / "times" for `**`, or
 * backticks and bullet dashes aloud.
 */
function proseOf(content: string): string {
  return splitBlocks(content)
    .filter((b) => b.type === "text")
    .map((b) => b.value)
    .join(" ")
    .replace(/^#{1,6}\s*/gm, "") // headings
    .replace(/^\s*[-*+]\s+/gm, "") // bullet markers
    .replace(/^\s*\d+\.\s+/gm, "") // numbered list markers
    .replace(/`([^`]+)`/g, "$1") // inline code
    .replace(/\*\*([^*]+)\*\*/g, "$1") // bold
    .replace(/\*([^*]+)\*/g, "$1") // italic
    .replace(/[*_`#>]/g, " ") // any stray markdown symbols
    .replace(/\s+/g, " ")
    .trim();
}

const STARTERS = [
  "Explain this slide simply",
  "Give me another example",
  "Why does this matter?",
];

const TIERS: { id: TutorTier; label: string; desc: string }[] = [
  { id: "cloud", label: "Cloud", desc: "Best & instant — works on any device" },
  { id: "auto", label: "Auto", desc: "On-device, balanced (3B coder)" },
  { id: "fast", label: "Fast", desc: "On-device, lighter (1.5B)" },
  { id: "smart", label: "Smart", desc: "On-device 7B — desktop, good GPU" },
];

export default function AskTutor({
  atom,
  scene,
  onResume,
  closing = false,
}: {
  atom: Atom;
  scene: Scene;
  onResume: () => void;
  closing?: boolean;
}) {
  const { settings, update } = useSettings();
  const status = useSyncExternalStore(tutor.subscribe, tutor.getStatus);
  const progress = useSyncExternalStore(tutor.subscribe, tutor.getProgress);
  const tier = useSyncExternalStore(tutor.subscribe, tutor.getTier);
  const voiceStatus = useSyncExternalStore(neural.subscribe, neural.getStatus);
  const voiceProgress = useSyncExternalStore(neural.subscribe, neural.getProgress);

  const [slides, setSlides] = useState<Slide[]>([]);
  const [view, setView] = useState(0);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [speakOn, setSpeakOn] = useState(true);
  const [speaking, setSpeaking] = useState(false);
  const [speakProgress, setSpeakProgress] = useState(0);
  const [listening, setListening] = useState(false);
  const [showModels, setShowModels] = useState(false);
  const [failed, setFailed] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const taRef = useRef<HTMLTextAreaElement | null>(null);
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);
  const recognitionRef = useRef<SpeechRec | null>(null);
  const sendRef = useRef<(q: string) => void>(() => {});
  const activeRef = useRef(true);
  const speakTokenRef = useRef(0);

  const supported = tutor.isSupported();
  const micSupported = Boolean(speechRecognitionCtor());
  const currentTier = TIERS.find((t) => t.id === tier) ?? TIERS[0];
  const current = slides[view];

  useEffect(() => {
    tutor.setTier(settings.watch.tutorTier);
  }, [settings.watch.tutorTier]);

  useEffect(() => {
    narrator.loadVoices().then((all) => {
      voiceRef.current =
        all.find((v) => v.voiceURI === settings.watch.voiceURI) ?? narrator.pickVoice(all);
    });
  }, [settings.watch.voiceURI]);

  const autosize = useCallback(() => {
    const el = taRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, []);

  // Mounted means active. Focus the input, wire Escape, and tear everything
  // down (stop narration, generation, mic) when the lecture resumes.
  useEffect(() => {
    const id = setTimeout(() => taRef.current?.focus(), 160);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (showModels) setShowModels(false);
        else onResume();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(id);
      window.removeEventListener("keydown", onKey);
    };
  }, [showModels, onResume]);

  useEffect(() => {
    activeRef.current = true;
    return () => {
      activeRef.current = false;
      narrator.cancel();
      abortRef.current?.abort();
      recognitionRef.current?.stop();
    };
  }, []);

  // Auto-fetch the af_heart voice in the background the moment the tutor opens,
  // so answers speak in the lecture voice. Idempotent — safe to call once.
  useEffect(() => {
    if (settings.watch.engine === "natural" && neural.getStatus() === "idle") {
      void neural.load().catch(() => undefined);
    }
  }, [settings.watch.engine]);

  const unlockAudio = useCallback(() => {
    try {
      void neural.audioContext().resume();
    } catch {
      // Not needed for the system-voice path.
    }
  }, []);

  const speak = useCallback(
    async (text: string) => {
      if (!text.trim()) return;
      narrator.cancel();
      const token = ++speakTokenRef.current;
      setSpeaking(true);
      setSpeakProgress(0);
      // The tutor talks in the lecture's af_heart voice. If its model isn't
      // downloaded yet, fetch it in the background (a "loading voice" note
      // shows meanwhile) and then narrate — no robotic system voice once it's
      // available. Only drop to the system voice if the download itself fails.
      if (settings.watch.engine === "natural" && neural.getStatus() !== "ready") {
        try {
          await neural.load();
        } catch {
          // fall through to the system voice below
        }
        if (!activeRef.current || token !== speakTokenRef.current) return;
      }
      const { rate, neuralVoice } = settings.watch;
      const engine =
        settings.watch.engine === "natural" && neural.getStatus() === "ready"
          ? "natural"
          : "system";

      // Stream sentence by sentence so the first line plays after synthesizing
      // just *one* sentence — not the whole answer. Kokoro on WASM is slow
      // (~0.3-0.6x realtime), so waiting for the full passage is the ~15s lag;
      // this cuts time-to-first-audio to a single sentence and prefetches the
      // next while the current one plays.
      const sentences =
        text.match(/[^.!?]+[.!?]+(?:\s|$)|[^.!?]+$/g)?.map((s) => s.trim()).filter(Boolean) ??
        [text];
      const lengths = sentences.map((s) => s.length);
      const total = Math.max(1, lengths.reduce((a, b) => a + b, 0));
      let doneChars = 0;

      const speakSentence = (i: number) => {
        if (token !== speakTokenRef.current || !activeRef.current) return;
        if (i >= sentences.length) {
          setSpeaking(false);
          return;
        }
        // Warm the next sentence's audio so it starts the instant this one ends.
        if (engine === "natural" && sentences[i + 1]) {
          neural.prefetch(narrator.forSpeech(sentences[i + 1]), neuralVoice, rate, 1);
        }
        const base = doneChars;
        narrator.speak(sentences[i], {
          rate,
          voice: voiceRef.current,
          engine,
          neuralVoice,
          onProgress: (value) =>
            setSpeakProgress(Math.min(0.999, (base + value * lengths[i]) / total)),
          onEnd: () => {
            doneChars += lengths[i];
            speakSentence(i + 1);
          },
        });
      };
      speakSentence(0);
    },
    [settings.watch.engine, settings.watch.rate, settings.watch.neuralVoice],
  );

  const stopSpeaking = useCallback(() => {
    speakTokenRef.current += 1;
    narrator.cancel();
    setSpeaking(false);
  }, []);

  const send = useCallback(
    async (question: string) => {
      const q = question.trim();
      if (!q || busy) return;
      unlockAudio();
      setFailed(null);
      setInput("");
      if (taRef.current) taRef.current.style.height = "auto";
      speakTokenRef.current += 1;
      narrator.cancel();
      setSpeaking(false);

      const idx = slides.length;
      setSlides((prev) => [...prev, { q, a: "" }]);
      setView(idx);
      setBusy(true);

      const controller = new AbortController();
      abortRef.current = controller;

      const messages = [
        { role: "system" as const, content: groundingPrompt(atom, scene) },
        ...slides.slice(-3).flatMap((s) => [
          { role: "user" as const, content: s.q },
          { role: "assistant" as const, content: s.a },
        ]),
        { role: "user" as const, content: q },
      ];

      try {
        const answerFn = tutor.isCloud(tier) ? tutor.cloudAsk : tutor.ask;
        const answer = await answerFn(messages, {
          signal: controller.signal,
          onToken: (fullSoFar) =>
            setSlides((prev) => {
              const copy = prev.slice();
              if (copy[idx]) copy[idx] = { ...copy[idx], a: fullSoFar };
              return copy;
            }),
        });
        if (!controller.signal.aborted && speakOn) {
          void speak(proseOf(answer));
        }
      } catch (cause) {
        setFailed(cause instanceof Error ? cause.message : "Something went wrong.");
        setSlides((prev) => prev.filter((s, i) => !(i === idx && !s.a)));
        setView((v) => Math.max(0, Math.min(v, idx - 1)));
      } finally {
        setBusy(false);
        abortRef.current = null;
      }
    },
    [atom, scene, slides, busy, speakOn, speak, unlockAudio, tier],
  );
  sendRef.current = send;

  const stop = useCallback(() => {
    abortRef.current?.abort();
    speakTokenRef.current += 1;
    narrator.cancel();
    setSpeaking(false);
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
    setSpeaking(false);
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

  const loadingModel = status === "loading";
  const pct = Math.round((progress.percent || 0) * 100);
  const placeholder = listening
    ? "Listening…"
    : slides.length
      ? "Ask a follow-up…"
      : "Ask anything about this slide";
  const thinking = busy && current && !current.a;

  // ------------------------------------------------------------- the slide

  const slideBody = () => {
    if (!supported && !tutor.isCloud(tier)) {
      return (
        <div className="tutor-notice">
          <p>
            On-device answers need <strong>WebGPU</strong>, which this browser doesn't
            have yet.
          </p>
          <p className="dim">
            Switch the model to <strong>Cloud</strong> below to use it here anyway.
          </p>
        </div>
      );
    }
    if (!slides.length) {
      return (
        <div className="tutor-welcome">
          <div className="tutor-welcome-icon">
            <Icon name="cap" size={24} />
          </div>
          <p className="tutor-welcome-line">
            Confused about this slide? Ask anything — I'll answer right here, in the
            lesson.
          </p>
          <div className="tutor-starters">
            {STARTERS.map((s) => (
              <button key={s} type="button" onClick={() => send(s)}>
                {s}
              </button>
            ))}
          </div>
        </div>
      );
    }
    const prose = proseOf(current.a);
    return (
      <div className="tutor-slide" key={view}>
        <div className="tutor-q">
          <Icon name="cap" size={13} />
          <span>{current.q}</span>
        </div>
        {thinking ? (
          <div className="tutor-thinking">
            {loadingModel ? (
              <>
                <div className="tutor-progress">
                  <span style={{ width: `${pct}%` }} />
                </div>
                <span className="dim">
                  Setting up the tutor… {pct}%
                  {progress.text ? ` · ${progress.text.replace(/\[.*?\]\s*/, "")}` : ""}
                </span>
              </>
            ) : (
              <span className="tutor-typing">
                <i />
                <i />
                <i />
              </span>
            )}
          </div>
        ) : (
          <div className="tutor-a">
            {splitBlocks(current.a).map((b, j) =>
              b.type === "code" ? (
                <CodeStage
                  key={j}
                  code={b.value}
                  language={atom.language}
                  animate={false}
                  focusLines={
                    speaking
                      ? focusedLinesAt(
                          { code: b.value, focusSteps: focusStepsCached(prose, b.value) } as Scene,
                          speakProgress,
                        )
                      : []
                  }
                />
              ) : (
                <Markdown key={j} source={b.value} language={atom.language} />
              ),
            )}
          </div>
        )}
        {failed ? (
          <div className="tutor-error">
            {failed}{" "}
            <button className="linky" onClick={() => setFailed(null)}>
              dismiss
            </button>
          </div>
        ) : null}
      </div>
    );
  };

  return (
    <div className={`tutor-take ${closing ? "closing" : ""}`}>
      <div className="stage tutor-stage">
        <div className="stage-meta">
          <div className="stage-section">Tutor · {atom.title}</div>
          <div className="stage-focus tutor-adaptive">
            <Icon name="cap" size={12} /> Adaptive
          </div>
        </div>
        <div className="stage-body tutor-stage-body">{slideBody()}</div>
      </div>

      <div className="tutor-nav">
        <button
          className="ghost tiny"
          onClick={() => setView((v) => Math.max(0, v - 1))}
          disabled={view <= 0}
          aria-label="Previous answer"
        >
          <Icon name="prev" size={16} />
        </button>
        <span className="tutor-count">
          {slides.length ? `${view + 1} / ${slides.length}` : "New question"}
        </span>
        {settings.watch.engine === "natural" && voiceStatus === "loading" ? (
          <span className="tutor-voice-loading" aria-live="polite">
            <Icon name="volume" size={13} /> Loading voice…{" "}
            {Math.round((voiceProgress.percent || 0) * 100)}%
          </span>
        ) : null}
        {current?.a ? (
          <button
            className={`ghost tiny tutor-replay ${speaking ? "on" : ""}`}
            onClick={() => (speaking ? stopSpeaking() : void speak(proseOf(current.a)))}
            title={speaking ? "Stop" : "Play answer"}
          >
            <Icon name={speaking ? "pause" : "volume"} size={15} />
          </button>
        ) : null}
        <button
          className="ghost tiny"
          onClick={() => setView((v) => Math.min(slides.length - 1, v + 1))}
          disabled={view >= slides.length - 1}
          aria-label="Next answer"
        >
          <Icon name="next" size={16} />
        </button>
        <span className="spacer" />
        <button className="tutor-resume" onClick={onResume}>
          <Icon name="arrowLeft" size={15} />
          Resume lecture
        </button>
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

          <span className="spacer" />

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
            <button type="submit" className="send" disabled={!input.trim()} aria-label="Send">
              <Icon name="arrowUp" size={16} />
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

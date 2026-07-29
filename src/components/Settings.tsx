import { useEffect, useRef, useState, type ReactNode } from "react";
import type { Progress } from "../types";
import { ATOMS, COURSE_LESSONS, DRILLS, PROBLEMS } from "../content";
import {
  emptyProgress,
  exportProgress,
  importProgress,
} from "../engine/storage";
import * as narrator from "../engine/narrator";
import * as neural from "../engine/neural";
import { ACCENTS, useSettings, type AccentName } from "../settings";
import { useToast } from "./Toast";
import Icon, { type IconName } from "./Icon";
import { TRACKS } from "../content/tracks";

type SectionId =
  | "appearance"
  | "editor"
  | "learning"
  | "narration"
  | "scheduling"
  | "data"
  | "shortcuts"
  | "about";

const NATURAL_SAMPLE = "Natural voice ready.";

const GROUPS: {
  title: string;
  items: { id: SectionId; label: string; icon: IconName }[];
}[] = [
  {
    title: "Settings",
    items: [
      { id: "appearance", label: "Appearance", icon: "sun" },
      { id: "editor", label: "Editor", icon: "code" },
      { id: "learning", label: "Learning", icon: "target" },
      { id: "narration", label: "Narration", icon: "volume" },
      { id: "scheduling", label: "Scheduling", icon: "clock" },
    ],
  },
  {
    title: "Your data",
    items: [
      { id: "data", label: "Data & backup", icon: "database" },
      { id: "shortcuts", label: "Shortcuts", icon: "keyboard" },
      { id: "about", label: "About", icon: "info" },
    ],
  },
];

const TITLES: Record<SectionId, { title: string; sub: string }> = {
  appearance: {
    title: "Appearance",
    sub: "How the app looks. Changes apply immediately and persist on this device.",
  },
  editor: {
    title: "Editor",
    sub: "The code editor used for every exercise. Cold Mode overrides the assists below.",
  },
  learning: {
    title: "Learning",
    sub: "How hard the app makes you work, and how much it helps when you're stuck.",
  },
  narration: {
    title: "Narration",
    sub: "The narrated, animated version of each lecture.",
  },
  scheduling: {
    title: "Scheduling",
    sub: "How work is spaced and mixed. The defaults follow the evidence — change them if you know why.",
  },
  data: {
    title: "Data & backup",
    sub: "Everything is stored in this browser. Nothing is sent anywhere.",
  },
  shortcuts: { title: "Shortcuts", sub: "Every key the app listens for." },
  about: { title: "About", sub: "What's in the library, and what this is." },
};

// ------------------------------------------------------------ controls

/**
 * The natural voice: download state, and the choice of speaker.
 *
 * The download is deliberately a button rather than something that starts the
 * moment the toggle flips. It is a large download — nobody should discover that
 * after the fact, on a phone, on cellular.
 */
function NeuralVoice({
  voice,
  rate,
  onVoice,
}: {
  voice: string;
  rate: number;
  onVoice: (id: string) => void;
}) {
  const [, bump] = useState(0);
  const [device, setDevice] = useState<neural.Device | null>(null);

  useEffect(() => neural.subscribe(() => bump((n) => n + 1)), []);
  useEffect(() => {
    let active = true;
    void (async () => {
      const detected = await neural.detectDevice();
      if (!active) return;
      setDevice(detected);

      // CacheStorage is authoritative. The old install marker was only written
      // after slow model initialization, so closing the page at 100% made a fully
      // cached model look uninstalled on every visit.
      if (
        !neural.hasPackedVoice(voice) &&
        neural.getStatus() === "idle" &&
        (await neural.hasCachedWeights(detected))
      ) {
        void neural.load().catch(() => undefined);
      }
    })();
    return () => {
      active = false;
    };
  }, [voice]);

  const status = neural.getStatus();
  const progress = neural.getProgress();
  const size = device ? neural.weightsFor(device).megabytes : 93;
  const packedVoice = neural.hasPackedVoice(voice);
  const spokenSample = narrator.forSpeech(packedVoice ? "Closures" : NATURAL_SAMPLE);
  const sampleReady = neural.isCached(spokenSample, voice, rate);

  useEffect(() => {
    if ((packedVoice || status === "ready") && !sampleReady) {
      neural.prefetch(spokenSample, voice, rate);
    }
  }, [packedVoice, status, sampleReady, spokenSample, voice, rate]);

  return (
    <>
      {packedVoice ? (
        <p className="voice-note">
          Heart uses pre-rendered lecture audio. Slides start immediately,
          playback uses almost no CPU, and the live voice model stays off.
        </p>
      ) : device === "wasm" ? (
        <p className="voice-note">
          The compatibility voice runs in a background worker. Preparing a new
          line can take several seconds, but it no longer freezes the page.
          Lectures use the system voice whenever a natural line is not ready.
        </p>
      ) : null}

      <Field
        title="Voice model"
        help={
          packedVoice
            ? "Installed with Unwashed. Every lecture line is prepared ahead of time and works offline."
            : status === "ready"
            ? `Ready, running on the ${device === "webgpu" ? "GPU" : "processor"}. Cached by your browser — this was a one-time download.`
            : status === "loading"
              ? progress.phase === "initializing"
                ? `Starting the voice on the ${device === "webgpu" ? "GPU" : "processor"}… The ${size} MB model is already downloaded; this is local initialization, not another download.`
                : progress.phase === "checking"
                  ? "Checking the local voice cache…"
                  : `Downloading… ${progress.loadedMB.toFixed(0)} of ${progress.totalMB.toFixed(0)} MB. You can leave this page open and carry on.`
              : status === "failed"
                ? `Download failed: ${neural.getError()}`
                : `About ${size} MB, once. After that it runs offline and the system voice is never used again.`
        }
      >
        {packedVoice ? (
          <span className="badge">Voice pack</span>
        ) : status === "ready" ? (
          <span className="badge">Installed</span>
        ) : (
          <button
            className="small"
            disabled={status === "loading"}
            onClick={() => void neural.load().catch(() => undefined)}
          >
            {status === "loading"
              ? progress.phase === "initializing"
                ? "Starting…"
                : progress.phase === "checking"
                  ? "Checking…"
                  : `${Math.round(progress.percent * 100)}%`
              : status === "failed"
                ? "Try again"
                : `Download (${size} MB)`}
          </button>
        )}
      </Field>

      {!packedVoice && status === "loading" && progress.phase === "downloading" ? (
        <div className="dl-bar">
          <div style={{ width: `${Math.round(progress.percent * 100)}%` }} />
        </div>
      ) : null}

      <Field title="Speaker" help="All of them are the same model, so switching costs nothing.">
        <select value={voice} onChange={(e) => onVoice(e.target.value)} style={{ maxWidth: 240 }}>
          {(["American", "British"] as const).map((accent) => (
            <optgroup key={accent} label={accent}>
              {neural.VOICES.filter((v) => v.accent === accent).map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name} · {v.gender} · {v.grade}
                  {neural.hasPackedVoice(v.id) ? " · instant pack" : " · live"}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </Field>

      {packedVoice || status === "ready" ? (
        <Field title="Hear this speaker">
          <button
            className="small"
            disabled={!sampleReady}
            onClick={() =>
              narrator.speak(packedVoice ? "Closures" : NATURAL_SAMPLE, {
                rate,
                engine: "natural",
                neuralVoice: voice,
              })
            }
          >
            <Icon name="play" /> {sampleReady ? "Play sample" : "Preparing sample…"}
          </button>
        </Field>
      ) : null}
    </>
  );
}

function Field({
  title,
  help,
  children,
}: {
  title: string;
  help?: string;
  children: ReactNode;
}) {
  return (
    <div className="field">
      <div className="field-text">
        <div className="field-title">{title}</div>
        {help ? <div className="field-help">{help}</div> : null}
      </div>
      <div className="field-control">{children}</div>
    </div>
  );
}

function Toggle({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <button
      role="switch"
      aria-checked={value}
      className="switch"
      onClick={() => onChange(!value)}
    />
  );
}

function Segmented<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { id: T; label: string }[];
  onChange: (next: T) => void;
}) {
  return (
    <div className="segmented">
      {options.map((option) => (
        <button
          key={option.id}
          className={value === option.id ? "on" : ""}
          onClick={() => onChange(option.id)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function Slider({
  value,
  min,
  max,
  step,
  format,
  onChange,
}: {
  value: number;
  min: number;
  max: number;
  step: number;
  format: (n: number) => string;
  onChange: (next: number) => void;
}) {
  return (
    <>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <span
        className="tiny muted"
        style={{ minWidth: 46, textAlign: "right", fontVariantNumeric: "tabular-nums" }}
      >
        {format(value)}
      </span>
    </>
  );
}

function Stepper({
  value,
  min,
  max,
  step = 1,
  suffix,
  onChange,
}: {
  value: number;
  min: number;
  max: number;
  step?: number;
  suffix?: string;
  onChange: (next: number) => void;
}) {
  return (
    <div className="row" style={{ gap: 6 }}>
      <button
        className="tiny"
        onClick={() => onChange(Math.max(min, value - step))}
        disabled={value <= min}
      >
        −
      </button>
      <span
        className="small"
        style={{ minWidth: 58, textAlign: "center", fontVariantNumeric: "tabular-nums" }}
      >
        {value}
        {suffix ? ` ${suffix}` : ""}
      </span>
      <button
        className="tiny"
        onClick={() => onChange(Math.min(max, value + step))}
        disabled={value >= max}
      >
        +
      </button>
    </div>
  );
}

// -------------------------------------------------------------- page

export default function Settings({
  progress,
  onProgress,
  onClose,
  onReplayTour,
}: {
  progress: Progress;
  onProgress: (next: Progress) => void;
  onClose: () => void;
  onReplayTour: () => void;
}) {
  const { settings, update, resetGroup, resetAll } = useSettings();
  const [section, setSection] = useState<SectionId>("appearance");
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const { toast } = useToast();
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    narrator.loadVoices().then(setVoices);
  }, []);

  const { appearance, editor, learning, profile, watch, scheduler } = settings;

  const download = () => {
    const blob = new Blob([exportProgress(progress)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `forge-progress-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast("success", "Progress exported", `${progress.attempts.length} attempts saved to file`);
  };

  const upload = (file: File) => {
    file.text().then((text) => {
      const parsed = importProgress(text);
      if (!parsed) {
        toast(
          "error",
          "That file isn't an Unwashed export",
          "Expected the JSON produced by Export progress.",
        );
        return;
      }
      onProgress(parsed);
      toast("success", "Progress imported", `${parsed.attempts.length} attempts restored`);
    });
  };

  const storageBytes = new Blob([
    localStorage.getItem("forge.progress.v1") ?? "",
    localStorage.getItem("forge.settings.v1") ?? "",
  ]).size;

  return (
    <div className="overlay" onClick={onClose}>
      <div
        className="settings-dialog"
        role="dialog"
        aria-label="Settings"
        onClick={(e) => e.stopPropagation()}
      >
        <nav className="settings-rail">
          {GROUPS.map((group) => (
            <div key={group.title}>
              <div className="settings-group">{group.title}</div>
              {group.items.map((item) => (
                <button
                  key={item.id}
                  className={`nav ${section === item.id ? "active" : ""}`}
                  onClick={() => setSection(item.id)}
                >
                  <Icon name={item.icon} size={17} />
                  {item.label}
                </button>
              ))}
            </div>
          ))}
        </nav>

        <div className="settings-body">
          <button className="ghost icon settings-close" onClick={onClose} title="Close">
            <Icon name="x" size={18} />
          </button>

          <h2 className="pane-title">{TITLES[section].title}</h2>
          <p className="pane-sub">{TITLES[section].sub}</p>


          {/* ------------------------------------------- appearance */}
          {section === "appearance" ? (
            <>
              <div className="card">
                <h2 className="section">Theme</h2>
                <Field
                  title="Colour scheme"
                  help="System follows whatever your operating system is set to, and switches with it."
                >
                  <div className="icon-choice">
                    {(
                      [
                        ["system", "monitor"],
                        ["light", "sun"],
                        ["dark", "moon"],
                      ] as const
                    ).map(([id, icon]) => (
                      <button
                        key={id}
                        className={appearance.theme === id ? "on" : ""}
                        onClick={() => update("appearance", { theme: id })}
                        title={id}
                      >
                        <Icon name={icon} size={16} />
                      </button>
                    ))}
                  </div>
                </Field>

                <Field title="Accent colour" help="Used for highlights, progress and the active state.">
                  <div className="swatches">
                    {ACCENTS.map((accent) => (
                      <button
                        key={accent.id}
                        className={`swatch ${
                          appearance.accent === accent.id ? "on" : ""
                        }`}
                        style={{ background: accent.swatch }}
                        title={accent.label}
                        onClick={() =>
                          update("appearance", {
                            accent: accent.id as AccentName,
                          })
                        }
                      />
                    ))}
                  </div>
                </Field>
              </div>

              <div className="card">
                <h2 className="section">Typography &amp; layout</h2>
                <Field
                  title="Text size"
                  help="Scales the whole interface, not just body copy."
                >
                  <Slider
                    value={appearance.fontScale}
                    min={0.85}
                    max={1.3}
                    step={0.05}
                    format={(n) => `${Math.round(n * 100)}%`}
                    onChange={(fontScale) => update("appearance", { fontScale })}
                  />
                </Field>

                <Field
                  title="Reading font"
                  help="Serif for lecture prose. Some people read long passages noticeably faster in it."
                >
                  <Segmented
                    value={appearance.readingFont}
                    options={[
                      { id: "sans", label: "Sans" },
                      { id: "serif", label: "Serif" },
                    ]}
                    onChange={(readingFont) =>
                      update("appearance", { readingFont })
                    }
                  />
                </Field>

                <Field title="Density" help="Compact tightens vertical spacing throughout.">
                  <Segmented
                    value={appearance.density}
                    options={[
                      { id: "comfortable", label: "Comfortable" },
                      { id: "compact", label: "Compact" },
                    ]}
                    onChange={(density) => update("appearance", { density })}
                  />
                </Field>

                <Field
                  title="Reduce motion"
                  help="Turns off scene transitions and the line-by-line code reveal."
                >
                  <Toggle
                    value={appearance.reducedMotion}
                    onChange={(reducedMotion) =>
                      update("appearance", { reducedMotion })
                    }
                  />
                </Field>
              </div>

              <button className="ghost small" onClick={() => resetGroup("appearance")}>
                <Icon name="refresh" /> Reset appearance
              </button>
            </>
          ) : null}

          {/* ----------------------------------------------- editor */}
          {section === "editor" ? (
            <>
              <div className="card">
                <h2 className="section">Assists</h2>
                <Field
                  title="Autocomplete"
                  help="IntelliSense-style suggestions with signatures. Cold Mode turns this off regardless, because producing code you couldn't write from memory is the thing it's testing."
                >
                  <Toggle
                    value={editor.assists}
                    onChange={(assists) => update("editor", { assists })}
                  />
                </Field>
                <Field
                  title="Auto-close brackets"
                  help="Typing ( inserts the matching )."
                >
                  <Toggle
                    value={editor.closeBrackets}
                    onChange={(closeBrackets) =>
                      update("editor", { closeBrackets })
                    }
                  />
                </Field>
              </div>

              <div className="card">
                <h2 className="section">Appearance</h2>
                <Field title="Font size">
                  <Slider
                    value={editor.fontSize}
                    min={11}
                    max={18}
                    step={0.5}
                    format={(n) => `${n}px`}
                    onChange={(fontSize) => update("editor", { fontSize })}
                  />
                </Field>
                <Field title="Line numbers">
                  <Toggle
                    value={editor.lineNumbers}
                    onChange={(lineNumbers) => update("editor", { lineNumbers })}
                  />
                </Field>
                <Field title="Word wrap" help="Long lines fold instead of scrolling sideways.">
                  <Toggle
                    value={editor.wordWrap}
                    onChange={(wordWrap) => update("editor", { wordWrap })}
                  />
                </Field>
                <Field title="Highlight active line">
                  <Toggle
                    value={editor.highlightActiveLine}
                    onChange={(highlightActiveLine) =>
                      update("editor", { highlightActiveLine })
                    }
                  />
                </Field>
                <Field title="Indent size">
                  <Segmented
                    value={String(editor.tabSize) as "2" | "4"}
                    options={[
                      { id: "2", label: "2 spaces" },
                      { id: "4", label: "4 spaces" },
                    ]}
                    onChange={(size) =>
                      update("editor", { tabSize: Number(size) as 2 | 4 })
                    }
                  />
                </Field>
              </div>

              <div className="card">
                <h2 className="section">Keys</h2>
                <Field title="Run tests" help="Which chord runs the current exercise.">
                  <Segmented
                    value={editor.runShortcut}
                    options={[
                      { id: "ctrl-enter", label: "Ctrl+Enter" },
                      { id: "shift-enter", label: "Shift+Enter" },
                    ]}
                    onChange={(runShortcut) => update("editor", { runShortcut })}
                  />
                </Field>
              </div>

              <button className="ghost small" onClick={() => resetGroup("editor")}>
                <Icon name="refresh" /> Reset editor
              </button>
            </>
          ) : null}

          {/* --------------------------------------------- learning */}
          {section === "learning" ? (
            <>
              <div className="card">
                <h2 className="section">Your target</h2>
                <Field title="Preparing for" help={TRACKS[profile.track].description}>
                  <Segmented
                    value={profile.track}
                    options={Object.values(TRACKS).map((track) => ({
                      id: track.id,
                      label: track.shortLabel,
                    }))}
                    onChange={(track) => update("profile", { track })}
                  />
                </Field>
                <Field title="Career stage">
                  <Segmented
                    value={profile.stage}
                    options={[
                      { id: "internship", label: "Internship" },
                      { id: "new-grad", label: "New grad" },
                      { id: "experienced", label: "Experienced" },
                    ]}
                    onChange={(stage) => update("profile", { stage })}
                  />
                </Field>
                <Field title="Current level" help="This changes the initial scaffolding and how aggressively new material enters your queue.">
                  <Segmented
                    value={profile.experience}
                    options={[
                      { id: "restarting", label: "Restarting" },
                      { id: "beginner", label: "Beginner" },
                      { id: "intermediate", label: "Intermediate" },
                      { id: "advanced", label: "Advanced" },
                    ]}
                    onChange={(experience) => update("profile", { experience })}
                  />
                </Field>
                <Field title="Preferred languages" help="Your active course is one language; recommendations can respect every language you are willing to interview in.">
                  <div className="segmented">
                    {(["python", "javascript"] as const).map((language) => {
                      const on = profile.preferredLanguages.includes(language);
                      return (
                        <button
                          key={language}
                          className={on ? "on" : ""}
                          onClick={() => {
                            const next = on
                              ? profile.preferredLanguages.filter((item) => item !== language)
                              : [...profile.preferredLanguages, language];
                            if (next.length) update("profile", { preferredLanguages: next });
                          }}
                        >
                          {language === "python" ? "Python" : "JavaScript"}
                        </button>
                      );
                    })}
                  </div>
                </Field>
                <Field title="Study capacity">
                  <Stepper
                    value={profile.weeklyHours}
                    min={2}
                    max={40}
                    suffix="hrs/week"
                    onChange={(weeklyHours) => update("profile", { weeklyHours })}
                  />
                </Field>
                <Field title="Interview or application date" help="Optional. A near deadline shifts the scheduler toward retrieval and timed problems.">
                  <input
                    type="date"
                    value={profile.interviewDate}
                    onChange={(event) => update("profile", { interviewDate: event.target.value })}
                  />
                </Field>
              </div>

              <div className="card">
                <h2 className="section">Course language</h2>
                <Field
                  title="Active path"
                  help="Progress is stored separately by stable language-prefixed ids, so switching never erases either course."
                >
                  <Segmented
                    value={learning.language}
                    options={[
                      { id: "python", label: "Python" },
                      { id: "javascript", label: "JavaScript" },
                    ]}
                    onChange={(language) => update("learning", { language })}
                  />
                </Field>
              </div>

              <div className="card">
                <h2 className="section">Difficulty</h2>
                <Field
                  title="Cold Mode by default"
                  help="Start every exercise with no autocomplete, no bracket closing and no paste. Harder, and it's the condition the retrieval training actually needs."
                >
                  <Toggle
                    value={learning.coldByDefault}
                    onChange={(coldByDefault) =>
                      update("learning", { coldByDefault })
                    }
                  />
                </Field>
                <Field
                  title="Ask before you start"
                  help="The two-second 'can you solve this cold?' prediction. It trains calibration, which is the cheapest fix for the biggest time-waster in prep."
                >
                  <Toggle
                    value={learning.askCalibration}
                    onChange={(askCalibration) =>
                      update("learning", { askCalibration })
                    }
                  />
                </Field>
                <Field
                  title="Offer the solution after"
                  help="How many failed runs before a rep offers to show one way of writing it."
                >
                  <Stepper
                    value={learning.hintsAfterAttempts}
                    min={1}
                    max={6}
                    suffix="tries"
                    onChange={(hintsAfterAttempts) =>
                      update("learning", { hintsAfterAttempts })
                    }
                  />
                </Field>
                <Field
                  title="Show reference solution"
                  help="After you pass, show how it's usually written. Turn off if you'd rather not be anchored."
                >
                  <Toggle
                    value={learning.showReferenceSolution}
                    onChange={(showReferenceSolution) =>
                      update("learning", { showReferenceSolution })
                    }
                  />
                </Field>
              </div>

              <div className="card">
                <h2 className="section">Pace</h2>
                <Field
                  title="Daily target"
                  help="Shown on the dashboard. Fifty minutes is the protocol's recommendation — sustainable beats ambitious."
                >
                  <Stepper
                    value={learning.dailyMinutes}
                    min={10}
                    max={180}
                    step={5}
                    suffix="min"
                    onChange={(dailyMinutes) =>
                      update("learning", { dailyMinutes })
                    }
                  />
                </Field>
                <Field
                  title="Auto-advance reps"
                  help="Move to the next rep on its own once the tests go green."
                >
                  <Toggle
                    value={learning.autoAdvanceReps}
                    onChange={(autoAdvanceReps) =>
                      update("learning", { autoAdvanceReps })
                    }
                  />
                </Field>
              </div>

              <button className="ghost small" onClick={() => resetGroup("learning")}>
                <Icon name="refresh" /> Reset learning
              </button>
              <button className="ghost small" onClick={() => resetGroup("profile")} style={{ marginLeft: 8 }}>
                <Icon name="refresh" /> Reset preparation profile
              </button>
            </>
          ) : null}

          {/* -------------------------------------------- narration */}
          {section === "narration" ? (
            <>
              <div className="card">
                <h2 className="section">Lectures</h2>
                <Field
                  title="Open lectures in"
                  help="Watch is a narrated, animated version of the same lesson. Read is the full text."
                >
                  <Segmented
                    value={watch.defaultMode}
                    options={[
                      { id: "watch", label: "Watch" },
                      { id: "read", label: "Read" },
                    ]}
                    onChange={(defaultMode) => update("watch", { defaultMode })}
                  />
                </Field>
                <Field title="Start playing automatically">
                  <Toggle
                    value={watch.autoplay}
                    onChange={(autoplay) => update("watch", { autoplay })}
                  />
                </Field>
                <Field
                  title="Silent mode"
                  help="Keeps the animation and captions, drops the voice."
                >
                  <Toggle
                    value={watch.muted}
                    onChange={(muted) => update("watch", { muted })}
                  />
                </Field>
                <Field
                  title="Animate code"
                  help="Reveal code one line at a time as it's introduced."
                >
                  <Toggle
                    value={watch.animateCode}
                    onChange={(animateCode) => update("watch", { animateCode })}
                  />
                </Field>
              </div>

              <div className="card">
                <h2 className="section">Voice</h2>

                <Field
                  title="Synthesiser"
                  help={
                    watch.engine === "natural"
                      ? "Kokoro runs on your machine. One download, then it works offline forever — no account, no cost, nothing sent anywhere."
                      : "The voices built into your operating system. Instant, and on most machines, robotic."
                  }
                >
                  <div className="segmented">
                    <button
                      className={watch.engine === "system" ? "on" : ""}
                      onClick={() => update("watch", { engine: "system" })}
                    >
                      System
                    </button>
                    <button
                      className={watch.engine === "natural" ? "on" : ""}
                      onClick={() => update("watch", { engine: "natural" })}
                    >
                      Natural
                    </button>
                  </div>
                </Field>

                {watch.engine === "natural" ? (
                  <NeuralVoice
                    voice={watch.neuralVoice}
                    rate={watch.rate}
                    onVoice={(neuralVoice) => update("watch", { neuralVoice })}
                  />
                ) : null}

                {watch.engine === "system" && narrator.onlyLegacyVoices(voices) ? (
                  <p className="voice-note">
                    Your system only has the older formant voices, which is why
                    narration sounds robotic — nothing in this app can fix that
                    from the outside. Windows: <strong>Settings → Time &amp;
                    Language → Speech → Add voices</strong>, and pick one marked{" "}
                    <strong>Natural</strong>. macOS: <strong>System Settings →
                    Accessibility → Spoken Content → System Voice → Manage</strong>,
                    then choose an Enhanced or Premium voice. They appear in the
                    list below after a restart.
                  </p>
                ) : null}
                {watch.engine === "system" ? (
                  <Field
                    title="Voice"
                    help={
                      voices.length
                        ? `${voices.length} available from your operating system.`
                        : "Loading the voices your system provides…"
                    }
                  >
                    <select
                      value={watch.voiceURI ?? ""}
                      onChange={(e) =>
                        update("watch", { voiceURI: e.target.value || null })
                      }
                      style={{ maxWidth: 240 }}
                    >
                      <option value="">Automatic (best available)</option>
                      {voices
                        .filter((v) => v.lang.startsWith("en"))
                        .map((v) => (
                          <option key={v.voiceURI} value={v.voiceURI}>
                            {v.name}
                          </option>
                        ))}
                    </select>
                  </Field>
                ) : null}
                <Field title="Speed">
                  <Slider
                    value={watch.rate}
                    min={0.7}
                    max={2}
                    step={0.05}
                    format={(n) => `${n.toFixed(2)}×`}
                    onChange={(rate) => update("watch", { rate })}
                  />
                </Field>
                <Field
                  title="Pause length"
                  help="How long a scene stays up after the narration stops. Raise it if slides move on before you've read the code."
                >
                  <Slider
                    value={watch.holdScale}
                    min={0.5}
                    max={2.5}
                    step={0.1}
                    format={(n) => `${n.toFixed(1)}×`}
                    onChange={(holdScale) => update("watch", { holdScale })}
                  />
                </Field>
                <Field title="Test the voice">
                  <button
                    className="small"
                    onClick={() =>
                      narrator.speak(
                        "Every function remembers where it was born. That's the whole idea.",
                        {
                          rate: watch.rate,
                          engine: watch.engine,
                          neuralVoice: watch.neuralVoice,
                          voice:
                            voices.find((v) => v.voiceURI === watch.voiceURI) ??
                            narrator.pickVoice(voices),
                        },
                      )
                    }
                  >
                    <Icon name="play" /> Play sample
                  </button>
                </Field>
              </div>

              <button className="ghost small" onClick={() => resetGroup("watch")}>
                <Icon name="refresh" /> Reset narration
              </button>
            </>
          ) : null}

          {/* ------------------------------------------- scheduling */}
          {section === "scheduling" ? (
            <>
              <div className="card">
                <h2 className="section">Spaced repetition</h2>
                <Field
                  title="Interleave topics"
                  help="Never serve two exercises from the same topic back to back. Practice feels worse and recall tests better — it's the single most under-used finding in this space."
                >
                  <Toggle
                    value={scheduler.interleave}
                    onChange={(interleave) => update("scheduler", { interleave })}
                  />
                </Field>
                <Field
                  title="New concepts per day"
                  help="Caps how much unseen material enters the rotation."
                >
                  <Stepper
                    value={scheduler.newPerDay}
                    min={2}
                    max={40}
                    step={2}
                    onChange={(newPerDay) => update("scheduler", { newPerDay })}
                  />
                </Field>
                <Field title="Maximum reviews per day">
                  <Stepper
                    value={scheduler.reviewCap}
                    min={10}
                    max={200}
                    step={10}
                    onChange={(reviewCap) => update("scheduler", { reviewCap })}
                  />
                </Field>
              </div>

              <div className="card">
                <h2 className="section">Session shape</h2>
                <p className="field-help" style={{ marginTop: -4, marginBottom: 12 }}>
                  A session runs cheap recall drills, then a pattern round, then
                  one cold solve. The expensive rep is deliberately the smallest
                  slice.
                </p>
                <Field title="Recall drills">
                  <Stepper
                    value={scheduler.recallMinutes}
                    min={0}
                    max={30}
                    suffix="min"
                    onChange={(recallMinutes) =>
                      update("scheduler", { recallMinutes })
                    }
                  />
                </Field>
                <Field title="Pattern round">
                  <Stepper
                    value={scheduler.patternMinutes}
                    min={0}
                    max={30}
                    suffix="min"
                    onChange={(patternMinutes) =>
                      update("scheduler", { patternMinutes })
                    }
                  />
                </Field>
              </div>

              <button className="ghost small" onClick={() => resetGroup("scheduler")}>
                <Icon name="refresh" /> Reset scheduling
              </button>
            </>
          ) : null}

          {/* -------------------------------------------------- data */}
          {section === "data" ? (
            <>
              <div className="card">
                <h2 className="section">Your data</h2>
                <Field
                  title="Storage used"
                  help="Progress and settings live in this browser's local storage."
                >
                  <span className="small muted">
                    {(storageBytes / 1024).toFixed(1)} KB
                  </span>
                </Field>
                <Field title="Attempts recorded">
                  <span className="small muted">{progress.attempts.length}</span>
                </Field>
                <Field title="Concepts tracked">
                  <span className="small muted">
                    {Object.keys(progress.concepts).length}
                  </span>
                </Field>
              </div>

              <div className="card">
                <h2 className="section">Backup</h2>
                <Field
                  title="Export progress"
                  help="A JSON file with every attempt, mastery score and schedule. Keep it somewhere safe — clearing your browser data wipes the original."
                >
                  <button className="small" onClick={download}>
                    <Icon name="download" /> Export
                  </button>
                </Field>
                <Field
                  title="Import progress"
                  help="Replaces everything currently stored. There is no merge."
                >
                  <>
                    <input
                      ref={fileInput}
                      type="file"
                      accept="application/json"
                      style={{ display: "none" }}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) upload(file);
                        e.target.value = "";
                      }}
                    />
                    <button
                      className="small"
                      onClick={() => fileInput.current?.click()}
                    >
                      <Icon name="upload" /> Import
                    </button>
                  </>
                </Field>
              </div>

              <div className="card" style={{ borderColor: "var(--fail)" }}>
                <h2 className="section" style={{ color: "var(--fail)" }}>
                  Danger zone
                </h2>
                <Field
                  title="Reset all settings"
                  help="Appearance, editor, learning, narration and scheduling return to their defaults. Progress is untouched."
                >
                  <button className="danger small" onClick={resetAll}>
                    Reset settings
                  </button>
                </Field>
                <Field
                  title="Erase all progress"
                  help="Every attempt, streak, mastery score and schedule. This cannot be undone — export first."
                >
                  <button
                    className="danger small"
                    onClick={() => {
                      if (
                        confirm(
                          "Erase all progress? Every attempt and mastery score is deleted. This cannot be undone.",
                        )
                      ) {
                        onProgress(emptyProgress());
                        toast("success", "Progress erased", "Every attempt and schedule is gone.");
                      }
                    }}
                  >
                    <Icon name="trash" /> Erase progress
                  </button>
                </Field>
              </div>
            </>
          ) : null}

          {/* --------------------------------------------- shortcuts */}
          {section === "shortcuts" ? (
            <div className="card">
              <h2 className="section">Keyboard</h2>
              {[
                ["Run the current exercise", editor.runShortcut === "ctrl-enter" ? "Ctrl / ⌘ + Enter" : "Shift + Enter"],
                ["Autocomplete suggestions", "Ctrl + Space"],
                ["Find in editor", "Ctrl / ⌘ + F"],
                ["Toggle comment", "Ctrl / ⌘ + /"],
                ["Indent / outdent", "Tab / Shift + Tab"],
                ["Undo / redo", "Ctrl / ⌘ + Z / Y"],
                ["Play or pause a lecture", "Space"],
                ["Previous / next scene", "← / →"],
              ].map(([action, keys]) => (
                <div className="field" key={action}>
                  <div className="field-text">
                    <div className="field-title">{action}</div>
                  </div>
                  <div className="field-control">
                    <kbd>{keys}</kbd>
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          {/* ------------------------------------------------- about */}
          {section === "about" ? (
            <>
              <div className="card">
                <h2 className="section">Library</h2>
                <Field title="Lessons">
                  <span className="small muted">{COURSE_LESSONS.length}</span>
                </Field>
                <Field title="Exercises">
                  <span className="small muted">{PROBLEMS.length}</span>
                </Field>
                <Field title="Drills">
                  <span className="small muted">{DRILLS.length}</span>
                </Field>
                <Field title="Lectures">
                  <span className="small muted">{ATOMS.length}</span>
                </Field>
              </div>
              <div className="card">
                <h2 className="section">About Unwashed</h2>
                <p className="field-help" style={{ maxWidth: "62ch" }}>
                  For developers who got fluent with an AI in the loop and
                  discovered they can't write it alone any more. Knowing
                  something and being able to produce it cold are different
                  skills, and only the second one gets you through an interview.
                </p>
                <p className="field-help" style={{ maxWidth: "62ch" }}>
                  Everything runs locally. Your code executes in a sandboxed
                  worker in this tab, your progress never leaves this device,
                  and the app works with the network off.
                </p>
                <div className="row" style={{ marginTop: 14, gap: 8 }}>
                  <span className="badge">Version 0.1.0</span>
                  <span className="badge">Offline-first</span>
                  <span className="badge">No account</span>
                </div>
                <button className="small" style={{ marginTop: 16 }} onClick={onReplayTour}>
                  <Icon name="sparkles" size={15} /> Replay guided tour
                </button>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}

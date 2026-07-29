import { useEffect, useState } from "react";
import type { Atom } from "../types";
import { useSettings } from "../settings";
import Markdown from "./Markdown";
import WatchView from "./WatchView";
import LectureCheck, { type LectureOutcome } from "./LectureCheck";

export type AtomMode = "watch" | "read" | "check";

/**
 * A lecture never ends in "next". It ends in a question you answer from
 * memory, because reading feels like learning and isn't.
 */
export default function AtomView({
  atom,
  onDone,
  isFullscreen = false,
  onToggleFullscreen,
  onModeChange,
  onRequestReview,
}: {
  atom: Atom;
  onDone: (outcome: LectureOutcome) => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
  onModeChange?: (mode: AtomMode) => void;
  onRequestReview?: () => void;
}) {
  const { settings, update } = useSettings();
  const [mode, setMode] = useState<AtomMode>(
    settings.watch.defaultMode,
  );
  const [attempted, setAttempted] = useState(false);

  const choose = (next: "watch" | "read") => {
    update("watch", { defaultMode: next });
    setMode(next);
  };

  useEffect(() => onModeChange?.(mode), [mode, onModeChange]);

  if (mode === "check") {
    return <LectureCheck atom={atom} onDone={onDone} onReview={onRequestReview} />;
  }

  if (mode === "watch") {
    return (
      <WatchView
        atom={atom}
        onDone={() => setMode("check")}
        onRead={() => choose("read")}
        isFullscreen={isFullscreen}
        onToggleFullscreen={onToggleFullscreen}
      />
    );
  }

  return (
    <div className="atom">
      <div className="row spread" style={{ marginBottom: 6 }}>
        <div className="step-kind">Lecture · {atom.readingSeconds}s</div>
        <button className="ghost tiny" onClick={() => choose("watch")}>
          Watch it instead
        </button>
      </div>
      <h1>{atom.title}</h1>

      <div className="prose">
        <Markdown source={atom.body} language={atom.language} />
      </div>

      <div className="recall-box">
        <div className="label">Answer before you move on</div>
        <div style={{ fontSize: 15.5 }}>
          <Markdown source={atom.recall} language={atom.language} />
        </div>

        {!attempted ? (
          <div className="row" style={{ marginTop: 12 }}>
            <button className="primary" onClick={() => setAttempted(true)}>
              I've answered it
            </button>
            <span className="tiny dim">
              In your head or out loud. Don't skip — this is the part that sticks.
            </span>
          </div>
        ) : (
          <div className="row" style={{ marginTop: 12 }}>
            <button className="primary" onClick={() => setMode("check")}>
              Check my recall
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

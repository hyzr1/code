import { useCallback, useEffect, useRef, useState } from "react";
import type { Keystroke } from "../../engine/typing";

interface Props {
  /** The text the learner must reproduce. */
  text: string;
  /** Called with the full keystroke log when the line is completed. */
  onComplete: (strokes: Keystroke[]) => void;
  /** Live callback on every keystroke — for the running WPM/accuracy readout. */
  onStroke?: (strokes: Keystroke[], pos: number) => void;
  /** Fired on the very first keypress (starts the parent's clock). */
  onStart?: () => void;
  /** Restart the current line (Tab) — parent may regenerate text. */
  onRestart?: () => void;
  autoFocus?: boolean;
}

interface Entry {
  ch: string;
  correct: boolean;
}

/**
 * A single focusable typing surface. Advances on every keystroke (wrong keys
 * are marked, not blocked — you may Backspace to fix, but the error is still
 * counted, which is the honest way to score accuracy). Timing is captured per
 * keystroke so the parent can derive WPM, accuracy, and rhythm.
 */
export default function TypingArena({
  text,
  onComplete,
  onStroke,
  onStart,
  onRestart,
  autoFocus = true,
}: Props) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [focused, setFocused] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const entriesRef = useRef<Entry[]>([]);
  const strokes = useRef<Keystroke[]>([]);
  const lastTime = useRef(0);
  const started = useRef(false);
  const done = useRef(false);
  const pos = entries.length;

  // Reset all internal state whenever the target text changes.
  useEffect(() => {
    entriesRef.current = [];
    setEntries([]);
    strokes.current = [];
    lastTime.current = 0;
    started.current = false;
    done.current = false;
    if (autoFocus) ref.current?.focus();
  }, [text, autoFocus]);

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === "Tab") {
        event.preventDefault();
        onRestart?.();
        return;
      }
      if (done.current) return;

      if (event.key === "Backspace") {
        event.preventDefault();
        entriesRef.current = entriesRef.current.slice(0, -1);
        setEntries(entriesRef.current.slice());
        return;
      }

      // Only single printable characters advance the cursor.
      if (event.key.length !== 1 || event.metaKey || event.ctrlKey || event.altKey) return;
      event.preventDefault();

      const at = entriesRef.current.length;
      if (at >= text.length) return;

      const now = performance.now();
      if (!started.current) {
        started.current = true;
        lastTime.current = now;
        onStart?.();
      }
      const dt = strokes.current.length === 0 ? 0 : now - lastTime.current;
      lastTime.current = now;

      const expected = text[at];
      const correct = event.key === expected;
      strokes.current = [...strokes.current, { expected, typed: event.key, correct, dt }];
      entriesRef.current = [...entriesRef.current, { ch: event.key, correct }];
      setEntries(entriesRef.current.slice());

      // Callbacks fire outside any state updater — never during render.
      onStroke?.(strokes.current, entriesRef.current.length);
      if (entriesRef.current.length === text.length) {
        done.current = true;
        const log = strokes.current;
        // Defer so the final character paints before the parent swaps views.
        setTimeout(() => onComplete(log), 0);
      }
    },
    [text, onComplete, onStroke, onStart, onRestart],
  );

  return (
    <div
      className={`arena ${focused ? "focused" : "blurred"}`}
      ref={ref}
      tabIndex={0}
      role="textbox"
      aria-label="Typing area"
      onKeyDown={onKeyDown}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      onClick={() => ref.current?.focus()}
    >
      <div className="arena-text">
        {[...text].map((ch, i) => {
          const entry = entries[i];
          let cls = "ch pending";
          if (i < pos && entry) cls = entry.correct ? "ch ok" : "ch err";
          if (i === pos) cls = "ch caret";
          const display = ch === " " ? " " : ch;
          const wrongSpace = entry && !entry.correct && ch === " ";
          return (
            <span key={i} className={`${cls} ${wrongSpace ? "err-space" : ""}`}>
              {display}
            </span>
          );
        })}
      </div>
      {!focused ? <div className="arena-veil">Click here or press a key to focus</div> : null}
    </div>
  );
}

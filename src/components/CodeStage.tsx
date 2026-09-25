import { highlightLine } from "./highlight";
import type { CourseLanguage } from "../types";

export const MAX_STAGE_LINES = 18;

/**
 * Code for the player. The complete example is present as a quiet preview so
 * the stage never looks broken; narration progressively promotes each line to
 * full contrast and moves the active-line cue in reading order.
 */
export default function CodeStage({
  code,
  animate = true,
  language = "python",
  focusLines = [],
  revealThrough,
}: {
  code: string;
  animate?: boolean;
  language?: CourseLanguage;
  focusLines?: number[];
  /** Controlled, narration-synchronized number of visible source lines. */
  revealThrough?: number;
}) {
  const lines = code.split("\n");
  const shown = animate
    ? Math.max(0, Math.min(lines.length, revealThrough ?? lines.length))
    : lines.length;
  const anchor = focusLines.length
    ? Math.max(...focusLines) - 1
    : Math.max(0, shown - 1);
  const start = lines.length <= MAX_STAGE_LINES
    ? 0
    : Math.max(0, Math.min(lines.length - MAX_STAGE_LINES, anchor - 8));
  const end = Math.min(lines.length, start + MAX_STAGE_LINES);
  const visible = lines.slice(start, end);

  const omission = (label: string) => (
    <div className="stage-line stage-omission" aria-hidden="true">
      <span className="stage-line-number">…</span>
      <span className="stage-line-arrow" />
      <span>{label}</span>
    </div>
  );

  return (
    <pre className="stage-code">
      <code>
        {start > 0 && omission(`${start} earlier lines`)}
        {visible.map((line, visibleIndex) => {
          const i = start + visibleIndex;
          const focused = focusLines.includes(i + 1);
          return (
            <div
              key={i}
              className={`stage-line ${focused ? "focused" : focusLines.length ? "context" : ""} ${i < shown ? "revealed" : "preview"}`}
              aria-current={focused ? "true" : undefined}
              style={{
                opacity: i < shown ? 1 : 0.24,
                transform: "none",
              }}
            >
              <span className="stage-line-number">{i + 1}</span>
              <span className="stage-line-arrow">{focused ? "›" : ""}</span>
              <span>{line.length ? highlightLine(line, `l${i}`, language) : " "}</span>
            </div>
          );
        })}
        {end < lines.length && omission(`${lines.length - end} later lines`)}
      </code>
    </pre>
  );
}

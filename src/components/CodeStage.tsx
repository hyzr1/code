import { highlightLine } from "./highlight";
import type { CourseLanguage } from "../types";

/**
 * Code for the player. The complete example is present as a quiet preview so
 * the stage never looks broken; narration progressively promotes each line to
 * full contrast and moves the active-line cue in reading order.
 */
export default function CodeStage({
  code,
  animate = true,
  language = "javascript",
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

  return (
    <pre className="stage-code">
      <code>
        {lines.map((line, i) => {
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
      </code>
    </pre>
  );
}

import { highlightLine } from "./highlight";
import type { CourseLanguage } from "../types";

/**
 * Code for the player: lines arrive one at a time rather than all at once.
 *
 * A full block landing in one frame is a wall to skim past. Lines appearing in
 * reading order keep the eye moving with the narration, which is most of what
 * makes a screencast easier to follow than a page.
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
              className={`stage-line ${focused ? "focused" : focusLines.length ? "context" : ""}`}
              aria-current={focused ? "true" : undefined}
              style={{
                opacity: i < shown ? 1 : 0,
                transform: i < shown ? "none" : "translateY(4px)",
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

import { memo } from "react";
import {
  FINGER_BY_ID,
  KEYBOARD_ROWS,
  KEY_FINGER,
  SHIFT_BASE,
  fingerFor,
  type Char,
} from "../../content/typing";

const KEY_LABEL: Record<Char, string> = {
  " ": "space",
};

/** Resolve the character to type into the base key + whether Shift is held. */
function resolve(ch: Char): { base: Char; shift: boolean; shiftHand: "left" | "right" } | null {
  if (!ch) return null;
  if (ch === " ") return { base: " ", shift: false, shiftHand: "left" };
  let base = ch;
  let shift = false;
  if (ch >= "A" && ch <= "Z") {
    base = ch.toLowerCase();
    shift = true;
  } else if (SHIFT_BASE[ch]) {
    base = SHIFT_BASE[ch];
    shift = true;
  }
  const finger = KEY_FINGER[base];
  // Shift with the hand opposite the typing finger.
  const shiftHand = finger && finger.startsWith("l") ? "right" : "left";
  return { base, shift, shiftHand };
}

function Keyboard({
  nextChar,
  allowed,
  dimUntaught = true,
}: {
  nextChar: Char | null;
  allowed?: Set<Char>;
  dimUntaught?: boolean;
}) {
  const target = nextChar ? resolve(nextChar) : null;

  const keyEl = (key: Char) => {
    const finger = KEY_FINGER[key];
    const color = finger ? FINGER_BY_ID[finger].color : "var(--border-strong)";
    const isNext = target?.base === key;
    const taught = !allowed || allowed.has(key);
    return (
      <div
        key={key}
        className={`tk ${isNext ? "next" : ""} ${dimUntaught && !taught ? "untaught" : ""}`}
        style={{ "--fk": color } as React.CSSProperties}
        data-key={key}
      >
        <span>{key === ";" ? ";" : key}</span>
      </div>
    );
  };

  return (
    <div className="kbd" aria-hidden="true">
      {KEYBOARD_ROWS.map((row, i) => (
        <div className={`kbd-row r${i}`} key={i}>
          {i === 2 ? <div className="tk mod">caps</div> : null}
          {i === 3 ? (
            <div className={`tk mod ${target?.shift && target.shiftHand === "left" ? "next" : ""}`}>shift</div>
          ) : null}
          {row.map(keyEl)}
          {i === 3 ? (
            <div className={`tk mod ${target?.shift && target.shiftHand === "right" ? "next" : ""}`}>shift</div>
          ) : null}
        </div>
      ))}
      <div className="kbd-row r4">
        <div className={`tk space ${target?.base === " " ? "next" : ""}`}>
          {KEY_LABEL[" "]}
        </div>
      </div>
    </div>
  );
}

export default memo(Keyboard);

/** Finger colour used by the current next-key, for the hint strip. */
export function nextFingerColor(ch: Char | null): string | null {
  if (!ch) return null;
  const f = fingerFor(ch);
  return f ? FINGER_BY_ID[f].color : null;
}

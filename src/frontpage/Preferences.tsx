import { useState } from "react";
import CodeSample from "./CodeSample";

export default function Preferences() {
  const [theme, setTheme] = useState("dark");
  const [format, setFormat] = useState("Visual");
  const [speed, setSpeed] = useState(1);
  return (
    <div className={`preference-lab ${theme}`}>
      <div className="lab-heading">
        <span>MAKE IT YOURS</span>
        <span>LIVE PREVIEW ↗</span>
      </div>
      <div className="lab-preview">
        <span className="lab-kicker">01 / HOW A FUNCTION WORKS</span>
        <h3>
          One idea.
          <br />
          Your way to learn it.
        </h3>
        {format === "Visual" ? (
          <div className="function-flow">
            <span>input</span>
            <i />
            <b>ƒ(x)</b>
            <i />
            <span>output</span>
          </div>
        ) : format === "Code" ? (
          <CodeSample
            file="functions.py"
            source={"def double(x):\n    return x * 2\n\ndouble(4)  # 8"}
          />
        ) : (
          <p>
            A function takes an input, applies a set of instructions, and
            returns an output. Give it 4; doubling returns 8.
          </p>
        )}
        <div className="lab-progress">
          <i style={{ animationDuration: `${6 / speed}s` }} />
        </div>
      </div>
      <div className="lab-control">
        <span>
          Lesson format<small>Choose how to explore the idea</small>
        </span>
        <div
          className="segmented-control"
          role="group"
          aria-label="Lesson format"
        >
          {["Visual", "Code", "Text"].map((f) => (
            <button
              key={f}
              aria-pressed={format === f}
              onClick={() => setFormat(f)}
            >
              <span aria-hidden="true">
                {f === "Visual" ? "◫" : f === "Code" ? "‹›" : "≡"}
              </span>
              {f}
            </button>
          ))}
        </div>
      </div>
      <div className="lab-control">
        <span>
          Appearance<small>Set the tone of your workspace</small>
        </span>
        <div
          className="segmented-control theme-control"
          role="group"
          aria-label="Preview appearance"
        >
          {["dark", "light"].map((t) => (
            <button
              key={t}
              aria-pressed={theme === t}
              onClick={() => setTheme(t)}
            >
              <span aria-hidden="true" className={`theme-swatch ${t}`} />
              {t === "dark" ? "Dark" : "Light"}
            </button>
          ))}
        </div>
      </div>
      <div className="lab-control">
        <label htmlFor="preview-speed">
          Playback pace<small>Move at a comfortable speed</small>
        </label>
        <div className="pace-control">
          <button
            aria-label="Decrease playback pace"
            disabled={speed <= 0.5}
            onClick={() => setSpeed((s) => Math.max(0.5, s - 0.25))}
          >
            −
          </button>
          <input
            id="preview-speed"
            aria-label="Preview playback pace"
            type="range"
            min="0.5"
            max="2"
            step="0.25"
            value={speed}
            style={{
              background: `linear-gradient(to right, #d4d4d4 ${((speed - 0.5) / 1.5) * 100}%, #383838 ${((speed - 0.5) / 1.5) * 100}%)`,
            }}
            onChange={(e) => setSpeed(Number(e.target.value))}
          />
          <button
            aria-label="Increase playback pace"
            disabled={speed >= 2}
            onClick={() => setSpeed((s) => Math.min(2, s + 0.25))}
          >
            +
          </button>
          <output htmlFor="preview-speed">{Number(speed.toFixed(2))}×</output>
        </div>
      </div>
    </div>
  );
}

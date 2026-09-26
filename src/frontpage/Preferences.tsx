import { useState } from "react";

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
          <pre>{"def double(x):\n    return x * 2\n\ndouble(4)  # 8"}</pre>
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
        <span>Lesson format</span>
        <div>
          {["Visual", "Code", "Text"].map((f) => (
            <button
              key={f}
              aria-pressed={format === f}
              onClick={() => setFormat(f)}
            >
              {f}
            </button>
          ))}
        </div>
      </div>
      <div className="lab-control">
        <span>Appearance</span>
        <div>
          {["dark", "light"].map((t) => (
            <button
              key={t}
              aria-pressed={theme === t}
              onClick={() => setTheme(t)}
            >
              {t === "dark" ? "Dark" : "Light"}
            </button>
          ))}
        </div>
      </div>
      <div className="lab-control">
        <label htmlFor="preview-speed">Playback pace</label>
        <div>
          <input
            id="preview-speed"
            aria-label="Preview playback pace"
            type="range"
            min="0.5"
            max="2"
            step="0.25"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
          />
          <output>{speed.toFixed(2)}×</output>
        </div>
      </div>
    </div>
  );
}

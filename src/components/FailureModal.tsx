import { useState } from "react";
import { FAILURE_MODES, type FailureMode } from "../types";

/**
 * Five seconds of tagging buys the app the best signal it will ever get.
 *
 * "Wrong answer" tells you nothing about what to do next. Which of the six
 * ways you failed tells you exactly what to do next, and four of the six
 * prescriptions are *not* "solve another problem."
 */
export default function FailureModal({
  onPick,
  onCancel,
}: {
  onPick: (mode: FailureMode) => void;
  onCancel: () => void;
}) {
  const [selected, setSelected] = useState<FailureMode | null>(null);

  return (
    <div className="overlay" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>What actually stopped you?</h3>
        <p className="muted small" style={{ marginTop: 0 }}>
          Be honest — this picks what you practise next, and getting it wrong
          costs you weeks on the wrong drills.
        </p>

        <div style={{ marginTop: 18 }}>
          {FAILURE_MODES.map((mode) => (
            <button
              key={mode.id}
              className={`mode-btn ${selected === mode.id ? "selected" : ""}`}
              onClick={() => setSelected(mode.id)}
            >
              <strong>{mode.label}</strong>
              <em>{mode.detail}</em>
            </button>
          ))}
        </div>

        <div className="row spread" style={{ marginTop: 18 }}>
          <button className="ghost" onClick={onCancel}>
            Back to the problem
          </button>
          <button
            className="primary"
            disabled={!selected}
            onClick={() => selected && onPick(selected)}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}

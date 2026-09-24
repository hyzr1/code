import { useState } from "react";
import type { ApproachDrill } from "../types";
import Markdown from "./Markdown";

/**
 * No editor. On purpose.
 *
 * The step that fails under interview pressure is deciding what to do, not
 * typing it — so this trains that step alone. Four questions against one
 * statement, two minutes. Fifteen of these fit in the time one implementation
 * takes.
 */
export default function ApproachDrillView({
  drill,
  onDone,
}: {
  drill: ApproachDrill;
  onDone: (correct: boolean) => void;
}) {
  const [step, setStep] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [right, setRight] = useState(0);

  const current = drill.steps[step];
  const isLast = step === drill.steps.length - 1;
  const answered = picked !== null;

  const next = () => {
    if (picked === current.answer) setRight((n) => n + 1);
    if (isLast) {
      const total = right + (picked === current.answer ? 1 : 0);
      onDone(total >= drill.steps.length - 1);
      return;
    }
    setPicked(null);
    setStep((s) => s + 1);
  };

  return (
    <div className="drill">
      <div className="row spread" style={{ marginBottom: 10 }}>
        <span className="step-kind">Approach · no coding</span>
        <span className="tiny dim">
          {step + 1} of {drill.steps.length}
        </span>
      </div>

      <div className="statement">
        <div className="statement-label">{drill.title}</div>
        <Markdown source={drill.statement} />
      </div>

      <div style={{ fontSize: 16.5, margin: "20px 0 4px", fontWeight: 550 }}>
        {current.question}
      </div>

      <div className="choices">
        {current.choices.map((choice, index) => {
          const cls = !answered
            ? ""
            : index === current.answer
              ? "correct"
              : index === picked
                ? "wrong"
                : "";
          return (
            <button
              key={choice}
              className={`choice ${cls}`}
              disabled={answered}
              onClick={() => setPicked(index)}
            >
              {choice}
            </button>
          );
        })}
      </div>

      {answered ? (
        <>
          <div
            style={{
              fontWeight: 650,
              color: picked === current.answer ? "var(--pass)" : "var(--fail)",
            }}
          >
            {picked === current.answer ? "Correct" : "Not quite"}
          </div>
          <div className="explain">{current.explanation}</div>
          <button className="primary" onClick={next}>
            {isLast ? "Finish" : "Next question"}
          </button>
        </>
      ) : null}
    </div>
  );
}

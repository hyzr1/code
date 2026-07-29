import { useState } from "react";
import type { Atom } from "../types";
import Icon from "./Icon";

export interface LectureOutcome {
  score: number;
  confidence: "low" | "medium" | "high";
  correct?: boolean;
}

const CONFIDENCE = [
  { id: "low", label: "Unsure" },
  { id: "medium", label: "Fairly sure" },
  { id: "high", label: "Certain" },
] as const;

function objectiveScore(correct: boolean, confidence: LectureOutcome["confidence"]): number {
  if (correct) return confidence === "high" ? 100 : confidence === "medium" ? 92 : 82;
  return confidence === "low" ? 38 : confidence === "medium" ? 22 : 8;
}

export default function LectureCheck({
  atom,
  onDone,
  onReview,
}: {
  atom: Atom;
  onDone: (outcome: LectureOutcome) => void;
  onReview?: () => void;
}) {
  const [choice, setChoice] = useState<number | null>(null);
  const [confidence, setConfidence] = useState<LectureOutcome["confidence"] | null>(null);
  const [selfScore, setSelfScore] = useState<number | null>(null);
  const [outcome, setOutcome] = useState<LectureOutcome | null>(null);
  const check = atom.check;

  const submit = () => {
    if (!confidence) return;
    if (check && choice !== null) {
      const correct = choice === check.answer;
      setOutcome({ score: objectiveScore(correct, confidence), confidence, correct });
      return;
    }
    if (!check && selfScore !== null) {
      const adjustment = confidence === "high" ? 5 : confidence === "low" ? -5 : 0;
      setOutcome({ score: Math.max(0, Math.min(100, selfScore + adjustment)), confidence });
    }
  };

  const message = outcome
    ? outcome.score >= 85
      ? "Strong retrieval. You can move on; spacing will test it again later."
      : outcome.score >= 60
        ? "The main shape is there, but one link is weak. The next exercise will make it concrete."
        : "This did not stick yet. That is useful evidence—replay the key scene or continue with a scaffold."
    : "";

  return (
    <div className="lecture-check">
      <div className="step-kind">Retrieval check</div>
      <h1>Did it actually stick?</h1>
      <p className="muted">Your score measures recall and calibration, not whether the video reached the end.</p>

      <div className="card">
        <div className="row spread review-reference-row">
          <div className="label">Answer from memory first</div>
          {onReview ? (
            <button className="ghost small review-lesson-button" onClick={onReview}>
              <Icon name="play" size={14} />
              Review lesson
            </button>
          ) : null}
        </div>
        <p style={{ fontSize: 17 }}>{check?.question ?? atom.recall}</p>
        {check ? (
          <div className="lecture-choices">
            {check.choices.map((answer, index) => (
              <button
                key={answer}
                className={choice === index ? "on" : ""}
                aria-pressed={choice === index}
                disabled={Boolean(outcome)}
                onClick={() => setChoice(index)}
              >
                <span className="lecture-choice-marker">
                  {String.fromCharCode(65 + index)}
                </span>
                <span className="lecture-choice-copy">{answer}</span>
              </button>
            ))}
          </div>
        ) : (
          <div className="lecture-choices compact">
            {[
              [90, "I explained it precisely"],
              [65, "I had the main idea"],
              [30, "I could not reconstruct it"],
            ].map(([score, label]) => (
              <button key={score} className={selfScore === score ? "on" : ""} disabled={Boolean(outcome)} onClick={() => setSelfScore(score as number)}>
                {label}
              </button>
            ))}
          </div>
        )}

        <div className="label" style={{ marginTop: 18 }}>How confident were you before checking?</div>
        <div className="segmented" style={{ marginTop: 8 }}>
          {CONFIDENCE.map((item) => (
            <button key={item.id} className={confidence === item.id ? "on" : ""} aria-pressed={confidence === item.id} disabled={Boolean(outcome)} onClick={() => setConfidence(item.id)}>
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {outcome ? (
        <div className={`learning-score ${outcome.score >= 85 ? "strong" : outcome.score >= 60 ? "partial" : "weak"}`}>
          <div className="score-ring"><strong>{outcome.score}</strong><span>/100</span></div>
          <div>
            <div className="label">Learning score</div>
            <p>{message}</p>
            {check ? <p className="tiny dim">{check.explanation}</p> : null}
          </div>
        </div>
      ) : null}

      <div className="row" style={{ marginTop: 18 }}>
        {!outcome ? (
          <button className="primary" disabled={!confidence || (check ? choice === null : selfScore === null)} onClick={submit}>Score my recall</button>
        ) : (
          <button className="primary" onClick={() => onDone(outcome)}>Continue to practice</button>
        )}
      </div>
    </div>
  );
}

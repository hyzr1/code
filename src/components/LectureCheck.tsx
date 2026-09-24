import { useState } from "react";
import type { Atom, LectureQuestion } from "../types";
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
  // Prefer the multi-question bank; fall back to the legacy single question.
  const questions: LectureQuestion[] = atom.checks?.length
    ? atom.checks
    : atom.check
      ? [atom.check]
      : [];

  if (questions.length > 0) {
    return <QuestionBank atom={atom} questions={questions} onDone={onDone} onReview={onReview} />;
  }
  return <SelfScore atom={atom} onDone={onDone} onReview={onReview} />;
}

// ------------------------------------------------------------- question bank

function QuestionBank({
  questions,
  onDone,
  onReview,
}: {
  atom: Atom;
  questions: LectureQuestion[];
  onDone: (outcome: LectureOutcome) => void;
  onReview?: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [choice, setChoice] = useState<number | null>(null);
  const [confidence, setConfidence] = useState<LectureOutcome["confidence"] | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [results, setResults] = useState<{ score: number; correct: boolean }[]>([]);
  const [outcome, setOutcome] = useState<LectureOutcome | null>(null);

  const q = questions[index];
  const isLast = index === questions.length - 1;

  const check = () => {
    if (choice === null || !confidence) return;
    setRevealed(true);
  };

  const advance = () => {
    if (choice === null || !confidence) return;
    const correct = choice === q.answer;
    const next = [...results, { score: objectiveScore(correct, confidence), correct }];
    if (isLast) {
      const score = Math.round(next.reduce((sum, r) => sum + r.score, 0) / next.length);
      setOutcome({ score, confidence, correct: next.every((r) => r.correct) });
    } else {
      setResults(next);
      setIndex(index + 1);
      setChoice(null);
      setConfidence(null);
      setRevealed(false);
    }
  };

  const correctSoFar = results.filter((r) => r.correct).length + (revealed && choice === q.answer ? 1 : 0);

  if (outcome) {
    const band = outcome.score >= 85 ? "strong" : outcome.score >= 60 ? "partial" : "weak";
    const message =
      outcome.score >= 85
        ? "Strong retrieval. You can move on; spacing will test it again later."
        : outcome.score >= 60
          ? "The main shape is there, but a link or two is weak. Practice will make it concrete."
          : "This did not fully stick yet — useful evidence. Replay the key scene, then continue with a scaffold.";
    return (
      <div className="lecture-check">
        <div className="step-kind">Retrieval check</div>
        <h1>Did it actually stick?</h1>
        <p className="muted">You answered {correctSoFar} of {questions.length} correctly.</p>
        <div className={`learning-score ${band}`}>
          <div className="score-ring"><strong>{outcome.score}</strong><span>/100</span></div>
          <div>
            <div className="label">Learning score</div>
            <p>{message}</p>
          </div>
        </div>
        <div className="row" style={{ marginTop: 18 }}>
          <button className="primary" onClick={() => onDone(outcome)}>Continue to practice</button>
        </div>
      </div>
    );
  }

  return (
    <div className="lecture-check">
      <div className="step-kind">Retrieval check</div>
      <h1>Did it actually stick?</h1>
      <p className="muted">Three quick questions. Answer from memory — reasoning is shown after each.</p>

      <div className="card">
        <div className="row spread review-reference-row">
          <div className="label">Question {index + 1} of {questions.length}</div>
          {onReview ? (
            <button className="ghost small review-lesson-button" onClick={onReview}>
              <Icon name="play" size={14} />
              Review lesson
            </button>
          ) : null}
        </div>

        <div className="lecture-progress-dots" style={{ display: "flex", gap: 6, margin: "4px 0 14px" }}>
          {questions.map((_, i) => (
            <i
              key={i}
              style={{
                width: 22,
                height: 4,
                borderRadius: 2,
                background: i < index ? "var(--pass)" : i === index ? "var(--accent)" : "var(--surface-3)",
              }}
            />
          ))}
        </div>

        <p style={{ fontSize: 17 }}>{q.question}</p>
        <div className="lecture-choices">
          {q.choices.map((answer, i) => {
            const isAnswer = i === q.answer;
            const isChoice = i === choice;
            const state = revealed ? (isAnswer ? "correct" : isChoice ? "wrong" : "") : isChoice ? "on" : "";
            return (
              <div key={answer}>
                <button
                  className={state}
                  aria-pressed={isChoice}
                  disabled={revealed}
                  onClick={() => setChoice(i)}
                  style={
                    revealed && isAnswer
                      ? { borderColor: "var(--pass)" }
                      : revealed && isChoice
                        ? { borderColor: "var(--fail)" }
                        : undefined
                  }
                >
                  <span className="lecture-choice-marker">{String.fromCharCode(65 + i)}</span>
                  <span className="lecture-choice-copy">{answer}</span>
                  {revealed ? (
                    <span style={{ marginLeft: "auto", color: isAnswer ? "var(--pass)" : isChoice ? "var(--fail)" : "var(--text-faint)", fontWeight: 700 }}>
                      {isAnswer ? "✓" : isChoice ? "✕" : ""}
                    </span>
                  ) : null}
                </button>
                {revealed && q.why?.[i] ? (
                  <p
                    className="tiny"
                    style={{
                      margin: "4px 0 10px 34px",
                      color: "var(--text-muted)",
                      borderLeft: `2px solid ${isAnswer ? "var(--pass)" : isChoice ? "var(--fail)" : "var(--border)"}`,
                      paddingLeft: 10,
                    }}
                  >
                    {q.why[i]}
                  </p>
                ) : null}
              </div>
            );
          })}
        </div>

        {!revealed ? (
          <>
            <div className="label" style={{ marginTop: 18 }}>How confident were you before checking?</div>
            <div className="segmented" style={{ marginTop: 8 }}>
              {CONFIDENCE.map((item) => (
                <button
                  key={item.id}
                  className={confidence === item.id ? "on" : ""}
                  aria-pressed={confidence === item.id}
                  onClick={() => setConfidence(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </>
        ) : (
          <p className="tiny dim" style={{ marginTop: 14 }}>{q.explanation}</p>
        )}
      </div>

      <div className="row" style={{ marginTop: 18 }}>
        {!revealed ? (
          <button className="primary" disabled={choice === null || !confidence} onClick={check}>
            Check answer
          </button>
        ) : (
          <button className="primary" onClick={advance}>
            {isLast ? "See your score" : "Next question"}
          </button>
        )}
      </div>
    </div>
  );
}

// ------------------------------------------------------- self-score fallback

function SelfScore({
  atom,
  onDone,
  onReview,
}: {
  atom: Atom;
  onDone: (outcome: LectureOutcome) => void;
  onReview?: () => void;
}) {
  const [confidence, setConfidence] = useState<LectureOutcome["confidence"] | null>(null);
  const [selfScore, setSelfScore] = useState<number | null>(null);
  const [outcome, setOutcome] = useState<LectureOutcome | null>(null);

  const submit = () => {
    if (!confidence || selfScore === null) return;
    const adjustment = confidence === "high" ? 5 : confidence === "low" ? -5 : 0;
    setOutcome({ score: Math.max(0, Math.min(100, selfScore + adjustment)), confidence });
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
        <p style={{ fontSize: 17 }}>{atom.recall}</p>
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
          </div>
        </div>
      ) : null}

      <div className="row" style={{ marginTop: 18 }}>
        {!outcome ? (
          <button className="primary" disabled={!confidence || selfScore === null} onClick={submit}>Score my recall</button>
        ) : (
          <button className="primary" onClick={() => onDone(outcome)}>Continue to practice</button>
        )}
      </div>
    </div>
  );
}

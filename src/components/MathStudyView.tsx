import { useState } from "react";
import type { MathStudyGuide } from "../content/math/study-guides";

function Practice({ guide }: { guide: MathStudyGuide }) {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  return (
    <section className="math-study-section">
      <div className="math-study-kicker">Your turn</div>
      <h2>Work it out before revealing the answer.</h2>
      <p>Use paper if you can. Write each line and ask what rule lets you move to the next one.</p>
      {guide.practice.map((problem, index) => (
        <div className="math-practice" key={problem.question}>
          <div className="math-example-heading"><span>{String(index + 1).padStart(2, "0")}</span><h3>{problem.question}</h3></div>
          <label htmlFor={`math-answer-${index}`}>Your working</label>
          <textarea
            id={`math-answer-${index}`}
            value={answers[index] ?? ""}
            onChange={(event) => setAnswers((current) => ({ ...current, [index]: event.target.value }))}
            placeholder="Try the first step here…"
            rows={3}
          />
          <details><summary>Need a hint?</summary><p>{problem.hint}</p></details>
          <details><summary>Show full solution</summary><ol>{problem.solution.map((step) => <li key={step}>{step}</li>)}</ol></details>
        </div>
      ))}
    </section>
  );
}

export default function MathStudyView({ guide }: { guide: MathStudyGuide }) {
  return (
    <div className="math-study">
      <section className="math-study-section">
        <div className="math-study-kicker">Start here</div>
        <h2>Understand the idea</h2>
        {guide.opening.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
      </section>
      <section className="math-study-section">
        <div className="math-study-kicker">Follow the reasoning</div>
        <h2>Worked examples</h2>
        {guide.examples.map((example, index) => (
          <article className="math-example" key={example.question}>
            <div className="math-example-heading"><span>{String(index + 1).padStart(2, "0")}</span><h3>{example.question}</h3></div>
            <p className="math-approach"><strong>First thought.</strong> {example.approach}</p>
            <ol className="math-steps">{example.steps.map((step) => <li key={step}>{step}</li>)}</ol>
            <p className="math-check"><strong>Check.</strong> {example.check}</p>
          </article>
        ))}
      </section>
      <Practice guide={guide} />
      <p className="math-takeaway"><strong>Keep in mind:</strong> {guide.takeaway}</p>
    </div>
  );
}

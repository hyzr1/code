import { useEffect, useRef, useState } from "react";
import type { Problem, RunResult } from "../types";
import { runTests } from "../engine/runner";
import Editor from "./Editor";
import Markdown from "./Markdown";
import Icon from "./Icon";

export interface RepOutcome {
  passed: boolean;
  hintsUsed: number;
  seconds: number;
  attempts: number;
}

/**
 * A rep is a 45-second unit, so the interface has to get out of the way:
 * no calibration gate, no scaffolding chooser, no reference solution unless
 * you're stuck. Ctrl+Enter runs. Passing advances on its own.
 */
export default function RepView({
  problem,
  index,
  total,
  onDone,
  onReviewLesson,
}: {
  problem: Problem;
  index: number;
  total: number;
  onDone: (outcome: RepOutcome) => void;
  onReviewLesson?: () => void;
}) {
  const [code, setCode] = useState(problem.scaffolds.L3 ?? "");
  const [result, setResult] = useState<RunResult | null>(null);
  const [running, setRunning] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [passed, setPassed] = useState(false);
  // Full editor assists while learning. Cold Mode is here if you want to
  // prove you can produce it unaided — that's what the L4 problems are for.
  const [cold, setCold] = useState(false);
  const started = useRef(Date.now());

  const finish = (didPass: boolean) =>
    onDone({
      passed: didPass,
      hintsUsed: (showHint ? 1 : 0) + (showSolution ? 1 : 0),
      seconds: Math.max(1, Math.round((Date.now() - started.current) / 1000)),
      attempts,
    });

  const run = async () => {
    if (running || passed) return;
    setRunning(true);
    const outcome = await runTests(code, problem.exportName, problem.tests, problem.language);
    setRunning(false);
    setResult(outcome);
    setAttempts((n) => n + 1);
    if (outcome.ok) setPassed(true);
  };

  // Advance on its own once it's green. Any longer and the rhythm dies.
  useEffect(() => {
    if (!passed) return;
    const timer = setTimeout(() => finish(true), 850);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [passed]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
        event.preventDefault();
        void run();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const failures = result?.results.filter((r) => !r.passed) ?? [];

  return (
    <div className="rep">
      <div className="row spread rep-headline" style={{ marginBottom: 10 }}>
        <span className="step-kind">
          Rep {index + 1} of {total}
        </span>
        <span className="tiny dim rep-title">{problem.title}</span>
      </div>

      <div className="row spread exercise-reference-row">
        <span className="tiny dim">Use the lesson whenever a symbol or idea is unclear.</span>
        {onReviewLesson ? (
          <button className="ghost small review-lesson-button" onClick={onReviewLesson}>
            <Icon name="play" size={14} />
            Review lesson
          </button>
        ) : null}
      </div>

      <div className="rep-prompt">
        <Markdown source={problem.prompt} language={problem.language} />
      </div>

      <div className="pane flush rep-editor" style={{ marginTop: 12 }}>
        <div className="editor-head">
          <span className="tiny dim editor-file" style={{ fontFamily: "var(--mono)" }}>
            {problem.exportName}
          </span>
          <div className="row editor-actions" style={{ gap: 8 }}>
            <button
              className={`ghost tiny ${cold ? "on" : ""}`}
              onClick={() => setCold((c) => !c)}
              title="Cold Mode turns off autocomplete, bracket closing and paste"
            >
              {cold ? "Cold" : "Assists on"}
            </button>
            {!passed ? (
              <button
                className="ghost tiny"
                onClick={() => setShowHint(true)}
                disabled={showHint}
              >
                Hint
              </button>
            ) : null}
            <button className="primary small" disabled={running || passed} onClick={run}>
              {running ? "…" : passed ? "✓" : "Run"}
            </button>
          </div>
        </div>

        <Editor value={code} onChange={setCode} cold={cold} language={problem.language} />
      </div>

      <div className="tiny dim" style={{ marginTop: 6 }}>
        Ctrl+Enter to run · Ctrl+Space for suggestions · Ctrl+F to find ·
        Ctrl+/ to comment
      </div>

      {passed ? (
        <div className="rep-pass">✓ Correct</div>
      ) : result ? (
        <div className="rep-fail">
          {result.fatal ? (
            <div className="fatal">{result.fatal}</div>
          ) : (
            <>
              <div className="tiny" style={{ color: "var(--fail)", fontWeight: 650 }}>
                {result.results.filter((r) => r.passed).length} /{" "}
                {result.results.length} passing
              </div>
              {failures.slice(0, 3).map((test) => (
                <div className="test-line fail" key={test.name}>
                  <span className="mark">✕</span>
                  <span style={{ flex: 1 }}>
                    <span style={{ fontFamily: "var(--mono)", fontSize: 12.5 }}>
                      {test.name}
                    </span>
                    {test.message ? (
                      <pre>
                        <code>{test.message}</code>
                      </pre>
                    ) : null}
                  </span>
                </div>
              ))}
            </>
          )}
        </div>
      ) : null}

      {showHint && !passed ? (
        <div className="hint">
          <div className="rung">Hint</div>
          <Markdown source={problem.hints[0]?.text ?? ""} />
        </div>
      ) : null}

      {showSolution ? (
        <div className="card" style={{ marginTop: 12 }}>
          <h2 className="section">One way to write it</h2>
          <pre>
            <code>{problem.solution}</code>
          </pre>
          <p className="tiny dim" style={{ marginBottom: 0 }}>
            Type it out yourself rather than copying. Reading it is not the rep.
          </p>
        </div>
      ) : null}

      {!passed ? (
        <div className="row wrap" style={{ marginTop: 14, gap: 8 }}>
          {attempts >= 2 && !showSolution ? (
            <button className="ghost small" onClick={() => setShowSolution(true)}>
              Show me one way
            </button>
          ) : null}
          {showSolution ? (
            <button className="small" onClick={() => finish(false)}>
              Move on
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

import { useEffect, useRef, useState } from "react";
import type {
  FailureMode,
  Problem,
  RunResult,
  ScaffoldLevel,
} from "../types";
import { SCAFFOLD_INFO } from "../types";
import { runTests } from "../engine/runner";
import Editor from "./Editor";
import Markdown from "./Markdown";
import FailureModal from "./FailureModal";
import Icon from "./Icon";

export interface ProblemOutcome {
  passed: boolean;
  level: ScaffoldLevel;
  hintsUsed: number;
  seconds: number;
  timeToFirstKeystroke?: number;
  failureMode?: FailureMode;
  predicted?: "yes" | "maybe" | "no";
}

type Phase = "predict" | "solve" | "passed";

export default function ProblemView({
  problem,
  level,
  onDone,
  onReviewLesson,
}: {
  problem: Problem;
  level: ScaffoldLevel;
  onDone: (outcome: ProblemOutcome) => void;
  onReviewLesson?: () => void;
}) {
  const cold = level === "L4";
  const [phase, setPhase] = useState<Phase>("predict");
  const [predicted, setPredicted] = useState<"yes" | "maybe" | "no">();
  const [code, setCode] = useState(problem.scaffolds[level] ?? "");
  const [result, setResult] = useState<RunResult | null>(null);
  const [running, setRunning] = useState(false);
  const [hintLevel, setHintLevel] = useState(-1);
  const [coldBroken, setColdBroken] = useState(false);
  const [walkthrough, setWalkthrough] = useState(0);
  const [showFailure, setShowFailure] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  const started = useRef<number>(0);
  const firstKey = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (phase !== "solve") return;
    started.current = Date.now();
    const timer = setInterval(
      () => setElapsed(Math.floor((Date.now() - started.current) / 1000)),
      1000,
    );
    return () => clearInterval(timer);
  }, [phase]);

  const hintsUsed = hintLevel + 1 + (walkthrough > 0 ? 1 : 0);

  const finish = (passed: boolean, failureMode?: FailureMode) => {
    onDone({
      passed,
      level,
      hintsUsed,
      seconds: Math.max(1, Math.round((Date.now() - started.current) / 1000)),
      timeToFirstKeystroke: firstKey.current
        ? Math.round((firstKey.current - started.current) / 1000)
        : undefined,
      failureMode,
      predicted,
    });
  };

  const run = async () => {
    setRunning(true);
    const outcome = await runTests(code, problem.exportName, problem.tests, problem.language);
    setRunning(false);
    setResult(outcome);
    if (outcome.ok) setPhase("passed");
  };

  // ------------------------------------------------------- calibration
  if (phase === "predict") {
    return (
      <div className="atom">
        <div className="step-kind">Problem · {problem.estimatedMinutes} min</div>
        <h1>{problem.title}</h1>
        <div className="row wrap" style={{ gap: 8, marginBottom: 20 }}>
          <span className={`level-chip ${cold ? "cold" : ""}`}>
            {level} {SCAFFOLD_INFO[level].label}
          </span>
          <span className="tiny dim">{SCAFFOLD_INFO[level].detail}</span>
        </div>

        {onReviewLesson ? (
          <button className="ghost small review-lesson-button" onClick={onReviewLesson}>
            <Icon name="play" size={14} />
            Review lesson
          </button>
        ) : null}

        <div className="card">
          <h2 className="section">Before you look</h2>
          <p style={{ marginTop: 0 }}>
            Can you solve this one cold, right now, with no help?
          </p>
          <div className="predict-row">
            {(["yes", "maybe", "no"] as const).map((option) => (
              <button
                key={option}
                className={predicted === option ? "on" : ""}
                onClick={() => setPredicted(option)}
              >
                {option === "yes" ? "Yes" : option === "maybe" ? "Probably" : "No"}
              </button>
            ))}
          </div>
          <p className="tiny dim" style={{ marginBottom: 0 }}>
            Two seconds, and it's the cheapest fix for the biggest time-waster
            in prep: being sure you know something you don't.
          </p>
        </div>

        <button
          className="primary"
          disabled={!predicted}
          onClick={() => setPhase("solve")}
        >
          Start
        </button>
      </div>
    );
  }

  // ------------------------------------------------------------- passed
  if (phase === "passed") {
    const clean = hintsUsed === 0 && cold;
    return (
      <div className="atom">
        <div className="step-kind">Solved</div>
        <h1 style={{ color: "var(--pass)" }}>
          {clean ? "Cold solve." : "All tests pass."}
        </h1>
        <p className="muted">
          {problem.tests.length} tests · {formatTime(elapsed)}
          {hintsUsed > 0 ? ` · ${hintsUsed} hint${hintsUsed > 1 ? "s" : ""}` : ""}
        </p>

        {clean ? (
          <p>
            No hints, no autocomplete, blank file. That's the rep that counts —
            this concept just moved to a longer interval.
          </p>
        ) : (
          <p>
            You got there, but not cold. This one comes back{" "}
            {cold ? "sooner" : "at the next level up"}, because solving with help
            is evidence you understood it, not evidence you can produce it.
          </p>
        )}

        <div className="card">
          <h2 className="section">Reference solution</h2>
          <pre>
            <code>{problem.solution}</code>
          </pre>
          <p className="small muted" style={{ marginBottom: 0 }}>
            Compare it to yours. Different is fine. Shorter usually isn't better
            — clearer is.
          </p>
        </div>

        {problem.analysis ? (
          <div className="card solution-analysis">
            <h2 className="section">Why this works</h2>
            <div className="analysis-grid">
              <div><span>Approach</span><p>{problem.analysis.approach}</p></div>
              <div><span>Core invariant</span><p>{problem.analysis.invariant}</p></div>
              <div><span>Time</span><strong>{problem.analysis.time}</strong></div>
              <div><span>Space</span><strong>{problem.analysis.space}</strong></div>
            </div>
          </div>
        ) : null}

        <button className="primary" onClick={() => finish(true)}>
          Continue
        </button>
      </div>
    );
  }

  // -------------------------------------------------------------- solve
  const mistake =
    result && !result.ok
      ? problem.commonMistakes?.find((m) => code.includes(m.match))
      : undefined;

  const canHint = !cold || coldBroken;
  const nextHint = problem.hints[hintLevel + 1];

  return (
    <>
      <div className="row spread problem-solve-bar" style={{ marginBottom: 16 }}>
        <div className="row problem-level-meta" style={{ gap: 10 }}>
          <span className={`level-chip ${cold ? "cold" : ""}`}>
            {level} {SCAFFOLD_INFO[level].label}
          </span>
          <span className="tiny dim">{SCAFFOLD_INFO[level].detail}</span>
        </div>
        <div className="row problem-clock-actions" style={{ gap: 14 }}>
          <span className="tiny dim" style={{ fontFamily: "var(--mono)" }}>
            {formatTime(elapsed)}
          </span>
          <button className="ghost small" onClick={() => setShowFailure(true)}>
            I'm stuck
          </button>
          {onReviewLesson ? (
            <button className="ghost small review-lesson-button" onClick={onReviewLesson}>
              <Icon name="play" size={14} />
              Review lesson
            </button>
          ) : null}
        </div>
      </div>

      <div className="problem-grid">
        <div>
          <div className="pane">
            <h1 style={{ fontSize: 22, margin: "0 0 12px" }}>{problem.title}</h1>
            <div className="prose" style={{ fontSize: 15 }}>
              <Markdown source={problem.prompt} language={problem.language} />
            </div>
          </div>

          <div className="pane" style={{ marginTop: 16 }}>
            <div className="row spread">
              <h2 className="section" style={{ margin: 0 }}>
                Help ladder
              </h2>
              <span className="tiny dim">
                {hintsUsed} used
              </span>
            </div>

            {!canHint ? (
              <>
                <p className="small muted" style={{ marginTop: 12 }}>
                  Cold attempt. No hints, no autocomplete, paste is off.
                </p>
                <button
                  className="ghost small"
                  onClick={() => setColdBroken(true)}
                >
                  Break the cold attempt
                </button>
              </>
            ) : (
              <>
                {problem.hints.slice(0, hintLevel + 1).map((hint) => (
                  <div className="hint" key={hint.rung}>
                    <div className="rung">
                      {hint.rung === 0
                        ? "Nudge"
                        : hint.rung === 1
                          ? "Name the tool"
                          : "Full strategy"}
                    </div>
                    <Markdown source={hint.text} />
                  </div>
                ))}

                <div className="row wrap" style={{ marginTop: 12, gap: 8 }}>
                  {nextHint ? (
                    <button
                      className="small"
                      onClick={() => setHintLevel(hintLevel + 1)}
                    >
                      {hintLevel < 0 ? "Give me a nudge" : "Next rung"}
                    </button>
                  ) : null}
                  {problem.walkthrough && !nextHint ? (
                    <button
                      className="small"
                      onClick={() => setWalkthrough(walkthrough + 1)}
                      disabled={walkthrough >= problem.walkthrough.length}
                    >
                      {walkthrough === 0 ? "Walk me through it" : "Next question"}
                    </button>
                  ) : null}
                </div>

                {walkthrough > 0 && problem.walkthrough ? (
                  <div style={{ marginTop: 14 }}>
                    <div className="tiny dim" style={{ marginBottom: 4 }}>
                      Answer each one before you read the next. No code below —
                      that's on purpose.
                    </div>
                    {problem.walkthrough.slice(0, walkthrough).map((step, i) => (
                      <div className="walk-step" key={step}>
                        <span className="n">{i + 1}</span>
                        <span>
                          <Markdown source={step} />
                        </span>
                      </div>
                    ))}
                  </div>
                ) : null}
              </>
            )}
          </div>
        </div>

        <div className="pane flush">
          <div className="editor-head">
            <span className="tiny dim editor-file" style={{ fontFamily: "var(--mono)" }}>
              {problem.exportName}.js
            </span>
            <div className="row editor-actions" style={{ gap: 8 }}>
              <button
                className={`ghost small ${cold && !coldBroken ? "on" : ""}`}
                onClick={() => setColdBroken((broken) => !broken)}
                title="Cold Mode turns off autocomplete, bracket closing and paste"
              >
                {cold && !coldBroken ? "Cold" : "Assists on"}
              </button>
              <button
                className="ghost small"
                onClick={() => setCode(problem.scaffolds[level] ?? "")}
              >
                Reset
              </button>
              <button className="primary small" disabled={running} onClick={run}>
                {running ? "Running…" : "Run tests"}
              </button>
            </div>
          </div>

          <Editor
            value={code}
            onChange={setCode}
            cold={cold && !coldBroken}
            language={problem.language}
            onFirstKeystroke={() => {
              firstKey.current ??= Date.now();
            }}
          />

          {running ? (
            <div className="results">
              <div className="row" style={{ gap: 9, color: "var(--text-muted)" }}>
                <span className="spinner" />
                <span className="small">Running {problem.tests.length} tests…</span>
              </div>
            </div>
          ) : result ? (
            <div className="results">
              {result.fatal ? (
                <div className="fatal">{result.fatal}</div>
              ) : (
                <>
                  <div className="row spread" style={{ marginBottom: 8 }}>
                    <span
                      className="small"
                      style={{
                        color: result.ok ? "var(--pass)" : "var(--fail)",
                        fontWeight: 650,
                      }}
                    >
                      {result.results.filter((r) => r.passed).length} /{" "}
                      {result.results.length} passing
                    </span>
                    <span className="tiny dim">{result.ms}ms</span>
                  </div>

                  {result.results.map((test) => (
                    <div
                      className={`test-line ${test.passed ? "pass" : "fail"}`}
                      key={test.name}
                    >
                      <span className="mark">{test.passed ? "✓" : "✕"}</span>
                      <span style={{ flex: 1 }}>
                        <span className={test.passed ? "muted" : ""}>
                          {test.name}
                        </span>
                        {test.hidden ? (
                          <span className="tiny dim"> · hidden</span>
                        ) : null}
                        {test.message ? (
                          <pre>
                            <code>{test.message}</code>
                          </pre>
                        ) : null}
                        {test.logs.length ? (
                          <pre style={{ background: "#0f1216", color: "#8b94a3" }}>
                            <code>{test.logs.join("\n")}</code>
                          </pre>
                        ) : null}
                      </span>
                    </div>
                  ))}
                </>
              )}

              {mistake ? (
                <div className="hint" style={{ marginTop: 12 }}>
                  <div className="rung">Spotted in your code</div>
                  <Markdown source={mistake.hint} />
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      {showFailure ? (
        <FailureModal
          onCancel={() => setShowFailure(false)}
          onPick={(mode) => finish(false, mode)}
        />
      ) : null}
    </>
  );
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

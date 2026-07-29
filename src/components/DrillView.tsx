import { useMemo, useState } from "react";
import type { Drill } from "../types";
import Markdown from "./Markdown";
import ApproachDrillView from "./ApproachDrillView";

const KIND_LABEL: Record<Drill["kind"], string> = {
  "predict-output": "Predict the output",
  "api-recall": "API recall",
  "type-it-out": "Type it out",
  complexity: "Complexity",
  "pattern-id": "Name the pattern",
  approach: "Approach",
};

function normalize(text: string): string {
  return text
    .trim()
    .replace(/\s+/g, " ")
    .replace(/['"]/g, '"')
    .replace(/;+$/, "")
    .replace(/\s*([(),{}=>])\s*/g, "$1");
}

/** Common-prefix / common-suffix diff. Cheap, and it points at the exact
 *  character where memory failed — which is the whole feedback signal. */
function diffParts(actual: string, expected: string) {
  let head = 0;
  while (
    head < actual.length &&
    head < expected.length &&
    actual[head] === expected[head]
  ) {
    head++;
  }
  let tail = 0;
  while (
    tail < actual.length - head &&
    tail < expected.length - head &&
    actual[actual.length - 1 - tail] === expected[expected.length - 1 - tail]
  ) {
    tail++;
  }
  return {
    head: expected.slice(0, head),
    mine: actual.slice(head, actual.length - tail),
    theirs: expected.slice(head, expected.length - tail),
    tail: expected.slice(expected.length - tail),
  };
}

export default function DrillView({
  drill,
  onDone,
}: {
  drill: Drill;
  onDone: (correct: boolean) => void;
}) {
  // Approach drills have their own multi-step shape and no editor.
  if (drill.kind === "approach") {
    return <ApproachDrillView drill={drill} onDone={onDone} />;
  }
  return <SimpleDrill drill={drill} onDone={onDone} />;
}

function SimpleDrill({
  drill,
  onDone,
}: {
  drill: Exclude<Drill, { kind: "approach" }>;
  onDone: (correct: boolean) => void;
}) {
  const [picked, setPicked] = useState<number | null>(null);
  const [typed, setTyped] = useState("");
  const [checked, setChecked] = useState(false);

  const correct = useMemo(() => {
    if (drill.kind === "type-it-out")
      return normalize(typed) === normalize(drill.target);
    if (drill.kind === "api-recall")
      return [drill.answer, ...drill.accept].some(
        (a) => normalize(a) === normalize(typed),
      );
    return picked === drill.answer;
  }, [drill, picked, typed]);

  const revealed = checked || picked !== null;

  return (
    <div className="drill">
      <div className="step-kind">
        {KIND_LABEL[drill.kind]} · {drill.estimatedSeconds}s
      </div>

      <div style={{ fontSize: 16.5, margin: "10px 0 4px" }}>
        <Markdown source={drill.prompt} />
      </div>

      {"code" in drill && drill.code ? (
        <pre>
          <code>{drill.code}</code>
        </pre>
      ) : null}

      {drill.kind === "type-it-out" || drill.kind === "api-recall" ? (
        <>
          <input
            className="answer"
            value={typed}
            autoFocus
            spellCheck={false}
            autoComplete="off"
            placeholder="From memory…"
            disabled={checked}
            onChange={(e) => setTyped(e.target.value)}
            onPaste={(e) => e.preventDefault()}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !checked && typed.trim()) setChecked(true);
            }}
          />
          {!checked ? (
            <div className="row" style={{ marginTop: 12 }}>
              <button
                className="primary"
                disabled={!typed.trim()}
                onClick={() => setChecked(true)}
              >
                Check
              </button>
              <span className="tiny dim">Enter to submit. Paste is off.</span>
            </div>
          ) : null}
        </>
      ) : (
        <div className="choices">
          {drill.choices.map((choice, index) => {
            const cls =
              picked === null
                ? ""
                : index === drill.answer
                  ? "correct"
                  : index === picked
                    ? "wrong"
                    : "";
            return (
              <button
                key={choice}
                className={`choice ${cls}`}
                disabled={picked !== null}
                onClick={() => setPicked(index)}
              >
                {choice}
              </button>
            );
          })}
        </div>
      )}

      {revealed ? (
        <>
          <div
            style={{
              marginTop: 16,
              fontWeight: 650,
              color: correct ? "var(--pass)" : "var(--fail)",
            }}
          >
            {correct ? "Correct" : "Not quite"}
          </div>

          {!correct && drill.kind === "type-it-out" ? (
            <DiffBlock actual={typed} expected={drill.target} />
          ) : null}
          {!correct && drill.kind === "api-recall" ? (
            <div className="diff" style={{ marginTop: 10 }}>
              {drill.answer}
            </div>
          ) : null}

          <div className="explain">{drill.explanation}</div>

          <button className="primary" onClick={() => onDone(correct)}>
            Continue
          </button>
        </>
      ) : null}
    </div>
  );
}

function DiffBlock({ actual, expected }: { actual: string; expected: string }) {
  const parts = diffParts(actual.trim(), expected);
  return (
    <div style={{ marginTop: 10 }}>
      <div className="tiny dim" style={{ marginBottom: 5 }}>
        You wrote — the underlined part is where it diverged
      </div>
      <div className="diff">
        <span className="ok">{parts.head}</span>
        <span className="bad">{parts.mine || "␀"}</span>
        <span className="ok">{parts.tail}</span>
      </div>
      <div className="tiny dim" style={{ margin: "10px 0 5px" }}>
        Expected
      </div>
      <div className="diff">{expected}</div>
    </div>
  );
}

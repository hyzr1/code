import { useMemo, useRef, useState } from "react";
import type { Drill, Progress } from "../types";
import {
  buildSession,
  remediate,
  type Remediation,
  type SessionStep,
} from "../engine/scheduler";
import { gradeAttempt, recordReview } from "../engine/mastery";
import { logAttempt, recordSessionTime, todayKey } from "../engine/storage";
import AtomView from "./AtomView";
import DrillView from "./DrillView";
import ProblemView, { type ProblemOutcome } from "./ProblemView";
import type { LectureOutcome } from "./LectureCheck";
import { useSettings } from "../settings";
import { weeksUntil } from "../content/tracks";
import { ACTIVE_SWE_PREPARATION_LEVEL, trackForCourse } from "../content/courses";

export default function SessionView({
  progress,
  commit,
  onExit,
}: {
  progress: Progress;
  commit: (mutate: (draft: Progress) => void) => void;
  onExit: () => void;
}) {
  const { settings } = useSettings();
  const now = Date.now();
  const initial = useMemo(
    () => buildSession(progress, now, todayKey(now), settings.learning.language, {
      track: trackForCourse(
        settings.learning.course,
        settings.learning.course === "swe" ? ACTIVE_SWE_PREPARATION_LEVEL : undefined,
      ),
      experience: settings.profile.experience,
      deadlineWeeks: weeksUntil(settings.profile.interviewDate),
      preparationLevel: settings.learning.course === "swe"
        ? ACTIVE_SWE_PREPARATION_LEVEL
        : undefined,
    }),
    // Built once per session on purpose — a queue that reshuffles under you
    // mid-session is disorienting and breaks the interleaving guarantee.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const [steps, setSteps] = useState<SessionStep[]>(initial.steps);
  const [index, setIndex] = useState(0);
  const [remediation, setRemediation] = useState<Remediation | null>(null);
  const [tally, setTally] = useState({
    right: 0,
    wrong: 0,
    seconds: 0,
    lectures: 0,
  });
  const startedAt = useRef(Date.now());

  const step = steps[index];

  const advance = () => setIndex((i) => i + 1);

  const onDrillDone = (drill: Drill, correct: boolean) => {
    commit((draft) => {
      recordReview(draft, drill.teaches, correct ? "good" : "again", Date.now());
      logAttempt(draft, {
        at: Date.now(),
        unitId: drill.id,
        unitKind: "drill",
        passed: correct,
        hintsUsed: 0,
        docsOpened: 0,
        seconds: drill.estimatedSeconds,
      });
      recordSessionTime(draft, drill.estimatedSeconds, 1);
    });
    setTally((t) => ({
      ...t,
      right: t.right + (correct ? 1 : 0),
      wrong: t.wrong + (correct ? 0 : 1),
      seconds: t.seconds + drill.estimatedSeconds,
    }));
    advance();
  };

  const onAtomDone = (atomId: string, teaches: string[], seconds: number, outcome: LectureOutcome) => {
    commit((draft) => {
      recordReview(
        draft,
        teaches,
        outcome.score >= 85 ? "good" : outcome.score >= 60 ? "hard" : "again",
        Date.now(),
      );
      draft.lectureReviews.push({ at: Date.now(), atomId, ...outcome });
      if (draft.lectureReviews.length > 2000) draft.lectureReviews.splice(0, draft.lectureReviews.length - 2000);
      recordSessionTime(draft, seconds, 1);
    });
    setTally((t) => ({ ...t, lectures: t.lectures + 1, seconds: t.seconds + seconds }));
    advance();
  };

  const onProblemDone = (outcome: ProblemOutcome) => {
    if (step?.kind !== "problem") return;
    const problem = step.problem;

    let plan: Remediation | null = null;

    commit((draft) => {
      const grade = gradeAttempt({
        passed: outcome.passed,
        level: outcome.level,
        hintsUsed: outcome.hintsUsed,
        seconds: outcome.seconds,
        estimatedSeconds: problem.estimatedMinutes * 60,
      });

      recordReview(draft, problem.teaches, grade, Date.now());

      if (outcome.passed) {
        const order = ["L1", "L2", "L3", "L4"];
        const previous = draft.cleared[problem.id];
        if (!previous || order.indexOf(outcome.level) > order.indexOf(previous)) {
          draft.cleared[problem.id] = outcome.level;
        }
      }

      logAttempt(draft, {
        at: Date.now(),
        unitId: problem.id,
        unitKind: "problem",
        passed: outcome.passed,
        level: outcome.level,
        hintsUsed: outcome.hintsUsed,
        docsOpened: 0,
        seconds: outcome.seconds,
        timeToFirstKeystroke: outcome.timeToFirstKeystroke,
        failureMode: outcome.failureMode,
        predicted: outcome.predicted,
      });
      recordSessionTime(draft, outcome.seconds, 1);

      if (!outcome.passed && outcome.failureMode) {
        plan = remediate(draft, problem, outcome.failureMode, Date.now());
      }
    });

    setTally((t) => ({
      ...t,
      right: t.right + (outcome.passed ? 1 : 0),
      wrong: t.wrong + (outcome.passed ? 0 : 1),
      seconds: t.seconds + outcome.seconds,
    }));

    if (plan) setRemediation(plan);
    else advance();
  };

  // ------------------------------------------------------- remediation
  if (remediation) {
    const plan: Remediation = remediation;
    return (
      <div className="atom">
        <div className="step-kind">What to do about it</div>
        <h1 style={{ fontSize: 25 }}>{plan.headline}</h1>
        <p className="muted" style={{ fontSize: 16 }}>
          {plan.detail}
        </p>

        <div className="card">
          <h2 className="section">Queued for you</h2>
          {plan.steps.length ? (
            plan.steps.map((queued, i) => (
              <div className="row" key={i} style={{ gap: 10, padding: "5px 0" }}>
                <span className="tiny dim" style={{ fontFamily: "var(--mono)" }}>
                  {queued.kind === "drill"
                    ? queued.drill.kind
                    : queued.kind === "atom"
                      ? "lecture"
                      : "problem"}
                </span>
                <span className="small">
                  {queued.kind === "drill"
                    ? (queued.drill.kind === "approach"
                        ? queued.drill.title
                        : queued.drill.prompt
                      ).slice(0, 70)
                    : queued.kind === "atom"
                      ? queued.atom.title
                      : `${queued.problem.title} · ${queued.level}`}
                </span>
              </div>
            ))
          ) : (
            <p className="muted small" style={{ margin: 0 }}>
              Nothing extra — the concept is already back in the queue for
              tomorrow.
            </p>
          )}
        </div>

        <div className="row">
          <button
            className="primary"
            onClick={() => {
              setSteps((current) => [
                ...current.slice(0, index + 1),
                ...plan.steps,
                ...current.slice(index + 1),
              ]);
              setRemediation(null);
              advance();
            }}
          >
            Do it now
          </button>
          <button
            className="ghost"
            onClick={() => {
              setRemediation(null);
              advance();
            }}
          >
            Later
          </button>
        </div>
      </div>
    );
  }

  // ------------------------------------------------------------- done
  if (!step) {
    const graded = tally.right + tally.wrong;
    const accuracy = graded ? Math.round((tally.right / graded) * 100) : null;
    const elapsed = Math.round((Date.now() - startedAt.current) / 60000);

    return (
      <div className="atom">
        <div className="step-kind">Session complete</div>
        <h1>{accuracy !== null && accuracy >= 80 ? "Good session." : "Done."}</h1>

        <div className="stat-grid" style={{ marginTop: 20 }}>
          <div className="stat">
            <div className="value">{graded + tally.lectures}</div>
            <div className="label">Units</div>
          </div>
          <div className="stat">
            <div className="value">{accuracy === null ? "—" : `${accuracy}%`}</div>
            <div className="label">First-try correct</div>
          </div>
          <div className="stat">
            <div className="value">{Math.max(1, elapsed)}m</div>
            <div className="label">Time</div>
          </div>
          <div className="stat">
            <div className="value">{tally.wrong}</div>
            <div className="label">Coming back sooner</div>
          </div>
        </div>

        <p className="muted" style={{ fontSize: 15.5, maxWidth: "60ch" }}>
          {tally.wrong > 0
            ? `The ${tally.wrong} you missed have been rescheduled to the front of the queue. The ones you got right moved further out — that widening gap is the whole mechanism.`
            : "Everything you touched moved to a longer interval. Nothing here is scheduled again until it's about to slip."}
        </p>

        <div className="row" style={{ marginTop: 18 }}>
          <button className="primary" onClick={onExit}>
            Back to progress
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="progress-strip">
        {steps.map((_, i) => (
          <i
            key={i}
            className={i < index ? "done" : i === index ? "current" : ""}
          />
        ))}
      </div>

      <div className="row spread" style={{ marginBottom: 18 }}>
        <span className="tiny dim">
          {index + 1} of {steps.length} · ~{initial.estimate} min
        </span>
        <button className="ghost tiny" onClick={onExit}>
          End session
        </button>
      </div>

      {step.kind === "atom" ? (
        <AtomView
          key={step.atom.id}
          atom={step.atom}
          onDone={(outcome) => onAtomDone(step.atom.id, step.atom.teaches, step.atom.readingSeconds, outcome)}
        />
      ) : step.kind === "drill" ? (
        <DrillView
          key={step.drill.id + index}
          drill={step.drill}
          onDone={(correct) => onDrillDone(step.drill, correct)}
        />
      ) : (
        <ProblemView
          key={step.problem.id + step.level + index}
          problem={step.problem}
          level={step.level}
          onDone={onProblemDone}
        />
      )}
    </>
  );
}

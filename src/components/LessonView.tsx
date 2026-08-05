import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { Drill, Lesson, Problem, Progress } from "../types";
import { ATOM_BY_ID, DRILL_BY_ID, PROBLEM_BY_ID } from "../content";
import { gradeAttempt, recordReview } from "../engine/mastery";
import { logAttempt, recordSessionTime } from "../engine/storage";
import AtomView, { type AtomMode } from "./AtomView";
import DrillView from "./DrillView";
import RepView, { type RepOutcome } from "./RepView";
import ProblemView, { type ProblemOutcome } from "./ProblemView";
import type { LectureOutcome } from "./LectureCheck";
import Icon from "./Icon";
import WatchView from "./WatchView";

type Step =
  | { kind: "atom"; atomId: string }
  | { kind: "drill"; drill: Drill }
  | { kind: "rep"; problem: Problem }
  | { kind: "problem"; problem: Problem };

export default function LessonView({
  lesson,
  progress,
  commit,
  onExit,
  onNext,
  hasNext,
}: {
  lesson: Lesson;
  progress: Progress;
  commit: (mutate: (draft: Progress) => void) => void;
  onExit: () => void;
  onNext: () => void;
  hasNext: boolean;
}) {
  const steps = useMemo<Step[]>(() => {
    const out: Step[] = [];
    if (lesson.atomId && ATOM_BY_ID.has(lesson.atomId)) {
      out.push({ kind: "atom", atomId: lesson.atomId });
    }
    for (const id of lesson.drillIds ?? []) {
      const drill = DRILL_BY_ID.get(id);
      if (drill) out.push({ kind: "drill", drill });
    }
    for (const id of lesson.repIds) {
      const problem = PROBLEM_BY_ID.get(id);
      if (problem) out.push({ kind: "rep", problem });
    }
    for (const id of lesson.problemIds) {
      const problem = PROBLEM_BY_ID.get(id);
      if (problem) out.push({ kind: "problem", problem });
    }
    return out;
  }, [lesson]);

  const [index, setIndex] = useState(0);
  const [nativeFullscreen, setNativeFullscreen] = useState(false);
  const [fallbackFullscreen, setFallbackFullscreen] = useState(false);
  const [atomMode, setAtomMode] = useState<AtomMode>("watch");
  const [reviewOpen, setReviewOpen] = useState(false);
  const workspaceRef = useRef<HTMLDivElement>(null);
  const step = steps[index];
  const lessonAtom = lesson.atomId ? ATOM_BY_ID.get(lesson.atomId) : undefined;
  const isFullscreen = nativeFullscreen || fallbackFullscreen;
  const advance = () => setIndex((i) => i + 1);

  const toggleFullscreen = useCallback(async () => {
    const workspace = workspaceRef.current;
    const target = workspace?.closest("main") as HTMLElement | null ?? workspace;
    if (!target) return;
    if (fallbackFullscreen) {
      setFallbackFullscreen(false);
      return;
    }
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else if (document.fullscreenEnabled && target.requestFullscreen) {
        await target.requestFullscreen({ navigationUI: "hide" });
      } else {
        setFallbackFullscreen(true);
      }
    } catch {
      // iOS browsers and some embedded browsers reject the native API. The
      // app-level focus mode still gives the lesson the whole visible screen.
      setFallbackFullscreen(true);
    }
  }, [fallbackFullscreen]);

  const leaveLesson = useCallback(() => {
    setFallbackFullscreen(false);
    if (document.fullscreenElement) {
      void document.exitFullscreen().then(onExit, onExit);
    } else {
      onExit();
    }
  }, [onExit]);

  useEffect(() => {
    const sync = () => {
      const workspace = workspaceRef.current;
      const fullscreen = document.fullscreenElement;
      setNativeFullscreen(Boolean(
        fullscreen && workspace &&
        (fullscreen === workspace || fullscreen.contains(workspace)),
      ));
    };
    sync();
    document.addEventListener("fullscreenchange", sync);
    return () => document.removeEventListener("fullscreenchange", sync);
  }, []);

  useEffect(() => {
    const main = workspaceRef.current?.closest("main");
    main?.classList.toggle("lesson-fullscreen-fallback", fallbackFullscreen);
    document.documentElement.classList.toggle("lesson-focus-active", fallbackFullscreen);
    return () => {
      main?.classList.remove("lesson-fullscreen-fallback");
      document.documentElement.classList.remove("lesson-focus-active");
    };
  }, [fallbackFullscreen]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target;
      const editing =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement ||
        (target instanceof HTMLElement && target.isContentEditable);
      if (!editing && event.key === "Escape" && reviewOpen) {
        event.preventDefault();
        setReviewOpen(false);
        return;
      }
      if (!editing && event.key === "Escape" && fallbackFullscreen) {
        event.preventDefault();
        setFallbackFullscreen(false);
        return;
      }
      if (!editing && event.key.toLocaleLowerCase() === "f") {
        event.preventDefault();
        void toggleFullscreen();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [fallbackFullscreen, reviewOpen, toggleFullscreen]);

  const reps = steps.filter((s) => s.kind === "rep");
  const repIndex = steps.slice(0, index).filter((s) => s.kind === "rep").length;

  const record = (
    problem: Problem,
    outcome: { passed: boolean; hintsUsed: number; seconds: number },
  ) => {
    commit((draft) => {
      const grade = gradeAttempt({
        passed: outcome.passed,
        level: "L4",
        hintsUsed: outcome.hintsUsed,
        seconds: outcome.seconds,
        estimatedSeconds: problem.estimatedMinutes * 60,
      });
      recordReview(draft, problem.teaches, grade, Date.now());

      // Marked done either way so the course can move on. A failed rep is
      // still scheduled to come back — that's the memory model's job, not
      // a locked door's.
      draft.cleared[problem.id] = outcome.passed
        ? outcome.hintsUsed > 0
          ? "L3"
          : "L4"
        : "L1";

      logAttempt(draft, {
        at: Date.now(),
        unitId: problem.id,
        unitKind: "problem",
        passed: outcome.passed,
        level: "L4",
        hintsUsed: outcome.hintsUsed,
        docsOpened: 0,
        seconds: outcome.seconds,
      });
      recordSessionTime(draft, outcome.seconds, 1);
    });
  };

  const onRepDone = (problem: Problem, outcome: RepOutcome) => {
    record(problem, outcome);
    advance();
  };

  const onProblemDone = (problem: Problem, outcome: ProblemOutcome) => {
    record(problem, {
      passed: outcome.passed,
      hintsUsed: outcome.hintsUsed,
      seconds: outcome.seconds,
    });
    advance();
  };

  const onDrillDone = (drill: Drill, correct: boolean) => {
    commit((draft) => {
      recordReview(draft, drill.teaches, correct ? "good" : "again", Date.now());
      draft.cleared[drill.id] = correct ? "L4" : "L1";
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
    advance();
  };

  const onAtomDone = (atomId: string, outcome: LectureOutcome) => {
    const atom = ATOM_BY_ID.get(atomId);
    if (atom) {
      commit((draft) => {
        recordReview(
          draft,
          atom.teaches,
          outcome.score >= 85 ? "good" : outcome.score >= 60 ? "hard" : "again",
          Date.now(),
        );
        draft.lectureReviews.push({ at: Date.now(), atomId, ...outcome });
        if (draft.lectureReviews.length > 2000) draft.lectureReviews.splice(0, draft.lectureReviews.length - 2000);
        recordSessionTime(draft, atom.readingSeconds, 1);
      });
    }
    advance();
  };

  const manualComplete = progress.manualComplete?.[lesson.id] === true;
  const toggleComplete = () => {
    commit((draft) => {
      if (draft.manualComplete[lesson.id]) delete draft.manualComplete[lesson.id];
      else draft.manualComplete[lesson.id] = true;
    });
  };

  if (!step) {
    return (
      <div
        className={`lesson-workspace ${isFullscreen ? "is-fullscreen" : ""}`}
        ref={workspaceRef}
      >
      <div className="row spread lesson-workspace-bar">
        <span className="tiny dim lesson-workspace-title">Course workspace</span>
        <button className="ghost tiny fullscreen-toggle" onClick={() => void toggleFullscreen()}>
          <Icon name={isFullscreen ? "minimize" : "maximize"} size={16} />
          <span>{isFullscreen ? "Exit fullscreen" : "Fullscreen"}</span>
        </button>
      </div>
      <div className="atom">
        <div className="step-kind">Lesson complete</div>
        <h1>{lesson.title}</h1>
        <p className="muted" style={{ fontSize: 16.5 }}>
          {lesson.goal}
        </p>
        <p className="small dim">
          Everything here is now scheduled to come back — spaced out, mixed in
          with other topics. That's the part that makes it stick.
        </p>
        <div className="row lesson-complete-actions" style={{ marginTop: 20 }}>
          {hasNext ? (
            <button className="primary" onClick={onNext}>
              Next lesson
            </button>
          ) : null}
          <button className="ghost" onClick={leaveLesson}>
            Back to the course
          </button>
          <button
            className={`ghost ${manualComplete ? "on" : ""}`}
            onClick={toggleComplete}
            aria-pressed={manualComplete}
          >
            {manualComplete ? "✓ Marked complete" : "Mark lesson complete"}
          </button>
        </div>
      </div>
      </div>
    );
  }

  return (
    <div
      className={`lesson-workspace ${isFullscreen ? "is-fullscreen" : ""}`}
      ref={workspaceRef}
    >
      <div className="progress-strip">
        {steps.map((_, i) => (
          <i key={i} className={i < index ? "done" : i === index ? "current" : ""} />
        ))}
      </div>

      <div className="row spread lesson-workspace-bar" style={{ marginBottom: 18 }}>
        <span className="tiny dim lesson-workspace-title">
          {lesson.title} · step {index + 1} of {steps.length}
        </span>
        <div className="row lesson-workspace-actions">
          <button
            className={`ghost tiny ${manualComplete ? "on" : ""}`}
            onClick={toggleComplete}
            title={manualComplete ? "Marked complete — click to undo" : "Mark this lesson complete"}
            aria-pressed={manualComplete}
          >
            {manualComplete ? "✓ Completed" : "Mark complete"}
          </button>
          {!(step.kind === "atom" && atomMode === "watch") ? (
            <button className="ghost tiny fullscreen-toggle" onClick={() => void toggleFullscreen()}>
              <Icon name={isFullscreen ? "minimize" : "maximize"} size={16} />
              <span>{isFullscreen ? "Exit fullscreen" : "Fullscreen"}</span>
            </button>
          ) : null}
          <button className="ghost tiny" onClick={leaveLesson}>
            Leave lesson
          </button>
        </div>
      </div>

      {step.kind === "atom" ? (
        <AtomView
          key={step.atomId}
          atom={ATOM_BY_ID.get(step.atomId)!}
          onDone={(outcome) => onAtomDone(step.atomId, outcome)}
          isFullscreen={isFullscreen}
          onToggleFullscreen={() => void toggleFullscreen()}
          onModeChange={setAtomMode}
          onRequestReview={() => setReviewOpen(true)}
        />
      ) : step.kind === "drill" ? (
        <DrillView
          key={step.drill.id}
          drill={step.drill}
          onDone={(correct) => onDrillDone(step.drill, correct)}
        />
      ) : step.kind === "rep" ? (
        <RepView
          key={step.problem.id}
          problem={step.problem}
          index={repIndex}
          total={reps.length}
          onDone={(outcome) => onRepDone(step.problem, outcome)}
          onReviewLesson={lessonAtom ? () => setReviewOpen(true) : undefined}
        />
      ) : (
        <ProblemView
          key={step.problem.id}
          problem={step.problem}
          level={progress.cleared[step.problem.id] ? "L4" : "L2"}
          onDone={(outcome) => onProblemDone(step.problem, outcome)}
          onReviewLesson={lessonAtom ? () => setReviewOpen(true) : undefined}
        />
      )}

      {reviewOpen && lessonAtom ? createPortal(
        <div
          className="lesson-review-overlay"
          role="dialog"
          aria-modal="true"
          aria-label={`Review ${lesson.title}`}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setReviewOpen(false);
          }}
        >
          <div className="lesson-review-modal">
            <div className="row spread lesson-review-header">
              <div>
                <div className="label">Lesson reference</div>
                <strong>{lesson.title}</strong>
              </div>
              <button
                className="ghost small"
                onClick={() => setReviewOpen(false)}
                aria-label="Close lesson review"
              >
                <Icon name="x" size={17} />
                Close
              </button>
            </div>
            <WatchView
              key={`${lessonAtom.id}-review`}
              atom={lessonAtom}
              onDone={() => setReviewOpen(false)}
              isFullscreen={false}
              reviewMode
            />
          </div>
        </div>,
        document.fullscreenElement ?? document.body,
      ) : null}
    </div>
  );
}

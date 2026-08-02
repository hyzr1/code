import { useCallback, useEffect, useState } from "react";
import type { Progress } from "./types";
import {
  CONCEPT_BY_ID,
  LESSON_BY_ID,
  PROBLEM_BY_ID,
  lessonsFor,
} from "./content";
import {
  loadProgress,
  logAttempt,
  recordSessionTime,
  saveProgress,
} from "./engine/storage";
import { gradeAttempt, recordReview } from "./engine/mastery";
import { nextLevel } from "./engine/scheduler";
import Sidebar, { type Route } from "./components/Sidebar";
import Icon from "./components/Icon";
import { MOBILE, useMediaQuery } from "./hooks";
import CourseView from "./components/CourseView";
import LessonView from "./components/LessonView";
import ProblemsView from "./components/ProblemsView";
import Dashboard from "./components/Dashboard";
import SessionView from "./components/SessionView";
import Settings from "./components/Settings";
import CommandPalette from "./components/CommandPalette";
import ConceptView from "./components/ConceptView";
import ProblemView, { type ProblemOutcome } from "./components/ProblemView";
import { useSettings } from "./settings";
import OnboardingTour, { hasSeenOnboarding } from "./components/OnboardingTour";
import TypeHome from "./components/typing/TypeHome";
import TypeCourse from "./components/typing/TypeCourse";
import TypeLesson from "./components/typing/TypeLesson";
import SpeedTest from "./components/typing/SpeedTest";

const TITLES: Record<Route["name"], string> = {
  course: "Course",
  lesson: "Course",
  problems: "Problems",
  problem: "Problems",
  session: "Daily session",
  progress: "Progress",
  concept: "Progress",
  type: "Type",
  typeCourse: "Type",
  typeLesson: "Type",
  typeTest: "Type",
};

export default function App() {
  const { update } = useSettings();
  const [progress, setProgress] = useState<Progress>(() => loadProgress());
  const [route, setRoute] = useState<Route>({ name: "course" });
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [tourOpen, setTourOpen] = useState(() => !hasSeenOnboarding());

  const isMobile = useMediaQuery(MOBILE);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const startTour = useCallback(() => {
    setSettingsOpen(false);
    setPaletteOpen(false);
    update("appearance", { sidebarCollapsed: false });
    if (isMobile) setDrawerOpen(true);
    setTourOpen(true);
  }, [isMobile, update]);

  useEffect(() => {
    if (!tourOpen) return;
    if (isMobile) setDrawerOpen(true);
  }, [isMobile, tourOpen]);

  // Navigating on a phone should always dismiss the drawer — leaving it open
  // over the page you just asked for is the classic mobile-nav mistake.
  useEffect(() => {
    if (!tourOpen) setDrawerOpen(false);
  }, [route, tourOpen]);
  useEffect(() => {
    if (!isMobile) setDrawerOpen(false);
  }, [isMobile]);

  useEffect(() => {
    saveProgress(progress);
  }, [progress]);

  // ⌘K / Ctrl+K anywhere; Escape closes whatever is on top.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPaletteOpen((open) => !open);
        return;
      }
      if (event.key === "Escape") {
        if (paletteOpen) setPaletteOpen(false);
        else if (settingsOpen) setSettingsOpen(false);
        else if (drawerOpen) setDrawerOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drawerOpen, paletteOpen, settingsOpen]);

  const commit = useCallback((mutate: (draft: Progress) => void) => {
    setProgress((current) => {
      const draft: Progress = {
        concepts: { ...current.concepts },
        cleared: { ...current.cleared },
        attempts: current.attempts.slice(),
        sessions: current.sessions.map((s) => ({ ...s })),
        lectureReviews: current.lectureReviews.slice(),
        manualComplete: { ...current.manualComplete },
      };
      mutate(draft);
      return draft;
    });
  }, []);

  const onPracticeDone = (problemId: string, outcome: ProblemOutcome) => {
    const problem = PROBLEM_BY_ID.get(problemId);
    if (problem) {
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
      });
    }
    setRoute({ name: "problems" });
  };

  const lesson = route.name === "lesson" ? LESSON_BY_ID.get(route.id) : null;
  const crumb =
    route.name === "lesson" && lesson
      ? lesson.title
      : route.name === "problem"
        ? (PROBLEM_BY_ID.get(route.id)?.title ?? "")
        : route.name === "concept"
          ? (CONCEPT_BY_ID.get(route.id)?.title ?? "")
          : "";

  return (
    <div className={`shell ${isMobile ? "mobile" : ""}`}>
      <Sidebar
        route={route}
        go={setRoute}
        progress={progress}
        onSettings={() => setSettingsOpen(true)}
        onSearch={() => setPaletteOpen(true)}
        onTour={startTour}
        onClose={() => setDrawerOpen(false)}
        mobile={isMobile}
        open={drawerOpen}
      />

      {isMobile && drawerOpen ? (
        <button className="scrim" onClick={() => setDrawerOpen(false)} aria-label="Close navigation" />
      ) : null}

      <main className="main">
        {isMobile || crumb ? (
          <header className="topbar">
            {isMobile ? (
              <button
                className="ghost icon"
                onClick={() => setDrawerOpen(true)}
                aria-label="Open menu"
                aria-controls="app-navigation"
                aria-expanded={drawerOpen}
              >
                <Icon name="menu" size={18} />
              </button>
            ) : null}

            {crumb ? (
              <button
                className="ghost small"
                onClick={() =>
                  setRoute(
                    route.name === "lesson"
                      ? { name: "course" }
                      : route.name === "concept"
                        ? { name: "progress" }
                        : { name: "problems" },
                  )
                }
              >
                <Icon name="arrowLeft" size={15} />
                {!isMobile ? TITLES[route.name] : null}
              </button>
            ) : null}

            <span className="crumb">{crumb || TITLES[route.name]}</span>

            {isMobile ? (
              <button
                className="ghost icon"
                style={{ marginLeft: "auto" }}
                onClick={() => setPaletteOpen(true)}
                aria-label="Search"
              >
                <Icon name="search" size={18} />
              </button>
            ) : null}
          </header>
        ) : null}

        <div className="route" key={`${route.name}-${"id" in route ? route.id : ""}`}>
        {route.name === "course" ? (
          <div className="page">
            <CourseView
              progress={progress}
              onOpen={(id) => setRoute({ name: "lesson", id })}
              onToggleComplete={(id) =>
                commit((draft) => {
                  if (draft.manualComplete[id]) delete draft.manualComplete[id];
                  else draft.manualComplete[id] = true;
                })
              }
            />
          </div>
        ) : route.name === "lesson" ? (
          <div className="page">
            <LessonRoute
              id={route.id}
              progress={progress}
              commit={commit}
              onExit={() => setRoute({ name: "course" })}
              onOpen={(id) => setRoute({ name: "lesson", id })}
            />
          </div>
        ) : route.name === "problems" ? (
          <ProblemsView
            progress={progress}
            onOpen={(id) => setRoute({ name: "problem", id })}
          />
        ) : route.name === "progress" ? (
          <div className="page">
            <Dashboard
              progress={progress}
              onStart={() => setRoute({ name: "session" })}
              onConcept={(id) => setRoute({ name: "concept", id })}
            />
          </div>
        ) : route.name === "concept" ? (
          <ConceptView
            id={route.id}
            progress={progress}
            onProblem={(id) => setRoute({ name: "problem", id })}
            onLesson={(id) => setRoute({ name: "lesson", id })}
          />
        ) : route.name === "session" ? (
          <div className="page">
            <SessionView
              progress={progress}
              commit={commit}
              onExit={() => setRoute({ name: "progress" })}
            />
          </div>
        ) : route.name === "type" ? (
          <div className="page">
            <TypeHome
              onCourse={() => setRoute({ name: "typeCourse" })}
              onTest={() => setRoute({ name: "typeTest" })}
              onOpenLesson={(id) => setRoute({ name: "typeLesson", id })}
            />
          </div>
        ) : route.name === "typeCourse" ? (
          <div className="page">
            <TypeCourse onOpen={(id) => setRoute({ name: "typeLesson", id })} />
          </div>
        ) : route.name === "typeLesson" ? (
          <div className="page">
            <TypeLesson
              lessonId={route.id}
              onExit={() => setRoute({ name: "typeCourse" })}
              onOpenLesson={(id) => setRoute({ name: "typeLesson", id })}
            />
          </div>
        ) : route.name === "typeTest" ? (
          <div className="page">
            <SpeedTest />
          </div>
        ) : (
          <div className="page">
            <PracticeProblem
              id={route.id}
              progress={progress}
              onDone={(outcome) => onPracticeDone(route.id, outcome)}
            />
          </div>
        )}
        </div>
      </main>

      {settingsOpen ? (
        <Settings
          progress={progress}
          onProgress={setProgress}
          onClose={() => setSettingsOpen(false)}
          onReplayTour={startTour}
        />
      ) : null}

      {paletteOpen ? (
        <CommandPalette
          progress={progress}
          go={setRoute}
          onSettings={() => setSettingsOpen(true)}
          onClose={() => setPaletteOpen(false)}
        />
      ) : null}

      <OnboardingTour open={tourOpen} onClose={() => setTourOpen(false)} />
    </div>
  );
}

function LessonRoute({
  id,
  progress,
  commit,
  onExit,
  onOpen,
}: {
  id: string;
  progress: Progress;
  commit: (mutate: (draft: Progress) => void) => void;
  onExit: () => void;
  onOpen: (lessonId: string) => void;
}) {
  const { settings } = useSettings();
  const lesson = LESSON_BY_ID.get(id);
  if (!lesson) return <div className="empty">No such lesson.</div>;

  const lessons = lessonsFor(lesson.language ?? settings.learning.language, settings.profile.track);
  const position = lessons.findIndex((l) => l.id === id);
  const next = lessons[position + 1];

  return (
    <LessonView
      key={lesson.id}
      lesson={lesson}
      progress={progress}
      commit={commit}
      onExit={onExit}
      hasNext={Boolean(next)}
      onNext={() => next && onOpen(next.id)}
    />
  );
}

function PracticeProblem({
  id,
  progress,
  onDone,
}: {
  id: string;
  progress: Progress;
  onDone: (outcome: ProblemOutcome) => void;
}) {
  const problem = PROBLEM_BY_ID.get(id);
  if (!problem) return <div className="empty">No such problem.</div>;
  return (
    <ProblemView
      problem={problem}
      level={nextLevel(progress, problem, Date.now())}
      onDone={onDone}
    />
  );
}

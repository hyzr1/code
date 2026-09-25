import { lazy, Suspense, useCallback, useEffect, useLayoutEffect, useState } from "react";
import type { Course, Progress } from "./types";
import {
  CONCEPT_BY_ID,
  LESSON_BY_ID,
  PROBLEM_BY_ID,
  lessonsForCourse,
} from "./content";
import { ACTIVE_SWE_PREPARATION_LEVEL } from "./content/courses";
import {
  loadProgress,
  logAttempt,
  mergeProgress,
  recordSessionTime,
  saveProgress,
} from "./engine/storage";
import { gradeAttempt, recordReview } from "./engine/mastery";
import { nextLevel } from "./engine/scheduler";
import Sidebar, { type Route } from "./components/Sidebar";
import Icon from "./components/Icon";
import { MOBILE, useMediaQuery } from "./hooks";
import CourseView from "./components/CourseView";
import ProblemsView from "./components/ProblemsView";
import Dashboard from "./components/Dashboard";
import ConceptView from "./components/ConceptView";
import type { ProblemOutcome } from "./components/ProblemView";
import { useSettings } from "./settings";
import OnboardingTour from "./components/OnboardingTour";
import { courseFromPath, pathForRoute, routeFromPath, routeTitle } from "./routing";
import { useAccount } from "./account";
import { trackPageView } from "./monitoring";
import { SYSTEM_DESIGN_BY_ID } from "./content/systemDesign";

const LessonView = lazy(() => import("./components/LessonView"));
const SessionView = lazy(() => import("./components/SessionView"));
const Settings = lazy(() => import("./components/Settings"));
const CommandPalette = lazy(() => import("./components/CommandPalette"));
const ProblemView = lazy(() => import("./components/ProblemView"));
const SystemDesignView = lazy(() => import("./components/SystemDesignView"));
const TypeHome = lazy(() => import("./components/typing/TypeHome"));
const TypeCourse = lazy(() => import("./components/typing/TypeCourse"));
const TypeLesson = lazy(() => import("./components/typing/TypeLesson"));
const SpeedTest = lazy(() => import("./components/typing/SpeedTest"));

const TITLES: Record<Route["name"], string> = {
  course: "Course",
  lesson: "Course",
  problems: "Problems",
  problem: "Problems",
  systemDesign: "Problems",
  session: "Daily session",
  progress: "Progress",
  concept: "Progress",
  type: "Type",
  typeCourse: "Type",
  typeLesson: "Type",
  typeTest: "Type",
};

export default function App() {
  const { settings, update, replaceAll } = useSettings();
  const account = useAccount();
  const [progress, setProgress] = useState<Progress>(() => loadProgress());
  const [cloudReady, setCloudReady] = useState(false);
  const [route, setRoute] = useState<Route>(() => routeFromPath());
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  // The tour remains available from the sidebar, but never interrupts a page
  // refresh or a first visit with a modal.
  const [tourOpen, setTourOpen] = useState(false);

  const isMobile = useMediaQuery(MOBILE);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (account.state !== "authenticated") {
      setCloudReady(false);
      return;
    }
    let active = true;
    void account.pull().then((snapshot) => {
      if (!active) return;
      if (snapshot?.progress) setProgress(current => mergeProgress(current, snapshot.progress));
      if (snapshot?.settings) replaceAll(snapshot.settings);
      setCloudReady(true);
    });
    return () => { active = false; };
  }, [account.state]);

  useEffect(() => {
    if (!cloudReady || account.state !== "authenticated") return;
    const timer = setTimeout(() => { void account.push(progress, settings); }, 1800);
    return () => clearTimeout(timer);
  }, [account.state, cloudReady, progress, settings]);

  const go = useCallback((next: Route, replace = false) => {
    setRoute(next);
    const path = pathForRoute(next, settings.learning.course);
    if (path !== location.pathname) history[replace ? "replaceState" : "pushState"]({}, "", path);
  }, [settings.learning.course]);

  useLayoutEffect(() => {
    const linkedCourse = courseFromPath();
    if (linkedCourse && linkedCourse !== settings.learning.course) {
      update("learning", { course: linkedCourse });
    }
    // The URL is the source of truth only while the initial deep link loads.
    // Course changes after mount update the URL atomically below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const onPopState = () => {
      setRoute(routeFromPath());
      const linkedCourse = courseFromPath();
      if (linkedCourse && linkedCourse !== settings.learning.course) {
        update("learning", { course: linkedCourse });
      }
    };
    addEventListener("popstate", onPopState);
    return () => removeEventListener("popstate", onPopState);
  }, [settings.learning.course, update]);

  const changeCourse = useCallback((course: Course) => {
    const next: Route = { name: "course" };
    const path = pathForRoute(next, course);
    setRoute(next);
    if (path !== location.pathname) history.pushState({}, "", path);
  }, []);

  useEffect(() => {
    if (route.name !== "course" && route.name !== "lesson") return;
    const path = pathForRoute(route, settings.learning.course);
    if (path !== location.pathname) history.replaceState({}, "", path);
  }, [route, settings.learning.course]);

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
    document.querySelector<HTMLElement>(".main")?.scrollTo({ top: 0 });
  }, [route]);
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
    go({ name: "problems" });
  };

  const lesson = route.name === "lesson" ? LESSON_BY_ID.get(route.id) : null;
  const crumb =
    route.name === "lesson" && lesson
      ? lesson.title
      : route.name === "problem"
        ? (PROBLEM_BY_ID.get(route.id)?.title ?? "")
        : route.name === "systemDesign"
          ? (SYSTEM_DESIGN_BY_ID.get(route.id)?.title ?? "")
        : route.name === "concept"
          ? (CONCEPT_BY_ID.get(route.id)?.title ?? "")
          : "";

  useEffect(() => {
    document.title = routeTitle(route, crumb || undefined);
    trackPageView(route.name);
  }, [crumb, route]);

  return (
    <div className={`shell ${isMobile ? "mobile" : ""} ${route.name === "problem" ? "problem-shell" : ""}`}>
      <Sidebar
        route={route}
        go={go}
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
                aria-label={`Back to ${TITLES[route.name]}`}
                onClick={() =>
                  go(
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
            {route.name === "problem" && <div id="practice-command-bar" />}

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

        <Suspense fallback={<RouteLoading />}>
        <div className="route" key={`${route.name}-${"id" in route ? route.id : ""}`}>
        {route.name === "course" ? (
          <div className="page">
            <CourseView
              progress={progress}
              onCourseChange={changeCourse}
              onOpen={(id) => go({ name: "lesson", id })}
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
              onExit={() => go({ name: "course" })}
              onOpen={(id) => go({ name: "lesson", id })}
            />
          </div>
        ) : route.name === "problems" ? (
          <ProblemsView
            progress={progress}
            onOpen={(id) => go({ name: "problem", id })}
            onOpenSystemDesign={(id) => go({ name: "systemDesign", id })}
          />
        ) : route.name === "systemDesign" ? (
          <div className="page system-design-route">
            {SYSTEM_DESIGN_BY_ID.get(route.id) ? <SystemDesignView
              question={SYSTEM_DESIGN_BY_ID.get(route.id)!}
              complete={Boolean(progress.cleared[route.id])}
              onToggleComplete={() => commit(draft => {
                if (draft.cleared[route.id]) delete draft.cleared[route.id];
                else draft.cleared[route.id] = "L3";
              })}
            /> : <div className="empty">No such systems design question.</div>}
          </div>
        ) : route.name === "progress" ? (
          <div className="page">
            <Dashboard
              progress={progress}
              onStart={() => go({ name: "session" })}
              onConcept={(id) => go({ name: "concept", id })}
            />
          </div>
        ) : route.name === "concept" ? (
          <ConceptView
            id={route.id}
            progress={progress}
            onProblem={(id) => go({ name: "problem", id })}
            onLesson={(id) => go({ name: "lesson", id })}
          />
        ) : route.name === "session" ? (
          <div className="page">
            <SessionView
              progress={progress}
              commit={commit}
              onExit={() => go({ name: "progress" })}
            />
          </div>
        ) : route.name === "type" ? (
          <div className="page">
            <TypeHome
              onCourse={() => go({ name: "typeCourse" })}
              onTest={() => go({ name: "typeTest" })}
              onOpenLesson={(id) => go({ name: "typeLesson", id })}
            />
          </div>
        ) : route.name === "typeCourse" ? (
          <div className="page">
            <TypeCourse onOpen={(id) => go({ name: "typeLesson", id })} />
          </div>
        ) : route.name === "typeLesson" ? (
          <div className="page">
            <TypeLesson
              lessonId={route.id}
              onExit={() => go({ name: "typeCourse" })}
              onOpenLesson={(id) => go({ name: "typeLesson", id })}
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
        </Suspense>
      </main>

      <Suspense fallback={null}>
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
          go={go}
          onSettings={() => setSettingsOpen(true)}
          onClose={() => setPaletteOpen(false)}
        />
      ) : null}
      </Suspense>

      <OnboardingTour open={tourOpen} onClose={() => setTourOpen(false)} />
    </div>
  );
}

function RouteLoading() {
  return <div className="route-loading" role="status">Loading workspace…</div>;
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

  const preparationLevel = settings.learning.course === "swe"
    ? ACTIVE_SWE_PREPARATION_LEVEL
    : undefined;
  const lessons = lessonsForCourse(settings.learning.course, preparationLevel);
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

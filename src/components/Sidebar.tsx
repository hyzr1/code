import { useLayoutEffect, useRef, useState } from "react";
import type { Progress } from "../types";
import {
  LESSON_BY_ID,
  PROBLEM_BY_ID,
  currentLessonForCourse,
  lessonsForCourse,
  lessonProgress,
} from "../content";
import { isDue } from "../engine/mastery";
import { conceptIdsFor } from "../engine/scheduler";
import { todayKey } from "../engine/storage";
import { useSettings } from "../settings";
import { ACTIVE_SWE_PREPARATION_LEVEL } from "../content/courses";
import { DayRing, Heatmap, Mark, StreakLabel } from "./Brand";
import Icon, { type IconName } from "./Icon";

export type Route =
  | { name: "course" }
  | { name: "lesson"; id: string }
  | { name: "problems" }
  | { name: "problem"; id: string }
  | { name: "session" }
  | { name: "progress" }
  | { name: "concept"; id: string }
  | { name: "type" }
  | { name: "typeCourse" }
  | { name: "typeLesson"; id: string }
  | { name: "typeTest" };

interface Props {
  route: Route;
  go: (route: Route) => void;
  progress: Progress;
  onSettings: () => void;
  onSearch: () => void;
  onTour: () => void;
  onClose?: () => void;
  mobile?: boolean;
  open?: boolean;
}

export default function Sidebar({
  route,
  go,
  progress,
  onSettings,
  onSearch,
  onTour,
  onClose,
  mobile = false,
  open = false,
}: Props) {
  const { settings, update } = useSettings();
  // The rail is a desktop affordance. On a phone the sidebar is a drawer and
  // is either present or not — a 60px rail there is just lost screen.
  const collapsed = !mobile && settings.appearance.sidebarCollapsed;
  const mode = settings.appearance.mode;
  const language = settings.learning.language;
  const course = settings.learning.course;
  const preparationLevel = course === "swe" ? ACTIVE_SWE_PREPARATION_LEVEL : undefined;
  const lessons = lessonsForCourse(course, preparationLevel);
  const conceptIds = conceptIdsFor(language);

  const switchRef = useRef<HTMLDivElement>(null);
  const learnRef = useRef<HTMLButtonElement>(null);
  const algoRef = useRef<HTMLButtonElement>(null);
  const typeRef = useRef<HTMLButtonElement>(null);
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });

  /**
   * Measured rather than computed — the two labels aren't the same length, so
   * a 50% split sits off-centre.
   *
   * It has to be a ResizeObserver rather than a one-shot measurement: the
   * sidebar animates its width over 180ms, so measuring when the state flips
   * catches the button mid-transition and the pill keeps the stale size. The
   * observer re-measures as the animation runs, and covers window resizes for
   * free.
   */
  useLayoutEffect(() => {
    const measure = () => {
      const active =
        mode === "learn" ? learnRef.current : mode === "algo" ? algoRef.current : typeRef.current;
      if (!active) return;
      setIndicator({ left: active.offsetLeft, width: active.offsetWidth });
    };

    measure();
    const observer = new ResizeObserver(measure);
    if (switchRef.current) observer.observe(switchRef.current);
    return () => observer.disconnect();
  }, [mode, collapsed]);

  const item = (
    active: boolean,
    icon: IconName,
    label: string,
    onClick: () => void,
    count?: number,
    tour?: string,
  ) => (
    <button
      className={`nav-item ${active ? "active" : ""}`}
      onClick={onClick}
      title={collapsed ? label : undefined}
      aria-label={collapsed ? label : undefined}
      aria-current={active ? "page" : undefined}
      data-tour={tour}
    >
      <Icon name={icon} size={19} />
      <span className="label">{label}</span>
      {count ? <span className="nav-count">{count}</span> : null}
    </button>
  );

  // How much is actually due right now — the number that decides whether
  // opening the app today matters.
  const now = Date.now();
  const dueCount = conceptIds.filter((id) =>
    progress.concepts[id] ? isDue(progress.concepts[id], now) : false,
  ).length;

  // Recents are derived from what you actually touched, newest first.
  const recentIds: string[] = [];
  for (let i = progress.attempts.length - 1; i >= 0 && recentIds.length < 5; i--) {
    const attempt = progress.attempts[i];
    const owner =
      mode === "learn"
        ? lessons.find(
            (l) =>
              l.repIds.includes(attempt.unitId) ||
              l.problemIds.includes(attempt.unitId) ||
              (l.drillIds ?? []).includes(attempt.unitId),
          )?.id
        : PROBLEM_BY_ID.get(attempt.unitId)?.tier !== "rep"
          ? attempt.unitId
          : undefined;
    if (owner && !recentIds.includes(owner)) recentIds.push(owner);
  }

  const upNext = currentLessonForCourse(progress, course, preparationLevel);
  const completedLessons = lessons.filter((lesson) => lessonProgress(lesson, progress).complete).length;
  const coursePercent = lessons.length ? Math.round((completedLessons / lessons.length) * 100) : 0;
  const today = progress.sessions.find((session) => session.date === todayKey());
  const todayMinutes = Math.round((today?.seconds ?? 0) / 60);

  return (
    <aside
      id="app-navigation"
      className={`sidebar ${collapsed ? "collapsed" : ""} ${
        mobile ? "drawer" : ""
      } ${mobile && open ? "open" : ""}`}
      aria-hidden={mobile && !open}
      inert={mobile && !open ? true : undefined}
    >
      <div className="sidebar-head">
        <button
          className="brand-lockup brand-home"
          onClick={() =>
            go({ name: mode === "learn" ? "course" : mode === "type" ? "type" : "problems" })
          }
          aria-label="Go to home"
        >
          <Mark size={collapsed ? 20 : 21} />
          {!collapsed ? <div className="wordmark">Hyzr Code</div> : null}
        </button>
        <button
          onClick={() =>
            mobile
              ? onClose?.()
              : update("appearance", { sidebarCollapsed: !collapsed })
          }
          title={mobile ? "Close navigation" : collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-label={mobile ? "Close navigation" : collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="sidebar-toggle"
        >
          <Icon name={mobile ? "x" : collapsed ? "menu" : "panelLeft"} size={17} />
        </button>
      </div>

      <div
        className="mode-switch"
        data-mode={mode}
        role="group"
        aria-label="Mode"
        ref={switchRef}
        data-tour="modes"
      >
        <span
          className="mode-indicator"
          aria-hidden="true"
          style={{
            transform: `translateX(${indicator.left}px)`,
            width: indicator.width,
            visibility: indicator.width ? "visible" : "hidden",
          }}
        />
        <button
          ref={learnRef}
          className={mode === "learn" ? "on" : ""}
          onClick={() => {
            update("appearance", { mode: "learn" });
            go({ name: "course" });
          }}
          title="Learn"
        >
          <Icon name="book" size={16} />
          {!collapsed ? "Learn" : null}
        </button>
        <button
          ref={algoRef}
          className={mode === "algo" ? "on" : ""}
          onClick={() => {
            update("appearance", { mode: "algo" });
            go({ name: "problems" });
          }}
          title="Algo"
        >
          <Icon name="code" size={16} />
          {!collapsed ? "Algo" : null}
        </button>
        <button
          ref={typeRef}
          className={mode === "type" ? "on" : ""}
          onClick={() => {
            update("appearance", { mode: "type" });
            go({ name: "type" });
          }}
          title="Type"
        >
          <Icon name="type" size={16} />
          {!collapsed ? "Type" : null}
        </button>
      </div>

      <div className="sidebar-scroll">
        {mode === "learn" ? (
          <>
            {!collapsed ? <div className="nav-label">Learn</div> : null}
            {upNext
              ? item(false, "play", "Continue", () =>
                  go({ name: "lesson", id: upNext.id }),
                )
              : null}
            {item(
              route.name === "course" || route.name === "lesson",
              "layers",
              "Course",
              () => go({ name: "course" }),
            )}
            {!collapsed ? (
              <div className="nav-progress" title={`${coursePercent}% of this path complete`}>
                <i style={{ width: `${coursePercent}%` }} />
              </div>
            ) : null}
            {item(
              route.name === "session",
              "zap",
              "Daily session",
              () => go({ name: "session" }),
              dueCount,
              "daily",
            )}
          </>
        ) : mode === "type" ? (
          <>
            {!collapsed ? <div className="nav-label">Type</div> : null}
            {item(route.name === "type", "keyboard", "Overview", () => go({ name: "type" }))}
            {item(
              route.name === "typeCourse" || route.name === "typeLesson",
              "layers",
              "Course",
              () => go({ name: "typeCourse" }),
            )}
            {item(route.name === "typeTest", "zap", "Speed test", () => go({ name: "typeTest" }))}
          </>
        ) : (
          <>
            {!collapsed ? <div className="nav-label">Interview practice</div> : null}
            {item(
              route.name === "problems" || route.name === "problem",
              "target",
              "Problems",
              () => go({ name: "problems" }),
            )}
            {item(
              route.name === "session",
              "zap",
              "Daily session",
              () => go({ name: "session" }),
              dueCount,
              "daily",
            )}
          </>
        )}

        {!collapsed ? <div className="nav-label nav-label-secondary">Track</div> : null}
        {item(route.name === "progress" || route.name === "concept", "chart", "Progress", () =>
          go({ name: "progress" }),
        )}
        {item(false, "search", "Quick find", onSearch, undefined, "search")}

        {mode !== "type" && recentIds.length && !collapsed ? (
          <>
            <div className="nav-label">Recents</div>
            {recentIds.map((id) => {
              if (mode === "learn") {
                const lesson = LESSON_BY_ID.get(id);
                if (!lesson) return null;
                const done = lessonProgress(lesson, progress).complete;
                return (
                  <button
                    key={id}
                    className={`recent-item ${done ? "done" : ""}`}
                    onClick={() => go({ name: "lesson", id })}
                  >
                    <Icon name="book" size={17} />
                    <span className="label">{lesson.title}</span>
                  </button>
                );
              }
              const problem = PROBLEM_BY_ID.get(id);
              if (!problem) return null;
              return (
                <button
                  key={id}
                  className={`recent-item ${progress.cleared[id] ? "done" : ""}`}
                  onClick={() => go({ name: "problem", id })}
                >
                  <Icon name="code" size={17} />
                  <span className="label">{problem.title}</span>
                </button>
              );
            })}
          </>
        ) : null}
      </div>

      <div className="sidebar-foot">
        {!collapsed ? (
          <>
            <div className="sidebar-today">
              <div className="row spread">
                <span className="sidebar-today-title">Today</span>
                <StreakLabel progress={progress} />
              </div>
              <div className="row spread sidebar-today-copy">
                <span>{todayMinutes} of {settings.learning.dailyMinutes} min</span>
                <span>{dueCount ? `${dueCount} reviews due` : "You're clear"}</span>
              </div>
              <div className="nav-progress">
                <i style={{ width: `${Math.min(100, (todayMinutes / Math.max(1, settings.learning.dailyMinutes)) * 100)}%` }} />
              </div>
              <Heatmap progress={progress} days={28} compact />
            </div>
            <div className="sidebar-utilities">
              <button onClick={onTour} data-tour="tour">
                <Icon name="sparkles" size={15} /> Tour
              </button>
              <button onClick={onSearch}>
                <Icon name="search" size={15} /> <kbd>Ctrl K</kbd>
              </button>
            </div>
          </>
        ) : null}

        <button
          className="user-chip"
          onClick={onSettings}
          data-tour="settings"
          title={collapsed ? "Settings and preparation profile" : undefined}
          aria-label={collapsed ? "Settings and preparation profile" : undefined}
        >
          <DayRing progress={progress} target={settings.learning.dailyMinutes}>
            <div className="avatar">U</div>
          </DayRing>
          {!collapsed ? (
            <>
              <span className="user-name">
                Your preparation <span>· Frontier path</span>
              </span>
              <Icon name="settings" size={15} style={{ color: "var(--text-faint)" }} />
            </>
          ) : null}
        </button>
      </div>
    </aside>
  );
}

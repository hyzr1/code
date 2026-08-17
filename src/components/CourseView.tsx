import { Fragment } from "react";
import type { Progress } from "../types";
import {
  LESSON_BY_ID,
  currentLessonForCourse,
  lessonIsReady,
  lessonsForCourse,
  lessonProgress,
  modulesForCourse,
} from "../content";
import { useSettings } from "../settings";
import { ACTIVE_SWE_PREPARATION_LEVEL, COURSE_BY_ID, COMING_SOON_COURSES } from "../content/courses";

export default function CourseView({
  progress,
  onOpen,
  onToggleComplete,
}: {
  progress: Progress;
  onOpen: (lessonId: string) => void;
  onToggleComplete: (lessonId: string) => void;
}) {
  const { settings } = useSettings();
  const course = settings.learning.course;
  const courseMeta = COURSE_BY_ID.get(course) ?? COURSE_BY_ID.get("python")!;
  const preparationLevel = course === "swe" ? ACTIVE_SWE_PREPARATION_LEVEL : undefined;
  const lessons = lessonsForCourse(course, preparationLevel);
  const availableLessons = lessons.filter(lessonIsReady);
  const visibleLessonIds = new Set(lessons.map((lesson) => lesson.id));
  const modules = modulesForCourse(course, preparationLevel);
  const next = currentLessonForCourse(progress, course, preparationLevel);
  const doneCount = availableLessons.filter(
    (l) => lessonProgress(l, progress).complete,
  ).length;

  // The optional mastery tier is counted separately so the "core" course reads
  // at its true size and the summit is clearly extra.
  const masteryModuleIds = new Set(
    course === "swe" ? [] : modules.filter((m) => m.mastery).map((m) => m.id),
  );
  const coreLessons = lessons.filter((l) => !masteryModuleIds.has(l.moduleId));
  const availableCoreLessons = coreLessons.filter(lessonIsReady);
  const masteryCount = lessons.length - coreLessons.length;
  const doneCore = availableCoreLessons.filter(
    (l) => lessonProgress(l, progress).complete,
  ).length;

  const parts = [...new Set(modules.map((m) => m.part))];
  const firstMasteryPart = parts.find((p) =>
    modules.some((m) => m.part === p && masteryModuleIds.has(m.id)),
  );

  return (
    <>
      <div className="card prep-roadmap">
        <div>
          <div>
            <span className="badge">Complete preparation path</span>
            <h2 style={{ margin: "8px 0 4px" }}>{courseMeta.label}</h2>
            <p className="small muted" style={{ margin: 0 }}>
              {course === "swe"
                ? "Finish every lesson, exercise, and scheduled review to build the Python, interview, and systems skill expected at frontier labs and FAANG-level teams."
                : courseMeta.detail}
            </p>
          </div>
        </div>
        {course === "swe" ? (
          <div className="frontier-path-pillars" aria-label="Course preparation pillars">
            <div><b>Python engineering</b><span>Write, test, debug, structure, and ship real Python.</span></div>
            <div><b>Technical interviews</b><span>Derive patterns, explain tradeoffs, and solve hard problems cold.</span></div>
            <div><b>Systems reasoning</b><span>Reason about APIs, retries, caches, capacity, and bottlenecks.</span></div>
          </div>
        ) : null}
        {courseMeta.assumesPython ? (
          <p className="small muted" style={{ margin: "12px 0 0" }}>
            Assumes you already know Python — start with the Python course if you don't.
          </p>
        ) : null}
        {course === "swe" && COMING_SOON_COURSES.length ? (
          <div className="mastery-coming-row" aria-label="Coming soon courses">
            <span>Coming soon</span>
            {COMING_SOON_COURSES.map((item) => (
              <b key={item.id}>{item.label}</b>
            ))}
          </div>
        ) : null}
      </div>

      <div className="card course-hero">
        <div className="course-hero-top">
          <span className="course-eyebrow">
            {next ? "Up next" : availableLessons.length ? "Course complete" : "Curriculum mapped"}
          </span>
        </div>

        <div className="course-hero-main">
          <div className="course-hero-copy">
            <div style={{ fontSize: 22, fontWeight: 680, letterSpacing: "-0.02em", lineHeight: 1.15 }}>
              {next
                ? next.title
                : availableLessons.length
                  ? "Every available lesson is complete"
                  : "Lectures are being produced in order"}
            </div>
            {next ? (
              <p className="small muted" style={{ margin: "6px 0 0", maxWidth: "54ch" }}>
                {next.goal}
              </p>
            ) : null}
          </div>
          {next ? (
            <button className="primary course-hero-cta" onClick={() => onOpen(next.id)}>
              {doneCount === 0 ? "Start the course" : "Continue"}
            </button>
          ) : null}
        </div>

        <div style={{ marginTop: 18 }}>
          <div className="row spread tiny dim" style={{ marginBottom: 5 }}>
            <span>
              {doneCore} of {availableCoreLessons.length} available
              {coreLessons.length > availableCoreLessons.length
                ? ` · ${coreLessons.length} mapped`
                : ""}
              {masteryCount ? ` · +${masteryCount} optional mastery` : ""}
            </span>
            <span>{courseMeta.label}</span>
          </div>
          <div className="bar">
            <i style={{ width: `${availableCoreLessons.length ? (doneCore / availableCoreLessons.length) * 100 : 0}%` }} />
          </div>
        </div>
      </div>

      {parts.map((part) => {
        const partMods = modules.filter((m) => m.part === part);
        const isMastery = partMods.some((m) => masteryModuleIds.has(m.id));
        return (
        <Fragment key={part}>
          {part === firstMasteryPart ? (
            <div className="card" style={{ marginTop: 34, borderLeft: "3px solid #c99a3a" }}>
              <div style={{ fontFamily: "var(--mono, ui-monospace, monospace)", fontSize: 12, letterSpacing: "0.12em", textTransform: "uppercase", color: "#c99a3a", fontWeight: 600 }}>▲ Mastery tier · optional</div>
              <p className="small muted" style={{ margin: "6px 0 0" }}>
                Everything above is the complete course. What follows is the elite, competitive-grade tier — take it to go from strong to untouchable.
              </p>
            </div>
          ) : null}
          <div>
            <h2 className="section" style={{ marginTop: 26, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              Part {part} — {partMods[0]?.partTitle}
              {isMastery ? <span className="badge" style={{ color: "#c99a3a", borderColor: "#c99a3a" }}>Optional</span> : null}
            </h2>

          {partMods.map((mod) => {
            const lessons = mod.lessonIds
              .map((id) => LESSON_BY_ID.get(id)!)
              .filter((lesson) => Boolean(lesson && visibleLessonIds.has(lesson.id)));
            const complete = lessons.filter(
              (l) => lessonIsReady(l) && lessonProgress(l, progress).complete,
            ).length;
            const available = lessons.filter(lessonIsReady).length;

            return (
              <div className="card" key={mod.id}>
                <div className="row spread" style={{ marginBottom: 4 }}>
                  <div style={{ fontSize: 16, fontWeight: 650 }}>{mod.title}</div>
                  <span className="tiny dim">
                    {available ? `${complete}/${available} available` : "Planned"}
                  </span>
                </div>
                <p className="small muted" style={{ margin: "0 0 14px" }}>
                  {mod.summary}
                </p>

                {lessons.map((lesson) => {
                  const ready = lessonIsReady(lesson);
                  const state = lessonProgress(lesson, progress);
                  return (
                      <div key={lesson.id}
                        className={`lesson-row ${state.complete ? "complete" : ""} ${ready ? "" : "planned"}`}
                      >
                        {ready ? (
                          <button
                            className="tick"
                            onClick={() => onToggleComplete(lesson.id)}
                            aria-pressed={state.complete}
                            title={state.complete ? "Mark as not complete" : "Mark as complete"}
                            aria-label={`${state.complete ? "Mark not complete" : "Mark complete"}: ${lesson.title}`}
                          >
                            {state.complete ? "✓" : "○"}
                          </button>
                        ) : (
                          <span className="lesson-planned-dot" aria-hidden="true" />
                        )}
                        <button className="lesson-open" onClick={() => ready && onOpen(lesson.id)} disabled={!ready}>
                          <span className="lesson-title">{lesson.title}</span>
                          <span className="lesson-goal">{lesson.goal}</span>
                        </button>
                        <span className="tiny dim lesson-count">
                          {ready ? `${state.done}/${state.total}` : "Planned"}
                        </span>
                      </div>
                  );
                })}
              </div>
            );
          })}
          </div>
        </Fragment>
        );
      })}

      <div className="card">
        <h2 className="section">What's after this</h2>
        <p className="small muted" style={{ marginTop: -6 }}>
          {course === "swe" || course === "python" ? (
            <>
              Complete all three pillars in order: practical Python, technical
              interviews, and systems reasoning. Cold problem solving and
              scheduled retrieval are required parts of the path—not work saved
              until every lecture is over.
            </>
          ) : course === "algo" ? (
            <>
              Work every interview pattern — hashing, sliding windows, stacks,
              trees, graphs, backtracking, and dynamic programming — with worked,
              tested solutions.
            </>
          ) : (
            <>
              Build from the math up: linear algebra, gradient descent, classical
              models, then neural networks and backpropagation, all coded from
              scratch.
            </>
          )}
        </p>
      </div>
    </>
  );
}

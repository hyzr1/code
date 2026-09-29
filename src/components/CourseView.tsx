import { Fragment } from "react";
import type { Course, Progress } from "../types";
import {
  LESSON_BY_ID,
  currentLessonForCourse,
  lessonIsReady,
  lessonsForCourse,
  lessonProgress,
  modulesForCourse,
} from "../content";
import { useSettings } from "../settings";
import { ACTIVE_SWE_PREPARATION_LEVEL, COURSE_BY_ID } from "../content/courses";
import LanguagePicker from "./LanguagePicker";
import Icon from "./Icon";

export default function CourseView({
  progress,
  onCourseChange,
  onOpen,
  onToggleComplete,
}: {
  progress: Progress;
  onCourseChange: (course: Course) => void;
  onOpen: (lessonId: string) => void;
  onToggleComplete: (lessonId: string) => void;
}) {
  const { settings } = useSettings();
  const course = settings.learning.course;
  const courseMeta = COURSE_BY_ID.get(course) ?? COURSE_BY_ID.get("python")!;
  const preparationLevel = course === "swe" ? ACTIVE_SWE_PREPARATION_LEVEL : undefined;
  const lessons = lessonsForCourse(course, preparationLevel);
  const availableLessons = lessons.filter(lessonIsReady);
  const plannedCount = lessons.length - availableLessons.length;
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
      <header className="course-overview prep-roadmap">
        <div className="course-heading-row">
          <div><span className="product-eyebrow">Courses</span><h1>{courseMeta.label}</h1></div>
          <div className="course-switcher"><LanguagePicker onChange={onCourseChange} /></div>
        </div>
        <p>{courseMeta.detail}</p>
        <div className="course-facts"><span><Icon name="book" size={15} />{availableLessons.length} lessons</span><span><Icon name="layers" size={15} />{modules.length} modules</span><span><Icon name="checkCircle" size={15} />{doneCount} completed</span></div>
        {course === "math" && <p className="course-prerequisite">A paced sequence inspired by UCSC MATH 19A/19B, then undergraduate and graduate mathematics. {plannedCount} later lessons are mapped but not yet released. Work the examples and exercises before advancing; this is not academic credit or a compressed degree.</p>}
        {course === "swe" && <div className="frontier-path-pillars" aria-label="Course preparation pillars"><div>Python engineering</div><div>Technical interviews</div><div>Systems reasoning</div></div>}
        {courseMeta.assumesPython && <span className="course-prerequisite">Prerequisite: Python fundamentals</span>}
      </header>
      <section className="course-resume" aria-label="Next lesson">
        <div className="resume-icon"><Icon name="play" size={20} /></div>
        <div className="resume-copy"><span className="product-eyebrow">{next ? "Next lesson" : plannedCount ? "Current lessons complete" : "Course complete"}</span><h2>{next?.title ?? "Every available lesson is complete"}</h2><p>{next?.goal ?? "Return to any module to review what you learned."}</p></div>
        {next && <button className="primary" onClick={() => onOpen(next.id)}>{doneCount ? "Continue" : "Start the course"}<Icon name="arrowRight" size={15} /></button>}
      </section>
      <div className="curriculum-heading"><h2>Curriculum</h2><span>{doneCore} / {availableCoreLessons.length} lessons completed{masteryCount ? ` · ${masteryCount} optional` : ""}</span></div>
      <div className="curriculum-progress"><i style={{width:`${availableCoreLessons.length ? doneCore / availableCoreLessons.length * 100 : 0}%`}} /></div>
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
              <details className="course-module" key={mod.id} open={mod.id === (next?.moduleId ?? modules[0]?.id)}>
                <summary><span className="module-number">{String(modules.indexOf(mod) + 1).padStart(2,"0")}</span><span className="module-copy"><strong>{mod.title}</strong><span>{mod.summary}</span></span><span className="module-count">{complete}/{available}</span><Icon name="chevronDown" size={16}/></summary>
                <div className="module-lessons">
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
                          {ready ? `${state.done}/${state.total}` : "Coming soon"}
                        </span>
                      </div>
                  );
                })}
                </div>
              </details>
            );
          })}
          </div>
        </Fragment>
        );
      })}

    </>
  );
}

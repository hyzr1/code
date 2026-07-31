import type { Progress } from "../types";
import {
  LESSON_BY_ID,
  currentLesson,
  lessonsFor,
  lessonProgress,
  modulesFor,
} from "../content";
import { useSettings } from "../settings";
import LanguagePicker from "./LanguagePicker";
import { TRACKS, weeksUntil } from "../content/tracks";

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
  const language = settings.learning.language;
  const track = TRACKS[settings.profile.track];
  const deadline = weeksUntil(settings.profile.interviewDate);
  const lessons = lessonsFor(language, settings.profile.track);
  const modules = modulesFor(language, settings.profile.track);
  const next = currentLesson(progress, language, settings.profile.track);
  const doneCount = lessons.filter(
    (l) => lessonProgress(l, progress).complete,
  ).length;

  const parts = [...new Set(modules.map((m) => m.part))];

  return (
    <>
      <div className="card prep-roadmap">
        <div className="row spread wrap" style={{ gap: 14 }}>
          <div>
            <span className="badge">{track.label}</span>
            <h2 style={{ margin: "8px 0 4px" }}>{settings.profile.stage === "internship" ? "Internship path" : settings.profile.stage === "new-grad" ? "New-grad path" : "Experienced path"}</h2>
            <p className="small muted" style={{ margin: 0 }}>{track.description}</p>
          </div>
          <div className="tiny dim">{deadline === null ? `${settings.profile.weeklyHours} hours each week` : `${deadline} weeks remaining · ${settings.profile.weeklyHours} hours each week`}</div>
        </div>
        <div className="track-mix" aria-label="Recommended study mix">
          {Object.entries(track.mix).filter(([, value]) => value > 0).map(([name, value]) => (
            <i key={name} style={{ width: `${value}%` }} title={`${name}: ${value}%`}><span>{name}</span></i>
          ))}
        </div>
      </div>

      <div className="card course-hero">
        <div className="course-hero-top">
          <span className="course-eyebrow">
            {next ? "Up next" : "Course complete"}
          </span>
          <div data-tour="course-language">
            <LanguagePicker />
          </div>
        </div>

        <div className="course-hero-main">
          <div className="course-hero-copy">
            <div style={{ fontSize: 22, fontWeight: 680, letterSpacing: "-0.02em", lineHeight: 1.15 }}>
              {next ? next.title : "Everything built so far is done"}
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
              {doneCount} of {lessons.length} lessons
            </span>
            <span>Part 1 · The Language</span>
          </div>
          <div className="bar">
            <i style={{ width: `${lessons.length ? (doneCount / lessons.length) * 100 : 0}%` }} />
          </div>
        </div>
      </div>

      {parts.map((part) => (
        <div key={part}>
          <h2 className="section" style={{ marginTop: 26 }}>
            Part {part} — {modules.find((m) => m.part === part)?.partTitle}
          </h2>

          {modules.filter((m) => m.part === part).map((mod) => {
            const lessons = mod.lessonIds
              .map((id) => LESSON_BY_ID.get(id)!)
              .filter(Boolean);
            const complete = lessons.filter(
              (l) => lessonProgress(l, progress).complete,
            ).length;

            return (
              <div className="card" key={mod.id}>
                <div className="row spread" style={{ marginBottom: 4 }}>
                  <div style={{ fontSize: 16, fontWeight: 650 }}>{mod.title}</div>
                  <span className="tiny dim">
                    {complete}/{lessons.length}
                  </span>
                </div>
                <p className="small muted" style={{ margin: "0 0 14px" }}>
                  {mod.summary}
                </p>

                {lessons.map((lesson) => {
                  const state = lessonProgress(lesson, progress);
                  return (
                    <div
                      key={lesson.id}
                      className={`lesson-row ${state.complete ? "complete" : ""}`}
                    >
                      <button
                        className="tick"
                        onClick={() => onToggleComplete(lesson.id)}
                        aria-pressed={state.complete}
                        title={state.complete ? "Mark as not complete" : "Mark as complete"}
                        aria-label={`${state.complete ? "Mark not complete" : "Mark complete"}: ${lesson.title}`}
                      >
                        {state.complete ? "✓" : "○"}
                      </button>
                      <button className="lesson-open" onClick={() => onOpen(lesson.id)}>
                        <span className="lesson-title">{lesson.title}</span>
                        <span className="lesson-goal">{lesson.goal}</span>
                      </button>
                      <span className="tiny dim lesson-count">
                        {state.done}/{state.total}
                      </span>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      ))}

      <div className="card">
        <h2 className="section">What's after this</h2>
        <p className="small muted" style={{ marginTop: -6 }}>
          {language === "python" ? (
            <>
              Continue through fluent and production Python, then complexity,
              interview method, hashing, windows, trees, graphs, backtracking,
              and dynamic programming.
            </>
          ) : (
            <>
              Continue through JavaScript language depth, complexity,
              problem-solving, data structures, and interview patterns.
            </>
          )}
        </p>
      </div>
    </>
  );
}

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
}: {
  progress: Progress;
  onOpen: (lessonId: string) => void;
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

      <div className="card">
        <div className="row spread wrap" style={{ gap: 16 }}>
          <div>
            <div data-tour="course-language">
              <LanguagePicker />
            </div>
            <h2 className="section" style={{ margin: "0 0 4px" }}>
              {next ? "Up next" : "Course complete"}
            </h2>
            <div style={{ fontSize: 19, fontWeight: 650, letterSpacing: "-0.01em" }}>
              {next ? next.title : "Everything built so far is done"}
            </div>
            {next ? (
              <div className="small muted" style={{ marginTop: 3 }}>
                {next.goal}
              </div>
            ) : null}
          </div>
          {next ? (
            <button className="primary" onClick={() => onOpen(next.id)}>
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
                    <button
                      key={lesson.id}
                      className={`lesson-row ${state.complete ? "complete" : ""}`}
                      onClick={() => onOpen(lesson.id)}
                    >
                      <span className="tick">
                        {state.complete ? "✓" : "○"}
                      </span>
                      <span style={{ flex: 1 }}>
                        <span className="lesson-title">{lesson.title}</span>
                        <span className="lesson-goal">{lesson.goal}</span>
                      </span>
                      <span className="tiny dim" style={{ flexShrink: 0 }}>
                        {state.done}/{state.total}
                      </span>
                    </button>
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

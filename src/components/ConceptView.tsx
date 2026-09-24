import type { Progress } from "../types";
import {
  ATOM_BY_CONCEPT,
  CONCEPT_BY_ID,
  COURSE_LESSONS,
  DRILLS,
  PROBLEMS,
  STAGE_NAMES,
} from "../content";
import { DAY, strengthOf } from "../engine/mastery";
import EmptyState from "./EmptyState";
import Icon from "./Icon";

/**
 * The decay curve for one concept: where its strength has been, and where it
 * goes if you don't come back.
 *
 * The scheduler has always known this. Drawing it is what makes "spaced
 * repetition" stop being a claim and start being a thing you can watch.
 */
function DecayCurve({
  progress,
  id,
}: {
  progress: Progress;
  id: string;
}) {
  const state = progress.concepts[id];
  if (!state?.reps) return null;

  const now = Date.now();
  const start = state.lastSeen;
  const span = Math.max(state.due - start, DAY) * 1.6;
  const w = 320;
  const h = 72;

  const points = Array.from({ length: 60 }, (_, i) => {
    const at = start + (span * i) / 59;
    const s = strengthOf(state, at);
    return `${(i / 59) * w},${h - s * (h - 6) - 3}`;
  });

  const nowX = ((now - start) / span) * w;
  const dueX = ((state.due - start) / span) * w;

  return (
    <svg className="decay" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      <line x1={0} y1={h - 3} x2={w} y2={h - 3} stroke="var(--border)" strokeWidth={1} />
      <polyline
        points={points.join(" ")}
        fill="none"
        stroke="var(--accent)"
        strokeWidth={2}
        vectorEffect="non-scaling-stroke"
        strokeLinecap="round"
      />
      {dueX <= w ? (
        <line
          x1={dueX}
          y1={0}
          x2={dueX}
          y2={h}
          stroke="var(--text-faint)"
          strokeWidth={1}
          strokeDasharray="3 3"
          vectorEffect="non-scaling-stroke"
        />
      ) : null}
      {nowX <= w ? (
        <line
          x1={nowX}
          y1={0}
          x2={nowX}
          y2={h}
          stroke="var(--fail)"
          strokeWidth={1.5}
          vectorEffect="non-scaling-stroke"
        />
      ) : null}
    </svg>
  );
}

function relative(ms: number): string {
  const days = Math.round(ms / DAY);
  if (days === 0) return "today";
  if (days === 1) return "tomorrow";
  if (days === -1) return "yesterday";
  if (days < 0) return `${-days} days ago`;
  return `in ${days} days`;
}

export default function ConceptView({
  id,
  progress,
  onProblem,
  onLesson,
}: {
  id: string;
  progress: Progress;
  onProblem: (problemId: string) => void;
  onLesson: (lessonId: string) => void;
}) {
  const concept = CONCEPT_BY_ID.get(id);
  if (!concept) return <div className="empty">No such concept.</div>;

  const now = Date.now();
  const state = progress.concepts[id];
  const strength = strengthOf(state, now);
  const seen = Boolean(state?.reps);

  const teaches = COURSE_LESSONS.filter(
    (l) => ATOM_BY_CONCEPT.get(id)?.id === l.atomId,
  );
  const exercises = PROBLEMS.filter((p) => p.teaches.includes(id));
  const drills = DRILLS.filter((d) => d.teaches.includes(id));

  const attempts = progress.attempts.filter((a) => {
    const unit = PROBLEMS.find((p) => p.id === a.unitId);
    if (unit) return unit.teaches.includes(id);
    const drill = DRILLS.find((d) => d.id === a.unitId);
    return drill ? drill.teaches.includes(id) : false;
  });
  const passed = attempts.filter((a) => a.passed).length;

  const band =
    strength >= 0.75
      ? { label: "Strong", tone: "var(--pass)" }
      : strength >= 0.45
        ? { label: "Holding", tone: "var(--accent)" }
        : strength >= 0.2
          ? { label: "Fading", tone: "var(--warn)" }
          : { label: "Gone", tone: "var(--fail)" };

  return (
    <div className="page narrow">
      <div className="page-head">
        <span className="pane-eyebrow">
          {STAGE_NAMES[concept.stage]} · {concept.kind.replace("-", " ")}
        </span>
        <h1>{concept.title}</h1>
        <p style={{ fontFamily: "var(--mono)", fontSize: 12.5 }}>{concept.id}</p>
      </div>

      {!seen ? (
        <EmptyState
          icon="circle"
          title="Not started"
          detail="Nothing has exercised this yet, so there's no strength to report. It enters the rotation the first time a lesson or problem touches it."
        />
      ) : (
        <>
          <div className="stat-grid">
            <div className="stat">
              <div className="value" style={{ color: band.tone }}>
                {Math.round(strength * 100)}%
              </div>
              <div className="label">{band.label}</div>
            </div>
            <div className="stat">
              <div className="value">{relative(state.due - now)}</div>
              <div className="label">Next review</div>
            </div>
            <div className="stat">
              <div className="value">{state.reps}</div>
              <div className="label">Reviews</div>
            </div>
            <div className="stat">
              <div className="value">{state.lapses}</div>
              <div className="label">Lapses</div>
            </div>
          </div>

          <div className="card">
            <h2 className="section">Decay</h2>
            <p className="small muted" style={{ marginTop: -6, marginBottom: 14 }}>
              Strength halves over a fixed interval. The solid line is now, the
              dashed line is when this comes back — set to land while you can
              still just about retrieve it.
            </p>
            <DecayCurve progress={progress} id={id} />
            <div className="row spread tiny dim" style={{ marginTop: 6 }}>
              <span>last seen {relative(state.lastSeen - now)}</span>
              <span>
                {passed}/{attempts.length} passed
              </span>
            </div>
          </div>
        </>
      )}

      {teaches.length ? (
        <div className="card">
          <h2 className="section">Taught in</h2>
          {teaches.map((lesson) => (
            <button
              key={lesson.id}
              className="lesson-row"
              onClick={() => onLesson(lesson.id)}
            >
              <span className="tick">
                <Icon name="book" size={16} />
              </span>
              <span className="row-main">
                <span className="lesson-title">{lesson.title}</span>
                <span className="lesson-goal">{lesson.goal}</span>
              </span>
            </button>
          ))}
        </div>
      ) : null}

      {exercises.length ? (
        <div className="card">
          <h2 className="section">Exercised by</h2>
          {exercises.map((problem) => (
            <button
              key={problem.id}
              className="lesson-row"
              onClick={() => onProblem(problem.id)}
            >
              <span className="tick">
                <Icon
                  name={progress.cleared[problem.id] ? "checkCircle" : "circle"}
                  size={16}
                  style={{
                    color: progress.cleared[problem.id]
                      ? "var(--pass)"
                      : "var(--text-faint)",
                  }}
                />
              </span>
              <span className="row-main">
                <span className="lesson-title">{problem.title}</span>
                <span className="lesson-goal">
                  {problem.tier === "rep" ? "Rep" : "Problem"} ·{" "}
                  {problem.estimatedMinutes < 1
                    ? `${Math.round(problem.estimatedMinutes * 60)} sec`
                    : `${problem.estimatedMinutes} min`}
                </span>
              </span>
            </button>
          ))}
        </div>
      ) : null}

      {drills.length ? (
        <div className="card">
          <h2 className="section">Drilled by</h2>
          <p className="small muted" style={{ marginTop: -6 }}>
            {drills.length} drill{drills.length === 1 ? "" : "s"} touch this —
            they come up on their own in the daily session, interleaved with
            everything else.
          </p>
        </div>
      ) : null}
    </div>
  );
}

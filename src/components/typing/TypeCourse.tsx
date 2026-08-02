import { LESSONS, LESSON_BY_ID, STAGES } from "../../content/typing";
import { useTyping } from "./store";
import Icon from "../Icon";

function Stars({ n }: { n: number }) {
  return (
    <span className="type-stars" aria-label={`${n} of 3 stars`}>
      {[0, 1, 2].map((i) => (
        <i key={i} className={i < n ? "on" : ""}>★</i>
      ))}
    </span>
  );
}

export default function TypeCourse({ onOpen }: { onOpen: (id: string) => void }) {
  const { typing } = useTyping();

  // Sequential unlock: a lesson opens once the one before it earns a star.
  const unlockedThrough = (() => {
    let i = 0;
    while (i < LESSONS.length && (typing.lessons[LESSONS[i].id]?.stars ?? 0) >= 1) i++;
    return i; // index of the first not-yet-cleared lesson (also unlocked)
  })();

  const completed = LESSONS.filter((l) => (typing.lessons[l.id]?.stars ?? 0) >= 1).length;

  return (
    <div className="type-page">
      <header className="type-course-head">
        <div>
          <div className="eyebrow">Touch-typing course</div>
          <h1>From the home row to real code</h1>
          <p className="dim">
            {LESSONS.length} lessons, built in dependency order. Each one adds a
            couple of keys and drills them against the ones you already own.
          </p>
        </div>
        <div className="type-course-progress">
          <div className="type-ring-num">{Math.round((completed / LESSONS.length) * 100)}%</div>
          <div className="tiny dim">{completed} / {LESSONS.length} cleared</div>
        </div>
      </header>

      {STAGES.map((stage) => (
        <section className="type-stage" key={stage.id}>
          <div className="type-stage-head">
            <h2>{stage.title}</h2>
            <p className="dim">{stage.blurb}</p>
          </div>
          <div className="type-lesson-grid">
            {stage.lessonIds.map((id) => {
              const lesson = LESSON_BY_ID.get(id)!;
              const rec = typing.lessons[id];
              const idx = LESSONS.findIndex((l) => l.id === id);
              const locked = idx > unlockedThrough;
              const stars = rec?.stars ?? 0;
              return (
                <button
                  key={id}
                  className={`type-lesson-card ${locked ? "locked" : ""} ${stars >= 1 ? "done" : ""}`}
                  onClick={() => !locked && onOpen(id)}
                  disabled={locked}
                >
                  <div className="type-lesson-card-top">
                    <span className="type-keys">
                      {lesson.newKeys.length
                        ? lesson.newKeys.map((k) => <kbd key={k}>{k === " " ? "␣" : k}</kbd>)
                        : <span className="tiny dim">review</span>}
                    </span>
                    {locked ? <Icon name="lock" size={14} /> : <Stars n={stars} />}
                  </div>
                  <div className="type-lesson-card-title">{lesson.title}</div>
                  <div className="type-lesson-card-goal tiny dim">{lesson.goal}</div>
                  {rec?.bestWpm ? (
                    <div className="type-lesson-card-foot tiny">
                      best {Math.round(rec.bestWpm)} wpm · {Math.round(rec.bestAccuracy * 100)}%
                    </div>
                  ) : null}
                </button>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}

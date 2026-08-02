import { LESSONS } from "../../content/typing";
import {
  bestTestWpm,
  keysMastered,
  typingStreak,
  weakestKeys,
} from "../../engine/typing";
import { useTyping } from "./store";
import Icon from "../Icon";

export default function TypeHome({
  onCourse,
  onTest,
  onOpenLesson,
}: {
  onCourse: () => void;
  onTest: () => void;
  onOpenLesson: (id: string) => void;
}) {
  const { typing } = useTyping();
  const best = bestTestWpm(typing);
  const mastered = keysMastered(typing);
  const streak = typingStreak(typing);
  const minutes = Math.round(typing.totalSeconds / 60);

  const next = LESSONS.find((l) => (typing.lessons[l.id]?.stars ?? 0) < 1) ?? LESSONS[0];
  const cleared = LESSONS.filter((l) => (typing.lessons[l.id]?.stars ?? 0) >= 1).length;
  const started = cleared > 0 || typing.tests.length > 0;

  // Weakest keys across everything the learner has actually touched.
  const touched = Object.keys(typing.keys).filter((k) => k !== " ");
  const weak = weakestKeys(typing, touched, 6);
  const recent = typing.tests.slice(-5).reverse();

  return (
    <div className="type-page">
      <header className="type-hero">
        <div className="eyebrow">Type</div>
        <h1>Learn to type properly — then get fast.</h1>
        <p className="dim">
          A full course from the home row up, and a speed test to push your
          numbers. Accuracy first; speed is what happens next.
        </p>
      </header>

      <div className="type-hero-cards">
        <button className="type-cta primary-card" onClick={() => onOpenLesson(next.id)}>
          <div className="type-cta-kicker">{started ? "Continue course" : "Start the course"}</div>
          <div className="type-cta-title">{next.title}</div>
          <div className="type-cta-goal">{next.goal}</div>
          <span className="type-cta-go">
            {started ? "Resume" : "Begin"} <Icon name="arrowRight" size={16} />
          </span>
        </button>

        <button className="type-cta" onClick={onTest}>
          <div className="type-cta-kicker">Speed test</div>
          <div className="type-cta-title">Push your WPM</div>
          <div className="type-cta-goal">Time, words, quotes, or real code.</div>
          <span className="type-cta-go">Test <Icon name="arrowRight" size={16} /></span>
        </button>
      </div>

      <div className="type-metrics">
        <div className="type-metric"><b>{best ? Math.round(best) : "—"}</b><span>best wpm</span></div>
        <div className="type-metric"><b>{mastered}</b><span>keys mastered</span></div>
        <div className="type-metric"><b>{cleared}/{LESSONS.length}</b><span>lessons</span></div>
        <div className="type-metric"><b>{streak}</b><span>day streak</span></div>
        <div className="type-metric"><b>{minutes}</b><span>minutes typed</span></div>
      </div>

      {weak.length ? (
        <section className="type-panel">
          <div className="type-panel-head">
            <h2>Your weak keys</h2>
            <button className="ghost small" onClick={onCourse}>Drill them <Icon name="arrowRight" size={14} /></button>
          </div>
          <p className="dim tiny">These are slowest or least accurate right now. The course over-samples them automatically.</p>
          <div className="type-weak-keys">
            {weak.map((k) => <kbd key={k}>{k === " " ? "␣" : k}</kbd>)}
          </div>
        </section>
      ) : null}

      {recent.length ? (
        <section className="type-panel">
          <div className="type-panel-head"><h2>Recent tests</h2></div>
          <div className="type-recent">
            {recent.map((t, i) => (
              <div className="type-recent-row" key={i}>
                <span className="type-recent-mode">{t.mode}</span>
                <span><b>{Math.round(t.wpm)}</b> wpm</span>
                <span className="dim">{Math.round(t.accuracy * 100)}% acc</span>
                <span className="dim">{Math.round(t.consistency)}% cons</span>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

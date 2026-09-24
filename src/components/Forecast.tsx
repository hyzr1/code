import type { Progress } from "../types";
import { DAY, strengthOf } from "../engine/mastery";
import { conceptIdsFor } from "../engine/scheduler";
import { useSettings } from "../settings";

/**
 * What the scheduler has already committed you to.
 *
 * Every concept carries a due date, so the next fortnight of work is knowable
 * *now* — it just isn't visible anywhere. Showing it turns spacing from an
 * invisible mechanic into something you can plan around, and it's the clearest
 * signal that the app is doing something on your behalf between sessions.
 */
export function ReviewForecast({
  progress,
  days = 14,
}: {
  progress: Progress;
  days?: number;
}) {
  const { settings } = useSettings();
  const conceptIds = conceptIdsFor(settings.learning.language);
  const now = Date.now();
  const buckets = Array.from({ length: days }, () => 0);
  let overdue = 0;

  for (const id of conceptIds) {
    const state = progress.concepts[id];
    if (!state?.reps) continue;
    const offset = Math.floor((state.due - now) / DAY);
    if (offset < 0) overdue++;
    else if (offset < days) buckets[offset] += 1;
  }

  const peak = Math.max(...buckets, overdue, 1);
  const label = (i: number) =>
    new Date(now + i * DAY).toLocaleDateString(undefined, { weekday: "narrow" });

  return (
    <div>
      <div className="forecast">
        <div className="forecast-col" title={`${overdue} overdue`}>
          <div className="forecast-bar overdue" style={{ height: `${(overdue / peak) * 100}%` }} />
          <span className="forecast-tick">!</span>
        </div>
        {buckets.map((count, i) => (
          <div className="forecast-col" key={i} title={`${count} due in ${i} day${i === 1 ? "" : "s"}`}>
            <div
              className="forecast-bar"
              style={{ height: `${(count / peak) * 100}%` }}
            />
            <span className="forecast-tick">{i === 0 ? "•" : label(i)}</span>
          </div>
        ))}
      </div>
      <div className="row spread tiny dim" style={{ marginTop: 8 }}>
        <span>{overdue} overdue</span>
        <span>{buckets.reduce((a, b) => a + b, 0)} scheduled over {days} days</span>
      </div>
    </div>
  );
}

const BANDS = [
  { id: "strong", label: "Strong", min: 0.75, tone: "var(--pass)" },
  { id: "holding", label: "Holding", min: 0.45, tone: "var(--accent)" },
  { id: "fading", label: "Fading", min: 0.2, tone: "var(--warn)" },
  { id: "gone", label: "Gone", min: 0, tone: "var(--fail)" },
];

/**
 * Where every concept currently sits. One bar, four bands.
 *
 * "How am I doing" is the question a learner asks most and the one a list of
 * weakest concepts answers worst.
 */
export function MasteryBar({ progress }: { progress: Progress }) {
  const { settings } = useSettings();
  const conceptIds = conceptIdsFor(settings.learning.language);
  const now = Date.now();
  const seen = conceptIds.filter((id) => progress.concepts[id]?.reps);
  const untouched = conceptIds.length - seen.length;

  const counts = BANDS.map((band) => ({
    ...band,
    count: seen.filter((id) => {
      const s = strengthOf(progress.concepts[id], now);
      const above = BANDS.filter((b) => b.min > band.min).every(
        (b) => s < b.min,
      );
      return s >= band.min && above;
    }).length,
  }));

  const total = conceptIds.length;

  return (
    <div>
      <div className="mastery-bar">
        {counts.map((band) =>
          band.count ? (
            <i
              key={band.id}
              style={{
                width: `${(band.count / total) * 100}%`,
                background: band.tone,
              }}
              title={`${band.count} ${band.label.toLowerCase()}`}
            />
          ) : null,
        )}
        {untouched ? (
          <i
            style={{ width: `${(untouched / total) * 100}%`, background: "var(--surface-3)" }}
            title={`${untouched} not started`}
          />
        ) : null}
      </div>
      <div className="row wrap" style={{ gap: 14, marginTop: 10 }}>
        {counts.map((band) => (
          <span key={band.id} className="row tiny" style={{ gap: 6 }}>
            <i
              style={{
                width: 7,
                height: 7,
                borderRadius: 2,
                background: band.tone,
                display: "block",
              }}
            />
            <span className="muted">
              {band.label} {band.count}
            </span>
          </span>
        ))}
        <span className="row tiny" style={{ gap: 6 }}>
          <i
            style={{
              width: 7,
              height: 7,
              borderRadius: 2,
              background: "var(--surface-3)",
              display: "block",
            }}
          />
          <span className="muted">Not started {untouched}</span>
        </span>
      </div>
    </div>
  );
}

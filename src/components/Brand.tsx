import type { Progress } from "../types";
import { streakDays, todayKey } from "../engine/storage";

/**
 * The mark: four strokes, shrinking, with widening gaps.
 *
 * That's a spaced-repetition schedule drawn literally — each review is shorter
 * work than the last and further from the one before it. It's the mechanic the
 * whole product is built on, so it's what the logo is.
 */
export function Mark({ size = 22 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.25}
      strokeLinecap="round"
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      <path d="M3 5v14" />
      <path d="M9 8v11" opacity="0.82" />
      <path d="M15.5 11v8" opacity="0.62" />
      <path d="M22 14v5" opacity="0.42" />
    </svg>
  );
}

/**
 * Twelve weeks of practice, one cell a day.
 *
 * A streak number tells you today. This tells you the shape of the habit —
 * where the gaps are, whether it's building or decaying. For a product whose
 * entire premise is spacing, consistency *is* the metric.
 */
export function Heatmap({
  progress,
  days = 84,
  compact = false,
}: {
  progress: Progress;
  days?: number;
  compact?: boolean;
}) {
  const DAYS = days;
  const byDate = new Map(progress.sessions.map((s) => [s.date, s.seconds]));
  const now = Date.now();

  const cells = Array.from({ length: DAYS }, (_, i) => {
    const date = todayKey(now - (DAYS - 1 - i) * 86_400_000);
    const minutes = (byDate.get(date) ?? 0) / 60;
    const level =
      minutes === 0 ? 0 : minutes < 5 ? 1 : minutes < 15 ? 2 : minutes < 35 ? 3 : 4;
    return { date, minutes, level };
  });

  return (
    <div
      className={`heatmap ${compact ? "compact" : ""}`}
      aria-label={`Practice over the last ${DAYS} days`}
    >
      {cells.map((cell) => (
        <i
          key={cell.date}
          data-level={cell.level}
          title={`${cell.date} · ${Math.round(cell.minutes)} min`}
        />
      ))}
    </div>
  );
}

/**
 * A ring around the avatar showing today against the daily target.
 *
 * Progress you can see without reading anything. It sits where your eye
 * already goes when you open the app.
 */
export function DayRing({
  progress,
  target,
  size = 30,
  children,
}: {
  progress: Progress;
  target: number;
  size?: number;
  children: React.ReactNode;
}) {
  const today = progress.sessions.find((s) => s.date === todayKey());
  const minutes = (today?.seconds ?? 0) / 60;
  const fraction = Math.max(0, Math.min(1, minutes / Math.max(1, target)));

  const r = (size - 3) / 2;
  const circumference = 2 * Math.PI * r;

  return (
    <span className="day-ring" style={{ width: size, height: size }}>
      <svg width={size} height={size} aria-hidden="true">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--surface-3)"
          strokeWidth={1.75}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--accent)"
          strokeWidth={1.75}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - fraction)}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: "stroke-dashoffset 500ms ease" }}
        />
      </svg>
      <span className="day-ring-inner">{children}</span>
    </span>
  );
}

/** Fourteen days of minutes as a bare path. No axes, no labels — a shape. */
export function Sparkline({
  progress,
  days = 14,
}: {
  progress: Progress;
  days?: number;
}) {
  const byDate = new Map(progress.sessions.map((s) => [s.date, s.seconds / 60]));
  const now = Date.now();
  const values = Array.from({ length: days }, (_, i) =>
    byDate.get(todayKey(now - (days - 1 - i) * 86_400_000)) ?? 0,
  );

  const peak = Math.max(...values, 1);
  const w = 100;
  const h = 26;
  const step = w / Math.max(1, days - 1);
  const points = values.map((v, i) => `${i * step},${h - (v / peak) * (h - 3)}`);

  return (
    <svg className="sparkline" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      <polyline
        points={points.join(" ")}
        fill="none"
        stroke="var(--accent)"
        strokeWidth={1.5}
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

export function StreakLabel({ progress }: { progress: Progress }) {
  const days = streakDays(progress);
  if (days === 0) return null;
  return (
    <span className="streak">
      {days} day{days === 1 ? "" : "s"}
    </span>
  );
}

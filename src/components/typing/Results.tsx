import type { RunStats } from "../../engine/typing";

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={`type-stat ${accent ? "accent" : ""}`}>
      <div className="type-stat-value">{value}</div>
      <div className="type-stat-label">{label}</div>
    </div>
  );
}

/** A minimal per-second WPM line, drawn inline so there's no chart dependency. */
function Graph({ series }: { series: number[] }) {
  if (series.length < 2) return null;
  const w = 520;
  const h = 96;
  const max = Math.max(40, ...series) * 1.1;
  const step = w / (series.length - 1);
  const pts = series.map((v, i) => `${i * step},${h - (v / max) * h}`).join(" ");
  return (
    <svg className="type-graph" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" aria-hidden="true">
      <polyline points={pts} fill="none" stroke="var(--accent)" strokeWidth={2} strokeLinejoin="round" />
    </svg>
  );
}

export default function Results({
  stats,
  series,
  children,
}: {
  stats: RunStats;
  series?: number[];
  /** Action buttons rendered under the stats. */
  children?: React.ReactNode;
}) {
  return (
    <div className="type-results">
      <div className="type-results-top">
        <Stat label="WPM" value={String(Math.round(stats.wpm))} accent />
        <Stat label="Accuracy" value={`${Math.round(stats.accuracy * 100)}%`} />
        <Stat label="Raw" value={String(Math.round(stats.raw))} />
        <Stat label="Consistency" value={`${Math.round(stats.consistency)}%`} />
        <Stat label="Time" value={`${stats.seconds}s`} />
        <Stat label="Errors" value={String(stats.errors)} />
      </div>
      {series && series.length > 1 ? <Graph series={series} /> : null}
      {children ? <div className="type-results-actions">{children}</div> : null}
    </div>
  );
}

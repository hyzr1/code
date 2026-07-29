import { useMemo, useState } from "react";
import type { Problem, Progress } from "../types";
import { CONCEPT_BY_ID, PROBLEMS } from "../content";
import { contentLanguage } from "../content/language";
import { useSettings } from "../settings";
import EmptyState from "./EmptyState";
import Icon from "./Icon";
import { TRACKS, trackFit } from "../content/tracks";
import LanguagePicker from "./LanguagePicker";

/** Internal ids are for the scheduler, not the reader. */
function conceptLabels(ids: string[]): string {
  return ids
    .slice(0, 3)
    .map((id) => CONCEPT_BY_ID.get(id)?.title ?? id)
    .join(" · ");
}

const BANDS = [
  { max: 2, label: "Easy", tone: "var(--pass)" },
  { max: 3, label: "Medium", tone: "var(--warn)" },
  { max: 5, label: "Hard", tone: "var(--fail)" },
];

function band(problem: Problem) {
  const level = Math.round(
    (problem.difficulty.concept + problem.difficulty.implementation) / 2,
  );
  return BANDS.find((b) => level <= b.max) ?? BANDS[2];
}

type Filter = "recommended" | "all" | "todo" | "done" | "cold";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "recommended", label: "For you" },
  { id: "all", label: "All" },
  { id: "todo", label: "Not started" },
  { id: "done", label: "Cleared" },
  { id: "cold", label: "Cold-solved" },
];

export default function ProblemsView({
  progress,
  onOpen,
}: {
  progress: Progress;
  onOpen: (id: string) => void;
}) {
  const [filter, setFilter] = useState<Filter>("recommended");
  const [query, setQuery] = useState("");
  const { settings } = useSettings();
  const language = settings.learning.language;

  const all = useMemo(
    () => PROBLEMS
      .filter((p) => p.tier !== "rep" && contentLanguage(p) === language)
      .sort((a, b) => trackFit(b, settings.profile.track) - trackFit(a, settings.profile.track)),
    [language, settings.profile.track],
  );

  const shown = all.filter((problem) => {
    const cleared = progress.cleared[problem.id];
    if (filter === "recommended" && trackFit(problem, settings.profile.track) < 2) return false;
    if (filter === "todo" && cleared) return false;
    if (filter === "done" && !cleared) return false;
    if (filter === "cold" && cleared !== "L4") return false;
    if (query) {
      const haystack = `${problem.title} ${problem.pattern ?? ""}`.toLowerCase();
      if (!haystack.includes(query.toLowerCase())) return false;
    }
    return true;
  });

  const patterns = [...new Set(all.map((p) => p.pattern).filter(Boolean))];

  return (
    <div className="page">
      <div className="page-head">
        <div className="row spread wrap" style={{ gap: 16 }}>
          <div>
            <h1>Problems</h1>
            <p className="small muted" style={{ margin: "-4px 0 0" }}>
              Practice and submit in your interview language.
            </p>
          </div>
          <div data-tour="algo-language">
            <LanguagePicker />
          </div>
        </div>
        <p>
          Interview-shaped exercises with hidden tests, a five-rung help ladder
          and failure tagging. Picking your own is fine for a warm-up — the
          daily session interleaves on purpose, because choosing by topic hands
          you the category for free.
        </p>
        <div className="prep-inline"><span className="badge">Tailored for {TRACKS[settings.profile.track].label}</span><span>{TRACKS[settings.profile.track].description}</span></div>
      </div>

      <div className="card" style={{ padding: "14px 16px" }}>
        <div className="row spread wrap" style={{ gap: 12 }}>
          <div className="segmented">
            {FILTERS.map((option) => (
              <button
                key={option.id}
                className={filter === option.id ? "on" : ""}
                onClick={() => setFilter(option.id)}
              >
                {option.label}
              </button>
            ))}
          </div>
          <input
            type="text"
            placeholder="Search problems and patterns…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ flex: 1, minWidth: 200, maxWidth: 320 }}
          />
        </div>
        {patterns.length ? (
          <div className="row wrap" style={{ gap: 6, marginTop: 12 }}>
            {patterns.map((pattern) => (
              <button
                key={pattern}
                className="badge"
                onClick={() => setQuery(pattern!)}
                style={{ cursor: "pointer" }}
              >
                {pattern}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div className="card flush">
        {shown.length === 0 ? (
          <EmptyState
            title={query ? "No problems match that" : "Nothing here yet"}
            detail={
              query
                ? `Nothing matches “${query}”. Try a pattern name like sliding-window, or clear the filter.`
                : filter === "cold"
                  ? "A cold solve is one you passed at L4 with no hints and no autocomplete. None yet — that's the number worth chasing."
                  : filter === "done"
                    ? "You haven't cleared any problems yet. Start with one from the course, or pick anything from All."
                    : "Nothing matches the current filter."
            }
          >
            {query ? (
              <button onClick={() => setQuery("")}>Clear search</button>
            ) : null}
            {filter !== "all" ? (
              <button className="primary" onClick={() => setFilter("all")}>
                Show all problems
              </button>
            ) : null}
          </EmptyState>
        ) : (
          shown.map((problem, i) => {
            const cleared = progress.cleared[problem.id];
            return (
              <button
                key={problem.id}
                className="lesson-row"
                onClick={() => onOpen(problem.id)}
                style={{
                  borderRadius: 0,
                  borderTop: i === 0 ? "none" : "1px solid var(--border-soft)",
                  padding: "11px 18px",
                  marginBottom: 0,
                  height: "auto",
                }}
              >
                <span className="tick">
                  <Icon
                    name={cleared === "L4" ? "checkCircle" : cleared ? "check" : "circle"}
                    style={{
                      color:
                        cleared === "L4"
                          ? "var(--pass)"
                          : cleared
                            ? "var(--accent)"
                            : "var(--text-faint)",
                    }}
                  />
                </span>
                <span className="row-main">
                  <span className="lesson-title">{problem.title}</span>
                  <span className="lesson-goal">
                    {conceptLabels(problem.teaches)}
                  </span>
                </span>
                <span className="row meta">
                  {problem.pattern ? (
                    <span className="badge">{problem.pattern}</span>
                  ) : null}
                  {trackFit(problem, settings.profile.track) >= 3 ? <span className="badge role-fit">Role fit</span> : null}
                  <span
                    className="row tiny"
                    style={{ gap: 6, minWidth: 68, color: "var(--text-muted)" }}
                  >
                    <span
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background: band(problem).tone,
                      }}
                    />
                    {band(problem).label}
                  </span>
                  <span
                    className="tiny dim"
                    style={{ minWidth: 74, textAlign: "right" }}
                  >
                    {cleared ? `Cleared · ${cleared}` : `${problem.estimatedMinutes} min`}
                  </span>
                </span>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

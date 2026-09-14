import { useMemo, useState } from "react";
import type { Problem, Progress } from "../types";
import { CONCEPT_BY_ID, PROBLEMS } from "../content";
import { contentLanguage } from "../content/language";
import { useSettings } from "../settings";
import EmptyState from "./EmptyState";
import Icon from "./Icon";
import { trackFit } from "../content/tracks";
import { ACTIVE_SWE_PREPARATION_LEVEL, trackForCourse } from "../content/courses";
import { problemFitsPreparation } from "../content/companies";

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
type Collection = "neetcode250" | "neetcode150" | "blind75" | "all";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "recommended", label: "For you" },
  { id: "all", label: "All" },
  { id: "todo", label: "Not started" },
  { id: "done", label: "Cleared" },
  { id: "cold", label: "Cold-solved" },
];

const COLLECTIONS: { id: Collection; label: string; count?: number }[] = [
  { id: "neetcode250", label: "NeetCode 250", count: 250 },
  { id: "neetcode150", label: "NeetCode 150", count: 150 },
  { id: "blind75", label: "Blind 75", count: 75 },
  { id: "all", label: "All practice" },
];

export default function ProblemsView({
  progress,
  onOpen,
}: {
  progress: Progress;
  onOpen: (id: string) => void;
}) {
  const [filter, setFilter] = useState<Filter>("all");
  const [collection, setCollection] = useState<Collection>("neetcode250");
  const [query, setQuery] = useState("");
  const { settings } = useSettings();
  const language = settings.learning.language;
  const course = settings.learning.course;
  const preparationLevel = course === "swe" ? ACTIVE_SWE_PREPARATION_LEVEL : undefined;
  const track = trackForCourse(course, preparationLevel);

  const all = useMemo(() => {
    const candidates = PROBLEMS.filter((p) => p.tier !== "rep" && contentLanguage(p) === language);
    // Catalog order is intentional: NeetCode's lists build each problem on the
    // patterns introduced by the problems before it.
    const ordered = [...candidates].sort((a, b) => Number(Boolean(b.lists)) - Number(Boolean(a.lists)));
    const unique = new Map<string, Problem>();
    for (const problem of ordered) {
      const key = problem.title.toLowerCase();
      if (!unique.has(key)) unique.set(key, problem);
    }
    return [...unique.values()];
  }, [course, language, track]);

  const shown = all.filter((problem) => {
    const cleared = progress.cleared[problem.id];
    if (collection !== "all" && !problem.lists?.includes(collection)) return false;
    if (filter === "recommended" && collection === "all" && trackFit(problem, track) < 2) return false;
    if (filter === "recommended" && preparationLevel && !problemFitsPreparation(problem, preparationLevel)) return false;
    if (filter === "todo" && cleared) return false;
    if (filter === "done" && !cleared) return false;
    if (filter === "cold" && cleared !== "L4") return false;
    if (query) {
      const haystack = `${problem.title} ${problem.pattern ?? ""}`.toLowerCase();
      if (!haystack.includes(query.toLowerCase())) return false;
    }
    return true;
  });

  const collectionProblems = all.filter(problem => collection === "all" || problem.lists?.includes(collection));
  const patterns = [...new Set(collectionProblems.map((p) => p.pattern).filter(Boolean))];
  const solved = collectionProblems.filter(problem => progress.cleared[problem.id]).length;

  return (
    <div className="page">
      <div className="page-head">
        <div className="row spread wrap" style={{ gap: 16 }}>
          <div>
            <h1>DSA Interview Prep</h1>
            <p className="small muted" style={{ margin: "-4px 0 0" }}>
              Follow the learning path in order. Each pattern prepares you for the next one.
            </p>
          </div>
        </div>
        <p>Start with arrays and hashing, then move through pointer techniques, search, linked structures, trees, graphs, and dynamic programming. Problems inside every topic are ordered from foundation to synthesis.</p>
        <div className="prep-inline"><span className="badge">DSA</span><span>Python coding interview preparation · beginner to advanced</span></div>
      </div>

      <div className="problem-plan-label"><Icon name="route" size={16} /><span>Choose a study plan</span></div>
      <div className="problem-collections" aria-label="Study plans">
        {COLLECTIONS.map(option => <button key={option.id} className={collection === option.id ? "on" : ""} onClick={() => { setCollection(option.id); setFilter("all"); }}>
          <span>{option.label}</span>{option.count ? <b>{option.count}</b> : null}
        </button>)}
        <div className="collection-progress"><strong>{solved}</strong><span>of {collectionProblems.length} solved</span></div>
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
            const startsTopic = i === 0 || shown[i - 1]?.pattern !== problem.pattern;
            return (
              <div key={problem.id} className="problem-path-item">
              {startsTopic ? <div className="problem-topic-head"><span>{problem.pattern}</span><small>Learn this pattern in order</small></div> : null}
              <button
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
                <span className="problem-order">{String(i + 1).padStart(2, "0")}</span>
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
                  {problem.lists?.includes("blind75") ? <span className="badge role-fit">Blind 75</span> : null}
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
                    {problem.displayDifficulty ?? band(problem).label}
                  </span>
                  <span
                    className="tiny dim"
                    style={{ minWidth: 74, textAlign: "right" }}
                  >
                    {cleared ? `Cleared · ${cleared}` : `${problem.estimatedMinutes} min`}
                  </span>
                </span>
              </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

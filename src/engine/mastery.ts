import type { ConceptId, ConceptState, Progress, ScaffoldLevel } from "../types";

export const DAY = 86_400_000;

/**
 * Memory model.
 *
 * Each concept carries a half-life in days: the time for recall probability to
 * fall to 50%. Strength decays as 2^(-elapsed / halfLife). A successful
 * retrieval multiplies the half-life; a failure cuts it hard.
 *
 * This is FSRS-shaped but hand-rolled so Phase 1 carries no dependency. The
 * interface is deliberately narrow — `applyReview` is the only writer — so
 * swapping in `ts-fsrs` later is a one-file change.
 */

const NEW_HALF_LIFE = 1.0;
const MIN_HALF_LIFE = 0.4;
const MAX_HALF_LIFE = 180;

/** Review when recall probability is ~71%. Earlier than a pure memory-gain
 *  optimum, on purpose: with an interview deadline you want reliability now,
 *  not maximum long-run efficiency per review. */
const DUE_FRACTION = 0.5;

export type Grade = "again" | "hard" | "good" | "easy";

const GRADE_FACTOR: Record<Grade, number> = {
  again: 0.35,
  hard: 1.25,
  good: 2.3,
  easy: 3.2,
};

export function blankState(now: number): ConceptState {
  return {
    strength: 0,
    lastSeen: 0,
    due: now,
    streak: 0,
    reps: 0,
    lapses: 0,
  };
}

/** Half-life is stored implicitly as (due - lastSeen) / DUE_FRACTION. */
function halfLifeOf(state: ConceptState): number {
  if (!state.reps || !state.lastSeen) return NEW_HALF_LIFE;
  const days = (state.due - state.lastSeen) / DAY;
  return Math.max(MIN_HALF_LIFE, days / DUE_FRACTION);
}

export function strengthOf(
  state: ConceptState | undefined,
  now: number,
): number {
  if (!state || !state.reps || !state.lastSeen) return 0;
  const elapsedDays = (now - state.lastSeen) / DAY;
  if (elapsedDays <= 0) return 1;
  return Math.pow(2, -elapsedDays / halfLifeOf(state));
}

export function isDue(state: ConceptState | undefined, now: number): boolean {
  if (!state || !state.reps) return true;
  return now >= state.due;
}

/**
 * Turn the signals from one attempt into a grade.
 *
 * Scaffolding level matters as much as pass/fail: clearing L1 with three hints
 * is not evidence of retrieval, and grading it as though it were is how a
 * mastery model quietly starts lying to you.
 */
export function gradeAttempt(opts: {
  passed: boolean;
  level?: ScaffoldLevel;
  hintsUsed: number;
  seconds: number;
  estimatedSeconds: number;
}): Grade {
  if (!opts.passed) return "again";

  const cold = opts.level === "L4" || opts.level === undefined;
  const assisted = opts.hintsUsed > 0;
  const slow = opts.seconds > opts.estimatedSeconds * 1.6;

  if (assisted) return opts.hintsUsed >= 2 ? "again" : "hard";
  if (!cold) return opts.level === "L3" ? "good" : "hard";
  return slow ? "good" : "easy";
}

export function applyReview(
  state: ConceptState | undefined,
  grade: Grade,
  now: number,
): ConceptState {
  const prev = state ?? blankState(now);
  const current = prev.reps ? halfLifeOf(prev) : NEW_HALF_LIFE;

  let next = current * GRADE_FACTOR[grade];
  if (grade === "again") next = Math.min(next, NEW_HALF_LIFE);
  next = Math.min(MAX_HALF_LIFE, Math.max(MIN_HALF_LIFE, next));

  return {
    strength: 1,
    lastSeen: now,
    due: now + next * DUE_FRACTION * DAY,
    streak: grade === "again" ? 0 : prev.streak + 1,
    reps: prev.reps + 1,
    lapses: prev.lapses + (grade === "again" ? 1 : 0),
  };
}

/** Forces a concept back into the queue at a specific delay. Used by the
 *  failure-mode router, which knows things the memory model doesn't. */
export function scheduleIn(
  state: ConceptState | undefined,
  days: number,
  now: number,
): ConceptState {
  const prev = state ?? blankState(now);
  return { ...prev, lastSeen: now, due: now + days * DAY };
}

export function recordReview(
  progress: Progress,
  conceptIds: ConceptId[],
  grade: Grade,
  now: number,
): void {
  for (const id of conceptIds) {
    progress.concepts[id] = applyReview(progress.concepts[id], grade, now);
  }
}

export function hasSeen(progress: Progress, id: ConceptId): boolean {
  return (progress.concepts[id]?.reps ?? 0) > 0;
}

/** Weakest-first, for the dashboard and for cheat-sheet generation. */
export function weakest(
  progress: Progress,
  ids: ConceptId[],
  now: number,
  limit = 8,
): { id: ConceptId; strength: number }[] {
  return ids
    .map((id) => ({ id, strength: strengthOf(progress.concepts[id], now) }))
    .filter((c) => (progress.concepts[c.id]?.reps ?? 0) > 0)
    .sort((a, b) => a.strength - b.strength)
    .slice(0, limit);
}

/**
 * Typing engine — pure logic and persistence for the Type mode.
 *
 * Deliberately independent of the coding `Progress` schema: typing keeps its
 * own localStorage key so the two halves of the app can evolve without
 * migrations bleeding across. Everything here is framework-free and testable.
 *
 * The science this encodes, briefly:
 *  - Accuracy before speed. A key isn't "learned" until it's both accurate and
 *    no longer the slowest thing you type — so weakness is error-rate *and*
 *    latency, not just mistakes.
 *  - Deliberate practice targets the weakest unit. `weakestKeys` drives the
 *    generators to over-sample exactly the keys that are holding you back.
 *  - Measure what you're training: net WPM (errors removed), raw WPM, accuracy,
 *    and consistency (rhythm) — the four numbers that actually move.
 */

export type Char = string;

/** Per-key rolling statistics, the substrate for adaptive practice. */
export interface KeyStat {
  /** Correct presses of this key. */
  hits: number;
  /** Times the learner produced a wrong key when this one was expected. */
  misses: number;
  /** Summed inter-keystroke latency (ms) over correct presses — for mean speed. */
  timeMs: number;
}

export interface LessonRecord {
  bestWpm: number;
  bestAccuracy: number;
  /** 0–3: earned by clearing the lesson's accuracy and speed targets. */
  stars: number;
  completedAt: number | null;
  attempts: number;
}

export interface TestRecord {
  mode: string;
  wpm: number;
  raw: number;
  accuracy: number;
  consistency: number;
  at: number;
}

export interface TypingProgress {
  keys: Record<Char, KeyStat>;
  lessons: Record<string, LessonRecord>;
  /** Rolling history of speed-test results, newest last, bounded. */
  tests: TestRecord[];
  totalSeconds: number;
  /** ISO day → seconds practiced, for the streak/heat display. */
  days: Record<string, number>;
}

const KEY = "hyzr.typing.v1";

export function emptyTyping(): TypingProgress {
  return { keys: {}, lessons: {}, tests: [], totalSeconds: 0, days: {} };
}

export function loadTyping(): TypingProgress {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return emptyTyping();
    const parsed = JSON.parse(raw) as Partial<TypingProgress>;
    return {
      keys: parsed.keys ?? {},
      lessons: parsed.lessons ?? {},
      tests: parsed.tests ?? [],
      totalSeconds: parsed.totalSeconds ?? 0,
      days: parsed.days ?? {},
    };
  } catch {
    return emptyTyping();
  }
}

export function saveTyping(p: TypingProgress): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    // Quota or private mode — losing a session beats crashing mid-drill.
  }
}

function isoDay(now = Date.now()): string {
  return new Date(now).toISOString().slice(0, 10);
}

// ------------------------------------------------------------- keystroke model

/**
 * One keystroke of a run. `dt` is the gap since the previous keystroke, which
 * is what consistency and per-key speed are built from.
 */
export interface Keystroke {
  expected: Char;
  typed: Char;
  correct: boolean;
  /** ms since the previous keystroke (0 for the first). */
  dt: number;
}

export interface RunStats {
  /** Net words-per-minute: only correct keystrokes count, /5 per word. */
  wpm: number;
  /** Raw WPM: every keystroke counts, including the wrong ones. */
  raw: number;
  /** 0–1: correct keystrokes over total. */
  accuracy: number;
  /** 0–100: rhythm evenness, 100 = perfectly metronomic. */
  consistency: number;
  correct: number;
  errors: number;
  seconds: number;
}

const WORD = 5; // the universal "a word is five characters" convention

export function statsFor(strokes: Keystroke[]): RunStats {
  const total = strokes.length;
  if (total === 0) {
    return { wpm: 0, raw: 0, accuracy: 1, consistency: 0, correct: 0, errors: 0, seconds: 0 };
  }
  const correct = strokes.filter((s) => s.correct).length;
  const errors = total - correct;
  // First stroke's dt is 0; total elapsed is the sum of the gaps.
  const ms = strokes.reduce((sum, s) => sum + s.dt, 0);
  const minutes = Math.max(ms, 1) / 60000;
  const wpm = correct / WORD / minutes;
  const raw = total / WORD / minutes;

  // Consistency = 1 − coefficient of variation of the inter-keystroke gaps,
  // clamped to [0,1]. Even rhythm (low variance) reads as high consistency.
  const gaps = strokes.slice(1).map((s) => s.dt).filter((d) => d > 0);
  let consistency = 0;
  if (gaps.length > 1) {
    const mean = gaps.reduce((a, b) => a + b, 0) / gaps.length;
    const variance = gaps.reduce((a, b) => a + (b - mean) ** 2, 0) / gaps.length;
    const cv = Math.sqrt(variance) / (mean || 1);
    consistency = Math.max(0, Math.min(1, 1 - cv)) * 100;
  }

  return {
    wpm: round(wpm),
    raw: round(raw),
    accuracy: correct / total,
    consistency: round(consistency),
    correct,
    errors,
    seconds: round(ms / 1000),
  };
}

function round(n: number): number {
  return Math.round(n * 10) / 10;
}

// ----------------------------------------------------------------- key stats

/** Fold a completed run's keystrokes into the persistent per-key model. */
export function recordRun(p: TypingProgress, strokes: Keystroke[], now = Date.now()): void {
  for (const s of strokes) {
    const key = s.expected === " " ? " " : s.expected.toLowerCase();
    const stat = (p.keys[key] ??= { hits: 0, misses: 0, timeMs: 0 });
    if (s.correct) {
      stat.hits += 1;
      if (s.dt > 0 && s.dt < 2000) stat.timeMs += s.dt;
    } else {
      stat.misses += 1;
    }
  }
  const seconds = Math.round(strokes.reduce((sum, s) => sum + s.dt, 0) / 1000);
  p.totalSeconds += seconds;
  const day = isoDay(now);
  p.days[day] = (p.days[day] ?? 0) + seconds;
}

/** Error rate for a key, 0 when never seen (so untrained keys aren't "weak"). */
export function errorRate(stat: KeyStat | undefined): number {
  if (!stat) return 0;
  const seen = stat.hits + stat.misses;
  return seen ? stat.misses / seen : 0;
}

/** Mean correct-press latency in ms, or 0 if unmeasured. */
export function meanLatency(stat: KeyStat | undefined): number {
  if (!stat || stat.hits === 0) return 0;
  return stat.timeMs / stat.hits;
}

/**
 * A single 0–1 "weakness" score blending inaccuracy and slowness. Keys never
 * practiced score a neutral-high value so the trainer still introduces them.
 */
export function weakness(stat: KeyStat | undefined): number {
  if (!stat || stat.hits + stat.misses < 3) return 0.5;
  const err = errorRate(stat);
  const lat = meanLatency(stat);
  // 400ms/keystroke ≈ 30wpm — treat that as the slow end of the ramp.
  const slow = Math.max(0, Math.min(1, (lat - 150) / 350));
  return Math.max(0, Math.min(1, err * 2.2 + slow * 0.6));
}

/**
 * The weakest keys among an allowed set, worst first. Drives over-sampling in
 * the line generators — deliberate practice, aimed where it pays.
 */
export function weakestKeys(p: TypingProgress, allowed: Char[], n = 4): Char[] {
  return allowed
    .filter((k) => k !== " ")
    .map((k) => ({ k, w: weakness(p.keys[k]) }))
    .sort((a, b) => b.w - a.w)
    .slice(0, n)
    .filter((x) => x.w > 0.15)
    .map((x) => x.k);
}

/** Count of distinct letters/keys the learner has correctly produced ≥ once. */
export function keysMastered(p: TypingProgress): number {
  return Object.entries(p.keys).filter(
    ([k, s]) => k !== " " && s.hits >= 5 && errorRate(s) < 0.1,
  ).length;
}

export function bestTestWpm(p: TypingProgress): number {
  return p.tests.reduce((m, t) => Math.max(m, t.wpm), 0);
}

export function recordTest(p: TypingProgress, rec: TestRecord): void {
  p.tests.push(rec);
  if (p.tests.length > 200) p.tests.splice(0, p.tests.length - 200);
}

export function typingStreak(p: TypingProgress, now = Date.now()): number {
  let streak = 0;
  for (let i = 0; ; i++) {
    const day = isoDay(now - i * 86_400_000);
    if ((p.days[day] ?? 0) > 0) streak++;
    else if (i > 0) break;
    else break;
  }
  return streak;
}

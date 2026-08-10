import type {
  Atom,
  ConceptId,
  CourseLanguage,
  CareerTrack,
  ExperienceLevel,
  Drill,
  FailureMode,
  Problem,
  Progress,
  ScaffoldLevel,
} from "../types";
import { ATOMS, ATOM_BY_CONCEPT, DRILLS, PROBLEMS } from "../content";
import { contentLanguage } from "../content/language";
import { trackFit } from "../content/tracks";
import { problemFitsPreparation, type PreparationLevel } from "../content/companies";
import { DAY, hasSeen, isDue, scheduleIn, strengthOf } from "./mastery";

export type SessionStep =
  | { kind: "atom"; atom: Atom }
  | { kind: "drill"; drill: Drill }
  | { kind: "problem"; problem: Problem; level: ScaffoldLevel };

export interface Session {
  steps: SessionStep[];
  /** Minutes, for the header. */
  estimate: number;
}

// --------------------------------------------------------------- randomness

/** Seeded so a refresh doesn't reroll today's session. */
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seedFrom(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function shuffle<T>(items: T[], rand: () => number): T[] {
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

// -------------------------------------------------------------- interleaving

/**
 * Rearrange so that no two adjacent items share a key.
 *
 * This is the whole point of the scheduler. Blocked practice — five array
 * questions in a row — trains execution while quietly destroying the ability
 * to recognise which tool a fresh problem wants, because the category was
 * handed to you free every time. Interleaving feels worse and tests better.
 */
export function interleave<T>(items: T[], keyOf: (item: T) => string): T[] {
  const buckets = new Map<string, T[]>();
  for (const item of items) {
    const key = keyOf(item);
    const bucket = buckets.get(key);
    if (bucket) bucket.push(item);
    else buckets.set(key, [item]);
  }

  const out: T[] = [];
  let lastKey: string | null = null;

  while (out.length < items.length) {
    let bestKey: string | null = null;
    let bestSize = 0;

    for (const [key, bucket] of buckets) {
      if (!bucket.length || key === lastKey) continue;
      if (bucket.length > bestSize) {
        bestSize = bucket.length;
        bestKey = key;
      }
    }

    // Only one category left — unavoidable repeat.
    if (bestKey === null) {
      for (const [key, bucket] of buckets) {
        if (bucket.length) {
          bestKey = key;
          break;
        }
      }
    }
    if (bestKey === null) break;

    out.push(buckets.get(bestKey)!.shift()!);
    lastKey = bestKey;
  }

  return out;
}

const primaryConcept = (ids: ConceptId[]): string => ids[0] ?? "misc";

/** Family = everything before the last dot: `js.array.reduce` → `js.array`. */
export function family(id: ConceptId): string {
  const parts = id.split(".");
  return parts.length > 1 ? parts.slice(0, -1).join(".") : id;
}

// ---------------------------------------------------------------- selection

export function isUnlocked(progress: Progress, problem: Problem): boolean {
  return problem.requires.every((id) => hasSeen(progress, id));
}

export function missingPrereqs(
  progress: Progress,
  problem: Problem,
): ConceptId[] {
  return problem.requires.filter((id) => !hasSeen(progress, id));
}

export function dueDrills(progress: Progress, now: number, language: CourseLanguage = "javascript"): Drill[] {
  return DRILLS.filter((drill) =>
    contentLanguage(drill) === language &&
    drill.teaches.some((id) => isDue(progress.concepts[id], now)),
  );
}

/** Lowest strength across what it teaches — the value of doing it now. */
function urgency(progress: Progress, teaches: ConceptId[], now: number): number {
  if (!teaches.length) return 0.5;
  return Math.min(...teaches.map((id) => strengthOf(progress.concepts[id], now)));
}

export function nextLevel(
  progress: Progress,
  problem: Problem,
  now: number,
): ScaffoldLevel {
  const cleared = progress.cleared[problem.id];
  if (cleared === "L4") return "L4";
  if (cleared === "L3") return "L4";
  if (cleared === "L2") return "L3";
  if (cleared === "L1") return "L2";

  // Never attempted. Start where the evidence says: novices gain more from
  // worked examples, experts gain more from solving. Expertise reversal is
  // real, so read the concept strengths rather than assuming either.
  const known = urgency(progress, problem.teaches, now);
  const available = (level: ScaffoldLevel) => problem.scaffolds[level] !== undefined;

  if (known < 0.15 && available("L2")) return "L2";
  if (known < 0.5 && available("L3")) return "L3";
  return "L4";
}

export function pickProblem(
  progress: Progress,
  now: number,
  rand: () => number,
  language: CourseLanguage = "javascript",
  track: CareerTrack = "faang",
  experience: ExperienceLevel = "restarting",
  deadlineWeeks: number | null = null,
  preparationLevel: PreparationLevel = 3,
): Problem | null {
  // Reps belong to lessons, not to the daily cold solve — they're 45-second
  // units and serving one as "today's problem" wastes the slot.
  const candidates = PROBLEMS.filter(
    (p) => p.tier !== "rep" && contentLanguage(p) === language && problemFitsPreparation(p, preparationLevel),
  );
  const unlocked = candidates.filter((p) => isUnlocked(progress, p));
  const pool = unlocked.length ? unlocked : candidates;

  const yesterday = new Set(
    progress.attempts
      .filter((a) => now - a.at < DAY && a.unitKind === "problem")
      .map((a) => a.unitId),
  );

  const scored = pool
    .map((problem) => {
      const strength = urgency(progress, problem.teaches, now);
      const cleared = progress.cleared[problem.id];
      const anyDue = problem.teaches.some((id) =>
        isDue(progress.concepts[id], now),
      );

      let score = 1 - strength;
      score += trackFit(problem, track) * 0.22;
      const difficulty = (problem.difficulty.concept + problem.difficulty.implementation) / 2;
      if (experience === "restarting" || experience === "beginner") {
        if (!cleared && difficulty > 3.5) score -= 0.9;
      } else if (experience === "advanced" && difficulty >= 4) {
        score += 0.45;
      }
      if (deadlineWeeks !== null && deadlineWeeks <= 6) {
        score += cleared ? 0.25 : 0;
        if (problem.tier === "challenge" && experience !== "advanced") score -= 0.4;
      }
      if (preparationLevel === 5 && problem.tier === "challenge") score += 0.55;
      if (preparationLevel >= 4 && difficulty >= 4) score += 0.2;
      if (cleared === "L4" && !anyDue) score -= 0.9; // done and still solid
      if (yesterday.has(problem.id)) score -= 0.6;
      if (!isUnlocked(progress, problem)) score -= 0.5;
      score += rand() * 0.15;
      return { problem, score };
    })
    .sort((a, b) => b.score - a.score);

  return scored[0]?.problem ?? null;
}

// ------------------------------------------------------------ session build

const RECALL_SECONDS = 8 * 60;
const PATTERN_ROUND_SECONDS = 6 * 60;

/** Item caps as well as time budgets. On a fresh install every concept is due,
 *  and a 34-item first session reads as a chore rather than a habit. */
const MAX_RECALL_ITEMS = 14;
const MAX_PATTERN_ITEMS = 8;

function take(
  drills: Drill[],
  budgetSeconds: number,
  maxItems: number,
): Drill[] {
  const out: Drill[] = [];
  let spent = 0;
  for (const drill of drills) {
    if (spent >= budgetSeconds || out.length >= maxItems) break;
    out.push(drill);
    spent += drill.estimatedSeconds;
  }
  return out;
}

/**
 * The daily protocol from EFFICIENCY-DESIGN.md §3:
 *   8 min cheap interleaved recall  →  6 min pattern round  →  1 cold solve
 *
 * The expensive rep is deliberately the smallest slice. Most prep inverts
 * this and spends the whole hour on one 40-minute implementation, which
 * trains five skills at the price of the most expensive one.
 */
export function buildSession(
  progress: Progress,
  now: number,
  dateKey: string,
  language: CourseLanguage = "javascript",
  preparation: {
    track: CareerTrack;
    experience: ExperienceLevel;
    deadlineWeeks: number | null;
    preparationLevel?: PreparationLevel;
  } = { track: "faang", experience: "restarting", deadlineWeeks: null },
): Session {
  const languageProblems = PROBLEMS.filter((problem) => contentLanguage(problem) === language);
  const rand = mulberry32(seedFrom(dateKey + language + languageProblems.length));
  const steps: SessionStep[] = [];

  const problem = pickProblem(
    progress,
    now,
    rand,
    language,
    preparation.track,
    preparation.experience,
    preparation.deadlineWeeks,
    preparation.preparationLevel ?? 3,
  );
  const fresh = Object.keys(progress.concepts).length === 0;

  // 1. Unmet prerequisites become lectures, first, before anything else.
  if (problem) {
    const wanted = fresh
      ? [...problem.requires, ...problem.teaches]
      : missingPrereqs(progress, problem);

    const atoms = wanted
      .map((id) => ATOM_BY_CONCEPT.get(id))
      .filter((atom): atom is Atom => Boolean(atom));

    for (const atom of dedupe(atoms).slice(0, fresh ? 1 : 2)) {
      steps.push({ kind: "atom", atom });
    }
  }

  // 2. Recall queue — due drills, interleaved across families.
  //    Classification drills are held back for the pattern round so a drill
  //    can't be served twice in one session.
  const due = dueDrills(progress, now, language)
    .filter((d) => d.kind !== "pattern-id" && d.kind !== "complexity")
    .sort(
      (a, b) =>
        urgency(progress, a.teaches, now) - urgency(progress, b.teaches, now),
    );

  const recall = interleave(
    take(shuffleWeak(due, rand), RECALL_SECONDS, MAX_RECALL_ITEMS),
    (d) => family(primaryConcept(d.teaches)),
  );
  for (const drill of recall) steps.push({ kind: "drill", drill });

  // 3. Pattern round — classify, don't solve. ~50x cheaper per rep than
  //    solving, and it trains the skill the interview actually gates on.
  const patternPool = DRILLS.filter(
    (d) => contentLanguage(d) === language && (d.kind === "pattern-id" || d.kind === "complexity"),
  );
  const patternRound = take(
    shuffle(patternPool, rand),
    PATTERN_ROUND_SECONDS,
    MAX_PATTERN_ITEMS,
  );
  for (const drill of patternRound) steps.push({ kind: "drill", drill });

  // 4. One cold solve.
  if (problem) {
    steps.push({
      kind: "problem",
      problem,
      level: nextLevel(progress, problem, now),
    });
  }

  const seconds = steps.reduce((total, step) => {
    if (step.kind === "drill") return total + step.drill.estimatedSeconds;
    if (step.kind === "atom") return total + step.atom.readingSeconds;
    return total + step.problem.estimatedMinutes * 60;
  }, 0);

  return { steps, estimate: Math.round(seconds / 60) };
}

function dedupe<T extends { id: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  return items.filter((item) =>
    seen.has(item.id) ? false : (seen.add(item.id), true),
  );
}

/** Weakest-first, but jittered so the same three drills don't open every day. */
function shuffleWeak(drills: Drill[], rand: () => number): Drill[] {
  const groups: Drill[][] = [];
  for (let i = 0; i < drills.length; i += 4) groups.push(drills.slice(i, i + 4));
  return groups.flatMap((group) => shuffle(group, rand));
}

// -------------------------------------------------------- failure routing

export interface Remediation {
  headline: string;
  detail: string;
  steps: SessionStep[];
}

/**
 * Six failure modes, six different prescriptions.
 *
 * The whole reason to tag failures is that "do another problem" is the wrong
 * answer to five of these six. If your failures cluster on `syntax`, more
 * algorithm practice is actively wasted time.
 */
export function remediate(
  progress: Progress,
  problem: Problem,
  mode: FailureMode,
  now: number,
): Remediation {
  const concepts = problem.teaches;
  const related = (kinds: Drill["kind"][], limit: number): SessionStep[] =>
    DRILLS.filter(
      (d) =>
        contentLanguage(d) === contentLanguage(problem) &&
        kinds.includes(d.kind) &&
        (d.teaches.some((id) => concepts.includes(id)) ||
          d.teaches.some((id) =>
            concepts.some((c) => family(c) === family(id)),
          )),
    )
      .slice(0, limit)
      .map((drill) => ({ kind: "drill", drill }) as SessionStep);

  const requeue = (days: number) => {
    for (const id of concepts) {
      progress.concepts[id] = scheduleIn(progress.concepts[id], days, now);
    }
  };

  const atomFor = (): SessionStep[] => {
    const atom = concepts.map((id) => ATOM_BY_CONCEPT.get(id)).find(Boolean);
    return atom ? [{ kind: "atom", atom }] : [];
  };

  switch (mode) {
    case "pattern":
      requeue(1);
      return {
        headline: "You'd have solved it if someone named the approach.",
        detail:
          "That is a recognition problem, not a coding problem. Classification drills are ~50x cheaper per rep than solving, so you train it there.",
        steps: [
          ...related(["pattern-id"], 6),
          { kind: "problem", problem, level: "L2" },
        ],
      };

    case "algorithm":
      requeue(1);
      return {
        headline: "You knew the tool. You forgot how it works.",
        detail:
          "Straight to the lecture, then the same problem tomorrow with the scaffold on.",
        steps: [...atomFor(), ...related(["predict-output"], 3)],
      };

    case "syntax":
      requeue(2);
      return {
        headline: "The idea was there. The JavaScript wasn't.",
        detail:
          "This is a retrieval failure, and it is fixed by cheap high-frequency reps — not by more algorithms. Queueing syntax drills instead.",
        steps: related(["type-it-out", "api-recall", "predict-output"], 8),
      };

    case "edge":
      requeue(1);
      return {
        headline: "The shape was right. The boundaries weren't.",
        detail:
          "Before you run anything tomorrow, say out loud: empty input, one element, duplicates, negatives, overflow.",
        steps: [{ kind: "problem", problem, level: "L3" }],
      };

    case "complexity":
      requeue(2);
      return {
        headline: "It worked. It wouldn't have passed.",
        detail:
          "Complexity is 15 seconds a rep to drill and it is the difference between a hire and a no-hire on identical code.",
        steps: [...related(["complexity"], 6)],
      };

    case "clock":
      requeue(1);
      return {
        headline: "You knew all of it. You were too slow.",
        detail:
          "You don't need new content — you need the same content faster. Same problem tomorrow, cold, on the timer.",
        steps: [...related(["type-it-out"], 4)],
      };
  }
}

export const ALL_CONCEPT_IDS: ConceptId[] = [
  ...new Set([
    ...ATOMS.flatMap((a) => a.teaches),
    ...DRILLS.flatMap((d) => d.teaches),
    ...PROBLEMS.flatMap((p) => p.teaches),
  ]),
];

export function conceptIdsFor(language: CourseLanguage): ConceptId[] {
  return [
    ...new Set([
      ...ATOMS.filter((item) => contentLanguage(item) === language).flatMap((item) => item.teaches),
      ...DRILLS.filter((item) => contentLanguage(item) === language).flatMap((item) => item.teaches),
      ...PROBLEMS.filter((item) => contentLanguage(item) === language).flatMap((item) => item.teaches),
    ]),
  ];
}

import type { LectureQuestion } from "../../types";

/**
 * The third retrieval question for each mastery lecture.
 *
 * The authored lectures ship with two checks each. Release target is three, so
 * this map supplies the additional question and `content/index.ts` appends it
 * to the matching atom. Keeping it here means the hand-written lecture files
 * stay untouched, and a lecture that already carries three questions simply is
 * not listed.
 *
 * Each question targets a *distinct* misconception from its own lecture —
 * never a restatement of the two questions already present.
 */
const q = (
  question: string,
  choices: [string, string, string],
  answer: 0 | 1 | 2,
  explanation: string,
  why: [string, string, string],
): LectureQuestion => ({ question, choices, answer, explanation, why });

export const MASTERY_EXTRA_CHECKS: Record<string, LectureQuestion> = {
  // ---------------------------------------------------------------
  // Algo · Module 1.1 — Measuring work
  // (py.atom.algo.scale already carries three questions in its own file)
  // ---------------------------------------------------------------
  "py.atom.algo.operation-count": q(
    "A loop over `n` items is followed by a separate loop over the same `n` items. What is the total step count?",
    ["About 2n, because consecutive regions add", "About n squared, because there are two loops", "About n, because both loops read the same list"],
    0,
    "Consecutive regions add; only truly nested ranges multiply.",
    [
      "Correct. Each loop contributes n steps and they run one after the other.",
      "Multiplication applies when one loop runs inside another, which is not the case here.",
      "Reading the same data twice still costs two passes; the work does not merge.",
    ],
  ),
  "py.atom.algo.asymptotics": q(
    "You prove an algorithm takes at least n steps and at most n steps. Which claim is strongest?",
    ["Theta of n, because upper and lower bounds match", "Big O of n squared, because it is also true", "Omega of 1, because every algorithm does some work"],
    0,
    "Theta states a tight bound — the upper and lower bounds agree.",
    [
      "Correct. When O and Omega coincide, Theta is the precise description.",
      "O(n^2) is technically true but far weaker than what you proved.",
      "Omega(1) is true of almost everything and carries no information here.",
    ],
  ),
  "py.atom.algo.growth-classes": q(
    "An algorithm halves its remaining input on every step but does a full linear pass before each halving. Which class fits?",
    ["n log n, because a linear pass happens at each of the log n levels", "log n, because the input keeps halving", "n squared, because passing and halving compound"],
    0,
    "Derive the work per level, then multiply by the number of levels.",
    [
      "Correct. About log n levels, each doing about n work, gives n log n.",
      "That would be right only if each step did constant work, not a full pass.",
      "Halving prevents the level count from reaching n, so the product is not quadratic.",
    ],
  ),
  "py.atom.algo.dominant-growth": q(
    "Two algorithms are both Theta of n. What does that tell you about which one finishes first on your data?",
    ["Nothing on its own — constants and lower terms decide it", "The one written with fewer lines will finish first", "They will finish in the same amount of time"],
    0,
    "Growth class describes how cost scales, not how long a specific run takes.",
    [
      "Correct. Same class, so you must measure constants and hidden factors to choose.",
      "Line count is unrelated to the work each line performs.",
      "Equal growth class does not imply equal elapsed time — one can be many times slower.",
    ],
  ),
  "py.atom.algo.space-cost": q(
    "A function must return a new list of n results and uses a temporary set of size n while building it. What is its auxiliary space?",
    ["Theta of n, counting the set but not the required output", "Theta of 1, because the output does not count", "Theta of n squared, because both structures hold n items"],
    0,
    "Auxiliary space excludes the output the problem requires, but includes temporary structures.",
    [
      "Correct. The set is genuine working memory; the returned list is required output.",
      "The set is temporary storage the algorithm chose, so it does count.",
      "Two structures of size n add to 2n, which is still Theta of n.",
    ],
  ),
  "py.atom.algo.amortized-cost": q(
    "An append is amortized O(1). What can a caller who needs predictable per-call latency conclude?",
    ["A single append may still be slow, so the guarantee is about the sequence", "Every append will take the same short time", "The total cost of n appends is unbounded"],
    0,
    "An amortized bound guarantees sequence cost, not identical latency for every call.",
    [
      "Correct. The rare resize is genuinely expensive; only the average across the sequence is constant.",
      "That would be a worst-case per-operation guarantee, which amortized analysis does not give.",
      "The sequence total is precisely what is bounded — it stays linear in n.",
    ],
  ),
  "py.atom.algo.analysis-cases": q(
    "Someone says quicksort is 'O(n log n)'. What must be stated for that claim to be precise?",
    ["Which case it describes — expected, not worst", "The programming language it is written in", "The exact number of elements being sorted"],
    0,
    "Best, worst, expected, and amortized are claims about which input is being analyzed.",
    [
      "Correct. Quicksort's worst case is quadratic; n log n is the expected case under random pivots.",
      "The language affects constants, not the growth class or the case.",
      "A growth claim is about how cost scales, so it does not depend on one specific size.",
    ],
  ),
};

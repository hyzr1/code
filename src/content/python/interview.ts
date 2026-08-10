import type { CareerTrack, CourseModule, Lesson } from "../../types";

/**
 * Course-spine wrapper for the generated LeetCode library (leetcode.ts).
 *
 * These lessons carry no lecture (atomId) — they are graded practice sets that
 * group the problems by pattern so they appear on the roadmap for the
 * interview-focused tracks. The teaching for each pattern already lives in the
 * Python pattern lectures (py.m8+) and in each problem's walkthrough + analysis.
 */

const TRACKS: CareerTrack[] = ["faang", "swe", "quant"];

const lc = (slug: string) => `py.lc.${slug}`;

interface Group {
  id: string;
  title: string;
  goal: string;
  problems: string[];
}

const MODULE_ONE: Group[] = [
  {
    id: "arrays-hashing",
    title: "Arrays & Hashing",
    goal: "Trade time for space with sets and dict counters to make lookups O(1).",
    problems: ["two-sum", "contains-duplicate", "valid-anagram", "group-anagrams", "top-k-frequent"],
  },
  {
    id: "two-pointers",
    title: "Two Pointers",
    goal: "Converge or chase two indices to solve in O(1) space what brute force does in O(n^2).",
    problems: ["valid-palindrome", "two-sum-sorted", "container-most-water"],
  },
  {
    id: "sliding-window",
    title: "Sliding Window",
    goal: "Maintain a moving window with an invariant instead of re-scanning every subarray.",
    problems: ["best-time-stock", "longest-substring-unique", "char-replacement"],
  },
  {
    id: "stack",
    title: "Stack & Monotonic Stack",
    goal: "Use last-in-first-out order for nesting, expression evaluation, and next-greater problems.",
    problems: ["valid-parentheses", "eval-rpn", "daily-temperatures"],
  },
  {
    id: "binary-search",
    title: "Binary Search",
    goal: "Halve the search space each step — over an array, and over an answer range.",
    problems: ["binary-search", "search-rotated", "koko-bananas"],
  },
];

const MODULE_TWO: Group[] = [
  {
    id: "trees",
    title: "Trees & Recursion",
    goal: "Solve a tree by combining answers from its subtrees, with the empty tree as the base case.",
    problems: ["max-depth", "invert-tree", "same-tree", "balanced-tree"],
  },
  {
    id: "heap",
    title: "Heaps & Priority",
    goal: "Keep the k best, or the current extreme, in log time with a binary heap.",
    problems: ["kth-largest", "last-stone-weight"],
  },
  {
    id: "backtracking",
    title: "Backtracking",
    goal: "Enumerate subsets, combinations, and permutations by choosing, recursing, and undoing.",
    problems: ["subsets", "combination-sum", "permutations"],
  },
  {
    id: "graphs-intervals",
    title: "Graphs & Intervals",
    goal: "Flood-fill a grid, and sort-then-sweep overlapping intervals.",
    problems: ["num-islands", "merge-intervals", "insert-interval"],
  },
  {
    id: "dp-bits",
    title: "Dynamic Programming & Bits",
    goal: "Reuse overlapping subproblems from the bottom up; fold bitwise identities.",
    problems: [
      "max-subarray", "jump-game", "climb-stairs", "house-robber", "coin-change",
      "lis", "unique-paths", "lcs", "single-number", "count-bits",
    ],
  },
];

const lessonsFor = (moduleId: string, groups: Group[]): Lesson[] =>
  groups.map((group) => ({
    id: `py.lesson.lc.${group.id}`,
    moduleId,
    title: group.title,
    goal: group.goal,
    repIds: [],
    problemIds: group.problems.map(lc),
    language: "python" as const,
    tracks: TRACKS,
  }));

const MODULE_ONE_LESSONS = lessonsFor("py.mLC1", MODULE_ONE);
const MODULE_TWO_LESSONS = lessonsFor("py.mLC2", MODULE_TWO);

export const PYTHON_INTERVIEW_LESSONS: Lesson[] = [
  ...MODULE_ONE_LESSONS,
  ...MODULE_TWO_LESSONS,
];

export const PYTHON_INTERVIEW_MODULES: CourseModule[] = [
  {
    id: "py.mLC1",
    part: 5,
    partTitle: "Interview Patterns",
    title: "Core Patterns",
    summary:
      "The five patterns most interview problems reduce to: hashing, two pointers, sliding window, stack, and binary search — each with worked, verified solutions.",
    lessonIds: MODULE_ONE_LESSONS.map((lesson) => lesson.id),
    language: "python",
    tracks: TRACKS,
  },
  {
    id: "py.mLC2",
    part: 5,
    partTitle: "Interview Patterns",
    title: "Structures & Search",
    summary:
      "Trees, heaps, backtracking, graphs, intervals, and dynamic programming — the second half of the pattern vocabulary, from recursion to bottom-up DP.",
    lessonIds: MODULE_TWO_LESSONS.map((lesson) => lesson.id),
    language: "python",
    tracks: TRACKS,
  },
];

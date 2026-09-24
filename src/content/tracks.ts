import type { CareerTrack, Problem } from "../types";

export interface TrackProfile {
  id: CareerTrack;
  label: string;
  shortLabel: string;
  description: string;
  priorities: string[];
  mix: { language: number; algorithms: number; engineering: number; math: number; ml: number };
}

export const TRACKS: Record<CareerTrack, TrackProfile> = {
  faang: {
    id: "faang",
    label: "FAANG-style SWE",
    shortLabel: "FAANG",
    description: "DSA fluency, clean communication, complexity, and production fundamentals.",
    priorities: ["arrays", "hashing", "graphs", "trees", "dynamic-programming", "systems"],
    mix: { language: 20, algorithms: 50, engineering: 25, math: 5, ml: 0 },
  },
  swe: {
    id: "swe",
    label: "Software engineering",
    shortLabel: "SWE",
    description: "Language depth, debugging, testing, architecture, data structures, and practical delivery.",
    priorities: ["testing", "debugging", "architecture", "concurrency", "data-structures"],
    mix: { language: 30, algorithms: 25, engineering: 40, math: 5, ml: 0 },
  },
  ml: {
    id: "ml",
    label: "ML engineering",
    shortLabel: "ML",
    description: "Python, numerical reasoning, experimentation, data pipelines, ML systems, and core DSA.",
    priorities: ["python", "statistics", "linear-algebra", "data", "ml-systems", "graphs"],
    mix: { language: 20, algorithms: 20, engineering: 25, math: 15, ml: 20 },
  },
  quant: {
    id: "quant",
    label: "Quant research / trading",
    shortLabel: "Quant",
    description: "Probability, mathematical reasoning, Python, optimization, performance, and hard algorithms.",
    priorities: ["probability", "statistics", "optimization", "dynamic-programming", "performance", "graphs"],
    mix: { language: 15, algorithms: 30, engineering: 10, math: 40, ml: 5 },
  },
};

export function trackFit(problem: Problem, track: CareerTrack): number {
  let score = problem.tracks?.includes(track) ? 3 : problem.tracks?.length ? 0 : 2;
  const priorities = new Set(TRACKS[track].priorities);
  score += (problem.skills ?? []).filter((skill) => priorities.has(skill)).length * 0.75;
  if (track === "quant") score += problem.difficulty.concept >= 4 ? 0.6 : 0;
  if (track === "faang") score += problem.pattern ? 0.4 : 0;
  return score;
}

export function weeksUntil(date: string, now = Date.now()): number | null {
  if (!date) return null;
  const target = new Date(`${date}T12:00:00`).getTime();
  if (!Number.isFinite(target)) return null;
  return Math.max(0, Math.ceil((target - now) / 604_800_000));
}

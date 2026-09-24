import type { ExperienceLevel } from "../types";
import type { PythonReel } from "../content/reels";

export type ReelFeedback = "easy" | "hard" | "more" | "less";

export interface ReelHistory {
  liked: string[];
  saved: string[];
  views: Record<string, number>;
  feedback: Record<string, ReelFeedback>;
  tagAffinity: Record<string, number>;
  seconds: number;
  lastSeenAt: Record<string, number>;
}

const KEY = "hyzr.python-reels.v1";
const EMPTY: ReelHistory = {
  liked: [],
  saved: [],
  views: {},
  feedback: {},
  tagAffinity: {},
  seconds: 0,
  lastSeenAt: {},
};

export function loadReelHistory(): ReelHistory {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return structuredClone(EMPTY);
    const stored = JSON.parse(raw) as Partial<ReelHistory>;
    return {
      liked: Array.isArray(stored.liked) ? stored.liked : [],
      saved: Array.isArray(stored.saved) ? stored.saved : [],
      views: stored.views ?? {},
      feedback: stored.feedback ?? {},
      tagAffinity: stored.tagAffinity ?? {},
      seconds: Number.isFinite(stored.seconds) ? Math.max(0, stored.seconds ?? 0) : 0,
      lastSeenAt: stored.lastSeenAt ?? {},
    };
  } catch {
    return structuredClone(EMPTY);
  }
}

export function saveReelHistory(history: ReelHistory): void {
  localStorage.setItem(KEY, JSON.stringify(history));
}

const targetDifficulty: Record<ExperienceLevel, number> = {
  restarting: 1.8,
  beginner: 2,
  intermediate: 3,
  advanced: 4,
};

function stableNoise(value: string): number {
  let hash = 2166136261;
  for (const char of value) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return ((hash >>> 0) % 1000) / 1000;
}

/**
 * Rank once when the feed opens, then keep the order stable while scrolling.
 * Novel material wins, but explicit feedback and tag affinity shift the mix.
 * A greedy diversity pass prevents three identical formats or subjects from
 * landing together even when their raw recommendation scores are similar.
 */
export function rankReels(
  reels: PythonReel[],
  history: ReelHistory,
  experience: ExperienceLevel,
): PythonReel[] {
  const target = targetDifficulty[experience];
  const day = new Date().toISOString().slice(0, 10);
  const rawScore = (reel: PythonReel) => {
    const views = history.views[reel.id] ?? 0;
    const feedback = history.feedback[reel.id];
    const affinity = reel.tags.reduce((sum, tag) => sum + (history.tagAffinity[tag] ?? 0), 0);
    return (
      24 / (views + 1) -
      Math.abs(reel.difficulty - target) * 2.6 +
      affinity * 1.8 +
      (history.liked.includes(reel.id) ? 2 : 0) +
      (feedback === "more" ? 5 : feedback === "less" ? -30 : 0) +
      stableNoise(`${day}:${reel.id}`) * 3
    );
  };

  const remaining = reels
    .map((reel) => ({ reel, score: rawScore(reel) }))
    .sort((a, b) => b.score - a.score);
  const ordered: PythonReel[] = [];
  while (remaining.length) {
    const recent = ordered.slice(-2);
    let best = 0;
    let bestScore = -Infinity;
    for (let index = 0; index < remaining.length; index += 1) {
      const candidate = remaining[index];
      const repeatFormat = recent.filter((reel) => reel.format === candidate.reel.format).length;
      const repeatPalette = recent.filter((reel) => reel.palette === candidate.reel.palette).length;
      const repeatTopic = recent.some((reel) =>
        reel.tags.some((tag) => candidate.reel.tags.includes(tag)),
      );
      const diverseScore =
        candidate.score - repeatFormat * 7 - repeatPalette * 3 - (repeatTopic ? 4 : 0);
      if (diverseScore > bestScore) {
        best = index;
        bestScore = diverseScore;
      }
    }
    ordered.push(remaining.splice(best, 1)[0].reel);
  }
  return ordered;
}

export function withView(history: ReelHistory, reel: PythonReel): ReelHistory {
  return {
    ...history,
    views: { ...history.views, [reel.id]: (history.views[reel.id] ?? 0) + 1 },
    lastSeenAt: { ...history.lastSeenAt, [reel.id]: Date.now() },
  };
}

export function withToggle(
  history: ReelHistory,
  field: "liked" | "saved",
  reel: PythonReel,
): ReelHistory {
  const current = history[field];
  const active = current.includes(reel.id);
  const next = active ? current.filter((id) => id !== reel.id) : [...current, reel.id];
  const affinity = { ...history.tagAffinity };
  if (field === "liked") {
    for (const tag of reel.tags) affinity[tag] = (affinity[tag] ?? 0) + (active ? -1 : 1);
  }
  return { ...history, [field]: next, tagAffinity: affinity };
}

export function withFeedback(
  history: ReelHistory,
  reel: PythonReel,
  feedback: ReelFeedback,
): ReelHistory {
  const affinity = { ...history.tagAffinity };
  const delta = feedback === "more" ? 1 : feedback === "less" ? -2 : 0;
  for (const tag of reel.tags) affinity[tag] = (affinity[tag] ?? 0) + delta;
  return {
    ...history,
    feedback: { ...history.feedback, [reel.id]: feedback },
    tagAffinity: affinity,
  };
}


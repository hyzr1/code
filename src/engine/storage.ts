import type { AttemptLog, Progress } from "../types";

const KEY = "forge.progress.v1";

export function emptyProgress(): Progress {
  return { concepts: {}, cleared: {}, attempts: [], sessions: [], lectureReviews: [], manualComplete: {} };
}

export function loadProgress(): Progress {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return emptyProgress();
    const parsed = JSON.parse(raw) as Partial<Progress>;
    return {
      concepts: parsed.concepts ?? {},
      cleared: parsed.cleared ?? {},
      attempts: parsed.attempts ?? [],
      sessions: parsed.sessions ?? [],
      lectureReviews: parsed.lectureReviews ?? [],
      manualComplete: parsed.manualComplete ?? {},
    };
  } catch {
    return emptyProgress();
  }
}

export function saveProgress(progress: Progress): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(progress));
  } catch {
    // Quota or private mode. Losing a session beats crashing mid-problem.
  }
}

export function logAttempt(progress: Progress, attempt: AttemptLog): void {
  progress.attempts.push(attempt);
  // Keep the log bounded; the mastery model holds the state that matters.
  if (progress.attempts.length > 2000) {
    progress.attempts.splice(0, progress.attempts.length - 2000);
  }
}

export function todayKey(now = Date.now()): string {
  return new Date(now).toISOString().slice(0, 10);
}

export function recordSessionTime(
  progress: Progress,
  seconds: number,
  units: number,
  now = Date.now(),
): void {
  const date = todayKey(now);
  const entry = progress.sessions.find((s) => s.date === date);
  if (entry) {
    entry.seconds += seconds;
    entry.units += units;
  } else {
    progress.sessions.push({ date, seconds, units });
  }
}

export function streakDays(progress: Progress, now = Date.now()): number {
  const dates = new Set(progress.sessions.filter((s) => s.units > 0).map((s) => s.date));
  let streak = 0;
  for (let i = 0; ; i++) {
    const day = todayKey(now - i * 86_400_000);
    if (dates.has(day)) streak++;
    else if (i > 0) break;
  }
  return streak;
}

export function exportProgress(progress: Progress): string {
  return JSON.stringify(progress, null, 2);
}

export function importProgress(json: string): Progress | null {
  try {
    const parsed = JSON.parse(json) as Partial<Progress>;
    if (!parsed || typeof parsed !== "object" || !parsed.concepts) return null;
    return {
      concepts: parsed.concepts,
      cleared: parsed.cleared ?? {},
      attempts: parsed.attempts ?? [],
      sessions: parsed.sessions ?? [],
      lectureReviews: parsed.lectureReviews ?? [],
      manualComplete: parsed.manualComplete ?? {},
    };
  } catch {
    return null;
  }
}

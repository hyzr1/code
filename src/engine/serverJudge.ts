import type { RunResult } from "../types";

export async function submitToJudge(problemId: string, code: string): Promise<RunResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 25_000);
  try {
    const response = await fetch("/api/judge", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ problemId, code }),
      signal: controller.signal,
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(data.error || "Server judge unavailable") as Error & { status?: number };
      error.status = response.status;
      throw error;
    }
    return { ...(data as RunResult), verified: true };
  } finally {
    clearTimeout(timer);
  }
}

import type { CourseLanguage, RunResult, TestSpec } from "../types";
import { runPythonTests } from "./pythonRunner";

const TIMEOUT_MS = 5000;

/**
 * Runs user code against a test suite in a throwaway worker.
 *
 * Every run gets a fresh worker, so leaked globals and monkey-patched builtins
 * can't survive between attempts. The worker is terminated either way — that
 * is also the infinite-loop guard, since a spinning worker can't be asked
 * politely to stop.
 */
export function runTests(
  code: string,
  exportName: string,
  tests: TestSpec[],
  language: CourseLanguage = "javascript",
): Promise<RunResult> {
  if (language === "python") return runPythonTests(code, exportName, tests);
  return new Promise((resolve) => {
    const worker = new Worker(new URL("./worker.ts", import.meta.url), {
      type: "module",
    });

    let settled = false;
    const finish = (result: RunResult) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      worker.terminate();
      resolve(result);
    };

    const timer = setTimeout(() => {
      finish({
        ok: false,
        timedOut: true,
        fatal: `Stopped after ${TIMEOUT_MS / 1000}s.\nUsually an infinite loop — check that every loop advances and every recursion has a base case.`,
        results: [],
        logs: [],
        ms: TIMEOUT_MS,
      });
    }, TIMEOUT_MS);

    worker.onmessage = (event: MessageEvent<RunResult>) => finish(event.data);

    worker.onerror = (event) => {
      event.preventDefault();
      finish({
        ok: false,
        fatal: event.message || "The sandbox crashed.",
        results: [],
        logs: [],
        ms: 0,
      });
    };

    worker.postMessage({ code, exportName, tests });
  });
}

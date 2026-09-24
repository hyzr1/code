import type { RunResult, TestSpec } from "../types";

const FIRST_RUN_TIMEOUT = 30_000;
const RUN_TIMEOUT = 8_000;

let worker: Worker | null = null;
let warmed = false;
let nextId = 1;

function resetWorker() {
  worker?.terminate();
  worker = null;
  warmed = false;
}

export function runPythonTests(
  code: string,
  exportName: string,
  tests: TestSpec[],
): Promise<RunResult> {
  if (!worker) {
    worker = new Worker(new URL("./python.worker.ts", import.meta.url), {
      type: "module",
    });
  }
  const active = worker;
  const id = nextId++;

  return new Promise((resolve) => {
    const timeout = warmed ? RUN_TIMEOUT : FIRST_RUN_TIMEOUT;
    const timer = setTimeout(() => {
      cleanup();
      resetWorker();
      resolve({
        ok: false,
        timedOut: true,
        fatal: `Stopped after ${timeout / 1000}s. Check for an infinite loop or recursion without a base case.`,
        results: [],
        logs: [],
        ms: timeout,
      });
    }, timeout);

    const onMessage = (event: MessageEvent<{ id: number; result: RunResult }>) => {
      if (event.data.id !== id) return;
      cleanup();
      warmed = true;
      resolve(event.data.result);
    };
    const onError = (event: ErrorEvent) => {
      event.preventDefault();
      cleanup();
      resetWorker();
      resolve({
        ok: false,
        fatal: event.message || "The Python sandbox crashed.",
        results: [],
        logs: [],
        ms: 0,
      });
    };
    const cleanup = () => {
      clearTimeout(timer);
      active.removeEventListener("message", onMessage);
      active.removeEventListener("error", onError);
    };

    active.addEventListener("message", onMessage);
    active.addEventListener("error", onError);
    active.postMessage({ id, code, exportName, tests });
  });
}

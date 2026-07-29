/// <reference lib="webworker" />
import { expect, assert, deepEqual, format, AssertionError } from "./harness";
import type { RunResult, TestResult, TestSpec } from "../types";

const AsyncFunction = Object.getPrototypeOf(async function () {})
  .constructor as new (...args: string[]) => (
  ...args: unknown[]
) => Promise<unknown>;

interface Request {
  code: string;
  exportName: string;
  tests: TestSpec[];
}

let sink: string[] | null = null;
const realConsole = { ...console };

for (const level of ["log", "info", "warn", "error", "debug"] as const) {
  console[level] = (...args: unknown[]) => {
    const line = args
      .map((a) => (typeof a === "string" ? a : format(a)))
      .join(" ");
    if (sink) sink.push(line);
    realConsole[level](...args);
  };
}

function describeError(err: unknown): string {
  if (err instanceof AssertionError) return err.message;
  if (err instanceof Error) {
    // Stack frames point into generated Functions and mean nothing to the
    // reader, so surface only the useful line.
    return `${err.name}: ${err.message}`;
  }
  return `threw ${format(err)}`;
}

self.onmessage = async (event: MessageEvent<Request>) => {
  const { code, exportName, tests } = event.data;
  const started = performance.now();
  const setupLogs: string[] = [];

  const reply = (partial: Partial<RunResult>): void => {
    const result: RunResult = {
      ok: false,
      results: [],
      logs: setupLogs,
      ms: Math.round(performance.now() - started),
      ...partial,
    };
    self.postMessage(result);
  };

  // ---- 1. build the user's code -----------------------------------------
  let subject: unknown;
  sink = setupLogs;
  try {
    const factory = new AsyncFunction(
      `"use strict";\n${code}\n;return typeof ${exportName} !== "undefined" ? ${exportName} : undefined;`,
    );
    subject = await factory();
  } catch (err) {
    sink = null;
    reply({ fatal: describeError(err) });
    return;
  } finally {
    sink = null;
  }

  if (subject === undefined) {
    reply({
      fatal: `Nothing named \`${exportName}\` was defined.\nDeclare it at the top level — \`function ${exportName}(…) { … }\`.`,
    });
    return;
  }

  // ---- 2. run each test in isolation -------------------------------------
  const results: TestResult[] = [];

  for (const test of tests) {
    const logs: string[] = [];
    sink = logs;
    let passed = false;
    let message: string | undefined;

    try {
      const run = new AsyncFunction(
        "fn",
        "expect",
        "assert",
        "deepEqual",
        `"use strict";\n${test.code}`,
      );
      await run(subject, expect, assert, deepEqual);
      passed = true;
    } catch (err) {
      message = describeError(err);
    } finally {
      sink = null;
    }

    results.push({
      name: test.name,
      hidden: test.hidden ?? false,
      passed,
      message,
      logs,
    });
  }

  reply({ ok: results.every((r) => r.passed), results });
};

import type { RunResult, TestSpec } from "../types";
import { loadPyodide } from "pyodide";

interface PyodideApi {
  runPythonAsync: (source: string, options?: { globals?: unknown }) => Promise<unknown>;
  globals: { set: (name: string, value: unknown) => void };
}

let runtime: Promise<PyodideApi> | null = null;

async function loadRuntime(): Promise<PyodideApi> {
  if (!runtime) {
    // Import the loader through Vite, but keep the 13 MB runtime payload in
    // public/pyodide. A dynamic import pointed directly at a public .mjs file
    // is rewritten to `?import` by Vite 8 in development and fails with 500.
    // The package loader is tiny and resolves the heavy local assets from the
    // explicit index URL in both dev and production.
    // Pyodide types `globals` as the base PyProxy even though the runtime
    // object is the globals dictionary and implements Map.set.
    const loading = loadPyodide({ indexURL: "/pyodide/" }) as unknown as Promise<PyodideApi>;
    runtime = loading.catch((error) => {
      // A transient asset failure should not poison every later Run click in
      // this worker. Let the next submission try initialization again.
      runtime = null;
      throw error;
    });
  }
  return runtime;
}

const HARNESS = String.raw`
import contextlib
import ast
import io
import inspect
import json
import time
import traceback

def _message(error):
    if isinstance(error, AssertionError):
        return str(error) or "Assertion failed"
    return f"{type(error).__name__}: {error}"

async def _run_submission(code, export_name, tests_json):
    started = time.perf_counter()
    suite_logs = []
    results = []
    scope = {"__name__": "__submission__"}
    capture = io.StringIO()

    try:
        with contextlib.redirect_stdout(capture):
            exec(compile(code, "submission.py", "exec"), scope, scope)
        suite_logs = capture.getvalue().splitlines()
    except BaseException as error:
        return json.dumps({
            "ok": False,
            "fatal": _message(error),
            "results": [],
            "logs": capture.getvalue().splitlines(),
            "ms": round((time.perf_counter() - started) * 1000),
        })

    if export_name not in scope or not callable(scope[export_name]):
        return json.dumps({
            "ok": False,
            "fatal": f"Define a function named {export_name}.",
            "results": [],
            "logs": suite_logs,
            "ms": round((time.perf_counter() - started) * 1000),
        })

    subject = scope[export_name]
    for test in json.loads(tests_json):
        test_capture = io.StringIO()
        try:
            test_scope = dict(scope)
            test_scope["fn"] = subject
            with contextlib.redirect_stdout(test_capture):
                compiled = compile(test["code"], "test.py", "exec", flags=ast.PyCF_ALLOW_TOP_LEVEL_AWAIT)
                pending = eval(compiled, test_scope, test_scope)
                if inspect.isawaitable(pending):
                    await pending
            passed, message = True, None
        except BaseException as error:
            passed, message = False, _message(error)
        results.append({
            "name": test["name"],
            "hidden": bool(test.get("hidden", False)),
            "passed": passed,
            "message": message,
            "logs": test_capture.getvalue().splitlines(),
        })

    return json.dumps({
        "ok": all(item["passed"] for item in results),
        "results": results,
        "logs": suite_logs,
        "ms": round((time.perf_counter() - started) * 1000),
    })
`;

self.onmessage = async (
  event: MessageEvent<{ id: number; code: string; exportName: string; tests: TestSpec[] }>,
) => {
  const { id, code, exportName, tests } = event.data;
  try {
    const pyodide = await loadRuntime();
    pyodide.globals.set("submission_code", code);
    pyodide.globals.set("submission_name", exportName);
    pyodide.globals.set("submission_tests", JSON.stringify(tests));
    await pyodide.runPythonAsync(HARNESS);
    const json = await pyodide.runPythonAsync(
      "await _run_submission(submission_code, submission_name, submission_tests)",
    );
    self.postMessage({ id, result: JSON.parse(String(json)) as RunResult });
  } catch (error) {
    self.postMessage({
      id,
      result: {
        ok: false,
        fatal: error instanceof Error ? error.message : String(error),
        results: [],
        logs: [],
        ms: 0,
      } satisfies RunResult,
    });
  }
};

export {};

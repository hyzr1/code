/**
 * Solution gate — every published solution passes its own tests.
 *
 * Mirrors `engine/worker.ts` exactly: same AsyncFunction sandbox, same
 * `fn`/`expect`/`assert`/`deepEqual` signature, same "define it at the top
 * level" contract. If this passes, the app's runner agrees.
 *
 * Catches the failure a typecheck can't see — a hint that contradicts the
 * tests, a solution that regressed when a test was tightened, an async rep
 * whose test forgot to await.
 *
 * Run: npm run check:solutions
 */
import { PROBLEMS } from "../.check/content.mjs";
import { expect, assert, deepEqual } from "../.check/harness.mjs";
import { loadPyodide } from "pyodide";

const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;

const failures = [];
let checked = 0;
let pythonRuntime;

for (const problem of PROBLEMS) {
  if (!problem.solution || !problem.tests?.length) continue;

  if (problem.language === "python") {
    try {
      pythonRuntime ??= await loadPyodide();
      pythonRuntime.globals.set("__check_solution", problem.solution);
      pythonRuntime.globals.set("__check_name", problem.exportName);
      await pythonRuntime.runPythonAsync(`
__check_scope = {"__name__": "__solution__"}
exec(compile(__check_solution, "solution.py", "exec"), __check_scope, __check_scope)
if __check_name not in __check_scope or not callable(__check_scope[__check_name]):
    raise AssertionError(f'solution defines nothing callable named "{__check_name}"')
__check_fn = __check_scope[__check_name]
`);
    } catch (err) {
      failures.push(`${problem.id} · solution does not build\n      ${err.message}`);
      continue;
    }

    for (const test of problem.tests) {
      checked += 1;
      try {
        pythonRuntime.globals.set("__check_test", test.code);
        await pythonRuntime.runPythonAsync(
          `import ast, inspect\n__test_scope = dict(__check_scope)\n__test_scope["fn"] = __check_fn\n__pending = eval(compile(__check_test, "test.py", "exec", flags=ast.PyCF_ALLOW_TOP_LEVEL_AWAIT), __test_scope, __test_scope)\nif inspect.isawaitable(__pending):\n    await __pending`,
        );
      } catch (err) {
        failures.push(`${problem.id} · test "${test.name}"\n      ${err.message}`);
      }
    }
    continue;
  }

  let subject;
  try {
    const factory = new AsyncFunction(
      `"use strict";\n${problem.solution}\n;return typeof ${problem.exportName} !== "undefined" ? ${problem.exportName} : undefined;`,
    );
    subject = await factory();
  } catch (err) {
    failures.push(`${problem.id} · solution does not build\n      ${err.message}`);
    continue;
  }

  if (subject === undefined) {
    failures.push(`${problem.id} · solution defines nothing named "${problem.exportName}"`);
    continue;
  }

  for (const test of problem.tests) {
    checked += 1;
    try {
      const run = new AsyncFunction(
        "fn",
        "expect",
        "assert",
        "deepEqual",
        `"use strict";\n${test.code}`,
      );
      await run(subject, expect, assert, deepEqual);
    } catch (err) {
      failures.push(`${problem.id} · test "${test.name}"\n      ${err.message}`);
    }
  }
}

if (failures.length) {
  console.log(`\n${failures.length} failing solutions\n`);
  for (const f of failures) console.log("  " + f + "\n");
  process.exit(1);
}

console.log(
  `\nsolutions clean - ${checked} assertions across ${PROBLEMS.length} units, every published solution passes\n`,
);

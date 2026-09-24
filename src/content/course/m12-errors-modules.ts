import type { Atom, Drill, Lesson, Problem } from "../../types";
import { rep, stub } from "../rep";

/**
 * M12 — Errors, modules, and the odds and ends.
 *
 * The modules lesson uses drills rather than reps on purpose: the sandbox runs
 * one function, so there is no honest way to *execute* an import. Recall and
 * type-it-out train the syntax without pretending otherwise.
 */
export const M12_ATOMS: Atom[] = [
  {
    id: "teach.throwing",
    title: "Throwing and catching",
    teaches: ["js.errors"],
    requires: ["js.flow.guards", "js.classes"],
    readingSeconds: 175,
    recall:
      "Name the two situations where returning `null` beats throwing, and the one where throwing is the only honest answer.",
    body: `\`throw\` stops the current function immediately and hands an error to whoever is willing to catch it.

\`\`\`js
function divide(a, b) {
  if (b === 0) throw new Error("cannot divide by zero");
  return a / b;
}
\`\`\`

Nothing after the \`throw\` runs. The function doesn't return; it *fails*, and the failure travels up through every caller until something catches it or the program stops.

## Always throw an Error

You can technically throw anything — a string, a number, an object. Don't.

\`\`\`js
throw "something broke";        // works, and you'll regret it
throw new Error("something broke");   // do this
\`\`\`

An \`Error\` carries three things a string doesn't:

\`\`\`js
const err = new Error("not found");
err.message;   // "not found"
err.name;      // "Error"
err.stack;     // where it was created, line by line
\`\`\`

That \`stack\` is the difference between a five-second fix and an afternoon. And code that catches errors nearly always reads \`err.message\` — given a string, that's \`undefined\`.

## try, catch, finally

\`\`\`js
try {
  return divide(10, 0);
} catch (err) {
  // only runs if something in the try threw
  return 0;
} finally {
  // runs no matter what, including after a return
  cleanup();
}
\`\`\`

\`finally\` runs on success, on failure, and even when the \`try\` block returns — the return value is held, \`finally\` runs, then the return completes. That's what makes it right for releasing things: closing files, clearing loading flags, unlocking.

The binding is optional if you don't need it:

\`\`\`js
try {
  risky();
} catch {
  // no variable — fine when the reason doesn't matter
}
\`\`\`

## Catching too much

This is the single most damaging error-handling habit:

\`\`\`js
try {
  return JSON.parse(text);
} catch {
  return {};       // hides EVERY problem, not just bad JSON
}
\`\`\`

A typo inside the \`try\` now silently returns \`{}\`. So does a missing variable, a bug you introduced yesterday, and an out-of-memory failure. The bug report says "it returns an empty object sometimes" and there is nothing in the logs.

Two rules keep this honest:

**Keep the \`try\` block small.** Only the line that can actually fail belongs inside it.

**Handle what you recognise, rethrow the rest.**

\`\`\`js
try {
  return JSON.parse(text);
} catch (err) {
  // the only failure we actually expect here
  if (err instanceof SyntaxError) return null;
  throw err;
}
\`\`\`

## Custom error types

When a caller needs to tell failures apart, give the failure a type:

\`\`\`js
class NotFoundError extends Error {
  constructor(id) {
    super(\`no record \${id}\`);   // sets message
    this.name = "NotFoundError";
    this.id = id;
  }
}
\`\`\`

\`super(message)\` is required — it's \`Error\`'s constructor that sets \`message\` and captures the stack. Setting \`name\` is what makes it print usefully.

Now the caller can branch on the type instead of matching text:

\`\`\`js
catch (err) {
  if (err instanceof NotFoundError) return null;
  throw err;
}
\`\`\`

Compare that with \`if (err.message.includes("no record"))\`, which breaks the day someone rewords the message.

## Throw or return null?

Not everything unusual is an error.

**Return \`null\`** when nothing is wrong — the answer simply doesn't exist. A search with no match, a lookup for a key that isn't there, an optional field. Callers expect it and handle it in a line.

**Throw** when the function cannot do its job and continuing would be worse than stopping. Invalid arguments, a broken invariant, a failed connection.

The test that decides it: *is this expected?* A user searching for a name that isn't there is expected. A config file with no database URL is not.

Throwing for ordinary absence forces every caller to wrap you in \`try\`/\`catch\`, which is noisy and gets skipped. Returning \`null\` for a genuine failure means the wrong value flows onward until it breaks somewhere unrelated — the harder bug of the two.

## Built-in error types

You'll see these thrown at you, and you can check for them:

- \`TypeError\` — wrong type, usually reading a property of \`undefined\`
- \`ReferenceError\` — a name that doesn't exist
- \`SyntaxError\` — unparseable code or JSON
- \`RangeError\` — a number outside what's allowed

All of them extend \`Error\`, so \`err instanceof Error\` is true for every one.`,
  },
  {
    id: "teach.modules",
    title: "Modules",
    teaches: ["js.modules"],
    requires: ["js.functions.basics"],
    readingSeconds: 165,
    recall:
      "A module is imported by five different files. How many times does its top-level code run?",
    body: `A **module** is one file. Everything in it is private unless you \`export\` it, and nothing from elsewhere is visible unless you \`import\` it.

That's the whole idea: no shared global namespace, and every name you use has a visible source.

## Named exports

\`\`\`js
// math.js
export function add(a, b) {
  return a + b;
}
export const PI = 3.14159;
\`\`\`

\`\`\`js
// main.js
import { add, PI } from "./math.js";
\`\`\`

The braces are not an object — they're a list of names to pull out, and each must match the export exactly. Rename on the way in when there's a clash:

\`\`\`js
import { add as addNumbers } from "./math.js";
\`\`\`

You can also declare first and export at the bottom, which some codebases prefer because the exports are all in one place:

\`\`\`js
function add(a, b) {
  return a + b;
}
// every export gathered in one place, at the bottom
export { add };
\`\`\`

## Default exports

One per file, and the importer picks the name:

\`\`\`js
// Button.js
export default function Button() {}
\`\`\`

\`\`\`js
// no braces, and the name is yours to choose
import Button from "./Button.js";
import AnyName from "./Button.js";   // also legal
\`\`\`

That freedom is the argument against them: the same module can be called three different things in three files, so searching for usages gets harder. **Prefer named exports.** Default is worth it when a file has exactly one obvious thing in it — a React component, a config object.

Both can coexist:

\`\`\`js
import Button, { SIZES } from "./Button.js";
\`\`\`

## Modules run once

The first time a module is imported anywhere, its top-level code runs. Every later import of the same file gets the **same already-built** exports back.

\`\`\`js
// counter.js — this line runs exactly once, ever
export const state = { count: 0 };
\`\`\`

Import that from five files and all five share one object. Mutating it from one is visible in the others.

This makes modules the simplest singleton in JavaScript, which is useful when deliberate and a nasty surprise when not. Top-level state is shared state.

## Imports are hoisted

All \`import\` statements are processed before any of the file's own code runs, regardless of where you wrote them. So imports can't be conditional:

\`\`\`js
// not allowed — imports are static
if (dev) import "./debug.js";
\`\`\`

When you genuinely need a conditional or lazy load, \`import()\` is a function that returns a promise:

\`\`\`js
// loaded only when this line runs
const { debug } = await import("./debug.js");
\`\`\`

That's also how code-splitting works — the bundler sees the dynamic import and puts that file in a separate chunk.

## Circular imports

A imports B, B imports A. It doesn't crash, but one of them sees the other half-built, and you get \`undefined\` where a function should be.

The fix is almost never clever ordering. It's a third module holding the thing they both need. If two files import each other, the shared piece belongs somewhere else.

## Paths

\`\`\`js
import { add } from "./math.js";      // relative — your own files
import React from "react";            // bare — a package
\`\`\`

A path starting with \`.\` or \`/\` is a file. Anything else is a package name resolved from \`node_modules\`. In the browser and in Node's native modules the \`.js\` extension is required; bundlers usually let you omit it, which is why you'll see both.`,
  },
  {
    id: "teach.json",
    title: "JSON and dates",
    teaches: ["js.json"],
    requires: ["js.object.access", "js.errors"],
    readingSeconds: 175,
    recall:
      "You `JSON.stringify` an object holding a `Date`, a `Map` and an `undefined`. What comes back for each?",
    body: `**JSON** is text. Two functions move between it and real JavaScript values.

\`\`\`js
JSON.stringify({ a: 1 });     // '{"a":1}'  — an object becomes text
JSON.parse('{"a":1}');        // { a: 1 }   — text becomes an object
\`\`\`

That's the whole API, plus one formatting argument:

\`\`\`js
// the 2 is how many spaces to indent — for humans, not machines
JSON.stringify({ a: 1 }, null, 2);
\`\`\`

## What JSON cannot hold

This is the part that causes real bugs. JSON has six types: object, array, string, number, boolean, null. Anything else is converted or dropped, **silently**.

\`\`\`js
JSON.stringify({
  fn: () => 1,        // dropped entirely
  un: undefined,      // dropped entirely
  date: new Date(),   // becomes a string
  set: new Set([1]),  // becomes {}
  map: new Map(),     // becomes {}
  nan: NaN,           // becomes null
  inf: Infinity,      // becomes null
});
// '{"date":"2024-01-01T00:00:00.000Z","set":{},"map":{},"nan":null,"inf":null}'
\`\`\`

Read that output carefully. \`fn\` and \`un\` aren't there at all — no error, no warning, the keys simply vanish. \`set\` and \`map\` survive as empty objects, which is worse: the key exists and the data is gone.

In an array, \`undefined\` becomes \`null\` instead of disappearing, because an array can't have a hole in the middle of its text form:

\`\`\`js
JSON.stringify([1, undefined, 3]);   // "[1,null,3]"
\`\`\`

## The round trip is not an identity

\`\`\`js
const before = { when: new Date() };
const after = JSON.parse(JSON.stringify(before));

typeof after.when;   // "string" — it went out as a Date and came back as text
\`\`\`

Dates are the usual casualty. \`JSON.parse\` has no idea that a string was once a \`Date\`, so anything reading \`.getTime()\` on it now throws.

## Deep clone, and its limits

\`\`\`js
const copy = JSON.parse(JSON.stringify(original));
\`\`\`

You will see this everywhere as a deep-copy trick. It works only when the object holds nothing but JSON's six types — and it throws outright on a circular reference.

The modern answer handles dates, maps, sets and cycles:

\`\`\`js
const copy = structuredClone(original);
\`\`\`

It still can't clone functions, and it never will — a function can't be meaningfully copied out of its closure.

## parse throws

\`JSON.parse\` throws a \`SyntaxError\` on anything malformed, and user input and network responses are frequently malformed.

\`\`\`js
function safeParse(text) {
  try {
    return JSON.parse(text);
  } catch (err) {
    // only this failure is expected here
    if (err instanceof SyntaxError) return null;
    throw err;
  }
}
\`\`\`

An unguarded \`JSON.parse\` on anything you didn't create yourself is a crash waiting for bad input.

## Dates, briefly

\`\`\`js
Date.now();                       // milliseconds since 1970, as a number
const d = new Date();             // now, as an object
new Date("2024-03-01T10:00:00Z"); // from an ISO string
\`\`\`

Two things about the API will catch you.

**Months are zero-based. Days are not.**

\`\`\`js
// 0 is January, so this is 1 March 2024
new Date(2024, 2, 1);
\`\`\`

Nobody finds this intuitive, and it is a genuine off-by-one factory. It's a leftover from C, kept for compatibility.

**Dates are mutable and compare badly.**

\`\`\`js
const a = new Date("2024-01-01");
const b = new Date("2024-01-01");
a === b;                     // false — two different objects
a.getTime() === b.getTime(); // true  — compare the numbers
\`\`\`

Same trap as any object: \`===\` asks "the same object?", not "the same value?". Compare with \`getTime()\`, or subtract them — \`b - a\` converts both to numbers and gives you the gap in milliseconds.

For output, prefer the unambiguous form:

\`\`\`js
d.toISOString();   // "2024-03-01T10:00:00.000Z" — sortable, no locale surprises
\`\`\`

\`toString\` and \`toLocaleDateString\` depend on where the machine thinks it is, which makes them fine for display and wrong for storage.

Date arithmetic beyond "subtract two dates" — adding months, handling time zones, daylight saving — is genuinely hard, and every experienced developer reaches for a library. Knowing that is the useful part.`,
  },
];

export const M12_REPS: Problem[] = [
  rep({
    id: "r.throw.1",
    lesson: "l12.1",
    teaches: ["js.errors"],
    title: "Throw a real Error",
    prompt:
      "Divide `a` by `b`. If `b` is `0`, throw an `Error` whose message is exactly `\"cannot divide by zero\"`.",
    exportName: "divide",
    starter: stub("divide", "a, b"),
    tests: [
      { name: "divides", code: `expect(fn(10, 2)).toBe(5);` },
      {
        name: "throws an Error, not a string",
        code: `let caught;
try { fn(1, 0); } catch (e) { caught = e; }
expect(caught instanceof Error).toBe(true);
expect(caught.message).toBe("cannot divide by zero");`,
      },
    ],
    hint: "A guard clause at the top: `if (b === 0) throw new Error(\"cannot divide by zero\");`",
    solution:
      'function divide(a, b) {\n  if (b === 0) throw new Error("cannot divide by zero");\n  return a / b;\n}',
    mistakes: [
      {
        match: 'throw "cannot',
        hint: "A string has no `message` and no stack trace. Wrap it in `new Error(...)`.",
      },
    ],
    seconds: 55,
  }),
  rep({
    id: "r.throw.2",
    lesson: "l12.1",
    teaches: ["js.errors"],
    title: "A typed error",
    prompt:
      "Define a `NotFoundError` extending `Error` with `name` set to `\"NotFoundError\"` and the offending `id` stored on it. Return a new one for the given id, with the message `\"no record <id>\"`.",
    exportName: "notFound",
    starter: stub("notFound", "id"),
    tests: [
      {
        name: "is a real Error",
        code: `expect(fn(7) instanceof Error).toBe(true);`,
      },
      { name: "names itself", code: `expect(fn(7).name).toBe("NotFoundError");` },
      { name: "carries the message", code: `expect(fn(7).message).toBe("no record 7");` },
      { name: "carries the id", code: `expect(fn(7).id).toBe(7);` },
    ],
    hint: "`super(...)` must run first — it's `Error`'s constructor that sets `message` and captures the stack. Then set `this.name` and `this.id`.",
    solution:
      'function notFound(id) {\n  class NotFoundError extends Error {\n    constructor(id) {\n      super(`no record ${id}`);\n      this.name = "NotFoundError";\n      this.id = id;\n    }\n  }\n  return new NotFoundError(id);\n}',
    seconds: 90,
  }),
  rep({
    id: "r.throw.3",
    lesson: "l12.1",
    teaches: ["js.errors"],
    title: "Catch only what you know",
    prompt:
      "Run `task()` and return its value. A `SyntaxError` means bad input — return `null` for it. **Anything else must keep travelling.**",
    exportName: "parseOrNull",
    starter: stub("parseOrNull", "task"),
    tests: [
      { name: "passes the value through", code: `expect(fn(() => 1)).toBe(1);` },
      {
        name: "SyntaxError becomes null",
        code: `expect(fn(() => { throw new SyntaxError("bad"); })).toBe(null);`,
      },
      {
        name: "everything else still throws",
        code: `let caught = "";
try { fn(() => { throw new TypeError("real bug"); }); } catch (e) { caught = e.message; }
expect(caught).toBe("real bug");`,
      },
    ],
    hint: "`if (err instanceof SyntaxError) return null;` then a bare `throw err;`. A catch with no rethrow hides your own bugs.",
    solution:
      "function parseOrNull(task) {\n  try {\n    return task();\n  } catch (err) {\n    if (err instanceof SyntaxError) return null;\n    throw err;\n  }\n}",
    mistakes: [
      {
        match: "catch {\n    return null;",
        hint: "That swallows every failure, including typos in your own code. Check the type, and rethrow what you don't recognise.",
      },
    ],
    seconds: 80,
  }),

  rep({
    id: "r.json.1",
    lesson: "l12.3",
    teaches: ["js.json"],
    title: "Parse without crashing",
    prompt:
      "Parse `text` as JSON. Return `null` when it's malformed — but let any other failure keep travelling.",
    exportName: "safeParse",
    starter: stub("safeParse", "text"),
    tests: [
      { name: "parses good JSON", code: `expect(fn('{"a":1}')).toEqual({ a: 1 });` },
      { name: "bad JSON gives null", code: `expect(fn("{oops")).toBe(null);` },
      { name: "empty text gives null", code: `expect(fn("")).toBe(null);` },
      { name: "a bare number is valid JSON", code: `expect(fn("42")).toBe(42);` },
    ],
    hint: "Wrap `JSON.parse` in a `try`, and check `err instanceof SyntaxError` before returning `null`.",
    solution:
      "function safeParse(text) {\n  try {\n    return JSON.parse(text);\n  } catch (err) {\n    if (err instanceof SyntaxError) return null;\n    throw err;\n  }\n}",
    seconds: 70,
  }),
  rep({
    id: "r.json.2",
    lesson: "l12.3",
    teaches: ["js.json"],
    title: "What survives the round trip",
    prompt:
      "Return the list of keys that are still present after `JSON.parse(JSON.stringify(obj))`.\n\nSome keys don't survive — that's the point of the exercise.",
    exportName: "surviving",
    starter: stub("surviving", "obj"),
    tests: [
      {
        name: "functions and undefined are dropped",
        code: `const out = fn({ a: 1, fn: () => 1, un: undefined });
expect(out).toEqual(["a"]);`,
      },
      {
        name: "a Set survives as an empty object",
        code: `expect(fn({ s: new Set([1]) })).toEqual(["s"]);`,
      },
      { name: "empty object", code: `expect(fn({})).toEqual([]);` },
    ],
    hint: "Do the round trip, then `Object.keys` the result. The dropped keys are simply not there.",
    solution:
      "function surviving(obj) {\n  return Object.keys(JSON.parse(JSON.stringify(obj)));\n}",
    seconds: 65,
  }),
  rep({
    id: "r.json.3",
    lesson: "l12.3",
    teaches: ["js.json"],
    title: "Same day?",
    prompt:
      "Return `true` when two dates are the same instant. `===` won't do it — they're separate objects.",
    exportName: "sameInstant",
    starter: stub("sameInstant", "a, b"),
    tests: [
      {
        name: "equal instants, different objects",
        code: `expect(fn(new Date("2024-01-01"), new Date("2024-01-01"))).toBe(true);`,
      },
      {
        name: "different instants",
        code: `expect(fn(new Date("2024-01-01"), new Date("2024-01-02"))).toBe(false);`,
      },
    ],
    hint: "`a.getTime() === b.getTime()` — compare the numbers, not the objects.",
    solution:
      "function sameInstant(a, b) {\n  return a.getTime() === b.getTime();\n}",
    mistakes: [
      {
        match: "return a === b",
        hint: "`===` on objects asks whether they're the same object in memory, which two separate dates never are.",
      },
    ],
    seconds: 50,
  }),
];

export const M12_DRILLS: Drill[] = [
  {
    id: "d.mod.1",
    kind: "type-it-out",
    teaches: ["js.modules"],
    estimatedSeconds: 25,
    prompt: "Export a function `add` from this file, as a **named** export.",
    target: "export function add(a, b) {\n  return a + b;\n}",
    explanation:
      "Named exports keep the name attached to the thing, so every importing file calls it `add` and a search finds all of them.",
  },
  {
    id: "d.mod.2",
    kind: "type-it-out",
    teaches: ["js.modules"],
    estimatedSeconds: 20,
    prompt: "Import `add` and `PI` from the neighbouring file `./math.js`.",
    target: 'import { add, PI } from "./math.js";',
    explanation:
      "The braces are a list of names, not an object. Each one has to match an export exactly.",
  },
  {
    id: "d.mod.3",
    kind: "type-it-out",
    teaches: ["js.modules"],
    estimatedSeconds: 20,
    prompt:
      "Import the default export of `./Button.js`, calling it `Button`.",
    target: 'import Button from "./Button.js";',
    explanation:
      "No braces for a default, and the name is yours to pick — which is exactly why default exports make a codebase harder to search.",
  },
  {
    id: "d.mod.4",
    kind: "predict-output",
    teaches: ["js.modules"],
    estimatedSeconds: 40,
    prompt:
      "`counter.js` is imported by three different files. What is logged in total?",
    code: `// counter.js
console.log("loading");
export const state = { count: 0 };`,
    choices: [
      '"loading" once',
      '"loading" three times',
      "nothing — top-level code doesn't run",
      "it depends on import order",
    ],
    answer: 0,
    explanation:
      "A module's top-level code runs the first time it is imported anywhere, and never again. All three importers share the same `state` object — which is what makes top-level state shared state.",
  },
  {
    id: "d.mod.5",
    kind: "predict-output",
    teaches: ["js.modules"],
    estimatedSeconds: 35,
    prompt: "Is this legal?",
    code: `if (isDev) {
  import "./debug.js";
}`,
    choices: [
      "No — imports are static and hoisted; use `await import(...)`",
      "Yes, it loads only in dev",
      "Yes, but only in Node",
      "Only inside an async function",
    ],
    answer: 0,
    explanation:
      "All `import` statements are resolved before any of the file's own code runs, so they can't be conditional. `import()` as a function returns a promise and is the lazy form — it's also what bundlers use to split code.",
  },
  {
    id: "d.mod.6",
    kind: "predict-output",
    teaches: ["js.modules"],
    estimatedSeconds: 35,
    prompt: "`a.js` imports `b.js`, and `b.js` imports `a.js`. What happens?",
    choices: [
      "One of them sees the other half-built and gets `undefined`",
      "A crash — circular imports are a hard error",
      "Nothing; the bundler deduplicates them",
      "The second import is silently skipped",
    ],
    answer: 0,
    explanation:
      "It doesn't crash, which is what makes it hard to spot — one side just runs before the other has finished, and reads `undefined` where a function should be. Reordering rarely helps. If two files need each other, the piece they share belongs in a third file both can import.",
  },
];

export const M12_LESSONS: Lesson[] = [
  {
    id: "l12.1",
    moduleId: "m12",
    title: "Throwing and catching",
    goal: "Fail loudly with real Errors, catch only what you recognise, and know when `null` is the better answer.",
    atomId: "teach.throwing",
    repIds: ["r.throw.1", "r.throw.2", "r.throw.3"],
    problemIds: [],
  },
  {
    id: "l12.2",
    moduleId: "m12",
    title: "Modules",
    goal: "import and export cold, plus the two behaviours that surprise people: run-once and hoisting.",
    atomId: "teach.modules",
    repIds: [],
    problemIds: [],
    drillIds: ["d.mod.1", "d.mod.2", "d.mod.3", "d.mod.4", "d.mod.5", "d.mod.6"],
  },
  {
    id: "l12.3",
    moduleId: "m12",
    title: "JSON and dates",
    goal: "What survives `stringify`, why `parse` needs a guard, and why two identical dates aren't equal.",
    atomId: "teach.json",
    repIds: ["r.json.1", "r.json.2", "r.json.3"],
    problemIds: [],
  },
];

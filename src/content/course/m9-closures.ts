import type { Atom, Lesson, Problem } from "../../types";
import { rep, stub } from "../rep";

/**
 * M9 — Closures and higher-order functions.
 *
 * The other module the app's own problems were assuming: `once`, `memoize` and
 * `debounce` all live or die on closures, and the course had never taught one.
 * Lesson 1 reuses the existing closures atom; the rest are new.
 */
export const M9_ATOMS: Atom[] = [
  {
    id: "teach.private-state",
    title: "Private state",
    teaches: ["js.functions.private-state"],
    requires: ["js.functions.closures"],
    readingSeconds: 170,
    recall:
      "Given `const c = counter()`, why can't outside code reach the count directly?",
    body: `A closure keeps variables alive after the function that made them has returned. That's a mechanism. Here's the thing it's *for*.

\`\`\`js
function counter() {
  let n = 0;
  return {
    increment: () => ++n,
    value: () => n,
  };
}

const c = counter();
c.increment();
c.value();   // 1
c.n;         // undefined — there is no n on this object
\`\`\`

\`n\` isn't hidden by convention or a naming rule. It is genuinely **unreachable**. The only things that can touch it are the two functions handed back, because they're the only things that were born inside that call.

## Why this matters

State that can only change through the functions you provide can only change in ways you allowed. There's no path to \`c.n = -50\`, so \`increment\` is the *only* history the value can have.

That's the entire idea behind a module, and it long predates classes.

## Each call gets its own

\`\`\`js
const a = counter();
const b = counter();

a.increment();
a.value();   // 1
b.value();   // 0
\`\`\`

Every call to \`counter\` creates a fresh \`n\`. Functions from different calls never share, functions from the same call always do. That's the rule from the closures lesson, doing real work.

## The shape

\`\`\`js
function make() {
  let hidden = 0;          // the state, private from here on
  return {                 // the only doors in
    read: () => hidden,
    write: (v) => { hidden = v; },
  };
}
\`\`\`

Declare state, return functions that use it, never return the state itself. Once you see that shape you'll notice it everywhere — it's how \`useState\` works, how a module keeps a cache, how a rate limiter remembers.

## The catch

Returning the state defeats the whole thing.

\`\`\`js
return { value: n };        // a snapshot — never updates
return { value: () => n };  // a live read
\`\`\`

The first copies the number out at the moment you build the object, and it's frozen at 0 forever. The second reads \`n\` each time it's called.

**A closure gives you a live link. Copying the value out throws it away.**`,
  },
  {
    id: "teach.factories",
    title: "Functions that return functions",
    teaches: ["js.functions.factories"],
    requires: ["js.functions.closures", "js.functions.as-values"],
    readingSeconds: 165,
    recall:
      "Write `multiplyBy(3)` so that the returned function multiplies its argument by 3.",
    body: `If a function can return an object, it can return a function. That function remembers where it was born, so it arrives pre-loaded with whatever you gave the outer call.

\`\`\`js
function multiplyBy(factor) {
  return (n) => n * factor;
}

const double = multiplyBy(2);
const triple = multiplyBy(3);

double(5);   // 10
triple(5);   // 15
\`\`\`

\`double\` and \`triple\` are the same code with different \`factor\`s. Two calls, two separate closures, neither aware of the other.

## What you've actually built

A **factory**: a function whose job is to produce configured functions. Read \`multiplyBy(2)\` as "give me a multiplier, set to 2".

The value of that is where the configuration goes. Compare:

\`\`\`js
items.map(n => multiply(n, 2));   // repeat the 2 at every call site
items.map(double);                // decide once, use everywhere
\`\`\`

The second reads better and can't drift — there's one place the 2 lives.

## The everyday version

\`\`\`js
const byKey = (key) => (a, b) => a[key] - b[key];

users.sort(byKey("age"));
scores.sort(byKey("value"));
\`\`\`

One comparator factory replaces every one-off sort function you'd otherwise write. The double arrow reads as "takes a key, gives back a comparator".

## The catch

The closure captures the **variable**, not a copy of its value.

\`\`\`js
function makeAll(factors) {
  const out = [];
  for (var i = 0; i < factors.length; i++) {
    out.push(() => factors[i]);
  }
  return out;
}
makeAll([2, 3]).map(f => f());   // [undefined, undefined]
\`\`\`

\`var i\` is one variable shared by every closure, and by the time they run it's past the end. Swap \`var\` for \`let\` and each iteration gets its own \`i\`, which is the fix — and the same trap from the closures lesson, wearing a different hat.`,
  },
  {
    id: "teach.callbacks",
    title: "Callbacks",
    teaches: ["js.functions.callbacks"],
    requires: ["js.functions.as-values"],
    readingSeconds: 170,
    recall:
      "What's the difference between `setTimeout(run, 100)` and `setTimeout(run(), 100)`?",
    body: `A **callback** is a function you hand to something else so it can call you back later, or repeatedly, or on some condition.

You've been writing them since Module 5:

\`\`\`js
items.map(n => n * 2);
items.filter(n => n > 0);
button.addEventListener("click", handleClick);
\`\`\`

\`map\` doesn't know what you want done to each item. You supply that. The pattern is: *the caller owns the loop, you own the decision.*

## Writing something that takes one

\`\`\`js
function repeat(times, fn) {
  for (let i = 0; i < times; i++) {
    fn(i);
  }
}

repeat(3, (i) => console.log(i));   // 0, 1, 2
\`\`\`

\`repeat\` has no idea what \`fn\` does. That ignorance is the point — it's what lets one function serve every purpose.

## The parentheses trap

This is the mistake, and it costs everyone an afternoon at least once:

\`\`\`js
setTimeout(run, 100);     // hands over the function — runs in 100ms
setTimeout(run(), 100);   // calls it NOW, hands over what it returned
\`\`\`

\`run\` is the recipe. \`run()\` is the meal. Anything asking for a callback wants the recipe.

The symptom is unmistakable once you know it: **your handler fires immediately, exactly once, and then never again.**

## When you need to pass arguments

Wrap it, don't call it:

\`\`\`js
setTimeout(() => greet("Ada"), 100);   // correct
setTimeout(greet("Ada"), 100);         // calls greet right now
\`\`\`

The arrow is a new function that, when eventually called, calls yours with the arguments you closed over.

## The catch

The thing calling you back decides what arguments you get, and it may pass more than you expect.

\`\`\`js
["1", "2", "3"].map(parseInt);   // [1, NaN, NaN]
\`\`\`

\`map\` passes \`(value, index, array)\`. \`parseInt\` takes \`(string, radix)\`. So the second call is \`parseInt("2", 1)\` — base 1, which is meaningless.

\`\`\`js
["1", "2", "3"].map(n => parseInt(n, 10));   // [1, 2, 3]
\`\`\`

**Passing a function by name is only safe when its parameters match what the caller sends.** When in doubt, wrap it in an arrow that takes exactly what you want.`,
  },
  {
    id: "teach.composition",
    title: "Wrapping and composing",
    teaches: ["js.functions.composition"],
    requires: ["js.functions.factories"],
    readingSeconds: 175,
    recall:
      "A wrapper takes `fn` and returns a new function. What two things must the new function always do?",
    body: `A **wrapper** takes a function and returns a new one with extra behaviour around it. It's the shape behind \`once\`, \`memoize\`, \`debounce\`, retries, logging and timing.

\`\`\`js
function logged(fn) {
  return function (...args) {
    console.log("calling with", args);
    const result = fn(...args);
    console.log("got", result);
    return result;
  };
}

const add = (a, b) => a + b;
const noisy = logged(add);
noisy(1, 2);   // logs, then returns 3
\`\`\`

## Two rules a wrapper must never break

**Pass every argument through.** \`(...args)\` collects however many arrive, \`fn(...args)\` spreads them back out. Hard-code the count and the wrapper silently breaks for any other arity.

**Return what the inner function returned.** Forget the \`return\` and every wrapped function starts giving back \`undefined\` — the same missing-return bug from Module 0, now hidden one level down where it's much harder to spot.

Those two lines are what makes a wrapper invisible to its callers.

## Where the state lives

\`\`\`js
function once(fn) {
  let called = false;    // ← outside the returned function
  let result;
  return function (...args) {
    if (!called) {
      called = true;
      result = fn(...args);
    }
    return result;
  };
}
\`\`\`

\`called\` and \`result\` sit between the two functions: created fresh each time \`once\` runs, shared by every call to the wrapper. Put them **inside** the returned function and they reset on every call, which is the single most common way to get this wrong.

## Composing

\`\`\`js
const compose = (f, g) => (x) => f(g(x));

const shout = compose(exclaim, upper);
shout("hi");   // "HI!"
\`\`\`

\`compose(f, g)\` runs \`g\` first, then \`f\` — right to left, the way it reads in maths. If that ordering annoys you, \`pipe\` is the same idea left to right:

\`\`\`js
const pipe = (f, g) => (x) => g(f(x));
\`\`\`

## The catch

Wrappers stack, and each one hides the one below it.

\`\`\`js
const fn = logged(memoized(retried(fetchUser)));
\`\`\`

That works, and a stack trace through it is genuinely unpleasant. Two or three layers is normal; past that, a reader can no longer tell what actually runs.

**Wrap for one reason at a time, and name the result for what it now does.**`,
  },
];

export const M9_REPS: Problem[] = [
  rep({
    id: "r.clo.1",
    lesson: "l9.1",
    teaches: ["js.functions.closures"],
    title: "It stays alive",
    prompt:
      "Return a function that, each time it's called, returns the next number starting at 1.",
    exportName: "makeCounter",
    starter: stub("makeCounter", ""),
    tests: [
      {
        name: "counts up",
        code: `const next = fn();
expect(next()).toBe(1);
expect(next()).toBe(2);
expect(next()).toBe(3);`,
      },
      {
        name: "each counter is independent",
        code: `const a = fn();
const b = fn();
a(); a();
expect(b()).toBe(1);`,
      },
    ],
    hint:
      "`let n = 0;` outside the returned function, `return () => ++n;` inside. The variable outlives the call because the arrow still points at it.",
    solution:
      "function makeCounter() {\n  let n = 0;\n  return () => ++n;\n}",
    seconds: 55,
  }),
  rep({
    id: "r.clo.2",
    lesson: "l9.1",
    teaches: ["js.functions.closures", "js.scope.block-scope"],
    title: "One variable or many",
    prompt:
      "Return an array of functions where the function at index `i` returns `i`. For `3` that's `[0, 1, 2]` when each is called.\n\nWith `var` all three would return 3.",
    exportName: "indexFns",
    starter: stub("indexFns", "count"),
    tests: [
      {
        name: "each closes over its own index",
        code: `expect(fn(3).map(f => f())).toEqual([0, 1, 2]);`,
      },
      { name: "zero gives an empty array", code: `expect(fn(0)).toEqual([]);` },
    ],
    hint:
      "`let` in the loop head creates a new binding each iteration, so each arrow captures its own.",
    solution:
      "function indexFns(count) {\n  const out = [];\n  for (let i = 0; i < count; i++) {\n    out.push(() => i);\n  }\n  return out;\n}",
    mistakes: [
      {
        match: "var i",
        hint: "`var` is one variable for the whole function, so all the closures share it and see its final value.",
      },
    ],
    seconds: 65,
  }),

  rep({
    id: "r.priv.1",
    lesson: "l9.2",
    teaches: ["js.functions.private-state"],
    title: "State behind two doors",
    prompt:
      "Return an object with `add(n)` and `total()`. The running total must not be reachable any other way.",
    exportName: "makeTally",
    starter: stub("makeTally", ""),
    tests: [
      {
        name: "adds up",
        code: `const t = fn();
t.add(2); t.add(3);
expect(t.total()).toBe(5);`,
      },
      {
        name: "starts at zero",
        code: `expect(fn().total()).toBe(0);`,
      },
      {
        name: "the total is not a property",
        code: `const t = fn();
t.add(5);
expect(t.total).toBeInstanceOf(Function);
expect(Object.values(t).some(v => v === 5)).toBe(false);`,
      },
    ],
    hint:
      "`let total = 0;` then return `{ add: (n) => { total += n; }, total: () => total }`. Returning the number instead of a function would freeze it.",
    solution:
      "function makeTally() {\n  let total = 0;\n  return {\n    add: (n) => {\n      total += n;\n    },\n    total: () => total,\n  };\n}",
    seconds: 75,
  }),
  rep({
    id: "r.priv.2",
    lesson: "l9.2",
    teaches: ["js.functions.private-state"],
    title: "Only the doors you allow",
    prompt:
      "Return an object with `spend(n)` and `left()`. Spending more than remains changes nothing.",
    exportName: "makeBudget",
    starter: stub("makeBudget", "start"),
    tests: [
      {
        name: "spends down",
        code: `const b = fn(10);
b.spend(4);
expect(b.left()).toBe(6);`,
      },
      {
        name: "refuses to overspend",
        code: `const b = fn(10);
b.spend(99);
expect(b.left()).toBe(10);`,
      },
      {
        name: "each budget is separate",
        code: `const a = fn(10);
const b = fn(10);
a.spend(5);
expect(b.left()).toBe(10);`,
      },
    ],
    hint:
      "The guard lives inside `spend`. Because nothing else can reach the balance, that guard is the only way it can ever change.",
    solution:
      "function makeBudget(start) {\n  let remaining = start;\n  return {\n    spend: (n) => {\n      if (n <= remaining) remaining -= n;\n    },\n    left: () => remaining,\n  };\n}",
    seconds: 75,
  }),

  rep({
    id: "r.fact.1",
    lesson: "l9.3",
    teaches: ["js.functions.factories"],
    title: "A configured function",
    prompt: "Return a function that multiplies its argument by `factor`.",
    exportName: "multiplyBy",
    starter: stub("multiplyBy", "factor"),
    tests: [
      { name: "doubles", code: `expect(fn(2)(5)).toBe(10);` },
      { name: "triples", code: `expect(fn(3)(5)).toBe(15);` },
      {
        name: "the two are independent",
        code: `const double = fn(2);
const triple = fn(3);
expect([double(1), triple(1)]).toEqual([2, 3]);`,
      },
    ],
    hint: "`return (n) => n * factor;` — the arrow remembers the factor it was born with.",
    solution: "function multiplyBy(factor) {\n  return (n) => n * factor;\n}",
    seconds: 45,
  }),
  rep({
    id: "r.fact.2",
    lesson: "l9.3",
    teaches: ["js.functions.factories", "js.array.sort"],
    title: "A comparator factory",
    prompt:
      "Return a comparator that sorts objects by the numeric property `key`, ascending.",
    exportName: "byKey",
    starter: stub("byKey", "key"),
    tests: [
      {
        name: "sorts by the given key",
        code: `const users = [{ age: 30 }, { age: 10 }, { age: 20 }];
expect([...users].sort(fn("age"))).toEqual([{ age: 10 }, { age: 20 }, { age: 30 }]);`,
      },
      {
        name: "works for another key",
        code: `const items = [{ n: 3 }, { n: 1 }];
expect([...items].sort(fn("n"))).toEqual([{ n: 1 }, { n: 3 }]);`,
      },
    ],
    hint: "`return (a, b) => a[key] - b[key];` — brackets because the key is a variable.",
    solution: "function byKey(key) {\n  return (a, b) => a[key] - b[key];\n}",
    seconds: 55,
  }),

  rep({
    id: "r.cb.1",
    lesson: "l9.4",
    teaches: ["js.functions.callbacks"],
    title: "Take a callback",
    prompt:
      "Call `fn` once per number from `0` to `times - 1`, passing the index. Return nothing.",
    exportName: "repeat",
    starter: stub("repeat", "times, fn"),
    tests: [
      {
        name: "calls with each index",
        code: `const seen = [];
fn(3, (i) => seen.push(i));
expect(seen).toEqual([0, 1, 2]);`,
      },
      {
        name: "zero calls nothing",
        code: `let count = 0;
fn(0, () => count++);
expect(count).toBe(0);`,
      },
    ],
    hint: "A plain `for` loop that calls `fn(i)` each pass.",
    solution:
      "function repeat(times, fn) {\n  for (let i = 0; i < times; i++) {\n    fn(i);\n  }\n}",
    seconds: 50,
  }),
  rep({
    id: "r.cb.2",
    lesson: "l9.4",
    teaches: ["js.functions.callbacks"],
    title: "The extra-arguments trap",
    prompt:
      'Parse every string in the array as a base-10 number.\n\n`items.map(parseInt)` gives `[1, NaN, NaN]` — `map` passes the index as the second argument, and `parseInt` reads that as the radix.',
    exportName: "parseAll",
    starter: stub("parseAll", "items"),
    cases: [
      { args: '["1", "2", "3"]', is: "[1, 2, 3]" },
      { args: '["10", "20"]', is: "[10, 20]" },
      { args: "[]", is: "[]" },
    ],
    hint:
      "Wrap it so only what you want gets through: `items.map(n => parseInt(n, 10))`.",
    solution:
      "function parseAll(items) {\n  return items.map(n => parseInt(n, 10));\n}",
    seconds: 55,
  }),

  rep({
    id: "r.comp.1",
    lesson: "l9.5",
    teaches: ["js.functions.composition"],
    title: "A transparent wrapper",
    prompt:
      "Return a function that behaves exactly like `fn`, but also increments `calls` on the object you're given.\n\nIt must pass every argument through and return what `fn` returned.",
    exportName: "counted",
    starter: stub("counted", "fn, stats"),
    tests: [
      {
        name: "returns what the inner function returns",
        code: `const stats = { calls: 0 };
const add = fn((a, b) => a + b, stats);
expect(add(2, 3)).toBe(5);`,
      },
      {
        name: "counts the calls",
        code: `const stats = { calls: 0 };
const add = fn((a, b) => a + b, stats);
add(1, 1); add(2, 2);
expect(stats.calls).toBe(2);`,
      },
      {
        name: "passes any number of arguments",
        code: `const stats = { calls: 0 };
const all = fn((...xs) => xs.length, stats);
expect(all(1, 2, 3, 4)).toBe(4);`,
      },
    ],
    hint:
      "`return (...args) => { stats.calls++; return fn(...args); };` — collect with rest, spread back out, and return the result.",
    solution:
      "function counted(fn, stats) {\n  return (...args) => {\n    stats.calls++;\n    return fn(...args);\n  };\n}",
    seconds: 75,
  }),
  rep({
    id: "r.comp.2",
    lesson: "l9.5",
    teaches: ["js.functions.composition"],
    title: "Compose two",
    prompt:
      "Return a function that runs `g` first, then passes its result to `f`.",
    exportName: "compose",
    starter: stub("compose", "f, g"),
    tests: [
      {
        name: "runs right to left",
        code: `const shout = fn(s => s + "!", s => s.toUpperCase());
expect(shout("hi")).toBe("HI!");`,
      },
      {
        name: "works with numbers",
        code: `const addThenDouble = fn(n => n * 2, n => n + 1);
expect(addThenDouble(3)).toBe(8);`,
      },
    ],
    hint: "`return (x) => f(g(x));` — the inner call happens first.",
    solution: "function compose(f, g) {\n  return (x) => f(g(x));\n}",
    seconds: 50,
  }),
];

export const M9_LESSONS: Lesson[] = [
  {
    id: "l9.1",
    moduleId: "m9",
    title: "Closures",
    goal: "Understand why a variable outlives the function that made it.",
    atomId: "atom.closures",
    repIds: ["r.clo.1", "r.clo.2"],
    problemIds: [],
  },
  {
    id: "l9.2",
    moduleId: "m9",
    title: "Private state",
    goal: "Build state that can only change the ways you allowed.",
    atomId: "teach.private-state",
    repIds: ["r.priv.1", "r.priv.2"],
    problemIds: ["p.once"],
  },
  {
    id: "l9.3",
    moduleId: "m9",
    title: "Functions returning functions",
    goal: "Configure a function once and reuse it everywhere.",
    atomId: "teach.factories",
    repIds: ["r.fact.1", "r.fact.2"],
    problemIds: [],
  },
  {
    id: "l9.4",
    moduleId: "m9",
    title: "Callbacks",
    goal: "Hand a function to something else — and avoid the two classic traps.",
    atomId: "teach.callbacks",
    repIds: ["r.cb.1", "r.cb.2"],
    problemIds: [],
  },
  {
    id: "l9.5",
    moduleId: "m9",
    title: "Wrapping and composing",
    goal: "The shape behind once, memoize and debounce.",
    atomId: "teach.composition",
    repIds: ["r.comp.1", "r.comp.2"],
    problemIds: ["p.memoize", "p.debounce"],
  },
];

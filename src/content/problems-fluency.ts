import type { Problem } from "../types";

/**
 * Fluency problems — "implement the built-in" and small utilities.
 *
 * This format is the best single exercise type for JavaScript, because you
 * cannot fake understanding `reduce` while writing `reduce`. It also targets
 * the retrieval gap directly: the algorithms here are trivial, so every
 * failure is a pure production failure.
 */
export const FLUENCY_PROBLEMS: Problem[] = [
  {
    id: "p.chunk",
    kind: "problem",
    tier: "problem",
    title: "chunk",
    teaches: ["js.array.iteration", "js.array.mutation"],
    requires: ["js.array.iteration"],
    difficulty: { concept: 1, implementation: 2, recall: 3 },
    estimatedMinutes: 8,
    exportName: "chunk",
    prompt: `Split an array into groups of \`size\`.

The last group holds whatever is left over, so it may be shorter.

\`\`\`js
chunk([1, 2, 3, 4, 5], 2); // [[1, 2], [3, 4], [5]]
chunk([1, 2, 3], 10);      // [[1, 2, 3]]
chunk([], 3);              // []
\`\`\`

Don't modify the input array.`,
    scaffolds: {
      L1: `function chunk(items, size) {
  const out = [];
  // Step forward through items, jumping \`size\` at a time.
  for (let i = 0; i < items.length; i += size) {
    // Take a copy of the slice starting at i.
    out.push(/* ... */);
  }
  return out;
}`,
      L2: `function chunk(items, size) {
  // Walk the array in steps of \`size\`, slicing as you go.
}`,
      L3: `function chunk(items, size) {

}`,
      L4: `// Define: chunk(items, size)
`,
    },
    tests: [
      {
        name: "splits evenly",
        code: `expect(fn([1, 2, 3, 4], 2)).toEqual([[1, 2], [3, 4]]);`,
      },
      {
        name: "last group is short",
        code: `expect(fn([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);`,
      },
      {
        name: "size larger than the array",
        hidden: true,
        code: `expect(fn([1, 2, 3], 10)).toEqual([[1, 2, 3]]);`,
      },
      {
        name: "empty array gives empty result",
        hidden: true,
        code: `expect(fn([], 3)).toEqual([]);`,
      },
      {
        name: "does not mutate the input",
        hidden: true,
        code: `const input = [1, 2, 3, 4];
fn(input, 2);
expect(input).toEqual([1, 2, 3, 4]);`,
      },
      {
        name: "size of 1",
        hidden: true,
        code: `expect(fn([1, 2, 3], 1)).toEqual([[1], [2], [3]]);`,
      },
    ],
    hints: [
      { rung: 0, text: "You don't need to touch every element one at a time." },
      {
        rung: 1,
        text: "`slice` copies a range and doesn't care if you ask for more than exists — `[1,2,3].slice(2, 12)` is `[3]`. That handles your leftover group for free.",
      },
      {
        rung: 2,
        text: "Start an empty result array. Run a loop with `i` going from 0 to `items.length`, stepping by `size` instead of 1. Each pass, push `items.slice(i, i + size)` onto the result. Return it. The short last group needs no special case, because slice clamps to the end of the array.",
      },
    ],
    walkthrough: [
      "What does `[1,2,3].slice(1, 3)` return? And `[1,2,3].slice(2, 99)`?",
      "If you want groups of 2, which starting indexes do you need to visit for a 5-element array?",
      "How do you write a for loop whose counter goes up by `size` each pass instead of 1?",
      "Inside that loop, what single call gives you the group starting at `i`?",
    ],
    commonMistakes: [
      {
        match: "splice",
        hint: "`splice` mutates the input. One of the hidden tests checks that the caller's array survives.",
      },
    ],
    solution: `function chunk(items, size) {
  const out = [];
  for (let i = 0; i < items.length; i += size) {
    out.push(items.slice(i, i + size));
  }
  return out;
}`,
  },

  {
    id: "p.group-by",
    kind: "problem",
    tier: "problem",
    title: "groupBy",
    teaches: ["js.array.reduce", "js.object.iteration"],
    requires: ["js.array.reduce"],
    difficulty: { concept: 2, implementation: 2, recall: 4 },
    estimatedMinutes: 10,
    exportName: "groupBy",
    prompt: `Group items into an object, keyed by whatever \`keyOf\` returns.

\`\`\`js
groupBy([1, 2, 3, 4], n => n % 2 ? "odd" : "even");
// { odd: [1, 3], even: [2, 4] }

groupBy(["ant", "bee", "ape"], w => w[0]);
// { a: ["ant", "ape"], b: ["bee"] }
\`\`\`

Order within each group must match the input order.`,
    scaffolds: {
      L1: `function groupBy(items, keyOf) {
  return items.reduce((groups, item) => {
    const key = /* ... */;
    // If this key has no array yet, make one.
    // Then push the item into it.
    return groups;
  }, {});
}`,
      L2: `function groupBy(items, keyOf) {
  // reduce into an object. Create the bucket if it's missing, then push.
}`,
      L3: `function groupBy(items, keyOf) {

}`,
      L4: `// Define: groupBy(items, keyOf)
`,
    },
    tests: [
      {
        name: "groups by a computed key",
        code: `expect(fn([1, 2, 3, 4], n => n % 2 ? "odd" : "even"))
  .toEqual({ odd: [1, 3], even: [2, 4] });`,
      },
      {
        name: "keeps input order inside groups",
        code: `expect(fn(["ant", "bee", "ape"], w => w[0]))
  .toEqual({ a: ["ant", "ape"], b: ["bee"] });`,
      },
      {
        name: "empty input gives an empty object",
        hidden: true,
        code: `expect(fn([], x => x)).toEqual({});`,
      },
      {
        name: "one group",
        hidden: true,
        code: `expect(fn([2, 4], n => "even")).toEqual({ even: [2, 4] });`,
      },
      {
        name: "numeric keys become strings",
        hidden: true,
        code: `const out = fn([1.2, 1.8, 2.1], Math.floor);
expect(out).toEqual({ 1: [1.2, 1.8], 2: [2.1] });`,
      },
      {
        name: "does not inherit object keys",
        hidden: true,
        code: `const out = fn(["x"], () => "constructor");
expect(Array.isArray(out.constructor)).toBe(true);`,
      },
    ],
    hints: [
      {
        rung: 0,
        text: "The carry you're building isn't an array this time.",
      },
      {
        rung: 1,
        text: "`reduce` with `{}` as the seed. The only real question is what to do the first time you see a key.",
      },
      {
        rung: 2,
        text: "Reduce with an empty object as the seed. Each pass: compute `keyOf(item)`. If the object has no array at that key yet, set it to an empty array. Push the item. Return the object — forgetting the return is the classic bug here. `(groups[key] ??= []).push(item)` does the create-and-push in one line.",
      },
    ],
    walkthrough: [
      "What should the accumulator start as — an array or an object?",
      "On the very first item, what is `groups[key]` equal to?",
      "Write the one line that gives `groups[key]` an empty array only when it doesn't have one.",
      "What must the reduce callback return every single pass, and what happens if you forget?",
    ],
    commonMistakes: [
      {
        match: "constructor",
        hint: "A plain `{}` inherits keys like `constructor` and `toString`. `groups[key] || []` sees an inherited function and skips creating your array.",
      },
    ],
    solution: `function groupBy(items, keyOf) {
  return items.reduce((groups, item) => {
    const key = keyOf(item);
    (groups[key] ??= []).push(item);
    return groups;
  }, Object.create(null));
}`,
  },

  {
    id: "p.once",
    kind: "problem",
    tier: "problem",
    title: "once",
    teaches: ["js.functions.closures", "js.functions.private-state"],
    requires: ["js.functions.closures"],
    difficulty: { concept: 2, implementation: 1, recall: 3 },
    estimatedMinutes: 7,
    exportName: "once",
    prompt: `Wrap a function so it only ever runs once.

Every call after the first returns the first result, without calling the original again.

\`\`\`js
let calls = 0;
const init = once(() => ++calls);

init(); // 1
init(); // 1
calls;  // 1  ← only ran once
\`\`\`

Pass through arguments and \`this\`.`,
    scaffolds: {
      L1: `function once(fn) {
  let called = false;
  let result;
  return function (...args) {
    // Only run fn the first time.
    // Remember the result for every call after.
  };
}`,
      L2: `function once(fn) {
  // Keep two things alive in the closure: whether it ran, and what it returned.
}`,
      L3: `function once(fn) {

}`,
      L4: `// Define: once(fn)
`,
    },
    tests: [
      {
        name: "calls the original exactly once",
        code: `let calls = 0;
const wrapped = fn(() => ++calls);
wrapped(); wrapped(); wrapped();
expect(calls).toBe(1);`,
      },
      {
        name: "returns the first result every time",
        code: `const wrapped = fn(x => x * 2);
expect(wrapped(5)).toBe(10);
expect(wrapped(99)).toBe(10);`,
      },
      {
        name: "remembers a falsy result",
        hidden: true,
        code: `let calls = 0;
const wrapped = fn(() => { calls++; return undefined; });
wrapped(); wrapped();
expect(calls).toBe(1);`,
      },
      {
        name: "passes arguments through",
        hidden: true,
        code: `const wrapped = fn((a, b) => a + b);
expect(wrapped(2, 3)).toBe(5);`,
      },
      {
        name: "each wrapper is independent",
        hidden: true,
        code: `let a = 0, b = 0;
const one = fn(() => ++a);
const two = fn(() => ++b);
one(); one(); two();
expect([a, b]).toEqual([1, 1]);`,
      },
    ],
    hints: [
      {
        rung: 0,
        text: "Where do the variables live so they survive between calls but stay private?",
      },
      {
        rung: 1,
        text: "Two variables declared outside the returned function. Watch what you use as the 'has it run' flag.",
      },
      {
        rung: 2,
        text: "Declare `called = false` and `result` in `once`, before returning the wrapper. Inside the wrapper: if not `called`, set `called = true` and store `fn(...args)` in `result`. Then return `result` either way. Do not test `if (result === undefined)` as your flag — a function that legitimately returns undefined would run every time.",
      },
    ],
    walkthrough: [
      "The variables need to outlive each call but stay invisible outside. Where do you declare them?",
      "Why is `if (!result)` the wrong condition for 'has it run yet'?",
      "Which order do you set the flag and call `fn` in, and does it matter if `fn` throws?",
      "How do the arguments reach `fn` from the wrapper?",
    ],
    commonMistakes: [
      {
        match: "if (!result)",
        hint: "Using the result as the flag breaks when the function returns `undefined`, `0`, or `false`. One hidden test covers exactly that.",
      },
    ],
    solution: `function once(fn) {
  let called = false;
  let result;
  return function (...args) {
    if (!called) {
      called = true;
      result = fn.apply(this, args);
    }
    return result;
  };
}`,
  },

  {
    id: "p.memoize",
    kind: "problem",
    tier: "problem",
    title: "memoize",
    teaches: ["js.functions.closures", "js.mapset", "js.functions.hof"],
    requires: ["js.functions.closures", "js.mapset"],
    difficulty: { concept: 2, implementation: 2, recall: 4 },
    estimatedMinutes: 10,
    exportName: "memoize",
    prompt: `Cache a function's results by its arguments.

\`\`\`js
let calls = 0;
const slow = memoize((a, b) => { calls++; return a + b; });

slow(1, 2); // 3
slow(1, 2); // 3
calls;      // 1
slow(2, 1); // 3
calls;      // 2  ← different arguments, real call
\`\`\`

Assume arguments are JSON-safe.`,
    scaffolds: {
      L1: `function memoize(fn) {
  const cache = new Map();
  return function (...args) {
    const key = /* turn args into one cache key */;
    // Return the cached value if we have it.
    // Otherwise compute, store, and return.
  };
}`,
      L2: `function memoize(fn) {
  // A Map in the closure. The only hard part is the key.
}`,
      L3: `function memoize(fn) {

}`,
      L4: `// Define: memoize(fn)
`,
    },
    tests: [
      {
        name: "same arguments run the function once",
        code: `let calls = 0;
const wrapped = fn((a, b) => { calls++; return a + b; });
wrapped(1, 2); wrapped(1, 2);
expect(calls).toBe(1);`,
      },
      {
        name: "different arguments compute again",
        code: `let calls = 0;
const wrapped = fn((a, b) => { calls++; return a + b; });
wrapped(1, 2); wrapped(2, 1);
expect(calls).toBe(2);`,
      },
      {
        name: "returns the right values",
        hidden: true,
        code: `const wrapped = fn((a, b) => a * b);
expect(wrapped(3, 4)).toBe(12);
expect(wrapped(3, 4)).toBe(12);
expect(wrapped(5, 2)).toBe(10);`,
      },
      {
        name: "caches falsy results",
        hidden: true,
        code: `let calls = 0;
const wrapped = fn(() => { calls++; return 0; });
wrapped(); wrapped();
expect(calls).toBe(1);`,
      },
      {
        name: "1 and \"1\" are different arguments",
        hidden: true,
        code: `let calls = 0;
const wrapped = fn(x => { calls++; return x; });
wrapped(1); wrapped("1");
expect(calls).toBe(2);`,
      },
      {
        name: "argument count matters",
        hidden: true,
        code: `let calls = 0;
const wrapped = fn((...a) => { calls++; return a.length; });
wrapped(1, 2); wrapped(12);
expect(calls).toBe(2);`,
      },
    ],
    hints: [
      { rung: 0, text: "Your cache is fine. Look at how you build the key." },
      {
        rung: 1,
        text: "`args.join(\",\")` collides: `(1, 2)` and `(12)` and `(\"1\", 2)` all produce the same string. You need a key that keeps types and boundaries.",
      },
      {
        rung: 2,
        text: "Hold a `Map` in the closure. For the key, use `JSON.stringify(args)` — the array brackets keep argument boundaries, and the quotes keep `1` distinct from `\"1\"`. Check `cache.has(key)` rather than truthiness of `cache.get(key)`, so a cached `0` or `undefined` still counts as a hit. On a miss, call the function, store it, return it.",
      },
    ],
    walkthrough: [
      "Two calls, `f(1, 2)` and `f(12)`. If your key is `args.join(\",\")`, what does each produce?",
      "What's a one-call way to turn an argument array into a string that keeps both types and boundaries?",
      "Why is `if (cache.get(key))` wrong, and what should you use instead?",
      "In what order do you compute, store, and return on a cache miss?",
    ],
    commonMistakes: [
      {
        match: "args.join",
        hint: "`join` flattens argument boundaries. `f(1, 2)` and `f(12)` collide — a hidden test checks it.",
      },
    ],
    solution: `function memoize(fn) {
  const cache = new Map();
  return function (...args) {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key);
    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  };
}`,
  },

  {
    id: "p.debounce",
    kind: "problem",
    tier: "problem",
    title: "debounce",
    teaches: ["js.functions.closures", "js.async.event-loop", "js.functions.hof"],
    requires: ["js.functions.closures"],
    difficulty: { concept: 3, implementation: 2, recall: 4 },
    estimatedMinutes: 12,
    exportName: "debounce",
    prompt: `Delay a function until the calls stop.

Each call resets the timer. The function runs \`ms\` after the *last* call, with that last call's arguments.

\`\`\`js
const save = debounce(text => send(text), 300);

save("h");
save("he");
save("hel");   // 300ms after this one: send("hel"), once
\`\`\`

This is the search-as-you-type primitive. Getting it wrong sends a request per keystroke.`,
    scaffolds: {
      L1: `function debounce(fn, ms) {
  let timer;
  return function (...args) {
    // Cancel whatever was pending.
    // Start a fresh countdown that calls fn with these args.
  };
}`,
      L2: `function debounce(fn, ms) {
  // One variable in the closure holds the pending timer id.
}`,
      L3: `function debounce(fn, ms) {

}`,
      L4: `// Define: debounce(fn, ms)
`,
    },
    tests: [
      {
        name: "runs once after a burst",
        code: `let calls = 0;
const d = fn(() => calls++, 20);
d(); d(); d();
await new Promise(r => setTimeout(r, 60));
expect(calls).toBe(1);`,
      },
      {
        name: "uses the last call's arguments",
        code: `let seen = null;
const d = fn(x => { seen = x; }, 20);
d("a"); d("b"); d("c");
await new Promise(r => setTimeout(r, 60));
expect(seen).toBe("c");`,
      },
      {
        name: "does not run before the delay",
        hidden: true,
        code: `let calls = 0;
const d = fn(() => calls++, 50);
d();
await new Promise(r => setTimeout(r, 10));
expect(calls).toBe(0);`,
      },
      {
        name: "separated calls each run",
        hidden: true,
        code: `let calls = 0;
const d = fn(() => calls++, 20);
d();
await new Promise(r => setTimeout(r, 60));
d();
await new Promise(r => setTimeout(r, 60));
expect(calls).toBe(2);`,
      },
      {
        name: "each debounced function has its own timer",
        hidden: true,
        code: `let a = 0, b = 0;
const one = fn(() => a++, 20);
const two = fn(() => b++, 20);
one(); one(); two();
await new Promise(r => setTimeout(r, 60));
expect([a, b]).toEqual([1, 1]);`,
      },
    ],
    hints: [
      {
        rung: 0,
        text: "Where does `timer` have to be declared for the second call to see what the first one started?",
      },
      {
        rung: 1,
        text: "`clearTimeout` on a stale or undefined id is harmless — you don't need to guard it.",
      },
      {
        rung: 2,
        text: "Declare `let timer;` inside `debounce` but outside the returned function, so every call shares it. In the wrapper: call `clearTimeout(timer)` to cancel anything pending, then assign `timer = setTimeout(() => fn(...args), ms)`. Because you capture `args` fresh on each call, the surviving timer naturally carries the last call's arguments.",
      },
    ],
    walkthrough: [
      "Two rapid calls. For the second to cancel the first, where must `timer` live?",
      "What does `setTimeout` return, and what do you do with it?",
      "Do you need to check whether a timer exists before calling `clearTimeout`?",
      "Which call's arguments end up being used, and why does that fall out for free?",
    ],
    commonMistakes: [
      {
        match: "let timer",
        hint: "If `let timer` is inside the returned function, each call gets its own and nothing ever cancels. It has to be one level up.",
      },
    ],
    solution: `function debounce(fn, ms) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), ms);
  };
}`,
  },

  {
    id: "p.deep-clone",
    kind: "problem",
    tier: "problem",
    title: "deepClone",
    teaches: ["js.values.reference", "js.functions.recursion", "js.object.iteration"],
    requires: ["js.values.reference", "js.functions.recursion"],
    difficulty: { concept: 3, implementation: 3, recall: 4 },
    estimatedMinutes: 15,
    exportName: "deepClone",
    prompt: `Copy a value all the way down. Nothing in the copy may share a reference with the original.

Handle plain objects, arrays, \`Date\`, and primitives.

\`\`\`js
const a = { tags: ["x"], when: new Date(0) };
const b = deepClone(a);

b.tags.push("y");
a.tags;              // ["x"]   ← untouched
b.when instanceof Date; // true
\`\`\`

Bonus, and one hidden test covers it: survive an object that contains itself.`,
    scaffolds: {
      L1: `function deepClone(value, seen = new Map()) {
  // Primitives and null copy themselves.
  if (/* ... */) return value;

  // Already cloned this exact object? Return the same clone.

  if (value instanceof Date) return /* ... */;

  const copy = Array.isArray(value) ? [] : {};
  // Record copy in \`seen\` BEFORE recursing.
  // Then clone every key.
  return copy;
}`,
      L2: `function deepClone(value, seen = new Map()) {
  // Base case, then Date, then arrays and objects by recursion.
  // \`seen\` is how you survive a cycle.
}`,
      L3: `function deepClone(value) {

}`,
      L4: `// Define: deepClone(value)
`,
    },
    tests: [
      {
        name: "nested objects are not shared",
        code: `const a = { x: { y: 1 } };
const b = fn(a);
b.x.y = 99;
expect(a.x.y).toBe(1);`,
      },
      {
        name: "arrays are cloned",
        code: `const a = { tags: ["x"] };
const b = fn(a);
b.tags.push("y");
expect(a.tags).toEqual(["x"]);`,
      },
      {
        name: "equal by value, not by reference",
        hidden: true,
        code: `const a = { a: 1, b: [1, 2, { c: 3 }] };
const b = fn(a);
expect(b).toEqual(a);
expect(b).not.toBe(a);
expect(b.b[2]).not.toBe(a.b[2]);`,
      },
      {
        name: "Dates stay Dates",
        hidden: true,
        code: `const a = { when: new Date(1000) };
const b = fn(a);
expect(b.when).toBeInstanceOf(Date);
expect(b.when.getTime()).toBe(1000);
expect(b.when).not.toBe(a.when);`,
      },
      {
        name: "primitives and null pass through",
        hidden: true,
        code: `expect(fn(5)).toBe(5);
expect(fn(null)).toBe(null);
expect(fn("s")).toBe("s");`,
      },
      {
        name: "survives a cycle",
        hidden: true,
        code: `const a = { name: "loop" };
a.self = a;
const b = fn(a);
expect(b.self).toBe(b);
expect(b.name).toBe("loop");`,
      },
    ],
    hints: [
      {
        rung: 0,
        text: "`typeof null` is `\"object\"`. Check your base case.",
      },
      {
        rung: 1,
        text: "For the cycle test, you need to remember which objects you've already cloned — and you must record the clone *before* you recurse into its children.",
      },
      {
        rung: 2,
        text: "Base case: if the value isn't an object, or is null, return it as-is. Then handle `Date` by constructing a new one from its time. Otherwise make an empty array or object, record it in a `Map` keyed by the original *before* recursing, then clone each key with a recursive call passing the same map along. Recording before recursing is what stops a self-referencing object from looping forever — when the recursion comes back around to the parent, the map already has an answer.",
      },
    ],
    walkthrough: [
      "What does `typeof null` return, and what does that break if your base case is `typeof value !== \"object\"`?",
      "How do you make a new Date with the same instant as an existing one?",
      "For `a.self = a`, trace what happens if you recurse before recording the clone. Where does it stop?",
      "What's the key of your `seen` map, and what's the value?",
    ],
    commonMistakes: [
      {
        match: "JSON.parse",
        hint: "The JSON round-trip destroys Dates, drops undefined, and throws on cycles. Three hidden tests cover those.",
      },
    ],
    solution: `function deepClone(value, seen = new Map()) {
  if (value === null || typeof value !== "object") return value;
  if (seen.has(value)) return seen.get(value);
  if (value instanceof Date) return new Date(value.getTime());

  const copy = Array.isArray(value) ? [] : {};
  seen.set(value, copy);
  for (const [key, inner] of Object.entries(value)) {
    copy[key] = deepClone(inner, seen);
  }
  return copy;
}`,
  },

  {
    id: "p.promise-all",
    kind: "problem",
    tier: "problem",
    title: "Implement Promise.all",
    teaches: ["js.async.combinators", "js.async.promises"],
    requires: ["js.async.promises"],
    difficulty: { concept: 3, implementation: 3, recall: 4 },
    estimatedMinutes: 15,
    exportName: "promiseAll",
    prompt: `Rebuild \`Promise.all\` yourself.

Take an array of values or promises. Return a promise that resolves to an array of results **in input order**, or rejects with the first rejection.

\`\`\`js
await promiseAll([1, Promise.resolve(2)]);      // [1, 2]
await promiseAll([]);                            // []
await promiseAll([Promise.reject(new Error("x"))]); // throws Error("x")
\`\`\`

Don't call the real \`Promise.all\`.`,
    scaffolds: {
      L1: `function promiseAll(items) {
  return new Promise((resolve, reject) => {
    const results = new Array(items.length);
    let remaining = items.length;

    // An empty input has nothing to wait for.

    items.forEach((item, i) => {
      // Wrap so plain values work too.
      // On success: store at index i, and check if we're done.
      // On failure: reject immediately.
    });
  });
}`,
      L2: `function promiseAll(items) {
  return new Promise((resolve, reject) => {
    // Track results by index and count how many are left.
  });
}`,
      L3: `function promiseAll(items) {

}`,
      L4: `// Define: promiseAll(items)
`,
    },
    tests: [
      {
        name: "resolves with all values",
        code: `const out = await fn([1, Promise.resolve(2), 3]);
expect(out).toEqual([1, 2, 3]);`,
      },
      {
        name: "keeps input order, not finish order",
        code: `const slow = new Promise(r => setTimeout(() => r("slow"), 30));
const fast = Promise.resolve("fast");
expect(await fn([slow, fast])).toEqual(["slow", "fast"]);`,
      },
      {
        name: "empty array resolves immediately",
        hidden: true,
        code: `expect(await fn([])).toEqual([]);`,
      },
      {
        name: "rejects with the first rejection",
        hidden: true,
        code: `let message = null;
try {
  await fn([Promise.resolve(1), Promise.reject(new Error("boom"))]);
} catch (err) {
  message = err.message;
}
expect(message).toBe("boom");`,
      },
      {
        name: "handles non-promise values",
        hidden: true,
        code: `expect(await fn([1, 2, 3])).toEqual([1, 2, 3]);`,
      },
      {
        name: "runs in parallel, not one at a time",
        hidden: true,
        code: `const started = Date.now();
const make = () => new Promise(r => setTimeout(r, 40));
await fn([make(), make(), make()]);
expect(Date.now() - started).toBeLessThan(110);`,
      },
    ],
    hints: [
      {
        rung: 0,
        text: "Think about what happens with an empty array. Does anything ever resolve?",
      },
      {
        rung: 1,
        text: "You can't `push` results — the fast one would land first. You need to write to a fixed index. And `Promise.resolve(x)` turns a plain value into a promise for free.",
      },
      {
        rung: 2,
        text: "Return a `new Promise`. Inside, make a results array sized to the input and a counter of how many are outstanding. If the input is empty, resolve with `[]` right away or you'll hang forever. For each item, wrap it in `Promise.resolve(...)` so plain values work, then attach a `.then` that writes to `results[i]` — the index, not a push — and decrements the counter, resolving when it hits zero. Attach a `.catch` that calls `reject` directly; the first one wins and the rest are ignored, because a settled promise can't change.",
      },
    ],
    walkthrough: [
      "If you `push` each result as it arrives, what order do you get when the second promise finishes first?",
      "How do you turn a plain `3` into something you can call `.then` on?",
      "How do you know every promise has finished? What do you track?",
      "Walk through an empty input array. Which line resolves the outer promise?",
    ],
    commonMistakes: [
      {
        match: "results.push",
        hint: "Push gives you finish order. You need input order — write to `results[i]`.",
      },
      {
        match: "Promise.all",
        hint: "Implementing it with itself. Build it from `new Promise` and `.then`.",
      },
    ],
    solution: `function promiseAll(items) {
  return new Promise((resolve, reject) => {
    const results = new Array(items.length);
    let remaining = items.length;

    if (remaining === 0) {
      resolve([]);
      return;
    }

    items.forEach((item, i) => {
      Promise.resolve(item).then((value) => {
        results[i] = value;
        if (--remaining === 0) resolve(results);
      }, reject);
    });
  });
}`,
  },

  {
    id: "p.flatten",
    kind: "problem",
    tier: "problem",
    title: "flattenDeep",
    teaches: ["js.functions.recursion", "js.array.iteration"],
    requires: ["js.array.iteration"],
    difficulty: { concept: 2, implementation: 2, recall: 3 },
    estimatedMinutes: 8,
    exportName: "flattenDeep",
    prompt: `Flatten a nested array to a single level, however deep it goes.

\`\`\`js
flattenDeep([1, [2, [3, [4]]]]); // [1, 2, 3, 4]
flattenDeep([]);                  // []
flattenDeep([[], [[]]]);          // []
\`\`\`

Don't use \`Array.prototype.flat\`.`,
    scaffolds: {
      L1: `function flattenDeep(items) {
  const out = [];
  for (const item of items) {
    // If it's an array, flatten it and add all of its items.
    // Otherwise add the item.
  }
  return out;
}`,
      L2: `function flattenDeep(items) {
  // Walk the items. Arrays recurse; everything else gets pushed.
}`,
      L3: `function flattenDeep(items) {

}`,
      L4: `// Define: flattenDeep(items)
`,
    },
    tests: [
      { name: "one level", code: `expect(fn([1, [2, 3]])).toEqual([1, 2, 3]);` },
      {
        name: "deeply nested",
        code: `expect(fn([1, [2, [3, [4]]]])).toEqual([1, 2, 3, 4]);`,
      },
      {
        name: "empty arrays vanish",
        hidden: true,
        code: `expect(fn([[], [[]], [[[]]]])).toEqual([]);`,
      },
      {
        name: "keeps falsy values",
        hidden: true,
        code: `expect(fn([0, [null, [false, ""]]])).toEqual([0, null, false, ""]);`,
      },
      {
        name: "does not mutate the input",
        hidden: true,
        code: `const input = [1, [2]];
fn(input);
expect(input).toEqual([1, [2]]);`,
      },
    ],
    hints: [
      { rung: 0, text: "What tells you an item is itself an array?" },
      {
        rung: 1,
        text: "`Array.isArray`. And `push(...array)` spreads a whole array in as separate items.",
      },
      {
        rung: 2,
        text: "Start an empty output array and loop the input. For each item, ask `Array.isArray(item)`. If yes, recurse and push the result spread with `...`. If no, push the item itself. The base case is implicit — an array with no arrays inside never recurses.",
      },
    ],
    walkthrough: [
      "How do you check whether something is an array? Why doesn't `typeof` work?",
      "What's the difference between `out.push(inner)` and `out.push(...inner)`?",
      "Where's your base case, and why don't you need to write it explicitly?",
      "Trace `[0, [false]]`. Does a falsy check anywhere in your loop drop values?",
    ],
    commonMistakes: [
      {
        match: "if (item)",
        hint: "A truthiness check drops `0`, `false`, `null`, and `\"\"`. One hidden test covers exactly that.",
      },
    ],
    solution: `function flattenDeep(items) {
  const out = [];
  for (const item of items) {
    if (Array.isArray(item)) out.push(...flattenDeep(item));
    else out.push(item);
  }
  return out;
}`,
  },
];

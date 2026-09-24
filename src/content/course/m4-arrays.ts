import type { Atom, Lesson, Problem } from "../../types";
import { rep, stub } from "../rep";

export const M4_ATOMS: Atom[] = [
  {
    id: "teach.array-access",
    title: "Indexing and length",
    teaches: ["js.array.access"],
    requires: [],
    readingSeconds: 60,
    recall: "How do you get the last item of an array two different ways?",
    body: `An array is an ordered list. Positions start at zero.

\`\`\`js
const items = ["a", "b", "c"];

items[0];        // "a"
items[2];        // "c"
items.length;    // 3
\`\`\`

The last position is always \`length - 1\`. That off-by-one is the source of more bugs than any other single thing in programming, so it's worth saying out loud: **three items, positions 0, 1, 2.**

\`\`\`js
items[items.length - 1];   // "c"
items.at(-1);              // "c"  — same thing, shorter
\`\`\`

\`at()\` counts from the end when you give it a negative number.

## Out of bounds is not an error

\`\`\`js
items[99];   // undefined
items[-1];   // undefined
\`\`\`

No crash, no warning. You get \`undefined\` and your program keeps going — usually until something several lines later fails in a way that doesn't mention the array at all.

\`items[-1]\` is \`undefined\` because negative indexes aren't a thing in bracket notation. That's exactly why \`at()\` exists.

## The catch

\`length\` is writable, and shrinking it deletes.

\`\`\`js
const items = ["a", "b", "c"];
items.length = 1;
items;   // ["a"]
\`\`\`

You will rarely want this. You should know it can happen, because when it does happen by accident it's baffling.`,
  },
  {
    id: "teach.array-addremove",
    title: "Adding and removing",
    teaches: ["js.array.addremove"],
    requires: ["js.array.access"],
    readingSeconds: 65,
    recall: "Which two of push, pop, shift, unshift are slow on a big array, and why?",
    body: `Four methods work on the two ends.

\`\`\`js
const items = ["b"];

items.push("c");      // ["b", "c"]     add to the end
items.unshift("a");   // ["a", "b", "c"] add to the front

items.pop();          // returns "c"
items.shift();        // returns "a"
\`\`\`

\`push\` and \`unshift\` return the new **length**. \`pop\` and \`shift\` return the **removed item**. Mixing those up produces code that looks fine and stores a number where you wanted a value.

All four change the array in place.

## The catch — front operations are slow

\`push\` and \`pop\` touch one end and are instant, O(1).

\`shift\` and \`unshift\` have to move **every other element** one position to keep the indexes correct. That's O(n) — on a 100,000-element array, each call moves 100,000 items.

\`\`\`js
while (queue.length) {
  const next = queue.shift();   // O(n) every single pass → O(n²) total
}
\`\`\`

That loop looks like a clean queue and is quietly quadratic. It's one of the most common accidental performance bugs in JavaScript, and it will fail a timing-limited interview problem while your logic is completely correct.

The fix is a read pointer:

\`\`\`js
let head = 0;
while (head < queue.length) {
  const next = queue[head++];   // O(1)
}
\`\`\``,
  },
  {
    id: "teach.array-search",
    title: "Searching an array",
    teaches: ["js.array.search"],
    requires: ["js.array.access"],
    readingSeconds: 70,
    recall: "Why is `if (arr.findIndex(...))` almost always a bug?",
    body: `Four ways to look for something. Which you want depends on what you need back.

\`\`\`js
const nums = [3, 7, 12];

nums.includes(7);            // true      — is it there?
nums.indexOf(7);             // 1         — where is it?
nums.find(n => n > 5);       // 7         — the item itself
nums.findIndex(n => n > 5);  // 1         — its position
\`\`\`

\`includes\` and \`indexOf\` take a **value**. \`find\` and \`findIndex\` take a **test function**, so they're the ones you need for objects.

\`\`\`js
users.find(u => u.id === 3);
\`\`\`

## What "not found" looks like

\`\`\`js
nums.includes(99);            // false
nums.indexOf(99);             // -1
nums.find(n => n > 99);       // undefined
nums.findIndex(n => n > 99);  // -1
\`\`\`

## The catch

\`-1\` is truthy. \`0\` is falsy. So this is backwards:

\`\`\`js
if (nums.indexOf(x)) { }   // false when found at position 0
                           // true when NOT found (-1)
\`\`\`

Exactly wrong in both directions. Always compare explicitly:

\`\`\`js
if (nums.indexOf(x) !== -1) { }
if (nums.includes(x)) { }          // better — say what you mean
\`\`\`

## The other catch

\`indexOf\` uses \`===\`, so it can't find \`NaN\`. \`includes\` can.

\`\`\`js
[NaN].indexOf(NaN);    // -1
[NaN].includes(NaN);   // true
\`\`\`

And all of these scan the whole array. One search is fine. A search *inside a loop* is O(n²) — see the hash map lesson for the fix.`,
  },
  {
    id: "teach.array-slicing",
    title: "Slicing ranges",
    teaches: ["js.array.slicing"],
    requires: ["js.array.access"],
    readingSeconds: 65,
    recall: "Is the end index of `slice` included in the result?",
    body: `\`slice\` copies a range into a new array.

\`\`\`js
const items = ["a", "b", "c", "d"];

items.slice(1, 3);   // ["b", "c"]
items.slice(2);      // ["c", "d"]
items.slice();       // full copy
\`\`\`

**Start is included. End is not.** So \`slice(1, 3)\` gives you positions 1 and 2.

That looks arbitrary until you notice the payoff: the length of the result is always \`end - start\`, and \`slice(0, n)\` gives you exactly \`n\` items. Every off-by-one you'd otherwise do by hand disappears.

## Negative counts from the end

\`\`\`js
items.slice(-2);      // ["c", "d"]  — last two
items.slice(0, -1);   // ["a", "b", "c"]  — everything but the last
\`\`\`

## It never complains

\`\`\`js
items.slice(2, 99);   // ["c", "d"]  — clamped, no error
items.slice(99);      // []
\`\`\`

Asking for more than exists gives you what exists. That's why chunking an array needs no special case for the short final group.

## The catch

\`slice\` copies. \`splice\` cuts.

\`\`\`js
items.slice(1, 3);    // items unchanged
items.splice(1, 2);   // items is now ["a", "d"]
\`\`\`

One letter apart, and one of them reaches into your caller's data. \`splice\` also reads its second argument as a **count**, not an end position — so \`splice(1, 2)\` removes two items starting at 1.

If you only remember one thing: **the one with the extra letter does the extra damage.**`,
  },
];

export const M4_REPS: Problem[] = [
  rep({
    id: "r.acc.1",
    lesson: "l4.1",
    teaches: ["js.array.access"],
    title: "First and last",
    prompt: "Return `[first, last]`. An empty array gives `[undefined, undefined]`.",
    exportName: "ends",
    starter: stub("ends", "items"),
    cases: [
      { args: '["a", "b", "c"]', is: '["a", "c"]' },
      { args: "[1]", is: "[1, 1]" },
      { args: "[]", is: "[undefined, undefined]" },
    ],
    hint: "`items[0]` and `items.at(-1)`. Out of bounds gives `undefined` for free.",
    solution: "function ends(items) {\n  return [items[0], items.at(-1)];\n}",
  }),
  rep({
    id: "r.acc.2",
    lesson: "l4.1",
    teaches: ["js.array.access"],
    title: "Middle item",
    prompt:
      "Return the middle item. With an even count, return the one just right of centre.",
    exportName: "middle",
    starter: stub("middle", "items"),
    cases: [
      { args: "[1, 2, 3]", is: "2" },
      { args: "[1, 2, 3, 4]", is: "3" },
      { args: "[9]", is: "9" },
    ],
    hint: "`Math.floor(items.length / 2)` gives you the index you want.",
    solution:
      "function middle(items) {\n  return items[Math.floor(items.length / 2)];\n}",
  }),
  rep({
    id: "r.acc.3",
    lesson: "l4.1",
    teaches: ["js.array.access", "js.flow.loops"],
    title: "Walk backwards",
    prompt: "Return the items in reverse order. Don't use `reverse`.",
    exportName: "backwards",
    starter: stub("backwards", "items"),
    cases: [
      { args: "[1, 2, 3]", is: "[3, 2, 1]" },
      { args: "[]", is: "[]" },
      { args: '["a"]', is: '["a"]' },
    ],
    hint: "Start `i` at `items.length - 1` and count down while `i >= 0`.",
    solution:
      "function backwards(items) {\n  const out = [];\n  for (let i = items.length - 1; i >= 0; i--) {\n    out.push(items[i]);\n  }\n  return out;\n}",
  }),

  rep({
    id: "r.add.1",
    lesson: "l4.2",
    teaches: ["js.array.addremove"],
    title: "What pop returns",
    prompt:
      "Remove the last item and return `[removedItem, remainingLength]`.",
    exportName: "takeLast",
    starter: stub("takeLast", "items"),
    cases: [
      { args: "[1, 2, 3]", is: "[3, 2]" },
      { args: "[9]", is: "[9, 0]" },
      { args: "[]", is: "[undefined, 0]" },
    ],
    hint:
      "`pop()` returns the removed item, not the array. Read `length` after popping.",
    solution:
      "function takeLast(items) {\n  const removed = items.pop();\n  return [removed, items.length];\n}",
  }),
  rep({
    id: "r.add.2",
    lesson: "l4.2",
    teaches: ["js.array.addremove"],
    title: "Build a stack",
    prompt:
      "Push each number on, but pop whenever you meet a `0` (the `0` itself is not pushed). Return the final array.",
    exportName: "runStack",
    starter: stub("runStack", "commands"),
    cases: [
      { args: "[1, 2, 0, 3]", is: "[1, 3]" },
      { args: "[1, 0, 0]", is: "[]" },
      { args: "[]", is: "[]" },
      { args: "[0]", is: "[]" },
    ],
    hint:
      "One array, one loop, an `if` inside. Popping an empty array is harmless.",
    solution:
      "function runStack(commands) {\n  const stack = [];\n  for (const value of commands) {\n    if (value === 0) stack.pop();\n    else stack.push(value);\n  }\n  return stack;\n}",
  }),
  rep({
    id: "r.add.3",
    lesson: "l4.2",
    teaches: ["js.array.addremove", "meta.complexity"],
    title: "A queue without shift",
    prompt:
      "Drain the queue front-to-back and return the items collected. Use a read index — no `shift`.",
    exportName: "drain",
    starter: stub("drain", "queue"),
    cases: [
      { args: "[1, 2, 3]", is: "[1, 2, 3]" },
      { args: "[]", is: "[]" },
    ],
    hint:
      "`let head = 0;` then `while (head < queue.length)` and read `queue[head++]`.",
    solution:
      "function drain(queue) {\n  const out = [];\n  let head = 0;\n  while (head < queue.length) {\n    out.push(queue[head]);\n    head++;\n  }\n  return out;\n}",
    mistakes: [
      {
        match: "shift",
        hint: "`shift` moves every remaining element each call — O(n) per pop, O(n²) for the loop. A read index is O(1).",
      },
    ],
  }),

  rep({
    id: "r.mut.1",
    lesson: "l4.5",
    teaches: ["js.array.mutation"],
    title: "Which ones mutate",
    prompt:
      "Return `[afterSlice, afterSplice]` — the original array's contents after calling `slice(0, 1)` on a copy, then `splice(0, 1)` on another copy.",
    exportName: "compareEffects",
    starter: stub("compareEffects", ""),
    tests: [
      {
        name: "slice leaves it alone, splice does not",
        code: `expect(fn()).toEqual([[1, 2, 3], [2, 3]]);`,
      },
    ],
    hint:
      "Make two arrays `[1, 2, 3]`. Call `slice(0, 1)` on the first and `splice(0, 1)` on the second, then return both arrays.",
    solution:
      "function compareEffects() {\n  const a = [1, 2, 3];\n  const b = [1, 2, 3];\n  a.slice(0, 1);\n  b.splice(0, 1);\n  return [a, b];\n}",
  }),
  rep({
    id: "r.mut.2",
    lesson: "l4.5",
    teaches: ["js.array.mutation", "js.functions.pure"],
    title: "Reverse a copy",
    prompt: "Return the items reversed, leaving the input in its original order.",
    exportName: "reversedCopy",
    starter: stub("reversedCopy", "items"),
    tests: [
      { name: "reverses", code: `expect(fn([1, 2, 3])).toEqual([3, 2, 1]);` },
      {
        name: "original untouched",
        code: `const items = [1, 2, 3];
fn(items);
expect(items).toEqual([1, 2, 3]);`,
      },
    ],
    hint: "`reverse` mutates. Spread into a new array first.",
    solution: "function reversedCopy(items) {\n  return [...items].reverse();\n}",
  }),
  rep({
    id: "r.mut.3",
    lesson: "l4.5",
    teaches: ["js.array.mutation"],
    title: "Insert in the middle",
    prompt:
      "Return a new array with `item` inserted at `index`. Don't touch the input.",
    exportName: "insertAt",
    starter: stub("insertAt", "items, index, item"),
    tests: [
      { name: "middle", code: `expect(fn([1, 3], 1, 2)).toEqual([1, 2, 3]);` },
      { name: "front", code: `expect(fn([2], 0, 1)).toEqual([1, 2]);` },
      { name: "end", code: `expect(fn([1], 1, 2)).toEqual([1, 2]);` },
      {
        name: "original untouched",
        code: `const items = [1, 3];
fn(items, 1, 2);
expect(items).toEqual([1, 3]);`,
      },
    ],
    hint: "Slice the part before, the item, then the part from `index` on.",
    solution:
      "function insertAt(items, index, item) {\n  return [...items.slice(0, index), item, ...items.slice(index)];\n}",
  }),

  rep({
    id: "r.search.1",
    lesson: "l4.3",
    teaches: ["js.array.search"],
    title: "Is it there",
    prompt: "Return `true` if the value is in the array.",
    exportName: "has",
    starter: stub("has", "items, value"),
    cases: [
      { args: "[1, 2, 3], 2", is: "true" },
      { args: "[1, 2], 9", is: "false" },
      { args: "[], 1", is: "false" },
      { args: "[NaN], NaN", is: "true" },
    ],
    hint: "`includes` — and it's the one that handles `NaN`.",
    solution: "function has(items, value) {\n  return items.includes(value);\n}",
    mistakes: [
      {
        match: "indexOf",
        hint: "`indexOf` uses `===`, and `NaN === NaN` is false. One test covers exactly that.",
      },
    ],
  }),
  rep({
    id: "r.search.2",
    lesson: "l4.3",
    teaches: ["js.array.search"],
    title: "Find an object",
    prompt: "Return the user with the matching `id`, or `undefined`.",
    exportName: "userById",
    starter: stub("userById", "users, id"),
    cases: [
      { args: "[{ id: 1 }, { id: 2 }], 2", is: "{ id: 2 }" },
      { args: "[{ id: 1 }], 9", is: "undefined" },
      { args: "[], 1", is: "undefined" },
    ],
    hint: "`includes` can't test a property. `find` takes a function.",
    solution:
      "function userById(users, id) {\n  return users.find(user => user.id === id);\n}",
  }),
  rep({
    id: "r.search.3",
    lesson: "l4.3",
    teaches: ["js.array.search"],
    title: "The -1 trap",
    prompt:
      'Return `"found"` or `"missing"` using `indexOf`. Position 0 must still count as found.',
    exportName: "lookup",
    starter: stub("lookup", "items, value"),
    cases: [
      { args: "[5, 6], 5", is: '"found"' },
      { args: "[5, 6], 6", is: '"found"' },
      { args: "[5, 6], 9", is: '"missing"' },
    ],
    hint: "Compare against `-1` explicitly. A bare `if (indexOf(...))` is backwards.",
    solution:
      'function lookup(items, value) {\n  return items.indexOf(value) !== -1 ? "found" : "missing";\n}',
  }),

  rep({
    id: "r.slice.1",
    lesson: "l4.4",
    teaches: ["js.array.slicing"],
    title: "First n",
    prompt: "Return the first `n` items. Asking for more than exists is fine.",
    exportName: "firstN",
    starter: stub("firstN", "items, n"),
    cases: [
      { args: "[1, 2, 3, 4], 2", is: "[1, 2]" },
      { args: "[1, 2], 10", is: "[1, 2]" },
      { args: "[1, 2], 0", is: "[]" },
    ],
    hint: "`slice(0, n)` returns exactly `n` items, clamped to the array.",
    solution: "function firstN(items, n) {\n  return items.slice(0, n);\n}",
  }),
  rep({
    id: "r.slice.2",
    lesson: "l4.4",
    teaches: ["js.array.slicing"],
    title: "Everything but the ends",
    prompt: "Return the array without its first and last items.",
    exportName: "inner",
    starter: stub("inner", "items"),
    cases: [
      { args: "[1, 2, 3, 4]", is: "[2, 3]" },
      { args: "[1, 2]", is: "[]" },
      { args: "[1]", is: "[]" },
      { args: "[]", is: "[]" },
    ],
    hint: "`slice(1, -1)` — start after the first, stop before the last.",
    solution: "function inner(items) {\n  return items.slice(1, -1);\n}",
  }),
  rep({
    id: "r.slice.3",
    lesson: "l4.4",
    teaches: ["js.array.slicing"],
    title: "Last n",
    prompt: "Return the last `n` items, in their original order.",
    exportName: "lastN",
    starter: stub("lastN", "items, n"),
    cases: [
      { args: "[1, 2, 3, 4], 2", is: "[3, 4]" },
      { args: "[1, 2], 10", is: "[1, 2]" },
      { args: "[1, 2, 3], 0", is: "[]" },
    ],
    hint:
      "`slice(-n)` works — except when `n` is 0, because `slice(-0)` is `slice(0)` and returns everything. Guard it.",
    solution:
      "function lastN(items, n) {\n  if (n === 0) return [];\n  return items.slice(-n);\n}",
  }),
];

export const M4_LESSONS: Lesson[] = [
  {
    id: "l4.1",
    moduleId: "m4",
    title: "Indexing and length",
    goal: "Reach any position in an array, including the last one.",
    atomId: "teach.array-access",
    repIds: ["r.acc.1", "r.acc.2", "r.acc.3"],
    problemIds: [],
  },
  {
    id: "l4.2",
    moduleId: "m4",
    title: "Adding and removing",
    goal: "Use both ends of an array — and know which end is slow.",
    atomId: "teach.array-addremove",
    repIds: ["r.add.1", "r.add.2", "r.add.3"],
    problemIds: [],
  },
  // Searching and slicing come before copies-vs-mutations, because that
  // lesson's whole point is `slice` versus `splice` — and you can't compare
  // them before you've met either.
  {
    id: "l4.3",
    moduleId: "m4",
    title: "Searching",
    goal: "Find things by value or by test, and avoid the -1 trap.",
    atomId: "teach.array-search",
    repIds: ["r.search.1", "r.search.2", "r.search.3"],
    problemIds: [],
  },
  {
    id: "l4.4",
    moduleId: "m4",
    title: "Slicing ranges",
    goal: "Take any sub-range of an array without off-by-one errors.",
    atomId: "teach.array-slicing",
    repIds: ["r.slice.1", "r.slice.2", "r.slice.3"],
    problemIds: ["p.chunk"],
  },
  {
    id: "l4.5",
    moduleId: "m4",
    title: "Copies vs mutations",
    goal: "Know which methods change the array and which hand you a new one.",
    atomId: "atom.mutation",
    repIds: ["r.mut.1", "r.mut.2", "r.mut.3"],
    problemIds: [],
  },
];

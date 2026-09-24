import type { Atom, Lesson, Problem } from "../../types";
import { rep, stub } from "../rep";

/**
 * M8 — Map & Set.
 *
 * Authored ahead of schedule because the app's own problems already depend on
 * it: `twoSum`, `memoize` and the whole hash-map pattern assume a Map, and the
 * course had never taught one.
 */
export const M8_ATOMS: Atom[] = [
  {
    id: "teach.set",
    title: "Set",
    teaches: ["js.set"],
    requires: ["js.array.search"],
    readingSeconds: 170,
    recall:
      "You call `includes` inside a loop over 10,000 items. What's the complexity, and what fixes it?",
    body: `A **Set** is a collection with no duplicates and instant membership checks.

\`\`\`js
const seen = new Set();

seen.add("a");
seen.add("a");     // ignored — already there
seen.size;         // 1
seen.has("a");     // true
seen.delete("a");  // true if it was there
\`\`\`

Four methods. That's the whole API worth knowing.

## Dedupe in one expression

\`\`\`js
[...new Set([1, 2, 2, 3])];   // [1, 2, 3]
\`\`\`

A Set drops duplicates on insert, and spreading it turns it back into an array. This idiom appears constantly — worth committing to memory as a single unit rather than two steps.

Insertion order is preserved, so the survivors come out in the order they first appeared.

## Why it exists: the cost of a membership test

This is the entire point, and it's the difference between passing and timing out.

\`\`\`js
list.includes(x);   // walks the array   — O(n)
set.has(x);         // jumps straight there — O(1)
\`\`\`

One check either way, nobody notices. Put it **inside a loop** and the difference is enormous:

\`\`\`js
for (const x of a) {
  if (b.includes(x)) out.push(x);       // O(n × m)
}

const inB = new Set(b);
for (const x of a) {
  if (inB.has(x)) out.push(x);          // O(n + m)
}
\`\`\`

At 10,000 items each, that's 100,000,000 operations against 20,000. The first version looks perfectly reasonable and is the most common accidental performance bug in JavaScript.

**A membership test inside a loop is the signal. Build a Set first.**

## The catch

Sets compare by identity, not contents.

\`\`\`js
new Set([{ a: 1 }, { a: 1 }]).size;   // 2 — two different objects
\`\`\`

Two objects that look identical are still two objects, so a Set of objects won't dedupe the way you hope. Dedupe on a *primitive key* instead — an id, or a string you build from the fields that matter.

One deliberate exception: \`NaN\`.

\`\`\`js
new Set([NaN, NaN]).size;   // 1
\`\`\`

Sets use SameValueZero, which treats \`NaN\` as equal to itself even though \`===\` doesn't. Same rule \`includes\` follows, and the opposite of \`indexOf\`.`,
  },
  {
    id: "teach.map-type",
    title: "Map",
    teaches: ["js.mapset"],
    requires: ["js.object.access", "js.set"],
    readingSeconds: 180,
    recall:
      "Name three things a Map does that a plain object can't, and the one thing an object still wins at.",
    body: `A **Map** is a lookup table like an object, without the compromises objects carry.

\`\`\`js
const ages = new Map();

ages.set("ada", 36);
ages.get("ada");      // 36
ages.get("nobody");   // undefined
ages.has("ada");      // true
ages.delete("ada");
ages.size;            // 0
\`\`\`

## Three things an object can't do

**Keys keep their type.**

\`\`\`js
const obj = {};
obj[1] = "a";
obj["1"] = "b";
obj[1];          // "b" — one key; the number became a string

const map = new Map();
map.set(1, "a");
map.set("1", "b");
map.get(1);      // "a" — two separate keys
\`\`\`

Objects convert every key to a string. Maps don't, so numbers stay numbers and objects can be keys.

**Nothing is inherited.**

\`\`\`js
({}).toString;              // a function you never set
new Map().get("toString");  // undefined
\`\`\`

A Map starts genuinely empty. With an object, a key that arrives from user input can collide with something on the prototype.

**Size is free.** \`map.size\` is a property; \`Object.keys(obj).length\` builds an array first.

Insertion order is also guaranteed for every key type, where objects reorder integer-like keys.

## Iterating

\`\`\`js
for (const [key, value] of map) { }
[...map.keys()];
[...map.values()];
[...map.entries()];
\`\`\`

A Map is directly iterable — no \`Object.entries\` step. And you can build one from pairs:

\`\`\`js
new Map([["ada", 36], ["grace", 45]]);
\`\`\`

Which gives a neat dedupe-by-key: building a Map from pairs keeps the **last** write per key.

\`\`\`js
[...new Map(users.map(u => [u.id, u])).values()];
\`\`\`

## When an object still wins

JSON. \`JSON.stringify(map)\` gives you \`{}\` — Maps don't serialise. If the thing is going over the wire or into storage, it's an object.

Objects are also fine, and more idiomatic, for a fixed set of known keys you write yourself: config, options, a constant lookup table.

**Rule of thumb: keys you chose → object. Keys that arrive from data → Map.**`,
  },
  {
    id: "teach.counting",
    title: "Counting with a Map",
    teaches: ["js.map.counting"],
    requires: ["js.mapset"],
    readingSeconds: 165,
    recall:
      "Write the one line that increments a count for `key` in a Map that may not have seen it yet.",
    body: `Counting occurrences is the single most common thing a Map is used for, and it's worth having as reflex rather than reasoning.

\`\`\`js
const counts = new Map();

for (const word of words) {
  counts.set(word, (counts.get(word) ?? 0) + 1);
}
\`\`\`

The whole trick is \`?? 0\`. The first time you see a word, \`get\` returns \`undefined\`; \`?? 0\` turns that into a starting count. Every time after, it returns the running total.

**That one line is the pattern.** Learn it as a unit.

## Why not ||

\`\`\`js
counts.set(word, (counts.get(word) || 0) + 1);
\`\`\`

Works here, because a count is never legitimately \`0\` at the point you're adding to it. It's still the wrong habit — the moment you're accumulating something that *can* be zero or empty, \`||\` silently discards it. Use \`??\` and never think about it again.

## Reading the result

\`\`\`js
counts.get("ant") ?? 0;                      // safe read
[...counts.entries()].sort((a, b) => b[1] - a[1]);   // most frequent first
\`\`\`

Sorting entries by the second element is how you get "top N" out of a count map, and it's a two-line answer to a whole family of interview questions.

## The shape generalises

Swap the value type and the same loop solves different problems:

\`\`\`js
counts.set(k, (counts.get(k) ?? 0) + 1);        // count
groups.set(k, [...(groups.get(k) ?? []), v]);   // group
first.set(k, first.get(k) ?? i);                // first index seen
\`\`\`

Count, group, index. Three of the most common interview sub-tasks, one shape: **read with a default, write back.**

## The catch

A Map is not an array. \`counts.map(...)\` doesn't exist, and neither does \`filter\` or \`reduce\`.

\`\`\`js
[...counts].filter(([, n]) => n > 1);
\`\`\`

Spread it into an array of pairs first. The \`[, n]\` there is destructuring that skips the key — a comma holding an empty slot, which looks like a typo the first few times you meet it.`,
  },
];

export const M8_REPS: Problem[] = [
  rep({
    id: "r.set.1",
    lesson: "l8.1",
    teaches: ["js.set"],
    title: "Dedupe",
    prompt: "Remove duplicates, keeping first-seen order. One expression.",
    exportName: "unique",
    starter: stub("unique", "items"),
    cases: [
      { args: "[1, 2, 2, 3, 1]", is: "[1, 2, 3]" },
      { args: '["a", "a"]', is: '["a"]' },
      { args: "[]", is: "[]" },
    ],
    hint: "`[...new Set(items)]` — the Set drops duplicates, the spread rebuilds the array.",
    solution: "function unique(items) {\n  return [...new Set(items)];\n}",
    seconds: 40,
  }),
  rep({
    id: "r.set.2",
    lesson: "l8.1",
    teaches: ["js.set", "meta.complexity"],
    title: "Membership without the nested scan",
    prompt:
      "Return the values that appear in **both** arrays, in `a`'s order.\n\nA `b.includes(...)` inside the loop would be O(n × m). Build a Set first.",
    exportName: "shared",
    starter: stub("shared", "a, b"),
    cases: [
      { args: "[1, 2, 3], [2, 3, 4]", is: "[2, 3]" },
      { args: "[1], [2]", is: "[]" },
      { args: "[], [1]", is: "[]" },
    ],
    hint: "`const inB = new Set(b);` then filter `a` on `inB.has(x)`.",
    solution:
      "function shared(a, b) {\n  const inB = new Set(b);\n  return a.filter(x => inB.has(x));\n}",
    mistakes: [
      {
        match: "b.includes",
        hint: "`includes` scans the whole array every time, inside a loop that already runs n times. A Set makes each check O(1).",
      },
    ],
    seconds: 60,
  }),
  rep({
    id: "r.set.3",
    lesson: "l8.1",
    teaches: ["js.set"],
    title: "First repeat",
    prompt:
      "Return the first value that appears twice, or `null` if every value is unique.",
    exportName: "firstRepeat",
    starter: stub("firstRepeat", "items"),
    cases: [
      { args: "[1, 2, 3, 2, 1]", is: "2" },
      { args: "[1, 2, 3]", is: "null" },
      { args: "[]", is: "null" },
      { args: '["a", "a"]', is: '"a"' },
    ],
    hint:
      "Walk once, keeping a Set of what you've seen. If it's already there, that's the answer — check before you add.",
    solution:
      "function firstRepeat(items) {\n  const seen = new Set();\n  for (const item of items) {\n    if (seen.has(item)) return item;\n    seen.add(item);\n  }\n  return null;\n}",
    seconds: 65,
  }),

  rep({
    id: "r.mapt.1",
    lesson: "l8.2",
    teaches: ["js.mapset"],
    title: "Set and get",
    prompt:
      "Build a Map from `pairs` and return the value stored under `key`, or `null` when it isn't there.",
    exportName: "lookup",
    starter: stub("lookup", "pairs, key"),
    cases: [
      { args: '[["a", 1], ["b", 2]], "b"', is: "2" },
      { args: '[["a", 1]], "z"', is: "null" },
      { args: '[], "a"', is: "null" },
    ],
    hint:
      "`new Map(pairs)` builds it straight from the pairs. `get` gives `undefined` for a miss — `?? null` converts it.",
    solution:
      "function lookup(pairs, key) {\n  const map = new Map(pairs);\n  return map.get(key) ?? null;\n}",
    seconds: 50,
  }),
  rep({
    id: "r.mapt.2",
    lesson: "l8.2",
    teaches: ["js.mapset"],
    title: "Keys keep their type",
    prompt:
      "Store `\"number\"` under the number `1` and `\"string\"` under the string `\"1\"`, then return `[map.get(1), map.get(\"1\")]`.\n\nAn object would collapse these into one key. A Map doesn't.",
    exportName: "bothKeys",
    starter: stub("bothKeys", ""),
    cases: [{ args: "", is: '["number", "string"]' }],
    hint:
      'Build a Map, `set(1, "number")` and `set("1", "string")`, then return both gets in an array.',
    solution:
      'function bothKeys() {\n  const map = new Map();\n  map.set(1, "number");\n  map.set("1", "string");\n  return [map.get(1), map.get("1")];\n}',
    seconds: 55,
  }),
  rep({
    id: "r.mapt.3",
    lesson: "l8.2",
    teaches: ["js.mapset"],
    title: "Dedupe objects by id",
    prompt:
      "Keep one user per `id`, the **last** one seen, in insertion order.",
    exportName: "byId",
    starter: stub("byId", "users"),
    cases: [
      {
        args: '[{ id: 1, n: "a" }, { id: 2, n: "b" }, { id: 1, n: "c" }]',
        is: '[{ id: 1, n: "c" }, { id: 2, n: "b" }]',
      },
      { args: "[]", is: "[]" },
    ],
    hint:
      "Building a Map from `[id, user]` pairs keeps the last write per key. Then spread `.values()`.",
    solution:
      "function byId(users) {\n  return [...new Map(users.map(u => [u.id, u])).values()];\n}",
    seconds: 70,
  }),

  rep({
    id: "r.count.1",
    lesson: "l8.3",
    teaches: ["js.map.counting"],
    title: "Count occurrences",
    prompt:
      "Return a Map from each value to how many times it appears.",
    exportName: "countBy",
    starter: stub("countBy", "items"),
    tests: [
      {
        name: "counts repeats",
        code: `const out = fn(["a", "b", "a"]);
expect(out.get("a")).toBe(2);
expect(out.get("b")).toBe(1);`,
      },
      {
        name: "returns a Map",
        code: `expect(fn([])).toBeInstanceOf(Map);`,
      },
      {
        name: "unseen values are undefined",
        code: `expect(fn(["a"]).get("z")).toBe(undefined);`,
      },
    ],
    hint:
      "The one line: `counts.set(item, (counts.get(item) ?? 0) + 1)`. Read with a default, write back.",
    solution:
      "function countBy(items) {\n  const counts = new Map();\n  for (const item of items) {\n    counts.set(item, (counts.get(item) ?? 0) + 1);\n  }\n  return counts;\n}",
    seconds: 65,
  }),
  rep({
    id: "r.count.2",
    lesson: "l8.3",
    teaches: ["js.map.counting"],
    title: "Most frequent",
    prompt:
      "Return the value that appears most often. On a tie, return whichever was seen first. Empty input gives `null`.",
    exportName: "mostCommon",
    starter: stub("mostCommon", "items"),
    cases: [
      { args: '["a", "b", "a"]', is: '"a"' },
      { args: '["a", "b"]', is: '"a"' },
      { args: "[]", is: "null" },
      { args: "[1, 2, 2, 3]", is: "2" },
    ],
    hint:
      "Count first, then walk the entries keeping the best. Insertion order means the first-seen wins ties for free if you use a strict `>`.",
    solution:
      "function mostCommon(items) {\n  const counts = new Map();\n  for (const item of items) {\n    counts.set(item, (counts.get(item) ?? 0) + 1);\n  }\n  let best = null;\n  let bestCount = 0;\n  for (const [value, count] of counts) {\n    if (count > bestCount) {\n      best = value;\n      bestCount = count;\n    }\n  }\n  return best;\n}",
    seconds: 90,
  }),
  rep({
    id: "r.count.3",
    lesson: "l8.3",
    teaches: ["js.map.counting"],
    title: "Group into a Map",
    prompt:
      "Group the words by their first letter. Same shape as counting — read with a default, write back.",
    exportName: "groupByFirst",
    starter: stub("groupByFirst", "words"),
    tests: [
      {
        name: "groups by first letter",
        code: `const out = fn(["ant", "bee", "ape"]);
expect(out.get("a")).toEqual(["ant", "ape"]);
expect(out.get("b")).toEqual(["bee"]);`,
      },
      { name: "returns a Map", code: `expect(fn([])).toBeInstanceOf(Map);` },
    ],
    hint:
      "`groups.set(letter, [...(groups.get(letter) ?? []), word])` — or read the array, push, and set it back.",
    solution:
      "function groupByFirst(words) {\n  const groups = new Map();\n  for (const word of words) {\n    const letter = word[0];\n    groups.set(letter, [...(groups.get(letter) ?? []), word]);\n  }\n  return groups;\n}",
    seconds: 80,
  }),
];

export const M8_LESSONS: Lesson[] = [
  {
    id: "l8.1",
    moduleId: "m8",
    title: "Set",
    goal: "Dedupe, and turn an accidental O(n²) into O(n).",
    atomId: "teach.set",
    repIds: ["r.set.1", "r.set.2", "r.set.3"],
    problemIds: [],
  },
  {
    id: "l8.2",
    moduleId: "m8",
    title: "Map",
    goal: "A lookup table without the compromises an object carries.",
    atomId: "teach.map-type",
    repIds: ["r.mapt.1", "r.mapt.2", "r.mapt.3"],
    problemIds: [],
  },
  {
    id: "l8.3",
    moduleId: "m8",
    title: "Counting with a Map",
    goal: "The read-with-a-default, write-back shape — count, group, index.",
    atomId: "teach.counting",
    repIds: ["r.count.1", "r.count.2", "r.count.3"],
    problemIds: ["p.two-sum"],
  },
];

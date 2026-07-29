import type { Atom, Lesson, Problem } from "../../types";
import { rep, stub } from "../rep";

export const M5_ATOMS: Atom[] = [
  {
    id: "teach.map",
    title: "map",
    teaches: ["js.array.map"],
    requires: ["js.functions.arrow"],
    readingSeconds: 65,
    recall: "Your `map` returns an array of `undefined`. What did you forget?",
    body: `\`map\` makes a new array by running a function on every item.

\`\`\`js
[1, 2, 3].map(n => n * 2);   // [2, 4, 6]
\`\`\`

The original is untouched. The result is always **the same length** — one output per input. That guarantee is what separates \`map\` from \`filter\`.

\`\`\`js
users.map(user => user.name);   // ["Ada", "Grace"]
\`\`\`

## The second argument is the index

\`\`\`js
["a", "b"].map((item, i) => \`\${i}: \${item}\`);   // ["0: a", "1: b"]
\`\`\`

## The catch

Braces turn off the automatic return.

\`\`\`js
nums.map(n => { n * 2 });   // [undefined, undefined, undefined]
nums.map(n => n * 2);       // [2, 4, 6]
nums.map(n => { return n * 2; });   // [2, 4, 6]
\`\`\`

An array full of \`undefined\` almost always means this. It's the same missing-\`return\` bug from the functions lesson, wearing a disguise.

## Use it for what it's for

If you're not building a new array from every item, \`map\` is the wrong tool:

\`\`\`js
users.map(user => console.log(user));   // wrong — use for...of
users.map(user => user.active);         // right
\`\`\`

Using \`map\` and throwing away the result tells the next reader you meant something you didn't.`,
  },
  {
    id: "teach.filter",
    title: "filter",
    teaches: ["js.array.filter"],
    requires: ["js.functions.arrow"],
    readingSeconds: 60,
    recall: "What's the shortest way to drop all falsy values from an array?",
    body: `\`filter\` keeps the items your function says \`true\` to.

\`\`\`js
[1, 2, 3, 4].filter(n => n % 2 === 0);   // [2, 4]
\`\`\`

The result is a new array, **shorter or the same length**, never longer. That's the difference from \`map\`: \`map\` transforms every item, \`filter\` decides which items survive.

\`\`\`js
users.filter(user => user.active);
\`\`\`

Your function's return value is read as truthy or falsy, so it doesn't have to be a literal boolean.

## Dropping falsy values

\`\`\`js
["a", "", "b", null, 0].filter(Boolean);   // ["a", "b"]
\`\`\`

\`Boolean\` is just a function that converts its argument, so handing it straight to \`filter\` works. This idiom shows up constantly — worth committing to memory.

## The catch

\`filter\` always returns an array, even when nothing matched.

\`\`\`js
const found = users.filter(u => u.id === 99);
if (found) { }          // always true — it's []
found.name;             // undefined — it's an array, not a user
\`\`\`

An empty array is truthy, so the check passes and the next line quietly fails.

**If you want one item, use \`find\`.** \`filter(...)[0]\` also works but does needless work and reads worse.`,
  },
  {
    id: "teach.predicates",
    title: "some and every",
    teaches: ["js.array.predicates"],
    requires: ["js.array.filter"],
    readingSeconds: 55,
    recall: "What does `[].every(...)` return, and why?",
    body: `Two questions about a whole array, answered with a boolean.

\`\`\`js
[1, 2, 3].some(n => n > 2);    // true  — at least one?
[1, 2, 3].every(n => n > 0);   // true  — all of them?
\`\`\`

Both stop as soon as they know the answer. \`some\` stops at the first \`true\`; \`every\` stops at the first \`false\`. On a big array where the answer is near the front, that's most of the work skipped.

Use them instead of counting:

\`\`\`js
if (users.filter(u => u.admin).length > 0) { }   // builds a whole array
if (users.some(u => u.admin)) { }                // stops at the first admin
\`\`\`

## The catch

On an empty array, \`every\` is \`true\` and \`some\` is \`false\`.

\`\`\`js
[].every(n => n > 100);   // true
[].some(n => n > 100);    // false
\`\`\`

\`every\` returning \`true\` for nothing surprises people, but it's the only consistent answer: \`every\` means "no item breaks the rule," and an empty array has no item to break it.

It's still a real source of bugs. \`if (items.every(isValid))\` passes happily when \`items\` is empty — which is often exactly when you wanted it to fail. Check the length too when emptiness means something.`,
  },
  {
    id: "teach.chaining",
    title: "Chaining",
    teaches: ["js.array.chaining"],
    requires: ["js.array.map", "js.array.filter", "js.array.reduce"],
    readingSeconds: 70,
    recall: "You chain filter → map → filter over 10,000 items. How many arrays get built?",
    body: `Each of these returns an array, so you can keep going.

\`\`\`js
const total = orders
  .filter(order => order.paid)
  .map(order => order.amount)
  .reduce((sum, amount) => sum + amount, 0);
\`\`\`

Read it top to bottom as steps: keep the paid ones, take their amounts, add them up. Each line does one thing, which is why this beats a loop doing all three at once.

## Order matters for speed

**Filter first.** Every step after it does less work.

\`\`\`js
items.map(expensive).filter(keep);   // transforms everything, discards most
items.filter(keep).map(expensive);   // only transforms survivors
\`\`\`

Same answer, and on a large array the second version can be dramatically faster.

## The catch

Every link builds a whole new array.

A three-step chain over 10,000 items allocates three arrays of up to 10,000 items each. For UI-sized data that's free and you should absolutely prefer the readable version.

For a hot loop over a million items, or an interview problem with a timing limit, one \`for...of\` doing all three jobs in a single pass is the answer. \`reduce\` can also collapse a chain into one pass when you need it.

**Default to the chain. Reach for the loop when you've measured, or when the input is genuinely huge.** Writing the ugly version first is a bad trade you make maybe five percent of the time.`,
  },
];

export const M5_REPS: Problem[] = [
  rep({
    id: "r.map.1",
    lesson: "l5.1",
    teaches: ["js.array.map"],
    title: "Transform each",
    prompt: "Return each number squared.",
    exportName: "squares",
    starter: stub("squares", "nums"),
    cases: [
      { args: "[1, 2, 3]", is: "[1, 4, 9]" },
      { args: "[]", is: "[]" },
      { args: "[-2]", is: "[4]" },
    ],
    hint: "`nums.map(n => n * n)` — no braces, so the value is returned for you.",
    solution: "function squares(nums) {\n  return nums.map(n => n * n);\n}",
  }),
  rep({
    id: "r.map.2",
    lesson: "l5.1",
    teaches: ["js.array.map"],
    title: "Pull out a property",
    prompt: "Return just the `name` of each user.",
    exportName: "names",
    starter: stub("names", "users"),
    cases: [
      { args: '[{ name: "Ada" }, { name: "Grace" }]', is: '["Ada", "Grace"]' },
      { args: "[]", is: "[]" },
    ],
    hint: "`users.map(user => user.name)`.",
    solution: "function names(users) {\n  return users.map(user => user.name);\n}",
  }),
  rep({
    id: "r.map.3",
    lesson: "l5.1",
    teaches: ["js.array.map"],
    title: "Use the index",
    prompt: 'Return `"1. a"`, `"2. b"` … numbering from 1.',
    exportName: "numbered",
    starter: stub("numbered", "items"),
    cases: [
      { args: '["a", "b"]', is: '["1. a", "2. b"]' },
      { args: "[]", is: "[]" },
    ],
    hint: "The callback's second argument is the index, starting at 0.",
    solution:
      "function numbered(items) {\n  return items.map((item, i) => `${i + 1}. ${item}`);\n}",
  }),

  rep({
    id: "r.filter.1",
    lesson: "l5.2",
    teaches: ["js.array.filter"],
    title: "Keep some",
    prompt: "Return only the even numbers.",
    exportName: "evens",
    starter: stub("evens", "nums"),
    cases: [
      { args: "[1, 2, 3, 4]", is: "[2, 4]" },
      { args: "[1, 3]", is: "[]" },
      { args: "[]", is: "[]" },
    ],
    hint: "`n % 2 === 0` as the test.",
    solution: "function evens(nums) {\n  return nums.filter(n => n % 2 === 0);\n}",
  }),
  rep({
    id: "r.filter.2",
    lesson: "l5.2",
    teaches: ["js.array.filter", "js.values.truthiness"],
    title: "Drop the falsy ones",
    prompt: "Remove every falsy value. One expression.",
    exportName: "compact",
    starter: stub("compact", "items"),
    cases: [
      { args: '[1, 0, "a", "", null, 2]', is: '[1, "a", 2]' },
      { args: "[]", is: "[]" },
      { args: "[false, undefined, NaN]", is: "[]" },
    ],
    hint: "`filter(Boolean)` — hand the conversion function straight to filter.",
    solution: "function compact(items) {\n  return items.filter(Boolean);\n}",
  }),
  rep({
    id: "r.filter.3",
    lesson: "l5.2",
    teaches: ["js.array.filter", "js.array.search"],
    title: "filter vs find",
    prompt:
      "Return the single active user, or `null` if there isn't one. Don't return an array.",
    exportName: "activeUser",
    starter: stub("activeUser", "users"),
    cases: [
      {
        args: '[{ name: "a", active: false }, { name: "b", active: true }]',
        is: '{ name: "b", active: true }',
      },
      { args: '[{ name: "a", active: false }]', is: "null" },
      { args: "[]", is: "null" },
    ],
    hint:
      "`find` gives you the item, not an array — but it returns `undefined` when nothing matches, and you need `null`.",
    solution:
      "function activeUser(users) {\n  return users.find(user => user.active) ?? null;\n}",
  }),

  rep({
    id: "r.reduce.1",
    lesson: "l5.3",
    teaches: ["js.array.reduce"],
    title: "Sum",
    prompt: "Add up the numbers with `reduce`. An empty array gives `0`.",
    exportName: "sum",
    starter: stub("sum", "nums"),
    cases: [
      { args: "[1, 2, 3]", is: "6" },
      { args: "[]", is: "0" },
      { args: "[-1, 1]", is: "0" },
    ],
    hint: "Don't forget the seed — without it, the empty array throws.",
    solution: "function sum(nums) {\n  return nums.reduce((total, n) => total + n, 0);\n}",
  }),
  rep({
    id: "r.reduce.2",
    lesson: "l5.3",
    teaches: ["js.array.reduce"],
    title: "Max without Math.max",
    prompt: "Return the largest number. An empty array gives `null`.",
    exportName: "biggest",
    starter: stub("biggest", "nums"),
    cases: [
      { args: "[3, 9, 2]", is: "9" },
      { args: "[-5, -1]", is: "-1" },
      { args: "[7]", is: "7" },
      { args: "[]", is: "null" },
    ],
    hint:
      "Guard the empty case first, then reduce carrying the best-so-far, seeded with the first element.",
    solution:
      "function biggest(nums) {\n  if (nums.length === 0) return null;\n  return nums.reduce((best, n) => (n > best ? n : best), nums[0]);\n}",
  }),
  rep({
    id: "r.reduce.3",
    lesson: "l5.3",
    teaches: ["js.array.reduce", "js.object.iteration"],
    title: "Carry an object",
    prompt: "Count how many times each word appears.",
    exportName: "countWords",
    starter: stub("countWords", "words"),
    cases: [
      { args: '["a", "b", "a"]', is: "{ a: 2, b: 1 }" },
      { args: "[]", is: "{}" },
      { args: '["x"]', is: "{ x: 1 }" },
    ],
    hint:
      "Seed with `{}`. Each pass: bump the count, then **return the object** — forgetting that is the classic bug.",
    solution:
      "function countWords(words) {\n  return words.reduce((counts, word) => {\n    counts[word] = (counts[word] ?? 0) + 1;\n    return counts;\n  }, {});\n}",
  }),

  rep({
    id: "r.pred.1",
    lesson: "l5.4",
    teaches: ["js.array.predicates"],
    title: "Any of them",
    prompt: "Return `true` if any number is negative.",
    exportName: "hasNegative",
    starter: stub("hasNegative", "nums"),
    cases: [
      { args: "[1, -2, 3]", is: "true" },
      { args: "[1, 2]", is: "false" },
      { args: "[]", is: "false" },
    ],
    hint: "`some` — it stops at the first match.",
    solution: "function hasNegative(nums) {\n  return nums.some(n => n < 0);\n}",
  }),
  rep({
    id: "r.pred.2",
    lesson: "l5.4",
    teaches: ["js.array.predicates"],
    title: "All of them",
    prompt: "Return `true` if every user is active.",
    exportName: "allActive",
    starter: stub("allActive", "users"),
    cases: [
      { args: "[{ active: true }, { active: true }]", is: "true" },
      { args: "[{ active: true }, { active: false }]", is: "false" },
      { args: "[]", is: "true" },
    ],
    hint: "`every`. Note the empty array is `true` — that's the correct answer.",
    solution: "function allActive(users) {\n  return users.every(user => user.active);\n}",
  }),
  rep({
    id: "r.pred.3",
    lesson: "l5.4",
    teaches: ["js.array.predicates"],
    title: "Non-empty and all valid",
    prompt:
      "Return `true` only when there's at least one score **and** every score is 0–100.",
    exportName: "allValid",
    starter: stub("allValid", "scores"),
    cases: [
      { args: "[50, 100]", is: "true" },
      { args: "[50, 101]", is: "false" },
      { args: "[-1]", is: "false" },
      { args: "[]", is: "false" },
    ],
    hint: "`every` alone says `true` for `[]`. Check the length as well.",
    solution:
      "function allValid(scores) {\n  return scores.length > 0 && scores.every(s => s >= 0 && s <= 100);\n}",
  }),

  rep({
    id: "r.sort.1",
    lesson: "l5.5",
    teaches: ["js.array.sort"],
    title: "Numbers, not strings",
    prompt: "Return the numbers smallest to largest, without mutating the input.",
    exportName: "ascending",
    starter: stub("ascending", "nums"),
    tests: [
      { name: "sorts numerically", code: `expect(fn([10, 9, 1])).toEqual([1, 9, 10]);` },
      { name: "negatives", code: `expect(fn([3, -1, 2])).toEqual([-1, 2, 3]);` },
      {
        name: "original untouched",
        code: `const nums = [10, 9, 1];
fn(nums);
expect(nums).toEqual([10, 9, 1]);`,
      },
    ],
    hint: "Copy first, and pass `(a, b) => a - b` or `[1, 10, 9]` is what you get.",
    solution: "function ascending(nums) {\n  return [...nums].sort((a, b) => a - b);\n}",
  }),
  rep({
    id: "r.sort.2",
    lesson: "l5.5",
    teaches: ["js.array.sort"],
    title: "Sort objects",
    prompt: "Return the users oldest first, without mutating the input.",
    exportName: "byAgeDesc",
    starter: stub("byAgeDesc", "users"),
    cases: [
      {
        args: "[{ age: 20 }, { age: 40 }, { age: 30 }]",
        is: "[{ age: 40 }, { age: 30 }, { age: 20 }]",
      },
      { args: "[]", is: "[]" },
    ],
    hint: "`b.age - a.age` for descending.",
    solution:
      "function byAgeDesc(users) {\n  return [...users].sort((a, b) => b.age - a.age);\n}",
    mistakes: [
      {
        match: ">",
        hint: "Returning a boolean never produces a negative number, so `sort` never hears \"a first\". Subtract instead.",
      },
    ],
  }),
  rep({
    id: "r.sort.3",
    lesson: "l5.5",
    teaches: ["js.array.sort"],
    title: "Break the tie",
    prompt:
      "Sort by `score` descending, and break ties by `name` ascending. Don't mutate.",
    exportName: "ranked",
    starter: stub("ranked", "players"),
    cases: [
      {
        args:
          '[{ name: "b", score: 5 }, { name: "a", score: 5 }, { name: "c", score: 9 }]',
        is:
          '[{ name: "c", score: 9 }, { name: "a", score: 5 }, { name: "b", score: 5 }]',
      },
    ],
    hint: "Chain with `||`. The first non-zero result wins, and `0` is falsy.",
    solution:
      "function ranked(players) {\n  return [...players].sort(\n    (a, b) => b.score - a.score || a.name.localeCompare(b.name)\n  );\n}",
  }),

  rep({
    id: "r.chain.1",
    lesson: "l5.6",
    teaches: ["js.array.chaining"],
    title: "Filter then map",
    prompt: "Return the names of the active users only.",
    exportName: "activeNames",
    starter: stub("activeNames", "users"),
    cases: [
      {
        args: '[{ name: "a", active: true }, { name: "b", active: false }]',
        is: '["a"]',
      },
      { args: "[]", is: "[]" },
    ],
    hint: "Filter first, then map. Doing it the other way round works but wastes effort.",
    solution:
      "function activeNames(users) {\n  return users.filter(user => user.active).map(user => user.name);\n}",
  }),
  rep({
    id: "r.chain.2",
    lesson: "l5.6",
    teaches: ["js.array.chaining", "js.array.reduce"],
    title: "All three",
    prompt: "Return the total of the amounts of the paid orders.",
    exportName: "paidTotal",
    starter: stub("paidTotal", "orders"),
    cases: [
      {
        args: "[{ paid: true, amount: 10 }, { paid: false, amount: 99 }, { paid: true, amount: 5 }]",
        is: "15",
      },
      { args: "[]", is: "0" },
      { args: "[{ paid: false, amount: 5 }]", is: "0" },
    ],
    hint: "filter → map → reduce, with `0` as the seed.",
    solution:
      "function paidTotal(orders) {\n  return orders\n    .filter(order => order.paid)\n    .map(order => order.amount)\n    .reduce((total, amount) => total + amount, 0);\n}",
  }),
  rep({
    id: "r.chain.3",
    lesson: "l5.6",
    teaches: ["js.array.chaining", "js.array.sort"],
    title: "Top three",
    prompt:
      "Return the names of the three highest scorers, best first. Fewer than three is fine.",
    exportName: "topThree",
    starter: stub("topThree", "players"),
    cases: [
      {
        args:
          '[{ name: "a", score: 1 }, { name: "b", score: 9 }, { name: "c", score: 5 }, { name: "d", score: 7 }]',
        is: '["b", "d", "c"]',
      },
      { args: '[{ name: "x", score: 1 }]', is: '["x"]' },
      { args: "[]", is: "[]" },
    ],
    hint: "Copy, sort descending, `slice(0, 3)`, then map to names.",
    solution:
      "function topThree(players) {\n  return [...players]\n    .sort((a, b) => b.score - a.score)\n    .slice(0, 3)\n    .map(player => player.name);\n}",
  }),
];

export const M5_LESSONS: Lesson[] = [
  {
    id: "l5.1",
    moduleId: "m5",
    title: "map",
    goal: "Build a new array by transforming every item.",
    atomId: "teach.map",
    repIds: ["r.map.1", "r.map.2", "r.map.3"],
    problemIds: [],
  },
  {
    id: "l5.2",
    moduleId: "m5",
    title: "filter",
    goal: "Keep the items that pass a test — and know when you wanted find instead.",
    atomId: "teach.filter",
    repIds: ["r.filter.1", "r.filter.2", "r.filter.3"],
    problemIds: [],
  },
  {
    id: "l5.3",
    moduleId: "m5",
    title: "reduce",
    goal: "Collapse an array into anything at all, including an object.",
    atomId: "atom.reduce",
    repIds: ["r.reduce.1", "r.reduce.2", "r.reduce.3"],
    problemIds: ["p.group-by"],
  },
  {
    id: "l5.4",
    moduleId: "m5",
    title: "some and every",
    goal: "Ask yes/no questions about a whole array, and stop early.",
    atomId: "teach.predicates",
    repIds: ["r.pred.1", "r.pred.2", "r.pred.3"],
    problemIds: [],
  },
  {
    id: "l5.5",
    moduleId: "m5",
    title: "sort and comparators",
    goal: "Sort numbers, objects, and ties — without reordering your caller's array.",
    atomId: "atom.sort",
    repIds: ["r.sort.1", "r.sort.2", "r.sort.3"],
    problemIds: [],
  },
  {
    id: "l5.6",
    moduleId: "m5",
    title: "Chaining",
    goal: "Combine the methods into readable pipelines, in the right order.",
    atomId: "teach.chaining",
    repIds: ["r.chain.1", "r.chain.2", "r.chain.3"],
    problemIds: ["p.flatten"],
  },
];

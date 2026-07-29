import type { Atom, Lesson, Problem } from "../../types";
import { rep, stub } from "../rep";

export const M2_ATOMS: Atom[] = [
  {
    id: "teach.conditionals",
    title: "if, else, ternary",
    teaches: ["js.flow.conditionals"],
    requires: ["js.values.truthiness"],
    readingSeconds: 60,
    recall: "When is a ternary the wrong choice?",
    body: `\`if\` runs a block when something is truthy.

\`\`\`js
if (score >= 50) {
  return "pass";
} else {
  return "fail";
}
\`\`\`

Chain more conditions with \`else if\`. The first one that matches wins, and the rest are never checked.

## The ternary

When both branches produce a *value*, a ternary says the same thing shorter.

\`\`\`js
const result = score >= 50 ? "pass" : "fail";
\`\`\`

Read it as: condition, then the true value, then the false value.

Use it when you're choosing between two values. Don't use it to run two different actions — that's what \`if\` is for, and a ternary doing side effects reads badly.

## The catch

Nesting ternaries is where readable code goes to die.

\`\`\`js
const label = n < 0 ? "neg" : n === 0 ? "zero" : n < 10 ? "small" : "big";
\`\`\`

That's four branches on one line with no visual structure. Once you need more than two outcomes, use \`if\`/\`else if\`, or a lookup object. Your future self reads code far more often than they write it.`,
  },
  {
    id: "teach.loops",
    title: "Loops",
    teaches: ["js.flow.loops"],
    requires: ["js.flow.conditionals"],
    readingSeconds: 75,
    recall: "Which loop do you use when you need the index, and which when you don't?",
    body: `Three loops cover almost everything.

\`\`\`js
for (let i = 0; i < items.length; i++) { }  // when you need the index
for (const item of items) { }               // when you don't
while (condition) { }                       // when you don't know how many
\`\`\`

The classic \`for\` has three parts separated by semicolons: where to start, how long to keep going, and what to do after each pass.

\`for...of\` hands you the values directly. Reach for it by default — fewer moving parts means fewer off-by-one bugs.

## break and continue

\`\`\`js
for (const item of items) {
  if (item.skip) continue;   // jump to the next pass
  if (item.stop) break;      // leave the loop entirely
}
\`\`\`

\`break\` is how you stop early once you've found what you were looking for. Forgetting it means doing the whole array's work after you already had the answer.

## The catch

Changing an array while looping over it by index.

\`\`\`js
for (let i = 0; i < items.length; i++) {
  if (items[i] === 0) items.splice(i, 1);   // skips elements
}
\`\`\`

Removing item \`i\` shifts everything down, so the next element slides into position \`i\` — and then \`i++\` steps straight over it. \`[0, 0]\` leaves one zero behind.

Either walk backwards, or build a new array instead of editing the one you're reading.`,
  },
  {
    id: "teach.iteration-forms",
    title: "for...of vs for...in",
    teaches: ["js.flow.iteration-forms"],
    requires: ["js.flow.loops"],
    readingSeconds: 60,
    recall: "You loop an array with `for...in`. What type are the values you get?",
    body: `These two look alike and do completely different things.

\`\`\`js
const items = ["a", "b"];

for (const value of items) console.log(value);  // "a", "b"
for (const key   in items) console.log(key);    // "0", "1"
\`\`\`

**\`for...of\` gives you values. \`for...in\` gives you keys** — and for an array, the keys are the indexes, *as strings*.

That string part causes real bugs:

\`\`\`js
for (const i in [10, 20]) {
  console.log(i + 1);   // "01", "11"  — string concatenation
}
\`\`\`

## The rule

**Arrays: \`for...of\`. Objects: \`Object.entries\`.**

\`\`\`js
for (const [key, value] of Object.entries(user)) { }
\`\`\`

## The catch

\`for...in\` also walks inherited keys. If anything has been added to \`Object.prototype\` — by an old library, or by your own code — those keys show up in every loop in the program.

\`for...of\` doesn't have this problem, and \`Object.entries\` only returns the object's own keys. Between them you almost never need \`for...in\` at all.`,
  },
  {
    id: "teach.guards",
    title: "Guard clauses",
    teaches: ["js.flow.guards"],
    requires: ["js.flow.conditionals"],
    readingSeconds: 60,
    recall: "What does a guard clause let you delete from the rest of the function?",
    body: `Handle the bad cases first, then leave. What's left is the real work, unindented.

\`\`\`js
function firstName(user) {
  if (!user) return null;
  if (!user.name) return null;
  return user.name.split(" ")[0];
}
\`\`\`

Compare the nested version:

\`\`\`js
function firstName(user) {
  if (user) {
    if (user.name) {
      return user.name.split(" ")[0];
    } else {
      return null;
    }
  } else {
    return null;
  }
}
\`\`\`

Same behaviour. One is three lines and reads top to bottom; the other makes you hold two open branches in your head to find the one line that matters.

## Why it works

Each guard removes a possibility permanently. Once both guards have run, you *know* \`user\` exists and \`user.name\` exists — so you don't have to check for them again, and you don't have to indent.

## The catch

Guards are for the exceptional cases, not for half your logic. If a function has eight guards, the problem isn't the style — it's that the function is doing too much, or that its input should have been validated before it got there.

**Rule of thumb: bail out early, return the real answer last, and never let the important line be the most indented one.**`,
  },
];

export const M2_REPS: Problem[] = [
  rep({
    id: "r.cond.1",
    lesson: "l2.1",
    teaches: ["js.flow.conditionals"],
    title: "Sign of a number",
    prompt: "Return `-1` for negatives, `0` for zero, `1` for positives.",
    exportName: "sign",
    starter: stub("sign", "n"),
    cases: [
      { args: "5", is: "1" },
      { args: "-3", is: "-1" },
      { args: "0", is: "0" },
    ],
    hint: "Two `if`s and a final `return`, or `if / else if / else`.",
    solution:
      "function sign(n) {\n  if (n > 0) return 1;\n  if (n < 0) return -1;\n  return 0;\n}",
  }),
  rep({
    id: "r.cond.2",
    lesson: "l2.1",
    teaches: ["js.flow.conditionals"],
    title: "Ternary",
    prompt: "Return the larger of the two numbers. Use a ternary, on one line.",
    exportName: "larger",
    starter: stub("larger", "a, b"),
    cases: [
      { args: "3, 7", is: "7" },
      { args: "10, 2", is: "10" },
      { args: "4, 4", is: "4" },
    ],
    hint: "`return a > b ? a : b;`",
    solution: "function larger(a, b) {\n  return a > b ? a : b;\n}",
  }),
  rep({
    id: "r.cond.3",
    lesson: "l2.1",
    teaches: ["js.flow.conditionals"],
    title: "Four outcomes",
    prompt:
      'Return `"F"` below 50, `"C"` below 70, `"B"` below 85, `"A"` otherwise.',
    exportName: "grade",
    starter: stub("grade", "score"),
    cases: [
      { args: "20", is: '"F"' },
      { args: "49", is: '"F"' },
      { args: "50", is: '"C"' },
      { args: "69", is: '"C"' },
      { args: "70", is: '"B"' },
      { args: "84", is: '"B"' },
      { args: "85", is: '"A"' },
      { args: "100", is: '"A"' },
    ],
    hint:
      "Check lowest first and return immediately. Each later check already knows the earlier ones failed.",
    solution:
      'function grade(score) {\n  if (score < 50) return "F";\n  if (score < 70) return "C";\n  if (score < 85) return "B";\n  return "A";\n}',
  }),

  rep({
    id: "r.loop.1",
    lesson: "l2.2",
    teaches: ["js.flow.loops"],
    title: "Sum with a loop",
    prompt: "Add up the numbers and return the total. Use a loop, not `reduce`.",
    exportName: "total",
    starter: stub("total", "nums"),
    cases: [
      { args: "[1, 2, 3]", is: "6" },
      { args: "[]", is: "0" },
      { args: "[-1, 1]", is: "0" },
    ],
    hint: "`let sum = 0` before the loop, add to it inside, return it after.",
    solution:
      "function total(nums) {\n  let sum = 0;\n  for (const n of nums) {\n    sum += n;\n  }\n  return sum;\n}",
  }),
  rep({
    id: "r.loop.2",
    lesson: "l2.2",
    teaches: ["js.flow.loops"],
    title: "Countdown",
    prompt: "Return an array counting down from `n` to 1. `n` of 0 gives `[]`.",
    exportName: "countdown",
    starter: stub("countdown", "n"),
    cases: [
      { args: "3", is: "[3, 2, 1]" },
      { args: "1", is: "[1]" },
      { args: "0", is: "[]" },
    ],
    hint: "A `for` loop that starts at `n` and goes down while `i >= 1`.",
    solution:
      "function countdown(n) {\n  const out = [];\n  for (let i = n; i >= 1; i--) {\n    out.push(i);\n  }\n  return out;\n}",
  }),
  rep({
    id: "r.loop.3",
    lesson: "l2.2",
    teaches: ["js.flow.loops"],
    title: "Stop early",
    prompt:
      "Return the index of the first negative number, or `-1` if there isn't one. Stop looking once you find it.",
    exportName: "firstNegative",
    starter: stub("firstNegative", "nums"),
    cases: [
      { args: "[1, 2, -3, -4]", is: "2" },
      { args: "[-1]", is: "0" },
      { args: "[1, 2]", is: "-1" },
      { args: "[]", is: "-1" },
    ],
    hint:
      "You need the index, so use a classic `for`. Returning from inside the loop stops it.",
    solution:
      "function firstNegative(nums) {\n  for (let i = 0; i < nums.length; i++) {\n    if (nums[i] < 0) return i;\n  }\n  return -1;\n}",
  }),

  rep({
    id: "r.iter.1",
    lesson: "l2.3",
    teaches: ["js.flow.iteration-forms"],
    title: "Values, not indexes",
    prompt: "Return the longest string in the array. Empty array gives `\"\"`.",
    exportName: "longest",
    starter: stub("longest", "words"),
    cases: [
      { args: '["a", "abc", "ab"]', is: '"abc"' },
      { args: '["x"]', is: '"x"' },
      { args: "[]", is: '""' },
    ],
    hint: "`for...of` hands you each word directly. Keep the best one seen so far.",
    solution:
      'function longest(words) {\n  let best = "";\n  for (const word of words) {\n    if (word.length > best.length) best = word;\n  }\n  return best;\n}',
  }),
  rep({
    id: "r.iter.2",
    lesson: "l2.3",
    teaches: ["js.flow.iteration-forms", "js.object.iteration"],
    title: "Walk an object",
    prompt:
      "Add up all the values in the object and return the total.",
    exportName: "sumValues",
    starter: stub("sumValues", "obj"),
    cases: [
      { args: "{ a: 1, b: 2 }", is: "3" },
      { args: "{}", is: "0" },
      { args: "{ x: 10 }", is: "10" },
    ],
    hint: "`Object.values(obj)` gives you an array. Then it's the same loop as before.",
    solution:
      "function sumValues(obj) {\n  let sum = 0;\n  for (const value of Object.values(obj)) {\n    sum += value;\n  }\n  return sum;\n}",
  }),
  rep({
    id: "r.iter.3",
    lesson: "l2.3",
    teaches: ["js.flow.iteration-forms", "js.object.iteration"],
    title: "Keys and values together",
    prompt:
      'Return an array of `"key=value"` strings, in the object\'s own order.',
    exportName: "pairs",
    starter: stub("pairs", "obj"),
    cases: [
      { args: "{ a: 1, b: 2 }", is: '["a=1", "b=2"]' },
      { args: "{}", is: "[]" },
    ],
    hint:
      "`Object.entries` gives `[key, value]` pairs. Destructure them in the loop head.",
    solution:
      "function pairs(obj) {\n  const out = [];\n  for (const [key, value] of Object.entries(obj)) {\n    out.push(`${key}=${value}`);\n  }\n  return out;\n}",
  }),

  rep({
    id: "r.guard.1",
    lesson: "l2.4",
    teaches: ["js.flow.guards"],
    title: "Bail out early",
    prompt:
      "Return the first word of `user.name`. Return `null` if there's no user or no name.",
    exportName: "firstName",
    starter: stub("firstName", "user"),
    cases: [
      { args: '{ name: "Ada Lovelace" }', is: '"Ada"' },
      { args: '{ name: "Grace" }', is: '"Grace"' },
      { args: "{}", is: "null" },
      { args: "null", is: "null" },
    ],
    hint:
      "Two guards at the top, then one unindented line doing the real work.",
    solution:
      'function firstName(user) {\n  if (!user) return null;\n  if (!user.name) return null;\n  return user.name.split(" ")[0];\n}',
  }),
  rep({
    id: "r.guard.2",
    lesson: "l2.4",
    teaches: ["js.flow.guards"],
    title: "Guard the impossible",
    prompt:
      "Divide `a` by `b`. Return `null` instead of `Infinity` when `b` is zero.",
    exportName: "safeDivide",
    starter: stub("safeDivide", "a, b"),
    cases: [
      { args: "10, 2", is: "5" },
      { args: "7, 0", is: "null" },
      { args: "0, 5", is: "0" },
      { args: "-6, 3", is: "-2" },
    ],
    hint:
      "One guard. Watch that `0 / 5` is a legitimate answer — don't guard on `!a`.",
    solution:
      "function safeDivide(a, b) {\n  if (b === 0) return null;\n  return a / b;\n}",
  }),
  rep({
    id: "r.guard.3",
    lesson: "l2.4",
    teaches: ["js.flow.guards"],
    title: "Flatten the nest",
    prompt:
      "Return the discounted price. No order gives `0`; no items gives `0`; a `coupon` takes 10% off.",
    exportName: "totalFor",
    starter: stub("totalFor", "order"),
    cases: [
      { args: "{ items: [ { price: 100 } ] }", is: "100" },
      { args: "{ items: [ { price: 100 } ], coupon: true }", is: "90" },
      { args: "{ items: [] }", is: "0" },
      { args: "null", is: "0" },
    ],
    hint:
      "Guard away `null` and the empty list first. Then sum, then apply the coupon.",
    solution:
      "function totalFor(order) {\n  if (!order) return 0;\n  if (!order.items || order.items.length === 0) return 0;\n\n  let sum = 0;\n  for (const item of order.items) sum += item.price;\n  return order.coupon ? sum * 0.9 : sum;\n}",
  }),
];

export const M2_LESSONS: Lesson[] = [
  {
    id: "l2.1",
    moduleId: "m2",
    title: "if, else, ternary",
    goal: "Branch cleanly, and know when a ternary helps and when it hurts.",
    atomId: "teach.conditionals",
    repIds: ["r.cond.1", "r.cond.2", "r.cond.3"],
    problemIds: [],
  },
  {
    id: "l2.2",
    moduleId: "m2",
    title: "Loops",
    goal: "Write all three loop forms, and stop early when you've found the answer.",
    atomId: "teach.loops",
    repIds: ["r.loop.1", "r.loop.2", "r.loop.3"],
    problemIds: [],
  },
  {
    id: "l2.3",
    moduleId: "m2",
    title: "for...of vs for...in",
    goal: "Iterate arrays and objects without falling into the string-index trap.",
    atomId: "teach.iteration-forms",
    repIds: ["r.iter.1", "r.iter.2", "r.iter.3"],
    problemIds: [],
  },
  {
    id: "l2.4",
    moduleId: "m2",
    title: "Guard clauses",
    goal: "Handle the bad cases first so the real work never ends up five levels deep.",
    atomId: "teach.guards",
    repIds: ["r.guard.1", "r.guard.2", "r.guard.3"],
    problemIds: [],
  },
];

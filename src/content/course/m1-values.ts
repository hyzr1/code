import type { Atom, Lesson, Problem } from "../../types";
import { rep, stub } from "../rep";

export const M1_ATOMS: Atom[] = [
  {
    id: "teach.declarations",
    title: "let and const",
    teaches: ["js.values.declarations"],
    requires: [],
    readingSeconds: 60,
    recall: "When would you reach for `let` instead of `const`?",
    body: `A variable is a name for a value.

\`\`\`js
const price = 20;
let total = 0;
\`\`\`

\`const\` means the name is stuck to that value forever. \`let\` means you can point it somewhere else later.

\`\`\`js
let total = 0;
total = 5;      // fine

const price = 20;
price = 25;     // TypeError
\`\`\`

**Reach for \`const\` first.** Switch to \`let\` only when you actually reassign — usually a counter, an accumulator, or a value built up inside a loop. Code where most names never change is code you can read faster, because a \`const\` is a promise that the name still means what it meant three lines ago.

## The catch

\`const\` does not freeze the value. It freezes the *name*.

\`\`\`js
const user = { name: "Ada" };
user.name = "Grace";   // fine — you didn't move the name
user = {};             // TypeError — you tried to move the name
\`\`\`

Objects and arrays can be edited through a \`const\`. Only the pointing is locked. You'll meet the full version of this idea in the reference-vs-value lesson, and it explains more bugs than any other single rule in the language.`,
  },
  {
    id: "teach.types",
    title: "Types and typeof",
    teaches: ["js.values.types"],
    requires: [],
    readingSeconds: 70,
    recall: "What does `typeof null` return, and what should you use instead to detect an array?",
    body: `Every value has a type. \`typeof\` tells you which.

\`\`\`js
typeof 42;         // "number"
typeof "hi";       // "string"
typeof true;       // "boolean"
typeof undefined;  // "undefined"
typeof Symbol();   // "symbol"
typeof 10n;        // "bigint"
typeof {};         // "object"
typeof [];         // "object"
typeof null;       // "object"
typeof function(){}; // "function"
\`\`\`

Seven primitive types, plus objects. Functions are objects, but \`typeof\` gives them their own answer because it's useful.

## The catch

The last three lines are all wrong in different ways, and you have to memorise them.

\`typeof null\` is \`"object"\`. This is a bug from 1995 that can never be fixed without breaking the web. Check for null directly:

\`\`\`js
value === null
\`\`\`

\`typeof []\` is \`"object"\` too, so \`typeof\` can't spot an array. Use:

\`\`\`js
Array.isArray(value)
\`\`\`

## Why there are two "nothing" values

\`undefined\` and \`null\` both mean "no value", and having two is a common complaint about the language. They aren't the same thing:

- **\`undefined\`** — JavaScript's own word for "nothing was ever put here". You get it from a variable that was never assigned, a missing object property, a missing function argument, or a function that didn't return.
- **\`null\`** — a value *you* assign to say "deliberately empty". A person wrote it down.

\`\`\`js
let a;                 // undefined — never given anything
const b = null;        // null — explicitly emptied
({}).missing;          // undefined — no such property
\`\`\`

A rough rule: **if you see \`undefined\`, something didn't happen. If you see \`null\`, someone decided.**

## Numbers are one type

There is no separate integer type. \`1\` and \`1.5\` are both \`number\`, both stored the same way — which is why \`0.1 + 0.2\` gives \`0.30000000000000004\`. Module 0 works through exactly where that trailing \`4\` comes from.`,
  },
  {
    id: "teach.truthiness",
    title: "Truthiness",
    teaches: ["js.values.truthiness"],
    requires: ["js.values.types"],
    readingSeconds: 220,
    recall:
      "Name all eight falsy values. Then: why is `level || 50` a bug when `level` is `0`, and what fixes it?",
    body: `JavaScript often needs a yes-or-no answer from a value that isn't \`true\` or \`false\`.

If you write \`if (name)\`, \`name\` is a string, not a boolean. So the language has a rule for converting **any** value into true or false. A value that converts to \`true\` is called **truthy**. One that converts to \`false\` is **falsy**.

## The eight falsy values

There are exactly eight. **Everything else in the entire language is truthy.**

\`\`\`js
false        the boolean itself
0            zero
-0           negative zero (yes, it exists)
0n           zero as a BigInt
""           the empty string
null         "deliberately nothing"
undefined    "nothing here"
NaN          the result of impossible maths
\`\`\`

Learn this list. It's short, it never changes, and it explains a surprising share of confusing bugs.

The trick is that the list is defined the *other* way round from how people assume. You don't check whether something is "empty" or "meaningful" — you check whether it's one of those eight exact values.

## The ones that surprise people

\`\`\`js
Boolean([]);      // true   — an empty array is truthy
Boolean({});      // true   — an empty object is truthy
Boolean("0");     // true   — a string containing zero
Boolean("false"); // true   — a string containing the word false
Boolean(-1);      // true   — any non-zero number
Boolean(" ");     // true   — a string with just a space
\`\`\`

An empty array being truthy catches everyone. It isn't on the list of eight, so it's truthy. That's the whole reason.

The consequence matters:

\`\`\`js
if (items) { }          // ALWAYS runs — even for []
if (items.length) { }   // runs only when there's something in it
\`\`\`

\`length\` is a number, and \`0\` **is** on the list.

## Converting on purpose

\`Boolean(value)\` applies exactly that rule and hands you back a real \`true\` or \`false\`.

\`\`\`js
Boolean("hi");   // true
Boolean("");     // false
Boolean(0);      // false
\`\`\`

## The logical operators

Four operators work with truthiness. You'll use all of them constantly.

**\`!\` flips it.** Read it out loud as "not".

\`\`\`js
!true;      // false
!0;         // true    — 0 is falsy, so "not falsy" is true
!"hi";      // false
!!"hi";     // true    — two flips, same as Boolean("hi")
\`\`\`

**\`&&\` means "and".** True only when both sides are truthy.

\`\`\`js
true && true;    // true
true && false;   // false
\`\`\`

**\`||\` means "or".** True when either side is truthy.

\`\`\`js
false || true;   // true
false || false;  // false
\`\`\`

There's a detail here that trips people up later, so meet it now: \`&&\` and \`||\` don't actually return \`true\` or \`false\`. They return **one of the two values you gave them**.

\`\`\`js
"hi" || "bye";   // "hi"    — the first truthy one
0 || "bye";      // "bye"   — 0 was falsy, so it moved on
\`\`\`

\`||\` walks left to right and hands back the first truthy value it finds. That's why it works as a "fallback" — and it's also where the bug below comes from.

## The catch

\`||\` falls back on **any** falsy value, not just missing ones.

\`\`\`js
function setVolume(level) {
  const value = level || 50;
  return value;
}

setVolume(30);   // 30   fine
setVolume(0);    // 50   BUG — you asked for silence
\`\`\`

Trace it. \`level\` is \`0\`. \`0\` is one of the eight falsy values. So \`||\` decides the left side "isn't there" and reaches for the fallback — even though \`0\` was a completely deliberate choice by the caller.

The same thing eats \`""\` (a deliberately blank name) and \`false\` (a deliberately disabled setting).

## The fix: ??

\`??\` is the **nullish coalescing** operator. Nullish means one specific pair of values: \`null\` and \`undefined\`. Nothing else.

\`\`\`js
const value = level ?? 50;

// level = 30  → 30
// level = 0   → 0     ← survives, because 0 isn't nullish
// level = ""  → ""    ← survives
// level = null      → 50
// level = undefined → 50
\`\`\`

\`??\` asks *"is this actually missing?"*. \`||\` asks *"is this falsy?"*. Those are different questions, and almost every time you want the first one.

**Reach for \`??\` by default. Use \`||\` only when you genuinely want every falsy value to fall through.**`,
  },
  {
    id: "teach.equality",
    title: "Equality",
    teaches: ["js.values.equality"],
    requires: ["js.values.types"],
    readingSeconds: 70,
    recall: "Which comparison correctly reports that `NaN` equals itself?",
    body: `\`===\` compares without converting. \`==\` converts first, then compares.

\`\`\`js
1 === "1";  // false — different types, done
1 ==  "1";  // true  — "1" becomes 1 first
\`\`\`

**Use \`===\`.** The conversion rules behind \`==\` are a table nobody remembers, and they produce results like these:

\`\`\`js
[] == false;      // true
"0" == false;     // true
null == undefined; // true
\`\`\`

The one place \`==\` earns its keep is \`value == null\`, which is true for both \`null\` and \`undefined\` and is a genuinely useful shorthand.

## Two things === gets wrong

\`\`\`js
NaN === NaN;        // false
[1, 2] === [1, 2];  // false
\`\`\`

The first is deliberate: \`NaN\` means "not a number," and two failed calculations aren't the same failure. Use \`Number.isNaN(x)\`, or \`Object.is(a, b)\` which reports \`NaN\` as equal to itself.

The second is not a mistake either. \`===\` on objects asks *"is this the same object?"* — not *"do these look alike?"* Two arrays with identical contents are still two arrays. To compare contents you have to walk them yourself.

## The catch

\`Object.is\` fixes \`NaN\` but adds its own edge:

\`\`\`js
Object.is(0, -0);  // false
0 === -0;          // true
\`\`\`

Rarely matters. Worth knowing it exists before it costs you an hour.`,
  },
];

export const M1_REPS: Problem[] = [
  // ---------------------------------------------------- l1.1 declarations
  rep({
    id: "r.decl.1",
    lesson: "l1.1",
    teaches: ["js.values.declarations"],
    title: "Store and return",
    prompt: "Return `n` doubled. Store it in a `const` first, then return it.",
    exportName: "double",
    starter: stub("double", "n"),
    cases: [
      { args: "3", is: "6" },
      { args: "-2", is: "-4" },
      { args: "0", is: "0" },
    ],
    hint: "`const result = n * 2;` then `return result;` — two lines.",
    solution: "function double(n) {\n  const result = n * 2;\n  return result;\n}",
  }),
  rep({
    id: "r.decl.2",
    lesson: "l1.1",
    teaches: ["js.values.declarations"],
    title: "A value that changes",
    prompt:
      "Start a total at `0`. Add `a` to it, then on a separate line add `b` to it, then return it.\n\nThe total changes twice, so it can't be a `const`.",
    exportName: "runningTotal",
    starter: stub("runningTotal", "a, b"),
    cases: [
      { args: "1, 2", is: "3" },
      { args: "0, 0", is: "0" },
      { args: "-1, 5", is: "4" },
    ],
    hint:
      "`let total = 0;` then `total = total + a;` then `total = total + b;` then return it. Read `total = total + a` as: work out the right side, then put that answer back into `total`.",
    solution:
      "function runningTotal(a, b) {\n  let total = 0;\n  total = total + a;\n  total = total + b;\n  return total;\n}",
    seconds: 55,
  }),
  rep({
    id: "r.decl.3",
    lesson: "l1.1",
    teaches: ["js.values.declarations", "js.values.reference"],
    title: "const doesn't freeze",
    prompt:
      "The array is declared `const`. Add `item` to the end of it anyway and return it.",
    exportName: "addItem",
    starter: "function addItem(item) {\n  const list = [1, 2];\n  \n}",
    cases: [
      { args: "3", is: "[1, 2, 3]" },
      { args: '"x"', is: '[1, 2, "x"]' },
    ],
    hint:
      "`const` blocks reassigning the name, not editing the thing. `list.push(item)` is allowed.",
    solution:
      "function addItem(item) {\n  const list = [1, 2];\n  list.push(item);\n  return list;\n}",
  }),

  // ----------------------------------------------------------- l1.2 types
  rep({
    id: "r.types.1",
    lesson: "l1.2",
    teaches: ["js.values.types"],
    title: "typeof",
    prompt: "Return the `typeof` the value you're given.",
    exportName: "typeName",
    starter: stub("typeName", "value"),
    cases: [
      { args: "42", is: '"number"' },
      { args: '"hi"', is: '"string"' },
      { args: "true", is: '"boolean"' },
      { args: "undefined", is: '"undefined"' },
      { args: "null", is: '"object"' },
    ],
    hint: "One line. `typeof` is an operator, not a function — no parentheses needed.",
    solution: "function typeName(value) {\n  return typeof value;\n}",
  }),
  rep({
    id: "r.types.2",
    lesson: "l1.2",
    teaches: ["js.values.types"],
    title: "Detect an array",
    prompt:
      "Return `true` only if the value is an array. `typeof` will not help you here.",
    exportName: "isArray",
    starter: stub("isArray", "value"),
    cases: [
      { args: "[]", is: "true" },
      { args: "[1, 2]", is: "true" },
      { args: "{}", is: "false" },
      { args: "null", is: "false" },
      { args: '"abc"', is: "false" },
    ],
    hint: "There's a built-in for exactly this: `Array.isArray`.",
    solution: "function isArray(value) {\n  return Array.isArray(value);\n}",
    mistakes: [
      {
        match: "typeof",
        hint: "`typeof []` is `\"object\"` — same as `{}` and `null`. It can't tell them apart.",
      },
    ],
  }),
  rep({
    id: "r.types.3",
    lesson: "l1.2",
    teaches: ["js.values.types"],
    title: "Spot the NaN",
    prompt:
      'Return `true` when the value is `NaN`.\n\n`NaN` means "Not a Number". It\'s what you get back from impossible maths, like `Number("abc")` or `0 / 0`. Confusingly, its `typeof` is `"number"` — so `typeof` cannot help you here.',
    exportName: "isNotANumber",
    starter: stub("isNotANumber", "value"),
    cases: [
      { args: "NaN", is: "true" },
      { args: '0 / 0', is: "true" },
      { args: "42", is: "false" },
      { args: '"abc"', is: "false" },
      { args: "null", is: "false" },
    ],
    hint:
      "There's a built-in for exactly this: `Number.isNaN(value)`. Note it only says `true` for the actual `NaN` value — a string like `\"abc\"` is not `NaN`, it's just a string.",
    solution: "function isNotANumber(value) {\n  return Number.isNaN(value);\n}",
    seconds: 45,
  }),

  // ------------------------------------------------------ l1.3 truthiness
  rep({
    id: "r.truth.1",
    lesson: "l1.3",
    teaches: ["js.values.truthiness"],
    title: "Truthy or falsy",
    prompt:
      "Return `true` when the value is truthy and `false` when it's falsy.\n\nWatch the last two cases — an empty array and an empty object are both **truthy**.",
    exportName: "isTruthy",
    starter: stub("isTruthy", "value"),
    cases: [
      { args: "1", is: "true" },
      { args: "0", is: "false" },
      { args: '""', is: "false" },
      { args: '"a"', is: "true" },
      { args: "null", is: "false" },
      { args: "[]", is: "true" },
      { args: "{}", is: "true" },
    ],
    hint:
      "`Boolean(value)` converts anything at all into exactly `true` or `false`, using the same rule an `if` would use.",
    solution: "function isTruthy(value) {\n  return Boolean(value);\n}",
    seconds: 40,
  }),
  rep({
    id: "r.truth.2",
    lesson: "l1.3",
    teaches: ["js.values.truthiness"],
    title: "Only when missing",
    prompt:
      "Return `value`, or `fallback` when `value` is missing. `0` and `\"\"` are real values and must survive.",
    exportName: "orDefault",
    starter: stub("orDefault", "value, fallback"),
    cases: [
      { args: "5, 50", is: "5" },
      { args: "0, 50", is: "0" },
      { args: '"", "none"', is: '""' },
      { args: "null, 50", is: "50" },
      { args: "undefined, 50", is: "50" },
      { args: "false, true", is: "false" },
    ],
    hint: "`||` would swallow the `0`. You want `??`.",
    solution: "function orDefault(value, fallback) {\n  return value ?? fallback;\n}",
    mistakes: [
      {
        match: "||",
        hint: "`||` falls back on every falsy value, so a real `0` or `\"\"` gets replaced. `??` only catches `null` and `undefined`.",
      },
    ],
  }),
  rep({
    id: "r.truth.3",
    lesson: "l1.3",
    teaches: ["js.values.truthiness"],
    title: "Has items",
    prompt:
      "Return `true` when the array has at least one item.\n\nCareful: an empty array is **truthy**, so testing the array itself would always say yes. Test something that isn't the array.\n\nNote the last case — an array holding a single `0` still has an item in it.",
    exportName: "hasItems",
    starter: stub("hasItems", "items"),
    cases: [
      { args: "[1]", is: "true" },
      { args: "[]", is: "false" },
      { args: "[0]", is: "true" },
    ],
    hint:
      "`items.length` is a plain number, and `0` is one of the eight falsy values. Compare it directly: `items.length > 0`.",
    solution: "function hasItems(items) {\n  return items.length > 0;\n}",
    seconds: 40,
  }),

  // -------------------------------------------------------- l1.4 equality
  rep({
    id: "r.eq.1",
    lesson: "l1.4",
    teaches: ["js.values.equality"],
    title: "Loose vs strict",
    prompt: "Return `[looseResult, strictResult]` for the two values.",
    exportName: "compare",
    starter: stub("compare", "a, b"),
    cases: [
      { args: '1, "1"', is: "[true, false]" },
      { args: "1, 1", is: "[true, true]" },
      { args: "null, undefined", is: "[true, false]" },
      { args: "0, false", is: "[true, false]" },
    ],
    hint: "Return an array literal with `a == b` first and `a === b` second.",
    solution: "function compare(a, b) {\n  return [a == b, a === b];\n}",
  }),
  rep({
    id: "r.eq.2",
    lesson: "l1.4",
    teaches: ["js.values.equality"],
    title: "NaN equals itself",
    prompt:
      "Return `true` when the two values are the same, counting `NaN` as equal to `NaN`.",
    exportName: "sameValue",
    starter: stub("sameValue", "a, b"),
    cases: [
      { args: "1, 1", is: "true" },
      { args: "NaN, NaN", is: "true" },
      { args: '1, "1"', is: "false" },
      { args: '"a", "a"', is: "true" },
    ],
    hint: "`===` says `NaN !== NaN`. `Object.is` doesn't.",
    solution: "function sameValue(a, b) {\n  return Object.is(a, b);\n}",
  }),
  rep({
    id: "r.eq.3",
    lesson: "l1.4",
    teaches: ["js.values.equality", "js.values.reference"],
    title: "Why === can't compare arrays",
    prompt:
      "Return `true` when the two arrays hold the same **number** of items.\n\nYou might reach for `a === b`. Try it and every test fails — even `[] === []` is `false`, because `===` on arrays asks *\"is this the same array?\"*, not *\"do these look alike?\"*. Compare something you can actually compare.",
    exportName: "sameLength",
    starter: stub("sameLength", "a, b"),
    cases: [
      { args: "[1, 2], [3, 4]", is: "true" },
      { args: "[1], [1, 2]", is: "false" },
      { args: "[], []", is: "true" },
      { args: '["a", "b"], [1, 2]', is: "true" },
    ],
    hint:
      "`a.length` and `b.length` are plain numbers, and `===` compares numbers perfectly well: `return a.length === b.length;`",
    solution: "function sameLength(a, b) {\n  return a.length === b.length;\n}",
    seconds: 45,
  }),

  // ------------------------------------------------------- l1.5 reference
  rep({
    id: "r.ref.1",
    lesson: "l1.5",
    teaches: ["js.values.reference"],
    title: "A real copy",
    prompt:
      "Return a copy of the array. Editing the copy must not touch the original.",
    exportName: "copyOf",
    starter: stub("copyOf", "items"),
    cases: [{ args: "[1, 2]", is: "[1, 2]" }],
    tests: [
      {
        name: "the copy is a different array",
        code: `const original = [1, 2];
const copy = fn(original);
expect(copy).toEqual([1, 2]);
expect(copy).not.toBe(original);`,
      },
      {
        name: "editing the copy leaves the original alone",
        code: `const original = [1, 2];
fn(original).push(3);
expect(original).toEqual([1, 2]);`,
      },
    ],
    hint: "Spread it into a fresh array: `[...items]`.",
    solution: "function copyOf(items) {\n  return [...items];\n}",
    mistakes: [
      {
        match: "return items",
        hint: "Returning the same array hands back the same handle — there's no copy, just a second name.",
      },
    ],
  }),
  rep({
    id: "r.ref.2",
    lesson: "l1.5",
    teaches: ["js.values.reference", "js.functions.pure"],
    title: "Change without changing",
    prompt:
      "Return a new object with `age` set to the new value. The original object must be untouched.",
    exportName: "withAge",
    starter: stub("withAge", "user, age"),
    tests: [
      {
        name: "returns the updated value",
        code: `expect(fn({ name: "Ada", age: 30 }, 31)).toEqual({ name: "Ada", age: 31 });`,
      },
      {
        name: "leaves the original alone",
        code: `const user = { name: "Ada", age: 30 };
fn(user, 31);
expect(user.age).toBe(30);`,
      },
      {
        name: "keeps the other keys",
        code: `expect(fn({ a: 1, b: 2, age: 0 }, 9)).toEqual({ a: 1, b: 2, age: 9 });`,
      },
    ],
    hint: "Spread the old object into a new one, then override the key after it.",
    solution: "function withAge(user, age) {\n  return { ...user, age };\n}",
    mistakes: [
      {
        match: "user.age =",
        hint: "That edits the caller's object. Build a new one instead.",
      },
    ],
  }),
  rep({
    id: "r.ref.3",
    lesson: "l1.5",
    teaches: ["js.values.reference"],
    title: "Shallow only goes one level",
    prompt:
      "`{ ...obj }` copies one level. Return a copy where the `tags` array is also its own array.",
    exportName: "copyWithTags",
    starter: stub("copyWithTags", "obj"),
    tests: [
      {
        name: "same contents",
        code: `expect(fn({ id: 1, tags: ["x"] })).toEqual({ id: 1, tags: ["x"] });`,
      },
      {
        name: "the tags array is not shared",
        code: `const original = { id: 1, tags: ["x"] };
fn(original).tags.push("y");
expect(original.tags).toEqual(["x"]);`,
      },
    ],
    hint: "Spread the object, then spread the inner array too: `tags: [...obj.tags]`.",
    solution:
      "function copyWithTags(obj) {\n  return { ...obj, tags: [...obj.tags] };\n}",
  }),
];

export const M1_LESSONS: Lesson[] = [
  {
    id: "l1.1",
    moduleId: "m1",
    title: "let and const",
    goal: "Name a value, and know which keyword to reach for.",
    atomId: "teach.declarations",
    repIds: ["r.decl.1", "r.decl.2", "r.decl.3"],
    problemIds: [],
  },
  {
    id: "l1.2",
    moduleId: "m1",
    title: "Types and typeof",
    goal: "Tell what kind of value you're holding — including the three cases typeof gets wrong.",
    atomId: "teach.types",
    repIds: ["r.types.1", "r.types.2", "r.types.3"],
    problemIds: [],
  },
  {
    id: "l1.3",
    moduleId: "m1",
    title: "Truthiness",
    goal: "Know all eight falsy values, and stop losing legitimate zeroes to ||.",
    atomId: "teach.truthiness",
    repIds: ["r.truth.1", "r.truth.2", "r.truth.3"],
    problemIds: [],
  },
  {
    id: "l1.4",
    moduleId: "m1",
    title: "Equality",
    goal: "Compare values correctly, including NaN and two arrays that look alike.",
    atomId: "teach.equality",
    repIds: ["r.eq.1", "r.eq.2", "r.eq.3"],
    problemIds: [],
  },
  {
    id: "l1.5",
    moduleId: "m1",
    title: "Reference vs value",
    goal: "Copy things properly, and stop accidentally editing your caller's data.",
    atomId: "atom.reference",
    repIds: ["r.ref.1", "r.ref.2", "r.ref.3"],
    problemIds: [],
  },
];

import type { Atom, Lesson, Problem } from "../../types";
import { rep, stub } from "../rep";

export const M3_ATOMS: Atom[] = [
  {
    id: "teach.functions",
    title: "Declaring and calling",
    teaches: ["js.functions.basics"],
    requires: [],
    readingSeconds: 60,
    recall: "What does a function return if you never write `return`?",
    body: `A function is a named block you can run later, with different inputs each time.

\`\`\`js
function area(width, height) {
  return width * height;
}

area(3, 4);  // 12
\`\`\`

\`width\` and \`height\` are **parameters** — names for whatever gets passed in. \`3\` and \`4\` are the **arguments** — the actual values. The names only exist inside the function.

## return ends it

\`return\` hands a value back *and* stops the function immediately. Anything after it never runs.

\`\`\`js
function check(n) {
  if (n < 0) return "negative";
  return "positive";      // only reached when n >= 0
}
\`\`\`

## The catch

A function with no \`return\` gives you \`undefined\`.

\`\`\`js
function add(a, b) {
  a + b;      // computed, then thrown away
}
add(1, 2);    // undefined
\`\`\`

This is the most common bug for people coming from languages where the last expression is the result. JavaScript needs the word.

The same trap hides inside callbacks later — a \`map\` whose function forgets to return gives you an array of \`undefined\`. Same bug, harder to see.`,
  },
  {
    id: "teach.params",
    title: "Parameters, defaults, rest",
    teaches: ["js.functions.params"],
    requires: ["js.functions.basics"],
    readingSeconds: 70,
    recall: "What's the difference between `...` in a parameter list and `...` in a call?",
    body: `Missing arguments are \`undefined\`, not an error.

\`\`\`js
function greet(name) { return "Hi " + name; }
greet();   // "Hi undefined"
\`\`\`

Give a default to handle that:

\`\`\`js
function greet(name = "friend") { return "Hi " + name; }
greet();            // "Hi friend"
greet(undefined);   // "Hi friend"
greet(null);        // "Hi null"
\`\`\`

Defaults fire on \`undefined\` only. A \`null\` you passed on purpose gets through, which is usually what you want.

## Rest collects the extras

\`\`\`js
function sum(...nums) {
  let total = 0;
  for (const n of nums) total += n;
  return total;
}
sum(1, 2, 3);   // 6
\`\`\`

\`...nums\` gathers every remaining argument into a real array. It has to be last.

## Spread is the mirror image

Same three dots, opposite direction.

\`\`\`js
const values = [1, 2, 3];
sum(...values);   // spreads the array back out into arguments
\`\`\`

**In a parameter list, \`...\` collects. In a call, \`...\` spreads.** One symbol, two jobs, and which one you get depends entirely on where you wrote it.

## The catch

Defaults are evaluated at call time, top to bottom, so a later default can use an earlier parameter:

\`\`\`js
function box(width, height = width) { }
box(5);   // height is 5
\`\`\``,
  },
  {
    id: "teach.arrow",
    title: "Arrow functions",
    teaches: ["js.functions.arrow"],
    requires: ["js.functions.basics"],
    readingSeconds: 65,
    recall: "How do you return an object literal from a one-line arrow?",
    body: `A shorter way to write a function.

\`\`\`js
function double(n) { return n * 2; }
const double = (n) => n * 2;
\`\`\`

Both do the same thing. The arrow version drops \`function\`, drops the braces, and drops \`return\`.

## Two forms

**No braces** — the expression is returned automatically.

\`\`\`js
const double = n => n * 2;
\`\`\`

**With braces** — it's a normal body, so you need \`return\`.

\`\`\`js
const double = n => {
  return n * 2;
};
\`\`\`

Forgetting \`return\` after adding braces is a rite of passage. The function still runs; it just hands back \`undefined\`.

## The catch

Returning an object needs parentheses.

\`\`\`js
const point = (x, y) => { x, y };     // undefined
const point = (x, y) => ({ x, y });   // { x: 1, y: 2 }
\`\`\`

The first \`{\` is read as the start of a function body, not an object. Wrapping in \`()\` forces JavaScript to read it as a value.

## Where you'll actually use them

Almost always as an argument to something else:

\`\`\`js
[1, 2, 3].map(n => n * 2);
\`\`\`

That's the whole reason arrows exist — passing a small function somewhere shouldn't cost you three extra words. Arrows also treat \`this\` differently, which matters later and doesn't matter yet.`,
  },
  {
    id: "teach.as-values",
    title: "Functions as values",
    teaches: ["js.functions.as-values"],
    requires: ["js.functions.basics"],
    readingSeconds: 70,
    recall: "What's the difference between passing `fn` and passing `fn()`?",
    body: `A function is a value. You can store it, pass it, and return it, the same as a number.

\`\`\`js
const double = n => n * 2;
const alsoDouble = double;

alsoDouble(4);   // 8
\`\`\`

No copy was made. Both names point at one function.

## Passing one in

\`\`\`js
function applyTwice(fn, value) {
  return fn(fn(value));
}

applyTwice(double, 3);   // 12
\`\`\`

\`applyTwice\` has no idea what \`fn\` does. It just calls it. That's the entire idea behind \`map\`, \`filter\`, \`sort\`, and every event handler you'll ever write.

## The catch

The parentheses are the difference between the function and its result.

\`\`\`js
setTimeout(sayHi, 1000);     // passes the function — runs in 1 second
setTimeout(sayHi(), 1000);   // calls it NOW, passes what it returned
\`\`\`

\`sayHi\` is the recipe. \`sayHi()\` is the meal. When something asks you for a callback, it wants the recipe.

You'll spot this bug in the wild as "why did my handler fire immediately?"

## Storing them in an object

\`\`\`js
const operations = {
  add: (a, b) => a + b,
  sub: (a, b) => a - b,
};

operations["add"](2, 3);   // 5
\`\`\`

This is a lookup table of behaviour, and it replaces a lot of \`if\`/\`else if\` chains.`,
  },
  {
    id: "teach.pure",
    title: "Pure functions",
    teaches: ["js.functions.pure"],
    requires: ["js.values.reference"],
    readingSeconds: 65,
    recall: "Your function takes an array and returns a sorted one. What must you do first?",
    body: `A pure function does two things and nothing else: it looks at its inputs, and it returns a value.

It doesn't edit its arguments. It doesn't touch anything outside itself.

\`\`\`js
// impure — edits the caller's array
function addItem(list, item) {
  list.push(item);
  return list;
}

// pure — builds a new one
function addItem(list, item) {
  return [...list, item];
}
\`\`\`

Both "work". Only one is safe to call without reading its source first.

## Why it matters more than it sounds

\`\`\`js
const original = [3, 1, 2];
const sorted = sortItems(original);
\`\`\`

If \`sortItems\` is pure, \`original\` is still \`[3, 1, 2]\` and you can reason about the next line. If it isn't, something on the far side of your program just changed and nothing said so.

Impure functions are how a bug appears three files away from its cause.

## The catch

\`sort\` and \`reverse\` mutate. So a "pure" sort has to copy first:

\`\`\`js
const sortItems = list => [...list].sort((a, b) => a - b);
\`\`\`

Miss the spread and you've written an impure function that looks pure — the most expensive kind, because the name lies.

**The rule that saves you: if you didn't create it, don't change it.**`,
  },
];

export const M3_REPS: Problem[] = [
  rep({
    id: "r.fn.1",
    lesson: "l3.1",
    teaches: ["js.functions.basics"],
    title: "Return something",
    prompt: 'Return a greeting: `"Hello, Ada!"` for the name `"Ada"`.',
    exportName: "greet",
    starter: stub("greet", "name"),
    cases: [
      { args: '"Ada"', is: '"Hello, Ada!"' },
      { args: '"Grace"', is: '"Hello, Grace!"' },
      { args: '""', is: '"Hello, !"' },
    ],
    hint:
      'Use a template literal with backticks and `${name}` inside it, or plain `+` concatenation.',
    solution: "function greet(name) {\n  return `Hello, ${name}!`;\n}",
  }),
  rep({
    id: "r.fn.2",
    lesson: "l3.1",
    teaches: ["js.functions.basics", "js.flow.guards"],
    title: "Return stops the function",
    prompt:
      'Return `"even"` or `"odd"`. Use two returns and no `else`.',
    exportName: "parity",
    starter: stub("parity", "n"),
    cases: [
      { args: "4", is: '"even"' },
      { args: "7", is: '"odd"' },
      { args: "0", is: '"even"' },
      { args: "-3", is: '"odd"' },
    ],
    hint:
      "`n % 2 === 0` is the test. Negative numbers: `-3 % 2` is `-1`, so compare against `0`, not `1`.",
    solution:
      'function parity(n) {\n  if (n % 2 === 0) return "even";\n  return "odd";\n}',
  }),
  rep({
    id: "r.fn.3",
    lesson: "l3.1",
    teaches: ["js.functions.basics"],
    title: "Call your own function",
    prompt:
      "Return the area of a rectangle **and** of a square with side `s`, as `[rect, square]`. Write one helper and call it twice.",
    exportName: "areas",
    starter: stub("areas", "w, h, s"),
    cases: [
      { args: "3, 4, 2", is: "[12, 4]" },
      { args: "1, 1, 5", is: "[1, 25]" },
    ],
    hint:
      "Define `function area(a, b) { return a * b; }` inside, then call it with `(w, h)` and `(s, s)`.",
    solution:
      "function areas(w, h, s) {\n  function area(a, b) {\n    return a * b;\n  }\n  return [area(w, h), area(s, s)];\n}",
  }),

  rep({
    id: "r.params.1",
    lesson: "l3.2",
    teaches: ["js.functions.params"],
    title: "Default value",
    prompt:
      'Greet by name, falling back to `"friend"` when no name is given.',
    exportName: "greet",
    starter: stub("greet", "name"),
    cases: [
      { args: '"Ada"', is: '"Hi Ada"' },
      { args: "", is: '"Hi friend"' },
      { args: "undefined", is: '"Hi friend"' },
    ],
    hint: 'Put it in the parameter list: `function greet(name = "friend")`.',
    solution: 'function greet(name = "friend") {\n  return `Hi ${name}`;\n}',
  }),
  rep({
    id: "r.params.2",
    lesson: "l3.2",
    teaches: ["js.functions.params"],
    title: "Rest parameters",
    prompt: "Add up however many numbers you're given. No arguments gives `0`.",
    exportName: "sum",
    starter: stub("sum", "...nums"),
    cases: [
      { args: "1, 2, 3", is: "6" },
      { args: "5", is: "5" },
      { args: "", is: "0" },
      { args: "1, 2, 3, 4, 5", is: "15" },
    ],
    hint: "`...nums` is already a real array — loop it like any other.",
    solution:
      "function sum(...nums) {\n  let total = 0;\n  for (const n of nums) total += n;\n  return total;\n}",
  }),
  rep({
    id: "r.params.3",
    lesson: "l3.2",
    teaches: ["js.functions.params"],
    title: "Fixed first, rest after",
    prompt:
      "Join the remaining arguments into one string using `sep` between them. Don't use `Array.prototype.join`.",
    exportName: "joinWith",
    starter: stub("joinWith", "sep, ...parts"),
    cases: [
      { args: '"-", "a", "b", "c"', is: '"a-b-c"' },
      { args: '", ", "one"', is: '"one"' },
      { args: '"-"', is: '""' },
    ],
    hint:
      "Build up a string. Add the separator before every part except the first.",
    solution:
      'function joinWith(sep, ...parts) {\n  let out = "";\n  for (let i = 0; i < parts.length; i++) {\n    if (i > 0) out += sep;\n    out += parts[i];\n  }\n  return out;\n}',
  }),

  rep({
    id: "r.arrow.1",
    lesson: "l3.3",
    teaches: ["js.functions.arrow"],
    title: "One-line arrow",
    prompt:
      "Assign an arrow function to `square` that returns `n` squared. No braces, no `return`.",
    exportName: "square",
    starter: "const square = ",
    cases: [
      { args: "3", is: "9" },
      { args: "-2", is: "4" },
      { args: "0", is: "0" },
    ],
    hint: "`const square = n => n * n;`",
    solution: "const square = n => n * n;",
  }),
  rep({
    id: "r.arrow.2",
    lesson: "l3.3",
    teaches: ["js.functions.arrow"],
    title: "Return an object",
    prompt:
      "Write an arrow that returns `{ x, y }` from its two arguments. One line.",
    exportName: "point",
    starter: "const point = ",
    cases: [
      { args: "1, 2", is: "{ x: 1, y: 2 }" },
      { args: "0, -3", is: "{ x: 0, y: -3 }" },
    ],
    hint:
      "Wrap the object in parentheses, or JavaScript reads the `{` as a function body.",
    solution: "const point = (x, y) => ({ x, y });",
  }),
  rep({
    id: "r.arrow.3",
    lesson: "l3.3",
    teaches: ["js.functions.arrow", "js.flow.conditionals"],
    title: "Arrow with a body",
    prompt:
      'Write an arrow `describe` returning `"big"` when `n > 100`, otherwise `"small"`. Use braces and an explicit `return`.',
    exportName: "describe",
    starter: "const describe = ",
    cases: [
      { args: "500", is: '"big"' },
      { args: "100", is: '"small"' },
      { args: "-1", is: '"small"' },
    ],
    hint: "Braces turn off the automatic return, so you have to write it.",
    solution:
      'const describe = n => {\n  if (n > 100) return "big";\n  return "small";\n};',
  }),

  rep({
    id: "r.val.1",
    lesson: "l3.4",
    teaches: ["js.functions.as-values"],
    title: "Take a function",
    prompt: "Call `fn` on `value` twice, feeding the first result into the second.",
    exportName: "applyTwice",
    starter: stub("applyTwice", "fn, value"),
    cases: [
      { args: "n => n * 2, 3", is: "12" },
      { args: "n => n + 1, 0", is: "2" },
      { args: 's => s + "!", "hi"', is: '"hi!!"' },
    ],
    hint: "`return fn(fn(value));`",
    solution: "function applyTwice(fn, value) {\n  return fn(fn(value));\n}",
  }),
  rep({
    id: "r.val.2",
    lesson: "l3.4",
    teaches: ["js.functions.as-values"],
    title: "Return a function",
    prompt:
      'Return the matching operation for `"add"`, `"sub"`, or `"mul"`. Return `null` for anything else.',
    exportName: "getOperation",
    starter: stub("getOperation", "name"),
    tests: [
      { name: "add", code: `expect(fn("add")(2, 3)).toBe(5);` },
      { name: "sub", code: `expect(fn("sub")(9, 4)).toBe(5);` },
      { name: "mul", code: `expect(fn("mul")(3, 4)).toBe(12);` },
      { name: "unknown gives null", code: `expect(fn("nope")).toBe(null);` },
    ],
    hint:
      "An object mapping names to arrow functions, then look it up. `?? null` handles the miss.",
    solution:
      "function getOperation(name) {\n  const operations = {\n    add: (a, b) => a + b,\n    sub: (a, b) => a - b,\n    mul: (a, b) => a * b,\n  };\n  return operations[name] ?? null;\n}",
  }),
  rep({
    id: "r.val.3",
    lesson: "l3.4",
    teaches: ["js.functions.as-values"],
    title: "Run them all",
    prompt: "Call every function in the array on `value`, and return the results.",
    exportName: "runAll",
    starter: stub("runAll", "fns, value"),
    cases: [
      { args: "[n => n + 1, n => n * 2], 5", is: "[6, 10]" },
      { args: "[], 5", is: "[]" },
    ],
    hint: "Loop the array. Each item is a function, so call it: `fn(value)`.",
    solution:
      "function runAll(fns, value) {\n  const out = [];\n  for (const fn of fns) {\n    out.push(fn(value));\n  }\n  return out;\n}",
  }),

  rep({
    id: "r.pure.1",
    lesson: "l3.5",
    teaches: ["js.functions.pure"],
    title: "Add without mutating",
    prompt: "Return a new array with `item` on the end. Leave the original alone.",
    exportName: "appended",
    starter: stub("appended", "list, item"),
    tests: [
      {
        name: "returns the longer array",
        code: `expect(fn([1, 2], 3)).toEqual([1, 2, 3]);`,
      },
      {
        name: "original is untouched",
        code: `const list = [1, 2];
fn(list, 3);
expect(list).toEqual([1, 2]);`,
      },
      { name: "works on empty", code: `expect(fn([], 1)).toEqual([1]);` },
    ],
    hint: "`[...list, item]` builds a new array in one expression.",
    solution: "function appended(list, item) {\n  return [...list, item];\n}",
    mistakes: [
      {
        match: "push",
        hint: "`push` edits the caller's array. Build a new one instead.",
      },
    ],
  }),
  rep({
    id: "r.pure.2",
    lesson: "l3.5",
    teaches: ["js.functions.pure"],
    title: "Add to the front",
    prompt:
      "Return a new array with `item` at the **start**. Leave the original alone.",
    exportName: "prepended",
    starter: stub("prepended", "list, item"),
    tests: [
      { name: "puts it first", code: `expect(fn([2, 3], 1)).toEqual([1, 2, 3]);` },
      { name: "works on empty", code: `expect(fn([], 1)).toEqual([1]);` },
      {
        name: "original is untouched",
        code: `const list = [2, 3];
fn(list, 1);
expect(list).toEqual([2, 3]);`,
      },
    ],
    hint:
      "Same idea as the last one, other way round: `[item, ...list]`. The spread pours the old items in after the new one.",
    solution: "function prepended(list, item) {\n  return [item, ...list];\n}",
    mistakes: [
      {
        match: "unshift",
        hint: "`unshift` edits the caller's array. Build a new one with spread instead.",
      },
    ],
  }),
  rep({
    id: "r.pure.3",
    lesson: "l3.5",
    teaches: ["js.functions.pure", "js.values.reference"],
    title: "Join two without touching either",
    prompt:
      "Return one array holding all of `a` followed by all of `b`. Neither input may change.",
    exportName: "combined",
    starter: stub("combined", "a, b"),
    tests: [
      { name: "joins them", code: `expect(fn([1, 2], [3])).toEqual([1, 2, 3]);` },
      { name: "handles empties", code: `expect(fn([], [])).toEqual([]);` },
      {
        name: "neither input changes",
        code: `const a = [1, 2];
const b = [3];
fn(a, b);
expect(a).toEqual([1, 2]);
expect(b).toEqual([3]);`,
      },
    ],
    hint: "You can spread more than one array into the same new one: `[...a, ...b]`.",
    solution: "function combined(a, b) {\n  return [...a, ...b];\n}",
    mistakes: [
      {
        match: "push",
        hint: "`push` changes whichever array you call it on. Spread both into a brand new array instead.",
      },
    ],
  }),
];

export const M3_LESSONS: Lesson[] = [
  {
    id: "l3.1",
    moduleId: "m3",
    title: "Declaring and calling",
    goal: "Write functions that take input and hand a value back.",
    atomId: "teach.functions",
    repIds: ["r.fn.1", "r.fn.2", "r.fn.3"],
    problemIds: [],
  },
  {
    id: "l3.2",
    moduleId: "m3",
    title: "Parameters, defaults, rest",
    goal: "Handle missing arguments and any number of arguments.",
    atomId: "teach.params",
    repIds: ["r.params.1", "r.params.2", "r.params.3"],
    problemIds: [],
  },
  {
    id: "l3.3",
    moduleId: "m3",
    title: "Arrow functions",
    goal: "Write the short form without falling into the object-literal trap.",
    atomId: "teach.arrow",
    repIds: ["r.arrow.1", "r.arrow.2", "r.arrow.3"],
    problemIds: [],
  },
  {
    id: "l3.4",
    moduleId: "m3",
    title: "Functions as values",
    goal: "Pass functions around — the idea every array method is built on.",
    atomId: "teach.as-values",
    repIds: ["r.val.1", "r.val.2", "r.val.3"],
    problemIds: [],
  },
  {
    id: "l3.5",
    moduleId: "m3",
    title: "Pure functions",
    goal: "Stop editing your caller's data by accident.",
    atomId: "teach.pure",
    repIds: ["r.pure.1", "r.pure.2", "r.pure.3"],
    problemIds: [],
  },
];

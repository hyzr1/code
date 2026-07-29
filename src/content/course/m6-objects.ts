import type { Atom, Lesson, Problem } from "../../types";
import { rep, stub } from "../rep";

/**
 * M6 — Objects.
 *
 * The largest gap in the course as built. Every problem past this point takes
 * or returns an object, and until now they were only introduced in passing in
 * Module 0. Six lessons, ending on the pattern that does most of the real work
 * in interviews: an object used as a lookup table.
 */
export const M6_ATOMS: Atom[] = [
  {
    id: "teach.obj-access",
    title: "Reading and writing properties",
    teaches: ["js.object.access"],
    requires: ["js.intro.collections"],
    readingSeconds: 175,
    recall:
      "When must you use `user[key]` instead of `user.key`? Give the exact situation.",
    body: `An object is a bag of named values. The names are called **keys**, the things they point at are **values**, and together each pair is a **property**.

\`\`\`js
const user = { name: "Ada", age: 36 };
\`\`\`

## Two ways in

\`\`\`js
user.name;        // "Ada"
user["name"];     // "Ada"
\`\`\`

Identical result, different rules.

**Dot notation** needs the key written out, literally, as you type. It's shorter and it's what you'll use nearly always.

**Bracket notation** takes an *expression* — anything that produces a string. That's the whole difference, and it's the reason brackets exist:

\`\`\`js
const field = "name";

user.field;      // undefined — looked for a key literally called "field"
user[field];     // "Ada"     — worked out that field is "name", then looked
\`\`\`

\`user.field\` is not a mistake the language can catch. It's a valid question with the answer "no such key".

**Use brackets when the key is in a variable.** That's the rule, and it's the situation you'll hit constantly once you start writing functions that take a key as an argument.

Brackets are also the only option for keys that aren't valid names:

\`\`\`js
const scores = { "final score": 90 };
scores["final score"];   // 90 — a space, so dot notation can't express it
\`\`\`

## Missing keys are undefined, not an error

\`\`\`js
user.email;   // undefined
\`\`\`

No crash. Same as reading past the end of an array. The failure shows up later, somewhere else, in code that has nothing to do with this object.

But go one level deeper and it *does* crash:

\`\`\`js
user.address.city;   // TypeError: Cannot read properties of undefined
\`\`\`

\`user.address\` is \`undefined\`, and \`undefined\` has no properties at all. Reading \`.city\` on nothing is the single most common runtime error in JavaScript.

## Writing

\`\`\`js
user.age = 37;          // change an existing key
user.email = "a@b.c";   // create a new one
delete user.age;        // remove it entirely
\`\`\`

Same syntax for changing and creating — if the key exists it's replaced, if it doesn't it's added. There's no declaration step.

## The catch

Keys are always strings.

\`\`\`js
const scores = {};
scores[1] = "a";
scores["1"] = "b";
scores[1];        // "b"  — one key, not two
\`\`\`

The number \`1\` was quietly converted to the string \`"1"\`. Objects have exactly one key here, and the second write overwrote the first.

That's fine until you use numbers as ids and expect them to stay numbers. When keys aren't strings, you want a \`Map\` — which is Module 8.`,
  },
  {
    id: "teach.obj-iteration",
    title: "Walking an object",
    teaches: ["js.object.iteration"],
    requires: ["js.object.access", "js.array.iteration"],
    readingSeconds: 170,
    recall:
      "You need both the key and the value in a loop. Which function, and what shape does it return?",
    body: `Objects aren't arrays, so \`map\` and \`filter\` don't exist on them. Three functions turn an object into an array first, and then everything you already know works.

\`\`\`js
const scores = { ada: 90, grace: 75 };

Object.keys(scores);     // ["ada", "grace"]
Object.values(scores);   // [90, 75]
Object.entries(scores);  // [["ada", 90], ["grace", 75]]
\`\`\`

\`entries\` is the one to reach for by default, because it gives you both halves.

## Looping with both

\`\`\`js
for (const [name, score] of Object.entries(scores)) {
  console.log(name, score);
}
\`\`\`

The \`[name, score]\` in the loop head is destructuring — each entry is a two-item array, and you're naming both slots as you take them.

## Back the other way

\`\`\`js
Object.fromEntries([["ada", 90]]);   // { ada: 90 }
\`\`\`

That completes the round trip, and it's what makes objects transformable at all:

\`\`\`js
const doubled = Object.fromEntries(
  Object.entries(scores).map(([name, score]) => [name, score * 2])
);
// { ada: 180, grace: 150 }
\`\`\`

Object → array → transform → object. There is no \`Object.map\`, and this is why you don't need one.

## Key order is not insertion order

This surprises everyone the first time.

\`\`\`js
Object.keys({ b: 1, 2: 1, a: 1 });   // ["2", "b", "a"]
\`\`\`

Integer-like keys come first, in ascending numeric order. *Then* string keys, in the order they were added.

So an object keyed by numeric id silently reorders your data, and an object keyed by name doesn't. If order matters, use an array — or a \`Map\`, which keeps insertion order for every key type.

## The catch

\`Object.keys\` only returns the object's **own** keys, which is what you want. \`for...in\` walks inherited ones too:

\`\`\`js
for (const key in scores) { }   // also sees anything on the prototype
\`\`\`

In a clean program those are the same. In a program using an old library that added something to \`Object.prototype\`, they aren't, and the bug is baffling.

**Use \`Object.entries\`. Don't use \`for...in\` on objects.**`,
  },
  {
    id: "teach.obj-destructuring",
    title: "Destructuring",
    teaches: ["js.object.destructuring"],
    requires: ["js.object.access"],
    readingSeconds: 180,
    recall:
      "Write a parameter list that pulls `name` and `age` out of an options object, with `age` defaulting to 0.",
    body: `Destructuring pulls values out of an object into variables, by name.

\`\`\`js
const user = { name: "Ada", age: 36 };

const { name, age } = user;
name;   // "Ada"
\`\`\`

Read it right to left: take \`user\`, find the keys called \`name\` and \`age\`, make variables with those names.

The long version is three lines and repeats \`user\` twice:

\`\`\`js
const name = user.name;
const age = user.age;
\`\`\`

## Renaming

\`\`\`js
const { name: fullName } = user;
fullName;   // "Ada"
name;       // ReferenceError — you renamed it
\`\`\`

Read \`name: fullName\` as "take the key \`name\`, call it \`fullName\`". The colon is not a type annotation, which is the usual first guess.

## Defaults

\`\`\`js
const { age = 0, email = "none" } = user;
age;     // 36 — present, so the default is ignored
email;   // "none" — missing, so the default fires
\`\`\`

Defaults fire on \`undefined\` only, exactly like function parameters.

## In a parameter list

This is where it earns its keep:

\`\`\`js
function greet({ name, greeting = "Hello" }) {
  return \`\${greeting}, \${name}\`;
}

greet({ name: "Ada" });   // "Hello, Ada"
\`\`\`

The function declares what it needs from the object it's handed. A caller reading the signature can see the shape without opening the body.

## Nested

\`\`\`js
const order = { id: 1, customer: { name: "Ada" } };
const { customer: { name } } = order;
name;   // "Ada"
\`\`\`

Note what you get: \`name\`, not \`customer\`. Destructuring a nested key gives you the inner value and nothing else — if you want both, ask for both.

## The catch

Destructuring a missing object throws.

\`\`\`js
function greet({ name }) { }
greet();   // TypeError: Cannot destructure property 'name' of undefined
\`\`\`

There's no object to look inside. Guard it with a default on the whole parameter:

\`\`\`js
function greet({ name } = {}) { }
greet();   // fine — name is undefined
\`\`\`

That \`= {}\` is small and easy to forget, and it's the difference between a helpful \`undefined\` and a crash.`,
  },
  {
    id: "teach.obj-spread",
    title: "Spread and rest on objects",
    teaches: ["js.object.spread"],
    requires: ["js.object.destructuring", "js.values.reference"],
    readingSeconds: 165,
    recall:
      "How do you copy an object but change one key? And what does that copy *not* protect?",
    body: `Three dots again, doing the same two jobs they do for arrays.

## Spread copies properties out

\`\`\`js
const user = { name: "Ada", age: 36 };
const copy = { ...user };
\`\`\`

A new object, with the same properties. \`copy\` is not \`user\` — changing one doesn't change the other.

## Override by writing after

\`\`\`js
const older = { ...user, age: 40 };
// { name: "Ada", age: 40 }
\`\`\`

**Later keys win.** The spread lays everything down, then \`age: 40\` overwrites. Reverse the order and you get the opposite:

\`\`\`js
const stuck = { age: 40, ...user };
// { age: 36 } — the spread overwrote your 40
\`\`\`

This is the single most common way to update state without mutating, and the ordering bug is the single most common mistake in doing it.

## Merging

\`\`\`js
const defaults = { theme: "light", size: 14 };
const settings = { ...defaults, ...saved };
\`\`\`

Everything from defaults, then anything saved overrides it. Two lines of config logic in one expression.

## Rest collects the remainder

\`\`\`js
const { name, ...rest } = user;
name;   // "Ada"
rest;   // { age: 36 }
\`\`\`

Take the keys you named, sweep the rest into one object. It's how you remove a key without \`delete\`:

\`\`\`js
const { password, ...safe } = account;
\`\`\`

\`safe\` is \`account\` minus the password, and \`account\` is untouched.

## The catch

Spread copies **one level**. You've met this before and it will keep costing you:

\`\`\`js
const original = { tags: ["x"] };
const copy = { ...original };

copy.tags.push("y");
original.tags;   // ["x", "y"] — still shared
\`\`\`

\`copy\` is genuinely a new object. But \`copy.tags\` is a copy of the *reference*, so both point at one array.

For a real deep copy: \`structuredClone(original)\`.

**A spread protects the top level and nothing below it.** That sentence is worth memorising, because the bug it prevents is invisible in every small test you'll write.`,
  },
  {
    id: "teach.obj-optional",
    title: "Reaching into nested data safely",
    teaches: ["js.object.optional"],
    requires: ["js.object.access", "js.values.truthiness"],
    readingSeconds: 165,
    recall:
      "What does `a?.b.c` do if `a` exists but `b` is undefined? Is that what you want?",
    body: `Real data is nested and incomplete. This crashes:

\`\`\`js
user.address.city;   // TypeError if address is missing
\`\`\`

Optional chaining stops it:

\`\`\`js
user.address?.city;   // undefined, no crash
\`\`\`

Read \`?.\` as **"if the thing on my left is null or undefined, stop and give undefined; otherwise carry on."**

## It short-circuits the rest of the chain

\`\`\`js
user.address?.city.toUpperCase();
\`\`\`

If \`address\` is missing, the whole expression is \`undefined\` — \`.city\` and \`.toUpperCase()\` are never attempted. The \`?.\` protects everything after it, not just the next step.

## Three places it works

\`\`\`js
user.address?.city        // property
user.getName?.()          // call, only if the function exists
users?.[0]                // index
\`\`\`

The call form is genuinely useful for optional callbacks: \`onDone?.()\` runs the handler if one was passed and does nothing if not.

## Pair it with ??

\`\`\`js
const city = user.address?.city ?? "unknown";
\`\`\`

\`?.\` handles the missing middle, \`??\` handles the missing end. Together they're the standard way to read one value out of untrusted shape.

## The catch

\`?.\` only guards the link it's attached to.

\`\`\`js
a?.b.c;   // still throws if a exists and b is undefined
\`\`\`

\`a?.\` checked \`a\`. Then \`.b\` returned \`undefined\`, and \`.c\` on \`undefined\` throws exactly as before. Every uncertain link needs its own mark:

\`\`\`js
a?.b?.c;
\`\`\`

## Don't reach for it everywhere

\`?.\` on something that should always exist hides a real bug. If \`user\` is missing at the top of a function, you want the crash — that's a broken caller, and silencing it means finding out much later and much further away.

**Use \`?.\` where absence is legitimate. Use a guard clause where it isn't.**`,
  },
  {
    id: "teach.obj-lookup",
    title: "Objects as lookup tables",
    teaches: ["js.object.lookup"],
    requires: ["js.object.access", "js.flow.conditionals"],
    readingSeconds: 175,
    recall:
      "You have a six-branch if/else mapping strings to values. What replaces it, and what has to be handled that the if/else handled for free?",
    body: `This is the pattern objects earn their place for.

\`\`\`js
function label(status) {
  if (status === "new") return "New";
  if (status === "open") return "In progress";
  if (status === "done") return "Complete";
  return "Unknown";
}
\`\`\`

Four branches to say four things. Here it is as data:

\`\`\`js
const LABELS = {
  new: "New",
  open: "In progress",
  done: "Complete",
};

function label(status) {
  return LABELS[status] ?? "Unknown";   // one lookup, one fallback
}
\`\`\`

## Why this is better than shorter

**It's constant time.** An if/else chain checks each branch in turn; a lookup goes straight there. With four entries nobody cares. With four hundred it's the difference between a scan and a jump.

**The data is separable.** \`LABELS\` can move to a config file, be sent from a server, or be tested on its own. Logic buried in branches can't.

**Adding a case is one line, in one place**, and it can't accidentally be unreachable.

## The fallback isn't optional

\`\`\`js
LABELS[status] ?? "Unknown"
\`\`\`

An if/else chain has a natural bottom — the last \`return\`. A lookup has no such thing, so a missing key silently gives \`undefined\` and passes it downstream. **Every lookup needs a default.**

## Storing behaviour, not just values

Values in the table can be functions:

\`\`\`js
const OPERATIONS = {
  add: (a, b) => a + b,
  sub: (a, b) => a - b,
};

const run = OPERATIONS[name] ?? (() => 0);
run(2, 3);
\`\`\`

That's a dispatch table, and it replaces the sprawling switch statement that would otherwise grow every time a case is added.

## The catch

Objects inherit keys you never set.

\`\`\`js
const LABELS = {};
LABELS["toString"];      // a function, not undefined
LABELS["constructor"];   // a function too
\`\`\`

If the key comes from user input — a search box, a URL, a form — a lookup can return an inherited method instead of your data, and \`?? "Unknown"\` won't catch it because a function isn't nullish.

Two fixes:

\`\`\`js
const LABELS = Object.create(null);      // an object with nothing inherited
Object.hasOwn(LABELS, key)               // ask before you read
\`\`\`

For a table of your own keys, plain \`{}\` is fine. **The moment the key comes from outside, it isn't.**`,
  },
];

export const M6_REPS: Problem[] = [
  rep({
    id: "r.oacc.1",
    lesson: "l6.1",
    teaches: ["js.object.access"],
    title: "Dot notation",
    prompt: "Return the user's `email`.",
    exportName: "emailOf",
    starter: stub("emailOf", "user"),
    cases: [
      { args: '{ name: "Ada", email: "a@b.c" }', is: '"a@b.c"' },
      { args: '{ email: "x@y.z" }', is: '"x@y.z"' },
      { args: '{ name: "Bo" }', is: "undefined" },
    ],
    hint: "`user.email` — and a missing key is `undefined`, not an error.",
    solution: "function emailOf(user) {\n  return user.email;\n}",
    seconds: 35,
  }),
  rep({
    id: "r.oacc.2",
    lesson: "l6.1",
    teaches: ["js.object.access"],
    title: "The key is in a variable",
    prompt:
      "Return the value stored under `key`.\n\n`user.key` will not work here — it looks for a key literally named `key`.",
    exportName: "valueAt",
    starter: stub("valueAt", "user, key"),
    cases: [
      { args: '{ name: "Ada", age: 36 }, "name"', is: '"Ada"' },
      { args: '{ name: "Ada", age: 36 }, "age"', is: "36" },
      { args: '{ a: 1 }, "missing"', is: "undefined" },
    ],
    hint: "Brackets take an expression: `user[key]`.",
    solution: "function valueAt(user, key) {\n  return user[key];\n}",
    mistakes: [
      {
        match: "user.key",
        hint: "That asks for a key literally spelled `key`. Use `user[key]` to look up what the variable holds.",
      },
    ],
    seconds: 45,
  }),
  rep({
    id: "r.oacc.3",
    lesson: "l6.1",
    teaches: ["js.object.access"],
    title: "Add and remove",
    prompt:
      "Set `active` to `true` on the user, remove `temp`, and return the object.",
    exportName: "tidy",
    starter: stub("tidy", "user"),
    cases: [
      { args: "{ name: \"Ada\", temp: 1 }", is: '{ name: "Ada", active: true }' },
      { args: "{ temp: 9 }", is: "{ active: true }" },
    ],
    hint: "Assignment creates the key if it's missing. `delete user.temp` removes one.",
    solution:
      "function tidy(user) {\n  user.active = true;\n  delete user.temp;\n  return user;\n}",
    seconds: 45,
  }),

  rep({
    id: "r.oiter.1",
    lesson: "l6.2",
    teaches: ["js.object.iteration"],
    title: "Just the keys",
    prompt: "Return the object's keys as an array.",
    exportName: "keysOf",
    starter: stub("keysOf", "obj"),
    cases: [
      { args: "{ a: 1, b: 2 }", is: '["a", "b"]' },
      { args: "{}", is: "[]" },
    ],
    hint: "`Object.keys(obj)`.",
    solution: "function keysOf(obj) {\n  return Object.keys(obj);\n}",
    seconds: 30,
  }),
  rep({
    id: "r.oiter.2",
    lesson: "l6.2",
    teaches: ["js.object.iteration", "js.array.reduce"],
    title: "Total the values",
    prompt: "Add up every value in the object. An empty object gives `0`.",
    exportName: "totalOf",
    starter: stub("totalOf", "obj"),
    cases: [
      { args: "{ a: 1, b: 2, c: 3 }", is: "6" },
      { args: "{}", is: "0" },
      { args: "{ only: 7 }", is: "7" },
    ],
    hint: "`Object.values(obj)` gives an array — then it's the reduce you already know.",
    solution:
      "function totalOf(obj) {\n  return Object.values(obj).reduce((sum, n) => sum + n, 0);\n}",
    seconds: 45,
  }),
  rep({
    id: "r.oiter.3",
    lesson: "l6.2",
    teaches: ["js.object.iteration"],
    title: "Transform every value",
    prompt:
      "Return a new object with the same keys and every value doubled.",
    exportName: "doubleValues",
    starter: stub("doubleValues", "obj"),
    cases: [
      { args: "{ a: 1, b: 2 }", is: "{ a: 2, b: 4 }" },
      { args: "{}", is: "{}" },
    ],
    hint:
      "Object → array → transform → object. `Object.entries`, then `map` each `[k, v]` to `[k, v * 2]`, then `Object.fromEntries`.",
    solution:
      "function doubleValues(obj) {\n  return Object.fromEntries(\n    Object.entries(obj).map(([key, value]) => [key, value * 2])\n  );\n}",
    seconds: 70,
  }),

  rep({
    id: "r.odest.1",
    lesson: "l6.3",
    teaches: ["js.object.destructuring"],
    title: "Pull two out",
    prompt:
      "Destructure `name` and `age` out of the user, then return `\"Ada is 36\"`.",
    exportName: "describe",
    starter: stub("describe", "user"),
    cases: [
      { args: '{ name: "Ada", age: 36 }', is: '"Ada is 36"' },
      { args: '{ name: "Bo", age: 1 }', is: '"Bo is 1"' },
    ],
    hint: "`const { name, age } = user;` then a template literal.",
    solution:
      "function describe(user) {\n  const { name, age } = user;\n  return `${name} is ${age}`;\n}",
    seconds: 50,
  }),
  rep({
    id: "r.odest.2",
    lesson: "l6.3",
    teaches: ["js.object.destructuring"],
    title: "Destructure in the parameter list",
    prompt:
      'Take an options object and return `"Hello, Ada"`. `greeting` defaults to `"Hello"`. Destructure in the parameter list, not the body.',
    exportName: "greet",
    starter: "function greet(",
    cases: [
      { args: '{ name: "Ada" }', is: '"Hello, Ada"' },
      { args: '{ name: "Bo", greeting: "Hi" }', is: '"Hi, Bo"' },
    ],
    hint: '`function greet({ name, greeting = "Hello" }) { ... }`',
    solution:
      'function greet({ name, greeting = "Hello" }) {\n  return `${greeting}, ${name}`;\n}',
    seconds: 60,
  }),
  rep({
    id: "r.odest.3",
    lesson: "l6.3",
    teaches: ["js.object.destructuring"],
    title: "Rename while unpacking",
    prompt:
      "The object uses `n` and `v`. Return them as `\"n=v\"` using readable local names.",
    exportName: "pair",
    starter: stub("pair", "item"),
    cases: [
      { args: '{ n: "size", v: 3 }', is: '"size=3"' },
      { args: '{ n: "a", v: "b" }', is: '"a=b"' },
    ],
    hint:
      "`const { n: name, v: value } = item;` — the colon renames, it isn't a type.",
    solution:
      "function pair(item) {\n  const { n: name, v: value } = item;\n  return `${name}=${value}`;\n}",
    seconds: 55,
  }),

  rep({
    id: "r.ospread.1",
    lesson: "l6.4",
    teaches: ["js.object.spread"],
    title: "Copy with one change",
    prompt:
      "Return a new object with `status` set to `\"done\"`. The original must be untouched.",
    exportName: "complete",
    starter: stub("complete", "task"),
    tests: [
      {
        name: "sets the status",
        code: `expect(fn({ id: 1, status: "open" })).toEqual({ id: 1, status: "done" });`,
      },
      {
        name: "original untouched",
        code: `const task = { id: 1, status: "open" };
fn(task);
expect(task.status).toBe("open");`,
      },
      {
        name: "adds the key when missing",
        code: `expect(fn({ id: 2 })).toEqual({ id: 2, status: "done" });`,
      },
    ],
    hint:
      'Spread first, override after: `{ ...task, status: "done" }`. The other order loses your change.',
    solution:
      'function complete(task) {\n  return { ...task, status: "done" };\n}',
    seconds: 55,
  }),
  rep({
    id: "r.ospread.2",
    lesson: "l6.4",
    teaches: ["js.object.spread"],
    title: "Merge over defaults",
    prompt:
      "Return the defaults with anything in `overrides` applied on top.",
    exportName: "settings",
    starter: stub("settings", "defaults, overrides"),
    cases: [
      { args: '{ a: 1, b: 2 }, { b: 9 }', is: "{ a: 1, b: 9 }" },
      { args: "{ a: 1 }, {}", is: "{ a: 1 }" },
      { args: "{}, { c: 3 }", is: "{ c: 3 }" },
    ],
    hint: "Later keys win, so spread defaults first: `{ ...defaults, ...overrides }`.",
    solution:
      "function settings(defaults, overrides) {\n  return { ...defaults, ...overrides };\n}",
    seconds: 45,
  }),
  rep({
    id: "r.ospread.3",
    lesson: "l6.4",
    teaches: ["js.object.spread"],
    title: "Remove a key without delete",
    prompt:
      "Return the account without its `password`, leaving the original alone.",
    exportName: "safe",
    starter: stub("safe", "account"),
    tests: [
      {
        name: "password is gone",
        code: `expect(fn({ id: 1, password: "x", name: "Ada" })).toEqual({ id: 1, name: "Ada" });`,
      },
      {
        name: "original untouched",
        code: `const account = { id: 1, password: "x" };
fn(account);
expect(account.password).toBe("x");`,
      },
    ],
    hint:
      "Rest in a destructure: `const { password, ...rest } = account;` then return `rest`.",
    solution:
      "function safe(account) {\n  const { password, ...rest } = account;\n  return rest;\n}",
    seconds: 55,
  }),

  rep({
    id: "r.oopt.1",
    lesson: "l6.5",
    teaches: ["js.object.optional"],
    title: "Reach through a missing middle",
    prompt:
      "Return `user.address.city`, or `undefined` when there's no address — without crashing.",
    exportName: "cityOf",
    starter: stub("cityOf", "user"),
    cases: [
      { args: '{ address: { city: "Bath" } }', is: '"Bath"' },
      { args: "{}", is: "undefined" },
      { args: "{ address: {} }", is: "undefined" },
    ],
    hint: "`user.address?.city`.",
    solution: "function cityOf(user) {\n  return user.address?.city;\n}",
    seconds: 45,
  }),
  rep({
    id: "r.oopt.2",
    lesson: "l6.5",
    teaches: ["js.object.optional", "js.values.truthiness"],
    title: "With a fallback",
    prompt:
      'Return the city, or `"unknown"` when it isn\'t there. An empty string is a real city name and must survive.',
    exportName: "cityOr",
    starter: stub("cityOr", "user"),
    cases: [
      { args: '{ address: { city: "Bath" } }', is: '"Bath"' },
      { args: "{}", is: '"unknown"' },
      { args: '{ address: { city: "" } }', is: '""' },
    ],
    hint: "`?.` for the missing middle, `??` for the missing end. `||` would eat the empty string.",
    solution:
      'function cityOr(user) {\n  return user.address?.city ?? "unknown";\n}',
    mistakes: [
      {
        match: "||",
        hint: "`||` replaces every falsy value, so a legitimate empty string becomes \"unknown\". Use `??`.",
      },
    ],
    seconds: 55,
  }),
  rep({
    id: "r.oopt.3",
    lesson: "l6.5",
    teaches: ["js.object.optional"],
    title: "Every uncertain link",
    prompt:
      "Return the company city from `user.job.company.city`. Any part of that chain may be missing.",
    exportName: "companyCity",
    starter: stub("companyCity", "user"),
    cases: [
      { args: '{ job: { company: { city: "Leeds" } } }', is: '"Leeds"' },
      { args: "{ job: {} }", is: "undefined" },
      { args: "{}", is: "undefined" },
    ],
    hint:
      "`?.` only guards the link it's on. Every uncertain step needs its own: `user.job?.company?.city`.",
    solution:
      "function companyCity(user) {\n  return user.job?.company?.city;\n}",
    seconds: 50,
  }),

  rep({
    id: "r.olook.1",
    lesson: "l6.6",
    teaches: ["js.object.lookup"],
    title: "Replace the if-chain",
    prompt:
      'Map `"new"`, `"open"` and `"done"` to `"New"`, `"In progress"` and `"Complete"`. Anything else gives `"Unknown"`. Use a lookup object, not `if`.',
    exportName: "label",
    starter: stub("label", "status"),
    cases: [
      { args: '"new"', is: '"New"' },
      { args: '"open"', is: '"In progress"' },
      { args: '"done"', is: '"Complete"' },
      { args: '"nope"', is: '"Unknown"' },
    ],
    hint:
      "Build the table, then `return LABELS[status] ?? \"Unknown\"`. A lookup has no natural bottom, so the fallback isn't optional.",
    solution:
      'function label(status) {\n  const LABELS = {\n    new: "New",\n    open: "In progress",\n    done: "Complete",\n  };\n  return LABELS[status] ?? "Unknown";\n}',
    seconds: 70,
  }),
  rep({
    id: "r.olook.2",
    lesson: "l6.6",
    teaches: ["js.object.lookup", "js.functions.as-values"],
    title: "A dispatch table",
    prompt:
      'Look up `"add"`, `"sub"` or `"mul"` and run it on `a` and `b`. Anything else returns `0`.',
    exportName: "calculate",
    starter: stub("calculate", "op, a, b"),
    cases: [
      { args: '"add", 2, 3', is: "5" },
      { args: '"sub", 9, 4', is: "5" },
      { args: '"mul", 3, 4', is: "12" },
      { args: '"nope", 1, 1', is: "0" },
    ],
    hint:
      "Values in the table can be functions. Look one up, fall back to `() => 0`, then call it.",
    solution:
      "function calculate(op, a, b) {\n  const OPERATIONS = {\n    add: (x, y) => x + y,\n    sub: (x, y) => x - y,\n    mul: (x, y) => x * y,\n  };\n  const run = OPERATIONS[op] ?? (() => 0);\n  return run(a, b);\n}",
    seconds: 80,
  }),
  rep({
    id: "r.olook.3",
    lesson: "l6.6",
    teaches: ["js.object.lookup"],
    title: "Keys from outside",
    prompt:
      'The key comes from user input. Return the stored value, or `"none"` if the table has no such key of its own.\n\nWatch the last case — `"toString"` is inherited by every plain object and is not nullish, so `??` will not save you.',
    exportName: "lookup",
    starter: stub("lookup", "table, key"),
    cases: [
      { args: '{ a: 1 }, "a"', is: "1" },
      { args: '{ a: 1 }, "b"', is: '"none"' },
      { args: '{ a: 1 }, "toString"', is: '"none"' },
      { args: '{ a: 1 }, "constructor"', is: '"none"' },
    ],
    hint:
      "Ask before you read: `Object.hasOwn(table, key) ? table[key] : \"none\"`.",
    solution:
      'function lookup(table, key) {\n  return Object.hasOwn(table, key) ? table[key] : "none";\n}',
    seconds: 70,
  }),
];

export const M6_LESSONS: Lesson[] = [
  {
    id: "l6.1",
    moduleId: "m6",
    title: "Reading and writing properties",
    goal: "Get values in and out of an object, and know when dots won't do.",
    atomId: "teach.obj-access",
    repIds: ["r.oacc.1", "r.oacc.2", "r.oacc.3"],
    problemIds: [],
  },
  {
    id: "l6.2",
    moduleId: "m6",
    title: "Walking an object",
    goal: "Turn an object into an array so everything you know about arrays works on it.",
    atomId: "teach.obj-iteration",
    repIds: ["r.oiter.1", "r.oiter.2", "r.oiter.3"],
    problemIds: [],
  },
  {
    id: "l6.3",
    moduleId: "m6",
    title: "Destructuring",
    goal: "Unpack objects by name, in a body or in a parameter list.",
    atomId: "teach.obj-destructuring",
    repIds: ["r.odest.1", "r.odest.2", "r.odest.3"],
    problemIds: [],
  },
  {
    id: "l6.4",
    moduleId: "m6",
    title: "Spread and rest",
    goal: "Copy, merge and strip keys without ever mutating the original.",
    atomId: "teach.obj-spread",
    repIds: ["r.ospread.1", "r.ospread.2", "r.ospread.3"],
    problemIds: [],
  },
  {
    id: "l6.5",
    moduleId: "m6",
    title: "Nested data, safely",
    goal: "Read through missing middles without crashing, and know when not to.",
    atomId: "teach.obj-optional",
    repIds: ["r.oopt.1", "r.oopt.2", "r.oopt.3"],
    problemIds: [],
  },
  {
    id: "l6.6",
    moduleId: "m6",
    title: "Objects as lookup tables",
    goal: "Replace branching with data — the pattern objects earn their place for.",
    // p.group-by used to be listed here too, but it belongs to the reduce
    // lesson that unlocks it — a unit in two lessons is progress counted twice.
    atomId: "teach.obj-lookup",
    repIds: ["r.olook.1", "r.olook.2", "r.olook.3"],
    problemIds: [],
  },
];

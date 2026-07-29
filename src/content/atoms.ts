import type { Atom } from "../types";

/**
 * Lecture atoms. See CONTENT-STYLE.md — 250-450 words, one concept, one catch,
 * graduate depth at an 8th-grade reading level. Every sentence has to carry a
 * fact you could not have guessed from the sentence before it.
 */
export const ATOMS: Atom[] = [
  {
    id: "atom.closures",
    title: "Closures",
    teaches: ["js.functions.closures", "js.functions.private-state"],
    requires: ["js.functions.basics", "js.scope.block-scope"],
    readingSeconds: 95,
    recall:
      "Write `once(fn)`. It runs `fn` the first time and returns that same result on every call after.",
    body: `Every function remembers where it was born.

That's the whole idea. Everything else is a consequence.

\`\`\`js
function counter() {
  let n = 0;
  return () => ++n;
}

const next = counter();
next(); // 1
next(); // 2
\`\`\`

\`counter\` already finished. Its \`let n = 0\` ran once and returned long ago. But \`n\` is still alive, and \`next\` keeps changing it.

Local variables usually die when a function returns. These don't. The arrow function was created *inside* \`counter\`, so it holds a link back to \`counter\`'s variables. A link, not a copy.

That link is the closure.

## It's a link, not a copy

\`\`\`js
function counter() {
  let n = 0;
  return { next: () => ++n, peek: () => n };
}

const c = counter();
c.next(); // 1
c.peek(); // 1  ← the same n
\`\`\`

Both functions were born in the same call, so both point at the same \`n\`. Change it through one and you see it through the other.

Call \`counter()\` again and you get a fresh \`n\`. Every *call* creates a new set of variables. Functions born in different calls never share.

## The catch

\`\`\`js
const fns = [];
for (var i = 0; i < 3; i++) {
  fns.push(() => i);
}
fns.map(fn => fn()); // [3, 3, 3]
\`\`\`

You probably expected \`[0, 1, 2]\`.

\`var i\` belongs to the whole function, not to the loop. So there's one \`i\`, three functions, and all three link to it. By the time you call them the loop is over and \`i\` is 3.

Change \`var\` to \`let\` and you get \`[0, 1, 2]\`. \`let\` creates a new \`i\` each iteration, so each function links to its own.

## Why you care

Closures are how you get private state without a class. Nothing outside \`counter\` can reach \`n\` — there is no \`c.n\` to grab. The only way in is the functions you handed out.

That's the pattern under every module, every event handler that remembers something, and every \`useState\` in React.`,
  },

  {
    id: "atom.reduce",
    title: "reduce",
    teaches: ["js.array.reduce"],
    requires: ["js.array.iteration"],
    readingSeconds: 100,
    recall:
      "Write `countBy(items, fn)`. It returns an object mapping each `fn(item)` result to how many times it happened.",
    body: `\`reduce\` is a loop that carries one value.

\`\`\`js
[1, 2, 3].reduce((sum, n) => sum + n, 0); // 6
\`\`\`

Two arguments. The callback, and the value you start carrying.

The callback gets what you're carrying and the current item. Whatever it returns becomes what you carry into the next step.

\`\`\`
carry   item   returns
  0      1        1
  1      2        3
  3      3        6      ← the final carry is the result
\`\`\`

That's it. \`map\` and \`filter\` are both \`reduce\` wearing a costume.

## The carry doesn't have to be a number

This is the part people miss. Carry an object and you can build anything.

\`\`\`js
const words = ["ant", "bee", "ant"];

words.reduce((counts, word) => {
  counts[word] = (counts[word] ?? 0) + 1;
  return counts;
}, {});
// { ant: 2, bee: 1 }
\`\`\`

Grouping, counting, indexing by id, flattening — all the same shape. Start with an empty container, put things in it, return it.

## The catch

**Always pass the starting value.**

\`\`\`js
[].reduce((a, b) => a + b);    // TypeError: Reduce of empty array
[].reduce((a, b) => a + b, 0); // 0
\`\`\`

Skip the seed and \`reduce\` uses the first element as the starting carry. Empty array, no first element, no starting carry — it throws.

There's a quieter version of the same bug. Without a seed, your carry is whatever type the array holds. With \`{}\` as a seed, your carry is an object. Code that works on a 3-item array and crashes on an empty one is almost always this.

## The other catch

You have to \`return\` the carry.

\`\`\`js
words.reduce((counts, word) => {
  counts[word] = 1;  // no return
}, {});               // TypeError on the second item
\`\`\`

The callback returned \`undefined\`, so \`undefined\` is what gets carried. Arrow functions with braces need an explicit \`return\`. This is the single most common \`reduce\` bug and it looks completely fine.`,
  },

  {
    id: "atom.mutation",
    title: "Copies vs mutations",
    teaches: ["js.array.mutation"],
    requires: ["js.values.reference"],
    readingSeconds: 90,
    recall:
      "Which of these change the original array: `push`, `concat`, `splice`, `slice`, `sort`, `map`, `reverse`, `filter`?",
    body: `Half of JavaScript's array methods change the array. The other half hand you a new one.

Nothing in the names tells you which is which. You have to know.

\`\`\`js
const a = [1, 2, 3];

a.slice(1);   // [2, 3]    a is still [1, 2, 3]
a.splice(1);  // [2, 3]    a is now [1]
\`\`\`

Same return value. Completely different damage.

## The two lists

**Change the original:** \`push\` \`pop\` \`shift\` \`unshift\` \`splice\` \`sort\` \`reverse\` \`fill\`

**Return a new array:** \`slice\` \`concat\` \`map\` \`filter\` \`flat\` \`toSorted\` \`toReversed\`

There's a pattern hiding in there. The mutating ones are older, from the days when copying was expensive. The copying ones came with functional style.

## The catch

\`sort\` and \`reverse\` mutate *and* return the array. The same array.

\`\`\`js
const scores = [3, 1, 2];
const sorted = scores.sort();

scores;             // [1, 2, 3]  ← you changed it
sorted === scores;  // true       ← same array, two names
\`\`\`

This one is genuinely nasty. The code reads like a copy. You gave it a new name, so it looks new. But you just reordered the caller's data, and if that array came in as a function argument, you have reached out and changed something that wasn't yours.

Fix it by copying first:

\`\`\`js
const sorted = [...scores].sort();
const sorted = scores.toSorted();   // newer, same thing
\`\`\`

## Why you care

Every "why did my React list reorder itself" bug is this. Every function that quietly corrupts its input is this.

The rule that saves you: **if you didn't create the array, don't mutate it.** Copy, change the copy, return the copy.`,
  },

  {
    id: "atom.sort",
    title: "sort and comparators",
    teaches: ["js.array.sort"],
    requires: ["js.array.mutation"],
    readingSeconds: 85,
    recall:
      "Sort `users` by `age` descending, and break ties by `name` ascending. One comparator.",
    body: `\`[10, 9, 1].sort()\` gives you \`[1, 10, 9]\`.

Not a bug. \`sort\` with no arguments converts every element to a string and sorts those. \`"10"\` comes before \`"9"\` for the same reason \`"apple"\` comes before \`"b"\`.

Numbers need a comparator.

\`\`\`js
[10, 9, 1].sort((a, b) => a - b); // [1, 9, 10]
\`\`\`

## How a comparator works

\`sort\` hands your function two elements and reads the sign of what you return.

- **negative** → \`a\` goes first
- **zero** → leave them alone
- **positive** → \`b\` goes first

That's why \`a - b\` sorts ascending. If \`a\` is smaller the result is negative, so \`a\` goes first. Flip to \`b - a\` for descending.

\`\`\`js
users.sort((a, b) => a.age - b.age);          // youngest first
users.sort((a, b) => b.age - a.age);          // oldest first
names.sort((a, b) => a.localeCompare(b));     // strings, properly
\`\`\`

Use \`localeCompare\` for text. Plain \`<\` breaks on accents and on uppercase, where \`"Z"\` sorts before \`"a"\`.

## The catch

Returning a boolean.

\`\`\`js
users.sort((a, b) => a.age > b.age); // broken
\`\`\`

This looks right and passes small tests. But \`true\` becomes \`1\` and \`false\` becomes \`0\` — and you never return anything negative. You've told \`sort\` "b first" or "they're equal," never "a first." The result is scrambled in a way that depends on array length, so it works on 3 items and fails on 30.

**A comparator returns a number, not a boolean.**

## Tie-breaking

Chain with \`||\`. The first non-zero wins.

\`\`\`js
users.sort((a, b) =>
  b.score - a.score || a.name.localeCompare(b.name)
);
\`\`\`

Score descending. Equal scores fall through to name ascending, because \`0\` is falsy.`,
  },

  {
    id: "atom.reference",
    title: "Reference vs value",
    teaches: ["js.values.reference"],
    requires: [],
    readingSeconds: 90,
    recall:
      "After `const b = {...a}` where `a = { tags: ['x'] }`, does `b.tags.push('y')` change `a`? Why?",
    body: `\`const\` does not make an object constant. It makes the *name* constant.

\`\`\`js
const user = { name: "Ada" };

user.name = "Grace"; // fine
user = {};           // TypeError
\`\`\`

The rule is about the label, not the thing. You can't point \`user\` at something else. You can repaint what it points at all day.

## Handles, not boxes

A number lives in the variable. An object doesn't — the variable holds a handle to it.

\`\`\`js
let x = 1;
let y = x;
y++;
x; // 1   ← numbers are copied
\`\`\`

\`\`\`js
const a = [1, 2];
const b = a;
b.push(3);
a; // [1, 2, 3]   ← one array, two handles
\`\`\`

\`b = a\` copied the handle. Both names lead to the same array. There was never a second array.

This is also why \`===\` behaves the way it does:

\`\`\`js
[1, 2] === [1, 2]; // false — two different arrays
\`\`\`

Same contents, different handles. \`===\` on objects asks "the same one?", not "the same shape?"

## The catch

Spread copies **one level down**.

\`\`\`js
const a = { tags: ["x"] };
const b = { ...a };

b.tags.push("y");
a.tags; // ["x", "y"]   ← still shared
\`\`\`

\`b\` is a genuinely new object. But \`b.tags\` is a copy of the *handle*, so it points at \`a\`'s array. You made a new box and put the same nested things in it.

That's a shallow copy, and it's what \`{...obj}\`, \`Object.assign\`, and \`arr.slice()\` all give you.

For a real deep copy: \`structuredClone(a)\`.

## Why you care

"I changed the copy and the original changed too" is this, every time. So is a piece of state that updates in two places at once.`,
  },

  {
    id: "atom.event-loop",
    title: "The event loop",
    teaches: ["js.async.event-loop"],
    requires: ["js.functions.basics"],
    readingSeconds: 105,
    recall:
      "Order the output: `console.log(1)`, `setTimeout(()=>console.log(2))`, `Promise.resolve().then(()=>console.log(3))`, `console.log(4)`.",
    body: `\`setTimeout(fn, 0)\` does not run \`fn\` now. It runs it after everything else.

\`\`\`js
console.log("A");
setTimeout(() => console.log("B"), 0);
Promise.resolve().then(() => console.log("C"));
console.log("D");

// A D C B
\`\`\`

Four lines, and almost nobody gets the order right the first time.

## One thread, two queues

JavaScript runs one thing at a time. When you hand it work for later, that work waits in a queue.

There are two queues, and they are not equal.

- **Microtasks** — promise callbacks, \`await\` resumptions
- **Macrotasks** — \`setTimeout\`, \`setInterval\`, DOM events, network callbacks

The loop is simple. Run all the synchronous code. Then drain the **entire** microtask queue. Then take **one** macrotask. Then drain microtasks again. Repeat.

So in the example: \`A\` and \`D\` are synchronous. \`C\` is a microtask. \`B\` is a macrotask. Microtasks always go first.

## Drain means drain

The microtask queue empties completely, including anything added while draining.

\`\`\`js
Promise.resolve().then(() => {
  console.log("1");
  Promise.resolve().then(() => console.log("2"));
});
setTimeout(() => console.log("3"));

// 1 2 3
\`\`\`

\`2\` was queued *during* the microtask drain, and it still runs before the timeout. A promise chain that keeps queueing promises can starve every timer on the page forever.

## The catch

\`await\` is a microtask boundary. Everything after it is a callback.

\`\`\`js
async function run() {
  console.log("1");
  await null;          // ← the function pauses here
  console.log("3");
}
run();
console.log("2");

// 1 2 3
\`\`\`

\`await null\` has nothing to wait for. It still yields. The rest of the function is queued as a microtask, so \`2\` runs first.

Read \`await\` as "stop here, put the rest in the microtask queue, return to the caller."

## Why you care

Every "my state was stale" bug and every mystery ordering issue in tests is this. And it's the most common JavaScript interview question that isn't an algorithm.`,
  },

  {
    id: "atom.this",
    title: "this",
    teaches: ["js.functions.this"],
    requires: ["js.functions.basics"],
    readingSeconds: 95,
    recall:
      "Why does `const f = obj.method; f()` lose `this`, and what are two ways to fix it?",
    body: `\`this\` is set by how a function is **called**, not by where it was written.

Read the call site, not the definition. Everything follows from that.

\`\`\`js
const counter = {
  n: 0,
  inc() { this.n++; },
};

counter.inc();  // this is counter
\`\`\`

There's a dot before \`inc\`. Whatever is left of the dot becomes \`this\`.

## Four call forms

\`\`\`js
obj.method();      // this = obj        ← left of the dot
plain();           // this = undefined  ← in strict mode / modules
new Thing();       // this = the new object
fn.call(x);        // this = x          ← you said so
\`\`\`

No dot, no \`this\`. That's the entire rule for the first two.

## The catch

Pulling a method out of its object drops the dot.

\`\`\`js
const counter = { n: 0, inc() { this.n++; } };

const inc = counter.inc;
inc(); // TypeError: Cannot read properties of undefined
\`\`\`

\`inc\` is the same function. But now it's called with no dot, so \`this\` is \`undefined\`.

This bites hardest when you pass a method somewhere:

\`\`\`js
button.addEventListener("click", counter.inc); // broken
setTimeout(counter.inc, 100);                  // broken
\`\`\`

You didn't pass "the method of counter." You passed the function, alone.

Two fixes:

\`\`\`js
button.addEventListener("click", () => counter.inc());
const inc = counter.inc.bind(counter);
\`\`\`

## Arrow functions don't have one

An arrow function has no \`this\` of its own. It uses the \`this\` from wherever it was written.

That makes arrows correct inside a method:

\`\`\`js
const timer = {
  n: 0,
  start() {
    setInterval(() => this.n++, 1000); // this is still timer
  },
};
\`\`\`

And wrong *as* a method:

\`\`\`js
const broken = {
  n: 0,
  inc: () => { this.n++; }, // this is not broken
};
\`\`\`

Written at the top level, so it took the top-level \`this\`. There was no dot to save it.

**Method: use \`function\` or shorthand. Callback inside a method: use an arrow.**`,
  },

  {
    id: "atom.hash-map",
    title: "The hash map trade",
    teaches: ["pattern.hash-map"],
    requires: ["js.mapset"],
    readingSeconds: 95,
    recall:
      "Given `nums` and `target`, what do you store in the map, and what do you look up?",
    body: `If you're scanning an array to find something you already walked past, you want a Map.

\`\`\`js
// O(n²) — for every item, search the whole array again
for (let i = 0; i < nums.length; i++) {
  for (let j = i + 1; j < nums.length; j++) {
    if (nums[i] + nums[j] === target) return [i, j];
  }
}
\`\`\`

The inner loop is pure re-reading. You already saw those numbers.

\`\`\`js
const seen = new Map();
for (let i = 0; i < nums.length; i++) {
  const need = target - nums[i];
  if (seen.has(need)) return [seen.get(need), i];
  seen.set(nums[i], i);
}
\`\`\`

One pass. Remember what you've seen, and ask the map instead of the array.

## The trade

You spend memory to buy time. O(n²) becomes O(n), and O(1) space becomes O(n).

That trade is almost always worth taking, and "use a hash map" is the correct first guess for a startling share of interview problems.

The move is always the same: **as you walk, write down what a future step would want to know.**

## Ask the right question

The real trick isn't "store the numbers." It's storing each number and then asking the map for its *complement* — the value that would complete the pair. You flip the question from "is there a pair that sums to the target" into "have I already seen the number that would finish this one."

That flip is the actual skill. The Map is just where the answer lives.

## The catch

Plain objects turn keys into strings. \`Map\` doesn't.

\`\`\`js
const obj = {};
obj[1] = "a";
obj["1"] = "b";
obj[1]; // "b"   ← one key

const map = new Map();
map.set(1, "a");
map.set("1", "b");
map.get(1); // "a"  ← two keys
\`\`\`

Objects also inherit keys. \`obj["toString"]\` is a function you never set, which is why counting words with \`{}\` can produce nonsense.

Use \`Map\` when keys aren't plain strings, when you need \`.size\`, or when you'll insert and delete a lot. Use \`Object.create(null)\` if you want a plain object with no inherited keys.`,
  },
];

export const ATOM_BY_ID = new Map(ATOMS.map((a) => [a.id, a]));

export const ATOM_BY_CONCEPT = new Map(
  ATOMS.flatMap((atom) => atom.teaches.map((id) => [id, atom] as const)),
);

import type { Atom, Lesson, Problem } from "../../types";
import { rep, stub } from "../rep";

/**
 * M11 — Async.
 *
 * Ordered so that nothing is magic: the event loop first, so "why did that run
 * last?" already has an answer before promises appear; promises before
 * `await`, so `await` reads as sugar rather than a new mechanism.
 */
export const M11_ATOMS: Atom[] = [
  {
    id: "teach.event-loop",
    title: "The event loop",
    teaches: ["js.async.event-loop"],
    requires: ["js.functions.callbacks"],
    readingSeconds: 185,
    recall:
      "`setTimeout(fn, 0)` — name the two things that must happen before `fn` runs.",
    body: `JavaScript runs **one thing at a time**. There is a single call stack, and while something is on it nothing else in your program can run — no timer, no click handler, no network response.

That sounds like it should make waiting impossible. The event loop is how it isn't.

## The parts

**The call stack** is what's running right now. A function call pushes onto it; a return pops off. When the stack is empty, your code has finished for this moment.

**The queues** hold work that is ready but not yet started. A finished timer, an arrived response, a click.

**The event loop** is a rule, not a thing: *when the stack is empty, take the next item from a queue and run it.*

The key word is **empty**. Queued work never interrupts running code. It waits its turn.

## setTimeout(fn, 0) does not mean "now"

\`\`\`js
console.log("1");
setTimeout(() => console.log("2"), 0);
console.log("3");
// 1, 3, 2
\`\`\`

Walk it exactly:

1. \`console.log("1")\` runs. **1**
2. \`setTimeout\` runs. It hands the arrow to the timer system and returns immediately. Nothing is logged.
3. \`console.log("3")\` runs. **3**
4. The script finishes. The stack is now empty.
5. Only now does the loop take the waiting arrow and run it. **2**

The \`0\` is a *minimum* delay, not a promise. It means "as soon as possible after the current work finishes", and if the current work takes two seconds, so does the wait.

## Blocking

Because there's one stack, slow synchronous code freezes everything:

\`\`\`js
// nothing else in the program can run for these three seconds
const end = Date.now() + 3000;
while (Date.now() < end) {}
\`\`\`

No timers fire, no clicks register, the page doesn't repaint. This is what "blocking the event loop" means, and it's why heavy work belongs in a worker.

## Two queues, not one

Promise callbacks don't go in the same line as timers. They go in a separate, higher-priority queue — the **microtask** queue — and the loop drains it completely before taking a single timer.

\`\`\`js
console.log("1");
setTimeout(() => console.log("2"), 0);         // macrotask queue
Promise.resolve().then(() => console.log("3")); // microtask queue
console.log("4");
// 1, 4, 3, 2
\`\`\`

Step by step:

1. **1** logs.
2. \`setTimeout\` queues the arrow as a *macrotask*.
3. \`Promise.resolve().then(...)\` queues its arrow as a *microtask*.
4. **4** logs. The script ends; the stack is empty.
5. The loop drains **all** microtasks first. **3** logs.
6. Only then does it take one macrotask. **2** logs.

So the order is 1, 4, 3, 2 — and this exact question is asked in interviews constantly. The one sentence to remember: **promises jump the queue ahead of timers.**

"Drains all microtasks" is literal. A microtask that queues another microtask gets that one run too, before any timer. An endless chain of them starves timers completely — rare, but real.

## Why this matters before you learn promises

Every confusing thing about async code comes back to this model:

- Code after an async call runs **before** the result arrives, because the stack has to empty first.
- A value read too early is \`undefined\`, not an error, because nothing failed — it just hasn't happened yet.
- Two async operations started together overlap, because starting one doesn't occupy the stack.

Promises don't change any of it. They're a way of *describing* work in this model that reads better than nested callbacks.`,
  },
  {
    id: "teach.promises",
    title: "Promises",
    teaches: ["js.async.promises"],
    requires: ["js.async.event-loop"],
    readingSeconds: 185,
    recall:
      "A promise has settled as rejected. What are the two things that can never happen to it afterwards?",
    body: `A **promise** is an object standing in for a value that isn't here yet.

Not the value. A receipt for it — something you can hold now and attach instructions to, for whenever the real thing arrives.

## Three states

\`\`\`js
// pending, until something settles it
const p = fetchSomething();
\`\`\`

- **pending** — still waiting
- **fulfilled** — it worked, and there's a value
- **rejected** — it failed, and there's a reason

It starts pending and changes **once**. Once settled it is frozen: a fulfilled promise can never reject, a rejected one can never fulfil, and neither can settle a second time. That one-way door is the whole guarantee, and it's why attaching a handler late still works — you get the already-settled answer immediately rather than missing it.

## Reading one

\`\`\`js
p.then((value) => console.log("got", value))
 .catch((err) => console.log("failed", err.message))
 .finally(() => console.log("done either way"));
\`\`\`

\`then\` runs on success. \`catch\` runs on failure. \`finally\` runs on both and receives nothing — it's for cleanup, not for results.

These callbacks are **microtasks**, so they run after the current script finishes, exactly as the last lesson described.

## Chaining, and the one rule that makes it work

\`then\` returns a new promise. **Whatever you return from inside it becomes the next promise's value.**

\`\`\`js
Promise.resolve(2)
  .then((n) => n * 2)      // returns 4
  .then((n) => n + 1)      // receives 4, returns 5
  .then((n) => console.log(n));   // 5
\`\`\`

And if you return a *promise*, the chain waits for it and unwraps it before continuing:

\`\`\`js
getUser(id)
  .then((user) => getPosts(user.id))   // returns a promise
  .then((posts) => posts.length);      // receives the posts, not a promise
\`\`\`

That flattening is what killed the "callback pyramid". Compare:

\`\`\`js
// the shape promises exist to remove
getUser(id, (user) => {
  getPosts(user.id, (posts) => {
    getComments(posts[0], (comments) => {
      // three levels deep, three separate error paths
    });
  });
});
\`\`\`

Each level indents further, and every level needs its own error handling. The promise chain is flat, and one \`catch\` at the end covers every step.

## The one mistake everyone makes

**Forgetting to return.**

\`\`\`js
getUser(id)
  .then((user) => {
    getPosts(user.id);       // started, but not returned
  })
  .then((posts) => posts.length);   // TypeError — posts is undefined
\`\`\`

The first \`then\` returns \`undefined\`, so the chain moves on immediately without waiting. Adding \`return\` in front of \`getPosts\` fixes it. If a \`then\` block uses braces, check that it returns.

## Making one

Most promises come from APIs that already return them. You build one by hand for exactly one job: wrapping something older that takes a callback.

\`\`\`js
function delay(ms) {
  // resolve is called later, by the timer
  return new Promise((resolve) => setTimeout(resolve, ms));
}

delay(1000).then(() => console.log("a second later"));
\`\`\`

\`new Promise\` takes a function receiving two arguments: \`resolve\` and \`reject\`. Call \`resolve(value)\` when it works, \`reject(error)\` when it doesn't. Calling either a second time does nothing at all — the state is already fixed.

\`\`\`js
function readFile(path) {
  return new Promise((resolve, reject) => {
    // classic callback style: error first, then the result
    oldApi(path, (err, data) => (err ? reject(err) : resolve(data)));
  });
}
\`\`\`

**Always reject with an \`Error\`,** never a string. An \`Error\` carries a stack trace; a string tells you nothing about where it came from.

Two shortcuts for promises that are already settled:

\`\`\`js
Promise.resolve(5);              // already fulfilled with 5
Promise.reject(new Error("no")); // already rejected
\`\`\``,
  },
  {
    id: "teach.await",
    title: "async and await",
    teaches: ["js.async.await"],
    requires: ["js.async.promises"],
    readingSeconds: 180,
    recall:
      "What does an `async` function return when its body returns the plain number `5`?",
    body: `\`await\` lets you write promise code that reads top to bottom, like ordinary code.

\`\`\`js
// the same chain, written flat
async function load(id) {
  const user = await getUser(id);
  const posts = await getPosts(user.id);
  return posts.length;
}
\`\`\`

No \`.then\`, no callbacks, no indentation. Each \`await\` says "pause here until this promise settles, then give me the value".

## Two rules, and that's the syntax

**1. \`await\` only works inside an \`async\` function.** (Or at the top level of a module, which is a newer addition.) Using it anywhere else is a syntax error.

**2. An \`async\` function always returns a promise.** Always — even when the body returns a plain value.

\`\`\`js
async function five() {
  return 5;
}

five();          // Promise { 5 } — not 5
await five();    // 5
\`\`\`

That surprises people constantly. Calling an async function hands back a receipt; you still have to \`await\` it or \`.then\` it to see inside. If a value prints as \`Promise { <pending> }\`, you forgot an \`await\`.

## What "pause" actually means

\`await\` pauses **this function**. It does not pause the program.

\`\`\`js
async function slow() {
  await delay(1000);
  console.log("slow finished");
}

slow();
console.log("this runs immediately");
// "this runs immediately", then a second later, "slow finished"
\`\`\`

At the \`await\`, \`slow\` steps off the call stack and registers to resume later. The stack empties, and everything after \`slow()\` runs normally. When the promise settles, the rest of \`slow\` is queued as a microtask.

So the event loop is never blocked. \`await\` is the same machinery as \`.then\`, written differently.

## The trap: await inside a loop

This is the most common performance bug in async JavaScript.

\`\`\`js
// each request waits for the one before — 10 x 200ms = 2 seconds
const results = [];
for (const id of ids) {
  results.push(await fetchUser(id));
}
\`\`\`

Ten requests that could have overlapped are run one after another, because each \`await\` genuinely stops the function until it finishes.

When the items don't depend on each other, start them all first and wait once:

\`\`\`js
// all ten start immediately — total time is the slowest one
const results = await Promise.all(ids.map((id) => fetchUser(id)));
\`\`\`

\`ids.map(...)\` calls \`fetchUser\` ten times without awaiting, so ten requests are in flight before the next line runs. \`Promise.all\` then waits for all of them.

**Sequential is right when each step needs the one before it. Parallel is right when they're independent.** Look at the loop and ask which it is — that question alone catches most of these.

## Starting early, awaiting late

Sometimes you want both requests running but need them separately:

\`\`\`js
// no await here — both are already in flight
const userPromise = getUser(id);
const settingsPromise = getSettings(id);

const user = await userPromise;
const settings = await settingsPromise;
\`\`\`

Calling the function starts the work. \`await\` only decides when you collect it. Awaiting on the same lines as the calls would have made them sequential again.

## async arrows and methods

\`\`\`js
const load = async (id) => (await getUser(id)).name;

const api = {
  async get(id) {
    return getUser(id);
  },
};
\`\`\`

Same rules everywhere: \`async\` before the parameter list for an arrow, before the name for a method.`,
  },
  {
    id: "teach.async-errors",
    title: "Async error handling",
    teaches: ["js.async.errors"],
    requires: ["js.async.await"],
    readingSeconds: 170,
    recall:
      "Why does `try { doAsync(); } catch {}` fail to catch anything, even when `doAsync` rejects?",
    body: `A rejected promise inside an \`async\` function behaves exactly like a thrown error. So \`try\`/\`catch\` works, and it's the reason \`await\` is nicer than \`.then\`.

\`\`\`js
async function load(id) {
  try {
    const user = await getUser(id);
    return user.name;
  } catch (err) {
    // catches a rejection from getUser AND a normal throw
    return "unknown";
  }
}
\`\`\`

One \`catch\` covers both failure kinds. In a \`.then\` chain those were two different mechanisms.

## The mistake that makes it silently useless

**\`try\`/\`catch\` only catches what it is still waiting for.** Forget the \`await\` and the error escapes.

\`\`\`js
try {
  doAsync();          // no await — returns a promise, doesn't throw here
} catch (err) {
  // never runs
}
\`\`\`

\`doAsync()\` starts the work and returns a promise immediately. The \`try\` block finishes successfully. The rejection happens later, with the \`try\` long gone, and becomes an **unhandled rejection** — logged to the console, invisible in your tests.

The fix is one word:

\`\`\`js
try {
  await doAsync();
} catch (err) {
  // now it runs
}
\`\`\`

This is the same class of bug as forgetting \`return\` in a \`.then\`. Whenever error handling mysteriously doesn't fire, look for a missing \`await\` first.

## The same trap in a callback

\`\`\`js
// the async callback's rejection has nowhere to go
items.forEach(async (item) => {
  await process(item);
});
\`\`\`

\`forEach\` ignores return values, so it discards every promise the callback produces. Nothing awaits them, nothing catches them, and the line after the loop runs before any item is processed. Use \`for...of\` with \`await\`, or \`Promise.all(items.map(...))\`.

## finally

\`\`\`js
async function load(id) {
  setLoading(true);
  try {
    return await getUser(id);
  } finally {
    // runs on success, on failure, and on early return
    setLoading(false);
  }
}
\`\`\`

Note there's no \`catch\` here. \`finally\` without \`catch\` is a real and useful shape: clean up, but let the error continue to whoever called you.

Note also \`return await\` rather than \`return\`. Without the \`await\`, the function returns the promise and finishes — so \`finally\` runs *before* the request completes. Inside a \`try\`/\`finally\`, keep the \`await\`.

## Catching only what you meant to

\`\`\`js
try {
  return await getUser(id);
} catch (err) {
  // anything you don't understand should keep travelling
  if (err.name === "NotFound") return null;
  throw err;
}
\`\`\`

A \`catch\` that swallows everything turns a database outage into "user not found". Handle the case you recognise; rethrow the rest.

## Where errors go when nobody is looking

\`\`\`js
getUser(id);   // rejection with no handler at all
\`\`\`

This produces an unhandled rejection — a console warning in browsers, and a process crash in modern Node. Every promise chain needs a \`catch\` somewhere, or an \`await\` inside a \`try\`, or to be returned to someone who will do one of those.

**A promise you neither await nor catch is a bug waiting for production.**`,
  },
  {
    id: "teach.combinators",
    title: "Promise.all and friends",
    teaches: ["js.async.combinators"],
    requires: ["js.async.await"],
    readingSeconds: 175,
    recall:
      "Ten requests, one fails, and you need the other nine. Which combinator, and why not `all`?",
    body: `Four functions take an array of promises and give you back one promise. Choosing the right one is mostly about what should happen when something fails.

## Promise.all — everything, or nothing

\`\`\`js
const [user, posts] = await Promise.all([getUser(id), getPosts(id)]);
\`\`\`

Both start immediately, and the \`await\` finishes when the slower one does. Total time is the **slowest** request, not the sum.

Results come back **in input order**, always — never in the order they finished. That's what makes destructuring safe.

The failure rule is strict: **if any promise rejects, the whole thing rejects immediately** with that error. You lose the results of the ones that succeeded, even though they finished.

\`\`\`js
// one bad id and you get nothing, not nine users
await Promise.all(ids.map(getUser));
\`\`\`

Use it when partial results are useless to you — a page that can't render without all its data.

Note it doesn't cancel anything. The other requests keep running; you just stop listening. JavaScript promises have no cancellation.

## Promise.allSettled — tell me about all of them

\`\`\`js
const results = await Promise.allSettled(ids.map(getUser));
\`\`\`

**This never rejects.** It waits for every promise to finish, however it finishes, and hands you a report:

\`\`\`js
// one entry per input, in input order
[
  { status: "fulfilled", value: {} },
  { status: "rejected", reason: Error },
]
\`\`\`

Every entry has a \`status\`. Fulfilled ones carry \`value\`; rejected ones carry \`reason\`. Extracting the successes is a filter and a map:

\`\`\`js
const users = results
  .filter((r) => r.status === "fulfilled")
  .map((r) => r.value);
\`\`\`

Use it whenever partial success is still useful — which, for anything user-facing, is most of the time.

## Promise.race — first to settle, win or lose

\`\`\`js
// whichever happens first decides the outcome
const data = await Promise.race([fetchData(), timeout(5000)]);
\`\`\`

The first promise to settle **either way** decides it. If the timeout wins, you get its rejection; if the fetch wins, you get the data.

That's the main use: adding a deadline to something that doesn't have one. Note the loser keeps running — \`race\` is a listening choice, not a cancellation.

Careful with an empty array: \`race([])\` stays pending forever, because nothing can ever settle it.

## Promise.any — first success

\`\`\`js
const fastest = await Promise.any([fromCacheA(), fromCacheB()]);
\`\`\`

Like \`race\`, but rejections don't count. It waits for the first **fulfilment** and ignores failures. Only if every single one rejects does it reject, with an \`AggregateError\` holding all the reasons.

Use it for redundant sources where you want whichever answers first and don't care that the others failed.

## Choosing

| Need | Use |
| --- | --- |
| All must succeed | \`all\` |
| Want every outcome | \`allSettled\` |
| First one to finish | \`race\` |
| First one that works | \`any\` |

All four take any iterable of promises, and non-promise values are treated as already-fulfilled — so a mixed array works fine.`,
  },
  {
    id: "teach.concurrency",
    title: "Controlling concurrency",
    teaches: ["js.async.concurrency"],
    requires: ["js.async.combinators"],
    readingSeconds: 165,
    recall:
      "Why is `Promise.all` the wrong tool for ten thousand requests, and what replaces it?",
    body: `\`Promise.all\` starts everything at once. With ten items that's exactly what you want. With ten thousand it's a denial-of-service attack on your own API.

\`\`\`js
// ten thousand simultaneous requests
await Promise.all(ids.map((id) => fetchUser(id)));
\`\`\`

What actually happens: sockets exhausted, memory spent on ten thousand pending responses, rate limits tripped, and the server you're calling falling over. Everything fails together, and \`all\` throws away the successes.

## Three speeds

**Sequential** — one at a time. Slow, gentle, and required when each step depends on the last.

\`\`\`js
const out = [];
for (const id of ids) {
  // each waits for the previous one
  out.push(await fetchUser(id));
}
\`\`\`

**Parallel** — everything at once. Fastest, and only safe when the count is small and known.

\`\`\`js
const out = await Promise.all(ids.map((id) => fetchUser(id)));
\`\`\`

**Pooled** — at most N at a time. The answer for anything large.

## A pool in eight lines

\`\`\`js
async function pool(items, worker, limit) {
  const results = new Array(items.length);
  let next = 0;

  // each runner takes the next index until there are none left
  async function run() {
    while (next < items.length) {
      const i = next++;
      results[i] = await worker(items[i], i);
    }
  }

  await Promise.all(Array.from({ length: limit }, run));
  return results;
}
\`\`\`

Read it in two parts.

\`run\` is one worker. It grabs the next index, claims it by incrementing \`next\`, awaits that item, and loops. The \`const i = next++\` matters: it reads and increments in one step, so two runners can never take the same index.

The last line starts \`limit\` copies of \`run\` at once. Each pulls work independently, so a fast item frees its runner immediately — no waiting for a whole batch to finish. \`Promise.all\` here just waits for every runner to exhaust the list.

Results land in \`results[i]\`, so they stay in **input order** regardless of what finished when.

Why this rather than fixed batches of N? A batch runs at the speed of its slowest member, and everything else sits idle waiting for it. A pool keeps all \`limit\` slots busy the whole time.

## Choosing a limit

There's no universal number. 5–10 for an external API, higher for something you own, 1 when the operations aren't safe to run at once. If you're hitting a rate limit, that limit is your answer.

## Ordering that actually matters

Await inside a loop is only a bug when the items are independent. When they're not, it's the correct code:

\`\`\`js
// each step needs the row the previous one created
for (const row of rows) {
  await insert(row);
}
\`\`\`

Rewriting that as \`Promise.all\` would be a real bug, not an optimisation. **Ask whether item two needs item one's result. If it does, sequential is not slow — it's correct.**`,
  },
];

export const M11_REPS: Problem[] = [
  rep({
    id: "r.evt.1",
    lesson: "l11.1",
    teaches: ["js.async.event-loop"],
    title: "delay",
    prompt:
      "Return a promise that resolves after `ms` milliseconds. Everything later in this module uses it.",
    exportName: "delay",
    starter: stub("delay", "ms"),
    tests: [
      {
        name: "resolves eventually",
        code: `let done = false;
await fn(5).then(() => { done = true; });
expect(done).toBe(true);`,
      },
      {
        name: "does not resolve before the timer",
        code: `let done = false;
fn(50).then(() => { done = true; });
expect(done).toBe(false);`,
      },
    ],
    hint: "`new Promise(resolve => setTimeout(resolve, ms))` — the timer calls `resolve` for you later.",
    solution:
      "function delay(ms) {\n  return new Promise((resolve) => setTimeout(resolve, ms));\n}",
    mistakes: [
      {
        match: "setTimeout(resolve(), ms)",
        hint: "`resolve()` calls it immediately and passes the result to `setTimeout`. Pass the function itself, uncalled.",
      },
    ],
    seconds: 60,
  }),
  rep({
    id: "r.evt.2",
    lesson: "l11.1",
    teaches: ["js.async.event-loop"],
    title: "Microtasks jump the queue",
    prompt:
      "Push three labels into an array — `\"sync\"` now, `\"micro\"` from a resolved promise, `\"timeout\"` from a zero-delay timer — then return a promise for the array once everything has run.\n\nThe order they end up in is the lesson.",
    exportName: "runOrder",
    starter: stub("runOrder", ""),
    tests: [
      {
        name: "micro beats macro",
        code: `expect(await fn()).toEqual(["sync", "micro", "timeout"]);`,
      },
    ],
    hint: "Push `\"sync\"` straight away, queue the other two, and resolve after a slightly longer timer so both have landed.",
    solution:
      'function runOrder() {\n  const out = [];\n  out.push("sync");\n  setTimeout(() => out.push("timeout"), 0);\n  Promise.resolve().then(() => out.push("micro"));\n  return new Promise((resolve) => setTimeout(() => resolve(out), 10));\n}',
    seconds: 90,
  }),
  rep({
    id: "r.evt.3",
    lesson: "l11.1",
    teaches: ["js.async.event-loop"],
    title: "Later, not now",
    prompt:
      "Return a promise for `value`, and prove the handler runs after the current code by leaving the flag `false` until then.",
    exportName: "soon",
    starter: stub("soon", "value"),
    tests: [
      { name: "resolves to the value", code: `expect(await fn(7)).toBe(7);` },
      {
        name: "the handler has not run yet",
        code: `let ran = false;
fn(1).then(() => { ran = true; });
expect(ran).toBe(false);`,
      },
    ],
    hint: "`Promise.resolve(value)` is already fulfilled — but its `.then` callback is still a microtask, so it waits for the stack to empty.",
    solution: "function soon(value) {\n  return Promise.resolve(value);\n}",
    seconds: 45,
  }),

  rep({
    id: "r.prom.1",
    lesson: "l11.2",
    teaches: ["js.async.promises"],
    title: "Wrap a callback API",
    prompt:
      "`task` is old-style: you call it with a callback that receives `(err, data)`. Return a promise version — resolve with `data`, reject with `err`.",
    exportName: "promisify",
    starter: stub("promisify", "task"),
    tests: [
      {
        name: "resolves with the data",
        code: `const task = (cb) => cb(null, 42);
expect(await fn(task)).toBe(42);`,
      },
      {
        name: "rejects with the error",
        code: `const task = (cb) => cb(new Error("nope"));
let msg = "";
await fn(task).catch((e) => { msg = e.message; });
expect(msg).toBe("nope");`,
      },
    ],
    hint: "`new Promise((resolve, reject) => task((err, data) => err ? reject(err) : resolve(data)))`.",
    solution:
      "function promisify(task) {\n  return new Promise((resolve, reject) => {\n    task((err, data) => (err ? reject(err) : resolve(data)));\n  });\n}",
    seconds: 90,
  }),
  rep({
    id: "r.prom.2",
    lesson: "l11.2",
    teaches: ["js.async.promises"],
    title: "Chain with then",
    prompt:
      "Given a promise of a number, return a promise of that number doubled and then increased by one. Use `.then`, not `await` — this rep is about the chain.",
    exportName: "transform",
    starter: stub("transform", "promise"),
    tests: [
      {
        name: "doubles then adds one",
        code: `expect(await fn(Promise.resolve(5))).toBe(11);`,
      },
      { name: "works from zero", code: `expect(await fn(Promise.resolve(0))).toBe(1);` },
    ],
    hint: "Whatever you return from a `then` becomes the next one's value. Two `then` calls, one operation each.",
    solution:
      "function transform(promise) {\n  return promise.then((n) => n * 2).then((n) => n + 1);\n}",
    mistakes: [
      {
        match: "promise.then((n) => { n * 2",
        hint: "A `then` with braces needs an explicit `return`, or it hands `undefined` to the next link.",
      },
    ],
    seconds: 60,
  }),
  rep({
    id: "r.prom.3",
    lesson: "l11.2",
    teaches: ["js.async.promises"],
    title: "Reject properly",
    prompt:
      "Return a promise that rejects with an `Error` carrying `message` when `shouldFail` is true, and otherwise fulfils with `\"ok\"`.",
    exportName: "maybe",
    starter: stub("maybe", "shouldFail, message"),
    tests: [
      { name: "fulfils", code: `expect(await fn(false, "x")).toBe("ok");` },
      {
        name: "rejects with a real Error",
        code: `const err = await fn(true, "broken").catch((e) => e);
expect(err instanceof Error).toBe(true);
expect(err.message).toBe("broken");`,
      },
    ],
    hint: "`Promise.reject(new Error(message))` — reject with an `Error`, never a bare string, so you get a stack trace.",
    solution:
      'function maybe(shouldFail, message) {\n  return shouldFail\n    ? Promise.reject(new Error(message))\n    : Promise.resolve("ok");\n}',
    mistakes: [
      {
        match: "Promise.reject(message)",
        hint: "A string reason carries no stack trace. Wrap it: `new Error(message)`.",
      },
    ],
    seconds: 60,
  }),

  rep({
    id: "r.await.1",
    lesson: "l11.3",
    teaches: ["js.async.await"],
    title: "The same chain, flat",
    prompt:
      "Rewrite the doubling chain with `async`/`await`: take a promise of a number, return the number doubled then increased by one.",
    exportName: "transform",
    starter: "async function transform(promise) {\n  \n}",
    tests: [
      { name: "doubles then adds one", code: `expect(await fn(Promise.resolve(5))).toBe(11);` },
      {
        name: "still returns a promise",
        code: `expect(fn(Promise.resolve(1)) instanceof Promise).toBe(true);`,
      },
    ],
    hint: "`const n = await promise;` then return the arithmetic. An `async` function wraps the result in a promise for you.",
    solution:
      "async function transform(promise) {\n  const n = await promise;\n  return n * 2 + 1;\n}",
    seconds: 55,
  }),
  rep({
    id: "r.await.2",
    lesson: "l11.3",
    teaches: ["js.async.await"],
    title: "One after another",
    prompt:
      "`tasks` is an array of async functions. Run them **strictly in order**, waiting for each before starting the next, and return the array of results.\n\nHere the sequence is the requirement, not a mistake.",
    exportName: "inOrder",
    starter: "async function inOrder(tasks) {\n  \n}",
    tests: [
      {
        name: "collects every result",
        code: `expect(await fn([async () => 1, async () => 2])).toEqual([1, 2]);`,
      },
      {
        name: "actually waits for each",
        code: `const log = [];
const make = (n, ms) => async () => {
  await new Promise((r) => setTimeout(r, ms));
  log.push(n);
  return n;
};
await fn([make(1, 20), make(2, 1)]);
expect(log).toEqual([1, 2]);`,
      },
      { name: "empty list", code: `expect(await fn([])).toEqual([]);` },
    ],
    hint: "A `for...of` loop with `await` inside. `map` would start them all at once, which is the opposite of what's asked.",
    solution:
      "async function inOrder(tasks) {\n  const out = [];\n  for (const task of tasks) {\n    out.push(await task());\n  }\n  return out;\n}",
    mistakes: [
      {
        match: "forEach(async",
        hint: "`forEach` throws away the promises the callback returns, so nothing waits for anything.",
      },
    ],
    seconds: 85,
  }),
  rep({
    id: "r.await.3",
    lesson: "l11.3",
    teaches: ["js.async.await"],
    title: "Start early, await late",
    prompt:
      "Given two async functions, start **both** immediately and return `[first, second]` once each has finished.\n\nAwaiting on the same line you call them would make this sequential.",
    exportName: "both",
    starter: "async function both(a, b) {\n  \n}",
    tests: [
      {
        name: "returns both results in order",
        code: `expect(await fn(async () => 1, async () => 2)).toEqual([1, 2]);`,
      },
      {
        name: "they overlap",
        code: `const slow = async () => { await new Promise((r) => setTimeout(r, 40)); return "slow"; };
const quick = async () => { await new Promise((r) => setTimeout(r, 40)); return "quick"; };
const started = Date.now();
await fn(slow, quick);
expect(Date.now() - started < 70).toBe(true);`,
      },
    ],
    hint: "Call both first and keep the promises in variables. Then `await` each one on its own line.",
    solution:
      "async function both(a, b) {\n  const first = a();\n  const second = b();\n  return [await first, await second];\n}",
    seconds: 75,
  }),

  rep({
    id: "r.aerr.1",
    lesson: "l11.4",
    teaches: ["js.async.errors"],
    title: "Never throw",
    prompt:
      "Await `task()` and return its value. If it rejects or throws, return `null` instead — this function must never reject.",
    exportName: "safe",
    starter: "async function safe(task) {\n  \n}",
    tests: [
      { name: "passes the value through", code: `expect(await fn(async () => 7)).toBe(7);` },
      {
        name: "swallows a rejection",
        code: `expect(await fn(async () => { throw new Error("x"); })).toBe(null);`,
      },
      {
        name: "swallows a synchronous throw too",
        code: `expect(await fn(() => { throw new Error("x"); })).toBe(null);`,
      },
    ],
    hint: "`try { return await task(); } catch { return null; }` — the `await` inside the `try` is what makes the catch reachable.",
    solution:
      "async function safe(task) {\n  try {\n    return await task();\n  } catch {\n    return null;\n  }\n}",
    mistakes: [
      {
        match: "return task();",
        hint: "Without `await`, the `try` block finishes before the rejection happens, so the `catch` never fires.",
      },
    ],
    seconds: 70,
  }),
  rep({
    id: "r.aerr.2",
    lesson: "l11.4",
    teaches: ["js.async.errors"],
    title: "Handle one, rethrow the rest",
    prompt:
      "Await `task()`. If it fails with an error whose `name` is `\"NotFound\"`, return `null`. Any other error must keep travelling.",
    exportName: "findOrNull",
    starter: "async function findOrNull(task) {\n  \n}",
    tests: [
      { name: "passes the value through", code: `expect(await fn(async () => "u")).toBe("u");` },
      {
        name: "NotFound becomes null",
        code: `const e = new Error("gone");
e.name = "NotFound";
expect(await fn(async () => { throw e; })).toBe(null);`,
      },
      {
        name: "anything else still rejects",
        code: `const caught = await fn(async () => { throw new Error("db down"); }).catch((e) => e.message);
expect(caught).toBe("db down");`,
      },
    ],
    hint: "Inside the `catch`, check `err.name` and return `null` for the one you recognise. End with a bare `throw err;`.",
    solution:
      'async function findOrNull(task) {\n  try {\n    return await task();\n  } catch (err) {\n    if (err.name === "NotFound") return null;\n    throw err;\n  }\n}',
    seconds: 80,
  }),
  rep({
    id: "r.aerr.3",
    lesson: "l11.4",
    teaches: ["js.async.errors"],
    title: "Always clean up",
    prompt:
      "Await `task()` and return its value. Push `\"done\"` into `log` whether it succeeded or failed — and let a failure keep travelling to the caller.",
    exportName: "withCleanup",
    starter: "async function withCleanup(task, log) {\n  \n}",
    tests: [
      {
        name: "cleans up on success",
        code: `const log = [];
expect(await fn(async () => 1, log)).toBe(1);
expect(log).toEqual(["done"]);`,
      },
      {
        name: "cleans up on failure and still rejects",
        code: `const log = [];
const msg = await fn(async () => { throw new Error("x"); }, log).catch((e) => e.message);
expect(msg).toBe("x");
expect(log).toEqual(["done"]);`,
      },
    ],
    hint: "`try { return await task(); } finally { log.push(\"done\"); }` — no `catch` at all, so the error passes straight through.",
    solution:
      'async function withCleanup(task, log) {\n  try {\n    return await task();\n  } finally {\n    log.push("done");\n  }\n}',
    mistakes: [
      {
        match: "try {\n    return task();",
        hint: "Without `await`, `finally` runs before the task settles — the cleanup happens too early.",
      },
    ],
    seconds: 75,
  }),

  rep({
    id: "r.comb.1",
    lesson: "l11.5",
    teaches: ["js.async.combinators"],
    title: "All at once",
    prompt:
      "`tasks` is an array of async functions. Start them all at the same time and return their results in **input order**.",
    exportName: "allOf",
    starter: "async function allOf(tasks) {\n  \n}",
    tests: [
      {
        name: "results in input order, not finish order",
        code: `const make = (n, ms) => async () => {
  await new Promise((r) => setTimeout(r, ms));
  return n;
};
expect(await fn([make(1, 30), make(2, 1)])).toEqual([1, 2]);`,
      },
      { name: "empty list", code: `expect(await fn([])).toEqual([]);` },
      {
        name: "one failure rejects the lot",
        code: `const msg = await fn([async () => 1, async () => { throw new Error("bad"); }]).catch((e) => e.message);
expect(msg).toBe("bad");`,
      },
    ],
    hint: "`Promise.all(tasks.map(t => t()))` — the `map` starts every one, and `all` waits for them together.",
    solution:
      "async function allOf(tasks) {\n  return Promise.all(tasks.map((t) => t()));\n}",
    mistakes: [
      {
        match: "Promise.all(tasks)",
        hint: "`tasks` holds functions, not promises. They need calling first — `tasks.map(t => t())`.",
      },
    ],
    seconds: 65,
  }),
  rep({
    id: "r.comb.2",
    lesson: "l11.5",
    teaches: ["js.async.combinators"],
    title: "Keep the survivors",
    prompt:
      "Run every task and return only the values that succeeded, in input order. One failure must not cost you the rest.",
    exportName: "successes",
    starter: "async function successes(tasks) {\n  \n}",
    tests: [
      {
        name: "drops the failures, keeps the rest",
        code: `const out = await fn([
  async () => 1,
  async () => { throw new Error("x"); },
  async () => 3,
]);
expect(out).toEqual([1, 3]);`,
      },
      {
        name: "all failing gives an empty array",
        code: `expect(await fn([async () => { throw new Error("x"); }])).toEqual([]);`,
      },
      { name: "empty list", code: `expect(await fn([])).toEqual([]);` },
    ],
    hint: "`Promise.allSettled` never rejects. Filter on `status === \"fulfilled\"`, then map to `value`.",
    solution:
      'async function successes(tasks) {\n  const results = await Promise.allSettled(tasks.map((t) => t()));\n  return results\n    .filter((r) => r.status === "fulfilled")\n    .map((r) => r.value);\n}',
    seconds: 85,
  }),
  rep({
    id: "r.comb.3",
    lesson: "l11.5",
    teaches: ["js.async.combinators"],
    title: "Add a deadline",
    prompt:
      "Return `task()`'s value, unless it takes longer than `ms` — in which case reject with an `Error` saying `\"timeout\"`.",
    exportName: "withTimeout",
    starter: "async function withTimeout(task, ms) {\n  \n}",
    tests: [
      {
        name: "fast enough wins",
        code: `expect(await fn(async () => "ok", 50)).toBe("ok");`,
      },
      {
        name: "too slow loses",
        code: `const slow = async () => { await new Promise((r) => setTimeout(r, 60)); return "late"; };
const msg = await fn(slow, 10).catch((e) => e.message);
expect(msg).toBe("timeout");`,
      },
    ],
    hint: "`Promise.race` between the task and a timer that rejects. First to settle decides, win or lose.",
    solution:
      'async function withTimeout(task, ms) {\n  const alarm = new Promise((_, reject) =>\n    setTimeout(() => reject(new Error("timeout")), ms),\n  );\n  return Promise.race([task(), alarm]);\n}',
    seconds: 95,
  }),

  rep({
    id: "r.conc.1",
    lesson: "l11.6",
    teaches: ["js.async.concurrency"],
    title: "Sequential map",
    prompt:
      "Apply the async `worker` to every item **one at a time**, and return the results in order.",
    exportName: "mapSeries",
    starter: "async function mapSeries(items, worker) {\n  \n}",
    tests: [
      {
        name: "maps in order",
        code: `expect(await fn([1, 2, 3], async (n) => n * 2)).toEqual([2, 4, 6]);`,
      },
      {
        name: "never overlaps",
        code: `let live = 0;
let peak = 0;
await fn([1, 2, 3], async () => {
  live += 1;
  peak = Math.max(peak, live);
  await new Promise((r) => setTimeout(r, 5));
  live -= 1;
});
expect(peak).toBe(1);`,
      },
      { name: "empty list", code: `expect(await fn([], async (n) => n)).toEqual([]);` },
    ],
    hint: "A `for...of` loop with `await worker(item)` inside — here the waiting is the point.",
    solution:
      "async function mapSeries(items, worker) {\n  const out = [];\n  for (const item of items) {\n    out.push(await worker(item));\n  }\n  return out;\n}",
    seconds: 70,
  }),
  rep({
    id: "r.conc.2",
    lesson: "l11.6",
    teaches: ["js.async.concurrency"],
    title: "Parallel map",
    prompt:
      "Same signature, opposite behaviour: start every item at once and return the results in input order.",
    exportName: "mapParallel",
    starter: "async function mapParallel(items, worker) {\n  \n}",
    tests: [
      {
        name: "maps in order",
        code: `expect(await fn([1, 2, 3], async (n) => n * 2)).toEqual([2, 4, 6]);`,
      },
      {
        name: "they all overlap",
        code: `let live = 0;
let peak = 0;
await fn([1, 2, 3], async () => {
  live += 1;
  peak = Math.max(peak, live);
  await new Promise((r) => setTimeout(r, 5));
  live -= 1;
});
expect(peak).toBe(3);`,
      },
    ],
    hint: "`Promise.all(items.map(item => worker(item)))` — the `map` starts them, `all` collects them in order.",
    solution:
      "async function mapParallel(items, worker) {\n  return Promise.all(items.map((item) => worker(item)));\n}",
    seconds: 55,
  }),
  rep({
    id: "r.conc.3",
    lesson: "l11.6",
    teaches: ["js.async.concurrency"],
    title: "A bounded pool",
    prompt:
      "Run `worker` over every item with **at most `limit` in flight at once**, and return the results in input order.\n\nA runner that finishes early must pick up the next item immediately — don't process in fixed batches.",
    exportName: "pool",
    starter: "async function pool(items, worker, limit) {\n  \n}",
    tests: [
      {
        name: "results in input order",
        code: `expect(await fn([1, 2, 3, 4], async (n) => n * 2, 2)).toEqual([2, 4, 6, 8]);`,
      },
      {
        name: "never exceeds the limit",
        code: `let live = 0;
let peak = 0;
await fn([1, 2, 3, 4, 5, 6], async () => {
  live += 1;
  peak = Math.max(peak, live);
  await new Promise((r) => setTimeout(r, 5));
  live -= 1;
}, 2);
expect(peak).toBe(2);`,
      },
      {
        name: "uses the full limit",
        code: `let peak = 0;
let live = 0;
await fn([1, 2, 3, 4, 5, 6], async () => {
  live += 1;
  peak = Math.max(peak, live);
  await new Promise((r) => setTimeout(r, 5));
  live -= 1;
}, 3);
expect(peak).toBe(3);`,
      },
      { name: "empty list", code: `expect(await fn([], async (n) => n, 2)).toEqual([]);` },
    ],
    hint: "Start `limit` runners that each loop, claiming the next index with `const i = next++` and writing to `results[i]`. Then await all the runners.",
    solution:
      "async function pool(items, worker, limit) {\n  const results = new Array(items.length);\n  let next = 0;\n  async function run() {\n    while (next < items.length) {\n      const i = next++;\n      results[i] = await worker(items[i], i);\n    }\n  }\n  await Promise.all(Array.from({ length: limit }, run));\n  return results;\n}",
    seconds: 180,
  }),
];

export const M11_LESSONS: Lesson[] = [
  {
    id: "l11.1",
    moduleId: "m11",
    title: "The event loop",
    goal: "Know why `setTimeout(fn, 0)` runs last, and why promises jump ahead of timers.",
    atomId: "teach.event-loop",
    repIds: ["r.evt.1", "r.evt.2", "r.evt.3"],
    problemIds: [],
  },
  {
    id: "l11.2",
    moduleId: "m11",
    title: "Promises",
    goal: "Three states, one settlement, and chains that flatten instead of nesting.",
    atomId: "teach.promises",
    repIds: ["r.prom.1", "r.prom.2", "r.prom.3"],
    problemIds: [],
  },
  {
    id: "l11.3",
    moduleId: "m11",
    title: "async and await",
    goal: "Flat async code — and spotting the await-in-a-loop that costs you ten times the wait.",
    atomId: "teach.await",
    repIds: ["r.await.1", "r.await.2", "r.await.3"],
    problemIds: [],
  },
  {
    id: "l11.4",
    moduleId: "m11",
    title: "Error handling",
    goal: "try/catch that actually catches, cleanup that always runs, and rethrowing what isn't yours.",
    atomId: "teach.async-errors",
    repIds: ["r.aerr.1", "r.aerr.2", "r.aerr.3"],
    problemIds: [],
  },
  {
    id: "l11.5",
    moduleId: "m11",
    title: "Promise.all and friends",
    goal: "Pick between all, allSettled, race and any by what should happen when one fails.",
    atomId: "teach.combinators",
    repIds: ["r.comb.1", "r.comb.2", "r.comb.3"],
    problemIds: ["p.promise-all"],
  },
  {
    id: "l11.6",
    moduleId: "m11",
    title: "Controlling concurrency",
    goal: "Sequential, parallel, or pooled — and a worker pool you can write from memory.",
    atomId: "teach.concurrency",
    repIds: ["r.conc.1", "r.conc.2", "r.conc.3"],
    problemIds: [],
  },
];

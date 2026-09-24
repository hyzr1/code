import type { Atom, Lesson, Problem } from "../../types";
import { rep, stub } from "../rep";

/**
 * M10 — `this`, classes, prototypes.
 *
 * The module people skip and then get caught by, because `this` is the one
 * rule in JavaScript decided entirely at the call site rather than where the
 * code is written. Everything here is built around that single sentence.
 */
export const M10_ATOMS: Atom[] = [
  {
    id: "teach.this",
    title: "`this` and the call site",
    teaches: ["js.functions.this"],
    requires: ["js.object.access", "js.functions.arrow"],
    readingSeconds: 190,
    recall:
      "`const g = obj.greet; g();` — why does `this` break, when `obj.greet()` works?",
    body: `\`this\` is a word inside a function that means "the object I was called on".

The rule that makes it confusing is short, and it is the whole lesson:

**\`this\` is not decided by where the function is written. It is decided by how it is called.**

Read that twice. Every \`this\` bug you will ever have comes from assuming the opposite.

## The one that works

\`\`\`js
const user = {
  name: "Ada",
  greet() {
    return "hi " + this.name;   // this === user
  },
};

user.greet();   // "hi Ada"
\`\`\`

Look at the call: \`user.greet()\`. There is a dot, and \`user\` is on the left of it. **Whatever sits to the left of the dot becomes \`this\`.** That's the entire mechanism for method calls.

## The one that breaks

\`\`\`js
const grab = user.greet;   // no call yet — just the function itself
grab();                    // TypeError: Cannot read properties of undefined
\`\`\`

\`user.greet\` doesn't hand you "the greet method of user". It hands you a plain function, with no memory of where it came from. The \`user.\` part was never stored inside it — it only existed for the duration of that one call.

So when you call \`grab()\` there is nothing to the left of a dot. \`this\` is \`undefined\`, and reading \`.name\` off \`undefined\` throws.

This is not a rare edge case. It's what happens every time you pass a method somewhere:

\`\`\`js
setTimeout(user.greet, 100);        // broken — same detachment
button.addEventListener("click", user.greet);   // broken
[1, 2].map(user.greet);             // broken
\`\`\`

Each one passes the bare function. Each one loses \`this\`.

## The four call forms

There are only four ways \`this\` gets set, and you now know two of them.

\`\`\`js
user.greet();          // 1 — dot call, so this is user
grab();                // 2 — plain call, so this is undefined
new User("Ada");       // 3 — new, so this is the fresh object
grab.call(user);       // 4 — explicit, so this is whatever you pass
\`\`\`

Form 3 is classes, which is the next-but-one lesson. Form 4 is the next lesson. Forms 1 and 2 cover almost everything you'll read.

One note on form 2: in a module or under \`"use strict"\` — which is everything you'll write — \`this\` is \`undefined\`. In old non-strict scripts it was the global object instead, which turned a loud crash into a silent wrong answer. That's why the change was made, and why you'll see confused older advice about it.

## Arrow functions: the exception that fixes it

An arrow function **has no \`this\` of its own.** It doesn't get one, ever. When you write \`this\` inside an arrow, JavaScript looks outward to the enclosing function, exactly as it would for any ordinary variable.

That is what makes arrows the fix for callbacks:

\`\`\`js
const team = {
  prefix: "hi",
  names: ["Ada", "Grace"],
  all() {
    // the arrow has no this, so this is still team
    return this.names.map((n) => this.prefix + " " + n);
  },
};

team.all();   // ["hi Ada", "hi Grace"]
\`\`\`

Written as \`function (n) { ... }\` instead, that callback would be a **plain call** made by \`map\` — form 2 — and \`this.prefix\` would throw. The arrow sidesteps the question by never having a \`this\` to lose.

The same property makes arrows **wrong** as object methods:

\`\`\`js
const broken = {
  name: "Ada",
  // no this of its own, so it looks outside the object entirely
  greet: () => "hi " + this.name,
};

broken.greet();   // "hi undefined"
\`\`\`

There's no error, just a wrong answer, which is worse. An object literal is not a function, so there is no enclosing \`this\` to inherit — it reaches past the object to whatever the file's \`this\` is.

**Method on an object: use \`greet() {}\`. Callback inside a method: use an arrow.** Those two rules cover it.

## Fixing a detached method right now

Until the next lesson gives you \`bind\`, the honest fix is to keep the dot inside a wrapper:

\`\`\`js
// the call stays together, so this is still set
setTimeout(() => user.greet(), 100);
\`\`\`

The arrow is passed instead of the method. When it eventually runs, it performs \`user.greet()\` — a dot call — and \`this\` is \`user\` again.`,
  },
  {
    id: "teach.bind",
    title: "call, apply and bind",
    teaches: ["js.functions.binding"],
    requires: ["js.functions.this"],
    readingSeconds: 165,
    recall:
      "What does `bind` return, and what is the one thing it never does?",
    body: `Three methods let you set \`this\` yourself instead of relying on the call site. Every function has them.

\`\`\`js
function greet(greeting) {
  return greeting + " " + this.name;
}

const user = { name: "Ada" };

greet.call(user, "hi");     // "hi Ada"   — args listed
greet.apply(user, ["hi"]);  // "hi Ada"   — args in an array
const bound = greet.bind(user);
bound("hi");                // "hi Ada"   — new function, called later
\`\`\`

## call vs apply

They are the same function with different argument packaging.

\`\`\`js
greet.call(user, "hi");       // one by one
greet.apply(user, ["hi"]);    // as an array
\`\`\`

**A for apply, A for array.** That mnemonic is the only thing you need to keep them straight.

Both **call immediately**. The first argument is the \`this\` you want; everything after is the normal arguments.

Since spread arrived, \`apply\` is mostly historical. \`fn.apply(null, list)\` was the only way to pass an array as separate arguments, so you'll still meet it in older code:

\`\`\`js
Math.max.apply(null, [3, 1, 4]);   // 4 — the old way
Math.max(...[3, 1, 4]);            // 4 — the way you'd write it now
\`\`\`

The \`null\` there is "I don't care about \`this\`", which \`Math.max\` genuinely doesn't.

## bind is different, and this is the important part

**\`bind\` does not call the function. It returns a new one.**

\`\`\`js
const bound = greet.bind(user);   // nothing has run yet
bound("hi");                      // now it runs
\`\`\`

That's the single most common mistake with it — writing \`greet.bind(user)\` where you meant \`greet.call(user)\` and wondering why nothing happened. \`call\` and \`apply\` are verbs. \`bind\` is a factory.

The returned function has \`this\` welded on permanently. Nothing can change it back — not a dot call, not another \`bind\`, not \`call\`:

\`\`\`js
const other = { name: "Grace" };
bound.call(other, "hi");   // still "hi Ada" — the first bind wins
\`\`\`

That permanence is the point. It's why \`bind\` is the tool for handing a method to someone else:

\`\`\`js
setTimeout(user.greet.bind(user), 100);   // survives the detachment
\`\`\`

## Presetting arguments

Any arguments you pass to \`bind\` after the \`this\` are locked in as the **first** arguments of every call:

\`\`\`js
function add(a, b) {
  return a + b;
}

const add10 = add.bind(null, 10);
add10(5);    // 15 — the 10 was already there
add10(1);    // 11
\`\`\`

This is called **partial application**: fixing some arguments now and supplying the rest later. It is the same idea as the factory functions from the closures module, reached from the other direction — and in modern code an arrow usually reads better:

\`\`\`js
const add10 = (b) => add(10, b);
\`\`\`

Use \`bind\` when you specifically need to fix \`this\`. Use an arrow when you only need to fix arguments.

## Arrows ignore all three

An arrow has no \`this\` of its own, so there is nothing to set:

\`\`\`js
const arrow = () => this;
// binding an arrow silently does nothing at all
arrow.call({ name: "Ada" });   // unchanged
\`\`\`

No error, no effect. If a \`bind\` seems to be ignored, check whether you bound an arrow.`,
  },
  {
    id: "teach.classes",
    title: "Classes",
    teaches: ["js.classes"],
    requires: ["js.functions.this", "js.object.access"],
    readingSeconds: 180,
    recall:
      "What does `new` actually do, in the three steps that matter?",
    body: `A **class** is a template for making objects that share the same shape and the same methods.

\`\`\`js
class Counter {
  constructor(start) {
    this.value = start;   // this is the new object being built
  }

  increment() {
    this.value += 1;
    return this.value;
  }
}

const c = new Counter(10);
c.increment();   // 11
c.value;         // 11
\`\`\`

## What \`new\` does

Three steps, and knowing them removes most of the mystery:

1. It creates a fresh empty object.
2. It calls \`constructor\` with \`this\` set to that object — call form 3 from the \`this\` lesson.
3. It returns the object automatically. You never write \`return\` in a constructor.

Forget the \`new\` and step 1 never happens, so \`this\` is \`undefined\` and the constructor throws immediately. That loud failure is deliberate; older constructor functions would silently write onto the global object instead.

## Fields

You can declare properties directly, without a constructor:

\`\`\`js
class Counter {
  value = 0;        // every instance starts with its own copy

  increment() {
    this.value += 1;
    return this.value;
  }
}
\`\`\`

Use a constructor when the starting value depends on an argument; use a field when it's always the same.

## Private fields

A \`#\` prefix makes something genuinely unreachable from outside — not a convention, an enforced rule:

\`\`\`js
class Counter {
  #value = 0;      // truly private

  increment() {
    this.#value += 1;
    return this.#value;
  }
}

const c = new Counter();
c.increment();   // 1
c.value;         // undefined — that property doesn't exist
\`\`\`

Reaching for \`c.#value\` from outside isn't a runtime error you can catch; it won't even parse. This is the class-shaped version of the private state you built with closures in M9 — same guarantee, different syntax.

## Getters

A getter is a method you read like a property:

\`\`\`js
class Rect {
  constructor(w, h) {
    this.w = w;
    this.h = h;
  }

  // called on read, never stored
  get area() {
    return this.w * this.h;
  }
}

const r = new Rect(3, 4);
r.area;    // 12 — no parentheses
\`\`\`

Note the missing \`()\`. \`r.area()\` would throw, because \`r.area\` is already the number \`12\` and numbers aren't callable.

A getter recomputes every time it's read, so it can never go stale when \`w\` changes. That's what it's for. Keep them cheap — code that reads like a property should not be doing real work.

## Static

\`static\` puts something on the class itself rather than on instances:

\`\`\`js
class Temperature {
  // belongs to the class, not to any one temperature
  static fromF(f) {
    return new Temperature((f - 32) / 1.8);
  }

  constructor(c) {
    this.c = c;
  }
}

Temperature.fromF(212).c;   // 100
\`\`\`

The usual job for a static method is an alternative constructor — a named way to build an instance when \`new Thing(...)\` alone wouldn't say what the arguments mean.

## Checking type

\`\`\`js
const c = new Counter();
c instanceof Counter;   // true
typeof c;               // "object" — typeof is no help here
\`\`\`

\`typeof\` only knows the seven built-in types, so every object of every class is just \`"object"\`. \`instanceof\` is the question you actually meant.

## One honest caveat

\`this\` inside a class method follows exactly the same rules as everywhere else. A method is still just a function, so detaching it still breaks it:

\`\`\`js
const inc = c.increment;
inc();   // TypeError — no dot, no this
\`\`\`

Classes change none of that. Bind it, or wrap it in an arrow.`,
  },
  {
    id: "teach.prototypes",
    title: "Prototypes and the chain",
    teaches: ["js.prototypes"],
    requires: ["js.classes"],
    readingSeconds: 175,
    recall:
      "Ten instances of a class exist. How many copies of one of its methods exist, and why?",
    body: `Classes are a convenience. Underneath, JavaScript has exactly one mechanism for sharing behaviour: **every object has a hidden link to another object, and unfound properties are looked for there.**

That linked object is its **prototype**, and the sequence of links is the **prototype chain**.

## The lookup

\`\`\`js
const c = new Counter();
c.increment();
\`\`\`

Reading \`c.increment\` runs a search:

1. Does \`c\` itself have an \`increment\`? No.
2. Does its prototype — \`Counter.prototype\` — have one? Yes. Use that.

If step 2 had failed it would try that object's prototype, then the next, until it reaches \`null\` and the answer is \`undefined\`. That's the whole chain: a linked list of fallbacks, walked on every property read that misses.

\`\`\`js
Object.getPrototypeOf(c) === Counter.prototype;   // true
\`\`\`

## Why methods aren't copied

This is the payoff, and the thing worth remembering:

\`\`\`js
const a = new Counter();
const b = new Counter();
a.increment === b.increment;   // true — the same function object
\`\`\`

Class methods live on \`Counter.prototype\`, not on the instances. Ten thousand counters share **one** \`increment\`. If methods were copied per instance you'd have ten thousand identical functions in memory.

Class **fields** are the opposite — they're assigned onto each instance by the constructor, so each gets its own:

\`\`\`js
a.value = 5;
b.value;   // unchanged — separate properties
\`\`\`

That difference explains a trade you'll meet in React code:

\`\`\`js
class Button {
  // an arrow field: own copy per instance, but this is permanently correct
  handle = () => this.label;
}
\`\`\`

An arrow written as a field is created fresh inside each constructor call, so it closes over that instance's \`this\` and can never be detached wrongly. The cost is one function per instance instead of one shared. For a handful of components that's nothing; it's a real cost only at scale.

## Own vs inherited

\`\`\`js
Object.keys(c);              // ["value"] — own properties only
"increment" in c;            // true — the chain counts
Object.hasOwn(c, "value");   // true
\`\`\`

\`Object.keys\`, \`Object.values\`, \`Object.entries\` and spread all look at **own** properties and ignore the chain. \`in\` and plain property reads walk it. That split is why iterating an object never accidentally hands you \`toString\`.

## Where \`toString\` comes from

Every plain object's chain ends the same way:

\`\`\`js
const o = {};
o.toString;   // a function, and you never wrote it
\`\`\`

\`o\` → \`Object.prototype\` → \`null\`. \`Object.prototype\` carries \`toString\`, \`hasOwnProperty\` and a few others, which is why every object appears to have them.

Arrays add one more link: an array → \`Array.prototype\` (where \`map\`, \`filter\`, \`push\` live) → \`Object.prototype\` → \`null\`. \`map\` was never on your array; it was two steps away the whole time.

## The clean dictionary

Sometimes that inheritance is a liability — using an object as a lookup table where keys come from data:

\`\`\`js
const counts = {};
counts["toString"];   // a function, not undefined — a key you never set
\`\`\`

A key that collides with something on \`Object.prototype\` gives you a surprise instead of \`undefined\`. Two fixes:

\`\`\`js
const clean = Object.create(null);   // no prototype at all
clean.toString;                      // undefined — nothing inherited
\`\`\`

or use a \`Map\`, which has no chain to collide with and is the better answer nearly every time. This is the same warning from the Map lesson, now with the reason underneath it.

## Don't extend the built-ins

\`\`\`js
// never do this
Array.prototype.last = function () {
  return this[this.length - 1];
};
\`\`\`

It works, and it makes \`last\` appear on every array in the program — including arrays created by libraries that didn't ask for it. Two libraries defining it differently is an unfixable conflict. Write a plain function instead.`,
  },
  {
    id: "teach.inheritance",
    title: "Inheritance vs composition",
    teaches: ["js.inheritance"],
    requires: ["js.prototypes"],
    readingSeconds: 165,
    recall:
      "What breaks first when an inheritance hierarchy gets deep, and what do you reach for instead?",
    body: `\`extends\` links one class's prototype to another's, so instances fall back through both.

\`\`\`js
class Animal {
  constructor(name) {
    this.name = name;
  }
  speak() {
    return this.name + " makes a sound";
  }
}

class Dog extends Animal {
  speak() {
    return this.name + " barks";   // overrides the one above
  }
}

new Dog("Rex").speak();   // "Rex barks"
\`\`\`

The chain is now \`instance\` → \`Dog.prototype\` → \`Animal.prototype\` → \`Object.prototype\` → \`null\`. Lookup walks it in order and stops at the first hit, which is exactly what "overriding" means — the nearer definition is found first, and the further one is never reached.

## super

If a subclass writes its own constructor it **must** call \`super\` before touching \`this\`:

\`\`\`js
class Dog extends Animal {
  constructor(name, breed) {
    super(name);        // runs Animal's constructor
    this.breed = breed; // only legal after super
  }
}
\`\`\`

The order isn't a style rule. The parent constructor is what creates and prepares the object, so before \`super\` runs there is genuinely no \`this\` yet — reading it throws a \`ReferenceError\`.

\`super.method()\` also works inside methods, and calls the parent's version:

\`\`\`js
speak() {
  return super.speak() + ", loudly";
}
\`\`\`

## Where this goes wrong

Inheritance says **is-a**. A dog is an animal, so the link is honest. The trouble starts when you use it to share code rather than to describe a relationship.

Deep hierarchies fail in three predictable ways:

**One dimension only.** A class has exactly one parent. The moment you need \`FlyingAnimal\` and \`SwimmingAnimal\` and something that does both, you're stuck — and duplicating a branch is usually what happens next.

**Distant effects.** Changing \`Animal.speak\` changes every subclass, including ones you've never opened. There's no local reasoning left.

**Reading it requires the whole tree.** To know what \`Dog\` does you must read \`Dog\`, \`Animal\`, and anything between. Four levels in, nobody knows where a method actually comes from.

## Composition

Composition says **has-a**. Instead of inheriting behaviour, hold the thing that has it:

\`\`\`js
class Engine {
  start() {
    return "vroom";
  }
}

class Car {
  constructor() {
    // a car has an engine; it is not a kind of engine
    this.engine = new Engine();
  }
  start() {
    return this.engine.start();
  }
}
\`\`\`

More typing, and it wins anyway. A \`Car\` can hold an engine *and* a radio *and* a gearbox — no single-parent limit. Swapping in a different engine is one line. \`Car.start\` names exactly what it does, in the file you're already reading.

The functional version needs no classes at all — a function that takes what it needs is composition too, and M9's wrappers were this idea already.

## The rule

**Use \`extends\` when the subclass genuinely is a kind of the parent and the hierarchy is one or two levels deep. Use composition for everything else.**

You'll meet inheritance constantly when extending a framework's base class, which is the case it fits. In your own code, reach for composition first — it's the choice that stays reversible.`,
  },
];

export const M10_REPS: Problem[] = [
  rep({
    id: "r.this.1",
    lesson: "l10.1",
    teaches: ["js.functions.this"],
    title: "A method that reads its own object",
    prompt:
      "Return an object with a `name` property and a `label()` method that returns `\"I am \"` followed by that name.",
    exportName: "makeLabel",
    starter: stub("makeLabel", "name"),
    tests: [
      { name: "reads its own name", code: `expect(fn("Ada").label()).toBe("I am Ada");` },
      { name: "each object is separate", code: `expect(fn("Grace").label()).toBe("I am Grace");` },
    ],
    hint: "Inside `label()`, `this` is whatever sits left of the dot when it's called — so `this.name`.",
    solution:
      'function makeLabel(name) {\n  return {\n    name,\n    label() {\n      return "I am " + this.name;\n    },\n  };\n}',
    mistakes: [
      {
        match: "label: () =>",
        hint: "An arrow has no `this` of its own, so it looks past the object entirely. Use the `label() {}` method form.",
      },
    ],
    seconds: 60,
  }),
  rep({
    id: "r.this.2",
    lesson: "l10.1",
    teaches: ["js.functions.this"],
    title: "Don't lose this",
    prompt:
      "`obj` has a `get()` method that returns `this.value`. Return a function that can be stored and called later and still gives the right answer.\n\nReturning `obj.get` itself would break — the dot is what sets `this`.",
    exportName: "later",
    starter: stub("later", "obj"),
    tests: [
      {
        name: "works when called later",
        code: `const obj = { value: 7, get() { return this.value; } };
expect(fn(obj)()).toBe(7);`,
      },
      {
        name: "survives being stored in a variable",
        code: `const obj = { value: 3, get() { return this.value; } };
const g = fn(obj);
expect(g()).toBe(3);`,
      },
      {
        name: "sees later changes to the object",
        code: `const obj = { value: 1, get() { return this.value; } };
const g = fn(obj);
obj.value = 9;
expect(g()).toBe(9);`,
      },
    ],
    hint: "Keep the call together inside an arrow: `() => obj.get()`. The dot survives because it happens at call time.",
    solution: "function later(obj) {\n  return () => obj.get();\n}",
    mistakes: [
      {
        match: "return obj.get;",
        hint: "That hands back the bare function. The `obj.` part was never stored inside it, so `this` is `undefined` when it runs.",
      },
    ],
    seconds: 70,
  }),
  rep({
    id: "r.this.3",
    lesson: "l10.1",
    teaches: ["js.functions.this", "js.array.map"],
    title: "Arrow inside a method",
    prompt:
      "Return an object holding a `prefix` and a list of `names`, with an `all()` method that returns each name with the prefix in front.\n\n`all` must read the prefix off the object, not off a captured variable.",
    exportName: "makeGreeter",
    starter: stub("makeGreeter", "prefix, names"),
    tests: [
      {
        name: "prefixes every name",
        code: `expect(fn("hi", ["Ada", "Grace"]).all()).toEqual(["hi Ada", "hi Grace"]);`,
      },
      { name: "empty list", code: `expect(fn("hi", []).all()).toEqual([]);` },
      {
        name: "reads the prefix off the object",
        code: `const g = fn("hi", ["Ada"]);
g.prefix = "yo";
expect(g.all()).toEqual(["yo Ada"]);`,
      },
    ],
    hint: "`all() { return this.names.map(n => this.prefix + \" \" + n); }` — the arrow has no `this`, so `this` is still the object.",
    solution:
      'function makeGreeter(prefix, names) {\n  return {\n    prefix,\n    names,\n    all() {\n      return this.names.map((n) => this.prefix + " " + n);\n    },\n  };\n}',
    seconds: 80,
  }),

  rep({
    id: "r.bind.1",
    lesson: "l10.2",
    teaches: ["js.functions.binding"],
    title: "Borrow a method",
    prompt:
      "Call `method` with `this` set to `owner` and the given array of arguments, and return the result.",
    exportName: "borrow",
    starter: stub("borrow", "method, owner, args"),
    tests: [
      {
        name: "sets this and passes args",
        code: `function greet(g) { return g + " " + this.name; }
expect(fn(greet, { name: "Ada" }, ["hi"])).toBe("hi Ada");`,
      },
      {
        name: "works with no arguments",
        code: `function who() { return this.name; }
expect(fn(who, { name: "Grace" }, [])).toBe("Grace");`,
      },
    ],
    hint: "A for apply, A for array — the arguments already come as one.",
    solution:
      "function borrow(method, owner, args) {\n  return method.apply(owner, args);\n}",
    seconds: 50,
  }),
  rep({
    id: "r.bind.2",
    lesson: "l10.2",
    teaches: ["js.functions.binding"],
    title: "Weld it on",
    prompt:
      "Return `obj.get` as a standalone function that keeps working no matter how it's called — including through `call` with a different object.",
    exportName: "welded",
    starter: stub("welded", "obj"),
    tests: [
      {
        name: "works detached",
        code: `const obj = { value: 7, get() { return this.value; } };
expect(fn(obj)()).toBe(7);`,
      },
      {
        name: "cannot be re-pointed",
        code: `const obj = { value: 7, get() { return this.value; } };
expect(fn(obj).call({ value: 99 })).toBe(7);`,
      },
    ],
    hint: "`bind` returns a new function with `this` welded on permanently — nothing can change it back.",
    solution: "function welded(obj) {\n  return obj.get.bind(obj);\n}",
    mistakes: [
      {
        match: "obj.get.call(obj)",
        hint: "`call` runs it now and returns the answer. You need a function back, which is what `bind` gives you.",
      },
    ],
    seconds: 55,
  }),
  rep({
    id: "r.bind.3",
    lesson: "l10.2",
    teaches: ["js.functions.binding"],
    title: "Preset the first arguments",
    prompt:
      "Return a version of `fn` with `preset` already supplied as its leading arguments. `this` doesn't matter here.",
    exportName: "partial",
    starter: "function partial(target, ...preset) {\n  \n}",
    tests: [
      {
        name: "presets one argument",
        code: `const add = (a, b) => a + b;
expect(fn(add, 10)(5)).toBe(15);`,
      },
      {
        name: "presets two",
        code: `const sum3 = (a, b, c) => a + b + c;
expect(fn(sum3, 1, 2)(3)).toBe(6);`,
      },
      {
        name: "presets none",
        code: `const add = (a, b) => a + b;
expect(fn(add)(1, 2)).toBe(3);`,
      },
    ],
    hint: "`target.bind(null, ...preset)` — `null` says you don't care about `this`, and everything after is locked in front.",
    solution:
      "function partial(target, ...preset) {\n  return target.bind(null, ...preset);\n}",
    seconds: 65,
  }),

  rep({
    id: "r.class.1",
    lesson: "l10.3",
    teaches: ["js.classes"],
    title: "Your first class",
    prompt:
      "Define a `Counter` class that starts at a given number, has an `increment()` method returning the new value, and exposes the current number as `.value`. Return a new instance.",
    exportName: "makeCounter",
    starter: stub("makeCounter", "start"),
    tests: [
      {
        name: "starts where told",
        code: `expect(fn(10).value).toBe(10);`,
      },
      {
        name: "increments and returns",
        code: `const c = fn(0);
expect(c.increment()).toBe(1);
expect(c.value).toBe(1);`,
      },
      {
        name: "instances are independent",
        code: `const a = fn(0);
const b = fn(0);
a.increment();
expect(b.value).toBe(0);`,
      },
    ],
    hint: "Declare the class inside the function, then `return new Counter(start);`. The constructor assigns `this.value = start`.",
    solution:
      "function makeCounter(start) {\n  class Counter {\n    constructor(value) {\n      this.value = value;\n    }\n    increment() {\n      this.value += 1;\n      return this.value;\n    }\n  }\n  return new Counter(start);\n}",
    mistakes: [
      {
        match: "return Counter(",
        hint: "Without `new` there's no fresh object, so `this` is `undefined` and the constructor throws.",
      },
    ],
    seconds: 90,
  }),
  rep({
    id: "r.class.2",
    lesson: "l10.3",
    teaches: ["js.classes"],
    title: "A getter",
    prompt:
      "Return a rectangle object built from a class, with `w`, `h`, and an `area` **getter** — read as `r.area`, with no parentheses.",
    exportName: "makeRect",
    starter: stub("makeRect", "w, h"),
    tests: [
      { name: "computes area", code: `expect(fn(3, 4).area).toBe(12);` },
      {
        name: "recomputes when a side changes",
        code: `const r = fn(3, 4);
r.w = 5;
expect(r.area).toBe(20);`,
      },
    ],
    hint: "`get area() { return this.w * this.h; }` — a getter runs on every read, so it can never go stale.",
    solution:
      "function makeRect(w, h) {\n  class Rect {\n    constructor(w, h) {\n      this.w = w;\n      this.h = h;\n    }\n    get area() {\n      return this.w * this.h;\n    }\n  }\n  return new Rect(w, h);\n}",
    seconds: 70,
  }),
  rep({
    id: "r.class.3",
    lesson: "l10.3",
    teaches: ["js.classes"],
    title: "Genuinely private",
    prompt:
      "Return a counter whose running total cannot be read or written from outside. Only `increment()` and `read()` may touch it.",
    exportName: "makePrivateCounter",
    starter: stub("makePrivateCounter", ""),
    tests: [
      {
        name: "counts",
        code: `const c = fn();
c.increment();
c.increment();
expect(c.read()).toBe(2);`,
      },
      {
        name: "the total is not a visible property",
        code: `const c = fn();
c.increment();
expect(Object.values(c).includes(1)).toBe(false);`,
      },
      {
        name: "starts at zero",
        code: `expect(fn().read()).toBe(0);`,
      },
    ],
    hint: "A `#count = 0;` field. The `#` is enforced by the language, not a naming convention.",
    solution:
      "function makePrivateCounter() {\n  class Counter {\n    #count = 0;\n    increment() {\n      this.#count += 1;\n      return this.#count;\n    }\n    read() {\n      return this.#count;\n    }\n  }\n  return new Counter();\n}",
    seconds: 80,
  }),

  rep({
    id: "r.proto.1",
    lesson: "l10.4",
    teaches: ["js.prototypes"],
    title: "One method, shared",
    prompt:
      "Make two instances of the same class and return `true` if they share the exact same function object for a method.\n\nThis is the question \"is the method on the prototype or on the instance?\"",
    exportName: "sharesMethod",
    starter: stub("sharesMethod", ""),
    tests: [{ name: "class methods are shared", code: `expect(fn()).toBe(true);` }],
    hint: "Define a class with any method, make two instances, and compare `a.method === b.method` with `===`.",
    solution:
      "function sharesMethod() {\n  class Thing {\n    speak() {\n      return \"hi\";\n    }\n  }\n  const a = new Thing();\n  const b = new Thing();\n  return a.speak === b.speak;\n}",
    seconds: 60,
  }),
  rep({
    id: "r.proto.2",
    lesson: "l10.4",
    teaches: ["js.prototypes"],
    title: "Own or inherited",
    prompt:
      "Return `true` only when `key` is the object's **own** property. Something reachable through the prototype chain doesn't count.",
    exportName: "isOwn",
    starter: stub("isOwn", "obj, key"),
    tests: [
      { name: "own property", code: `expect(fn({ a: 1 }, "a")).toBe(true);` },
      { name: "missing key", code: `expect(fn({ a: 1 }, "b")).toBe(false);` },
      {
        name: "inherited does not count",
        code: `expect(fn({ a: 1 }, "toString")).toBe(false);`,
      },
      {
        name: "own value of undefined still counts",
        code: `expect(fn({ a: undefined }, "a")).toBe(true);`,
      },
    ],
    hint: "`Object.hasOwn(obj, key)`. Note that `key in obj` and `obj[key] !== undefined` both give the wrong answer on one of these tests.",
    solution: "function isOwn(obj, key) {\n  return Object.hasOwn(obj, key);\n}",
    mistakes: [
      {
        match: "key in obj",
        hint: "`in` walks the prototype chain, so `\"toString\" in obj` is `true` for every object.",
      },
    ],
    seconds: 60,
  }),
  rep({
    id: "r.proto.3",
    lesson: "l10.4",
    teaches: ["js.prototypes"],
    title: "A dictionary with no surprises",
    prompt:
      "Return an object usable as a lookup table where **no** key is inherited — reading `\"toString\"` off it must give `undefined`.",
    exportName: "cleanDict",
    starter: stub("cleanDict", ""),
    tests: [
      { name: "nothing inherited", code: `expect(fn().toString).toBe(undefined);` },
      { name: "in reports nothing either", code: `expect("toString" in fn()).toBe(false);` },
      {
        name: "still works as a normal object",
        code: `const d = fn();
d.a = 1;
expect(d.a).toBe(1);`,
      },
    ],
    hint: "`Object.create(null)` builds an object whose prototype is `null` — the chain ends immediately.",
    solution: "function cleanDict() {\n  return Object.create(null);\n}",
    seconds: 50,
  }),

  rep({
    id: "r.inh.1",
    lesson: "l10.5",
    teaches: ["js.inheritance"],
    title: "extends and super",
    prompt:
      "Build a `Dog` that extends an `Animal`. `Animal` stores a `name`; `Dog` also stores a `breed` and overrides `speak()` to return `\"<name> barks\"`. Return a new dog.",
    exportName: "makeDog",
    starter: stub("makeDog", "name, breed"),
    tests: [
      { name: "overrides speak", code: `expect(fn("Rex", "lab").speak()).toBe("Rex barks");` },
      { name: "keeps its own field", code: `expect(fn("Rex", "lab").breed).toBe("lab");` },
      { name: "inherits the parent field", code: `expect(fn("Rex", "lab").name).toBe("Rex");` },
    ],
    hint: "`super(name)` must run before you touch `this` — the parent constructor is what creates the object.",
    solution:
      'function makeDog(name, breed) {\n  class Animal {\n    constructor(name) {\n      this.name = name;\n    }\n    speak() {\n      return this.name + " makes a sound";\n    }\n  }\n  class Dog extends Animal {\n    constructor(name, breed) {\n      super(name);\n      this.breed = breed;\n    }\n    speak() {\n      return this.name + " barks";\n    }\n  }\n  return new Dog(name, breed);\n}',
    mistakes: [
      {
        match: "this.breed = breed;\n      super(",
        hint: "Before `super` runs there is no `this` yet — reading or writing it throws a ReferenceError.",
      },
    ],
    seconds: 100,
  }),
  rep({
    id: "r.inh.2",
    lesson: "l10.5",
    teaches: ["js.inheritance"],
    title: "Extend, don't replace",
    prompt:
      "A `Loud` subclass whose `speak()` returns the parent's sentence with `\", loudly\"` on the end. Don't copy the parent's wording — call it.",
    exportName: "makeLoud",
    starter: stub("makeLoud", "name"),
    tests: [
      {
        name: "builds on the parent",
        code: `expect(fn("Rex").speak()).toBe("Rex makes a sound, loudly");`,
      },
    ],
    hint: "`super.speak()` calls the parent's version from inside the override.",
    solution:
      'function makeLoud(name) {\n  class Animal {\n    constructor(name) {\n      this.name = name;\n    }\n    speak() {\n      return this.name + " makes a sound";\n    }\n  }\n  class Loud extends Animal {\n    speak() {\n      return super.speak() + ", loudly";\n    }\n  }\n  return new Loud(name);\n}',
    seconds: 75,
  }),
  rep({
    id: "r.inh.3",
    lesson: "l10.5",
    teaches: ["js.inheritance"],
    title: "Has-a, not is-a",
    prompt:
      "A car is not a kind of engine — it **has** one. Return a car that holds the engine it was given and delegates `start()` to it.\n\nSwapping in a different engine must change the car's behaviour with no other edit.",
    exportName: "makeCar",
    starter: stub("makeCar", "engine"),
    tests: [
      {
        name: "delegates to its engine",
        code: `expect(fn({ start: () => "vroom" }).start()).toBe("vroom");`,
      },
      {
        name: "a different engine changes nothing else",
        code: `expect(fn({ start: () => "hum" }).start()).toBe("hum");`,
      },
      {
        name: "keeps a reference to it",
        code: `const e = { start: () => "vroom" };
expect(fn(e).engine).toBe(e);`,
      },
    ],
    hint: "Store it as `this.engine` in the constructor, and have `start()` return `this.engine.start()`.",
    solution:
      "function makeCar(engine) {\n  class Car {\n    constructor(engine) {\n      this.engine = engine;\n    }\n    start() {\n      return this.engine.start();\n    }\n  }\n  return new Car(engine);\n}",
    seconds: 80,
  }),
];

export const M10_LESSONS: Lesson[] = [
  {
    id: "l10.1",
    moduleId: "m10",
    title: "`this` and the call site",
    goal: "Know what `this` will be by looking at the call, and stop losing it when you pass a method around.",
    atomId: "teach.this",
    repIds: ["r.this.1", "r.this.2", "r.this.3"],
    problemIds: [],
  },
  {
    id: "l10.2",
    moduleId: "m10",
    title: "call, apply and bind",
    goal: "Set `this` yourself, and know why `bind` returns instead of running.",
    atomId: "teach.bind",
    repIds: ["r.bind.1", "r.bind.2", "r.bind.3"],
    problemIds: [],
  },
  {
    id: "l10.3",
    moduleId: "m10",
    title: "Classes",
    goal: "Constructors, fields, getters, statics and real privacy — and what `new` actually does.",
    atomId: "teach.classes",
    repIds: ["r.class.1", "r.class.2", "r.class.3"],
    problemIds: [],
  },
  {
    id: "l10.4",
    moduleId: "m10",
    title: "Prototypes and the chain",
    goal: "The one sharing mechanism underneath classes, and why `Object.keys` never hands you `toString`.",
    atomId: "teach.prototypes",
    repIds: ["r.proto.1", "r.proto.2", "r.proto.3"],
    problemIds: [],
  },
  {
    id: "l10.5",
    moduleId: "m10",
    title: "Inheritance vs composition",
    goal: "`extends` and `super`, the three ways deep hierarchies fail, and the default to reach for instead.",
    atomId: "teach.inheritance",
    repIds: ["r.inh.1", "r.inh.2", "r.inh.3"],
    problemIds: [],
  },
];

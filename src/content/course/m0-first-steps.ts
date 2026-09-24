import type { Atom, Lesson, Problem } from "../../types";
import { rep, stub } from "../rep";

/**
 * Module 0 — from absolutely nothing.
 *
 * This module exists because the first build used functions, loops and arrays
 * in Module 1 exercises without ever teaching them. Everything the course asks
 * you to write from here on is introduced here first.
 *
 * Vocabulary gate (CONTENT-STYLE.md rule 12): nothing in M0 may use `if`,
 * loops, arrow functions, or array methods. Those arrive in M2, M3 and M5.
 */
export const M0_ATOMS: Atom[] = [
  {
    id: "teach.program",
    title: "How code runs",
    teaches: ["js.intro.program", "js.functions.basics"],
    requires: [],
    readingSeconds: 190,
    recall:
      "What are the three parts of a function, and what happens if you leave out the last one?",
    body: `A program is a list of instructions. The computer starts at the top and does them one at a time, in order, until it runs out.

Each instruction is called a **statement**. Here are three:

\`\`\`js
2 + 2;
console.log("hello");
console.log(10 * 5);
\`\`\`

The semicolon marks the end of a statement, like a full stop at the end of a sentence.

\`console.log(...)\` prints whatever you put in the brackets. It's how you look inside your program while it runs. The first statement above calculates \`4\` and then throws it away, because nothing was done with it. Calculating something and not storing or printing it is legal, and useless.

## Expressions produce a value

An **expression** is any piece of code that produces a value.

\`\`\`js
2 + 2          produces 4
10 * 5         produces 50
"hello"        produces "hello"
\`\`\`

That word — *produces* — is worth holding on to. Wherever a value is allowed, an expression is allowed, because the expression turns into a value before anything else happens.

So this:

\`\`\`js
console.log(2 + 2);
\`\`\`

happens in two steps. First \`2 + 2\` becomes \`4\`. Then \`console.log(4)\` runs. The inside is always finished first.

## Comments are notes for humans

\`\`\`js
// This line is ignored by the computer.
console.log("hi");   // so is this bit, after the slashes
\`\`\`

Two slashes mean "ignore the rest of this line". Comments are how the examples in this course show you what a line produces:

\`\`\`js
2 + 2;   // 4
\`\`\`

That comment is telling you the result. It isn't code.

## A function is a reusable instruction

Most of the time you don't want to run instructions once at the top level. You want to bundle them under a name, and run them whenever you like, with different information each time.

That bundle is a **function**.

\`\`\`js
function double(n) {
  return n * 2;
}
\`\`\`

Four pieces, left to right:

- \`function\` — the keyword that says "a function is starting here"
- \`double\` — the **name** you're giving it
- \`(n)\` — the **parameter**: a name for information that gets handed in
- \`{ ... }\` — the **body**: the statements that run

## Calling it

Writing a function doesn't run it. Writing it is like writing down a recipe; nothing gets cooked.

To run it you **call** it, by writing its name followed by brackets:

\`\`\`js
double(5);   // 10
\`\`\`

The \`5\` is an **argument** — the actual value you're handing in. Inside the function, \`n\` becomes \`5\` for the duration of that call. Call it again with \`7\` and \`n\` is \`7\` that time.

Two words that sound the same and aren't:

- **parameter** — the name in the definition (\`n\`)
- **argument** — the value at the call (\`5\`)

## return hands a value back

\`return\` does two things at once, and both matter.

1. It sends a value back to whoever called the function.
2. It **stops the function immediately.**

\`\`\`js
function double(n) {
  return n * 2;
  console.log("never runs");
}
\`\`\`

That \`console.log\` can never happen, because \`return\` already ended the function.

## Forget return and you get undefined

This is the single most common beginner bug, and it looks completely fine:

\`\`\`js
function double(n) {
  n * 2;      // calculated, then thrown away
}

double(5);    // undefined
\`\`\`

\`n * 2\` produced \`10\`, and then the function ended without handing it anywhere. A function that returns nothing gives you \`undefined\`, which is JavaScript's word for "there's no value here."

**If an exercise says "return" and you get \`undefined\`, you almost certainly forgot the word \`return\`.**

## How the exercises work

Every exercise gives you a function with an empty body. You fill it in. Then the tests call your function with various arguments and check what comes back.

\`\`\`js
function double(n) {

}
\`\`\`

You never call the function yourself. The tests do that. Your job is only to make the body correct.`,
  },

  {
    id: "teach.numbers",
    title: "Numbers",
    teaches: ["js.intro.numbers"],
    requires: ["js.intro.program"],
    readingSeconds: 210,
    recall:
      "Why can't a computer store 0.1 exactly, and where does the extra 4 in 0.30000000000000004 come from?",
    body: `JavaScript has one kind of number. Whole numbers and decimals are the same type.

\`\`\`js
42
-7
3.5
0.001
\`\`\`

## The maths operators

\`\`\`js
7 + 2;   // 9   add
7 - 2;   // 5   subtract
7 * 2;   // 14  multiply
7 / 2;   // 3.5  divide
7 % 2;   // 1   remainder
7 ** 2;  // 49  power
\`\`\`

Two of those need a proper look.

**Divide always gives a decimal.** \`7 / 2\` is \`3.5\`, not \`3\`. If you come from a language where dividing two whole numbers gives a whole number, this will bite you.

**\`%\` is the remainder**, sometimes called modulo. \`7 % 2\` asks: divide 7 by 2 as many whole times as you can, what's left over? 2 goes into 7 three times (making 6), leaving **1**.

It's more useful than it looks. \`n % 2\` is \`0\` for every even number and \`1\` for every odd one, so it's how you test even and odd. And \`n % 10\` gives you the last digit of a number.

## Order of operations

Multiply and divide happen before add and subtract, the same as in school maths.

\`\`\`js
2 + 3 * 4;     // 14, not 20
(2 + 3) * 4;   // 20
\`\`\`

Brackets force the order. When in doubt, add brackets — they cost nothing and they remove the guesswork for the next person reading it.

## Useful built-in maths

\`Math\` is a box of number tools that comes with the language.

\`\`\`js
Math.round(3.6);   // 4    nearest whole number
Math.floor(3.9);   // 3    always down
Math.ceil(3.1);    // 4    always up
Math.abs(-5);      // 5    distance from zero
Math.max(3, 9, 1); // 9
Math.min(3, 9, 1); // 1
Math.sqrt(16);     // 4
\`\`\`

\`Math.floor\` is the one you'll reach for most, usually to chop a decimal down to a whole number.

## Now the strange one

\`\`\`js
0.1 + 0.2;   // 0.30000000000000004
\`\`\`

That's not a typo and it's not a bug. Here is exactly where the \`4\` comes from.

**Computers store numbers in binary — base 2.** You count in base 10 using ten digits. A computer counts in base 2 using two, 0 and 1.

For whole numbers this is fine. Every whole number can be written exactly in base 2.

**Fractions are where it breaks.** In base 2, the only fractions you can write exactly are sums of halves: 1/2, 1/4, 1/8, 1/16, 1/32, and so on.

So:

\`\`\`
0.5   = 1/2                exact
0.25  = 1/4                exact
0.75  = 1/2 + 1/4          exact
0.1   = ???
\`\`\`

You cannot build 0.1 out of halves. You can get close — 1/16 + 1/32 + 1/256 + 1/512 + ... — and you can keep adding smaller pieces forever, getting closer each time, but you never land on it exactly.

**This is not a computer problem. It's a base problem.** You already know a version of it: try writing 1/3 in base 10. You get 0.3333333... and it never ends. One third is a perfectly ordinary number, but base 10 can't write it down exactly. Base 2 has the same trouble with 0.1.

**A number gets 64 bits of space, so it has to stop.** JavaScript stores each number in 64 binary digits. Since 0.1 needs infinitely many, it stops after about 52 of them and rounds to the nearest value it *can* store.

That stored value is not 0.1. It's a tiny bit **more** than 0.1.

The same thing happens to 0.2 — also stored as a tiny bit more than 0.2.

**Add two slightly-too-big numbers and the errors add too.** The result is slightly bigger than 0.3.

Now, why do you *see* it? Normally JavaScript hides this. When printing a number it shows the shortest text that would round-trip back to the same stored value — so a stored "almost 0.3" would normally print as \`0.3\`.

But here, the sum's stored value is a **different** stored value from the one you'd get by writing \`0.3\` directly. They're neighbours, not the same. So printing \`0.3\` would be a lie, and JavaScript keeps adding digits until the text is unambiguous. That's how far it has to go:

\`\`\`
0.30000000000000004
\`\`\`

The \`4\` on the end is the accumulated rounding error, made visible.

## What to do about it

**Never compare decimals with \`===\`.**

\`\`\`js
0.1 + 0.2 === 0.3;   // false
\`\`\`

Check they're close enough instead:

\`\`\`js
Math.abs((0.1 + 0.2) - 0.3) < 0.000001;   // true
\`\`\`

**For money, use whole numbers.** Store 1050 pence rather than 10.50 pounds. Whole numbers are exact, so the problem never starts.

Every language using standard floating point does this — Python, Java, C, Ruby. It's a property of writing fractions in base 2, not a JavaScript quirk.`,
  },

  {
    id: "teach.strings",
    title: "Text",
    teaches: ["js.intro.strings"],
    requires: ["js.intro.program"],
    readingSeconds: 175,
    recall:
      "What are the two ways to build the sentence `Hello, Ada!` from a name, and which is better?",
    body: `Text is called a **string**. The name comes from the idea of characters strung together in a row.

You write one by wrapping characters in quotes:

\`\`\`js
"hello"
'hello'
\`\`\`

Double and single quotes do exactly the same thing. Pick one and stay consistent. This course uses double.

The quotes are not part of the string. They're the markers that say "text starts here" and "text ends here", the same way brackets aren't part of a maths sum.

## Joining strings

\`+\` glues strings together. This is called **concatenation**.

\`\`\`js
"Hello, " + "Ada";   // "Hello, Ada"
\`\`\`

Notice the space after the comma inside the first string. Without it you'd get \`"Hello,Ada"\`. \`+\` joins exactly what you give it and adds nothing of its own.

That's already awkward, and it gets worse with more pieces:

\`\`\`js
"Hello, " + name + "! You are " + age + " years old.";
\`\`\`

Counting spaces inside quotes is a genuinely annoying way to spend your time.

## Template literals are the better way

Use backticks — the key above Tab on most keyboards — and you can drop values straight into the middle of the text:

\`\`\`js
\`Hello, \${name}!\`
\`\`\`

Inside a backtick string, \`\${...}\` means **"work out what's in here and put the result in the text"**.

\`\`\`js
\`Hello, \${name}!\`              // "Hello, Ada!"
\`You are \${age} years old.\`    // "You are 30 years old."
\`Total: \${price * 2}\`          // "Total: 40"
\`\`\`

That last one shows something useful: anything that produces a value works inside \`\${}\`, not just a plain name. The maths runs first, then the result is dropped into the text.

**Use template literals by default.** The spaces are visible exactly where they'll appear, which removes the entire class of "missing space" bugs.

## Numbers and strings are different things

\`\`\`js
"5" + 3;   // "53"    string, not 8
5 + 3;     // 8
\`\`\`

The first \`+\` saw a string on its left, so it joined instead of adding. \`3\` was turned into \`"3"\` and stuck on the end.

This one catches everybody, and it's the reason a number typed into a web form has to be converted before you can do maths with it:

\`\`\`js
Number("5") + 3;   // 8
\`\`\`

\`Number(...)\` turns text into a real number. If the text isn't a number at all, you get \`NaN\` — "Not a Number" — which you'll meet properly in the next module.

## A few string tools

\`\`\`js
"hello".length;         // 5     how many characters
"hello".toUpperCase();  // "HELLO"
"hello".toLowerCase();  // "hello"
"  hi  ".trim();        // "hi"  removes surrounding spaces
\`\`\`

\`length\` has no brackets after it. The others do. That difference is real and it will trip you up at least once:

- \`length\` is a **property** — a piece of information the string carries.
- \`toUpperCase()\` is a **method** — an action you're asking it to perform.

You ask for a property. You call a method. Calling is what the brackets mean, which is the same rule as calling a function.

## Strings never change

\`\`\`js
const shout = "hello".toUpperCase();   // "HELLO"
\`\`\`

\`toUpperCase\` did not modify \`"hello"\`. It couldn't — strings in JavaScript can never be changed once made. It built a **new** string and handed it back.

That's why you have to store or return the result. Calling \`"hello".toUpperCase()\` and doing nothing with the answer accomplishes precisely nothing.`,
  },

  {
    id: "teach.collections",
    title: "Arrays and objects",
    teaches: ["js.intro.collections"],
    requires: ["js.intro.program"],
    readingSeconds: 200,
    recall:
      "How do you get the last item of an array, and why doesn't `items[-1]` work?",
    body: `So far each name has held one value. Usually you have many, and you need to keep them together.

There are two containers for that, and which you use depends on one question: **do the items have names, or just an order?**

- Order only → an **array**
- Names → an **object**

## Arrays hold an ordered list

Square brackets, items separated by commas:

\`\`\`js
const scores = [90, 75, 60];
const names = ["Ada", "Grace"];
const mixed = [1, "two", true];
\`\`\`

You reach an item by its position, written in square brackets. **Positions start at zero.**

\`\`\`js
scores[0];   // 90   the first
scores[1];   // 75   the second
scores[2];   // 60   the third
\`\`\`

Starting at zero feels wrong for about a week and then never again. What matters right now is the consequence: **a list of three items has positions 0, 1 and 2.** There is no position 3.

\`\`\`js
scores.length;   // 3
scores[2];       // 60   the last one
\`\`\`

So the last position is always \`length - 1\`. Say that one out loud, because off-by-one mistakes here are the most common bug in all of programming.

There's a shortcut that avoids the arithmetic:

\`\`\`js
scores.at(-1);   // 60   counting from the end
\`\`\`

\`at(-1)\` is the last, \`at(-2)\` the one before it. Note that \`scores[-1]\` does **not** work — it gives \`undefined\`. Square brackets don't understand negative positions, which is exactly why \`at()\` was added to the language.

## Asking for something that isn't there

\`\`\`js
scores[99];   // undefined
\`\`\`

No crash, no warning, no error. You get \`undefined\` and your program carries on.

That sounds convenient and it is genuinely dangerous. The failure shows up several lines later, in code that has nothing to do with the array, and by then the trail is cold.

## Adding to an array

\`\`\`js
const items = [1, 2];
items.push(3);
items;          // [1, 2, 3]
\`\`\`

\`push\` adds to the end. It **changes the original array** rather than making a new one — worth noticing now, because you'll spend a whole lesson on that distinction later.

## Copying an array

\`\`\`js
const copy = [...items];
\`\`\`

Those three dots are the **spread** operator. Read \`[...items]\` as "make a new array, and pour the contents of \`items\` into it".

This matters more than it looks, and there's a full lesson on why. For now: \`[...items]\` gives you a genuinely separate array, and \`items\` on its own does not.

## Objects hold named values

Curly braces, and each item gets a name:

\`\`\`js
const user = {
  name: "Ada",
  age: 36,
};
\`\`\`

Each \`name: value\` pair is a **property**. The name on the left is the **key**, the thing on the right is the **value**.

Reach a property with a dot:

\`\`\`js
user.name;   // "Ada"
user.age;    // 36
\`\`\`

Or with square brackets and the key as a string:

\`\`\`js
user["name"];   // "Ada"
\`\`\`

The dot is nicer to read, so use it when you know the key as you type. Square brackets are for when the key is itself stored in a variable — you'll need that later, and rarely before then.

Missing properties behave like missing array positions:

\`\`\`js
user.email;   // undefined
\`\`\`

## Setting and adding

\`\`\`js
user.age = 37;         // change an existing property
user.email = "a@b.c";  // add a brand new one
\`\`\`

Same syntax for both. If the key exists it's replaced; if not, it's created.

## Copying an object

\`\`\`js
const copy = { ...user };
\`\`\`

Same three dots, curly braces this time. "Make a new object and pour the properties of \`user\` into it."

You can override a property on the way through, by writing it after the spread:

\`\`\`js
const older = { ...user, age: 40 };
\`\`\`

That builds a new object with everything \`user\` had, except \`age\` is \`40\`. The original \`user\` is untouched. This exact pattern is everywhere in modern JavaScript, so it's worth typing a few times until it's automatic.

## They nest

An array of objects is the shape most real data arrives in:

\`\`\`js
const users = [
  { name: "Ada", age: 36 },
  { name: "Grace", age: 45 },
];

users[0].name;   // "Ada"
\`\`\`

Read that last line strictly left to right. \`users[0]\` is the first object. Then \`.name\` reaches into it.`,
  },

  {
    id: "teach.errors",
    title: "When it goes wrong",
    teaches: ["js.intro.errors"],
    requires: ["js.intro.program"],
    readingSeconds: 165,
    recall:
      "You get `TypeError: Cannot read properties of undefined (reading 'name')`. What does that tell you?",
    body: `Code failing is not a sign you're bad at this. It's the normal state of writing code. Everyone's first attempt fails; experienced people are just faster at reading the complaint.

There are three ways things go wrong, and telling them apart saves you most of the time.

## 1. Syntax errors — it isn't valid JavaScript

\`\`\`js
function double(n {
  return n * 2;
}
\`\`\`

\`\`\`
SyntaxError: missing ) after formal parameters
\`\`\`

Nothing ran at all. The computer couldn't even read the code, the way you can't read a sentence with half the letters missing.

These are almost always a missing bracket, brace, quote or comma. **Look at the line reported, and the line above it** — a bracket left open on one line is usually reported on the next.

## 2. Runtime errors — it ran, and then hit something impossible

\`\`\`js
const user = undefined;
user.name;
\`\`\`

\`\`\`
TypeError: Cannot read properties of undefined (reading 'name')
\`\`\`

That message is long but it's precise, and it's worth taking apart because you will see it hundreds of times:

- **Cannot read properties of undefined** — you used a dot on something that was \`undefined\`
- **(reading 'name')** — the property you were reaching for was \`name\`

So: *something you expected to be an object was actually \`undefined\`, and you tried to get \`name\` out of it.*

Notice what the message does **not** say — it doesn't say which variable. But you know the property was \`name\`, so you look for \`.name\` on the reported line and check what's to the left of the dot. That's your culprit.

Nine times out of ten it means a function returned nothing, or a lookup found nothing, and you carried on as if it had worked.

## 3. Logic errors — it ran fine and gave the wrong answer

No error message at all. The tests just fail.

These are the slowest to fix, because nothing points at the problem. The fastest tool is not a debugger — it's printing what you actually have:

\`\`\`js
function double(n) {
  console.log("n is", n);
  return n + 2;      // bug: should be n * 2
}
\`\`\`

Print the values you *assumed* were correct. The bug is nearly always in the assumption you didn't check.

## Reading a failing test

When a test fails here, you get something like:

\`\`\`
✕ double(5) → 10
  expected 10
       got 7
\`\`\`

Three lines, three pieces of information:

- **\`double(5) → 10\`** — what was called, and what should have come back
- **expected 10** — what the test wanted
- **got 7** — what your function actually returned

The gap between those last two is the whole bug. \`7\` instead of \`10\` from an input of \`5\` says you added 2 rather than multiplying by 2.

## The one that confuses everyone

\`\`\`
expected 10
     got undefined
\`\`\`

\`undefined\` almost always means **you forgot \`return\`**.

Your function ran, did the work correctly, and then ended without handing the answer back. The maths was right. The delivery was missing.

Check for the word \`return\` before you check anything else.

## Read the error before changing anything

The strong instinct when something breaks is to start changing code until it stops complaining. That instinct costs hours.

The error message is a description of what happened, written by the thing that watched it happen. Read it properly first — usually it has already told you the answer.`,
  },
];

export const M0_REPS: Problem[] = [
  // ------------------------------------------------------ l0.1 program
  rep({
    id: "r.prog.1",
    lesson: "l0.1",
    teaches: ["js.functions.basics"],
    title: "Return a value",
    prompt: "Return the number `7`. That's the whole exercise — just hand it back.",
    exportName: "seven",
    starter: stub("seven", ""),
    cases: [{ args: "", is: "7" }],
    hint: "Inside the braces, write `return 7;` — the word `return`, the value, a semicolon.",
    solution: "function seven() {\n  return 7;\n}",
    seconds: 30,
  }),
  rep({
    id: "r.prog.2",
    lesson: "l0.1",
    teaches: ["js.functions.basics"],
    title: "Use the parameter",
    prompt:
      "Return `n` plus 1. `n` is whatever the caller hands in, so your answer has to work for any number.",
    exportName: "next",
    starter: stub("next", "n"),
    cases: [
      { args: "1", is: "2" },
      { args: "0", is: "1" },
      { args: "-5", is: "-4" },
    ],
    hint: "`return n + 1;` — you don't need to know what `n` is, only what to do with it.",
    solution: "function next(n) {\n  return n + 1;\n}",
    seconds: 40,
  }),
  rep({
    id: "r.prog.3",
    lesson: "l0.1",
    teaches: ["js.functions.basics"],
    title: "Two parameters",
    prompt: "Return the two numbers multiplied together.",
    exportName: "product",
    starter: stub("product", "a, b"),
    cases: [
      { args: "3, 4", is: "12" },
      { args: "0, 9", is: "0" },
      { args: "-2, 5", is: "-10" },
    ],
    hint: "Parameters are separated by commas, and you can use both: `return a * b;`",
    solution: "function product(a, b) {\n  return a * b;\n}",
    seconds: 40,
  }),

  // ------------------------------------------------------ l0.2 numbers
  rep({
    id: "r.num.1",
    lesson: "l0.2",
    teaches: ["js.intro.numbers"],
    title: "Average of three",
    prompt:
      "Return the average of three numbers — add them all, then divide by 3.",
    exportName: "average",
    starter: stub("average", "a, b, c"),
    cases: [
      { args: "3, 3, 3", is: "3" },
      { args: "1, 2, 3", is: "2" },
      { args: "0, 0, 3", is: "1" },
    ],
    hint:
      "Brackets matter. `a + b + c / 3` divides only `c`. You want `(a + b + c) / 3`.",
    solution: "function average(a, b, c) {\n  return (a + b + c) / 3;\n}",
    seconds: 50,
  }),
  rep({
    id: "r.num.2",
    lesson: "l0.2",
    teaches: ["js.intro.numbers"],
    title: "Last digit",
    prompt: "Return the last digit of a whole positive number.",
    exportName: "lastDigit",
    starter: stub("lastDigit", "n"),
    cases: [
      { args: "437", is: "7" },
      { args: "5", is: "5" },
      { args: "1200", is: "0" },
    ],
    hint:
      "`% 10` gives the remainder after dividing by 10 — which is exactly the last digit.",
    solution: "function lastDigit(n) {\n  return n % 10;\n}",
    seconds: 45,
  }),
  rep({
    id: "r.num.3",
    lesson: "l0.2",
    teaches: ["js.intro.numbers"],
    title: "Chop the decimal",
    prompt:
      "Divide `a` by `b` and return the result rounded **down** to a whole number.",
    exportName: "wholeDivide",
    starter: stub("wholeDivide", "a, b"),
    cases: [
      { args: "7, 2", is: "3" },
      { args: "10, 5", is: "2" },
      { args: "9, 4", is: "2" },
    ],
    hint: "Do the division first, then hand the result to `Math.floor(...)`.",
    solution: "function wholeDivide(a, b) {\n  return Math.floor(a / b);\n}",
    seconds: 45,
  }),

  // ------------------------------------------------------ l0.3 strings
  rep({
    id: "r.str.1",
    lesson: "l0.3",
    teaches: ["js.intro.strings"],
    title: "Join with a space",
    prompt:
      'Return the full name — first, a space, then last. `"Ada"` and `"Lovelace"` gives `"Ada Lovelace"`.',
    exportName: "fullName",
    starter: stub("fullName", "first, last"),
    cases: [
      { args: '"Ada", "Lovelace"', is: '"Ada Lovelace"' },
      { args: '"Grace", "Hopper"', is: '"Grace Hopper"' },
    ],
    hint:
      'A template literal is easiest — backticks, with `${first} ${last}` inside and a real space between them.',
    solution:
      "function fullName(first, last) {\n  return `${first} ${last}`;\n}",
    seconds: 50,
  }),
  rep({
    id: "r.str.2",
    lesson: "l0.3",
    teaches: ["js.intro.strings"],
    title: "Build a sentence",
    prompt:
      'Return `"Ada is 36 years old."` given the name `"Ada"` and the age `36`.',
    exportName: "describe",
    starter: stub("describe", "name, age"),
    cases: [
      { args: '"Ada", 36', is: '"Ada is 36 years old."' },
      { args: '"Bo", 1', is: '"Bo is 1 years old."' },
    ],
    hint:
      "Backticks, then drop both values in with `${}`. Watch the full stop at the end.",
    solution:
      "function describe(name, age) {\n  return `${name} is ${age} years old.`;\n}",
    seconds: 55,
  }),
  rep({
    id: "r.str.3",
    lesson: "l0.3",
    teaches: ["js.intro.strings"],
    title: "Shout it",
    prompt:
      "Return the text in capitals, with any surrounding spaces removed first.",
    exportName: "shout",
    starter: stub("shout", "text"),
    cases: [
      { args: '"  hello  "', is: '"HELLO"' },
      { args: '"hi"', is: '"HI"' },
    ],
    hint:
      "Two methods, one after the other: `text.trim().toUpperCase()`. Each hands its result to the next.",
    solution: "function shout(text) {\n  return text.trim().toUpperCase();\n}",
    seconds: 50,
  }),

  // -------------------------------------------------- l0.4 collections
  rep({
    id: "r.coll.1",
    lesson: "l0.4",
    teaches: ["js.intro.collections"],
    title: "First and last",
    prompt: "Return the first item of the array.",
    exportName: "first",
    starter: stub("first", "items"),
    cases: [
      { args: "[10, 20, 30]", is: "10" },
      { args: '["a"]', is: '"a"' },
    ],
    hint: "Positions start at zero, so the first item is `items[0]`.",
    solution: "function first(items) {\n  return items[0];\n}",
    seconds: 35,
  }),
  rep({
    id: "r.coll.2",
    lesson: "l0.4",
    teaches: ["js.intro.collections"],
    title: "The last one",
    prompt:
      "Return the last item of the array, however long it is.",
    exportName: "last",
    starter: stub("last", "items"),
    cases: [
      { args: "[10, 20, 30]", is: "30" },
      { args: '["only"]', is: '"only"' },
      { args: "[1, 2]", is: "2" },
    ],
    hint:
      "Either `items[items.length - 1]` or the shortcut `items.at(-1)`. Both are fine.",
    solution: "function last(items) {\n  return items.at(-1);\n}",
    seconds: 45,
  }),
  rep({
    id: "r.coll.3",
    lesson: "l0.4",
    teaches: ["js.intro.collections"],
    title: "Read a property",
    prompt: "Return the user's `name`.",
    exportName: "nameOf",
    starter: stub("nameOf", "user"),
    cases: [
      { args: '{ name: "Ada", age: 36 }', is: '"Ada"' },
      { args: '{ name: "Bo" }', is: '"Bo"' },
    ],
    hint: "Use a dot: `user.name`.",
    solution: "function nameOf(user) {\n  return user.name;\n}",
    seconds: 35,
  }),
  rep({
    id: "r.coll.4",
    lesson: "l0.4",
    teaches: ["js.intro.collections"],
    title: "Reach into a nested value",
    prompt:
      "The array holds user objects. Return the name of the **first** one.",
    exportName: "firstName",
    starter: stub("firstName", "users"),
    cases: [
      { args: '[{ name: "Ada" }, { name: "Bo" }]', is: '"Ada"' },
      { args: '[{ name: "Solo" }]', is: '"Solo"' },
    ],
    hint:
      "Left to right: `users[0]` gets the first object, then `.name` reaches inside it.",
    solution: "function firstName(users) {\n  return users[0].name;\n}",
    seconds: 45,
  }),
  rep({
    id: "r.coll.5",
    lesson: "l0.4",
    teaches: ["js.intro.collections"],
    title: "A new object with one change",
    prompt:
      "Return a new object with everything the user had, but `age` set to the new value.",
    exportName: "withAge",
    starter: stub("withAge", "user, age"),
    cases: [
      { args: '{ name: "Ada", age: 36 }, 40', is: '{ name: "Ada", age: 40 }' },
      { args: '{ name: "Bo", age: 1 }, 2', is: '{ name: "Bo", age: 2 }' },
    ],
    hint:
      "Spread the old object into a new one, then set the key after it: `{ ...user, age: age }`.",
    solution: "function withAge(user, age) {\n  return { ...user, age: age };\n}",
    seconds: 55,
  }),

  // ------------------------------------------------------- l0.5 errors
  rep({
    id: "r.err.1",
    lesson: "l0.5",
    teaches: ["js.intro.errors"],
    title: "Fix the missing return",
    prompt:
      "This function does the right maths and still returns `undefined`. Fix it.",
    exportName: "triple",
    starter: "function triple(n) {\n  n * 3;\n}",
    cases: [
      { args: "2", is: "6" },
      { args: "0", is: "0" },
    ],
    hint:
      "The calculation happens and is thrown away. One word is missing at the start of that line.",
    solution: "function triple(n) {\n  return n * 3;\n}",
    seconds: 35,
  }),
  rep({
    id: "r.err.2",
    lesson: "l0.5",
    teaches: ["js.intro.errors"],
    title: "Fix the wrong operator",
    prompt:
      "The tests say `expected 10, got 7`. Read that gap and fix the line.",
    exportName: "double",
    starter: "function double(n) {\n  return n + 2;\n}",
    cases: [
      { args: "5", is: "10" },
      { args: "3", is: "6" },
      { args: "0", is: "0" },
    ],
    hint:
      "From an input of 5 it produced 7, which is 5 + 2. It should have produced 10, which is 5 × 2.",
    solution: "function double(n) {\n  return n * 2;\n}",
    seconds: 40,
  }),
  rep({
    id: "r.err.3",
    lesson: "l0.5",
    teaches: ["js.intro.errors", "js.intro.collections"],
    title: "Fix the off-by-one",
    prompt:
      "This tries to return the last item and crashes or returns `undefined`. Fix it.",
    exportName: "last",
    starter: "function last(items) {\n  return items[items.length];\n}",
    cases: [
      { args: "[1, 2, 3]", is: "3" },
      { args: '["a"]', is: '"a"' },
    ],
    hint:
      "A 3-item array has positions 0, 1, 2 — there is no position 3. The last position is `length - 1`.",
    solution: "function last(items) {\n  return items[items.length - 1];\n}",
    seconds: 45,
  }),
];

export const M0_LESSONS: Lesson[] = [
  {
    id: "l0.1",
    moduleId: "m0",
    title: "How code runs",
    goal: "Understand statements, expressions and functions — enough to do every exercise in this course.",
    atomId: "teach.program",
    repIds: ["r.prog.1", "r.prog.2", "r.prog.3"],
    problemIds: [],
  },
  {
    id: "l0.2",
    moduleId: "m0",
    title: "Numbers",
    goal: "Do arithmetic, and understand why 0.1 + 0.2 isn't 0.3.",
    atomId: "teach.numbers",
    repIds: ["r.num.1", "r.num.2", "r.num.3"],
    problemIds: [],
  },
  {
    id: "l0.3",
    moduleId: "m0",
    title: "Text",
    goal: "Build strings, and stop counting spaces inside quotes.",
    atomId: "teach.strings",
    repIds: ["r.str.1", "r.str.2", "r.str.3"],
    problemIds: [],
  },
  {
    id: "l0.4",
    moduleId: "m0",
    title: "Arrays and objects",
    goal: "Keep many values together, and reach any one of them.",
    atomId: "teach.collections",
    repIds: ["r.coll.1", "r.coll.2", "r.coll.3", "r.coll.4", "r.coll.5"],
    problemIds: [],
  },
  {
    id: "l0.5",
    moduleId: "m0",
    title: "When it goes wrong",
    goal: "Read an error message and a failing test, and know where to look.",
    atomId: "teach.errors",
    repIds: ["r.err.1", "r.err.2", "r.err.3"],
    problemIds: [],
  },
];

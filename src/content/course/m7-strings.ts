import type { Atom, Lesson, Problem } from "../../types";
import { rep, stub } from "../rep";

/**
 * M7 — Strings.
 *
 * Sits between Objects and Map/Set because half of Part 3 is string problems
 * and every one of them assumes slicing, splitting and character codes are
 * reflex. The last lesson exists purely for the 26-slot frequency array, which
 * is the single most reused trick in easy/medium string questions.
 */
export const M7_ATOMS: Atom[] = [
  {
    id: "teach.str-basics",
    title: "Indexing and slicing",
    teaches: ["js.string.basics"],
    requires: ["js.intro.strings", "js.array.slicing"],
    readingSeconds: 175,
    recall:
      "`word[0] = \"F\"` runs without an error and changes nothing. Why?",
    body: `A **string** is text: characters in a fixed order, with a fixed length.

\`\`\`js
const word = "forge";

word.length;   // 5
word[0];       // "f"
word[4];       // "e"
word[5];       // undefined — there is no sixth character
\`\`\`

Indexes start at 0, exactly like arrays. The last character sits at \`length - 1\`, and that subtraction is where most off-by-one bugs are born.

Reaching past the end doesn't throw. It gives you \`undefined\`, quietly, and your bug shows up three lines later.

## Counting from the end

\`\`\`js
word.at(0);    // "f"
word.at(-1);   // "e"
word.at(-2);   // "g"
\`\`\`

\`word[-1]\` gives \`undefined\` — square brackets don't understand negative numbers. \`.at(-1)\` does, and it is the shortest honest way to say "the last character".

## The rule that surprises everyone: you cannot change a string

\`\`\`js
let word = "forge";
word[0] = "F";
word;          // "forge" — unchanged
\`\`\`

No error. No warning. The assignment is simply ignored.

Strings are **immutable**: once a string exists, the characters inside it can never be edited. This isn't an oversight — it's a guarantee. Hand a string to a function and you know it comes back identical, always. You never have to wonder whether something modified your text behind your back.

So how do you "change" one? You don't. You build a new one and point the variable at it:

\`\`\`js
let word = "forge";
word = "F" + word.slice(1);
word;          // "Forge"
\`\`\`

The original \`"forge"\` is still whole and untouched; \`word\` just stops referring to it. **Every string method works this way — each returns a new string and leaves the original alone.**

Hold that next to arrays, where \`push\` and \`sort\` edit the thing itself. Arrays mutate. Strings never do. Mixing those two up is a reliable source of confusion, so it's worth saying out loud once: if a string method's answer isn't stored or returned, it has accomplished nothing.

\`\`\`js
let name = "ada";
name.toUpperCase();   // makes "ADA" and throws it away
name;                 // "ada"

name = name.toUpperCase();
name;                 // "ADA"
\`\`\`

## slice: taking a piece

\`\`\`js
const s = "javascript";

s.slice(0, 4);   // "java"
s.slice(4);      // "script"
s.slice(-6);     // "script"
s.slice(2, 5);   // "vas"
\`\`\`

Two numbers: where to start, and where to stop. The start index is **included**, the end index is **excluded**. So \`slice(0, 4)\` hands you characters 0, 1, 2 and 3 — four characters, and not the one at index 4.

That exclusive end looks arbitrary until you see what it buys: the length of the result is always \`end - start\`. \`slice(0, 4)\` is 4 characters. \`slice(2, 5)\` is 3. No arithmetic, no fencepost.

Leave the end off and it runs to the finish. Negative numbers count back from the end, so \`slice(-6)\` means "the last six characters" and \`slice(1, -1)\` means "drop one from each side" — which is the whole of a palindrome-trimming loop in one expression.

Out-of-range numbers are clamped rather than fatal. \`"hi".slice(0, 99)\` is \`"hi"\`, and a start past the end gives \`""\`.

## Sticking strings together

\`\`\`js
const first = "ada";
const last = "lovelace";

first + " " + last;          // "ada lovelace"
\`\${first} \${last}\`;          // "ada lovelace"
\`\`\`

Both build the same string. The template literal — backticks with \`\${}\` holes — stays readable past two pieces, so make it the default and keep \`+\` for the two-piece case.

One trap to name now, because it will bite you in an interview:

\`\`\`js
"3" + 4;    // "34"  — the number was converted to text
3 + 4;      // 7
"3" - 4;    // -1    — but minus has no text meaning, so both became numbers
\`\`\`

\`+\` means "add" when both sides are numbers and "join" the moment either side is a string. Every other maths operator only knows numbers, so it converts instead. That asymmetry is the reason \`"3" + 4\` and \`"3" - 4\` disagree.`,
  },
  {
    id: "teach.str-search",
    title: "Searching and replacing",
    teaches: ["js.string.search"],
    requires: ["js.string.basics", "js.array.search"],
    readingSeconds: 165,
    recall:
      "Why is `if (text.indexOf(\"a\"))` wrong in two different ways at once?",
    body: `Four methods answer almost every "is it in there?" question.

\`\`\`js
const s = "the quick brown fox";

s.includes("quick");     // true
s.startsWith("the");     // true
s.endsWith("fox");       // true
s.indexOf("quick");      // 4
\`\`\`

\`includes\` answers **yes or no**. \`indexOf\` answers **where**. Reach for \`includes\` unless you actually need the position, because a boolean can't be misread and a number can.

## The -1 trap

When \`indexOf\` finds nothing, it returns \`-1\`.

\`\`\`js
s.indexOf("zebra");      // -1
\`\`\`

That choice causes a specific, extremely common bug:

\`\`\`js
if (s.indexOf("zebra")) {   // WRONG
  // runs — because -1 is truthy
}
\`\`\`

Every number is truthy except \`0\`. \`-1\` is a number that isn't zero, so the \`if\` fires exactly when the text is **missing**. Backwards.

And the mirror image is just as bad:

\`\`\`js
if (s.indexOf("the")) {     // WRONG
  // doesn't run — the match is at index 0, and 0 is falsy
}
\`\`\`

A match at the very start gives \`0\`, which is falsy, so a real hit is treated as a miss.

Both bugs come from the same mistake: treating a position as a yes/no. The two correct forms are

\`\`\`js
if (s.indexOf("zebra") !== -1) { }   // explicit
if (s.includes("zebra")) { }         // better
\`\`\`

\`includes\` exists precisely so you never have to think about this again.

## Searching from a position

\`indexOf\` takes a second argument: where to begin.

\`\`\`js
const t = "banana";

t.indexOf("a");        // 1
t.indexOf("a", 2);     // 3
t.indexOf("a", 4);     // 5
t.lastIndexOf("a");    // 5
\`\`\`

That second argument is what lets you walk every occurrence:

\`\`\`js
let i = t.indexOf("a");
while (i !== -1) {
  // do something with i
  i = t.indexOf("a", i + 1);
}
\`\`\`

The \`i + 1\` matters. Search from \`i\` and you find the same match forever — an infinite loop that looks perfectly reasonable on the page.

## Case sensitivity

All four of these compare exactly.

\`\`\`js
"Hello".includes("hello");   // false
\`\`\`

If you want a human-style match, flatten **both sides** first:

\`\`\`js
"Hello".toLowerCase().includes("hello".toLowerCase());   // true
\`\`\`

Lowercasing only one side is the bug that survives testing, because your test data happens to be lowercase already.

## Replacing

\`\`\`js
const line = "a-b-c";

line.replace("-", "+");      // "a+b-c"   — first only
line.replaceAll("-", "+");   // "a+b+c"   — all of them
\`\`\`

**\`replace\` changes the first match and stops.** Nearly everyone expects it to change all of them, discovers it doesn't via a bug report, and remembers forever. \`replaceAll\` is the one you almost always meant.

Both return a new string. The original is untouched, as always:

\`\`\`js
const line2 = "a-b-c";
line2.replaceAll("-", "+");
line2;                       // "a-b-c" — you threw the answer away
\`\`\`

If a replacement seems to do nothing, this is the first thing to check.`,
  },
  {
    id: "teach.str-split",
    title: "Splitting and joining",
    teaches: ["js.string.split"],
    requires: ["js.string.basics", "js.array.access", "js.array.filter"],
    readingSeconds: 170,
    recall:
      "What does `\"\".split(\",\")` give you, and why does that break a naive word count?",
    body: `\`split\` turns a string into an array. \`join\` turns an array back into a string. Together they are the bridge between text and every array method you already know.

\`\`\`js
"a,b,c".split(",");        // ["a", "b", "c"]
"the quick fox".split(" "); // ["the", "quick", "fox"]
"hello".split("");          // ["h", "e", "l", "l", "o"]
\`\`\`

The argument is the **separator**: the thing to cut on, which is itself thrown away. Splitting on \`""\` cuts between every character, which is how you get a per-character array.

\`\`\`js
["a", "b", "c"].join(",");  // "a,b,c"
["a", "b", "c"].join("");   // "abc"
["a", "b", "c"].join();     // "a,b,c" — comma is the default
\`\`\`

## The round trip

This is the shape worth memorising, because it unlocks the entire array toolkit for text:

\`\`\`js
"hello".split("").reverse().join("");   // "olleh"
\`\`\`

Split into characters, use an array method, join back. \`reverse\` only exists on arrays, so reversing a string means becoming an array for a moment.

\`[...s]\` does the same job as \`s.split("")\` and is shorter:

\`\`\`js
[..."hello"].reverse().join("");        // "olleh"
\`\`\`

Prefer the spread. It handles emoji and accented characters correctly, where \`split("")\` cuts some of them in half.

## The empty-string trap

\`\`\`js
"".split(",");     // [""]  — one empty string, NOT an empty array
"".split(",").length;   // 1
\`\`\`

Read that twice. Splitting empty text gives you an array of **length 1**, containing one empty string. So the obvious word count is wrong on the one input you were bound to be tested on:

\`\`\`js
function countWords(text) {
  return text.split(" ").length;   // countWords("") === 1
}
\`\`\`

The same failure appears with any run of separators, because every gap produces an entry:

\`\`\`js
"a  b".split(" ");        // ["a", "", "b"] — two spaces, empty in the middle
"  hi  ".split(" ");      // ["", "", "hi", "", ""]
\`\`\`

## The fix, and the habit

Trim the ends, then drop the empties:

\`\`\`js
"  a  b  ".trim().split(" ").filter(Boolean);   // ["a", "b"]
"".trim().split(" ").filter(Boolean);           // []
\`\`\`

\`filter(Boolean)\` deserves a sentence of its own. \`Boolean\` is a function that turns any value into \`true\` or \`false\`, and \`filter\` calls it on each item — so anything falsy is removed. Empty strings are falsy, so they go. It is the standard way to say "remove the blanks", and you will read it constantly.

**Whenever you split user text, assume it has stray spaces.** \`trim().split(" ").filter(Boolean)\` is the reflex, and it costs nothing when the input was clean.

## Splitting on longer separators

The separator doesn't have to be one character.

\`\`\`js
"a -> b -> c".split(" -> ");   // ["a", "b", "c"]
\`\`\`

And a second argument caps how many pieces come back:

\`\`\`js
"a,b,c,d".split(",", 2);       // ["a", "b"]
\`\`\`

That limit **discards** the rest rather than keeping it in the last slot — rarely what you want, which is why you almost never see it.`,
  },
  {
    id: "teach.str-build",
    title: "Building strings",
    teaches: ["js.string.methods"],
    requires: ["js.string.basics", "js.array.map"],
    readingSeconds: 165,
    recall:
      "You need `\"07\"` from the number `7`. Which method, and what are its two arguments?",
    body: `Six small methods cover nearly all the text-shaping you will ever do. None of them modify anything; each hands back a new string.

\`\`\`js
"  hi  ".trim();          // "hi"     both ends
"  hi  ".trimStart();     // "hi  "
"  hi  ".trimEnd();       // "  hi"

"ada".toUpperCase();      // "ADA"
"ADA".toLowerCase();      // "ada"

"ab".repeat(3);           // "ababab"
\`\`\`

\`trim\` removes whitespace — spaces, tabs, newlines — from the outside only. Spaces **between** words are left exactly as they were, however many there are. Trimming is not tidying.

## Padding, and why it exists

\`\`\`js
"7".padStart(2, "0");     // "07"
"7".padEnd(3, ".");       // "7.."
"123".padStart(2, "0");   // "123" — already long enough, unchanged
\`\`\`

Two arguments: the **target total length**, and what to pad with. The first is the length you want the whole result to be, not how many characters to add — a distinction that trips people up on first use.

This is how you format clocks, invoice numbers and aligned output:

\`\`\`js
const mins = 7;
\`00:\${String(mins).padStart(2, "0")}\`;   // "00:07"
\`\`\`

Note \`String(mins)\` first. \`padStart\` is a string method, and numbers don't have it.

## Capitalising one word

There is no \`capitalise\` method, so you build it — and the shape is worth knowing cold, because it is half of every title-casing question:

\`\`\`js
function capitalise(word) {
  return word[0].toUpperCase() + word.slice(1);
}
\`\`\`

First character upper, everything from index 1 onward unchanged, glued together. Note the bug waiting in it: \`""[0]\` is \`undefined\`, and \`undefined.toUpperCase()\` throws. Guard it if empty input is possible:

\`\`\`js
function capitalise(word) {
  // empty text has no first letter, so leave early
  if (!word) return "";
  return word[0].toUpperCase() + word.slice(1);
}
\`\`\`

## Building up in a loop

Because strings are immutable, \`+=\` in a loop makes a brand-new string every pass:

\`\`\`js
let out = "";
for (const ch of "abc") {
  out += ch.toUpperCase();
}
out;   // "ABC"
\`\`\`

For a few hundred characters this is completely fine, and engines optimise it heavily. For very large output the array route is the safe habit:

\`\`\`js
const parts = [];
for (const ch of "abc") {
  parts.push(ch.toUpperCase());
}
parts.join("");   // "ABC"
\`\`\`

Push into an array, join once at the end. One string gets built instead of one per iteration.

When there's no loop-carried state at all, \`map\` says it in a line:

\`\`\`js
[..."abc"].map(ch => ch.toUpperCase()).join("");   // "ABC"
\`\`\`

## Comparing text

\`===\` is exact and case-sensitive. For human ordering, \`localeCompare\` is the tool, and it returns the same negative / zero / positive that \`sort\` wants:

\`\`\`js
["banana", "Apple", "cherry"].sort((a, b) => a.localeCompare(b));
// ["Apple", "banana", "cherry"]
\`\`\`

A plain \`sort()\` would put \`"Apple"\` first for the wrong reason — capital letters sort before lowercase ones by raw code point, which the next lesson explains.`,
  },
  {
    id: "teach.str-codes",
    title: "Characters as numbers",
    teaches: ["js.string.codes"],
    requires: ["js.string.basics", "js.array.access"],
    readingSeconds: 170,
    recall:
      "How do you turn the character `\"c\"` into the array index `2`, and why does that work?",
    body: `Every character is stored as a number. Once you can move between the two, a whole family of problems collapses into array indexing.

\`\`\`js
"a".charCodeAt(0);        // 97
"z".charCodeAt(0);        // 122
"A".charCodeAt(0);        // 65
"0".charCodeAt(0);        // 48

String.fromCharCode(97);  // "a"
\`\`\`

\`charCodeAt\` takes an **index** — which character of the string you're asking about — and returns that character's number. On a one-character string that index is always \`0\`, which is why you see \`charCodeAt(0)\` everywhere.

The three numbers worth memorising: lowercase \`a\` is 97, uppercase \`A\` is 65, digit \`0\` is 48. Each alphabet is 26 consecutive numbers, and the digits are 10 consecutive numbers, with no gaps.

## Turning a letter into an index

That "consecutive, no gaps" fact is the whole trick:

\`\`\`js
"a".charCodeAt(0) - 97;   // 0
"b".charCodeAt(0) - 97;   // 1
"c".charCodeAt(0) - 97;   // 2
"z".charCodeAt(0) - 97;   // 25
\`\`\`

Subtract the code of \`"a"\` and every lowercase letter becomes a number from 0 to 25. That is exactly the range of a 26-slot array.

Writing \`97\` as a bare number is the kind of thing that looks clever and reads badly. Say what you mean:

\`\`\`js
const A = "a".charCodeAt(0);
const index = ch.charCodeAt(0) - A;
\`\`\`

## The frequency array

Here is why any of this matters. Counting letters with a 26-slot array is the most reused shape in easy and medium string problems:

\`\`\`js
function letterCounts(word) {
  const counts = new Array(26).fill(0);
  for (const ch of word) {
    counts[ch.charCodeAt(0) - 97] += 1;
  }
  return counts;
}

letterCounts("bab");   // [1, 2, 0, 0, ... ] — one a, two b
\`\`\`

\`new Array(26).fill(0)\` makes 26 slots, all zero. Without \`.fill(0)\` the slots are empty and \`counts[i] += 1\` gives \`NaN\`, which is a genuinely confusing thing to debug — the array prints as if it has values.

Two words are anagrams when their counts match. Two strings are a permutation of each other when their counts match. "Can this be rearranged into a palindrome?" is answered by counting how many entries are odd. All the same array.

This assumes lowercase a–z. If input can be mixed, \`toLowerCase()\` first; if it can be any character at all, a Map is the general answer — and that's the next module.

## Why "Z" sorts before "a"

\`<\` and \`>\` on strings compare code point by code point.

\`\`\`js
"A" < "a";     // true  — 65 < 97
"Z" < "a";     // true  — 90 < 97
"apple" < "banana";   // true — 'a' is 97, 'b' is 98, decided at the first character
\`\`\`

Comparison walks left to right and stops at the first character that differs. Every uppercase letter has a smaller code than every lowercase letter, so a raw sort puts all the capitals first. That is the behaviour \`localeCompare\` exists to replace when you want human ordering.

## One caution

\`charCodeAt\` works on 16-bit units, not on what a person calls a character. Emoji and some scripts occupy two units, so \`"😀".length\` is \`2\` and \`charCodeAt(0)\` gives you half of it. \`codePointAt\` reads the whole thing, and \`[...s]\` splits correctly.

For a–z problems it never matters. For real user text, it does — and knowing the distinction exists is enough for now.`,
  },
];

export const M7_REPS: Problem[] = [
  rep({
    id: "r.s7.1",
    lesson: "l7.1",
    teaches: ["js.string.basics"],
    title: "Last character",
    prompt:
      "Return the last character. An empty string has no last character — return `\"\"` for it.",
    exportName: "lastChar",
    starter: stub("lastChar", "text"),
    cases: [
      { args: '"forge"', is: '"e"' },
      { args: '"a"', is: '"a"' },
      { args: '""', is: '""' },
    ],
    hint: "`text.at(-1)` counts from the end and gives `undefined` on empty — `?? \"\"` covers that.",
    solution: 'function lastChar(text) {\n  return text.at(-1) ?? "";\n}',
    mistakes: [
      {
        match: "[-1]",
        hint: "Square brackets don't understand negative numbers — `text[-1]` is always `undefined`. `.at(-1)` does.",
      },
    ],
    seconds: 40,
  }),
  rep({
    id: "r.s7.2",
    lesson: "l7.1",
    teaches: ["js.string.basics"],
    title: "Initials",
    prompt:
      "Given a first and last name, return the initials with dots: `\"Ada\", \"Lovelace\"` gives `\"A.L.\"`",
    exportName: "initials",
    starter: stub("initials", "first, last"),
    cases: [
      { args: '"Ada", "Lovelace"', is: '"A.L."' },
      { args: '"Grace", "Hopper"', is: '"G.H."' },
    ],
    hint: "`first[0]` and `last[0]` are the two characters. A template literal joins them with the dots.",
    solution:
      "function initials(first, last) {\n  return `${first[0]}.${last[0]}.`;\n}",
    seconds: 45,
  }),
  rep({
    id: "r.s7.3",
    lesson: "l7.1",
    teaches: ["js.string.basics"],
    title: "Drop both ends",
    prompt:
      "Return the string without its first and last character. Anything two characters or shorter becomes `\"\"`.",
    exportName: "middle",
    starter: stub("middle", "text"),
    cases: [
      { args: '"forge"', is: '"org"' },
      { args: '"ab"', is: '""' },
      { args: '""', is: '""' },
    ],
    hint: "`slice(1, -1)` — start one in from the left, stop one short of the right. It clamps on short input, so no guard is needed.",
    solution: "function middle(text) {\n  return text.slice(1, -1);\n}",
    seconds: 40,
  }),

  rep({
    id: "r.s7.4",
    lesson: "l7.2",
    teaches: ["js.string.search"],
    title: "Where is it",
    prompt:
      "Return the index of `needle` in `text`, or `null` when it isn't there. Don't leak the `-1`.",
    exportName: "position",
    starter: stub("position", "text, needle"),
    cases: [
      { args: '"banana", "a"', is: "1" },
      { args: '"banana", "b"', is: "0" },
      { args: '"banana", "z"', is: "null" },
    ],
    hint: "`indexOf` gives the position or `-1`. Compare against `-1` explicitly — a truthiness check gets index 0 wrong.",
    solution:
      "function position(text, needle) {\n  const i = text.indexOf(needle);\n  return i === -1 ? null : i;\n}",
    mistakes: [
      {
        match: "indexOf(needle))",
        hint: "A position isn't a yes/no. `0` is a real match but falsy, and `-1` is a miss but truthy — so this check is wrong at both ends.",
      },
    ],
    seconds: 55,
  }),
  rep({
    id: "r.s7.5",
    lesson: "l7.2",
    teaches: ["js.string.search"],
    title: "Case-insensitive contains",
    prompt:
      "Does `text` contain `word`, ignoring case on both sides? Return `true` or `false`.",
    exportName: "hasWord",
    starter: stub("hasWord", "text, word"),
    cases: [
      { args: '"The Quick Fox", "quick"', is: "true" },
      { args: '"The Quick Fox", "QUICK"', is: "true" },
      { args: '"The Quick Fox", "zebra"', is: "false" },
      { args: '"", "a"', is: "false" },
    ],
    hint: "Lowercase **both** sides, then `includes`. Flattening only one side passes your own tests and fails real input.",
    solution:
      "function hasWord(text, word) {\n  return text.toLowerCase().includes(word.toLowerCase());\n}",
    seconds: 45,
  }),
  rep({
    id: "r.s7.6",
    lesson: "l7.2",
    teaches: ["js.string.search"],
    title: "Count occurrences",
    prompt:
      "How many times does `needle` appear in `text`? Overlaps don't count — after a match, resume searching just past where it started.",
    exportName: "countOf",
    starter: stub("countOf", "text, needle"),
    cases: [
      { args: '"banana", "a"', is: "3" },
      { args: '"banana", "na"', is: "2" },
      { args: '"banana", "z"', is: "0" },
      { args: '"", "a"', is: "0" },
    ],
    hint: "Start with `indexOf(needle)`. While it isn't `-1`, count it and search again from `i + 1`. Searching from `i` finds the same match forever.",
    solution:
      "function countOf(text, needle) {\n  let count = 0;\n  let i = text.indexOf(needle);\n  while (i !== -1) {\n    count += 1;\n    i = text.indexOf(needle, i + 1);\n  }\n  return count;\n}",
    seconds: 85,
  }),

  rep({
    id: "r.s7.7",
    lesson: "l7.3",
    teaches: ["js.string.split"],
    title: "Words",
    prompt:
      "Split into words on spaces. Stray spaces at the ends or in the middle must not produce empty entries, and `\"\"` gives `[]`.",
    exportName: "words",
    starter: stub("words", "text"),
    cases: [
      { args: '"the quick fox"', is: '["the", "quick", "fox"]' },
      { args: '"  a  b  "', is: '["a", "b"]' },
      { args: '""', is: "[]" },
    ],
    hint: "`trim()` first, then `split(\" \")`, then `filter(Boolean)` to drop the empties runs of spaces leave behind.",
    solution:
      'function words(text) {\n  return text.trim().split(" ").filter(Boolean);\n}',
    seconds: 60,
  }),
  rep({
    id: "r.s7.8",
    lesson: "l7.3",
    teaches: ["js.string.split"],
    title: "Reverse",
    prompt: "Return the string backwards.",
    exportName: "reverse",
    starter: stub("reverse", "text"),
    cases: [
      { args: '"forge"', is: '"egrof"' },
      { args: '"a"', is: '"a"' },
      { args: '""', is: '""' },
    ],
    hint: '`[...text]` makes an array of characters, `reverse()` flips it, `join("")` puts it back.',
    solution: 'function reverse(text) {\n  return [...text].reverse().join("");\n}',
    mistakes: [
      {
        match: "text.reverse(",
        hint: "`reverse` is an array method — strings don't have it. Become an array first.",
      },
    ],
    seconds: 50,
  }),
  rep({
    id: "r.s7.9",
    lesson: "l7.3",
    teaches: ["js.string.split", "js.array.map"],
    title: "Title case",
    prompt:
      "Capitalise the first letter of every word, leaving the rest of each word as it is. Single spaces between words.",
    exportName: "titleCase",
    starter: stub("titleCase", "text"),
    cases: [
      { args: '"the quick fox"', is: '"The Quick Fox"' },
      { args: '"ada"', is: '"Ada"' },
      { args: '""', is: '""' },
    ],
    hint: 'Split on `" "`, `map` each word to `w[0].toUpperCase() + w.slice(1)`, join back with `" "`. Guard the empty word so `w[0]` isn\'t `undefined`.',
    solution:
      'function titleCase(text) {\n  return text\n    .split(" ")\n    .map(w => (w ? w[0].toUpperCase() + w.slice(1) : w))\n    .join(" ");\n}',
    seconds: 80,
  }),

  rep({
    id: "r.s7.10",
    lesson: "l7.4",
    teaches: ["js.string.methods"],
    title: "Two digits",
    prompt:
      "Format a number as at least two digits: `7` gives `\"07\"`, `12` gives `\"12\"`, `123` stays `\"123\"`.",
    exportName: "twoDigits",
    starter: stub("twoDigits", "n"),
    cases: [
      { args: "7", is: '"07"' },
      { args: "12", is: '"12"' },
      { args: "123", is: '"123"' },
      { args: "0", is: '"00"' },
    ],
    hint: '`String(n).padStart(2, "0")`. The `2` is the total length you want, not how many characters to add.',
    solution: 'function twoDigits(n) {\n  return String(n).padStart(2, "0");\n}',
    mistakes: [
      {
        match: "n.padStart(",
        hint: "`padStart` is a string method. Numbers don't have it — convert with `String(n)` first.",
      },
    ],
    seconds: 45,
  }),
  rep({
    id: "r.s7.11",
    lesson: "l7.4",
    teaches: ["js.string.methods"],
    title: "Clock",
    prompt:
      "Turn a count of seconds into `\"m:ss\"`. The minutes aren't padded; the seconds always are.",
    exportName: "clock",
    starter: stub("clock", "seconds"),
    cases: [
      { args: "0", is: '"0:00"' },
      { args: "7", is: '"0:07"' },
      { args: "65", is: '"1:05"' },
      { args: "600", is: '"10:00"' },
    ],
    hint: "`Math.floor(seconds / 60)` for the minutes, `seconds % 60` for the remainder, then pad the remainder to 2.",
    solution:
      'function clock(seconds) {\n  const m = Math.floor(seconds / 60);\n  const s = seconds % 60;\n  return `${m}:${String(s).padStart(2, "0")}`;\n}',
    seconds: 70,
  }),
  rep({
    id: "r.s7.12",
    lesson: "l7.4",
    teaches: ["js.string.methods"],
    title: "Truncate",
    prompt:
      "If the text is longer than `max`, cut it to `max` characters and add `\"...\"`. Otherwise return it unchanged.\n\nThe `\"...\"` is extra — a 5-character cut returns 8 characters.",
    exportName: "truncate",
    starter: stub("truncate", "text, max"),
    cases: [
      { args: '"javascript", 4', is: '"java..."' },
      { args: '"java", 4', is: '"java"' },
      { args: '"", 4', is: '""' },
    ],
    hint: "A guard clause first: if it already fits, return it. Otherwise `slice(0, max)` and append.",
    solution:
      'function truncate(text, max) {\n  if (text.length <= max) return text;\n  return text.slice(0, max) + "...";\n}',
    seconds: 55,
  }),

  rep({
    id: "r.s7.13",
    lesson: "l7.5",
    teaches: ["js.string.codes"],
    title: "Letter index",
    prompt:
      "Turn a single lowercase letter into its position in the alphabet, zero-based: `\"a\"` gives `0`, `\"z\"` gives `25`.",
    exportName: "letterIndex",
    starter: stub("letterIndex", "ch"),
    cases: [
      { args: '"a"', is: "0" },
      { args: '"c"', is: "2" },
      { args: '"z"', is: "25" },
    ],
    hint: 'Subtract the code of `"a"` from the code of `ch`. The alphabet is 26 consecutive numbers, so the difference is the position.',
    solution:
      'function letterIndex(ch) {\n  return ch.charCodeAt(0) - "a".charCodeAt(0);\n}',
    seconds: 45,
  }),
  rep({
    id: "r.s7.14",
    lesson: "l7.5",
    teaches: ["js.string.codes"],
    title: "Shift a letter",
    prompt:
      "Move a lowercase letter `n` places along the alphabet, wrapping past `\"z\"` back to `\"a\"`.",
    exportName: "shift",
    starter: stub("shift", "ch, n"),
    cases: [
      { args: '"a", 1', is: '"b"' },
      { args: '"z", 1', is: '"a"' },
      { args: '"a", 26', is: '"a"' },
      { args: '"m", 13', is: '"z"' },
    ],
    hint: 'Convert to 0–25, add `n`, take `% 26` to wrap, then add `"a"`\'s code back and use `String.fromCharCode`.',
    solution:
      'function shift(ch, n) {\n  const a = "a".charCodeAt(0);\n  const at = (ch.charCodeAt(0) - a + n) % 26;\n  return String.fromCharCode(a + at);\n}',
    seconds: 80,
  }),
  rep({
    id: "r.s7.15",
    lesson: "l7.5",
    teaches: ["js.string.codes"],
    title: "Frequency array",
    prompt:
      "Return a 26-slot array counting each lowercase letter in the word. Slot 0 is `\"a\"`, slot 25 is `\"z\"`.",
    exportName: "letterCounts",
    starter: stub("letterCounts", "word"),
    tests: [
      {
        name: "counts a and b",
        code: `const out = fn("bab");
expect(out[0]).toBe(1);
expect(out[1]).toBe(2);`,
      },
      {
        name: "always 26 slots",
        code: `expect(fn("").length).toBe(26);`,
      },
      {
        name: "unused letters are 0, not empty",
        code: `expect(fn("a").every(n => typeof n === "number")).toBe(true);`,
      },
    ],
    hint: '`new Array(26).fill(0)` — without the `.fill(0)` the slots are empty and `+= 1` gives `NaN`. Then walk the word, incrementing at `charCodeAt(0) - 97`.',
    solution:
      'function letterCounts(word) {\n  const a = "a".charCodeAt(0);\n  const counts = new Array(26).fill(0);\n  for (const ch of word) {\n    counts[ch.charCodeAt(0) - a] += 1;\n  }\n  return counts;\n}',
    mistakes: [
      {
        match: "new Array(26);",
        hint: "An array made this way has empty slots, not zeros. `undefined + 1` is `NaN`. Add `.fill(0)`.",
      },
    ],
    seconds: 90,
  }),
];

export const M7_LESSONS: Lesson[] = [
  {
    id: "l7.1",
    moduleId: "m7",
    title: "Indexing and slicing",
    goal: "Reach any character, take any piece, and stop expecting text to change in place.",
    atomId: "teach.str-basics",
    repIds: ["r.s7.1", "r.s7.2", "r.s7.3"],
    problemIds: [],
  },
  {
    id: "l7.2",
    moduleId: "m7",
    title: "Searching and replacing",
    goal: "Find text without falling into the -1 trap, and replace all of it rather than the first.",
    atomId: "teach.str-search",
    repIds: ["r.s7.4", "r.s7.5", "r.s7.6"],
    problemIds: [],
  },
  {
    id: "l7.3",
    moduleId: "m7",
    title: "Splitting and joining",
    goal: "Move between text and arrays so every array method becomes a string method.",
    atomId: "teach.str-split",
    repIds: ["r.s7.7", "r.s7.8", "r.s7.9"],
    problemIds: [],
  },
  {
    id: "l7.4",
    moduleId: "m7",
    title: "Building strings",
    goal: "Pad, trim, repeat and assemble text without rebuilding it a thousand times.",
    atomId: "teach.str-build",
    repIds: ["r.s7.10", "r.s7.11", "r.s7.12"],
    problemIds: [],
  },
  {
    id: "l7.5",
    moduleId: "m7",
    title: "Characters as numbers",
    goal: "The 26-slot frequency array — the most reused trick in string problems.",
    atomId: "teach.str-codes",
    repIds: ["r.s7.13", "r.s7.14", "r.s7.15"],
    problemIds: [],
  },
];

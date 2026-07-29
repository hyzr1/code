import type { Drill } from "../types";

/**
 * Drills are the cheap reps: 15-45 seconds each.
 *
 * They exist because "do another problem" is a 30-minute rep that trains six
 * skills badly. If your failures cluster on recall, fifty 20-second retrievals
 * beat one more implementation — same clock time, fifty times the practice on
 * the thing that's actually broken.
 */
export const DRILLS: Drill[] = [
  // ------------------------------------------------- predict the output
  {
    id: "d.predict.sort-default",
    kind: "predict-output",
    teaches: ["js.array.sort"],
    estimatedSeconds: 20,
    prompt: "What does this log?",
    code: `console.log([10, 9, 1].sort());`,
    choices: ["[1, 9, 10]", "[1, 10, 9]", "[10, 9, 1]", "[9, 10, 1]"],
    answer: 1,
    explanation:
      "Default sort compares elements as strings. \"10\" < \"9\" because it compares character by character, and \"1\" comes before \"9\". Pass (a, b) => a - b for numbers.",
  },
  {
    id: "d.predict.closure-var",
    kind: "predict-output",
    teaches: ["js.functions.closures", "js.scope.block-scope"],
    estimatedSeconds: 30,
    prompt: "What does this log?",
    code: `const fns = [];
for (var i = 0; i < 3; i++) fns.push(() => i);
console.log(fns.map(f => f()));`,
    choices: ["[0, 1, 2]", "[3, 3, 3]", "[undefined, undefined, undefined]", "[0, 0, 0]"],
    answer: 1,
    explanation:
      "var i is one variable for the whole function. All three closures link to that same i, and the loop leaves it at 3. Swap var for let and each iteration gets its own i, giving [0, 1, 2].",
  },
  {
    id: "d.predict.event-loop-basic",
    kind: "predict-output",
    teaches: ["js.async.event-loop"],
    estimatedSeconds: 30,
    prompt: "What order does this log?",
    code: `console.log("A");
setTimeout(() => console.log("B"), 0);
Promise.resolve().then(() => console.log("C"));
console.log("D");`,
    choices: ["A B C D", "A D C B", "A D B C", "A C D B"],
    answer: 1,
    explanation:
      "Synchronous first: A, D. Then the microtask queue drains completely: C. Then one macrotask: B. Microtasks (promises) always beat macrotasks (timers), even a 0ms one.",
  },
  {
    id: "d.predict.await-boundary",
    kind: "predict-output",
    teaches: ["js.async.event-loop", "js.async.promises"],
    estimatedSeconds: 35,
    prompt: "What order does this log?",
    code: `async function run() {
  console.log("1");
  await null;
  console.log("3");
}
run();
console.log("2");`,
    choices: ["1 2 3", "1 3 2", "2 1 3", "3 1 2"],
    answer: 0,
    explanation:
      "await always yields, even on a non-promise. Everything after it is queued as a microtask, so control returns to the caller and 2 runs before 3.",
  },
  {
    id: "d.predict.sort-mutates",
    kind: "predict-output",
    teaches: ["js.array.mutation", "js.array.sort"],
    estimatedSeconds: 25,
    prompt: "What does this log?",
    code: `const scores = [3, 1, 2];
const sorted = scores.sort();
console.log(scores);`,
    choices: ["[3, 1, 2]", "[1, 2, 3]", "undefined", "[]"],
    answer: 1,
    explanation:
      "sort mutates in place and returns the same array. sorted and scores are two names for one array. Use [...scores].sort() or scores.toSorted() to leave the original alone.",
  },
  {
    id: "d.predict.spread-shallow",
    kind: "predict-output",
    teaches: ["js.values.reference", "js.object.destructuring"],
    estimatedSeconds: 30,
    prompt: "What does this log?",
    code: `const a = { tags: ["x"] };
const b = { ...a };
b.tags.push("y");
console.log(a.tags);`,
    choices: ['["x"]', '["x", "y"]', '["y"]', "undefined"],
    answer: 1,
    explanation:
      "Spread copies one level. b is a new object, but b.tags is a copy of the reference, so both point at the same array. Use structuredClone for a deep copy.",
  },
  {
    id: "d.predict.reduce-no-seed",
    kind: "predict-output",
    teaches: ["js.array.reduce"],
    estimatedSeconds: 25,
    prompt: "What happens?",
    code: `console.log([].reduce((a, b) => a + b));`,
    choices: ["0", "undefined", "NaN", "TypeError"],
    answer: 3,
    explanation:
      "With no seed, reduce takes the first element as the starting value. An empty array has none, so it throws \"Reduce of empty array with no initial value\". Always pass the seed.",
  },
  {
    id: "d.predict.this-detached",
    kind: "predict-output",
    teaches: ["js.functions.this"],
    estimatedSeconds: 30,
    prompt: "What happens on the last line?",
    code: `const counter = { n: 0, inc() { this.n++; } };
const inc = counter.inc;
inc();`,
    choices: [
      "counter.n becomes 1",
      "TypeError — this is undefined",
      "Nothing, silently",
      "ReferenceError",
    ],
    answer: 1,
    explanation:
      "this comes from the call site. There's no dot before inc(), so this is undefined in a module, and reading .n on undefined throws. Fix with .bind(counter) or a wrapper arrow.",
  },
  {
    id: "d.predict.coercion-eq",
    kind: "predict-output",
    teaches: ["js.values.coercion"],
    estimatedSeconds: 25,
    prompt: "What does this log?",
    code: `console.log([] == false, [] === false);`,
    choices: ["true true", "true false", "false false", "false true"],
    answer: 1,
    explanation:
      "== converts both sides. [] becomes \"\" becomes 0, and false becomes 0, so they match. === compares types first, and an array is never a boolean.",
  },
  {
    id: "d.predict.reference-equality",
    kind: "predict-output",
    teaches: ["js.values.reference"],
    estimatedSeconds: 20,
    prompt: "What does this log?",
    code: `console.log([1, 2] === [1, 2]);`,
    choices: ["true", "false"],
    answer: 1,
    explanation:
      "=== on objects asks \"the same object?\", not \"the same contents?\". Those are two separate arrays that happen to look alike.",
  },
  {
    id: "d.predict.map-holes",
    kind: "predict-output",
    teaches: ["js.array.iteration"],
    estimatedSeconds: 30,
    prompt: "What does this log?",
    code: `console.log(new Array(3).map((_, i) => i));`,
    choices: ["[0, 1, 2]", "[empty × 3]", "[undefined, undefined, undefined]", "[]"],
    answer: 1,
    explanation:
      "new Array(3) makes holes, not undefined values, and map skips holes. Use Array.from({ length: 3 }, (_, i) => i) instead.",
  },
  {
    id: "d.predict.tdz",
    kind: "predict-output",
    teaches: ["js.scope.block-scope"],
    estimatedSeconds: 25,
    prompt: "What happens?",
    code: `console.log(x);
let x = 1;`,
    choices: ["undefined", "1", "ReferenceError", "TypeError"],
    answer: 2,
    explanation:
      "let and const are hoisted but sit in the temporal dead zone until the declaration runs. Reading one before that throws. var would have logged undefined.",
  },

  // ------------------------------------------------------- API recall
  {
    id: "d.api.slice-splice",
    kind: "api-recall",
    teaches: ["js.array.mutation"],
    estimatedSeconds: 20,
    prompt:
      "Which one changes the original array — slice or splice? One word.",
    answer: "splice",
    accept: ["splice", "splice()", "arr.splice"],
    explanation:
      "splice mutates and returns what it removed. slice copies and leaves the original alone. Memory hook: the one with the extra letter does the extra damage.",
  },
  {
    id: "d.api.last-element",
    kind: "api-recall",
    teaches: ["js.array.iteration"],
    estimatedSeconds: 20,
    prompt: "Get the last element of `arr` — the modern one-method way.",
    answer: "arr.at(-1)",
    accept: ["arr.at(-1)", "at(-1)", "arr.at( -1 )"],
    explanation:
      "at() accepts negative indices. arr[arr.length - 1] still works; arr[-1] never did, because that's just a property named \"-1\".",
  },
  {
    id: "d.api.findindex-miss",
    kind: "api-recall",
    teaches: ["js.array.iteration"],
    estimatedSeconds: 20,
    prompt: "What does `findIndex` return when nothing matches?",
    answer: "-1",
    accept: ["-1", "negative one", "minus 1"],
    explanation:
      "-1, like indexOf. find returns undefined instead. That difference is why `if (arr.findIndex(...))` is a bug — index 0 is falsy and -1 is truthy, exactly backwards.",
  },
  {
    id: "d.api.entries-shape",
    kind: "api-recall",
    teaches: ["js.object.iteration"],
    estimatedSeconds: 20,
    prompt: "What shape does `Object.entries({ a: 1 })` return?",
    answer: '[["a", 1]]',
    accept: ['[["a",1]]', '[["a", 1]]', "[['a',1]]", "[['a', 1]]", "array of key value pairs"],
    explanation:
      "An array of [key, value] pairs. That's why you'll usually destructure in the loop: for (const [key, value] of Object.entries(obj)).",
  },
  {
    id: "d.api.dedupe",
    kind: "api-recall",
    teaches: ["js.mapset"],
    estimatedSeconds: 25,
    prompt: "Remove duplicates from `arr` in one expression.",
    answer: "[...new Set(arr)]",
    accept: ["[...new Set(arr)]", "Array.from(new Set(arr))", "[... new Set(arr)]"],
    explanation:
      "A Set drops duplicates on insert, and spread turns it back into an array. Uses SameValueZero, so NaN dedupes correctly — unlike indexOf.",
  },
  {
    id: "d.api.map-missing",
    kind: "api-recall",
    teaches: ["js.mapset"],
    estimatedSeconds: 20,
    prompt: "What does `map.get(key)` return when the key isn't there?",
    answer: "undefined",
    accept: ["undefined"],
    explanation:
      "undefined — same as a missing object property. Use map.has(key) when undefined is a legitimate stored value.",
  },
  {
    id: "d.api.replace-all",
    kind: "api-recall",
    teaches: ["js.string.methods"],
    estimatedSeconds: 20,
    prompt:
      "`\"a-b-c\".replace(\"-\", \"+\")` gives \"a+b-c\". What replaces every one?",
    answer: "replaceAll",
    accept: ["replaceAll", "replaceall", ".replaceAll", "replaceAll()"],
    explanation:
      "replace with a string only swaps the first match. replaceAll does all of them, as does replace with a /g regex.",
  },
  {
    id: "d.api.number-parse",
    kind: "api-recall",
    teaches: ["js.values.coercion"],
    estimatedSeconds: 25,
    prompt: 'What does `parseInt("08px")` return?',
    answer: "8",
    accept: ["8"],
    explanation:
      "parseInt reads leading digits and stops at the first thing that isn't one. Number(\"08px\") gives NaN instead, because it demands the whole string.",
  },
  {
    id: "d.api.array-from-length",
    kind: "api-recall",
    teaches: ["js.array.iteration"],
    estimatedSeconds: 25,
    prompt: "Build [0, 1, 2, 3, 4] in one expression.",
    answer: "Array.from({ length: 5 }, (_, i) => i)",
    accept: [
      "Array.from({length: 5}, (_, i) => i)",
      "Array.from({ length: 5 }, (_, i) => i)",
      "[...Array(5)].map((_, i) => i)",
      "[...Array(5).keys()]",
    ],
    explanation:
      "Array.from takes a map function as its second argument, so no chaining needed. [...Array(5).keys()] is the shorter trick.",
  },
  {
    id: "d.api.includes-nan",
    kind: "api-recall",
    teaches: ["js.array.iteration", "js.values.coercion"],
    estimatedSeconds: 25,
    prompt: "Which finds NaN in an array — `indexOf` or `includes`?",
    answer: "includes",
    accept: ["includes", "includes()", ".includes"],
    explanation:
      "indexOf uses ===, and NaN === NaN is false, so it never finds it. includes uses SameValueZero, which treats NaN as equal to itself.",
  },
  {
    id: "d.api.object-key-order",
    kind: "api-recall",
    teaches: ["js.object.iteration"],
    estimatedSeconds: 25,
    prompt:
      'For `{ b: 1, 2: 1, a: 1 }`, which key does `Object.keys` list first?',
    answer: "2",
    accept: ["2", '"2"', "'2'"],
    explanation:
      "Integer-like keys come first in ascending order, then string keys in insertion order. This is why using numeric ids as object keys silently reorders your data.",
  },
  {
    id: "d.api.promise-all-reject",
    kind: "api-recall",
    teaches: ["js.async.combinators"],
    estimatedSeconds: 25,
    prompt:
      "Which combinator waits for every promise and never rejects?",
    answer: "Promise.allSettled",
    accept: ["Promise.allSettled", "allSettled", "allsettled"],
    explanation:
      "allSettled resolves with { status, value } or { status, reason } for each. Promise.all rejects the moment any one rejects, discarding the rest.",
  },

  // -------------------------------------------------------- type it out
  {
    id: "d.type.sum",
    kind: "type-it-out",
    teaches: ["js.array.reduce"],
    estimatedSeconds: 25,
    prompt: "Sum the numbers in `nums` with reduce. One expression.",
    target: "nums.reduce((sum, n) => sum + n, 0)",
    explanation:
      "The seed matters. Without 0 this throws on an empty array — the bug that only shows up in production.",
  },
  {
    id: "d.type.sort-desc",
    kind: "type-it-out",
    teaches: ["js.array.sort", "js.array.mutation"],
    estimatedSeconds: 30,
    prompt:
      "Sort `users` by `age`, oldest first, without mutating `users`. One expression.",
    target: "[...users].sort((a, b) => b.age - a.age)",
    explanation:
      "Copy first, then sort. b - a for descending. Returning a boolean here is the classic silent bug.",
  },
  {
    id: "d.type.group-init",
    kind: "type-it-out",
    teaches: ["js.array.reduce", "js.object.iteration"],
    estimatedSeconds: 35,
    prompt:
      "Inside a reduce, push `item` into `acc[key]`, creating the array if missing. One line.",
    target: "(acc[key] ??= []).push(item)",
    explanation:
      "??= assigns only when null or undefined, and the whole expression evaluates to the array. The long form is acc[key] = acc[key] || []; acc[key].push(item).",
  },
  {
    id: "d.type.entries-loop",
    kind: "type-it-out",
    teaches: ["js.object.iteration", "js.object.destructuring"],
    estimatedSeconds: 30,
    prompt: "Loop over `obj` with both key and value destructured. Header line only.",
    target: "for (const [key, value] of Object.entries(obj))",
    explanation:
      "entries gives [key, value] pairs, so you destructure in the loop head. for...in gives keys only, and walks inherited ones too.",
  },
  {
    id: "d.type.dedupe-by",
    kind: "type-it-out",
    teaches: ["js.mapset"],
    estimatedSeconds: 35,
    prompt: "Dedupe `users` by `id`, keeping the last of each. One expression.",
    target: "[...new Map(users.map(u => [u.id, u])).values()]",
    explanation:
      "Building a Map from pairs keeps the last write per key. Reverse the array first if you want the first one instead.",
  },
  {
    id: "d.type.debounce-shape",
    kind: "type-it-out",
    teaches: ["js.functions.closures", "js.functions.hof"],
    estimatedSeconds: 40,
    prompt:
      "The two lines inside a debounce's returned function: clear the pending timer, then set a new one calling `fn` with the args.",
    target:
      "clearTimeout(timer); timer = setTimeout(() => fn(...args), ms);",
    explanation:
      "timer lives in the closure, outside the returned function, so it survives between calls. That's the entire trick.",
  },
  {
    id: "d.type.deep-clone",
    kind: "type-it-out",
    teaches: ["js.values.reference"],
    estimatedSeconds: 20,
    prompt: "Deep copy `state` with the built-in. One expression.",
    target: "structuredClone(state)",
    explanation:
      "Handles nested objects, Maps, Sets, Dates, and cycles. It cannot clone functions. JSON.parse(JSON.stringify(x)) silently destroys Dates, undefined, and NaN.",
  },
  {
    id: "d.type.await-all",
    kind: "type-it-out",
    teaches: ["js.async.combinators"],
    estimatedSeconds: 30,
    prompt:
      "Fetch every url in `urls` in parallel and await the array of responses. One expression.",
    target: "await Promise.all(urls.map(url => fetch(url)))",
    explanation:
      "map first to start them all, then await once. Awaiting inside a for loop runs them one at a time — correct, but as slow as the sum of all of them.",
  },

  // --------------------------------------------------------- complexity
  {
    id: "d.big-o.nested-loop",
    kind: "complexity",
    teaches: ["meta.complexity"],
    estimatedSeconds: 15,
    prompt: "Time complexity?",
    code: `for (const a of arr)
  for (const b of arr)
    if (a + b === t) return true;`,
    choices: ["O(n)", "O(n log n)", "O(n²)", "O(2ⁿ)"],
    answer: 2,
    explanation: "Every element paired with every element. n × n.",
  },
  {
    id: "d.big-o.includes-in-loop",
    kind: "complexity",
    teaches: ["meta.complexity", "pattern.hash-map"],
    estimatedSeconds: 20,
    prompt: "Time complexity?",
    code: `for (const x of a)
  if (b.includes(x)) out.push(x);`,
    choices: ["O(n)", "O(n + m)", "O(n × m)", "O(n log n)"],
    answer: 2,
    explanation:
      "includes is a linear scan, and it's inside a loop. This is the most common accidental O(n²) in real code. new Set(b) makes it O(n + m).",
  },
  {
    id: "d.big-o.sort-then-scan",
    kind: "complexity",
    teaches: ["meta.complexity"],
    estimatedSeconds: 20,
    prompt: "Time complexity?",
    code: `arr.sort((a, b) => a - b);
for (const x of arr) total += x;`,
    choices: ["O(n)", "O(n log n)", "O(n²)", "O(log n)"],
    answer: 1,
    explanation:
      "Sort dominates at O(n log n); the scan adds O(n). You keep the larger term.",
  },
  {
    id: "d.big-o.binary-search",
    kind: "complexity",
    teaches: ["meta.complexity"],
    estimatedSeconds: 15,
    prompt: "Time complexity?",
    code: `while (lo <= hi) {
  const mid = (lo + hi) >> 1;
  if (arr[mid] === t) return mid;
  arr[mid] < t ? lo = mid + 1 : hi = mid - 1;
}`,
    choices: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
    answer: 1,
    explanation: "The search space halves each pass.",
  },
  {
    id: "d.big-o.space-map",
    kind: "complexity",
    teaches: ["meta.complexity", "pattern.hash-map"],
    estimatedSeconds: 20,
    prompt: "SPACE complexity?",
    code: `const seen = new Map();
for (let i = 0; i < nums.length; i++) {
  if (seen.has(t - nums[i])) return true;
  seen.set(nums[i], i);
}`,
    choices: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
    answer: 2,
    explanation:
      "The map can hold every element. That's the hash-map trade: O(n) memory bought you O(n) time instead of O(n²).",
  },
  {
    id: "d.big-o.string-concat",
    kind: "complexity",
    teaches: ["meta.complexity", "js.string.methods"],
    estimatedSeconds: 25,
    prompt: "Time complexity?",
    code: `let out = "";
for (const c of str) out = c + out;`,
    choices: ["O(n)", "O(n log n)", "O(n²)", "O(1)"],
    answer: 2,
    explanation:
      "Strings are immutable, so each concat builds a whole new string. n operations copying up to n characters. Push to an array and join instead.",
  },

  // --------------------------------------------------------- pattern id
  {
    id: "d.pat.two-sum",
    kind: "pattern-id",
    teaches: ["pattern.hash-map"],
    estimatedSeconds: 30,
    prompt:
      "\"Given an unsorted array and a target, return the indices of two numbers that add to it.\" Which pattern?",
    choices: ["Two pointers", "Hash map", "Sliding window", "Binary search"],
    answer: 1,
    explanation:
      "Unsorted plus \"return indices\" rules out two pointers, since sorting destroys the indices. Store each number as you pass it and look up its complement.",
  },
  {
    id: "d.pat.longest-substring",
    kind: "pattern-id",
    teaches: ["pattern.sliding-window"],
    estimatedSeconds: 30,
    prompt:
      "\"Longest substring with no repeated characters.\" Which pattern?",
    choices: ["Sliding window", "Backtracking", "Hash map", "Two pointers"],
    answer: 0,
    explanation:
      "\"Longest contiguous run satisfying a condition\" is the sliding-window fingerprint. Grow the right edge, and pull the left edge in when the condition breaks.",
  },
  {
    id: "d.pat.sorted-pair",
    kind: "pattern-id",
    teaches: ["pattern.two-pointer"],
    estimatedSeconds: 30,
    prompt:
      "\"Given a SORTED array, find two numbers that sum to a target.\" Which pattern?",
    choices: ["Hash map", "Two pointers", "Binary search", "Sliding window"],
    answer: 1,
    explanation:
      "Sorted plus pairs means two pointers, at O(1) space. Too small, move left in; too big, move right in. A hash map also works but costs O(n) memory for nothing.",
  },
  {
    id: "d.pat.kth-largest",
    kind: "pattern-id",
    teaches: ["meta.complexity"],
    estimatedSeconds: 30,
    prompt: "\"Find the kth largest element in a stream of numbers.\" Which pattern?",
    choices: ["Sort every time", "Min-heap of size k", "Binary search", "Hash map"],
    answer: 1,
    explanation:
      "\"Top k\" plus \"stream\" means a heap. Keep a min-heap of size k; its root is the answer. O(log k) per insert instead of O(n log n) per query.",
  },
  {
    id: "d.pat.all-combinations",
    kind: "pattern-id",
    teaches: ["js.functions.recursion"],
    estimatedSeconds: 30,
    prompt:
      "\"Return every valid arrangement of n pairs of parentheses.\" Which pattern?",
    choices: ["Dynamic programming", "Backtracking", "Greedy", "Sliding window"],
    answer: 1,
    explanation:
      "\"Return all of them\" means you must build each one, so backtracking. \"Return how many\" would have been DP.",
  },
  {
    id: "d.pat.min-rooms",
    kind: "pattern-id",
    teaches: ["meta.complexity"],
    estimatedSeconds: 35,
    prompt:
      "\"Given meeting start and end times, find the fewest rooms needed.\" Which pattern?",
    choices: [
      "Sort by start, then a min-heap of end times",
      "Two pointers",
      "Hash map counting",
      "Backtracking",
    ],
    answer: 0,
    explanation:
      "Intervals plus \"how many overlap at once\" means sort by start and keep a heap of end times. The heap size is your room count.",
  },
  {
    id: "d.pat.cycle-detect",
    kind: "pattern-id",
    teaches: ["pattern.two-pointer"],
    estimatedSeconds: 30,
    prompt: "\"Does this linked list have a cycle? O(1) space.\" Which pattern?",
    choices: ["Hash set of visited nodes", "Fast and slow pointers", "Recursion", "Sorting"],
    answer: 1,
    explanation:
      "A visited set works but costs O(n). The O(1) constraint forces Floyd's — one pointer moves twice as fast, and they meet if there's a loop.",
  },
  {
    id: "d.pat.word-count",
    kind: "pattern-id",
    teaches: ["pattern.hash-map"],
    estimatedSeconds: 25,
    prompt: "\"Are these two strings anagrams of each other?\" Which pattern?",
    choices: ["Sliding window", "Two pointers", "Character counts in a map", "Backtracking"],
    answer: 2,
    explanation:
      "Count characters in both and compare, at O(n). Sorting both also works but costs O(n log n) for no benefit.",
  },
];

export const DRILL_BY_ID = new Map(DRILLS.map((d) => [d.id, d]));

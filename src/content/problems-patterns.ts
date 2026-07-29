import type { Problem } from "../types";

/**
 * Pattern problems — the interview-shaped work.
 *
 * The scheduler never serves these blocked by topic. If you can predict the
 * category before reading the statement, you're training execution while
 * skipping the recognition step the interview actually tests.
 */
export const PATTERN_PROBLEMS: Problem[] = [
  {
    id: "p.two-sum",
    kind: "problem",
    tier: "problem",
    title: "Two Sum",
    pattern: "hash-map",
    teaches: ["pattern.hash-map", "js.mapset", "meta.complexity"],
    requires: ["js.mapset"],
    difficulty: { concept: 2, implementation: 2, recall: 3 },
    estimatedMinutes: 12,
    exportName: "twoSum",
    prompt: `Given an unsorted array \`nums\` and a \`target\`, return the indices of the two numbers that add up to it.

Exactly one answer exists. You may not use the same element twice.

\`\`\`js
twoSum([2, 7, 11, 15], 9); // [0, 1]
twoSum([3, 2, 4], 6);      // [1, 2]
twoSum([3, 3], 6);         // [0, 1]
\`\`\`

**One pass. O(n) time.** The nested-loop version fails the timing test.`,
    scaffolds: {
      L1: `function twoSum(nums, target) {
  const seen = new Map();
  for (let i = 0; i < nums.length; i++) {
    const need = /* what value would complete this pair? */;
    // Have we already walked past it?
    // If not, remember this number and where it was.
  }
}`,
      L2: `function twoSum(nums, target) {
  // One pass. As you go, remember each number and its index.
}`,
      L3: `function twoSum(nums, target) {

}`,
      L4: `// Define: twoSum(nums, target)
`,
    },
    tests: [
      { name: "basic", code: `expect(fn([2, 7, 11, 15], 9)).toEqual([0, 1]);` },
      { name: "answer is not at the start", code: `expect(fn([3, 2, 4], 6)).toEqual([1, 2]);` },
      {
        name: "duplicate values",
        hidden: true,
        code: `expect(fn([3, 3], 6)).toEqual([0, 1]);`,
      },
      {
        name: "negative numbers",
        hidden: true,
        code: `expect(fn([-1, -2, -3, -4], -6)).toEqual([1, 3]);`,
      },
      {
        name: "a zero in the pair",
        hidden: true,
        code: `expect(fn([0, 4, 3, 0], 0)).toEqual([0, 3]);`,
      },
      {
        name: "fast enough on 20000 elements",
        hidden: true,
        code: `const nums = Array.from({ length: 20000 }, (_, i) => i);
const started = Date.now();
expect(fn(nums, 39997)).toEqual([19998, 19999]);
expect(Date.now() - started).toBeLessThan(120);`,
      },
    ],
    hints: [
      {
        rung: 0,
        text: "Your inner loop is re-reading numbers you already walked past.",
      },
      {
        rung: 1,
        text: "A `Map` from value to index. The question isn't \"is there a pair?\" — it's \"have I already seen the number that completes *this* one?\"",
      },
      {
        rung: 2,
        text: "Make an empty `Map`. Walk the array once with an index. At each element, compute `target - nums[i]` — the number that would complete the pair. Ask the map whether you've already seen it; if so, return `[map.get(need), i]`, in that order, since the earlier index comes first. Otherwise store `nums[i]` as the key and `i` as the value, and continue. Store *after* checking, or an element whose double is the target will match itself.",
      },
    ],
    walkthrough: [
      "At index `i`, what single number would make a valid pair with `nums[i]`?",
      "To answer \"have I seen that number before?\" instantly, what do you store as you walk — and what do you store as the key?",
      "When you find a match, where does the other index come from?",
      "For `[3, 3]` with target 6: if you store before you check, what goes wrong?",
    ],
    commonMistakes: [
      {
        match: "for (let j",
        hint: "A nested loop is O(n²) and the 20,000-element hidden test will time out. One pass, with a map.",
      },
      {
        match: "indexOf",
        hint: "`indexOf` scans the array, so it's a hidden inner loop. Same O(n²) problem.",
      },
    ],
    solution: `function twoSum(nums, target) {
  const seen = new Map();
  for (let i = 0; i < nums.length; i++) {
    const need = target - nums[i];
    if (seen.has(need)) return [seen.get(need), i];
    seen.set(nums[i], i);
  }
  return [];
}`,
  },

  {
    id: "p.longest-unique",
    kind: "problem",
    tier: "problem",
    title: "Longest substring without repeats",
    pattern: "sliding-window",
    teaches: ["pattern.sliding-window", "js.mapset", "meta.complexity"],
    requires: ["js.mapset", "pattern.two-pointer"],
    difficulty: { concept: 3, implementation: 3, recall: 4 },
    estimatedMinutes: 18,
    exportName: "longestUnique",
    prompt: `Return the length of the longest substring with no repeated characters.

\`\`\`js
longestUnique("abcabcbb"); // 3  — "abc"
longestUnique("bbbbb");    // 1  — "b"
longestUnique("pwwkew");   // 3  — "wke", not "pwke"
longestUnique("");         // 0
\`\`\`

The answer must be **contiguous**. \`"pwke"\` is a subsequence, not a substring.

O(n) time.`,
    scaffolds: {
      L1: `function longestUnique(s) {
  const lastSeen = new Map();
  let best = 0;
  let start = 0;

  for (let end = 0; end < s.length; end++) {
    const char = s[end];
    // If we've seen this char inside the current window,
    // move \`start\` past its previous position.

    // Record where we saw it, then update \`best\`.
  }
  return best;
}`,
      L2: `function longestUnique(s) {
  // Grow the window on the right. When a repeat appears,
  // jump the left edge past the previous copy.
}`,
      L3: `function longestUnique(s) {

}`,
      L4: `// Define: longestUnique(s)
`,
    },
    tests: [
      { name: "abcabcbb", code: `expect(fn("abcabcbb")).toBe(3);` },
      { name: "all the same character", code: `expect(fn("bbbbb")).toBe(1);` },
      {
        name: "pwwkew — must be contiguous",
        hidden: true,
        code: `expect(fn("pwwkew")).toBe(3);`,
      },
      { name: "empty string", hidden: true, code: `expect(fn("")).toBe(0);` },
      {
        name: "repeat outside the window",
        hidden: true,
        code: `expect(fn("abba")).toBe(2);`,
      },
      {
        name: "no repeats at all",
        hidden: true,
        code: `expect(fn("abcdef")).toBe(6);`,
      },
      {
        name: "fast on 50000 characters",
        hidden: true,
        code: `const s = "abcdefghij".repeat(5000);
const started = Date.now();
expect(fn(s)).toBe(10);
expect(Date.now() - started).toBeLessThan(150);`,
      },
    ],
    hints: [
      {
        rung: 0,
        text: "Test your answer against `\"abba\"`. Most first drafts get 3.",
      },
      {
        rung: 1,
        text: "Keep a window with a left and right edge. When the right edge hits a character you've seen, the left edge jumps — but only forward, never backward.",
      },
      {
        rung: 2,
        text: "Keep a `Map` from character to the last index you saw it at, plus `start` for the window's left edge and `best` for the answer. Walk `end` across the string. If the current character is in the map *and* its recorded index is at or after `start`, set `start` to that index plus one. Then record the character's current index and update `best` with `end - start + 1`. The guard about being at or after `start` is the whole problem: on `\"abba\"`, when you reach the final `a` the map still remembers index 0, which is behind the window and must be ignored — otherwise `start` moves backwards and the window grows wrong.",
      },
    ],
    walkthrough: [
      "You're tracking a window. What two variables describe where it starts and ends?",
      "When the right edge lands on a repeat, where exactly should the left edge move to?",
      "Trace `\"abba\"` character by character. At the last `a`, what does your map say, and why is that stale?",
      "How do you compute the window's length from `start` and `end`?",
    ],
    commonMistakes: [
      {
        match: "includes",
        hint: "`includes` or `indexOf` on the current window is a scan inside a loop — O(n²). The 50,000-character test will time out.",
      },
      {
        match: "start = lastSeen.get(char) + 1",
        hint: "Unguarded, this moves `start` backwards when the repeat is behind the window. Check that the stored index is at or after `start` first — that's the `\"abba\"` case.",
      },
    ],
    solution: `function longestUnique(s) {
  const lastSeen = new Map();
  let best = 0;
  let start = 0;

  for (let end = 0; end < s.length; end++) {
    const char = s[end];
    const prev = lastSeen.get(char);
    if (prev !== undefined && prev >= start) {
      start = prev + 1;
    }
    lastSeen.set(char, end);
    best = Math.max(best, end - start + 1);
  }
  return best;
}`,
  },

  {
    id: "p.move-zeroes",
    kind: "problem",
    tier: "problem",
    title: "Move zeroes",
    pattern: "two-pointer",
    teaches: ["pattern.two-pointer", "js.array.mutation"],
    requires: ["js.array.iteration"],
    difficulty: { concept: 2, implementation: 2, recall: 3 },
    estimatedMinutes: 10,
    exportName: "moveZeroes",
    prompt: `Move every \`0\` to the end of the array, keeping the order of everything else.

**Modify the array in place** and return it. O(1) extra space — no second array.

\`\`\`js
moveZeroes([0, 1, 0, 3, 12]); // [1, 3, 12, 0, 0]
moveZeroes([0, 0]);            // [0, 0]
moveZeroes([1, 2]);            // [1, 2]
\`\`\``,
    scaffolds: {
      L1: `function moveZeroes(nums) {
  let write = 0;
  // First pass: copy every non-zero forward to \`write\`, advancing it.

  // Second pass: fill from \`write\` to the end with zeroes.

  return nums;
}`,
      L2: `function moveZeroes(nums) {
  // One pointer for where you're reading, one for where you're writing.
}`,
      L3: `function moveZeroes(nums) {

}`,
      L4: `// Define: moveZeroes(nums)
`,
    },
    tests: [
      {
        name: "basic",
        code: `expect(fn([0, 1, 0, 3, 12])).toEqual([1, 3, 12, 0, 0]);`,
      },
      {
        name: "modifies in place",
        code: `const nums = [0, 1, 0, 3, 12];
fn(nums);
expect(nums).toEqual([1, 3, 12, 0, 0]);`,
      },
      { name: "all zeroes", hidden: true, code: `expect(fn([0, 0])).toEqual([0, 0]);` },
      { name: "no zeroes", hidden: true, code: `expect(fn([1, 2, 3])).toEqual([1, 2, 3]);` },
      { name: "empty", hidden: true, code: `expect(fn([])).toEqual([]);` },
      {
        name: "keeps relative order",
        hidden: true,
        code: `expect(fn([4, 0, 5, 0, 0, 6])).toEqual([4, 5, 6, 0, 0, 0]);`,
      },
      {
        name: "returns the same array, not a copy",
        hidden: true,
        code: `const nums = [0, 1];
expect(fn(nums)).toBe(nums);`,
      },
    ],
    hints: [
      {
        rung: 0,
        text: "You're allowed two passes. The first one doesn't have to produce the final answer.",
      },
      {
        rung: 1,
        text: "Two indexes moving at different speeds: one reads every slot, one only advances when you actually write something.",
      },
      {
        rung: 2,
        text: "Keep a `write` index starting at 0. Loop `read` across the whole array. Whenever `nums[read]` isn't zero, assign it to `nums[write]` and bump `write`. After that pass, every non-zero sits at the front in its original order, and `write` marks where the zeroes begin. Second loop: from `write` to the end, set each slot to 0. Return `nums` — the same array, since one hidden test checks identity.",
      },
    ],
    walkthrough: [
      "After you've packed all the non-zeroes to the front, what does the rest of the array need to contain?",
      "You need two indexes. When does each one advance?",
      "Trace `[0, 1, 0, 3]`. What are `read` and `write` after each step?",
      "Does `filter` plus `concat` satisfy 'in place'? What would the identity test say?",
    ],
    commonMistakes: [
      {
        match: "filter",
        hint: "`filter` builds a new array. The in-place test checks the caller's array changed, and another checks you returned the very same one.",
      },
      {
        match: "splice",
        hint: "Splicing inside a loop shifts every later element each time — O(n²), and it skips elements as the indexes move under you.",
      },
    ],
    solution: `function moveZeroes(nums) {
  let write = 0;
  for (let read = 0; read < nums.length; read++) {
    if (nums[read] !== 0) {
      nums[write] = nums[read];
      write++;
    }
  }
  for (let i = write; i < nums.length; i++) {
    nums[i] = 0;
  }
  return nums;
}`,
  },
];

import type { Atom, Drill, Lesson } from "../../types";

/**
 * Part 2 — The Method.
 *
 * Patterns tell you what to do when you've seen it before. This module is the
 * other half: what to do when you haven't. It's the difference between someone
 * who has done 500 problems and still freezes, and someone who has done 150
 * and doesn't.
 *
 * Reference: METHOD.md.
 */
export const M13_ATOMS: Atom[] = [
  {
    id: "teach.restate",
    title: "Restate and explore",
    teaches: ["method.restate"],
    requires: [],
    readingSeconds: 80,
    recall:
      "You've read a problem twice and you're about to start coding. What two things must you produce first?",
    body: `The first thing you write is not code. It's the problem, in your own words, in one sentence.

If you can't do that, you don't understand it yet, and everything you type next is guessing.

## Then make your own examples

The given examples are chosen to be clear. Yours should be chosen to be awkward.

\`\`\`
given:   [2, 7, 11, 15], target 9  →  [0, 1]

yours:   []              →  ?
         [3, 3], 6       →  duplicates — allowed?
         [-1, 5], 4      →  negatives?
         [5], 5          →  can I use one element twice?
\`\`\`

Every one of those is a question for the interviewer, and asking them is worth
real marks. Half of a "hard" problem is usually an ambiguity nobody resolved.

## Why this is not a waste of time

Three minutes here saves fifteen later. The failure mode it prevents is the
worst one available to you: writing forty confident lines that solve a slightly
different problem.

It also does something subtle. Working small cases by hand is how you *find*
the pattern. You are not stalling — you are gathering the data the next step
runs on.

## The catch

Don't ask questions you can answer yourself. "Can the array be empty?" is a
good question. "What is an array?" is not. The signal you want to send is
*thorough*, not *lost*.

**Rule: one sentence restating it, three examples of your own, then move on.**`,
  },

  {
    id: "teach.brute-force",
    title: "Brute force, always",
    teaches: ["method.brute-force"],
    requires: ["method.restate"],
    readingSeconds: 85,
    recall: "Name three things stating the brute force buys you.",
    body: `Say the dumb solution out loud before you look for the clever one. Every time. No exceptions.

*"The brute force is: check every pair. That's O(n²) time, O(1) space. Let me see what it's repeating."*

## Why this is the highest-value habit in the whole method

**It's points on the board.** A working O(n²) beats a broken O(n) in every interview ever conducted. You now have something to submit if you run out of time.

**It defines the bottleneck.** You cannot remove repeated work you haven't named. The optimal solution is almost always the brute force with one specific repetition deleted — so the brute force is not a detour, it's the map.

**It proves you understood the problem.** Which is most of what's being assessed, and it's why interviewers relax visibly when you say it.

**It's often one insight away.** Two Sum's brute force is a nested loop. The optimal is that loop with the inner scan replaced by a hash map. Same shape, one change.

## People skip it because they think it looks bad

It looks like the opposite. Jumping straight to a half-remembered optimal solution and stalling looks like memorisation. Starting simple and improving deliberately looks like engineering.

## The catch

State it, cost it, then **move on**. Don't implement the brute force unless you're nearly out of time or genuinely stuck.

The point of saying it is to find the bottleneck, not to spend ten minutes typing something you're about to throw away.

**One sentence, one complexity, then the next step.**`,
  },

  {
    id: "teach.bottleneck",
    title: "Find the repeated work",
    teaches: ["method.bottleneck"],
    requires: ["method.brute-force"],
    readingSeconds: 90,
    recall:
      "Your brute force rescans the array to check whether a value exists. Which tool removes that, and what does it cost you?",
    body: `One question generates most optimisations in existence:

**What work am I doing more than once?**

That's it. Ask it of the brute force, answer it precisely, and the tool picks itself.

## The mapping is nearly mechanical

\`\`\`
re-scanning to look something up      →  remember it        (hash map)
recomputing an overlapping range      →  slide the window
recomputing the same subproblem       →  memoise
sorting when you only need the top K  →  heap
rescanning for "the next bigger one"  →  monotonic stack
re-checking if two things connect     →  union-find
recomputing a range sum               →  prefix sums
\`\`\`

Learn that table and you've learned most of algorithm design. Every entry is
the same trade: **spend memory to stop repeating yourself.**

## Worked through

Two Sum, brute force: for each number, scan the rest of the array looking for
its complement.

The repetition is the scan. You already walked past those numbers — you just
didn't write them down.

So write them down. A map from value to index turns "scan the rest" into "ask
the map," and O(n²) becomes O(n). You paid O(n) memory for it.

## The catch

Be precise about *what* is repeated. "It's slow" is not an answer. "For every
element I re-examine every other element" is an answer, and it names the tool.

Vague diagnosis produces vague optimisation — usually micro-tweaks to a loop
that's the wrong shape entirely.

**Say the repetition in one sentence before you pick a tool.**`,
  },

  {
    id: "teach.constraints",
    title: "Read the constraints",
    teaches: ["method.constraints"],
    requires: ["meta.complexity"],
    readingSeconds: 80,
    recall: "n is at most 18 and you're hunting for an O(n log n) trick. What's wrong?",
    body: `The input size tells you the intended complexity. Most people never look.

\`\`\`
n ≤ 12        O(n!)              permutations, brute-force search
n ≤ 22        O(2ⁿ)              subsets, bitmask DP
n ≤ 100       O(n³)              Floyd-Warshall, interval DP
n ≤ 1,000     O(n²)              nested loops are fine, 2-D DP
n ≤ 100,000   O(n log n)         sort, heap, binary search
n ≤ 1,000,000 O(n)               one pass, hash map, two pointers
n ≤ 10⁹       O(log n) or O(1)   binary search on answer, or maths
\`\`\`

The rough constant: about 10⁸ simple operations per second.

## Use it as a compass, not trivia

**Small n is permission.** If n ≤ 20, an exponential solution is the *intended* one. People burn ten minutes hunting for a polynomial trick that doesn't exist, because they never checked. Small n almost always means subsets or permutations.

**Huge n is a instruction.** n up to 10⁹ means you cannot touch every element. Not "you shouldn't" — you *cannot*. That rules out every linear idea and leaves binary search on the answer, or a closed-form.

**Mid n narrows the family.** 10⁵ with an O(n²) idea means you need a different algorithm, not a faster loop. That's a useful thing to know at minute three rather than minute twenty.

## The catch

The constraint tells you the *target*, not the *method*. Knowing you need O(n log n) doesn't tell you whether it's a sort, a heap, or a binary search — you still have to find it.

But it eliminates most of the search space instantly, and it tells you when to stop optimising. Hitting the target means **stop and write the code.**`,
  },

  {
    id: "teach.recognition",
    title: "Signal to pattern",
    teaches: ["method.recognition"],
    requires: ["method.bottleneck"],
    readingSeconds: 95,
    recall:
      'A problem says "minimise the maximum load across k workers." Which pattern, and why is it not obvious?',
    body: `Certain words in a problem statement are close to being the answer. Learn to hear them.

\`\`\`
sorted + find a pair              →  two pointers
sorted + find one value           →  binary search
"minimise the maximum…"           →  binary search on the ANSWER
contiguous subarray, longest      →  sliding window
repeated range-sum queries        →  prefix sums
"have I seen this", complements   →  hash map
top K, or a stream                →  heap of size K
"next greater element"            →  monotonic stack
max/min of every window of size k →  monotonic deque
intervals, overlaps, merging      →  sort by start, then sweep
numbers 1..n, missing/duplicate   →  cyclic sort
linked list + O(1) space          →  fast & slow pointers
shortest path, unweighted         →  BFS
weighted shortest path            →  Dijkstra
prerequisites, ordering           →  topological sort
"are these connected"             →  union-find
prefixes, autocomplete            →  trie
"return ALL the ways"             →  backtracking
"return HOW MANY ways"            →  DP
"minimum cost to reach"           →  DP
two strings compared position-wise→  2-D DP
\`\`\`

Note the pair at the bottom. **All** versus **how many** is the single most reliable
signal in the table: if you must produce each arrangement, you must build each
one, so it's backtracking. If you only need the count, you never build them, so
it's DP.

## The one people miss

**"Minimise the maximum"** and **"largest k such that…"** mean binary search on
the answer — and almost nobody sees it, because there's no sorted array anywhere
in the problem.

The move: stop trying to compute the answer. Write \`canDo(x)\` instead — a yes/no
check that's usually easy and linear. Notice it's monotonic: if you can do it
with 8 workers you can do it with 9. Now binary search the threshold.

Ship packages in D days, Koko eating bananas, split array largest sum, minimum
speed — all the same problem in different clothes.

## The catch

The table is for recognition, not for thinking. When nothing matches, you don't
have a memory failure — you have a problem that needs deriving, and that's the
next lesson.

**Sixty seconds on the table. If nothing fires, switch methods.**`,
  },

  {
    id: "teach.optimization",
    title: "The optimisation ladder",
    teaches: ["method.optimization"],
    requires: ["method.bottleneck"],
    readingSeconds: 90,
    recall: "Which rung turns 'try every possible answer' into 'test a few'?",
    body: `Almost every optimal solution is a brute force plus exactly one of these twelve moves.

\`\`\`
 1  hash map — remember what you've seen     O(n²) → O(n)
 2  sort first                               enables 3, 4, 12
 3  two pointers                             O(n²) → O(n)
 4  sliding window                           O(n·k) → O(n)
 5  prefix / suffix arrays                   O(n) per query → O(1)
 6  memoise                                  O(2ⁿ) → O(n · states)
 7  bottom-up DP                             same cost, no stack
 8  rolling array                            O(n²) space → O(n)
 9  heap                                     O(n log n) → O(n log k)
10  monotonic stack / deque                  O(n²) → O(n)
11  union-find                               near O(1) amortised
12  binary search on the answer              O(n) candidates → O(log n)
\`\`\`

Twelve. That's the whole list for interview purposes. When you're stuck on
"how do I make this faster," you are looking for one of twelve things, not for
inspiration.

## Read it as a checklist

Go down the ladder against your bottleneck. Most of the time exactly one rung
fits, and it fits obviously once you're looking.

That reframing matters more than it sounds. "Make this faster" is an unbounded
creative task and it feels awful under pressure. "Which of these twelve applies"
is a lookup, and you can do a lookup with your heart rate at 140.

## The two worth extra study

**#6, memoise.** Any recursive solution with repeated arguments becomes a
dynamic program the moment you cache on those arguments. That's the entire
distance between exponential and polynomial for a whole family of problems, and
it's usually three lines.

**#12, binary search on the answer.** The highest-value trick most people never
learn. The signal-to-pattern lesson covers it in full — go back there if it
didn't land.

## The catch

You only need one rung. Applying three at once produces code you can't debug
and can't explain, and the second and third usually buy nothing.

**Find the bottleneck, pick one rung, re-cost it, stop when you hit the target.**`,
  },

  {
    id: "teach.stuck",
    title: "When you don't recognise it",
    teaches: ["method.stuck"],
    requires: ["method.recognition"],
    readingSeconds: 100,
    recall: "You've been stuck for four minutes with no pattern match. What's the first move?",
    body: `Nothing on the table fired. This is the moment the whole method exists for, and there is a procedure.

Run these in order. They're sorted by how often they work.

## 1. Solve n = 1, 2, 3 by hand

Write the actual answers down. Then look at how each one relates to the one before it.

That relationship *is* the recurrence, and it's how nearly every dynamic program
is genuinely derived — not recognised, derived. This is the single most
productive thing you can do when stuck, and it's the one people skip because it
feels like not-working.

## 2. Brute force it and stare at the repetition

Back to the bottleneck question. If you haven't written the brute force, you've
skipped a step and you're stuck for a reason you created.

## 3. Sort it

A startling number of problems collapse once sorted. Ask what sorting costs —
usually the original indices — and whether you actually need them.

## 4. Relax a constraint

Drop "O(1) space" or "in place." Solve the easier version. Then add the
constraint back and see exactly what breaks. Often only one part does, and now
you're solving something much smaller.

## 5. Reverse the question

*Longest valid substring* → find the invalid ones. *Minimum removals* → maximum
keeps. *How much water is trapped here* → what determines the level at this
position. Complements are frequently easier than the thing itself.

## 6. Draw it as a graph

Nodes and edges. The words **reach**, **depends on**, **transform into**, and
**connected** are graph problems wearing a disguise.

## 7. Work backwards from the answer

What does a valid answer look like? What was the last decision made before
reaching it? That last decision is usually your recurrence or your greedy choice.

## 8. Ask what you'd need to know

*"If I had the answer for the left half, could I finish?"* → divide and conquer.
*"If I had the answer at i−1?"* → DP. This question **defines your state**, which
is the actual hard part of most DP problems.

## 9. Try greedy and hunt a counterexample

Failing to find one is weak evidence for greedy. **Finding one tells you it's
DP** — which is progress, not failure.

## 10. Say it out loud

You will solve it mid-sentence more often than is reasonable. This is not a
joke, and it's the real reason interviewers want you talking.

## The catch

Give each move about a minute. Cycling through all ten beats grinding one for
ten minutes — and out loud, cycling *visibly* reads as method rather than panic.`,
  },

  {
    id: "teach.verify",
    title: "Before you say done",
    teaches: ["method.verify"],
    requires: [],
    readingSeconds: 80,
    recall: "Name five things on the edge-case checklist.",
    body: `Running the tests is not verification. Verification is what you do before running them.

## Trace the smallest real case by hand

Pick the smallest input that isn't trivial. Walk your own code line by line and
track every variable on paper.

You will find roughly half your bugs here, and you'll find them faster than a
debugger would, because you're checking your *intent* rather than the machine's
behaviour.

## Then the checklist

\`\`\`
□ empty input
□ one element
□ two elements
□ all identical
□ already sorted / reverse sorted
□ negatives, zero
□ duplicates
□ target not present
□ answer at index 0, and at the last index
□ overflow on sums or midpoints
□ did I mutate the caller's data?
□ right type back — index vs value, array vs number?
\`\`\`

Twelve lines, thirty seconds. In an interview, saying them out loud is worth
marks on its own — it's the difference between "it works" and "I've checked."

## Then say the complexity

Time and space, out loud. If you can't state it, you don't fully understand
your own solution.

Say the space too. People forget, and "O(n) time" while quietly allocating an
O(n) map is an incomplete answer that an interviewer will notice.

## The catch

The most expensive bug class isn't a crash. It's returning the wrong *shape* —
the value when they wanted the index, a new array when they wanted the original
mutated, \`-1\` when they wanted \`null\`.

Those pass your mental model completely, because your mental model is the one
that got it wrong. Re-read the required return type as the last thing you do.`,
  },
];

const approach = (
  id: string,
  title: string,
  statement: string,
  teaches: string[],
  steps: {
    question: string;
    choices: string[];
    answer: number;
    explanation: string;
  }[],
): Drill => ({
  id,
  kind: "approach",
  title,
  statement,
  teaches,
  estimatedSeconds: 100,
  steps,
  explanation: "",
});

export const M13_DRILLS: Drill[] = [
  approach(
    "a.two-sum",
    "Two Sum",
    "Given an unsorted array of integers and a target, return the indices of the two numbers that add up to it. Exactly one answer exists. n up to 10⁵.",
    ["method.bottleneck", "pattern.hash-map"],
    [
      {
        question: "What's the brute force, and what does it cost?",
        choices: [
          "Sort, then two pointers — O(n log n)",
          "Check every pair with a nested loop — O(n²)",
          "One pass with a map — O(n)",
          "Binary search each complement — O(n log n)",
        ],
        answer: 1,
        explanation:
          "Brute force is always the dumbest thing that works: try every pair. State it and cost it before optimising anything.",
      },
      {
        question: "What work is that repeating?",
        choices: [
          "It re-sorts the array on every pass",
          "It recomputes the sum of overlapping ranges",
          "For each element it re-scans elements it already walked past",
          "It recomputes the same subproblem many times",
        ],
        answer: 2,
        explanation:
          "The inner loop looks at numbers you already visited. You had the information and didn't write it down — that's the repetition.",
      },
      {
        question: "Which rung of the ladder removes that?",
        choices: [
          "Sliding window",
          "Hash map — remember what you've seen",
          "Monotonic stack",
          "Memoisation",
        ],
        answer: 1,
        explanation:
          'Store value → index as you walk. The question flips from "is there a pair" to "have I already seen this number\'s complement".',
      },
      {
        question: "Why is sorting plus two pointers wrong here?",
        choices: [
          "It's too slow at O(n log n)",
          "Two pointers needs a sorted array and this one isn't",
          "Sorting destroys the original indices, which are the answer",
          "It uses too much space",
        ],
        answer: 2,
        explanation:
          "The trap. Sorting works fine for finding the *values*, but the problem asks for *indices*, and sorting throws those away.",
      },
    ],
  ),

  approach(
    "a.ship-packages",
    "Ship packages in D days",
    "Weights must be shipped in order, within D days. Each day you ship a contiguous run of packages whose total is at most the ship's capacity. Return the minimum capacity that gets everything shipped in D days. n up to 5×10⁴, weights up to 500.",
    ["method.recognition", "method.optimization"],
    [
      {
        question: "Which phrase in the statement is the biggest clue?",
        choices: [
          '"contiguous run"',
          '"minimum capacity that works"',
          '"must be shipped in order"',
          '"within D days"',
        ],
        answer: 1,
        explanation:
          '"Minimum X that works" or "minimise the maximum" is the fingerprint of binary search on the answer. It fires even though there is no sorted array anywhere.',
      },
      {
        question: "What should you write instead of trying to compute the answer?",
        choices: [
          "A function that returns the optimal capacity directly",
          "A function canShip(capacity) that returns true or false",
          "A DP table over days and packages",
          "A greedy that packs the heaviest first",
        ],
        answer: 1,
        explanation:
          "Turn optimisation into decision. canShip(c) is a simple greedy pass: fill each day until adding the next would exceed c, then start a new day. Count days, compare to D.",
      },
      {
        question: "Why can you binary search over capacity?",
        choices: [
          "Because the weights are sorted",
          "Because capacity is bounded by 500",
          "Because canShip is monotonic — once true, it stays true for larger capacities",
          "Because D is small",
        ],
        answer: 2,
        explanation:
          "Monotonicity is the requirement, not sortedness. A bigger ship never fails where a smaller one succeeded, so the true/false boundary can be binary searched.",
      },
      {
        question: "What's the search range and the total complexity?",
        choices: [
          "0 to sum(weights), O(n log n)",
          "max(weights) to sum(weights), O(n log(sum))",
          "1 to n, O(n log n)",
          "0 to 500, O(n)",
        ],
        answer: 1,
        explanation:
          "Low bound is max(weights) — you must fit the heaviest single package. High bound is the total, which ships everything in one day. Each canShip check is O(n).",
      },
    ],
  ),

  approach(
    "a.longest-unique",
    "Longest substring without repeats",
    "Return the length of the longest substring with no repeated characters. n up to 5×10⁴.",
    ["method.bottleneck", "pattern.sliding-window"],
    [
      {
        question: "What's the brute force?",
        choices: [
          "Check every substring for duplicates — O(n³)",
          "Sort the string, then scan — O(n log n)",
          "One pass with a map — O(n)",
          "Recursion over every split point — O(2ⁿ)",
        ],
        answer: 0,
        explanation:
          "O(n²) substrings, and checking each for duplicates is another O(n). Naming O(n³) tells you there's a lot of room.",
      },
      {
        question: "What is it repeating?",
        choices: [
          "It re-sorts on every substring",
          "Neighbouring substrings overlap almost entirely, and it rechecks the shared part every time",
          "It recomputes the same recursive subproblem",
          "It re-scans for the next greater character",
        ],
        answer: 1,
        explanation:
          'Overlapping ranges being recomputed is the sliding-window fingerprint. Extending by one character shouldn\'t cost a full rescan.',
      },
      {
        question: "When the right edge hits a repeat, where does the left edge go?",
        choices: [
          "Back to 0",
          "Forward by one",
            "To one past the previous occurrence of that character",
          "To the position of the previous occurrence",
        ],
        answer: 2,
        explanation:
          "Jump past the old copy so the window is valid again. Moving one at a time also works but is slower; going back to 0 is wrong.",
      },
      {
        question: 'What does "abba" catch?',
        choices: [
          "Nothing, it's a normal case",
          "That the map must store counts, not indices",
          "That a remembered index can be behind the window and must be ignored",
          "That you need two maps",
        ],
        answer: 2,
        explanation:
          "At the final 'a' the map still remembers index 0, which is behind the left edge. Without a guard, the left edge moves backwards and the window grows wrong.",
      },
    ],
  ),

  approach(
    "a.course-schedule",
    "Course schedule",
    "There are n courses and a list of prerequisite pairs [a, b] meaning you must take b before a. Return whether you can finish all courses.",
    ["method.recognition"],
    [
      {
        question: "What structure is hiding in this statement?",
        choices: [
          "A tree, because courses have parents",
          "A directed graph, because 'must come before' is a directed edge",
          "An interval list",
          "A heap, because of ordering",
        ],
        answer: 1,
        explanation:
          '"Depends on", "must come before", "prerequisite" — these are directed edges. Nearly every scheduling problem is a graph in disguise.',
      },
      {
        question: "What is the question actually asking, in graph terms?",
        choices: [
          "Is the graph connected?",
          "What is the shortest path?",
          "Does the graph contain a cycle?",
          "How many components are there?",
        ],
        answer: 2,
        explanation:
          "You can finish everything exactly when nothing depends on itself, directly or indirectly. 'Can I finish' means 'is it acyclic'.",
      },
      {
        question: "Which technique answers it?",
        choices: [
          "Union-find",
          "Topological sort — Kahn's algorithm with in-degrees",
          "Dijkstra",
          "Binary search",
        ],
        answer: 1,
        explanation:
          "Repeatedly remove nodes with in-degree 0. If you remove all n, it's acyclic. Anything left is stuck in a cycle. DFS with a recursion-stack marker also works.",
      },
      {
        question: "Why is union-find the wrong tool here?",
        choices: [
          "It's too slow",
          "It uses too much memory",
          "It tracks undirected connectivity and can't see edge direction",
          "It only works on trees",
        ],
        answer: 2,
        explanation:
          "Union-find is excellent for undirected cycles. A directed cycle needs direction, which union-find discards — a common and costly mix-up.",
      },
    ],
  ),

  approach(
    "a.coin-change",
    "Coin change",
    "Given coin denominations and an amount, return the fewest coins that make that amount, or -1 if impossible. Coins up to 12 denominations, amount up to 10⁴.",
    ["method.recognition", "method.optimization"],
    [
      {
        question: "Why is 'always take the largest coin that fits' wrong?",
        choices: [
          "It's too slow",
          "Coins [1, 3, 4] and amount 6 gives 4+1+1 = 3 coins, but 3+3 = 2 is better",
          "It fails when coins are unsorted",
          "It's actually correct",
        ],
        answer: 1,
        explanation:
          "The counterexample is the whole lesson. Greedy works for real currency because those denominations are designed for it — not in general. Finding the counterexample tells you it's DP.",
      },
      {
        question: "What's the state?",
        choices: [
          "dp[i] = whether coin i is used",
          "dp[a] = fewest coins to make amount a",
          "dp[i][a] = using the first i coins, is amount a reachable",
          "dp[a] = number of ways to make amount a",
        ],
        answer: 1,
        explanation:
          'Ask "what do I need to know to make the next decision?" Only the remaining amount matters, so the state is one-dimensional.',
      },
      {
        question: "What's the transition?",
        choices: [
          "dp[a] = dp[a-1] + 1",
          "dp[a] = min over coins c of dp[a-c] + 1",
          "dp[a] = sum over coins c of dp[a-c]",
          "dp[a] = max over coins c of dp[a-c] + 1",
        ],
        answer: 1,
        explanation:
          "Try every coin as the last one used. Note that summing instead of minimising answers a different question — 'how many ways' rather than 'fewest coins'.",
      },
      {
        question: "What's the complexity, and does it fit the constraints?",
        choices: [
          "O(2^amount) — too slow",
          "O(amount × coins) = 10⁴ × 12, comfortably fast",
          "O(amount²) — borderline",
          "O(coins!) — too slow",
        ],
        answer: 1,
        explanation:
          "About 120,000 operations. The constraints were telling you a polynomial DP was intended all along.",
      },
    ],
  ),

  approach(
    "a.daily-temps",
    "Daily temperatures",
    "For each day, return how many days you must wait for a warmer temperature, or 0 if it never gets warmer. n up to 10⁵.",
    ["method.bottleneck", "method.optimization"],
    [
      {
        question: "What's the brute force and does it pass?",
        choices: [
          "For each day scan forward — O(n²), too slow at n = 10⁵",
          "For each day scan forward — O(n²), fast enough",
          "Sort by temperature — O(n log n)",
          "One pass — O(n)",
        ],
        answer: 0,
        explanation:
          "10¹⁰ operations against a budget of about 10⁸. The constraint told you O(n²) was dead before you wrote anything.",
      },
      {
        question: "Which phrase names the pattern?",
        choices: [
          '"how many days"',
          '"wait for a warmer temperature" — the next greater element',
          '"or 0 if it never gets warmer"',
          '"for each day"',
        ],
        answer: 1,
        explanation:
          '"Next greater element" is the monotonic stack fingerprint, whatever the surface story is about.',
      },
      {
        question: "What goes on the stack?",
        choices: [
          "Temperatures, in increasing order",
          "Indices of days still waiting for a warmer day",
          "The answers computed so far",
          "Every index, in order",
        ],
        answer: 1,
        explanation:
          "Indices, not values — you need the index to compute the day gap. The stack holds unresolved days, and stays decreasing in temperature.",
      },
      {
        question: "Why is it O(n) when there's a loop inside a loop?",
        choices: [
          "The inner loop runs at most a constant number of times",
          "Each index is pushed once and popped once, so total work is 2n",
          "It isn't — it's O(n²)",
          "Because the stack stays small",
        ],
        answer: 1,
        explanation:
          "Amortised analysis. The nested loop looks quadratic but each element enters and leaves the stack exactly once — worth being able to say out loud.",
      },
    ],
  ),

  approach(
    "a.kth-largest",
    "Kth largest in a stream",
    "Numbers arrive one at a time. After each arrival, report the kth largest seen so far. Millions of arrivals, k up to 10⁴.",
    ["method.recognition", "method.constraints"],
    [
      {
        question: "Why is 'sort after each arrival' wrong?",
        choices: [
          "Sorting is unstable",
          "O(n log n) per arrival, so O(n² log n) overall — far too slow",
          "You can't sort a stream",
          "It uses too much memory",
        ],
        answer: 1,
        explanation:
          "Re-sorting throws away the ordering work you already did. Repeated work again — the bottleneck question applies to streams too.",
      },
      {
        question: "What do you actually need to keep?",
        choices: [
          "Every number seen",
          "Only the k largest numbers seen so far",
          "The running average",
          "The largest number only",
        ],
        answer: 1,
        explanation:
          "Everything below the top k can never be the answer. Realising what you can throw away is often the whole optimisation.",
      },
      {
        question: "Which structure, and which orientation?",
        choices: [
          "Max-heap of size k",
          "Min-heap of size k — the root is the kth largest",
          "Sorted array of size k",
          "A hash map of counts",
        ],
        answer: 1,
        explanation:
          "The counter-intuitive bit. A *min*-heap of the k largest puts the smallest of them at the root — and that's exactly the kth largest. Push, and pop if size exceeds k.",
      },
      {
        question: "Cost per arrival?",
        choices: ["O(1)", "O(log k)", "O(k)", "O(log n)"],
        answer: 1,
        explanation:
          "One push and possibly one pop on a heap of size k. Independent of how many numbers have arrived, which is what makes it work on a stream.",
      },
    ],
  ),

  approach(
    "a.unknown-shape",
    "A problem you don't recognise",
    "Given an array, return the maximum value of (nums[i] - nums[j]) where i > j, or 0 if no such pair improves on 0. You do not recognise this. n up to 10⁵.",
    ["method.stuck", "method.bottleneck"],
    [
      {
        question: "Nothing on the pattern table fired. What's the first move?",
        choices: [
          "Look up the answer",
          "Start coding something and see what happens",
          "Write the brute force and cost it",
          "Try every data structure in turn",
        ],
        answer: 2,
        explanation:
          "Always. It's points on the board and it exposes the repetition. Here: every pair with i > j, O(n²).",
      },
      {
        question: "Solve n = 1, 2, 3 by hand. What relationship appears?",
        choices: [
          "The answer doubles each time",
          "The answer at position i only needs the smallest value seen before i",
          "The answer needs the whole array sorted",
          "There's no pattern",
        ],
        answer: 1,
        explanation:
          "The move from lesson 7, step 1. Working small cases by hand shows the best j for any i is simply the minimum so far — you never need to look back at the rest.",
      },
      {
        question: "So what do you carry as you walk?",
        choices: [
          "A hash map of every value seen",
          "A running minimum, and a running best answer",
          "A heap of all previous values",
          "A prefix sum array",
        ],
        answer: 1,
        explanation:
          "Two numbers, one pass, O(1) space. This is the max-profit stock problem in disguise — which is exactly the point. You derived it without recognising it.",
      },
      {
        question: "What's the transferable lesson?",
        choices: [
          "Memorise more problems",
          "Hand-solving small cases reveals what you need to carry — the state",
          "Always use a hash map",
          "Brute force is usually good enough",
        ],
        answer: 1,
        explanation:
          '"What do I need to carry forward to make the next decision?" defines the state of every DP and every one-pass scan. It is how unseen problems get solved.',
      },
    ],
  ),
];

export const M13_LESSONS: Lesson[] = [
  {
    id: "l13.1",
    moduleId: "m13",
    title: "Restate and explore",
    goal: "Understand the problem before you touch it, and find the ambiguities.",
    atomId: "teach.restate",
    repIds: [],
    problemIds: [],
    drillIds: [],
  },
  {
    id: "l13.2",
    moduleId: "m13",
    title: "Brute force, always",
    goal: "State the dumb solution and its cost, every time, before optimising.",
    atomId: "teach.brute-force",
    repIds: [],
    problemIds: [],
    drillIds: ["a.two-sum"],
  },
  {
    id: "l13.3",
    moduleId: "m13",
    title: "Find the repeated work",
    goal: "Ask the one question that generates most optimisations.",
    atomId: "teach.bottleneck",
    repIds: [],
    problemIds: [],
    drillIds: ["a.longest-unique", "a.daily-temps"],
  },
  {
    id: "l13.4",
    moduleId: "m13",
    title: "Read the constraints",
    goal: "Let the input size tell you which complexity you're aiming for.",
    atomId: "teach.constraints",
    repIds: [],
    problemIds: [],
    drillIds: ["a.kth-largest"],
  },
  {
    id: "l13.5",
    moduleId: "m13",
    title: "Signal to pattern",
    goal: "Hear the phrase in the statement that names the tool.",
    atomId: "teach.recognition",
    repIds: [],
    problemIds: [],
    drillIds: ["a.course-schedule", "a.ship-packages"],
  },
  {
    id: "l13.6",
    moduleId: "m13",
    title: "The optimisation ladder",
    goal: "Turn 'make it faster' from a creative task into a twelve-item lookup.",
    atomId: "teach.optimization",
    repIds: [],
    problemIds: [],
    drillIds: ["a.coin-change"],
  },
  {
    id: "l13.7",
    moduleId: "m13",
    title: "When you don't recognise it",
    goal: "Run the ten-move protocol instead of freezing.",
    atomId: "teach.stuck",
    repIds: [],
    problemIds: [],
    drillIds: ["a.unknown-shape"],
  },
  {
    id: "l13.8",
    moduleId: "m13",
    title: "Before you say done",
    goal: "Catch half your bugs without running anything.",
    atomId: "teach.verify",
    repIds: [],
    problemIds: [],
    drillIds: [],
  },
];

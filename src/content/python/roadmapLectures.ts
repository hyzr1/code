import type { Atom, Concept, Lesson } from "../../types";

type LessonContent = Pick<Lesson, "atomId" | "repIds" | "problemIds" | "drillIds">;

export const ROADMAP_CONCEPTS: Concept[] = [
  { id: "py.algo.scale", title: "Why input scale changes the right algorithm", stage: 5, kind: "mental-model", requires: ["py.loops"], atom: "py.atom.algo.scale", language: "python" },
  { id: "py.algo.operation-count", title: "Counting an algorithm's work", stage: 5, kind: "mental-model", requires: ["py.algo.scale"], atom: "py.atom.algo.operation-count", language: "python" },
  { id: "py.algo.asymptotics", title: "Big O, Theta, and Omega", stage: 5, kind: "mental-model", requires: ["py.algo.operation-count"], atom: "py.atom.algo.asymptotics", language: "python" },
  { id: "py.algo.growth-classes", title: "Recognizing common growth classes", stage: 5, kind: "mental-model", requires: ["py.algo.asymptotics"], atom: "py.atom.algo.growth-classes", language: "python" },
  { id: "py.algo.dominant-growth", title: "Dominant terms and constant factors", stage: 5, kind: "mental-model", requires: ["py.algo.asymptotics"], atom: "py.atom.algo.dominant-growth", language: "python" },
  { id: "py.algo.space-cost", title: "Auxiliary and total space complexity", stage: 5, kind: "mental-model", requires: ["py.algo.operation-count"], atom: "py.atom.algo.space-cost", language: "python" },
  { id: "py.algo.amortized-cost", title: "Amortized analysis", stage: 5, kind: "mental-model", requires: ["py.algo.asymptotics", "py.lists"], atom: "py.atom.algo.amortized-cost", language: "python" },
  { id: "py.algo.analysis-cases", title: "Best, worst, expected, and amortized cases", stage: 5, kind: "mental-model", requires: ["py.algo.asymptotics"], atom: "py.atom.algo.analysis-cases", language: "python" },
  { id: "py.ml.vector-operations", title: "Scalars, vectors, and vector operations", stage: 4, kind: "mental-model", requires: ["py.lists", "py.loops"], atom: "py.atom.ml.vector-operations", language: "python" },
  { id: "py.ml.dot-product-geometry", title: "The dot product as weighted evidence and geometry", stage: 4, kind: "mental-model", requires: ["py.ml.vector-operations"], atom: "py.atom.ml.dot-product-geometry", language: "python" },
  { id: "py.ml.norm-families", title: "L1, L2, and infinity norms", stage: 4, kind: "mental-model", requires: ["py.ml.vector-operations"], atom: "py.atom.ml.norm-families", language: "python" },
];

export const ROADMAP_ATOMS: Atom[] = [
  {
    id: "py.atom.algo.scale",
    title: "Why efficiency matters",
    teaches: ["py.algo.scale"],
    requires: ["py.loops"],
    readingSeconds: 255,
    language: "python",
    recall: "Why can two correct solutions to the same problem behave completely differently as the input grows?",
    body: `## What this builds on

You already know how to read a loop. Now we will ask a different question: **how much work does that loop create when the input becomes large?**

## Words you will use

- **input size** — how many values the algorithm receives.
- **work** — the important steps the algorithm performs.
- **scale** — what happens when the input becomes much larger.

## The same answer, two very different costs

Suppose we need to detect whether a list contains a duplicate. This version compares every item with every item to its right:

\`\`\`python
def has_duplicate(values):
    for left in range(len(values)):
        for right in range(left + 1, len(values)):
            if values[left] == values[right]:
                return True
    return False
\`\`\`

The function is correct. The problem is the number of comparisons. With five distinct values it checks ten pairs. With one thousand distinct values it checks almost half a million pairs. With one million values, it would need almost half a trillion.

Now keep a set of values already seen:

\`\`\`python
def has_duplicate(values):
    seen = set()
    for value in values:
        if value in seen:
            return True
        seen.add(value)
    return False
\`\`\`

This version performs one membership check per value. The two functions return the same Boolean answer; their growth is radically different.

| Input size | Pair comparisons | One-pass checks |
| ---: | ---: | ---: |
| 10 | 45 | 10 |
| 1,000 | 499,500 | 1,000 |
| 1,000,000 | 499,999,500,000 | 1,000,000 |

## Scale chooses the algorithm

An algorithm is not “fast” in isolation. It is fast **for a workload, an input size, and a resource limit**. A simple pair scan may be the clearest choice for five values in a one-off script. It is not a viable choice for a million values on every request.

This is why constraints are part of the problem statement. If \`n\` can be ten, exhaustive search may be fine. If \`n\` can be one hundred thousand, a quadratic pair scan is already warning you that the design is wrong.

## Time is not the only resource

The set-based solution buys speed by storing up to \`n\` values. That is a **time-space trade-off**: more memory, less repeated work. Real algorithm design asks which resource is scarce and which trade is acceptable.

The inputs also matter. A hash set has allocation and hashing costs. The pair scan uses almost no extra memory.

Keep four questions in view:

| Question | Evidence |
| --- | --- |
| Input size? | Stated constraints |
| Run frequency? | Batch or hot path |
| Repeated work? | Scans or recomputation |
| Memory available? | Storage limit |

## A mistake to avoid

Do not optimize from vibes. Short code is not automatically fast, and a clever-looking expression is not automatically efficient. Measure the work implied by the structure, then benchmark representative inputs when constant factors matter.

## What to remember

**Correctness answers whether an algorithm produces the right result. Complexity answers whether it can keep producing that result at the required scale.**`,
    checks: [
      {
        question: "Two solutions are both correct. What makes input size relevant when choosing between them?",
        choices: ["Their work can grow at different rates as the input grows", "Large inputs change Python's syntax", "Only large inputs can contain duplicates"],
        answer: 0,
        explanation: "Scale magnifies differences in growth rate.",
        why: ["Correct. A linear and quadratic solution can look similar on tiny inputs and diverge enormously later.", "Python syntax does not depend on input size.", "Duplicates can occur at any nontrivial size; that is not the reason scale matters."],
      },
      {
        question: "What trade-off does the set-based duplicate check make?",
        choices: ["It uses extra memory to avoid repeated comparisons", "It changes the required answer", "It guarantees zero hashing cost"],
        answer: 0,
        explanation: "The set stores prior values so each new value needs one average-case lookup.",
        why: ["Correct. Remembered state replaces repeated pair scans.", "Both algorithms compute the same Boolean result.", "Hashing has a cost; the benefit is avoiding quadratic repeated work."],
      },
      {
        question: "A script processes at most eight records and runs once a week. What follows from the lecture?",
        choices: ["The pair scan is a reasonable choice here", "The pair scan is always wrong and must be replaced", "Complexity analysis no longer applies to this code"],
        answer: 0,
        explanation: "An algorithm is fast for a workload, an input size, and a resource limit — not in isolation.",
        why: ["Correct. At n = 8 the pair scan does 28 comparisons; clarity can matter more than growth.", "Growth only becomes decisive as the input grows; a bounded tiny input does not force the change.", "The analysis still applies — it simply tells you the difference is negligible at this size."],
      },
    ],
  },
  {
    id: "py.atom.algo.operation-count",
    title: "Counting operations",
    teaches: ["py.algo.operation-count"],
    requires: ["py.algo.scale"],
    readingSeconds: 270,
    language: "python",
    recall: "How do you turn a loop, a sequence of loops, and a loop nest into a count of work?",
    body: `## What this builds on

You have seen why growth matters. Now we need a repeatable way to derive it from code instead of guessing from appearances.

## Words you will use

- **operation** — one important step we choose to count.
- **sequential** — one region runs after another region.
- **nested** — one region runs inside another region.

## Choose the operation you are counting

An **operation** is the meaningful unit of work for the question. It might be a comparison, a dictionary lookup, a call to an expensive model, or one visit to an edge. We do not pretend every CPU instruction costs exactly the same. We count how many times the important work is triggered.

For a single loop, mark the repeated operation:

\`\`\`python
def total(values):
    result = 0
    for value in values:
        result += value
    return result
\`\`\`

If \`values\` has length \`n\`, the addition executes \`n\` times. Initializing and returning happen once each. A precise simplified count is therefore \`n + 2\` pieces of work under this model.

## Consecutive work adds

These loops do not multiply each other because the second begins after the first ends:

\`\`\`python
def endpoints(values):
    positives = 0
    for value in values:
        if value > 0:
            positives += 1

    zeros = 0
    for value in values:
        if value == 0:
            zeros += 1
    return positives, zeros
\`\`\`

Each loop visits \`n\` values, so the visits add: \`n + n = 2n\`. Two passes are still fundamentally different from trying every pair.

## Nested work multiplies only when the ranges do

Here the inner loop runs \`n\` times for each of \`n\` outer iterations:

\`\`\`python
def all_ordered_pairs(values):
    pairs = []
    for left in values:
        for right in values:
            pairs.append((left, right))
    return pairs
\`\`\`

The append executes \`n × n = n²\` times. But “two loops means squared” is not a valid rule. The following code also contains two loops, yet each item advances through the window at most once in each direction:

\`\`\`python
def longest_budget(values, budget):
    left = 0
    total = 0
    best = 0
    for right, value in enumerate(values):
        total += value
        while total > budget:
            total -= values[left]
            left += 1
        best = max(best, right - left + 1)
    return best
\`\`\`

The inner \`while\` may run several times during one outer iteration, but \`left\` moves from zero to at most \`n\` across the **entire function**. Count total pointer movement, not indentation. The outer pointer moves \`n\` times and the inner pointer moves at most \`n\` times: at most \`2n\` movements.

## Count a triangular range exactly once

When the right index starts after the left index, the row lengths shrink:

| Left position | Comparisons remaining |
| ---: | ---: |
| 0 | n - 1 |
| 1 | n - 2 |
| 2 | n - 3 |
| ... | ... |
| n - 1 | 0 |

The total is \`(n - 1) + (n - 2) + ... + 1 = n(n - 1) / 2\`. That exact expression will soon simplify to quadratic growth, but deriving it first explains where the result came from.

## A mistake to avoid

Do not count source lines. One line may hide a scan: \`target in values\` is still linear for a list. A library call may be exactly the expensive operation you need to count.

## What to remember

**Consecutive regions add. Truly nested ranges multiply. Shared moving boundaries require a total-movement argument. Hidden library work still counts.**`,
    checks: [
      {
        question: "Two separate loops each scan all n values. What is the combined visit count?",
        choices: ["2n", "n²", "log n"],
        answer: 0,
        explanation: "Sequential work adds; it does not multiply.",
        why: ["Correct. One n-length scan plus another is 2n.", "The loops would multiply only if one full scan ran inside every iteration of the other.", "Nothing is halving the input here."],
      },
      {
        question: "Why can a for-loop containing a while-loop still perform linear total work?",
        choices: ["If the inner pointer only advances at most n times over the whole function", "Every while-loop is constant time", "Python removes nested loops"],
        answer: 0,
        explanation: "Amortized pointer movement can bound all inner iterations together.",
        why: ["Correct. Count the total lifetime movement, not the worst inner burst in one iteration.", "A while-loop can run arbitrarily many times; it needs a bound.", "Python executes the control flow you wrote."],
      },
    ],
  },
  {
    id: "py.atom.algo.asymptotics",
    title: "Big O, Big Theta, Big Omega",
    teaches: ["py.algo.asymptotics"],
    requires: ["py.algo.operation-count"],
    readingSeconds: 285,
    language: "python",
    recall: "What different promises do O, Theta, and Omega make about growth, and why do constants disappear?",
    body: `## What this builds on

You can derive an operation count such as \`3n + 7\` or \`n(n - 1) / 2\`. Asymptotic notation turns that expression into a statement about growth when \`n\` becomes large.

## Words you will use

- **bound** — a line the growth cannot pass after inputs become large.
- **upper bound** — a promise that work grows no faster than a named shape.
- **tight bound** — one shape that gives both the upper and lower growth limits.
- **asymptotic** — describing the growth shape as the input becomes very large.

## Three bounds, three claims

**O(g(n))** is an upper bound. The work grows no faster than this shape, apart from a constant.

**Ω(g(n))** is a lower bound. The work grows at least this fast, apart from a constant.

**Θ(g(n))** is a tight bound. The upper and lower growth shapes match.

If a loop performs exactly \`3n + 7\` modeled operations, then it is \`Θ(n)\`: beyond a fixed point, that count is trapped between two constant multiples of \`n\`.

It is also technically \`O(n²)\`, because a linear function is eventually smaller than a suitable multiple of \`n²\`. That upper bound is true but loose. When people casually say “the algorithm is Big O of n,” they usually intend the tightest useful worst-case upper bound. Precise reasoning names the case and uses \`Θ\` when a tight bound is known.

## Keep the dominant term

Consider the triangular pair count:

\`\`\`python
comparisons = n * (n - 1) / 2
\`\`\`

Algebra gives \`0.5n² - 0.5n\`. As \`n\` grows, the squared term dominates the linear term. Multiplying by one half changes elapsed time, but it does not change the shape of growth. The tight asymptotic class is \`Θ(n²)\`.

This simplification is not permission to ignore engineering. An \`O(n)\` network request can be slower than an \`O(n log n)\` in-memory sort for every input you care about. Asymptotics compare growth; measurement captures constants, hardware, caches, allocation, and I/O.

## State which case you mean

This search stops as soon as it finds the target:

\`\`\`python
def contains(values, target):
    for value in values:
        if value == target:
            return True
    return False
\`\`\`

If the first value matches, the best case is \`Θ(1)\`. If the target is absent or last, the worst case is \`Θ(n)\`. Under a stated distribution of target positions, an average-case analysis may also be \`Θ(n)\`, but average case always requires assumptions. “Average” is not a magic compromise between best and worst.

## Common growth classes

| Growth | Typical source | Doubling n |
| --- | --- | --- |
| Θ(1) | direct index | almost no change |
| Θ(log n) | halve the search | adds one step |

A full scan is **Θ(n)**. Doubling the input doubles the work.

The faster-growing classes become restrictive quickly:

| Growth | Typical source | Doubling n |
| --- | --- | --- |
| Θ(n log n) | split, then merge | a little more than doubles |
| Θ(n²) | examine pairs | quadruples work |

Include-or-exclude choices often create **Θ(2ⁿ)** work. Doubling the input squares the number of possible states.

## A mistake to avoid

Never write a complexity label without naming **what n means**, which resource you measured, and which case you analyzed. A function over a matrix may depend on rows and columns separately; calling everything \`n\` can hide the real constraint.

## What to remember

**Derive the count, choose the case, simplify to the dominant growth, and keep constants for benchmarking rather than confusing them with growth class.**`,
    checks: [
      {
        question: "An exact operation count is 4n² + 3n + 20. What is its tight asymptotic class?",
        choices: ["Θ(n²)", "Θ(n)", "Θ(4n² + 3n + 20) only"],
        answer: 0,
        explanation: "The highest-order term controls eventual growth.",
        why: ["Correct. Constants and lower-order terms do not change the quadratic growth class.", "The quadratic term eventually dominates the linear term.", "That expression is exact, but Θ(n²) is a valid and more useful tight growth class."],
      },
      {
        question: "Why is saying an algorithm is O(n²) sometimes not informative even when true?",
        choices: ["A linear algorithm is also bounded above by n², so the bound may be loose", "Big O can only describe exact counts", "Quadratic bounds apply only to Python"],
        answer: 0,
        explanation: "Big O is an upper bound and need not be tight.",
        why: ["Correct. Prefer the tightest useful bound and state the analyzed case.", "Big O describes asymptotic bounds, not exact operation counts.", "The notation is language-independent."],
      },
    ],
  },
  {
    id: "py.atom.algo.growth-classes",
    title: "Common growth classes",
    teaches: ["py.algo.growth-classes"],
    requires: ["py.algo.asymptotics"],
    readingSeconds: 245,
    language: "python",
    recall: "What structural clue usually produces each common growth class, and what happens when n doubles?",
    body: `## What this builds on

Asymptotic notation names growth. Now we will connect each common class to the code structure that usually creates it.

## Words you will use

- **growth class** — a family of operation counts that grow in the same basic shape.
- **linear** — work grows in direct step with the input size.
- **exponential** — each new input choice multiplies the number of possibilities.

## Read the shape of the work

| Class | Structural clue | Example |
| --- | --- | --- |
| Θ(1) | fixed work independent of input length | read \`values[0]\` |
| Θ(log n) | discard a constant fraction each step | binary search |

The classes that touch the whole input grow faster:

| Class | Structural clue | Example |
| --- | --- | --- |
| Θ(n) | visit each item a bounded number of times | one scan |
| Θ(n log n) | logarithmic levels with linear work per level | merge sort |

The clues are evidence, not shortcuts. One list operation may hide a scan, and one nested loop may have a shared pointer that moves only \`n\` times in total. Derive the bound from how state progresses.

## Halving creates logarithms

Binary search keeps only one half after each comparison:

\`\`\`python
while left < right:
    middle = (left + right) // 2
    if values[middle] < target:
        left = middle + 1
    else:
        right = middle
\`\`\`

After \`k\` steps, roughly \`n / 2ᵏ\` candidates remain. Setting that to one gives \`k ≈ log₂(n)\`. Doubling \`n\` adds about one comparison; it does not double the search time.

## Branching creates explosive growth

Pair work is often **Θ(n²)**. Doubling \`n\` makes about four times as many pairs.

Two choices at each position often create **Θ(2ⁿ)** leaves. One more item doubles the leaves.

Trying every order creates **Θ(n!)** arrangements. One more item multiplies the arrangements.

Exponential and factorial algorithms are not automatically mistakes. Exhaustive search is often the correct baseline and may be unavoidable. The lesson is that their usable input sizes are small, so pruning, memoization, or stronger structure must do real work.

## Convert constraints into a budget

If \`n\` is around one hundred thousand, a linear or \`n log n\` method is a plausible starting target. A quadratic method implies roughly ten billion pair operations before constants. This is not a universal hardware threshold; it is a fast consistency check that tells you which ideas deserve investigation.

## A mistake to avoid

Do not memorize “nested equals quadratic” or “recursion equals exponential.” Merge sort is recursive and \`Θ(n log n)\`; a sliding window can contain nested syntax and remain \`Θ(n)\`. Follow the number and size of subproblems.

## What to remember

**Scans preserve input size, binary search shrinks it, divide-and-conquer creates levels, and unconstrained choices multiply the search tree. Derive before labeling.**`,
    checks: [
      { question: "Why is binary search logarithmic?", choices: ["Each comparison discards about half of the remaining candidates", "It checks every item twice", "It uses a while-loop"], answer: 0, explanation: "Repeated constant-factor shrinkage creates logarithmic depth.", why: ["Correct. Only about log₂(n) halvings are possible before one candidate remains.", "Checking every item would be linear.", "Loop syntax alone does not determine growth."] },
      { question: "What usually creates 2ⁿ candidate states?", choices: ["An independent include-or-exclude choice at each of n positions", "One direct list index", "Halving a sorted search range"], answer: 0, explanation: "Two branches per level across n levels produce 2ⁿ leaves.", why: ["Correct. Every added position doubles the combinations.", "Direct indexing is constant-time under the array model.", "Halving produces logarithmic depth."] },
    ],
  },
  {
    id: "py.atom.algo.dominant-growth",
    title: "Dropping constants and lower terms",
    teaches: ["py.algo.dominant-growth"],
    requires: ["py.algo.asymptotics"],
    readingSeconds: 230,
    language: "python",
    recall: "Why can asymptotic analysis drop constants while engineering measurements still must keep them?",
    body: `## What this builds on

You know that \`4n² + 3n + 20\` is tightly quadratic. This lesson makes the simplification rule precise and keeps it from becoming an excuse for careless performance claims.

## Words you will use

- **constant factor** — a fixed multiplier, such as the 4 in \`4n\`.
- **lower-order term** — a term that grows more slowly than another term.
- **dominant term** — the term that controls the shape for very large inputs.

## Constant multipliers do not change shape

These functions both scan their entire input:

\`\`\`python
def one_pass(values):
    return sum(values)

def three_passes(values):
    return min(values), max(values), sum(values)
\`\`\`

Under a simple visit model, the first performs about \`n\` visits and the second about \`3n\`. Both are \`Θ(n)\` because multiplying \`n\` by a fixed constant preserves linear growth. The second can still take roughly three times as long. Same class does not mean same speed.

## Lower-order terms disappear in the ratio

For \`T(n) = n² + 1000n\`, the linear term dominates at small sizes. But compare each term to \`n²\`: the ratio \`1000n / n²\` equals \`1000 / n\`, which approaches zero as \`n\` grows. The squared term eventually determines the curve's shape.

| n | n² | 1000n | Dominant now |
| ---: | ---: | ---: | --- |
| 10 | 100 | 10,000 | linear term |
| 10,000 | 100,000,000 | 10,000,000 | squared term |

Asymptotic analysis describes that eventual behavior. Your production range may live before the crossover, which is why benchmarks still matter.

## Constants can encode different operations

A comparison in memory and a database round trip are not interchangeable “one operation.” A linear number of remote calls is often worse than a local \`n log n\` computation. Choose a cost model that reflects the bottleneck, then measure the constants the model intentionally abstracts away.

## A mistake to avoid

Do not use Big O to declare optimization finished. First improve the growth class when scale requires it. Then profile the winning design for allocation, cache behavior, vectorization, network calls, and other constant factors that affect the actual workload.

## What to remember

**Drop constants and lower terms to compare eventual growth. Keep them when predicting elapsed time, finding crossovers, or choosing between implementations in the same class.**`,
    checks: [
      { question: "Are n and 100n in the same tight growth class?", choices: ["Yes, both are Θ(n), although their running times can differ greatly", "No, 100n is Θ(n²)", "Only for n below 100"], answer: 0, explanation: "A fixed multiplier does not change asymptotic shape.", why: ["Correct. Growth class and practical constant factor answer different questions.", "Multiplying by 100 does not create an extra factor of n.", "The asymptotic classification does not depend on that threshold."] },
      { question: "Why benchmark after deriving complexity?", choices: ["Complexity omits constants and machine or workload effects", "A benchmark changes the mathematical bound", "Big O measures only memory"], answer: 0, explanation: "Measurement fills in factors deliberately abstracted by the growth model.", why: ["Correct. Both analysis and representative evidence are needed.", "Measurement estimates behavior; it does not change the algorithm's derivation.", "Big O can describe time or space depending on the resource named."] },
    ],
  },
  {
    id: "py.atom.algo.space-cost",
    title: "Space complexity",
    teaches: ["py.algo.space-cost"],
    requires: ["py.algo.operation-count"],
    readingSeconds: 245,
    language: "python",
    recall: "What is the difference between input space, output space, auxiliary space, and call-stack space?",
    body: `## What this builds on

Time counts work. Space complexity tracks how much memory must exist at the same time as the input grows.

## Words you will use

- **memory** — storage used by values while a program runs.
- **auxiliary space** — temporary storage used to compute an answer.
- **peak** — the largest amount that is alive at one time.

## Name the category before giving the bound

**Input space** holds the data given by the caller. **Output space** holds the returned answer.

**Auxiliary space** is temporary working memory. **Total space** includes the input, output, and working memory.

Interview discussions usually ask for **auxiliary space** unless they say otherwise. State that assumption. An algorithm required to return \`n\` values cannot avoid \`Θ(n)\` output space, but it may still use only \`Θ(1)\` auxiliary space beyond that output.

## In-place means bounded extra storage

This reversal swaps inside the caller's list:

\`\`\`python
def reverse_in_place(values):
    left = 0
    right = len(values) - 1
    while left < right:
        values[left], values[right] = values[right], values[left]
        left += 1
        right -= 1
\`\`\`

The two indices and temporary swap references do not grow with \`n\`, so auxiliary space is \`Θ(1)\`. The input list still occupies \`Θ(n)\`; “constant space” never means the data vanished.

## Recursion uses memory too

Each active recursive call owns a frame containing its arguments, locals, and return location:

\`\`\`python
def countdown(n):
    if n == 0:
        return
    countdown(n - 1)
\`\`\`

At the deepest point, \`n + 1\` calls are active. The call stack therefore uses \`Θ(n)\` auxiliary space. Python does not optimize tail calls away.

## Peak live memory is the quantity to bound

Total allocation across time is not the same as maximum live memory. A loop may create and discard a small temporary each iteration while retaining constant peak auxiliary space. A list comprehension retains all \`n\` produced values at once and uses linear space.

Copying deserves attention: \`values[:]\`, \`sorted(values)\`, and many slices allocate new containers. Views, iterators, or in-place mutation may save memory, but they change lifetime, aliasing, or API semantics.

## A mistake to avoid

Do not claim \`Θ(1)\` space because you did not write the word “list.” Library calls, recursion frames, queues, hash tables, substrings, and returned copies all occupy memory.

## What to remember

**Name which memory category you are analyzing, count peak live storage, include hidden containers and call frames, and separate required output from temporary auxiliary space.**`,
    checks: [
      { question: "A recursive function reaches depth n and stores constant data per frame. What auxiliary space does its stack use?", choices: ["Θ(n)", "Θ(1)", "Θ(n²)"], answer: 0, explanation: "n simultaneously active constant-size frames require linear space.", why: ["Correct. Recursion frames are auxiliary memory.", "That would ignore the growing call stack.", "There is one frame per depth, not n frames at every depth."] },
      { question: "A function must return a new list of n answers but uses only a few counters besides it. What can you report?", choices: ["Θ(n) output space and Θ(1) auxiliary space beyond the output", "No space is used", "Θ(n²) auxiliary space"], answer: 0, explanation: "Required output and temporary workspace are separate categories.", why: ["Correct. State both so the claim is unambiguous.", "The returned list necessarily occupies memory.", "Nothing here creates a quadratic live structure."] },
    ],
  },
  {
    id: "py.atom.algo.amortized-cost",
    title: "Amortized analysis",
    teaches: ["py.algo.amortized-cost"],
    requires: ["py.algo.asymptotics", "py.lists"],
    readingSeconds: 250,
    language: "python",
    recall: "How can an occasional linear-time append coexist with constant amortized append cost?",
    body: `## What this builds on

Worst-case analysis asks how expensive one operation can be. **Amortized analysis** asks how expensive each operation is on average across a guaranteed sequence, without assuming random inputs.

## Words you will use

- **capacity** — how many items fit before storage must grow.
- **resize** — replace full storage with a larger area and copy items into it.
- **amortized cost** — total sequence cost shared across all operations in that sequence.

## Dynamic arrays keep spare capacity

Python lists are dynamic arrays. Their object references live in a contiguous backing array with a current length and a capacity. If spare capacity remains, append writes one reference into the next slot.

When capacity is exhausted, the list allocates a larger backing array and copies existing references before adding the new one. That single append can cost \`Θ(n)\`.

\`\`\`python
values = []
for item in stream:
    values.append(item)
\`\`\`

The loop is not quadratic. Capacity grows by a fixed percentage, so expensive copies happen farther and farther apart.

## Charge copies across the whole sequence

Use a simplified doubling policy. Growing from capacities one, two, four, and eight copies this many existing entries:

| Growth event | References copied |
| ---: | ---: |
| 1 to 2 | 1 |
| 2 to 4 | 2 |
| 4 to 8 | 4 |
| 8 to 16 | 8 |

Before reaching capacity \`n\`, the total copied references form \`1 + 2 + 4 + ...\`, which is less than \`2n\`. Add the \`n\` ordinary writes and the entire append sequence performs less than a constant multiple of \`n\` work. Spread across \`n\` appends, that is \`Θ(1)\` amortized work per append.

## Amortized is not average-case probability

Average-case analysis needs a distribution over inputs or events. Amortized analysis makes a deterministic promise about every sufficiently long valid operation sequence. One unlucky append can still pause for a resize, so latency-sensitive code may care about the worst individual operation even when throughput follows the amortized bound.

The same reasoning appears in hash-table resizing, stack operations that occasionally rebuild state, and monotonic structures where each item is pushed and popped at most once.

## A mistake to avoid

Do not turn “amortized constant” into “every call is constant.” Name the expensive event, prove how rarely it can happen, and decide whether occasional latency spikes are acceptable.

## What to remember

**An amortized bound charges rare expensive operations across the cheap operations that make them possible. It guarantees sequence cost, not identical latency for every call.**`,
    checks: [
      { question: "Why are repeated list appends amortized Θ(1)?", choices: ["Geometric capacity growth makes all resize copies across n appends total Θ(n)", "A list never copies elements", "Append uses binary search"], answer: 0, explanation: "Geometrically spaced rebuilds have a linear total cost across the sequence.", why: ["Correct. Linear total work divided across n appends is constant amortized work.", "A resize copies existing references.", "No search is required to append at the end."] },
      { question: "Does amortized Θ(1) mean every append has constant worst-case latency?", choices: ["No, a resize append can still be Θ(n)", "Yes, amortized and worst-case are identical", "Only when the list stores integers"], answer: 0, explanation: "Amortized cost is a sequence guarantee, not a per-operation worst-case bound.", why: ["Correct. Rare resize events are paid for by many cheap appends.", "They answer different questions.", "Stored object type does not remove backing-array resize behavior."] },
    ],
  },
  {
    id: "py.atom.algo.analysis-cases",
    title: "Best, worst, expected, and amortized cases",
    teaches: ["py.algo.analysis-cases"],
    requires: ["py.algo.asymptotics"],
    readingSeconds: 240,
    language: "python",
    recall: "Which assumption distinguishes worst-case, expected-case, and amortized analysis?",
    body: `## What this builds on

A complexity expression is incomplete until it names the situation being bounded.

## Words you will use

- **best case** — the easiest valid input for this algorithm.
- **worst case** — the hardest valid input for this algorithm.
- **expected case** — the average under a named chance model.

## One algorithm can have several valid bounds

Linear search stops when it finds the target:

\`\`\`python
def contains(values, target):
    for value in values:
        if value == target:
            return True
    return False
\`\`\`

| Case | Input situation | Comparisons |
| --- | --- | ---: |
| best | target is first | 1 |
| worst | target is absent or last | n |
| expected | target position follows a stated distribution | depends on that distribution |

The best case is \`Θ(1)\`; the worst case is \`Θ(n)\`. If a successful target is equally likely to occupy any position, the expected successful search still checks about \`n / 2\` values and is \`Θ(n)\`.

## Expected means probabilistic assumptions

An expected bound uses chance rules that must be named. The chance may come from the inputs or from the algorithm itself, as in randomized quicksort. It is not a guess about “normal data.” If the chance rules change, the expected result can change.

## Amortized means a sequence guarantee

Amortized analysis does not need random inputs. It bounds the total cost of any valid operation sequence, then shares that cost across operations. Dynamic-array append gets its bound from the growth rule, not from luck.

## Choose the case from the consequence

Interviews usually lead with worst-case time and auxiliary space because those bounds are defensible without hidden distribution assumptions. Security, real-time, and service-level work also care about adversarial or tail behavior. Throughput planning may use measured percentiles and expected rates, but it should keep a worst-case guardrail.

Best case is rarely a selection criterion. It can explain early exits, but an algorithm that is instant only on already-easy inputs may not satisfy the actual contract.

## A mistake to avoid

Do not say “average” when you mean amortized, and do not report expected behavior without the probability model. Label the claim so another engineer can test the assumption.

## What to remember

**Worst case quantifies the hardest valid input, expected case averages under named randomness, and amortized case spreads deterministic sequence cost. State which claim you are making.**`,
    checks: [
      { question: "What does an expected-case bound require?", choices: ["A named probability distribution or algorithmic randomness", "Only the smallest possible input", "A sequence accounting proof with no probability"], answer: 0, explanation: "Expectation is defined relative to a probability model.", why: ["Correct. Without the model, the average is not a reproducible claim.", "That describes neither expected nor general behavior.", "That describes amortized analysis."] },
      { question: "Which analysis bounds total cost across an operation sequence without assuming random inputs?", choices: ["Amortized analysis", "Best-case analysis", "Expected-case analysis"], answer: 0, explanation: "Amortized bounds distribute deterministic sequence cost across operations.", why: ["Correct. It explains structures such as dynamic arrays.", "Best case chooses the easiest single input.", "Expected case uses probability." ] },
    ],
  },
  {
    id: "py.atom.ml.vector-operations",
    title: "Scalars, vectors, and vector operations",
    teaches: ["py.ml.vector-operations"],
    requires: ["py.lists", "py.loops"],
    readingSeconds: 285,
    language: "python",
    recall: "What does a vector's shape mean, and which vector operations are elementwise versus reductions?",
    body: `## What this builds on

You already know Python numbers and lists. Machine learning gives those structures a stricter mathematical meaning: a number can be a **scalar**, and an ordered list of compatible measurements can be a **vector**.

## Words you will use

- **scalar** — one number.
- **vector** — numbers kept in a specific order, where each position has a meaning.
- **shape** — the size of each direction in the data; a simple vector has one length.

## One example becomes coordinates

Imagine one apartment represented by three features:

\`\`\`python
apartment = [72.0, 2.0, 14.0]
\`\`\`

The coordinates mean \`[square_metres, bedrooms, age_years]\`. The order is part of the contract. Swapping bedrooms and age does not create a harmless rearrangement; it changes what the model sees.

A scalar has no feature axis, such as a learning rate \`0.01\`. This vector has shape \`(3,)\`: one axis containing three coordinates. Shape is not decoration. It tells us which operations are defined and what their result means.

## Elementwise operations preserve shape

Adding two vectors combines matching coordinates:

\`\`\`python
left = [1.0, 2.0, 3.0]
right = [4.0, 5.0, 6.0]
added = [a + b for a, b in zip(left, right)]
\`\`\`

The result is \`[5.0, 7.0, 9.0]\`. Both inputs must describe the same coordinate system and have the same length. Python's \`zip\` silently stops at the shorter input, so production numeric code should validate shapes or use an array library that makes shape behavior explicit.

Multiplying by a scalar scales every coordinate:

\`\`\`python
direction = [2.0, -1.0]
step = 0.25
moved = [step * value for value in direction]
\`\`\`

The result \`[0.5, -0.25]\` points in the same or opposite direction depending on the scalar sign, with its magnitude scaled by the scalar's absolute value.

## Reductions collapse an axis

An elementwise operation returns another vector. A **reduction** combines coordinates into fewer values:

| Operation | Input | Output |
| --- | --- | --- |
| scalar multiply | vector and scalar | vector |
| vector add | two matching vectors | vector |
| sum | vector | scalar |
| mean | vector | scalar |
| dot product | two matching vectors | scalar |

This distinction predicts tensor shapes later. If an operation acts independently at every coordinate, it normally preserves that axis. If it aggregates across an axis, that axis disappears unless we deliberately keep a length-one dimension.

## Features need compatible scale and meaning

Adding vectors is mathematically allowed when their shapes match, but the result may still make no sense. Adding a color vector to an apartment vector mixes unrelated positions. ML bugs often pass shape checks while using the wrong meaning.

Feature scale also matters. In \`[income_dollars, number_of_children]\`, the first coordinate may be tens of thousands while the second is single digits. Distance and gradient methods can become dominated by units rather than useful signal. Standardization later repairs scale; it cannot repair a mislabeled coordinate.

## A mistake to avoid

Do not treat a vector as “just a list of numbers.” Record the coordinate meaning, expected shape, units, dtype, and missing-value policy. A model cannot infer that two columns were swapped after deployment.

## What to remember

**A vector is an ordered coordinate representation. Shape says how many coordinates exist; the feature contract says what each coordinate means.**`,
    checks: [
      {
        question: "Why can two length-three vectors still be invalid to add?",
        choices: ["Their coordinates may represent different meanings or units", "Python forbids all vector addition", "A vector must always contain four coordinates"],
        answer: 0,
        explanation: "Matching shape is needed, but the meaning of each position must also match.",
        why: ["Correct. Shape compatibility does not guarantee semantic compatibility.", "Python can implement elementwise addition; validity depends on the representation.", "Vectors may have any deliberate dimensionality."],
      },
      {
        question: "Which operation reduces two matching vectors to one scalar?",
        choices: ["Dot product", "Elementwise addition", "Scalar multiplication"],
        answer: 0,
        explanation: "The dot product sums coordinatewise products.",
        why: ["Correct. Multiplication happens per coordinate, then a sum collapses the coordinate axis.", "Elementwise addition preserves the vector's shape.", "Scalar multiplication also preserves the vector's shape."],
      },
    ],
  },
  {
    id: "py.atom.ml.dot-product-geometry",
    title: "The dot product",
    teaches: ["py.ml.dot-product-geometry"],
    requires: ["py.ml.vector-operations"],
    readingSeconds: 300,
    language: "python",
    recall: "How can the same dot product represent weighted evidence, alignment, and one neuron's score?",
    body: `## What this builds on

You can add matching vectors and scale them. The dot product combines two vectors into one scalar that measures how strongly their coordinates agree.

## Words you will use

- **coordinate** — one numbered position inside a vector.
- **weight** — a number that says how strongly one coordinate should count.
- **dot product** — multiply matching coordinates, then add all those products.

## Multiply matching coordinates, then add

For vectors \`x\` and \`w\` of length \`d\`:

\`x · w = x₁w₁ + x₂w₂ + ... + x_dw_d\`

In Python, keep the shape check visible:

\`\`\`python
def dot(x, w):
    if len(x) != len(w):
        raise ValueError("vector shapes must match")
    return sum(value * weight for value, weight in zip(x, w))
\`\`\`

With \`x = [3, 1, 2]\` and \`w = [0.5, -2, 1]\`, the products are \`[1.5, -2, 2]\`, so the dot product is \`1.5\`.

## Read it as weighted evidence

Suppose the coordinates are three apartment features and the weights belong to a simple price score:

| Coordinate | Feature value | Weight | Contribution |
| --- | ---: | ---: | ---: |
| floor area | 3 | 0.5 | 1.5 |
| distance penalty | 1 | -2 | -2 |
| bedrooms | 2 | 1 | 2 |

A positive weight treats a larger feature as evidence that raises the score. A negative weight lowers it. A zero weight ignores that coordinate. The dot product adds every signed contribution into one score.

A neuron starts with exactly this operation, then adds a bias:

\`\`\`python
score = dot(features, weights) + bias
\`\`\`

The bias shifts the threshold independently of the input coordinates. An activation may then transform the score, but the weighted sum is the neuron's core linear computation.

## Read it geometrically

The same quantity also satisfies \`x · w = ||x||₂ ||w||₂ cos(θ)\`. Its sign reveals alignment:

| Dot product | Geometric relationship |
| ---: | --- |
| positive | angle less than 90 degrees; broadly aligned |
| zero | perpendicular, if neither vector is zero |
| negative | angle greater than 90 degrees; broadly opposed |

If both vectors are normalized to length one, their dot product is cosine similarity. That is why normalized embeddings can be compared by a dot product in semantic search.

## Batch form becomes matrix multiplication

One weight vector produces one score. Stack several weight vectors as rows of a matrix and each row computes its own dot product with the input. A matrix-vector product is therefore many neurons evaluated together.

This connection matters because it unifies the math: linear regression, logistic regression, dense neural layers, attention scores, and embedding retrieval all rely on large batches of dot products.

## A mistake to avoid

Do not use raw dot products as “similarity” without considering magnitude. A very long vector can earn a large dot product even when its direction is a mediocre match. Normalize first when direction alone should matter.

## What to remember

**The dot product adds signed contributions. Algebra calls it a weighted sum. Geometry calls it alignment. A neural network calls it the score before an activation.**`,
    checks: [
      {
        question: "What does a negative weight do in a feature dot product?",
        choices: ["A larger feature value lowers the combined score", "It deletes the feature", "It makes the vector length invalid"],
        answer: 0,
        explanation: "Each coordinate contributes feature times weight, including the weight's sign.",
        why: ["Correct. A positive feature multiplied by a negative weight contributes negative evidence.", "Only a zero weight removes that coordinate's contribution.", "Signs do not affect shape validity."],
      },
      {
        question: "When does a dot product equal cosine similarity?",
        choices: ["When both vectors are normalized to unit L2 length", "Whenever both vectors contain integers", "Only when the dot product is zero"],
        answer: 0,
        explanation: "Normalization removes magnitude from the geometric dot-product identity.",
        why: ["Correct. The remaining dot product is the cosine of the angle.", "Numeric type does not provide normalization.", "A zero dot product indicates orthogonality for nonzero vectors, not the general condition."],
      },
    ],
  },
  {
    id: "py.atom.ml.norm-families",
    title: "Norms",
    teaches: ["py.ml.norm-families"],
    requires: ["py.ml.vector-operations"],
    readingSeconds: 285,
    language: "python",
    recall: "How do L1, L2, and infinity norms measure different notions of vector size?",
    body: `## What this builds on

A vector gives coordinates. A **norm** turns those coordinates into one nonnegative scalar that behaves like a length.

## Words you will use

- **norm** — a rule that turns a vector into a nonnegative size.
- **distance** — the norm of the difference between two vectors.
- **normalize** — divide a nonzero vector by its norm so its size becomes one.
- **regularization** — add a penalty that discourages a model from using overly large weights.

## Three useful notions of size

For \`v = [3, -4]\`:

**L1** adds absolute values. For \`[3, -4]\`, it is \`7\`.

**L2** is the straight-line length. For this vector, it is \`5\`.

**L∞** is the largest absolute value. Here, it is \`4\`.

Here are the three definitions written directly in Python:

\`\`\`python
import math

def l1(v):
    return sum(abs(value) for value in v)

def l2(v):
    return math.sqrt(sum(value * value for value in v))

def linf(v):
    return max((abs(value) for value in v), default=0.0)
\`\`\`

Every norm is zero only for the zero vector, is never negative, scales with the absolute value of a scalar, and obeys the triangle inequality. Those properties are what make a function a norm rather than an arbitrary score.

## Distance is the norm of a difference

To measure distance from \`a\` to \`b\`, subtract first and measure the remainder: \`distance(a, b) = ||a - b||\`.

\`\`\`python
def l2_distance(a, b):
    if len(a) != len(b):
        raise ValueError("vector shapes must match")
    difference = [left - right for left, right in zip(a, b)]
    return l2(difference)
\`\`\`

The norm chooses the geometry. L2 draws circular distance contours in two dimensions. L1 draws diamonds, because moving three units horizontally and four vertically costs seven. L-infinity draws squares, because only the largest coordinate change sets the distance.

## Norms appear inside learning objectives

Regularization penalizes parameter size. An L2 penalty smoothly discourages large weights across many coordinates. An L1 penalty has a sharp corner at zero and often drives some weights exactly to zero, producing sparse parameter vectors.

Norms also support normalization:

\`\`\`python
def unit_vector(v):
    length = l2(v)
    if length == 0:
        raise ValueError("the zero vector has no direction")
    return [value / length for value in v]
\`\`\`

After normalization, the vector keeps its direction and has L2 length one. The zero vector is a required edge case: dividing by its length would divide by zero, and it has no unique direction to preserve.

## Scale before using distance

If one feature is measured in dollars and another in a small count, the dollar coordinate can dominate every norm. The arithmetic is correct while the modeling choice is wrong. Standardize or otherwise scale features using parameters fitted on the training set only.

## A mistake to avoid

Do not write “the distance” without naming the norm and preprocessing. Different norms encode different assumptions, and unscaled coordinates encode accidental units as importance.

## What to remember

**A norm defines what vector size means. Distance applies that norm to a difference; normalization divides by a norm to preserve direction while removing magnitude.**`,
    checks: [
      {
        question: "What is the L1 norm of [3, -4]?",
        choices: ["7", "5", "4"],
        answer: 0,
        explanation: "L1 sums absolute coordinate values.",
        why: ["Correct. |3| + |-4| = 7.", "Five is the L2 norm from the three-four-five triangle.", "Four is the infinity norm, the largest absolute coordinate."],
      },
      {
        question: "Why must unit-vector code handle the zero vector separately?",
        choices: ["Its norm is zero, so division is undefined and it has no direction", "Zero vectors are not valid Python lists", "Its L2 norm is always one"],
        answer: 0,
        explanation: "Normalization divides by length and is meaningful only for a nonzero direction.",
        why: ["Correct. Both the arithmetic and geometric interpretation fail for the zero vector.", "A list of zeros is valid data.", "The zero vector's L2 norm is zero."],
      },
    ],
  },
];

export const ROADMAP_LESSON_CONTENT: Record<string, LessonContent> = {
  "py.ac.m1_1.l1": { atomId: "py.atom.algo.scale", repIds: [], problemIds: [], drillIds: [] },
  "py.ac.m1_1.l2": { atomId: "py.atom.algo.operation-count", repIds: [], problemIds: [], drillIds: [] },
  "py.ac.m1_1.l3": { atomId: "py.atom.algo.asymptotics", repIds: [], problemIds: [], drillIds: [] },
  "py.ac.m1_1.l4": { atomId: "py.atom.algo.growth-classes", repIds: [], problemIds: [], drillIds: [] },
  "py.ac.m1_1.l5": { atomId: "py.atom.algo.dominant-growth", repIds: [], problemIds: [], drillIds: [] },
  "py.ac.m1_1.l6": { atomId: "py.atom.algo.space-cost", repIds: [], problemIds: [], drillIds: [] },
  "py.ac.m1_1.l7": { atomId: "py.atom.algo.amortized-cost", repIds: [], problemIds: [], drillIds: [] },
  "py.ac.m1_1.l8": { atomId: "py.atom.algo.analysis-cases", repIds: [], problemIds: [], drillIds: [] },
  "py.mc.m1_1.l1": { atomId: "py.atom.ml.vector-operations", repIds: [], problemIds: [], drillIds: [] },
  "py.mc.m1_1.l2": { atomId: "py.atom.ml.dot-product-geometry", repIds: [], problemIds: ["py.ml.dot-product"], drillIds: ["py.drill.ml.dot"] },
  "py.mc.m1_1.l3": { atomId: "py.atom.ml.norm-families", repIds: [], problemIds: ["py.ml.vector-norm"], drillIds: [] },
};

import {
  guidedLessonContent,
  guidedMasteryAtom,
  guidedMasteryConcept,
  type GuidedMasterySpec,
} from "./guidedMastery";

const ALGO_DP_OPTIMIZATION_SPECS: GuidedMasterySpec[] = [
  {
    lessonId: "py.ac.m12_4.l1",
    atomId: "py.atom.algo.convex-hull-trick",
    conceptId: "py.algo.convex-hull-trick",
    title: "Convex hull trick",
    requires: ["py.algo.dp-optimizations"],
    vocabulary: [
      ["linear transition", "a state cost of the form slope times query plus intercept"],
      ["lower envelope", "the pointwise minimum of a set of lines"],
      ["useless line", "a line that is never the minimum anywhere and may be discarded"],
    ],
    opening:
      "When every transition is a straight line evaluated at the same query, you are not searching states. You are asking which line sits lowest.",
    outcome:
      "You will maintain the lower envelope of the transition lines and answer each state with a binary search instead of a scan.",
    why:
      "A quadratic dynamic program with linear transitions is extremely common, and this turns it into near-linear without changing the recurrence.",
    mentalModel:
      "Picture every already-computed state as a line. The answer at a query is whichever line sits lowest there, and lines that are never lowest can be thrown away for good.",
    firstTitle: "Keep only the useful lines",
    firstIntro:
      "Three consecutive lines where the middle one is never lowest means the middle is useless. Testing that with a cross-multiplied comparison keeps the envelope clean.",
    firstCode: `def naive(costs, values):
    n = len(costs)
    dp = [0.0] * n
    for i in range(1, n):
        dp[i] = min(dp[j] + costs[j] * values[i] for j in range(i))
    return dp

def envelope(costs, values):
    n = len(costs)
    dp = [0.0] * n
    lines = [(costs[0], 0.0)]

    def useless(l1, l2, l3):
        (m1, b1), (m2, b2), (m3, b3) = l1, l2, l3
        return (b3 - b1) * (m1 - m2) <= (b2 - b1) * (m1 - m3)

    for i in range(1, n):
        x = values[i]
        lo, hi = 0, len(lines) - 1
        while lo < hi:
            mid = (lo + hi) // 2
            here = lines[mid][0] * x + lines[mid][1]
            nxt = lines[mid + 1][0] * x + lines[mid + 1][1]
            lo, hi = (lo, mid) if here <= nxt else (mid + 1, hi)
        dp[i] = lines[lo][0] * x + lines[lo][1]
        new = (costs[i], dp[i])
        while len(lines) >= 2 and useless(lines[-2], lines[-1], new):
            lines.pop()
        lines.append(new)
    return dp`,
    firstTrace:
      "The envelope holds only the lines that win somewhere. Popping is amortized, so the total work of maintaining it is linear across the whole run.",
    secondTitle: "Same answers, different cost",
    secondIntro:
      "The optimisation must not change a single value. Compare against the direct recurrence before trusting it.",
    secondCode: `costs = [10, 8, 6, 4, 2, 1]
values = [0, 5, 9, 12, 20, 30]
print(naive(costs, values))
print(envelope(costs, values))
print(naive(costs, values) == envelope(costs, values))

for n in (1_000, 100_000, 1_000_000):
    print(n, "direct", n * n, "envelope", n * max(1, n.bit_length()))`,
    secondTrace:
      "Identical arrays, and at a million states the direct form needs a trillion operations against nineteen million. The recurrence is unchanged.",
    mistake:
      "Applying it when the slopes arrive in arbitrary order. The simple stack version needs monotone slopes; unordered slopes need a balanced structure instead.",
    checkpoint:
      "What shape must the transition have for this to apply?",
    checkpointAnswer:
      "A slope taken from an already-computed state, times a query taken from the current state, plus an intercept - a straight line in the query.",
    remember:
      "Lines, not states: keep the lower envelope and search it.",
    checks: [
      {
        prompt: "What does each earlier state become?",
        options: ["A line in the query variable", "A point", "An interval"],
        answerIndex: 0,
        hint: "Slope times query plus intercept.",
        explanations: [
          "Correct. The answer is the lowest line at that query.",
          "Points would not compose into an envelope.",
          "Intervals belong to a different technique.",
        ],
      },
      {
        prompt: "When may a line be discarded permanently?",
        options: [
          "When it is never the minimum anywhere",
          "When its slope is largest",
          "When it was added earliest",
        ],
        answerIndex: 0,
        hint: "That is what the three-line test checks.",
        explanations: [
          "Correct. It can never become useful later.",
          "A large slope can still win at small queries.",
          "Age is irrelevant.",
        ],
      },
      {
        prompt: "The slopes arrive in arbitrary order. What changes?",
        options: [
          "The simple stack no longer works; a balanced structure is needed",
          "Nothing",
          "The answers become approximate",
        ],
        answerIndex: 0,
        hint: "The stack assumes monotone insertion.",
        explanations: [
          "Correct. Insertion must find its place in the envelope.",
          "The stack version breaks silently.",
          "The technique stays exact when done correctly.",
        ],
      },
    ],
  },
  {
    lessonId: "py.ac.m12_4.l2",
    atomId: "py.atom.algo.divide-conquer-dp",
    conceptId: "py.algo.divide-conquer-dp",
    title: "Divide-and-conquer DP optimization",
    requires: ["py.algo.convex-hull-trick"],
    vocabulary: [
      ["optimal split", "the index achieving the best value for a given state"],
      ["monotone optima", "optimal splits that never move left as the state index grows"],
      ["search range", "the interval of candidate splits a state actually needs to examine"],
    ],
    opening:
      "If the best split for one state never lies left of the best split for the state before it, most of the search is provably wasted.",
    outcome:
      "You will verify the monotonicity, then bound each state's search by its neighbours and count the saving.",
    why:
      "It applies to layered dynamic programs where the cost function has the right structure, and it costs nothing but a bound on the loop.",
    mentalModel:
      "Picture the optimal splits as a non-decreasing staircase. Once you know two steps, everything between them is trapped in a narrow band.",
    firstTitle: "Confirm the staircase",
    firstIntro:
      "Never assume monotonicity. Compute the optimal splits directly on a small case and check that they never decrease.",
    firstCode: `def cost(i, j):
    return (j - i) ** 2 + 3

n, k = 12, 3
INF = float("inf")
dp = [[INF] * (n + 1) for _ in range(k + 1)]
dp[0][0] = 0
opt = [[0] * (n + 1) for _ in range(k + 1)]
scanned = 0
for layer in range(1, k + 1):
    for j in range(1, n + 1):
        for i in range(j):
            scanned += 1
            value = dp[layer - 1][i] + cost(i, j)
            if value < dp[layer][j]:
                dp[layer][j] = value
                opt[layer][j] = i

print(opt[3][1:])
print(all(opt[3][j] <= opt[3][j + 1] for j in range(1, n)))`,
    firstTrace:
      "The splits read zero, zero, two, two, three, four, four, five, six, six, seven, eight - non-decreasing throughout. The staircase is real for this cost function.",
    secondTitle: "Bound the search",
    secondIntro:
      "A state's split lies between the split of the state before it and its own. Counting only those candidates shows how much the full scan was wasting.",
    secondCode: `bounded = 0
for layer in range(1, k + 1):
    for j in range(1, n + 1):
        low = opt[layer][j - 1] if j > 1 else 0
        high = opt[layer][j]
        bounded += max(1, high - low + 1)

print("splits scanned without the bound:", scanned)
print("splits scanned with the bound:", bounded)`,
    secondTrace:
      "Two hundred thirty-four candidates against fifty. On a real problem with thousands of states the ratio is what turns quadratic into near-linear.",
    mistake:
      "Applying it without checking that the cost satisfies the required inequality. Monotonicity is a property of the cost function, not of dynamic programming in general, and a violation gives wrong answers rather than slow ones.",
    checkpoint:
      "What has to be true of the optimal splits for this to work?",
    checkpointAnswer:
      "They must never decrease as the state index grows, which is a property of the cost function and must be checked.",
    remember:
      "Check the staircase, then trap the search between neighbours.",
    checks: [
      {
        prompt: "What does the optimisation exploit?",
        options: [
          "Optimal splits that never move left",
          "A convex cost function",
          "Sparse transitions",
        ],
        answerIndex: 0,
        hint: "It is a property of where the optimum sits.",
        explanations: [
          "Correct. That is what bounds the search.",
          "Convexity is one way to get it, not the property itself.",
          "Sparsity is unrelated.",
        ],
      },
      {
        prompt: "What happens if monotonicity does not hold?",
        options: [
          "The answers become wrong, not merely slow",
          "It runs at the original speed",
          "It fails loudly",
        ],
        answerIndex: 0,
        hint: "The true optimum may sit outside the bounded range.",
        explanations: [
          "Correct. That is why the property must be checked.",
          "The bound is still applied.",
          "Nothing detects the violation automatically.",
        ],
      },
      {
        prompt: "How is one state's search range determined?",
        options: [
          "By the optimal splits of the states around it",
          "By its own index",
          "By the layer count",
        ],
        answerIndex: 0,
        hint: "The staircase traps it between neighbours.",
        explanations: [
          "Correct. Neighbouring optima are the bounds.",
          "The index alone gives the full range.",
          "Layers are handled independently.",
        ],
      },
    ],
  },
  {
    lessonId: "py.ac.m12_4.l3",
    atomId: "py.atom.algo.knuth-optimization",
    conceptId: "py.algo.knuth-optimization",
    title: "Knuth's optimization",
    requires: ["py.algo.divide-conquer-dp"],
    vocabulary: [
      ["interval dynamic program", "a recurrence over intervals, split at some interior point"],
      ["quadrangle inequality", "a condition on the cost function that forces the optimal split to behave"],
      ["split bound", "restricting an interval's split to lie between two neighbouring intervals' splits"],
    ],
    opening:
      "An interval dynamic program tries every split, which is cubic. When the cost obeys the quadrangle inequality, almost all of those splits can be skipped.",
    outcome:
      "You will bound each interval's split by its two neighbours and confirm the answers are unchanged.",
    why:
      "Matrix chain ordering, optimal binary search trees and file merging are all this recurrence, and cubic is often too slow.",
    mentalModel:
      "Picture the table of optimal splits. Each entry is trapped between its two neighbouring entries, which collapses the inner loop to a handful of candidates.",
    firstTitle: "Bounded splits",
    firstIntro:
      "For the interval from i to j, the split lies between the split of i to j minus one and the split of i plus one to j. That is the entire optimisation.",
    firstCode: `def matrix_chain(dims):
    n = len(dims) - 1
    dp = [[0] * n for _ in range(n)]
    opt = [[i for _ in range(n)] for i in range(n)]
    for length in range(2, n + 1):
        for i in range(n - length + 1):
            j = i + length - 1
            best, arg = float("inf"), i
            low = opt[i][j - 1]
            high = opt[i + 1][j] if i + 1 <= j else j - 1
            for k in range(max(i, low), min(j - 1, high) + 1):
                value = (dp[i][k] + dp[k + 1][j]
                         + dims[i] * dims[k + 1] * dims[j + 1])
                if value < best:
                    best, arg = value, k
            dp[i][j], opt[i][j] = best, arg
    return dp[0][n - 1], opt`,
    firstTrace:
      "The inner loop runs from one neighbouring split to the other instead of across the whole interval. Summed over the table that is a linear rather than quadratic inner cost.",
    secondTitle: "Checked against the full search",
    secondIntro:
      "A bound that skips the true optimum produces a wrong answer silently. Compare against the unrestricted recurrence on several inputs.",
    secondCode: `def full_search(dims):
    n = len(dims) - 1
    dp = [[0] * n for _ in range(n)]
    for length in range(2, n + 1):
        for i in range(n - length + 1):
            j = i + length - 1
            dp[i][j] = min(dp[i][k] + dp[k + 1][j]
                           + dims[i] * dims[k + 1] * dims[j + 1]
                           for k in range(i, j))
    return dp[0][n - 1]

for dims in ([40, 20, 30, 10, 30], [5, 4, 6, 2, 7],
             [30, 35, 15, 5, 10, 20, 25]):
    bounded, _ = matrix_chain(dims)
    print(dims, bounded, full_search(dims), bounded == full_search(dims))`,
    secondTrace:
      "Twenty-six thousand, one hundred fifty-eight and fifteen thousand one hundred twenty-five - identical from both. The bound skipped no optimum.",
    mistake:
      "Assuming any interval cost qualifies. The quadrangle inequality has to be verified for the specific cost, and a plausible-looking cost that violates it produces answers that are wrong on some inputs and right on others.",
    checkpoint:
      "Which two entries bound the split for the interval from i to j?",
    checkpointAnswer:
      "The optimal split of i to j minus one, and the optimal split of i plus one to j.",
    remember:
      "Trap each split between its two neighbours in the table.",
    checks: [
      {
        prompt: "What does the optimisation reduce?",
        options: [
          "The inner loop over splits",
          "The number of intervals",
          "The memory used",
        ],
        answerIndex: 0,
        hint: "The table itself is unchanged.",
        explanations: [
          "Correct. Cubic becomes quadratic.",
          "Every interval is still computed.",
          "Memory is identical.",
        ],
      },
      {
        prompt: "What condition must the cost function satisfy?",
        options: [
          "The quadrangle inequality",
          "Convexity in one argument",
          "Non-negativity",
        ],
        answerIndex: 0,
        hint: "It is what forces the split bound to hold.",
        explanations: [
          "Correct, and it must be checked, not assumed.",
          "Convexity alone is not enough.",
          "Non-negative costs can still violate it.",
        ],
      },
      {
        prompt: "The condition is violated but the bound is applied anyway. What happens?",
        options: [
          "Some inputs give wrong answers",
          "It runs slower",
          "It raises an error",
        ],
        answerIndex: 0,
        hint: "The optimum may lie outside the bound.",
        explanations: [
          "Correct, and the failure is silent.",
          "It still runs at the optimised speed.",
          "Nothing detects it automatically.",
        ],
      },
    ],
  },
  {
    lessonId: "py.ac.m12_4.l4",
    atomId: "py.atom.algo.lagrangian-relaxation",
    conceptId: "py.algo.lagrangian-relaxation",
    title: "Lagrangian relaxation",
    requires: ["py.algo.knuth-optimization"],
    vocabulary: [
      ["hard constraint", "a requirement to use exactly some number of items"],
      ["penalty", "a per-item charge that discourages using too many"],
      ["search on the penalty", "adjusting the charge until the resulting count is the one required"],
    ],
    opening:
      "A dynamic program that must use exactly k items needs k as a state, which multiplies the table by k. Charging for each item instead removes that dimension entirely.",
    outcome:
      "You will replace an exact count with a penalty, search over the penalty, and see which counts are reachable.",
    why:
      "Dropping a whole state dimension is often the difference between a table that fits and one that does not.",
    mentalModel:
      "Picture a dial. Turning the penalty up makes items less attractive and the chosen count falls. You search the dial for the setting that gives the count you were asked for.",
    firstTitle: "Charge instead of counting",
    firstIntro:
      "Solve the unconstrained problem with each chosen item charged a penalty, then add the penalty back to recover the true value.",
    firstCode: `def best_with_penalty(values, penalty):
    take, skip = float("-inf"), 0.0
    taken, skipped = 0, 0
    for v in values:
        next_take, next_taken = skip + v - penalty, skipped + 1
        if take > skip:
            next_skip, next_skipped = take, taken
        else:
            next_skip, next_skipped = skip, skipped
        take, taken = next_take, next_taken
        skip, skipped = next_skip, next_skipped
    if take > skip:
        return round(take + penalty * taken, 2), taken
    return round(skip + penalty * skipped, 2), skipped

values = [5, 1, 9, 2, 8, 3, 7]
for penalty in (0, 2, 5, 7, 9):
    print(penalty, best_with_penalty(values, penalty))`,
    firstTrace:
      "Zero and two both choose four items for twenty-nine. Five chooses three for twenty-four, seven chooses two for seventeen, and nine chooses none.",
    secondTitle: "Which counts are reachable",
    secondIntro:
      "The count is a step function of the penalty. Sweeping the dial shows which counts appear at all, and a count that never appears cannot be obtained this way.",
    secondCode: `reachable = {}
penalty = 0.0
while penalty <= 10.0:
    _, count = best_with_penalty(values, penalty)
    reachable.setdefault(count, penalty)
    penalty += 0.5

print(sorted(reachable))
print({count: reachable[count] for count in sorted(reachable)})`,
    secondTrace:
      "Counts zero through four all appear, each at its own threshold. When a count is skipped entirely, the relaxation cannot produce it and the method does not apply.",
    mistake:
      "Assuming every count is reachable. The value as a function of count must be concave for the search to hit each one, and when it is not, some counts are skipped no matter how finely you search.",
    checkpoint:
      "What does the penalty replace?",
    checkpointAnswer:
      "The count dimension of the table. Instead of tracking how many items were used, each one is simply charged.",
    remember:
      "Charge per item, search the charge, check the count is reachable.",
    checks: [
      {
        prompt: "What does the relaxation remove from the table?",
        options: [
          "The state dimension tracking the item count",
          "The value dimension",
          "The transition loop",
        ],
        answerIndex: 0,
        hint: "That is the dimension the constraint forced.",
        explanations: [
          "Correct. The table shrinks by a factor of k.",
          "Values are still computed.",
          "Transitions are unchanged.",
        ],
      },
      {
        prompt: "How is the true value recovered after solving with a penalty?",
        options: [
          "Add the penalty back for each chosen item",
          "Divide by the penalty",
          "Nothing is needed",
        ],
        answerIndex: 0,
        hint: "The penalty was subtracted per item.",
        explanations: [
          "Correct. That undoes the charge exactly.",
          "The charge was subtracted, not scaled.",
          "The reported value would be too low.",
        ],
      },
      {
        prompt: "A required count never appears at any penalty. What follows?",
        options: [
          "The relaxation cannot produce it and another method is needed",
          "Search more finely",
          "Use a negative penalty",
        ],
        answerIndex: 0,
        hint: "The count is a step function with gaps.",
        explanations: [
          "Correct. Concavity is what guarantees reachability.",
          "A finer search does not fill a genuine gap.",
          "A negative penalty encourages more items, not a skipped count.",
        ],
      },
    ],
  },
  {
    lessonId: "py.ac.m12_4.l5",
    atomId: "py.atom.algo.sos-dp",
    conceptId: "py.algo.sos-dp",
    title: "SOS and broken-profile DP",
    requires: ["py.algo.lagrangian-relaxation"],
    vocabulary: [
      ["submask", "a mask whose set bits are a subset of another mask's"],
      ["sum over subsets", "aggregating a value over every submask of every mask"],
      ["broken profile", "a state describing a partially completed boundary rather than a whole row"],
    ],
    opening:
      "Aggregating over every submask of every mask looks like three to the bit count. One pass per bit does it in bits times two to the bits.",
    outcome:
      "You will transform an array into its subset sums one bit at a time, and confirm it against direct enumeration.",
    why:
      "Subset aggregation appears in counting, covering and inclusion-exclusion problems, and the direct form is unusable past about fifteen bits.",
    mentalModel:
      "Picture the transform as folding one dimension of a hypercube at a time. After all the folds, each corner holds the sum of everything beneath it.",
    firstTitle: "One bit at a time",
    firstIntro:
      "For each bit in turn, every mask with that bit set absorbs the value of the same mask without it. The order of the bits does not matter.",
    firstCode: `def subset_sums(values, bits):
    size = 1 << bits
    out = list(values)
    for bit in range(bits):
        for mask in range(size):
            if mask >> bit & 1:
                out[mask] += out[mask ^ (1 << bit)]
    return out

def direct(values, bits):
    size = 1 << bits
    return [sum(values[sub] for sub in range(size) if sub & mask == sub)
            for mask in range(size)]

values = [1, 2, 3, 4, 5, 6, 7, 8]
print(subset_sums(values, 3))
print(direct(values, 3))`,
    firstTrace:
      "One, three, four, ten, six, fourteen, sixteen, thirty-six from both. The last entry is the sum of everything, because the full mask contains every submask.",
    secondTitle: "Why it matters at scale",
    secondIntro:
      "The direct form visits every submask of every mask, which is three to the bit count. The transform visits each mask once per bit.",
    secondCode: `for bits in (10, 20, 24):
    print(bits, "direct", 3 ** bits, "transform", bits * (1 << bits))`,
    secondTrace:
      "At twenty-four bits the direct form needs two hundred eighty-two billion operations against four hundred million. That is the whole reason the transform exists.",
    mistake:
      "Iterating the mask loop outside the bit loop. The transform depends on completing one bit across every mask before starting the next, and swapping the loops double-counts.",
    checkpoint:
      "What does the entry at the full mask hold after the transform?",
    checkpointAnswer:
      "The sum of every element, because every mask is a submask of the full mask.",
    remember:
      "Bit loop outside, mask loop inside, absorb from the mask without the bit.",
    checks: [
      {
        prompt: "What is the cost of the transform?",
        options: [
          "Bits times two to the bits",
          "Three to the bits",
          "Two to the bits",
        ],
        answerIndex: 0,
        hint: "One pass over all masks per bit.",
        explanations: [
          "Correct. That is the improvement over direct enumeration.",
          "That is the direct form.",
          "A single pass is not enough.",
        ],
      },
      {
        prompt: "Which loop must be outermost?",
        options: ["The bit loop", "The mask loop", "Either order works"],
        answerIndex: 0,
        hint: "Each bit must complete across all masks.",
        explanations: [
          "Correct. Swapping them double-counts.",
          "That breaks the transform.",
          "The order is not interchangeable.",
        ],
      },
      {
        prompt: "What does a broken-profile state describe?",
        options: [
          "A partially completed boundary rather than a whole row",
          "A corrupted state",
          "A state with missing transitions",
        ],
        answerIndex: 0,
        hint: "It advances one cell at a time.",
        explanations: [
          "Correct. It keeps the state space far smaller.",
          "The name refers to the shape of the frontier.",
          "Transitions are complete.",
        ],
      },
    ],
  },
];

export const ALGO_DP_OPTIMIZATION_ATOMS = ALGO_DP_OPTIMIZATION_SPECS.map(guidedMasteryAtom);
export const ALGO_DP_OPTIMIZATION_CONCEPTS = ALGO_DP_OPTIMIZATION_SPECS.map(guidedMasteryConcept);
export const ALGO_DP_OPTIMIZATION_LESSON_CONTENT = guidedLessonContent(ALGO_DP_OPTIMIZATION_SPECS);

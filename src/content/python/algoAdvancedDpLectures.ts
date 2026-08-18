import type { LectureQuestion } from "../../types";
import {
  guidedLessonContent,
  guidedMasteryAtom,
  guidedMasteryConcept,
  type GuidedMasterySpec,
} from "./guidedMastery";

const q = (
  question: string,
  choices: [string, string, string],
  answer: 0 | 1 | 2,
  explanation: string,
  why: [string, string, string],
): LectureQuestion => ({ question, choices, answer, explanation, why });

const ALGO_ADVANCED_DP_SPECS: GuidedMasterySpec[] = [
  {
    lessonId: "py.ac.m6_7.l1",
    atomId: "py.atom.algo.interval-dp",
    conceptId: "py.algo.interval-dp",
    title: "Interval DP, where the state is a range",
    requires: ["py.algo.string-dp"],
    vocabulary: [
      ["interval state", "a state naming a contiguous range of the input"],
      ["split point", "the position inside a range where a transition divides it"],
      ["length-first order", "filling short ranges before the longer ones that read them"],
      ["last-operation framing", "asking which step happens last rather than first"],
    ],
    opening: "Some problems refuse to reduce to a single index because the answer depends on a whole range being handled together. The state becomes a pair of endpoints, and the transition is a choice of where inside that range to split.",
    outcome: "You will fill an interval table in length-first order, and reframe a problem around its last operation rather than its first.",
    why: "Matrix-chain multiplication and burst balloons are the two standard interval questions, and the reframing that makes the second one work is the hardest single idea in this family.",
    mentalModel: "Picture assembling a chain of parts. Whatever you do last splits the chain into a left piece and a right piece, each of which was already assembled on its own. Asking which step is last is what makes the two pieces independent.",
    firstTitle: "Matrix chains: choose where to split",
    firstIntro: "Every parenthesization corresponds to one final multiplication, which splits the chain in two.",
    firstCode: `def chain_cost(dims):
    n = len(dims) - 1
    best = [[0] * n for _ in range(n)]
    for length in range(2, n + 1):
        for i in range(n - length + 1):
            j = i + length - 1
            best[i][j] = min(
                best[i][k] + best[k + 1][j] + dims[i] * dims[k + 1] * dims[j + 1]
                for k in range(i, j))
    return best[0][n - 1]

print(chain_cost([10, 30, 5, 60]))
print(chain_cost([40, 20, 30, 10, 30]))
print(chain_cost([5, 10]))`,
    firstTrace: "Ranges are filled shortest first, so every split reads two ranges that are already complete. The three-matrix chain costs four thousand five hundred, where the other grouping of the same three would spend twenty-seven thousand. A single matrix costs nothing, since there is nothing to multiply.",
    secondTitle: "Burst balloons: ask which one goes last",
    secondIntro: "Asking which balloon bursts first makes the two sides depend on each other, and asking which goes last does not.",
    secondCode: `def burst(values):
    padded = [1] + list(values) + [1]
    n = len(padded)
    best = [[0] * n for _ in range(n)]
    for length in range(2, n):
        for left in range(n - length):
            right = left + length
            best[left][right] = max(
                best[left][k] + best[k][right]
                + padded[left] * padded[k] * padded[right]
                for k in range(left + 1, right))
    return best[0][n - 1]

print(burst([3, 1, 5, 8]))
print(burst([1, 5]))`,
    secondTrace: "If a balloon is the last one burst inside a range, its neighbours at that moment are the range's own boundaries, which never change. That makes the left and right sub-ranges genuinely independent. The classic list answers one hundred and sixty-seven, and the padding of ones removes every edge case at the two ends.",
    mistake: "Do not fill an interval table with the usual left-to-right double loop. A range depends on strictly shorter ranges, so iterating by length is what guarantees the dependencies are ready, and index order alone will read cells that are still zero.",
    checkpoint: "Why does asking which balloon bursts first fail to give a valid recurrence?",
    checkpointAnswer: "Because after the first burst the two remaining sides become adjacent, so a later burst on the left can have a neighbour on the right. The sides are not independent, and the state cannot describe the situation. Fixing the last burst keeps the range boundaries as its neighbours, which restores independence.",
    remember: "The state is a range and the transition is a split point. Fill by increasing length, and frame the choice around the last operation when the first one couples the two sides.",
    checks: [
      q("What is the state in an interval dynamic program?", ["A pair of endpoints naming a contiguous range", "A single index", "The set of elements used so far"], 0, "The range is what the transition splits.", ["Correct. Transitions choose a split inside it.", "One index cannot describe a range.", "Membership sets belong to bitmask problems."]),
      q("Why must interval tables be filled by increasing length?", ["A range depends on strictly shorter ranges", "It is faster", "Longer ranges are more important"], 0, "Dependency order is the requirement.", ["Correct. Index order alone reads unfinished cells.", "The work is identical either way.", "Importance is not what orders a table."]),
      q("Why does burst balloons fix the last burst rather than the first?", ["Only then are the two sides independent", "It is easier to code", "The first burst is ambiguous"], 0, "After a first burst the two sides become adjacent.", ["Correct. The range boundaries stay as neighbours.", "The two framings are equally easy to write.", "Both are well defined; only one composes."]),
    ],
  },
  {
    lessonId: "py.ac.m6_7.l2",
    atomId: "py.atom.algo.bitmask-dp",
    conceptId: "py.algo.bitmask-dp",
    title: "Bitmask DP, where the state is a subset",
    requires: ["py.algo.interval-dp"],
    vocabulary: [
      ["bitmask", "an integer whose bits record which elements of a small set are chosen"],
      ["subset state", "a state naming which elements have already been handled"],
      ["submask", "a mask whose set bits are a subset of another mask's"],
      ["exponential state space", "a state count that doubles with each additional element"],
    ],
    opening: "When the future depends on exactly which elements you have used rather than how many, the state has to be a set. Packing that set into the bits of an integer is what makes it usable, and it caps the technique at roughly twenty elements.",
    outcome: "You will encode a subset as an integer, iterate its members and its submasks, and solve an assignment problem with a subset state.",
    why: "Traveling salesman and assignment are the standard hard-DP questions, and the bit tricks that make them tractable also appear in constraint problems throughout competitive programming.",
    mentalModel: "Picture a row of switches, one per element, where the whole configuration is a single number. Turning a switch on is adding a power of two, and asking whether it is on is one masked comparison.",
    firstTitle: "The bit operations you actually need",
    firstIntro: "Four operations cover almost every bitmask problem you will meet.",
    firstCode: `mask = 0b1011

print("members:", [i for i in range(4) if mask >> i & 1])
print("count:", bin(mask).count("1"))
print("add 2:", bin(mask | 1 << 2))
print("remove 0:", bin(mask & ~(1 << 0)))
print("full set of 4:", bin((1 << 4) - 1))

submasks = []
sub = mask
while sub:
    submasks.append(bin(sub))
    sub = (sub - 1) & mask
print("submasks:", submasks)`,
    firstTrace: "Testing a bit, counting bits, setting one and clearing one are the four primitives. The submask loop is the one worth memorizing, since subtracting one and masking walks every subset of a mask in decreasing order. It stops naturally when the mask reaches zero.",
    secondTitle: "Assignment: one bit per task already done",
    secondIntro: "The number of bits set tells you which worker is being assigned, so it needs no separate dimension.",
    secondCode: `def assign(cost):
    n = len(cost)
    full = (1 << n) - 1
    best = [float("inf")] * (1 << n)
    best[0] = 0
    for mask in range(full + 1):
        if best[mask] == float("inf"):
            continue
        worker = bin(mask).count("1")
        if worker == n:
            continue
        for task in range(n):
            if mask >> task & 1:
                continue
            nxt = mask | 1 << task
            total = best[mask] + cost[worker][task]
            if total < best[nxt]:
                best[nxt] = total
    return best[full]

print(assign([[9, 2, 7], [6, 4, 3], [5, 8, 1]]))
print(assign([[5]]))`,
    secondTrace: "Each mask records which tasks are taken, and the count of set bits is exactly how many workers have been placed. That makes the worker index free rather than a second dimension. The cheapest assignment there costs nine, and the state space is two to the n rather than n factorial.",
    mistake: "Do not reach for a subset state when the element count is large. The table has two to the n entries, so twenty elements is about a million and thirty is a billion, and the technique simply stops being an option somewhere in between.",
    checkpoint: "Why does the assignment solution need no separate dimension for which worker is being placed?",
    checkpointAnswer: "Because the number of set bits in the mask is exactly the number of tasks already assigned, and workers are placed in order. The worker index is therefore a function of the mask rather than independent information, and adding it would multiply the state space for nothing.",
    remember: "A subset state is an integer of bits. Test, set, clear and count are the primitives, the submask loop walks every subset, and the whole technique is bounded by two to the element count.",
    checks: [
      q("When is a subset state the right choice?", ["When the future depends on which elements were used, not how many", "When the input is sorted", "When the input is large"], 0, "Identity of the used elements is what forces it.", ["Correct. A count alone would be a much smaller state.", "Sortedness does not decide the state.", "Large inputs rule the technique out entirely."]),
      q("What does subtracting one and masking accomplish?", ["It walks to the next smaller submask", "It clears the lowest set bit", "It counts the set bits"], 0, "That loop enumerates every subset of a mask.", ["Correct. It terminates when the mask reaches zero.", "That is a different, simpler trick.", "Counting needs its own operation."]),
      q("Roughly what element count does bitmask DP top out at?", ["About twenty", "About a hundred", "About a thousand"], 0, "The table has two to the n entries.", ["Correct. A million states is already substantial.", "That would need more states than atoms available.", "Far beyond any feasible table."]),
    ],
  },
  {
    lessonId: "py.ac.m6_7.l3",
    atomId: "py.atom.algo.digit-dp",
    conceptId: "py.algo.digit-dp",
    title: "Digit DP counts numbers without enumerating them",
    requires: ["py.algo.bitmask-dp"],
    vocabulary: [
      ["digit position", "how many digits of the number have been decided so far"],
      ["tight flag", "whether the prefix chosen so far equals the bound's prefix"],
      ["free position", "a position where any digit may be chosen because the bound is no longer binding"],
      ["leading zero flag", "a marker for a prefix that has not yet produced a significant digit"],
    ],
    opening: "Counting how many numbers up to a bound have some property looks like it needs to visit every number. It does not. Building the number one digit at a time turns a range of a billion into a table with a few dozen states.",
    outcome: "You will build a number digit by digit, carry the tight flag that tracks the bound, and count without enumerating.",
    why: "Range-counting questions appear in interviews and constantly in competitive programming, and the tight flag is a genuinely new kind of state that transfers to any constrained construction problem.",
    mentalModel: "Picture filling in a form one box at a time while holding a reference number beside it. As long as every box has matched the reference so far, your next choice is capped. The moment one box goes lower, the rest are unrestricted.",
    firstTitle: "The tight flag is the whole idea",
    firstIntro: "One boolean records whether the prefix built so far still matches the bound.",
    firstCode: `from functools import lru_cache

def count_with_digit(limit, wanted):
    digits = [int(ch) for ch in str(limit)]

    @lru_cache(maxsize=None)
    def build(position, tight, seen):
        if position == len(digits):
            return 1 if seen else 0
        cap = digits[position] if tight else 9
        total = 0
        for digit in range(cap + 1):
            total += build(position + 1,
                           tight and digit == cap,
                           seen or digit == wanted)
        return total

    return build(0, True, False)

print(count_with_digit(20, 1))
print(count_with_digit(100, 7))`,
    firstTrace: "The flag stays true only while every digit has matched the bound exactly, and once it drops it never returns. That is what lets the cache reuse work, since a free position behaves identically no matter which prefix reached it. Eleven of the twenty-one numbers up to twenty contain a one somewhere.",
    secondTitle: "Counting without a property is the sanity check",
    secondIntro: "Removing the property should return the bound itself, plus one for zero.",
    secondCode: `from functools import lru_cache

def count_all(limit):
    digits = [int(ch) for ch in str(limit)]

    @lru_cache(maxsize=None)
    def build(position, tight):
        if position == len(digits):
            return 1
        cap = digits[position] if tight else 9
        return sum(build(position + 1, tight and digit == cap)
                   for digit in range(cap + 1))

    return build(0, True)

for limit in (9, 20, 100, 12345):
    print(limit, count_all(limit), limit + 1)`,
    secondTrace: "Every bound returns exactly one more than itself, which is the count of the numbers from zero upward. Getting that identity to hold is the fastest way to confirm the tight flag is threaded correctly. Leading zeros are counted here as ordinary zeros, which is why a separate flag is needed whenever the property cares about digit length.",
    mistake: "Do not include the tight flag's prefix in the cache key. Caching on the actual digits chosen makes every path distinct and destroys all reuse, and the one boolean is the entire summary of that prefix the future needs.",
    checkpoint: "Once the tight flag becomes false, why can it never become true again?",
    checkpointAnswer: "Because it drops only when a digit is chosen strictly under the bound's digit at that position. The number being built is then already smaller than the bound whatever follows, so no later choice can restore the equality that the flag records.",
    remember: "Build the number digit by digit and carry one boolean saying whether the prefix still matches the bound. Free positions are interchangeable, which is exactly what makes the cache work.",
    checks: [
      q("What does the tight flag record?", ["Whether the prefix built so far equals the bound's prefix", "How many digits remain", "Whether the property has been satisfied"], 0, "It is what caps the next digit.", ["Correct. Once it drops, later digits are unrestricted.", "Position already carries that.", "That is a separate flag."]),
      q("Why is the digit prefix not part of the cache key?", ["Free positions behave identically regardless of the prefix", "It would use too much memory", "Prefixes are not hashable"], 0, "The boolean is the sufficient summary.", ["Correct. Caching on the prefix destroys all reuse.", "Memory is a symptom, not the reason.", "Tuples of digits hash fine."]),
      q("Counting with no property should return what for a bound of 100?", ["101, the numbers from zero upward", "100", "99"], 0, "Zero is included in the count.", ["Correct. That identity checks the tight flag threading.", "That would exclude either zero or the bound.", "That excludes both ends."]),
    ],
  },
  {
    lessonId: "py.ac.m6_7.l4",
    atomId: "py.atom.algo.tree-dp",
    conceptId: "py.algo.tree-dp",
    title: "DP on trees, with a state per node",
    requires: ["py.algo.digit-dp"],
    vocabulary: [
      ["subtree answer", "the best value for the subtree rooted at a node"],
      ["node state", "an extra dimension describing what the node itself does"],
      ["post-order combination", "combining children's answers after all of them are computed"],
      ["rerooting", "computing every node's answer as if it were the root"],
    ],
    opening: "Trees are the easiest structure to run dynamic programming on, because the subproblems are already laid out for you. Every subtree is independent of everything outside it, so a single traversal computes the whole table.",
    outcome: "You will combine children's answers in post-order, add a per-node state when the choices interact, and see what rerooting buys.",
    why: "Tree problems appear in interviews as house robber on a tree, independent sets and diameters, and they all use the same two-state pattern. Rerooting is the standard follow-up when every node needs an answer.",
    mentalModel: "Think of a company reporting upward. Each manager waits for every direct report to finish, combines what they send, and passes one summary to their own manager. Nothing needs to look sideways.",
    firstTitle: "Post-order: children first, then combine",
    firstIntro: "A node cannot answer until all of its children have.",
    firstCode: `tree = {1: [2, 3], 2: [4, 5], 3: [], 4: [], 5: [6], 6: []}
values = {1: 3, 2: 4, 3: 5, 4: 1, 5: 3, 6: 1}

def solve(node):
    take = values[node]
    skip = 0
    for child in tree[node]:
        child_take, child_skip = solve(child)
        take += child_skip
        skip += max(child_take, child_skip)
    return take, skip

take, skip = solve(1)
print("best independent total:", max(take, skip))
print("taking the root gives:", take)`,
    firstTrace: "Each node returns two numbers: the best total if it is taken and the best if it is not. Taking a node forces every child to be skipped, and skipping it lets each child choose freely. That pair is the node state, and one traversal fills the whole tree.",
    secondTitle: "A depth-first walk also gives the diameter",
    secondIntro: "The longest path through a node is the sum of the two deepest branches beneath it.",
    secondCode: `tree = {1: [2, 3], 2: [4, 5], 3: [], 4: [], 5: [6], 6: []}
best = 0

def depth(node):
    global best
    top_two = [0, 0]
    for child in tree[node]:
        reach = depth(child) + 1
        top_two.append(reach)
        top_two.sort(reverse=True)
        top_two.pop()
    best = max(best, top_two[0] + top_two[1])
    return top_two[0]

height = depth(1)
print("height:", height, "diameter:", best)`,
    secondTrace: "Each node keeps only the two deepest branches beneath it, since a path through the node uses at most two. The answer for the whole tree is the largest such sum seen anywhere, which one traversal collects. Keeping a running best outside the recursion is the standard way to gather an answer that is not the return value.",
    mistake: "Do not return only the best answer from each subtree when the parent's choice constrains the child. The parent needs both the take and the skip values, and collapsing them to a single maximum discards exactly the information the constraint depends on.",
    checkpoint: "Every node needs the answer for the whole tree as seen from itself. What does one traversal give you?",
    checkpointAnswer: "Only the answers for each subtree, computed as seen from the fixed root. Rerooting adds a second traversal that pushes information downward, combining each node's parent-side answer with its subtree answer, which produces every node's total in linear time overall.",
    remember: "Subtrees are independent, so post-order traversal fills the table. Return a state per node when the parent's choice constrains the child, and reroot with a second pass when every node needs an answer.",
    checks: [
      q("Why is post-order the natural traversal for tree DP?", ["A node's answer depends on all of its children", "It uses less memory", "It visits fewer nodes"], 0, "Children must be complete before the parent combines.", ["Correct. Every dependency is resolved by then.", "Memory is the same as any traversal.", "All traversals visit every node."]),
      q("Why does each node return two values in the independent-set problem?", ["The parent's choice depends on whether the child was taken", "Trees have two children at most", "One value is the count and one the total"], 0, "Collapsing to a maximum loses the constraint.", ["Correct. The parent needs both cases separately.", "Nodes may have any number of children.", "Both values are totals."]),
      q("What does rerooting add?", ["Every node's answer, not just the fixed root's", "A faster single traversal", "Support for cycles"], 0, "A second pass pushes parent-side information down.", ["Correct. The total cost stays linear.", "It adds a pass rather than removing one.", "Cycles make it a graph, not a tree."]),
    ],
  },
  {
    lessonId: "py.ac.m6_7.l5",
    atomId: "py.atom.algo.dp-optimizations",
    conceptId: "py.algo.dp-optimizations",
    title: "Making a correct recurrence fast enough",
    requires: ["py.algo.tree-dp"],
    vocabulary: [
      ["window minimum", "the smallest value inside a sliding range of the table"],
      ["monotonic deque", "a double-ended queue kept in sorted order so its front is the answer"],
      ["dominated candidate", "an option that some other option beats under every future query"],
      ["amortized cost", "an average cost per operation across a whole run"],
    ],
    opening: "Sometimes the recurrence is right and the transition is the problem. Scanning a window of previous states at every step turns a linear table into a quadratic one, and the fix is to stop rescanning what cannot possibly win.",
    outcome: "You will replace a windowed scan with a monotonic deque, and recognize when a candidate can be discarded permanently.",
    why: "This is the standard follow-up when an interviewer accepts your recurrence and asks for a faster version. The deque technique alone covers a large share of the problems where it is asked.",
    mentalModel: "Picture a queue of job applicants where a younger candidate with a better score makes every older, weaker one unhirable forever. Removing them on arrival keeps the queue short and the best always at the front.",
    firstTitle: "The scan, then the deque",
    firstIntro: "Both compute the same table, and only the cost of finding each window minimum differs.",
    firstCode: `from collections import deque

def jump_scan(costs, reach):
    best = [0] * len(costs)
    for i in range(1, len(costs)):
        window = range(max(0, i - reach), i)
        best[i] = costs[i] + min(best[j] for j in window)
    return best[-1]

def jump_deque(costs, reach):
    best = [0] * len(costs)
    window = deque([0])
    for i in range(1, len(costs)):
        while window and window[0] < i - reach:
            window.popleft()
        best[i] = costs[i] + best[window[0]]
        while window and best[window[-1]] >= best[i]:
            window.pop()
        window.append(i)
    return best[-1]

costs = [0, 3, 2, 6, 1, 4, 2, 5, 1]
print(jump_scan(costs, 3), jump_deque(costs, 3))`,
    firstTrace: "The two agree, and the deque version never rescans a window. Indices leave the front once they fall outside the reach, and they leave the back the moment a newer index with a smaller value arrives. Every index is pushed once and popped once, so the whole run is linear.",
    secondTitle: "Domination is the idea underneath",
    secondIntro: "A candidate can be discarded forever once another one beats it under every query still to come.",
    secondCode: `def survivors(values):
    kept = []
    for index, value in enumerate(values):
        while kept and values[kept[-1]] >= value:
            kept.pop()
        kept.append(index)
    return [(i, values[i]) for i in kept]

print(survivors([5, 3, 8, 6, 2, 7]))
print("each kept entry is smaller than everything after it that survived")`,
    secondTrace: "An older index with a larger value can never win a minimum query that the newer, smaller one is also eligible for. Discarding it on arrival is what keeps the structure small. The same argument, applied to lines rather than values, is what the convex hull trick uses.",
    mistake: "Do not add a deque before the recurrence is correct. The optimization changes only how the window minimum is found, so a wrong transition stays wrong and becomes considerably harder to debug once the scan is gone.",
    checkpoint: "Why is the deque version linear when every step still runs two inner loops?",
    checkpointAnswer: "Because each index is pushed exactly once and popped at most once across the entire run. The inner loops can be long on one particular step, but their total work over all steps is bounded by the number of indices, which is the standard amortized argument.",
    remember: "Fix the recurrence first, then attack the transition. A monotonic deque keeps only candidates that can still win, and every index enters and leaves it once.",
    checks: [
      q("What does a monotonic deque remove from the back?", ["Candidates a newer, better one dominates", "The oldest candidate", "Every candidate outside the window"], 0, "Domination is permanent.", ["Correct. They can never win a later query.", "That is the front-removal rule.", "Window expiry is also handled at the front."]),
      q("Why is the deque version linear despite its inner loops?", ["Each index is pushed and popped at most once overall", "The inner loops run at most twice", "The window is constant in size"], 0, "The argument is amortized, not per step.", ["Correct. Total work is bounded by the index count.", "A single step can pop many entries.", "The window size does not bound the pops."]),
      q("What should be true before adding a deque optimization?", ["The recurrence is already correct", "The input is sorted", "The table fits in memory"], 0, "The optimization only changes how the window minimum is found.", ["Correct. A wrong transition stays wrong and gets harder to debug.", "Sortedness is not required.", "Memory is unchanged by the technique."]),
    ],
  },
];

export const ALGO_ADVANCED_DP_ATOMS = ALGO_ADVANCED_DP_SPECS.map(guidedMasteryAtom);
export const ALGO_ADVANCED_DP_CONCEPTS = ALGO_ADVANCED_DP_SPECS.map(guidedMasteryConcept);
export const ALGO_ADVANCED_DP_LESSON_CONTENT = guidedLessonContent(ALGO_ADVANCED_DP_SPECS);

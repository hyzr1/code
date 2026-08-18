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

const ALGO_DYNAMIC_PROGRAMMING_SPECS: GuidedMasterySpec[] = [
  {
    lessonId: "py.ac.m6_4.l1",
    atomId: "py.atom.algo.dp-overlap",
    conceptId: "py.algo.dp-overlap",
    title: "Overlapping subproblems and optimal substructure",
    requires: ["py.algo.recursion-trees", "py.algo.recurrences"],
    vocabulary: [
      ["subproblem", "a smaller instance of the same question the algorithm asks"],
      ["overlapping subproblems", "the same smaller instance being reached along many different paths"],
      ["optimal substructure", "the best answer for the whole being assembled from best answers for parts"],
      ["recomputation", "solving an identical subproblem again instead of reusing a stored result"],
    ],
    opening: "Dynamic programming is not a trick and it is not a data structure. It is one observation applied carefully: if a recursion keeps asking the same question, answer that question once and write the answer down.",
    outcome: "You will test a recursion for repeated subproblems, and check whether the best whole answer can genuinely be built from best partial answers.",
    why: "Two conditions decide whether dynamic programming applies at all. Checking them takes seconds and saves you from caching a recursion that has nothing to reuse, or from caching one whose parts do not compose.",
    mentalModel: "Picture a family tree that keeps producing the same few ancestors over and over. Recursion walks every branch to the bottom. Dynamic programming notices the repeats and keeps a note beside each name it has already resolved.",
    firstTitle: "Measure the repetition before assuming it exists",
    firstIntro: "A counter beside the recursive call turns a vague suspicion about waste into a number you can read.",
    firstCode: `calls = {}

def fib(n):
    calls[n] = calls.get(n, 0) + 1
    if n < 2:
        return n
    return fib(n - 1) + fib(n - 2)

print("fib(20) =", fib(20))
print("distinct subproblems:", len(calls))
print("total calls:", sum(calls.values()))
print("times fib(5) was asked:", calls[5])`,
    firstTrace: "Twenty-one distinct questions get asked roughly twenty-two thousand times between them. The recursion is exponential while the set of things it needs to know stays tiny. That gap between distinct states and total calls is exactly the waste a cache removes.",
    secondTitle: "Optimal substructure is a separate condition, and it can fail",
    secondIntro: "Repetition alone is not enough. The best answer for the whole must be reachable from the best answers stored for the parts.",
    secondCode: `def best_product(values):
    best = values[0]
    running = values[0]
    for value in values[1:]:
        running = max(value, running * value)
        best = max(best, running)
    return best

print("keeping only the maximum:", best_product([-2, 3, -4]))
print("true best product:", -2 * 3 * -4)`,
    secondTrace: "The routine keeps the best product ending at each position and still reports three when the answer is twenty-four. Multiplying by a negative number turns the worst running product into the best one, so the optimal whole is built on a part that was never worth storing. Carrying both the maximum and the minimum repairs it.",
    mistake: "Do not reach for a cache the moment a function calls itself. Merge sort recurses just as hard as this and never asks the same question twice, so memoizing it adds memory and buys nothing at all in return.",
    checkpoint: "A recursion has heavy repetition, and caching it still produces the wrong answer. Which of the two conditions has failed?",
    checkpointAnswer: "Optimal substructure has failed. The subproblems still overlap, so the cache fires constantly, but the quantity being stored is not the one the larger answer actually needs. The repair is to store a different or richer value per state, rather than a bigger cache.",
    remember: "Two conditions, checked separately. Overlapping subproblems make caching worthwhile, and optimal substructure makes the cached values sufficient. A recursion can have one without the other.",
    checks: [
      q("What makes plain recursion on Fibonacci exponential?", ["The same subproblems are recomputed along many branches", "Addition of large integers is slow", "Python recursion has high call overhead"], 0, "The distinct state count is tiny; the call count is not.", ["Correct. Twenty-one distinct values cost tens of thousands of calls.", "The arithmetic is a constant factor, not the growth.", "Overhead scales the cost but does not create the exponential."]),
      q("Merge sort recurses heavily. Why does memoizing it not help?", ["Its subproblems never repeat", "Its subproblems are too large to store", "It has no base case to cache"], 0, "Each range is visited exactly once.", ["Correct. Without overlap there is nothing to reuse.", "Size is not the obstacle; repetition is what is missing.", "It has a base case, and caching it changes nothing."]),
      q("Tracking only the largest running product fails on negatives. Which condition broke?", ["Optimal substructure", "Overlapping subproblems", "The base case"], 0, "The stored value was not the one the whole answer needed.", ["Correct. A negative factor makes the worst part become the best whole.", "The subproblems still overlap perfectly well.", "The base case is correct in that routine."]),
    ],
  },
  {
    lessonId: "py.ac.m6_4.l2",
    atomId: "py.atom.algo.dp-memo-table",
    conceptId: "py.algo.dp-memo-table",
    title: "Memoization and tabulation reach the same states",
    requires: ["py.algo.dp-overlap", "py.algo.hash-maps-sets-guided"],
    vocabulary: [
      ["memoization", "caching results inside a recursion so each state is computed once"],
      ["tabulation", "filling a table of states in an order where every dependency is ready"],
      ["dependency order", "an ordering in which a state is computed only after the states it reads"],
      ["rolling variables", "keeping only the few recent table entries a transition actually reads"],
    ],
    opening: "There are two ways to make sure each state is computed once. Recursion with a cache does it lazily, from the top. A loop over a table does it eagerly, from the bottom. They visit the same states and get the same answer.",
    outcome: "You will convert a recursion into a memoized version, then into a table, then reduce that table to a couple of variables.",
    why: "Interviewers frequently ask for both forms, and production code often needs the iterative one to avoid recursion limits. Being fluent in the translation between them costs nothing once you see that the state set never changes.",
    mentalModel: "Think of a crossword. Memoization is answering whichever clue you happen to be looking at and pencilling it in. Tabulation is working through the grid in an order where every crossing letter is already filled.",
    firstTitle: "Top-down: the recursion is unchanged apart from the cache",
    firstIntro: "The recursive shape stays exactly as written; two extra lines make sure no state is entered twice.",
    firstCode: `def fib(n, memo=None):
    if memo is None:
        memo = {}
    if n < 2:
        return n
    if n in memo:
        return memo[n]
    memo[n] = fib(n - 1, memo) + fib(n - 2, memo)
    return memo[n]

print(fib(40))
print(fib(90))`,
    firstTrace: "Every value is computed on its first visit and read from the dictionary on every visit after that. The call count drops from exponential to one call per distinct state. Term ninety now returns instantly instead of never finishing.",
    secondTitle: "Bottom-up: choose an order, then shrink what you keep",
    secondIntro: "Once the dependency order is written as a loop, most of the table turns out to be dead weight.",
    secondCode: `def fib_table(n):
    if n < 2:
        return n
    table = [0] * (n + 1)
    table[1] = 1
    for index in range(2, n + 1):
        table[index] = table[index - 1] + table[index - 2]
    return table[n]

def fib_rolling(n):
    previous, current = 0, 1
    for _ in range(n):
        previous, current = current, previous + current
    return previous

print(fib_table(90), fib_rolling(90))`,
    secondTrace: "The table version fills states in increasing order, so each entry finds its two dependencies already resolved. The transition never reaches further back than two positions, which means ninety-one stored values can collapse into two names. Linear memory becomes constant memory without changing a single answer.",
    mistake: "Do not write the cache as a default argument, as in `def fib(n, memo={})`. That dictionary is created once when the function is defined and then shared by every later call, so results from one input silently leak into the next and stale answers survive across unrelated queries.",
    checkpoint: "A tabulated solution reads `table[index - 3]` and nothing further back. How much memory does it actually need?",
    checkpointAnswer: "Four slots, or a small rotating buffer of that size. The table only ever needs the entries a transition can still reach, so the storage is set by the longest backward reach and not by the length of the input.",
    remember: "Memoization is lazy and top-down; tabulation is eager and bottom-up. Both compute each state once, and a table can shrink to the number of entries the transition still reads.",
    checks: [
      q("What is the main risk of the top-down form on large inputs?", ["Hitting the recursion depth limit", "Computing states twice", "Needing more memory than a table"], 0, "Each nested call consumes a stack frame.", ["Correct. Deep chains overflow the interpreter stack before the cache helps.", "The cache is precisely what prevents recomputation.", "Both forms store one entry per reachable state."]),
      q("What must a tabulated loop guarantee about its ordering?", ["Every state is filled after the states it reads", "States are filled in increasing index order", "The table is filled in a single pass"], 0, "Dependency order is the requirement; index order is one way to satisfy it.", ["Correct. Any order that respects dependencies works.", "Decreasing or diagonal orders are common and valid.", "Multiple passes are fine as long as dependencies hold."]),
      q("A transition reads only the two entries before the current one. What follows?", ["The table can be replaced by two rolling variables", "The problem is not suitable for tabulation", "The table must still be kept in full"], 0, "Storage is set by the backward reach.", ["Correct. Constant memory suffices.", "Short reach makes tabulation easier, not harder.", "The full table is only needed if the answer must be reconstructed."]),
    ],
  },
  {
    lessonId: "py.ac.m6_4.l3",
    atomId: "py.atom.algo.dp-state-design",
    conceptId: "py.algo.dp-state-design",
    title: "The state carries exactly what the future needs",
    requires: ["py.algo.dp-memo-table"],
    vocabulary: [
      ["state", "the set of values that fully determine the rest of the problem"],
      ["transition", "the legal moves out of a state, each leading to a smaller state"],
      ["state space", "the number of distinct states the recursion can reach"],
      ["sufficient statistic", "the smallest summary of the past that the future still depends on"],
    ],
    opening: "Designing a dynamic program is one question asked honestly. Standing at this point in the input, what do I still need to know about everything that came before? The answer to that question is the state.",
    outcome: "You will pick a state by asking what the future depends on, add a dimension only when the answer demands it, and push constraints into transitions where you can.",
    why: "Total cost is the state space multiplied by the work per transition. Every needless value you fold into the state multiplies that count, and every needed one you leave out produces a fast solution that is wrong.",
    mentalModel: "Imagine handing the rest of the problem to a colleague who cannot see any of your history. The note you must write for them to finish correctly is the state, and anything you leave off that note is information the algorithm no longer has.",
    firstTitle: "Add a dimension when the future genuinely depends on it",
    firstIntro: "Trading a stock is not decided by position alone, because the legal moves differ depending on whether you already hold one.",
    firstCode: `from functools import lru_cache

def max_profit(prices):
    @lru_cache(maxsize=None)
    def best(index, holding):
        if index == len(prices):
            return 0
        skip = best(index + 1, holding)
        if holding:
            return max(skip, prices[index] + best(index + 1, False))
        return max(skip, -prices[index] + best(index + 1, True))

    return best(0, False)

print(max_profit((7, 1, 5, 3, 6, 4)))
print(max_profit((7, 6, 4, 3, 1)))`,
    firstTrace: "Position alone cannot answer whether selling is allowed, so the holding flag joins it in the state. The state space doubles from n to two n, which is a small price for correctness. Descending prices produce zero because every transition that buys is worse than skipping.",
    secondTitle: "Push a constraint into the transition and the state stays small",
    secondIntro: "A rule about which choices are legal does not always need its own dimension; sometimes the move itself can encode it.",
    secondCode: `from functools import lru_cache

def best_take(values):
    @lru_cache(maxsize=None)
    def solve(index):
        if index >= len(values):
            return 0
        take = values[index] + solve(index + 2)
        return max(solve(index + 1), take)

    return solve(0)

print(best_take((2, 7, 9, 3, 1)))
print(best_take((5,)))`,
    secondTrace: "The rule against taking neighbours never appears in the state at all. Jumping two positions after a take makes the illegal choice unreachable, so a single index describes everything the rest of the problem needs. The state space stays linear and the answer for that list is twelve.",
    mistake: "Do not fold the running total into the state. It makes almost every state distinct, so the cache stops matching anything and the solution quietly degrades to the exponential recursion you started from, now with the memory cost of a cache on top.",
    checkpoint: "Two candidate states for the same problem give the same answers, but one has an extra dimension. What does that dimension cost?",
    checkpointAnswer: "It multiplies the state space by the size of that dimension, and the running time along with it. If the future never branches on the value, it also splits identical situations into separate cache entries, which reduces how often the cache is reused.",
    remember: "Ask what the future still depends on, and store precisely that. Cost is the state space times the transition work, so extra dimensions are paid for on every state.",
    checks: [
      q("What is the test for whether a value belongs in the state?", ["The remaining decisions depend on it", "It changes as the algorithm runs", "It appears in the problem statement"], 0, "Only information the future branches on is required.", ["Correct. Anything the future ignores is dead weight in the state.", "Plenty of changing values are irrelevant to what remains.", "Inputs are constants the recursion can read directly."]),
      q("How does the running total behave if you add it to the state?", ["It makes states nearly unique and defeats the cache", "It reduces the number of transitions", "It is required for correctness"], 0, "Reuse depends on states repeating.", ["Correct. Distinct totals mean nothing is ever a cache hit.", "Transitions are unchanged by what the state stores.", "The total is an output, not something the future branches on."]),
      q("How is the total cost of a dynamic program estimated?", ["State space multiplied by work per transition", "Depth of the recursion", "Number of base cases"], 0, "Each state is entered once and does its transition work.", ["Correct. That product is the standard estimate.", "Depth bounds the stack, not the total work.", "Base cases are a constant part of the whole."]),
    ],
  },
  {
    lessonId: "py.ac.m6_4.l4",
    atomId: "py.atom.algo.dp-one-dimension",
    conceptId: "py.algo.dp-one-dimension",
    title: "One-dimensional dynamic programming, four ways",
    requires: ["py.algo.dp-state-design"],
    vocabulary: [
      ["linear state", "a state described by a single position in the input"],
      ["counting recurrence", "a transition that sums the ways to reach a state"],
      ["optimizing recurrence", "a transition that takes the best of the ways to reach a state"],
      ["guard", "a condition that rejects a transition the rules do not allow"],
    ],
    opening: "A surprising share of interview questions reduce to one index and a handful of moves. Once the state is a single position, the whole solution is a loop and a line that combines a few recent entries.",
    outcome: "You will write counting and optimizing recurrences over a linear state, and guard transitions that the rules forbid.",
    why: "Climbing stairs, house robber and decode ways are asked constantly, and they differ only in how the transition combines its inputs. Recognizing that saves you from learning four unrelated solutions.",
    mentalModel: "Think of walking along a row of tiles where each tile's number is computed from the two or three tiles behind it. Counting problems add those numbers together, optimizing problems take the largest, and forbidden steps simply contribute nothing.",
    firstTitle: "Counting and optimizing differ by one operator",
    firstIntro: "The same linear scan solves both families; only the combining step changes.",
    firstCode: `def climb(steps):
    one_back, two_back = 1, 1
    for _ in range(2, steps + 1):
        one_back, two_back = one_back + two_back, one_back
    return one_back

def rob(houses):
    take, skip = 0, 0
    for value in houses:
        take, skip = skip + value, max(skip, take)
    return max(take, skip)

print([climb(n) for n in range(1, 7)])
print(rob([2, 7, 9, 3, 1]), rob([]), rob([5]))`,
    firstTrace: "Counting stairs sums the two ways into each step, while robbing houses takes the better of the two. The state is one position in both, and both run in constant memory. The empty list returns zero because neither name ever leaves its starting value.",
    secondTitle: "A guard is how the rules enter the recurrence",
    secondIntro: "Decoding digits adds one wrinkle: some of the moves are illegal, and the transition has to check.",
    secondCode: `def decode_ways(digits):
    if not digits or digits[0] == "0":
        return 0
    two_back, one_back = 1, 1
    for index in range(1, len(digits)):
        current = 0
        if digits[index] != "0":
            current += one_back
        if 10 <= int(digits[index - 1:index + 1]) <= 26:
            current += two_back
        two_back, one_back = one_back, current
    return one_back

for text in ("12", "226", "06", "1201", "100"):
    print(text, decode_ways(text))`,
    secondTrace: "Two guards decide which of the two moves contribute. A zero cannot stand alone, and a pair only counts when it lands between ten and twenty-six. The string one-two-zero-one has exactly one valid reading, and one-zero-zero has none at all.",
    mistake: "Do not treat a forbidden move as contributing zero ways when it should invalidate the state entirely. A leading zero makes the whole string undecodable, and a transition guard alone will not catch that, so the entry condition has to reject it up front.",
    checkpoint: "Climbing stairs and house robber share a state and a shape. What single change turns one into the other?",
    checkpointAnswer: "The combining operator. Counting problems add the contributions from each legal predecessor, and optimizing problems take the maximum of them. The state, the transitions and the memory pattern are otherwise identical.",
    remember: "One index, a few moves back, and one operator. Sum for counting, maximum for optimizing, and guard any move the rules forbid.",
    checks: [
      q("What distinguishes a counting recurrence from an optimizing one?", ["Whether contributions are summed or maximized", "Whether the state is one-dimensional", "Whether recursion or a loop is used"], 0, "The state and transitions are often identical.", ["Correct. Only the combining operator changes.", "Both families appear with states of any dimension.", "Either form can be written top-down or bottom-up."]),
      q("Why does the decode problem reject a leading zero before the loop?", ["No valid decoding exists, so no transition should run", "The loop would raise an index error", "Zero is not a digit"], 0, "It is an entry condition, not a transition guard.", ["Correct. The whole string is invalid from the first character.", "The loop indexes safely; the answer would just be wrong.", "Zero is a digit, but it never stands alone as a letter."]),
      q("A transition reaches at most two positions back. What memory does the solution need?", ["A constant number of variables", "Memory proportional to the input", "Memory proportional to the answer"], 0, "Only the reachable entries must survive.", ["Correct. Two or three names are enough.", "The full table is only needed to reconstruct choices.", "The answer is a single number here."]),
    ],
  },
  {
    lessonId: "py.ac.m6_4.l5",
    atomId: "py.atom.algo.kadane",
    conceptId: "py.algo.kadane",
    title: "Kadane's algorithm and the ending-here trick",
    requires: ["py.algo.dp-one-dimension"],
    vocabulary: [
      ["ending here", "the best answer among segments that finish at the current position"],
      ["extend or restart", "the two-way choice of continuing a run or beginning a new one"],
      ["global best", "the best value seen across all positions so far"],
      ["reconstruction", "recovering the choices that produced an answer, not just its value"],
    ],
    opening: "Maximum subarray looks like it needs every start and every end considered. One reframing removes the whole search: instead of asking for the best segment anywhere, ask for the best segment ending at each position.",
    outcome: "You will derive Kadane's recurrence from the ending-here reframing, handle all-negative inputs, and recover the winning segment itself.",
    why: "The ending-here reframing is the single most transferable idea in one-dimensional dynamic programming. It solves maximum subarray, longest increasing runs, maximum product and a long tail of variants that all look different at first.",
    mentalModel: "Picture walking a line of stepping stones carrying a running score. At each stone you decide whether the score you brought is worth keeping or whether starting fresh from this stone would be better. The best score you ever held is the answer.",
    firstTitle: "Extend or restart, then remember the best",
    firstIntro: "The recurrence is one line, because a segment ending here either extends the one ending before it or begins here.",
    firstCode: `def max_subarray(values):
    best = values[0]
    running = values[0]
    for value in values[1:]:
        running = max(value, running + value)
        best = max(best, running)
    return best

print(max_subarray([-2, 1, -3, 4, -1, 2, 1, -5, 4]))
print(max_subarray([-3, -1, -7]))
print(max_subarray([1]))`,
    firstTrace: "The running name holds the best segment finishing at the current value, and the best name never forgets the largest it has seen. The classic list answers six, from the run of four, minus one, two and one. An all-negative list answers minus one, which is the least bad single element.",
    secondTitle: "Recovering the segment costs three more names",
    secondIntro: "Tracking where the current run began turns the value into the slice that produced it.",
    secondCode: `def max_subarray_range(values):
    best = running = values[0]
    start = best_start = best_end = 0
    for index in range(1, len(values)):
        value = values[index]
        if value > running + value:
            running, start = value, index
        else:
            running += value
        if running > best:
            best, best_start, best_end = running, start, index
    return best, values[best_start:best_end + 1]

print(max_subarray_range([-2, 1, -3, 4, -1, 2, 1, -5, 4]))
print(max_subarray_range([-3, -1, -7]))`,
    secondTrace: "The restart branch is the only place a new beginning is recorded, and the bounds are copied whenever the global best improves. Reconstruction follows that same pattern throughout dynamic programming, where you store the decision alongside the value. The winning slice here is four, minus one, two, one.",
    mistake: "Do not start the best value at zero. That silently assumes an empty segment is allowed, so an all-negative input returns zero instead of its largest element, and the bug hides completely until a test uses negative numbers.",
    checkpoint: "Why does the maximum product version need to carry a minimum as well?",
    checkpointAnswer: "Because multiplying by a negative number swaps the roles of the largest and smallest running values. The best product ending at a position can come from the most negative product before it, so keeping only the maximum discards the value the answer depends on.",
    remember: "Ask for the best answer ending at each position, then extend or restart. Seed from the first element rather than zero, and record the start index when you want the segment itself.",
    checks: [
      q("What does the running value represent in Kadane's algorithm?", ["The best segment ending at the current position", "The best segment seen anywhere so far", "The sum of every value so far"], 0, "The global best is tracked separately.", ["Correct. That reframing is what removes the search over starts.", "That is what the separate best name holds.", "A plain prefix sum would not restart on negatives."]),
      q("Seeding the best value at zero breaks which input?", ["An all-negative array", "An array with one element", "A sorted array"], 0, "Zero implies an empty segment is permitted.", ["Correct. It returns zero instead of the largest element.", "A single positive element still works.", "Sorted positive input is unaffected."]),
      q("How is the winning segment recovered?", ["Record the start index whenever a run restarts", "Run the algorithm backward afterwards", "Sort the values and take the top ones"], 0, "Store the decision beside the value.", ["Correct. The bounds are copied when the global best improves.", "A second pass is unnecessary and would not identify the run.", "Sorting destroys the contiguity the problem requires."]),
    ],
  },
];

export const ALGO_DYNAMIC_PROGRAMMING_ATOMS = ALGO_DYNAMIC_PROGRAMMING_SPECS.map(guidedMasteryAtom);
export const ALGO_DYNAMIC_PROGRAMMING_CONCEPTS = ALGO_DYNAMIC_PROGRAMMING_SPECS.map(guidedMasteryConcept);
export const ALGO_DYNAMIC_PROGRAMMING_LESSON_CONTENT = guidedLessonContent(ALGO_DYNAMIC_PROGRAMMING_SPECS);

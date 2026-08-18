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

const ALGO_DIVIDE_CONQUER_SPECS: GuidedMasterySpec[] = [
  {
    lessonId: "py.ac.m6_3.l1",
    atomId: "py.atom.algo.divide-conquer-shape",
    conceptId: "py.algo.divide-conquer-shape",
    title: "Divide into independent halves, then pay for the merge",
    requires: ["py.algo.merge-sort-guided", "py.algo.recurrences"],
    vocabulary: [
      ["divide", "splitting the input into smaller instances of the same problem"],
      ["conquer", "solving each smaller instance, usually by recursing"],
      ["combine", "merging the sub-answers into the answer for the whole"],
      ["independence", "neither half needing anything the other computed"],
    ],
    opening: "Divide and conquer is three steps, and only one of them is interesting. Splitting is usually trivial and recursing is automatic. The combine step is where the algorithm actually lives, and where its cost is decided.",
    outcome: "You will identify the three steps in an algorithm, test whether the halves are genuinely independent, and locate the combine cost.",
    why: "Merge sort, quickselect, closest pairs, fast exponentiation and most parallel algorithms share this shape. Recognizing it tells you immediately which recurrence to write.",
    mentalModel: "Picture counting a crowd by splitting the room down the middle, sending a helper to each side, and adding the two numbers. The split is free, the helpers work in parallel, and the addition is the combine.",
    firstTitle: "The three steps, made explicit",
    firstIntro: "Written plainly, the shape is a base case, two recursive calls, and one line that joins their answers.",
    firstCode: `def total(values):
    if len(values) <= 1:
        return sum(values)
    middle = len(values) // 2
    left = total(values[:middle])
    right = total(values[middle:])
    return left + right

print(total([1, 2, 3, 4, 5]))
print(total([]))`,
    firstTrace: "Summing is a poor use of recursion, but it shows the skeleton in its simplest form. The base case answers directly, the two calls never look at each other, and the combine is a single addition. Cost is dominated by that combine at every level.",
    secondTitle: "Independence is the property that makes it work",
    secondIntro: "When the halves need information from each other, the split does not reduce the problem and the shape does not apply.",
    secondCode: `def max_crossing(values):
    middle = len(values) // 2
    best_left = max(values[:middle])
    best_right = max(values[middle:])
    return best_left * best_right

pairs = [3, 1, 4, 9]
print("split answer:", max_crossing(pairs))
print("true best pair product:", 9 * 4)`,
    secondTrace: "Here the halves are not independent, since the best pair may straddle the boundary. Splitting throws that candidate away, so the answer is wrong. The fix is a combine step that inspects the boundary, which is exactly what the harder algorithms do.",
    mistake: "Do not assume the sub-answers are enough. Whenever a solution can straddle the split, the combine must reconstruct those crossing candidates. Skipping that step produces code that looks recursive, runs fast, and silently returns the wrong answer.",
    checkpoint: "You split an array in half and each half reports its largest sum. What might the combine step still be missing?",
    checkpointAnswer: "Any run that crosses the boundary. The largest sum overall may start inside the left half and finish inside the right one, and neither recursive call can see it. The combine must scan outward from the split to build that crossing candidate.",
    remember: "Divide, conquer, combine. The split and the recursion are usually free; the combine carries the cost and must account for answers that straddle the boundary.",
    checks: [
      q("Which step usually determines a divide-and-conquer algorithm's cost?", ["The combine step", "The split", "The base case"], 0, "Splitting and recursing are typically cheap.", ["Correct. Linear merging per level is what makes merge sort n log n.", "Slicing or index arithmetic is usually trivial.", "Base cases run on tiny inputs and cost almost nothing."]),
      q("What must be true for the two halves to be solved independently?", ["Neither needs a result the other computed", "They must be equal in size", "They must be sorted"], 0, "Independence is what allows separate recursion.", ["Correct. Otherwise the split does not reduce the problem.", "Unequal splits are common and still valid.", "Sortedness is a property of specific algorithms, not the shape."]),
      q("An answer can straddle the midpoint. What follows?", ["The combine step must reconstruct crossing candidates", "The algorithm cannot use divide and conquer", "The split point must be moved"], 0, "Recursive calls cannot see across the boundary.", ["Correct. That is exactly what the inversion and closest-pair algorithms do.", "Divide and conquer handles it, provided the combine is written for it.", "Moving the split just relocates the same problem."]),
    ],
  },
  {
    lessonId: "py.ac.m6_3.l2",
    atomId: "py.atom.algo.master-theorem",
    conceptId: "py.algo.master-theorem",
    title: "The Master Theorem reads the recurrence for you",
    requires: ["py.algo.divide-conquer-shape", "py.algo.recursion-trees"],
    vocabulary: [
      ["branching factor", "how many recursive calls each level makes"],
      ["shrink factor", "how much smaller each subproblem becomes"],
      ["local work", "the work one call does outside its recursive calls"],
      ["dominant term", "whichever of leaves or root work grows faster"],
    ],
    opening: "Every divide-and-conquer cost is a race between two quantities: the work piling up in the leaves and the work done at the top. The Master Theorem is just a rule for reading which one wins.",
    outcome: "You will write a recurrence from code, compare leaf work against local work, and read off the resulting growth class.",
    why: "Being able to state the complexity of an unfamiliar recursive algorithm in seconds is a routine interview expectation, and guessing wrong changes which approach you choose.",
    mentalModel: "Think of a tree where each level does some total work. If the levels grow toward the leaves, the leaves dominate. If they shrink, the root dominates. If every level costs the same, multiply by the number of levels.",
    firstTitle: "Read the three numbers straight off the code",
    firstIntro: "A recurrence needs only the branching factor, the shrink factor, and the local work per call.",
    firstCode: `def describe(branches, shrink, local_exponent):
    import math
    leaf_exponent = math.log(branches, shrink)
    if leaf_exponent > local_exponent:
        return f"leaves win: n^{round(leaf_exponent, 2)}"
    if abs(leaf_exponent - local_exponent) < 1e-9:
        return f"tie: n^{local_exponent} log n"
    return f"local work wins: n^{local_exponent}"

print("merge sort   ", describe(2, 2, 1))
print("binary search", describe(1, 2, 0))
print("naive matmul ", describe(8, 2, 2))`,
    firstTrace: "Merge sort makes two calls on halves and merges linearly, so the two sides tie and a log factor appears. Binary search makes one call and does constant work, giving a logarithmic total. Naive matrix multiplication branches eight ways with quadratic local work, so the leaves dominate.",
    secondTitle: "Check the verdict against a real count",
    secondIntro: "The theorem is a shortcut, and the honest way to trust a shortcut is to count the actual work once.",
    secondCode: `def merge_cost(n):
    if n <= 1:
        return n
    half = n // 2
    return merge_cost(half) + merge_cost(n - half) + n

for size in (2, 4, 8, 16, 32):
    import math
    predicted = size * math.log2(size)
    print(size, "actual", merge_cost(size), "n log n", round(predicted))`,
    secondTrace: "The measured totals track n log n closely as the size doubles, differing only by the constant the notation discards. That agreement is what the theorem promises: not the exact count, but the growth class it belongs to.",
    mistake: "Do not apply the theorem when the subproblems have different sizes or the local work is not a clean power. Quickselect on an unbalanced split and algorithms with logarithmic local work fall outside it, and need a recursion tree drawn by hand.",
    checkpoint: "An algorithm makes four recursive calls on quarters and does linear work per call. Which side wins?",
    checkpointAnswer: "The leaves. Four calls on quarter-sized inputs gives a leaf exponent of one, matching the linear local work, so the two tie and the cost is n log n. If the local work were constant instead, the leaves would dominate outright and the cost would be linear.",
    remember: "Compare leaf growth against local work. Leaves winning gives their exponent, local work winning gives its own, and a tie adds a log factor.",
    checks: [
      q("Merge sort splits in two and merges linearly. Why does a log factor appear?", ["Leaf work and local work grow at the same rate", "The merge is logarithmic", "There are log n leaves"], 0, "A tie between the two sides adds a factor of log n.", ["Correct. Every level costs about n, and there are about log n levels.", "The merge is linear, not logarithmic.", "There are n leaves; it is the depth that is logarithmic."]),
      q("When does the theorem not apply?", ["When subproblems have different sizes", "When there are two recursive calls", "When the input is unsorted"], 0, "It assumes equal-sized subproblems and polynomial local work.", ["Correct. An unbalanced split needs a hand-drawn recursion tree.", "Two equal calls are the standard case it covers.", "Sortedness is irrelevant to the recurrence."]),
      q("One recursive call on half the input with constant local work gives what?", ["Logarithmic time", "Linear time", "n log n time"], 0, "Each level costs a constant and there are log n levels.", ["Correct. That is binary search.", "Linear would need work proportional to n per level.", "That requires linear work at every level."]),
    ],
  },
  {
    lessonId: "py.ac.m6_3.l3",
    atomId: "py.atom.algo.cross-boundary-merge",
    conceptId: "py.algo.cross-boundary-merge",
    title: "Recover the crossing answers while you merge",
    requires: ["py.algo.master-theorem"],
    vocabulary: [
      ["inversion", "a pair that is out of order relative to the sorted arrangement"],
      ["crossing pair", "a pair with one element in each half"],
      ["ordered merge", "combining two sorted halves in one forward pass"],
      ["free information", "a count obtainable during a merge you were doing anyway"],
    ],
    opening: "The interesting divide-and-conquer algorithms all share one trick. The recursive calls handle everything inside each half, and the combine step is where the crossing cases are counted, for free, during a merge that was happening regardless.",
    outcome: "You will count crossing inversions during a merge and explain why the count is available without extra comparisons.",
    why: "Counting inversions measures how far a list is from sorted, which underlies rank correlation and collaborative filtering. The technique generalizes to closest pairs and many geometric problems.",
    mentalModel: "Picture zipping two sorted piles together. Whenever you take a card from the right pile, every card still waiting in the left pile is larger than it. That whole group is an inversion, and you counted it with one addition.",
    firstTitle: "The brute force says what the answer means",
    firstIntro: "Defining the quantity plainly gives you something to check the fast version against.",
    firstCode: `def count_slow(values):
    total = 0
    for i in range(len(values)):
        for j in range(i + 1, len(values)):
            if values[i] > values[j]:
                total += 1
    return total

print(count_slow([2, 4, 1, 3, 5]))
print(count_slow([5, 4, 3, 2, 1]))
print(count_slow([1, 2, 3]))`,
    firstTrace: "A sorted list has no inversions and a fully reversed one has every possible pair inverted. The quadratic version is easy to verify by eye and far too slow to use, which makes it the right reference for testing the fast one.",
    secondTitle: "Count during the merge instead",
    secondIntro: "Sorting each half recursively leaves only the crossing pairs to account for, and the merge reveals them one group at a time.",
    secondCode: `def count_fast(values):
    def sort_count(items):
        if len(items) <= 1:
            return items, 0
        middle = len(items) // 2
        left, a = sort_count(items[:middle])
        right, b = sort_count(items[middle:])
        merged, crossing = [], 0
        i = j = 0
        while i < len(left) and j < len(right):
            if left[i] <= right[j]:
                merged.append(left[i]); i += 1
            else:
                merged.append(right[j]); j += 1
                crossing += len(left) - i
        merged += left[i:] + right[j:]
        return merged, a + b + crossing
    return sort_count(values)[1]

for sample in ([2, 4, 1, 3, 5], [5, 4, 3, 2, 1], [1, 2, 3]):
    print(sample, count_fast(sample), count_slow(sample))`,
    secondTrace: "Both versions agree on every sample. The single line adding the remaining left-hand length is the whole idea: taking a smaller value from the right proves it is inverted with every left value still queued, so one addition replaces a group of comparisons.",
    mistake: "Do not count crossing pairs one at a time. Adding one per comparison keeps the algorithm quadratic and discards the ordering you already paid to establish. The saving comes from counting a whole block with a single addition.",
    checkpoint: "During a merge you take a value from the right half while three values remain unconsumed in the left. How many inversions does that reveal?",
    checkpointAnswer: "Three. Both halves are sorted, so every value still waiting in the left half is at least as large as the one just taken from the right, and each of those pairs is out of order. One addition records all three.",
    remember: "Recursion handles the pairs inside each half; the merge counts the crossing ones. Taking from the right adds the number of values still waiting in the left.",
    checks: [
      q("Where do crossing inversions get counted?", ["During the merge step", "Inside each recursive call", "In the base case"], 0, "Recursive calls see only their own half.", ["Correct. The merge is the only place both halves are visible at once.", "A call cannot see the other half's values.", "Base cases hold a single element and no pairs."]),
      q("Why does taking from the right count a whole block at once?", ["Both halves are sorted, so every remaining left value is larger", "The right half is always larger overall", "The blocks are of fixed size"], 0, "Sortedness turns one comparison into a group conclusion.", ["Correct. That is what keeps the algorithm at n log n.", "Individual values interleave; only the ordering within halves is known.", "Block sizes vary with the merge position."]),
      q("What is the reversed list of length n used for in testing?", ["It has the maximum possible inversion count", "It has none", "It cannot be sorted"], 0, "Every pair is out of order there.", ["Correct. That makes it a strong upper-bound check.", "The sorted list is the one with none.", "It sorts perfectly well."]),
    ],
  },
  {
    lessonId: "py.ac.m6_3.l4",
    atomId: "py.atom.algo.fast-exponentiation",
    conceptId: "py.algo.fast-exponentiation",
    title: "Halving the exponent turns multiplication logarithmic",
    requires: ["py.algo.cross-boundary-merge"],
    vocabulary: [
      ["fast exponentiation", "squaring repeatedly instead of multiplying repeatedly"],
      ["square and multiply", "handling an odd exponent with one extra factor"],
      ["matrix power", "raising a transition matrix to the nth power"],
      ["linear recurrence", "a sequence where each term is a fixed combination of previous ones"],
    ],
    opening: "Raising a number to the nth power looks like it needs n multiplications. Halving the exponent instead of decrementing it turns that into about log n, and the same trick applies to matrices, which makes it far more useful than it first appears.",
    outcome: "You will implement square-and-multiply, handle odd exponents, and use a matrix power to jump ahead in a linear recurrence.",
    why: "Modular exponentiation underpins cryptography, and matrix exponentiation computes the billionth Fibonacci term in microseconds. Both come from the same one-line observation about halving.",
    mentalModel: "Picture doubling a piece of paper rather than adding sheets one at a time. Reaching a thousand sheets takes ten doublings instead of a thousand additions, and an odd target just needs one extra sheet added at the right moment.",
    firstTitle: "Square when the exponent is even, multiply once when odd",
    firstIntro: "An even exponent is the square of half of it. An odd exponent is that, times one more copy of the base.",
    firstCode: `def power(base, exponent):
    if exponent == 0:
        return 1
    half = power(base, exponent // 2)
    if exponent % 2 == 0:
        return half * half
    return half * half * base

print(power(2, 10), 2 ** 10)
print(power(3, 7), 3 ** 7)
print(power(5, 0), 1)`,
    firstTrace: "Each call halves the exponent, so the depth is about log n rather than n. Computing half once and squaring it is the whole saving; calling power twice would rebuild the same value and give back the linear cost.",
    secondTitle: "The same halving jumps a recurrence forward",
    secondIntro: "A linear recurrence can be written as a matrix, and raising that matrix to the nth power skips every intermediate term.",
    secondCode: `def multiply(a, b):
    return [[sum(a[i][k] * b[k][j] for k in range(2)) for j in range(2)]
            for i in range(2)]

def matrix_power(matrix, exponent):
    result = [[1, 0], [0, 1]]
    while exponent:
        if exponent % 2:
            result = multiply(result, matrix)
        matrix = multiply(matrix, matrix)
        exponent //= 2
    return result

fib = [[1, 1], [1, 0]]
for n in (10, 50):
    print("fib", n, matrix_power(fib, n)[0][1])`,
    secondTrace: "The identity matrix plays the role the number one played, and squaring the matrix replaces squaring the number. Fifty steps of the recurrence collapse into about six squarings, and the fiftieth Fibonacci number appears without computing the forty-nine before it.",
    mistake: "Do not write the recursive call twice as `power(base, exponent // 2) * power(base, exponent // 2)`. It computes the identical value twice at every level, which restores the linear cost the halving was meant to remove. Bind it to a name and square that.",
    checkpoint: "Why does binding the recursive result to a variable change the complexity rather than merely tidying the code?",
    checkpointAnswer: "Calling twice makes each level branch into two identical subtrees, so the call count doubles per level and the total returns to linear. Binding it computes the value once, leaving a single chain of about log n calls.",
    remember: "Halve the exponent, square the result, and multiply once more when it is odd. The same structure raises matrices, which jumps a linear recurrence straight to term n.",
    checks: [
      q("How many multiplications does fast exponentiation use for exponent n?", ["About log n", "About n", "About n squared"], 0, "Each step halves the exponent.", ["Correct. Doubling the exponent adds only one more step.", "That is the naive repeated-multiplication cost.", "Nothing here grows quadratically."]),
      q("What happens with an odd exponent?", ["Square the half, then multiply by the base once more", "Round the exponent down and accept the error", "Split into two equal halves anyway"], 0, "The leftover factor is handled explicitly.", ["Correct. That single extra multiplication keeps the result exact.", "Discarding it would give the wrong answer.", "An odd number has no two equal integer halves."]),
      q("Why does matrix exponentiation help with Fibonacci?", ["Raising the transition matrix jumps straight to term n", "Matrices multiply faster than numbers", "It avoids all recursion"], 0, "The recurrence becomes a matrix power.", ["Correct. Log n squarings replace n additions.", "Matrix multiplication is more expensive per operation, not less.", "The halving may be written recursively or iteratively."]),
    ],
  },
];

export const ALGO_DIVIDE_CONQUER_ATOMS = ALGO_DIVIDE_CONQUER_SPECS.map(guidedMasteryAtom);
export const ALGO_DIVIDE_CONQUER_CONCEPTS = ALGO_DIVIDE_CONQUER_SPECS.map(guidedMasteryConcept);
export const ALGO_DIVIDE_CONQUER_LESSON_CONTENT = guidedLessonContent(ALGO_DIVIDE_CONQUER_SPECS);

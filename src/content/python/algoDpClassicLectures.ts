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

const ALGO_DP_CLASSIC_SPECS: GuidedMasterySpec[] = [
  {
    lessonId: "py.ac.m6_5.l1",
    atomId: "py.atom.algo.knapsack",
    conceptId: "py.algo.knapsack",
    title: "Knapsack, where the loop direction is the rule",
    requires: ["py.algo.kadane"],
    vocabulary: [
      ["capacity", "the budget a selection is not allowed to exceed"],
      ["bounded knapsack", "the variant where each item may be taken at most once"],
      ["unbounded knapsack", "the variant where an item may be taken any number of times"],
      ["in-place update", "rewriting a table row while still reading from it"],
    ],
    opening: "Knapsack is the problem most interview questions are wearing a costume of. Once the table is one row wide, the difference between taking an item once and taking it repeatedly comes down to which way the loop runs.",
    outcome: "You will write the one-row knapsack table, and choose the loop direction that permits or forbids reusing an item.",
    why: "Subset sum, coin change, partition and target sum are all knapsack with the labels changed. The direction rule is the single detail that separates them, and reversing it by accident is a bug that passes most small tests.",
    mentalModel: "Picture filling a shelf of capacity slots from a catalogue. Walking the shelf from the far end means every slot you read was written before this item existed. Walking from the near end means you can meet the same item again in the same pass.",
    firstTitle: "Each item once: walk the capacities downward",
    firstIntro: "Reading a capacity that the current item has not touched yet is what enforces the limit of one.",
    firstCode: `def bounded(weights, values, capacity):
    table = [0] * (capacity + 1)
    for weight, value in zip(weights, values):
        for room in range(capacity, weight - 1, -1):
            table[room] = max(table[room], table[room - weight] + value)
    return table[capacity]

print(bounded([2, 3], [3, 4], 9))
print(bounded([5], [10], 4))
print(bounded([], [], 7))`,
    firstTrace: "Descending capacities means the entry being read at room minus weight still describes a shelf without this item. The answer for that catalogue is seven, which is both items taken once. An item too heavy for the whole shelf never enters the inner loop at all.",
    secondTitle: "Unlimited copies: walk the capacities upward",
    secondIntro: "One flipped range is the entire difference, because now the entry being read may already include this item.",
    secondCode: `def unbounded(weights, values, capacity):
    table = [0] * (capacity + 1)
    for weight, value in zip(weights, values):
        for room in range(weight, capacity + 1):
            table[room] = max(table[room], table[room - weight] + value)
    return table[capacity]

print(unbounded([2, 3], [3, 4], 9))
print(unbounded([3], [4], 7))`,
    secondTrace: "Ascending capacities lets a smaller entry that already used this item feed a larger one, which is exactly what taking a second copy means. The same catalogue now answers thirteen, by taking the weight-two item three times and the weight-three item once. Taking one item repeatedly is not a special case; it falls out of the ordering.",
    mistake: "Do not use a two-dimensional table and then also reverse the inner loop. The direction rule exists only because a single row is being rewritten in place, and applying it to a table that keeps each row separate makes the code confusing without changing what it computes.",
    checkpoint: "You wrote the ascending loop for a problem where each item may be used once. What kind of answer comes back?",
    checkpointAnswer: "One that is too large, because the same item can be picked up several times within a single pass. The mistake rarely shows on a tiny test where no item fits twice, and it appears reliably as soon as one small item can be repeated inside the capacity.",
    remember: "One row, two directions. Descending capacities enforce one copy per item, ascending capacities allow unlimited copies, and everything else about the two routines is identical.",
    checks: [
      q("Which loop direction allows an item to be used more than once?", ["Ascending capacities", "Descending capacities", "Either, given enough items"], 0, "The entry being read may already include the item.", ["Correct. That is precisely the unbounded case.", "Descending reads entries written before this item.", "The direction alone decides it."]),
      q("Why does the one-row table need a direction rule at all?", ["It is rewritten in place while still being read", "It saves memory", "It runs faster"], 0, "In-place updates make read order significant.", ["Correct. A separate previous row would remove the ambiguity.", "Memory is a benefit, not the reason for the rule.", "Speed is unchanged by the direction."]),
      q("Subset sum is knapsack with which change?", ["Value equals weight and the question is reachability", "A different loop direction", "An extra state dimension"], 0, "The structure is identical.", ["Correct. Booleans replace the maximum.", "Direction depends on whether reuse is allowed, as always.", "One dimension still suffices."]),
    ],
  },
  {
    lessonId: "py.ac.m6_5.l2",
    atomId: "py.atom.algo.coin-change",
    conceptId: "py.algo.coin-change",
    title: "Coin change: counting and minimizing are different loops",
    requires: ["py.algo.knapsack"],
    vocabulary: [
      ["combination", "a multiset of coins, where order does not matter"],
      ["permutation", "an ordered sequence of coins, where order does matter"],
      ["outer loop", "the loop whose variable changes least often"],
      ["unreachable amount", "a target no combination of the given coins can produce"],
    ],
    opening: "Coin change is asked in two forms that look almost identical in code. Which loop sits on the outside decides whether you count combinations or permutations, and getting it backward is the most common error in the whole family.",
    outcome: "You will count the ways to make a target, find the fewest coins, and choose the loop nesting that matches which of the two is being asked.",
    why: "The minimum version and both counting versions appear constantly, and they differ by a loop swap rather than by an algorithm. Knowing which nesting produces which count makes all three immediate.",
    mentalModel: "Think of laying coins on a table. If you decide the full quota of one denomination before moving to the next, order never enters and you count combinations. If you ask what to place at each step, the same coins in another order become a second answer.",
    firstTitle: "Coins outside counts combinations",
    firstIntro: "Finishing one denomination entirely before starting the next is what removes order from the count.",
    firstCode: `def count_combinations(coins, target):
    table = [0] * (target + 1)
    table[0] = 1
    for coin in coins:
        for amount in range(coin, target + 1):
            table[amount] += table[amount - coin]
    return table[target]

def count_permutations(coins, target):
    table = [0] * (target + 1)
    table[0] = 1
    for amount in range(1, target + 1):
        for coin in coins:
            if coin <= amount:
                table[amount] += table[amount - coin]
    return table[target]

print("combinations:", count_combinations([1, 2, 5], 5))
print("permutations:", count_permutations([1, 2, 5], 5))`,
    firstTrace: "Four combinations make five, and nine ordered sequences do. The only difference between the two routines is which loop is outside, and the amount table is otherwise built the same way. Swapping them by accident changes the answer without changing the shape of the code.",
    secondTitle: "Minimizing needs a sentinel, not a count",
    secondIntro: "The fewest-coins version replaces addition with a minimum, and needs a way to say that an amount cannot be reached.",
    secondCode: `def fewest_coins(coins, target):
    unreachable = float("inf")
    table = [0] + [unreachable] * target
    for amount in range(1, target + 1):
        for coin in coins:
            if coin <= amount:
                table[amount] = min(table[amount], table[amount - coin] + 1)
    return -1 if table[target] == unreachable else table[target]

print(fewest_coins([1, 2, 5], 11))
print(fewest_coins([2], 3))
print(fewest_coins([], 0))`,
    secondTrace: "Infinity marks an amount nothing has reached, and adding one to it stays infinite, so unreachable amounts never contaminate their neighbours. Eleven takes three coins, and three cannot be built from twos at all. A target of zero is reachable with no coins, which is why that entry starts at zero rather than at the sentinel.",
    mistake: "Do not initialize the minimum table with a large integer such as a million instead of infinity. A chain of unreachable amounts adds one to it repeatedly, and a target deep enough eventually creeps under whatever threshold you used to detect failure.",
    checkpoint: "You want combinations but wrote the amount loop on the outside. What did you actually count?",
    checkpointAnswer: "Permutations, so every distinct ordering of the same coins was counted separately. One and two counts separately from two and one, which inflates the answer sharply once the target admits several denominations.",
    remember: "Coins outside for combinations, amounts outside for permutations. Minimizing swaps the sum for a minimum and needs infinity as the sentinel for unreachable amounts.",
    checks: [
      q("Which nesting counts combinations rather than permutations?", ["Coins on the outside, amounts on the inside", "Amounts on the outside, coins on the inside", "Either, as long as the table starts at one"], 0, "Finishing one denomination first removes ordering.", ["Correct. Each coin is considered once, globally.", "That nesting revisits every coin at every amount.", "The seed value does not affect ordering."]),
      q("Why is infinity used as the unreachable marker?", ["Adding one to it keeps it unreachable", "It compares faster", "It uses less memory"], 0, "A finite sentinel can be crept under.", ["Correct. The marker survives any number of transitions.", "Comparison cost is identical.", "Both are single values."]),
      q("Why does the table start with one way to make zero?", ["Taking no coins is a valid way to reach zero", "It avoids a division by zero", "It marks the table as initialized"], 0, "The empty selection is a real combination.", ["Correct. Every count is built from that base.", "No division occurs anywhere.", "Initialization is not what the entry means."]),
    ],
  },
  {
    lessonId: "py.ac.m6_5.l3",
    atomId: "py.atom.algo.longest-increasing-subsequence",
    conceptId: "py.algo.longest-increasing-subsequence",
    title: "Longest increasing subsequence, quadratic then logarithmic",
    requires: ["py.algo.coin-change", "py.algo.binary-search-bounds"],
    vocabulary: [
      ["subsequence", "elements kept in order, with any others removed"],
      ["tails array", "the smallest possible ending value for a subsequence of each length"],
      ["patience method", "placing each value onto the leftmost pile whose top it can sit under"],
      ["length-indexed state", "a table whose position means a length rather than an input index"],
    ],
    opening: "The quadratic solution to this problem is the honest one, and you should be able to write it without thinking. The faster version is worth knowing because its state is indexed by length rather than by position, which is a genuinely different way to think.",
    outcome: "You will write the quadratic recurrence, then the tails method, and explain why the tails array is not itself a valid subsequence.",
    why: "This problem is asked directly, and it also hides inside box stacking, envelope nesting and several scheduling questions. The logarithmic version is the standard follow-up once the quadratic one is on the board.",
    mentalModel: "Imagine dealing cards onto piles where a card may only be placed on a pile whose top card is larger. The number of piles is the length of the longest increasing run, even though no single pile is that run.",
    firstTitle: "The quadratic version, written directly",
    firstIntro: "The state is the length of the best subsequence that finishes at each position.",
    firstCode: `def lis_quadratic(values):
    if not values:
        return 0
    best = [1] * len(values)
    for index in range(1, len(values)):
        for earlier in range(index):
            if values[earlier] < values[index]:
                best[index] = max(best[index], best[earlier] + 1)
    return max(best)

print(lis_quadratic([10, 9, 2, 5, 3, 7, 101, 18]))
print(lis_quadratic([7, 7, 7]))
print(lis_quadratic([]))`,
    firstTrace: "Every position looks back at all the smaller values that could precede it and takes the best of them. The classic list answers four, from two, three, seven and eighteen. Equal values never extend each other, so a list of identical numbers answers one.",
    secondTitle: "The tails method, where the index means a length",
    secondIntro: "Storing the smallest possible ending value for each achievable length turns the inner scan into a binary search.",
    secondCode: `from bisect import bisect_left

def lis_fast(values):
    tails = []
    for value in values:
        position = bisect_left(tails, value)
        if position == len(tails):
            tails.append(value)
        else:
            tails[position] = value
    return len(tails)

print(lis_fast([10, 9, 2, 5, 3, 7, 101, 18]))
print(lis_fast([2, 5, 3]))
print(lis_fast([]))`,
    secondTrace: "The tails list stays sorted, so a binary search finds where each value belongs. Its length is the answer, but its contents are not a subsequence of the input, since entries get overwritten by smaller values that arrived later. That distinction is what the follow-up question in an interview is usually testing.",
    mistake: "Do not report the tails list itself as the answer when the actual subsequence is required. Reconstructing it needs a parallel array recording, for each value, which position it was placed at, and then a walk backward through those records.",
    checkpoint: "For strictly increasing runs the search uses a left-most match. What changes if runs are allowed to be non-decreasing?",
    checkpointAnswer: "The search moves to the right-most insertion point, so an equal value appends rather than overwriting. That single swap turns the strict version into the non-decreasing one, and it is the usual variation asked immediately after the first solution.",
    remember: "Quadratic state is indexed by position; the fast state is indexed by length. The tails array gives the correct length and is not itself a valid subsequence.",
    checks: [
      q("What does each entry of the tails array hold?", ["The smallest ending value for a subsequence of that length", "The value at that input position", "The count of subsequences of that length"], 0, "The index means a length.", ["Correct. Smaller endings leave more room for later values.", "Input positions are not what the index tracks.", "No counting is performed."]),
      q("Why is the tails array not a valid subsequence of the input?", ["Entries are overwritten by smaller values arriving later", "It is sorted", "It is too short"], 0, "Its length is right; its contents are not a run.", ["Correct. The overwritten entries break the ordering in the input.", "Being sorted is a property it must have.", "Its length is exactly the answer."]),
      q("What makes the fast version run in n log n?", ["A binary search replaces the scan over earlier positions", "The input is sorted first", "It uses a hash map"], 0, "The tails array stays sorted throughout.", ["Correct. Each value costs one logarithmic search.", "Sorting the input would destroy the required order.", "No hashing is involved."]),
    ],
  },
  {
    lessonId: "py.ac.m6_5.l4",
    atomId: "py.atom.algo.edit-distance",
    conceptId: "py.algo.edit-distance",
    title: "Two sequences, one grid: subsequences and edit distance",
    requires: ["py.algo.longest-increasing-subsequence"],
    vocabulary: [
      ["prefix pair", "a state naming how much of each of the two sequences has been consumed"],
      ["match transition", "the move taken when the two current characters agree"],
      ["edit operation", "an insertion, a deletion or a substitution, each costing one"],
      ["row reduction", "keeping only the table rows a transition still reads"],
    ],
    opening: "Every problem comparing two sequences uses the same state: how much of each one you have consumed. Once that clicks, longest common subsequence and edit distance stop being two problems and become one grid with two different transition rules.",
    outcome: "You will write the two-sequence recurrence for both problems, and reduce the grid to two rows.",
    why: "Diff tools, spell checkers, DNA alignment and a long run of interview questions are all this grid. Recognizing the prefix-pair state is what lets you write any of them from scratch.",
    mentalModel: "Picture a grid with one word running down the side and the other across the top. Every cell asks the same question about a pair of prefixes. Each legal move consumes a character from one word, from the other, or from both at once.",
    firstTitle: "Longest common subsequence: match or drop one",
    firstIntro: "Matching characters advance both prefixes; a mismatch means dropping a character from one side or the other.",
    firstCode: `def lcs(a, b):
    grid = [[0] * (len(b) + 1) for _ in range(len(a) + 1)]
    for i in range(1, len(a) + 1):
        for j in range(1, len(b) + 1):
            if a[i - 1] == b[j - 1]:
                grid[i][j] = grid[i - 1][j - 1] + 1
            else:
                grid[i][j] = max(grid[i - 1][j], grid[i][j - 1])
    return grid[len(a)][len(b)]

print(lcs("abcde", "ace"))
print(lcs("abc", "def"))
print(lcs("", "abc"))`,
    firstTrace: "A match costs nothing to take and adds one, so it moves diagonally. A mismatch tries dropping a character from each side and keeps the better result. Nothing in common answers zero, and an empty sequence makes the whole first row zero.",
    secondTitle: "Edit distance: three operations, all costing one",
    secondIntro: "The same grid with a minimum instead of a maximum, plus a substitution move on the diagonal.",
    secondCode: `def edit_distance(a, b):
    previous = list(range(len(b) + 1))
    for i in range(1, len(a) + 1):
        current = [i] + [0] * len(b)
        for j in range(1, len(b) + 1):
            cost = 0 if a[i - 1] == b[j - 1] else 1
            current[j] = min(previous[j] + 1,
                             current[j - 1] + 1,
                             previous[j - 1] + cost)
        previous = current
    return previous[len(b)]

print(edit_distance("horse", "ros"))
print(edit_distance("intention", "execution"))
print(edit_distance("", "abc"))`,
    secondTrace: "The three candidates are a deletion, an insertion and a substitution, and matching characters make the substitution free. Horse becomes ros in three edits and intention becomes execution in five. Only two rows exist at any moment, because the transition never reaches further than one row back.",
    mistake: "Do not forget to seed the first row and column. They represent turning a prefix into an empty sequence, which costs one edit per character, and leaving them at zero makes every distance too small without producing any visible error.",
    checkpoint: "The grid is filled but the actual alignment is required, not just its cost. What has to change?",
    checkpointAnswer: "The full grid must be kept rather than two rows, so the path can be walked backward from the final cell. At each step you check which of the candidate moves produced the stored value, and that sequence of moves is the alignment.",
    remember: "The state is a pair of prefix lengths. A match moves diagonally, the other moves consume one side, and the grid reduces to two rows unless the path itself is needed.",
    checks: [
      q("What does the state represent in a two-sequence grid?", ["How much of each sequence has been consumed", "The characters currently being compared", "The number of edits made so far"], 0, "Prefix lengths are what the future depends on.", ["Correct. The pair of lengths is the whole state.", "The characters follow from the lengths.", "The edit count is the stored value, not the state."]),
      q("Why can edit distance run with two rows?", ["No transition reaches further than one row back", "The grid is symmetric", "The alphabet is small"], 0, "Backward reach sets the memory.", ["Correct. Two rows are enough unless the path is needed.", "It is not symmetric in general.", "Alphabet size is irrelevant here."]),
      q("What must the first row and column be seeded with in edit distance?", ["The prefix length, since deleting each character costs one", "Zero throughout", "Infinity"], 0, "They compare a prefix against the empty sequence.", ["Correct. Turning a prefix into nothing costs one edit per character.", "Zeros would make every distance too small.", "Those states are reachable, so infinity is wrong."]),
    ],
  },
  {
    lessonId: "py.ac.m6_5.l5",
    atomId: "py.atom.algo.subset-sum",
    conceptId: "py.algo.subset-sum",
    title: "Subset sum and partition, as reachable totals",
    requires: ["py.algo.edit-distance"],
    vocabulary: [
      ["reachable total", "a sum that some subset of the values is able to produce"],
      ["reachability set", "the collection of totals reachable after considering some prefix of the values"],
      ["partition", "a split of the values into two groups with equal sums"],
      ["bitset trick", "representing a reachability set as the bits of one large integer"],
    ],
    opening: "Selection problems become much easier once you stop tracking which items were chosen and track only which totals are reachable. Partition, target sum and the last-stone problem all collapse into that one question.",
    outcome: "You will build the set of reachable totals, decide partition from it, and express the same computation with integer bit shifts.",
    why: "Reachability is a smaller state than any record of the chosen items, and it is enough for every question of this family. Recognizing that turns a search that looks exponential into a linear pass over a bounded table.",
    mentalModel: "Think of a row of lamps numbered by total, all dark except zero. Each value switches on every lamp that is its own distance ahead of a lamp that is already lit.",
    firstTitle: "Reachability, one value at a time",
    firstIntro: "The descending loop is the same rule as bounded knapsack, because each value may be used once.",
    firstCode: `def can_reach(values, target):
    reachable = [False] * (target + 1)
    reachable[0] = True
    for value in values:
        for total in range(target, value - 1, -1):
            if reachable[total - value]:
                reachable[total] = True
    return reachable[target]

def can_partition(values):
    total = sum(values)
    if total % 2:
        return False
    return can_reach(values, total // 2)

print(can_reach([3, 34, 4, 12, 5, 2], 9))
print(can_partition([1, 5, 11, 5]), can_partition([1, 2, 3, 5]))`,
    firstTrace: "Zero is reachable before anything is chosen, and each value extends the set forward by its own size. Nine is reachable from four and five, and the first partition succeeds because both halves total eleven. An odd overall sum fails immediately, without any table at all.",
    secondTitle: "The same set, held in the bits of one integer",
    secondIntro: "A shift moves every reachable total forward at once, and an or-assignment merges the new possibilities.",
    secondCode: `def can_reach_bits(values, target):
    reachable = 1
    for value in values:
        reachable |= reachable << value
    return bool((reachable >> target) & 1)

print(can_reach_bits([3, 34, 4, 12, 5, 2], 9))
print(can_reach_bits([1, 5, 11, 5], 11))
print(can_reach_bits([2, 4], 3))`,
    secondTrace: "Bit position n being set means total n is reachable, and shifting left by a value is exactly the choice to take it. The whole inner loop becomes one machine word operation per chunk, which is why this form is dramatically faster in practice. It computes the same set with the same rule.",
    mistake: "Do not use the bit form when the actual subset is required. Shifting discards which values produced each bit, so the answer is reachability alone, and recovering the chosen items needs the explicit table with a backward walk through it.",
    checkpoint: "Why does an odd total let you reject partition before building any table?",
    checkpointAnswer: "Two equal integer halves must sum to an even number, so an odd total makes the split impossible. Checking the parity first avoids allocating a table for a question that already has an answer.",
    remember: "Track reachable totals rather than chosen items. The descending loop keeps each value single-use, and the same set fits in the bits of one integer when only reachability is needed.",
    checks: [
      q("Why is tracking reachable totals enough for these problems?", ["The questions ask whether a total is achievable, not which items achieve it", "Totals are smaller numbers", "The items are always distinct"], 0, "The state only needs what the question asks about.", ["Correct. Item identity is not part of the answer.", "Magnitude is not the reason.", "Duplicates are handled fine."]),
      q("What does shifting the integer left by a value represent?", ["Taking that value, moving every reachable total forward", "Doubling the target", "Discarding small totals"], 0, "Bit position means total.", ["Correct. The or-assignment then merges taking and skipping.", "The target is never modified.", "No bits are lost by shifting left."]),
      q("Partition is rejected immediately when the total is odd. Why?", ["Two equal integer halves must sum to an even number", "Odd sums overflow the table", "The descending loop requires an even bound"], 0, "It is an arithmetic impossibility.", ["Correct. No table is needed to see it.", "Overflow is not a concern.", "The loop works with any bound."]),
    ],
  },
];

export const ALGO_DP_CLASSIC_ATOMS = ALGO_DP_CLASSIC_SPECS.map(guidedMasteryAtom);
export const ALGO_DP_CLASSIC_CONCEPTS = ALGO_DP_CLASSIC_SPECS.map(guidedMasteryConcept);
export const ALGO_DP_CLASSIC_LESSON_CONTENT = guidedLessonContent(ALGO_DP_CLASSIC_SPECS);

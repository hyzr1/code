import type { LectureQuestion } from "../../types";
import { guidedLessonContent, guidedMasteryAtom, guidedMasteryConcept, type GuidedMasterySpec } from "./guidedMastery";

const q = (question: string, choices: [string, string, string], answer: 0 | 1 | 2, explanation: string, why: [string, string, string]): LectureQuestion => ({ question, choices, answer, explanation, why });

const SPECS: GuidedMasterySpec[] = [
  {
    lessonId: "py.ac.m3_2.l1", atomId: "py.atom.algo.binary-search-exact", conceptId: "py.algo.binary-search-exact",
    title: "Binary search keeps one honest candidate interval", requires: ["py.algo.sort-stability-guided"],
    vocabulary: [["search interval", "the indexes that might still hold the target"], ["inclusive bound", "an endpoint that is still part of the search"], ["midpoint", "the index inspected during one step"], ["invariant", "a fact that remains true before and after every loop step"]],
    opening: "Binary search is not a trick for guessing the middle. It is a careful promise: if the target exists, it remains inside one shrinking interval of a sorted list.",
    outcome: "You will write an inclusive binary-search template, trace every bound update, prove why no candidate is skipped, and handle empty lists and missing targets.",
    why: "A correct template prevents off-by-one bugs. The same interval reasoning powers database indexes, library boundary searches, and many interview problems.",
    mentalModel: "Imagine a row of numbered lockers. Looking inside the middle locker lets you lock an entire impossible half. Keep the half that can still contain the target.",
    firstTitle: "Search a closed interval", firstIntro: "Both low and high are possible indexes. The loop continues while that closed interval contains at least one index.",
    firstCode: `def binary_search(values, target):
    low = 0
    high = len(values) - 1
    while low <= high:
        middle = low + (high - low) // 2
        if values[middle] == target:
            return middle
        if values[middle] < target:
            low = middle + 1
        else:
            high = middle - 1
    return -1

print(binary_search([2, 5, 8, 12, 16, 23], 12))`,
    firstTrace: "The first midpoint holds eight. Sorted order proves indexes through that midpoint are too small, so low becomes three. The next midpoint holds sixteen, so high becomes three. Index three holds twelve and is returned.",
    secondTitle: "Make the empty interval mean not found", secondIntro: "Moving past the midpoint is essential because that midpoint was inspected and ruled out.",
    secondCode: `tests = [
    ([], 4),
    ([7], 7),
    ([7], 3),
    ([1, 4, 9, 15], 8),
]

for values, target in tests:
    print(values, target, binary_search(values, target))`,
    secondTrace: "An empty list starts with low zero and high negative one, so the loop never runs. A missing value eventually makes low greater than high. That empty interval proves no candidate remains.",
    mistake: "Do not update low to middle or high to middle in this closed template. If one candidate remains, middle equals both endpoints and the loop can repeat forever. Exclude it with plus or minus one.",
    checkpoint: "After values at indexes zero through middle are proven smaller than the target, why is low set to middle plus one?",
    checkpointAnswer: "Every index through middle is impossible, including middle itself. Middle plus one is the first index that might still contain the target.",
    remember: "Choose an interval convention, state what can still be true inside it, and make every update remove the inspected midpoint.",
    checks: [q("When does a closed binary-search interval become empty?", ["When low is greater than high", "When low equals high", "When middle is zero"], 0, "Equal endpoints still describe one candidate.", ["Correct. No index lies in the interval.", "One index remains to inspect.", "Index zero may be a valid candidate."]), q("Why must the input be sorted?", ["One comparison can rule out a whole side", "Sorting makes every target unique", "The loop only works on even lengths"], 0, "Order gives information about uninspected values.", ["Correct. That is the halving step.", "Sorted data can contain duplicates.", "Odd and even lengths both work."])],
  },
  {
    lessonId: "py.ac.m3_2.l2", atomId: "py.atom.algo.binary-search-bounds", conceptId: "py.algo.binary-search-bounds",
    title: "Boundary search finds the first place a fact becomes true", requires: ["py.algo.binary-search-exact"],
    vocabulary: [["lower bound", "the first index whose value is at least the target"], ["upper bound", "the first index whose value is greater than the target"], ["insertion point", "an index where a value can be inserted while keeping order"], ["half-open interval", "an interval that includes low but excludes high"]],
    opening: "Finding any matching duplicate is often not enough. Boundary search finds where a sorted yes-or-no fact changes from false to true.",
    outcome: "You will implement lower and upper bounds, use them for insertion and duplicate ranges, and explain why len(values) can be correct.",
    why: "Boundary searches answer first occurrence, last occurrence, count, insertion, scheduling, and threshold questions without fragile cleanup loops.",
    mentalModel: "Picture dark tiles followed by bright tiles. Find the first bright tile: the border between the two regions.",
    firstTitle: "Find the first value at least as large", firstIntro: "Search indexes from low inclusive to high exclusive. High may equal the list length, which represents an insertion point after every item.",
    firstCode: `def lower_bound(values, target):
    low = 0
    high = len(values)
    while low < high:
        middle = low + (high - low) // 2
        if values[middle] < target:
            low = middle + 1
        else:
            high = middle
    return low

values = [2, 4, 4, 4, 9]
print(lower_bound(values, 4))
print(lower_bound(values, 7))
print(lower_bound(values, 12))`,
    firstTrace: "For target four, values smaller than four form the false region and index one is the first true position. Target seven belongs at index four. Target twelve belongs at index five, one past the final item.",
    secondTitle: "Pair lower and upper bounds", secondIntro: "Upper bound changes one comparison: values equal to the target now join the discarded left region.",
    secondCode: `def upper_bound(values, target):
    low = 0
    high = len(values)
    while low < high:
        middle = low + (high - low) // 2
        if values[middle] <= target:
            low = middle + 1
        else:
            high = middle
    return low

def equal_range(values, target):
    start = lower_bound(values, target)
    end = upper_bound(values, target)
    return start, end, end - start

print(equal_range([2, 4, 4, 4, 9], 4))
print(equal_range([2, 4, 4, 4, 9], 6))`,
    secondTrace: "Four begins at index one and ends before index four, so its half-open range is one through four and its count is three. Missing six has equal start and end indexes, so its count is zero.",
    mistake: "Check a returned index against the list length before reading it. A bound is an insertion position, not a promise of a match.",
    checkpoint: "Why does lower bound move high to middle instead of middle minus one when values[middle] is at least the target?",
    checkpointAnswer: "Middle might be the first valid position, so it must remain a candidate. The half-open interval can shrink by setting its excluded endpoint to middle.",
    remember: "Lower bound finds first value at least target. Upper bound finds first value greater than target. Their difference counts equal values.",
    checks: [q("What can lower_bound return for a list of length five?", ["Any index from zero through five", "Only zero through four", "Only indexes containing the target"], 0, "The final insertion point may follow every value.", ["Correct. Five means insert at the end.", "That omits a valid end position.", "The target may be absent."]), q("How is upper bound different?", ["Equal values move to the left discarded region", "It searches an unsorted list", "It always returns one"], 0, "The predicate becomes value greater than target.", ["Correct. It lands after all equals.", "Both searches require sorted order.", "Its result depends on the data."])],
  },
  {
    lessonId: "py.ac.m3_2.l3", atomId: "py.atom.algo.binary-search-answer", conceptId: "py.algo.binary-search-answer",
    title: "Binary search can search possible answers", requires: ["py.algo.binary-search-bounds"],
    vocabulary: [["answer space", "the ordered set of possible final answers"], ["predicate", "a function that answers true or false for one candidate"], ["monotone", "changing in one direction without switching back"], ["feasible", "meeting all rules of the problem"]],
    opening: "Sometimes there is no sorted array to search. If possible answers are ordered and feasibility changes only once, binary search can locate that boundary.",
    outcome: "You will turn optimization questions into monotone predicates, choose safe answer bounds, find the first feasible answer, and calculate total complexity.",
    why: "This pattern solves minimum speed, capacity, time, distance, and allocation problems that can look unrelated until their monotone boundary is exposed.",
    mentalModel: "Imagine testing ladder heights. Short ladders fail. Once one height works, every taller ladder works too. Binary search finds the first height in the working region.",
    firstTitle: "Find the minimum eating rate", firstIntro: "For one candidate rate, add the rounded-up hours for every pile. Larger rates can never require more time, so feasibility is monotone.",
    firstCode: `def minimum_rate(piles, hour_limit):
    def can_finish(rate):
        hours = sum((pile + rate - 1) // rate for pile in piles)
        return hours <= hour_limit

    low = 1
    high = max(piles)
    while low < high:
        middle = low + (high - low) // 2
        if can_finish(middle):
            high = middle
        else:
            low = middle + 1
    return low

print(minimum_rate([3, 6, 7, 11], 8))`,
    firstTrace: "Rate four needs one, two, two, and three hours, totaling eight, so it works. Every rate under four fails the limit. The search returns four, the first feasible rate.",
    secondTitle: "Search the minimum shipping capacity", secondIntro: "A feasibility pass greedily fills each day in order. More capacity can never increase the number of days needed.",
    secondCode: `def minimum_capacity(weights, day_limit):
    def can_ship(capacity):
        days = 1
        used = 0
        for weight in weights:
            if used + weight > capacity:
                days += 1
                used = 0
            used += weight
        return days <= day_limit

    low = max(weights)
    high = sum(weights)
    while low < high:
        middle = low + (high - low) // 2
        if can_ship(middle):
            high = middle
        else:
            low = middle + 1
    return low

print(minimum_capacity([1, 2, 3, 4, 5], 3))`,
    secondTrace: "Capacity five can ship groups one-two, three, four, and five, needing four days, so it fails. Capacity six forms one-two-three, four, and five in three days, so six is the first feasible answer.",
    mistake: "Do not binary-search a predicate that can change true, false, then true again. Also prove that low and high contain the answer; a fast search over incorrect bounds stays incorrect.",
    checkpoint: "If one shipping capacity succeeds, why can every larger capacity be placed in the successful region?",
    checkpointAnswer: "A larger capacity can copy the same day groupings and has extra room. It cannot force more days, so feasibility never switches back to false.",
    remember: "Define a monotone yes-or-no test, bound the answer, and use boundary search to find the first feasible candidate.",
    checks: [q("What property permits binary search on answers?", ["The predicate changes direction at most once", "Every candidate has the same cost", "The input list is empty"], 0, "One false-to-true boundary can be located by halving.", ["Correct. This is monotonicity.", "Costs may differ greatly.", "Useful instances contain data."]), q("If each feasibility test costs theta n, what is total time over range R?", ["Theta(n log R)", "Theta(n squared R)", "Theta(log n)"], 0, "Binary search performs logarithmically many full tests.", ["Correct. Include predicate cost.", "That overcounts both parts.", "This ignores each scan and uses the wrong range."])],
  },
  {
    lessonId: "py.ac.m3_2.l4", atomId: "py.atom.algo.binary-search-shaped", conceptId: "py.algo.binary-search-shaped",
    title: "Rotated and mountain arrays contain searchable regions", requires: ["py.algo.binary-search-answer"],
    vocabulary: [["rotated array", "a sorted array cut once and joined in reversed piece order"], ["mountain array", "values that strictly rise to one peak and then strictly fall"], ["monotone region", "a region ordered in one consistent direction"], ["peak", "a value greater than its immediate neighbors"]],
    opening: "A whole array may not be sorted. Rotated arrays still expose one sorted half. Mountain arrays expose the direction toward their peak.",
    outcome: "You will search a distinct-value rotated array, find a mountain peak, explain each discarded region, and recognize how duplicates weaken the rotated-array test.",
    why: "These shapes test whether you understand why binary search works. Ordinary sorted-array code is not enough when the invariant changes.",
    mentalModel: "A rotated array is a ramp cut and moved. A mountain has one uphill side and one downhill side. Inspect the shape before discarding a region.",
    firstTitle: "Search a rotated sorted array", firstIntro: "With distinct values, at least one half around the midpoint is normally sorted. Check whether the target lies inside that half's value range.",
    firstCode: `def search_rotated(values, target):
    low, high = 0, len(values) - 1
    while low <= high:
        middle = low + (high - low) // 2
        if values[middle] == target:
            return middle
        if values[low] <= values[middle]:
            if values[low] <= target < values[middle]:
                high = middle - 1
            else:
                low = middle + 1
        else:
            if values[middle] < target <= values[high]:
                low = middle + 1
            else:
                high = middle - 1
    return -1

print(search_rotated([6, 7, 8, 1, 2, 3, 4], 2))`,
    firstTrace: "The first midpoint holds one. The right side from one through four is sorted and contains two, so the search keeps it. The next midpoint finds two.",
    secondTitle: "Walk uphill to the mountain peak", secondIntro: "Compare middle with its right neighbor. A rising step means the peak is farther right. A falling step means middle could be the peak.",
    secondCode: `def mountain_peak_index(values):
    low = 0
    high = len(values) - 1
    while low < high:
        middle = low + (high - low) // 2
        if values[middle] < values[middle + 1]:
            low = middle + 1
        else:
            high = middle
    return low

mountain = [1, 3, 7, 12, 9, 4, 2]
peak = mountain_peak_index(mountain)
print(peak, mountain[peak])`,
    secondTrace: "A rising comparison proves middle is not the peak and every point through middle lies before it. A falling comparison keeps middle because it might be the peak. Both bounds meet at index three, value twelve.",
    mistake: "Equal values can hide which rotated side is sorted. Equal endpoints may need cautious shrinking, causing linear worst-case time.",
    checkpoint: "Why does a falling step in the mountain search set high to middle rather than middle minus one?",
    checkpointAnswer: "Middle might be the peak because it beats its right neighbor. The peak cannot be farther right, but middle must remain a candidate.",
    remember: "Use the array's shape as evidence: identify a sorted rotated half, or follow the mountain's slope while preserving the possible peak.",
    checks: [q("In a distinct rotated array, what does each step identify?", ["A sorted half that can be range-checked", "The final answer without comparisons", "Two equal halves"], 0, "One ordered side provides the elimination rule.", ["Correct. Keep or discard it using target range.", "Several steps may be needed.", "Distinct values do not imply equal halves."]), q("During mountain peak search, what does a rising step prove?", ["The peak lies to the right of middle", "Middle is the final peak", "The array has no peak"], 0, "The next value is larger, so middle cannot be the maximum.", ["Correct. Remove indexes through middle.", "A larger neighbor disproves that.", "A valid mountain has a peak."])],
  },
];

export const ALGO_BINARY_SEARCH_ATOMS = SPECS.map(guidedMasteryAtom);
export const ALGO_BINARY_SEARCH_CONCEPTS = SPECS.map(guidedMasteryConcept);
export const ALGO_BINARY_SEARCH_LESSON_CONTENT = guidedLessonContent(SPECS);

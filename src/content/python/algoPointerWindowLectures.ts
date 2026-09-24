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

const ALGO_POINTER_WINDOW_SPECS: GuidedMasterySpec[] = [
  {
    lessonId: "py.ac.m2_3.l1",
    atomId: "py.atom.algo.opposing-pointers-guided",
    conceptId: "py.algo.opposing-pointers-guided",
    title: "Opposing pointers remove impossible pairs",
    requires: ["py.algo.set-operations-guided", "py.two-pointers"],
    vocabulary: [
      ["pointer", "an index used to track a meaningful position in a sequence"],
      ["opposing pointers", "two indices that begin at opposite ends and move toward each other"],
      ["sorted invariant", "the promise that values never decrease as indices increase"],
      ["elimination", "proving that a group of candidates cannot be an answer"],
    ],
    opening: "Two pointers work when one comparison proves what to discard. In sorted data, a small sum clears the smallest remaining value.",
    outcome: "You will be able to solve a sorted pair-sum problem, justify each pointer move, and state the invariant that prevents skipped answers.",
    why: "A brute-force pair scan checks about n squared combinations. Sorted order lets one comparison eliminate a whole row of pairs, reducing the scan to linear time.",
    mentalModel: "Picture suspects arranged by height, with one marker at each end. A small measurement clears the shortest remaining suspect from every pairing.",
    firstTitle: "Find a target pair in a sorted list",
    firstIntro: "Compare the two boundary values. Move left when the sum is too small and right when it is too large.",
    firstCode: `def pair_sum_sorted(values, target):
    left = 0
    right = len(values) - 1

    while left < right:
        total = values[left] + values[right]
        if total == target:
            return left, right
        if total < target:
            left += 1
        else:
            right -= 1
    return None

print(pair_sum_sorted([1, 3, 4, 6, 8, 10], 14))`,
    firstTrace: "One plus ten is too small, so move left. Three plus ten is also small, so move left again. Four plus ten equals fourteen, returning indices two and five.",
    secondTitle: "See why the sort promise matters",
    secondIntro: "Sorting a copy can enable the pattern when original indices are not required. The sorting cost then dominates the linear scan.",
    secondCode: `def has_pair_sum(values, target):
    ordered = sorted(values)
    return pair_sum_sorted(ordered, target) is not None

print(has_pair_sum([8, 1, 6, 3], 9))
print(has_pair_sum([8, 1, 6, 3], 20))`,
    secondTrace: "The copy becomes `[1,3,6,8]`. One and eight find nine. No pair finds twenty. Sorting costs theta n log n; the pointer scan costs theta n. Original positions would need extra information.",
    mistake: "Do not move a pointer because the pattern feels familiar. State what sorted order proves. On unsorted data, a small sum does not prove that advancing left removes only impossible pairs.",
    checkpoint: "The current sorted pair sums to more than the target. Which pointer moves, and what candidates does that safely eliminate?",
    checkpointAnswer: "Move the right pointer left. The current right value is the largest remaining value. Pairing it with any value at or after left cannot produce a smaller sum than the current left pairing, so it cannot hit the lower target.",
    remember: "Opposing pointers work when order turns one comparison into a proof that an entire boundary group is impossible.",
    checks: [
      q("Why move left after a sum is too small?", ["The smallest remaining value cannot work with any smaller partner", "Left pointers always move first", "The array will become sorted"], 0, "Sorted order proves the elimination.", ["Correct. Advancing removes only impossible pairs.", "The comparison decides which pointer moves.", "Pointer motion does not sort data."]),
      q("What is the scan time after data is sorted?", ["Theta n", "Theta n squared", "Theta log n"], 0, "Each pointer moves inward at most n positions.", ["Correct. There are at most a linear number of moves.", "No pair is revisited in a nested loop.", "The search halves nothing at each step."]),
    ],
  },
  {
    lessonId: "py.ac.m2_3.l2",
    atomId: "py.atom.algo.read-write-pointers",
    conceptId: "py.algo.read-write-pointers",
    title: "Read and write pointers compact in place",
    requires: ["py.algo.opposing-pointers-guided"],
    vocabulary: [
      ["read pointer", "the index inspecting the next input value"],
      ["write pointer", "the index where the next kept value belongs"],
      ["compaction", "moving kept values together while discarding gaps"],
      ["processed prefix", "the front region whose final contents are already correct"],
    ],
    opening: "Opposing pointers compare two ends. Same-direction pointers have different jobs: read inspects every original value, while write grows a clean result in the front of the same array.",
    outcome: "You will be able to remove unwanted values and deduplicate sorted data in place while stating exactly what the processed prefix contains.",
    why: "Read-write compaction appears in filtering, partitioning, file parsing, array cleanup, and interview contracts that require constant extra space.",
    mentalModel: "Imagine a conveyor belt. An inspector reads every object. A packer places only approved objects into consecutive boxes at the front. The packer never moves ahead of the inspector.",
    firstTitle: "Keep only values that pass a test",
    firstIntro: "Before each read, positions before write contain exactly the kept values from the processed input.",
    firstCode: `def remove_zeros(values):
    write = 0
    for read in range(len(values)):
        if values[read] != 0:
            values[write] = values[read]
            write += 1
    return write

numbers = [0, 4, 0, 2, 3, 0]
kept = remove_zeros(numbers)
print(kept, numbers[:kept])`,
    firstTrace: "Read skips the first zero. Four is written at position zero. Two is written at one, and three at two. Write ends at three, so only the prefix `[4,2,3]` belongs to the compacted result.",
    secondTitle: "Deduplicate a sorted list",
    secondIntro: "Sorted duplicates sit together. Compare each read value with the last value already kept.",
    secondCode: `def deduplicate_sorted(values):
    if not values:
        return 0
    write = 1
    for read in range(1, len(values)):
        if values[read] != values[write - 1]:
            values[write] = values[read]
            write += 1
    return write

numbers = [1, 1, 2, 2, 2, 5]
length = deduplicate_sorted(numbers)
print(numbers[:length])`,
    secondTrace: "One starts the kept prefix. The next one matches it and is skipped. Two differs and is written once. Repeated twos are skipped. Five is written, producing `[1,2,5]`.",
    mistake: "Do not assume values after the returned write length are meaningful. They are leftover storage. Also do not use adjacent-duplicate logic on unsorted data unless repeated values are guaranteed to be adjacent.",
    checkpoint: "During filtering, write equals four and read equals seven. What does the region before write promise, and what does the gap through read mean?",
    checkpointAnswer: "Indices zero through three contain the final kept values from processed input. Positions from write through read may contain stale or rejected data and are not part of the current result.",
    remember: "Read visits every candidate. Write advances only for kept values. The prefix before write is always the correct compacted result so far.",
    checks: [
      q("When does the write pointer advance during filtering?", ["Only when a value is kept", "On every read", "Only for rejected values"], 0, "Write measures result length.", ["Correct. Each advance claims one output slot.", "Read advances for every input value.", "Rejected values create no output."]),
      q("What should callers use after in-place compaction?", ["The prefix ending at returned length", "Every original array slot", "Only the final slot"], 0, "The remaining suffix may contain stale values.", ["Correct. The returned length defines valid output.", "Old suffix contents are not promised.", "The result may contain many values."]),
    ],
  },
  {
    lessonId: "py.ac.m2_3.l3",
    atomId: "py.atom.algo.fixed-window-guided",
    conceptId: "py.algo.fixed-window-guided",
    title: "A fixed window reuses almost all of its work",
    requires: ["py.algo.read-write-pointers", "py.sliding-window"],
    vocabulary: [
      ["window", "one contiguous span of a sequence"],
      ["fixed-size window", "a span whose length stays constant while its position changes"],
      ["running aggregate", "a summary updated as the window moves"],
      ["outgoing value", "the value leaving the window during a slide"],
    ],
    opening: "Neighboring fixed windows share almost every value. Recomputing each window from scratch repeats work. Instead, remove the one outgoing value and add the one incoming value.",
    outcome: "You will be able to compute fixed-length sums and averages in linear time, place boundaries correctly, and handle invalid window sizes.",
    why: "Fixed windows solve moving averages, maximum sums, repeated measurements, packet statistics, and substring checks. The same update idea works for counts and other removable summaries.",
    mentalModel: "Picture a frame covering three train cars. Slide the frame one car right. Only the old left car exits and one new right car enters; the middle cars do not need to be counted again.",
    firstTitle: "Find the largest sum of length k",
    firstIntro: "Build the first window once. Every later step subtracts `values[right-k]` and adds `values[right]`.",
    firstCode: `def max_sum_of_k(values, k):
    if k <= 0 or k > len(values):
        raise ValueError("invalid window size")
    window_sum = sum(values[:k])
    best = window_sum

    for right in range(k, len(values)):
        window_sum -= values[right - k]
        window_sum += values[right]
        best = max(best, window_sum)
    return best

print(max_sum_of_k([2, 1, 5, 1, 3, 2], 3))`,
    firstTrace: "The first sum is eight for `[2,1,5]`. Sliding removes two and adds one, giving seven. The next window removes one and adds three, giving nine. The last gives six. The answer is nine.",
    secondTitle: "Produce every moving average",
    secondIntro: "The window sum is reusable state. Divide it by k after each valid window is formed.",
    secondCode: `def moving_averages(values, k):
    if k <= 0 or k > len(values):
        return []
    total = sum(values[:k])
    averages = [total / k]
    for right in range(k, len(values)):
        total += values[right] - values[right - k]
        averages.append(total / k)
    return averages

print(moving_averages([1, 3, 5, 7], 2))`,
    secondTrace: "The first average is two. Replace one with five and the average becomes four. Replace three with seven and it becomes six. Every value enters once and leaves once, so total time is theta n.",
    mistake: "Do not subtract the wrong outgoing index. When right is the new incoming index for a size-k window, the outgoing index is `right - k`. Draw one small index example before coding.",
    checkpoint: "A size-four window receives the value at index nine. Which index leaves, and what are the new inclusive window boundaries?",
    checkpointAnswer: "Index five leaves because nine minus four is five. After the update, the window covers indices six through nine, which contains exactly four values.",
    remember: "A fixed window pays once for the first span, then updates by removing one outgoing value and adding one incoming value.",
    checks: [
      q("Why is the fixed-window scan theta n?", ["Each value enters and leaves at most once", "Every window is summed from scratch", "The input is sorted"], 0, "Constant work updates each slide.", ["Correct. Shared work is reused.", "That would cost theta n times k.", "Sorting is not required."]),
      q("When right enters a size-k window, which index leaves?", ["right - k", "right - 1", "k - right"], 0, "The previous window began k positions behind the incoming index.", ["Correct. This preserves size k.", "That removes a value still inside most windows.", "This is usually negative."]),
    ],
  },
  {
    lessonId: "py.ac.m2_3.l4",
    atomId: "py.atom.algo.variable-window-guided",
    conceptId: "py.algo.variable-window-guided",
    title: "A variable window restores one invariant",
    requires: ["py.algo.fixed-window-guided"],
    vocabulary: [
      ["variable-size window", "a contiguous span whose length grows and shrinks"],
      ["valid window", "a span that satisfies the problem's required condition"],
      ["monotone condition", "a rule repaired by moving one boundary in one direction"],
      ["shrink loop", "advancing left until the window is valid again"],
    ],
    opening: "A variable window grows right to explore and moves left when its rule breaks. The key question is whether shrinking reliably repairs the violation.",
    outcome: "You will find a shortest positive-number subarray, state its invariant, and recognize when negative values break the method.",
    why: "Variable windows solve longest-valid and shortest-satisfying contiguous ranges. Their linear time comes from boundary movement, not from avoiding a loop inside a loop.",
    mentalModel: "Imagine a belt around consecutive boxes. Add boxes until the load is enough. Tighten from the left while the goal still holds.",
    firstTitle: "Find the shortest sum at least target",
    firstIntro: "This version requires positive numbers. Adding right can only increase the sum, and removing left can only decrease it.",
    firstCode: `def shortest_sum_at_least(values, target):
    left = 0
    total = 0
    best = len(values) + 1

    for right, value in enumerate(values):
        total += value
        while total >= target:
            best = min(best, right - left + 1)
            total -= values[left]
            left += 1
    return 0 if best == len(values) + 1 else best

print(shortest_sum_at_least([2, 3, 1, 2, 4, 3], 7))`,
    firstTrace: "The window grows until its sum reaches seven. Record each valid length, then move left to test a shorter span. `[4,3]` gives the best length, two.",
    secondTitle: "See the positivity requirement",
    secondIntro: "With negative values, removing the left value can increase the sum. The repair direction is no longer predictable.",
    secondCode: `positive_values = [2, 3, 1, 2, 4, 3]
mixed_values = [2, -5, 10]

print(shortest_sum_at_least(positive_values, 7))
print("mixed data needs a different pattern", mixed_values)`,
    secondTrace: "The positive input supports monotone growth and shrink behavior. In mixed data, dropping negative five raises the total rather than lowering it. More advanced prefix-sum and deque methods handle that different structure.",
    mistake: "Do not assume every nested while loop is quadratic. Right moves forward at most n times, and left also moves forward at most n times. The total pointer moves are linear.",
    checkpoint: "Why does the shortest-sum window safely shrink while its sum stays at least the target when every value is positive?",
    checkpointAnswer: "Removing a positive left value always lowers the sum. Shrinking explores every shorter valid prefix of the current right boundary, and the first invalid result proves further shrinking cannot restore validity.",
    remember: "Grow to explore, shrink to restore or tighten one monotone invariant, and prove that each boundary moves only forward.",
    checks: [
      q("What makes the positive-sum condition monotone?", ["Adding raises the sum and removing lowers it", "The values are sorted", "The target changes each step"], 0, "Boundary effects have predictable directions.", ["Correct. That makes violation repair safe.", "Original order is preserved and need not be sorted.", "The target remains fixed."]),
      q("Why can a grow-and-shrink loop still be theta n?", ["Each pointer advances at most n times", "The while loop never runs", "Python combines both loops"], 0, "Count pointer moves across the full run.", ["Correct. At most two n forward moves occur.", "The shrink loop may run many times in one iteration.", "Complexity follows operations, not syntax merging."]),
    ],
  },
  {
    lessonId: "py.ac.m2_3.l5",
    atomId: "py.atom.algo.window-hash-map",
    conceptId: "py.algo.window-hash-map",
    title: "A hash map remembers what is inside the window",
    requires: ["py.algo.variable-window-guided", "py.algo.frequency-counting"],
    vocabulary: [
      ["window state", "the summary describing values currently inside a window"],
      ["last-seen index", "the most recent position where a value appeared"],
      ["frequency map", "counts of values currently inside the span"],
      ["stale position", "a saved index that lies outside the current window"],
    ],
    opening: "Some window rules depend on identity, not only a numeric sum. A map can remember counts or last positions for the exact values currently affecting the window.",
    outcome: "You will be able to find the longest substring without repeated characters, move left without going backward, and choose between counts and last-seen indices.",
    why: "Window maps solve distinct-character ranges, replacement limits, permutation checks, and bounded-frequency subarrays. They combine linear boundary movement with expected constant-time state updates.",
    mentalModel: "Picture a moving spotlight over letters and a clipboard recording each letter's latest seat. When a repeated letter appears, move the spotlight's left edge beyond the old seat—but never backward.",
    firstTitle: "Jump left using last-seen positions",
    firstIntro: "A repeated character matters only when its saved index is still inside the active window.",
    firstCode: `def longest_unique_substring(text):
    last_seen = {}
    left = 0
    best = 0

    for right, character in enumerate(text):
        if character in last_seen and last_seen[character] >= left:
            left = last_seen[character] + 1
        last_seen[character] = right
        best = max(best, right - left + 1)
    return best

print(longest_unique_substring("abba"))`,
    firstTrace: "A and b build window `ab`. The second b repeats at index two, so left jumps past the old b to index two. The final a was last seen before left, so it is stale and does not move left backward. Best length is two.",
    secondTitle: "Use frequencies when several copies are allowed",
    secondIntro: "For at most two copies of each value, counts describe validity better than one last position.",
    secondCode: `def longest_with_at_most_two(values):
    counts = {}
    left = 0
    best = 0

    for right, value in enumerate(values):
        counts[value] = counts.get(value, 0) + 1
        while counts[value] > 2:
            outgoing = values[left]
            counts[outgoing] -= 1
            left += 1
        best = max(best, right - left + 1)
    return best

print(longest_with_at_most_two([1, 2, 1, 1, 3, 2]))`,
    secondTrace: "When the third one enters, the window is invalid. Left values leave and their counts decrease until ones return to two copies. The best valid span has length five.",
    mistake: "Do not set left to `last_seen[value] + 1` without taking window position into account. A stale repeated value can sit before left. Moving left backward would reintroduce invalid old characters.",
    checkpoint: "In `abba`, why does the final a not move left back to index one after left already reached index two?",
    checkpointAnswer: "The saved a index is zero, which is outside the active window beginning at two. It is stale. Left boundaries only move forward, so that old occurrence no longer conflicts with the final a.",
    remember: "Use a map to summarize window identity. Update incoming and outgoing state, ignore stale positions, and never let left move backward.",
    checks: [
      q("When does a last-seen index force left to move?", ["It is at or after the current left boundary", "It exists anywhere in history", "It equals the text length"], 0, "Only occurrences inside the active window conflict.", ["Correct. Older positions are stale.", "History outside the window does not violate uniqueness.", "Text length is not a stored character index."]),
      q("When are frequency counts better than one last index?", ["Validity depends on allowed copy counts", "The input contains integers", "The window has fixed size"], 0, "Counts can represent limits greater than one.", ["Correct. They track how many copies remain inside.", "Both strategies handle hashable integers.", "Fixed size alone does not decide state type."]),
    ],
  },
];

export const ALGO_POINTER_WINDOW_ATOMS = ALGO_POINTER_WINDOW_SPECS.map(guidedMasteryAtom);
export const ALGO_POINTER_WINDOW_CONCEPTS = ALGO_POINTER_WINDOW_SPECS.map(guidedMasteryConcept);
export const ALGO_POINTER_WINDOW_LESSON_CONTENT = guidedLessonContent(ALGO_POINTER_WINDOW_SPECS);

import type { LectureQuestion } from "../../types";
import { guidedLessonContent, guidedMasteryAtom, guidedMasteryConcept, type GuidedMasterySpec } from "./guidedMastery";

const q = (question: string, choices: [string, string, string], answer: 0 | 1 | 2, explanation: string, why: [string, string, string]): LectureQuestion => ({ question, choices, answer, explanation, why });

const SPECS: GuidedMasterySpec[] = [
  {
    lessonId: "py.ac.m3_1.l1", atomId: "py.atom.algo.comparison-sorts", conceptId: "py.algo.comparison-sorts",
    title: "Simple comparison sorts reveal different invariants", requires: ["py.algo.lru-cache-guided"],
    vocabulary: [["comparison sort", "an ordering algorithm that learns order by comparing pairs"], ["insertion sort", "grow a sorted prefix by inserting each next value"], ["selection sort", "repeatedly choose the smallest unfinished value"], ["bubble sort", "repeatedly swap adjacent inversions"]],
    opening: "Bubble, insertion, and selection sort are quadratic baselines, but they organize work differently. Their invariants teach how to reason about more advanced sorting.",
    outcome: "You will trace all three, state each finished region, and choose insertion sort for small or nearly sorted data rather than calling every quadratic sort identical.",
    why: "Interviewers care less about memorizing three loops than recognizing swaps, shifts, adaptiveness, and write cost. Hybrid production sorts still use insertion sort on tiny runs.",
    mentalModel: "Bubble pushes large values right through neighbor swaps. Selection chooses the next winner. Insertion picks up one card and slides it into an already sorted hand.",
    firstTitle: "Grow a sorted prefix with insertion sort", firstIntro: "Before index i is processed, every value before i is sorted. Shift larger values right, then place the saved value.",
    firstCode: `def insertion_sort(values):
    for index in range(1, len(values)):
        current = values[index]
        position = index
        while position > 0 and values[position - 1] > current:
            values[position] = values[position - 1]
            position -= 1
        values[position] = current
    return values

print(insertion_sort([5, 2, 4, 3, 1]))`,
    firstTrace: "Two shifts before five and forms sorted prefix `[2,5]`. Four slides between them. Three and one repeat the process. The worst case is theta n squared, but an already sorted list needs only one comparison per item.",
    secondTitle: "Contrast selection and bubble behavior", secondIntro: "Selection minimizes swaps. Bubble can stop early after one pass with no swaps.",
    secondCode: `def selection_sort(values):
    for start in range(len(values)):
        smallest = min(range(start, len(values)), key=values.__getitem__)
        values[start], values[smallest] = values[smallest], values[start]
    return values

def bubble_sort(values):
    for end in range(len(values) - 1, 0, -1):
        swapped = False
        for index in range(end):
            if values[index] > values[index + 1]:
                values[index], values[index + 1] = values[index + 1], values[index]
                swapped = True
        if not swapped:
            break
    return values

print(selection_sort([3, 1, 2]), bubble_sort([1, 2, 3]))`,
    secondTrace: "Selection scans the unfinished suffix for each output position and performs at most one swap per position. Bubble sees no inversion in sorted input and exits after one pass.",
    mistake: "Do not choose a sort only from big-O. Insertion is adaptive and stable, selection uses few writes but is usually unstable, and bubble performs many swaps.",
    checkpoint: "Which simple sort is usually best for a tiny nearly sorted run, and why?",
    checkpointAnswer: "Insertion sort. Each value moves only across nearby inversions, so nearly sorted input produces little shifting and approaches linear time.",
    remember: "Name the invariant and data movement: insertion grows a sorted prefix, selection chooses a suffix minimum, and bubble removes adjacent inversions.",
    checks: [q("Which baseline is adaptive to nearly sorted data?", ["Insertion sort", "Selection sort", "A fixed full scan only"], 0, "Few inversions mean few insertion shifts.", ["Correct. It can approach theta n.", "Selection still scans each suffix.", "Adaptiveness allows early work reduction."]), q("Which baseline uses few swaps?", ["Selection sort", "Bubble sort", "Neither can swap"], 0, "It selects once then swaps into place.", ["Correct. It performs at most n swaps.", "Bubble may swap every inversion.", "Both can swap."])],
  },
  {
    lessonId: "py.ac.m3_1.l2", atomId: "py.atom.algo.merge-sort-guided", conceptId: "py.algo.merge-sort-guided",
    title: "Merge sort combines already sorted halves", requires: ["py.algo.comparison-sorts"],
    vocabulary: [["divide and conquer", "split a problem, solve pieces, then combine them"], ["merge", "combine sorted sequences by repeatedly taking the smaller front"], ["stable", "equal-key items keep original relative order"], ["external sort", "sorting data that does not fit in memory by merging stored runs"]],
    opening: "Merge sort makes sorting easy by postponing the hard part. Single items are sorted. Two sorted halves can be merged with one forward scan.",
    outcome: "You will implement merge sort, prove theta n log n time, preserve stability, and explain why sequential merging works well for files larger than memory.",
    why: "Merge sort gives predictable worst-case time, stable order, and sequential access. It is a foundation for linked-list sorting, external sorting, and inversion counting.",
    mentalModel: "Picture two sorted lines of cards. Compare only the two front cards, move the smaller one to output, and repeat. No card behind a larger front can be smaller.",
    firstTitle: "Merge two sorted sequences", firstIntro: "Take from the left on equality to preserve the original cross-half order.",
    firstCode: `def merge(left, right):
    result = []
    i = j = 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            result.append(left[i]); i += 1
        else:
            result.append(right[j]); j += 1
    result.extend(left[i:])
    result.extend(right[j:])
    return result

print(merge([1, 4, 7], [2, 3, 8]))`,
    firstTrace: "Compare only the two fronts. One leaves, then two, three, four, seven, and eight. Every value is read once. Choosing left on equality preserves stable order.",
    secondTitle: "Sort by splitting to single items", secondIntro: "Each recursive level merges all n values, and there are about log n levels.",
    secondCode: `def merge_sort(values):
    if len(values) <= 1:
        return values[:]
    middle = len(values) // 2
    left = merge_sort(values[:middle])
    right = merge_sort(values[middle:])
    return merge(left, right)

print(merge_sort([7, 2, 5, 1, 9, 3]))`,
    secondTrace: "The list splits until each piece has one value. Merges rebuild sorted pairs, then larger sorted runs. Theta n work per level across theta log n levels gives theta n log n time and theta n auxiliary output space.",
    mistake: "Do not claim merge sort is in-place merely because recursive calls reuse the name. This list version creates slices and result lists. Also use left-first equality if stability matters.",
    checkpoint: "Why does each merge-sort level perform theta n total merge work rather than theta n per subproblem?",
    checkpointAnswer: "Subproblems on one level are disjoint and their lengths sum to n. Each value participates in one merge at that level, so combined work is theta n.",
    remember: "Split to trivial sorted pieces, merge with one forward pass, and multiply linear work per level by logarithmic levels.",
    checks: [q("What makes merge stable?", ["Take from the left half on equal keys", "Reverse each half", "Choose randomly on equality"], 0, "The left item occurred first in original order.", ["Correct. Equal relative order is preserved.", "Reversal destroys order.", "Random choice is not stable."]), q("What is merge sort's worst-case time?", ["Theta n log n", "Theta n squared", "Theta one"], 0, "Every level scans n values across log n levels.", ["Correct. Input order does not change the bound.", "That describes simple baselines.", "All values must be processed."])],
  },
  {
    lessonId: "py.ac.m3_1.l3", atomId: "py.atom.algo.quick-sort-guided", conceptId: "py.algo.quick-sort-guided",
    title: "Quick sort partitions around a pivot", requires: ["py.algo.merge-sort-guided"],
    vocabulary: [["pivot", "a chosen value used to divide smaller and larger items"], ["partition", "rearrange values into regions relative to the pivot"], ["balanced partition", "a split with similarly sized sides"], ["worst case", "the most expensive valid input and pivot behavior"]],
    opening: "Quick sort places a pivot into its final position, then sorts values on each side. Balanced pivots create logarithmic depth. Repeated extreme pivots create quadratic work.",
    outcome: "You will trace in-place partitioning, connect pivot quality to recursion depth, and state expected versus worst-case complexity honestly.",
    why: "Quick sort is cache-friendly and often fast in practice. Its partition operation also powers quickselect and many grouping problems.",
    mentalModel: "Choose one height as a fence. Move shorter people before it and taller people after it. The fence is final, but each side still needs its own ordering.",
    firstTitle: "Partition one region in place", firstIntro: "Use the last value as pivot. Boundary marks where the next value no greater than pivot belongs.",
    firstCode: `def partition(values, low, high):
    pivot = values[high]
    boundary = low
    for scan in range(low, high):
        if values[scan] <= pivot:
            values[boundary], values[scan] = values[scan], values[boundary]
            boundary += 1
    values[boundary], values[high] = values[high], values[boundary]
    return boundary

values = [4, 1, 6, 3, 2]
position = partition(values, 0, len(values) - 1)
print(values, position)`,
    firstTrace: "The pivot is two. Only one moves into the small region. Finally two swaps into boundary index one. Every value before it is no greater, and every value after it is greater.",
    secondTitle: "Recurse on both unfinished sides", secondIntro: "Only regions with at least two values need work.",
    secondCode: `def quick_sort(values, low=0, high=None):
    if high is None:
        high = len(values) - 1
    if low < high:
        pivot_index = partition(values, low, high)
        quick_sort(values, low, pivot_index - 1)
        quick_sort(values, pivot_index + 1, high)
    return values

print(quick_sort([8, 3, 1, 7, 0, 10, 2]))`,
    secondTrace: "Each partition finalizes one pivot. Balanced splits yield expected theta n log n work. Choosing an extreme pivot in already ordered data with this fixed strategy can create depth n and theta n squared time.",
    mistake: "Do not promise O(n log n) worst case for ordinary quick sort. Randomized or robust pivot selection improves expected behavior, but an adversarial split can still be quadratic.",
    checkpoint: "Why does repeatedly choosing the smallest remaining pivot create theta n squared work?",
    checkpointAnswer: "Each partition leaves one empty side and a side only one item smaller. Work becomes n plus n minus one plus the remaining sizes, a quadratic arithmetic sum.",
    remember: "Partition finalizes a pivot. Balanced split depth gives expected n log n; repeated one-sided splits give quadratic worst case.",
    checks: [q("What is guaranteed after partition?", ["The pivot is in final position", "Both sides are fully sorted", "Every value is equal"], 0, "Only region membership is established.", ["Correct. Recursive calls sort the sides.", "Sides still need sorting.", "Values may differ."]), q("What causes quick sort's worst case?", ["Repeated highly unbalanced partitions", "Using comparisons", "Having any duplicate"], 0, "Depth approaches n instead of log n.", ["Correct. Work repeats on almost the whole region.", "All comparison sorts compare.", "Duplicates can be handled with suitable partitioning."])],
  },
  {
    lessonId: "py.ac.m3_1.l4", atomId: "py.atom.algo.noncomparison-sorts", conceptId: "py.algo.noncomparison-sorts",
    title: "Non-comparison sorts exploit restricted keys", requires: ["py.algo.quick-sort-guided"],
    vocabulary: [["counting sort", "count each integer key in a limited range"], ["radix sort", "stably sort one digit position at a time"], ["bucket sort", "distribute values into ranges, sort buckets, then concatenate"], ["key range", "the span of possible key values"]],
    opening: "The n log n comparison lower bound applies when order is learned only through comparisons. Restricted integer digits or ranges provide extra structure that can beat it.",
    outcome: "You will implement counting and radix sort, identify their assumptions, and compare time in terms of n, key range, and digit count.",
    why: "IDs, ages, fixed-width integers, and bounded scores can be sorted faster than general objects. The trade is extra memory and stronger key assumptions.",
    mentalModel: "Instead of comparing cards, place each card into a labeled box. Reading boxes in label order reveals the ordering because labels already encode rank.",
    firstTitle: "Count bounded integer keys", firstIntro: "Allocate one count per possible value, tally input, then emit each value its counted number of times.",
    firstCode: `def counting_sort(values):
    if not values:
        return []
    smallest, largest = min(values), max(values)
    counts = [0] * (largest - smallest + 1)
    for value in values:
        counts[value - smallest] += 1
    return [
        value
        for offset, count in enumerate(counts)
        for value in [offset + smallest] * count
    ]

print(counting_sort([4, -1, 2, 4, 0, -1]))`,
    firstTrace: "Offsets let negative one map to count index zero. Tallying costs theta n. Reading the count array costs theta k for range size k, so total time and extra space depend on n plus k.",
    secondTitle: "Sort integers by stable digits", secondIntro: "Least-significant-digit radix sort repeats a stable bucket pass for ones, tens, and later positions.",
    secondCode: `def radix_sort(values):
    result = values[:]
    place = 1
    maximum = max(result, default=0)
    while maximum // place:
        buckets = [[] for _ in range(10)]
        for value in result:
            buckets[(value // place) % 10].append(value)
        result = [value for bucket in buckets for value in bucket]
        place *= 10
    return result

print(radix_sort([170, 45, 75, 90, 802, 24, 2, 66]))`,
    secondTrace: "The ones pass groups by final digit while preserving order within buckets. Tens and hundreds passes build on that stability. For d digits and base b, time is theta d times n plus b.",
    mistake: "Do not call counting sort linear without naming key range. If values span billions, the count array is impractical. Radix also needs a deliberate plan for negatives and representation width.",
    checkpoint: "When can counting sort be worse than n log n comparison sorting?",
    checkpointAnswer: "When the key range k is enormous compared with n. Counting sort spends theta k time and space even if only a few keys appear.",
    remember: "Extra key structure can beat comparisons, but include range, digits, base, memory, and stability in the complexity claim.",
    checks: [q("What is counting sort time?", ["Theta(n + key range)", "Always theta n only", "Theta log n"], 0, "Both input and count array are processed.", ["Correct. Range size matters.", "That hides the count-array scan.", "All values must be read."]), q("Why must radix digit passes be stable?", ["Later digit passes must preserve ordering from earlier digits", "Stability reduces key range", "Digits cannot repeat"], 0, "Lower-digit order remains meaningful within equal higher digits.", ["Correct. Otherwise earlier work is destroyed.", "Range is unchanged.", "Repeated digits are common."])],
  },
  {
    lessonId: "py.ac.m3_1.l5", atomId: "py.atom.algo.quickselect-guided", conceptId: "py.algo.quickselect-guided",
    title: "Quickselect partitions only the useful side", requires: ["py.algo.noncomparison-sorts"],
    vocabulary: [["selection", "finding an item by rank without fully sorting"], ["kth smallest", "the value that would occupy sorted index k minus one"], ["quickselect", "partition repeatedly only on the side containing the target rank"], ["expected linear", "average theta n time under suitable pivot behavior"]],
    opening: "Finding one rank does not require sorting every value. Partition tells which side contains the target. Quickselect discards the other side permanently.",
    outcome: "You will implement iterative quickselect, handle rank indexing, and distinguish its expected linear time from quadratic worst case.",
    why: "Selection powers medians, percentiles, top-k boundaries, and robust statistics. Avoiding unnecessary full order can save work and memory.",
    mentalModel: "Ask a crowd to stand around one pivot height. If the target rank is left, ignore everyone right. Repeat only inside the surviving group.",
    firstTitle: "Find a zero-based target position", firstIntro: "Reuse partition. Compare the pivot's final index with the desired sorted index.",
    firstCode: `def partition_for_selection(values, low, high):
    pivot = values[high]
    boundary = low
    for scan in range(low, high):
        if values[scan] <= pivot:
            values[boundary], values[scan] = values[scan], values[boundary]
            boundary += 1
    values[boundary], values[high] = values[high], values[boundary]
    return boundary
def quickselect(values, target_index):
    low, high = 0, len(values) - 1
    while low <= high:
        pivot_index = partition_for_selection(values, low, high)
        if pivot_index == target_index:
            return values[pivot_index]
        if target_index < pivot_index:
            high = pivot_index - 1
        else:
            low = pivot_index + 1
    raise IndexError("rank outside values")
numbers = [7, 2, 9, 1, 5, 3]
print(quickselect(numbers, 2))`,
    firstTrace: "Target index two means third smallest. Each partition finalizes one pivot. If it lands too far right, only the left region survives; if too far left, only the right survives. The answer is three.",
    secondTitle: "Wrap one-based kth-smallest input", secondIntro: "Validate k, copy when mutation is not allowed, then convert k to index k minus one.",
    secondCode: `def kth_smallest(values, k):
    if not 1 <= k <= len(values):
        raise ValueError("k outside valid ranks")
    work = values[:]
    return quickselect(work, k - 1)

original = [10, 4, 8, 2, 6]
print(kth_smallest(original, 4), original)`,
    secondTrace: "Fourth smallest converts to target index three and returns eight. Copying preserves the caller's original list. Without the copy, partitioning would rearrange it.",
    mistake: "Do not mix one-based rank with zero-based index. Do not promise worst-case linear time for basic quickselect; repeated extreme pivots can still create theta n squared work.",
    checkpoint: "Why is quickselect expected faster than sorting when only one rank is needed?",
    checkpointAnswer: "After partition, it explores only the side containing the target instead of recursively ordering both sides. With balanced-enough pivots, remaining work forms a shrinking geometric sum of theta n.",
    remember: "Partition, compare pivot index with target rank, discard one whole side, and state expected linear versus quadratic worst-case time.",
    checks: [q("What target index represents the fifth smallest value?", ["4", "5", "6"], 0, "One-based k converts to k minus one.", ["Correct. Zero-based index four is fifth position.", "That is the sixth position.", "That is seventh position."]), q("Does quickselect fully sort the list?", ["No", "Always", "Only for odd lengths"], 0, "It establishes enough partition order to find one rank.", ["Correct. Other regions may remain unsorted.", "Full ordering is unnecessary.", "Length parity does not change this."])],
  },
  {
    lessonId: "py.ac.m3_1.l6", atomId: "py.atom.algo.sort-keys-comparators", conceptId: "py.algo.sort-keys-comparators",
    title: "Sort keys express the intended ordering", requires: ["py.algo.quickselect-guided"],
    vocabulary: [["sort key", "a value computed for each item and compared during sorting"], ["lexicographic", "compare tuple fields from first to last until they differ"], ["comparator", "a function deciding pairwise order"], ["total order", "a consistent ordering where every pair can be placed"]],
    opening: "Real records rarely sort by their whole object. A key turns each record into the exact ordering rule: primary field, tie-breaker, direction, and normalization.",
    outcome: "You will build tuple keys, mix ascending and descending numeric rules, use comparators only when needed, and avoid inconsistent ordering.",
    why: "Correct keys simplify scheduling, ranking, interval processing, reports, and interview problems. Many algorithm bugs are actually underspecified tie-break rules.",
    mentalModel: "Picture attaching a sorting label to every record. The machine compares labels from left to right. A complete label resolves every meaningful tie.",
    firstTitle: "Use a tuple for primary and tie-break fields", firstIntro: "Sort higher score first by negating numeric score, then earlier name alphabetically.",
    firstCode: `students = [
    {"name": "Mia", "score": 90},
    {"name": "Ava", "score": 95},
    {"name": "Noah", "score": 90},
]

ranked = sorted(students, key=lambda item: (-item["score"], item["name"]))
print([(item["name"], item["score"]) for item in ranked])`,
    firstTrace: "Negative score makes 95 compare before 90 while the outer sort stays ascending. Equal scores then compare names, placing Mia before Noah. The tuple states the complete rule.",
    secondTitle: "Use a comparator for pair-dependent rules", secondIntro: "A comparator can order version strings by numeric components when a direct reusable key is inconvenient.",
    secondCode: `from functools import cmp_to_key

def compare_versions(left, right):
    a = [int(part) for part in left.split(".")]
    b = [int(part) for part in right.split(".")]
    length = max(len(a), len(b))
    a += [0] * (length - len(a))
    b += [0] * (length - len(b))
    return (a > b) - (a < b)

versions = ["1.10", "1.2", "1.2.1", "2"]
print(sorted(versions, key=cmp_to_key(compare_versions)))`,
    secondTrace: "Numeric components make 1.10 larger than 1.2, unlike plain string comparison. Missing components are padded with zero. The comparator returns negative, zero, or positive consistently.",
    mistake: "Do not create contradictory comparators. If A precedes B and B precedes C, A must precede C. Prefer keys because they are easier to test and computed once per item.",
    checkpoint: "How would you sort tasks by earliest deadline, then highest priority, then insertion ID?",
    checkpointAnswer: "Use key `(deadline, -priority, insertion_id)` when priority is numeric. It makes every direction and tie-break explicit and produces deterministic order.",
    remember: "Translate the contract into a complete key. Use tuple fields for tie-breaks and reserve comparators for truly pair-dependent ordering.",
    checks: [q("How does a tuple key compare?", ["Field by field from first difference", "By tuple length only", "Randomly"], 0, "Earlier fields have higher priority.", ["Correct. Later fields break ties.", "Equal-length tuples can order differently.", "Sorting must be deterministic under a fixed rule."]), q("Why prefer keys over comparators in Python?", ["They are simpler and usually computed once per item", "Comparators cannot compare", "Keys require no ordering rule"], 0, "Decorate-sort-undecorate is efficient and clear.", ["Correct. Keys expose ordering data directly.", "Comparators can compare but add complexity.", "The key is the ordering rule."])],
  },
  {
    lessonId: "py.ac.m3_1.l7", atomId: "py.atom.algo.sort-stability-guided", conceptId: "py.algo.sort-stability-guided",
    title: "Stable sorting preserves meaningful ties", requires: ["py.algo.sort-keys-comparators"],
    vocabulary: [["stability", "equal-key items keep their original relative order"], ["tie", "two items with equal sort keys"], ["multi-pass sorting", "stable sorts applied from least important key to most important"], ["decorate", "attach original position or keys before sorting"]],
    opening: "A sort can produce correct key order while silently scrambling equal-key records. Stability preserves information already encoded in their input order.",
    outcome: "You will test stability, use stable multi-pass sorting, and add original indices when an unstable tool must preserve ties.",
    why: "Stability matters in reports, event streams, ranking stages, database results, and pipelines that sort by several fields at different times.",
    mentalModel: "Picture people grouped by shirt color. A stable sort moves color groups but keeps each group's arrival line unchanged.",
    firstTitle: "Use Python's stable sort in two passes", firstIntro: "Sort the least important field first, then the most important field. The second stable pass preserves earlier tie order.",
    firstCode: `records = [
    ("Ava", "B", 2),
    ("Mia", "A", 3),
    ("Noah", "B", 1),
    ("Liam", "A", 1),
]

records.sort(key=lambda item: item[2])
records.sort(key=lambda item: item[1])
print(records)`,
    firstTrace: "The first pass orders numeric priority. The second groups by letter. Inside each letter tie, the stable second pass preserves the numeric order created first.",
    secondTitle: "Decorate with original position", secondIntro: "Adding the index as a final key makes tie behavior explicit even when the sorting tool itself is unstable.",
    secondCode: `values = [("first", 5), ("second", 3), ("third", 5)]
decorated = [((value, index), name) for index, (name, value) in enumerate(values)]
decorated.sort(key=lambda item: item[0])
result = [(name, key[0]) for key, name in decorated]
print(result)`,
    secondTrace: "The value three comes first. The two value-five items use original indices zero and two as tie-breakers, so first remains before third.",
    mistake: "Do not assume stability changes unequal-key ordering. It promises only relative order among equal keys. Also apply stable multi-pass sorts from least important field to most important.",
    checkpoint: "Why must a stable multi-pass sort process the least important key first?",
    checkpointAnswer: "The later most-important pass forms primary groups. Stability preserves the order already created by the less-important pass inside each primary-key tie.",
    remember: "Stability preserves tie order. Use it deliberately in multi-stage pipelines or add original position as an explicit final key.",
    checks: [q("What does stable sorting guarantee?", ["Equal-key items keep relative order", "The algorithm is always O(n)", "Every key is unique"], 0, "Only ties receive the stability promise.", ["Correct. Existing tie order survives.", "Time complexity is separate.", "Stability matters because ties can exist."]), q("Which key is sorted first in stable multi-pass sorting?", ["Least important", "Most important", "A random key"], 0, "Later stable passes preserve earlier tie order.", ["Correct. Finish with the primary key.", "That order would let a later minor key dominate.", "The priority order is deliberate."])],
  },
];

export const ALGO_SORTING_ATOMS = SPECS.map(guidedMasteryAtom);
export const ALGO_SORTING_CONCEPTS = SPECS.map(guidedMasteryConcept);
export const ALGO_SORTING_LESSON_CONTENT = guidedLessonContent(SPECS);

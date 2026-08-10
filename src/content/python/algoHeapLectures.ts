import type { LectureQuestion } from "../../types";
import { guidedLessonContent, guidedMasteryAtom, guidedMasteryConcept, type GuidedMasterySpec } from "./guidedMastery";

const q = (question: string, choices: [string, string, string], answer: 0 | 1 | 2, explanation: string, why: [string, string, string]): LectureQuestion => ({ question, choices, answer, explanation, why });

const SPECS: GuidedMasterySpec[] = [
  {
    lessonId: "py.ac.m4_3.l1", atomId: "py.atom.algo.binary-heap", conceptId: "py.algo.binary-heap",
    title: "A binary heap stores a complete tree inside an array", requires: ["py.algo.bst-ranges"],
    vocabulary: [["binary heap", "a complete binary tree that obeys an extreme-at-parent rule"], ["min-heap", "every parent is no greater than its children"], ["complete tree", "every level is full except possibly the last, which fills left to right"], ["sift up", "swap a new value toward the root until order is restored"], ["sift down", "swap a displaced value toward a suitable child until order is restored"]],
    opening: "A heap does not fully sort its values. It keeps only enough order to make the smallest or largest value cheap to reach.",
    outcome: "You will map array indexes to tree relationships, implement sift up and sift down, and distinguish heap order from binary-search-tree order.",
    why: "Heaps power priority queues, schedulers, top-k queries, streaming statistics, shortest paths, and efficient merging. The array layout avoids node objects and pointers.",
    mentalModel: "Picture a tournament podium. The smallest contestant stays at the top. Lower contestants are only compared with parents, so cousins may appear in any order.",
    firstTitle: "Find relatives with index arithmetic", firstIntro: "For zero-based index i, children are two-i-plus-one and two-i-plus-two. A non-root node's parent is i-minus-one divided by two.",
    firstCode: `def relationships(heap, index):
    parent = (index - 1) // 2 if index else None
    left = 2 * index + 1
    right = 2 * index + 2
    return {
        "parent": heap[parent] if parent is not None else None,
        "left": heap[left] if left < len(heap) else None,
        "right": heap[right] if right < len(heap) else None,
    }

heap = [2, 5, 4, 9, 8, 7]
print(relationships(heap, 1))`,
    firstTrace: "Index one stores five. Its parent index zero stores two. Its children at indexes three and four store nine and eight. Every parent is smaller, but four may appear after five.",
    secondTitle: "Repair one broken path", secondIntro: "Sift up compares with parents. Sift down chooses the smaller child because the new parent must beat both children.",
    secondCode: `def sift_up(heap, index):
    while index > 0:
        parent = (index - 1) // 2
        if heap[parent] <= heap[index]: break
        heap[parent], heap[index] = heap[index], heap[parent]
        index = parent

def sift_down(heap, index):
    while 2 * index + 1 < len(heap):
        child = 2 * index + 1
        if child + 1 < len(heap) and heap[child + 1] < heap[child]: child += 1
        if heap[index] <= heap[child]: break
        heap[index], heap[child] = heap[child], heap[index]
        index = child

values = [3, 5, 4, 9, 8, 7, 1]
sift_up(values, len(values) - 1)
print(values)`,
    secondTrace: "One swaps with parent four, then with root three. Only that ancestor path could be broken by appending one. A sift touches at most the tree height, which is theta log n.",
    mistake: "Do not treat a heap as a sorted array. Only parent-child order is guaranteed. Searching for an arbitrary value may still inspect theta n items.",
    checkpoint: "Why does an array heap always have logarithmic height without rotations?",
    checkpointAnswer: "Its complete-tree shape fills every level before starting another. A tree with n packed nodes therefore has about log base two n levels.",
    remember: "Completeness gives logarithmic height, index formulas replace pointers, and one sift repairs one root-to-leaf or leaf-to-root path.",
    checks: [q("Where is a min-heap's smallest value?", ["Index zero", "The final index", "Any leaf only"], 0, "Every child is no smaller than its parent.", ["Correct. The root is the global minimum.", "The final item has no special priority.", "The minimum cannot have a smaller parent."]), q("What does heap order guarantee between cousins?", ["Nothing", "They are fully sorted", "They are always equal"], 0, "Only ancestor-child comparisons are constrained.", ["Correct. This is weaker than total order.", "A heap is not a sorted array.", "Values may differ."])],
  },
  {
    lessonId: "py.ac.m4_3.l2", atomId: "py.atom.algo.heap-operations", conceptId: "py.algo.heap-operations",
    title: "Heap push and pop repair only one path", requires: ["py.algo.binary-heap"],
    vocabulary: [["priority queue", "a collection that removes the currently highest-priority item"], ["push", "add one item while preserving heap order"], ["pop", "remove the root extreme and repair the heap"], ["heapify", "rearrange an entire array into a heap"], ["amortized", "an average cost across a sequence of operations"]],
    opening: "A priority queue is an interface; a binary heap is its usual implementation. Python's heapq provides a min-heap using an ordinary list.",
    outcome: "You will use heapq push, pop, replace, and push-pop operations, explain their costs, and prove why bottom-up heapify is linear.",
    why: "Choosing the correct combined heap operation reduces work and clarifies intent. Heapify also avoids rebuilding a heap with n separate logarithmic pushes.",
    mentalModel: "Adding a guest repairs the route from one new chair upward. Removing the winner moves the final guest to the podium and repairs one route downward.",
    firstTitle: "Use Python's min-heap operations", firstIntro: "The list representation is visible, but only heapq should mutate it unless you restore the invariant yourself.",
    firstCode: `import heapq

tasks = []
for priority, name in [(3, "email"), (1, "outage"), (2, "review")]:
    heapq.heappush(tasks, (priority, name))

while tasks:
    print(heapq.heappop(tasks))`,
    firstTrace: "Tuples compare from left to right, so priority one leaves first, then two, then three. Push and pop each cost theta log n, while reading tasks at index zero costs theta one.",
    secondTitle: "Build and update without extra sifts", secondIntro: "Heapify transforms a list in place. Heapreplace pops then pushes in one repair; heappushpop pushes then pops and may return the new item immediately.",
    secondCode: `values = [9, 4, 7, 1, 6, 2]
heapq.heapify(values)
print(values[0])

removed = heapq.heapreplace(values, 5)
print(removed, values[0])

removed = heapq.heappushpop(values, 0)
print(removed, values[0])`,
    secondTrace: "Heapify makes one the root in theta n time. Heapreplace removes one and inserts five, leaving two as root. Pushing zero then popping returns zero, so the stored heap remains unchanged.",
    mistake: "Do not confuse heapreplace with heappushpop. Replace always removes the old root first. Push-pop returns the smaller of the new item and old root, which may be the new item.",
    checkpoint: "Why is bottom-up heapify theta n rather than theta n log n?",
    checkpointAnswer: "Most nodes sit near the leaves and sift only a tiny distance. Summing nodes times their possible sift heights forms a convergent weighted series proportional to n.",
    remember: "Peek is constant, push and pop are logarithmic, heapify is linear, and combined operations express different keep-or-replace behavior.",
    checks: [q("What is heapq.heapify time?", ["Theta n", "Theta n log n", "Theta one"], 0, "Most nodes have very small height.", ["Correct. Bottom-up construction is linear.", "That is the separate-push upper bound.", "Every item may need consideration."]), q("Which operation may immediately return a newly pushed small item?", ["heappushpop", "heapreplace", "heapify"], 0, "It keeps the larger side in a min-heap.", ["Correct. The heap may not change.", "Replace removes the old root first.", "Heapify adds no new item."])],
  },
  {
    lessonId: "py.ac.m4_3.l3", atomId: "py.atom.algo.heap-sort-guided", conceptId: "py.algo.heap-sort-guided",
    title: "Heap sort repeatedly fixes the next final position", requires: ["py.algo.heap-operations"],
    vocabulary: [["heap sort", "sort by building a heap and repeatedly extracting its extreme"], ["max-heap", "every parent is at least as large as its children"], ["heap boundary", "the exclusive end of the still-active heap"], ["in-place", "using only constant auxiliary storage beyond the input array"]],
    opening: "Heap sort turns the heap's cheap extreme access into a full ordering. A max-heap places the next-largest value at the shrinking right boundary.",
    outcome: "You will implement in-place heap sort, trace its active heap and sorted suffix, and compare its guarantees with merge sort and quick sort.",
    why: "Heap sort gives theta n log n worst-case time with constant auxiliary array space. Its invariant is also useful when partially ordering data.",
    mentalModel: "Build a tournament where the largest value wins the root. Move that winner to the final open podium slot, shrink the tournament, and repair the next winner.",
    firstTitle: "Sift inside a bounded max-heap", firstIntro: "The boundary prevents swaps into the sorted suffix. Choose the larger child so the parent becomes the largest local value.",
    firstCode: `def sift_down_max(values, start, end):
    root = start
    while 2 * root + 1 < end:
        child = 2 * root + 1
        if child + 1 < end and values[child + 1] > values[child]: child += 1
        if values[root] >= values[child]: return
        values[root], values[child] = values[child], values[root]
        root = child

values = [4, 10, 3, 5, 1]
for start in range(len(values) // 2 - 1, -1, -1):
    sift_down_max(values, start, len(values))
print(values)`,
    firstTrace: "Only indexes with children need an initial sift. Bottom-up repairs make ten the root. The remaining array is a max-heap, not yet sorted.",
    secondTitle: "Grow a sorted suffix", secondIntro: "Swap the root winner with the final active item, shrink the heap boundary, then repair the new root.",
    secondCode: `def heap_sort(values):
    for start in range(len(values) // 2 - 1, -1, -1):
        sift_down_max(values, start, len(values))
    for end in range(len(values) - 1, 0, -1):
        values[0], values[end] = values[end], values[0]
        sift_down_max(values, 0, end)
    return values

print(heap_sort([7, 2, 9, 1, 5, 3]))`,
    secondTrace: "Each swap fixes one largest remaining value at index end. The active prefix stays a max-heap after repair, and the suffix stays fully sorted. Total time is theta n log n.",
    mistake: "Do not call ordinary in-place heap sort stable. Equal-key items can cross during long swaps. It also has less cache-friendly access than quick sort despite stronger worst-case guarantees.",
    checkpoint: "What invariant holds before each extraction step?",
    checkpointAnswer: "The active prefix is a max-heap whose root is its largest value, and the suffix contains final sorted values greater than or equal to every active value.",
    remember: "Heapify the active region, move its root to the final open slot, shrink the boundary, and restore the heap in logarithmic time.",
    checks: [q("Why use a max-heap for ascending in-place heap sort?", ["Its root belongs at the rightmost open position", "It already stores a sorted array", "It uses no comparisons"], 0, "The largest remaining value is finalized next.", ["Correct. The suffix grows right to left.", "Only heap order is present.", "Heap construction compares values."]), q("What is heap sort worst-case time?", ["Theta n log n", "Theta n squared", "Theta log n"], 0, "There are n logarithmic repairs after linear heapify.", ["Correct. Input order does not worsen it.", "That is not required here.", "All n values must be finalized."])],
  },
  {
    lessonId: "py.ac.m4_3.l4", atomId: "py.atom.algo.heap-top-k", conceptId: "py.algo.heap-top-k",
    title: "A size-k heap remembers only the useful frontier", requires: ["py.algo.heap-sort-guided"],
    vocabulary: [["top k", "the k items with greatest score under a chosen order"], ["stream", "items arriving over time without requiring full storage"], ["frontier", "the current boundary item separating kept and discarded values"], ["bounded heap", "a heap deliberately kept at at most k items"], ["tie-breaker", "an extra field that orders equal-priority items"]],
    opening: "When only k winners matter, sorting every value performs unnecessary work. A min-heap of winners keeps the weakest winner at its root.",
    outcome: "You will find top-k values and frequent items, process a stream with theta k memory, and design deterministic tuple priorities.",
    why: "Search results, leaderboards, heavy hitters, recommendations, and monitoring dashboards often need a small best set from huge or endless input.",
    mentalModel: "There are only k chairs on stage. The weakest seated contestant waits by the door. A stronger arrival replaces that contestant; a weaker arrival is ignored.",
    firstTitle: "Keep the k largest seen so far", firstIntro: "Push until the heap has k items. Later values replace the root only when they are larger than the weakest current winner.",
    firstCode: `import heapq

def k_largest(values, k):
    if k <= 0: return []
    winners = []
    for value in values:
        if len(winners) < k:
            heapq.heappush(winners, value)
        elif value > winners[0]:
            heapq.heapreplace(winners, value)
    return sorted(winners, reverse=True)

print(k_largest([7, 1, 9, 3, 8, 2, 6], 3))`,
    firstTrace: "After the heap fills, its root is the smallest winner. Nine and eight displace weaker values. Values two and six cannot beat the final boundary seven. Time is theta n log k and space theta k.",
    secondTitle: "Rank frequent values with explicit ties", secondIntro: "Count first, then keep k tuples ordered by frequency and value. The tuple's second field makes equal-frequency behavior deterministic.",
    secondCode: `from collections import Counter

def top_frequent(values, k):
    counts = Counter(values)
    winners = []
    for value, frequency in counts.items():
        item = (frequency, value)
        if len(winners) < k: heapq.heappush(winners, item)
        elif item > winners[0]: heapq.heapreplace(winners, item)
    return [(value, frequency) for frequency, value in sorted(winners, reverse=True)]

print(top_frequent([4, 4, 2, 2, 2, 7, 7, 9], 2))`,
    secondTrace: "Two has frequency three. Four and seven tie at two, and the larger value seven wins under this stated tuple order. Production code should choose tie behavior deliberately.",
    mistake: "Do not use a max-heap of all n values when the goal is k largest; that wastes memory. The heap root should represent the easiest kept item to evict.",
    checkpoint: "Why is a min-heap useful for the k largest values?",
    checkpointAnswer: "Its root is the smallest current winner, exactly the boundary a new value must beat and the item that should be removed when a stronger value arrives.",
    remember: "Keep only k candidates, place the weakest kept candidate at the root, and state tie order, time theta n log k, and space theta k.",
    checks: [q("What does the root of a k-largest min-heap represent?", ["The weakest current winner", "The largest input ever", "A discarded item"], 0, "It is the replacement boundary.", ["Correct. New values compare with it.", "The maximum may be deeper.", "All heap items remain winners."]), q("Why is the method streaming-friendly?", ["It stores only k winners", "It revisits all old input", "It requires sorted arrivals"], 0, "Each item is processed once and may then be forgotten.", ["Correct. Memory is bounded.", "Past discarded items are unnecessary.", "Arrival order can be arbitrary."])],
  },
  {
    lessonId: "py.ac.m4_3.l5", atomId: "py.atom.algo.two-heaps", conceptId: "py.algo.two-heaps",
    title: "Two heaps keep a running median balanced", requires: ["py.algo.heap-top-k"],
    vocabulary: [["median", "the middle sorted value, or mean of the two middle values"], ["lower half", "values no greater than the current middle boundary"], ["upper half", "values no smaller than the current middle boundary"], ["max-heap simulation", "store negatives in Python's min-heap to expose the largest original value"], ["rebalance", "move a root between heaps to restore size rules"]],
    opening: "A running median changes after every arrival. Two heaps keep the lower and upper halves separate, with both middle boundaries available at their roots.",
    outcome: "You will implement a streaming median, state its ordering and size invariants, and trace insertion, rebalancing, and median retrieval.",
    why: "The two-heap pattern supports live latency dashboards, percentile approximations, scheduling, and problems that maintain a movable boundary between lower and upper groups.",
    mentalModel: "Two balanced bowls sit on a scale. The left bowl exposes its largest value. The right bowl exposes its smallest. Their touching edges reveal the middle.",
    firstTitle: "Maintain ordering and size together", firstIntro: "Store lower-half values as negatives. Keep lower equal in size to upper or exactly one item larger.",
    firstCode: `import heapq

class RunningMedian:
    def __init__(self): self.lower, self.upper = [], []
    def add(self, value):
        if not self.lower or value <= -self.lower[0]:
            heapq.heappush(self.lower, -value)
        else:
            heapq.heappush(self.upper, value)
        if len(self.lower) > len(self.upper) + 1:
            heapq.heappush(self.upper, -heapq.heappop(self.lower))
        elif len(self.upper) > len(self.lower):
            heapq.heappush(self.lower, -heapq.heappop(self.upper))
    def median(self):
        if len(self.lower) > len(self.upper): return -self.lower[0]
        return (-self.lower[0] + self.upper[0]) / 2

tracker = RunningMedian()
for value in [5, 2, 10, 4]:
    tracker.add(value); print(tracker.median())`,
    firstTrace: "Five starts left. Two joins left, then five moves right, giving median three-point-five. Ten joins right and moves five left. Four joins left and five moves right, giving median four-point-five.",
    secondTitle: "Expose both invariants for testing", secondIntro: "A correct state has nearly equal sizes and every lower value no greater than every upper value.",
    secondCode: `def valid_state(tracker):
    sizes_ok = len(tracker.lower) in {len(tracker.upper), len(tracker.upper) + 1}
    order_ok = not tracker.lower or not tracker.upper or -tracker.lower[0] <= tracker.upper[0]
    return sizes_ok and order_ok

tests = RunningMedian()
for value in [8, 1, 9, 2, 7, 3]:
    tests.add(value)
    print(value, tests.median(), valid_state(tests))`,
    secondTrace: "Every insertion first chooses a side by the boundary, then at most one root move repairs size. Each add costs theta log n, while reading the median costs theta one.",
    mistake: "Do not rebalance sizes without preserving ordering. If values are inserted into an arbitrary side, equal sizes can still place a large lower value beyond a small upper value.",
    checkpoint: "Why may the lower heap contain one extra item but the upper heap may not?",
    checkpointAnswer: "This chosen invariant stores the single middle value on the lower side when the count is odd. Either convention works if insertion, balancing, and median logic agree.",
    remember: "Keep lower values no greater than upper values, keep sizes within one, and read one or two boundary roots for the median.",
    checks: [q("Why negate lower-half values in Python?", ["To simulate a max-heap", "To discard negatives", "To sort the entire stream"], 0, "The smallest negative corresponds to the largest original value.", ["Correct. The lower boundary is exposed.", "Original signs can be restored.", "Only halves are partially ordered."]), q("What is median lookup time after maintenance?", ["Theta one", "Theta n", "Theta log n"], 0, "The middle boundary values are heap roots.", ["Correct. Updates performed the work.", "No scan is needed.", "Insertion is logarithmic, lookup is constant."])],
  },
  {
    lessonId: "py.ac.m4_3.l6", atomId: "py.atom.algo.k-way-merge", conceptId: "py.algo.k-way-merge",
    title: "K-way merge stores one next candidate per source", requires: ["py.algo.two-heaps"],
    vocabulary: [["k-way merge", "combine k sorted sources into one sorted output"], ["candidate", "the next not-yet-emitted item from one source"], ["source index", "the identity of the source that owns a heap item"], ["iterator", "an object that produces values one at a time"], ["output-sensitive", "work scales with the number of emitted values"]],
    opening: "Each sorted source has one relevant value: its next item. The smallest candidate across sources must be the next global output.",
    outcome: "You will merge sorted lists and lazy iterators, carry source identity through the heap, and derive theta total-items times log k complexity.",
    why: "External sorting, database result merging, log aggregation, linked-list merging, and distributed systems repeatedly combine many ordered streams.",
    mentalModel: "Several checkout lines each reveal one front customer. Choose the smallest ticket among the fronts, then reveal one replacement only from that customer's line.",
    firstTitle: "Carry value, source, and position", firstIntro: "Seed the heap with each nonempty source's first value. Popping a candidate reveals which source can contribute the next position.",
    firstCode: `import heapq

def merge_sorted(sources):
    heap = []
    for source, values in enumerate(sources):
        if values: heapq.heappush(heap, (values[0], source, 0))
    merged = []
    while heap:
        value, source, index = heapq.heappop(heap)
        merged.append(value)
        next_index = index + 1
        if next_index < len(sources[source]):
            next_value = sources[source][next_index]
            heapq.heappush(heap, (next_value, source, next_index))
    return merged

print(merge_sorted([[1, 4, 9], [2, 3, 10], [], [5, 6]]))`,
    firstTrace: "The heap starts with one, two, and five. Popping one reveals four only from its source. At most k candidates are stored. Each of n total items costs one logarithmic heap update.",
    secondTitle: "Merge sources without loading them fully", secondIntro: "Store an iterator with each candidate. After emitting a value, ask only that iterator for one replacement.",
    secondCode: `def merge_iterators(iterables):
    heap = []
    for source, iterable in enumerate(iterables):
        iterator = iter(iterable)
        first = next(iterator, None)
        if first is not None: heapq.heappush(heap, (first, source, iterator))
    while heap:
        value, source, iterator = heapq.heappop(heap)
        yield value
        following = next(iterator, None)
        if following is not None: heapq.heappush(heap, (following, source, iterator))

streams = [range(0, 9, 3), range(1, 10, 3), range(2, 11, 3)]
print(list(merge_iterators(streams)))`,
    secondTrace: "Only one value per iterator waits in memory. Source index breaks ties before Python tries to compare iterator objects. The generator can stream output before all input exists.",
    mistake: "Do not push every item from every source into the heap. That uses theta n memory and misses the sorted-source advantage. Keep only the current frontier of at most k values.",
    checkpoint: "Why can an unseen second item from a source never be the next global output before that source's first item?",
    checkpointAnswer: "The source is sorted, so its second item is no smaller than its first. The first item must be emitted or compared away before later items can matter.",
    remember: "Keep one candidate per sorted source, carry enough source state to reveal its replacement, and pay theta n log k time with theta k heap space.",
    checks: [q("What is the heap's maximum size during k-way merge?", ["k", "All n items", "One always"], 0, "Each source contributes at most one frontier value.", ["Correct. Empty or exhausted sources contribute none.", "That would ignore source order.", "Several sources compete."]), q("Why include source index in heap tuples?", ["It identifies replacements and safely breaks value ties", "It sorts each source first", "It makes the heap a max-heap"], 0, "A pop must know where its next candidate lives.", ["Correct. It also avoids comparing iterator objects.", "Sources are already sorted.", "Tuple direction remains min-heap order."])],
  },
];

export const ALGO_HEAP_ATOMS = SPECS.map(guidedMasteryAtom);
export const ALGO_HEAP_CONCEPTS = SPECS.map(guidedMasteryConcept);
export const ALGO_HEAP_LESSON_CONTENT = guidedLessonContent(SPECS);

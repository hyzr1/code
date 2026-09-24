import {
  guidedLessonContent,
  guidedMasteryAtom,
  guidedMasteryConcept,
  type GuidedMasterySpec,
} from "./guidedMastery";

const ALGO_PERSISTENCE_SPECS: GuidedMasterySpec[] = [
  {
    lessonId: "py.ac.m11_3.l1",
    atomId: "py.atom.algo.persistent-segment-trees",
    conceptId: "py.algo.persistent-segment-trees",
    title: "Persistent segment trees",
    requires: ["py.algo.segment-tree"],
    vocabulary: [
      ["persistent structure", "a structure where every past version stays queryable after an update"],
      ["path copying", "copying only the nodes on the changed root-to-leaf path and reusing the rest"],
      ["version root", "the root node that identifies one snapshot of the structure"],
    ],
    opening:
      "An ordinary segment tree answers questions about the array as it is now. Persistence keeps every version it ever had, and lets you query any of them.",
    outcome:
      "You will build versions by path copying, and query an old snapshot as cheaply as the current one.",
    why:
      "Range queries that ask about a prefix of the updates — the kth smallest among the first ten insertions, say — need history, not just the present.",
    mentalModel:
      "Picture a stack of trees that overlap almost entirely. Each new version owns one fresh path and borrows every other node from the version before it.",
    firstTitle: "Path copying",
    firstIntro:
      "An update changes only the nodes from the root down to one leaf. Copy those, point the copies at the old siblings, and the old root is still intact.",
    firstCode: `created = [0]

def build(lo, hi):
    created[0] += 1
    if lo == hi:
        return (0, None, None)
    mid = (lo + hi) // 2
    return (0, build(lo, mid), build(mid + 1, hi))

def update(node, lo, hi, at):
    created[0] += 1
    if lo == hi:
        return (node[0] + 1, None, None)
    mid = (lo + hi) // 2
    if at <= mid:
        return (node[0] + 1, update(node[1], lo, mid, at), node[2])
    return (node[0] + 1, node[1], update(node[2], mid + 1, hi, at))

versions = [build(0, 7)]
for value in [3, 1, 4, 1, 5, 2, 6, 5]:
    versions.append(update(versions[-1], 0, 7, value % 8))

print(created[0], 9 * 15)`,
    firstTrace:
      "Forty-seven nodes were created across nine versions. Copying each version outright would need a hundred and thirty-five. The saving is the whole point.",
    secondTitle: "Querying the past",
    secondIntro:
      "A query takes a version root and walks down exactly as it always did. Nothing about the traversal knows it is looking at history.",
    secondCode: `def count(node, lo, hi, a, b):
    if node is None or b < lo or hi < a:
        return 0
    if a <= lo and hi <= b:
        return node[0]
    mid = (lo + hi) // 2
    return (count(node[1], lo, mid, a, b)
            + count(node[2], mid + 1, hi, a, b))

print(count(versions[8], 0, 7, 0, 7))
print(count(versions[3], 0, 7, 0, 7))`,
    secondTrace:
      "The final version holds eight insertions and the third holds three. Subtracting two versions answers a question about the updates between them.",
    mistake:
      "Mutating a node in place. One careless assignment corrupts every version that was sharing it, and the damage surfaces in a query about a snapshot you never touched.",
    checkpoint:
      "One update on a tree over a million positions creates how many new nodes?",
    checkpointAnswer:
      "About twenty — the depth of the tree. Every other node is shared with the version it was built from.",
    remember:
      "Copy the path, share the rest, and keep the old root.",
    checks: [
      {
        question: "What does an update to a persistent segment tree copy?",
        choices: [
          "The nodes on the path from the root to the changed leaf",
          "The whole tree",
          "Only the changed leaf",
        ],
        answer: 0,
        explanation: "Ancestors of the leaf hold sums that changed.",
        why: [
          "Correct. That is a logarithmic number of nodes.",
          "That would make persistence linear per update.",
          "Its ancestors carry stale sums then.",
        ],
      },
      {
        question: "How is an old version identified?",
        choices: [
          "By its root node",
          "By a version number stored in each node",
          "By a timestamp on the leaves",
        ],
        answer: 0,
        explanation: "A traversal only ever needs a starting point.",
        why: [
          "Correct. Keep an array of roots, one per version.",
          "Nodes are shared, so they cannot carry one version.",
          "Leaves are shared too.",
        ],
      },
      {
        question: "Why must persistent nodes be immutable?",
        choices: [
          "Because a node is shared by many versions at once",
          "Because immutability is faster",
          "Because the tree is recursive",
        ],
        answer: 0,
        explanation: "Sharing is what makes the update cheap.",
        why: [
          "Correct. Mutating one corrupts every version pointing at it.",
          "Immutability costs an allocation here.",
          "Recursion is unrelated.",
        ],
      },
    ],
  },
  {
    lessonId: "py.ac.m11_3.l2",
    atomId: "py.atom.algo.wavelet-trees",
    conceptId: "py.algo.wavelet-trees",
    title: "Wavelet trees",
    requires: ["py.algo.persistent-segment-trees"],
    vocabulary: [
      ["wavelet tree", "a structure that recursively splits a sequence by value and tracks where each element went"],
      ["value split", "dividing the value range in half and partitioning the sequence by that midpoint"],
      ["kth smallest", "the element at position k when a range is sorted"],
    ],
    opening:
      "A segment tree splits by position. A wavelet tree splits by value instead, and that one change turns order statistics into a descent.",
    outcome:
      "You will find the kth smallest value in any range by descending a value tree in logarithmic time.",
    why:
      "Sorting the range costs more than the query is worth. The wavelet tree answers without ever materialising the sorted range.",
    mentalModel:
      "Imagine each level of the tree splitting the sequence into a low half and a high half by value, while remembering how many of your range landed on each side.",
    firstTitle: "Descending by count",
    firstIntro:
      "At each level, count how many elements of the range fall in the low half. If k is within that count, descend left; otherwise descend right and subtract.",
    firstCode: `def kth(values, lo, hi, a, b, k):
    if lo == hi:
        return lo
    mid = (lo + hi) // 2
    low = sum(1 for x in values[a:b + 1] if x <= mid)
    if k <= low:
        kept = [x for x in values if x <= mid]
        start = sum(1 for x in values[:a] if x <= mid)
        return kth(kept, lo, mid, start, start + low - 1, k)
    kept = [x for x in values if x > mid]
    start = sum(1 for x in values[:a] if x > mid)
    high = (b - a + 1) - low
    return kth(kept, mid + 1, hi, start, start + high - 1, k - low)

data = [3, 1, 4, 1, 5, 9, 2, 6]
print(kth(data, 0, 9, 0, 7, 4))`,
    firstTrace:
      "The fourth smallest of the whole array is three, matching the sorted order. The descent touched one level per bit of the value range.",
    secondTitle: "The range moves with you",
    secondIntro:
      "The hard part is not the counting. It is tracking where positions a and b land after the sequence is partitioned.",
    secondCode: `for a, b, k in [(0, 7, 1), (2, 5, 2), (1, 3, 3)]:
    got = kth(data, 0, 9, a, b, k)
    want = sorted(data[a:b + 1])[k - 1]
    print(a, b, k, got, want, got == want)`,
    secondTrace:
      "Every case agrees with sorting the slice. Each answer cost a descent rather than a sort, which is where the speed comes from.",
    mistake:
      "Remapping the range with the count inside it rather than the count before it. The new start position depends on how many preceding elements went the same way, not on your own range.",
    checkpoint:
      "How does a wavelet tree differ from a segment tree in what it splits?",
    checkpointAnswer:
      "A segment tree splits positions; a wavelet tree splits values, which is why order statistics fall out of the descent.",
    remember:
      "Split by value, count on the way down, subtract when you go right.",
    checks: [
      {
        question: "What does each level of a wavelet tree split?",
        choices: ["The value range", "The position range", "The query range"],
        answer: 0,
        explanation: "That is the whole difference from a segment tree.",
        why: [
          "Correct. Positions are partitioned as a consequence.",
          "That is what a segment tree does.",
          "The query range is remapped, not split.",
        ],
      },
      {
        question: "When the descent goes right, what happens to k?",
        choices: [
          "The count of low elements is subtracted from it",
          "It is left unchanged",
          "It is halved",
        ],
        answer: 0,
        explanation: "Those elements are all smaller and already skipped.",
        why: [
          "Correct. You are now indexing within the high half.",
          "That would count the low elements twice.",
          "The value range halves; k does not.",
        ],
      },
      {
        question: "What is the cost of one kth-smallest query?",
        choices: [
          "Logarithmic in the value range",
          "Logarithmic in the range length",
          "Linear in the range length",
        ],
        answer: 0,
        explanation: "One step per level of the value split.",
        why: [
          "Correct. The value range, not the sequence, sets the depth.",
          "The range length does not control the depth.",
          "That would be no better than scanning.",
        ],
      },
    ],
  },
  {
    lessonId: "py.ac.m11_3.l3",
    atomId: "py.atom.algo.merge-sort-trees",
    conceptId: "py.algo.merge-sort-trees",
    title: "Two-dimensional and merge-sort trees",
    requires: ["py.algo.wavelet-trees"],
    vocabulary: [
      ["merge-sort tree", "a segment tree whose every node stores its segment in sorted order"],
      ["orthogonal query", "a query bounded independently in two dimensions, such as a position range and a value range"],
      ["binary search within a node", "answering a value question inside one node's sorted list"],
    ],
    opening:
      "Some questions are bounded in two directions at once: how many values in positions three to nine are at most seven. One tree over positions is not enough.",
    outcome:
      "You will store a sorted copy of each segment and answer two-dimensional counting queries with a binary search per node.",
    why:
      "The second dimension has to live somewhere. Storing it sorted inside each node buys a binary search instead of a scan.",
    mentalModel:
      "Picture the ordinary segment tree, but every node now holds its own slice sorted. The position range picks the nodes; the value bound is a binary search inside each.",
    firstTitle: "Sorted at every level",
    firstIntro:
      "Each element appears once per level, so the whole structure stores the array about seventeen times over for a hundred thousand elements.",
    firstCode: `import math

for size in (1_000, 100_000, 10_000_000):
    levels = math.ceil(math.log2(size))
    print(size, "levels", levels,
          "stored elements", size * levels)`,
    firstTrace:
      "A hundred thousand elements become one point seven million stored values. That memory is the price of the second dimension.",
    secondTitle: "Counting under a bound",
    secondIntro:
      "A query decomposes the position range into canonical nodes, then binary-searches each node's sorted list for the value bound.",
    secondCode: `def count_le(values, a, b, bound):
    return sum(1 for v in values[a:b + 1] if v <= bound)

data = [5, 2, 8, 1, 9, 3, 7, 4]
for a, b, bound in [(0, 7, 4), (2, 5, 3), (1, 6, 8)]:
    print(a, b, bound, count_le(data, a, b, bound))`,
    secondTrace:
      "The reference scan gives four, two and five. The tree reproduces those counts by summing a binary search over a logarithmic number of nodes.",
    mistake:
      "Reaching for this when the array is static and the queries are offline. Sorting the queries and sweeping with a Fenwick tree is simpler and uses a fraction of the memory.",
    checkpoint:
      "Why is a merge-sort tree query logarithmic squared?",
    checkpointAnswer:
      "A logarithmic number of canonical nodes, each answered by a logarithmic binary search inside its sorted list.",
    remember:
      "Positions pick the nodes; the sorted list answers the value bound.",
    checks: [
      {
        question: "What does each node of a merge-sort tree store?",
        choices: [
          "Its own segment, sorted",
          "A single aggregate value",
          "A pointer to the sorted whole array",
        ],
        answer: 0,
        explanation: "That is what makes the value bound searchable.",
        why: [
          "Correct. The lists merge upward exactly as merge sort does.",
          "That is an ordinary segment tree.",
          "A node must be searchable within its own segment.",
        ],
      },
      {
        question: "How much memory does the structure use?",
        choices: [
          "The array size times the number of levels",
          "The same as the array",
          "The square of the array size",
        ],
        answer: 0,
        explanation: "Every element appears once per level.",
        why: [
          "Correct. That is roughly seventeen copies at a hundred thousand.",
          "Each level holds a full copy.",
          "Levels are logarithmic, not linear.",
        ],
      },
      {
        question: "When is a simpler offline sweep preferable?",
        choices: [
          "When the array is static and all queries are known in advance",
          "When queries arrive one at a time",
          "When the value range is small",
        ],
        answer: 0,
        explanation: "Sorting queries needs them all up front.",
        why: [
          "Correct. A Fenwick sweep is smaller and faster there.",
          "Online queries cannot be sorted.",
          "A small value range suggests counting instead.",
        ],
      },
    ],
  },
  {
    lessonId: "py.ac.m11_3.l4",
    atomId: "py.atom.algo.sqrt-trees",
    conceptId: "py.algo.sqrt-trees",
    title: "Sqrt trees and advanced sparse tables",
    requires: ["py.algo.merge-sort-trees"],
    vocabulary: [
      ["idempotent operation", "an operation where combining a value with itself returns that value, such as minimum"],
      ["sparse table", "a precomputed table of answers over every power-of-two length"],
      ["overlapping query", "covering a range with two overlapping blocks rather than a disjoint partition"],
    ],
    opening:
      "For a static array and an idempotent operation, a range query needs no tree at all. Two overlapping lookups answer it in constant time.",
    outcome:
      "You will use overlap for idempotent operations, and recognise exactly when that trick becomes wrong.",
    why:
      "A logarithmic query is fast, but a constant one is faster, and static range minimum shows up inside dozens of other algorithms.",
    mentalModel:
      "Imagine covering a range with two blocks of the same power-of-two length, one anchored at each end. They overlap in the middle, and minimum does not care.",
    firstTitle: "Overlap is free for minimum",
    firstIntro:
      "Take the largest power of two that fits. One block from the start, one ending at the finish. Their union is the range and their overlap costs nothing.",
    firstCode: `def build_sparse(values, combine):
    table, step = [list(values)], 1
    while (1 << step) <= len(values):
        row, half = table[-1], 1 << (step - 1)
        table.append([combine(row[i], row[i + half])
                      for i in range(len(values) - (1 << step) + 1)])
        step += 1
    return table

def query(table, combine, a, b):
    level = (b - a + 1).bit_length() - 1
    return combine(table[level][a], table[level][b - (1 << level) + 1])

data = [5, 2, 8, 1, 9, 3, 7, 4, 6, 0]
table = build_sparse(data, min)
print(all(query(table, min, a, b) == min(data[a:b + 1])
          for a in range(10) for b in range(a, 10)))`,
    firstTrace:
      "Every one of the fifty-five ranges agrees with a direct scan. Each answer took two array lookups regardless of how long the range was.",
    secondTitle: "Where overlap breaks",
    secondIntro:
      "Sum is not idempotent. The overlapping elements get added twice, and the answer comes back quietly wrong rather than visibly broken.",
    secondCode: `add = lambda x, y: x + y
table = build_sparse(data, add)
print(query(table, add, 0, 4), sum(data[0:5]))`,
    secondTrace:
      "Thirty-six against a true sum of twenty-five. The overlap double-counted, and nothing in the code signalled a problem.",
    mistake:
      "Assuming the overlap trick generalises. Minimum, maximum, greatest common divisor and bitwise or are safe. Sum, product and count are not, and need a disjoint partition instead.",
    checkpoint:
      "Which property lets two blocks overlap without corrupting the answer?",
    checkpointAnswer:
      "Idempotence — combining a value with itself gives that value back, so counting an element twice changes nothing.",
    remember:
      "Overlap for idempotent, partition for everything else.",
    checks: [
      {
        question: "Which operation may use the overlapping query?",
        choices: ["Minimum", "Sum", "Count of distinct values"],
        answer: 0,
        explanation: "The test is whether repeating an element matters.",
        why: [
          "Correct. Minimum is idempotent.",
          "Overlapping elements are added twice.",
          "That is not even associative in the required sense.",
        ],
      },
      {
        question: "What does a sparse table cost to build?",
        choices: [
          "Linear-times-logarithmic time and memory",
          "Linear time and memory",
          "Quadratic time",
        ],
        answer: 0,
        explanation: "One row per power of two.",
        why: [
          "Correct. That is the trade for constant queries.",
          "There are logarithmically many rows.",
          "Each row is built in linear time.",
        ],
      },
      {
        question: "The array changes between queries. Is a sparse table appropriate?",
        choices: [
          "No; the table would need a full rebuild",
          "Yes; only one row changes",
          "Yes; updates are logarithmic",
        ],
        answer: 0,
        explanation: "There is no update path in the structure.",
        why: [
          "Correct. A segment tree handles updates instead.",
          "One element appears in every row.",
          "There is no update operation at all.",
        ],
      },
    ],
  },
];

export const ALGO_PERSISTENCE_ATOMS = ALGO_PERSISTENCE_SPECS.map(guidedMasteryAtom);
export const ALGO_PERSISTENCE_CONCEPTS = ALGO_PERSISTENCE_SPECS.map(guidedMasteryConcept);
export const ALGO_PERSISTENCE_LESSON_CONTENT = guidedLessonContent(ALGO_PERSISTENCE_SPECS);

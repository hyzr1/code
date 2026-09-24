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

const ALGO_BALANCED_TREES_SPECS: GuidedMasterySpec[] = [
  {
    lessonId: "py.ac.m11_1.l1",
    atomId: "py.atom.algo.treaps",
    conceptId: "py.algo.treaps",
    title: "Treaps balance by accident, on purpose",
    requires: ["py.algo.practice-loop"],
    vocabulary: [
      ["treap", "a tree that is a search tree by key and a heap by priority"],
      ["random priority", "a value drawn per node that decides its height"],
      ["rotation", "a local rearrangement that changes depth without changing order"],
      ["expected height", "the height averaged over the algorithm's own random choices"],
    ],
    opening: "Balanced trees usually need a rebalancing rule with cases to memorize. A treap replaces that rule with a random number per node, and the tree that results is balanced for the same reason a randomized quicksort is fast.",
    outcome: "You will maintain both invariants at once, and see why random priorities give a logarithmic expected height.",
    why: "A treap is the shortest balanced tree to write correctly under pressure, and the argument for its height is the same one that justifies randomized pivots.",
    mentalModel: "Picture arranging people in a line by height while also making them obey a chain of command drawn from a hat. Neither constraint alone forces a shape, and together they force a shape nobody chose deliberately.",
    firstTitle: "Two invariants held simultaneously",
    firstIntro: "Keys obey search-tree order and priorities obey heap order, and a rotation fixes a violation.",
    firstCode: `import random

def insert(node, key, priority):
    if node is None:
        return (key, priority, None, None)
    node_key, node_priority, left, right = node
    if key < node_key:
        left = insert(left, key, priority)
        node = (node_key, node_priority, left, right)
        if left[1] > node_priority:
            node = (left[0], left[1], left[2], (node_key, node_priority, left[3], right))
    elif key > node_key:
        right = insert(right, key, priority)
        node = (node_key, node_priority, left, right)
        if right[1] > node_priority:
            node = (right[0], right[1], (node_key, node_priority, left, right[2]), right[3])
    return node

def inorder(node, out):
    if node is None:
        return out
    inorder(node[2], out)
    out.append(node[0])
    inorder(node[3], out)
    return out

rng = random.Random(1)
root = None
for key in range(1, 8):
    root = insert(root, key, rng.random())

print("keys in order:", inorder(root, []))
print("root key:", root[0], "root priority:", round(root[1], 4))`,
    firstTrace: "Keys are inserted in increasing order, which would build a completely unbalanced tree in a plain search tree. The priorities pull high-priority nodes upward through rotations, and the in-order walk still returns the sorted sequence. Both invariants hold after every insertion, which is what the rotation restores.",
    secondTitle: "Random priorities give a logarithmic expected height",
    secondIntro: "Sorted input, which is the worst case for a plain tree, is nothing special here.",
    secondCode: `import random

def insert(node, key, priority):
    if node is None:
        return (key, priority, None, None)
    node_key, node_priority, left, right = node
    if key < node_key:
        left = insert(left, key, priority)
        node = (node_key, node_priority, left, right)
        if left[1] > node_priority:
            node = (left[0], left[1], left[2], (node_key, node_priority, left[3], right))
    elif key > node_key:
        right = insert(right, key, priority)
        node = (node_key, node_priority, left, right)
        if right[1] > node_priority:
            node = (right[0], right[1], (node_key, node_priority, left, right[2]), right[3])
    return node

def height(node):
    return 0 if node is None else 1 + max(height(node[2]), height(node[3]))

for count in (31, 127, 511):
    rng = random.Random(1)
    root = None
    for key in range(count):
        root = insert(root, key, rng.random())
    print(f"{count:>4} sorted insertions: height {height(root):>3}, "
          f"a plain tree would be {count}")`,
    secondTrace: "Inserting five hundred keys in sorted order gives a height under twenty rather than five hundred. The priorities are independent of the keys, so no input order can produce a bad tree; only an unlucky draw can, and that becomes vanishingly unlikely. The guarantee is expected rather than worst case, exactly as it is for a randomized pivot.",
    mistake: "Do not derive the priority from the key. Hashing the key makes the priorities deterministic, so an adversary who knows the hash can construct an input that builds a chain, and the expected-height argument no longer applies at all.",
    checkpoint: "Why does sorted input not defeat a treap?",
    checkpointAnswer: "Because the shape is decided by the priorities, which are independent of the keys. Sorted input controls the search-tree constraint and nothing else, so it cannot influence the heap constraint that actually determines the height.",
    remember: "A treap is a search tree by key and a heap by priority, restored with rotations. Random priorities make the expected height logarithmic whatever order the keys arrive in.",
    checks: [
      q("What decides a treap's shape?", ["The random priorities, which are independent of the keys", "The insertion order", "The key values"], 0, "That independence is the whole guarantee.", ["Correct. No input order can force a bad tree.", "Order controls only the search constraint.", "Keys fix the in-order sequence, not the height."]),
      q("What kind of guarantee does a treap give?", ["Expected logarithmic height", "Worst-case logarithmic height", "Amortized constant height"], 0, "An unlucky draw is possible but vanishingly unlikely.", ["Correct. The same argument as a randomized pivot.", "That would need a deterministic rule.", "Height is never constant."]),
      q("Why not derive the priority from the key by hashing?", ["An adversary who knows the hash can build a chain", "Hashing is too slow", "The priorities would collide"], 0, "Determinism removes the independence.", ["Correct. The expected-height argument stops applying.", "Hashing is fast.", "Collisions are not the problem."]),
    ],
  },
  {
    lessonId: "py.ac.m11_1.l2",
    atomId: "py.atom.algo.splay-trees",
    conceptId: "py.algo.splay-trees",
    title: "Splay trees move what you touch",
    requires: ["py.algo.treaps"],
    vocabulary: [
      ["splaying", "rotating an accessed node all the way to the root"],
      ["amortized bound", "a guarantee on a sequence of operations rather than on one"],
      ["working set", "the small subset of keys a workload actually touches"],
      ["restructuring cost", "work done on a read, which surprises callers who expect reads to be cheap"],
    ],
    opening: "Every other balanced tree keeps its shape regardless of what you ask for. A splay tree rearranges itself on every access, and the payoff is that a workload touching a few keys repeatedly gets much faster than logarithmic.",
    outcome: "You will describe splaying, state what kind of bound it gives, and identify the workloads where it wins and loses.",
    why: "Splay trees are the clearest example of an amortized guarantee, and the reason a read can be expensive is a genuine design consideration rather than an implementation detail.",
    mentalModel: "Picture a desk where every document you consult goes back on top of the pile. Finding something you use daily becomes instant, and the tidying happens whether you wanted it or not.",
    firstTitle: "The bound is over a sequence, not per operation",
    firstIntro: "One access can be linear; the average over a long run cannot be.",
    firstCode: `def costs(sequence_length, pattern):
    if pattern == "uniform":
        return [12] * sequence_length
    if pattern == "working set":
        return [12 if i < 8 else 2 for i in range(sequence_length)]
    if pattern == "adversarial single":
        return [sequence_length] + [1] * (sequence_length - 1)
    raise ValueError("unknown pattern")

for pattern in ("uniform", "working set", "adversarial single"):
    values = costs(100, pattern)
    print(f"{pattern:<20} worst {max(values):>4}  total {sum(values):>5}  "
          f"average {sum(values) / len(values):>6.2f}")`,
    firstTrace: "The adversarial pattern has one very expensive access and a tiny average, which is exactly what an amortized bound permits and a worst-case bound forbids. A caller with a latency budget per operation cannot use that guarantee. A caller measuring total throughput can.",
    secondTitle: "Where the restructuring pays and where it costs",
    secondIntro: "Repeated access to a few keys is the case splaying was designed for.",
    secondCode: `WORKLOADS = [
    ("a few keys, accessed constantly", "wins",
     "the working set migrates near the root and stays there"),
    ("keys accessed uniformly at random", "roughly even",
     "no working set exists for splaying to exploit"),
    ("a single scan of every key in order", "loses",
     "each access restructures for a key never touched again"),
    ("read-heavy with a strict latency budget", "loses",
     "a read can be expensive, and the bound is only amortized"),
    ("concurrent readers", "loses badly",
     "reads mutate the tree, so they cannot run in parallel"),
]

print(f"{'workload':<38}{'verdict':<16}why")
for workload, verdict, reason in WORKLOADS:
    print(f"{workload:<38}{verdict:<16}{reason}")`,
    secondTrace: "The concurrent case is the one people are most often caught by, since a read mutating the structure means readers need exclusive access. A single ordered scan is the other classic loss, because every access pays restructuring for a key that will never be asked for again. The wins are real and narrow.",
    mistake: "Do not use a splay tree behind a read-heavy concurrent interface. Reads restructure the tree, so they cannot proceed in parallel, and the structure that looked ideal for a read-mostly workload becomes the contention point.",
    checkpoint: "What does an amortized logarithmic bound not promise?",
    checkpointAnswer: "That any individual operation is logarithmic. A single access may cost time proportional to the size of the tree, and the guarantee is only that a long sequence averages out. Any caller with a per-operation latency requirement needs a worst-case structure instead.",
    remember: "Splaying moves every accessed node to the root, which favours a small working set. The bound is amortized rather than per-operation, and reads mutate the tree.",
    checks: [
      q("What does splaying do on every access?", ["Rotates the accessed node to the root", "Rebalances the whole tree", "Nothing, unless the tree is unbalanced"], 0, "The restructuring happens on reads too.", ["Correct. That is what favours a working set.", "Only the access path is touched.", "It happens on every access regardless."]),
      q("What kind of bound does a splay tree give?", ["Amortized, over a sequence of operations", "Worst-case per operation", "Expected, over random choices"], 0, "One access can be linear.", ["Correct. A latency budget per operation rules it out.", "That would need a deterministic balance rule.", "Nothing here is randomized."]),
      q("Why are splay trees poor under concurrent reads?", ["Reads mutate the tree, so they need exclusive access", "They use too much memory", "Their bound is too weak"], 0, "Restructuring happens on every access.", ["Correct. The read-mostly case becomes the contention point.", "Memory is comparable.", "The bound is fine for throughput."]),
    ],
  },
  {
    lessonId: "py.ac.m11_1.l3",
    atomId: "py.atom.algo.balanced-bst-internals",
    conceptId: "py.algo.balanced-bst-internals",
    title: "Two ways to keep a tree short",
    requires: ["py.algo.splay-trees"],
    vocabulary: [
      ["height balance", "bounding the height difference between two subtrees"],
      ["colour invariant", "bounding the tree using node colours rather than heights"],
      ["rebalance frequency", "how often an update triggers structural work"],
      ["lookup depth", "how far a search descends in the worst case"],
    ],
    opening: "Two rules dominate deterministic balancing, and they differ in a way that decides which one a library picks. One keeps the tree shorter, and the other rebalances less often, and neither is better in general.",
    outcome: "You will state each rule's invariant, compare their heights, and say which workload each one suits.",
    why: "Every standard library uses one of these, and knowing which trade you have inherited explains why a lookup-heavy workload behaves differently on a map than on a sorted container.",
    mentalModel: "Picture two managers keeping a hierarchy shallow. One reorganizes at any imbalance and keeps the chart tight, and the other tolerates more skew and reorganizes far less.",
    firstTitle: "Two invariants, two heights",
    firstIntro: "The stricter rule buys a shorter tree and pays for it in rebalancing work.",
    firstCode: `import math

def height_bound(count, kind):
    if count <= 0:
        return 0
    if kind == "height-balanced":
        return 1.44 * math.log2(count + 2) - 0.33
    if kind == "colour-balanced":
        return 2 * math.log2(count + 1)
    if kind == "perfect":
        return math.log2(count + 1)
    raise ValueError("unknown kind")

print(f"{'nodes':>10}{'perfect':>10}{'height-bal':>13}{'colour-bal':>13}")
for count in (1_000, 100_000, 10_000_000):
    print(f"{count:>10}"
          f"{height_bound(count, 'perfect'):>10.1f}"
          f"{height_bound(count, 'height-balanced'):>13.1f}"
          f"{height_bound(count, 'colour-balanced'):>13.1f}")`,
    firstTrace: "At ten million nodes the height-balanced tree stays under thirty-four while the colour-balanced one can reach forty-six. That difference is real and small, and it becomes visible only on workloads dominated by lookups. Both are within a constant factor of perfect, which is why either is acceptable.",
    secondTitle: "The rebalancing cost is where they actually differ",
    secondIntro: "The stricter invariant is violated more often, so it is repaired more often.",
    secondCode: `PROPERTIES = [
    ("rotations per insertion", "at most 2", "at most 2"),
    ("rotations per deletion", "up to log n", "at most 3"),
    ("recolouring per update", "not applicable", "up to log n, but cheap"),
    ("typical use", "lookup-heavy in-memory indexes", "general-purpose library maps"),
]

print(f"{'property':<26}{'height-balanced':<24}{'colour-balanced'}")
for name, first, second in PROPERTIES:
    print(f"{name:<26}{first:<24}{second}")

print()
print("a rotation moves pointers; a recolouring changes one bit")`,
    secondTrace: "Deletion is where the two separate, since the height-balanced rule can cascade rotations all the way to the root while the colour rule bounds them at three. Recolouring can cascade in the colour scheme too, but changing a bit is far cheaper than rearranging pointers. That asymmetry is why general-purpose libraries favour the colour scheme.",
    mistake: "Do not choose between these on height alone. The heights differ by well under a factor of two, and the deletion behaviour differs by a factor that grows with the tree, so an update-heavy workload is decided by the rebalancing rather than by the depth.",
    checkpoint: "Which invariant would you choose for an in-memory index that is built once and then only read?",
    checkpointAnswer: "The height-balanced one, since its tighter bound means shallower lookups and the expensive deletion behaviour never arises. Once updates are rare, the only property that matters is depth, which is exactly where the stricter rule wins.",
    remember: "The stricter height rule gives a shorter tree and cascading deletions; the colour rule gives a taller tree and bounded rotations. Lookup-heavy favours the first and update-heavy the second.",
    checks: [
      q("Where do the two schemes differ most?", ["Rebalancing cost on deletion", "Lookup cost", "Memory per node"], 0, "Heights differ by well under a factor of two.", ["Correct. One cascades rotations; the other bounds them.", "Depth differs only slightly.", "Both store a small extra field."]),
      q("Why do general-purpose libraries favour the colour scheme?", ["Its rotations on deletion are bounded by a constant", "Its trees are shorter", "It uses less memory"], 0, "Recolouring is cheap even when it cascades.", ["Correct. Update-heavy workloads decide it.", "It produces taller trees.", "Memory is comparable."]),
      q("Which suits a read-only in-memory index?", ["The height-balanced rule, for its shallower lookups", "The colour rule, for its cheaper updates", "Neither; use a hash map"], 0, "Deletion behaviour never arises there.", ["Correct. Depth is the only property that matters.", "Updates are rare by assumption.", "A hash map cannot answer ordered queries."]),
    ],
  },
  {
    lessonId: "py.ac.m11_1.l4",
    atomId: "py.atom.algo.order-statistics-trees",
    conceptId: "py.algo.order-statistics-trees",
    title: "One extra field turns a tree into a ranking",
    requires: ["py.algo.balanced-bst-internals"],
    vocabulary: [
      ["subtree size", "how many nodes a subtree contains, stored at its root"],
      ["select", "finding the item at a given position in sorted order"],
      ["rank", "finding the position of a given item in sorted order"],
      ["augmentation", "extra data stored at each node and maintained by every update"],
    ],
    opening: "A search tree can tell you whether a key is present and nothing about where it sits in the order. Storing one integer per node adds both directions of that question at no change to the asymptotic cost.",
    outcome: "You will maintain subtree sizes through insertion, and use them to answer select and rank in logarithmic time.",
    why: "Rank and select underpin percentile queries, leaderboards and order-statistic problems, and the augmentation pattern generalizes to sums, minimums and anything else that composes from children.",
    mentalModel: "Picture a filing cabinet where every drawer is labelled with how many documents it contains. Finding the thousandth document becomes a descent, reading a label at each step to decide which way to go.",
    firstTitle: "Sizes make position a descent",
    firstIntro: "The left subtree's size tells you exactly how many items precede the current node.",
    firstCode: `class Node:
    __slots__ = ("key", "left", "right", "size")

    def __init__(self, key):
        self.key = key
        self.left = None
        self.right = None
        self.size = 1

def size(node):
    return node.size if node else 0

def insert(node, key):
    if node is None:
        return Node(key)
    if key < node.key:
        node.left = insert(node.left, key)
    elif key > node.key:
        node.right = insert(node.right, key)
    node.size = 1 + size(node.left) + size(node.right)
    return node

def select(node, index):
    left = size(node.left)
    if index < left:
        return select(node.left, index)
    if index == left:
        return node.key
    return select(node.right, index - left - 1)

root = None
for key in (50, 30, 70, 20, 40, 60, 80, 35):
    root = insert(root, key)

print("by position:", [select(root, i) for i in range(root.size)])
print("sorted:    ", sorted([50, 30, 70, 20, 40, 60, 80, 35]))`,
    firstTrace: "Selecting every position in turn reproduces the sorted order, which is the check worth writing. Each descent reads one size and moves left or right, so the cost is the height rather than the position. The size field is updated on the way back up from every insertion.",
    secondTitle: "Rank is the same walk, counting as it goes",
    secondIntro: "Going right means passing the whole left subtree plus the current node.",
    secondCode: `class Node:
    __slots__ = ("key", "left", "right", "size")

    def __init__(self, key):
        self.key = key
        self.left = None
        self.right = None
        self.size = 1

def size(node):
    return node.size if node else 0

def insert(node, key):
    if node is None:
        return Node(key)
    if key < node.key:
        node.left = insert(node.left, key)
    elif key > node.key:
        node.right = insert(node.right, key)
    node.size = 1 + size(node.left) + size(node.right)
    return node

def rank(node, key):
    if node is None:
        return 0
    if key < node.key:
        return rank(node.left, key)
    if key > node.key:
        return 1 + size(node.left) + rank(node.right, key)
    return size(node.left)

root = None
for key in (50, 30, 70, 20, 40, 60, 80, 35):
    root = insert(root, key)

for key in sorted([50, 30, 70, 20, 40, 60, 80, 35]):
    print(f"rank of {key:>3}: {rank(root, key)}")`,
    secondTrace: "Each rightward step adds the left subtree's size plus one for the node just passed, which counts everything now known to precede the key. Ranks come out as zero through seven for the eight keys in order. The same descent answers a percentile question by comparing the rank against the total size.",
    mistake: "Do not forget to update the sizes during rebalancing. A rotation changes which nodes sit beneath which, so any node whose children changed needs its size recomputed, and a stale size makes select and rank silently wrong rather than raising.",
    checkpoint: "What else could be stored at each node using the same pattern?",
    checkpointAnswer: "Anything that composes from a node's children, such as a subtree sum, minimum, maximum or greatest common divisor. The requirement is that a parent's value be computable from its two children's values plus its own, which is what lets a rotation repair it locally.",
    remember: "Store the subtree size at every node and maintain it on every update, including rotations. Select descends by comparing against the left size, and rank accumulates it while going right.",
    checks: [
      q("What does the left subtree's size tell you?", ["Exactly how many keys precede the current node", "The height of the tree", "How many keys are larger"], 0, "That is what makes select a descent.", ["Correct. Compare the index against it to choose a direction.", "Height is not stored.", "The right subtree holds those."]),
      q("What must happen to sizes during a rotation?", ["Every node whose children changed must be recomputed", "Nothing; sizes are unaffected", "The whole tree must be rebuilt"], 0, "A stale size fails silently.", ["Correct. That is the classic augmentation bug.", "Rotations change which nodes sit beneath which.", "Only the affected nodes need repair."]),
      q("What can this augmentation pattern store generally?", ["Anything computable from a node's children and itself", "Only counts", "Only associative operations without an identity"], 0, "Local composability is the requirement.", ["Correct. Sums, minimums and divisors all work.", "Counts are one instance.", "An identity is not required for a tree."]),
    ],
  },
];

export const ALGO_BALANCED_TREES_ATOMS = ALGO_BALANCED_TREES_SPECS.map(guidedMasteryAtom);
export const ALGO_BALANCED_TREES_CONCEPTS = ALGO_BALANCED_TREES_SPECS.map(guidedMasteryConcept);
export const ALGO_BALANCED_TREES_LESSON_CONTENT = guidedLessonContent(ALGO_BALANCED_TREES_SPECS);

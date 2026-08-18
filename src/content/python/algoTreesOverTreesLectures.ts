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

const ALGO_TREES_OVER_TREES_SPECS: GuidedMasterySpec[] = [
  {
    lessonId: "py.ac.m11_2.l1",
    atomId: "py.atom.algo.heavy-light-queries",
    conceptId: "py.algo.heavy-light-queries",
    title: "Path queries in log squared time",
    requires: ["py.algo.order-statistics-trees"],
    vocabulary: [
      ["path query", "an aggregate over the nodes between two tree vertices"],
      ["chain segment", "the contiguous array range one chain contributes to a path"],
      ["climb", "walking upward chain by chain until both ends meet"],
      ["log squared", "a logarithmic number of range queries, each itself logarithmic"],
    ],
    opening: "The decomposition assigns positions so a chain is contiguous. Turning that into a path query means walking upward from both ends, taking one range per chain, and stopping when they land on the same one.",
    outcome: "You will decompose a path into chain segments, count them, and explain where the second logarithm comes from.",
    why: "Path aggregation on trees has no direct array equivalent, and this is the standard reduction. The two logarithms multiplying is also the clearest example of composing two structures.",
    mentalModel: "Picture travelling between two towns along motorways. You take one motorway as far as it goes, switch, and repeat, and the journey is a handful of long stretches rather than thousands of local roads.",
    firstTitle: "A path is a few contiguous ranges",
    firstIntro: "Each upward step contributes one chain segment and moves to a shallower chain.",
    firstCode: `PARENT = [0, 0, 0, 1, 1, 2, 2, 3]
DEPTH = [0, 1, 1, 2, 2, 2, 2, 3]
HEAD = [0, 0, 2, 0, 4, 2, 6, 0]
POSITION = [0, 1, 5, 2, 4, 6, 7, 3]

def path_segments(first, second):
    segments = []
    while HEAD[first] != HEAD[second]:
        if DEPTH[HEAD[first]] < DEPTH[HEAD[second]]:
            first, second = second, first
        segments.append((POSITION[HEAD[first]], POSITION[first]))
        first = PARENT[HEAD[first]]
    low, high = sorted((POSITION[first], POSITION[second]))
    segments.append((low, high))
    return segments

for a, b in ((7, 5), (4, 6), (3, 3)):
    segments = path_segments(a, b)
    print(f"path {a} to {b}: {len(segments)} segments {segments}")`,
    firstTrace: "Each iteration takes the whole of one chain from the deeper end and jumps to the parent of that chain's head. The loop ends when both ends share a chain, and the final range covers what is left between them. A path between two leaves in this tree costs a handful of ranges rather than one per node.",
    secondTitle: "Where the second logarithm comes from",
    secondIntro: "A logarithmic number of chain segments, each answered by a logarithmic range query.",
    secondCode: `import math

def path_cost(nodes):
    chains = math.log2(nodes)
    per_chain = math.log2(nodes)
    return chains, per_chain, chains * per_chain

print(f"{'nodes':>10}{'chains':>10}{'per query':>12}{'total':>10}{'naive':>10}")
for nodes in (1_000, 100_000, 10_000_000):
    chains, per_chain, total = path_cost(nodes)
    print(f"{nodes:>10}{chains:>10.1f}{per_chain:>12.1f}{total:>10.1f}{nodes:>10}")

print()
print("the first log counts the chains; the second is the range structure")`,
    secondTrace: "At ten million nodes the path crosses about twenty-three chains and each range query costs about twenty-three, giving roughly five hundred operations rather than ten million. The two logarithms come from genuinely different places, which is why they multiply rather than add. Replacing the range structure with a constant-time one would remove the second.",
    mistake: "Do not forget to move to the parent of the chain head rather than to the head itself. Stepping to the head leaves you on the same chain, so the loop never terminates, and the bug looks like a hang rather than a wrong answer.",
    checkpoint: "Where does each of the two logarithms come from?",
    checkpointAnswer: "The first counts how many chains the path crosses, which is logarithmic because leaving a chain at least halves the remaining subtree. The second is the cost of one range query on whatever structure holds the positions. They are independent, so the total is their product.",
    remember: "Walk upward from the deeper chain head, taking one range per chain, until both ends share a chain. The cost is a logarithmic number of ranges, each logarithmic to answer.",
    checks: [
      q("What does each iteration of the climb contribute?", ["One contiguous range, for the whole of one chain", "One node", "One subtree"], 0, "Chains occupy consecutive positions.", ["Correct. That is what the decomposition bought.", "Per-node cost is what this avoids.", "Subtrees are a different query."]),
      q("Where does the second logarithm come from?", ["The cost of one range query on the underlying structure", "The tree's height", "The number of chains"], 0, "The two sources are independent.", ["Correct. A constant-time range structure would remove it.", "Height bounds the chain count instead.", "That is the first logarithm."]),
      q("Why move to the parent of the chain head?", ["Moving to the head itself leaves you on the same chain", "The head has no value", "The parent is always shallower by one"], 0, "The loop would never terminate.", ["Correct. The bug presents as a hang.", "The head is included in the range just taken.", "The parent may be far shallower."]),
    ],
  },
  {
    lessonId: "py.ac.m11_2.l2",
    atomId: "py.atom.algo.centroid-decomposition",
    conceptId: "py.algo.centroid-decomposition",
    title: "Centroid decomposition, divide and conquer on a tree",
    requires: ["py.algo.heavy-light-queries"],
    vocabulary: [
      ["centroid", "a node whose removal leaves no component larger than half"],
      ["decomposition tree", "the recursion structure formed by repeated centroid removal"],
      ["path through the centroid", "any path in a component that crosses its centroid"],
      ["logarithmic depth", "the number of levels the recursion reaches"],
    ],
    opening: "Counting paths with a property in a tree looks quadratic, because there are quadratically many paths. Splitting at a node that halves the tree, and counting only paths crossing it, turns that into a logarithmic number of linear passes.",
    outcome: "You will find a centroid, argue why the recursion has logarithmic depth, and see which paths each level accounts for.",
    why: "This is the standard technique for path-counting problems on trees, and the halving argument is what makes it affordable. Every path is counted exactly once, at the level where its highest centroid sits.",
    mentalModel: "Picture cutting a road network at its busiest junction. Every route either passed through that junction, and is now countable, or lies entirely within one of the smaller regions left behind.",
    firstTitle: "The centroid halves the tree",
    firstIntro: "Descend toward whichever child's subtree is more than half the total.",
    firstCode: `CHILDREN = {0: [1, 2], 1: [3, 4], 2: [5], 3: [], 4: [], 5: [6], 6: []}
COUNT = 7

def subtree_sizes(root, blocked):
    sizes = [0] * COUNT

    def visit(node, parent):
        sizes[node] = 1
        for child in CHILDREN[node]:
            if child != parent and child not in blocked:
                sizes[node] += visit(child, node)
        return sizes[node]

    visit(root, -1)
    return sizes

def centroid(root, blocked=frozenset()):
    sizes = subtree_sizes(root, blocked)
    total = sizes[root]

    def descend(node, parent):
        for child in CHILDREN[node]:
            if child != parent and child not in blocked and sizes[child] > total // 2:
                return descend(child, node)
        return node

    return descend(root, -1)

print("sizes from the root:", subtree_sizes(0, frozenset()))
print("centroid of the whole tree:", centroid(0))
print("centroid after removing node 0:", centroid(1, frozenset({0})))`,
    firstTrace: "The descent moves toward any child holding more than half the nodes, and stops when none does. That node is the centroid, and removing it leaves components each no larger than half. Blocking already-removed nodes is what lets the same routine run on each remaining component.",
    secondTitle: "Every path is counted once, at one level",
    secondIntro: "A path belongs to the level whose centroid it crosses, and no other.",
    secondCode: `import math

def levels(nodes):
    depth = 0
    remaining = nodes
    while remaining > 1:
        remaining //= 2
        depth += 1
    return depth

print(f"{'nodes':>10}{'levels':>8}{'work per level':>16}{'total':>14}{'naive pairs':>16}")
for nodes in (1_000, 100_000, 1_000_000):
    depth = levels(nodes)
    print(f"{nodes:>10}{depth:>8}{nodes:>16}{depth * nodes:>14,}"
          f"{nodes * (nodes - 1) // 2:>16,}")

print()
print("each level touches every node once, across all its components")`,
    secondTrace: "Every level visits each node once in total, spread across its components, so the work per level is linear. The depth is logarithmic because each removal halves the largest component. A million nodes costs about twenty million operations rather than the five hundred billion pairs a direct count would need.",
    mistake: "Do not count paths that lie entirely inside one component at the level where you found the centroid. Those belong to a deeper level, and counting them at both produces every such path twice, which is the classic double-counting error here.",
    checkpoint: "Why is the decomposition depth logarithmic?",
    checkpointAnswer: "Because removing a centroid leaves every remaining component at most half the size, by the definition of a centroid. Halving at every level means the components reach size one after a logarithmic number of levels, regardless of the tree's shape.",
    remember: "A centroid halves the tree when removed, so the recursion is logarithmically deep. Count only paths crossing the current centroid, and leave the rest to deeper levels.",
    checks: [
      q("What defines a centroid?", ["Removing it leaves no component larger than half", "It is the deepest node", "It is the root of the heaviest chain"], 0, "That is what bounds the recursion depth.", ["Correct. Descend toward any child holding more than half.", "Depth is unrelated.", "That is heavy-light decomposition."]),
      q("Which paths are counted at a given level?", ["Only those crossing that level's centroid", "All paths in the component", "Only paths between leaves"], 0, "The rest belong to deeper levels.", ["Correct. Counting both ways double-counts.", "That would count many paths twice.", "Path endpoints are unrestricted."]),
      q("What is the total work?", ["Linear per level, over a logarithmic number of levels", "Quadratic", "Linear overall"], 0, "Each level touches every node once.", ["Correct. A million nodes costs about twenty million steps.", "The quadratic count is what this avoids.", "The levels multiply the linear pass."]),
    ],
  },
  {
    lessonId: "py.ac.m11_2.l3",
    atomId: "py.atom.algo.euler-tour",
    conceptId: "py.algo.euler-tour",
    title: "An Euler tour turns a subtree into a range",
    requires: ["py.algo.centroid-decomposition"],
    vocabulary: [
      ["entry time", "the position at which a node is first visited"],
      ["exit time", "the last position covered by that node's subtree"],
      ["flattening", "writing a tree into an array so structure becomes position"],
      ["subtree range", "the contiguous span an entire subtree occupies"],
    ],
    opening: "Subtree and path queries need different flattenings. Recording when a walk enters and leaves each node makes every subtree a contiguous range, which hands the problem to an array structure.",
    outcome: "You will record entry and exit times, read a subtree off as a range, and answer subtree aggregates with a segment tree.",
    why: "Subtree updates and queries appear constantly, and this reduction is short enough to derive on the spot. It also makes the ancestor test a comparison rather than a walk.",
    mentalModel: "Picture a nested outline with the line number where each section starts and ends. Everything in a section sits between those two numbers, with nothing else mixed in.",
    firstTitle: "Entry and exit bracket the subtree",
    firstIntro: "A depth-first walk assigns each node a position, and its subtree occupies the span up to its exit.",
    firstCode: `CHILDREN = {0: [1, 2], 1: [3, 4], 2: [5], 3: [], 4: [], 5: [6], 6: []}
COUNT = 7

entry = [0] * COUNT
exit_time = [0] * COUNT
clock = [0]

def walk(node):
    entry[node] = clock[0]
    clock[0] += 1
    for child in CHILDREN[node]:
        walk(child)
    exit_time[node] = clock[0] - 1

walk(0)
print("entry:", entry)
print("exit: ", exit_time)
print()
for node in range(COUNT):
    span = exit_time[node] - entry[node] + 1
    print(f"node {node}: range [{entry[node]}, {exit_time[node]}] "
          f"covering {span} node{'s' if span != 1 else ''}")`,
    firstTrace: "Every subtree is exactly the positions from its entry to its exit, and the span equals its size. A leaf's entry equals its exit, since it covers only itself. Nothing outside a subtree lands inside that range, which is what makes the reduction sound.",
    secondTitle: "The flattened array answers subtree aggregates",
    secondIntro: "Place each node's value at its entry position and any range structure applies.",
    secondCode: `CHILDREN = {0: [1, 2], 1: [3, 4], 2: [5], 3: [], 4: [], 5: [6], 6: []}
COUNT = 7
VALUES = [5, 3, 8, 1, 2, 9, 4]

entry = [0] * COUNT
exit_time = [0] * COUNT
clock = [0]

def walk(node):
    entry[node] = clock[0]
    clock[0] += 1
    for child in CHILDREN[node]:
        walk(child)
    exit_time[node] = clock[0] - 1

walk(0)
flat = [0] * COUNT
for node in range(COUNT):
    flat[entry[node]] = VALUES[node]

def subtree_total(node):
    return sum(flat[entry[node]:exit_time[node] + 1])

def is_ancestor(older, younger):
    return entry[older] <= entry[younger] <= exit_time[older]

for node in range(COUNT):
    print(f"subtree of {node}: total {subtree_total(node)}")

print()
print("is 0 an ancestor of 6?", is_ancestor(0, 6))
print("is 1 an ancestor of 6?", is_ancestor(1, 6))`,
    secondTrace: "Summing the flattened range gives each subtree's total, and a segment tree makes updates logarithmic too. The ancestor test becomes two comparisons, since one node is an ancestor exactly when its range contains the other's entry. Both facts follow from the bracketing.",
    mistake: "Do not use this flattening for path queries. A path is not contiguous in an entry-time array, and the structure that makes subtrees contiguous is the one that scatters paths.",
    checkpoint: "How do you test whether one node is an ancestor of another in constant time?",
    checkpointAnswer: "Compare the ranges. One node is an ancestor of another exactly when its entry is at most the other's and its exit is at least it. Range containment is ancestry, so two comparisons replace a walk.",
    remember: "A depth-first walk brackets each subtree between an entry and an exit time. Subtrees become contiguous ranges, ancestry becomes a comparison, and paths become scattered.",
    checks: [
      q("What does an Euler tour make contiguous?", ["Every subtree", "Every root-to-node path", "Every level of the tree"], 0, "Entry and exit times bracket it.", ["Correct. Paths become scattered instead.", "That needs heavy-light decomposition.", "Levels are not contiguous here."]),
      q("How is ancestry tested after flattening?", ["By checking whether one range contains the other's entry", "By walking up the parent links", "By comparing depths"], 0, "Containment of ranges is ancestry.", ["Correct. Two comparisons replace the walk.", "That is what the flattening removes.", "Equal depths do not imply ancestry."]),
      q("What is the span from entry to exit equal to?", ["The subtree's size", "The tree's height", "The number of children"], 0, "Nothing outside the subtree lands inside.", ["Correct. A leaf spans exactly one position.", "Height is unrelated.", "Descendants at every depth are included."]),
    ],
  },
  {
    lessonId: "py.ac.m11_2.l4",
    atomId: "py.atom.algo.link-cut-trees",
    conceptId: "py.algo.link-cut-trees",
    title: "When the tree itself changes",
    requires: ["py.algo.euler-tour"],
    vocabulary: [
      ["dynamic connectivity", "answering whether two nodes are connected as edges come and go"],
      ["preferred path", "the chain of the tree a structure currently keeps contiguous"],
      ["access", "the operation that makes a root-to-node path preferred"],
      ["represented forest", "the actual tree, as distinct from the structure representing it"],
    ],
    opening: "Every technique so far assumed the tree's shape was fixed. Once edges can be added and removed, the flattening has to change with them, and the structures that manage that are the most involved in the subject.",
    outcome: "You will state what a dynamic forest must support, and explain how preferred paths let a static-looking structure survive edge changes.",
    why: "Dynamic connectivity underpins incremental graph algorithms and several flow implementations. Knowing the shape of the solution is worth more than being able to write it from memory.",
    mentalModel: "Picture a road network where roads open and close daily. A fixed map is useless, and what you need is a representation that can be re-cut cheaply along whichever routes are currently being travelled.",
    firstTitle: "What breaks when edges change",
    firstIntro: "Every static flattening depends on a shape that no longer holds.",
    firstCode: `STATIC = [
    ("Euler tour", "entry and exit times", "one edge change reassigns most positions"),
    ("heavy-light", "chain heads and positions", "sizes change, so chains change"),
    ("centroid decomposition", "the whole recursion", "the centroid moves"),
    ("binary lifting", "ancestor tables", "every ancestor above the change is wrong"),
]

print(f"{'technique':<26}{'depends on':<28}effect of one edge change")
for name, depends, effect in STATIC:
    print(f"{name:<26}{depends:<28}{effect}")

print()
print("all four assume a shape that a single link or cut invalidates")`,
    firstTrace: "Every technique in this module rests on a precomputation over a fixed shape, and one edge change invalidates the precomputation rather than a small part of it. Rebuilding costs a linear pass per update, which is acceptable for a handful of changes and hopeless for many. That gap is what dynamic structures fill.",
    secondTitle: "Preferred paths make the representation re-cuttable",
    secondIntro: "The structure keeps some paths contiguous and rearranges which ones on demand.",
    secondCode: `OPERATIONS = [
    ("link(u, v)", "attach two separate trees", "amortized log n"),
    ("cut(u, v)", "remove an existing edge", "amortized log n"),
    ("connected(u, v)", "are they in the same tree", "amortized log n"),
    ("path_aggregate(u, v)", "an aggregate along the path", "amortized log n"),
    ("evert(u)", "make u the root of its tree", "amortized log n"),
]

print(f"{'operation':<24}{'meaning':<34}cost")
for name, meaning, cost in OPERATIONS:
    print(f"{name:<24}{meaning:<34}{cost}")

print()
print("every bound is amortized, and the constant factors are large")
print("a static structure is faster whenever the shape does not change")`,
    secondTrace: "All five operations share the same amortized logarithmic bound, which is what makes the structure usable at all. The constant factors are substantially worse than any static approach, so the structure only wins when the shape genuinely changes often. Choosing it for a fixed tree is a large and avoidable cost.",
    mistake: "Do not reach for a dynamic structure when the edge changes are known in advance. Processing the queries offline, in an order chosen to avoid deletions, is usually far simpler and considerably faster than maintaining a dynamic forest.",
    checkpoint: "Your tree changes only a handful of times across the whole run. What should you use?",
    checkpointAnswer: "A static structure, rebuilt after each change. A few linear rebuilds cost far less than the constant factors of a dynamic forest, and the code is a fraction of the length. The dynamic structure earns its complexity only when changes are frequent relative to queries.",
    remember: "Static flattenings assume a fixed shape and one edge change invalidates them. Dynamic forests support link, cut and path queries in amortized logarithmic time, with large constants.",
    checks: [
      q("What does one edge change do to a static flattening?", ["Invalidates the whole precomputation, not a small part", "Affects only the two endpoints", "Requires no change"], 0, "Positions, chains and centroids all shift.", ["Correct. Rebuilding costs a linear pass.", "The effect propagates widely.", "Every technique here depends on the shape."]),
      q("What bound do dynamic forest operations give?", ["Amortized logarithmic, with large constants", "Worst-case logarithmic", "Constant"], 0, "The constants are what make static structures preferable when possible.", ["Correct. They win only when changes are frequent.", "The bound is amortized.", "Nothing here is constant."]),
      q("Edges change only a handful of times. What is the right choice?", ["A static structure, rebuilt after each change", "A dynamic forest", "Recompute from scratch per query"], 0, "A few linear rebuilds beat the constant factors.", ["Correct. The code is also far shorter.", "Its complexity is unearned here.", "Per-query rebuilding is wasteful."]),
    ],
  },
];

export const ALGO_TREES_OVER_TREES_ATOMS = ALGO_TREES_OVER_TREES_SPECS.map(guidedMasteryAtom);
export const ALGO_TREES_OVER_TREES_CONCEPTS = ALGO_TREES_OVER_TREES_SPECS.map(guidedMasteryConcept);
export const ALGO_TREES_OVER_TREES_LESSON_CONTENT = guidedLessonContent(ALGO_TREES_OVER_TREES_SPECS);

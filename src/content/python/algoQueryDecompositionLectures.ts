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

const ALGO_QUERY_DECOMPOSITION_SPECS: GuidedMasterySpec[] = [
  {
    lessonId: "py.ac.m9_1.l1",
    atomId: "py.atom.algo.fenwick-tree",
    conceptId: "py.algo.fenwick-tree",
    title: "Fenwick trees, built out of the lowest set bit",
    requires: ["py.algo.randomized-algorithms"],
    vocabulary: [
      ["prefix aggregate", "the combined value of everything up to a position"],
      ["point update", "changing the value at one position"],
      ["responsibility range", "the span of positions one node's stored total covers"],
      ["lowest set bit", "the value that decides how far each node reaches"],
    ],
    opening: "Keeping a running total makes prefix queries instant and updates expensive. Keeping the raw array makes updates instant and queries expensive. A Fenwick tree splits the difference, and the entire structure comes from one bit trick.",
    outcome: "You will build a Fenwick tree, answer prefix queries by walking down, and apply updates by walking up.",
    why: "It is the shortest structure that gives logarithmic updates and queries together, and it appears constantly in inversion counting, order statistics and competitive problems where a segment tree would be overkill.",
    mentalModel: "Picture each index holding the total for a block whose length is its own lowest set bit. Odd positions cover only themselves, and powers of two cover everything back to the start.",
    firstTitle: "Two loops, both driven by the lowest set bit",
    firstIntro: "Updating adds the lowest set bit, and querying subtracts it.",
    firstCode: `class Fenwick:
    def __init__(self, size):
        self.size = size
        self.tree = [0] * (size + 1)

    def add(self, index, delta):
        index += 1
        while index <= self.size:
            self.tree[index] += delta
            index += index & -index

    def prefix(self, count):
        total = 0
        while count > 0:
            total += self.tree[count]
            count -= count & -count
        return total

values = [3, 1, 4, 1, 5, 9, 2, 6]
tree = Fenwick(len(values))
for position, value in enumerate(values):
    tree.add(position, value)

print("prefix of first 5:", tree.prefix(5), "expected", sum(values[:5]))
print("prefix of all:    ", tree.prefix(8), "expected", sum(values))`,
    firstTrace: "The update loop climbs to every node whose responsibility range covers the changed position, and the query loop walks back down by stripping one set bit at a time. Both take at most as many steps as there are bits in the size. Nothing here is recursive and there are no child pointers at all.",
    secondTitle: "A range is the difference of two prefixes",
    secondIntro: "The structure stores prefixes, so any range comes from subtracting one from another.",
    secondCode: `class Fenwick:
    def __init__(self, size):
        self.size = size
        self.tree = [0] * (size + 1)

    def add(self, index, delta):
        index += 1
        while index <= self.size:
            self.tree[index] += delta
            index += index & -index

    def prefix(self, count):
        total = 0
        while count > 0:
            total += self.tree[count]
            count -= count & -count
        return total

    def range_sum(self, left, right):
        return self.prefix(right + 1) - self.prefix(left)

values = [3, 1, 4, 1, 5, 9, 2, 6]
tree = Fenwick(len(values))
for position, value in enumerate(values):
    tree.add(position, value)

print("range 2 to 5:", tree.range_sum(2, 5), "expected", sum(values[2:6]))
tree.add(3, 10)
print("after adding 10 at index 3:", tree.range_sum(2, 5))`,
    secondTrace: "Subtracting the shorter prefix from the longer one leaves exactly the requested span. That subtraction is why the structure only supports operations with an inverse, so sums and counts work while minimum does not. An update is a delta rather than an assignment, which is what the plus-equals in the loop expresses.",
    mistake: "Do not use a Fenwick tree for range minimum. A range is computed by subtracting one prefix from another, and minimum has no inverse to subtract, so the structure cannot answer it however the loops are written.",
    checkpoint: "You have a Fenwick tree storing values and want to set position three to a specific number rather than add to it.",
    checkpointAnswer: "Compute the difference between the new value and the current one, then add that difference. The structure only stores aggregates, so it has no direct way to read a single position back except as the range from that position to itself.",
    remember: "One array, two loops, both driven by the lowest set bit. Ranges come from subtracting prefixes, which restricts the structure to operations that have an inverse.",
    checks: [
      q("What decides how far a Fenwick node reaches?", ["Its index's lowest set bit", "Its depth in a tree", "The array length"], 0, "There is no explicit tree at all.", ["Correct. That single value defines every responsibility range.", "No tree structure is stored.", "The length bounds the loops, not the ranges."]),
      q("Why can a Fenwick tree not answer range minimum?", ["Ranges are computed by subtracting prefixes, and minimum has no inverse", "The updates are too slow", "It stores only integers"], 0, "Subtraction is what makes ranges work.", ["Correct. A segment tree handles minimum instead.", "Updates are logarithmic either way.", "Any numeric type works for sums."]),
      q("How do you set a position rather than add to it?", ["Add the difference between the new and old values", "Rebuild the tree", "Call the update twice"], 0, "Updates are deltas.", ["Correct. The old value comes from a one-element range query.", "Rebuilding is unnecessary.", "Two additions do not replace a value."]),
    ],
  },
  {
    lessonId: "py.ac.m9_1.l2",
    atomId: "py.atom.algo.segment-tree",
    conceptId: "py.algo.segment-tree",
    title: "Segment trees answer anything associative",
    requires: ["py.algo.fenwick-tree"],
    vocabulary: [
      ["associative operation", "one where the grouping of the operands does not matter"],
      ["identity element", "the value that leaves any operand unchanged"],
      ["iterative segment tree", "a flat array where a node's children sit at twice its index"],
      ["query decomposition", "covering a range with a logarithmic number of stored nodes"],
    ],
    opening: "A Fenwick tree is smaller and faster and can only do operations with an inverse. A segment tree drops that restriction entirely, and asks for nothing more than that the operation be associative with an identity.",
    outcome: "You will build an iterative segment tree, query any range by combining stored nodes, and swap the operation without touching the structure.",
    why: "Range minimum, maximum, greatest common divisor and custom merges all use the same code with one argument changed. That generality is what makes it the default range structure.",
    mentalModel: "Picture a knockout tournament bracket where each match stores the winner of everything beneath it. Any range of players is covered by a handful of completed matches plus a few individuals at the edges.",
    firstTitle: "One structure, any associative operation",
    firstIntro: "The operation and its identity are parameters, not assumptions baked into the code.",
    firstCode: `class Segment:
    def __init__(self, values, combine, identity):
        self.size = len(values)
        self.combine = combine
        self.identity = identity
        self.tree = [identity] * (2 * self.size)
        for position, value in enumerate(values):
            self.tree[self.size + position] = value
        for node in range(self.size - 1, 0, -1):
            self.tree[node] = combine(self.tree[2 * node], self.tree[2 * node + 1])

    def query(self, left, right):
        result = self.identity
        left += self.size
        right += self.size + 1
        while left < right:
            if left & 1:
                result = self.combine(result, self.tree[left])
                left += 1
            if right & 1:
                right -= 1
                result = self.combine(result, self.tree[right])
            left //= 2
            right //= 2
        return result

values = [3, 1, 4, 1, 5, 9, 2, 6]
print("min 2..5:", Segment(values, min, float("inf")).query(2, 5))
print("sum 2..5:", Segment(values, lambda a, b: a + b, 0).query(2, 5))`,
    firstTrace: "The same class answers a minimum and a sum, differing only in the two arguments. Leaves live in the second half of the array and each internal node combines its two children. The query walks inward from both ends, taking a stored node whenever the boundary is odd, which covers the range with a logarithmic number of pieces.",
    secondTitle: "Updating one leaf repairs one path",
    secondIntro: "Only the ancestors of a changed leaf can be wrong, and there are logarithmically many.",
    secondCode: `class Segment:
    def __init__(self, values, combine, identity):
        self.size = len(values)
        self.combine = combine
        self.identity = identity
        self.tree = [identity] * (2 * self.size)
        for position, value in enumerate(values):
            self.tree[self.size + position] = value
        for node in range(self.size - 1, 0, -1):
            self.tree[node] = combine(self.tree[2 * node], self.tree[2 * node + 1])

    def update(self, position, value):
        node = position + self.size
        self.tree[node] = value
        node //= 2
        while node:
            self.tree[node] = self.combine(self.tree[2 * node], self.tree[2 * node + 1])
            node //= 2

    def query(self, left, right):
        result = self.identity
        left += self.size
        right += self.size + 1
        while left < right:
            if left & 1:
                result = self.combine(result, self.tree[left])
                left += 1
            if right & 1:
                right -= 1
                result = self.combine(result, self.tree[right])
            left //= 2
            right //= 2
        return result

tree = Segment([3, 1, 4, 1, 5, 9, 2, 6], min, float("inf"))
print("before:", tree.query(2, 5))
tree.update(3, 0)
print("after setting index 3 to 0:", tree.query(2, 5))`,
    secondTrace: "Changing one leaf and walking to the root repairs every node whose range contains it, and no other node can be affected. That path is as long as the tree is deep, so the update matches the query cost. Halving the index is how the walk moves from a node to its parent in a flat array.",
    mistake: "Do not pass an identity that is not neutral for the operation. Seeding a minimum query with zero makes every answer zero or less, and the bug looks like a query error rather than a one-argument mistake.",
    checkpoint: "Which operations can a segment tree support that a Fenwick tree cannot?",
    checkpointAnswer: "Any associative operation without an inverse, such as minimum, maximum or greatest common divisor. A segment tree combines stored nodes directly rather than subtracting prefixes, so it never needs to undo a contribution.",
    remember: "Leaves in the second half, each parent combining its children. Queries cover a range with logarithmically many stored nodes, and any associative operation with an identity works.",
    checks: [
      q("What does a segment tree require of its operation?", ["Associativity and an identity element", "An inverse", "Commutativity"], 0, "It combines stored nodes rather than subtracting.", ["Correct. That is what admits minimum and maximum.", "An inverse is the Fenwick requirement.", "Order is preserved by the query walk."]),
      q("How many stored nodes does a range query combine?", ["A logarithmic number", "One per element in the range", "Exactly two"], 0, "The walk covers the range with whole subtrees.", ["Correct. That is what makes it fast.", "Visiting each element would be linear.", "Two suffices only for aligned ranges."]),
      q("A minimum query is seeded with an identity of zero. What happens?", ["Every answer is zero or less", "The tree fails to build", "Only the first query is wrong"], 0, "Zero is not neutral for minimum.", ["Correct. Infinity is the neutral value there.", "Building succeeds; the answers are wrong.", "Every query combines with the identity."]),
    ],
  },
  {
    lessonId: "py.ac.m9_1.l3",
    atomId: "py.atom.algo.lazy-propagation",
    conceptId: "py.algo.lazy-propagation",
    title: "Lazy propagation defers work until somebody asks",
    requires: ["py.algo.segment-tree"],
    vocabulary: [
      ["range update", "applying the same change to every position in a span"],
      ["pending value", "a change recorded at a node but not yet applied beneath it"],
      ["push down", "moving a pending change from a node to its children"],
      ["fully covered node", "a node whose whole range lies inside the update"],
    ],
    opening: "Adding a value to a million positions one at a time is a million operations. A segment tree already knows which nodes cover that span, so the trick is to record the change there and push it down only when somebody looks.",
    outcome: "You will store pending updates at covering nodes, push them down before descending, and keep every query correct.",
    why: "Range updates with range queries appear constantly, and without laziness the structure is no better than an array. The push-down discipline is also the part that is easy to get subtly wrong.",
    mentalModel: "Picture writing a note on a filing cabinet drawer saying everything inside needs a correction, rather than opening it and correcting every folder. The note is only acted on when somebody opens the drawer.",
    firstTitle: "Record at the covering node, apply on the way down",
    firstIntro: "A node fully inside the update takes the pending value and stops.",
    firstCode: `class Lazy:
    def __init__(self, values):
        self.size = len(values)
        self.total = [0] * (4 * self.size)
        self.pending = [0] * (4 * self.size)
        self.build(1, 0, self.size - 1, values)

    def build(self, node, low, high, values):
        if low == high:
            self.total[node] = values[low]
            return
        mid = (low + high) // 2
        self.build(2 * node, low, mid, values)
        self.build(2 * node + 1, mid + 1, high, values)
        self.total[node] = self.total[2 * node] + self.total[2 * node + 1]

    def push(self, node, low, high):
        if self.pending[node]:
            self.total[node] += self.pending[node] * (high - low + 1)
            if low != high:
                self.pending[2 * node] += self.pending[node]
                self.pending[2 * node + 1] += self.pending[node]
            self.pending[node] = 0

values = [1, 2, 3, 4, 5]
tree = Lazy(values)
print("built totals for", values)
print("root total:", tree.total[1], "expected", sum(values))`,
    firstTrace: "The push step applies a node's pending value to its own total and hands a copy to each child. Multiplying by the range length is what turns a per-element change into a stored aggregate. A leaf has no children, so its pending value stops there.",
    secondTitle: "Every descent pushes first",
    secondIntro: "Reading or writing beneath a node requires its pending value to have been applied.",
    secondCode: `class Lazy:
    def __init__(self, values):
        self.size = len(values)
        self.total = [0] * (4 * self.size)
        self.pending = [0] * (4 * self.size)
        self.build(1, 0, self.size - 1, values)

    def build(self, node, low, high, values):
        if low == high:
            self.total[node] = values[low]
            return
        mid = (low + high) // 2
        self.build(2 * node, low, mid, values)
        self.build(2 * node + 1, mid + 1, high, values)
        self.total[node] = self.total[2 * node] + self.total[2 * node + 1]

    def push(self, node, low, high):
        if self.pending[node]:
            self.total[node] += self.pending[node] * (high - low + 1)
            if low != high:
                self.pending[2 * node] += self.pending[node]
                self.pending[2 * node + 1] += self.pending[node]
            self.pending[node] = 0

    def add(self, node, low, high, left, right, delta):
        self.push(node, low, high)
        if right < low or high < left:
            return
        if left <= low and high <= right:
            self.pending[node] += delta
            self.push(node, low, high)
            return
        mid = (low + high) // 2
        self.add(2 * node, low, mid, left, right, delta)
        self.add(2 * node + 1, mid + 1, high, left, right, delta)
        self.total[node] = self.total[2 * node] + self.total[2 * node + 1]

    def query(self, node, low, high, left, right):
        self.push(node, low, high)
        if right < low or high < left:
            return 0
        if left <= low and high <= right:
            return self.total[node]
        mid = (low + high) // 2
        return (self.query(2 * node, low, mid, left, right)
                + self.query(2 * node + 1, mid + 1, high, left, right))

tree = Lazy([1, 2, 3, 4, 5])
print("sum 1..3 before:", tree.query(1, 0, 4, 1, 3))
tree.add(1, 0, 4, 1, 3, 10)
print("sum 1..3 after adding 10:", tree.query(1, 0, 4, 1, 3))
print("sum of everything:", tree.query(1, 0, 4, 0, 4))`,
    secondTrace: "Both operations push before doing anything else, which guarantees a node's stored total is correct before it is read or recombined. Adding ten across three positions raises that range's total by thirty without touching any leaf. The whole-array total rises by the same thirty, because the change was recorded once and accounted for on the way back up.",
    mistake: "Do not forget to push before recombining children on the way back up. A child holding an unapplied pending value reports a stale total, so the parent is rebuilt from wrong numbers and the error persists after the pending value is eventually applied.",
    checkpoint: "A range update touches a node whose range is only partly inside it. What happens there?",
    checkpointAnswer: "The node cannot take the pending value, because that would apply the change to positions outside the update. It pushes whatever it already holds, recurses into both children, and rebuilds its own total from what they report afterwards.",
    remember: "Record the change at fully covered nodes and push it down before any descent. Multiply by the range length when applying, and rebuild parents only after their children are current.",
    checks: [
      q("What does a node do when the update fully covers its range?", ["Records the pending value and stops descending", "Recurses into both children", "Rebuilds from its children"], 0, "That is what makes the update logarithmic.", ["Correct. Descending further would defeat the purpose.", "That is the partial-overlap case.", "Rebuilding happens on the way back up."]),
      q("Why must a push happen before descending?", ["A child's total is stale until the pending value reaches it", "It frees memory", "It resets the tree"], 0, "Reads and rebuilds both depend on current totals.", ["Correct. Skipping it corrupts the parent too.", "No memory is released.", "Nothing is reset."]),
      q("Why is the pending value multiplied by the range length?", ["The node stores an aggregate over that many positions", "To avoid overflow", "To keep the tree balanced"], 0, "A per-element change scales with the count.", ["Correct. A single position would multiply by one.", "Overflow is unrelated.", "Balance is structural."]),
    ],
  },
  {
    lessonId: "py.ac.m9_1.l4",
    atomId: "py.atom.algo.sparse-table",
    conceptId: "py.algo.sparse-table",
    title: "Sparse tables trade updates for constant queries",
    requires: ["py.algo.lazy-propagation"],
    vocabulary: [
      ["idempotent operation", "one where combining a value with itself changes nothing"],
      ["overlapping cover", "answering a range with two spans that may overlap"],
      ["immutable structure", "one that cannot be updated after it is built"],
      ["preprocessing cost", "the one-off work paid before any query is answered"],
    ],
    opening: "If the data never changes and the operation is idempotent, a range query needs no walking at all. Two precomputed answers, chosen to overlap, cover any span exactly.",
    outcome: "You will build a table of power-of-two ranges and answer any query with two lookups, and say why updates are impossible.",
    why: "Range minimum on fixed data is common enough that constant-time queries are worth the memory, and the overlap argument is a genuinely different idea from every other structure in this module.",
    mentalModel: "Picture two rulers of the same power-of-two length, one aligned to the start of the range and one to its end. Together they cover the span, and the middle is measured twice, which does not matter if measuring twice is harmless.",
    firstTitle: "Every power-of-two window, precomputed",
    firstIntro: "Each level doubles the window length by combining two windows of the level before it.",
    firstCode: `def build(values, combine=min):
    table = [list(values)]
    length = 1
    while length * 2 <= len(values):
        previous = table[-1]
        row = [combine(previous[i], previous[i + length])
               for i in range(len(values) - 2 * length + 1)]
        table.append(row)
        length *= 2
    return table

values = [3, 1, 4, 1, 5, 9, 2, 6]
table = build(values)
for level, row in enumerate(table):
    print(f"windows of {2 ** level:>2}: {row}")`,
    firstTrace: "Level zero is the values themselves and each level combines two adjacent windows of the level beneath it. The rows shorten as the windows grow, since a longer window has fewer places to start. Building costs the length times the logarithm of the length, paid once.",
    secondTitle: "Two overlapping lookups answer anything",
    secondIntro: "Pick the largest power of two that fits, then cover the range from both ends.",
    secondCode: `def build(values, combine=min):
    table = [list(values)]
    length = 1
    while length * 2 <= len(values):
        previous = table[-1]
        table.append([combine(previous[i], previous[i + length])
                      for i in range(len(values) - 2 * length + 1)])
        length *= 2
    return table

def query(table, left, right, combine=min):
    level = (right - left + 1).bit_length() - 1
    return combine(table[level][left], table[level][right - (1 << level) + 1])

values = [3, 1, 4, 1, 5, 9, 2, 6]
table = build(values)
print("min 2..5:", query(table, 2, 5), "expected", min(values[2:6]))
print("min 0..7:", query(table, 0, 7), "expected", min(values))
matches = all(query(table, a, b) == min(values[a:b + 1])
              for a in range(len(values)) for b in range(a, len(values)))
print("every range agrees with a direct scan:", matches)`,
    secondTrace: "The two windows start at each end of the range and are the same length, so together they cover it and usually overlap in the middle. Counting the overlapping part twice is harmless for minimum, because taking a minimum with itself changes nothing. That is exactly what fails for a sum, which is why sparse tables do not answer those.",
    mistake: "Do not use a sparse table for range sums. The two windows overlap, so the shared middle is counted twice, and the answer is too large by whatever that overlap contained.",
    checkpoint: "Why can a sparse table not support updates?",
    checkpointAnswer: "Because one position appears in windows at every level, and changing it invalidates all of them. Repairing the table would cost as much as rebuilding it, so the structure is only worth its memory when the data is fixed before any query.",
    remember: "Precompute every power-of-two window, then answer any range with two overlapping lookups. The overlap requires an idempotent operation, and nothing can be updated afterwards.",
    checks: [
      q("Why must the operation be idempotent?", ["The two covering windows overlap, so the middle counts twice", "The table would be too large", "Updates would fail"], 0, "Minimum with itself is unchanged; a sum is not.", ["Correct. That rules out sums entirely.", "Memory is a separate concern.", "Updates fail for a different reason."]),
      q("What does a range query cost after preprocessing?", ["Constant time, two lookups", "Logarithmic time", "Linear in the range length"], 0, "The two windows are found directly.", ["Correct. That is what the memory buys.", "That is a segment tree.", "Nothing is scanned."]),
      q("Why does a sparse table not support updates?", ["One position appears in windows at every level", "The rows are immutable lists", "The levels are computed lazily"], 0, "Repairing them all costs a rebuild.", ["Correct. It suits fixed data only.", "Mutability is not the obstacle.", "Everything is built eagerly."]),
    ],
  },
  {
    lessonId: "py.ac.m9_1.l5",
    atomId: "py.atom.algo.lowest-common-ancestor",
    conceptId: "py.algo.lowest-common-ancestor",
    title: "Binary lifting finds an ancestor in logarithmic steps",
    requires: ["py.algo.sparse-table"],
    vocabulary: [
      ["ancestor", "any node on the path from a node up to the root"],
      ["binary lifting", "storing the ancestor two to the k steps up, for every k"],
      ["level alignment", "moving the deeper node up until both are at the same depth"],
      ["highest safe jump", "the largest jump that does not overshoot the common ancestor"],
    ],
    opening: "Walking up a tree one parent at a time costs the depth. Storing every ancestor a power of two up from each node turns that walk into a handful of jumps, and the same table answers both halves of the problem.",
    outcome: "You will build a lifting table, align two nodes to the same depth, and jump them upward without overshooting.",
    why: "Lowest common ancestor is the primitive underneath tree distances, path queries and heavy-light decomposition, and binary lifting is the version worth being able to write from memory.",
    mentalModel: "Picture climbing a ladder where you may jump one, two, four or eight rungs at a time. Any height is reachable in a few jumps, and the trick is never to jump past the rung you are looking for.",
    firstTitle: "The table, and aligning the depths",
    firstIntro: "Each level of the table doubles the jump, built by composing the level beneath it.",
    firstCode: `parent = [0, 0, 0, 1, 1, 2]
depth = [0, 1, 1, 2, 2, 2]
count = len(parent)
levels = max(1, count.bit_length())

up = [list(parent)]
for _ in range(1, levels):
    previous = up[-1]
    up.append([previous[previous[node]] for node in range(count)])

for level, row in enumerate(up):
    print(f"{2 ** level:>2} steps up: {row}")

def lift(node, steps):
    for level in range(levels):
        if steps >> level & 1:
            node = up[level][node]
    return node

print("two steps up from node 3:", lift(3, 2))`,
    firstTrace: "Each row is built by taking two jumps of the row beneath it, so the table costs the node count times the logarithm of the depth. Lifting a node by any number of steps reads the bits of that number and takes one jump per set bit. The root is its own parent, so overshooting the top is harmless rather than an error.",
    secondTitle: "Jump both together, never past the answer",
    secondIntro: "From the largest jump downward, move both nodes only when they would still differ.",
    secondCode: `parent = [0, 0, 0, 1, 1, 2]
depth = [0, 1, 1, 2, 2, 2]
count = len(parent)
levels = max(1, count.bit_length())
up = [list(parent)]
for _ in range(1, levels):
    previous = up[-1]
    up.append([previous[previous[node]] for node in range(count)])

def lowest_common(first, second):
    if depth[first] < depth[second]:
        first, second = second, first
    difference = depth[first] - depth[second]
    for level in range(levels):
        if difference >> level & 1:
            first = up[level][first]
    if first == second:
        return first
    for level in reversed(range(levels)):
        if up[level][first] != up[level][second]:
            first = up[level][first]
            second = up[level][second]
    return parent[first]

for a, b in ((3, 4), (3, 5), (4, 1), (5, 5)):
    print(f"lca({a}, {b}) = {lowest_common(a, b)}")`,
    secondTrace: "The deeper node is first raised to the other's depth, which handles the case where one is an ancestor of the other. After that the two rise together, taking a jump only when it leaves them still distinct, so they stop exactly one step beneath the answer. Returning the parent of either then gives the common ancestor.",
    mistake: "Do not jump when the two nodes would land on the same node. That means the jump has passed the common ancestor, and taking it loses the position the search was narrowing in on, so the loop returns an ancestor that is too high.",
    checkpoint: "Why does the second loop move the nodes only when the jump leaves them different?",
    checkpointAnswer: "Because landing on the same node means the jump reached the common ancestor or overshot it, and the search would lose the tighter position it had. Refusing those jumps leaves both nodes exactly one step beneath the answer, so the parent of either is what is wanted.",
    remember: "Store the ancestor two to the k steps up from every node. Align the depths first, then jump both upward only while the jump keeps them distinct.",
    checks: [
      q("What does each level of a lifting table store?", ["The ancestor two to that power of steps above each node", "The node's children", "The subtree size"], 0, "Each row composes two jumps of the row beneath it.", ["Correct. Any distance becomes a few jumps.", "Only upward links are stored.", "Sizes belong to a different decomposition."]),
      q("Why align the depths before the joint climb?", ["One node may be an ancestor of the other", "It halves the table size", "The jumps require equal depth to be valid"], 0, "Alignment handles the ancestor case directly.", ["Correct. If they meet during alignment, that is the answer.", "The table is unchanged.", "Jumps are valid at any depth."]),
      q("When is a joint jump refused?", ["When it would land both nodes on the same node", "When the nodes are leaves", "When the level is odd"], 0, "That jump has passed the answer.", ["Correct. Refusing it keeps the search tight.", "Leaves are where the search starts.", "Parity plays no part."]),
    ],
  },
  {
    lessonId: "py.ac.m9_1.l6",
    atomId: "py.atom.algo.sqrt-decomposition",
    conceptId: "py.algo.sqrt-decomposition",
    title: "Square-root blocks, when a tree is more than you need",
    requires: ["py.algo.lowest-common-ancestor"],
    vocabulary: [
      ["block", "a fixed-size contiguous chunk with its own stored aggregate"],
      ["partial block", "a block only partly inside the queried range"],
      ["balanced trade", "choosing a block size so both loops cost the same"],
      ["rebuild cost", "the work to bring one block's aggregate up to date"],
    ],
    opening: "Not every range problem needs a tree. Chopping the array into blocks of about the square root of its length gives updates and queries that are both fast enough, in a structure short enough to write under pressure.",
    outcome: "You will choose a block size, answer a range from whole blocks plus edges, and explain why the square root is the balance point.",
    why: "It handles operations a segment tree struggles with, such as queries needing a sorted block or a frequency count, and it is often the fastest thing to write correctly in an interview.",
    mentalModel: "Picture a bookshelf split into labelled sections, each with a card showing its total. Counting a span means reading the cards for the whole sections and counting individual books only at the two ends.",
    firstTitle: "Whole blocks, plus the two ragged ends",
    firstIntro: "A range is at most two partial blocks and everything between them.",
    firstCode: `import math

class Blocks:
    def __init__(self, values):
        self.values = list(values)
        self.width = max(1, math.isqrt(len(values)))
        self.totals = [sum(self.values[i:i + self.width])
                       for i in range(0, len(self.values), self.width)]

    def range_sum(self, left, right):
        total = 0
        while left <= right and left % self.width:
            total += self.values[left]
            left += 1
        while left + self.width - 1 <= right:
            total += self.totals[left // self.width]
            left += self.width
        while left <= right:
            total += self.values[left]
            left += 1
        return total

values = [3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5]
blocks = Blocks(values)
print("block width:", blocks.width, "blocks:", len(blocks.totals))
print("sum 2..8:", blocks.range_sum(2, 8), "expected", sum(values[2:9]))`,
    firstTrace: "The first loop walks forward until the position lands on a block boundary, the middle loop takes whole blocks at a time, and the last loop mops up the tail. Each ragged end costs less than a block width and the middle costs one step per block. That is why the two terms balance when the width is about the square root.",
    secondTitle: "Updates touch one value and one total",
    secondIntro: "A point update repairs exactly the block containing it.",
    secondCode: `import math

class Blocks:
    def __init__(self, values):
        self.values = list(values)
        self.width = max(1, math.isqrt(len(values)))
        self.totals = [sum(self.values[i:i + self.width])
                       for i in range(0, len(self.values), self.width)]

    def update(self, index, value):
        self.totals[index // self.width] += value - self.values[index]
        self.values[index] = value

    def range_sum(self, left, right):
        total = 0
        while left <= right and left % self.width:
            total += self.values[left]
            left += 1
        while left + self.width - 1 <= right:
            total += self.totals[left // self.width]
            left += self.width
        while left <= right:
            total += self.values[left]
            left += 1
        return total

values = [3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5]
blocks = Blocks(values)
blocks.update(3, 100)
values[3] = 100
print("sum 2..8 after update:", blocks.range_sum(2, 8), "expected", sum(values[2:9]))
print("only one block total changed")`,
    secondTrace: "The update adjusts the stored total by the difference rather than recomputing the block, which is why it is a constant-time operation. Only the block containing the position can be wrong, and every other total is untouched. Both operations are now bounded by the block width or the block count, whichever is larger.",
    mistake: "Do not choose the block size without thinking about the operation mix. The square root balances equal numbers of updates and queries, and a workload dominated by one of them is better served by a smaller or larger block than the default.",
    checkpoint: "Why is the square root of the length the balanced block size?",
    checkpointAnswer: "Because the query walks at most one block width at each end and one step per whole block in the middle. Those two costs are the width and the length divided by the width, and they are equal exactly when the width is the square root of the length.",
    remember: "Split into blocks of about the square root of the length. A query is two partial ends plus whole blocks between them, and a point update repairs exactly one stored total.",
    checks: [
      q("What does a range query cost with square-root blocks?", ["About the square root of the length", "Logarithmic time", "Constant time"], 0, "The two ends and the middle balance there.", ["Correct. Slower than a tree, and far shorter to write.", "That would be a segment tree.", "Nothing is precomputed for constant queries."]),
      q("What does a point update touch?", ["One value and one block total", "Every block total", "A logarithmic path"], 0, "Only the containing block can change.", ["Correct. Adjust by the difference rather than rebuilding.", "The others are unaffected.", "There is no tree to walk."]),
      q("When is a block size other than the square root better?", ["When updates and queries are very unequal in number", "When the values are large", "When the array is sorted"], 0, "The square root balances equal counts.", ["Correct. Skew the size toward the cheaper operation.", "Magnitude is irrelevant.", "Order does not affect the trade."]),
    ],
  },
  {
    lessonId: "py.ac.m9_1.l7",
    atomId: "py.atom.algo.mos-algorithm",
    conceptId: "py.algo.mos-algorithm",
    title: "Mo's algorithm reorders the questions",
    requires: ["py.algo.sqrt-decomposition"],
    vocabulary: [
      ["offline query", "one that may be answered in any order, since all are known up front"],
      ["pointer movement", "the total distance the range boundaries travel across all queries"],
      ["block ordering", "sorting queries by the block of their left endpoint"],
      ["incremental update", "adjusting an answer by adding or removing one element"],
    ],
    opening: "Every structure so far answers queries in the order they arrive. If they are all known in advance, that constraint can be dropped, and reordering them so consecutive queries are similar makes each one cheap to reach from the last.",
    outcome: "You will order queries by block and endpoint, and count the pointer movement that ordering saves.",
    why: "Some queries have no efficient tree, such as counting distinct values in a range. Mo's algorithm handles those whenever adding or removing one element is cheap, which is a large class.",
    mentalModel: "Picture a librarian handed a stack of shelf ranges to survey. Walking them in the given order means crossing the room repeatedly, and sorting them first means the walk is short between one and the next.",
    firstTitle: "Sort by block, then by the right endpoint",
    firstIntro: "Grouping left endpoints by block bounds how far the left pointer can travel.",
    firstCode: `import math

def order(queries, length):
    width = max(1, math.isqrt(length))
    return sorted(range(len(queries)),
                  key=lambda i: (queries[i][0] // width, queries[i][1]))

queries = [(0, 5), (3, 9), (1, 2), (6, 10)]
sequence = order(queries, 11)
print("given order:  ", queries)
print("visiting order:", [queries[i] for i in sequence])
print("indices:", sequence)`,
    firstTrace: "Queries whose left endpoints fall in the same block are grouped together and sorted by their right endpoint. Within a block the right pointer only moves forward, and the left pointer stays inside one block width. The answers are reported against their original indices, which is why the sort works on positions rather than the queries themselves.",
    secondTitle: "Counting the movement the ordering saves",
    secondIntro: "Comparing the total pointer travel makes the benefit concrete.",
    secondCode: `import math

def travel(sequence, queries):
    left = right = 0
    total = 0
    for index in sequence:
        want_left, want_right = queries[index]
        total += abs(want_left - left) + abs(want_right - right)
        left, right = want_left, want_right
    return total

queries = [(0, 90), (50, 60), (1, 95), (51, 99), (2, 80), (52, 70)]
length = 100
width = max(1, math.isqrt(length))
sorted_sequence = sorted(range(len(queries)),
                         key=lambda i: (queries[i][0] // width, queries[i][1]))

print("given order:  ", travel(range(len(queries)), queries))
print("Mo's order:   ", travel(sorted_sequence, queries))
print("block width:", width)`,
    secondTrace: "The given order forces the right pointer to swing across the array repeatedly, and the sorted order lets it advance steadily within each block. The saving grows with the number of queries, since the given order pays that swing every time. The whole method is worthwhile precisely when that total movement is smaller than answering each query directly.",
    mistake: "Do not use Mo's algorithm when the queries must be answered as they arrive. The entire saving comes from reordering them, so an online setting removes the only advantage the method has.",
    checkpoint: "What must be true of the per-element operation for Mo's algorithm to be worth using?",
    checkpointAnswer: "Adding or removing one element from the current range must be cheap, ideally constant time. The method's cost is the total pointer movement multiplied by that per-element cost, so an expensive update destroys the benefit the reordering bought.",
    remember: "Sort queries by the block of their left endpoint, then by their right endpoint. The method needs all queries up front and a cheap way to add or remove one element.",
    checks: [
      q("What does Mo's algorithm require of the queries?", ["They must all be known in advance", "They must be sorted by length", "They must not overlap"], 0, "The saving comes entirely from reordering.", ["Correct. An online setting removes the advantage.", "The sort key is the endpoints.", "Overlap is expected and helpful."]),
      q("Why sort by the block of the left endpoint?", ["It bounds how far the left pointer can travel", "It makes the right pointer monotone overall", "It groups equal-length ranges"], 0, "Within a block the left pointer stays local.", ["Correct. The right pointer is monotone within a block.", "It resets at each block boundary.", "Length is not part of the key."]),
      q("What kills the benefit of the method?", ["An expensive per-element add or remove", "A large array", "Many queries"], 0, "The cost is movement times per-element cost.", ["Correct. Constant-time updates are what make it work.", "Array size is handled by the block width.", "More queries improve the amortization."]),
    ],
  },
  {
    lessonId: "py.ac.m9_1.l8",
    atomId: "py.atom.algo.heavy-light",
    conceptId: "py.algo.heavy-light",
    title: "Heavy-light turns a tree path into array ranges",
    requires: ["py.algo.mos-algorithm"],
    vocabulary: [
      ["heavy child", "the child whose subtree is the largest"],
      ["chain", "a path formed by following heavy children downward"],
      ["chain head", "the topmost node of a chain"],
      ["position mapping", "the array index assigned to each node by the traversal"],
    ],
    opening: "Range structures work on arrays, and a tree path is not an array. Heavy-light decomposition assigns positions so that any path between two nodes is covered by a logarithmic number of contiguous ranges.",
    outcome: "You will compute subtree sizes, identify heavy children, and see why the chain count on any path is logarithmic.",
    why: "Path queries and updates on trees are otherwise linear, and this decomposition reduces them to the array structures already covered. The size argument behind the logarithmic bound is worth understanding rather than memorizing.",
    mentalModel: "Picture a river system where at each junction you follow the larger tributary. Those main channels are the chains, and crossing from one to another always means moving to a basin at least twice as large.",
    firstTitle: "Sizes decide which child is heavy",
    firstIntro: "The heavy child is simply the one with the biggest subtree.",
    firstCode: `children = {0: [1, 2], 1: [3, 4], 2: [5, 6], 3: [7],
            4: [], 5: [], 6: [], 7: []}
count = len(children)

def subtree_sizes(root):
    size = [1] * count
    order = []
    stack = [root]
    while stack:
        node = stack.pop()
        order.append(node)
        stack.extend(children[node])
    for node in reversed(order):
        for child in children[node]:
            size[node] += size[child]
    return size

size = subtree_sizes(0)
print("sizes:", size)
for node in range(count):
    if children[node]:
        heavy = max(children[node], key=lambda c: size[c])
        print(f"node {node} heavy child: {heavy}")`,
    firstTrace: "Sizes are computed by walking the traversal order backward, so every child is finished before its parent needs it. The heavy child is whichever subtree is largest, with ties broken arbitrarily. Every other child begins a new chain of its own.",
    secondTitle: "Chains, and why a path crosses few of them",
    secondIntro: "Following heavy children assigns consecutive positions along each chain.",
    secondCode: `children = {0: [1, 2], 1: [3, 4], 2: [5, 6], 3: [7],
            4: [], 5: [], 6: [], 7: []}
count = len(children)
size = [8, 4, 3, 2, 1, 1, 1, 1]

head = [0] * count
position = [0] * count
counter = 0

def assign(node, chain_head):
    global counter
    head[node] = chain_head
    position[node] = counter
    counter += 1
    if not children[node]:
        return
    heavy = max(children[node], key=lambda c: size[c])
    assign(heavy, chain_head)
    for child in children[node]:
        if child != heavy:
            assign(child, child)

assign(0, 0)
print("chain head per node:", head)
print("array position per node:", position)
print("distinct chains:", len(set(head)))`,
    secondTrace: "Each chain occupies consecutive array positions, so a segment of a chain is a contiguous range. Moving from one chain to another always steps into a subtree at least twice as large, which is why no path can cross more than a logarithmic number of chains. That bound is what makes the whole decomposition worthwhile.",
    mistake: "Do not assign positions in an arbitrary traversal order. The heavy child must be visited immediately after its parent, or the chain is not contiguous in the array and the range structure cannot address it as a single span.",
    checkpoint: "Why can a path cross only a logarithmic number of chains?",
    checkpointAnswer: "Because leaving a chain means moving to a light child, whose subtree is at most half its parent's. Each such step at least halves the remaining subtree size, so the number of them is bounded by the logarithm of the node count.",
    remember: "Follow the largest child to form chains and assign each chain consecutive positions. Any path is a logarithmic number of contiguous ranges, which the array structures can then answer.",
    checks: [
      q("Which child continues the current chain?", ["The one with the largest subtree", "The leftmost child", "The deepest child"], 0, "Size is what bounds the chain crossings.", ["Correct. Every other child starts a new chain.", "Order in the list is arbitrary.", "Depth is not what is compared."]),
      q("Why is the number of chains on a path logarithmic?", ["Leaving a chain at least halves the remaining subtree", "Chains are balanced by construction", "The tree is always balanced"], 0, "A light child has at most half its parent's subtree.", ["Correct. That bound holds on any tree.", "Chain lengths vary freely.", "The tree need not be balanced."]),
      q("Why must the heavy child be visited immediately after its parent?", ["Otherwise the chain is not contiguous in the array", "It changes the subtree sizes", "It affects the root choice"], 0, "Range structures need a single span.", ["Correct. Contiguity is the whole point of the mapping.", "Sizes are computed beforehand.", "The root is fixed."]),
    ],
  },
  {
    lessonId: "py.ac.m9_1.l9",
    atomId: "py.atom.algo.persistent-structures",
    conceptId: "py.algo.persistent-structures",
    title: "Persistence keeps every version, cheaply",
    requires: ["py.algo.heavy-light"],
    vocabulary: [
      ["persistent structure", "one where past versions remain readable after an update"],
      ["structural sharing", "reusing unchanged parts between versions instead of copying"],
      ["path copying", "duplicating only the nodes from the root to the change"],
      ["version handle", "the root that identifies one particular version"],
    ],
    opening: "Undo, time travel and querying historical state all want the same thing: an update that produces a new version without destroying the old one. Copying everything is correct and unaffordable, and copying one path is both.",
    outcome: "You will build a structure where an update returns a new version, and count how much of it is shared rather than copied.",
    why: "Persistent structures underpin version control, functional languages and any query about how data looked at a past moment. The path-copying argument also explains why immutable data is not as expensive as it sounds.",
    mentalModel: "Picture a document where an edit copies only the page you changed and the chapter headings above it. Every other page is shared with the previous draft, and both drafts remain readable.",
    firstTitle: "A new version, sharing everything untouched",
    firstIntro: "Pushing onto an immutable list builds one new node and reuses the rest.",
    firstCode: `def push(rest, value):
    return (value, rest)

def to_list(node):
    out = []
    while node is not None:
        out.append(node[0])
        node = node[1]
    return out

empty = None
version_one = push(empty, 1)
version_two = push(version_one, 2)
version_three = push(version_one, 99)

print("version one:  ", to_list(version_one))
print("version two:  ", to_list(version_two))
print("version three:", to_list(version_three))
print("two and three share the tail:", version_two[1] is version_three[1])`,
    firstTrace: "Two different updates to the same version produce two independent results, and both still contain the original. The shared tail is the identical object rather than a copy, which is what makes the update cheap. Nothing was mutated, so the original version is exactly as it was.",
    secondTitle: "Path copying keeps the cost logarithmic",
    secondIntro: "In a balanced tree, only the nodes from the root to the change need duplicating.",
    secondCode: `def insert(node, key):
    if node is None:
        return (key, None, None)
    value, left, right = node
    if key < value:
        return (value, insert(left, key), right)
    if key > value:
        return (value, left, insert(right, key))
    return node

def collect(node, out):
    if node is None:
        return out
    value, left, right = node
    collect(left, out)
    out.append(value)
    collect(right, out)
    return out

base = None
for key in (5, 3, 8, 1, 4):
    base = insert(base, key)

added = insert(base, 6)
print("original:", collect(base, []))
print("new:     ", collect(added, []))
print("left subtree is shared:", base[1] is added[1])
print("only the path to the new key was copied")`,
    secondTrace: "Inserting into the right side rebuilds the root and the nodes along that side, and the entire left subtree is the same object in both versions. The number of copied nodes is the depth, which in a balanced tree is logarithmic. Both versions are fully usable, and neither can affect the other.",
    mistake: "Do not mutate a node that an older version might still reference. Structural sharing means the same object appears in several versions, so one in-place change silently rewrites history in every version that shares it.",
    checkpoint: "An update copies the path from the root to a change. How much of a balanced tree is that?",
    checkpointAnswer: "The depth, which is logarithmic in the node count. Everything hanging off that path is shared by reference rather than copied, so a tree of a million nodes costs about twenty new nodes per version rather than a million.",
    remember: "An update returns a new version and copies only the path to the change. Everything else is shared by reference, which is why the old version stays valid and the new one is cheap.",
    checks: [
      q("What does path copying duplicate?", ["Only the nodes from the root to the change", "The whole structure", "Only the changed node"], 0, "Everything else is shared by reference.", ["Correct. That is logarithmic in a balanced tree.", "Copying everything is what this avoids.", "The ancestors must also be rebuilt."]),
      q("Why must shared nodes never be mutated?", ["Several versions reference the same object", "Mutation is slower", "The nodes are tuples"], 0, "One change would rewrite every version sharing it.", ["Correct. Immutability is what makes sharing safe.", "Speed is not the concern.", "The representation is incidental."]),
      q("What does an update cost in a persistent balanced tree?", ["A logarithmic number of new nodes", "A constant number", "A linear copy"], 0, "The copied path is the depth.", ["Correct. A million-node tree costs about twenty.", "The ancestors must be rebuilt too.", "Sharing is what avoids the linear cost."]),
    ],
  },
];

export const ALGO_QUERY_DECOMPOSITION_ATOMS = ALGO_QUERY_DECOMPOSITION_SPECS.map(guidedMasteryAtom);
export const ALGO_QUERY_DECOMPOSITION_CONCEPTS = ALGO_QUERY_DECOMPOSITION_SPECS.map(guidedMasteryConcept);
export const ALGO_QUERY_DECOMPOSITION_LESSON_CONTENT = guidedLessonContent(ALGO_QUERY_DECOMPOSITION_SPECS);

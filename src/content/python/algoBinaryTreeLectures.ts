import type { LectureQuestion } from "../../types";
import { guidedLessonContent, guidedMasteryAtom, guidedMasteryConcept, type GuidedMasterySpec } from "./guidedMastery";

const q = (question: string, choices: [string, string, string], answer: 0 | 1 | 2, explanation: string, why: [string, string, string]): LectureQuestion => ({ question, choices, answer, explanation, why });

const SPECS: GuidedMasterySpec[] = [
  {
    lessonId: "py.ac.m4_1.l1", atomId: "py.atom.algo.tree-anatomy", conceptId: "py.algo.tree-anatomy",
    title: "A tree stores parent and child relationships", requires: ["py.algo.binary-search-shaped"],
    vocabulary: [["node", "one stored value and its links"], ["edge", "one connection between two nodes"], ["root", "the only node with no parent"], ["leaf", "a node with no children"], ["depth", "the number of edges from the root to a node"], ["height", "the longest downward edge path from a node to a leaf"]],
    opening: "A binary tree is made of nodes. Each node has at most a left child and a right child. The links create branches instead of one straight sequence.",
    outcome: "You will build a binary tree, name its root, leaves, depth, and height, and distinguish the data structure from special ordered trees.",
    why: "Trees model folders, syntax, decisions, indexes, and hierarchies. Precise anatomy makes recursive and iterative algorithms much easier to explain.",
    mentalModel: "Picture a family chart hanging downward. Start at one root. Every link moves to a child. A node owns only its value and references, not a drawn location.",
    firstTitle: "Build nodes with explicit links", firstIntro: "None means that a child position is empty. The shape comes from assignments between node objects.",
    firstCode: `class TreeNode:
    def __init__(self, value, left=None, right=None):
        self.value = value
        self.left = left
        self.right = right

root = TreeNode(8)
root.left = TreeNode(4, TreeNode(2), TreeNode(6))
root.right = TreeNode(12, None, TreeNode(14))

print(root.value, root.left.right.value)`,
    firstTrace: "Eight is the root. Four and twelve have depth one. Two, six, and fourteen are leaves at depth two. The root's height is two because its longest downward path uses two edges.",
    secondTitle: "Store the same shape as relationships", secondIntro: "An edge list records parent-child pairs but needs labels to preserve which child is left or right.",
    secondCode: `edges = [
    (8, 4, "left"), (8, 12, "right"),
    (4, 2, "left"), (4, 6, "right"),
    (12, 14, "right"),
]

children = {}
for parent, child, side in edges:
    children.setdefault(parent, {})[side] = child

print(children[4])`,
    secondTrace: "The mapping says node four has left child two and right child six. It describes relationships, but object nodes make downward navigation direct. Different representations suit different input formats.",
    mistake: "Do not assume every binary tree is a binary search tree. Binary means at most two children. A search tree adds an ordering rule that this module has not yet required.",
    checkpoint: "If a leaf is three edges from the root, what are that leaf's depth and height?",
    checkpointAnswer: "Its depth is three because the root path has three edges. Its height is zero because no edge travels downward from the leaf.",
    remember: "Depth looks upward to the root. Height looks downward to a farthest leaf. Binary describes child count, not value order.",
    checks: [q("What makes a node a leaf?", ["It has no children", "It has two parents", "It stores the smallest value"], 0, "Leaf status depends on child links.", ["Correct. Both child references are empty.", "A tree node has at most one parent.", "Value order is unrelated."]), q("How many edges does a nonempty tree with n nodes have?", ["n minus one", "n", "two n"], 0, "Every node except the root has one parent edge.", ["Correct. The root contributes no parent edge.", "That would create an extra connection.", "Binary capacity is not actual edge count."])],
  },
  {
    lessonId: "py.ac.m4_1.l2", atomId: "py.atom.algo.tree-dfs", conceptId: "py.algo.tree-dfs",
    title: "Depth-first search chooses when to visit the node", requires: ["py.algo.tree-anatomy"],
    vocabulary: [["depth-first search", "finish one branch before moving to another"], ["preorder", "visit node, then left subtree, then right subtree"], ["inorder", "visit left subtree, then node, then right subtree"], ["postorder", "visit both subtrees before the node"], ["call stack", "saved unfinished function calls used by recursion"]],
    opening: "The three depth-first traversals walk the same nodes. Their only difference is when the current node is processed relative to its two subtrees.",
    outcome: "You will trace preorder, inorder, and postorder recursively, write an iterative preorder with an explicit stack, and choose an order from the information flow.",
    why: "Traversal order controls whether work flows from parent to child or child to parent. Tree copying, expression evaluation, deletion, and ordered output use different orders.",
    mentalModel: "At each room, you have three possible moments to take a photo: on entry, between the two doors, or on exit. Those moments are preorder, inorder, and postorder.",
    firstTitle: "Move the visit line to change order", firstIntro: "The base case returns on an empty child. Every real node is reached once.",
    firstCode: `class TreeNode:
    def __init__(self, value, left=None, right=None):
        self.value, self.left, self.right = value, left, right

root = TreeNode("A", TreeNode("B", TreeNode("D"), TreeNode("E")), TreeNode("C"))

def traversals(node, pre, inside, post):
    if node is None:
        return
    pre.append(node.value)
    traversals(node.left, pre, inside, post)
    inside.append(node.value)
    traversals(node.right, pre, inside, post)
    post.append(node.value)

pre, inside, post = [], [], []
traversals(root, pre, inside, post)
print(pre, inside, post)`,
    firstTrace: "Preorder prints A B D E C because parents appear first. Inorder prints D B E A C because each node sits between its subtrees. Postorder prints D E B C A because children finish first.",
    secondTitle: "Replace recursive calls with a stack", secondIntro: "For preorder, push the right child first so the left child is popped and processed first.",
    secondCode: `def iterative_preorder(node):
    if node is None:
        return []
    order = []
    stack = [node]
    while stack:
        current = stack.pop()
        order.append(current.value)
        if current.right:
            stack.append(current.right)
        if current.left:
            stack.append(current.left)
    return order

print(iterative_preorder(root))`,
    secondTrace: "The stack saves unfinished right branches. Because it removes the most recently pushed item, pushing right before left recreates recursive left-first order. Time is theta n and extra space is theta height.",
    mistake: "Do not say recursion uses no space. The call stack stores one frame per active depth. A highly skewed tree can have height n and overflow Python's recursion limit.",
    checkpoint: "Which traversal naturally computes a parent's answer from answers returned by both children?",
    checkpointAnswer: "Postorder. It finishes the left and right subtree work before processing the parent, so both child answers are available.",
    remember: "Preorder sends work downward, inorder visits between children, and postorder combines finished child results. Recursion and an explicit stack represent the same unfinished work.",
    checks: [q("Why push right before left in iterative preorder?", ["The stack pops left first", "Right must be visited first", "It sorts the values"], 0, "A stack is last in, first out.", ["Correct. Left was pushed last.", "Preorder here is left-first.", "Traversal does not sort ordinary trees."]), q("What is DFS time on n nodes?", ["Theta n", "Theta height only", "Theta n squared always"], 0, "Each node is entered a constant number of times.", ["Correct. Every node is processed once.", "Height describes active space.", "No repeated full scan is required."])],
  },
  {
    lessonId: "py.ac.m4_1.l3", atomId: "py.atom.algo.tree-bfs", conceptId: "py.algo.tree-bfs",
    title: "Breadth-first search processes one level at a time", requires: ["py.algo.tree-dfs"],
    vocabulary: [["breadth-first search", "visit all nodes at one depth before the next depth"], ["level order", "tree nodes grouped or listed by depth"], ["queue", "a first-in, first-out collection"], ["level size", "the queue length before processing one complete level"], ["width", "the number of nodes present on a level"]],
    opening: "Breadth-first search spreads outward from the root. A queue preserves discovery order, so every node at depth d is processed before nodes at depth d plus one.",
    outcome: "You will implement level-order traversal, preserve level boundaries, produce a right-side view, and compare BFS memory with DFS memory.",
    why: "Level order solves nearest-node, minimum-depth, per-level average, and visible-side problems. Graph shortest paths reuse the same queue idea.",
    mentalModel: "Imagine a camera taking one horizontal photograph at a time. Put every child from the current photo into a waiting line for the next photo.",
    firstTitle: "Freeze the current level size", firstIntro: "The queue grows while children are added. Saving its starting length prevents those children from entering the current level.",
    firstCode: `from collections import deque
class TreeNode:
    def __init__(self, value, left=None, right=None):
        self.value, self.left, self.right = value, left, right
root = TreeNode(1, TreeNode(2, TreeNode(4), TreeNode(5)), TreeNode(3))
def level_order(node):
    if node is None:
        return []
    levels, queue = [], deque([node])
    while queue:
        level = []
        for _ in range(len(queue)):
            current = queue.popleft()
            level.append(current.value)
            if current.left: queue.append(current.left)
            if current.right: queue.append(current.right)
        levels.append(level)
    return levels

print(level_order(root))`,
    firstTrace: "The queue starts with one. Processing it enqueues two and three, but the saved level size was one. The next loop processes exactly two nodes. Output becomes one, then two-three, then four-five.",
    secondTitle: "Take the final node from each level", secondIntro: "In left-to-right BFS order, the final processed node on a level is visible from the right side.",
    secondCode: `def right_side_view(node):
    if node is None:
        return []
    view, queue = [], deque([node])
    while queue:
        level_size = len(queue)
        for position in range(level_size):
            current = queue.popleft()
            if current.left: queue.append(current.left)
            if current.right: queue.append(current.right)
            if position == level_size - 1:
                view.append(current.value)
    return view

print(right_side_view(root))`,
    secondTrace: "One is last on level zero, three is last on level one, and five is last on level two. The answer is one, three, five. Each node enters and leaves the queue once.",
    mistake: "Do not loop over the queue's changing length while adding children. Save level_size first. BFS extra space can reach theta maximum width, which may be much larger than tree height.",
    checkpoint: "Why are newly added children guaranteed to belong to the next level?",
    checkpointAnswer: "The queue initially contains only the current depth. Processing exactly its saved size removes those nodes while appending each of their children behind them.",
    remember: "A queue preserves discovery order. Freeze its size to preserve levels, and measure BFS space by the widest waiting frontier.",
    checks: [q("Which collection gives normal BFS order?", ["Queue", "Stack", "Unordered set only"], 0, "First discovered should be first processed.", ["Correct. FIFO preserves the frontier.", "A stack creates depth-first behavior.", "A set loses the needed order."]), q("What does BFS extra space depend on?", ["Maximum tree width", "Only the root value", "Sortedness"], 0, "A whole frontier may wait in the queue.", ["Correct. Wide levels use more memory.", "Many nodes may wait.", "Ordinary tree BFS needs no ordering invariant."])],
  },
  {
    lessonId: "py.ac.m4_1.l4", atomId: "py.atom.algo.tree-divide-conquer", conceptId: "py.algo.tree-divide-conquer",
    title: "A tree answer can be built from two smaller answers", requires: ["py.algo.tree-bfs"],
    vocabulary: [["subtree", "a node together with every descendant under it"], ["base case", "the smallest input answered directly"], ["return contract", "the exact meaning promised by one recursive call"], ["combine step", "how child answers produce the current answer"], ["divide and conquer", "solve smaller pieces and combine their results"]],
    opening: "Tree recursion becomes manageable when one call has one sentence of meaning. Trust the left and right calls to solve smaller subtrees, then combine their answers.",
    outcome: "You will define return contracts, compute subtree size and sum, check structural equality, and trace postorder information flowing upward.",
    why: "Most tree interview solutions use the same skeleton. The hard part is deciding what each child must return, not memorizing dozens of separate functions.",
    mentalModel: "Picture each child handing its parent a small report. The parent reads two reports, adds its own information, and hands one new report upward.",
    firstTitle: "Return two facts from every subtree", firstIntro: "For an empty subtree, both node count and value sum are zero. A real node combines both child reports.",
    firstCode: `class TreeNode:
    def __init__(self, value, left=None, right=None):
        self.value, self.left, self.right = value, left, right

root = TreeNode(5, TreeNode(2), TreeNode(8, TreeNode(7), None))

def subtree_report(node):
    if node is None:
        return 0, 0
    left_count, left_sum = subtree_report(node.left)
    right_count, right_sum = subtree_report(node.right)
    count = 1 + left_count + right_count
    total = node.value + left_sum + right_sum
    return count, total

print(subtree_report(root))`,
    firstTrace: "Leaf two returns one node and sum two. Leaf seven returns one and seven. Node eight combines an empty left report with seven, returning two and fifteen. Root five returns four and twenty-two.",
    secondTitle: "Combine two truth reports", secondIntro: "Two trees match only when current values match and both corresponding child pairs match.",
    secondCode: `def same_tree(first, second):
    if first is None and second is None:
        return True
    if first is None or second is None:
        return False
    return (
        first.value == second.value
        and same_tree(first.left, second.left)
        and same_tree(first.right, second.right)
    )

copy = TreeNode(5, TreeNode(2), TreeNode(8, TreeNode(7), None))
changed = TreeNode(5, TreeNode(2), TreeNode(9))
print(same_tree(root, copy), same_tree(root, changed))`,
    secondTrace: "Two empty positions match. One empty and one real position fail. Real positions compare their values and both child pairs. One mismatch travels upward through and, making the whole result false.",
    mistake: "Do not start coding before stating the return contract. A function that sometimes returns height and sometimes returns a Boolean forces confusing special cases at its parent.",
    checkpoint: "What sentence describes subtree_report's return contract?",
    checkpointAnswer: "For the subtree rooted at node, return its total number of real nodes and the sum of all their values. Empty subtrees return zero and zero.",
    remember: "Write one return-contract sentence, choose the empty answer, trust both smaller calls, and combine their reports at the current node.",
    checks: [q("Which traversal order naturally combines child returns?", ["Postorder", "Level order only", "Random order"], 0, "Both child calls finish before the parent combines.", ["Correct. Information flows upward.", "BFS can solve other tasks but not this recursive skeleton.", "Dependencies determine order."]), q("What should a recursive return contract describe?", ["The answer for exactly one subtree", "Every future interview question", "Only printed output"], 0, "Each call solves the same shaped smaller problem.", ["Correct. That keeps recursion local.", "A contract should be specific.", "Recursive callers need returned information."])],
  },
  {
    lessonId: "py.ac.m4_1.l5", atomId: "py.atom.algo.tree-path-depth", conceptId: "py.algo.tree-path-depth",
    title: "Tree path problems separate returned facts from global answers", requires: ["py.algo.tree-divide-conquer"],
    vocabulary: [["path", "a sequence of connected nodes with no repeated edge"], ["diameter", "the greatest number of edges on any path"], ["balanced tree", "every node's child heights differ by at most one"], ["path gain", "the best downward path sum offered to a parent"], ["global answer", "the best complete result seen anywhere in the traversal"]],
    opening: "A parent can extend one child path upward, but a complete path may join both children. This difference explains many path algorithms.",
    outcome: "You will compute diameter, detect imbalance without repeated height scans, compute maximum path sum, and distinguish returned values from complete global candidates.",
    why: "Diameter, balance, and maximum path sum all use one postorder visit. A precise return contract prevents quadratic rescanning and broken paths.",
    mentalModel: "Each node may bridge its left and right branches. It reports only its strongest single road because a parent cannot extend a fork.",
    firstTitle: "Return height while updating diameter", firstIntro: "Child heights count nodes on a downward branch. Joining both branches uses left height plus right height edges.",
    firstCode: `class TreeNode:
    def __init__(self, value, left=None, right=None):
        self.value, self.left, self.right = value, left, right

root = TreeNode(1, TreeNode(2, TreeNode(4), TreeNode(5)), TreeNode(3))

def tree_diameter(node):
    best = 0
    def height(current):
        nonlocal best
        if current is None:
            return 0
        left = height(current.left)
        right = height(current.right)
        best = max(best, left + right)
        return 1 + max(left, right)
    height(node)
    return best

print(tree_diameter(root))`,
    firstTrace: "At node two, the joined path uses leaf four, node two, and leaf five, giving two edges. At root one, a deepest left branch joins node three, giving three edges and the final diameter.",
    secondTitle: "Use a sentinel for balance and a clipped gain for sums", secondIntro: "Negative one reports imbalance immediately. Maximum path sum clips harmful negative branches to zero.",
    secondCode: `def is_balanced(node):
    def height(current):
        if current is None: return 0
        left, right = height(current.left), height(current.right)
        if left < 0 or right < 0 or abs(left - right) > 1: return -1
        return 1 + max(left, right)
    return height(node) >= 0

def maximum_path_sum(node):
    best = float("-inf")
    def gain(current):
        nonlocal best
        if current is None: return 0
        left, right = max(0, gain(current.left)), max(0, gain(current.right))
        best = max(best, current.value + left + right)
        return current.value + max(left, right)
    gain(node)
    return best

print(is_balanced(root), maximum_path_sum(root))`,
    secondTrace: "Balance returns a height only while the subtree is valid. Path sum considers a complete fork for best, then returns one branch upward. Clipping at zero means a negative branch is better omitted.",
    mistake: "Do not return a forked gain; that creates three branches. Do not recompute full heights at every node, which can make a skewed tree quadratic.",
    checkpoint: "Why can maximum path sum update best with two child gains but return only one child gain?",
    checkpointAnswer: "A complete path may end in both child subtrees and meet at the current node. A parent can extend only one unbranched route through the current node.",
    remember: "Return the one fact a parent may extend. Update a separate best answer with any complete candidate that can finish at the current node.",
    checks: [q("What does the diameter helper return to its parent?", ["One downward height", "The whole forked diameter path", "A queue"], 0, "A parent can extend one branch.", ["Correct. Diameter itself is tracked separately.", "A fork cannot be extended as one path.", "This is postorder recursion."]), q("Why clip a negative path gain to zero?", ["Omitting it gives a larger sum", "All tree values are positive", "Zero marks a visited node"], 0, "A path is not required to include a harmful child branch.", ["Correct. The current node may start a better path.", "Negative values are allowed.", "No visited set is needed in a tree."])],
  },
  {
    lessonId: "py.ac.m4_1.l6", atomId: "py.atom.algo.tree-serialization", conceptId: "py.algo.tree-serialization",
    title: "Tree encoding must preserve missing-child positions", requires: ["py.algo.tree-path-depth"],
    vocabulary: [["serialization", "turn a structure into a storable sequence"], ["deserialization", "rebuild the structure from its sequence"], ["null marker", "a token recording an empty child position"], ["preorder encoding", "write a node before encoding its left and right children"], ["reconstruction", "build the original tree from enough traversal information"]],
    opening: "Values alone do not describe a tree's shape. A correct encoding records where children are missing, or combines traversals whose positions reveal the same structure.",
    outcome: "You will serialize and deserialize with preorder null markers, reconstruct from preorder plus inorder, and state the assumptions needed for an unambiguous rebuild.",
    why: "Tree encoding appears in storage, network transfer, cloning, compiler data, and interviews. Missing shape information can rebuild a different tree with the same values.",
    mentalModel: "Pack a model tree into a box. Every branch and empty socket needs a label so unpacking restores each position.",
    firstTitle: "Record empty positions in preorder", firstIntro: "A hash token marks None. During decoding, one moving index consumes exactly one token for each real or empty node position.",
    firstCode: `class TreeNode:
    def __init__(self, value, left=None, right=None): self.value, self.left, self.right = value, left, right
def serialize(root):
    tokens = []
    def visit(node):
        if node is None:
            tokens.append("#"); return
        tokens.append(str(node.value))
        visit(node.left); visit(node.right)
    visit(root)
    return ",".join(tokens)
def deserialize(data):
    tokens = iter(data.split(","))
    def build():
        token = next(tokens)
        if token == "#": return None
        node = TreeNode(int(token))
        node.left, node.right = build(), build()
        return node
    return build()
encoded = serialize(TreeNode(5, TreeNode(2), TreeNode(8, None, TreeNode(9))))
print(encoded, serialize(deserialize(encoded)))`,
    firstTrace: "Each real node consumes one value token. Each missing child consumes one hash token. The decoder follows the same node-left-right order, so its moving index rebuilds every socket exactly once.",
    secondTitle: "Combine preorder with inorder positions", secondIntro: "Preorder reveals the next root. Inorder reveals how many values belong to its left and right subtrees. Values must be unique for this simple map.",
    secondCode: `def build_from_orders(preorder, inorder):
    positions = {value: index for index, value in enumerate(inorder)}
    preorder_index = 0
    def build(left, right):
        nonlocal preorder_index
        if left > right: return None
        value = preorder[preorder_index]
        preorder_index += 1
        node = TreeNode(value)
        split = positions[value]
        node.left = build(left, split - 1)
        node.right = build(split + 1, right)
        return node
    return build(0, len(inorder) - 1)

rebuilt = build_from_orders([5, 2, 8, 9], [2, 5, 8, 9])
print(serialize(rebuilt))`,
    secondTrace: "Preorder picks five as root. Inorder puts two left and eight-nine right. The moving preorder index supplies each subtree root. The map avoids repeated searches.",
    mistake: "Do not omit null markers from a single traversal; different shapes can share the same value order. Preorder plus inorder also needs unique values or extra occurrence information.",
    checkpoint: "Why is preorder alone unambiguous when every empty child is written as a null marker?",
    checkpointAnswer: "Each real token promises exactly two following child encodings, and every absent child consumes its own token. That grammar fixes all child boundaries and the complete shape.",
    remember: "Preserve shape as well as values. Use null markers with one traversal, or combine traversals with explicit uniqueness assumptions.",
    checks: [q("What information do null markers preserve?", ["Missing-child positions and shape", "Only sorted order", "Tree height without values"], 0, "Empty sockets distinguish structures with the same real values.", ["Correct. The decoder knows every child boundary.", "Serialization does not require sorting.", "Values and shape are both encoded."]), q("What does inorder contribute to preorder reconstruction?", ["The split between left and right subtrees", "The next root directly", "A guarantee of balanced height"], 0, "The root's inorder position separates child regions.", ["Correct. Preorder supplies the root.", "Preorder supplies roots in sequence.", "The original tree may be skewed."])],
  },
];

export const ALGO_BINARY_TREE_ATOMS = SPECS.map(guidedMasteryAtom);
export const ALGO_BINARY_TREE_CONCEPTS = SPECS.map(guidedMasteryConcept);
export const ALGO_BINARY_TREE_LESSON_CONTENT = guidedLessonContent(SPECS);

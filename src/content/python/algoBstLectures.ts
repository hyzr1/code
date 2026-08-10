import type { LectureQuestion } from "../../types";
import { guidedLessonContent, guidedMasteryAtom, guidedMasteryConcept, type GuidedMasterySpec } from "./guidedMastery";

const q = (question: string, choices: [string, string, string], answer: 0 | 1 | 2, explanation: string, why: [string, string, string]): LectureQuestion => ({ question, choices, answer, explanation, why });

const SPECS: GuidedMasterySpec[] = [
  {
    lessonId: "py.ac.m4_2.l1", atomId: "py.atom.algo.bst-invariant", conceptId: "py.algo.bst-invariant",
    title: "A BST orders every whole subtree", requires: ["py.algo.tree-serialization"],
    vocabulary: [["binary search tree", "a binary tree with an ordering rule at every node"], ["BST invariant", "all left keys are smaller and all right keys are larger under one duplicate policy"], ["search path", "the single root-to-child route chosen by comparisons"], ["successor", "the smallest key greater than a given key"]],
    opening: "A binary search tree, or BST, adds one powerful rule to a binary tree. Every comparison can discard an entire subtree instead of only one node.",
    outcome: "You will search, insert, and delete keys, preserve the whole-subtree invariant, and connect operation cost to tree height rather than node count alone.",
    why: "Ordered sets, maps, database indexes, and interval structures build on search-tree ideas. Interviews test deletion because it reveals whether you truly preserve structure.",
    mentalModel: "Each node is a fork. Smaller keys go left and larger keys go right. One wrong placement can break later searches.",
    firstTitle: "Search and insert along one path", firstIntro: "Comparisons choose one child. Insertion stops at the first empty child position where the ordering rule allows the new key.",
    firstCode: `class Node:
    def __init__(self, key, left=None, right=None): self.key, self.left, self.right = key, left, right

def search(root, key):
    current = root
    while current and current.key != key:
        current = current.left if key < current.key else current.right
    return current

def insert(root, key):
    if root is None: return Node(key)
    if key < root.key: root.left = insert(root.left, key)
    elif key > root.key: root.right = insert(root.right, key)
    return root

root = None
for key in [8, 3, 10, 1, 6, 14]: root = insert(root, key)
print(search(root, 6).key, search(root, 7))`,
    firstTrace: "Searching for six compares with eight and goes left, then compares with three and goes right. Insertion follows the same decisions until it reaches None. Duplicate keys are ignored by this chosen policy.",
    secondTitle: "Delete by repairing three possible shapes", secondIntro: "A node may have zero, one, or two children. With two children, copy its inorder successor, then delete that successor from the right subtree.",
    secondCode: `def delete(root, key):
    if root is None: return None
    if key < root.key: root.left = delete(root.left, key)
    elif key > root.key: root.right = delete(root.right, key)
    else:
        if root.left is None: return root.right
        if root.right is None: return root.left
        successor = root.right
        while successor.left: successor = successor.left
        root.key = successor.key
        root.right = delete(root.right, successor.key)
    return root

root = delete(root, 8)
print(search(root, 8), root.key)`,
    secondTrace: "Eight has two children. Its successor is ten, the smallest key in the right subtree. Replacing eight with ten preserves ordering, and removing the old ten removes the duplicate position.",
    mistake: "Checking immediate children is not enough. Every left descendant must fit the lower range, and every right descendant must fit the upper range.",
    checkpoint: "Why can deleting a two-child node use the smallest key from its right subtree?",
    checkpointAnswer: "The successor beats every left key but not the other right keys. It can replace the deleted key without crossing the ordering boundary.",
    remember: "BST work follows one comparison path, deletion repairs local structure, and running time is theta height: logarithmic when balanced and linear when skewed.",
    checks: [q("What determines ordinary BST operation time?", ["Tree height", "Only key size", "Always log n"], 0, "One node is visited per level on a path.", ["Correct. Balance controls height.", "Numeric magnitude is irrelevant.", "A skewed BST can be linear."]), q("What replaces a deleted node with two children?", ["Its successor or predecessor", "Any random leaf", "Always None"], 0, "A neighboring ordered key preserves subtree ranges.", ["Correct. Then remove its old position.", "A random key can violate order.", "That would discard both subtrees."])],
  },
  {
    lessonId: "py.ac.m4_2.l2", atomId: "py.atom.algo.bst-inorder", conceptId: "py.algo.bst-inorder",
    title: "BST inorder traversal produces sorted keys", requires: ["py.algo.bst-invariant"],
    vocabulary: [["inorder traversal", "visit left subtree, node, then right subtree"], ["validation", "checking that every required invariant holds"], ["strict bound", "a limit a key cannot equal"], ["kth smallest", "the key at one-based position k in sorted order"]],
    opening: "Inorder traversal reads a valid distinct-key BST from smallest to largest. That fact supports validation, ranking, merging, and ordered output.",
    outcome: "You will validate with inherited numeric bounds, find the kth smallest key iteratively, and explain why comparing only parents with children is insufficient.",
    why: "The inorder property turns a tree question into sorted-order reasoning. Bounds also provide a reusable way to validate every descendant, not just nearby nodes.",
    mentalModel: "Each node owns an allowed number interval. Moving left lowers the ceiling. Moving right raises the floor. A key outside its inherited interval exposes a hidden violation.",
    firstTitle: "Pass the full allowed range downward", firstIntro: "Start with no finite limits. Each node becomes a strict bound for one child subtree.",
    firstCode: `class Node:
    def __init__(self, key, left=None, right=None): self.key, self.left, self.right = key, left, right

def is_valid_bst(root):
    def valid(node, low, high):
        if node is None: return True
        if not low < node.key < high: return False
        return valid(node.left, low, node.key) and valid(node.right, node.key, high)
    return valid(root, float("-inf"), float("inf"))

good = Node(8, Node(3), Node(10))
hidden_bad = Node(8, Node(3, None, Node(9)), Node(10))
print(is_valid_bst(good), is_valid_bst(hidden_bad))`,
    firstTrace: "Nine is an immediate right child of three, so a local comparison looks fine. But it remains inside eight's left subtree and violates the inherited ceiling of eight. Bounds catch it.",
    secondTitle: "Stop inorder traversal at rank k", secondIntro: "An explicit stack reaches the next-smallest key without materializing every key. Decrement k each time a node is popped.",
    secondCode: `def kth_smallest(root, k):
    stack, current = [], root
    while stack or current:
        while current:
            stack.append(current)
            current = current.left
        current = stack.pop()
        k -= 1
        if k == 0: return current.key
        current = current.right
    raise ValueError("k exceeds node count")

tree = Node(8, Node(3, Node(1), Node(6)), Node(10))
print(kth_smallest(tree, 3))`,
    secondTrace: "The stack first exposes one, then three, then six. The third pop returns six. Work is theta height plus k in a balanced tree, and stack space is theta height.",
    mistake: "Do not validate by sorting an inorder list and accepting equal keys unless the tree's duplicate policy permits them. State whether bounds are strict and how duplicates are placed.",
    checkpoint: "Why can a descendant violate the BST rule even when it compares correctly with its parent?",
    checkpointAnswer: "The descendant must satisfy bounds inherited from every ancestor. A left-subtree key can exceed the root while still exceeding its smaller parent correctly.",
    remember: "Inorder exposes sorted order. Ancestor bounds validate the whole invariant, and an explicit stack can stop once the requested rank is reached.",
    checks: [q("What order does inorder produce for a valid distinct-key BST?", ["Increasing key order", "Random order", "Level order"], 0, "Left keys precede the node and right keys follow it.", ["Correct. This is the central property.", "The invariant fixes the order.", "BFS is a different traversal."]), q("Why carry both low and high bounds?", ["They summarize all ancestor restrictions", "They count tree levels", "They make keys unique automatically"], 0, "A parent comparison alone forgets older limits.", ["Correct. Hidden violations are caught.", "Depth is separate.", "Duplicate policy must still be stated."])],
  },
  {
    lessonId: "py.ac.m4_2.l3", atomId: "py.atom.algo.bst-balancing", conceptId: "py.algo.bst-balancing",
    title: "Balanced BSTs keep paths logarithmic", requires: ["py.algo.bst-inorder"],
    vocabulary: [["balanced BST", "a search tree whose height stays proportional to log n"], ["rotation", "a local pointer change that preserves inorder key order"], ["AVL tree", "a BST that strictly limits child-height difference"], ["red-black tree", "a BST using color rules to limit path length"], ["rebalancing", "rotations and metadata changes that restore balance rules"]],
    opening: "A BST can become a linked list when keys arrive in sorted order. Self-balancing trees repair their shape so search paths remain logarithmic.",
    outcome: "You will show how a rotation preserves sorted order, compare AVL and red-black guarantees, and explain why maintained metadata makes updates more expensive than plain BST updates.",
    why: "Language maps, ordered sets, kernels, and databases need predictable operations. Balance is the missing condition behind honest logarithmic BST claims.",
    mentalModel: "Imagine a mobile hanging from strings. A rotation moves one joint upward and another downward without changing the left-to-right order of the hanging labels.",
    firstTitle: "Rotate left without changing inorder order", firstIntro: "The right child rises. Its left subtree moves into the old root's right opening because those keys lie between both node keys.",
    firstCode: `class Node:
    def __init__(self, key, left=None, right=None): self.key, self.left, self.right = key, left, right

def inorder(node):
    return inorder(node.left) + [node.key] + inorder(node.right) if node else []

def rotate_left(root):
    new_root = root.right
    middle = new_root.left
    new_root.left = root
    root.right = middle
    return new_root

root = Node(10, Node(5), Node(20, Node(15), Node(30)))
before = inorder(root)
root = rotate_left(root)
print(before, inorder(root), root.key)`,
    firstTrace: "Twenty rises and ten becomes its left child. Fifteen moves to ten's right because it is greater than ten and smaller than twenty. Inorder remains five, ten, fifteen, twenty, thirty.",
    secondTitle: "See why sorted insertion needs repair", secondIntro: "Plain insertion of increasing keys creates height n. Building from middle keys creates logarithmic height for the same sorted values.",
    secondCode: `def height(node):
    return 0 if node is None else 1 + max(height(node.left), height(node.right))

def build_balanced(values):
    if not values: return None
    middle = len(values) // 2
    return Node(values[middle], build_balanced(values[:middle]), build_balanced(values[middle + 1:]))

skewed = Node(1, None, Node(2, None, Node(3, None, Node(4, None, Node(5)))))
balanced = build_balanced([1, 2, 3, 4, 5])
print(height(skewed), height(balanced))`,
    secondTrace: "The skewed tree has height five nodes, while the balanced tree has height three. AVL trees enforce tighter height balance. Red-black trees allow more flexibility but still guarantee logarithmic height.",
    mistake: "Do not claim a single rotation balances every tree. Real AVL and red-black updates detect specific violations, choose one or two rotations, and update height or color metadata.",
    checkpoint: "Why does a rotation preserve the BST invariant even though parent-child relationships change?",
    checkpointAnswer: "The middle subtree is moved into the only range where all its keys still fit. The inorder key sequence stays identical, so sorted ordering remains intact.",
    remember: "Logarithmic BST operations require controlled height. Rotations preserve inorder order while AVL or red-black rules decide when and how to repair shape.",
    checks: [q("What property does a rotation preserve?", ["Inorder key order", "Every node's original depth", "The original root"], 0, "It changes shape without changing sorted sequence.", ["Correct. The BST invariant survives.", "Depths intentionally change.", "A child may become root."]), q("How do AVL and red-black trees mainly differ?", ["AVL is stricter; red-black permits more shape flexibility", "Only AVL is a BST", "Red-black trees are always perfectly complete"], 0, "Both guarantee logarithmic height with different repair tradeoffs.", ["Correct. Searches versus update frequency can affect choice.", "Both are BSTs.", "Red-black balance is not perfect completeness."])],
  },
  {
    lessonId: "py.ac.m4_2.l4", atomId: "py.atom.algo.bst-ranges", conceptId: "py.algo.bst-ranges",
    title: "BST ranges skip subtrees that cannot contribute", requires: ["py.algo.bst-balancing"],
    vocabulary: [["successor", "the smallest key strictly greater than a target"], ["predecessor", "the largest key strictly smaller than a target"], ["range query", "return keys between chosen lower and upper limits"], ["pruning", "skip a subtree proven unable to contain an answer"], ["output-sensitive", "running time includes the number of returned results"]],
    opening: "The BST invariant does more than find exact keys. Comparisons can track nearest neighbors and skip whole subtrees outside a requested range.",
    outcome: "You will find successors and predecessors without storing a full traversal, perform a pruned range query, and state output-sensitive complexity.",
    why: "Nearest timestamps, ordered pagination, scheduling, leaderboards, and database scans need neighboring keys and bounded ranges rather than exact matches alone.",
    mentalModel: "Walk down a sorted decision tree while keeping the best backup answer. For a range, close any door whose entire room lies outside the allowed limits.",
    firstTitle: "Track the best strict neighbor", firstIntro: "When a node is greater than the target, it is a successor candidate and smaller possibilities lie left. The predecessor rule mirrors it.",
    firstCode: `class Node:
    def __init__(self, key, left=None, right=None): self.key, self.left, self.right = key, left, right

def neighbors(root, target):
    predecessor = successor = None
    current = root
    while current:
        if current.key < target:
            predecessor, current = current.key, current.right
        elif current.key > target:
            successor, current = current.key, current.left
        else:
            left, right = current.left, current.right
            while left and left.right: left = left.right
            while right and right.left: right = right.left
            if left: predecessor = left.key
            if right: successor = right.key
            break
    return predecessor, successor

root = Node(8, Node(3, Node(1), Node(6)), Node(12, Node(10), Node(14)))
print(neighbors(root, 9), neighbors(root, 8))`,
    firstTrace: "For missing nine, eight becomes the predecessor and twelve becomes a successor candidate before ten improves it. For present eight, the extreme keys inside its left and right subtrees are six and ten.",
    secondTitle: "Prune a bounded inorder traversal", secondIntro: "Visit left only when smaller valid keys might exist. Emit the node if it is in range. Visit right only when larger valid keys might exist.",
    secondCode: `def keys_in_range(root, low, high):
    result = []
    def visit(node):
        if node is None: return
        if node.key > low: visit(node.left)
        if low <= node.key <= high: result.append(node.key)
        if node.key < high: visit(node.right)
    visit(root)
    return result

print(keys_in_range(root, 5, 12))`,
    secondTrace: "Node three is too small, so its left subtree is skipped. Six, eight, ten, and twelve are emitted in order. Node fourteen and its right region are skipped. A balanced tree costs theta log n plus k outputs.",
    mistake: "Do not report range-query time as only log n. Returning k keys costs at least theta k. On an unbalanced tree, reaching and pruning boundaries can also cost theta n.",
    checkpoint: "When searching for a successor, why move left after finding a key greater than the target?",
    checkpointAnswer: "The current key is a valid backup, but the left subtree may contain a smaller key that is still greater than the target and therefore a better successor.",
    remember: "Keep the best neighbor while descending, prune by subtree value ranges, and include both tree height and output size in complexity.",
    checks: [q("What is a target's successor?", ["The smallest strictly greater key", "The tree root", "The largest smaller key"], 0, "It is the next key in sorted order.", ["Correct. Equality is excluded here.", "The root may be unrelated.", "That is the predecessor."]), q("What is balanced-BST range-query time for k outputs?", ["Theta(log n + k)", "Theta one", "Theta k without any search cost"], 0, "Reach the range boundary, then emit results.", ["Correct. It is output-sensitive.", "Outputs themselves require work.", "Locating the first result also costs height."])],
  },
];

export const ALGO_BST_ATOMS = SPECS.map(guidedMasteryAtom);
export const ALGO_BST_CONCEPTS = SPECS.map(guidedMasteryConcept);
export const ALGO_BST_LESSON_CONTENT = guidedLessonContent(SPECS);

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

const ALGO_LINKED_LIST_SPECS: GuidedMasterySpec[] = [
  {
    lessonId: "py.ac.m2_5.l1",
    atomId: "py.atom.algo.linked-list-foundations",
    conceptId: "py.algo.linked-list-foundations",
    title: "Linked lists connect separate nodes",
    requires: ["py.algo.stack-queue-conversions"],
    vocabulary: [
      ["node", "an object holding a value and one or more links"],
      ["head", "the first node in a linked list"],
      ["singly linked", "each node links only to the next node"],
      ["doubly linked", "each node links to both next and previous nodes"],
    ],
    opening: "An array stores references in numbered neighboring slots. A linked list stores separate nodes connected by links. That makes local rewiring cheap but indexed access slow.",
    outcome: "You will be able to draw singly and doubly linked nodes, traverse links safely, and compare their operation costs with arrays.",
    why: "Linked lists appear in caches, queues, history structures, adjacency storage, and interview pointer problems. Their code becomes simple once links are treated as data.",
    mentalModel: "Picture train cars connected by couplers. A singly linked car points only toward the next car. A doubly linked car has a coupler in both directions.",
    firstTitle: "Build and traverse a singly linked list",
    firstIntro: "There is no index jump. Start at head and follow `next` until the link is `None`.",
    firstCode: `class Node:
    def __init__(self, value, next_node=None):
        self.value = value
        self.next = next_node

head = Node("A", Node("B", Node("C")))
current = head
values = []
while current is not None:
    values.append(current.value)
    current = current.next
print(values)`,
    firstTrace: "Current begins at A, then follows links to B and C. C's next link is `None`, ending traversal. Reading the node at position i requires following i links, so indexed access is theta n.",
    secondTitle: "Connect both directions",
    secondIntro: "A doubly linked list spends one extra link per node so local removal can reconnect both neighbors.",
    secondCode: `class DoubleNode:
    def __init__(self, value):
        self.value = value
        self.prev = None
        self.next = None

left = DoubleNode("A")
middle = DoubleNode("B")
right = DoubleNode("C")
left.next, middle.prev = middle, left
middle.next, right.prev = right, middle

left.next = right
right.prev = left
print(left.value, left.next.value, right.prev.value)`,
    secondTrace: "A, B, C are linked in both directions. Removing B reconnects A's next to C and C's previous to A. Given B directly, the rewiring is theta one. Finding B may still require a scan.",
    mistake: "Do not say linked-list deletion is always O(1). Rewiring is constant time only when the target node or its predecessor is already known. Searching for the target is O(n).",
    checkpoint: "Why is reading the tenth linked-list value slower than reading array index ten?",
    checkpointAnswer: "An array computes the slot address directly. A linked list has no address formula for position ten, so traversal must follow links from a known node until that position is reached.",
    remember: "Linked lists trade direct indexing and compact storage for cheap local rewiring when the relevant nodes are already known.",
    checks: [
      q("What does a singly linked node store besides its value?", ["A next link", "Every future index", "The array capacity"], 0, "One link connects it to the remaining chain.", ["Correct. Traversal follows that link.", "Positions are not stored as an index table.", "Capacity belongs to dynamic arrays."]),
      q("When is linked-list removal theta one?", ["The needed node links are already known", "The list is sorted", "The target is searched by value first"], 0, "Local pointer rewiring is constant work.", ["Correct. Search cost is separate.", "Sorting does not make link search direct.", "A value search costs theta n."]),
    ],
  },
  {
    lessonId: "py.ac.m2_5.l2",
    atomId: "py.atom.algo.dummy-heads",
    conceptId: "py.algo.dummy-heads",
    title: "Dummy heads remove special head branches",
    requires: ["py.algo.linked-list-foundations"],
    vocabulary: [
      ["traversal", "visiting nodes by repeatedly following links"],
      ["predecessor", "the node immediately before another node"],
      ["dummy head", "a temporary node placed before the real first node"],
      ["sentinel", "a helper node or value marking a boundary"],
    ],
    opening: "List surgery is awkward when changing the first real node because no predecessor exists. A dummy head creates one uniform predecessor for every real node, including the head.",
    outcome: "You will be able to remove and insert nodes with a dummy head while preserving the unprocessed suffix.",
    why: "Dummy nodes reduce edge-case branches in deletion, merging, partitioning, and arithmetic lists. Fewer structural cases means fewer pointer bugs.",
    mentalModel: "Picture a harmless engine car attached before the first passenger car. Every passenger car now has a car before it, so the same uncoupling rule works at the front and middle.",
    firstTitle: "Remove every matching value",
    firstIntro: "Keep `current` at the predecessor. Inspect `current.next`, then either bypass it or advance current.",
    firstCode: `class Node:
    def __init__(self, value, next_node=None):
        self.value = value
        self.next = next_node

def remove_value(head, target):
    dummy = Node(None, head)
    current = dummy
    while current.next is not None:
        if current.next.value == target:
            current.next = current.next.next
        else:
            current = current.next
    return dummy.next

head = Node(2, Node(1, Node(2, Node(3))))
head = remove_value(head, 2)
print(head.value, head.next.value)`,
    firstTrace: "The dummy precedes the first two, so removing the real head uses the ordinary bypass rule. Current stays in place after removal because the next node may also match. The result is one followed by three.",
    secondTitle: "Insert into a sorted list",
    secondIntro: "Advance the predecessor until its next value is no longer smaller, then splice the new node between them.",
    secondCode: `def insert_sorted(head, value):
    dummy = Node(None, head)
    current = dummy
    while current.next is not None and current.next.value < value:
        current = current.next
    current.next = Node(value, current.next)
    return dummy.next

head = Node(1, Node(4, Node(7)))
head = insert_sorted(head, 0)
head = insert_sorted(head, 5)

values = []
while head:
    values.append(head.value)
    head = head.next
print(values)`,
    secondTrace: "Zero is inserted after the dummy, becoming the new head. Five is inserted between four and seven. Both cases use the same two assignments because a predecessor always exists.",
    mistake: "Do not advance after removing a node unless the new `current.next` has been checked. Advancing too early can skip consecutive targets. Always return `dummy.next`, not the dummy itself.",
    checkpoint: "What structural case does a dummy head eliminate when deleting or inserting?",
    checkpointAnswer: "It eliminates the special case where the real head changes and has no predecessor. The dummy becomes a stable predecessor, so front and middle rewiring use the same code.",
    remember: "A dummy head gives every real node a predecessor. Perform uniform surgery, then return the real list at `dummy.next`.",
    checks: [
      q("Why keep current in place after a removal?", ["The new next node may also need removal", "Pointers cannot advance", "The dummy must be returned"], 0, "Bypassing changes which node comes next.", ["Correct. Check that replacement before moving.", "Pointers can advance when no removal occurs.", "Return dummy.next."]),
      q("What should a function return after using a dummy head?", ["dummy.next", "dummy", "None always"], 0, "The helper node is not part of real data.", ["Correct. It points to the possibly changed head.", "That leaks the helper into the result.", "A nonempty result may remain."]),
    ],
  },
  {
    lessonId: "py.ac.m2_5.l3",
    atomId: "py.atom.algo.linked-list-reversal",
    conceptId: "py.algo.linked-list-reversal",
    title: "Reverse links without losing the suffix",
    requires: ["py.algo.dummy-heads"],
    vocabulary: [
      ["reversal", "changing every next link so the list order runs backward"],
      ["previous", "the head of the already reversed prefix"],
      ["current", "the node whose link is being changed now"],
      ["saved next", "the unprocessed suffix link protected before rewiring"],
    ],
    opening: "Reversal changes a link that was also the only road to the remaining list. Save that road first. Then redirect the link and move both boundaries forward.",
    outcome: "You will be able to reverse a list iteratively and recursively, trace the three moving references, and return the new head.",
    why: "Reversal is a foundation for palindrome checks, sublist surgery, reorder problems, and recursive pointer reasoning. Its safety rule applies to many mutations.",
    mentalModel: "Imagine turning arrows on a one-way trail. Before turning the current arrow backward, copy where it used to point. Otherwise the unexplored trail disappears.",
    firstTitle: "Reverse iteratively with three references",
    firstIntro: "Previous is the finished reversed prefix. Current begins the unprocessed suffix. Saved next protects the rest before mutation.",
    firstCode: `class Node:
    def __init__(self, value, next_node=None):
        self.value = value
        self.next = next_node

def reverse(head):
    previous = None
    current = head
    while current is not None:
        saved_next = current.next
        current.next = previous
        previous = current
        current = saved_next
    return previous

head = reverse(Node(1, Node(2, Node(3))))
print(head.value, head.next.value, head.next.next.value)`,
    firstTrace: "One points to `None`, then previous becomes one. Two points to one, then previous becomes two. Three points to two. Current becomes `None`, and previous is the new head three.",
    secondTitle: "Let recursion reverse the suffix first",
    secondIntro: "The recursive call returns the reversed suffix head. Then the old next node points back to the current node.",
    secondCode: `def reverse_recursive(head):
    if head is None or head.next is None:
        return head
    new_head = reverse_recursive(head.next)
    head.next.next = head
    head.next = None
    return new_head

head = reverse_recursive(Node("A", Node("B", Node("C"))))
print(head.value, head.next.value, head.next.next.value)`,
    secondTrace: "C is the base-case head. Returning to B makes C point to B and clears B's old next. Returning to A makes B point to A. Every frame returns the same new head, C.",
    mistake: "Do not set `current.next = previous` before saving the old next link. That cuts off the unprocessed suffix. In recursion, clear `head.next` to prevent a cycle.",
    checkpoint: "After one iterative step, what do previous and current represent?",
    checkpointAnswer: "Previous is the head of the fully reversed processed prefix. Current is the head of the untouched suffix. No node is lost because the old next link was saved before rewiring.",
    remember: "Save the suffix, reverse one link, then advance. At every step, previous is finished and current is untouched.",
    checks: [
      q("What must be saved before changing current.next?", ["The old next node", "The list length only", "The node value twice"], 0, "It is the only route to the suffix.", ["Correct. Saved next preserves unprocessed nodes.", "Length cannot recover links.", "Values do not identify link structure."]),
      q("What becomes the new iterative head?", ["previous after current reaches None", "The original head", "saved_next on the first step"], 0, "Previous grows into the reversed list.", ["Correct. It ends at the original tail.", "The original head becomes the tail.", "That is only the second node."]),
    ],
  },
  {
    lessonId: "py.ac.m2_5.l4",
    atomId: "py.atom.algo.fast-slow-lists",
    conceptId: "py.algo.fast-slow-lists",
    title: "Different pointer speeds reveal list structure",
    requires: ["py.algo.linked-list-reversal"],
    vocabulary: [
      ["slow pointer", "a reference that usually advances one node per step"],
      ["fast pointer", "a reference that usually advances two nodes per step"],
      ["cycle", "a chain of links that eventually returns to a visited node"],
      ["gap", "a fixed number of links kept between two pointers"],
    ],
    opening: "Different pointer speeds measure structure without storing visited nodes. A fast pointer finds middles, detects cycles, and creates end-relative gaps.",
    outcome: "You will find a middle, detect a cycle, and use a fixed gap to locate a node from the end.",
    why: "Fast and slow pointers solve structural questions in one pass and constant extra space. Their correctness comes from relative motion, not magic pointer names.",
    mentalModel: "Picture two runners. On a straight path, fast reaches the end while slow reaches the middle. On a loop, fast eventually laps slow.",
    firstTitle: "Find the middle and a node from the end",
    firstIntro: "For the middle, fast moves twice per slow move. For kth from the end, create a k-node gap before moving both together.",
    firstCode: `class Node:
    def __init__(self, value, next_node=None):
        self.value = value
        self.next = next_node
def middle(head):
    slow = fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
    return slow
def kth_from_end(head, k):
    lead = head
    for _ in range(k):
        lead = lead.next
    follow = head
    while lead:
        lead = lead.next
        follow = follow.next
    return follow
head = Node(1, Node(2, Node(3, Node(4, Node(5)))))
print(middle(head).value, kth_from_end(head, 2).value)`,
    firstTrace: "Fast reaches the end as slow reaches three, the middle. For second from end, lead starts two links ahead. When lead reaches `None`, follow is at four, exactly two positions from the end.",
    secondTitle: "Detect a cycle without a visited set",
    secondIntro: "Inside a cycle, fast gains one node on slow per step. Their positions must eventually match.",
    secondCode: `def has_cycle(head):
    slow = fast = head
    while fast is not None and fast.next is not None:
        slow = slow.next
        fast = fast.next.next
        if slow is fast:
            return True
    return False

a = Node("A")
b = Node("B")
c = Node("C")
a.next, b.next, c.next = b, c, b
print(has_cycle(a))`,
    secondTrace: "A leads into the loop B to C to B. Fast moves one extra loop position per round relative to slow, so they meet. On an acyclic list, fast reaches `None` first.",
    mistake: "Do not compare node values for cycle detection. Different nodes may hold equal values. Compare node identity. Also guard both `fast` and `fast.next` before moving two links.",
    checkpoint: "Why must fast and slow meet if both are inside a finite cycle and fast gains one position per round?",
    checkpointAnswer: "Their relative distance changes by one modulo the cycle length. A finite set of possible distances includes zero, so after enough rounds their node identities coincide.",
    remember: "Use relative speed for middles and cycles, or a fixed gap for positions measured from the end. Guard every multi-link move.",
    checks: [
      q("What happens to slow when fast reaches the end in the middle algorithm?", ["Slow is near the middle", "Slow is always at the tail", "Slow returns to head"], 0, "Slow moves half as many links.", ["Correct. Fast covers about twice the distance.", "Only fast reaches the tail boundary.", "No link moves backward."]),
      q("What should cycle detection compare?", ["Node identity", "Only node values", "List length"], 0, "A cycle is about revisiting the same object.", ["Correct. Equal values can belong to different nodes.", "Repeated values do not prove a cycle.", "Cycle length is not known first."]),
    ],
  },
  {
    lessonId: "py.ac.m2_5.l5",
    atomId: "py.atom.algo.merge-partition-lists",
    conceptId: "py.algo.merge-partition-lists",
    title: "Merge and partition by rewiring nodes safely",
    requires: ["py.algo.fast-slow-lists"],
    vocabulary: [
      ["merge", "combine two ordered lists into one ordered list"],
      ["partition", "separate nodes into groups based on a condition"],
      ["tail", "the final node of a growing output list"],
      ["unprocessed suffix", "the nodes not yet attached to their final output"],
    ],
    opening: "Merging and partitioning do not need new value nodes. A tail pointer grows the output, while source pointers protect the still-unprocessed suffixes.",
    outcome: "You will be able to merge sorted lists, make a stable partition, and explain exactly when a source pointer must advance.",
    why: "These operations appear in merge sort, list reordering, interval pipelines, and external data processing. Safe ownership of the remaining links prevents lost nodes and cycles.",
    mentalModel: "Picture two lines of train cars feeding one track. A switch chooses the next car, connects it behind the output tail, then advances only the source line that supplied it.",
    firstTitle: "Merge two sorted lists",
    firstIntro: "A dummy starts the output. Attach the smaller source node, move that source forward, and advance the output tail.",
    firstCode: `class Node:
    def __init__(self, value, next_node=None):
        self.value = value
        self.next = next_node
def merge_sorted(left, right):
    dummy = tail = Node(None)
    while left is not None and right is not None:
        if left.value <= right.value:
            tail.next = left
            left = left.next
        else:
            tail.next = right
            right = right.next
        tail = tail.next
    tail.next = left if left is not None else right
    return dummy.next
head = merge_sorted(Node(1, Node(4)), Node(2, Node(3, Node(5))))
values = []
while head:
    values.append(head.value)
    head = head.next
print(values)`,
    firstTrace: "One is attached, then two, three, and four. The right suffix beginning at five is already sorted, so it is attached in one step. The result is `[1,2,3,4,5]`.",
    secondTitle: "Partition stably around a pivot",
    secondIntro: "Build two chains: values smaller than pivot and values at least pivot. Preserve encounter order inside each chain, then join them.",
    secondCode: `def partition(head, pivot):
    small_dummy = small_tail = Node(None)
    large_dummy = large_tail = Node(None)
    while head is not None:
        next_node = head.next
        head.next = None
        if head.value < pivot:
            small_tail.next = head
            small_tail = head
        else:
            large_tail.next = head
            large_tail = head
        head = next_node
    small_tail.next = large_dummy.next
    return small_dummy.next
head = partition(Node(3, Node(1, Node(4, Node(2)))), 3)
values = []
while head:
    values.append(head.value)
    head = head.next
print(values)`,
    secondTrace: "One and two enter the small chain in that order. Three and four enter the large chain in that order. Joining gives `[1,2,3,4]`. Saving and clearing the old next link prevents accidental cross-chain cycles.",
    mistake: "Do not advance a source before saving its next node. Do not forget to terminate partition tails; stale links can reconnect groups and create cycles.",
    checkpoint: "During a merge, why does only the source that supplied the chosen node advance?",
    checkpointAnswer: "The other source head is still unprocessed and remains a candidate for the next comparison. Advancing it would skip a node that has not been attached to output.",
    remember: "Save each remaining suffix, attach exactly one chosen node behind tail, advance the supplying source, and explicitly terminate or join output chains.",
    checks: [
      q("What does the output tail represent?", ["The final attached node", "The next unread source node", "The original head only"], 0, "New output nodes are linked after tail.", ["Correct. Tail advances after each attachment.", "Source pointers track unread nodes.", "Tail changes as output grows."]),
      q("Why clear a node's old next link during partition?", ["To prevent stale cross-group links", "To erase its value", "To make comparison faster"], 0, "Old structure can reconnect chains incorrectly.", ["Correct. Each output chain is built deliberately.", "The value remains unchanged.", "Comparison time is unaffected."]),
    ],
  },
  {
    lessonId: "py.ac.m2_5.l6",
    atomId: "py.atom.algo.lru-cache-guided",
    conceptId: "py.algo.lru-cache-guided",
    title: "An LRU cache combines lookup with recency order",
    requires: ["py.algo.merge-partition-lists", "py.algo.hash-maps-sets-guided"],
    vocabulary: [
      ["cache", "fast storage for results likely to be reused"],
      ["LRU", "least recently used eviction policy"],
      ["eviction", "removing one entry to make room"],
      ["sentinel nodes", "fixed boundary nodes that simplify list insertion and removal"],
    ],
    opening: "An LRU cache needs two different superpowers: expected O(1) lookup by key and O(1) movement by recency. A map supplies lookup; a doubly linked list supplies order and removal.",
    outcome: "You will be able to trace get, update, and eviction operations and explain why both structures are necessary.",
    why: "LRU is a classic design problem and a real systems policy. It teaches how two data structures can maintain one combined contract efficiently.",
    mentalModel: "Picture a row of recently touched books. The newest book moves to the right end. A catalog jumps directly to any book. When full, discard the oldest book on the left.",
    firstTitle: "See the constant-time recency rewiring",
    firstIntro: "Sentinels bound a doubly linked recency list. Removing or appending a known node changes only nearby links.",
    firstCode: `class LRUNode:
    def __init__(self, key=None):
        self.key = key
        self.prev = None
        self.next = None
def remove(node):
    node.prev.next = node.next
    node.next.prev = node.prev
def append_recent(node, right):
    node.prev = right.prev
    node.next = right
    right.prev.next = node
    right.prev = node

left, right = LRUNode(), LRUNode()
left.next, right.prev = right, left
a, b = LRUNode("A"), LRUNode("B")
append_recent(a, right)
append_recent(b, right)
remove(a)
append_recent(a, right)
print(left.next.key, right.prev.key)`,
    firstTrace: "A and B enter with B most recent. Removing A changes its two neighbors. Appending A before the right sentinel makes A most recent and leaves B at the least-recent end.",
    secondTitle: "Use Python's ordered mapping for the full cache",
    secondIntro: "`OrderedDict` combines key lookup with movable order. The left entry is least recent; the right entry is most recent.",
    secondCode: `from collections import OrderedDict

class LRUCache:
    def __init__(self, capacity):
        self.capacity = capacity
        self.items = OrderedDict()
    def get(self, key):
        if key not in self.items:
            return -1
        self.items.move_to_end(key)
        return self.items[key]
    def put(self, key, value):
        if key in self.items:
            self.items.move_to_end(key)
        self.items[key] = value
        if len(self.items) > self.capacity:
            self.items.popitem(last=False)

cache = LRUCache(2)
cache.put("A", 1); cache.put("B", 2); cache.get("A")
cache.put("C", 3)
print(cache.get("B"), cache.get("A"), cache.get("C"))`,
    secondTrace: "Getting A moves it to the recent end. Adding C exceeds capacity, so `popitem(last=False)` evicts B from the old end. The outputs are minus one, one, and three.",
    mistake: "Do not remove a node from only the list or only the map. The structures describe the same entries and must stay consistent. Do not evict a sentinel.",
    checkpoint: "Why can neither a dictionary alone nor a linked list alone meet the complete LRU contract in expected O(1) time?",
    checkpointAnswer: "A dictionary finds keys quickly but does not expose the least-recent entry with arbitrary movement. A list maintains recency but needs O(n) to find a key. Together, the map jumps to nodes and the list orders them.",
    remember: "Map key to node, order nodes from least to most recent, move every accessed node to the recent end, and evict from the old end.",
    checks: [
      q("Which structure provides direct key lookup?", ["The hash map", "The recency list alone", "The sentinels"], 0, "Map values point to exact list nodes.", ["Correct. Expected lookup is constant time.", "A list would need a scan.", "Sentinels only simplify boundaries."]),
      q("Which real node is evicted?", ["The node after the least-recent sentinel", "The most recent node", "A random map entry"], 0, "List order exposes the oldest usage.", ["Correct. It is removed from both structures.", "The policy preserves recent entries.", "LRU eviction is deterministic by recency."]),
    ],
  },
];

export const ALGO_LINKED_LIST_ATOMS = ALGO_LINKED_LIST_SPECS.map(guidedMasteryAtom);
export const ALGO_LINKED_LIST_CONCEPTS = ALGO_LINKED_LIST_SPECS.map(guidedMasteryConcept);
export const ALGO_LINKED_LIST_LESSON_CONTENT = guidedLessonContent(ALGO_LINKED_LIST_SPECS);

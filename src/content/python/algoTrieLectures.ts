import type { LectureQuestion } from "../../types";
import { guidedLessonContent, guidedMasteryAtom, guidedMasteryConcept, type GuidedMasterySpec } from "./guidedMastery";

const q = (question: string, choices: [string, string, string], answer: 0 | 1 | 2, explanation: string, why: [string, string, string]): LectureQuestion => ({ question, choices, answer, explanation, why });

const SPECS: GuidedMasterySpec[] = [
  {
    lessonId: "py.ac.m4_4.l1", atomId: "py.atom.algo.trie-foundations", conceptId: "py.algo.trie-foundations",
    title: "A trie shares paths between common prefixes", requires: ["py.algo.k-way-merge"],
    vocabulary: [["trie", "a tree whose path edges represent pieces of keys"], ["prefix", "the beginning portion of a sequence"], ["terminal marker", "a flag saying a complete stored key ends at this node"], ["alphabet size", "the number of possible next symbols"], ["shared path", "nodes reused by keys with the same beginning"]],
    opening: "A trie stores words one character at a time. Words with the same beginning reuse the same path, making prefix questions direct.",
    outcome: "You will implement insert, exact search, and prefix search, explain terminal markers, and calculate cost from key length rather than number of stored words.",
    why: "Tries support autocomplete, spell checking, routing tables, dictionaries, board searches, and bitwise optimization. They trade extra memory for predictable prefix navigation.",
    mentalModel: "Imagine hallway doors labeled with letters. Words sharing a beginning walk through the same doors, then branch only when their next letters differ.",
    firstTitle: "Separate a path from a complete word", firstIntro: "Each node maps a next character to a child. The terminal flag distinguishes a stored word from a prefix that merely leads to longer words.",
    firstCode: `class TrieNode:
    def __init__(self): self.children, self.terminal = {}, False
class Trie:
    def __init__(self): self.root = TrieNode()
    def insert(self, word):
        node = self.root
        for character in word:
            node = node.children.setdefault(character, TrieNode())
        node.terminal = True
    def walk(self, text):
        node = self.root
        for character in text:
            if character not in node.children: return None
            node = node.children[character]
        return node
    def search(self, word):
        node = self.walk(word)
        return bool(node and node.terminal)
    def starts_with(self, prefix): return self.walk(prefix) is not None
trie = Trie()
for word in ["car", "card", "care"]: trie.insert(word)
print(trie.search("car"), trie.search("ca"), trie.starts_with("ca"))`,
    firstTrace: "All three words share c-a-r. Car's node is terminal even though it has children for card and care. The path c-a exists, but its node is not terminal, so exact search returns false.",
    secondTitle: "Remove a word without breaking shared prefixes", secondIntro: "Clear the terminal marker, then delete now-useless nodes while recursion returns. Stop pruning when another word still needs a node.",
    secondCode: `def delete_word(trie, word):
    def remove(node, index):
        if index == len(word):
            if not node.terminal: return False
            node.terminal = False
            return not node.children
        character = word[index]
        child = node.children.get(character)
        if child is None: return False
        if remove(child, index + 1): del node.children[character]
        return not node.terminal and not node.children
    remove(trie.root, 0)

delete_word(trie, "card")
print(trie.search("card"), trie.search("car"), trie.search("care"))`,
    secondTrace: "Card's terminal marker clears. Its d leaf becomes unused and is removed. The shared c-a-r path remains because car ends there and care continues through e.",
    mistake: "Do not treat reaching a node as an exact match. Without a terminal marker, searching for ca would incorrectly succeed merely because longer stored words begin with ca.",
    checkpoint: "What is the time for searching a word of length L in a hash-map-child trie?",
    checkpointAnswer: "Expected theta L, because one child lookup is performed for each character. The number of other stored words does not add a traversal step.",
    remember: "Characters choose edges, shared prefixes reuse nodes, terminal markers record complete keys, and operations cost proportional to key length.",
    checks: [q("Why does each trie node need a terminal marker?", ["A prefix path may not be a stored word", "It sorts all children", "It stores tree height"], 0, "Path existence and exact-key existence differ.", ["Correct. Car and card can both exist.", "Child maps need no terminal flag for sorting.", "Height is unrelated."]), q("What does starts_with require at the final node?", ["Only that the path exists", "The terminal flag must be true", "The node must be a leaf"], 0, "A prefix may end before a complete word.", ["Correct. Longer continuations are allowed.", "That is exact search.", "Prefixes often have children."])],
  },
  {
    lessonId: "py.ac.m4_4.l2", atomId: "py.atom.algo.trie-applications", conceptId: "py.algo.trie-applications",
    title: "Trie searches prune impossible prefixes early", requires: ["py.algo.trie-foundations"],
    vocabulary: [["autocomplete", "return stored words that continue a typed prefix"], ["prefix pruning", "stop exploring as soon as no stored key has the current prefix"], ["bitwise trie", "a trie whose edges are zero and one bits"], ["XOR", "a bit is one when two input bits differ"], ["opposite bit", "the bit choice that makes the current XOR position one"]],
    opening: "A trie is most useful when a prefix eliminates many possibilities. Autocomplete explores one prefix subtree; board search abandons letter paths that no word can finish.",
    outcome: "You will generate autocomplete results, connect tries with board backtracking, and use a bitwise trie to maximize XOR one bit at a time.",
    why: "These applications show one deeper pattern: store many valid prefixes, then use the current query state to prune or greedily choose the best continuation.",
    mentalModel: "A trie is a map of legal continuations. Autocomplete lists roads after one location. Board search closes dead roads. XOR search prefers the opposite-colored road at each bit.",
    firstTitle: "Collect completions below one prefix", firstIntro: "Walk to the prefix node, then depth-first search only its descendants. Sorted child keys make output deterministic.",
    firstCode: `def build_trie(words):
    root = {}
    for word in words:
        node = root
        for character in word: node = node.setdefault(character, {})
        node[""] = {}
    return root
def autocomplete(root, prefix, limit=5):
    node = root
    for character in prefix:
        if character not in node: return []
        node = node[character]
    results = []
    def collect(node, suffix):
        if len(results) == limit: return
        if "" in node: results.append(prefix + suffix)
        for character in sorted(key for key in node if key):
            collect(node[character], suffix + character)
    collect(node, "")
    return results
words = build_trie(["app", "apple", "apply", "apt", "bat"])
print(autocomplete(words, "ap", 3))`,
    firstTrace: "Walking a-p ignores the entire bat branch. DFS finds app, apple, and apply, then the limit stops further work. A board-word search uses the same pruning after each neighboring letter.",
    secondTitle: "Choose opposite bits for maximum XOR", secondIntro: "At each high-to-low bit, choose the opposite stored bit when possible. A high differing bit outweighs every combination of lower bits.",
    secondCode: `class BitTrie:
    def __init__(self): self.root = {}
    def insert(self, number):
        node = self.root
        for bit in range(7, -1, -1):
            value = (number >> bit) & 1
            node = node.setdefault(value, {})
    def best_xor(self, number):
        node, result = self.root, 0
        for bit in range(7, -1, -1):
            value = (number >> bit) & 1
            preferred = 1 - value
            chosen = preferred if preferred in node else value
            if chosen != value: result |= 1 << bit
            node = node[chosen]
        return result

bits = BitTrie()
for number in [3, 10, 5, 25, 2, 8]: bits.insert(number)
print(bits.best_xor(5))`,
    secondTrace: "For query five, the trie greedily prefers opposite bits from the most significant position downward. Stored twenty-five produces XOR twenty-eight, the maximum for this set.",
    mistake: "Do not explore a board path after its letter sequence disappears from the trie. Also choose XOR bits from most significant to least; a lower gain cannot repair a missed higher bit.",
    checkpoint: "Why is greedily choosing an opposite high bit safe for maximum XOR?",
    checkpointAnswer: "Making bit b equal one adds two to the power b, which is greater than the sum of all possible lower-bit gains. A high-bit win dominates every later choice.",
    remember: "Use stored prefixes to prune search, traverse only the requested autocomplete subtree, and prefer opposite bits from high to low for XOR.",
    checks: [q("How does a trie help board word search?", ["It stops paths that match no stored prefix", "It removes the need for backtracking", "It sorts the board first"], 0, "Dead prefixes cannot form any dictionary word.", ["Correct. This prunes the search tree.", "Cells and visited state still require backtracking.", "Board position order remains meaningful."]), q("Which bit is considered first for maximum XOR?", ["Most significant", "Least significant", "A random bit"], 0, "High bits dominate all lower-bit value.", ["Correct. Greedy choice is then safe.", "A low win may sacrifice a larger high win.", "Bit value determines priority."])],
  },
];

export const ALGO_TRIE_ATOMS = SPECS.map(guidedMasteryAtom);
export const ALGO_TRIE_CONCEPTS = SPECS.map(guidedMasteryConcept);
export const ALGO_TRIE_LESSON_CONTENT = guidedLessonContent(SPECS);

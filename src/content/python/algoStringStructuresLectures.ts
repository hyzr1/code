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

const ALGO_STRING_STRUCTURES_SPECS: GuidedMasterySpec[] = [
  {
    lessonId: "py.ac.m7_2.l1",
    atomId: "py.atom.algo.suffix-array",
    conceptId: "py.algo.suffix-array",
    title: "Suffix arrays put every substring in order",
    requires: ["py.algo.string-hashing"],
    vocabulary: [
      ["suffix array", "the starting positions of every suffix, in sorted order"],
      ["LCP array", "the longest common prefix between each pair of neighbouring suffixes"],
      ["Kasai's algorithm", "a linear method for building the LCP array from the suffix array"],
      ["substring query", "asking whether or where a string occurs inside another"],
    ],
    opening: "Every substring of a text is a prefix of some suffix. Sorting the suffixes therefore sorts every substring at once, which turns a whole family of search questions into binary searches.",
    outcome: "You will build a suffix array, compute its LCP array, and read the longest repeated substring straight off the result.",
    why: "Suffix arrays answer repeated-substring, distinct-substring and multi-query search problems with one structure. The LCP array is what turns the sorted order into actual answers.",
    mentalModel: "Picture an index at the back of a book listing every possible starting point, sorted alphabetically. Finding a phrase becomes a lookup, and neighbouring entries share the longest beginnings.",
    firstTitle: "Sort the suffixes, then compare the neighbours",
    firstIntro: "The array holds starting positions, and the sorted order is what makes the structure useful.",
    firstCode: `def suffix_array(text):
    return sorted(range(len(text)), key=lambda i: text[i:])

text = "banana"
sa = suffix_array(text)
for position in sa:
    print(f"{position}: {text[position:]}")`,
    firstTrace: "The six suffixes come out in alphabetical order, and their starting positions are the array. Any substring of the text is a prefix of one of these lines, so a binary search over them locates any pattern. Sorting this way is quadratic for clarity, and production versions build the same array in linear time.",
    secondTitle: "The LCP array turns order into answers",
    secondIntro: "Neighbouring suffixes share the longest prefixes, so the largest shared prefix is the longest repeat.",
    secondCode: `def suffix_array(text):
    return sorted(range(len(text)), key=lambda i: text[i:])

def kasai(text, sa):
    n = len(text)
    rank = [0] * n
    for order, position in enumerate(sa):
        rank[position] = order
    lcp = [0] * n
    k = 0
    for i in range(n):
        if rank[i] == 0:
            k = 0
            continue
        j = sa[rank[i] - 1]
        while i + k < n and j + k < n and text[i + k] == text[j + k]:
            k += 1
        lcp[rank[i]] = k
        if k:
            k -= 1
    return lcp

text = "banana"
sa = suffix_array(text)
lcp = kasai(text, sa)
print("lcp:", lcp)
best = max(lcp)
where = sa[lcp.index(best)]
print("longest repeat:", text[where:where + best])`,
    secondTrace: "The largest entry is three, and the suffix it belongs to starts a copy of the repeated substring. Kasai's method never restarts its comparison from zero, because moving one position forward can only shorten the shared prefix by one. That single observation is what makes the whole build linear.",
    mistake: "Do not compare a suffix array's entries as if they were substrings of equal length. They are starting positions of suffixes with different lengths, and treating them as fixed-width keys produces an order that is neither alphabetical nor useful.",
    checkpoint: "How does the LCP array give the number of distinct substrings?",
    checkpointAnswer: "Every suffix contributes its own length in prefixes, and the shared prefix with its neighbour is the part already counted. Summing each suffix's length minus its LCP entry counts each distinct substring exactly once.",
    remember: "Sorting the suffixes sorts every substring. The LCP array records what neighbouring suffixes share, which answers longest-repeat and distinct-substring questions directly.",
    checks: [
      q("Why does sorting suffixes sort every substring?", ["Every substring is a prefix of some suffix", "Substrings are shorter than suffixes", "The text is already sorted"], 0, "One sorted list covers them all.", ["Correct. That is what makes binary search possible.", "Length is not what makes the order work.", "The text order is unrelated."]),
      q("What does an LCP entry record?", ["The shared prefix length with the neighbouring suffix", "The length of that suffix", "The number of occurrences"], 0, "It compares adjacent entries in sorted order.", ["Correct. The largest entry is the longest repeat.", "Suffix length follows from its position.", "No counting is involved."]),
      q("Why can Kasai's algorithm avoid restarting each comparison?", ["Moving one position forward shortens the shared prefix by at most one", "The suffixes are already compared", "The array is sorted"], 0, "That bound makes the total work linear.", ["Correct. The counter only ever decreases by one per step.", "Comparisons are what it is computing.", "Sortedness alone would not give the bound."]),
    ],
  },
  {
    lessonId: "py.ac.m7_2.l2",
    atomId: "py.atom.algo.suffix-trees",
    conceptId: "py.algo.suffix-trees",
    title: "Suffix tries, and why they have to be compressed",
    requires: ["py.algo.suffix-array"],
    vocabulary: [
      ["suffix trie", "a tree containing every suffix as a root-to-node path"],
      ["compressed trie", "the same tree with every chain of single children collapsed to one edge"],
      ["branching node", "a node with more than one child, which survives compression"],
      ["state space", "the number of nodes a structure needs to store"],
    ],
    opening: "A tree of every suffix answers substring questions instantly, and it is also far too large to build directly. Understanding why the uncompressed version fails is what makes the compressed one make sense.",
    outcome: "You will build a suffix trie, count its nodes as the distinct-substring count, and see why compression is mandatory rather than an optimization.",
    why: "Suffix trees and automata are the fastest structures for repeated substring queries, and every explanation of them starts from the trie. Knowing the node count also gives distinct-substring counting for free.",
    mentalModel: "Picture a filing system with one folder per possible beginning. Most folders contain exactly one folder inside them, and collapsing those chains into single labelled edges is what makes the cabinet fit in the room.",
    firstTitle: "Every node is a distinct substring",
    firstIntro: "Inserting every suffix into a trie makes each node correspond to exactly one distinct substring.",
    firstCode: `def trie_nodes(text):
    root = {}
    count = 0
    for start in range(len(text)):
        node = root
        for ch in text[start:]:
            if ch not in node:
                node[ch] = {}
                count += 1
            node = node[ch]
    return count

def distinct_by_brute_force(text):
    return len({text[i:j]
                for i in range(len(text))
                for j in range(i + 1, len(text) + 1)})

for word in ("banana", "aaaa", "abc"):
    print(f"{word:>7}: trie nodes {trie_nodes(word):>3}  distinct {distinct_by_brute_force(word):>3}")`,
    firstTrace: "The two counts agree on every word, because each node is reached by exactly one distinct substring. A word of repeated letters has very few, and a word with no repetition has the maximum. That correspondence is the reason the structure answers substring questions at all.",
    secondTitle: "The node count is quadratic, and compression fixes it",
    secondIntro: "Counting nodes for a worst-case string shows why the plain trie is not an option.",
    secondCode: `def trie_nodes(text):
    root = {}
    count = 0
    for start in range(len(text)):
        node = root
        for ch in text[start:]:
            if ch not in node:
                node[ch] = {}
                count += 1
            node = node[ch]
    return count

for length in (5, 10, 20, 26):
    word = "".join(chr(97 + i % 26) for i in range(length))
    print(f"length {length:>3}: {trie_nodes(word):>5} nodes, "
          f"n(n+1)/2 = {length * (length + 1) // 2:>5}")

print("a compressed tree keeps only branching nodes, of which there are at most 2n")`,
    secondTrace: "A string with no repeats produces exactly the triangular number of nodes, which grows with the square of the length. A string of a million characters would need half a trillion nodes. Collapsing every chain of single children leaves at most two nodes per character, which is what makes the structure buildable.",
    mistake: "Do not store a full character label on every compressed edge. The edges hold slices of the original text, so keeping a start and an end index makes the whole structure linear in memory, and copying the substrings puts the quadratic cost straight back.",
    checkpoint: "What survives compression, and how many such nodes can there be?",
    checkpointAnswer: "Branching nodes and the leaves. A tree with at most one leaf per suffix has at most n leaves, and a tree in which every internal node branches has fewer internal nodes than leaves, so the total stays under two n regardless of the alphabet.",
    remember: "Each trie node is one distinct substring, and there are quadratically many. Compressing chains of single children leaves at most two nodes per character, with edges stored as index ranges.",
    checks: [
      q("What does each node of a suffix trie correspond to?", ["Exactly one distinct substring", "One suffix", "One character of the text"], 0, "The node count is the distinct-substring count.", ["Correct. That gives distinct counting for free.", "Suffixes are the leaves, not every node.", "Characters label edges, not nodes."]),
      q("Why is an uncompressed suffix trie impractical?", ["Its node count grows with the square of the length", "It cannot represent repeats", "Lookups are slow"], 0, "A string with no repeats hits the triangular number.", ["Correct. A million characters would need half a trillion nodes.", "Repeats are exactly what it shares paths for.", "Lookups are fast; construction is the problem."]),
      q("How many nodes survive compression?", ["At most about two per character", "The same number", "One per distinct substring"], 0, "Only branching nodes and leaves remain.", ["Correct. That is what makes it linear.", "Compression is what removes the quadratic count.", "That is the uncompressed count."]),
    ],
  },
  {
    lessonId: "py.ac.m7_2.l3",
    atomId: "py.atom.algo.aho-corasick",
    conceptId: "py.algo.aho-corasick",
    title: "Aho-Corasick matches every pattern in one pass",
    requires: ["py.algo.suffix-trees"],
    vocabulary: [
      ["pattern trie", "a tree holding every pattern as a root-to-node path"],
      ["failure link", "where to continue when the current node has no matching child"],
      ["output link", "the chain of shorter patterns that also end at a node"],
      ["single pass", "reading the text once regardless of how many patterns there are"],
    ],
    opening: "Searching for a thousand patterns by running a single-pattern algorithm a thousand times reads the text a thousand times. Aho-Corasick reads it once, by generalizing exactly the failure-link idea that makes KMP linear.",
    outcome: "You will build a pattern trie, add failure links by breadth-first order, and find every occurrence of every pattern in one scan.",
    why: "Content filters, intrusion detection, tokenizers and virus scanners all match large fixed dictionaries against a stream. This is the standard structure for that, and it is a favourite of harder interviews.",
    mentalModel: "Picture reading with several bookmarks at once. When the next character fails the current position, the failure link tells you the longest other pattern-beginning you are already inside, so no bookmark is ever lost.",
    firstTitle: "A trie of patterns, plus links for the failures",
    firstIntro: "Failure links are added by breadth-first order, because a node's link depends on shallower nodes.",
    firstCode: `from collections import deque

def build(patterns):
    goto = [{}]
    out = [[]]
    fail = [0]
    for pattern in patterns:
        node = 0
        for ch in pattern:
            if ch not in goto[node]:
                goto.append({})
                out.append([])
                fail.append(0)
                goto[node][ch] = len(goto) - 1
            node = goto[node][ch]
        out[node].append(pattern)
    queue = deque(goto[0].values())
    while queue:
        node = queue.popleft()
        for ch, nxt in goto[node].items():
            queue.append(nxt)
            back = fail[node]
            while back and ch not in goto[back]:
                back = fail[back]
            target = goto[back].get(ch, 0)
            fail[nxt] = target if target != nxt else 0
            out[nxt] = out[nxt] + out[fail[nxt]]
    return goto, fail, out

goto, fail, out = build(["he", "she", "his", "hers"])
print("nodes:", len(goto))
print("failure links:", fail)`,
    firstTrace: "The trie holds ten nodes for those four patterns, sharing the common beginnings. Failure links are computed level by level, since a node's link always points to a strictly shallower node. Merging the output lists along the links is what lets one node report several patterns at once.",
    secondTitle: "One scan reports every occurrence",
    secondIntro: "The text pointer only moves forward, exactly as it does in single-pattern matching.",
    secondCode: `from collections import deque

def build(patterns):
    goto, out, fail = [{}], [[]], [0]
    for pattern in patterns:
        node = 0
        for ch in pattern:
            if ch not in goto[node]:
                goto.append({}); out.append([]); fail.append(0)
                goto[node][ch] = len(goto) - 1
            node = goto[node][ch]
        out[node].append(pattern)
    queue = deque(goto[0].values())
    while queue:
        node = queue.popleft()
        for ch, nxt in goto[node].items():
            queue.append(nxt)
            back = fail[node]
            while back and ch not in goto[back]:
                back = fail[back]
            hop = goto[back].get(ch, 0)
            fail[nxt] = hop if hop != nxt else 0
            out[nxt] += out[fail[nxt]]
    return goto, fail, out

def search(text, patterns):
    goto, fail, out = build(patterns)
    node, hits = 0, []
    for i, ch in enumerate(text):
        while node and ch not in goto[node]:
            node = fail[node]
        node = goto[node].get(ch, 0)
        hits += [(i - len(p) + 1, p) for p in out[node]]
    return hits

print(search("ushers", ["he", "she", "his", "hers"]))`,
    secondTrace: "Three occurrences are reported from a six-character text, and two of them end at the same position. Following the output links is what catches the shorter pattern hiding inside the longer one. The cost is the text length plus the total pattern length plus the number of matches, whatever the dictionary size.",
    mistake: "Do not stop at the first pattern ending at a node. Several patterns can finish at the same position, and reporting only the longest silently drops every shorter one contained inside it.",
    checkpoint: "Why must failure links be computed in breadth-first order?",
    checkpointAnswer: "Because a node's failure link always points to a strictly shallower node, whose own link must already be resolved. Breadth-first order guarantees every shallower node is finished before any deeper one is processed, which a depth-first walk would not.",
    remember: "Build a trie of all the patterns, add failure links breadth-first, and merge output lists along them. One forward pass then reports every occurrence of every pattern.",
    checks: [
      q("What does a failure link point to?", ["The longest proper suffix of the current path that is also a path in the trie", "The parent node", "The root"], 0, "It generalizes the KMP prefix function.", ["Correct. That is what preserves partial matches.", "The parent is one character shorter, not the longest valid suffix.", "The root is only the fallback of last resort."]),
      q("Why is breadth-first order required?", ["A node's link points to a shallower node, which must be resolved first", "It is faster", "Depth-first would run out of stack"], 0, "The dependency is on depth.", ["Correct. Shallower nodes finish before deeper ones.", "The traversal cost is the same.", "Stack depth is not the obstacle."]),
      q("Several patterns end at the same position. What handles that?", ["Following the output links from that node", "Running the search again", "Sorting the patterns"], 0, "Shorter patterns hide inside longer ones.", ["Correct. Reporting only one drops the rest.", "One pass finds them all.", "Order does not change what ends where."]),
    ],
  },
  {
    lessonId: "py.ac.m7_2.l4",
    atomId: "py.atom.algo.manacher",
    conceptId: "py.algo.manacher",
    title: "Manacher's finds every palindrome in one pass",
    requires: ["py.algo.aho-corasick"],
    vocabulary: [
      ["palindrome radius", "how far a palindrome extends either side of its centre"],
      ["odd and even centres", "palindromes centred on a character or between two"],
      ["mirror position", "the reflection of a position across the current centre"],
      ["separator padding", "inserting a filler character so every palindrome has an odd length"],
    ],
    opening: "Palindromes come in two shapes, centred on a character or between two, and handling them separately doubles every piece of code. One padding trick removes the distinction entirely, and a mirroring argument then removes the quadratic scan.",
    outcome: "You will pad a string so every palindrome is odd, and use the mirror inside the current palindrome to avoid recomparing.",
    why: "Longest palindromic substring is a standard interview question whose expected answer is the quadratic centre expansion, and the linear version is the follow-up. The mirroring argument also recurs in the Z-algorithm.",
    mentalModel: "Picture a mirror standing at the centre of the widest palindrome found so far. Anything inside it has a reflection whose answer is already known, so only the part sticking out has to be measured.",
    firstTitle: "Padding makes every palindrome odd",
    firstIntro: "Inserting a filler between every pair of characters removes the even case completely.",
    firstCode: `def pad(s):
    return "#" + "#".join(s) + "#"

for word in ("abba", "aba", "ab"):
    padded = pad(word)
    print(f"{word:>5} -> {padded:<12} length {len(padded)}")

print()
print("an even palindrome is now centred on a filler character")`,
    firstTrace: "A word of length n becomes one of length two n plus one, which is always odd. An even palindrome such as the first word is now centred on a filler, and an odd one is still centred on a real character. Every palindrome in the padded string has an odd length, so one loop handles both cases.",
    secondTitle: "The mirror removes the rework",
    secondIntro: "Inside the current widest palindrome, a position's answer starts from its reflection.",
    secondCode: `def longest_palindrome(s):
    if not s:
        return ""
    t = "#" + "#".join(s) + "#"
    n = len(t)
    radius = [0] * n
    centre = right = 0
    for i in range(n):
        if i < right:
            radius[i] = min(right - i, radius[2 * centre - i])
        while (i - radius[i] - 1 >= 0 and i + radius[i] + 1 < n
               and t[i - radius[i] - 1] == t[i + radius[i] + 1]):
            radius[i] += 1
        if i + radius[i] > right:
            centre, right = i, i + radius[i]
    best = max(radius)
    where = radius.index(best)
    start = (where - best) // 2
    return s[start:start + best]

for word in ("babad", "cbbd", "forgeeksskeegfor", "a"):
    print(f"{word:>18}: {longest_palindrome(word)}")`,
    secondTrace: "The reflection of a position across the current centre already has an answer, capped by how much of the palindrome remains to its right. Only comparisons that push past that boundary are performed, and each one widens the palindrome. That is the same amortized argument that bounds the Z-algorithm.",
    mistake: "Do not forget that the padded radius is already the answer's length in the original string. Converting back needs the start index rather than a second measurement, and computing the length again from the padded positions is where most implementations go wrong.",
    checkpoint: "Why does padding remove the need to handle even palindromes separately?",
    checkpointAnswer: "Because an even palindrome in the original string becomes centred on an inserted filler character, which gives it an odd length in the padded one. Every palindrome then has a single character at its centre, so one loop covers both cases without any duplicated logic.",
    remember: "Pad with a filler so every palindrome is odd, then use the mirror inside the current widest palindrome to skip comparisons. The padded radius is the original length.",
    checks: [
      q("What does the padding accomplish?", ["Every palindrome becomes odd-length, so one case remains", "It makes the string shorter", "It marks the centres"], 0, "Even palindromes become centred on a filler.", ["Correct. The duplicated even-case logic disappears.", "The padded string is longer.", "Centres are found by the algorithm."]),
      q("What does a position inside the current palindrome start from?", ["Its mirror's answer, capped by the remaining width", "Zero", "The full remaining width"], 0, "The reflection is already computed.", ["Correct. Only extensions past the boundary are compared.", "Starting at zero is the quadratic version.", "The cap is a maximum, not a starting value."]),
      q("What is the padded radius at the best centre?", ["The length of the answer in the original string", "Twice the answer's length", "The answer's start index"], 0, "The padding doubles positions, which cancels out.", ["Correct. Only the start index still needs converting.", "The doubling is already accounted for.", "The start comes from the centre and the radius."]),
    ],
  },
];

export const ALGO_STRING_STRUCTURES_ATOMS = ALGO_STRING_STRUCTURES_SPECS.map(guidedMasteryAtom);
export const ALGO_STRING_STRUCTURES_CONCEPTS = ALGO_STRING_STRUCTURES_SPECS.map(guidedMasteryConcept);
export const ALGO_STRING_STRUCTURES_LESSON_CONTENT = guidedLessonContent(ALGO_STRING_STRUCTURES_SPECS);

import {
  guidedLessonContent,
  guidedMasteryAtom,
  guidedMasteryConcept,
  type GuidedMasterySpec,
} from "./guidedMastery";

const ALGO_ADVANCED_STRINGS_SPECS: GuidedMasterySpec[] = [
  {
    lessonId: "py.ac.m12_3.l1",
    atomId: "py.atom.algo.suffix-array-construction",
    conceptId: "py.algo.suffix-array-construction",
    title: "Suffix array construction",
    requires: ["py.algo.suffix-array"],
    vocabulary: [
      ["suffix array", "the starting positions of every suffix, listed in sorted order"],
      ["prefix doubling", "sorting suffixes by their first two positions, then four, then eight"],
      ["longest common prefix array", "how many characters each sorted suffix shares with the one before it"],
    ],
    opening:
      "Sorting every suffix directly costs the square of the length, because comparing two suffixes is itself linear. Doubling avoids ever comparing more than two ranks.",
    outcome:
      "You will build the array by prefix doubling, derive the prefix-length array, and count distinct substrings from the two together.",
    why:
      "The suffix array plus its prefix lengths answers substring search, distinct-substring counting and longest-repeat questions from one index.",
    mentalModel:
      "Picture each suffix labelled by a rank. Each round pairs a suffix's rank with the rank of the suffix half a window later, and sorting those pairs doubles the compared length.",
    firstTitle: "Doubling the compared length",
    firstIntro:
      "Start by sorting on the first character alone. Each round then sorts on a pair of existing ranks, which is a constant-time comparison however long the window becomes.",
    firstCode: `def suffix_array(text):
    n = len(text)
    order = sorted(range(n), key=lambda i: text[i])
    rank = [0] * n
    for i in range(1, n):
        rank[order[i]] = rank[order[i - 1]] + (
            text[order[i]] != text[order[i - 1]])
    k = 1
    while k < n:
        key = lambda i: (rank[i], rank[i + k] if i + k < n else -1)
        order = sorted(order, key=key)
        fresh = [0] * n
        for i in range(1, n):
            fresh[order[i]] = fresh[order[i - 1]] + (
                key(order[i]) != key(order[i - 1]))
        rank = fresh
        k <<= 1
    return order

text = "banana"
sa = suffix_array(text)
print(sa)
print([text[i:] for i in sa])`,
    firstTrace:
      "Five, three, one, zero, four, two — the suffixes a, ana, anana, banana, na, nana in sorted order. Six positions took three doubling rounds.",
    secondTitle: "Counting distinct substrings",
    secondIntro:
      "Every substring is a prefix of some suffix. Sorting groups the duplicates together, and the shared-prefix length says exactly how many each suffix repeats.",
    secondCode: `def lcp_array(text, sa):
    n = len(text)
    rank = [0] * n
    for i, s in enumerate(sa):
        rank[s] = i
    lcp = [0] * n
    h = 0
    for i in range(n):
        if rank[i] > 0:
            j = sa[rank[i] - 1]
            while i + h < n and j + h < n and text[i + h] == text[j + h]:
                h += 1
            lcp[rank[i]] = h
            h = max(h - 1, 0)
        else:
            h = 0
    return lcp

lcp = lcp_array(text, sa)
print(lcp)
n = len(text)
print(n * (n + 1) // 2 - sum(lcp))`,
    secondTrace:
      "The shared lengths are zero, one, three, zero, zero, two. Twenty-one total prefixes minus six repeats gives fifteen distinct substrings.",
    mistake:
      "Sorting the suffixes with a plain comparison sort on the strings themselves. It looks correct and is, but each comparison is linear, so the whole thing is quadratic on a long text.",
    checkpoint:
      "Why does prefix doubling avoid long comparisons?",
    checkpointAnswer:
      "It compares a pair of ranks already computed, which is constant work however many characters that pair actually stands for.",
    remember:
      "Sort by rank pairs, double the window, then derive the shared prefixes.",
    checks: [
      {
        question: "What does each doubling round compare?",
        choices: [
          "A pair of ranks from the previous round",
          "The full suffixes",
          "One character at a time",
        ],
        answer: 0,
        explanation: "That is what keeps each comparison constant.",
        why: [
          "Correct. The pair stands for twice the previous length.",
          "That would be linear per comparison.",
          "Only the first round looks at single characters.",
        ],
      },
      {
        question: "What does the shared-prefix array measure?",
        choices: [
          "Characters shared with the previous suffix in sorted order",
          "The length of each suffix",
          "How often each substring occurs",
        ],
        answer: 0,
        explanation: "It is defined against the sorted neighbour.",
        why: [
          "Correct. Those shared characters are the repeated prefixes.",
          "Lengths are determined by position.",
          "Occurrence counts come from ranges, not this array.",
        ],
      },
      {
        question: "How many distinct substrings does a text of length n have at most?",
        choices: [
          "n times n plus one, halved",
          "n squared",
          "Two to the n",
        ],
        answer: 0,
        explanation: "Count every start and end pair.",
        why: [
          "Correct. Repeats subtract from that maximum.",
          "That double-counts orderings.",
          "Substrings are contiguous, so not exponential.",
        ],
      },
    ],
  },
  {
    lessonId: "py.ac.m12_3.l2",
    atomId: "py.atom.algo.suffix-automata",
    conceptId: "py.algo.suffix-automata",
    title: "Suffix automata",
    requires: ["py.algo.suffix-array-construction"],
    vocabulary: [
      ["suffix automaton", "the smallest machine accepting exactly the substrings of a text"],
      ["suffix link", "a pointer from a state to the state holding its longest proper suffix"],
      ["state span", "the range of substring lengths one state represents"],
    ],
    opening:
      "A suffix array sorts the substrings. A suffix automaton stores them all as a graph with fewer than twice as many states as the text has characters.",
    outcome:
      "You will build the automaton incrementally and count distinct substrings from the state spans alone.",
    why:
      "It answers substring membership in one pass per query and extends by one character in amortized constant time, which a suffix array cannot do.",
    mentalModel:
      "Picture every substring as a walk from the start state. States that would behave identically are merged, which is why the machine stays small.",
    firstTitle: "Extending by one character",
    firstIntro:
      "Adding a character creates one state and follows suffix links backward, wiring transitions until an existing state already has one. Occasionally a state must be cloned.",
    firstCode: `def build_automaton(text):
    states = [{"len": 0, "link": -1, "next": {}}]
    last = 0
    for ch in text:
        cur = len(states)
        states.append({"len": states[last]["len"] + 1,
                       "link": -1, "next": {}})
        p = last
        while p != -1 and ch not in states[p]["next"]:
            states[p]["next"][ch] = cur
            p = states[p]["link"]
        if p == -1:
            states[cur]["link"] = 0
        else:
            q = states[p]["next"][ch]
            if states[p]["len"] + 1 == states[q]["len"]:
                states[cur]["link"] = q
            else:
                clone = len(states)
                states.append({"len": states[p]["len"] + 1,
                               "link": states[q]["link"],
                               "next": dict(states[q]["next"])})
                while p != -1 and states[p]["next"].get(ch) == q:
                    states[p]["next"][ch] = clone
                    p = states[p]["link"]
                states[q]["link"] = clone
                states[cur]["link"] = clone
        last = cur
    return states`,
    firstTrace:
      "The clone exists because one state was standing for several substring lengths, and only some of them gained the new character. Splitting keeps the machine exact.",
    secondTitle: "Counting from the spans",
    secondIntro:
      "Each state covers a contiguous run of lengths. Its own length minus its link's length is how many distinct substrings it alone accounts for.",
    secondCode: `for text in ("banana", "abcbc", "aaaa"):
    states = build_automaton(text)
    distinct = sum(states[i]["len"] - states[states[i]["link"]]["len"]
                   for i in range(1, len(states)))
    brute = len({text[i:j]
                 for i in range(len(text))
                 for j in range(i + 1, len(text) + 1)})
    print(text, "states", len(states),
          "distinct", distinct, "brute", brute)`,
    secondTrace:
      "Banana gives ten states and fifteen distinct substrings, matching the brute-force count. The repetitive aaaa needs only five states for four substrings.",
    mistake:
      "Skipping the clone case because the tests happen to pass. Repetitive inputs like a doubled word are where it fires, and without it the machine accepts substrings the text does not contain.",
    checkpoint:
      "How many states can a suffix automaton have?",
    checkpointAnswer:
      "Fewer than twice the text length, which is why it stays small even when the number of distinct substrings is quadratic.",
    remember:
      "One state per equivalence class, spans summed for the count.",
    checks: [
      {
        question: "What does a suffix automaton accept?",
        choices: [
          "Exactly the substrings of the text",
          "Exactly the suffixes",
          "Every string over the alphabet",
        ],
        answer: 0,
        explanation: "The name refers to construction, not to what it accepts.",
        why: [
          "Correct. Every walk from the start spells a substring.",
          "Suffixes are a subset of what it accepts.",
          "It rejects anything not present.",
        ],
      },
      {
        question: "How many distinct substrings does one state account for?",
        choices: [
          "Its length minus its suffix link's length",
          "Its length",
          "One",
        ],
        answer: 0,
        explanation: "A state covers a contiguous run of lengths.",
        why: [
          "Correct. Summing that over all states gives the total.",
          "That would count shorter substrings repeatedly.",
          "A state usually covers several lengths.",
        ],
      },
      {
        question: "When does construction need to clone a state?",
        choices: [
          "When a state stands for lengths that no longer behave alike",
          "When the text repeats a character",
          "When the alphabet is large",
        ],
        answer: 0,
        explanation: "The condition compares lengths across a transition.",
        why: [
          "Correct. The clone splits the run of lengths.",
          "Repetition makes it likely but is not the condition.",
          "Alphabet size is irrelevant.",
        ],
      },
    ],
  },
  {
    lessonId: "py.ac.m12_3.l3",
    atomId: "py.atom.algo.palindromic-trees",
    conceptId: "py.algo.palindromic-trees",
    title: "Palindromic trees",
    requires: ["py.algo.suffix-automata"],
    vocabulary: [
      ["palindromic tree", "a structure holding every distinct palindromic substring as one node"],
      ["imaginary root", "a node of length minus one that makes odd-length palindromes fall out naturally"],
      ["longest palindromic suffix", "the longest palindrome ending at the current position"],
    ],
    opening:
      "A text of length n has at most n distinct palindromic substrings. That surprising bound is what makes indexing all of them cheap.",
    outcome:
      "You will extend the tree one character at a time and read the running count of distinct palindromes.",
    why:
      "Palindrome counting, longest-palindrome queries and palindromic factorisation all read directly off this structure.",
    mentalModel:
      "Picture two roots, one of length zero and one of length minus one. Every palindrome grows by adding the same character to both ends of a shorter one.",
    firstTitle: "Two roots, one rule",
    firstIntro:
      "The imaginary root of length minus one is not a trick for its own sake. It makes a single-character palindrome the natural child of something, so odd and even lengths share one rule.",
    firstCode: `def palindromic_tree(text):
    nodes = [{"len": -1, "link": 0, "next": {}},
             {"len": 0, "link": 0, "next": {}}]
    suffix = 1
    counts = []
    for i, ch in enumerate(text):
        cur = suffix
        while True:
            length = nodes[cur]["len"]
            if i - length - 1 >= 0 and text[i - length - 1] == ch:
                break
            cur = nodes[cur]["link"]
        if ch in nodes[cur]["next"]:
            suffix = nodes[cur]["next"][ch]
            counts.append(len(nodes) - 2)
            continue
        new = len(nodes)
        nodes.append({"len": nodes[cur]["len"] + 2, "link": 1, "next": {}})
        if nodes[new]["len"] > 1:
            link = nodes[cur]["link"]
            while True:
                length = nodes[link]["len"]
                if i - length - 1 >= 0 and text[i - length - 1] == ch:
                    break
                link = nodes[link]["link"]
            nodes[new]["link"] = nodes[link]["next"][ch]
        nodes[cur]["next"][ch] = new
        suffix = new
        counts.append(len(nodes) - 2)
    return nodes, counts`,
    firstTrace:
      "The search walks suffix links until it finds a palindrome that can be extended on both sides. That walk is what keeps the whole construction linear overall.",
    secondTitle: "The count as the text grows",
    secondIntro:
      "Each character adds at most one new distinct palindrome, which is the proof of the linear bound. The running count makes that visible.",
    secondCode: `for text in ("ababa", "aaaa", "abc"):
    nodes, counts = palindromic_tree(text)
    brute = len({text[i:j]
                 for i in range(len(text))
                 for j in range(i + 1, len(text) + 1)
                 if text[i:j] == text[i:j][::-1]})
    print(text, "distinct", len(nodes) - 2, "brute", brute, counts)`,
    secondTrace:
      "Ababa reaches five, aaaa reaches four, abc reaches three. Every running count climbs by at most one per character, exactly as the bound predicts.",
    mistake:
      "Assuming the count of palindromic substrings by occurrence is also linear. Distinct palindromes are bounded by the length; total occurrences can be quadratic.",
    checkpoint:
      "How many distinct palindromic substrings can a text of length n have?",
    checkpointAnswer:
      "At most n. Each character adds at most one new one, which is what makes the structure small.",
    remember:
      "Two roots, one new palindrome per character at most.",
    checks: [
      {
        question: "Why does the tree use a root of length minus one?",
        choices: [
          "So a single character extends it into a length-one palindrome",
          "To mark errors",
          "To store the empty string",
        ],
        answer: 0,
        explanation: "Adding a character to both ends adds two to the length.",
        why: [
          "Correct. It unifies the odd and even cases.",
          "It is a real structural node.",
          "The length-zero root does that.",
        ],
      },
      {
        question: "How many distinct palindromic substrings can appear?",
        choices: [
          "At most the text length",
          "At most the square of the length",
          "At most twice the length",
        ],
        answer: 0,
        explanation: "Each character adds at most one.",
        why: [
          "Correct. That bound is why the structure is small.",
          "That is the bound on occurrences.",
          "The bound is tighter than that.",
        ],
      },
      {
        question: "Is the total number of palindromic occurrences also linear?",
        choices: [
          "No; it can be quadratic",
          "Yes; it matches the distinct count",
          "Yes; it is always smaller",
        ],
        answer: 0,
        explanation: "Think about a text of one repeated character.",
        why: [
          "Correct. A run of n identical characters has quadratically many.",
          "Occurrences and distinct counts differ sharply.",
          "Occurrences are never fewer than distinct ones.",
        ],
      },
    ],
  },
  {
    lessonId: "py.ac.m12_3.l4",
    atomId: "py.atom.algo.aho-corasick-automata",
    conceptId: "py.algo.aho-corasick-automata",
    title: "Aho-Corasick automata",
    requires: ["py.algo.palindromic-trees"],
    vocabulary: [
      ["failure link", "where to continue when the current character has no transition"],
      ["output link", "the chain of patterns ending at a state, including those matched as suffixes"],
      ["single pass", "reading the text once regardless of how many patterns are being sought"],
    ],
    opening:
      "Searching a text for a thousand patterns should not cost a thousand passes. One automaton reads the text once and reports every match.",
    outcome:
      "You will build the failure links, propagate outputs along them, and match every pattern in a single scan.",
    why:
      "Filtering, tokenising and scanning for a dictionary of terms are all this problem, and the pattern count is usually large.",
    mentalModel:
      "Picture a trie of the patterns with an extra pointer at each node saying where to resume after a mismatch. The scan never moves backward in the text.",
    firstTitle: "Failure links by breadth",
    firstIntro:
      "Each node's failure link points at the longest proper suffix of its path that is also a trie path. Building them level by level means the target is always already computed.",
    firstCode: `from collections import deque

def build(patterns):
    trie = [{"next": {}, "out": [], "fail": 0}]
    for index, word in enumerate(patterns):
        node = 0
        for ch in word:
            if ch not in trie[node]["next"]:
                trie[node]["next"][ch] = len(trie)
                trie.append({"next": {}, "out": [], "fail": 0})
            node = trie[node]["next"][ch]
        trie[node]["out"].append(index)
    queue = deque(trie[0]["next"].values())
    while queue:
        node = queue.popleft()
        for ch, nxt in trie[node]["next"].items():
            fail = trie[node]["fail"]
            while fail and ch not in trie[fail]["next"]:
                fail = trie[fail]["fail"]
            target = trie[fail]["next"].get(ch, 0)
            trie[nxt]["fail"] = 0 if target == nxt else target
            trie[nxt]["out"] += trie[trie[nxt]["fail"]]["out"]
            queue.append(nxt)
    return trie`,
    firstTrace:
      "Outputs are copied along the failure link as it is set, so a state already knows every pattern ending there without walking the chain at match time.",
    secondTitle: "One scan, every match",
    secondIntro:
      "The scan follows a transition when one exists and follows failure links when it does not. The text position only ever moves forward.",
    secondCode: `def search(trie, text, patterns):
    hits, node = [], 0
    for i, ch in enumerate(text):
        while node and ch not in trie[node]["next"]:
            node = trie[node]["fail"]
        node = trie[node]["next"].get(ch, 0)
        for index in trie[node]["out"]:
            hits.append((i - len(patterns[index]) + 1, patterns[index]))
    return sorted(hits)

patterns = ["he", "she", "his", "hers"]
text = "ushers"
print(search(build(patterns), text, patterns))
print(sorted((i, p) for p in patterns
             for i in range(len(text)) if text.startswith(p, i)))`,
    secondTrace:
      "She at one, he at two and hers at two — identical to the brute-force scan. Overlapping matches are reported because outputs travel along the failure links.",
    mistake:
      "Reporting only the pattern ending at the current state. Without propagating outputs along failure links, a pattern that is a suffix of another is silently missed.",
    checkpoint:
      "Why does a failure link never send the scan backward in the text?",
    checkpointAnswer:
      "It only changes which state you are in, not which character you are reading. The text position advances once per character.",
    remember:
      "Trie plus failure links plus propagated outputs, one pass.",
    checks: [
      {
        question: "What does a failure link point to?",
        choices: [
          "The longest proper suffix of the current path that is also a trie path",
          "The root",
          "The parent node",
        ],
        answer: 0,
        explanation: "It is what lets the scan continue without backtracking.",
        why: [
          "Correct. That is the longest still-viable partial match.",
          "The root is only the fallback.",
          "The parent would lose the progress made.",
        ],
      },
      {
        question: "Why must outputs propagate along failure links?",
        choices: [
          "A pattern can be a suffix of another and would otherwise be missed",
          "To reduce memory",
          "To speed up construction",
        ],
        answer: 0,
        explanation: "Consider searching for both hers and he.",
        why: [
          "Correct. He ends inside hers and must still be reported.",
          "It costs memory rather than saving it.",
          "Construction gets slightly slower.",
        ],
      },
      {
        question: "How does the cost scale with the number of patterns?",
        choices: [
          "The scan is one pass regardless; only construction grows",
          "One pass per pattern",
          "The square of the pattern count",
        ],
        answer: 0,
        explanation: "That is the whole point of the automaton.",
        why: [
          "Correct. Construction is linear in the total pattern length.",
          "That is the naive approach it replaces.",
          "Nothing here is quadratic in the pattern count.",
        ],
      },
    ],
  },
];

export const ALGO_ADVANCED_STRINGS_ATOMS = ALGO_ADVANCED_STRINGS_SPECS.map(guidedMasteryAtom);
export const ALGO_ADVANCED_STRINGS_CONCEPTS = ALGO_ADVANCED_STRINGS_SPECS.map(guidedMasteryConcept);
export const ALGO_ADVANCED_STRINGS_LESSON_CONTENT = guidedLessonContent(ALGO_ADVANCED_STRINGS_SPECS);

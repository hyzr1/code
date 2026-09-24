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

const ALGO_PATTERN_MATCHING_SPECS: GuidedMasterySpec[] = [
  {
    lessonId: "py.ac.m7_1.l1",
    atomId: "py.atom.algo.rabin-karp",
    conceptId: "py.algo.rabin-karp",
    title: "Rabin-Karp rolls a hash across the text",
    requires: ["py.algo.dp-optimizations"],
    vocabulary: [
      ["rolling hash", "a hash that updates in constant time when the window shifts by one"],
      ["polynomial hash", "treating a string as digits of a number in some base"],
      ["hash collision", "two different strings sharing the same hash value"],
      ["verification", "comparing the actual characters once the hashes agree"],
    ],
    opening: "Comparing a pattern against every position costs the pattern's length each time. A rolling hash reduces that comparison to one arithmetic update, which turns a quadratic scan into a linear one.",
    outcome: "You will build a polynomial hash, roll it across a text in constant time per step, and verify matches to handle collisions.",
    why: "Rolling hashes appear well beyond string search, in deduplication, plagiarism detection and content-addressed storage. The verification step is also the detail interviewers check for.",
    mentalModel: "Picture a number written in some base, where sliding the window means dropping the leading digit and appending a new one. Both operations are arithmetic, so the value updates without rereading the digits.",
    firstTitle: "Rolling the window is subtract, shift, add",
    firstIntro: "Three operations replace a full rehash at every position.",
    firstCode: `BASE = 256
MOD = 1_000_000_007

def search(text, pattern):
    n, m = len(text), len(pattern)
    if m == 0 or m > n:
        return []
    high = pow(BASE, m - 1, MOD)
    target = 0
    window = 0
    for i in range(m):
        target = (target * BASE + ord(pattern[i])) % MOD
        window = (window * BASE + ord(text[i])) % MOD
    hits = []
    for start in range(n - m + 1):
        if window == target and text[start:start + m] == pattern:
            hits.append(start)
        if start + m < n:
            window = (window - ord(text[start]) * high) % MOD
            window = (window * BASE + ord(text[start + m])) % MOD
    return hits

print(search("abracadabra", "abra"))
print(search("aaaa", "aa"))
print(search("abc", "d"))`,
    firstTrace: "Each step removes the outgoing character's contribution, shifts the remaining digits up by one place, and adds the incoming character. That is three operations regardless of the pattern length. The pattern appears twice in the first text and three times in the second, where the occurrences overlap.",
    secondTitle: "Equal hashes are a hint, not a proof",
    secondIntro: "Different strings can share a hash, so a match is confirmed by comparing the characters.",
    secondCode: `import string

MOD = 101

def weak_hash(text):
    value = 0
    for ch in text:
        value = (value * 256 + ord(ch)) % MOD
    return value

seen = {}
collisions = []
for first in string.ascii_lowercase:
    for second in string.ascii_lowercase:
        word = first + second
        value = weak_hash(word)
        if value in seen:
            collisions.append((seen[value], word, value))
        else:
            seen[value] = word

print("distinct values:", len(seen), "for 676 words")
print("first collisions:", collisions[:3])`,
    secondTrace: "A modulus of one hundred and one leaves exactly that many possible values, so six hundred and seventy-six two-letter words cannot avoid colliding. A large prime makes collisions rare rather than impossible, which is why the character comparison stays in the algorithm. Skipping it turns a linear-time search into one that is occasionally wrong.",
    mistake: "Do not report a match on hash equality alone. The comparison only runs when the hashes agree, so it costs nothing on the overwhelming majority of positions, and removing it trades correctness for a saving you will never measure.",
    checkpoint: "An adversary knows your base and modulus. What can they construct?",
    checkpointAnswer: "A text full of strings that all hash to the pattern's value, which forces the verification step to run at every position and returns the algorithm to quadratic time. Choosing the base or modulus at random at run time is the standard defence.",
    remember: "A polynomial hash rolls in constant time: subtract the outgoing character, shift, add the incoming one. Equal hashes trigger a character comparison, which is what keeps the answer correct.",
    checks: [
      q("What does the rolling update cost per position?", ["Constant time, regardless of the pattern length", "Time proportional to the pattern length", "Time proportional to the text length"], 0, "Three arithmetic operations do the whole update.", ["Correct. That is what makes the scan linear.", "That would be a full rehash at every position.", "The text length bounds the number of positions."]),
      q("Why compare the characters after the hashes match?", ["Different strings can share a hash value", "The hash may overflow", "The window may be misaligned"], 0, "Collisions are possible with any finite hash.", ["Correct. Verification is what keeps the result correct.", "The modulus prevents overflow.", "Alignment is handled by the loop."]),
      q("How is an adversarial worst case avoided?", ["Choose the base or modulus at random at run time", "Use a larger pattern", "Verify every position"], 0, "A known hash function can be attacked.", ["Correct. Randomization makes the collisions unpredictable.", "Pattern length does not prevent the attack.", "Verifying everywhere is the quadratic behaviour being avoided."]),
    ],
  },
  {
    lessonId: "py.ac.m7_1.l2",
    atomId: "py.atom.algo.kmp",
    conceptId: "py.algo.kmp",
    title: "KMP never re-reads a character of the text",
    requires: ["py.algo.rabin-karp"],
    vocabulary: [
      ["prefix function", "for each position, the longest proper prefix that is also a suffix there"],
      ["failure link", "where to resume the pattern after a mismatch"],
      ["proper prefix", "a prefix that is not the whole string"],
      ["border", "a string that is both a prefix and a suffix of another"],
    ],
    opening: "The naive search throws away everything it learned the moment a mismatch occurs, and starts again one position along. KMP keeps that knowledge in a small table computed from the pattern alone, so the text is read exactly once.",
    outcome: "You will build the prefix function, use it as a failure link during matching, and explain why the text pointer never moves backward.",
    why: "KMP is the standard answer to linear-time matching without any risk of collisions, and the prefix function itself solves period-finding and repeated-substring problems on its own.",
    mentalModel: "Picture reading a combination that fails on the last digit. Rather than starting over, you ask how much of what you already dialled is still a valid beginning, and you continue from there.",
    firstTitle: "The prefix function, computed from the pattern alone",
    firstIntro: "Each entry records the longest proper prefix that also ends at that position.",
    firstCode: `def prefix_function(pattern):
    table = [0] * len(pattern)
    length = 0
    for i in range(1, len(pattern)):
        while length and pattern[i] != pattern[length]:
            length = table[length - 1]
        if pattern[i] == pattern[length]:
            length += 1
        table[i] = length
    return table

for word in ("ababaca", "aaaa", "abcdef", "aabaaab"):
    print(f"{word:>8}: {prefix_function(word)}")`,
    firstTrace: "A value of three at some position means the first three characters reappear ending there. A pattern of repeated letters climbs steadily, and a pattern with no repetition stays at zero throughout. Nothing in this computation looks at the text at all.",
    secondTitle: "Matching, where the text pointer only moves forward",
    secondIntro: "On a mismatch the pattern pointer falls back through the table while the text pointer stays put.",
    secondCode: `def prefix_function(pattern):
    table = [0] * len(pattern)
    length = 0
    for i in range(1, len(pattern)):
        while length and pattern[i] != pattern[length]:
            length = table[length - 1]
        if pattern[i] == pattern[length]:
            length += 1
        table[i] = length
    return table

def kmp(text, pattern):
    if not pattern:
        return []
    table = prefix_function(pattern)
    hits = []
    matched = 0
    for i, ch in enumerate(text):
        while matched and ch != pattern[matched]:
            matched = table[matched - 1]
        if ch == pattern[matched]:
            matched += 1
        if matched == len(pattern):
            hits.append(i - matched + 1)
            matched = table[matched - 1]
    return hits

print(kmp("ababcabcabababd", "ababd"))
print(kmp("aaaaa", "aa"))`,
    secondTrace: "The loop over the text runs once per character and never steps back. The inner fallback only ever decreases the matched count, and the count rises by at most one per character, so the total fallback work is bounded by the text length. Falling back after a full match is what allows overlapping occurrences to be found.",
    mistake: "Do not reset the matched count to zero after reporting a hit. Setting it to the failure link instead is what lets overlapping occurrences be found, and zeroing it silently misses every match that begins inside the one just reported.",
    checkpoint: "Why is the matching loop linear when it contains an inner while loop?",
    checkpointAnswer: "Because the matched count rises by at most one per character of the text, and the inner loop only ever decreases it. Across the whole run it cannot decrease more than it increased, so the total inner work is bounded by the text length.",
    remember: "The prefix function records the longest border at each position, computed from the pattern alone. During matching the text pointer only moves forward, and mismatches fall back through the table.",
    checks: [
      q("What does a prefix-function entry record?", ["The longest proper prefix that is also a suffix ending there", "The number of matches so far", "The position of the last mismatch"], 0, "It is a property of the pattern alone.", ["Correct. That is what makes it a valid resume point.", "No counting is involved.", "The table is built before any text is read."]),
      q("What happens to the text pointer on a mismatch?", ["It stays where it is while the pattern pointer falls back", "It moves back to the start of the attempt", "It advances by the pattern length"], 0, "Never re-reading the text is the point.", ["Correct. That is what makes the scan linear.", "That is the naive behaviour being avoided.", "Skipping ahead would miss occurrences."]),
      q("Why fall back rather than reset to zero after a hit?", ["Overlapping occurrences would otherwise be missed", "It is faster", "The table requires it"], 0, "A new match can begin inside the one just reported.", ["Correct. Resetting silently loses those matches.", "The speed difference is negligible.", "The table permits either; only one is correct."]),
    ],
  },
  {
    lessonId: "py.ac.m7_1.l3",
    atomId: "py.atom.algo.z-algorithm",
    conceptId: "py.algo.z-algorithm",
    title: "The Z-array, and the window that avoids rework",
    requires: ["py.algo.kmp"],
    vocabulary: [
      ["Z-value", "the length of the longest prefix match starting at a position"],
      ["Z-box", "the rightmost interval already known to match the prefix"],
      ["separator", "a character used to join two strings that appears in neither"],
      ["reuse", "copying a Z-value already computed instead of comparing again"],
    ],
    opening: "The Z-array answers one question at every position: how much of the string's own prefix starts here? That single table solves pattern matching, period finding and several counting problems, and it is easier to reason about than the prefix function.",
    outcome: "You will compute the Z-array using a maintained window, and use a separator to turn matching into a Z-array query.",
    why: "Many competitive problems are stated directly in terms of prefix matches, and the Z-array answers them without transformation. It is also the clearest illustration of reusing prior comparisons.",
    mentalModel: "Picture keeping a marker at the furthest point you have already verified. Anything inside that region has been seen before in the prefix, so its answer can be copied instead of recomputed.",
    firstTitle: "Compute it once, reuse everything inside the window",
    firstIntro: "The window records the rightmost region already known to match the prefix.",
    firstCode: `def z_array(s):
    n = len(s)
    z = [0] * n
    left = right = 0
    for i in range(1, n):
        if i < right:
            z[i] = min(right - i, z[i - left])
        while i + z[i] < n and s[z[i]] == s[i + z[i]]:
            z[i] += 1
        if i + z[i] > right:
            left, right = i, i + z[i]
    z[0] = n
    return z

for word in ("aabxaabxcaabxaabxay", "aaaa", "abcabc"):
    print(f"{word:>20}: {z_array(word)}")`,
    firstTrace: "A position inside the window copies its answer from the matching position in the prefix, capped by how much of the window remains. Only comparisons that extend past the window are performed, and each one pushes the window further right. That is what bounds the total work by the string length.",
    secondTitle: "A separator turns matching into a Z-array query",
    secondIntro: "Joining the pattern and text with a character that appears in neither prevents matches from spanning the join.",
    secondCode: `def z_array(s):
    n = len(s)
    z = [0] * n
    left = right = 0
    for i in range(1, n):
        if i < right:
            z[i] = min(right - i, z[i - left])
        while i + z[i] < n and s[z[i]] == s[i + z[i]]:
            z[i] += 1
        if i + z[i] > right:
            left, right = i, i + z[i]
    z[0] = n
    return z

def find(text, pattern):
    joined = pattern + "\\x00" + text
    z = z_array(joined)
    m = len(pattern)
    return [i - m - 1 for i in range(m + 1, len(joined)) if z[i] == m]

print(find("abracadabra", "abra"))
print(find("aaaa", "aa"))
print(find("abc", "abcd"))`,
    secondTrace: "Any position in the text part whose Z-value equals the pattern length is an occurrence. The separator guarantees no match runs across the join, since the pattern contains no copy of that character. Subtracting the pattern length and one converts the joined index back into a text index.",
    mistake: "Do not join the two strings without a separator. A prefix match can then run off the end of the pattern and into the text, so positions get reported that match nothing, and the failure only appears on inputs where the pattern's own tail resembles its head.",
    checkpoint: "The pattern is 'aaa' and the separator chosen is 'a'. What goes wrong?",
    checkpointAnswer: "The separator has to appear in neither string, and this one appears throughout the pattern. Prefix matches will run straight through the join, so Z-values in the text region are inflated and positions get reported that are not occurrences at all.",
    remember: "The Z-array gives the longest prefix match starting at each position, computed with one maintained window. Joining pattern and text with a foreign separator turns matching into a lookup.",
    checks: [
      q("What does a Z-value at position i mean?", ["The longest prefix of the string that starts at i", "The distance to the next match", "The number of occurrences before i"], 0, "It compares against the string's own prefix.", ["Correct. That single table answers many questions.", "No distance is being measured.", "No counting is involved."]),
      q("What does the maintained window save?", ["Comparisons for positions already known to match the prefix", "Memory for the array", "The need for a separator"], 0, "Values inside it are copied rather than recomputed.", ["Correct. Only extensions past the window are compared.", "The array is always the string's length.", "The separator is needed for matching regardless."]),
      q("What must be true of the separator?", ["It appears in neither the pattern nor the text", "It sorts before every other character", "It is a single space"], 0, "Otherwise matches run across the join.", ["Correct. That is the only requirement.", "Ordering is irrelevant here.", "Any absent character works."]),
    ],
  },
  {
    lessonId: "py.ac.m7_1.l4",
    atomId: "py.atom.algo.string-hashing",
    conceptId: "py.algo.string-hashing",
    title: "String hashing, collisions and the birthday problem",
    requires: ["py.algo.z-algorithm"],
    vocabulary: [
      ["prefix hash", "a precomputed table making any substring's hash a constant-time query"],
      ["birthday bound", "the point at which a collision among many values becomes likely"],
      ["double hashing", "combining two independent hashes to make collisions vanishingly rare"],
      ["anti-hash test", "an input constructed to force collisions in a known hash function"],
    ],
    opening: "Hashing a substring in constant time makes a whole family of problems easy, and it introduces a probability you have to reason about rather than ignore. The number of comparisons matters far more than most people expect.",
    outcome: "You will build a prefix-hash table for constant-time substring queries, estimate the collision probability, and combine two hashes.",
    why: "Substring hashing is the fastest route to comparing many substrings, and getting the collision analysis wrong produces a solution that passes every test you wrote and fails on the one you did not.",
    mentalModel: "Think of a room where you only need two people to share a birthday. With enough people it becomes likely long before the room holds three hundred and sixty-five, and comparing many substrings is exactly that situation.",
    firstTitle: "Prefix hashes answer any substring in constant time",
    firstIntro: "One pass builds the table, and each query is a subtraction and a multiplication.",
    firstCode: `BASE = 131
MOD = (1 << 61) - 1

def build(text):
    prefix = [0] * (len(text) + 1)
    power = [1] * (len(text) + 1)
    for i, ch in enumerate(text):
        prefix[i + 1] = (prefix[i] * BASE + ord(ch)) % MOD
        power[i + 1] = power[i] * BASE % MOD
    return prefix, power

def substring(prefix, power, start, length):
    return (prefix[start + length] - prefix[start] * power[length]) % MOD

text = "abracadabra"
prefix, power = build(text)
print("abra at 0:", substring(prefix, power, 0, 4))
print("abra at 7:", substring(prefix, power, 7, 4))
print("cada at 4:", substring(prefix, power, 4, 4))`,
    firstTrace: "The two occurrences of the same substring produce the same value, and a different substring produces a different one. Building the table is one pass, and every query afterwards costs the same regardless of the substring's length. That is what makes comparing thousands of substrings affordable.",
    secondTitle: "How many comparisons before a collision is likely",
    secondIntro: "The probability grows with the square of the number of values, not linearly.",
    secondCode: `def expected_collisions(values, modulus):
    pairs = values * (values - 1) // 2
    return pairs / modulus

for count in (1_000, 100_000, 1_000_000):
    pairs = count * (count - 1) // 2
    print(f"{count:>9} values -> {pairs:.3e} pairs")
    print(f"   modulus 1e9:  expect {expected_collisions(count, 10 ** 9):.3e}")
    print(f"   modulus 2^61: expect {expected_collisions(count, (1 << 61) - 1):.3e}")`,
    secondTrace: "A hundred thousand substrings against a modulus of a billion already expects five collisions, and a million expects five hundred. The same counts against a sixty-one bit modulus expect fewer than one in a million. Two independent thirty-one bit hashes give a comparable guarantee, which is what double hashing is for.",
    mistake: "Do not use a modulus near two to the thirty-two when the problem compares many substrings. The birthday bound puts the collision probability near one well before a million comparisons, and the failure looks like a wrong answer rather than anything hash-related.",
    checkpoint: "Why does the collision probability depend on the square of the comparison count?",
    checkpointAnswer: "Because what matters is the number of pairs, not the number of values, and a set of n values contains about n squared over two pairs. Each pair is an independent chance to collide, so the probability climbs far faster than the value count alone suggests.",
    remember: "Prefix hashes answer any substring in constant time. Collision risk grows with the square of the comparison count, so use a large modulus or combine two independent hashes.",
    checks: [
      q("What does a prefix-hash table make possible?", ["Any substring's hash in constant time", "Sorting the substrings", "Finding the longest repeat directly"], 0, "One subtraction and one multiplication answer a query.", ["Correct. That is what makes mass comparison affordable.", "Sorting needs a different structure.", "That needs additional work on top."]),
      q("Why does collision risk grow with the square of the count?", ["The number of pairs grows quadratically", "Hashes get longer", "The modulus shrinks"], 0, "Each pair is a chance to collide.", ["Correct. That is the birthday bound.", "Hash width is fixed.", "The modulus is a constant."]),
      q("What does double hashing achieve?", ["Two independent values must both collide, which is far less likely", "Twice the speed", "A shorter hash"], 0, "The probabilities multiply.", ["Correct. It matches a much larger single modulus.", "It costs roughly twice as much to compute.", "The combined value is wider, not shorter."]),
    ],
  },
];

export const ALGO_PATTERN_MATCHING_ATOMS = ALGO_PATTERN_MATCHING_SPECS.map(guidedMasteryAtom);
export const ALGO_PATTERN_MATCHING_CONCEPTS = ALGO_PATTERN_MATCHING_SPECS.map(guidedMasteryConcept);
export const ALGO_PATTERN_MATCHING_LESSON_CONTENT = guidedLessonContent(ALGO_PATTERN_MATCHING_SPECS);

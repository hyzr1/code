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

const ALGO_HASHING_SPECS: GuidedMasterySpec[] = [
  {
    lessonId: "py.ac.m2_2.l1",
    atomId: "py.atom.algo.hash-maps-sets-guided",
    conceptId: "py.algo.hash-maps-sets-guided",
    title: "Hash maps and sets trade memory for lookup speed",
    requires: ["py.algo.prefix-sums-2d", "py.dicts", "py.sets"],
    vocabulary: [
      ["hash function", "a rule that turns a key into a repeatable integer used to choose storage"],
      ["hash map", "a structure that connects each unique key to a value"],
      ["hash set", "a structure that stores unique keys for membership questions"],
      ["collision", "two different keys trying to use the same storage location"],
    ],
    opening: "A list answers a membership question by scanning. A hash table spends extra memory to remember where keys live. That trade often changes an algorithm from quadratic time to linear time.",
    outcome: "You will be able to choose between a map and a set, explain average constant-time lookup, and state why the worst case can degrade.",
    why: "Hashing powers duplicate detection, counting, grouping, complement search, caches, and graph bookkeeping. It is one of the most common interview optimizations.",
    mentalModel: "Picture a wall of labeled mailboxes. A hash function turns a key into a mailbox choice. Colliding keys share a mailbox area, so the table still checks equality before returning the right item.",
    firstTitle: "Replace a repeated scan with remembered membership",
    firstIntro: "To detect a duplicate, remember every value already seen. Each new value asks one set-membership question.",
    firstCode: `def contains_duplicate(values):
    seen = set()
    for value in values:
        if value in seen:
            return True
        seen.add(value)
    return False

print(contains_duplicate([4, 1, 7, 4]))
print(contains_duplicate([4, 1, 7, 9]))`,
    firstTrace: "The first four is added. One and seven are added. The second four is already present, so the function returns true. There is one pass and at most n stored values, giving expected theta n time and theta n space.",
    secondTitle: "Use a map when each key needs information",
    secondIntro: "A set can say a word exists. A map can also remember the first index where that word appeared.",
    secondCode: `def first_repeat_positions(words):
    first_index = {}
    for index, word in enumerate(words):
        if word in first_index:
            return first_index[word], index
        first_index[word] = index
    return None

print(first_repeat_positions(["red", "blue", "green", "blue"]))`,
    secondTrace: "Blue first appears at index one, so the map stores `blue: 1`. When blue appears at index three, lookup returns the saved index. The answer is `(1,3)`.",
    mistake: "Do not call hash lookup guaranteed O(1). It is O(1) on average with a healthy table. Severe collisions can force many equality checks and degrade an operation toward O(n).",
    checkpoint: "You only need to know whether an ID appeared before. Should you use a set or a map, and what cost do you expect for n IDs?",
    checkpointAnswer: "Use a set because no extra value is needed. Expect theta n total time and theta n space under average hash-table behavior. Say average or expected when justifying lookup cost.",
    remember: "Use a set for membership and a map for key-to-information lookup. Both usually buy expected O(1) operations by spending O(n) memory.",
    checks: [
      q("When is a set enough?", ["Only membership matters", "Every key needs a count", "Keys must stay sorted"], 0, "A set stores unique keys without a separate payload.", ["Correct. It answers whether a key exists.", "Counts require map values.", "Hash sets do not provide sorted order."]),
      q("Why can hash lookup degrade?", ["Many keys can collide", "Keys are always scanned alphabetically", "Sets cannot store integers"], 0, "Collisions create extra equality work.", ["Correct. A poor collision pattern lengthens lookup.", "Hash tables do not alphabetically scan.", "Integers are hashable."]),
    ],
  },
  {
    lessonId: "py.ac.m2_2.l2",
    atomId: "py.atom.algo.frequency-counting",
    conceptId: "py.algo.frequency-counting",
    title: "Frequency maps turn values into counts",
    requires: ["py.algo.hash-maps-sets-guided"],
    vocabulary: [
      ["frequency", "the number of times a value appears"],
      ["counter", "a map whose values are occurrence counts"],
      ["histogram", "a collection of frequencies for categories or numeric buckets"],
      ["mode", "a value with the greatest frequency"],
    ],
    opening: "Many prompts hide the same first step: count each value. Once counts exist, questions about duplicates, equality, majority, rarity, and matching become simple map lookups.",
    outcome: "You will be able to build a frequency map in one pass, compare multisets correctly, and derive an answer from the finished counts.",
    why: "Counting is more informative than membership. It distinguishes one copy from ten copies and preserves enough information to solve anagram, inventory, vote, and top-frequency problems.",
    mentalModel: "Imagine a scoreboard with one row per value. Every occurrence adds one tally mark to its row. The finished board answers all count questions without rescanning the original sequence.",
    firstTitle: "Build the counter explicitly",
    firstIntro: "Read the old count with a default of zero, add one, and write the new count back under the same key.",
    firstCode: `def frequencies(values):
    counts = {}
    for value in values:
        counts[value] = counts.get(value, 0) + 1
    return counts

counts = frequencies(["cat", "dog", "cat", "bird", "cat"])
print(counts)
print(max(counts, key=counts.get))`,
    firstTrace: "Cat moves from zero to one, then two, then three. Dog and bird each reach one. The map is built in expected theta n time. Reading the key with the largest stored count returns cat.",
    secondTitle: "Compare counts instead of only unique values",
    secondIntro: "Two words are anagrams only when every character has the same count. Equal sets are not enough because sets forget multiplicity.",
    secondCode: `def are_anagrams(left, right):
    if len(left) != len(right):
        return False
    return frequencies(left) == frequencies(right)

print(are_anagrams("listen", "silent"))
print(are_anagrams("aab", "abb"))`,
    secondTrace: "Listen and silent produce equal character counters. The second pair uses the same unique letters, but their counts differ. Frequency maps correctly return false where set comparison would lose needed information.",
    mistake: "Do not use a set when duplicate quantity affects the answer. `{a,b}` describes both `aab` and `abb`, even though those sequences contain different numbers of each character.",
    checkpoint: "A prompt asks whether two inventories contain exactly the same item quantities, regardless of order. What representation makes the final comparison direct?",
    checkpointAnswer: "Build one frequency map for each inventory and compare the maps. Keys represent item types and values represent quantities. This preserves multiplicity while ignoring order.",
    remember: "A counter compresses a sequence into value-to-count facts. Use it whenever how many matters more than where each occurrence appeared.",
    checks: [
      q("What information does a set lose?", ["How many times each key appeared", "Whether a key appeared", "The ability to store strings"], 0, "Sets preserve membership but not multiplicity.", ["Correct. A counter is needed for quantity.", "Membership is exactly what sets preserve.", "Strings can be stored in sets."]),
      q("What is the expected time to build counts for n values?", ["Theta n", "Theta n squared", "Theta one total"], 0, "One expected constant-time update is made per value.", ["Correct. The input is scanned once.", "No nested scan is required.", "Every input value must be read."]),
    ],
  },
  {
    lessonId: "py.ac.m2_2.l3",
    atomId: "py.atom.algo.grouping-by-key",
    conceptId: "py.algo.grouping-by-key",
    title: "Grouping collects items with the same signature",
    requires: ["py.algo.frequency-counting"],
    vocabulary: [
      ["grouping", "placing related items into the same collection"],
      ["signature", "a stable key that represents the feature defining a group"],
      ["bucket", "the list of items stored for one signature"],
      ["canonical form", "one standard representation shared by equivalent items"],
    ],
    opening: "Counting stores one number per key. Grouping stores a whole bucket per key. The hard part is choosing a signature that is equal exactly when two items belong together.",
    outcome: "You will be able to design a grouping key, append items into buckets, and reason about correctness and cost of common signatures.",
    why: "Grouping solves anagrams, event sessions, connected records, geometric classes, and database-style aggregation. A good signature turns pairwise comparison into one pass.",
    mentalModel: "Picture a mail sorter. It stamps each item with a destination code, then drops all items with the same code into one bin. The stamp is the signature; the bin is the bucket.",
    firstTitle: "Group anagrams with a canonical signature",
    firstIntro: "Sorting a word's characters produces the same canonical string for every anagram in that group.",
    firstCode: `def group_anagrams(words):
    groups = {}
    for word in words:
        signature = "".join(sorted(word))
        groups.setdefault(signature, []).append(word)
    return list(groups.values())

print(group_anagrams(["eat", "tea", "tan", "ate", "nat", "bat"]))`,
    firstTrace: "Eat, tea, and ate all produce `aet`. Tan and nat produce `ant`. Bat produces `abt`. Each word is appended once to the bucket selected by its signature.",
    secondTitle: "Group records by a direct field",
    secondIntro: "Sometimes the signature already exists in the data. Here, department name directly selects a bucket.",
    secondCode: `def group_names_by_department(records):
    groups = {}
    for name, department in records:
        groups.setdefault(department, []).append(name)
    return groups

records = [
    ("Ava", "Search"),
    ("Noah", "Infra"),
    ("Mia", "Search"),
]
print(group_names_by_department(records))`,
    secondTrace: "Search maps to the bucket containing Ava and Mia. Infra maps to Noah. The record order is preserved inside each Python list, but the algorithm's main promise is correct group membership.",
    mistake: "Do not pick a signature that merges items that should differ. Word length alone would place `cat` and `dog` together. A valid signature must preserve every property that defines equivalence.",
    checkpoint: "To group points by row, each point is `(x,y)`. What signature should you use, and what should each bucket store?",
    checkpointAnswer: "Use the y coordinate as the signature because equal y means equal row. Each bucket can store the complete points or just their x coordinates, depending on what later work needs.",
    remember: "Grouping is signature to bucket. Correctness depends on a signature that matches the exact meaning of belonging together.",
    checks: [
      q("What makes a grouping signature valid?", ["Equivalent items share it and different groups do not", "It is always an integer", "It is different for every item"], 0, "The key must represent group identity.", ["Correct. It neither splits nor wrongly merges groups.", "Tuples and strings are also common keys.", "Items in one group must share a signature."]),
      q("What does each map value store during grouping?", ["A bucket of related items", "Only a Boolean", "The hash function source code"], 0, "Each signature points to its collected group.", ["Correct. Appending grows the bucket.", "A Boolean supports membership, not grouping.", "Python manages hashing internally."]),
    ],
  },
  {
    lessonId: "py.ac.m2_2.l4",
    atomId: "py.atom.algo.default-writeback",
    conceptId: "py.algo.default-writeback",
    title: "Read a default, update, and write back",
    requires: ["py.algo.grouping-by-key"],
    vocabulary: [
      ["default", "the value used when a key has not appeared yet"],
      ["write-back", "storing the updated value under the same key"],
      ["accumulator", "a stored value that summarizes items processed so far"],
      ["first occurrence", "the earliest position where a key appeared"],
    ],
    opening: "Many hash-map solutions share one tiny shape: read what is known, use a sensible default if nothing is known, update that state, then write it back. Naming the steps prevents missing-key bugs.",
    outcome: "You will be able to adapt the same read-update-write pattern for counting, grouping, sums, first positions, and best-so-far state.",
    why: "Interview code becomes easier to verify when map updates follow one visible rhythm. The chosen default also documents what an unseen key should mean.",
    mentalModel: "Imagine one note card per key. If no card exists, start with a blank card chosen for the task. Read it, change it using the new item, and return it to the same labeled slot.",
    firstTitle: "Use different defaults for different jobs",
    firstIntro: "Counts begin at zero. Sums begin at zero. Groups begin as empty lists. The update operation decides the correct neutral starting value.",
    firstCode: `events = [("A", 3), ("B", 5), ("A", 2)]
counts = {}
totals = {}

for key, value in events:
    counts[key] = counts.get(key, 0) + 1
    totals[key] = totals.get(key, 0) + value

print(counts)
print(totals)`,
    firstTrace: "A's count moves zero to one to two. A's total moves zero to three to five. B reaches count one and total five. The same outer shape stores two different summaries.",
    secondTitle: "Preserve the first occurrence",
    secondIntro: "A first-index map should write only when the key is absent. Overwriting every time would store the last index instead.",
    secondCode: `def first_positions(values):
    positions = {}
    for index, value in enumerate(values):
        if value not in positions:
            positions[value] = index
    return positions

print(first_positions(["x", "y", "x", "z", "y"]))`,
    secondTrace: "X is written at zero and never overwritten. Y is written at one. Z is written at three. The update rule matches the promised meaning: earliest position, not most recent position.",
    mistake: "Do not choose a default mechanically. Negative values make zero a wrong default for some maximum problems. First-occurrence tracking should not use a fake index that could be mistaken for real data.",
    checkpoint: "You need the largest score seen for each user, and scores may be negative. What safe update shape can you use?",
    checkpointAnswer: "If the user is absent, store the first score directly. Otherwise store `max(old_score, new_score)`. This avoids incorrectly treating zero as if it were an observed score.",
    remember: "Read, update, write back—but choose a default and overwrite rule that exactly match the state you promise to store.",
    checks: [
      q("Why is an empty list the right grouping default?", ["It is the neutral bucket before the first append", "Lists make hashing unnecessary", "Every key must share one list"], 0, "A new key starts with no grouped items.", ["Correct. Then the current item is appended.", "A map still chooses buckets by key.", "Each key needs a separate list."]),
      q("How do you preserve a first index?", ["Write only when the key is absent", "Overwrite on every occurrence", "Start every key at zero"], 0, "Later occurrences must not replace the earliest one.", ["Correct. The first write becomes permanent.", "That stores the last index.", "Zero may be a real index for only one key."]),
    ],
  },
  {
    lessonId: "py.ac.m2_2.l5",
    atomId: "py.atom.algo.composite-keys",
    conceptId: "py.algo.composite-keys",
    title: "Tuple keys remember a complete state",
    requires: ["py.algo.default-writeback"],
    vocabulary: [
      ["composite key", "one hash key built from several pieces of state"],
      ["tuple", "an immutable ordered Python value that can be hashable"],
      ["state", "the information needed to describe one position or situation"],
      ["memoization", "saving the answer for a state that has already been solved"],
    ],
    opening: "One number is not always enough to identify a state. A grid position needs row and column. A search may need index and remaining budget. A tuple packs those pieces into one exact hash key.",
    outcome: "You will be able to design tuple keys, explain why order matters, and avoid merging states that need different answers.",
    why: "Composite keys appear in grids, dynamic programming, graph search, geometry, caching, and database joins. Missing one state component creates subtle wrong reuse.",
    mentalModel: "A hotel room is not identified by room number alone when several buildings exist. The pair `(building, room)` is the full address. A tuple key is a complete address for algorithm state.",
    firstTitle: "Count visits to grid cells",
    firstIntro: "Row and column together identify a cell. Python tuples are immutable, so tuples containing hashable values can be dictionary keys.",
    firstCode: `visits = [(0, 1), (2, 3), (0, 1), (1, 1), (2, 3)]
counts = {}

for row, column in visits:
    cell = (row, column)
    counts[cell] = counts.get(cell, 0) + 1

print(counts)
print(counts[(0, 1)])`,
    firstTrace: "The key `(0,1)` receives two visits. `(2,3)` also receives two, and `(1,1)` receives one. Row zero column one stays distinct from row one column zero because tuple order matters.",
    secondTitle: "Memoize using every answer-changing input",
    secondIntro: "The best result from one position can differ when remaining budget differs. The cache key must include both values.",
    secondCode: `prices = [2, 4, 1]
cache = {}

def max_items(index, budget):
    state = (index, budget)
    if state in cache:
        return cache[state]
    if index == len(prices):
        return 0

    best = max_items(index + 1, budget)
    if prices[index] <= budget:
        best = max(best, 1 + max_items(index + 1, budget - prices[index]))
    cache[state] = best
    return best

print(max_items(0, 5), len(cache))`,
    secondTrace: "The recursion asks repeated questions identified by index and budget. Caching only index would wrongly treat different remaining budgets as the same problem. The full tuple safely reuses exact states.",
    mistake: "Do not omit a field just to make a key smaller. If changing that field can change the correct future answer, it belongs in the state key. Also avoid mutable lists as dictionary keys.",
    checkpoint: "A robot search result depends on row, column, and whether a key has been collected. What cache key should identify a state?",
    checkpointAnswer: "Use `(row, column, has_key)`. Two visits to the same cell can have different legal futures when one robot has the key and the other does not.",
    remember: "A composite key is the complete address of a state. Include every component that can change the answer, in a consistent order.",
    checks: [
      q("Why use (row, column) instead of row alone?", ["Different columns in one row are different cells", "Tuples sort the grid", "Rows cannot be integers"], 0, "The full location needs both coordinates.", ["Correct. Omitting column merges distinct states.", "Hash keys do not automatically sort traversal.", "Integer rows are valid keys."]),
      q("Which Python value is normally suitable as a composite dictionary key?", ["A tuple of integers", "A list of integers", "A changing set"], 0, "An immutable tuple of hashable parts is hashable.", ["Correct. Its value stays stable after insertion.", "Lists are mutable and unhashable.", "Mutable sets are unhashable."]),
    ],
  },
  {
    lessonId: "py.ac.m2_2.l6",
    atomId: "py.atom.algo.set-operations-guided",
    conceptId: "py.algo.set-operations-guided",
    title: "Set operations express membership logic",
    requires: ["py.algo.composite-keys"],
    vocabulary: [
      ["union", "every value present in either set"],
      ["intersection", "only values present in both sets"],
      ["difference", "values in the left set but not the right set"],
      ["symmetric difference", "values present in exactly one of two sets"],
    ],
    opening: "Sets do more than remove duplicates. Their operations directly express words such as either, both, only in the first, and in exactly one. The code can mirror the problem statement.",
    outcome: "You will be able to choose the correct set operation, preserve order when required, and account for the memory and ordering tradeoffs of conversion.",
    why: "Set algebra simplifies permissions, shared interests, missing records, graph neighborhoods, and validation. It often replaces nested membership loops with linear expected work.",
    mentalModel: "Picture two circles of name cards. Union gathers both circles. Intersection takes the overlap. Difference keeps one circle after its overlap is removed. Symmetric difference keeps the two non-overlapping wings.",
    firstTitle: "Translate four questions into four operations",
    firstIntro: "The operator symbols are compact, but name the business question before choosing one.",
    firstCode: `backend = {"Ava", "Mia", "Noah"}
frontend = {"Mia", "Liam"}

print("either", backend | frontend)
print("both", backend & frontend)
print("backend only", backend - frontend)
print("exactly one", backend ^ frontend)`,
    firstTrace: "Union contains four people. Intersection contains Mia. Backend difference contains Ava and Noah. Symmetric difference contains everyone except Mia because Mia appears in both groups.",
    secondTitle: "Deduplicate while preserving first-seen order",
    secondIntro: "Converting straight to a set removes duplicates but does not promise the sequence order your output contract may require.",
    secondCode: `def unique_in_order(values):
    seen = set()
    result = []
    for value in values:
        if value not in seen:
            seen.add(value)
            result.append(value)
    return result

print(unique_in_order([3, 1, 3, 2, 1, 4]))`,
    secondTrace: "Three is kept and remembered. One is kept. The next three is skipped. Two is kept, the next one is skipped, and four is kept. The output is `[3,1,2,4]`.",
    mistake: "Do not convert to a set when positions, duplicates, or stable order are still part of the answer. Set conversion intentionally discards multiplicity and sequence order.",
    checkpoint: "You need IDs found in the database but absent from the incoming file. Which difference order should you use?",
    checkpointAnswer: "Use `database_ids - incoming_ids`. Set difference is directional: keep values from the left that do not occur on the right. Reversing the operands answers the opposite question.",
    remember: "Use union for either, intersection for both, difference for left-only, and symmetric difference for exactly one. Preserve order explicitly when the contract needs it.",
    checks: [
      q("Which operation finds values in both sets?", ["Intersection", "Union", "Difference"], 0, "Intersection keeps the shared overlap.", ["Correct. In Python it uses ampersand.", "Union keeps either set's values.", "Difference keeps left-only values."]),
      q("Why not always use list(set(values)) for deduplication?", ["It does not promise first-seen order", "Sets keep every duplicate", "Sets require nested loops"], 0, "An explicit scan preserves the output contract.", ["Correct. Track seen values while appending first occurrences.", "Sets remove duplicate membership.", "Set membership is expected constant time."]),
    ],
  },
];

export const ALGO_HASHING_ATOMS = ALGO_HASHING_SPECS.map(guidedMasteryAtom);
export const ALGO_HASHING_CONCEPTS = ALGO_HASHING_SPECS.map(guidedMasteryConcept);
export const ALGO_HASHING_LESSON_CONTENT = guidedLessonContent(ALGO_HASHING_SPECS);

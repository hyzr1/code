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

const SPECS: GuidedMasterySpec[] = [
  {
    lessonId: "py.ac.m2_1.l1",
    atomId: "py.atom.algo.dynamic-arrays",
    conceptId: "py.algo.dynamic-arrays",
    title: "Arrays and dynamic arrays from memory upward",
    requires: ["py.algo.communication-method", "py.lists", "py.algo.amortized-cost"],
    vocabulary: [
      ["array", "a sequence whose slots sit next to one another in memory"],
      ["index", "a numbered offset used to jump directly to one slot"],
      ["length", "the number of values currently stored"],
      ["capacity", "the number of slots available before storage must grow"],
    ],
    opening: "Python lists are dynamic arrays. They feel flexible, but underneath they use a simple promise: references are stored in numbered neighboring slots. That promise explains both their speed and their expensive operations.",
    outcome: "You will be able to justify constant-time indexing, explain resizing, and predict why inserting or deleting near the front costs linear time.",
    why: "Arrays appear in almost every interview. Choosing a list is easy; reasoning about its operations is the real skill. Hidden shifts and occasional resizes often decide whether a solution scales.",
    mentalModel: "Picture numbered lockers in one hallway. Knowing locker zero's address lets Python jump to locker `i`. If every locker is full, the school builds a larger hallway and moves all stored references.",
    idea: [
      "An **array** is a run of slots sitting next to each other in memory. That neighbouring part is the whole trick. Because the slots are adjacent and all the same size, the computer can work out where slot number seven lives by arithmetic: start of the array, plus seven slot-widths.",
      "That is why an **index** is fast. Jumping to any position costs the same as jumping to any other, no matter how long the list is. Nothing is searched. The address is computed.",
      "But real programs grow lists, and a fixed run of slots cannot grow. There may be other data sitting immediately after it. So Python separates two numbers you should keep apart. The **length** is how many values you have stored. The **capacity** is how many slots were reserved. Capacity is normally larger, and the spare slots are what let an append be instant.",
      "When an append arrives and capacity is full, Python asks for a bigger block, copies every existing value across, and then stores the new one. That copy touches every element, so that one append is expensive.",
      "Here is the part worth understanding, because it looks like a contradiction. Each growth roughly doubles the capacity. Doubling means the expensive copies get rarer exactly as fast as they get costlier, and if you add up the whole cost of `n` appends and divide it by `n`, you get a constant. So an append is occasionally slow and always cheap on average. That averaged-out cost is called the **amortized** cost, and it is why appending in a loop is a perfectly normal thing to do.",
    ],
    firstTitle: "See which operations shift values",
    firstIntro: "Reading an index jumps to one slot. Inserting at index one must open a hole, so everything from that position onward moves right.",
    firstCode: `values = [10, 20, 30, 40]
print(values[2])   # computed address, not a search: same cost at any index

values.insert(1, 15)   # shifts everything after it along: linear, unlike append
print(values)

values.pop(1)
print(values)`,
    firstTrace: "Index two immediately reads `30`. Inserting `15` shifts `20, 30, 40` one slot right. Removing at index one shifts them left again. Indexing is Θ(1); middle insertion and deletion are Θ(n) in the worst case.",
    secondTitle: "Simulate length and capacity",
    secondIntro: "Real Python uses a growth policy chosen by CPython. This simplified doubling model shows why rare expensive appends average out.",
    secondCode: `length = 0
capacity = 1

for value in range(8):
    if length == capacity:
        old_capacity = capacity
        capacity *= 2
        print("resize", old_capacity, "to", capacity)
    length += 1
    print("append", value, "length", length, "capacity", capacity)`,
    secondTrace: "Most appends only write the next free slot. Resizes happen at lengths one, two, and four. Copy costs form a geometric series smaller than a constant multiple of all appends, so append is Θ(1) amortized, though one append can be Θ(n).",
    mistake: "Do not call every list operation O(1). Direct indexing and end append are cheap. Membership search, front insertion, and front deletion scan or shift many positions.",
    checkpoint: "A list holds one million items. Compare reading the last item, appending with spare capacity, and inserting at index zero.",
    checkpointAnswer: "Reading the last item is Θ(1). Appending with spare capacity is Θ(1). Inserting at zero is Θ(n) because one million existing references must shift right.",
    remember: "Contiguous numbered slots make indexing fast. Growth requires occasional copying, and changing the front or middle requires shifting a suffix.",
    checks: [
      q("Why is array indexing Θ(1)?", ["The address is computed from the index", "Python scans from zero", "Arrays are always small"], 0, "A fixed-size slot offset identifies the position directly.", ["Correct. No earlier element must be visited.", "Scanning would be linear.", "Complexity does not assume small input."]),
      q("What is one append's worst-case time during resize?", ["Θ(1)", "Θ(log n)", "Θ(n)"], 2, "Existing references may all be copied.", ["That is the amortized result, not every call.", "A resize copies rather than halves work.", "Correct. One resize can move n references."]),
    ],
  },
  {
    lessonId: "py.ac.m2_1.l2",
    atomId: "py.atom.algo.in-place-arrays",
    conceptId: "py.algo.in-place-arrays",
    title: "In-place array manipulation without losing values",
    requires: ["py.algo.dynamic-arrays", "py.two-pointers"],
    vocabulary: [
      ["in place", "changing the input using only constant or tightly bounded extra storage"],
      ["swap", "exchange two positions without losing either value"],
      ["read pointer", "an index that inspects unprocessed input"],
      ["write pointer", "an index marking where the next kept value belongs"],
    ],
    opening: "In-place code is not valuable because new lists are evil. It is valuable when memory is constrained or the contract requires mutation. The danger is overwriting information before it has been used.",
    outcome: "You will be able to reverse, rotate, and compact an array while naming the processed and unprocessed regions.",
    why: "Pointer movement appears in sorting, partitioning, deduplication, and matrix work. A region invariant makes compact code understandable instead of clever-looking.",
    mentalModel: "Imagine rearranging books on one shelf with one empty hand. You may swap books, but you must know which shelf region is already final and which region still contains needed information.",
    idea: [
      "Working **in place** means rearranging the list you were handed instead of building a new one. You are allowed a couple of variables, but not a second copy of the data. What you gain is memory: constant extra space rather than another `n` slots.",
      "The immediate hazard is that writing into a list destroys whatever was there. Assign to `values[0]` and the old value is simply gone. That is why a straight assignment is usually the wrong move and a **swap** is the right one: a swap exchanges two positions and keeps both values, just in different places.",
      "The pattern that makes in-place work manageable uses two indices moving through the same list with different jobs. The **read pointer** moves forward over everything, inspecting values that have not been considered yet. The **write pointer** marks the slot where the next value worth keeping belongs.",
      "The read pointer always runs ahead of, or level with, the write pointer. That gap is exactly the number of values discarded so far, and it is what makes the technique safe: the write pointer only ever lands on a slot the read pointer has already finished with, so nothing unread is ever overwritten.",
      "Stated as an invariant, it is short. Everything to the left of the write pointer is a finished, correct answer. Everything from the read pointer rightwards is untouched input. When the read pointer runs off the end, the write pointer's position is the length of the result.",
    ],
    firstTitle: "Reverse by shrinking an unfinished region",
    firstIntro: "Everything outside `[left, right]` is already in final reversed position. Swap the boundary pair, then shrink the unfinished region.",
    firstCode: `def reverse_in_place(values):
    left = 0
    right = len(values) - 1
    while left < right:
        # swap, never assign: assigning would destroy one of the two values
        values[left], values[right] = values[right], values[left]
        left += 1
        right -= 1

numbers = [1, 2, 3, 4, 5]
reverse_in_place(numbers)
print(numbers)`,
    firstTrace: "Swap one with five, giving `[5,2,3,4,1]`. Swap two with four, giving `[5,4,3,2,1]`. The pointers meet at three. Time is Θ(n), and extra space is Θ(1).",
    secondTitle: "Rotate right with three reversals",
    secondIntro: "A right rotation by `k` moves the last `k` values to the front. Reverse all values, then repair the two reversed groups.",
    secondCode: `def rotate_right(values, k):
    if not values:
        return
    k %= len(values)
    values.reverse()
    values[:k] = reversed(values[:k])
    values[k:] = reversed(values[k:])

letters = ["a", "b", "c", "d", "e"]
rotate_right(letters, 2)
print(letters)`,
    secondTrace: "Full reversal gives `e,d,c,b,a`. Repairing the first two gives `d,e,c,b,a`. Repairing the rest gives `d,e,a,b,c`, the requested rotation. The slice assignments create temporary slices in Python, so this exact code is conceptually in-place but not strict O(1) auxiliary space.",
    mistake: "Do not claim constant extra space when Python slicing creates copies. For a strict interview requirement, write a boundary-based reversal helper that swaps within the original list.",
    checkpoint: "During reversal, what is guaranteed about positions smaller than `left` and larger than `right`?",
    checkpointAnswer: "They already contain their final reversed values. Only the inclusive region from `left` through `right` remains unfinished.",
    remember: "In-place algorithms survive by protecting unprocessed information and giving every pointer a precise region meaning.",
    checks: [
      q("What is the reversal invariant?", ["Outside the pointers is final", "Inside the pointers is sorted", "Every value is unique"], 0, "Each swap finalizes two outside positions.", ["Correct. The unfinished interval shrinks.", "Reversal does not sort.", "Duplicates are allowed."]),
      q("Why is Python slice assignment not strict O(1) extra space here?", ["The slices create temporary lists", "Assignment is recursive", "The list becomes immutable"], 0, "Slicing copies the selected references.", ["Correct. A swap helper avoids those copies.", "No recursion is used.", "Lists remain mutable."]),
    ],
  },
  {
    lessonId: "py.ac.m2_1.l3",
    atomId: "py.atom.algo.cyclic-placement",
    conceptId: "py.algo.cyclic-placement",
    title: "Cyclic placement: let values choose their indices",
    requires: ["py.algo.in-place-arrays"],
    vocabulary: [
      ["home index", "the position assigned to a bounded value, often value minus one"],
      ["cyclic placement", "swapping values toward their home indices until each is placed or blocked"],
      ["duplicate blocker", "a matching value already occupying the desired home"],
      ["bounded domain", "a known small value range tied to the array length"],
    ],
    opening: "Sometimes values contain their own addresses. In a length-`n` array holding one through `n`, value `x` belongs at index `x - 1`.",
    outcome: "You will be able to recognize the bounded-domain requirement, place values safely, and find a missing or repeated value in linear time and constant extra space.",
    why: "This pattern turns the input array into its own lookup table. It avoids a set, but it mutates the input and works only when values map cleanly to indices.",
    mentalModel: "Students hold numbered seat cards. Student five walks to index four. Swaps continue until each student reaches home or meets an identical card.",
    idea: [
      "Sometimes the values themselves tell you where they belong. If a list of `n` entries is promised to hold numbers from one to `n`, then the value `3` has an obvious address: index two. That address is its **home index**, and for this kind of promise it is simply the value minus one.",
      "A promise like that is a **bounded domain**, meaning the values are known to sit in a small range tied to the length of the array. It is a strong hint. It means you can sort by placement rather than by comparison, and placement is linear.",
      "**Cyclic placement** is the method. Look at the value in front of you and work out its home. If it is not already there, swap it into its home. That swap hands you a different value, which has its own home, so you repeat with the newcomer. You keep going in a chain until the value you are holding has nowhere to go.",
      "Two things stop the chain. Either the value is now at home, or its home is already occupied by an identical value. That second case is a **duplicate blocker**, and it is not a failure. It is information: two copies of the same number cannot both live at one address, so you have just detected a duplicate.",
      "The reason this is linear rather than quadratic is worth spelling out, because the nested-looking loop suggests otherwise. Every swap puts at least one value permanently into its correct home, and a value that is home is never moved again. There are only `n` values, so there can only ever be `n` such swaps in the entire run, however they are distributed across the outer loop.",
    ],
    firstTitle: "Find the first missing positive",
    firstIntro: "Only values from one through `n` have homes in an `n`-item list. Ignore zero, negatives, and values larger than `n`.",
    firstCode: `def first_missing_positive(values):
    index = 0
    while index < len(values):
        value = values[index]
        home = value - 1   # a bounded value knows its own address
        # in range, and its home is not already holding an identical value
        if 1 <= value <= len(values) and values[home] != value:
            values[index], values[home] = values[home], values[index]
        else:
            index += 1   # placed, or blocked by a duplicate: move on

    for index, value in enumerate(values):
        if value != index + 1:
            return index + 1
    return len(values) + 1

print(first_missing_positive([3, 4, -1, 1]))`,
    firstTrace: "Value three moves to index two. Value four moves to index three. Value one then moves to index zero. The arranged list begins `[1,-1,3,4]`. Index one lacks value two, so the answer is `2`.",
    secondTitle: "Detect a duplicate blocker",
    secondIntro: "When a value's home already contains the same value, another copy has nowhere new to go.",
    secondCode: `def duplicate_in_one_to_n(values):
    index = 0
    while index < len(values):
        value = values[index]
        home = value - 1
        if home == index:
            index += 1
        elif values[home] == value:
            return value
        else:
            values[index], values[home] = values[home], values[index]
    return None

print(duplicate_in_one_to_n([1, 3, 4, 2, 2]))`,
    secondTrace: "Values one, three, and four reach their homes. When a two tries to move to index one, another two is already there. The function returns two. Every successful swap places at least one value, so total swaps are O(n).",
    mistake: "Do not use cyclic placement when values are arbitrary IDs or when mutation is forbidden. A hash set is clearer unless the bounded index mapping and space requirement justify this pattern.",
    checkpoint: "Why can the placement loop stay O(n) even though one index may perform several swaps?",
    checkpointAnswer: "A successful swap moves some valid value into its final home. There are only `n` homes, so at most O(n) productive placements occur across the whole loop.",
    remember: "Use cyclic placement only when each valid value owns a predictable array index. Swaps build an in-place presence table.",
    checks: [
      q("What is value x's home in a one-through-n array?", ["Index x-1", "Index x+1", "Always index zero"], 0, "Python indices start at zero.", ["Correct. Value one belongs at index zero.", "That skips two positions.", "Different values need different homes."]),
      q("What stops swapping when a duplicate reaches its home?", ["The same value is already there", "The value becomes negative", "The list sorts itself"], 0, "The duplicate has no distinct home to occupy.", ["Correct. That collision proves repetition.", "No sign change is needed.", "Home placement is not general sorting."]),
    ],
  },
  {
    lessonId: "py.ac.m2_1.l4",
    atomId: "py.atom.algo.immutable-strings",
    conceptId: "py.algo.immutable-strings",
    title: "Strings are immutable sequences, not editable character arrays",
    requires: ["py.algo.dynamic-arrays", "py.strings", "py.text-split"],
    vocabulary: [
      ["immutable", "unable to change after creation"],
      ["code point", "the Unicode number assigned to a character"],
      ["builder", "a mutable collection of pieces later joined once"],
      ["encoding", "a rule that turns text into bytes and bytes back into text"],
    ],
    opening: "A Python string supports indexing and slicing, but assigning to one character is forbidden. Every apparent modification creates a new string. That fact changes how efficient string algorithms are written.",
    outcome: "You will be able to reason about slicing cost, build text without quadratic copying, and distinguish characters, code points, and encoded bytes.",
    why: "Interview code often scans, normalizes, or constructs text. Repeated string concatenation inside a loop can copy an ever-growing prefix again and again.",
    mentalModel: "Treat a string like a printed label. You may read any letter, but changing the label requires printing another one. A list of pieces is a tray where edits happen before one final print.",
    idea: [
      "A Python string is **immutable**: once it exists it cannot be changed. There is no way to write into character three. Every operation that looks like editing a string is actually building a brand new one.",
      "This matters for cost, not just for style. Adding a character to a string in a loop copies the entire string every time. Do that `n` times and you have done work proportional to `n` squared, which for a long document is the difference between instant and unusable.",
      "The fix is a **builder**: collect the pieces in a list, which really is mutable, and join them once at the end. Appending to a list is cheap, and the single join walks the pieces once. The whole job becomes linear.",
      "There is a second thing strings are not, and it trips people up on real-world text. A string is a sequence of **code points**, the Unicode numbers assigned to characters, not a sequence of bytes. Plenty of characters need more than one byte.",
      "Turning text into bytes needs an **encoding**, a rule for that conversion and its reverse. This is why reversing a string by bytes can produce nonsense while reversing it by characters does not, and why the length of the text and the length of its encoded form are different numbers that are easy to confuse.",
    ],
    firstTitle: "Build output with pieces and one join",
    firstIntro: "Keep only letters and make them lowercase. Appending to a list is amortized constant time; joining knows the final size and builds once.",
    firstCode: `def letters_only(text):
    pieces = []          # the builder: appending here is cheap
    for character in text:
        if character.isalpha():
            pieces.append(character.casefold())
    return "".join(pieces)   # one join at the end, so the whole job stays linear

print(letters_only("Ada, 2026!"))`,
    firstTrace: "The loop appends `a`, `d`, and `a` to a mutable list. Digits and punctuation are skipped. One join produces `ada`. Time is Θ(n), and output storage is Θ(n).",
    secondTitle: "Connect characters to Unicode numbers",
    secondIntro: "`ord` maps one character to its code point. `chr` performs the reverse mapping. This is not the same as UTF-8 bytes.",
    secondCode: `for character in ["A", "a", "é"]:
    number = ord(character)
    print(character, number, chr(number))

word = "café"
print(list(word.encode("utf-8")))`,
    secondTrace: "Every `chr(ord(character))` returns the original character. The word has four characters, but its UTF-8 encoding uses five bytes because `é` needs two bytes. Character indices and byte offsets are different coordinate systems.",
    mistake: "Do not assume one visible symbol always equals one Python character. Combined accents and emoji sequences can use several code points. Unicode text processing may need specialized segmentation.",
    checkpoint: "Why can `result = result + piece` inside a long loop become quadratic?",
    checkpointAnswer: "Each concatenation may copy the entire result-so-far into a new string. Copying prefixes of lengths one through `n` adds up to Θ(n²) character work.",
    remember: "Read strings as sequences, build changes in mutable pieces, join once, and never confuse text positions with encoded byte positions.",
    checks: [
      q("Why prefer list append plus join for many pieces?", ["It avoids repeatedly copying the growing prefix", "Strings cannot contain spaces", "Join sorts characters"], 0, "One final allocation avoids cumulative copies.", ["Correct. This keeps construction linear.", "Strings may contain spaces.", "Join preserves piece order."]),
      q("Can four Unicode characters require more than four UTF-8 bytes?", ["Yes", "No", "Only for digits"], 0, "Many code points use multiple UTF-8 bytes.", ["Correct. Character count and byte count differ.", "ASCII is one byte, but Unicode is broader.", "Digits are usually single-byte ASCII."]),
    ],
  },
  {
    lessonId: "py.ac.m2_1.l5",
    atomId: "py.atom.algo.prefix-sums-guided",
    conceptId: "py.algo.prefix-sums-guided",
    title: "Prefix sums turn repeated range work into subtraction",
    requires: ["py.algo.dynamic-arrays", "py.prefix-sums"],
    vocabulary: [
      ["prefix sum", "the total of all values before a chosen boundary"],
      ["half-open range", "a range including its left boundary and excluding its right"],
      ["precomputation", "one setup pass that makes later queries cheaper"],
      ["range query", "a question about a contiguous interval"],
    ],
    opening: "If many questions ask for totals over different subarrays, rescanning each range repeats work. Prefix sums save every boundary total once, then remove the unwanted left prefix with subtraction.",
    outcome: "You will be able to build a padded prefix array, answer `[left,right)` sums, and explain the setup-versus-query tradeoff.",
    why: "Prefix sums power subarray counts, interval statistics, image regions, and difference arrays. The extra leading zero removes special cases at the left edge.",
    mentalModel: "Imagine an odometer beside a walking path. At every fence, record the total distance traveled. Distance between two fences is the later odometer reading minus the earlier one.",
    idea: [
      "Suppose you are asked for the total of a slice of a list, many times over, on the same list. Adding the slice up each time re-adds numbers you have already added. If the slices are long and the questions are many, that repetition is the entire cost.",
      "A **prefix sum** removes it. Build one new list where each entry is the total of everything before that boundary. One pass, adding as you go, and you are done.",
      "Now any range total is a single subtraction. The total up to the end of the range, minus the total up to its start, leaves exactly the values in between. Everything before the start was counted in both numbers and cancels out. A **range query** that used to cost the length of the range now costs one subtraction.",
      "That is the shape of **precomputation**: one setup pass makes every later question cheap. You pay `n` once instead of paying the range length every time.",
      "The detail that causes almost every bug here is the boundaries, so be deliberate. Use a **half-open range**, which includes its left boundary and excludes its right. Make the prefix list one longer than the data and start it with a zero. That leading zero is what lets a range starting at position zero subtract cleanly, with no special case, and half-open ranges subtract without any adjusting by one.",
    ],
    firstTitle: "Build boundary totals with a leading zero",
    firstIntro: "`prefix[i]` means the sum of values strictly before index `i`. A list of length `n` therefore has `n + 1` boundaries.",
    firstCode: `def prefix_sums(values):
    prefix = [0]   # the leading zero removes the range-starts-at-zero special case
    for value in values:
        prefix.append(prefix[-1] + value)   # running total so far
    return prefix

values = [2, 5, -1, 4]
prefix = prefix_sums(values)
print(prefix)`,
    firstTrace: "The boundaries are `[0,2,7,6,10]`. Boundary three totals values at indices zero, one, and two. The leading zero means the sum before the first item exists naturally.",
    secondTitle: "Answer any half-open range in constant time",
    secondIntro: "The total before `right` includes the wanted range and everything before `left`. Subtracting the earlier total removes that extra prefix.",
    secondCode: `def range_sum(prefix, left, right):
    return prefix[right] - prefix[left]

values = [2, 5, -1, 4]
prefix = prefix_sums(values)
print(range_sum(prefix, 1, 4))
print(range_sum(prefix, 0, 2))`,
    secondTrace: "Range `[1,4)` contains `5,-1,4` and returns `10 - 2 = 8`. Range `[0,2)` returns `7 - 0 = 7`. Setup is Θ(n); every query is Θ(1).",
    mistake: "Do not mix inclusive and half-open boundaries mid-solution. Write the meaning of `prefix[i]` first. Most prefix-sum bugs are definition bugs, not arithmetic bugs.",
    checkpoint: "For values `[3,1,6]`, build the padded prefix array and compute the inclusive sum from index one through two.",
    checkpointAnswer: "The prefix array is `[0,3,4,10]`. Inclusive indices one through two become half-open `[1,3)`, so the sum is `prefix[3] - prefix[1] = 10 - 3 = 7`.",
    remember: "Define prefix values at boundaries. A range total is ending boundary minus starting boundary.",
    checks: [
      q("What does padded prefix[i] mean?", ["Sum of values before i", "Value at i only", "Sum after i"], 0, "It records a boundary total.", ["Correct. This definition supports half-open ranges.", "That is the original array.", "Later values are not included."]),
      q("What is the query cost after setup?", ["Θ(1)", "Θ(n)", "Θ(n²)"], 0, "One subtraction uses two stored totals.", ["Correct. Setup paid for the scan once.", "That is the cost without precomputation.", "No nested scan is needed."]),
    ],
  },
  {
    lessonId: "py.ac.m2_1.l6",
    atomId: "py.atom.algo.difference-arrays",
    conceptId: "py.algo.difference-arrays",
    title: "Difference arrays mark where changes begin and end",
    requires: ["py.algo.prefix-sums-guided"],
    vocabulary: [
      ["difference array", "boundary changes whose prefix sum reconstructs final values"],
      ["range update", "adding one amount to every position in an interval"],
      ["start marker", "a delta added where an update begins"],
      ["stop marker", "the opposite delta placed where an update stops affecting values"],
    ],
    opening: "Prefix sums make range queries cheap. Difference arrays turn the idea around: make range updates cheap, then perform one final prefix pass to reveal every value.",
    outcome: "You will be able to encode half-open range additions with two markers and reconstruct the final array without touching every updated position each time.",
    why: "When thousands of bookings, traffic changes, or coverage intervals update long spans, editing every cell repeats work. Two boundary markers summarize each update.",
    mentalModel: "A thermostat schedule says “increase by three here” and “decrease by three there.” Between those markers, the running temperature adjustment stays active automatically.",
    idea: [
      "Prefix sums answer repeated questions cheaply. Difference arrays are the mirror image: they apply repeated *changes* cheaply.",
      "The problem is a **range update**, adding some amount to every position in an interval. Done directly, one update costs the length of the interval, and many overlapping updates over a long array get expensive fast.",
      "The insight is to stop recording values and start recording changes. In a **difference array** each entry holds the change from the position before it. Most of the time that change is zero, because most of the array is flat.",
      "So a range update touches exactly two positions. Add the amount at the point where the interval begins, which is the **start marker**. Subtract the same amount just past where it ends, which is the **stop marker**. The addition switches the change on and the subtraction switches it off, leaving everything after the interval unaffected.",
      "Then, once every update has been recorded, take a prefix sum of the difference array and the finished values fall out. Running totals of the changes reconstruct the levels. So `m` updates on an array of length `n` cost `m` plus `n` in total, rather than `m` times the interval length.",
    ],
    firstTitle: "Apply several interval additions",
    firstIntro: "For update `[left,right)`, add the amount at `left` and subtract it at `right`. A padded delta array gives the stop marker a safe slot.",
    firstCode: `def apply_updates(length, updates):
    difference = [0] * (length + 1)
    for left, right, amount in updates:
        difference[left] += amount    # start marker: switch the change on
        difference[right] -= amount   # stop marker: switch it off again

    values = []
    running = 0
    for index in range(length):
        running += difference[index]   # prefix sum rebuilds the finished values
        values.append(running)
    return values

updates = [(1, 4, 3), (2, 5, 2)]
print(apply_updates(5, updates))`,
    firstTrace: "The first update adds three at one and removes three at four. The second adds two at two and removes two at five. The running totals become `[0,3,5,5,2]`.",
    secondTitle: "Find peak room usage from bookings",
    secondIntro: "Each booking adds one active room at its start time and removes one at its end time.",
    secondCode: `def peak_bookings(hours, bookings):
    difference = [0] * (hours + 1)
    for start, end in bookings:
        difference[start] += 1
        difference[end] -= 1

    active = 0
    peak = 0
    for hour in range(hours):
        active += difference[hour]
        peak = max(peak, active)
    return peak

print(peak_bookings(8, [(1, 4), (2, 6), (3, 5)]))`,
    secondTrace: "Active bookings rise at hours one, two, and three, reaching three. The booking ending at four stops before hour four because ranges are half-open. Peak usage is three rooms.",
    mistake: "Do not forget the stop marker. Without the negative amount at `right`, an update leaks through every later position.",
    checkpoint: "What two markers encode adding seven to inclusive indices two through five?",
    checkpointAnswer: "Convert the inclusive interval to half-open `[2,6)`. Add seven at difference index two and subtract seven at index six.",
    remember: "A difference array stores changes at boundaries. Prefix accumulation carries each change through exactly its intended range.",
    checks: [
      q("How many marker edits encode one range addition?", ["Two", "Every position in the range", "None"], 0, "One starts the effect and one stops it.", ["Correct. Reconstruction performs the later scan.", "That is the slow direct method.", "The update must be represented."]),
      q("What happens if the stop marker is missing?", ["The update affects all later positions", "The update disappears", "Only the right endpoint changes"], 0, "The running sum never cancels the amount.", ["Correct. The effect leaks to the end.", "The start marker still activates it.", "Every later running total includes it."]),
    ],
  },
  {
    lessonId: "py.ac.m2_1.l7",
    atomId: "py.atom.algo.prefix-sums-2d",
    conceptId: "py.algo.prefix-sums-2d",
    title: "Two-dimensional prefix sums with inclusion and exclusion",
    requires: ["py.algo.prefix-sums-guided", "py.algo.difference-arrays"],
    vocabulary: [
      ["submatrix", "a rectangular region inside a matrix"],
      ["2-D prefix sum", "the total inside the rectangle from the origin to a boundary pair"],
      ["inclusion-exclusion", "add broad regions, subtract unwanted overlap, and repair double subtraction"],
      ["padded border", "an extra zero row and column that remove top and left edge cases"],
    ],
    opening: "A 1-D prefix subtracts an unwanted left segment. A 2-D rectangle has unwanted top and left regions. Their overlap is removed twice, so add it once.",
    outcome: "You will be able to build a padded 2-D prefix table and answer any half-open rectangle sum with four table reads.",
    why: "This pattern appears in image regions, grid statistics, game boards, and matrix interview problems. The four-term formula becomes simple when every term is tied to a picture.",
    mentalModel: "Cover the target with one large origin sheet. Cut off its top and left strips. Their shared corner was cut twice, so tape it back once.",
    idea: [
      "The same idea works on a grid, and the only new part is bookkeeping. A **2-D prefix sum** stores, for each boundary pair, the total of the whole rectangle running from the origin down to that corner.",
      "Building it needs care, because the upper rectangle and the left rectangle overlap. Add them together and everything in the shared corner has been counted twice, so subtract that overlap once, then add the current cell. That add-add-subtract move is called **inclusion and exclusion**, and it is the entire technique.",
      "Reading a **submatrix** total uses the same idea in reverse. Start with the big rectangle from the origin to the far corner. It contains your target region plus an upper strip and a left strip. Subtract both strips.",
      "But those two strips overlap each other. They share the small rectangle in the top-left corner, so you have now removed that piece twice. Add it back once.",
      "That is four lookups in total: one big rectangle, two strips subtracted, one overlap restored.",
      "The payoff is the same as in one dimension. One setup pass over the grid buys you constant-time answers for any rectangle, however large, however many times you ask.",
    ],
    firstTitle: "Build a padded prefix table",
    firstIntro: "`prefix[r+1][c+1]` stores the rectangle from matrix origin through cell `(r,c)`. The zero border makes missing regions contribute zero.",
    firstCode: `def prefix_2d(matrix):
    rows = len(matrix)
    columns = len(matrix[0]) if rows else 0
    # one extra row and column of zeros, so the origin edges need no special case
    prefix = [[0] * (columns + 1) for _ in range(rows + 1)]

    for row in range(rows):
        for column in range(columns):
            prefix[row + 1][column + 1] = (
                matrix[row][column]
                + prefix[row][column + 1]
                + prefix[row + 1][column]
                - prefix[row][column]
            )
    return prefix

matrix = [[1, 2, 3], [4, 5, 6]]
print(prefix_2d(matrix))`,
    firstTrace: "Each cell adds its value, the top rectangle, and the left rectangle. The top-left overlap belongs to both accumulated rectangles, so subtract it once. The final boundary stores total twenty-one.",
    secondTitle: "Query one rectangle with four corners",
    secondIntro: "Use half-open rows `[top,bottom)` and columns `[left,right)`. Start with the broad bottom-right prefix and remove unwanted strips.",
    secondCode: `def rectangle_sum(prefix, top, left, bottom, right):
    return (
        prefix[bottom][right]
        - prefix[top][right]
        - prefix[bottom][left]
        + prefix[top][left]
    )

matrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
prefix = prefix_2d(matrix)
print(rectangle_sum(prefix, 1, 1, 3, 3))`,
    secondTrace: "The requested rectangle contains `5,6,8,9`, totaling twenty-eight. Subtract the top region and the left region. Add their shared top-left overlap back once. Query time is Θ(1) after Θ(rows times columns) setup.",
    mistake: "Do not memorize four signs without drawing the regions. A swapped boundary or inclusive endpoint can return a believable wrong number.",
    checkpoint: "In the query formula, why is `prefix[top][left]` added rather than subtracted?",
    checkpointAnswer: "That top-left region belongs to both unwanted strips. Subtracting the top strip and left strip removes it twice, so adding it once leaves it removed exactly once.",
    remember: "A 2-D range sum is big prefix minus top minus left plus their overlap. Padding makes every boundary follow the same rule.",
    checks: [
      q("How many prefix-table reads answer a rectangle sum?", ["Four", "Every cell in the rectangle", "One per row"], 0, "Inclusion-exclusion uses four corners.", ["Correct. Query time is constant.", "Setup prevents rescanning cells.", "No row loop is needed."]),
      q("Why add the top-left overlap?", ["It was subtracted twice", "It contains only zeros", "Matrices require positive values"], 0, "Inclusion-exclusion repairs double removal.", ["Correct. Add once to leave one subtraction.", "The overlap may contain any values.", "Negative matrix entries are valid."]),
    ],
  },
];

export const ALGO_LINEAR_STRUCTURE_ATOMS = SPECS.map(guidedMasteryAtom);
export const ALGO_LINEAR_STRUCTURE_CONCEPTS = SPECS.map(guidedMasteryConcept);
export const ALGO_LINEAR_STRUCTURE_LESSON_CONTENT = guidedLessonContent(SPECS);

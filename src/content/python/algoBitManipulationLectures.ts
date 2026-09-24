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

const ALGO_BIT_MANIPULATION_SPECS: GuidedMasterySpec[] = [
  {
    lessonId: "py.ac.m8_2.l1",
    atomId: "py.atom.algo.bitwise-operators",
    conceptId: "py.algo.bitwise-operators",
    title: "Four operations read and write single bits",
    requires: ["py.algo.expected-value"],
    vocabulary: [
      ["bit position", "which power of two a bit represents, counting from zero"],
      ["mask", "an integer whose set bits select the positions being acted on"],
      ["shift", "moving every bit left or right by a fixed number of places"],
      ["toggle", "flipping a bit to its opposite value"],
    ],
    opening: "An integer is a row of switches, and four operations cover everything you will ever need to do to them. Testing, setting, clearing and toggling are each one line, and every bit trick in the subject is built from those four.",
    outcome: "You will test, set, clear and toggle a bit at any position, and build masks that act on several positions at once.",
    why: "Bit operations appear in subset enumeration, state compression, permission flags and hash mixing. Getting the four primitives into muscle memory removes a whole class of hesitation.",
    mentalModel: "Picture a row of light switches numbered from the right. A mask is a stencil laid over them with holes cut where you intend to act, and each operation says what happens through the holes.",
    firstTitle: "Test, set, clear, toggle",
    firstIntro: "Each operation pairs one operator with a mask holding a single set bit.",
    firstCode: `flags = 0b1011

def show(value, width=4):
    return format(value, f"0{width}b")

print("start:      ", show(flags))
print("bit 1 set?  ", bool(flags >> 1 & 1))
print("bit 2 set?  ", bool(flags >> 2 & 1))
print("set bit 2:  ", show(flags | 1 << 2))
print("clear bit 0:", show(flags & ~(1 << 0)))
print("toggle bit 3:", show(flags ^ 1 << 3))
print("original:   ", show(flags))`,
    firstTrace: "Shifting one left by a position builds a mask with exactly that bit set. Or sets, and-not clears, and exclusive-or toggles, which is the whole vocabulary. None of these change the original value, because integers are immutable and each line produces a new one.",
    secondTitle: "Masks act on several positions at once",
    secondIntro: "A mask with several bits set applies the same operation to all of them in one step.",
    secondCode: `READ = 1 << 0
WRITE = 1 << 1
EXECUTE = 1 << 2

permissions = READ | WRITE
print("permissions:", format(permissions, "03b"))
print("can write?  ", bool(permissions & WRITE))
print("can execute?", bool(permissions & EXECUTE))

permissions |= EXECUTE
print("after granting execute:", format(permissions, "03b"))
permissions &= ~(READ | WRITE)
print("after revoking both:   ", format(permissions, "03b"))
print("all three:", format((1 << 3) - 1, "03b"))`,
    secondTrace: "Combining named constants with or builds a set, and testing with and asks whether any of them are present. Revoking two permissions takes one operation rather than two, because the mask names both. One shifted left by n, minus one, is the mask with the lowest n bits set, which is the standard way to write a full set.",
    mistake: "Do not test a bit with a plain comparison against one. The and of a value with a mask returns the mask's value rather than one, so the result is four when testing bit two, and comparing it to one silently reports false.",
    checkpoint: "How do you clear every bit except the lowest three?",
    checkpointAnswer: "And with the mask that has the lowest three bits set, which is one shifted left by three, minus one. That mask is seven, so the operation keeps exactly the bottom three positions and zeroes everything else.",
    remember: "Or sets, and tests, and-not clears, exclusive-or toggles. One shifted left by n makes a single-bit mask, and that minus one makes a mask of the lowest n bits.",
    checks: [
      q("Which operator clears a bit?", ["And with the complement of the mask", "Or with the mask", "Exclusive-or with the mask"], 0, "The complement has zero exactly where the mask has one.", ["Correct. And-not is the standard clearing idiom.", "Or can only set bits.", "Exclusive-or flips rather than clears."]),
      q("What does one shifted left by n, minus one, produce?", ["A mask with the lowest n bits set", "A mask with only bit n set", "The number n"], 0, "Subtracting one borrows across every lower position.", ["Correct. That is the standard full-set mask.", "That is the value before subtracting one.", "The value is two to the n minus one."]),
      q("Testing bit 2 with `value & 4 == 1` fails. Why?", ["The and returns 4, not 1", "The operator precedence is wrong", "Bit 2 does not exist"], 0, "The result carries the mask's value.", ["Correct. Compare against zero or cast to a boolean.", "Precedence is a separate hazard here.", "Bit 2 is perfectly valid."]),
    ],
  },
  {
    lessonId: "py.ac.m8_2.l2",
    atomId: "py.atom.algo.bit-tricks",
    conceptId: "py.algo.bit-tricks",
    title: "The tricks worth memorizing, and why they work",
    requires: ["py.algo.bitwise-operators"],
    vocabulary: [
      ["lowest set bit", "the value of the rightmost one in a number"],
      ["population count", "how many bits of a number are set"],
      ["power of two", "a number with exactly one bit set"],
      ["two's complement", "the representation where negating flips every bit and adds one"],
    ],
    opening: "Three identities come up constantly, and all three follow from one observation about what subtracting one does to a binary number. Learning why beats memorizing them.",
    outcome: "You will isolate the lowest set bit, clear it, count set bits in a loop proportional to their number, and test for a power of two.",
    why: "These appear in subset iteration, Fenwick trees and dozens of interview questions. They are also the clearest illustration of why two's complement is the representation everything uses.",
    mentalModel: "Picture subtracting one as borrowing. The borrow runs rightward until it meets the lowest one, flips it to zero, and sets every zero it passed.",
    firstTitle: "Subtracting one is what makes all three work",
    firstIntro: "Every identity here comes from what the borrow does to the bits under the lowest one.",
    firstCode: `def show(value, width=6):
    return format(value, f"0{width}b")

for value in (12, 10, 8, 7):
    print(f"{value:>3} = {show(value)}   "
          f"minus one = {show(value - 1)}   "
          f"and       = {show(value & (value - 1))}   "
          f"lowest    = {show(value & -value)}")`,
    firstTrace: "Anding with one less clears the lowest set bit and leaves everything else alone, because the borrow only touched that position and the ones under it. Anding with the negation isolates that same bit instead, since negation flips the higher positions and leaves the lowest one alone. Those two lines are the whole toolkit.",
    secondTitle: "Counting, and testing for a single bit",
    secondIntro: "Clearing the lowest set bit repeatedly counts the ones without visiting the zeros.",
    secondCode: `def popcount(value):
    count = 0
    while value:
        value &= value - 1
        count += 1
    return count

def is_power_of_two(value):
    return value > 0 and value & (value - 1) == 0

print("popcounts 0..8:", [popcount(n) for n in range(9)])
print("popcount of 2^40 - 1:", popcount((1 << 40) - 1))
print("powers of two:", [n for n in range(1, 33) if is_power_of_two(n)])
print("zero is not a power of two:", is_power_of_two(0))`,
    secondTrace: "The counting loop runs once per set bit rather than once per position, so a number with three ones costs three iterations however wide it is. A power of two has exactly one set bit, so clearing it leaves zero. Excluding zero explicitly is required, since zero has nothing left to clear either.",
    mistake: "Do not test for a power of two without excluding zero. Zero anded with negative one is zero, so the check passes, and the bug appears only when an empty or default value reaches the function.",
    checkpoint: "Why does anding a value with its own negation isolate the lowest set bit?",
    checkpointAnswer: "Because negation in two's complement flips every bit and adds one, which restores the lowest set bit and leaves everything above it inverted. Anding the original with that keeps only the position where both still agree, which is exactly that lowest bit.",
    remember: "Subtracting one clears the lowest set bit. And with one less to clear it, and with the negation to isolate it, and a power of two is whatever clears to zero.",
    checks: [
      q("What does `value & (value - 1)` do?", ["Clears the lowest set bit", "Isolates the lowest set bit", "Counts the set bits"], 0, "The borrow only affects that bit and below.", ["Correct. Repeating it counts the ones.", "That is and with the negation.", "Counting needs the loop around it."]),
      q("How many iterations does the popcount loop take?", ["One per set bit", "One per bit position", "One per byte"], 0, "Each iteration removes exactly one set bit.", ["Correct. Width does not affect it.", "That would be the naive shift-and-test loop.", "Bytes are not what it walks."]),
      q("Why must the power-of-two test exclude zero?", ["Zero also clears to zero, so it would pass", "Zero cannot be negated", "The shift would overflow"], 0, "Zero has no bits to clear.", ["Correct. The explicit check is required.", "Zero negates to zero perfectly well.", "No shift is involved in the test."]),
    ],
  },
  {
    lessonId: "py.ac.m8_2.l3",
    atomId: "py.atom.algo.subset-enumeration",
    conceptId: "py.algo.subset-enumeration",
    title: "Every subset is an integer",
    requires: ["py.algo.bit-tricks"],
    vocabulary: [
      ["subset mask", "an integer whose set bits name which elements are chosen"],
      ["submask", "a mask whose set bits are all present in another mask"],
      ["Gray code order", "an ordering where consecutive masks differ in exactly one bit"],
      ["enumeration", "visiting every subset exactly once"],
    ],
    opening: "Counting from zero to two to the n, minus one, visits every subset of an n-element set exactly once. That correspondence is what turns subset problems from recursion into a loop.",
    outcome: "You will enumerate all subsets by counting, list a mask's members, and walk every submask of a given mask.",
    why: "Bitmask dynamic programming, meet-in-the-middle and constraint search all rest on this. The submask loop in particular is the piece that people who have not seen it never invent on the spot.",
    mentalModel: "Picture a row of switches and a counter wired to them. Counting upward flips the switches through every possible configuration, and no configuration is repeated or missed.",
    firstTitle: "Counting is enumerating",
    firstIntro: "Bit position i being set means element i is in the subset.",
    firstCode: `items = ["a", "b", "c"]

for mask in range(1 << len(items)):
    chosen = [items[i] for i in range(len(items)) if mask >> i & 1]
    print(f"{mask:>2} = {format(mask, '03b')} -> {chosen}")`,
    firstTrace: "Eight masks cover the three-element set, from the empty selection at zero to everything at seven. The order is by the integer value, which is not by size, so a problem needing subsets grouped by size has to sort or count bits. Nothing is repeated, because distinct integers have distinct bit patterns.",
    secondTitle: "Walking the submasks of a mask",
    secondIntro: "Subtracting one and anding with the original steps to the next smaller submask.",
    secondCode: `mask = 0b1101
print("mask:", format(mask, "04b"))

sub = mask
while True:
    print("  submask:", format(sub, "04b"))
    if sub == 0:
        break
    sub = (sub - 1) & mask

total = 0
for outer in range(1 << 4):
    inner = outer
    while True:
        total += 1
        if inner == 0:
            break
        inner = (inner - 1) & outer
print("submask pairs over 4 elements:", total, "which is 3 to the 4th:", 3 ** 4)`,
    secondTrace: "Eight submasks come out of a mask with three set bits, which is two to the three as expected. The loop must break after processing zero rather than before, or the empty submask is skipped. Summing over every mask gives three to the n, because each element is either outside the mask, inside both, or inside only the outer one.",
    mistake: "Do not write the submask loop as a plain while on the submask being non-zero. That form never processes the empty submask, and the omission is invisible on any test where the empty case happens not to matter.",
    checkpoint: "Why does enumerating every submask of every mask cost three to the n rather than four to the n?",
    checkpointAnswer: "Because each element has three possibilities across a mask and submask pair, not four. It can be outside the mask entirely, inside the mask but outside the submask, or inside both. Being inside the submask but outside the mask is impossible by definition.",
    remember: "Counting from zero enumerates every subset. Subtract one and and with the mask to walk submasks, and break after processing zero rather than before.",
    checks: [
      q("What does counting from 0 to 2^n - 1 enumerate?", ["Every subset of an n-element set, exactly once", "Every permutation", "Every pair of elements"], 0, "Distinct integers have distinct bit patterns.", ["Correct. The bit at position i means element i is chosen.", "Permutations need a different enumeration.", "Pairs are a much smaller set."]),
      q("Why must the submask loop break after processing zero?", ["The empty submask would otherwise be skipped", "It would loop forever", "Zero is not a valid submask"], 0, "The condition is checked at the wrong point otherwise.", ["Correct. The omission is easy to miss in testing.", "A plain while terminates; it just misses one case.", "The empty set is a valid submask."]),
      q("What is the total cost of enumerating all submasks of all masks?", ["Three to the n", "Four to the n", "Two to the n"], 0, "Each element has three possible placements.", ["Correct. Outside, inside the mask only, or inside both.", "The fourth combination is impossible.", "That counts masks alone."]),
    ],
  },
  {
    lessonId: "py.ac.m8_2.l4",
    atomId: "py.atom.algo.xor-properties",
    conceptId: "py.algo.xor-properties",
    title: "Exclusive-or cancels, and that is the whole trick",
    requires: ["py.algo.subset-enumeration"],
    vocabulary: [
      ["self-inverse", "an operation that undoes itself when applied twice"],
      ["identity element", "the value that leaves any operand unchanged"],
      ["commutative", "giving the same result whatever the order of the operands"],
      ["partition by bit", "splitting values according to one bit's value"],
    ],
    opening: "Exclusive-or has three properties, and every puzzle built on it comes from combining them. A value cancels itself, zero changes nothing, and order does not matter, so an entire list collapses to whatever appeared an odd number of times.",
    outcome: "You will find a unique element among pairs, recover a missing value, and separate two unique elements by partitioning on one bit.",
    why: "These are among the most frequently asked interview questions that have a genuinely clever answer, and the reasoning transfers to checksums, parity and error detection.",
    mentalModel: "Picture pairs of identical tiles being placed on a table, each pair annihilating on contact. Whatever remains is what arrived without a partner, and the order they arrived in never mattered.",
    firstTitle: "Pairs cancel, whatever the order",
    firstIntro: "Three properties are enough to solve two classic problems immediately.",
    firstCode: `print("self-inverse:", 5 ^ 5)
print("identity:    ", 5 ^ 0)
print("commutative: ", 3 ^ 5 == 5 ^ 3)

def single_number(values):
    result = 0
    for value in values:
        result ^= value
    return result

def missing_number(values, n):
    result = 0
    for i in range(n + 1):
        result ^= i
    for value in values:
        result ^= value
    return result

print("single among pairs:", single_number([4, 1, 2, 1, 2]))
print("missing from 0..3: ", missing_number([0, 1, 3], 3))`,
    firstTrace: "Every paired value cancels itself out, so the running total ends holding only the unpaired one. The missing-number version pairs each present value against the full range, leaving the one that had no partner. Neither needs sorting, extra memory, or more than one pass.",
    secondTitle: "Two unique values need one more idea",
    secondIntro: "The combined result is the difference between them, and any bit it sets separates them.",
    secondCode: `def two_singles(values):
    combined = 0
    for value in values:
        combined ^= value
    lowest = combined & -combined
    first = second = 0
    for value in values:
        if value & lowest:
            first ^= value
        else:
            second ^= value
    return sorted((first, second))

print(two_singles([1, 2, 1, 3, 2, 5]))
print(two_singles([4, 4, 7, 9]))`,
    secondTrace: "The combined result cannot be zero, because the two unique values differ somewhere, and any set bit marks a position where they disagree. Splitting the list on that bit puts one unique value in each group, along with whole pairs that cancel. Each group then reduces to the single-value problem.",
    mistake: "Do not use exclusive-or when a value can appear three times rather than twice. Cancellation depends on even counts, so an odd repeat survives exactly as the genuine single would, and counting or a bitwise state machine is the correct tool instead.",
    checkpoint: "Why is the combined result guaranteed to be non-zero when exactly two values are unique?",
    checkpointAnswer: "Because every paired value cancels, leaving only the exclusive-or of the two unique ones. Two distinct integers differ in at least one bit position, so their combination has at least one bit set, and that bit is what separates them into groups.",
    remember: "A value cancels itself, zero is the identity, and order does not matter. Anything appearing an even number of times disappears, and any set bit of the result separates two unique values.",
    checks: [
      q("What survives when every value appears twice except one?", ["The unpaired value", "Zero", "The largest value"], 0, "Pairs cancel to zero.", ["Correct. One pass and no extra memory.", "That would need every value paired.", "Magnitude plays no part."]),
      q("Why does the two-unique-values method partition on a set bit?", ["The two values differ there, so each lands in a different group", "It sorts the values", "It counts the pairs"], 0, "Any set bit of the combination marks a disagreement.", ["Correct. Pairs cancel within whichever group they land in.", "No sorting is involved.", "Counting is not needed."]),
      q("When does the exclusive-or approach fail?", ["When a value can repeat an odd number of times", "When the values are large", "When the list is unsorted"], 0, "Cancellation depends on even counts.", ["Correct. A triple survives just as a single would.", "Magnitude is irrelevant.", "Order never matters."]),
    ],
  },
];

export const ALGO_BIT_MANIPULATION_ATOMS = ALGO_BIT_MANIPULATION_SPECS.map(guidedMasteryAtom);
export const ALGO_BIT_MANIPULATION_CONCEPTS = ALGO_BIT_MANIPULATION_SPECS.map(guidedMasteryConcept);
export const ALGO_BIT_MANIPULATION_LESSON_CONTENT = guidedLessonContent(ALGO_BIT_MANIPULATION_SPECS);

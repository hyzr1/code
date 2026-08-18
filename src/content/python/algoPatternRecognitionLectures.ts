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

const ALGO_PATTERN_RECOGNITION_SPECS: GuidedMasterySpec[] = [
  {
    lessonId: "py.ac.m10_1.l1",
    atomId: "py.atom.algo.problem-patterns",
    conceptId: "py.algo.problem-patterns",
    title: "The signals that name the technique",
    requires: ["py.algo.matrix-exponentiation"],
    vocabulary: [
      ["signal", "a phrase or constraint that points at a small set of techniques"],
      ["candidate set", "the handful of approaches a signal leaves open"],
      ["false signal", "a phrase that suggests a technique the problem does not want"],
      ["problem restatement", "saying the question back in your own words before choosing"],
    ],
    opening: "Interviewers rarely ask a problem you have seen. They routinely ask a problem whose shape you have seen, and the shape is announced by a small vocabulary of phrases in the statement itself.",
    outcome: "You will read a statement for its signals, produce a short candidate set, and recognize the phrases that mislead.",
    why: "The gap between a strong and a weak performance is usually the first three minutes. Naming the shape quickly leaves the rest of the time for the parts that actually need thought.",
    mentalModel: "Picture a doctor listening for a handful of specific symptoms before ordering any test. The symptoms do not give a diagnosis on their own; they narrow an enormous space to two or three possibilities.",
    firstTitle: "A short table covers most of what gets asked",
    firstIntro: "Each signal narrows the space to a few candidates rather than naming one answer.",
    firstCode: `SIGNALS = {
    "contiguous subarray": ["sliding window", "prefix sums", "Kadane"],
    "sorted input": ["two pointers", "binary search"],
    "kth largest": ["heap", "quickselect"],
    "count the ways": ["dynamic programming", "combinatorics"],
    "shortest path": ["breadth-first search", "Dijkstra"],
    "all combinations": ["backtracking"],
    "next greater": ["monotonic stack"],
    "at most k distinct": ["sliding window with counts"],
}

def candidates(statement):
    found = {}
    for signal, techniques in SIGNALS.items():
        if signal in statement:
            found[signal] = techniques
    return found

statement = "find the longest contiguous subarray with at most k distinct values"
for signal, techniques in candidates(statement).items():
    print(f"{signal:<22} -> {techniques}")`,
    firstTrace: "Two signals fire on that statement and both point at a sliding window, which is strong evidence. When several signals agree the choice is nearly made, and when they disagree the disagreement itself is informative. Nothing here is a substitute for understanding the problem; it is a way to reach the understanding faster.",
    secondTitle: "Some phrases point the wrong way",
    secondIntro: "A word that names a structure does not mean the structure is the answer.",
    secondCode: `TRAPS = [
    ("the word 'tree' in the statement",
     "the input may be a graph, or a tree may just be the framing"),
    ("'sorted output' required",
     "sorting the input is one option; a heap or counting may be cheaper"),
    ("'maximum' or 'minimum'",
     "greedy is tempting and often wrong; check the exchange argument"),
    ("'subsequence' rather than 'subarray'",
     "sliding windows do not apply; this is usually dynamic programming"),
    ("small constraints like n <= 20",
     "the size is the signal, not the wording: subsets or bitmask"),
]

for phrase, caution in TRAPS:
    print(f"{phrase}")
    print(f"    {caution}")`,
    secondTrace: "The difference between a subsequence and a subarray changes the technique completely, and the two words look alike in a hurried reading. A constraint of twenty is itself a signal, since it is far too small for anything polynomial to be the point. Reading the constraints before the prose catches several of these.",
    mistake: "Do not commit to the first technique a signal suggests. The signal narrows the space to a candidate set, and choosing among that set is a separate step that depends on the constraints, which the signal alone did not consider.",
    checkpoint: "A statement says subsequence rather than subarray. What changes?",
    checkpointAnswer: "Sliding windows and two-pointer methods stop applying, because the elements need not be adjacent and no window can represent an arbitrary selection. The problem is almost always dynamic programming instead, with a state naming how much of the input has been consumed.",
    remember: "Read for signals, produce a candidate set, then choose using the constraints. Subsequence is not subarray, and a small bound is itself a signal.",
    checks: [
      q("What does a signal in a problem statement give you?", ["A short candidate set, not an answer", "The exact technique to use", "The time complexity"], 0, "Choosing among the candidates is a separate step.", ["Correct. The constraints decide between them.", "Signals narrow rather than decide.", "Complexity follows from the choice."]),
      q("A statement says 'subsequence' rather than 'subarray'. What is ruled out?", ["Sliding windows and two-pointer scans", "Dynamic programming", "Sorting"], 0, "Elements need not be adjacent.", ["Correct. Dynamic programming is the usual answer.", "That is what becomes likely.", "Sorting may still be relevant."]),
      q("The constraint is n at most 20. What does that suggest?", ["An exponential method such as subsets or bitmasks is intended", "The problem is trivial", "A linear scan suffices"], 0, "Twenty is far too small for polynomial cost to matter.", ["Correct. The bound is the signal.", "Small bounds usually mean hard problems.", "Linear would work for a million."]),
    ],
  },
  {
    lessonId: "py.ac.m10_1.l2",
    atomId: "py.atom.algo.choosing-approaches",
    conceptId: "py.algo.choosing-approaches",
    title: "Breaking a tie between two workable approaches",
    requires: ["py.algo.problem-patterns"],
    vocabulary: [
      ["implementation risk", "how likely you are to get an approach wrong under time pressure"],
      ["binding constraint", "the input limit that actually rules an approach in or out"],
      ["invariant", "a property the algorithm maintains, which makes it arguable"],
      ["good enough", "an approach that fits the constraints without being optimal"],
    ],
    opening: "Two approaches often both work, and choosing between them on elegance is a mistake. The constraints rule some out, and among the survivors the one you can write correctly in the time available is the right answer.",
    outcome: "You will eliminate approaches on constraints, then rank the survivors by implementation risk rather than by theoretical cost.",
    why: "A correct quadratic solution beats a broken linear one every time, and interviewers say so explicitly. Knowing when the faster approach is not worth its risk is a judgement worth practising.",
    mentalModel: "Picture two routes to the same place, one shorter and one you have driven before. When both arrive in time, the familiar one is the better choice, and only a deadline makes the shortcut worth its risk.",
    firstTitle: "Eliminate on constraints first",
    firstIntro: "The input bound decides which approaches are even in the conversation.",
    firstCode: `import math

BUDGET = 100_000_000

def operations(n, growth):
    if growth == "n":
        return n
    if growth == "n log n":
        return n * max(1.0, math.log2(n))
    if growth == "n^2":
        return n * n
    if growth == "2^n":
        return 2 ** min(n, 60)
    raise ValueError("unknown growth")

for n in (20, 1_000, 100_000, 1_000_000):
    row = []
    for growth in ("n", "n log n", "n^2", "2^n"):
        count = operations(n, growth)
        row.append(f"{growth}:{'ok ' if count <= BUDGET else 'no '}")
    print(f"n = {n:>9}   " + "  ".join(row))`,
    firstTrace: "A bound of a million rules out anything quadratic before a single line is written. A bound of twenty rules in the exponential approaches and often rules out nothing else, which is why such a small bound is so informative. The budget is a rough figure, and being within an order of magnitude of it is what matters.",
    secondTitle: "Rank the survivors by risk, not by elegance",
    secondIntro: "Among approaches that fit, the deciding factor is what you can write correctly.",
    secondCode: `APPROACHES = [
    ("sort then two pointers", "n log n", "low", "one loop, easy to argue"),
    ("hash map in one pass", "n", "low", "watch the order of insert and lookup"),
    ("sliding window", "n", "medium", "shrink condition is easy to get wrong"),
    ("segment tree", "n log n", "high", "long to write, easy to misindex"),
]

print(f"{'approach':<24}{'cost':<10}{'risk':<9}note")
for name, cost, risk, note in APPROACHES:
    print(f"{name:<24}{cost:<10}{risk:<9}{note}")

print()
print("with n = 100000 all four fit; pick the lowest risk that fits")`,
    secondTrace: "All four approaches meet the constraint, so the cost column stops being a tiebreaker. The hash map is linear and low risk, which makes it the obvious choice, and the segment tree is a worse answer despite being a more impressive one. Saying that reasoning out loud is worth as much as the choice itself.",
    mistake: "Do not reach for the asymptotically best approach when a simpler one fits the constraints. Interviewers are watching whether you can judge that, and a half-finished optimal solution scores worse than a complete adequate one.",
    checkpoint: "Two approaches both fit the constraints, one linear and one linearithmic. How do you choose?",
    checkpointAnswer: "By implementation risk, since the cost difference does not matter once both fit. Whichever you can write correctly and defend in the time available is the better answer, and saying that reasoning aloud shows judgement rather than ignorance.",
    remember: "Eliminate on constraints, then rank what survives by implementation risk. A complete adequate solution beats an incomplete optimal one.",
    checks: [
      q("What eliminates an approach first?", ["The input constraint", "Its elegance", "Its memory use"], 0, "A bound of a million rules out quadratic immediately.", ["Correct. Cost only matters until it fits.", "Elegance is not a criterion.", "Memory matters, but usually second."]),
      q("Two approaches both fit the constraints. What decides?", ["Which one you can write correctly under pressure", "Which is asymptotically faster", "Which uses less memory"], 0, "The cost difference stops mattering once both fit.", ["Correct. Say that reasoning out loud.", "That is no longer the binding question.", "Only if memory is the binding constraint."]),
      q("A bound of n at most 20 rules in what?", ["Exponential approaches such as subsets or bitmasks", "Only linear approaches", "Nothing in particular"], 0, "That bound is far too small for polynomial cost to matter.", ["Correct. The bound is the signal.", "Linear would be a strange thing to ask for.", "Small bounds are highly informative."]),
    ],
  },
  {
    lessonId: "py.ac.m10_1.l3",
    atomId: "py.atom.algo.cost-estimation",
    conceptId: "py.algo.cost-estimation",
    title: "Estimate the cost before writing the code",
    requires: ["py.algo.choosing-approaches"],
    vocabulary: [
      ["operation budget", "roughly how many basic steps fit in the time allowed"],
      ["order of magnitude", "the power of ten a quantity sits at"],
      ["memory budget", "how many values fit in the space allowed"],
      ["hidden constant", "work per step that the growth notation does not show"],
    ],
    opening: "A five-second estimate prevents a twenty-minute mistake. Multiplying the input bound by the approach's growth gives a number, and comparing that number against a budget answers whether to proceed.",
    outcome: "You will estimate operation counts and memory from the constraints, and spot the hidden constants that growth notation hides.",
    why: "Writing an approach that cannot possibly finish is the most expensive error available, and it is entirely avoidable by arithmetic you can do in your head.",
    mentalModel: "Picture checking whether a journey fits in the afternoon before setting off. Distance divided by speed takes seconds, and it saves you finding out halfway.",
    firstTitle: "One multiplication answers the question",
    firstIntro: "The bound times the growth, compared against a budget of roughly a hundred million.",
    firstCode: `import math

def estimate(n, growth):
    counts = {
        "log n": math.log2(max(n, 2)),
        "n": float(n),
        "n log n": n * math.log2(max(n, 2)),
        "n sqrt n": n * math.sqrt(n),
        "n^2": float(n) ** 2,
        "n^3": float(n) ** 3,
    }
    return counts[growth]

BUDGET = 1e8
for n in (1_000, 100_000, 1_000_000):
    print(f"n = {n:>9}")
    for growth in ("n", "n log n", "n sqrt n", "n^2"):
        count = estimate(n, growth)
        verdict = "fits" if count <= BUDGET else "too slow"
        print(f"    {growth:<10} {count:>12.3e}  {verdict}")`,
    firstTrace: "A hundred thousand squared is ten billion, which is a hundred times over the budget and therefore hopeless. The same bound linearithmic is under two million, which is comfortable. Nothing here needs precision, because the answers are usually several orders of magnitude apart.",
    secondTitle: "Memory, and the constants growth notation hides",
    secondIntro: "The count of values matters, and so does what each one costs to store and touch.",
    secondCode: `def memory_estimate(count, bytes_each):
    return count * bytes_each / 1e6

print("array of ints:")
for count in (1_000_000, 10_000_000, 100_000_000):
    print(f"    {count:>12,} values -> {memory_estimate(count, 8):>8.1f} MB")

print()
print("the same counts as Python objects in a list:")
for count in (1_000_000, 10_000_000):
    print(f"    {count:>12,} values -> {memory_estimate(count, 60):>8.1f} MB")

print()
print("a hash lookup is constant time and far from free")
print("nested dictionaries multiply that constant at every level")`,
    secondTrace: "A hundred million machine integers is under a gigabyte and the same count as interpreted objects is not. Growth notation says both are linear, and only one of them runs. Constants like these are why a linearithmic approach in a fast language routinely beats a linear one in a slow one.",
    mistake: "Do not treat constant-time operations as free. A hash lookup costs perhaps fifty times what an array index costs, so an inner loop doing several of them can miss a budget that the growth notation said it would meet comfortably.",
    checkpoint: "The bound is 200,000 and your approach is quadratic. What is the estimate?",
    checkpointAnswer: "Four times ten to the tenth, which is roughly four hundred times any reasonable budget. That is not a borderline case to be optimized later; it rules the approach out entirely, and the right response is to find a different one before writing anything.",
    remember: "Multiply the bound by the growth and compare against roughly a hundred million. Then check the memory, and remember that constant-time is not the same as free.",
    checks: [
      q("Roughly what operation budget fits in a typical time limit?", ["About a hundred million", "About a thousand", "About a trillion"], 0, "The figure is rough and usually enough.", ["Correct. Answers are normally orders of magnitude apart.", "That would be a very small budget.", "No ordinary limit allows that."]),
      q("n is 200,000 and the approach is quadratic. What follows?", ["It is ruled out; the estimate is hundreds of times over budget", "It is borderline and worth trying", "It depends on the language"], 0, "Four times ten to the tenth is not marginal.", ["Correct. Find a different approach first.", "Two orders of magnitude is not borderline.", "No language closes that gap."]),
      q("What does growth notation hide?", ["The constant work each step actually costs", "The input size", "The memory used"], 0, "A hash lookup and an array index are both constant.", ["Correct. One is far more expensive than the other.", "The bound is given.", "Memory is estimated separately but is not hidden."]),
    ],
  },
];

export const ALGO_PATTERN_RECOGNITION_ATOMS = ALGO_PATTERN_RECOGNITION_SPECS.map(guidedMasteryAtom);
export const ALGO_PATTERN_RECOGNITION_CONCEPTS = ALGO_PATTERN_RECOGNITION_SPECS.map(guidedMasteryConcept);
export const ALGO_PATTERN_RECOGNITION_LESSON_CONTENT = guidedLessonContent(ALGO_PATTERN_RECOGNITION_SPECS);

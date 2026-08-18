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

const ALGO_COMMUNICATION_SPECS: GuidedMasterySpec[] = [
  {
    lessonId: "py.ac.m10_3.l1",
    atomId: "py.atom.algo.narrating-tradeoffs",
    conceptId: "py.algo.narrating-tradeoffs",
    title: "Say the alternative you rejected, and why",
    requires: ["py.algo.recovering-when-stuck"],
    vocabulary: [
      ["stated assumption", "a condition you named rather than silently relied on"],
      ["rejected alternative", "an approach you considered and set aside for a reason"],
      ["evidence", "the constraint or example that decided between two options"],
      ["silent choice", "a decision the interviewer cannot tell you made deliberately"],
    ],
    opening: "An interviewer cannot distinguish a deliberate choice from a lucky one unless you say what else you considered. Naming the alternative and the reason converts the same code into visible judgement.",
    outcome: "You will state a decision as an alternative, a reason and an assumption, and recognize which choices are worth narrating.",
    why: "Two candidates producing identical code are scored differently on exactly this. It is also the cheapest improvement available, since it costs one sentence per decision.",
    mentalModel: "Picture showing your working on an exam. The answer alone earns the mark only if it is right, and the working earns credit for the reasoning even when the arithmetic slips.",
    firstTitle: "Three parts to a narrated decision",
    firstIntro: "The chosen option alone says nothing; the comparison is what carries the information.",
    firstCode: `def narrate(chosen, rejected, reason, assumption):
    return (f"I'll use {chosen} rather than {rejected}, "
            f"because {reason}. "
            f"I'm assuming {assumption}.")

decisions = [
    ("a hash map", "sorting", "we only need membership, not order",
     "the keys are hashable"),
    ("two pointers", "a hash set", "the input is already sorted, so it costs no extra space",
     "the sortedness is guaranteed rather than incidental"),
    ("a heap", "a full sort", "we need the top k, not the whole ordering",
     "k is much smaller than n"),
]

for chosen, rejected, reason, assumption in decisions:
    print(narrate(chosen, rejected, reason, assumption))
    print()`,
    firstTrace: "Each sentence names what was not chosen, which is the part that demonstrates the decision was made rather than defaulted to. The assumption is the second half, because it invites correction early rather than after the code is written. Both fit in one sentence spoken while typing.",
    secondTitle: "Not every choice is worth a sentence",
    secondIntro: "Narrating everything is as uninformative as narrating nothing.",
    secondCode: `CHOICES = [
    ("which data structure to reach for", True,
     "the alternatives have different costs and the reason is real"),
    ("whether to sort the input", True,
     "it changes the complexity and may be forbidden"),
    ("what to call a loop variable", False,
     "no alternative was meaningfully considered"),
    ("using a for loop rather than a while", False,
     "an ordinary idiom, not a decision"),
    ("how to handle an empty input", True,
     "it is a specification question the interviewer may have an opinion on"),
]

print(f"{'choice':<38}{'narrate?':>10}")
for choice, worth, reason in CHOICES:
    print(f"{choice:<38}{'yes' if worth else 'no':>10}   {reason}")`,
    secondTrace: "A decision is worth narrating when a real alternative existed and the reason for rejecting it is specific. Loop syntax and variable names fail that test, and narrating them buries the decisions that matter. The empty-input case makes the list because it is a question about the specification rather than the implementation.",
    mistake: "Do not narrate your typing. Reading the code aloud as you write it produces constant noise with no reasoning in it, and the genuine decisions become impossible to pick out from the commentary around them.",
    checkpoint: "You chose a hash map without saying why. What did the interviewer learn?",
    checkpointAnswer: "Only that your code uses a hash map. They cannot tell whether you weighed it against sorting, whether you noticed the keys must be hashable, or whether it was simply the first structure that came to mind. One sentence would have distinguished all three.",
    remember: "Name the alternative, the reason and the assumption. Narrate decisions where a real alternative existed, and stay quiet about syntax and naming.",
    checks: [
      q("What makes a narrated decision informative?", ["Naming the alternative you rejected and why", "Describing the code as you type it", "Stating the complexity"], 0, "The comparison carries the information.", ["Correct. The chosen option alone says nothing.", "That is narration without reasoning.", "Complexity is useful but is not the decision."]),
      q("Which choice is not worth narrating?", ["The name of a loop variable", "Whether to sort the input", "How to handle empty input"], 0, "No real alternative was considered.", ["Correct. Narrating it buries what matters.", "Sorting changes the complexity.", "That is a specification question."]),
      q("Why state your assumptions aloud?", ["It invites correction before the code is written", "It fills silence", "It shows humility"], 0, "A wrong assumption is cheapest to fix early.", ["Correct. The interviewer will often correct it immediately.", "Filling silence is not the purpose.", "The value is practical rather than social."]),
    ],
  },
  {
    lessonId: "py.ac.m10_3.l2",
    atomId: "py.atom.algo.follow-ups",
    conceptId: "py.algo.follow-ups",
    title: "The follow-up is the real question",
    requires: ["py.algo.narrating-tradeoffs"],
    vocabulary: [
      ["relaxed constraint", "a limit the follow-up removes or loosens"],
      ["tightened constraint", "a limit the follow-up adds"],
      ["structural change", "a follow-up that invalidates the approach rather than adjusting it"],
      ["incremental change", "a follow-up your existing structure already accommodates"],
    ],
    opening: "The first question is often a warm-up, and the follow-up is what is being assessed. Most follow-ups fall into a few recognizable kinds, and knowing which kind you are facing tells you whether to adapt or to start again.",
    outcome: "You will classify a follow-up as incremental or structural, and say which part of your solution it invalidates.",
    why: "Trying to patch a solution through a structural change wastes the remaining time, and rewriting for an incremental one wastes it equally. Naming the kind first is what avoids both.",
    mentalModel: "Picture being asked to extend a house. Adding a room to the plan is one thing, and being told the ground is now sloped is another, and mistaking the second for the first produces something that falls down.",
    firstTitle: "A short taxonomy of what gets asked next",
    firstIntro: "Each kind has a characteristic effect on whichever approach you already have.",
    firstCode: `FOLLOW_UPS = [
    ("what if the input does not fit in memory", "structural",
     "any approach holding everything at once is invalidated"),
    ("what if it must handle duplicates", "incremental",
     "usually a counting change rather than a different structure"),
    ("what if the queries arrive one at a time", "structural",
     "offline methods stop applying entirely"),
    ("what if we need the actual items, not the count", "incremental",
     "add a record of choices alongside the values"),
    ("what if the values can be negative", "depends",
     "harmless for sums, fatal for a greedy or a sliding window"),
    ("what if it must be thread-safe", "structural",
     "a different question about the component, not the algorithm"),
]

print(f"{'follow-up':<44}{'kind':<14}effect")
for question, kind, effect in FOLLOW_UPS:
    print(f"{question:<44}{kind:<14}{effect}")`,
    firstTrace: "Duplicates and reconstruction are usually adjustments to what you already have. Streaming and online queries remove an assumption the whole approach rested on. Negative values are the interesting case, since whether they matter depends entirely on which approach you chose.",
    secondTitle: "Say which assumption the follow-up broke",
    secondIntro: "Naming the broken assumption is faster than rederiving from scratch.",
    secondCode: `APPROACHES = {
    "sliding window": ["values are non-negative", "the window can shrink"],
    "greedy": ["local choices compose into a global optimum"],
    "sorting first": ["the whole input fits in memory", "reordering is permitted"],
    "hash map": ["keys are hashable", "the whole map fits in memory"],
    "two pointers": ["the input is sorted"],
}

def broken_by(change):
    return {name: [a for a in assumptions if change in a]
            for name, assumptions in APPROACHES.items()
            if any(change in a for a in assumptions)}

for change in ("memory", "sorted", "non-negative"):
    print(f"a follow-up about {change!r} breaks:")
    for name, assumptions in broken_by(change).items():
        print(f"    {name}: {assumptions}")
    print()`,
    secondTrace: "Listing the assumptions each approach rests on turns a follow-up into a lookup. A memory constraint invalidates sorting and hashing at once, and a question about ordering only touches the two-pointer method. Saying which assumption broke is both faster and more convincing than starting the derivation again.",
    mistake: "Do not begin coding a follow-up before saying which kind it is. An incremental change patched into the wrong place and a structural change patched at all both produce the same outcome, which is running out of time with something half-modified.",
    checkpoint: "The follow-up says the input arrives as a stream. What does that break?",
    checkpointAnswer: "Every approach that assumed the whole input was available at once, which includes sorting, most hash-based counting and any offline method. It is a structural change, so the right response is to say so and derive a streaming approach rather than to patch the existing one.",
    remember: "Classify the follow-up before touching the code. Incremental changes adapt what you have; structural ones invalidate an assumption and need a fresh derivation.",
    checks: [
      q("What makes a follow-up structural rather than incremental?", ["It invalidates an assumption the approach rested on", "It asks for more code", "It changes the input size"], 0, "Patching cannot recover from it.", ["Correct. A fresh derivation is the right response.", "Volume of code is not the distinction.", "Size alone is often incremental."]),
      q("A follow-up asks about negative values. What decides whether it matters?", ["Which approach you chose", "The input size", "The output format"], 0, "It is harmless for sums and fatal for sliding windows.", ["Correct. The assumption list tells you immediately.", "Size is unrelated.", "The output is unaffected."]),
      q("Why classify the follow-up before coding?", ["Patching a structural change wastes the remaining time", "It shows preparation", "Interviewers expect it"], 0, "The two kinds need different responses.", ["Correct. Rewriting for an incremental one wastes it equally.", "The reason is practical.", "The benefit is to you, not to them."]),
    ],
  },
  {
    lessonId: "py.ac.m10_3.l3",
    atomId: "py.atom.algo.coding-adjacent-design",
    conceptId: "py.algo.coding-adjacent-design",
    title: "Turning an algorithm into a component",
    requires: ["py.algo.follow-ups"],
    vocabulary: [
      ["interface", "the operations a component promises, independent of how it works"],
      ["invariant", "a property the component maintains between calls"],
      ["failure mode", "how the component behaves when its assumptions are violated"],
      ["capacity", "the limit past which the component's guarantees stop holding"],
    ],
    opening: "A function that computes an answer and a component other people depend on are different artefacts. The step between them is naming what the component promises, and that conversation is what these interviews are sampling.",
    outcome: "You will define an interface with its invariants and failure modes, and state the capacity at which it stops working.",
    why: "This is the question that follows a clean algorithm at a more senior level, and answering it in terms of promises rather than implementation is what distinguishes the two.",
    mentalModel: "Picture the difference between a recipe and a restaurant. The recipe produces a dish, and the restaurant has to say when it opens, what happens if an ingredient runs out, and how many people it can serve at once.",
    firstTitle: "The interface is a set of promises",
    firstIntro: "Each operation states its cost and what it guarantees, not how it works.",
    firstCode: `INTERFACE = [
    ("add(item)", "amortized constant", "the item is present afterwards"),
    ("contains(item)", "expected constant", "no state changes"),
    ("top(k)", "k log n", "the k largest, in descending order"),
    ("remove(item)", "expected constant", "absent afterwards, and idempotent"),
]

print(f"{'operation':<16}{'cost':<22}guarantee")
for operation, cost, guarantee in INTERFACE:
    print(f"{operation:<16}{cost:<22}{guarantee}")

print()
print("nothing here says which structure is inside")
print("that is what makes it an interface rather than a description")`,
    firstTrace: "Each line names an operation, its cost and what a caller may rely on afterwards. None of them mention a heap or a hash map, which is what leaves the implementation free to change. Stating that removal is idempotent is the kind of detail callers depend on and implementations forget.",
    secondTitle: "Say what happens when the assumptions break",
    secondIntro: "A component that does not define its failure modes has defined them by accident.",
    secondCode: `FAILURES = [
    ("an item that is not hashable", "raises immediately",
     "better than silently degrading to a scan"),
    ("k larger than the item count", "returns everything, in order",
     "clamping is friendlier than raising here"),
    ("removing an absent item", "no effect, no error",
     "idempotent removal is what callers assume"),
    ("more items than memory allows", "raises before accepting the item",
     "failing at the boundary beats failing mid-operation"),
    ("concurrent access", "undefined unless documented otherwise",
     "say so rather than leaving it to be discovered"),
]

for situation, behaviour, reasoning in FAILURES:
    print(f"{situation}")
    print(f"    -> {behaviour}")
    print(f"       {reasoning}")`,
    secondTrace: "Each of these is a decision, and the reasoning column is what makes it a decision rather than an accident. Clamping is the right answer in one row and raising in another, and the difference is which one the caller can act on. Saying concurrency is undefined is itself a specification, and a better one than silence.",
    mistake: "Do not describe a component by its internals when asked for its interface. What structure is inside is the part you are free to change later, and leading with it invites questions about the implementation rather than about the promises.",
    checkpoint: "What separates an interface from a description of the implementation?",
    checkpointAnswer: "An interface states what callers may rely on without saying how it is achieved, so the implementation stays free to change. A description names the structures inside, which fixes them in place and answers a question about your code rather than about the component other people will depend on.",
    remember: "State the operations, their costs, their guarantees, and what happens when the assumptions break. Say nothing about the structures inside, which is what keeps them replaceable.",
    checks: [
      q("What belongs in an interface?", ["Operations, costs and guarantees", "The structures used internally", "The algorithm's derivation"], 0, "Internals are what stay free to change.", ["Correct. Callers depend on the promises.", "Naming them fixes them in place.", "The derivation is a separate discussion."]),
      q("Why define failure modes explicitly?", ["Undefined behaviour gets defined by accident instead", "It reduces the code size", "It is required by convention"], 0, "Callers will discover whatever happens.", ["Correct. Saying concurrency is undefined is itself a specification.", "It adds code, not removes it.", "The reason is practical."]),
      q("Why is idempotent removal worth stating?", ["Callers assume it, and implementations forget it", "It is faster", "It saves memory"], 0, "The mismatch surfaces as a bug in someone else's code.", ["Correct. It is exactly the kind of promise to write down.", "The cost is the same.", "Memory is unaffected."]),
    ],
  },
  {
    lessonId: "py.ac.m10_3.l4",
    atomId: "py.atom.algo.company-families",
    conceptId: "py.algo.company-families",
    title: "Calibrating to what is actually being assessed",
    requires: ["py.algo.coding-adjacent-design"],
    vocabulary: [
      ["assessment target", "the specific quality an interview format is designed to measure"],
      ["depth over speed", "spending the time on one problem thoroughly"],
      ["speed over depth", "covering several problems at a shallower level"],
      ["signal mismatch", "optimizing for a quality the format is not measuring"],
    ],
    opening: "The same problem is scored differently depending on who is asking. Some formats reward the fastest correct answer, some reward the most careful derivation, and behaving as though every format wanted the same thing is a reliable way to underperform.",
    outcome: "You will match a format to what it is measuring, and adjust how you spend the time accordingly.",
    why: "Preparation that ignores the format optimizes for an average nobody actually runs. Recognizing the format in the first minute is worth more than any additional practice problem.",
    mentalModel: "Picture the same essay submitted to a newspaper, a journal and an exam board. Nothing about the writing is wrong in any of them, and each would want a different balance of length, evidence and directness.",
    firstTitle: "Three families, three different targets",
    firstIntro: "What each is measuring decides how the time should be spent.",
    firstCode: `FAMILIES = {
    "large product company": {
        "measures": "breadth and a clean, communicated solution",
        "spend": "derive aloud, code cleanly, test visibly",
        "avoid": "silent brilliance and untested code",
    },
    "quantitative firm": {
        "measures": "precision, and depth on a narrow problem",
        "spend": "get the reasoning exactly right before coding anything",
        "avoid": "hand-waving a step you have not verified",
    },
    "early-stage startup": {
        "measures": "whether you can build something that works today",
        "spend": "get to something running, then improve it",
        "avoid": "optimizing before anything works end to end",
    },
}

for family, facts in FAMILIES.items():
    print(family)
    for key, value in facts.items():
        print(f"    {key:<10} {value}")
    print()`,
    firstTrace: "The same candidate would be scored differently in each of these without changing anything about their ability. The quantitative format punishes an unverified step that the startup format would not notice, and the startup format punishes an unfinished elegant solution that the quantitative one might reward. Nothing here is about difficulty.",
    secondTitle: "Reading the format from what happens in the first minute",
    secondIntro: "The signals are usually visible before the problem is fully stated.",
    secondCode: `SIGNALS = [
    ("several short problems listed up front", "speed is being measured"),
    ("one problem with unusual constraints", "depth is being measured"),
    ("a problem drawn from their actual product", "practicality is being measured"),
    ("the interviewer says 'take your time'", "they mean it; depth over speed"),
    ("a shared editor with tests already written", "they want it running"),
    ("no editor at all, just discussion", "the code is not the artefact being judged"),
]

for signal, reading in SIGNALS:
    print(f"{signal:<44} -> {reading}")

print()
print("asking which they would prefer is always a legitimate question")`,
    secondTrace: "Most of these are visible before the problem has been fully stated, which is early enough to act on. When they are ambiguous, asking directly whether they would rather see the fastest working version or the most careful one is a reasonable question and is usually answered honestly. Guessing silently is the only option with no upside.",
    mistake: "Do not bring the same strategy to every format. Optimizing for speed in a format measuring rigour reads as carelessness, and optimizing for rigour where speed is measured reads as being unable to finish, and both are avoidable by asking one question.",
    checkpoint: "A firm gives you one problem with unusual constraints and says to take your time. What are they measuring?",
    checkpointAnswer: "Depth and precision rather than speed. The unusual constraints are there to make the standard approach inapplicable, and the invitation to take time is genuine. Rushing to code in that format loses exactly the signal they were trying to collect.",
    remember: "Formats measure different things, and the signals are visible early. When it is ambiguous, ask whether they would rather see the fastest working version or the most careful one.",
    checks: [
      q("What does one problem with unusual constraints usually signal?", ["Depth and precision are being measured", "Speed is being measured", "Breadth is being measured"], 0, "The constraints make the standard approach inapplicable.", ["Correct. Rushing loses the signal they wanted.", "Speed formats list several problems.", "Breadth needs more than one problem."]),
      q("What is the cost of a strategy mismatch?", ["Rigour reads as slowness, and speed reads as carelessness", "The problem becomes harder", "The interview ends early"], 0, "The same ability is scored differently.", ["Correct. One question usually resolves it.", "The problem is unchanged.", "The format runs its full length."]),
      q("What should you do when the format is ambiguous?", ["Ask which they would rather see", "Assume speed", "Assume depth"], 0, "It is a legitimate question, usually answered honestly.", ["Correct. Guessing silently has no upside.", "Guessing either way risks the mismatch.", "The same risk applies."]),
    ],
  },
  {
    lessonId: "py.ac.m10_3.l5",
    atomId: "py.atom.algo.practice-loop",
    conceptId: "py.algo.practice-loop",
    title: "Turn failures into the next week's practice",
    requires: ["py.algo.company-families"],
    vocabulary: [
      ["failure category", "the specific stage at which an attempt broke down"],
      ["targeted practice", "work aimed at one category rather than at more problems"],
      ["spaced repetition", "revisiting a topic at increasing intervals"],
      ["diminishing return", "the point where more of the same practice stops helping"],
    ],
    opening: "Solving another hundred problems is the default plan and rarely the best one. Recording where each attempt actually broke down turns practice from volume into something aimed at the specific stage that is failing.",
    outcome: "You will categorize a failed attempt by its stage, and build a practice plan from the distribution rather than from a topic list.",
    why: "The stage that fails is often not the one people assume. Someone convinced they need more algorithms practice is frequently losing on testing or on communication, which more algorithms will never fix.",
    mentalModel: "Picture a runner who keeps losing races and responds by running more miles. If the losses are all in the final sprint, the miles are the wrong training, however diligently they are run.",
    firstTitle: "Categorize by where it broke, not by topic",
    firstIntro: "The stage that failed is more actionable than the subject the problem came from.",
    firstCode: `ATTEMPTS = [
    ("two sum variant", "misread the question", "clarify"),
    ("interval merging", "chose a quadratic approach", "derive"),
    ("binary search bounds", "off by one in the loop", "code"),
    ("graph traversal", "did not test the empty case", "test"),
    ("sliding window", "knew it but could not explain why", "communicate"),
    ("heap problem", "chose a quadratic approach", "derive"),
    ("string parsing", "off by one in the loop", "code"),
]

from collections import Counter
stages = Counter(stage for _, _, stage in ATTEMPTS)
for stage, count in stages.most_common():
    bar = "#" * count
    print(f"{stage:<13}{count:>3}  {bar}")

print()
print("the topic column is nearly useless; the stage column is a plan")`,
    firstTrace: "Two failures at derivation and two at coding, spread across four different topics, which means the topic was never the pattern. A plan built from the topics would be seven unrelated subjects, and a plan built from the stages is two specific weaknesses. Recording the stage takes one word per attempt.",
    secondTitle: "A plan aimed at the stage, and spaced",
    secondIntro: "Each stage has its own remedy, and none of them is simply more problems.",
    secondCode: `REMEDIES = {
    "clarify": "restate every problem in writing before starting; no code for five problems",
    "derive": "spend twenty minutes deriving without coding at all, then compare",
    "code": "write the same three algorithms from memory until they are exact",
    "test": "for five problems, write the test cases before the solution",
    "communicate": "record yourself explaining a solved problem; listen back once",
}

def plan(counts, weeks=3):
    ordered = sorted(counts, key=lambda s: -counts[s])
    schedule = {}
    for week in range(1, weeks + 1):
        focus = ordered[(week - 1) % len(ordered)]
        schedule[week] = (focus, REMEDIES[focus])
    return schedule

counts = {"derive": 2, "code": 2, "test": 1, "clarify": 1, "communicate": 1}
for week, (focus, remedy) in plan(counts).items():
    print(f"week {week}: {focus}")
    print(f"    {remedy}")`,
    secondTrace: "Each remedy removes the stage that is failing rather than adding volume around it. The plan cycles through the most frequent categories, so a weakness is revisited rather than addressed once and forgotten. Every one of these is a deliberate practice on one stage, which is what more problems never provides.",
    mistake: "Do not respond to a failure by immediately attempting a harder problem. The categorization takes thirty seconds and is the only part of the attempt that changes what you do next, and skipping it means the same stage fails again next week.",
    checkpoint: "Your failures are spread across seven topics and concentrated in two stages. What should you practise?",
    checkpointAnswer: "The two stages. The topics are incidental, since a derivation weakness shows up in whatever subject happens to be asked. Practising the seven topics addresses the surface of the problem and leaves the stage that actually failed untouched.",
    remember: "Record the stage that failed, not the topic. Build the plan from the distribution of stages, give each one its own remedy, and revisit rather than address once.",
    checks: [
      q("Why record the stage rather than the topic?", ["A stage weakness recurs across every topic", "Topics are harder to remember", "Stages are shorter to write"], 0, "Seven topics can be one weakness.", ["Correct. The stage column is a plan; the topic column is not.", "Both are equally memorable.", "Brevity is not the reason."]),
      q("What is wrong with responding to failure with more problems?", ["It adds volume without touching the stage that failed", "It takes too long", "The problems become repetitive"], 0, "Each stage has its own remedy.", ["Correct. More problems is the default plan and rarely the best.", "Time is not the objection.", "Repetition is not the issue."]),
      q("Why revisit a weakness rather than address it once?", ["A stage improved once tends to regress without spacing", "It fills the schedule", "It builds confidence"], 0, "Spacing is what makes the improvement stick.", ["Correct. The plan cycles rather than completes.", "Filling time is not the aim.", "The benefit is retention."]),
    ],
  },
];

export const ALGO_COMMUNICATION_ATOMS = ALGO_COMMUNICATION_SPECS.map(guidedMasteryAtom);
export const ALGO_COMMUNICATION_CONCEPTS = ALGO_COMMUNICATION_SPECS.map(guidedMasteryConcept);
export const ALGO_COMMUNICATION_LESSON_CONTENT = guidedLessonContent(ALGO_COMMUNICATION_SPECS);

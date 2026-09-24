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

const ALGO_EXECUTION_SPECS: GuidedMasterySpec[] = [
  {
    lessonId: "py.ac.m10_2.l1",
    atomId: "py.atom.algo.time-budgeting",
    conceptId: "py.algo.time-budgeting",
    title: "Spend the hour deliberately",
    requires: ["py.algo.cost-estimation"],
    vocabulary: [
      ["clarification", "establishing the exact problem before solving anything"],
      ["derivation", "reaching an approach and stating why it is correct"],
      ["reserved time", "minutes set aside in advance rather than whatever is left"],
      ["overrun signal", "a checkpoint that tells you an approach is taking too long"],
    ],
    opening: "The most common way to fail an interview is to spend fifty minutes coding an approach chosen in the first two. A budget decided before you start turns that from a habit into a decision you would have to actively make.",
    outcome: "You will allocate an interview hour across four phases, and set checkpoints that tell you when to abandon an approach.",
    why: "Every phase you skip costs more than it saves. Skipping clarification produces a solution to a different problem, and skipping testing hands the interviewer your bugs to find.",
    mentalModel: "Picture an exam with four sections and a fixed total. Nobody spends forty minutes on the first question, because the marks lost elsewhere outweigh the marks gained there.",
    firstTitle: "Four phases, decided in advance",
    firstIntro: "Reserving the last block is what stops testing being whatever time happens to remain.",
    firstCode: `def budget(total_minutes):
    shares = {
        "clarify": 0.10,
        "derive": 0.25,
        "code": 0.45,
        "test": 0.20,
    }
    plan = {}
    elapsed = 0
    for phase, share in shares.items():
        minutes = round(total_minutes * share)
        elapsed += minutes
        plan[phase] = (minutes, elapsed)
    return plan

for phase, (minutes, mark) in budget(45).items():
    print(f"{phase:<9} {minutes:>3} min   finish by minute {mark}")

print()
print("the test block is reserved, not left over")`,
    firstTrace: "A forty-five minute session gives four minutes of questions, eleven of derivation, twenty of coding and nine of testing. The cumulative column is what you actually watch, since it converts the plan into a clock time you can check. Reserving the last block in advance is the whole point.",
    secondTitle: "Checkpoints tell you when to change course",
    secondIntro: "An approach that has missed its checkpoint is unlikely to recover on its own.",
    secondCode: `CHECKPOINTS = [
    (0.15, "problem restated and examples agreed",
     "still clarifying: ask for one concrete example and move on"),
    (0.35, "approach chosen and its cost stated",
     "still deriving: take the simplest approach that fits and start"),
    (0.70, "main loop written and roughly working",
     "still coding: cut scope, say so aloud, finish something complete"),
    (0.85, "walking test cases through the code",
     "not testing yet: stop adding features and start checking"),
]

total = 45
for fraction, expected, recovery in CHECKPOINTS:
    print(f"minute {round(total * fraction):>2}: {expected}")
    print(f"          if not -> {recovery}")`,
    secondTrace: "Each checkpoint pairs a state you should be in with a specific action if you are not. Naming the recovery in advance matters, because deciding to abandon an approach is much harder while you are inside it. Saying the cut aloud also turns a retreat into visible judgement.",
    mistake: "Do not treat testing as whatever time is left at the end. It is the phase that catches the bug the interviewer would otherwise find, and a solution you tested yourself reads very differently from one they had to debug for you.",
    checkpoint: "You are two thirds through the time with no working main loop. What do you do?",
    checkpointAnswer: "Cut scope out loud and finish something complete. Announce which case you are dropping, get the core working end to end, and use the remaining time to test it. A complete solution to a reduced problem scores far better than a broken solution to the whole one.",
    remember: "Decide the four phases before starting and reserve the testing block. Set checkpoints with a named recovery, because abandoning an approach is hardest from inside it.",
    checks: [
      q("Why reserve the testing block in advance?", ["Otherwise it becomes whatever time happens to remain", "Testing is the longest phase", "Interviewers require it"], 0, "It is the phase that gets squeezed by default.", ["Correct. Testing catches what they would otherwise find.", "It is one of the shorter phases.", "The reason is practical, not procedural."]),
      q("What should a checkpoint include?", ["A named recovery action, not just a target state", "The remaining time only", "A list of test cases"], 0, "Deciding to abandon is hard from inside an approach.", ["Correct. Decide the retreat before you need it.", "A bare clock tells you nothing to do.", "Test cases belong to the last phase."]),
      q("Two thirds through with no working loop. What is the right move?", ["Cut scope aloud and finish something complete", "Push on and hope to finish", "Restart with a different approach"], 0, "A complete reduced solution beats a broken full one.", ["Correct. Saying it aloud shows judgement.", "Hoping is not a plan at that point.", "Restarting costs the time you no longer have."]),
    ],
  },
  {
    lessonId: "py.ac.m10_2.l2",
    atomId: "py.atom.algo.clean-first-pass",
    conceptId: "py.algo.clean-first-pass",
    title: "Write the version that explains itself",
    requires: ["py.algo.time-budgeting"],
    vocabulary: [
      ["invariant", "a property that holds every time round the loop"],
      ["intention-revealing name", "one that says what a value means rather than what it is"],
      ["early return", "handling a case and leaving, rather than nesting the rest"],
      ["guard clause", "a check at the top that removes a case from all the rest"],
    ],
    opening: "Under time pressure people write shorter names and deeper nesting, which is exactly backwards. The clearer version takes the same time to type and saves the minutes you would have spent explaining or debugging it.",
    outcome: "You will replace opaque names and nested conditions with names and guards that make the invariant visible.",
    why: "The interviewer is reading your code as you write it. Code that states its own invariant needs far less narration, which buys back time and demonstrates exactly the judgement being assessed.",
    mentalModel: "Picture writing directions for someone following behind you. Naming the landmarks costs a few seconds and removes every question they would otherwise have to ask.",
    firstTitle: "The same algorithm, twice",
    firstIntro: "Nothing about the logic changes; only whether it can be read while it is written.",
    firstCode: `def f(a, k):
    r, s, c = 0, 0, {}
    for i in range(len(a)):
        c[a[i]] = c.get(a[i], 0) + 1
        while len(c) > k:
            c[a[s]] -= 1
            if c[a[s]] == 0:
                del c[a[s]]
            s += 1
        r = max(r, i - s + 1)
    return r

def longest_with_at_most(values, limit):
    counts = {}
    start = 0
    best = 0
    for end, value in enumerate(values):
        counts[value] = counts.get(value, 0) + 1
        while len(counts) > limit:
            leaving = values[start]
            counts[leaving] -= 1
            if counts[leaving] == 0:
                del counts[leaving]
            start += 1
        best = max(best, end - start + 1)
    return best

sample = [1, 2, 1, 3, 4, 2, 3]
print(f(sample, 2), longest_with_at_most(sample, 2))`,
    firstTrace: "Both return the same answer and only one of them says what the window is or what it maintains. The named version makes the invariant obvious: the window between start and end never holds more than the limit of distinct values. That sentence is what an interviewer wants to hear, and the code now says it for you.",
    secondTitle: "Guards flatten the nesting",
    secondIntro: "Handling a case and leaving keeps the main path at one level of indentation.",
    secondCode: `def nested(node, target):
    if node is not None:
        if node.get("value") is not None:
            if node["value"] == target:
                return True
            else:
                return nested(node.get("child"), target)
        else:
            return False
    else:
        return False

def guarded(node, target):
    if node is None:
        return False
    if node.get("value") is None:
        return False
    if node["value"] == target:
        return True
    return guarded(node.get("child"), target)

tree = {"value": 1, "child": {"value": 2, "child": None}}
print(nested(tree, 2), guarded(tree, 2))
print(nested(tree, 9), guarded(tree, 9))`,
    secondTrace: "The two agree on every input and the second one never nests past a single level. Each guard removes a case permanently, so the code after it has fewer possibilities to hold in mind. Under pressure that reduction is worth more than the characters it costs.",
    mistake: "Do not shorten names to save typing time. The seconds saved are trivial and the cost is real: you will lose track of which index is which, and the interviewer will interrupt to ask what a variable means at exactly the moment you least want interrupting.",
    checkpoint: "An interviewer asks what your loop maintains. What should the code already have told them?",
    checkpointAnswer: "The invariant, through its names. If the variables are called start, end and counts, the sentence about the window holding at most the limit of distinct values is nearly readable from the code itself, and the answer becomes a confirmation rather than an explanation.",
    remember: "Name values for what they mean and use guards to keep the main path flat. Code that states its own invariant needs less narration and survives the pressure better.",
    checks: [
      q("Why write intention-revealing names under time pressure?", ["They make the invariant readable and cut the narration needed", "They are required by style guides", "They run faster"], 0, "The interviewer is reading as you write.", ["Correct. The saving in explanation exceeds the typing cost.", "No style guide is being enforced.", "Names have no runtime effect."]),
      q("What does a guard clause buy?", ["One fewer case to hold in mind afterwards", "Shorter code overall", "Better performance"], 0, "The main path stays at one level.", ["Correct. Each guard removes a possibility permanently.", "It is often the same length.", "The work done is identical."]),
      q("An interviewer asks what your loop maintains. What is the ideal situation?", ["The names already make the invariant nearly readable", "You have a comment explaining it", "You can derive it on request"], 0, "The answer becomes a confirmation.", ["Correct. That is what good names buy.", "A comment is a weaker version of the same idea.", "Deriving it live costs the time you were saving."]),
    ],
  },
  {
    lessonId: "py.ac.m10_2.l3",
    atomId: "py.atom.algo.live-testing",
    conceptId: "py.algo.live-testing",
    title: "Walk the cases before they are pointed out",
    requires: ["py.algo.clean-first-pass"],
    vocabulary: [
      ["ordinary case", "an input that exercises the main path"],
      ["boundary case", "an input at the edge of what the code handles"],
      ["adversarial case", "an input chosen to break a specific assumption"],
      ["trace", "walking the actual values through the code, line by line"],
    ],
    opening: "Finding your own bug is worth far more than having it found for you. It takes the same two minutes either way, and only one version reads as someone who tests their work.",
    outcome: "You will generate three tiers of test case from the code itself, and trace one through aloud rather than asserting that it works.",
    why: "This is the phase most people skip, and it is the one that separates a solution that is probably right from one that is demonstrably right. Interviewers notice the difference immediately.",
    mentalModel: "Picture proofreading your own letter before posting it. Reading it aloud catches what silent rereading never does, because you cannot skim what you are saying.",
    firstTitle: "Three tiers, generated from the code",
    firstIntro: "Each tier is derived from something the code assumes rather than invented freshly.",
    firstCode: `def case_tiers(signature_hints):
    ordinary = ["a typical input of moderate size"]
    boundary = []
    adversarial = []
    if "list" in signature_hints:
        boundary += ["empty list", "single element", "two elements"]
        adversarial += ["all elements identical", "already sorted", "reverse sorted"]
    if "number" in signature_hints:
        boundary += ["zero", "the smallest allowed value"]
        adversarial += ["negative values", "the maximum allowed value"]
    if "string" in signature_hints:
        boundary += ["empty string", "one character"]
        adversarial += ["repeated characters", "everything distinct"]
    return {"ordinary": ordinary, "boundary": boundary, "adversarial": adversarial}

for tier, cases in case_tiers(["list", "number"]).items():
    print(f"{tier:<12} {cases}")`,
    firstTrace: "The boundary cases come from the shape of the input and the adversarial ones from what the algorithm assumes. A sliding window assumes it can shrink, so an input where it never can is the adversarial case worth naming. Deriving them this way means you never sit staring for an example.",
    secondTitle: "Trace values, do not assert behaviour",
    secondIntro: "Saying what the variables actually hold is what catches the error.",
    secondCode: `def running_max(values):
    best = values[0]
    for value in values[1:]:
        if value > best:
            best = value
    return best

def trace(values):
    print(f"input {values}")
    if not values:
        print("  would raise on values[0] - empty case is unhandled")
        return
    best = values[0]
    print(f"  best starts at {best}")
    for index, value in enumerate(values[1:], start=1):
        if value > best:
            best = value
            print(f"  index {index}: {value} is larger, best is now {best}")
        else:
            print(f"  index {index}: {value} is not larger, best stays {best}")
    print(f"  returns {best}")

trace([3, 1, 4])
trace([])`,
    secondTrace: "Reading the values aloud at each step is what surfaces the unhandled empty case, which no amount of asserting that the function works would have found. The trace also demonstrates the code doing the right thing rather than claiming it does. Two minutes of this is the highest-value use of the last block.",
    mistake: "Do not say the code handles a case without walking the values through it. Saying it works is not evidence, and the case you were most confident about is disproportionately often the broken one.",
    checkpoint: "Where do adversarial cases come from, if not from imagination?",
    checkpointAnswer: "From the assumptions the algorithm makes. A sliding window assumes it can shrink, so an input where it never can is adversarial for it. A greedy choice assumes local decisions compose, so an input where they do not is adversarial. Naming the assumption gives you the case.",
    remember: "Derive ordinary, boundary and adversarial cases from the input shape and the algorithm's assumptions. Trace the actual values aloud rather than asserting the code works.",
    checks: [
      q("Where do adversarial cases come from?", ["The assumptions the algorithm makes", "A memorized checklist", "Random inputs"], 0, "Naming the assumption gives you the case.", ["Correct. A window assumes it can shrink; break that.", "A checklist misses what is specific to your approach.", "Random inputs rarely hit the interesting case."]),
      q("Why trace values rather than assert the code works?", ["Saying it works is not evidence, and confident cases break most", "It takes less time", "Interviewers require a trace"], 0, "Reading values aloud surfaces the unhandled case.", ["Correct. That is what catches the empty-input bug.", "It takes slightly longer and is worth it.", "The reason is that it actually finds bugs."]),
      q("What is the value of finding your own bug?", ["It reads as someone who tests their work", "It saves the interviewer time", "It proves the approach was optimal"], 0, "The two minutes cost the same either way.", ["Correct. Only one version demonstrates the habit.", "Their time is not the point being assessed.", "Optimality is a separate question."]),
    ],
  },
  {
    lessonId: "py.ac.m10_2.l4",
    atomId: "py.atom.algo.recovering-when-stuck",
    conceptId: "py.algo.recovering-when-stuck",
    title: "The hints you can give yourself",
    requires: ["py.algo.live-testing"],
    vocabulary: [
      ["brute force first", "writing the plainly correct slow version to learn the structure"],
      ["constraint relaxation", "solving an easier version to find the shape of the real one"],
      ["worked example", "solving a small instance by hand and watching what you did"],
      ["stuck signal", "the moment silence stops being thinking and starts being freezing"],
    ],
    opening: "Everyone gets stuck. The difference is that some people have a sequence to run through and others have silence, and the sequence is short enough to memorize.",
    outcome: "You will apply four self-hints in order, and recognize when silence has stopped being productive.",
    why: "A candidate who recovers visibly scores better than one who was never stuck, because recovering is the thing the interview is actually sampling for. Freezing is the only outcome that scores nothing.",
    mentalModel: "Picture a checklist taped inside a cockpit. Nobody reads it because they forgot how to fly; they read it because a list beats improvisation when the pressure is high.",
    firstTitle: "Four hints, in order",
    firstIntro: "Each one is cheap, and each one produces something to say out loud.",
    firstCode: `HINTS = [
    ("solve a tiny instance by hand",
     "then watch what you actually did, and name it"),
    ("write the brute force",
     "it is correct, it reveals the structure, and it is something to optimize"),
    ("relax a constraint",
     "solve it without the memory limit, or assuming sorted input"),
    ("say what makes it hard",
     "naming the obstacle often names the technique that removes it"),
]

for index, (hint, why) in enumerate(HINTS, start=1):
    print(f"{index}. {hint}")
    print(f"   {why}")

print()
print("every one of these is also something to say aloud")`,
    firstTrace: "Solving a small instance by hand works because you already know how to do it, and the technique is whatever you just did without naming. The brute force is never wasted, since it establishes correctness and gives the interviewer something to react to. Relaxing a constraint tells you which constraint was doing the work.",
    secondTitle: "Silence has a shelf life",
    secondIntro: "Thinking out loud is worth more than a better answer arrived at silently.",
    secondCode: `def narrate(seconds_silent):
    if seconds_silent < 20:
        return "fine, this reads as thinking"
    if seconds_silent < 45:
        return "say what you are considering, even if it is incomplete"
    return "say you are stuck and which of the four hints you are trying"

for seconds in (10, 30, 60, 120):
    print(f"{seconds:>4}s silent -> {narrate(seconds)}")

print()
print("an interviewer cannot give you credit for reasoning they cannot hear")`,
    secondTrace: "Twenty seconds of silence reads as consideration and two minutes reads as being lost, and the difference is entirely in what was said. Announcing which hint you are reaching for converts a stall into a visible method. Interviewers frequently offer a nudge at that point, which they cannot do while you are silent.",
    mistake: "Do not go quiet while working through a difficulty. The reasoning is what is being assessed, and an interviewer who cannot hear it has to assume the worst, which is exactly the opposite of what the silence was buying you time to avoid.",
    checkpoint: "You have been stuck and silent for a minute. What is the single best thing to say?",
    checkpointAnswer: "That you are stuck, and which hint you are about to try. It converts the silence into a method the interviewer can see, and it invites the nudge they are usually willing to give but cannot offer while you say nothing.",
    remember: "Work a tiny instance, write the brute force, relax a constraint, name the obstacle. Say all of it aloud, because reasoning nobody hears cannot be credited.",
    checks: [
      q("Why write the brute force when stuck?", ["It is correct, reveals the structure, and gives something to optimize", "It might be the intended answer", "It fills time"], 0, "It is never wasted work.", ["Correct. It also gives the interviewer something to react to.", "It occasionally is, but that is not the reason.", "Filling time is not the value."]),
      q("What does relaxing a constraint tell you?", ["Which constraint was doing the work", "That the problem is easier than stated", "The time complexity"], 0, "Solving the easier version isolates the difficulty.", ["Correct. That often names the technique.", "The real problem is unchanged.", "Complexity follows from the approach."]),
      q("You have been silent and stuck for a minute. What helps most?", ["Saying you are stuck and which hint you are trying", "Continuing to think quietly", "Starting over"], 0, "Silence cannot be credited.", ["Correct. It also invites a nudge they cannot otherwise offer.", "A minute of silence already reads as lost.", "Restarting discards what you have."]),
    ],
  },
];

export const ALGO_EXECUTION_ATOMS = ALGO_EXECUTION_SPECS.map(guidedMasteryAtom);
export const ALGO_EXECUTION_CONCEPTS = ALGO_EXECUTION_SPECS.map(guidedMasteryConcept);
export const ALGO_EXECUTION_LESSON_CONTENT = guidedLessonContent(ALGO_EXECUTION_SPECS);

import {
  guidedLessonContent,
  guidedMasteryAtom,
  guidedMasteryConcept,
  type GuidedMasterySpec,
} from "./guidedMastery";

const ML_REASONING_SPECS: GuidedMasterySpec[] = [
  {
    lessonId: "py.mc.m13_3.l1",
    atomId: "py.atom.ml.inference-time-compute",
    conceptId: "py.ml.inference-time-compute",
    title: "Reasoning and inference-time compute",
    requires: ["py.ml.exploration-reward"],
    vocabulary: [
      ["sampling", "generating several independent attempts at the same problem"],
      ["verifier", "something that decides which attempt is correct"],
      ["verifier ceiling", "the accuracy a method cannot exceed however many samples it draws"],
    ],
    opening:
      "Spending more compute at answer time instead of training time works, and it works only as far as something can tell the good answers from the bad ones.",
    outcome:
      "You will compute the gain from repeated sampling and see an imperfect verifier cap it regardless of sample count.",
    why:
      "The headline result is that accuracy rises with samples. What sets the ceiling is the verifier, and that is where the method actually lives or dies.",
    mentalModel:
      "Picture drawing several attempts and needing to pick one. More attempts means the right answer is probably in there; picking it is a separate problem.",
    firstTitle: "More samples, more chances",
    firstIntro:
      "The chance that at least one attempt is correct rises quickly, because the failures have to coincide.",
    firstCode: `def any_correct(single, samples):
    return round(1 - (1 - single) ** samples, 4)

for samples in (1, 4, 16, 64):
    print("samples", samples, "at least one correct",
          any_correct(0.4, samples))`,
    firstTrace:
      "Forty percent with one attempt and effectively certain by sixteen. The right answer is almost always present in the set.",
    secondTitle: "The verifier is the ceiling",
    secondIntro:
      "Being present is not the same as being chosen. Multiply by how often the verifier picks correctly and the curve flattens.",
    secondCode: `def with_verifier(single, samples, verifier):
    return round(any_correct(single, samples) * verifier, 4)

for samples in (1, 4, 16, 64):
    print("samples", samples,
          "perfect verifier", any_correct(0.4, samples),
          "eighty percent verifier", with_verifier(0.4, samples, 0.8))`,
    secondTrace:
      "The eighty percent verifier flattens at eighty percent and stays there. Sixty-four samples buy nothing that sixteen did not already provide.",
    mistake:
      "Reporting a sampling result without saying how the answer was selected. Selecting with a perfect oracle measures whether the answer exists; selecting with a real verifier measures whether the method works.",
    checkpoint:
      "Sampling sixty-four times gives no more than sixteen. What is the limit?",
    checkpointAnswer:
      "The verifier. Once the correct answer is nearly always present, accuracy is capped by how often the verifier picks it.",
    remember:
      "Samples find the answer; the verifier decides whether you keep it.",
    checks: [
      {
        question: "Why does the chance of at least one correct answer rise so fast?",
        choices: [
          "Every attempt must fail for the set to fail",
          "The model improves with each sample",
          "The samples are dependent",
        ],
        answer: 0,
        explanation: "It is one minus a product.",
        why: [
          "Correct, and failures coincide rarely.",
          "The model is unchanged between samples.",
          "Independence is what makes it work.",
        ],
      },
      {
        question: "What caps the accuracy of a sampling method?",
        choices: [
          "The verifier's accuracy",
          "The sample count",
          "The model's single-attempt accuracy",
        ],
        answer: 0,
        explanation: "The answer must be chosen, not just present.",
        why: [
          "Correct, and no sample count exceeds it.",
          "More samples stop helping once the ceiling is reached.",
          "That is what sampling overcomes.",
        ],
      },
      {
        question: "What does an oracle-selected result measure?",
        choices: [
          "Whether the correct answer was generated at all",
          "Whether the method works end to end",
          "The verifier's quality",
        ],
        answer: 0,
        explanation: "The oracle removes the selection problem.",
        why: [
          "Correct, which is a much weaker claim.",
          "That needs a real verifier.",
          "The oracle replaces the verifier entirely.",
        ],
      },
    ],
  },
  {
    lessonId: "py.mc.m13_3.l2",
    atomId: "py.atom.ml.continual-learning",
    conceptId: "py.ml.continual-learning",
    title: "Continual and meta-learning",
    requires: ["py.ml.inference-time-compute"],
    vocabulary: [
      ["catastrophic forgetting", "losing performance on old tasks while learning a new one"],
      ["replay", "mixing old examples into the new training data"],
      ["evaluation leakage", "an adaptation set overlapping the evaluation set"],
    ],
    opening:
      "Training on a new task overwrites the weights that solved the old one. The amount lost is measurable, and the mitigations trade capacity for retention.",
    outcome:
      "You will measure forgetting under three strategies and see the trade each one makes.",
    why:
      "A model that adapts to every new task and forgets the last one is not learning continually; it is being retrained badly.",
    mentalModel:
      "Picture the weights as shared between tasks. Moving them to fit the new task moves them away from the old one unless something holds them back.",
    firstTitle: "Measuring what was lost",
    firstIntro:
      "Record old-task performance before and after learning the new one. The difference is the forgetting.",
    firstCode: `def forgetting(before, after):
    return round(before - after, 4)

strategies = [("naive fine-tune", 0.88, 0.31),
              ("replay", 0.88, 0.81),
              ("frozen backbone", 0.88, 0.88)]

for name, before, after in strategies:
    print(f"{name:16} forgetting {forgetting(before, after)}")`,
    firstTrace:
      "Naive fine-tuning loses fifty-seven points on the old task. Replay loses seven and a frozen backbone loses nothing.",
    secondTitle: "Retention costs adaptation",
    secondIntro:
      "The strategies that forget least also learn the new task least. Both numbers have to be reported together.",
    secondCode: `results = [("naive fine-tune", 0.31, 0.94),
           ("replay", 0.81, 0.89),
           ("frozen backbone", 0.88, 0.62)]

for name, old, new in results:
    print(f"{name:16} old {old} new {new} mean {round((old + new) / 2, 3)}")`,
    secondTrace:
      "The frozen backbone keeps everything and learns least. Replay is the best mean of the three, which is why it is the usual choice.",
    mistake:
      "Reporting only the new-task score. Every strategy looks good on the task it just trained on, and the comparison is entirely about what happened to the old ones.",
    checkpoint:
      "A model reaches ninety-four percent on the new task after fine-tuning. Is that a good result?",
    checkpointAnswer:
      "Unknown without the old-task score. Naive fine-tuning reaches that number while losing fifty-seven points elsewhere.",
    remember:
      "Report old and new together; retention and adaptation trade off.",
    checks: [
      {
        question: "What is catastrophic forgetting?",
        choices: [
          "Losing old-task performance while learning a new one",
          "Failing to learn the new task",
          "Overfitting the new task",
        ],
        answer: 0,
        explanation: "The weights are shared.",
        why: [
          "Correct, and it can be most of the old performance.",
          "That is a different failure.",
          "Overfitting is about generalisation on the same task.",
        ],
      },
      {
        question: "What does a frozen backbone trade away?",
        choices: [
          "How well it can learn the new task",
          "Old-task performance",
          "Inference speed",
        ],
        answer: 0,
        explanation: "It cannot move the shared weights.",
        why: [
          "Correct. It retained everything and learned least.",
          "That is exactly what it protects.",
          "Speed is unchanged.",
        ],
      },
      {
        question: "Why is a new-task score alone uninformative?",
        choices: [
          "Every strategy scores well on what it just trained on",
          "The score is noisy",
          "New tasks are easier",
        ],
        answer: 0,
        explanation: "The comparison is about the old tasks.",
        why: [
          "Correct. The interesting number is what was lost.",
          "Noise is a separate concern.",
          "Difficulty varies either way.",
        ],
      },
    ],
  },
  {
    lessonId: "py.mc.m13_3.l3",
    atomId: "py.atom.ml.long-term-memory",
    conceptId: "py.ml.long-term-memory",
    title: "Long-term memory",
    requires: ["py.ml.continual-learning"],
    vocabulary: [
      ["recency decay", "reducing a memory's weight as it ages"],
      ["expiry", "removing a memory that is no longer true rather than down-weighting it"],
      ["relevance", "how well a memory matches the current situation"],
    ],
    opening:
      "A memory store that only ever grows becomes a store of things that used to be true. Retrieval has to account for age as well as relevance.",
    outcome:
      "You will score memories by relevance decayed with age and see a stale high-relevance item fall under a fresher one.",
    why:
      "The failure mode of a naive store is confident recall of something that has since changed, which is worse than having no memory at all.",
    mentalModel:
      "Picture each memory fading at a fixed rate. A very relevant memory from long ago eventually scores under a moderately relevant recent one.",
    firstTitle: "Age discounts relevance",
    firstIntro:
      "Halve the weight every fixed interval. The ranking then reflects both how well a memory matches and how likely it still holds.",
    firstCode: `def score(relevance, age, half_life):
    return round(relevance * 0.5 ** (age / half_life), 4)

store = [("user prefers python", 0.90, 100),
         ("user is on holiday", 0.95, 20),
         ("user asked about rust", 0.60, 5)]

for text, relevance, age in store:
    print(f"{score(relevance, age, 30):.4f}  {text}")`,
    firstTrace:
      "The holiday note outranks the stated preference despite similar relevance, because the preference is a hundred units old and has faded to under a tenth.",
    secondTitle: "Decay is not expiry",
    secondIntro:
      "A memory that has become false should be removed, not merely down-weighted. Decay handles staleness; it does not handle contradiction.",
    secondCode: `def still_true(text, contradicted):
    return text not in contradicted

contradicted = {"user is on holiday"}
for text, relevance, age in store:
    keep = still_true(text, contradicted)
    print(f"{text:24} score {score(relevance, age, 30):.4f} "
          f"{'keep' if keep else 'expire'}")`,
    secondTrace:
      "The holiday note scores highest and is the one that must be deleted. Decay would have kept surfacing it for weeks.",
    mistake:
      "Using decay as the only mechanism. A memory that is contradicted is wrong immediately, and letting it fade means serving a confident falsehood in the meantime.",
    checkpoint:
      "Why is decay insufficient on its own?",
    checkpointAnswer:
      "It handles staleness but not contradiction. A memory that has become false needs removing now, not fading over weeks.",
    remember:
      "Decay for age, expire for contradiction, and retrieve on both.",
    checks: [
      {
        question: "What does recency decay express?",
        choices: [
          "That an older memory is less likely to still hold",
          "That older memories are less relevant",
          "That storage is limited",
        ],
        answer: 0,
        explanation: "It is about truth over time.",
        why: [
          "Correct, and it is separate from relevance.",
          "Relevance is the other factor entirely.",
          "Storage is a different constraint.",
        ],
      },
      {
        question: "What does decay fail to handle?",
        choices: [
          "A memory that has become false",
          "A memory that is very old",
          "A memory with low relevance",
        ],
        answer: 0,
        explanation: "Contradiction is immediate, not gradual.",
        why: [
          "Correct. That needs expiry.",
          "Age is exactly what decay handles.",
          "Low relevance already scores low.",
        ],
      },
      {
        question: "What is the failure mode of a naive growing store?",
        choices: [
          "Confident recall of something that has since changed",
          "Running out of space",
          "Slow retrieval",
        ],
        answer: 0,
        explanation: "Worse than having no memory.",
        why: [
          "Correct, and it is the reason expiry matters.",
          "Space is manageable.",
          "Speed is an engineering concern.",
        ],
      },
    ],
  },
  {
    lessonId: "py.mc.m13_3.l4",
    atomId: "py.atom.ml.scaling-science",
    conceptId: "py.ml.scaling-science",
    title: "Scaling and generalization science",
    requires: ["py.ml.long-term-memory"],
    vocabulary: [
      ["capability growth", "a real improvement in what a model can do"],
      ["benchmark artifact", "a score change caused by the measurement rather than the model"],
      ["design sensitivity", "whether an experiment can detect the effect it is looking for"],
    ],
    opening:
      "The interesting question about a bigger model is which of its improvements are real. Answering it is an experimental-design problem before it is a modelling one.",
    outcome:
      "You will compute whether a planned experiment can resolve the effect it is testing, before running it.",
    why:
      "An underpowered experiment produces a number either way, and that number is indistinguishable from a real finding.",
    mentalModel:
      "Picture the effect you are looking for and the scatter of your measurements. If the scatter is larger, the experiment cannot see the effect however it comes out.",
    firstTitle: "Can the design detect it",
    firstIntro:
      "Compare the effect size against the error of comparing two means. Work this out before spending the compute, not after.",
    firstCode: `import math

def resolvable(effect, noise, runs):
    error = noise * math.sqrt(2 / runs)
    return round(error, 4), error < effect

for runs in (2, 5, 20, 100):
    print("runs", runs, resolvable(0.01, 0.03, runs))`,
    firstTrace:
      "Two and five runs cannot see a one percent effect against three percent noise. Twenty can, and a hundred has comfortable margin.",
    secondTitle: "What the design costs",
    secondIntro:
      "The required run count grows with the square of the noise-to-effect ratio, which is why small effects are so expensive to establish.",
    secondCode: `def runs_needed(effect, noise):
    runs = 2
    while noise * math.sqrt(2 / runs) >= effect:
        runs += 1
    return runs

for effect in (0.05, 0.02, 0.01):
    print("effect", effect, "runs needed", runs_needed(effect, 0.03))`,
    secondTrace:
      "Two runs for a five percent effect, five for two percent and eighteen for one. Each halving of the effect multiplies the cost several times over.",
    mistake:
      "Running the experiment and computing the power afterwards. Post-hoc power is a function of the result you got, so it cannot tell you whether the design was adequate.",
    checkpoint:
      "An experiment with five runs reports a one percent improvement against three percent noise. What can you conclude?",
    checkpointAnswer:
      "Nothing. The design cannot resolve an effect that small, so the result is indistinguishable from noise whichever way it came out.",
    remember:
      "Check the design can see the effect before spending the compute.",
    checks: [
      {
        question: "When should experimental power be computed?",
        choices: [
          "Before running the experiment",
          "After seeing the result",
          "Only if the result is surprising",
        ],
        answer: 0,
        explanation: "Post-hoc power depends on the result.",
        why: [
          "Correct. It determines whether the design is worth running.",
          "That makes it a function of the outcome.",
          "Surprise is not a criterion.",
        ],
      },
      {
        question: "How does the required run count scale with the effect size?",
        choices: [
          "With the inverse square",
          "Inversely",
          "It does not depend on it",
        ],
        answer: 0,
        explanation: "Halving the effect quadruples the cost.",
        why: [
          "Correct, which is why small effects are expensive.",
          "That would understate the cost badly.",
          "It is the dominant factor.",
        ],
      },
      {
        question: "An underpowered experiment produces a positive result. What does it establish?",
        choices: [
          "Nothing; the design could not distinguish it from noise",
          "A real effect",
          "The absence of an effect",
        ],
        answer: 0,
        explanation: "It produces a number either way.",
        why: [
          "Correct, and that is what makes it dangerous.",
          "The result is uninformative in both directions.",
          "It cannot establish absence either.",
        ],
      },
    ],
  },
];

export const ML_REASONING_ATOMS = ML_REASONING_SPECS.map(guidedMasteryAtom);
export const ML_REASONING_CONCEPTS = ML_REASONING_SPECS.map(guidedMasteryConcept);
export const ML_REASONING_LESSON_CONTENT = guidedLessonContent(ML_REASONING_SPECS);

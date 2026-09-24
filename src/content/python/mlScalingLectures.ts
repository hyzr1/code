import {
  guidedLessonContent,
  guidedMasteryAtom,
  guidedMasteryConcept,
  type GuidedMasterySpec,
} from "./guidedMastery";

const ML_SCALING_SPECS: GuidedMasterySpec[] = [
  {
    lessonId: "py.mc.m9_1.l1",
    atomId: "py.atom.ml.scaling-laws",
    conceptId: "py.ml.scaling-laws",
    title: "Scaling laws",
    requires: ["py.ml.model-security"],
    vocabulary: [
      ["scaling law", "a fitted relationship predicting loss from parameters, data and compute"],
      ["compute budget", "the total training operations available, roughly six times parameters times tokens"],
      ["compute-optimal", "the split of a fixed budget between model size and data that minimises loss"],
    ],
    opening:
      "Loss falls with model size, with data, and with compute, and it does so along a curve smooth enough to fit. That fit is what makes large training runs plannable rather than hopeful.",
    outcome:
      "You will predict loss from a scaling law and find how a fixed compute budget should be split between parameters and tokens.",
    why:
      "A single training run at this scale costs millions. Choosing the split by extrapolating small runs is the only affordable way to decide.",
    mentalModel:
      "Picture loss as a floor plus two decaying terms, one shrinking with parameters and one with data. Neither term alone reaches the floor.",
    firstTitle: "Two terms and an ideal",
    firstIntro:
      "The constant is the irreducible loss of the data itself. The other terms say how far above it you are for a given model size and token count.",
    firstCode: `def loss(params, tokens):
    return 1.69 + 406.4 / params ** 0.34 + 410.7 / tokens ** 0.28

for params, tokens in [(1e8, 2e9), (1e9, 2e10),
                       (1e10, 2e11), (1e11, 2e12)]:
    print(f"{params:.0e} params {tokens:.0e} tokens "
          f"loss {loss(params, tokens):.4f}")`,
    firstTrace:
      "Three point four nine down to one point nine one as both grow a thousandfold. The gains shrink each step because both terms decay with a fractional power.",
    secondTitle: "Splitting a fixed budget",
    secondIntro:
      "Compute is roughly six times parameters times tokens. Fixing that product and varying the split shows the optimum is interior, not at either extreme.",
    secondCode: `budget = 6e22
for params in (1e9, 5e9, 1e10, 5e10, 1e11):
    tokens = budget / (6 * params)
    print(f"params {params:.0e} tokens {tokens:.2e} "
          f"loss {loss(params, tokens):.4f}")`,
    secondTrace:
      "The minimum sits at ten billion parameters on a trillion tokens. A model ten times larger on a tenth the data is measurably worse for the same spend.",
    mistake:
      "Reading the law as a guarantee rather than a fit. It is extrapolated from a range of runs, and it says nothing about behaviour far outside that range or about any particular downstream task.",
    checkpoint:
      "A fixed compute budget is spent on a much larger model with proportionally less data. What happens?",
    checkpointAnswer:
      "Loss goes up. Both the parameter and the data term matter, so starving either one costs more than the other gains.",
    remember:
      "Loss is a floor plus two decaying terms — balance them.",
    checks: [
      {
        question: "What does the constant term in a scaling law represent?",
        choices: [
          "The irreducible loss of the data itself",
          "A fitting artefact with no meaning",
          "The loss at one parameter",
        ],
        answer: 0,
        explanation: "It is the floor neither term can go below.",
        why: [
          "Correct. No amount of scale reaches below it.",
          "It is the most interpretable term of the three.",
          "The other terms dominate at that size.",
        ],
      },
      {
        question: "Roughly how much compute does training cost?",
        choices: [
          "About six times parameters times tokens",
          "About parameters times tokens",
          "About parameters squared",
        ],
        answer: 0,
        explanation: "Forward and backward passes both contribute.",
        why: [
          "Correct. That is the standard estimate.",
          "That misses the backward pass and the factor entirely.",
          "Token count has to appear.",
        ],
      },
      {
        question: "Why is the compute-optimal split interior rather than extreme?",
        choices: [
          "Both the parameter and the data term must be reduced",
          "Because of memory limits",
          "Because of the constant term",
        ],
        answer: 0,
        explanation: "Starving either term costs more than the other gains.",
        why: [
          "Correct. Neither alone reaches the floor.",
          "Memory is a separate constraint.",
          "The constant does not depend on the split.",
        ],
      },
    ],
  },
  {
    lessonId: "py.mc.m9_1.l2",
    atomId: "py.atom.ml.emergent-behavior",
    conceptId: "py.ml.emergent-behavior",
    title: "Emergent behavior and scale",
    requires: ["py.ml.scaling-laws"],
    vocabulary: [
      ["emergence", "a capability that appears absent at small scale and present at large scale"],
      ["thresholded metric", "a metric scoring only a fully correct answer, with no credit for progress"],
      ["smooth underlying gain", "a steadily improving quantity the metric may fail to reveal"],
    ],
    opening:
      "Some capabilities look like they switch on at a particular size. Often the model was improving smoothly all along and the metric was hiding it.",
    outcome:
      "You will reproduce an apparent jump from a smooth improvement, purely by changing how the answer is scored.",
    why:
      "Whether a capability is genuinely discontinuous or merely measured discontinuously changes what you should predict about the next model.",
    mentalModel:
      "Picture a task needing five steps right. Each step improving smoothly still gives an exact-match score that stays near zero and then climbs sharply.",
    firstTitle: "A smooth per-step gain",
    firstIntro:
      "Model the probability of getting a single step right as a smooth curve in scale. Nothing about it jumps.",
    firstCode: `def per_step(scale):
    return 1 / (1 + 2 ** (-(scale - 10) / 1.5))

for scale in range(6, 16):
    print(scale, round(per_step(scale), 4))`,
    firstTrace:
      "Point one four at scale six rising to point nine one at fifteen. The curve is smooth everywhere, with no threshold in it.",
    secondTitle: "The metric makes the jump",
    secondIntro:
      "Score the task as five independent steps all correct. The same smooth curve produces something that looks like a switch flipping.",
    secondCode: `for scale in range(6, 16):
    smooth = per_step(scale)
    exact = smooth ** 5
    print(scale, "per-step", round(smooth, 4),
          "exact-match", round(exact, 4))`,
    secondTrace:
      "Exact match sits at zero through scale eight, reaches three percent at ten and sixty-two percent at fifteen. The apparent emergence came entirely from the scoring.",
    mistake:
      "Concluding that nothing was learned at smaller scales. A partial-credit metric on the same runs usually shows steady progress, which is what you need in order to forecast.",
    checkpoint:
      "A benchmark shows a sharp jump at one model size. What should you check first?",
    checkpointAnswer:
      "Whether the metric gives partial credit. A thresholded metric turns smooth improvement into an apparent discontinuity.",
    remember:
      "Check the metric before believing the threshold.",
    checks: [
      {
        question: "What can make a smooth improvement look like a sudden jump?",
        choices: [
          "A metric scoring only fully correct answers",
          "A larger training set",
          "A lower learning rate",
        ],
        answer: 0,
        explanation: "Think about a task requiring several steps to all be right.",
        why: [
          "Correct. Partial progress earns nothing.",
          "Data size affects the underlying curve, not the scoring.",
          "Optimisation choices are unrelated.",
        ],
      },
      {
        question: "How do you tell genuine emergence from a metric artefact?",
        choices: [
          "Score the same runs with a partial-credit metric",
          "Train a larger model",
          "Repeat the evaluation",
        ],
        answer: 0,
        explanation: "The runs already exist.",
        why: [
          "Correct. Steady progress there means the jump was scoring.",
          "That answers a different question.",
          "Repetition does not change the metric.",
        ],
      },
      {
        question: "Why does the distinction matter?",
        choices: [
          "A smooth underlying gain can be forecast; a true threshold cannot",
          "It changes the training cost",
          "It changes the model architecture",
        ],
        answer: 0,
        explanation: "Think about predicting the next model.",
        why: [
          "Correct. Forecasting is the practical stake.",
          "Cost is unaffected.",
          "Architecture is a separate decision.",
        ],
      },
    ],
  },
  {
    lessonId: "py.mc.m9_1.l3",
    atomId: "py.atom.ml.data-curation",
    conceptId: "py.ml.data-curation",
    title: "Data curation at scale",
    requires: ["py.ml.emergent-behavior"],
    vocabulary: [
      ["deduplication", "removing repeated documents so the model does not overweight them"],
      ["quality filter", "a classifier or heuristic deciding which documents to keep"],
      ["contamination", "evaluation data appearing in the training corpus"],
    ],
    opening:
      "A trillion-token corpus is not collected, it is curated. What you remove shapes the model at least as much as what you keep.",
    outcome:
      "You will measure what deduplication removes and see why contamination invalidates an evaluation rather than merely inflating it.",
    why:
      "Duplicates waste compute and encourage memorisation, and a contaminated benchmark tells you nothing about generalisation at all.",
    mentalModel:
      "Picture the corpus as a pile with many copies of the same documents. Removing the copies leaves a smaller pile that trains a better model.",
    firstTitle: "What duplication costs",
    firstIntro:
      "Web-scale corpora routinely contain a third or more near-duplicate content. Every duplicate is compute spent teaching the model to memorise.",
    firstCode: `corpus = ["the cat sat", "the cat sat", "a dog ran",
          "the cat sat", "birds fly"]

seen, unique = set(), []
for document in corpus:
    if document not in seen:
        seen.add(document)
        unique.append(document)

print(len(corpus), "->", len(unique))
print(unique)

for rate in (0.0, 0.1, 0.35, 0.6):
    kept = int(1_000_000 * (1 - rate))
    print(f"duplicate rate {rate:>4} keeps {kept:>8} documents")`,
    firstTrace:
      "Five documents become three. At a thirty-five percent duplicate rate a million documents become six hundred fifty thousand, and the removed compute buys nothing.",
    secondTitle: "Contamination is not a small error",
    secondIntro:
      "If a benchmark's questions appear in training, the score measures recall of the training set. There is no partial correction for this.",
    secondCode: `benchmark = {"q1", "q2", "q3", "q4"}
training = {"q2", "q4", "other"}

leaked = benchmark & training
print("leaked:", sorted(leaked))
print("clean questions:", len(benchmark - training), "of", len(benchmark))
print("reported score is measuring recall on:",
      round(len(leaked) / len(benchmark) * 100), "percent")`,
    secondTrace:
      "Half the benchmark is in the training set. The reported number is a blend of two different quantities, and no adjustment separates them afterwards.",
    mistake:
      "Filtering for quality with a classifier trained on one notion of good writing. That silently removes dialects, technical registers and whole languages, and the loss only shows up on evaluations you did not run.",
    checkpoint:
      "Why does deduplication improve a model rather than just shrink the corpus?",
    checkpointAnswer:
      "Repeated documents get effectively higher weight, which pushes the model toward memorising them instead of generalising.",
    remember:
      "Deduplicate, decontaminate, and know what your filter throws away.",
    checks: [
      {
        question: "What does a duplicate document cost?",
        choices: [
          "Compute spent encouraging memorisation",
          "Nothing; extra copies are harmless",
          "Storage only",
        ],
        answer: 0,
        explanation: "Repetition raises a document's effective weight.",
        why: [
          "Correct. Deduplication improves the model, not just the size.",
          "Repetition changes the training distribution.",
          "Storage is the least of it.",
        ],
      },
      {
        question: "A benchmark's questions appear in the training corpus. What can be done?",
        choices: [
          "Nothing after the fact; the evaluation is invalid",
          "Subtract the contaminated fraction",
          "Reweight the score",
        ],
        answer: 0,
        explanation: "The score blends two different quantities.",
        why: [
          "Correct. Only a clean held-out set restores meaning.",
          "The two effects cannot be separated afterwards.",
          "Reweighting assumes a separation that does not exist.",
        ],
      },
      {
        question: "What is the hidden risk of a quality filter?",
        choices: [
          "It removes registers and languages the filter was not built for",
          "It runs too slowly",
          "It keeps too much data",
        ],
        answer: 0,
        explanation: "The filter encodes one notion of good writing.",
        why: [
          "Correct, and the loss shows only on evaluations you did not run.",
          "Speed is a minor concern at this scale.",
          "Filters are usually aggressive, not lenient.",
        ],
      },
    ],
  },
];

export const ML_SCALING_ATOMS = ML_SCALING_SPECS.map(guidedMasteryAtom);
export const ML_SCALING_CONCEPTS = ML_SCALING_SPECS.map(guidedMasteryConcept);
export const ML_SCALING_LESSON_CONTENT = guidedLessonContent(ML_SCALING_SPECS);

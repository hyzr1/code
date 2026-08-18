import {
  guidedLessonContent,
  guidedMasteryAtom,
  guidedMasteryConcept,
  type GuidedMasterySpec,
} from "./guidedMastery";

const ML_INTERPRETABILITY_SPECS: GuidedMasterySpec[] = [
  {
    lessonId: "py.mc.m10_2.l1",
    atomId: "py.atom.ml.attribution-saliency",
    conceptId: "py.ml.attribution-saliency",
    title: "Attribution and saliency",
    requires: ["py.ml.compute-aware-iteration"],
    vocabulary: [
      ["saliency", "a per-input score claiming to show what the model attended to"],
      ["sanity check", "a test an explanation method must pass to be worth reading"],
      ["signed contribution", "how much an input pushed the output, including direction"],
    ],
    opening:
      "A saliency map looks like an explanation. Whether it is one depends on tests most published maps have never been subjected to.",
    outcome:
      "You will see magnitude-based saliency discard the sign, and apply the randomized-model check that rules out a whole class of methods.",
    why:
      "An explanation that looks identical for a trained and an untrained model is a description of the input, not of the model.",
    mentalModel:
      "Picture the map as a claim about the model. If the claim survives replacing the model with a random one, it was never about the model.",
    firstTitle: "Magnitude discards direction",
    firstIntro:
      "Taking absolute values makes a feature that pushed against the prediction look as important as one that pushed for it.",
    firstCode: `weights = [2.0, -0.1, 0.0, 5.0]
inputs = [1.0, 3.0, 8.0, 0.01]

saliency = [round(abs(w * x), 4) for w, x in zip(weights, inputs)]
contribution = [round(w * x, 4) for w, x in zip(weights, inputs)]

print("saliency    ", saliency)
print("contribution", contribution)
print("ranked", sorted(range(4), key=lambda i: -saliency[i]))`,
    firstTrace:
      "Feature one ranks second by saliency, and its actual contribution is negative. Feature two has the largest input and contributes nothing, because its weight is zero.",
    secondTitle: "The randomized-model check",
    secondIntro:
      "Recompute the explanation with the model's weights randomised. A method worth using produces something different.",
    secondCode: `def identical(first, second):
    return all(abs(a - b) < 1e-9 for a, b in zip(first, second))

print("suspect method:", identical([0.3, 0.2, 0.5], [0.3, 0.2, 0.5]))
print("passes check  :", identical([0.3, 0.2, 0.5], [0.1, 0.4, 0.5]))`,
    secondTrace:
      "A method giving the same map for a random model has failed. Several widely used methods do exactly that, and the check takes minutes to run.",
    mistake:
      "Reading a saliency map as a claim about causation. It reports a local sensitivity, so an input the model would have ignored had it been slightly different can still light up.",
    checkpoint:
      "A saliency method gives the same map before and after randomising the weights. What does that tell you?",
    checkpointAnswer:
      "The map is a function of the input alone, so it explains nothing about the model and should not be used.",
    remember:
      "Keep the sign, and randomise the model before believing the map.",
    checks: [
      {
        prompt: "What does taking absolute values lose?",
        options: [
          "Whether the input pushed for or against the prediction",
          "The magnitude",
          "The input values",
        ],
        answerIndex: 0,
        hint: "Direction and importance are different questions.",
        explanations: [
          "Correct. Opposing evidence looks like supporting evidence.",
          "Magnitude is exactly what is kept.",
          "Inputs are unchanged.",
        ],
      },
      {
        prompt: "What does the randomized-model check test?",
        options: [
          "Whether the explanation depends on the model at all",
          "Whether the model is accurate",
          "Whether the input is typical",
        ],
        answerIndex: 0,
        hint: "Randomise the weights and recompute.",
        explanations: [
          "Correct, and several popular methods fail it.",
          "Accuracy is not what is being checked.",
          "The input is held fixed.",
        ],
      },
      {
        prompt: "What does a saliency map actually report?",
        options: [
          "A local sensitivity, not a causal claim",
          "The model's reasoning",
          "The training data",
        ],
        answerIndex: 0,
        hint: "It is a derivative at one point.",
        explanations: [
          "Correct, which is why it can mislead.",
          "It does not recover reasoning.",
          "Training data is not involved.",
        ],
      },
    ],
  },
  {
    lessonId: "py.mc.m10_2.l2",
    atomId: "py.atom.ml.probing-representations",
    conceptId: "py.ml.probing-representations",
    title: "Probing and representation analysis",
    requires: ["py.ml.attribution-saliency"],
    vocabulary: [
      ["probe", "a small classifier trained to read a property out of the activations"],
      ["decodable", "present in the representation in a form a probe can recover"],
      ["used", "actually affecting the model's output, which decodability does not establish"],
    ],
    opening:
      "A probe recovering a property from the activations shows the information is there. It does not show the model does anything with it.",
    outcome:
      "You will see probe accuracy rise with probe capacity rather than with the model, and use ablation to test whether the information is used.",
    why:
      "Probing results are routinely reported as though decodable meant used, and the two come apart in both directions.",
    mentalModel:
      "Picture the activations as a filing cabinet. A probe shows a document is in there; only removing it and watching the behaviour shows anyone was reading it.",
    firstTitle: "Capacity does the work",
    firstIntro:
      "A sufficiently expressive probe recovers almost anything from almost any representation. The accuracy is then a fact about the probe.",
    firstCode: `def probe_accuracy(separability, capacity):
    return round(min(1.0, 0.5 + 0.5 * separability * capacity), 4)

for capacity in (0.1, 0.5, 1.0, 2.0):
    print("capacity", capacity, "accuracy", probe_accuracy(0.5, capacity))

print("weakly separable, high capacity:", probe_accuracy(0.3, 2.0))`,
    firstTrace:
      "Accuracy climbs from fifty-two percent to a hundred as the probe grows, with the representation unchanged. Even weakly separable features reach eighty percent given enough capacity.",
    secondTitle: "Ablation tests use",
    secondIntro:
      "Remove the information from the representation and measure the behaviour. A large drop means it was used; no drop means it was merely present.",
    secondCode: `for before, after in [(0.91, 0.62), (0.91, 0.905)]:
    print("before", before, "after ablation", after,
          "drop", round(before - after, 4),
          "used" if before - after > 0.05 else "decodable only")`,
    secondTrace:
      "A drop of twenty-nine points against half a point. The first feature was load-bearing; the second was present and ignored.",
    mistake:
      "Comparing probe accuracy across layers and calling the peak the layer where the property lives. Probe accuracy also depends on how linearly separable the representation happens to be at each depth, which varies for reasons unrelated to the property.",
    checkpoint:
      "A probe reads sentiment from layer eight at ninety percent. Does the model use sentiment?",
    checkpointAnswer:
      "Unknown. Decodability does not imply use, and only an intervention on the representation can establish it.",
    remember:
      "A probe shows presence; only ablation shows use.",
    checks: [
      {
        prompt: "What does high probe accuracy establish?",
        options: [
          "The information is present in the representation",
          "The model uses the information",
          "The model was trained on it",
        ],
        answerIndex: 0,
        hint: "Presence and use are different claims.",
        explanations: [
          "Correct, and nothing more.",
          "That needs an intervention to establish.",
          "Probes say nothing about training.",
        ],
      },
      {
        prompt: "Why must probe capacity be controlled?",
        options: [
          "A large enough probe recovers almost anything",
          "Large probes are slow",
          "Small probes overfit",
        ],
        answerIndex: 0,
        hint: "The accuracy becomes a fact about the probe.",
        explanations: [
          "Correct. The result stops being about the model.",
          "Speed is not the issue.",
          "Large probes overfit more, not less.",
        ],
      },
      {
        prompt: "How do you test whether information is used?",
        options: [
          "Ablate it from the representation and measure the behaviour",
          "Train a larger probe",
          "Compare layers",
        ],
        answerIndex: 0,
        hint: "It has to be an intervention.",
        explanations: [
          "Correct. A large behavioural drop means it was load-bearing.",
          "That only strengthens the decodability claim.",
          "Layer comparisons are still correlational.",
        ],
      },
    ],
  },
  {
    lessonId: "py.mc.m10_2.l3",
    atomId: "py.atom.ml.mechanistic-interpretability",
    conceptId: "py.ml.mechanistic-interpretability",
    title: "Mechanistic interpretability",
    requires: ["py.ml.probing-representations"],
    vocabulary: [
      ["superposition", "representing more features than there are dimensions"],
      ["interference", "the cross-talk between features sharing a direction"],
      ["circuit", "a small subgraph of components implementing an identifiable behaviour"],
    ],
    opening:
      "A network with a thousand dimensions represents far more than a thousand things. That single fact is why individual neurons rarely mean anything.",
    outcome:
      "You will quantify how far a representation is superposed, and see the interference that packing implies.",
    why:
      "The hope that one neuron equals one concept fails because the model has more features to represent than directions to put them in.",
    mentalModel:
      "Picture packing many arrows into a small space so that no two point the same way. Past a point every arrow overlaps several others.",
    firstTitle: "More features than directions",
    firstIntro:
      "Compare the feature count to the dimension count. Once the ratio exceeds one, the features cannot be given private directions.",
    firstCode: `for features, dimensions in [(4, 8), (8, 8), (40, 8), (400, 8)]:
    ratio = round(features / dimensions, 2)
    print(features, "features in", dimensions, "dimensions  ratio",
          ratio, " superposed:", features > dimensions)`,
    firstTrace:
      "Four in eight has room to spare, eight in eight is exactly full, and forty or four hundred must share. Real models sit far to the right of this table.",
    secondTitle: "The price of packing",
    secondIntro:
      "Every extra feature beyond the dimension count adds cross-talk. Reading one feature picks up a little of the others.",
    secondCode: `import math

for features in (8, 16, 64, 256):
    interference = round(math.sqrt(max(0, features - 8) / 8), 4)
    print(features, "features in 8 dimensions -> interference",
          interference)`,
    secondTrace:
      "Zero at exactly full, one at double, and five and a half at thirty-two times. That cross-talk is why a neuron responds to several unrelated things.",
    mistake:
      "Naming a neuron from the inputs that activate it most. Those top activations are a biased sample, and the neuron usually responds to several unrelated features that the top examples never show.",
    checkpoint:
      "Why do individual neurons rarely correspond to single concepts?",
    checkpointAnswer:
      "Because the model represents more features than it has dimensions, so features must share directions and every neuron carries several.",
    remember:
      "More features than directions means every neuron is shared.",
    checks: [
      {
        prompt: "What is superposition?",
        options: [
          "Representing more features than there are dimensions",
          "Stacking layers",
          "Averaging activations",
        ],
        answerIndex: 0,
        hint: "It is a counting argument.",
        explanations: [
          "Correct, and it forces features to share directions.",
          "Depth is a separate matter.",
          "No averaging is involved.",
        ],
      },
      {
        prompt: "What does superposition cost?",
        options: [
          "Interference between features sharing directions",
          "Memory",
          "Training time",
        ],
        answerIndex: 0,
        hint: "Reading one feature picks up others.",
        explanations: [
          "Correct. That is why neurons respond to unrelated things.",
          "It saves memory rather than costing it.",
          "Training cost is unchanged.",
        ],
      },
      {
        prompt: "Why is naming a neuron from its top activations unreliable?",
        options: [
          "The top examples are a biased sample of what it responds to",
          "Activations are noisy",
          "The neuron changes during training",
        ],
        answerIndex: 0,
        hint: "The neuron carries several features.",
        explanations: [
          "Correct. Its other features never appear in that sample.",
          "Noise is not the main problem.",
          "The model is frozen when analysed.",
        ],
      },
    ],
  },
  {
    lessonId: "py.mc.m10_2.l4",
    atomId: "py.atom.ml.activation-steering",
    conceptId: "py.ml.activation-steering",
    title: "Activation steering and model editing",
    requires: ["py.ml.mechanistic-interpretability"],
    vocabulary: [
      ["steering vector", "a direction added to the activations to shift behaviour"],
      ["specificity", "how much of the effect lands on the target behaviour rather than elsewhere"],
      ["persistence", "whether the effect survives across a longer interaction"],
    ],
    opening:
      "Adding a direction to the activations can change behaviour without retraining anything. Whether that is a fix depends on what else changed.",
    outcome:
      "You will compute the specificity of an intervention and watch its effect decay across a conversation.",
    why:
      "An edit that moves the target behaviour and three unrelated ones is not an edit, and the report usually only measures the target.",
    mentalModel:
      "Picture pushing the representation in one direction. The target moves, and so does everything that shares that direction - which, under superposition, is several things.",
    firstTitle: "Measure what else moved",
    firstIntro:
      "Divide the target effect by the total effect. A specificity near one means the intervention landed where it was aimed.",
    firstCode: `def specificity(target, off_target):
    total = target + abs(off_target)
    return round(target / total, 3) if total else 0.0

for target, off_target in [(0.30, 0.01), (0.30, 0.25), (0.05, 0.20)]:
    print("target +", target, "off-target", off_target,
          "specificity", specificity(target, off_target))`,
    firstTrace:
      "Point nine seven, point five four and point two. Only the first is an edit; the third moved four times as much elsewhere as on target.",
    secondTitle: "Does it hold",
    secondIntro:
      "Measure the effect over successive turns rather than on the first response. Steering applied once usually washes out.",
    secondCode: `effect = [0.30, 0.22, 0.11, 0.04, 0.01]
for turn, value in enumerate(effect, start=1):
    print("turn", turn, "effect", value)
print("retained after five turns:",
      round(effect[-1] / effect[0] * 100, 1), "percent")`,
    secondTrace:
      "Three percent of the original effect survives five turns. A single-response evaluation would have reported the intervention as working.",
    mistake:
      "Evaluating an edit only on the behaviour it targeted. Under superposition the steering direction is shared, so the side effects are the expected case rather than the surprise.",
    checkpoint:
      "A steering vector moves the target behaviour by thirty points and an unrelated one by twenty-five. Is it usable?",
    checkpointAnswer:
      "No. A specificity near a half means it is about as likely to change something else as the thing you aimed at.",
    remember:
      "Measure the side effects and the later turns, not just the first response.",
    checks: [
      {
        prompt: "What does specificity measure?",
        options: [
          "How much of the effect landed on the target behaviour",
          "How large the effect is",
          "How long it lasts",
        ],
        answerIndex: 0,
        hint: "It is a ratio, not a magnitude.",
        explanations: [
          "Correct. A large but unspecific effect is not an edit.",
          "Magnitude alone says nothing about aim.",
          "That is persistence.",
        ],
      },
      {
        prompt: "Why are side effects expected rather than surprising?",
        options: [
          "Under superposition the steering direction is shared by several features",
          "The model is noisy",
          "The vector is randomly chosen",
        ],
        answerIndex: 0,
        hint: "Features share directions.",
        explanations: [
          "Correct. Private directions do not exist.",
          "Noise is not the mechanism.",
          "The vector is chosen deliberately.",
        ],
      },
      {
        prompt: "Why evaluate an edit over several turns?",
        options: [
          "A one-off intervention usually washes out",
          "Later turns are longer",
          "The model retrains",
        ],
        answerIndex: 0,
        hint: "Three percent survived five turns.",
        explanations: [
          "Correct, and a first-response test misses it.",
          "Length is not the issue.",
          "No training occurs at inference.",
        ],
      },
    ],
  },
];

export const ML_INTERPRETABILITY_ATOMS = ML_INTERPRETABILITY_SPECS.map(guidedMasteryAtom);
export const ML_INTERPRETABILITY_CONCEPTS = ML_INTERPRETABILITY_SPECS.map(guidedMasteryConcept);
export const ML_INTERPRETABILITY_LESSON_CONTENT = guidedLessonContent(ML_INTERPRETABILITY_SPECS);

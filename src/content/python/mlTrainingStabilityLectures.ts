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

const ML_TRAINING_STABILITY_SPECS: GuidedMasterySpec[] = [
  {
    lessonId: "py.mc.m4_4.l1",
    atomId: "py.atom.ml.weight-initialization",
    conceptId: "py.ml.weight-initialization",
    title: "Initialization sets the scale every layer inherits",
    requires: ["py.ml.second-order-methods"],
    vocabulary: [
      ["symmetry breaking", "starting weights differently so units do not all learn the same thing"],
      ["fan-in", "the number of inputs feeding one unit"],
      ["Xavier initialization", "a scale chosen to preserve variance through a symmetric activation"],
      ["He initialization", "a scale chosen for rectified units, which discard half the signal"],
    ],
    opening: "Before a single gradient is computed, the initial weights have already decided whether the signal reaching the last layer is measured in ones or in millionths. That choice is not a detail; it is what makes deep networks trainable at all.",
    outcome: "You will explain why zeros and large values both fail, and pick between the two standard scales by looking at the activation.",
    why: "A badly scaled start produces a network that appears to train and never improves, with no error message anywhere. Recognizing the symptom from the activation statistics saves days.",
    mentalModel: "Think of passing a whisper down a line of people. If everyone halves the volume it is inaudible by the tenth person, and if everyone doubles it the line is shouting nonsense. The right rule is for each person to pass it on at roughly the volume they heard.",
    firstTitle: "Zeros and large values fail in different ways",
    firstIntro: "Watching the spread of the activations across layers shows both failures immediately.",
    firstCode: `import math, random

def spread(scale, width=64, depth=8, seed=0):
    rng = random.Random(seed)
    signal = [rng.gauss(0, 1) for _ in range(width)]
    for _ in range(depth):
        weights = [[rng.gauss(0, scale) for _ in range(width)]
                   for _ in range(width)]
        signal = [max(0.0, sum(s * w for s, w in zip(signal, row)))
                  for row in weights]
    mean_square = sum(v * v for v in signal) / width
    return math.sqrt(mean_square)

for name, scale in (("too small", 0.01), ("He scale", math.sqrt(2 / 64)), ("too large", 0.5)):
    print(f"{name:>10}: signal size after 8 layers {spread(scale):.3e}")`,
    firstTrace: "A scale that is slightly too small collapses toward zero within a few layers, and a scale that is slightly too large explodes. The He value sits between them and keeps the signal roughly the size it started. The failures are exponential in depth, so a small error per layer becomes a catastrophic one overall.",
    secondTitle: "Two rules, chosen by the activation",
    secondIntro: "Rectified units discard the negative half of the signal, so they need a compensating factor.",
    secondCode: `import math

def xavier(fan_in, fan_out):
    return math.sqrt(2 / (fan_in + fan_out))

def he(fan_in):
    return math.sqrt(2 / fan_in)

for fan_in, fan_out in ((64, 64), (512, 512), (784, 128)):
    print(f"fan_in {fan_in:>4} fan_out {fan_out:>4}: "
          f"xavier {xavier(fan_in, fan_out):.4f}  he {he(fan_in):.4f}")

print("all zeros:", "every unit computes the same thing forever")`,
    secondTrace: "Both rules shrink the scale as the fan-in grows, because more inputs are being summed. He carries a factor of two that Xavier does not, which compensates for a rectified unit zeroing roughly half its inputs. Zero weights are worse than either, since identical units receive identical gradients and never differentiate.",
    mistake: "Do not initialize every weight to the same constant, including zero. Units in a layer then compute identical outputs, receive identical gradients, and stay identical forever, so a layer of a thousand units has the capacity of exactly one.",
    checkpoint: "Why does He initialization carry a factor of two that Xavier does not?",
    checkpointAnswer: "Because a rectified unit zeroes roughly half of its inputs, which halves the variance passing through it. Doubling the weight variance restores what the activation removed, so the signal keeps its scale across layers.",
    remember: "Scale the initial weights by the fan-in so the signal keeps its size through depth. Use Xavier for symmetric activations and He for rectified ones, and never start every weight identical.",
    checks: [
      q("What goes wrong if every weight starts at zero?", ["All units in a layer stay identical forever", "The gradients become infinite", "The loss cannot be computed"], 0, "Identical units receive identical gradients.", ["Correct. The layer has the capacity of a single unit.", "The gradients are finite and identical.", "The loss computes fine; learning does not happen."]),
      q("Why do both rules divide by the fan-in?", ["More inputs are summed, so each should contribute less", "Larger layers train faster", "It bounds the memory use"], 0, "The variance of a sum grows with the number of terms.", ["Correct. Scaling down keeps the output variance steady.", "Speed is not what the rule controls.", "Memory is unaffected."]),
      q("Which rule suits a network of rectified units?", ["He, because the activation discards half the signal", "Xavier, because it is symmetric", "Either, they are equivalent"], 0, "The factor of two compensates for the zeroed half.", ["Correct. Xavier under-scales for rectified units.", "Symmetry is what Xavier assumes and rectifiers break.", "They differ by exactly that factor."]),
    ],
  },
  {
    lessonId: "py.mc.m4_4.l2",
    atomId: "py.atom.ml.normalization-layers",
    conceptId: "py.ml.normalization-layers",
    title: "Normalization decides what gets averaged together",
    requires: ["py.ml.weight-initialization"],
    vocabulary: [
      ["normalization", "rescaling values to a fixed mean and variance before the next layer"],
      ["batch statistics", "a mean and variance computed across the examples in a batch"],
      ["per-example statistics", "a mean and variance computed within one example alone"],
      ["running estimate", "statistics accumulated during training and reused at evaluation time"],
    ],
    opening: "Initialization sets the scale once, at the start. Normalization enforces it continuously, at every layer and every step. The whole family differs on one question: which values get averaged together to produce the statistics.",
    outcome: "You will compute batch and layer statistics on the same tensor, and explain which one survives a batch size of one.",
    why: "Batch normalization made deep convolutional networks trainable, and layer normalization is what every transformer uses instead. Knowing why the switch happened tells you which to reach for.",
    mentalModel: "Picture a class of exam scripts. Batch statistics grade every student on the same question against each other. Per-example statistics grade each student's answers against their own other answers, which needs no classmates at all.",
    firstTitle: "The same numbers, two different averages",
    firstIntro: "One axis produces batch statistics and the other produces layer statistics.",
    firstCode: `def stats(values):
    mean = sum(values) / len(values)
    variance = sum((v - mean) ** 2 for v in values) / len(values)
    return round(mean, 3), round(variance, 3)

batch = [[1.0, 2.0, 3.0],
         [4.0, 6.0, 8.0],
         [10.0, 10.0, 10.0]]

print("per feature, across the batch:")
for index in range(3):
    print("  feature", index, stats([row[index] for row in batch]))

print("per example, across its features:")
for index, row in enumerate(batch):
    print("  example", index, stats(row))`,
    firstTrace: "Averaging down a column mixes different examples together, and averaging across a row stays inside one example. The third example has zero variance within itself, so normalizing it by its own statistics needs the small constant that every implementation adds. Which axis you choose is the entire difference between the two methods.",
    secondTitle: "The batch axis is a dependency, and it can fail",
    secondIntro: "Statistics computed across examples couple them, which matters at evaluation time and at batch size one.",
    secondCode: `def batch_norm(column, eps=1e-5):
    mean = sum(column) / len(column)
    variance = sum((v - mean) ** 2 for v in column) / len(column)
    return [round((v - mean) / ((variance + eps) ** 0.5), 3) for v in column]

print("batch of four:", batch_norm([1.0, 2.0, 3.0, 4.0]))
print("batch of one: ", batch_norm([7.0]))
print("running estimates are what evaluation uses instead")`,
    secondTrace: "A batch of four produces a sensible spread around zero. A batch of one has no variance at all, so every value normalizes to zero and the example carries no information forward. That is why implementations keep running estimates from training and switch to them whenever the model is put in evaluation mode.",
    mistake: "Do not leave a model in training mode while measuring it. Batch normalization then computes statistics from whatever examples happen to be in the evaluation batch, so a prediction depends on which other examples it was scored alongside, and the numbers change between runs.",
    checkpoint: "Transformers use layer normalization rather than batch normalization. What makes that the natural choice?",
    checkpointAnswer: "Layer statistics are computed inside a single example, so they are identical whatever the batch size is and whether the model is training or being evaluated. Sequence models also vary in length across a batch, which makes averaging along the batch axis awkward and the per-example alternative clean.",
    remember: "Normalization differs by which axis the statistics come from. Batch statistics couple examples and need running estimates for evaluation, while per-example statistics behave identically at any batch size.",
    checks: [
      q("What does batch normalization average over?", ["The examples in the batch, one feature at a time", "The features within one example", "Every value in the tensor at once"], 0, "The batch axis is what gives it its name.", ["Correct. That is what couples examples together.", "That describes layer normalization.", "Both methods keep one axis separate."]),
      q("Why does batch normalization need running estimates?", ["At evaluation the batch may be tiny or a single example", "It saves memory during training", "The gradients would otherwise vanish"], 0, "A batch of one has no variance.", ["Correct. Stored statistics make predictions independent of the batch.", "Running estimates cost extra memory.", "Gradient flow is a separate benefit."]),
      q("Why do transformers prefer layer normalization?", ["Its statistics are per-example, so batch size and mode do not matter", "It is cheaper to compute", "It removes the need for initialization"], 0, "Variable-length sequences make the batch axis awkward.", ["Correct. The behaviour is identical in training and evaluation.", "The cost is comparable.", "Initialization still matters."]),
    ],
  },
  {
    lessonId: "py.mc.m4_4.l3",
    atomId: "py.atom.ml.neural-regularization",
    conceptId: "py.ml.neural-regularization",
    title: "Four ways to stop a network memorizing",
    requires: ["py.ml.normalization-layers"],
    vocabulary: [
      ["dropout", "randomly zeroing units during training so no single one is relied upon"],
      ["weight decay", "a pull toward smaller weights added to every update"],
      ["early stopping", "ending training when held-out performance stops improving"],
      ["augmentation", "expanding the training set with transformations that preserve the label"],
    ],
    opening: "A network large enough to fit your data is also large enough to memorize it. Regularization is the collection of ways to make memorizing harder than generalizing, and the four standard ones work by genuinely different mechanisms.",
    outcome: "You will implement dropout with its scaling correction, apply decoupled weight decay, and choose an early-stopping rule with patience.",
    why: "Choosing regularization by habit produces models that either underfit or overfit for reasons nobody can name. Knowing which mechanism each one uses lets you pick the one that addresses the failure you actually have.",
    mentalModel: "Imagine a team that must keep working when random members are absent. Nobody can become the single point of failure, so the knowledge spreads across the whole team rather than concentrating in one specialist.",
    firstTitle: "Dropout, and the scaling that keeps it honest",
    firstIntro: "Zeroing units changes the expected size of the output unless the survivors are scaled up.",
    firstCode: `import random

def dropout(values, rate, training=True, seed=14):
    if not training or rate == 0.0:
        return list(values)
    rng = random.Random(seed)
    keep = 1.0 - rate
    return [0.0 if rng.random() < rate else v / keep for v in values]

signal = [1.0] * 40
kept = dropout(signal, 0.5)
print("survivors:", sum(1 for v in kept if v), "of", len(kept))
print("total before:", sum(signal), "after:", sum(kept))
print("evaluation mode:", sum(dropout(signal, 0.5, training=False)))`,
    firstTrace: "Exactly half the units are zeroed here, and the survivors are divided by the keep rate, so the total comes back to forty. Without that division the next layer would receive a systematically smaller signal during training than at evaluation. Evaluation mode passes everything through untouched, since the randomness is a training device.",
    secondTitle: "Decay and early stopping act on different things",
    secondIntro: "One shrinks the weights on every step, and the other decides when the run should end.",
    secondCode: `def decay_step(weight, gradient, rate=0.1, decay=0.01):
    return weight - rate * gradient - rate * decay * weight

def should_stop(history, patience=3):
    if len(history) <= patience:
        return False
    best = min(history)
    return min(history[-patience:]) > best

weight = 5.0
for _ in range(30):
    weight = decay_step(weight, 0.0)
print("with no gradient at all, weight decays to:", round(weight, 4))

losses = [0.9, 0.7, 0.5, 0.4, 0.41, 0.43, 0.44]
print("stop now?", should_stop(losses))`,
    secondTrace: "With a gradient of zero the weight still shrinks, which is what makes decay a pull toward simpler models rather than a fit to the data. The stopping rule watches held-out loss and ends the run once several consecutive epochs fail to beat the best seen. Patience is what stops a single noisy epoch from ending training early.",
    mistake: "Do not leave dropout active while measuring the model. Predictions then depend on which units happened to be zeroed, so the same input scores differently on each run and the held-out number you are reading is meaningless.",
    checkpoint: "Dropout at rate one half without the scaling correction produces what symptom?",
    checkpointAnswer: "A systematic mismatch between training and evaluation. Every layer receives roughly half the signal during training and the full signal at evaluation, so the model is tuned for one scale and measured at another, and held-out performance is far worse than training suggests.",
    remember: "Dropout spreads reliance across units, decay pulls weights toward zero, early stopping ends the run at the best held-out point, and augmentation grows the data. Turn the random ones off before measuring.",
    checks: [
      q("Why does dropout divide the surviving units by the keep rate?", ["To keep the expected output size the same as at evaluation", "To speed up training", "To make the gradients larger"], 0, "Training and evaluation must see the same scale.", ["Correct. Without it the two modes disagree systematically.", "It has no effect on speed.", "Gradient size is a consequence, not the goal."]),
      q("What does weight decay do when the gradient is zero?", ["It still shrinks the weight toward zero", "It leaves the weight unchanged", "It reverses the previous step"], 0, "The pull is independent of the data.", ["Correct. That is what makes it a preference for simpler models.", "The decay term is always applied.", "Nothing is undone."]),
      q("What is patience protecting against in early stopping?", ["Ending the run because of one noisy epoch", "Training for too long", "Overfitting the held-out set"], 0, "Held-out loss is not monotone.", ["Correct. It waits for a sustained failure to improve.", "Stopping too late is the opposite concern.", "Repeated checking is a separate risk."]),
    ],
  },
  {
    lessonId: "py.mc.m4_4.l4",
    atomId: "py.atom.ml.gradient-stability",
    conceptId: "py.ml.gradient-stability",
    title: "Vanishing and exploding gradients, and the four fixes",
    requires: ["py.ml.neural-regularization"],
    vocabulary: [
      ["vanishing gradient", "a signal that shrinks to nothing before reaching the early layers"],
      ["exploding gradient", "a signal that grows without bound and destabilizes the update"],
      ["gradient clipping", "capping the size of the update while keeping its direction"],
      ["residual connection", "an added shortcut that lets the signal bypass a block unchanged"],
    ],
    opening: "Both failures come from the same arithmetic. A gradient reaching an early layer is a product of local factors, and any product of many numbers either collapses or runs away unless those numbers sit very close to one.",
    outcome: "You will diagnose which failure a run has, and match it to clipping, residuals, normalization or initialization.",
    why: "These are the two failure modes that make a deep network refuse to train, and they present very differently. Clipping fixes one and does nothing for the other, so the diagnosis has to come first.",
    mentalModel: "Picture compound interest running over many periods. A rate slightly under zero shrinks to nothing over enough periods, and slightly over runs away. Only a rate right at the balance point holds steady across depth.",
    firstTitle: "One number per layer decides the outcome",
    firstIntro: "Multiplying the same factor across depth shows how narrow the usable band is.",
    firstCode: `for factor in (0.7, 0.95, 1.0, 1.05, 1.3):
    for depth in (10, 50):
        strength = factor ** depth
        verdict = "vanished" if strength < 1e-6 else "exploded" if strength > 1e6 else "usable"
        print(f"factor {factor:<5} depth {depth:>3}: {strength:>12.3e}  {verdict}")`,
    firstTrace: "At depth fifty a factor of zero point nine five has already lost most of the signal, and one point zero five has gained more than tenfold. The band that survives fifty layers is narrow, and it gets narrower as networks get deeper. Everything that makes deep training work is an attempt to hold that factor near one.",
    secondTitle: "Clipping bounds the update without changing its direction",
    secondIntro: "Rescaling by the ratio of the threshold to the norm is the standard form.",
    secondCode: `import math

def clip(gradient, threshold):
    norm = math.sqrt(sum(g * g for g in gradient))
    if norm <= threshold:
        return list(gradient), round(norm, 3)
    scale = threshold / norm
    return [round(g * scale, 4) for g in gradient], round(norm, 3)

for gradient in ([0.3, 0.4], [30.0, 40.0]):
    clipped, norm = clip(gradient, 1.0)
    print(f"norm {norm:>7}: {clipped}")

print("a residual connection instead adds an unscaled path back to the input")`,
    secondTrace: "The small gradient passes through untouched and the large one is rescaled to exactly the threshold. Direction is preserved in both, which is what separates clipping from simply discarding a large update. Clipping addresses explosion and does nothing whatever for vanishing, where residual connections and normalization are the tools that help.",
    mistake: "Do not reach for clipping when the gradients are vanishing. Capping the size of an update that is already too small changes nothing at all, and the real fixes are structural: a better initial scale, normalization between layers, or residual paths that let the signal bypass the depth.",
    checkpoint: "A very deep network trains its last layers and never moves its first ones. Which fix applies?",
    checkpointAnswer: "A structural one, since this is the vanishing case. Residual connections give the gradient a path that does not pass through every transformation, and normalization keeps the per-layer factor near one. Clipping would have no effect, because the updates are already small.",
    remember: "Both failures are the same product of local factors. Clipping bounds explosion, while residuals, normalization and initialization are what keep the factor near one and prevent vanishing.",
    checks: [
      q("What do vanishing and exploding gradients have in common?", ["Both come from a product of many local factors", "Both are caused by the learning rate", "Both only affect the last layer"], 0, "Depth is what turns a small deviation into a large one.", ["Correct. Only a factor near one survives depth.", "The rate scales the step, not the product.", "Early layers are the ones starved."]),
      q("What does gradient clipping preserve?", ["The direction of the update", "The magnitude of the update", "The sign of the loss"], 0, "It rescales rather than truncating components.", ["Correct. Only the size is capped.", "The magnitude is exactly what it bounds.", "The loss is untouched."]),
      q("Early layers are not learning at all. What should you try?", ["Residual connections or normalization", "Gradient clipping", "A smaller batch size"], 0, "This is the vanishing case, which is structural.", ["Correct. Both keep the per-layer factor near one.", "Clipping only bounds updates that are too large.", "Batch size does not change gradient flow through depth."]),
    ],
  },
  {
    lessonId: "py.mc.m4_4.l5",
    atomId: "py.atom.ml.debugging-training",
    conceptId: "py.ml.debugging-training",
    title: "Debugging a run that will not train",
    requires: ["py.ml.gradient-stability"],
    vocabulary: [
      ["overfit one batch", "checking that the model can drive the loss to zero on a handful of examples"],
      ["baseline loss", "the loss a model with no knowledge would produce"],
      ["controlled change", "altering exactly one thing between two runs"],
      ["gradient inspection", "reading the size of the gradients reaching each layer"],
    ],
    opening: "A training run that does not improve gives you almost no information by itself. The discipline is to shrink the problem until the answer is forced, and the fastest way to do that is to try to overfit a single batch.",
    outcome: "You will check the loss at initialization against its baseline, overfit one batch as a capacity test, and inspect per-layer gradients.",
    why: "Most training failures are bugs rather than deep learning problems, and these checks separate the two in minutes. Skipping them leads to tuning hyperparameters against code that could never have worked.",
    mentalModel: "Think of a mechanic who checks for fuel before rebuilding the engine. Overfitting one batch is the fuel check: if the model cannot memorize five examples, no amount of tuning will make it learn a million.",
    firstTitle: "The loss at initialization is a free test",
    firstIntro: "An untrained classifier should be exactly as wrong as guessing, and any other number is a bug.",
    firstCode: `import math

def expected_start(classes):
    return math.log(classes)

for classes in (2, 10, 1000):
    print(f"{classes:>5} classes: expect about {expected_start(classes):.4f} at step zero")

observed = 0.02
print("observed:", observed)
print("a loss far under the baseline means labels leak into the input")`,
    firstTrace: "A uniform guess over ten classes costs the logarithm of ten, which is about two point three. A first loss far over that suggests the initial scale is wrong, and one far under it suggests the answer is reachable straight from the input. Both are bugs you can find before waiting for a single epoch.",
    secondTitle: "Overfit one batch, then change one thing at a time",
    secondIntro: "A model that cannot drive five examples to zero loss has a bug, not a tuning problem.",
    secondCode: `def overfit(points, steps, rate):
    weight, bias = 0.0, 0.0
    for _ in range(steps):
        gw = sum(2 * (weight * x + bias - y) * x for x, y in points) / len(points)
        gb = sum(2 * (weight * x + bias - y) for x, y in points) / len(points)
        weight -= rate * gw
        bias -= rate * gb
    return sum((weight * x + bias - y) ** 2 for x, y in points) / len(points)

fittable = [(1.0, 3.0), (2.0, 5.0), (3.0, 7.0)]
print("loss on a fittable batch: ", round(overfit(fittable, 5000, 0.02), 8))

contradictory = [(1.0, 3.0), (1.0, 9.0)]
print("loss on a contradictory batch:", round(overfit(contradictory, 5000, 0.02), 4))`,
    secondTrace: "A batch the model can represent goes to essentially zero, which confirms that the forward pass, the loss and the update all work together. The contradictory batch asks for two different answers from the same input, so the loss settles at nine and stops. Distinguishing those two outcomes is exactly what the test is for.",
    mistake: "Do not change several settings between runs when a result surprises you. Two changes at once make the outcome uninterpretable, and the time saved by batching them is repaid many times over in runs whose results mean nothing.",
    checkpoint: "A model reaches zero loss on one batch but never improves on the full training set. What does that rule out?",
    checkpointAnswer: "Bugs in the forward pass, the loss and the update path, since all three demonstrably work. What remains is a problem of capacity, optimization settings or data: the model may be too small, the learning rate wrong for the full distribution, or the inputs may not carry the signal.",
    remember: "Check the loss at initialization against its baseline, then overfit one batch, then inspect the gradients. Change one thing between runs so each result means something.",
    checks: [
      q("What should the initial loss of a ten-class classifier be?", ["About 2.3, the logarithm of ten", "About 10", "Exactly zero"], 0, "An untrained model guesses uniformly.", ["Correct. Anything far from it is a bug worth finding.", "That is the class count, not the loss.", "Zero would mean the answer is already known."]),
      q("The model cannot overfit a batch of five examples. What does that indicate?", ["A bug in the forward pass, loss or update path", "The learning rate needs tuning", "The dataset is too small"], 0, "Memorizing five examples is the minimum capability.", ["Correct. Tuning cannot rescue code that does not work.", "Tuning comes after this test passes.", "Five examples is the test, not the training set."]),
      q("Why change only one setting between two runs?", ["Two changes make the result uninterpretable", "It uses less compute", "It avoids overfitting"], 0, "You cannot attribute the difference otherwise.", ["Correct. The batched runs produce results that mean nothing.", "Compute cost is similar either way.", "Overfitting is unrelated to the procedure."]),
    ],
  },
];

export const ML_TRAINING_STABILITY_ATOMS = ML_TRAINING_STABILITY_SPECS.map(guidedMasteryAtom);
export const ML_TRAINING_STABILITY_CONCEPTS = ML_TRAINING_STABILITY_SPECS.map(guidedMasteryConcept);
export const ML_TRAINING_STABILITY_LESSON_CONTENT = guidedLessonContent(ML_TRAINING_STABILITY_SPECS);

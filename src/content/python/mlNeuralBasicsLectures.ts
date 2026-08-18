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

const ML_NEURAL_BASICS_SPECS: GuidedMasterySpec[] = [
  {
    lessonId: "py.mc.m4_1.l1",
    atomId: "py.atom.ml.perceptron-xor",
    conceptId: "py.ml.perceptron-xor",
    title: "One linear boundary cannot express XOR",
    requires: ["py.ml.grouped-time-validation"],
    vocabulary: [
      ["perceptron", "a single unit computing a weighted sum plus a bias"],
      ["decision boundary", "the surface where the unit switches its answer"],
      ["linearly separable", "separable by one straight boundary"],
      ["XOR", "true when exactly one of two inputs is true"],
    ],
    opening: "A single neuron draws one straight boundary and nothing else. That is enough for a surprising number of problems, and provably not enough for one of the simplest functions imaginable, which is the historical reason deep networks exist at all.",
    outcome: "You will state what a perceptron can represent, show XOR is outside that set, and say what has to change to fix it.",
    why: "This is the argument that motivates every hidden layer you will ever add. Without it, stacking layers looks arbitrary rather than necessary.",
    mentalModel: "Picture four dots at the corners of a square, coloured in a checkerboard pattern. Try to separate the two colours with one straight ruler. Any placement leaves one dot on the wrong side.",
    firstTitle: "AND and OR fall to a single unit",
    firstIntro: "Both are linearly separable, so weights and a bias exist that classify every input correctly.",
    firstCode: `import numpy as np

inputs = np.array([[0, 0], [0, 1], [1, 0], [1, 1]])

def unit(weights, bias):
    return (inputs @ np.array(weights) + bias > 0).astype(int)

print("AND", unit([1, 1], -1.5))
print("OR ", unit([1, 1], -0.5))
print("XOR target", [0, 1, 1, 0])`,
    firstTrace: "For AND the bias demands both inputs before the sum clears zero. For OR a smaller bias lets either input suffice. Both boundaries are single straight lines, and one set of weights handles all four cases.",
    secondTitle: "No weights at all satisfy XOR",
    secondIntro: "Rather than argue, search the space: if a separating line existed, a fine grid of candidates would find one.",
    secondCode: `import numpy as np
from itertools import product

inputs = np.array([[0, 0], [0, 1], [1, 0], [1, 1]])
target = np.array([0, 1, 1, 0])
grid = np.linspace(-3, 3, 25)

solutions = [
    (w1, w2, b)
    for w1, w2, b in product(grid, grid, grid)
    if np.array_equal((inputs @ np.array([w1, w2]) + b > 0).astype(int), target)
]
print("weight settings that solve XOR:", len(solutions))
print("weight settings that solve AND:", sum(
    1 for w1, w2, b in product(grid, grid, grid)
    if np.array_equal((inputs @ np.array([w1, w2]) + b > 0).astype(int), np.array([0, 0, 0, 1]))))`,
    secondTrace: "The search finds thousands of settings for AND and not one for XOR. That is not a failure of the search: XOR's true cases sit on opposite corners, so no straight line can put them on one side while excluding the other two.",
    mistake: "Do not try to fix XOR by training the single unit for longer or lowering the learning rate. The function is outside what one linear boundary can represent, so no amount of optimization reaches it. The fix is capacity, not effort.",
    checkpoint: "A colleague says their single-layer model just needs more epochs to learn XOR. What is the flaw?",
    checkpointAnswer: "Training searches within the set of functions the architecture can represent. XOR is not in that set for a single linear unit, so more epochs explore the same inadequate space. Only adding a hidden layer with a non-linearity enlarges the space to include it.",
    remember: "One unit draws one straight boundary, which handles AND and OR but never XOR. That limitation is a property of the architecture, and no amount of training removes it.",
    checks: [
      q("What does a single perceptron represent?", ["One straight decision boundary", "Any Boolean function", "A curved boundary of arbitrary shape"], 0, "It computes a weighted sum against a threshold.", ["Correct. That is exactly one linear cut through the input space.", "XOR is the standard counterexample.", "Curvature needs a non-linearity and extra layers."]),
      q("Why does the grid search find no XOR solution?", ["XOR's positive cases sit on opposite corners", "The grid was too coarse", "The bias range was too narrow"], 0, "No straight line can separate that arrangement.", ["Correct. It is a representational limit, not a search failure.", "A finer grid changes nothing about the geometry.", "Any bias still leaves a straight boundary."]),
      q("What actually fixes the XOR problem?", ["A hidden layer with a non-linearity", "A smaller learning rate", "More training data"], 0, "The architecture must be able to express the function.", ["Correct. Extra capacity enlarges the set of representable functions.", "Optimization settings cannot reach outside that set.", "More examples of an unrepresentable function do not help."]),
    ],
  },
  {
    lessonId: "py.mc.m4_1.l2",
    atomId: "py.atom.ml.multi-layer-perceptrons",
    conceptId: "py.ml.multi-layer-perceptrons",
    title: "A hidden layer builds features the output can separate",
    requires: ["py.ml.perceptron-xor"],
    vocabulary: [
      ["hidden layer", "units whose outputs feed the next layer rather than the answer"],
      ["representation", "the transformed coordinates a layer hands onward"],
      ["forward pass", "computing each layer in turn from input to output"],
      ["collapse", "two stacked linear layers reducing to a single one"],
    ],
    opening: "Adding a layer solves XOR, but not for the reason it first appears. The hidden units do not vote on the answer. They re-describe the input in new coordinates, and in those coordinates the problem becomes linearly separable.",
    outcome: "You will trace a two-layer forward pass, explain how the hidden layer transforms the space, and say why stacked linear layers collapse.",
    why: "Everything from a small classifier to a transformer is this same pattern repeated. Understanding one hidden layer honestly is what makes the deep case unsurprising.",
    mentalModel: "Picture crumpled paper with two colours of dot that no straight cut separates. The hidden layer smooths and stretches the sheet until the colours fall on opposite sides, and the output layer then makes one straight cut.",
    firstTitle: "Solve XOR with two hidden units",
    firstIntro: "Two hidden units detect the OR and NAND conditions, and the output takes both together.",
    firstCode: `import numpy as np

inputs = np.array([[0, 0], [0, 1], [1, 0], [1, 1]])
step = lambda z: (z > 0).astype(float)

hidden_weights = np.array([[1.0, -1.0], [1.0, -1.0]])
hidden_bias = np.array([-0.5, 1.5])
output_weights = np.array([1.0, 1.0])
output_bias = -1.5

hidden = step(inputs @ hidden_weights + hidden_bias)
output = step(hidden @ output_weights + output_bias)
print("hidden features:\\n", hidden)
print("xor output:", output.astype(int))`,
    firstTrace: "The first hidden unit fires when at least one input is on, and the second fires unless both are on. Only the two middle rows switch both on at once, and the output unit asks for exactly that. The hidden layer created the feature the output needed.",
    secondTitle: "Without a non-linearity the layers collapse",
    secondIntro: "Stacking two linear maps produces another linear map, so the extra layer adds no representational power at all.",
    secondCode: `import numpy as np

rng = np.random.default_rng(0)
first = rng.normal(size=(2, 4))
second = rng.normal(size=(4, 1))
sample = rng.normal(size=(6, 2))

two_layers = (sample @ first) @ second
one_layer = sample @ (first @ second)
print("largest difference:", float(np.abs(two_layers - one_layer).max()))
print("equivalent single matrix shape:", (first @ second).shape)`,
    secondTrace: "The two computations agree to floating-point precision because matrix multiplication is associative. Whatever depth you stack, a purely linear network is equivalent to one matrix. The non-linearity between layers is what stops that collapse.",
    mistake: "Do not add layers while leaving out the activation function. Without it the model has more parameters and trains more slowly. It still represents exactly the same set of functions as a single layer, so depth without non-linearity buys nothing at all.",
    checkpoint: "A network has five hidden layers and no activation functions. What can it represent?",
    checkpointAnswer: "Exactly what a single linear layer represents. The five weight matrices multiply into one equivalent matrix, so the function class is unchanged. The extra parameters only make optimization harder and slower without adding any expressive power.",
    remember: "A hidden layer re-describes the input so the output can separate it with one cut. Without a non-linearity between layers, any depth collapses to a single linear map.",
    checks: [
      q("What does a hidden layer actually produce?", ["A new representation for the next layer to use", "A vote on the final answer", "A copy of the input"], 0, "Hidden units transform the coordinates.", ["Correct. The output layer separates the data in those new coordinates.", "Only the output layer produces the answer.", "A useful layer transforms rather than copies."]),
      q("Why do stacked linear layers collapse into one?", ["Matrix multiplication is associative", "The weights are initialized identically", "Gradients vanish between them"], 0, "The product of the matrices is a single matrix.", ["Correct. The composition is itself a linear map.", "Initialization does not affect what is representable.", "Vanishing gradients are an optimization issue, not a representational one."]),
      q("Adding depth without activation functions gives you what?", ["More parameters and the same function class", "A strictly more powerful model", "Faster training"], 0, "Depth alone does not enlarge the representable set.", ["Correct. It is cost without capability.", "The capability is unchanged.", "More parameters generally slow training down."]),
    ],
  },
  {
    lessonId: "py.mc.m4_1.l3",
    atomId: "py.atom.ml.activation-functions",
    conceptId: "py.ml.activation-functions",
    title: "Activations differ in the gradients they pass back",
    requires: ["py.ml.multi-layer-perceptrons"],
    vocabulary: [
      ["activation", "the non-linear function applied to a unit's weighted sum"],
      ["saturation", "an input range where the output barely changes"],
      ["vanishing gradient", "a gradient shrinking toward zero as it moves backward"],
      ["dead unit", "a ReLU unit stuck outputting zero for every input"],
    ],
    opening: "Any non-linearity restores the power that stacking loses, so the choice between them is not about representation. It is about the gradient each one hands backward during training, and that difference decides whether a deep network learns at all.",
    outcome: "You will compare sigmoid, tanh and ReLU by their derivatives, explain saturation, and describe how a ReLU unit dies.",
    why: "Sigmoid everywhere is the historical reason deep networks were considered untrainable. Understanding why ReLU changed that explains most modern architecture defaults.",
    mentalModel: "Think of each layer as a valve the learning signal passes through on the way back. A saturated sigmoid is a nearly closed valve, and ten of them in series leave almost nothing flowing.",
    firstTitle: "Compare the derivatives, not the shapes",
    firstIntro: "The forward shapes look similar; what separates them is how much gradient survives.",
    firstCode: `import numpy as np

z = np.array([-6.0, -1.0, 0.0, 1.0, 6.0])
sigmoid = 1 / (1 + np.exp(-z))

print("sigmoid derivative", np.round(sigmoid * (1 - sigmoid), 4))
print("tanh derivative   ", np.round(1 - np.tanh(z) ** 2, 4))
print("relu derivative   ", (z > 0).astype(float))`,
    firstTrace: "The sigmoid derivative peaks at one quarter and collapses toward zero at both extremes. Tanh peaks at one, which is four times better but still saturates. ReLU passes a full one wherever the input is positive, and exactly zero where it is not.",
    secondTitle: "Watch the signal die through a deep stack",
    secondIntro: "Backpropagation multiplies these derivatives together, so a factor below one compounds with depth.",
    secondCode: `import numpy as np

layers = 10
print("sigmoid best case after", layers, "layers:", round(0.25 ** layers, 12))
print("tanh best case after   ", layers, "layers:", round(1.0 ** layers, 12))
print("relu active path after ", layers, "layers:", round(1.0 ** layers, 12))
print("but a relu unit with a negative input passes:", 0.0)`,
    secondTrace: "Even at its most generous, ten sigmoid layers shrink the signal by a factor of about a million. Tanh and an active ReLU path preserve it. The catch is that a ReLU unit receiving negative inputs passes exactly zero, and if that holds for every example the unit stops learning entirely.",
    mistake: "Do not read ReLU's zero gradient as harmless sparsity. A unit whose input is negative for every training example receives no gradient ever and is permanently dead. Leaky variants keep a small slope on the negative side precisely to avoid that.",
    checkpoint: "Why did replacing sigmoid with ReLU make much deeper networks trainable?",
    checkpointAnswer: "Backpropagation multiplies the activation derivative at every layer. Sigmoid contributes at most one quarter, so the signal decays exponentially with depth. ReLU contributes exactly one along active paths, so gradients reach early layers essentially intact however deep the network is.",
    remember: "Every non-linearity restores expressive power; they differ in gradient. Sigmoid saturates and vanishes with depth, tanh is better but still saturates, and ReLU passes one on active paths at the risk of dying.",
    checks: [
      q("What is the largest value the sigmoid derivative reaches?", ["One quarter", "One", "Four"], 0, "It peaks at the centre and falls away on both sides.", ["Correct. Multiplied across ten layers that is a factor of about a millionth.", "Tanh reaches one; sigmoid does not.", "No activation derivative here exceeds one."]),
      q("What is a dead ReLU unit?", ["One whose input is negative for every example, so it never receives gradient", "One with weights initialized to zero", "One that saturates at a large positive value"], 0, "Zero gradient means no update, permanently.", ["Correct. Leaky variants exist to prevent exactly this.", "Zero weights can still be updated if the gradient flows.", "ReLU does not saturate on the positive side."]),
      q("Why does activation choice matter more as depth grows?", ["The derivatives multiply together across layers", "Deeper networks have more parameters", "Later layers use different activations"], 0, "Backpropagation compounds each layer's derivative.", ["Correct. A factor below one shrinks exponentially with depth.", "Parameter count is a separate concern.", "The same activation is typically used throughout."]),
    ],
  },
  {
    lessonId: "py.mc.m4_1.l4",
    atomId: "py.atom.ml.universal-approximation",
    conceptId: "py.ml.universal-approximation",
    title: "Universal approximation promises existence, not training",
    requires: ["py.ml.activation-functions"],
    vocabulary: [
      ["universal approximation", "the result that one hidden layer can approximate any continuous function"],
      ["existence result", "a proof that weights exist, with no method for finding them"],
      ["width", "how many units a single hidden layer holds"],
      ["depth efficiency", "deeper networks needing far fewer units for some functions"],
    ],
    opening: "A single hidden layer, given enough units, can approximate any continuous function to any accuracy. That theorem is often quoted as though it settles architecture design. It settles far less than it appears to, and knowing why is the useful part.",
    outcome: "You will state what the theorem guarantees, name the three things it does not, and explain why depth is still preferred.",
    why: "The gap between what is representable and what is learnable explains most practical architecture choices. Quoting the theorem without that gap leads to badly designed models.",
    mentalModel: "Think of a piano with enough keys to play any melody. That is a statement about the instrument, not a promise that you can find the notes, that the sheet music is short, or that you will play it well the first time.",
    firstTitle: "Enough units approximate any shape",
    firstIntro: "Each hidden unit contributes a bump, and summing enough of them traces any smooth curve.",
    firstCode: `import numpy as np

x = np.linspace(0, 1, 200)
target = np.sin(2 * np.pi * x)

def staircase(units):
    edges = np.linspace(0, 1, units + 1)
    approximation = np.zeros_like(x)
    for low, high in zip(edges[:-1], edges[1:]):
        mask = (x >= low) & (x < high)
        approximation[mask] = np.sin(2 * np.pi * (low + high) / 2)
    return approximation

for units in (4, 16, 64):
    error = np.abs(target - staircase(units)).mean()
    print(units, "units -> mean error", round(float(error), 4))`,
    firstTrace: "Adding units shrinks the error steadily toward zero, which is the theorem in miniature: width buys accuracy. What it does not tell you is how many units a given accuracy needs, and for many functions that number is impractically large.",
    secondTitle: "Depth reaches the same accuracy far more cheaply",
    secondIntro: "Some functions need exponentially many units in one layer and only a handful spread across several.",
    secondCode: `def wide_units(regions):
    return regions

def deep_units(regions, per_layer=2):
    layers = 0
    made = 1
    while made < regions:
        made *= per_layer
        layers += 1
    return layers * per_layer

for regions in (8, 64, 1024):
    print(regions, "regions ->",
          "wide", wide_units(regions),
          "deep", deep_units(regions))`,
    secondTrace: "Carving the input into a thousand regions costs a thousand units in one layer, and about twenty spread over ten layers. Each layer multiplies the regions its input already carried. The representable set is the same; the price is not.",
    mistake: "Do not use the theorem to justify a single wide layer. It guarantees that suitable weights exist, not that gradient descent will find them, not that the width is affordable, and not that the result will generalize. Existence and learnability are separate questions.",
    checkpoint: "The theorem says one hidden layer suffices. Why is nearly every practical network deep instead?",
    checkpointAnswer: "Because sufficiency says nothing about cost. Many functions need exponentially many units in a single layer while a few layers compose them compactly, and the theorem offers no way to find the weights. Depth is chosen for parameter efficiency and trainability, not representational power.",
    remember: "Universal approximation is an existence result about one wide hidden layer. It promises nothing about how many units, whether training finds them, or how well the model generalizes.",
    checks: [
      q("What does universal approximation actually guarantee?", ["Suitable weights exist for some width", "Gradient descent will find them", "The network will generalize"], 0, "It is a statement about representability.", ["Correct. Existence is the whole claim.", "Optimization is a separate and unsolved question.", "Generalization depends on data, not representability."]),
      q("Why is depth usually preferred to width?", ["Some functions need exponentially fewer units when composed across layers", "Deep networks always train faster", "Wide layers cannot use non-linearities"], 0, "Composition multiplies the regions each layer creates.", ["Correct. It is a parameter-efficiency argument.", "Very deep networks can be harder to train, not easier.", "Width and non-linearity are independent choices."]),
      q("Your wide network fails to learn a function the theorem covers. What follows?", ["Representability and learnability are different things", "The theorem is false", "The function must be discontinuous"], 0, "Existence of weights does not imply finding them.", ["Correct. Optimization can fail on a perfectly representable target.", "The theorem holds; it simply promises less than assumed.", "Continuity is an assumption of the theorem, not the failure."]),
    ],
  },
];

export const ML_NEURAL_BASICS_ATOMS = ML_NEURAL_BASICS_SPECS.map(guidedMasteryAtom);
export const ML_NEURAL_BASICS_CONCEPTS = ML_NEURAL_BASICS_SPECS.map(guidedMasteryConcept);
export const ML_NEURAL_BASICS_LESSON_CONTENT = guidedLessonContent(ML_NEURAL_BASICS_SPECS);

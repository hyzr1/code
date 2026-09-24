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

const ML_TRAINING_SPECS: GuidedMasterySpec[] = [
  {
    lessonId: "py.mc.m4_2.l1",
    atomId: "py.atom.ml.forward-pass",
    conceptId: "py.ml.forward-pass",
    title: "The forward pass is shapes and one repeated pattern",
    requires: ["py.ml.universal-approximation"],
    vocabulary: [
      ["forward pass", "computing the network's output from its input, layer by layer"],
      ["batch dimension", "the leading axis that holds many independent examples at once"],
      ["feature dimension", "the axis whose length is the number of values describing one example"],
      ["shape mismatch", "an attempted operation whose axis lengths do not line up"],
    ],
    opening: "Most of what goes wrong in a deep network is not mathematics. It is a shape that does not line up, so learning to read shapes out loud is the single highest-return habit in the whole subject.",
    outcome: "You will trace a batch of examples through repeated matrix multiplication, bias addition and activation, naming the shape at every step.",
    why: "Every framework error you will meet in your first month is a shape error. Reading the layer sizes and predicting the output shape before running anything turns those errors from mysteries into arithmetic.",
    mentalModel: "Picture a stack of forms moving down a production line. Each station rewrites every form into a new format with a different number of boxes. The number of forms never changes; only the width of each one does.",
    firstTitle: "One layer, spelled out",
    firstIntro: "A layer takes a batch of rows, multiplies by a weight matrix, adds a bias, and applies an activation.",
    firstCode: `def matmul(rows, weights):
    inner = len(weights)
    outer = len(weights[0])
    return [[sum(row[k] * weights[k][j] for k in range(inner))
             for j in range(outer)] for row in rows]

def layer(rows, weights, bias):
    product = matmul(rows, weights)
    return [[max(0.0, value + bias[j]) for j, value in enumerate(row)]
            for row in product]

batch = [[1.0, 2.0], [0.0, -1.0], [3.0, 1.0]]
weights = [[1.0, 0.0, -1.0], [0.5, 1.0, 0.5]]
bias = [0.0, -1.0, 0.0]
out = layer(batch, weights, bias)
print("in:", len(batch), "x", len(batch[0]))
print("out:", len(out), "x", len(out[0]))
print(out)`,
    firstTrace: "Three examples of two features enter and three examples of three features leave. The batch count is untouched because every row travels the pipeline on its own. The weight matrix is what sets the new width, and its first axis has to match the incoming feature count.",
    secondTitle: "Stacking layers is the same step, repeated",
    secondIntro: "Depth adds no new operation. The output width of one layer becomes the input width of the next.",
    secondCode: `def matmul(rows, weights):
    inner = len(weights)
    outer = len(weights[0])
    return [[sum(row[k] * weights[k][j] for k in range(inner))
             for j in range(outer)] for row in rows]

def relu_layer(rows, weights, bias):
    return [[max(0.0, value + bias[j]) for j, value in enumerate(row)]
            for row in matmul(rows, weights)]

batch = [[1.0, 2.0], [0.0, -1.0]]
w1 = [[1.0, 0.0, -1.0], [0.5, 1.0, 0.5]]
b1 = [0.0, -1.0, 0.0]
w2 = [[1.0], [-2.0], [1.0]]
b2 = [0.5]

hidden = relu_layer(batch, w1, b1)
scores = relu_layer(hidden, w2, b2)
print("2 -> 3 -> 1")
print("hidden width:", len(hidden[0]), "score width:", len(scores[0]))
print(scores)`,
    secondTrace: "Two features become three, then three become one. The middle number appears twice, once as the output width of the first weight matrix and once as its input width in the second. When those two disagree, the multiplication fails immediately, which is the most common error in the whole workflow.",
    mistake: "Do not add the bias before the multiplication. Bias belongs to the layer's output, so it has one entry per output feature, and adding it on the input side both uses the wrong length and changes what the layer computes.",
    checkpoint: "A batch of sixty-four examples with one hundred features passes through a layer whose weight matrix is one hundred by ten. What comes out?",
    checkpointAnswer: "Sixty-four by ten. Rows are independent, so the batch dimension passes through untouched, while the feature width becomes the second axis of the weight matrix.",
    remember: "Batch stays, features change. A weight matrix reads input width on its first axis and writes output width on its second, and the bias has one entry per output feature.",
    checks: [
      q("What happens to the batch dimension as data passes through a layer?", ["It is unchanged", "It shrinks by the layer width", "It grows with depth"], 0, "Rows are processed independently.", ["Correct. Only the feature width changes.", "Nothing in a dense layer removes examples.", "Depth adds layers, not examples."]),
      q("How many entries does a layer's bias vector have?", ["One per output feature", "One per input feature", "One per example in the batch"], 0, "Bias is added after the multiplication.", ["Correct. It matches the layer's output width.", "The input width belongs to the weight matrix's first axis.", "Bias is shared across the batch."]),
      q("Two stacked layers have weight matrices of shape 4x8 and 16x2. What is wrong?", ["The middle widths disagree, so the multiplication fails", "The batch size is missing", "Nothing is wrong"], 0, "The output width of one layer must be the input width of the next.", ["Correct. Eight cannot feed a layer expecting sixteen.", "Batch size is not part of a weight matrix.", "The mismatch prevents the second multiplication."]),
    ],
  },
  {
    lessonId: "py.mc.m4_2.l2",
    atomId: "py.atom.ml.deep-loss-functions",
    conceptId: "py.ml.deep-loss-functions",
    title: "The loss decides what the gradients mean",
    requires: ["py.ml.forward-pass"],
    vocabulary: [
      ["loss function", "a single number measuring how wrong a prediction is"],
      ["cross-entropy", "the loss that scores predicted probabilities against the true label"],
      ["mean squared error", "the loss that scores predicted numbers by their squared distance"],
      ["logit", "a raw unnormalized score produced before any probability conversion"],
    ],
    opening: "A network does not know what a good answer is. The loss is the only place that opinion lives, and every gradient in the system is a statement about how to reduce that one number.",
    outcome: "You will match a loss to a task, compute cross-entropy and squared error by hand, and explain why the choice changes the gradients.",
    why: "Choosing squared error for a classification task trains a model that is slow to learn and badly calibrated. The loss is the shortest lever in the whole system and the easiest one to pull the wrong way.",
    mentalModel: "Think of the loss as the rubric a grader is using. The network is trying to score well on whatever the rubric rewards, so a rubric that rewards the wrong thing produces a model that is excellent at the wrong thing.",
    firstTitle: "Two rubrics for two kinds of question",
    firstIntro: "Predicting a number and predicting a category are scored in genuinely different ways.",
    firstCode: `import math

def squared_error(predicted, actual):
    return sum((p - a) ** 2 for p, a in zip(predicted, actual)) / len(actual)

def cross_entropy(probabilities, labels):
    total = 0.0
    for row, label in zip(probabilities, labels):
        total -= math.log(max(row[label], 1e-12))
    return total / len(labels)

print("mse:", squared_error([2.5, 0.0, 2.0], [3.0, -0.5, 2.0]))
confident = [[0.9, 0.1], [0.2, 0.8]]
unsure = [[0.5, 0.5], [0.5, 0.5]]
print("confident and right:", round(cross_entropy(confident, [0, 1]), 4))
print("no opinion at all:", round(cross_entropy(unsure, [0, 1]), 4))`,
    firstTrace: "Squared error grows with distance, which suits a quantity that can be near or far. Cross-entropy reads only the probability placed on the true label, so a confident correct answer costs little and pure uncertainty costs about zero point six nine per example.",
    secondTitle: "Confidence in the wrong answer is punished without limit",
    secondIntro: "The logarithm is what gives cross-entropy its shape, and its behaviour near zero is the whole point.",
    secondCode: `import math

def penalty(probability):
    return -math.log(max(probability, 1e-12))

for p in (0.99, 0.5, 0.1, 0.01, 0.0001):
    print(f"probability on the true label {p:>7}: loss {penalty(p):.3f}")

print("squared error would cap this at:", (1 - 0.0001) ** 2)`,
    secondTrace: "As the probability on the correct label falls toward zero, the loss climbs without bound. Squared error would cap the same mistake near one, so a confidently wrong prediction produces a mild gradient and the model has little pressure to fix it. That unbounded penalty is why classification uses cross-entropy.",
    mistake: "Do not apply a softmax and then feed the probabilities into a separate logarithm in your own code. Frameworks fuse the two for numerical stability, and splitting them produces infinities as soon as a probability rounds to zero.",
    checkpoint: "A classifier puts probability zero point zero one on the true label. Why does cross-entropy push harder here than squared error would?",
    checkpointAnswer: "Because the negative logarithm grows without bound as the probability approaches zero, so the loss is about four point six rather than the roughly one that squared error would report. The larger loss produces a proportionally larger gradient, so confident mistakes get corrected fastest.",
    remember: "Squared error for quantities, cross-entropy for categories. Cross-entropy reads only the probability on the true label and punishes confident mistakes without any upper limit.",
    checks: [
      q("What does cross-entropy actually read from a prediction?", ["The probability assigned to the true label", "The distance between every probability and its target", "The largest probability in the row"], 0, "Only one entry per example enters the sum.", ["Correct. The rest matter only through normalization.", "That description fits squared error.", "The predicted class is irrelevant if it is not the true one."]),
      q("Why is squared error a poor choice for classification?", ["It bounds the penalty for confident mistakes", "It cannot be computed on probabilities", "It requires more memory"], 0, "The gradient signal is weakest where the model is most wrong.", ["Correct. A confident error produces only a mild push.", "It computes fine; it just trains badly.", "Memory is not the issue."]),
      q("Why do frameworks fuse softmax and the logarithm into one operation?", ["Numerical stability near zero probabilities", "It runs on fewer cores", "It changes the loss value"], 0, "Separating them can produce infinities.", ["Correct. The fused form avoids taking a log of a rounded zero.", "The saving is numerical, not about parallelism.", "The mathematical value is identical."]),
    ],
  },
  {
    lessonId: "py.mc.m4_2.l3",
    atomId: "py.atom.ml.backpropagation",
    conceptId: "py.ml.backpropagation",
    title: "Backpropagation is the chain rule, organized",
    requires: ["py.ml.deep-loss-functions"],
    vocabulary: [
      ["chain rule", "the rule for differentiating a composition by multiplying local derivatives"],
      ["upstream gradient", "the derivative of the loss with respect to a node's output"],
      ["local gradient", "the derivative of a node's output with respect to its own input"],
      ["gradient flow", "how strongly the loss signal reaches a given parameter"],
    ],
    opening: "Backpropagation has a reputation it does not deserve. It is the chain rule applied to a composition of simple functions, arranged so that each piece is computed exactly once.",
    outcome: "You will propagate a gradient backward through a small chain by multiplying local derivatives, and explain where the signal weakens.",
    why: "Vanishing gradients, dead units and exploding updates are all read off this one calculation. Understanding which factors multiply together tells you immediately why a deep network stopped learning.",
    mentalModel: "Think of a line of people passing a message backward, each one scaling its volume by some factor. The message that reaches the front is the product of every factor along the way, so one quiet person silences everyone behind them.",
    firstTitle: "One chain, propagated by hand",
    firstIntro: "Each node reports the derivative of its own output with respect to its own input, and the products accumulate.",
    firstCode: `import math

def sigmoid(z):
    return 1 / (1 + math.exp(-z))

x, w1, w2 = 1.0, 2.0, -3.0

a = x * w1
h = sigmoid(a)
y = h * w2
loss = (y - 1.0) ** 2

d_loss_d_y = 2 * (y - 1.0)
d_y_d_h = w2
d_h_d_a = h * (1 - h)
d_a_d_w1 = x

grad_w2 = d_loss_d_y * h
grad_w1 = d_loss_d_y * d_y_d_h * d_h_d_a * d_a_d_w1
print("loss:", round(loss, 4))
print("grad w2:", round(grad_w2, 6))
print("grad w1:", round(grad_w1, 6))`,
    firstTrace: "The gradient for the second weight needs only one local factor because it sits next to the loss. The gradient for the first weight travels through the sigmoid, so it picks up that unit's derivative as an extra multiplier. Each factor is a small local calculation with no knowledge of the rest of the network.",
    secondTitle: "Depth multiplies the factors, and small factors compound",
    secondIntro: "The same product taken over many layers is what decides whether a deep network trains at all.",
    secondCode: `def signal_after(depth, factor):
    strength = 1.0
    for _ in range(depth):
        strength *= factor
    return strength

for depth in (1, 5, 10, 20):
    print(f"depth {depth:>3}: sigmoid {signal_after(depth, 0.25):.3e}",
          f"| relu {signal_after(depth, 1.0):.3e}",
          f"| slightly large {signal_after(depth, 1.5):.3e}")`,
    secondTrace: "A factor of one quarter per layer leaves roughly one part in a million after ten layers, so the first layers receive almost nothing. A factor of exactly one preserves the signal, which is the reason rectified units replaced saturating ones. A factor larger than one explodes just as fast in the other direction.",
    mistake: "Do not treat a small gradient as evidence that a parameter is already correct. A vanishing gradient usually means the signal never arrived, so the parameter is untrained rather than optimal, and the fix is in the architecture rather than the learning rate.",
    checkpoint: "A twenty-layer network with sigmoid activations barely updates its first layer. What is the arithmetic reason?",
    checkpointAnswer: "The gradient reaching that layer is a product of twenty local derivatives, each at most one quarter. Even at the maximum, that product is around ten to the minus twelve, so the update is numerically negligible no matter how large the learning rate is.",
    remember: "Every gradient is a product of local derivatives along a path. Factors smaller than one vanish with depth, factors larger than one explode, and factors near one are what make deep training possible.",
    checks: [
      q("What does each node need in order to compute its own gradient?", ["Its local derivative and the gradient handed to it downstream", "The full network architecture", "The original training labels"], 0, "Locality is what makes the algorithm scalable.", ["Correct. Two numbers multiplied together suffice.", "No node needs global knowledge.", "Labels enter only at the loss."]),
      q("Ten layers each contribute a local derivative of about one quarter. What reaches the first layer?", ["Roughly one millionth of the signal", "Roughly one quarter of the signal", "The full signal"], 0, "The factors multiply rather than average.", ["Correct. A quarter to the tenth power is about a millionth.", "That would be the effect of a single layer.", "Only a factor of one preserves the signal."]),
      q("A parameter has a near-zero gradient. What should you conclude?", ["It may simply be receiving no signal", "It has converged to its optimum", "The learning rate is too high"], 0, "Vanishing gradients and convergence look identical from the gradient alone.", ["Correct. Untrained and optimal are indistinguishable here.", "Convergence is one possibility among several.", "A high rate produces large steps, not small gradients."]),
    ],
  },
  {
    lessonId: "py.mc.m4_2.l4",
    atomId: "py.atom.ml.reverse-mode-autodiff",
    conceptId: "py.ml.reverse-mode-autodiff",
    title: "Reverse-mode autodiff walks the graph backward",
    requires: ["py.ml.backpropagation"],
    vocabulary: [
      ["computational graph", "the record of which operations produced which values"],
      ["topological order", "an ordering in which every node appears after the nodes it depends on"],
      ["gradient accumulation", "summing the contributions when one value feeds several consumers"],
      ["reverse mode", "computing all input derivatives from one output in a single backward sweep"],
    ],
    opening: "Doing the chain rule by hand stops working the moment a value is used twice. Reverse-mode autodiff is the bookkeeping that makes it mechanical: record the graph going forward, then sweep it backward once.",
    outcome: "You will build a tiny graph that records its own operations, accumulate gradients where a value is reused, and sweep the nodes in reverse order.",
    why: "This is what every framework does when you call backward. Knowing that one backward sweep costs about the same as one forward pass explains why training scales at all, and why reusing a tensor is free rather than doubling the cost.",
    mentalModel: "Imagine a river delta running backward. Water enters at the single mouth and splits at every junction, and a stream that fed two branches receives the sum of what returns from both.",
    firstTitle: "A value used twice receives two contributions",
    firstIntro: "The sum is the whole reason gradients are accumulated rather than assigned.",
    firstCode: `class Value:
    def __init__(self, data, parents=()):
        self.data = data
        self.grad = 0.0
        self.parents = parents
        self._backward = lambda: None

    def __mul__(self, other):
        out = Value(self.data * other.data, (self, other))
        def back():
            self.grad += other.data * out.grad
            other.grad += self.data * out.grad
        out._backward = back
        return out

x = Value(3.0)
y = x * x
y.grad = 1.0
y._backward()
print("value:", y.data, "gradient:", x.grad)`,
    firstTrace: "Squaring uses the same node on both sides of the multiplication, so the backward step adds three twice and reports six. Assigning instead of adding would leave three, silently halving the gradient. That single plus-equals is what makes shared values correct.",
    secondTitle: "Sweep the whole graph in reverse topological order",
    secondIntro: "A node may only run its backward step once every consumer downstream has already contributed.",
    secondCode: `def toposort(root, parents):
    order, seen = [], []

    def visit(node):
        if node in seen:
            return
        seen.append(node)
        for parent in parents.get(node, ()):
            visit(parent)
        order.append(node)

    visit(root)
    return order

parents = {"c": ("a", "b"), "d": ("c", "a")}
forward = toposort("d", parents)
print("forward order:", forward)
print("backward order:", list(reversed(forward)))`,
    secondTrace: "The forward order lists every node after its parents, so reversing it lists every node after all of its consumers. Node a appears last in the backward sweep because both c and d feed gradient into it. Running it any sooner would use a total that was not finished.",
    mistake: "Do not forget to reset the accumulated gradients between steps. Accumulation is deliberate for shared values, so nothing clears the buffers automatically, and a missing reset silently trains on the sum of every batch seen so far.",
    checkpoint: "Why does one backward sweep cost about the same as one forward pass, however many parameters the network has?",
    checkpointAnswer: "Because reverse mode computes the derivative of one output with respect to every input in a single traversal. Each node is visited once and does a constant amount of local work, so the cost tracks the number of operations rather than the number of parameters.",
    remember: "Record the graph forward, sweep it backward once. Gradients accumulate wherever a value is reused, and the buffers must be cleared before the next step.",
    checks: [
      q("Why do gradients accumulate with a plus rather than being assigned?", ["A value used by several consumers receives a contribution from each", "Assignment is slower", "It keeps the values positive"], 0, "Reuse is the reason.", ["Correct. Assigning would discard all but the last contribution.", "The cost difference is negligible.", "Gradients are frequently negative."]),
      q("What order does the backward sweep follow?", ["Reverse topological order", "The order the parameters were created", "Increasing gradient magnitude"], 0, "Every consumer must contribute before a node runs.", ["Correct. That guarantees each total is complete.", "Creation order says nothing about dependencies.", "Magnitude is unknown until the sweep runs."]),
      q("What goes wrong if gradient buffers are never cleared?", ["Each step trains on the sum of all previous batches", "The gradients become zero", "The graph is rebuilt twice"], 0, "Accumulation continues across steps.", ["Correct. The effective step size grows without bound.", "Accumulation adds rather than cancels.", "Graph construction is unaffected."]),
    ],
  },
  {
    lessonId: "py.mc.m4_2.l5",
    atomId: "py.atom.ml.training-loop",
    conceptId: "py.ml.training-loop",
    title: "A training loop from scratch",
    requires: ["py.ml.reverse-mode-autodiff"],
    vocabulary: [
      ["epoch", "one full pass over the training set"],
      ["step", "one update of the parameters from one batch of gradients"],
      ["zero grad", "clearing the accumulated gradients before a new backward sweep"],
      ["evaluation mode", "running the model without updating anything and without training-only behaviour"],
    ],
    opening: "Every training script in the field is the same five steps in the same order. Once you can write them from memory, an unfamiliar codebase becomes a matter of finding where each of the five lives.",
    outcome: "You will write a complete loop with forward, loss, clear, backward and step, and separate it cleanly from evaluation.",
    why: "Ordering mistakes in this loop do not raise errors. They produce a model that trains slowly or not at all, and the only way to catch them is to know what the correct order is and why.",
    mentalModel: "Think of a workshop cycle. Make the part, measure the error, wipe the old measurements off the board, work out the corrections, then adjust the machine. Skipping the wipe means correcting for yesterday's part as well as today's.",
    firstTitle: "The five steps, in the order they must run",
    firstIntro: "Fitting a straight line by hand shows the cycle with nothing else in the way.",
    firstCode: `points = [(1.0, 3.0), (2.0, 5.0), (3.0, 7.0), (4.0, 9.0)]
weight, bias = 0.0, 0.0
rate = 0.02

for epoch in range(600):
    grad_w = 0.0
    grad_b = 0.0
    loss = 0.0
    for x, target in points:
        prediction = weight * x + bias
        error = prediction - target
        loss += error ** 2
        grad_w += 2 * error * x
        grad_b += 2 * error
    n = len(points)
    weight -= rate * grad_w / n
    bias -= rate * grad_b / n
    if epoch % 200 == 0:
        print(f"epoch {epoch:>3} loss {loss / n:.6f}")

print(f"learned weight {weight:.3f} bias {bias:.3f}")`,
    firstTrace: "The gradient buffers start at zero inside every epoch, which is the manual version of clearing them. The loss falls toward zero and the parameters approach two and one, which is the line the data came from. Dividing by the batch size keeps the step size independent of how many points there are.",
    secondTitle: "Evaluation is a different mode, not a smaller loop",
    secondIntro: "Measuring the model must not update it, and must not run behaviour that exists only for training.",
    secondCode: `def evaluate(points, weight, bias):
    total = 0.0
    for x, target in points:
        total += (weight * x + bias - target) ** 2
    return total / len(points)

train = [(1.0, 3.0), (2.0, 5.0), (3.0, 7.0)]
held_out = [(4.0, 9.0), (5.0, 11.2)]
weight, bias = 2.0, 1.0

print("train loss:", round(evaluate(train, weight, bias), 6))
print("held-out loss:", round(evaluate(held_out, weight, bias), 6))
print("gap:", round(evaluate(held_out, weight, bias) - evaluate(train, weight, bias), 6))`,
    secondTrace: "The evaluation routine computes a loss and returns it without touching a single parameter. Held-out loss is slightly higher because one point does not sit exactly on the learned line. Watching that gap widen over training is the signal that the model has started memorizing.",
    mistake: "Do not clear the gradients after the update instead of before the backward sweep. It works until an early exit, a skipped batch or a gradient-accumulation branch leaves stale values in the buffers, and the resulting bug appears only occasionally.",
    checkpoint: "A loop calls backward, then the optimizer step, then clears the gradients. Name the failure this ordering invites.",
    checkpointAnswer: "Any path that skips the clear leaves stale gradients in place. The next backward sweep then adds its contributions on top of values that were never reset. Clearing immediately before the backward sweep makes the buffers correct on every path through the loop.",
    remember: "Forward, loss, clear, backward, step. Evaluation runs the forward pass alone, updates nothing, and its gap against training loss is what tells you about generalization.",
    checks: [
      q("Where in the loop do the gradients need to be cleared?", ["Immediately before the backward sweep", "After the optimizer step only", "Once at the start of training"], 0, "Clearing before is robust to skipped iterations.", ["Correct. The buffers are then correct on every path.", "Any early exit leaves stale values behind.", "Gradients accumulate on every single step."]),
      q("Why divide the accumulated gradient by the batch size?", ["It keeps the step size independent of batch size", "It prevents numerical overflow", "It is required for correctness"], 0, "Otherwise a larger batch silently means a larger step.", ["Correct. The learning rate then means the same thing throughout.", "Overflow is not the concern at these magnitudes.", "The direction is correct either way; only the scale changes."]),
      q("What does a widening gap between training and held-out loss indicate?", ["The model is beginning to memorize the training set", "The learning rate is too low", "The batch size is too large"], 0, "Generalization is what the gap measures.", ["Correct. Training loss improving alone is the warning sign.", "A low rate slows both losses together.", "Batch size affects noise, not the gap directly."]),
    ],
  },
];

export const ML_TRAINING_ATOMS = ML_TRAINING_SPECS.map(guidedMasteryAtom);
export const ML_TRAINING_CONCEPTS = ML_TRAINING_SPECS.map(guidedMasteryConcept);
export const ML_TRAINING_LESSON_CONTENT = guidedLessonContent(ML_TRAINING_SPECS);

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

const ML_CALCULUS_SPECS: GuidedMasterySpec[] = [
  {
    lessonId: "py.mc.m1_2.l1",
    atomId: "py.atom.ml.exponents-logs-sums",
    conceptId: "py.ml.exponents-logs-sums",
    title: "Exponents, logarithms, and summations",
    requires: ["py.ml.orthogonality-least-squares"],
    vocabulary: [
      ["exponent", "a number that says how many times a base is multiplied by itself"],
      ["logarithm", "the exponent needed to turn a chosen base into a value"],
      ["natural logarithm", "a logarithm with base e, written ln"],
      ["summation", "a compact instruction to add a sequence of terms"],
    ],
    opening: "Machine-learning formulas use a few symbols again and again. Exponents describe fast growth and tiny probabilities. Logarithms undo exponents and turn products into sums. A capital sigma tells us to add one term for every example.",
    outcome: "You will be able to read powers, logs, and sigma notation; apply their safest rules; and translate a short formula into ordinary Python.",
    why: "Likelihoods multiply many probabilities and can become too tiny for a computer to store. Logarithms turn that fragile product into a stable sum. Loss functions also use sums or averages to combine errors from a dataset.",
    mentalModel: "An exponent is a fast elevator going up. A logarithm asks which floor the elevator reached. A summation is a cashier scanning one item at a time and keeping a running total.",
    firstTitle: "Read a summation as a loop",
    firstIntro: "The expression sum from i equals one to n means: create one term for each allowed i, then add those terms.",
    firstCode: `values = [2.0, 3.0, 4.0]

total_with_loop = 0.0
for value in values:
    total_with_loop += value ** 2

total_with_sum = sum(value ** 2 for value in values)
print(total_with_loop, total_with_sum)`,
    firstTrace: "The terms are two squared, three squared, and four squared. They become four, nine, and sixteen. Adding them gives twenty-nine. The loop and Python's `sum` spell the same mathematical instruction in two different ways.",
    secondTitle: "Turn a product of probabilities into a sum",
    secondIntro: "Multiplying probabilities can underflow toward zero. Adding their logarithms keeps the calculation usable and preserves comparisons.",
    secondCode: `from math import exp, log

probabilities = [0.8, 0.6, 0.5]
product = 1.0
for probability in probabilities:
    product *= probability

log_product = sum(log(probability) for probability in probabilities)
recovered = exp(log_product)
print(product, log_product, recovered)`,
    secondTrace: "The product is `0.24`. The log of a product equals the sum of the logs. Applying `exp` reverses the natural log and returns about `0.24`. Real training code usually keeps the log value instead of converting back.",
    mistake: "Do not claim that the log of a sum equals the sum of the logs. `log(a * b)` splits into `log(a) + log(b)`, but `log(a + b)` needs its own careful computation.",
    checkpoint: "A dataset loss is written as one over n times a sum of n errors. What two operations does that formula request?",
    checkpointAnswer: "First add one error term for every example. Then divide the total by the number of examples. The result is the mean error, so dataset size alone does not inflate the scale.",
    remember: "Powers grow, logs undo powers and simplify products, and sigma notation is a compact loop that adds one term at a time.",
    checks: [
      q("What does log(a * b) equal?", ["log(a) + log(b)", "log(a) * log(b)", "log(a + b)"], 0, "A logarithm changes multiplication into addition.", ["Correct. This rule makes log-likelihoods stable.", "Logs do not preserve multiplication that way.", "A sum inside a log does not split."]),
      q("What does a sigma symbol tell you to do?", ["Add indexed terms", "Differentiate every term", "Choose the largest term"], 0, "Sigma notation describes repeated addition.", ["Correct. The limits say which indices to include.", "Differentiation uses different notation.", "A maximum is not a summation."]),
    ],
  },
  {
    lessonId: "py.mc.m1_2.l2",
    atomId: "py.atom.ml.derivatives-rules",
    conceptId: "py.ml.derivatives-rules",
    title: "Derivatives measure local change",
    requires: ["py.ml.exponents-logs-sums"],
    vocabulary: [
      ["function", "a rule that maps an input to an output"],
      ["derivative", "the local rate at which an output changes as its input changes"],
      ["slope", "rise divided by run between two points"],
      ["finite difference", "a numerical slope estimated with two nearby function values"],
    ],
    opening: "A derivative answers a small question with huge consequences: if the input moves a tiny amount, which way does the output move, and how quickly? A model uses that answer to decide how to change a weight.",
    outcome: "You will be able to estimate a derivative from nearby points, use basic differentiation rules, and explain the sign and size of a derivative in plain language.",
    why: "Training is controlled change. The loss tells us how bad the model is. A derivative tells us whether increasing one number makes that loss rise or fall, and roughly how strongly.",
    mentalModel: "Imagine standing on a curved hill. The derivative is the tilt directly under your feet. A positive tilt rises to your right. A negative tilt falls to your right. Zero feels locally flat.",
    firstTitle: "Estimate a slope with two nearby points",
    firstIntro: "For the function x squared, compare the output just to the left and just to the right of x equals three.",
    firstCode: `def square(x):
    return x * x

def central_difference(function, x, step=0.0001):
    rise = function(x + step) - function(x - step)
    run = 2 * step
    return rise / run

print(central_difference(square, 3.0))`,
    firstTrace: "The estimate is almost six. The exact derivative of x squared is two x, so at x equals three it is six. Near that point, adding about `0.01` to x adds about `6 * 0.01` to the output.",
    secondTitle: "Use derivative rules instead of tiny steps",
    secondIntro: "The power rule says the derivative of x to power n is n times x to power n minus one. Constants and sums can be handled piece by piece.",
    secondCode: `def function(x):
    return 3 * x ** 2 + 2 * x + 5

def exact_derivative(x):
    return 6 * x + 2

x = 4.0
print(function(x))
print(exact_derivative(x))
print(central_difference(function, x))`,
    secondTrace: "The constant five has derivative zero. Three x squared becomes six x. Two x becomes two. At x equals four, the exact slope is twenty-six, and the finite-difference estimate closely agrees.",
    mistake: "Do not read a derivative as the function's current value. A loss can equal one hundred while its derivative equals negative two. One is height; the other is local tilt.",
    checkpoint: "At one weight value, the derivative of loss is negative five. What should happen to loss if the weight increases by a very small positive amount?",
    checkpointAnswer: "The loss should decrease locally because the derivative is negative. For a tiny change of positive delta, the loss change is approximately negative five times delta. This local prediction may fail for a large jump.",
    remember: "A derivative is local slope, not height. Its sign gives direction, and its magnitude describes sensitivity near the current point.",
    checks: [
      q("What does a negative derivative mean?", ["The output locally falls as the input rises", "The output is negative", "The function has no value"], 0, "Derivative sign describes local movement.", ["Correct. A small move right lowers the output.", "Output height and slope sign are different facts.", "A valid function can have a negative derivative."]),
      q("What is the derivative of 4*x**3?", ["12*x**2", "4*x**2", "3*x**4"], 0, "Bring down the power and reduce it by one.", ["Correct. Four times three is twelve.", "This forgets the factor three.", "The derivative lowers the exponent."]),
    ],
  },
  {
    lessonId: "py.mc.m1_2.l3",
    atomId: "py.atom.ml.partials-gradient",
    conceptId: "py.ml.partials-gradient",
    title: "Partial derivatives build a gradient",
    requires: ["py.ml.derivatives-rules"],
    vocabulary: [
      ["partial derivative", "the derivative with respect to one input while the other inputs are held fixed"],
      ["gradient", "a vector containing one partial derivative for every input"],
      ["steepest ascent", "the local direction that increases a function fastest"],
      ["gradient descent", "moving opposite the gradient to reduce a function"],
    ],
    opening: "A model has many weights, so its loss is a function with many inputs. We ask how the loss responds to one weight at a time. Those answers line up into one vector called the gradient.",
    outcome: "You will be able to compute simple partial derivatives, assemble a gradient, and take a correctly signed gradient-descent step.",
    why: "The gradient is the instruction passed from a loss to an optimizer. Each entry tells one parameter how strongly it affects the loss at this exact moment.",
    mentalModel: "Stand on a landscape with east and north directions. One partial derivative measures east-west tilt. Another measures north-south tilt. The gradient arrow combines those tilts and points most steeply uphill.",
    firstTitle: "Compute two partial derivatives",
    firstIntro: "For loss `(x - 2)^2 + (y + 1)^2`, hold y still when differentiating x, and hold x still when differentiating y.",
    firstCode: `def loss(x, y):
    return (x - 2) ** 2 + (y + 1) ** 2

def gradient(x, y):
    dx = 2 * (x - 2)
    dy = 2 * (y + 1)
    return [dx, dy]

point = [5.0, 3.0]
print(loss(*point), gradient(*point))`,
    firstTrace: "The loss is twenty-five. The x partial is six, and the y partial is eight. The gradient is `[6,8]`. Increasing either coordinate raises loss locally, so decreasing both should move toward the bowl's center at `[2,-1]`.",
    secondTitle: "Take several descent steps",
    secondIntro: "Subtract learning rate times gradient. The learning rate controls how much of the local instruction we trust at once.",
    secondCode: `x, y = 5.0, 3.0
learning_rate = 0.1

for step in range(5):
    dx, dy = gradient(x, y)
    x -= learning_rate * dx
    y -= learning_rate * dy
    print(step, round(loss(x, y), 4), round(x, 4), round(y, 4))`,
    secondTrace: "Every printed loss is smaller. The point moves toward `[2,-1]`. We subtract because the gradient points uphill. Multiplying by a small learning rate keeps the step controlled.",
    mistake: "Do not change all inputs while computing one partial derivative. A partial isolates one coordinate's effect. Also do not add the gradient when the goal is minimizing loss; addition performs ascent.",
    checkpoint: "A two-weight model has gradient `[-3, 4]`. Which local direction should gradient descent move?",
    checkpointAnswer: "It should move opposite the gradient, toward `[3,-4]`, scaled by the learning rate. The first weight increases and the second decreases. The step is local, so its size still matters.",
    remember: "One partial derivative explains one coordinate. The gradient collects all partials, points uphill, and is subtracted to move downhill.",
    checks: [
      q("What is held fixed during a partial derivative with respect to x?", ["The other inputs", "x itself", "The function output forever"], 0, "A partial isolates x's local effect.", ["Correct. Other coordinates are treated as constants.", "x is the coordinate allowed to vary.", "Only a local rate is being measured."]),
      q("Why does gradient descent subtract the gradient?", ["The gradient points toward steepest local increase", "The gradient is always negative", "Subtraction makes every weight zero"], 0, "The opposite direction locally decreases the function fastest.", ["Correct. Descent moves downhill.", "Gradient entries can have either sign.", "The goal is lower loss, not necessarily zero weights."]),
    ],
  },
  {
    lessonId: "py.mc.m1_2.l4",
    atomId: "py.atom.ml.chain-rule",
    conceptId: "py.ml.chain-rule",
    title: "The chain rule follows connected causes",
    requires: ["py.ml.partials-gradient"],
    vocabulary: [
      ["composition", "a function whose output becomes another function's input"],
      ["intermediate value", "a named result between the original input and final output"],
      ["local derivative", "the slope across one small link in a computation"],
      ["chain rule", "multiplying local derivatives along a path of dependence"],
    ],
    opening: "A model is a chain of small calculations. A weight changes a score. The score changes a prediction. The prediction changes the loss. The chain rule measures the full effect by following that path backward.",
    outcome: "You will be able to break a nested function into steps, compute each local derivative, and multiply them to find the original input's effect on the final output.",
    why: "Backpropagation is the chain rule organized for a large computation graph. If the small three-step version is clear, a deep network becomes many copies of the same idea.",
    mentalModel: "Picture connected gears. Turning the first gear affects the second, which affects the third. The total speed ratio is found by multiplying the ratio at each connection.",
    firstTitle: "Name every step before differentiating",
    firstIntro: "Let x create `u = 2x + 1`, then square u to create y. We keep the links separate before multiplying their slopes.",
    firstCode: `def forward(x):
    u = 2 * x + 1
    y = u ** 2
    return u, y

x = 3.0
u, y = forward(x)
dy_du = 2 * u
du_dx = 2.0
dy_dx = dy_du * du_dx
print(u, y, dy_du, du_dx, dy_dx)`,
    firstTrace: "At x equals three, u equals seven and y equals forty-nine. The outer square has local derivative fourteen. The inner line has derivative two. Multiplying gives twenty-eight, which is the total derivative of y with respect to x.",
    secondTitle: "Backpropagate through a tiny prediction and loss",
    secondIntro: "A weight creates a prediction. The prediction creates squared error. We start at the loss and send its sensitivity backward.",
    secondCode: `weight = 2.0
feature = 3.0
target = 10.0

prediction = weight * feature
loss_value = (prediction - target) ** 2

dloss_dprediction = 2 * (prediction - target)
dprediction_dweight = feature
dloss_dweight = dloss_dprediction * dprediction_dweight
print(prediction, loss_value, dloss_dweight)`,
    secondTrace: "The prediction is six and the loss is sixteen. The loss-to-prediction derivative is negative eight. The prediction-to-weight derivative is three. Their product is negative twenty-four, so increasing the weight slightly should reduce loss.",
    mistake: "Do not add derivatives along a single chain. Multiply along one path. Addition is used when several separate paths carry influence from the same variable to the final output.",
    checkpoint: "If `a = 3x`, `b = a + 4`, and `y = b^2`, what three local derivatives connect x to y?",
    checkpointAnswer: "They are `da/dx = 3`, `db/da = 1`, and `dy/db = 2b`. Multiply them to get `dy/dx = 6b`. The current forward value of b is needed before evaluating the derivative.",
    remember: "Write the forward steps, find each local derivative, then multiply backward along every path that connects the input to the output.",
    checks: [
      q("What do you do with derivatives along one chain?", ["Multiply them", "Ignore the inner ones", "Always add them"], 0, "Each link scales the sensitivity passed through it.", ["Correct. This is the chain rule.", "Every dependent link contributes.", "Addition combines separate paths, not links in one path."]),
      q("Why save intermediate values during a forward pass?", ["Backward formulas often need their current values", "They remove all derivatives", "They make the loss constant"], 0, "Local derivatives are evaluated at the values produced forward.", ["Correct. Backprop reuses those values.", "The values help compute derivatives.", "A saved value does not freeze the loss."]),
    ],
  },
  {
    lessonId: "py.mc.m1_2.l5",
    atomId: "py.atom.ml.jacobians-hessians",
    conceptId: "py.ml.jacobians-hessians",
    title: "Jacobians and Hessians organize many derivatives",
    requires: ["py.ml.chain-rule"],
    vocabulary: [
      ["Jacobian", "a first-derivative matrix for a function with several outputs"],
      ["Hessian", "a second-derivative matrix for a function with one output"],
      ["curvature", "how quickly slope changes as position changes"],
      ["cross-partial", "how one gradient component changes when a different input changes"],
    ],
    opening: "A gradient handles many inputs and one output. Some functions return many outputs. A Jacobian records how each output reacts to each input. A Hessian records how a gradient changes.",
    outcome: "You will be able to read Jacobian and Hessian shapes, compute small examples, and explain why curvature affects safe step sizes.",
    why: "Jacobians describe layers, coordinate transforms, and vector predictions. Hessians describe loss curvature. Full Hessians are often too large, but their meaning explains optimization behavior.",
    mentalModel: "A Jacobian is a control panel. Each row is an output gauge. Each column is an input knob. A Hessian is a map of how the surface bends.",
    firstTitle: "Build a two-by-two Jacobian",
    firstIntro: "This function accepts x and y, then returns two outputs. Each Jacobian row belongs to one output. Each column belongs to one input.",
    firstCode: `def vector_function(x, y):
    return [x * y, x + y ** 2]

def jacobian(x, y):
    return [
        [y, x],
        [1.0, 2 * y],
    ]

print(vector_function(2.0, 3.0))
print(jacobian(2.0, 3.0))`,
    firstTrace: "The first output is x times y, so its derivatives are y and x. The second output is x plus y squared, so its derivatives are one and two y. Two outputs and two inputs create a two-by-two Jacobian.",
    secondTitle: "Read curvature from a Hessian",
    secondIntro: "For a quadratic bowl, the Hessian is constant. Larger diagonal values mean the bowl bends more sharply along that coordinate.",
    secondCode: `def bowl(x, y):
    return 3 * x ** 2 + x * y + y ** 2

def bowl_gradient(x, y):
    return [6 * x + y, x + 2 * y]

def bowl_hessian():
    return [[6.0, 1.0], [1.0, 2.0]]

print(bowl(1.0, 2.0))
print(bowl_gradient(1.0, 2.0))
print(bowl_hessian())`,
    secondTrace: "The diagonal entries six and two describe direct curvature. The off-diagonal ones come from the x-y interaction. Changing either input also changes the other input's slope.",
    mistake: "Do not confuse a Jacobian with one gradient. A Jacobian has one gradient row per output. Also do not confuse a large slope with large curvature. They measure different things.",
    checkpoint: "A function maps a length-five input to a length-three output. What is the Jacobian shape? If a scalar loss uses five inputs, what is its Hessian shape?",
    checkpointAnswer: "The Jacobian is three-by-five: one row per output and one column per input. The scalar loss Hessian is five-by-five because it compares every pair of input directions.",
    remember: "A Jacobian organizes first derivatives from many inputs to many outputs. A Hessian organizes second derivatives and describes local curvature of a scalar surface.",
    checks: [
      q("What is the Jacobian shape for 4 outputs and 7 inputs?", ["4 by 7", "7 by 7", "4 by 4"], 0, "Rows follow outputs and columns follow inputs.", ["Correct. Each cell links one output to one input.", "That could be a seven-input Hessian.", "That ignores the seven inputs."]),
      q("What does a Hessian measure?", ["How the gradient changes", "Only the function value", "The number of training examples"], 0, "Second derivatives describe changing slope and curvature.", ["Correct. It is a derivative of the gradient.", "Function height is not curvature.", "Dataset size is unrelated to Hessian definition."]),
    ],
  },
  {
    lessonId: "py.mc.m1_2.l6",
    atomId: "py.atom.ml.matrix-calculus",
    conceptId: "py.ml.matrix-calculus",
    title: "Matrix calculus keeps shapes attached",
    requires: ["py.ml.jacobians-hessians"],
    vocabulary: [
      ["scalar loss", "one number that summarizes model error"],
      ["parameter vector", "an ordered collection of trainable numbers"],
      ["shape check", "verifying that a derivative matches the variable it describes"],
      ["quadratic form", "a scalar expression shaped like x transpose A x"],
    ],
    opening: "Machine-learning formulas often differentiate vectors and matrices at once. The safest way to learn this is not memorizing a wall of identities. Start with coordinates, track shapes, and rebuild the compact formula.",
    outcome: "You will be able to derive the gradient of a dot-product prediction and a squared-error loss while checking every vector's meaning and shape.",
    why: "Linear regression, neural layers, attention, and regularization all use matrix-shaped parameters. Shape-aware derivatives prevent silent transposes and explain the formulas libraries compute automatically.",
    mentalModel: "Every variable carries a labeled container. A scalar uses one box. A vector uses a row of boxes. A matrix uses a grid. Its derivative must return instructions that fit the same trainable container.",
    firstTitle: "Differentiate a dot-product prediction",
    firstIntro: "Prediction is `weights dot features`. Changing one weight affects only the matching feature term, so the prediction gradient equals the feature vector.",
    firstCode: `def dot(left, right):
    return sum(a * b for a, b in zip(left, right))

weights = [0.5, -1.0, 2.0]
features = [4.0, 3.0, 1.0]
prediction = dot(weights, features)
dprediction_dweights = features[:]

print(prediction)
print(dprediction_dweights)`,
    firstTrace: "The prediction is one. Increasing the first weight by a tiny amount changes prediction about four times that amount. The three-entry gradient matches the three-entry weight vector.",
    secondTitle: "Continue through squared error",
    secondIntro: "The chain rule multiplies the scalar loss derivative by the prediction gradient. The result has one update instruction per weight.",
    secondCode: `target = 5.0
error = prediction - target
loss_value = error ** 2

dloss_dprediction = 2 * error
dloss_dweights = [
    dloss_dprediction * feature
    for feature in features
]

print(loss_value)
print(dloss_dweights)`,
    secondTrace: "The error is negative four, so the loss-to-prediction derivative is negative eight. Multiplying by features gives `[-32,-24,-8]`. The gradient has the same shape as weights and says how each coordinate locally affects loss.",
    mistake: "Do not accept a derivative whose shape cannot match its variable. A scalar loss differentiated with respect to a length-three weight vector must produce three numbers, not one unexplained scalar.",
    checkpoint: "A weight matrix has shape two-by-three and the loss is scalar. What shape must the loss gradient with respect to that matrix have?",
    checkpointAnswer: "It must be two-by-three, matching the parameter matrix. Every trainable entry needs its own partial derivative. Batches may be summed or averaged before this final matching shape appears.",
    remember: "Expand a compact expression when unsure, apply ordinary derivatives coordinate by coordinate, and require the final parameter gradient to match the parameter's shape.",
    checks: [
      q("What shape is the gradient of a scalar loss with respect to 8 weights?", ["Length 8", "One scalar", "Eight by eight"], 0, "Each weight needs one partial derivative.", ["Correct. The gradient matches the parameter vector.", "One loss still depends on eight coordinates.", "An eight-by-eight object would be a Hessian."]),
      q("Why is the gradient of w dot x with respect to w equal to x?", ["Each weight multiplies its matching feature", "All weights equal the features", "Dot products have no derivatives"], 0, "Coordinate i contributes w_i times x_i.", ["Correct. Differentiating that term leaves x_i.", "Values can differ; the derivative relationship still holds.", "Dot products are differentiable."]),
    ],
  },
  {
    lessonId: "py.mc.m1_2.l7",
    atomId: "py.atom.ml.taylor-approximations",
    conceptId: "py.ml.taylor-approximations",
    title: "Taylor approximations make a local model",
    requires: ["py.ml.matrix-calculus"],
    vocabulary: [
      ["approximation", "a simpler value that is close enough within a stated region"],
      ["linear approximation", "a tangent-line estimate using value and first derivative"],
      ["Taylor approximation", "a local polynomial built from derivatives at one point"],
      ["remainder", "the error left after truncating the Taylor series"],
    ],
    opening: "A curved function can be difficult globally but simple near one point. Taylor's idea is to match the function's current height, slope, and sometimes curvature with a small polynomial.",
    outcome: "You will be able to construct first- and second-order local approximations, use them for nearby predictions, and state why distance from the expansion point matters.",
    why: "Gradient descent uses a first-order local picture. Newton-style methods add curvature for a second-order picture. Many optimization guarantees begin by bounding the error of these local models.",
    mentalModel: "Zoom into a smooth curve until it looks like a straight road. Zoom out slightly and a bending road fits better. The tangent line uses slope; the quadratic model also uses curvature.",
    firstTitle: "Build a tangent-line estimate",
    firstIntro: "Near x equals one, estimate x squared with its value and slope at one.",
    firstCode: `def square(x):
    return x ** 2

center = 1.0
value_at_center = square(center)
slope_at_center = 2 * center

def linear_approximation(x):
    return value_at_center + slope_at_center * (x - center)

for x in [1.01, 1.2, 2.0]:
    print(x, square(x), linear_approximation(x))`,
    firstTrace: "At `1.01`, the estimate is extremely close. At `1.2`, the gap is visible. At two, the tangent predicts three while the true value is four. The model is local, so farther points usually have larger remainder.",
    secondTitle: "Add curvature for a second-order estimate",
    secondIntro: "For the exponential function near zero, value, slope, and second derivative all equal one. The quadratic approximation is `1 + x + x^2/2`.",
    secondCode: `from math import exp

def exp_second_order(x):
    return 1 + x + (x ** 2) / 2

for x in [0.1, 0.5, 1.0]:
    print(x, round(exp(x), 6), round(exp_second_order(x), 6))`,
    secondTrace: "The quadratic estimate is close at `0.1`, reasonable at `0.5`, and rougher at one. The second-order term captures bending that a tangent line misses, but ignored higher-order terms still matter.",
    mistake: "Do not treat a Taylor approximation as an exact global replacement. It is built around one center. Always ask how far the input moved and whether higher derivatives can grow quickly.",
    checkpoint: "What information does a second-order Taylor approximation use that a first-order approximation leaves out?",
    checkpointAnswer: "It uses second derivatives, or the Hessian for many inputs. This adds local curvature to the current value and slope. It can improve nearby predictions but costs more to compute and store.",
    remember: "Taylor approximations replace a smooth function near one point with a polynomial that matches its value, slope, and optionally curvature.",
    checks: [
      q("Why is a tangent-line estimate usually best near its center?", ["Ignored curvature has had little distance to accumulate", "The derivative becomes exactly zero", "Every function is globally linear"], 0, "The remainder often grows with distance.", ["Correct. Local information is most reliable locally.", "The center can have any slope.", "Most ML losses are not globally linear."]),
      q("What does a second-order approximation add?", ["Curvature", "Training data", "A random direction"], 0, "Second derivatives describe bending.", ["Correct. In many dimensions this uses the Hessian.", "The approximation uses function derivatives.", "Its terms are determined, not random."]),
    ],
  },
  {
    lessonId: "py.mc.m1_2.l8",
    atomId: "py.atom.ml.convexity",
    conceptId: "py.ml.convexity",
    title: "Convexity removes bad valleys",
    requires: ["py.ml.taylor-approximations"],
    vocabulary: [
      ["convex function", "a bowl-shaped function whose chord height is never smaller than its graph"],
      ["local minimum", "a point no nearby point improves"],
      ["global minimum", "a point no point anywhere improves"],
      ["stationary point", "a differentiable point whose gradient is zero"],
    ],
    opening: "Optimization is easier with one broad bowl than with misleading valleys. Convexity gives that promise. Any local minimum of a convex function is globally best.",
    outcome: "You will be able to recognize basic convex functions, test the chord idea, and explain what convexity does and does not guarantee for optimization.",
    why: "Linear regression with squared loss and logistic regression have convex objectives under common setups. Deep neural networks usually do not. Knowing the difference changes what guarantees we can honestly make.",
    mentalModel: "Stretch a string between any two points on a bowl. For a convex function, the string never cuts through the bowl. A hidden hill between two low points breaks that rule.",
    firstTitle: "Check the chord inequality",
    firstIntro: "A weighted midpoint between two inputs should not have a function value above the same weighted average of endpoint values.",
    firstCode: `def square(x):
    return x ** 2

left = -2.0
right = 4.0
mix = 0.25
middle = mix * left + (1 - mix) * right

function_middle = square(middle)
chord_height = mix * square(left) + (1 - mix) * square(right)
print(middle, function_middle, chord_height)
print(function_middle <= chord_height)`,
    firstTrace: "The mixed input is `2.5`. Its squared value is `6.25`. The matching point on the chord has height thirteen. The function value is smaller, which agrees with x squared being convex.",
    secondTitle: "Contrast a non-convex landscape",
    secondIntro: "This double-well function has two valleys with a hill between them. A starting point can change which valley descent reaches.",
    secondCode: `def double_well(x):
    return (x ** 2 - 1) ** 2

def double_well_derivative(x):
    return 4 * x * (x ** 2 - 1)

for start in [-2.0, 0.2, 2.0]:
    x = start
    for _ in range(40):
        x -= 0.05 * double_well_derivative(x)
    print(start, round(x, 4), round(double_well(x), 6))`,
    secondTrace: "Starts on different sides move toward different minima near negative one or positive one. The example has equally good valleys, but non-convex functions can also contain worse local minima, saddles, and flat regions.",
    mistake: "Do not say convex means easy in every practical sense. A convex problem may still be huge, poorly conditioned, constrained, or noisy. Convexity mainly removes misleading local minima from the objective landscape.",
    checkpoint: "If a differentiable convex function has gradient zero at a point, what can you conclude?",
    checkpointAnswer: "That point is a global minimum, though the minimum may not be unique. The convex bowl cannot hide a lower valley somewhere else. Without convexity, a zero gradient could also mark a maximum or saddle.",
    remember: "Convexity turns every local minimum into a global minimum. It gives strong landscape guarantees, but not automatic speed, uniqueness, or numerical stability.",
    checks: [
      q("What is special about a local minimum of a convex function?", ["It is also global", "It must equal zero", "It is always unique"], 0, "A convex landscape has no better hidden valley.", ["Correct. Local optimality is enough.", "Minimum value can be any number.", "Flat convex regions can have many minimizers."]),
      q("Why are neural-network losses usually called non-convex?", ["Their parameter landscapes can contain complex bends and multiple basins", "They contain no derivatives", "They always increase"], 0, "Composed layers create a complicated parameter surface.", ["Correct. Convex global guarantees do not directly apply.", "They are commonly differentiable almost everywhere.", "Training aims to decrease them."]),
    ],
  },
  {
    lessonId: "py.mc.m1_2.l9",
    atomId: "py.atom.ml.constrained-optimization",
    conceptId: "py.ml.constrained-optimization",
    title: "Constrained optimization respects boundaries",
    requires: ["py.ml.convexity"],
    vocabulary: [
      ["constraint", "a rule that limits which candidate solutions are allowed"],
      ["feasible", "satisfying every constraint"],
      ["Lagrange multiplier", "a number that balances objective improvement against one constraint"],
      ["KKT conditions", "first-order conditions for many constrained optimization problems"],
    ],
    opening: "Real problems rarely allow every answer. Probabilities must sum to one. Budgets cannot be exceeded. Norms may be limited. Constrained optimization searches for the best answer only inside the allowed region.",
    outcome: "You will be able to distinguish objective from constraint, find a tiny boundary optimum, and explain the core intuition behind Lagrange multipliers and KKT conditions.",
    why: "Constraints appear in probability distributions, regularized models, resource allocation, fairness requirements, and safe control. They change both the answer and the method used to find it.",
    mentalModel: "Imagine descending a hill inside a fenced park. You move downhill freely until the fence blocks that direction. At the best boundary point, the hill's pull and the fence's push balance.",
    firstTitle: "Search only feasible candidates",
    firstIntro: "Minimize squared distance to the point `[3,2]` while requiring x plus y to equal one. A simple loop makes the allowed line visible.",
    firstCode: `def objective(x, y):
    return (x - 3) ** 2 + (y - 2) ** 2

best = None
for step in range(-200, 301):
    x = step / 100
    y = 1 - x
    candidate = (objective(x, y), x, y)
    if best is None or candidate < best:
        best = candidate

print(best)`,
    firstTrace: "Every tested point is feasible because y is set to one minus x. The best point is near `[1,0]`. The unconstrained minimum `[3,2]` is better for the objective but forbidden because its coordinates sum to five.",
    secondTitle: "See the multiplier as a balancing force",
    secondIntro: "For equality `x + y - 1 = 0`, the constraint gradient is `[1,1]`. At the optimum, the objective gradient must point along that normal direction.",
    secondCode: `x, y = 1.0, 0.0
objective_gradient = [2 * (x - 3), 2 * (y - 2)]
constraint_gradient = [1.0, 1.0]

multiplier = 4.0
balanced = [
    objective_gradient[i] + multiplier * constraint_gradient[i]
    for i in range(2)
]

print(objective_gradient)
print(balanced)`,
    secondTrace: "The objective gradient is `[-4,-4]`. Adding four times the constraint gradient gives `[0,0]`. Feasible sideways motion cannot improve the objective because the remaining downhill pull points directly through the boundary.",
    mistake: "Do not optimize first and check constraints afterward. The unconstrained answer may be illegal. Also do not treat KKT as magic; feasibility, gradient balance, and inequality-specific conditions must all be checked.",
    checkpoint: "Why can the constrained optimum have a nonzero objective gradient?",
    checkpointAnswer: "The gradient may point toward an infeasible direction. At a boundary optimum, no allowed move reduces the objective even though an illegal move could. Constraint gradients balance that blocked objective direction.",
    remember: "A constrained solution must be feasible and locally unbeatable by allowed moves. Multipliers express how constraint boundaries balance the objective's gradient.",
    checks: [
      q("What does feasible mean?", ["All constraints are satisfied", "The objective equals zero", "The gradient has one entry"], 0, "Feasibility is about obeying the allowed-region rules.", ["Correct. Only feasible candidates can be solutions.", "An optimum need not have zero value.", "Gradient size follows parameter count."]),
      q("What does a Lagrange multiplier help express?", ["Balance between objective and constraint gradients", "A random learning rate", "The number of dataset rows"], 0, "At a constrained optimum, boundary forces can block descent.", ["Correct. It weights a constraint's normal direction.", "It is determined by optimality conditions.", "Dataset size is unrelated."]),
    ],
  },
];

export const ML_CALCULUS_ATOMS = ML_CALCULUS_SPECS.map(guidedMasteryAtom);
export const ML_CALCULUS_CONCEPTS = ML_CALCULUS_SPECS.map(guidedMasteryConcept);
export const ML_CALCULUS_LESSON_CONTENT = guidedLessonContent(ML_CALCULUS_SPECS);

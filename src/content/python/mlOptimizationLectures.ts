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

const ML_OPTIMIZATION_SPECS: GuidedMasterySpec[] = [
  {
    lessonId: "py.mc.m4_3.l1",
    atomId: "py.atom.ml.gradient-descent-variants",
    conceptId: "py.ml.gradient-descent-variants",
    title: "Batch, stochastic and mini-batch descent",
    requires: ["py.ml.training-loop"],
    vocabulary: [
      ["batch gradient descent", "one update computed from the entire training set"],
      ["stochastic gradient descent", "one update computed from a single example"],
      ["mini-batch", "a small group of examples averaged into one update"],
      ["gradient noise", "the variation in the gradient caused by using a sample rather than everything"],
    ],
    opening: "There is only one update rule in this whole subject: step against the gradient. Everything that follows is a question about how much data you looked at before taking that step, and how much you trusted what you saw.",
    outcome: "You will compare the three sampling regimes on the same problem and explain the trade between update quality and update count.",
    why: "Batch size is a knob you will set on every project, and it silently controls both the speed of an epoch and the noise in each step. Knowing which of those you are trading for is what makes the choice deliberate.",
    mentalModel: "Imagine finding the lowest point in a foggy valley. Surveying the whole valley before each step is accurate and slow. Taking one measurement and stepping immediately is fast and drunken. A handful of measurements gets most of the accuracy for a fraction of the effort.",
    firstTitle: "The same problem, three sampling regimes",
    firstIntro: "Only the number of examples averaged into each update changes between them.",
    firstCode: `points = [(1.0, 3.0), (2.0, 5.0), (3.0, 7.0), (4.0, 9.0), (5.0, 11.0)]

def descend(points, size, steps, rate):
    weight, bias = 0.0, 0.0
    cursor = 0
    for _ in range(steps):
        batch = [points[(cursor + i) % len(points)] for i in range(size)]
        cursor = (cursor + size) % len(points)
        gw = sum(2 * (weight * x + bias - y) * x for x, y in batch) / size
        gb = sum(2 * (weight * x + bias - y) for x, y in batch) / size
        weight -= rate * gw
        bias -= rate * gb
    return round(weight, 3), round(bias, 3)

print("batch     ", descend(points, 5, 400, 0.02))
print("mini-batch", descend(points, 2, 400, 0.02))
print("stochastic", descend(points, 1, 400, 0.02))`,
    firstTrace: "All three approach a weight of two and a bias of one, which is the line the data came from. The batch version moves smoothly because every step uses the full picture. The single-example version wanders, because each step trusts one point completely.",
    secondTitle: "Noise is the price, and it is sometimes worth paying",
    secondIntro: "Measuring how far a one-example gradient sits from the true gradient makes the trade concrete.",
    secondCode: `points = [(1.0, 3.0), (2.0, 5.0), (3.0, 7.1), (4.0, 8.8), (5.0, 11.0)]
weight, bias = 1.0, 0.0

def slope(batch):
    n = len(batch)
    return sum(2 * (weight * x + bias - y) * x for x, y in batch) / n

true_slope = slope(points)
print("full-set gradient:", round(true_slope, 3))
for size in (1, 2, 3, 5):
    windows = [points[start:start + size]
               for start in range(len(points) - size + 1)]
    errors = [abs(slope(w) - true_slope) for w in windows]
    print(f"size {size}: average error {sum(errors) / len(errors):.2f}")`,
    secondTrace: "A single example disagrees sharply with the full-set gradient, and averaging more of them pulls the estimate steadily back toward it. The full set has no error at all, since it is the thing being estimated. In general the noise falls with the square root of the batch size, so quadrupling the batch halves it, and that diminishing return is why very large batches stop being worth their cost.",
    mistake: "Do not raise the batch size and leave the learning rate alone, expecting the same behaviour. A larger batch gives a cleaner gradient, which usually supports a larger step, and keeping the old rate wastes most of the accuracy you just paid for.",
    checkpoint: "Two runs process the same number of examples, one with batch size 32 and one with batch size 512. Which takes more parameter updates?",
    checkpointAnswer: "The batch size of thirty-two, by a factor of sixteen. It takes sixteen times as many steps over the same data, each one noisier, which is why small batches often make faster progress early even though each individual step is less accurate.",
    remember: "One rule, three sample sizes. Larger batches give cleaner gradients and fewer updates, smaller batches give noisier gradients and many more, and the noise falls with the square root of the batch size.",
    checks: [
      q("What does increasing the batch size do to the gradient estimate?", ["Reduces its noise, roughly with the square root of the size", "Changes the direction it points on average", "Removes the need for a learning rate"], 0, "Averaging more samples tightens the estimate.", ["Correct. Quadrupling the batch roughly halves the noise.", "The average direction is the same either way.", "The step size still has to be chosen."]),
      q("Why do small batches often make faster early progress?", ["They take far more updates over the same data", "Their gradients are more accurate", "They avoid local minima entirely"], 0, "Update count matters as much as update quality.", ["Correct. Many rough steps can beat few precise ones.", "Small batches are noisier, not more accurate.", "No batch size guarantees that."]),
      q("You increase batch size fourfold. What usually needs to change too?", ["The learning rate, upward", "The loss function", "The number of layers"], 0, "A cleaner gradient supports a larger step.", ["Correct. Leaving it alone wastes the extra accuracy.", "The loss is set by the task.", "Architecture is independent of batch size."]),
    ],
  },
  {
    lessonId: "py.mc.m4_3.l2",
    atomId: "py.atom.ml.momentum",
    conceptId: "py.ml.momentum",
    title: "Momentum damps oscillation and builds speed",
    requires: ["py.ml.gradient-descent-variants"],
    vocabulary: [
      ["velocity", "a running average of recent gradients that the update follows"],
      ["ravine", "a surface that is steep across one direction and shallow along another"],
      ["oscillation", "repeated overshooting back and forth across a narrow valley"],
      ["lookahead gradient", "a gradient measured at the point the velocity is about to reach"],
    ],
    opening: "Plain descent has a specific failure that shows up constantly. On a surface that is steep in one direction and nearly flat in another, it bounces across the steep direction while barely moving along the flat one.",
    outcome: "You will implement momentum, watch it cancel oscillation, and explain what the Nesterov variant measures differently.",
    why: "Almost every real loss surface has this shape, and momentum is the cheapest fix. It is also the component every adaptive optimizer keeps, so understanding it is a prerequisite for understanding all of them.",
    mentalModel: "Picture a ball rolling down a narrow gully rather than a hiker taking discrete steps. Sideways bounces cancel each other out over consecutive moves, while the gentle downhill component accumulates into real speed.",
    firstTitle: "A ravine defeats plain descent",
    firstIntro: "A surface hundreds of times steeper across than along is enough to show it.",
    firstCode: `def run(momentum, rate=0.09, steps=25):
    x, y = 1.0, 1.0
    vx, vy = 0.0, 0.0
    crossings = 0
    for _ in range(steps):
        gx, gy = 20.0 * x, 0.05 * y
        vx = momentum * vx - rate * gx
        vy = momentum * vy - rate * gy
        if x * (x + vx) < 0:
            crossings += 1
        x, y = x + vx, y + vy
    return round(x, 4), round(y, 4), crossings

print("plain   ", run(0.0))
print("momentum", run(0.9))`,
    firstTrace: "Plain descent crosses the steep axis repeatedly while the shallow coordinate barely moves from one. Momentum crosses far less and drives the shallow coordinate much closer to zero in the same twenty-five steps. The sideways gradients keep reversing sign, so they cancel inside the velocity.",
    secondTitle: "Nesterov measures the gradient where it is going",
    secondIntro: "The change is small: apply the velocity first, then take the gradient at that point.",
    secondCode: `def compare(steps=20, rate=0.05, momentum=0.9):
    classic = (2.0, 0.0)
    nesterov = (2.0, 0.0)
    for _ in range(steps):
        x, v = classic
        v = momentum * v - rate * (2.0 * x)
        classic = (x + v, v)

        x, v = nesterov
        peek = x + momentum * v
        v = momentum * v - rate * (2.0 * peek)
        nesterov = (x + v, v)
    return round(classic[0], 5), round(nesterov[0], 5)

print("classic, nesterov:", compare())`,
    secondTrace: "Both converge toward zero, and the lookahead version arrives with less overshoot. Measuring the slope at the point the velocity is already carrying you toward lets the update start braking one step sooner. On a well-behaved surface that correction is small, and on a sharply curved one it is the difference between settling and ringing.",
    mistake: "Do not push the momentum coefficient toward one and leave the learning rate unchanged. A coefficient of zero point nine nine gives an effective step roughly a hundred times the rate, so a value that was stable at zero point nine will diverge immediately.",
    checkpoint: "Why do the sideways components cancel in the velocity while the forward component grows?",
    checkpointAnswer: "The sideways gradient reverses sign on nearly every step, so consecutive contributions subtract from each other inside the running average. The forward gradient keeps the same sign, so its contributions add up and the velocity along that direction steadily grows.",
    remember: "Momentum accumulates a velocity from recent gradients, which cancels oscillation and builds speed along consistent directions. Nesterov measures the gradient after the velocity is applied, which reduces overshoot.",
    checks: [
      q("What does momentum do on a steep-across, shallow-along surface?", ["Cancels the sideways oscillation and accumulates forward speed", "Reduces the learning rate automatically", "Rescales each coordinate independently"], 0, "Sign-reversing components cancel in the running average.", ["Correct. That is the whole reason it helps.", "The rate is unchanged by momentum.", "Per-coordinate rescaling is what adaptive methods do."]),
      q("How does Nesterov differ from classic momentum?", ["It evaluates the gradient after applying the velocity", "It uses a larger coefficient", "It stores two velocities"], 0, "The lookahead point is the only change.", ["Correct. That lets it brake a step earlier.", "The coefficient is chosen the same way.", "One velocity is enough."]),
      q("You raise momentum from 0.9 to 0.99. What else should change?", ["The learning rate, downward", "The batch size, upward", "Nothing"], 0, "The effective step scales with one over one minus the coefficient.", ["Correct. The effective step grows by about tenfold.", "Batch size is a separate concern.", "Leaving the rate alone will usually diverge."]),
    ],
  },
  {
    lessonId: "py.mc.m4_3.l3",
    atomId: "py.atom.ml.adaptive-optimizers",
    conceptId: "py.ml.adaptive-optimizers",
    title: "Adaptive methods give every parameter its own step",
    requires: ["py.ml.momentum"],
    vocabulary: [
      ["per-parameter rate", "an effective step size that differs from one weight to another"],
      ["second moment", "a running average of squared gradients, used to measure typical magnitude"],
      ["bias correction", "rescaling an average that started at zero so early steps are not too small"],
      ["decoupled decay", "applying weight decay directly rather than through the gradient"],
    ],
    opening: "Two parameters can have gradients that differ by orders of magnitude, and a single learning rate has to serve both. Adaptive methods solve that by dividing each update by a running measure of how large that parameter's gradients usually are.",
    outcome: "You will trace AdaGrad, RMSProp and Adam as three answers to the same question, and explain what AdamW changes about weight decay.",
    why: "Adam is the default in most codebases, and its failure modes only make sense once you know what its two running averages hold. AdamW is now standard for transformers, and the difference is one line.",
    mentalModel: "Think of a sound mixer normalizing every channel to the same loudness before combining them. A quiet channel is amplified and a loud one is attenuated, so no single one dominates the mix.",
    firstTitle: "Three ways to accumulate the second moment",
    firstIntro: "The family differs almost entirely in how the running average of squared gradients decays.",
    firstCode: `import math

def adagrad(grads, rate=0.5):
    total, x = 0.0, 0.0
    for g in grads:
        total += g * g
        x -= rate * g / (math.sqrt(total) + 1e-8)
    return round(x, 4)

def rmsprop(grads, rate=0.5, decay=0.9):
    average, x = 0.0, 0.0
    for g in grads:
        average = decay * average + (1 - decay) * g * g
        x -= rate * g / (math.sqrt(average) + 1e-8)
    return round(x, 4)

steady = [1.0] * 30
print("adagrad on a steady gradient:", adagrad(steady))
print("rmsprop on a steady gradient:", rmsprop(steady))`,
    firstTrace: "AdaGrad sums every squared gradient it has ever seen, so its denominator only grows and the effective step decays toward nothing. RMSProp forgets, keeping an exponential average instead, so a steady gradient produces a steady step. That single change is what makes it usable on long runs.",
    secondTitle: "Adam combines both moments, then corrects the bias",
    secondIntro: "One running average for the gradient itself, one for its square, and a correction because both started at zero.",
    secondCode: `import math

def adam(grads, rate=0.1, b1=0.9, b2=0.999, eps=1e-8):
    m, v, x = 0.0, 0.0, 0.0
    for step, g in enumerate(grads, start=1):
        m = b1 * m + (1 - b1) * g
        v = b2 * v + (1 - b2) * g * g
        m_hat = m / (1 - b1 ** step)
        v_hat = v / (1 - b2 ** step)
        x -= rate * m_hat / (math.sqrt(v_hat) + eps)
        if step in (1, 2, 30):
            print(f"step {step:>2}: raw m {m:.4f} corrected {m_hat:.4f} x {x:.4f}")
    return x

adam([1.0] * 30)`,
    secondTrace: "On the first step the raw average of the gradient is only one tenth of its true value, because it started at zero. The squared average is biased low as well, and it sits under a square root, so the two biases do not cancel. Correcting both keeps the first update at its intended size instead of roughly three times that.",
    mistake: "Do not add weight decay into the gradient when using Adam. The adaptive denominator then rescales the decay differently for every parameter, so parameters with small gradients get penalized far more heavily. AdamW applies the decay directly to the weight instead, which is why it became the default.",
    checkpoint: "Why does AdaGrad stall on a long training run while RMSProp does not?",
    checkpointAnswer: "AdaGrad accumulates every squared gradient without decay, so its denominator grows without bound and the effective step shrinks toward zero. RMSProp uses an exponential average, which forgets old gradients, so the denominator settles at a level reflecting recent behaviour rather than the entire history.",
    remember: "Adaptive methods divide by a running measure of gradient size. AdaGrad never forgets, RMSProp does, Adam adds a momentum term and bias correction, and AdamW decouples weight decay from the gradient.",
    checks: [
      q("Why does AdaGrad's effective step shrink toward zero?", ["Its denominator accumulates every squared gradient without decay", "Its learning rate is scheduled downward", "It uses a smaller momentum"], 0, "The sum only ever grows.", ["Correct. RMSProp fixes exactly this by forgetting.", "No schedule is involved.", "AdaGrad has no momentum term."]),
      q("What is bias correction fixing in Adam?", ["Both running averages read low at first, and their biases do not cancel", "Gradients that point in the wrong direction", "Parameters initialized badly"], 0, "Dividing by one minus the decay to the step power restores each scale.", ["Correct. Uncorrected, the first update is about three times its intended size.", "Direction is not what the correction touches.", "Initialization is a separate concern."]),
      q("What does AdamW change relative to Adam?", ["Weight decay is applied directly instead of through the gradient", "It removes the second moment", "It uses a fixed learning rate"], 0, "Decoupling keeps the decay uniform across parameters.", ["Correct. The adaptive denominator no longer distorts it.", "Both moments are retained.", "Schedules are used with both."]),
    ],
  },
  {
    lessonId: "py.mc.m4_3.l4",
    atomId: "py.atom.ml.learning-rate-schedules",
    conceptId: "py.ml.learning-rate-schedules",
    title: "Schedules and warmup shape the whole run",
    requires: ["py.ml.adaptive-optimizers"],
    vocabulary: [
      ["schedule", "a rule setting the learning rate as a function of the step number"],
      ["warmup", "starting at a small rate and raising it over the first stretch of training"],
      ["cosine decay", "a smooth decay following a half cosine from the peak toward zero"],
      ["step decay", "cutting the rate by a fixed factor at chosen milestones"],
    ],
    opening: "A single learning rate has to be small enough not to diverge at the start and large enough to make progress in the middle. No constant satisfies both, which is why essentially every serious training run varies it over time.",
    outcome: "You will implement warmup and cosine decay, and explain which failure each of the two halves prevents.",
    why: "Warmup is the standard fix for the instability that kills large-batch and transformer training in its first few hundred steps. Decay is what lets a run settle instead of rattling around its optimum forever.",
    mentalModel: "Think of driving an unfamiliar road. You start slowly while you work out where you are, speed up once the route is clear, and slow down again as you approach the destination so you can stop precisely.",
    firstTitle: "Warmup, then decay, as one function of the step",
    firstIntro: "The schedule is a plain function from step number to rate, with no state of its own.",
    firstCode: `import math

def schedule(step, peak=1e-3, warmup=100, total=1000):
    if step < warmup:
        return peak * (step + 1) / warmup
    progress = (step - warmup) / max(1, total - warmup)
    return peak * 0.5 * (1 + math.cos(math.pi * min(1.0, progress)))

for step in (0, 25, 99, 100, 300, 700, 999):
    print(f"step {step:>4}: rate {schedule(step):.6f}")`,
    firstTrace: "The rate climbs linearly for the first hundred steps, peaks at the handover, then follows a half cosine down toward zero. The curve is smooth at the peak, which matters because a sudden jump in rate can undo several hundred steps of progress. Nothing here depends on the loss, so the schedule is fully reproducible.",
    secondTitle: "What each half is actually preventing",
    secondIntro: "Early gradients are unrepresentative, and late-stage steps need to be small enough to settle.",
    secondCode: `import math

def settle(rate_fn, steps=400):
    x = 1.0
    for step in range(steps):
        x -= rate_fn(step) * 2.0 * x
    return round(abs(x), 8)

constant = settle(lambda step: 0.05)
decayed = settle(lambda step: 0.05 * 0.5 * (1 + math.cos(math.pi * step / 400)))
print("constant rate, final distance:", constant)
print("decayed rate, final distance:", decayed)
print("early gradients are noisiest when the weights are still random")`,
    secondTrace: "Both runs reach the optimum, and the decayed one lands closer because its final steps are tiny. With real gradient noise the gap is much wider, since a constant rate keeps bouncing at a radius set by the noise. Warmup addresses the other end, where a large step taken on an unrepresentative gradient can push the weights somewhere training never recovers from.",
    mistake: "Do not set the schedule's total step count and then change the number of epochs without updating it. The cosine will either finish early and train at a rate of zero for a long stretch, or be cut off partway down and never reach its settling phase.",
    checkpoint: "Which specific failure does warmup prevent that decay does not address?",
    checkpointAnswer: "A large early step taken on a gradient measured at random initialization, which is unrepresentative of the loss surface. Adaptive optimizers make this worse, because their second-moment estimates are also unreliable in the first few steps, and warmup keeps the damage bounded until both settle.",
    remember: "Warmup protects the start, decay settles the end. The schedule is a function of the step number alone, and its total must match the run you actually intend to do.",
    checks: [
      q("What is warmup protecting against?", ["Large steps taken on unrepresentative early gradients", "Overfitting late in training", "Vanishing gradients"], 0, "Both the gradient and the optimizer state are unreliable at first.", ["Correct. Adaptive methods make this worse still.", "That is what regularization addresses.", "Warmup does not change gradient flow."]),
      q("Why decay the rate toward the end of a run?", ["Small final steps let the run settle instead of bouncing", "It reduces memory use", "It prevents the gradients from vanishing"], 0, "Noise sets a bouncing radius proportional to the rate.", ["Correct. A smaller rate shrinks that radius.", "Memory is unaffected.", "Decay does not change gradient magnitude."]),
      q("You double the number of epochs but leave the schedule length alone. What happens?", ["The rate reaches zero early and the rest of the run makes no progress", "The rate stays at its peak", "Training diverges"], 0, "The schedule is a function of the step number.", ["Correct. The cosine finishes before the run does.", "It decays as written, regardless of the run length.", "A rate of zero stalls rather than diverges."]),
    ],
  },
  {
    lessonId: "py.mc.m4_3.l5",
    atomId: "py.atom.ml.second-order-methods",
    conceptId: "py.ml.second-order-methods",
    title: "Curvature, and why full second-order methods do not scale",
    requires: ["py.ml.learning-rate-schedules"],
    vocabulary: [
      ["curvature", "how fast the slope itself changes as you move"],
      ["Hessian", "the matrix of all second derivatives of the loss"],
      ["Newton step", "a step that divides the gradient by the curvature"],
      ["condition number", "the ratio between the largest and smallest curvature directions"],
    ],
    opening: "The gradient tells you which way is downhill, and nothing about how far to go. Curvature answers that second question exactly, which is why second-order methods converge in dramatically fewer steps and why nobody uses them at scale.",
    outcome: "You will compare a Newton step against a tuned gradient step, and count the cost that makes the full method impractical.",
    why: "Every practical optimizer is an approximation of this idea, and the language of ill-conditioning comes directly from it. Knowing what the exact method would do explains what Adam is roughly imitating.",
    mentalModel: "Picture standing on a slope in fog. The gradient tells you which way is down. Curvature tells you whether the ground levels off in one metre or in a hundred, which is exactly what decides your stride.",
    firstTitle: "The exact step needs no learning rate",
    firstIntro: "On a quadratic surface, dividing the slope by the curvature lands on the minimum in a single move.",
    firstCode: `def loss(x):
    return 3.0 * (x - 4.0) ** 2 + 1.0

def slope(x):
    return 6.0 * (x - 4.0)

curvature = 6.0
start = 0.0

newton = start - slope(start) / curvature
print("newton, one step:", newton, "loss", loss(newton))

x = start
for _ in range(20):
    x -= 0.1 * slope(x)
print("gradient, twenty steps:", round(x, 6), "loss", round(loss(x), 6))`,
    firstTrace: "One Newton step lands exactly on four, because dividing by the curvature is precisely the right stride for a quadratic. Twenty tuned gradient steps get close and are still approaching. The learning rate disappears entirely, since the curvature supplies the scale that a rate was standing in for.",
    secondTitle: "The cost is quadratic in parameters, and then cubic",
    secondIntro: "Counting the entries of the curvature matrix is enough to see why the exact method stops being an option.",
    secondCode: `def cost(parameters):
    entries = parameters * parameters
    bytes_needed = entries * 4
    return entries, bytes_needed / 1e12

for parameters in (1_000, 1_000_000, 1_000_000_000):
    entries, terabytes = cost(parameters)
    print(f"{parameters:>13,} params -> {entries:.3e} entries, {terabytes:.3e} TB")`,
    secondTrace: "A million parameters already needs a matrix of a trillion entries, which is four terabytes at single precision. Solving with it costs more again, growing with the cube of the parameter count. Practical methods therefore approximate the curvature with a diagonal, which is exactly what the adaptive optimizers are doing.",
    mistake: "Do not read a large condition number as a reason to lower the learning rate alone. A badly conditioned surface needs different strides in different directions, and one global rate has to be safe for the steepest of them, which makes it far too small for all the rest.",
    checkpoint: "Adaptive optimizers keep one running value per parameter. Which part of the curvature matrix is that approximating?",
    checkpointAnswer: "Its diagonal, which is one curvature estimate per parameter with all interactions between parameters discarded. That costs memory proportional to the parameter count rather than its square, and it captures the difference in typical scale between parameters while missing any coupling between them.",
    remember: "Curvature supplies the stride that a learning rate approximates. The full matrix costs the square of the parameter count to store, so practical methods keep only its diagonal.",
    checks: [
      q("What does a Newton step provide that a gradient step does not?", ["The correct distance to move, not just the direction", "A guarantee of finding the global minimum", "Lower memory use"], 0, "Curvature sets the stride.", ["Correct. On a quadratic it lands in one step.", "It still converges to a nearby stationary point.", "It uses dramatically more memory."]),
      q("Why is the full Hessian impractical for large models?", ["Its size grows with the square of the parameter count", "It cannot be computed exactly", "It requires a special loss function"], 0, "A million parameters means a trillion entries.", ["Correct. Solving with it is more expensive still.", "It is exactly computable, just enormous.", "It is defined for any twice-differentiable loss."]),
      q("What does a large condition number tell you?", ["Different directions need very different step sizes", "The gradient is inaccurate", "The model has too many parameters"], 0, "It is the ratio of largest to smallest curvature.", ["Correct. One global rate cannot serve both.", "The gradient is exact; the surface is awkward.", "Conditioning is about shape, not size."]),
    ],
  },
];

export const ML_OPTIMIZATION_ATOMS = ML_OPTIMIZATION_SPECS.map(guidedMasteryAtom);
export const ML_OPTIMIZATION_CONCEPTS = ML_OPTIMIZATION_SPECS.map(guidedMasteryConcept);
export const ML_OPTIMIZATION_LESSON_CONTENT = guidedLessonContent(ML_OPTIMIZATION_SPECS);

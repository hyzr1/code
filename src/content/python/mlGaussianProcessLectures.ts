import {
  guidedLessonContent,
  guidedMasteryAtom,
  guidedMasteryConcept,
  type GuidedMasterySpec,
} from "./guidedMastery";

const ML_GAUSSIAN_PROCESS_SPECS: GuidedMasterySpec[] = [
  {
    lessonId: "py.mc.m11_4.l1",
    atomId: "py.atom.ml.gaussian-processes",
    conceptId: "py.ml.gaussian-processes",
    title: "Gaussian processes",
    requires: ["py.ml.hamiltonian-monte-carlo"],
    vocabulary: [
      ["prior over functions", "a distribution whose draws are whole functions rather than numbers"],
      ["kernel", "a function saying how correlated two inputs' outputs are"],
      ["nonparametric", "having no fixed parameter count, so capacity grows with the data"],
    ],
    opening:
      "Most models put a distribution over parameters. A Gaussian process skips the parameters and puts one directly over functions.",
    outcome:
      "You will compute a posterior mean from a kernel and watch the model fall back to its prior away from the data.",
    why:
      "It is the clearest example of a model that knows what it does not know, because the uncertainty is built into the formulation rather than estimated afterwards.",
    mentalModel:
      "Picture every pair of inputs joined by a correlation. Where the data pins one output down, everything correlated with it is pulled along.",
    firstTitle: "The kernel does the work",
    firstIntro:
      "Nearby inputs are strongly correlated and distant ones barely at all. Solving one linear system turns those correlations into a prediction.",
    firstCode: `import math

def kernel(a, b, length=1.0):
    return math.exp(-0.5 * (a - b) ** 2 / length ** 2)

def posterior_mean(train_x, train_y, x, noise=0.01):
    n = len(train_x)
    rows = [[kernel(a, b) + (noise if i == j else 0.0)
             for j, b in enumerate(train_x)] + [train_y[i]]
            for i, a in enumerate(train_x)]
    for i in range(n):
        pivot = max(range(i, n), key=lambda r: abs(rows[r][i]))
        rows[i], rows[pivot] = rows[pivot], rows[i]
        for r in range(i + 1, n):
            factor = rows[r][i] / rows[i][i]
            for c in range(i, n + 1):
                rows[r][c] -= factor * rows[i][c]
    alpha = [0.0] * n
    for i in range(n - 1, -1, -1):
        alpha[i] = (rows[i][n] - sum(rows[i][c] * alpha[c]
                                     for c in range(i + 1, n))) / rows[i][i]
    return round(sum(kernel(x, train_x[i]) * alpha[i] for i in range(n)), 4)

train_x = [-2.0, -1.0, 0.0, 1.0, 2.0]
train_y = [0.5, 0.9, 0.1, -0.8, -0.4]
for x in (-2.0, -0.5, 0.0, 5.0, 10.0):
    print("x", x, "posterior mean", posterior_mean(train_x, train_y, x))`,
    firstTrace:
      "At a training input the prediction reproduces its value. At five and ten it decays to zero, because nothing there is correlated with anything observed.",
    secondTitle: "Falling back to the prior",
    secondIntro:
      "How much of the prior uncertainty survives depends on how correlated the query is with the nearest observation.",
    secondCode: `for x in (0.0, 0.5, 3.0, 6.0, 20.0):
    nearest = min(abs(x - t) for t in train_x)
    explained = max(kernel(x, t) for t in train_x) ** 2
    print("x", x, "nearest data", nearest,
          "prior variance retained", round(1 - explained, 4))`,
    secondTrace:
      "Zero at an observed point, twenty-two percent half a unit away, and all of it by six. The model reverts to the prior rather than extrapolating confidently.",
    mistake:
      "Reading the posterior mean far from the data as a prediction. It returns to the prior mean - usually zero - so a confident-looking zero out there means no information rather than a forecast.",
    checkpoint:
      "What does a Gaussian process predict a long way from every training point?",
    checkpointAnswer:
      "The prior mean, with the full prior variance. It reports that it knows nothing rather than extrapolating.",
    remember:
      "A distribution over functions, with the kernel supplying the correlations.",
    checks: [
      {
        prompt: "What does a Gaussian process place a distribution over?",
        options: ["Functions", "Parameters", "Datasets"],
        answerIndex: 0,
        hint: "It has no fixed parameter vector.",
        explanations: [
          "Correct, which is what makes it nonparametric.",
          "That is the usual Bayesian approach it replaces.",
          "Data is conditioned on, not modelled.",
        ],
      },
      {
        prompt: "What does the kernel encode?",
        options: [
          "How correlated two inputs' outputs are",
          "The training loss",
          "The parameter count",
        ],
        answerIndex: 0,
        hint: "It is a function of two inputs.",
        explanations: [
          "Correct, and it is the entire modelling assumption.",
          "No loss is minimised here.",
          "There is no fixed parameter count.",
        ],
      },
      {
        prompt: "Far from every observation, what happens to the prediction?",
        options: [
          "It returns to the prior mean with full prior variance",
          "It extrapolates the nearest trend",
          "It becomes undefined",
        ],
        answerIndex: 0,
        hint: "Nothing out there is correlated with the data.",
        explanations: [
          "Correct, and a confident-looking zero means no information.",
          "It does not extrapolate trends.",
          "It remains perfectly well defined.",
        ],
      },
    ],
  },
  {
    lessonId: "py.mc.m11_4.l2",
    atomId: "py.atom.ml.kernel-design",
    conceptId: "py.ml.kernel-design",
    title: "Kernel design and hyperparameters",
    requires: ["py.ml.gaussian-processes"],
    vocabulary: [
      ["length scale", "how far apart two inputs must be before their outputs decorrelate"],
      ["structural kernel", "a kernel encoding a known pattern such as periodicity"],
      ["marginal likelihood", "the objective used to fit kernel hyperparameters"],
    ],
    opening:
      "The kernel is where the modelling happens. A length scale is a claim about how fast the function can change, and a periodic kernel is a claim that it repeats.",
    outcome:
      "You will see the length scale control correlation and a periodic kernel encode a repeat the smooth one cannot.",
    why:
      "Choosing the kernel is choosing the hypothesis space. Fitting hyperparameters afterwards cannot rescue a kernel that assumed the wrong shape.",
    mentalModel:
      "Picture the length scale as the distance over which the function is allowed to forget itself. Short means wiggly; long means nearly flat.",
    firstTitle: "The length scale is a claim",
    firstIntro:
      "Vary it and look at how correlation falls with distance. That decay is exactly what the model believes about smoothness.",
    firstCode: `import math

def rbf(a, b, length):
    return math.exp(-0.5 * (a - b) ** 2 / length ** 2)

for length in (0.1, 1.0, 10.0):
    row = [round(rbf(0.0, d, length), 4) for d in (0.5, 1.0, 3.0)]
    print("length", length, "correlation at 0.5, 1 and 3:", row)`,
    firstTrace:
      "At a length of a tenth everything is uncorrelated beyond half a unit. At ten even a distance of three keeps ninety-six percent, which is nearly a straight line.",
    secondTitle: "Structure the smooth kernel cannot express",
    secondIntro:
      "A periodic kernel makes points a whole period apart perfectly correlated. No length scale on a smooth kernel produces that.",
    secondCode: `def periodic(a, b, period, length=1.0):
    gap = math.pi * abs(a - b) / period
    return math.exp(-2 * math.sin(gap) ** 2 / length ** 2)

for distance in (0.0, 3.5, 7.0, 14.0):
    print("distance", distance,
          "periodic correlation", round(periodic(0.0, distance, 7.0), 4))`,
    secondTrace:
      "Full correlation at zero, seven and fourteen, and a low point half a period in between. The kernel asserts the repeat rather than learning it.",
    mistake:
      "Optimising the length scale on the training data without a check. It can shrink until every point is its own island, which fits perfectly and predicts nothing.",
    checkpoint:
      "A very short length scale fits the training data perfectly. Is that good?",
    checkpointAnswer:
      "No. It has decorrelated every point from every other, so the model memorises the observations and reverts to the prior everywhere else.",
    remember:
      "The kernel is the hypothesis; the hyperparameters only tune it.",
    checks: [
      {
        prompt: "What does the length scale control?",
        options: [
          "How far apart inputs must be before outputs decorrelate",
          "The output magnitude",
          "The noise level",
        ],
        answerIndex: 0,
        hint: "It sets the assumed smoothness.",
        explanations: [
          "Correct. Short means wiggly, long means nearly flat.",
          "That is the scale parameter.",
          "Noise is a separate term.",
        ],
      },
      {
        prompt: "What does a periodic kernel assert?",
        options: [
          "Points a whole period apart are perfectly correlated",
          "The function is smooth",
          "The function is bounded",
        ],
        answerIndex: 0,
        hint: "It encodes a repeat.",
        explanations: [
          "Correct, and a smooth kernel cannot express that.",
          "Smoothness is a separate property.",
          "Boundedness is not encoded.",
        ],
      },
      {
        prompt: "The fitted length scale becomes extremely short. What has happened?",
        options: [
          "Every point is decorrelated from every other, so the model memorises",
          "The model has found real structure",
          "The noise was overestimated",
        ],
        answerIndex: 0,
        hint: "Perfect fit, no generalisation.",
        explanations: [
          "Correct. This is the classic failure of unchecked fitting.",
          "Fine structure and memorisation look the same on training data.",
          "Short length scales usually accompany underestimated noise.",
        ],
      },
    ],
  },
  {
    lessonId: "py.mc.m11_4.l3",
    atomId: "py.atom.ml.bayesian-optimization",
    conceptId: "py.ml.bayesian-optimization",
    title: "Bayesian optimization",
    requires: ["py.ml.kernel-design"],
    vocabulary: [
      ["surrogate", "a cheap model of an expensive function, used to decide where to evaluate"],
      ["acquisition function", "a score ranking candidate points by how useful evaluating them would be"],
      ["exploration", "evaluating where the surrogate is uncertain rather than where it predicts well"],
    ],
    opening:
      "When one evaluation costs a day of compute, the question is not how to optimise but where to spend the next evaluation.",
    outcome:
      "You will score candidates by expected improvement and see uncertainty beat a slightly better prediction.",
    why:
      "A method that always evaluates its current best never discovers anything, and one that ignores its predictions wastes the budget. The acquisition function balances them.",
    mentalModel:
      "Picture each candidate as a mean and a spread. A high mean is promising; a wide spread means there is room to be surprised.",
    firstTitle: "Scoring the candidates",
    firstIntro:
      "Expected improvement weighs how far above the current best a point might land by how likely it is to get there.",
    firstCode: `import math

def expected_improvement(mean, spread, best):
    if spread <= 0:
        return 0.0
    z = (mean - best) / spread
    cdf = 0.5 * (1 + math.erf(z / math.sqrt(2)))
    pdf = math.exp(-0.5 * z * z) / math.sqrt(2 * math.pi)
    return round((mean - best) * cdf + spread * pdf, 5)

best = 0.80
for name, mean, spread in [("exploit", 0.82, 0.01),
                           ("explore", 0.60, 0.30),
                           ("known bad", 0.40, 0.02),
                           ("balanced", 0.78, 0.12)]:
    print(f"{name:10} mean {mean} spread {spread} "
          f"score {expected_improvement(mean, spread, best)}")`,
    firstTrace:
      "The uncertain candidate at point six scores highest, above the confident point eight two. A wide spread is worth more than a small predicted edge.",
    secondTitle: "Certainty kills the score",
    secondIntro:
      "Hold the mean fixed and shrink the spread. The score collapses, because a point you already understand cannot surprise you.",
    secondCode: `for spread in (0.30, 0.10, 0.03, 0.0):
    print("spread", spread,
          "score", expected_improvement(0.60, spread, best))`,
    secondTrace:
      "From point zero four five down to zero. A candidate predicted below the best and known precisely is worth nothing to evaluate.",
    mistake:
      "Using the surrogate's mean as the acquisition function. That evaluates the current best repeatedly, learns nothing new, and converges to whichever point happened to look good first.",
    checkpoint:
      "Why does a candidate with a lower predicted value sometimes score higher?",
    checkpointAnswer:
      "Because its uncertainty is larger, so the chance it lands above the current best outweighs its worse prediction.",
    remember:
      "Score by what you might learn, not by what you already predict.",
    checks: [
      {
        prompt: "What does the acquisition function rank?",
        options: [
          "How useful evaluating a candidate would be",
          "How good a candidate is predicted to be",
          "How cheap a candidate is",
        ],
        answerIndex: 0,
        hint: "Usefulness combines prediction and uncertainty.",
        explanations: [
          "Correct, which is why uncertainty enters it.",
          "That is only the surrogate's mean.",
          "Evaluation cost is usually uniform.",
        ],
      },
      {
        prompt: "A candidate is known precisely and predicted below the best. What is its score?",
        options: ["Essentially zero", "High", "Undefined"],
        answerIndex: 0,
        hint: "It cannot surprise you.",
        explanations: [
          "Correct. There is nothing to learn there.",
          "A confident bad prediction is worthless to test.",
          "The score is well defined.",
        ],
      },
      {
        prompt: "What goes wrong if you use the surrogate mean directly?",
        options: [
          "It re-evaluates the current best and never explores",
          "It explores too much",
          "It ignores the surrogate",
        ],
        answerIndex: 0,
        hint: "Nothing pushes it toward uncertainty.",
        explanations: [
          "Correct. It converges on whatever looked good first.",
          "It does the opposite.",
          "It uses only the surrogate.",
        ],
      },
    ],
  },
];

export const ML_GAUSSIAN_PROCESS_ATOMS = ML_GAUSSIAN_PROCESS_SPECS.map(guidedMasteryAtom);
export const ML_GAUSSIAN_PROCESS_CONCEPTS = ML_GAUSSIAN_PROCESS_SPECS.map(guidedMasteryConcept);
export const ML_GAUSSIAN_PROCESS_LESSON_CONTENT = guidedLessonContent(ML_GAUSSIAN_PROCESS_SPECS);

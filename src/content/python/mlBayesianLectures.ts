import {
  guidedLessonContent,
  guidedMasteryAtom,
  guidedMasteryConcept,
  type GuidedMasterySpec,
} from "./guidedMastery";

const ML_BAYESIAN_SPECS: GuidedMasterySpec[] = [
  {
    lessonId: "py.mc.m11_1.l1",
    atomId: "py.atom.ml.bayesian-conjugacy",
    conceptId: "py.ml.bayesian-conjugacy",
    title: "Bayesian inference and conjugacy",
    requires: ["py.ml.governance-impact"],
    vocabulary: [
      ["prior", "the distribution over a parameter before any data is seen"],
      ["posterior", "the distribution after the data has been accounted for"],
      ["conjugate pair", "a prior and likelihood whose posterior has the same form as the prior"],
    ],
    opening:
      "A point estimate says the coin is seventy-five percent heads. A posterior says how sure you are, and that second thing is what actually changes decisions.",
    outcome:
      "You will update a distribution with data and see how prior strength and sample size compete.",
    why:
      "When the prior and the likelihood match, the update is arithmetic. That closed form makes the whole mechanism visible before anything is approximated.",
    mentalModel:
      "Picture the prior as counts you already believe you have seen. The data adds its own counts, and the posterior is the total.",
    firstTitle: "Data sharpens the posterior",
    firstIntro:
      "With a matched prior the update just adds the observed successes and failures. The spread shrinks with the square root of the total.",
    firstCode: `def update(a, b, heads, tails):
    return a + heads, b + tails

def summarise(a, b):
    mean = a / (a + b)
    variance = a * b / ((a + b) ** 2 * (a + b + 1))
    return round(mean, 4), round(variance ** 0.5, 4)

print("prior", (1, 1), summarise(1, 1))
for heads, tails in [(3, 1), (30, 10), (300, 100)]:
    posterior = update(1, 1, heads, tails)
    print(heads, "heads", tails, "tails ->", posterior,
          summarise(*posterior))`,
    firstTrace:
      "The mean settles near point seven five while the spread falls from point two nine to point zero two. Ten times the data halves the uncertainty a little over three times.",
    secondTitle: "Prior strength competes with data",
    secondIntro:
      "A prior expressed as counts has a weight. Ten observations move a weak prior a long way and a strong one hardly at all.",
    secondCode: `for prior in [(1, 1), (10, 10), (100, 100)]:
    a, b = update(prior[0], prior[1], 8, 2)
    print("prior", prior, "-> posterior mean", round(a / (a + b), 4))`,
    secondTrace:
      "The same eight-of-ten evidence gives point seven five, point six and point five one four. The prior is not a formality; it is data you asserted.",
    mistake:
      "Choosing a uniform prior because it looks neutral. It is a specific claim - that every value is equally likely - and on a bounded parameter it is often a strong one.",
    checkpoint:
      "Eight heads in ten tosses updates a prior of a hundred and a hundred. Where does the posterior mean land?",
    checkpointAnswer:
      "Just past a half, near point five one four. A prior worth two hundred observations is not moved much by ten.",
    remember:
      "The prior is counts you already claim; the data adds its own.",
    checks: [
      {
        prompt: "What makes a prior and likelihood conjugate?",
        options: [
          "The posterior has the same form as the prior",
          "They have the same mean",
          "Both are uniform",
        ],
        answerIndex: 0,
        hint: "That is what makes the update closed-form.",
        explanations: [
          "Correct. The update becomes arithmetic on the parameters.",
          "Means are unrelated to conjugacy.",
          "Uniformity is a special case, not the definition.",
        ],
      },
      {
        prompt: "How does posterior spread change with more data?",
        options: [
          "It shrinks with the square root of the total",
          "It shrinks linearly",
          "It is unchanged",
        ],
        answerIndex: 0,
        hint: "Ten times the data roughly thirds the spread.",
        explanations: [
          "Correct. Precision is expensive.",
          "That would make data far more valuable than it is.",
          "Data always sharpens a conjugate posterior.",
        ],
      },
      {
        prompt: "Is a uniform prior neutral?",
        options: [
          "No; it asserts every value is equally likely",
          "Yes, by definition",
          "Only for unbounded parameters",
        ],
        answerIndex: 0,
        hint: "It is a specific claim like any other.",
        explanations: [
          "Correct, and on a bounded parameter it can be strong.",
          "Neutrality is not a property any prior has.",
          "It is least defensible on bounded parameters.",
        ],
      },
    ],
  },
  {
    lessonId: "py.mc.m11_1.l2",
    atomId: "py.atom.ml.bayesian-regression",
    conceptId: "py.ml.bayesian-regression",
    title: "Bayesian linear and logistic regression",
    requires: ["py.ml.bayesian-conjugacy"],
    vocabulary: [
      ["predictive distribution", "the distribution over an output, integrating over parameter uncertainty"],
      ["parameter uncertainty", "how unsure you are about the weights themselves"],
      ["observation noise", "irreducible variation in the output that more data cannot remove"],
    ],
    opening:
      "A fitted line gives one prediction per input. Carrying the uncertainty about the line gives an interval, and that interval widens as you move away from the data.",
    outcome:
      "You will propagate weight uncertainty into predictions and separate it from the noise floor.",
    why:
      "Extrapolation is where models are most confidently wrong, and this is the mechanism that makes the risk visible rather than implicit.",
    mentalModel:
      "Picture a fan of plausible lines all passing near the data. Near the observations they agree; far away they spread apart.",
    firstTitle: "Intervals widen with distance",
    firstIntro:
      "The predictive variance is the weight variance scaled by the squared input, plus the noise. The first term grows; the second does not.",
    firstCode: `import math

def predictive(x, weight_mean, weight_var, noise_var):
    mean = weight_mean * x
    variance = weight_var * x * x + noise_var
    return round(mean, 4), round(math.sqrt(variance), 4)

for x in (0.0, 1.0, 5.0, 20.0):
    mean, spread = predictive(x, 2.0, 0.04, 0.25)
    print("x", x, "prediction", mean, "plus or minus", spread)`,
    firstTrace:
      "The interval is point five at the origin and four at twenty. The prediction is just as confident-looking at both, and only the interval says otherwise.",
    secondTitle: "Two sources, one interval",
    secondIntro:
      "Set the weight variance to zero and the interval collapses to the noise floor. That floor is what more data cannot remove.",
    secondCode: `for weight_var in (0.0, 0.01, 0.04, 0.25):
    _, spread = predictive(10.0, 2.0, weight_var, 0.25)
    print("weight variance", weight_var, "-> interval at ten:", spread)`,
    secondTrace:
      "Point five with certain weights, rising to five when the weights are poorly determined. The first is irreducible; the second shrinks with data.",
    mistake:
      "Reporting a single interval without saying which part is reducible. A wide interval from parameter uncertainty means collect more data; the same width from noise means the task has a ceiling.",
    checkpoint:
      "A prediction interval is wide far from the training data. Which source dominates?",
    checkpointAnswer:
      "Parameter uncertainty, because it is scaled by the input while the noise term is constant.",
    remember:
      "Weight uncertainty scales with the input; noise does not.",
    checks: [
      {
        prompt: "Why do predictive intervals widen away from the data?",
        options: [
          "Parameter uncertainty is scaled by the input",
          "The noise grows",
          "The model gets less accurate",
        ],
        answerIndex: 0,
        hint: "One term is multiplied by the squared input.",
        explanations: [
          "Correct. Plausible lines diverge as you extrapolate.",
          "The noise term is constant.",
          "Accuracy is not what is being computed.",
        ],
      },
      {
        prompt: "What does the noise term represent?",
        options: [
          "Variation more data cannot remove",
          "Uncertainty about the weights",
          "Numerical error",
        ],
        answerIndex: 0,
        hint: "It is a floor.",
        explanations: [
          "Correct. It sets the task's ceiling.",
          "That is the other term.",
          "Numerical issues are unrelated.",
        ],
      },
      {
        prompt: "A wide interval comes mostly from parameter uncertainty. What should you do?",
        options: [
          "Collect more data",
          "Accept it as irreducible",
          "Reduce the model size",
        ],
        answerIndex: 0,
        hint: "Only one of the two terms shrinks with data.",
        explanations: [
          "Correct. That component is reducible.",
          "Only the noise term is irreducible.",
          "Size is a separate question.",
        ],
      },
    ],
  },
  {
    lessonId: "py.mc.m11_1.l3",
    atomId: "py.atom.ml.model-evidence",
    conceptId: "py.ml.model-evidence",
    title: "Evidence and model selection",
    requires: ["py.ml.bayesian-regression"],
    vocabulary: [
      ["evidence", "the probability of the data under a model, integrating over its parameters"],
      ["complexity penalty", "the cost a model pays for having more parameters to spread belief over"],
      ["overfitting", "fitting the data better while predicting new data worse"],
    ],
    opening:
      "A flexible model always fits better. Integrating over its parameters rather than optimising them once makes it pay for that flexibility automatically.",
    outcome:
      "You will compare models by fit minus a complexity penalty and watch the best fit lose.",
    why:
      "Model selection by fit alone always picks the most flexible option. The penalty is what stops it, and it falls out of the integration rather than being bolted on.",
    mentalModel:
      "Picture a model spreading a fixed amount of belief over the datasets it can explain. A flexible model explains many, so each gets less.",
    firstTitle: "Fit minus a penalty",
    firstIntro:
      "Every extra parameter costs about half the logarithm of the sample size. A better fit has to beat that to be worth having.",
    firstCode: `import math

def score(fit, parameters, points):
    return round(fit - 0.5 * parameters * math.log(points), 4)

points = 50
for name, fit, parameters in [("linear", -60.0, 2),
                              ("quadratic", -52.0, 3),
                              ("degree nine", -44.0, 10),
                              ("degree twenty", -41.0, 21)]:
    print(f"{name:14} fit {fit} params {parameters:>3} "
          f"score {score(fit, parameters, points)}")`,
    firstTrace:
      "The quadratic wins at minus fifty-eight despite a worse fit than degree nine. Degree twenty fits best of all and scores worst by a wide margin.",
    secondTitle: "The penalty grows with data",
    secondIntro:
      "More data makes each parameter more expensive, so the selected model can become simpler as the sample grows rather than more complex.",
    secondCode: `for points in (5, 12, 200):
    scores = {name: score(fit, parameters, points)
              for name, fit, parameters
              in [("quadratic", -52.0, 3), ("degree nine", -44.0, 10)]}
    winner = max(scores, key=scores.get)
    print(points, "points ->", {k: round(v, 1) for k, v in scores.items()},
          "winner", winner)`,
    secondTrace:
      "Degree nine wins at five points and loses from twelve onward. Its extra parameters get harder to justify as evidence accumulates.",
    mistake:
      "Comparing evidence across models fitted to different datasets. The quantity is the probability of that data, so the comparison is only meaningful when the data is identical.",
    checkpoint:
      "A degree-twenty model fits best and scores worst. Why?",
    checkpointAnswer:
      "Its twenty-one parameters cost more than the improved fit is worth, because belief spread across many explanations is thin everywhere.",
    remember:
      "Integrate over parameters and flexibility pays for itself.",
    checks: [
      {
        prompt: "Why does integrating over parameters penalise complexity?",
        options: [
          "A flexible model spreads its belief over more possible datasets",
          "The integration is harder to compute",
          "Extra parameters fit worse",
        ],
        answerIndex: 0,
        hint: "The total belief is fixed.",
        explanations: [
          "Correct. Each dataset gets a smaller share.",
          "Computational cost is not the mechanism.",
          "They fit better, which is the whole tension.",
        ],
      },
      {
        prompt: "What happens to the penalty as data accumulates?",
        options: [
          "It grows, so each parameter is harder to justify",
          "It shrinks",
          "It stays fixed",
        ],
        answerIndex: 0,
        hint: "It scales with the logarithm of the sample size.",
        explanations: [
          "Correct. The chosen model can become simpler.",
          "More data makes complexity costlier, not cheaper.",
          "It depends on the sample size.",
        ],
      },
      {
        prompt: "Can evidence be compared across different datasets?",
        options: [
          "No; it is the probability of that specific data",
          "Yes, after normalising",
          "Yes, if the models are the same",
        ],
        answerIndex: 0,
        hint: "The quantity is conditional on the data.",
        explanations: [
          "Correct. The comparison requires identical data.",
          "No normalisation makes it comparable.",
          "The data, not the model, is the problem.",
        ],
      },
    ],
  },
  {
    lessonId: "py.mc.m11_1.l4",
    atomId: "py.atom.ml.bayesian-neural-networks",
    conceptId: "py.ml.bayesian-neural-networks",
    title: "Bayesian neural networks",
    requires: ["py.ml.model-evidence"],
    vocabulary: [
      ["epistemic uncertainty", "uncertainty about the model, which more data reduces"],
      ["aleatoric uncertainty", "noise in the data itself, which more data does not reduce"],
      ["calibration error", "the average gap between stated confidence and observed accuracy"],
    ],
    opening:
      "The two kinds of uncertainty demand opposite responses. One says collect more data; the other says the task has a ceiling, and confusing them wastes a lot of effort.",
    outcome:
      "You will separate the two from an ensemble and measure how far a model's confidence is from its accuracy.",
    why:
      "A model that cannot say it is out of its depth will answer confidently on inputs unlike anything it trained on.",
    mentalModel:
      "Picture several models trained the same way. Where they agree, the disagreement term is small; where they scatter, the input is unfamiliar.",
    firstTitle: "Disagreement against noise",
    firstIntro:
      "Spread across the ensemble's means is model uncertainty. The average of their individual variances is the data noise.",
    firstCode: `import statistics

def decompose(means, variances):
    epistemic = statistics.variance(means) if len(means) > 1 else 0.0
    aleatoric = sum(variances) / len(variances)
    return round(epistemic, 5), round(aleatoric, 5)

print("familiar input  ", decompose([0.80, 0.81, 0.79, 0.80], [0.04] * 4))
print("unfamiliar input", decompose([0.20, 0.75, 0.55, 0.90], [0.04] * 4))
print("noisy but known ", decompose([0.80, 0.81, 0.79, 0.80], [0.30] * 4))`,
    firstTrace:
      "The unfamiliar input raises model uncertainty a thousandfold with the noise unchanged. The noisy input does the opposite, and only the first calls for more data.",
    secondTitle: "Confidence against accuracy",
    secondIntro:
      "Group predictions by stated confidence and compare each group's confidence to its accuracy. The weighted gap is the calibration error.",
    secondCode: `def calibration_error(bins):
    total = sum(count for _, _, count in bins)
    return round(sum(abs(confidence - accuracy) * count
                     for confidence, accuracy, count in bins) / total, 4)

print("calibrated   ", calibration_error([(0.6, 0.62, 100), (0.8, 0.79, 100),
                                          (0.95, 0.94, 100)]))
print("overconfident", calibration_error([(0.6, 0.45, 100), (0.8, 0.60, 100),
                                          (0.95, 0.70, 100)]))`,
    secondTrace:
      "Point zero one against point two. The overconfident model claims ninety-five percent and is right seventy, which is the pattern that causes downstream harm.",
    mistake:
      "Treating ensemble disagreement as a complete measure of what the model does not know. Every member shares the same architecture and data, so a blind spot common to all of them produces confident agreement.",
    checkpoint:
      "An ensemble agrees closely but each member reports high variance. What kind of uncertainty is this?",
    checkpointAnswer:
      "Aleatoric - noise in the data. The models agree about the answer, and the answer is genuinely uncertain, so more data will not help.",
    remember:
      "Disagreement means unfamiliar; shared variance means noisy.",
    checks: [
      {
        prompt: "Which uncertainty does more data reduce?",
        options: ["Epistemic", "Aleatoric", "Both equally"],
        answerIndex: 0,
        hint: "One is about the model, the other about the world.",
        explanations: [
          "Correct. It is uncertainty about the model itself.",
          "Noise in the data is irreducible.",
          "They respond very differently.",
        ],
      },
      {
        prompt: "What does ensemble disagreement indicate?",
        options: [
          "The input is unlike the training data",
          "The data is noisy",
          "The models are undertrained",
        ],
        answerIndex: 0,
        hint: "Compare it against the members' own variances.",
        explanations: [
          "Correct. That is the epistemic term.",
          "Noise shows as shared high variance instead.",
          "Trained models still disagree off-distribution.",
        ],
      },
      {
        prompt: "What is the limitation of ensemble uncertainty?",
        options: [
          "A blind spot shared by every member produces confident agreement",
          "It is expensive",
          "It needs a Bayesian prior",
        ],
        answerIndex: 0,
        hint: "The members share architecture and data.",
        explanations: [
          "Correct, and that is exactly the dangerous case.",
          "Cost is real but not the epistemic limitation.",
          "Ensembles need no explicit prior.",
        ],
      },
    ],
  },
];

export const ML_BAYESIAN_ATOMS = ML_BAYESIAN_SPECS.map(guidedMasteryAtom);
export const ML_BAYESIAN_CONCEPTS = ML_BAYESIAN_SPECS.map(guidedMasteryConcept);
export const ML_BAYESIAN_LESSON_CONTENT = guidedLessonContent(ML_BAYESIAN_SPECS);

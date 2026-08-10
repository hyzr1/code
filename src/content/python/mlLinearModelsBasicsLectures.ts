import type { LectureQuestion } from "../../types";
import { guidedLessonContent, guidedMasteryAtom, guidedMasteryConcept, type GuidedMasterySpec } from "./guidedMastery";

const q = (question: string, choices: [string, string, string], answer: 0 | 1 | 2, explanation: string, why: [string, string, string]): LectureQuestion => ({ question, choices, answer, explanation, why });

export const ML_LINEAR_MODELS_BASIC_SPECS: GuidedMasterySpec[] = [
  {
    lessonId: "py.mc.m3_2.l1", atomId: "py.atom.ml.linear-regression-guided", conceptId: "py.ml.linear-regression-guided",
    title: "Linear regression adds weighted features to predict a number", requires: ["py.ml.cross-validation-search"],
    vocabulary: [["regression", "predicting a numeric target"], ["coefficient", "a learned weight multiplying one feature"], ["intercept", "the prediction when all features equal zero"], ["residual", "observed target minus prediction"], ["least squares", "choosing parameters that minimize summed squared residuals"], ["gradient descent", "repeatedly moving parameters opposite the loss gradient"]],
    opening: "Linear regression makes one transparent claim: each feature contributes its value times a learned weight, then an intercept shifts the result.",
    outcome: "You will calculate predictions and residuals, solve one-feature least squares directly, and fit the same line with gradient descent.",
    why: "Linear regression is a useful baseline and introduces parameters, loss, gradients, scaling, and diagnostics used throughout machine learning.",
    mentalModel: "Each feature has a volume knob. The coefficient sets that knob's direction and strength. The intercept sets the starting level.",
    firstTitle: "Fit the least-squares line directly", firstIntro: "For one feature, slope is covariance divided by feature variance. The intercept makes the line pass through the feature and target means.",
    firstCode: `import numpy as np

x = np.array([1.0, 2.0, 3.0, 4.0])
y = np.array([3.0, 5.0, 7.0, 9.0])

x_centered = x - x.mean()
y_centered = y - y.mean()
slope = (x_centered * y_centered).sum() / (x_centered ** 2).sum()
intercept = y.mean() - slope * x.mean()
predictions = intercept + slope * x
residuals = y - predictions

print("intercept", intercept, "slope", slope)
print("predictions", predictions)
print("residuals", residuals)`,
    firstTrace: "The fitted equation is one plus two times x. Every point matches the fitted equation, so every residual is zero. Real datasets usually leave nonzero residuals.",
    secondTitle: "Reach the line with gradient descent", secondIntro: "Squared error has one gradient for intercept and one for slope. Each update moves opposite those gradients to reduce mean squared error.",
    secondCode: `intercept_gd = 0.0
slope_gd = 0.0
learning_rate = 0.05

for step in range(200):
    predictions = intercept_gd + slope_gd * x
    errors = predictions - y
    gradient_intercept = 2 * errors.mean()
    gradient_slope = 2 * (errors * x).mean()
    intercept_gd -= learning_rate * gradient_intercept
    slope_gd -= learning_rate * gradient_slope
    if step in [0, 1, 10, 50, 199]:
        print(step, round((errors ** 2).mean(), 5), round(intercept_gd, 3), round(slope_gd, 3))`,
    secondTrace: "The first updates are large because predictions are far from targets. As the line approaches intercept one and slope two, loss and gradients shrink.",
    mistake: "Do not interpret a coefficient as causal merely because it is nonzero. Correlated features, omitted causes, sampling, and target construction can change its value without any intervention effect.",
    checkpoint: "What does a positive coefficient mean while other model inputs stay fixed?",
    checkpointAnswer: "Increasing that feature by one unit increases the predicted target by the coefficient's amount under the fitted linear equation. It does not by itself prove causation.",
    remember: "Linear regression predicts intercept plus weighted features. Least squares minimizes squared residuals; direct solving and gradient descent are two ways to find parameters.",
    checks: [q("What is a residual?", ["Observed target minus prediction", "A feature name", "The learning rate"], 0, "Residuals show signed prediction errors.", ["Correct. Least squares squares and sums them.", "A feature is an input.", "Learning rate controls update size."]), q("Which direction does gradient descent move?", ["Opposite the loss gradient", "Toward larger loss", "Randomly every step"], 0, "The negative gradient is the local downhill direction.", ["Correct. Step size is set by the learning rate.", "That would perform ascent.", "Stochastic batches add noise, but updates still follow estimated gradients."])],
  },
  {
    lessonId: "py.mc.m3_2.l2", atomId: "py.atom.ml.regression-losses", conceptId: "py.ml.regression-losses",
    title: "The loss function decides which errors matter most", requires: ["py.ml.linear-regression-guided"],
    vocabulary: [["loss", "a number the fitting procedure tries to minimize"], ["mean squared error", "the average squared residual"], ["mean absolute error", "the average absolute residual"], ["Huber loss", "quadratic for small errors and linear for large errors"], ["outlier", "an observation far from most others under a stated rule"], ["robust", "less sensitive to extreme observations or assumption violations"]],
    opening: "MSE, MAE, and Huber do not merely report errors differently. They train models to care about different error patterns.",
    outcome: "You will calculate three regression losses, see how one outlier changes them, and connect constant-loss minimizers to the mean and median.",
    why: "The loss encodes the practical cost of mistakes. Choosing it changes fitted parameters, sensitivity to outliers, and the target summary being estimated.",
    mentalModel: "Loss is a penalty rule. Squaring gives large misses a megaphone. Absolute error gives every extra unit of miss the same volume.",
    firstTitle: "Compare penalties error by error", firstIntro: "The examples differ only in their last prediction. Squaring makes the large miss dominate MSE much more strongly than MAE.",
    firstCode: `import numpy as np

targets = np.array([2.0, 3.0, 4.0, 5.0])
good_predictions = np.array([2.2, 2.8, 4.1, 5.2])
one_large_miss = np.array([2.2, 2.8, 4.1, 15.0])

def losses(predictions, targets, delta=1.0):
    errors = predictions - targets
    absolute = np.abs(errors)
    huber_terms = np.where(absolute <= delta, 0.5 * errors ** 2, delta * (absolute - 0.5 * delta))
    return {
        "MSE": float((errors ** 2).mean()),
        "MAE": float(absolute.mean()),
        "Huber": float(huber_terms.mean()),
    }

print("small errors", losses(good_predictions, targets))
print("large miss", losses(one_large_miss, targets))`,
    firstTrace: "The ten-unit miss contributes one hundred squared units but ten absolute units. Huber is smooth near zero yet grows linearly after its threshold.",
    secondTitle: "Mean minimizes squared error; median minimizes absolute error", secondIntro: "Search constant predictions for a skewed target. MSE prefers the mean, pulled toward twenty; MAE prefers the median, which stays at three.",
    secondCode: `skewed_targets = np.array([1.0, 2.0, 3.0, 4.0, 20.0])
candidates = np.linspace(0, 20, 401)

mse_by_candidate = [((candidate - skewed_targets) ** 2).mean() for candidate in candidates]
mae_by_candidate = [np.abs(candidate - skewed_targets).mean() for candidate in candidates]

best_mse_constant = candidates[np.argmin(mse_by_candidate)]
best_mae_constant = candidates[np.argmin(mae_by_candidate)]

print("mean", skewed_targets.mean(), "MSE choice", best_mse_constant)
print("median", np.median(skewed_targets), "MAE choice", best_mae_constant)`,
    secondTrace: "The MSE-optimal constant matches the mean six. The MAE-optimal constant matches median three. The correct target summary depends on the loss and use case.",
    mistake: "Do not choose MAE only because it looks robust or MSE only because it is common. Define error units and business consequences, inspect residuals, and evaluate important slices.",
    checkpoint: "Why does MSE react more strongly than MAE to a large residual?",
    checkpointAnswer: "MSE squares the residual, so doubling an error multiplies its penalty by four. MAE grows only in direct proportion to error magnitude.",
    remember: "MSE emphasizes large misses and targets conditional means. MAE grows linearly and targets medians. Huber smoothly combines quadratic small-error behavior with linear tails.",
    checks: [q("Which constant minimizes squared error?", ["The mean", "The median in every case", "The maximum"], 0, "Differentiating squared error centers the solution at the mean.", ["Correct. Outliers can pull it.", "Median minimizes absolute error.", "The maximum is generally not optimal."]), q("How does Huber treat large residuals?", ["With a linear tail", "By ignoring them", "By cubing them"], 0, "Past delta, Huber grows linearly.", ["Correct. This limits extreme influence.", "Large errors still contribute.", "Cubic growth would be even more sensitive."])],
  },
  {
    lessonId: "py.mc.m3_2.l3", atomId: "py.atom.ml.logistic-regression-guided", conceptId: "py.ml.logistic-regression-guided",
    title: "Logistic regression turns a linear score into a probability", requires: ["py.ml.regression-losses"],
    vocabulary: [["logit", "the unbounded linear score before sigmoid"], ["sigmoid", "a function mapping any real score into zero-to-one"], ["probability", "a calibrated chance under the model and data assumptions"], ["log-loss", "the negative log probability assigned to the true class"], ["decision threshold", "the probability cutoff used to choose an action or class"], ["odds", "probability divided by one minus probability"]],
    opening: "Logistic regression keeps a linear feature score but wraps it with sigmoid. The output becomes a probability instead of an unrestricted number.",
    outcome: "You will transform logits into probabilities, calculate binary log-loss, fit weights with gradient descent, and separate probability estimation from threshold decisions.",
    why: "Logistic regression is a strong, interpretable classification baseline and introduces the probability-loss pattern used by neural classifiers.",
    mentalModel: "The linear score slides along an endless ruler. Sigmoid bends that ruler into a zero-to-one probability gauge without changing score order.",
    firstTitle: "Map scores to probabilities and losses", firstIntro: "Positive logits produce probabilities above one-half. A confident probability assigned to the wrong answer receives a large log-loss.",
    firstCode: `import numpy as np

def sigmoid(values):
    values = np.asarray(values, dtype=float)
    result = np.empty_like(values)
    positive = values >= 0
    result[positive] = 1 / (1 + np.exp(-values[positive]))
    exp_values = np.exp(values[~positive])
    result[~positive] = exp_values / (1 + exp_values)
    return result

logits = np.array([-4.0, -1.0, 0.0, 1.0, 4.0])
probabilities = sigmoid(logits)
print(np.round(probabilities, 4))

labels = np.array([0, 0, 1, 1, 1])
clipped = np.clip(probabilities, 1e-12, 1 - 1e-12)
log_loss = -(labels * np.log(clipped) + (1 - labels) * np.log(1 - clipped))
print(np.round(log_loss, 4))`,
    firstTrace: "Logit zero maps to probability one-half. Correct confident predictions have tiny loss. The positive label at logit zero receives log two because the model gives it only one-half probability.",
    secondTitle: "Fit the linear score with gradient descent", secondIntro: "For binary log-loss, the gradient uses probability minus label. Matrix multiplication accumulates each feature's contribution across examples.",
    secondCode: `X = np.array([[1.0, -2.0], [1.0, -1.0], [1.0, 1.0], [1.0, 2.0]])
y = np.array([0.0, 0.0, 1.0, 1.0])
weights = np.zeros(X.shape[1])

for step in range(300):
    probabilities = sigmoid(X @ weights)
    gradient = X.T @ (probabilities - y) / len(y)
    weights -= 0.2 * gradient

probabilities = sigmoid(X @ weights)
for threshold in [0.3, 0.5, 0.8]:
    decisions = (probabilities >= threshold).astype(int)
    print("threshold", threshold, "probabilities", np.round(probabilities, 3), "decisions", decisions)`,
    secondTrace: "The fitted probabilities rise with the feature. Changing the threshold changes actions but not the probabilities. Choose thresholds using validation costs and constraints, not a default habit.",
    mistake: "Do not call every sigmoid output calibrated. Calibration depends on data, regularization, sampling, and shift. Measure reliability on held-out data and keep threshold selection separate.",
    checkpoint: "Why is the decision threshold not part of the probability model itself?",
    checkpointAnswer: "The model estimates probabilities. A threshold converts those probabilities into an action using costs, capacity, or policy requirements that can change independently.",
    remember: "Logistic regression applies sigmoid to a linear logit and trains with log-loss. It estimates probabilities; a separately validated threshold turns them into decisions.",
    checks: [q("What probability does logit zero produce?", ["One-half", "Zero", "One"], 0, "Sigmoid of zero is one divided by two.", ["Correct. It is the midpoint.", "Large negative logits approach zero.", "Large positive logits approach one."]), q("What receives a large log-loss?", ["A confident wrong prediction", "A confident correct prediction", "Every probability equally"], 0, "The true class was assigned very low probability.", ["Correct. Negative log of a tiny probability is large.", "Its loss approaches zero.", "Loss depends strongly on the assigned true-class probability."])],
  },
];

export const ML_LINEAR_MODELS_BASIC_ATOMS = ML_LINEAR_MODELS_BASIC_SPECS.map(guidedMasteryAtom);
export const ML_LINEAR_MODELS_BASIC_CONCEPTS = ML_LINEAR_MODELS_BASIC_SPECS.map(guidedMasteryConcept);
export const ML_LINEAR_MODELS_BASIC_LESSON_CONTENT = guidedLessonContent(ML_LINEAR_MODELS_BASIC_SPECS);

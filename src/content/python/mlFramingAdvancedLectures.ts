import type { LectureQuestion } from "../../types";
import { guidedMasteryAtom, guidedMasteryConcept, guidedLessonContent, type GuidedMasterySpec } from "./guidedMastery";
import { ML_FRAMING_BASIC_SPECS } from "./mlFramingBasicsLectures";

const q = (question: string, choices: [string, string, string], answer: 0 | 1 | 2, explanation: string, why: [string, string, string]): LectureQuestion => ({ question, choices, answer, explanation, why });

const ADVANCED_SPECS: GuidedMasterySpec[] = [
  {
    lessonId: "py.mc.m3_1.l5", atomId: "py.atom.ml.generalization-fit", conceptId: "py.ml.generalization-fit",
    title: "Generalization means working on new examples", requires: ["py.ml.split-discipline"],
    vocabulary: [["generalization", "performance on new examples drawn from the intended use setting"], ["underfitting", "failing to capture useful structure even in training data"], ["overfitting", "fitting training details that do not transfer"], ["capacity", "the range of patterns a model can represent"], ["training error", "error measured on examples used for fitting"], ["validation error", "error measured on held-out examples used for choices"]],
    opening: "Training error answers how well the model fits its study material. Validation error asks whether the learned rule transfers to new examples. We need both.",
    outcome: "You will diagnose underfitting and overfitting from paired errors, compare model capacities, and use learning curves to choose the next experiment.",
    why: "A model that memorizes training noise can look perfect until deployment. Generalization—not training score—is the reason to learn a pattern.",
    mentalModel: "A student may memorize one answer sheet or understand the rule. A fresh problem separates memory from transferable understanding.",
    firstTitle: "Compare capacity with train and validation errors", firstIntro: "Polynomial degree controls capacity. Degree one is too rigid for the curved signal; a very high degree can chase noise in a small training set.",
    firstCode: `import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import PolynomialFeatures

rng = np.random.default_rng(9)
x_train = np.linspace(-2, 2, 18)
y_train = x_train ** 3 - x_train + rng.normal(0, 0.8, len(x_train))
x_valid = np.linspace(-1.9, 1.9, 80)
y_valid = x_valid ** 3 - x_valid

for degree in [1, 3, 12]:
    model = make_pipeline(PolynomialFeatures(degree), LinearRegression())
    model.fit(x_train[:, None], y_train)
    train_error = mean_squared_error(y_train, model.predict(x_train[:, None]))
    valid_error = mean_squared_error(y_valid, model.predict(x_valid[:, None]))
    print(degree, round(train_error, 3), round(valid_error, 3))`,
    firstTrace: "Degree one has high error on both sets: underfitting. Degree three matches the signal. Degree twelve lowers training error but can distort between sparse points, raising validation error.",
    secondTitle: "Use a learning curve to test the data hypothesis", secondIntro: "Fit the same capacity on growing training subsets. If validation improves with more representative data, collecting data may be more useful than adding model complexity.",
    secondCode: `degree = 12
for size in [6, 10, 14, 18]:
    model = make_pipeline(PolynomialFeatures(degree), LinearRegression())
    model.fit(x_train[:size, None], y_train[:size])
    train_error = mean_squared_error(y_train[:size], model.predict(x_train[:size, None]))
    valid_error = mean_squared_error(y_valid, model.predict(x_valid[:, None]))
    print("size", size, "train", round(train_error, 3), "valid", round(valid_error, 3))`,
    secondTrace: "The two curves show whether a gap narrows as data grows. Learning curves diagnose one setup; they do not guarantee that more data from the wrong population will help.",
    mistake: "Do not label every train-validation gap overfitting before checking split mismatch, leakage, duplicates, metric noise, and preprocessing differences. Diagnose the data path as well as model capacity.",
    checkpoint: "What error pattern suggests underfitting?",
    checkpointAnswer: "Training error and validation error are both unacceptably high and often fairly close. The current representation or capacity cannot fit even the training pattern well.",
    remember: "Read train and validation errors together. High-high suggests underfit; low-train and high-validation suggests overfit or mismatch. Use learning curves and data checks before choosing an intervention.",
    checks: [q("What pattern most strongly suggests overfitting?", ["Low training error and much higher validation error", "High error on both sets", "Identical row counts"], 0, "The model fits training details that do not transfer.", ["Correct. Also check leakage and distribution mismatch.", "That more often suggests underfitting.", "Row counts do not diagnose generalization."]), q("What does a learning curve vary?", ["Training-set size or training progress", "The test labels", "The meaning of the target"], 0, "It shows how performance changes as learning evidence grows.", ["Correct. Plot train and validation behavior.", "Test labels must remain untouched.", "Target meaning should stay fixed during comparison."])],
  },
  {
    lessonId: "py.mc.m3_1.l6", atomId: "py.atom.ml.bias-variance-diagnosis", conceptId: "py.ml.bias-variance-diagnosis",
    title: "Bias and variance describe repeated-training behavior", requires: ["py.ml.generalization-fit"],
    vocabulary: [["bias", "systematic difference between average prediction and the true target"], ["variance", "how much predictions change across different training samples"], ["irreducible noise", "outcome variation that available inputs cannot predict"], ["model capacity", "the variety of functions the model can represent"], ["regularization", "a preference or penalty that limits fitted complexity"], ["diagnosis", "using observed evidence to choose the next intervention"]],
    opening: "Bias and variance are not personalities of one fitted model. They describe what happens when the whole training process repeats on different samples from the same population.",
    outcome: "You will compute squared bias and variance from repeated predictions, connect them to error, and choose interventions from observed train-validation patterns.",
    why: "Saying 'reduce overfitting' is not a plan. Bias–variance reasoning connects evidence to choices such as features, capacity, regularization, and more representative data.",
    mentalModel: "Archery arrows can cluster away from the center, showing bias, or scatter widely, showing variance. Both can miss the target for different reasons.",
    firstTitle: "Separate average miss from prediction spread", firstIntro: "Imagine retraining many times and predicting the same input. Squared bias measures the average prediction's miss; variance measures spread around that average.",
    firstCode: `def bias_variance(predictions, truth):
    average = sum(predictions) / len(predictions)
    squared_bias = (average - truth) ** 2
    variance = sum((prediction - average) ** 2 for prediction in predictions) / len(predictions)
    mean_squared_error = sum((prediction - truth) ** 2 for prediction in predictions) / len(predictions)
    return {
        "average": average,
        "squared_bias": squared_bias,
        "variance": variance,
        "MSE": mean_squared_error,
    }

truth = 10
rigid_predictions = [6.8, 7.0, 7.1, 6.9, 7.2]
unstable_predictions = [4, 15, 7, 14, 10]
print("rigid", bias_variance(rigid_predictions, truth))
print("unstable", bias_variance(unstable_predictions, truth))`,
    firstTrace: "The rigid process is consistent but centered far from ten, so bias dominates. The unstable process changes greatly between samples, so variance dominates. Both have error.",
    secondTitle: "Map evidence to the next controlled experiment", secondIntro: "A diagnosis table suggests one change at a time. Real decisions also consider data quality, split design, latency, fairness, and uncertainty.",
    secondCode: `def next_experiment(train_error, valid_error, target_error=0.2):
    gap = valid_error - train_error
    if train_error > target_error and valid_error > target_error:
        return "test better features or more suitable capacity"
    if train_error <= target_error and gap > target_error:
        return "test stronger regularization or more representative data"
    if train_error <= target_error and valid_error <= target_error:
        return "verify on untouched slices and stress tests"
    return "inspect split noise, leakage, and metric uncertainty"

for errors in [(0.8, 0.9), (0.05, 0.7), (0.1, 0.15), (0.3, 0.45)]:
    print(errors, next_experiment(*errors))`,
    secondTrace: "High errors on both sets motivate representation or capacity tests. A large gap motivates variance controls. Good averages still require subgroup, shift, robustness, and final-test checks.",
    mistake: "Do not assume a more complex model always reduces bias or more data always fixes variance. Those are hypotheses to test on the actual distribution, pipeline, and metric.",
    checkpoint: "What does high variance mean in repeated-training language?",
    checkpointAnswer: "Training on another sample produces noticeably different predictions. The fitting process is sensitive to which examples happened to be observed.",
    remember: "Bias is the average systematic miss; variance is sensitivity to sampled data. Diagnose with repeated evidence and learning curves, then change one plausible cause and remeasure.",
    checks: [q("What does squared bias compare?", ["Average repeated prediction with truth", "Two filenames", "Training time with memory"], 0, "Bias is systematic error across repeated samples.", ["Correct. Squaring makes magnitude nonnegative.", "Names do not determine statistical bias.", "Runtime is a systems metric."]), q("What can reduce excessive variance?", ["Regularization or more representative data", "Leaking validation labels", "Removing the test set"], 0, "Both can make the fitted rule less sample-sensitive.", ["Correct. Verify the effect empirically.", "Leakage invalidates evaluation.", "A final test estimate remains necessary."])],
  },
  {
    lessonId: "py.mc.m3_1.l7", atomId: "py.atom.ml.cross-validation-search", conceptId: "py.ml.cross-validation-search",
    title: "Cross-validation reuses training data without spending test data", requires: ["py.ml.bias-variance-diagnosis"],
    vocabulary: [["fold", "one partition used as validation while other partitions train"], ["cross-validation", "rotating held-out folds to estimate a choice across several splits"], ["hyperparameter", "a setting chosen outside ordinary model fitting"], ["search space", "the predefined candidate settings to compare"], ["pipeline", "a combined preprocessing and model object fitted inside each fold"], ["nested evaluation", "using an outer evaluation loop around an inner model-selection loop"]],
    opening: "One validation split can be noisy. Cross-validation rotates held-out folds inside the training pool while final test data stays sealed.",
    outcome: "You will run group-aware cross-validation, fit preprocessing inside every fold, compare a predefined hyperparameter grid, and evaluate the selected pipeline once on test.",
    why: "Search adapts to validation results. Pipelines and honest fold boundaries prevent that adaptation from learning preprocessing statistics or identities from held-out examples.",
    mentalModel: "Practice exams rotate among training students. The sealed final waits until the method and settings are chosen.",
    firstTitle: "Keep groups intact during the entire search", firstIntro: "Ten groups form the training pool and two groups form the sealed test set. GroupKFold keeps each training identity in one fold.",
    firstCode: `import numpy as np
from sklearn.linear_model import Ridge
from sklearn.model_selection import GridSearchCV, GroupKFold
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

rng = np.random.default_rng(11)
groups = np.repeat(np.arange(12), 8)
X = rng.normal(size=(len(groups), 3))
y = 2 * X[:, 0] - X[:, 1] + groups * 0.03 + rng.normal(0, 0.3, len(groups))

train_mask = groups < 10
test_mask = ~train_mask
pipeline = make_pipeline(StandardScaler(), Ridge())
search = GridSearchCV(
    pipeline,
    {"ridge__alpha": [0.01, 0.1, 1.0, 10.0]},
    cv=GroupKFold(n_splits=5), scoring="neg_mean_squared_error",
)
search.fit(X[train_mask], y[train_mask], groups=groups[train_mask])
print(search.best_params_, round(-search.best_score_, 4))`,
    firstTrace: "Each candidate pipeline refits its scaler and Ridge model inside each training fold. Group boundaries prevent one identity from helping predict itself in a validation fold.",
    secondTitle: "Inspect stability, then open test once", secondIntro: "Search results show mean and spread across folds. After selecting the candidate, GridSearchCV refits it on the full training pool before one test evaluation.",
    secondCode: `from sklearn.metrics import mean_squared_error

for alpha, mean_score, spread in zip(
    search.cv_results_["param_ridge__alpha"],
    -search.cv_results_["mean_test_score"],
    search.cv_results_["std_test_score"],
):
    print("alpha", alpha, "CV MSE", round(mean_score, 4), "+/-", round(spread, 4))

test_predictions = search.best_estimator_.predict(X[test_mask])
test_error = mean_squared_error(y[test_mask], test_predictions)
print("sealed test MSE", round(test_error, 4))`,
    secondTrace: "Fold spread shows selection uncertainty that one mean hides. The test score estimates the finalized procedure. If it drives another choice, it stops being an untouched final estimate.",
    mistake: "Do not run preprocessing before cross-validation, search an unbounded list until one wins, or use ordinary random folds for grouped or temporal data. The fold design must match deployment.",
    checkpoint: "Why must scaling be inside the cross-validation pipeline?",
    checkpointAnswer: "Each fold's scaler must learn only from that fold's training portion. Scaling once before cross-validation leaks validation-fold statistics into every candidate.",
    remember: "Define candidates first, match folds to deployment, fit all learned steps inside each fold, inspect mean and spread, select with training data, and open test once.",
    checks: [q("What remains sealed during hyperparameter search?", ["The final test set", "Every training fold", "The model configuration"], 0, "Search uses only the training pool and its internal folds.", ["Correct. Test estimates the finalized procedure.", "Training folds are repeatedly fitted.", "Candidate settings must be explicit."]), q("Why use group-aware folds for repeated users?", ["To keep one user from crossing train and validation", "To guarantee equal feature values", "To remove all labels"], 0, "Related examples otherwise leak identity across folds.", ["Correct. Fold design should match new-user deployment.", "Groups may contain varied features.", "Supervised cross-validation still needs labels."])],
  },
];

export const ML_FRAMING_SPECS: GuidedMasterySpec[] = [...ML_FRAMING_BASIC_SPECS, ...ADVANCED_SPECS];
export const ML_FRAMING_ATOMS = ML_FRAMING_SPECS.map(guidedMasteryAtom);
export const ML_FRAMING_CONCEPTS = ML_FRAMING_SPECS.map(guidedMasteryConcept);
export const ML_FRAMING_LESSON_CONTENT = guidedLessonContent(ML_FRAMING_SPECS);

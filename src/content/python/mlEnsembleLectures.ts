import type { LectureQuestion } from "../../types";
import { guidedLessonContent, guidedMasteryAtom, guidedMasteryConcept, type GuidedMasterySpec } from "./guidedMastery";

const q = (question: string, choices: [string, string, string], answer: 0 | 1 | 2, explanation: string, why: [string, string, string]): LectureQuestion => ({ question, choices, answer, explanation, why });

const ML_ENSEMBLE_SPECS: GuidedMasterySpec[] = [
  {
    lessonId: "py.mc.m3_4.l1", atomId: "py.atom.ml.bagging-random-forests", conceptId: "py.ml.bagging-random-forests",
    title: "Bagging and random forests average many different trees", requires: ["py.ml.curse-dimensionality"],
    vocabulary: [["ensemble", "one predictor built by combining several predictors"], ["bootstrap sample", "a training sample drawn with replacement"], ["bagging", "training models on bootstrap samples and averaging their predictions"], ["feature subsampling", "letting a split consider only a random subset of features"], ["out-of-bag example", "a row omitted from one tree's bootstrap sample"], ["variance", "prediction movement caused by small changes in training data"]],
    opening: "One deep decision tree can change dramatically when a few training rows change. Bagging makes many deliberately different trees and lets their votes cancel unstable mistakes.",
    outcome: "You will build bootstrap trees, combine their votes, explain why random forests also randomize features, and validate the settings that control complexity and cost.",
    why: "Random forests are dependable tabular baselines. They model nonlinear interactions, need little feature scaling, and expose whether a more complicated model is truly useful.",
    mentalModel: "Ask many judges who studied overlapping but different case files. A majority vote is useful only when the judges are reasonably accurate and do not all make the same mistake.",
    firstTitle: "Bootstrap the rows and average tree votes", firstIntro: "Each tree receives a same-sized sample drawn with replacement. Repeated row indexes create duplicates and leave some original rows out.",
    firstCode: `from collections import Counter
import numpy as np
from sklearn.tree import DecisionTreeClassifier

X = np.array([[1], [2], [3], [4], [5], [6], [7], [8]])
y = np.array([0, 0, 0, 0, 1, 1, 1, 1])
query = np.array([[4.6]])
rng = np.random.default_rng(7)
votes = []

for tree_number in range(5):
    rows = rng.integers(0, len(X), size=len(X))
    tree = DecisionTreeClassifier(max_depth=2, random_state=tree_number)
    tree.fit(X[rows], y[rows])
    vote = int(tree.predict(query)[0])
    votes.append(vote)
    print(tree_number, rows.tolist(), vote)

print("forest vote", Counter(votes).most_common(1)[0][0])`,
    firstTrace: "Every row-index list has eight draws, but some indexes repeat and some disappear. The trees therefore learn slightly different boundaries. The final class is the most common vote.",
    secondTitle: "Compare one tree with a random forest honestly", secondIntro: "A random forest adds feature subsampling at each split. Cross-validation measures whether averaging reduces unstable validation results on unseen folds.",
    secondCode: `from sklearn.datasets import make_classification
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import StratifiedKFold, cross_val_score

X, y = make_classification(
    n_samples=500, n_features=12, n_informative=5,
    n_redundant=2, flip_y=0.08, random_state=4,
)
folds = StratifiedKFold(5, shuffle=True, random_state=4)
models = {
    "one tree": DecisionTreeClassifier(random_state=4),
    "forest": RandomForestClassifier(
        n_estimators=200, max_features="sqrt",
        min_samples_leaf=3, n_jobs=1, random_state=4,
    ),
}

for name, model in models.items():
    scores = cross_val_score(model, X, y, cv=folds)
    print(name, round(scores.mean(), 3), round(scores.std(), 3))`,
    secondTrace: "The mean estimates typical held-out accuracy. The standard deviation shows fold-to-fold movement. More trees stabilize the average; leaf size and feature choices control bias, correlation, memory, and prediction cost.",
    mistake: "Do not treat built-in feature importance as proof of causation. Impurity importance can favor continuous or high-cardinality features. Confirm usefulness with held-out permutation tests and domain reasoning.",
    checkpoint: "If every tree is trained on identical rows and considers every feature in the same order, what important benefit becomes weaker?",
    checkpointAnswer: "Diversity becomes weaker. Highly correlated trees make similar errors, so averaging cancels less variance than it would across genuinely different trees.",
    remember: "Bagging reduces variance by averaging diverse bootstrap models. Random forests add random feature choices. Validate tree depth, leaf size, feature sampling, and total inference cost.",
    checks: [q("Why sample with replacement?", ["To create different same-sized training sets", "To guarantee every row appears once", "To normalize every feature"], 0, "Replacement creates duplicates and omissions.", ["Correct. Those differences diversify the trees.", "That describes sampling without replacement.", "Row sampling does not scale columns."]), q("What usually happens as more trees are added?", ["Predictions stabilize but compute grows", "Every tree becomes deeper", "Leakage disappears automatically"], 0, "A larger average is steadier but not free.", ["Correct. Look for the performance-cost plateau.", "Tree count and tree depth are separate settings.", "Evaluation design still matters."])],
  },
  {
    lessonId: "py.mc.m3_4.l2", atomId: "py.atom.ml.boosting-guided", conceptId: "py.ml.boosting-guided",
    title: "Boosting builds a model by correcting earlier mistakes", requires: ["py.ml.bagging-random-forests"],
    vocabulary: [["weak learner", "a simple model that performs only a little better than a naive guess"], ["residual", "the target value still left unexplained by the current prediction"], ["additive model", "a prediction formed by summing contributions from several models"], ["learning rate", "the fraction of each new correction added"], ["AdaBoost", "boosting that increases attention on misclassified examples"], ["gradient boosting", "boosting that fits the direction that reduces a chosen loss"]],
    opening: "Bagging trains trees independently and averages them. Boosting is sequential: each new learner studies what the current ensemble still gets wrong.",
    outcome: "You will add residual-fitting trees by hand, connect that loop to loss gradients, compare a stump with AdaBoost, and reason about learning rate and learner count together.",
    why: "Boosting turns small trees into powerful nonlinear models. The same correction idea appears in modern gradient-boosted libraries and many optimization procedures.",
    mentalModel: "A first draft is written, then an editor marks the remaining errors. Every revision targets the current mistakes instead of independently rewriting the original draft.",
    firstTitle: "Fit the remaining error one small tree at a time", firstIntro: "For squared error, the residual is target minus current prediction. Each shallow tree predicts part of that residual, and the learning rate controls how much correction is accepted.",
    firstCode: `import numpy as np
from sklearn.tree import DecisionTreeRegressor

X = np.arange(8).reshape(-1, 1)
y = np.array([1.0, 1.2, 1.1, 2.8, 3.0, 4.8, 5.1, 5.0])
prediction = np.full(len(y), y.mean())
learning_rate = 0.3
trees = []

for step in range(4):
    residual = y - prediction
    tree = DecisionTreeRegressor(max_depth=1, random_state=step)
    tree.fit(X, residual)
    correction = tree.predict(X)
    prediction += learning_rate * correction
    trees.append(tree)
    print(step, "mse", round(np.mean((y - prediction) ** 2), 3))

print("final", np.round(prediction, 2))`,
    firstTrace: "The starting prediction is one constant. Each stump divides the x-axis once and approximates the current residuals. The printed training loss falls as corrections are added.",
    secondTitle: "Compare one stump with a boosted sequence", secondIntro: "AdaBoost emphasizes examples that prior classifiers missed. Stratified folds keep class proportions similar while measuring the entire learned sequence on held-out rows.",
    secondCode: `from sklearn.datasets import make_moons
from sklearn.ensemble import AdaBoostClassifier
from sklearn.model_selection import StratifiedKFold, cross_val_score
from sklearn.tree import DecisionTreeClassifier

X, y = make_moons(n_samples=400, noise=0.28, random_state=8)
folds = StratifiedKFold(5, shuffle=True, random_state=8)
stump = DecisionTreeClassifier(max_depth=1, random_state=8)
boosted = AdaBoostClassifier(
    estimator=DecisionTreeClassifier(max_depth=1, random_state=8),
    n_estimators=100,
    learning_rate=0.08,
    random_state=8,
)

for name, model in [("stump", stump), ("boosted", boosted)]:
    scores = cross_val_score(model, X, y, cv=folds)
    print(name, round(scores.mean(), 3), round(scores.std(), 3))`,
    secondTrace: "One straight split cannot follow the curved moons. Many sequential stumps can assemble a curved boundary. Held-out folds, not falling training loss, decide whether later corrections still help.",
    mistake: "Do not tune the learning rate and number of learners independently on the test set. Smaller steps often need more learners. Select the pair with training folds and validation data, then evaluate once on sealed test data.",
    checkpoint: "Why can a very small learning rate underfit when the number of learners stays fixed?",
    checkpointAnswer: "Every learner contributes only a tiny correction. With too few learners, the sum cannot travel far enough from the initial prediction to fit the useful pattern.",
    remember: "Boosting adds targeted corrections in sequence. AdaBoost reweights mistakes; gradient boosting follows loss gradients. Learning rate, learner complexity, and learner count form one capacity decision.",
    checks: [q("Can ordinary boosting learners be trained fully independently?", ["No, each depends on the current ensemble", "Yes, always", "Only if labels are missing"], 0, "Boosting is sequential.", ["Correct. Later learners target current mistakes.", "That describes bagging more closely.", "Label presence is not the reason."]), q("For squared error, what does the next learner fit?", ["Current residuals", "Random labels", "The test-set score"], 0, "Residuals point toward lower squared loss.", ["Correct. They are target minus current prediction.", "That destroys the signal.", "Test data must remain sealed."])],
  },
  {
    lessonId: "py.mc.m3_4.l3", atomId: "py.atom.ml.gradient-boosted-trees", conceptId: "py.ml.gradient-boosted-trees",
    title: "Gradient-boosted trees turn careful corrections into a tabular workhorse", requires: ["py.ml.boosting-guided"],
    vocabulary: [["histogram bin", "a range grouping nearby numeric values"], ["shrinkage", "scaling each new tree by a small learning rate"], ["early stopping", "stopping when validation performance no longer improves"], ["row subsampling", "giving a tree only part of the rows"], ["column subsampling", "giving a tree only part of the features"], ["regularization", "limits that discourage brittle fits"]],
    opening: "XGBoost, LightGBM, and histogram boosting grow trees that correct an additive model. Efficient split search and regularization make them fast and accurate.",
    outcome: "You will see why bins speed up splits, train with early stopping, and connect the main settings across popular libraries.",
    why: "Gradient-boosted trees are strong models for structured tables. They still require honest validation and careful settings.",
    mentalModel: "Group nearby measurements into labeled buckets. A builder compares a few bucket boundaries, then adds one small repair at a time.",
    firstTitle: "Replace thousands of candidate values with bins", firstIntro: "Quantile bins keep similar row counts per bucket. Split search summarizes gradients by bucket instead of revisiting every exact value.",
    firstCode: `import numpy as np

values = np.array([1.1, 1.2, 1.4, 2.0, 2.2, 3.5, 4.0, 5.7, 6.1, 9.0])
gradients = np.array([-1.0, -0.8, -0.5, -0.2, 0.1, 0.4, 0.7, 0.9, 1.2, 1.5])
edges = np.quantile(values, [0.25, 0.5, 0.75])
bins = np.digitize(values, edges)

for bin_id in range(4):
    selected = gradients[bins == bin_id]
    print(
        "bin", bin_id,
        "rows", len(selected),
        "gradient sum", round(selected.sum(), 2),
    )

print("candidate boundaries", np.round(edges, 2))`,
    firstTrace: "Ten exact values become four ordered buckets and only three candidate boundaries. Real libraries also track curvature and missing values, but the speed idea is the same: summarize before evaluating splits.",
    secondTitle: "Train with a sealed test set and internal early stopping", secondIntro: "The training portion supplies an internal validation slice for early stopping. The external test rows remain untouched until the model has chosen its iteration count.",
    secondCode: `from sklearn.datasets import make_classification
from sklearn.ensemble import HistGradientBoostingClassifier
from sklearn.model_selection import train_test_split

X, y = make_classification(
    n_samples=1200, n_features=18, n_informative=8,
    n_redundant=3, flip_y=0.05, random_state=12,
)
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, stratify=y, random_state=12,
)
model = HistGradientBoostingClassifier(
    learning_rate=0.06, max_iter=400, max_leaf_nodes=15,
    min_samples_leaf=20, l2_regularization=1.0,
    early_stopping=True, validation_fraction=0.15,
    n_iter_no_change=20, random_state=12,
)
model.fit(X_train, y_train)
print("chosen iterations", model.n_iter_)
print("train accuracy", round(model.score(X_train, y_train), 3))
print("test accuracy", round(model.score(X_test, y_test), 3))`,
    secondTrace: "Training may stop before four hundred trees because the internal validation score plateaus. XGBoost and LightGBM expose similar controls under different names: learning rate, boosting rounds, leaves or depth, row and column sampling, and regularization.",
    mistake: "Do not use test performance to choose boosting rounds, depth, or feature handling. Also do not read gain importance as causality. Tune with validation data and inspect leakage, missing-value meaning, latency, and drift.",
    checkpoint: "Why can a smaller learning rate require a larger maximum number of boosting rounds?",
    checkpointAnswer: "Each tree changes the ensemble less. More small corrections may be needed to reach the useful fit, so early stopping should decide when enough rounds have accumulated.",
    remember: "Histogram boosting searches binned splits efficiently. Start with shallow or few-leaf trees, shrinkage, regularization, and early stopping. Keep the test set sealed and measure production cost.",
    checks: [q("What does early stopping monitor?", ["Held-out validation performance", "Only training loss forever", "The final test labels"], 0, "A validation signal decides when added trees stop helping.", ["Correct. The test set stays sealed.", "Training loss can keep improving during overfit.", "Test labels cannot guide training."]), q("Why use histogram bins?", ["To reduce candidate split work", "To guarantee perfect calibration", "To remove the need for validation"], 0, "Aggregated buckets make split search faster.", ["Correct. This is central to modern implementations.", "Binning alone does not calibrate probabilities.", "Fast training can still overfit."])],
  },
  {
    lessonId: "py.mc.m3_4.l4", atomId: "py.atom.ml.stacking-blending", conceptId: "py.ml.stacking-blending",
    title: "Stacking trains a model to combine honest base predictions", requires: ["py.ml.gradient-boosted-trees"],
    vocabulary: [["base model", "a model whose prediction becomes another model's input"], ["meta-model", "the model that combines base predictions"], ["out-of-fold prediction", "a prediction from a model not trained on that row"], ["stacking", "learning from out-of-fold base predictions"], ["blending", "learning a combiner on one holdout set"], ["leakage", "training information unavailable for a future prediction"]],
    opening: "Different models notice different patterns. Stacking can learn when to trust each one, but only if the meta-model receives predictions produced without seeing their own target rows.",
    outcome: "You will build out-of-fold features, fit a meta-model, refit base learners for deployment, and explain why in-sample base predictions create target leakage.",
    why: "Ensembling can win the final fraction of performance, but a leaky stack looks spectacular during development and disappoints in production. The split logic is the main algorithm.",
    mentalModel: "A judge combines specialist reports. Each specialist must report before seeing that case's answer key, or the judge learns to trust memorization.",
    firstTitle: "Create base predictions without exposing each row's answer", firstIntro: "Each fold trains base models on other rows and predicts the held-out fold. Every training row receives predictions from models that never trained on its target.",
    firstCode: `import numpy as np
from sklearn.base import clone
from sklearn.datasets import make_classification
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import StratifiedKFold, train_test_split
from sklearn.tree import DecisionTreeClassifier
X, y = make_classification(n_samples=600, n_features=10, random_state=15)
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, stratify=y, random_state=15,
)
bases = [
    LogisticRegression(max_iter=1000),
    DecisionTreeClassifier(max_depth=5, random_state=15),
]
folds = StratifiedKFold(5, shuffle=True, random_state=15)
oof = np.zeros((len(X_train), len(bases)))
for train_rows, held_rows in folds.split(X_train, y_train):
    for column, base in enumerate(bases):
        fitted = clone(base).fit(X_train[train_rows], y_train[train_rows])
        oof[held_rows, column] = fitted.predict_proba(X_train[held_rows])[:, 1]

print("out-of-fold shape", oof.shape)`,
    firstTrace: "The matrix has one row per training example and one column per base model. Fold assignment guarantees that the value in a row came from a model trained without that row.",
    secondTitle: "Fit the combiner, then rebuild base models for new data", secondIntro: "The meta-model learns from honest out-of-fold columns. Each base model is then refit on all training rows so deployment uses every available labeled example.",
    secondCode: `meta = LogisticRegression().fit(oof, y_train)
test_columns = []

for base in bases:
    fitted = clone(base).fit(X_train, y_train)
    test_columns.append(fitted.predict_proba(X_test)[:, 1])

stacked_test = np.column_stack(test_columns)
stacked_accuracy = meta.score(stacked_test, y_test)
print("meta weights", np.round(meta.coef_, 3))
print("stacked test accuracy", round(stacked_accuracy, 3))

leaky = np.column_stack([
    clone(base).fit(X_train, y_train).predict_proba(X_train)[:, 1]
    for base in bases
])
print("honest versus leaky row", np.round(oof[0], 3), np.round(leaky[0], 3))`,
    secondTrace: "The meta weights show how the combiner uses each model. The final test features come from full-training base models, matching deployment. The printed leaky row can be more confident because its base model saw that target.",
    mistake: "Do not train the meta-model on base predictions made from the same rows used to fit those base models. Use out-of-fold predictions, and reproduce every preprocessing step inside each fold.",
    checkpoint: "Why are ordinary in-sample base predictions unsafe as training features for the meta-model?",
    checkpointAnswer: "They contain each base learner's response after seeing that row's target. The meta-model learns from unrealistically informed features that will not exist for future rows.",
    remember: "A valid stack uses out-of-fold training predictions, full-training base refits, and untouched test evaluation. Blending is simpler but spends a dedicated holdout set on the combiner.",
    checks: [q("What must be true of an out-of-fold prediction?", ["Its model did not train on that row", "It came from the test set", "It must equal zero or one"], 0, "The held row stays unseen by its predictor.", ["Correct. That makes the meta-feature honest.", "Test data is not meta-training data.", "Probabilities can take any value from zero to one."]), q("What is the main cost of blending?", ["It reserves data for a holdout combiner set", "It requires no validation", "It makes every model causal"], 0, "The simple split sacrifices some base-training data.", ["Correct. Stacking recycles data through folds.", "Blending still needs honest evaluation.", "Prediction combination cannot prove causality."])],
  },
];

export const ML_ENSEMBLE_ATOMS = ML_ENSEMBLE_SPECS.map(guidedMasteryAtom);
export const ML_ENSEMBLE_CONCEPTS = ML_ENSEMBLE_SPECS.map(guidedMasteryConcept);
export const ML_ENSEMBLE_LESSON_CONTENT = guidedLessonContent(ML_ENSEMBLE_SPECS);

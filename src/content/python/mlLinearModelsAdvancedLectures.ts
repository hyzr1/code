import type { LectureQuestion } from "../../types";
import { guidedLessonContent, guidedMasteryAtom, guidedMasteryConcept, type GuidedMasterySpec } from "./guidedMastery";
import { ML_LINEAR_MODELS_BASIC_SPECS } from "./mlLinearModelsBasicsLectures";

const q = (question: string, choices: [string, string, string], answer: 0 | 1 | 2, explanation: string, why: [string, string, string]): LectureQuestion => ({ question, choices, answer, explanation, why });

const ADVANCED_SPECS: GuidedMasterySpec[] = [
  {
    lessonId: "py.mc.m3_2.l4", atomId: "py.atom.ml.softmax-regression-guided", conceptId: "py.ml.softmax-regression-guided",
    title: "Softmax regression assigns probability across many classes", requires: ["py.ml.logistic-regression-guided"],
    vocabulary: [["multiclass classification", "choosing one class from three or more alternatives"], ["class logit", "one unrestricted score for one class"], ["softmax", "normalizing class logits into probabilities that sum to one"], ["cross-entropy", "negative log probability assigned to the true class"], ["one-hot target", "a vector with one at the true class and zero elsewhere"], ["argmax", "the position of the largest value"]],
    opening: "Binary logistic regression produces one probability. Softmax regression produces one logit per class, then converts the whole score row into competing probabilities.",
    outcome: "You will calculate stable softmax probabilities, compute multiclass cross-entropy, and fit a three-class linear classifier with gradient descent.",
    why: "Softmax and cross-entropy form the output layer for many neural classifiers. Understanding the small linear version makes later models easier to debug.",
    mentalModel: "Each class submits a score. Softmax turns exponentiated scores into shares of one probability pie. Raising one class's score changes every share.",
    firstTitle: "Normalize logits without overflow", firstIntro: "Subtract each row's maximum before exponentiating. This preserves probability ratios while ensuring every exponent is zero or negative.",
    firstCode: `import numpy as np

def softmax(logits):
    logits = np.asarray(logits, dtype=float)
    shifted = logits - logits.max(axis=1, keepdims=True)
    exponentials = np.exp(shifted)
    return exponentials / exponentials.sum(axis=1, keepdims=True)

logits = np.array([[2.0, 1.0, 0.0], [1000.0, 1001.0, 999.0]])
probabilities = softmax(logits)
true_classes = np.array([0, 2])
losses = -np.log(probabilities[np.arange(len(true_classes)), true_classes])

print(np.round(probabilities, 4))
print("row sums", probabilities.sum(axis=1))
print("losses", np.round(losses, 4))`,
    firstTrace: "Every row sums to one. The first true class has the largest score and small loss. The second true class has the smallest score and a large loss.",
    secondTitle: "Fit all class weights together", secondIntro: "Each example's gradient is predicted probability minus one-hot target. The update raises true-class scores and lowers competing scores.",
    secondCode: `X = np.array([[1, -2, 0], [1, -1, 0], [1, 1, 0], [1, 2, 0], [1, 0, -2], [1, 0, -1]], dtype=float)
y = np.array([0, 0, 1, 1, 2, 2])
class_count = 3
weights = np.zeros((X.shape[1], class_count))
targets = np.eye(class_count)[y]

for step in range(800):
    probabilities = softmax(X @ weights)
    gradient = X.T @ (probabilities - targets) / len(y)
    weights -= 0.2 * gradient

probabilities = softmax(X @ weights)
predictions = probabilities.argmax(axis=1)
print(np.round(probabilities, 3))
print("predictions", predictions, "answers", y)`,
    secondTrace: "The model learns one weight column per class. Argmax chooses the largest probability, while the full probability row preserves confidence information for evaluation and decisions.",
    mistake: "Do not apply sigmoid independently when exactly one class must win. Independent sigmoids do not force probabilities to sum to one and instead suit multi-label tasks where several labels may be true.",
    checkpoint: "Why does subtracting the largest logit leave softmax probabilities unchanged?",
    checkpointAnswer: "It multiplies every exponent in one row by the same constant factor. That factor cancels between each numerator and the shared denominator.",
    remember: "Softmax converts competing class logits into one probability distribution. Cross-entropy scores the true-class probability, and argmax chooses a class only after probabilities exist.",
    checks: [q("What must one softmax row sum to?", ["One", "The class count", "Zero"], 0, "Softmax normalizes positive exponentials by their total.", ["Correct. The entries form a distribution.", "There are that many entries, but their sum is one.", "Probabilities cannot all sum to zero."]), q("When are independent sigmoids more suitable?", ["When multiple labels may be true", "When exactly one class must win", "When no probabilities are needed"], 0, "Each label becomes a separate yes-or-no question.", ["Correct. That is multi-label classification.", "Softmax expresses exclusive competition.", "Sigmoid still produces probabilities."])],
  },
  {
    lessonId: "py.mc.m3_2.l5", atomId: "py.atom.ml.linear-regularization", conceptId: "py.ml.linear-regularization",
    title: "Regularization trades fit for simpler coefficients", requires: ["py.ml.softmax-regression-guided"],
    vocabulary: [["regularization", "adding a preference for smaller or sparser coefficients"], ["L1 penalty", "the sum of absolute coefficient values"], ["L2 penalty", "the sum of squared coefficient values"], ["ridge", "linear regression with an L2 penalty"], ["lasso", "linear regression with an L1 penalty"], ["elastic net", "a weighted combination of L1 and L2 penalties"]],
    opening: "A linear model can overreact to noise or correlated features. Regularization allows some training error in exchange for coefficients that are easier to stabilize.",
    outcome: "You will compare ridge, lasso, and elastic net, trace coefficient shrinkage across penalty strengths, and explain why feature scaling must come first.",
    why: "Regularization controls variance, handles correlated inputs, and can produce sparse models. Its strength is a hyperparameter chosen using training-only validation.",
    mentalModel: "Fitting pulls coefficients toward the data. A penalty ties elastic bands to zero. Stronger bands allow less movement unless improved fit justifies it.",
    firstTitle: "Compare L2, L1, and combined penalties", firstIntro: "The first two features carry signal; three are noise. Scaling makes one unit of coefficient penalty comparable across feature columns.",
    firstCode: `import numpy as np
from sklearn.linear_model import ElasticNet, Lasso, Ridge
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

rng = np.random.default_rng(4)
X = rng.normal(size=(120, 5))
y = 3 * X[:, 0] - 2 * X[:, 1] + rng.normal(0, 0.6, len(X))

models = {
    "ridge": Ridge(alpha=1.0),
    "lasso": Lasso(alpha=0.1, max_iter=10_000),
    "elastic net": ElasticNet(alpha=0.1, l1_ratio=0.5, max_iter=10_000),
}
for name, estimator in models.items():
    pipeline = make_pipeline(StandardScaler(), estimator)
    pipeline.fit(X, y)
    coefficients = pipeline[-1].coef_
    print(name, np.round(coefficients, 3), "nonzero", np.count_nonzero(coefficients))`,
    firstTrace: "Ridge shrinks every coefficient smoothly. Lasso can set noise coefficients exactly to zero. Elastic net combines sparsity with L2 stability for correlated features.",
    secondTitle: "Trace shrinkage as alpha grows", secondIntro: "Alpha controls penalty strength. The grid belongs inside cross-validation because the best bias-variance tradeoff is not known beforehand.",
    secondCode: `from sklearn.model_selection import KFold, cross_val_score

for alpha in [0.001, 0.01, 0.1, 1.0, 10.0]:
    model = make_pipeline(StandardScaler(), Ridge(alpha=alpha))
    scores = -cross_val_score(
        model, X, y,
        cv=KFold(5, shuffle=True, random_state=8),
        scoring="neg_mean_squared_error",
    )
    model.fit(X, y)
    coefficient_norm = np.linalg.norm(model[-1].coef_)
    print(alpha, "CV MSE", round(scores.mean(), 3), "coefficient norm", round(coefficient_norm, 3))`,
    secondTrace: "Coefficient norm falls as alpha grows. Validation error may first improve, then worsen when shrinkage becomes too strong and introduces excessive bias.",
    mistake: "Do not compare regularized coefficients before scaling features. A feature measured in thousands needs a smaller coefficient than the same feature measured in units, changing its penalty unfairly.",
    checkpoint: "Why can L1 produce exact zero coefficients while L2 usually does not?",
    checkpointAnswer: "The absolute-value penalty has a sharp corner at zero, so an optimum can land exactly there. The smooth squared penalty usually shrinks continuously toward zero.",
    remember: "Ridge uses L2 for smooth shrinkage, lasso uses L1 for sparsity, and elastic net combines both. Scale first and select penalty strength inside cross-validation.",
    checks: [q("Which penalty can set coefficients exactly to zero?", ["L1", "L2 only", "No penalty"], 0, "The L1 geometry promotes sparse solutions.", ["Correct. Lasso uses L1.", "L2 generally shrinks without exact zeros.", "Unregularized fitting has no sparsity preference."]), q("What happens as ridge alpha grows?", ["Coefficient magnitudes generally shrink", "Every coefficient must grow", "The test set fits the model"], 0, "A stronger L2 penalty makes large weights more costly.", ["Correct. Too much can underfit.", "That moves against the penalty.", "Training and cross-validation data fit the model."])],
  },
  {
    lessonId: "py.mc.m3_2.l6", atomId: "py.atom.ml.feature-pipelines", conceptId: "py.ml.feature-pipelines",
    title: "A feature pipeline must fit once and run the same everywhere", requires: ["py.ml.linear-regularization"],
    vocabulary: [["feature scaling", "changing numeric units using learned training statistics"], ["feature engineering", "constructing inputs that express useful domain relationships"], ["imputation", "filling missing values with a documented learned or fixed rule"], ["one-hot encoding", "creating one indicator column per known category"], ["interaction", "a feature representing two inputs acting together"], ["serving skew", "training and production computing features differently"]],
    opening: "A feature is useful only if the same rule can compute it from available production data. Put every learned transformation inside one fitted pipeline.",
    outcome: "You will combine imputation, scaling, category encoding, interactions, and a model inside one object, then verify identical predictions after serialization.",
    why: "Manual notebook preprocessing leaks validation statistics and drifts away from serving code. A pipeline makes fit-versus-transform behavior explicit and portable.",
    mentalModel: "The pipeline is one sealed machine. Raw rows enter; the same fitted gears clean, transform, order, and predict during validation and production.",
    firstTitle: "Fit numeric and categorical branches on training", firstIntro: "Numeric columns receive median imputation and scaling. The category receives most-frequent imputation and one-hot encoding with an unknown-category policy.",
    firstCode: `import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

train = pd.DataFrame({
    "age": [20.0, 35.0, np.nan, 50.0, 28.0, 42.0],
    "spend": [10.0, 80.0, 20.0, 120.0, 30.0, 90.0],
    "plan": ["free", "pro", "free", "team", "free", "pro"],
})
y = np.array([0, 1, 0, 1, 0, 1])

numeric = Pipeline([("impute", SimpleImputer(strategy="median")), ("scale", StandardScaler())])
categorical = Pipeline([("impute", SimpleImputer(strategy="most_frequent")), ("encode", OneHotEncoder(handle_unknown="ignore"))])
preprocess = ColumnTransformer([("numeric", numeric, ["age", "spend"]), ("category", categorical, ["plan"])])
model = Pipeline([("features", preprocess), ("classifier", LogisticRegression())])
model.fit(train, y)
print(model.named_steps["features"].get_feature_names_out())`,
    firstTrace: "All medians, means, scales, and category names come only from training. The output feature order is stored inside the fitted transformer.",
    secondTitle: "Add interactions and verify the deployable artifact", secondIntro: "PolynomialFeatures adds numeric squares and interactions inside the numeric branch. A pickle round trip simulates saving and loading the complete fitted pipeline.",
    secondCode: `import pickle
from sklearn.preprocessing import PolynomialFeatures

numeric_with_interactions = Pipeline([
    ("impute", SimpleImputer(strategy="median")),
    ("scale", StandardScaler()),
    ("interact", PolynomialFeatures(degree=2, include_bias=False)),
])
engineered = ColumnTransformer([
    ("numeric", numeric_with_interactions, ["age", "spend"]),
    ("category", categorical, ["plan"]),
])
deployable = Pipeline([("features", engineered), ("classifier", LogisticRegression(max_iter=1000))])
deployable.fit(train, y)

new_rows = pd.DataFrame({"age": [31.0], "spend": [55.0], "plan": ["student"]})
before = deployable.predict_proba(new_rows)
restored = pickle.loads(pickle.dumps(deployable))
after = restored.predict_proba(new_rows)
print("same prediction", np.allclose(before, after), np.round(after, 4))`,
    secondTrace: "The unseen student plan is handled without changing feature width. The serialized artifact preserves learned statistics, categories, interaction order, coefficients, and probability output.",
    mistake: "Do not engineer a feature from information unavailable at prediction time, even inside a perfect pipeline. Automation prevents implementation skew, not conceptual target leakage.",
    checkpoint: "Why must preprocessing and the estimator be serialized together?",
    checkpointAnswer: "The estimator expects the exact fitted transformation parameters, category vocabulary, interaction order, and feature order used during training. Recreating them can change predictions.",
    remember: "Build available features inside a training-fitted pipeline, keep preprocessing within validation folds, define unknown and missing behavior, serialize the whole object, and test training-serving parity.",
    checks: [q("Where should learned scaling happen during cross-validation?", ["Inside the pipeline fitted in each fold", "Once on all data before folds", "Only after test evaluation"], 0, "Each validation fold must remain unseen by scaling statistics.", ["Correct. This prevents leakage.", "That leaks fold information.", "The fitted training pipeline is needed before evaluation."]), q("What does `handle_unknown='ignore'` do?", ["Keeps feature width stable for unseen categories", "Retrains on production automatically", "Turns every numeric value into zero"], 0, "Unknown categories produce zeros for known one-hot columns.", ["Correct. Monitor them as possible drift.", "Production rows should not silently refit the encoder.", "It affects categorical encoding only."])],
  },
];

export const ML_LINEAR_MODELS_SPECS: GuidedMasterySpec[] = [...ML_LINEAR_MODELS_BASIC_SPECS, ...ADVANCED_SPECS];
export const ML_LINEAR_MODELS_ATOMS = ML_LINEAR_MODELS_SPECS.map(guidedMasteryAtom);
export const ML_LINEAR_MODELS_CONCEPTS = ML_LINEAR_MODELS_SPECS.map(guidedMasteryConcept);
export const ML_LINEAR_MODELS_LESSON_CONTENT = guidedLessonContent(ML_LINEAR_MODELS_SPECS);

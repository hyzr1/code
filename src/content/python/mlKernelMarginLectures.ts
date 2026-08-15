import type { LectureQuestion } from "../../types";
import { guidedLessonContent, guidedMasteryAtom, guidedMasteryConcept, type GuidedMasterySpec } from "./guidedMastery";

const q = (question: string, choices: [string, string, string], answer: 0 | 1 | 2, explanation: string, why: [string, string, string]): LectureQuestion => ({ question, choices, answer, explanation, why });

const ML_KERNEL_MARGIN_SPECS: GuidedMasterySpec[] = [
  {
    lessonId: "py.mc.m3_5.l1", atomId: "py.atom.ml.support-vector-machines", conceptId: "py.ml.support-vector-machines",
    title: "A support vector machine chooses a wide separating margin", requires: ["py.ml.stacking-blending"],
    vocabulary: [["hyperplane", "a flat boundary defined by a weighted sum"], ["margin", "the gap beside the decision boundary"], ["support vector", "a closest example that helps set the boundary"], ["hard margin", "a margin allowing no training violations"], ["soft margin", "a margin allowing costly violations"], ["C", "the strength of the violation penalty"]],
    opening: "Many lines can separate the same points. An SVM prefers a wide empty gap, making small measurement changes less likely to flip a decision.",
    outcome: "You will calculate margin scores, find support vectors, train a soft margin, and explain the tradeoff controlled by C.",
    why: "SVMs make boundary geometry precise. They can suit medium-sized, high-dimensional data when features are scaled and settings are validated.",
    mentalModel: "Place the widest road between two groups of houses. Houses touching its edges determine where it fits; distant houses usually do not.",
    firstTitle: "Measure which examples touch the margin", firstIntro: "A boundary uses score w dot x plus b. Multiplying that score by a label of minus one or plus one makes correctly classified examples positive.",
    firstCode: `import numpy as np

X = np.array([
    [0.0, 0.0], [1.0, 0.5], [1.2, 1.0],
    [2.0, 2.0], [2.5, 2.0], [3.0, 3.0],
])
y = np.array([-1, -1, -1, 1, 1, 1])
w = np.array([1.0, 1.0])
b = -3.0

raw_scores = X @ w + b
signed_scores = y * raw_scores
closest = np.argsort(signed_scores)[:2]

for index, score in enumerate(signed_scores):
    print(index, "signed score", round(score, 2))
print("closest examples", closest.tolist())`,
    firstTrace: "A positive signed score means the side is correct. Small positive scores lie closest to the boundary. Those nearby points constrain the margin and become support-vector candidates.",
    secondTitle: "Scale features and validate the violation penalty", secondIntro: "Scaling keeps one unit from dominating distance to the boundary. Cross-validation compares C values without touching a final test set.",
    secondCode: `from sklearn.datasets import make_classification
from sklearn.model_selection import StratifiedKFold, cross_val_score
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.svm import SVC

X, y = make_classification(
    n_samples=350, n_features=8, n_informative=5,
    class_sep=1.1, flip_y=0.08, random_state=20,
)
folds = StratifiedKFold(5, shuffle=True, random_state=20)

for penalty in [0.05, 1.0, 100.0]:
    model = make_pipeline(
        StandardScaler(),
        SVC(kernel="linear", C=penalty),
    )
    scores = cross_val_score(model, X, y, cv=folds)
    print("C", penalty, "accuracy", round(scores.mean(), 3))`,
    secondTrace: "Small C tolerates more violations to protect a wide margin. Large C pushes harder to classify training rows correctly and may create a narrower, more sensitive boundary. Validation chooses the useful tradeoff.",
    mistake: "Do not interpret maximum margin as guaranteed generalization. Scale inside each fold, validate C, inspect class imbalance, and measure prediction cost because every support vector participates in a kernel prediction.",
    checkpoint: "What happens to the learned boundary if a faraway point moves slightly but never approaches the margin?",
    checkpointAnswer: "Usually very little. The closest examples constrain the maximum-margin boundary, while distant correctly classified points do not become support vectors.",
    remember: "An SVM maximizes separation while charging for violations. Support vectors determine the boundary. Scale features and select C with validation, not training accuracy.",
    checks: [q("Which examples determine the SVM boundary most directly?", ["Support vectors near the margin", "Only the first rows", "Only correctly predicted test rows"], 0, "Closest training examples constrain the margin.", ["Correct. Their position matters most.", "Row order has no such role.", "Test rows cannot determine training."]), q("What does a larger C usually do?", ["Punishes training violations more", "Removes the need to scale", "Guarantees calibrated probabilities"], 0, "C controls the violation penalty.", ["Correct. The boundary may become less forgiving.", "Feature units still matter.", "Margin scores are not automatically calibrated."])],
  },
  {
    lessonId: "py.mc.m3_5.l2", atomId: "py.atom.ml.kernel-trick", conceptId: "py.ml.kernel-trick",
    title: "A kernel measures similarity in a richer hidden feature space", requires: ["py.ml.support-vector-machines"],
    vocabulary: [["feature map", "a transformation into new coordinates"], ["kernel", "a hidden-space dot-product similarity"], ["kernel trick", "computing similarity without building every new coordinate"], ["RBF kernel", "a similarity that falls with squared distance"], ["gamma", "how quickly RBF similarity falls"], ["kernel matrix", "pairwise similarities between selected examples"]],
    opening: "A straight boundary cannot separate every pattern. A feature map adds useful coordinates. A kernel uses that richer space without constructing every coordinate.",
    outcome: "You will separate XOR with one added feature, train an RBF SVM, and connect gamma, C, scaling, data size, and support-vector cost.",
    why: "The kernel trick is a reusable mathematical idea, not merely an SVM option. It shows how similarity choices encode assumptions about which examples should influence one another.",
    mentalModel: "A tangled flat drawing may separate when lifted into a new shape. The kernel says which points are close on that hidden shape.",
    firstTitle: "Add a coordinate that reveals the XOR pattern", firstIntro: "XOR has opposite corners in the same class, so no single line works in the original plane. The product x one times x two exposes the interaction.",
    firstCode: `import numpy as np
from sklearn.linear_model import LogisticRegression

X = np.array([
    [-1, -1], [-1, 1], [1, -1], [1, 1],
])
y = np.array([0, 1, 1, 0])

raw_model = LogisticRegression(C=1000).fit(X, y)
mapped_X = np.column_stack([X, X[:, 0] * X[:, 1]])
mapped_model = LogisticRegression(C=1000).fit(mapped_X, y)

print("raw predictions", raw_model.predict(X))
print("mapped coordinates")
print(mapped_X)
print("mapped predictions", mapped_model.predict(mapped_X))`,
    firstTrace: "The original coordinates cannot give one linear separator for opposite corners. The product coordinate is positive for class zero and negative for class one, so a flat boundary works after mapping.",
    secondTitle: "Tune RBF similarity without opening the test set", secondIntro: "An RBF kernel creates local influence around support vectors. A pipeline scales first, then cross-validation chooses C and gamma using training rows only.",
    secondCode: `from sklearn.datasets import make_moons
from sklearn.model_selection import GridSearchCV, train_test_split
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.svm import SVC

X, y = make_moons(n_samples=500, noise=0.25, random_state=22)
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, stratify=y, random_state=22,
)
pipeline = make_pipeline(StandardScaler(), SVC(kernel="rbf"))
search = GridSearchCV(
    pipeline,
    param_grid={"svc__C": [0.3, 3, 30], "svc__gamma": [0.1, 1, 10]},
    cv=5,
)
search.fit(X_train, y_train)
support_count = search.best_estimator_.named_steps["svc"].n_support_.sum()
print("best", search.best_params_)
print("support vectors", int(support_count))
print("test accuracy", round(search.score(X_test, y_test), 3))`,
    secondTrace: "Low gamma creates broad smooth influence. High gamma creates tiny neighborhoods that can trace noise. C controls violations at the same time, so the grid validates both and opens the test set only after selection.",
    mistake: "Do not use an RBF SVM blindly on millions of rows. Training and prediction can become expensive as pairwise work and support-vector count grow. Compare linear models, trees, approximations, and measured latency.",
    checkpoint: "Why must scaling be fitted inside the cross-validation pipeline for an RBF kernel?",
    checkpointAnswer: "RBF similarity depends on distance. Global scaling would use held-out fold statistics and leak information, while unscaled features could dominate distance because of their units.",
    remember: "A kernel supplies hidden-space similarity. RBF gamma controls locality and C controls violation cost. Scale inside folds, tune jointly, and watch support-vector memory and latency.",
    checks: [q("What does a very large RBF gamma create?", ["Very local influence around points", "A guaranteed straight boundary", "Automatic probability calibration"], 0, "Similarity falls quickly when gamma is large.", ["Correct. This can fit fine detail or noise.", "A linear kernel creates the straight case.", "Kernel choice does not calibrate outputs."]), q("What does the kernel trick avoid?", ["Explicitly constructing every hidden feature", "Using any training examples", "Choosing validation splits"], 0, "The kernel computes hidden-space dot products directly.", ["Correct. The hidden map may be enormous.", "Training examples still define the model.", "Evaluation design remains necessary."])],
  },
];

export const ML_KERNEL_MARGIN_ATOMS = ML_KERNEL_MARGIN_SPECS.map(guidedMasteryAtom);
export const ML_KERNEL_MARGIN_CONCEPTS = ML_KERNEL_MARGIN_SPECS.map(guidedMasteryConcept);
export const ML_KERNEL_MARGIN_LESSON_CONTENT = guidedLessonContent(ML_KERNEL_MARGIN_SPECS);

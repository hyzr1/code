import type { LectureQuestion } from "../../types";
import { guidedLessonContent, guidedMasteryAtom, guidedMasteryConcept, type GuidedMasterySpec } from "./guidedMastery";

const q = (question: string, choices: [string, string, string], answer: 0 | 1 | 2, explanation: string, why: [string, string, string]): LectureQuestion => ({ question, choices, answer, explanation, why });

const ML_CLASSICAL_MODEL_SPECS: GuidedMasterySpec[] = [
  {
    lessonId: "py.mc.m3_3.l1", atomId: "py.atom.ml.knn-guided", conceptId: "py.ml.knn-guided",
    title: "k-nearest neighbors predicts from nearby stored examples", requires: ["py.ml.feature-pipelines"],
    vocabulary: [["neighbor", "a stored example close to the query under a chosen distance"], ["distance metric", "a rule that measures separation between feature vectors"], ["k", "the number of neighbors allowed to vote or average"], ["distance weighting", "giving closer neighbors more influence"], ["lazy learning", "deferring most computation until prediction time"], ["decision boundary", "the feature-space border where the predicted class changes"]],
    opening: "k-nearest neighbors does not learn a coefficient equation. It stores examples, finds the closest ones to a new point, and lets their targets vote or average.",
    outcome: "You will calculate distances and votes by hand, see how scaling changes neighbors, and choose k using validation rather than training accuracy.",
    why: "kNN is an intuitive nonlinear baseline. It also makes feature units, local density, inference cost, and high-dimensional distance failures impossible to ignore.",
    mentalModel: "A new student asks the k most similar students what happened to them. The answer depends on similarity, neighborhood size, and who exists in the records.",
    firstTitle: "Find neighbors and make their vote visible", firstIntro: "Euclidean distance squares each feature difference, adds them, and takes a square root. The three nearest labels vote for the query class.",
    firstCode: `from collections import Counter
from math import sqrt

examples = [
    ([1.0, 1.0], "blue"),
    ([1.5, 2.0], "blue"),
    ([3.0, 3.5], "orange"),
    ([4.0, 4.0], "orange"),
    ([2.0, 1.5], "blue"),
]
query = [2.7, 2.8]

def euclidean(left, right):
    return sqrt(sum((a - b) ** 2 for a, b in zip(left, right)))

ranked = sorted((euclidean(point, query), label, point) for point, label in examples)
neighbors = ranked[:3]
prediction = Counter(label for _, label, _ in neighbors).most_common(1)[0][0]
print(neighbors)
print("prediction", prediction)`,
    firstTrace: "The sorted list exposes every chosen neighbor and distance. Two of the three closest labels are orange, so k equals three predicts orange.",
    secondTitle: "Scale features and validate k", secondIntro: "A pipeline learns training-only scaling before distance. Cross-validation compares neighborhood sizes without using the sealed test set.",
    secondCode: `import numpy as np
from sklearn.model_selection import StratifiedKFold, cross_val_score
from sklearn.neighbors import KNeighborsClassifier
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

rng = np.random.default_rng(5)
X = np.column_stack([rng.normal(0, 1, 120), rng.normal(0, 1000, 120)])
y = (X[:, 0] > 0).astype(int)
folds = StratifiedKFold(5, shuffle=True, random_state=6)

for k in [1, 3, 9, 25]:
    model = make_pipeline(StandardScaler(), KNeighborsClassifier(n_neighbors=k))
    scores = cross_val_score(model, X, y, cv=folds)
    print("k", k, "accuracy", round(scores.mean(), 3), "+/-", round(scores.std(), 3))`,
    secondTrace: "Without scaling, the thousand-unit noise feature would dominate distance. Small k follows local detail and noise; large k smooths neighborhoods and can erase useful structure.",
    mistake: "Do not choose k from training accuracy. k equals one can memorize training examples. Validate scaling, metric, weighting, and k under a split that matches deployment.",
    checkpoint: "Why can one feature measured in dollars dominate another measured from zero to one?",
    checkpointAnswer: "Raw distance uses numeric differences. A thousand-dollar gap contributes far more than a fraction-sized gap unless feature scaling or a justified metric balances them.",
    remember: "kNN stores examples, measures distance, selects k neighbors, and votes or averages. Scale inside validation, tune k honestly, and budget storage and prediction-time search.",
    checks: [q("What does k control?", ["How many neighbors influence the prediction", "The number of target classes", "The file format"], 0, "Neighborhood size controls local smoothness.", ["Correct. Small and large values have different bias-variance behavior.", "Class count is independent of k.", "Storage format does not define the neighborhood."]), q("Why scale before Euclidean kNN?", ["To keep feature units from dominating distance", "To guarantee causation", "To delete every outlier"], 0, "Distance responds directly to numeric units.", ["Correct. Fit the scaler on training only.", "Scaling does not establish causality.", "Scaling changes units rather than deleting cases."])],
  },
  {
    lessonId: "py.mc.m3_3.l2", atomId: "py.atom.ml.naive-bayes-guided", conceptId: "py.ml.naive-bayes-guided",
    title: "Naive Bayes adds feature evidence in log probability", requires: ["py.ml.knn-guided"],
    vocabulary: [["prior", "class probability before seeing current features"], ["likelihood", "probability of observed features under a class"], ["posterior", "updated class probability after observing features"], ["conditional independence", "features becoming independent after the class is known"], ["Laplace smoothing", "adding pseudo-counts so unseen events receive nonzero probability"], ["log probability", "the logarithm of probability, turning products into sums"]],
    opening: "Naive Bayes asks which class would most likely produce the observed features. Its simplifying assumption treats features as conditionally independent once the class is known.",
    outcome: "You will calculate priors, smoothed word likelihoods, and log scores, then inspect a text classifier without mistaking its probabilities for causal truth.",
    why: "Naive Bayes is fast, data-efficient, and surprisingly strong for sparse text. Its derivation connects Bayes rule to a practical classifier.",
    mentalModel: "Each observed word casts a small evidence vote for every class. Log space adds those votes to the class's starting prior score.",
    firstTitle: "Count words with Laplace smoothing", firstIntro: "The training messages define class priors and word counts. Adding one to every vocabulary count prevents an unseen class-word pair from making the whole product zero.",
    firstCode: `from collections import Counter, defaultdict
from math import log

documents = [
    ("cheap prize now", "spam"),
    ("cheap offer prize", "spam"),
    ("project meeting now", "work"),
    ("project notes meeting", "work"),
]
vocabulary = sorted({word for text, _ in documents for word in text.split()})
class_documents = Counter(label for _, label in documents)
word_counts = defaultdict(Counter)
total_words = Counter()
for text, label in documents:
    word_counts[label].update(text.split())
    total_words[label] += len(text.split())

for label in class_documents:
    prior = class_documents[label] / len(documents)
    likelihood = (word_counts[label]["prize"] + 1) / (total_words[label] + len(vocabulary))
    print(label, "prior", prior, "P(prize|class)", round(likelihood, 3))`,
    firstTrace: "Both classes start with equal prior probability. Prize appears only in spam training messages, but smoothing still gives it a small nonzero work likelihood.",
    secondTitle: "Add evidence in log space", secondIntro: "The classifier starts with log prior and adds one smoothed log likelihood per word. The largest class score wins.",
    secondCode: `def classify(text):
    scores = {}
    for label, count in class_documents.items():
        score = log(count / len(documents))
        denominator = total_words[label] + len(vocabulary)
        for word in text.split():
            if word in vocabulary:
                score += log((word_counts[label][word] + 1) / denominator)
        scores[label] = score
    return max(scores, key=scores.get), scores

for text in ["cheap prize", "project meeting", "prize meeting"]:
    prediction, scores = classify(text)
    print(text, "->", prediction, {label: round(score, 3) for label, score in scores.items()})`,
    secondTrace: "Cheap and prize reinforce spam. Project and meeting reinforce work. The mixed message combines competing evidence rather than triggering one hard rule.",
    mistake: "Do not assume a high Naive Bayes score proves features are truly independent or causal. Correlated words can be counted as repeated evidence, affecting probability calibration.",
    checkpoint: "Why add probabilities in log space instead of multiplying many raw probabilities?",
    checkpointAnswer: "Logs turn products into sums and prevent many small probabilities from underflowing toward zero in finite-precision arithmetic.",
    remember: "Naive Bayes combines a class prior with smoothed feature likelihoods under conditional independence. Use log scores for stability and validate probability quality separately.",
    checks: [q("What problem does Laplace smoothing prevent?", ["Zero probability for unseen feature-class pairs", "Every classification error", "Large input files"], 0, "A zero factor would erase the entire class likelihood.", ["Correct. Pseudo-counts reserve some probability.", "Smoothing cannot guarantee correct predictions.", "It addresses probabilities, not file size."]), q("What is naive about Naive Bayes?", ["Its conditional-independence assumption", "It never uses Bayes rule", "It has no classes"], 0, "Features are treated as independent given class.", ["Correct. This can still work well empirically.", "Bayes rule motivates the classifier.", "It compares class scores."])],
  },
  {
    lessonId: "py.mc.m3_3.l3", atomId: "py.atom.ml.decision-trees-guided", conceptId: "py.ml.decision-trees-guided",
    title: "A decision tree asks feature questions that purify labels", requires: ["py.ml.naive-bayes-guided"],
    vocabulary: [["node", "a group of examples reaching one point in a tree"], ["split", "a feature question dividing a node into children"], ["leaf", "a terminal node that produces a prediction"], ["Gini impurity", "one minus the sum of squared class proportions"], ["entropy", "the average information uncertainty in class proportions"], ["information gain", "parent impurity minus child impurity after a split"]],
    opening: "A decision tree learns a sequence of yes-or-no feature questions. Each split tries to create child groups whose labels are more uniform.",
    outcome: "You will calculate Gini impurity and weighted gain, fit and read a small tree, and control depth and leaf size to reduce memorization.",
    why: "Trees capture thresholds and feature interactions without scaling. They also introduce the split logic used by random forests and boosted trees.",
    mentalModel: "A mixed basket reaches a fork. The tree chooses one question that sends items into cleaner baskets, then repeats until a stopping rule creates leaves.",
    firstTitle: "Score a candidate split by impurity reduction", firstIntro: "Gini is zero when one class fills a node and largest for evenly mixed binary labels. A good split lowers the weighted child impurity.",
    firstCode: `from collections import Counter

def gini(labels):
    counts = Counter(labels)
    total = len(labels)
    return 1 - sum((count / total) ** 2 for count in counts.values())

ages = [18, 22, 25, 35, 40, 50]
labels = [0, 0, 0, 1, 1, 1]
parent_impurity = gini(labels)

for threshold in [20, 30, 45]:
    left = [label for age, label in zip(ages, labels) if age <= threshold]
    right = [label for age, label in zip(ages, labels) if age > threshold]
    weighted = (len(left) * gini(left) + len(right) * gini(right)) / len(labels)
    gain = parent_impurity - weighted
    print(threshold, left, right, "gain", round(gain, 3))`,
    firstTrace: "Threshold thirty separates all zeros from all ones, so both children have zero impurity and gain equals the full parent impurity. Other thresholds leave mixed children.",
    secondTitle: "Read the fitted questions and leaves", secondIntro: "A shallow tree exposes every learned rule. Minimum leaf size and maximum depth prevent the tree from splitting until single training examples remain.",
    secondCode: `import numpy as np
from sklearn.tree import DecisionTreeClassifier, export_text

X = np.array([
    [18, 20], [22, 80], [25, 30],
    [35, 40], [40, 90], [50, 60],
])
y = np.array([0, 0, 0, 1, 1, 1])
tree = DecisionTreeClassifier(max_depth=2, min_samples_leaf=2, random_state=7)
tree.fit(X, y)

print(export_text(tree, feature_names=["age", "spend"]))
queries = np.array([[24, 200], [45, 10]])
print("classes", tree.predict(queries))
print("leaf probabilities", tree.predict_proba(queries))`,
    secondTrace: "The printed tree shows the exact threshold and leaf class counts. Probabilities are class frequencies in reached leaves, which can be extreme and poorly calibrated in small leaves.",
    mistake: "Do not treat a feature near the root as causal or automatically important. Correlated alternatives, many candidate thresholds, missingness, and sampling can change which split wins.",
    checkpoint: "Why does an unrestricted decision tree often overfit?",
    checkpointAnswer: "It can keep splitting until leaves contain tiny or single-example groups, encoding training noise and rare accidents that do not repeat.",
    remember: "Trees greedily choose impurity-reducing questions. Read the path, validate depth and leaf size, inspect subgroup behavior, and remember that leaf frequencies are not guaranteed calibrated probabilities.",
    checks: [q("What is Gini impurity for a pure node?", ["Zero", "One", "The sample count"], 0, "One class has probability one, so one minus one squared is zero.", ["Correct. No class uncertainty remains.", "Binary Gini never reaches one.", "Impurity is a proportion-based score."]), q("What can limit tree overfitting?", ["Maximum depth and minimum leaf size", "Removing validation", "Allowing unlimited splits"], 0, "Stopping rules prevent tiny memorizing leaves.", ["Correct. Choose them with honest validation.", "Validation is needed to detect overfit.", "That increases capacity."])],
  },
  {
    lessonId: "py.mc.m3_3.l4", atomId: "py.atom.ml.curse-dimensionality", conceptId: "py.ml.curse-dimensionality",
    title: "High dimensions make nearby data surprisingly far away", requires: ["py.ml.decision-trees-guided"],
    vocabulary: [["dimension", "one feature-space axis"], ["volume", "the amount of space a feature region occupies"], ["distance concentration", "nearest and farthest distances becoming relatively similar"], ["sparsity", "observations occupying a tiny fraction of possible space"], ["sample complexity", "the amount of data needed for a desired learning quality"], ["dimensionality reduction", "representing data with fewer informative coordinates"]],
    opening: "Adding features creates more possible directions and vastly more space. With limited examples, local neighborhoods empty out and distance comparisons lose contrast.",
    outcome: "You will simulate distance concentration, calculate coverage growth, and show how irrelevant dimensions can damage nearest-neighbor validation performance.",
    why: "The curse affects kNN, clustering, density estimation, kernels, and visualization. More columns are not automatically more information.",
    mentalModel: "A few lamps can light a hallway. Add many perpendicular hallways and the same lamps leave most of the building dark.",
    firstTitle: "Watch nearest and farthest distances converge", firstIntro: "Draw random points in unit cubes of growing dimension. Compare one query's nearest distance with its farthest distance.",
    firstCode: `import numpy as np

rng = np.random.default_rng(12)
for dimensions in [1, 2, 5, 10, 50, 100]:
    points = rng.random((2000, dimensions))
    query = np.full(dimensions, 0.5)
    distances = np.linalg.norm(points - query, axis=1)
    nearest = distances.min()
    farthest = distances.max()
    contrast = (farthest - nearest) / nearest
    print(dimensions, "nearest", round(nearest, 3), "farthest", round(farthest, 3), "contrast", round(contrast, 3))

for dimensions in [2, 5, 10, 20]:
    cells_per_axis = 10
    print(dimensions, "grid cells", cells_per_axis ** dimensions)`,
    firstTrace: "Absolute distances grow, while nearest-versus-farthest contrast falls. A ten-bin grid needs ten to the power of dimensions cells, so fixed data leaves almost every cell empty.",
    secondTitle: "Add noise dimensions and measure the damage", secondIntro: "Only two features determine the label. Increasing unrelated noise features makes Euclidean neighborhoods less aligned with the real signal.",
    secondCode: `from sklearn.model_selection import StratifiedKFold, cross_val_score
from sklearn.neighbors import KNeighborsClassifier
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

rng = np.random.default_rng(21)
signal = rng.normal(size=(300, 2))
y = (signal[:, 0] + signal[:, 1] > 0).astype(int)
folds = StratifiedKFold(5, shuffle=True, random_state=3)

for noise_dimensions in [0, 2, 10, 50, 200]:
    noise = rng.normal(size=(len(signal), noise_dimensions))
    X = np.column_stack([signal, noise])
    model = make_pipeline(StandardScaler(), KNeighborsClassifier(n_neighbors=7))
    scores = cross_val_score(model, X, y, cv=folds)
    print("dimensions", X.shape[1], "accuracy", round(scores.mean(), 3))`,
    secondTrace: "Scaling cannot distinguish useful features from standardized noise. As noise axes grow, nearby points are less likely to share the true label rule and validation accuracy falls.",
    mistake: "Do not perform feature selection or dimensionality reduction before splitting. Learned selection must fit inside each training fold, or held-out data influences which dimensions survive.",
    checkpoint: "Why does collecting ten times more data not keep equal grid coverage after adding one dimension with ten bins?",
    checkpointAnswer: "The extra dimension multiplies the number of cells by ten, consuming the tenfold data increase just to preserve the old average examples per cell.",
    remember: "Feature-space volume grows exponentially, data becomes sparse, and distances concentrate. Prefer meaningful features, regularization, or fold-fitted dimensionality reduction, then validate the actual pipeline.",
    checks: [q("What is distance concentration?", ["Nearest and farthest distances become relatively similar", "Every point becomes identical", "All features become causal"], 0, "High-dimensional distances lose useful contrast.", ["Correct. Local methods become harder.", "Coordinates still differ.", "Dimension count says nothing about causality."]), q("Where should learned feature selection occur?", ["Inside each training fold", "Before splitting on all data", "After reading test answers"], 0, "Held-out data must not choose features.", ["Correct. Put selection inside a pipeline.", "That leaks validation information.", "Test answers must remain sealed."])],
  },
];

export const ML_CLASSICAL_MODEL_ATOMS = ML_CLASSICAL_MODEL_SPECS.map(guidedMasteryAtom);
export const ML_CLASSICAL_MODEL_CONCEPTS = ML_CLASSICAL_MODEL_SPECS.map(guidedMasteryConcept);
export const ML_CLASSICAL_MODEL_LESSON_CONTENT = guidedLessonContent(ML_CLASSICAL_MODEL_SPECS);

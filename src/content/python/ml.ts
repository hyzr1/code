import type { CareerTrack, Concept, CourseModule, Drill, Lesson } from "../../types";

/**
 * Machine Learning track — concepts, roadmap (modules + lessons) and drills.
 *
 * The graded coding exercises live in mlProblems.ts (generated + verified). The
 * conceptual/mathematical teaching lives in code/ml-curriculum/*.md. These
 * lessons intentionally carry no narrated lecture (atomId) yet — they are the
 * hands-on, from-scratch implementation track that turns the math into code.
 *
 * The track builds on the SWE-Python foundation and is gated to the "ml" career
 * track. Order: math -> optimization & regression -> classical ML -> neural nets.
 */

const ML: CareerTrack[] = ["ml"];

// ---------------------------------------------------------------- concepts
export const PYTHON_ML_CONCEPTS: Concept[] = [
  { id: "py.ml.vectors", title: "Vectors: the atom of ML data", stage: 4, kind: "mental-model", requires: ["py.lists", "py.loops"], language: "python" },
  { id: "py.ml.matrices", title: "Matrices and the multiply that runs every model", stage: 4, kind: "pattern", requires: ["py.ml.vectors", "py.comprehensions"], language: "python" },
  { id: "py.ml.calculus", title: "Derivatives and gradients", stage: 4, kind: "mental-model", requires: ["py.functions", "py.numbers"], language: "python" },
  { id: "py.ml.optimization", title: "Gradient descent", stage: 5, kind: "pattern", requires: ["py.ml.calculus"], language: "python" },
  { id: "py.ml.statistics", title: "Mean, spread, and correlation", stage: 4, kind: "mental-model", requires: ["py.lists", "py.numbers"], language: "python" },
  { id: "py.ml.probability", title: "Probability and Bayes' rule", stage: 5, kind: "mental-model", requires: ["py.ml.statistics"], language: "python" },
  { id: "py.ml.linear-regression", title: "Linear regression", stage: 5, kind: "pattern", requires: ["py.ml.optimization", "py.ml.statistics"], language: "python" },
  { id: "py.ml.logistic-regression", title: "Logistic regression", stage: 6, kind: "pattern", requires: ["py.ml.optimization", "py.ml.neural-nets"], language: "python" },
  { id: "py.ml.knn", title: "k-Nearest Neighbors", stage: 5, kind: "pattern", requires: ["py.ml.vectors", "py.sorting"], language: "python" },
  { id: "py.ml.kmeans", title: "k-Means clustering", stage: 5, kind: "pattern", requires: ["py.ml.vectors"], language: "python" },
  { id: "py.ml.decision-trees", title: "Decision trees: entropy and information gain", stage: 5, kind: "pattern", requires: ["py.ml.probability", "py.dicts"], language: "python" },
  { id: "py.ml.metrics", title: "Precision, recall, and F1", stage: 5, kind: "mental-model", requires: ["py.classification-metrics"], language: "python" },
  { id: "py.ml.neural-nets", title: "Neurons, layers, and the forward pass", stage: 6, kind: "pattern", requires: ["py.ml.matrices", "py.ml.optimization"], language: "python" },
  { id: "py.ml.backprop", title: "Backpropagation", stage: 6, kind: "pattern", requires: ["py.ml.neural-nets", "py.ml.calculus"], language: "python" },
  { id: "py.ml.softmax", title: "Softmax and cross-entropy", stage: 6, kind: "pattern", requires: ["py.ml.neural-nets"], language: "python" },
];

// ---------------------------------------------------------------- lessons
const ml = (slug: string) => `py.ml.${slug}`;

interface LessonSpec {
  id: string;
  module: string;
  title: string;
  goal: string;
  problems: string[];
  drills?: string[];
}

const LESSON_SPECS: LessonSpec[] = [
  // Module 0 — the math you need
  { id: "vectors", module: "py.mML0", title: "Vectors", goal: "Compute dot products, norms, and matrix-vector products — the operations under every model.", problems: ["dot-product", "vector-norm", "matvec"], drills: ["py.drill.ml.dot", "py.drill.ml.matvec-cost"] },
  { id: "matrices", module: "py.mML0", title: "Matrices", goal: "Transpose and multiply matrices, the batched form of a linear layer.", problems: ["transpose", "matmul"], drills: ["py.drill.ml.matmul-cx"] },
  { id: "calculus", module: "py.mML0", title: "Derivatives & gradients", goal: "Estimate a gradient numerically and read it as the direction of steepest ascent.", problems: ["numerical-gradient"], drills: ["py.drill.ml.gradient"] },
  { id: "statistics", module: "py.mML0", title: "Statistics", goal: "Summarize data with mean, standard deviation, standardization, and correlation.", problems: ["mean-std", "standardize", "pearson"], drills: ["py.drill.ml.standardize"] },
  { id: "probability", module: "py.mML0", title: "Probability & Bayes", goal: "Update a belief with evidence and see why rare-condition tests mislead.", problems: ["bayes-posterior"], drills: ["py.drill.ml.bayes"] },
  // Module 1 — optimization & regression
  { id: "optimization", module: "py.mML1", title: "Loss & gradient descent", goal: "Measure error with MSE, squash scores with the sigmoid, and minimize by descending the gradient.", problems: ["mse", "minimize-quadratic", "sigmoid"], drills: ["py.drill.ml.gd-cost", "py.drill.ml.sigmoid"] },
  { id: "linear-regression", module: "py.mML1", title: "Linear regression", goal: "Fit and evaluate a least-squares line and read its R-squared.", problems: ["linear-regression", "r2-score"] },
  { id: "metrics", module: "py.mML1", title: "Classification metrics", goal: "Score a classifier with precision, recall, and F1 instead of accuracy alone.", problems: ["precision-recall-f1"], drills: ["py.drill.ml.prf"] },
  // Module 2 — classical ML
  { id: "knn", module: "py.mML2", title: "k-Nearest Neighbors", goal: "Classify by majority vote of the closest training points.", problems: ["knn-classify"], drills: ["py.drill.ml.knn", "py.drill.ml.knn-cost"] },
  { id: "kmeans", module: "py.mML2", title: "k-Means", goal: "Cluster unlabeled data by alternating assignment and centroid updates.", problems: ["kmeans-step"] },
  { id: "decision-trees", module: "py.mML2", title: "Decision trees", goal: "Measure impurity with entropy and choose splits by information gain.", problems: ["entropy", "information-gain"], drills: ["py.drill.ml.entropy"] },
  // Module 3 — neural networks
  { id: "activations", module: "py.mML3", title: "Softmax & cross-entropy", goal: "Turn scores into a probability distribution and score it with cross-entropy.", problems: ["softmax", "cross-entropy"], drills: ["py.drill.ml.softmax", "py.drill.ml.ce"] },
  { id: "forward", module: "py.mML3", title: "The forward pass", goal: "Compute a dense layer as a matrix-vector product plus a bias.", problems: ["dense-forward"], drills: ["py.drill.ml.xor"] },
  { id: "backprop", module: "py.mML3", title: "Backprop & training", goal: "Derive a neuron's gradient and train logistic regression end to end.", problems: ["logistic-neuron-gradient", "train-logistic"] },
];

export const PYTHON_ML_LESSONS: Lesson[] = LESSON_SPECS.map((spec) => ({
  id: `py.lesson.ml.${spec.id}`,
  moduleId: spec.module,
  title: spec.title,
  goal: spec.goal,
  repIds: [],
  problemIds: spec.problems.map(ml),
  drillIds: spec.drills ?? [],
  language: "python" as const,
  tracks: ML,
}));

// ---------------------------------------------------------------- modules
const lessonsIn = (moduleId: string) =>
  PYTHON_ML_LESSONS.filter((lesson) => lesson.moduleId === moduleId).map((lesson) => lesson.id);

export const PYTHON_ML_MODULES: CourseModule[] = [
  {
    id: "py.mML0", part: 6, partTitle: "Machine Learning", title: "The Math You Need",
    summary: "Linear algebra, calculus, statistics, and probability — the four tools every ML method is built from, each implemented from scratch.",
    lessonIds: lessonsIn("py.mML0"), language: "python", tracks: ML,
  },
  {
    id: "py.mML1", part: 6, partTitle: "Machine Learning", title: "Optimization & Regression",
    summary: "Loss functions, gradient descent, linear regression, and how to score a model honestly.",
    lessonIds: lessonsIn("py.mML1"), language: "python", tracks: ML,
  },
  {
    id: "py.mML2", part: 6, partTitle: "Machine Learning", title: "Classical ML",
    summary: "The workhorse algorithms — k-nearest-neighbors, k-means, and decision trees — coded by hand.",
    lessonIds: lessonsIn("py.mML2"), language: "python", tracks: ML,
  },
  {
    id: "py.mML3", part: 6, partTitle: "Machine Learning", title: "Neural Networks",
    summary: "Activations, the forward pass, softmax with cross-entropy, and backpropagation training a real classifier.",
    lessonIds: lessonsIn("py.mML3"), language: "python", tracks: ML,
  },
];

// ---------------------------------------------------------------- drills
const choice = (
  id: string,
  kind: "predict-output" | "complexity" | "pattern-id",
  teaches: string[],
  prompt: string,
  choices: string[],
  answer: number,
  explanation: string,
  code?: string,
): Drill => ({ id, kind, teaches, prompt, choices, answer, explanation, estimatedSeconds: 45, language: "python", ...(code ? { code } : {}) } as Drill);

export const PYTHON_ML_DRILLS: Drill[] = [
  choice("py.drill.ml.dot", "predict-output", ["py.ml.vectors"],
    "What does this evaluate to?", ["0", "6", "[0, 0, 0]", "error"], 0,
    "The dot product with the zero vector is always 0.", "dot_product([1, 2, 3], [0, 0, 0])"),
  choice("py.drill.ml.matvec-cost", "complexity", ["py.ml.matrices", "py.complexity"],
    "A matrix-vector product for an m×n matrix costs:", ["O(m)", "O(n)", "O(m·n)", "O(m + n)"], 2,
    "Each of the m output entries is a dot product of length n.", undefined),
  choice("py.drill.ml.matmul-cx", "complexity", ["py.ml.matrices", "py.complexity"],
    "Naive multiplication of two n×n matrices costs:", ["O(n)", "O(n^2)", "O(n^3)", "O(n log n)"], 2,
    "n² output cells, each a length-n dot product.", undefined),
  choice("py.drill.ml.gradient", "pattern-id", ["py.ml.calculus"],
    "The gradient of a function points in the direction of:", ["steepest ascent", "steepest descent", "zero change", "the nearest minimum"], 0,
    "The gradient points uphill; gradient descent steps against it.", undefined),
  choice("py.drill.ml.standardize", "pattern-id", ["py.ml.statistics"],
    "Which step stops a large-scale feature from dominating gradient descent?", ["one-hot encoding", "standardization (z-scores)", "dropout", "early stopping"], 1,
    "Standardizing gives every feature mean 0 and std 1, so none dominates by scale.", undefined),
  choice("py.drill.ml.bayes", "pattern-id", ["py.ml.probability", "py.bayes-rule"],
    "A 99%-accurate test for a 1-in-1000 disease returns positive. Most likely:", ["you have the disease", "it is probably a false positive", "the test is broken", "impossible to say anything"], 1,
    "With a rare base rate, false positives outnumber true positives — that is Bayes' rule.", undefined),
  choice("py.drill.ml.gd-cost", "complexity", ["py.ml.optimization", "py.complexity"],
    "Full-batch gradient descent for T epochs over n samples of d features costs:", ["O(T)", "O(n·d)", "O(T·d)", "O(T·n·d)"], 3,
    "Each epoch touches all n samples across d features.", undefined),
  choice("py.drill.ml.sigmoid", "predict-output", ["py.ml.neural-nets"],
    "What does this return?", ["0.0", "0.5", "1.0", "undefined"], 1,
    "sigmoid(0) = 1/(1+e^0) = 1/2.", "sigmoid(0)"),
  choice("py.drill.ml.prf", "pattern-id", ["py.ml.metrics"],
    "Of all items the model flagged positive, the fraction actually positive is:", ["recall", "precision", "F1", "accuracy"], 1,
    "Precision = TP / (TP + FP): correctness among predicted positives.", undefined),
  choice("py.drill.ml.knn", "pattern-id", ["py.ml.knn"],
    "Classifying a point by the labels of its closest training examples is:", ["k-means", "k-nearest-neighbors", "linear regression", "PCA"], 1,
    "kNN votes with the k closest labeled points.", undefined),
  choice("py.drill.ml.knn-cost", "complexity", ["py.ml.knn", "py.complexity"],
    "One kNN prediction over n training points of dimension d costs:", ["O(1)", "O(d)", "O(log n)", "O(n·d)"], 3,
    "Every training point must be measured against the query.", undefined),
  choice("py.drill.ml.entropy", "predict-output", ["py.ml.decision-trees"],
    "What is the entropy of a pure label set?", ["0.0", "0.5", "1.0", "log2(n)"], 0,
    "A pure set is perfectly certain, so its entropy is 0 bits.", "entropy([1, 1, 1, 1])"),
  choice("py.drill.ml.softmax", "predict-output", ["py.ml.softmax"],
    "What does the sum of a softmax output equal?", ["1.0", "0.0", "the number of classes", "the max logit"], 0,
    "Softmax normalizes to a probability distribution, so it sums to 1.", "sum(softmax([2, 1, 0]))"),
  choice("py.drill.ml.ce", "pattern-id", ["py.ml.softmax"],
    "The right loss for a probability output over classes is:", ["mean squared error", "cross-entropy", "mean absolute error", "hinge loss"], 1,
    "Cross-entropy penalizes confident wrong probabilities sharply and pairs cleanly with softmax.", undefined),
  choice("py.drill.ml.xor", "pattern-id", ["py.ml.neural-nets"],
    "A single linear neuron cannot learn XOR because XOR is:", ["too small", "not linearly separable", "too noisy", "high-dimensional"], 1,
    "No straight line separates XOR's classes; you need a hidden layer.", undefined),
];

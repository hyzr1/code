import type { LectureQuestion } from "../../types";
import { guidedLessonContent, guidedMasteryAtom, guidedMasteryConcept, type GuidedMasterySpec } from "./guidedMastery";

const q = (question: string, choices: [string, string, string], answer: 0 | 1 | 2, explanation: string, why: [string, string, string]): LectureQuestion => ({ question, choices, answer, explanation, why });

const ML_NUMERICAL_PYTHON_SPECS: GuidedMasterySpec[] = [
  {
    lessonId: "py.mc.m2_1.l1", atomId: "py.atom.ml.numpy-arrays", conceptId: "py.ml.numpy-arrays",
    title: "A NumPy array has values, a shape, and one dtype", requires: ["py.ml.multiple-testing-power"],
    vocabulary: [["array", "a rectangular container for numerical values"], ["axis", "one direction through an array"], ["shape", "the length of every axis"], ["dimension", "the number of axes, also called ndim"], ["dtype", "the single storage type used by the array"], ["broadcasting", "matching compatible shapes without manually copying values"]],
    opening: "A Python list holds separate objects. A NumPy array stores one regular block of values. Its shape tells every operation how those values are organized.",
    outcome: "You will inspect shape, dimension, dtype, indexing, and broadcasting, then predict whether two shapes can operate together.",
    why: "Most ML bugs are shape or dtype bugs. Reading those two facts before calculating makes later model code much easier to debug.",
    mentalModel: "Picture a labeled stack of trays. Shape says how many trays, rows, and columns exist. Dtype says what kind of number fits in every slot.",
    firstTitle: "Read an array before changing it", firstIntro: "This array has two rows and three columns. Indexing one row removes an axis; slicing a range keeps the rectangular structure.",
    firstCode: `import numpy as np

scores = np.array([[8, 6, 9], [7, 5, 10]], dtype=np.float64)
print("shape", scores.shape)
print("dimensions", scores.ndim)
print("dtype", scores.dtype)
print("one value", scores[1, 2])
print("one row shape", scores[0].shape)
print("row slice shape", scores[0:1].shape)`,
    firstTrace: "Shape two-by-three means six values arranged on two axes. `scores[0]` has shape three because one row index consumes the row axis. `scores[0:1]` keeps a length-one row axis.",
    secondTitle: "Broadcast from the trailing axes", secondIntro: "NumPy compares shapes from right to left. Each pair must match, or one length must be one. A length-one axis stretches conceptually without making manual copies.",
    secondCode: `rows = np.array([[10], [20], [30]])
columns = np.array([[1, 2, 3, 4]])
grid = rows + columns

print(rows.shape, columns.shape, grid.shape)
print(grid)

features = np.array([[2, 5, 8], [3, 6, 9]])
feature_offsets = np.array([100, 200, 300])
print(features + feature_offsets)`,
    secondTrace: "Shapes three-by-one and one-by-four become three-by-four. Shapes two-by-three and three compare as two-by-three and one-by-three, so the three offsets align with the feature columns.",
    mistake: "Do not guess what an axis means from its position alone. Write the shape contract, such as batch-by-features, and assert it near boundaries. A broadcast can be legal while expressing the wrong intent.",
    checkpoint: "Can shapes five-by-three and three broadcast for addition? Why?",
    checkpointAnswer: "Yes. Treat three as one-by-three. The trailing lengths match at three, and the missing leading axis behaves like length one.",
    remember: "Inspect shape, ndim, and dtype first. Indexing can remove axes. Broadcasting compares trailing axes and accepts equal lengths or a length of one.",
    checks: [q("What does shape `(4, 2)` mean?", ["Four rows and two columns", "Four dimensions and two values", "One row with eight object types"], 0, "The tuple lists each axis length.", ["Correct. It is a two-dimensional array with eight slots.", "The number of dimensions is the tuple length, which is two.", "Shape does not describe object types."]), q("Which pair can broadcast together?", ["`(3, 1)` and `(1, 4)`", "`(3, 2)` and `(4,)`", "`(5, 3)` and `(2,)`"], 0, "One-length axes can expand to the other length.", ["Correct. The result is three-by-four.", "Trailing lengths two and four conflict.", "Trailing lengths three and two conflict."])],
  },
  {
    lessonId: "py.mc.m2_1.l2", atomId: "py.atom.ml.numpy-vectorization", conceptId: "py.ml.numpy-vectorization",
    title: "Vectorization states the whole array operation", requires: ["py.ml.numpy-arrays"],
    vocabulary: [["vectorization", "expressing work as array operations instead of Python element loops"], ["elementwise", "applying the same operation to matching positions"], ["ufunc", "a NumPy function implemented to operate elementwise efficiently"], ["mask", "a Boolean array that selects positions"], ["reduction", "combining values along an axis, such as sum or mean"], ["temporary array", "an intermediate allocation produced during a calculation"]],
    opening: "Vectorization does not mean deleting every loop from existence. It means moving regular numerical loops into NumPy operations that know the array shape and run in compiled code.",
    outcome: "You will replace element loops with ufuncs, masks, and reductions, choose axes explicitly, and recognize when broadcasting creates a large temporary array.",
    why: "Vectorized code is usually shorter and faster, but clear shape intent matters more than clever one-line expressions.",
    mentalModel: "A Python loop hands one envelope to NumPy at a time. A vectorized operation hands over the whole organized box with one instruction.",
    firstTitle: "Combine ufuncs, masks, and reductions", firstIntro: "Standardize each feature column, then average only positive standardized values. Every intermediate shape remains visible.",
    firstCode: `import numpy as np

data = np.array([[2.0, 20.0], [4.0, 10.0], [6.0, 30.0]])
means = data.mean(axis=0)
scales = data.std(axis=0)
standardized = (data - means) / scales
positive = standardized > 0

print("means", means)
print("standardized shape", standardized.shape)
print("positive values", standardized[positive])
print("column sums", standardized.sum(axis=0))`,
    firstTrace: "Axis zero reduces the row axis and returns one value per column. Those length-two arrays broadcast back across all three rows. The Boolean mask keeps only positions whose condition is true.",
    secondTitle: "Build pairwise distances without Python loops", secondIntro: "Insert one length-one axis into each point set. Broadcasting forms every pairwise coordinate difference, then a reduction collapses coordinates into squared distances.",
    secondCode: `left = np.array([[0.0, 0.0], [2.0, 1.0]])
right = np.array([[1.0, 0.0], [3.0, 2.0], [0.0, 4.0]])

differences = left[:, None, :] - right[None, :, :]
squared_distances = (differences ** 2).sum(axis=2)

print("difference shape", differences.shape)
print(squared_distances)`,
    secondTrace: "The difference shape is two-by-three-by-two: two left points, three right points, and two coordinates. Summing axis two removes the coordinate axis and leaves a two-by-three distance table.",
    mistake: "Do not assume vectorized means memory-free. The pairwise difference array grows as left-count times right-count times feature-count. For large datasets, compute blocks or use a specialized routine.",
    checkpoint: "If data has shape batch-by-features, what does `data.mean(axis=0)` return?",
    checkpointAnswer: "It collapses the batch axis and returns one mean for each feature, so its shape is the feature count.",
    remember: "Vectorize regular numerical work with ufuncs, masks, broadcasting, and explicit-axis reductions. Track intermediate shapes and memory, not only line count.",
    checks: [q("What does a reduction do?", ["Combines values along an axis", "Changes every dtype to text", "Always adds a new axis"], 0, "Sum, mean, min, and max are common reductions.", ["Correct. The reduced axis normally disappears.", "Dtype conversion is a different operation.", "A reduction usually removes an axis unless keepdims is used."]), q("Why might pairwise broadcasting be dangerous on huge arrays?", ["It can allocate a very large temporary", "It cannot subtract numbers", "It always changes the inputs"], 0, "The intermediate contains every pair and every feature.", ["Correct. Chunking may be necessary.", "Subtraction is a normal vectorized operation.", "Broadcasted expressions do not inherently mutate inputs."])],
  },
  {
    lessonId: "py.mc.m2_1.l3", atomId: "py.atom.ml.numpy-linear-algebra", conceptId: "py.ml.numpy-linear-algebra",
    title: "Use matrix operations that match the mathematical question", requires: ["py.ml.numpy-vectorization"],
    vocabulary: [["matrix multiplication", "combining rows of the left matrix with columns of the right"], ["matrix-vector product", "applying a linear transformation to one vector"], ["linear system", "equations written as A times x equals b"], ["solve", "finding x without explicitly constructing A inverse"], ["decomposition", "factoring a matrix into structured pieces"], ["singular value", "a nonnegative scale factor revealed by SVD"]],
    opening: "NumPy uses `*` for position-by-position multiplication and `@` for matrix multiplication. That single symbol difference changes the entire mathematical operation.",
    outcome: "You will distinguish elementwise multiplication from matmul, solve a linear system without an inverse, and use SVD to expose directions and scales.",
    why: "Linear regression, embeddings, neural layers, and dimensionality reduction are built from these operations. Choosing the matching API improves correctness and numerical stability.",
    mentalModel: "Elementwise multiplication pairs matching tiles. Matrix multiplication sends each input through a transformation. Solving asks which input would have produced the observed output.",
    firstTitle: "Read the shape contract for matmul", firstIntro: "A two-by-three matrix maps a length-three vector to a length-two vector. The inner sizes must match; the outer sizes become the result shape.",
    firstCode: `import numpy as np

weights = np.array([[1.0, 2.0, 0.0], [-1.0, 0.5, 3.0]])
features = np.array([4.0, 2.0, 1.0])

prediction = weights @ features
print(weights.shape, features.shape, prediction.shape)
print("matrix-vector", prediction)
print("elementwise row", weights[0] * features)`,
    firstTrace: "Matrix-vector multiplication takes one dot product per row and returns two predictions. Elementwise multiplication keeps three separate products and does not add them.",
    secondTitle: "Solve equations and inspect an SVD", secondIntro: "`solve` targets A times x equals b directly. SVD factors a matrix into input directions, nonnegative scales, and output directions.",
    secondCode: `system = np.array([[3.0, 1.0], [1.0, 2.0]])
target = np.array([9.0, 8.0])
solution = np.linalg.solve(system, target)
print("solution", solution)
print("check", system @ solution)

matrix = np.array([[3.0, 0.0], [0.0, 1.0], [0.0, 0.0]])
u, singular_values, vt = np.linalg.svd(matrix, full_matrices=False)
reconstructed = u @ np.diag(singular_values) @ vt
print("singular values", singular_values)
print("reconstruction", np.allclose(matrix, reconstructed))`,
    secondTrace: "The solve check reproduces the target. SVD reports scales three and one. Multiplying the factors reconstructs the original three-by-two matrix up to floating-point rounding.",
    mistake: "Do not compute an inverse just to solve A times x equals b. `solve` is clearer, usually faster, and generally more stable. Also inspect conditioning when tiny input changes produce huge solution changes.",
    checkpoint: "What result shape comes from a five-by-three matrix multiplied by a length-three vector?",
    checkpointAnswer: "Length five. Each of the matrix's five rows produces one dot product with the length-three vector.",
    remember: "Use `*` for elementwise work and `@` for linear maps. Use `solve` for linear systems. Decompositions expose useful structure without pretending every matrix has a safe inverse.",
    checks: [q("Which operator performs matrix multiplication in NumPy?", ["`@`", "`*`", "`//`"], 0, "The at sign follows matrix multiplication shape rules.", ["Correct. Inner dimensions must agree.", "Asterisk is elementwise multiplication.", "Double slash is floor division."]), q("Why prefer `solve(A, b)` to `inv(A) @ b`?", ["It states the problem directly and is usually more stable", "It works only on text arrays", "It always returns an exact integer"], 0, "A solver avoids explicitly forming the inverse.", ["Correct. It is also usually more efficient.", "Linear solvers operate on numeric arrays.", "Floating-point solutions are generally approximate."])],
  },
  {
    lessonId: "py.mc.m2_1.l4", atomId: "py.atom.ml.numpy-stability", conceptId: "py.ml.numpy-stability",
    title: "Stable formulas keep floating-point numbers meaningful", requires: ["py.ml.numpy-linear-algebra"],
    vocabulary: [["floating point", "a finite-precision representation of real numbers"], ["overflow", "a result too large for the numeric format"], ["underflow", "a tiny magnitude rounded toward zero"], ["cancellation", "losing meaningful digits when subtracting close large values"], ["log-sum-exp", "a stable way to compute the log of summed exponentials"], ["tolerance", "an allowed numerical difference used for approximate comparison"]],
    opening: "A correct algebra formula can be a bad computer formula. Floating-point numbers have limited range and precision, so equivalent expressions may behave very differently.",
    outcome: "You will recognize overflow, cancellation, and invalid exact comparisons, then implement stable sigmoid and log-sum-exp formulas.",
    why: "Training losses and probabilities often use exponentials and logarithms. Stability bugs can silently create infinity, zero, or NaN and destroy an otherwise correct model.",
    mentalModel: "A calculator has a finite ruler and a finite notebook. Values beyond the ruler overflow; details smaller than the notebook's spacing disappear.",
    firstTitle: "Rearrange formulas before values become extreme", firstIntro: "The ordinary sigmoid overflows when it computes exponential of a huge positive number. A branch chooses an algebraically equivalent expression with a safe exponent sign.",
    firstCode: `import numpy as np

def stable_sigmoid(values):
    values = np.asarray(values, dtype=float)
    result = np.empty_like(values)
    positive = values >= 0
    result[positive] = 1 / (1 + np.exp(-values[positive]))
    exp_values = np.exp(values[~positive])
    result[~positive] = exp_values / (1 + exp_values)
    return result

print(stable_sigmoid(np.array([-1000.0, 0.0, 1000.0])))`,
    firstTrace: "For positive inputs, the exponent is negative. For negative inputs, exponential receives the original negative value. Both branches avoid asking for exponential of positive one thousand.",
    secondTitle: "Shift exponentials and compare approximately", secondIntro: "Subtracting the largest logit makes every exponent nonpositive. Adding the maximum afterward preserves the exact mathematical result. `isclose` handles expected rounding.",
    secondCode: `def logsumexp(values):
    values = np.asarray(values, dtype=float)
    maximum = values.max()
    return maximum + np.log(np.exp(values - maximum).sum())

logits = np.array([1000.0, 1001.0, 999.0])
print("stable", logsumexp(logits))
print("finite", np.isfinite(logsumexp(logits)))

computed = 0.1 + 0.2
print(computed == 0.3)
print(np.isclose(computed, 0.3, rtol=1e-12, atol=1e-12))`,
    secondTrace: "The shifted exponents stay between zero and one, so their sum is finite. Exact decimal equality fails because those fractions are approximated in binary; tolerance comparison expresses the intended precision.",
    mistake: "Do not hide NaN and infinity by replacing them blindly. Check with `isfinite`, identify the first unstable operation, then choose a stable formula, suitable dtype, clipping rule, or scaling strategy with a documented reason.",
    checkpoint: "Why does subtracting the maximum stabilize log-sum-exp without changing its value?",
    checkpointAnswer: "Factor exponential of the maximum out of the sum. Taking the log adds that maximum back, while every remaining exponent is zero or negative.",
    remember: "Equivalent algebra can behave differently in finite precision. Shift exponentials, choose stable branches, compare with justified tolerances, and investigate non-finite values at their source.",
    checks: [q("What is overflow?", ["A computed magnitude exceeds the format's range", "A loop uses too few lines", "Two arrays have equal shapes"], 0, "Floating-point formats can represent only a bounded range.", ["Correct. The result may become infinity.", "Code length is unrelated.", "Shape agreement does not describe numeric range."]), q("How should most floating-point results be compared?", ["With a justified tolerance", "By converting them to strings", "With exact equality in every case"], 0, "Small representation and rounding differences are expected.", ["Correct. Relative and absolute tolerances express acceptable error.", "String formatting can hide differences rather than reason about them.", "Exact equality is often too strict for computed values."])],
  },
  {
    lessonId: "py.mc.m2_1.l5", atomId: "py.atom.ml.numpy-random-generators", conceptId: "py.ml.numpy-random-generators",
    title: "Random generators make experiments reproducible and independent", requires: ["py.ml.numpy-stability"],
    vocabulary: [["pseudorandom", "deterministic values designed to behave like random draws"], ["seed", "the starting information that recreates a generator stream"], ["generator", "an object that owns and advances one random state"], ["stream", "the ordered sequence emitted by a generator"], ["SeedSequence", "a NumPy tool for deriving independent child streams"], ["reproducibility", "the ability to rerun a recorded setup and obtain the same result"]],
    opening: "A seed makes pseudorandom choices repeatable. A teammate can then reproduce the same bug and result.",
    outcome: "You will use `default_rng`, reproduce a stream, create independent child generators, and avoid accidental coupling through global random state.",
    why: "Data splits, initialization, augmentation, and sampling use randomness. One uncontrolled source can make a result impossible to rerun.",
    mentalModel: "A seed is a map coordinate. A generator follows one path. Separate child generators follow separate paths.",
    firstTitle: "Own the generator and record its seed", firstIntro: "Two new generators with the same seed produce the same stream. Reusing one generator continues its stream rather than restarting it.",
    firstCode: `import numpy as np

first = np.random.default_rng(2026)
second = np.random.default_rng(2026)

print(first.integers(0, 10, size=5))
print(second.integers(0, 10, size=5))
print("continued", first.integers(0, 10, size=5))`,
    firstTrace: "The first draws match because both generators start at seed two thousand twenty-six. The continued draw differs because the first generator's state advanced after producing five values.",
    secondTitle: "Give separate jobs separate child streams", secondIntro: "A SeedSequence spawns child states for splitting, augmentation, and initialization. Consuming extra augmentation randomness no longer changes the train split.",
    secondCode: `root = np.random.SeedSequence(9001)
split_seed, augment_seed, init_seed = root.spawn(3)
split_rng = np.random.default_rng(split_seed)
augment_rng = np.random.default_rng(augment_seed)
init_rng = np.random.default_rng(init_seed)

indices = np.arange(10)
split_rng.shuffle(indices)
noise = augment_rng.normal(0, 0.1, size=4)
weights = init_rng.normal(0, 0.01, size=(2, 3))

print("split", indices)
print("noise", noise.round(3))
print("weights", weights.round(3))`,
    secondTrace: "Each job owns an independent stream derived from the recorded root seed. Adding one more augmentation draw changes only augmentation, not the split or initial weights.",
    mistake: "Do not repeatedly reseed a global generator inside functions. Pass a generator explicitly, record root seeds with the run configuration, and remember that library versions or nondeterministic hardware kernels can still affect exact reproducibility.",
    checkpoint: "Why use separate child generators for data splitting and augmentation?",
    checkpointAnswer: "Their random consumption becomes independent. Changing how many augmentation draws occur cannot silently change which examples enter the training split.",
    remember: "Use `default_rng`, record seeds, pass generator objects explicitly, and spawn independent streams for independent jobs. A seed controls one source, not every possible source of nondeterminism.",
    checks: [q("What happens when two fresh generators use the same seed?", ["They produce the same stream", "They become truly random hardware", "They share one mutable state object"], 0, "Pseudorandom generation is deterministic from its starting state.", ["Correct. This enables reproduction.", "A seed does not change the generator into hardware randomness.", "They have separate states initialized identically."]), q("What is the benefit of child streams?", ["One task's draws do not shift another task's sequence", "Every number becomes unique", "Seeds are no longer recorded"], 0, "Independent generator state removes accidental coupling.", ["Correct. Experiments become easier to modify safely.", "Random streams can still repeat values.", "The root seed should still be recorded."])],
  },
];

export const ML_NUMERICAL_PYTHON_ATOMS = ML_NUMERICAL_PYTHON_SPECS.map(guidedMasteryAtom);
export const ML_NUMERICAL_PYTHON_CONCEPTS = ML_NUMERICAL_PYTHON_SPECS.map(guidedMasteryConcept);
export const ML_NUMERICAL_PYTHON_LESSON_CONTENT = guidedLessonContent(ML_NUMERICAL_PYTHON_SPECS);

import type { LectureQuestion } from "../../types";
import {
  guidedLessonContent,
  guidedMasteryAtom,
  guidedMasteryConcept,
  type GuidedMasterySpec,
} from "./guidedMastery";

const q = (
  question: string,
  choices: [string, string, string],
  answer: 0 | 1 | 2,
  explanation: string,
  why: [string, string, string],
): LectureQuestion => ({ question, choices, answer, explanation, why });

const ML_LINEAR_ALGEBRA_SPECS: GuidedMasterySpec[] = [
  {
    lessonId: "py.mc.m1_1.l4",
    atomId: "py.atom.ml.matrices",
    conceptId: "py.ml.matrices-guided",
    title: "Matrices and matrix-vector products",
    requires: ["py.ml.norm-families"],
    vocabulary: [
      ["matrix", "a rectangular grid of numbers arranged in rows and columns"],
      ["shape", "the number of rows followed by the number of columns"],
      ["matrix-vector product", "one dot product between each matrix row and one input vector"],
      ["linear map", "a transformation that preserves vector addition and scaling"],
    ],
    opening: "A matrix is not merely a table. In machine learning, it is usually an action. It accepts a vector, lets every row ask its own weighted question, and returns a new vector of answers.",
    outcome: "You will be able to read matrix shape, check compatible dimensions, and compute a matrix-vector product one row at a time.",
    why: "A dense neural-network layer begins with this operation. A batch of features meets a grid of weights. If shape and row meaning are unclear here, every later layer feels mysterious.",
    mentalModel: "Picture several judges looking at the same contestant. The input vector holds the contestant's features. Each matrix row is one judge's scoring rule. The output vector holds all judges' scores.",
    idea: [
      "A **matrix** is a grid of numbers written in rows and columns. Its **shape** is those two counts, rows first. A grid with two rows and three columns is a two-by-three matrix.",
      "In machine learning a matrix is usually doing something rather than storing something. It takes a vector in and hands a different vector back. That is what **linear map** means: a rule that turns one list of numbers into another.",
      "The rule itself is short. Take one row of the matrix. Pair its numbers with the numbers in the input vector, one for one. Multiply each pair, then add the results together. That single number is one output. Pairing, multiplying and adding like this is a **dot product**.",
      "Now do the same for every row. One row gives one output number. So a matrix with two rows always answers with a vector of length two, whatever went in.",
      "That is where the shape rule comes from, and it is worth saying slowly. Every row needs exactly as many weights as the vector has values, or the pairing runs out partway. So the number of **columns** must match the input length. The number of **rows** decides the output length.",
    ],
    firstTitle: "Compute two weighted scores",
    firstIntro: "This two-by-three matrix accepts a length-three vector. Each of its two rows produces one output number.",
    firstCode: `def matrix_vector(matrix, vector):
    # each row needs one weight per input value, or the pairing runs out
    if any(len(row) != len(vector) for row in matrix):
        raise ValueError("shape mismatch")
    return [
        # pair, multiply, add: that is one dot product, and one output number
        sum(weight * value for weight, value in zip(row, vector))
        for row in matrix   # one row in, one number out
    ]

weights = [[1, 0, 2], [-1, 3, 1]]
features = [4, 5, 2]
print(matrix_vector(weights, features))`,
    firstTrace:
      "Take it one row at a time. The first row is `[1, 0, 2]` and the vector is `[4, 5, 2]`. Pair them up: one times four is four, zero times five is zero, two times two is four. Add those three and you get eight, and that is the entire first output. Now the second row, `[-1, 3, 1]`, against the same vector: minus one times four is minus four, three times five is fifteen, one times two is two. Adding those gives thirteen. Two rows produced two numbers, so the answer is `[8, 13]`. Notice that the input had length three while the output has length two. The columns matched the input, and the rows decided the output.",
    secondTitle: "Connect the result to a tiny model",
    secondIntro: "Let the features mean hours studied, hours slept, and missed classes. Each row can score a different outcome.",
    secondCode: `student = [3, 8, 1]
rules = [
    [2.0, 0.5, -3.0],
    [0.2, -0.1, 1.5],
]

exam_score, absence_risk = matrix_vector(rules, student)
print(exam_score, absence_risk)`,
    secondTrace: "The first score is `6 + 4 - 3`, or seven. The second is `0.6 - 0.8 + 1.5`, or `1.3`. The arithmetic is valid because feature order has the same meaning for the vector and every row.",
    mistake: "Do not check shape alone and ignore meaning. A length-three vector ordered as sleep, study, absences has the right shape but feeds each weight the wrong feature.",
    checkpoint: "A matrix has shape three-by-four. What input-vector length does it require, and how long is its output?",
    checkpointAnswer: "It requires four input values because each row has four weights. It produces three output values because the matrix has three rows.",
    remember: "A matrix-vector product is a collection of row-wise dot products. Columns match input features; rows become output features.",
    checks: [
      q("What is the output length of a 5-by-3 matrix times a length-3 vector?", ["3", "5", "15"], 1, "One output comes from each of five rows.", ["Three is the required input length.", "Correct. Five rows create five dot products.", "Fifteen counts scalar multiplications, not output entries."]),
      q("Why can a shape-correct product still be semantically wrong?", ["Feature positions may mean different things", "Matrix multiplication is random", "Rows cannot contain zeros"], 0, "Coordinate meaning must match weight meaning.", ["Correct. Shape checks size, not semantics.", "The operation is deterministic.", "Zero weights are valid and useful."]),
    ],
  },
  {
    lessonId: "py.mc.m1_1.l5",
    atomId: "py.atom.ml.matrix-multiplication",
    conceptId: "py.ml.matrix-multiplication",
    title: "Matrix multiplication is many dot products",
    requires: ["py.ml.matrices-guided"],
    vocabulary: [
      ["inner dimension", "the shared size that tells how many pairs each dot product uses"],
      ["output cell", "one row-by-column dot product in the result"],
      ["composition", "applying one transformation and then another"],
      ["batch", "several examples processed together"],
    ],
    opening: "Matrix multiplication looks larger than it is. Every output cell follows one familiar rule: choose a row from the left matrix, choose a column from the right matrix, and take their dot product.",
    outcome: "You will be able to predict output shape, compute a cell, and explain how multiplication composes model layers or processes a batch.",
    why: "Training code performs enormous matrix multiplications. Understanding the small version lets you reason about tensor shapes, computation cost, and what each axis represents.",
    mentalModel: "Imagine a spreadsheet of interviews. Every left row is a candidate. Every right column is a scoring rubric. One output cell is that candidate scored by that rubric.",
    idea: [
      "Multiplying two matrices is the dot product you already know, done many times over. There is no new operation to learn here, only a bookkeeping pattern.",
      "Take the left matrix row by row and the right matrix column by column. Every row meets every column exactly once. Each meeting is one dot product, and each dot product fills in one number of the answer.",
      "That gives you the shape of the result before you do any arithmetic. The answer has one row for each row on the left, and one column for each column on the right. An `m`-by-`n` matrix times an `n`-by-`p` matrix produces an `m`-by-`p` matrix.",
      "It also tells you when the multiplication is illegal. A row from the left and a column from the right must hold the same count of numbers, or the pairing runs out. So the left matrix's column count has to equal the right matrix's row count. The two inner numbers must agree, and the outer two survive into the answer.",
      "One warning catches almost everyone. Matrix multiplication is **not commutative**: `A` times `B` is generally not the same as `B` times `A`, and often the reversed version is not even a legal shape. Order carries meaning, because each product says apply this transformation, then that one.",
    ],
    firstTitle: "Multiply a two-by-three matrix by a three-by-two matrix",
    firstIntro: "The shared inner size is three. The result keeps the left row count and right column count, so its shape is two-by-two.",
    firstCode: `def transpose(matrix):
    return [list(column) for column in zip(*matrix)]

def matrix_multiply(left, right):
    # the inner numbers must agree: left's columns == right's rows
    if not left or not right or len(left[0]) != len(right):
        raise ValueError("shape mismatch")
    columns = transpose(right)   # walk the right matrix column by column
    return [
        # every row meets every column once; each meeting is one dot product
        [sum(a * b for a, b in zip(row, column))
         for column in columns]
        for row in left
    ]

a = [[1, 2, 3], [4, 5, 6]]
b = [[1, 0], [0, 1], [1, 1]]
print(matrix_multiply(a, b))`,
    firstTrace: "Top-left uses `[1,2,3]` dot `[1,0,1]`, giving four. Top-right uses `[1,2,3]` dot `[0,1,1]`, giving five. The second row gives ten and eleven. The result is `[[4,5],[10,11]]`.",
    secondTitle: "See a batch pass through weights",
    secondIntro: "Each data row is one example. Each weight column creates one learned output feature.",
    secondCode: `batch = [
    [2.0, 1.0],
    [0.0, 3.0],
]
weights = [
    [1.0, -1.0],
    [2.0, 0.5],
]

print(matrix_multiply(batch, weights))`,
    secondTrace: "The output remains two rows because there are two examples. It has two columns because the weight matrix defines two output features. Every example is transformed by the same weights.",
    mistake: "Do not multiply matching positions as if every matrix product were elementwise. Matrix multiplication combines a left row with a right column and sums the products.",
    checkpoint: "Can a four-by-three matrix multiply a two-by-five matrix? If not, which dimensions disagree?",
    checkpointAnswer: "No. The left matrix has inner size three, while the right matrix has two rows. A four-by-three matrix can multiply a three-by-five matrix and produce four-by-five.",
    remember: "For shapes `(m,n)` and `(n,p)`, the inner `n` values pair up and the result has shape `(m,p)`.",
    checks: [
      q("What creates one output cell in matrix multiplication?", ["A left row dotted with a right column", "Two matching rows added", "All matrix values multiplied together"], 0, "One row-column dot product produces one cell.", ["Correct. Repeat it for every result position.", "Columns, not another row, pair with the left row.", "Only one row and one column contribute to a cell."]),
      q("What is the shape of (7,4) times (4,2)?", ["(7,2)", "(4,4)", "(7,4,2)"], 0, "Keep the outside dimensions after matching the inner fours.", ["Correct. Seven result rows and two result columns remain.", "The shared four disappears into each dot product.", "Ordinary matrix output has two axes."]),
    ],
  },
  {
    lessonId: "py.mc.m1_1.l6",
    atomId: "py.atom.ml.transpose-identity-inverse",
    conceptId: "py.ml.transpose-identity-inverse",
    title: "Transpose, identity, and inverse",
    requires: ["py.ml.matrix-multiplication"],
    vocabulary: [
      ["transpose", "the matrix formed by turning rows into columns"],
      ["identity matrix", "a square matrix that leaves vectors unchanged"],
      ["inverse", "a matrix that undoes another matrix's transformation"],
      ["singular", "not invertible because some information is collapsed"],
    ],
    opening: "These three operations have different jobs. Transpose reorients a matrix. Identity does nothing on purpose. An inverse attempts to undo a transformation, but an inverse does not always exist.",
    outcome: "You will be able to transpose shapes, recognize identity behavior, and explain why information-losing matrices cannot be inverted.",
    why: "Transposes appear in gradients and data layout. Identity appears in residual connections and regularization. Inverses explain linear systems, even though practical ML code usually solves systems without building an inverse explicitly.",
    mentalModel: "Transpose rotates the labeling grid across its diagonal. Identity is a clear window. Inverse is a rewind button. A rewind cannot recover details that the original action erased.",
    idea: [
      "Three tools turn up constantly in machine-learning code, and each has a plain job.",
      "The **transpose** flips a matrix over its diagonal. Row one becomes column one, row two becomes column two, and so on. A two-by-three matrix transposes into a three-by-two matrix. Most of the time you reach for it to make two shapes line up so that a product becomes legal.",
      "The **identity matrix** is the do-nothing matrix. It carries ones down its diagonal and zeros everywhere else. Multiply any matrix by it and the same matrix comes back untouched. It plays the part that the number `1` plays in ordinary arithmetic.",
      "The **inverse** is the undo matrix. The inverse of `A` is written `A` to the power minus one, and multiplying the two together gives the identity. Doing `A` and then its inverse leaves you exactly where you started.",
      "Here is the part that matters in practice. Not every matrix has an inverse. If a transformation throws information away, nothing can bring it back. Squash a flat shape down onto a single line and you cannot un-squash it, because many different inputs landed on the same output. A matrix like that is called **singular**, and asking for its inverse is an error rather than a slow computation.",
    ],
    firstTitle: "Turn rows into columns",
    firstIntro: "A two-by-three matrix becomes three-by-two. Entry at row `r`, column `c` moves to row `c`, column `r`.",
    firstCode: `def transpose(matrix):
    # zip(*matrix) reads the grid column-wise, so rows and columns swap
    return [list(column) for column in zip(*matrix)]

matrix = [[1, 2, 3], [4, 5, 6]]   # two rows, three columns
print(transpose(matrix))`,
    firstTrace: "The first column `[1,4]` becomes the first output row. The next columns become `[2,5]` and `[3,6]`. The result is `[[1,4],[2,5],[3,6]]`.",
    secondTitle: "Undo a tiny diagonal scaling",
    secondIntro: "This matrix doubles the first coordinate and triples the second. Its inverse divides those coordinates by the same amounts.",
    secondCode: `def apply_diagonal(scales, vector):
    return [scale * value for scale, value in zip(scales, vector)]

transform = [2.0, 3.0]
inverse = [1 / 2, 1 / 3]
original = [4.0, 9.0]
changed = apply_diagonal(transform, original)
restored = apply_diagonal(inverse, changed)
print(changed, restored)`,
    secondTrace: "The transform produces `[8,27]`. The inverse produces `[4,9]` again. If a scale were zero, that coordinate would be erased, division by zero would fail, and no inverse could restore the original value.",
    mistake: "Do not write `inverse(A) @ b` merely because algebra uses an inverse symbol. Numerical libraries normally solve `Ax=b` directly because solving is faster and more stable.",
    checkpoint: "Why is a matrix that maps both `[1,0]` and `[0,1]` to the same output impossible to invert?",
    checkpointAnswer: "The output no longer tells which input was used. Two different inputs collapsed to one result, so an inverse would need to guess. Lost information cannot be recovered uniquely.",
    remember: "Transpose swaps axes, identity preserves everything, and an inverse exists only when the transformation preserves enough information to be undone uniquely.",
    checks: [
      q("What shape is the transpose of a 3-by-8 matrix?", ["8-by-3", "3-by-8", "24-by-1"], 0, "Transpose swaps row and column counts.", ["Correct. Rows become columns.", "That is the original shape.", "Transpose does not flatten entries."]),
      q("What makes a transformation singular?", ["It collapses distinct inputs together", "It contains negative numbers", "It is square"], 0, "Information loss prevents a unique inverse.", ["Correct. One output cannot identify the original input.", "Negative values can be invertible.", "Many square matrices are invertible."]),
    ],
  },
  {
    lessonId: "py.mc.m1_1.l7",
    atomId: "py.atom.ml.span-basis-rank",
    conceptId: "py.ml.span-basis-rank",
    title: "Span, basis, independence, and rank",
    requires: ["py.ml.transpose-identity-inverse"],
    vocabulary: [
      ["span", "every vector reachable by scaling and adding a given set of vectors"],
      ["independent", "no vector in the set can be built from the others"],
      ["basis", "an independent set that spans the whole space being described"],
      ["rank", "the number of independent directions a matrix preserves"],
    ],
    opening: "A dataset may have one hundred columns and still contain far fewer than one hundred independent directions. These ideas tell us how much distinct information the columns really carry.",
    outcome: "You will be able to recognize redundant vectors, explain a basis, and interpret rank as preserved dimensional information.",
    why: "Redundant features can make fitting unstable and waste memory. Low-rank structure powers compression, embeddings, and efficient model adaptation.",
    mentalModel: "Imagine directions painted on the floor. One east arrow and one north arrow can reach every point on a flat floor. A northeast arrow adds no new freedom because east plus north already creates it.",
    idea: [
      "These three words all answer one question: how much room does a set of vectors actually reach?",
      "The **span** of some vectors is every point you can build out of them using two moves only, scaling a vector up or down and adding vectors together. Two arrows pointing in different directions across a flat page span the whole page, because some combination of them reaches any point on it.",
      "But suppose the second arrow points the same way as the first, only longer. It adds nothing new. Everything you can build still lies on a single line. Vectors like that are **linearly dependent**, meaning at least one of them was already reachable from the others. When no vector is redundant, they are **linearly independent**.",
      "A **basis** is a set that is independent and spans the space, with no spare parts in it. It is the smallest honest description of the room you are working in.",
      "The **rank** of a matrix is the count of genuinely independent directions its columns reach. A three-column matrix whose third column is just the first two added together has rank two, not three. It looks three-dimensional and behaves two-dimensionally.",
      "This is not trivia. Rank tells you whether a matrix squashes space, and a matrix that squashes space cannot be inverted. Two features that always move together give you a redundant column, a lower rank, and a model with no way to decide how to split the credit between them.",
    ],
    firstTitle: "Spot a dependent direction",
    firstIntro: "The third vector is the sum of the first two. It changes the list length but not the reachable plane.",
    firstCode: `east = [1, 0]        # two independent directions:
north = [0, 1]       # neither can be built from the other
northeast = [1, 1]   # this one is already inside their span

rebuilt = [                    # scale by one each, then add
    east[0] + north[0],
    east[1] + north[1],
]
print(rebuilt == northeast)`,
    firstTrace: "The output is `True`. East and north are independent and span the two-dimensional plane. Northeast is useful as a value, but it is redundant as a basis direction.",
    secondTitle: "See rank loss in a matrix",
    secondIntro: "Both rows below ask the same question at different scales. The second output never adds an independent measurement.",
    secondCode: `def transform(vector):
    first = vector[0] + vector[1]
    second = 2 * vector[0] + 2 * vector[1]
    return [first, second]

for point in [[1, 0], [0, 1], [2, -1]]:
    print(point, transform(point))`,
    secondTrace: "Every output has `second = 2 * first`, so outputs lie on one line. A two-dimensional input is collapsed to one independent output direction. The matrix rank is one.",
    mistake: "Do not equate number of columns with rank. Columns can repeat or combine from others. Rank counts independent directions, not stored columns.",
    checkpoint: "Do vectors `[1,0,0]`, `[0,1,0]`, and `[1,1,0]` span all of three-dimensional space?",
    checkpointAnswer: "No. Their third coordinate is always zero, and the third vector is the sum of the first two. They span only a two-dimensional plane and have rank two.",
    remember: "Span describes what can be built. Independence removes redundant directions. A basis does both jobs, and rank counts its independent directions.",
    checks: [
      q("What does rank count?", ["Independent directions", "All stored numbers", "Only matrix rows"], 0, "Rank measures dimensional information preserved by the matrix.", ["Correct. Redundant rows or columns do not increase it.", "Stored entry count is rows times columns.", "Row rank and column rank agree, but rank is not simply row count."]),
      q("Why is [1,1] redundant beside [1,0] and [0,1]?", ["It is their sum", "It has two nonzero values", "It is longer"], 0, "The existing vectors already build it.", ["Correct. It contributes no new direction.", "Nonzero coordinates do not imply dependence.", "All three vectors have two coordinates."]),
    ],
  },
  {
    lessonId: "py.mc.m1_1.l8",
    atomId: "py.atom.ml.eigenvectors",
    conceptId: "py.ml.eigenvectors",
    title: "Eigenvectors are directions a matrix does not turn",
    requires: ["py.ml.span-basis-rank"],
    vocabulary: [
      ["eigenvector", "a nonzero direction that a matrix only scales, without turning it away from its line"],
      ["eigenvalue", "the scale factor applied to an eigenvector"],
      ["dominant direction", "an eigenvector associated with the largest-magnitude eigenvalue"],
      ["power iteration", "repeated multiplication and normalization used to find a dominant direction"],
    ],
    opening: "Most vectors change both length and direction when a matrix acts on them. Eigenvectors are special directions that stay on their own line. Only their size or sign changes.",
    outcome: "You will be able to verify a proposed eigenvector, read its eigenvalue, and connect repeated matrix action to dominant directions.",
    why: "Eigen ideas appear in principal components, graph ranking, dynamical systems, and curvature. The goal is not memorizing a determinant equation; it is seeing stable directions inside a transformation.",
    mentalModel: "Stretch a rubber sheet. Most drawn arrows tilt. An arrow aligned with a pure stretch direction stays aimed along the same line. Its eigenvalue says how much it stretches or flips.",
    idea: [
      "Most vectors get knocked off course by a matrix. They go in pointing one way and come out pointing somewhere else. A few special ones do not.",
      "An **eigenvector** of a matrix is a vector whose direction survives the transformation. Apply the matrix and it comes back out along the same line it started on. The only thing that changed is its length.",
      "The number describing that stretch is its **eigenvalue**. An eigenvalue of `3` means the vector comes out three times longer, still pointing the same way. An eigenvalue of `0.5` means it was halved. A negative eigenvalue means it flipped to point backwards along the same line.",
      "So the whole idea fits into one equation: `A` times `v` equals `lambda` times `v`. The left side transforms the vector. The right side merely scales it. An eigenvector is exactly where those two very different operations happen to agree.",
      "Why anyone cares is that eigenvectors are the natural axes of a transformation. Along those directions the matrix does nothing complicated, it only stretches.",
      "Repeated application makes this vivid. Apply the matrix over and over and the direction with the largest eigenvalue grows fastest, so almost any starting vector drifts toward it. That single fact powers **principal component analysis**, which finds the directions your data varies along most. It also explains why gradients explode or vanish in a deep network, where the same weight matrix is applied at every step.",
    ],
    firstTitle: "Verify two directions by direct multiplication",
    firstIntro: "A diagonal matrix scales horizontal and vertical coordinates separately, so the coordinate axes are easy eigenvectors.",
    firstCode: `def apply(matrix, vector):
    return [
        sum(weight * value for weight, value in zip(row, vector))
        for row in matrix
    ]

matrix = [[3, 0], [0, 2]]     # stretches one axis by 3, the other by 2
print(apply(matrix, [1, 0]))  # direction survives -> eigenvector
print(apply(matrix, [0, 1]))  # direction survives -> eigenvector
print(apply(matrix, [1, 1]))  # rotated off its line -> not one`,
    firstTrace: "`[1,0]` becomes `[3,0]`, so its eigenvalue is three. `[0,1]` becomes `[0,2]`, so its eigenvalue is two. `[1,1]` becomes `[3,2]`, which is not a single scale of `[1,1]`, so it is not an eigenvector.",
    secondTitle: "Let repeated action reveal the dominant direction",
    secondIntro: "The horizontal coordinate grows by three while the vertical grows by two. Normalizing after each step prevents size from exploding.",
    secondCode: `from math import sqrt

vector = [1.0, 1.0]
matrix = [[3.0, 0.0], [0.0, 2.0]]

for _ in range(6):
    vector = apply(matrix, vector)
    length = sqrt(sum(value * value for value in vector))
    vector = [value / length for value in vector]

print(vector)`,
    secondTrace: "The vector moves closer to the horizontal axis because the factor three beats factor two on every multiplication. Power iteration uses this repeated advantage to estimate a dominant eigenvector.",
    mistake: "Do not say an eigenvector stays unchanged. Its direction line stays unchanged. Its length may grow, shrink, or flip when the eigenvalue is negative.",
    checkpoint: "If `A v = -2v`, what happens to `v` after applying `A`?",
    checkpointAnswer: "The vector doubles in length and reverses direction. It remains on the same line, so `v` is an eigenvector with eigenvalue negative two.",
    remember: "An eigenvector keeps its direction line under a matrix. Its eigenvalue records the scaling and possible sign flip.",
    checks: [
      q("How do you verify an eigenvector v?", ["Check whether Av is one scalar times v", "Check whether v sums to one", "Transpose v twice"], 0, "The result must stay on v's direction line.", ["Correct. That scalar is the eigenvalue.", "Coordinate sum is unrelated.", "Double transpose returns the original shape but proves nothing here."]),
      q("Why does power iteration favor one direction?", ["Its eigenvalue magnitude grows fastest", "It deletes every negative value", "It sorts coordinates"], 0, "Repeated multiplication amplifies the strongest scaling factor.", ["Correct. Normalization keeps only the relative direction.", "Negative components can remain.", "No sorting is required."]),
    ],
  },
  {
    lessonId: "py.mc.m1_1.l9",
    atomId: "py.atom.ml.determinant-trace",
    conceptId: "py.ml.determinant-trace",
    title: "Determinant and trace tell different stories",
    requires: ["py.ml.eigenvectors"],
    vocabulary: [
      ["determinant", "the signed factor by which a square matrix scales volume"],
      ["trace", "the sum of a square matrix's diagonal entries"],
      ["orientation", "the handed direction of the coordinate system"],
      ["volume collapse", "a transformation flattening space into fewer dimensions"],
    ],
    opening: "Determinant and trace each compress a square matrix into one number, but they answer different questions. Determinant describes total volume scaling. Trace adds the direct diagonal action.",
    outcome: "You will be able to compute both for a two-by-two matrix and interpret zero determinant, sign, and diagonal sum.",
    why: "Determinants appear in probability density changes and invertibility. Traces appear in covariance, regularization, and matrix derivatives. Neither number describes the whole matrix.",
    mentalModel: "Draw a unit square on rubber. The determinant tells the signed area after stretching. Trace is more like adding the matrix's self-to-self coordinate effects along the diagonal.",
    firstTitle: "Compute both numbers directly",
    firstIntro: "For a two-by-two matrix, determinant is `ad - bc`. Trace is `a + d`.",
    firstCode: `def determinant_2x2(matrix):
    a, b = matrix[0]
    c, d = matrix[1]
    return a * d - b * c

def trace(matrix):
    return sum(matrix[index][index] for index in range(len(matrix)))

matrix = [[3, 1], [2, 4]]
print(determinant_2x2(matrix), trace(matrix))`,
    firstTrace: "The determinant is `3*4 - 1*2`, or ten. Areas grow by a factor of ten. The trace is `3 + 4`, or seven. These numbers are not interchangeable.",
    secondTitle: "Detect a collapsed plane",
    secondIntro: "The second row below is twice the first. Both output coordinates carry the same underlying information.",
    secondCode: `collapsed = [[1, 2], [2, 4]]
flipped = [[-1, 0], [0, 1]]

print(determinant_2x2(collapsed))
print(determinant_2x2(flipped))`,
    secondTrace: "The collapsed determinant is zero because the plane becomes a line, so no inverse exists. The flipped determinant is negative one. Area magnitude stays one, but orientation reverses like a mirror.",
    mistake: "Do not interpret a large trace as large volume. A matrix can have a large diagonal sum and still collapse a direction. Check the quantity that matches the question.",
    checkpoint: "What does determinant zero tell you about rank and invertibility for a square matrix?",
    checkpointAnswer: "At least one dimension collapses, so the matrix lacks full rank. Different inputs can share an output, and a unique inverse does not exist.",
    remember: "Determinant measures signed volume scaling and detects collapse. Trace sums diagonal action. One scalar never replaces the full matrix.",
    checks: [
      q("What does a negative determinant indicate?", ["Orientation flipped", "Every output is negative", "Trace is zero"], 0, "The transformation reverses handedness.", ["Correct. Its magnitude still gives volume scaling.", "Individual outputs can have any signs.", "Trace is independent."]),
      q("What is the trace of [[2,9],[4,3]]?", ["5", "13", "18"], 0, "Add diagonal entries two and three.", ["Correct. Off-diagonal entries are not included.", "That mixes unrelated entries.", "That is two times nine, not the trace."]),
    ],
  },
  {
    lessonId: "py.mc.m1_1.l10",
    atomId: "py.atom.ml.svd",
    conceptId: "py.ml.svd",
    title: "Singular value decomposition as rotate, stretch, rotate",
    requires: ["py.ml.determinant-trace"],
    vocabulary: [
      ["singular value", "a nonnegative amount of stretch along one paired direction"],
      ["left singular vector", "an important output-space direction"],
      ["right singular vector", "an important input-space direction"],
      ["low-rank approximation", "a smaller representation keeping only the strongest singular directions"],
    ],
    opening: "Singular value decomposition works for rectangular matrices and gives a clean geometric story. Rotate the input, stretch selected axes, then rotate into output space.",
    outcome: "You will be able to explain the three SVD pieces and why keeping the largest singular values creates the best low-rank approximation under common error measures.",
    why: "SVD powers compression, principal components, denoising, recommendation systems, and analysis of learned weights. It tells us which directions carry the most matrix action.",
    mentalModel: "Imagine reshaping a clay ball into an ellipse. First rotate the ball, then stretch independent axes, then rotate the ellipse into its final pose. Singular values are the stretch amounts.",
    firstTitle: "See exact compression in redundant data",
    firstIntro: "Every row below is a multiple of one pattern. The matrix has four columns but only one independent direction.",
    firstCode: `data = [
    [1, 2, 1, 2],
    [2, 4, 2, 4],
    [3, 6, 3, 6],
]

row_strength = [1, 2, 3]
pattern = [1, 2, 1, 2]
rebuilt = [
    [strength * value for value in pattern]
    for strength in row_strength
]
print(rebuilt == data)`,
    firstTrace: "The output is `True`. Instead of storing twelve unrelated numbers, we can store one row-strength vector and one pattern vector. This is rank-one structure, the simplest low-rank factorization.",
    secondTitle: "Keep strong signal and drop weak noise",
    secondIntro: "A real SVD orders singular values from strongest to weakest. This tiny example imitates discarding a weak second direction.",
    secondCode: `singular_values = [12.0, 0.3, 0.02]
energy = [value * value for value in singular_values]
kept_fraction = energy[0] / sum(energy)
print(kept_fraction)`,
    secondTrace: "The first singular direction holds almost all squared energy. Keeping only it can compress the matrix with little reconstruction error. The acceptable cutoff depends on the task, not a universal percentage.",
    mistake: "Do not say the smallest singular directions are always useless noise. A weak direction can carry rare but important information. Validate compression on the real downstream metric.",
    checkpoint: "What jobs do the three conceptual SVD pieces perform?",
    checkpointAnswer: "Right singular vectors choose input directions. Singular values scale those directions. Left singular vectors place the scaled results into output-space directions.",
    remember: "SVD reveals paired input and output directions ordered by stretch strength. Truncating that order gives principled low-rank compression.",
    checks: [
      q("Why does SVD help compress a matrix?", ["A few singular directions may contain most action", "It converts every value to zero", "It requires a square matrix"], 0, "Keeping strong directions can approximate many entries with smaller factors.", ["Correct. Low-rank structure replaces a large grid.", "Useful signal remains.", "SVD works for rectangular matrices."]),
      q("Are small singular values always safe to discard?", ["No, task-relevant rare signal may live there", "Yes, by definition", "Only when they are negative"], 0, "Compression choices require downstream validation.", ["Correct. Mathematical energy and task importance can differ.", "Small does not mean irrelevant.", "Singular values are nonnegative."]),
    ],
  },
  {
    lessonId: "py.mc.m1_1.l11",
    atomId: "py.atom.ml.matrix-decompositions",
    conceptId: "py.ml.matrix-decompositions",
    title: "LU, QR, and Cholesky solve different shapes of work",
    requires: ["py.ml.svd"],
    vocabulary: [
      ["decomposition", "rewriting one matrix as a product of structured matrices"],
      ["triangular matrix", "a matrix with zeros entirely on one side of its diagonal"],
      ["orthogonal matrix", "a matrix whose columns are perpendicular unit vectors"],
      ["positive definite", "a symmetric matrix producing positive quadratic energy for every nonzero vector"],
    ],
    opening: "A matrix decomposition is like taking apart a complicated machine into simpler tools. Different factorizations are useful because triangular and orthogonal pieces are easier or safer to compute with.",
    outcome: "You will be able to state the purpose of LU, QR, and Cholesky and choose among them by matrix properties and task.",
    why: "Solvers and model-fitting libraries use decompositions instead of explicit inverses. Choosing structure improves speed, numerical stability, and reuse across many right-hand sides.",
    mentalModel: "Think of a locked door with several possible toolkits. LU is a general two-stage toolkit. QR uses rigid right-angle pieces for least squares. Cholesky is a lighter toolkit available only for a well-behaved symmetric lock.",
    firstTitle: "Solve two triangular stages",
    firstIntro: "After an LU factorization, solving `Ax=b` becomes one lower-triangular solve followed by one upper-triangular solve.",
    firstCode: `def forward_substitute(lower, target):
    answer = []
    for row in range(len(target)):
        known = sum(lower[row][col] * answer[col] for col in range(row))
        answer.append((target[row] - known) / lower[row][row])
    return answer

lower = [[2.0, 0.0], [3.0, 1.0]]
print(forward_substitute(lower, [4.0, 8.0]))`,
    firstTrace: "The first equation is `2x = 4`, so `x = 2`. The second is `3x + y = 8`. Substituting two gives `y = 2`. Triangular structure lets each row use answers already found.",
    secondTitle: "Match the factorization to the situation",
    secondIntro: "This decision helper encodes the first question, not a complete numerical-library policy.",
    secondCode: `def choose_factorization(square, symmetric_positive, least_squares):
    if symmetric_positive:
        return "Cholesky"
    if least_squares or not square:
        return "QR"
    return "LU"

print(choose_factorization(True, True, False))
print(choose_factorization(False, False, True))`,
    secondTrace: "A symmetric positive-definite system can use Cholesky. A rectangular least-squares problem commonly uses QR. A general square solve can use LU with pivoting. SVD remains useful when rank or conditioning is uncertain.",
    mistake: "Do not choose only by speed. A faster method whose assumptions are false can fail or produce nonsense. Check symmetry, definiteness, rank, and conditioning.",
    checkpoint: "Why is QR often preferred over forming normal equations for least squares?",
    checkpointAnswer: "QR works with orthogonal directions and usually preserves numerical information better. Forming normal equations squares the condition number and can magnify instability.",
    remember: "Decompose to expose structure: LU for general square solves, QR for orthogonal least-squares work, and Cholesky for symmetric positive-definite systems.",
    checks: [
      q("When is Cholesky appropriate?", ["A symmetric positive-definite matrix", "Every rectangular matrix", "Only a diagonal matrix"], 0, "Cholesky uses the matrix's strong symmetry and positivity.", ["Correct. Those assumptions enable the efficient factorization.", "Rectangular problems commonly use QR or SVD.", "It supports many non-diagonal matrices."]),
      q("Why are triangular systems easy to solve?", ["Each row exposes one new unknown in order", "They contain no numbers", "They are always identity matrices"], 0, "Previously solved values feed the next row.", ["Correct. Forward or backward substitution walks in order.", "They contain structured zeros, not no numbers.", "Identity is only one triangular matrix."]),
    ],
  },
  {
    lessonId: "py.mc.m1_1.l12",
    atomId: "py.atom.ml.orthogonality-least-squares",
    conceptId: "py.ml.orthogonality-least-squares",
    title: "Orthogonality, projection, and least squares",
    requires: ["py.ml.matrix-decompositions"],
    vocabulary: [
      ["orthogonal", "perpendicular, with dot product zero"],
      ["projection", "the closest shadow of a vector on a chosen direction or subspace"],
      ["residual", "the difference between an observed target and its fitted prediction"],
      ["least squares", "choosing parameters that minimize the sum of squared residuals"],
    ],
    opening: "When an exact solution does not exist, linear algebra asks for the closest possible one. Projection turns that vague word “closest” into a precise perpendicular condition.",
    outcome: "You will be able to project onto a direction, identify the residual, and explain why the least-squares residual is orthogonal to the model's feature space.",
    why: "Linear regression is a least-squares projection. This geometric view explains normal equations, residual checks, QR solvers, and why adding useful feature directions can improve a fit.",
    mentalModel: "Hold a flashlight over an arrow and shine it onto a line. The shadow along the line is the projection. The short gap from shadow to arrow is the residual, and it meets the line at a right angle.",
    firstTitle: "Project one vector onto another",
    firstIntro: "Projection scales the direction by `dot(value,direction) / dot(direction,direction)`. The direction need not already have length one.",
    firstCode: `def dot(left, right):
    return sum(a * b for a, b in zip(left, right))

def project(value, direction):
    scale = dot(value, direction) / dot(direction, direction)
    return [scale * component for component in direction]

value = [3.0, 4.0]
direction = [1.0, 0.0]
shadow = project(value, direction)
residual = [a - b for a, b in zip(value, shadow)]
print(shadow, residual, dot(residual, direction))`,
    firstTrace: "The shadow is `[3,0]`. The residual is `[0,4]`. Their dot product with the horizontal direction is zero, proving the leftover error is perpendicular to the allowed direction.",
    secondTitle: "Fit a constant by least squares",
    secondIntro: "If a model may predict only one constant, the best squared-error constant is the mean of the targets.",
    secondCode: `targets = [2.0, 4.0, 9.0]
prediction = sum(targets) / len(targets)
residuals = [target - prediction for target in targets]
squared_error = sum(error * error for error in residuals)

print(prediction)
print(residuals)
print(sum(residuals), squared_error)`,
    secondTrace: "The prediction is five. Residuals are `-3, -1, 4`, and they sum to zero. Zero sum means the residual vector is orthogonal to the constant feature direction `[1,1,1]`.",
    mistake: "Do not confuse zero total residual with zero error. Positive and negative residuals can cancel while squared error remains large. Inspect both residual structure and loss.",
    checkpoint: "Why can least squares return a useful answer when `Ax=b` has no exact solution?",
    checkpointAnswer: "It projects `b` onto the set of outputs reachable by `A`. The fitted output is the closest reachable point under L2 distance, and the remaining residual is perpendicular to that reachable subspace.",
    remember: "Projection finds the closest reachable vector. Least squares projects targets onto model outputs, leaving an orthogonal residual.",
    checks: [
      q("What is true about a projection residual?", ["It is orthogonal to the chosen subspace", "It is always zero", "It equals the prediction"], 0, "The shortest gap meets the subspace at a right angle.", ["Correct. That condition characterizes least squares.", "It is zero only for an exact fit.", "Residual is target minus prediction."]),
      q("Why do residuals sum to zero for the best constant fit?", ["They are orthogonal to the all-ones direction", "Every target equals the mean", "Squared error is zero"], 0, "The constant model's feature direction is all ones.", ["Correct. Their dot product with that direction is their sum.", "Targets may differ widely.", "The fit can still have substantial error."]),
    ],
  },
];

export const ML_LINEAR_ALGEBRA_ATOMS = ML_LINEAR_ALGEBRA_SPECS.map(guidedMasteryAtom);
export const ML_LINEAR_ALGEBRA_CONCEPTS = ML_LINEAR_ALGEBRA_SPECS.map(guidedMasteryConcept);
export const ML_LINEAR_ALGEBRA_LESSON_CONTENT = guidedLessonContent(ML_LINEAR_ALGEBRA_SPECS);

# Module 1 — Math Foundations for Machine Learning

Two branches of mathematics power essentially all of machine learning:

- **Linear algebra** — the math of vectors and matrices. This is how we *represent* data and models. A data point is a vector; a dataset is a matrix; a model's parameters are vectors and matrices; and the core operation of a neural network is matrix multiplication.
- **Calculus** — the math of change. This is how models *learn*. Learning means adjusting parameters to reduce error, and the tool that tells us which way to adjust is the derivative — specifically, the gradient.

We'll build both from zero, always tying back to how ML uses them. Read with a pen. Every formula gets a plain-English reading and a tiny example you can check by hand.

---

## Part A — Linear Algebra

### A.1 Scalars

A **scalar** is just a single number. `5`, `-2.7`, `0`, and `3.14` are scalars.

In ML, scalars show up as individual measurements (one person's height), single parameters (a bias term), or the output of a loss function (one number summarizing how wrong the model is). We usually write scalars in lowercase italic: `a`, `b`, `x`.

That's the whole story for scalars. The interesting structure begins when we group them.

### A.2 Vectors

A **vector** is an ordered list of numbers. We write it in brackets:

```
v = [3, 4]
```

This is a 2-dimensional vector (two components). A 3-dimensional vector has three:

```
u = [1, -2, 5]
```

**Plain-English reading:** a vector is a point in space, or equivalently an arrow from the origin to that point. `[3, 4]` is the point 3 units right and 4 units up, or the arrow pointing there.

**Why ML cares:** every data point is a vector. A house might be `[1500, 3, 2]` = (square feet, bedrooms, bathrooms). An image that is 28x28 pixels is a vector of 784 numbers. A model's job is to find structure in clouds of these vectors.

We index components starting from 1 in math (or 0 in Python): `v = [v1, v2]`, so `v1 = 3`, `v2 = 4`. The number of components is the vector's **dimension**.

### A.3 Vector operations

**Addition** — add component by component. The vectors must have the same dimension.

```
[3, 4] + [1, 2] = [3+1, 4+2] = [4, 6]
```

**Plain-English reading:** to add vectors, walk along the first arrow, then continue along the second. You end up at the sum. This is the "tip-to-tail" picture.

**Scalar multiplication** — multiply every component by the scalar.

```
2 * [3, 4] = [6, 8]
```

**Plain-English reading:** scaling by 2 stretches the arrow to twice its length, same direction. Scaling by `-1` flips it to point the opposite way. Scaling by `0.5` halves it.

**Subtraction** is addition of a negative:

```
[3, 4] - [1, 2] = [3, 4] + [-1, -2] = [2, 2]
```

**Why ML cares:** `a - b` is the vector pointing from `b` to `a`. The *difference between a prediction and the truth* is a vector, and its size measures error. Scaling a vector by a small number is exactly what a "small step" in learning looks like.

### A.4 The dot product

The **dot product** (or inner product) of two same-dimension vectors multiplies matching components and sums the results, producing a single **scalar**:

```
a · b = a1*b1 + a2*b2 + ... + an*bn
```

**Worked example:**

```
a = [3, 4]
b = [2, 1]
a · b = 3*2 + 4*1 = 6 + 4 = 10
```

**Plain-English reading:** the dot product measures how much two vectors point in the same direction, weighted by their lengths. Big positive = aligned. Zero = perpendicular. Negative = pointing opposite ways.

#### The geometric meaning (this is important)

There is a second formula for the same number:

```
a · b = |a| * |b| * cos(theta)
```

where `|a|` and `|b|` are the vectors' lengths and `theta` is the angle between them.

**Plain-English reading:** the dot product equals (length of a) times (length of b) times the cosine of the angle between them. Since `cos(0) = 1` (same direction), `cos(90°) = 0` (perpendicular), and `cos(180°) = -1` (opposite), the dot product's *sign* tells you the rough relationship:

| Angle | cos | Dot product | Meaning |
|-------|-----|-------------|---------|
| 0° | 1 | large positive | pointing the same way |
| 90° | 0 | **zero** | perpendicular (orthogonal) |
| 180° | -1 | large negative | pointing opposite ways |

**The key ML fact:** two vectors are **perpendicular (orthogonal) exactly when their dot product is 0.** You can test it:

```
[1, 0] · [0, 1] = 1*0 + 0*1 = 0    →  perpendicular ✓  (the x-axis and y-axis)
```

**Why ML cares — this is the single most-used operation in ML.** A linear model computes a *weighted sum of features*, which is exactly a dot product:

```
prediction = w · x + b = w1*x1 + w2*x2 + ... + wn*xn + b
```

The weight vector `w` says how much each feature matters; the dot product blends the features into one score. When we later say "a neuron computes `w·x + b`", this is what it means. Every layer of a neural network is thousands of dot products.

### A.5 Norms — measuring the length of a vector

A **norm** measures how "big" a vector is — its length. The most familiar is the **L2 norm** (Euclidean length), which is just the Pythagorean theorem generalized:

```
|v|_2 = sqrt(v1^2 + v2^2 + ... + vn^2)
```

**Worked example:**

```
v = [3, 4]
|v|_2 = sqrt(3^2 + 4^2) = sqrt(9 + 16) = sqrt(25) = 5
```

**Plain-English reading:** the L2 norm is the straight-line distance from the origin to the tip of the vector — the length of the arrow. (Note: `v · v = 3*3 + 4*4 = 25`, and `sqrt(v · v) = 5`. So the L2 norm is `sqrt(v · v)`. The dot product of a vector with itself is its squared length.)

The **L1 norm** sums the *absolute values* instead:

```
|v|_1 = |v1| + |v2| + ... + |vn|
```

**Worked example:**

```
v = [3, -4]
|v|_1 = |3| + |-4| = 3 + 4 = 7
```

**Plain-English reading:** the L1 norm is "taxicab distance" — how far you'd travel if you could only move along the grid (like a car in a city that can't cut diagonally across blocks). To get from origin to `[3, -4]` you go 3 blocks one way and 4 the other = 7 blocks.

**Distance between two vectors** is just the norm of their difference:

```
distance(a, b) = |a - b|_2 = sqrt( (a1-b1)^2 + (a2-b2)^2 + ... )
```

```
a = [1, 2],  b = [4, 6]
a - b = [-3, -4]
distance = sqrt(9 + 16) = 5
```

**Why ML cares:**
- **L2 distance** is how k-nearest-neighbors decides which points are "close." It's how we measure prediction error (squared distance).
- **Norms measure the size of the weight vector**, which is the basis of *regularization* (Module 4): penalizing large weights keeps models simple. L1 vs L2 penalties behave differently — L1 tends to push weights all the way to exactly zero (feature selection), L2 shrinks them smoothly. That difference traces directly back to the geometry of these two norms.

### A.6 Matrices

A **matrix** is a rectangular grid of numbers — a stack of row vectors, or equivalently a row of column vectors. We describe its size as `rows x columns`.

```
A = [ 1  2  3 ]      ← this is a 2x3 matrix (2 rows, 3 columns)
    [ 4  5  6 ]
```

We index an entry by `A[row, col]` (1-based here): `A[1,1] = 1`, `A[2,3] = 6`.

**Why ML cares:** an entire dataset is a matrix. If you have 100 houses each described by 3 features, that's a 100x3 matrix `X` — one row per house, one column per feature. A neural network layer's parameters are a weight matrix. So matrices are simultaneously how we store data *and* how we store models.

### A.7 Transpose

The **transpose** of a matrix flips it across its diagonal — rows become columns and columns become rows. We write `A^T` (read "A transpose").

```
A =   [ 1  2  3 ]         A^T =  [ 1  4 ]
      [ 4  5  6 ]                [ 2  5 ]
       (2x3)                     [ 3  6 ]
                                  (3x2)
```

Entry `A[i,j]` moves to `A^T[j,i]`. A 2x3 matrix becomes 3x2.

**Plain-English reading:** transposing is turning the grid on its side. Row 1 of `A` (which was `[1,2,3]`) becomes column 1 of `A^T`.

**Why ML cares:** transpose is constant bookkeeping in ML formulas — it lines up dimensions so that multiplications are valid. You'll see `X^T X` in the normal equation for linear regression (Module 4) and transposes all over backpropagation (Module 5). It's rarely deep; it's usually just "make the shapes fit."

### A.8 Matrix-vector multiplication

Multiplying a matrix by a vector transforms the vector into a new vector. **Each component of the output is the dot product of one matrix row with the vector.**

```
A = [ 1  2 ]      x = [ 5 ]
    [ 3  4 ]          [ 6 ]

A x = [ (row1) · x ] = [ 1*5 + 2*6 ] = [ 5 + 12 ]  = [ 17 ]
      [ (row2) · x ]   [ 3*5 + 4*6 ]   [ 15 + 24 ]   [ 39 ]
```

**Plain-English reading:** the matrix `A` is a *machine that eats a vector and spits out a vector*. Row by row, it takes a weighted combination of the input's components. Here the input `[5,6]` became the output `[17,39]`.

For the shapes to work: a `(m x n)` matrix times an `(n)` vector gives an `(m)` vector. The matrix's column count must match the vector's dimension.

**Why ML cares:** *one layer of a neural network is exactly this operation* (plus a bias and an activation): `output = activation(W x + b)`. When we say a network "does a bunch of matrix multiplies," a matrix-vector product is the atom. It also has a beautiful interpretation: matrices *are* linear transformations — they rotate, stretch, shear, and project space. Feeding data through a network is feeding it through a sequence of such transformations, reshaping the data until the answer is easy to read off.

### A.9 Matrix-matrix multiplication (worked 2x2 by hand)

To multiply two matrices `A` (m x n) and `B` (n x p), the result `C = A B` is `(m x p)`, and:

```
C[i, j] = (row i of A) · (column j of B)
```

**Plain-English reading:** the entry in row `i`, column `j` of the answer is the dot product of A's `i`-th row with B's `j`-th column. So each output entry is one dot product; you do `m*p` of them.

**Fully worked 2x2 example — do this by hand once:**

```
A = [ 1  2 ]     B = [ 5  6 ]
    [ 3  4 ]         [ 7  8 ]
```

Compute each of the four entries of `C`:

```
C[1,1] = (row1 of A)·(col1 of B) = [1,2]·[5,7] = 1*5 + 2*7 = 5 + 14 = 19
C[1,2] = (row1 of A)·(col2 of B) = [1,2]·[6,8] = 1*6 + 2*8 = 6 + 16 = 22
C[2,1] = (row2 of A)·(col1 of B) = [3,4]·[5,7] = 3*5 + 4*7 = 15 + 28 = 43
C[2,2] = (row2 of A)·(col2 of B) = [3,4]·[6,8] = 3*6 + 4*8 = 18 + 32 = 50
```

So:

```
C = A B = [ 19  22 ]
          [ 43  50 ]
```

**Critical rule — order matters.** `A B` is generally **not** the same as `B A`. Matrix multiplication is *not commutative*. Check it:

```
B A = [ 5*1+6*3   5*2+6*4 ]  = [ 23  34 ]
      [ 7*1+8*3   7*2+8*4 ]    [ 31  46 ]
```

Different answer entirely. This is unlike ordinary number multiplication and a frequent source of bugs.

**The shape rule (memorize this):** to multiply `(m x n)` by `(p x q)`, you need `n = p` (inner dimensions match), and the result is `(m x q)` (outer dimensions). "The inner numbers must match; the outer numbers give the shape."

```
(2 x 3) · (3 x 4) → (2 x 4)   ✓   valid, inner 3=3
(2 x 3) · (2 x 4) → error      ✗   inner 3 ≠ 2
```

**Why ML cares:** processing a whole *batch* of data points at once is matrix-matrix multiplication (dataset matrix times weight matrix). This is why GPUs — which are matrix-multiply machines — accelerate ML so dramatically. The entire forward pass of a deep network is a chain of these products. Getting shapes right (`n = p`) is 90% of debugging real ML code.

### A.10 The identity matrix

The **identity matrix** `I` is a square matrix with 1s on the diagonal and 0s everywhere else:

```
I = [ 1  0 ]        (2x2 identity)
    [ 0  1 ]
```

It is the "1" of matrix multiplication: multiplying by it changes nothing.

```
I x = [1 0][5]  = [1*5 + 0*6]  = [5]     ← unchanged
      [0 1][6]    [0*5 + 1*6]    [6]
```

**Plain-English reading:** the identity is the "do nothing" transformation. Just as `1 * x = x` for numbers, `I A = A` and `A I = A` for matrices.

**Why ML cares:** the identity anchors the idea of a *matrix inverse*. A matrix `A^-1` is the inverse of `A` if `A^-1 A = I` — it undoes what `A` does. Solving `A w = y` for the parameters `w` conceptually means `w = A^-1 y`. The normal equation for linear regression (Module 4) is exactly this move: invert a matrix to solve for the best weights in one shot. Also, adding a small multiple of the identity (`A + lambda*I`) is the linear-algebra face of L2 regularization.

### A.11 Linear combinations

A **linear combination** of vectors is what you get by scaling each one and adding them up:

```
c1 * v1 + c2 * v2 + ... + ck * vk
```

where the `c`'s are scalars (the "weights" or "coefficients").

**Worked example:**

```
v1 = [1, 0],  v2 = [0, 1]
2*v1 + 3*v2 = 2*[1,0] + 3*[0,1] = [2,0] + [0,3] = [2, 3]
```

**Plain-English reading:** a linear combination is a recipe — "two parts this vector, three parts that vector" — mixed together into a new vector. Notice that with the two vectors `[1,0]` and `[0,1]` you can reach *any* 2D point by choosing the right amounts: `c1*[1,0] + c2*[0,1] = [c1, c2]`.

**Why ML cares:** a linear model's prediction *is* a linear combination of features (`w1*x1 + ... = w · x`). Training the model means finding the best coefficients. And the whole idea of "what can this model express?" is the question "what vectors are reachable as linear combinations?" — which is exactly span.

### A.12 Span and basis (intuition)

The **span** of a set of vectors is the set of *all* points you can reach by taking linear combinations of them.

- The span of a single nonzero vector `[1, 2]` is a **line** through the origin (all its scalings).
- The span of `[1, 0]` and `[0, 1]` is the **whole 2D plane** — as we just saw, you can reach any point.
- But the span of `[1, 0]` and `[2, 0]` is *still just a line*, because the second vector adds no new direction — it's already a scaling of the first. We call such vectors **linearly dependent** (one is redundant).

A **basis** is a *minimal* set of vectors whose span is the whole space — enough to reach everything, with no redundancy. `[1,0]` and `[0,1]` are the standard basis for 2D. Every point has *exactly one* recipe in terms of a basis.

**Plain-English reading:** span asks "how much of space can these building blocks cover?" A basis is the smallest complete set of building blocks — remove any one and you lose coverage; add any more and they're redundant.

**Why ML cares:**
- **Redundant features are linearly dependent columns.** If "height in cm" and "height in inches" are both features, one is just a scaling of the other — it adds no new information and can make models unstable (this is *collinearity*).
- **Dimensionality reduction** (like PCA, which you'll meet later) is the art of finding a *smaller basis* that still spans most of where your data actually lives — compressing many correlated features into a few meaningful directions.
- Thinking in terms of "which directions can my model actually represent?" is thinking in spans.

### A.13 Projections

A **projection** answers: "given a vector `a`, what is the closest point to it that lies on the line through vector `b`?" It's the shadow `a` casts onto `b`'s direction.

The projection of `a` onto `b` is:

```
proj_b(a) = ( (a · b) / (b · b) ) * b
```

**Plain-English reading:** the fraction `(a·b)/(b·b)` is *how far along b you have to go*; multiplying by `b` places you there. The dot product does the measuring, as promised in A.4.

**Worked example — project `a = [3, 4]` onto `b = [1, 0]` (the x-axis):**

```
a · b = 3*1 + 4*0 = 3
b · b = 1*1 + 0*0 = 1
proj_b(a) = (3 / 1) * [1, 0] = [3, 0]
```

So the shadow of `[3,4]` onto the x-axis is `[3, 0]` — exactly the x-part, which matches intuition: shining a light straight down onto the x-axis drops the height and keeps the horizontal position.

**The residual** — the leftover — is `a - proj_b(a) = [3,4] - [3,0] = [0, 4]`. Notice it's perpendicular to `b` (`[0,4]·[1,0] = 0`). *The residual is always orthogonal to what you projected onto.* This is not a coincidence; it's the defining property of the closest point.

**Why ML cares — this is the geometric heart of linear regression.** Fitting a line to data means finding the prediction that is the *closest reachable point* to the true values. "Closest reachable point" is precisely a projection: we project the vector of true answers onto the space of predictions the model can make, and the leftover (the residual) is the error we couldn't explain — orthogonal to everything the model could capture. When you later see "least squares," picture a projection.

---

## Part B — Calculus for Machine Learning

Machine learning *learns* by nudging parameters to reduce error. Calculus is the tool that says *which way to nudge*. We need surprisingly little of it — mainly the derivative and its multi-variable cousin, the gradient.

### B.1 The derivative as a slope

The **derivative** of a function `f(x)` tells you its *slope* at a point — how fast the output changes as you nudge the input. We write it `f'(x)` or `df/dx`.

Formally, it's the limit of "rise over run" as the run shrinks to zero:

```
f'(x) = limit as h→0 of  [ f(x + h) - f(x) ] / h
```

**Plain-English reading:** wiggle the input by a tiny amount `h`; see how much the output moves; divide. As the wiggle shrinks to nothing, that ratio settles on the instantaneous slope. Positive slope = function going uphill as `x` increases; negative = downhill; zero = flat (a peak, valley, or plateau).

**Worked example — the slope of `f(x) = x^2` at `x = 3`:**

Use a tiny `h = 0.001`:

```
f(3)      = 3^2      = 9
f(3.001)  = 3.001^2  = 9.006001
slope ≈ (9.006001 - 9) / 0.001 = 0.006001 / 0.001 = 6.001  ≈ 6
```

The exact derivative (below) gives `f'(3) = 2*3 = 6`. Our numeric wiggle nailed it. This numeric trick — nudge and divide — is worth remembering: it's how you can *check* any derivative you compute, and it's the seed of "numerical gradient checking" used to debug backprop in Module 5.

### B.2 Derivative rules (the few you need)

You rarely compute derivatives from the limit. You use rules:

| Function `f(x)` | Derivative `f'(x)` | Note |
|---|---|---|
| `c` (a constant) | `0` | flat line, no slope |
| `x` | `1` | slope 1 |
| `x^n` | `n * x^(n-1)` | the **power rule** |
| `c * f(x)` | `c * f'(x)` | constants factor out |
| `f(x) + g(x)` | `f'(x) + g'(x)` | derivatives add |
| `e^x` | `e^x` | its own derivative |
| `ln(x)` | `1 / x` | natural log |

**The power rule, read plainly:** "bring the exponent down front as a multiplier, then lower the exponent by one." So:

```
f(x) = x^2   →   f'(x) = 2 * x^(2-1) = 2x
f(x) = x^3   →   f'(x) = 3 * x^2
f(x) = 5x^2  →   f'(x) = 5 * 2x = 10x
```

**Worked check:** `f(x) = x^2`, so `f'(x) = 2x`, so `f'(3) = 6` — matching the numeric wiggle in B.1. 

**Why ML cares:** the two functions above — `x^2` and `ln(x)`/`e^x` — are exactly the building blocks of ML loss functions. Squared error is built from `x^2`; cross-entropy and the sigmoid are built from `e^x` and `ln`. Knowing these handful of derivatives lets you differentiate almost every loss you'll meet.

### B.3 Partial derivatives

Real models have *many* parameters, so their error is a function of many variables, like `f(x, y)`. A **partial derivative** asks: "how does the output change if I nudge *just one* input and hold all the others fixed?" We write it with a curly `∂`:

```
∂f/∂x   =  slope in the x-direction, holding y constant
∂f/∂y   =  slope in the y-direction, holding x constant
```

**Plain-English reading:** to take a partial derivative with respect to `x`, treat every *other* variable as if it were a frozen constant, and differentiate as usual.

**Worked example — `f(x, y) = x^2 + 3*x*y + y^2`:**

Partial with respect to `x` (treat `y` as a constant):

```
∂f/∂x = 2x + 3y + 0 = 2x + 3y
```
(The `x^2` gives `2x`; in `3xy` the `y` is a constant multiplier so it gives `3y`; the `y^2` is a constant w.r.t. x, so `0`.)

Partial with respect to `y` (treat `x` as a constant):

```
∂f/∂y = 0 + 3x + 2y = 3x + 2y
```

Evaluate both at the point `(x, y) = (1, 2)`:

```
∂f/∂x = 2*1 + 3*2 = 2 + 6 = 8
∂f/∂y = 3*1 + 2*2 = 3 + 4 = 7
```

**Why ML cares:** a model's error depends on *every* weight. To improve, we need to know how the error responds to each weight *individually* — that's a partial derivative per weight. Collect them all and you get the gradient.

### B.4 The gradient — direction of steepest ascent

The **gradient** of a multi-variable function is the vector of *all* its partial derivatives, written with the nabla symbol `∇`:

```
∇f = [ ∂f/∂x , ∂f/∂y ]     (one component per input variable)
```

For the example above at `(1, 2)`:

```
∇f(1, 2) = [8, 7]
```

**Plain-English reading — the single most important fact in this file:** the gradient is a vector that points in the direction of **steepest ascent** — the direction you'd walk to make the function increase *fastest*. Its *length* tells you *how steep* that climb is.

Picture the function as a hilly landscape and you're standing at a point. The gradient is an arrow on the ground pointing straight uphill, along the steepest route. If you want to go *up* fastest, walk along `∇f`. If you want to go **down** fastest, walk in `-∇f` — the exact opposite direction.

That last sentence is the entire idea behind learning. Error is a landscape; we want the lowest valley (least error); so we repeatedly step in the direction of the **negative gradient**. That's gradient descent (Module 3).

When the gradient is the zero vector `[0, 0, ...]`, every partial slope is flat — you're at a peak, a valley, or a saddle. For a valley (a minimum), that flatness is the signal that you've arrived.

**Why ML cares:** *training a model = descending the error landscape by following the negative gradient.* Every optimizer, every neural net, every "the loss went down" moment is this one idea repeated. Backpropagation (Module 5) is just an efficient way to compute this gradient for networks with millions of parameters.

### B.5 The chain rule (worked example)

Often a function is built by nesting one function inside another: `f(g(x))`. The **chain rule** tells you how to differentiate the composition:

```
d/dx f(g(x)) = f'(g(x)) * g'(x)
```

**Plain-English reading:** to differentiate nested functions, differentiate the *outer* function (leaving the inside alone), then multiply by the derivative of the *inside*. "Outer slope times inner slope." Rates of change *multiply* through the layers.

**Worked example — differentiate `f(x) = (3x + 1)^2`:**

Identify the layers: the outer function is `(something)^2`, the inner is `something = 3x + 1`.

```
outer:  u^2         →  derivative 2u          →  2*(3x+1)
inner:  3x + 1      →  derivative 3
```

Multiply:

```
d/dx (3x+1)^2 = 2*(3x+1) * 3 = 6*(3x + 1) = 18x + 6
```

**Check numerically at `x = 1`:** the formula gives `18*1 + 6 = 24`. By wiggling: `f(1) = (4)^2 = 16`, `f(1.001) = (4.003)^2 = 16.024009`, slope ≈ `(16.024009 - 16)/0.001 = 24.009 ≈ 24`. 

**A three-layer taste (this is literally backprop):** if `y = f(g(h(x)))`, then

```
dy/dx = f'(g(h(x))) * g'(h(x)) * h'(x)
```

The derivatives just keep multiplying as you peel outward-to-inward.

**Why ML cares — the chain rule *is* backpropagation.** A neural network is a deep nest of functions: input → layer 1 → activation → layer 2 → activation → ... → loss. To learn, we need the derivative of the loss with respect to every weight, no matter how deep it's buried. The chain rule says: multiply the local slopes along the path from that weight to the loss. Backprop is the bookkeeping that computes all these products efficiently, from the output backward. When you reach Module 5, remember this example — the machinery there is exactly `(outer slope) * (inner slope)`, layered.

### B.6 Why gradients matter for learning — the whole loop in one page

Let's connect every idea in this file into the sentence that defines machine learning:

> A model makes predictions using **linear algebra** (dot products and matrix multiplications of features with parameters). We measure how wrong it is with a **loss function** (one scalar, often built from `x^2` or `ln`). We compute the **gradient** of that loss with respect to the parameters (using **partial derivatives** and the **chain rule**). Then we take a small step in the **negative gradient** direction to reduce the loss. Repeat until the loss stops shrinking.

Every piece of that sentence is something you now understand from first principles:

- *Predictions* = dot products / matmuls (A.4, A.8, A.9).
- *How wrong* = a scalar norm/loss (A.5, B.2).
- *Which way to improve* = the negative gradient (B.4).
- *How to compute the gradient through many layers* = the chain rule (B.5).
- *A small step* = scalar-times-vector, the negative gradient scaled down (A.3).

That loop — predict, measure, differentiate, step — is *all* of supervised learning, from a one-line linear regression to a billion-parameter transformer. The rest of this curriculum fills in the details: what losses to use and why (Module 3), how to reason about the data and the classic algorithms (Modules 2 and 4), and how to stack the whole thing into deep networks (Module 5).

---

## Module 1 summary

- A **vector** is a data point / an arrow; a **matrix** is a dataset or a linear transformation.
- The **dot product** `w·x` is the weighted sum at the core of every linear model; its sign/angle meaning (`= |a||b|cos θ`) tells you alignment, and `= 0` means perpendicular.
- **Norms** measure size and distance (L2 = straight line, L1 = taxicab) and power both k-NN and regularization.
- **Matrix multiplication** (inner dims must match; each output entry is a dot product) is the atomic operation of neural networks; order matters (`AB ≠ BA`).
- **Span/basis** describe what a set of vectors can represent — the geometry behind features and dimensionality.
- **Projection** is the closest reachable point — the geometry behind least-squares regression.
- A **derivative** is a slope; a **partial derivative** is a slope in one variable; the **gradient** collects them and points uphill — so `-gradient` points to lower error.
- The **chain rule** multiplies local slopes through nested functions and *is* backpropagation.
- Learning = **predict (linear algebra) → measure (loss) → differentiate (gradient via chain rule) → step downhill → repeat.**

Next: [`02-probability-statistics.md`](./02-probability-statistics.md) — reasoning about uncertainty, the language of models that output probabilities.

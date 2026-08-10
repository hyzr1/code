# Module 4 — Classical Machine Learning

You now have the three pillars: linear algebra (represent data and models), probability/statistics (reason about uncertainty and derive losses), and optimization (fit models by gradient descent). Time to build actual learning algorithms.

This module has two parts:
- **Part A — the ML framing:** the concepts that apply to *every* model. Features, labels, the train/val/test split, generalization, overfitting, the bias-variance tradeoff, cross-validation. Get these right and everything else is technique; get them wrong and even a perfect algorithm gives worthless results.
- **Part B — the algorithms:** seven classic methods, each with its math, its intuition, and when to reach for it — then how to *evaluate* any of them honestly (the metrics), plus the single most dangerous mistake in applied ML (data leakage).

---

## Part A — The Machine Learning Framing

### A.1 Features and labels

- A **feature** (input, `x`) is a measured property of a thing. For a house: square footage, number of bedrooms, age. Features are the vector `x` from Module 1 — each example is a point in feature space.
- A **label** (target, `y`) is the answer you want to predict. For a house: its price. For an email: spam or not.

A **dataset** is a big table: one **row per example**, feature columns plus a label column. Stack the feature rows and you get the data matrix `X` (Module 1); stack the labels and you get the vector `y`.

Two flavors of supervised learning by label type:
- **Regression** — the label is a continuous number (price, temperature). Losses: MSE, MAE.
- **Classification** — the label is a category (spam/not, digit 0–9). Loss: cross-entropy.

(There's also **unsupervised** learning — no labels, just features — where the goal is to find structure. k-means clustering below is the classic example.)

### A.2 Train / validation / test — the golden rule

The whole point of ML is to perform well on **new, unseen data** — not to memorize the examples you trained on. So we *never* judge a model on the data it learned from. We split the dataset into three disjoint parts:

| Split | Typical size | Used for |
|---|---|---|
| **Training set** | ~60–80% | fitting the model (learning the weights) |
| **Validation set** | ~10–20% | tuning choices (learning rate, model type, regularization strength) |
| **Test set** | ~10–20% | ONE final, honest estimate of real-world performance |

**The golden rule: the test set is touched exactly once, at the very end.** If you peek at test performance and then adjust your model, the test set has secretly become part of training, and your final number is a lie. The test set simulates "the future" — data the model has never seen. Contaminate it and you lose your only honest measurement.

**Why three, not two?** The *validation* set exists because tuning is itself a form of learning. Every time you try a setting and check validation performance, you're fitting to the validation set a little. So you need a *separate*, still-pristine test set for the final verdict. (Module 2 callback: training data is your *sample*; the test set estimates performance on the *population*.)

### A.3 Generalization, overfitting, underfitting

**Generalization** is the goal: performing well on unseen data, not just the training data. A model generalizes when it has learned the *true underlying pattern* rather than the noise in its particular training sample.

Two ways to fail:

**Underfitting** — the model is *too simple* to capture the pattern. It does poorly on *both* training and test data. Like fitting a straight line to data that clearly curves — it can't represent the truth no matter how you train it.

**Overfitting** — the model is *too complex* and memorizes the training data, including its random noise. It does great on training data but *poorly on test data* — it learned the sample's quirks, not the population's pattern. Like a student who memorizes the practice exam's exact answers and then fails the real exam with different questions.

```
Underfit (too simple):        Good fit:                 Overfit (too complex):
  •   •                        •   •                       •   •
 ────────── (misses curve)    ___/‾‾\___ (captures it)   __/\_/\__/\_ (chases noise)
•       •   •                •       •  •               •  ⌇  ⌇ •  ⌇•
        ↑                                                    ↑
   high train error          low train & test error    low train, HIGH test error
```

**The tell-tale sign of overfitting:** a large gap between training performance (great) and test/validation performance (poor). If train accuracy is 99% but validation accuracy is 70%, you're overfitting. If both are 70% and you expected better, you're likely underfitting.

### A.4 The bias-variance tradeoff

This is the central theoretical idea for understanding model error. A model's expected error on new data decomposes into three parts:

```
Total error = Bias^2 + Variance + Irreducible noise
```

- **Bias** — error from wrong *assumptions*; the model is too simple to capture the real pattern. High bias → **underfitting**. (A straight-line model has high bias for curved data — it's systematically wrong.)
- **Variance** — error from *sensitivity to the specific training sample*; the model changes a lot if you swap in different training data. High variance → **overfitting**. (A very wiggly model fits each dataset's noise differently — it's unstable.)
- **Irreducible noise** — randomness in the data itself that no model can predict. The floor you can't beat.

**Plain-English reading:** *bias* is being consistently wrong in the same way (too rigid); *variance* is being wildly inconsistent (too flexible, chasing noise). You want both low, but there's a **tradeoff**: making a model more flexible lowers bias but raises variance, and vice versa.

```
Error
  |                    Total error (the U)
  |   \                    /
  |    \  Variance     ___/   ← total error is minimized
  |     \  (up) ______/           at the sweet spot
  |  Bias \_____/
  |  (down)      \____
  |____________________________ Model complexity →
       simple        sweet spot        complex
     (underfit)                      (overfit)
```

**The archery picture (Module 2 estimator callback):** bias is aiming off-center (arrows cluster tight but in the wrong spot); variance is a shaky hand (arrows scatter widely around the center). Low bias + low variance = tight cluster on the bullseye = a model that generalizes.

**Why it matters:** it gives you a diagnosis-and-fix framework. High bias (underfitting)? Use a more complex model, add features, train longer. High variance (overfitting)? Get more data, simplify the model, or add **regularization** (Part B.7). Every model-tuning decision is really a move along this tradeoff.

### A.5 Cross-validation

A single train/validation split has a weakness: your estimate depends on *which* points happened to land in validation. An unlucky split misleads you.

**k-fold cross-validation** fixes this. Split the training data into `k` equal folds (commonly `k=5` or `k=10`). Then train `k` times: each time, hold out one fold for validation and train on the other `k-1`. Average the `k` validation scores.

```
5-fold cross-validation (■ = validation fold, □ = training):

Round 1:  ■ □ □ □ □   →  score 1
Round 2:  □ ■ □ □ □   →  score 2
Round 3:  □ □ ■ □ □   →  score 3
Round 4:  □ □ □ ■ □   →  score 4
Round 5:  □ □ □ □ ■   →  score 5
                          average = robust performance estimate
```

**Plain-English reading:** instead of trusting one lucky/unlucky split, rotate the validation role through every chunk of data and average. Every point gets used for both training and validation (in different rounds), giving a more reliable, lower-variance estimate of performance — and telling you how *stable* the model is (do the 5 scores agree, or swing wildly?).

**Why ML cares:** cross-validation is the standard way to choose hyperparameters (learning rate, regularization strength, tree depth) and to compare models honestly, especially when data is limited. Still keep a separate final test set — cross-validation happens *within* the training data.

---

## Part B — The Algorithms

For each: the model (what function it computes), the math (loss + how it learns), the intuition, and when to use it.

### B.1 Linear Regression

**The model.** Predict a continuous label as a weighted sum of features plus a bias — a dot product (Module 1):

```
y_hat = w1*x1 + w2*x2 + ... + wn*xn + b  =  w · x + b
```

**Plain-English reading:** each feature contributes proportionally to its weight; add them up and add a baseline `b`. With one feature it's the line `y = w*x + b` — slope and intercept. The weights *are* the pattern: `w` for "bedrooms" tells you dollars-per-bedroom.

**The loss.** Mean squared error (Module 3), which is convex — one guaranteed minimum:

```
MSE = (1/n) * sum( (y_i - y_hat_i)^2 )
```

**How it learns — two routes:**

**Route 1: gradient descent.** Compute `∂MSE/∂w` and step downhill. The gradient of MSE for weight `wj` works out to a clean form:

```
∂MSE/∂wj = (2/n) * sum over i of ( (y_hat_i - y_i) * x_ij )
```

**Plain-English reading:** the gradient for a weight is the average of (prediction error) times (that feature's value). Big errors on examples where the feature is large → push that weight hard. This is *exactly* the update you'll implement: predict, compute errors, multiply by features, average, step. (This form generalizes directly to logistic regression and neural nets — remember it.)

**Route 2: the normal equation (closed form).** Because MSE is convex and quadratic, calculus gives the exact best weights in *one shot*, no iteration — set the gradient to zero and solve. In matrix form:

```
w = (X^T X)^(-1) X^T y
```

**Plain-English reading — connect to Module 1's projection:** this formula *projects* the true-answer vector `y` onto the space of predictions the linear model can produce, landing on the closest reachable point (least squared error). The `(X^T X)^(-1) X^T` is the projection machinery; the residual (leftover error) comes out orthogonal to the features, exactly as projections require. Least squares *is* a projection.

**When to use each:** the normal equation is exact and needs no learning rate, but inverting `X^T X` costs a lot when you have many features (matrix inversion is roughly cubic) and breaks if features are collinear (Module 1 — redundant columns make `X^T X` non-invertible). Gradient descent scales to huge datasets and many features. Small/medium problems → normal equation; large-scale → gradient descent.

**When to use linear regression at all:** predicting a continuous quantity when the relationship is roughly linear. Fast, interpretable (you can read off each feature's effect from its weight), a strong baseline. Struggles with genuinely nonlinear patterns (you can add polynomial features to help) and is sensitive to outliers (because MSE).

### B.2 Logistic Regression

Despite "regression" in the name, this is a **classification** algorithm — it predicts a *probability* of belonging to a class.

**The problem with using linear regression for classification:** `w · x + b` can output any number (−∞ to +∞), but a probability must live in `[0, 1]`. We need to squash the linear score into that range. Enter the sigmoid.

**The sigmoid function** squashes any real number into `(0, 1)`:

```
sigmoid(z) = 1 / (1 + e^(-z))
```

**Plain-English reading:** an S-shaped curve. Large positive `z` → output near 1; large negative `z` → output near 0; `z = 0` → output exactly 0.5. It turns an unbounded "score" into a probability.

```
sigmoid(-4) ≈ 0.018      sigmoid(0) = 0.5      sigmoid(4) ≈ 0.982
       ____________________
      /
     /   ← smooth S-curve from 0 to 1, crossing 0.5 at z=0
 ___/
```

**The model.** Compute a linear score, then squash it:

```
z = w · x + b
y_hat = sigmoid(z) = P(class = 1 | x)
```

**The loss.** Cross-entropy / log-loss (Module 3), which is convex for logistic regression:

```
loss = -(1/n) * sum( y*log(y_hat) + (1-y)*log(1-y_hat) )
```

Recall (Module 3) this savages confident-wrong predictions and is the Bernoulli-MLE loss — the principled choice for binary outcomes.

**How it learns.** Gradient descent. Here's a beautiful fact: the gradient of cross-entropy loss through the sigmoid simplifies to the *exact same clean form* as linear regression:

```
∂loss/∂wj = (1/n) * sum over i of ( (y_hat_i - y_i) * x_ij )
```

**Plain-English reading:** (prediction − truth) times feature, averaged — identical in shape to linear regression's gradient. The sigmoid's derivative and the log's derivative conspire to cancel into this simplicity. This is why both algorithms share one training loop; you'll implement them nearly identically.

**The decision boundary.** To turn a probability into a hard class, threshold at 0.5: predict class 1 if `y_hat >= 0.5`, else class 0. Since `sigmoid(z) = 0.5` exactly when `z = 0`, the boundary is where `w · x + b = 0` — a **line** (or hyperplane in higher dimensions). Logistic regression draws a straight dividing line through feature space; points on one side are class 1, the other side class 0.

**When to use:** binary classification with a roughly linear boundary. Fast, interpretable (weights show each feature's push toward a class), outputs calibrated probabilities (not just labels), and a superb baseline you should almost always try first. For multiple classes, its cousin **softmax regression** (Module 5) generalizes it. Limited to linear boundaries — for curved ones you need features engineering or a nonlinear model.

### B.3 k-Nearest Neighbors (k-NN)

The simplest idea in ML: **to classify a new point, look at the `k` closest known points and take a vote.**

**The "model"** (there's barely any). Store the entire training set. To predict for a new point `x`:
1. Compute the distance (usually L2 / Euclidean, Module 1) from `x` to every training point.
2. Find the `k` nearest.
3. **Classification:** the majority class among those `k` neighbors wins. **Regression:** average their values.

**Worked example — `k = 3`.** A new point's three nearest neighbors have labels `{spam, spam, not-spam}`. Vote: 2 spam vs 1 not-spam → predict **spam**.

**Plain-English reading:** "you are like your neighbors." Things close together in feature space probably share a label. No training, no weights, no equations — just distance and voting. It's called a **lazy learner** because it does no work up front; all the computation happens at prediction time.

**Choosing `k`** is the bias-variance tradeoff in miniature:
- **Small `k`** (e.g., 1): very flexible, follows every wiggle — low bias, **high variance** (one noisy neighbor flips the answer; overfits).
- **Large `k`**: smoother, averages over many neighbors — **high bias**, low variance (can wash out real local structure; underfits).
- Tune `k` on validation data. Use an odd `k` for binary classification to avoid ties.

**Feature scaling is mandatory (Module 3 callback).** k-NN is pure distance, so an unscaled large-range feature (income in dollars) dominates a small-range one (age), and the small feature is effectively ignored. Always standardize first.

**When to use:** small-to-medium datasets, low dimensions, when the decision boundary is irregular and you want a simple, assumption-free baseline. **Weaknesses:** slow at prediction time (must compare to all training points), memory-heavy (stores everything), and it collapses in high dimensions — the **curse of dimensionality**: when there are many features, all points become roughly equidistant and "nearest" loses meaning.

### B.4 k-Means Clustering

Our one **unsupervised** algorithm — *no labels*. Given unlabeled points, group them into `k` clusters of similar points. (Note: the `k` here means number of clusters, unrelated to k-NN's `k`.)

**The objective.** Choose `k` cluster centers (**centroids**) to minimize the total squared distance from each point to its nearest centroid:

```
minimize  sum over all points of  (distance from point to its assigned centroid)^2
```

**Plain-English reading:** find `k` "typical points" such that every data point is close to one of them. Minimizing squared distance means clusters should be tight and well-separated.

**The algorithm (Lloyd's algorithm)** — alternate two simple steps until stable:

```
1. Pick k initial centroids (e.g., random points).
2. ASSIGN: assign each point to its nearest centroid (forms k clusters).
3. UPDATE: move each centroid to the mean (average position) of the points assigned to it.
4. Repeat steps 2–3 until assignments stop changing (convergence).
```

**Worked intuition (1-D):** points `[1, 2, 3, 10, 11, 12]`, `k=2`, start centroids at 1 and 2.
- **Assign:** point 1→centroid1; points 2,3,10,11,12→centroid2 (closer to 2 than 1).
- **Update:** centroid1 = mean(1) = 1; centroid2 = mean(2,3,10,11,12) = 7.6.
- **Reassign:** with centroids at 1 and 7.6 → {1,2,3} go to 1's side, {10,11,12} to 7.6's side.
- **Update:** centroid1 = mean(1,2,3) = 2; centroid2 = mean(10,11,12) = 11.
- **Reassign:** same groups → converged. Final clusters `{1,2,3}` and `{10,11,12}` with centers 2 and 11. Exactly the two natural groups.

**Plain-English reading of why it works:** the ASSIGN step and the UPDATE step each *lower* the objective (assigning to the nearest center reduces distances; moving a center to the mean minimizes squared distance to its points). Alternating them drives the total down until it stalls — a valley of the objective.

**Caveats:**
- **You must pick `k` in advance.** Use the "elbow method": plot the objective vs `k` and look for the bend where adding clusters stops helping much.
- **Sensitive to initialization** — bad starting centroids can land in a poor local minimum. Run several times with different starts and keep the best (the `k-means++` initialization does this smartly).
- **Non-convex objective** — only local optima guaranteed (Module 3).
- **Scale features** (distance-based, like k-NN). Assumes roughly round, similar-sized clusters.

**When to use:** exploratory grouping — customer segmentation, compressing colors in an image, grouping documents — whenever you want to discover structure in unlabeled data and can guess roughly how many groups exist.

### B.5 Decision Trees

A decision tree classifies by asking a **sequence of yes/no questions** about features, like a flowchart, until it reaches a leaf that gives the answer.

```
                [Is income > $50k?]
                 /              \
               yes               no
               /                  \
      [Age > 30?]              Predict: Deny
       /       \
     yes        no
     /           \
  Approve      Deny
```

**Plain-English reading:** each internal node splits the data on one feature-threshold; each branch narrows things down; leaves hold the final prediction. Trees mirror how humans make decisions, which makes them wonderfully **interpretable** — you can read the exact rule that produced any prediction.

**How it learns — choosing the best split.** At each node, the tree picks the feature-and-threshold that best *separates the classes* — that makes the resulting groups as "pure" (single-class) as possible. We need to measure purity.

**Entropy** measures impurity/disorder (from information theory). For classes with proportions `p1, p2, ...`:

```
Entropy = - sum over classes of ( p * log2(p) )
```

- A perfectly pure node (all one class): `Entropy = -1*log2(1) = 0` (no disorder).
- A 50/50 mix of two classes: `Entropy = -(0.5*log2(0.5) + 0.5*log2(0.5)) = -(0.5*(-1) + 0.5*(-1)) = 1` (maximum disorder).

**Plain-English reading:** entropy is how mixed-up a group is. 0 = pure (all same class, no surprise); 1 (for two classes) = maximally mixed (a coin flip, most surprise). We want splits that *reduce* entropy — that sort the mess into pure piles.

**Information gain** = how much a split reduces entropy:

```
Information Gain = Entropy(parent) - weighted average Entropy(children)
```

The tree tries every feature/threshold and picks the split with the **highest information gain** — the one that most reduces disorder.

**Worked split example.** A node has 10 examples: 5 spam, 5 not-spam.

```
Parent entropy = -(0.5*log2(0.5) + 0.5*log2(0.5)) = 1.0   (maximally mixed)

Try splitting on "contains the word FREE?":
  YES branch (4 examples): 4 spam, 0 not-spam
      entropy = -(1.0*log2(1.0) + 0) = 0        (perfectly pure!)
  NO branch (6 examples): 1 spam, 5 not-spam
      entropy = -( (1/6)*log2(1/6) + (5/6)*log2(5/6) )
              = -( 0.1667*(-2.585) + 0.8333*(-0.263) )
              = -( -0.431 + -0.219 ) = 0.650

Weighted child entropy = (4/10)*0 + (6/10)*0.650 = 0 + 0.390 = 0.390

Information Gain = 1.0 - 0.390 = 0.610
```

A gain of 0.61 (out of a max of 1.0) — a strong split. The word "FREE" cleanly pulls out a pure pile of spam. The tree would compare this against splits on every other feature and pick whichever gives the largest gain, then recurse on each child.

**Gini impurity** is a popular alternative to entropy, measuring the chance of misclassifying a random element:

```
Gini = 1 - sum over classes of ( p^2 )
```

For 50/50: `Gini = 1 - (0.25 + 0.25) = 0.5`. It behaves almost identically to entropy but is cheaper to compute (no logarithms), so many implementations default to it. Either works.

**Overfitting and pruning.** A tree grown until every leaf is pure will *memorize* the training data — the ultimate overfitter (Part A.3). We control this by limiting **max depth**, requiring a **minimum number of samples per leaf**, or **pruning** branches that don't improve validation performance.

**When to use:** when interpretability matters (you can show the exact rules), for data with mixed feature types, and when relationships are nonlinear or involve interactions. **Weakness:** single trees are high-variance (overfit easily, unstable to small data changes) — which is exactly why **ensembles** of trees (Random Forests, Gradient Boosting) that average many trees are among the most powerful classical methods. You'll meet those after mastering the single tree.

### B.6 Naive Bayes

A probabilistic classifier built directly on **Bayes' theorem** (Module 2). It computes, for each class, the probability that the data point belongs to it, and picks the most probable class.

**The setup.** By Bayes' theorem, for a class `C` and features `x = (x1, x2, ..., xn)`:

```
P(C | x)  ∝  P(x | C) * P(C)
```

**Plain-English reading:** probability of the class given the features is proportional to (how likely these features are under that class) times (how common the class is). We compute this for every class and choose the largest — we can drop the denominator `P(x)` since it's the same for all classes and we only need to compare.

**The "naive" assumption.** Computing `P(x | C)` — the joint probability of *all* features together — is hard. So we make a bold simplifying assumption: **features are conditionally independent given the class** (Module 2, independence). That turns the joint probability into a simple product:

```
P(x | C) = P(x1 | C) * P(x2 | C) * ... * P(xn | C)
```

**Plain-English reading:** pretend each feature is independent evidence, so multiply their individual probabilities. This is "naive" because features usually *aren't* truly independent (in text, "New" and "York" co-occur). Yet the approximation works remarkably well in practice, especially for text.

**Worked intuition — spam filter.** For an email with words `w1, w2, ...`:

```
P(spam | words)   ∝  P(spam)   * P(w1|spam)   * P(w2|spam)   * ...
P(not-spam | words) ∝ P(not-spam) * P(w1|not-spam)* P(w2|not-spam)* ...
```

Estimate each piece by counting in the training data: `P(spam)` = fraction of emails that are spam; `P("free"|spam)` = fraction of spam emails containing "free". Compute both scores, pick the bigger. (In practice we sum *logs* of probabilities instead of multiplying many small numbers, to avoid numerical underflow — and use "Laplace smoothing" to avoid a single unseen word zeroing out the whole product.)

**When to use:** text classification (spam, sentiment, topic) is the killer app — it's fast, needs little data, and handles thousands of features (words) gracefully. A great baseline. **Weakness:** the independence assumption means its probability *estimates* are often poorly calibrated (over/under-confident), even when its *ranking* (which class is most likely) is correct.

### B.7 Regularization (L1 and L2)

Regularization is the primary weapon against **overfitting** (Part A.3, high variance). The idea: **penalize model complexity** by adding a term to the loss that punishes large weights, so the model prefers simpler explanations.

```
Total loss = (original loss, e.g., MSE) + lambda * (penalty on the weights)
```

`lambda` (lambda) is the **regularization strength** — a knob you tune on validation data. Higher lambda = stronger pressure toward small/simple weights.

**Why penalize large weights?** Large weights let the model make sharp, extreme responses to tiny feature changes — that's how it contorts itself to fit noise. Keeping weights small forces smoother, simpler functions that generalize better. (Module 2 estimator callback: this trades a little bias for a big reduction in variance.)

**L2 regularization (Ridge)** — penalize the *sum of squared* weights (the squared L2 norm, Module 1):

```
penalty = sum( wj^2 )
```

**Effect:** shrinks all weights smoothly toward zero, but rarely *exactly* to zero. It discourages any single weight from getting large, spreading influence across features. The go-to default.

**L1 regularization (Lasso)** — penalize the *sum of absolute* weights (the L1 norm):

```
penalty = sum( |wj| )
```

**Effect:** drives many weights *exactly to zero*, effectively deleting those features. This makes L1 a **feature-selection** tool — the resulting model is *sparse* (uses only a subset of features), which is great for interpretability and when you suspect many features are irrelevant.

**Why the difference? (Module 1 geometry callback.)** It comes from the shapes of the two norm "budgets." The L1 constraint region is a diamond with sharp corners *on the axes* (where some weights are exactly 0); the L2 region is a smooth circle. The optimal solution tends to touch the constraint region at a corner for L1 — landing on an axis, zeroing a weight — whereas the round L2 region has no corners, so it shrinks without zeroing. The taxicab-vs-Euclidean distinction from Module 1 has a direct, practical consequence.

| | L1 (Lasso) | L2 (Ridge) |
|---|---|---|
| Penalty | sum of `|w|` | sum of `w^2` |
| Effect on weights | many become exactly 0 (sparse) | all shrink smoothly, rarely 0 |
| Good for | feature selection, interpretability | general overfitting control (default) |

**When to use:** basically always add *some* regularization to linear/logistic models (and neural nets — Module 5). Use L2 by default; reach for L1 when you have many features and suspect most are useless and want the model to pick a few. ("Elastic Net" combines both.)

---

## Part C — Evaluating Models

Fitting a model is half the job; *measuring it honestly* is the other half. The wrong metric hides real failures (recall the Module 2 medical-test lesson).

### C.1 The confusion matrix (worked example)

For binary classification, every prediction falls into one of four boxes, laid out in the **confusion matrix**:

```
                        PREDICTED
                    Positive    Negative
         Positive   TP (30)     FN (10)      ← actually positive
ACTUAL
         Negative   FP (5)      TN (55)      ← actually negative
```

- **TP (True Positive):** predicted positive, actually positive — correct. (30)
- **TN (True Negative):** predicted negative, actually negative — correct. (55)
- **FP (False Positive):** predicted positive, actually negative — false alarm (Type I error). (5)
- **FN (False Negative):** predicted negative, actually positive — missed detection (Type II error). (10)

We'll use these numbers (100 examples: 40 actually positive, 60 actually negative) throughout.

### C.2 Accuracy — and why it lies

**Accuracy** = fraction of predictions that are correct:

```
Accuracy = (TP + TN) / (TP + TN + FP + FN) = (30 + 55) / 100 = 0.85 = 85%
```

**The trap (Module 2 base-rate callback):** accuracy is dangerously misleading on **imbalanced** data. If 99% of emails are legitimate, a lazy model that predicts "not spam" for *everything* scores 99% accuracy while catching *zero* spam — useless. When one class is rare, accuracy rewards ignoring it. You need metrics that look at the classes separately.

### C.3 Precision and recall

**Precision** — of the points we *predicted positive*, what fraction actually were? (Measures false-alarm rate.)

```
Precision = TP / (TP + FP) = 30 / (30 + 5) = 30/35 ≈ 0.857 = 85.7%
```

**Plain-English reading:** "when the model says positive, how often is it right?" High precision = few false alarms. Matters when a false positive is costly — e.g., flagging a legitimate email as spam (you'd miss an important message).

**Recall** (a.k.a. sensitivity, true-positive rate) — of the points that *actually are positive*, what fraction did we catch?

```
Recall = TP / (TP + FN) = 30 / (30 + 10) = 30/40 = 0.75 = 75%
```

**Plain-English reading:** "of all the real positives, how many did we find?" High recall = few misses. Matters when a false negative is costly — e.g., missing a real disease or a fraudulent transaction.

**The precision-recall tradeoff.** They pull against each other. Lower the decision threshold (flag more things as positive) → catch more real positives (recall up) but also more false alarms (precision down). Raise the threshold → fewer false alarms (precision up) but more misses (recall down). *Which* you favor depends on the cost of each error type: cancer screening prizes recall (never miss a case, tolerate false alarms); spam filtering prizes precision (don't trash good email, tolerate some spam getting through).

### C.4 F1 score

When you want a *single* number balancing precision and recall, use their **harmonic mean**, the **F1 score**:

```
F1 = 2 * (Precision * Recall) / (Precision + Recall)
   = 2 * (0.857 * 0.75) / (0.857 + 0.75)
   = 2 * 0.643 / 1.607
   ≈ 0.80 = 80%
```

**Why the harmonic mean (not a plain average)?** The harmonic mean punishes imbalance — it's only high when *both* precision and recall are high. A model with precision 1.0 but recall 0.01 has a plain average of ~0.5 (looks okay) but an F1 of ~0.02 (correctly damning). F1 refuses to be fooled by one great number hiding one terrible one.

**When to use:** a solid default single-number metric for imbalanced classification, when you care about both false alarms and misses.

### C.5 ROC curve and AUC (intuition)

A classifier's threshold is adjustable — every threshold gives a different precision/recall and a different confusion matrix. The **ROC curve** visualizes performance across *all* thresholds at once. It plots:
- **True Positive Rate** (= recall) on the y-axis, vs
- **False Positive Rate** (= FP / (FP + TN), the fraction of negatives wrongly flagged) on the x-axis,

tracing the curve as you sweep the threshold from strict to lenient.

```
TPR
 1 |        _____________
   |      /                 ← a good classifier hugs the top-left corner
   |    /       (perfect = straight up to (0,1) then across)
   |  /  ______ diagonal = random guessing (AUC 0.5)
   |/ /
 0 |/___________________
   0                    1  FPR
```

**AUC (Area Under the Curve)** collapses the whole ROC curve into one number — the area beneath it:

- **AUC = 1.0** — perfect classifier (separates the classes flawlessly at some threshold).
- **AUC = 0.5** — no better than random guessing (the diagonal line).
- **AUC = 0.5–1.0** — the usual range; higher is better.

**Plain-English reading of AUC:** it's the probability that the model ranks a *random positive example above a random negative example*. AUC = 0.9 means "given one real positive and one real negative, the model gives the positive a higher score 90% of the time." It measures how well the model *separates* the classes, independent of any particular threshold.

**When to use:** comparing classifiers' overall discriminative power, especially on imbalanced data, when you haven't committed to a specific threshold. (Its cousin, the precision-recall AUC, is often preferred for very imbalanced problems.)

### C.6 Choosing the right metric — summary

| Situation | Best metric(s) |
|---|---|
| Balanced classes, errors equally costly | Accuracy |
| Imbalanced classes | F1, precision/recall, AUC — **not** accuracy |
| False alarms costly (spam→inbox) | Precision |
| Misses costly (disease, fraud) | Recall |
| Compare models across all thresholds | ROC / AUC |
| Regression (continuous output) | MSE / RMSE, MAE, R² |

The meta-lesson: **pick the metric that reflects the real-world cost of each kind of mistake, *before* you train.** A high number in the wrong metric is worse than useless — it's confidently wrong.

### C.7 Data leakage — the silent result-killer

**Data leakage** is when information that wouldn't be available at real prediction time sneaks into training, giving falsely spectacular results that *collapse* in production. It is the single most common way applied ML projects fail, and it's insidious because everything *looks* great — until deployment.

**Common forms of leakage:**

1. **Test data contaminating training.** Fitting anything — a scaler, feature selection, imputation — on the *whole* dataset before splitting. Then the training process has "seen" the test set. (Module 3 warning callback: compute scaling stats on **train only**, apply to test.)

2. **Target leakage — a feature that secretly encodes the answer.** Example: predicting whether a patient has a disease, using the feature "was prescribed the disease's medication." That feature is basically the label in disguise — available only *after* diagnosis, not before. The model scores 99% in testing and is worthless in the real "predict-before-diagnosis" scenario.

3. **Temporal leakage — using the future to predict the past.** With time-series data, if you shuffle randomly, training examples from *after* a test example leak future information. You must split by time: train on the past, test on the future — mirroring reality.

4. **Duplicate or near-duplicate rows** split across train and test — the model effectively memorizes and "recognizes" test points.

**Plain-English reading:** leakage is *cheating without meaning to*. The model gets access to information at training time that it will never have at real prediction time, so its test score measures a fantasy. **The mental test:** for every feature and every preprocessing step, ask — *"would this information genuinely be available at the moment of prediction, computed only from data I'd legitimately have then?"* If not, it's leakage.

**Why it's catastrophic:** unlike overfitting (which a proper test set *catches*), leakage corrupts the test set itself, so your safety net fails silently. A leaky model sails through all your checks and then face-plants in production, often after you've staked real decisions on it. Guarding against leakage — strict splitting, fitting all preprocessing inside the training fold only, scrutinizing every feature's provenance — is a core professional discipline, not an afterthought.

---

## Module 4 summary

- **Framing first:** features (`x`) and labels (`y`); split into **train / validation / test** and touch test *once*; aim for **generalization**, guard against **underfitting** (too simple, high bias) and **overfitting** (too complex, high variance); the **bias-variance tradeoff** is the master lens; **cross-validation** gives robust estimates.
- **Linear regression:** `w·x + b`, MSE loss, learned by gradient descent or the normal equation (a projection, Module 1); interpretable baseline for continuous targets.
- **Logistic regression:** sigmoid squashes `w·x+b` into a probability, cross-entropy loss, linear decision boundary; the go-to classification baseline — and its gradient has the same clean `(y_hat − y)·x` form as linear regression.
- **k-NN:** vote among the `k` nearest points; lazy, needs scaling, suffers in high dimensions; `k` trades bias vs variance.
- **k-means:** unsupervised; alternate assign-to-nearest-centroid and move-centroid-to-mean to minimize within-cluster squared distance; pick `k`, watch initialization.
- **Decision trees:** flowchart of splits chosen by **information gain** (entropy or Gini); interpretable, nonlinear, prone to overfitting (control depth / prune); worked a split with gain 0.61.
- **Naive Bayes:** Bayes' theorem + conditional-independence assumption → multiply per-feature probabilities; excellent, fast text classifier.
- **Regularization:** add a weight penalty to fight overfitting — **L2** shrinks smoothly (default), **L1** zeros weights out (sparse / feature selection), a direct consequence of the norm geometry from Module 1.
- **Evaluation:** the **confusion matrix** (TP/TN/FP/FN); **accuracy** lies on imbalanced data; **precision** (few false alarms) vs **recall** (few misses) trade off; **F1** balances them (harmonic mean); **ROC/AUC** measures threshold-independent separation.
- **Data leakage** — future/test information sneaking into training — silently invalidates results; always ask "would this be available at real prediction time?"

Next: [`05-deep-learning.md`](./05-deep-learning.md) — stacking these ideas into neural networks, and deriving backpropagation from the chain rule.

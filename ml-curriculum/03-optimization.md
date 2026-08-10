# Module 3 — Optimization: How Models Actually Learn

You now know two big things:
- From Module 1: the **gradient** points uphill, so `-gradient` points downhill (toward smaller values).
- From Module 2: **MLE** says good parameters make the data probable, and this gives us principled **loss functions** to minimize.

This module fuses them into the engine of learning: define a loss that measures wrongness, then roll downhill on that loss using the gradient. That downhill roll is **gradient descent**, and some version of it trains essentially every model in modern ML — from a two-parameter line fit to a trillion-parameter language model.

We'll cover: what loss functions mean, the shape of the landscapes they create (convex vs not), gradient descent derived and worked by hand, the learning rate, the batch/stochastic/mini-batch family, momentum, the traps (local minima, saddles), and why feature scaling makes all of it converge faster.

---

## Part A — Loss Functions

A **loss function** (or cost function) takes the model's predictions and the true answers and returns a single number: *how wrong is the model?* Lower is better; zero is perfect. Training means finding parameters that make this number as small as possible.

Notation used throughout:
- `y` = the true answer (the label).
- `y_hat` = the model's prediction.
- `n` = the number of data points.

### A.1 Mean Squared Error (MSE) — for regression

```
MSE = (1/n) * sum over i of ( y_i - y_hat_i )^2
```

**Plain-English reading:** for each data point, take the error (prediction minus truth), *square it*, then average over all points. Squaring does two jobs: it makes errors positive (so +5 and −5 don't cancel), and it *punishes big errors disproportionately* — an error of 10 costs 100, while an error of 1 costs only 1. Big misses hurt a lot.

**Worked example:**

```
true:        y      = [3,  5,  7]
predicted:   y_hat  = [2,  5,  10]
errors:      (y-yh) = [1,  0,  -3]
squared:            = [1,  0,  9]
MSE = (1 + 0 + 9) / 3 = 10 / 3 ≈ 3.33
```

**Where it comes from (Module 2 callback):** MSE is the maximum-likelihood loss when you assume the noise on your targets is Gaussian. It isn't arbitrary — it's the principled choice under bell-curve noise.

**When to use:** regression (predicting continuous numbers — prices, temperatures). Its heavy punishment of large errors is good when big mistakes are truly bad, but it makes MSE **sensitive to outliers** (one wildly wrong point dominates the loss).

### A.2 Mean Absolute Error (MAE) — for regression, robustly

```
MAE = (1/n) * sum over i of | y_i - y_hat_i |
```

**Plain-English reading:** average the *absolute* errors — the raw distances, without squaring. An error of 10 costs 10, not 100. All errors are weighted in proportion to their size, no extra penalty for being large.

**Worked example (same data as A.1):**

```
errors:       [1,  0,  -3]
absolute:     [1,  0,   3]
MAE = (1 + 0 + 3) / 3 = 4 / 3 ≈ 1.33
```

**MSE vs MAE — the robustness tradeoff (Module 2 callback):** recall mean-vs-median. MSE relates to the *mean* (pulled around by outliers); MAE relates to the *median* (robust to outliers). If your data has a few crazy points you don't want to dominate training, MAE is safer. If big errors genuinely matter most, MSE is right. One wrinkle for later: MAE's slope is constant (`±1`), which gives gradient descent less guidance near the minimum, while MSE's slope smoothly shrinks as you approach the answer.

### A.3 Cross-Entropy (Log-Loss) — for classification

For classification, the model outputs a *probability* (Module 2). We need a loss that rewards confident-correct predictions and savagely punishes confident-wrong ones. That's **cross-entropy**. For binary classification (label `y` is 0 or 1, prediction `y_hat` is a probability in `(0,1)`):

```
BCE = -(1/n) * sum over i of [ y_i * log(y_hat_i) + (1 - y_i) * log(1 - y_hat_i) ]
```

It looks busy, but only one of the two terms is ever active per data point:
- If the true label `y = 1`: the second term vanishes (`1-y = 0`), leaving `-log(y_hat)`.
- If the true label `y = 0`: the first term vanishes, leaving `-log(1 - y_hat)`.

**Plain-English reading:** the loss for one point is `-log(probability the model assigned to the correct class)`. Since `log` of a number near 1 is near 0, and `log` of a number near 0 is a huge negative (so `-log` is a huge positive), the loss is **tiny when you're confidently right and enormous when you're confidently wrong.**

**Worked example — feel the punishment for confident wrongness.** True label `y = 1` in every case:

```
Model says y_hat = 0.9 (confident, correct):  loss = -log(0.9)   ≈ 0.105   (small)
Model says y_hat = 0.5 (unsure):              loss = -log(0.5)   ≈ 0.693   (medium)
Model says y_hat = 0.1 (confident, WRONG):    loss = -log(0.1)   ≈ 2.303   (large)
Model says y_hat = 0.01 (very confident, WRONG): loss = -log(0.01) ≈ 4.605 (huge)
```

As the model's confidence in the *wrong* answer approaches certainty, the loss shoots toward infinity. Cross-entropy makes overconfident mistakes extremely costly — exactly the incentive we want for a probabilistic classifier.

**Where it comes from (Module 2 callback):** cross-entropy is the maximum-likelihood loss for Bernoulli labels. Minimizing it = maximizing the likelihood of the observed classes. (The multi-class version pairs with softmax in Module 5.)

**When to use:** any classification where the model outputs probabilities — logistic regression (Module 4), neural network classifiers (Module 5).

### A.4 The big picture of losses

| Loss | Task | Punishes | Robust to outliers? | Derived from |
|---|---|---|---|---|
| MSE | regression | squared error (big errors extra) | no | Gaussian noise MLE |
| MAE | regression | absolute error (proportional) | yes | Laplacian noise MLE |
| Cross-entropy | classification | confident wrong predictions | — | Bernoulli MLE |

The common thread: **a loss encodes what you consider a bad prediction.** Choosing a loss is choosing your definition of "wrong." Everything after this is machinery for driving whichever loss you picked down toward zero.

---

## Part B — The Shape of the Landscape

### B.1 Loss as a landscape over parameters

Here's the mental picture that unlocks optimization. Fix your data. Now the loss is a function of the **parameters** (the weights). If a model has two weights `w1, w2`, then the loss `L(w1, w2)` is a *surface* — a landscape of hills and valleys sitting above the `(w1, w2)` plane. Height = how wrong the model is with those weights.

**Training = finding the lowest point of this landscape** — the weights where the loss is smallest. We don't have a map of the whole landscape (it's too big to explore fully), but at any point we *can* compute the gradient — the local uphill direction. So we feel our way downhill, step by step. That's the entire strategy.

### B.2 Convex vs non-convex

The *shape* of the landscape decides how hard the search is.

A **convex** function is bowl-shaped: it has exactly **one** minimum, and from anywhere, walking downhill always reaches it. There are no false valleys to get stuck in.

```
Convex (one valley):          Non-convex (many valleys):

  \                    /          \      /\        /\    /
   \                  /            \    /  \      /  \  /
    \                /              \  /    \    /    \/
     \____________ /                 \/      \  /
       (global min)                (local)   \/ (global min)
```

**Plain-English reading:** on a convex bowl, "always go downhill" is a *guaranteed* strategy — you'll roll to the single lowest point no matter where you start. On a non-convex landscape (multiple valleys, ridges, plateaus), going downhill might drop you into a *local* minimum — a valley that's low but not the *lowest*. Where you start, and how you step, now matters.

**Why ML cares:**
- **Linear and logistic regression have convex losses** — beautiful news, it means gradient descent finds *the* best answer, guaranteed. Simple models, no local-minimum worries.
- **Neural networks are wildly non-convex** — millions of parameters, a landscape full of valleys, ridges, and saddles. Remarkably, gradient descent still works well in practice (partly because in very high dimensions, most "traps" turn out to be saddle points you can slide past, not true minima — more in B.7). Understanding convexity tells you *why* some models are easy to train and others are an art.

---

## Part C — Gradient Descent

### C.1 The idea and the update rule

We want the lowest point of the loss landscape. We can compute the gradient (uphill direction) anywhere. So: **repeatedly take a small step in the downhill direction** (`-gradient`). Each step lowers the loss a bit; enough steps and we reach a valley.

The **update rule** for each parameter `w`:

```
w_new = w_old - alpha * (∂L/∂w)
```

- `∂L/∂w` is the gradient of the loss with respect to that weight — the uphill slope.
- The **minus sign** turns uphill into downhill.
- `alpha` (alpha, the **learning rate**) is a small positive number controlling *how big* a step to take.

**Plain-English reading:** to improve a weight, look at how the loss slopes in that weight's direction, and move the weight a little bit the *opposite* way (downhill). Big slope → the term `alpha * (∂L/∂w)` is big → big step. As you near the bottom, the slope flattens toward zero, so the steps automatically shrink and you settle in. Beautiful self-braking behavior.

For a model with many weights, you apply this rule to *every* weight at once, using each weight's own partial derivative. In vector form: `w := w - alpha * ∇L`.

### C.2 Worked 1-D example: minimizing f(x) = x^2

Let's run gradient descent fully by hand on the simplest possible landscape, `f(x) = x^2` — a convex bowl whose minimum is obviously at `x = 0`. We'll watch the algorithm discover that.

The gradient (derivative) is `f'(x) = 2x` (power rule, Module 1). Update rule: `x_new = x_old - alpha * 2x`. Pick learning rate `alpha = 0.1` and start at `x = 5`.

```
Step 0:  x = 5.000
         f'(5) = 2*5 = 10        (steep positive slope → we're up the right wall)
         x = 5.000 - 0.1*10 = 5.000 - 1.000 = 4.000

Step 1:  x = 4.000
         f'(4) = 8
         x = 4.000 - 0.1*8 = 4.000 - 0.8 = 3.200

Step 2:  x = 3.200
         f'(3.2) = 6.4
         x = 3.200 - 0.64 = 2.560

Step 3:  x = 2.560
         f'(2.56) = 5.12
         x = 2.560 - 0.512 = 2.048

Step 4:  x = 2.048  →  x = 1.638
Step 5:  x = 1.638  →  x = 1.311
 ...
Step 10: x ≈ 0.537
Step 20: x ≈ 0.058
Step 30: x ≈ 0.006
```

**Watch what happens:** `x` marches steadily toward 0 — the true minimum. And notice the **steps shrink automatically**: the first step moved 1.0, but by step 4 the move is only ~0.4, and near the bottom the moves are tiny. That's because the slope `2x` gets smaller as `x` approaches 0. Gradient descent *decelerates on its own* as it homes in. Each value of `x` is a valid pattern: multiply the current `x` by `(1 - 2*alpha) = 0.8` to get the next one. That "0.8 per step" geometric decay is the fingerprint of gradient descent on a quadratic.

**This is the whole algorithm.** A real model just does this in millions of dimensions at once, with `∂L/∂w` per weight instead of `f'(x)`. The essence is exactly what you see above.

### C.3 Gradient descent in pseudocode

```
# Minimize loss L(w) over parameters w
initialize w  (e.g., random small numbers, or zeros)
choose learning rate alpha
repeat for many iterations:
    grad = gradient of L with respect to w   # the ∂L/∂w vector
    w = w - alpha * grad                      # step downhill
    # optionally: if grad is ~0 (loss stopped improving), stop early
return w
```

That's it. Everything else in optimization is refinement of this five-line loop: how to pick `alpha`, how much data to use per `grad`, how to add memory (momentum), and how to prep the data (scaling) so the loop converges quickly. When you implement linear/logistic regression from scratch in the app, this loop *is* the implementation — you just plug in the specific gradient formula.

---

## Part D — The Learning Rate

The learning rate `alpha` is the single most important knob in optimization. It sets the step size, and getting it wrong breaks training in one of two opposite ways.

### D.1 Too small — painfully slow

If `alpha` is tiny (say 0.0001), each step barely moves. You *will* eventually reach the minimum, but it might take millions of iterations — wasting time and compute.

```
alpha too small:  \                          
                   \ . . . . . (tiny steps, crawling down forever)
                    \_._._._._._
                      (min)
```

**Symptom:** the loss decreases, but agonizingly slowly, and may seem to "stall" while still far from optimal.

### D.2 Too big — overshoot and diverge

If `alpha` is too large, each step overshoots the minimum — you leap over the valley and land higher up the *opposite* wall. Next step overshoots back even farther. The loss *increases* and blows up to infinity.

Watch it happen on `f(x) = x^2` with `alpha = 1.1`, starting at `x = 5` (update `x = x - 1.1*2x = x*(1 - 2.2) = -1.2*x`):

```
Step 0:  x = 5.0
Step 1:  x = 5.0 * (-1.2) = -6.0     (overshot past 0 to the other side, FARTHER out)
Step 2:  x = -6.0 * (-1.2) = 7.2     (even farther)
Step 3:  x = 7.2 * (-1.2) = -8.64    (diverging!)
 ...spiraling outward toward infinity
```

**Symptom:** the loss increases, oscillates wildly, or becomes `NaN` (not-a-number, from overflow). If you ever see loss exploding, *lower the learning rate* first.

### D.3 Just right — the Goldilocks zone

A good `alpha` takes steps large enough to make fast progress but small enough not to overshoot. In practice you tune it — common starting points are 0.1, 0.01, 0.001 — and watch the loss curve:

```
Loss over iterations:

too big:      /\/\/\  (bouncing / diverging)
too small:    \______ (crawling, barely moving)
just right:   \___    (smooth, steady decrease to a low plateau)
```

**Practical wisdom:** plot loss vs iteration. A healthy run drops fast at first, then flattens as it nears the minimum. Modern optimizers (Adam, and learning-rate *schedules* that start larger and decay) automate a lot of this, but they're all managing this same fundamental tension: big enough to progress, small enough not to overshoot.

---

## Part E — Batch, Stochastic, and Mini-Batch

To compute the gradient of the loss, you need to look at data. *How much* data per step gives three flavors of gradient descent — a speed-vs-stability tradeoff.

### E.1 Batch gradient descent

Use the **entire** training set to compute each gradient before taking one step.

- **Pro:** the gradient is exact and smooth — you head straight toward the minimum, stable descent.
- **Con:** one step requires processing *all* the data. With millions of examples, each step is slow and memory-hungry. You take relatively few, expensive steps.

**Analogy:** carefully survey the entire mountain before every single step. Accurate direction, but you barely move per hour.

### E.2 Stochastic gradient descent (SGD)

Use just **one** randomly chosen data point to compute each gradient.

- **Pro:** each step is lightning-fast (one example). You take *many* cheap steps, so you make rapid early progress. And the built-in noise can actually *help* — random jitter can bounce you out of shallow bad valleys in non-convex landscapes.
- **Con:** each single-point gradient is a *noisy estimate* of the true gradient, so the path to the minimum is jittery — it wanders and never fully settles, oscillating around the bottom.

**Analogy:** glance at your feet and step immediately. Fast and lots of steps, but a drunken, zig-zag walk downhill.

### E.3 Mini-batch gradient descent (what everyone actually uses)

Use a **small batch** — typically 32, 64, 128, or 256 examples — to compute each gradient. This is the practical sweet spot combining the best of both.

- **Balanced:** the gradient is a decent estimate (much less noisy than one point) but far cheaper than the full dataset. Steady-ish progress with fast steps.
- **Hardware-friendly:** a batch is a *matrix*, and matrix multiplication (Module 1) is exactly what GPUs accelerate. Batching turns learning into big matmuls — the reason ML runs fast on GPUs.

```
                Data per step      Step cost   Path to minimum
Batch           all N examples     expensive   smooth, direct
SGD             1 example          cheap       very noisy, wandering
Mini-batch      e.g. 32–256        moderate    slightly noisy, efficient  ← default
```

**Vocabulary you'll see constantly (Module 5):**
- One **epoch** = one full pass through the entire training dataset.
- With mini-batches, one epoch consists of many steps (dataset size ÷ batch size steps). E.g., 10,000 examples with batch size 100 = 100 steps per epoch.
- Training runs for many epochs, cycling through the data repeatedly.

Confusingly, people say "SGD" loosely to mean mini-batch gradient descent — the pure one-point version is rare. When someone says "we trained with SGD, batch size 64," they mean mini-batch.

---

## Part F — Momentum

Plain gradient descent has a weakness: in landscapes shaped like a long narrow ravine (steep sides, gently sloping floor), it *bounces back and forth across the steep walls* while creeping slowly along the floor toward the actual minimum. Wasteful zig-zagging.

**Momentum** fixes this by giving the descent *inertia* — it remembers past steps and keeps rolling in the accumulated direction, like a heavy ball rolling downhill rather than a feather blown by each local gust.

The idea in formulas: maintain a running "velocity" `v` that blends the old velocity with the new gradient, then step using the velocity:

```
v_new = beta * v_old + (1 - beta) * gradient      # accumulate direction (beta ≈ 0.9)
w_new = w_old - alpha * v_new                      # step using the accumulated velocity
```

**Plain-English reading:** instead of stepping purely by the current gradient, step by a *smoothed average* of recent gradients (`beta`, around 0.9, controls how much memory). Directions that stay consistent (the true downhill along the ravine floor) *accumulate and reinforce*, so you accelerate along them. Directions that keep flip-flopping (the side-to-side bouncing) *cancel out*, so the oscillation is damped.

**The picture:**

```
Without momentum (bounces across the ravine):     With momentum (rolls smoothly along it):
   \  /\  /\  /\  /                                  \
    \/  \/  \/  \/  → slowly reaching min             \_______________ → quickly to min
```

**Why ML cares:** momentum dramatically speeds up training on the ravine-like landscapes that neural nets create, and helps power through small bumps and plateaus. It's a core ingredient of the optimizers you'll actually use — **Adam**, the default optimizer for deep learning, is essentially momentum plus a per-parameter adaptive learning rate. You don't need Adam's full formula now; just know momentum = "keep rolling in the consistent direction, smooth out the noise."

---

## Part G — Local Minima and Saddle Points

On non-convex landscapes (all neural nets), gradient descent can get *stuck* where the gradient is zero but you're not at the true bottom. Two kinds of stuck:

- **Local minimum** — a valley that's lower than everything nearby but higher than the *global* minimum elsewhere. Downhill in every direction locally, so gradient descent stops, yet it's not the best answer.
- **Saddle point** — a spot that's a minimum along some directions but a *maximum* along others — like the middle of a horse's saddle or a mountain pass. The gradient is zero (flat), so naive descent can stall there, even though you *could* still go down if you moved sideways.

```
Local minimum:              Saddle point:
     \    /\    /              going one way: valley (up on both sides)
      \  /  \  /               going the other: ridge (down on both sides)
       \/    \/   ← stuck      ─ flat in the middle, gradient = 0
     (not the deepest)
```

**Plain-English reading:** a zero gradient means "locally flat," but flat can mean bottom-of-valley, top-of-hill, *or* saddle. Gradient descent only knows the local slope, so it can freeze at any of these.

**The reassuring reality (why deep learning works anyway):** for a long time people feared local minima would doom neural network training. It turned out that in **very high-dimensional** spaces (millions of weights), true bad local minima are rare — for a point to be a local minimum, the loss must curve *upward in every single one of a million directions* at once, which is statistically unlikely. Far more common are **saddle points**, and momentum-based optimizers (Part F) with a bit of noise (from mini-batching, Part E) usually slide right past them. Also, in these huge networks most local minima turn out to be *nearly as good* as the global one. This is a big part of why gradient descent — a simple downhill walk — successfully trains enormous non-convex networks.

**Why ML cares:** it explains why we don't panic about non-convexity, why noise (SGD) and momentum are helpful rather than just tolerated, and why "good enough" minima are the norm in practice. You aim for a low valley, not necessarily *the* lowest.

---

## Part H — Feature Scaling

One more practical essential, and it ties directly back to convergence speed. **Feature scaling** means transforming your input features so they're on comparable numeric ranges *before* training.

### H.1 The problem: mismatched scales warp the landscape

Suppose you predict house prices from two features:
- `size` in square feet: ranges ~500 to 5000.
- `bedrooms`: ranges 1 to 5.

These live on wildly different scales (thousands vs single digits). This distorts the loss landscape into a **stretched, elongated ravine** — very steep in the `bedrooms` direction (small changes matter a lot per unit) and very shallow in the `size` direction. And we just saw (Part F) that gradient descent *hates* ravines: it bounces across the steep axis while crawling along the shallow one. Training becomes slow and finicky, and you can't pick a single learning rate that suits both directions (too big for one axis, too small for the other).

### H.2 The fixes

**Standardization (z-score)** — the most common. For each feature, subtract its mean and divide by its standard deviation (both from Module 2):

```
x_scaled = (x - mean) / std
```

After this, every feature has mean 0 and standard deviation 1 — comparable spreads. **Plain-English reading:** re-express each feature as "how many standard deviations above or below its average" (recall the 68-95-99.7 rule — this puts everything on that universal scale).

**Worked example — standardize `size` values `[1000, 2000, 3000]`:**

```
mean = 2000
std  = sqrt( ((1000-2000)^2 + 0 + (3000-2000)^2) / 3 ) = sqrt(2,000,000/3) ≈ 816
scaled: (1000-2000)/816 ≈ -1.22
        (2000-2000)/816 =  0.00
        (3000-2000)/816 ≈ +1.22
```

Now these sit in roughly `[-1.2, 1.2]`, the same ballpark as scaled bedroom counts.

**Min-max normalization** — the alternative, squashing each feature into `[0, 1]`:

```
x_scaled = (x - min) / (max - min)
```

E.g., a size of 2000 with min 1000 and max 3000 → `(2000-1000)/(3000-1000) = 0.5`.

### H.3 Why it helps convergence

With features on similar scales, the loss landscape becomes **round and bowl-like instead of a stretched ravine.** On a round bowl, the downhill direction points *straight at the minimum* from everywhere, so gradient descent walks directly there — no bouncing, far fewer steps, and one learning rate works for all directions.

```
Unscaled features (stretched ravine):    Scaled features (round bowl):
   ________________                            ___
  (            •   )  ← zig-zags across        (   )
  (________________)     the narrow axis        ( • )  ← straight shot to center
                                                 (___)
```

**One critical warning (previews Module 4's data leakage):** compute the scaling statistics (mean, std, min, max) using **training data only**, then apply *those same* numbers to the validation and test sets. If you compute the mean/std over the whole dataset including test data, information about the test set leaks into training and your results become dishonestly optimistic. Fit the scaler on train; apply it everywhere.

**Why ML cares:** scaling is a cheap, near-mandatory preprocessing step that makes gradient descent converge dramatically faster and more reliably. Distance-based methods (k-NN, k-means in Module 4) *require* it — otherwise the large-scale feature (size) drowns out the small-scale one (bedrooms) in every distance computation, and the small feature effectively gets ignored.

---

## Module 3 summary

- A **loss function** turns "how wrong is the model" into one number to minimize: **MSE** (regression, punishes big errors, from Gaussian MLE), **MAE** (regression, robust to outliers), **cross-entropy** (classification, savages confident-wrong predictions, from Bernoulli MLE).
- The loss over the parameters is a **landscape**; training = finding its lowest point. **Convex** landscapes (linear/logistic regression) have one guaranteed minimum; **non-convex** ones (neural nets) have many.
- **Gradient descent** rolls downhill via `w := w - alpha * (∂L/∂w)`. Worked on `f(x)=x^2`, it marches to the minimum with automatically shrinking steps.
- The **learning rate** `alpha` is the key knob: too small = crawling, too big = overshoot/diverge. Watch the loss curve.
- **Batch** (all data, smooth/slow), **SGD** (one point, fast/noisy), **mini-batch** (32–256, the practical default, GPU-friendly). One **epoch** = one full pass; training runs many epochs.
- **Momentum** gives descent inertia — accumulates consistent directions, cancels oscillation — and underlies Adam.
- **Local minima and saddle points** are zero-gradient traps; in high dimensions saddles dominate and momentum+noise usually escape them, which is why gradient descent trains huge non-convex nets successfully.
- **Feature scaling** (standardization / min-max) turns a stretched ravine into a round bowl so gradient descent converges fast — fit the scaler on training data only.

Next: [`04-classical-ml.md`](./04-classical-ml.md) — putting losses and gradients to work in the classic algorithms, and learning to evaluate models honestly.

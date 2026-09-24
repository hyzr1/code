# Machine Learning from 0 to Mastery — Written Curriculum

Welcome. This is the **companion reading** for the Machine Learning track in Hyzr Code. It is the theory-and-math half of the course: the part you read slowly, with a pen, working the tiny examples by hand. The coding lessons in the app will lean on everything derived here.

You already know how to program. You are comfortable with Python, data structures, closures and decorators, Big-O, and the standard interview algorithms. What you do **not** yet know is any of the mathematics that makes machine learning tick. That is exactly what this curriculum builds — from zero, honestly, one idea at a time.

> **Our promise:** we will not hand-wave the math. Every formula is followed by a plain-English reading and a small concrete example you can check by hand. But we will also never dump a formula on you without first building the intuition for *why it has to look like that*. Math you can re-derive is math you own.

---

## Table of contents

| # | File | Topic |
|---|------|-------|
| 0 | **README.md** (this file) | Roadmap, dependency order, how to study |
| 1 | [`01-math-foundations.md`](./01-math-foundations.md) | Linear algebra + calculus for ML |
| 2 | [`02-probability-statistics.md`](./02-probability-statistics.md) | Probability + statistics + MLE |
| 3 | [`03-optimization.md`](./03-optimization.md) | Loss functions + gradient descent |
| 4 | [`04-classical-ml.md`](./04-classical-ml.md) | The classic algorithms + evaluation |
| 5 | [`05-deep-learning.md`](./05-deep-learning.md) | Neural nets, backprop, and beyond |

---

## The five modules

### Module 1 — Math foundations (`01-math-foundations.md`)
The two branches of math that everything else rests on.

- **Linear algebra:** scalars, vectors, vector arithmetic, the dot product and its geometric meaning, norms (L1/L2), matrices, matrix-vector and matrix-matrix multiplication (worked 2x2 by hand), transpose, identity, linear combinations, span and basis, and projections.
- **Calculus:** the derivative as a slope, the basic rules, partial derivatives, the **gradient** as the direction of steepest ascent, the chain rule (worked example), and why gradients are the engine of learning.

Everything downstream is built from these two ideas: *data is vectors and matrices*, and *learning is following gradients downhill*.

### Module 2 — Probability & statistics (`02-probability-statistics.md`)
How to reason about uncertainty and data.

- **Probability:** sample spaces, events, conditional probability, independence, **Bayes' theorem** (worked medical-test example), random variables, expectation, variance, standard deviation, and the workhorse distributions — Bernoulli, Binomial, and the Gaussian (with 68-95-99.7).
- **Statistics:** population vs sample, the summary statistics, covariance and correlation, sampling, what an *estimator* is, **Maximum Likelihood Estimation** (worked coin example), the law of large numbers, and central-limit-theorem intuition.

This module gives you the language of *models that predict probabilities* and the principle (MLE) behind most loss functions you will meet.

### Module 3 — Optimization (`03-optimization.md`)
The mechanics of *fitting* a model to data.

- Loss/cost functions: **MSE, MAE, cross-entropy** and what each one rewards and punishes.
- Convex vs non-convex landscapes.
- **Gradient descent** derived from the gradient — the update rule, a worked 1-D example minimizing `f(x) = x^2`, the learning rate (too big / too small), batch vs stochastic vs mini-batch, momentum, local minima and saddle points, and feature scaling.

If Module 1 tells you *what a gradient is*, Module 3 tells you *how to use it to learn*.

### Module 4 — Classical ML (`04-classical-ml.md`)
The algorithms that solved real problems for decades and still do.

- The ML framing: features, labels, train/val/test, generalization, overfitting/underfitting, the **bias-variance tradeoff**, cross-validation.
- The algorithms, each with math + intuition + when to use: **linear regression**, **logistic regression**, **k-nearest neighbors**, **k-means**, **decision trees** (entropy/Gini + a worked split), **naive Bayes**, and **regularization** (L1/L2).
- **Evaluation:** accuracy, precision, recall, F1, the confusion matrix (worked example), ROC/AUC intuition — and **data leakage**, the silent result-killer.

### Module 5 — Deep learning (`05-deep-learning.md`)
Neural networks from the single neuron up.

- The **perceptron** and why one linear unit cannot solve XOR.
- **Activation functions** (sigmoid, tanh, ReLU) and why non-linearity is the whole game.
- The **multi-layer perceptron**: forward pass as repeated matmul + activation.
- **Softmax + cross-entropy** for classification.
- **Backpropagation derived via the chain rule** for a tiny 2-layer network, step by step.
- The training loop, weight initialization, vanishing/exploding gradients, and overfitting remedies (regularization, dropout, early stopping).
- Lighter-touch intuition for **CNNs, RNNs, embeddings, and attention/transformers** — plus a "how to reach mastery" send-off.

---

## Dependency order (read in this order)

```
        ┌─────────────────────────────┐
        │  1. Math foundations         │
        │  (linear algebra + calculus) │
        └──────────────┬──────────────┘
                       │
          ┌────────────┴────────────┐
          │                         │
          ▼                         ▼
┌───────────────────┐   ┌──────────────────────┐
│ 2. Probability &  │   │  3. Optimization      │
│    statistics     │   │  (needs calculus)     │
│ (needs a little   │   │                       │
│  calculus)        │   │                       │
└─────────┬─────────┘   └───────────┬──────────┘
          │                         │
          └────────────┬────────────┘
                       ▼
        ┌─────────────────────────────┐
        │  4. Classical ML             │
        │  (needs 1, 2, and 3)         │
        └──────────────┬──────────────┘
                       ▼
        ┌─────────────────────────────┐
        │  5. Deep learning            │
        │  (needs everything above)    │
        └─────────────────────────────┘
```

**In words:**

1. **Start with Module 1.** Nothing else makes sense without vectors, matrices, and gradients.
2. **Then Modules 2 and 3 in either order.** Module 2 (probability) needs only a little calculus. Module 3 (optimization) needs the gradient from Module 1. They are independent of each other, though reading 2 first makes cross-entropy in Module 3 land better.
3. **Then Module 4.** Classical ML uses linear algebra (Module 1), Bayes/MLE (Module 2), and gradient descent (Module 3).
4. **Finish with Module 5.** Deep learning is the payoff — it reuses *everything*: matmul, gradients, the chain rule, softmax, cross-entropy, and regularization.

Do not skip ahead. If a symbol in Module 4 looks strange, the fix is almost always a re-read of the relevant page in Module 1 or 2.

---

## How long each module takes

These are honest estimates for a motivated learner who works the examples (not just reads them). "Study time" means focused reading + doing the by-hand exercises; the coding lessons in the app are additional.

| Module | Study time | Notes |
|--------|-----------|-------|
| 1. Math foundations | 8–12 hours | The heaviest lift if math is rusty. Take two sittings. |
| 2. Probability & statistics | 6–9 hours | Bayes and MLE deserve slow reading. |
| 3. Optimization | 4–6 hours | Shorter, but the ideas recur constantly afterward. |
| 4. Classical ML | 10–14 hours | Long — seven algorithms plus evaluation. Spread over several sessions. |
| 5. Deep learning | 10–15 hours | The backprop derivation alone is worth an afternoon. |
| **Total** | **~40–55 hours** | Roughly 4–8 weeks at a sustainable pace. |

There is no prize for speed. ML rewards depth: one derivation you can reproduce beats ten you skimmed.

---

## How to study this

A few habits that make this material stick:

1. **Read with a pen.** Every worked example in these files is small enough to redo by hand. Redo it. Cover the answer, compute it yourself, then check. The friction is the learning.

2. **Say the formula out loud in English.** We give a plain-English reading after every formula for exactly this reason. If you can narrate what a formula *does*, you understand it. If you can only recite symbols, you don't yet.

3. **Chase the intuition before the algebra.** When a derivation feels like symbol-pushing, stop and ask "what is this *trying* to do?" The prose around each formula answers that. The algebra is just bookkeeping on top of an idea.

4. **Build the tiny numeric example in your head as a sanity check.** Before trusting any formula, plug in the simplest possible numbers (a 2-vector, a 2x2 matrix, a coin) and confirm it does something sensible. This is how you catch your own misunderstandings early.

5. **Connect every idea forward to code.** Wherever an algorithm will be implemented from scratch in a later Hyzr Code lesson, we explain the math so the implementation becomes *obvious*. As you read, keep asking "how would I write this as a Python loop?" — that question is the bridge from theory to the keyboard.

6. **It is normal to loop back.** You will read Module 1, not fully get span, move on, and suddenly understand it when projections show up in linear regression. Understanding in ML is iterative. Let it be.

7. **Notation is plain-text on purpose.** To render everywhere, we avoid LaTeX. We write `w1*x1 + w2*x2 + b`, use `^` for powers (`x^2`), `sqrt(...)` for roots, `d/dx` and `∂L/∂w` for derivatives, and spell out Greek letters ("sigma", "mu") where it reads more clearly. Fenced code blocks hold Python, pseudocode, and hand-worked arithmetic.

Now open [`01-math-foundations.md`](./01-math-foundations.md) and let's begin.

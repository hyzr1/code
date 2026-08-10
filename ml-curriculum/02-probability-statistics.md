# Module 2 — Probability & Statistics for Machine Learning

Machine learning is, at its core, *reasoning under uncertainty*. Data is noisy. Predictions are guesses with confidence attached. Many models output probabilities, not certainties ("87% chance this email is spam"). This module gives you the language to think clearly about uncertainty and to summarize data honestly.

Two halves:

- **Probability** — the math of chance. Given a known model of the world, what outcomes should we expect?
- **Statistics** — the reverse. Given observed data, what model of the world produced it? This reverse direction is *exactly* what learning is.

As always: every formula gets a plain reading and a tiny worked example. Keep a pen handy.

---

## Part A — Probability

### A.1 Sample spaces and events

A **sample space** (written `S` or `Omega`) is the set of *all possible outcomes* of some random process.

- Flip one coin: `S = {Heads, Tails}`.
- Roll one die: `S = {1, 2, 3, 4, 5, 6}`.

An **event** is any subset of the sample space — a collection of outcomes we care about.

- "Roll an even number" is the event `E = {2, 4, 6}`.
- "Roll a 5" is the event `{5}`.

The **probability** of an event is a number from 0 (impossible) to 1 (certain). When all outcomes are equally likely:

```
P(event) = (number of outcomes in the event) / (total number of outcomes)
```

**Worked example — probability of rolling an even number:**

```
P(even) = |{2,4,6}| / |{1,2,3,4,5,6}| = 3 / 6 = 0.5
```

**Plain-English reading:** count the ways the event can happen, divide by the total number of equally likely things that could happen. Half of the die faces are even, so the probability is one-half.

Three rules that always hold:
- `0 <= P(event) <= 1`.
- `P(S) = 1` (something in the sample space must happen).
- If two events can't both happen (mutually exclusive), `P(A or B) = P(A) + P(B)`.

**Why ML cares:** classifiers output probabilities over a sample space of labels (`{spam, not-spam}` or the 10 digit classes). Understanding that these are numbers in `[0,1]` that must sum to 1 across all classes is the foundation of the softmax and cross-entropy you'll meet in Modules 3 and 5.

### A.2 Conditional probability

Often new information changes the odds. **Conditional probability** `P(A | B)` is "the probability of A *given that* B has happened."

```
P(A | B) = P(A and B) / P(B)
```

**Plain-English reading:** once we know `B` happened, we live in a smaller world — only the outcomes where `B` is true. Within that world, what fraction also have `A`? That's `P(A|B)`. We divide by `P(B)` to renormalize to the new, shrunken world.

**Worked example — a die roll:** Let `A` = "rolled a 2", `B` = "rolled an even number".

```
P(A and B) = P(rolled a 2 that is also even) = P({2}) = 1/6
P(B)       = P(even) = 3/6
P(A | B)   = (1/6) / (3/6) = (1/6) * (6/3) = 1/3
```

**Reading the result:** *unconditionally*, rolling a 2 has probability `1/6`. But *given* you already know the roll is even, it's one of only `{2,4,6}`, so the 2 now has probability `1/3`. Information sharpened the estimate.

**Why ML cares:** almost all of supervised learning is estimating `P(label | features)` — "given this email's words, what's the probability it's spam?" That single conditional probability *is* the classifier's output.

### A.3 Independence

Two events are **independent** if knowing one tells you *nothing* about the other. Formally:

```
A and B are independent   ⟺   P(A and B) = P(A) * P(B)
```

Equivalently, `P(A | B) = P(A)` — the condition doesn't move the probability.

**Worked example — two coin flips.** Let `A` = "first flip Heads", `B` = "second flip Heads". Each has probability `1/2`, and the flips don't influence each other:

```
P(A and B) = P(HH) = 1/4
P(A)*P(B)  = (1/2)*(1/2) = 1/4    ✓  equal → independent
```

**Contrast — the die roll above was NOT independent:** `P(A and B) = 1/6` but `P(A)*P(B) = (1/6)*(3/6) = 1/12`. Not equal, so "is a 2" and "is even" are dependent (of course — being a 2 forces being even).

**Why ML cares:** the **naive Bayes** classifier (Module 4) makes a bold simplifying assumption — that features are independent given the label — which turns a hard joint probability into an easy product `P(f1|label)*P(f2|label)*...`. It's "naive" precisely because features usually *aren't* independent, yet the model often works surprisingly well anyway.

### A.4 Bayes' theorem (worked medical-test example)

Bayes' theorem lets you *flip* a conditional probability — to go from `P(B|A)` to `P(A|B)`. It's the mathematical engine of updating beliefs with evidence.

```
P(A | B) = [ P(B | A) * P(A) ] / P(B)
```

The names of the pieces (learn these — they recur everywhere):
- `P(A)` = the **prior** — belief in A *before* seeing evidence.
- `P(B | A)` = the **likelihood** — how probable the evidence is *if* A is true.
- `P(A | B)` = the **posterior** — updated belief in A *after* seeing evidence.
- `P(B)` = the **evidence** — total probability of seeing B (a normalizer).

**Plain-English reading:** new belief = (how well A explains the evidence) times (how much you believed A beforehand), divided by (how likely the evidence was overall). Strong prior + evidence that fits → high posterior.

#### The worked example — why a "99% accurate" test can still usually be wrong

Setup, a classic that surprises everyone:

- A disease affects **1 in 1000** people: `P(disease) = 0.001`.
- The test is quite good: if you *have* the disease, it flags positive **99%** of the time: `P(positive | disease) = 0.99`.
- But it has a **5% false-positive rate**: if you're *healthy*, it still flags positive 5% of the time: `P(positive | healthy) = 0.05`.

**Question:** you test positive. What's the probability you actually have the disease, `P(disease | positive)`?

First, the **evidence** `P(positive)` — the total probability of a positive test, from both the sick and the healthy:

```
P(positive) = P(positive|disease)*P(disease) + P(positive|healthy)*P(healthy)
            = 0.99 * 0.001        +          0.05 * 0.999
            = 0.00099             +          0.04995
            = 0.05094
```

Now apply Bayes:

```
P(disease | positive) = [ P(positive|disease) * P(disease) ] / P(positive)
                      = [ 0.99 * 0.001 ] / 0.05094
                      = 0.00099 / 0.05094
                      ≈ 0.0194
```

**The result: about 1.9%.** Even after a positive result from a 99%-sensitive test, you *probably do not* have the disease.

**Why?** This is the lesson. The disease is *rare* (prior of 0.1%). Out of 1000 people, ~1 truly has it (and tests positive), but ~50 healthy people (5% of 999) *also* test positive. So among the ~51 positives, only 1 is real — roughly 1 in 51 ≈ 2%. The flood of false positives from the huge healthy population swamps the handful of true positives. **A rare condition makes even accurate tests produce mostly false alarms.** Ignoring the base rate (the prior) is one of the most common reasoning errors humans make.

**Why ML cares:** naive Bayes classifiers *are* Bayes' theorem applied to features. More broadly, this base-rate lesson is why **accuracy is a misleading metric on imbalanced data** (Module 4): a spam filter that flags 5% of good email looks great on accuracy but may be wrong most times it fires an alarm, exactly as here. Precision and recall exist to expose this.

### A.5 Random variables

A **random variable** is a variable whose value is a number determined by a random outcome. We map outcomes to numbers.

- Let `X` = the number rolled on a die. `X` can be 1–6.
- Let `Y` = 1 if a coin is Heads, 0 if Tails. (Numbers, so we can do math.)

Random variables come in two flavors:
- **Discrete** — countable values (die roll, number of Heads in 10 flips).
- **Continuous** — any value in a range (a person's exact height, a temperature).

**Why ML cares:** a feature is a random variable (heights vary randomly across people). A label is a random variable. The model's output is a random variable. Framing data this way lets us apply the tools below — expectation, variance, distributions.

### A.6 Expectation (the mean of a random variable)

The **expectation** (or expected value, or mean) `E[X]` is the long-run average value of a random variable — each possible value weighted by its probability:

```
E[X] = sum over all values x of ( x * P(X = x) )
```

**Plain-English reading:** multiply each outcome by how likely it is, and add them up. It's the "center of mass" of the distribution — where it balances.

**Worked example — expected value of a die roll:**

```
E[X] = 1*(1/6) + 2*(1/6) + 3*(1/6) + 4*(1/6) + 5*(1/6) + 6*(1/6)
     = (1+2+3+4+5+6) / 6
     = 21 / 6
     = 3.5
```

**Reading the result:** you can never *roll* a 3.5, but over thousands of rolls the *average* settles at 3.5. Expectation is about the long run, not any single trial.

**Why ML cares:** the loss we minimize is an *expected* loss — the average error over the data distribution. "Expected value" is the formal meaning of "on average, how wrong is the model?"

### A.7 Variance and standard deviation

Expectation tells you the center; **variance** tells you the *spread* — how far values typically stray from the mean.

```
Var(X) = E[ (X - E[X])^2 ]
```

**Plain-English reading:** take each value's distance from the mean, *square it* (so positive and negative deviations don't cancel, and big deviations count extra), and average those squared distances. Big variance = values scattered widely; small variance = values clustered tightly around the mean.

The **standard deviation** is just the square root of the variance:

```
std(X) = sqrt( Var(X) )     (often written sigma, σ)
```

We take the square root to get back to the *original units* (variance is in squared units, which is awkward — "squared dollars"; std is in plain dollars).

**Worked example — variance of a fair die.** Mean is 3.5 (from A.6). Compute each squared deviation:

```
value:      1      2      3      4      5      6
(x-3.5):  -2.5   -1.5   -0.5    0.5    1.5    2.5
(x-3.5)^2: 6.25   2.25   0.25   0.25   2.25   6.25

Var = (6.25+2.25+0.25+0.25+2.25+6.25) / 6 = 17.5 / 6 ≈ 2.92
std = sqrt(2.92) ≈ 1.71
```

**Reading the result:** die rolls typically land about 1.7 away from the average of 3.5 — a sensible spread for values from 1 to 6.

**Why ML cares:** variance is central to the **bias-variance tradeoff** (Module 4) — a model with high variance overreacts to its particular training data. Standard deviation is how we *scale features* (Module 3): subtract the mean, divide by std, so all features have comparable spread and gradient descent converges faster. And variance is baked into the Gaussian distribution below.

### A.8 Common distributions

A **distribution** describes how probability is spread over the values a random variable can take. Three show up constantly.

#### Bernoulli — a single yes/no trial

The **Bernoulli distribution** models one trial with two outcomes: success (1) with probability `p`, failure (0) with probability `1-p`.

```
P(X = 1) = p
P(X = 0) = 1 - p
E[X] = p            Var(X) = p*(1-p)
```

**Example:** one coin flip with `p = 0.5` (fair). One click-or-not on an ad with `p = 0.02`. The expectation `E[X] = p` reads simply: "the average of a bunch of 0/1 outcomes is the fraction that were 1s."

**Why ML cares:** binary classification (spam/not-spam) *is* a Bernoulli outcome, and logistic regression (Module 4) directly models its probability `p`.

#### Binomial — counting successes over many trials

The **Binomial distribution** models the number of successes in `n` independent Bernoulli trials, each with probability `p`.

```
P(X = k) = C(n, k) * p^k * (1-p)^(n-k)
```

where `C(n, k) = n! / (k! * (n-k)!)` is "n choose k" — the number of ways to pick which `k` of the `n` trials succeeded.

**Plain-English reading:** the chance of exactly `k` successes = (number of arrangements of `k` successes among `n` trials) times (probability of `k` successes) times (probability of `n-k` failures).

**Worked example — exactly 2 Heads in 3 fair coin flips (`n=3, k=2, p=0.5`):**

```
C(3,2) = 3! / (2! * 1!) = 6 / 2 = 3          (the arrangements: HHT, HTH, THH)
P(X=2) = 3 * (0.5)^2 * (0.5)^1 = 3 * 0.125 = 0.375
```

So there's a 37.5% chance of getting exactly 2 Heads in 3 flips. `E[X] = n*p = 3*0.5 = 1.5` — on average 1.5 Heads, as expected.

**Why ML cares:** it underlies reasoning about counts and proportions, and it's the natural model when you repeat a Bernoulli experiment (e.g., how many of `n` test emails were correctly flagged).

#### Gaussian / Normal — the bell curve

The **Gaussian** (or Normal) distribution is the famous bell curve, described by two numbers: its mean `mu` (center) and standard deviation `sigma` (spread). Its density is:

```
f(x) = (1 / (sigma * sqrt(2*pi))) * e^( -(x - mu)^2 / (2*sigma^2) )
```

Don't be intimidated by the formula — you rarely evaluate it by hand. What matters is its **shape and behavior**:

- Symmetric bell, peaked at the mean `mu`.
- `sigma` controls the width: small sigma = tall narrow spike; large sigma = short wide hump.
- The `-(x-mu)^2` in the exponent is the key: probability drops off with the *squared distance* from the mean, and fast (exponentially).

**The 68–95–99.7 rule** (memorize this — it's the most practically useful fact about the Normal):

```
About 68% of values fall within  1 standard deviation of the mean   (mu ± 1σ)
About 95% of values fall within  2 standard deviations of the mean  (mu ± 2σ)
About 99.7% of values fall within 3 standard deviations of the mean (mu ± 3σ)
```

**Worked example — adult heights, `mu = 170 cm`, `sigma = 10 cm`:**

```
~68% of people are between 160 and 180 cm   (170 ± 10)
~95% are between 150 and 190 cm             (170 ± 20)
~99.7% are between 140 and 200 cm           (170 ± 30)
```

So someone 200 cm tall is at the 3-sigma edge — genuinely rare (about 0.15% of people are taller). This rule turns a std into instant intuition about how unusual a value is.

**Why the Normal is everywhere:** the **Central Limit Theorem** (Part B) says that sums and averages of many independent random effects tend toward a Gaussian — and most real measurements (height, measurement noise, exam scores) are sums of many small factors. So the bell curve appears constantly in nature and in the errors our models make.

**Why ML cares:** we routinely *assume* noise/errors are Gaussian, which — via MLE (below) — is what makes *squared error* the natural loss. Weight initialization in neural nets samples from Gaussians. And "how many standard deviations away is this?" is the core idea behind detecting outliers and standardizing features.

---

## Part B — Statistics

Probability went from a known model to expected data. **Statistics goes backward:** from observed data to the model that likely produced it. This reverse direction is the essence of learning, so pay close attention.

### B.1 Population vs sample

- The **population** is *every* item you care about — all emails ever, all possible customers. Usually impossible to observe fully.
- A **sample** is the subset you actually collect and measure — the 10,000 emails in your dataset.

We compute statistics on the *sample* and use them to *estimate* properties of the *population*.

**Plain-English reading:** you can't weigh every fish in the ocean (population), so you weigh a netful (sample) and infer the rest. The whole game is: how well does the sample represent the population?

**Why ML cares — this is the deepest idea in the module.** Your training data is a *sample*; the real world is the *population*. A model that memorizes the sample but fails on new data has learned the sample's quirks, not the population's truth. That gap is **overfitting** (Module 4), and everything about train/validation/test splits exists to estimate how the model will do on the unseen population.

### B.2 Mean, median, mode

Three ways to describe the "center" of data.

- **Mean** — the arithmetic average: `mean = (sum of all values) / (count)`.
- **Median** — the middle value when sorted (half the data is below it).
- **Mode** — the most frequently occurring value.

**Worked example — the dataset `[1, 2, 2, 3, 100]`:**

```
Mean   = (1 + 2 + 2 + 3 + 100) / 5 = 108 / 5 = 21.6
Median = sorted middle value = 2      (the 3rd of 5 values)
Mode   = 2                            (appears twice, most often)
```

**Reading the result — a lesson in robustness:** the mean is 21.6, but four of the five values are 3 or less! The single outlier `100` dragged the mean way up. The **median (2) is unmoved by the outlier** — it only cares about rank, not magnitude. This is why median income is reported instead of mean income: a few billionaires would skew the mean. The mean is *sensitive to outliers*; the median is *robust*.

**Why ML cares:** this robustness distinction reappears as **MAE vs MSE** loss (Module 3) — MAE (absolute error) is to the median as MSE (squared error) is to the mean, so MAE is more robust to outlier data points. Choosing a loss is partly choosing how much you let outliers dominate.

### B.3 Sample variance, std, and covariance

Sample variance and std mirror A.7, but with one subtlety — we divide by `n-1` instead of `n`:

```
sample variance = sum( (x_i - mean)^2 ) / (n - 1)
sample std      = sqrt(sample variance)
```

**Why `n-1` (Bessel's correction), briefly:** we're using the *sample's own mean* to measure spread, which slightly *underestimates* the true spread (the sample mean sits right in the middle of the sample by construction). Dividing by the smaller `n-1` corrects for this bias. For large `n` it barely matters; for small `n` it does.

**Covariance** measures how *two* variables move *together*:

```
Cov(X, Y) = sum( (x_i - mean_x) * (y_i - mean_y) ) / (n - 1)
```

**Plain-English reading:** for each data point, multiply "how far X is above its mean" by "how far Y is above its mean." If X and Y tend to be high together and low together, these products are mostly positive → positive covariance. If one is high when the other is low, products are negative → negative covariance. If unrelated, they cancel → near zero.

**Worked example — do taller people weigh more?**

```
Person:  A      B      C
Height:  160    170    180     mean_h = 170
Weight:  60     70     80      mean_w = 70

deviations (h): -10,   0,  +10
deviations (w): -10,   0,  +10
products:       100,   0,  100
Cov = (100 + 0 + 100) / (3 - 1) = 200 / 2 = 100
```

Positive covariance → taller people tend to weigh more in this data. 

### B.4 Correlation

Covariance has an annoying flaw: its size depends on the *units*. Covariance of height-in-cm with weight is different from height-in-meters with weight, even though the relationship is identical. **Correlation** fixes this by dividing out the standard deviations, producing a unit-free number always between −1 and +1:

```
corr(X, Y) = Cov(X, Y) / ( std(X) * std(Y) )
```

**Plain-English reading:** correlation is covariance rescaled to a universal −1-to-+1 scale.

| Correlation | Meaning |
|---|---|
| `+1` | perfect positive linear relationship (one goes up, other goes up, exactly) |
| `0` | no *linear* relationship |
| `−1` | perfect negative linear relationship |

**Two crucial cautions:**
1. **Correlation only measures *linear* relationships.** Two variables can be strongly related in a curved way (e.g., `y = x^2`) yet have correlation near 0. Zero correlation ≠ no relationship.
2. **Correlation is not causation.** Ice cream sales correlate with drownings — because both rise in summer, not because ice cream causes drowning. A hidden common cause (hot weather) drives both.

**Why ML cares:** highly correlated features are partly redundant (recall linear dependence from Module 1) and can destabilize linear models. Correlation with the target hints at which features are useful. And the correlation-vs-causation trap is *the* pitfall in interpreting what a model "learned."

### B.5 Sampling and estimators

An **estimator** is a rule (a formula) for guessing an unknown population quantity from sample data. The sample mean is an estimator of the population mean; the sample variance is an estimator of the population variance.

Two properties we want in an estimator:
- **Unbiased** — on average across many samples, it hits the true value (doesn't systematically over- or under-shoot). This is *why* we used `n-1` above — to make the variance estimator unbiased.
- **Low variance** — it doesn't swing wildly from sample to sample.

**Plain-English reading:** a good estimator is like a good archer — accurate (centered on the bullseye = unbiased) and consistent (tight grouping = low variance). You want both.

**Why ML cares:** *a trained model is an estimator* — it estimates the true input→output relationship from a sample of data. The bias-variance tradeoff (Module 4) is literally about these two properties of your model-as-estimator. The vocabulary you're learning here is the vocabulary of that central ML concept.

### B.6 Maximum Likelihood Estimation (worked coin example)

**Maximum Likelihood Estimation (MLE)** is the master principle behind most of ML's loss functions. The idea in one sentence:

> **Choose the model parameters that make the observed data most probable.**

If your data actually happened, then good parameters are ones under which that data was *likely* to happen. So we write down the probability of the data as a function of the parameters — the **likelihood** — and pick the parameters that maximize it.

#### The worked coin example

You flip a coin 10 times and observe **7 Heads, 3 Tails**. The coin's bias `p = P(Heads)` is unknown. What's the most likely value of `p`?

Each flip is Bernoulli with probability `p` of Heads. Assuming flips are independent, the probability of *this exact data* (7 H, 3 T) — the likelihood — is:

```
L(p) = p^7 * (1 - p)^3
```

**Plain-English reading:** seven independent Heads contribute `p` seven times; three Tails contribute `(1-p)` three times; independence means we multiply. `L(p)` answers: "if the true bias were `p`, how probable was seeing 7 Heads and 3 Tails?" We want the `p` that makes this biggest.

**A standard trick — maximize the log instead.** Products are painful to differentiate; logs turn products into sums, and since `log` is increasing, whatever maximizes `L` also maximizes `log L`. The **log-likelihood**:

```
log L(p) = 7 * log(p) + 3 * log(1 - p)
```

Now take the derivative with respect to `p`, set it to 0 (the top of the hill has zero slope — Module 1, B.4), and solve. Using `d/dp log(p) = 1/p` and the chain rule on `log(1-p)`:

```
d/dp [log L] = 7/p  -  3/(1 - p)  = 0
```

Solve:

```
7/p = 3/(1 - p)
7 * (1 - p) = 3 * p
7 - 7p = 3p
7 = 10p
p = 7/10 = 0.7
```

**The MLE is `p = 0.7`.** The most likely bias is exactly the observed fraction of Heads — 7 out of 10. This matches pure intuition, and that's the point: **MLE formalizes and justifies the intuitive estimate.** For a coin, "just use the observed frequency" turns out to be the principled, provably-optimal answer.

**Why ML cares — MLE is where loss functions come from.** This isn't a one-off trick; it's the origin story for the losses in Module 3:
- Assume regression errors are **Gaussian**, do MLE → you *derive* **mean squared error** as the thing to minimize.
- Assume classification labels are **Bernoulli**, do MLE → you *derive* **cross-entropy / log-loss**.

So when Module 3 hands you MSE and cross-entropy as "the losses to use," remember they aren't arbitrary. They are the maximum-likelihood answer under natural assumptions about the noise. *Minimizing loss = maximizing the likelihood of your data.* That's the deepest sentence in this module.

### B.7 The Law of Large Numbers

The **Law of Large Numbers (LLN)** says: as you collect more samples, the sample average converges to the true population mean.

**Plain-English reading:** small samples are noisy and can mislead; big samples tell the truth. Flip a fair coin 10 times and you might see 7 Heads (70%). Flip it 10,000 times and you'll see very close to 50%. The randomness averages out as `n` grows.

**Worked intuition:**

```
10 flips:      might get 7 Heads  →  70% (far from truth)
100 flips:     maybe 54 Heads     →  54% (closer)
10,000 flips:  maybe 5,013 Heads  →  50.13% (very close)
```

**Why ML cares:** more data → better estimates → better models. The LLN is *why* data matters so much in ML: it guarantees that with enough representative samples, your estimated patterns approach the real ones. It also underpins why we can trust a large-enough test set to estimate true performance.

### B.8 The Central Limit Theorem (intuition)

The **Central Limit Theorem (CLT)** is one of the most remarkable results in all of mathematics:

> **If you take the average (or sum) of many independent random variables, that average is approximately Gaussian — no matter what distribution the individual variables came from.**

**Plain-English reading:** the individual things can be weird — uniform, skewed, lumpy, whatever. But *averages of many of them* form a bell curve. The Normal distribution emerges from aggregation, universally.

**Worked intuition — rolling dice:** a single die is *uniform* (each face 1–6 equally likely) — its distribution is flat, not a bell. But roll *ten* dice and record the average:
- Averages near 3.5 are common (many combinations produce a middling total).
- Averages near 1 or 6 are rare (you'd need almost all dice to agree).
- Plot the averages over many trials and a **bell curve** appears — from flat, uniform ingredients.

**Why the CLT matters so much:**
1. It **explains why the Gaussian is everywhere** (A.8). Real measurements — height, test scores, measurement noise — are sums of many small independent influences, so they end up bell-shaped. That's not a coincidence; it's the CLT.
2. It's the foundation of statistical inference: confidence intervals, error bars, and "how sure are we about this estimate?" all lean on the CLT making sample means approximately Normal.

**Why ML cares:** it justifies the constant Gaussian assumptions in ML (noise models, initialization). It's why averaging predictions (ensembles) reduces variance. And it's the theoretical backbone of quantifying uncertainty in estimates and metrics.

---

## Module 2 summary

- **Probability** goes model→data; **statistics** goes data→model. Learning is the data→model direction.
- **Conditional probability** `P(A|B)` = probability of A in the shrunken world where B is true; supervised learning estimates `P(label | features)`.
- **Bayes' theorem** flips conditionals (posterior ∝ likelihood × prior). The medical-test example shows a rare condition makes even accurate tests mostly fire false positives — the base-rate lesson behind why accuracy misleads on imbalanced data.
- **Expectation** = probability-weighted average (the center); **variance/std** = the spread.
- Key **distributions**: Bernoulli (one yes/no), Binomial (counting successes), Gaussian (the bell curve + 68-95-99.7 rule).
- **Mean vs median** teaches robustness to outliers (→ MSE vs MAE later). **Covariance/correlation** measure how variables move together (correlation is unit-free, in [−1,1]; not causation).
- An **estimator** guesses population values from samples; a trained model *is* an estimator, judged by bias and variance.
- **MLE** = pick parameters that make the observed data most probable; it *derives* MSE (Gaussian noise) and cross-entropy (Bernoulli labels). Minimizing loss = maximizing likelihood.
- **LLN**: more data → estimates converge to truth. **CLT**: averages of many independent variables are Gaussian, explaining the bell curve's ubiquity.

Next: [`03-optimization.md`](./03-optimization.md) — turning "which way is downhill" into an algorithm that actually trains models.

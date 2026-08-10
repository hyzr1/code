import type { LectureQuestion } from "../../types";
import { guidedLessonContent, guidedMasteryAtom, guidedMasteryConcept, type GuidedMasterySpec } from "./guidedMastery";
import { ML_PROBABILITY_BASIC_SPECS } from "./mlProbabilityBasicsLectures";

const q = (question: string, choices: [string, string, string], answer: 0 | 1 | 2, explanation: string, why: [string, string, string]): LectureQuestion => ({ question, choices, answer, explanation, why });

const ADVANCED_SPECS: GuidedMasterySpec[] = [
  {
    lessonId: "py.mc.m1_3.l6", atomId: "py.atom.ml.key-distributions", conceptId: "py.ml.key-distributions",
    title: "Choose a distribution that matches the process", requires: ["py.ml.expectation-variance-covariance"],
    vocabulary: [["Bernoulli", "one yes-or-no trial"], ["Binomial", "the success count across a fixed number of independent Bernoulli trials"], ["Categorical", "one choice among several labels"], ["Poisson", "an event count in a fixed interval under a constant average rate"]],
    opening: "A distribution is a model of how values are generated. Choose it from the process and support, not from a familiar name. Binary outcomes, repeated successes, labels, and interval counts need different stories.",
    outcome: "You will distinguish Bernoulli, Binomial, Categorical, and Poisson variables and check whether their assumptions match a practical question.",
    why: "Loss functions and output layers encode distribution assumptions. A binary classifier models Bernoulli outcomes. Count models and multiclass classifiers require different support and likelihoods.",
    mentalModel: "Picture four machines. One flips once. One flips n times and counts wins. One draws one colored card. One counts arrivals during a clock interval.",
    firstTitle: "Simulate the four processes", firstIntro: "The code makes each distribution's output type visible before introducing formulas.",
    firstCode: `import random

rng = random.Random(7)
bernoulli = int(rng.random() < 0.7)
binomial = sum(rng.random() < 0.7 for _ in range(10))
categories = ["cat", "dog", "bird"]
categorical = rng.choices(categories, weights=[0.5, 0.3, 0.2], k=1)[0]
print(bernoulli, binomial, categorical)`,
    firstTrace: "Bernoulli returns zero or one. Binomial returns an integer from zero through ten. Categorical returns one named label. Each sample's possible values, called its support, match its generating story.",
    secondTitle: "Simulate a Poisson count", secondIntro: "One simple Poisson sampler multiplies uniform random values until their product crosses `exp(-rate)`.",
    secondCode: `from math import exp

def poisson_sample(rate, rng):
    threshold = exp(-rate)
    product = 1.0
    count = 0
    while product > threshold:
        count += 1
        product *= rng.random()
    return count - 1

samples = [poisson_sample(3.0, rng) for _ in range(8)]
print(samples)`,
    secondTrace: "Each output is a nonnegative count. Across many samples, the average approaches the rate three. Poisson assumes independent arrivals and a stable rate within the interval, so bursts or capacity limits may violate it.",
    mistake: "Do not use Binomial just because data contains counts. Binomial needs a fixed number of trials and bounded count. Poisson counts arrivals and has no fixed maximum.",
    checkpoint: "Which distribution fits the number of defective parts among exactly fifty independently tested parts with the same defect chance?",
    checkpointAnswer: "Binomial fits because there are fifty fixed Bernoulli trials, each with the same success probability, and the variable counts successes from zero through fifty.",
    remember: "Match support and generation: Bernoulli for one binary result, Binomial for fixed-trial successes, Categorical for one label, and Poisson for interval arrivals.",
    checks: [q("Which distribution models one multiclass label?", ["Categorical", "Bernoulli", "Poisson"], 0, "Categorical chooses one of several named outcomes.", ["Correct. Probabilities across labels total one.", "Bernoulli has only two outcomes.", "Poisson produces counts."]), q("What does Binomial require?", ["A fixed number of similar independent trials", "An unlimited arrival interval", "A continuous measurement"], 0, "It counts successes among n trials.", ["Correct. Its support ends at n.", "That describes Poisson more closely.", "Binomial is discrete."])],
  },
  {
    lessonId: "py.mc.m1_3.l7", atomId: "py.atom.ml.gaussian-guided", conceptId: "py.ml.gaussian-guided",
    title: "The Gaussian models bell-shaped variation", requires: ["py.ml.key-distributions"],
    vocabulary: [["Gaussian", "a continuous bell-shaped distribution also called Normal"], ["mean", "the center of the bell"], ["standard deviation", "the distance scale controlling spread"], ["z-score", "the number of standard deviations a value lies from the mean"]],
    opening: "A Gaussian describes values formed by many small additive influences. Its mean moves the bell. Its standard deviation widens or narrows the bell.",
    outcome: "You will standardize values, interpret common probability regions, and recognize when skew, bounds, or multiple peaks make a Gaussian poor.",
    why: "Gaussian noise, initialization, residual assumptions, confidence approximations, and latent models appear throughout ML. Its clean mathematics is useful, but its fit must be checked.",
    mentalModel: "Picture a bell centered on the mean. Standard deviation marks the ruler. About 68 percent lies within one mark and about 95 percent within two marks.",
    firstTitle: "Convert values to z-scores", firstIntro: "Subtract the mean, then divide by standard deviation. The result is unitless distance from center.",
    firstCode: `def z_score(value, mean, standard_deviation):
    return (value - mean) / standard_deviation

scores = [70, 85, 100]
for score in scores:
    print(score, z_score(score, mean=85, standard_deviation=10))`,
    firstTrace: "Seventy is 1.5 standard deviations under the mean. Eighty-five is at the mean. One hundred is 1.5 standard deviations over it. Standardization puts differently scaled Gaussian features on a shared ruler.",
    secondTitle: "Evaluate bell density", secondIntro: "Density is highest at the mean and falls symmetrically. Probability still comes from area over an interval.",
    secondCode: `from math import exp, pi, sqrt

def gaussian_density(value, mean=0.0, standard_deviation=1.0):
    z = (value - mean) / standard_deviation
    scale = standard_deviation * sqrt(2 * pi)
    return exp(-0.5 * z * z) / scale

for value in [-2, -1, 0, 1, 2]:
    print(value, round(gaussian_density(value), 4))`,
    secondTrace: "Zero has the highest density. Equal distances on opposite sides have equal density. The exact density value is not a point probability; interval area is required.",
    mistake: "Do not call every continuous feature Gaussian. Income may be skewed, response time may have a long tail, and mixed populations may have several peaks. Inspect data and residuals.",
    checkpoint: "A value has z-score negative two. What does that say, and what does it not say?",
    checkpointAnswer: "It lies two standard deviations under the mean. It does not directly give a probability and does not prove the data is Gaussian; probability interpretation needs a distribution assumption.",
    remember: "Mean sets Gaussian center, standard deviation sets scale, and z-score expresses relative distance. Validate the bell-shaped assumption before trusting it.",
    checks: [q("What changes when Gaussian standard deviation increases?", ["The bell becomes wider", "The mean must increase", "The variable becomes discrete"], 0, "More spread places density across a wider range.", ["Correct. The peak also becomes lower to keep area one.", "Center and spread are separate.", "Gaussian remains continuous."]), q("What is a z-score?", ["Distance from mean in standard deviations", "An exact point probability", "The sample size"], 0, "It standardizes location.", ["Correct. It is unitless.", "A continuous point has probability zero.", "Sample size is separate."])],
  },
  {
    lessonId: "py.mc.m1_3.l8", atomId: "py.atom.ml.joint-marginal-conditional", conceptId: "py.ml.joint-marginal-conditional",
    title: "Joint tables contain marginal and conditional views", requires: ["py.ml.gaussian-guided"],
    vocabulary: [["joint distribution", "probability for combinations of two or more variables"], ["marginal distribution", "probability for one variable after summing out others"], ["conditional distribution", "a normalized slice after fixing another variable"], ["normalize", "rescale nonnegative weights so they total one"]],
    opening: "A joint distribution is the full table of co-occurrence. Marginalizing sums away a variable. Conditioning selects one slice and renormalizes it.",
    outcome: "You will move from a joint table to marginals and conditionals, check totals, and explain what information each view discards.",
    why: "Prediction asks for labels conditional on features. Missing variables are marginalized. Generative models define joints from which many questions can be answered.",
    mentalModel: "Picture a spreadsheet of probability cells. Row sums form one margin. Column sums form the other. Conditioning highlights one row and stretches its cells to total one.",
    firstTitle: "Sum a joint table into marginals", firstIntro: "Rows represent weather and columns represent commute outcome. All cells together must total one.",
    firstCode: `joint = {
    ("sun", "on_time"): 0.50,
    ("sun", "late"): 0.10,
    ("rain", "on_time"): 0.20,
    ("rain", "late"): 0.20,
}

p_weather = {}
p_commute = {}
for (weather, commute), probability in joint.items():
    p_weather[weather] = p_weather.get(weather, 0) + probability
    p_commute[commute] = p_commute.get(commute, 0) + probability
print(p_weather, p_commute)`,
    firstTrace: "Sun totals 0.6 and rain totals 0.4. On-time totals 0.7 and late totals 0.3. Each marginal totals one but forgets how the two variables pair.",
    secondTitle: "Normalize one conditional slice", secondIntro: "For commute given rain, keep only rain cells and divide by total rain probability.",
    secondCode: `rain_total = p_weather["rain"]
commute_given_rain = {
    commute: probability / rain_total
    for (weather, commute), probability in joint.items()
    if weather == "rain"
}
print(commute_given_rain, sum(commute_given_rain.values()))`,
    secondTrace: "On-time given rain is 0.2 divided by 0.4, or one half. Late given rain is also one half. The conditional slice now totals one within rainy cases.",
    mistake: "Do not call a raw joint row a conditional distribution until it is divided by the row total. Its unnormalized cells sum to the condition's marginal probability, not one.",
    checkpoint: "How do you obtain P(X) from a joint P(X,Y)? How do you obtain P(X given Y=y)?",
    checkpointAnswer: "Sum the joint over every Y value to get P(X). For the conditional, select cells with Y=y and divide each by P(Y=y).",
    remember: "Joint is the full relationship, marginal sums variables away, and conditional selects and normalizes one slice.",
    checks: [q("How is a marginal computed from a joint table?", ["Sum over the unwanted variable", "Choose the largest cell", "Divide every cell by itself"], 0, "All hidden-variable possibilities contribute.", ["Correct. Their probability weights add.", "A maximum discards probability.", "That would not preserve the distribution."]), q("Why normalize a conditional slice?", ["Its probabilities must total one within the condition", "To make every value equal", "To remove all dependence"], 0, "The condition becomes the new sample space.", ["Correct. Divide by the condition's marginal.", "Relative weights remain different.", "Conditionals often reveal dependence."])],
  },
  {
    lessonId: "py.mc.m1_3.l9", atomId: "py.atom.ml.multivariate-gaussian", conceptId: "py.ml.multivariate-gaussian",
    title: "Covariance shapes a multivariate Gaussian", requires: ["py.ml.joint-marginal-conditional", "py.ml.orthogonality-least-squares"],
    vocabulary: [["multivariate Gaussian", "a joint Gaussian distribution over a vector"], ["mean vector", "the center coordinate for every variable"], ["covariance matrix", "variances on the diagonal and pairwise covariances elsewhere"], ["correlation", "scale-normalized covariance between minus one and one"]],
    opening: "A one-dimensional Gaussian is a bell. With two variables, equal-density curves become ellipses. The covariance matrix controls their widths and tilt.",
    outcome: "You will read a covariance matrix, connect correlation sign to ellipse direction, and check the symmetry and nonnegative-variance requirements.",
    why: "Multivariate Gaussians support anomaly detection, Kalman filters, Gaussian mixtures, Bayesian models, and correlated noise. Their geometry links probability to linear algebra.",
    mentalModel: "Picture a cloud of points. Diagonal covariance controls horizontal and vertical spread. Positive off-diagonal covariance tilts the cloud upward; negative covariance tilts it downward.",
    firstTitle: "Compute a two-feature covariance matrix", firstIntro: "Center each feature, then average every pair of centered products.",
    firstCode: `points = [(1.0, 2.0), (2.0, 3.0), (3.0, 5.0)]
mean_x = sum(x for x, _ in points) / len(points)
mean_y = sum(y for _, y in points) / len(points)

var_x = sum((x - mean_x) ** 2 for x, _ in points) / len(points)
var_y = sum((y - mean_y) ** 2 for _, y in points) / len(points)
cov_xy = sum((x - mean_x) * (y - mean_y) for x, y in points) / len(points)
matrix = [[var_x, cov_xy], [cov_xy, var_y]]
print([[round(value, 3) for value in row] for row in matrix])`,
    firstTrace: "The diagonal stores each feature's variance. Both off-diagonal cells store the same positive covariance, so the matrix is symmetric and the point cloud tilts upward.",
    secondTitle: "Turn covariance into correlation", secondIntro: "Divide covariance by the product of standard deviations so units cancel.",
    secondCode: `from math import sqrt

correlation = cov_xy / sqrt(var_x * var_y)
print(round(correlation, 4))

def quadratic_variance(matrix, direction):
    x, y = direction
    return x * x * matrix[0][0] + 2 * x * y * matrix[0][1] + y * y * matrix[1][1]

print(quadratic_variance(matrix, [1.0, -1.0]))`,
    secondTrace: "Correlation is close to positive one, showing strong linear co-movement. Variance along any direction must be nonnegative. That condition makes a valid covariance matrix positive semidefinite.",
    mistake: "Do not place arbitrary numbers into a covariance matrix. It must be symmetric and cannot imply negative variance in any direction. Also, correlation does not prove causation.",
    checkpoint: "What do diagonal and off-diagonal covariance entries mean?",
    checkpointAnswer: "Diagonal entries are individual variances and must be nonnegative. Off-diagonal entries describe pairwise linear movement and appear symmetrically across the diagonal.",
    remember: "A mean vector locates the cloud. A valid covariance matrix sets spread and tilt while keeping every directional variance nonnegative.",
    checks: [q("What sits on a covariance matrix diagonal?", ["Variances", "Probabilities totaling one", "Feature names"], 0, "Each variable covaries with itself.", ["Correct. Covariance of X with X is variance.", "A covariance matrix is not a probability table.", "Names label axes but are not entries."]), q("What does positive covariance do to a two-feature cloud?", ["Tilts it toward joint increase", "Makes both variances negative", "Proves one feature causes the other"], 0, "High values tend to pair with high values.", ["Correct. The ellipse leans upward.", "Valid variances remain nonnegative.", "Association alone is not causation."])],
  },
  {
    lessonId: "py.mc.m1_3.l10", atomId: "py.atom.ml.monte-carlo-guided", conceptId: "py.ml.monte-carlo-guided",
    title: "Monte Carlo estimates with random samples", requires: ["py.ml.multivariate-gaussian"],
    vocabulary: [["Monte Carlo", "approximating a quantity with repeated random samples"], ["estimator", "a rule turning sampled data into an estimate"], ["standard error", "estimated standard deviation of an estimator across repeated samples"], ["random seed", "a starting state that makes pseudorandom results reproducible"]],
    opening: "When exact integration is hard, sample from the distribution and average the quantity of interest. More independent samples usually reduce noise at a square-root rate.",
    outcome: "You will estimate an expectation, report uncertainty, use a local random generator, and explain why four times as many samples roughly halves standard error.",
    why: "Monte Carlo powers simulation, Bayesian inference, reinforcement learning, uncertainty analysis, and evaluation. A number without its sampling error can be misleading.",
    mentalModel: "Picture throwing darts at a board. The covered fraction estimates area. More darts stabilize the fraction, but random scatter shrinks slowly rather than disappearing immediately.",
    firstTitle: "Estimate pi with reproducible darts", firstIntro: "Uniform points in a square land inside its quarter-circle with probability pi divided by four.",
    firstCode: `import random

def estimate_pi(samples, seed):
    rng = random.Random(seed)
    inside = 0
    for _ in range(samples):
        x, y = rng.random(), rng.random()
        inside += x * x + y * y <= 1
    proportion = inside / samples
    estimate = 4 * proportion
    standard_error = 4 * (proportion * (1 - proportion) / samples) ** 0.5
    return estimate, standard_error

print(tuple(round(value, 4) for value in estimate_pi(20_000, 7)))`,
    firstTrace: "The estimate is near pi. Standard error describes typical estimator fluctuation under repeated dart sets. The fixed local seed reproduces this run without changing unrelated global randomness.",
    secondTitle: "See the square-root convergence rate", secondIntro: "Compare standard errors as sample count grows by factors of four.",
    secondCode: `for sample_count in [1_000, 4_000, 16_000]:
    estimate, error = estimate_pi(sample_count, seed=11)
    print(sample_count, round(estimate, 4), round(error, 4))`,
    secondTrace: "Each fourfold sample increase makes standard error about half as large. Ten times more precision in standard error needs about one hundred times more independent samples.",
    mistake: "Do not report a seeded estimate as if the seed removes uncertainty. It only reproduces the same pseudorandom sample. Also check dependence; correlated samples contain less information than equal-count independent samples.",
    checkpoint: "Why does reducing Monte Carlo standard error by half require about four times as many independent samples?",
    checkpointAnswer: "Standard error scales like one divided by the square root of n. Replacing n with four n doubles the denominator and halves the error.",
    remember: "Average reproducible random samples, report standard error, and remember that Monte Carlo precision improves only with the square root of independent sample count.",
    checks: [q("What does a random seed provide?", ["Reproducibility", "Zero sampling error", "True physical randomness"], 0, "The same pseudorandom sequence can be regenerated.", ["Correct. It aids debugging and comparison.", "Uncertainty remains.", "Pseudorandom output is deterministic from the seed."]), q("How does independent-sample standard error scale?", ["About 1 divided by square root of n", "Exactly 1 divided by n squared", "It always stays constant"], 0, "Averages converge at the square-root rate.", ["Correct. Four times n roughly halves error.", "That is far too fast.", "More samples usually help."])],
  },
  {
    lessonId: "py.mc.m1_3.l11", atomId: "py.atom.ml.mle-map", conceptId: "py.ml.mle-map",
    title: "Maximum likelihood and MAP fit different objectives", requires: ["py.ml.monte-carlo-guided", "py.ml.exponents-logs-sums"],
    vocabulary: [["likelihood", "probability of observed data viewed as a function of model parameters"], ["maximum likelihood", "choosing parameters that make observed data most probable"], ["MAP", "maximum a posteriori estimation using likelihood times a parameter prior"], ["log-likelihood", "logarithm of likelihood, turning products into stable sums"]],
    opening: "A probability model predicts data from parameters. Fitting reverses the question: which parameter makes the observed data most plausible? MLE uses evidence alone; MAP also expresses prior preference.",
    outcome: "You will fit a Bernoulli parameter, compare MLE with MAP, and explain why training code usually maximizes log-likelihood instead of a probability product.",
    why: "Many familiar losses are negative log-likelihoods. MAP connects priors to regularization and makes the assumptions behind parameter fitting explicit.",
    mentalModel: "Imagine parameter values competing to explain the same evidence. Likelihood scores their fit. A prior gives some competitors a head start. The posterior combines both scores.",
    firstTitle: "Find a Bernoulli MLE", firstIntro: "For independent binary observations, the likelihood is a product of p for successes and one minus p for failures.",
    firstCode: `from math import log

observations = [1, 1, 0, 1, 0]

def bernoulli_log_likelihood(probability):
    return sum(
        value * log(probability) + (1 - value) * log(1 - probability)
        for value in observations
    )

candidates = [value / 100 for value in range(1, 100)]
mle = max(candidates, key=bernoulli_log_likelihood)
print(mle, sum(observations) / len(observations))`,
    firstTrace: "Three of five observations are successes. The best candidate is 0.6, matching the sample success fraction. Logarithms preserve the maximizing parameter while replacing a fragile product with a sum.",
    secondTitle: "Add a prior for MAP", secondIntro: "A Beta prior contributes extra log terms. This example prefers probabilities away from zero and one.",
    secondCode: `def log_posterior(probability, alpha=3, beta=3):
    log_prior = (alpha - 1) * log(probability) + (beta - 1) * log(1 - probability)
    return bernoulli_log_likelihood(probability) + log_prior

map_estimate = max(candidates, key=log_posterior)
print(mle, map_estimate)`,
    secondTrace: "The symmetric prior pulls the estimate from 0.6 toward 0.5. With much more data, likelihood usually dominates a fixed prior. MAP returns one best parameter rather than the full posterior distribution.",
    mistake: "Do not call likelihood the probability that a parameter is true. It scores observed data under each fixed parameter. A parameter probability requires a prior and posterior model.",
    checkpoint: "What separates MLE from MAP, and why can their estimates differ most on small datasets?",
    checkpointAnswer: "MLE maximizes data likelihood. MAP maximizes likelihood times prior. With little evidence, the prior contributes a larger share of the objective and can move the optimum more strongly.",
    remember: "MLE chooses the parameter best explaining data. MAP adds prior preference. Log space keeps both objectives stable and turns products into sums.",
    checks: [q("Why use log-likelihood?", ["It turns products into stable sums", "It changes which parameter wins", "It removes all assumptions"], 0, "Log is monotone and avoids tiny products.", ["Correct. The maximizing parameter is preserved.", "A monotone log preserves ordering.", "Model assumptions remain."]), q("What does MAP add to likelihood?", ["A parameter prior", "A second dataset automatically", "Zero variance"], 0, "Posterior is proportional to likelihood times prior.", ["Correct. It expresses preference before data.", "No extra data appears automatically.", "Uncertainty is not eliminated."])],
  },
];

const ALL_SPECS = [...ML_PROBABILITY_BASIC_SPECS, ...ADVANCED_SPECS];
export const ML_PROBABILITY_ATOMS = ALL_SPECS.map(guidedMasteryAtom);
export const ML_PROBABILITY_CONCEPTS = ALL_SPECS.map(guidedMasteryConcept);
export const ML_PROBABILITY_LESSON_CONTENT = guidedLessonContent(ALL_SPECS);

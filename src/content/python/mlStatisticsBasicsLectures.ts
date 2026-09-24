import type { LectureQuestion } from "../../types";
import { guidedLessonContent, guidedMasteryAtom, guidedMasteryConcept, type GuidedMasterySpec } from "./guidedMastery";

const q = (question: string, choices: [string, string, string], answer: 0 | 1 | 2, explanation: string, why: [string, string, string]): LectureQuestion => ({ question, choices, answer, explanation, why });

export const ML_STATISTICS_BASIC_SPECS: GuidedMasterySpec[] = [
  {
    lessonId: "py.mc.m1_4.l1", atomId: "py.atom.ml.estimators-guided", conceptId: "py.ml.estimators-guided",
    title: "An estimator turns one sample into a population guess", requires: ["py.ml.mle-map"],
    vocabulary: [["population", "the full group or process we want to understand"], ["sample", "the observed subset used for learning"], ["estimator", "a rule that maps sample data to a parameter guess"], ["bias", "the estimator's average error across repeated samples"], ["variance", "how much estimates change across repeated samples"], ["consistent", "converging toward the true parameter as sample size grows"]],
    opening: "We usually cannot observe a whole population. We observe a sample and use an estimator, such as the sample mean, to guess a population parameter.",
    outcome: "You will distinguish estimand, estimator, and estimate, simulate bias and variance, and explain why consistency is a large-sample promise rather than perfection.",
    why: "Every trained model and reported metric depends on sampled data. Understanding estimator error prevents false certainty from one convenient dataset.",
    mentalModel: "The population is a hidden jar. A sample is one scoop. The estimator is the measuring rule; the estimate is the number produced from this scoop.",
    firstTitle: "Separate the rule from its one result", firstIntro: "The population mean is the estimand. The sample-mean formula is the estimator. Applying it once produces an estimate.",
    firstCode: `population = [2, 4, 6, 8, 10, 12]
sample = [2, 6, 12]

true_mean = sum(population) / len(population)
estimate = sum(sample) / len(sample)

print(true_mean, estimate, estimate - true_mean)`,
    firstTrace: "The hidden target is seven. This sample estimates six and two-thirds, an error of minus one-third. Another sample would give another estimate even though the estimator rule stays unchanged.",
    secondTitle: "Measure repeated-sample behavior", secondIntro: "Simulation draws many samples from one known population. Average estimate reveals bias; spread across estimates reveals variance.",
    secondCode: `from random import Random

rng = Random(7)
estimates = []
for _ in range(2000):
    draw = [rng.choice(population) for _ in range(5)]
    estimates.append(sum(draw) / len(draw))

average_estimate = sum(estimates) / len(estimates)
variance = sum((value - average_estimate) ** 2 for value in estimates) / len(estimates)
print(round(average_estimate - true_mean, 3), round(variance, 3))`,
    secondTrace: "The average sample mean sits near the population mean, showing little simulation bias. Individual estimates still vary. Larger samples usually reduce this variance and make the mean consistent.",
    mistake: "Do not call one estimate unbiased. Bias describes an estimator's average behavior across possible samples, not whether one realized error happens to equal zero.",
    checkpoint: "Can an unbiased estimator still give a poor estimate on one small sample?",
    checkpointAnswer: "Yes. Unbiased means repeated estimates center on the truth. High variance can still place one particular estimate far from the target.",
    remember: "The estimand is the target, the estimator is the rule, the estimate is one result, bias is average error, and variance is repeated-sample spread.",
    checks: [q("What is an estimate?", ["One estimator result from observed data", "The entire population", "A guarantee of truth"], 0, "Applying a rule to one sample produces one number.", ["Correct. Another sample may change it.", "The population is usually hidden.", "Sampling creates uncertainty."]), q("What does consistency promise?", ["Convergence as sample size grows", "Zero error for every sample", "No model assumptions"], 0, "It is an asymptotic property.", ["Correct. Finite samples can still err.", "That is much stronger and usually impossible.", "Conditions are still required."])],
  },
  {
    lessonId: "py.mc.m1_4.l2", atomId: "py.atom.ml.descriptive-correlation", conceptId: "py.ml.descriptive-correlation",
    title: "Descriptive statistics summarize shape without proving cause", requires: ["py.ml.estimators-guided"],
    vocabulary: [["median", "the middle sorted value"], ["quantile", "a boundary with a chosen fraction of observations on one side"], ["interquartile range", "the third quartile minus the first quartile"], ["correlation", "normalized linear co-movement between two variables"], ["outlier", "an observation unusually far from most data"], ["confounder", "a third factor influencing both measured variables"]],
    opening: "Averages alone can hide skew, outliers, and subgroups. Descriptive statistics summarize center, spread, and association, but they do not explain why the data looks that way.",
    outcome: "You will compute robust summaries and Pearson correlation, see outlier sensitivity, and separate association, prediction, and causation.",
    why: "Good machine-learning work begins by understanding data shape. Misread summaries can create misleading features, metrics, and causal stories.",
    mentalModel: "A summary is a map, not the territory. It compresses useful shape but cannot show every point or reveal the process that created them.",
    firstTitle: "Compare mean, median, and quartile spread", firstIntro: "Median and interquartile range depend on order, so one extreme value moves them less than it moves the mean and range.",
    firstCode: `def median(values):
    ordered = sorted(values)
    middle = len(ordered) // 2
    if len(ordered) % 2: return ordered[middle]
    return (ordered[middle - 1] + ordered[middle]) / 2

def quartiles(values):
    ordered = sorted(values)
    middle = len(ordered) // 2
    return median(ordered[:middle]), median(ordered[-middle:])

data = [10, 11, 12, 13, 14, 100]
q1, q3 = quartiles(data)
print(sum(data) / len(data), median(data), q3 - q1)`,
    firstTrace: "The outlier raises the mean to about twenty-six-point-seven, while the median stays twelve-point-five. The interquartile range summarizes the middle half and ignores the extreme range endpoint.",
    secondTitle: "Normalize covariance into correlation", secondIntro: "Pearson correlation divides covariance by both standard deviations, producing a unitless value between minus one and one.",
    secondCode: `from math import sqrt

def correlation(x, y):
    mean_x, mean_y = sum(x) / len(x), sum(y) / len(y)
    centered = [(a - mean_x, b - mean_y) for a, b in zip(x, y)]
    numerator = sum(a * b for a, b in centered)
    denominator = sqrt(sum(a * a for a, _ in centered) * sum(b * b for _, b in centered))
    return numerator / denominator

hours = [1, 2, 3, 4, 5]
scores = [52, 58, 65, 71, 80]
print(round(correlation(hours, scores), 3))`,
    secondTrace: "Study hours and scores have strong positive linear association here. That does not prove added study caused the score change; preparation, prior knowledge, or selection could influence both.",
    mistake: "Do not interpret correlation as causation or zero correlation as independence. Pearson correlation captures linear association and can miss strong curved relationships.",
    checkpoint: "Why might median describe typical income better than mean in a population containing a few extremely high earners?",
    checkpointAnswer: "A few enormous values pull the mean upward. Median depends only on sorted position and stays representative of the middle person.",
    remember: "Use summaries that match data shape, inspect the distribution, treat correlation as linear association, and require stronger design for causal claims.",
    checks: [q("Which center is usually more outlier-resistant?", ["Median", "Mean", "Maximum"], 0, "Its sorted position changes slowly under extremes.", ["Correct. This helps with skewed data.", "The mean uses every magnitude.", "Maximum is itself an extreme."]), q("What does strong correlation prove?", ["Association, not causation", "A randomized experiment occurred", "No confounder exists"], 0, "Observed co-movement has several possible explanations.", ["Correct. Causal evidence needs design and assumptions.", "Correlation can be observational.", "Confounding may create correlation."])],
  },
  {
    lessonId: "py.mc.m1_4.l3", atomId: "py.atom.ml.large-numbers-clt", conceptId: "py.ml.large-numbers-clt",
    title: "Averages stabilize, and their errors often become bell-shaped", requires: ["py.ml.descriptive-correlation"],
    vocabulary: [["law of large numbers", "the sample average approaches the expected value as sample size grows"], ["central limit theorem", "a standardized sample sum often approaches a normal distribution"], ["standard error", "the standard deviation of an estimator across samples"], ["sampling distribution", "the distribution of an estimator over repeated samples"], ["normal approximation", "using a bell curve to approximate a sampling distribution"]],
    opening: "Two different theorems explain why averages are useful. The law of large numbers concerns convergence; the central limit theorem concerns the shape of repeated errors.",
    outcome: "You will simulate both ideas, compute standard error scaling, and state when heavy tails, dependence, or tiny samples weaken a normal approximation.",
    why: "These results support confidence intervals, tests, minibatch estimates, Monte Carlo methods, and the intuition that more independent data reduces noise.",
    mentalModel: "The law of large numbers pulls one growing average toward its target. The central limit theorem shapes a histogram made from many separate sample averages.",
    firstTitle: "Watch one running average stabilize", firstIntro: "Independent fair die rolls have expected value three-point-five. Check the running mean at increasingly large sample sizes.",
    firstCode: `from random import Random

rng = Random(11)
total = 0
checkpoints = {10, 100, 1000, 10000}
for count in range(1, 10001):
    total += rng.randint(1, 6)
    if count in checkpoints:
        print(count, round(total / count, 3))`,
    firstTrace: "The ten-roll mean can wander. Later running means usually sit closer to three-point-five. Convergence means deviations become unlikely, not that the sequence moves smoothly or never wanders again.",
    secondTitle: "Build a sampling distribution of means", secondIntro: "Repeated samples from a skewed exponential population produce means that become more bell-shaped as each sample grows.",
    secondCode: `from math import sqrt

rng = Random(19)
sample_size = 40
means = []
for _ in range(5000):
    sample = [rng.expovariate(1.0) for _ in range(sample_size)]
    means.append(sum(sample) / sample_size)

mean_of_means = sum(means) / len(means)
standard_error = sqrt(sum((value - mean_of_means) ** 2 for value in means) / len(means))
print(round(mean_of_means, 3), round(standard_error, 3), round(1 / sqrt(sample_size), 3))`,
    secondTrace: "The estimator centers near population mean one. Its observed standard error is near population standard deviation one divided by square root of forty.",
    mistake: "Do not say the central limit theorem makes the raw data normal. It approximates the standardized sum or mean across repeated samples under suitable conditions.",
    checkpoint: "If independent sample size grows from one hundred to four hundred, what happens to the mean's standard error?",
    checkpointAnswer: "It is divided by square root of four, so it halves. Quadrupling independent data roughly halves sampling noise for the mean.",
    remember: "Large numbers explains convergence of averages; the central limit theorem explains their sampling shape; standard error often falls as one over square root n.",
    checks: [q("What distribution does the CLT describe?", ["The standardized sample mean or sum", "The raw population always", "Only the maximum"], 0, "Repeated estimator values become approximately normal.", ["Correct. The data itself may stay skewed.", "Population shape does not automatically change.", "Maxima follow other asymptotics."]), q("How does mean standard error scale with independent n?", ["One over square root n", "Exactly one over n always", "It grows as n"], 0, "Variances add while averaging divides by n.", ["Correct. This creates diminishing returns.", "That shrinks too quickly.", "More data usually reduces uncertainty."])],
  },
  {
    lessonId: "py.mc.m1_4.l4", atomId: "py.atom.ml.tests-intervals", conceptId: "py.ml.tests-intervals",
    title: "Tests measure incompatibility; intervals show plausible precision", requires: ["py.ml.large-numbers-clt"],
    vocabulary: [["null hypothesis", "a precise baseline model used for comparison"], ["test statistic", "a number measuring discrepancy from the null"], ["p-value", "under the null, the probability of a result at least as extreme"], ["confidence interval", "a procedure whose intervals cover the parameter at a stated long-run rate"], ["Type I error", "rejecting a true null"], ["Type II error", "failing to reject a false null"]],
    opening: "A statistical test asks whether data is unusually incompatible with a baseline model. A confidence interval shows the range of parameter values consistent with a chosen procedure.",
    outcome: "You will compute a randomization p-value and mean interval, interpret both precisely, and avoid equating statistical significance with importance or truth.",
    why: "Experiments, model comparisons, A/B tests, and scientific claims require uncertainty language that says exactly what was calculated.",
    mentalModel: "Assume the baseline world, then simulate its scoreboard. The p-value asks how often that world produces a score at least as extreme as ours.",
    firstTitle: "Randomize labels under no treatment effect", firstIntro: "If treatment labels do not matter under the null, shuffling pooled outcomes creates valid null differences in means.",
    firstCode: `from random import Random

control = [7, 8, 6, 9, 7, 8]
treatment = [10, 9, 11, 8, 10, 12]
observed = sum(treatment) / len(treatment) - sum(control) / len(control)
pooled = control + treatment
rng = Random(23)
extreme = 0
for _ in range(10000):
    shuffled = rng.sample(pooled, len(pooled))
    difference = sum(shuffled[:6]) / 6 - sum(shuffled[6:]) / 6
    if abs(difference) >= abs(observed): extreme += 1
print(round(observed, 3), round((extreme + 1) / 10001, 4))`,
    firstTrace: "The two-sided p-value is the fraction of shuffled null differences at least as far from zero as observed. It is not the probability that the null hypothesis is true.",
    secondTitle: "Build a normal-approximation mean interval", secondIntro: "Estimate standard error from sample spread, then place roughly one-point-nine-six standard errors on both sides for a ninety-five-percent procedure.",
    secondCode: `from math import sqrt

def mean_interval(values):
    count = len(values)
    mean = sum(values) / count
    sample_variance = sum((value - mean) ** 2 for value in values) / (count - 1)
    standard_error = sqrt(sample_variance / count)
    margin = 1.96 * standard_error
    return mean - margin, mean + margin

measurements = [12, 10, 11, 13, 9, 12, 14, 10, 11, 12]
print(tuple(round(value, 3) for value in mean_interval(measurements)))`,
    secondTrace: "Across repeated valid samples, about ninety-five percent of intervals built this way cover the true mean under the approximation. The fixed parameter is not randomly moving after this interval is observed.",
    mistake: "Do not say p equals the chance the null is true, or that ninety-five-percent confidence gives a ninety-five-percent probability to this fixed interval without a Bayesian model.",
    checkpoint: "Can a tiny p-value accompany an effect too small to matter in practice?",
    checkpointAnswer: "Yes. Large samples can detect tiny departures from the null. Practical importance depends on effect size, uncertainty, costs, and the real decision.",
    remember: "A p-value is a null-world tail probability; confidence is long-run procedure coverage; neither replaces effect size or study design.",
    checks: [q("What conditions a p-value calculation?", ["The null hypothesis is assumed", "The alternative is certainly true", "The parameter is random by default"], 0, "It measures null-model extremeness.", ["Correct. Reverse probability is not supplied.", "Evidence does not create certainty.", "Frequentist parameters are fixed."]), q("What does a 95% confidence procedure guarantee?", ["About 95% long-run coverage under assumptions", "Every interval contains truth", "The effect is important"], 0, "Coverage describes repetitions of the method.", ["Correct. Individual intervals can miss.", "Five percent may miss in the idealized long run.", "Importance is a separate judgment."])],
  },
  {
    lessonId: "py.mc.m1_4.l5", atomId: "py.atom.ml.bootstrap-sampling", conceptId: "py.ml.bootstrap-sampling",
    title: "The bootstrap resamples observed cases to estimate uncertainty", requires: ["py.ml.tests-intervals"],
    vocabulary: [["sampling frame", "the practical list or process from which observations are drawn"], ["selection bias", "systematic mismatch between sampled and target populations"], ["bootstrap", "resampling observed cases with replacement"], ["bootstrap distribution", "the statistic across many bootstrap resamples"], ["percentile interval", "an interval using lower and upper quantiles of bootstrap statistics"], ["with replacement", "a sampled case returns and may be chosen again"]],
    opening: "Uncertainty formulas are not always convenient. The bootstrap treats the observed sample as a stand-in population and repeatedly resamples it to imitate new samples.",
    outcome: "You will create bootstrap resamples, build a percentile interval, preserve paired observations, and distinguish random uncertainty from sampling bias.",
    why: "Bootstrap methods estimate uncertainty for medians, model metrics, differences, and complex statistics whose analytic standard errors are difficult.",
    mentalModel: "Write each observed case on a ticket, draw n tickets with replacement, compute the statistic, return all tickets, and repeat thousands of times.",
    firstTitle: "Bootstrap a median interval", firstIntro: "Each resample has the original sample size and may repeat or omit observed values. Quantiles of resampled medians approximate estimator uncertainty.",
    firstCode: `from random import Random

def median(values):
    ordered = sorted(values)
    middle = len(ordered) // 2
    return ordered[middle] if len(ordered) % 2 else (ordered[middle - 1] + ordered[middle]) / 2

def bootstrap_interval(values, statistic, repeats=5000):
    rng = Random(29)
    estimates = []
    for _ in range(repeats):
        resample = [rng.choice(values) for _ in values]
        estimates.append(statistic(resample))
    estimates.sort()
    return estimates[int(0.025 * repeats)], estimates[int(0.975 * repeats)]

data = [4, 5, 5, 6, 7, 9, 12, 15, 18]
print(bootstrap_interval(data, median))`,
    firstTrace: "Every resample reuses nine observed cases with replacement. The middle ninety-five percent of bootstrap medians forms a simple percentile interval.",
    secondTitle: "Resample paired cases together", secondIntro: "When two measurements belong to one person, keep the pair intact. Resampling columns independently destroys their dependence.",
    secondCode: `before_after = [(10, 12), (8, 9), (13, 15), (9, 13), (11, 12)]

def average_change(pairs):
    return sum(after - before for before, after in pairs) / len(pairs)

rng = Random(31)
changes = []
for _ in range(3000):
    resample = [rng.choice(before_after) for _ in before_after]
    changes.append(average_change(resample))
changes.sort()
print(round(average_change(before_after), 2), changes[75], changes[2925])`,
    secondTrace: "Each ticket contains both measurements, so individual pairing survives. The bootstrap represents sampling variation conditional on these observed cases.",
    mistake: "Do not expect bootstrap resampling to repair a biased sampling frame. Repeating unrepresentative observations estimates uncertainty around the wrong population target more precisely.",
    checkpoint: "Why must bootstrap samples use replacement?",
    checkpointAnswer: "Without replacement, every size-n resample would contain exactly the original n cases and many statistics would never change. Replacement creates repeated-sample variation.",
    remember: "Resample observational units with replacement, recompute the full statistic, preserve dependence inside each unit, and remember that bootstrap does not fix selection bias.",
    checks: [q("What does one bootstrap sample draw from?", ["The observed sample with replacement", "A guaranteed true population", "Only unseen cases"], 0, "Observed data acts as an empirical population.", ["Correct. This approximates repeated sampling.", "The true population remains unknown.", "Unseen cases are unavailable."]), q("What should be resampled for paired measurements?", ["Whole pairs", "Each column independently", "Only the larger value"], 0, "The observational unit carries the dependence.", ["Correct. Pairing stays intact.", "That destroys within-person structure.", "Selection would be biased."])],
  },
];

export const ML_STATISTICS_BASIC_ATOMS = ML_STATISTICS_BASIC_SPECS.map(guidedMasteryAtom);
export const ML_STATISTICS_BASIC_CONCEPTS = ML_STATISTICS_BASIC_SPECS.map(guidedMasteryConcept);
export const ML_STATISTICS_BASIC_LESSON_CONTENT = guidedLessonContent(ML_STATISTICS_BASIC_SPECS);

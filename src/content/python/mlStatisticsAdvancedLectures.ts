import type { LectureQuestion } from "../../types";
import { guidedLessonContent, guidedMasteryAtom, guidedMasteryConcept, type GuidedMasterySpec } from "./guidedMastery";
import { ML_STATISTICS_BASIC_SPECS } from "./mlStatisticsBasicsLectures";

const q = (question: string, choices: [string, string, string], answer: 0 | 1 | 2, explanation: string, why: [string, string, string]): LectureQuestion => ({ question, choices, answer, explanation, why });

const ADVANCED_SPECS: GuidedMasterySpec[] = [
  {
    lessonId: "py.mc.m1_4.l6", atomId: "py.atom.ml.entropy-guided", conceptId: "py.ml.entropy-guided",
    title: "Entropy measures uncertainty before the answer arrives", requires: ["py.ml.bootstrap-sampling"],
    vocabulary: [["outcome", "one possible result"], ["probability", "the chance assigned to an outcome"], ["self-information", "how surprising one observed outcome is"], ["bit", "the information from resolving one balanced yes-or-no choice"], ["entropy", "the average self-information of a distribution"]],
    opening: "A result that was almost certain tells us little. A rare result tells us much more. Entropy combines every possible result into one average uncertainty score.",
    outcome: "You will calculate self-information and entropy in bits, compare certain and balanced distributions, and explain why entropy belongs to a probability distribution rather than one label.",
    why: "Decision trees, compression, classification losses, and information gain all need a precise way to measure uncertainty.",
    mentalModel: "Imagine asking balanced yes-or-no questions. The number of questions needed to identify an outcome is its information. Entropy is the long-run average number of questions.",
    firstTitle: "Rare outcomes carry more information", firstIntro: "Self-information is minus log base two of probability. Halving the probability adds one bit of surprise.",
    firstCode: `from math import log2

def self_information(probability):
    return -log2(probability)

for probability in [1, 0.5, 0.25, 0.125]:
    print(probability, self_information(probability))`,
    firstTrace: "A certain result carries zero bits. Probability one-half carries one bit. Probability one-quarter carries two bits because two balanced answers are needed to isolate it.",
    secondTitle: "Average surprise across the distribution", secondIntro: "Multiply each outcome's surprise by how often that outcome occurs, then add. Zero-probability outcomes contribute zero and are skipped because log of zero is undefined.",
    secondCode: `def entropy(probabilities):
    return -sum(p * log2(p) for p in probabilities if p > 0)

distributions = {
    "certain": [1, 0, 0, 0],
    "fair coin": [0.5, 0.5],
    "fair four-way": [0.25] * 4,
    "uneven": [0.7, 0.1, 0.1, 0.1],
}
for name, probabilities in distributions.items():
    print(name, round(entropy(probabilities), 3))`,
    secondTrace: "Certainty has zero entropy. A fair coin has one bit. Four equally likely outcomes have two bits. Making one outcome dominant lowers uncertainty.",
    mistake: "Entropy is not the surprise of one observed outcome. Self-information describes one outcome; entropy averages surprise over every outcome using its probability.",
    checkpoint: "Why is a fair coin's entropy larger than a coin that lands heads ninety-nine percent of the time?",
    checkpointAnswer: "Before a fair flip, either answer is plausible. The heavily biased flip is usually predictable, so its average surprise is lower.",
    remember: "Self-information is minus log probability. Entropy is its probability-weighted average. More balanced possibilities create more uncertainty and higher entropy.",
    checks: [q("How many bits does an outcome with probability one-quarter carry?", ["Two", "One-quarter", "Four"], 0, "Minus log base two of one-quarter equals two.", ["Correct. Two balanced decisions isolate one of four outcomes.", "That is the probability, not its information.", "Four is the number of equally likely outcomes."]), q("Which distribution has maximum entropy among four outcomes?", ["All four probabilities equal", "One outcome has probability one", "One outcome has almost all probability"], 0, "Equal probabilities make the next outcome hardest to predict.", ["Correct. Balance maximizes uncertainty.", "Certainty has zero entropy.", "A dominant outcome lowers entropy."])],
  },
  {
    lessonId: "py.mc.m1_4.l7", atomId: "py.atom.ml.cross-entropy-kl", conceptId: "py.ml.cross-entropy-kl",
    title: "Cross-entropy scores predictions against reality", requires: ["py.ml.entropy-guided"],
    vocabulary: [["true distribution", "the probabilities that actually generate outcomes"], ["model distribution", "the probabilities predicted by a model"], ["cross-entropy", "the true distribution's average surprise under model probabilities"], ["KL divergence", "the extra average information cost caused by using one distribution in place of another"], ["support", "the outcomes assigned positive probability"]],
    opening: "Entropy asks how uncertain reality is. Cross-entropy asks how surprised a model is by reality. A confident wrong model receives a very large penalty.",
    outcome: "You will calculate cross-entropy and KL divergence, derive their relationship, and identify direction and zero-probability dangers.",
    why: "Multiclass classifiers commonly minimize cross-entropy. Understanding the formula explains why correct confidence helps and confident mistakes hurt so much.",
    mentalModel: "Reality sends messages using its pattern. Your model built the codebook. Cross-entropy is the model codebook's average message length; KL is the wasted length beyond the best possible codebook.",
    firstTitle: "Score a model with reality's weights", firstIntro: "For each outcome, reality says how often it occurs. The model says how surprised it would be. Multiply those two values and add.",
    firstCode: `from math import log2

def cross_entropy(true_probs, model_probs):
    total = 0.0
    for true_p, model_p in zip(true_probs, model_probs):
        if true_p > 0:
            if model_p <= 0:
                return float("inf")
            total -= true_p * log2(model_p)
    return total

truth = [0.8, 0.2]
for model in ([0.8, 0.2], [0.6, 0.4], [0.1, 0.9]):
    print(model, round(cross_entropy(truth, model), 3))`,
    firstTrace: "The matching model has the smallest cross-entropy. The reversed model assigns low probability to the common outcome, so reality repeatedly delivers events that surprise it.",
    secondTitle: "KL is cross-entropy minus unavoidable entropy", secondIntro: "Reality's entropy is fixed while comparing models. Therefore minimizing cross-entropy also minimizes KL divergence from truth to the model.",
    secondCode: `def entropy(probabilities):
    return -sum(p * log2(p) for p in probabilities if p > 0)

def kl_divergence(true_probs, model_probs):
    return cross_entropy(true_probs, model_probs) - entropy(true_probs)

model = [0.6, 0.4]
print("entropy", round(entropy(truth), 3))
print("cross entropy", round(cross_entropy(truth, model), 3))
print("KL truth-to-model", round(kl_divergence(truth, model), 3))
print("KL model-to-truth", round(kl_divergence(model, truth), 3))`,
    secondTrace: "KL is nonnegative and zero only when the distributions match on relevant outcomes. Reversing its arguments changes the weights and usually changes the answer, so KL is not a distance metric.",
    mistake: "Never give zero model probability to an outcome reality can produce. Its log penalty is infinite. Practical software often clips probabilities for numerical safety, but clipping does not make the original prediction sensible.",
    checkpoint: "Why can cross-entropy never be smaller than the true distribution's entropy?",
    checkpointAnswer: "Cross-entropy equals true entropy plus nonnegative KL divergence. A mismatched model can add coding waste but cannot remove reality's unavoidable uncertainty.",
    remember: "Cross-entropy evaluates model probabilities with reality's frequencies. KL measures the extra cost, has a direction, and becomes infinite when the model excludes a possible real outcome.",
    checks: [q("What happens when a model assigns probability zero to a real possible outcome?", ["Cross-entropy becomes infinite", "The outcome is ignored", "Cross-entropy becomes zero"], 0, "Minus log of zero has an infinite limit.", ["Correct. The model has no finite code for that outcome.", "Only true probability zero allows skipping an outcome.", "Zero would mean no surprise."]), q("Is KL divergence symmetric?", ["No", "Yes", "Only for binary labels"], 0, "Its first distribution supplies the averaging weights.", ["Correct. Reversing arguments usually changes it.", "That would be required for a distance metric, but KL lacks it.", "Binary distributions can also produce different directions."])],
  },
  {
    lessonId: "py.mc.m1_4.l8", atomId: "py.atom.ml.mutual-information", conceptId: "py.ml.mutual-information",
    title: "Mutual information detects any statistical dependence", requires: ["py.ml.cross-entropy-kl"],
    vocabulary: [["joint probability", "the probability that two variable values occur together"], ["marginal probability", "one variable's probability after summing over the other"], ["independent", "knowing one variable does not change the other's distribution"], ["mutual information", "the expected reduction in uncertainty about one variable after learning the other"], ["nonlinear dependence", "a relationship that a straight-line summary may miss"]],
    opening: "Correlation mainly summarizes straight-line movement. Two variables can be tightly connected while correlation is zero. Mutual information asks the broader question: does learning one variable change what we know about the other?",
    outcome: "You will calculate mutual information from a joint table and demonstrate a nonlinear dependency that ordinary correlation misses.",
    why: "Feature selection, representation learning, clustering comparisons, and information gain need dependence measures that are not limited to straight lines.",
    mentalModel: "Before seeing X, Y is a covered card. After seeing X, some possible Y cards disappear. Mutual information measures the average uncertainty removed.",
    firstTitle: "Compare joint probability with independence", firstIntro: "If X and Y are independent, every joint cell equals the product of its row and column marginals. Deviations from that product carry information.",
    firstCode: `from math import log2
from collections import Counter

def mutual_information(pairs):
    joint = Counter(pairs)
    x_counts = Counter(x for x, _ in pairs)
    y_counts = Counter(y for _, y in pairs)
    total = len(pairs)
    information = 0.0
    for (x, y), count in joint.items():
        p_xy = count / total
        p_x = x_counts[x] / total
        p_y = y_counts[y] / total
        information += p_xy * log2(p_xy / (p_x * p_y))
    return information

dependent = [(0, 0)] * 50 + [(1, 1)] * 50
independent = [(x, y) for x in [0, 1] for y in [0, 1] for _ in range(25)]
print(mutual_information(dependent), mutual_information(independent))`,
    firstTrace: "In the dependent data, X reveals Y exactly, producing one bit. In the balanced independent data, every joint cell equals its marginal product, so mutual information is zero.",
    secondTitle: "Find dependence that correlation misses", secondIntro: "Let Y equal X squared. The negative and positive sides cancel in a linear covariance, but X still determines Y.",
    secondCode: `def correlation(xs, ys):
    mean_x = sum(xs) / len(xs)
    mean_y = sum(ys) / len(ys)
    numerator = sum((x - mean_x) * (y - mean_y) for x, y in zip(xs, ys))
    spread_x = sum((x - mean_x) ** 2 for x in xs) ** 0.5
    spread_y = sum((y - mean_y) ** 2 for y in ys) ** 0.5
    return numerator / (spread_x * spread_y)

xs = [-2, -1, 0, 1, 2] * 20
ys = [x * x for x in xs]
print("correlation", round(correlation(xs, ys), 6))
print("mutual information", round(mutual_information(list(zip(xs, ys))), 6))`,
    secondTrace: "Correlation is zero because the curve is symmetric. Mutual information is positive because knowing X removes all uncertainty about Y. The measures answer different questions.",
    mistake: "A positive mutual-information estimate does not prove causation. Finite samples also create estimation bias, especially with many categories, so compare methods and validation procedures carefully.",
    checkpoint: "What exact condition makes mutual information zero?",
    checkpointAnswer: "The variables are independent: every joint probability equals the product of its two marginal probabilities wherever the joint probability is positive.",
    remember: "Mutual information measures general dependence as uncertainty reduction. It can catch curves correlation misses, but it does not reveal direction or prove causation.",
    checks: [q("When is mutual information zero?", ["When the variables are independent", "Whenever correlation is zero", "Whenever values are negative"], 0, "Independence makes joint probabilities equal marginal products.", ["Correct. Learning one variable then gives no information about the other.", "Nonlinear dependence can have zero correlation.", "Numeric signs do not determine dependence."]), q("Does positive mutual information prove that X causes Y?", ["No", "Yes", "Only when it exceeds one bit"], 0, "Dependence may come from reverse causation or a shared cause.", ["Correct. It is an association measure.", "Association alone does not establish intervention effects.", "No threshold converts association into causation."])],
  },
  {
    lessonId: "py.mc.m1_4.l9", atomId: "py.atom.ml.multiple-testing-power", conceptId: "py.ml.multiple-testing-power",
    title: "Many tests need error control and enough power", requires: ["py.ml.mutual-information"],
    vocabulary: [["family-wise error rate", "the chance of at least one false positive across a family of tests"], ["false discovery rate", "the expected false-positive share among reported discoveries"], ["Bonferroni correction", "testing each of m hypotheses at alpha divided by m"], ["Benjamini-Hochberg procedure", "a step-up rule that controls false discovery rate under stated conditions"], ["power", "the probability of detecting a real effect with a chosen procedure"]],
    opening: "A five-percent threshold does not mean only five percent of all reported findings are false. Run many null tests and the chance of at least one exciting accident rises. Error control and power must be designed together.",
    outcome: "You will apply Bonferroni and Benjamini-Hochberg rules, explain their different promises, and connect power to effect size, noise, sample size, and threshold.",
    why: "Model experiments, feature searches, dashboards, and A/B tests often compare many options. Uncorrected searching can turn noise into a confident product decision.",
    mentalModel: "Every test is a smoke alarm. Adding alarms makes accidental ringing more likely. Stricter alarms reduce false alerts, but weak smoke may then go unnoticed unless the experiment collects better evidence.",
    firstTitle: "Choose the error promise you need", firstIntro: "Bonferroni protects against any false positive in the family. Benjamini-Hochberg can report more discoveries while controlling the expected false share among discoveries under its assumptions.",
    firstCode: `def bonferroni(p_values, alpha=0.05):
    cutoff = alpha / len(p_values)
    return [i for i, p in enumerate(p_values) if p <= cutoff]

def benjamini_hochberg(p_values, alpha=0.05):
    ranked = sorted(enumerate(p_values), key=lambda item: item[1])
    largest_rank = 0
    for rank, (_, p_value) in enumerate(ranked, start=1):
        if p_value <= alpha * rank / len(p_values):
            largest_rank = rank
    return sorted(index for index, _ in ranked[:largest_rank])

p_values = [0.001, 0.008, 0.02, 0.07, 0.4, 0.9]
print("Bonferroni", bonferroni(p_values))
print("BH", benjamini_hochberg(p_values))`,
    firstTrace: "Bonferroni uses about zero-point-zero-zero-eight-three here and keeps only the smallest p-values. BH finds the largest passing rank, then accepts every p-value up through that rank.",
    secondTitle: "Measure power before trusting a design", secondIntro: "Simulation repeats an experiment when a real effect exists. The fraction of runs that reject is estimated power. Larger samples make the estimated difference less noisy.",
    secondCode: `from random import Random
from math import sqrt

def estimated_power(sample_size, true_difference, repeats=4000):
    rng = Random(12)
    rejections = 0
    standard_error = sqrt(2 / sample_size)
    for _ in range(repeats):
        observed = rng.gauss(true_difference, standard_error)
        z_score = observed / standard_error
        if abs(z_score) > 1.96:
            rejections += 1
    return rejections / repeats

for size in [20, 80, 320]:
    print(size, round(estimated_power(size, 0.3), 3))`,
    secondTrace: "The real effect stays zero-point-three. Increasing sample size shrinks standard error, so the same signal crosses the fixed threshold more often. Power is a property of a complete design, not a dataset label.",
    mistake: "Do not choose hypotheses after seeing the same data and then pretend only those tests were run. Record the whole search family, separate exploration from confirmation, and account for repeated looks when needed.",
    checkpoint: "Why can making a threshold stricter reduce power?",
    checkpointAnswer: "A stricter threshold demands more extreme evidence. That lowers false positives, but real effects with noisy estimates also cross the threshold less often.",
    remember: "Define the family, choose the error guarantee, correct the decision rule, and design enough power. Multiple testing and weak experiments are connected problems.",
    checks: [q("What does Bonferroni primarily control?", ["The chance of any false positive in the family", "The size of a real effect", "The false share in one chosen test"], 0, "It bounds family-wise error using alpha divided by the test count.", ["Correct. This is a strong family-level promise.", "Effect size comes from the data-generating process.", "Its target concerns the full test family."]), q("What usually increases power when everything else stays fixed?", ["A larger sample", "A smaller real effect", "More noise"], 0, "Larger samples reduce standard error.", ["Correct. The signal becomes easier to separate from sampling noise.", "Smaller effects are harder to detect.", "More noise hides the signal."])],
  },
];

export const ML_STATISTICS_SPECS: GuidedMasterySpec[] = [...ML_STATISTICS_BASIC_SPECS, ...ADVANCED_SPECS];
export const ML_STATISTICS_ATOMS = ML_STATISTICS_SPECS.map(guidedMasteryAtom);
export const ML_STATISTICS_CONCEPTS = ML_STATISTICS_SPECS.map(guidedMasteryConcept);
export const ML_STATISTICS_LESSON_CONTENT = guidedLessonContent(ML_STATISTICS_SPECS);

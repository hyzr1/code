import type { LectureQuestion } from "../../types";
import { guidedMasteryAtom, guidedMasteryConcept, type GuidedMasterySpec } from "./guidedMastery";

const q = (question: string, choices: [string, string, string], answer: 0 | 1 | 2, explanation: string, why: [string, string, string]): LectureQuestion => ({ question, choices, answer, explanation, why });

export const ML_PROBABILITY_BASIC_SPECS: GuidedMasterySpec[] = [
  {
    lessonId: "py.mc.m1_3.l1", atomId: "py.atom.ml.sample-spaces-events", conceptId: "py.ml.sample-spaces-events",
    title: "Sample spaces describe every possible outcome", requires: ["py.ml.constrained-optimization"],
    vocabulary: [["random experiment", "a repeatable process whose exact result is uncertain"], ["outcome", "one possible result"], ["sample space", "the set of all possible outcomes"], ["event", "a set of outcomes answering one question"]],
    opening: "Probability starts by naming what can happen. A sample space lists possible outcomes. An event collects the outcomes that make one statement true.",
    outcome: "You will build sample spaces and events, assign valid probabilities, and use complements and unions without counting an outcome twice.",
    why: "Classifiers describe possible outcomes. A vague event or ignored overlap can make a correct-looking formula answer the wrong question.",
    mentalModel: "Picture one card per outcome. An event circles the cards that count as success. Probability measures how much valid weight lies inside.",
    firstTitle: "List outcomes before calculating", firstIntro: "Two coin flips have four ordered outcomes. The event exactly one head contains two of them.",
    firstCode: `from itertools import product

space = list(product("HT", repeat=2))
exactly_one_head = [outcome for outcome in space if outcome.count("H") == 1]
probability = len(exactly_one_head) / len(space)
print(space)
print(exactly_one_head, probability)`,
    firstTrace: "The space is HH, HT, TH, TT. HT and TH have one head. Fair independent flips make all four equally likely, so probability is two divided by four, or one half.",
    secondTitle: "Check the probability axioms", secondIntro: "Valid probabilities are nonnegative, total one, and add across disjoint outcomes.",
    secondCode: `weather = {"sun": 0.6, "rain": 0.3, "snow": 0.1}
assert all(weight >= 0 for weight in weather.values())
assert abs(sum(weather.values()) - 1.0) < 1e-9

wet = weather["rain"] + weather["snow"]
not_wet = 1 - wet
print(wet, not_wet)`,
    secondTrace: "Rain and snow are distinct outcomes, so their probabilities add to 0.4. The complement has probability one minus 0.4, which is 0.6. Wet and not wet cover the whole space without overlap.",
    mistake: "Do not assume outcomes are equally likely merely because they are easy to list. A loaded die has six outcomes but different weights. Also subtract overlap when adding events that can happen together.",
    checkpoint: "A six-sided die event is rolling an even number. What are the sample space and event? What is its probability for a fair die?",
    checkpointAnswer: "The space is `{1,2,3,4,5,6}`. The event is `{2,4,6}`. Three of six equally likely outcomes qualify, so the probability is one half.",
    remember: "Define the possible outcomes and the event first. Then assign nonnegative weights totaling one and combine only according to overlap.",
    checks: [q("What is an event?", ["A set of outcomes", "One probability formula", "Only an impossible result"], 0, "An event collects every outcome making a statement true.", ["Correct. It can contain one or many outcomes.", "A formula may compute its probability.", "Impossible is only the empty event."]), q("What must all outcome probabilities sum to?", ["1", "0", "The number of outcomes"], 0, "The full sample space is certain.", ["Correct. Total probability is one.", "Zero represents impossibility.", "Probability weight is normalized."])],
  },
  {
    lessonId: "py.mc.m1_3.l2", atomId: "py.atom.ml.conditional-independence", conceptId: "py.ml.conditional-independence",
    title: "Conditional probability changes the reference group", requires: ["py.ml.sample-spaces-events"],
    vocabulary: [["conditional probability", "probability of A after restricting attention to cases where B happened"], ["joint probability", "probability that A and B happen together"], ["independent", "learning one event does not change the other's probability"], ["dependent", "learning one event changes the other's probability"]],
    opening: "A condition does not add a mysterious bonus. It changes the group being measured. After learning B, ignore outcomes outside B and ask what fraction of the remaining probability also belongs to A.",
    outcome: "You will compute conditional and joint probabilities, test independence, and distinguish mutually exclusive events from independent events.",
    why: "Models predict labels given features. Medical risk changes given a test result. Recommendation likelihood changes given user history. Conditional probability is the grammar of those statements.",
    mentalModel: "Imagine zooming a camera onto only the B region. Everything outside the frame disappears. Conditional probability asks how much of the new frame also lies in A.",
    firstTitle: "Restrict the denominator", firstIntro: "In this table, count admitted applicants only among people in the selected group.",
    firstCode: `records = [
    ("experienced", True), ("experienced", True),
    ("experienced", False), ("new", False), ("new", True),
]

experienced = [admitted for group, admitted in records if group == "experienced"]
p_admitted_given_experienced = sum(experienced) / len(experienced)
p_admitted = sum(admitted for _, admitted in records) / len(records)
print(p_admitted_given_experienced, p_admitted)`,
    firstTrace: "Two of three experienced applicants are admitted, so the conditional probability is two thirds. Three of all five applicants are admitted, so the unconditional probability is three fifths. The denominators answer different questions.",
    secondTitle: "Test independence with multiplication", secondIntro: "If A and B are independent, their joint probability equals the product of their separate probabilities.",
    secondCode: `p_heads = 0.5
p_six = 1 / 6
p_heads_and_six = 1 / 12
print(abs(p_heads_and_six - p_heads * p_six) < 1e-12)

p_red = 0.4
p_blue = 0.6
p_red_and_blue_same_draw = 0.0
print(p_red_and_blue_same_draw, p_red * p_blue)`,
    secondTrace: "A coin result and separate die result satisfy the product rule. Red and blue on one single-color draw are mutually exclusive, so their joint probability is zero. Because their product is positive, they are not independent.",
    mistake: "Do not confuse mutually exclusive with independent. If one of two possible events happens, the other becomes impossible. That is strong dependence unless one event already had probability zero.",
    checkpoint: "If P(A)=0.4, P(B)=0.5, and P(A and B)=0.2, are A and B independent?",
    checkpointAnswer: "Yes. The product `0.4 * 0.5` equals the joint probability `0.2`. Equivalently, conditioning on B leaves A's probability at 0.4.",
    remember: "Conditioning restricts the reference group. Independence means that restriction does not change the other event's probability.",
    checks: [q("What changes in P(A given B)?", ["The reference group becomes B", "A becomes certain", "All probabilities become equal"], 0, "Outcomes outside B are excluded.", ["Correct. Measure A within B.", "A need not follow from B.", "Conditional outcomes retain their weights."]), q("Are mutually exclusive positive-probability events independent?", ["No", "Always", "Only when named A and B"], 0, "One happening makes the other impossible.", ["Correct. Their joint is zero while the product is positive.", "That behavior is dependence.", "Names do not affect probability."])],
  },
  {
    lessonId: "py.mc.m1_3.l3", atomId: "py.atom.ml.bayes-guided", conceptId: "py.ml.bayes-guided",
    title: "Bayes' theorem reverses a condition", requires: ["py.ml.conditional-independence"],
    vocabulary: [["prior", "belief about a cause before new evidence"], ["likelihood", "probability of the evidence under a proposed cause"], ["posterior", "updated belief after seeing evidence"], ["base rate", "how common the cause is before testing"]],
    opening: "A test may be accurate when disease is present, yet a positive result may still rarely mean disease. Bayes' theorem combines test behavior with the disease base rate.",
    outcome: "You will compute a posterior from prior and likelihood, explain every term, and use natural counts to catch base-rate mistakes.",
    why: "Bayesian updating appears in diagnosis, spam filters, anomaly detection, model comparison, and uncertainty. It prevents evidence from being interpreted without context.",
    mentalModel: "Begin with separate piles for possible causes. The prior sets pile sizes. Evidence filters each pile at its own likelihood. The posterior compares the surviving piles.",
    firstTitle: "Update with natural counts", firstIntro: "Imagine ten thousand people so small percentages become visible counts.",
    firstCode: `population = 10_000
prevalence = 0.01
sensitivity = 0.90
false_positive_rate = 0.05

sick_positive = population * prevalence * sensitivity
healthy_positive = population * (1 - prevalence) * false_positive_rate
posterior = sick_positive / (sick_positive + healthy_positive)
print(sick_positive, healthy_positive, round(posterior, 4))`,
    firstTrace: "About ninety sick people test positive. About 495 healthy people also test positive because the healthy group is huge. Among all 585 positives, only about 15.4 percent are sick.",
    secondTitle: "Write the formula from named parts", secondIntro: "Posterior is prior times likelihood, divided by the total probability of the evidence.",
    secondCode: `prior = 0.01
positive_if_sick = 0.90
positive_if_healthy = 0.05

evidence = prior * positive_if_sick + (1 - prior) * positive_if_healthy
posterior = prior * positive_if_sick / evidence
print(round(evidence, 4), round(posterior, 4))`,
    secondTrace: "The numerator is the joint probability of sick and positive. The denominator adds every route to a positive result. Dividing asks what fraction of positive probability came from sickness.",
    mistake: "Do not swap `P(positive given sick)` with `P(sick given positive)`. Sensitivity describes the first direction. The second direction also depends on prevalence and false positives.",
    checkpoint: "Why can a rare condition have a low posterior after a fairly accurate positive test?",
    checkpointAnswer: "A large healthy population can produce more false positives than the small sick population produces true positives. The prior base rate determines the starting pile sizes.",
    remember: "Posterior is proportional to prior times likelihood. Normalize by every possible cause of the observed evidence.",
    checks: [q("What is the prior?", ["Belief before new evidence", "The test result", "The final normalized answer"], 0, "It sets the starting base rate.", ["Correct. Evidence updates it.", "That is observed evidence.", "That is the posterior."]), q("What belongs in Bayes' denominator?", ["Total probability of the evidence", "Only true positives", "Only the prior"], 0, "Include every route that produces the evidence.", ["Correct. It normalizes competing causes.", "False positives also contribute.", "Prior alone is not evidence probability."])],
  },
  {
    lessonId: "py.mc.m1_3.l4", atomId: "py.atom.ml.random-variables-guided", conceptId: "py.ml.random-variables-guided",
    title: "Random variables turn outcomes into numbers", requires: ["py.ml.bayes-guided"],
    vocabulary: [["random variable", "a function assigning a number to every outcome"], ["discrete", "taking separate countable values"], ["continuous", "taking values across an interval"], ["distribution", "the probability attached to possible variable values"]],
    opening: "A random variable is a rule, not a changing container. It maps each uncertain outcome to a number we can summarize.",
    outcome: "You will distinguish discrete and continuous variables, build a probability mass function, and explain why a continuous point has probability zero.",
    why: "Labels, counts, measurements, losses, and model outputs are random variables. Their distributions tell us which values are plausible and how uncertainty is shaped.",
    mentalModel: "Picture every outcome passing through a label machine. The machine prints a number. Several outcomes may print the same number, and their probabilities combine at that value.",
    firstTitle: "Map coin outcomes to a count", firstIntro: "Let X equal the number of heads in two flips. Four outcomes collapse into three numeric values.",
    firstCode: `from itertools import product

space = list(product("HT", repeat=2))
counts = {}
for outcome in space:
    x = outcome.count("H")
    counts[x] = counts.get(x, 0) + 1 / len(space)
print(counts)
print(sum(counts.values()))`,
    firstTrace: "TT maps to zero. HT and TH both map to one, so their weights add to one half. HH maps to two. The probability mass function totals one.",
    secondTitle: "Treat continuous probability as area", secondIntro: "For a uniform value from zero to one, interval probability equals interval length. A single point has zero width.",
    secondCode: `def uniform_interval_probability(left, right):
    clipped_left = max(0.0, left)
    clipped_right = min(1.0, right)
    return max(0.0, clipped_right - clipped_left)

print(uniform_interval_probability(0.2, 0.5))
print(uniform_interval_probability(0.4, 0.4))`,
    secondTrace: "The interval from 0.2 to 0.5 has probability 0.3. The point 0.4 has zero width and probability zero, though nearby intervals have positive probability.",
    mistake: "Do not confuse density height with point probability. A continuous density may be greater than one in a narrow region, while total area remains one and every exact point still has probability zero.",
    checkpoint: "Is the number of clicks in an hour discrete or continuous? Is the exact time until the next click discrete or continuous?",
    checkpointAnswer: "Click count is discrete because it takes whole-number values. Waiting time is modeled as continuous because it can take any nonnegative real duration.",
    remember: "A random variable maps outcomes to numbers. Discrete models assign mass to values; continuous models assign probability to intervals through area.",
    checks: [q("What is a random variable?", ["A numeric function of outcomes", "A probability that must change", "Only a continuous measurement"], 0, "It maps each outcome to a value.", ["Correct. Randomness comes from the uncertain outcome.", "Its mapping can be fixed.", "It may be discrete or continuous."]), q("What is an exact point's probability under a continuous density?", ["0", "Always 1", "The density height"], 0, "A point has zero interval width.", ["Correct. Intervals carry area.", "Only the whole space totals one.", "Density is not point mass."])],
  },
  {
    lessonId: "py.mc.m1_3.l5", atomId: "py.atom.ml.expectation-variance-covariance", conceptId: "py.ml.expectation-variance-covariance",
    title: "Expectation, variance, and covariance summarize uncertainty", requires: ["py.ml.random-variables-guided"],
    vocabulary: [["expectation", "probability-weighted average value over repeated trials"], ["variance", "expected squared distance from the mean"], ["standard deviation", "square root of variance, using the variable's original units"], ["covariance", "whether two variables tend to move together"]],
    opening: "A full distribution may contain many values. Expectation summarizes its center. Variance summarizes spread. Covariance summarizes joint movement between two variables.",
    outcome: "You will compute all three from small distributions and explain what their signs, units, and limitations mean.",
    why: "Losses are expectations. Noise is described by variance. Feature relationships and Gaussian geometry use covariance. These summaries appear throughout training and evaluation.",
    mentalModel: "Expectation is the balance point of weighted values. Variance measures how far weights spread from that balance. Covariance asks whether two balance arms tend to tilt together.",
    firstTitle: "Compute mean and variance from probabilities", firstIntro: "Multiply each value by its probability for the mean, then weight each squared distance for variance.",
    firstCode: `from math import sqrt

values = [0, 1, 2]
probabilities = [0.25, 0.50, 0.25]
mean = sum(value * probability for value, probability in zip(values, probabilities))
variance = sum((value - mean) ** 2 * probability for value, probability in zip(values, probabilities))
print(mean, variance, sqrt(variance))`,
    firstTrace: "The weighted mean is one. Distances are minus one, zero, and one. Squaring removes signs. Weighted squared distances total one half, so standard deviation is about 0.707.",
    secondTitle: "Measure paired movement", secondIntro: "Covariance averages the product of each variable's centered values.",
    secondCode: `x = [1.0, 2.0, 3.0]
y = [2.0, 4.0, 5.0]
mean_x = sum(x) / len(x)
mean_y = sum(y) / len(y)
covariance = sum((a - mean_x) * (b - mean_y) for a, b in zip(x, y)) / len(x)
print(mean_x, mean_y, round(covariance, 4))`,
    secondTrace: "Low x pairs with low y and high x pairs with high y, so centered products are mostly positive. Positive covariance indicates joint upward movement. Its magnitude depends on both variables' units.",
    mistake: "Do not interpret zero covariance as guaranteed independence. It only rules out linear co-movement. Also do not compare raw covariance magnitudes across differently scaled features; correlation normalizes scale.",
    checkpoint: "Why does variance square distances instead of averaging ordinary signed distances from the mean?",
    checkpointAnswer: "Signed distances from the mean cancel to zero by definition. Squaring makes every deviation nonnegative and gives larger deviations more weight.",
    remember: "Expectation is center, variance is squared spread, standard deviation restores units, and covariance describes linear joint movement.",
    checks: [q("What units does variance use?", ["Squared original units", "No units ever", "Always percent"], 0, "Distances are squared before averaging.", ["Correct. Standard deviation restores original units.", "Only normalized measures may be unitless.", "Percent is not automatic."]), q("What does positive covariance suggest?", ["The variables tend to move together", "They are independent", "They have equal means"], 0, "Centered products tend to be positive.", ["Correct. High pairs with high and low with low.", "Dependence may exist, but covariance alone is not proof of all structure.", "Means may differ."])],
  },
];

export const ML_PROBABILITY_BASIC_ATOMS = ML_PROBABILITY_BASIC_SPECS.map(guidedMasteryAtom);
export const ML_PROBABILITY_BASIC_CONCEPTS = ML_PROBABILITY_BASIC_SPECS.map(guidedMasteryConcept);

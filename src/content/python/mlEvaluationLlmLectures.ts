import {
  guidedLessonContent,
  guidedMasteryAtom,
  guidedMasteryConcept,
  type GuidedMasterySpec,
} from "./guidedMastery";

const ML_LLM_EVALUATION_SPECS: GuidedMasterySpec[] = [
  {
    lessonId: "py.mc.m9_6.l1",
    atomId: "py.atom.ml.benchmarks-contamination",
    conceptId: "py.ml.benchmarks-contamination",
    title: "Benchmarks and contamination",
    requires: ["py.ml.production-rag"],
    vocabulary: [
      ["contamination", "benchmark items appearing in the training corpus"],
      ["saturation", "a benchmark where the remaining headroom is smaller than the noise"],
      ["construct mismatch", "a benchmark measuring something other than what it is named after"],
    ],
    opening:
      "A benchmark score is only meaningful if the model has not seen the answers, the questions still discriminate, and the task measures what its name claims.",
    outcome:
      "You will detect contamination by overlapping n-grams and recognise a saturated benchmark from its score history.",
    why:
      "Every one of these three failures inflates a number without improving the model, and all three are common in published results.",
    mentalModel:
      "Picture the benchmark as a measuring instrument. Contamination breaks the calibration, saturation shortens the scale, and construct mismatch means it was measuring the wrong thing all along.",
    firstTitle: "Overlapping n-grams",
    firstIntro:
      "Long exact overlaps between a benchmark item and the training corpus almost never occur by chance. Counting them is the cheapest useful check.",
    firstCode: `def ngrams(text, n=8):
    words = text.split()
    return {" ".join(words[i:i + n]) for i in range(len(words) - n + 1)}

benchmark = "the capital of the country france is the city paris"
clean = "some unrelated text about geography and history of europe"
seen = "trivia: the capital of the country france is the city paris indeed"

for name, corpus in [("clean", clean), ("contaminated", seen)]:
    print(name, "overlapping 8-grams:", len(ngrams(benchmark) & ngrams(corpus)))`,
    firstTrace:
      "Zero overlaps against three. Three shared eight-word sequences is not coincidence, and the item has to be removed rather than discounted.",
    secondTitle: "Reading saturation",
    secondIntro:
      "Track the best score over successive model generations. When the gains shrink below the measurement noise, the benchmark has stopped discriminating.",
    secondCode: `history = [0.62, 0.78, 0.89, 0.94, 0.96, 0.965, 0.968]

previous = history[0]
for score in history[1:]:
    print(score, "gain", round(score - previous, 3))
    previous = score
print("headroom left:", round(1.0 - history[-1], 3))`,
    secondTrace:
      "Gains fall from sixteen points to three tenths of a point, with three percent headroom left. Further movement here is noise, not capability.",
    mistake:
      "Reporting a benchmark average across a suite where several members are saturated. Those contribute almost no signal but full weight, so the average moves for reasons unrelated to the model.",
    checkpoint:
      "A benchmark item overlaps the training corpus by three eight-word sequences. What should happen?",
    checkpointAnswer:
      "The item is removed from the evaluation. There is no way to discount a contaminated item and recover a meaningful score.",
    remember:
      "Check contamination, check headroom, check what is being measured.",
    checks: [
      {
        prompt: "What does a long exact overlap indicate?",
        options: [
          "The benchmark item is in the training corpus",
          "The model memorised it during evaluation",
          "The benchmark is too easy",
        ],
        answerIndex: 0,
        hint: "Eight-word overlaps do not arise by chance.",
        explanations: [
          "Correct, and the item must be removed.",
          "Evaluation does not train.",
          "Difficulty is a separate question.",
        ],
      },
      {
        prompt: "What makes a benchmark saturated?",
        options: [
          "Remaining headroom smaller than the measurement noise",
          "A score above fifty percent",
          "Many models evaluated on it",
        ],
        answerIndex: 0,
        hint: "It has stopped discriminating.",
        explanations: [
          "Correct. Movement there is noise.",
          "Half is not a threshold.",
          "Popularity is unrelated.",
        ],
      },
      {
        prompt: "What is construct mismatch?",
        options: [
          "The benchmark measures something other than its name suggests",
          "The scores are miscalculated",
          "The items are too hard",
        ],
        answerIndex: 0,
        hint: "It is about validity, not arithmetic.",
        explanations: [
          "Correct, and it survives every contamination check.",
          "Arithmetic errors are a different problem.",
          "Difficulty does not affect validity.",
        ],
      },
    ],
  },
  {
    lessonId: "py.mc.m9_6.l2",
    atomId: "py.atom.ml.model-judges",
    conceptId: "py.ml.model-judges",
    title: "Model judges and human evaluation",
    requires: ["py.ml.benchmarks-contamination"],
    vocabulary: [
      ["chance-corrected agreement", "agreement adjusted for how often two raters would coincide at random"],
      ["position bias", "preferring whichever response was shown first"],
      ["rubric", "the explicit criteria a rater applies"],
    ],
    opening:
      "A model can rate another model's output far more cheaply than a person can. Whether that rating means anything depends on measurements the judge cannot make about itself.",
    outcome:
      "You will correct agreement for chance and detect position bias, before trusting a judge's scores at all.",
    why:
      "Raw agreement on a two-way choice starts at fifty percent for free. A judge at seventy-five percent may be adding very little.",
    mentalModel:
      "Picture two raters flipping coins. They already agree half the time, so the question is how much of the observed agreement exceeds that floor.",
    firstTitle: "Agreement above chance",
    firstIntro:
      "Subtract the agreement expected from the marginal rates, then express what remains as a fraction of the room that was available.",
    firstCode: `def raw_agreement(a, b):
    return round(sum(1 for x, y in zip(a, b) if x == y) / len(a), 3)

def chance_corrected(a, b):
    n = len(a)
    observed = sum(1 for x, y in zip(a, b) if x == y) / n
    rate_a, rate_b = sum(a) / n, sum(b) / n
    expected = rate_a * rate_b + (1 - rate_a) * (1 - rate_b)
    return round((observed - expected) / (1 - expected), 3)

human = [1, 0, 1, 1, 0, 1, 0, 0]
judge = [1, 0, 1, 0, 0, 1, 1, 0]
print("raw", raw_agreement(human, judge))
print("chance-corrected", chance_corrected(human, judge))`,
    firstTrace:
      "Seventy-five percent raw becomes zero point five once chance is removed. Half of the apparent agreement was free.",
    secondTitle: "Position bias",
    secondIntro:
      "Present the same pair in both orders. If the judge were unbiased, the first position would win about half the time.",
    secondCode: `for first_wins, total in [(50, 100), (68, 100), (95, 100)]:
    share = round(first_wins / total * 100, 1)
    verdict = "unbiased" if 45 <= share <= 55 else "biased"
    print(f"{first_wins}/{total} first-position wins -> {share}% {verdict}")`,
    secondTrace:
      "Fifty percent is what an unbiased judge produces. Sixty-eight and ninety-five are measuring presentation order rather than quality.",
    mistake:
      "Using a judge from the same family as the model under evaluation. It systematically prefers its own style, and that preference is invisible in the score unless a human sample is held back to check it.",
    checkpoint:
      "A judge agrees with humans seventy-five percent of the time on a two-way choice. Is that good?",
    checkpointAnswer:
      "Not necessarily. Chance alone gives fifty percent, so the chance-corrected figure is about a half - moderate, not strong.",
    remember:
      "Correct for chance, swap the order, and hold back a human sample.",
    checks: [
      {
        prompt: "Why correct agreement for chance?",
        options: [
          "A two-way choice already agrees half the time at random",
          "Humans are inconsistent",
          "Judges are biased",
        ],
        answerIndex: 0,
        hint: "The floor is not zero.",
        explanations: [
          "Correct. Raw agreement overstates the signal.",
          "That is a separate issue.",
          "Bias is measured differently.",
        ],
      },
      {
        prompt: "How is position bias detected?",
        options: [
          "Present each pair in both orders and compare",
          "Ask the judge to explain",
          "Use a larger judge",
        ],
        answerIndex: 0,
        hint: "An unbiased judge splits evenly.",
        explanations: [
          "Correct, and the split should be near half.",
          "Explanations are also subject to the bias.",
          "Larger judges show it too.",
        ],
      },
      {
        prompt: "What is wrong with judging a model with one from its own family?",
        options: [
          "It prefers its own style, invisibly inflating the score",
          "It is too slow",
          "It cannot follow a rubric",
        ],
        answerIndex: 0,
        hint: "The bias does not appear in the score itself.",
        explanations: [
          "Correct. A held-back human sample is the check.",
          "Speed is not the concern.",
          "Rubric-following is usually fine.",
        ],
      },
    ],
  },
  {
    lessonId: "py.mc.m9_6.l3",
    atomId: "py.atom.ml.hallucination-robustness",
    conceptId: "py.ml.hallucination-robustness",
    title: "Hallucination, bias, and robustness",
    requires: ["py.ml.model-judges"],
    vocabulary: [
      ["slice", "a subset of the evaluation set sharing some property"],
      ["observable criterion", "a failure definition two people would score the same way"],
      ["aggregate", "a single number averaged over every slice"],
    ],
    opening:
      "One number for a model that behaves very differently across its inputs is a number about the evaluation mix, not about the model.",
    outcome:
      "You will compute per-slice rates alongside the aggregate and see how far the worst slice can sit from it.",
    why:
      "The aggregate moves when the mix changes, so a model can appear to improve because the evaluation set shifted rather than the model.",
    mentalModel:
      "Picture the evaluation set as several populations stacked together. The average sits between them and describes none of them.",
    firstTitle: "The aggregate hides the worst case",
    firstIntro:
      "Compute the overall rate and each slice's rate together. The gap between the overall figure and the worst slice is the thing to report.",
    firstCode: `slices = {"short": (940, 1000), "long": (610, 1000),
          "non-native": (520, 1000), "technical": (880, 1000)}

correct = sum(c for c, _ in slices.values())
total = sum(n for _, n in slices.values())
per_slice = {name: round(c / n, 3) for name, (c, n) in slices.items()}

print("aggregate", round(correct / total, 3))
print("per slice", per_slice)
print("worst", min(per_slice, key=per_slice.get))`,
    firstTrace:
      "An aggregate of seventy-four percent covers a range from fifty-two to ninety-four. Nobody experiences seventy-four percent.",
    secondTitle: "The mix moves the number",
    secondIntro:
      "Reweight the same per-slice rates with a different mix. The aggregate changes while every underlying rate is identical.",
    secondCode: `def weighted(rates, mix):
    return round(sum(rates[name] * share for name, share in mix.items()), 3)

heavy_short = {"short": 0.7, "long": 0.1,
               "non-native": 0.1, "technical": 0.1}
even = {name: 0.25 for name in per_slice}

print("short-heavy mix", weighted(per_slice, heavy_short))
print("even mix       ", weighted(per_slice, even))`,
    secondTrace:
      "Eighty-two percent against seventy-four, from exactly the same model. The improvement is entirely in the evaluation mix.",
    mistake:
      "Defining a failure as an answer that is unhelpful. Two people will score that differently, so the measurement has no stability - the criterion has to be something observable, like a citation that does not support the claim.",
    checkpoint:
      "A model's aggregate score rises. What must be checked before claiming improvement?",
    checkpointAnswer:
      "That the evaluation mix is unchanged. The same per-slice rates give a different aggregate under a different mix.",
    remember:
      "Report slices; the aggregate describes the mix.",
    checks: [
      {
        prompt: "Why report per-slice rates?",
        options: [
          "The aggregate can sit far from every slice",
          "It is required by convention",
          "Slices are easier to compute",
        ],
        answerIndex: 0,
        hint: "Nobody experiences the average.",
        explanations: [
          "Correct. Seventy-four covered fifty-two to ninety-four.",
          "It is a substantive point, not a convention.",
          "Slicing is extra work.",
        ],
      },
      {
        prompt: "An aggregate improves with unchanged per-slice rates. What happened?",
        options: [
          "The evaluation mix shifted",
          "The model improved",
          "The metric changed",
        ],
        answerIndex: 0,
        hint: "The rates themselves did not move.",
        explanations: [
          "Correct, and that is not an improvement.",
          "Unchanged slice rates mean unchanged behaviour.",
          "The metric is the same.",
        ],
      },
      {
        prompt: "What makes a good failure criterion?",
        options: [
          "Two people scoring it independently would agree",
          "It is strict",
          "It is easy to satisfy",
        ],
        answerIndex: 0,
        hint: "Stability of measurement is the requirement.",
        explanations: [
          "Correct. A citation not supporting its claim qualifies.",
          "Strictness without agreement is still unstable.",
          "Ease is irrelevant.",
        ],
      },
    ],
  },
  {
    lessonId: "py.mc.m9_6.l4",
    atomId: "py.atom.ml.evaluation-statistics",
    conceptId: "py.ml.evaluation-statistics",
    title: "Evaluation statistics",
    requires: ["py.ml.hallucination-robustness"],
    vocabulary: [
      ["confidence interval", "the range of true rates consistent with an observed score"],
      ["multiple comparisons", "the inflated false-positive rate from running many tests"],
      ["effect size", "how large a difference is, separately from whether it is detectable"],
    ],
    opening:
      "Two models scoring eighty-two and eighty-four and a half percent on a thousand items may be indistinguishable. Whether they are is arithmetic, not judgement.",
    outcome:
      "You will attach intervals to scores, decide whether a gap is real, and correct a threshold for the number of comparisons made.",
    why:
      "Most reported model comparisons run many benchmarks and report the wins. Without a correction, some of those wins are guaranteed to be noise.",
    mentalModel:
      "Picture each score as a band rather than a point. Overlapping bands mean the ranking between them is not established by this evaluation.",
    firstTitle: "Every score is a band",
    firstIntro:
      "The interval narrows with the square root of the sample. Quadrupling the evaluation set halves the width.",
    firstCode: `import math

def interval(correct, total, z=1.959964):
    proportion = correct / total
    denominator = 1 + z * z / total
    centre = (proportion + z * z / (2 * total)) / denominator
    half = z * math.sqrt(proportion * (1 - proportion) / total
                         + z * z / (4 * total * total)) / denominator
    return (round(centre - half, 4), round(centre + half, 4))

for size in (50, 200, 1000, 10000):
    low, high = interval(int(0.8 * size), size)
    print(size, "items ->", (low, high), "width", round(high - low, 4))`,
    firstTrace:
      "A width of point two two at fifty items and point zero one six at ten thousand. A score with no sample size attached is not a measurement.",
    secondTitle: "Is the gap real",
    secondIntro:
      "Compare the intervals of two models. The same two point five point gap is inconclusive at one thousand items and clear at ten thousand.",
    secondCode: `def overlaps(a, b):
    return not (a[1] < b[0] or b[1] < a[0])

small = (interval(820, 1000), interval(845, 1000))
large = (interval(8200, 10000), interval(8450, 10000))
print("at 1k ", small, "overlap:", overlaps(*small))
print("at 10k", large, "overlap:", overlaps(*large))

for tests in (1, 5, 20, 100):
    print(tests, "tests -> threshold", round(0.05 / tests, 5))`,
    secondTrace:
      "The intervals overlap at a thousand items and separate at ten thousand. And with twenty benchmarks the threshold has to tighten from five percent to a quarter of one.",
    mistake:
      "Running a model on twenty benchmarks and reporting the three it won. At the usual threshold one of those wins is expected by chance, so the comparison count has to be declared alongside the results.",
    checkpoint:
      "Two models differ by two and a half points on a thousand items. Is one better?",
    checkpointAnswer:
      "Not established. The intervals overlap at that sample size, so the evaluation does not distinguish them.",
    remember:
      "Bands not points, and correct for how many comparisons you made.",
    checks: [
      {
        prompt: "How does interval width scale with the sample size?",
        options: [
          "With the reciprocal square root",
          "Inversely",
          "It does not depend on it",
        ],
        answerIndex: 0,
        hint: "Quadrupling the sample halves the width.",
        explanations: [
          "Correct. Precision is expensive.",
          "That would make large samples cheaper than they are.",
          "Sample size is the dominant factor.",
        ],
      },
      {
        prompt: "Two models' intervals overlap. What follows?",
        options: [
          "This evaluation does not establish a ranking",
          "The models are equal",
          "The evaluation is invalid",
        ],
        answerIndex: 0,
        hint: "Absence of evidence is not evidence of absence.",
        explanations: [
          "Correct. A larger sample might separate them.",
          "Equality is not demonstrated either.",
          "The evaluation is fine; it is just underpowered.",
        ],
      },
      {
        prompt: "Twenty benchmarks are run and three wins reported. What is missing?",
        options: [
          "A correction for the number of comparisons",
          "A larger model",
          "More benchmarks",
        ],
        answerIndex: 0,
        hint: "Some wins are expected by chance.",
        explanations: [
          "Correct. The threshold tightens to a quarter of a percent.",
          "Model size is not the issue.",
          "More comparisons make it worse.",
        ],
      },
    ],
  },
];

export const ML_LLM_EVALUATION_ATOMS = ML_LLM_EVALUATION_SPECS.map(guidedMasteryAtom);
export const ML_LLM_EVALUATION_CONCEPTS = ML_LLM_EVALUATION_SPECS.map(guidedMasteryConcept);
export const ML_LLM_EVALUATION_LESSON_CONTENT = guidedLessonContent(ML_LLM_EVALUATION_SPECS);

import {
  guidedLessonContent,
  guidedMasteryAtom,
  guidedMasteryConcept,
  type GuidedMasterySpec,
} from "./guidedMastery";

const ML_RESEARCH_SPECS: GuidedMasterySpec[] = [
  {
    lessonId: "py.mc.m10_1.l1",
    atomId: "py.atom.ml.reading-reproduction",
    conceptId: "py.ml.reading-reproduction",
    title: "Reading and reproduction",
    requires: ["py.ml.evaluation-statistics"],
    vocabulary: [
      ["load-bearing claim", "an assertion the paper's conclusion depends on"],
      ["implicit assumption", "something the result requires but the paper never states"],
      ["reproduction gap", "the difference between the reported result and the one you obtain"],
    ],
    opening:
      "Reading a paper for its method is the easy half. Reading it for the claims it needs but never establishes is where the work is.",
    outcome:
      "You will separate stated claims from implicit ones and size a reproduction gap against the difference being claimed.",
    why:
      "A gap smaller than the paper's own headline improvement means you have not reproduced anything, however close the number looks.",
    mentalModel:
      "Picture the conclusion resting on a stack of claims. Some are supported by a table, and some are load-bearing but never mentioned.",
    firstTitle: "Which claims have evidence",
    firstIntro:
      "List every assertion the conclusion needs, then attach the table or section supporting it. The ones left empty are the risk.",
    firstCode: `claims = [
    ("headline", "beats baseline by 3.2 points", "table 2"),
    ("implicit", "baseline was tuned as carefully", None),
    ("implicit", "same compute budget for both", None),
    ("stated", "five seeds per configuration", "section 4.1"),
]

unsupported = [text for _, text, evidence in claims if evidence is None]
print("claims", len(claims), "unsupported", len(unsupported))
for text in unsupported:
    print("  -", text)`,
    firstTrace:
      "Two of four claims have no evidence, and both are about the baseline. If the baseline was tuned less carefully, the headline number measures effort rather than method.",
    secondTitle: "Sizing the gap",
    secondIntro:
      "Compare your reproduction against the reported number, and then against the improvement the paper claims. The second comparison is the one that matters.",
    secondCode: `def gap(reported, reproduced):
    absolute = reported - reproduced
    return round(absolute, 4), round(absolute / reported * 100, 1)

for reproduced in (0.829, 0.798, 0.741):
    print(0.832, reproduced, gap(0.832, reproduced))`,
    secondTrace:
      "Gaps of point four, four and eleven percent. Against a claimed improvement of three point two points, only the first reproduction supports the paper's conclusion.",
    mistake:
      "Reproducing the proposed method and taking the baseline number from the paper. The comparison then inherits every unstated choice about how that baseline was run, which is exactly what the implicit claims were about.",
    checkpoint:
      "Your reproduction lands four percent short of the reported score. Have you reproduced the result?",
    checkpointAnswer:
      "Not if the claimed improvement is smaller than four percent. The gap has to be small relative to the effect being claimed, not relative to the score.",
    remember:
      "Find the unstated claims, and rebuild the baseline yourself.",
    checks: [
      {
        prompt: "Which claims are the risky ones?",
        options: [
          "Those the conclusion needs but the paper never establishes",
          "The headline result",
          "Claims in the abstract",
        ],
        answerIndex: 0,
        hint: "Look for what has no table behind it.",
        explanations: [
          "Correct. They are load-bearing and unexamined.",
          "That is usually the best-evidenced claim.",
          "Location does not determine support.",
        ],
      },
      {
        prompt: "What should a reproduction gap be compared against?",
        options: [
          "The improvement the paper claims",
          "The absolute score",
          "The baseline score",
        ],
        answerIndex: 0,
        hint: "A gap larger than the effect swamps it.",
        explanations: [
          "Correct. Otherwise the comparison is meaningless.",
          "A four percent gap can dwarf a two percent effect.",
          "The claim is about the difference.",
        ],
      },
      {
        prompt: "Why rebuild the baseline rather than cite it?",
        options: [
          "A cited baseline carries every unstated choice about how it was run",
          "It is faster",
          "The paper's number may be mistyped",
        ],
        answerIndex: 0,
        hint: "That is what the implicit claims were about.",
        explanations: [
          "Correct. Tuning effort is the usual confound.",
          "Rebuilding is slower.",
          "Typos are the least of it.",
        ],
      },
    ],
  },
  {
    lessonId: "py.mc.m10_1.l2",
    atomId: "py.atom.ml.ablations-controls",
    conceptId: "py.ml.ablations-controls",
    title: "Experiments, ablations, and controls",
    requires: ["py.ml.reading-reproduction"],
    vocabulary: [
      ["ablation", "removing one component to measure its contribution"],
      ["interaction", "the amount by which two components together differ from the sum of their effects"],
      ["control", "a variant isolating one change with everything else held fixed"],
    ],
    opening:
      "A method with three new pieces and one improved number tells you nothing about which piece did the work, or whether all three were needed.",
    outcome:
      "You will measure each component alone and together, and compute the interaction the individual numbers hide.",
    why:
      "Components that overlap in what they fix add far less together than apart, and only the joint run reveals it.",
    mentalModel:
      "Picture two fixes for partly the same problem. Each helps on its own, and applying both helps less than the sum, because they were repairing the same failures.",
    firstTitle: "One change at a time",
    firstIntro:
      "Run the base, each component alone, and both together. Four runs answer a question the single headline number cannot.",
    firstCode: `runs = {("base",): 0.741, ("base", "A"): 0.769,
        ("base", "B"): 0.752, ("base", "A", "B"): 0.774}

base = runs[("base",)]
for combination, score in runs.items():
    if combination != ("base",):
        print(combination, "delta", round(score - base, 4))`,
    firstTrace:
      "Component A adds twenty-eight thousandths, B adds eleven, and the pair adds thirty-three. The pair is worth less than the two separately.",
    secondTitle: "The interaction",
    secondIntro:
      "Subtract the sum of the individual gains from the joint gain. A negative value means the components were fixing overlapping problems.",
    secondCode: `a = runs[("base", "A")] - base
b = runs[("base", "B")] - base
joint = runs[("base", "A", "B")] - base

print("sum of singles", round(a + b, 4))
print("joint", round(joint, 4))
print("interaction", round(joint - (a + b), 4))`,
    secondTrace:
      "Minus six thousandths. Component B is contributing almost nothing once A is present, which is invisible from the single-component runs alone.",
    mistake:
      "Ablating by removing a component and leaving everything else unchanged, including the hyperparameters tuned for its presence. The ablation then measures a badly configured model rather than the component's contribution.",
    checkpoint:
      "Two components add three and one points alone and three and a half together. What follows?",
    checkpointAnswer:
      "They overlap. The second is contributing about half a point once the first is present, so its standalone number overstates its value.",
    remember:
      "Run the components alone and together; the difference is the interaction.",
    checks: [
      {
        prompt: "What does a negative interaction mean?",
        options: [
          "The components fix overlapping problems",
          "One component is harmful",
          "The measurement is wrong",
        ],
        answerIndex: 0,
        hint: "Together they add less than the sum of their parts.",
        explanations: [
          "Correct. The second adds little once the first is present.",
          "Both helped individually.",
          "It is a real and common effect.",
        ],
      },
      {
        prompt: "How many runs measure two components properly?",
        options: ["Four", "Two", "Three"],
        answerIndex: 0,
        hint: "Base, each alone, and both.",
        explanations: [
          "Correct. Three misses the interaction.",
          "That gives no base to compare against.",
          "The joint run is what reveals the overlap.",
        ],
      },
      {
        prompt: "What must be re-tuned when ablating a component?",
        options: [
          "The hyperparameters that were tuned for its presence",
          "Nothing",
          "The evaluation set",
        ],
        answerIndex: 0,
        hint: "Otherwise the ablation measures a misconfigured model.",
        explanations: [
          "Correct, and this is the most common ablation error.",
          "Leaving them fixed confounds the result.",
          "The evaluation must stay fixed.",
        ],
      },
    ],
  },
  {
    lessonId: "py.mc.m10_1.l3",
    atomId: "py.atom.ml.statistical-rigor",
    conceptId: "py.ml.statistical-rigor",
    title: "Statistical rigor",
    requires: ["py.ml.ablations-controls"],
    vocabulary: [
      ["seed variance", "the spread of results from re-running with a different random seed"],
      ["standard error", "the expected variability of a mean, given the sample"],
      ["cherry-picking", "reporting the best run rather than the distribution"],
    ],
    opening:
      "A single run is a sample from a distribution you have not measured. Two methods with overlapping distributions can be ranked either way by choosing which seed to report.",
    outcome:
      "You will compare two methods across seeds and see how much the ranking depends on reporting the mean rather than the best.",
    why:
      "Seed variance in deep learning is routinely as large as the improvements being claimed, so a single-run comparison establishes nothing.",
    mentalModel:
      "Picture two overlapping clouds of results. The honest comparison is between their centres; picking one point from each can put either ahead.",
    firstTitle: "Measure the spread",
    firstIntro:
      "Run each method several times with different seeds. The spread within a method is what the difference between methods has to beat.",
    firstCode: `import statistics

a = [0.812, 0.829, 0.805, 0.834, 0.818]
b = [0.826, 0.841, 0.822, 0.848, 0.831]

for name, scores in [("A", a), ("B", b)]:
    print(name, "mean", round(statistics.mean(scores), 4),
          "sd", round(statistics.stdev(scores), 4))`,
    firstTrace:
      "Means of point eight two and point eight three four, with standard deviations near point zero one one. The within-method spread is comparable to the between-method gap.",
    secondTitle: "How the report is chosen",
    secondIntro:
      "Compare the honest difference of means against the difference you get by picking the best of one and the worst of the other.",
    secondCode: `import math, statistics

gap = statistics.mean(b) - statistics.mean(a)
error = math.sqrt(statistics.variance(a) / len(a)
                  + statistics.variance(b) / len(b))

print("mean gap", round(gap, 4))
print("standard error", round(error, 5))
print("ratio", round(gap / error, 3))
print("best of B minus worst of A", round(max(b) - min(a), 4))`,
    secondTrace:
      "An honest gap of fourteen thousandths against a cherry-picked forty-three. The favourable comparison is three times the real effect.",
    mistake:
      "Reporting a mean over seeds for the proposed method and a single run for the baseline. That is the same cherry-pick with extra steps, and it is very common.",
    checkpoint:
      "Two methods differ by fourteen thousandths with a standard error of seven. Is the difference established?",
    checkpointAnswer:
      "Weakly at best. A ratio near two is borderline, and five seeds is a small sample on which to rest a claim.",
    remember:
      "Report the spread, and use the same seed count on both sides.",
    checks: [
      {
        prompt: "Why is a single-run comparison insufficient?",
        options: [
          "Seed variance is often as large as the claimed improvement",
          "Single runs are slower",
          "Random seeds are not reproducible",
        ],
        answerIndex: 0,
        hint: "Compare the within-method spread to the between-method gap.",
        explanations: [
          "Correct. The comparison establishes nothing.",
          "A single run is the fastest option.",
          "Seeds are perfectly reproducible.",
        ],
      },
      {
        prompt: "What does the standard error describe?",
        options: [
          "How variable the mean itself is",
          "The spread of individual runs",
          "The measurement precision",
        ],
        answerIndex: 0,
        hint: "It shrinks as the seed count grows.",
        explanations: [
          "Correct, which is why more seeds sharpen the comparison.",
          "That is the standard deviation.",
          "Precision of the metric is separate.",
        ],
      },
      {
        prompt: "A paper reports a mean over seeds for its method and one run for the baseline. What is that?",
        options: [
          "Cherry-picking with extra steps",
          "Acceptable practice",
          "A power calculation",
        ],
        answerIndex: 0,
        hint: "The two sides are not measured the same way.",
        explanations: [
          "Correct. Both sides need the same treatment.",
          "It systematically favours the method.",
          "No power analysis is involved.",
        ],
      },
    ],
  },
  {
    lessonId: "py.mc.m10_1.l4",
    atomId: "py.atom.ml.research-communication",
    conceptId: "py.ml.research-communication",
    title: "Research communication",
    requires: ["py.ml.statistical-rigor"],
    vocabulary: [
      ["independently checkable", "a claim a reader can verify without asking the authors"],
      ["variance reporting", "publishing spread and sample size alongside every mean"],
      ["negative result", "an experiment that did not support the hypothesis"],
    ],
    opening:
      "A table of bare numbers asks the reader to trust you. A table with spreads and sample sizes lets them check you, which is a different and better thing to ask.",
    outcome:
      "You will audit a results table for what it does not report, and quantify the inflation from reporting a best run.",
    why:
      "Most of what makes a result trustworthy is information the author had and chose whether to include.",
    mentalModel:
      "Picture the reader trying to decide whether to build on your result. Every number without a spread is one they cannot evaluate.",
    firstTitle: "What the table omits",
    firstIntro:
      "Check each row for a spread and a sample size. A row missing either is a number the reader cannot interpret.",
    firstCode: `rows = [("ours", 0.832, 0.011, 5),
        ("baseline", 0.798, None, None)]

for name, mean, spread, count in rows:
    if spread is None:
        print(name + ": no variance reported")
    if count is None:
        print(name + ": no sample size")`,
    firstTrace:
      "The proposed method reports both and the baseline reports neither. A reader cannot tell whether the gap exceeds the noise, which is the only question that matters.",
    secondTitle: "The cost of reporting the best",
    secondIntro:
      "Compare the best run against the mean over the same runs. That difference is what a best-run report silently adds.",
    secondCode: `runs = [0.826, 0.841, 0.822, 0.848, 0.831]
best = max(runs)
mean = sum(runs) / len(runs)

print("best", best, "mean", round(mean, 4))
print("inflation", round(best - mean, 4))`,
    secondTrace:
      "Fourteen thousandths of free improvement from the choice of which number to print. That is comparable to the effect most papers report.",
    mistake:
      "Omitting the experiments that did not work. A method described only by its successes cannot be applied by anyone else, because they have no way to know which of their failures are expected.",
    checkpoint:
      "A results table reports means with no spreads. What can a reader conclude?",
    checkpointAnswer:
      "Very little. Without spread and sample size there is no way to tell whether the difference exceeds the run-to-run noise.",
    remember:
      "Spread, sample size, and the experiments that failed.",
    checks: [
      {
        prompt: "What makes a table independently checkable?",
        options: [
          "Spread and sample size alongside every mean",
          "More decimal places",
          "A larger font",
        ],
        answerIndex: 0,
        hint: "The reader needs to compare the gap to the noise.",
        explanations: [
          "Correct. Without them a mean cannot be interpreted.",
          "Precision is not the same as information.",
          "Presentation is not the issue.",
        ],
      },
      {
        prompt: "How much can reporting the best run inflate a result?",
        options: [
          "By about as much as a typical claimed improvement",
          "Negligibly",
          "By an order of magnitude",
        ],
        answerIndex: 0,
        hint: "Compare the best to the mean over the same runs.",
        explanations: [
          "Correct, which is why it matters so much.",
          "Fourteen thousandths is not negligible here.",
          "It is comparable, not tenfold.",
        ],
      },
      {
        prompt: "Why report experiments that did not work?",
        options: [
          "Otherwise readers cannot tell which of their failures are expected",
          "To fill space",
          "Because reviewers require it",
        ],
        answerIndex: 0,
        hint: "Think about someone trying to apply the method.",
        explanations: [
          "Correct. It is what makes the method usable.",
          "It is substantive information.",
          "Most venues do not require it.",
        ],
      },
    ],
  },
  {
    lessonId: "py.mc.m10_1.l5",
    atomId: "py.atom.ml.compute-aware-iteration",
    conceptId: "py.ml.compute-aware-iteration",
    title: "Compute-aware iteration",
    requires: ["py.ml.research-communication"],
    vocabulary: [
      ["search budget", "the total number of runs available"],
      ["grid coverage", "the fraction of a grid a budget can actually visit"],
      ["information per run", "how much a run narrows the space of remaining hypotheses"],
    ],
    opening:
      "A fixed budget of runs buys a fixed amount of information. Spending it on a grid that the budget cannot cover buys almost none.",
    outcome:
      "You will compute what fraction of a search space a budget reaches, and allocate between cheap and expensive runs.",
    why:
      "Research throughput is set by how much each experiment narrows the space, not by how many experiments are run.",
    mentalModel:
      "Picture the search space growing exponentially with the number of knobs while the budget grows not at all. Past a few dimensions the grid is a formality.",
    firstTitle: "Grids stop working fast",
    firstIntro:
      "Five values on each of a few axes is already more configurations than most budgets can reach. Compute the coverage before designing the sweep.",
    firstCode: `for dimensions in (2, 4, 6):
    grid = 5 ** dimensions
    coverage = 40 / grid * 100
    print(dimensions, "dimensions grid", grid,
          "budget 40 covers", round(coverage, 2), "percent")`,
    firstTrace:
      "Forty runs cover a two-dimensional grid outright and a quarter of a percent of a six-dimensional one. Beyond three axes a grid is not a search.",
    secondTitle: "Cheap runs buy the direction",
    secondIntro:
      "Small runs are for finding which direction to move; large runs are for confirming it. The split decides how many of each you get.",
    secondCode: `budget = 1000
for share in (0.5, 0.8, 0.95):
    small = int(budget * share / 1)
    large = int(budget * (1 - share) / 50)
    print("share", share, "->", small, "small runs and",
          large, "large runs")`,
    secondTrace:
      "Eighty percent to small runs buys eight hundred cheap experiments and three expensive confirmations. Ninety-five percent leaves only one confirmation, which cannot be checked against anything.",
    mistake:
      "Assuming a hyperparameter ranking found at small scale holds at large scale. Several choices reverse with scale, so the confirmation runs are not a formality - they are the experiment.",
    checkpoint:
      "A sweep has six hyperparameters and a budget of forty runs. Is a grid appropriate?",
    checkpointAnswer:
      "No. Forty runs reach a quarter of a percent of that grid, so the result reflects which corner was sampled rather than the space.",
    remember:
      "Check the coverage first, then split between cheap and confirming runs.",
    checks: [
      {
        prompt: "How does grid size grow with the number of hyperparameters?",
        options: ["Exponentially", "Linearly", "With the square"],
        answerIndex: 0,
        hint: "Each axis multiplies the total.",
        explanations: [
          "Correct, which is why grids fail past a few axes.",
          "Each new axis multiplies rather than adds.",
          "The growth is far faster than quadratic.",
        ],
      },
      {
        prompt: "What are small runs for?",
        options: [
          "Finding which direction to move",
          "Confirming the final result",
          "Reporting in the paper",
        ],
        answerIndex: 0,
        hint: "They are cheap and numerous.",
        explanations: [
          "Correct, and large runs confirm the direction.",
          "That is what the expensive runs are for.",
          "Confirmations are what get reported.",
        ],
      },
      {
        prompt: "Why are the confirmation runs not a formality?",
        options: [
          "Some hyperparameter rankings reverse with scale",
          "They are cheaper",
          "They use different data",
        ],
        answerIndex: 0,
        hint: "Small-scale conclusions do not always transfer.",
        explanations: [
          "Correct. That reversal is the thing being tested.",
          "They are the expensive ones.",
          "The data is usually the same.",
        ],
      },
    ],
  },
];

export const ML_RESEARCH_ATOMS = ML_RESEARCH_SPECS.map(guidedMasteryAtom);
export const ML_RESEARCH_CONCEPTS = ML_RESEARCH_SPECS.map(guidedMasteryConcept);
export const ML_RESEARCH_LESSON_CONTENT = guidedLessonContent(ML_RESEARCH_SPECS);

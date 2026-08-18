import {
  guidedLessonContent,
  guidedMasteryAtom,
  guidedMasteryConcept,
  type GuidedMasterySpec,
} from "./guidedMastery";

const ML_ADVANCED_RL_SPECS: GuidedMasterySpec[] = [
  {
    lessonId: "py.mc.m13_2.l1",
    atomId: "py.atom.ml.offline-rl",
    conceptId: "py.ml.offline-rl",
    title: "Offline RL",
    requires: ["py.ml.agent-evaluation"],
    vocabulary: [
      ["behaviour data", "a fixed dataset of actions someone else already took"],
      ["support", "how well an action is covered by the data"],
      ["conservative estimate", "a value deliberately reduced where the data is thin"],
    ],
    opening:
      "Learning from a fixed dataset removes the ability to try anything. The failure that follows is specific: the model becomes most confident exactly where it has least evidence.",
    outcome:
      "You will penalise value estimates by how poorly supported an action is and see the unsupported ones go negative.",
    why:
      "An unconstrained estimate extrapolates into actions the data never contains, and the optimiser then selects precisely those.",
    mentalModel:
      "Picture the data covering part of the action space. Outside it the estimate is a guess, and the optimiser is drawn to whichever guess is highest.",
    firstTitle: "Penalise thin support",
    firstIntro:
      "Subtract a penalty proportional to how far the action is from what the data covers. Well-supported actions keep their estimate.",
    firstCode: `def conservative(estimated, support, penalty):
    return round(estimated - penalty * (1 - support), 4)

for support in (1.0, 0.7, 0.2, 0.0):
    print("support", support, "naive 8.0 ->",
          conservative(8.0, support, 10.0))`,
    firstTrace:
      "Eight where the data is complete, down to minus two where it covers nothing. The penalty makes the unsupported action less attractive than doing nothing.",
    secondTitle: "Why the optimiser needs stopping",
    secondIntro:
      "Without the penalty the highest estimate is often the least supported, because errors are largest where evidence is thinnest.",
    secondCode: `actions = [("common", 6.0, 0.95), ("rare", 7.5, 0.30),
           ("never seen", 9.0, 0.02)]

print("naive best     ", max(actions, key=lambda a: a[1])[0])
print("conservative best",
      max(actions, key=lambda a: conservative(a[1], a[2], 10.0))[0])`,
    secondTrace:
      "The naive rule picks the action nobody has ever taken. The conservative one picks the common action, which is the only one the data can support.",
    mistake:
      "Evaluating an offline policy on the same fixed dataset. The dataset contains only the behaviour policy's actions, so it cannot say what happens when the new policy does something different.",
    checkpoint:
      "Why does an unconstrained offline estimate favour unseen actions?",
    checkpointAnswer:
      "Estimation error is largest where data is thinnest, so the highest estimates land on the least supported actions and the optimiser selects them.",
    remember:
      "Penalise by support, or the optimiser finds the gaps.",
    checks: [
      {
        prompt: "What is the characteristic offline failure?",
        options: [
          "Confidence is highest where evidence is thinnest",
          "The model underfits",
          "Rewards are miscalculated",
        ],
        answerIndex: 0,
        hint: "Think about where estimation error is largest.",
        explanations: [
          "Correct, and the optimiser then selects those actions.",
          "Underfitting is a different problem.",
          "The rewards in the data are fine.",
        ],
      },
      {
        prompt: "What does the conservative penalty depend on?",
        options: [
          "How well the data covers the action",
          "The reward magnitude",
          "The policy's entropy",
        ],
        answerIndex: 0,
        hint: "It shrinks the estimate where support is thin.",
        explanations: [
          "Correct. Full support means no penalty.",
          "Magnitude is not the criterion.",
          "Entropy is a separate regulariser.",
        ],
      },
      {
        prompt: "Can an offline policy be evaluated on its training dataset?",
        options: [
          "No; the data contains only the behaviour policy's actions",
          "Yes, if it is large",
          "Yes, with cross-validation",
        ],
        answerIndex: 0,
        hint: "The new policy does different things.",
        explanations: [
          "Correct. Its actions are exactly what is missing.",
          "Size does not add unseen actions.",
          "Splitting the same distribution does not help.",
        ],
      },
    ],
  },
  {
    lessonId: "py.mc.m13_2.l2",
    atomId: "py.atom.ml.self-play",
    conceptId: "py.ml.self-play",
    title: "Multi-agent RL and self-play",
    requires: ["py.ml.offline-rl"],
    vocabulary: [
      ["non-stationarity", "the environment changing because the other agents are learning too"],
      ["exploitability", "how much a best response can beat a strategy"],
      ["population diversity", "how many genuinely different strategies the pool contains"],
    ],
    opening:
      "In self-play the opponent improves as you do, so a rising win rate says nothing. What matters is how much a fresh opponent could beat you.",
    outcome:
      "You will measure exploitability against a pool and see a narrow population hide a badly beatable strategy.",
    why:
      "A strategy that wins constantly against itself can lose overwhelmingly to anything outside its training distribution.",
    mentalModel:
      "Picture a pool of opponents. A strategy is only as robust as the most different opponent that has ever tested it.",
    firstTitle: "Exploitability, not win rate",
    firstIntro:
      "Take the best counter available and see how far above even it scores. A small gap means the strategy is hard to beat.",
    firstCode: `def exploitability(strategy_score, counters):
    return round(max(counters.values()) - strategy_score, 4)

print("broad pool ", exploitability(0.5, {"a": 0.52, "b": 0.51}))
print("narrow pool", exploitability(0.5, {"a": 0.93}))`,
    firstTrace:
      "Two percent against forty-three. The second strategy also scored fifty percent in training, and one opponent takes it apart.",
    secondTitle: "Diversity is what tests it",
    secondIntro:
      "A pool of identical strategies tests one thing many times. Count distinct strategies rather than pool size.",
    secondCode: `def diversity(pool):
    return len(set(pool)), round(len(set(pool)) / len(pool), 3)

print("repetitive pool", diversity(["a", "a", "a", "b"]))
print("varied pool    ", diversity(["a", "b", "c", "d"]))`,
    secondTrace:
      "Two distinct strategies out of four against four out of four. The first pool looks the same size and tests half as much.",
    mistake:
      "Reading a rising self-play win rate as progress. Both sides improved, so the rate is roughly constant by construction and carries almost no information.",
    checkpoint:
      "A strategy wins half its self-play games and loses ninety-three percent to one new opponent. What does that mean?",
    checkpointAnswer:
      "It is highly exploitable. Its training pool never contained anything that tested it in that direction.",
    remember:
      "Measure exploitability against a diverse pool, not the win rate.",
    checks: [
      {
        prompt: "Why is a self-play win rate uninformative?",
        options: [
          "Both sides improve, so it stays near even by construction",
          "It is hard to measure",
          "Games are too short",
        ],
        answerIndex: 0,
        hint: "The opponent is learning too.",
        explanations: [
          "Correct. Exploitability is the informative measure.",
          "It is trivially measurable.",
          "Length is not the issue.",
        ],
      },
      {
        prompt: "What does exploitability measure?",
        options: [
          "How much the best available counter beats the strategy",
          "How often it wins",
          "How complex it is",
        ],
        answerIndex: 0,
        hint: "It looks for the worst case, not the average.",
        explanations: [
          "Correct. A small value means genuinely robust.",
          "Win rate is what it replaces.",
          "Complexity is unrelated.",
        ],
      },
      {
        prompt: "Why count distinct strategies rather than pool size?",
        options: [
          "A pool of duplicates tests one thing repeatedly",
          "Large pools are slow",
          "Duplicates bias the win rate",
        ],
        answerIndex: 0,
        hint: "Coverage, not count.",
        explanations: [
          "Correct. Diversity is what makes the test meaningful.",
          "Speed is not the concern.",
          "The bias is in coverage rather than the rate.",
        ],
      },
    ],
  },
  {
    lessonId: "py.mc.m13_2.l3",
    atomId: "py.atom.ml.world-models",
    conceptId: "py.ml.world-models",
    title: "Model-based RL and world models",
    requires: ["py.ml.self-play"],
    vocabulary: [
      ["dynamics model", "a learned predictor of what the environment does next"],
      ["rollout horizon", "how many steps a plan is simulated before acting"],
      ["compounding error", "prediction error accumulating as each step feeds the next"],
    ],
    opening:
      "Learning what the environment does lets you plan without touching it. The plan is only as good as the model, and the model's error grows with every simulated step.",
    outcome:
      "You will accumulate one-step error over a horizon and find where the plan stops being worth trusting.",
    why:
      "A one percent per-step error sounds negligible and becomes larger than the signal within a few dozen steps.",
    mentalModel:
      "Picture each simulated step starting from whatever the step before it produced. The error does not just persist; it feeds the next prediction.",
    firstTitle: "Error accumulates superlinearly",
    firstIntro:
      "Each step adds its own error on top of an already-wrong state, so the total grows faster than the step count.",
    firstCode: `def accumulated(step_error, horizon):
    total = 0.0
    for step in range(1, horizon + 1):
        total += step_error * step
    return round(total, 4)

for horizon in (1, 5, 20, 100):
    print("horizon", horizon, "accumulated error",
          accumulated(0.01, horizon))`,
    firstTrace:
      "One hundredth at a single step and fifty at a hundred. Twenty times the horizon gave two hundred times the error.",
    secondTitle: "Where the plan stops being usable",
    secondIntro:
      "Compare the accumulated error against the signal the plan is trying to detect. Beyond that crossing point the simulation is noise.",
    secondCode: `signal = 1.0
for horizon in (5, 10, 13, 15, 20):
    error = accumulated(0.01, horizon)
    print("horizon", horizon, "error", error,
          "usable" if error < signal else "dominated by error")`,
    secondTrace:
      "Usable through thirteen steps and dominated from fifteen. Short rollouts with frequent replanning beat one long confident plan.",
    mistake:
      "Improving the dynamics model to extend the horizon. Halving the per-step error only buys about a forty percent longer usable horizon, because the accumulation is quadratic.",
    checkpoint:
      "A dynamics model has one percent error per step. How far can you plan?",
    checkpointAnswer:
      "A little over a dozen steps before the accumulated error exceeds the signal. Beyond that the rollout is noise.",
    remember:
      "Short rollouts, replan often - the error compounds quadratically.",
    checks: [
      {
        prompt: "Why does rollout error grow faster than the step count?",
        options: [
          "Each step's error is added on top of an already-wrong state",
          "The model gets worse over time",
          "The environment changes",
        ],
        answerIndex: 0,
        hint: "Predictions feed the next prediction.",
        explanations: [
          "Correct. The accumulation is quadratic.",
          "The model is fixed during the rollout.",
          "The environment is not consulted during planning.",
        ],
      },
      {
        prompt: "Halving the per-step error extends the usable horizon by how much?",
        options: [
          "About forty percent",
          "Double",
          "Four times",
        ],
        answerIndex: 0,
        hint: "The accumulation is quadratic in the horizon.",
        explanations: [
          "Correct, which is why longer horizons are expensive to buy.",
          "That would be linear accumulation.",
          "Quadratic accumulation works against you here.",
        ],
      },
      {
        prompt: "What follows practically from compounding error?",
        options: [
          "Short rollouts with frequent replanning",
          "One long confident plan",
          "Ignoring the dynamics model",
        ],
        answerIndex: 0,
        hint: "Reset the state from reality often.",
        explanations: [
          "Correct. Each replan restarts from a true observation.",
          "That is exactly what the error forbids.",
          "The model is useful over short horizons.",
        ],
      },
    ],
  },
  {
    lessonId: "py.mc.m13_2.l4",
    atomId: "py.atom.ml.exploration-reward",
    conceptId: "py.ml.exploration-reward",
    title: "Exploration and reward modeling",
    requires: ["py.ml.world-models"],
    vocabulary: [
      ["optimism", "treating an untried option as promising until it is tested"],
      ["uncertainty bonus", "an addition to a value estimate reflecting how little is known"],
      ["reward misspecification", "a reward that is satisfiable in ways nobody intended"],
    ],
    opening:
      "An agent that only takes its current best action never learns whether something better exists. The fix is to add a bonus for not knowing.",
    outcome:
      "You will rank options by value plus an uncertainty bonus and see a rarely tried option outrank a well-tested one.",
    why:
      "The bonus shrinks as evidence accumulates, so exploration ends by itself rather than needing a schedule.",
    mentalModel:
      "Picture each option as a value plus a margin of ignorance. The margin shrinks each time the option is tried, so attention moves on.",
    firstTitle: "A bonus for not knowing",
    firstIntro:
      "Add a term that falls with the square root of how often the option was tried. An untried option is treated as unboundedly promising.",
    firstCode: `import math

def score(mean, tries, total, weight=2.0):
    if tries == 0:
        return float("inf")
    return round(mean + weight * math.sqrt(math.log(total) / tries), 4)

options = [("well tested", 0.62, 900), ("rarely tried", 0.55, 12),
           ("never tried", 0.0, 0)]
for name, mean, tries in options:
    print(f"{name:12}", score(mean, tries, 1000))`,
    firstTrace:
      "The rarely tried option outranks the well-tested one despite a lower average, and the untried one outranks everything. Ignorance is treated as opportunity.",
    secondTitle: "Exploration ends by itself",
    secondIntro:
      "Try the uncertain option repeatedly and watch its bonus shrink. No schedule is needed; the arithmetic retires it.",
    secondCode: `baseline = 0.90

for tries in (12, 100, 900):
    bonus = round(2.0 * math.sqrt(math.log(1000) / tries), 4)
    print("tries", tries, "bonus", bonus,
          "score", round(0.55 + bonus, 4),
          "still explored:", 0.55 + bonus > baseline)`,
    secondTrace:
      "The bonus falls from one point five to point one eight as evidence accumulates. By nine hundred tries the worse option no longer outranks the baseline and exploration stops.",
    mistake:
      "Adding an exploration bonus to a misspecified reward. The agent then explores harder to find the loopholes, so the bonus makes a reward-specification problem worse rather than better.",
    checkpoint:
      "Why does an uncertainty bonus not need a decay schedule?",
    checkpointAnswer:
      "It shrinks with the number of tries by construction, so exploration retires itself as evidence accumulates.",
    remember:
      "Bonus for ignorance, shrinking with evidence - and fix the reward first.",
    checks: [
      {
        prompt: "What does the uncertainty bonus depend on?",
        options: [
          "How many times the option has been tried",
          "The reward magnitude",
          "The number of options",
        ],
        answerIndex: 0,
        hint: "It falls as evidence accumulates.",
        explanations: [
          "Correct, which is why exploration ends by itself.",
          "Magnitude enters through the mean instead.",
          "The option count affects the total, not the bonus shape.",
        ],
      },
      {
        prompt: "Why is an untried option scored as infinitely promising?",
        options: [
          "Nothing is known about it, so it must be tested at least once",
          "It is likely to be best",
          "It costs nothing",
        ],
        answerIndex: 0,
        hint: "The bonus is unbounded at zero tries.",
        explanations: [
          "Correct. Every option gets one trial before ranking means anything.",
          "There is no reason to believe that.",
          "Trying it costs a step.",
        ],
      },
      {
        prompt: "What does an exploration bonus do to a misspecified reward?",
        options: [
          "It makes the problem worse by finding loopholes faster",
          "It corrects the specification",
          "It has no effect",
        ],
        answerIndex: 0,
        hint: "Exploration searches harder.",
        explanations: [
          "Correct. Fix the reward before adding exploration.",
          "Nothing about the bonus repairs a reward.",
          "It actively accelerates the failure.",
        ],
      },
    ],
  },
];

export const ML_ADVANCED_RL_ATOMS = ML_ADVANCED_RL_SPECS.map(guidedMasteryAtom);
export const ML_ADVANCED_RL_CONCEPTS = ML_ADVANCED_RL_SPECS.map(guidedMasteryConcept);
export const ML_ADVANCED_RL_LESSON_CONTENT = guidedLessonContent(ML_ADVANCED_RL_SPECS);

import {
  guidedLessonContent,
  guidedMasteryAtom,
  guidedMasteryConcept,
  type GuidedMasterySpec,
} from "./guidedMastery";

const ML_CAUSAL_SPECS: GuidedMasterySpec[] = [
  {
    lessonId: "py.mc.m11_5.l1",
    atomId: "py.atom.ml.causal-graphs",
    conceptId: "py.ml.causal-graphs",
    title: "Causal graphs and interventions",
    requires: ["py.ml.bayesian-optimization"],
    vocabulary: [
      ["observing", "conditioning on a variable taking a value you happened to see"],
      ["intervening", "setting a variable, which severs whatever used to determine it"],
      ["edge severing", "removing a node's incoming edges when it is set rather than observed"],
    ],
    opening:
      "Seeing that the ground is wet tells you a great deal about the sky. Wetting the ground yourself tells you nothing about it, and no amount of data distinguishes the two.",
    outcome:
      "You will compute an observational conditional and see what setting a variable does to the graph instead.",
    why:
      "Every deployment decision is an intervention. A model fitted on observation answers a different question from the one being asked of it.",
    mentalModel:
      "Picture the arrows into a variable as the things that decide it. Setting the variable yourself replaces all of them, so those arrows disappear.",
    firstTitle: "Observing propagates backward",
    firstIntro:
      "Conditioning on a downstream variable changes what you believe about its causes. That is ordinary probability and it is not causal.",
    firstCode: `joint = {("dry", "clean"): 0.36, ("dry", "wet"): 0.04,
         ("rain", "clean"): 0.06, ("rain", "wet"): 0.54}

def marginal(joint):
    return {sky: round(sum(p for state, p in joint.items()
                           if state[0] == sky), 4)
            for sky in ("dry", "rain")}

def observe_ground(joint, value):
    total = sum(p for state, p in joint.items() if state[1] == value)
    return {state[0]: round(p / total, 4)
            for state, p in joint.items() if state[1] == value}

print("P(sky)             ", marginal(joint))
print("P(sky | ground wet)", observe_ground(joint, "wet"))`,
    firstTrace:
      "Rain goes from sixty percent to ninety-three once the ground is seen to be wet. The observation was informative about a cause.",
    secondTitle: "Intervening cuts the arrows",
    secondIntro:
      "Setting the ground wet replaces whatever used to determine it. The graph loses those edges, and the belief about the sky stops moving.",
    secondCode: `parents = {"sky": [], "ground": ["sky"], "slippery": ["ground"]}
print("parents of ground, observed:", parents["ground"])

intervened = dict(parents, ground=[])
print("parents of ground, set     :", intervened["ground"])
print("sky still informed by ground:", bool(intervened["ground"]))`,
    secondTrace:
      "The incoming edge is gone. Wetting the ground still makes it slippery, and it tells you nothing at all about the weather.",
    mistake:
      "Fitting a model on observational data and deploying it to choose actions. It learned what accompanies an outcome, and you are asking it what causes one.",
    checkpoint:
      "What is the difference between observing a variable and setting it?",
    checkpointAnswer:
      "Observing conditions on it and updates beliefs about its causes. Setting it removes its incoming edges, so its causes are unaffected.",
    remember:
      "Setting a variable severs whatever used to determine it.",
    checks: [
      {
        prompt: "What does intervening on a variable do to the graph?",
        options: [
          "Removes its incoming edges",
          "Removes its outgoing edges",
          "Nothing",
        ],
        answerIndex: 0,
        hint: "You replace whatever used to decide it.",
        explanations: [
          "Correct. Its effects still propagate forward.",
          "The effects are exactly what you want to measure.",
          "That is what makes it different from observing.",
        ],
      },
      {
        prompt: "A model is fitted on observational data and used to choose actions. What is wrong?",
        options: [
          "It learned what accompanies an outcome, not what causes one",
          "It has too few parameters",
          "It needs more data",
        ],
        answerIndex: 0,
        hint: "Actions are interventions.",
        explanations: [
          "Correct, and more data does not fix it.",
          "Capacity is not the issue.",
          "No amount of observational data answers the question.",
        ],
      },
      {
        prompt: "After setting the ground wet, what does it tell you about the sky?",
        options: ["Nothing", "That it rained", "That it was dry"],
        answerIndex: 0,
        hint: "The edge from sky to ground is gone.",
        explanations: [
          "Correct. You supplied the wetness yourself.",
          "That is the observational answer.",
          "Neither direction is informed.",
        ],
      },
    ],
  },
  {
    lessonId: "py.mc.m11_5.l2",
    atomId: "py.atom.ml.confounding",
    conceptId: "py.ml.confounding",
    title: "Confounding and adjustment",
    requires: ["py.ml.causal-graphs"],
    vocabulary: [
      ["confounder", "a variable causing both the treatment and the outcome"],
      ["stratification", "computing the effect within each level and combining the results"],
      ["collider", "a variable caused by two others, which conditioning on creates a false link"],
    ],
    opening:
      "A treatment given more often to healthier people looks effective whether or not it is. Splitting by the thing that decided who got it is what separates them.",
    outcome:
      "You will compute a crude difference, then the same effect within strata, and watch most of it disappear.",
    why:
      "Almost every observational claim about an effect is this arithmetic. Whether the adjustment set is right is the whole argument.",
    mentalModel:
      "Picture a variable pushing both who gets treated and who does well. The crude comparison credits the treatment with that variable's work.",
    firstTitle: "The crude comparison",
    firstIntro:
      "Compare treated against untreated directly. The number is real and it is not the treatment effect.",
    firstCode: `rows = ([{"c": 1, "t": 1, "y": 0.9}] * 80
        + [{"c": 1, "t": 0, "y": 0.8}] * 20
        + [{"c": 0, "t": 1, "y": 0.4}] * 20
        + [{"c": 0, "t": 0, "y": 0.3}] * 80)

def crude(rows):
    treated = [r["y"] for r in rows if r["t"] == 1]
    control = [r["y"] for r in rows if r["t"] == 0]
    return round(sum(treated) / len(treated)
                 - sum(control) / len(control), 4)

print("crude difference", crude(rows))`,
    firstTrace:
      "Four tenths. The treated group did far better, and eighty percent of them came from the favourable stratum.",
    secondTitle: "Adjusting for the confounder",
    secondIntro:
      "Compute the effect inside each level of the confounder, then combine those weighted by how common each level is.",
    secondCode: `def adjusted(rows, key):
    total, weight = 0.0, 0
    for level in sorted({r[key] for r in rows}):
        stratum = [r for r in rows if r[key] == level]
        treated = [r["y"] for r in stratum if r["t"] == 1]
        control = [r["y"] for r in stratum if r["t"] == 0]
        if treated and control:
            effect = (sum(treated) / len(treated)
                      - sum(control) / len(control))
            total += effect * len(stratum)
            weight += len(stratum)
    return round(total / weight, 4)

print("adjusted for c  ", adjusted(rows, "c"))`,
    secondTrace:
      "One tenth. Three quarters of the crude difference was the confounder, and the same rows produce both numbers.",
    mistake:
      "Adjusting for everything measured. Conditioning on a variable caused by both the treatment and the outcome creates a dependence that was not there, so a longer adjustment list can be worse than a shorter one.",
    checkpoint:
      "Why can adding a variable to the adjustment set make the estimate worse?",
    checkpointAnswer:
      "If it is a collider - caused by both treatment and outcome - conditioning on it opens a path between them that did not exist.",
    remember:
      "Adjust for common causes, never for common effects.",
    checks: [
      {
        prompt: "What is a confounder?",
        options: [
          "A variable causing both the treatment and the outcome",
          "A variable caused by both",
          "A variable with missing values",
        ],
        answerIndex: 0,
        hint: "It decides who gets treated and how they do.",
        explanations: [
          "Correct, and it must be adjusted for.",
          "That is a collider, which must not be.",
          "Missingness is a separate problem.",
        ],
      },
      {
        prompt: "What does stratification do?",
        options: [
          "Computes the effect within each level and recombines",
          "Discards the confounded rows",
          "Reweights the outcome",
        ],
        answerIndex: 0,
        hint: "Within a level the confounder is constant.",
        explanations: [
          "Correct, weighted by how common each level is.",
          "No rows are dropped.",
          "The outcomes are unchanged.",
        ],
      },
      {
        prompt: "Should you adjust for a collider?",
        options: [
          "No; it creates a dependence that was not there",
          "Yes; more adjustment is safer",
          "Only if it is measured accurately",
        ],
        answerIndex: 0,
        hint: "It is caused by both, not a cause of either.",
        explanations: [
          "Correct. A longer adjustment list can be worse.",
          "Adjusting for everything is a common and serious error.",
          "Accuracy does not change the direction of the arrows.",
        ],
      },
    ],
  },
  {
    lessonId: "py.mc.m11_5.l3",
    atomId: "py.atom.ml.potential-outcomes",
    conceptId: "py.ml.potential-outcomes",
    title: "Potential outcomes and treatment effects",
    requires: ["py.ml.confounding"],
    vocabulary: [
      ["potential outcome", "what would have happened to a unit under one particular treatment"],
      ["estimand", "the precise quantity being estimated, defined before any estimation"],
      ["heterogeneous effect", "an effect that differs across units rather than being one number"],
    ],
    opening:
      "Each unit has an outcome under treatment and an outcome without it. You never see both, and every causal method is a way of borrowing the one you missed.",
    outcome:
      "You will compute two different average effects from the same units and see why naming the estimand comes first.",
    why:
      "The average over everyone and the average over the treated are different numbers answering different questions, and papers routinely report one while claiming the other.",
    mentalModel:
      "Picture two columns per unit, one observed and one hidden. Every estimate is a rule for filling in the hidden column.",
    firstTitle: "Two averages, one dataset",
    firstIntro:
      "The average over all units answers what a policy for everyone would do. The average over those actually treated answers what the existing programme achieved.",
    firstCode: `units = [("a", 1.0, 0.2), ("b", 0.8, 0.5),
         ("c", 0.3, 0.3), ("d", 0.9, 0.1)]

overall = sum(treated - control for _, treated, control in units) / len(units)
was_treated = {"a", "b"}
among_treated = sum(treated - control for name, treated, control in units
                    if name in was_treated) / len(was_treated)

print("average over everyone ", round(overall, 4))
print("average over the treated", round(among_treated, 4))`,
    firstTrace:
      "Point four seven five against point five five. Same units, same outcomes, and a difference large enough to change a decision.",
    secondTitle: "The average can describe nobody",
    secondIntro:
      "Look at the per-unit effects. When they differ, an average is a summary and not a prediction for any particular unit.",
    secondCode: `effects = [round(treated - control, 2)
           for _, treated, control in units]
print("per-unit effects", effects)
print("all identical   ", len(set(effects)) == 1)
print("range           ", round(max(effects) - min(effects), 2))`,
    secondTrace:
      "Effects of point eight, point three, zero and point eight. One unit gains nothing, and the average of point four seven five describes none of them.",
    mistake:
      "Choosing the estimand after seeing the estimates. The two averages differ, so picking whichever is larger turns a measurement into an argument.",
    checkpoint:
      "Why can the average treatment effect describe no individual unit?",
    checkpointAnswer:
      "Because effects are heterogeneous. The average summarises a distribution that may contain no unit near it.",
    remember:
      "Name the estimand first; averages are summaries, not predictions.",
    checks: [
      {
        prompt: "What is the fundamental problem of causal inference?",
        options: [
          "Only one potential outcome per unit is ever observed",
          "Data is always noisy",
          "Treatments are expensive",
        ],
        answerIndex: 0,
        hint: "The other column is never filled in.",
        explanations: [
          "Correct. Every method borrows the missing one.",
          "Noise is a separate and lesser difficulty.",
          "Cost is a practical, not a logical, obstacle.",
        ],
      },
      {
        prompt: "How do the two averages differ?",
        options: [
          "One answers a policy for everyone, the other what the existing programme achieved",
          "One is more accurate",
          "They are the same quantity",
        ],
        answerIndex: 0,
        hint: "They average over different populations.",
        explanations: [
          "Correct, and they answer different questions.",
          "Both are exact on this data.",
          "They differ whenever treatment is not random.",
        ],
      },
      {
        prompt: "Why must the estimand be named before estimating?",
        options: [
          "Otherwise you can pick whichever number suits the conclusion",
          "It speeds up the computation",
          "It is required by convention",
        ],
        answerIndex: 0,
        hint: "Two valid answers already exist.",
        explanations: [
          "Correct. That turns a measurement into an argument.",
          "Computation is unaffected.",
          "It is a substantive point, not a convention.",
        ],
      },
    ],
  },
  {
    lessonId: "py.mc.m11_5.l4",
    atomId: "py.atom.ml.instrumental-variables",
    conceptId: "py.ml.instrumental-variables",
    title: "Instruments and natural experiments",
    requires: ["py.ml.potential-outcomes"],
    vocabulary: [
      ["instrument", "something shifting the treatment while affecting the outcome only through it"],
      ["first stage", "how strongly the instrument moves the treatment"],
      ["weak instrument", "one whose first stage is small, which inflates the estimate wildly"],
    ],
    opening:
      "When you cannot randomise, look for something that already did. An instrument is a source of variation that touches the outcome only through the treatment.",
    outcome:
      "You will estimate an effect from an instrument and see a weak first stage produce a wildly wrong answer.",
    why:
      "The estimator divides by the first stage, so a small denominator does not merely add noise - it multiplies whatever bias is present.",
    mentalModel:
      "Picture a lever that nudges the treatment. Divide the movement in the outcome by the movement in the treatment, and the nudge cancels out.",
    firstTitle: "Divide the two differences",
    firstIntro:
      "Compare outcomes across levels of the instrument, then divide by how much the treatment moved between them.",
    firstCode: `def estimate(rows):
    high = [r for r in rows if r["z"] == 1]
    low = [r for r in rows if r["z"] == 0]
    outcome_shift = (sum(r["y"] for r in high) / len(high)
                     - sum(r["y"] for r in low) / len(low))
    treatment_shift = (sum(r["t"] for r in high) / len(high)
                       - sum(r["t"] for r in low) / len(low))
    return round(outcome_shift / treatment_shift, 4), round(treatment_shift, 4)

strong = ([{"z": 1, "t": 1, "y": 0.9}] * 80 + [{"z": 1, "t": 0, "y": 0.4}] * 20
          + [{"z": 0, "t": 1, "y": 0.8}] * 20 + [{"z": 0, "t": 0, "y": 0.3}] * 80)
print("strong instrument", estimate(strong))`,
    firstTrace:
      "An estimate of point six seven from a first stage of point six. The instrument moved the treatment a long way, so the division is stable.",
    secondTitle: "A weak first stage explodes",
    secondIntro:
      "Keep the outcomes and shrink how much the instrument moves the treatment. The same arithmetic now divides by something near zero.",
    secondCode: `weak = ([{"z": 1, "t": 1, "y": 0.9}] * 52 + [{"z": 1, "t": 0, "y": 0.4}] * 48
        + [{"z": 0, "t": 1, "y": 0.8}] * 48 + [{"z": 0, "t": 0, "y": 0.3}] * 52)
print("weak instrument  ", estimate(weak))`,
    secondTrace:
      "An estimate of three from a first stage of point zero four. Nothing about the outcomes changed; the denominator did all of it.",
    mistake:
      "Reporting the estimate without the first stage. The exclusion assumption cannot be tested from data at all, and a weak first stage is the one warning sign that can be reported.",
    checkpoint:
      "An instrument moves the treatment by four percent. What should you conclude?",
    checkpointAnswer:
      "That the estimate is unreliable. Dividing by a near-zero first stage amplifies any bias enormously.",
    remember:
      "Report the first stage; a weak instrument gives a confident wrong answer.",
    checks: [
      {
        prompt: "What must an instrument satisfy?",
        options: [
          "It moves the treatment and affects the outcome only through it",
          "It is randomly assigned by the researcher",
          "It is measured without error",
        ],
        answerIndex: 0,
        hint: "The second half is the untestable part.",
        explanations: [
          "Correct, and the exclusion half cannot be tested from data.",
          "Natural experiments are not researcher-assigned.",
          "Measurement quality is a separate concern.",
        ],
      },
      {
        prompt: "Why is a weak first stage dangerous?",
        options: [
          "The estimator divides by it, so any bias is amplified",
          "It makes the estimate noisier only",
          "It biases toward zero",
        ],
        answerIndex: 0,
        hint: "A near-zero denominator.",
        explanations: [
          "Correct. The estimate can be many times the truth.",
          "It does far more than add noise.",
          "It amplifies rather than shrinking.",
        ],
      },
      {
        prompt: "What should always be reported alongside the estimate?",
        options: ["The first stage", "The sample mean", "The p-value alone"],
        answerIndex: 0,
        hint: "It is the one warning sign that is testable.",
        explanations: [
          "Correct. Without it the estimate cannot be judged.",
          "Means do not diagnose the instrument.",
          "A p-value says nothing about instrument strength.",
        ],
      },
    ],
  },
];

export const ML_CAUSAL_ATOMS = ML_CAUSAL_SPECS.map(guidedMasteryAtom);
export const ML_CAUSAL_CONCEPTS = ML_CAUSAL_SPECS.map(guidedMasteryConcept);
export const ML_CAUSAL_LESSON_CONTENT = guidedLessonContent(ML_CAUSAL_SPECS);

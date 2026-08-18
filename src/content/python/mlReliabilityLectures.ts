import {
  guidedLessonContent,
  guidedMasteryAtom,
  guidedMasteryConcept,
  type GuidedMasterySpec,
} from "./guidedMastery";

const ML_RELIABILITY_SPECS: GuidedMasterySpec[] = [
  {
    lessonId: "py.mc.m8_3.l1",
    atomId: "py.atom.ml.monitoring-drift",
    conceptId: "py.ml.monitoring-drift",
    title: "Monitoring and drift",
    requires: ["py.ml.safe-rollout"],
    vocabulary: [
      ["label delay", "the time between a prediction and the arrival of its ground truth"],
      ["proxy signal", "an observable quantity that moves before the true metric can be measured"],
      ["prediction drift", "a change in the distribution of the model's outputs"],
    ],
    opening:
      "You cannot measure accuracy on data whose labels have not arrived yet. Monitoring is largely the art of watching what you can while waiting for what you want.",
    outcome:
      "You will work out how much of a deployment is measurable under a label delay, and which proxy signals cover the gap.",
    why:
      "A model can degrade for weeks before the labels prove it. Proxies are what shorten that window.",
    mentalModel:
      "Picture two timelines: predictions made, and labels arrived. The gap between them is a blind spot, and proxy signals are what you watch inside it.",
    firstTitle: "The measurable fraction",
    firstIntro:
      "With a thirty-day label delay, a model deployed two weeks ago has no evaluated predictions at all. The dashboard is empty for a reason.",
    firstCode: `def measurable_days(days_live, label_delay):
    return max(0, days_live - label_delay)

for delay in (0, 7, 30):
    row = [measurable_days(d, delay) for d in (1, 7, 14, 30, 60)]
    print("delay", delay, row)`,
    firstTrace:
      "At a thirty-day delay, nothing is measurable until day thirty-one, and even at day sixty only half the deployment has been evaluated.",
    secondTitle: "What to watch instead",
    secondIntro:
      "Input distributions, prediction distributions and system health are all observable immediately. None of them proves accuracy, and all of them move first.",
    secondCode: `signals = [("input distribution", 0, "shifts before predictions do"),
           ("prediction distribution", 0, "shifts before labels arrive"),
           ("error rate", 30, "the metric you actually want"),
           ("latency", 0, "catches serving faults, not model faults")]

for name, delay, note in signals:
    print(f"{name:24} delay {delay:>3}d  {note}")`,
    secondTrace:
      "Three of the four are available immediately. Only the one that answers the real question has to wait a month.",
    mistake:
      "Alerting on prediction drift alone. The output distribution moves whenever the input population changes, which is often legitimate, so a drift alarm without an input check is mostly noise.",
    checkpoint:
      "A model went live eight days ago and labels take thirty days. What can you say about its accuracy?",
    checkpointAnswer:
      "Nothing directly. Only input and prediction distributions and system health are observable so far.",
    remember:
      "Watch the proxies while the labels are in flight.",
    checks: [
      {
        prompt: "What does a label delay prevent?",
        options: [
          "Measuring accuracy on recent predictions",
          "Serving predictions",
          "Detecting input drift",
        ],
        answerIndex: 0,
        hint: "Accuracy needs ground truth.",
        explanations: [
          "Correct. Recent deployments are unevaluated.",
          "Serving is unaffected.",
          "Inputs are observable immediately.",
        ],
      },
      {
        prompt: "Why is a prediction-drift alert alone insufficient?",
        options: [
          "Output distributions move whenever the input population legitimately changes",
          "Predictions are not measurable",
          "Drift is always harmless",
        ],
        answerIndex: 0,
        hint: "Pair it with an input check.",
        explanations: [
          "Correct. Without the input context it is mostly noise.",
          "Predictions are observable immediately.",
          "Drift can be serious; the point is ambiguity.",
        ],
      },
      {
        prompt: "Which signal catches a serving fault rather than a model fault?",
        options: ["Latency", "Prediction distribution", "Error rate"],
        answerIndex: 0,
        hint: "It is a systems measure.",
        explanations: [
          "Correct. It says nothing about prediction quality.",
          "That reflects the model's behaviour.",
          "That is the model quality metric.",
        ],
      },
    ],
  },
  {
    lessonId: "py.mc.m8_3.l2",
    atomId: "py.atom.ml.online-experiments",
    conceptId: "py.ml.online-experiments",
    title: "Online experiments",
    requires: ["py.ml.monitoring-drift"],
    vocabulary: [
      ["statistical power", "the probability of detecting an effect that is really there"],
      ["guardrail metric", "a measure that must not degrade even if the target metric improves"],
      ["novelty effect", "a temporary response to a change simply because it is new"],
    ],
    opening:
      "The sample size an experiment needs grows with the square of how small an effect you want to detect. That single fact governs most experiment design.",
    outcome:
      "You will compute the traffic needed for a given effect size and see why small improvements are expensive to prove.",
    why:
      "Running an underpowered test wastes the traffic and produces a result that means nothing either way.",
    mentalModel:
      "Picture two noisy distributions overlapping. Separating them confidently needs either a large gap or a great many samples, and you rarely control the gap.",
    firstTitle: "The cost of precision",
    firstIntro:
      "Halving the effect you want to detect quadruples the sample. Below a few percent the required traffic quickly exceeds what most systems see.",
    firstCode: `import math

def sample_size(baseline, lift, z_alpha=1.959964, z_beta=0.8416212):
    p1 = baseline
    p2 = baseline * (1 + lift)
    pooled = (p1 + p2) / 2
    numerator = (z_alpha * math.sqrt(2 * pooled * (1 - pooled))
                 + z_beta * math.sqrt(p1 * (1 - p1) + p2 * (1 - p2))) ** 2
    return math.ceil(numerator / (p2 - p1) ** 2)

for lift in (0.20, 0.05, 0.01):
    print(f"lift {lift:.0%}", sample_size(0.10, lift), "per arm")`,
    firstTrace:
      "A twenty percent lift needs under four thousand per arm. A one percent lift needs one point four million. The relationship is quadratic, not linear.",
    secondTitle: "Guardrails and novelty",
    secondIntro:
      "A win on the target metric that degrades latency or retention is not a win. And a first-week result may be measuring novelty rather than value.",
    secondCode: `result = {"clicks": +0.031, "latency_ms": +48, "retention": -0.004}
guardrails = {"latency_ms": 20, "retention": -0.002}

breaches = [name for name, limit in guardrails.items()
            if (result[name] > limit if limit > 0
                else result[name] < limit)]
print("target improved:", result["clicks"] > 0)
print("guardrail breaches:", breaches)
print("ship:", not breaches)`,
    secondTrace:
      "Clicks improved by three percent, but latency rose forty-eight milliseconds and retention fell. Both guardrails broke, so the result is not shippable.",
    mistake:
      "Stopping an experiment the moment it reaches significance. Peeking repeatedly inflates the false-positive rate well beyond the stated threshold, and the effect vanishes on rerun.",
    checkpoint:
      "Why does detecting a one percent lift cost so much more traffic than twenty percent?",
    checkpointAnswer:
      "Required sample size scales with the inverse square of the effect, so a twenty-fold smaller effect needs roughly four hundred times the traffic.",
    remember:
      "Power first, guardrails always, and do not peek.",
    checks: [
      {
        prompt: "How does required sample size scale with the effect being detected?",
        options: [
          "With the inverse square of the effect",
          "Inversely with the effect",
          "It does not depend on the effect",
        ],
        answerIndex: 0,
        hint: "Halving the effect quadruples the sample.",
        explanations: [
          "Correct. Small effects are very expensive to prove.",
          "That would understate the cost badly.",
          "It is the dominant factor.",
        ],
      },
      {
        prompt: "A test improves clicks but breaks a latency guardrail. What follows?",
        options: [
          "It should not ship as is",
          "It should ship; clicks are the target",
          "The guardrail should be relaxed",
        ],
        answerIndex: 0,
        hint: "Guardrails exist to be binding.",
        explanations: [
          "Correct. A guardrail that never blocks is decoration.",
          "The target metric is not the only consideration.",
          "Relaxing it after the fact defeats its purpose.",
        ],
      },
      {
        prompt: "Why is stopping at first significance a problem?",
        options: [
          "Repeated peeking inflates the false-positive rate",
          "The sample is always too small",
          "Significance is meaningless",
        ],
        answerIndex: 0,
        hint: "Each look is another chance to be fooled by noise.",
        explanations: [
          "Correct. The stated threshold no longer holds.",
          "The size may be fine; the stopping rule is the issue.",
          "Significance is meaningful under a fixed plan.",
        ],
      },
    ],
  },
  {
    lessonId: "py.mc.m8_3.l3",
    atomId: "py.atom.ml.versioning-lineage",
    conceptId: "py.ml.versioning-lineage",
    title: "Versioning and lineage",
    requires: ["py.ml.online-experiments"],
    vocabulary: [
      ["lineage", "the chain of code, data, configuration and environment behind one model"],
      ["immutable reference", "an identifier whose contents can never change under it"],
      ["reproducible rebuild", "producing the same model again from the recorded references"],
    ],
    opening:
      "A model in production that nobody can rebuild is a liability. The question is not whether you version, but whether every reference is immutable.",
    outcome:
      "You will distinguish immutable references from mutable ones and see which links break a rebuild.",
    why:
      "When a model behaves strangely months later, the only way to investigate is to reconstruct exactly what produced it.",
    mentalModel:
      "Picture four wires into the model: code, data, configuration and environment. A rebuild works only if all four point at something that cannot have changed.",
    firstTitle: "Mutable references break rebuilds",
    firstIntro:
      "A branch name, a latest tag and an unversioned table all name something whose contents move. A commit hash, a snapshot identifier and a pinned digest do not.",
    firstCode: `references = [("code", "main", False),
              ("code", "a91f3c2", True),
              ("data", "events_table", False),
              ("data", "events@2026-03-01", True),
              ("image", "trainer:latest", False),
              ("image", "trainer@sha256:9d1c", True)]

for kind, ref, immutable in references:
    print(f"{kind:6} {ref:26} rebuildable: {immutable}")`,
    firstTrace:
      "Three of the six can never be reconstructed. Each of those is a wire whose far end may already have moved.",
    secondTitle: "One broken link is enough",
    secondIntro:
      "Lineage is a conjunction. Three immutable references and one mutable one still leaves a model that cannot be rebuilt.",
    secondCode: `recorded = {"code": True, "data": True,
            "config": True, "environment": False}
broken = [name for name, ok in recorded.items() if not ok]
print("immutable:", sum(recorded.values()), "of", len(recorded))
print("rebuildable:", not broken, "broken:", broken)`,
    secondTrace:
      "Three of four pinned and the rebuild still fails. The environment alone decides whether the other three mean anything.",
    mistake:
      "Recording the training data as a query rather than a snapshot. The query is stable; what it returns is not, and rerunning it a year later returns a different dataset.",
    checkpoint:
      "Which of a branch name and a commit hash is safe to record?",
    checkpointAnswer:
      "The commit hash. A branch name points at whatever the branch holds now, which changes with every push.",
    remember:
      "Pin code, data, configuration and environment - all four or none.",
    checks: [
      {
        prompt: "Why is a branch name unsuitable as a lineage reference?",
        options: [
          "Its contents change as the branch moves",
          "It is too long",
          "It is not human readable",
        ],
        answerIndex: 0,
        hint: "Immutability is the requirement.",
        explanations: [
          "Correct. A commit hash is the immutable alternative.",
          "Length is irrelevant.",
          "Readability is not the criterion.",
        ],
      },
      {
        prompt: "Three of four references are immutable. Is the model rebuildable?",
        options: [
          "No; lineage requires all of them",
          "Yes; three quarters is enough",
          "Only if the fourth is the configuration",
        ],
        answerIndex: 0,
        hint: "It is a conjunction, not a score.",
        explanations: [
          "Correct. One moving reference breaks the rebuild.",
          "Partial lineage does not reproduce anything.",
          "Any single mutable reference is fatal.",
        ],
      },
      {
        prompt: "How should the training dataset be recorded?",
        options: [
          "As an immutable snapshot identifier",
          "As the query that produced it",
          "As a row count",
        ],
        answerIndex: 0,
        hint: "A query returns different data over time.",
        explanations: [
          "Correct. The snapshot is what can be reconstructed.",
          "The query is stable but its result is not.",
          "A count identifies nothing.",
        ],
      },
    ],
  },
  {
    lessonId: "py.mc.m8_3.l4",
    atomId: "py.atom.ml.retraining-pipelines",
    conceptId: "py.ml.retraining-pipelines",
    title: "CI/CD and retraining",
    requires: ["py.ml.versioning-lineage"],
    vocabulary: [
      ["behavioural test", "a check on how the model responds to a specific input, not on aggregate accuracy"],
      ["promotion gate", "a condition a candidate model must pass before replacing the current one"],
      ["retraining trigger", "the event that starts a new training run"],
    ],
    opening:
      "Automating retraining without automating the checks means automating the shipping of worse models. The gates are the whole point.",
    outcome:
      "You will design promotion gates that compare against the incumbent, and write tests on behaviour rather than aggregate accuracy.",
    why:
      "Aggregate metrics hide subgroup regressions. A candidate can beat the current model overall while getting materially worse on a segment that matters.",
    mentalModel:
      "Picture a gate with several latches: overall metric, every subgroup, a set of specific cases, and cost. All of them must open.",
    firstTitle: "Beating the average is not enough",
    firstIntro:
      "Compare the candidate against the incumbent on every subgroup, not only on the pooled metric. One improved segment can mask another that got worse.",
    firstCode: `incumbent = {"overall": 0.812, "new_users": 0.770,
             "mobile": 0.805, "enterprise": 0.848}
candidate = {"overall": 0.826, "new_users": 0.731,
             "mobile": 0.831, "enterprise": 0.869}

regressions = [k for k in incumbent if candidate[k] < incumbent[k] - 0.005]
print("overall improved:", candidate["overall"] > incumbent["overall"])
print("regressions:", regressions)
print("promote:", not regressions)`,
    firstTrace:
      "Overall accuracy rose by one and a half points while new users fell by nearly four. The pooled number said ship and the subgroup check said do not.",
    secondTitle: "Tests on behaviour",
    secondIntro:
      "Some inputs must produce a particular answer whatever the metrics say. Those belong in the pipeline as assertions, not as a note in a document.",
    secondCode: `cases = [("empty input", "reject", "reject"),
         ("known spam phrase", "block", "block"),
         ("safe common phrase", "allow", "block")]

failures = [name for name, expected, actual in cases
            if expected != actual]
print("behavioural failures:", failures)
print("promote:", not failures)`,
    secondTrace:
      "Two cases pass and one blocks a safe phrase. The candidate is rejected on a single case, regardless of how good its aggregate numbers were.",
    mistake:
      "Triggering retraining on a schedule with no gate at all. A corrupted upstream feed then produces a worse model and promotes it automatically, on time, every time.",
    checkpoint:
      "A candidate improves overall accuracy but drops four points on new users. Should it promote?",
    checkpointAnswer:
      "No. A subgroup regression that large is a real harm the pooled metric is hiding.",
    remember:
      "Gate on subgroups and on specific behaviours, not on the average.",
    checks: [
      {
        prompt: "Why is an overall metric an insufficient promotion gate?",
        options: [
          "It can hide a serious regression in a subgroup",
          "It is hard to compute",
          "It is not comparable across versions",
        ],
        answerIndex: 0,
        hint: "Averages pool across populations.",
        explanations: [
          "Correct. Subgroup checks are what catch it.",
          "It is the easiest metric to compute.",
          "It is comparable; it is just incomplete.",
        ],
      },
      {
        prompt: "What does a behavioural test assert?",
        options: [
          "That a specific input produces a specific response",
          "That accuracy exceeds a threshold",
          "That training completed",
        ],
        answerIndex: 0,
        hint: "It is about individual cases.",
        explanations: [
          "Correct. Some cases must hold whatever the metrics say.",
          "That is an aggregate gate.",
          "Completion is not a quality check.",
        ],
      },
      {
        prompt: "What is the risk of scheduled retraining with no gate?",
        options: [
          "A worse model gets promoted automatically",
          "Training takes longer",
          "Lineage is lost",
        ],
        answerIndex: 0,
        hint: "Automation without checks automates the mistake.",
        explanations: [
          "Correct. A corrupted feed ships on schedule.",
          "Duration is unaffected.",
          "Lineage is a separate concern.",
        ],
      },
    ],
  },
  {
    lessonId: "py.mc.m8_3.l5",
    atomId: "py.atom.ml.model-security",
    conceptId: "py.ml.model-security",
    title: "Security and privacy",
    requires: ["py.ml.retraining-pipelines"],
    vocabulary: [
      ["membership inference", "determining whether a specific record was in the training data"],
      ["quasi-identifier", "a field that is not an identifier alone but becomes one in combination"],
      ["k-anonymity", "the guarantee that every combination of quasi-identifiers covers at least k records"],
    ],
    opening:
      "A model endpoint is an interface to the training data, whether or not it was meant to be. The threats follow from that.",
    outcome:
      "You will see how combining harmless fields identifies individuals, and measure the guarantee a dataset actually provides.",
    why:
      "Removing the name field is not anonymisation. A handful of ordinary attributes is usually enough to single someone out.",
    mentalModel:
      "Picture each record as a point in a space of attributes. Adding a dimension splits the groups, and a group of one is an identified person.",
    firstTitle: "Combinations identify",
    firstIntro:
      "Group the records by their quasi-identifiers and look at the smallest group. That size is the guarantee the release actually offers.",
    firstCode: `def smallest_group(rows, fields):
    groups = {}
    for row in rows:
        key = tuple(row[f] for f in fields)
        groups[key] = groups.get(key, 0) + 1
    return min(groups.values()), len(groups)

rows = [{"zip": "021", "age": 30} for _ in range(5)]
rows.append({"zip": "021", "age": 41})

print("by zip      ", smallest_group(rows, ["zip"]))
print("by zip + age", smallest_group(rows, ["zip", "age"]))`,
    firstTrace:
      "On postcode alone every record hides in a group of six. Adding age splits it, and one person now sits alone in a group of one.",
    secondTitle: "Threats at the endpoint",
    secondIntro:
      "The endpoint itself leaks. Confidence scores let an attacker test whether a record was in the training set, and unlimited queries let them extract the model.",
    secondCode: `threats = [("membership inference", "return coarse confidence"),
           ("model extraction", "rate limit and monitor query volume"),
           ("prompt injection", "treat retrieved text as data"),
           ("training data poisoning", "validate and version every source")]

for threat, control in threats:
    print(f"{threat:26} -> {control}")`,
    secondTrace:
      "Each threat has a specific control, and none of them is solved by the model itself. They are all decisions about the interface around it.",
    mistake:
      "Returning full-precision confidence scores because they are useful to callers. Those scores are exactly the signal a membership-inference attack needs.",
    checkpoint:
      "A dataset has the name removed but keeps postcode, birth date and sex. Is it anonymous?",
    checkpointAnswer:
      "No. Those three together identify a large share of a population, so the smallest group is often one.",
    remember:
      "Measure the smallest group, and treat the endpoint as an interface to the data.",
    checks: [
      {
        prompt: "What does the smallest group size tell you?",
        options: [
          "The anonymity guarantee the release actually provides",
          "How balanced the dataset is",
          "How many records are duplicated",
        ],
        answerIndex: 0,
        hint: "A group of one is an identified person.",
        explanations: [
          "Correct. That is the k in k-anonymity.",
          "Balance is a different property.",
          "Duplicates are not the concern.",
        ],
      },
      {
        prompt: "Why limit the precision of returned confidence scores?",
        options: [
          "Precise scores enable membership inference",
          "They are expensive to compute",
          "They confuse callers",
        ],
        answerIndex: 0,
        hint: "The score differs subtly for training records.",
        explanations: [
          "Correct. Coarse scores blunt the attack.",
          "They are already computed.",
          "Usefulness is exactly the tension.",
        ],
      },
      {
        prompt: "How should text retrieved from an external source be treated?",
        options: [
          "As data, never as instructions",
          "As trusted context",
          "As part of the system prompt",
        ],
        answerIndex: 0,
        hint: "The source is outside your control.",
        explanations: [
          "Correct. That is the control for injection.",
          "External sources are not trusted.",
          "That grants it the highest privilege.",
        ],
      },
    ],
  },
];

export const ML_RELIABILITY_ATOMS = ML_RELIABILITY_SPECS.map(guidedMasteryAtom);
export const ML_RELIABILITY_CONCEPTS = ML_RELIABILITY_SPECS.map(guidedMasteryConcept);
export const ML_RELIABILITY_LESSON_CONTENT = guidedLessonContent(ML_RELIABILITY_SPECS);

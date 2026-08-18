import {
  guidedLessonContent,
  guidedMasteryAtom,
  guidedMasteryConcept,
  type GuidedMasterySpec,
} from "./guidedMastery";

const ML_INFRASTRUCTURE_SPECS: GuidedMasterySpec[] = [
  {
    lessonId: "py.mc.m8_1.l1",
    atomId: "py.atom.ml.data-pipelines",
    conceptId: "py.ml.data-pipelines",
    title: "Data pipelines and feature stores",
    requires: ["py.ml.feature-pipelines"],
    vocabulary: [
      ["point-in-time correctness", "joining each label to the feature values as they stood at that moment"],
      ["train-serve parity", "computing a feature the same way in training and in production"],
      ["lineage", "a record of which inputs and code produced a given feature value"],
    ],
    opening:
      "A feature table looks like a join. It is really a join with a clock attached, and forgetting the clock is the most expensive mistake in the pipeline.",
    outcome:
      "You will see a naive join leak future values into training rows, and fix it with a point-in-time join.",
    why:
      "A leaked feature makes offline metrics beautiful and production metrics awful, with nothing in between to warn you.",
    mentalModel:
      "Picture each label sitting at a moment on a timeline. Its features must come from the last update before that moment, never from anything to its right.",
    firstTitle: "The naive join leaks",
    firstIntro:
      "Taking the latest known value for each entity is the obvious implementation. It gives every training row a value recorded after the label was decided.",
    firstCode: `events = [("u1", 10, 0.2), ("u1", 20, 0.5), ("u1", 30, 0.9)]
labels = [("u1", 15, 1), ("u1", 25, 0)]

def naive_join(events, labels):
    latest = {}
    for user, moment, value in events:
        latest[user] = value
    return [(u, t, latest[u], y) for u, t, y in labels]

print(naive_join(events, labels))`,
    firstTrace:
      "Both rows get zero point nine, a value recorded at moment thirty. The label at moment fifteen has been handed information from fifteen units into its own future.",
    secondTitle: "Attaching the clock",
    secondIntro:
      "The correct join filters to updates at or before the label's moment and takes the last of them. Nothing else changes.",
    secondCode: `def point_in_time(events, labels):
    rows = []
    for user, moment, label in labels:
        past = [v for u, t, v in events if u == user and t <= moment]
        rows.append((user, moment, past[-1] if past else None, label))
    return rows

print(point_in_time(events, labels))`,
    secondTrace:
      "Now the row at fifteen sees zero point two and the row at twenty-five sees zero point five. Each label carries only what was knowable when it was decided.",
    mistake:
      "Computing a feature one way in the training job and another way in the serving path. The two drift apart quietly, and the model receives inputs it was never trained on.",
    checkpoint:
      "Offline metrics are excellent and production metrics are poor. What is the first thing to check?",
    checkpointAnswer:
      "Whether the training join was point-in-time correct, and whether the serving path computes features identically.",
    remember:
      "Join at the label's moment, and compute the same way on both sides.",
    checks: [
      {
        prompt: "What does a point-in-time join enforce?",
        options: [
          "Only feature values recorded at or before the label's moment are used",
          "Features and labels come from the same table",
          "Every entity has a feature value",
        ],
        answerIndex: 0,
        hint: "It is about time, not completeness.",
        explanations: [
          "Correct. Anything later is a leak.",
          "They usually come from different sources.",
          "Missing values are a separate concern.",
        ],
      },
      {
        prompt: "What symptom does a training-time leak produce?",
        options: [
          "Strong offline metrics and weak production metrics",
          "Slow training",
          "Unstable gradients",
        ],
        answerIndex: 0,
        hint: "The model had information it will never have again.",
        explanations: [
          "Correct. The gap between the two is the tell.",
          "Leakage does not affect speed.",
          "The optimisation is unaffected.",
        ],
      },
      {
        prompt: "Why does a feature store keep one definition per feature?",
        options: [
          "So training and serving compute it identically",
          "To reduce storage",
          "To speed up joins",
        ],
        answerIndex: 0,
        hint: "Two implementations drift apart.",
        explanations: [
          "Correct. That is train-serve parity.",
          "Storage is a minor consideration.",
          "Join speed is an implementation detail.",
        ],
      },
    ],
  },
  {
    lessonId: "py.mc.m8_1.l2",
    atomId: "py.atom.ml.training-clusters",
    conceptId: "py.ml.training-clusters",
    title: "Training infrastructure and clusters",
    requires: ["py.ml.data-pipelines"],
    vocabulary: [
      ["gang scheduling", "starting every worker of a job together or not at all"],
      ["straggler", "one worker running slower than the rest and holding up a synchronous step"],
      ["reproducible job", "a run pinned to specific code, data and configuration so it can be repeated"],
    ],
    opening:
      "A synchronous training step finishes when its slowest worker finishes. That single sentence explains most of what cluster scheduling has to get right.",
    outcome:
      "You will compute how a straggler and partial allocation waste a cluster, and why jobs must start all at once.",
    why:
      "Accelerator time is the dominant cost of training, and most of the waste comes from coordination rather than computation.",
    mentalModel:
      "Picture a row of workers finishing a step at different times. Everyone waits at the barrier, so the idle time is the gap between fastest and slowest.",
    firstTitle: "The slowest worker sets the pace",
    firstIntro:
      "With a synchronous barrier, every worker's step time equals the maximum. The waste is the difference summed over the rest.",
    firstCode: `def step_waste(times):
    slowest = max(times)
    idle = sum(slowest - t for t in times)
    return slowest, idle, round(idle / (slowest * len(times)) * 100, 1)

print(step_waste([100] * 8))
print(step_waste([100] * 7 + [140]))
print(step_waste([100] * 63 + [140]))`,
    firstTrace:
      "A uniform cluster wastes nothing. One slow worker idles the other seven for two hundred eighty units, and the other sixty-three for two thousand five hundred twenty.",
    secondTitle: "All or nothing",
    secondIntro:
      "A job holding some of its workers while waiting for the rest occupies hardware it cannot use. Two such jobs can deadlock a cluster with capacity to spare.",
    secondCode: `capacity = 16
requests = [("job-a", 12), ("job-b", 12)]

held = 0
for name, want in requests:
    granted = min(want, capacity - held)
    held += granted
    print(name, "wanted", want, "got", granted,
          "runnable", granted == want)
print("held", held, "of", capacity, "doing useful work 0")`,
    secondTrace:
      "The first job takes all twelve and runs. The second holds four it cannot use. Gang scheduling refuses that partial grant, leaving the four free for another job.",
    mistake:
      "Blaming the model when a job is slow. Profile first: input starvation, a straggler and a network bottleneck all look like slow training and have completely different fixes.",
    checkpoint:
      "One worker in sixty-four runs forty percent slower. How much of the cluster is wasted?",
    checkpointAnswer:
      "Twenty-eight percent of the step, and two thousand five hundred twenty idle worker-units - every other worker waits at the barrier.",
    remember:
      "The barrier costs the gap, and partial allocations cost everything.",
    checks: [
      {
        prompt: "What determines the duration of a synchronous step?",
        options: ["The slowest worker", "The average worker", "The fastest worker"],
        answerIndex: 0,
        hint: "Everyone waits at the barrier.",
        explanations: [
          "Correct. That is why stragglers matter so much.",
          "Averages hide the barrier entirely.",
          "The fastest worker waits longest.",
        ],
      },
      {
        prompt: "Why does a larger cluster suffer more from one straggler?",
        options: [
          "More workers idle for the same waiting period",
          "Stragglers become more likely",
          "The network saturates",
        ],
        answerIndex: 0,
        hint: "The waste is idle workers times waiting time.",
        explanations: [
          "Correct. The same delay multiplies across more hardware.",
          "That is a separate effect.",
          "Network load is unrelated to this calculation.",
        ],
      },
      {
        prompt: "What does gang scheduling prevent?",
        options: [
          "Jobs holding hardware they cannot yet use",
          "Stragglers",
          "Checkpoint corruption",
        ],
        answerIndex: 0,
        hint: "Think about two half-allocated jobs.",
        explanations: [
          "Correct. All workers start together or none do.",
          "Stragglers are a runtime problem.",
          "That is the checkpointing lesson.",
        ],
      },
    ],
  },
  {
    lessonId: "py.mc.m8_1.l3",
    atomId: "py.atom.ml.accelerator-utilization",
    conceptId: "py.ml.accelerator-utilization",
    title: "Accelerator utilization and cost",
    requires: ["py.ml.training-clusters"],
    vocabulary: [
      ["utilization", "the fraction of wall-clock time the accelerator spends computing"],
      ["input stall", "time the accelerator waits for the next batch to arrive"],
      ["price-performance", "cost per unit of work rather than cost per hour"],
    ],
    opening:
      "An accelerator billed by the hour is paid for whether it computes or waits. Utilization is the number that turns a rental into a result.",
    outcome:
      "You will attribute idle time to its cause, and compare hardware on cost per unit of work rather than cost per hour.",
    why:
      "Halving the price per hour is worthless if the cheaper device does a third of the work. Only the ratio matters.",
    mentalModel:
      "Picture the step time as a bar split into compute, waiting for data and waiting for other workers. Only the first segment is what you are paying for.",
    firstTitle: "Where the time goes",
    firstIntro:
      "Three profiles with the same total step time and utterly different fixes. Naming the dominant segment tells you which team to talk to.",
    firstCode: `def profile(compute, data, sync):
    total = compute + data + sync
    return {"utilization": round(compute / total * 100, 1),
            "stall": max([("data", data), ("sync", sync)],
                         key=lambda pair: pair[1])[0]}

for name, c, d, s in [("input bound", 40, 55, 5),
                      ("sync bound", 55, 5, 40),
                      ("healthy", 88, 6, 6)]:
    print(name, profile(c, d, s))`,
    firstTrace:
      "Forty, fifty-five and eighty-eight percent utilization. The first names data as its stall, the second names sync, and only the third is close to healthy.",
    secondTitle: "Cost per unit of work",
    secondIntro:
      "Compare an expensive fast device against a cheap slow one by dividing price by throughput. The hourly rate on its own is misleading.",
    secondCode: `devices = {"fast": (32.0, 1000), "cheap": (12.0, 300)}
for name, (price, throughput) in devices.items():
    per_million = price / throughput * 1e6 / 3600
    print(name, "price/hour", price,
          "cost per million steps", round(per_million, 2))`,
    secondTrace:
      "The fast device costs eight point eight nine and the cheap one eleven point one one. The device with under half the hourly price is the more expensive choice.",
    mistake:
      "Optimising the model while the profile says the loader is starving it. A twenty percent faster forward pass buys nothing when the accelerator is idle half the time.",
    checkpoint:
      "Utilization is forty percent and most idle time is waiting for batches. What do you fix?",
    checkpointAnswer:
      "The input pipeline - more loader workers, prefetching or a faster data format. The model is not the bottleneck.",
    remember:
      "Profile first, then divide price by throughput.",
    checks: [
      {
        prompt: "What does utilization measure?",
        options: [
          "The fraction of wall-clock time spent computing",
          "The fraction of memory used",
          "The fraction of workers running",
        ],
        answerIndex: 0,
        hint: "It is a time measure, not a capacity measure.",
        explanations: [
          "Correct. Idle time is billed but produces nothing.",
          "Memory occupancy is a different metric.",
          "That is cluster allocation.",
        ],
      },
      {
        prompt: "A device costs half as much per hour but delivers a third of the throughput. Is it cheaper?",
        options: [
          "No; cost per unit of work is higher",
          "Yes; the hourly rate is lower",
          "It depends on the model",
        ],
        answerIndex: 0,
        hint: "Divide price by throughput.",
        explanations: [
          "Correct. Half the price for a third of the work is worse.",
          "Hourly rate alone is misleading.",
          "The arithmetic holds regardless of model.",
        ],
      },
      {
        prompt: "Utilization is low and the dominant segment is waiting for other workers. What is the fix?",
        options: [
          "Address communication and stragglers",
          "Speed up the data loader",
          "Use a smaller model",
        ],
        answerIndex: 0,
        hint: "The profile names the segment.",
        explanations: [
          "Correct. That is a synchronisation problem.",
          "The loader is not the dominant segment here.",
          "Model size does not address waiting.",
        ],
      },
    ],
  },
  {
    lessonId: "py.mc.m8_1.l4",
    atomId: "py.atom.ml.checkpointing",
    conceptId: "py.ml.checkpointing",
    title: "Checkpointing and fault tolerance",
    requires: ["py.ml.accelerator-utilization"],
    vocabulary: [
      ["checkpoint", "a saved snapshot sufficient to resume a run exactly where it stopped"],
      ["resumable state", "weights plus optimizer moments, random state and the data position"],
      ["checkpoint interval", "how often a snapshot is written, trading overhead against lost work"],
    ],
    opening:
      "A month-long run on thousands of accelerators will fail. The question is not whether, but how much work each failure destroys.",
    outcome:
      "You will find the interval that minimises total cost, and list what a checkpoint must contain to resume honestly.",
    why:
      "Checkpointing too often wastes time writing; too rarely wastes time recomputing. The optimum is a real calculation, not a guess.",
    mentalModel:
      "Picture two curves crossing: writing cost falling as the interval grows, and lost work rising. The total is a valley, and you want its floor.",
    firstTitle: "Finding the valley",
    firstIntro:
      "Overhead is the number of checkpoints times the write cost. Lost work is the failure count times half an interval, on average.",
    firstCode: `def total_cost(hours, failures_per_hour, write_minutes, interval):
    checkpoints = hours * 60 / interval
    overhead = checkpoints * write_minutes
    lost = hours * failures_per_hour * interval / 2
    return round(overhead + lost, 1)

for interval in (5, 15, 30, 60, 240):
    print(interval, total_cost(720, 0.05, 1.5, interval))`,
    firstTrace:
      "Thirteen thousand minutes at a five-minute interval, two thousand one hundred sixty at sixty, and back up to four thousand five hundred ninety at four hours. The floor sits near an hour.",
    secondTitle: "What must be saved",
    secondIntro:
      "Weights alone do not resume a run. The optimizer moments, the random state and the position in the data stream all carry information.",
    secondCode: `required = ["weights", "optimizer moments", "learning rate step",
            "random number state", "data loader position"]
saved = ["weights", "optimizer moments", "learning rate step"]
print("missing:", [item for item in required if item not in saved])`,
    secondTrace:
      "Two items missing. Resuming without them replays data the model already saw and reuses the same augmentation draws, which quietly changes what the run is.",
    mistake:
      "Testing that the checkpoint writes but never that it restores. A resume path exercised for the first time during an outage is a resume path that does not work.",
    checkpoint:
      "Why does the total cost rise at both very short and very long intervals?",
    checkpointAnswer:
      "Short intervals pay the write cost constantly; long intervals lose more work per failure. The minimum is between them.",
    remember:
      "Save everything stateful, and test the restore.",
    checks: [
      {
        prompt: "On average, how much work does one failure destroy?",
        options: [
          "Half a checkpoint interval",
          "A whole interval",
          "The time since the run started",
        ],
        answerIndex: 0,
        hint: "The failure lands at a uniform point between checkpoints.",
        explanations: [
          "Correct. That is the expected value.",
          "That would be the worst case.",
          "Only work since the last checkpoint is lost.",
        ],
      },
      {
        prompt: "Which item is most often forgotten in a checkpoint?",
        options: [
          "The data loader position",
          "The weights",
          "The model architecture",
        ],
        answerIndex: 0,
        hint: "It is the one that silently changes the run.",
        explanations: [
          "Correct. Resuming replays data the model already saw.",
          "Nobody forgets the weights.",
          "That lives in the code.",
        ],
      },
      {
        prompt: "What should be tested alongside checkpoint writing?",
        options: [
          "That a restore reproduces the run exactly",
          "That the file compresses well",
          "That writes are fast",
        ],
        answerIndex: 0,
        hint: "The write is only half the mechanism.",
        explanations: [
          "Correct. An untested restore path fails when it matters.",
          "Compression is secondary.",
          "Speed matters less than correctness.",
        ],
      },
    ],
  },
  {
    lessonId: "py.mc.m8_1.l5",
    atomId: "py.atom.ml.data-validation",
    conceptId: "py.ml.data-validation",
    title: "Data quality and validation",
    requires: ["py.ml.checkpointing"],
    vocabulary: [
      ["schema check", "asserting the types, ranges and required fields of every incoming record"],
      ["distribution shift", "a change in the statistics of a field between a reference period and now"],
      ["population stability index", "a symmetric score summarising how far one distribution has moved from another"],
    ],
    opening:
      "A pipeline that accepts anything will eventually train on anything. Validation is where a bad upstream change becomes a failed job instead of a bad model.",
    outcome:
      "You will score a distribution shift numerically and set a threshold that fails the pipeline before training starts.",
    why:
      "A silently corrupted field costs a full training run plus the time to work out why the model got worse.",
    mentalModel:
      "Picture two histograms of the same field, one from a trusted reference period and one from today. The score summarises the gap between them in a single number.",
    firstTitle: "Scoring the gap",
    firstIntro:
      "The index sums the difference in bucket share weighted by the log of their ratio. It is zero for identical distributions and grows with the gap.",
    firstCode: `import math

def stability_index(reference, current):
    total = 0.0
    for expected, actual in zip(reference, current):
        expected = max(expected, 1e-6)
        actual = max(actual, 1e-6)
        total += (actual - expected) * math.log(actual / expected)
    return round(total, 4)

base = [0.25, 0.25, 0.25, 0.25]
print("identical", stability_index(base, base))
print("moderate ", stability_index(base, [0.10, 0.20, 0.30, 0.40]))
print("severe   ", stability_index(base, [0.70, 0.10, 0.10, 0.10]))`,
    firstTrace:
      "Zero, zero point two three and zero point eight eight. A threshold around zero point two separates ordinary drift from a change worth blocking on.",
    secondTitle: "Failing loudly",
    secondIntro:
      "A check that logs a warning gets ignored. A check that stops the pipeline gets fixed, so the decision is where to draw the line, not whether to enforce it.",
    secondCode: `checks = [("null rate", 0.003, 0.01),
          ("distribution", 0.88, 0.20),
          ("label balance", 0.48, 0.60)]

failures = [name for name, value, limit in checks if value > limit]
print("failures:", failures)
print("pipeline proceeds:", not failures)`,
    secondTrace:
      "One failure blocks the run. The null rate and label balance are within limits, but the distribution score is four times its threshold.",
    mistake:
      "Validating only the training data. The same checks belong on the serving inputs, where an upstream change shows up first and does the most damage.",
    checkpoint:
      "A field's distribution score jumps from zero point zero two to zero point nine. What should happen?",
    checkpointAnswer:
      "The pipeline should fail before training starts, and the change should be traced upstream rather than absorbed.",
    remember:
      "Score the drift, set a threshold, and fail the run.",
    checks: [
      {
        prompt: "What does a stability index of zero mean?",
        options: [
          "The two distributions are identical",
          "The data is empty",
          "The check could not run",
        ],
        answerIndex: 0,
        hint: "The score grows with the gap.",
        explanations: [
          "Correct. Every bucket has the same share.",
          "Empty data would fail a different check.",
          "Zero is a valid, meaningful result.",
        ],
      },
      {
        prompt: "Why should a validation failure stop the pipeline?",
        options: [
          "A logged warning gets ignored until the model is already worse",
          "It saves storage",
          "It is faster than training",
        ],
        answerIndex: 0,
        hint: "Think about what people actually act on.",
        explanations: [
          "Correct. Blocking converts a silent problem into a visible one.",
          "Storage is not the concern.",
          "Speed is not the argument.",
        ],
      },
      {
        prompt: "Where else do these checks belong?",
        options: [
          "On the serving inputs",
          "Only on the training data",
          "Only on the model outputs",
        ],
        answerIndex: 0,
        hint: "Upstream changes reach serving first.",
        explanations: [
          "Correct. That is where damage starts.",
          "Training data is only half the picture.",
          "Output checks catch a different failure.",
        ],
      },
    ],
  },
];

export const ML_INFRASTRUCTURE_ATOMS = ML_INFRASTRUCTURE_SPECS.map(guidedMasteryAtom);
export const ML_INFRASTRUCTURE_CONCEPTS = ML_INFRASTRUCTURE_SPECS.map(guidedMasteryConcept);
export const ML_INFRASTRUCTURE_LESSON_CONTENT = guidedLessonContent(ML_INFRASTRUCTURE_SPECS);

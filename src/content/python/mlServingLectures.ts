import {
  guidedLessonContent,
  guidedMasteryAtom,
  guidedMasteryConcept,
  type GuidedMasterySpec,
} from "./guidedMastery";

const ML_SERVING_SPECS: GuidedMasterySpec[] = [
  {
    lessonId: "py.mc.m8_2.l1",
    atomId: "py.atom.ml.packaging-serving",
    conceptId: "py.ml.packaging-serving",
    title: "Packaging and serving",
    requires: ["py.ml.data-validation"],
    vocabulary: [
      ["artifact", "the frozen bundle of weights, preprocessing and dependency versions that gets deployed"],
      ["input contract", "the declared shape, types and ranges the endpoint accepts"],
      ["reproducible build", "a package that produces byte-identical behaviour from the same inputs"],
    ],
    opening:
      "A model that runs in a notebook is not a deployable thing. The artifact is the model plus everything the model quietly assumed.",
    outcome:
      "You will list what an artifact must freeze, and see what breaks when preprocessing is left outside it.",
    why:
      "Most serving incidents are not model failures. They are a preprocessing step or a library version that differed between training and production.",
    mentalModel:
      "Picture the boundary of the artifact drawn around everything that touches the input. If a transformation lives outside that boundary, it will drift.",
    firstTitle: "Preprocessing belongs inside",
    firstIntro:
      "A scaler fitted during training and reimplemented by hand at serving time is two implementations of one thing. They agree until they do not.",
    firstCode: `train_mean, train_scale = 12.4, 3.1

def served_by_artifact(x):
    return (x - train_mean) / train_scale

def reimplemented(x):
    return (x - 12.4) / 3.0

for x in (10.0, 15.0, 30.0):
    a, b = served_by_artifact(x), reimplemented(x)
    print(x, round(a, 4), round(b, 4), round(abs(a - b), 4))`,
    firstTrace:
      "A single digit typed differently shifts the largest input by nearly point two standard deviations. The model receives something it never saw in training.",
    secondTitle: "The contract catches it",
    secondIntro:
      "A declared contract on shapes, types and ranges turns a silent wrong answer into a rejected request, which is the outcome you want.",
    secondCode: `contract = {"age": (0, 120), "score": (0.0, 1.0)}

def validate(request):
    problems = []
    for field, (low, high) in contract.items():
        if field not in request:
            problems.append(f"{field} missing")
        elif not low <= request[field] <= high:
            problems.append(f"{field} out of range")
    return problems

print(validate({"age": 34, "score": 0.7}))
print(validate({"age": 34, "score": 7.0}))
print(validate({"age": 34}))`,
    secondTrace:
      "The first request passes, the second is rejected for a score of seven, and the third for a missing field. None of them reaches the model.",
    mistake:
      "Pinning the model version but not the library versions. A minor release that changes a default padding or a random seed produces different predictions from identical weights.",
    checkpoint:
      "Why must preprocessing be inside the artifact rather than in the serving code?",
    checkpointAnswer:
      "Two implementations of one transformation drift apart, and the model then receives inputs unlike anything it trained on.",
    remember:
      "Freeze the weights, the preprocessing, the versions and the contract.",
    checks: [
      {
        prompt: "What belongs in a deployable artifact?",
        options: [
          "Weights, preprocessing and pinned dependency versions",
          "Weights only",
          "Weights and training data",
        ],
        answerIndex: 0,
        hint: "Everything that touches the input.",
        explanations: [
          "Correct. The boundary must enclose all input handling.",
          "Preprocessing outside the boundary will drift.",
          "Training data is not needed at serving time.",
        ],
      },
      {
        prompt: "What does an input contract convert a silent error into?",
        options: [
          "A rejected request",
          "A slower response",
          "A retry",
        ],
        answerIndex: 0,
        hint: "Failing loudly is the goal.",
        explanations: [
          "Correct. A wrong answer is worse than a refusal.",
          "Validation costs almost nothing.",
          "Retrying a malformed request does not help.",
        ],
      },
      {
        prompt: "Identical weights now produce different predictions. What is the likely cause?",
        options: [
          "An unpinned library version changed a default",
          "The weights were corrupted",
          "The hardware is faulty",
        ],
        answerIndex: 0,
        hint: "Weights are only part of the behaviour.",
        explanations: [
          "Correct. This is why versions are pinned.",
          "Corruption would fail loudly.",
          "That is far rarer than a version change.",
        ],
      },
    ],
  },
  {
    lessonId: "py.mc.m8_2.l2",
    atomId: "py.atom.ml.latency-autoscaling",
    conceptId: "py.ml.latency-autoscaling",
    title: "Latency, throughput, and autoscaling",
    requires: ["py.ml.packaging-serving"],
    vocabulary: [
      ["utilisation", "arrival rate divided by the rate a set of replicas can serve"],
      ["queueing delay", "time a request spends waiting before service begins"],
      ["service level objective", "a stated latency target, usually at a high percentile"],
    ],
    opening:
      "Latency does not rise smoothly with load. It is nearly flat, then it is a cliff, and the cliff arrives before the servers look busy.",
    outcome:
      "You will size replicas from a latency target and watch what happens at ninety percent utilisation.",
    why:
      "Sizing from average utilisation puts the system on the steep part of the curve, where a small traffic increase becomes a large outage.",
    mentalModel:
      "Picture waiting time as service time multiplied by utilisation over one minus utilisation. As utilisation approaches one, that fraction runs away.",
    firstTitle: "The cliff",
    firstIntro:
      "One replica serving ten milliseconds per request handles a hundred per second in principle. Watch what the response time does as arrivals approach that.",
    firstCode: `service_ms = 10.0
capacity = 1000 / service_ms

for rate in (50, 80, 90, 95, 99):
    utilisation = rate / capacity
    wait = service_ms * utilisation / (1 - utilisation)
    print(rate, "utilisation", round(utilisation, 2),
          "response", round(wait + service_ms, 1))`,
    firstTrace:
      "Twenty milliseconds at half load, fifty at eighty percent, a hundred at ninety and a thousand at ninety-nine. The last ten percent of capacity costs ten times the latency.",
    secondTitle: "Sizing from the target",
    secondIntro:
      "Add replicas until the predicted response time meets the objective. The answer is usually one more than intuition suggests.",
    secondCode: `def replicas_for(target_ms, service_ms, rate):
    per_replica = 1000 / service_ms
    count = 1
    while True:
        utilisation = rate / (count * per_replica)
        if utilisation < 1:
            wait = service_ms * utilisation / (1 - utilisation)
            if wait + service_ms <= target_ms:
                return count, round(utilisation, 3)
        count += 1

for rate in (50, 90, 99):
    print(rate, replicas_for(200, 10, rate))`,
    secondTrace:
      "Fifty and ninety per second fit in one replica; ninety-nine needs two, which drops utilisation to under fifty percent. That headroom is the point, not waste.",
    mistake:
      "Autoscaling on average latency. The objective is normally at a high percentile, and the average stays comfortable long after the tail has broken the target.",
    checkpoint:
      "Utilisation reaches ninety-five percent. Roughly what happens to response time?",
    checkpointAnswer:
      "It rises to about twenty times the service time - the queueing term dominates once utilisation is close to one.",
    remember:
      "Size for the tail, and leave headroom before the cliff.",
    checks: [
      {
        prompt: "How does response time behave as utilisation approaches one?",
        options: [
          "It rises without bound",
          "It rises linearly",
          "It stays near the service time",
        ],
        answerIndex: 0,
        hint: "Look at the denominator of the queueing term.",
        explanations: [
          "Correct. That is the cliff.",
          "The growth is far steeper than linear.",
          "Only at low utilisation.",
        ],
      },
      {
        prompt: "Why is autoscaling on average latency a mistake?",
        options: [
          "The objective is at a high percentile the average hides",
          "Averages are expensive to compute",
          "Latency is not measurable",
        ],
        answerIndex: 0,
        hint: "Think about which requests the users complain about.",
        explanations: [
          "Correct. The tail breaks long before the mean moves.",
          "Averages are cheap.",
          "It is readily measurable.",
        ],
      },
      {
        prompt: "Adding a replica drops utilisation to fifty percent. Is that waste?",
        options: [
          "No; it is the headroom that keeps the tail acceptable",
          "Yes; half the capacity is idle",
          "Yes, unless traffic doubles",
        ],
        answerIndex: 0,
        hint: "Consider what happens to latency without it.",
        explanations: [
          "Correct. Running near capacity is what causes outages.",
          "Idle capacity is buying latency.",
          "The headroom is valuable at current traffic too.",
        ],
      },
    ],
  },
  {
    lessonId: "py.mc.m8_2.l3",
    atomId: "py.atom.ml.batching-caching",
    conceptId: "py.ml.batching-caching",
    title: "Batching and caching",
    requires: ["py.ml.latency-autoscaling"],
    vocabulary: [
      ["dynamic batching", "collecting arriving requests briefly so they can be served together"],
      ["cache key", "the exact inputs a cached prediction is valid for"],
      ["freshness", "how stale a cached answer is allowed to become"],
    ],
    opening:
      "Batching trades latency for throughput. Caching trades freshness for both. Neither is free, and both are easy to get quietly wrong.",
    outcome:
      "You will measure the throughput a batch buys and the latency it costs, and pick a size from a target.",
    why:
      "A batch of one wastes most of an accelerator's capacity; a batch of two hundred fifty-six can blow a latency budget by an order of magnitude.",
    mentalModel:
      "Picture a fixed overhead per batch plus a small cost per item. Larger batches amortise the overhead, but every request waits for the batch to fill.",
    firstTitle: "What a batch buys and costs",
    firstIntro:
      "The compute cost is a fixed overhead plus a per-item term. The latency also includes the time spent waiting for the batch to fill at the current arrival rate.",
    firstCode: `def profile(size, per_item_ms, fixed_ms, rate):
    compute = fixed_ms + size * per_item_ms
    fill_wait = size / rate * 1000 / 2
    throughput = size / compute * 1000
    return round(compute + fill_wait, 1), round(throughput, 1)

for size in (1, 4, 16, 64, 256):
    print(size, profile(size, 0.5, 8.0, 500))`,
    firstTrace:
      "A batch of one serves one hundred eighteen per second at ten milliseconds. Sixteen serves a thousand at thirty-two. Two hundred fifty-six serves eighteen hundred at three hundred ninety-two.",
    secondTitle: "Pick from the budget",
    secondIntro:
      "Choose the largest batch whose predicted latency fits the objective. Beyond that point the extra throughput is unusable.",
    secondCode: `budget = 50
best = None
for size in (1, 4, 16, 64, 256):
    latency, throughput = profile(size, 0.5, 8.0, 500)
    if latency <= budget:
        best = (size, latency, throughput)
print("chosen", best)`,
    secondTrace:
      "Sixteen fits with thirty-two milliseconds and a thousand per second. Sixty-four would nearly triple the throughput but costs twice the budget.",
    mistake:
      "Caching a prediction on the entity identifier alone. If any feature that fed the prediction can change, the key must include it or the cache serves confidently stale answers.",
    checkpoint:
      "Why does a larger batch raise latency even when compute is fast?",
    checkpointAnswer:
      "Every request also waits for the batch to fill, and that wait grows with the batch size at any fixed arrival rate.",
    remember:
      "Batch to the latency budget, and key the cache on everything that matters.",
    checks: [
      {
        prompt: "What does a larger batch cost?",
        options: [
          "Latency, from both compute and fill time",
          "Throughput",
          "Accuracy",
        ],
        answerIndex: 0,
        hint: "Requests wait for the batch to complete.",
        explanations: [
          "Correct. Throughput improves while latency degrades.",
          "Throughput is what batching buys.",
          "Predictions are unchanged.",
        ],
      },
      {
        prompt: "What must a cache key include?",
        options: [
          "Every input that could change the prediction",
          "The entity identifier only",
          "The timestamp only",
        ],
        answerIndex: 0,
        hint: "A missing input means a stale answer served confidently.",
        explanations: [
          "Correct. Otherwise the cache is silently wrong.",
          "Features change beneath a stable identifier.",
          "A timestamp alone identifies nothing.",
        ],
      },
      {
        prompt: "Throughput keeps rising with batch size. Why not use the largest?",
        options: [
          "The latency objective caps the usable size",
          "Memory is unlimited",
          "Throughput eventually falls",
        ],
        answerIndex: 0,
        hint: "Unusable throughput is not throughput.",
        explanations: [
          "Correct. Beyond the budget the gain cannot be taken.",
          "Memory is also a real limit, but not the argument here.",
          "It keeps rising, just with diminishing returns.",
        ],
      },
    ],
  },
  {
    lessonId: "py.mc.m8_2.l4",
    atomId: "py.atom.ml.online-batch-inference",
    conceptId: "py.ml.online-batch-inference",
    title: "Online and batch inference",
    requires: ["py.ml.batching-caching"],
    vocabulary: [
      ["online inference", "computing a prediction when the request arrives"],
      ["batch inference", "precomputing predictions on a schedule and serving them from a store"],
      ["staleness", "how old a precomputed prediction is when it is served"],
    ],
    opening:
      "Not every prediction needs to be computed at request time. Deciding which do is mostly a question about how fast the inputs change.",
    outcome:
      "You will choose between the two modes from freshness, volume and cost, and quantify the staleness a schedule implies.",
    why:
      "Precomputing is far cheaper per prediction and far simpler to operate. Paying for online inference where it is not needed is a common and expensive default.",
    mentalModel:
      "Picture two clocks: how often the inputs change, and how often you recompute. Serving is safe while the second is faster than the first.",
    firstTitle: "How stale is the answer",
    firstIntro:
      "A nightly job means a prediction can be up to a day old when served. Whether that matters depends entirely on how fast the inputs move.",
    firstCode: `def worst_staleness(schedule_hours):
    return schedule_hours

cases = [("nightly", 24, 168), ("hourly", 1, 168),
         ("nightly", 24, 6), ("streaming", 0.01, 6)]
for name, schedule, input_change_hours in cases:
    stale = worst_staleness(schedule)
    print(f"{name:10} stale up to {stale:>5}h  inputs move every "
          f"{input_change_hours}h  safe: {stale < input_change_hours}")`,
    firstTrace:
      "Nightly is safe when inputs move weekly and unsafe when they move every six hours. The schedule alone does not decide it; the comparison does.",
    secondTitle: "The cost difference",
    secondIntro:
      "Precomputing runs once per entity per cycle. Online inference runs once per request, and popular entities are requested many times.",
    secondCode: `entities, requests_per_day = 1_000_000, 20_000_000
print("batch predictions per day", entities)
print("online predictions per day", requests_per_day)
print("ratio", requests_per_day // entities)`,
    secondTrace:
      "Twenty times as many predictions online as precomputed, for the same set of entities. That ratio is the price of computing on demand.",
    mistake:
      "Precomputing for every entity when only a fraction are ever requested. A long tail that is never served makes the batch job mostly wasted work.",
    checkpoint:
      "What decides whether a nightly precomputation is acceptable?",
    checkpointAnswer:
      "Whether the inputs change more slowly than the schedule. If they move faster, the served prediction is already wrong.",
    remember:
      "Compare the schedule to how fast the inputs move.",
    checks: [
      {
        prompt: "When is batch inference safe?",
        options: [
          "When inputs change more slowly than the recomputation schedule",
          "When the model is small",
          "When traffic is low",
        ],
        answerIndex: 0,
        hint: "Compare the two clocks.",
        explanations: [
          "Correct. Otherwise the stored prediction is stale.",
          "Model size is not the criterion.",
          "Traffic affects cost, not correctness.",
        ],
      },
      {
        prompt: "Why is batch inference usually cheaper per prediction?",
        options: [
          "It computes once per entity rather than once per request",
          "It uses a smaller model",
          "It skips preprocessing",
        ],
        answerIndex: 0,
        hint: "Popular entities are requested repeatedly.",
        explanations: [
          "Correct. The ratio can be twenty to one or more.",
          "The model is the same.",
          "Preprocessing still happens.",
        ],
      },
      {
        prompt: "Only two percent of entities are ever requested. What follows?",
        options: [
          "Precomputing all of them wastes most of the job",
          "Batch inference is still clearly cheaper",
          "Online inference becomes impossible",
        ],
        answerIndex: 0,
        hint: "The cost comparison depends on the request distribution.",
        explanations: [
          "Correct. A long unused tail flips the economics.",
          "It may not be, at that request rate.",
          "Online inference remains available.",
        ],
      },
    ],
  },
  {
    lessonId: "py.mc.m8_2.l5",
    atomId: "py.atom.ml.safe-rollout",
    conceptId: "py.ml.safe-rollout",
    title: "Safe rollout",
    requires: ["py.ml.online-batch-inference"],
    vocabulary: [
      ["shadow traffic", "sending real requests to a new model without using its answers"],
      ["canary", "routing a small share of live traffic to the new version"],
      ["rollback", "returning to the outgoing version quickly and without a rebuild"],
    ],
    opening:
      "A new model that is better on the evaluation set can still be worse in production. The rollout is how you find that out cheaply.",
    outcome:
      "You will stage a release through shadow and canary phases and quantify how many requests each stage puts at risk.",
    why:
      "The cost of a bad deploy is proportional to the traffic it touches. Staging converts a potential outage into a small, reversible experiment.",
    mentalModel:
      "Picture a dial from zero to a hundred percent. Shadow is zero with real inputs, canary is a percent or two, and full is the last turn of all.",
    firstTitle: "Exposure per stage",
    firstIntro:
      "Each stage names the share of traffic whose answers come from the new version. Shadow is the only one where a wrong answer reaches nobody.",
    firstCode: `daily = 1_000_000
stages = [("shadow", 0.0), ("canary", 0.01),
          ("ramp", 0.25), ("full", 1.0)]

for name, share in stages:
    print(f"{name:8} share {share:>5}  requests affected "
          f"{int(daily * share):>9}")`,
    firstTrace:
      "Shadow risks nothing, canary risks ten thousand requests, the ramp risks a quarter of a million. Each stage is a chance to stop before the next.",
    secondTitle: "Rollback has to be fast",
    secondIntro:
      "A rollback requiring a rebuild is not a rollback. Keeping the outgoing artifact loaded turns recovery from twenty minutes into one.",
    secondCode: `def damage(requests_per_minute, detect_minutes, recover_minutes):
    return requests_per_minute * (detect_minutes + recover_minutes)

print("rebuild path ", damage(700, 4, 20))
print("preloaded path", damage(700, 4, 1))`,
    secondTrace:
      "Sixteen thousand eight hundred affected requests against three thousand five hundred. The difference is entirely in how the rollback was prepared.",
    mistake:
      "Comparing the canary against the evaluation set instead of against the current production version on the same traffic. Only the side-by-side comparison controls for the traffic mix.",
    checkpoint:
      "What does shadow traffic test that an offline evaluation cannot?",
    checkpointAnswer:
      "Behaviour on the real request distribution, including malformed inputs, latency under real load and the serving path itself.",
    remember:
      "Shadow, canary, ramp, full - and keep the outgoing version warm.",
    checks: [
      {
        prompt: "What makes shadow traffic safe?",
        options: [
          "Its answers are recorded but never returned to users",
          "It uses synthetic requests",
          "It runs at low volume",
        ],
        answerIndex: 0,
        hint: "The inputs are real; the outputs go nowhere.",
        explanations: [
          "Correct. That is what makes it risk-free.",
          "The requests are real production traffic.",
          "It can run at full volume.",
        ],
      },
      {
        prompt: "Why must the outgoing artifact stay loaded?",
        options: [
          "So rollback takes a minute rather than a rebuild",
          "To save storage",
          "To serve as a fallback model",
        ],
        answerIndex: 0,
        hint: "Recovery time multiplies by the request rate.",
        explanations: [
          "Correct. Damage scales with how long recovery takes.",
          "It costs storage rather than saving it.",
          "It is the rollback target, not a blend.",
        ],
      },
      {
        prompt: "What should a canary be compared against?",
        options: [
          "The current production version on the same traffic",
          "The offline evaluation set",
          "The previous canary",
        ],
        answerIndex: 0,
        hint: "Control for the traffic mix.",
        explanations: [
          "Correct. Side-by-side is the only fair comparison.",
          "Offline metrics do not reflect live traffic.",
          "That compares two unproven versions.",
        ],
      },
    ],
  },
];

export const ML_SERVING_ATOMS = ML_SERVING_SPECS.map(guidedMasteryAtom);
export const ML_SERVING_CONCEPTS = ML_SERVING_SPECS.map(guidedMasteryConcept);
export const ML_SERVING_LESSON_CONTENT = guidedLessonContent(ML_SERVING_SPECS);

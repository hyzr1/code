import {
  guidedLessonContent,
  guidedMasteryAtom,
  guidedMasteryConcept,
  type GuidedMasterySpec,
} from "./guidedMastery";

const ML_DISTRIBUTED_SPECS: GuidedMasterySpec[] = [
  {
    lessonId: "py.mc.m9_2.l1",
    atomId: "py.atom.ml.mixed-precision",
    conceptId: "py.ml.mixed-precision",
    title: "Mixed precision and loss scaling",
    requires: ["py.ml.data-curation"],
    vocabulary: [
      ["half precision", "a sixteen-bit float with a narrow exponent range"],
      ["underflow", "a value too small to represent, stored as zero"],
      ["loss scaling", "multiplying the loss so gradients land inside the representable range"],
    ],
    opening:
      "Half precision halves the memory and roughly doubles the throughput. It also silently rounds small gradients to zero, which is what loss scaling exists to prevent.",
    outcome:
      "You will find where half precision underflows and overflows, and recover a lost gradient by scaling it.",
    why:
      "The memory saving is what makes large models trainable at all, and the failure mode is silent - the loss simply stops improving.",
    mentalModel:
      "Picture a narrow window of representable magnitudes. Gradients naturally sit underneath that window, so you shift them up before storing and shift back afterwards.",
    firstTitle: "The window",
    firstIntro:
      "Above about sixty-five thousand it overflows to infinity, and below about a hundred-millionth it collapses to zero. Both ends matter.",
    firstCode: `import struct

def half(x):
    try:
        return struct.unpack("e", struct.pack("e", x))[0]
    except OverflowError:
        return float("inf")

for value in (1.0, 1e-4, 1e-6, 1e-8, 65504.0, 70000.0):
    print(value, half(value))`,
    firstTrace:
      "One and sixty-five thousand five hundred and four survive exactly. A hundred-millionth becomes zero and seventy thousand becomes infinity.",
    secondTitle: "Scaling recovers the gradient",
    secondIntro:
      "Multiply the loss by a constant before the backward pass and divide the gradients by the same constant afterwards. The value returns; the precision improves.",
    secondCode: `gradient = 3e-8
print("unscaled", half(gradient))

for scale in (1, 1024, 65536):
    stored = half(gradient * scale)
    print("scale", scale, "stored", stored,
          "recovered", stored / scale)`,
    secondTrace:
      "Unscaled it lands on a subnormal with fifty percent error. At a scale of sixty-five thousand it recovers to within a fraction of a percent of the true value.",
    mistake:
      "Choosing a fixed scale and leaving it. Too small and gradients still underflow; too large and they overflow to infinity, so production implementations adjust it dynamically from observed overflows.",
    checkpoint:
      "Training in half precision stops improving and no error appears. What is the likely cause?",
    checkpointAnswer:
      "Gradients are underflowing to zero, so the update is zero. Loss scaling shifts them into the representable window.",
    remember:
      "Scale up before the backward pass, scale down after.",
    checks: [
      {
        prompt: "What is the silent failure of half precision?",
        options: [
          "Small gradients round to zero and the update vanishes",
          "The loss becomes negative",
          "Weights are corrupted",
        ],
        answerIndex: 0,
        hint: "Nothing raises an error.",
        explanations: [
          "Correct. The loss simply stops improving.",
          "The loss remains well defined.",
          "Weights are typically kept in full precision.",
        ],
      },
      {
        prompt: "What does loss scaling multiply?",
        options: [
          "The loss, before the backward pass",
          "The learning rate",
          "The weights",
        ],
        answerIndex: 0,
        hint: "Gradients inherit the factor by the chain rule.",
        explanations: [
          "Correct, and the gradients are divided back afterwards.",
          "Scaling the learning rate does not fix representation.",
          "Weights are unaffected.",
        ],
      },
      {
        prompt: "Why is the scale adjusted dynamically?",
        options: [
          "A fixed scale either underflows or overflows as training progresses",
          "To reduce memory",
          "To speed up the optimizer",
        ],
        answerIndex: 0,
        hint: "Gradient magnitudes change over a run.",
        explanations: [
          "Correct. Implementations back off on observed overflows.",
          "Memory is unaffected by the scale.",
          "The optimizer is unchanged.",
        ],
      },
    ],
  },
  {
    lessonId: "py.mc.m9_2.l2",
    atomId: "py.atom.ml.gradient-checkpointing",
    conceptId: "py.ml.gradient-checkpointing",
    title: "Gradient checkpointing",
    requires: ["py.ml.mixed-precision"],
    vocabulary: [
      ["activation memory", "the stored forward values the backward pass needs"],
      ["segment", "a group of layers whose activations are recomputed rather than stored"],
      ["recomputation cost", "the extra forward work paid to avoid storing activations"],
    ],
    opening:
      "The backward pass needs the forward activations. Storing them all is what actually limits model size, and recomputing some of them buys the memory back.",
    outcome:
      "You will find the segment count that minimises activation memory and quantify the time it costs.",
    why:
      "Activation memory usually exceeds parameter memory in deep models, so this is often the difference between a model that fits and one that does not.",
    mentalModel:
      "Picture keeping one activation per segment boundary and throwing the rest away. The backward pass replays each segment from its boundary when it needs it.",
    firstTitle: "The memory-time curve",
    firstIntro:
      "More segments means fewer stored activations inside each, but more boundaries to store. The total has a minimum in the middle.",
    firstCode: `import math

def profile(layers, per_layer_mb, segments):
    stored = math.ceil(layers / segments) + segments
    extra = (layers / segments - 1) / layers
    return stored * per_layer_mb, round(1 + extra, 3)

for segments in (2, 4, 8, 16, 48):
    memory, time = profile(48, 120, segments)
    print(f"segments {segments:>3} memory {memory:>5} MB time x{time}")`,
    firstTrace:
      "Eight segments needs one thousand six hundred eighty megabytes against five thousand eight hundred eighty for storing everything - a three and a half times saving for ten percent more time.",
    secondTitle: "Where the minimum sits",
    secondIntro:
      "The stored count is layers over segments plus segments. That sum is smallest when the two terms match, which is at the square root of the layer count.",
    secondCode: `import math

layers = 48
print("square root of layers:", round(math.sqrt(layers), 2))
for segments in (6, 7, 8, 9):
    stored = math.ceil(layers / segments) + segments
    print("segments", segments, "stored activations", stored)`,
    secondTrace:
      "Seven is the square root and the stored count bottoms out at fourteen around there. The curve is flat nearby, so the exact choice matters little.",
    mistake:
      "Checkpointing every layer to minimise memory. That maximises recomputation for almost no extra saving, because the boundary count then dominates the stored total.",
    checkpoint:
      "How many segments minimise stored activations for a network of a hundred layers?",
    checkpointAnswer:
      "About ten - the square root of the layer count, where the per-segment and boundary terms balance.",
    remember:
      "Segment count near the square root of the depth.",
    checks: [
      {
        prompt: "What does gradient checkpointing trade away?",
        options: [
          "Time, by recomputing activations",
          "Accuracy",
          "Batch size",
        ],
        answerIndex: 0,
        hint: "The results are identical.",
        explanations: [
          "Correct. The gradients are exactly the same.",
          "Nothing about the mathematics changes.",
          "It usually allows a larger batch.",
        ],
      },
      {
        prompt: "Roughly how many segments minimise stored activations?",
        options: [
          "The square root of the layer count",
          "One",
          "The layer count",
        ],
        answerIndex: 0,
        hint: "Two terms balance at that point.",
        explanations: [
          "Correct, and the curve is flat nearby.",
          "That stores a whole segment's activations.",
          "That maximises boundaries.",
        ],
      },
      {
        prompt: "Why does checkpointing every layer help little?",
        options: [
          "The boundary count then dominates the stored total",
          "Recomputation becomes free",
          "The gradients become approximate",
        ],
        answerIndex: 0,
        hint: "Every boundary is itself a stored activation.",
        explanations: [
          "Correct, for maximum recomputation cost.",
          "Recomputation is at its most expensive there.",
          "Gradients stay exact throughout.",
        ],
      },
    ],
  },
  {
    lessonId: "py.mc.m9_2.l3",
    atomId: "py.atom.ml.data-parallelism",
    conceptId: "py.ml.data-parallelism",
    title: "Data parallelism",
    requires: ["py.ml.gradient-checkpointing"],
    vocabulary: [
      ["replica", "one complete copy of the model on one device"],
      ["effective batch", "the total examples contributing to one weight update"],
      ["gradient accumulation", "summing gradients over several steps before updating"],
    ],
    opening:
      "Every device holds the whole model and a slice of the batch. The gradients are averaged, so the result is identical to one enormous batch on one device.",
    outcome:
      "You will compute the effective batch from devices and accumulation, and scale the learning rate to match it.",
    why:
      "Effective batch is the quantity that actually determines training dynamics, and it is easy to change it accidentally by adding devices.",
    mentalModel:
      "Picture the same model on every device processing different examples. Averaging the gradients is exactly what one device would compute on all of them.",
    firstTitle: "What the batch really is",
    firstIntro:
      "The per-device batch is not the batch. Multiply by the device count and by the accumulation steps to get the number that matters.",
    firstCode: `def effective_batch(per_device, devices, accumulation):
    return per_device * devices * accumulation

for devices, accumulation in [(1, 1), (8, 1), (8, 4),
                              (256, 1), (256, 8)]:
    print(f"devices {devices:>4} accumulation {accumulation} "
          f"effective batch {effective_batch(32, devices, accumulation):>7}")`,
    firstTrace:
      "Thirty-two on one device becomes sixty-five thousand five hundred thirty-six across two hundred fifty-six devices with eight accumulation steps. Nothing in the code said so.",
    secondTitle: "The learning rate follows",
    secondIntro:
      "A larger batch gives a less noisy gradient, so the step can be larger. Scaling the rate with the batch keeps the training dynamics comparable.",
    secondCode: `def scaled_rate(base, batch, reference=256):
    return round(base * batch / reference, 6)

for batch in (256, 2048, 8192, 65536):
    print(batch, scaled_rate(1e-3, batch))`,
    secondTrace:
      "A thousandth at the reference batch becomes a quarter at sixty-five thousand. That rate needs a warmup, or the first steps destroy the initialisation.",
    mistake:
      "Adding devices and leaving the learning rate alone. The effective batch has grown but each step has not, so the run is now taking many more, much smaller steps than intended.",
    checkpoint:
      "The device count doubles and the per-device batch is unchanged. What else must change?",
    checkpointAnswer:
      "The learning rate, because the effective batch has doubled and the gradient is correspondingly less noisy.",
    remember:
      "Effective batch is per-device times devices times accumulation.",
    checks: [
      {
        prompt: "What does each device hold in data parallelism?",
        options: [
          "A complete copy of the model",
          "One layer of the model",
          "A shard of the parameters",
        ],
        answerIndex: 0,
        hint: "Only the data is split.",
        explanations: [
          "Correct. That is what limits it to models that fit.",
          "That is pipeline parallelism.",
          "That is sharded training.",
        ],
      },
      {
        prompt: "What is the effective batch?",
        options: [
          "Per-device batch times devices times accumulation steps",
          "The per-device batch",
          "The device count",
        ],
        answerIndex: 0,
        hint: "All three contribute to one update.",
        explanations: [
          "Correct, and it is what governs the dynamics.",
          "That is only one factor of three.",
          "Batch size has to appear.",
        ],
      },
      {
        prompt: "Why does a large batch need a learning-rate warmup?",
        options: [
          "The scaled rate is large enough to destroy the initialisation",
          "The gradients are noisier",
          "Memory fills gradually",
        ],
        answerIndex: 0,
        hint: "The scaled rate applies from the first step.",
        explanations: [
          "Correct. Warmup ramps into it.",
          "A large batch gives less noise, not more.",
          "Memory is allocated up front.",
        ],
      },
    ],
  },
  {
    lessonId: "py.mc.m9_2.l4",
    atomId: "py.atom.ml.model-parallelism",
    conceptId: "py.ml.model-parallelism",
    title: "Model, tensor, and pipeline parallelism",
    requires: ["py.ml.data-parallelism"],
    vocabulary: [
      ["tensor parallelism", "splitting a single operation's weights across devices"],
      ["pipeline parallelism", "placing consecutive layers on different devices"],
      ["pipeline bubble", "the idle time while a pipeline fills and drains"],
    ],
    opening:
      "When the model does not fit on one device, replication is not an option. Something has to be split, and the choice of what to split has very different costs.",
    outcome:
      "You will check whether a model fits, and compute the idle fraction a pipeline pays for a given number of microbatches.",
    why:
      "Pipeline bubbles can waste most of a cluster if the microbatch count is chosen badly, and the fix is arithmetic rather than engineering.",
    mentalModel:
      "Picture a factory line. Until every station has work the line is partly idle, and the smaller each batch is, the shorter that startup is relative to the run.",
    firstTitle: "Does it fit",
    firstIntro:
      "Weights, gradients and optimizer state together cost about sixteen bytes per parameter. Dividing by the shard count says how many devices are needed.",
    firstCode: `def per_device_gb(params_billions, shards, bytes_each=16):
    total = params_billions * 1e9 * bytes_each
    return round(total / shards / 1e9, 2)

for shards in (1, 8, 64, 512):
    need = per_device_gb(70, shards)
    print(f"shards {shards:>4} needs {need:>7} GB per device "
          f"fits80: {need <= 80}")`,
    firstTrace:
      "A seventy-billion-parameter model needs one thousand one hundred twenty gigabytes in total. It first fits an eighty-gigabyte device at sixty-four shards.",
    secondTitle: "The bubble",
    secondIntro:
      "A pipeline of several stages is idle while it fills and drains. Splitting the batch into more microbatches amortises that startup.",
    secondCode: `def bubble(stages, microbatches):
    return round((stages - 1) / (stages - 1 + microbatches) * 100, 1)

for microbatches in (1, 4, 16, 64):
    print("microbatches", microbatches,
          "idle", bubble(8, microbatches), "percent")`,
    secondTrace:
      "One microbatch wastes eighty-seven percent of an eight-stage pipeline. Sixty-four microbatches brings it under ten.",
    mistake:
      "Splitting across stages without enough microbatches to fill them. The devices are allocated and busy-looking, and most of their time is spent waiting for work to arrive.",
    checkpoint:
      "An eight-stage pipeline runs one microbatch per step. How much of the cluster is idle?",
    checkpointAnswer:
      "About eighty-seven percent. Seven of the eight stages have nothing to do at any moment.",
    remember:
      "Split when it does not fit, and fill the pipeline with microbatches.",
    checks: [
      {
        prompt: "What does tensor parallelism split?",
        options: [
          "The weights of a single operation",
          "Consecutive layers",
          "The training batch",
        ],
        answerIndex: 0,
        hint: "It works inside one operation.",
        explanations: [
          "Correct, which needs fast interconnect between the devices.",
          "That is pipeline parallelism.",
          "That is data parallelism.",
        ],
      },
      {
        prompt: "What causes a pipeline bubble?",
        options: [
          "Stages idle while the pipeline fills and drains",
          "Network congestion",
          "Uneven layer sizes",
        ],
        answerIndex: 0,
        hint: "It is inherent to the schedule.",
        explanations: [
          "Correct, and more microbatches amortise it.",
          "Congestion is a separate problem.",
          "Imbalance adds to it but is not the cause.",
        ],
      },
      {
        prompt: "How is the bubble reduced?",
        options: [
          "More microbatches per step",
          "Fewer devices",
          "A larger learning rate",
        ],
        answerIndex: 0,
        hint: "The startup is amortised over the work.",
        explanations: [
          "Correct. Sixty-four brings eight stages under ten percent.",
          "Fewer stages helps, but that limits model size.",
          "Optimisation settings are unrelated.",
        ],
      },
    ],
  },
  {
    lessonId: "py.mc.m9_2.l5",
    atomId: "py.atom.ml.sharded-training",
    conceptId: "py.ml.sharded-training",
    title: "ZeRO and fully sharded training",
    requires: ["py.ml.model-parallelism"],
    vocabulary: [
      ["optimizer state", "the moments and copies an optimizer keeps per parameter"],
      ["sharding stage", "which of optimizer state, gradients and parameters are split across devices"],
      ["gather on demand", "reconstructing a shard's parameters only while they are needed"],
    ],
    opening:
      "The weights are the smallest part of the memory. The optimizer state is usually six times larger, and sharding it costs almost nothing.",
    outcome:
      "You will account for memory per device at each sharding stage and see where the big win actually is.",
    why:
      "Sharding the optimizer state alone often takes a model from not fitting to fitting, without any of the complexity of splitting the computation.",
    mentalModel:
      "Picture three piles per parameter: weights, gradients and optimizer state. Sharding takes them one pile at a time, cheapest first.",
    firstTitle: "Where the memory actually is",
    firstIntro:
      "Two bytes for the weight, two for its gradient, and about twelve for the optimizer's moments and master copy. The last one dominates.",
    firstCode: `def per_device_gb(params_billions, devices, stage):
    p = params_billions * 1e9
    weights, grads, optimizer = p * 2, p * 2, p * 12
    if stage == 0:
        total = weights + grads + optimizer
    elif stage == 1:
        total = weights + grads + optimizer / devices
    elif stage == 2:
        total = weights + (grads + optimizer) / devices
    else:
        total = (weights + grads + optimizer) / devices
    return round(total / 1e9, 2)

for stage in (0, 1, 2, 3):
    print("stage", stage, per_device_gb(7, 64, stage), "GB per device")`,
    firstTrace:
      "One hundred twelve gigabytes unsharded, twenty-nine after sharding the optimizer alone, and one point seven five when everything is sharded.",
    secondTitle: "The first step is the cheap one",
    secondIntro:
      "Sharding the optimizer state changes nothing about the forward or backward pass. Sharding the parameters requires gathering them before every use.",
    secondCode: `stages = [(0, "none", "no extra communication"),
          (1, "optimizer state", "no extra communication"),
          (2, "and gradients", "reduce-scatter instead of all-reduce"),
          (3, "and parameters", "gather before every layer")]

for number, what, cost in stages:
    print(f"stage {number}: shard {what:<16} -> {cost}")`,
    secondTrace:
      "The first stage is free in communication terms and removes three quarters of the memory. Each later stage buys less and costs more.",
    mistake:
      "Reaching for full parameter sharding first. It gathers weights before every layer, so on a slow interconnect the run becomes communication-bound when a cheaper stage would have been enough.",
    checkpoint:
      "Which part of per-parameter memory is largest?",
    checkpointAnswer:
      "The optimizer state, at roughly twelve bytes per parameter against two each for the weight and its gradient.",
    remember:
      "Shard the optimizer state first; it is free and it is most of the memory.",
    checks: [
      {
        prompt: "Which sharding stage gives the largest saving for the least cost?",
        options: [
          "Sharding the optimizer state",
          "Sharding the parameters",
          "Sharding the gradients",
        ],
        answerIndex: 0,
        hint: "It adds no communication at all.",
        explanations: [
          "Correct. It removes about three quarters of the memory.",
          "That is the most expensive stage.",
          "That helps, but less than the optimizer state.",
        ],
      },
      {
        prompt: "What does full parameter sharding require at each layer?",
        options: [
          "Gathering the parameters before use",
          "A second backward pass",
          "Recomputing activations",
        ],
        answerIndex: 0,
        hint: "No device holds a whole layer.",
        explanations: [
          "Correct, which is why interconnect speed decides whether it pays.",
          "The backward pass is unchanged.",
          "That is gradient checkpointing.",
        ],
      },
      {
        prompt: "Roughly how much memory does the optimizer state take per parameter?",
        options: ["About twelve bytes", "About two bytes", "About one byte"],
        answerIndex: 0,
        hint: "Moments plus a full-precision master copy.",
        explanations: [
          "Correct. That dwarfs the weight and its gradient.",
          "That is the weight alone in half precision.",
          "Far too small for moments and a master copy.",
        ],
      },
    ],
  },
  {
    lessonId: "py.mc.m9_2.l6",
    atomId: "py.atom.ml.collective-communication",
    conceptId: "py.ml.collective-communication",
    title: "Distributed communication",
    requires: ["py.ml.sharded-training"],
    vocabulary: [
      ["all-reduce", "combining a value across every device so all end up with the result"],
      ["ring algorithm", "passing partial results around a cycle so no device is a bottleneck"],
      ["reduce-scatter", "combining across devices while leaving each with one slice of the result"],
    ],
    opening:
      "Every synchronous step ends with the same operation: combine the gradients across every device. How that is implemented decides whether the cluster scales.",
    outcome:
      "You will compare the cost of a ring all-reduce against gathering to one device, and see why one scales and the other does not.",
    why:
      "At a few hundred devices a naive gather saturates one link and the whole cluster waits on it.",
    mentalModel:
      "Picture the devices in a circle, each passing a slice to its neighbour. Every link carries the same load, so no one device is the bottleneck.",
    firstTitle: "The ring cost",
    firstIntro:
      "Each device sends roughly twice the payload, scaled by one minus the reciprocal of the device count. That factor approaches two and then stops.",
    firstCode: `def ring_ms(payload_bytes, devices, gbps):
    moved = 2 * payload_bytes * (devices - 1) / devices
    return round(moved / (gbps * 1e9) * 1000, 2)

payload = 7e9 * 2
for devices in (8, 64, 512):
    print(devices, "devices", ring_ms(payload, devices, 400), "ms")`,
    firstTrace:
      "Sixty-one milliseconds at eight devices, sixty-nine at five hundred twelve. The cost is essentially flat because the factor saturates at two.",
    secondTitle: "Why gathering to one fails",
    secondIntro:
      "If every device sends its whole payload to a single one, that device's link carries the entire cluster. The cost grows with the device count.",
    secondCode: `def gather_ms(payload_bytes, devices, gbps):
    return round(payload_bytes * (devices - 1) / (gbps * 1e9) * 1000, 2)

for devices in (8, 64, 512):
    print(devices, "ring", ring_ms(payload, devices, 400),
          "gather-to-one", gather_ms(payload, devices, 400))`,
    secondTrace:
      "At five hundred twelve devices the ring costs seventy milliseconds and gathering costs seventeen thousand nine hundred - two hundred fifty times more.",
    mistake:
      "Treating communication as free because the profile shows high accelerator utilisation. Overlapping communication with computation hides it in the profile without removing it from the critical path.",
    checkpoint:
      "Why is a ring all-reduce nearly independent of the device count?",
    checkpointAnswer:
      "Each device sends a fixed fraction of the payload regardless of how many there are, so the per-device load saturates rather than growing.",
    remember:
      "Ring for all-reduce; never gather to one.",
    checks: [
      {
        prompt: "What does an all-reduce leave on each device?",
        options: [
          "The combined result, identical everywhere",
          "Its own contribution only",
          "One slice of the result",
        ],
        answerIndex: 0,
        hint: "That is what distinguishes it from reduce-scatter.",
        explanations: [
          "Correct. Every device ends up with the same value.",
          "That would be no communication at all.",
          "That is reduce-scatter.",
        ],
      },
      {
        prompt: "Why does the ring algorithm scale?",
        options: [
          "Every link carries the same load, so no device is a bottleneck",
          "It sends less total data",
          "It skips some devices",
        ],
        answerIndex: 0,
        hint: "Compare it with one device receiving everything.",
        explanations: [
          "Correct. The per-device cost saturates.",
          "It moves about twice the payload per device.",
          "Every device participates.",
        ],
      },
      {
        prompt: "Overlapping communication with computation does what?",
        options: [
          "Hides it in the profile without removing it from the critical path",
          "Eliminates the cost",
          "Reduces the bytes moved",
        ],
        answerIndex: 0,
        hint: "The bytes still have to move.",
        explanations: [
          "Correct, which is why high utilisation can be misleading.",
          "The transfer still takes time.",
          "The payload is unchanged.",
        ],
      },
    ],
  },
];

export const ML_DISTRIBUTED_ATOMS = ML_DISTRIBUTED_SPECS.map(guidedMasteryAtom);
export const ML_DISTRIBUTED_CONCEPTS = ML_DISTRIBUTED_SPECS.map(guidedMasteryConcept);
export const ML_DISTRIBUTED_LESSON_CONTENT = guidedLessonContent(ML_DISTRIBUTED_SPECS);

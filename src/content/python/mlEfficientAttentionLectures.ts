import {
  guidedLessonContent,
  guidedMasteryAtom,
  guidedMasteryConcept,
  type GuidedMasterySpec,
} from "./guidedMastery";

const ML_EFFICIENT_ATTENTION_SPECS: GuidedMasterySpec[] = [
  {
    lessonId: "py.mc.m9_3.l1",
    atomId: "py.atom.ml.flash-attention",
    conceptId: "py.ml.flash-attention",
    title: "FlashAttention and IO-aware kernels",
    requires: ["py.ml.collective-communication"],
    vocabulary: [
      ["memory traffic", "bytes moved between fast on-chip memory and slower device memory"],
      ["tiling", "processing a matrix in blocks small enough to stay in fast memory"],
      ["exact method", "an optimisation that changes the cost but not the result"],
    ],
    opening:
      "Attention is not slow because of the arithmetic. It is slow because the score matrix is written out to memory and read back, and that matrix grows with the square of the sequence.",
    outcome:
      "You will compare the memory traffic of a materialised score matrix against a tiled one, and see why the saving grows with length.",
    why:
      "This is an exact method — identical outputs at a fraction of the cost — so there is no accuracy trade-off to weigh.",
    mentalModel:
      "Picture the score matrix never existing all at once. Blocks are computed in fast memory, folded into a running result, and discarded.",
    firstTitle: "Where the bytes go",
    firstIntro:
      "The inputs are linear in the sequence length. The score matrix is quadratic, so past a certain length it is the only term that matters.",
    firstCode: `def materialised(seq, dim, bytes_each=2):
    inputs = 3 * seq * dim * bytes_each
    scores = 2 * seq * seq * bytes_each
    return inputs + scores

def tiled(seq, dim, bytes_each=2):
    return 4 * seq * dim * bytes_each

for seq in (1024, 4096, 16384, 65536):
    big, small = materialised(seq, 128), tiled(seq, 128)
    print(seq, f"{big / 1e9:.3f} GB", f"{small / 1e9:.3f} GB",
          f"x{big / small:.1f}")`,
    firstTrace:
      "Seventeen gigabytes against sixty-seven megabytes at sixty-five thousand tokens — two hundred fifty-seven times less traffic for exactly the same answer.",
    secondTitle: "The saving grows with length",
    secondIntro:
      "The ratio is not a constant. It grows linearly with the sequence, because one term is quadratic and the other is not.",
    secondCode: `previous = None
for seq in (1024, 4096, 16384, 65536):
    ratio = materialised(seq, 128) / tiled(seq, 128)
    if previous:
        print(seq, f"ratio {ratio:.1f}", f"grew x{ratio / previous:.2f}")
    previous = ratio`,
    secondTrace:
      "Each fourfold increase in sequence length roughly quadruples the saving. Short sequences barely benefit; long ones cannot be run any other way.",
    mistake:
      "Treating it as an approximation and worrying about accuracy. The outputs are numerically identical to the standard implementation; only the memory schedule differs.",
    checkpoint:
      "Why does the saving grow with sequence length?",
    checkpointAnswer:
      "The materialised score matrix is quadratic in the sequence while the inputs are linear, so the quadratic term dominates further as length grows.",
    remember:
      "Never materialise the score matrix; tile it in fast memory.",
    checks: [
      {
        question: "What actually limits standard attention at long sequence lengths?",
        choices: [
          "Memory traffic for the score matrix",
          "The number of multiplications",
          "Parameter count",
        ],
        answer: 0,
        explanation: "The arithmetic is not the bottleneck.",
        why: [
          "Correct. That is what tiling removes.",
          "Arithmetic throughput is plentiful.",
          "Attention has no parameters of its own here.",
        ],
      },
      {
        question: "How do the outputs compare to a standard implementation?",
        choices: [
          "Identical; it is an exact method",
          "Slightly approximate",
          "Better, because of tiling",
        ],
        answer: 0,
        explanation: "Only the memory schedule changes.",
        why: [
          "Correct. There is no accuracy trade-off.",
          "Nothing is approximated.",
          "The mathematics is unchanged.",
        ],
      },
      {
        question: "At which sequence length does the technique matter most?",
        choices: ["The longest", "The shortest", "It is constant"],
        answer: 0,
        explanation: "One term is quadratic.",
        why: [
          "Correct. The saving grows with length.",
          "Short sequences barely benefit.",
          "The ratio grows linearly with the sequence.",
        ],
      },
    ],
  },
  {
    lessonId: "py.mc.m9_3.l2",
    atomId: "py.atom.ml.long-context",
    conceptId: "py.ml.long-context",
    title: "Long-context methods",
    requires: ["py.ml.flash-attention"],
    vocabulary: [
      ["sliding window", "attending only to a fixed number of nearby positions"],
      ["sparse attention", "attending to a chosen subset of positions rather than all of them"],
      ["linear attention", "an approximation whose cost grows with the sequence rather than its square"],
    ],
    opening:
      "Exact attention on a hundred thousand tokens costs seventeen billion pair scores. Every long-context method is a decision about which pairs to give up.",
    outcome:
      "You will compare the cost of full, windowed and linear attention, and say what each one gives up.",
    why:
      "The choice is not about speed alone. A sliding window cannot represent a dependency longer than its width, however fast it runs.",
    mentalModel:
      "Picture the attention matrix as a grid. Full attention fills it; a window fills a diagonal band; linear methods replace it with a summary that never forms the grid at all.",
    firstTitle: "What a window costs and buys",
    firstIntro:
      "A window of fixed width makes the cost linear in the sequence. The saving grows with length, and so does what the window cannot see.",
    firstCode: `def full(seq):
    return seq * seq

def windowed(seq, width):
    return seq * width

for seq in (2048, 8192, 32768, 131072):
    print(seq, "full", full(seq),
          "window-512", windowed(seq, 512),
          f"x{full(seq) / windowed(seq, 512):.0f}")`,
    firstTrace:
      "Four times cheaper at two thousand tokens and two hundred fifty-six times cheaper at a hundred and thirty thousand. The window width never changed.",
    secondTitle: "Linear attention drops the grid",
    secondIntro:
      "Replacing the pairwise scores with a running summary makes the cost proportional to the sequence times the feature dimension, with no quadratic term at all.",
    secondCode: `def linear(seq, dim):
    return seq * dim

for seq in (2048, 131072):
    print(seq, "linear", linear(seq, 128), "full", full(seq))`,
    secondTrace:
      "Sixteen million against seventeen billion at a hundred and thirty thousand tokens. The summary is an approximation, and it is where the accuracy is traded away.",
    mistake:
      "Choosing a window and reporting the speedup without testing long-range dependencies. A retrieval task with the answer far from the question fails silently on a windowed model.",
    checkpoint:
      "A model uses a five-hundred-twelve-token window. What can it not represent?",
    checkpointAnswer:
      "Any direct dependency between positions more than five hundred and twelve apart. It must route that through intermediate positions or not at all.",
    remember:
      "Every long-context method gives up some pairs; know which.",
    checks: [
      {
        question: "What does a sliding window make the cost?",
        choices: [
          "Linear in the sequence length",
          "Still quadratic",
          "Constant",
        ],
        answer: 0,
        explanation: "The width is fixed.",
        why: [
          "Correct. Sequence times window width.",
          "The quadratic term is gone.",
          "It still grows with the sequence.",
        ],
      },
      {
        question: "What does a window give up?",
        choices: [
          "Direct dependencies longer than its width",
          "Numerical precision",
          "Parameter efficiency",
        ],
        answer: 0,
        explanation: "Some pairs are never scored.",
        why: [
          "Correct, and that must be tested for.",
          "Precision is unaffected.",
          "The parameter count is unchanged.",
        ],
      },
      {
        question: "How does linear attention differ from a sliding window?",
        choices: [
          "It replaces pairwise scores with a running summary",
          "It is exact",
          "It attends to more positions",
        ],
        answer: 0,
        explanation: "The grid is never formed.",
        why: [
          "Correct, and the summary is the approximation.",
          "It is an approximation, unlike tiling.",
          "It summarises rather than enumerates.",
        ],
      },
    ],
  },
  {
    lessonId: "py.mc.m9_3.l3",
    atomId: "py.atom.ml.position-schemes",
    conceptId: "py.ml.position-schemes",
    title: "Rotary and ALiBi position schemes",
    requires: ["py.ml.long-context"],
    vocabulary: [
      ["relative position", "encoding how far apart two tokens are rather than where each sits"],
      ["length extrapolation", "working at sequence lengths longer than any seen in training"],
      ["frequency band", "one pair of rotary dimensions, rotating at its own rate"],
    ],
    opening:
      "Attention is blind to order unless position is injected. The two schemes in use both encode relative distance, and they extrapolate very differently.",
    outcome:
      "You will compute both position signals and see which one degrades gracefully past its training length.",
    why:
      "A model trained at four thousand tokens and deployed at thirty-two thousand behaves according to this choice more than any other.",
    mentalModel:
      "Picture one scheme as a penalty growing with distance, and the other as a set of clock hands turning at different rates. Distant positions look far away under the first and ambiguous under the second.",
    firstTitle: "A linear penalty",
    firstIntro:
      "The simpler scheme subtracts an amount proportional to the distance before the softmax. It is unbounded, so it never runs out of room.",
    firstCode: `def bias(distance, slope):
    return -slope * distance

for distance in (0, 1, 8, 64, 512):
    print("distance", distance, "bias", round(bias(distance, 0.25), 3))`,
    firstTrace:
      "Zero at distance zero and minus one hundred twenty-eight at five hundred twelve. Nothing about the formula stops working at a longer distance than it was trained on.",
    secondTitle: "Clock hands that wrap",
    secondIntro:
      "The rotary scheme turns each dimension pair at its own rate. The fast bands complete many turns, and beyond the training length the pattern repeats.",
    secondCode: `import math

def angle(position, band, dim=128, base=10000):
    return position / base ** (2 * band / dim) % (2 * math.pi)

for position in (0, 100, 4096, 100000):
    print("position", position,
          "fast band", round(angle(position, 0), 4),
          "slow band", round(angle(position, 60), 4))`,
    secondTrace:
      "The fast band has already wrapped several times by position one hundred. The slow band is still under a radian at four thousand, and it is what carries long-range information.",
    mistake:
      "Extending the context window by changing a configuration value. Rotary frequencies were trained at one length, and running longer without rescaling them puts every distant position in an angular regime the model never saw.",
    checkpoint:
      "Why do rotary frequencies need rescaling for a longer context?",
    checkpointAnswer:
      "The slow bands were trained over a limited angular range. Beyond it the model sees angles it has no experience of, so the frequencies must be stretched to fit.",
    remember:
      "One scheme penalises distance, the other rotates — and rotation wraps.",
    checks: [
      {
        question: "What do both schemes encode?",
        choices: [
          "Relative distance between positions",
          "Absolute position only",
          "Token identity",
        ],
        answer: 0,
        explanation: "That is why they generalise at all.",
        why: [
          "Correct. Attention depends on the gap, not the index.",
          "Absolute schemes are the older approach.",
          "Identity comes from the embedding.",
        ],
      },
      {
        question: "Which bands carry long-range information in a rotary scheme?",
        choices: [
          "The slowest, which have not yet wrapped",
          "The fastest",
          "All bands equally",
        ],
        answer: 0,
        explanation: "Wrapped bands are ambiguous about distance.",
        why: [
          "Correct. The fast bands wrap within a few hundred positions.",
          "Those wrap almost immediately.",
          "The rates differ by orders of magnitude.",
        ],
      },
      {
        question: "A rotary model's context is extended eightfold by configuration alone. What happens?",
        choices: [
          "Distant positions land in angles the model never saw",
          "Nothing; the scheme is unbounded",
          "Memory use falls",
        ],
        answer: 0,
        explanation: "The frequencies were trained at one length.",
        why: [
          "Correct. The frequencies must be rescaled.",
          "That describes the linear-penalty scheme instead.",
          "Memory rises with the longer context.",
        ],
      },
    ],
  },
  {
    lessonId: "py.mc.m9_3.l4",
    atomId: "py.atom.ml.mixture-of-experts",
    conceptId: "py.ml.mixture-of-experts",
    title: "Mixture of experts",
    requires: ["py.ml.position-schemes"],
    vocabulary: [
      ["conditional compute", "using only part of the parameters for any given input"],
      ["router", "the component choosing which experts each token is sent to"],
      ["load balance", "how evenly tokens are distributed across the experts"],
    ],
    opening:
      "A model can have far more parameters than it uses on any one token. The router decides which few experts see it, and everything else stays idle.",
    outcome:
      "You will compute the ratio of total to active parameters, and measure the imbalance that wastes the arrangement.",
    why:
      "It decouples capacity from cost, which is the only way to keep growing parameters once compute per token is fixed.",
    mentalModel:
      "Picture a wide row of specialists. Each token is sent to two of them, so the model holds far more knowledge than any one token pays for.",
    firstTitle: "Capacity without cost",
    firstIntro:
      "Total parameters scale with the expert count. Active parameters scale with how many each token visits, which stays small.",
    firstCode: `def ratio(experts, top_k, per_expert_billions):
    total = experts * per_expert_billions
    active = top_k * per_expert_billions
    return total, active, round(total / active, 1)

for experts, top_k in [(8, 2), (64, 2), (128, 4)]:
    print(experts, "experts top", top_k, ratio(experts, top_k, 1.0))`,
    firstTrace:
      "Sixty-four experts choosing two gives thirty-two times the parameters for the same compute per token. That ratio is the entire proposition.",
    secondTitle: "Balance decides whether it works",
    secondIntro:
      "If the router sends most tokens to a few experts, those become the bottleneck and the rest of the capacity is never used.",
    secondCode: `def balance(assignments, experts):
    counts = [0] * experts
    for expert in assignments:
        counts[expert] += 1
    ideal = len(assignments) / experts
    return counts, round(max(counts) / ideal, 2)

print(balance([0, 0, 0, 0, 1, 1, 2, 3], 4))
print(balance([0, 1, 2, 3, 0, 1, 2, 3], 4))`,
    secondTrace:
      "The imbalanced routing puts twice the ideal load on one expert; the balanced one puts exactly the ideal on each. The step time follows the busiest expert.",
    mistake:
      "Training without a load-balancing term in the loss. The router collapses onto a handful of experts, and the model ends up with the cost of many parameters and the capacity of few.",
    checkpoint:
      "A model has sixty-four experts and routes each token to two. How does its cost compare to a dense model of the same total size?",
    checkpointAnswer:
      "About thirty-two times cheaper per token, because only two experts do any work for each one.",
    remember:
      "Capacity from many experts, cost from the few that fire.",
    checks: [
      {
        question: "What does a mixture of experts decouple?",
        choices: [
          "Total parameters from compute per token",
          "Depth from width",
          "Training from inference",
        ],
        answer: 0,
        explanation: "Only a few experts fire per token.",
        why: [
          "Correct. That is conditional compute.",
          "Both remain architecture choices.",
          "Both use the same routing.",
        ],
      },
      {
        question: "What happens without a load-balancing term?",
        choices: [
          "The router collapses onto a few experts",
          "Training diverges",
          "The experts become identical",
        ],
        answer: 0,
        explanation: "Nothing otherwise encourages spreading the load.",
        why: [
          "Correct. Most capacity then goes unused.",
          "Training continues, just badly.",
          "They stay distinct but underused.",
        ],
      },
      {
        question: "What determines the step time of an expert layer?",
        choices: [
          "The busiest expert",
          "The average load",
          "The expert count",
        ],
        answer: 0,
        explanation: "Everyone waits for the slowest.",
        why: [
          "Correct, which is why balance matters.",
          "Averages hide the bottleneck.",
          "Idle experts cost nothing.",
        ],
      },
    ],
  },
  {
    lessonId: "py.mc.m9_3.l5",
    atomId: "py.atom.ml.parameter-efficient-tuning",
    conceptId: "py.ml.parameter-efficient-tuning",
    title: "Parameter-efficient fine-tuning",
    requires: ["py.ml.mixture-of-experts"],
    vocabulary: [
      ["low-rank update", "expressing a weight change as the product of two thin matrices"],
      ["rank", "the inner dimension of that product, which sets its capacity"],
      ["adapter", "a small trained module inserted into a frozen network"],
    ],
    opening:
      "Fine-tuning every weight of a large model needs the memory of training it. Constraining the update to a low-rank form needs a fraction of a percent of that.",
    outcome:
      "You will count the trainable parameters at several ranks and see where the capacity trade-off sits.",
    why:
      "It makes fine-tuning affordable on one device, and the resulting adapters are small enough to store one per task.",
    mentalModel:
      "Picture the weight change as a tall thin matrix times a wide thin one. The product is full-sized, but only the thin factors are stored and trained.",
    firstTitle: "Counting the parameters",
    firstIntro:
      "A full update trains every entry of every weight matrix. A rank-limited one trains two thin factors instead, and the rank sets how thin.",
    firstCode: `def counts(dim, rank, layers, matrices=4):
    full = layers * matrices * dim * dim
    low = layers * matrices * 2 * dim * rank
    return full, low, round(low / full * 100, 3)

for rank in (1, 4, 16, 64):
    full, low, percent = counts(4096, rank, 32)
    print(f"rank {rank:>3} trainable {low:>10} of {full} ({percent}%)")`,
    firstTrace:
      "Rank four trains four million of two billion parameters — under a fifth of a percent. Rank sixty-four is still only three percent.",
    secondTitle: "What the rank buys",
    secondIntro:
      "The rank is the capacity of the update. Too low and the adaptation cannot express what the task needs; too high and the saving disappears.",
    secondCode: `for rank in (1, 4, 16, 64, 256):
    _, low, percent = counts(4096, rank, 32)
    verdict = "cheap" if percent < 1 else "approaching full"
    print(f"rank {rank:>4} {percent:>6}% {verdict}")`,
    secondTrace:
      "Up to rank sixteen the cost stays under one percent. At rank two hundred fifty-six it is over twelve, and the reason to use the method is fading.",
    mistake:
      "Assuming a small adapter cannot hurt. It is trained on a narrow task and can degrade unrelated behaviour, so the base model's evaluations have to be rerun with the adapter attached.",
    checkpoint:
      "Why does a low-rank update need so few parameters?",
    checkpointAnswer:
      "It stores two thin factors rather than the full matrix, so the count grows with the rank rather than with the dimension squared.",
    remember:
      "Freeze the base, train two thin factors, and pick the rank deliberately.",
    checks: [
      {
        question: "What does a low-rank update store?",
        choices: [
          "Two thin factor matrices",
          "The full weight change",
          "A copy of the base weights",
        ],
        answer: 0,
        explanation: "Their product is full-sized.",
        why: [
          "Correct. The count grows with the rank.",
          "That is exactly what it avoids.",
          "The base weights stay frozen.",
        ],
      },
      {
        question: "What does raising the rank do?",
        choices: [
          "Increases capacity and cost together",
          "Increases capacity for free",
          "Reduces the parameter count",
        ],
        answer: 0,
        explanation: "The rank is the inner dimension.",
        why: [
          "Correct, and the saving fades at high rank.",
          "Every extra rank costs parameters.",
          "It raises the count.",
        ],
      },
      {
        question: "What must be rechecked after attaching an adapter?",
        choices: [
          "The base model's general evaluations",
          "The parameter count",
          "The tokenizer",
        ],
        answer: 0,
        explanation: "The adapter was trained on a narrow task.",
        why: [
          "Correct. Unrelated behaviour can degrade.",
          "That is known by construction.",
          "The tokenizer is unchanged.",
        ],
      },
    ],
  },
];

export const ML_EFFICIENT_ATTENTION_ATOMS = ML_EFFICIENT_ATTENTION_SPECS.map(guidedMasteryAtom);
export const ML_EFFICIENT_ATTENTION_CONCEPTS = ML_EFFICIENT_ATTENTION_SPECS.map(guidedMasteryConcept);
export const ML_EFFICIENT_ATTENTION_LESSON_CONTENT = guidedLessonContent(ML_EFFICIENT_ATTENTION_SPECS);

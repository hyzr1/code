import {
  guidedLessonContent,
  guidedMasteryAtom,
  guidedMasteryConcept,
  type GuidedMasterySpec,
} from "./guidedMastery";

const ML_COMPILER_SPECS: GuidedMasterySpec[] = [
  {
    lessonId: "py.mc.m12_2.l1",
    atomId: "py.atom.ml.operator-fusion",
    conceptId: "py.ml.operator-fusion",
    title: "Operator fusion and graph rewriting",
    requires: ["py.ml.roofline"],
    vocabulary: [
      ["graph rewrite", "replacing a subgraph with an equivalent, cheaper one"],
      ["intermediate traffic", "memory written by one operation only to be read by the next"],
      ["aliasing", "two tensors sharing storage, so writing one changes the other"],
    ],
    opening:
      "A compiler can fuse a chain of elementwise operations into one kernel automatically. What it cannot do is know when two of your tensors share storage.",
    outcome:
      "You will compute the traffic a fusion saves and see the aliasing condition that makes a rewrite unsafe.",
    why:
      "The saving scales with the chain length, and the correctness condition is the one thing a naive rewriter gets wrong.",
    mentalModel:
      "Picture each operation writing its result to memory for the next to read. Fusing the chain removes every write but the last and every read but the first.",
    firstTitle: "The saving scales with the chain",
    firstIntro:
      "Each unfused operation reads and writes the whole tensor. A fused chain does that once regardless of how many operations it contains.",
    firstCode: `def traffic(operations, size, bytes_each=2):
    unfused = operations * 2 * size * bytes_each
    fused = 2 * size * bytes_each
    return unfused, fused, round(unfused / fused, 1)

for operations in (2, 4, 8):
    print(operations, "elementwise ops:", traffic(operations, 1_000_000))`,
    firstTrace:
      "Two operations save half the traffic and eight save seven eighths. The ratio is just the chain length, so longer chains are worth more.",
    secondTitle: "When the rewrite is unsafe",
    secondIntro:
      "An operation writing into its own input relies on an ordering the fused version may not preserve. The compiler must know which tensors alias.",
    secondCode: `aliases = {"add_": {"relu"}}

def safe_to_fuse(first, second):
    return second not in aliases.get(first, set())

print("fuse add_ then relu:", safe_to_fuse("add_", "relu"))
print("fuse mul then relu :", safe_to_fuse("mul", "relu"))`,
    secondTrace:
      "The in-place addition cannot be fused with a consumer that shares its storage. The pure multiply can, because nothing else reads what it writes.",
    mistake:
      "Assuming a numerically equivalent rewrite is a safe rewrite. Fusion also changes the order and precision of intermediates, so a chain that was stable when materialised in higher precision can lose digits once fused.",
    checkpoint:
      "A chain of eight elementwise operations is fused. How much traffic is saved?",
    checkpointAnswer:
      "Seven eighths. Only the first read and the last write survive, and the six intermediate round trips disappear.",
    remember:
      "Fuse the chain, but check what aliases what.",
    checks: [
      {
        prompt: "How does the fusion saving scale?",
        options: [
          "With the length of the chain",
          "With the tensor size",
          "With the thread count",
        ],
        answerIndex: 0,
        hint: "Compare the unfused and fused traffic.",
        explanations: [
          "Correct. Eight operations save seven eighths.",
          "Size cancels out of the ratio.",
          "Threads do not enter it.",
        ],
      },
      {
        prompt: "What makes a fusion unsafe?",
        options: [
          "An in-place operation whose ordering guarantee is lost",
          "A long chain",
          "A large tensor",
        ],
        answerIndex: 0,
        hint: "The compiler must track aliasing.",
        explanations: [
          "Correct. Two tensors sharing storage is the hazard.",
          "Longer chains are more valuable to fuse.",
          "Size is irrelevant to correctness.",
        ],
      },
      {
        prompt: "What else can fusion change besides traffic?",
        options: [
          "The precision and order of intermediate values",
          "The number of parameters",
          "The model architecture",
        ],
        answerIndex: 0,
        hint: "Intermediates may no longer be materialised.",
        explanations: [
          "Correct, and a stable chain can lose digits once fused.",
          "Parameters are untouched.",
          "The graph is equivalent by construction.",
        ],
      },
    ],
  },
  {
    lessonId: "py.mc.m12_2.l2",
    atomId: "py.atom.ml.compilers",
    conceptId: "py.ml.compilers",
    title: "ML compilers",
    requires: ["py.ml.operator-fusion"],
    vocabulary: [
      ["tracing", "recording the operations a program performs into a graph"],
      ["lowering", "rewriting a graph into progressively more machine-specific forms"],
      ["recompilation", "compiling again because an input shape or condition changed"],
    ],
    outcome:
      "You will follow a graph through the compiler's stages and compute when recompilation costs more than it saves.",
    opening:
      "A compiler turns a program into a graph, rewrites it several times, and emits kernels. Every one of those stages assumes the graph will be reused.",
    why:
      "Compilation is an investment amortised over calls. Enough distinct input shapes and the investment never pays back.",
    mentalModel:
      "Picture the compiler paying a large fixed cost once, in exchange for a smaller cost per call. Every new shape restarts the payment.",
    firstTitle: "The lowering stages",
    firstIntro:
      "Each stage narrows the representation. The early ones are device-independent; the later ones commit to specific hardware.",
    firstCode: `stages = [("trace", "python into a graph"),
          ("normalise", "canonical operator set"),
          ("fuse", "merge elementwise chains"),
          ("schedule", "tiling and vectorisation"),
          ("codegen", "device kernels")]

for name, description in stages:
    print(f"{name:10} {description}")`,
    firstTrace:
      "Five stages from source to kernels. The fusion stage is the one from the previous lesson, and it operates on the normalised graph rather than the original code.",
    secondTitle: "Recompilation eats the gain",
    secondIntro:
      "Compilation costs a fixed amount per distinct shape. Compare that total against the runtime it saves across the calls.",
    secondCode: `def total_ms(distinct_shapes, compile_ms, run_ms, calls):
    return distinct_shapes * compile_ms + calls * run_ms

for shapes in (1, 5, 50):
    total = total_ms(shapes, 800, 2, 1000)
    print("distinct shapes", shapes, "total ms", total,
          "compile share", round(shapes * 800 / total * 100, 1))`,
    secondTrace:
      "Compilation is twenty-nine percent of the time at one shape and ninety-five percent at fifty. The compiled kernels are just as fast; there is simply no reuse.",
    mistake:
      "Compiling a model whose input length varies per request. Each new length triggers a fresh compilation, and a serving workload with unbounded shapes spends nearly all its time compiling.",
    checkpoint:
      "A compiled model is slower than the uncompiled one in production. What is the likely cause?",
    checkpointAnswer:
      "Recompilation. Varying input shapes trigger a fresh compilation each time, and that cost is never amortised.",
    remember:
      "Compilation is amortised over calls; new shapes restart the clock.",
    checks: [
      {
        prompt: "What does the tracing stage produce?",
        options: [
          "A graph of the operations performed",
          "Device kernels",
          "A fused kernel",
        ],
        answerIndex: 0,
        hint: "It is the first stage.",
        explanations: [
          "Correct, and later stages rewrite it.",
          "That is the final stage.",
          "Fusion comes after normalisation.",
        ],
      },
      {
        prompt: "Why does compilation only pay off with reuse?",
        options: [
          "It is a fixed cost amortised over calls",
          "The kernels get faster over time",
          "The graph is cached on disk",
        ],
        answerIndex: 0,
        hint: "Compare the one-off cost to the per-call saving.",
        explanations: [
          "Correct. Few calls means it never repays.",
          "Kernel speed is fixed once emitted.",
          "Caching helps but does not change the arithmetic.",
        ],
      },
      {
        prompt: "What triggers recompilation?",
        options: [
          "A new input shape or a changed condition",
          "A new random seed",
          "A larger batch of the same shape",
        ],
        answerIndex: 0,
        hint: "The graph is specialised to what it traced.",
        explanations: [
          "Correct, and unbounded shapes are the trap.",
          "Seeds do not change the graph.",
          "Batch size is part of the shape.",
        ],
      },
    ],
  },
  {
    lessonId: "py.mc.m12_2.l3",
    atomId: "py.atom.ml.kernel-autotuning",
    conceptId: "py.ml.kernel-autotuning",
    title: "Kernel autotuning",
    requires: ["py.ml.compilers"],
    vocabulary: [
      ["configuration", "a choice of tile sizes, block dimensions and unrolling"],
      ["measurement noise", "run-to-run variation in a timing measurement"],
      ["overfitting the benchmark", "tuning to shapes that do not occur in production"],
    ],
    opening:
      "The best tiling for a kernel is not predictable from first principles, so it is measured. Whether the measurement can tell the candidates apart is a separate question.",
    outcome:
      "You will search configurations under noise and see how many trials it takes before the ranking means anything.",
    why:
      "Autotuning results are trusted because they are measured. When the noise exceeds the differences, the measurement is picking a winner at random.",
    mentalModel:
      "Picture each configuration as a true cost plus a random jitter. With one sample you are ranking the jitter as much as the cost.",
    firstTitle: "One trial ranks the noise",
    firstIntro:
      "Four configurations with known true costs, measured under noise. Watch which one a small search picks.",
    firstCode: `import random

TRUE = {"tiny": 9.0, "small": 6.2, "medium": 5.8, "large": 7.4}

def measure(config, trial):
    rng = random.Random(hash((config, trial)) & 0xffff)
    return TRUE[config] + rng.gauss(0, 1.5)

for trials in (1, 3, 20):
    scores = {c: sum(measure(c, t) for t in range(trials)) / trials
              for c in TRUE}
    print("trials", trials, "picked", min(scores, key=scores.get),
          {k: round(v, 2) for k, v in scores.items()})`,
    firstTrace:
      "One and three trials both pick the second-worst configuration. Twenty trials picks a genuinely good one, and still not the true best.",
    secondTitle: "Noise against the gap",
    secondIntro:
      "Compare the noise to the difference you are trying to resolve. The search cannot separate candidates closer together than its own scatter.",
    secondCode: `gap = round(TRUE["small"] - TRUE["medium"], 2)
noise = 1.5

for trials in (20, 50, 200):
    error = noise * (2 / trials) ** 0.5
    print("trials", trials, "comparison error", round(error, 3),
          "separates a gap of", gap, ":", error < gap)`,
    secondTrace:
      "A gap of four tenths needs the comparison error below that. Twenty trials leaves it at point four seven, and only around fifty trials resolves the top two.",
    mistake:
      "Tuning on one representative shape and shipping the result. Configurations are shape-specific, so the winner at one sequence length is routinely mediocre at another.",
    checkpoint:
      "An autotuner picks a configuration after one timing run each. How much should you trust it?",
    checkpointAnswer:
      "Very little. With one sample the ranking reflects the measurement noise as much as the true cost.",
    remember:
      "Repeat the measurement, and compare the noise to the gap.",
    checks: [
      {
        prompt: "Why is autotuning measured rather than predicted?",
        options: [
          "The best tiling is not derivable from first principles",
          "Measurement is cheaper",
          "The hardware is undocumented",
        ],
        answerIndex: 0,
        hint: "The interactions are too complex to model.",
        explanations: [
          "Correct, which is why the search exists.",
          "Measurement is the expensive part.",
          "Documentation would not settle it.",
        ],
      },
      {
        prompt: "What does a single timing run per configuration rank?",
        options: [
          "The noise as much as the true cost",
          "The true cost accurately",
          "Nothing at all",
        ],
        answerIndex: 0,
        hint: "One sample from a noisy distribution.",
        explanations: [
          "Correct, and it picked a poor configuration here.",
          "One sample cannot separate close candidates.",
          "It is informative, just unreliable.",
        ],
      },
      {
        prompt: "Why does tuning on one shape generalise badly?",
        options: [
          "The best configuration is shape-specific",
          "Shapes change the arithmetic",
          "Compilation depends on the seed",
        ],
        answerIndex: 0,
        hint: "Tiling interacts with the dimensions.",
        explanations: [
          "Correct. The winner at one length is often mediocre at another.",
          "The arithmetic is the same.",
          "Seeds are unrelated.",
        ],
      },
    ],
  },
];

export const ML_COMPILER_ATOMS = ML_COMPILER_SPECS.map(guidedMasteryAtom);
export const ML_COMPILER_CONCEPTS = ML_COMPILER_SPECS.map(guidedMasteryConcept);
export const ML_COMPILER_LESSON_CONTENT = guidedLessonContent(ML_COMPILER_SPECS);

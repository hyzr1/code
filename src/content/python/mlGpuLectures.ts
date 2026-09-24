import {
  guidedLessonContent,
  guidedMasteryAtom,
  guidedMasteryConcept,
  type GuidedMasterySpec,
} from "./guidedMastery";

const ML_GPU_SPECS: GuidedMasterySpec[] = [
  {
    lessonId: "py.mc.m12_1.l1",
    atomId: "py.atom.ml.gpu-architecture",
    conceptId: "py.ml.gpu-architecture",
    title: "GPU architecture",
    requires: ["py.ml.instrumental-variables"],
    vocabulary: [
      ["occupancy", "the share of a processor's thread slots actually in use"],
      ["register pressure", "how many registers each thread needs, which caps how many fit"],
      ["shared memory", "fast per-block memory, allocated from a fixed budget"],
    ],
    opening:
      "A processor has a fixed budget of thread slots, registers and fast memory. What limits your kernel is whichever of those runs out first, and it is rarely the one you expect.",
    outcome:
      "You will compute occupancy from a launch configuration and identify which resource is binding.",
    why:
      "Latency is hidden by having many threads resident. A kernel at a quarter occupancy has three quarters fewer opportunities to hide a memory stall.",
    mentalModel:
      "Picture three buckets filling at once: threads, registers and shared memory. The first to overflow decides how many blocks fit.",
    firstTitle: "Registers cap the block count",
    firstIntro:
      "Every resident thread holds its registers for the kernel's whole life. Doubling the register count halves how many threads fit.",
    firstCode: `def occupancy(threads_per_block, registers_per_thread,
              shared_per_block, max_threads=2048,
              max_registers=65536, max_shared=49152):
    by_threads = max_threads // threads_per_block
    by_registers = max_registers // (threads_per_block * registers_per_thread)
    by_shared = max_shared // shared_per_block if shared_per_block else by_threads
    blocks = min(by_threads, by_registers, by_shared)
    limit = min([(by_threads, "threads"), (by_registers, "registers"),
                 (by_shared, "shared memory")])[1]
    return blocks, round(blocks * threads_per_block / max_threads * 100, 1), limit

for registers in (16, 32, 64, 128):
    print("registers per thread", registers, occupancy(256, registers, 0))`,
    firstTrace:
      "Full occupancy at thirty-two registers, half at sixty-four and a quarter at a hundred and twenty-eight. One extra local variable can cost half the throughput.",
    secondTitle: "Shared memory competes for the same space",
    secondIntro:
      "Shared memory is allocated per block from a fixed pool. A generous tile can silently become the binding constraint.",
    secondCode: `for shared in (0, 8192, 16384, 32768):
    print("shared bytes per block", shared, occupancy(256, 32, shared))`,
    secondTrace:
      "Occupancy falls from full to twelve percent as the tile grows. The kernel is not slower per thread; there are simply far fewer of them resident.",
    mistake:
      "Optimising for maximum occupancy as an end in itself. A kernel using more registers per thread can be faster overall if that avoids a memory round trip, so occupancy is a diagnostic and not the objective.",
    checkpoint:
      "A kernel runs at twenty-five percent occupancy. What is the consequence?",
    checkpointAnswer:
      "Far fewer threads are resident to hide memory latency, so stalls that would have been overlapped are now exposed.",
    remember:
      "Threads, registers, shared memory — whichever runs out first wins.",
    checks: [
      {
        question: "What does occupancy measure?",
        choices: [
          "The share of thread slots actually in use",
          "The share of time the kernel runs",
          "Memory bandwidth used",
        ],
        answer: 0,
        explanation: "It is about residency, not speed.",
        why: [
          "Correct, and residency is what hides latency.",
          "That is utilisation.",
          "Bandwidth is measured separately.",
        ],
      },
      {
        question: "Why does register use cap occupancy?",
        choices: [
          "Every resident thread holds its registers for the kernel's lifetime",
          "Registers are slow",
          "Registers are shared between blocks",
        ],
        answer: 0,
        explanation: "The register file is a fixed size.",
        why: [
          "Correct. More per thread means fewer threads.",
          "Registers are the fastest storage available.",
          "They are private to each thread.",
        ],
      },
      {
        question: "Is maximum occupancy always the goal?",
        choices: [
          "No; more registers per thread can be worth the lower occupancy",
          "Yes, always",
          "Only for memory-bound kernels",
        ],
        answer: 0,
        explanation: "It is a diagnostic, not the objective.",
        why: [
          "Correct, if it avoids a memory round trip.",
          "Occupancy is a means, not an end.",
          "The trade-off applies to both kinds.",
        ],
      },
    ],
  },
  {
    lessonId: "py.mc.m12_1.l2",
    atomId: "py.atom.ml.cuda-fundamentals",
    conceptId: "py.ml.cuda-fundamentals",
    title: "CUDA fundamentals",
    requires: ["py.ml.gpu-architecture"],
    vocabulary: [
      ["warp", "a group of threads executing one instruction together"],
      ["divergence", "threads in a warp taking different branches, which serialises them"],
      ["coalescing", "neighbouring threads reading neighbouring addresses in one transaction"],
    ],
    opening:
      "Threads do not run independently. They run in lockstep groups, and both the branches they take and the addresses they touch are judged at that group level.",
    outcome:
      "You will measure branch divergence within a warp and count the memory transactions different access strides cost.",
    why:
      "These two effects account for most of the gap between a kernel that runs and a kernel that runs well, and neither is visible from the source alone.",
    mentalModel:
      "Picture thirty-two threads sharing one instruction pointer. A branch that splits them runs both sides in turn, with half the threads idle each time.",
    firstTitle: "Divergence serialises a warp",
    firstIntro:
      "If every thread agrees, the branch is free. If they split, both paths execute and the disagreeing threads sit idle through the other one.",
    firstCode: `def divergence(threads, predicate):
    taken = sum(1 for t in range(threads) if predicate(t))
    return taken, threads - taken, taken not in (0, threads)

warp = 32
print("all agree   ", divergence(warp, lambda t: True))
print("half split  ", divergence(warp, lambda t: t < 16))
print("alternating ", divergence(warp, lambda t: t % 2 == 0))
print("one thread  ", divergence(warp, lambda t: t == 0))`,
    firstTrace:
      "Agreement costs nothing. Any split diverges, and a single disagreeing thread costs the whole warp a second pass through the other branch.",
    secondTitle: "Stride decides the transaction count",
    secondIntro:
      "Consecutive threads reading consecutive addresses fit in one transaction. Spreading them out multiplies the traffic without changing the work.",
    secondCode: `def transactions(stride, warp=32, line=32):
    return len({(t * stride) // line for t in range(warp)})

for stride in (1, 2, 4, 32):
    print("stride", stride, "cache lines touched", transactions(stride))`,
    secondTrace:
      "One line at stride one and thirty-two at stride thirty-two. The same values are read either way, at thirty-two times the memory cost.",
    mistake:
      "Blaming the arithmetic when a kernel is slow. A strided access pattern from an unfortunate array layout is far more often the cause, and it does not appear anywhere in the instruction count.",
    checkpoint:
      "One thread in a warp takes a different branch. What does that cost?",
    checkpointAnswer:
      "A full second pass. Both branches execute with the non-participating threads idle, so the warp does the work of two.",
    remember:
      "Agree on branches, and read neighbouring addresses.",
    checks: [
      {
        question: "What is a warp?",
        choices: [
          "A group of threads executing one instruction together",
          "A block of shared memory",
          "A kernel launch",
        ],
        answer: 0,
        explanation: "They share an instruction pointer.",
        why: [
          "Correct. Divergence is judged at this level.",
          "Shared memory is allocated per block.",
          "A launch contains many warps.",
        ],
      },
      {
        question: "What does branch divergence cost?",
        choices: [
          "Both paths execute, with threads idle through the other",
          "Nothing, threads are independent",
          "A kernel restart",
        ],
        answer: 0,
        explanation: "Lockstep execution cannot take two paths at once.",
        why: [
          "Correct, even when only one thread disagrees.",
          "Threads within a warp are not independent.",
          "Nothing restarts.",
        ],
      },
      {
        question: "Why does access stride matter so much?",
        choices: [
          "It multiplies the memory transactions for the same values",
          "It changes the arithmetic",
          "It affects register use",
        ],
        answer: 0,
        explanation: "Count the distinct cache lines touched.",
        why: [
          "Correct, and it is invisible in the instruction count.",
          "The computation is identical.",
          "Registers are unaffected.",
        ],
      },
    ],
  },
  {
    lessonId: "py.mc.m12_1.l3",
    atomId: "py.atom.ml.custom-kernels",
    conceptId: "py.ml.custom-kernels",
    title: "Custom CUDA and Triton kernels",
    requires: ["py.ml.cuda-fundamentals"],
    vocabulary: [
      ["fusion", "computing several operations in one pass over the data"],
      ["memory pass", "one read of the input and write of the output"],
      ["reference check", "comparing a custom kernel against a trusted implementation"],
    ],
    opening:
      "Three elementwise operations written separately read and write the whole tensor three times. Fused, they read and write it once, and the arithmetic is unchanged.",
    outcome:
      "You will fuse a chain of operations, count the memory passes saved, and verify the result against the unfused reference.",
    why:
      "Elementwise chains are memory bound, so the traffic is the cost. Removing two thirds of it removes two thirds of the runtime.",
    mentalModel:
      "Picture the data making a round trip to memory between each operation. Fusion keeps it in registers and makes one trip instead.",
    firstTitle: "One pass instead of three",
    firstIntro:
      "Each separate operation materialises its output. Composing them in a single expression never writes the intermediates at all.",
    firstCode: `def unfused(values, weight, bias):
    scaled = [v * weight for v in values]
    shifted = [v + bias for v in scaled]
    clipped = [max(0.0, v) for v in shifted]
    return clipped, 3

def fused(values, weight, bias):
    return [max(0.0, v * weight + bias) for v in values], 1

values = [-2.0, -0.5, 0.0, 1.5, 3.0]
slow, slow_passes = unfused(values, 2.0, -1.0)
fast, fast_passes = fused(values, 2.0, -1.0)
print("unfused", slow, "passes", slow_passes)
print("fused  ", fast, "passes", fast_passes)`,
    firstTrace:
      "Three passes become one. The intermediate arrays were written to memory and read straight back, which is pure overhead.",
    secondTitle: "Verify before believing",
    secondIntro:
      "A fused kernel is new code. Compare it elementwise against the reference before trusting any timing number from it.",
    secondCode: `print("identical", slow == fast)
print("traffic saved",
      round((1 - fast_passes / slow_passes) * 100, 1), "percent")

for weight, bias in [(0.0, 0.0), (-1.0, 5.0), (3.5, -2.5)]:
    a, _ = unfused(values, weight, bias)
    b, _ = fused(values, weight, bias)
    print(weight, bias, "match", a == b)`,
    secondTrace:
      "Identical on every configuration, with sixty-seven percent of the traffic removed. The check is cheap and the failure mode without it is silent.",
    mistake:
      "Fusing across an operation that writes in place. The unfused version's ordering guaranteed one write finished before the next read, and the fused version may not, so results depend on scheduling.",
    checkpoint:
      "Why does fusing three elementwise operations speed them up?",
    checkpointAnswer:
      "They are memory bound, so the cost is the traffic. Fusion removes two of the three round trips while leaving the arithmetic unchanged.",
    remember:
      "Fuse to remove traffic, and check against the reference.",
    checks: [
      {
        question: "What does fusion remove?",
        choices: [
          "Round trips to memory for intermediate values",
          "Arithmetic operations",
          "Thread synchronisation",
        ],
        answer: 0,
        explanation: "The computation is identical.",
        why: [
          "Correct, and elementwise chains are memory bound.",
          "The same arithmetic still happens.",
          "Synchronisation is a separate concern.",
        ],
      },
      {
        question: "What must be checked before trusting a fused kernel?",
        choices: [
          "That it matches the unfused reference elementwise",
          "That it is faster",
          "That it uses fewer registers",
        ],
        answer: 0,
        explanation: "It is new code with a silent failure mode.",
        why: [
          "Correct. Speed is worthless if the values changed.",
          "Speed is the reason, not the check.",
          "Register use is incidental.",
        ],
      },
      {
        question: "When is fusing across an operation unsafe?",
        choices: [
          "When it writes in place and the ordering mattered",
          "When the tensors are large",
          "When there are more than three operations",
        ],
        answer: 0,
        explanation: "Think about a guaranteed write-before-read.",
        why: [
          "Correct, and the result then depends on scheduling.",
          "Size makes fusion more valuable, not less safe.",
          "Longer chains fuse fine.",
        ],
      },
    ],
  },
  {
    lessonId: "py.mc.m12_1.l4",
    atomId: "py.atom.ml.roofline",
    conceptId: "py.ml.roofline",
    title: "Roofline analysis",
    requires: ["py.ml.custom-kernels"],
    vocabulary: [
      ["arithmetic intensity", "operations performed per byte moved"],
      ["ridge point", "the intensity where a kernel stops being memory bound"],
      ["attainable performance", "the best a kernel can reach given its intensity"],
    ],
    opening:
      "Before optimising a kernel, work out which resource it is actually waiting on. Half of all optimisation effort is spent making a memory-bound kernel do less arithmetic.",
    outcome:
      "You will compute arithmetic intensity, compare it against the ridge point, and classify kernels correctly.",
    why:
      "The classification determines what will help. Below the ridge only traffic matters; above it only arithmetic does.",
    mentalModel:
      "Picture a ceiling with two sections. A sloped part rising with intensity, and a flat part at peak compute. Your kernel sits under one or the other.",
    firstTitle: "Intensity against the ridge",
    firstIntro:
      "Divide operations by bytes moved. Compare that against peak compute divided by bandwidth, which is where the two ceilings meet.",
    firstCode: `def roofline(flops, bytes_moved, peak_flops, bandwidth):
    intensity = flops / bytes_moved
    ridge = peak_flops / bandwidth
    attainable = min(peak_flops, intensity * bandwidth)
    return (round(intensity, 3), round(ridge, 1),
            round(attainable / 1e12, 2),
            "memory bound" if intensity < ridge else "compute bound")

peak, bandwidth = 300e12, 2e12
for name, flops, moved in [("elementwise add", 1e9, 12e9),
                           ("layer norm", 5e9, 8e9),
                           ("matmul 4096", 2 * 4096 ** 3, 3 * 4096 ** 2 * 2)]:
    print(f"{name:16}", roofline(flops, moved, peak, bandwidth))`,
    firstTrace:
      "The elementwise kernel reaches zero point one seven of three hundred teraflops. The matmul reaches all of it, because its intensity is nine times the ridge.",
    secondTitle: "What each classification permits",
    secondIntro:
      "Below the ridge, halving the traffic doubles the speed and halving the arithmetic does nothing. Above it, the reverse.",
    secondCode: `def runtime_us(flops, moved):
    attainable = roofline(flops, moved, peak, bandwidth)[2] * 1e12
    return round(flops / attainable * 1e6, 1)

for label, flops, moved in [("memory bound", 1e9, 12e9),
                            ("compute bound", 2 * 4096 ** 3,
                             3 * 4096 ** 2 * 2)]:
    print(label,
          "base", runtime_us(flops, moved),
          "half traffic", runtime_us(flops, moved / 2),
          "half arithmetic", runtime_us(flops / 2, moved))`,
    secondTrace:
      "Halving traffic halves the memory-bound runtime and leaves the compute-bound one untouched. Halving arithmetic does the reverse. Optimising the wrong axis buys nothing.",
    mistake:
      "Using peak numbers from a datasheet. Real bandwidth is typically seventy to eighty percent of the quoted figure, so the ridge sits lower and more kernels are memory bound than the calculation suggests.",
    checkpoint:
      "A kernel sits well under the ridge point. What will speed it up?",
    checkpointAnswer:
      "Reducing memory traffic. Reducing arithmetic changes nothing, because it is waiting on the memory system.",
    remember:
      "Classify first; under the ridge only traffic matters.",
    checks: [
      {
        question: "What is arithmetic intensity?",
        choices: [
          "Operations performed per byte moved",
          "Operations per second",
          "Bytes moved per second",
        ],
        answer: 0,
        explanation: "It is a ratio, not a rate.",
        why: [
          "Correct, and it places the kernel on the roofline.",
          "That is throughput.",
          "That is bandwidth.",
        ],
      },
      {
        question: "A kernel is memory bound. What helps?",
        choices: [
          "Reducing memory traffic",
          "Reducing arithmetic",
          "Using more threads",
        ],
        answer: 0,
        explanation: "It is waiting on the memory system.",
        why: [
          "Correct. Fusion and better layouts are the levers.",
          "It is not waiting on arithmetic.",
          "More threads do not create bandwidth.",
        ],
      },
      {
        question: "Why use measured rather than datasheet bandwidth?",
        choices: [
          "Real bandwidth is well below peak, so the ridge sits lower",
          "Datasheets are usually wrong",
          "Bandwidth varies by kernel",
        ],
        answer: 0,
        explanation: "More kernels are memory bound than the paper figure suggests.",
        why: [
          "Correct, typically seventy to eighty percent.",
          "They state a theoretical maximum, not an error.",
          "The hardware limit is fixed.",
        ],
      },
    ],
  },
];

export const ML_GPU_ATOMS = ML_GPU_SPECS.map(guidedMasteryAtom);
export const ML_GPU_CONCEPTS = ML_GPU_SPECS.map(guidedMasteryConcept);
export const ML_GPU_LESSON_CONTENT = guidedLessonContent(ML_GPU_SPECS);

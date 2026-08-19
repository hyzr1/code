import {
  guidedLessonContent,
  guidedMasteryAtom,
  guidedMasteryConcept,
  type GuidedMasterySpec,
} from "./guidedMastery";

const ML_INFERENCE_LIMIT_SPECS: GuidedMasterySpec[] = [
  {
    lessonId: "py.mc.m12_4.l1",
    atomId: "py.atom.ml.quantization-sparsity",
    conceptId: "py.ml.quantization-sparsity",
    title: "Quantization and sparsity",
    requires: ["py.ml.frontier-utilization"],
    vocabulary: [
      ["structured sparsity", "zeros arranged in a pattern the hardware can skip"],
      ["unstructured sparsity", "zeros scattered anywhere, which dense kernels cannot exploit"],
      ["compounding", "combining lower precision with sparsity for a multiplied saving"],
    ],
    opening:
      "Two ways to shrink a model, and they multiply. The catch is that half the weights being zero only helps if the hardware can skip them.",
    outcome:
      "You will compound precision and sparsity savings, and see unstructured zeros deliver memory without speed.",
    why:
      "Sparsity papers report the zero fraction and the memory saving. The speedup depends entirely on whether the pattern matches what the kernels support.",
    mentalModel:
      "Picture the weights as a grid. Lower precision shrinks each cell; sparsity removes cells — but only if they are removed in a shape the hardware recognises.",
    firstTitle: "The savings compound",
    firstIntro:
      "Halving the bit width halves the memory, and so does halving the non-zero count. Applied together they quarter it.",
    firstCode: `def memory_gb(params_billions, bits, sparsity):
    dense = params_billions * 1e9 * bits / 8
    return round(dense * (1 - sparsity) / 1e9, 2)

for bits, sparsity in [(16, 0.0), (8, 0.0), (4, 0.0),
                       (16, 0.5), (4, 0.5)]:
    print("bits", bits, "sparsity", sparsity, "->",
          memory_gb(70, bits, sparsity), "GB")`,
    firstTrace:
      "A hundred and forty gigabytes down to seventeen and a half at four bits with half the weights zero. Neither technique alone reaches that.",
    secondTitle: "Only structured zeros run faster",
    secondIntro:
      "A dense kernel multiplies every element whether it is zero or not. Skipping requires the zeros to fall in a pattern the kernel was written for.",
    secondCode: `def speedup(sparsity, structured):
    return round(1 / (1 - sparsity), 2) if structured else 1.0

for sparsity in (0.5, 0.75, 0.9):
    print("sparsity", sparsity,
          "structured", speedup(sparsity, True),
          "unstructured", speedup(sparsity, False))`,
    secondTrace:
      "Ninety percent structured sparsity runs ten times faster; ninety percent unstructured runs at exactly the same speed. The memory saving is identical in both.",
    mistake:
      "Reporting a sparsity result as a speedup when the zeros are unstructured. The model is smaller and every multiply still happens, so the latency is unchanged.",
    checkpoint:
      "Ninety percent of the weights are zero, scattered arbitrarily. What is the speedup?",
    checkpointAnswer:
      "None. A dense kernel multiplies every element regardless, so scattered zeros save memory and no time at all.",
    remember:
      "Precision and sparsity compound for memory; only structure buys speed.",
    checks: [
      {
        question: "How do precision and sparsity savings combine?",
        choices: ["They multiply", "They add", "The larger one wins"],
        answer: 0,
        explanation: "Each scales the dense size.",
        why: [
          "Correct. Four bits at half sparsity is an eighth of half precision.",
          "Both are multiplicative factors.",
          "Both apply at once.",
        ],
      },
      {
        question: "Why does unstructured sparsity not speed anything up?",
        choices: [
          "Dense kernels multiply every element regardless",
          "The zeros are stored anyway",
          "It reduces accuracy",
        ],
        answer: 0,
        explanation: "The kernel cannot tell which to skip.",
        why: [
          "Correct. The memory saving is real, the speedup is not.",
          "Compressed formats do avoid storing them.",
          "Accuracy is a separate question.",
        ],
      },
      {
        question: "What makes sparsity structured?",
        choices: [
          "The zeros fall in a pattern the kernel can skip",
          "There are more of them",
          "They are contiguous in memory",
        ],
        answer: 0,
        explanation: "The hardware has to recognise it.",
        why: [
          "Correct, and the pattern is fixed by the hardware.",
          "The fraction is separate from the shape.",
          "Contiguity alone is not sufficient.",
        ],
      },
    ],
  },
  {
    lessonId: "py.mc.m12_4.l2",
    atomId: "py.atom.ml.paged-attention",
    conceptId: "py.ml.paged-attention",
    title: "Paged attention and continuous batching",
    requires: ["py.ml.quantization-sparsity"],
    vocabulary: [
      ["block", "a fixed-size unit of cache memory allocated at a time"],
      ["internal fragmentation", "space inside an allocated block that holds nothing"],
      ["admission", "letting a new request into the running batch"],
    ],
    opening:
      "Request lengths are unknown in advance, so the cache is allocated in fixed blocks. The block size decides how much of that memory holds nothing at all.",
    outcome:
      "You will measure fragmentation across block sizes and find the point where a larger block stops being worth it.",
    why:
      "Wasted cache memory is requests you cannot admit. Cutting fragmentation from eighty percent to two directly multiplies the concurrent batch.",
    mentalModel:
      "Picture each request rounding its length up to a whole number of blocks. Big blocks mean few allocations and a lot of rounding.",
    firstTitle: "Rounding up costs memory",
    firstIntro:
      "Each request occupies whole blocks. Sum what is allocated against what is used to get the fragmentation.",
    firstCode: `def fragmentation(lengths, block_tokens):
    allocated = sum(-(-length // block_tokens) * block_tokens
                    for length in lengths)
    used = sum(lengths)
    return allocated, used, round((1 - used / allocated) * 100, 1)

lengths = [17, 250, 1003, 40, 512]
for block in (1, 16, 256, 2048):
    print("block", block, fragmentation(lengths, block))`,
    firstTrace:
      "Two percent waste at a block of sixteen and eighty-two percent at two thousand and forty-eight. A short request in a huge block wastes almost the whole block.",
    secondTitle: "Small blocks are not free either",
    secondIntro:
      "Every block needs a table entry and a lookup. Very small blocks trade fragmentation for bookkeeping.",
    secondCode: `for block in (1, 16, 256):
    blocks = sum(-(-length // block) for length in lengths)
    allocated, used, waste = fragmentation(lengths, block)
    print("block", block, "table entries", blocks, "waste", waste)`,
    secondTrace:
      "A block of one wastes nothing and needs eighteen hundred table entries. Sixteen needs a hundred and sixteen for two percent waste, which is the trade worth making.",
    mistake:
      "Tuning the block size on long requests only. Short requests are where fragmentation concentrates, so a workload with a mixture behaves nothing like one with uniform lengths.",
    checkpoint:
      "Why does a large block size reduce how many requests can run concurrently?",
    checkpointAnswer:
      "Each request rounds its cache up to whole blocks, so most of the allocated memory holds nothing and is unavailable to other requests.",
    remember:
      "Small enough to avoid rounding, large enough to keep the table cheap.",
    checks: [
      {
        question: "What causes internal fragmentation here?",
        choices: [
          "Requests round their cache up to whole blocks",
          "Requests finish at different times",
          "The cache is compressed",
        ],
        answer: 0,
        explanation: "Look at a short request in a large block.",
        why: [
          "Correct, and short requests waste the most.",
          "That is a scheduling effect.",
          "No compression is involved.",
        ],
      },
      {
        question: "What does a very small block size cost?",
        choices: [
          "Table entries and lookup overhead",
          "More fragmentation",
          "Accuracy",
        ],
        answer: 0,
        explanation: "Every block needs bookkeeping.",
        why: [
          "Correct. A block of one needs an entry per token.",
          "Small blocks minimise fragmentation.",
          "Nothing about the model changes.",
        ],
      },
      {
        question: "Why does fragmentation limit concurrency?",
        choices: [
          "Wasted cache memory is memory another request cannot use",
          "It slows each request",
          "It increases compute",
        ],
        answer: 0,
        explanation: "The cache is the binding resource.",
        why: [
          "Correct. Less waste means a larger batch.",
          "Per-request speed is unchanged.",
          "Compute is unaffected.",
        ],
      },
    ],
  },
  {
    lessonId: "py.mc.m12_4.l3",
    atomId: "py.atom.ml.multi-token-decoding",
    conceptId: "py.ml.multi-token-decoding",
    title: "Multi-token decoding",
    requires: ["py.ml.paged-attention"],
    vocabulary: [
      ["draft head", "a small predictor attached to the main model rather than a separate one"],
      ["acceptance", "the probability the target agrees with a proposed token"],
      ["net speedup", "tokens gained divided by the total cost of gaining them"],
    ],
    opening:
      "Several methods propose more than one token per verification. They differ in how good the proposals are and what they cost, and only the ratio decides.",
    outcome:
      "You will compare three proposal schemes on tokens gained against cost and find where a better draft stops paying.",
    why:
      "A larger, more accurate draft model proposes further ahead and costs more per step. Past a point the extra cost exceeds the extra tokens.",
    mentalModel:
      "Picture each scheme as a bet. A cheap draft guesses badly and costs almost nothing; an expensive one guesses well and eats the saving.",
    firstTitle: "Tokens against cost",
    firstIntro:
      "Expected tokens is a geometric sum in the acceptance rate. Cost is one target step plus the draft's own work.",
    firstCode: `def profile(accept, draft_length, draft_cost):
    tokens, probability = 0.0, 1.0
    for _ in range(draft_length):
        tokens += probability
        probability *= accept
    tokens += 1
    cost = 1 + draft_length * draft_cost
    return round(tokens, 3), round(cost, 3), round(tokens / cost, 3)

print("single token", (1.0, 1.0, 1.0))
print("draft head  ", profile(0.70, 2, 0.02))
print("small draft ", profile(0.80, 4, 0.10))
print("large draft ", profile(0.90, 8, 0.30))`,
    firstTrace:
      "The draft head reaches two point six times and the small draft two point eight. The large draft proposes furthest, gains most tokens, and nets the worst speedup of the three.",
    secondTitle: "Where the extra cost stops paying",
    secondIntro:
      "Hold the acceptance and draft length fixed and vary only what the draft costs. The gain falls away steadily.",
    secondCode: `for draft_cost in (0.02, 0.10, 0.30, 0.60):
    tokens, cost, net = profile(0.85, 4, draft_cost)
    print("draft cost", draft_cost, "tokens", tokens,
          "net speedup", net)`,
    secondTrace:
      "From three point nine times down to one point two as the draft grows expensive. The proposals never changed; only what they cost to make.",
    mistake:
      "Choosing the draft by its standalone quality. What matters is agreement with the target divided by cost, and a very good draft a third the size of the target is usually a net loss.",
    checkpoint:
      "A large draft model proposes eight tokens with ninety percent acceptance and still nets less speedup than a tiny one. Why?",
    checkpointAnswer:
      "Its own cost per step is high enough to consume the extra tokens it gains. The ratio, not the token count, is what matters.",
    remember:
      "Tokens gained over cost paid — not tokens gained.",
    checks: [
      {
        question: "What decides which proposal scheme is best?",
        choices: [
          "Tokens gained divided by total cost",
          "Tokens gained",
          "Acceptance rate",
        ],
        answer: 0,
        explanation: "Both halves matter.",
        why: [
          "Correct. The largest draft gained most and netted least.",
          "That ignores what the draft cost.",
          "Acceptance alone does not price the draft.",
        ],
      },
      {
        question: "Why is a draft head cheap?",
        choices: [
          "It reuses the main model's computation instead of running a second model",
          "It proposes fewer tokens",
          "It has a lower acceptance rate",
        ],
        answer: 0,
        explanation: "It is attached rather than separate.",
        why: [
          "Correct, which is why its cost per proposal is tiny.",
          "Length is a separate choice.",
          "Cheapness is not about accuracy.",
        ],
      },
      {
        question: "The draft cost triples with everything else fixed. What happens?",
        choices: [
          "Net speedup falls even though the tokens gained are identical",
          "Nothing",
          "Acceptance falls",
        ],
        answer: 0,
        explanation: "The denominator grew.",
        why: [
          "Correct. Cost alone can erase the gain.",
          "The ratio changes.",
          "Acceptance is a property of the draft's predictions.",
        ],
      },
    ],
  },
  {
    lessonId: "py.mc.m12_4.l4",
    atomId: "py.atom.ml.edge-deployment",
    conceptId: "py.ml.edge-deployment",
    title: "Edge and accelerator deployment",
    requires: ["py.ml.multi-token-decoding"],
    vocabulary: [
      ["memory budget", "what the device has after the operating system and application take theirs"],
      ["thermal throttling", "the device slowing itself to stay within a power envelope"],
      ["operator support", "whether the target runtime implements every operation the model uses"],
    ],
    opening:
      "A model that fits a data-centre device has to survive three more constraints on a phone: the memory left over, the heat it generates, and whether the runtime implements its operations at all.",
    outcome:
      "You will check a model against a device memory budget and see sustained power decide the real throughput.",
    why:
      "Peak performance on an edge device is a number it holds for seconds. Sustained performance is what the user experiences.",
    mentalModel:
      "Picture three gates in series. Fit in memory, stay under the power envelope, and use only operations the runtime knows. Failing any one is a hard stop.",
    firstTitle: "What actually fits",
    firstIntro:
      "Subtract the runtime overhead from the device budget, then check the quantized weights against what is left.",
    firstCode: `def fits(params_billions, bits, device_mb, overhead_mb=200):
    need = params_billions * 1e9 * bits / 8 / 1e6 + overhead_mb
    return round(need, 1), need <= device_mb

for params, bits in [(7, 16), (7, 4), (1.5, 4), (0.5, 4)]:
    print(params, "billion at", bits, "bits ->",
          fits(params, bits, 4096))`,
    firstTrace:
      "Seven billion at half precision needs fourteen gigabytes and does not fit. The same model at four bits needs three point seven and does, with very little room left.",
    secondTitle: "Heat decides the sustained rate",
    secondIntro:
      "A device peaking above its thermal budget runs at full speed briefly and then throttles. The sustained fraction is what to plan against.",
    secondCode: `def sustained(peak_watts, budget_watts):
    return round(min(1.0, budget_watts / peak_watts), 2)

for peak in (5, 12, 30):
    fraction = sustained(peak, 8)
    print("peak", peak, "W -> sustained fraction", fraction,
          "throttled" if fraction < 1.0 else "no throttling")`,
    secondTrace:
      "A five-watt kernel runs unthrottled. A thirty-watt one sustains twenty-seven percent, so its benchmark number is nearly four times what a user gets.",
    mistake:
      "Benchmarking a single inference on a cold device. That measurement is taken before any throttling, and a sustained workload can run at a third of it.",
    checkpoint:
      "A model benchmarks at sixty tokens a second on a phone. What should you expect in use?",
    checkpointAnswer:
      "Considerably less once the device warms up. A cold single-shot benchmark is taken before thermal throttling engages.",
    remember:
      "Fit the memory, respect the power envelope, and check the operators.",
    checks: [
      {
        question: "What is the memory budget on an edge device?",
        choices: [
          "What remains after the operating system and application take theirs",
          "The device's total memory",
          "The model's parameter count",
        ],
        answer: 0,
        explanation: "The model is not alone on the device.",
        why: [
          "Correct, and the overhead is substantial.",
          "Very little of the total is available.",
          "Parameters are what must fit into it.",
        ],
      },
      {
        question: "Why is a cold benchmark misleading?",
        choices: [
          "It is taken before thermal throttling engages",
          "The model is not loaded",
          "Memory is not allocated",
        ],
        answer: 0,
        explanation: "Sustained and peak differ.",
        why: [
          "Correct. Sustained throughput can be a third of it.",
          "Loading happens first.",
          "Allocation is complete before timing.",
        ],
      },
      {
        question: "What is the third constraint besides memory and power?",
        choices: [
          "Whether the runtime implements every operation the model uses",
          "The screen size",
          "Network bandwidth",
        ],
        answer: 0,
        explanation: "An unsupported operation is a hard stop.",
        why: [
          "Correct, and it fails at conversion rather than at runtime.",
          "Display is unrelated.",
          "On-device inference needs no network.",
        ],
      },
    ],
  },
];

export const ML_INFERENCE_LIMIT_ATOMS = ML_INFERENCE_LIMIT_SPECS.map(guidedMasteryAtom);
export const ML_INFERENCE_LIMIT_CONCEPTS = ML_INFERENCE_LIMIT_SPECS.map(guidedMasteryConcept);
export const ML_INFERENCE_LIMIT_LESSON_CONTENT = guidedLessonContent(ML_INFERENCE_LIMIT_SPECS);

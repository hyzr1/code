import {
  guidedLessonContent,
  guidedMasteryAtom,
  guidedMasteryConcept,
  type GuidedMasterySpec,
} from "./guidedMastery";

const ML_INFERENCE_SPECS: GuidedMasterySpec[] = [
  {
    lessonId: "py.mc.m9_5.l1",
    atomId: "py.atom.ml.kv-caching",
    conceptId: "py.ml.kv-caching",
    title: "KV caching",
    requires: ["py.ml.red-teaming"],
    vocabulary: [
      ["key-value cache", "the stored attention keys and values for tokens already generated"],
      ["prefill", "the first pass, which processes the whole prompt at once"],
      ["decode step", "generating one further token using the cache"],
    ],
    opening:
      "Without a cache, every generated token reruns attention over the whole sequence. With one, it attends to stored keys and values and the arithmetic collapses.",
    outcome:
      "You will quantify what the cache saves in compute and what it costs in memory, and see which one becomes the binding constraint.",
    why:
      "The cache turns generation from quadratic to linear per token. It also becomes the largest single memory consumer at long context or large batch.",
    mentalModel:
      "Picture the keys and values for every past token sitting in memory. Each new token reads them all and appends its own, so the pile grows by one row per step.",
    firstTitle: "What it saves",
    firstIntro:
      "Recomputing attention for each new token costs the square of the sequence. Reading a cache costs the sequence, once.",
    firstCode: `def per_token(seq, dim):
    cached = seq * dim
    recomputed = seq * seq * dim
    return cached, recomputed

for seq in (1024, 8192):
    cached, recomputed = per_token(seq, 8192)
    print(seq, "cached", cached, "recomputed", recomputed,
          f"x{recomputed // cached}")`,
    firstTrace:
      "A thousand-fold saving at a thousand tokens and eight thousand-fold at eight thousand. The ratio is just the sequence length.",
    secondTitle: "What it costs",
    secondIntro:
      "Two tensors per layer per head per token. That product grows with the sequence and again with the batch, and it is held for the whole request.",
    secondCode: `def cache_bytes(seq, layers, heads, head_dim, batch=1, bytes_each=2):
    return 2 * batch * seq * layers * heads * head_dim * bytes_each

for seq in (1024, 8192, 32768, 131072):
    print(seq, f"{cache_bytes(seq, 80, 64, 128) / 1e9:.2f} GB")

for batch in (1, 8, 32):
    print("batch", batch,
          f"{cache_bytes(4096, 80, 64, 128, batch=batch) / 1e9:.2f} GB")`,
    secondTrace:
      "Three hundred forty-three gigabytes at a hundred and thirty thousand tokens, and the same figure at four thousand tokens with a batch of thirty-two. Memory, not compute, sets the serving limit.",
    mistake:
      "Sizing a deployment from the model weights alone. At any serious batch size the cache dwarfs them, and the request that fits in isolation fails under load.",
    checkpoint:
      "Batch size doubles at fixed context. What happens to cache memory?",
    checkpointAnswer:
      "It doubles. The cache is per request, so batch and sequence multiply together.",
    remember:
      "The cache trades quadratic compute for linear, growing memory.",
    checks: [
      {
        question: "What does the cache store?",
        choices: [
          "Attention keys and values for tokens already processed",
          "The generated tokens themselves",
          "The model weights",
        ],
        answer: 0,
        explanation: "It is what the next token needs to attend to.",
        why: [
          "Correct. Two tensors per layer per head per token.",
          "Those are cheap and not the issue.",
          "Weights are shared across requests.",
        ],
      },
      {
        question: "How does cache memory scale?",
        choices: [
          "With sequence length times batch size",
          "With sequence length only",
          "It is constant per model",
        ],
        answer: 0,
        explanation: "Each request keeps its own.",
        why: [
          "Correct, which is why batch and context trade against each other.",
          "Batch multiplies it too.",
          "It grows with every generated token.",
        ],
      },
      {
        question: "What usually limits how many requests a server can hold?",
        choices: [
          "Cache memory, not model weights",
          "Model weights",
          "Network bandwidth",
        ],
        answer: 0,
        explanation: "Weights are loaded once and shared.",
        why: [
          "Correct. At batch it dwarfs the weights.",
          "Those are a fixed one-time cost.",
          "Bandwidth is rarely the binding constraint here.",
        ],
      },
    ],
  },
  {
    lessonId: "py.mc.m9_5.l2",
    atomId: "py.atom.ml.quantization",
    conceptId: "py.ml.quantization",
    title: "Quantization",
    requires: ["py.ml.kv-caching"],
    vocabulary: [
      ["quantization", "storing weights at reduced precision with a scale to recover them"],
      ["scale", "the step size between adjacent representable values"],
      ["outlier", "a single large value that stretches the range and coarsens every other step"],
    ],
    opening:
      "Halving the bits halves the memory. The question is what the rounding costs, and the answer depends almost entirely on the outliers.",
    outcome:
      "You will quantize to several widths, measure the error, and see one outlier destroy the precision of everything else.",
    why:
      "A seventy-billion-parameter model is a hundred and forty gigabytes at half precision and thirty-five at four bits. That is the difference between a cluster and a single device.",
    mentalModel:
      "Picture the value range divided into evenly spaced levels. Fewer bits means fewer levels, and one distant value stretches the whole range.",
    firstTitle: "Fewer bits, coarser steps",
    firstIntro:
      "The scale is the range divided by the number of levels. Each halving of the bit count roughly squares the number of levels lost.",
    firstCode: `def quantize(values, bits):
    low, high = min(values), max(values)
    levels = 2 ** bits - 1
    scale = (high - low) / levels
    restored = [round((v - low) / scale) * scale + low for v in values]
    error = max(abs(a - b) for a, b in zip(values, restored))
    return round(error, 6), round(scale, 6)

values = [-0.8, -0.1, 0.0, 0.05, 0.3, 1.7]
for bits in (8, 4, 2):
    error, scale = quantize(values, bits)
    print(bits, "bits  max error", error, "step", scale)`,
    firstTrace:
      "Four thousandths at eight bits, seven hundredths at four and a quarter at two. The step size is the whole story.",
    secondTitle: "One outlier ruins it",
    secondIntro:
      "Add a single value far outside the range. The scale stretches to cover it, and every ordinary weight is now rounded far more coarsely.",
    secondCode: `clean, _ = quantize(values, 4)
noisy, _ = quantize(values + [30.0], 4)
print("without outlier", clean)
print("with outlier   ", noisy)
print("error grew by  ", round(noisy / clean, 1), "times")

for bits in (16, 8, 4):
    print(bits, "bits ->", round(70e9 * bits / 8 / 1e9, 1), "GB for 70B")`,
    secondTrace:
      "The error grows fourteen-fold from a single distant value. This is why practical methods isolate outliers rather than quantizing everything uniformly.",
    mistake:
      "Reporting perplexity on a small sample and calling the quantization lossless. Damage concentrates in rare inputs, so a broad evaluation with slices is the only way to see it.",
    checkpoint:
      "Why does one outlier hurt every other weight?",
    checkpointAnswer:
      "The scale spans the whole range, so a distant value widens the step size for every ordinary weight sharing that scale.",
    remember:
      "Fewer bits, bigger steps — and outliers set the range.",
    checks: [
      {
        question: "What does the scale represent?",
        choices: [
          "The gap between adjacent representable values",
          "The largest weight",
          "The bit width",
        ],
        answer: 0,
        explanation: "It is range divided by level count.",
        why: [
          "Correct, and it sets the rounding error.",
          "That fixes the range, not the step.",
          "Bits determine the level count.",
        ],
      },
      {
        question: "Why do practical methods treat outliers separately?",
        choices: [
          "A shared scale stretched by one value coarsens everything else",
          "Outliers are always errors",
          "They cost more memory",
        ],
        answer: 0,
        explanation: "The error grew fourteen-fold from one value.",
        why: [
          "Correct. Isolating them protects the rest.",
          "They are often the most important weights.",
          "They occupy the same space as any other.",
        ],
      },
      {
        question: "How should quantization damage be measured?",
        choices: [
          "Broad evaluation with slices, since damage concentrates in rare inputs",
          "Perplexity on a small sample",
          "The maximum weight error",
        ],
        answer: 0,
        explanation: "An aggregate hides a concentrated loss.",
        why: [
          "Correct. Averages hide the failure mode.",
          "That is exactly what misses it.",
          "Weight error does not predict behaviour.",
        ],
      },
    ],
  },
  {
    lessonId: "py.mc.m9_5.l3",
    atomId: "py.atom.ml.distillation",
    conceptId: "py.ml.distillation",
    title: "Distillation",
    requires: ["py.ml.quantization"],
    vocabulary: [
      ["teacher", "the large model whose behaviour is being transferred"],
      ["student", "the smaller model trained to reproduce it"],
      ["soft target", "the teacher's full output distribution rather than only its top choice"],
    ],
    opening:
      "A hard label says which answer is right. The teacher's full distribution also says which wrong answers were close, and that extra information is what makes distillation work.",
    outcome:
      "You will soften a teacher's distribution with temperature and see what information the hard label throws away.",
    why:
      "Training the student on the teacher's uncertainty transfers far more per example than a one-hot label does, so a small student can be trained on far less data.",
    mentalModel:
      "Picture the teacher ranking every option. The hard label keeps only the winner; the soft target keeps the whole ranking, including how close second place was.",
    firstTitle: "Temperature reveals the ranking",
    firstIntro:
      "Dividing the scores before the softmax flattens the distribution. A higher temperature exposes the relative ordering of the losing options.",
    firstCode: `import math

def soft(logits, temperature):
    scaled = [l / temperature for l in logits]
    peak = max(scaled)
    weights = [math.exp(s - peak) for s in scaled]
    total = sum(weights)
    return [round(w / total, 4) for w in weights]

logits = [4.0, 2.0, 1.5, 0.2]
for temperature in (1.0, 2.0, 5.0):
    print("T =", temperature, soft(logits, temperature))`,
    firstTrace:
      "At temperature one the winner takes eighty percent. At five the distribution flattens to thirty-six, twenty-four, twenty-two and seventeen, and the ranking is visible.",
    secondTitle: "What the hard label loses",
    secondIntro:
      "The one-hot target says nothing about the runners-up. Two teachers with completely different second choices produce identical hard labels.",
    secondCode: `print("hard target    ", [1, 0, 0, 0])
print("soft target T=2", soft(logits, 2.0))
print("soft target T=5", soft(logits, 5.0))`,
    secondTrace:
      "The hard target carries one bit of ranking; the soft one carries the whole ordering. That difference is the training signal being transferred.",
    mistake:
      "Distilling on a narrow prompt set and shipping. The student matches the teacher exactly where it was distilled and diverges everywhere else, so the evaluation has to cover the deployment distribution.",
    checkpoint:
      "What does a soft target carry that a hard label does not?",
    checkpointAnswer:
      "The teacher's relative ranking of the wrong answers — how close each one was — which is far more information per example.",
    remember:
      "Transfer the whole distribution, not just the winner.",
    checks: [
      {
        question: "What does raising the temperature do?",
        choices: [
          "Flattens the distribution and exposes the ranking",
          "Sharpens the top choice",
          "Changes the winner",
        ],
        answer: 0,
        explanation: "It divides the scores before the softmax.",
        why: [
          "Correct. The losing options become visible.",
          "That is what lowering it does.",
          "The ordering is preserved.",
        ],
      },
      {
        question: "Why is a soft target more informative?",
        choices: [
          "It encodes how close each wrong answer was",
          "It is numerically larger",
          "It has more entries",
        ],
        answer: 0,
        explanation: "Compare two teachers with different second choices.",
        why: [
          "Correct. A hard label cannot distinguish them.",
          "Magnitude is not the point.",
          "Both cover the same vocabulary.",
        ],
      },
      {
        question: "A student is distilled on a narrow prompt set. What is the risk?",
        choices: [
          "It matches the teacher there and diverges elsewhere",
          "It becomes larger than the teacher",
          "It cannot be quantized",
        ],
        answer: 0,
        explanation: "Coverage of the deployment distribution is what matters.",
        why: [
          "Correct. The evaluation must span deployment.",
          "The student is smaller by construction.",
          "Quantization is independent.",
        ],
      },
    ],
  },
  {
    lessonId: "py.mc.m9_5.l4",
    atomId: "py.atom.ml.speculative-decoding",
    conceptId: "py.ml.speculative-decoding",
    title: "Speculative and parallel decoding",
    requires: ["py.ml.distillation"],
    vocabulary: [
      ["draft model", "a small fast model proposing several tokens at once"],
      ["verification", "one pass of the target model checking the whole draft"],
      ["acceptance rate", "the probability the target agrees with a drafted token"],
    ],
    opening:
      "Generating one token at a time wastes a device built for parallel work. A small model guesses several, and one pass of the big model checks them all.",
    outcome:
      "You will compute the expected tokens per verification and find where the draft stops paying for itself.",
    why:
      "The verification is exact, so the output distribution is unchanged. It is a pure latency win when the acceptance rate is high enough.",
    mentalModel:
      "Picture the draft as a guess at the next few tokens. The target checks them in one pass and keeps the prefix it agrees with, then generates one more itself.",
    firstTitle: "Expected tokens per pass",
    firstIntro:
      "Acceptance stops at the first disagreement, so the expected run length is a geometric sum. The target always contributes one token regardless.",
    firstCode: `def expected_tokens(accept_rate, draft_length):
    total, probability = 0.0, 1.0
    for _ in range(draft_length):
        total += probability
        probability *= accept_rate
    return round(total + 1, 4)

for rate in (0.2, 0.5, 0.8, 0.95):
    print("accept", rate, "->", expected_tokens(rate, 4),
          "tokens per verification")`,
    firstTrace:
      "Two point two five tokens at a twenty percent acceptance rate and four point seven at ninety-five. The draft length caps it at five.",
    secondTitle: "The draft is not free",
    secondIntro:
      "Each drafted token costs a fraction of a target step. Dividing the expected tokens by the total cost gives the actual speedup.",
    secondCode: `def speedup(accept_rate, draft_length, draft_cost):
    gained = expected_tokens(accept_rate, draft_length)
    spent = 1 + draft_length * draft_cost
    return round(gained / spent, 3)

for rate in (0.2, 0.5, 0.8, 0.95):
    print("accept", rate, "speedup", speedup(rate, 4, 0.1))`,
    secondTrace:
      "One point six at twenty percent acceptance, rising to three point four at ninety-five. A draft model too slow or too dissimilar erases the gain entirely.",
    mistake:
      "Choosing a draft model on quality alone. What matters is agreement with the target divided by cost, and a very good draft that is a third the size can be slower overall than a weak one a fiftieth the size.",
    checkpoint:
      "Does speculative decoding change what the model produces?",
    checkpointAnswer:
      "No. The verification is exact, so the output distribution is identical to generating one token at a time.",
    remember:
      "Draft several, verify once, keep the agreed prefix.",
    checks: [
      {
        question: "What does the target model do with the draft?",
        choices: [
          "Verifies it in one pass and keeps the agreed prefix",
          "Regenerates it from scratch",
          "Averages with it",
        ],
        answer: 0,
        explanation: "That is what makes it exact.",
        why: [
          "Correct, and it adds one token of its own.",
          "That would remove the saving.",
          "No blending is involved.",
        ],
      },
      {
        question: "How does the output distribution compare?",
        choices: [
          "Identical to ordinary decoding",
          "Slightly different",
          "Depends on the draft model",
        ],
        answer: 0,
        explanation: "Verification is exact by construction.",
        why: [
          "Correct. It is purely a latency method.",
          "Nothing is approximated.",
          "The draft affects speed only.",
        ],
      },
      {
        question: "What should decide the choice of draft model?",
        choices: [
          "Agreement with the target divided by its cost",
          "Its standalone quality",
          "Its parameter count alone",
        ],
        answer: 0,
        explanation: "Both terms matter.",
        why: [
          "Correct. A slow accurate draft can be a net loss.",
          "Quality without speed does not pay.",
          "Size is a proxy for cost, not for agreement.",
        ],
      },
    ],
  },
  {
    lessonId: "py.mc.m9_5.l5",
    atomId: "py.atom.ml.llm-serving",
    conceptId: "py.ml.llm-serving",
    title: "Serving",
    requires: ["py.ml.speculative-decoding"],
    vocabulary: [
      ["static batching", "fixing a batch at the start and waiting for every member to finish"],
      ["continuous batching", "admitting a new request as soon as any member completes"],
      ["head-of-line blocking", "short requests waiting behind one long one"],
    ],
    opening:
      "Generation lengths in a batch differ by more than an order of magnitude. A batching scheme that waits for the longest wastes most of the device.",
    outcome:
      "You will compare a fixed batch against one that refills as slots free, and measure the waste from head-of-line blocking.",
    why:
      "Request lengths are unknown in advance and wildly variable, so the scheduling scheme matters more here than in almost any other serving problem.",
    mentalModel:
      "Picture eight slots. Under static batching a slot sits idle from the moment its request finishes until the whole batch does; under continuous batching it takes the next waiting request immediately.",
    firstTitle: "Waiting for the longest",
    firstIntro:
      "A static batch runs for as long as its slowest member. Every other slot is idle for the difference.",
    firstCode: `def static_batching(requests, size):
    steps = 0
    for start in range(0, len(requests), size):
        steps += max(requests[start:start + size])
    return steps

lengths = [10, 200, 15, 8, 300, 12, 9, 11]
print("static", static_batching(lengths, 4), "steps")`,
    firstTrace:
      "Five hundred steps for eight requests totalling five hundred and sixty-five tokens. Two long requests dictated the whole schedule.",
    secondTitle: "Refilling as slots free",
    secondIntro:
      "Admitting a waiting request the moment a slot opens keeps the batch full. The same work finishes in far fewer steps.",
    secondCode: `def continuous_batching(requests, size):
    pending, active, steps = list(requests), [], 0
    while pending or active:
        steps += 1
        while pending and len(active) < size:
            active.append(pending.pop(0))
        active = [r - 1 for r in active]
        active = [r for r in active if r > 0]
    return steps

print("continuous", continuous_batching(lengths, 4), "steps")`,
    secondTrace:
      "Three hundred and eight steps against five hundred - a thirty-eight percent reduction from scheduling alone, with no change to the model.",
    mistake:
      "Measuring throughput on a synthetic workload where every request is the same length. That is the one case where the two schemes agree, and it hides the entire problem.",
    checkpoint:
      "Why does static batching waste so much on real traffic?",
    checkpointAnswer:
      "Generation lengths vary enormously, so most slots sit idle waiting for the longest request in their batch to finish.",
    remember:
      "Refill the slot the moment it frees.",
    checks: [
      {
        question: "What does continuous batching change?",
        choices: [
          "A freed slot admits a waiting request immediately",
          "The batch size",
          "The model's outputs",
        ],
        answer: 0,
        explanation: "It is purely a scheduling change.",
        why: [
          "Correct. The batch stays full.",
          "The maximum batch is unchanged.",
          "Outputs are identical.",
        ],
      },
      {
        question: "When do the two schemes perform identically?",
        choices: [
          "When every request has the same length",
          "When the batch is large",
          "When the model is small",
        ],
        answer: 0,
        explanation: "That is why uniform benchmarks mislead.",
        why: [
          "Correct, and real traffic never looks like that.",
          "Larger batches make the gap worse.",
          "Model size is irrelevant.",
        ],
      },
      {
        question: "What is head-of-line blocking here?",
        choices: [
          "Short requests waiting on one long request in the batch",
          "Network queuing",
          "Cache eviction",
        ],
        answer: 0,
        explanation: "It is about the batch, not the network.",
        why: [
          "Correct. Continuous batching removes it.",
          "This is a scheduling effect inside the server.",
          "Eviction is a memory concern.",
        ],
      },
    ],
  },
  {
    lessonId: "py.mc.m9_5.l6",
    atomId: "py.atom.ml.production-rag",
    conceptId: "py.ml.production-rag",
    title: "Production RAG",
    requires: ["py.ml.llm-serving"],
    vocabulary: [
      ["recall at k", "whether the needed document is anywhere in the retrieved shortlist"],
      ["reranking", "reordering the shortlist with a more expensive model"],
      ["grounding", "generating only what the retrieved context supports"],
    ],
    opening:
      "Retrieval-augmented generation is a chain, and a chain of imperfect stages multiplies. Each stage looks acceptable on its own and the end-to-end number is much worse.",
    outcome:
      "You will multiply the stage rates to get the end-to-end figure, and see why improving the last stage cannot fix the first.",
    why:
      "Teams optimise the generation prompt for weeks while retrieval quietly caps the whole system at a number the prompt can never exceed.",
    mentalModel:
      "Picture three gates in series. The document has to survive retrieval, survive reranking, and then be used faithfully. Miss any one and the answer is wrong.",
    firstTitle: "The stages multiply",
    firstIntro:
      "Each stage passes some fraction. The end-to-end rate is the product, not the average and not the minimum.",
    firstCode: `stages = [("retrieval", 0.92), ("rerank", 0.85),
          ("generation", 0.95)]

cumulative = 1.0
for name, rate in stages:
    cumulative *= rate
    print(f"{name:11} {rate}  cumulative {round(cumulative, 4)}")`,
    firstTrace:
      "Three stages at ninety-two, eighty-five and ninety-five percent give seventy-four percent end to end. No single stage looks like the problem.",
    secondTitle: "Retrieval is the ceiling",
    secondIntro:
      "Vary the first stage and hold the rest fixed. The end-to-end figure moves almost one for one, because everything downstream multiplies through.",
    secondCode: `def end_to_end(recall, rerank=0.85, generation=0.95):
    return round(recall * rerank * generation, 4)

for recall in (0.70, 0.92, 0.99):
    print("recall", recall, "-> end-to-end", end_to_end(recall))`,
    secondTrace:
      "Fifty-seven percent at a recall of seventy, seventy-four at ninety-two, and eighty at ninety-nine. Perfect generation still cannot exceed the recall.",
    mistake:
      "Measuring only the final answer quality. Without per-stage numbers a failure is unattributable, and the team optimises whichever stage is easiest to change rather than the one that is binding.",
    checkpoint:
      "Generation is made perfect. What is the best possible end-to-end rate?",
    checkpointAnswer:
      "Recall times rerank precision. The generation stage cannot use a document that never reached it.",
    remember:
      "Measure every stage; the product is what users see.",
    checks: [
      {
        question: "How do stage rates combine?",
        choices: [
          "They multiply",
          "They average",
          "The minimum wins",
        ],
        answer: 0,
        explanation: "The document must survive every stage.",
        why: [
          "Correct, which is why the total is worse than any stage.",
          "Averaging would overstate it badly.",
          "The product is lower than the minimum.",
        ],
      },
      {
        question: "Retrieval recall is seventy percent. Can prompt engineering reach ninety end to end?",
        choices: [
          "No; the ceiling is set upstream",
          "Yes, with a better prompt",
          "Yes, with a larger model",
        ],
        answer: 0,
        explanation: "Generation only sees what it was given.",
        why: [
          "Correct. Seventy percent caps everything after it.",
          "Prompting cannot recover a missing document.",
          "Model size does not affect retrieval.",
        ],
      },
      {
        question: "Why measure each stage separately?",
        choices: [
          "Otherwise a failure cannot be attributed to a stage",
          "To reduce latency",
          "To simplify the code",
        ],
        answer: 0,
        explanation: "Think about which stage to fix.",
        why: [
          "Correct. The binding stage is often not the obvious one.",
          "Measurement adds latency rather than removing it.",
          "It adds instrumentation.",
        ],
      },
    ],
  },
];

export const ML_INFERENCE_ATOMS = ML_INFERENCE_SPECS.map(guidedMasteryAtom);
export const ML_INFERENCE_CONCEPTS = ML_INFERENCE_SPECS.map(guidedMasteryConcept);
export const ML_INFERENCE_LESSON_CONTENT = guidedLessonContent(ML_INFERENCE_SPECS);

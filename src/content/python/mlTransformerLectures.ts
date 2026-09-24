import type { LectureQuestion } from "../../types";
import {
  guidedLessonContent,
  guidedMasteryAtom,
  guidedMasteryConcept,
  type GuidedMasterySpec,
} from "./guidedMastery";

const q = (
  question: string,
  choices: [string, string, string],
  answer: 0 | 1 | 2,
  explanation: string,
  why: [string, string, string],
): LectureQuestion => ({ question, choices, answer, explanation, why });

const ML_TRANSFORMER_SPECS: GuidedMasterySpec[] = [
  {
    lessonId: "py.mc.m6_2.l1",
    atomId: "py.atom.ml.positional-representations",
    conceptId: "py.ml.positional-representations",
    title: "Attention has no idea what order the tokens are in",
    requires: ["py.ml.contextual-embeddings"],
    vocabulary: [
      ["permutation invariance", "producing the same output whatever order the inputs arrive in"],
      ["positional encoding", "information added so a position can be distinguished"],
      ["sinusoidal encoding", "a fixed pattern of sines and cosines at varying frequencies"],
      ["relative position", "the distance between two tokens rather than their absolute indices"],
    ],
    opening: "Attention compares every position with every other and sums the results. Sums do not care about order, so without something added, a sentence and its shuffle produce identical outputs.",
    outcome: "You will show that attention alone is order-blind, and compare absolute, sinusoidal and relative schemes for fixing it.",
    why: "Position handling is one of the few parts of the architecture that has genuinely changed since the original design, and the reasons rotary and relative schemes replaced learned tables are worth knowing.",
    mentalModel: "Picture a bag of words rather than a sentence. Attention reaches into the bag and weighs what it finds, and nothing in the bag records which word came first unless it was written on the word itself.",
    firstTitle: "The same set, shuffled, gives the same answer",
    firstIntro: "Attention weights depend on content, so a permutation permutes the output and changes nothing else.",
    firstCode: `import math

def attend(rows):
    width = len(rows[0])
    scale = math.sqrt(width)
    out = []
    for query in rows:
        scores = [sum(a * b for a, b in zip(query, key)) / scale for key in rows]
        top = max(scores)
        raw = [math.exp(s - top) for s in scores]
        total = sum(raw)
        out.append([round(sum(w / total * rows[j][d] for j, w in enumerate(raw)), 4)
                    for d in range(width)])
    return out

sentence = [[1.0, 0.0], [0.0, 1.0], [1.0, 1.0]]
shuffled = [sentence[2], sentence[0], sentence[1]]

print("in order: ", attend(sentence))
print("shuffled: ", attend(shuffled))
print("same rows, reordered - the model cannot tell them apart")`,
    firstTrace: "The shuffled input produces the same three output rows in a different order, and nothing else changes. A model given only this could not distinguish a sentence from its reverse. Position has to be injected before attention runs, because attention itself has no mechanism for it.",
    secondTitle: "Three ways to inject it",
    secondIntro: "A fixed pattern, a learned table, or a signal about distance rather than index.",
    secondCode: `import math

def sinusoidal(position, width):
    values = []
    for i in range(0, width, 2):
        angle = position / (10000 ** (i / width))
        values.append(round(math.sin(angle), 4))
        values.append(round(math.cos(angle), 4))
    return values

for position in (0, 1, 2, 10):
    print(f"position {position:>3}: {sinusoidal(position, 8)}")

print()
print("relative offsets between four positions:")
for i in range(4):
    print("  ", [i - j for j in range(4)])`,
    secondTrace: "The sinusoidal pattern varies quickly in its early dimensions and slowly in its later ones, so nearby positions differ in the fast components while distant ones differ in the slow ones. The relative table records only the offset between two positions, which is the same at index five and index five hundred. That property is why relative and rotary schemes extend to sequences longer than anything seen in training.",
    mistake: "Do not use a learned absolute table and then run the model on longer sequences than it was trained on. The table has no row for those positions, so they either raise an error or fall back to a value the model has never seen.",
    checkpoint: "Why do relative schemes handle unseen sequence lengths better than a learned absolute table?",
    checkpointAnswer: "Because they encode the distance between two tokens rather than their indices, and a distance of three looks the same at position five as at position five thousand. A learned absolute table has one row per index, so any index beyond the training range has no entry at all.",
    remember: "Attention is order-blind, so position must be injected before it runs. Absolute schemes index the position, and relative ones encode the distance, which is what generalizes past the trained length.",
    checks: [
      q("Why is attention permutation invariant?", ["It sums over positions, and sums ignore order", "It sorts the inputs", "It uses a fixed window"], 0, "Nothing in the operation records an index.", ["Correct. Position must be added beforehand.", "No sorting takes place.", "Attention spans the whole sequence."]),
      q("What does a relative scheme encode?", ["The distance between two positions", "The absolute index of each token", "The length of the sequence"], 0, "A distance of three is the same anywhere.", ["Correct. That is what generalizes past the trained length.", "That is the absolute approach.", "Length is not what is encoded."]),
      q("A learned absolute table meets a longer sequence than it trained on. What happens?", ["Those positions have no row at all", "The table interpolates", "Attention ignores them"], 0, "The table has one row per trained index.", ["Correct. Relative and rotary schemes avoid this.", "Nothing interpolates automatically.", "The tokens are still attended; only position breaks."]),
    ],
  },
  {
    lessonId: "py.mc.m6_2.l2",
    atomId: "py.atom.ml.transformer-block",
    conceptId: "py.ml.transformer-block",
    title: "One block, four parts, repeated",
    requires: ["py.ml.positional-representations"],
    vocabulary: [
      ["residual stream", "the running vector each sublayer reads from and adds back into"],
      ["sublayer", "either the attention or the feed-forward half of a block"],
      ["pre-normalization", "normalizing the input to a sublayer rather than its output"],
      ["expansion factor", "how much wider the feed-forward hidden layer is than the model"],
    ],
    opening: "A transformer is one block repeated. That block has exactly two operations that do work and two that keep training stable, and every model you have heard of differs only in the sizes and the repeat count.",
    outcome: "You will trace a token through both sublayers, and explain what the residual stream and the normalization each contribute.",
    why: "Reading any model implementation becomes straightforward once the block is familiar, because the rest of the file is configuration. The pre-normalization detail is also the difference between a model that trains and one that needs a careful warmup.",
    mentalModel: "Picture a conveyor belt carrying a vector. Each station reads what is on the belt, computes a correction, and adds it back. Nothing is ever replaced, so the original signal always has a path through.",
    firstTitle: "Attention mixes across tokens, the feed-forward works within one",
    firstIntro: "The two sublayers do genuinely different jobs, and each adds back into the stream.",
    firstCode: `import math

def layer_norm(vector, eps=1e-5):
    mean = sum(vector) / len(vector)
    variance = sum((x - mean) ** 2 for x in vector) / len(vector)
    return [round((x - mean) / math.sqrt(variance + eps), 4) for x in vector]

def feed_forward(vector, first, second):
    hidden = [max(0.0, sum(x * row[j] for x, row in zip(vector, first)))
              for j in range(len(first[0]))]
    return [sum(h * row[j] for h, row in zip(hidden, second))
            for j in range(len(second[0]))]

stream = [1.0, 0.0]
w_in = [[1.0, 0.0, 1.0], [0.0, 1.0, 1.0]]
w_out = [[1.0, 0.0], [0.0, 1.0], [0.5, 0.5]]

print("stream in:          ", stream)
correction = feed_forward(layer_norm(stream), w_in, w_out)
print("feed-forward output:", [round(v, 4) for v in correction])
print("stream out:         ", [round(s + c, 4) for s, c in zip(stream, correction)])
print("the stream is added to, never replaced")`,
    firstTrace: "The sublayer reads a normalized copy of the stream and returns a correction, which is added back. Attention does the same thing, differing only in that it looks at other positions while the feed-forward looks only at this one. Every block in the stack repeats that pair.",
    secondTitle: "Where the normalization sits changes how it trains",
    secondIntro: "Normalizing the sublayer's input leaves the residual path completely clean.",
    secondCode: `def post_norm_path(depth, scale=0.9):
    signal = 1.0
    for _ in range(depth):
        signal *= scale
    return signal

def pre_norm_path(depth):
    signal = 1.0
    for _ in range(depth):
        signal += 0.0
    return signal

for depth in (6, 24, 96):
    print(f"depth {depth:>3}: post-norm path {post_norm_path(depth):.6f}  "
          f"pre-norm path {pre_norm_path(depth):.6f}")

print()
print("pre-norm keeps an unscaled route from the input to the output")`,
    secondTrace: "Normalizing after the addition puts a scaling step on the residual path itself, so the signal is rescaled once per block and a deep stack attenuates it. Normalizing before the sublayer leaves that path untouched, which is why very deep models switched to it. The two arrangements compute similar things and train very differently.",
    mistake: "Do not normalize the residual stream itself between blocks. The whole point of the stream is that it offers an unmodified route from input to output, and rescaling it at every block reintroduces exactly the attenuation that residual connections were introduced to remove.",
    checkpoint: "What does the feed-forward sublayer do that attention does not?",
    checkpointAnswer: "It transforms each position independently, with no reference to any other token. Attention is the only part of the block that moves information between positions, so removing the feed-forward would leave a model that mixes but never transforms, and removing attention would leave positions unable to see each other at all.",
    remember: "A block is attention, then a feed-forward, each reading a normalized copy of the residual stream and adding a correction back. Attention mixes across positions; the feed-forward works within one.",
    checks: [
      q("Which part of a block moves information between positions?", ["Attention", "The feed-forward sublayer", "The normalization"], 0, "The feed-forward sees one position at a time.", ["Correct. That is the only mixing step.", "It transforms each position independently.", "Normalization rescales within a vector."]),
      q("What does the residual stream provide?", ["An unmodified route from input to output", "Extra parameters", "A place to store attention weights"], 0, "Sublayers add to it rather than replacing it.", ["Correct. That is what makes depth trainable.", "The stream itself holds no parameters.", "Weights are transient."]),
      q("Why did deep models move to pre-normalization?", ["It leaves the residual path unscaled", "It uses fewer parameters", "It removes the need for attention"], 0, "Post-norm rescales the stream once per block.", ["Correct. Deep stacks otherwise attenuate the signal.", "The parameter count is the same.", "Attention is unaffected."]),
    ],
  },
  {
    lessonId: "py.mc.m6_2.l3",
    atomId: "py.atom.ml.transformer-stacks",
    conceptId: "py.ml.transformer-stacks",
    title: "Encoder, decoder, or both, decided by the masking",
    requires: ["py.ml.transformer-block"],
    vocabulary: [
      ["encoder stack", "blocks whose attention may look in both directions"],
      ["decoder stack", "blocks whose attention may only look back, never forward"],
      ["cross-attention", "a sublayer whose keys and values come from the encoder"],
      ["modelling objective", "what the model is trained to predict"],
    ],
    opening: "The three transformer families use the same block. What separates them is which positions each one is allowed to see, and that follows directly from what the model is being asked to predict.",
    outcome: "You will match a masking pattern to an objective, and say where cross-attention takes its keys and values from.",
    why: "Choosing the wrong family for a task wastes an entire training run. The masking rule also explains why a generative model cannot simply be used as a bidirectional encoder.",
    mentalModel: "Picture proofreading versus dictating. A proofreader may look at the whole page at once. Someone dictating has only said what they have said, and cannot consult words they have not spoken yet.",
    firstTitle: "The mask is the difference",
    firstIntro: "Bidirectional attention sees everything; causal attention sees only what came before.",
    firstCode: `def show(mask):
    for index, row in enumerate(mask):
        marks = "".join("o" if allowed else "." for allowed in row)
        print(f"  position {index}: {marks}")

length = 5
encoder = [[True] * length for _ in range(length)]
decoder = [[j <= i for j in range(length)] for i in range(length)]

print("encoder mask (bidirectional):")
show(encoder)
print("decoder mask (causal):")
show(decoder)`,
    firstTrace: "The encoder pattern is completely filled, so every position may consult every other. The decoder pattern is lower-triangular, including the diagonal so a position can see itself. Nothing else in the architecture changes between the two families.",
    secondTitle: "Objectives follow from the masking",
    secondIntro: "What a model can see determines what it can honestly be asked to predict.",
    secondCode: `FAMILIES = {
    "encoder-only": {
        "mask": "bidirectional",
        "objective": "fill in masked tokens using both sides",
        "suits": "classification, retrieval, tagging",
    },
    "decoder-only": {
        "mask": "causal",
        "objective": "predict the next token from earlier ones",
        "suits": "generation, chat, completion",
    },
    "encoder-decoder": {
        "mask": "bidirectional input, causal output",
        "objective": "generate an output sequence from an input one",
        "suits": "translation, summarization, speech",
    },
}

for name, facts in FAMILIES.items():
    print(f"{name:<16} {facts['mask']:<32} {facts['suits']}")

print()
print("cross-attention takes queries from the decoder")
print("and keys and values from the encoder output")`,
    secondTrace: "A bidirectional model cannot be asked to predict the next token, because it can already see it. A causal model can be asked to, which is why generation is a decoder-only job. The encoder-decoder family keeps both, and its cross-attention is the only place the two halves meet.",
    mistake: "Do not describe a decoder-only model as weaker because it sees less. It sees less at each position and more positions in total during training, since every token serves as a prediction target, which is a large part of why the family scaled so well.",
    checkpoint: "Cross-attention takes its queries from one stack and its keys and values from another. Which way round, and why?",
    checkpointAnswer: "Queries come from the decoder and keys and values from the encoder output. The decoder is the side asking what it needs next, and the encoder holds the representations being consulted, so the direction follows from which side is doing the retrieving.",
    remember: "One block, three families, separated by masking. Bidirectional suits understanding, causal suits generation, and cross-attention queries from the decoder into the encoder's output.",
    checks: [
      q("What separates an encoder stack from a decoder stack?", ["Which positions the attention mask permits", "The block structure", "The number of parameters"], 0, "The block itself is identical.", ["Correct. Bidirectional versus causal is the whole difference.", "Both use the same block.", "Size is a separate choice."]),
      q("Why can a bidirectional model not be trained to predict the next token?", ["It can already see that token", "It has no output layer", "Its blocks are too shallow"], 0, "The objective would be trivially satisfied.", ["Correct. That is why generation needs a causal mask.", "An output layer is easily added.", "Depth is unrelated."]),
      q("In cross-attention, where do the keys and values come from?", ["The encoder's output", "The decoder's own positions", "The embedding table"], 0, "The decoder supplies the queries.", ["Correct. The decoder retrieves from the encoder.", "That is self-attention.", "Embeddings feed the first block only."]),
    ],
  },
  {
    lessonId: "py.mc.m6_2.l4",
    atomId: "py.atom.ml.transformer-shapes",
    conceptId: "py.ml.transformer-shapes",
    title: "Counting the parameters, exactly",
    requires: ["py.ml.transformer-stacks"],
    vocabulary: [
      ["projection matrix", "one of the weight matrices producing queries, keys, values or output"],
      ["parameter count", "the total number of learned numbers in the model"],
      ["embedding parameters", "the vocabulary table, often a large share of a small model"],
      ["tied weights", "reusing the embedding table as the output projection"],
    ],
    opening: "You can compute a model's parameter count on paper, and doing it once removes most of the mystery from published model cards. The arithmetic is four matrices per attention, two per feed-forward, and one large table for the vocabulary.",
    outcome: "You will count the parameters of a block and a whole stack, and see how much of a small model is embeddings.",
    why: "Memory planning, cost estimation and sanity-checking an implementation all start here. A count that does not match a published figure is usually a shape error you would otherwise not have noticed.",
    mentalModel: "Picture an itemized bill. Each block charges the same amount, the vocabulary table charges once, and reading the total tells you which line item is actually dominating.",
    firstTitle: "One block, three line items",
    firstIntro: "Attention has four square matrices, the feed-forward has two rectangular ones.",
    firstCode: `def block_parameters(width, expansion=4):
    attention = 4 * width * width
    feed_forward = 2 * width * width * expansion
    norms = 4 * width
    return attention, feed_forward, norms, attention + feed_forward + norms

for width in (128, 512, 768):
    attention, feed_forward, norms, total = block_parameters(width)
    print(f"width {width:>4}: attention {attention:>10,}  "
          f"feed-forward {feed_forward:>10,}  total {total:>10,}")

print()
print("the feed-forward holds twice the attention's parameters")`,
    firstTrace: "The four attention projections give four times the width squared, and the feed-forward's expansion of four gives eight times, so two thirds of every block is the feed-forward. Normalization contributes almost nothing. That ratio holds at every width, because both terms scale the same way.",
    secondTitle: "The whole stack, checked against a real model",
    secondIntro: "Multiply the block count and add the vocabulary table.",
    secondCode: `def block_parameters(width, expansion=4):
    return 4 * width * width + 2 * width * width * expansion + 4 * width

def model_parameters(width, layers, vocab):
    blocks = block_parameters(width) * layers
    embeddings = vocab * width
    return blocks, embeddings, blocks + embeddings

blocks, embeddings, total = model_parameters(768, 12, 50257)
print(f"12 blocks of width 768: {blocks:,}")
print(f"embedding table:        {embeddings:,}")
print(f"total:                  {total:,}")
print(f"embeddings are {100 * embeddings / total:.1f}% of the model")`,
    secondTrace: "That configuration totals about a hundred and twenty-four million parameters, which is the published size of the smallest well-known generative model of its generation. Nearly a third of it is the vocabulary table, which is why tying the input and output embeddings was a common saving. At larger widths the blocks dominate and that share falls away.",
    mistake: "Do not forget that the output projection reuses or duplicates the embedding table. Assuming a separate output matrix double-counts the vocabulary term, which on a small model is an error of tens of millions of parameters.",
    checkpoint: "A model is 512 wide with 6 layers and a 32000-token vocabulary. Which term dominates?",
    checkpointAnswer: "The embedding table. Six blocks of that width total about nineteen million parameters, while the vocabulary table alone is over sixteen million. At small widths the table competes with the entire stack, and only at larger widths do the blocks take over.",
    remember: "Four square matrices per attention, two of expansion times the width per feed-forward, and one vocabulary table. On small models the table is a large share of the total.",
    checks: [
      q("What fraction of a block is the feed-forward, at the usual expansion of four?", ["About two thirds", "About one third", "About half"], 0, "Attention gives four times the width squared; the feed-forward gives eight.", ["Correct. The ratio holds at every width.", "That is attention's share.", "The two are not equal."]),
      q("Why does the embedding table matter more on a small model?", ["It scales with the width while the blocks scale with its square", "It is duplicated per layer", "It is stored at higher precision"], 0, "The blocks overtake it as the width grows.", ["Correct. On a small model it can rival the whole stack.", "There is one table for the whole model.", "Precision is uniform."]),
      q("What does tying the input and output embeddings save?", ["One whole vocabulary-sized matrix", "One block", "The normalization parameters"], 0, "The output projection reuses the table.", ["Correct. That is tens of millions on a small model.", "Blocks are unaffected.", "Normalization is negligible either way."]),
    ],
  },
  {
    lessonId: "py.mc.m6_2.l5",
    atomId: "py.atom.ml.transformer-implementation",
    conceptId: "py.ml.transformer-implementation",
    title: "A whole transformer, small enough to read",
    requires: ["py.ml.transformer-shapes"],
    vocabulary: [
      ["logits", "the unnormalized scores over the vocabulary before any softmax"],
      ["unembedding", "the projection from the model width back to vocabulary size"],
      ["greedy decoding", "always emitting the highest-scoring next token"],
      ["forward pass", "everything from token indices to logits"],
    ],
    opening: "Every piece has now been covered separately. Putting them in order gives a complete model in about thirty lines, and running it end to end is what turns a list of components into something you understand.",
    outcome: "You will run embeddings, a causal block and an unembedding to produce logits, then decode greedily from them.",
    why: "Reading a production implementation is much easier after writing a tiny one, because the production file is the same steps surrounded by configuration, batching and device handling.",
    mentalModel: "Picture assembling a machine whose parts you have already handled one at a time. Nothing here is new; the value is entirely in seeing the order they connect in.",
    firstTitle: "Embeddings, a block, then logits",
    firstIntro: "The whole forward pass is four steps with the residual stream running through them.",
    firstCode: `import math

def softmax(values):
    top = max(values)
    raw = [math.exp(v - top) for v in values]
    total = sum(raw)
    return [v / total for v in raw]

def layer_norm(vector, eps=1e-5):
    mean = sum(vector) / len(vector)
    variance = sum((x - mean) ** 2 for x in vector) / len(vector)
    return [(x - mean) / math.sqrt(variance + eps) for x in vector]

def causal_attend(rows):
    width = len(rows[0])
    scale = math.sqrt(width)
    out = []
    for i, query in enumerate(rows):
        scores = [sum(a * b for a, b in zip(query, key)) / scale
                  for key in rows]
        scores = [s if j <= i else -math.inf for j, s in enumerate(scores)]
        weights = softmax(scores)
        out.append([sum(w * rows[j][d] for j, w in enumerate(weights))
                    for d in range(width)])
    return out

EMBED = {"a": [1.0, 0.0], "b": [0.0, 1.0]}
tokens = ["a", "b", "a"]
stream = [EMBED[t] for t in tokens]
attended = causal_attend([layer_norm(r) for r in stream])
stream = [[s + a for s, a in zip(row, add)] for row, add in zip(stream, attended)]
for token, row in zip(tokens, stream):
    print(token, [round(v, 4) for v in row])`,
    firstTrace: "Each token is looked up, normalized, attended over everything up to itself, and added back into the stream. The first position can only see itself, so its attention output equals its own normalized vector. Nothing here needs a framework; it is arithmetic on lists.",
    secondTitle: "Logits, probabilities, and the next token",
    secondIntro: "Projecting back to vocabulary size turns the stream into scores over tokens.",
    secondCode: `import math

def softmax(values):
    top = max(values)
    raw = [math.exp(v - top) for v in values]
    total = sum(raw)
    return [round(v / total, 4) for v in raw]

VOCAB = ["a", "b"]
UNEMBED = [[1.0, 0.0], [0.0, 1.0]]
stream = [[1.0, -1.0], [-1.0, 1.0], [1.0, -1.0]]

for position, row in enumerate(stream):
    logits = [sum(row[i] * UNEMBED[i][j] for i in range(len(row)))
              for j in range(len(VOCAB))]
    probabilities = softmax(logits)
    best = VOCAB[max(range(len(VOCAB)), key=lambda j: logits[j])]
    print(f"position {position}: logits {logits}  "
          f"probabilities {probabilities}  greedy next {best!r}")`,
    secondTrace: "Each position produces one score per vocabulary entry, and the softmax turns those into probabilities that sum to one. Greedy decoding takes the highest, which here alternates between the two tokens. Training compares these probabilities against the true next token, which is where cross-entropy enters.",
    mistake: "Do not take the logits from the last block without a final normalization. Production implementations normalize once more before the unembedding, and omitting it leaves the scores at whatever scale the last residual addition happened to produce.",
    checkpoint: "The model is 2 wide with a 2-token vocabulary. What shape is the logits output for a 3-token input?",
    checkpointAnswer: "Three by two, one row per input position and one score per vocabulary entry. Every position produces a prediction, which is what lets a single forward pass supply a training signal for every token in the sequence at once.",
    remember: "Look up embeddings, run blocks over the residual stream, normalize, and project to vocabulary size. Every position produces its own logits, which is why one pass trains on every token.",
    checks: [
      q("What shape are the logits for a sequence of n tokens?", ["One row per position, one column per vocabulary entry", "One row for the whole sequence", "One row per block"], 0, "Every position produces a prediction.", ["Correct. That is what makes training efficient.", "That would discard most of the signal.", "Blocks do not appear in the output shape."]),
      q("What does the unembedding projection do?", ["Maps the model width back to vocabulary size", "Normalizes the stream", "Applies the causal mask"], 0, "It produces one score per token.", ["Correct. It is often the embedding table reused.", "Normalization is a separate step.", "Masking happens inside attention."]),
      q("Why does the first position attend only to itself?", ["The causal mask blocks everything after it", "It has no embedding", "Its normalization differs"], 0, "There is nothing earlier to attend to.", ["Correct. Its output equals its own normalized vector.", "It is embedded like any other token.", "Normalization is identical everywhere."]),
    ],
  },
];

export const ML_TRANSFORMER_ATOMS = ML_TRANSFORMER_SPECS.map(guidedMasteryAtom);
export const ML_TRANSFORMER_CONCEPTS = ML_TRANSFORMER_SPECS.map(guidedMasteryConcept);
export const ML_TRANSFORMER_LESSON_CONTENT = guidedLessonContent(ML_TRANSFORMER_SPECS);

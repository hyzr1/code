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

const ML_ATTENTION_SPECS: GuidedMasterySpec[] = [
  {
    lessonId: "py.mc.m5_4.l1",
    atomId: "py.atom.ml.query-key-value",
    conceptId: "py.ml.query-key-value",
    title: "Query, key and value are three different jobs",
    requires: ["py.ml.encoder-decoder-attention"],
    vocabulary: [
      ["query", "what a position is looking for"],
      ["key", "what a position offers as a match target"],
      ["value", "what a position contributes once it is matched"],
      ["soft lookup", "retrieving a blend of entries rather than exactly one"],
    ],
    opening: "Attention is a dictionary lookup with the hard edges removed. A query is compared against every key, and instead of returning one value it returns a blend, weighted by how well each key matched.",
    outcome: "You will separate the three roles, explain why keys and values are different projections, and describe attention as a differentiable lookup.",
    why: "Every modern architecture is built from this one operation. Keeping the three roles distinct is what makes multi-head attention, cross-attention and masking readable rather than mysterious.",
    mentalModel: "Picture a library catalogue. Your request is the query, each book's index card is its key, and the book itself is the value. A soft lookup hands you a blend of the closest few books rather than refusing everything but an exact title match.",
    firstTitle: "A hard lookup, then a soft one",
    firstIntro: "The only difference is whether one entry wins outright or every entry contributes.",
    firstCode: `import math

catalogue = {"cat": 10.0, "car": 20.0, "cot": 30.0}

def hard_lookup(query):
    return catalogue.get(query, "no match")

def similarity(a, b):
    return sum(1.0 for x, y in zip(a, b) if x == y)

def soft_lookup(query, sharpness=2.0):
    keys = list(catalogue)
    scores = [sharpness * similarity(query, k) for k in keys]
    top = max(scores)
    raw = [math.exp(s - top) for s in scores]
    total = sum(raw)
    return sum(w / total * catalogue[k] for w, k in zip(raw, keys))

print("hard 'cat':", hard_lookup("cat"))
print("hard 'cap':", hard_lookup("cap"))
print("soft 'cat':", round(soft_lookup("cat"), 3))
print("soft 'cap':", round(soft_lookup("cap"), 3))`,
    firstTrace: "The hard lookup fails outright on a word that is not a key, and the soft one returns a blend leaning toward the closest matches. That blend is a smooth function of the query, so a gradient can flow through it. Making retrieval differentiable is the entire reason this construction exists.",
    secondTitle: "Keys and values are different projections",
    secondIntro: "What makes a position findable is not the same as what it contributes once found.",
    secondCode: `def project(vector, matrix):
    return [sum(v * row[j] for v, row in zip(vector, matrix))
            for j in range(len(matrix[0]))]

token = [1.0, 2.0]
w_query = [[1.0, 0.0], [0.0, 1.0]]
w_key = [[0.0, 1.0], [1.0, 0.0]]
w_value = [[2.0, 2.0], [0.0, 1.0]]

print("token:", token)
print("as a query:", project(token, w_query))
print("as a key:  ", project(token, w_key))
print("as a value:", project(token, w_value))`,
    secondTrace: "One token produces three different vectors, because it plays three different roles. Sharing one projection for keys and values would force what a position advertises to equal what it delivers. Keeping them separate is what lets a position be easy to find for one reason and useful for another.",
    mistake: "Do not describe attention as the model choosing the single best position. Every position contributes in proportion to its weight, and it is precisely that blending that makes the operation differentiable and therefore trainable.",
    checkpoint: "Why are keys and values produced by different projections rather than one?",
    checkpointAnswer: "Because what makes a position worth retrieving is a different question from what that position should contribute. Tying them would force every position's usefulness to equal its findability, which removes a degree of freedom the model needs.",
    remember: "A query asks, keys advertise, values deliver. Attention is a soft dictionary lookup, and its blending is what makes retrieval differentiable.",
    checks: [
      q("What role does the key play?", ["It is what a query is compared against", "It is what gets returned", "It is what the position is looking for"], 0, "Keys are match targets.", ["Correct. Values are what a match returns.", "That is the value's job.", "That is the query's job."]),
      q("Why is a soft lookup used rather than picking the best match?", ["Blending makes the operation differentiable", "It is faster", "It uses less memory"], 0, "A hard choice has no useful gradient.", ["Correct. Training depends on that smoothness.", "Blending costs more, not less.", "Memory is similar either way."]),
      q("Why not use one projection for both keys and values?", ["Findability and usefulness are different properties", "It would be slower", "The shapes would not match"], 0, "Tying them removes a degree of freedom.", ["Correct. A position can be easy to find for one reason and useful for another.", "The cost is comparable.", "Shapes can be made to match; the modelling loss is the issue."]),
    ],
  },
  {
    lessonId: "py.mc.m5_4.l2",
    atomId: "py.atom.ml.scaled-dot-product",
    conceptId: "py.ml.scaled-dot-product",
    title: "Scaled dot-product attention, one step at a time",
    requires: ["py.ml.query-key-value"],
    vocabulary: [
      ["dot-product score", "the raw compatibility between a query and a key"],
      ["scaling factor", "dividing by the square root of the key width"],
      ["saturated softmax", "a distribution so peaked that its gradients vanish"],
      ["weighted value sum", "the output, built from the values in proportion to their weights"],
    ],
    opening: "The full operation is five steps and one division that looks arbitrary until you check what happens without it. That division is the difference between a working layer and one whose gradients disappear.",
    outcome: "You will implement the five steps, and explain what the scaling factor prevents.",
    why: "This is the exact operation inside every transformer. The scaling factor is the detail most often forgotten and the one that most reliably breaks training when it is.",
    mentalModel: "Picture a vote where the loudest voice wins entirely. Scaling turns the volume down before counting, so the result reflects a genuine preference rather than whichever voice happened to shout.",
    firstTitle: "Five steps: score, scale, mask, normalize, blend",
    firstIntro: "Each step is a single line, and the order never changes.",
    firstCode: `import math

def attention(queries, keys, values):
    width = len(keys[0])
    scale = math.sqrt(width)
    out = []
    for query in queries:
        scores = [sum(q * k for q, k in zip(query, key)) / scale for key in keys]
        top = max(scores)
        raw = [math.exp(s - top) for s in scores]
        total = sum(raw)
        weights = [w / total for w in raw]
        out.append([round(sum(w * v[i] for w, v in zip(weights, values)), 4)
                    for i in range(len(values[0]))])
    return out

keys = [[1.0, 0.0], [0.0, 1.0]]
values = [[10.0], [20.0]]
for query in ([1.0, 0.0], [0.0, 1.0], [1.0, 1.0]):
    print(query, "->", attention([query], keys, values))`,
    firstTrace: "Each query produces one output row, built from the values rather than the keys. A query aligned with the first key leans toward the first value, and a balanced query returns the midpoint. The output width comes from the values, and it need not match the key width at all.",
    secondTitle: "What the scaling factor prevents",
    secondIntro: "Dot products grow with the width, and a softmax over large numbers collapses onto one position.",
    secondCode: `import math

def spread(width, scaled):
    scale = math.sqrt(width) if scaled else 1.0
    scores = [width * 1.0 / scale, width * 0.9 / scale]
    top = max(scores)
    raw = [math.exp(s - top) for s in scores]
    total = sum(raw)
    return [round(w / total, 6) for w in raw]

for width in (4, 64, 512):
    print(f"width {width:>4}: unscaled {spread(width, False)}  "
          f"scaled {spread(width, True)}")`,
    secondTrace: "Without scaling, a width of five hundred and twelve turns a ten per cent difference in alignment into a distribution that puts everything on one position. A saturated softmax has almost no gradient, so the layer stops learning which positions matter. Dividing by the square root of the width keeps the scores in a range where the distribution stays informative.",
    mistake: "Do not divide by the width itself instead of its square root. Dot products grow with the width while their spread grows with its square root, so dividing by the width over-corrects and flattens every distribution toward uniform.",
    checkpoint: "An implementation omits the scaling factor and the attention weights become nearly one-hot. What follows?",
    checkpointAnswer: "The gradients through the softmax nearly vanish, because a saturated distribution barely changes when its inputs do. The layer effectively stops learning which positions to attend to, and the symptom is a model that trains slowly and settles on a poor answer with no error anywhere.",
    remember: "Score, scale by the square root of the key width, mask, normalize, and blend the values. Skipping the scale saturates the softmax and kills its gradients.",
    checks: [
      q("What is the output width of an attention layer set by?", ["The value width", "The key width", "The query width"], 0, "The output is a blend of values.", ["Correct. Keys and values may differ in width.", "Keys only ever produce scores.", "The query width must match the key width."]),
      q("Why divide by the square root of the key width?", ["Dot products grow with width, which would saturate the softmax", "It normalizes the values", "It makes the weights sum to one"], 0, "A saturated softmax has almost no gradient.", ["Correct. The spread of a dot product grows with the square root.", "Values are untouched by the scale.", "The division by the total does that."]),
      q("What is the symptom of a saturated softmax?", ["Near-zero gradients, so the layer stops learning", "Weights that fail to sum to one", "An output of the wrong width"], 0, "A peaked distribution barely responds to its inputs.", ["Correct. Training slows with no visible error.", "Normalization still holds.", "Shapes are unaffected."]),
    ],
  },
  {
    lessonId: "py.mc.m5_4.l3",
    atomId: "py.atom.ml.multi-head-attention",
    conceptId: "py.ml.multi-head-attention",
    title: "Several heads learn several relationships",
    requires: ["py.ml.scaled-dot-product"],
    vocabulary: [
      ["head", "one independent attention computation over a slice of the width"],
      ["head dimension", "the width given to each head, usually the model width divided by the head count"],
      ["concatenation", "joining the heads' outputs back into one vector"],
      ["output projection", "a final matrix mixing the concatenated heads together"],
    ],
    opening: "One attention computation produces one distribution over positions, so it can express one relationship at a time. Splitting the width into several heads lets the model learn several at once, at no extra cost.",
    outcome: "You will split a width across heads, run them independently, and recombine them with a projection.",
    why: "Every transformer uses many heads, and the parameter count staying constant is the detail that makes the design look free. Understanding the split is also what makes attention-map visualizations readable.",
    mentalModel: "Picture several readers going through the same page, each looking for a different thing: one tracks who is speaking, another tracks what is being referred to. Their notes are combined at the end.",
    firstTitle: "Split the width, run in parallel, join again",
    firstIntro: "Each head sees a slice of the vector and attends independently within it.",
    firstCode: `import math

def head_weights(query, keys):
    width = len(keys[0])
    scale = math.sqrt(width)
    scores = [sum(q * k for q, k in zip(query, key)) / scale for key in keys]
    top = max(scores)
    raw = [math.exp(s - top) for s in scores]
    total = sum(raw)
    weights = [w / total for w in raw]
    return [round(w, 3) for w in weights]

def split(vector, heads):
    size = len(vector) // heads
    return [vector[h * size:(h + 1) * size] for h in range(heads)]

query = [3.0, 0.0, 0.0, 3.0]
keys = [[2.0, 0.0, 0.0, 0.0], [0.0, 2.0, 2.0, 0.0], [0.0, 0.0, 0.0, 2.0]]

for head, (q_part, k_parts) in enumerate(zip(split(query, 2),
                                             zip(*[split(k, 2) for k in keys]))):
    print(f"head {head}: weights {head_weights(q_part, list(k_parts))}")`,
    firstTrace: "The two heads see the same three positions and disagree about which one matters. The first half of the query aligns with position zero and the second half with position two, so each head finds a different relationship. Neither is more correct; they are answers to different questions.",
    secondTitle: "The parameter count does not change",
    secondIntro: "Heads divide an existing width rather than adding a new one.",
    secondCode: `def head_cost(model_width, heads):
    if model_width % heads:
        return None
    per_head = model_width // heads
    projections = 3 * model_width * model_width
    output = model_width * model_width
    return per_head, projections + output

for heads in (1, 2, 8, 16):
    result = head_cost(512, heads)
    print(f"{heads:>3} heads: width per head {result[0]:>4}, parameters {result[1]:,}")

print()
print("more heads means narrower heads, not more weights")`,
    secondTrace: "Every configuration uses the same number of parameters, because the heads partition a fixed width rather than each getting their own. Doubling the head count halves the width each one works in. That trade is real: too many heads leaves each one too narrow to represent anything useful.",
    mistake: "Do not add heads without checking that the model width divides evenly by the count. An uneven split either drops dimensions silently or raises an error deep inside a reshape, and the fix is always to choose a head count that divides the width.",
    checkpoint: "A model of width 512 moves from 8 heads to 32. What changes and what does not?",
    checkpointAnswer: "The width per head falls from sixty-four to sixteen, and the parameter count does not change at all. The model can now express more relationships at once, but each one is computed in a much narrower space, which eventually limits what any single head can represent.",
    remember: "Heads partition the model width rather than extending it, so the parameter count is unchanged. Each head learns its own relationship, and an output projection mixes them back together.",
    checks: [
      q("What happens to the parameter count when heads are doubled?", ["It stays the same", "It doubles", "It halves"], 0, "Heads partition an existing width.", ["Correct. Each head simply becomes narrower.", "No new projections are added.", "Nothing is removed either."]),
      q("What limits how many heads are useful?", ["Each head becomes too narrow to represent much", "Memory runs out", "The softmax saturates"], 0, "The width per head shrinks as the count grows.", ["Correct. There is a practical floor on head width.", "Memory is unchanged by the split.", "Scaling handles saturation."]),
      q("Why must the model width divide evenly by the head count?", ["An uneven split drops dimensions or fails in a reshape", "The softmax requires it", "Gradients would not flow"], 0, "Each head takes an equal slice.", ["Correct. Choose a head count that divides the width.", "The softmax is per head and unaffected.", "Gradients are fine when the shapes are."]),
    ],
  },
  {
    lessonId: "py.mc.m5_4.l4",
    atomId: "py.atom.ml.attention-masks",
    conceptId: "py.ml.attention-masks",
    title: "Masks decide what a position is allowed to see",
    requires: ["py.ml.multi-head-attention"],
    vocabulary: [
      ["padding mask", "a mask hiding positions that only exist to make lengths equal"],
      ["causal mask", "a mask hiding every position later than the current one"],
      ["negative infinity", "the score used to make a masked position's weight exactly zero"],
      ["information leak", "a position seeing something it must not, such as its own answer"],
    ],
    opening: "Attention lets every position see every other one, which is exactly what you want until it is not. Two situations require restricting it, and both are handled by the same mechanism applied at the same point.",
    outcome: "You will apply padding and causal masks by setting scores to negative infinity, and explain why masking before the softmax is the only correct point.",
    why: "A missing causal mask lets a language model read the answer it is being asked to predict, which produces an almost perfect training loss and a useless model. It is the most expensive bug in the field.",
    mentalModel: "Picture an exam where some desks are empty and nobody may look forward. Masking is the invigilator's rule, applied before anybody starts writing rather than by crossing out afterwards.",
    firstTitle: "Two masks, one mechanism",
    firstIntro: "Setting a score to negative infinity makes its weight exactly zero after the softmax.",
    firstCode: `import math

def masked_weights(scores, allowed):
    adjusted = [s if ok else -math.inf for s, ok in zip(scores, allowed)]
    top = max(adjusted)
    raw = [0.0 if s == -math.inf else math.exp(s - top) for s in adjusted]
    total = sum(raw)
    return [round(w / total, 4) for w in raw]

scores = [1.0, 2.0, 3.0, 0.5]

print("no mask:      ", masked_weights(scores, [True] * 4))
print("padding mask: ", masked_weights(scores, [True, True, False, False]))
print("causal at 1:  ", masked_weights(scores, [True, True, False, False]))`,
    firstTrace: "Masked positions receive a weight of exactly zero, and the surviving weights still sum to one because the normalization happens afterwards. The two mask types differ only in which positions they block. Padding hides positions that carry no real data, and the causal mask hides everything the model is not yet allowed to have read.",
    secondTitle: "A causal mask is a triangle",
    secondIntro: "Position i may attend to every position up to and including i, and nothing after it.",
    secondCode: `def causal_mask(length):
    return [[j <= i for j in range(length)] for i in range(length)]

for row_index, row in enumerate(causal_mask(5)):
    marks = "".join("o" if allowed else "." for allowed in row)
    print(f"position {row_index}: {marks}")

print()
print("o means allowed, . means blocked")
print("row 0 sees only itself; the last row sees everything")`,
    secondTrace: "The pattern is lower-triangular, including the diagonal so a position can attend to itself. Without it, position zero could read position four, which during training is the token it is being asked to predict. The result is a loss that collapses toward zero and a model that generates nothing coherent.",
    mistake: "Do not apply the mask after the softmax by zeroing weights. The remaining weights then no longer sum to one, so the output is scaled down by however much was removed, and the effect varies by position.",
    checkpoint: "A language model trains to an unusually low loss and produces nonsense when generating. What would you check first?",
    checkpointAnswer: "The causal mask. If positions can attend forward, each one sees the token it is being asked to predict, so training loss collapses while the model learns nothing about actually predicting. At generation time the future is not available, and the behaviour falls apart.",
    remember: "Set masked scores to negative infinity before the softmax, never zero the weights after it. Padding hides absent positions and a causal mask hides the future.",
    checks: [
      q("Why must masking happen before the softmax?", ["Zeroing afterwards leaves the weights no longer summing to one", "The softmax is faster that way", "Negative infinity is invalid afterwards"], 0, "Normalization must account for the removal.", ["Correct. Otherwise the output is scaled down unevenly.", "Cost is essentially identical.", "The ordering matters for correctness, not validity."]),
      q("What does a causal mask allow position 3 to see?", ["Positions 0 through 3", "Positions 0 through 2", "Every position"], 0, "A position may attend to itself.", ["Correct. The diagonal is included.", "That would block a position from itself.", "That is the unmasked case."]),
      q("Training loss is suspiciously low and generation is nonsense. What is the likely cause?", ["A missing causal mask, so each position reads its own answer", "The learning rate is too low", "Too many heads"], 0, "Leakage produces exactly this pattern.", ["Correct. It is the most expensive bug in the field.", "A low rate slows training rather than flattering it.", "Head count would not collapse the loss."]),
    ],
  },
  {
    lessonId: "py.mc.m5_4.l5",
    atomId: "py.atom.ml.attention-scaling",
    conceptId: "py.ml.attention-scaling",
    title: "Why attention scaled and recurrence did not",
    requires: ["py.ml.attention-masks"],
    vocabulary: [
      ["path length", "how many operations separate two positions in the computation"],
      ["parallelism", "how much of the work can be done at the same time"],
      ["quadratic cost", "work that grows with the square of the sequence length"],
      ["sequential dependency", "a step that cannot start until the one before it finishes"],
    ],
    opening: "Attention did not replace recurrence because it was more expressive. On raw cost it is worse. It won on two properties that matter more once you have enough hardware: every position is one step from every other, and nothing has to wait.",
    outcome: "You will compare path length, parallelism and cost between the two, and explain which of those decided the outcome.",
    why: "This trade explains the entire shape of modern models, including why context length is expensive and why so much research targets that one quadratic term.",
    mentalModel: "Picture passing a message down a line of people versus putting everyone in one room. The line is cheap and slow, and the room costs every pair a conversation but finishes in one round.",
    firstTitle: "Three quantities, two architectures",
    firstIntro: "Cost, path length and sequential steps behave very differently between them.",
    firstCode: `def compare(length, width):
    recurrent = {
        "operations": length * width * width,
        "path": length,
        "sequential_steps": length,
    }
    attention = {
        "operations": length * length * width,
        "path": 1,
        "sequential_steps": 1,
    }
    return recurrent, attention

for length in (64, 1024, 8192):
    rec, att = compare(length, 512)
    print(f"length {length:>5}: recurrent ops {rec['operations']:>15,}  "
          f"attention ops {att['operations']:>15,}")
    print(f"{'':>13} path {rec['path']:>5} vs {att['path']}, "
          f"sequential {rec['sequential_steps']:>5} vs {att['sequential_steps']}")`,
    firstTrace: "Attention costs more operations once the sequence is longer than the model width, and it always costs more sequentially, which is to say none at all. Two positions are one step apart however far they sit, where recurrence needs one step per position between them. That gap is what lets gradients survive across thousands of tokens.",
    secondTitle: "The quadratic term is the price",
    secondIntro: "Doubling the context quadruples the attention work, which nothing about parallelism removes.",
    secondCode: `def attention_cost(length, width=512):
    return length * length * width

base = attention_cost(1024)
for length in (1024, 2048, 8192, 32768):
    cost = attention_cost(length)
    print(f"length {length:>6}: {cost / base:>10.1f} times the cost of 1024")

print()
print("this single term is what most long-context research attacks")`,
    secondTrace: "Going from a thousand tokens to thirty-two thousand costs a thousand times as much attention work, not thirty-two. Parallelism hides the latency and does nothing about the total. Sparse patterns, sliding windows and low-rank approximations are all attempts to break that square.",
    mistake: "Do not describe attention as simply cheaper than recurrence. It is more expensive in raw operations at any realistic length, and it won because the work is parallel and the path between positions is constant.",
    checkpoint: "Attention costs more operations than recurrence. Why did it win anyway?",
    checkpointAnswer: "Because its work is parallel and its path length between any two positions is one. Recurrence forces one sequential step per position, which no amount of hardware removes, and it makes distant positions many multiplications apart. Attention trades more total work for work that can be done at once.",
    remember: "Attention costs more operations and grows with the square of the length. It won on constant path length and full parallelism, which is what hardware could actually exploit.",
    checks: [
      q("What is the path length between two positions in attention?", ["One, regardless of the distance", "The distance between them", "The number of layers"], 0, "Every position attends to every other directly.", ["Correct. That is what preserves long-range gradients.", "That describes recurrence.", "Depth adds layers, not distance."]),
      q("Doubling the context length multiplies attention work by what?", ["Four", "Two", "Eight"], 0, "The cost grows with the square.", ["Correct. That term is what long-context research targets.", "Linear growth would be the recurrent case.", "The exponent is two, not three."]),
      q("Which property decided the outcome against recurrence?", ["Parallelism and constant path length", "Fewer operations", "Fewer parameters"], 0, "Raw operation count favours recurrence.", ["Correct. Hardware could exploit exactly those two.", "Attention uses more operations at realistic lengths.", "Parameter counts are comparable."]),
    ],
  },
];

export const ML_ATTENTION_ATOMS = ML_ATTENTION_SPECS.map(guidedMasteryAtom);
export const ML_ATTENTION_CONCEPTS = ML_ATTENTION_SPECS.map(guidedMasteryConcept);
export const ML_ATTENTION_LESSON_CONTENT = guidedLessonContent(ML_ATTENTION_SPECS);

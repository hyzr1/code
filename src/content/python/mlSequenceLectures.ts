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

const ML_SEQUENCE_SPECS: GuidedMasterySpec[] = [
  {
    lessonId: "py.mc.m5_3.l1",
    atomId: "py.atom.ml.recurrent-networks",
    conceptId: "py.ml.recurrent-networks",
    title: "Recurrent networks carry a state forward",
    requires: ["py.ml.vision-augmentation"],
    vocabulary: [
      ["hidden state", "a vector summarizing everything the network has read so far"],
      ["time step", "one position in the sequence, processed in order"],
      ["shared weights", "the same parameters applied at every step"],
      ["unrolling", "writing the loop out as a deep network, one layer per step"],
    ],
    opening: "A convolution shares weights across positions in space. A recurrent network shares them across positions in time, and adds one thing a convolution has no equivalent of: a state that survives from one step to the next.",
    outcome: "You will run a recurrent cell over a sequence by hand, and explain why unrolling turns sequence length into effective depth.",
    why: "The vanishing-gradient problem in recurrent networks is what motivated gates, attention and eventually transformers. That whole line of architectures only makes sense once you have seen the failure it fixes.",
    mentalModel: "Picture reading a sentence while keeping a single running note. Each word updates the note, the note is all you carry forward, and by the end of a long paragraph the opening words have been overwritten many times.",
    firstTitle: "One cell, applied at every step",
    firstIntro: "The same weights process each element, with the previous state joining the current input.",
    firstCode: `import math

def cell(x, h, w_x, w_h, bias):
    return math.tanh(w_x * x + w_h * h + bias)

def run(sequence, w_x=0.8, w_h=0.6, bias=0.0):
    h = 0.0
    states = []
    for x in sequence:
        h = cell(x, h, w_x, w_h, bias)
        states.append(round(h, 4))
    return states

print("rising:  ", run([1.0, 1.0, 1.0, 1.0]))
print("one spike:", run([1.0, 0.0, 0.0, 0.0]))
print("late spike:", run([0.0, 0.0, 0.0, 1.0]))`,
    firstTrace: "A steady input drives the state toward a fixed point, since the activation saturates. A single early spike decays step by step, which is the network forgetting. The parameters are identical at every step, so the sequence length changes the computation without changing the model size.",
    secondTitle: "Unrolling turns length into depth",
    secondIntro: "The gradient reaching step one is a product with one factor per step in between.",
    secondCode: `for factor in (0.5, 0.9, 1.0, 1.1):
    for length in (10, 50, 100):
        reach = factor ** length
        state = "gone" if reach < 1e-6 else "huge" if reach > 1e6 else "usable"
        print(f"factor {factor:<4} length {length:>4}: {reach:>11.3e}  {state}")
    print()`,
    secondTrace: "A recurrent weight below one leaves nothing after fifty steps, and one slightly above it explodes just as fast. A sequence of a hundred elements is a hundred-layer network as far as the gradient is concerned. That is why plain recurrent networks cannot learn dependencies more than a few dozen steps apart.",
    mistake: "Do not treat sequence length as free because the parameter count does not grow. Every extra step is another factor in the gradient product and another step of forgetting in the state, so length costs stability even when it costs no memory.",
    checkpoint: "A recurrent network fails to connect a word at position five to one at position ninety. Why?",
    checkpointAnswer: "The gradient linking them passes through eighty-five multiplications by the recurrent weight, so it has either vanished or exploded long before it arrives. The single hidden state has also been overwritten many times, so the early information is unlikely to have survived the forward pass either.",
    remember: "One cell, the same weights at every step, and a state carried forward. Sequence length becomes effective depth, which is what makes long dependencies fail.",
    checks: [
      q("What do the weights of a recurrent cell do across time steps?", ["They stay the same at every step", "They grow with the sequence", "They are learned per position"], 0, "Sharing across time is the defining property.", ["Correct. Model size does not depend on sequence length.", "Parameter count is fixed.", "Per-position weights would be a dense layer."]),
      q("Why does a long sequence behave like a deep network?", ["The gradient passes through one factor per step", "The state grows with length", "More parameters are used"], 0, "Unrolling makes each step a layer.", ["Correct. A hundred steps is a hundred-layer product.", "The state has a fixed size.", "The parameters are shared."]),
      q("A recurrent weight slightly above one is used over 100 steps. What happens?", ["The gradient explodes", "The gradient vanishes", "Nothing changes"], 0, "Any factor above one compounds.", ["Correct. Clipping is the usual defence.", "Vanishing needs a factor below one.", "Depth makes small deviations enormous."]),
    ],
  },
  {
    lessonId: "py.mc.m5_3.l2",
    atomId: "py.atom.ml.gated-units",
    conceptId: "py.ml.gated-units",
    title: "Gates let a network choose what to keep",
    requires: ["py.ml.recurrent-networks"],
    vocabulary: [
      ["gate", "a value between zero and one controlling how much of something passes"],
      ["cell state", "a separate memory path that the gates edit rather than replace"],
      ["forget gate", "the gate deciding how much stored memory survives a step"],
      ["additive path", "a route where memory is added to rather than multiplied through"],
    ],
    opening: "The plain recurrent cell rewrites its entire state at every step, which is why it forgets. Gates change that from a rewrite to an edit, and the difference is what made sequence models work at all.",
    outcome: "You will run a gated cell, watch a value survive many steps, and explain why the additive path preserves gradients.",
    why: "Long short-term memory and its simpler cousin dominated sequence modelling for two decades, and the gating idea reappears in residual connections and in the gates inside modern architectures.",
    mentalModel: "Picture a notebook rather than a single sticky note. Each step decides what to cross out, what to add, and what to read aloud, and anything not crossed out survives untouched.",
    firstTitle: "Three decisions instead of one rewrite",
    firstIntro: "Forget, add, and expose are separate choices, each controlled by its own gate.",
    firstCode: `import math

def sigmoid(z):
    return 1 / (1 + math.exp(-z))

def gated_step(x, cell, forget_bias, input_bias):
    forget = sigmoid(forget_bias)
    keep = sigmoid(input_bias)
    cell = forget * cell + keep * math.tanh(x)
    return cell

memory = 1.0
print("strong forget gate (bias -3):")
value = memory
for step in range(1, 6):
    value = gated_step(0.0, value, -3.0, -10.0)
    print(f"  step {step}: {value:.6f}")

print("open forget gate (bias +3):")
value = memory
for step in range(1, 6):
    value = gated_step(0.0, value, 3.0, -10.0)
    print(f"  step {step}: {value:.6f}")`,
    firstTrace: "With the forget gate nearly closed the stored value collapses within a few steps. With it nearly open the same value is still four fifths of its size after five steps, because the update multiplies by a number close to one. The network learns which of those two behaviours it wants, per feature and per step.",
    secondTitle: "The additive path is what saves the gradient",
    secondIntro: "Memory is edited by addition rather than replaced by a transformation.",
    secondCode: `def plain_chain(steps, weight):
    value = 1.0
    for _ in range(steps):
        value *= weight
    return value

def gated_chain(steps, forget):
    value = 1.0
    for _ in range(steps):
        value = forget * value
    return value

for steps in (10, 50, 100):
    print(f"steps {steps:>4}: plain (0.6) {plain_chain(steps, 0.6):.3e}"
          f"  gated (0.99) {gated_chain(steps, 0.99):.3e}")`,
    secondTrace: "A plain recurrent factor of six tenths leaves nothing after fifty steps. A forget gate the network has learned to hold near one leaves most of the signal after a hundred. Nothing about the arithmetic changed; what changed is that the multiplier is now something the network controls rather than a fixed weight.",
    mistake: "Do not initialize the forget gate's bias at zero. That starts every gate half closed, so memory halves at every step before training has any chance to fix it, and a positive initial bias is the standard remedy.",
    checkpoint: "What does a forget gate held near one do to the gradient along the memory path?",
    checkpointAnswer: "It preserves it, because the gradient is multiplied by the gate value at each step and a product of numbers near one stays near one. That is the same reason a residual connection helps in a deep network, arrived at from a different direction.",
    remember: "Gates turn a state rewrite into an edit. A forget gate near one preserves both the value and the gradient, which is what makes long dependencies learnable.",
    checks: [
      q("What does the forget gate control?", ["How much of the previous memory survives", "How much of the input is read", "What the network outputs"], 0, "It multiplies the stored state.", ["Correct. Near one preserves it, near zero erases it.", "That is the input gate.", "That is the output gate."]),
      q("Why does the additive memory path preserve gradients?", ["The gradient is multiplied by gate values near one", "It has fewer parameters", "It skips the activation"], 0, "A product of numbers near one stays near one.", ["Correct. This mirrors a residual connection.", "Gates add parameters.", "Activations are still applied elsewhere."]),
      q("Why is the forget-gate bias initialized positive?", ["A zero bias starts the gate half closed and halves memory each step", "It speeds up training", "It prevents overflow"], 0, "The sigmoid of zero is one half.", ["Correct. A positive bias starts the gate mostly open.", "The effect is on memory, not speed.", "No overflow is involved."]),
    ],
  },
  {
    lessonId: "py.mc.m5_3.l3",
    atomId: "py.atom.ml.seq2seq",
    conceptId: "py.ml.seq2seq",
    title: "Encoder and decoder, joined by one vector",
    requires: ["py.ml.gated-units"],
    vocabulary: [
      ["encoder", "the half that reads the input and produces a summary"],
      ["decoder", "the half that produces the output one element at a time"],
      ["context vector", "the fixed-size summary passed from encoder to decoder"],
      ["teacher forcing", "feeding the true previous output during training rather than the predicted one"],
    ],
    opening: "Translation, summarization and speech transcription share one shape: a variable-length input becomes a variable-length output, with no alignment between them. Splitting the model into a reader and a writer is what makes that possible.",
    outcome: "You will separate the two halves, identify what the context vector has to carry, and explain what teacher forcing changes.",
    why: "This architecture is the direct ancestor of every modern sequence model, and its one weakness is exactly what attention was invented to fix. The bottleneck argument is the whole motivation.",
    mentalModel: "Picture an interpreter who listens to an entire speech, writes one summary card, and then leaves the room before speaking from that card alone. Everything not on the card is gone.",
    firstTitle: "Read everything, then write everything",
    firstIntro: "The encoder's final state is the only thing the decoder ever sees of the input.",
    firstCode: `def encode(tokens, width=4):
    state = [0.0] * width
    for position, token in enumerate(tokens):
        for i in range(width):
            state[i] = 0.7 * state[i] + 0.3 * ((token * (i + 1) + position) % 5)
    return [round(v, 3) for v in state]

short = ["1", "2"]
long = [str(n) for n in range(1, 31)]
print("input of 2 tokens ->", encode([len(t) for t in short]))
print("input of 30 tokens ->", encode([len(t) for t in long]))
print("both summaries have exactly 4 numbers")`,
    firstTrace: "Two very different inputs produce summaries of identical size, which is the point and also the problem. A four-number vector describing a thirty-element sequence has to discard almost everything. The decoder then has no way to consult the input again, whatever it turns out to need.",
    secondTitle: "Teacher forcing changes what the decoder practises",
    secondIntro: "Feeding the true previous token speeds up training and creates a mismatch at inference time.",
    secondCode: `def decode(context, steps, forced=None):
    produced = []
    previous = "<start>"
    for step in range(steps):
        guess = f"tok{(context + step) % 3}"
        produced.append(guess)
        previous = forced[step] if forced else guess
    return produced, previous

with_forcing, last_forced = decode(1, 3, forced=["a", "b", "c"])
without, last_free = decode(1, 3)
print("outputs are the same:", with_forcing == without)
print("what the next step sees, forced: ", last_forced)
print("what the next step sees, free:   ", last_free)`,
    secondTrace: "During training the decoder is handed the correct previous token, so a single mistake does not derail the rest of the sequence. At inference it is handed its own output instead, so an early error is fed back in and compounds. That gap between the two conditions is the standard weakness of the design.",
    mistake: "Do not evaluate a decoder while teacher forcing is still switched on. It measures a model that never has to recover from its own mistakes, which is not the situation it will face, and the reported quality can be far better than free generation achieves.",
    checkpoint: "Why does a longer input hurt this architecture more than a longer output?",
    checkpointAnswer: "Because the entire input has to fit through one fixed-size context vector, whatever its length, while the output is produced one element at a time with a state that is updated as it goes. Input length increases what must be compressed; output length does not.",
    remember: "The encoder compresses the input to one fixed vector and the decoder writes from it alone. Teacher forcing trains on the true previous token, which inference cannot provide.",
    checks: [
      q("What is the bottleneck in this design?", ["The whole input must fit in one fixed-size vector", "The decoder is too small", "Training is too slow"], 0, "Input length does not change the summary size.", ["Correct. Attention was invented to remove exactly this.", "Decoder capacity is a separate concern.", "Speed is not the structural weakness."]),
      q("What does teacher forcing feed the decoder during training?", ["The true previous token rather than its own guess", "The encoder state at every step", "A random token"], 0, "It prevents one mistake derailing the sequence.", ["Correct. Inference cannot do the same.", "The context is passed once at the start.", "Randomness would not help training."]),
      q("Why can teacher forcing flatter a model?", ["It never has to recover from its own mistakes", "It uses more data", "It trains for longer"], 0, "Inference conditions are different.", ["Correct. Free generation can be far worse.", "The data is the same.", "Duration is unchanged."]),
    ],
  },
  {
    lessonId: "py.mc.m5_3.l4",
    atomId: "py.atom.ml.encoder-decoder-attention",
    conceptId: "py.ml.encoder-decoder-attention",
    title: "Attention lets each output look back",
    requires: ["py.ml.seq2seq"],
    vocabulary: [
      ["attention weight", "how much one output position draws on one input position"],
      ["alignment score", "the raw compatibility between an output query and an input position"],
      ["softmax", "turning scores into weights that are positive and sum to one"],
      ["weighted sum", "combining input representations in proportion to their weights"],
    ],
    opening: "The fixed context vector fails because it has to decide, in advance, what the decoder will need. Attention removes the decision entirely: keep every input representation, and let each output step choose what to read.",
    outcome: "You will compute alignment scores, turn them into weights, and produce a context vector that differs at every output step.",
    why: "This mechanism is the direct ancestor of the transformer, and the query, key and value vocabulary starts here. Understanding it as a soft lookup is what makes the later architectures readable.",
    mentalModel: "Picture the interpreter keeping the full transcript rather than one card, and glancing back at whichever line is relevant to the sentence being spoken. Nothing has to be decided in advance.",
    firstTitle: "Score, normalize, combine",
    firstIntro: "Three steps turn a query and a set of positions into one context vector.",
    firstCode: `import math

def attend(query, keys, values):
    scores = [sum(q * k for q, k in zip(query, key)) for key in keys]
    top = max(scores)
    weights = [math.exp(s - top) for s in scores]
    total = sum(weights)
    weights = [w / total for w in weights]
    context = [sum(w * v[i] for w, v in zip(weights, values))
               for i in range(len(values[0]))]
    return [round(w, 4) for w in weights], [round(c, 4) for c in context]

keys = [[2.0, 0.0], [0.0, 2.0], [1.5, 1.5]]
values = [[10.0], [20.0], [30.0]]

for query in ([1.0, 0.0], [0.0, 1.0], [1.0, 1.0]):
    weights, context = attend(query, keys, values)
    print(f"query {query}: weights {weights} context {context}")`,
    firstTrace: "Each query pulls hardest on the position it agrees with most, and the weights always sum to one. The resulting context is a blend of the values, dominated by whichever positions scored highest. Nothing here is learned yet; the scoring is just a dot product.",
    secondTitle: "Every output step gets its own context",
    secondIntro: "The decoder queries the same stored inputs afresh at each step.",
    secondCode: `import math

def attend(query, keys, values):
    scores = [sum(q * k for q, k in zip(query, key)) for key in keys]
    top = max(scores)
    weights = [math.exp(s - top) for s in scores]
    total = sum(weights)
    return [round(w / total, 3) for w in weights]

keys = [[2.0, 0.0], [0.0, 2.0], [1.5, 1.5]]
queries = [[3.0, 0.0], [0.0, 3.0], [1.0, 1.0]]

print("input positions:  0        1        2")
for step, query in enumerate(queries):
    print(f"output step {step}: {attend(query, keys, [[0.0]] * 3)}")

print()
print("the input representations are stored once and read many times")`,
    secondTrace: "Three output steps produce three different weight distributions over the same three inputs. The first two each put most of their weight on one position, and the third favours the input that sits between them. Nothing is compressed away in advance, which is exactly what the fixed context vector could not avoid.",
    mistake: "Do not subtract nothing before exponentiating the scores. Large scores overflow immediately, and subtracting the maximum first leaves the weights unchanged while keeping every exponential inside a safe range.",
    checkpoint: "How does attention remove the fixed-context bottleneck?",
    checkpointAnswer: "By keeping one representation per input position instead of one for the whole input, and letting each output step build its own weighted combination of them. Nothing has to be discarded in advance, so the amount of information available grows with the input rather than staying fixed.",
    remember: "Score a query against every position, normalize the scores into weights that sum to one, and take the weighted sum of the values. Each output step queries afresh.",
    checks: [
      q("What do attention weights sum to?", ["One, across the input positions", "The number of positions", "The largest score"], 0, "The softmax normalizes them.", ["Correct. They form a distribution over positions.", "That would be an unnormalized sum.", "The maximum is subtracted, not used as a total."]),
      q("How does attention avoid the fixed-context bottleneck?", ["It keeps one representation per input position", "It uses a larger context vector", "It compresses the input better"], 0, "Nothing is discarded in advance.", ["Correct. Available information grows with the input.", "A larger fixed vector is still fixed.", "It avoids compressing rather than compressing well."]),
      q("Why subtract the maximum score before exponentiating?", ["To keep the exponentials from overflowing", "To make the weights sum to one", "To rank the positions"], 0, "The weights are unchanged by the shift.", ["Correct. It is a pure numerical-stability step.", "The division by the total does that.", "Ranking is unaffected."]),
    ],
  },
];

export const ML_SEQUENCE_ATOMS = ML_SEQUENCE_SPECS.map(guidedMasteryAtom);
export const ML_SEQUENCE_CONCEPTS = ML_SEQUENCE_SPECS.map(guidedMasteryConcept);
export const ML_SEQUENCE_LESSON_CONTENT = guidedLessonContent(ML_SEQUENCE_SPECS);

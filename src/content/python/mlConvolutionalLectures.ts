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

const ML_CONVOLUTIONAL_SPECS: GuidedMasterySpec[] = [
  {
    lessonId: "py.mc.m5_1.l1",
    atomId: "py.atom.ml.convolutions",
    conceptId: "py.ml.convolutions",
    title: "Convolution is weight sharing across positions",
    requires: ["py.ml.debugging-training"],
    vocabulary: [
      ["filter", "a small set of weights applied at every position of the input"],
      ["weight sharing", "using the same weights at every position rather than one set per position"],
      ["stride", "how far the filter moves between applications"],
      ["padding", "extra border values added so the filter can reach the edges"],
    ],
    opening: "A dense layer gives every input position its own weights, which means a pattern learned in one corner is unknown everywhere else. A convolution shares one small set of weights across all positions, and that single change is what made computer vision work.",
    outcome: "You will apply a filter with a chosen stride and padding, and compute the output size before running anything.",
    why: "Shape errors are the most common failure in vision code, and the output-size formula answers them in one line. Weight sharing is also the reason a convolutional layer has orders of magnitude fewer parameters than a dense one.",
    mentalModel: "Picture a small stencil slid across a page. The same stencil is used everywhere, so whatever it detects it detects in every location, and it takes only as many numbers to describe as the stencil has holes.",
    firstTitle: "One filter, applied everywhere",
    firstIntro: "The same weights are reused at each position, which is the whole idea in one loop.",
    firstCode: `def convolve(signal, filt, stride=1, pad=0):
    padded = [0.0] * pad + list(signal) + [0.0] * pad
    size = len(filt)
    out = []
    start = 0
    while start + size <= len(padded):
        out.append(sum(padded[start + k] * filt[k] for k in range(size)))
        start += stride
    return out

edge = [-1.0, 0.0, 1.0]
signal = [0.0, 0.0, 5.0, 5.0, 5.0, 0.0, 0.0]
print("stride 1:", convolve(signal, edge))
print("stride 2:", convolve(signal, edge, stride=2))
print("padded:  ", convolve(signal, edge, pad=1))`,
    firstTrace: "The filter reports zero wherever the signal is flat on both sides, positive where it rises and negative where it falls. Three numbers describe a detector that works at every position, which a dense layer would need one copy of per position. Stride two skips alternate placements and halves the output length.",
    secondTitle: "The output size follows from four numbers",
    secondIntro: "Input size, filter size, stride and padding determine the output exactly.",
    secondCode: `def output_size(size, filt, stride=1, pad=0):
    return (size + 2 * pad - filt) // stride + 1

cases = [(32, 3, 1, 0), (32, 3, 1, 1), (32, 3, 2, 1), (224, 7, 2, 3), (28, 5, 1, 0)]
for size, filt, stride, pad in cases:
    print(f"in {size:>4} filter {filt} stride {stride} pad {pad} -> {output_size(size, filt, stride, pad)}")

print("a filter of size f with pad f // 2 and stride 1 preserves the size")`,
    secondTrace: "A filter of three with padding one and stride one leaves the size unchanged, which is why that combination appears in nearly every architecture. Stride two roughly halves it, and no padding shrinks it by the filter size minus one. The parameter count depends only on the filter, never on the input size.",
    mistake: "Do not treat padding as a way to add information. It adds zeros, which the filter reads as genuine values, so heavy padding on a small input means most of what the layer sees is border rather than data.",
    checkpoint: "A 32 by 32 input meets a 3 by 3 filter with stride 1 and padding 1, then the same again. What size comes out?",
    checkpointAnswer: "Thirty-two by thirty-two, both times. That combination is size-preserving, which is exactly why architectures stack many of them and then reduce the size deliberately with a strided layer or a pooling step.",
    remember: "One filter's weights are shared across every position, so the parameter count depends on the filter rather than the input. Output size is input plus twice the padding, minus the filter, over the stride, plus one.",
    checks: [
      q("What does weight sharing buy?", ["A pattern learned once is detected at every position", "Faster convergence of the loss", "Smaller activations"], 0, "The same weights apply everywhere.", ["Correct. It also cuts the parameter count enormously.", "Convergence speed is a separate matter.", "Activation size is set by the output shape."]),
      q("A 3 by 3 filter with stride 1 and padding 1 does what to the size?", ["Leaves it unchanged", "Halves it", "Reduces it by two"], 0, "The padding exactly compensates for the filter.", ["Correct. That is why the combination is everywhere.", "Halving needs a stride of two.", "That is the unpadded result."]),
      q("What does a convolutional layer's parameter count depend on?", ["The filter size and the channel counts", "The input width and height", "The batch size"], 0, "The same weights are reused at every position.", ["Correct. Input size does not enter it at all.", "That affects the output size, not the weights.", "Batch size never affects parameters."]),
    ],
  },
  {
    lessonId: "py.mc.m5_1.l2",
    atomId: "py.atom.ml.pooling-hierarchies",
    conceptId: "py.ml.pooling-hierarchies",
    title: "Pooling trades resolution for reach",
    requires: ["py.ml.convolutions"],
    vocabulary: [
      ["pooling", "reducing a region to one value, usually its maximum or its mean"],
      ["receptive field", "the region of the original input one output position can see"],
      ["translation invariance", "answering the same way when the input shifts slightly"],
      ["feature hierarchy", "deeper layers combining simple features into larger structures"],
    ],
    opening: "A filter of three sees three positions, and no amount of training changes that. Reach has to be built by stacking, and every reduction in resolution multiplies how far a single output position can see.",
    outcome: "You will compute a receptive field across stacked layers, and explain what pooling gives up in exchange for it.",
    why: "Whether a network can see an object at all is a question about receptive field, and it is answerable with arithmetic before training. It also explains why architectures reduce resolution rather than simply using larger filters.",
    mentalModel: "Think of looking at a photograph from further away. Detail disappears, but more of the picture fits in view, and shapes that were too large to take in become visible as wholes.",
    firstTitle: "Reach grows with depth, and faster with stride",
    firstIntro: "Each layer widens the receptive field by its filter size, scaled by everything that came before.",
    firstCode: `def receptive_field(layers):
    field = 1
    jump = 1
    for filt, stride in layers:
        field += (filt - 1) * jump
        jump *= stride
    return field, jump

stacked = [(3, 1)] * 5
print("five 3x3, stride 1:", receptive_field(stacked))

with_pooling = [(3, 1), (2, 2), (3, 1), (2, 2), (3, 1)]
print("same depth with pooling:", receptive_field(with_pooling))`,
    firstTrace: "Five stacked filters of three reach eleven positions, growing by two each time. Inserting two halving steps reaches eighteen from the same depth, because every later filter now covers four original positions per step. Stride is what makes reach grow multiplicatively rather than additively.",
    secondTitle: "What pooling gives up",
    secondIntro: "Taking the maximum of a region answers the same way whether the peak sits at one end or the other.",
    secondCode: `def max_pool(values, size=2, stride=2):
    out = []
    start = 0
    while start + size <= len(values):
        out.append(max(values[start:start + size]))
        start += stride
    return out

original = [1.0, 8.0, 2.0, 3.0, 0.0, 9.0]
shifted = [8.0, 1.0, 3.0, 2.0, 9.0, 0.0]
print("original:", max_pool(original))
print("shifted: ", max_pool(shifted))
print("mean pooling would report the same average either way")`,
    secondTrace: "Both inputs pool to the same three values, even though every pair was reordered. That is the invariance being bought, and the exact position inside each pair is the price. For classification that trade is usually worth taking, and for tasks needing precise location it is not.",
    mistake: "Do not pool aggressively in a task that must report where something is. Segmentation and detection need the spatial detail that pooling discards, which is why those architectures either skip it or restore the resolution later with upsampling and skip connections.",
    checkpoint: "A network stacks ten filters of three with stride one and no pooling. Can one output see a 40-pixel object?",
    checkpointAnswer: "No, it cannot. Each layer adds two to the receptive field, so ten of them reach only twenty-one positions. An object of forty never fits inside one output's view, and reaching it needs strided layers, pooling, or considerably more depth.",
    remember: "Receptive field grows by the filter size at each layer, multiplied by every stride before it. Pooling buys reach and small-shift invariance by discarding exact position.",
    checks: [
      q("Why does stride grow the receptive field faster than depth alone?", ["Every later filter covers more original positions per step", "It adds more parameters", "It applies the filter twice"], 0, "The jump multiplies rather than adds.", ["Correct. Reach grows multiplicatively with stride.", "Stride adds no parameters at all.", "The filter is applied fewer times, not more."]),
      q("What does max pooling discard?", ["The exact position inside each region", "The magnitude of the peak", "The number of channels"], 0, "Only the largest value survives.", ["Correct. That is what buys the shift invariance.", "The peak value is exactly what is kept.", "Pooling acts within a channel."]),
      q("Which task suffers most from aggressive pooling?", ["Segmentation, which must report precise location", "Whole-image classification", "Image-level tagging"], 0, "Spatial detail is the thing being discarded.", ["Correct. Those architectures restore resolution later.", "Classification needs only the presence of features.", "Tagging is also location-insensitive."]),
    ],
  },
  {
    lessonId: "py.mc.m5_1.l3",
    atomId: "py.atom.ml.classic-cnns",
    conceptId: "py.ml.classic-cnns",
    title: "What each classic architecture actually contributed",
    requires: ["py.ml.pooling-hierarchies"],
    vocabulary: [
      ["backbone", "the stack of convolutional layers that produces features"],
      ["stacked small filters", "using several small filters instead of one large one"],
      ["skip connection", "an added path that carries the input past a block unchanged"],
      ["degradation problem", "deeper plain networks performing worse than shallower ones"],
    ],
    opening: "The history of these architectures is a short list of specific ideas, each one fixing a specific problem. Learning them as a list of names is useless; learning them as four fixes is what lets you design something new.",
    outcome: "You will explain why stacked small filters beat one large one, and why a skip connection makes depth safe.",
    why: "Skip connections are now in essentially every deep architecture, transformers included. Understanding why they were introduced explains a design decision you will meet everywhere.",
    mentalModel: "Think of a relay of translators. Adding more translators should never make the message worse, because any one of them could simply pass it along unchanged. A skip connection is what makes passing it along the default rather than something that has to be learned.",
    firstTitle: "Two small filters beat one large one",
    firstIntro: "The same receptive field costs fewer parameters and gains an extra non-linearity.",
    firstCode: `def conv_params(filt, in_ch, out_ch):
    return filt * filt * in_ch * out_ch

one_large = conv_params(5, 64, 64)
two_small = 2 * conv_params(3, 64, 64)
print("one 5x5:", one_large)
print("two 3x3:", two_small)
print("same reach, ratio:", round(two_small / one_large, 3))

three_small = 3 * conv_params(3, 64, 64)
print("three 3x3 versus one 7x7:", three_small, conv_params(7, 64, 64))`,
    firstTrace: "Two filters of three reach the same five positions as one filter of five, using about seventy per cent of the weights. Three of them match a filter of seven at just over half the cost. Each stacked layer also adds an activation, so the same reach comes with more expressive power for less memory.",
    secondTitle: "A skip connection makes identity the default",
    secondIntro: "Adding the input back means a block only has to learn the difference it makes.",
    secondCode: `def plain_block(x, weight):
    return x * weight

def residual_block(x, weight):
    return x + x * weight

decaying, dead, residual = 1.0, 1.0, 1.0
for _ in range(30):
    decaying = plain_block(decaying, 0.9)
    dead = plain_block(dead, 0.0)
    residual = residual_block(residual, 0.0)

print("plain, weights at 0.9:", round(decaying, 6))
print("plain, weights at 0.0:", round(dead, 6))
print("residual, weights at 0.0:", round(residual, 6))`,
    secondTrace: "Thirty plain blocks that each scale by nine tenths reduce the signal to about four per cent, and a plain block whose weights sit at zero destroys it outright. A residual block with those same zero weights hands its input straight back. Deeper plain networks used to perform worse than shallower ones, and making the identity the starting point is what removed that penalty.",
    mistake: "Do not describe skip connections as merely a fix for vanishing gradients. They also make the identity easy to represent, which is what stops a deeper network from performing worse than a shallower one even when the gradients are perfectly healthy.",
    checkpoint: "Why did adding layers to a plain network make it worse, when the extra layers could in principle learn the identity?",
    checkpointAnswer: "Because learning an identity mapping through a stack of transformations is genuinely difficult for the optimizer, even though it is representable. The skip connection makes the identity the default that a block starts from, so an unhelpful block can be left near zero rather than trained into a precise pass-through.",
    remember: "Stacked small filters give the same reach with fewer parameters and more non-linearity. Skip connections make the identity the default, which is what made very deep networks trainable.",
    checks: [
      q("Why replace one 5 by 5 filter with two 3 by 3 filters?", ["Same reach, fewer parameters, and an extra non-linearity", "Larger receptive field", "It removes the need for pooling"], 0, "Both cover five positions.", ["Correct. It costs about seventy per cent of the weights.", "The reach is identical, not larger.", "Pooling is a separate reduction."]),
      q("What does a skip connection make easy to represent?", ["The identity mapping", "A larger receptive field", "Weight sharing"], 0, "The block only learns the difference it makes.", ["Correct. An unhelpful block can stay near zero.", "Reach is set by the filters.", "Sharing comes from convolution itself."]),
      q("What was the degradation problem?", ["Deeper plain networks performing worse than shallower ones", "Gradients exploding at great depth", "Overfitting on large datasets"], 0, "It happened even with healthy gradients.", ["Correct. Residual blocks removed that penalty.", "Explosion is a different failure.", "It appeared on training loss too, not just held-out."]),
    ],
  },
  {
    lessonId: "py.mc.m5_1.l4",
    atomId: "py.atom.ml.transfer-learning",
    conceptId: "py.ml.transfer-learning",
    title: "Transfer learning, and what to freeze",
    requires: ["py.ml.classic-cnns"],
    vocabulary: [
      ["pretrained backbone", "a feature extractor already trained on a large dataset"],
      ["freezing", "holding a layer's weights fixed so training does not change them"],
      ["head", "the small final layer replaced to match the new task's classes"],
      ["discriminative rates", "using a smaller learning rate near the input than near the output"],
    ],
    opening: "Almost nobody trains a vision model from scratch. Early layers learn edges and textures that are the same for every image task, so the useful question is not whether to reuse them but how much of the rest to disturb.",
    outcome: "You will decide what to freeze from the dataset size and domain distance, and set layer-wise learning rates accordingly.",
    why: "This is the workflow for essentially every applied vision project. Fine-tuning everything on a small dataset destroys the features you came for, and freezing everything on a distant domain leaves accuracy on the table.",
    mentalModel: "Think of hiring an experienced specialist for a related job. You would not retrain them from the basics, and you would not refuse to let them adapt at all. How much retraining depends on how far the new job is from the old one.",
    firstTitle: "Dataset size and domain distance pick the strategy",
    firstIntro: "Two questions decide the answer, and the four combinations are the standard recipes.",
    firstCode: `def strategy(examples, similar_domain):
    if examples < 1000:
        if similar_domain:
            return "freeze the backbone, train the head only"
        return "freeze most of it, train the head and the last block"
    if similar_domain:
        return "fine-tune the whole network at a small rate"
    return "fine-tune everything, and consider a longer schedule"

for examples in (300, 50_000):
    for similar in (True, False):
        print(f"{examples:>6} examples, similar={str(similar):<5}: {strategy(examples, similar)}")`,
    firstTrace: "A small dataset cannot support updating millions of weights, so the backbone stays fixed and only the head is trained. A large dataset can support updating everything, and a distant domain makes that worthwhile. The two questions are independent, which is why there are four recipes rather than one rule.",
    secondTitle: "Layer-wise rates, and replacing the head",
    secondIntro: "Earlier layers hold the most general features, so they should move the least.",
    secondCode: `def layer_rates(depth, base=1e-3, factor=2.6):
    return [round(base / factor ** (depth - 1 - index), 8)
            for index in range(depth)]

for index, rate in enumerate(layer_rates(5)):
    print(f"block {index}: rate {rate:.8f}")

print("the head is new and random, so it takes the full base rate")
print("its output width must match the new class count, not the old one")`,
    secondTrace: "The final block trains at the base rate and each block before it at a fraction of that, so general features are nudged rather than rewritten. The head is discarded and rebuilt because its width matches the original task's class count. Training a random head against a frozen backbone for a few epochs before unfreezing anything avoids large early gradients tearing the features apart.",
    mistake: "Do not fine-tune the whole network at the full learning rate on a few hundred examples. The early layers hold exactly the general features you adopted the model for, and large updates driven by a tiny dataset destroy them within an epoch.",
    checkpoint: "A thousand medical scans, a backbone pretrained on everyday photographs. What is the plan?",
    checkpointAnswer: "The domain is distant but the dataset is small, so freeze most of the backbone and train the head plus the last block or two. Early layers still detect edges and textures that transfer, while the later, more task-specific layers are the ones worth adapting to the new imagery.",
    remember: "Reuse the backbone, replace the head, and let the dataset size and domain distance decide how much to unfreeze. The most general features sit closest to the input and should move the least.",
    checks: [
      q("Why is the head always replaced?", ["Its output width matches the original task's class count", "It holds the most general features", "It is the largest layer"], 0, "The new task has different classes.", ["Correct. A new random head is trained from scratch.", "General features live in the early layers.", "It is usually the smallest."]),
      q("Three hundred examples in a similar domain. What is the strategy?", ["Freeze the backbone and train the head only", "Fine-tune everything at the full rate", "Train from scratch"], 0, "A small dataset cannot support updating millions of weights.", ["Correct. The features already suit the domain.", "That destroys the features within an epoch.", "Scratch training needs far more data."]),
      q("Why give earlier layers a smaller learning rate?", ["They hold the most general features, which should move least", "They have more parameters", "They receive larger gradients"], 0, "Generality is what makes them worth preserving.", ["Correct. Later layers are the task-specific ones.", "Parameter count varies by architecture.", "Gradient size is not the reason."]),
    ],
  },
];

export const ML_CONVOLUTIONAL_ATOMS = ML_CONVOLUTIONAL_SPECS.map(guidedMasteryAtom);
export const ML_CONVOLUTIONAL_CONCEPTS = ML_CONVOLUTIONAL_SPECS.map(guidedMasteryConcept);
export const ML_CONVOLUTIONAL_LESSON_CONTENT = guidedLessonContent(ML_CONVOLUTIONAL_SPECS);

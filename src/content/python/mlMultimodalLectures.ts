import {
  guidedLessonContent,
  guidedMasteryAtom,
  guidedMasteryConcept,
  type GuidedMasterySpec,
} from "./guidedMastery";

const ML_MULTIMODAL_SPECS: GuidedMasterySpec[] = [
  {
    lessonId: "py.mc.m7_3.l1",
    atomId: "py.atom.ml.vision-language",
    conceptId: "py.ml.vision-language",
    title: "Vision-language models",
    requires: ["py.ml.transformer-block"],
    vocabulary: [
      ["contrastive objective", "a loss that pulls matched pairs together and pushes mismatched pairs apart"],
      ["shared embedding space", "one vector space holding both image and text representations"],
      ["temperature", "a divisor on similarities that controls how sharply the loss separates pairs"],
    ],
    opening:
      "Two encoders, one for images and one for text, produce vectors in the same space. The training signal is only which caption belongs to which image.",
    outcome:
      "You will compute the symmetric contrastive loss and see how batch size and temperature control it.",
    why:
      "A shared space makes classification a similarity lookup. New categories need a sentence, not a labelled dataset.",
    mentalModel:
      "Picture a batch as a square grid of similarities. The diagonal is the true pairs, and training makes each row and each column peak on the diagonal.",
    firstTitle: "Symmetric in both directions",
    firstIntro:
      "Every row must identify its caption and every column must identify its image. Averaging the two directions is what makes the space usable both ways.",
    firstCode: `import math

def clip_loss(similarity, temperature):
    n = len(similarity)
    scaled = [[v / temperature for v in row] for row in similarity]

    def log_prob(values, index):
        peak = max(values)
        total = sum(math.exp(v - peak) for v in values)
        return (values[index] - peak) - math.log(total)

    rows = -sum(log_prob(scaled[i], i) for i in range(n)) / n
    cols = -sum(log_prob([scaled[r][c] for r in range(n)], c)
                for c in range(n)) / n
    return (rows + cols) / 2

grid = [[0.90, 0.20, 0.10],
        [0.30, 0.85, 0.20],
        [0.10, 0.25, 0.95]]
for t in (1.0, 0.2, 0.07):
    print(t, round(clip_loss(grid, t), 4))`,
    firstTrace:
      "The loss falls from zero point six nine to zero point zero six to nearly zero as the temperature drops. Lower temperature sharpens an already-correct ranking.",
    secondTitle: "The batch is the difficulty",
    secondIntro:
      "Every other item in the batch is a negative. A random guess scores the logarithm of the batch size, so a bigger batch is a harder and more informative task.",
    secondCode: `for batch in (4, 256, 32_768):
    print(batch, "chance loss", round(math.log(batch), 3))`,
    secondTrace:
      "Chance costs one point three nine at a batch of four and ten point four at thirty-two thousand. The larger batch demands far finer discrimination.",
    mistake:
      "Treating the temperature as a fixed hyperparameter. It is normally learned, and a badly initialised one either saturates the softmax or flattens it into noise.",
    checkpoint:
      "Why does contrastive training benefit from very large batches?",
    checkpointAnswer:
      "Negatives come from within the batch, so a bigger batch means harder negatives and a stronger training signal per pair.",
    remember:
      "Diagonal correct, both directions, negatives from the batch.",
    checks: [
      {
        question: "What supplies the negative examples in contrastive training?",
        choices: [
          "The other pairs in the same batch",
          "A separate corpus of mismatched pairs",
          "Randomly generated noise vectors",
        ],
        answer: 0,
        explanation: "That is why batch size matters so much.",
        why: [
          "Correct. Every off-diagonal cell is a negative.",
          "No extra data is needed.",
          "Noise would be trivially separable.",
        ],
      },
      {
        question: "Why is the loss averaged over rows and columns?",
        choices: [
          "So retrieval works from image to text and from text to image",
          "To halve the gradient magnitude",
          "Because the matrix is symmetric",
        ],
        answer: 0,
        explanation: "Both retrieval directions are wanted at inference.",
        why: [
          "Correct. One direction alone leaves the other weak.",
          "Scaling is not the reason.",
          "The similarity matrix is not symmetric.",
        ],
      },
      {
        question: "What does the temperature control?",
        choices: [
          "How sharply the softmax separates the true pair from the rest",
          "The learning rate",
          "The embedding dimension",
        ],
        answer: 0,
        explanation: "It divides the similarities before the softmax.",
        why: [
          "Correct. It is usually learned rather than fixed.",
          "It is applied inside the loss, not the optimizer.",
          "Dimension is an architecture choice.",
        ],
      },
    ],
  },
  {
    lessonId: "py.mc.m7_3.l2",
    atomId: "py.atom.ml.image-video-generation",
    conceptId: "py.ml.image-video-generation",
    title: "Image and video generation",
    requires: ["py.ml.diffusion-models"],
    vocabulary: [
      ["latent diffusion", "running the generative process in a compressed space rather than on raw pixels"],
      ["compression factor", "how many pixels along each axis one latent position stands for"],
      ["temporal consistency", "keeping an object's appearance stable across consecutive frames"],
    ],
    opening:
      "Generating a megapixel image one pixel at a time is hopeless. Compress first, generate in the small space, then decode.",
    outcome:
      "You will quantify what latent compression buys, and see why video adds a constraint images never had.",
    why:
      "The cost of attention grows with the square of the token count, so the compression factor decides whether the model is trainable at all.",
    mentalModel:
      "Picture an autoencoder squeezing the image down to a small grid, the generative model working entirely inside that grid, and the decoder painting the detail back.",
    firstTitle: "What compression buys",
    firstIntro:
      "A five-hundred-twelve-pixel square holds two hundred sixty thousand positions. A factor of eight turns that into four thousand.",
    firstCode: `for factor in (1, 4, 8, 16):
    side = 512 // factor
    tokens = side * side
    print("factor", factor, "grid", side,
          "tokens", tokens, "ratio", 262144 // tokens)`,
    firstTrace:
      "A factor of eight cuts the token count sixty-four fold. Since attention scales with the square, the compute drops by roughly four thousand times.",
    secondTitle: "Video adds a second axis",
    secondIntro:
      "Frames generated independently flicker. The model has to attend across time as well as space, and the token count multiplies by the frame count.",
    secondCode: `frames, side = 16, 64
spatial = side * side
print("tokens per frame", spatial)
print("tokens per clip", spatial * frames)
print("full attention pairs", (spatial * frames) ** 2)`,
    secondTrace:
      "Sixteen frames reach sixty-five thousand tokens and four billion attention pairs. Factorising attention into spatial and temporal passes is not an optimisation but a necessity.",
    mistake:
      "Pushing the compression factor higher to save compute. Past a point the decoder cannot recover fine detail, and faces and text come back smeared no matter how good the generative model is.",
    checkpoint:
      "Why does a higher compression factor cut compute so steeply?",
    checkpointAnswer:
      "It reduces the grid on both axes, so tokens fall with the square of the factor, and attention cost falls with the square of that.",
    remember:
      "Compress, generate small, decode — and watch the detail ceiling.",
    checks: [
      {
        question: "Where does latent diffusion run its generative process?",
        choices: [
          "In a compressed space produced by an autoencoder",
          "Directly on pixels",
          "On the frequency spectrum",
        ],
        answer: 0,
        explanation: "The name states it.",
        why: [
          "Correct. The decoder restores pixels afterwards.",
          "That is the expensive approach it replaces.",
          "Spectral methods are a different lineage.",
        ],
      },
      {
        question: "What does raising the compression factor cost?",
        choices: [
          "Fine detail the decoder can no longer recover",
          "Training stability",
          "The number of diffusion steps",
        ],
        answer: 0,
        explanation: "Something has to be thrown away.",
        why: [
          "Correct. Faces and text degrade first.",
          "Stability is largely unaffected.",
          "Step count is a separate choice.",
        ],
      },
      {
        question: "Why does video generation need attention across frames?",
        choices: [
          "Independently generated frames are inconsistent with each other",
          "Frames are too large otherwise",
          "It reduces the token count",
        ],
        answer: 0,
        explanation: "Think about what an object looks like frame to frame.",
        why: [
          "Correct. Temporal attention is what stops the flicker.",
          "Frame size is a spatial matter.",
          "It increases the cost, not reduces it.",
        ],
      },
    ],
  },
  {
    lessonId: "py.mc.m7_3.l3",
    atomId: "py.atom.ml.speech-audio",
    conceptId: "py.ml.speech-audio",
    title: "Speech and audio models",
    requires: ["py.ml.seq2seq"],
    vocabulary: [
      ["word error rate", "edit distance between transcript and reference, divided by the reference length"],
      ["acoustic token", "a discrete code standing for a short slice of audio"],
      ["intelligibility", "whether a listener can recover the intended words, distinct from whether it sounds pleasant"],
    ],
    opening:
      "Audio arrives as sixteen thousand samples a second. Every speech model starts by deciding what a useful unit of that stream is.",
    outcome:
      "You will compute word error rate, understand why it can exceed one, and separate it from perceived quality.",
    why:
      "Recognition and synthesis are judged by different things. Conflating the two metric families produces systems that score well and serve badly.",
    mentalModel:
      "Picture the waveform collapsed into a short sequence of discrete codes. From there it is a sequence model like any other, and the audio-specific work is at the edges.",
    firstTitle: "Word error rate",
    firstIntro:
      "Count the insertions, deletions and substitutions needed to turn the transcript into the reference, and divide by the reference length.",
    firstCode: `def wer(reference, hypothesis):
    r, h = reference.split(), hypothesis.split()
    d = [[0] * (len(h) + 1) for _ in range(len(r) + 1)]
    for i in range(len(r) + 1):
        d[i][0] = i
    for j in range(len(h) + 1):
        d[0][j] = j
    for i in range(1, len(r) + 1):
        for j in range(1, len(h) + 1):
            cost = 0 if r[i - 1] == h[j - 1] else 1
            d[i][j] = min(d[i - 1][j] + 1, d[i][j - 1] + 1,
                          d[i - 1][j - 1] + cost)
    return d[len(r)][len(h)] / len(r)

print(round(wer("recognize speech", "wreck a nice beach"), 3))
print(round(wer("the cat sat on the mat", "the cat sat on a mat"), 3))`,
    firstTrace:
      "The first scores two point zero, exceeding one, because the transcript inserted more words than the reference held. The second scores zero point one six seven for a single substitution.",
    secondTitle: "Intelligible is not the same as pleasant",
    secondIntro:
      "Synthesis is judged by listener ratings, which measure naturalness. A voice can be perfectly intelligible and still rate poorly, or sound lovely while dropping words.",
    secondCode: `systems = [("clear but robotic", 0.02, 2.8),
           ("natural but slurred", 0.19, 4.3),
           ("balanced", 0.05, 4.1)]
for name, error, rating in systems:
    print(f"{name:20} error {error:.2f}  rating {rating}")`,
    secondTrace:
      "The natural voice rates highest and transcribes worst. Choosing on either number alone picks a system that fails on the other.",
    mistake:
      "Reporting word error rate on clean read speech and shipping into a noisy call centre. Accents, overlapping speakers and background noise routinely triple the rate.",
    checkpoint:
      "Can word error rate exceed one hundred percent?",
    checkpointAnswer:
      "Yes. Insertions are counted but the divisor is the reference length, so a transcript longer than the reference can exceed it.",
    remember:
      "Error rate for recognition, listener ratings for synthesis, and never one alone.",
    checks: [
      {
        question: "Why can word error rate exceed one?",
        choices: [
          "Insertions are counted while the divisor is the reference length",
          "It is a percentage, so it caps at one",
          "Because of rounding",
        ],
        answer: 0,
        explanation: "Think about a transcript far longer than the reference.",
        why: [
          "Correct. A verbose transcript can score above one.",
          "There is no cap.",
          "Rounding is not the cause.",
        ],
      },
      {
        question: "What does a listener rating measure that error rate does not?",
        choices: [
          "Naturalness of the audio",
          "Transcription accuracy",
          "Inference latency",
        ],
        answer: 0,
        explanation: "It is a human judgement of the sound.",
        why: [
          "Correct. The two can disagree sharply.",
          "That is exactly what error rate measures.",
          "Latency is a systems metric.",
        ],
      },
      {
        question: "A model scores well on read speech. What should you expect in a noisy setting?",
        choices: [
          "A substantially higher error rate",
          "The same error rate",
          "A lower error rate",
        ],
        answer: 0,
        explanation: "The evaluation condition is part of the number.",
        why: [
          "Correct. Noise and accents commonly triple it.",
          "Conditions change the result markedly.",
          "Noise never helps.",
        ],
      },
    ],
  },
  {
    lessonId: "py.mc.m7_3.l4",
    atomId: "py.atom.ml.graph-networks",
    conceptId: "py.ml.graph-networks",
    title: "Graph neural networks",
    requires: ["py.ml.multi-layer-perceptrons"],
    vocabulary: [
      ["message passing", "updating each node from its own state and its neighbours' states"],
      ["permutation invariance", "producing the same result whichever order the neighbours are listed in"],
      ["oversmoothing", "node representations converging toward each other as layers are stacked"],
    ],
    opening:
      "A graph has no natural ordering, so the architecture has to be blind to order. That constraint drives the whole design.",
    outcome:
      "You will implement message passing and watch representations collapse together as depth increases.",
    why:
      "Depth is how information travels across a graph, but too much depth destroys the very distinctions you were computing.",
    mentalModel:
      "Imagine every node shouting its state to its neighbours each round. After enough rounds everyone has heard from everyone, and all the voices average out.",
    firstTitle: "One round of messages",
    firstIntro:
      "Averaging over neighbours is permutation invariant by construction. Any order-sensitive aggregation would give different answers for the same graph.",
    firstCode: `adjacency = [[0] * 6 for _ in range(6)]
for a, b in [(0, 1), (1, 2), (2, 3), (3, 4), (4, 5), (0, 5), (1, 4)]:
    adjacency[a][b] = adjacency[b][a] = 1
features = [[1.0, 0.0], [0.0, 1.0], [1.0, 1.0],
            [0.0, 0.0], [1.0, 0.5], [0.5, 1.0]]

def propagate(x, layers):
    trace = []
    for _ in range(layers):
        x = [[sum(x[j][d] for j in range(6) if adjacency[i][j] or j == i)
              / (sum(adjacency[i]) + 1)
              for d in range(2)] for i in range(6)]
        trace.append(round(max(abs(x[i][d] - x[j][d])
                               for i in range(6) for j in range(6)
                               for d in range(2)), 6))
    return trace

print(propagate(features, 10))`,
    firstTrace:
      "The spread between the most different pair of nodes starts at zero point five and falls to zero point zero zero four after ten rounds. The nodes have become indistinguishable.",
    secondTitle: "Depth has a ceiling",
    secondIntro:
      "Each layer widens the neighbourhood a node can see by one hop. Each layer also averages away more of what made that node distinct.",
    secondCode: `for layer, spread in enumerate(propagate(features, 10), start=1):
    print(layer, spread)`,
    secondTrace:
      "The decline is geometric, roughly halving every layer. Two or three layers is the usual sweet spot, which is why graph networks stay shallow.",
    mistake:
      "Adding layers to reach distant nodes. Beyond a few hops the representations have collapsed, and the model gets worse while appearing to have more capacity.",
    checkpoint:
      "Why do graph networks stay shallow when other architectures grow deep?",
    checkpointAnswer:
      "Each layer averages neighbours together, so depth drives node representations toward a common value and destroys the distinctions being learned.",
    remember:
      "Order-blind aggregation, one hop per layer, and stop before everything blurs.",
    checks: [
      {
        question: "Why must neighbour aggregation be order independent?",
        choices: [
          "A graph has no canonical ordering of neighbours",
          "It makes the computation faster",
          "Gradients require it",
        ],
        answer: 0,
        explanation: "The same graph can be written down many ways.",
        why: [
          "Correct. Otherwise the answer depends on the encoding.",
          "Speed is not the reason.",
          "Gradients flow through ordered operations fine.",
        ],
      },
      {
        question: "What is oversmoothing?",
        choices: [
          "Node representations converging toward each other with depth",
          "Gradients vanishing in deep layers",
          "Overfitting to the training graph",
        ],
        answer: 0,
        explanation: "It comes from repeated averaging.",
        why: [
          "Correct. The distinctions disappear.",
          "That is a different failure.",
          "It happens even without overfitting.",
        ],
      },
      {
        question: "How far can information travel in a three-layer graph network?",
        choices: ["Three hops", "The whole graph", "One hop"],
        answer: 0,
        explanation: "Each layer moves messages one edge.",
        why: [
          "Correct. Depth and reach are the same number.",
          "Only if the graph has diameter three.",
          "That would be a single layer.",
        ],
      },
    ],
  },
  {
    lessonId: "py.mc.m7_3.l5",
    atomId: "py.atom.ml.recommendation",
    conceptId: "py.ml.recommendation",
    title: "Recommendation systems",
    requires: ["py.ml.vector-search"],
    vocabulary: [
      ["retrieval stage", "cheaply narrowing millions of candidates to a few hundred"],
      ["ranking stage", "scoring the shortlist with an expensive model"],
      ["implicit feedback", "signals such as clicks that indicate interest without an explicit rating"],
    ],
    opening:
      "You cannot score a million items per request. Recommenders are always two systems: a cheap one that narrows, and an expensive one that orders.",
    outcome:
      "You will see why implicit feedback is biased by exposure, and how to correct the ranking for it.",
    why:
      "The logs record what users clicked among what they were shown. Training on that directly teaches the model to reproduce yesterday's choices.",
    mentalModel:
      "Picture a funnel. Millions of items enter, a vector search keeps a few hundred, and a heavyweight model orders those. Latency dictates the shape.",
    firstTitle: "Clicks are not preference",
    firstIntro:
      "An item shown ten times more often collects more clicks whatever its quality. Ranking by raw clicks entrenches whatever was already popular.",
    firstCode: `clicks = {"a": 900, "b": 60, "c": 30, "d": 8, "e": 2}
shown = {"a": 1000, "b": 100, "c": 100, "d": 20, "e": 5}

by_clicks = sorted(clicks, key=lambda k: -clicks[k])
rate = {k: clicks[k] / shown[k] for k in clicks}
by_rate = sorted(rate, key=lambda k: -rate[k])
print(by_clicks)
print(by_rate, {k: round(v, 2) for k, v in rate.items()})`,
    firstTrace:
      "Raw clicks rank c third. Dividing by exposure drops it to last, behind two items with a tenth of its clicks. The correction changed the answer.",
    secondTitle: "The funnel decides the metrics",
    secondIntro:
      "Retrieval is judged by whether the right item is anywhere in the shortlist. Ranking is judged by where it lands. Optimising one for the other's metric misleads.",
    secondCode: `shortlist, position = 500, 3
print("retrieval recall target: item within", shortlist)
print("ranking target: item at position", position)
print("a perfect ranker cannot fix a missing candidate")`,
    secondTrace:
      "If retrieval drops the right item, no ranker recovers it. Recall at the shortlist size is the ceiling on everything downstream.",
    mistake:
      "Evaluating offline on logged clicks and calling it done. Those logs only contain items the old system chose to show, so a genuinely better recommender can score worse offline.",
    checkpoint:
      "Why does ranking by raw click counts entrench popular items?",
    checkpointAnswer:
      "Clicks scale with how often an item was shown, so popular items accumulate clicks through exposure rather than merit.",
    remember:
      "Retrieve wide, rank narrow, and divide by exposure.",
    checks: [
      {
        question: "Why are recommenders split into two stages?",
        choices: [
          "Scoring every item with an expensive model is too slow",
          "The two stages use different data",
          "It improves accuracy directly",
        ],
        answer: 0,
        explanation: "Think about a million items and a latency budget.",
        why: [
          "Correct. Latency forces the funnel.",
          "They typically share the same logs.",
          "It trades some accuracy for feasibility.",
        ],
      },
      {
        question: "What does implicit feedback confound?",
        choices: [
          "Interest with exposure",
          "Clicks with purchases",
          "Users with sessions",
        ],
        answer: 0,
        explanation: "An item must be shown before it can be clicked.",
        why: [
          "Correct. Correcting for exposure changes the ranking.",
          "Those are separate signals, not a confound.",
          "That is an identity question.",
        ],
      },
      {
        question: "Retrieval drops the correct item from the shortlist. What can ranking do?",
        choices: [
          "Nothing; the ceiling is set upstream",
          "Recover it by rescoring",
          "Expand the shortlist",
        ],
        answer: 0,
        explanation: "Ranking only sees the shortlist.",
        why: [
          "Correct. Recall at the shortlist bounds the system.",
          "It cannot score what it never received.",
          "That would be a retrieval change.",
        ],
      },
    ],
  },
  {
    lessonId: "py.mc.m7_3.l6",
    atomId: "py.atom.ml.time-series",
    conceptId: "py.ml.time-series",
    title: "Time-series forecasting",
    requires: ["py.ml.grouped-time-validation"],
    vocabulary: [
      ["temporal split", "training only on data that precedes the evaluation period"],
      ["seasonality", "a pattern that repeats on a fixed period, such as weekly or yearly"],
      ["prediction interval", "a range the future value is expected to fall within, with a stated probability"],
    ],
    opening:
      "Every other model may be evaluated with a random split. A forecaster may not, and the reason is that the future is not exchangeable with the past.",
    outcome:
      "You will measure how much a random split flatters a forecaster, and why intervals matter more than point predictions.",
    why:
      "A random split lets the model see points on both sides of every test point. That is information no deployed forecaster will ever have.",
    mentalModel:
      "Picture the timeline with a single cut. Everything left of the cut trains; everything right is evaluated. A random split scatters the test points through the training data instead.",
    firstTitle: "The split is the experiment",
    firstIntro:
      "Take a trending series with seasonality, and evaluate the same simple predictor under a random split and a temporal one.",
    firstCode: `import math, random

series = [10 + 0.5 * i + math.sin(i / 3) * 2 for i in range(60)]

def error(train, test):
    return sum(abs(series[min(train, key=lambda i: abs(i - t))] - series[t])
               for t in test) / len(test)

order = list(range(60))
random.Random(0).shuffle(order)
print("random split error :",
      round(error(sorted(order[:48]), sorted(order[48:])), 4))
print("temporal split err :",
      round(error(list(range(48)), list(range(48, 60))), 4))`,
    firstTrace:
      "Zero point five nine against two point five. The random split reports an error four times too low, purely because neighbouring points leaked across it.",
    secondTitle: "Intervals, not points",
    secondIntro:
      "Uncertainty grows with the horizon. A single number for a forecast twelve steps out hides how little the model actually knows.",
    secondCode: `for horizon in (1, 3, 6, 12):
    width = 1.2 * horizon ** 0.5
    print("horizon", horizon, "interval width", round(width, 2))`,
    secondTrace:
      "The interval widens from one point two to four point one six as the horizon reaches twelve. A point forecast reports the same confidence at every distance.",
    mistake:
      "Computing features over the whole series before splitting. A rolling mean or a scaler fitted on all the data carries future information into the training set, and the leak is invisible in the metrics.",
    checkpoint:
      "Why does a random split flatter a forecaster?",
    checkpointAnswer:
      "It lets the model train on points that come after the test points, which is information no deployed forecaster has.",
    remember:
      "Cut the timeline once, fit features left of the cut, and report intervals.",
    checks: [
      {
        question: "Why is a random split invalid for forecasting?",
        choices: [
          "It trains on points later than the ones it evaluates",
          "It uses too little training data",
          "It ignores seasonality",
        ],
        answer: 0,
        explanation: "Think about what a deployed model can see.",
        why: [
          "Correct. That leak makes the score optimistic.",
          "The proportion can be identical.",
          "Seasonality is a modelling concern.",
        ],
      },
      {
        question: "Where must a scaler or rolling feature be fitted?",
        choices: [
          "On the training portion only",
          "On the whole series",
          "On the test portion",
        ],
        answer: 0,
        explanation: "Anything fitted on all the data has seen the future.",
        why: [
          "Correct. Otherwise the leak is invisible in the metrics.",
          "That carries future information backward.",
          "The test portion must stay untouched.",
        ],
      },
      {
        question: "What happens to prediction intervals as the horizon grows?",
        choices: [
          "They widen",
          "They stay constant",
          "They narrow as the trend clarifies",
        ],
        answer: 0,
        explanation: "Uncertainty compounds with distance.",
        why: [
          "Correct. A point forecast hides that entirely.",
          "Constant width would understate distant uncertainty.",
          "Distance adds uncertainty, never removes it.",
        ],
      },
    ],
  },
];

export const ML_MULTIMODAL_ATOMS = ML_MULTIMODAL_SPECS.map(guidedMasteryAtom);
export const ML_MULTIMODAL_CONCEPTS = ML_MULTIMODAL_SPECS.map(guidedMasteryConcept);
export const ML_MULTIMODAL_LESSON_CONTENT = guidedLessonContent(ML_MULTIMODAL_SPECS);

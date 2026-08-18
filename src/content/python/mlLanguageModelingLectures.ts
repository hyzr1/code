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

const ML_LANGUAGE_MODELING_SPECS: GuidedMasterySpec[] = [
  {
    lessonId: "py.mc.m6_3.l1",
    atomId: "py.atom.ml.language-modeling-objective",
    conceptId: "py.ml.language-modeling-objective",
    title: "One objective, and everything that falls out of it",
    requires: ["py.ml.transformer-implementation"],
    vocabulary: [
      ["next-token objective", "predicting each token from the ones before it"],
      ["self-supervision", "deriving the training target from the input itself"],
      ["chain rule of probability", "writing a sequence's probability as a product of conditionals"],
      ["training signal", "how many supervised comparisons one example provides"],
    ],
    opening: "Language models are trained on one task and one task only: given some text, predict what comes next. Everything else people describe them as doing is a consequence of doing that well enough.",
    outcome: "You will express a sequence's probability as a product of conditionals, and explain why the objective needs no labels.",
    why: "The objective explains the data requirements, the loss, and why a single forward pass supplies as many training signals as it has tokens. It also frames what these models are and are not optimizing.",
    mentalModel: "Picture reading a sentence with a card covering everything ahead of your finger. At every position you guess the next word, slide the card, and see whether you were right.",
    firstTitle: "A sequence's probability is a product of conditionals",
    firstIntro: "The chain rule turns one hard question into a sequence of easier ones.",
    firstCode: `import math

model = {
    (): {"the": 0.5, "a": 0.5},
    ("the",): {"cat": 0.6, "mat": 0.4},
    ("the", "cat"): {"sat": 0.7, "ate": 0.3},
}

def sequence_probability(tokens):
    total = 1.0
    for index in range(len(tokens)):
        history = tuple(tokens[:index])
        total *= model[history][tokens[index]]
    return total

sentence = ["the", "cat", "sat"]
print("probability:", sequence_probability(sentence))
print("as a product:", 0.5, "x", 0.6, "x", 0.7)
print("negative log:", round(-math.log(sequence_probability(sentence)), 4))`,
    firstTrace: "The whole sentence's probability is the product of three conditional probabilities, one per position. Multiplying many small numbers underflows quickly, which is why the loss works in logarithms instead. Summing negative logarithms is exactly the cross-entropy the model is trained to reduce.",
    secondTitle: "The label is the text itself",
    secondIntro: "Every token is both an input to later positions and a target for the position before it.",
    secondCode: `tokens = ["the", "cat", "sat", "on", "the", "mat"]

print("position  context                      target")
for index in range(1, len(tokens)):
    context = " ".join(tokens[:index])
    print(f"{index:>8}  {context:<28} {tokens[index]}")

print()
print(f"{len(tokens)} tokens gave {len(tokens) - 1} supervised examples")
print("no annotation was needed for any of them")`,
    secondTrace: "A six-token sentence supplies five training targets, and none of them were written by a person. That is what makes the objective scale to any quantity of text that exists. A causal model produces all of these predictions in one forward pass rather than one per example.",
    mistake: "Do not describe the objective as teaching facts or reasoning. It rewards assigning probability to whatever token actually followed, and any capability beyond that is something the model acquired because it helped with that one prediction.",
    checkpoint: "Why does a single forward pass over a sequence supply as many training signals as it has tokens?",
    checkpointAnswer: "Because the causal mask lets every position predict its own successor while seeing only what came before it. Each position therefore produces an independent, honest prediction, and one pass computes all of them at once rather than requiring a separate pass per target.",
    remember: "The objective is predicting the next token, and the label is the text itself. A sequence's probability is a product of conditionals, which the loss handles as a sum of negative logarithms.",
    checks: [
      q("Why is next-token prediction called self-supervised?", ["The target comes from the input text itself", "It needs no loss function", "It trains without gradients"], 0, "No human annotation is involved.", ["Correct. That is what lets it use any text at all.", "Cross-entropy is still the loss.", "Gradients are computed normally."]),
      q("Why does the loss work in logarithms?", ["Multiplying many probabilities underflows", "Logarithms are faster", "Probabilities can be negative"], 0, "A product of small numbers vanishes quickly.", ["Correct. The sum of negative logs is the cross-entropy.", "The cost is comparable.", "Probabilities are never negative."]),
      q("A 6-token sequence gives how many training targets?", ["Five", "One", "Six"], 0, "Every token after the first is a target.", ["Correct. The first has no preceding context.", "That would be one example per sequence.", "The first token is not predicted."]),
    ],
  },
  {
    lessonId: "py.mc.m6_3.l2",
    atomId: "py.atom.ml.ngram-models",
    conceptId: "py.ml.ngram-models",
    title: "Counting works until the context gets long",
    requires: ["py.ml.language-modeling-objective"],
    vocabulary: [
      ["n-gram", "a fixed-length window of tokens used as the context"],
      ["sparsity", "most possible contexts never appearing in any corpus"],
      ["smoothing", "assigning some probability to combinations never observed"],
      ["distributed representation", "a learned vector that lets similar contexts share evidence"],
    ],
    opening: "The obvious way to build a language model is to count. It works, it is fast, and it fails for a reason that no amount of data fixes: the number of possible contexts grows faster than any corpus can cover.",
    outcome: "You will build a counting model, watch it assign zero to unseen text, and explain what a learned representation does that smoothing cannot.",
    why: "The failure of counting is precisely the problem embeddings solve. Seeing the zero-probability wall first makes it obvious why learned representations were worth the cost.",
    mentalModel: "Picture a phrasebook listing every sentence you might need. It works perfectly for the sentences it contains and is silent on everything else, and no phrasebook can list them all.",
    firstTitle: "Counting is easy and brittle",
    firstIntro: "Conditional probabilities come straight from the counts, including the zeros.",
    firstCode: `from collections import Counter, defaultdict

corpus = "the cat sat on the mat the cat ate".split()

def contexts(tokens, n):
    table = defaultdict(Counter)
    for i in range(len(tokens) - n + 1):
        table[tuple(tokens[i:i + n - 1])][tokens[i + n - 1]] += 1
    return table

bigrams = contexts(corpus, 2)
for history, counts in list(bigrams.items())[:3]:
    print(history, dict(counts))

def probability(table, history, token, alpha=0.0, vocab_size=0):
    counts = table.get(history, Counter())
    total = sum(counts.values())
    denominator = total + alpha * vocab_size
    return (counts[token] + alpha) / denominator if denominator else 0.0

vocab = sorted(set(corpus))
print("p(cat | the):", round(probability(bigrams, ("the",), "cat"), 4))
print("p(dog | the):", probability(bigrams, ("the",), "dog"))`,
    firstTrace: "The observed continuation gets a sensible probability and the unobserved one gets exactly zero. A zero makes the whole sequence probability zero and its logarithm undefined, so a single unseen pair invalidates any sentence containing it. That is not a rare edge case; it is the normal situation on any real text.",
    secondTitle: "Smoothing patches the symptom, not the cause",
    secondIntro: "Adding a small constant removes the zeros and still treats every unseen word identically.",
    secondCode: `from collections import Counter, defaultdict

corpus = "the cat sat on the mat the cat ate".split()
vocab = sorted(set(corpus))

def contexts(tokens, n):
    table = defaultdict(Counter)
    for i in range(len(tokens) - n + 1):
        table[tuple(tokens[i:i + n - 1])][tokens[i + n - 1]] += 1
    return table

def probability(table, history, token, alpha, vocab_size):
    counts = table.get(history, Counter())
    total = sum(counts.values())
    return (counts[token] + alpha) / (total + alpha * vocab_size)

bigrams = contexts(corpus, 2)
for token in ("cat", "mat", "dog"):
    value = probability(bigrams, ("the",), token, 1.0, len(vocab))
    print(f"p({token:>3} | the) smoothed: {value:.4f}")

print()
for n in (1, 2, 3, 4):
    print(f"{n}-gram contexts possible over {len(vocab)} words: {len(vocab) ** n:>7}")`,
    secondTrace: "Smoothing gives every unseen word the same small probability, so a plausible continuation and an absurd one score identically. The context count grows as a power of the vocabulary, so a five-word window over fifty thousand words has more possible contexts than there are atoms worth counting. A learned representation instead lets similar contexts share evidence, which is the thing counting cannot do at all.",
    mistake: "Do not raise the window size to fix a counting model's quality. Each extra token multiplies the possible contexts by the vocabulary size. The counts get sparser rather than more informative, so the model gets worse rather than better.",
    checkpoint: "Smoothing removes the zeros. Why is that not enough?",
    checkpointAnswer: "Because every unseen continuation receives the same probability, so the model cannot prefer a plausible word over an absurd one. Counting has no notion of similarity between contexts or between words, and that is what a learned representation supplies.",
    remember: "Counting gives zero to anything unseen, and smoothing makes every unseen option equally likely. Contexts grow as a power of the vocabulary, so learned representations are what let similar contexts share evidence.",
    checks: [
      q("What does an unsmoothed count model assign to an unseen pair?", ["Exactly zero, which makes the whole sequence impossible", "A small default", "The average probability"], 0, "The logarithm of zero is undefined.", ["Correct. One unseen pair invalidates the sentence.", "Nothing supplies a default without smoothing.", "No averaging takes place."]),
      q("What is smoothing unable to do?", ["Prefer a plausible unseen word over an absurd one", "Remove the zeros", "Keep the probabilities summing to one"], 0, "Every unseen option gets the same value.", ["Correct. Similarity is what it lacks.", "Removing zeros is exactly what it does.", "Normalization is maintained."]),
      q("Why does a longer window make a counting model worse?", ["Possible contexts grow as a power of the vocabulary", "The counts overflow", "Longer contexts are less relevant"], 0, "The data gets sparser, not richer.", ["Correct. Sparsity is the binding constraint.", "Counts are small integers.", "Longer context is more informative in principle."]),
    ],
  },
  {
    lessonId: "py.mc.m6_3.l3",
    atomId: "py.atom.ml.perplexity",
    conceptId: "py.ml.perplexity",
    title: "Perplexity, and the ways it misleads",
    requires: ["py.ml.ngram-models"],
    vocabulary: [
      ["perplexity", "the exponential of the average negative log probability per token"],
      ["effective branching factor", "how many equally likely options the score corresponds to"],
      ["contamination", "test data having appeared in the training set"],
      ["comparability", "whether two reported numbers were measured the same way"],
    ],
    opening: "Perplexity is the standard score for a language model, and it is comparable between two models far less often than it is compared. Two conditions have to hold, and published numbers frequently violate both.",
    outcome: "You will compute perplexity from probabilities, read it as an effective branching factor, and name the two conditions that make a comparison valid.",
    why: "Choosing a model on an invalid comparison is a common and expensive mistake. The branching-factor reading also makes an abstract number mean something concrete.",
    mentalModel: "Picture a multiple-choice quiz where perplexity is the number of options the model was effectively choosing between. Two means it had narrowed the answer to a coin flip; fifty thousand means it had learned nothing at all.",
    firstTitle: "The exponential of the average surprise",
    firstIntro: "Perplexity is a rescaling of cross-entropy, and reads as a count of equally likely options.",
    firstCode: `import math

def cross_entropy(probabilities):
    return -sum(math.log(p) for p in probabilities) / len(probabilities)

def perplexity(probabilities):
    return math.exp(cross_entropy(probabilities))

uniform_over_ten = [0.1] * 5
confident = [0.9] * 5
mixed = [0.9, 0.9, 0.05, 0.9, 0.9]

for name, probabilities in (("uniform over 10", uniform_over_ten),
                            ("confident", confident),
                            ("one bad guess", mixed)):
    print(f"{name:<16} cross-entropy {cross_entropy(probabilities):.4f}  "
          f"perplexity {perplexity(probabilities):.4f}")`,
    firstTrace: "A model spreading its probability evenly over ten options scores a perplexity of exactly ten, which is where the branching-factor reading comes from. A confident model scores a little over one. A single badly wrong prediction among four good ones drags the score up sharply, because the logarithm punishes small probabilities heavily.",
    secondTitle: "Two conditions for a valid comparison",
    secondIntro: "The tokenization must match, and the test text must not have been trained on.",
    secondCode: `import math

def perplexity(probabilities):
    return math.exp(-sum(math.log(p) for p in probabilities) / len(probabilities))

# The same text, split two ways, with identical per-token confidence.
word_level = [0.5] * 4
subword_level = [0.5] * 8

print("word tokenizer:    ", round(perplexity(word_level), 4))
print("subword tokenizer: ", round(perplexity(subword_level), 4))
print("identical scores, but per word the second is far more confident")
print()
print("memorized test text:", round(perplexity([0.999] * 8), 4))
print("a low score can mean the model has seen the answers")`,
    secondTrace: "Two tokenizers with the same per-token confidence report the same perplexity while describing very different behaviour, because one is being asked twice as many easier questions. A memorized passage scores near one, which looks excellent and measures nothing. Both failures produce numbers that appear comparable and are not.",
    mistake: "Do not compare perplexity across models with different vocabularies. The score is per token, so a model with a finer tokenizer answers more and easier questions, and the comparison rewards the tokenizer rather than the model.",
    checkpoint: "A model reports a perplexity of 1.02 on a public benchmark. What would you check before believing it?",
    checkpointAnswer: "Whether the benchmark text appeared in the training data. A score that close to one means the model was almost certain of every token, which on genuinely unseen text is implausible and on memorized text is exactly what you would expect.",
    remember: "Perplexity is the exponential of the average negative log probability, read as an effective branching factor. It is comparable only when the tokenization matches and the test text is genuinely unseen.",
    checks: [
      q("A model spreads probability evenly over 10 options. What is its perplexity?", ["Ten", "One", "About 2.3"], 0, "Perplexity reads as an effective branching factor.", ["Correct. That is where the reading comes from.", "One means complete certainty.", "That is the cross-entropy, not the perplexity."]),
      q("Why can perplexity not be compared across tokenizers?", ["It is per token, and a finer tokenizer asks more, easier questions", "It depends on the model size", "It requires the same architecture"], 0, "The comparison rewards the tokenizer.", ["Correct. Normalize per character or word instead.", "Size does not enter the formula.", "Architecture is irrelevant to the score."]),
      q("A suspiciously low perplexity on a public benchmark suggests what?", ["The test text may have been in the training data", "The model is very large", "The tokenizer is coarse"], 0, "Near-certainty on unseen text is implausible.", ["Correct. Contamination is the first thing to check.", "Size alone does not produce near-certainty.", "A coarse tokenizer raises the score."]),
    ],
  },
];

export const ML_LANGUAGE_MODELING_ATOMS = ML_LANGUAGE_MODELING_SPECS.map(guidedMasteryAtom);
export const ML_LANGUAGE_MODELING_CONCEPTS = ML_LANGUAGE_MODELING_SPECS.map(guidedMasteryConcept);
export const ML_LANGUAGE_MODELING_LESSON_CONTENT = guidedLessonContent(ML_LANGUAGE_MODELING_SPECS);

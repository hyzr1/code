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

const ML_TEXT_REPRESENTATION_SPECS: GuidedMasterySpec[] = [
  {
    lessonId: "py.mc.m6_1.l1",
    atomId: "py.atom.ml.tokenization",
    conceptId: "py.ml.tokenization",
    title: "Tokenization decides what the model can even see",
    requires: ["py.ml.attention-scaling"],
    vocabulary: [
      ["token", "the smallest unit the model reads, which need not be a word"],
      ["out-of-vocabulary", "an input the tokenizer has no entry for"],
      ["subword", "a fragment shorter than a word, learned from the data"],
      ["byte-pair encoding", "repeatedly merging the most frequent adjacent pair into one unit"],
    ],
    opening: "A model never sees text. It sees integers, and the rule turning one into the other decides which words it can represent, how long its inputs are, and what happens when something unfamiliar arrives.",
    outcome: "You will compare word and character tokenization on their failure modes, and run byte-pair encoding to see where subwords come from.",
    why: "Vocabulary size trades against sequence length, and both cost money. Subword tokenization is the compromise every modern model uses, and knowing how it is built explains why rare words split into fragments.",
    mentalModel: "Picture cutting a sentence into pieces before filing them. Cut at every space and unfamiliar words have no drawer. Cut at every letter and nothing fits in one drawer. Cutting at learned fragments gives both a place to live.",
    firstTitle: "Two extremes, two failure modes",
    firstIntro: "Words give short sequences and a vocabulary that cannot cover everything; characters give the reverse.",
    firstCode: `text = "unbelievable tokenization"
known = {"the", "cat", "sat", "token", "ization", "un", "believable"}

by_word = text.split()
by_char = list(text)

print("word tokens:", by_word)
print("unknown words:", [w for w in by_word if w not in known])
print("character tokens:", len(by_char))
print("word count:", len(by_word), "character count:", len(by_char))
print("a word vocabulary needs an entry for every form it will ever meet")`,
    firstTrace: "Both words in that sentence are missing from the vocabulary, so a word tokenizer maps them to an unknown marker and the meaning is gone. Characters never fail that way, and they turn a two-word phrase into twenty-five positions, which attention pays for quadratically. Neither extreme is usable on its own.",
    secondTitle: "Byte-pair encoding learns the middle ground",
    secondIntro: "Start from characters and repeatedly merge whichever adjacent pair is most frequent.",
    secondCode: `from collections import Counter

def learn_merges(words, rounds):
    vocab = {" ".join(word) + " </w>": count for word, count in words.items()}
    rules = []
    for _ in range(rounds):
        pairs = Counter()
        for word, count in vocab.items():
            symbols = word.split()
            for i in range(len(symbols) - 1):
                pairs[(symbols[i], symbols[i + 1])] += count
        if not pairs:
            break
        best = max(pairs, key=lambda pair: (pairs[pair], pair))
        rules.append(best)
        joined = " ".join(best)
        vocab = {word.replace(joined, "".join(best)): count
                 for word, count in vocab.items()}
    return rules, vocab

corpus = {"low": 5, "lower": 2, "newest": 6, "widest": 3}
rules, vocab = learn_merges(corpus, 6)
print("merges learned:", rules)
for word, count in vocab.items():
    print(f"  {word!r:>22} x{count}")`,
    secondTrace: "The first merges glue the shared ending together, because that pair appears most often across the corpus. Frequent whole words end up as single units and rare ones stay split into fragments. Nothing about this needs a dictionary; the merges are learned from counts alone, which is why the method transfers to any language.",
    mistake: "Do not compare loss values across models with different tokenizers. Loss is measured per token, so a tokenizer producing more tokens per sentence reports a different number for identical behaviour, and the comparison is meaningless.",
    checkpoint: "Why does a rare technical term split into several pieces while a common word stays whole?",
    checkpointAnswer: "Because merges are chosen by frequency. A common word's characters get merged together early and survive as one unit, while a rare term's pairs never rank highly enough to merge, so it stays as the fragments it was built from.",
    remember: "Words break on anything unfamiliar and characters make sequences too long. Byte-pair encoding merges frequent adjacent pairs, so common words become single tokens and rare ones stay in pieces.",
    checks: [
      q("What is the failure mode of word-level tokenization?", ["Anything outside the vocabulary becomes an unknown marker", "Sequences become too long", "It cannot handle punctuation"], 0, "A fixed vocabulary cannot cover every form.", ["Correct. The meaning of that word is lost entirely.", "That is the character-level problem.", "Punctuation is handled by rules either way."]),
      q("How does byte-pair encoding choose what to merge?", ["The most frequent adjacent pair in the corpus", "The longest matching dictionary word", "Pairs chosen by a linguist"], 0, "Merges are learned from counts.", ["Correct. That is why it transfers across languages.", "No dictionary is consulted.", "The process is entirely automatic."]),
      q("Why can loss not be compared across different tokenizers?", ["It is measured per token, and token counts differ", "The vocabularies overlap", "One model is always larger"], 0, "Identical behaviour reports different numbers.", ["Correct. Normalize per character or per word instead.", "Overlap is not what breaks the comparison.", "Model size is a separate variable."]),
    ],
  },
  {
    lessonId: "py.mc.m6_1.l2",
    atomId: "py.atom.ml.embeddings",
    conceptId: "py.ml.embeddings",
    title: "Embeddings put meaning in geometry",
    requires: ["py.ml.tokenization"],
    vocabulary: [
      ["embedding matrix", "a lookup table with one learned vector per token"],
      ["one-hot vector", "a vector that is one at a token's index and zero elsewhere"],
      ["distributional hypothesis", "the idea that words in similar contexts have similar meanings"],
      ["cosine similarity", "the angle between two vectors, ignoring their lengths"],
    ],
    opening: "A token index carries no information beyond identity, and index four is no closer to index five than to index four thousand. An embedding replaces that index with a learned vector, so distance in the space can mean something.",
    outcome: "You will describe the embedding matrix as a lookup rather than a multiplication, and compare vectors by angle rather than by distance.",
    why: "Every language model begins with this table, and it is usually a large share of the parameters. Cosine similarity is also the measure behind retrieval and semantic search.",
    mentalModel: "Picture arranging words on a map rather than in a numbered list. A list says only which came first; a map lets nearness mean something, and directions on it can carry meaning too.",
    firstTitle: "The lookup that is secretly a multiplication",
    firstIntro: "Multiplying a one-hot vector by a matrix selects one row, which is why frameworks skip the multiplication.",
    firstCode: `matrix = [
    [0.9, 0.1, 0.0],
    [0.8, 0.2, 0.1],
    [0.1, 0.9, 0.2],
    [0.0, 0.1, 0.9],
]
words = ["cat", "dog", "run", "blue"]

def one_hot(index, size):
    return [1.0 if i == index else 0.0 for i in range(size)]

def multiply(vector, rows):
    return [sum(v * row[j] for v, row in zip(vector, rows))
            for j in range(len(rows[0]))]

index = words.index("dog")
print("one-hot:", one_hot(index, len(words)))
print("by multiplication:", multiply(one_hot(index, len(words)), matrix))
print("by lookup:        ", matrix[index])
print("same result, and the lookup skips every multiplication by zero")`,
    firstTrace: "Both routes return the same row, because every term except one is multiplied by zero. A framework stores the table and indexes into it directly, which is why the operation is called an embedding lookup. The parameters are the same either way; only the work differs.",
    secondTitle: "Angle carries the meaning, not length",
    secondIntro: "Two vectors pointing the same way are similar even when one is much longer.",
    secondCode: `import math

def cosine(a, b):
    dot = sum(x * y for x, y in zip(a, b))
    size_a = math.sqrt(sum(x * x for x in a))
    size_b = math.sqrt(sum(y * y for y in b))
    return dot / (size_a * size_b)

def distance(a, b):
    return math.sqrt(sum((x - y) ** 2 for x, y in zip(a, b)))

cat = [0.9, 0.1, 0.0]
dog = [0.8, 0.2, 0.1]
blue = [0.0, 0.1, 0.9]
loud_cat = [9.0, 1.0, 0.0]

for name, vector in (("dog", dog), ("blue", blue), ("loud_cat", loud_cat)):
    print(f"cat vs {name:<9} cosine {cosine(cat, vector):.4f}  "
          f"distance {distance(cat, vector):.4f}")`,
    secondTrace: "The scaled-up copy of the first vector has a cosine of one and a large straight-line distance, which is exactly why angle is the measure of choice. A frequent word tends to acquire a longer vector without becoming more meaningful, so length is mostly a nuisance. The unrelated word scores low on both measures.",
    mistake: "Do not compare embeddings from two separately trained models. Each training run picks its own arbitrary orientation for the space, so a vector from one model has no defined relationship to a vector from another, however similar their architectures.",
    checkpoint: "Why is cosine similarity preferred over straight-line distance for embeddings?",
    checkpointAnswer: "Because vector length mostly tracks how often a token appeared rather than what it means, and distance is dominated by that length. The angle ignores it, so two vectors pointing the same way count as similar however long either one is.",
    remember: "An embedding is a lookup table with one learned vector per token, equivalent to multiplying by a one-hot vector. Compare vectors by angle, since length mostly reflects frequency.",
    checks: [
      q("Why do frameworks implement embeddings as a lookup?", ["Multiplying by a one-hot vector just selects one row", "Lookups use fewer parameters", "Matrices cannot be trained"], 0, "Every other term is multiplied by zero.", ["Correct. The parameters are identical either way.", "The table is the same size.", "The table is trained normally."]),
      q("What does cosine similarity ignore?", ["The lengths of the two vectors", "The direction of the vectors", "The number of dimensions"], 0, "Length mostly tracks frequency.", ["Correct. That is what makes it the right measure here.", "Direction is exactly what it measures.", "Both vectors share a dimension count."]),
      q("Can vectors from two separately trained models be compared?", ["No, each run picks its own arbitrary orientation", "Yes, if the architectures match", "Yes, after normalizing"], 0, "There is no shared frame of reference.", ["Correct. An alignment step would be needed first.", "Matching architecture does not align the spaces.", "Normalizing does not create a shared basis."]),
    ],
  },
  {
    lessonId: "py.mc.m6_1.l3",
    atomId: "py.atom.ml.contextual-embeddings",
    conceptId: "py.ml.contextual-embeddings",
    title: "One vector per word cannot be enough",
    requires: ["py.ml.embeddings"],
    vocabulary: [
      ["static embedding", "one fixed vector per token, whatever the sentence"],
      ["contextual embedding", "a representation computed from the token and its neighbours"],
      ["polysemy", "one word carrying several unrelated meanings"],
      ["averaged representation", "a single vector standing for a blend of distinct senses"],
    ],
    opening: "A static table gives every occurrence of a word the same vector, which forces one entry to represent every meaning that word has. For a word with two unrelated senses, the learned vector ends up representing neither.",
    outcome: "You will show why a static vector averages unrelated senses, and describe what conditioning on neighbours changes.",
    why: "This limitation is the reason the field moved from word vectors to models that read whole sentences. It also explains why retrieval systems embed passages rather than individual words.",
    mentalModel: "Picture one photograph that must serve as the portrait of two different people. Whatever it shows is a blur resembling neither, and the only fix is to take the picture after you know which person is present.",
    firstTitle: "The average of two senses resembles neither",
    firstIntro: "A static vector is pulled toward every context the word appeared in.",
    firstCode: `river_sense = [0.9, 0.1, 0.0]
money_sense = [0.0, 0.1, 0.9]

def average(vectors):
    width = len(vectors[0])
    return [round(sum(v[i] for v in vectors) / len(vectors), 3)
            for i in range(width)]

import math

def cosine(a, b):
    dot = sum(x * y for x, y in zip(a, b))
    size_a = math.sqrt(sum(x * x for x in a))
    size_b = math.sqrt(sum(y * y for y in b))
    return round(dot / (size_a * size_b), 4)

static = average([river_sense, money_sense])
print("static 'bank':", static)
print("cosine with river sense:", cosine(static, river_sense))
print("cosine with money sense:", cosine(static, money_sense))
print("the two senses themselves:", cosine(river_sense, money_sense))`,
    firstTrace: "The averaged vector sits between the two senses and matches each about equally well, which means it identifies neither. The two senses have almost nothing in common, so nothing between them is a good representation of either. Adding more training data does not fix this; it just refines the average.",
    secondTitle: "Conditioning on neighbours separates the senses",
    secondIntro: "Blending the token's vector with its context produces a different result in each sentence.",
    secondCode: `import math

def cosine(a, b):
    dot = sum(x * y for x, y in zip(a, b))
    size_a = math.sqrt(sum(x * x for x in a))
    size_b = math.sqrt(sum(y * y for y in b))
    return round(dot / (size_a * size_b), 4)

static = [0.45, 0.1, 0.45]
contexts = {
    "sat on the river bank": [0.9, 0.1, 0.0],
    "deposited it at the bank": [0.0, 0.1, 0.9],
}
river_sense = [0.9, 0.1, 0.0]

for sentence, context in contexts.items():
    contextual = [round(0.5 * s + 0.5 * c, 3) for s, c in zip(static, context)]
    print(f"{sentence:<26} -> {contextual}  "
          f"cosine with river sense {cosine(contextual, river_sense)}")`,
    secondTrace: "The same token produces two different vectors, each pulled toward the sense its sentence supports. The first matches the river meaning far more closely than the second does. A real model computes this blend with attention rather than a fixed average, but the effect being bought is exactly this one.",
    mistake: "Do not cache a contextual representation as if it were a property of the word. It describes that occurrence in that sentence, and reusing it elsewhere reintroduces the static-embedding problem while costing far more to compute.",
    checkpoint: "A retrieval system embeds individual words rather than whole passages. What goes wrong?",
    checkpointAnswer: "Every ambiguous word contributes its averaged vector, so a query about a financial institution matches passages about riversides. Embedding the whole passage lets each word's representation be conditioned on the others, which is what disambiguates it.",
    remember: "A static vector must average every sense a word has, so it represents none of them well. A contextual representation is computed per occurrence, from the token and its neighbours together.",
    checks: [
      q("What does a static embedding do with an ambiguous word?", ["Averages its senses into one vector that fits none well", "Stores one vector per sense", "Refuses to embed it"], 0, "The table has exactly one row per token.", ["Correct. More data refines the average rather than splitting it.", "That would require sense annotation.", "It embeds it, just poorly."]),
      q("What makes a representation contextual?", ["It is computed from the token together with its neighbours", "It is longer", "It is trained on more data"], 0, "The same token yields different vectors in different sentences.", ["Correct. Attention is how modern models compute the blend.", "Width is unrelated.", "Data volume does not change the mechanism."]),
      q("Why do retrieval systems embed passages rather than words?", ["Word vectors carry averaged senses that match the wrong passages", "Passages are shorter", "Word vectors are more expensive"], 0, "Context is what disambiguates.", ["Correct. Each word is conditioned on the others.", "Passages are longer, not shorter.", "Word vectors are cheaper and still worse here."]),
    ],
  },
];

export const ML_TEXT_REPRESENTATION_ATOMS = ML_TEXT_REPRESENTATION_SPECS.map(guidedMasteryAtom);
export const ML_TEXT_REPRESENTATION_CONCEPTS = ML_TEXT_REPRESENTATION_SPECS.map(guidedMasteryConcept);
export const ML_TEXT_REPRESENTATION_LESSON_CONTENT = guidedLessonContent(ML_TEXT_REPRESENTATION_SPECS);

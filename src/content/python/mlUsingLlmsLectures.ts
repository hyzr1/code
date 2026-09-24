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

const ML_USING_LLMS_SPECS: GuidedMasterySpec[] = [
  {
    lessonId: "py.mc.m6_5.l1",
    atomId: "py.atom.ml.prompting",
    conceptId: "py.ml.prompting",
    title: "A prompt is four parts, and one of them is a contract",
    requires: ["py.ml.pretrain-finetune"],
    vocabulary: [
      ["in-context learning", "adapting behaviour from the prompt without changing any weights"],
      ["output contract", "an exact statement of the format the answer must take"],
      ["evidence", "the material the answer must be based on, supplied in the prompt"],
      ["constraint", "a rule the answer must satisfy, stated rather than implied"],
    ],
    opening: "A prompt that fails is usually not too short. It is missing one of four things, and naming which one turns prompt writing from guesswork into a checklist.",
    outcome: "You will separate task, evidence, constraints and output contract, and see why the contract is the part that makes a prompt programmable.",
    why: "Anything built on a model needs its output parsed, and an unspecified format is the most common cause of a pipeline that works in testing and breaks in production.",
    mentalModel: "Picture briefing a capable contractor who has never met your company. They need the job, the materials, the rules, and the format the deliverable must arrive in. Leave any one out and you get something reasonable and unusable.",
    firstTitle: "The four parts, named",
    firstIntro: "Most failing prompts are missing one of these rather than being too brief.",
    firstCode: `PARTS = {
    "task": "Classify the sentiment of the review.",
    "evidence": "Review: the film dragged badly in the second half.",
    "constraints": "Use only the review. Do not infer beyond it.",
    "contract": "Reply with exactly one word: positive, negative, or mixed.",
}

for name, text in PARTS.items():
    print(f"{name:<12} {text}")

print()
print("assembled prompt:")
print("\\n".join(PARTS.values()))`,
    firstTrace: "Each part answers a different question, and dropping the contract is what makes the output unparseable. The constraint line is what stops the model bringing in knowledge the task did not authorize. Assembled, the four parts read as one instruction rather than four, which is how they should arrive.",
    secondTitle: "The contract is what makes it programmable",
    secondIntro: "A specified format can be validated; an unspecified one has to be guessed at.",
    secondCode: `def parse_strict(reply, allowed):
    cleaned = reply.strip().lower()
    if cleaned in allowed:
        return cleaned
    return None

allowed = {"positive", "negative", "mixed"}
replies = [
    "negative",
    "Negative",
    "The sentiment here is negative, though the acting was praised.",
    "I would say this leans negative.",
]

for reply in replies:
    parsed = parse_strict(reply, allowed)
    status = parsed if parsed else "UNPARSEABLE"
    print(f"{reply[:44]:<46} -> {status}")`,
    secondTrace: "Two of these parse and two do not, and the two that fail are perfectly good answers in prose. A contract turns that from a parsing problem into a prompting one, which is far easier to fix. Validating strictly and failing loudly is better than a lenient parser that quietly extracts the wrong word.",
    mistake: "Do not write a lenient parser to cope with a vague contract. It will succeed on the cases you tested and silently mis-extract on the ones you did not, and tightening the prompt is both easier and verifiable.",
    checkpoint: "A prompt reliably produces good answers that your code cannot use. Which part is missing?",
    checkpointAnswer: "The output contract. The task, evidence and constraints are all working, since the content is right, and only the format is unspecified. Stating the exact shape the answer must take is a one-line change that fixes it.",
    remember: "Task, evidence, constraints, contract. The contract is what lets the output be parsed and validated, and a vague one cannot be repaired downstream.",
    checks: [
      q("Which prompt part makes the output programmable?", ["The output contract", "The task description", "The evidence"], 0, "A specified format can be validated.", ["Correct. Without it, parsing is guesswork.", "The task decides content, not format.", "Evidence decides what the answer is about."]),
      q("What does in-context learning change?", ["Behaviour, without changing any weights", "The model's weights", "The tokenizer"], 0, "Everything happens in the prompt.", ["Correct. That is what makes it cheap to iterate.", "No training occurs.", "Tokenization is fixed."]),
      q("Output is right but unparseable. What should you fix?", ["The prompt's contract, not the parser", "The parser, to be more lenient", "The model choice"], 0, "A lenient parser fails silently later.", ["Correct. Tighten the format and validate strictly.", "Leniency hides mis-extraction.", "The model is producing good content."]),
    ],
  },
  {
    lessonId: "py.mc.m6_5.l2",
    atomId: "py.atom.ml.decoding-strategies",
    conceptId: "py.ml.decoding-strategies",
    title: "Decoding turns one distribution into many behaviours",
    requires: ["py.ml.prompting"],
    vocabulary: [
      ["temperature", "a divisor on the scores that flattens or sharpens the distribution"],
      ["top-k sampling", "keeping only the k highest-scoring tokens before sampling"],
      ["nucleus sampling", "keeping the smallest set whose probability reaches a threshold"],
      ["beam search", "carrying several partial sequences and keeping the best few"],
    ],
    opening: "The model produces a distribution over the next token and nothing else. Everything people describe as the model being creative or repetitive or deterministic is a decision made after that distribution, by code you control.",
    outcome: "You will apply temperature, top-k and nucleus filtering to the same distribution, and match each to the kind of task it suits.",
    why: "Choosing the wrong decoding setting produces problems that look like model failures. A structured extraction task sampling at high temperature will invent fields, and no amount of prompting fixes it.",
    mentalModel: "Picture a jar of numbered balls whose counts the model chose. Temperature changes how uneven the counts are, and the filters remove the rarest balls before you reach in.",
    firstTitle: "Temperature reshapes the whole distribution",
    firstIntro: "Dividing the scores before normalizing sharpens below one and flattens above it.",
    firstCode: `import math

def distribution(scores, temperature=1.0):
    scaled = [score / temperature for score in scores]
    top = max(scaled)
    raw = [math.exp(value - top) for value in scaled]
    total = sum(raw)
    return [round(value / total, 4) for value in raw]

scores = [3.0, 2.0, 1.0, 0.5, -1.0]
for temperature in (0.5, 1.0, 2.0, 5.0):
    print(f"temperature {temperature:>4}: {distribution(scores, temperature)}")

print()
print("low temperature concentrates; high temperature spreads")`,
    firstTrace: "At half a degree the top token takes eighty-six per cent, and at five it takes twenty-eight. The ordering never changes, only how sharply the leader is preferred. A temperature approaching zero is greedy decoding, and one approaching infinity is a uniform choice.",
    secondTitle: "Filters cut the tail before sampling",
    secondIntro: "Top-k keeps a fixed count and nucleus keeps a variable one, chosen by mass.",
    secondCode: `import math

def distribution(scores, temperature=1.0):
    scaled = [score / temperature for score in scores]
    top = max(scaled)
    raw = [math.exp(value - top) for value in scaled]
    total = sum(raw)
    return [value / total for value in raw]

def top_k(probabilities, k):
    order = sorted(range(len(probabilities)), key=lambda i: -probabilities[i])
    keep = set(order[:k])
    kept = [p if i in keep else 0.0 for i, p in enumerate(probabilities)]
    total = sum(kept)
    return [round(p / total, 4) for p in kept]

def nucleus(probabilities, threshold):
    order = sorted(range(len(probabilities)), key=lambda i: -probabilities[i])
    keep = set()
    running = 0.0
    for index in order:
        keep.add(index)
        running += probabilities[index]
        if running >= threshold:
            break
    kept = [p if i in keep else 0.0 for i, p in enumerate(probabilities)]
    total = sum(kept)
    return [round(p / total, 4) for p in kept]

base = distribution([3.0, 2.0, 1.0, 0.5, -1.0])
print("base:      ", [round(p, 4) for p in base])
print("top-k, k=3:", top_k(base, 3))
print("nucleus 0.9:", nucleus(base, 0.9))
print("nucleus 0.5:", nucleus(base, 0.5))`,
    secondTrace: "Top-k always keeps exactly three options whatever the distribution looks like. Nucleus keeps three when the mass is spread and one when the leader already exceeds the threshold, which is the property that makes it adapt. A confident distribution therefore becomes deterministic under nucleus sampling and stays random under top-k.",
    mistake: "Do not sample at a high temperature for extraction or classification. Those tasks want the most likely answer, and sampling from the tail produces invented fields and labels that were never in the input.",
    checkpoint: "A structured extraction pipeline occasionally invents field values. What would you change first?",
    checkpointAnswer: "The decoding settings, before touching the prompt. Extraction wants greedy decoding or a temperature near zero, and any sampling from the tail will eventually produce a plausible value that was not in the source. It is a decoding problem wearing the appearance of a hallucination problem.",
    remember: "Temperature reshapes the distribution, top-k keeps a fixed count, and nucleus keeps a variable one chosen by mass. Deterministic tasks want greedy decoding, not a better prompt.",
    checks: [
      q("What does temperature change?", ["How sharply the leading token is preferred", "The ordering of the tokens", "The vocabulary size"], 0, "Only the sharpness changes.", ["Correct. Near zero it becomes greedy decoding.", "The ordering is unaffected.", "The vocabulary is fixed."]),
      q("How does nucleus sampling differ from top-k?", ["It keeps a variable number chosen by probability mass", "It keeps more tokens", "It ignores the probabilities"], 0, "A confident distribution collapses to one option.", ["Correct. That adaptivity is the point.", "It may keep fewer or more.", "Mass is exactly what it reads."]),
      q("An extraction task invents field values. What is the first fix?", ["Decode greedily instead of sampling", "Rewrite the prompt", "Use a larger model"], 0, "Sampling from the tail eventually invents something.", ["Correct. It is a decoding problem, not a prompting one.", "The prompt may be fine.", "Size does not remove tail sampling."]),
    ],
  },
  {
    lessonId: "py.mc.m6_5.l3",
    atomId: "py.atom.ml.demonstrations",
    conceptId: "py.ml.demonstrations",
    title: "Examples and working, when they measurably help",
    requires: ["py.ml.decoding-strategies"],
    vocabulary: [
      ["demonstration", "a worked example placed in the prompt"],
      ["reasoning trace", "intermediate work produced before the final answer"],
      ["format anchoring", "examples teaching the output shape more than the task"],
      ["measured improvement", "a change confirmed against a held-out set rather than assumed"],
    ],
    opening: "Adding examples and asking for working both help on some tasks and cost tokens on all of them. The useful question is not whether they help in general but whether they help on yours, which is a measurement rather than an opinion.",
    outcome: "You will distinguish what demonstrations actually teach, identify where intermediate work helps, and insist on a held-out comparison.",
    why: "Prompt techniques accumulate in production systems and are rarely removed, because nobody measured whether each one earned its tokens. Knowing what each is for makes that audit possible.",
    mentalModel: "Picture showing a new colleague two completed forms. They learn the format immediately and the judgement barely at all, which is exactly the split worth expecting.",
    firstTitle: "Demonstrations teach format more than task",
    firstIntro: "Their strongest and most reliable effect is on the shape of the answer.",
    firstCode: `EXAMPLES = [
    ("the plot dragged", "negative"),
    ("stunning photography", "positive"),
]

def build_prompt(examples, query):
    lines = ["Classify each review."]
    for text, label in examples:
        lines.append(f"Review: {text}")
        lines.append(f"Label: {label}")
    lines.append(f"Review: {query}")
    lines.append("Label:")
    return "\\n".join(lines)

print(build_prompt(EXAMPLES, "the score was forgettable"))
print()
print("the trailing 'Label:' is what makes the shape unambiguous")`,
    firstTrace: "The examples establish exactly what a reply looks like, which is a one-word label on its own line. That format signal is the effect you can rely on. Whether two examples also teach the model something about sentiment is far less certain and depends entirely on the task.",
    secondTitle: "Intermediate work helps where the answer needs steps",
    secondIntro: "Tasks with a chain of dependent decisions benefit; lookups and classifications usually do not.",
    secondCode: `TASKS = [
    ("arithmetic word problem", "helps a lot", "answer depends on several dependent steps"),
    ("multi-hop question", "helps a lot", "each hop must be resolved before the next"),
    ("sentiment label", "no measurable gain", "one judgement, no intermediate state"),
    ("format conversion", "no measurable gain", "mechanical, with nothing to reason about"),
    ("fact lookup", "can hurt", "invites plausible reasoning toward a wrong recall"),
]

print(f"{'task':<26}{'effect':<20}why")
for task, effect, reason in TASKS:
    print(f"{task:<26}{effect:<20}{reason}")

print()
print("every one of these is a claim to verify on your own held-out set")`,
    secondTrace: "Tasks needing several dependent steps gain the most, because the intermediate state has somewhere to live. A single judgement gains nothing, since there is no chain to externalize. Lookups can get worse, as fluent reasoning toward a confidently wrong recall is more convincing than a short wrong answer.",
    mistake: "Do not keep a prompt technique because it is standard practice. Every example and every request for working costs tokens on every call, and the only way to know whether yours earns that is a comparison against a held-out set with the technique removed.",
    checkpoint: "Adding examples improved your outputs. What did you probably actually fix?",
    checkpointAnswer: "The output format, which is the effect demonstrations produce most reliably. Confirming that means testing whether an explicit format instruction alone captures the same gain, since if it does, the examples are costing tokens on every call for nothing.",
    remember: "Demonstrations teach format most reliably. Intermediate work helps where the answer depends on several steps, and every technique should be measured against removing it.",
    checks: [
      q("What do demonstrations most reliably teach?", ["The shape of the output", "The task's underlying judgement", "The model's vocabulary"], 0, "Format is the effect you can count on.", ["Correct. Test whether a format instruction alone suffices.", "That effect is far less certain.", "Vocabulary is fixed by the tokenizer."]),
      q("Which task gains most from intermediate work?", ["One whose answer depends on several dependent steps", "A single classification", "A format conversion"], 0, "The intermediate state needs somewhere to live.", ["Correct. Multi-hop questions are the clearest case.", "One judgement has no chain to externalize.", "Mechanical tasks have nothing to reason about."]),
      q("How do you decide whether a prompt technique earns its tokens?", ["Compare against a held-out set with it removed", "Follow standard practice", "Check whether the output looks better"], 0, "It costs tokens on every call.", ["Correct. Removal is the comparison that matters.", "Practice accumulates unexamined.", "Looking better is not measuring."]),
    ],
  },
  {
    lessonId: "py.mc.m6_5.l4",
    atomId: "py.atom.ml.vector-search",
    conceptId: "py.ml.vector-search",
    title: "Vector search is cosine similarity at scale",
    requires: ["py.ml.demonstrations"],
    vocabulary: [
      ["normalized vector", "one scaled to unit length so only its direction remains"],
      ["dot product", "the similarity measure that equals cosine on normalized vectors"],
      ["approximate search", "trading exactness for speed when the index is large"],
      ["semantic gap", "retrieving on meaning rather than on shared words"],
    ],
    opening: "Keyword search fails whenever the question and the answer use different words for the same thing. Embedding both into one space and comparing directions closes that gap, and the whole mechanism is one arithmetic operation.",
    outcome: "You will normalize vectors, rank by dot product, and explain what an approximate index gives up.",
    why: "Retrieval is the foundation of every grounded system, and getting the normalization wrong produces rankings that quietly favour long documents rather than relevant ones.",
    mentalModel: "Picture arrows on a map, all shortened to the same length so only their direction matters. Two arrows pointing the same way are about the same thing, however far apart they started.",
    firstTitle: "Normalize once, then similarity is a dot product",
    firstIntro: "On unit vectors the dot product is exactly the cosine, so the expensive part is done up front.",
    firstCode: `import math

def normalize(vector):
    length = math.sqrt(sum(value * value for value in vector))
    return [value / length for value in vector]

def similarity(first, second):
    return sum(a * b for a, b in zip(first, second))

documents = {
    "cats":     [0.9, 0.1, 0.0],
    "dogs":     [0.8, 0.2, 0.1],
    "finance":  [0.0, 0.1, 0.9],
    "banking":  [0.1, 0.0, 0.95],
}
indexed = {name: normalize(vector) for name, vector in documents.items()}

for label, raw in (("pets", [0.85, 0.15, 0.05]), ("money", [0.05, 0.05, 0.9])):
    query = normalize(raw)
    ranked = sorted(indexed.items(), key=lambda item: -similarity(query, item[1]))
    print(f"query {label:<6}", [(name, round(similarity(query, vector), 3))
                                for name, vector in ranked])`,
    firstTrace: "Both queries rank the two related documents ahead of the two unrelated ones, and the gap between the groups is large. Normalizing at index time means each query costs one multiply-and-add per document rather than a square root as well. That is what makes scanning millions of vectors affordable at all.",
    secondTitle: "What an approximate index trades away",
    secondIntro: "Exact search reads every vector, and approximate search reads a fraction of them.",
    secondCode: `def exact_cost(documents, dimensions):
    return documents * dimensions

def approximate_cost(documents, dimensions, fraction):
    return int(documents * fraction) * dimensions

print(f"{'documents':>12}{'exact':>14}{'approx 1%':>14}{'speedup':>10}")
for documents in (10_000, 1_000_000, 100_000_000):
    exact = exact_cost(documents, 768)
    approximate = approximate_cost(documents, 768, 0.01)
    print(f"{documents:>12,}{exact:>14.3e}{approximate:>14.3e}{exact / approximate:>10.0f}x")

print()
print("the cost is recall: a relevant document in an unvisited region is missed")`,
    secondTrace: "Reading one per cent of the index is a hundred times faster and will sometimes miss a genuinely relevant document. That trade is almost always worth taking past a million vectors and almost never worth it under ten thousand. Measuring recall against an exact scan on a sample is how the setting gets chosen rather than guessed.",
    mistake: "Do not skip normalization and rank by raw dot product. Unnormalized vectors let length dominate the score, so the ranking rewards whatever happened to produce a long vector rather than whatever is relevant.",
    checkpoint: "Your retrieval consistently returns long documents regardless of the query. What is wrong?",
    checkpointAnswer: "The vectors are almost certainly not normalized, so the dot product is rewarding magnitude rather than direction. Scaling every vector to unit length at index time makes the score a genuine cosine, and the length bias disappears entirely.",
    remember: "Normalize at index time so similarity is one dot product. Approximate search buys speed by reading a fraction of the index and pays in recall you should measure.",
    checks: [
      q("Why normalize the vectors before indexing?", ["So the dot product equals the cosine and length stops mattering", "To save memory", "To speed up the model"], 0, "Unnormalized scores reward magnitude.", ["Correct. Otherwise long documents dominate the ranking.", "The storage is identical.", "The model is not involved at query time."]),
      q("What does approximate search give up?", ["Recall, since some regions are never visited", "Precision of the similarity values", "The ability to rank"], 0, "It reads a fraction of the index.", ["Correct. Measure it against an exact scan on a sample.", "The values it computes are exact.", "Ranking still works on what it visits."]),
      q("Retrieval always returns long documents. What is the likely cause?", ["The vectors are not normalized", "The index is too small", "The query is too short"], 0, "Length is dominating the dot product.", ["Correct. Normalize at index time.", "Size does not create a length bias.", "Query length is normalized away too."]),
    ],
  },
  {
    lessonId: "py.mc.m6_5.l5",
    atomId: "py.atom.ml.retrieval-augmented-generation",
    conceptId: "py.ml.retrieval-augmented-generation",
    title: "Grounding an answer in retrieved evidence",
    requires: ["py.ml.vector-search"],
    vocabulary: [
      ["chunk", "a passage small enough to retrieve and large enough to stand alone"],
      ["grounding", "requiring the answer to come from the supplied evidence"],
      ["citation", "naming which retrieved chunk supported a claim"],
      ["retrieval failure", "the answer being wrong because the right evidence was never fetched"],
    ],
    opening: "A model asked a question about your documents will answer from its training instead. Retrieval fixes that by putting the relevant passages in the prompt, and the failures that remain divide cleanly into two kinds worth separating.",
    outcome: "You will chunk with overlap, assemble a grounded prompt with citations, and attribute a wrong answer to retrieval or to generation.",
    why: "This is the most common architecture built on top of a model, and teams routinely tune the prompt when the retrieval was at fault. Separating the two failure modes is what makes the system improvable.",
    mentalModel: "Picture an open-book exam where somebody else chooses which pages you may see. A wrong answer means either the wrong pages were handed over, or you misread the right ones. Those two need entirely different fixes.",
    firstTitle: "Chunking, and why the overlap is there",
    firstIntro: "A fact split across a boundary is retrievable from neither side without overlap.",
    firstCode: `def chunk(tokens, size, overlap):
    if overlap >= size:
        raise ValueError("overlap must be smaller than the chunk size")
    chunks = []
    start = 0
    while start < len(tokens):
        chunks.append(tokens[start:start + size])
        if start + size >= len(tokens):
            break
        start += size - overlap
    return chunks

passage = list(range(10))
for overlap in (0, 1, 2):
    pieces = chunk(passage, 4, overlap)
    print(f"overlap {overlap}: {pieces}")

print()
print("with no overlap a fact spanning positions 3 and 4 sits in neither chunk whole")`,
    firstTrace: "Without overlap the boundaries fall between chunks and anything straddling one is split. One or two tokens of overlap makes each boundary appear inside some chunk in full. The cost is storing and searching slightly more text, which is almost always the cheaper side of the trade.",
    secondTitle: "Two failure modes, and how to tell them apart",
    secondIntro: "Check whether the answer was in the retrieved chunks before touching the prompt.",
    secondCode: `def diagnose(question, retrieved, answer, supporting_text):
    found = any(supporting_text in chunk for chunk in retrieved)
    if not found:
        return "retrieval failure: the evidence was never fetched"
    if supporting_text not in answer:
        return "generation failure: the evidence was there and unused"
    return "grounded"

retrieved_good = ["the refund window is 30 days", "shipping takes 2 days"]
retrieved_bad = ["shipping takes 2 days", "our offices are in Berlin"]

print(diagnose("how long to refund?", retrieved_bad,
               "refunds take 14 days", "30 days"))
print(diagnose("how long to refund?", retrieved_good,
               "refunds take 14 days", "30 days"))
print(diagnose("how long to refund?", retrieved_good,
               "the refund window is 30 days", "30 days"))`,
    secondTrace: "The first case never had the evidence, so no prompt change could have helped and the index or the query is at fault. The second had it and ignored it, which is a prompting or decoding problem. Running that check automatically over a sample of failures tells you which half of the system to work on.",
    mistake: "Do not evaluate a retrieval system on answer quality alone. That number mixes two independent failure modes, so it cannot tell you whether to improve the index or the prompt, and teams routinely spend weeks tuning the wrong one.",
    checkpoint: "A grounded system answers a question wrongly. What is the first thing to check?",
    checkpointAnswer: "Whether the correct evidence appeared in the retrieved chunks at all. If it did not, the fault is in chunking, embedding or the query, and no prompt change will help. If it did, the model had what it needed and the fault is in the prompt or decoding.",
    remember: "Chunk with overlap so nothing is split across a boundary, and require citations. Separate retrieval failures from generation failures before changing anything.",
    checks: [
      q("Why do chunks overlap?", ["A fact straddling a boundary would otherwise be in neither chunk whole", "To make the index smaller", "To speed up retrieval"], 0, "Boundaries fall somewhere regardless.", ["Correct. The cost is slightly more text stored.", "Overlap makes the index larger.", "It adds slightly to the search cost."]),
      q("A grounded answer is wrong. What do you check first?", ["Whether the right evidence was retrieved at all", "The prompt wording", "The temperature"], 0, "The two failure modes need different fixes.", ["Correct. No prompt change fixes missing evidence.", "That is the second check, not the first.", "Also downstream of retrieval."]),
      q("Why is answer quality alone a poor metric for a retrieval system?", ["It mixes retrieval and generation failures into one number", "It is expensive to compute", "It ignores latency"], 0, "The number cannot tell you what to fix.", ["Correct. Measure the two stages separately.", "Cost is not the objection.", "Latency is a separate concern entirely."]),
    ],
  },
];

export const ML_USING_LLMS_ATOMS = ML_USING_LLMS_SPECS.map(guidedMasteryAtom);
export const ML_USING_LLMS_CONCEPTS = ML_USING_LLMS_SPECS.map(guidedMasteryConcept);
export const ML_USING_LLMS_LESSON_CONTENT = guidedLessonContent(ML_USING_LLMS_SPECS);

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

const ML_PRETRAINED_SPECS: GuidedMasterySpec[] = [
  {
    lessonId: "py.mc.m6_4.l1",
    atomId: "py.atom.ml.masked-language-modeling",
    conceptId: "py.ml.masked-language-modeling",
    title: "Masked modelling buys context at the cost of signal",
    requires: ["py.ml.perplexity"],
    vocabulary: [
      ["masked language modelling", "hiding some tokens and predicting them from both sides"],
      ["mask rate", "the fraction of tokens replaced by the mask marker"],
      ["pretrain-finetune mismatch", "the mask marker appearing in training and never afterwards"],
      ["signal density", "how many supervised targets one sequence provides"],
    ],
    opening: "A causal model cannot use the words after the one it is predicting, which is a real handicap for understanding a sentence. Masking removes that handicap and introduces a different one, and the trade is worth stating precisely.",
    outcome: "You will apply a masking scheme with its replacement policy, and compare the training signal it gives against a causal objective.",
    why: "Bidirectional encoders remain the right choice for classification and retrieval, and the reason comes down to this trade. The eighty-ten-ten replacement policy also has a specific purpose worth knowing.",
    mentalModel: "Picture a cloze test rather than a dictation. Filling a gap lets you read both sides of it, which is easier, and you only get one question per gap rather than one per word.",
    firstTitle: "Mask, and mostly not with the marker",
    firstIntro: "Most masked positions get the marker, and the rest are replaced or left alone deliberately.",
    firstCode: `import random

def apply_masking(tokens, rate=0.15, seed=0):
    rng = random.Random(seed)
    corrupted = []
    targets = []
    for index, token in enumerate(tokens):
        if rng.random() < rate:
            roll = rng.random()
            if roll < 0.8:
                corrupted.append("[MASK]")
            elif roll < 0.9:
                corrupted.append(rng.choice(tokens))
            else:
                corrupted.append(token)
            targets.append((index, token))
        else:
            corrupted.append(token)
    return corrupted, targets

words = "the quick brown fox jumps over the lazy dog again today".split()
corrupted, targets = apply_masking(words, rate=0.3, seed=3)
print("input: ", corrupted)
print("targets:", targets)
print(f"{len(targets)} targets from {len(words)} tokens")`,
    firstTrace: "Selected positions are usually replaced by the marker, occasionally by a random word, and occasionally left as they were. The model cannot tell which case it is looking at, so it must build a representation for every position rather than only the marked ones. Leaving some unchanged is also what stops the model assuming a marker is always present.",
    secondTitle: "Counting the targets each objective supplies",
    secondIntro: "A causal model predicts every token, and a masked one predicts a small fraction.",
    secondCode: `def targets_per_sequence(length, objective, rate=0.15):
    if objective == "causal":
        return length - 1
    return max(1, round(rate * length))

print(f"{'length':>8}{'causal':>10}{'masked':>10}{'ratio':>8}")
for length in (100, 1000, 10000):
    causal = targets_per_sequence(length, "causal")
    masked = targets_per_sequence(length, "masked")
    print(f"{length:>8}{causal:>10}{masked:>10}{causal / masked:>8.1f}")

print()
print("the masked model sees both sides of every gap it predicts")`,
    secondTrace: "A causal objective extracts about six or seven times as many supervised targets from the same text. The masked objective spends that budget to let every prediction see context on both sides, which is what makes the representations better for understanding tasks. Raising the mask rate recovers signal and destroys the context the objective was buying.",
    mistake: "Do not raise the mask rate freely to get more training signal. Masking half the tokens leaves each prediction with far less context to work from, so the representations get worse even though the number of targets goes up.",
    checkpoint: "Why are ten per cent of selected positions left completely unchanged?",
    checkpointAnswer: "Because the mask marker never appears at fine-tuning or inference time, so a model that only builds good representations at marked positions is useless afterwards. Leaving some selected positions untouched means the model cannot tell which positions it will be scored on, so it represents all of them.",
    remember: "Masking buys context on both sides and pays in signal density. Most selected positions get the marker, and the rest are randomized or left alone so the model cannot rely on spotting it.",
    checks: [
      q("What does masked modelling gain over a causal objective?", ["Each prediction can use context on both sides", "More training targets per sequence", "Faster training"], 0, "That is what the lost signal buys.", ["Correct. It suits understanding tasks for that reason.", "It gets far fewer targets.", "Speed is comparable per token."]),
      q("Why are some selected positions left unchanged?", ["The mask marker never appears after pretraining", "It saves computation", "It balances the classes"], 0, "The model must not rely on spotting the marker.", ["Correct. Otherwise the representations are useless downstream.", "The cost is identical.", "No class balance is involved."]),
      q("What happens if the mask rate is raised to fifty per cent?", ["Each prediction has much less context, so representations get worse", "Training gets slower", "The model overfits"], 0, "Context is what the objective was buying.", ["Correct. More targets does not mean better ones.", "Speed is unaffected.", "Underfitting the context is the issue."]),
    ],
  },
  {
    lessonId: "py.mc.m6_4.l2",
    atomId: "py.atom.ml.autoregressive-pretraining",
    conceptId: "py.ml.autoregressive-pretraining",
    title: "Causal pretraining, and why it scaled",
    requires: ["py.ml.masked-language-modeling"],
    vocabulary: [
      ["autoregressive", "producing each token conditioned on everything already produced"],
      ["generative capability", "being able to produce text rather than only score it"],
      ["prompting", "steering a model by what precedes the text it produces"],
      ["scaling behaviour", "how quality changes as data, parameters and compute grow"],
    ],
    opening: "Causal pretraining and masked pretraining were direct competitors, and one of them turned out to have a property the other did not. A model trained to continue text can be asked to do a task simply by describing it first.",
    outcome: "You will contrast what each objective produces, and explain why generation and prompting came from the causal side.",
    why: "The reason today's general-purpose models are decoder-only is not that the architecture is better. It is that the objective produces a model you can talk to, and knowing that keeps the two ideas separate.",
    mentalModel: "Picture two students. One has practised filling gaps in sentences and is excellent at understanding them. The other has practised continuing them, and can therefore be handed a beginning and asked to finish it.",
    firstTitle: "Every token is a target, and the model can continue",
    firstIntro: "The same forward pass that trains the model is the one that generates from it.",
    firstCode: `def training_pairs(tokens):
    return [(tokens[:i], tokens[i]) for i in range(1, len(tokens))]

def generate(model, prompt, steps):
    produced = list(prompt)
    for _ in range(steps):
        key = tuple(produced[-2:])
        produced.append(model.get(key, "<unk>"))
    return produced

words = "the cat sat on the mat".split()
for context, target in training_pairs(words)[:3]:
    print(f"context {str(context):<26} -> {target}")

model = {("the", "cat"): "sat", ("cat", "sat"): "on",
         ("sat", "on"): "the", ("on", "the"): "mat"}
print()
print("generated:", " ".join(generate(model, ["the", "cat"], 4)))`,
    firstTrace: "Training and generation use the same conditional, differing only in whether the next token is read from the text or produced by the model. A masked model has no equivalent, because its predictions depend on tokens that do not exist yet during generation. That single asymmetry is where the whole capability difference comes from.",
    secondTitle: "A task description is just more context",
    secondIntro: "Because the model continues whatever precedes, the instruction and the input share one channel.",
    secondCode: `PROMPTS = {
    "translate": "Translate to French: cheese ->",
    "classify": "Review: the film was dull. Sentiment ->",
    "complete": "The capital of France is",
}

for name, prompt in PROMPTS.items():
    print(f"{name:<9} the model continues: {prompt!r}")

print()
print("none of these needed a new output layer or a labelled dataset")
print("a masked encoder needs a task-specific head for each of them")`,
    secondTrace: "Every one of these is the same operation, differing only in what precedes the continuation. An encoder would need a separate head and a labelled dataset for each task, trained separately. Collapsing all of them into one interface is what made general-purpose models possible, and it followed from the objective rather than the architecture.",
    mistake: "Do not conclude that decoder-only architectures are better at understanding. On equal budgets a bidirectional encoder is often stronger at classification, and the causal family won because one model can be steered to many tasks rather than because each task is done better.",
    checkpoint: "Why can a masked encoder not generate text the way a causal model does?",
    checkpointAnswer: "Because its predictions are conditioned on tokens on both sides, and during generation the right-hand side does not exist yet. Filling gaps requires a complete surrounding context, so the objective produces a model that scores text rather than one that continues it.",
    remember: "A causal model is trained on the exact operation generation needs, so the task description and the input share one channel. That interface, not the architecture, is what made the family general-purpose.",
    checks: [
      q("Why can a causal model generate when a masked one cannot?", ["Its predictions depend only on tokens that already exist", "It has more parameters", "Its architecture is different"], 0, "Masked predictions need both sides.", ["Correct. Training and generation use the same conditional.", "Size is not the difference.", "The block is the same in both."]),
      q("What does prompting exploit?", ["That the instruction and the input are both just preceding context", "A separate instruction encoder", "A fine-tuned classification head"], 0, "The model continues whatever came before.", ["Correct. One interface covers many tasks.", "No separate encoder exists.", "That is the encoder approach."]),
      q("Are decoder-only models better at classification?", ["Not necessarily; encoders are often stronger on equal budgets", "Yes, always", "Yes, because they are larger"], 0, "The causal family won on interface, not per-task quality.", ["Correct. Bidirectional context helps understanding tasks.", "The comparison depends on the task.", "Size is a separate variable."]),
    ],
  },
  {
    lessonId: "py.mc.m6_4.l3",
    atomId: "py.atom.ml.text-to-text",
    conceptId: "py.ml.text-to-text",
    title: "One interface: text in, text out",
    requires: ["py.ml.autoregressive-pretraining"],
    vocabulary: [
      ["text-to-text", "casting every task as producing an output string from an input string"],
      ["span corruption", "replacing whole spans with sentinel markers rather than single tokens"],
      ["sentinel token", "a unique marker standing for one removed span"],
      ["task prefix", "a short string naming which task the input belongs to"],
    ],
    opening: "Classification produces a label, translation a sentence, summarization a paragraph. Casting all three as producing a string collapses them into one model with one loss.",
    outcome: "You will apply span corruption with sentinels, and express a classification task as a text-to-text problem.",
    why: "Most modern systems adopted the unified interface, and span corruption beats masking single tokens. Both ideas outlived the model that introduced them.",
    mentalModel: "Picture one form with an input box and an output box. Every task is a matter of what you write in the first box, and the machinery never changes.",
    firstTitle: "Corrupt whole spans, not single tokens",
    firstIntro: "One sentinel replaces a run of tokens, and the target is the sentinel followed by what it hid.",
    firstCode: `def corrupt_spans(tokens, spans):
    covered = {i for start, length in spans for i in range(start, start + length)}
    starts = {start: length for start, length in spans}
    corrupted = []
    targets = []
    index = 0
    marker = 0
    while index < len(tokens):
        if index in starts:
            length = starts[index]
            corrupted.append(f"<X{marker}>")
            targets.append((f"<X{marker}>", tokens[index:index + length]))
            marker += 1
            index += length
        elif index in covered:
            index += 1
        else:
            corrupted.append(tokens[index])
            index += 1
    return corrupted, targets

words = "thank you for inviting me to your party last week".split()
corrupted, targets = corrupt_spans(words, [(2, 2), (6, 1)])
print("input: ", " ".join(corrupted))
print("target:", targets)`,
    firstTrace: "Two spans are removed and replaced by one sentinel each, so the input shrinks and the removed text moves to the target. The model produces the sentinel and its contents, so it learns where each span belonged. Removing runs rather than single tokens makes the objective more efficient.",
    secondTitle: "Every task written as a string pair",
    secondIntro: "A prefix names the task and the answer is text, whatever the task would normally return.",
    secondCode: `TASKS = [
    ("translate English to German: That is good.", "Das ist gut."),
    ("cola sentence: The course is jumping well.", "not acceptable"),
    ("stsb sentence1: A man is playing. sentence2: A man plays.", "4.4"),
    ("summarize: state authorities dispatched crews...", "storm crews deployed"),
]

for source, target in TASKS:
    print(f"in : {source}")
    print(f"out: {target}")
    print()

print("a similarity score is produced as the string '4.4', not as a number")`,
    secondTrace: "A label, a similarity score and a summary are all just strings the model produces. That removes every task-specific head, so one checkpoint serves all of them. The cost is that a number arrives digit by digit, which is odd and works well enough.",
    mistake: "Do not reuse one sentinel for several spans. Each removed span needs its own marker. Otherwise the target cannot say which text belonged where, and the model is guessing an alignment it was never shown.",
    checkpoint: "What does span corruption teach that single-token masking does not?",
    checkpointAnswer: "How much text was removed and where it belonged, since the model must produce a variable-length run for each sentinel rather than one token per gap. That makes each prediction harder and closer to the generation the model will actually be asked to do.",
    remember: "Cast every task as text in and text out, with a prefix naming the task. Corrupt whole spans, and give each one its own sentinel.",
    checks: [
      q("What does a sentinel token stand for?", ["One removed span, however long it was", "One removed token", "The end of the sequence"], 0, "The target reproduces the sentinel and its contents.", ["Correct. Each span needs its own marker.", "That would be single-token masking.", "Sequence ends are marked separately."]),
      q("How is a similarity score produced under a text-to-text interface?", ["As a string the model generates", "As a float from a regression head", "As a class index"], 0, "Every output is text.", ["Correct. That is what removes the task-specific heads.", "There is no separate head.", "Classes are also produced as strings."]),
      q("Why give each corrupted span its own sentinel?", ["The target must say which text belonged to which gap", "It compresses better", "Sentinels are cheap"], 0, "A shared marker loses the alignment.", ["Correct. The model would be guessing.", "Compression is not the aim.", "Cost is not the reason."]),
    ],
  },
  {
    lessonId: "py.mc.m6_4.l4",
    atomId: "py.atom.ml.pretrain-finetune",
    conceptId: "py.ml.pretrain-finetune",
    title: "Pretrain once, adapt many times",
    requires: ["py.ml.text-to-text"],
    vocabulary: [
      ["pretraining", "the large, general, self-supervised stage done once"],
      ["fine-tuning", "adapting a pretrained model to a specific task with labelled data"],
      ["catastrophic forgetting", "losing pretrained capability while adapting to a narrow task"],
      ["parameter-efficient tuning", "adapting with a small number of new or changed weights"],
    ],
    opening: "The expensive stage happens once and needs no labels. Every task afterwards starts from that checkpoint, which is why a project that would have needed millions of labelled examples now needs a few thousand.",
    outcome: "You will separate the two stages by what they cost and what they need, and choose an adaptation strategy from the data available.",
    why: "This split is the economic foundation of the whole field. Knowing which stage a problem belongs to decides whether you need a data-collection effort or an afternoon.",
    mentalModel: "Picture an education followed by a job induction. The education is long, general and expensive, and the induction is short and specific, and nobody repeats the education for each new job.",
    firstTitle: "Two stages, wildly different costs",
    firstIntro: "The stages differ in data, labels, duration and how often they are repeated.",
    firstCode: `STAGES = {
    "pretraining": {
        "data": "trillions of tokens of raw text",
        "labels": "none, the text supplies its own targets",
        "cost": "months of many machines, done once",
        "result": "general representations and capabilities",
    },
    "fine-tuning": {
        "data": "hundreds to hundreds of thousands of examples",
        "labels": "required, and usually written by people",
        "cost": "hours to days on one machine, done per task",
        "result": "one task done well",
    },
}

for stage, facts in STAGES.items():
    print(stage)
    for key, value in facts.items():
        print(f"  {key:<8} {value}")
    print()`,
    firstTrace: "Pretraining needs no labels and enormous compute, and fine-tuning needs labels and comparatively little. Reversing that expectation is where projects go wrong, since collecting a million labels is usually harder than renting the machines. The pretrained checkpoint is what turns a labelling problem into a much smaller one.",
    secondTitle: "How much to adapt, and how much to leave alone",
    secondIntro: "The dataset size decides whether full fine-tuning is affordable or destructive.",
    secondCode: `def strategy(examples, parameters_millions):
    if examples < 500:
        return "prompting or a frozen model with a small trained head"
    if examples < 20_000:
        return "parameter-efficient tuning, most weights frozen"
    if parameters_millions > 10_000:
        return "parameter-efficient tuning, full is rarely worth it"
    return "full fine-tuning at a small learning rate"

cases = [(200, 7_000), (5_000, 7_000), (100_000, 300), (100_000, 70_000)]
for examples, parameters in cases:
    print(f"{examples:>7} examples, {parameters:>6}M parameters -> "
          f"{strategy(examples, parameters)}")`,
    secondTrace: "A few hundred examples cannot support updating billions of weights, and trying destroys the pretrained capability rather than adding to it. Parameter-efficient methods change a small fraction of the weights and keep the rest exactly as they were. Full fine-tuning is reserved for cases where the data genuinely supports it and the model is small enough to be worth copying per task.",
    mistake: "Do not fully fine-tune a large model on a few hundred examples. The updates are dominated by a tiny, unrepresentative sample, and the general capability that made the checkpoint valuable is overwritten within an epoch.",
    checkpoint: "A team has 300 labelled examples and a general-purpose model. What should they try first?",
    checkpointAnswer: "Prompting, before any training at all. Three hundred examples cannot support updating a large model, and a well-chosen prompt with a few examples in it frequently matches what fine-tuning on that quantity would achieve, at no training cost and with the general capability intact.",
    remember: "Pretraining is expensive, unlabelled and done once; fine-tuning is cheap, labelled and done per task. Small datasets call for prompting or parameter-efficient methods rather than full fine-tuning.",
    checks: [
      q("What does pretraining need that fine-tuning does not?", ["Enormous compute and raw text with no labels", "Labelled examples", "A task-specific metric"], 0, "The text supplies its own targets.", ["Correct. That is what makes the scale affordable.", "Labels belong to the fine-tuning stage.", "Metrics are chosen per task later."]),
      q("What goes wrong fully fine-tuning a large model on 300 examples?", ["The pretrained capability is overwritten by a tiny sample", "Training takes too long", "The metric cannot be computed"], 0, "The updates are dominated by unrepresentative data.", ["Correct. Prompting or frozen weights are the answer.", "It would finish quickly.", "The metric is fine; the model is not."]),
      q("What does parameter-efficient tuning change?", ["A small fraction of the weights, leaving the rest untouched", "Every weight, slowly", "Only the tokenizer"], 0, "The pretrained capability is preserved.", ["Correct. It suits moderate datasets and large models.", "That is full fine-tuning.", "The tokenizer is fixed."]),
    ],
  },
];

export const ML_PRETRAINED_ATOMS = ML_PRETRAINED_SPECS.map(guidedMasteryAtom);
export const ML_PRETRAINED_CONCEPTS = ML_PRETRAINED_SPECS.map(guidedMasteryConcept);
export const ML_PRETRAINED_LESSON_CONTENT = guidedLessonContent(ML_PRETRAINED_SPECS);

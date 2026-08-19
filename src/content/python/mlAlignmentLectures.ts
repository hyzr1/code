import {
  guidedLessonContent,
  guidedMasteryAtom,
  guidedMasteryConcept,
  type GuidedMasterySpec,
} from "./guidedMastery";

const ML_ALIGNMENT_SPECS: GuidedMasterySpec[] = [
  {
    lessonId: "py.mc.m9_4.l1",
    atomId: "py.atom.ml.instruction-tuning",
    conceptId: "py.ml.instruction-tuning",
    title: "Instruction tuning and supervised fine-tuning",
    requires: ["py.ml.parameter-efficient-tuning"],
    vocabulary: [
      ["demonstration", "an input paired with the response the model should have produced"],
      ["response masking", "computing the loss only on the response, not on the prompt"],
      ["format compliance", "following the requested structure regardless of content"],
    ],
    opening:
      "A pretrained model continues text. Turning it into something that answers questions is supervised learning on demonstrations, and the details of the loss matter more than the volume.",
    outcome:
      "You will mask the loss to the response only, and measure how much of a demonstration set inconsistency destroys.",
    why:
      "The model already knows the content. What it is learning here is which of its many possible continuations is the one you wanted.",
    mentalModel:
      "Picture the model already able to write every plausible continuation. Instruction tuning is teaching it which one to pick, not teaching it new facts.",
    firstTitle: "Only the response counts",
    firstIntro:
      "Training on the prompt as well teaches the model to generate prompts. Masking those positions is a one-line change with a large effect.",
    firstCode: `def masked_positions(prompt_tokens, response_tokens):
    return [0] * prompt_tokens + [1] * response_tokens

def loss_from(mask, per_token_loss):
    counted = [l for m, l in zip(mask, per_token_loss) if m]
    return round(sum(counted) / len(counted), 4)

mask = masked_positions(4, 3)
per_token = [2.0, 2.0, 2.0, 2.0, 0.5, 0.4, 0.3]
print("mask", mask)
print("masked loss   ", loss_from(mask, per_token))
print("unmasked loss ", loss_from([1] * 7, per_token))`,
    firstTrace:
      "Zero point four against one point three one. The unmasked figure is dominated by prompt tokens the model is not meant to be learning to produce.",
    secondTitle: "Quality over volume",
    secondIntro:
      "A demonstration set teaches a style as much as a task. Inconsistent examples teach the model to be inconsistent, whatever their number.",
    secondCode: `sets = [("scraped", 1_000_000, 0.55),
        ("curated", 15_000, 0.95),
        ("mixed", 200_000, 0.70)]

for name, count, consistency in sets:
    retained = consistency ** 4
    print(f"{name:9} consistency {consistency} "
          f"retains {retained * 100:>5.1f}% of its value "
          f"({int(count * retained)} effective)")`,
    secondTrace:
      "The scraped set keeps nine percent of its value and the curated one keeps eighty-two. The model imitates the variance as readily as the content.",
    mistake:
      "Adding more data to fix a behaviour problem. If the demonstrations disagree about what a good answer looks like, more of them makes the disagreement stronger rather than weaker.",
    checkpoint:
      "Why is the loss computed only on the response?",
    checkpointAnswer:
      "Because the model is learning to produce responses, not prompts. Training on prompt positions teaches the wrong task and dilutes the signal.",
    remember:
      "Mask the prompt, and curate before you scale.",
    checks: [
      {
        question: "What does response masking exclude from the loss?",
        choices: [
          "The prompt tokens",
          "The rarest tokens",
          "The longest examples",
        ],
        answer: 0,
        explanation: "The model is not learning to generate those.",
        why: [
          "Correct. Only response positions count.",
          "Frequency is not the criterion.",
          "Length is unrelated.",
        ],
      },
      {
        question: "Why does inconsistency cost a demonstration set so much?",
        choices: [
          "The model imitates inconsistency as readily as content",
          "Small sets train faster",
          "Large sets overfit",
        ],
        answer: 0,
        explanation: "Think about what a demonstration teaches.",
        why: [
          "Correct. Disagreement in the data becomes disagreement in the model.",
          "Speed is not the argument.",
          "Overfitting is a different failure.",
        ],
      },
      {
        question: "A model gives inconsistent answers after fine-tuning. What is the first fix?",
        choices: [
          "Audit the demonstrations for disagreement",
          "Add more demonstrations",
          "Raise the learning rate",
        ],
        answer: 0,
        explanation: "More of a mixed signal is still mixed.",
        why: [
          "Correct. Consistency is the lever.",
          "That strengthens the disagreement.",
          "Optimisation is not the problem.",
        ],
      },
    ],
  },
  {
    lessonId: "py.mc.m9_4.l2",
    atomId: "py.atom.ml.rlhf",
    conceptId: "py.ml.rlhf",
    title: "Reinforcement learning from human feedback",
    requires: ["py.ml.instruction-tuning"],
    vocabulary: [
      ["preference pair", "two responses to the same prompt, one marked better"],
      ["reward model", "a model trained to score responses from preference pairs"],
      ["reward hacking", "raising the reward-model score while the true quality falls"],
    ],
    opening:
      "People find it far easier to say which of two answers is better than to write the best one. A reward model turns those comparisons into a score the policy can optimise.",
    outcome:
      "You will fit preferences with the standard comparison model and watch a policy hack the reward it was given.",
    why:
      "The reward model is a proxy trained on limited data. Optimising it hard enough always finds the places where it disagrees with what people actually wanted.",
    mentalModel:
      "Picture the reward model as a rough map of human preference. The policy is an explorer that will find every place the map is wrong.",
    firstTitle: "Comparisons become a score",
    firstIntro:
      "The probability that the better response is preferred is a logistic function of the score difference. Fitting that to the labels gives the reward model.",
    firstCode: `import math

def preference(chosen, rejected):
    return 1 / (1 + math.exp(-(chosen - rejected)))

for chosen, rejected in [(1.0, 0.0), (0.0, 0.0),
                         (0.0, 2.0), (5.0, 0.0)]:
    print(chosen, rejected, round(preference(chosen, rejected), 4))`,
    firstTrace:
      "A one-point margin gives seventy-three percent, a tie gives fifty and a two-point deficit gives twelve. Only the difference matters, never the absolute score.",
    secondTitle: "The proxy comes apart",
    secondIntro:
      "Optimising the reward model too far pushes the policy into regions the preference data never covered, where the proxy and the truth diverge.",
    secondCode: `def trajectory(steps):
    return [(step, round(0.0 + 0.1 * step, 2),
             round(1.0 - 0.02 * step, 3)) for step in range(steps)]

for step, proxy, true_quality in trajectory(6):
    print(f"step {step} reward-model score {proxy:>4} "
          f"true quality {true_quality}")`,
    secondTrace:
      "The reward-model score climbs steadily while true quality falls. Nothing in the training loop can see the second column.",
    mistake:
      "Optimising the reward model without a penalty for drifting from the starting policy. That penalty is the only thing keeping the policy inside the region where the reward model was ever trained.",
    checkpoint:
      "The reward score is rising and human ratings are falling. What is happening?",
    checkpointAnswer:
      "Reward hacking. The policy has found regions where the proxy disagrees with real preference, which is what the divergence penalty exists to prevent.",
    remember:
      "The reward model is a proxy — constrain how far you optimise it.",
    checks: [
      {
        question: "What does the reward model learn from?",
        choices: [
          "Pairs of responses with one marked better",
          "Absolute quality ratings",
          "The pretraining corpus",
        ],
        answer: 0,
        explanation: "Comparison is easier than scoring.",
        why: [
          "Correct, and only the score difference matters.",
          "Absolute ratings are far noisier to collect.",
          "The corpus has no preference labels.",
        ],
      },
      {
        question: "What is reward hacking?",
        choices: [
          "Raising the proxy score while true quality falls",
          "An attack on the training data",
          "Overfitting the reward model",
        ],
        answer: 0,
        explanation: "The training loop cannot see true quality.",
        why: [
          "Correct. It is the central failure of the method.",
          "No adversary is involved.",
          "The policy, not the reward model, is at fault.",
        ],
      },
      {
        question: "What does the divergence penalty do?",
        choices: [
          "Keeps the policy near where the reward model was trained",
          "Speeds up convergence",
          "Reduces memory",
        ],
        answer: 0,
        explanation: "The proxy is only valid in a region.",
        why: [
          "Correct. Without it the proxy is optimised out of validity.",
          "It slows progress deliberately.",
          "Memory is unaffected.",
        ],
      },
    ],
  },
  {
    lessonId: "py.mc.m9_4.l3",
    atomId: "py.atom.ml.direct-preference-optimization",
    conceptId: "py.ml.direct-preference-optimization",
    title: "Direct preference optimization",
    requires: ["py.ml.rlhf"],
    vocabulary: [
      ["implicit reward", "a reward expressed as the log-probability gap from a reference policy"],
      ["reference policy", "the frozen starting model the update is measured against"],
      ["margin", "how much more the policy prefers the chosen response than the reference does"],
    ],
    opening:
      "The reward model and the policy can be the same object. Writing the reward in terms of the policy itself removes the separate model and the online loop with it.",
    outcome:
      "You will compute the preference loss directly from four log-probabilities and read what its sign means.",
    why:
      "One training loop instead of three moving parts removes most of the operational difficulty, at the cost of some flexibility.",
    mentalModel:
      "Picture the reward as how much more the policy likes a response than the frozen reference does. Training pushes that gap up for chosen answers and down for rejected ones.",
    firstTitle: "Four numbers and a margin",
    firstIntro:
      "Take the policy and reference log-probabilities of both responses. The margin is the difference of differences, scaled by a temperature.",
    firstCode: `import math

def loss(policy_chosen, policy_rejected,
         reference_chosen, reference_rejected, beta=1.0):
    margin = beta * ((policy_chosen - reference_chosen)
                     - (policy_rejected - reference_rejected))
    return round(-math.log(1 / (1 + math.exp(-margin))), 4), round(margin, 4)

for values in [(-1.0, -2.0, -1.0, -1.0),
               (-2.0, -1.0, -1.0, -1.0),
               (-1.0, -1.0, -1.0, -1.0)]:
    print(values, loss(*values))`,
    firstTrace:
      "A positive margin of one gives a loss of zero point three one, a negative margin gives one point three one, and a zero margin gives the logarithm of two.",
    secondTitle: "What the temperature controls",
    secondIntro:
      "The scaling factor decides how far the policy is allowed to move from the reference. It plays the role the divergence penalty played in the reinforcement approach.",
    secondCode: `for beta in (0.01, 0.1, 1.0):
    value, margin = loss(-1.0, -2.0, -1.0, -1.0, beta=beta)
    print(f"beta {beta:>5} margin {margin:>6} loss {value}")`,
    secondTrace:
      "A small factor makes the loss almost flat, so the policy barely moves. A large one lets it move freely and drift from the reference.",
    mistake:
      "Treating it as strictly better than the reinforcement approach. It cannot use responses the policy did not generate, so it learns only from the preference set it was given rather than from its own current behaviour.",
    checkpoint:
      "What replaces the separate reward model here?",
    checkpointAnswer:
      "The policy itself. The reward is the log-probability gap between the policy and a frozen reference, so no second model is trained.",
    remember:
      "Reward as a log-probability gap; one loop instead of three.",
    checks: [
      {
        question: "What is the implicit reward?",
        choices: [
          "The log-probability gap between policy and reference",
          "A separately trained score",
          "The human label",
        ],
        answer: 0,
        explanation: "It is expressed through the policy itself.",
        why: [
          "Correct. That is what removes the second model.",
          "That is the reinforcement approach.",
          "Labels are pairwise, not scalar.",
        ],
      },
      {
        question: "What does the temperature factor control?",
        choices: [
          "How far the policy may drift from the reference",
          "The learning rate",
          "The batch size",
        ],
        answer: 0,
        explanation: "It plays the role of the divergence penalty.",
        why: [
          "Correct. Small values keep the policy close.",
          "The optimizer is separate.",
          "Batching is unrelated.",
        ],
      },
      {
        question: "What can the reinforcement approach do that this cannot?",
        choices: [
          "Learn from responses the current policy generates",
          "Use preference pairs",
          "Keep a reference model",
        ],
        answer: 0,
        explanation: "One method is online and the other is not.",
        why: [
          "Correct. That is the flexibility given up.",
          "Both use preference pairs.",
          "Both keep a reference.",
        ],
      },
    ],
  },
  {
    lessonId: "py.mc.m9_4.l4",
    atomId: "py.atom.ml.constitutional-methods",
    conceptId: "py.ml.constitutional-methods",
    title: "Constitutional methods and self-critique",
    requires: ["py.ml.direct-preference-optimization"],
    vocabulary: [
      ["principle", "an explicit written rule the model's output is checked against"],
      ["critique step", "asking the model which principles its own response violates"],
      ["revision loop", "rewriting a response against the critique and repeating"],
    ],
    opening:
      "Human labels are slow and expensive. If the rules are written down, the model can apply them to its own output and generate the supervision itself.",
    outcome:
      "You will run a critique-and-revise loop and see the violation count fall, along with what the loop cannot fix.",
    why:
      "Writing principles down makes the target auditable. Anyone can read what the model was asked to do, which no amount of preference data offers.",
    mentalModel:
      "Picture the model answering, then reading its own answer against a list of rules, then rewriting. The list is the thing under version control.",
    firstTitle: "Critique against explicit rules",
    firstIntro:
      "Each principle is a written check. The critique names which ones the response violates, and the revision addresses exactly those.",
    firstCode: `principles = ["be helpful", "avoid harm", "be honest"]

def critique(violations):
    return [p for p in principles if p in violations]

print(critique({"avoid harm"}))
print(critique({"avoid harm", "be honest"}))
print(critique(set()))`,
    firstTrace:
      "The critique names only the violated principles. Because the list is explicit, a disagreement about the output becomes a disagreement about the list.",
    secondTitle: "The loop converges",
    secondIntro:
      "Each revision addresses about half the remaining violations. A few rounds gets to zero, and further rounds do nothing.",
    secondCode: `def revise(rounds, violations):
    trace = []
    for _ in range(rounds):
        violations = max(0, violations - max(1, violations // 2))
        trace.append(violations)
    return trace

print(revise(5, 8))`,
    secondTrace:
      "Eight becomes four, two, one and then zero. The last two rounds change nothing, which is the signal to stop rather than to add principles.",
    mistake:
      "Assuming a principle the model cannot detect will be followed. The loop only fixes violations the critique step actually identifies, so a rule requiring knowledge the model lacks is decorative.",
    checkpoint:
      "What is the advantage of written principles over preference labels?",
    checkpointAnswer:
      "They are auditable. Anyone can read what the model was asked to do and argue about it, which preference data does not allow.",
    remember:
      "Write the rules down, critique against them, revise, repeat.",
    checks: [
      {
        question: "What generates the supervision in a constitutional method?",
        choices: [
          "The model critiquing its own output against written principles",
          "Human raters",
          "A separate reward model",
        ],
        answer: 0,
        explanation: "That is what makes it scalable.",
        why: [
          "Correct. Humans write the principles, not the labels.",
          "Humans are the bottleneck this avoids.",
          "No reward model is required.",
        ],
      },
      {
        question: "What is the main advantage over preference labels?",
        choices: [
          "The target is written down and auditable",
          "It needs less compute",
          "It is more accurate",
        ],
        answer: 0,
        explanation: "Think about disagreeing with the result.",
        why: [
          "Correct. Disagreement moves to the principle list.",
          "Compute is comparable.",
          "Accuracy depends on the principles.",
        ],
      },
      {
        question: "What happens to a principle the model cannot evaluate?",
        choices: [
          "It has no effect, because the critique never fires",
          "It is enforced anyway",
          "It causes an error",
        ],
        answer: 0,
        explanation: "The loop fixes only what it identifies.",
        why: [
          "Correct. Such a rule is decorative.",
          "Nothing enforces an undetected violation.",
          "The loop runs normally.",
        ],
      },
    ],
  },
  {
    lessonId: "py.mc.m9_4.l5",
    atomId: "py.atom.ml.red-teaming",
    conceptId: "py.ml.red-teaming",
    title: "Red-teaming and safety fine-tuning",
    requires: ["py.ml.constitutional-methods"],
    vocabulary: [
      ["attack category", "a class of failure such as extraction, injection or jailbreak"],
      ["coverage", "which categories have actually been tested"],
      ["mitigation rate", "the fraction of found failures that a fix actually removes"],
    ],
    opening:
      "Finding failures is not the hard part. Knowing which kinds you have not looked for, and proving a fix removed them, is where the work is.",
    outcome:
      "You will measure coverage across attack categories and the mitigation rate of a fix, and see why one without the other is misleading.",
    why:
      "A report of many findings in one category alongside silence in three others describes the testing, not the model.",
    mentalModel:
      "Picture a grid of attack categories. Findings cluster where you looked, and empty cells are ambiguous between safe and untested.",
    firstTitle: "Coverage before counts",
    firstIntro:
      "Group findings by category. A category with no findings is either safe or untested, and only the test log distinguishes them.",
    firstCode: `categories = ["prompt injection", "data extraction",
              "harmful content", "jailbreak"]
findings = [("jailbreak", "A1"), ("jailbreak", "A2"),
            ("harmful content", "B1")]

hits = {c: 0 for c in categories}
for category, _ in findings:
    hits[category] += 1

print(hits)
print("no findings:", [c for c in categories if hits[c] == 0])`,
    firstTrace:
      "Two categories have no findings at all. Reporting three findings without that list overstates what was actually examined.",
    secondTitle: "Did the fix work",
    secondIntro:
      "A mitigation is measured by rerunning the same attacks. A small reduction means the fix addressed the examples rather than the cause.",
    secondCode: `def mitigation(before, after):
    return round((before - after) / before * 100, 1)

for before, after in [(40, 4), (40, 38), (10, 0)]:
    print(f"{before} -> {after}: {mitigation(before, after)}% mitigated")`,
    secondTrace:
      "Ninety percent, five percent and a hundred. The five percent case patched the specific prompts and left the underlying behaviour untouched.",
    mistake:
      "Fine-tuning on the exact adversarial prompts that were found. The model learns those strings rather than the behaviour, and a paraphrase reopens the failure immediately.",
    checkpoint:
      "A category has zero findings. What does that tell you?",
    checkpointAnswer:
      "Nothing on its own. It is either safe or untested, and only the test log says which.",
    remember:
      "Report coverage with findings, and measure mitigation by rerunning.",
    checks: [
      {
        question: "A red-team report lists findings in one category only. What should you ask?",
        choices: [
          "Which categories were tested at all",
          "How many people tested",
          "How long testing took",
        ],
        answer: 0,
        explanation: "Findings cluster where you looked.",
        why: [
          "Correct. Coverage frames every count.",
          "Team size does not establish coverage.",
          "Duration says little about breadth.",
        ],
      },
      {
        question: "A fix reduces failures from forty to thirty-eight. What does that suggest?",
        choices: [
          "It addressed the examples rather than the cause",
          "The attacks were weak",
          "The model is safe",
        ],
        answer: 0,
        explanation: "A real fix removes most of the class.",
        why: [
          "Correct. Five percent is a patch, not a mitigation.",
          "The attacks clearly worked.",
          "Thirty-eight failures remain.",
        ],
      },
      {
        question: "Why not fine-tune on the exact prompts that were found?",
        choices: [
          "The model learns the strings, and paraphrases still work",
          "It is too slow",
          "It needs too much data",
        ],
        answer: 0,
        explanation: "Memorising an attack is not fixing it.",
        why: [
          "Correct. The behaviour has to change, not the lookup.",
          "It is fast; that is the temptation.",
          "The dataset is small by construction.",
        ],
      },
    ],
  },
];

export const ML_ALIGNMENT_ATOMS = ML_ALIGNMENT_SPECS.map(guidedMasteryAtom);
export const ML_ALIGNMENT_CONCEPTS = ML_ALIGNMENT_SPECS.map(guidedMasteryConcept);
export const ML_ALIGNMENT_LESSON_CONTENT = guidedLessonContent(ML_ALIGNMENT_SPECS);

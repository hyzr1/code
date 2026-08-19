import {
  guidedLessonContent,
  guidedMasteryAtom,
  guidedMasteryConcept,
  type GuidedMasterySpec,
} from "./guidedMastery";

const ML_AGENT_SPECS: GuidedMasterySpec[] = [
  {
    lessonId: "py.mc.m13_1.l1",
    atomId: "py.atom.ml.tools-environments",
    conceptId: "py.ml.tools-environments",
    title: "Tools and environments",
    requires: ["py.ml.edge-deployment"],
    vocabulary: [
      ["schema", "the declared shape of a tool call, checked before anything executes"],
      ["permission boundary", "what a tool is allowed to touch, enforced outside the model"],
      ["error recovery", "returning a message the model can act on rather than a stack trace"],
    ],
    opening:
      "Giving a model tools is giving it the ability to act. Everything that makes that safe lives in the layer between the model and the tool, not in the model.",
    outcome:
      "You will validate a tool call against a schema and see why an actionable error beats a correct one.",
    why:
      "A model asked to call a tool will produce something call-shaped whether or not it is valid. The schema is what stops a malformed call reaching the system.",
    mentalModel:
      "Picture the schema as a gate. Nothing passes without the required fields, the right types, and no fields nobody asked for.",
    firstTitle: "Check before executing",
    firstIntro:
      "Missing required fields, wrong types and unknown fields are three distinct failures, and each needs naming separately.",
    firstCode: `def validate(call, schema):
    problems = []
    for name, spec in schema.items():
        if spec["required"] and name not in call:
            problems.append(name + " missing")
        elif name in call and not isinstance(call[name], spec["type"]):
            problems.append(name + " wrong type")
    for name in call:
        if name not in schema:
            problems.append(name + " unknown")
    return problems

schema = {"path": {"type": str, "required": True},
          "limit": {"type": int, "required": False}}

print(validate({"path": "a.txt", "limit": 10}, schema))
print(validate({"limit": "ten"}, schema))
print(validate({"path": "a.txt", "extra": 1}, schema))`,
    firstTrace:
      "The valid call passes cleanly. The second reports both a missing path and a limit of the wrong type, which is two separate things to fix.",
    secondTitle: "Errors the model can use",
    secondIntro:
      "The model reads the error and decides what to do next. A message naming the field and the expected type is actionable; a stack trace is not.",
    secondCode: `def message(problems):
    if not problems:
        return "ok"
    return "fix and retry: " + "; ".join(problems)

print(message(validate({"path": "a.txt"}, schema)))
print(message(validate({"limit": "ten"}, schema)))
print(message(validate({}, schema)))`,
    secondTrace:
      "Each message names exactly what to change. The model's next call is a repair rather than a guess, which is the difference between one retry and several.",
    mistake:
      "Enforcing permissions in the prompt rather than in the tool layer. Instructions are advisory to a model and mandatory to a validator, so a boundary that matters has to live where it can be enforced.",
    checkpoint:
      "Why is a schema check needed when the model was told the correct format?",
    checkpointAnswer:
      "Because instructions are advisory. The model produces something call-shaped regardless, and only the validator can guarantee the shape.",
    remember:
      "Validate outside the model, and return errors it can act on.",
    checks: [
      {
        question: "Where must permission boundaries be enforced?",
        choices: [
          "In the tool layer, outside the model",
          "In the system prompt",
          "In the model's training",
        ],
        answer: 0,
        explanation: "Instructions are advisory to a model.",
        why: [
          "Correct. Only there can they be guaranteed.",
          "A prompt cannot enforce anything.",
          "Training shapes tendencies, not guarantees.",
        ],
      },
      {
        question: "What makes a tool error useful to an agent?",
        choices: [
          "It names the field and what was expected",
          "It includes a stack trace",
          "It is short",
        ],
        answer: 0,
        explanation: "The model has to decide what to do next.",
        why: [
          "Correct. The next call becomes a repair.",
          "A trace describes internals the model cannot act on.",
          "Brevity without specifics does not help.",
        ],
      },
      {
        question: "Which failures should a schema distinguish?",
        choices: [
          "Missing, wrong type, and unknown fields",
          "Only missing fields",
          "Only type errors",
        ],
        answer: 0,
        explanation: "Each needs a different repair.",
        why: [
          "Correct, and reporting all of them at once saves retries.",
          "Type errors need naming too.",
          "An unknown field signals a different misunderstanding.",
        ],
      },
    ],
  },
  {
    lessonId: "py.mc.m13_1.l2",
    atomId: "py.atom.ml.planning-memory",
    conceptId: "py.ml.planning-memory",
    title: "Planning, memory, and reflection",
    requires: ["py.ml.tools-environments"],
    vocabulary: [
      ["state", "information carried forward that changes what happens next"],
      ["grounded observation", "something the environment reported, rather than the model's commentary"],
      ["ungrounded reflection", "self-commentary that changes no subsequent action"],
    ],
    opening:
      "An agent that narrates its reasoning looks thoughtful. Whether any of that narration changes what it does next is a separate and testable question.",
    outcome:
      "You will separate the steps that changed an action from the ones that did not, and see how little of the transcript is load-bearing.",
    why:
      "Reflection tokens cost money and latency. The ones that change no action are pure overhead dressed as deliberation.",
    mentalModel:
      "Picture the transcript with every step that changed nothing removed. What is left is the actual plan, and it is usually much shorter.",
    firstTitle: "Which steps mattered",
    firstIntro:
      "Mark each step by whether the following action would have differed without it. That is the only test that distinguishes state from commentary.",
    firstCode: `steps = [
    {"text": "I should check the file", "changed_action": True},
    {"text": "This is an interesting problem", "changed_action": False},
    {"text": "The file was empty, try the backup", "changed_action": True},
    {"text": "Let me think carefully about this", "changed_action": False},
    {"text": "The backup has twelve rows", "changed_action": True},
]

useful = [s for s in steps if s["changed_action"]]
print("steps", len(steps), "load-bearing", len(useful),
      "share", round(len(useful) / len(steps) * 100, 1))`,
    firstTrace:
      "Three of five steps changed an action. The other two read as deliberation and would have left the trajectory identical.",
    secondTitle: "Grounded against generated",
    secondIntro:
      "Every load-bearing step here came from the environment. The two that changed nothing were the model talking to itself.",
    secondCode: `for step in steps:
    source = "environment" if step["changed_action"] else "self"
    print(f"{source:12} {step['text']}")`,
    secondTrace:
      "The observations drove the plan; the reflections did not. That correlation is worth checking rather than assuming, because it can go the other way.",
    mistake:
      "Adding a reflection step because it improved a benchmark. Verify it changes actions rather than only scores - a step that helps by consuming tokens before an answer is not planning.",
    checkpoint:
      "How do you tell useful state from ungrounded reflection?",
    checkpointAnswer:
      "Remove it and check whether the next action changes. If the trajectory is identical, it was commentary.",
    remember:
      "State is what changes the next action; everything else is narration.",
    checks: [
      {
        question: "What test distinguishes state from commentary?",
        choices: [
          "Whether removing it changes the next action",
          "Whether it is well written",
          "Whether it mentions the goal",
        ],
        answer: 0,
        explanation: "It has to be a counterfactual.",
        why: [
          "Correct, and much of a transcript fails it.",
          "Fluency is not the criterion.",
          "Mentioning the goal changes nothing by itself.",
        ],
      },
      {
        question: "Why do reflection steps that change nothing still matter?",
        choices: [
          "They cost tokens and latency",
          "They confuse the model",
          "They are always harmful",
        ],
        answer: 0,
        explanation: "Overhead is the cost.",
        why: [
          "Correct. Pure overhead dressed as deliberation.",
          "They are usually harmless, just wasteful.",
          "Harmless is not the same as free.",
        ],
      },
      {
        question: "A reflection step improves a benchmark score. Is it planning?",
        choices: [
          "Not necessarily; check whether it changes actions",
          "Yes, the score proves it",
          "No, scores are irrelevant",
        ],
        answer: 0,
        explanation: "Consuming tokens before answering can help for other reasons.",
        why: [
          "Correct. The action test is the one that settles it.",
          "A score improvement has several possible causes.",
          "Scores matter, they just do not identify the mechanism.",
        ],
      },
    ],
  },
  {
    lessonId: "py.mc.m13_1.l3",
    atomId: "py.atom.ml.multi-agent-orchestration",
    conceptId: "py.ml.multi-agent-orchestration",
    title: "Multi-agent orchestration",
    requires: ["py.ml.planning-memory"],
    vocabulary: [
      ["decomposition", "splitting a task into subtasks handled separately"],
      ["error compounding", "the accuracy of a chain falling as the product of its links"],
      ["verification", "checking a subtask's output before the next one depends on it"],
    ],
    opening:
      "Splitting a task across several agents sounds like parallelism. Without verification between the steps it is a chain, and chains multiply their error rates.",
    outcome:
      "You will compute how a chain's accuracy falls with its length and see verification restore it.",
    why:
      "A decomposition into eight unverified steps at ninety percent each lands under fifty. One capable agent doing the whole task beats it comfortably.",
    mentalModel:
      "Picture each subtask as a gate the work must pass. Unverified, every gate multiplies; verified, each one is repaired before the next.",
    firstTitle: "Unverified chains multiply",
    firstIntro:
      "Each subtask succeeds independently, so the chain succeeds only if all of them do. That is a product, and products fall fast.",
    firstCode: `def chain_accuracy(subtasks, per_agent):
    return round(per_agent ** subtasks, 4)

for subtasks in (1, 3, 8):
    print(subtasks, "subtasks at 0.9 each ->",
          chain_accuracy(subtasks, 0.9))
print("one capable agent doing all of it ->", 0.9)`,
    firstTrace:
      "Three subtasks land at seventy-three percent and eight at forty-three. The single agent at ninety beats every decomposition here.",
    secondTitle: "Verification breaks the chain",
    secondIntro:
      "If each subtask's output is checked and repaired before the next depends on it, the errors stop compounding.",
    secondCode: `def verified_accuracy(subtasks, per_agent, check_catches):
    survives = per_agent + (1 - per_agent) * check_catches
    return round(survives ** subtasks, 4)

for catches in (0.0, 0.8, 0.99):
    print("verifier catches", catches, "->",
          verified_accuracy(8, 0.9, catches))`,
    secondTrace:
      "Forty-three percent with no verification, eighty-five with a good verifier, and ninety-nine with a near-perfect one. The verifier, not the agents, is doing the work.",
    mistake:
      "Adding agents because the task has several parts. Decomposition pays only when each part can be verified independently; otherwise it is a longer chain with the same links.",
    checkpoint:
      "Eight subtasks at ninety percent each, unverified. What is the end-to-end accuracy?",
    checkpointAnswer:
      "About forty-three percent. The successes multiply, so a single agent at ninety percent is twice as good.",
    remember:
      "Decompose only where you can verify; otherwise the chain multiplies.",
    checks: [
      {
        question: "How do unverified subtask accuracies combine?",
        choices: ["They multiply", "They average", "The weakest wins"],
        answer: 0,
        explanation: "All of them must succeed.",
        why: [
          "Correct, which is why long chains collapse.",
          "Averaging would be far too generous.",
          "The product is below the weakest link.",
        ],
      },
      {
        question: "When does decomposition beat a single agent?",
        choices: [
          "When each subtask can be verified independently",
          "When there are many subtasks",
          "When the agents are identical",
        ],
        answer: 0,
        explanation: "Verification is what stops the compounding.",
        why: [
          "Correct. Without it the chain is worse.",
          "More subtasks makes it worse, not better.",
          "Identical agents change nothing.",
        ],
      },
      {
        question: "In a verified pipeline, what is doing most of the work?",
        choices: ["The verifier", "The agents", "The orchestrator"],
        answer: 0,
        explanation: "Compare the accuracies with and without it.",
        why: [
          "Correct. It took forty-three percent to ninety-nine.",
          "The agents were unchanged throughout.",
          "Routing does not repair errors.",
        ],
      },
    ],
  },
  {
    lessonId: "py.mc.m13_1.l4",
    atomId: "py.atom.ml.agent-evaluation",
    conceptId: "py.ml.agent-evaluation",
    title: "Long-horizon agent evaluation",
    requires: ["py.ml.multi-agent-orchestration"],
    vocabulary: [
      ["trajectory", "the full sequence of steps an agent took, not just its final answer"],
      ["cost per success", "total spend divided by the number of successful runs"],
      ["side effect", "a change the agent made to the world along the way"],
    ],
    opening:
      "A success rate says nothing about what an agent spent, what it broke, or whether it would do the same thing twice. All four have to be reported together.",
    outcome:
      "You will score a trajectory on four axes and compute the cost per success, which failures make much worse than the average suggests.",
    why:
      "Failed runs still consume tokens and still touch the world. Averaging cost over all runs hides how much a success actually costs.",
    mentalModel:
      "Picture the run as a path rather than an answer. What it touched on the way is as much a result as where it ended up.",
    firstTitle: "Score the whole path",
    firstIntro:
      "Walk the trajectory and accumulate the four quantities. The final step alone reports only one of them.",
    firstCode: `steps = [{"tokens": 900, "wrote": False},
         {"tokens": 1500, "wrote": True},
         {"tokens": 700, "recovered": True, "wrote": False},
         {"tokens": 1200, "wrote": True, "done": True}]

success = steps[-1].get("done", False)
cost = sum(s["tokens"] for s in steps)
recoveries = sum(1 for s in steps if s.get("recovered"))
side_effects = sum(1 for s in steps if s.get("wrote"))

print("success", success, "tokens", cost,
      "recoveries", recoveries, "writes", side_effects)`,
    firstTrace:
      "It succeeded, spent four thousand three hundred tokens, recovered from one failure and wrote twice. The success alone would have reported none of the last three.",
    secondTitle: "Cost per success, not per run",
    secondIntro:
      "Failed runs cost tokens too. Dividing the total spend by the successes is the number that matters for a budget.",
    secondCode: `runs = [{"success": True, "cost": 4300},
        {"success": False, "cost": 9800},
        {"success": True, "cost": 3900}]

total = sum(r["cost"] for r in runs)
wins = sum(1 for r in runs if r["success"])
print("mean cost per run    ", round(total / len(runs), 1))
print("cost per success     ", round(total / wins, 1))`,
    secondTrace:
      "Six thousand per run against nine thousand per success. The failed run was the most expensive of the three, which is the usual pattern.",
    mistake:
      "Reporting a success rate without side effects. An agent that succeeds and leaves four unintended writes behind may well be worse than one that fails cleanly.",
    checkpoint:
      "Why is cost per run misleading for an agent?",
    checkpointAnswer:
      "Failed runs consume tokens without producing anything, and they are often the longest. Dividing by successes is the honest figure.",
    remember:
      "Success, cost per success, recoveries and side effects — all four.",
    checks: [
      {
        question: "What does a success rate omit?",
        choices: [
          "Cost, recoveries and side effects",
          "The final answer",
          "The task definition",
        ],
        answer: 0,
        explanation: "Three of the four axes.",
        why: [
          "Correct, and all three change the decision.",
          "That is what it reports.",
          "The task is fixed by the benchmark.",
        ],
      },
      {
        question: "Why divide cost by successes rather than by runs?",
        choices: [
          "Failed runs spend tokens without producing anything",
          "Successes are more expensive",
          "It gives a smaller number",
        ],
        answer: 0,
        explanation: "Failures are often the longest runs.",
        why: [
          "Correct, and that is the budgeting figure.",
          "Failures usually cost more here.",
          "It gives a larger and more honest one.",
        ],
      },
      {
        question: "Why report side effects?",
        choices: [
          "An agent that succeeds and leaves unintended writes may be worse than one that fails cleanly",
          "They are easy to count",
          "They correlate with cost",
        ],
        answer: 0,
        explanation: "The path is part of the result.",
        why: [
          "Correct. What it touched is a result too.",
          "Ease of counting is not the reason.",
          "The correlation is weak and beside the point.",
        ],
      },
    ],
  },
];

export const ML_AGENT_ATOMS = ML_AGENT_SPECS.map(guidedMasteryAtom);
export const ML_AGENT_CONCEPTS = ML_AGENT_SPECS.map(guidedMasteryConcept);
export const ML_AGENT_LESSON_CONTENT = guidedLessonContent(ML_AGENT_SPECS);

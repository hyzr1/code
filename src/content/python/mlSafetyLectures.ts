import {
  guidedLessonContent,
  guidedMasteryAtom,
  guidedMasteryConcept,
  type GuidedMasterySpec,
} from "./guidedMastery";

const ML_SAFETY_SPECS: GuidedMasterySpec[] = [
  {
    lessonId: "py.mc.m10_3.l1",
    atomId: "py.atom.ml.alignment-problem",
    conceptId: "py.ml.alignment-problem",
    title: "The alignment problem",
    requires: ["py.ml.activation-steering"],
    vocabulary: [
      ["specification", "the objective actually written down and optimised"],
      ["intent", "what the specification was meant to capture"],
      ["Goodhart drift", "a measure ceasing to track the thing it stood for once it is optimised"],
    ],
    opening:
      "Every objective is a proxy for something you could not write down. Optimising it works until the optimiser finds the places where the two come apart.",
    outcome:
      "You will watch a proxy and the true quality diverge under optimisation, and separate what was specified from what was intended.",
    why:
      "This is not a failure of a particular objective. It is what happens to any measure that gets optimised hard enough.",
    mentalModel:
      "Picture two curves rising together. The proxy keeps climbing because that is what is being optimised; the true quality turns over at the point where the two stopped agreeing.",
    firstTitle: "The curves separate",
    firstIntro:
      "Track the optimised measure and the thing it stood for. Early on they move together, which is exactly what makes the divergence hard to catch.",
    firstCode: `for step in range(7):
    proxy = round(min(1.0, 0.40 + 0.12 * step), 3)
    true = round(0.40 + 0.12 * step if step < 3
                 else 0.76 - 0.09 * (step - 3), 3)
    print("step", step, "proxy", proxy, "true", true)`,
    firstTrace:
      "Both rise to point seven six, then the proxy continues to one while the true quality falls back to point four nine. The first three steps gave no warning.",
    secondTitle: "Specified against intended",
    secondIntro:
      "Write out what the objective actually says and what you meant. The difference in both directions is where the behaviour will end up.",
    secondCode: `specified = {"be helpful", "be brief"}
intended = {"be helpful", "be honest", "avoid harm"}

print("intended but unspecified:", sorted(intended - specified))
print("specified but unintended:", sorted(specified - intended))`,
    secondTrace:
      "Honesty and harm-avoidance are wanted and unstated; brevity is stated and was never the point. The optimiser will honour the second list and ignore the first.",
    mistake:
      "Treating the divergence as a bug in the objective to be patched. Patching moves the point where the curves separate rather than removing it, so the monitoring matters more than the patch.",
    checkpoint:
      "A proxy metric keeps improving while user satisfaction falls. What is happening?",
    checkpointAnswer:
      "The optimiser has passed the point where the proxy and the intent agree. The measure is no longer tracking what it was chosen to stand for.",
    remember:
      "Every objective is a proxy; watch for where it stops agreeing.",
    checks: [
      {
        question: "Why is early agreement between proxy and intent misleading?",
        choices: [
          "It gives no warning of where they will separate",
          "The measurements are noisy",
          "The proxy is wrong from the start",
        ],
        answer: 0,
        explanation: "The first steps looked fine.",
        why: [
          "Correct. The divergence appears only under harder optimisation.",
          "Noise is not the mechanism.",
          "It tracked intent correctly at first.",
        ],
      },
      {
        question: "What does patching the objective achieve?",
        choices: [
          "It moves the divergence point rather than removing it",
          "It solves the problem",
          "Nothing at all",
        ],
        answer: 0,
        explanation: "The new objective is also a proxy.",
        why: [
          "Correct, which is why monitoring is the durable answer.",
          "Any writable objective is still a proxy.",
          "Patches do help, temporarily.",
        ],
      },
      {
        question: "Which list will the optimiser honour?",
        choices: [
          "What was specified, including the parts you did not mean",
          "What was intended",
          "Both equally",
        ],
        answer: 0,
        explanation: "It optimises what is written.",
        why: [
          "Correct. Brevity gets pursued; honesty does not.",
          "Intent is not visible to the optimiser.",
          "Only the specification has any force.",
        ],
      },
    ],
  },
  {
    lessonId: "py.mc.m10_3.l2",
    atomId: "py.atom.ml.assurance-cases",
    conceptId: "py.ml.assurance-cases",
    title: "Specification, robustness, and assurance",
    requires: ["py.ml.alignment-problem"],
    vocabulary: [
      ["hazard", "a specific way the system could cause harm"],
      ["residual risk", "the hazards remaining after the mitigations are applied"],
      ["evidence strength", "how much a piece of evidence actually supports a claim"],
    ],
    opening:
      "Safe is not a property a system has. An assurance case names the hazards, the mitigation for each, and the risk you are knowingly accepting.",
    outcome:
      "You will compute residual risk from a hazard list and weigh evidence by what it actually establishes.",
    why:
      "A claim that a system is safe cannot be checked. A list of hazards with evidence and a stated residual can be.",
    mentalModel:
      "Picture a ledger. Each hazard has a probability, a mitigation or none, and a line of evidence. The bottom line is what you are accepting.",
    firstTitle: "What is left over",
    firstIntro:
      "Subtract the mitigated hazards and total the rest. That number is the claim, and it is never zero in a real system.",
    firstCode: `hazards = {"data leak": 0.02, "harmful output": 0.05,
           "prompt injection": 0.08, "denial of service": 0.01}

for mitigated in [set(), {"data leak", "harmful output"}, set(hazards)]:
    remaining = {h: r for h, r in hazards.items() if h not in mitigated}
    print("mitigated", len(mitigated),
          "residual", round(sum(remaining.values()), 4),
          sorted(remaining))`,
    firstTrace:
      "Sixteen hundredths unmitigated, nine after two mitigations, zero when everything is covered. The middle row is what a real assurance case looks like.",
    secondTitle: "Not all evidence is equal",
    secondIntro:
      "Weight each kind of evidence by what it establishes. A case resting on assertions has a number but no support.",
    secondCode: `weights = {"proof": 1.0, "test": 0.6,
           "review": 0.3, "assertion": 0.0}

for kinds in (["test", "review", "assertion"], ["proof", "test", "test"]):
    strength = sum(weights[k] for k in kinds) / len(kinds)
    print(kinds, round(strength, 3))`,
    secondTrace:
      "Point three against point seven three. The first case has three pieces of evidence and one of them is worth nothing.",
    mistake:
      "Listing only the hazards you have mitigations for. The list is then a description of your controls rather than of the risk, and the unmitigated hazards are the ones that matter.",
    checkpoint:
      "An assurance case reports zero residual risk. What should you suspect?",
    checkpointAnswer:
      "That the hazard list is incomplete. Real systems retain risk, so a zero means the enumeration stopped at what was already covered.",
    remember:
      "Enumerate hazards first, then mitigations, then state what is left.",
    checks: [
      {
        question: "What makes an assurance case checkable?",
        choices: [
          "Named hazards, evidence per hazard, and a stated residual",
          "A safety claim",
          "A test suite",
        ],
        answer: 0,
        explanation: "A bare claim cannot be evaluated.",
        why: [
          "Correct. Each part can be argued with.",
          "That is what it replaces.",
          "Tests are evidence, not the case.",
        ],
      },
      {
        question: "A case reports zero residual risk. What is the likely explanation?",
        choices: [
          "The hazard list is incomplete",
          "The system is safe",
          "The mitigations are strong",
        ],
        answer: 0,
        explanation: "Real systems retain risk.",
        why: [
          "Correct. The enumeration stopped too early.",
          "No deployed system reaches zero.",
          "Strength does not eliminate hazards.",
        ],
      },
      {
        question: "How much does an assertion contribute to evidence strength?",
        choices: ["Nothing", "As much as a review", "As much as a test"],
        answer: 0,
        explanation: "It establishes no fact.",
        why: [
          "Correct. It is a claim, not evidence for one.",
          "A review at least involves inspection.",
          "A test produces an observation.",
        ],
      },
    ],
  },
  {
    lessonId: "py.mc.m10_3.l3",
    atomId: "py.atom.ml.scalable-oversight",
    conceptId: "py.ml.scalable-oversight",
    title: "Scalable oversight",
    requires: ["py.ml.assurance-cases"],
    vocabulary: [
      ["sandwiching", "checking whether model assistance lifts a non-expert to expert judgement"],
      ["debate", "having models argue opposite sides so a weaker judge can decide"],
      ["oversight gap", "the distance between what a judge can check and what the model can do"],
    ],
    opening:
      "Evaluating an answer you could not have produced is the central difficulty. Oversight methods are attempts to make a weaker judge reliable anyway.",
    outcome:
      "You will run the sandwiching comparison and see how far iterated argument closes an oversight gap.",
    why:
      "Once model output exceeds what a rater can check directly, every evaluation and every preference label depends on this working.",
    mentalModel:
      "Picture three levels: an unaided non-expert, that non-expert with model help, and an expert. The question is whether the middle reaches the top.",
    firstTitle: "Sandwiching",
    firstIntro:
      "Measure the non-expert alone, the non-expert with assistance, and the expert. Assistance is working when the middle reaches the top.",
    firstCode: `for nonexpert, assisted, expert in [(0.61, 0.84, 0.93),
                                    (0.61, 0.95, 0.93)]:
    print("unaided", nonexpert, "assisted", assisted,
          "expert", expert,
          "lift", round(assisted - nonexpert, 3),
          "closed", assisted >= expert)`,
    firstTrace:
      "The first case lifts twenty-three points and still falls nine short of the expert. The second closes the gap, and only then is the assistance doing its job.",
    secondTitle: "Iterated argument",
    secondIntro:
      "Each round of argument surfaces something the judge could not see alone. The gains compound but shrink.",
    secondCode: `accuracy = 0.62
for rounds in range(5):
    print("rounds", rounds, "accuracy", round(accuracy, 4))
    accuracy = accuracy + (1 - accuracy) * 0.35`,
    secondTrace:
      "Sixty-two percent rising to ninety-three over four rounds, with each round closing about a third of the remaining gap. The returns diminish quickly.",
    mistake:
      "Reporting the lift from assistance without the expert baseline. A twenty-three point improvement that still misses the expert by nine is not oversight, and the lift alone cannot show that.",
    checkpoint:
      "Assistance lifts a non-expert from sixty-one to eighty-four percent, against an expert at ninety-three. Is oversight established?",
    checkpointAnswer:
      "No. The lift is real but the assisted judge is still nine points short, so it cannot substitute for the expert.",
    remember:
      "Measure against the expert, not against the unaided baseline.",
    checks: [
      {
        question: "What does sandwiching compare?",
        choices: [
          "Unaided non-expert, assisted non-expert, and expert",
          "Two models",
          "Two experts",
        ],
        answer: 0,
        explanation: "Three levels, not two.",
        why: [
          "Correct, and the middle must reach the top.",
          "The judges are people here.",
          "One expert baseline suffices.",
        ],
      },
      {
        question: "Why is the lift alone insufficient?",
        choices: [
          "A large lift can still fall short of the expert",
          "Lifts are hard to measure",
          "Experts disagree",
        ],
        answer: 0,
        explanation: "Twenty-three points still missed by nine.",
        why: [
          "Correct. The expert baseline is the standard.",
          "The lift is the easy measurement.",
          "Disagreement is a separate issue.",
        ],
      },
      {
        question: "How do the gains from successive rounds of argument behave?",
        choices: [
          "They compound but diminish",
          "They are constant",
          "They grow",
        ],
        answer: 0,
        explanation: "Each round closes a fraction of what remains.",
        why: [
          "Correct. Most of the gain arrives early.",
          "The remaining gap shrinks each time.",
          "Later rounds have less left to find.",
        ],
      },
    ],
  },
  {
    lessonId: "py.mc.m10_3.l4",
    atomId: "py.atom.ml.interpretability-for-safety",
    conceptId: "py.ml.interpretability-for-safety",
    title: "Interpretability for safety",
    requires: ["py.ml.scalable-oversight"],
    vocabulary: [
      ["internal evidence", "a signal read from the model's activations rather than its output"],
      ["base rate", "how often the thing being detected actually occurs"],
      ["alert budget", "how many alerts a team can actually investigate"],
    ],
    opening:
      "Reading a model's internals to catch a problem its output hides is appealing. Whether it helps depends on arithmetic that has nothing to do with interpretability.",
    outcome:
      "You will score an activation as an anomaly and compute the alert volume a low false-positive rate still produces at scale.",
    why:
      "A detector with a one-in-a-thousand false-positive rate is excellent and still unusable at ten million requests a day.",
    mentalModel:
      "Picture the detector as a filter over an enormous stream. Even a very fine filter passes a large absolute number when the stream is large enough.",
    firstTitle: "Scoring the anomaly",
    firstIntro:
      "Express the activation as a distance from its usual value in units of its usual spread. That is the score the threshold is applied to.",
    firstCode: `mean, spread = 0.5, 0.4
for activation in (0.5, 1.2, 4.8):
    print("activation", activation,
          "score", round(abs(activation - mean) / spread, 3))`,
    firstTrace:
      "Zero, one point seven five and ten point seven five. The third is far outside the usual range, which is what makes it worth investigating.",
    secondTitle: "The alert budget",
    secondIntro:
      "Multiply the false-positive rate by the request volume. That is how many alerts arrive before any true positive does.",
    secondCode: `volume = 10_000_000
for rate in (0.001, 0.01, 0.05):
    print("false-positive rate", rate,
          "-> alerts per day", int(rate * volume))`,
    secondTrace:
      "Ten thousand alerts a day at one in a thousand, and half a million at one in twenty. No team investigates ten thousand of anything.",
    mistake:
      "Presenting internal evidence as proof rather than as a signal. It is correlational, the mechanism is usually not established, and treating it as decisive puts weight on the least verified part of the system.",
    checkpoint:
      "A detector has a false-positive rate of one in a thousand. Is that good enough at ten million requests a day?",
    checkpointAnswer:
      "No. It produces ten thousand alerts a day, which exceeds any realistic investigation budget regardless of how good the rate sounds.",
    remember:
      "Multiply the rate by the volume before believing a detector is usable.",
    checks: [
      {
        question: "What does an anomaly score express?",
        choices: [
          "Distance from the usual value in units of the usual spread",
          "The raw activation",
          "The model's confidence",
        ],
        answer: 0,
        explanation: "It is a standardised distance.",
        why: [
          "Correct, which makes the threshold interpretable.",
          "The raw value has no scale.",
          "Confidence is an output, not an internal.",
        ],
      },
      {
        question: "Why can an excellent false-positive rate still be unusable?",
        choices: [
          "The absolute alert count scales with request volume",
          "The rate is measured wrongly",
          "Detectors are slow",
        ],
        answer: 0,
        explanation: "One in a thousand of ten million is ten thousand.",
        why: [
          "Correct. The budget is in alerts, not rates.",
          "The rate can be perfectly accurate.",
          "Speed is not the constraint.",
        ],
      },
      {
        question: "How should internal evidence be treated?",
        choices: [
          "As a correlational signal, not as proof",
          "As decisive",
          "As equivalent to a test",
        ],
        answer: 0,
        explanation: "The mechanism is usually not established.",
        why: [
          "Correct. It is the least verified part of the system.",
          "That puts weight where it is least earned.",
          "A test observes behaviour directly.",
        ],
      },
    ],
  },
  {
    lessonId: "py.mc.m10_3.l5",
    atomId: "py.atom.ml.governance-impact",
    conceptId: "py.ml.governance-impact",
    title: "Governance, ethics, and impact",
    requires: ["py.ml.interpretability-for-safety"],
    vocabulary: [
      ["accountable owner", "the named person or team answerable for a decision"],
      ["recourse", "a route for an affected person to contest or opt out of an outcome"],
      ["deployment context", "who is affected, on what terms, and with what alternatives"],
    ],
    opening:
      "Technical choices become policy the moment they are deployed. A refusal threshold is a decision about who gets served, whether or not anybody wrote it down that way.",
    outcome:
      "You will audit which decisions have an accountable owner and measure how many affected people have any recourse.",
    why:
      "A decision with no owner still gets made, by whoever happened to set the default, and nobody can be asked to justify it afterwards.",
    mentalModel:
      "Picture every threshold and filter as a policy with a constituency. The question is who chose it and who can appeal it.",
    firstTitle: "Who owns each decision",
    firstIntro:
      "List the decisions that shape behaviour and name an owner for each. The unowned ones are still decisions, made by default.",
    firstCode: `decisions = {"training data sources": "data team",
             "refusal thresholds": None,
             "deployment regions": "legal",
             "incident escalation": None}

unowned = sorted(d for d, owner in decisions.items() if owner is None)
print("unowned", unowned)
print("coverage", round(1 - len(unowned) / len(decisions), 3))`,
    firstTrace:
      "Half the decisions have no owner, and both are the ones that determine what happens when something goes wrong.",
    secondTitle: "Who can do anything about it",
    secondIntro:
      "Compare the number of people affected with the number who have a route to contest or leave. The gap is the population with no recourse.",
    secondCode: `affected, opted_out = 4_000_000, 120_000
print("affected", affected, "with recourse", opted_out)
print("without recourse",
      round((affected - opted_out) / affected * 100, 1), "percent")`,
    secondTrace:
      "Ninety-seven percent of affected people have no route at all. That figure belongs in the deployment review alongside the accuracy.",
    mistake:
      "Treating an ethics review as a stage that runs after the system is built. The decisions with the largest effect — what to train on, what to refuse, who to serve — are made early and are expensive to revisit.",
    checkpoint:
      "A refusal threshold has no named owner. What follows?",
    checkpointAnswer:
      "It still gets set, by whoever chose the default, and no one can be asked to justify or change it afterwards.",
    remember:
      "Name an owner for every decision, and count who has recourse.",
    checks: [
      {
        question: "What happens to a decision with no accountable owner?",
        choices: [
          "It is still made, by whoever set the default",
          "It is deferred",
          "It is escalated",
        ],
        answer: 0,
        explanation: "Defaults are decisions.",
        why: [
          "Correct, and nobody can be asked to justify it.",
          "Deferral is itself a choice.",
          "Escalation needs an owner to escalate to.",
        ],
      },
      {
        question: "Why report the share of affected people without recourse?",
        choices: [
          "It describes who bears the cost of an error",
          "It is a legal requirement everywhere",
          "It improves accuracy",
        ],
        answer: 0,
        explanation: "It belongs next to the accuracy figure.",
        why: [
          "Correct. It is the other half of the deployment picture.",
          "Requirements vary by jurisdiction.",
          "It is a measure, not an intervention.",
        ],
      },
      {
        question: "When should the impact questions be asked?",
        choices: [
          "Early, since the decisions with the largest effect are made first",
          "After deployment",
          "During the final review",
        ],
        answer: 0,
        explanation: "Training data and refusal policy are chosen early.",
        why: [
          "Correct, and they are expensive to revisit later.",
          "By then the choices are locked in.",
          "A final review cannot undo them.",
        ],
      },
    ],
  },
];

export const ML_SAFETY_ATOMS = ML_SAFETY_SPECS.map(guidedMasteryAtom);
export const ML_SAFETY_CONCEPTS = ML_SAFETY_SPECS.map(guidedMasteryConcept);
export const ML_SAFETY_LESSON_CONTENT = guidedLessonContent(ML_SAFETY_SPECS);

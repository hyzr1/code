import {
  guidedLessonContent,
  guidedMasteryAtom,
  guidedMasteryConcept,
  type GuidedMasterySpec,
} from "./guidedMastery";

const ML_OPEN_PROBLEMS_SPECS: GuidedMasterySpec[] = [
  {
    lessonId: "py.mc.m13_4.l1",
    atomId: "py.atom.ml.faithfulness",
    conceptId: "py.ml.faithfulness",
    title: "Hallucination, faithfulness, and truthfulness",
    requires: ["py.ml.scaling-science"],
    vocabulary: [
      ["unsupported claim", "an assertion the provided evidence does not establish"],
      ["unfaithful rationale", "a stated reason that is not the one the model actually used"],
      ["deception", "producing something known to be false, which requires knowing"],
    ],
    opening:
      "Three failures get called hallucination and they are different things. Separating them decides what evidence would settle each one.",
    outcome:
      "You will classify a failure from two observable facts and see why the third category needs something neither of them shows.",
    why:
      "A mitigation for unsupported claims does nothing about unfaithful reasoning, and neither addresses a model that knows better.",
    mentalModel:
      "Picture two independent questions: is the claim supported, and does the stated reasoning match the real one. The answers give four cases, not one.",
    firstTitle: "Two questions, four cases",
    firstIntro:
      "Support and faithfulness vary independently. A well-supported answer can come with a fabricated explanation.",
    firstCode: `def classify(supported, rationale_matches, intent_known):
    if not supported and rationale_matches:
        return "unsupported claim"
    if supported and not rationale_matches:
        return "unfaithful rationale"
    if not supported and not rationale_matches and intent_known:
        return "deception"
    return "no failure detected"

for supported, matches, known in [(False, True, False),
                                  (True, False, False),
                                  (False, False, True),
                                  (True, True, False)]:
    print(supported, matches, known, "->",
          classify(supported, matches, known))`,
    firstTrace:
      "An unsupported claim with honest reasoning, a supported claim with fabricated reasoning, and a case needing the third input. The last row is clean.",
    secondTitle: "The third category needs more",
    secondIntro:
      "Deception requires the model to have known better. Neither support nor faithfulness shows that, so it needs evidence about internal state.",
    secondCode: `cases = [("unsupported claim", "check against sources"),
         ("unfaithful rationale", "intervene and see if behaviour follows"),
         ("deception", "evidence the model represented the truth")]

for failure, evidence in cases:
    print(f"{failure:22} settled by: {evidence}")`,
    secondTrace:
      "Each failure needs different evidence. The first is a retrieval check, the second an intervention, and the third an interpretability claim.",
    mistake:
      "Calling every wrong output a hallucination. The word covers three failures with three different mitigations, so the label alone tells you nothing about what to do.",
    checkpoint:
      "A model gives a correct answer with reasoning that had nothing to do with it. What is that?",
    checkpointAnswer:
      "An unfaithful rationale. The claim is supported and the stated reasoning is not the reasoning used.",
    remember:
      "Unsupported, unfaithful and deceptive are three failures, not one.",
    checks: [
      {
        prompt: "What distinguishes an unfaithful rationale from an unsupported claim?",
        options: [
          "The claim is correct; the stated reasoning is not the real one",
          "The claim is wrong",
          "There is no evidence",
        ],
        answerIndex: 0,
        hint: "The two questions are independent.",
        explanations: [
          "Correct, and the mitigations differ entirely.",
          "That is the unsupported case.",
          "Evidence may be present and correctly used.",
        ],
      },
      {
        prompt: "Why is deception the hardest to establish?",
        options: [
          "It requires evidence the model represented the truth",
          "It is rare",
          "It is subjective",
        ],
        answerIndex: 0,
        hint: "Knowing better is an internal-state claim.",
        explanations: [
          "Correct, which makes it an interpretability question.",
          "Rarity is not the difficulty.",
          "It has a precise definition.",
        ],
      },
      {
        prompt: "What settles whether a rationale is faithful?",
        options: [
          "Intervene on the stated reason and see if behaviour follows",
          "Ask the model to explain again",
          "Check the answer against sources",
        ],
        answerIndex: 0,
        hint: "It has to be a causal test.",
        explanations: [
          "Correct. Explanations are cheap; interventions are not.",
          "A second explanation is subject to the same problem.",
          "That tests support, not faithfulness.",
        ],
      },
    ],
  },
  {
    lessonId: "py.mc.m13_4.l2",
    atomId: "py.atom.ml.distribution-shift",
    conceptId: "py.ml.distribution-shift",
    title: "Robustness and distribution shift",
    requires: ["py.ml.faithfulness"],
    vocabulary: [
      ["natural shift", "a change arising from the world moving on"],
      ["adversarial shift", "an input constructed specifically to break the model"],
      ["strategic shift", "people changing behaviour because the model is deployed"],
    ],
    opening:
      "Three kinds of shift, three very different magnitudes. Reporting robustness without saying which kind was tested says almost nothing.",
    outcome:
      "You will compare degradation under each kind and see the adversarial case dwarf the others.",
    why:
      "Natural shift is what most robustness papers measure, and strategic shift is what most real deployments actually face once people start responding to the system.",
    mentalModel:
      "Picture the input distribution drifting on its own, being attacked deliberately, and being gamed by people who benefit. Only the first of the three is accidental.",
    firstTitle: "Magnitudes differ by an order",
    firstIntro:
      "Take one model and one clean accuracy, then measure it under each kind of shift.",
    firstCode: `def degradation(clean, shifted):
    return round(clean - shifted, 4), round((clean - shifted) / clean * 100, 1)

for name, clean, shifted in [("natural", 0.91, 0.84),
                             ("adversarial", 0.91, 0.22),
                             ("strategic", 0.91, 0.58)]:
    print(f"{name:12}", degradation(clean, shifted))`,
    firstTrace:
      "Eight percent lost to natural drift, seventy-six to adversarial input and thirty-six to strategic behaviour. Same model, same clean score.",
    secondTitle: "Strategic shift is caused by you",
    secondIntro:
      "Natural drift would have happened anyway. Strategic shift exists because the model was deployed, so it grows with adoption.",
    secondCode: `for adoption in (0.05, 0.30, 0.80):
    gaming = round(0.45 * adoption, 3)
    print("adoption", adoption, "strategic degradation", gaming,
          "accuracy", round(0.91 - gaming, 3))`,
    secondTrace:
      "Two percent lost at five percent adoption and thirty-six at eighty. The model degrades as it succeeds, which no held-out set can predict.",
    mistake:
      "Testing robustness only against natural shift and reporting it as robustness. That measures the easiest of the three and says nothing about the two that involve people responding.",
    checkpoint:
      "Why can no held-out evaluation predict strategic shift?",
    checkpointAnswer:
      "It is caused by the deployment itself. The behaviour that produces it does not exist until people are responding to the model.",
    remember:
      "Natural, adversarial and strategic - say which one you measured.",
    checks: [
      {
        prompt: "Which shift is caused by the deployment itself?",
        options: ["Strategic", "Natural", "Adversarial"],
        answerIndex: 0,
        hint: "People respond to being scored.",
        explanations: [
          "Correct, and it grows with adoption.",
          "That would have happened anyway.",
          "That is deliberate attack, not response.",
        ],
      },
      {
        prompt: "Why is strategic shift invisible to a held-out set?",
        options: [
          "The behaviour producing it does not exist before deployment",
          "The set is too small",
          "It is hard to measure",
        ],
        answerIndex: 0,
        hint: "It is a response to the model.",
        explanations: [
          "Correct. No historical data contains it.",
          "Size does not help here.",
          "It is measurable once deployed.",
        ],
      },
      {
        prompt: "What does testing only natural shift establish?",
        options: [
          "Robustness to the easiest of the three",
          "General robustness",
          "Adversarial robustness",
        ],
        answerIndex: 0,
        hint: "Compare the magnitudes.",
        explanations: [
          "Correct, and it is usually reported as more.",
          "It covers one case of three.",
          "Adversarial degradation was ten times larger.",
        ],
      },
    ],
  },
  {
    lessonId: "py.mc.m13_4.l3",
    atomId: "py.atom.ml.superalignment",
    conceptId: "py.ml.superalignment",
    title: "Scalable oversight and superalignment",
    requires: ["py.ml.distribution-shift"],
    vocabulary: [
      ["load-bearing assumption", "the claim a proposal stops working without"],
      ["threat model", "the specific situation a proposal is meant to handle"],
      ["failure mode", "how a proposal breaks when its assumption does not hold"],
    ],
    opening:
      "Every oversight proposal rests on an assumption. Comparing proposals means comparing those assumptions, not their descriptions.",
    outcome:
      "You will state each proposal's load-bearing assumption alongside the failure that follows when it does not hold.",
    why:
      "Proposals are usually compared on ambition. The useful comparison is which assumption you find most likely to survive.",
    mentalModel:
      "Picture each proposal as a bet. Name the thing it is betting on, and the comparison becomes tractable.",
    firstTitle: "State the assumption",
    firstIntro:
      "Write the proposal, the claim it depends on, and what happens when the claim fails. All three, in one line each.",
    firstCode: `proposals = [
    ("debate", "judges can follow the arguments",
     "the judge is persuaded by rhetoric"),
    ("recursive reward", "decomposition preserves intent",
     "intent drifts across the decomposition"),
    ("interpretability", "internals are readable",
     "features are superposed and unreadable"),
]

for name, assumption, failure in proposals:
    print(f"{name:16} assumes: {assumption}")
    print(f"{'':16} fails if: {failure}")`,
    firstTrace:
      "Three proposals, three distinct bets. None of them is unconditionally better; they fail under different circumstances.",
    secondTitle: "Where the assumptions overlap",
    secondIntro:
      "Two proposals sharing an assumption are not independent. Combining them buys less than combining two that fail differently.",
    secondCode: `shared = {"debate": {"human judgement scales"},
          "recursive reward": {"human judgement scales"},
          "interpretability": {"internals are readable"}}

pairs = [("debate", "recursive reward"), ("debate", "interpretability")]
for a, b in pairs:
    common = shared[a] & shared[b]
    print(a, "+", b, "->",
          "shares an assumption" if common else "fails independently")`,
    secondTrace:
      "Debate and recursive reward both rest on human judgement scaling, so combining them does not hedge that risk. Pairing either with interpretability does.",
    mistake:
      "Comparing proposals on how much they promise. The promise is the easy part; the assumption is what determines whether it survives contact with a more capable model.",
    checkpoint:
      "Two oversight proposals both assume human judgement scales. What does combining them buy?",
    checkpointAnswer:
      "Little. They fail together under the same condition, so the combination does not hedge the assumption either of them rests on.",
    remember:
      "Compare assumptions and failure modes, not ambitions.",
    checks: [
      {
        prompt: "What should proposals be compared on?",
        options: [
          "Their load-bearing assumptions and failure modes",
          "How much they promise",
          "How well specified they are",
        ],
        answerIndex: 0,
        hint: "The bet, not the description.",
        explanations: [
          "Correct. That is the tractable comparison.",
          "Ambition is the easy part.",
          "Specification quality is secondary.",
        ],
      },
      {
        prompt: "Why does combining two proposals with a shared assumption help less?",
        options: [
          "They fail together under the same condition",
          "They cost more",
          "They contradict each other",
        ],
        answerIndex: 0,
        hint: "Hedging needs independent failures.",
        explanations: [
          "Correct. The shared risk is not hedged.",
          "Cost is a separate consideration.",
          "They can be perfectly compatible.",
        ],
      },
      {
        prompt: "What is the failure mode of interpretability-based oversight?",
        options: [
          "Features are superposed and not readable",
          "It is too slow",
          "It needs too much data",
        ],
        answerIndex: 0,
        hint: "Recall what superposition implies about neurons.",
        explanations: [
          "Correct, and superposition is the default rather than the exception.",
          "Speed is not the load-bearing issue.",
          "It reads a trained model rather than needing data.",
        ],
      },
    ],
  },
  {
    lessonId: "py.mc.m13_4.l4",
    atomId: "py.atom.ml.road-ahead",
    conceptId: "py.ml.road-ahead",
    title: "Where the field goes next",
    requires: ["py.ml.superalignment"],
    vocabulary: [
      ["maturity", "how well understood a problem is, separately from how important it is"],
      ["tractable contribution", "work a single person can complete and that someone will use"],
      ["measurement gap", "a question nobody can answer because nothing measures it"],
    ],
    opening:
      "The open problems are not equally open. Ranking them by how little is settled points at where a contribution is actually possible.",
    outcome:
      "You will rank open problems by maturity and identify what makes a contribution tractable rather than merely important.",
    why:
      "Importance and tractability are different axes. The most important problem is often the one where nobody can yet tell whether progress was made.",
    mentalModel:
      "Picture two axes: how much the problem matters, and how well anyone can measure progress on it. Work happens where both are usable.",
    firstTitle: "Rank by what is settled",
    firstIntro:
      "Score each problem by how much is understood rather than how much it matters. The least mature is where the measurement gap is widest.",
    firstCode: `problems = {"reliable evaluation": 0.30,
            "scalable oversight": 0.20,
            "sample efficiency": 0.50,
            "interpretability at scale": 0.25}

for name, maturity in sorted(problems.items(), key=lambda kv: kv[1]):
    print(f"{name:26} maturity {maturity}")
print("least settled:", min(problems, key=problems.get))`,
    firstTrace:
      "Scalable oversight is least settled and sample efficiency most. That ordering says nothing about which matters more.",
    secondTitle: "What makes a contribution possible",
    secondIntro:
      "A problem is workable when progress on it can be measured. Without that, effort and result are indistinguishable.",
    secondCode: `def tractable(has_metric, has_baseline, scoped_to_months):
    return has_metric and has_baseline and scoped_to_months

candidates = [("new oversight paradigm", False, False, False),
              ("better contamination detection", True, True, True),
              ("interpretability of one circuit", True, True, True)]

for name, metric, baseline, scoped in candidates:
    print(f"{name:32}", tractable(metric, baseline, scoped))`,
    secondTrace:
      "Two of the three are workable. The paradigm has no metric and no baseline, so nobody could tell whether the work succeeded.",
    mistake:
      "Choosing a problem by importance alone. Without a measure of progress the work cannot be evaluated, published or built on, however much the problem matters.",
    checkpoint:
      "What makes an open problem workable rather than just important?",
    checkpointAnswer:
      "A way to measure progress and a baseline to measure against. Without both, effort and result cannot be distinguished.",
    remember:
      "Pick where the problem matters and progress can be measured.",
    checks: [
      {
        prompt: "What does maturity measure?",
        options: [
          "How well understood a problem is",
          "How important it is",
          "How long it has been studied",
        ],
        answerIndex: 0,
        hint: "It is separate from importance.",
        explanations: [
          "Correct, and the two do not correlate.",
          "Importance is the other axis.",
          "Age does not imply understanding.",
        ],
      },
      {
        prompt: "What makes a contribution tractable?",
        options: [
          "A metric, a baseline, and a scope someone can finish",
          "Importance",
          "Novelty",
        ],
        answerIndex: 0,
        hint: "Progress has to be checkable.",
        explanations: [
          "Correct. All three are needed.",
          "Important and unmeasurable is a trap.",
          "Novelty without a metric is unevaluable.",
        ],
      },
      {
        prompt: "Why is a problem with no metric hard to work on?",
        options: [
          "Effort and result cannot be distinguished",
          "It is not interesting",
          "Nobody has tried",
        ],
        answerIndex: 0,
        hint: "Think about how you would know you succeeded.",
        explanations: [
          "Correct, and that blocks publication and reuse.",
          "It is often the most interesting kind.",
          "Many people usually have.",
        ],
      },
    ],
  },
];

export const ML_OPEN_PROBLEMS_ATOMS = ML_OPEN_PROBLEMS_SPECS.map(guidedMasteryAtom);
export const ML_OPEN_PROBLEMS_CONCEPTS = ML_OPEN_PROBLEMS_SPECS.map(guidedMasteryConcept);
export const ML_OPEN_PROBLEMS_LESSON_CONTENT = guidedLessonContent(ML_OPEN_PROBLEMS_SPECS);

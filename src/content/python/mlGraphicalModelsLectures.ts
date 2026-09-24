import {
  guidedLessonContent,
  guidedMasteryAtom,
  guidedMasteryConcept,
  type GuidedMasterySpec,
} from "./guidedMastery";

const ML_GRAPHICAL_SPECS: GuidedMasterySpec[] = [
  {
    lessonId: "py.mc.m11_2.l1",
    atomId: "py.atom.ml.directed-graphical-models",
    conceptId: "py.ml.directed-graphical-models",
    title: "Directed graphical models",
    requires: ["py.ml.bayesian-neural-networks"],
    vocabulary: [
      ["factorization", "writing a joint distribution as a product of local conditionals"],
      ["parent set", "the variables a node's conditional distribution depends on"],
      ["conditional independence", "two variables carrying no information about each other once a third is known"],
    ],
    opening:
      "A joint distribution over twenty binary variables has a million entries. A graph that says which variables actually depend on which reduces that to a handful.",
    outcome:
      "You will factorize a joint from a graph and count how many parameters the structure saves.",
    why:
      "The structure is the modelling assumption. Every missing edge is a claim of conditional independence, and those claims are what make the model estimable.",
    mentalModel:
      "Picture each variable as needing a table only over its parents. A node with two parents needs four rows; a node with none needs one.",
    firstTitle: "The graph is the factorization",
    firstIntro:
      "Each node contributes one conditional on its parents. Multiplying those conditionals reconstructs the joint exactly.",
    firstCode: `parents = {"rain": [], "sprinkler": ["rain"],
           "wet": ["rain", "sprinkler"], "slippery": ["wet"]}

terms = []
for node, given in parents.items():
    terms.append("P(" + node + ("|" + ",".join(given) if given else "") + ")")
print(" * ".join(terms))`,
    firstTrace:
      "Four local conditionals reconstruct the whole joint. Nothing about slipperiness mentions the sprinkler, because the graph says the wetness carries all of it.",
    secondTitle: "What the structure saves",
    secondIntro:
      "Count the free parameters per node against the parameters a full joint would need. The saving grows sharply with the variable count.",
    secondCode: `def factored(parents, arity=2):
    return sum(arity ** len(given) * (arity - 1)
               for given in parents.values())

print("factored parameters", factored(parents))
print("full joint parameters", 2 ** len(parents) - 1)`,
    secondTrace:
      "Nine against fifteen at four variables. At twenty variables with the same sparsity it is tens against a million, which is the difference between estimable and not.",
    mistake:
      "Reading a missing edge as no relationship. It asserts independence given the parents, so two variables with no edge can still be strongly correlated when nothing is conditioned on.",
    checkpoint:
      "What does a missing edge in the graph claim?",
    checkpointAnswer:
      "Conditional independence given the parents — not that the two variables are unrelated in general.",
    remember:
      "One conditional per node; every missing edge is an assumption.",
    checks: [
      {
        question: "What does each node contribute to the factorization?",
        choices: [
          "One conditional distribution given its parents",
          "One marginal distribution",
          "One entry of the joint table",
        ],
        answer: 0,
        explanation: "Its table is over its parents only.",
        why: [
          "Correct, and the product is the exact joint.",
          "Marginals do not reconstruct the joint.",
          "The point is to avoid the joint table.",
        ],
      },
      {
        question: "How many parameters does a node with two binary parents need?",
        choices: ["Four", "Two", "One"],
        answer: 0,
        explanation: "One free value per parent configuration.",
        why: [
          "Correct. Two parents give four configurations.",
          "That would be a single parent.",
          "That is a node with no parents.",
        ],
      },
      {
        question: "Two variables have no edge between them. Are they independent?",
        choices: [
          "Only conditionally, given the parents",
          "Yes, always",
          "No, never",
        ],
        answer: 0,
        explanation: "The claim is conditional.",
        why: [
          "Correct. Unconditionally they can be strongly correlated.",
          "Marginal independence is a different claim.",
          "The graph does assert something.",
        ],
      },
    ],
  },
  {
    lessonId: "py.mc.m11_2.l2",
    atomId: "py.atom.ml.undirected-graphical-models",
    conceptId: "py.ml.undirected-graphical-models",
    title: "Undirected graphical models",
    requires: ["py.ml.directed-graphical-models"],
    vocabulary: [
      ["potential", "a non-negative score over a group of variables, not itself a probability"],
      ["partition function", "the normalising sum over every joint configuration"],
      ["clique", "a set of variables that are all connected to each other"],
    ],
    opening:
      "When dependence is symmetric there is no natural direction to point the arrows. Undirected models drop the arrows and pay for it with a normaliser.",
    outcome:
      "You will compute a partition function from clique potentials and confirm the result is a distribution.",
    why:
      "That normaliser is a sum over every configuration, which is exactly the term that makes these models expensive.",
    mentalModel:
      "Picture each clique scoring the configurations it likes. Multiplying the scores gives an unnormalised weight, and one global sum turns weights into probabilities.",
    firstTitle: "Potentials are not probabilities",
    firstIntro:
      "Each clique contributes a score. The product over cliques is a weight, and the partition function is the sum of that weight over everything.",
    firstCode: `import itertools

variables = ["a", "b", "c"]
potentials = {("a", "b"): {(0, 0): 2.0, (0, 1): 1.0,
                           (1, 0): 1.0, (1, 1): 3.0},
              ("b", "c"): {(0, 0): 1.0, (0, 1): 2.0,
                           (1, 0): 2.0, (1, 1): 1.0}}

def weight(state):
    product = 1.0
    for clique, table in potentials.items():
        product *= table[tuple(state[v] for v in clique)]
    return product

total = sum(weight(dict(zip(variables, assignment)))
            for assignment in itertools.product([0, 1], repeat=3))
print("partition function", round(total, 4))`,
    firstTrace:
      "Twenty-one. No individual potential was a probability, and none of them summed to one on its own.",
    secondTitle: "Dividing gives a distribution",
    secondIntro:
      "Divide each weight by the partition function. The results are probabilities, and they sum to one by construction.",
    secondCode: `running = 0.0
for assignment in itertools.product([0, 1], repeat=3):
    state = dict(zip(variables, assignment))
    probability = weight(state) / total
    running += probability
    print(assignment, round(probability, 4))
print("sums to", round(running, 4))`,
    secondTrace:
      "Eight configurations summing to one. The most likely is one-one-zero at point two nine, which no single potential would have told you.",
    mistake:
      "Comparing potentials across models as if they were interpretable. Only ratios within one model mean anything, because the partition function differs and absorbs any rescaling.",
    checkpoint:
      "Why is the partition function expensive?",
    checkpointAnswer:
      "It sums over every joint configuration, so its cost grows exponentially with the number of variables.",
    remember:
      "Potentials score, the partition function normalises.",
    checks: [
      {
        question: "Is a clique potential a probability?",
        choices: [
          "No; it is an unnormalised score",
          "Yes, over its clique",
          "Yes, after taking logarithms",
        ],
        answer: 0,
        explanation: "It does not sum to one.",
        why: [
          "Correct. Only the normalised product is a distribution.",
          "It need not sum to one over the clique.",
          "Logarithms do not normalise anything.",
        ],
      },
      {
        question: "What does the partition function sum over?",
        choices: [
          "Every joint configuration of every variable",
          "Each clique separately",
          "The observed data",
        ],
        answer: 0,
        explanation: "That is why it is exponential.",
        why: [
          "Correct, and that is the central cost.",
          "Per-clique sums do not normalise the joint.",
          "It does not involve data at all.",
        ],
      },
      {
        question: "Can potentials be compared across two different models?",
        choices: [
          "No; each has its own normaliser",
          "Yes, directly",
          "Yes, if the cliques match",
        ],
        answer: 0,
        explanation: "Rescaling a potential changes nothing observable.",
        why: [
          "Correct. Only within-model ratios are meaningful.",
          "The scales are arbitrary.",
          "Matching cliques does not fix the normaliser.",
        ],
      },
    ],
  },
  {
    lessonId: "py.mc.m11_2.l3",
    atomId: "py.atom.ml.exact-inference",
    conceptId: "py.ml.exact-inference",
    title: "Exact inference",
    requires: ["py.ml.undirected-graphical-models"],
    vocabulary: [
      ["variable elimination", "summing out variables one at a time in a chosen order"],
      ["elimination order", "the sequence in which variables are removed, which decides the cost"],
      ["marginal", "the distribution of one variable with the others summed away"],
    ],
    opening:
      "Summing over every configuration is exponential. Summing out one variable at a time, in the right order, is often linear in the variable count.",
    outcome:
      "You will compute a marginal by brute force, then count what elimination would have cost instead.",
    why:
      "The saving comes entirely from the order. A bad order on the same graph is no better than enumerating everything.",
    mentalModel:
      "Picture summing out a variable and leaving a smaller factor behind. If the variable touched few others, the factor stays small.",
    firstTitle: "The brute-force marginal",
    firstIntro:
      "Enumerate every configuration, weight it by the factors, and accumulate by the value of the query variable.",
    firstCode: `import itertools

variables = ["a", "b", "c", "d"]
factors = [(("a", "b"), {(0,0): 2., (0,1): 1., (1,0): 1., (1,1): 3.}),
           (("b", "c"), {(0,0): 1., (0,1): 2., (1,0): 2., (1,1): 1.}),
           (("c", "d"), {(0,0): 3., (0,1): 1., (1,0): 1., (1,1): 2.})]

totals = {0: 0.0, 1: 0.0}
for assignment in itertools.product([0, 1], repeat=len(variables)):
    state = dict(zip(variables, assignment))
    value = 1.0
    for scope, table in factors:
        value *= table[tuple(state[v] for v in scope)]
    totals[state["d"]] += value

norm = totals[0] + totals[1]
print({k: round(v / norm, 4) for k, v in totals.items()})
print("terms enumerated", 2 ** len(variables))`,
    firstTrace:
      "Point five eight against point four two, from sixteen enumerated terms. Correct, and already at the limit of what enumeration can do.",
    secondTitle: "What the order buys",
    secondIntro:
      "On a chain, eliminating from one end leaves a factor over two variables at every step. The cost becomes linear rather than exponential.",
    secondCode: `for count in (4, 10, 30):
    elimination = count * 2 ** 2
    enumeration = 2 ** count
    print(count, "variables: elimination", elimination,
          "enumeration", enumeration)`,
    secondTrace:
      "At thirty variables elimination costs a hundred and twenty operations and enumeration costs over a billion. The graph is the same; only the order changed.",
    mistake:
      "Assuming elimination is always cheap. The cost is exponential in the largest intermediate factor, so a densely connected graph gives no saving whatever order you pick.",
    checkpoint:
      "What determines the cost of variable elimination?",
    checkpointAnswer:
      "The size of the largest intermediate factor, which is decided by the elimination order and the graph's connectivity.",
    remember:
      "Sum out one at a time, and the order is the whole game.",
    checks: [
      {
        question: "What does variable elimination avoid?",
        choices: [
          "Enumerating every joint configuration",
          "Computing any factors",
          "Normalising the result",
        ],
        answer: 0,
        explanation: "It works one variable at a time.",
        why: [
          "Correct, which is exponential in the variable count.",
          "It computes intermediate factors throughout.",
          "Normalisation still happens at the end.",
        ],
      },
      {
        question: "What sets the cost of an elimination order?",
        choices: [
          "The largest intermediate factor it creates",
          "The number of variables",
          "The number of factors",
        ],
        answer: 0,
        explanation: "Cost is exponential in that size.",
        why: [
          "Correct, and finding the best order is itself hard.",
          "A good order makes the count almost irrelevant.",
          "Factor count matters far less.",
        ],
      },
      {
        question: "The graph is densely connected. What follows?",
        choices: [
          "No elimination order gives a large saving",
          "Any order works well",
          "Elimination becomes exact only approximately",
        ],
        answer: 0,
        explanation: "Intermediate factors stay large.",
        why: [
          "Correct. Density, not order, is the obstacle.",
          "Density defeats every order.",
          "Elimination is always exact when it finishes.",
        ],
      },
    ],
  },
  {
    lessonId: "py.mc.m11_2.l4",
    atomId: "py.atom.ml.hidden-markov-models",
    conceptId: "py.ml.hidden-markov-models",
    title: "Hidden Markov models",
    requires: ["py.ml.exact-inference"],
    vocabulary: [
      ["latent state", "an unobserved variable the observations depend on"],
      ["forward pass", "accumulating the probability of the observations up to each position"],
      ["path enumeration", "summing over every possible sequence of hidden states"],
    ],
    opening:
      "A sequence of three observations over two hidden states has eight possible paths. At thirty observations it has a billion, and the forward pass never enumerates any of them.",
    outcome:
      "You will compute a sequence likelihood by the forward recursion and confirm it equals the sum over all paths.",
    why:
      "It is the clearest case of dynamic programming replacing enumeration, and the same recursion underlies every sequence-model inference.",
    mentalModel:
      "Picture carrying one number per hidden state forward through the sequence. Each step folds in a transition and an observation, and the paths are summed implicitly.",
    firstTitle: "The forward recursion",
    firstIntro:
      "Start with the initial distribution weighted by the first observation. Each step multiplies by the transitions and the next observation.",
    firstCode: `states = ["healthy", "fever"]
start = {"healthy": 0.6, "fever": 0.4}
transition = {"healthy": {"healthy": 0.7, "fever": 0.3},
              "fever": {"healthy": 0.4, "fever": 0.6}}
emission = {"healthy": {"normal": 0.5, "cold": 0.4, "dizzy": 0.1},
            "fever": {"normal": 0.1, "cold": 0.3, "dizzy": 0.6}}
observations = ["normal", "cold", "dizzy"]

alpha = {s: start[s] * emission[s][observations[0]] for s in states}
for observed in observations[1:]:
    alpha = {s: sum(alpha[p] * transition[p][s] for p in states)
                * emission[s][observed] for s in states}

print({k: round(v, 6) for k, v in alpha.items()})
print("likelihood", round(sum(alpha.values()), 6))`,
    firstTrace:
      "A likelihood of zero point zero three six two eight, with most of it on the fever state. Three steps, two numbers carried at each one.",
    secondTitle: "Checked against every path",
    secondIntro:
      "Enumerate all eight state sequences and sum their probabilities. The two must agree exactly, because the recursion is not an approximation.",
    secondCode: `import itertools

total = 0.0
for path in itertools.product(states, repeat=3):
    probability = start[path[0]] * emission[path[0]][observations[0]]
    for i in range(1, 3):
        probability *= (transition[path[i - 1]][path[i]]
                        * emission[path[i]][observations[i]])
    total += probability

print("enumerated", round(total, 6))
print("paths", 2 ** 3, "vs forward operations", 3 * 2 * 2)`,
    secondTrace:
      "The same zero point zero three six two eight. At thirty observations the enumeration is a billion paths and the recursion is a hundred and twenty operations.",
    mistake:
      "Running the forward pass in raw probabilities on a long sequence. The values shrink toward zero and underflow, so real implementations either rescale each step or work in logarithms.",
    checkpoint:
      "How does the forward pass avoid enumerating paths?",
    checkpointAnswer:
      "It carries one accumulated probability per state, so all paths reaching that state are summed together at each step rather than separately.",
    remember:
      "One number per state, carried forward, sums every path.",
    checks: [
      {
        question: "What does the forward pass carry between steps?",
        choices: [
          "One accumulated probability per hidden state",
          "The most likely path so far",
          "The full path distribution",
        ],
        answer: 0,
        explanation: "That is what collapses the enumeration.",
        why: [
          "Correct. Paths merge at each state.",
          "That is a different recursion.",
          "The whole point is not to represent it.",
        ],
      },
      {
        question: "Is the forward result an approximation?",
        choices: [
          "No; it equals the sum over all paths exactly",
          "Yes, it is a bound",
          "Yes, for long sequences",
        ],
        answer: 0,
        explanation: "The comparison agreed to every digit.",
        why: [
          "Correct. It is exact dynamic programming.",
          "No bounding is involved.",
          "Length affects numerics, not exactness.",
        ],
      },
      {
        question: "Why do implementations rescale or use logarithms?",
        choices: [
          "The accumulated probabilities underflow on long sequences",
          "To speed up the recursion",
          "To handle more states",
        ],
        answer: 0,
        explanation: "The values shrink at every step.",
        why: [
          "Correct, and the failure is silent.",
          "Rescaling costs a little time.",
          "State count is unaffected.",
        ],
      },
    ],
  },
];

export const ML_GRAPHICAL_ATOMS = ML_GRAPHICAL_SPECS.map(guidedMasteryAtom);
export const ML_GRAPHICAL_CONCEPTS = ML_GRAPHICAL_SPECS.map(guidedMasteryConcept);
export const ML_GRAPHICAL_LESSON_CONTENT = guidedLessonContent(ML_GRAPHICAL_SPECS);

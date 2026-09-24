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

const ML_REINFORCEMENT_SPECS: GuidedMasterySpec[] = [
  {
    lessonId: "py.mc.m7_1.l1",
    atomId: "py.atom.ml.markov-decision-process",
    conceptId: "py.ml.markov-decision-process",
    title: "States, actions, rewards, and the discount",
    requires: ["py.ml.retrieval-augmented-generation"],
    vocabulary: [
      ["state", "everything about the situation the future depends on"],
      ["return", "the total reward from a point onward, usually discounted"],
      ["discount factor", "how much a reward one step later is worth now"],
      ["Markov property", "the future depending on the current state alone"],
    ],
    opening: "Supervised learning is given the right answer. Reinforcement learning is given a number after the fact and has to work out which of its decisions earned it. Everything else in the subject follows from that difference.",
    outcome: "You will define an environment as states, actions and rewards, and compute a discounted return.",
    why: "Framing a problem as a Markov decision process is the step that decides whether any of the algorithms apply. A state that violates the Markov property makes every method here unsound.",
    mentalModel: "Picture a board game where you see the board, choose a move, and are told a score afterwards. The board is the state, and if the board tells you everything that matters, the history can be thrown away.",
    firstTitle: "A tiny environment, written out",
    firstIntro: "Four states, two actions, and a reward only at the end.",
    firstCode: `STATES = [0, 1, 2, 3]
ACTIONS = ["left", "right"]

def step(state, action):
    if state == 3:
        return 3, 0.0, True
    following = max(0, state - 1) if action == "left" else min(3, state + 1)
    reward = 1.0 if following == 3 else 0.0
    return following, reward, following == 3

for state in STATES:
    for action in ACTIONS:
        following, reward, done = step(state, action)
        print(f"state {state} + {action:<5} -> state {following}"
              f"  reward {reward}  terminal {done}")`,
    firstTrace: "Every transition is a state, an action, a next state and a number. Only the move into state three earns anything, so the reward is sparse and the agent has to discover the path that reaches it. The terminal flag is what tells the algorithms to stop bootstrapping past the end.",
    secondTitle: "The discount decides how far ahead the agent looks",
    secondIntro: "A reward n steps away is worth the discount raised to n.",
    secondCode: `def discounted_return(rewards, discount):
    return sum(reward * discount ** step for step, reward in enumerate(rewards))

late = [0.0, 0.0, 1.0]
print("reward three steps away:")
for discount in (1.0, 0.9, 0.5, 0.1):
    print(f"  discount {discount:<4} -> {discounted_return(late, discount):.4f}")

steady = [1.0] * 6
print()
print("a reward every step:")
for discount in (1.0, 0.9, 0.5):
    print(f"  discount {discount:<4} -> {discounted_return(steady, discount):.4f}")`,
    secondTrace: "A discount of one treats a reward in ten steps as worth exactly as much as one now, and a discount of a tenth makes it almost worthless. That single number is how far ahead the agent is being asked to care. A discount under one also keeps the return finite when an episode never ends.",
    mistake: "Do not choose a state representation that leaves out something the future depends on. If the agent needs to know how it arrived, the current position alone is not a state, and every algorithm in this module assumes otherwise.",
    checkpoint: "An agent's performance depends on how it reached the current position. What is wrong?",
    checkpointAnswer: "The state is incomplete, so the Markov property fails. Either the missing information joins the state, or the environment must be treated as partially observable, which needs different methods. Every algorithm here assumes the current state summarizes everything relevant.",
    remember: "State, action, reward, next state, and a discount that decides the horizon. The state must contain everything the future depends on, or none of the methods apply.",
    checks: [
      q("What must a state contain?", ["Everything the future depends on", "The whole history", "The reward so far"], 0, "That is the Markov property.", ["Correct. The history can then be discarded.", "A good state makes the history unnecessary.", "Past reward does not affect what comes next."]),
      q("What does the discount factor control?", ["How far ahead the agent is asked to care", "The learning rate", "The exploration rate"], 0, "A reward n steps away is worth the discount to the n.", ["Correct. It also keeps infinite returns finite.", "That is a separate setting.", "Exploration is chosen separately."]),
      q("Performance depends on how the agent arrived. What does that mean?", ["The state is incomplete and the Markov property fails", "The discount is too low", "The reward is too sparse"], 0, "The methods all assume otherwise.", ["Correct. Add the missing information or treat it as partially observable.", "The discount does not create history dependence.", "Sparsity is a separate difficulty."]),
    ],
  },
  {
    lessonId: "py.mc.m7_1.l2",
    atomId: "py.atom.ml.bellman-equations",
    conceptId: "py.ml.bellman-equations",
    title: "Value is defined recursively",
    requires: ["py.ml.markov-decision-process"],
    vocabulary: [
      ["state value", "the expected return from a state under a given policy"],
      ["action value", "the expected return from taking an action, then following the policy"],
      ["Bellman equation", "the recursion writing a value in terms of its successors"],
      ["optimal value", "the best achievable value over every policy"],
    ],
    opening: "The return from a state is a sum over an entire future, which sounds impossible to compute. It is not, because that sum satisfies a one-step recursion, and that recursion is what every algorithm in this subject solves.",
    outcome: "You will write the value of a state in terms of its successors, and separate the policy version from the optimal one.",
    why: "Value iteration, Q-learning and deep Q-networks are all solving this one equation by different means. Recognizing it makes those methods variations rather than a list.",
    mentalModel: "Picture asking how good a position is by asking how good the next position is, plus whatever you collect on the way. The question never gets answered directly; it gets passed forward until it hits an ending.",
    firstTitle: "The same recursion, two versions",
    firstIntro: "Following a policy averages over its choices; the optimal version takes the best.",
    firstCode: `STATES = [0, 1, 2, 3]
ACTIONS = ["left", "right"]

def step(state, action):
    if state == 3:
        return 3, 0.0
    following = max(0, state - 1) if action == "left" else min(3, state + 1)
    return following, (1.0 if following == 3 else 0.0)

def evaluate(policy, discount=0.9, sweeps=200):
    values = {state: 0.0 for state in STATES}
    for _ in range(sweeps):
        updated = {}
        for state in STATES:
            if state == 3:
                updated[state] = 0.0
                continue
            following, reward = step(state, policy[state])
            updated[state] = reward + discount * values[following]
        values = updated
    return {state: round(value, 4) for state, value in values.items()}

print("always right:", evaluate({0: "right", 1: "right", 2: "right"}))
print("always left: ", evaluate({0: "left", 1: "left", 2: "left"}))`,
    firstTrace: "Under the rightward policy the values decay backward from the goal by the discount, giving one, nine tenths and eighty-one hundredths. Under the leftward policy nothing ever reaches the goal, so every value is zero. The equation is the same; only which action it reads differs.",
    secondTitle: "The optimal version maximizes rather than follows",
    secondIntro: "Replacing the policy's action with the best one gives the optimal values directly.",
    secondCode: `STATES = [0, 1, 2, 3]
ACTIONS = ["left", "right"]

def step(state, action):
    if state == 3:
        return 3, 0.0
    following = max(0, state - 1) if action == "left" else min(3, state + 1)
    return following, (1.0 if following == 3 else 0.0)

def optimal(discount=0.9, sweeps=200):
    values = {state: 0.0 for state in STATES}
    for _ in range(sweeps):
        updated = {}
        for state in STATES:
            if state == 3:
                updated[state] = 0.0
                continue
            updated[state] = max(reward + discount * values[following]
                                 for following, reward
                                 in (step(state, action) for action in ACTIONS))
        values = updated
    return {state: round(value, 4) for state, value in values.items()}

best = optimal()
print("optimal values:", best)
print("greedy policy: ", {state: max(ACTIONS,
                                     key=lambda a: step(state, a)[1]
                                     + 0.9 * best[step(state, a)[0]])
                          for state in STATES if state != 3})`,
    secondTrace: "The optimal values match the rightward policy exactly, because moving right is optimal from every state here. Acting greedily with respect to the optimal values recovers that policy, which is the property the whole subject leans on. Compute the values and the policy comes free.",
    mistake: "Do not bootstrap past a terminal state. A terminal state has no future, so its value is zero by definition, and adding a discounted successor value there inflates every state that leads to it.",
    checkpoint: "You have the optimal value function. How do you get the optimal policy?",
    checkpointAnswer: "Act greedily with respect to it: from each state, take the action whose immediate reward plus the discounted value of where it leads is largest. The policy comes free from the values, which is why so many methods compute values rather than policies directly.",
    remember: "A value is its successor's value, discounted, plus what you collect. Following a policy reads its action; the optimal version takes the maximum, and a terminal state has value zero.",
    checks: [
      q("What does the Bellman equation express?", ["A value in terms of its successors' values", "The total reward directly", "The optimal policy"], 0, "The sum over the future becomes a one-step recursion.", ["Correct. Every method here solves that recursion.", "The sum is what it avoids computing directly.", "The policy follows from the values."]),
      q("How does the optimal equation differ from the policy one?", ["It takes the maximum over actions rather than the policy's action", "It uses a different discount", "It ignores rewards"], 0, "That single change is the whole difference.", ["Correct. The rest of the recursion is identical.", "The discount is the same.", "Rewards enter both versions."]),
      q("What is the value of a terminal state?", ["Zero, since it has no future", "The final reward", "The discount factor"], 0, "Bootstrapping past it inflates everything upstream.", ["Correct. That is why the terminal flag matters.", "The reward is collected on the transition into it.", "The discount is not a value."]),
    ],
  },
  {
    lessonId: "py.mc.m7_1.l3",
    atomId: "py.atom.ml.value-iteration",
    conceptId: "py.ml.value-iteration",
    title: "Value and policy iteration, when the model is known",
    requires: ["py.ml.bellman-equations"],
    vocabulary: [
      ["sweep", "one pass updating every state's value"],
      ["value iteration", "repeatedly applying the optimal Bellman update until it settles"],
      ["policy iteration", "alternating full evaluation with a greedy improvement"],
      ["convergence", "the point where another sweep changes nothing meaningful"],
    ],
    opening: "When the transitions and rewards are known, the Bellman equation can be solved directly rather than learned. Two methods do it, and the difference between them is whether you evaluate a policy fully before improving it.",
    outcome: "You will run value iteration to convergence, and contrast it with the evaluate-then-improve loop of policy iteration.",
    why: "These methods are the reference answer every learning method approximates. They also make the exploration problem obvious by removing it, since a known model needs none.",
    mentalModel: "Picture filling in a map of how good each location is, repeatedly, until the numbers stop moving. Each pass propagates information one step further from the goal.",
    firstTitle: "Value iteration propagates one step per sweep",
    firstIntro: "Watching the sweeps shows the goal's value spreading backward through the states.",
    firstCode: `STATES = [0, 1, 2, 3]
ACTIONS = ["left", "right"]

def step(state, action):
    if state == 3:
        return 3, 0.0
    following = max(0, state - 1) if action == "left" else min(3, state + 1)
    return following, (1.0 if following == 3 else 0.0)

def value_iteration(discount=0.9, sweeps=6):
    values = {state: 0.0 for state in STATES}
    for sweep in range(1, sweeps + 1):
        updated = {}
        for state in STATES:
            if state == 3:
                updated[state] = 0.0
                continue
            updated[state] = max(reward + discount * values[following]
                                 for following, reward
                                 in (step(state, action) for action in ACTIONS))
        values = updated
        print(f"sweep {sweep}: {[round(values[s], 4) for s in STATES]}")
    return values

value_iteration()`,
    firstTrace: "The first sweep only finds value in the state next to the goal, since nothing else reaches it in one step. Each later sweep pushes that value one state further back, discounted as it goes. The numbers stop changing once the information has reached every state, which is what convergence means here.",
    secondTitle: "Policy iteration evaluates fully, then improves",
    secondIntro: "It alternates two complete steps rather than mixing them into one update.",
    secondCode: `STATES = [0, 1, 2, 3]
ACTIONS = ["left", "right"]

def step(state, action):
    if state == 3:
        return 3, 0.0
    following = max(0, state - 1) if action == "left" else min(3, state + 1)
    return following, (1.0 if following == 3 else 0.0)

def policy_iteration(discount=0.9):
    policy = {state: "left" for state in STATES if state != 3}
    for round_number in range(1, 4):
        values = {state: 0.0 for state in STATES}
        for _ in range(100):
            updated = {}
            for state in STATES:
                if state == 3:
                    updated[state] = 0.0
                    continue
                following, reward = step(state, policy[state])
                updated[state] = reward + discount * values[following]
            values = updated
        improved = {
            state: max(ACTIONS,
                       key=lambda a: step(state, a)[1] + discount * values[step(state, a)[0]])
            for state in STATES if state != 3
        }
        print(f"round {round_number}: policy {improved} values "
              f"{[round(values[s], 3) for s in STATES]}")
        if improved == policy:
            break
        policy = improved
    return policy

policy_iteration()`,
    secondTrace: "The first round evaluates the deliberately bad leftward policy, finds every value is zero, and improves to something better. The second round evaluates that and finds nothing left to improve, so the loop stops. Policy iteration usually needs very few rounds, each of which is more expensive than a single value-iteration sweep.",
    mistake: "Do not run policy iteration's evaluation step to convergence when a few sweeps would do. Truncating it gives the same final answer far more cheaply, and taken to its limit that truncation is exactly value iteration.",
    checkpoint: "How are value iteration and policy iteration related?",
    checkpointAnswer: "They are the two ends of one spectrum. Policy iteration evaluates a policy to convergence before improving it, and value iteration improves after a single sweep of evaluation. Truncating the evaluation to any number of sweeps in between gives a valid method.",
    remember: "With a known model the Bellman equation can be solved directly. Value iteration improves after every sweep, policy iteration evaluates fully first, and everything between them works too.",
    checks: [
      q("What does one sweep of value iteration accomplish?", ["It propagates value one step further from the goal", "It finds the optimal policy", "It evaluates one state"], 0, "Convergence is when the information has reached everywhere.", ["Correct. Several sweeps are needed to reach distant states.", "That takes several sweeps.", "A sweep updates every state."]),
      q("How does policy iteration differ?", ["It evaluates a policy fully before improving it", "It uses a different Bellman equation", "It needs no model"], 0, "Value iteration improves after a single sweep.", ["Correct. Both are ends of one spectrum.", "The equation is the same.", "Both require a known model."]),
      q("Why truncate policy iteration's evaluation step?", ["A few sweeps give the same answer far more cheaply", "Full evaluation is incorrect", "It avoids the discount"], 0, "Truncating to one sweep is value iteration.", ["Correct. Anything in between is a valid method.", "Full evaluation is correct, just wasteful.", "The discount is used throughout."]),
    ],
  },
  {
    lessonId: "py.mc.m7_1.l4",
    atomId: "py.atom.ml.model-free-control",
    conceptId: "py.ml.model-free-control",
    title: "Learning without being told the rules",
    requires: ["py.ml.value-iteration"],
    vocabulary: [
      ["model-free", "learning from experience without knowing the transitions"],
      ["temporal difference", "updating a value toward a one-step estimate rather than a full return"],
      ["off-policy", "learning about the greedy policy while behaving differently"],
      ["exploration", "taking a non-greedy action to discover what it leads to"],
    ],
    opening: "Value iteration needs the transition rules. Almost no interesting environment supplies them, so the agent has to estimate the same quantities from experience, and one change to the update makes that possible.",
    outcome: "You will implement Q-learning and SARSA, and identify what makes one off-policy and the other on-policy.",
    why: "Everything practical in reinforcement learning is model-free, and the off-policy distinction decides whether experience can be reused or must come from the current policy.",
    mentalModel: "Picture learning a city by walking it rather than reading a map. You update your sense of each junction from where you actually ended up, and you occasionally take a turn you would not have chosen, to find out.",
    firstTitle: "Q-learning updates toward the best next action",
    firstIntro: "The target uses the maximum over next actions, whatever the agent actually did.",
    firstCode: `import random

STATES = [0, 1, 2, 3]
ACTIONS = ["left", "right"]

def step(state, action):
    following = max(0, state - 1) if action == "left" else min(3, state + 1)
    return following, (1.0 if following == 3 else 0.0), following == 3

def learn(episodes=3000, rate=0.2, discount=0.9, explore=0.2, seed=0, on_policy=False):
    rng = random.Random(seed)
    values = {(state, action): 0.0 for state in STATES for action in ACTIONS}

    def choose(state):
        if rng.random() < explore:
            return rng.choice(ACTIONS)
        return max(ACTIONS, key=lambda a: values[(state, a)])

    for _ in range(episodes):
        state = 0
        action = choose(state)
        for _ in range(50):
            following, reward, done = step(state, action)
            next_action = choose(following)
            if done:
                target = reward
            elif on_policy:
                target = reward + discount * values[(following, next_action)]
            else:
                target = reward + discount * max(values[(following, a)] for a in ACTIONS)
            values[(state, action)] += rate * (target - values[(state, action)])
            state, action = following, next_action
            if done:
                break
    return values

table = learn()
for state in (0, 1, 2):
    print(f"state {state}: " + "  ".join(
        f"{a}={table[(state, a)]:.3f}" for a in ACTIONS))`,
    firstTrace: "The learned action values match what value iteration computed, reaching one at the state next to the goal and decaying backward by the discount. Nothing in the loop ever consulted the transition rules; every number came from experience. The exploration rate is what ensured the leftward actions were tried often enough to be evaluated.",
    secondTitle: "SARSA learns about the policy it is actually running",
    secondIntro: "One term changes: the target uses the action actually taken next.",
    secondCode: `DIFFERENCES = [
    ("Q-learning", "off-policy",
     "target uses the best next action",
     "learns the greedy policy while exploring"),
    ("SARSA", "on-policy",
     "target uses the action actually taken",
     "learns the policy it is running, exploration included"),
]

for name, kind, target, consequence in DIFFERENCES:
    print(f"{name:<12}{kind:<12}{target}")
    print(f"{'':<24}{consequence}")

print()
print("near a cliff, SARSA learns a safer route because its own")
print("exploration occasionally walks off the edge and it accounts for that")`,
    secondTrace: "The two differ by which next action the target reads, and that single term decides what is being learned. Q-learning evaluates the greedy policy regardless of how it behaved, so its experience can come from anywhere. SARSA evaluates the policy including its exploration, which makes it more conservative wherever exploring is dangerous.",
    mistake: "Do not let the exploration rate go to zero too early. An action never tried keeps whatever value it was initialized with, so the agent can settle confidently on a route it never had evidence against.",
    checkpoint: "Why can Q-learning reuse experience from an old policy when SARSA cannot?",
    checkpointAnswer: "Because its target maximizes over next actions rather than reading the action actually taken. That makes it independent of the behaviour that generated the data, so any experience is usable. SARSA's target depends on what the acting policy did, so old data describes a policy it is no longer running.",
    remember: "Both replace the model with experience. Q-learning targets the best next action and is off-policy; SARSA targets the action actually taken and is on-policy.",
    checks: [
      q("What makes Q-learning off-policy?", ["Its target maximizes over next actions rather than using the one taken", "It explores more", "It uses a larger learning rate"], 0, "The target is independent of the behaviour.", ["Correct. That is what makes stored experience reusable.", "Both explore the same way.", "The rate is a separate setting."]),
      q("Why is SARSA more conservative near a cliff?", ["Its target accounts for its own exploration occasionally stepping off", "It uses a lower discount", "It updates less often"], 0, "It evaluates the policy it is actually running.", ["Correct. Q-learning evaluates the greedy policy instead.", "The discount is the same.", "The update frequency is identical."]),
      q("What happens if exploration stops too early?", ["Untried actions keep their initial values and are never corrected", "Learning becomes unstable", "The discount stops applying"], 0, "The agent settles on a route it has no evidence against.", ["Correct. Some exploration must persist.", "It becomes stable and wrong.", "The discount is unaffected."]),
    ],
  },
  {
    lessonId: "py.mc.m7_1.l5",
    atomId: "py.atom.ml.deep-q-networks",
    conceptId: "py.ml.deep-q-networks",
    title: "Two fixes that make function approximation work",
    requires: ["py.ml.model-free-control"],
    vocabulary: [
      ["function approximation", "predicting values with a network instead of a lookup table"],
      ["experience replay", "storing transitions and sampling them out of order"],
      ["target network", "a slowly updated copy used to compute the update target"],
      ["moving target", "a target that shifts because the thing computing it is being trained"],
    ],
    opening: "Replacing the value table with a network is the obvious extension and it does not work. Two specific instabilities appear, and the two standard fixes address exactly those two rather than being general good practice.",
    outcome: "You will name the two instabilities that arise from approximation, and match each to the fix that removes it.",
    why: "The same two problems reappear in every value-based method with a learned approximator. Recognizing them by symptom is what turns a diverging run into a diagnosable one.",
    mentalModel: "Picture trying to hit a target that moves whenever you aim, while only ever practising on shots you just took. Freezing the target and shuffling the practice are the two obvious repairs.",
    firstTitle: "Correlated experience defeats the update",
    firstIntro: "Consecutive transitions are nearly identical, and training on them in order is training on one example repeatedly.",
    firstCode: `import random

def sequential_batches(transitions, size):
    return [transitions[i:i + size] for i in range(0, len(transitions), size)]

def replayed_batches(transitions, size, seed=0):
    rng = random.Random(seed)
    shuffled = list(transitions)
    rng.shuffle(shuffled)
    return [shuffled[i:i + size] for i in range(0, len(shuffled), size)]

episode = [("corridor", step) for step in range(8)] + \\
          [("room", step) for step in range(8)]

first_sequential = sequential_batches(episode, 4)[0]
first_replayed = replayed_batches(episode, 4)[0]
print("sequential batch:", [where for where, _ in first_sequential])
print("replayed batch:  ", [where for where, _ in first_replayed])
print()
print("the sequential batch contains one situation; the replayed one contains both")`,
    firstTrace: "A sequential batch holds eight nearly identical transitions from one part of the environment, so the network is fitted to that region and then to the next, forgetting as it goes. Sampling from a stored buffer mixes regions in every batch. That is what makes the gradient estimate resemble one from independent samples.",
    secondTitle: "A moving target chases itself",
    secondIntro: "Computing the target with the network being trained means the target shifts at every step.",
    secondCode: `def chase(steps, rate, freeze_every):
    estimate = 0.0
    target_source = 0.0
    history = []
    for step in range(1, steps + 1):
        target = 1.0 + 0.9 * target_source
        estimate += rate * (target - estimate)
        if freeze_every == 1 or step % freeze_every == 0:
            target_source = estimate
        history.append(round(estimate, 4))
    return history

print("target updated every step: ", chase(8, 0.5, 1))
print("target frozen for 4 steps: ", chase(8, 0.5, 4))
print()
print("freezing gives the estimate a fixed thing to converge toward")`,
    secondTrace: "With the target recomputed every step the estimate never settles, because the value it aims at rises with every update it makes. Freezing the source for several steps gives it something stationary to approach, and it converges toward that instead. The copy is refreshed periodically, so the target still improves, just not while being aimed at.",
    mistake: "Do not update the target network every step to keep it fresh. That is precisely the moving-target problem the separate network exists to remove, and it reintroduces the instability while appearing to be an improvement.",
    checkpoint: "A value network diverges during training. Which two things would you check first?",
    checkpointAnswer: "Whether the batches are correlated, and whether the target is computed with the network being trained. Those are the two instabilities that approximation introduces, and replay and a frozen target network address them respectively. Both are usually present when a run diverges.",
    remember: "Approximation adds two problems: correlated experience and a target that moves with the network. Replay fixes the first and a periodically frozen target network fixes the second.",
    checks: [
      q("What does experience replay fix?", ["Correlated consecutive transitions", "A moving target", "A learning rate that is too high"], 0, "Sequential batches contain one situation.", ["Correct. Sampling mixes regions in every batch.", "That is the target network's job.", "The rate is a separate setting."]),
      q("Why freeze the target network?", ["So the estimate has something stationary to converge toward", "To save computation", "To reduce memory"], 0, "A target computed by the trained network moves with it.", ["Correct. It is refreshed periodically, not never.", "It costs an extra copy.", "It uses more memory, not less."]),
      q("What happens if the target network is updated every step?", ["The moving-target problem returns in full", "Training becomes slower", "The replay buffer overflows"], 0, "That is exactly what the separate network removes.", ["Correct. It looks like an improvement and is not.", "Speed is barely affected.", "The buffer is independent."]),
    ],
  },
  {
    lessonId: "py.mc.m7_1.l6",
    atomId: "py.atom.ml.policy-gradients",
    conceptId: "py.ml.policy-gradients",
    title: "Optimizing the policy directly",
    requires: ["py.ml.deep-q-networks"],
    vocabulary: [
      ["policy gradient", "adjusting the policy's parameters in the direction that raises return"],
      ["score function", "the gradient of the log probability of the action taken"],
      ["credit assignment", "deciding which actions deserve the reward that followed"],
      ["high variance", "an estimate that is correct on average and noisy on any one sample"],
    ],
    opening: "Value methods learn how good things are and derive a policy from that. Policy methods skip the intermediary and adjust the policy directly, which handles continuous actions naturally and pays for it in noise.",
    outcome: "You will apply a policy-gradient update from a sampled return, and see why the estimate is noisy.",
    why: "Everything used on hard modern problems, including the methods that fine-tune language models, is in this family. The variance problem is what the next two lessons exist to fix.",
    mentalModel: "Picture nudging your habits after a good day, without knowing which decision caused it. Every choice you made gets nudged a little, and only across many days does the useful signal separate from the noise.",
    firstTitle: "Raise the probability of what preceded a good return",
    firstIntro: "The update pushes the taken action's probability up in proportion to the return.",
    firstCode: `import math

def policy(preferences):
    top = max(preferences)
    weights = [math.exp(p - top) for p in preferences]
    total = sum(weights)
    return [weight / total for weight in weights]

def update(preferences, action, ret, rate=0.1):
    probabilities = policy(preferences)
    return [p + rate * ret * ((1.0 if index == action else 0.0) - probabilities[index])
            for index, p in enumerate(preferences)]

preferences = [0.0, 0.0]
print("start:", [round(p, 3) for p in policy(preferences)])
for _ in range(20):
    preferences = update(preferences, 0, 1.0)
print("after 20 rewarded choices of action 0:",
      [round(p, 3) for p in policy(preferences)])`,
    firstTrace: "Each update raises the chosen action's preference and lowers the others in proportion to their current probability. Twenty rewarded choices move the probability from a half to about four fifths, which is deliberate rather than instant. A negative return would push the same action's probability down by the same mechanism.",
    secondTitle: "The estimate is unbiased and very noisy",
    secondIntro: "The same policy produces wildly different gradients on different episodes.",
    secondCode: `import random

def gradient_samples(baseline, seed=0, count=20000):
    rng = random.Random(seed)
    samples = []
    for _ in range(count):
        ret = 10 + rng.gauss(0, 3)
        score = 1.0 if rng.random() < 0.5 else -1.0
        samples.append((ret - baseline) * score)
    mean = sum(samples) / len(samples)
    variance = sum((value - mean) ** 2 for value in samples) / len(samples)
    return round(mean, 3), round(variance, 2)

for baseline in (0, 5, 10, 15):
    mean, variance = gradient_samples(baseline)
    print(f"baseline {baseline:>3}: mean {mean:>7}  variance {variance:>8}")

print()
print("theory says the variance is 9 + (10 - baseline) squared")`,
    secondTrace: "Every baseline gives the same mean, which is what unbiased means, and the variance changes enormously. Subtracting nothing leaves a variance of about a hundred and nine, and subtracting the average return leaves about nine. The best baseline is the expected return, which is exactly what the next lesson learns.",
    mistake: "Do not treat a large policy-gradient update as evidence of a large improvement. The estimate is dominated by noise on any single episode, and reacting strongly to one sample is how these methods destroy a policy that was working.",
    checkpoint: "Why does subtracting a baseline leave the gradient unbiased?",
    checkpointAnswer: "Because the expected value of the score function is zero, so subtracting any quantity that does not depend on the action contributes nothing on average. The mean of the estimate is unchanged while its variance falls, which is why the trick is free.",
    remember: "Policy methods adjust the policy directly, raising the probability of actions that preceded good returns. The estimate is unbiased and noisy, and a baseline reduces the noise for free.",
    checks: [
      q("What does a policy-gradient update do?", ["Raises the probability of the action taken, scaled by the return", "Updates the value of the state", "Selects the greedy action"], 0, "The policy is adjusted directly.", ["Correct. A negative return lowers it instead.", "No value function is required.", "The policy stays stochastic."]),
      q("What does subtracting a baseline change?", ["The variance, but not the mean", "The mean, but not the variance", "Both equally"], 0, "The score function has expectation zero.", ["Correct. That is why the trick costs nothing.", "The estimate stays unbiased.", "Only the variance moves."]),
      q("What is the best constant baseline?", ["The expected return", "Zero", "The maximum return"], 0, "Variance is nine plus the squared distance from it.", ["Correct. That is what a learned value function estimates.", "Zero leaves the largest variance here.", "The maximum is worse than the mean."]),
    ],
  },
  {
    lessonId: "py.mc.m7_1.l7",
    atomId: "py.atom.ml.actor-critic",
    conceptId: "py.ml.actor-critic",
    title: "A learned baseline, and what advantage means",
    requires: ["py.ml.policy-gradients"],
    vocabulary: [
      ["actor", "the policy being adjusted"],
      ["critic", "the value estimate used as a baseline"],
      ["advantage", "how much better an action was than the state's average"],
      ["bias-variance trade", "accepting a slightly wrong estimate for a much steadier one"],
    ],
    opening: "The best baseline is the expected return from the current state, which varies from state to state and is exactly what a value function estimates. Learning it alongside the policy gives the two halves their names.",
    outcome: "You will compute an advantage from a return and a value estimate, and state what the critic buys and costs.",
    why: "Every modern policy method is an actor-critic. The advantage is also what the next lesson's objective is built from, so the definition has to be exact.",
    mentalModel: "Picture grading a decision against what that situation usually yields rather than against zero. A modest result in a hopeless position is good news, and the same result in a promising one is not.",
    firstTitle: "Advantage compares against the state, not against zero",
    firstIntro: "The same return means different things depending on where it started.",
    firstCode: `EPISODES = [
    ("promising state", 12.0, 15.0),
    ("promising state", 18.0, 15.0),
    ("hopeless state", 3.0, 1.0),
    ("hopeless state", 0.0, 1.0),
]

print(f"{'state':<18}{'return':>8}{'value':>8}{'advantage':>11}  verdict")
for state, ret, value in EPISODES:
    advantage = ret - value
    verdict = "reinforce" if advantage > 0 else "discourage"
    print(f"{state:<18}{ret:>8.1f}{value:>8.1f}{advantage:>11.1f}  {verdict}")

print()
print("a return of 3 is good news in a hopeless state and would be")
print("terrible news in a promising one")`,
    firstTrace: "A return of twelve from a state usually worth fifteen is a disappointment and gets discouraged, while three from a state worth one is a success. Comparing against zero would have reinforced both of the larger numbers and neither of the smaller ones, which is the wrong signal in two of the four cases. The critic is what supplies the comparison point.",
    secondTitle: "What the critic costs",
    secondIntro: "A learned baseline is imperfect, and its error enters the policy update as bias.",
    secondCode: `def compare(true_value, critic_estimate, sampled_return):
    unbiased = sampled_return - 0.0
    with_critic = sampled_return - critic_estimate
    ideal = sampled_return - true_value
    return round(unbiased, 3), round(with_critic, 3), round(ideal, 3)

print(f"{'critic':>8}{'no baseline':>14}{'with critic':>14}{'ideal':>10}")
for estimate in (0.0, 8.0, 10.0, 12.0):
    unbiased, with_critic, ideal = compare(10.0, estimate, 13.0)
    print(f"{estimate:>8.1f}{unbiased:>14}{with_critic:>14}{ideal:>10}")

print()
print("a wrong critic biases the update; a very wrong one is worse than none")`,
    secondTrace: "A perfect critic gives exactly the ideal signal, and a critic off by two shifts every advantage by two in the same direction. That shift is a bias the policy responds to, so a critic that is badly wrong early in training can actively mislead. The trade is almost always worth taking, because the variance reduction is enormous and the bias shrinks as the critic learns.",
    mistake: "Do not let the critic lag far behind the policy. An advantage computed against a value function describing an older policy is systematically wrong, and the actor will confidently pursue directions that were only good under behaviour it has already abandoned.",
    checkpoint: "Why is a return of 3 sometimes reinforced and sometimes discouraged?",
    checkpointAnswer: "Because the advantage compares it against what that state is normally worth. Three from a state valued at one is two better than expected and gets reinforced; three from a state valued at fifteen is a large shortfall and gets discouraged. The absolute number carries no information on its own.",
    remember: "The critic estimates what a state is normally worth, and the advantage is the return minus that. It trades a little bias for a large reduction in variance.",
    checks: [
      q("What does the advantage measure?", ["How much better an action was than the state's average", "The total reward", "The value of the next state"], 0, "The absolute return carries no information alone.", ["Correct. The comparison point is what matters.", "That is the return, not the advantage.", "That is one term in the estimate."]),
      q("What does the critic cost?", ["Bias, when its estimate is wrong", "Variance", "Exploration"], 0, "Its error shifts every advantage in the same direction.", ["Correct. The variance reduction usually outweighs it.", "Variance is what it removes.", "Exploration is unaffected."]),
      q("What goes wrong when the critic lags the policy?", ["Advantages describe an older policy and mislead the actor", "The policy stops updating", "The variance rises"], 0, "The bias becomes systematic.", ["Correct. The actor pursues directions no longer good.", "It keeps updating, wrongly.", "Variance stays reduced."]),
    ],
  },
  {
    lessonId: "py.mc.m7_1.l8",
    atomId: "py.atom.ml.proximal-policy-optimization",
    conceptId: "py.ml.proximal-policy-optimization",
    title: "Clipping keeps an update from going too far",
    requires: ["py.ml.actor-critic"],
    vocabulary: [
      ["probability ratio", "the new policy's probability of an action over the old one's"],
      ["surrogate objective", "a quantity optimized as a stand-in for the true return"],
      ["clipping", "capping the ratio so a single update cannot move the policy far"],
      ["trust region", "a neighbourhood within which the estimate is considered reliable"],
    ],
    opening: "A policy-gradient estimate is only trustworthy near the policy that produced the data. Take too large a step and the estimate no longer describes where you have moved to, which is how these methods collapse.",
    outcome: "You will compute the clipped objective for positive and negative advantages, and explain what each side of the clip prevents.",
    why: "This is the default policy method in practice, including for language-model fine-tuning. The asymmetry between the two advantage signs is the part most descriptions gloss over.",
    mentalModel: "Picture a map that is accurate near where you are standing and increasingly wrong further out. Clipping is refusing to act on the parts of the map you have no reason to trust.",
    firstTitle: "The clip caps the gain, not the loss",
    firstIntro: "Taking the minimum makes the objective conservative in both directions, asymmetrically.",
    firstCode: `def clipped(ratio, advantage, epsilon=0.2):
    unclipped = ratio * advantage
    bounded = max(1 - epsilon, min(1 + epsilon, ratio)) * advantage
    return min(unclipped, bounded)

print(f"{'ratio':>7}{'advantage +1':>15}{'advantage -1':>15}")
for ratio in (0.5, 0.8, 1.0, 1.2, 1.5):
    print(f"{ratio:>7}{clipped(ratio, 1.0):>15.3f}{clipped(ratio, -1.0):>15.3f}")

print()
print("with a good action the upside is capped at 1.2")
print("with a bad action the downside is capped at 0.8")`,
    firstTrace: "A ratio of one and a half on a good action is capped at one point two, so there is no further gain from pushing that probability higher. The same ratio on a bad action is not capped at all, because reducing the probability of something harmful is allowed to continue. The asymmetry is deliberate, and it comes from taking the minimum rather than clipping directly.",
    secondTitle: "Why the objective needs the ratio at all",
    secondIntro: "The data came from the old policy, so its contribution must be reweighted.",
    secondCode: `def importance_weight(new_probability, old_probability):
    return new_probability / old_probability

print(f"{'old':>6}{'new':>6}{'ratio':>8}  reading")
cases = [(0.5, 0.5), (0.5, 0.6), (0.5, 0.25), (0.1, 0.4)]
for old, new in cases:
    ratio = importance_weight(new, old)
    if abs(ratio - 1) < 1e-9:
        reading = "unchanged, the data is fully valid"
    elif ratio > 1:
        reading = "the new policy prefers this more"
    else:
        reading = "the new policy prefers this less"
    print(f"{old:>6}{new:>6}{ratio:>8.2f}  {reading}")

print()
print("a ratio far from one means the data describes a policy you have left")`,
    secondTrace: "A ratio of one means the policy has not moved and the collected data still describes it exactly. A ratio of four means the new policy is four times as likely to take that action, so the sample is being stretched a long way from where it was gathered. Clipping is the decision to stop trusting the sample past a fixed distance.",
    mistake: "Do not raise the clipping range to speed up learning. The range is what keeps the update inside the region where the collected data is informative, and widening it reintroduces exactly the collapse the method exists to prevent.",
    checkpoint: "Why is the clip asymmetric between positive and negative advantages?",
    checkpointAnswer: "Because taking the minimum caps the gain from a good action while leaving the penalty on a bad one uncapped. There is no reason to limit how far you move away from something harmful, and every reason to limit how far a single noisy estimate can push you toward something that merely looked good.",
    remember: "The ratio reweights data from the old policy, and clipping refuses to trust it past a fixed distance. The minimum caps the upside on good actions and leaves the downside on bad ones open.",
    checks: [
      q("What does the probability ratio represent?", ["How much more or less likely the new policy is to take that action", "The advantage", "The learning rate"], 0, "It reweights data gathered under the old policy.", ["Correct. A ratio far from one means the data is stale.", "The advantage is a separate factor.", "The rate is unrelated."]),
      q("Why is the clip asymmetric?", ["Gains on good actions are capped; penalties on bad ones are not", "Negative advantages are rarer", "It simplifies the gradient"], 0, "Taking the minimum produces the asymmetry.", ["Correct. There is no reason to limit moving away from harm.", "Both signs occur constantly.", "The gradient is not what motivates it."]),
      q("What happens if the clipping range is widened?", ["Updates leave the region where the data is informative", "Learning becomes slower", "The advantage becomes biased"], 0, "That region is what the range defines.", ["Correct. It reintroduces the collapse being prevented.", "It appears faster and is unstable.", "The advantage is computed separately."]),
    ],
  },
  {
    lessonId: "py.mc.m7_1.l9",
    atomId: "py.atom.ml.model-based-offline-rl",
    conceptId: "py.ml.model-based-offline-rl",
    title: "Learning the environment, or learning without one",
    requires: ["py.ml.proximal-policy-optimization"],
    vocabulary: [
      ["model-based", "learning a model of the environment and planning inside it"],
      ["sample efficiency", "how much real interaction a method needs to reach a level"],
      ["offline learning", "learning from a fixed dataset with no further interaction"],
      ["distribution shift", "evaluating a policy on states the logged data never visited"],
    ],
    opening: "Everything so far assumed the agent can interact freely and cheaply. Two settings break that assumption in opposite directions, and each has its own characteristic failure.",
    outcome: "You will contrast learning a model with learning from logged data, and name the failure each one invites.",
    why: "Real deployments rarely allow unlimited interaction. Medicine, robotics and recommendation all need one of these two settings, and both fail in ways ordinary reinforcement learning does not.",
    mentalModel: "Picture learning to cook by building a simulator of your kitchen, or by reading a stack of other people's recipes. One risks trusting a flawed simulator, the other risks confidently attempting something nobody in the stack ever tried.",
    firstTitle: "A learned model buys interaction cheaply",
    firstIntro: "Planning inside the model costs nothing real, and its errors compound with depth.",
    firstCode: `def rollout_error(step_error, depth):
    total = 0.0
    compounded = 1.0
    for _ in range(depth):
        compounded *= (1 + step_error)
        total = compounded - 1
    return total

print(f"{'depth':>7}{'1% error':>12}{'5% error':>12}")
for depth in (1, 5, 20, 50):
    print(f"{depth:>7}{rollout_error(0.01, depth):>12.3f}{rollout_error(0.05, depth):>12.3f}")

print()
print("short rollouts in a learned model are cheap and trustworthy")
print("long ones are cheap and increasingly fictional")`,
    firstTrace: "A model that is one per cent wrong per step is sixty-four per cent wrong after fifty steps, and a five per cent model is off by more than a factor of ten. That is why practical model-based methods plan over short horizons and re-plan often. The cheapness of simulated experience is real; its accuracy at depth is not.",
    secondTitle: "Offline learning cannot try anything new",
    secondIntro: "A policy that prefers unlogged actions is evaluated on evidence that does not exist.",
    secondCode: `LOGGED = {
    ("intersection", "wait"): 120,
    ("intersection", "turn"): 80,
    ("motorway", "cruise"): 500,
    ("motorway", "brake"): 12,
}

def support(state, action, threshold=30):
    count = LOGGED.get((state, action), 0)
    if count == 0:
        return "no data at all: any estimate here is invented"
    if count < threshold:
        return f"only {count} samples: the estimate is unreliable"
    return f"{count} samples: reasonably supported"

for state, action in (("intersection", "wait"), ("motorway", "brake"),
                      ("motorway", "swerve")):
    print(f"{state:<14}{action:<8}{support(state, action)}")

print()
print("an offline policy that prefers 'swerve' has no evidence behind it")
print("and no way to gather any")`,
    secondTrace: "Actions with plenty of logged data can be evaluated honestly, and actions with none cannot be evaluated at all. The danger is that value estimates for unseen actions are not merely uncertain, they are frequently optimistic, so the learned policy is actively drawn toward them. Offline methods therefore add an explicit penalty for leaving the logged distribution.",
    mistake: "Do not evaluate an offline policy by its predicted value. That number is computed from the same estimates that are unreliable off the logged distribution, so a policy chosen for a high predicted value has often been selected precisely for where those estimates are wrong.",
    checkpoint: "An offline policy scores extremely well on predicted value. Why is that suspicious?",
    checkpointAnswer: "Because the estimates are least reliable exactly where the data is thinnest, and optimistic errors there attract the policy. Selecting for a high predicted value is partly selecting for the largest overestimate, which is why offline methods constrain the policy toward actions the data actually covers.",
    remember: "A learned model makes interaction cheap and its errors compound over long rollouts. Offline learning cannot gather new evidence, so it must be constrained toward what the data covers.",
    checks: [
      q("Why do model-based methods plan over short horizons?", ["Model error compounds with every simulated step", "Long rollouts cost too much compute", "The discount forbids it"], 0, "A one per cent model is far off after fifty steps.", ["Correct. Re-planning often is the standard remedy.", "Simulated steps are cheap; that is the point.", "The discount is a separate choice."]),
      q("What is the characteristic offline failure?", ["Optimistic value estimates for actions the data never covered", "Too much exploration", "Slow convergence"], 0, "The policy is drawn toward exactly those errors.", ["Correct. Offline methods constrain toward the logged distribution.", "No exploration is possible at all.", "Speed is not the issue."]),
      q("Why is a high predicted value suspicious offline?", ["Selecting for it partly selects for the largest overestimate", "It means the policy is too conservative", "Predicted values are always wrong"], 0, "Errors are largest where data is thinnest.", ["Correct. That is why the policy must be constrained.", "Conservatism would show a low predicted value.", "They are reliable where the data is dense."]),
    ],
  },
];

export const ML_REINFORCEMENT_ATOMS = ML_REINFORCEMENT_SPECS.map(guidedMasteryAtom);
export const ML_REINFORCEMENT_CONCEPTS = ML_REINFORCEMENT_SPECS.map(guidedMasteryConcept);
export const ML_REINFORCEMENT_LESSON_CONTENT = guidedLessonContent(ML_REINFORCEMENT_SPECS);

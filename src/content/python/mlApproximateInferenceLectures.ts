import {
  guidedLessonContent,
  guidedMasteryAtom,
  guidedMasteryConcept,
  type GuidedMasterySpec,
} from "./guidedMastery";

const ML_APPROXIMATE_SPECS: GuidedMasterySpec[] = [
  {
    lessonId: "py.mc.m11_3.l1",
    atomId: "py.atom.ml.variational-inference",
    conceptId: "py.ml.variational-inference",
    title: "Variational inference and the ELBO",
    requires: ["py.ml.hidden-markov-models"],
    vocabulary: [
      ["variational family", "the set of simple distributions the approximation is chosen from"],
      ["lower bound", "a quantity never exceeding the log evidence, maximised in its place"],
      ["divergence term", "the penalty for moving the approximation away from the prior"],
    ],
    opening:
      "The posterior is intractable, so pick a family you can compute with and find its closest member. That turns integration into optimisation.",
    outcome:
      "You will maximise the bound over an approximation and see the fit and the divergence pull against each other.",
    why:
      "It is the mechanism behind variational autoencoders and most scalable Bayesian deep learning, and the two competing terms explain most of their behaviour.",
    mentalModel:
      "Picture two forces on the approximation. The data pulls it toward explaining the observations; the prior pulls it back toward where it started.",
    firstTitle: "The two terms",
    firstIntro:
      "The bound is the expected fit minus the divergence from the prior. Moving the approximation's centre changes both.",
    firstCode: `import math

def bound(mean, log_var, prior_var, data_mean, noise_var, n):
    var = math.exp(log_var)
    fit = -0.5 * n * ((mean - data_mean) ** 2 + var) / noise_var
    divergence = 0.5 * (var / prior_var + mean ** 2 / prior_var
                        - 1 - log_var + math.log(prior_var))
    return round(fit - divergence, 4), round(fit, 4), round(divergence, 4)

for mean in (0.0, 1.0, 2.0, 2.5):
    print("mean", mean, bound(mean, -1.0, 1.0, 2.0, 1.0, 10))`,
    firstTrace:
      "The bound peaks at a mean of two, where the fit is best. Pushing to two point five improves nothing and costs more divergence.",
    secondTitle: "Width has an optimum too",
    secondIntro:
      "A very narrow approximation fits well but pays heavily in divergence. A very wide one pays little there and fits badly.",
    secondCode: `for log_var in (-4.0, -2.0, 0.0, 1.0):
    print("log variance", log_var,
          bound(2.0, log_var, 1.0, 2.0, 1.0, 10))`,
    secondTrace:
      "Minus three point six at the narrowest, minus three point two at log variance minus two, and minus sixteen at the widest. The optimum is between the extremes.",
    mistake:
      "Reading the bound as the log evidence. It is a lower bound, and the gap between them is the approximation error - which the bound itself never reveals.",
    checkpoint:
      "The bound improves. Does that mean the approximation got closer to the true posterior?",
    checkpointAnswer:
      "Usually but not necessarily. The bound is the evidence minus the approximation gap, so a rising bound can reflect either term.",
    remember:
      "Maximise fit minus divergence, and remember it is only a bound.",
    checks: [
      {
        prompt: "What does variational inference replace integration with?",
        options: ["Optimisation over a family of distributions", "Sampling", "Enumeration"],
        answerIndex: 0,
        hint: "You pick the best member of a simple family.",
        explanations: [
          "Correct. That is what makes it scalable.",
          "Sampling is the other main approach.",
          "Enumeration is what became intractable.",
        ],
      },
      {
        prompt: "What are the two competing terms in the bound?",
        options: [
          "Expected fit and divergence from the prior",
          "Bias and variance",
          "Precision and recall",
        ],
        answerIndex: 0,
        hint: "One pulls toward the data, the other back to the prior.",
        explanations: [
          "Correct, and the optimum balances them.",
          "That is a different decomposition.",
          "Those are evaluation metrics.",
        ],
      },
      {
        prompt: "The bound rises. What can you conclude?",
        options: [
          "Either the fit improved or the approximation gap shrank",
          "The posterior was recovered exactly",
          "Nothing at all",
        ],
        answerIndex: 0,
        hint: "The bound is evidence minus gap.",
        explanations: [
          "Correct, and the bound cannot separate them.",
          "The gap is never observed.",
          "It is informative, just ambiguous.",
        ],
      },
    ],
  },
  {
    lessonId: "py.mc.m11_3.l2",
    atomId: "py.atom.ml.reparameterization",
    conceptId: "py.ml.reparameterization",
    title: "Reparameterized gradients",
    requires: ["py.ml.variational-inference"],
    vocabulary: [
      ["gradient estimator", "a random quantity whose average is the true gradient"],
      ["estimator variance", "how much the estimate scatters around that average"],
      ["reparameterization", "moving the randomness outside the parameters being differentiated"],
    ],
    opening:
      "Both estimators are unbiased, so both converge eventually. One does it with a ninth of the variance, and that decides whether training finishes.",
    outcome:
      "You will compare two unbiased gradient estimators on the same problem and measure the variance ratio.",
    why:
      "An unbiased estimator with enormous variance is correct and useless. Variance, not bias, is what usually stops these methods working.",
    mentalModel:
      "Picture the randomness as a fixed draw of noise. The parameter then enters through a smooth function of that noise, so the derivative flows straight through.",
    firstTitle: "Two ways to the same gradient",
    firstIntro:
      "One estimator weights the sample by a score; the other differentiates a smooth function of fixed noise. Both average to the true value.",
    firstCode: `import random, statistics

def score_based(mean, samples, seed):
    rng = random.Random(seed)
    values = []
    for _ in range(samples):
        x = rng.gauss(mean, 1.0)
        values.append((x - mean) * (x ** 2))
    return round(statistics.mean(values), 4), round(statistics.stdev(values), 4)

def reparameterized(mean, samples, seed):
    rng = random.Random(seed)
    values = []
    for _ in range(samples):
        x = mean + rng.gauss(0.0, 1.0)
        values.append(2 * x)
    return round(statistics.mean(values), 4), round(statistics.stdev(values), 4)

print("score based    ", score_based(1.0, 2000, 0))
print("reparameterized", reparameterized(1.0, 2000, 0))
print("true gradient  ", 2.0)`,
    firstTrace:
      "Both land near two, and the standard deviations are six and two. Same target, same sample count, very different reliability.",
    secondTitle: "The variance ratio",
    secondIntro:
      "Square the ratio of standard deviations. That factor is how many more samples the noisier estimator needs for the same precision.",
    secondCode: `_, noisy = score_based(1.0, 2000, 0)
_, quiet = reparameterized(1.0, 2000, 0)
print("variance ratio", round((noisy / quiet) ** 2, 1))
print("samples needed for equal precision:",
      round((noisy / quiet) ** 2, 1), "times as many")`,
    secondTrace:
      "Nine times. The score-based estimator needs nine times the samples to match, on a one-dimensional problem where it is at its best.",
    mistake:
      "Reaching for reparameterization on a discrete variable. It needs a smooth path from the noise to the sample, and a discrete draw has none, so the score-based estimator or a relaxation is required instead.",
    checkpoint:
      "Both estimators are unbiased. Why prefer one?",
    checkpointAnswer:
      "Variance. Unbiasedness only says they converge; the variance decides how many samples that takes.",
    remember:
      "Push the randomness outside the parameter and differentiate through.",
    checks: [
      {
        prompt: "What does reparameterization move outside the parameters?",
        options: ["The randomness", "The loss", "The gradient"],
        answerIndex: 0,
        hint: "The noise is drawn first, then transformed.",
        explanations: [
          "Correct, so the derivative flows through a smooth function.",
          "The loss is unchanged.",
          "The gradient is what is being computed.",
        ],
      },
      {
        prompt: "Both estimators are unbiased. What distinguishes them?",
        options: [
          "Variance, which decides how many samples are needed",
          "Correctness",
          "Computational cost per sample",
        ],
        answerIndex: 0,
        hint: "Nine times the variance means nine times the samples.",
        explanations: [
          "Correct. High variance makes an unbiased estimator useless.",
          "Both are correct on average.",
          "The per-sample costs are comparable.",
        ],
      },
      {
        prompt: "Why does reparameterization fail on a discrete variable?",
        options: [
          "There is no smooth path from the noise to the sample",
          "Discrete variables have no gradient",
          "The variance becomes infinite",
        ],
        answerIndex: 0,
        hint: "Differentiation needs smoothness.",
        explanations: [
          "Correct, which is why relaxations exist.",
          "The objective can still be differentiable in the parameters.",
          "The estimator simply does not apply.",
        ],
      },
    ],
  },
  {
    lessonId: "py.mc.m11_3.l3",
    atomId: "py.atom.ml.mcmc",
    conceptId: "py.ml.mcmc",
    title: "Markov chain Monte Carlo",
    requires: ["py.ml.reparameterization"],
    vocabulary: [
      ["proposal", "the candidate move suggested at each step"],
      ["acceptance rate", "the fraction of proposed moves the chain keeps"],
      ["mixing", "how quickly the chain moves through the distribution"],
    ],
    opening:
      "Build a random walk whose long-run distribution is the one you want. It gets there eventually; the proposal width decides whether eventually is soon enough.",
    outcome:
      "You will run the same chain at three proposal widths and see that a high acceptance rate is not a good sign.",
    why:
      "Acceptance rate is the most-watched diagnostic and the most misread one - both extremes indicate a chain that is not exploring.",
    mentalModel:
      "Picture tiny steps that are almost always accepted but go nowhere, and huge steps that are almost always rejected so the chain stands still. The useful width is between them.",
    firstTitle: "Three widths, one target",
    firstIntro:
      "Propose a move, accept it with probability equal to the density ratio, and record where you are. Only the width changes between runs.",
    firstCode: `import random, math, statistics

def chain(target, start, steps, width, seed=0):
    rng = random.Random(seed)
    x, accepted, samples = start, 0, []
    for _ in range(steps):
        candidate = rng.gauss(x, width)
        if rng.random() < target(candidate) / target(x):
            x, accepted = candidate, accepted + 1
        samples.append(x)
    return samples, round(accepted / steps, 4)

target = lambda x: math.exp(-0.5 * (x - 3.0) ** 2)
for width in (0.05, 1.0, 10.0):
    samples, rate = chain(target, 0.0, 20000, width)
    tail = samples[5000:]
    print("width", width, "accept", rate,
          "mean", round(statistics.mean(tail), 3),
          "sd", round(statistics.stdev(tail), 3))`,
    firstTrace:
      "Acceptance of ninety-eight, seventy-one and thirteen percent. All three recover a mean near three and a spread near one, but they did not do it equally well.",
    secondTitle: "Why the extremes are bad",
    secondIntro:
      "The narrow chain accepts almost everything because every move is tiny. The wide chain rejects almost everything and sits still for long stretches.",
    secondCode: `for width in (0.05, 1.0, 10.0):
    samples, rate = chain(target, 0.0, 20000, width)
    moves = sum(1 for i in range(1, len(samples))
                if samples[i] != samples[i - 1])
    span = max(samples[5000:]) - min(samples[5000:])
    print("width", width, "accept", rate, "moves", moves,
          "range explored", round(span, 2))`,
    secondTrace:
      "The narrow chain moves constantly and covers the least ground per move; the wide one barely moves at all. The middle width explores the most.",
    mistake:
      "Reading a high acceptance rate as a healthy chain. Near a hundred percent means the proposal is far too narrow, which is one of the worst states a sampler can be in.",
    checkpoint:
      "A chain accepts ninety-eight percent of its proposals. Is that good?",
    checkpointAnswer:
      "No. It means the steps are so small that almost anything is accepted, so the chain is barely exploring.",
    remember:
      "Both extremes of acceptance mean the chain is not exploring.",
    checks: [
      {
        prompt: "What does a very high acceptance rate indicate?",
        options: [
          "The proposal is too narrow and the chain barely moves",
          "The chain is mixing well",
          "The target is easy",
        ],
        answerIndex: 0,
        hint: "Tiny steps are almost always accepted.",
        explanations: [
          "Correct. It is a warning, not reassurance.",
          "Good mixing shows a moderate rate.",
          "Difficulty is not what it measures.",
        ],
      },
      {
        prompt: "What does a very low acceptance rate indicate?",
        options: [
          "The proposal is too wide and the chain stands still",
          "The target is misspecified",
          "The chain has converged",
        ],
        answerIndex: 0,
        hint: "Rejected moves leave the chain where it was.",
        explanations: [
          "Correct. Long runs of repeated values.",
          "The target is fine.",
          "Convergence is a separate question.",
        ],
      },
      {
        prompt: "What does the chain guarantee?",
        options: [
          "Its long-run distribution is the target",
          "Each sample is independent",
          "It converges in a fixed number of steps",
        ],
        answerIndex: 0,
        hint: "That is the whole construction.",
        explanations: [
          "Correct, and only in the long run.",
          "Consecutive samples are strongly correlated.",
          "Convergence time depends on the chain.",
        ],
      },
    ],
  },
  {
    lessonId: "py.mc.m11_3.l4",
    atomId: "py.atom.ml.hamiltonian-monte-carlo",
    conceptId: "py.ml.hamiltonian-monte-carlo",
    title: "Hamiltonian Monte Carlo",
    requires: ["py.ml.mcmc"],
    vocabulary: [
      ["gradient-guided proposal", "a move that follows the shape of the distribution rather than guessing"],
      ["simulated dynamics", "integrating a physical trajectory to generate the proposal"],
      ["energy drift", "the integration error, which becomes the rejection probability"],
    ],
    opening:
      "A random-walk proposal ignores everything the distribution is telling you. Using the gradient turns a blind guess into a trajectory that follows the shape.",
    outcome:
      "You will integrate a trajectory at several step sizes and watch the acceptance collapse when the integrator becomes unstable.",
    why:
      "The step size is the one parameter that matters, and it fails catastrophically rather than gradually.",
    mentalModel:
      "Picture rolling a ball across the distribution's landscape. Integrated accurately it conserves energy and the move is accepted; integrated too coarsely it flies off.",
    firstTitle: "Simulating the trajectory",
    firstIntro:
      "Alternate half-steps on the momentum with full steps on the position. Done accurately, the energy at the end matches the energy at the start.",
    firstCode: `import math

def trajectory(position, momentum, gradient, steps, step_size):
    momentum = momentum - 0.5 * step_size * gradient(position)
    for _ in range(steps):
        position = position + step_size * momentum
        momentum = momentum - step_size * gradient(position)
    momentum = momentum + 0.5 * step_size * gradient(position)
    return position, momentum

gradient = lambda q: q
energy = lambda q, p: 0.5 * q * q + 0.5 * p * p

for step_size in (0.1, 0.5, 1.5):
    q, p = trajectory(1.0, 1.0, gradient, 20, step_size)
    drift = energy(q, p) - energy(1.0, 1.0)
    print("step size", step_size, "energy drift", round(drift, 5),
          "accept", round(min(1.0, math.exp(-drift)), 4))`,
    firstTrace:
      "Drift of a thousandth at the smallest step and about a quarter in magnitude at one point five. All three are accepted, because the drift stays bounded.",
    secondTitle: "The cliff",
    secondIntro:
      "Past a threshold set by the distribution's curvature the integrator becomes unstable. The failure is not gradual.",
    secondCode: `q, p = trajectory(1.0, 1.0, gradient, 20, 2.1)
drift = energy(q, p) - energy(1.0, 1.0)
print("step size 2.1 energy drift", round(drift, 1))
print("accept", round(min(1.0, math.exp(-drift)), 4))`,
    secondTrace:
      "The drift explodes to fifty billion and the acceptance falls to zero. One step further and the sampler stops working entirely.",
    mistake:
      "Tuning the step size on a well-conditioned test problem and reusing it. The stability threshold is set by the sharpest direction of the target, so a poorly conditioned posterior needs a far smaller step.",
    checkpoint:
      "Acceptance drops from near one to zero when the step size changes slightly. What happened?",
    checkpointAnswer:
      "The integrator crossed its stability threshold. The energy drift grows without bound past that point, so every proposal is rejected.",
    remember:
      "Follow the gradient, and keep the step under the stability threshold.",
    checks: [
      {
        prompt: "What does the gradient give the proposal?",
        options: [
          "A direction that follows the distribution's shape",
          "A larger step size",
          "An acceptance guarantee",
        ],
        answerIndex: 0,
        hint: "It replaces a blind random walk.",
        explanations: [
          "Correct. That is why it explores correlated posteriors well.",
          "Step size is tuned separately.",
          "Proposals are still accepted or rejected.",
        ],
      },
      {
        prompt: "What becomes the rejection probability?",
        options: [
          "The energy drift from integration error",
          "The gradient magnitude",
          "The trajectory length",
        ],
        answerIndex: 0,
        hint: "Perfect integration would conserve it.",
        explanations: [
          "Correct. Accurate integration means high acceptance.",
          "Magnitude alone does not cause rejection.",
          "Length affects cost, not directly acceptance.",
        ],
      },
      {
        prompt: "How does the sampler fail as the step size grows?",
        options: [
          "Abruptly, once the integrator becomes unstable",
          "Gradually",
          "It does not fail",
        ],
        answerIndex: 0,
        hint: "The drift went from a quarter to fifty billion.",
        explanations: [
          "Correct, which is why the threshold must be respected.",
          "The transition is very sharp.",
          "Past the threshold acceptance is zero.",
        ],
      },
    ],
  },
];

export const ML_APPROXIMATE_ATOMS = ML_APPROXIMATE_SPECS.map(guidedMasteryAtom);
export const ML_APPROXIMATE_CONCEPTS = ML_APPROXIMATE_SPECS.map(guidedMasteryConcept);
export const ML_APPROXIMATE_LESSON_CONTENT = guidedLessonContent(ML_APPROXIMATE_SPECS);

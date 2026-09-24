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

const ML_GENERATIVE_SPECS: GuidedMasterySpec[] = [
  {
    lessonId: "py.mc.m7_2.l1",
    atomId: "py.atom.ml.variational-autoencoders",
    conceptId: "py.ml.variational-autoencoders",
    title: "Compression that you can sample from",
    requires: ["py.ml.model-based-offline-rl"],
    vocabulary: [
      ["latent code", "the compressed vector an encoder produces"],
      ["reconstruction term", "how well the decoder rebuilds the input from its code"],
      ["divergence term", "how far the encoder's distribution sits from the prior"],
      ["reparameterization", "moving the randomness outside the network so gradients can pass"],
    ],
    opening: "A plain autoencoder compresses and rebuilds, and its latent space is full of holes that decode to nothing. Adding one term to the objective fills those holes, and the result is a space you can draw from.",
    outcome: "You will separate the two terms of the objective, compute the divergence, and explain what the reparameterization trick makes possible.",
    why: "The two-term structure of reconstruction against a prior recurs throughout generative modelling. The reparameterization trick is also the standard answer whenever a gradient has to pass through a sample.",
    mentalModel: "Picture a filing system that must both store documents faithfully and keep the drawers evenly filled. The second requirement is what lets you open a drawer at random and find something sensible inside.",
    firstTitle: "Two terms pulling against each other",
    firstIntro: "Reconstruction wants precise codes; the divergence wants them to look like the prior.",
    firstCode: `import math

def divergence(means, log_variances):
    return -0.5 * sum(1 + lv - mean * mean - math.exp(lv)
                      for mean, lv in zip(means, log_variances))

cases = [
    ("exactly the prior", [0.0, 0.0], [0.0, 0.0]),
    ("shifted away", [1.0, 0.0], [0.0, 0.0]),
    ("too narrow", [0.0, 0.0], [-2.0, 0.0]),
    ("too wide", [0.0, 0.0], [1.0, 0.0]),
]

for label, means, log_variances in cases:
    print(f"{label:<20} divergence {divergence(means, log_variances):.6f}")`,
    firstTrace: "A code matching the prior exactly costs nothing, and every departure from it costs something. Shifting the mean away or shrinking the spread both add to the penalty, which is what stops the encoder assigning each input its own isolated point. That pressure is precisely what fills the gaps between codes.",
    secondTitle: "The reparameterization trick moves the randomness aside",
    secondIntro: "Sampling inside the network blocks the gradient; sampling outside and scaling does not.",
    secondCode: `import math

def sample_directly(mean, log_variance, noise):
    return mean + math.exp(0.5 * log_variance) * noise

print("a code is a deterministic function of the mean, the spread, and the noise:")
for noise in (-1.0, 0.0, 0.5, 1.5):
    value = sample_directly(1.0, 0.0, noise)
    print(f"  noise {noise:>5} -> code {value:>6.3f}")

print()
print("the derivative with respect to the mean is 1 for every noise value")
print("so the gradient reaches the encoder unchanged")`,
    secondTrace: "Written this way the code is an ordinary function of the mean and the spread, with the randomness arriving as an input rather than being drawn inside. The derivative with respect to the mean is one regardless of the noise drawn, so the gradient passes straight through. Sampling directly from a distribution the network produced would have no such derivative.",
    mistake: "Do not weight the divergence term so heavily that the encoder ignores the input. Pushing every code toward the prior makes the latent space perfectly smooth and completely uninformative, and the decoder learns to produce one blurry average of the training set.",
    checkpoint: "Why can a plain autoencoder not be sampled from?",
    checkpointAnswer: "Because nothing constrains where its codes land, so the space between them is unoccupied and decodes to nonsense. The divergence term is what pushes the codes to fill a known distribution, which is exactly the distribution you can then draw a fresh code from.",
    remember: "Reconstruction and divergence pull against each other, and the second is what makes the latent space samplable. Reparameterization moves the randomness to an input so gradients still reach the encoder.",
    checks: [
      q("What does the divergence term buy?", ["A latent space you can sample from", "Sharper reconstructions", "Faster training"], 0, "It fills the gaps between codes.", ["Correct. A plain autoencoder has holes that decode to nonsense.", "It trades reconstruction quality away.", "It adds work per step."]),
      q("Why is reparameterization needed?", ["A gradient cannot pass through a sampling operation", "It makes sampling faster", "It reduces the parameter count"], 0, "Moving the noise to an input restores the derivative.", ["Correct. The code becomes an ordinary function of the parameters.", "The cost is the same.", "No parameters are removed."]),
      q("The divergence term is weighted far too heavily. What happens?", ["The decoder produces one blurry average of the training set", "Reconstructions become sharper", "Training diverges"], 0, "Every code is pushed onto the prior.", ["Correct. The space becomes smooth and uninformative.", "Sharpness comes from the reconstruction term.", "It converges, uselessly."]),
    ],
  },
  {
    lessonId: "py.mc.m7_2.l2",
    atomId: "py.atom.ml.generative-adversarial-networks",
    conceptId: "py.ml.generative-adversarial-networks",
    title: "Two networks with opposing objectives",
    requires: ["py.ml.variational-autoencoders"],
    vocabulary: [
      ["generator", "the network producing samples from noise"],
      ["discriminator", "the network judging whether a sample is real"],
      ["saturating loss", "an objective whose gradient vanishes exactly when it is needed"],
      ["mode collapse", "the generator producing a narrow slice of the real variety"],
    ],
    opening: "Instead of writing down what makes a sample good, train a second network to spot fakes and let the first one try to fool it. The idea is elegant and the training dynamics are the least stable in the subject.",
    outcome: "You will compare the saturating and non-saturating generator losses, and name the two failure modes the game invites.",
    why: "The saturating-loss fix is the clearest example of a gradient argument changing an objective, and mode collapse explains why sample quality and sample variety must be measured separately.",
    mentalModel: "Picture a forger and an inspector improving against each other. Progress depends on neither getting far ahead, and if the inspector becomes perfect the forger stops receiving useful feedback entirely.",
    firstTitle: "The obvious generator loss vanishes when it is needed most",
    firstIntro: "Early in training the discriminator is confident, and that is exactly where the gradient disappears.",
    firstCode: `import math

def saturating(discriminator_output):
    return math.log(1 - discriminator_output)

def non_saturating(discriminator_output):
    return -math.log(discriminator_output)

print(f"{'D(fake)':>9}{'saturating':>14}{'non-saturating':>17}")
for output in (0.01, 0.1, 0.5, 0.9):
    print(f"{output:>9}{saturating(output):>14.4f}{non_saturating(output):>17.4f}")

print()
print("at D(fake) = 0.01 the generator is doing badly and needs a large signal")`,
    firstTrace: "When the discriminator confidently rejects the fakes, the saturating loss is almost flat at minus one hundredth, so the generator receives nearly nothing. The non-saturating form gives a value of four and a half at exactly that point. Flipping the objective this way is the standard fix, and it changes the gradient rather than the game.",
    secondTitle: "Quality and variety are separate failures",
    secondIntro: "A generator that produces one perfect sample forever has solved the wrong problem.",
    secondCode: `REAL = ["cat", "dog", "bird", "fish", "horse"]

def evaluate(samples):
    produced = set(samples)
    covered = len(produced & set(REAL)) / len(REAL)
    valid = sum(1 for s in samples if s in REAL) / len(samples)
    return round(valid, 3), round(covered, 3)

runs = {
    "healthy":       ["cat", "dog", "bird", "fish", "horse", "dog"],
    "mode collapse": ["cat", "cat", "cat", "cat", "cat", "cat"],
    "low quality":   ["blur", "smear", "cat", "noise", "blob", "dog"],
}

print(f"{'run':<16}{'quality':>9}{'coverage':>10}")
for name, samples in runs.items():
    quality, coverage = evaluate(samples)
    print(f"{name:<16}{quality:>9}{coverage:>10}")`,
    secondTrace: "The collapsed run scores perfectly on quality and terribly on coverage, and a single metric averaging the two would hide that entirely. The low-quality run has the opposite profile. Reporting both is the only way to distinguish a generator that is precise from one that is merely narrow.",
    mistake: "Do not judge a generator by sample quality alone. A model that has collapsed onto one mode produces flawless samples of one thing, and any metric that does not measure coverage will rate it as the best model you have trained.",
    checkpoint: "The discriminator reaches near-perfect accuracy early in training. What does that do?",
    checkpointAnswer: "It starves the generator of gradient, because a confident discriminator gives almost no signal about how to improve. That is exactly the case the non-saturating loss was introduced to handle, and it is also why the two networks are usually kept close in strength rather than one being trained to convergence.",
    remember: "The generator and discriminator improve against each other, and neither may get far ahead. Use the non-saturating loss, and measure quality and coverage separately.",
    checks: [
      q("Why replace the saturating generator loss?", ["Its gradient vanishes exactly when the generator is doing badly", "It is slower to compute", "It is harder to implement"], 0, "A confident discriminator leaves the loss almost flat.", ["Correct. The non-saturating form is large there instead.", "The cost is identical.", "Both are one line."]),
      q("What does mode collapse look like on a quality metric?", ["Excellent, because every sample is a perfect example of one thing", "Poor, because the samples are blurry", "Unchanged"], 0, "Quality alone cannot detect it.", ["Correct. Coverage is what exposes it.", "Collapsed samples are often very sharp.", "It looks like the best model you have."]),
      q("Why keep the two networks close in strength?", ["A discriminator that is too strong starves the generator of gradient", "They share parameters", "It halves the training time"], 0, "Feedback dies when one side wins.", ["Correct. That is the central instability of the method.", "The networks are separate.", "Balance is about stability, not speed."]),
    ],
  },
  {
    lessonId: "py.mc.m7_2.l3",
    atomId: "py.atom.ml.normalizing-flows",
    conceptId: "py.ml.normalizing-flows",
    title: "Invertible transforms give exact likelihoods",
    requires: ["py.ml.generative-adversarial-networks"],
    vocabulary: [
      ["invertible transform", "a mapping that can be undone exactly"],
      ["change of variables", "the rule relating a density before and after a transform"],
      ["Jacobian determinant", "how much a transform stretches or shrinks volume"],
      ["exact likelihood", "a probability the model can state rather than bound"],
    ],
    opening: "Variational autoencoders bound the likelihood and adversarial networks never compute one at all. A flow gives the exact number, at the price of every layer being invertible with a cheap volume term.",
    outcome: "You will apply the change of variables to compute a density, and see why the architecture is constrained.",
    why: "Exact likelihoods matter for anomaly detection, compression and any decision that needs a calibrated probability. The volume term also explains why flow architectures look so unlike ordinary networks.",
    mentalModel: "Picture stretching a rubber sheet with a fixed amount of paint on it. Stretching spreads the paint thinner, and the density anywhere is the original density divided by how much that spot was stretched.",
    firstTitle: "Density transforms by dividing out the stretch",
    firstIntro: "The transformed density is the base density at the pre-image, divided by the local stretch.",
    firstCode: `import math

def base_log_density(z):
    return -0.5 * (z * z + math.log(2 * math.pi))

def flow_log_density(x, scale, shift):
    z = (x - shift) / scale
    return base_log_density(z) - math.log(abs(scale))

print("a standard normal shifted by 1 and stretched by 2:")
for x in (1.0, 3.0, -1.0):
    print(f"  x = {x:>5}  log density {flow_log_density(x, 2.0, 1.0):.4f}")

print()
print("stretching by 2 subtracts log 2 from every log density:")
print(f"  log 2 = {math.log(2):.4f}")`,
    firstTrace: "Every point's density is the base density at its pre-image, reduced by the logarithm of the stretch. Doubling the width halves the density everywhere, which is exactly what subtracting the log of two does. The transform is invertible, so the pre-image is a computation rather than a search.",
    secondTitle: "The volume term is what constrains the architecture",
    secondIntro: "A general layer's volume term costs the cube of the width, so flows use layers where it does not.",
    secondCode: `def determinant_cost(width, kind):
    if kind == "general":
        return width ** 3
    if kind == "triangular":
        return width
    if kind == "diagonal":
        return width
    raise ValueError("unknown layer kind")

print(f"{'width':>7}{'general':>14}{'triangular':>14}")
for width in (64, 512, 4096):
    print(f"{width:>7}{determinant_cost(width, 'general'):>14,}"
          f"{determinant_cost(width, 'triangular'):>14,}")

print()
print("a triangular Jacobian's determinant is the product of its diagonal")
print("which is why coupling layers split the input and transform one half")`,
    secondTrace: "A general layer at a width of four thousand would need nearly seventy billion operations for its determinant alone, per sample. A triangular structure reduces that to a product along the diagonal, which is linear. Coupling layers achieve exactly that by leaving half the input untouched and using it to parameterize the transform of the other half.",
    mistake: "Do not design a flow layer without checking that its inverse and its volume term are both cheap. A layer that is invertible in principle but needs an iterative solver to invert makes sampling impractical, however good the likelihoods look.",
    checkpoint: "Why do flows use coupling layers rather than ordinary dense ones?",
    checkpointAnswer: "Because a dense layer's Jacobian determinant costs the cube of the width to compute and its inverse is another matrix solve. A coupling layer leaves half the input unchanged, which makes the Jacobian triangular, so the determinant is a product along the diagonal and the inverse is a rearrangement.",
    remember: "A flow's density is the base density at the pre-image divided by the local stretch. Every layer must be invertible with a cheap determinant, which is why coupling structures dominate.",
    checks: [
      q("What does the Jacobian determinant account for?", ["How much the transform stretches or shrinks volume", "The number of parameters", "The depth of the flow"], 0, "Stretching spreads the density thinner.", ["Correct. Its logarithm is subtracted from the log density.", "Parameters do not enter the change of variables.", "Depth adds terms rather than defining one."]),
      q("Why are coupling layers used?", ["They make the Jacobian triangular, so the determinant is a diagonal product", "They have more capacity", "They train faster"], 0, "A general determinant costs the cube of the width.", ["Correct. The inverse is also a rearrangement.", "They have less capacity per layer, not more.", "Speed follows from the cheap determinant."]),
      q("What do flows offer that adversarial networks do not?", ["An exact likelihood rather than none at all", "Better sample quality", "Faster sampling"], 0, "That is the whole point of invertibility.", ["Correct. It matters for anomaly detection and compression.", "Adversarial samples are often sharper.", "Sampling costs a full inverse pass."]),
    ],
  },
  {
    lessonId: "py.mc.m7_2.l4",
    atomId: "py.atom.ml.diffusion-models",
    conceptId: "py.ml.diffusion-models",
    title: "Destroy the data, then learn to undo one step",
    requires: ["py.ml.normalizing-flows"],
    vocabulary: [
      ["forward process", "adding noise on a fixed schedule until nothing remains"],
      ["reverse process", "the learned model that removes a little noise at a time"],
      ["noise schedule", "how much signal survives at each step"],
      ["denoising objective", "predicting the noise that was added rather than the clean sample"],
    ],
    opening: "Generating an image in one step is hard. Removing a small amount of noise from a nearly clean image is easy, and repeating that a thousand times turns pure noise into a sample.",
    outcome: "You will build a noise schedule, see how much signal survives at each step, and state what the network is actually trained to predict.",
    why: "Diffusion is the dominant approach for images, audio and video, and the whole method rests on making one step easy enough that a thousand of them compose.",
    mentalModel: "Picture a photograph slowly dissolving into static over a thousand frames. Learning to reverse one frame is a small ask, and running that in reverse from pure static reconstructs a photograph that never existed.",
    firstTitle: "The schedule decides how fast the signal dies",
    firstIntro: "The cumulative product of what survives each step is what matters.",
    firstCode: `def schedule(steps, start=1e-4, end=0.02):
    betas = [start + (end - start) * i / (steps - 1) for i in range(steps)]
    surviving = []
    running = 1.0
    for beta in betas:
        running *= (1 - beta)
        surviving.append(running)
    return surviving

surviving = schedule(1000)
print(f"{'step':>6}{'signal fraction':>18}")
for step in (0, 100, 250, 500, 750, 999):
    print(f"{step:>6}{surviving[step] ** 0.5:>18.4f}")

print()
print("by the last step almost nothing of the original remains")`,
    firstTrace: "The signal fraction falls from essentially one to under a hundredth across the schedule. Halfway through, only about a quarter of the original amplitude survives, which is already unrecognizable. The schedule is fixed in advance and nothing about it is learned.",
    secondTitle: "The network predicts the noise, not the image",
    secondIntro: "A noisy sample is a known mixture, so predicting either component determines the other.",
    secondCode: `import math

def add_noise(clean, surviving, noise):
    return math.sqrt(surviving) * clean + math.sqrt(1 - surviving) * noise

def recover(noisy, surviving, predicted_noise):
    return (noisy - math.sqrt(1 - surviving) * predicted_noise) / math.sqrt(surviving)

clean = 1.0
noise = 0.5
for surviving in (0.99, 0.5, 0.08):
    noisy = add_noise(clean, surviving, noise)
    rebuilt = recover(noisy, surviving, noise)
    print(f"surviving {surviving:<5} noisy {noisy:>7.4f}  "
          f"recovered {rebuilt:>7.4f}")

print()
print("predicting the noise and predicting the clean sample are equivalent")
print("the noise target is used because its scale stays constant across steps")`,
    secondTrace: "Recovering the clean value from the noisy one and the noise is exact algebra, so the two prediction targets carry the same information. The noise is preferred because it has the same scale at every step, while the clean sample's contribution shrinks as the schedule advances. A target whose scale is stable is far easier to train against.",
    mistake: "Do not train the model to predict the clean sample at late steps. Almost none of it survives there, so the target is dominated by whatever the noise happened to be, and the loss is measuring a quantity the input barely constrains.",
    checkpoint: "Why is one denoising step easy when generating in one shot is hard?",
    checkpointAnswer: "Because the input at each step already contains most of the answer. Removing a small amount of noise from a nearly complete sample is a local correction, whereas producing the whole sample from nothing requires the model to get every part right simultaneously.",
    remember: "A fixed schedule destroys the data and a learned model undoes one step at a time. The network predicts the added noise, because that target keeps a constant scale throughout.",
    checks: [
      q("What is learned in a diffusion model?", ["The reverse step, undoing a small amount of noise", "The forward noising process", "The noise schedule"], 0, "The forward process is fixed in advance.", ["Correct. Composing many easy steps is the whole idea.", "Adding noise needs no learning.", "The schedule is chosen, not learned."]),
      q("Why predict the noise rather than the clean sample?", ["The noise target keeps the same scale at every step", "It is easier to compute", "The clean sample is unavailable"], 0, "The two are algebraically equivalent.", ["Correct. A stable target scale trains far better.", "Both are equally easy to compute.", "The clean sample is available during training."]),
      q("What makes one denoising step easy?", ["The input already contains most of the answer", "The network is very large", "The schedule is short"], 0, "It is a local correction rather than full generation.", ["Correct. That is why the steps compose.", "Size is a separate choice.", "Schedules are usually long."]),
    ],
  },
  {
    lessonId: "py.mc.m7_2.l5",
    atomId: "py.atom.ml.guidance",
    conceptId: "py.ml.guidance",
    title: "Guidance trades variety for obedience",
    requires: ["py.ml.diffusion-models"],
    vocabulary: [
      ["score", "the direction in which the density increases fastest"],
      ["conditional generation", "sampling constrained by a label or a prompt"],
      ["classifier-free guidance", "extrapolating from the unconditional toward the conditional prediction"],
      ["guidance scale", "how far past the conditional prediction to push"],
    ],
    opening: "A conditional model already produces samples matching a prompt, and usually not closely enough. Guidance exaggerates the difference between the conditional and unconditional predictions, which sharpens the match and narrows the variety.",
    outcome: "You will compute a guided prediction at several scales, and state exactly what is traded away as the scale rises.",
    why: "The guidance scale is the single most consequential setting on any modern generative system, and its effect is a trade rather than an improvement.",
    mentalModel: "Picture two pieces of advice, one general and one specific to your situation. Guidance is following the specific advice and then continuing some distance further in the same direction.",
    firstTitle: "Extrapolating past the conditional prediction",
    firstIntro: "A scale of one is ordinary conditional generation, and anything above it goes further.",
    firstCode: `def guided(unconditional, conditional, scale):
    return unconditional + scale * (conditional - unconditional)

print(f"{'scale':>7}{'prediction':>13}  reading")
for scale in (0.0, 1.0, 3.0, 7.5, 15.0):
    value = guided(0.2, 0.8, scale)
    if scale == 0:
        reading = "ignores the prompt entirely"
    elif scale == 1:
        reading = "ordinary conditional generation"
    else:
        reading = "past the conditional prediction"
    print(f"{scale:>7}{value:>13.4f}  {reading}")`,
    firstTrace: "A scale of zero returns the unconditional prediction and a scale of one returns the conditional one exactly. Everything past one is extrapolation, moving further in the direction the prompt pointed than the model itself suggested. Nothing about that extrapolation is guaranteed to remain a plausible sample.",
    secondTitle: "What rising scale costs",
    secondIntro: "Prompt adherence and sample variety move in opposite directions.",
    secondCode: `def outcomes(scale):
    adherence = min(1.0, 0.35 + 0.09 * scale)
    variety = max(0.05, 1.0 / (1.0 + 0.35 * scale))
    artefacts = max(0.0, 0.04 * (scale - 5.0))
    return round(adherence, 3), round(variety, 3), round(artefacts, 3)

print(f"{'scale':>7}{'adherence':>12}{'variety':>10}{'artefacts':>12}")
for scale in (1.0, 3.0, 5.0, 7.5, 12.0, 20.0):
    adherence, variety, artefacts = outcomes(scale)
    print(f"{scale:>7}{adherence:>12}{variety:>10}{artefacts:>12}")

print()
print("these are illustrative curves; the shape is what matters")
print("adherence saturates while variety keeps falling")`,
    secondTrace: "Adherence climbs quickly and then saturates, while variety keeps falling for as long as the scale rises. Past the point where adherence has levelled off, every further increase is paying variety for nothing. That is why the useful range is narrow and why the setting is worth tuning rather than maximizing.",
    mistake: "Do not raise the guidance scale until the samples look most impressive on a single prompt. Adherence saturates while variety keeps collapsing, so the setting that looks best on one example is frequently one that produces near-identical outputs across every prompt you have.",
    checkpoint: "What does a guidance scale of one correspond to?",
    checkpointAnswer: "Ordinary conditional generation, with no extrapolation at all. The formula returns exactly the conditional prediction there. Any larger value pushes further than the model itself proposed, and any smaller one pulls back toward ignoring the condition.",
    remember: "Guidance extrapolates from the unconditional prediction through the conditional one. Adherence saturates while variety keeps falling, so the scale is a trade rather than a quality dial.",
    checks: [
      q("What does a guidance scale of 1 produce?", ["Exactly the conditional prediction", "The unconditional prediction", "The average of the two"], 0, "Everything above one is extrapolation.", ["Correct. No extrapolation happens there.", "That is a scale of zero.", "Averaging would be a scale of one half."]),
      q("What does raising the guidance scale cost?", ["Sample variety", "Prompt adherence", "Inference speed"], 0, "The two move in opposite directions.", ["Correct. Adherence saturates while variety keeps falling.", "Adherence is what it buys.", "The cost per step is unchanged."]),
      q("Why is tuning guidance on one prompt misleading?", ["The best-looking setting often collapses variety across all prompts", "Prompts differ in length", "The scale is prompt-specific"], 0, "One example cannot show a variety collapse.", ["Correct. Judge it across a set of prompts.", "Length is not the issue.", "One scale is usually applied globally."]),
    ],
  },
];

export const ML_GENERATIVE_ATOMS = ML_GENERATIVE_SPECS.map(guidedMasteryAtom);
export const ML_GENERATIVE_CONCEPTS = ML_GENERATIVE_SPECS.map(guidedMasteryConcept);
export const ML_GENERATIVE_LESSON_CONTENT = guidedLessonContent(ML_GENERATIVE_SPECS);

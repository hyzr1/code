# Machine Learning Course — Boilerplate & Ordering

**Goal:** zero → frontier. Everything an ML engineer or research scientist at a top lab (OpenAI, Anthropic, DeepMind) needs — the math, the classical ground, deep learning, modern LLMs and their training at scale, plus the systems, research, and safety skills. Prerequisite: the Python course.

**Ordering principle:** math before models, models before their large-scale training, single-machine before distributed, using before building before researching. The core spine (Parts 1–10) takes you to hireable-at-a-top-lab. The **Mastery tier (Parts 11–13)** stacks the extremely advanced, less-essential-but-deep topics at the very end — theory, kernels, and the open frontier — so mastering the whole thing makes you top-of-field.

**Status:** structure only — Parts → Modules → Lessons (title — one-line goal). No lesson content yet.

---

## Part 1 — Mathematical foundations
*The language of ML. Nothing here is optional; everything downstream is built from it.*

### Module 1.1 — Linear algebra
Data is vectors and matrices; this is how you compute with them.
- Scalars, vectors, and vector operations — the atom of ML data.
- The dot product — geometry, projection, the neuron.
- Norms — L1, L2, L∞ and what they measure.
- Matrices and matrix-vector products — a linear layer.
- Matrix multiplication — composition of linear maps.
- Transpose, identity, inverse — and when an inverse exists.
- Independence, span, basis, and rank — determine what information a representation preserves or loses.
- Eigenvalues and eigenvectors — directions a matrix only scales.
- Determinant and trace — interpret volume scaling and total diagonal action without treating either as magic.
- Singular value decomposition — the most useful factorization in ML.
- Matrix decompositions — LU, QR, Cholesky (intro).
- Vector spaces and orthogonality — projections and least squares.

### Module 1.2 — Calculus & optimization math
How a model measures which way to improve.
- Exponents, logarithms, and summations — manipulate the notation used by likelihoods, losses, and scaling laws.
- Derivatives and differentiation rules — compute local rates of change from first principles.
- Partial derivatives and the gradient — steepest ascent.
- The chain rule — the engine of backprop.
- Jacobians and Hessians — vector- and second-order derivatives.
- Matrix calculus — differentiating through vectors and matrices.
- Taylor approximations — replace a hard local function with a tractable polynomial model.
- Convexity — why it guarantees a global minimum.
- Constrained optimization — Lagrange multipliers, KKT (intro).

### Module 1.3 — Probability
The mathematics of uncertainty that every model predicts in.
- Sample spaces, events, and axioms — translate an uncertain process into outcomes and valid probabilities.
- Conditional probability and independence — distinguish updated probability from unrelated events.
- Bayes' theorem — updating beliefs with evidence.
- Random variables — discrete and continuous.
- Expectation, variance, and covariance — summarize location, spread, and joint movement of random variables.
- Key distributions — Bernoulli, Binomial, Categorical, Poisson.
- The Gaussian — the workhorse distribution.
- Joint, marginal, and conditional distributions — move between a full probability model and the views a question requires.
- Multivariate Gaussians and covariance matrices — connect correlated geometry to a probability density.
- Monte Carlo estimation — approximate expectations with reproducible random samples and uncertainty estimates.
- Maximum likelihood and MAP estimation — fit parameters by separating evidence from prior assumptions.

### Module 1.4 — Statistics & information theory
Reasoning from data, and measuring information itself.
- Populations, samples, and estimators — judge bias, variance, and consistency instead of trusting one sample statistic.
- Descriptive statistics and correlation — summarize data without confusing association with causation.
- Laws of large numbers and central limits — explain why averages stabilize and when normal approximations apply.
- Tests, p-values, and confidence intervals — state what frequentist evidence does and does not establish.
- Sampling and the bootstrap — estimate uncertainty when analytic formulas are unavailable.
- Entropy — a measure of uncertainty.
- Cross-entropy and KL divergence — comparing distributions.
- Mutual information — measure dependence that ordinary correlation can miss.
- Multiple testing and statistical power — control false discoveries and design experiments capable of detecting real effects.

---

## Part 2 — Scientific Python & the ML toolkit
*Turn the math into fast, reproducible code before touching models.*

### Module 2.1 — Numerical Python
Fast array math — the substrate every ML library sits on.
- NumPy arrays — shapes, dtypes, broadcasting.
- Vectorization — replacing loops with array ops.
- Linear algebra in NumPy — matmul, solve, decompositions.
- Numerical stability — prevent overflow, underflow, cancellation, and invalid comparisons.
- Random number generation and seeding — use independent generators and reproduce stochastic experiments.

### Module 2.2 — Data handling & visualization
Getting real, messy data into shape and looking at it.
- pandas — Series, DataFrames, indexing, joins, groupby.
- Loading and cleaning data — handle missing values, duplicates, types, and malformed records explicitly.
- Tabular preprocessing — encode categories, scale features, and fit transformations on training data only.
- Exploratory data analysis — reveal distributions, relationships, outliers, and collection failures before modeling.
- Plotting — matplotlib, distributions, learning curves.

### Module 2.3 — Tensors & autograd
The array and differentiation substrate used later to build neural networks.
- Tensors and GPU acceleration — PyTorch basics.
- Automatic differentiation — how autograd builds the graph.
- Tensor shapes and broadcasting — make dimensions explicit before operations silently broadcast.
- Datasets, DataLoaders, and batching — stream examples into reproducible mini-batches.
- Reproducibility and determinism — control every random source and document unavoidable nondeterminism.

### Module 2.4 — Practical workflow
The habits that keep experiments honest and fast.
- Experiment tracking and configuration — make every result traceable to code, data, parameters, and environment.
- Profiling bottlenecks — measure data, CPU, GPU, memory, and synchronization before optimizing.
- Working on GPUs — memory, device placement.
- Notebooks, scripts, and pipelines — choose the right execution surface and promote experiments into repeatable jobs.

---

## Part 3 — Classical machine learning
*The concepts and models that frame everything, and that still win on tabular data.*

### Module 3.1 — The ML framing
The vocabulary and pitfalls that apply to every model you'll ever train.
- Learning paradigms — distinguish supervised, unsupervised, self-supervised, and reinforcement learning by their feedback signal.
- Features, labels, and examples — turn a real question into a data matrix and target without hiding assumptions.
- Baselines and problem formulation — define a metric and a simple reference before choosing a complex model.
- Train, validation, and test splits — preserve a genuinely untouched estimate and block every route for leakage.
- Generalization and fit — diagnose underfitting and overfitting from train and validation behavior.
- Bias and variance — connect model capacity, data, and error patterns to the next intervention.
- Cross-validation and search — tune hyperparameters without spending the test set.

### Module 3.2 — Linear models
The simplest predictors — and the loss/regularization ideas they introduce.
- Linear regression — normal equation and gradient descent.
- Loss functions — MSE, MAE, and when to use each.
- Logistic regression — the sigmoid and log-loss.
- Softmax regression — multiclass.
- Linear-model regularization — L1 (lasso), L2 (ridge), elastic net.
- Feature scaling and engineering — transform inputs inside a leakage-safe pipeline that can run identically in production.

### Module 3.3 — Instance, probabilistic & tree models
Predictors that memorize neighborhoods, model conditional probabilities, or partition feature space.
- k-nearest neighbors — predict from local examples while exposing the cost of distance in high dimensions.
- Naive Bayes — derive a fast probabilistic classifier from conditional-independence assumptions.
- Decision trees — entropy, Gini, information gain.
- The curse of dimensionality — explain why distance, density, and sample coverage degrade as dimensions grow.

### Module 3.4 — Ensembles
Combining many weak models into one strong one — still SOTA on tables.
- Bagging and random forests — reduce variance with bootstrap diversity and randomized feature choices.
- Boosting — AdaBoost, gradient boosting.
- Gradient-boosted trees — XGBoost / LightGBM in practice.
- Stacking and blending — train a meta-model without leaking validation targets into base learners.

### Module 3.5 — Kernels & margins
Maximum-margin classifiers and the trick that makes them non-linear.
- Support vector machines — the maximum margin.
- The kernel trick — non-linear boundaries.

### Module 3.6 — Unsupervised learning
Finding structure when there are no labels.
- k-means clustering — alternate assignment and centroid updates while recognizing its geometric assumptions.
- Hierarchical clustering and DBSCAN — recover nested or irregular groups without forcing spherical clusters.
- Gaussian mixtures and EM — alternate soft assignments and parameter updates under a probabilistic model.
- Principal component analysis — variance-maximizing projection.
- t-SNE and UMAP — nonlinear visualization.
- Anomaly and novelty detection — choose density, distance, or isolation methods and evaluate rare-event behavior.

### Module 3.7 — Evaluation & calibration
Measuring a model honestly, including when the classes are skewed.
- Classification metrics — accuracy, precision, recall, F1.
- Confusion matrices and thresholds — connect decision thresholds to the exact errors a product pays for.
- ROC, precision-recall curves, and AUC — choose a curve that remains informative under the observed class balance.
- Regression metrics — R², RMSE, MAE.
- Probability calibration — test whether predicted probabilities match empirical frequencies and repair them without leakage.
- Imbalanced data — combine suitable metrics, resampling, weighting, and thresholding without distorting evaluation.
- Grouped and time-aware validation — prevent identities or future observations from crossing split boundaries.

---

## Part 4 — Deep learning foundations
*From one neuron to a trained multi-layer network — the mechanics in full.*

### Module 4.1 — Neural network basics
Why stacking linear layers with non-linearities can learn anything.
- The perceptron and XOR — prove why one linear boundary cannot represent every Boolean function.
- Multi-layer perceptrons — stacking linear layers.
- Activation functions — sigmoid, tanh, ReLU and variants.
- Why non-linearity — the universal approximation idea.

### Module 4.2 — Training a network
How gradients flow backward so every weight knows how to change.
- Forward passes — trace tensor shapes through repeated matrix multiplication, bias, and activation.
- Loss functions for deep nets — cross-entropy, MSE.
- Backpropagation — the chain rule through the whole graph.
- Reverse-mode autodiff — traverse a computational graph backward while accumulating shared gradients.
- A training loop from scratch — connect forward, loss, zero-grad, backward, optimizer step, and evaluation modes.

### Module 4.3 — Optimization
The algorithms that actually move the weights, and how fast.
- Gradient descent — batch, stochastic, mini-batch.
- Momentum and Nesterov acceleration — use velocity to damp oscillation and anticipate the next gradient.
- Adaptive methods — AdaGrad, RMSProp, Adam, AdamW.
- Learning-rate schedules and warmup — control early instability and late-stage convergence deliberately.
- Second-order intuition — understand curvature information and why full Hessian methods rarely scale.

### Module 4.4 — Making training work
The tricks that turn a diverging run into a converging one.
- Weight initialization — Xavier, He.
- Normalization — batch, layer, group.
- Neural regularization — dropout, weight decay, early stopping, augmentation.
- Vanishing and exploding gradients — trace unstable signal flow and apply clipping, residuals, normalization, or initialization appropriately.
- Debugging training — overfit one batch, inspect gradients, and change one controlled variable at a time.

---

## Part 5 — Deep learning architectures
*The building blocks that dominate perception and sequence modeling.*

### Module 5.1 — Convolutional networks
Weight-sharing filters that made computer vision work.
- Convolutions, stride, and padding — compute output shapes and explain weight sharing spatially.
- Pooling and feature hierarchies — trade spatial resolution for invariance and receptive field.
- Classic CNNs — LeNet, AlexNet, VGG, ResNet (skip connections).
- Transfer learning and fine-tuning — adapt a pretrained backbone with appropriate freezing, learning rates, and validation.

### Module 5.2 — Computer vision tasks
Turning a backbone into detection, segmentation, and more.
- Image classification — construct the data, augmentation, backbone, head, loss, and metric pipeline end to end.
- Object detection — R-CNN family, YOLO (intro).
- Semantic and instance segmentation — U-Net, Mask R-CNN (intro).
- Vision augmentation — apply label-preserving transformations without corrupting validation data.

### Module 5.3 — Sequence models
Modeling order and memory before attention took over.
- Recurrent networks — RNNs and the vanishing-gradient problem.
- LSTMs and GRUs — use gates to preserve, expose, and forget information over long sequences.
- Sequence-to-sequence models — map variable-length inputs to outputs with explicit encoder and decoder state.
- Encoder-decoder attention — let each output retrieve the most relevant encoded positions instead of one fixed vector.

### Module 5.4 — Attention foundations
The content-addressed retrieval mechanism that replaces recurrent state.
- The attention mechanism — query, key, value.
- Scaled dot-product attention — derive the score, scale, mask, softmax, and weighted-value steps.
- Multi-head attention — learn several retrieval relationships in parallel and recombine them.
- Attention masks — enforce padding and causal information boundaries.
- Why attention scales differently — compare parallelism, path length, and quadratic sequence cost with recurrence.

---

## Part 6 — Natural language processing & language models
*From text to models that understand and generate it.*

### Module 6.1 — Text representation
Turning language into vectors a network can consume.
- Tokenization — words, subwords, BPE, WordPiece, SentencePiece.
- Embeddings — word2vec, GloVe, the embedding matrix.
- Contextual embeddings — distinguish one static token vector from a representation conditioned on surrounding tokens.

### Module 6.2 — The Transformer
Assemble attention into the architecture behind modern language and multimodal models.
- Positional representations — inject token order with learned, sinusoidal, rotary, or relative schemes.
- Transformer blocks — combine attention, feed-forward layers, residual streams, and normalization.
- Encoder, decoder, and encoder-decoder stacks — match masking and information flow to the modeling objective.
- Shape tracing and parameter counts — verify every projection, residual addition, and output dimension.
- Implement a small Transformer — connect embeddings, blocks, logits, loss, and generation in code.

### Module 6.3 — Language modeling
The objective — predict the next token — that powers today's LLMs.
- The language-modeling objective — predicting the next token.
- n-grams and neural language models — compare count-based context with learned distributed representations.
- Perplexity and evaluation — interpret average token surprise while respecting tokenization and contamination.

### Module 6.4 — Pretrained Transformers
The pretrain-then-adapt paradigm and its major model families.
- BERT and masked language modeling — connect bidirectional encoders to representation-learning tasks.
- GPT and autoregressive modeling — train a causal decoder to predict and generate continuations.
- T5 and encoder-decoder pretraining — cast language tasks into a unified text-to-text interface.
- Transfer learning — pretrain then fine-tune.

### Module 6.5 — Using LLMs
Getting useful behavior out of a trained model without retraining it.
- Prompting and in-context learning — specify task, evidence, constraints, and output contract without changing weights.
- Decoding strategies — greedy, beam, top-k, nucleus, temperature.
- Demonstrations and reasoning traces — use examples or intermediate work when they improve measured task performance.
- Embeddings and vector search — retrieve semantically related items with normalized vectors and appropriate similarity metrics.
- Retrieval-augmented generation — chunk, index, retrieve, cite, and evaluate grounded answers end to end.

---

## Part 7 — Reinforcement learning & generative models
*Decision-making and generation beyond next-token text.*

### Module 7.1 — Reinforcement learning
Learning to act from reward — the framework behind RLHF and agents.
- Markov decision processes — states, actions, rewards, returns.
- Value functions and Bellman equations — express long-term return recursively under a policy or optimal action.
- Dynamic programming — value and policy iteration.
- Model-free control — Monte Carlo, TD, Q-learning, SARSA.
- Deep Q-networks — stabilize function-approximated Q-learning with replay and target networks.
- Policy gradients — REINFORCE.
- Actor-critic and advantage estimation — reduce policy-gradient variance with a learned baseline.
- Proximal policy optimization — constrain policy updates with a clipped surrogate objective.
- Model-based and offline RL — distinguish learned-environment planning from learning safely on fixed logged data.

### Module 7.2 — Generative models
The model families that create images, audio, and more.
- Autoencoders and variational autoencoders — learn compressed representations and derive a sampleable latent objective.
- Generative adversarial networks — analyze the generator-discriminator game and its stability failures.
- Normalizing flows — obtain exact likelihoods through invertible transformations and Jacobian determinants.
- Diffusion models — forward/reverse process, denoising.
- Scores and guidance — connect denoising scores, classifier guidance, and classifier-free guidance.

### Module 7.3 — Multimodal & structured
Models that span vision, language, audio, and graphs.
- Vision-language models — CLIP, contrastive learning.
- Image and video generation — adapt generative objectives to spatial and temporal latent representations.
- Speech and audio models — model waveforms or acoustic tokens while evaluating intelligibility and fidelity.
- Graph neural networks — propagate and pool messages while respecting permutation structure and oversmoothing limits.
- Recommendation systems — combine retrieval, ranking, implicit feedback, and counterfactual evaluation.
- Time-series forecasting — preserve temporal splits, model seasonality, and quantify predictive intervals.

---

## Part 8 — ML systems & engineering (MLOps)
*What separates a notebook from a product that serves millions.*

### Module 8.1 — Data & training infrastructure
The pipelines and clusters that feed and run large training jobs.
- Data pipelines and feature stores — enforce schemas, lineage, point-in-time correctness, and train-serve parity.
- Training infrastructure and clusters — schedule reproducible jobs across storage, compute, and network bottlenecks.
- Accelerator utilization and cost — profile idle time, input stalls, memory pressure, and price-performance.
- Checkpointing and fault tolerance — resume large jobs with consistent optimizer, random, sampler, and data state.
- Data quality and validation — fail pipelines on distribution, integrity, privacy, or label-quality regressions.

### Module 8.2 — Serving & production
Putting a trained model behind an API at scale.
- Packaging and serving — freeze preprocessing, model, dependencies, and contracts into a reproducible artifact.
- Latency, throughput, and autoscaling — size replicas from service-level objectives and measured queueing behavior.
- Batching and caching — improve efficiency without violating freshness, isolation, or tail-latency requirements.
- Online and batch inference — select execution from freshness, volume, and consistency needs.
- Safe rollout — use shadow, canary, fallback, and rollback paths before sending full production traffic.

### Module 8.3 — Reliability & lifecycle
Keeping a deployed model correct as the world drifts.
- Monitoring and drift — observe input, prediction, performance, data-quality, and system health with delayed labels.
- Online experiments — design A/B tests that respect interference, guardrails, power, and novelty effects.
- Versioning and lineage — reconstruct every model from immutable code, data, configuration, and environment references.
- CI/CD and retraining — test data and model behavior before automated promotion or retraining.
- Security and privacy — threat-model model endpoints, training data, artifacts, and sensitive features.

---

## Part 9 — Large-scale & modern LLMs
*Training and aligning frontier models — the core of a top-lab role.*

### Module 9.1 — Scaling
Why bigger models trained on more data predictably get better.
- Scaling laws — compute, data, parameters.
- Emergent behavior and scale — separate smooth underlying gains from thresholded benchmark appearances.
- Data curation at scale — filter, deduplicate, balance, document, and audit massive training corpora.

### Module 9.2 — Training at scale
Splitting a model and its training across thousands of accelerators.
- Mixed precision and loss scaling — choose formats and scaling that save memory without corrupting gradients.
- Gradient checkpointing — exchange recomputation for activation memory with a quantified cost.
- Data parallelism — synchronize replicated-model gradients while preserving effective batch semantics.
- Model, tensor, and pipeline parallelism — partition parameters, operations, or layers when one device cannot hold the model.
- ZeRO / FSDP — sharding optimizer state and parameters.
- Distributed communication — all-reduce and collectives.

### Module 9.3 — Efficient architectures & attention
The tricks that make long-context, large models trainable and fast.
- FlashAttention and IO-aware kernels — reduce high-bandwidth-memory traffic without approximating attention.
- Long-context methods — sparse, sliding, and linear attention.
- Rotary and ALiBi position schemes — compare relative-position behavior and length extrapolation trade-offs.
- Mixture of experts — conditional compute.
- Parameter-efficient fine-tuning — LoRA, adapters, prefix tuning.

### Module 9.4 — Alignment & post-training
Turning a raw predictor into a helpful, harmless assistant.
- Instruction tuning and supervised fine-tuning — convert curated demonstrations into useful conditional behavior.
- Reinforcement learning from human feedback (RLHF) — reward models + PPO.
- Direct preference optimization — derive preference learning without an explicit online RL loop and compare alternatives.
- Constitutional methods and self-critique — generate and revise supervision under explicit behavioral principles.
- Red-teaming and safety fine-tuning — discover failures adversarially and turn them into measured mitigations.

### Module 9.5 — Inference & deployment of LLMs
Serving huge models cheaply and quickly.
- KV caching — reuse past attention keys and values while accounting for its memory growth.
- Quantization — int8/int4, GPTQ, AWQ.
- Distillation — transfer behavior into a smaller student with an explicit target distribution and evaluation plan.
- Speculative and parallel decoding — verify draft tokens to reduce latency without changing the target distribution.
- Serving — batching, throughput, latency.
- Production RAG — serve retrieval, reranking, context assembly, generation, citations, and freshness reliably.

### Module 9.6 — Evaluating LLMs
Measuring capability, honesty, and safety when there's no single metric.
- Benchmarks and contamination — measure capability while detecting memorization, saturation, and construct mismatch.
- Model judges and human evaluation — calibrate rubrics, agreement, bias, and uncertainty before trusting scores.
- Hallucination, bias, and robustness — define observable failure criteria and report slices instead of one aggregate.
- Evaluation statistics — attach confidence intervals, power, and multiple-comparison controls to model claims.

---

## Part 10 — Research, interpretability & safety
*The frontier skills a research role is actually hired for.*

### Module 10.1 — Doing research
How to move from reading papers to producing novel, rigorous results.
- Reading and reproduction — extract claims, assumptions, evidence, and implementation details before rebuilding a result.
- Experiments, ablations, and controls — isolate causal contributions instead of reporting uncontrolled improvements.
- Statistical rigor — report uncertainty, seeds, power, and multiplicity behind empirical claims.
- Research communication — make arguments, tables, and figures independently checkable and honest.
- Compute-aware iteration — maximize information gained per experiment under a fixed resource budget.

### Module 10.2 — Interpretability
Opening the black box — understanding what a network actually computes.
- Attribution and saliency — test what an explanation method measures and where it can mislead.
- Probing and representation analysis — separate decodable information from information actually used by the model.
- Mechanistic interpretability — circuits, features, superposition.
- Activation steering and model editing — intervene on behavior and measure specificity, persistence, and side effects.

### Module 10.3 — Safety & alignment
Making powerful models do what we intend — the core of Anthropic-style work.
- The alignment problem — why it's hard.
- Specification, robustness, and assurance — turn intended behavior into threat models, requirements, evidence, and residual risk.
- Scalable oversight — evaluate behavior that is too complex or costly for direct human checking.
- Interpretability for safety — use internal evidence cautiously in anomaly detection and assurance cases.
- Governance, ethics, and impact — connect technical choices to rights, incentives, accountability, and deployment context.

---

# ▲ Mastery tier (Parts 11–13)
*Extremely advanced and less-essential-but-deep material, stacked at the end. None of it is needed to be hired; mastering all of it puts you at the top of the field.*

## Part 11 — Advanced probabilistic & causal ML
*The rigorous theory behind uncertainty and cause — full depth.*

### Module 11.1 — Bayesian machine learning
Treating parameters themselves as distributions to reason about uncertainty.
- Bayesian inference and conjugacy — update parameter distributions analytically when likelihood and prior align.
- Bayesian linear and logistic regression — propagate parameter uncertainty into predictions.
- Evidence and model selection — compare hypotheses by integrating over parameters rather than optimizing them once.
- Bayesian neural networks — distinguish epistemic from aleatoric uncertainty and evaluate calibration limits.

### Module 11.2 — Probabilistic graphical models
Encoding structured dependencies between many random variables.
- Directed graphical models — read conditional independences from a DAG and factorize the joint distribution.
- Undirected graphical models — encode symmetric dependencies with clique potentials and partition functions.
- Exact inference — variable elimination, belief propagation.
- Hidden Markov models — infer latent sequence states with forward-backward dynamic programming.

### Module 11.3 — Approximate inference
Estimating intractable distributions when exact inference fails.
- Variational inference and the ELBO — turn posterior approximation into a tractable optimization objective.
- Reparameterized gradients — move randomness outside differentiable parameters to lower gradient variance.
- Markov chain Monte Carlo — Metropolis-Hastings, Gibbs.
- Hamiltonian Monte Carlo — use gradients and simulated dynamics to explore correlated posteriors efficiently.

### Module 11.4 — Gaussian processes & kernels
Nonparametric Bayesian models with calibrated uncertainty.
- Gaussian processes — priors over functions.
- Kernel design and hyperparameters — encode smoothness and structure while optimizing marginal likelihood safely.
- Bayesian optimization — choose expensive evaluations with a surrogate posterior and acquisition function.

### Module 11.5 — Causal inference
Moving from correlation to cause — increasingly asked at top labs.
- Causal graphs and interventions — distinguish observing a variable from setting it and reason with do-operations.
- Confounding and adjustment — identify valid backdoor or front-door sets without conditioning on colliders.
- Potential outcomes and treatment effects — define estimands, identification assumptions, and heterogeneous effects.
- Instruments and natural experiments — recover causal effects from exogenous variation while testing instrument assumptions.

---

## Part 12 — Systems & performance mastery
*Making models fast at the hardware level — the hardest engineering.*

### Module 12.1 — GPU programming
Writing the kernels that frameworks call.
- GPU architecture — SMs, warps, memory hierarchy.
- CUDA fundamentals — threads, blocks, shared memory.
- Custom CUDA and Triton kernels — implement and verify a fused operation against a trusted reference.
- Roofline analysis — compute vs memory bound.

### Module 12.2 — Compilers & graph optimization
Letting a compiler make your model faster than you can by hand.
- Operator fusion and graph rewriting — remove intermediate traffic while preserving numerical and aliasing semantics.
- ML compilers — trace how torch.compile, XLA, and TVM lower graphs into optimized kernels.
- Kernel autotuning — search launch and tiling choices against representative shapes without overfitting benchmarks.

### Module 12.3 — Extreme-scale training
The engineering behind training a frontier model on a supercomputer.
- Three-dimensional parallelism — compose data, tensor, and pipeline sharding across a cluster topology.
- Communication overlap — schedule collectives so network latency hides behind useful computation.
- Fault-tolerant frontier training — detect failures and restore globally consistent state across thousands of workers.
- Frontier utilization — account for tokens, FLOPs, energy, idle time, and dollars in one capacity model.

### Module 12.4 — Inference at the limit
Squeezing the last order of magnitude out of serving.
- Quantization and sparsity — preserve quality while exploiting lower precision and structured zeros in real kernels.
- Paged attention and continuous batching — manage fragmented KV memory while admitting and completing requests continuously.
- Multi-token decoding — compare speculative, draft-head, and parallel methods by acceptance, latency, and correctness.
- Edge and accelerator deployment — compile around device memory, supported operators, power, and thermal constraints.

---

## Part 13 — The open frontier
*Where the field is unsolved — the capstone that defines a top researcher.*

### Module 13.1 — Agents & tool use
Turning a language model into a system that acts over long horizons.
- Tools and environments — define schemas, permissions, observations, and error recovery for model actions.
- Planning, memory, and reflection — distinguish useful state management from ungrounded self-commentary.
- Multi-agent orchestration — assign roles only where decomposition and verification outperform one capable agent.
- Long-horizon agent evaluation — measure task success, cost, recovery, side effects, and reproducibility over complete trajectories.

### Module 13.2 — Advanced reinforcement learning
The RL depth behind alignment and decision-making agents.
- Offline RL — learn conservatively from fixed behavior data while detecting out-of-distribution actions.
- Multi-agent RL and self-play — analyze non-stationarity, equilibria, population diversity, and exploitability.
- Model-based RL and world models — learn dynamics for planning while controlling compounding model error.
- Exploration and reward modeling — seek informative experience without exploiting reward misspecification.

### Module 13.3 — Reasoning, learning & memory
The research directions aimed at more capable, adaptable models.
- Reasoning and inference-time compute — trade search, verification, and samples for measured accuracy at serving time.
- Continual and meta-learning — adapt to new tasks without catastrophic forgetting or evaluation leakage.
- Long-term memory — retrieve, update, expire, and protect persistent information across interactions.
- Scaling and generalization science — design experiments that distinguish capability growth from benchmark artifacts.

### Module 13.4 — Open problems & the road ahead
The unsolved questions a frontier lab is actually working on.
- Hallucination, faithfulness, and truthfulness — separate unsupported claims, unfaithful rationales, and deceptive behavior experimentally.
- Robustness and distribution shift — stress models under natural, adversarial, and strategic changes in input distribution.
- Scalable oversight and superalignment — compare proposals by assumptions, threat model, evidence, and failure modes.
- Where the field goes next — and how to contribute.

import type { CourseModule, Lesson } from "../../types";

/**
 * A long-form dependency map, not a claim that a degree can be compressed into
 * a short video. An entry only becomes playable when a real lecture is wired
 * to it in lectures.ts. Graduate parts are directions for sustained study;
 * research competence still requires exercises, seminars, and original work.
 *
 * The first two parts follow the 2026–27 UCSC MATH 19A/19B catalog topics:
 * https://catalog.ucsc.edu/current/general-catalog/courses/math-mathematics/lower-division/math-19a/
 * https://catalog.ucsc.edu/current/general-catalog/courses/math-mathematics/lower-division/math-19b/
 * They are independent learning material, not university credit or a claim of
 * equivalence to a particular instructor's course.
 */
type ModuleSpec = [part: number, partTitle: string, title: string, summary: string, lessons: string[]];

const specifications: ModuleSpec[] = [
  [1, "MATH 19A · differential calculus", "Functions and mathematical language", "Repair the algebra and function fluency on which calculus depends.", ["Functions, domains, and ranges", "Graphs, transformations, and inverse functions", "Composition and the difference quotient", "Trigonometric functions and radians", "Exponential and logarithmic functions", "Algebraic and trigonometric review problems"]],
  [1, "MATH 19A · differential calculus", "Limits and continuity", "Move from numerical intuition to exact local behavior.", ["Approaching a point from a table and a graph", "One-sided limits and when a limit exists", "Limit laws and direct substitution", "Factoring, rationalizing, and removable holes", "Infinite limits and vertical asymptotes", "Limits at infinity and horizontal asymptotes", "The squeeze theorem and trigonometric limits", "Continuity and the intermediate value theorem", "Epsilon-delta limits and why rigor matters", "Mixed limit and continuity problems"]],
  [1, "MATH 19A · differential calculus", "Derivatives from first principles", "Build slope and instantaneous rate from limits before using rules.", ["Average versus instantaneous change", "The derivative as a limit", "Derivative at a point versus derivative function", "Differentiability and continuity", "Tangent and normal lines", "Velocity, acceleration, and units", "First-principles derivative practice"]],
  [1, "MATH 19A · differential calculus", "Rules of differentiation", "Differentiate accurately and explain where each rule applies.", ["Constants, powers, sums, and linearity", "Product and quotient rules", "Chain rule and nested functions", "Trigonometric derivatives", "Exponential and logarithmic derivatives", "Implicit differentiation", "Inverse-function derivatives", "Higher derivatives and motion", "Mixed differentiation practice"]],
  [1, "MATH 19A · differential calculus", "Derivative theorems and modeling", "Use derivatives to prove and predict global behavior.", ["Rolle's theorem and the mean value theorem", "Monotonicity and critical points", "Concavity and inflection points", "First- and second-derivative tests", "Optimization with constraints", "Related rates", "Linearization and differentials", "Graph sketching from derivatives", "Modeling and mixed application problems"]],

  [2, "MATH 19B · integral calculus and series", "Antiderivatives and the definite integral", "Understand accumulation as a limit of sums.", ["Antiderivatives and initial conditions", "Riemann sums and signed area", "Definite integrals and their properties", "The fundamental theorem of calculus, part I", "The fundamental theorem of calculus, part II", "Substitution and change of variables", "Accumulation functions and motion", "Integral interpretation problems"]],
  [2, "MATH 19B · integral calculus and series", "Applications of integration", "Choose a mathematical model before integrating.", ["Area between curves", "Volumes by slicing and disks", "Washers and shells", "Average value and physical accumulation", "Work and variable force", "Application modeling problems"]],
  [2, "MATH 19B · integral calculus and series", "Integration methods", "Select techniques from structure instead of guessing.", ["Integration by parts", "Trigonometric integrals", "Trigonometric substitution", "Partial fractions", "Numerical integration and error", "Strategy for mixed integrals"]],
  [2, "MATH 19B · integral calculus and series", "Improper integrals and sequences", "Recognize when limiting processes converge.", ["Infinite-interval integrals", "Unbounded-integrand integrals", "Comparison for improper integrals", "Sequences and convergence", "Monotone bounded sequences", "Mixed convergence problems"]],
  [2, "MATH 19B · integral calculus and series", "Infinite series", "Use a justified test, not an intuition that terms get small.", ["Series, partial sums, and divergence test", "Geometric and telescoping series", "Integral and comparison tests", "Limit comparison", "Ratio and root tests", "Alternating series and error bounds", "Absolute versus conditional convergence", "Power series and radius of convergence", "Taylor and Maclaurin polynomials", "Taylor series and approximation error", "Mixed series problems"]],

  [3, "Multivariable calculus · MATH 23A/23B", "Geometry and partial derivatives", "Extend single-variable calculus to vector-valued and many-input functions.", ["Vectors, lines, and planes", "Space curves and parametrization", "Limits and continuity in several variables", "Partial derivatives and gradients", "Directional derivatives and tangent planes", "Chain rule in several variables", "Multivariable Taylor approximation", "Critical points and Hessians", "Lagrange multipliers and constrained extrema", "The implicit function theorem"]],
  [3, "Multivariable calculus · MATH 23A/23B", "Multiple and vector integration", "Integrate over regions and connect fields to boundaries.", ["Double integrals and iterated integrals", "Polar-coordinate integrals", "Triple and cylindrical-coordinate integrals", "Change of variables and Jacobians", "Improper double integrals", "Vector fields and line integrals", "Conservative fields and potential functions", "Green's theorem", "Surface integrals and flux", "Stokes' theorem", "The divergence theorem", "Differential forms and vector calculus"]],
  [4, "Linear algebra · MATH 21 and beyond", "Vectors and linear systems", "Make linear algebra concrete before abstracting it.", ["Linear systems and Gaussian elimination", "Vectors, subspaces, span, and independence", "Bases, dimension, and coordinates", "Linear maps, kernel, and image", "Rank-nullity theorem", "Matrix multiplication and inverse maps", "Determinants and orientation", "Inner products and orthogonality"]],
  [4, "Linear algebra · MATH 21 and beyond", "Spectral and numerical linear algebra", "Understand the structure behind modern ML and computation.", ["Orthogonal projection and least squares", "QR factorization", "Eigenvalues and eigenvectors", "Diagonalization and invariant subspaces", "Symmetric matrices and the spectral theorem", "Singular value decomposition", "Positive-definite matrices and quadratic forms", "Conditioning and numerical stability", "Principal components from the SVD"]],
  [5, "Differential equations and modeling", "Ordinary differential equations", "Turn change laws into solvable or simulatable models.", ["Separable first-order equations", "Linear first-order equations", "Second-order constant-coefficient equations", "Forcing and variation of parameters", "Systems of ODEs and matrix exponentials", "Phase portraits and stability", "Numerical Euler and Runge–Kutta methods", "Existence, uniqueness, and modeling assumptions"]],
  [6, "Proof and discrete foundations", "How to read and write proofs", "Cross the bridge from computation to rigorous mathematics.", ["Logic, quantifiers, and negation", "Sets, functions, and relations", "Direct proof and counterexample", "Contrapositive and contradiction", "Induction and strong induction", "Equivalence and well-definedness", "Countability and the size of infinity", "Writing and reviewing complete proofs"]],
  [6, "Proof and discrete foundations", "Combinatorics and discrete structures", "Count structures without double-counting and reason about algorithms.", ["Counting principles and bijections", "Permutations and combinations", "Binomial coefficients and identities", "Inclusion-exclusion", "Recurrences and generating functions", "Graphs and trees", "Discrete probability foundations"]],
  [7, "ML mathematical readiness", "Probability foundations", "Model uncertainty before fitting statistical models.", ["Sample spaces and events", "Conditional probability and Bayes' rule", "Random variables and distributions", "Expectation, variance, and covariance", "Joint, marginal, and conditional laws", "Common discrete and continuous families", "Law of large numbers", "Central limit theorem"]],
  [7, "ML mathematical readiness", "Statistics and inference", "Make claims from data while accounting for uncertainty and bias.", ["Sampling, estimators, and bias", "Maximum likelihood and log likelihood", "Confidence intervals and standard error", "Hypothesis tests and p-values", "Regression and residual analysis", "Bootstrap and resampling", "Cross-validation and data leakage", "Bayesian posterior inference"]],
  [7, "ML mathematical readiness", "Optimization and information", "Connect derivatives, linear algebra, and probability to ML objectives.", ["Multivariable Taylor approximation", "Gradient descent and learning rates", "Convex sets and convex functions", "Optimality conditions and Lagrange multipliers", "Constrained optimization and KKT conditions", "Entropy, cross-entropy, and KL divergence", "Numerical precision and stable computation", "ML readiness proof and computation capstone"]],
  [8, "Upper-division mathematical core", "Real analysis I", "Replace calculus intuition with definitions and proofs.", ["Completeness of the real numbers", "Sequences and subsequences", "Limits and continuity from epsilon-delta", "Compactness and connectedness", "Differentiation theorems", "Riemann integration", "Uniform convergence", "Power series and interchange of limits"]],
  [8, "Upper-division mathematical core", "Abstract algebra I", "Study structure preserved under operations and maps.", ["Groups and homomorphisms", "Cosets and quotient groups", "Isomorphism theorems", "Group actions", "Rings, ideals, and quotients", "Polynomial rings", "Fields and extensions", "Finite fields"]],
  [8, "Upper-division mathematical core", "Complex analysis", "Use analyticity to obtain powerful global conclusions.", ["Complex differentiability", "Cauchy-Riemann equations", "Contour integration", "Cauchy's integral theorem", "Cauchy's integral formula", "Laurent series and isolated singularities", "Residues and real integrals", "Conformal maps"]],
  [9, "Advanced applied mathematics", "Numerical analysis", "Prove and measure error in computations.", ["Floating-point arithmetic and conditioning", "Root finding and convergence rates", "Interpolation and approximation", "Numerical differentiation and quadrature", "Iterative methods for linear systems", "Numerical eigenvalue methods", "Stiff ODEs and stability", "Verification against analytic benchmarks"]],
  [9, "Advanced applied mathematics", "Partial differential equations", "Model diffusion, waves, and potential fields.", ["Classifying PDEs and boundary data", "Heat equation and separation of variables", "Wave equation and energy", "Laplace and Poisson equations", "Fourier series and transforms", "Weak formulations", "Finite-difference discretization", "Stability, consistency, and convergence"]],
  [9, "Advanced applied mathematics", "Advanced optimization", "Understand algorithms beyond basic gradient descent.", ["Convex duality", "Proximal operators and composite objectives", "Accelerated first-order methods", "Newton and quasi-Newton methods", "Stochastic approximation", "Constrained nonconvex optimization", "Saddle points and game dynamics", "Optimization research-paper reading"]],
  [10, "Graduate analysis and geometry", "Measure theory and integration", "Build the foundations needed for modern probability and functional analysis.", ["Sigma-algebras and measurable maps", "Measures and outer measure", "Lebesgue integration", "Monotone and dominated convergence", "Product measures and Fubini's theorem", "L-p spaces", "Radon–Nikodym theorem", "Signed measures and decomposition"]],
  [10, "Graduate analysis and geometry", "Functional analysis", "Study infinite-dimensional vector spaces used in PDEs and ML theory.", ["Normed and Banach spaces", "Hilbert spaces and projection", "Bounded linear operators", "Hahn–Banach theorem", "Uniform boundedness and open mapping", "Compact operators", "Spectral theory", "Distributions and weak derivatives"]],
  [10, "Graduate analysis and geometry", "Topology and manifolds", "Understand global structure and the geometry of curved spaces.", ["Topological spaces and bases", "Compactness and connectedness", "Product and quotient topologies", "Fundamental group", "Smooth manifolds and charts", "Tangent and cotangent spaces", "Differential forms", "Stokes' theorem on manifolds"]],
  [10, "Graduate analysis and geometry", "Differential geometry", "Reason about curvature and optimization on manifolds.", ["Riemannian metrics", "Connections and covariant derivatives", "Geodesics and exponential maps", "Curvature tensors", "Submanifolds and embeddings", "Optimization on manifolds", "Information geometry", "Geometric methods research problems"]],
  [11, "Graduate probability and statistics", "Measure-theoretic probability", "Derive probabilistic results from a rigorous measure model.", ["Probability spaces and random variables", "Expectation as integration", "Modes of convergence", "Conditional expectation", "Characteristic functions", "Martingales", "Concentration inequalities", "Limit theorems"]],
  [11, "Graduate probability and statistics", "Stochastic processes", "Model dependent random behavior in time and space.", ["Markov chains", "Poisson processes", "Brownian motion", "Stochastic integrals", "Itô's formula", "Stochastic differential equations", "Ergodicity", "Simulation and inference for processes"]],
  [11, "Graduate probability and statistics", "Statistical learning theory", "Understand when fitting a model can generalize.", ["Empirical risk minimization", "Uniform convergence", "VC dimension and capacity", "Rademacher complexity", "PAC-Bayesian bounds", "Stability and generalization", "Minimax rates", "Open questions in learning theory"]],
  [12, "Graduate algebra and computation", "Advanced algebra", "Develop structure beyond the first algebra course.", ["Modules over rings", "Tensor products", "Field extensions and Galois theory", "Representation theory basics", "Commutative algebra foundations", "Algebraic varieties and ideals", "Category-theoretic language", "Research-paper proof workshop"]],
  [12, "Graduate algebra and computation", "Spectral methods and inverse problems", "Recover hidden structure from incomplete or noisy observations.", ["Compact self-adjoint operators", "Inverse problems and ill-posedness", "Regularization theory", "Kernel methods and RKHS", "Spectral graph theory", "Low-rank recovery", "Random matrix intuition", "Reading current literature"]],
  [13, "Research practice · doctoral direction", "Mathematical research apprenticeship", "Learn how a research question becomes a defensible result.", ["Read a paper and reconstruct its prerequisites", "Replicate a theorem or computational result", "Find and repair a gap in a proof", "Formulate a narrow original question", "Build a counterexample search", "Present at a seminar", "Write and revise a proof", "Open-problem capstone and advisor feedback"]],
];

export const MATH_MODULES: CourseModule[] = specifications.map(([part, partTitle, title, summary, topics], index) => {
  const id = `math.m${index + 1}`;
  return { id, part, partTitle, title, summary, lessonIds: topics.map((_, lessonIndex) => `${id}.l${lessonIndex + 1}`), course: "math", language: "python" };
});

const releasedGoals: Record<string, string> = {
  "math.m1.l1": "Determine a function's domain and range, including excluded inputs and attained endpoints.",
  "math.m1.l2": "Predict graph transformations and find an inverse on a one-to-one domain.",
  "math.m1.l3": "Compose functions in the right order and simplify a difference quotient without setting its denominator to zero.",
  "math.m1.l4": "Use radians and the unit circle to reason about trigonometric values and signs.",
  "math.m1.l5": "Solve exponential equations with logarithms and distinguish valid log laws from tempting false ones.",
  "math.m1.l6": "Keep domain restrictions intact while factoring, rationalizing, and checking algebraic work.",
  "math.m2.l1": "Estimate a limit from nearby values, then explain why a table alone is not a proof.",
  "math.m2.l2": "Compute left and right approaches separately and decide when a two-sided limit exists.",
  "math.m2.l3": "Apply limit laws only when their hypotheses hold, especially for quotients.",
  "math.m2.l4": "Resolve a zero-over-zero form by factoring or rationalizing and identify a removable hole.",
  "math.m2.l5": "Determine the sign of each one-sided infinite limit and locate vertical asymptotes.",
  "math.m2.l6": "Compare leading powers to find far-field limits and horizontal asymptotes.",
  "math.m2.l7": "Prove limits with squeezing and derive the standard trigonometric limit in radians.",
  "math.m2.l8": "Check continuity at a point and use the intermediate value theorem to prove a root exists.",
  "math.m2.l9": "Choose an explicit delta for every epsilon and write a complete linear-limit proof.",
  "math.m2.l10": "Choose an appropriate technique for mixed limits and state precisely what behavior you established.",
};

export const MATH_LESSONS: Lesson[] = specifications.flatMap(([, , , , topics], index) =>
  topics.map((title, lessonIndex) => ({
    id: `math.m${index + 1}.l${lessonIndex + 1}`,
    moduleId: `math.m${index + 1}`,
    title,
    goal: releasedGoals[`math.m${index + 1}.l${lessonIndex + 1}`] ?? `Explain ${title.toLowerCase()} and work through a complete example before moving on.`,
    repIds: [],
    problemIds: [],
    language: "python",
  })),
);

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
type ModuleSpec = [
  part: number,
  partTitle: string,
  title: string,
  summary: string,
  lessons: string[],
];

const specifications: ModuleSpec[] = [
  [
    1,
    "MATH 19A · differential calculus",
    "Functions and mathematical language",
    "Repair the algebra and function fluency on which calculus depends.",
    [
      "Functions, domains, and ranges",
      "Graphs, transformations, and inverse functions",
      "Composition and the difference quotient",
      "Trigonometric functions and radians",
      "Exponential and logarithmic functions",
      "Algebraic and trigonometric review problems",
    ],
  ],
  [
    1,
    "MATH 19A · differential calculus",
    "Limits and continuity",
    "Move from numerical intuition to exact local behavior.",
    [
      "Approaching a point from a table and a graph",
      "One-sided limits and when a limit exists",
      "Limit laws and direct substitution",
      "Factoring, rationalizing, and removable holes",
      "Infinite limits and vertical asymptotes",
      "Limits at infinity and horizontal asymptotes",
      "The squeeze theorem and trigonometric limits",
      "Continuity and the intermediate value theorem",
      "Epsilon-delta limits and why rigor matters",
      "Mixed limit and continuity problems",
    ],
  ],
  [
    1,
    "MATH 19A · differential calculus",
    "Derivatives from first principles",
    "Build slope and instantaneous rate from limits before using rules.",
    [
      "Average versus instantaneous change",
      "The derivative as a limit",
      "Derivative at a point versus derivative function",
      "Differentiability and continuity",
      "Tangent and normal lines",
      "Velocity, acceleration, and units",
      "First-principles derivative practice",
    ],
  ],
  [
    1,
    "MATH 19A · differential calculus",
    "Rules of differentiation",
    "Differentiate accurately and explain where each rule applies.",
    [
      "Constants, powers, sums, and linearity",
      "Product and quotient rules",
      "Chain rule and nested functions",
      "Trigonometric derivatives",
      "Exponential and logarithmic derivatives",
      "Implicit differentiation",
      "Inverse-function derivatives",
      "Higher derivatives and motion",
      "Mixed differentiation practice",
    ],
  ],
  [
    1,
    "MATH 19A · differential calculus",
    "Derivative theorems and modeling",
    "Use derivatives to prove and predict global behavior.",
    [
      "Rolle's theorem and the mean value theorem",
      "Monotonicity and critical points",
      "Concavity and inflection points",
      "First- and second-derivative tests",
      "Optimization with constraints",
      "Related rates",
      "Linearization and differentials",
      "Graph sketching from derivatives",
      "Modeling and mixed application problems",
    ],
  ],

  [
    2,
    "MATH 19B · integral calculus and series",
    "Antiderivatives and the definite integral",
    "Understand accumulation as a limit of sums.",
    [
      "Antiderivatives and initial conditions",
      "Riemann sums and signed area",
      "Definite integrals and their properties",
      "The fundamental theorem of calculus, part I",
      "The fundamental theorem of calculus, part II",
      "Substitution and change of variables",
      "Accumulation functions and motion",
      "Integral interpretation problems",
    ],
  ],
  [
    2,
    "MATH 19B · integral calculus and series",
    "Applications of integration",
    "Choose a mathematical model before integrating.",
    [
      "Area between curves",
      "Volumes by slicing and disks",
      "Washers and shells",
      "Average value and physical accumulation",
      "Work and variable force",
      "Application modeling problems",
    ],
  ],
  [
    2,
    "MATH 19B · integral calculus and series",
    "Integration methods",
    "Select techniques from structure instead of guessing.",
    [
      "Integration by parts",
      "Trigonometric integrals",
      "Trigonometric substitution",
      "Partial fractions",
      "Numerical integration and error",
      "Strategy for mixed integrals",
    ],
  ],
  [
    2,
    "MATH 19B · integral calculus and series",
    "Improper integrals and sequences",
    "Recognize when limiting processes converge.",
    [
      "Infinite-interval integrals",
      "Unbounded-integrand integrals",
      "Comparison for improper integrals",
      "Sequences and convergence",
      "Monotone bounded sequences",
      "Mixed convergence problems",
    ],
  ],
  [
    2,
    "MATH 19B · integral calculus and series",
    "Infinite series",
    "Use a justified test, not an intuition that terms get small.",
    [
      "Series, partial sums, and divergence test",
      "Geometric and telescoping series",
      "Integral and comparison tests",
      "Limit comparison",
      "Ratio and root tests",
      "Alternating series and error bounds",
      "Absolute versus conditional convergence",
      "Power series and radius of convergence",
      "Taylor and Maclaurin polynomials",
      "Taylor series and approximation error",
      "Mixed series problems",
    ],
  ],

  [
    3,
    "Multivariable calculus · MATH 23A/23B",
    "Geometry and partial derivatives",
    "Extend single-variable calculus to vector-valued and many-input functions.",
    [
      "Vectors, lines, and planes",
      "Space curves and parametrization",
      "Limits and continuity in several variables",
      "Partial derivatives and gradients",
      "Directional derivatives and tangent planes",
      "Chain rule in several variables",
      "Multivariable Taylor approximation",
      "Critical points and Hessians",
      "Lagrange multipliers and constrained extrema",
      "The implicit function theorem",
    ],
  ],
  [
    3,
    "Multivariable calculus · MATH 23A/23B",
    "Multiple and vector integration",
    "Integrate over regions and connect fields to boundaries.",
    [
      "Double integrals and iterated integrals",
      "Polar-coordinate integrals",
      "Triple and cylindrical-coordinate integrals",
      "Change of variables and Jacobians",
      "Improper double integrals",
      "Vector fields and line integrals",
      "Conservative fields and potential functions",
      "Green's theorem",
      "Surface integrals and flux",
      "Stokes' theorem",
      "The divergence theorem",
      "Differential forms and vector calculus",
    ],
  ],
  [
    4,
    "Linear algebra · MATH 21 and beyond",
    "Vectors and linear systems",
    "Make linear algebra concrete before abstracting it.",
    [
      "Linear systems and Gaussian elimination",
      "Vectors, subspaces, span, and independence",
      "Bases, dimension, and coordinates",
      "Linear maps, kernel, and image",
      "Rank-nullity theorem",
      "Matrix multiplication and inverse maps",
      "Determinants and orientation",
      "Inner products and orthogonality",
    ],
  ],
  [
    4,
    "Linear algebra · MATH 21 and beyond",
    "Spectral and numerical linear algebra",
    "Understand the structure behind modern ML and computation.",
    [
      "Orthogonal projection and least squares",
      "QR factorization",
      "Eigenvalues and eigenvectors",
      "Diagonalization and invariant subspaces",
      "Symmetric matrices and the spectral theorem",
      "Singular value decomposition",
      "Positive-definite matrices and quadratic forms",
      "Conditioning and numerical stability",
      "Principal components from the SVD",
    ],
  ],
  [
    5,
    "Differential equations and modeling",
    "Ordinary differential equations",
    "Turn change laws into solvable or simulatable models.",
    [
      "Separable first-order equations",
      "Linear first-order equations",
      "Second-order constant-coefficient equations",
      "Forcing and variation of parameters",
      "Systems of ODEs and matrix exponentials",
      "Phase portraits and stability",
      "Numerical Euler and Runge–Kutta methods",
      "Existence, uniqueness, and modeling assumptions",
    ],
  ],
  [
    6,
    "Proof and discrete foundations",
    "How to read and write proofs",
    "Cross the bridge from computation to rigorous mathematics.",
    [
      "Logic, quantifiers, and negation",
      "Sets, functions, and relations",
      "Direct proof and counterexample",
      "Contrapositive and contradiction",
      "Induction and strong induction",
      "Equivalence and well-definedness",
      "Countability and the size of infinity",
      "Writing and reviewing complete proofs",
    ],
  ],
  [
    6,
    "Proof and discrete foundations",
    "Combinatorics and discrete structures",
    "Count structures without double-counting and reason about algorithms.",
    [
      "Counting principles and bijections",
      "Permutations and combinations",
      "Binomial coefficients and identities",
      "Inclusion-exclusion",
      "Recurrences and generating functions",
      "Graphs and trees",
      "Discrete probability foundations",
    ],
  ],
  [
    7,
    "ML mathematical readiness",
    "Probability foundations",
    "Model uncertainty before fitting statistical models.",
    [
      "Sample spaces and events",
      "Conditional probability and Bayes' rule",
      "Random variables and distributions",
      "Expectation, variance, and covariance",
      "Joint, marginal, and conditional laws",
      "Common discrete and continuous families",
      "Law of large numbers",
      "Central limit theorem",
    ],
  ],
  [
    7,
    "ML mathematical readiness",
    "Statistics and inference",
    "Make claims from data while accounting for uncertainty and bias.",
    [
      "Sampling, estimators, and bias",
      "Maximum likelihood and log likelihood",
      "Confidence intervals and standard error",
      "Hypothesis tests and p-values",
      "Regression and residual analysis",
      "Bootstrap and resampling",
      "Cross-validation and data leakage",
      "Bayesian posterior inference",
    ],
  ],
  [
    7,
    "ML mathematical readiness",
    "Optimization and information",
    "Connect derivatives, linear algebra, and probability to ML objectives.",
    [
      "Multivariable Taylor approximation",
      "Gradient descent and learning rates",
      "Convex sets and convex functions",
      "Optimality conditions and Lagrange multipliers",
      "Constrained optimization and KKT conditions",
      "Entropy, cross-entropy, and KL divergence",
      "Numerical precision and stable computation",
      "ML readiness proof and computation capstone",
    ],
  ],
  [
    8,
    "Upper-division mathematical core",
    "Real analysis I",
    "Replace calculus intuition with definitions and proofs.",
    [
      "Completeness of the real numbers",
      "Sequences and subsequences",
      "Limits and continuity from epsilon-delta",
      "Compactness and connectedness",
      "Differentiation theorems",
      "Riemann integration",
      "Uniform convergence",
      "Power series and interchange of limits",
    ],
  ],
  [
    8,
    "Upper-division mathematical core",
    "Abstract algebra I",
    "Study structure preserved under operations and maps.",
    [
      "Groups and homomorphisms",
      "Cosets and quotient groups",
      "Isomorphism theorems",
      "Group actions",
      "Rings, ideals, and quotients",
      "Polynomial rings",
      "Fields and extensions",
      "Finite fields",
    ],
  ],
  [
    8,
    "Upper-division mathematical core",
    "Complex analysis",
    "Use analyticity to obtain powerful global conclusions.",
    [
      "Complex differentiability",
      "Cauchy-Riemann equations",
      "Contour integration",
      "Cauchy's integral theorem",
      "Cauchy's integral formula",
      "Laurent series and isolated singularities",
      "Residues and real integrals",
      "Conformal maps",
    ],
  ],
  [
    9,
    "Advanced applied mathematics",
    "Numerical analysis",
    "Prove and measure error in computations.",
    [
      "Floating-point arithmetic and conditioning",
      "Root finding and convergence rates",
      "Interpolation and approximation",
      "Numerical differentiation and quadrature",
      "Iterative methods for linear systems",
      "Numerical eigenvalue methods",
      "Stiff ODEs and stability",
      "Verification against analytic benchmarks",
    ],
  ],
  [
    9,
    "Advanced applied mathematics",
    "Partial differential equations",
    "Model diffusion, waves, and potential fields.",
    [
      "Classifying PDEs and boundary data",
      "Heat equation and separation of variables",
      "Wave equation and energy",
      "Laplace and Poisson equations",
      "Fourier series and transforms",
      "Weak formulations",
      "Finite-difference discretization",
      "Stability, consistency, and convergence",
    ],
  ],
  [
    9,
    "Advanced applied mathematics",
    "Advanced optimization",
    "Understand algorithms beyond basic gradient descent.",
    [
      "Convex duality",
      "Proximal operators and composite objectives",
      "Accelerated first-order methods",
      "Newton and quasi-Newton methods",
      "Stochastic approximation",
      "Constrained nonconvex optimization",
      "Saddle points and game dynamics",
      "Optimization research-paper reading",
    ],
  ],
  [
    10,
    "Graduate analysis and geometry",
    "Measure theory and integration",
    "Build the foundations needed for modern probability and functional analysis.",
    [
      "Sigma-algebras and measurable maps",
      "Measures and outer measure",
      "Lebesgue integration",
      "Monotone and dominated convergence",
      "Product measures and Fubini's theorem",
      "L-p spaces",
      "Radon–Nikodym theorem",
      "Signed measures and decomposition",
    ],
  ],
  [
    10,
    "Graduate analysis and geometry",
    "Functional analysis",
    "Study infinite-dimensional vector spaces used in PDEs and ML theory.",
    [
      "Normed and Banach spaces",
      "Hilbert spaces and projection",
      "Bounded linear operators",
      "Hahn–Banach theorem",
      "Uniform boundedness and open mapping",
      "Compact operators",
      "Spectral theory",
      "Distributions and weak derivatives",
    ],
  ],
  [
    10,
    "Graduate analysis and geometry",
    "Topology and manifolds",
    "Understand global structure and the geometry of curved spaces.",
    [
      "Topological spaces and bases",
      "Compactness and connectedness",
      "Product and quotient topologies",
      "Fundamental group",
      "Smooth manifolds and charts",
      "Tangent and cotangent spaces",
      "Differential forms",
      "Stokes' theorem on manifolds",
    ],
  ],
  [
    10,
    "Graduate analysis and geometry",
    "Differential geometry",
    "Reason about curvature and optimization on manifolds.",
    [
      "Riemannian metrics",
      "Connections and covariant derivatives",
      "Geodesics and exponential maps",
      "Curvature tensors",
      "Submanifolds and embeddings",
      "Optimization on manifolds",
      "Information geometry",
      "Geometric methods research problems",
    ],
  ],
  [
    11,
    "Graduate probability and statistics",
    "Measure-theoretic probability",
    "Derive probabilistic results from a rigorous measure model.",
    [
      "Probability spaces and random variables",
      "Expectation as integration",
      "Modes of convergence",
      "Conditional expectation",
      "Characteristic functions",
      "Martingales",
      "Concentration inequalities",
      "Limit theorems",
    ],
  ],
  [
    11,
    "Graduate probability and statistics",
    "Stochastic processes",
    "Model dependent random behavior in time and space.",
    [
      "Markov chains",
      "Poisson processes",
      "Brownian motion",
      "Stochastic integrals",
      "Itô's formula",
      "Stochastic differential equations",
      "Ergodicity",
      "Simulation and inference for processes",
    ],
  ],
  [
    11,
    "Graduate probability and statistics",
    "Statistical learning theory",
    "Understand when fitting a model can generalize.",
    [
      "Empirical risk minimization",
      "Uniform convergence",
      "VC dimension and capacity",
      "Rademacher complexity",
      "PAC-Bayesian bounds",
      "Stability and generalization",
      "Minimax rates",
      "Open questions in learning theory",
    ],
  ],
  [
    12,
    "Graduate algebra and computation",
    "Advanced algebra",
    "Develop structure beyond the first algebra course.",
    [
      "Modules over rings",
      "Tensor products",
      "Field extensions and Galois theory",
      "Representation theory basics",
      "Commutative algebra foundations",
      "Algebraic varieties and ideals",
      "Category-theoretic language",
      "Research-paper proof workshop",
    ],
  ],
  [
    12,
    "Graduate algebra and computation",
    "Spectral methods and inverse problems",
    "Recover hidden structure from incomplete or noisy observations.",
    [
      "Compact self-adjoint operators",
      "Inverse problems and ill-posedness",
      "Regularization theory",
      "Kernel methods and RKHS",
      "Spectral graph theory",
      "Low-rank recovery",
      "Random matrix intuition",
      "Reading current literature",
    ],
  ],
  [
    13,
    "Research practice · doctoral direction",
    "Mathematical research apprenticeship",
    "Learn how a research question becomes a defensible result.",
    [
      "Read a paper and reconstruct its prerequisites",
      "Replicate a theorem or computational result",
      "Find and repair a gap in a proof",
      "Formulate a narrow original question",
      "Build a counterexample search",
      "Present at a seminar",
      "Write and revise a proof",
      "Open-problem capstone and advisor feedback",
    ],
  ],
];

export const MATH_MODULES: CourseModule[] = specifications.map(
  ([part, partTitle, title, summary, topics], index) => {
    const id = `math.m${index + 1}`;
    return {
      id,
      part,
      partTitle,
      title,
      summary,
      lessonIds: topics.map((_, lessonIndex) => `${id}.l${lessonIndex + 1}`),
      course: "math",
      language: "python",
    };
  },
);

const releasedGoals: Record<string, string> = {
  "math.m1.l1":
    "Determine a function's domain and range, including excluded inputs and attained endpoints.",
  "math.m1.l2":
    "Predict graph transformations and find an inverse on a one-to-one domain.",
  "math.m1.l3":
    "Compose functions in the right order and simplify a difference quotient without setting its denominator to zero.",
  "math.m1.l4":
    "Use radians and the unit circle to reason about trigonometric values and signs.",
  "math.m1.l5":
    "Solve exponential equations with logarithms and distinguish valid log laws from tempting false ones.",
  "math.m1.l6":
    "Keep domain restrictions intact while factoring, rationalizing, and checking algebraic work.",
  "math.m2.l1":
    "Estimate a limit from nearby values, then explain why a table alone is not a proof.",
  "math.m2.l2":
    "Compute left and right approaches separately and decide when a two-sided limit exists.",
  "math.m2.l3":
    "Apply limit laws only when their hypotheses hold, especially for quotients.",
  "math.m2.l4":
    "Resolve a zero-over-zero form by factoring or rationalizing and identify a removable hole.",
  "math.m2.l5":
    "Determine the sign of each one-sided infinite limit and locate vertical asymptotes.",
  "math.m2.l6":
    "Compare leading powers to find far-field limits and horizontal asymptotes.",
  "math.m2.l7":
    "Prove limits with squeezing and derive the standard trigonometric limit in radians.",
  "math.m2.l8":
    "Check continuity at a point and use the intermediate value theorem to prove a root exists.",
  "math.m2.l9":
    "Choose an explicit delta for every epsilon and write a complete linear-limit proof.",
  "math.m2.l10":
    "Choose an appropriate technique for mixed limits and state precisely what behavior you established.",
  "math.m3.l1":
    "Compare average and instantaneous rates with a difference quotient and correct units.",
  "math.m3.l2":
    "Compute a derivative from its limit definition without assuming a differentiation rule.",
  "math.m3.l3":
    "Distinguish a derivative value from the derivative function and identify where each exists.",
  "math.m3.l4":
    "Use one-sided difference quotients to explain why differentiability implies continuity but not conversely.",
  "math.m3.l5":
    "Write tangent and normal equations from the curve point and derivative slope.",
  "math.m3.l6":
    "Interpret velocity, speed, and acceleration with signs and physical units.",
  "math.m3.l7":
    "Solve mixed first-principles derivative problems and justify domain and one-sided behavior.",
  "math.m4.l1":
    "Differentiate constants, powers, and sums while keeping the original domain intact.",
  "math.m4.l2":
    "Derive and apply the product and quotient rules, and check results by algebraic rewriting.",
  "math.m4.l3":
    "Differentiate nested functions with the chain rule and explain every inner-rate factor.",
  "math.m4.l4":
    "Differentiate trigonometric functions in radians and combine them with product and chain rules.",
  "math.m4.l5":
    "Differentiate exponential and logarithmic functions, including compositions and their domains.",
  "math.m4.l6":
    "Find tangent slopes on implicitly defined curves and recognize vertical tangents.",
  "math.m4.l7":
    "Find an inverse-function derivative at a point without solving for the inverse formula.",
  "math.m4.l8":
    "Interpret second and higher derivatives in motion and verify changes in concavity.",
  "math.m4.l9":
    "Choose and combine derivative rules in a multi-step expression and verify the result.",
  "math.m5.l1":
    "Verify the hypotheses of Rolle's and the mean value theorems, then find a matching interior slope.",
  "math.m5.l2":
    "Use a first-derivative sign chart to identify increasing intervals and local extrema.",
  "math.m5.l3":
    "Test concavity on intervals and verify an actual sign change at each inflection point.",
  "math.m5.l4":
    "Choose a conclusive extremum test and explain what to do when the second-derivative test fails.",
  "math.m5.l5":
    "Model an objective under constraints and compare all feasible candidates for an absolute optimum.",
  "math.m5.l6":
    "Differentiate a time-dependent relationship before substituting a snapshot and interpret the signed rate.",
  "math.m5.l7":
    "Construct a tangent-line approximation and distinguish differential estimates from exact changes.",
  "math.m5.l8":
    "Combine domain, limits, first and second derivative charts into a consistent graph sketch.",
  "math.m5.l9":
    "Build and check a model with derivatives, feasible boundaries, units, and approximation limits.",
  "math.m6.l1":
    "Recover a family of antiderivatives and use an initial condition to select one function.",
  "math.m6.l2":
    "Construct a Riemann sum and distinguish its signed limit from geometric area.",
  "math.m6.l3":
    "Use bound reversal, splitting, linearity, and symmetry without losing signs.",
  "math.m6.l4":
    "Differentiate accumulation functions, including moving upper and lower limits.",
  "math.m6.l5":
    "Evaluate a definite integral with an antiderivative and separate signed integral from area.",
  "math.m6.l6":
    "Perform substitution with a matching inner derivative and transformed bounds.",
  "math.m6.l7":
    "Recover motion from velocity and distinguish displacement from total distance.",
  "math.m6.l8":
    "Interpret integrals as changes to an initial quantity with correct signs and units.",
  "math.m7.l1":
    "Set up nonnegative strip integrals for area between curves, splitting where their order changes.",
  "math.m7.l2":
    "Derive cross-sectional area before integrating a volume by slices or disks.",
  "math.m7.l3":
    "Choose washers or shells from a labeled axis, radius, and representative strip.",
  "math.m7.l4":
    "Distinguish average value from total physical accumulation and track units.",
  "math.m7.l5":
    "Model variable-force work as force times infinitesimal displacement.",
  "math.m7.l6":
    "Construct an application integral from a representative slice with correct bounds and units.",
  "math.m8.l1":
    "Apply integration by parts and verify the resulting antiderivative by differentiation.",
  "math.m8.l2":
    "Use derivative pairs and trigonometric identities to reduce trigonometric integrals.",
  "math.m8.l3":
    "Choose a trigonometric substitution with a valid sign branch and return to the original variable.",
  "math.m8.l4":
    "Decompose rational functions into partial fractions while preserving excluded inputs.",
  "math.m8.l5":
    "Compute numerical integral estimates and justify a smoothness-based error bound.",
  "math.m8.l6":
    "Select an integration method from the integrand's structure and verify the result.",
  "math.m9.l1":
    "Define an infinite-interval integral as a limit and classify power-law tails.",
  "math.m9.l2":
    "Split integrals at unbounded points and test every one-sided limit.",
  "math.m9.l3":
    "Use direct or limit comparison with a positive benchmark in the correct direction.",
  "math.m9.l4":
    "Apply the epsilon definition of sequence convergence and use subsequences to detect failure.",
  "math.m9.l5":
    "Prove a recursive sequence is monotone and bounded before solving for its limit.",
  "math.m9.l6":
    "Classify multiple improper endpoints with separate justified comparisons.",
  "math.m10.l1":
    "Define a series through partial sums and apply the necessary term-limit test correctly.",
  "math.m10.l2":
    "Sum geometric and telescoping series from finite partial-sum formulas.",
  "math.m10.l3":
    "Apply integral and direct comparison tests to positive series with checked hypotheses.",
  "math.m10.l4":
    "Use a positive finite ratio limit to compare a series with a known benchmark.",
  "math.m10.l5":
    "Apply ratio and root tests to suitable terms and recognize their inconclusive boundary.",
  "math.m10.l6":
    "Prove alternating-series convergence and bound truncation error by the first omitted term.",
  "math.m10.l7":
    "Distinguish absolute from conditional convergence using separate magnitude and signed tests.",
  "math.m10.l8":
    "Find a power series radius and test both endpoints independently.",
  "math.m10.l9":
    "Construct a Taylor polynomial from derivative data at a specified center.",
  "math.m10.l10":
    "Use a valid derivative bound to certify a Taylor approximation error.",
  "math.m10.l11":
    "Choose and justify complementary tests for a mixed series problem.",
  "math.m11.l1":
    "Use dot and cross products to construct lines and planes with geometric meaning.",
  "math.m11.l2":
    "Differentiate parametrized curves and compute speed, tangent direction, and arc length.",
  "math.m11.l3":
    "Disprove multivariable limits with conflicting paths and prove them with uniform bounds.",
  "math.m11.l4":
    "Compute partial derivatives and interpret a nonzero gradient as a level-set normal.",
  "math.m11.l5":
    "Compute a unit-direction derivative and construct a tangent plane from first partials.",
  "math.m11.l6":
    "Apply the multivariable chain rule through every changing input or Jacobian factor.",
  "math.m11.l7":
    "Build first- and second-order Taylor models using the gradient and Hessian.",
  "math.m11.l8":
    "Classify nondegenerate critical points and handle inconclusive Hessian tests honestly.",
  "math.m11.l9":
    "Solve regular constrained-extremum candidates and compare feasible values.",
  "math.m11.l10":
    "Check the implicit-function hypothesis and differentiate the resulting local branch.",
  "math.m12.l1": "Describe a planar region by slices and evaluate its double integral in either valid order.",
  "math.m12.l2": "Convert a circular-region integral to polar coordinates with the radial area factor.",
  "math.m12.l3": "Set up a triple integral from a solid's bounds and use cylindrical coordinates correctly.",
  "math.m12.l4": "Transform a region, integrand, and area element using an absolute Jacobian determinant.",
  "math.m12.l5": "Test singular and unbounded planar integrals by explicit limiting arguments.",
  "math.m12.l6": "Parametrize an oriented curve and distinguish work integrals from scalar arc-length integrals.",
  "math.m12.l7": "Find a potential function, check its domain, and compute path-independent work.",
  "math.m12.l8": "Apply Green's theorem with all boundary components and correct orientation.",
  "math.m12.l9": "Compute scalar surface area and oriented flux from a surface parametrization.",
  "math.m12.l10": "Relate circulation to normal curl through a compatible spanning surface.",
  "math.m12.l11": "Relate outward closed-surface flux to volume divergence and account for caps.",
  "math.m12.l12": "Recognize the boundary-integral principle behind the vector-calculus theorems.",
  "math.m13.l1": "Row-reduce a linear system and distinguish unique, inconsistent, and free-variable outcomes.",
  "math.m13.l2": "Test span, subspace closure, and independence with linear combinations.",
  "math.m13.l3": "Find a basis and represent vectors with unique coordinates in it.",
  "math.m13.l4": "Compute a linear map's kernel and image and interpret injectivity and surjectivity.",
  "math.m13.l5": "Use rank-nullity to account for all input dimensions.",
  "math.m13.l6": "Compose matrix maps in the correct order and invert a full-rank square map.",
  "math.m13.l7": "Interpret determinant as signed volume scale and identify singular maps.",
  "math.m13.l8": "Compute inner products, norms, and angles, and apply orthogonality correctly.",
  "math.m14.l1": "Derive the normal equations and interpret fitted values as orthogonal projections.",
  "math.m14.l2": "Factor independent columns into orthonormal Q and triangular R for stable solving.",
  "math.m14.l3": "Find eigenvalues and nonzero eigenvectors and interpret invariant directions.",
  "math.m14.l4": "Decide whether an eigenbasis exists and use it to compute matrix powers.",
  "math.m14.l5": "Use the symmetric spectral theorem to read a matrix's quadratic geometry.",
  "math.m14.l6": "Interpret the SVD as orthogonal direction changes and nonnegative stretches.",
  "math.m14.l7": "Classify quadratic forms and solve a positive-definite quadratic optimization problem.",
  "math.m14.l8": "Distinguish problem conditioning from algorithm stability and compute a singular-value ratio.",
  "math.m14.l9": "Center data, identify principal directions from SVD, and avoid leakage.",
  "math.m15.l1": "Separate a first-order ODE, recover equilibrium branches, and state a valid time interval.",
  "math.m15.l2": "Use an integrating factor to solve a linear first-order initial-value problem.",
  "math.m15.l3": "Classify characteristic roots and solve a homogeneous second-order ODE.",
  "math.m15.l4": "Construct a forced response and handle resonance without duplicating homogeneous modes.",
  "math.m15.l5": "Use a matrix exponential to solve a linear ODE system and interpret its modes.",
  "math.m15.l6": "Classify local equilibrium behavior with sign arrows and justified linearization.",
  "math.m15.l7": "Carry out Euler steps and distinguish local, global, and stability error.",
  "math.m15.l8": "Check local existence and uniqueness assumptions and identify finite-time blow-up.",
  "math.m16.l1": "Translate quantified claims and their negations without changing logical meaning.",
  "math.m16.l2": "Use exact set, function, and equivalence-relation definitions in an argument.",
  "math.m16.l3": "Write a direct universal proof and disprove a false universal statement with a counterexample.",
  "math.m16.l4": "Prove an implication by contrapositive or a claim by explicit contradiction.",
  "math.m16.l5": "Carry out induction with a valid base and arbitrary step, including strong induction when needed.",
  "math.m16.l6": "Prove both directions of equivalence and check representative independence on a quotient.",
  "math.m16.l7": "Construct countable enumerations and a diagonal argument for uncountability.",
  "math.m16.l8": "Review a complete proof for quantified scope, missing cases, and unjustified steps.",
  "math.m17.l1": "Count staged choices and disjoint alternatives, and prove a count with a bijection.",
  "math.m17.l2": "Select permutations or combinations based on order and distinguishability.",
  "math.m17.l3": "Use binomial coefficients as subset counts and polynomial coefficients.",
  "math.m17.l4": "Correct overlapping counts through inclusion-exclusion and complements.",
  "math.m17.l5": "Solve a recurrence and derive an ordinary generating-function equation.",
  "math.m17.l6": "Use degree sums, connectivity, and acyclicity to reason about graphs and trees.",
  "math.m17.l7": "Compute discrete event probabilities from a justified sample-space model.",
  "math.m18.l1": "Specify sample spaces and events and compute probabilities without assuming false equiprobability.",
  "math.m18.l2": "Apply conditional probability, total probability, and Bayes' rule with a prior.",
  "math.m18.l3": "Construct a mass function or density and read its cumulative distribution.",
  "math.m18.l4": "Compute expectation, variance, and covariance with the correct assumptions.",
  "math.m18.l5": "Marginalize a joint law and form a normalized conditional distribution.",
  "math.m18.l6": "Choose a named distribution only after checking its experiment and parameter assumptions.",
  "math.m18.l7": "State and apply a law of large numbers without claiming finite-sample certainty.",
  "math.m18.l8": "Standardize a sample average and use the central limit theorem with its limits.",
  "math.m19.l1": "Separate sampling variance, estimator bias, and data-collection bias.",
  "math.m19.l2": "Construct and optimize a likelihood, including boundary cases.",
  "math.m19.l3": "Calculate a standard error and interpret confidence-procedure coverage correctly.",
  "math.m19.l4": "Read a p-value under a specified null without treating it as a posterior probability.",
  "math.m19.l5": "Fit and diagnose a regression without inferring causality from association alone.",
  "math.m19.l6": "Generate bootstrap resamples and state when the resampling model is inappropriate.",
  "math.m19.l7": "Choose grouped or chronological validation and keep preprocessing inside training folds.",
  "math.m19.l8": "Update a prior with a likelihood and distinguish posterior from predictive claims.",
  "math.m20.l1": "Use gradient and Hessian terms to estimate a local objective change.",
  "math.m20.l2": "Compute gradient-descent steps and connect learning rate to curvature and stability.",
  "math.m20.l3": "Test set and function convexity and interpret local versus global minima.",
  "math.m20.l4": "Find regular equality-constrained candidates and justify a global conclusion separately.",
  "math.m20.l5": "Check KKT stationarity, feasibility, multiplier signs, and complementary slackness.",
  "math.m20.l6": "Compute entropy, cross-entropy, and directional KL divergence under support conditions.",
  "math.m20.l7": "Use stable log-sum-exp and distinguish numerical stability from conditioning.",
  "math.m20.l8": "Derive a logistic-loss gradient and design an evaluation without leakage.",
};

export const MATH_LESSONS: Lesson[] = specifications.flatMap(
  ([, , , , topics], index) =>
    topics.map((title, lessonIndex) => ({
      id: `math.m${index + 1}.l${lessonIndex + 1}`,
      moduleId: `math.m${index + 1}`,
      title,
      goal:
        releasedGoals[`math.m${index + 1}.l${lessonIndex + 1}`] ??
        `Explain ${title.toLowerCase()} and work through a complete example before moving on.`,
      repIds: [],
      problemIds: [],
      language: "python",
    })),
);

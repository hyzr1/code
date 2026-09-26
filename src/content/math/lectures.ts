import type { Atom, Concept, LectureQuestion } from "../../types";

type MathLecture = {
  lesson: string;
  title: string;
  premise: string;
  idea: string;
  worked: string;
  interpretation: string;
  trap: string;
  practice: string;
  solution: string;
  checks: [string, string[], number, string][];
};

/** Each released lesson has an argument, a worked example, a transfer task,
 * a complete answer, and retrieval checks. Unwritten roadmap items remain
 * visibly unavailable rather than masquerading as one-minute lectures. */
const lectures: MathLecture[] = [
  {
    lesson: "math.m1.l1", title: "Functions, domains, and ranges",
    premise: "A function assigns exactly one output to every allowed input. The allowed inputs form its domain; the outputs actually attained form its range. Calculus only makes sense when you know which nearby inputs exist.",
    idea: "For f(x) = 1/(x - 2), the denominator cannot be zero, so 2 is excluded from the domain. The output cannot be zero because a nonzero numerator divided by a finite nonzero number never equals zero. Thus both domain and range are all real numbers except 2 and 0 respectively. For g(x) = sqrt(x - 2), the radicand must be nonnegative: x is at least 2, and the range is all nonnegative real numbers. A domain restriction is a property of the rule, not a number to cancel away casually.",
    worked: "Find the domain and range of h(x) = sqrt(9 - x²). The radicand condition 9 - x² ≥ 0 is equivalent to -3 ≤ x ≤ 3. For these x, the square root is smallest at the endpoints, where it is 0, and largest at x = 0, where it is 3. Domain: [-3, 3]. Range: [0, 3].",
    interpretation: "Check that each claimed endpoint is attained. Here h(-3) = 0 and h(0) = 3. A sketch of the upper semicircle is useful verification, but the inequalities establish the answer.",
    trap: "The domain of a composition is not merely the intersection of two written domains. The inner function must land inside the outer function's domain.",
    practice: "Find the domain and range of p(x) = sqrt(4 - x²). Explain why x = 3 is forbidden.",
    solution: "Require 4 - x² ≥ 0, giving -2 ≤ x ≤ 2. The square root ranges from 0 at x = ±2 to 2 at x = 0. Thus domain [-2, 2], range [0, 2]. At x = 3 the radicand is -5, which has no real square root.",
    checks: [["What is the real domain of sqrt(x - 5)?", ["x ≥ 5", "x > 5", "all real x"], 0, "Zero is allowed under a square root, so 5 is included."], ["Why is x = 2 excluded from 1/(x - 2)?", ["The denominator would be zero", "The numerator would be zero", "The output would be negative"], 0, "Division by zero is undefined."], ["What is the range of x² over real x?", ["[0, infinity)", "all real numbers", "(0, infinity)"], 0, "A square is nonnegative and equals zero at x = 0."]],
  },
  {
    lesson: "math.m1.l2", title: "Graphs, transformations, and inverse functions",
    premise: "A graph is a set of input-output pairs. Transformations let you predict an entire graph from a known one without plotting hundreds of points.",
    idea: "If y = f(x), then y = f(x - a) shifts the graph right by a because the old input x₀ is reached when the new input is x₀ + a. Adding b outside, f(x) + b, shifts up. Multiplying the output by c stretches vertically, while f(cx) rescales horizontally by 1/c. An inverse function reverses the input-output relation, so its graph reflects across y = x. An inverse exists as a function only when the original rule is one-to-one on its chosen domain.",
    worked: "Start with f(x) = x² and set g(x) = (x - 3)² + 2. The vertex (0, 0) moves to (3, 2), and the range becomes [2, infinity). x² is not one-to-one on all real numbers: both 2 and -2 map to 4. Restrict to x ≥ 0 and solve y = x² for x; the inverse is sqrt(y).",
    interpretation: "The inverse domain is the original range and the inverse range is the original restricted domain. The restriction is part of the answer, not a technicality.",
    trap: "The shift in f(x - 3) is right, even though the expression contains a minus sign. Verify by asking where the old input zero occurs.",
    practice: "Describe the transformations in q(x) = -2(x + 1)² + 4, and give its range.",
    solution: "Shift x² left 1, stretch vertically by 2, reflect across the x-axis, then shift up 4. The maximum is 4 at x = -1, so the range is (-infinity, 4].",
    checks: [["Where does f(x - 4) move f's graph?", ["Right 4", "Left 4", "Up 4"], 0, "Set x - 4 equal to the original input."], ["What condition lets a function have a function-valued inverse?", ["One-to-one on its domain", "Always positive", "Continuous everywhere"], 0, "Each output must identify a unique input."], ["The domain of f inverse equals which set?", ["The range of f", "The domain of f", "All real numbers"], 0, "An inverse accepts the original outputs as inputs."]],
  },
  {
    lesson: "math.m1.l3", title: "Composition and the difference quotient",
    premise: "Composition means applying one function after another. The difference quotient measures an output change per input change and becomes the derivative when the change shrinks to zero.",
    idea: "For (f ∘ g)(x), compute g(x) first, then feed that result to f. The composition is defined only where x belongs to g's domain and g(x) belongs to f's domain. The difference quotient of f at x is [f(x + h) - f(x)]/h for h ≠ 0. It is an average rate over an interval of width h. Calculus asks whether its limit exists as h approaches zero.",
    worked: "Let f(t) = t² and g(x) = 3x + 1. Then (f ∘ g)(x) = (3x + 1)², whereas (g ∘ f)(x) = 3x² + 1; order matters. For f(x) = x², [f(x + h) - f(x)]/h = [(x + h)² - x²]/h = (2xh + h²)/h = 2x + h for nonzero h. Its limiting value is 2x.",
    interpretation: "We cancel h only while h is nonzero. The limit then describes what happens as h approaches zero; it does not assert that the original quotient is defined at h = 0.",
    trap: "Do not rewrite f(x + h) as f(x) + f(h). That identity is false for most functions, including x².",
    practice: "For f(x) = 3x² - 1, simplify [f(x + h) - f(x)]/h, then find its limit as h approaches zero.",
    solution: "Expand: f(x + h) = 3x² + 6xh + 3h² - 1. Subtract f(x) to get 6xh + 3h². Divide by nonzero h to obtain 6x + 3h. The limit is 6x.",
    checks: [["In f(g(x)), which rule acts first?", ["g", "f", "both simultaneously"], 0, "The inner expression is evaluated first."], ["For f(x) = x², what is the simplified difference quotient?", ["2x + h", "2x", "x² + h"], 0, "The quotient is 2x + h before taking the limit."], ["Why require h ≠ 0 in the quotient?", ["The denominator is h", "The numerator is always zero", "Functions cannot use zero"], 0, "Division by zero is undefined even when a limit exists."]],
  },
  {
    lesson: "math.m1.l4", title: "Trigonometric functions and radians",
    premise: "Radians measure angle by arc length divided by radius. The fundamental trigonometric limits and derivative formulas rely on radian measure.",
    idea: "On the unit circle, cos θ is the horizontal coordinate and sin θ the vertical coordinate. One complete turn is 2π radians. Since tan θ = sin θ / cos θ, tangent is undefined where cosine is zero. The identity sin²θ + cos²θ = 1 follows from the unit-circle equation x² + y² = 1. Periodicity is geometric: sin(θ + 2π) = sin θ. Near zero, sin h / h approaches 1 when h is measured in radians, a fact used to derive the derivative of sine.",
    worked: "Find sin(5π/6) and cos(5π/6). This angle lies in quadrant II, with reference angle π/6. The vertical coordinate is positive, so sin(5π/6) = 1/2. The horizontal coordinate is negative, so cos(5π/6) = -sqrt(3)/2. Their squares add to 1/4 + 3/4 = 1.",
    interpretation: "The signs come from quadrant position, not a memorized sign table alone. Draw the unit circle whenever a special angle seems ambiguous.",
    trap: "A calculator in degree mode will give the wrong value for a radian input. Convert degrees with radians = degrees × π/180 when needed.",
    practice: "Convert 150° to radians, then determine sin and cos using a reference angle.",
    solution: "150 × π/180 = 5π/6. The reference angle is π/6 in quadrant II. Therefore sin = 1/2 and cos = -sqrt(3)/2.",
    checks: [["How many radians are in one full turn?", ["2π", "π", "360π"], 0, "Circumference divided by radius is 2π."], ["What is tan θ?", ["sin θ / cos θ", "cos θ / sin θ", "sin θ + cos θ"], 0, "Tangent is the ratio of sine to cosine."], ["Why do calculus formulas prefer radians?", ["The basic trigonometric limit becomes 1", "Degrees are not measurable", "Radian angles are always positive"], 0, "The limit of sin h / h is 1 in radians."]],
  },
  {
    lesson: "math.m1.l5", title: "Exponential and logarithmic functions",
    premise: "Exponential functions model multiplicative change. A logarithm reverses an exponential and turns multiplication into addition.",
    idea: "For a > 0 and a ≠ 1, y = aˣ and y = log_a(x) are inverse functions. Thus a^(log_a x) = x for x > 0, and log_a(aˣ) = x. Natural logarithm ln uses base e. The product rule ln(uv) = ln u + ln v holds for positive u and v; there is no analogous rule for ln(u + v). Exponential growth has a constant percentage rate; linear growth has a constant absolute increment.",
    worked: "Solve 3e^(2x) = 12. Divide by 3 to get e^(2x) = 4. Apply ln to both sides: 2x = ln 4. Therefore x = (ln 4)/2 = ln 2. Check: e^(2 ln 2) = e^(ln 4) = 4, and 3 × 4 = 12.",
    interpretation: "Taking logarithms is valid here because both sides are positive. The check restores the original equation and catches lost factors.",
    trap: "ln(u + v) does not equal ln u + ln v. The logarithm law applies to a product, not a sum.",
    practice: "Solve 5e^(3t) = 20 and state the domain of ln(x - 1).",
    solution: "Divide by 5: e^(3t) = 4. Hence 3t = ln 4 and t = (ln 4)/3. For ln(x - 1), require x - 1 > 0, so x > 1.",
    checks: [["What does ln(eˣ) simplify to?", ["x", "e", "ln x"], 0, "Natural log and the exponential are inverses."], ["Which identity is valid for positive u and v?", ["ln(uv) = ln u + ln v", "ln(u+v) = ln u + ln v", "ln(u/v) = ln u × ln v"], 0, "Logs convert multiplication into addition."], ["What is the domain of ln x?", ["x > 0", "x ≥ 0", "all real x"], 0, "The real natural logarithm requires a positive input."]],
  },
  {
    lesson: "math.m1.l6", title: "Algebraic and trigonometric review problems",
    premise: "Before limits, fluent manipulation matters more than speed. Each cancellation must preserve the conditions under which the original expression was defined.",
    idea: "Work in three passes: identify the domain, transform the expression using a valid identity, and check the result against the original conditions. Factoring exposes removable factors; conjugates rationalize roots; trigonometric identities relate different-looking expressions. An equation solution must be substituted back if an operation such as squaring could add extraneous roots.",
    worked: "Simplify (x² - 9)/(x - 3). Factor the numerator as (x - 3)(x + 3). For x ≠ 3, cancellation gives x + 3. But the original expression is undefined at x = 3, so the simplified expression describes the same values only with x = 3 excluded. The graph is the line y = x + 3 with a hole at (3, 6).",
    interpretation: "A limit at x = 3 can still be 6, although the original function value at x = 3 does not exist. That distinction drives the next module.",
    trap: "Cancel factors, never terms. (x + 3)/x is not 3, and cancellation in a fraction does not silently fill a hole.",
    practice: "Simplify [sqrt(x + 4) - 2]/x for x ≠ 0 by multiplying by the conjugate. State what happens as x approaches zero.",
    solution: "Multiply numerator and denominator by sqrt(x + 4) + 2. The numerator becomes x, so for x ≠ 0 the expression equals 1/[sqrt(x + 4) + 2]. Its limit as x approaches zero is 1/4. The original expression remains undefined at x = 0.",
    checks: [["What is (x² - 4)/(x - 2) for x ≠ 2?", ["x + 2", "x - 2", "1"], 0, "Factor x² - 4 as (x - 2)(x + 2)."], ["After canceling x - 2, is the original fraction defined at x = 2?", ["No", "Yes", "Only if x is positive"], 0, "A valid simplification keeps the original domain restriction."], ["What helps rationalize sqrt(x + 4) - 2?", ["Its conjugate sqrt(x + 4) + 2", "Multiplying by x", "Squaring only the numerator"], 0, "Conjugates use a² - b² to remove the radicals in the numerator."]],
  },
  {
    lesson: "math.m2.l1", title: "Approaching a point from a table and a graph",
    premise: "A limit asks what outputs approach as inputs get close to a point, not what the function happens to equal at that point.",
    idea: "To estimate lim as x → a of f(x), inspect values with x less than and greater than a while moving closer. A table can suggest a value; a graph can expose a jump or a hole. Neither proves a limit in every case, because finitely many samples cannot rule out oscillation between them. The two-sided limit exists only when both sides approach the same finite value. The function may be undefined at a and still have a limit.",
    worked: "For x ≠ 2, f(x) = (x² - 4)/(x - 2) = x + 2. At x = 1.9 the output is 3.9; at 1.99 it is 3.99; at 2.01 it is 4.01. Both sides approach 4, so the limit is 4. Yet f(2) is undefined. On the graph, the line has a hole at (2, 4).",
    interpretation: "Sampling supports a conjecture; the algebra x + 2 for every x ≠ 2 near the target proves the proposed limit using known limit laws.",
    trap: "Do not substitute x = a before checking whether that substitution is legal. Also do not treat a large table as a proof of behavior at every point in an interval.",
    practice: "Estimate lim as x → 3 of (x² - 9)/(x - 3). Is the original function defined at 3?",
    solution: "For x ≠ 3, factor to x + 3. Values from either side approach 6; hence the limit is 6. The original fraction is 0/0 at x = 3 and is undefined there.",
    checks: [["Can a finite limit exist where f(a) is undefined?", ["Yes", "No", "Only for polynomial functions"], 0, "A limit depends on nearby values rather than the value at the point."], ["What must agree for a two-sided limit?", ["Left and right limits", "f(a) and zero", "Two arbitrary table rows"], 0, "Both approaches must reach the same value."], ["What can a finite table alone establish?", ["An estimate, not a proof", "A proof for all real x", "That continuity holds"], 0, "Finitely many samples can miss behavior between them."]],
  },
  {
    lesson: "math.m2.l2", title: "One-sided limits and when a limit exists",
    premise: "At a boundary or jump, approaching from the left and from the right can give different answers. That is why two-sided limits require a separate check.",
    idea: "Write x → a⁻ for values smaller than a and x → a⁺ for values greater than a. If a function has different formulas on the two sides, evaluate each formula in its own region. A finite two-sided limit equals L exactly when both one-sided limits equal L. At a domain endpoint, only one side may exist within the domain; do not invent inputs outside it.",
    worked: "Let f(x) = x + 1 for x < 2 and f(x) = 5 - x for x ≥ 2. From the left, values approach 3. From the right, values also approach 3. Therefore lim as x → 2 of f(x) = 3, and f(2) = 3. Change the second rule to 6 - x and the right limit becomes 4; then the two-sided limit does not exist, regardless of what value is assigned at x = 2.",
    interpretation: "A jump is detected by disagreement between one-sided limits. Changing the isolated value at the point cannot repair a jump.",
    trap: "Do not average the two one-sided limits. If they disagree, there is no two-sided limit.",
    practice: "For f(x) = x² when x < 1 and f(x) = 2x + 1 when x ≥ 1, find both one-sided limits and decide whether the two-sided limit exists.",
    solution: "The left rule approaches 1² = 1. The right rule approaches 2(1) + 1 = 3. Since 1 ≠ 3, the two-sided limit does not exist. The assigned value f(1) = 3 does not change that.",
    checks: [["Left limit 2 and right limit 3: what is the two-sided limit?", ["It does not exist", "2.5", "3"], 0, "Unequal one-sided limits cannot produce a two-sided limit."], ["Can changing only f(a) fix a jump?", ["No", "Yes", "Only if f(a)=0"], 0, "A jump is about nearby behavior on each side."], ["What does x → a⁻ mean?", ["Approach using x < a", "Approach using x > a", "Subtract a from x"], 0, "The superscript minus indicates the left side."]],
  },
  {
    lesson: "math.m2.l3", title: "Limit laws and direct substitution",
    premise: "Limit laws let us combine known limits. Direct substitution is justified for continuous building blocks at points where their expressions are defined.",
    idea: "If f(x) approaches A and g(x) approaches B, their sum approaches A + B and product approaches AB. Their quotient approaches A/B only when B ≠ 0. Polynomials are continuous everywhere; rational functions are continuous where their denominators are nonzero. Therefore direct substitution is a theorem-backed shortcut in those cases, not a universal recipe. A 0/0 outcome signals that the quotient law does not apply; it is not the limit's value.",
    worked: "Compute lim as x → 2 of (x² + 3x)/(x + 1). Polynomial limits in numerator and denominator are 10 and 3. Since the denominator limit is not zero, the quotient law gives 10/3. For (x² - 4)/(x - 2), direct substitution yields 0/0, so the quotient law cannot decide the answer; factoring is needed.",
    interpretation: "Before any fraction substitution, evaluate its denominator at the target and state why division of limits is allowed.",
    trap: "Zero divided by zero is indeterminate, not zero. Different 0/0 expressions can approach different values or fail to have a limit.",
    practice: "Evaluate lim as x → -1 of (2x² + 1)/(x - 2). Explain the legal use of the quotient law.",
    solution: "The numerator approaches 2(1) + 1 = 3; the denominator approaches -3, which is nonzero. The quotient law therefore gives -1.",
    checks: [["When may the quotient limit law be used?", ["When the denominator limit is nonzero", "Whenever both limits exist", "Only for polynomials"], 0, "A zero denominator limit invalidates this law."], ["What does substitution yielding 0/0 tell you?", ["More analysis is required", "The limit is zero", "The limit is one"], 0, "0/0 is indeterminate."], ["Are polynomials continuous at all real inputs?", ["Yes", "No", "Only positive inputs"], 0, "Finite sums and products of x and constants are continuous."]],
  },
  {
    lesson: "math.m2.l4", title: "Factoring, rationalizing, and removable holes",
    premise: "An undefined value can be an algebraic hole rather than a failure of the nearby outputs to settle. Factoring and conjugates expose the underlying continuous expression.",
    idea: "If numerator and denominator share a factor vanishing at x = a, cancel it only for x ≠ a, then take the limit of the simplified expression. For radicals, multiply by the conjugate to use (u - v)(u + v) = u² - v². A hole is removable if assigning the limiting value at a would make the function continuous. Algebra proves the nearby equality; a graph illustrates it.",
    worked: "Evaluate lim as x → 0 of [sqrt(1 + x) - 1]/x. Multiply numerator and denominator by sqrt(1 + x) + 1. For x ≠ 0 the numerator becomes (1 + x) - 1 = x, so the expression equals 1/[sqrt(1 + x) + 1]. Now substitution is valid and gives 1/2. The original expression remains undefined at zero until a value is assigned there.",
    interpretation: "The conjugate changes the representation without changing values at any admissible nearby x. It does not assert equality at the removed point.",
    trap: "Do not divide by a factor at the target point itself. Cancellation is justified in a punctured neighborhood where x ≠ a.",
    practice: "Find lim as x → 5 of (x² - 25)/(x - 5), and state which value would fill the hole.",
    solution: "Factor x² - 25 = (x - 5)(x + 5). For x ≠ 5 the quotient is x + 5, whose limit at 5 is 10. Define the function value at x = 5 to be 10 to fill the hole continuously.",
    checks: [["What value fills the hole in (x² - 9)/(x - 3) at x=3?", ["6", "3", "0"], 0, "Cancel for x ≠ 3 and evaluate x + 3 at 3."], ["Which expression is the conjugate of sqrt(1+x) - 1?", ["sqrt(1+x) + 1", "sqrt(1-x) - 1", "1 - sqrt(1+x)"], 0, "The conjugate flips the sign between the two terms."], ["What does removable mean?", ["One point can be assigned to restore continuity", "The limit must be zero", "The whole function is undefined"], 0, "A finite limit provides a value for the missing point."]],
  },
  {
    lesson: "math.m2.l5", title: "Infinite limits and vertical asymptotes",
    premise: "Some outputs grow without bound near a forbidden input. An infinite limit describes that behavior; it is not a finite number that the function reaches.",
    idea: "For 1/(x - a), a positive denominator close to zero produces a large positive output, while a negative denominator close to zero produces a large negative output. We write a one-sided limit of +infinity or -infinity to describe unbounded growth. A vertical line x = a is an asymptote when at least one one-sided limit is infinite. Always inspect signs on each side: the two directions can disagree, and an expression such as 1/(x - a)² approaches +infinity from both sides. Infinity is not a real number, so these are not finite limits and cannot be substituted into ordinary arithmetic rules.",
    worked: "Analyze f(x) = (x + 1)/(x - 2) near x = 2. The numerator approaches 3, which stays positive. To the left, x - 2 is a tiny negative number, so f(x) decreases without bound: the left-hand limit is -infinity. To the right, the denominator is tiny and positive, so the right-hand limit is +infinity. Therefore x = 2 is a vertical asymptote, but the finite two-sided limit does not exist. Rewrite f(x) = 1 + 3/(x - 2) to check the same sign behavior.",
    interpretation: "A graph should show opposite branches near x = 2. A table with x = 1.9 and 2.1 can support the sign analysis, but the signs of numerator and denominator explain behavior for every sufficiently close input.",
    trap: "Do not cancel a denominator just because it tends to zero. If the numerator stays nonzero, the magnitude grows. Also, a vertical asymptote does not tell you whether the function is defined at the line itself.",
    practice: "Find the one-sided limits of g(x) = 4/(x + 3)² at x = -3. Does a finite two-sided limit exist, and is x = -3 a vertical asymptote?",
    solution: "For x on either side of -3, (x + 3)² is positive and approaches zero, while the numerator is 4. Both one-sided limits are +infinity. There is no finite two-sided limit. The line x = -3 is a vertical asymptote.",
    checks: [["What is the right-hand behavior of 1/(x - 2) near 2?", ["+infinity", "-infinity", "0"], 0, "The denominator is positive and approaches zero from the right."], ["Can a vertical asymptote occur if only one side diverges?", ["Yes", "No", "Only for polynomials"], 0, "One unbounded one-sided limit is sufficient."], ["Is +infinity a finite limit value?", ["No", "Yes", "Only when both sides agree"], 0, "It describes unbounded growth, not a real output value."]],
  },
  {
    lesson: "math.m2.l6", title: "Limits at infinity and horizontal asymptotes",
    premise: "A limit at infinity asks what happens as inputs grow without bound. It describes long-run behavior, not a value at an input called infinity.",
    idea: "For a rational function, divide numerator and denominator by the largest power of x appearing in the denominator, or compare leading powers. If the numerator degree is smaller, the output approaches zero. If degrees match, the limit is the ratio of leading coefficients. If the numerator degree is larger, there is generally no finite horizontal limit; the function may have a slant or other polynomial asymptote. Check x → +infinity and x → -infinity separately because they can differ. A horizontal asymptote y = L means the output approaches L in at least one far direction; the graph may cross that line.",
    worked: "Evaluate f(x) = (3x² - x + 1)/(2x² + 5) as x → +infinity. Divide top and bottom by x²: f(x) = (3 - 1/x + 1/x²)/(2 + 5/x²). The terms containing 1/x tend to zero, so the limit is 3/2. The same calculation works as x → -infinity because 1/x and 1/x² still tend to zero. Thus y = 3/2 is a horizontal asymptote in both directions.",
    interpretation: "The leading-term shortcut is a consequence of dividing by a nonzero power of x and applying limit laws. Stating that step makes the method transferable to unfamiliar degrees.",
    trap: "A horizontal asymptote is not a barrier. For example, a curve can cross y = L at a finite x and still approach L far away. Do not apply the leading-coefficient ratio when the polynomial degrees differ.",
    practice: "Find the limits of (5x + 1)/(x² + 4) as x → +infinity and x → -infinity, and identify the horizontal asymptote.",
    solution: "Divide by x² to obtain (5/x + 1/x²)/(1 + 4/x²). Every 1/x term tends to zero in either direction, so both limits are 0. The horizontal asymptote is y = 0.",
    checks: [["What is the far-right limit of (7x² + 1)/(2x² - 3)?", ["7/2", "0", "7"], 0, "Equal degrees give the ratio of leading coefficients."], ["Can a graph cross a horizontal asymptote?", ["Yes", "No", "Only at x = 0"], 0, "The asymptote describes far-away behavior."], ["What is the limit of 3/x as x → -infinity?", ["0", "-infinity", "3"], 0, "The magnitude shrinks toward zero even from the negative side."]],
  },
  {
    lesson: "math.m2.l7", title: "The squeeze theorem and trigonometric limits",
    premise: "If a difficult expression stays between two expressions with the same limit, its limit is forced to that value. This is the squeeze theorem.",
    idea: "Suppose g(x) ≤ f(x) ≤ h(x) for every x sufficiently near a, apart from possibly a itself. If g and h both approach L, then f also approaches L. For example, -1 ≤ sin(1/x) ≤ 1, so -x² ≤ x²sin(1/x) ≤ x². Both bounds approach zero, even though sin(1/x) oscillates endlessly. A unit-circle area comparison gives sin u < u < tan u for 0 < u < π/2. Dividing by positive sin u yields cos u < sin u/u < 1; both outside terms approach 1, so sin u/u approaches 1. Symmetry gives the same result from negative u. After substituting u = kx, rewrite sin(kx)/x as k·sin(kx)/(kx). The matching angle must appear in numerator and denominator.",
    worked: "Evaluate lim as x → 0 of sin(3x)/x. Set u = 3x. Then sin(3x)/x = 3·sin(u)/u for nonzero x. As x approaches zero, u approaches zero, and sin(u)/u approaches 1. The limit is 3. For a different kind of example, |x²sin(1/x)| ≤ x², so the squeeze theorem gives lim as x → 0 of x²sin(1/x) = 0, despite the oscillation.",
    interpretation: "The theorem can prove a limit even when direct substitution or a graph is unhelpful. In the oscillating example, the shrinking envelope matters more than the rapid oscillation inside it.",
    trap: "The standard limit sin u/u = 1 requires radians. Also, knowing -1 ≤ sin(1/x) ≤ 1 does not make sin(1/x) converge; the outer bounds must themselves squeeze to the same value.",
    practice: "Use a bound to prove lim as x → 0 of x sin(1/x) = 0. Then find lim as x → 0 of sin(5x)/(2x).",
    solution: "Since |sin(1/x)| ≤ 1, we have |x sin(1/x)| ≤ |x|. The bounds -|x| and |x| both approach zero, so the first limit is 0. For the second, sin(5x)/(2x) = (5/2)·sin(5x)/(5x), whose limit is 5/2.",
    checks: [["What must the two bounding functions share?", ["The same limit", "The same formula", "The same value at the point"], 0, "Only equal outer limits force the middle limit."], ["What is lim sin(4x)/x as x → 0?", ["4", "1", "0"], 0, "Rewrite it as 4·sin(4x)/(4x)."], ["Does sin(1/x) have a limit at zero?", ["No", "Yes, zero", "Yes, one"], 0, "It keeps oscillating between values near -1 and 1."]],
  },
  {
    lesson: "math.m2.l8", title: "Continuity and the intermediate value theorem",
    premise: "A function is continuous at a point when its nearby behavior agrees with its value there. Continuity on an interval gives powerful existence guarantees.",
    idea: "Continuity at a requires three conditions: f(a) is defined, lim as x → a of f(x) exists, and that limit equals f(a). At an interval endpoint, use the appropriate one-sided limit. Sums, products, compositions, and quotients with nonzero denominators preserve continuity where their ingredients are continuous. The intermediate value theorem says that if f is continuous on [a, b], then every value between f(a) and f(b) is attained at some point in [a, b]. It proves existence, not uniqueness, and it does not automatically locate the input.",
    worked: "Show that x³ + x - 1 = 0 has a root in (0, 1). Let f(x) = x³ + x - 1. As a polynomial, f is continuous on [0, 1]. We have f(0) = -1 and f(1) = 1. Since zero lies between these endpoint values, the intermediate value theorem guarantees some c in (0, 1) with f(c) = 0. Continuity matters because a jump from -1 to 1 could skip zero entirely.",
    interpretation: "The theorem justifies a numerical root search such as bisection: each sign-changing subinterval still contains a root. A separate argument is needed to show there is only one root.",
    trap: "Opposite endpoint signs without continuity do not guarantee a root. Likewise, a hole whose limit exists is still discontinuous until the function is defined at that point with the limiting value.",
    practice: "For f(x) = (x² - 4)/(x - 2) when x ≠ 2, choose f(2) to make f continuous. Then explain why x² - 3 has a root between 1 and 2.",
    solution: "For x ≠ 2 the quotient equals x + 2, so its limit at 2 is 4. Set f(2) = 4 to obtain continuity. The polynomial g(x) = x² - 3 is continuous on [1, 2], with g(1) = -2 and g(2) = 1. By the intermediate value theorem it equals zero somewhere in (1, 2).",
    checks: [["Which condition completes continuity at a?", ["lim f(x) as x→a equals f(a)", "f(a) is positive", "the derivative exists"], 0, "Nearby values must approach the assigned value."], ["What does the intermediate value theorem guarantee?", ["An attained intermediate output", "Exactly one root", "A formula for the root"], 0, "It proves existence under continuity."], ["Can opposite endpoint signs alone guarantee a root?", ["No, continuity is needed", "Yes, always", "Only if both endpoints are integers"], 0, "A jump could skip zero."]],
  },
  {
    lesson: "math.m2.l9", title: "Epsilon-delta limits and why rigor matters",
    premise: "Tables and pictures can suggest a limit. The epsilon-delta definition says exactly what it means for every sufficiently close input to produce a sufficiently close output.",
    idea: "The statement lim as x → a of f(x) = L means: for every ε > 0, there is a δ > 0 such that 0 < |x - a| < δ implies |f(x) - L| < ε. The zero exclusion lets f(a) be missing or different. In a proof, begin with the desired output tolerance ε, then choose an input tolerance δ that guarantees it. For a linear function the choice is often direct; for nonlinear functions we may first restrict |x - a| < 1 to bound an extra factor. A proof works for every positive ε, not just a few decimal examples.",
    worked: "Prove lim as x → 2 of (3x + 1) = 7. Let ε > 0 be arbitrary and choose δ = ε/3. If 0 < |x - 2| < δ, then |(3x + 1) - 7| = 3|x - 2| < 3δ = ε. Therefore the limit is 7. The proof does not depend on how small ε is: the same rule for δ responds to every requested precision.",
    interpretation: "For ε = 0.03, δ = 0.01 works. The proof is stronger than checking one numerical tolerance because it gives a choice for all positive tolerances. The definition formalizes the idea that outputs can be forced arbitrarily close to L.",
    trap: "Do not swap the quantifiers: δ may depend on ε, but the proof must work for every ε. Also, writing δ = ε/3 without checking the implication is an incomplete proof.",
    practice: "Use the definition to prove lim as x → 4 of (2x - 5) = 3. State an explicit δ in terms of ε.",
    solution: "Given ε > 0, choose δ = ε/2. Whenever 0 < |x - 4| < δ, we have |(2x - 5) - 3| = 2|x - 4| < 2δ = ε. This proves the limit is 3.",
    checks: [["Who chooses ε in the definition?", ["Any requested positive tolerance", "The function itself", "Only the teacher"], 0, "A proof must handle every ε > 0."], ["Why require 0 < |x-a|?", ["The point itself may be excluded", "To force x positive", "To make ε nonzero"], 0, "Limits concern nearby inputs, even when f(a) is undefined."], ["For f(x)=5x near a=1, what δ ensures output error below ε?", ["ε/5", "5ε", "ε+5"], 0, "The output error is 5|x-1|."]],
  },
  {
    lesson: "math.m2.l10", title: "Mixed limit and continuity problems",
    premise: "A reliable solution starts by classifying the obstacle: safe substitution, a removable hole, a sign-dependent blow-up, a one-sided jump, or a bounded oscillation.",
    idea: "Use a decision sequence. First identify the domain near the target and try substitution only when continuity justifies it. If substitution yields 0/0, factor or rationalize; if a denominator approaches zero while the numerator does not, analyze signs from both sides. For piecewise functions, compute one-sided limits separately. For bounded oscillations multiplied by a shrinking factor, use a squeeze bound. Finally, state whether you found a finite limit, an infinite one-sided behavior, or no limit, and whether a point value makes the function continuous.",
    worked: "Choose c so that f(x) is continuous at x = 1, where f(x) = (x² - 1)/(x - 1) for x ≠ 1 and f(1) = c. For x ≠ 1, factor x² - 1 = (x - 1)(x + 1), so f(x) = x + 1. The limit as x → 1 is 2; therefore continuity requires c = 2. By contrast, if the right-hand rule were x + 3 while the left-hand rule remained x + 1, the one-sided limits would be 4 and 2, so no choice of c could fix that jump.",
    interpretation: "The algebra works only near x = 1, not at the excluded input. Assigning the limiting value fills a removable hole; it cannot repair disagreement between the two sides.",
    trap: "Do not report 0/0 as an answer, treat infinity as a real limit, or use one table side for a two-sided question. Every final answer should name the kind of behavior established.",
    practice: "Classify and evaluate three limits as x → 0: (sin(2x))/x, (sqrt(1+x)-1)/x, and 1/x. Explain which have finite two-sided limits.",
    solution: "The first is 2·sin(2x)/(2x), so its limit is 2. Rationalizing the second gives 1/(sqrt(1+x)+1) for x ≠ 0, so its limit is 1/2. For 1/x, the left-hand behavior is -infinity and the right-hand behavior is +infinity, so it has no finite two-sided limit. The first two originally have removable holes at zero; the third has a vertical asymptote.",
    checks: [["If substitution gives 0/0, what should you do?", ["Simplify or analyze further", "Answer zero", "Answer infinity"], 0, "0/0 does not determine a limit."], ["Can a point value fix unequal one-sided limits?", ["No", "Yes", "Only for a polynomial"], 0, "Changing one point cannot change nearby behavior."], ["What is lim sin(2x)/x as x→0?", ["2", "1", "0"], 0, "Match the inner angle in the denominator."]],
  },
];

const questions = (spec: MathLecture): LectureQuestion[] => spec.checks.map(([question, choices, answer, explanation]) => ({ question, choices, answer, explanation }));

export const MATH_ATOMS: Atom[] = lectures.map((spec, index) => {
  const conceptId = `math.concept.${index + 1}`;
  const body = `${spec.premise}

## The idea, step by step

${spec.idea}

## Worked example

${spec.worked}

## Interpret the result

${spec.interpretation}

## Common mistake

${spec.trap}

## Try it yourself

${spec.practice}

## Full solution

${spec.solution}

## What to remember

${spec.premise}`;
  return {
    id: `math.atom.${index + 1}`,
    title: spec.title,
    teaches: [conceptId],
    requires: index === 0 ? [] : [`math.concept.${index}`],
    readingSeconds: Math.max(240, Math.ceil(body.trim().split(/\s+/).length / 2)),
    body,
    recall: spec.practice,
    checks: questions(spec),
    language: "python",
  };
});

export const MATH_CONCEPTS: Concept[] = lectures.map((spec, index) => ({
  id: `math.concept.${index + 1}`,
  title: spec.title,
  stage: 0,
  kind: "mental-model",
  requires: index === 0 ? [] : [`math.concept.${index}`],
  atom: `math.atom.${index + 1}`,
  language: "python",
}));

export const MATH_LECTURE_CONTENT = Object.fromEntries(lectures.map((spec, index) => [spec.lesson, { atomId: `math.atom.${index + 1}` }]));

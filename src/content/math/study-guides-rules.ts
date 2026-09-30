import type { MathStudyGuide } from "./study-guides";

export const MATH_RULE_STUDY_GUIDES: Record<string, MathStudyGuide> = {
  "math.m4.l2": {
    opening: ["The power rule works on a single power of x, but a product of two changing functions needs two contributions. If y = f(x)g(x), then y′ = f′g + fg′. Imagine changing f a little while g stays almost fixed, then changing g while f stays almost fixed.", "For a quotient f/g, where g ≠ 0, the rule is (f/g)′ = (f′g - fg′)/g². The order in the numerator matters. Before using either rule, see whether expanding or simplifying produces an easier equivalent expression on the same domain."],
    examples: [
      { question: "Differentiate y = x²(x + 3).", approach: "Name the factors f = x² and g = x + 3, then make both product-rule terms.", steps: ["f′ = 2x and g′ = 1.", "y′ = f′g + fg′ = 2x(x + 3) + x²(1).", "Expand: 2x² + 6x + x² = 3x² + 6x."], check: "Expanding first gives y = x³ + 3x², whose derivative is also 3x² + 6x." },
      { question: "Differentiate r(x) = (x² + 1)/x for x ≠ 0.", approach: "Use the quotient rule and independently check by simplifying.", steps: ["Set f = x² + 1, g = x, f′ = 2x, and g′ = 1.", "r′ = [2x·x - (x² + 1)·1]/x² = (x² - 1)/x².", "Equivalently, r = x + 1/x for x ≠ 0, so r′ = 1 - 1/x². The forms agree."], check: "Keep x ≠ 0: simplifying does not fill an excluded point." },
    ],
    practice: [
      { question: "Differentiate (x² + 2x)(x - 3).", hint: "Differentiate each factor in turn, leaving the other unchanged.", solution: ["y′ = (2x + 2)(x - 3) + (x² + 2x)(1).", "Expand and combine: 2x² - 4x - 6 + x² + 2x = 3x² - 2x - 6."] },
      { question: "Differentiate (x + 1)/(x - 1) and state its domain.", hint: "The denominator excludes x = 1.", solution: ["y′ = [(1)(x - 1) - (x + 1)(1)]/(x - 1)².", "The numerator is -2, so y′ = -2/(x - 1)² for x ≠ 1."] },
    ], takeaway: "A product has two changing-factor terms. A quotient has a squared denominator and the numerator order f′g - fg′.",
  },
  "math.m4.l3": {
    opening: ["A nested function does one job inside another. In (3x + 1)⁴, the inside produces 3x + 1 and the outside raises that result to the fourth power. The chain rule says: differentiate the outside while keeping the inside, then multiply by the inside derivative.", "In symbols, if y = f(g(x)), then y′ = f′(g(x))g′(x). It is not enough to lower the outer exponent; the inside may also be changing faster or slower than x."],
    examples: [
      { question: "Differentiate y = (3x + 1)⁴.", approach: "Let u = 3x + 1 and treat y = u⁴ before returning to x.", steps: ["The outer derivative with respect to u is 4u³.", "The inner derivative is du/dx = 3.", "Multiply: dy/dx = 4(3x + 1)³·3 = 12(3x + 1)³."], check: "At x = 0, the result is 12. Expanding the original polynomial would give the same slope but much more work." },
      { question: "Differentiate y = √(x² + 4).", approach: "Rewrite the root as a half-power and identify the whole inside expression.", steps: ["y = (x² + 4)^(1/2). The outer derivative is (1/2)(x² + 4)^(-1/2).", "The inside derivative is 2x.", "Multiply and simplify: y′ = x/√(x² + 4)."], check: "At x = 0, the slope is zero, matching the symmetry of the graph." },
    ],
    practice: [
      { question: "Differentiate (2x² - 1)⁵.", hint: "Outer derivative: 5(inside)⁴. Inside derivative: 4x.", solution: ["y′ = 5(2x² - 1)⁴·4x = 20x(2x² - 1)⁴."] },
      { question: "Differentiate 1/(x² + 1).", hint: "Write it as (x² + 1)⁻¹.", solution: ["Outer derivative: -(x² + 1)⁻². Inside derivative: 2x.", "Thus y′ = -2x/(x² + 1)²."] },
    ], takeaway: "Outside derivative × inside derivative. Name each layer before differentiating.",
  },
  "math.m4.l4": {
    opening: ["In radians, the derivative of sin x is cos x, and the derivative of cos x is -sin x. These signs follow from the unit circle and the small-angle limit sin h/h → 1. They are not the same formulas if x is measured directly in degrees.", "For nested angles, combine the trig rule with the chain rule. The derivative of sin(3x) is cos(3x) multiplied by the derivative of 3x, giving 3cos(3x). Tangent is sin/cos, so its derivative can be derived by the quotient rule and equals sec²x where cos x ≠ 0."],
    examples: [
      { question: "Differentiate y = sin(3x) + 2cos x.", approach: "Handle each term, including the inner rate in sin(3x).", steps: ["For sin(3x), outer derivative gives cos(3x); inner derivative of 3x is 3, so the result is 3cos(3x).", "For 2cos x, retain 2 and differentiate cosine to -sin x, giving -2sin x.", "Add: y′ = 3cos(3x) - 2sin x."], check: "At x = 0, y′(0) = 3, since cos 0 = 1 and sin 0 = 0." },
      { question: "Derive the derivative of tan x = sin x/cos x.", approach: "Use the quotient rule, then simplify with sin²x + cos²x = 1.", steps: ["Numerator derivative is cos x and denominator derivative is -sin x.", "The quotient rule gives [cos x·cos x - sin x·(-sin x)]/cos²x.", "The numerator is cos²x + sin²x = 1, so y′ = 1/cos²x = sec²x where cos x ≠ 0."], check: "The derivative is positive wherever tangent is defined." },
    ],
    practice: [
      { question: "Differentiate cos(2x²).", hint: "Differentiate cosine outside, then 2x² inside.", solution: ["Outer derivative is -sin(2x²), and inner derivative is 4x.", "Thus y′ = -4x sin(2x²)."] },
      { question: "Differentiate 3tan x and state where the formula is valid.", hint: "d(tan x)/dx = sec²x where cos x ≠ 0.", solution: ["The derivative is 3sec²x.", "It is valid at inputs where cos x ≠ 0; tangent itself is undefined at the remaining inputs."] },
    ], takeaway: "Trig derivative formulas assume radians. A nested angle also contributes its own derivative.",
  },
  "math.m4.l5": {
    opening: ["The exponential function eˣ has a special property: its derivative is itself. For e^(g(x)), multiply by g′(x) using the chain rule. The natural logarithm is its inverse, and d(ln x)/dx = 1/x for x > 0.", "For ln|g(x)| on intervals where g(x) ≠ 0, the derivative is g′(x)/g(x). Always identify the log's domain first; differentiating a formula does not make an undefined original input legal."],
    examples: [
      { question: "Differentiate y = 3e^(2x) - ln x for x > 0.", approach: "Treat the coefficient, exponential's inside, and logarithm separately.", steps: ["d[3e^(2x)]/dx = 3e^(2x)·2 = 6e^(2x).", "d[-ln x]/dx = -1/x for x > 0.", "Therefore y′ = 6e^(2x) - 1/x, with the original restriction x > 0."], check: "At x = 1 the derivative is 6e² - 1." },
      { question: "Differentiate ln(x² + 1).", approach: "The outside logarithm contributes 1/(inside); the inside contributes 2x.", steps: ["Set u = x² + 1. Since u ≥ 1, the log is defined for every real x.", "d(ln u)/du = 1/u and du/dx = 2x.", "Multiply: y′ = 2x/(x² + 1)."], check: "At x = 0 the slope is zero, matching this even function's symmetry." },
    ],
    practice: [
      { question: "Differentiate e^(x² - 3x).", hint: "The inside derivative is 2x - 3.", solution: ["The outside derivative remains e^(x² - 3x).", "Multiply by the inner derivative: y′ = (2x - 3)e^(x² - 3x)."] },
      { question: "Differentiate ln(5 - 2x) and state its domain.", hint: "Require 5 - 2x > 0 before differentiating.", solution: ["The domain is x < 5/2.", "Use the chain rule: y′ = (-2)/(5 - 2x) on that domain."] },
    ], takeaway: "e^(inside) keeps the exponential; ln(inside) gives 1/inside. Multiply each by the inside derivative and keep the domain.",
  },
  "math.m4.l6": {
    opening: ["Sometimes a curve gives a relationship between x and y without solving for y. In x² + y² = 25, y changes as x changes even though y is not isolated. Implicit differentiation lets us find dy/dx directly.", "Differentiate both sides with respect to x. A y term requires the chain rule because y is a function of x: d(y²)/dx = 2y(dy/dx). Then collect the dy/dx terms and solve. The result describes a slope only at points where the curve and division are valid."],
    examples: [
      { question: "Find the slope of x² + y² = 25 at (3, 4).", approach: "Differentiate the equation, solve for y′, then substitute the point.", steps: ["Differentiate: 2x + 2y y′ = 0. The second term has y′ because y depends on x.", "Solve: 2y y′ = -2x, so y′ = -x/y when y ≠ 0.", "At (3, 4), y′ = -3/4."], check: "The point lies on the circle because 3² + 4² = 25. The negative slope matches the upper-right arc descending." },
      { question: "Differentiate xy + y² = 6.", approach: "The xy term needs the product rule; each y derivative contributes y′.", steps: ["d(xy)/dx = 1·y + x·y′ = y + xy′.", "d(y²)/dx = 2yy′. The right side, 6, has derivative 0.", "Thus y + xy′ + 2yy′ = 0. Factor y′: (x + 2y)y′ = -y, so y′ = -y/(x + 2y) where x + 2y ≠ 0."], check: "Do not treat y as a constant; it moves along the curve." },
    ],
    practice: [
      { question: "Differentiate x² + 3y² = 12 and find slope at (0, 2).", hint: "d(3y²)/dx = 6y y′.", solution: ["2x + 6y y′ = 0, so y′ = -x/(3y) where y ≠ 0.", "At (0, 2), y′ = 0. The point lies on the curve: 0 + 3(4) = 12."] },
      { question: "Why does d(y³)/dx equal 3y²y′ rather than only 3y²?", hint: "The outer power is applied to an inner function y(x).", solution: ["By the chain rule, differentiate the outside to 3y² and multiply by the inside derivative dy/dx.", "Thus d(y³)/dx = 3y²y′."] },
    ], takeaway: "Treat y as y(x). Differentiate both sides, attach y′ to differentiated y terms, then solve for the slope.",
  },
  "math.m4.l7": {
    opening: ["An inverse function reverses input and output. If f(a) = b, then f⁻¹(b) = a. Their slopes are reciprocals at matching points when f′(a) ≠ 0: (f⁻¹)′(b) = 1/f′(a).", "This follows from f(f⁻¹(x)) = x. Differentiate both sides with the chain rule: f′(f⁻¹(x))(f⁻¹)′(x) = 1. Solve for the inverse derivative. It applies only where the inverse exists locally and the denominator is nonzero."],
    examples: [
      { question: "Let f(x) = x³ + x. Find (f⁻¹)′(2).", approach: "Find which original input produces 2; no explicit inverse formula is needed.", steps: ["Solve f(a) = 2. Since f(1) = 1 + 1 = 2, the matching input is a = 1.", "f′(x) = 3x² + 1, so f′(1) = 4.", "The inverse slope at output 2 is 1/f′(1) = 1/4."], check: "f is increasing everywhere because f′ = 3x² + 1 > 0, so its inverse is well-defined." },
      { question: "Derive the derivative of √x for x > 0 by inverting f(x) = x² on x ≥ 0.", approach: "Match x with its preimage √x, then take the reciprocal of the original slope.", steps: ["On nonnegative inputs, f⁻¹(x) = √x.", "At a = √x > 0, f′(a) = 2a = 2√x.", "Therefore d(√x)/dx = 1/(2√x) for x > 0."], check: "This agrees with the conjugate-based difference quotient from first principles." },
    ],
    practice: [
      { question: "If f(3) = 5 and f′(3) = 7, what is (f⁻¹)′(5)?", hint: "Match output 5 to original input 3.", solution: ["Since f⁻¹(5) = 3, the inverse derivative is 1/f′(3).", "Thus (f⁻¹)′(5) = 1/7."] },
      { question: "Why can this formula fail where f′(a) = 0?", hint: "The inverse slope would require dividing by zero.", solution: ["The reciprocal 1/f′(a) is undefined if f′(a) = 0.", "Geometrically, a horizontal tangent of f may become a vertical tangent of the inverse, which has no finite derivative there."] },
    ], takeaway: "To differentiate an inverse at b, find a with f(a) = b and compute 1/f′(a), provided that slope is nonzero.",
  },
  "math.m4.l8": {
    opening: ["The first derivative measures how the original function changes. The second derivative measures how the first derivative changes. For position s(t), this gives velocity v = s′ and acceleration a = s″.", "A positive second derivative means slope is increasing; a negative second derivative means slope is decreasing. That is related to concavity, but it is not the same as saying the original function is positive or negative. Keep the object and units straight at each level."],
    examples: [
      { question: "For s(t) = t³ - 6t² + 9t meters, find velocity and acceleration.", approach: "Differentiate one level at a time and attach the changing units.", steps: ["Differentiate position: v(t) = 3t² - 12t + 9 meters per second.", "Differentiate velocity: a(t) = 6t - 12 meters per second squared.", "At t = 2, velocity is 12 - 24 + 9 = -3 m/s, while acceleration is 0 m/s²."], check: "Zero acceleration at one instant does not mean zero velocity there." },
      { question: "What does f″(x) = 6x tell you for f(x) = x³?", approach: "Compare the derivative to its own rate of change.", steps: ["First derivative: f′(x) = 3x². Second derivative: f″(x) = 6x.", "For x < 0, f″(x) < 0, so slopes decrease as x increases there.", "For x > 0, f″(x) > 0, so slopes increase. The concavity changes around 0."], check: "f′(x) = 3x² has its minimum at 0, matching the sign change in f″." },
    ],
    practice: [
      { question: "For f(x) = 2x⁴ - x², find f′ and f″.", hint: "Differentiate term by term twice.", solution: ["f′(x) = 8x³ - 2x.", "f″(x) = 24x² - 2."] },
      { question: "If position uses meters and time uses seconds, what units do s′, s″, and s‴ have?", hint: "Each differentiation divides by another second.", solution: ["s′ has m/s, s″ has m/s², and s‴ has m/s³.", "The third derivative is sometimes called jerk: change in acceleration per second."] },
    ], takeaway: "Each derivative measures the change of the previous quantity. Differentiate one level at a time and track its units.",
  },
  "math.m4.l9": {
    opening: ["A complicated derivative becomes manageable when you identify its structure before calculating. Ask: is this a sum, a product, a quotient, or a function nested inside another? Often more than one applies, so work from the outside inward.", "There is no single formula for a mixed expression. Write intermediate pieces, keep parentheses, and check the result by an alternate simplification when possible. State domain restrictions before cancelling or taking logarithms."],
    examples: [
      { question: "Differentiate y = x²e^(3x).", approach: "The outer structure is a product; the exponential factor also needs a chain rule.", steps: ["Let f = x² and g = e^(3x). Then f′ = 2x and g′ = 3e^(3x).", "Product rule: y′ = 2x e^(3x) + x² · 3e^(3x).", "Factor if useful: y′ = e^(3x)(2x + 3x²)."], check: "At x = 0, both terms vanish, so y′(0) = 0." },
      { question: "Differentiate y = ln[(x² + 1)/(x + 2)] for x > -2.", approach: "Use log properties on a positive quotient, then differentiate the two simpler terms.", steps: ["Since x² + 1 > 0 and x + 2 > 0 on x > -2, write y = ln(x² + 1) - ln(x + 2).", "Chain rule gives d[ln(x² + 1)]/dx = 2x/(x² + 1).", "The second derivative is 1/(x + 2), so y′ = 2x/(x² + 1) - 1/(x + 2)."], check: "The stated domain x > -2 makes both log arguments positive; the derivative does not extend through x = -2." },
    ],
    practice: [
      { question: "Differentiate (x² + 1)sin(2x).", hint: "Product rule outside, chain rule for sin(2x).", solution: ["Derivative of the first factor is 2x; derivative of the second is 2cos(2x).", "Thus y′ = 2x sin(2x) + 2(x² + 1)cos(2x)."] },
      { question: "Differentiate e^(x²)/(x + 1) on x ≠ -1.", hint: "Use the quotient rule; derivative of e^(x²) is 2xe^(x²).", solution: ["y′ = [2xe^(x²)(x + 1) - e^(x²)]/(x + 1)².", "Factor e^(x²): y′ = e^(x²)[2x(x + 1) - 1]/(x + 1)² for x ≠ -1."] },
    ], takeaway: "Identify the outer operation first, then differentiate nested pieces. Keep parentheses and domains visible.",
  },
};

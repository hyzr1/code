import type { MathStudyGuide } from "./study-guides";

export const MATH_METHOD_STUDY_GUIDES: Record<string, MathStudyGuide> = {
  "math.m8.l1": {
    opening: ["Integration by parts reverses the product rule. Since (uv)′ = u′v + uv′, rearranging after integration gives ∫u dv = uv - ∫v du. Pick u to become simpler when differentiated and dv to be easy to integrate.", "It is often useful for a polynomial multiplied by an exponential or trigonometric function. The method trades one integral for another; check that the new one is actually easier and verify your answer by differentiating."],
    examples: [
      { question: "Find ∫x eˣ dx.", approach: "Differentiate x to 1 and integrate eˣ to itself.", steps: ["Choose u = x and dv = eˣ dx. Then du = dx and v = eˣ.", "Apply the formula: ∫x eˣ dx = xeˣ - ∫eˣ dx.", "Integrate the remaining term: xeˣ - eˣ + C = (x - 1)eˣ + C."], check: "Differentiate (x - 1)eˣ by the product rule to recover xeˣ." },
      { question: "Find ∫x cos x dx.", approach: "The polynomial x becomes 1 when differentiated.", steps: ["Choose u = x and dv = cos x dx; then du = dx and v = sin x.", "The formula gives x sin x - ∫sin x dx.", "Since ∫sin x dx = -cos x, the answer is x sin x + cos x + C."], check: "Derivative is sin x + x cos x - sin x = x cos x." },
    ], practice: [
      { question: "Evaluate ∫ from 0 to 1 of x eˣ dx.", hint: "Use (x - 1)eˣ as an antiderivative.", solution: ["At 1, (1 - 1)e = 0. At 0, (0 - 1)e⁰ = -1.", "Upper minus lower gives 1."] },
      { question: "Find ∫x sin x dx.", hint: "Let u = x and dv = sin x dx, so v = -cos x.", solution: ["∫x sin x dx = -x cos x - ∫(-cos x)dx.", "Answer: -x cos x + sin x + C. Differentiate to check."] },
    ], takeaway: "Choose u and dv to simplify the remaining integral, keep the minus sign, and differentiate the result to verify.",
  },
  "math.m8.l2": {
    opening: ["Trigonometric powers often hide a substitution. When a product has an odd power of sine, save one sin x dx for the derivative of cos x. When it has an odd power of cosine, save one cos x dx for the derivative of sin x. If both powers are even, half-angle identities can reduce them.", "The identity sin²x + cos²x = 1 lets you rewrite a leftover even power. Keep squared terms intact and include chain factors when integrating cos(2x) or sin(2x)."],
    examples: [
      { question: "Find ∫sin³x cos x dx.", approach: "The cos x dx is exactly the derivative of sin x.", steps: ["Let u = sin x, so du = cos x dx.", "The integral becomes ∫u³ du = u⁴/4 + C.", "Substitute back: sin⁴x/4 + C."], check: "Derivative of sin⁴x/4 is sin³x cos x." },
      { question: "Find ∫sin²x dx.", approach: "There is no spare cos x factor, so use the half-angle identity.", steps: ["sin²x = (1 - cos 2x)/2.", "Integrate: ∫sin²x dx = x/2 - (1/2)∫cos 2x dx.", "Because ∫cos 2x dx = (1/2)sin 2x, the answer is x/2 - sin(2x)/4 + C."], check: "Differentiate to get 1/2 - cos(2x)/2 = sin²x." },
    ], practice: [
      { question: "Find ∫cos³x sin x dx.", hint: "Let u = cos x, so du = -sin x dx.", solution: ["The integral becomes -∫u³ du = -u⁴/4 + C.", "Answer: -cos⁴x/4 + C."] },
      { question: "Evaluate ∫ from 0 to π of sin²x dx.", hint: "Use x/2 - sin(2x)/4 at both bounds.", solution: ["At π the antiderivative is π/2; at 0 it is 0.", "The result is π/2."] },
    ], takeaway: "Look for a trig function paired with its derivative; otherwise use identities to lower even powers.",
  },
  "math.m8.l3": {
    opening: ["A square root such as √(a² - x²) can simplify through a unit-circle identity. Set x = a sin θ so a² - x² = a²(1 - sin²θ) = a²cos²θ. But √(cos²θ) = |cos θ|, so choose an angle interval where cos θ is nonnegative before dropping the absolute value.", "Transform dx too, integrate entirely in θ, and then return to x. A radical alone does not force trig substitution; a plain u-substitution may be shorter if its derivative is already present."],
    examples: [
      { question: "Find ∫√(4 - x²) dx for -2 < x < 2.", approach: "Use x = 2sin θ with θ in (-π/2, π/2), where cos θ > 0.", steps: ["dx = 2cos θ dθ and √(4 - x²) = √(4cos²θ) = 2cos θ.", "The integral becomes 4∫cos²θ dθ = 4∫(1 + cos 2θ)/2 dθ = 2θ + sin 2θ + C.", "Since θ = arcsin(x/2) and sin 2θ = x√(4 - x²)/2, the answer is 2arcsin(x/2) + (x/2)√(4 - x²) + C."], check: "The chosen θ interval justifies replacing |cos θ| with cos θ." },
      { question: "Evaluate ∫ from 0 to 1 of x/√(4 - x²) dx without trig substitution.", approach: "The numerator x matches the derivative of the expression under the root.", steps: ["Let u = 4 - x², so du = -2x dx. Bounds change from x = 0, 1 to u = 4, 3.", "Integral = -(1/2)∫ from 4 to 3 of u^(-1/2) du = [-√u] from 4 to 3.", "Value = -√3 - (-2) = 2 - √3."], check: "The integrand is positive on [0,1], and 2 - √3 is positive." },
    ], practice: [
      { question: "For √(9 - x²), what trig substitution and angle interval make the radical nonnegative?", hint: "Use 9 = 3².", solution: ["Set x = 3sin θ with θ in [-π/2, π/2].", "Then √(9 - x²) = 3cos θ because cos θ ≥ 0 on that interval."] },
      { question: "Find ∫x/√(9 - x²) dx by a direct substitution.", hint: "Let u = 9 - x².", solution: ["du = -2x dx, so the integral is -(1/2)∫u^(-1/2)du.", "Answer: -√(9 - x²) + C. Differentiate to check."] },
    ], takeaway: "Transform the whole integral, control square-root signs with an angle interval, and prefer a simpler substitution when available.",
  },
  "math.m8.l4": {
    opening: ["Partial fractions breaks a rational expression into simpler fractions that can be integrated separately. First factor the denominator. If the numerator degree is at least the denominator degree, divide polynomials first. For each distinct linear factor, include a term with its own constant numerator.", "Clear denominators to solve for the constants. The resulting logarithms use absolute values, and the antiderivative is valid only on intervals avoiding the original denominator's zeros."],
    examples: [
      { question: "Find ∫1/(x² - 1) dx.", approach: "Factor x² - 1 into (x - 1)(x + 1), then solve for two constants.", steps: ["Write 1/[(x - 1)(x + 1)] = A/(x - 1) + B/(x + 1).", "Clear denominators: 1 = A(x + 1) + B(x - 1). Set x = 1 to get A = 1/2; set x = -1 to get B = -1/2.", "Integrate: (1/2)ln|x - 1| - (1/2)ln|x + 1| + C on any interval excluding ±1."], check: "Differentiating recombines the fractions to 1/(x² - 1)." },
      { question: "Decompose (3x + 5)/(x² + 3x + 2).", approach: "Factor the denominator and match coefficients.", steps: ["x² + 3x + 2 = (x + 1)(x + 2). Write (3x + 5)/[(x + 1)(x + 2)] = A/(x + 1) + B/(x + 2).", "Then 3x + 5 = A(x + 2) + B(x + 1), so A + B = 3 and 2A + B = 5. Subtract to get A = 2, hence B = 1.", "The integral is 2ln|x + 1| + ln|x + 2| + C, on an interval avoiding -1 and -2."], check: "2(x + 2) + (x + 1) = 3x + 5, so the decomposition is correct." },
    ], practice: [
      { question: "Decompose 1/[x(x + 1)] and integrate it.", hint: "Try A/x + B/(x + 1).", solution: ["1 = A(x + 1) + Bx. At x = 0, A = 1; comparing x terms gives B = -1.", "Integral = ln|x| - ln|x + 1| + C on intervals avoiding 0 and -1."] },
      { question: "Why must you divide before using partial fractions on x²/(x - 1)?", hint: "Compare numerator and denominator degrees.", solution: ["The numerator has degree 2 and denominator degree 1; the rational expression is improper.", "Polynomial division gives x²/(x - 1) = x + 1 + 1/(x - 1), which is now easy to integrate."] },
    ], takeaway: "Factor, decompose with enough terms, solve constants, and preserve excluded inputs in the logarithmic answer.",
  },
  "math.m8.l5": {
    opening: ["Some definite integrals cannot be found conveniently by an elementary antiderivative. Numerical integration estimates them from sample values. With n equal pieces of width h = (b - a)/n, the midpoint rule samples each piece at its center; the trapezoid rule averages endpoint heights.", "An estimate is more useful with an error assessment. For a smooth function with |f″| ≤ M on the interval, midpoint error is at most M(b - a)h²/24 and trapezoid error at most M(b - a)h²/12. State the smoothness and bound before claiming a guaranteed error."],
    examples: [
      { question: "Estimate ∫ from 0 to 1 of x² dx with two midpoint rectangles.", approach: "Split into two intervals of width 1/2 and sample their centers.", steps: ["h = 1/2; midpoints are 1/4 and 3/4.", "M₂ = (1/2)[(1/4)² + (3/4)²] = (1/2)(1/16 + 9/16) = 5/16 = 0.3125.", "Exact integral is [x³/3] from 0 to 1 = 1/3. Absolute error is 1/3 - 5/16 = 1/48."], check: "Since f″ = 2, the midpoint error bound is 2·1·(1/2)²/24 = 1/48, equal to the actual error here." },
      { question: "Estimate the same integral with two trapezoids.", approach: "Use endpoint values with half weight at the two outer endpoints.", steps: ["Sample f(0) = 0, f(1/2) = 1/4, and f(1) = 1.", "T₂ = (1/2)[f(0)/2 + f(1/2) + f(1)/2] = (1/2)(0 + 1/4 + 1/2) = 3/8.", "Actual error is 3/8 - 1/3 = 1/24."], check: "The trapezoid bound gives 2·1·(1/2)²/12 = 1/24." },
    ], practice: [
      { question: "Use one midpoint rectangle to estimate ∫ from 0 to 2 of x² dx.", hint: "Width is 2; midpoint is x = 1.", solution: ["Estimate = width × midpoint height = 2·1² = 2.", "Exact value is 8/3, so the midpoint estimate is low by 2/3."] },
      { question: "Why can you not quote a second-derivative error bound when f″ is unbounded on the interval?", hint: "The formula assumes a finite M with |f″| ≤ M.", solution: ["No finite constant M satisfies the required bound, so the theorem's hypothesis fails.", "A numerical estimate may still be computed, but that particular guaranteed error formula does not apply."] },
    ], takeaway: "Specify the rule, samples, and width; when claiming accuracy, verify the derivative bound that supports it.",
  },
  "math.m8.l6": {
    opening: ["Integration is often a choice among methods. Before computing, simplify the expression and inspect its structure. An inside expression with its derivative suggests substitution; a product with a factor that simplifies on differentiation suggests parts; a factorable rational denominator suggests partial fractions.", "Some integrals need identities, numerical approximation, or multiple steps. After obtaining an antiderivative, differentiate it to recover the original integrand. This check catches sign and chain-factor errors."],
    examples: [
      { question: "Choose methods for ∫2x/(1 + x²)dx and ∫x eˣ dx.", approach: "Match each expression to a derivative pattern.", steps: ["In the first, the denominator's derivative is 2x, exactly the numerator. Set u = 1 + x², giving ∫du/u = ln(1 + x²) + C.", "In the second, differentiating the polynomial x simplifies it. Use parts with u = x and dv = eˣ dx.", "That gives xeˣ - ∫eˣ dx = (x - 1)eˣ + C."], check: "Differentiate both answers: they recover 2x/(1 + x²) and xeˣ respectively." },
      { question: "Choose a method for ∫1/(x² - 1)dx.", approach: "The denominator factors into two distinct linear terms.", steps: ["x² - 1 = (x - 1)(x + 1), so substitution has no matching numerator derivative.", "Partial fractions give (1/2)/(x - 1) - (1/2)/(x + 1).", "Integrate to (1/2)ln|x - 1| - (1/2)ln|x + 1| + C, away from ±1."], check: "The logarithms' derivatives reconstruct the original fraction." },
    ], practice: [
      { question: "Choose and evaluate ∫ from 0 to 1 of 2x e^(x²)dx.", hint: "The exponent x² has derivative 2x.", solution: ["Set u = x², du = 2x dx. Bounds remain 0 and 1.", "Integral = ∫ from 0 to 1 of eᵘ du = e - 1."] },
      { question: "What method is needed for ∫ from 0 to 1 of x² dx?", hint: "Start with the direct power rule before trying special methods.", solution: ["No special technique is needed. Antiderivative is x³/3.", "Evaluate 1/3 - 0 = 1/3."] },
    ], takeaway: "Diagnose structure before choosing a technique and always verify the final antiderivative or definite value.",
  },
};

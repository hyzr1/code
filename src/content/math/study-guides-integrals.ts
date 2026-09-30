import type { MathStudyGuide } from "./study-guides";

export const MATH_INTEGRAL_STUDY_GUIDES: Record<string, MathStudyGuide> = {
  "math.m6.l3": {
    opening: ["A definite integral adds signed contributions across an interval. Its bounds carry direction: reversing them reverses the sign. Splitting an interval at c preserves the total because the pieces rejoin. These properties help simplify calculations before finding an antiderivative.", "For a symmetric interval [-a, a], an odd function has cancelling contributions and integral zero. An even function has matching halves, so its integral is twice the half on [0, a]. Do not assume every function on a symmetric interval cancels."],
    examples: [
      { question: "If ∫ from 0 to 2 of f = 3 and ∫ from 2 to 5 of f = -1, find ∫ from 5 to 0 of f.", approach: "Join adjacent intervals, then reverse the bounds.", steps: ["∫ from 0 to 5 of f = ∫ from 0 to 2 of f + ∫ from 2 to 5 of f = 3 + (-1) = 2.", "Reversing direction changes sign, so ∫ from 5 to 0 of f = -2."], check: "Do not add 5 to 0 directly; the given pieces first cover 0 to 5." },
      { question: "Find ∫ from -2 to 2 of (x² + x) dx using symmetry.", approach: "Separate even and odd terms before integrating.", steps: ["x² is even, so its integral over [-2, 2] is twice its integral over [0, 2].", "x is odd, so its signed integral over [-2, 2] is zero.", "2∫ from 0 to 2 of x² dx = 2[x³/3] from 0 to 2 = 2(8/3) = 16/3."], check: "The whole function x² + x is not even; linearity lets us handle its two parts separately." },
    ],
    practice: [
      { question: "Given ∫ from 0 to 5 of f = 2, find ∫ from 0 to 5 of (2f + 1) dx.", hint: "Integrate 2f and 1 separately.", solution: ["2∫ from 0 to 5 of f = 2·2 = 4.", "∫ from 0 to 5 of 1 dx = 5, so the result is 9."] },
      { question: "Find ∫ from -3 to 3 of x³ dx without an antiderivative.", hint: "x³ is odd.", solution: ["The contributions at x and -x cancel on a symmetric interval.", "The signed integral is 0."] },
    ], takeaway: "Bounds determine direction; adjacent pieces add; symmetry works only after identifying even and odd parts.",
  },
  "math.m6.l4": {
    opening: ["The first fundamental theorem connects accumulation back to rate. If A(x) is the integral of a continuous function f from a fixed start a up to a moving endpoint x, then A′(x) = f(x). Adding a tiny interval of width h adds roughly f(x)h, so change in accumulation per unit width approaches f(x).", "When the upper endpoint is a function g(x), the chain rule also matters: derivative of ∫ from a to g(x) of f(t)dt is f(g(x))g′(x). A moving lower endpoint contributes a minus sign."],
    examples: [
      { question: "Find A′(x) if A(x) = ∫ from 1 to x of (t² + 1)dt.", approach: "The upper endpoint is x itself, so read the integrand at that endpoint.", steps: ["The integrand f(t) = t² + 1 is continuous for all real t.", "The first fundamental theorem gives A′(x) = f(x) = x² + 1. No antiderivative calculation is needed."], check: "An increase by small h adds about (x² + 1)h to the accumulation." },
      { question: "Differentiate B(x) = ∫ from 0 to x² of cos(t)dt.", approach: "Read the integrand at the moving endpoint, then multiply by the endpoint's derivative.", steps: ["The outer accumulation derivative is cos(x²), because the upper endpoint is x².", "The endpoint x² changes at rate 2x.", "By the chain rule, B′(x) = 2x cos(x²)."], check: "At x = 0 the endpoint barely moves to first order, so B′(0) = 0." },
    ],
    practice: [
      { question: "Differentiate C(x) = ∫ from x to 3 of sin(t)dt.", hint: "Reverse the bounds to make x the upper endpoint.", solution: ["C(x) = -∫ from 3 to x of sin(t)dt.", "Differentiate: C′(x) = -sin x."] },
      { question: "Differentiate H(x) = ∫ from x² to x³ of √(1 + t²)dt.", hint: "Treat the upper contribution and subtract the lower contribution.", solution: ["The upper endpoint gives √(1 + x⁶)·3x².", "The lower endpoint contributes -√(1 + x⁴)·2x, so H′(x) = 3x²√(1 + x⁶) - 2x√(1 + x⁴)."] },
    ], takeaway: "The rate of accumulation is the current integrand at the moving boundary, multiplied by that boundary's rate.",
  },
  "math.m6.l5": {
    opening: ["The second fundamental theorem gives a practical way to calculate a definite integral. If F′(x) = f(x) on [a, b], then ∫ from a to b of f(x)dx = F(b) - F(a). The +C disappears because it would be subtracted at both endpoints.", "This connects the Riemann-sum definition to antiderivatives. Before using it, find an antiderivative valid across the whole interval. If the integrand is not continuous or has a singularity inside, ordinary endpoint subtraction may be invalid."],
    examples: [
      { question: "Evaluate ∫ from 1 to 3 of 2x dx.", approach: "Find an antiderivative, then evaluate at upper and lower bounds in that order.", steps: ["Since derivative of x² is 2x, take F(x) = x².", "F(3) - F(1) = 3² - 1² = 9 - 1 = 8."], check: "The trapezoid under y = 2x from x = 1 to 3 has bases 2 and 6, width 2, and area (2 + 6)·2/2 = 8." },
      { question: "Evaluate ∫ from -1 to 2 of (3x² - 4) dx.", approach: "Integrate each term, then keep parentheses during endpoint subtraction.", steps: ["An antiderivative is F(x) = x³ - 4x.", "F(2) = 8 - 8 = 0, and F(-1) = -1 + 4 = 3.", "Integral = F(2) - F(-1) = 0 - 3 = -3. Signed area can be negative."], check: "The function is below the axis across much of this interval; a negative net result is plausible." },
    ],
    practice: [
      { question: "Find ∫ from 0 to 2 of x² dx.", hint: "Use F(x) = x³/3.", solution: ["F(2) - F(0) = 8/3 - 0 = 8/3."] },
      { question: "Find ∫ from 0 to π of cos x dx.", hint: "An antiderivative of cos x is sin x.", solution: ["sin π - sin 0 = 0 - 0 = 0.", "Positive and negative cosine contributions cancel on this interval."] },
    ], takeaway: "For a continuous integrand, find F with F′ = f and compute upper value minus lower value.",
  },
  "math.m6.l6": {
    opening: ["Substitution reverses the chain rule. When an integrand contains an inside expression and its derivative, naming that inside expression u can turn the integral into a simpler one. For example, 2x cos(x²) dx suggests u = x² and du = 2x dx.", "For an indefinite integral, substitute back to x and include +C. For a definite integral, either change the bounds into u-values or substitute back before evaluating—do not mix x-bounds with a u-antiderivative."],
    examples: [
      { question: "Find ∫ 2x cos(x²) dx.", approach: "Recognize x² as the inside and 2x dx as its differential.", steps: ["Let u = x². Then du = 2x dx.", "The integral becomes ∫ cos u du = sin u + C.", "Substitute back: ∫ 2x cos(x²) dx = sin(x²) + C."], check: "Differentiate sin(x²): cos(x²)·2x, exactly the integrand." },
      { question: "Evaluate ∫ from 0 to 1 of 2x e^(x²) dx.", approach: "Change both the differential and bounds.", steps: ["Let u = x², so du = 2x dx.", "When x = 0, u = 0; when x = 1, u = 1. The integral becomes ∫ from 0 to 1 of eᵘ du.", "Its value is [eᵘ] from 0 to 1 = e - 1."], check: "Do not use bounds 0 and 1 by luck; they happen to be unchanged here. With other bounds, the conversion matters." },
    ],
    practice: [
      { question: "Find ∫ 3x²(x³ + 1)⁴ dx.", hint: "Let u = x³ + 1; its derivative is 3x².", solution: ["du = 3x² dx, so the integral is ∫u⁴ du = u⁵/5 + C.", "Substitute back: (x³ + 1)⁵/5 + C."] },
      { question: "Evaluate ∫ from 0 to 2 of x√(x² + 1) dx.", hint: "Use u = x² + 1; then x dx = du/2. Convert bounds to 1 and 5.", solution: ["The integral is (1/2)∫ from 1 to 5 of u^(1/2) du = (1/2)(2/3)[u^(3/2)] from 1 to 5.", "Result: (5√5 - 1)/3."] },
    ], takeaway: "Choose u as the inside expression, transform the entire integrand, and handle definite bounds consistently.",
  },
  "math.m6.l7": {
    opening: ["An accumulation function begins at a chosen time and totals a changing rate up to t. If v(t) is velocity, ∫v gives signed displacement. Position at time t equals initial position plus that displacement. For total distance, negative velocity must count positively, so integrate |v| or split at direction changes.", "The units help: velocity in meters per second times time in seconds gives meters. An integral of acceleration gives velocity change, not position change directly."],
    examples: [
      { question: "A particle has velocity v(t) = 2t - 4 m/s and starts at s(0) = 10 m. Find s(3).", approach: "Integrate velocity for displacement, then add the initial position.", steps: ["Displacement from 0 to 3 is ∫ from 0 to 3 of (2t - 4)dt.", "An antiderivative is t² - 4t. Evaluate: (9 - 12) - 0 = -3 m.", "Position is initial 10 m plus displacement -3 m, so s(3) = 7 m."], check: "A negative displacement means the final position is less than the initial position." },
      { question: "How far did the particle actually travel over 0 ≤ t ≤ 3?", approach: "Velocity changes sign at t = 2, so split the absolute-value integral there.", steps: ["For t < 2, v = 2t - 4 < 0. Displacement from 0 to 2 is [t² - 4t] from 0 to 2 = -4 m, giving 4 m of distance.", "For 2 < t ≤ 3, velocity is positive. Displacement from 2 to 3 is (-3) - (-4) = 1 m, giving 1 m of distance.", "Total distance is 4 + 1 = 5 m, even though net displacement is -3 m."], check: "The particle goes 4 m backward and 1 m forward, ending 3 m behind where it started." },
    ],
    practice: [
      { question: "If a(t) = 6t m/s² and v(0) = 2 m/s, find v(2).", hint: "Velocity change is ∫ from 0 to 2 of acceleration.", solution: ["Δv = ∫ from 0 to 2 of 6t dt = [3t²] from 0 to 2 = 12 m/s.", "Add the initial velocity: v(2) = 2 + 12 = 14 m/s."] },
      { question: "If velocity is -3 m/s for 4 seconds, give displacement and distance.", hint: "The sign records direction; distance uses magnitude.", solution: ["Displacement = (-3)(4) = -12 m.", "Distance = |−3|(4) = 12 m."] },
    ], takeaway: "Integral of a rate gives a change in quantity. Add the initial value; use absolute velocity for total distance.",
  },
  "math.m6.l8": {
    opening: ["Before calculating an integral, ask what it represents. A definite integral is signed accumulation, not automatically geometric area. Bounds have direction, and units are the integrand's units multiplied by the horizontal variable's units.", "A reliable workflow is: sketch the sign or context, choose an antiderivative or substitution, evaluate bounds, then interpret the sign and units. For area or distance, split where the graph crosses zero so negative parts can be counted positively."],
    examples: [
      { question: "Find signed integral and total geometric area between y = x and the x-axis on [-2, 2].", approach: "The graph crosses at zero; separate the negative and positive triangles.", steps: ["An antiderivative of x is x²/2. The signed integral from -2 to 2 is 2 - 2 = 0.", "On [-2, 0] the graph is below the axis, with geometric area 2. On [0, 2] it is above, also area 2.", "Total geometric area is 2 + 2 = 4, even though signed accumulation is 0."], check: "The opposite halves cancel only in the signed integral." },
      { question: "Water flows into a tank at r(t) = 3t² liters/hour, with t in hours. How much enters from t = 0 to t = 2?", approach: "Integrate the rate over time and attach units.", steps: ["Amount = ∫ from 0 to 2 of 3t² dt.", "An antiderivative is t³, so the amount is 2³ - 0³ = 8 liters.", "The rate is nonnegative on this interval, so signed accumulation equals total water added."], check: "Liters/hour times hours gives liters." },
    ],
    practice: [
      { question: "Find ∫ from -1 to 1 of x³ dx and the geometric area between y = x³ and the axis.", hint: "x³ is odd; then integrate |x³| on the two halves.", solution: ["The signed integral is 0 by odd symmetry.", "Area is 2∫ from 0 to 1 of x³ dx = 2[x⁴/4] from 0 to 1 = 1/2."] },
      { question: "A rate is 5 kilograms/minute for 3 minutes. What does its integral mean?", hint: "Rate × time gives an amount, not another rate.", solution: ["∫ from 0 to 3 of 5 dt = 5·3 = 15 kilograms.", "It is the accumulated mass over those 3 minutes."] },
    ], takeaway: "State what the integral measures, keep bounds and units, and distinguish signed accumulation from total magnitude.",
  },
};

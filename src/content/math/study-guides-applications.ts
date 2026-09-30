import type { MathStudyGuide } from "./study-guides";

export const MATH_APPLICATION_STUDY_GUIDES: Record<string, MathStudyGuide> = {
  "math.m5.l1": {
    opening: ["An average slope compares endpoints: [f(b) - f(a)]/(b - a). The mean value theorem says that if f is continuous on [a, b] and differentiable inside (a, b), at least one instantaneous slope matches that average. Check both conditions before applying it.", "Rolle's theorem is the special case f(a) = f(b): the average slope is zero, so somewhere inside the curve has a horizontal tangent. A jump, hole, or corner can break the theorem's assumptions."],
    examples: [
      { question: "Find the point guaranteed by the mean value theorem for f(x) = x² on [1, 3].", approach: "Check the hypotheses, compute the secant slope, then solve f′(c) equal to it.", steps: ["A polynomial is continuous on [1, 3] and differentiable on (1, 3).", "Secant slope = [f(3) - f(1)]/(3 - 1) = (9 - 1)/2 = 4.", "f′(c) = 2c. Set 2c = 4 to get c = 2, which lies inside (1, 3)."], check: "The tangent at x = 2 and the line joining the endpoints both have slope 4." },
      { question: "Why can Rolle's theorem not be used for f(x) = |x| on [-1, 1]?", approach: "Equal endpoints alone are not enough; check interior differentiability.", steps: ["f(-1) = f(1) = 1, and f is continuous on the interval.", "At x = 0 there is a corner: left slope -1 and right slope +1. The derivative does not exist there.", "The differentiability hypothesis fails. Indeed, at every other interior point the slope is either -1 or +1, never 0."], check: "The theorem did not fail; its assumptions were not met." },
    ],
    practice: [
      { question: "Apply the mean value theorem to f(x) = x³ on [0, 2]. Find c.", hint: "Secant slope is (8 - 0)/2. Solve 3c² equal to that value.", solution: ["A polynomial meets both hypotheses. The secant slope is 4.", "3c² = 4 gives c = ±2/√3. Only c = 2/√3 lies in (0, 2)."] },
      { question: "Why is f(x) = 1/x on [-1, 1] ineligible?", hint: "Check what happens at x = 0.", solution: ["The function is undefined at zero, an interior point.", "It is not continuous on [-1, 1], so the mean value theorem cannot be applied."] },
    ], takeaway: "State continuity and differentiability first; then match an interior derivative to the average slope.",
  },
  "math.m5.l2": {
    opening: ["A positive derivative means the function rises as x increases; a negative derivative means it falls. A critical point is a domain point where f′ is zero or undefined. It is a candidate for a turn, not a guaranteed maximum or minimum.", "Make a sign chart: mark critical points and domain breaks, test one number in each interval, and record the sign of f′. A change + to - gives a local maximum; - to + gives a local minimum. For an absolute optimum on a closed interval, also compare endpoints."],
    examples: [
      { question: "Analyze f(x) = x³ - 3x.", approach: "Factor f′ and test the intervals separated by its zeros.", steps: ["f′(x) = 3x² - 3 = 3(x - 1)(x + 1). Critical inputs are -1 and 1.", "For x < -1, both factors are negative, so f′ > 0. For -1 < x < 1, signs differ, so f′ < 0. For x > 1, f′ > 0.", "The graph rises, falls, then rises. At -1 it has a local maximum f(-1) = 2; at 1 a local minimum f(1) = -2."], check: "At x = 0, f′(0) = -3, so the middle interval really is decreasing." },
      { question: "Does f′(0) = 0 make x = 0 an extremum for f(x) = x³?", approach: "Test derivative signs, not just whether the derivative is zero.", steps: ["f′(x) = 3x² and f′(0) = 0.", "For x < 0 and x > 0, 3x² > 0, so the function rises on both sides.", "There is no turn at 0, so 0 is not a local maximum or minimum."], check: "Values -0.001, 0, and 0.001 are in increasing order." },
    ],
    practice: [
      { question: "For g(x) = x³ - 12x on [-3, 3], find critical points and the absolute maximum and minimum.", hint: "g′ = 3(x - 2)(x + 2). Compare values at -3, -2, 2, and 3.", solution: ["Critical points: x = -2 and 2. Values: g(-3) = 9, g(-2) = 16, g(2) = -16, g(3) = -9.", "Absolute maximum is 16 at -2; absolute minimum is -16 at 2."] },
      { question: "If f′ changes from negative to positive at c, what happens there?", hint: "Describe the motion before and after c.", solution: ["The function falls before c and rises after c.", "Therefore c is a local minimum, provided it is in the function's domain."] },
    ], takeaway: "Critical points are candidates. The signs around them—and endpoints for global questions—settle the result.",
  },
  "math.m5.l3": {
    opening: ["Concavity describes how slopes change. If f″ > 0, the first derivative is increasing and the graph bends upward. If f″ < 0, slopes decrease and the graph bends downward. This has nothing to do with whether f itself is above or below the x-axis.", "An inflection point is a point on the graph where concavity changes. f″(c) = 0 marks a possible location, but a sign change on either side is the deciding evidence."],
    examples: [
      { question: "Find concavity and inflection points for f(x) = x³ - 3x.", approach: "Differentiate twice and test the sign around zeros of f″.", steps: ["f′(x) = 3x² - 3, so f″(x) = 6x.", "For x < 0, f″ < 0 and the graph is concave down. For x > 0, f″ > 0 and it is concave up.", "The sign changes at x = 0, and f(0) = 0. Therefore (0, 0) is an inflection point."], check: "The slope f′ = 3x² - 3 decreases to -3 as x approaches 0 from the left, then increases." },
      { question: "Is x = 0 an inflection point of h(x) = x⁴?", approach: "A zero second derivative is only a candidate; inspect nearby signs.", steps: ["h′ = 4x³ and h″ = 12x².", "h″(0) = 0, but 12x² is positive on both sides of 0.", "Concavity does not change, so (0, 0) is not an inflection point."], check: "The graph bends upward on both sides of its flat minimum." },
    ],
    practice: [
      { question: "Find the inflection points of p(x) = x⁴ - 2x².", hint: "p″ = 12x² - 4. Check its sign around ±1/√3.", solution: ["p″ = 4(3x² - 1), positive outside ±1/√3 and negative between them.", "It changes sign at both inputs. Since x² = 1/3 there, p = 1/9 - 2/3 = -5/9. Inflections: (±1/√3, -5/9)."] },
      { question: "Why does f″(c) = 0 not by itself prove an inflection?", hint: "Consider x⁴.", solution: ["A second derivative can touch zero and retain the same sign.", "For x⁴, f″ = 12x² is positive on both sides of 0, so there is no concavity change."] },
    ], takeaway: "Use the sign of f″ on intervals. An inflection requires an actual change in concavity at a point on the graph.",
  },
  "math.m5.l4": {
    opening: ["Two tests help classify a stationary point. The first-derivative test looks at f′ on either side: + to - means a local maximum, and - to + means a local minimum. The second-derivative test is faster when f′(c) = 0 and f″(c) is not zero: positive f″ gives a local minimum, negative f″ a local maximum.", "If f″(c) = 0, the second-derivative test says nothing. It does not say there is no extremum. Return to the first-derivative signs or compare nearby function values."],
    examples: [
      { question: "Classify x = 0 for f(x) = x⁴.", approach: "The second derivative is inconclusive, so use the first-derivative sign chart.", steps: ["f′(x) = 4x³ and f″(x) = 12x². Both are zero at 0, so the second-derivative test is inconclusive.", "For x < 0, f′ < 0, so f decreases toward 0. For x > 0, f′ > 0, so f increases away from 0.", "The sign changes - to +, giving a local minimum f(0) = 0."], check: "Since x⁴ ≥ 0 for every x, 0 is also the absolute minimum." },
      { question: "Classify x = 0 for g(x) = x³.", approach: "The same derivative values at one point can hide a different nearby pattern.", steps: ["g′ = 3x² and g″ = 6x, so g′(0) = g″(0) = 0. The second-derivative test is again inconclusive.", "For negative and positive x, g′ = 3x² > 0. The function increases on both sides.", "There is no local maximum or minimum at 0, even though it is stationary."], check: "Compare g(-1) = -1, g(0) = 0, g(1) = 1." },
    ],
    practice: [
      { question: "Classify x = 0 for h(x) = -x⁴.", hint: "h′ = -4x³. What are its signs on each side?", solution: ["h′ is positive for x < 0 and negative for x > 0.", "The graph rises then falls, so 0 is a local maximum. h″(0) = 0 merely makes the second-derivative test inconclusive."] },
      { question: "Classify x = 0 for k(x) = x³ + x².", hint: "Compute k′(0) and k″(0).", solution: ["k′ = 3x² + 2x, so k′(0) = 0. k″ = 6x + 2, so k″(0) = 2 > 0.", "The second-derivative test gives a strict local minimum at x = 0."] },
    ], takeaway: "An inconclusive test is not a negative answer. Use neighboring derivative signs when f″ is zero.",
  },
  "math.m5.l5": {
    opening: ["Optimization starts with a question, not a derivative: what quantity are you maximizing or minimizing, and which choices are allowed? Name variables, write the constraint, and use it to express the objective in one variable. Only then differentiate.", "A stationary point is a candidate. If the feasible range has endpoints, compare the objective there too. Reject solutions outside the feasible range and report the actual dimensions or configuration, with units—not just an x-value."],
    examples: [
      { question: "A rectangle uses 20 m of fence. Which dimensions maximize area?", approach: "Turn the perimeter condition into a one-variable area formula.", steps: ["Let sides be x and y meters. The full perimeter is 2x + 2y = 20, so y = 10 - x and 0 ≤ x ≤ 10.", "Area A = xy = x(10 - x) = 10x - x² square meters.", "A′ = 10 - 2x = 0 gives x = 5; then y = 5. Endpoints x = 0 and 10 have area 0, while A(5) = 25.", "The maximum is 25 m² from a 5 m by 5 m square."], check: "Perimeter 2(5) + 2(5) = 20 m; the chosen dimensions are feasible." },
      { question: "A rectangle touches a wall and uses 60 m of fence on its other three sides. Find the largest area.", approach: "The wall removes one side from the fence constraint.", steps: ["Let x be each side perpendicular to the wall and y the fenced parallel side. Then 2x + y = 60, so y = 60 - 2x with 0 ≤ x ≤ 30.", "Area A = x(60 - 2x) = 60x - 2x². Set A′ = 60 - 4x = 0 to get x = 15.", "Then y = 30 and A = 15·30 = 450 m². Endpoint configurations have zero area, so this is the maximum."], check: "Two 15 m sides plus one 30 m side use exactly 60 m of fence." },
    ],
    practice: [
      { question: "A rectangle has perimeter 40 m. Find the dimensions with greatest area.", hint: "2x + 2y = 40, so y = 20 - x.", solution: ["A(x) = x(20 - x), 0 ≤ x ≤ 20. A′ = 20 - 2x = 0 gives x = 10.", "Then y = 10, area = 100 m², and both endpoint areas are 0."] },
      { question: "Why is an algebraic stationary point outside a feasible interval not a solution?", hint: "What does the interval represent in the real setting?", solution: ["It violates a constraint such as a nonnegative length or an available resource.", "Optimization compares only feasible choices, including allowed endpoints."] },
    ], takeaway: "Model the constraints first, reduce to one variable, compare all feasible candidates, and answer in the original units.",
  },
  "math.m5.l6": {
    opening: ["Related rates connect quantities that change together over time. A radius, area, ladder height, and distance may each depend on t even when t is not written explicitly. Write an equation that holds throughout the motion, differentiate it with respect to t, then insert the numbers from the requested moment.", "The order matters. Replacing a changing radius with its snapshot value before differentiating turns it into a constant and erases the rate you want. Attach units to each derivative and use the sign to describe direction."],
    examples: [
      { question: "A circle's radius grows at 2 cm/s. How fast does its area grow when r = 3 cm?", approach: "Connect area and radius before substituting the snapshot.", steps: ["At every moment, A = πr². Differentiate with respect to t: dA/dt = 2πr·dr/dt.", "Now substitute r = 3 cm and dr/dt = 2 cm/s.", "dA/dt = 2π(3)(2) = 12π cm²/s."], check: "cm multiplied by cm/s gives cm²/s, the right units for area change." },
      { question: "A 10 m ladder's foot moves away from a wall at 1 m/s. How fast does its top move when the foot is 6 m out?", approach: "Use the Pythagorean relation with both distances changing in time.", steps: ["Let x be foot distance and y height. The fixed ladder gives x² + y² = 100.", "Differentiate: 2x dx/dt + 2y dy/dt = 0.", "When x = 6, y = √(100 - 36) = 8. Substitute dx/dt = 1: 12 + 16 dy/dt = 0.", "dy/dt = -12/16 = -3/4 m/s. The negative sign means the top moves downward."], check: "The foot moves out while the top comes down, as the picture suggests." },
    ],
    practice: [
      { question: "A sphere's radius grows at 1 cm/s. How fast does its volume grow at r = 2 cm? Use V = (4/3)πr³.", hint: "Differentiate with respect to t before substituting r = 2.", solution: ["dV/dt = 4πr² dr/dt.", "At r = 2 and dr/dt = 1, dV/dt = 4π(4)(1) = 16π cm³/s."] },
      { question: "Why is it wrong to set r = 3 first in A = πr² and then differentiate?", hint: "Is r permanently equal to 3 or only at one instant?", solution: ["r = 3 is a snapshot, not a constant for all t.", "Substituting first yields A = 9π and a false zero rate. Differentiate the variable relation first, then substitute."] },
    ], takeaway: "Write a relation valid at all times, differentiate with respect to time, then substitute the moment's values.",
  },
  "math.m5.l7": {
    opening: ["A curved graph looks almost straight when you zoom in enough at a differentiable point. Its tangent line is a local approximation, called linearization: L(x) = f(a) + f′(a)(x - a). Choose a nearby anchor a whose function value and derivative are easy to calculate.", "For a small input change Δx, the derivative predicts a change of roughly f′(a)Δx. This is an estimate, not an exact equality, and it becomes less reliable as you move farther from a."],
    examples: [
      { question: "Estimate √4.1 using linearization at 4.", approach: "Use the nearby perfect square as the anchor.", steps: ["Let f(x) = √x and a = 4. Then f(4) = 2 and f′(x) = 1/(2√x), so f′(4) = 1/4.", "The input change is Δx = 4.1 - 4 = 0.1.", "L(4.1) = 2 + (1/4)(0.1) = 2.025."], check: "2.025² = 4.100625, just above 4.1, so the estimate is slightly high." },
      { question: "Estimate ∛8.24 using linearization at 8.", approach: "Eight is a nearby perfect cube.", steps: ["Let f(x) = x^(1/3). Then f(8) = 2 and f′(x) = (1/3)x^(-2/3).", "At x = 8, f′(8) = 1/[3(8^(2/3))] = 1/(3·4) = 1/12.", "Δx = 0.24, so L(8.24) = 2 + 0.24/12 = 2.02."], check: "2.02³ is about 8.2424, close to 8.24." },
    ],
    practice: [
      { question: "Estimate √9.3 using a tangent line at 9.", hint: "f(9) = 3 and f′(9) = 1/6.", solution: ["Δx = 0.3 and L(x) = 3 + (1/6)(x - 9).", "L(9.3) = 3 + 0.3/6 = 3.05."] },
      { question: "Explain why using a tangent at 4 to estimate √400 is unreliable.", hint: "How far is 400 from the anchor 4?", solution: ["Linearization is a local approximation, justified for small |x - a|.", "The input change 396 is huge. Curvature accumulates over that distance, so the tangent may be far from the graph."] },
    ], takeaway: "Choose an easy nearby anchor. Tangent lines estimate local changes; they do not reproduce the whole curve.",
  },
  "math.m5.l8": {
    opening: ["To sketch a curve, gather different kinds of evidence: where it is defined, where it crosses axes, what it does far away, where it rises or falls, and where it bends up or down. A first-derivative sign chart controls direction; a second-derivative sign chart controls concavity.", "Mark exact key points and asymptotes before connecting pieces. Never draw through an excluded input. A good sketch is a consistent picture of the facts, not a line through a few sampled points."],
    examples: [
      { question: "Sketch the key features of f(x) = x³ - 3x.", approach: "Record intercepts, derivative signs, concavity, and end behavior in that order.", steps: ["Domain is all real. Factor f = x(x² - 3), so x-intercepts are -√3, 0, and √3.", "f′ = 3(x - 1)(x + 1). It is positive for x < -1 and x > 1, negative between. Thus local maximum is (-1, 2) and minimum is (1, -2).", "f″ = 6x changes from negative to positive at 0, so (0, 0) is an inflection point.", "The cubic goes down to the left and up to the right. Draw a smooth S-shape through the marked points, rising/falling as the signs demand."], check: "The graph must pass through (0, 0) while descending there, because f′(0) = -3." },
      { question: "Why must a sketch of 1/(x - 2) have two separate branches?", approach: "Start with the domain before connecting any curve.", steps: ["The function is undefined at x = 2, so the domain is split into x < 2 and x > 2.", "As x approaches 2 from the left, outputs head to -∞; from the right, to +∞. Draw x = 2 as a vertical asymptote.", "Far from 2, the output approaches 0. Draw two branches approaching the horizontal asymptote y = 0, without connecting across x = 2."], check: "No amount of smooth interpolation may fill an excluded x-value." },
    ],
    practice: [
      { question: "For f(x) = x⁴ - 2x², find stationary points and their types.", hint: "f′ = 4x(x - 1)(x + 1). Test intervals around -1, 0, and 1.", solution: ["f′ changes negative→positive at -1, positive→negative at 0, and negative→positive at 1.", "Thus minima are (-1, -1) and (1, -1), and a local maximum is (0, 0)."] },
      { question: "Where is x⁴ - 2x² concave down?", hint: "Its second derivative is 12x² - 4.", solution: ["12x² - 4 < 0 means x² < 1/3.", "So it is concave down on (-1/√3, 1/√3) and concave up outside."] },
    ], takeaway: "A sketch is the intersection of domain, intercept, limit, first-derivative, and second-derivative evidence.",
  },
  "math.m5.l9": {
    opening: ["A real problem rarely announces which derivative technique it needs. First name the quantities, their units, and constraints. Decide whether the question asks for a total, a rate, a maximum, or an approximation. Then translate it into a function.", "After the calculus, return to the setting. A derivative has different units than its original quantity; an optimum must be feasible; and a model may ignore costs, discrete sizes, or uncertainty. Showing those checks makes an answer useful rather than just algebraically correct."],
    examples: [
      { question: "A product's price is p(q) = 50 - q dollars per unit for 0 ≤ q ≤ 50. What quantity maximizes revenue?", approach: "Revenue is price times quantity; then optimize it on the feasible interval.", steps: ["R(q) = q p(q) = q(50 - q) = 50q - q² dollars.", "R′(q) = 50 - 2q. Setting it to zero gives q = 25.", "R(0) = 0, R(50) = 0, and R(25) = 25·25 = 625. The maximum modeled revenue is $625 at 25 units."], check: "The model does not include production costs, so this is maximum revenue, not necessarily profit." },
      { question: "What does R′(10) mean in the same model?", approach: "Keep the derivative's units and distinguish it from total revenue.", steps: ["R′(10) = 50 - 2(10) = 30 dollars per additional unit.", "Total revenue at 10 units is R(10) = 10(40) = $400.", "The $30 derivative estimates the change in revenue from a small increase near 10 units; it is not the current total."], check: "If q rises from 10 to 11, exact revenue rises from $400 to $429, close to the $30 local estimate." },
    ],
    practice: [
      { question: "A rectangle has 40 m perimeter. Find its maximum area, then estimate area change if width rises from 6 to 6.1 m with perimeter fixed.", hint: "Use A(w) = w(20 - w), then A′(w) = 20 - 2w.", solution: ["A′ = 0 at w = 10, producing a 10 m by 10 m square with area 100 m²; endpoints give zero.", "At w = 6, A′(6) = 8 m²/m. A 0.1 m increase gives an estimated +0.8 m². Exact change A(6.1) - A(6) = 0.79 m²."] },
      { question: "Why should a revenue maximum not automatically be called a profit maximum?", hint: "What extra quantity must be subtracted from revenue?", solution: ["Profit equals revenue minus cost. The model supplied revenue but no production cost function.", "Different costs can move the profit-maximizing quantity, so no profit claim follows from this model alone."] },
    ], takeaway: "Translate the situation first, solve within constraints, then report the quantity the question actually asked for—with units and model limits.",
  },
};

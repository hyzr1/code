import { MATH_RULE_STUDY_GUIDES } from "./study-guides-rules";
import { MATH_APPLICATION_STUDY_GUIDES } from "./study-guides-applications";
import { MATH_INTEGRAL_STUDY_GUIDES } from "./study-guides-integrals";
import { MATH_INTEGRAL_APPLICATION_GUIDES } from "./study-guides-integral-applications";
import { MATH_METHOD_STUDY_GUIDES } from "./study-guides-methods";
import { MATH_CONVERGENCE_STUDY_GUIDES } from "./study-guides-convergence";
import { MATH_SERIES_STUDY_GUIDES } from "./study-guides-series";
import { MATH_ADVANCED_SERIES_GUIDES } from "./study-guides-series-advanced";

export type MathWorkedExample = {
  question: string;
  approach: string;
  steps: string[];
  check: string;
};

export type MathPracticeProblem = {
  question: string;
  hint: string;
  solution: string[];
};

export type MathStudyGuide = {
  opening: string[];
  examples: MathWorkedExample[];
  practice: MathPracticeProblem[];
  takeaway: string;
};

/**
 * These are written lessons, separate from the short narrated overviews.
 * Keep the algebra visible: every transformation should have a reason that a
 * student encountering the idea for the first time can follow.
 */
export const MATH_STUDY_GUIDES: Record<string, MathStudyGuide> = {
  ...MATH_RULE_STUDY_GUIDES,
  ...MATH_APPLICATION_STUDY_GUIDES,
  ...MATH_INTEGRAL_STUDY_GUIDES,
  ...MATH_INTEGRAL_APPLICATION_GUIDES,
  ...MATH_METHOD_STUDY_GUIDES,
  ...MATH_CONVERGENCE_STUDY_GUIDES,
  ...MATH_SERIES_STUDY_GUIDES,
  ...MATH_ADVANCED_SERIES_GUIDES,
  "math.m1.l1": {
    opening: [
      "A function is a rule with one output for each allowed input. If f(x) = x², then f(3) = 9 and f(-3) = 9. Two inputs may share an output; one input cannot have two different outputs.",
      "The domain is the set of inputs you are allowed to put in. The range is the set of outputs you can actually get. To find a domain, start with all real numbers and remove inputs that break the rule. Division by zero is forbidden. For a real square root, the expression inside must be at least zero. For a real logarithm, its input must be greater than zero. Finding the range is a different question: what values can the rule produce after the domain restriction?",
      "Interval notation is shorthand. [2, 5] includes both endpoints, while (2, 5) excludes both. Infinity always uses a parenthesis because it is not a number you can reach. For example, x ≥ 2 is [2, ∞).",
    ],
    examples: [
      {
        question: "Find the domain and range of f(x) = √(9 - x²).",
        approach: "First ask when the square root is real. Then look for the smallest and largest possible output.",
        steps: [
          "Require 9 - x² ≥ 0. The ≥ includes zero because √0 = 0.",
          "Move x² to the other side: x² ≤ 9. These are exactly the numbers whose distance from 0 is at most 3, so -3 ≤ x ≤ 3.",
          "The domain is [-3, 3]. At x = -3 or x = 3, the output is √0 = 0.",
          "The inside, 9 - x², is largest when x² is smallest. Since x² ≥ 0, its minimum is 0 at x = 0. Then f(0) = √9 = 3.",
          "A square root never gives a negative output, and the function moves continuously between these values. The range is [0, 3].",
        ],
        check: "Try x = 4: 9 - 16 = -7, so 4 really is outside the real domain. Try x = 0 and x = 3 to confirm both range endpoints.",
      },
      {
        question: "Find the domain and range of g(x) = 1/(x - 2).",
        approach: "A denominator restriction gives the domain. For the range, ask whether an output y can be made by solving y = g(x).",
        steps: [
          "The denominator is zero when x - 2 = 0, or x = 2. So the domain is (-∞, 2) ∪ (2, ∞).",
          "Could the output be 0? If 1/(x - 2) = 0, multiplying by the nonzero denominator would give 1 = 0. Impossible.",
          "For any other output y ≠ 0, solve y = 1/(x - 2): x - 2 = 1/y, hence x = 2 + 1/y. This is a legal input because 1/y ≠ 0.",
          "Every nonzero output is possible, and zero is not. The range is (-∞, 0) ∪ (0, ∞).",
        ],
        check: "g(3) = 1 and g(1) = -1. Values can be positive or negative, but never zero.",
      },
    ],
    practice: [
      { question: "Find the domain and range of h(x) = √(4 - x²).", hint: "Begin with 4 - x² ≥ 0. Which x make x² ≤ 4?", solution: ["4 - x² ≥ 0 means x² ≤ 4, so -2 ≤ x ≤ 2. Domain: [-2, 2].", "The smallest output is 0 at x = ±2; the largest is √4 = 2 at x = 0. Range: [0, 2]."] },
      { question: "Find the domain of q(x) = 1/√(x - 5). Why is x = 5 excluded?", hint: "A square root allows zero, but this one is in a denominator.", solution: ["For a real square root, x - 5 ≥ 0. For a nonzero denominator, √(x - 5) ≠ 0.", "Together these require x - 5 > 0, so x > 5. The domain is (5, ∞). At x = 5 the denominator is zero."] },
      { question: "If p(x) = x² with domain x ≥ 2, what is its range?", hint: "Use the stated domain, not all real numbers.", solution: ["For x ≥ 2, squaring gives x² ≥ 4. The value 4 occurs at x = 2, and arbitrarily large outputs occur as x grows. Range: [4, ∞)."] },
    ],
    takeaway: "Domain asks which inputs are legal. Range asks which outputs actually occur. Check the endpoints in both answers.",
  },
  "math.m1.l2": {
    opening: [
      "A graph records all pairs (x, f(x)). Rather than plot many points, track a few anchor points such as a vertex, an intercept, and a second point. Then ask where the new formula sends those points.",
      "Changes outside the function move outputs: f(x) + 3 goes up 3; -f(x) reflects across the x-axis. Changes inside the function alter which input reaches a given output: f(x - 3) goes right 3, because the old input 0 now occurs at x = 3. This is why inside shifts appear backward.",
      "An inverse undoes a function: if f(2) = 7, then f⁻¹(7) = 2. To have an inverse that is itself a function, each output must point back to only one input. This is called one-to-one. The graph must pass the horizontal-line test, or we must restrict its domain.",
    ],
    examples: [
      { question: "Describe g(x) = -2(x + 1)² + 4, and find its range.", approach: "Start from y = x² and follow the operations in the formula. Use the vertex to find the largest output.", steps: ["x + 1 equals zero at x = -1, so the vertex shifts from (0, 0) to (-1, 0).", "The factor 2 doubles every vertical distance from the x-axis. The minus sign reflects the graph downward.", "Adding 4 shifts everything up. The vertex is now (-1, 4). Since the graph opens downward, 4 is its maximum.", "The domain is all real numbers and the range is (-∞, 4]."], check: "g(-1) = 4 and g(0) = 2. A point on either side of -1 sits below the vertex." },
      { question: "Find an inverse for f(x) = x² after restricting the domain to x ≥ 0.", approach: "Write y = f(x), swap the jobs of x and y, and solve for the new output. Keep the domain restriction in view.", steps: ["Start with y = x², where x ≥ 0. Without this restriction, 2 and -2 would both map to 4, so the inverse could not choose a unique answer.", "Swap x and y: x = y². Solve for y: y = ±√x, but the original input was nonnegative, so the inverse output must be nonnegative. Choose y = √x.", "Thus f⁻¹(x) = √x. Its domain is x ≥ 0 because those are the outputs of the original function."], check: "f(3) = 9 and f⁻¹(9) = 3. Also f⁻¹(f(3)) = 3." },
    ],
    practice: [
      { question: "For h(x) = (x - 2)² - 5, locate the vertex and give the range.", hint: "The square cannot be negative. Where is it zero?", solution: ["(x - 2)² = 0 when x = 2, making h(2) = -5. Vertex: (2, -5).", "The square is nonnegative, so outputs cannot fall below -5. Range: [-5, ∞)."] },
      { question: "Find the inverse of f(x) = 3x - 7. Check your answer.", hint: "Start with y = 3x - 7 and solve for x.", solution: ["y + 7 = 3x, so x = (y + 7)/3. Swap variable names: f⁻¹(x) = (x + 7)/3.", "Check: f(f⁻¹(x)) = 3((x + 7)/3) - 7 = x."] },
    ],
    takeaway: "Inside changes move or rescale inputs; outside changes move or rescale outputs. An inverse swaps input and output, with domain and range swapping too.",
  },
  "math.m1.l3": {
    opening: [
      "Composition is one rule followed by another. In f(g(x)), do g first and then f. Order matters: squaring after adding 1 differs from adding 1 after squaring.",
      "The difference quotient [f(x + h) - f(x)]/h compares two outputs a distance h apart. For now h is not zero; it represents the width of an interval. Dividing the output change by that width gives the average rate of change. Later we let h approach zero to ask for an instantaneous rate.",
      "Algebra is the hard part here. For f(x) = x², f(x + h) is (x + h)², not x² + h². Expand before subtracting, and keep parentheses around the entire expression f(x).",
    ],
    examples: [
      { question: "Let f(t) = t² and g(x) = 3x + 1. Find f(g(x)) and g(f(x)).", approach: "Substitute the entire inner expression into the outer rule.", steps: ["For f(g(x)), first get g(x) = 3x + 1. The f rule squares its input, so f(g(x)) = (3x + 1)² = 9x² + 6x + 1.", "For g(f(x)), first get f(x) = x². The g rule triples its input and adds 1, so g(f(x)) = 3x² + 1.", "The answers differ. Parentheses preserve what is being squared."], check: "At x = 1, f(g(1)) = f(4) = 16, while g(f(1)) = g(1) = 4." },
      { question: "Simplify the difference quotient for f(x) = 3x² - 1, then let h approach 0.", approach: "Substitute x + h, expand, subtract all of f(x), factor h, then cancel only while h ≠ 0.", steps: ["f(x + h) = 3(x + h)² - 1 = 3(x² + 2xh + h²) - 1 = 3x² + 6xh + 3h² - 1.", "Subtract f(x): (3x² + 6xh + 3h² - 1) - (3x² - 1) = 6xh + 3h².", "Divide by h: (6xh + 3h²)/h = 6x + 3h, provided h ≠ 0.", "As h gets closer to 0, the term 3h gets closer to 0. The limit is 6x."], check: "At x = 2 and h = 0.1, the average rate is 12.3. Shrinking h brings it toward 12." },
    ],
    practice: [
      { question: "For f(x) = x² + 2x, simplify [f(x + h) - f(x)]/h.", hint: "Expand (x + h)² and distribute the minus sign over all of f(x).", solution: ["f(x + h) = (x + h)² + 2(x + h) = x² + 2xh + h² + 2x + 2h.", "Subtract x² + 2x to get 2xh + h² + 2h = h(2x + h + 2).", "For h ≠ 0, divide by h to obtain 2x + h + 2. Its limit as h → 0 is 2x + 2."] },
      { question: "If f(x) = √x and g(x) = x - 4, what is the domain of f(g(x))?", hint: "The output of g must be legal input for the square root.", solution: ["f(g(x)) = √(x - 4). For a real output, x - 4 ≥ 0.", "Thus x ≥ 4 and the domain is [4, ∞)."] },
    ],
    takeaway: "Do the inside function first. In a difference quotient, expand carefully, cancel only for nonzero h, and take the limit afterward.",
  },
  "math.m1.l4": {
    opening: [
      "A radian is a way to measure an angle using the circle itself. If you travel an arc as long as the circle's radius, you have turned through 1 radian. A full circle has circumference 2πr, so it contains 2π radians. Half a circle is π radians, the same angle as 180°.",
      "On a circle of radius 1, the point at angle θ has coordinates (cos θ, sin θ). That makes cosine the horizontal coordinate and sine the vertical coordinate. The sign of each depends on which side of the axes the point lies. Tangent is sin θ / cos θ, so it is undefined when cos θ = 0.",
      "Calculus uses radians because the small-angle relation sin h ≈ h works when h is in radians. In degrees, a conversion factor appears in every trig derivative. Keep your calculator in radian mode unless a problem explicitly asks for degrees.",
    ],
    examples: [
      { question: "Convert 150° to radians, then find its sine and cosine.", approach: "Convert first, then use a reference angle and quadrant signs.", steps: ["Since 180° = π radians, multiply by π/180: 150° × π/180 = 5π/6.", "5π/6 lies between π/2 (90°) and π (180°), so the point is in quadrant II: x is negative and y is positive.", "Its reference angle is π - 5π/6 = π/6. At π/6, the unit-circle coordinates have magnitudes √3/2 horizontally and 1/2 vertically.", "Therefore cos(5π/6) = -√3/2 and sin(5π/6) = 1/2."], check: "sin² + cos² = 1/4 + 3/4 = 1, as required on the unit circle." },
      { question: "Solve cos θ = 0 on the interval 0 ≤ θ < 2π.", approach: "Cosine is the horizontal coordinate. Find where a unit-circle point has x = 0.", steps: ["The top of the circle is (0, 1), at θ = π/2.", "The bottom is (0, -1), at θ = 3π/2.", "There are no other points on the unit circle with horizontal coordinate zero. Solutions: π/2 and 3π/2."], check: "Tangent is undefined at both angles because its denominator, cosine, is zero." },
    ],
    practice: [
      { question: "Convert 225° to radians and find sine and cosine.", hint: "225° is 45° past 180°. Both coordinates are negative there.", solution: ["225 × π/180 = 5π/4. The reference angle is π/4, with coordinate magnitudes √2/2.", "Quadrant III makes both coordinates negative: cos(5π/4) = -√2/2 and sin(5π/4) = -√2/2."] },
      { question: "At which angles in 0 ≤ θ < 2π is sin θ = 0?", hint: "Sine is the vertical coordinate.", solution: ["The unit circle reaches vertical coordinate zero at (1, 0) and (-1, 0).", "The angles are θ = 0 and θ = π. The endpoint 2π is excluded by the interval."] },
    ],
    takeaway: "Draw the unit circle: cosine is x, sine is y, and quadrant position supplies the signs.",
  },
  "math.m1.l5": {
    opening: [
      "Linear growth adds the same amount each step: 10, 13, 16, 19. Exponential growth multiplies by the same factor: 10, 20, 40, 80. A rule like 2ˣ says how many copies of the factor 2 are multiplied together; 2³ = 8.",
      "A logarithm asks the reverse question. log₂(8) = 3 means 2³ = 8. The natural logarithm ln is log base e, where e is about 2.718. Because no positive base raised to a real power becomes zero or negative, ln(x) requires x > 0.",
      "The useful identities are ln(eˣ) = x and e^(ln x) = x for x > 0. Also ln(ab) = ln a + ln b for positive a and b. There is no rule that splits ln(a + b).",
    ],
    examples: [
      { question: "Solve 3e^(2x) = 12.", approach: "Isolate the exponential, then use ln to undo it.", steps: ["Divide both sides by 3: e^(2x) = 4.", "Take ln of both positive sides: ln(e^(2x)) = ln 4.", "Because ln and e undo one another, 2x = ln 4. Divide by 2: x = (ln 4)/2 = ln 2."], check: "Put x = ln 2 back: 3e^(2 ln 2) = 3e^(ln 4) = 3 × 4 = 12." },
      { question: "Find the domain of q(x) = ln(5 - 2x).", approach: "A logarithm accepts strictly positive inputs. Set its entire argument greater than zero.", steps: ["Require 5 - 2x > 0.", "Subtract 5: -2x > -5. Divide by -2 and reverse the inequality: x < 5/2.", "The domain is (-∞, 5/2). At 5/2 the argument is zero, so the endpoint is excluded."], check: "x = 2 works because ln(1) = 0. x = 3 fails because it would require ln(-1)." },
    ],
    practice: [
      { question: "Solve 5e^(3t) = 20.", hint: "Divide by 5 before taking ln.", solution: ["e^(3t) = 4, so ln(e^(3t)) = ln 4.", "3t = ln 4, hence t = (ln 4)/3. Substitution gives 5 × 4 = 20."] },
      { question: "Why is ln(2 + 3) not ln 2 + ln 3?", hint: "Compare the exact values after exponentiating each side.", solution: ["ln(2 + 3) = ln 5. The sum ln 2 + ln 3 equals ln(2 × 3) = ln 6.", "Since 5 ≠ 6, the expressions differ. The log law combines products, not sums."] },
    ],
    takeaway: "An exponential multiplies repeatedly; a logarithm asks which exponent produced a positive value.",
  },
  "math.m1.l6": {
    opening: [
      "Before taking limits, practice transformations that keep an expression equal for every input where the original was defined. Write down forbidden inputs first. If a denominator is zero at x = 3, cancelling a factor does not suddenly make the original fraction defined at 3.",
      "The two most useful moves here are factoring and conjugates. Difference of squares: a² - b² = (a - b)(a + b). A conjugate changes the sign between two terms: the conjugate of √(x + 4) - 2 is √(x + 4) + 2. Their product removes the square root from that numerator.",
    ],
    examples: [
      { question: "Simplify (x² - 9)/(x - 3), including its domain.", approach: "State the restriction, factor the numerator, then cancel a common factor.", steps: ["The original denominator x - 3 is zero at x = 3, so the domain excludes 3.", "Recognize x² - 9 as x² - 3² = (x - 3)(x + 3).", "For x ≠ 3, (x - 3)(x + 3)/(x - 3) = x + 3.", "The answer is x + 3 for x ≠ 3. The simplified rule would give 6 at x = 3, but the original fraction has a hole there."], check: "At x = 4, the original is (16 - 9)/(4 - 3) = 7; the simplified expression is 4 + 3 = 7." },
      { question: "Simplify [√(x + 4) - 2]/x, and find what it approaches as x → 0.", approach: "Direct substitution gives 0/0, so multiply by the conjugate before substituting.", steps: ["For x ≠ 0, multiply top and bottom by [√(x + 4) + 2]/[√(x + 4) + 2]. This fraction equals 1.", "The numerator becomes (√(x + 4))² - 2² = (x + 4) - 4 = x.", "Cancel x while x ≠ 0: the expression is 1/[√(x + 4) + 2].", "Now values near x = 0 approach 1/[√4 + 2] = 1/4. The original expression remains undefined at x = 0."], check: "At x = 5, the original is (3 - 2)/5 = 1/5; the new form is 1/(3 + 2) = 1/5." },
    ],
    practice: [
      { question: "Simplify (x² - 16)/(x - 4) and state the excluded input.", hint: "Use x² - 4² = (x - 4)(x + 4).", solution: ["The denominator excludes x = 4. Factor the numerator as (x - 4)(x + 4).", "Cancel the common factor only when x ≠ 4. The result is x + 4 for x ≠ 4; the hole would be at (4, 8)."] },
      { question: "Simplify [√(x + 9) - 3]/x for x ≠ 0. What limit does the new expression suggest at 0?", hint: "Multiply by √(x + 9) + 3 above and below.", solution: ["The new numerator is (x + 9) - 9 = x. Cancel x for nonzero x.", "The expression becomes 1/[√(x + 9) + 3], so its limit at 0 is 1/(3 + 3) = 1/6."] },
    ],
    takeaway: "Factor or rationalize before cancelling. A cancelled factor still leaves the original input restriction in place.",
  },
  "math.m2.l1": {
    opening: [
      "A limit describes where outputs head as inputs move toward a target. It does not ask for the output at the target. Imagine walking toward a doorway from both sides: what you approach is separate from whether a floorboard exists exactly at the doorway.",
      "A table gives clues. Pick inputs on both sides and move closer: 1.9, 1.99, 2.01, 2.001. A graph shows a hole or jump quickly. Neither is a complete proof by itself: a finite set of samples can miss strange behavior between sample points. We use algebra to justify a value once we have a good guess.",
    ],
    examples: [
      { question: "Find lim as x → 2 of (x² - 4)/(x - 2). Is the function defined at 2?", approach: "Check the target, inspect nearby values, then factor to justify the limit.", steps: ["At x = 2 the original gives 0/0, which is undefined. Do not call the limit 0 or say it fails yet.", "Near 2, x = 1.9 gives 3.9 and x = 2.1 gives 4.1. Approaching from both sides suggests 4.", "Factor x² - 4 = (x - 2)(x + 2). For every x ≠ 2, the fraction equals x + 2.", "As x approaches 2 through values other than 2, x + 2 approaches 4. Therefore the limit is 4, even though the original function has no value at 2."], check: "At x = 1.99 the value is 3.99; at x = 2.01 it is 4.01. Both sides move toward 4." },
      { question: "A function equals x + 1 whenever x ≠ 3, but equals 100 at x = 3. Find its limit at 3.", approach: "For the limit, ignore the single point and inspect nearby behavior.", steps: ["Inputs near 3 but not equal to 3 use the rule x + 1.", "As x approaches 3, x + 1 approaches 4. Thus the limit is 4.", "The function value is f(3) = 100. It can differ from the limit because the limit concerns nearby inputs."], check: "At x = 2.99, f(x) = 3.99; at x = 3.01, f(x) = 4.01, despite f(3) = 100." },
    ],
    practice: [
      { question: "Find lim as x → 3 of (x² - 9)/(x - 3). Is the original expression defined at 3?", hint: "Factor x² - 9 before cancelling.", solution: ["x² - 9 = (x - 3)(x + 3). For x ≠ 3 the fraction equals x + 3.", "Values approaching 3 therefore approach 3 + 3 = 6. The original expression is undefined at x = 3 because its denominator is zero."] },
      { question: "If f(x) = 2x for x ≠ 1 but f(1) = -7, what are lim as x → 1 of f(x) and f(1)?", hint: "Separate nearby values from the value at the point.", solution: ["Nearby inputs use f(x) = 2x, so the limit is 2.", "By definition f(1) = -7. A limit and a point value are different questions."] },
    ],
    takeaway: "A limit follows nearby values from both sides. A hole or a different value at the point need not change the limit.",
  },
  "math.m2.l2": {
    opening: [
      "Sometimes a rule behaves differently depending on which side you approach from. A left-hand limit uses only inputs smaller than the target. A right-hand limit uses only inputs larger than it. A two-sided limit exists only if those two approaches agree.",
      "Picture walking toward a step in a sidewalk. From the left, the height might approach 0; from the right, it might approach 1. There is no single height that both approaches reach, so the two-sided limit does not exist. The value assigned exactly at the step does not repair that disagreement.",
    ],
    examples: [
      { question: "Let f(x) = x + 2 for x < 1, and f(x) = 4 - x for x ≥ 1. Find both one-sided limits at 1.", approach: "Use the formula whose condition matches the side of approach; do not choose the formula by f(1) alone.", steps: ["To approach from the left, x stays below 1, so use x + 2. As x → 1 from the left, x + 2 → 3.", "To approach from the right, x stays above 1, so use 4 - x. As x → 1 from the right, 4 - x → 3.", "Both approaches give 3. Thus the two-sided limit exists and equals 3. The actual value f(1) uses the second rule and is also 3."], check: "At 0.99 the left rule gives 2.99; at 1.01 the right rule gives 2.99. Both near 3." },
      { question: "Let g(x) = 0 for x < 2, and g(x) = 1 for x ≥ 2. Find lim as x → 2 of g(x).", approach: "Evaluate each side before trying to state a single limit.", steps: ["From the left, every nearby output is 0, so the left-hand limit is 0.", "From the right, every nearby output is 1, so the right-hand limit is 1.", "Since 0 ≠ 1, there is no two-sided limit at 2. The point value g(2) = 1 does not change that."], check: "An input of 1.999 produces 0; an input of 2.001 produces 1." },
    ],
    practice: [
      { question: "For h(x) = 2x if x < 3 and h(x) = x + 3 if x ≥ 3, find both one-sided limits and the two-sided limit at 3.", hint: "Use the first rule just left of 3 and the second just right of 3.", solution: ["From the left, 2x approaches 2(3) = 6. From the right, x + 3 approaches 3 + 3 = 6.", "The one-sided limits agree, so the two-sided limit is 6. Also h(3) = 6."] },
      { question: "For p(x) = -x if x < 0 and p(x) = x + 2 if x ≥ 0, does a two-sided limit exist at 0?", hint: "Do not average the left and right answers.", solution: ["From the left, -x approaches 0. From the right, x + 2 approaches 2.", "Since 0 and 2 disagree, the two-sided limit does not exist. The value p(0) = 2 is separate."] },
    ],
    takeaway: "Write the left-hand and right-hand limits separately. Equal results give a two-sided limit; unequal results do not.",
  },
  "math.m2.l3": {
    opening: [
      "Limit laws let you combine limits when the pieces behave well. If f(x) approaches A and g(x) approaches B, then f(x) + g(x) approaches A + B and f(x)g(x) approaches AB. A quotient approaches A/B only if B is not zero.",
      "For a polynomial, you can usually substitute the target directly, because sums and products of x are continuous. For a fraction, substitute first as a diagnostic. A nonzero denominator gives the answer. A zero denominator needs more thought: 0/0 is an indeterminate form, not a number and not proof that the limit fails.",
    ],
    examples: [
      { question: "Find lim as x → 2 of (x² + 3x - 1)/(x + 4).", approach: "Substitute into the denominator first. If it is not zero, evaluate each continuous piece.", steps: ["At x = 2, the denominator is 2 + 4 = 6, which is nonzero. The quotient law applies.", "The numerator approaches 2² + 3(2) - 1 = 4 + 6 - 1 = 9.", "The quotient approaches 9/6 = 3/2."], check: "At x = 2, the fraction itself is defined and equals 3/2, as expected for a continuous quotient." },
      { question: "Why can we not use the quotient law directly on (x² - 1)/(x - 1) as x → 1? Find the limit anyway.", approach: "Diagnose the zero denominator, then change the expression for nearby non-target inputs.", steps: ["Direct substitution gives numerator 0 and denominator 0. The quotient law requires a nonzero denominator limit, so it does not apply.", "Factor x² - 1 = (x - 1)(x + 1). For every x ≠ 1, the fraction equals x + 1.", "As x → 1 through x ≠ 1, x + 1 approaches 2. The limit is 2."], check: "The original expression is undefined at x = 1; the limit is about inputs close to 1." },
    ],
    practice: [
      { question: "Evaluate lim as x → -1 of (2x² + 5)/(x - 3).", hint: "The denominator tends to -4, so substitution is allowed.", solution: ["The numerator approaches 2(-1)² + 5 = 7, and denominator approaches -1 - 3 = -4.", "The quotient limit is 7/(-4) = -7/4."] },
      { question: "Explain why (x² - 4)/(x - 2) at x → 2 needs a different method, then find its limit.", hint: "What happens to the denominator? Factor the numerator.", solution: ["The denominator approaches zero, so direct use of the quotient law is invalid. Substitution produces 0/0.", "Factor (x - 2)(x + 2), cancel for x ≠ 2, and take the limit of x + 2. The result is 4."] },
    ],
    takeaway: "Substitute when continuity and a nonzero denominator justify it. Treat 0/0 as a signal to do more algebra, not as an answer.",
  },
  "math.m2.l4": {
    opening: [
      "A 0/0 result often means two parts of a fraction vanish together. The expression may still settle toward a finite value. Factoring can reveal a common factor; for square roots, multiplying by a conjugate can reveal it. Both moves describe values near the missing point without assigning the original fraction a value at the point.",
      "A removable hole is a point where the limit exists but the original rule is missing or has the wrong value. If we define the function at that point to equal the limit, the graph becomes continuous there. We are changing the function, not proving the old expression was already defined.",
    ],
    examples: [
      { question: "Find lim as x → 3 of (x² - 9)/(x - 3) and locate its hole.", approach: "Recognize a difference of squares and keep x ≠ 3 during cancellation.", steps: ["At x = 3, the original is 0/0. Its denominator forbids x = 3.", "Factor x² - 9 = (x - 3)(x + 3).", "For x ≠ 3, cancel the common factor to get x + 3.", "The limit is 3 + 3 = 6. The graph agrees with y = x + 3 except for a hole at (3, 6)."], check: "At x = 2.99 the output is 5.99 and at 3.01 it is 6.01." },
      { question: "Find lim as x → 0 of [√(x + 9) - 3]/x.", approach: "The numerator contains a square-root difference, so use its conjugate.", steps: ["Direct substitution gives (3 - 3)/0 = 0/0; more work is needed.", "Multiply by [√(x + 9) + 3]/[√(x + 9) + 3]. The numerator becomes (x + 9) - 9 = x.", "For x ≠ 0, cancel x to get 1/[√(x + 9) + 3].", "Now substitute x = 0 into the new expression: 1/(3 + 3) = 1/6. This is the limit, not the original value at 0."], check: "At x = 7, the original is (4 - 3)/7 = 1/7; the conjugate form is 1/(4 + 3) = 1/7." },
    ],
    practice: [
      { question: "Find lim as x → 5 of (x² - 25)/(x - 5).", hint: "Difference of squares: x² - 25 = (x - 5)(x + 5).", solution: ["For x ≠ 5, cancel x - 5 and obtain x + 5.", "As x → 5, x + 5 → 10. The original has a removable hole at (5, 10)."] },
      { question: "Find lim as x → 0 of [√(x + 1) - 1]/x.", hint: "Multiply by √(x + 1) + 1 above and below.", solution: ["The new numerator is (x + 1) - 1 = x. Cancel x for x ≠ 0.", "The remaining form is 1/[√(x + 1) + 1], which approaches 1/(1 + 1) = 1/2."] },
    ],
    takeaway: "A common factor can disappear for nearby inputs while the original point stays missing. That is why a hole can have a limit.",
  },
  "math.m2.l5": {
    opening: [
      "When a denominator approaches zero but the numerator stays away from zero, the outputs can grow without bound. Write +∞ or -∞ to describe this direction of growth, not a finite value that the function reaches.",
      "The sign matters. For 1/(x - 2), inputs just left of 2 make x - 2 a tiny negative number, giving a large negative output. Inputs just right make it tiny and positive, giving a large positive output. Analyze each side before saying anything about a two-sided limit.",
    ],
    examples: [
      { question: "Analyze (x + 1)/(x - 2) near x = 2.", approach: "Determine the sign of each part close to 2; the numerator is nearly 3.", steps: ["The numerator x + 1 approaches 3, so it stays positive near 2.", "From the left, x - 2 is negative and tends to zero. Positive divided by a tiny negative number heads to -∞.", "From the right, x - 2 is positive and tends to zero. The quotient heads to +∞.", "There is no finite two-sided limit. The line x = 2 is a vertical asymptote because the function grows without bound near it."], check: "At x = 1.9, f(x) = 2.9/(-0.1) = -29; at 2.1 it is 3.1/0.1 = 31." },
      { question: "What happens to 4/(x + 3)² near x = -3?", approach: "Squaring changes the sign analysis: the denominator is positive on both sides.", steps: ["At x = -3 the denominator is zero, so the function is undefined there.", "For x just left or right of -3, (x + 3)² is a tiny positive number. The numerator is the positive constant 4.", "Both one-sided outputs grow toward +∞. There is no finite limit, but x = -3 is a vertical asymptote."], check: "At -3.1 and -2.9, the denominator is 0.01, so both outputs are 400." },
    ],
    practice: [
      { question: "Find the one-sided behavior of -2/(x - 1) near x = 1.", hint: "The numerator is negative. Check whether x - 1 is positive or negative on each side.", solution: ["From the left, x - 1 is negative; negative divided by a tiny negative tends to +∞.", "From the right, x - 1 is positive; negative divided by a tiny positive tends to -∞. The two-sided finite limit does not exist."] },
      { question: "Does 1/(x - 4)² have the same sign of blow-up on each side of 4?", hint: "A nonzero square is positive.", solution: ["Yes. (x - 4)² is positive and approaches 0 from either side, so both one-sided behaviors are +∞.", "This is unbounded behavior, not a finite two-sided limit."] },
    ],
    takeaway: "Near a zero denominator, inspect numerator and denominator signs from both sides. Infinity describes unbounded behavior, not a real answer.",
  },
  "math.m2.l6": {
    opening: [
      "A limit at infinity asks what happens as x gets very large in magnitude. Infinity is not an input you substitute. For rational functions, compare the highest powers because smaller powers matter less and less far away.",
      "Dividing numerator and denominator by the same nonzero power shows why this works. As x grows, 1/x, 1/x², and similar terms approach zero. A horizontal asymptote y = L describes an output approached far away; the graph may cross that line at an ordinary input.",
    ],
    examples: [
      { question: "Find the limits of (3x² - x + 1)/(2x² + 5) as x → ±∞.", approach: "Both top and bottom have degree 2, so divide by x².", steps: ["For x ≠ 0, divide every term by x²: (3 - 1/x + 1/x²)/(2 + 5/x²).", "As x → +∞, both 1/x and 1/x² approach 0. The quotient approaches 3/2.", "As x → -∞, 1/x also approaches 0 (from below) and 1/x² approaches 0. The quotient again approaches 3/2.", "The horizontal asymptote is y = 3/2 in both directions."], check: "The ratio of leading coefficients, 3/2, matches the algebraic result because the degrees are equal." },
      { question: "Find the far-right limit of (5x + 1)/(x² + 4).", approach: "The denominator has a higher power. Divide through by x².", steps: ["Rewrite as (5/x + 1/x²)/(1 + 4/x²).", "As x → +∞, the numerator approaches 0 and the denominator approaches 1.", "The limit is 0, so y = 0 is a horizontal asymptote to the right."], check: "At x = 100, the fraction is 501/10004, about 0.05; at 1000 it is about 0.005." },
    ],
    practice: [
      { question: "Find lim as x → ±∞ of (7x² + 1)/(2x² - 3).", hint: "Divide everything by x², then let the reciprocal terms vanish.", solution: ["The expression becomes (7 + 1/x²)/(2 - 3/x²).", "In either direction, 1/x² → 0, so both limits are 7/2."] },
      { question: "Find the limit of (2x³ + x)/(x² + 1) as x → +∞. Is there a horizontal asymptote?", hint: "The numerator has one higher degree; divide by x².", solution: ["The expression is (2x + 1/x)/(1 + 1/x²). The denominator tends to 1 while 2x grows without bound.", "The output tends to +∞, so there is no finite horizontal asymptote to the right."] },
    ],
    takeaway: "Divide by a leading power to expose vanishing terms. A horizontal asymptote is long-run behavior, not a wall the graph cannot cross.",
  },
  "math.m2.l7": {
    opening: [
      "The squeeze theorem helps when a function is hard to evaluate directly but is trapped between two simpler functions. If the lower and upper bounds both approach the same number, the middle has nowhere else to go.",
      "For example, sin(1/x) oscillates endlessly as x approaches zero, but it always stays between -1 and 1. Multiplying by x² traps x²sin(1/x) between -x² and x². Both bounds approach zero, so the product does too.",
      "A second key limit is sin u/u → 1 as u → 0, with u in radians. To use it for sin(3x)/x, first make the denominator match the angle 3x.",
    ],
    examples: [
      { question: "Prove lim as x → 0 of x²sin(1/x) = 0.", approach: "Bound the oscillating part by its largest possible magnitude.", steps: ["For any real angle, -1 ≤ sin(1/x) ≤ 1 whenever x ≠ 0.", "Since x² ≥ 0, multiplying preserves the inequalities: -x² ≤ x²sin(1/x) ≤ x².", "Both outer expressions approach 0 as x → 0. The middle expression must also approach 0 by the squeeze theorem."], check: "The sine term never settles, but the factor x² shrinks its entire possible range toward zero." },
      { question: "Find lim as x → 0 of sin(3x)/x.", approach: "Build the standard sin u/u pattern with u = 3x.", steps: ["For x ≠ 0, sin(3x)/x = 3 · sin(3x)/(3x). We multiplied and divided by 3 without changing the value.", "Let u = 3x. When x → 0, u → 0, and sin u/u → 1 in radians.", "Therefore the limit is 3 · 1 = 3."], check: "sin(0.03)/0.01 is about 3, consistent with x = 0.01." },
    ],
    practice: [
      { question: "Prove lim as x → 0 of x sin(1/x) = 0.", hint: "Use |sin(1/x)| ≤ 1 and multiply by |x|.", solution: ["|x sin(1/x)| ≤ |x|, which means -|x| ≤ x sin(1/x) ≤ |x|.", "Both bounds approach 0; the squeeze theorem gives a limit of 0."] },
      { question: "Find lim as x → 0 of sin(5x)/(2x).", hint: "Rewrite it as (5/2) times sin(5x)/(5x).", solution: ["sin(5x)/(2x) = (5/2)[sin(5x)/(5x)] for x ≠ 0.", "The bracket approaches 1 in radians, so the limit is 5/2."] },
    ],
    takeaway: "Squeeze an oscillating expression with bounds that share a limit. In trig limits, match the angle in sine with the denominator.",
  },
  "math.m2.l8": {
    opening: [
      "A function is continuous at a if three things hold: f(a) exists, the limit as x approaches a exists, and that limit equals f(a). A removable hole fails the first condition; a jump fails the second. Drawing without lifting your pen is a useful picture, but the three conditions are the precise test.",
      "Continuity also lets us prove that an equation has a solution even when we cannot solve it by algebra. The intermediate value theorem says that if f is continuous on [a, b], it takes every output between f(a) and f(b). Opposite signs at the endpoints therefore guarantee at least one zero in between. It does not guarantee exactly one.",
    ],
    examples: [
      { question: "What value should f(2) have to make f(x) = (x² - 4)/(x - 2) continuous at 2?", approach: "Find the nearby limit and assign the missing point that value.", steps: ["For x ≠ 2, factor the numerator: (x² - 4)/(x - 2) = (x - 2)(x + 2)/(x - 2) = x + 2.", "As x approaches 2, x + 2 approaches 4. The nearby limit exists and equals 4.", "The original fraction has no value at 2. Defining f(2) = 4 makes its value equal the limit, satisfying all three continuity conditions."], check: "If f(2) were 7 instead, the limit would still be 4, so the function would remain discontinuous." },
      { question: "Show that x³ + x - 1 = 0 has a root between 0 and 1.", approach: "Use continuity and compare the endpoint signs.", steps: ["Let g(x) = x³ + x - 1. Polynomials are continuous, so g is continuous on [0, 1].", "g(0) = -1 and g(1) = 1. Zero lies between -1 and 1.", "By the intermediate value theorem, there is some c in (0, 1) such that g(c) = 0."], check: "This proves existence. It does not yet give the exact c or prove there is only one root." },
    ],
    practice: [
      { question: "Can a function with a jump from -1 to 1 be used with the intermediate value theorem to guarantee a zero?", hint: "Check the continuity hypothesis, not just the endpoint signs.", solution: ["No. A jump function can take only -1 on one side and 1 on the other, never 0.", "The theorem requires continuity throughout the closed interval."] },
      { question: "Show that x² - 3 = 0 has a solution between 1 and 2.", hint: "Evaluate x² - 3 at both endpoints.", solution: ["The polynomial is continuous on [1, 2]. At 1 its value is -2; at 2 its value is 1.", "Since 0 lies between -2 and 1, the intermediate value theorem guarantees a root in (1, 2)."] },
    ],
    takeaway: "Continuity requires a point value matching the nearby limit. On an interval, continuity prevents a function from skipping intermediate outputs.",
  },
  "math.m2.l9": {
    opening: [
      "A table can suggest a limit, but a proof needs to cover every input sufficiently close to the target, not just the few we sampled. The epsilon-delta definition makes that promise precise.",
      "Suppose we claim f(x) approaches L as x approaches a. Someone picks any desired output error ε > 0. We must produce an input distance δ > 0 so that every x with 0 < |x - a| < δ satisfies |f(x) - L| < ε. The 0 < part deliberately leaves out x = a; limits concern nearby values.",
      "Think of ε as the customer's required accuracy and δ as the input tolerance you can guarantee. δ is allowed to depend on ε. A strong proof gives an explicit rule for choosing δ for every positive ε.",
    ],
    examples: [
      { question: "Prove lim as x → 2 of (3x + 1) = 7.", approach: "Rewrite the output error in terms of the input error, then choose δ backward from the required ε.", steps: ["Start with |f(x) - 7| = |(3x + 1) - 7| = |3x - 6| = 3|x - 2|.", "To make this smaller than ε, it is enough to make |x - 2| smaller than ε/3. Choose δ = ε/3.", "Now take any x with 0 < |x - 2| < δ. Then |f(x) - 7| = 3|x - 2| < 3δ = ε.", "This works for every ε > 0, so the limit is 7."], check: "If ε = 0.03, δ = 0.01. Any input within 0.01 of 2 gives an output within 0.03 of 7." },
      { question: "Prove lim as x → 4 of (2x - 5) = 3.", approach: "Repeat the same error calculation with a different slope.", steps: ["|(2x - 5) - 3| = |2x - 8| = 2|x - 4|.", "Choose δ = ε/2. Then 0 < |x - 4| < δ implies |f(x) - 3| < 2δ = ε.", "Because the implication holds for any ε > 0, the claimed limit follows."], check: "The larger the required precision, the smaller δ becomes; the proof does not rely on one chosen decimal." },
    ],
    practice: [
      { question: "Prove with an explicit δ that lim as x → 1 of 5x = 5.", hint: "The output error is 5|x - 1|.", solution: ["Given ε > 0, choose δ = ε/5.", "If 0 < |x - 1| < δ, then |5x - 5| = 5|x - 1| < 5δ = ε. Therefore the limit is 5."] },
      { question: "Why is checking ε = 0.01 and ε = 0.001 not a full proof?", hint: "How many positive values of ε exist?", solution: ["A limit must respond to every ε > 0, including arbitrarily tiny choices not in a finite list.", "A formula such as δ = ε/5 covers all positive tolerances at once."] },
    ],
    takeaway: "Work backward from the output error to choose δ, then verify the implication for an arbitrary ε > 0.",
  },
  "math.m2.l10": {
    opening: [
      "Mixed problems are easier when you diagnose them before reaching for a technique. First ask whether the rule is defined and continuous at the target. If direct substitution gives an ordinary number, you are done. If it gives 0/0, simplify; if it gives nonzero/0, check signs on both sides.",
      "For a piecewise rule, use its left and right formulas separately. For an oscillating expression trapped by a shrinking factor, seek a bound and use the squeeze theorem. Then state clearly whether the outcome is a finite limit, one-sided unbounded behavior, or no two-sided limit.",
    ],
    examples: [
      { question: "Choose c so f(x) = (x² - 1)/(x - 1) for x ≠ 1 and f(1) = c is continuous.", approach: "The original has a hole; calculate its nearby limit and fill the hole with that value.", steps: ["Factor x² - 1 = (x - 1)(x + 1). For x ≠ 1, the quotient equals x + 1.", "As x approaches 1, x + 1 approaches 2. Thus the limit is 2.", "Continuity requires f(1) = 2, so choose c = 2. Any other value leaves a discontinuity."], check: "After defining c = 2, the function agrees with y = x + 1 at every input, including 1." },
      { question: "Classify three limits at x → 0: sin(2x)/x, [√(1 + x) - 1]/x, and 1/x.", approach: "Each expression has a different obstacle. Choose a method that matches its structure.", steps: ["For sin(2x)/x, match the inner angle: 2[sin(2x)/(2x)] → 2 in radians.", "For [√(1 + x) - 1]/x, multiply by the conjugate to get 1/[√(1 + x) + 1] for x ≠ 0. It approaches 1/2.", "For 1/x, values from the left head toward -∞ and from the right toward +∞. The two-sided limit does not exist."], check: "The first two have removable holes; the last has a vertical asymptote. All three direct substitutions initially have a zero denominator, but their behaviors differ." },
    ],
    practice: [
      { question: "Classify lim as x → 2 of (x² - 4)/(x - 2) and lim as x → 2 of 1/(x - 2).", hint: "One numerator also vanishes; the other does not.", solution: ["The first is 0/0. Factor and cancel for x ≠ 2 to get x + 2, whose limit is 4; this is a removable hole.", "The second has a nonzero numerator and a sign-changing denominator. Left-hand behavior is -∞, right-hand behavior is +∞, so no finite two-sided limit exists."] },
      { question: "Can changing only f(0) make f(x) = 1/x for x ≠ 0 continuous at 0?", hint: "Would the left and right limits agree after changing a single point?", solution: ["No. Near zero, 1/x heads to -∞ from the left and +∞ from the right.", "Assigning any value at x = 0 changes only that one point; it cannot create a finite nearby limit."] },
    ],
    takeaway: "Classify first, then solve. The same-looking 0 denominator can hide a finite hole, a jump, or unbounded behavior.",
  },
  "math.m3.l1": {
    opening: [
      "Average rate of change measures what happened across an interval: change in output divided by change in input. If a car travels 100 miles in 2 hours, its average speed is 50 miles per hour; it might not have traveled at 50 miles per hour at every instant.",
      "For a function f, the average rate from x = a to x = b is [f(b) - f(a)]/(b - a). Geometrically, this is the slope of the secant line through two points on the graph. To estimate an instantaneous rate at a, move b closer and closer to a, or write b = a + h and let h approach zero.",
    ],
    examples: [
      { question: "A position is s(t) = t² meters. Find average velocity from t = 2 to t = 5 seconds.", approach: "Compute both positions, subtract in matching order, and divide by elapsed time.", steps: ["s(2) = 2² = 4 meters; s(5) = 5² = 25 meters.", "Change in position is 25 - 4 = 21 meters. Elapsed time is 5 - 2 = 3 seconds.", "Average velocity is 21/3 = 7 meters per second."], check: "Units are meters divided by seconds. A result in meters alone would not be a velocity." },
      { question: "Estimate the instantaneous velocity of s(t) = t² at t = 2 using an interval of width h.", approach: "Keep h symbolic before shrinking it.", steps: ["Average velocity from 2 to 2 + h is [s(2 + h) - s(2)]/h = [(2 + h)² - 4]/h.", "Expand: (2 + h)² = 4 + 4h + h². Subtract 4 to get 4h + h².", "For h ≠ 0, divide by h to obtain 4 + h.", "As h → 0, 4 + h → 4. The instantaneous velocity is 4 meters per second."], check: "For h = 0.1 the average is 4.1; for h = -0.1 it is 3.9. Both approach 4." },
    ],
    practice: [
      { question: "For s(t) = 3t² meters, find average velocity from t = 1 to t = 3 seconds.", hint: "Calculate s(3) - s(1), then divide by 3 - 1.", solution: ["s(3) = 27 and s(1) = 3, so displacement is 24 meters.", "Elapsed time is 2 seconds, giving average velocity 24/2 = 12 meters per second."] },
      { question: "For f(x) = x², find the average rate from x = 1 to x = 1 + h.", hint: "Expand (1 + h)² and cancel h only after factoring.", solution: ["[f(1 + h) - f(1)]/h = [(1 + 2h + h²) - 1]/h = (2h + h²)/h.", "For h ≠ 0 this equals 2 + h. As h → 0, the instantaneous rate at 1 is 2."] },
    ],
    takeaway: "Average rate is slope across an interval. Instantaneous rate is the limit as that interval shrinks.",
  },
  "math.m3.l2": {
    opening: [
      "A derivative is the limit of average slopes. For a function f, the derivative at x = a is f′(a) = lim as h → 0 of [f(a + h) - f(a)]/h, if that limit exists. Before taking the limit, h is nonzero. At the end, the limit describes where the slopes go as h becomes tiny.",
      "This definition explains why derivative rules work. Memorized rules are faster later, but deriving a few examples from scratch lets you see exactly what the symbol f′ means. It also shows why a sharp corner can fail: the left and right slopes may approach different numbers.",
    ],
    examples: [
      { question: "Use the definition to find the derivative of f(x) = x² at an arbitrary x.", approach: "Do not start with the power rule. Build the difference quotient and simplify it.", steps: ["Write [f(x + h) - f(x)]/h = [(x + h)² - x²]/h.", "Expand (x + h)² = x² + 2xh + h². Subtract x² to get 2xh + h².", "Factor h: (2xh + h²)/h = h(2x + h)/h = 2x + h, for h ≠ 0.", "As h → 0, 2x + h → 2x. Therefore f′(x) = 2x."], check: "At x = 3, the derivative is 6. Secant slopes near 3, such as between 3 and 3.01, are close to 6." },
      { question: "Find the derivative of f(x) = 3x² - 1 at x = 2 using the definition.", approach: "Insert a = 2 into the definition, then work through the algebra.", steps: ["f(2) = 3(2²) - 1 = 11. Also f(2 + h) = 3(2 + h)² - 1.", "Expand: 3(4 + 4h + h²) - 1 = 11 + 12h + 3h².", "Subtract f(2): [f(2 + h) - f(2)]/h = (12h + 3h²)/h = 12 + 3h for h ≠ 0.", "Let h → 0. The derivative at 2 is f′(2) = 12."], check: "The function's output changes by about 12 times a small input change near x = 2." },
    ],
    practice: [
      { question: "Use the limit definition to find the derivative of f(x) = x² + 2x.", hint: "Compute f(x + h) first, then subtract all of x² + 2x.", solution: ["f(x + h) = (x + h)² + 2(x + h) = x² + 2xh + h² + 2x + 2h.", "Subtract f(x) = x² + 2x to get h(2x + h + 2). Divide by nonzero h to get 2x + h + 2.", "Let h → 0. Therefore f′(x) = 2x + 2."] },
      { question: "Why is f(x) = |x| not differentiable at x = 0?", hint: "Compute [|h| - |0|]/h for positive and negative h separately.", solution: ["For h > 0, |h|/h = 1, so slopes from the right approach 1.", "For h < 0, |h| = -h and |h|/h = -1, so slopes from the left approach -1.", "The one-sided slopes disagree. Thus the derivative at 0 does not exist."] },
    ],
    takeaway: "A derivative is a limit of secant slopes. Expand and cancel before sending h to zero; compare both sides at corners.",
  },
  "math.m3.l3": {
    opening: ["f′(x) is a new function: it tells you the slope at each input where a slope exists. f′(2) is one number obtained from that function. Do not confuse either with f(2), which is the height of the original graph.", "To derive f′(x), hold x fixed while h approaches zero in [f(x + h) - f(x)]/h. Only after finding the derivative function should you plug in a particular x. The derivative may have a smaller domain than f, for example at a corner."],
    examples: [
      { question: "Find f′(x) and f′(-2) for f(x) = x³. Compare with f(-2).", approach: "Expand the cube in the difference quotient before taking the limit.", steps: ["(x + h)³ = x³ + 3x²h + 3xh² + h³.", "Subtract x³ and divide by nonzero h: [f(x + h) - f(x)]/h = 3x² + 3xh + h².", "Let h → 0 to get f′(x) = 3x². Then f′(-2) = 3(4) = 12, a slope, while f(-2) = -8, a graph height."], check: "The graph of f′ is y = 3x², not the original cubic y = x³." },
      { question: "For f(x) = x² + 2x, find f′(x), f′(1), and f(1).", approach: "Derive one slope formula, then evaluate each requested quantity separately.", steps: ["f(x + h) - f(x) = (x + h)² + 2(x + h) - (x² + 2x) = 2xh + h² + 2h.", "Divide by h ≠ 0 to get 2x + h + 2; letting h → 0 gives f′(x) = 2x + 2.", "The slope at 1 is f′(1) = 4, but the original output is f(1) = 1 + 2 = 3."], check: "The tangent at x = 1 passes through (1, 3) with slope 4." },
    ],
    practice: [
      { question: "If f(x) = x², what are f(3) and f′(3)? Explain what each represents.", hint: "The function gives a height; its derivative 2x gives a slope.", solution: ["f(3) = 3² = 9 is the graph's height at input 3.", "f′(3) = 2(3) = 6 is the tangent slope there."] },
      { question: "For g(x) = |x|, can g′ be evaluated at 0?", hint: "Compare slopes on the two sides of the corner.", solution: ["For x < 0, g(x) = -x and the slope is -1. For x > 0, g(x) = x and the slope is 1.", "Those slopes disagree at 0, so g′(0) is undefined even though g(0) = 0."] },
    ],
    takeaway: "f(a) is an output; f′(a) is a slope; f′(x) is the function of slopes.",
  },
  "math.m3.l4": {
    opening: ["A finite derivative forces continuity. If the slopes [f(a + h) - f(a)]/h approach a finite number, then multiplying by h shows f(a + h) - f(a) approaches zero. Nearby outputs must therefore approach f(a).", "The converse fails. A graph can join without a gap but have a sharp corner. At a corner, the slopes from left and right differ; a derivative needs one common finite slope."],
    examples: [
      { question: "Is g(x) = |x - 2| continuous and differentiable at x = 2?", approach: "Check the function value and limit first, then compute one-sided difference quotients.", steps: ["g(2) = 0, and |x - 2| → 0 as x → 2. The limit equals the point value, so g is continuous.", "For h > 0, [g(2 + h) - g(2)]/h = |h|/h = 1.", "For h < 0, the same quotient is -1. The one-sided slopes differ, so g′(2) does not exist."], check: "The graph has no gap at (2, 0), but it turns sharply there." },
      { question: "If a function jumps at x = 0, can it be differentiable there?", approach: "Use the implication differentiable ⇒ continuous before attempting algebra.", steps: ["A jump means the nearby outputs do not approach a single value equal to f(0); continuity fails.", "Every differentiable function must be continuous at that point.", "Therefore a jump rules out differentiability at 0. No choice of slope can repair the missing continuity."], check: "This argument is enough to reject differentiability, but a continuous function still needs a slope test." },
    ],
    practice: [
      { question: "Is f(x) = |x| differentiable at 0? Show the left and right quotients.", hint: "For h < 0, |h| = -h.", solution: ["[f(h) - f(0)]/h = |h|/h. For h > 0 this is 1; for h < 0 it is -1.", "The two sides do not agree, so no derivative exists at 0, although f is continuous there."] },
      { question: "Does differentiability imply continuity, or does continuity imply differentiability?", hint: "Use the corner of |x| as a counterexample for one direction.", solution: ["Differentiability implies continuity at an interior point.", "Continuity does not imply differentiability: |x| is continuous but has no derivative at 0."] },
    ],
    takeaway: "A differentiable function is continuous; a continuous function may still have a corner with no derivative.",
  },
  "math.m3.l5": {
    opening: ["The derivative gives the slope of a tangent, but a slope alone does not locate a line. You also need the point on the curve: (a, f(a)). Then use point-slope form y - f(a) = f′(a)(x - a).", "A normal line is perpendicular to the tangent. If the tangent slope m is finite and nonzero, the normal slope is -1/m. If the tangent is horizontal, its normal is vertical and has equation x = a."],
    examples: [
      { question: "Find tangent and normal lines to y = x² at x = 2.", approach: "Calculate point and slope as separate pieces before writing either line.", steps: ["The point on the curve is (2, f(2)) = (2, 4).", "The derivative is f′(x) = 2x, so tangent slope f′(2) = 4.", "Tangent: y - 4 = 4(x - 2), or y = 4x - 4.", "Normal slope is -1/4. Normal: y - 4 = -(1/4)(x - 2)."], check: "At x = 2, both line equations produce y = 4. Their slopes multiply to -1." },
      { question: "Find tangent and normal lines to y = x² + 1 at x = 0.", approach: "Watch for the horizontal-tangent special case.", steps: ["The point is (0, 1). The derivative is 2x, so the tangent slope at 0 is 0.", "The horizontal tangent through (0, 1) is y = 1.", "A perpendicular to a horizontal line is vertical. The normal through the point is x = 0, not a line with a finite slope."], check: "Both lines pass through (0, 1)." },
    ],
    practice: [
      { question: "Find the tangent to y = x² at x = -1.", hint: "The point is (-1, 1). The slope is 2(-1).", solution: ["f′(-1) = -2 and f(-1) = 1.", "Point-slope form: y - 1 = -2(x + 1), so y = -2x - 1."] },
      { question: "What is the normal line to y = x² at x = -1?", hint: "Take the negative reciprocal of the tangent slope -2.", solution: ["The normal slope is 1/2 and it passes through (-1, 1).", "Its equation is y - 1 = (1/2)(x + 1)."] },
    ],
    takeaway: "Use (a, f(a)) for the point and f′(a) for the slope. Handle horizontal tangents with vertical normals.",
  },
  "math.m3.l6": {
    opening: ["Position s(t) tells you where an object is. Its derivative v(t) = s′(t) is velocity: position change per unit time. The derivative of velocity, a(t) = s″(t), is acceleration: velocity change per unit time.", "If position uses meters and time uses seconds, velocity uses m/s and acceleration uses m/s². Velocity has direction and may be negative; speed is |v|. An object speeds up when velocity and acceleration point in the same direction (same sign), and slows down when their signs differ."],
    examples: [
      { question: "For s(t) = t² - 4t meters, find v, a, and when the object stops.", approach: "Differentiate once for velocity, twice for acceleration, then solve v = 0.", steps: ["v(t) = s′(t) = 2t - 4 meters per second.", "a(t) = v′(t) = 2 meters per second squared.", "The object stops when 2t - 4 = 0, so t = 2 seconds."], check: "At t = 1, v = -2, and at t = 3, v = 2; it changes direction around the stop." },
      { question: "Does that object speed up at t = 1 or t = 3?", approach: "Compare the signs of velocity and acceleration, not acceleration alone.", steps: ["At t = 1, v(1) = -2 and a(1) = +2. They have opposite signs, so the object is moving backward but slowing down.", "At t = 3, v(3) = +2 and a(3) = +2. They have the same sign, so the object speeds up.", "Speed is |v|, so speed is 2 m/s at both moments, despite different directions of change."], check: "Positive acceleration does not automatically mean increasing speed." },
    ],
    practice: [
      { question: "For s(t) = 3t² meters, find velocity and acceleration at t = 2 seconds.", hint: "Differentiate twice and attach units.", solution: ["v(t) = 6t m/s, so v(2) = 12 m/s.", "a(t) = 6 m/s², so a(2) = 6 m/s²."] },
      { question: "If v = -5 m/s and a = +2 m/s² at one moment, is speed increasing?", hint: "Velocity and acceleration have opposite signs.", solution: ["No. The object moves in the negative direction while acceleration points positive, against its motion.", "Its speed |v| is decreasing at that moment."] },
    ],
    takeaway: "Differentiate position for velocity and velocity for acceleration. Track units and compare signs to reason about speed.",
  },
  "math.m3.l7": {
    opening: ["Before relying on memorized rules, practice the four moves of first principles: write the difference quotient, expand or rationalize, cancel only while h ≠ 0, and take the limit. If the rule has a corner or an endpoint, compare the allowed approaches.", "A derivative is a limit. Algebra helps reveal the limit, but cancelling an h factor never means the original quotient was defined at h = 0."],
    examples: [
      { question: "Find the derivative of f(x) = √x at a positive input a.", approach: "Rationalize the 0/0 difference quotient with its conjugate.", steps: ["Write [√(a + h) - √a]/h for h ≠ 0 and a + h ≥ 0.", "Multiply top and bottom by √(a + h) + √a. The top becomes (a + h) - a = h.", "Cancel nonzero h, leaving 1/[√(a + h) + √a].", "As h → 0, this approaches 1/(2√a). Thus f′(a) = 1/(2√a) for a > 0."], check: "At a = 4, the slope is 1/(2·2) = 1/4." },
      { question: "Does √x have a finite derivative at x = 0?", approach: "The domain starts at 0, so examine the right-hand quotient directly.", steps: ["For h > 0, [√h - √0]/h = √h/h = 1/√h.", "As h → 0 from the right, 1/√h grows without bound.", "There is no finite derivative at 0. The formula 1/(2√a) from the previous example was derived only for a > 0."], check: "The curve is continuous at 0 but becomes extremely steep there." },
    ],
    practice: [
      { question: "Use the definition to find f′(a) for f(x) = x² - 3x.", hint: "Expand f(a + h), subtract f(a), then factor h.", solution: ["f(a + h) - f(a) = (a + h)² - 3(a + h) - (a² - 3a) = 2ah + h² - 3h.", "Divide by h ≠ 0: 2a + h - 3. Let h → 0 to get f′(a) = 2a - 3."] },
      { question: "Use the definition to decide whether |x - 1| has a derivative at 1.", hint: "The quotient is |h|/h.", solution: ["For h > 0, |h|/h = 1; for h < 0, it equals -1.", "The sides disagree, so the derivative at 1 does not exist."] },
    ],
    takeaway: "Build the quotient, justify each simplification, then take the limit. At corners or boundaries, inspect both allowable sides.",
  },
  "math.m4.l1": {
    opening: [
      "A derivative rule is a shortcut earned from the limit definition. The derivative of a constant is zero because it never changes. The derivative of xⁿ is nxⁿ⁻¹ where the function is defined and differentiable. For a sum, differentiate each term separately; a constant multiplier stays out front.",
      "You can check the power rule against the definition for x²: expanding (x + h)² and taking the limit gives 2x. That is the n = 2 case. For a polynomial, repeat the rule term by term rather than applying it to the whole expression at once.",
    ],
    examples: [
      { question: "Differentiate p(x) = 4x³ - 5x² + 7x - 9, then find its slope at x = 2.", approach: "Name each term's derivative and keep its coefficient.", steps: ["The derivative of 4x³ is 4 · 3x² = 12x². The derivative of -5x² is -5 · 2x = -10x.", "The derivative of 7x is 7, because x changes by 1 per unit of x. The derivative of -9 is 0.", "Combine: p′(x) = 12x² - 10x + 7.", "At x = 2, p′(2) = 12(4) - 10(2) + 7 = 48 - 20 + 7 = 35."], check: "The slope has no fixed sign everywhere; at x = 2 it is positive 35." },
      { question: "Differentiate q(x) = 3/x², including its domain.", approach: "Rewrite the denominator as a negative exponent before using the power rule.", steps: ["For x ≠ 0, q(x) = 3x⁻².", "Apply the power rule: q′(x) = 3(-2)x⁻³ = -6x⁻³ = -6/x³.", "The original function does not exist at x = 0, so it has no derivative there."], check: "At x = 1, q′(1) = -6: the positive function decreases as x moves right from 1." },
    ],
    practice: [
      { question: "Differentiate f(x) = 2x⁴ - 3x + 5 - 4/x on x ≠ 0. Find f′(2).", hint: "Rewrite -4/x as -4x⁻¹ and handle each term separately.", solution: ["Derivative terms: 2x⁴ → 8x³; -3x → -3; 5 → 0; -4x⁻¹ → 4x⁻².", "Thus f′(x) = 8x³ - 3 + 4/x² for x ≠ 0.", "At x = 2: 8(8) - 3 + 4/4 = 64 - 3 + 1 = 62."] },
      { question: "Explain why the derivative of 7x² + 4 is 14x, not 14x + 4.", hint: "What happens to a constant's output when x changes?", solution: ["The derivative of 7x² is 7 · 2x = 14x.", "The value 4 never changes with x, so its derivative is 0. Add the results: 14x + 0 = 14x."] },
    ],
    takeaway: "Differentiate sums term by term. A constant disappears because it has zero rate of change, and the original domain still matters.",
  },
  "math.m6.l1": {
    opening: [
      "Differentiation asks for a rate of change. Antidifferentiation goes backward: given a rate, which function could have produced it? Since the derivative of 2x³ is 6x², one antiderivative of 6x² is 2x³.",
      "There are infinitely many such functions: 2x³ + 1, 2x³ - 7, and 2x³ + C all have the same derivative. The symbol ∫f(x) dx describes this whole family and therefore needs +C. An initial condition such as F(1) = 5 selects one member.",
      "The reverse power rule raises the power by one and divides by the new power: ∫xⁿ dx = xⁿ⁺¹/(n + 1) + C when n ≠ -1. That exception matters. ∫1/x dx = ln|x| + C on an interval not crossing zero.",
    ],
    examples: [
      { question: "Find F if F′(x) = 6x² - 4 and F(1) = 5.", approach: "Find the general family first; only then use the initial value.", steps: ["The reverse power rule gives an antiderivative of 6x²: 6 · x³/3 = 2x³.", "An antiderivative of -4 is -4x. Thus F(x) = 2x³ - 4x + C.", "Use F(1) = 5: 2(1)³ - 4(1) + C = 5, so -2 + C = 5 and C = 7.", "The particular function is F(x) = 2x³ - 4x + 7."], check: "Differentiate to get 6x² - 4, then evaluate F(1) = 2 - 4 + 7 = 5." },
      { question: "Find an antiderivative of f(x) = 2/x for x > 0.", approach: "Notice the exponent -1; the ordinary reverse power rule would divide by zero.", steps: ["Write 2/x = 2x⁻¹. The reverse power formula would ask us to divide by (-1 + 1) = 0, so it cannot be used.", "The derivative of ln x is 1/x for x > 0. Multiply by 2: an antiderivative is 2 ln x.", "All antiderivatives on this interval are 2 ln x + C."], check: "Differentiate 2 ln x + C to recover 2/x." },
    ],
    practice: [
      { question: "Find G on x > 0 if G′(x) = 3x² + 2/x and G(1) = 4.", hint: "Integrate each term; ln 1 = 0 will simplify the initial value.", solution: ["G(x) = x³ + 2 ln x + C for x > 0.", "G(1) = 1 + 2(0) + C = 4, so C = 3.", "G(x) = x³ + 2 ln x + 3. Differentiate and substitute x = 1 to check both conditions."] },
      { question: "What is ∫(4x³ - 6x) dx? Differentiate your answer.", hint: "Reverse the power rule separately for each term.", solution: ["∫4x³ dx = x⁴ and ∫-6x dx = -3x², so the answer is x⁴ - 3x² + C.", "Its derivative is 4x³ - 6x, matching the original expression."] },
    ],
    takeaway: "An indefinite integral is a family, not one function. Differentiate your answer and use initial values to find C.",
  },
  "math.m6.l2": {
    opening: [
      "An integral can be built by adding many thin rectangles. Split an interval [a, b] into n pieces. If the pieces are equal, each width is Δx = (b - a)/n. Multiply a sampled function height by Δx to estimate each strip's signed contribution, then add them. As the widths shrink toward zero, the sum can approach an exact value.",
      "The word signed matters. A graph above the x-axis contributes positively; one below contributes negatively. A definite integral is net accumulation, which may differ from total geometric area or total distance traveled.",
    ],
    examples: [
      { question: "Estimate ∫ from 0 to 2 of x dx using 4 right-endpoint rectangles, then find the exact limit.", approach: "Compute the width and right endpoints explicitly before adding heights.", steps: ["With n = 4, Δx = (2 - 0)/4 = 1/2. Right endpoints are 1/2, 1, 3/2, and 2.", "The four rectangle contributions are (1/2)(1/2), (1)(1/2), (3/2)(1/2), and (2)(1/2). Their sum is 1/4 + 1/2 + 3/4 + 1 = 5/2.", "For general n, Δx = 2/n and the ith right endpoint is xᵢ = 2i/n. The sum is Σ from i=1 to n of (2i/n)(2/n) = (4/n²)Σi.", "Use Σi = n(n + 1)/2 to obtain 2(n + 1)/n = 2 + 2/n. As n grows, 2/n → 0, so the integral is 2."], check: "The 4-rectangle overestimate 2.5 is above the exact triangular area (base 2, height 2): (1/2)·2·2 = 2." },
      { question: "Compare the integral of f(x) = x over [-1, 1] with the geometric area.", approach: "Split the interval where the graph crosses the axis.", steps: ["From -1 to 0, x is negative. The triangle there has geometric area 1/2 but signed integral -1/2.", "From 0 to 1, x is positive. Its triangle has both geometric area and signed integral 1/2.", "The net integral is -1/2 + 1/2 = 0. The total geometric area is 1/2 + 1/2 = 1."], check: "The graph y = x is symmetric through the origin, so negative and positive contributions cancel." },
    ],
    practice: [
      { question: "Estimate ∫ from 0 to 1 of x dx with 2 right-endpoint rectangles, then use n rectangles to find the limit.", hint: "For n rectangles, Δx = 1/n and the ith right endpoint is i/n.", solution: ["With 2 rectangles, widths are 1/2 and right endpoints 1/2 and 1. Sum: (1/2)(1/2) + (1)(1/2) = 3/4.", "For n rectangles, the sum is Σ(i/n)(1/n) = n(n + 1)/(2n²) = (n + 1)/(2n).", "As n → ∞, this approaches 1/2."] },
      { question: "A velocity is v(t) = -2 m/s for 0 ≤ t ≤ 3. What are signed displacement and total distance?", hint: "Height times width gives the integral; distance uses the absolute value of velocity.", solution: ["The signed displacement is (-2)(3) = -6 meters.", "The total distance is |−2|(3) = 6 meters. The negative sign records direction, not negative distance."] },
    ],
    takeaway: "Riemann sums add height × width. The limit gives signed accumulation; total area requires treating below-axis pieces as positive.",
  },
};

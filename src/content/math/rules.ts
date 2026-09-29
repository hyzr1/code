import type { MathLecture } from "./lectures";

/** The first rules unit follows the limit-based derivative unit. Each rule is
 * paired with its hypotheses, a derivation idea, and a transfer problem. */
export const MATH_RULE_LECTURES: MathLecture[] = [
  {
    lesson: "math.m4.l1",
    title: "Constants, powers, sums, and linearity",
    premise:
      "Differentiation rules compress limit calculations you can already justify. Learn their conditions and structure, rather than treating them as symbol replacement.",
    idea: "A constant function has zero change, so its derivative is zero. For a real exponent n where x^n is defined on an open interval, the power rule gives d(x^n)/dx=n x^(n-1); at x=0 or a domain boundary check whether the result is meaningful. The derivative respects addition and scalar multiplication: d[af(x)+bg(x)]/dx=af'(x)+bg'(x). These facts let a polynomial be differentiated term by term. The power rule for positive integer n follows by expanding (x+h)^n: after subtracting x^n and dividing by h, the surviving term as h→0 is n x^(n-1). The same formula for other exponents needs additional justification from inverse, logarithmic, or chain rules.",
    worked:
      "Differentiate p(x)=4x³-5x²+7x-9. The constant contributes zero. Differentiate each power and keep its coefficient: p'(x)=12x²-10x+7. At x=2 the slope is 48-20+7=35. For q(x)=3/x², rewrite q(x)=3x^(-2) on x≠0, giving q'(x)=-6x^(-3)=-6/x³. The derivative does not exist at x=0 because q itself is undefined there.",
    interpretation:
      "Linearity makes a long polynomial manageable because every term contributes independently. It does not say that differentiation preserves multiplication of functions; the product rule is a separate result.",
    trap: "Do not differentiate a constant term to itself, and do not omit the exponent's multiplier. When using a negative power, carry the original domain restriction into the derivative.",
    practice:
      "Find the derivative of f(x)=2x⁴-3x+5-4/x for x≠0. Evaluate f'(2), and state why there is no derivative at zero.",
    solution:
      "Rewrite -4/x as -4x^(-1). Termwise differentiation gives f'(x)=8x³-3+4x^(-2)=8x³-3+4/x². At x=2 this is 64-3+1=62. Zero is excluded from f's domain, so no derivative at zero can be defined from this formula.",
    checks: [
      [
        "What is d(7)/dx?",
        ["0", "7", "1"],
        0,
        "A constant has zero rate of change.",
      ],
      [
        "What is d(3x⁴)/dx?",
        ["12x³", "3x³", "4x³"],
        0,
        "Multiply by the exponent and lower it by one.",
      ],
      [
        "Does linearity by itself give a product rule?",
        ["No", "Yes", "Only for polynomials"],
        0,
        "Multiplying two varying functions is a different operation.",
      ],
    ],
  },
  {
    lesson: "math.m4.l2",
    title: "Product and quotient rules",
    premise:
      "When two factors vary, both contribute to the change of their product. The quotient rule similarly accounts for changes in numerator and denominator.",
    idea: "For differentiable f and g, (fg)'=f'g+fg'. One proof adds and subtracts f(x+h)g(x) in the difference quotient, then takes limits. This shows why the tempting expression f'g' is generally false. Where g(x)≠0, (f/g)'=[f'g-fg']/g². You can obtain it by differentiating f·(1/g), once the reciprocal derivative is known. The order in the numerator matters. For a constant denominator, simple scalar linearity is often shorter; for a quotient whose factors cancel, simplify first but preserve excluded points.",
    worked:
      "Let f(x)=x²(x+3). Both factors vary, so f'(x)=2x(x+3)+x²=3x²+6x. Expanding first gives f=x³+3x² and the same derivative. For r(x)=(x²+1)/x on x≠0, the quotient rule gives [2x·x-(x²+1)·1]/x²=(x²-1)/x². Rewriting r=x+1/x gives r'=1-1/x², a useful independent check.",
    interpretation:
      "The product rule has two terms because either factor may change while the other supplies its current scale. The quotient rule has a squared denominator, so its domain must be stated before evaluating.",
    trap: "Do not multiply derivatives to differentiate a product, and do not reverse the quotient-rule numerator. A canceled denominator does not make the original function defined at its excluded input.",
    practice:
      "Differentiate h(x)=(x²+2x)(x-3) using the product rule, then expand first and check. Differentiate k(x)=(x+1)/(x-1), including its domain.",
    solution:
      "For h, h'=(2x+2)(x-3)+(x²+2x)·1=3x²-2x-6. Expanding h=x³-x²-6x gives the same derivative. For k, with x≠1, k'=[1·(x-1)-(x+1)·1]/(x-1)²=-2/(x-1)². The formula is not valid at x=1 because k is undefined there.",
    checks: [
      [
        "What is (fg)'?",
        ["f'g+fg'", "f'g'", "fg"],
        0,
        "Each factor contributes one first-order change.",
      ],
      [
        "What is the denominator in (f/g)'?",
        ["g²", "g", "f²"],
        0,
        "Differentiate a reciprocal or use the quotient rule.",
      ],
      [
        "Can a derivative of (x+1)/(x-1) be evaluated at 1?",
        ["No", "Yes, -2", "Yes, zero"],
        0,
        "The original function is not defined at 1.",
      ],
    ],
  },
  {
    lesson: "math.m4.l3",
    title: "Chain rule and nested functions",
    premise:
      "A change in an outside function depends on how fast its inside input changes. The chain rule multiplies those two local rates.",
    idea: "If y=f(g(x)) and both functions are differentiable at the relevant inputs, then y'=f'(g(x))g'(x). Think of a tiny change Δx producing Δu≈g'(x)Δx and then Δy≈f'(u)Δu. The product of the two rates survives as Δx shrinks. For a power [u(x)]^n, the result is n[u(x)]^(n-1)u'(x). For multiple nested layers, work outside in and multiply each inside derivative. Record the domain first: an even root, logarithm, or denominator may limit where the composite function and its derivative exist.",
    worked:
      "Differentiate y=(3x²+1)^5. The outside function is u^5 with derivative 5u^4, and the inside is u=3x²+1 with derivative 6x. Therefore y'=5(3x²+1)^4·6x=30x(3x²+1)^4. Expanding a fifth power would give the same result but adds unnecessary arithmetic. For z=(x²+1)^(-1), z'=-(x²+1)^(-2)·2x; the factor 2x records the changing inside.",
    interpretation:
      "The chain rule is a rate-conversion law. The derivative of the outside function must be evaluated at the current inside value, not at bare x unless the inside is x.",
    trap: "Do not differentiate only the outer layer. Also do not apply a power rule to an entire sum by distributing the exponent: (a+b)^5 is not a^5+b^5.",
    practice:
      "Differentiate f(x)=sqrt(1+4x³) and g(x)=1/(2x-1)^2. State the real domains of both original functions.",
    solution:
      "For f, the radicand must satisfy 1+4x³≥0, or x≥-cube_root(1/4). At interior points where the radicand is positive, f'(x)=(1/2)(1+4x³)^(-1/2)·12x²=6x²/sqrt(1+4x³). At the left endpoint the derivative formula is undefined and an ordinary two-sided derivative is unavailable. For g=(2x-1)^(-2), x≠1/2, and g'=-2(2x-1)^(-3)·2=-4/(2x-1)^3.",
    checks: [
      [
        "What is d[(x²+1)^3]/dx?",
        ["6x(x²+1)²", "3(x²+1)²", "6x²+3"],
        0,
        "Differentiate the outside and multiply by 2x.",
      ],
      [
        "Where do you evaluate f' in (f∘g)'?",
        ["At g(x)", "At x only", "At f(x)"],
        0,
        "The outside function receives g(x) as input.",
      ],
      [
        "Does the chain rule remove domain restrictions?",
        ["No", "Yes", "Only for powers"],
        0,
        "The original composite must be defined and differentiable.",
      ],
    ],
  },
  {
    lesson: "math.m4.l4",
    title: "Trigonometric derivatives and radians",
    premise:
      "Trigonometric functions model rotation and periodic change. Their derivative rules become clean when angles are measured in radians.",
    idea: "The key limits are lim(h→0) sin(h)/h=1 and lim(h→0) [cos(h)-1]/h=0 when h is in radians. The angle-addition identities and the difference quotient then give d(sin x)/dx=cos x and d(cos x)/dx=-sin x. In degrees, an extra conversion factor π/180 appears. Combine these results with the product and chain rules: d[sin u(x)]/dx=cos(u)u' and d[cos u(x)]/dx=-sin(u)u'. The tangent derivative sec²x follows from sin x/cos x wherever cos x≠0. Check a function's domain before applying a rule.",
    worked:
      "For y=x sin(3x), use the product rule on x and sin(3x), then the chain rule on the inner angle: y'=sin(3x)+3x cos(3x). At x=0 the slope is zero. For z=cos(2x)+sin²x, z'=-2sin(2x)+2sin x cos x. Since 2sin x cos x=sin(2x), the result simplifies to -sin(2x). This is also a check on the signs and factors.",
    interpretation:
      "The cosine rule is negative because cosine decreases immediately to the right of zero. The multiplier in sin(3x) reflects an angle that moves three times as fast as x.",
    trap: "Do not use degree-mode intuition in a radian derivative, omit the inner derivative, or forget the minus sign on cosine. The tangent derivative is undefined where cos x=0.",
    practice:
      "Differentiate f(x)=x² cos(2x) and g(x)=tan x. Give the real domain of g and calculate f'(0).",
    solution:
      "For f, f'=2x cos(2x)-2x² sin(2x), so f'(0)=0. For g=sin x/cos x, quotient differentiation gives [cos²x+sin²x]/cos²x=sec²x, defined only when cos x≠0, or x≠π/2+kπ for integer k.",
    checks: [
      [
        "What is d[cos x]/dx?",
        ["-sin x", "sin x", "cos x"],
        0,
        "The cosine slope is negative just to the right of zero.",
      ],
      [
        "What is d[sin(4x)]/dx?",
        ["4cos(4x)", "cos(4x)", "4sin(4x)"],
        0,
        "Use the chain rule on the angle.",
      ],
      [
        "Which angle unit gives d(sin x)/dx=cos x?",
        ["Radians", "Degrees", "Either without conversion"],
        0,
        "The defining trigonometric limit equals one in radians.",
      ],
    ],
  },
  {
    lesson: "math.m4.l5",
    title: "Exponential and logarithmic derivatives",
    premise:
      "Exponential growth changes in proportion to its current amount, while logarithms turn multiplicative scales into additive ones.",
    idea: "The number e is the base whose exponential has slope one at input zero, leading to d(e^x)/dx=e^x. By the chain rule, d(e^{u(x)})/dx=e^u u'. For a positive base a, a^x=e^{x ln a}, so d(a^x)/dx=a^x ln a. Since ln is the inverse of exp, inverse-function differentiation gives d(ln x)/dx=1/x for x>0. The derivative of ln|x| is also 1/x on each interval excluding zero. Thus d[ln u(x)]/dx=u'/u wherever u>0; ln|u| has the same local derivative wherever u≠0. Distinguish these domains instead of treating logs as defined for all real inputs.",
    worked:
      "For f=e^{2x²-1}, the inner exponent has derivative 4x, so f'=4x e^{2x²-1}. For g=ln(x²+1), the argument is positive for every real x, so g'=2x/(x²+1). For h=3^x, rewrite as e^{x ln 3}; then h'=3^x ln 3. At x=0, h'(0)=ln 3, not one.",
    interpretation:
      "For e^x the instantaneous rate equals the function value. For ln x the rate is large near zero and decreases as x grows, matching a function that keeps rising but more slowly.",
    trap: "Do not confuse e^x with x^e: one has a variable exponent and the other is a power of x. The real logarithm ln u requires u>0; a formula for the derivative does not repair an invalid domain.",
    practice:
      "Differentiate p(x)=ln(5-2x) and q(x)=2^{x²}. State the domains of the original real-valued functions.",
    solution:
      "For p, 5-2x>0 means x<5/2. The chain rule gives p'=-2/(5-2x) on that domain. For q, 2^{x²} is defined for all real x, and q'=2^{x²}(ln 2)(2x)=2x ln(2)·2^{x²}.",
    checks: [
      [
        "What is d[e^{x²}]/dx?",
        ["2x e^{x²}", "e^{x²}", "x²e^{x²}"],
        0,
        "Multiply by the exponent's derivative.",
      ],
      [
        "Where is ln(5-2x) real?",
        ["x<5/2", "x>5/2", "All real x"],
        0,
        "Its argument must be positive.",
      ],
      [
        "What is d[3^x]/dx?",
        ["3^x ln 3", "3^x", "x3^(x-1)"],
        0,
        "Use 3^x=e^{x ln 3}.",
      ],
    ],
  },
  {
    lesson: "math.m4.l6",
    title: "Implicit differentiation",
    premise:
      "A curve may be given by an equation rather than by a solved formula y=f(x). Its local slope can still be found.",
    idea: "Treat y as a function of x locally, even if the equation is not globally a single-valued function. Differentiate both sides with respect to x. Every derivative of an expression involving y must include y' by the chain rule: d(y²)/dx=2yy'. Gather all y' terms and solve. For F(x,y)=0, the compact expression is y'=-F_x/F_y where F_y≠0, but the ordinary term-by-term derivation makes the source of each term visible. A zero denominator may signal a vertical tangent or a more complicated point; inspect the curve rather than assigning an infinite numerical slope.",
    worked:
      "A circle satisfies x²+y²=25. Differentiating gives 2x+2yy'=0, hence y'=-x/y wherever y≠0. At (3,4), the slope is -3/4. At (5,0), this formula has zero denominator and the circle has a vertical tangent. Solving for the upper and lower semicircles separately yields the same slopes but requires choosing a branch; implicit differentiation keeps both branches in one calculation.",
    interpretation:
      "The derivative describes one local branch of the curve. It does not assert that the entire circle is the graph of one function of x.",
    trap: "Forgetting y' in d(y²)/dx is the main error. Do not plug coordinates into a slope expression before checking that the point actually satisfies the original equation.",
    practice:
      "Find the tangent slope to x²+xy+y²=7 at (1,2). Confirm the point lies on the curve before differentiating.",
    solution:
      "At (1,2), 1+2+4=7, so the point is on the curve. Differentiate: 2x+(xy'+y)+2yy'=0. Collect terms: (x+2y)y'=-(2x+y). At (1,2), y'=-(2+2)/(1+4)=-4/5.",
    checks: [
      [
        "What is d[y²]/dx when y depends on x?",
        ["2yy'", "2y", "y'²"],
        0,
        "Apply the chain rule.",
      ],
      [
        "What is the circle slope at (3,4)?",
        ["-3/4", "3/4", "-4/3"],
        0,
        "Use y'=-x/y.",
      ],
      [
        "Can a circle be one y=f(x) globally?",
        ["No", "Yes", "Only at its top"],
        0,
        "Most x values on the circle correspond to two y values.",
      ],
    ],
  },
  {
    lesson: "math.m4.l7",
    title: "Derivatives of inverse functions",
    premise:
      "An inverse reverses an input-output relationship. Its rate of change reverses the original function's local rate.",
    idea: "If f is one-to-one near a point, differentiable there, and f' at that point is nonzero, then f(f⁻¹(x))=x. Differentiate with the chain rule: f'(f⁻¹(x))·(f⁻¹)'(x)=1. Therefore (f⁻¹)'(x)=1/f'(f⁻¹(x)). The input to f' is the preimage, not the output x. If f' vanishes, the inverse may have a vertical tangent and this finite formula does not apply. The domains and chosen branch matter: sin has no single global inverse on the real line until its domain is restricted.",
    worked:
      "Let f(t)=t³+t, which is strictly increasing because f'(t)=3t²+1>0. To find the inverse derivative at x=2, solve f(t)=2; t=1. Then (f⁻¹)'(2)=1/f'(1)=1/4. There is no need to write an explicit formula for f⁻¹. For exp and ln, the same rule gives (ln)'(x)=1/exp(ln x)=1/x on x>0.",
    interpretation:
      "If the original graph rises steeply, its reflection across y=x rises slowly. The slope becomes a reciprocal after you locate the matching point.",
    trap: "Do not use 1/f'(x) without first finding f⁻¹(x). Reciprocal slope is a statement about corresponding points, and f must be locally invertible with nonzero derivative.",
    practice:
      "For f(t)=t³, compute (f⁻¹)'(8). Explain why the same derivative formula cannot give a finite inverse slope at x=0.",
    solution:
      "The preimage of 8 is t=2, and f'(2)=3·2²=12. Thus (f⁻¹)'(8)=1/12. At x=0 the preimage is 0 and f'(0)=0, so the denominator vanishes. The inverse cube-root graph has a vertical tangent there and no finite ordinary derivative.",
    checks: [
      [
        "For f(t)=t³+t, what is (f⁻¹)'(2)?",
        ["1/4", "1/13", "4"],
        0,
        "The preimage of 2 is t=1.",
      ],
      [
        "Where is f' evaluated in the inverse rule?",
        ["At f⁻¹(x)", "At x", "At f(x)"],
        0,
        "Find the corresponding original input.",
      ],
      [
        "What if f' is zero at that input?",
        [
          "The finite reciprocal formula fails",
          "The inverse slope is zero",
          "The inverse disappears",
        ],
        0,
        "A reciprocal of zero is not a finite slope.",
      ],
    ],
  },
  {
    lesson: "math.m4.l8",
    title: "Higher derivatives and changing motion",
    premise:
      "A derivative can itself change. Differentiating again describes acceleration, concavity, and how a graph's slope evolves.",
    idea: "The second derivative f'' is the derivative of f'. Higher derivatives continue in the same way whenever they exist. For position s(t), velocity is s'(t) and acceleration is s''(t); their units differ: meters, meters per second, and meters per second squared. Positive f'' means slope increases locally; negative f'' means it decreases. A change in concavity requires f'' to change sign, not merely equal zero at an isolated point. An inflection point may occur where f'' is zero or undefined, so examine intervals on both sides. Differentiate with respect to the same variable throughout and preserve the original domain.",
    worked:
      "For s(t)=t³-6t²+9t, velocity is v=3t²-12t+9, acceleration is a=6t-12, and jerk is j=6. At t=2 the velocity is -3 and acceleration is zero: the object is moving backward at that instant even though its velocity is changing from decreasing to increasing. For f(x)=x³, f''=6x changes sign at zero, so the origin is an inflection point.",
    interpretation:
      "Acceleration zero does not imply velocity zero. The sign of velocity indicates direction of motion, while the sign of acceleration indicates how velocity changes.",
    trap: "Do not call every zero of f'' an inflection point. Also do not infer an object is stationary from zero acceleration; stationary means velocity zero.",
    practice:
      "For f(x)=x⁴, find f', f'', and all possible inflection points. Explain whether x=0 is actually an inflection point.",
    solution:
      "f'=4x³ and f''=12x². The only zero of f'' is x=0, but f'' is positive for x<0 and x>0. The graph is concave up on both sides, so zero is not an inflection point.",
    checks: [
      [
        "If s is position, what is s''?",
        ["Acceleration", "Velocity", "Position"],
        0,
        "Differentiate position twice.",
      ],
      [
        "Does f''(0)=0 guarantee an inflection?",
        ["No", "Yes", "Only for polynomials"],
        0,
        "Check for a sign change.",
      ],
      [
        "Can acceleration be zero while velocity is nonzero?",
        ["Yes", "No", "Only at rest"],
        0,
        "They measure different aspects of motion.",
      ],
    ],
  },
  {
    lesson: "math.m4.l9",
    title: "Mixed-rule differentiation workshop",
    premise:
      "Real expressions rarely advertise one derivative rule. The useful skill is choosing an order, preserving domains, and checking the result.",
    idea: "Read the outer structure first: sum, product, quotient, or composition. Mark nested inputs and identify every place where the original function is undefined. Differentiate one layer at a time, then simplify only when it clarifies the result. A symbolic answer can be checked with an independent algebraic rewrite, a numerical difference quotient near a safe point, or units in an applied setting. Numerical checks support a derivation but cannot prove a formula for all inputs. For a quotient with an exponential numerator, take the product and chain derivative inside the quotient rule; factor common terms after differentiation.",
    worked:
      "For f(x)=x²e^{3x}/(x+1), x≠-1. Set N=x²e^{3x}; product and chain rules give N'=e^{3x}(2x+3x²). The quotient rule gives f'=[N'(x+1)-N]/(x+1)². Factor e^{3x}x and simplify: f'=e^{3x}x(3x²+4x+2)/(x+1)². At x=0 this is zero, consistent with the local x² factor. The derivative still cannot be evaluated at -1.",
    interpretation:
      "This calculation is an engineering-style workflow: decompose a large task into smaller correct operations, retain invariants such as the domain, and verify with a simple test point.",
    trap: "Do not apply every rule simultaneously in one unstructured line. Losing a chain multiplier or an excluded input can leave an answer that looks plausible but is wrong.",
    practice:
      "Differentiate g(x)=(ln x)²/x for x>0. Simplify the derivative and evaluate it at x=1.",
    solution:
      "Let N=(ln x)², so N'=2ln(x)/x. Then g'=[N'x-N]/x²=[2ln x-(ln x)²]/x², valid for x>0. At x=1, ln 1=0, hence g'(1)=0. Rewriting g=(ln x)²x^(-1) and using the product rule gives the same expression.",
    checks: [
      [
        "What is the first step with a mixed-rule expression?",
        [
          "Identify its outer structure and domain",
          "Expand everything",
          "Ignore denominators",
        ],
        0,
        "A rule tree makes the work reliable.",
      ],
      [
        "Where is x²e^{3x}/(x+1) undefined?",
        ["x=-1", "x=0", "Nowhere"],
        0,
        "Its denominator vanishes at -1.",
      ],
      [
        "Can one numerical check prove a derivative formula globally?",
        ["No", "Yes", "Only near zero"],
        0,
        "It can reveal mistakes, not establish a general identity.",
      ],
    ],
  },
];

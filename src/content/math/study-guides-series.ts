import type { MathStudyGuide } from "./study-guides";

export const MATH_SERIES_STUDY_GUIDES: Record<string, MathStudyGuide> = {
  "math.m10.l1": {
    opening: ["A sequence lists terms; a series adds them. For terms a₁, a₂, ..., the Nth partial sum Sₙ is the sum through term N. The infinite series converges if these running totals approach one finite number.", "For a series to converge, its individual terms must approach zero. If they do not, the series certainly diverges. The reverse is false: terms can shrink to zero too slowly, as 1/n does in the harmonic series."],
    examples: [
      { question: "Find the sum of Σ from n = 1 to ∞ of 1/[n(n + 1)].", approach: "Rewrite each term as a difference so the finite sum cancels.", steps: ["1/[n(n + 1)] = 1/n - 1/(n + 1).", "The first N terms are (1 - 1/2) + (1/2 - 1/3) + ... + (1/N - 1/(N + 1)) = 1 - 1/(N + 1).", "As N → ∞, the leftover reciprocal approaches zero, so the series sums to 1."], check: "Partial sums remain below 1 and increase toward it." },
      { question: "Can Σ from n = 1 to ∞ of n/(n + 1) converge?", approach: "Before trying a sum formula, check whether its terms vanish.", steps: ["Divide numerator and denominator by n: n/(n + 1) = 1/(1 + 1/n) → 1.", "The terms do not approach zero. A convergent series would require aₙ = Sₙ - Sₙ₋₁ → 0.", "Therefore this series diverges by the term test."], check: "The terms stay close to 1, so adding infinitely many cannot settle at a finite total." },
    ], practice: [
      { question: "Use the term test on Σ(2n + 1)/(n + 4).", hint: "Find the limit of the term, not the partial sum.", solution: ["Divide by n: (2 + 1/n)/(1 + 4/n) → 2.", "Since the terms do not go to zero, the series diverges."] },
      { question: "Does aₙ = 1/n → 0 prove Σ1/n converges?", hint: "The term test has only one direction.", solution: ["No. Term limit zero is necessary but not sufficient.", "The harmonic series Σ1/n diverges; another test or argument is needed to show it."] },
    ], takeaway: "A series is a limit of partial sums. Nonzero term limit proves divergence; zero term limit leaves the question open.",
  },
  "math.m10.l2": {
    opening: ["A geometric series repeats a fixed multiplier r. Starting with a, its terms are a, ar, ar², and so on. When |r| < 1, the remaining powers shrink and the sum is a/(1 - r). If |r| ≥ 1 and a ≠ 0, it does not converge.", "A telescoping series is different: rewrite each term as bₙ - bₙ₊₁ so neighboring terms cancel in a finite partial sum. Always display the first and last surviving terms before sending N to infinity."],
    examples: [
      { question: "Find Σ from n = 0 to ∞ of 3(1/2)ⁿ.", approach: "Identify first term and common ratio.", steps: ["The n = 0 term is 3, so a = 3; each next term multiplies by r = 1/2.", "Since |r| < 1, sum = a/(1 - r) = 3/(1 - 1/2) = 6."], check: "Finite sums 3, 4.5, 5.25, ... rise toward 6." },
      { question: "Find Σ from n = 1 to ∞ of [1/(n + 2) - 1/(n + 3)].", approach: "Write a finite partial sum to see boundary terms.", steps: ["The first terms are (1/3 - 1/4) + (1/4 - 1/5) + ... + (1/(N + 2) - 1/(N + 3)).", "Everything inside cancels, leaving Sₙ = 1/3 - 1/(N + 3).", "As N → ∞, the final reciprocal vanishes. Sum = 1/3."], check: "The first term is 1/3 - 1/4 = 1/12, not 1/3; the total approaches 1/3 over many terms." },
    ], practice: [
      { question: "Find Σ from n = 1 to ∞ of 4(1/3)ⁿ.", hint: "The first term is 4/3, not 4.", solution: ["First term a = 4/3, ratio r = 1/3.", "Sum = (4/3)/(1 - 1/3) = 2."] },
      { question: "Does 1 - 1 + 1 - 1 + ... converge as an ordinary series?", hint: "Its partial sums alternate between two numbers.", solution: ["Partial sums are 1, 0, 1, 0, ... and have no single limit.", "It diverges. Its geometric ratio is -1, on the |r| = 1 boundary."] },
    ], takeaway: "Geometric sums require |r| < 1 and careful starting index. Telescoping requires a finite partial-sum cancellation.",
  },
  "math.m10.l3": {
    opening: ["For positive terms, comparison asks whether a complicated series fits above or below a benchmark. If 0 ≤ aₙ ≤ bₙ eventually and Σbₙ converges, Σaₙ converges. If aₙ ≥ bₙ ≥ 0 and Σbₙ diverges, Σaₙ diverges.", "The integral test connects Σf(n) to ∫f(x)dx when f is continuous, positive, and decreasing eventually. It classifies convergence; the integral is generally not equal to the sum. A key result is the p-series: Σ1/nᵖ converges for p > 1 and diverges for p ≤ 1."],
    examples: [
      { question: "Does Σ from n = 1 to ∞ of 1/n² converge?", approach: "Use the p-series criterion and explain its source via an integral.", steps: ["Here p = 2 > 1. The matching f(x) = 1/x² is positive, continuous, and decreasing for x ≥ 1.", "Its infinite integral converges because ∫ from 1 to b of x⁻² dx = 1 - 1/b → 1.", "The integral test therefore says the series converges; it does not say the sum equals 1."], check: "The series sum is actually larger than 1 because its first term already equals 1." },
      { question: "Show Σ1/(n² + 1) converges by comparison.", approach: "Find a known larger summable term.", steps: ["For n ≥ 1, n² + 1 ≥ n², so 0 < 1/(n² + 1) ≤ 1/n².", "Σ1/n² converges by the p-test.", "The smaller positive series also converges."], check: "Comparison gives classification, not the exact sum." },
    ], practice: [
      { question: "Classify Σ1/√n.", hint: "Write it as Σ1/nᵖ and identify p.", solution: ["1/√n = 1/n^(1/2), so p = 1/2 ≤ 1.", "The p-series diverges."] },
      { question: "Why does aₙ ≤ 1/n with Σ1/n divergent not prove Σaₙ divergent?", hint: "Can a much smaller series converge?", solution: ["A smaller positive series can converge under a divergent upper bound.", "For example, 1/n² ≤ 1/n, but Σ1/n² converges."] },
    ], takeaway: "Check positivity and comparison direction. The p-series threshold is p > 1 for convergence.",
  },
  "math.m10.l4": {
    opening: ["Limit comparison formalizes 'these terms behave like those terms.' For eventually positive aₙ and bₙ, if aₙ/bₙ approaches a positive finite constant, their series either both converge or both diverge. The constant changes size but not the convergence decision.", "Choose bₙ from dominant powers. For example, (3n + 1)/(n³ + 2) behaves like 3/n² because the highest powers are n and n³. Show the ratio limit rather than relying only on appearance."],
    examples: [
      { question: "Classify Σ(3n + 1)/(n³ + 2).", approach: "Compare with bₙ = 1/n².", steps: ["The terms are positive for n ≥ 1. Form aₙ/bₙ = n²(3n + 1)/(n³ + 2).", "Divide top and bottom by n³: (3 + 1/n)/(1 + 2/n³) → 3.", "Since 3 is positive and finite and Σ1/n² converges, the given series converges."], check: "Its leading size is about 3/n², which has a finite total." },
      { question: "Classify Σ(2n² + 1)/(n³ + 5).", approach: "The leading size is 2/n; compare with the harmonic series.", steps: ["Set bₙ = 1/n. The ratio aₙ/bₙ is n(2n² + 1)/(n³ + 5).", "Divide by n³ to get (2 + 1/n²)/(1 + 5/n³) → 2.", "Since Σ1/n diverges, the comparable positive series also diverges."], check: "Term limit still goes to zero; the divergence test alone would be inconclusive." },
    ], practice: [
      { question: "Classify Σ(n² + 3)/(n⁴ + n).", hint: "Compare with 1/n² and compute the ratio.", solution: ["aₙ/(1/n²) = n²(n² + 3)/(n⁴ + n) = (n⁴ + 3n²)/(n⁴ + n) → 1.", "Σ1/n² converges, so the given positive series converges."] },
      { question: "Why does a ratio limit of 0 not fit the standard two-way limit-comparison theorem?", hint: "The theorem needs a positive nonzero finite limit.", solution: ["A zero limit means aₙ is much smaller than bₙ; the terms are not bounded below by a positive multiple of bₙ.", "One-sided comparison may still help, but the two-way equivalence theorem does not apply."] },
    ], takeaway: "Use eventual positivity and show a finite nonzero ratio to transfer a benchmark series' classification.",
  },
  "math.m10.l5": {
    opening: ["The ratio test compares neighboring term magnitudes |aₙ₊₁/aₙ|, often simplifying factorials. The root test examines |aₙ|^(1/n), often simplifying whole expressions raised to n. A limit below 1 gives absolute convergence; above 1 gives divergence; exactly 1 gives no answer.", "Do not turn an inconclusive 1 into 'diverges.' Both Σ1/n and Σ1/n² have ratio limit 1 but different outcomes. Switch to a different test at that boundary."],
    examples: [
      { question: "Classify Σ from n = 0 to ∞ of 3ⁿ/n!.", approach: "Factorials cancel cleanly between adjacent terms.", steps: ["Let aₙ = 3ⁿ/n!. Then |aₙ₊₁/aₙ| = [3^(n+1)/(n+1)!]/[3ⁿ/n!] = 3/(n + 1).", "As n → ∞, the ratio approaches 0 < 1.", "The ratio test gives absolute convergence. It does not by itself give the exact sum."], check: "The factorial eventually grows much faster than repeated multiplication by 3." },
      { question: "Classify Σ from n = 1 to ∞ of [2n/(3n + 1)]ⁿ.", approach: "The entire base is raised to n, so take an nth root.", steps: ["The nth root of the term magnitude is 2n/(3n + 1).", "Divide by n: 2/(3 + 1/n) → 2/3 < 1.", "The root test gives absolute convergence."], check: "For large n the term resembles (2/3)ⁿ, a convergent geometric tail." },
    ], practice: [
      { question: "Use the ratio test on Σn!/5ⁿ.", hint: "Adjacent ratio is (n + 1)/5.", solution: ["aₙ₊₁/aₙ = (n + 1)/5 → ∞, above 1.", "The terms eventually grow, so the series diverges."] },
      { question: "What does the ratio test say about Σ1/n²?", hint: "Compute (n/(n + 1))².", solution: ["The adjacent ratio is (n/(n + 1))² → 1.", "The ratio test is inconclusive; the p-series test proves convergence."] },
    ], takeaway: "Factorials suggest ratios, nth powers suggest roots, and a test limit of 1 means change methods.",
  },
};

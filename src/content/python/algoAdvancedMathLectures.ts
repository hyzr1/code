import {
  guidedLessonContent,
  guidedMasteryAtom,
  guidedMasteryConcept,
  type GuidedMasterySpec,
} from "./guidedMastery";

const ALGO_ADVANCED_MATH_SPECS: GuidedMasterySpec[] = [
  {
    lessonId: "py.ac.m12_1.l1",
    atomId: "py.atom.algo.fast-transforms",
    conceptId: "py.algo.fast-transforms",
    title: "Fast Fourier transform and NTT",
    requires: ["py.algo.modular-arithmetic"],
    vocabulary: [
      ["convolution", "the coefficient list of a product of two polynomials"],
      ["number-theoretic transform", "a Fourier transform done in modular arithmetic with exact integers"],
      ["primitive root", "a value whose powers cycle through every non-zero residue of the modulus"],
    ],
    opening:
      "Multiplying two polynomials term by term costs the product of their lengths. A transform turns that product into a pointwise multiply.",
    outcome:
      "You will convolve two sequences with a number-theoretic transform and confirm it against the direct product.",
    why:
      "Convolution hides inside string matching, big-integer multiplication, counting subset sums and dozens of other problems.",
    mentalModel:
      "Picture moving to a space where multiplication is elementwise, doing the cheap work there, and transforming back. The transform is the change of coordinates.",
    firstTitle: "Exact convolution",
    firstIntro:
      "Working modulo a prime with a known primitive root keeps every value an exact integer, so there is no floating-point error to reason about.",
    firstCode: `MOD, ROOT = 998244353, 3

def transform(values, invert):
    n = len(values)
    values = values[:]
    j = 0
    for i in range(1, n):
        bit = n >> 1
        while j & bit:
            j ^= bit
            bit >>= 1
        j |= bit
        if i < j:
            values[i], values[j] = values[j], values[i]
    length = 2
    while length <= n:
        step = pow(ROOT, (MOD - 1) // length, MOD)
        if invert:
            step = pow(step, MOD - 2, MOD)
        for start in range(0, n, length):
            w = 1
            for k in range(start, start + length // 2):
                u, v = values[k], values[k + length // 2] * w % MOD
                values[k] = (u + v) % MOD
                values[k + length // 2] = (u - v) % MOD
                w = w * step % MOD
        length <<= 1
    if invert:
        inverse = pow(n, MOD - 2, MOD)
        values = [v * inverse % MOD for v in values]
    return values`,
    firstTrace:
      "The transform runs in place with a bit-reversal permutation first. Inverting it reuses the same code with the reciprocal step and a final scale.",
    secondTitle: "Checked against the direct product",
    secondIntro:
      "Any transform implementation deserves a direct comparison. Convolve two short sequences both ways and demand agreement.",
    secondCode: `def multiply(a, b):
    size = 1
    while size < len(a) + len(b):
        size <<= 1
    fa = transform(a + [0] * (size - len(a)), False)
    fb = transform(b + [0] * (size - len(b)), False)
    return transform([x * y % MOD for x, y in zip(fa, fb)], True)

a, b = [1, 2, 3], [4, 5, 6]
print(multiply(a, b)[:5])

direct = [0] * (len(a) + len(b) - 1)
for i, x in enumerate(a):
    for j, y in enumerate(b):
        direct[i + j] += x * y
print(direct)`,
    secondTrace:
      "Both print four, thirteen, twenty-eight, twenty-seven, eighteen. At a million terms the direct method needs a trillion operations and the transform needs twenty million.",
    mistake:
      "Padding to a length that is not a power of two, or one the modulus cannot support. The transform needs a root of unity of exactly that order, and a bad length gives silent garbage.",
    checkpoint:
      "Why prefer the modular transform over a floating-point one?",
    checkpointAnswer:
      "Every value stays an exact integer, so there is no rounding to bound and no risk of a coefficient landing between two integers.",
    remember:
      "Transform, multiply pointwise, transform back.",
    checks: [
      {
        question: "What does a transform turn convolution into?",
        choices: [
          "A pointwise multiplication",
          "A sort",
          "A prefix sum",
        ],
        answer: 0,
        explanation: "That is the entire reason to change coordinates.",
        why: [
          "Correct. The cost then lies in the transforms themselves.",
          "No ordering is involved.",
          "Prefix sums answer a different question.",
        ],
      },
      {
        question: "Why must the padded length be a power of two?",
        choices: [
          "The recursive halving requires it",
          "It makes the modulus prime",
          "It reduces memory",
        ],
        answer: 0,
        explanation: "Each stage splits the array in half.",
        why: [
          "Correct. A root of unity of that exact order is also needed.",
          "The modulus is chosen independently.",
          "Padding increases memory.",
        ],
      },
      {
        question: "What does the modular version avoid?",
        choices: [
          "Floating-point rounding error",
          "The need to pad",
          "The bit-reversal step",
        ],
        answer: 0,
        explanation: "Every intermediate is an exact residue.",
        why: [
          "Correct. Coefficients come back exact.",
          "Padding is still required.",
          "Bit reversal is still required.",
        ],
      },
    ],
  },
  {
    lessonId: "py.ac.m12_1.l2",
    atomId: "py.atom.algo.chinese-remainder",
    conceptId: "py.algo.chinese-remainder",
    title: "Chinese Remainder Theorem",
    requires: ["py.algo.fast-transforms"],
    vocabulary: [
      ["congruence", "a constraint of the form: this value leaves this remainder under this modulus"],
      ["compatible constraints", "constraints that agree wherever their moduli share a factor"],
      ["combined modulus", "the least common multiple of the individual moduli"],
    ],
    opening:
      "Several remainders under several moduli usually pin down a single value. The theorem says exactly when, and the construction says which.",
    outcome:
      "You will merge congruences pairwise, detect incompatible ones, and reconstruct the combined answer.",
    why:
      "Splitting a computation across small coprime moduli and recombining is how exact arithmetic beats overflow in practice.",
    mentalModel:
      "Picture each congruence as an arithmetic progression on the number line. Merging two is finding where the progressions intersect, which is itself a progression.",
    firstTitle: "Merging two at a time",
    firstIntro:
      "Two congruences agree only if their remainders match modulo the greatest common divisor of their moduli. When they do, the merge steps forward by that divisor.",
    firstCode: `from math import gcd

def merge(pairs):
    result, modulus = 0, 1
    for remainder, m in pairs:
        g = gcd(modulus, m)
        if (remainder - result) % g:
            return None
        reduced = m // g
        step = (remainder - result) // g % reduced
        shift = step * pow(modulus // g, -1, reduced) % reduced if reduced > 1 else 0
        result = (result + modulus * shift) % (modulus // g * m)
        modulus = modulus // g * m
    return result, modulus

print(merge([(2, 3), (3, 5), (2, 7)]))`,
    firstTrace:
      "Twenty-three modulo one hundred and five. Checking it back: twenty-three leaves two under three, three under five and two under seven.",
    secondTitle: "Overlapping moduli",
    secondIntro:
      "Coprime moduli always merge. Sharing a factor is where the theorem has something to say, and where a naive implementation returns nonsense.",
    secondCode: `print(merge([(1, 4), (3, 6)]))
print(merge([(1, 4), (2, 6)]))`,
    secondTrace:
      "The first merges to nine modulo twelve. The second returns nothing: one is odd and two is even, so no value satisfies both.",
    mistake:
      "Assuming the moduli are coprime and multiplying them for the combined modulus. When they share a factor the answer is the least common multiple, and the product overcounts.",
    checkpoint:
      "When do two congruences have no common solution?",
    checkpointAnswer:
      "When their remainders differ modulo the greatest common divisor of the two moduli.",
    remember:
      "Merge pairwise, check the divisor, take the least common multiple.",
    checks: [
      {
        question: "What is the modulus after merging two compatible congruences?",
        choices: [
          "The least common multiple of the two moduli",
          "Their product",
          "The larger of the two",
        ],
        answer: 0,
        explanation: "The product only works when they are coprime.",
        why: [
          "Correct. It equals the product when they share no factor.",
          "That overcounts on shared factors.",
          "The merge constrains more than either alone.",
        ],
      },
      {
        question: "Two congruences share a factor and disagree on it. What follows?",
        choices: [
          "There is no solution at all",
          "There are two solutions",
          "The smaller modulus wins",
        ],
        answer: 0,
        explanation: "Both constraints must hold simultaneously.",
        why: [
          "Correct. The merge must report failure.",
          "Solutions come in one progression or none.",
          "Neither constraint may be discarded.",
        ],
      },
      {
        question: "Why compute in several small moduli and recombine?",
        choices: [
          "Each computation stays inside machine word arithmetic",
          "It reduces the number of operations",
          "It avoids needing division",
        ],
        answer: 0,
        explanation: "The alternative is arbitrary-precision arithmetic.",
        why: [
          "Correct. The recombination restores the exact value.",
          "It multiplies the operation count.",
          "Modular inverses are still needed.",
        ],
      },
    ],
  },
  {
    lessonId: "py.ac.m12_1.l3",
    atomId: "py.atom.algo.mobius-inversion",
    conceptId: "py.algo.mobius-inversion",
    title: "Mobius inversion and sieves",
    requires: ["py.algo.chinese-remainder"],
    vocabulary: [
      ["Mobius function", "a value of one, minus one or zero depending on a number's prime factorisation"],
      ["divisor sum", "a quantity expressed as a sum over the divisors of an argument"],
      ["inversion", "recovering the summand from the divisor sum"],
    ],
    opening:
      "Counting things with a shared factor is easy. Counting things with no shared factor is what you usually want, and inversion converts one into the other.",
    outcome:
      "You will sieve the Mobius function and use it to count coprime pairs without testing any pair.",
    why:
      "Direct coprimality testing costs a greatest common divisor per pair. Inversion replaces that with a single pass over divisors.",
    mentalModel:
      "Imagine counting every pair, subtracting those sharing a two, subtracting those sharing a three, then adding back those sharing a six. The Mobius function is exactly that alternating pattern.",
    firstTitle: "Sieving the function",
    firstIntro:
      "It is one for a product of an even number of distinct primes, minus one for an odd number, and zero whenever a prime appears squared.",
    firstCode: `def mobius_sieve(n):
    mu = [1] * (n + 1)
    smallest = [0] * (n + 1)
    primes = []
    for i in range(2, n + 1):
        if smallest[i] == 0:
            smallest[i] = i
            primes.append(i)
            mu[i] = -1
        for p in primes:
            if p > smallest[i] or i * p > n:
                break
            smallest[i * p] = p
            mu[i * p] = 0 if p == smallest[i] else -mu[i]
    return mu

print(mobius_sieve(20)[1:13])`,
    firstTrace:
      "One, minus one, minus one, zero, minus one, one, minus one, zero, zero, one, minus one, zero. Four and eight and nine are zero because a prime repeats.",
    secondTitle: "Counting coprime pairs",
    secondIntro:
      "The number of pairs both divisible by a value is the square of how many multiples it has. Weight those counts by the Mobius function and the shared factors cancel.",
    secondCode: `from math import gcd

def coprime_pairs(n):
    mu = mobius_sieve(n)
    return sum(mu[d] * (n // d) ** 2 for d in range(1, n + 1))

for n in (5, 10, 100):
    brute = sum(1 for a in range(1, n + 1) for b in range(1, n + 1)
                if gcd(a, b) == 1)
    print(n, coprime_pairs(n), brute)`,
    secondTrace:
      "Nineteen, sixty-three and six thousand and eighty-seven, matching the brute-force count each time. The sieve did it in one pass instead of ten thousand comparisons.",
    mistake:
      "Sieving the Mobius function inside a loop over queries. It depends only on the bound, so compute it once and reuse it across every query.",
    checkpoint:
      "Why is the Mobius function zero at four?",
    checkpointAnswer:
      "Because four is two squared, and a repeated prime factor makes the alternating count collapse to nothing.",
    remember:
      "Count with a shared factor, weight by Mobius, and the sharing cancels.",
    checks: [
      {
        question: "What makes the Mobius function zero?",
        choices: [
          "A repeated prime factor",
          "An even number of prime factors",
          "Being prime",
        ],
        answer: 0,
        explanation: "Squarefree numbers are the ones with a non-zero value.",
        why: [
          "Correct. Four, eight, nine and twelve are all zero.",
          "That gives one, not zero.",
          "Primes give minus one.",
        ],
      },
      {
        question: "How many pairs below n share a common divisor d?",
        choices: [
          "The square of the count of multiples of d",
          "The count of multiples of d",
          "n divided by d",
        ],
        answer: 0,
        explanation: "Both members must be a multiple.",
        why: [
          "Correct. Each member is chosen independently.",
          "That counts single values, not pairs.",
          "That is the count of multiples itself.",
        ],
      },
      {
        question: "What replaces per-pair greatest-common-divisor testing?",
        choices: [
          "A single weighted pass over divisors",
          "Sorting the values",
          "A hash table of factors",
        ],
        answer: 0,
        explanation: "The Mobius weights do the cancelling.",
        why: [
          "Correct. Quadratic work becomes near linear.",
          "Order is irrelevant here.",
          "Factorisations are not stored per value.",
        ],
      },
    ],
  },
  {
    lessonId: "py.ac.m12_1.l4",
    atomId: "py.atom.algo.gf2-linear-algebra",
    conceptId: "py.algo.gf2-linear-algebra",
    title: "Linear algebra over GF(2)",
    requires: ["py.algo.mobius-inversion"],
    vocabulary: [
      ["GF(2)", "arithmetic where addition is exclusive or and every value is zero or one"],
      ["linear basis", "a smallest set of values whose combinations reproduce every reachable value"],
      ["rank", "the size of that basis, which fixes how many distinct combinations exist"],
    ],
    opening:
      "Exclusive or is addition without carrying, which makes a set of integers a vector space. Gaussian elimination then works on machine words directly.",
    outcome:
      "You will reduce a set of values to a basis, read off the rank, and use it to maximise an exclusive-or combination.",
    why:
      "Parity constraints, switch-flipping puzzles and maximum-xor subsets are all the same linear system in disguise.",
    mentalModel:
      "Picture each integer as a row of bits. Elimination clears leading bits until what remains is independent, and that remainder is the basis.",
    firstTitle: "Building the basis",
    firstIntro:
      "Reduce each incoming value against the basis so far. If anything survives, it is independent and joins the basis.",
    firstCode: `def build_basis(values):
    basis = []
    for value in values:
        for b in basis:
            value = min(value, value ^ b)
        if value:
            basis.append(value)
            basis.sort(reverse=True)
    return basis

rows = [0b1101, 0b1011, 0b0110, 0b1101]
basis = build_basis(rows)
print([bin(b) for b in basis], "rank", len(basis))
print("reachable values", 2 ** len(basis))`,
    firstTrace:
      "Four rows collapse to a basis of two, so only four values are reachable. The third row was the exclusive or of the first two, and the fourth repeated the first.",
    secondTitle: "Maximising a combination",
    secondIntro:
      "Once the basis is reduced, take each element in turn and keep it whenever it raises the running value. Greedy is optimal here.",
    secondCode: `def max_xor(values):
    basis = build_basis(values)
    best = 0
    for b in basis:
        best = max(best, best ^ b)
    return best

values = [8, 1, 2, 12]
print(max_xor(values))
print(max(a ^ b ^ c ^ d
          for a in (0, 8) for b in (0, 1)
          for c in (0, 2) for d in (0, 12)))`,
    secondTrace:
      "Both give fifteen. The greedy walk over a reduced basis matches an exhaustive search over all sixteen subsets.",
    mistake:
      "Forgetting that rank, not element count, bounds the answers. Adding a value already in the span changes nothing, and a solver that recomputes on every insert wastes the work.",
    checkpoint:
      "Sixty values reduce to a basis of six. How many distinct combinations exist?",
    checkpointAnswer:
      "Sixty-four — two to the rank. The other fifty-four values add nothing new.",
    remember:
      "Reduce to a basis, read the rank, then walk it greedily.",
    checks: [
      {
        question: "What operation plays the role of addition over GF(2)?",
        choices: ["Exclusive or", "Ordinary addition", "Multiplication"],
        answer: 0,
        explanation: "It is addition with the carries dropped.",
        why: [
          "Correct. Each bit adds independently modulo two.",
          "Carrying breaks the field structure.",
          "Multiplication is bitwise and here.",
        ],
      },
      {
        question: "How many distinct values can a basis of rank r produce?",
        choices: ["Two to the r", "r", "r squared"],
        answer: 0,
        explanation: "Each basis element is either used or not.",
        why: [
          "Correct. Every subset gives a distinct combination.",
          "That counts the basis, not the span.",
          "The growth is exponential, not quadratic.",
        ],
      },
      {
        question: "Why is the greedy maximum-xor walk correct?",
        choices: [
          "Each basis element owns a leading bit no later element can affect",
          "Because the values were sorted",
          "Because exclusive or is commutative",
        ],
        answer: 0,
        explanation: "Think about which bit each reduced element controls.",
        why: [
          "Correct. The decision on the high bit is never regretted.",
          "Sorting alone would not justify it.",
          "Commutativity does not imply greedy optimality.",
        ],
      },
    ],
  },
  {
    lessonId: "py.ac.m12_1.l5",
    atomId: "py.atom.algo.generating-functions",
    conceptId: "py.algo.generating-functions",
    title: "Generating functions",
    requires: ["py.algo.gf2-linear-algebra"],
    vocabulary: [
      ["generating function", "a formal series whose coefficient at k counts the objects of size k"],
      ["formal series", "a coefficient list treated algebraically, with no question of convergence"],
      ["coefficient extraction", "reading the count for one size out of a product of series"],
    ],
    opening:
      "Encode a counting problem as a series, multiply the series together, and the answer is a coefficient. The algebra does the case analysis.",
    outcome:
      "You will build a series per coin, multiply them, and read change-making counts off the product.",
    why:
      "Once a problem is a product of series, transforms multiply them quickly and closed forms sometimes drop out for free.",
    mentalModel:
      "Picture each choice as its own series listing what that choice can contribute. Multiplying series enumerates every combination of choices at once.",
    firstTitle: "One series per coin",
    firstIntro:
      "A coin of value c contributes at positions that are multiples of c. Multiplying its series in accounts for using it any number of times.",
    firstCode: `def multiply(a, b, cap):
    out = [0] * (cap + 1)
    for i, x in enumerate(a):
        if x == 0:
            continue
        for j, y in enumerate(b):
            if i + j > cap:
                break
            out[i + j] += x * y
    return out

def coin_ways(coins, cap):
    ways = [1] + [0] * cap
    for c in coins:
        ways = multiply(ways, [1 if k % c == 0 else 0
                               for k in range(cap + 1)], cap)
    return ways

print(coin_ways([1, 2, 5], 10))`,
    firstTrace:
      "One, one, two, two, three, four, five, six, seven, eight, ten. There are ten ways to make ten from coins of one, two and five.",
    secondTitle: "The same answer, twice",
    secondIntro:
      "The familiar table-based counting is the same computation with the multiplication written out by hand. Seeing them agree makes the correspondence concrete.",
    secondCode: `def table_ways(coins, cap):
    table = [1] + [0] * cap
    for c in coins:
        for value in range(c, cap + 1):
            table[value] += table[value - c]
    return table

print(table_ways([1, 2, 5], 10))`,
    secondTrace:
      "Identical output. The series view explains why the coin loop must sit outside the value loop: each coin's series multiplies in exactly once.",
    mistake:
      "Treating the series as a function to evaluate. It is formal - a coefficient list under multiplication — and questions of convergence never arise.",
    checkpoint:
      "What does the coefficient at position k of a product of series mean?",
    checkpointAnswer:
      "The number of ways to reach total k by picking one contribution from each factor.",
    remember:
      "One series per choice, multiply, read the coefficient.",
    checks: [
      {
        question: "What does multiplying two generating functions enumerate?",
        choices: [
          "Every pairing of one contribution from each",
          "The larger of the two counts",
          "The sum of the two counts",
        ],
        answer: 0,
        explanation: "Look at how the coefficient at k is formed.",
        why: [
          "Correct. That is exactly a convolution.",
          "Multiplication combines rather than selects.",
          "Adding series would count alternatives, not combinations.",
        ],
      },
      {
        question: "Why is the series called formal?",
        choices: [
          "It is manipulated as coefficients, never evaluated",
          "Because it is infinite",
          "Because the coefficients are integers",
        ],
        answer: 0,
        explanation: "Convergence never enters the argument.",
        why: [
          "Correct. There is no value substituted in.",
          "Length is not what makes it formal.",
          "Coefficients may be rational or worse.",
        ],
      },
      {
        question: "How does a transform help here?",
        choices: [
          "It multiplies long series far faster",
          "It extracts coefficients directly",
          "It removes the need for a cap",
        ],
        answer: 0,
        explanation: "Series multiplication is convolution.",
        why: [
          "Correct. That is the connection to the transform lesson.",
          "Extraction is just indexing.",
          "A cap is still needed to bound the work.",
        ],
      },
    ],
  },
  {
    lessonId: "py.ac.m12_1.l6",
    atomId: "py.atom.algo.inclusion-exclusion",
    conceptId: "py.algo.inclusion-exclusion",
    title: "Inclusion-exclusion",
    requires: ["py.algo.generating-functions"],
    vocabulary: [
      ["inclusion-exclusion", "counting a union by alternately adding and subtracting intersections"],
      ["intersection term", "the count of items satisfying one particular subset of the conditions"],
      ["derangement", "a permutation leaving no element in its original position"],
    ],
    opening:
      "Adding the sizes of overlapping sets counts the overlaps twice. Subtracting the pairs overcorrects the triples. The alternating pattern is the fix.",
    outcome:
      "You will count a union over subsets with alternating signs, and apply the same pattern to derangements.",
    why:
      "Whenever a condition is easy to count one at a time but the conditions overlap, this is the tool that assembles them correctly.",
    mentalModel:
      "Picture overlapping circles. Add all of them, subtract every pairwise overlap, add back every triple overlap, and every region ends up counted exactly once.",
    firstTitle: "Counting a union",
    firstIntro:
      "Iterate over every non-empty subset of the conditions. The sign is positive for odd-sized subsets and negative for even ones.",
    firstCode: `def divisible_by_any(n, primes):
    total = 0
    for mask in range(1, 1 << len(primes)):
        product, bits = 1, 0
        for i, p in enumerate(primes):
            if mask >> i & 1:
                product *= p
                bits += 1
        term = n // product
        total += term if bits % 2 else -term
    return total

n, primes = 100, [2, 3, 5]
print(divisible_by_any(n, primes))
print(sum(1 for i in range(1, n + 1)
          if any(i % p == 0 for p in primes)))`,
    firstTrace:
      "Seventy-four both ways. Subtracting from a hundred leaves twenty-six values sharing no factor with thirty, which is the coprime count.",
    secondTitle: "Derangements",
    secondIntro:
      "Count permutations that fix nothing by starting from all of them and removing those fixing at least one position, with the same alternating correction.",
    secondCode: `def derangements(n):
    factorial = [1]
    for i in range(1, n + 1):
        factorial.append(factorial[-1] * i)
    total = 0
    for k in range(n + 1):
        term = factorial[n] // factorial[k]
        total += term if k % 2 == 0 else -term
    return total

print([derangements(n) for n in range(8)])`,
    secondTrace:
      "One, zero, one, two, nine, forty-four, two hundred sixty-five, one thousand eight hundred fifty-four. A single element can never be deranged, which is the zero.",
    mistake:
      "Iterating over subsets when there are forty conditions. The cost doubles with each one, so past about twenty you need a smarter decomposition rather than a faster loop.",
    checkpoint:
      "Why does the sign alternate with subset size?",
    checkpointAnswer:
      "Because an item in several sets is added once per set, removed once per pair, added once per triple, and the alternation makes those cancel to exactly one.",
    remember:
      "Add the singles, subtract the pairs, add the triples.",
    checks: [
      {
        question: "What sign does a three-condition intersection carry?",
        choices: ["Positive", "Negative", "It depends on the values"],
        answer: 0,
        explanation: "Odd-sized subsets are added.",
        why: [
          "Correct. Odd adds, even subtracts.",
          "Pairs are subtracted, not triples.",
          "The sign depends only on the subset size.",
        ],
      },
      {
        question: "How does the cost grow with the number of conditions?",
        choices: [
          "It doubles with each one",
          "It grows linearly",
          "It grows with the square",
        ],
        answer: 0,
        explanation: "Every subset is enumerated.",
        why: [
          "Correct. Past about twenty conditions this is unusable.",
          "Each condition doubles the subset count.",
          "Subsets are exponential, not quadratic.",
        ],
      },
      {
        question: "Why is the derangement count zero for one element?",
        choices: [
          "The single element must map to itself",
          "The formula is undefined there",
          "By convention",
        ],
        answer: 0,
        explanation: "There is only one permutation available.",
        why: [
          "Correct. It is fixed, so nothing is deranged.",
          "The formula gives zero correctly.",
          "It follows from the definition.",
        ],
      },
    ],
  },
];

export const ALGO_ADVANCED_MATH_ATOMS = ALGO_ADVANCED_MATH_SPECS.map(guidedMasteryAtom);
export const ALGO_ADVANCED_MATH_CONCEPTS = ALGO_ADVANCED_MATH_SPECS.map(guidedMasteryConcept);
export const ALGO_ADVANCED_MATH_LESSON_CONTENT = guidedLessonContent(ALGO_ADVANCED_MATH_SPECS);

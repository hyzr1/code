import type { LectureQuestion } from "../../types";
import {
  guidedLessonContent,
  guidedMasteryAtom,
  guidedMasteryConcept,
  type GuidedMasterySpec,
} from "./guidedMastery";

const q = (
  question: string,
  choices: [string, string, string],
  answer: 0 | 1 | 2,
  explanation: string,
  why: [string, string, string],
): LectureQuestion => ({ question, choices, answer, explanation, why });

const ALGO_NUMBER_THEORY_SPECS: GuidedMasterySpec[] = [
  {
    lessonId: "py.ac.m8_1.l1",
    atomId: "py.atom.algo.gcd-euclid",
    conceptId: "py.algo.gcd-euclid",
    title: "Euclid's algorithm, and what it also gives you",
    requires: ["py.algo.manacher"],
    vocabulary: [
      ["greatest common divisor", "the largest integer dividing both of two numbers"],
      ["least common multiple", "the smallest positive integer both numbers divide"],
      ["extended Euclid", "the version that also finds coefficients solving a linear equation"],
      ["coprime", "sharing no common divisor other than one"],
    ],
    opening: "Repeatedly replacing a pair with the smaller number and the remainder is one of the oldest algorithms there is, and it is still the fastest way to answer a surprising range of questions. The extended version does more, and costs nothing extra.",
    outcome: "You will compute a greatest common divisor by remainders, derive the least common multiple from it, and read off the coefficients the extended version produces.",
    why: "Modular inverses, fraction reduction and several counting problems all reduce to this. The extended coefficients are what make modular arithmetic work, so the two lessons are really one.",
    mentalModel: "Picture tiling a rectangle with the largest possible square tiles. Cut off the biggest square you can, repeat on what is left, and the last square you cut is the answer.",
    firstTitle: "Remainders shrink fast",
    firstIntro: "Each step replaces the pair with the smaller number and the remainder, which halves the total within two steps.",
    firstCode: `def gcd(a, b):
    steps = 0
    while b:
        a, b = b, a % b
        steps += 1
    return a, steps

def lcm(a, b):
    return a * b // gcd(a, b)[0]

for pair in ((240, 46), (12, 18), (17, 5), (100, 0)):
    value, steps = gcd(*pair)
    print(f"gcd{pair} = {value} in {steps} steps")

print("lcm(4, 6) =", lcm(4, 6))
print("lcm(21, 6) =", lcm(21, 6))`,
    firstTrace: "Even a pair in the hundreds resolves in a handful of steps, because a remainder is always strictly smaller than what it divides. The least common multiple comes free, since the product of two numbers is always their divisor times their multiple. Dividing before multiplying is what keeps that formula from overflowing on large inputs.",
    secondTitle: "The extended version solves an equation as it goes",
    secondIntro: "Alongside the divisor it produces two integers satisfying a times x plus b times y equals that divisor.",
    secondCode: `def extended(a, b):
    if b == 0:
        return (a, 1, 0)
    divisor, x, y = extended(b, a % b)
    return (divisor, y, x - (a // b) * y)

for a, b in ((240, 46), (3, 7), (12, 18)):
    divisor, x, y = extended(a, b)
    print(f"{a}*{x} + {b}*{y} = {a * x + b * y}  (gcd {divisor})")`,
    secondTrace: "Each line is an exact identity, checkable by substitution. The coefficients are often negative, which is expected and is what makes the equation solvable at all. When the divisor is one the numbers are coprime, and that is exactly the situation where a modular inverse exists.",
    mistake: "Do not compute the least common multiple as the product divided by the divisor without dividing first. On large inputs the product overflows in languages with fixed-width integers, and dividing one factor before multiplying avoids it entirely.",
    checkpoint: "The extended algorithm returns a divisor of one. What does that permit?",
    checkpointAnswer: "A modular inverse. The coefficient on the first number, reduced by the modulus, is that number's inverse, because the identity says their product differs from one by a multiple of the modulus. A divisor larger than one means no inverse exists.",
    remember: "Replace the pair with the smaller number and the remainder until nothing is left. The extended version returns coefficients for free, and a divisor of one is what makes an inverse exist.",
    checks: [
      q("Why does Euclid's algorithm terminate quickly?", ["Each remainder is strictly smaller than what it divides", "The numbers are sorted first", "It halves both numbers each step"], 0, "The pair shrinks fast.", ["Correct. Two steps at least halve the larger value.", "Sorting happens implicitly and is not the reason.", "Only one of the two is replaced."]),
      q("What does the extended version add?", ["Coefficients satisfying a linear equation", "A faster divisor computation", "The least common multiple"], 0, "Those coefficients are what inverses need.", ["Correct. It costs nothing extra to track them.", "The speed is identical.", "That follows from the divisor alone."]),
      q("A divisor of one between two numbers means what?", ["They are coprime, so a modular inverse exists", "One of them is one", "They are both prime"], 0, "Coprimality is the condition for an inverse.", ["Correct. That is what the extended coefficients then give.", "Neither number need be one.", "Nine and ten are coprime and neither is prime."]),
    ],
  },
  {
    lessonId: "py.ac.m8_1.l2",
    atomId: "py.atom.algo.sieve",
    conceptId: "py.algo.sieve",
    title: "The sieve, and the table it can store instead",
    requires: ["py.algo.gcd-euclid"],
    vocabulary: [
      ["sieve of Eratosthenes", "marking multiples of each prime to find every prime in a range"],
      ["smallest prime factor", "the least prime dividing a number"],
      ["factorization", "writing a number as a product of primes"],
      ["preprocessing", "paying a one-off cost so later queries are cheap"],
    ],
    opening: "Testing one number for primality is easy. Answering the question for every number up to a million, or factorizing thousands of them, is a different problem, and the answer is to build a table once rather than repeat the work.",
    outcome: "You will build a sieve that stores the smallest prime factor of every number, and use it to factorize in a few steps.",
    why: "Any problem asking about divisors across a range wants this table. Storing the smallest factor rather than a boolean costs the same memory and answers far more questions.",
    mentalModel: "Picture crossing out every second number, then every third, and so on. Instead of just crossing out, write down which prime did the crossing, and the table remembers how each number was built.",
    firstTitle: "Store the factor, not just the flag",
    firstIntro: "Starting each prime's marking at its own square is what keeps the sieve efficient.",
    firstCode: `def sieve(limit):
    smallest = list(range(limit + 1))
    factor = 2
    while factor * factor <= limit:
        if smallest[factor] == factor:
            for multiple in range(factor * factor, limit + 1, factor):
                if smallest[multiple] == multiple:
                    smallest[multiple] = factor
        factor += 1
    return smallest

table = sieve(50)
primes = [n for n in range(2, 51) if table[n] == n]
print("primes up to 50:", primes)
print("smallest factor of 49:", table[49])
print("smallest factor of 51 is not in this table")`,
    firstTrace: "A number whose smallest factor is itself has never been crossed out, which makes it prime. Marking can start at the square of each prime, because every smaller multiple already carries a smaller prime's mark. The condition on the inner loop keeps the first prime that reached a number rather than the last.",
    secondTitle: "Factorizing becomes a short walk",
    secondIntro: "Divide by the stored factor and look up the quotient, repeatedly.",
    secondCode: `def sieve(limit):
    smallest = list(range(limit + 1))
    factor = 2
    while factor * factor <= limit:
        if smallest[factor] == factor:
            for multiple in range(factor * factor, limit + 1, factor):
                if smallest[multiple] == multiple:
                    smallest[multiple] = factor
        factor += 1
    return smallest

def factorise(n, smallest):
    counts = {}
    while n > 1:
        prime = smallest[n]
        counts[prime] = counts.get(prime, 0) + 1
        n //= prime
    return counts

table = sieve(1000)
for n in (360, 97, 1000, 512):
    print(n, factorise(n, table))`,
    secondTrace: "Each step removes one prime factor, so the walk is as long as the total number of factors, which is at most about twenty for values under a million. A prime returns itself once. Without the table the same work would need trial division on every query.",
    mistake: "Do not rebuild the sieve inside a loop over queries. The whole point is that the table is built once and reused, and constructing it per query turns a linear preprocessing cost into a quadratic one.",
    checkpoint: "Why can each prime start marking at its own square rather than at twice itself?",
    checkpointAnswer: "Because every multiple under the square has a factor smaller than that prime, so a smaller prime has already marked it. Starting later skips work that is provably redundant, and it is what brings the sieve's total cost down.",
    remember: "Store each number's smallest prime factor rather than a boolean. Marking starts at each prime's square, and factorizing afterwards is a short chain of divisions.",
    checks: [
      q("What does a number whose stored factor equals itself tell you?", ["It is prime", "It is a perfect square", "It is even"], 0, "Nothing ever crossed it out.", ["Correct. That is how the primes are read off.", "Squares are marked by their root's prime.", "Even numbers are marked by two."]),
      q("Why start each prime's marking at its square?", ["Smaller multiples already carry a smaller prime's mark", "It saves memory", "Squares are easier to compute"], 0, "The skipped work is provably redundant.", ["Correct. That is what makes the sieve efficient.", "The table size is unchanged.", "Ease of computation is not the reason."]),
      q("How long is a factorization walk with the table?", ["As many steps as the number has prime factors", "As many steps as the number itself", "One step"], 0, "Each step removes one factor.", ["Correct. That is about twenty at most under a million.", "That would be trial division.", "Only a prime finishes in one."]),
    ],
  },
  {
    lessonId: "py.ac.m8_1.l3",
    atomId: "py.atom.algo.modular-arithmetic",
    conceptId: "py.algo.modular-arithmetic",
    title: "Modular arithmetic, inverses and fast powers",
    requires: ["py.algo.sieve"],
    vocabulary: [
      ["modulus", "the number results are reduced by"],
      ["modular inverse", "the value whose product with a number is one under the modulus"],
      ["fast exponentiation", "raising to a power by repeated squaring"],
      ["Fermat's little theorem", "a shortcut giving an inverse when the modulus is prime"],
    ],
    opening: "Counting problems produce numbers with thousands of digits, and the answer is almost always wanted modulo a large prime. Everything works as expected under a modulus except division, which needs replacing with something else entirely.",
    outcome: "You will reduce products safely, compute a modular inverse two ways, and raise to a large power by squaring.",
    why: "Every competitive counting problem is stated modulo a prime, and division is where solutions silently go wrong. Fast exponentiation is also the operation underneath most cryptography.",
    mentalModel: "Picture a clock face. Adding and multiplying wrap around harmlessly, but halving is meaningless unless you know which hour doubles to the one you have.",
    firstTitle: "Division is replaced by multiplication",
    firstIntro: "There is no division under a modulus, only multiplication by an inverse.",
    firstCode: `MOD = 1_000_000_007

def extended(a, b):
    if b == 0:
        return (a, 1, 0)
    divisor, x, y = extended(b, a % b)
    return (divisor, y, x - (a // b) * y)

def inverse(a, m):
    divisor, x, _ = extended(a % m, m)
    return None if divisor != 1 else x % m

for a, m in ((3, 7), (10, 1000000007), (2, 4)):
    result = inverse(a, m)
    if result is None:
        print(f"{a} has no inverse modulo {m}")
    else:
        print(f"inverse of {a} mod {m} is {result}, check {a * result % m}")`,
    firstTrace: "Each successful line multiplies back to one, which is the definition being satisfied. Two has no inverse modulo four, because they share a factor and no multiple of two is ever one more than a multiple of four. That failure is the whole reason the modulus is usually chosen prime.",
    secondTitle: "Squaring turns a huge exponent into a short chain",
    secondIntro: "Halving the exponent at each step means about thirty operations for an exponent of a billion.",
    secondCode: `MOD = 1_000_000_007

def power(base, exponent, modulus):
    result = 1
    base %= modulus
    steps = 0
    while exponent:
        if exponent & 1:
            result = result * base % modulus
        base = base * base % modulus
        exponent >>= 1
        steps += 1
    return result, steps

for exponent in (10, 1000, 10 ** 9):
    value, steps = power(3, exponent, MOD)
    print(f"3^{exponent} mod p = {value} in {steps} steps")

print("inverse of 3 by Fermat:", power(3, MOD - 2, MOD)[0])`,
    secondTrace: "An exponent of a billion takes thirty steps rather than a billion, because each step halves it. Reducing after every multiplication is what keeps the intermediate values small. When the modulus is prime, raising to the modulus minus two gives the inverse directly, which is usually the shortest route.",
    mistake: "Do not divide by a number and then reduce by the modulus. Integer division discards a remainder that the modulus would have carried, so the answer is wrong in a way that looks plausible, and the fix is to multiply by the inverse instead.",
    checkpoint: "Why does Fermat's shortcut require the modulus to be prime?",
    checkpointAnswer: "Because the theorem it rests on only holds for a prime modulus. With a composite modulus the exponent that returns one is different, and some values have no inverse at all, so the extended algorithm is the only reliable route.",
    remember: "Under a modulus, division becomes multiplication by an inverse. Fast exponentiation halves the exponent each step, and a prime modulus makes the inverse a single power.",
    checks: [
      q("How is division performed under a modulus?", ["Multiply by the modular inverse", "Divide and then reduce", "Reduce and then divide"], 0, "Integer division discards a remainder that matters.", ["Correct. The inverse is what replaces it.", "That silently loses information.", "The order does not rescue it."]),
      q("Why does 2 have no inverse modulo 4?", ["They share a factor, so no product is ever one more than a multiple of 4", "Four is too small", "Two is prime"], 0, "An inverse needs coprimality.", ["Correct. This is why prime moduli are preferred.", "Size is not the obstacle.", "Two being prime does not help here."]),
      q("How many steps does fast exponentiation take for an exponent near a billion?", ["About thirty", "About a thousand", "About a billion"], 0, "Each step halves the exponent.", ["Correct. That is the base-two logarithm.", "That would be a much smaller exponent.", "That is the naive approach."]),
    ],
  },
  {
    lessonId: "py.ac.m8_1.l4",
    atomId: "py.atom.algo.combinatorics",
    conceptId: "py.algo.combinatorics",
    title: "Counting arrangements, selections and distributions",
    requires: ["py.algo.modular-arithmetic"],
    vocabulary: [
      ["permutation", "an ordered arrangement of a selection"],
      ["combination", "an unordered selection"],
      ["Pascal's rule", "each entry being the sum of the two above it"],
      ["stars and bars", "counting the ways to split a total among labelled groups"],
    ],
    opening: "Almost every counting problem is one of three questions in disguise. Does order matter, may items repeat, and are the containers distinguishable? Answering those three fixes the formula before you write anything.",
    outcome: "You will choose between permutations and combinations, build Pascal's triangle, and apply stars and bars to a distribution problem.",
    why: "Counting appears constantly inside dynamic programming and probability questions, and getting the ordering assumption wrong is the most common source of an answer that is off by a factorial.",
    mentalModel: "Picture handing out identical sweets to named children versus arranging named children in a line. The first ignores order and the second is entirely about it, and confusing them is what most counting errors are.",
    firstTitle: "Order in, order out",
    firstIntro: "The only difference between the two counts is dividing out the orderings of what was chosen.",
    firstCode: `from math import comb, factorial

def permutations(n, k):
    return factorial(n) // factorial(n - k)

for n, k in ((5, 2), (10, 3), (5, 5)):
    print(f"n={n} k={k}: permutations {permutations(n, k):>6}  "
          f"combinations {comb(n, k):>6}  ratio {factorial(k)}")`,
    firstTrace: "The two counts differ by exactly the number of ways to order the chosen items. Selecting all five of five gives one combination and a hundred and twenty permutations, which is the clearest illustration of the ratio. Deciding whether order matters is therefore the whole of the modelling work.",
    secondTitle: "Pascal's rule and stars and bars",
    secondIntro: "One builds combinations without factorials, and the other counts distributions.",
    secondCode: `from math import comb

def pascal(rows):
    triangle = [[1]]
    for _ in range(rows - 1):
        previous = triangle[-1]
        row = [1] + [previous[i] + previous[i + 1]
                     for i in range(len(previous) - 1)] + [1]
        triangle.append(row)
    return triangle

for row in pascal(5):
    print(row)

print()
print("3 identical sweets among 4 children:", comb(3 + 4 - 1, 4 - 1))
print("each child getting at least one, 5 sweets:", comb(5 - 1, 4 - 1))`,
    secondTrace: "Each entry is the sum of the two that produced it, which is the statement that an item is either chosen or it is not. Stars and bars counts twenty ways to split three identical items among four children, by placing three dividers among the items. Requiring each child to receive one is the same problem after handing out one each first.",
    mistake: "Do not use stars and bars when the items are distinguishable. The formula counts arrangements of identical items, and distinct items need a power or a factorial instead, which is a much larger number.",
    checkpoint: "Ten distinct books go on a shelf, but only three of them fit. How many arrangements?",
    checkpointAnswer: "Seven hundred and twenty, which is ten times nine times eight. Order on a shelf matters, so this is a permutation rather than a combination, and dividing by six would answer the different question of which three books were chosen.",
    remember: "Ask whether order matters, whether repeats are allowed, and whether the containers differ. Combinations divide permutations by the orderings, and stars and bars counts identical items into labelled groups.",
    checks: [
      q("What separates a permutation count from a combination count?", ["Dividing by the orderings of the chosen items", "The size of the pool", "Whether repeats are allowed"], 0, "Order is the distinguishing question.", ["Correct. The ratio is the factorial of the selection size.", "Both use the same pool.", "Repetition is a separate axis."]),
      q("What does Pascal's rule express?", ["An item is either chosen or it is not", "That factorials grow quickly", "That combinations are symmetric"], 0, "Each entry sums the two above it.", ["Correct. That recurrence builds the triangle.", "Growth is a consequence, not the rule.", "Symmetry is a separate property."]),
      q("Stars and bars applies when the items are what?", ["Identical, and the containers distinguishable", "Distinct, and the containers identical", "Both distinct"], 0, "The dividers arrange identical items.", ["Correct. Distinct items need a different formula.", "That is a partition problem instead.", "Distinct items give a much larger count."]),
    ],
  },
  {
    lessonId: "py.ac.m8_1.l5",
    atomId: "py.atom.algo.expected-value",
    conceptId: "py.algo.expected-value",
    title: "Expected value without enumerating outcomes",
    requires: ["py.algo.combinatorics"],
    vocabulary: [
      ["expected value", "the average outcome weighted by probability"],
      ["linearity of expectation", "the rule that expectations add whether or not events are independent"],
      ["indicator variable", "a value of one when an event happens and zero otherwise"],
      ["state expectation", "the expected value from a state, solved like a recurrence"],
    ],
    opening: "Expected value looks like it requires listing every outcome, and almost never does. One property makes most of these problems collapse: expectations add, whether or not the events have anything to do with each other.",
    outcome: "You will compute an expectation directly, then use linearity and indicators to avoid enumerating outcomes at all.",
    why: "Randomized algorithms, hashing analysis and a steady stream of interview questions rest on linearity. Recognizing when it applies turns a problem that looks combinatorial into arithmetic.",
    mentalModel: "Picture asking each person in a room a yes-or-no question and adding up the yeses. You never need to know how the answers relate to each other, because a total is a total however it was produced.",
    firstTitle: "The direct calculation, and its limits",
    firstIntro: "Weighting every outcome works when there are few of them and not otherwise.",
    firstCode: `def expected(outcomes):
    return sum(value * probability for value, probability in outcomes)

die = [(face, 1 / 6) for face in range(1, 7)]
print("one die:", expected(die))

two_dice = [(a + b, 1 / 36) for a in range(1, 7) for b in range(1, 7)]
print("two dice, enumerated:", round(expected(two_dice), 4))
print("two dice, by linearity:", 2 * expected(die))
print("ten dice would need", 6 ** 10, "outcomes to enumerate")`,
    firstTrace: "Both routes to the two-dice answer agree, and only one of them scales. Enumerating ten dice would mean sixty million outcomes, while linearity answers it with a multiplication. The dice happen to be independent here, and the shortcut does not actually require that.",
    secondTitle: "Indicators handle the problems that look hard",
    secondIntro: "Count an event by summing the probability that each individual case happens.",
    secondCode: `def expected_matches(n):
    return sum(1 / n for _ in range(n))

for n in (5, 100, 10000):
    print(f"{n:>6} letters into {n:>6} envelopes: "
          f"expected correct {expected_matches(n):.4f}")

print()
print("each letter is correct with probability 1/n, and there are n of them")
print("the arrangements are not independent, and it does not matter")`,
    secondTrace: "The expected number of correctly delivered letters is one, whatever the count. Each letter has a one in n chance and there are n of them, so the sum is one every time. The placements are heavily dependent on each other, and linearity holds regardless, which is exactly why the shortcut is so useful.",
    mistake: "Do not assume linearity requires independence. It holds for any collection of values whatsoever, and forgetting that leads people to enumerate outcomes for problems that a single sum would have answered.",
    checkpoint: "A fair coin is flipped a hundred times. What is the expected number of positions where two consecutive flips match?",
    checkpointAnswer: "Forty-nine and a half. There are ninety-nine adjacent pairs and each matches with probability one half, so the sum is ninety-nine halves. The pairs overlap and are therefore dependent, which linearity does not care about.",
    remember: "Expectations add whether or not events are independent. Define an indicator per case, sum its probabilities, and most of these problems become one line.",
    checks: [
      q("When does linearity of expectation apply?", ["Always, independent or not", "Only for independent events", "Only for finite outcome sets"], 0, "That generality is what makes it powerful.", ["Correct. Dependence is irrelevant to a sum.", "Independence is not required.", "It holds well beyond finite cases."]),
      q("What is an indicator variable?", ["One when an event happens, zero otherwise", "The probability of an event", "The count of outcomes"], 0, "Its expectation is that event's probability.", ["Correct. Summing them counts the events.", "That is the expectation of the indicator.", "Counting is what the sum produces."]),
      q("Why avoid enumerating outcomes for ten dice?", ["There are over sixty million of them", "The probabilities are unknown", "Expectation is undefined"], 0, "The outcome count grows exponentially.", ["Correct. Linearity answers it with a multiplication.", "Each outcome is equally likely.", "It is perfectly well defined."]),
    ],
  },
];

export const ALGO_NUMBER_THEORY_ATOMS = ALGO_NUMBER_THEORY_SPECS.map(guidedMasteryAtom);
export const ALGO_NUMBER_THEORY_CONCEPTS = ALGO_NUMBER_THEORY_SPECS.map(guidedMasteryConcept);
export const ALGO_NUMBER_THEORY_LESSON_CONTENT = guidedLessonContent(ALGO_NUMBER_THEORY_SPECS);

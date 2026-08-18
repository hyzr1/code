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

const ALGO_GAME_THEORY_SPECS: GuidedMasterySpec[] = [
  {
    lessonId: "py.ac.m9_2.l1",
    atomId: "py.atom.algo.game-theory",
    conceptId: "py.algo.game-theory",
    title: "Nim, Grundy numbers, and one exclusive-or",
    requires: ["py.algo.persistent-structures"],
    vocabulary: [
      ["losing position", "one where every move hands the opponent a winning position"],
      ["Grundy number", "the value summarizing a position's role in a combined game"],
      ["minimum excluded value", "the smallest non-negative integer not among a set"],
      ["independent games", "components played side by side, each move touching only one"],
    ],
    opening: "Games that look like they need search often need one number. A position is losing exactly when a single exclusive-or comes out zero, and that fact generalizes far beyond the game it was proved for.",
    outcome: "You will classify Nim positions by combining pile sizes, compute Grundy numbers for a subtraction game, and combine independent games.",
    why: "Impartial games appear regularly in competitive programming and interviews, and the Grundy value is what turns a search over an exponential state space into arithmetic.",
    mentalModel: "Picture several separate boards played at once, each summarized by a single number. The combined position is losing precisely when those numbers cancel, exactly as pairs cancel under exclusive-or.",
    firstTitle: "Nim is decided by one combination",
    firstIntro: "Combining every pile size with exclusive-or answers the whole game.",
    firstCode: `def nim_is_winning(piles):
    combined = 0
    for pile in piles:
        combined ^= pile
    return combined != 0

for piles in ([1, 1], [1, 2], [3, 4, 5], [0], [1, 2, 3]):
    verdict = "winning" if nim_is_winning(piles) else "losing"
    print(f"{str(piles):<12} {verdict} for the player to move")`,
    firstTrace: "Two equal piles cancel, so whatever one player does to one pile the other mirrors on the second. Three, four and five combine to a non-zero value, so a winning move exists. The empty position combines to zero, which matches the rule that a player unable to move has lost.",
    secondTitle: "Grundy numbers summarize any impartial game",
    secondIntro: "A position's value is the smallest non-negative integer its moves do not reach.",
    secondCode: `from functools import lru_cache

def grundy_values(limit, moves):
    @lru_cache(maxsize=None)
    def value(count):
        reachable = {value(count - move) for move in moves if count - move >= 0}
        candidate = 0
        while candidate in reachable:
            candidate += 1
        return candidate

    return [value(count) for count in range(limit + 1)]

moves = (1, 3, 4)
values = grundy_values(12, moves)
print("count: ", list(range(13)))
print("grundy:", values)
print("losing counts:", [n for n, v in enumerate(values) if v == 0])`,
    secondTrace: "A value of zero marks a losing position, which matches the Nim rule exactly, since a single pile of size zero is lost. The pattern repeats with period seven here, which is typical of subtraction games and is what makes large inputs tractable. Combining several such games means combining their Grundy values with exclusive-or.",
    mistake: "Do not compute a Grundy value as the largest reachable value plus one. It is the smallest non-negative integer that is not reachable, so a position reaching values zero and two has a Grundy value of one rather than three.",
    checkpoint: "Three independent subtraction games have Grundy values 2, 5 and 7. Who wins?",
    checkpointAnswer: "The player to move loses. Two combined with five is seven, and seven combined with seven is zero, so the position is losing exactly as a Nim position combining to zero would be. That is the whole content of the theorem connecting the two.",
    remember: "Combine independent games with exclusive-or, and a total of zero is losing. A single game's Grundy value is the smallest non-negative integer none of its moves reaches.",
    checks: [
      q("When is a Nim position losing for the player to move?", ["When the pile sizes combine to zero under exclusive-or", "When every pile is equal", "When the total is even"], 0, "Cancellation is what makes a mirror strategy work.", ["Correct. Two equal piles are one case of it.", "Equal piles is a special case, not the rule.", "The sum is irrelevant."]),
      q("What is a Grundy number?", ["The smallest non-negative integer no move reaches", "The number of available moves", "The largest reachable value"], 0, "That definition is what makes the combination work.", ["Correct. Reaching zero and two gives a value of one.", "Move count is unrelated.", "Taking the largest breaks the theorem."]),
      q("How are several independent games combined?", ["Exclusive-or of their Grundy values", "Sum of their Grundy values", "Maximum of their Grundy values"], 0, "Each behaves exactly like a Nim pile of that size.", ["Correct. Zero overall means the position is losing.", "Addition does not give the cancellation.", "The maximum loses the pairing structure."]),
    ],
  },
  {
    lessonId: "py.ac.m9_2.l2",
    atomId: "py.atom.algo.minimax-memoized",
    conceptId: "py.algo.minimax-memoized",
    title: "Minimax is a recursion whose states repeat",
    requires: ["py.algo.game-theory"],
    vocabulary: [
      ["minimax", "assuming each player moves to whatever is best for themselves"],
      ["game state", "everything about a position the rest of the game depends on"],
      ["transposition", "reaching the same position through different move orders"],
      ["perspective", "whose turn it is, which decides whether to maximize or minimize"],
    ],
    opening: "Optimal play under an opponent who also plays optimally is a recursion, and a recursion whose states repeat is a dynamic program. Adding a cache is often the only difference between a search that finishes and one that does not.",
    outcome: "You will write a minimax recursion with the turn in the state, cache it, and measure how many distinct states there actually are.",
    why: "Every two-player game question reduces to this, and recognizing transpositions is what makes the state count manageable. The turn belonging in the state is the detail people most often miss.",
    mentalModel: "Picture two players filling in the same tree of positions from the bottom up. Each one picks the branch that suits them, and different move orders that reach the same board are the same subproblem.",
    firstTitle: "Whose turn it is belongs in the state",
    firstIntro: "The same position can be winning or losing depending only on who moves.",
    firstCode: `from functools import lru_cache

def can_win(total, moves):
    @lru_cache(maxsize=None)
    def winning(remaining):
        return any(not winning(remaining - move)
                   for move in moves if remaining - move >= 0)

    return [winning(count) for count in range(total + 1)]

moves = (1, 3, 4)
results = can_win(12, moves)
print("count: ", list(range(13)))
print("winning:", ["W" if r else "L" for r in results])`,
    firstTrace: "A position is winning when some move leaves the opponent in a losing one, which is what the any over negations expresses. The turn does not need its own dimension here because the game is impartial and both players have the same moves. The moment the two players have different options, it does.",
    secondTitle: "Counting the states the cache collapses",
    secondIntro: "Transpositions mean the state count is far smaller than the number of move sequences.",
    secondCode: `from functools import lru_cache

def count_states(total, moves):
    visits = {"calls": 0}

    @lru_cache(maxsize=None)
    def winning(remaining):
        visits["calls"] += 1
        return any(not winning(remaining - move)
                   for move in moves if remaining - move >= 0)

    winning(total)
    return visits["calls"]

def count_without_cache(total, moves):
    def winning(remaining):
        return any(not winning(remaining - move)
                   for move in moves if remaining - move >= 0)
    calls = {"n": 0}

    def counted(remaining):
        calls["n"] += 1
        return any(not counted(remaining - move)
                   for move in moves if remaining - move >= 0)

    counted(total)
    return calls["n"]

moves = (1, 3, 4)
for total in (10, 20, 25):
    print(f"total {total:>3}: cached {count_states(total, moves):>4} states, "
          f"uncached {count_without_cache(total, moves):>8} calls")`,
    secondTrace: "The cached version visits one state per remaining count and the uncached one revisits the same counts along every path. The gap widens quickly, because the number of move sequences grows exponentially while the number of distinct positions grows linearly. That gap is exactly what a transposition table buys.",
    mistake: "Do not leave the turn out of the state when the two players have different move sets. The same board is then cached under one key for both players, so one of them reads an answer computed for the other and the search returns confident nonsense.",
    checkpoint: "A game is cached on the board alone, and both players have identical moves. Is that safe?",
    checkpointAnswer: "Yes, for an impartial game, because the value of a position does not depend on whose turn it is when both players face the same options. As soon as the players have different moves the game is partisan, the turn changes the answer, and it has to join the key.",
    remember: "Minimax is a recursion over positions, and repeated positions make it a dynamic program. Include the turn in the state whenever the two players have different moves available.",
    checks: [
      q("When is a position winning?", ["When some move leaves the opponent in a losing position", "When most moves lead to a win", "When the position has the most moves"], 0, "One good move is enough.", ["Correct. That is what the recursion expresses.", "A majority is not required.", "Move count says nothing about the value."]),
      q("What is a transposition?", ["The same position reached by different move orders", "A position with the value reversed", "A swap of two pieces"], 0, "It is why caching pays off.", ["Correct. One cached entry serves every path to it.", "Reversal is a different idea.", "No pieces are swapped."]),
      q("When must the turn be part of the cache key?", ["When the two players have different move sets", "Always", "Never"], 0, "An impartial game does not need it.", ["Correct. Partisan games do need it.", "Impartial games are safe without it.", "Omitting it in a partisan game gives wrong answers."]),
    ],
  },
  {
    lessonId: "py.ac.m9_2.l3",
    atomId: "py.atom.algo.matrix-exponentiation",
    conceptId: "py.algo.matrix-exponentiation",
    title: "A linear recurrence is a matrix power",
    requires: ["py.algo.minimax-memoized"],
    vocabulary: [
      ["transition matrix", "the matrix carrying one state vector to the next"],
      ["state vector", "the recent terms a recurrence needs to produce the next one"],
      ["matrix exponentiation", "raising a matrix to a power by repeated squaring"],
      ["logarithmic jump", "reaching term n without computing the terms before it"],
    ],
    opening: "A recurrence that reads a fixed number of previous terms is a linear map applied repeatedly. Applying a map n times is raising it to the nth power, and powers are computed by squaring rather than by repetition.",
    outcome: "You will build a transition matrix from a recurrence, raise it by squaring, and reach term n in logarithmic time.",
    why: "Problems asking for a term with an index in the billions are common, and no linear scan reaches them. The construction also transfers directly to counting paths in a graph.",
    mentalModel: "Picture a machine that turns the last two terms into the next pair. Running it a billion times is impractical, and squaring it repeatedly builds a machine that jumps a billion steps in one go.",
    firstTitle: "The matrix that advances the recurrence one step",
    firstIntro: "Each row says how one entry of the next state is built from the current one.",
    firstCode: `def multiply(left, right, modulus=None):
    rows = len(left)
    inner = len(right)
    columns = len(right[0])
    out = [[0] * columns for _ in range(rows)]
    for i in range(rows):
        for k in range(inner):
            if left[i][k]:
                for j in range(columns):
                    out[i][j] += left[i][k] * right[k][j]
                    if modulus:
                        out[i][j] %= modulus
    return out

fib = [[1, 1], [1, 0]]
state = [[1], [0]]
for step in range(1, 6):
    state = multiply(fib, state)
    print(f"after {step} steps: {state[0][0]}")`,
    firstTrace: "The state holds the two most recent terms and the matrix rewrites it into the next pair. Applying it repeatedly walks the recurrence forward one term at a time, which is no faster than a loop. The gain comes from raising the matrix rather than applying it.",
    secondTitle: "Squaring reaches any index in a few steps",
    secondIntro: "The same halving that makes integer powers fast works unchanged on matrices.",
    secondCode: `def multiply(left, right, modulus=None):
    rows, inner, columns = len(left), len(right), len(right[0])
    out = [[0] * columns for _ in range(rows)]
    for i in range(rows):
        for k in range(inner):
            if left[i][k]:
                for j in range(columns):
                    out[i][j] += left[i][k] * right[k][j]
                    if modulus:
                        out[i][j] %= modulus
    return out

def power(matrix, exponent, modulus=None):
    size = len(matrix)
    result = [[1 if i == j else 0 for j in range(size)] for i in range(size)]
    steps = 0
    while exponent:
        if exponent & 1:
            result = multiply(result, matrix, modulus)
        matrix = multiply(matrix, matrix, modulus)
        exponent >>= 1
        steps += 1
    return result, steps

fib = [[1, 1], [1, 0]]
print("first ten terms:", [power(fib, n)[0][0][1] for n in range(1, 11)])
value, steps = power(fib, 50)
print("term 50:", value[0][1], "in", steps, "squarings")
value, steps = power(fib, 90, 10 ** 9 + 7)
print("term 90 modulo a prime:", value[0][1], "in", steps, "squarings")`,
    secondTrace: "The identity matrix plays the role the number one plays for integers, and squaring replaces multiplying. Term fifty arrives in six squarings rather than fifty additions, and term ninety in seven. Reducing by a modulus inside the multiplication is what keeps the entries from growing without bound.",
    mistake: "Do not build the transition matrix by guessing the layout. Write the next state vector explicitly in terms of the current one, and read each row of the matrix off that equation, or the recurrence being computed is not the one you intended.",
    checkpoint: "A recurrence reads three terms back to produce the next one. What size is its transition matrix?",
    checkpointAnswer: "Three by three, because the state vector must hold the three terms the recurrence depends on. In general the matrix is as wide as the recurrence is deep, and the cost of one multiplication grows with the cube of that width.",
    remember: "Write the recurrence as a matrix carrying one state vector to the next, then raise it by squaring. Term n arrives in about the logarithm of n multiplications.",
    checks: [
      q("What size is the transition matrix for a recurrence reading k previous terms?", ["k by k", "Two by two always", "k by one"], 0, "The state vector holds those k terms.", ["Correct. One multiplication costs the cube of k.", "Two by two suits a depth of two only.", "The matrix must be square."]),
      q("How many multiplications reach term n?", ["About the logarithm of n", "About n", "About the square root of n"], 0, "Each squaring halves the exponent.", ["Correct. Term fifty takes six squarings.", "That is the plain loop.", "Halving gives a logarithm."]),
      q("Why reduce by the modulus inside the multiplication?", ["The entries would otherwise grow without bound", "It makes the matrix smaller", "It preserves the identity"], 0, "Fibonacci entries grow exponentially.", ["Correct. Reducing keeps every value small.", "The dimensions are unchanged.", "The identity is unaffected either way."]),
    ],
  },
];

export const ALGO_GAME_THEORY_ATOMS = ALGO_GAME_THEORY_SPECS.map(guidedMasteryAtom);
export const ALGO_GAME_THEORY_CONCEPTS = ALGO_GAME_THEORY_SPECS.map(guidedMasteryConcept);
export const ALGO_GAME_THEORY_LESSON_CONTENT = guidedLessonContent(ALGO_GAME_THEORY_SPECS);

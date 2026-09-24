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

const ALGO_BACKTRACKING_SPECS: GuidedMasterySpec[] = [
  {
    lessonId: "py.ac.m6_1.l1",
    atomId: "py.atom.algo.subset-generation",
    conceptId: "py.algo.subset-generation",
    title: "Every subset is a series of include-or-exclude choices",
    requires: ["py.algo.call-stack", "py.algo.linked-list-foundations"],
    vocabulary: [
      ["decision tree", "the branching record of the search's choices"],
      ["path", "the choices taken from the root to the current call"],
      ["power set", "the collection of all subsets of a set"],
      ["start index", "the position that blocks reuse of anything already passed"],
    ],
    opening: "Enumerating possibilities looks like it needs cleverness. It only needs a decision. For subsets that decision is the smallest one there is: each element is in, or out. Make that choice element by element and every subset appears exactly once.",
    outcome: "You will explain why the power set has two-to-the-n members, generate subsets with a start index, and say what the path holds.",
    why: "This is the simplest form of the pattern behind combinations, permutations, and constraint solving. Get it right here and the harder searches are the same shape with more bookkeeping.",
    mentalModel: "Picture a corridor with one door per element. At each door you take the element, or walk past. What you hold at the end is one subset. Each route gives a different one.",
    firstTitle: "Make the in-or-out choice explicit",
    firstIntro: "Written as a binary choice, the code mirrors the definition. Recurse once having taken the element, once having skipped it.",
    firstCode: `def subsets(values):
    result = []

    def choose(index, path):
        if index == len(values):
            result.append(list(path))
            return
        path.append(values[index])
        choose(index + 1, path)
        path.pop()
        choose(index + 1, path)

    choose(0, [])
    return result

print(subsets([1, 2]))
print(len(subsets([1, 2, 3])))`,
    firstTrace: "Each call handles one element, then hands the rest to two child calls. The tree has depth n and two branches per level, giving two-to-the-n leaves. Each leaf appends one subset. The `pop` restores the path before the second branch runs.",
    secondTitle: "Collect at every node instead of only the leaves",
    secondIntro: "A start index says the same thing differently. Record a subset at once, then extend it only with later elements. This is the form harder problems reuse.",
    secondCode: `def subsets(values):
    result = []

    def build(start, path):
        result.append(list(path))
        for index in range(start, len(values)):
            path.append(values[index])
            build(index + 1, path)
            path.pop()

    build(0, [])
    return result

print(subsets([1, 2, 3]))`,
    secondTrace: "Recording on entry means the empty subset comes first. Passing `index + 1` forbids reusing the current element. Starting at `start` forbids stepping back. So `[1, 2]` appears and `[2, 1]` never does.",
    mistake: "Do not append `path` itself. It is one list the recursion keeps mutating, so every stored reference shows the same final contents. Append `list(path)`. The copy survives the undo that follows.",
    checkpoint: "The start-index version records a subset at every call, not only at the leaves. Why is each subset still produced once?",
    checkpointAnswer: "A subset is identified by the choices on its path. Each iteration extends the path with a strictly later element. So every node holds one increasing sequence of indices, and no two nodes can match.",
    remember: "Each element is in or out, giving two-to-the-n subsets. Append a copy of the path. A start index stops a branch reusing anything already passed.",
    checks: [
      q("How many subsets does a set of n distinct elements have?", ["Two to the power n", "n factorial", "n squared"], 0, "Each element contributes an independent in-or-out choice.", ["Correct. Multiplying two choices n times gives two-to-the-n.", "That counts orderings, which subsets do not distinguish.", "That grows far too slowly to cover every combination."]),
      q("Why is `list(path)` appended instead of `path`?", ["The path is mutated after the append, so a reference would change", "Copying makes the search faster", "The result must hold tuples"], 0, "The path is one reused list.", ["Correct. Every stored reference would otherwise show the same final contents.", "Copying costs time; correctness is the reason.", "Lists are acceptable results; the issue is aliasing."]),
      q("What does passing `index + 1` rather than `start` prevent?", ["Reusing the element just chosen", "Skipping elements entirely", "Producing the empty subset"], 0, "The next call may only consider later positions.", ["Correct. Reuse would generate multisets rather than subsets.", "Skipping is exactly what the loop's later iterations do.", "The empty subset is recorded before the loop begins."]),
    ],
  },
  {
    lessonId: "py.ac.m6_1.l2",
    atomId: "py.atom.algo.permutations-combinations",
    conceptId: "py.algo.permutations-combinations",
    title: "Order decides whether you track used elements or a start index",
    requires: ["py.algo.subset-generation"],
    vocabulary: [
      ["permutation", "an arrangement where order matters"],
      ["combination", "a selection where order does not matter"],
      ["used marker", "state recording which elements are already placed"],
      ["canonical order", "fixing one arrangement per selection so duplicates cannot arise"],
    ],
    opening: "Permutations and combinations look similar and are generated by almost the same code. The single difference is whether order carries meaning, and that difference decides which piece of state the recursion must carry.",
    outcome: "You will be able to choose between a used marker and a start index, explain why each prevents duplicates, and count how many results to expect.",
    why: "Interviewers use this pair to check whether you understand your own search rather than recalling a template. Choosing the wrong state produces either duplicates or missing answers, and the bug is invisible until you count the output.",
    mentalModel: "Combinations are picking a team: the same three people are one team however you list them. Permutations are seating them in a row: the same three people in a different order is a genuinely different arrangement.",
    firstTitle: "Permutations need to know what is already placed",
    firstIntro: "Because every position may hold any unplaced element, the recursion must track membership rather than position.",
    firstCode: `def permutations(values):
    result = []
    used = [False] * len(values)

    def place(path):
        if len(path) == len(values):
            result.append(list(path))
            return
        for index in range(len(values)):
            if used[index]:
                continue
            used[index] = True
            path.append(values[index])
            place(path)
            path.pop()
            used[index] = False

    place([])
    return result

print(permutations([1, 2, 3]))
print(len(permutations([1, 2, 3, 4])))`,
    firstTrace: "The first position has n candidates, the second has the n minus one that remain, and so on, which is exactly n factorial arrangements. Both undo lines matter: `path.pop()` releases the position and `used[index] = False` releases the element, so the next iteration starts from a clean state.",
    secondTitle: "Combinations only need to move forward",
    secondIntro: "When order is irrelevant, fixing one canonical order per selection removes the duplicates. Requiring indices to increase is the simplest way to do that.",
    secondCode: `def combinations(values, k):
    result = []

    def build(start, path):
        if len(path) == k:
            result.append(list(path))
            return
        for index in range(start, len(values)):
            path.append(values[index])
            build(index + 1, path)
            path.pop()

    build(0, [])
    return result

print(combinations([1, 2, 3, 4], 2))
print(len(combinations([1, 2, 3, 4, 5], 3)))`,
    secondTrace: "Every stored selection has strictly increasing indices, so `[1, 3]` is generated and `[3, 1]` is not. Ten selections come out of five elements taken three at a time, which matches the binomial coefficient. No used marker is needed because moving forward already guarantees no element repeats.",
    mistake: "Do not use a start index for permutations. It forbids looking back at any element already passed, so most arrangements can never be built and the output is silently short. Count the results when testing: n factorial for permutations, and the binomial coefficient for combinations.",
    checkpoint: "A candidate generates combinations using a used marker instead of a start index. What goes wrong, and would any answer be missing?",
    checkpointAnswer: "Nothing is missing, but every selection appears in all of its orderings, so the output holds k factorial copies of each combination. A used marker only prevents reusing one element within a path; it does nothing to stop the same set being reached by a different order.",
    remember: "Permutations track which elements are used and produce n factorial results. Combinations move forward from a start index, fixing one canonical order per selection.",
    checks: [
      q("Which state does a permutation search need?", ["A record of which elements are already placed", "A start index that only moves forward", "Nothing beyond the current path"], 0, "Any unplaced element may fill the next position.", ["Correct. Order matters, so earlier elements must remain available.", "That forbids revisiting earlier elements and loses arrangements.", "Without membership state elements would be reused."]),
      q("Why does requiring increasing indices remove combination duplicates?", ["It fixes exactly one ordering per selection", "It skips half the elements", "It makes the recursion shallower"], 0, "One canonical order per selection cannot be reached twice.", ["Correct. Only the increasing arrangement of any selection is ever built.", "Every element is still reachable through some branch.", "Depth is set by k, not by the ordering rule."]),
      q("Generating combinations with a used marker produces how many copies of each selection?", ["k factorial", "Exactly one", "Two"], 0, "Every ordering of the same selection is reached.", ["Correct. The set arrives once per arrangement of its k members.", "That is the behaviour of the start-index version.", "The count grows with k, not a constant."]),
    ],
  },
  {
    lessonId: "py.ac.m6_1.l3",
    atomId: "py.atom.algo.backtracking-template",
    conceptId: "py.algo.backtracking-template",
    title: "Choose, explore, un-choose",
    requires: ["py.algo.permutations-combinations"],
    vocabulary: [
      ["backtracking", "searching by making a choice and undoing it when the branch finishes"],
      ["state", "everything the search has committed to at the current node"],
      ["undo", "restoring state so a sibling branch starts clean"],
      ["partial solution", "a path that may still grow into a complete answer"],
    ],
    opening: "Subsets, permutations and combinations were three problems and one shape. That shape has a name and three lines: choose something, explore what follows, then un-choose it. Naming it turns each new search into filling in blanks rather than inventing an algorithm.",
    outcome: "You will be able to write the template from memory, identify the four decisions it leaves you, and explain why the undo step is what makes shared mutable state safe.",
    why: "Almost every exhaustive search you meet — constraint puzzles, path enumeration, expression building, parsing — is this template with a different candidate list and goal test. Recognizing it is what makes an unfamiliar problem tractable under time pressure.",
    mentalModel: "Think of exploring a cave with chalk. At each junction you mark the passage you take, walk it to the end, then rub the mark out on the way back. The chalk is the shared state, and rubbing it out is what lets the next passage start from the same clean junction.",
    firstTitle: "The template, with its four blanks visible",
    firstIntro: "Everything specific to a problem lives in four places: when a path is complete, which candidates exist here, whether a candidate is allowed, and what recording a choice means.",
    firstCode: `def solve(values):
    results = []

    def backtrack(path):
        if len(path) == len(values):
            results.append(list(path))
            return
        for candidate in values:
            if candidate in path:
                continue
            path.append(candidate)
            backtrack(path)
            path.pop()

    backtrack([])
    return results

print(solve(["a", "b"]))`,
    firstTrace: "The goal test, the candidate loop, the validity check and the record-and-undo pair are the whole algorithm. Here validity is membership in the path, which is why this produces arrangements rather than repeats. Swap those four pieces and the same skeleton solves a completely different problem.",
    secondTitle: "Undo is what keeps shared state honest",
    secondIntro: "Removing the undo does not merely change the answer; it corrupts every branch that follows, because the state carries choices that were supposed to end when the branch did.",
    secondCode: `def broken(values):
    results = []

    def backtrack(path):
        if len(path) == len(values):
            results.append(list(path))
            return
        for candidate in values:
            if candidate in path:
                continue
            path.append(candidate)
            backtrack(path)

    backtrack([])
    return results

print("with undo removed:", broken(["a", "b"]))
print("expected two arrangements, got", len(broken(["a", "b"])))`,
    secondTrace: "The first branch reaches a complete path and returns, but the choice is never withdrawn. The loop's next iteration therefore starts from a polluted path, the validity check rejects the remaining candidate, and whole regions of the search vanish. Only one arrangement survives instead of two.",
    mistake: "Do not skip the undo just because a branch returns immediately. Any state you mutate on the way down — a path, a used array, a running total, a board — must be restored on the way up. The alternative is passing a fresh copy to each call, which is correct but allocates at every node.",
    checkpoint: "You add a running total to a backtracking search and update it before recursing. What must the undo step now do?",
    checkpointAnswer: "It must restore the total as well as the path, by subtracting exactly what was added. Every piece of mutated state needs its own undo, and forgetting one leaks that choice into sibling branches, which corrupts their results without raising any error.",
    remember: "Backtracking is choose, explore, un-choose. The four problem-specific blanks are the goal test, the candidate list, the validity check, and what a choice records — and every mutation needs a matching undo.",
    checks: [
      q("What are the three steps of the backtracking template?", ["Choose, explore, un-choose", "Sort, search, merge", "Split, solve, combine"], 0, "Backtracking makes a choice and withdraws it after exploring.", ["Correct. The undo is what allows sibling branches to start clean.", "That describes a sorting pipeline, not a search.", "That is divide and conquer, which does not undo choices."]),
      q("Omitting the undo step causes what?", ["Later branches inherit choices that should have ended", "The recursion never terminates", "Results are produced in the wrong order"], 0, "Shared state carries stale choices into siblings.", ["Correct. Whole regions of the search become unreachable.", "Depth is still bounded, so it terminates.", "Ordering is unaffected; the results are simply wrong."]),
      q("Which part of the template changes when moving to a new problem?", ["The goal test, candidates, validity rule, and what a choice records", "The recursion itself", "The need to undo"], 0, "The skeleton is fixed; the blanks are problem-specific.", ["Correct. That is what makes the template reusable.", "The recursive shape is exactly what stays the same.", "Undo is required in every instance."]),
    ],
  },
  {
    lessonId: "py.ac.m6_1.l4",
    atomId: "py.atom.algo.constraint-search",
    conceptId: "py.algo.constraint-search",
    title: "Constraint problems fill the template's validity blank",
    requires: ["py.algo.backtracking-template"],
    vocabulary: [
      ["constraint", "a rule a complete solution must never violate"],
      ["placement", "one committed choice, such as a queen on a row"],
      ["conflict check", "testing a candidate against the choices already made"],
      ["incremental validity", "checking only the new choice rather than the whole board"],
    ],
    opening: "N-queens, Sudoku and word search look like different puzzles, but each is the same search with a different rule for what counts as legal. Once the template is fixed, solving them is a matter of writing one honest conflict check.",
    outcome: "You will be able to model a constraint puzzle as a sequence of placements, write an incremental conflict check, and explain why checking only the new placement is sufficient.",
    why: "Constraint problems are the standard hard-interview use of backtracking, and they reward the candidate who checks incrementally rather than rescanning the entire state at every node.",
    mentalModel: "Think of placing queens one row at a time. You never need to re-examine the rows already settled, because they were legal when placed and nothing has changed since. Only the new queen can create a conflict, so only the new queen needs testing.",
    firstTitle: "Model the puzzle as one choice per row",
    firstIntro: "Choosing a column for each row in turn removes an entire class of conflicts for free: two queens can never share a row, because the search never places two in one.",
    firstCode: `def conflicts(columns, column):
    row = len(columns)
    for earlier_row, earlier_column in enumerate(columns):
        if earlier_column == column:
            return True
        if abs(earlier_column - column) == row - earlier_row:
            return True
    return False

print(conflicts([0], 0))
print(conflicts([0], 1))
print(conflicts([0], 2))`,
    firstTrace: "The row of the new queen is simply how many are already placed. A shared column is an immediate conflict, and a shared diagonal shows up when the column gap equals the row gap. The second call is rejected because the queens touch diagonally, while the third is accepted.",
    secondTitle: "Drop the check into the template unchanged",
    secondIntro: "With a conflict check in hand, the search is the template from the previous lesson with the validity blank filled in.",
    secondCode: `def solve_queens(n):
    solutions = []
    columns = []

    def place():
        if len(columns) == n:
            solutions.append(list(columns))
            return
        for column in range(n):
            if conflicts(columns, column):
                continue
            columns.append(column)
            place()
            columns.pop()

    place()
    return solutions

print("4 queens has", len(solve_queens(4)), "solutions")
print("first solution", solve_queens(4)[0])
print("8 queens has", len(solve_queens(8)), "solutions")`,
    secondTrace: "Nothing about the skeleton changed: the goal test is a full board, the candidates are the columns, validity is the conflict check, and the undo is a single `pop`. The known counts confirm it, with two solutions for four queens and ninety-two for eight.",
    mistake: "Do not re-validate the entire board at every node. The placements already made were legal when they were made and cannot become illegal, so rescanning them multiplies the work by the board size for no information. Check only the new placement against the existing ones.",
    checkpoint: "Why is it enough to test the new queen against the queens already placed, rather than checking every pair on the board?",
    checkpointAnswer: "Because the existing queens were checked against each other as they were placed, so that part of the board is already known to be conflict-free. The only pairs whose status is unknown are those involving the queen being added, so testing exactly those pairs establishes that the whole board is still legal.",
    remember: "Model a constraint puzzle as one placement per step so structural conflicts vanish by construction, then fill the template's validity blank with an incremental conflict check against the choices already made.",
    checks: [
      q("Why does placing one queen per row remove row conflicts entirely?", ["The search never places two queens in the same row", "Rows are checked after the board is complete", "Row conflicts are legal in this puzzle"], 0, "The modelling choice makes that conflict impossible.", ["Correct. Choosing the model well removes a whole class of checks.", "No later check is needed for something that cannot occur.", "Two queens in a row would certainly attack each other."]),
      q("Two queens conflict diagonally exactly when what holds?", ["The column difference equals the row difference", "They share a column", "Their rows are adjacent"], 0, "Diagonal movement changes row and column equally.", ["Correct. Equal gaps in both directions place them on one diagonal.", "That is a column conflict, which is a separate test.", "Adjacent rows only conflict when the columns also line up diagonally."]),
      q("Why is checking only the newest placement sufficient?", ["Earlier placements were already verified against each other", "Earlier placements cannot cause conflicts", "The check is approximate"], 0, "Validity is maintained incrementally as the search descends.", ["Correct. Only the pairs involving the new choice are unknown.", "They certainly can, which is why they were checked when placed.", "The check is exact, not approximate."]),
    ],
  },
  {
    lessonId: "py.ac.m6_1.l5",
    atomId: "py.atom.algo.search-pruning",
    conceptId: "py.algo.search-pruning",
    title: "Pruning cuts branches that cannot possibly succeed",
    requires: ["py.algo.constraint-search"],
    vocabulary: [
      ["pruning", "abandoning a branch once it provably cannot yield an answer"],
      ["feasibility bound", "a quick argument that no completion of this path can work"],
      ["search space", "the set of paths the algorithm actually explores"],
      ["ordering heuristic", "trying the most constrained choices first so failures surface sooner"],
    ],
    opening: "Backtracking is correct but can be astronomically slow, because a wrong choice near the root is not discovered until every completion beneath it has been tried. Pruning fixes that by refusing to descend as soon as the branch is provably dead.",
    outcome: "You will be able to add a feasibility bound to a search, argue that pruning preserves correctness, and explain why choice ordering changes runtime without changing the answer.",
    why: "Pruning is the difference between a search that finishes and one that does not. It is also where interviews separate a working solution from a good one, because the pruning argument is a correctness argument.",
    mentalModel: "Picture searching a building for an exit while carrying a running count of the doors left. If a corridor needs six more doors and only three remain, you turn back at its mouth rather than walking to the dead end.",
    firstTitle: "Refuse to descend when the target is already unreachable",
    firstIntro: "Two bounds are usually available at once: the remaining need is already impossible to reach, or it has already been overshot.",
    firstCode: `def count_subsets(values, target, prune):
    values = sorted(values)
    visited = 0

    def search(index, remaining):
        nonlocal visited
        visited += 1
        if remaining == 0:
            return 1
        if prune and index < len(values) and values[index] > remaining:
            return 0
        return sum(
            search(position + 1, remaining - values[position])
            for position in range(index, len(values))
        )

    return search(0, target), visited

print("no pruning:  ", count_subsets([2, 4, 6, 8, 10], 6, False))
print("with pruning:", count_subsets([2, 4, 6, 8, 10], 6, True))`,
    firstTrace: "Both runs return the same two subsets, so the pruning changed nothing about the answer. The visited counts differ because sorting lets one comparison retire an entire branch: once the smallest remaining value already exceeds what is left, no combination of larger values can ever reach the target.",
    secondTitle: "Order the choices so failure arrives early",
    secondIntro: "A prune only helps if the search reaches it. Trying the most constrained option first makes contradictions appear near the root, where cutting saves the most work.",
    secondCode: `def first_fit(capacities, demand):
    order = sorted(range(len(capacities)), key=lambda i: capacities[i])
    checked = 0
    for position in order:
        checked += 1
        if capacities[position] >= demand:
            return position, checked
    return -1, checked

print(first_fit([9, 1, 7, 2], 8))
print(first_fit([9, 1, 7, 2], 1))`,
    secondTrace: "Sorting by capacity means the tightest options are examined first. A demand of one is satisfied immediately by the smallest bin, while a demand of eight must walk past every bin that cannot hold it. The answer is the same either way; only the number of checks changes.",
    mistake: "Do not prune on a rule you have not justified. A bound must be provably safe — every path it discards genuinely cannot produce an answer. An overeager cut silently deletes valid solutions, and because the output still looks plausible, the bug is easy to ship.",
    checkpoint: "Adding a prune makes a search much faster but returns fewer solutions than before. What has gone wrong?",
    checkpointAnswer: "The bound is not safe: it is discarding branches that could still have completed. A correct prune only removes paths that provably cannot reach an answer, so it must never change the result set. The fix is to prove the condition, or weaken it until it is provably conservative.",
    remember: "Pruning abandons provably dead branches and must never change the answer. Sorting and ordering heuristics make contradictions surface sooner, near the root, where cutting saves the most.",
    checks: [
      q("What must be true of a pruning rule?", ["Every branch it discards provably cannot yield an answer", "It must remove at least half the search space", "It must run in constant time"], 0, "Pruning is a correctness argument before it is a speed one.", ["Correct. An unsafe bound deletes valid solutions silently.", "Any safe cut helps, however small.", "A more expensive check can still pay for itself."]),
      q("Why does trying the most constrained choice first help?", ["Contradictions surface nearer the root, where cutting saves most", "It reduces the total number of solutions", "It makes each check cheaper"], 0, "Ordering changes where failures are discovered.", ["Correct. A cut high in the tree removes an enormous subtree.", "The solution set is unchanged by ordering.", "The per-check cost is unaffected."]),
      q("A correct prune changes which of these?", ["Only the number of nodes visited", "The set of solutions found", "The depth of the recursion"], 0, "Safe pruning preserves the answer exactly.", ["Correct. Speed changes; results do not.", "Any change to the results proves the bound was unsafe.", "Maximum depth is set by the problem, not the prune."]),
    ],
  },
];

export const ALGO_BACKTRACKING_ATOMS = ALGO_BACKTRACKING_SPECS.map(guidedMasteryAtom);
export const ALGO_BACKTRACKING_CONCEPTS = ALGO_BACKTRACKING_SPECS.map(guidedMasteryConcept);
export const ALGO_BACKTRACKING_LESSON_CONTENT = guidedLessonContent(ALGO_BACKTRACKING_SPECS);

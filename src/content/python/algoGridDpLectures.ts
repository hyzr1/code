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

const ALGO_GRID_DP_SPECS: GuidedMasterySpec[] = [
  {
    lessonId: "py.ac.m6_6.l1",
    atomId: "py.atom.algo.grid-paths",
    conceptId: "py.algo.grid-paths",
    title: "Grids, where the state is a cell",
    requires: ["py.algo.subset-sum"],
    vocabulary: [
      ["cell state", "a state named by a row and a column in the grid"],
      ["predecessor cell", "a cell whose answer a transition reads"],
      ["boundary row", "the first row or column, which has fewer predecessors than the rest"],
      ["row reduction", "keeping only the grid rows a transition still reads"],
    ],
    opening: "Once the state is a cell, dynamic programming on a grid writes itself. The transition is whichever neighbouring cells could have led here, and the only real work is deciding what the edges of the grid mean.",
    outcome: "You will count paths across a grid, find a minimum-cost path, and reduce the grid to a single row.",
    why: "Grid problems are the most common two-dimensional dynamic programming in interviews, and they are the gentlest place to practise the boundary handling that harder table problems demand.",
    mentalModel: "Picture water filling a terraced field from the top-left corner. Each terrace receives from its left-hand neighbour and its upper neighbour, and nothing flows backward, so a single sweep fills the whole field.",
    firstTitle: "Counting and minimizing on the same grid",
    firstIntro: "Both read the same two predecessors and differ only in how they combine them.",
    firstCode: `def count_paths(rows, cols):
    row = [1] * cols
    for _ in range(1, rows):
        for col in range(1, cols):
            row[col] += row[col - 1]
    return row[cols - 1]

def min_path(grid):
    row = list(grid[0])
    for col in range(1, len(row)):
        row[col] += row[col - 1]
    for line in grid[1:]:
        row[0] += line[0]
        for col in range(1, len(row)):
            row[col] = line[col] + min(row[col], row[col - 1])
    return row[-1]

print(count_paths(3, 7), count_paths(1, 5))
print(min_path([[1, 3, 1], [1, 5, 1], [4, 2, 1]]))`,
    firstTrace: "Counting sums the two predecessors and minimizing takes the smaller, which is the same difference that separates counting from optimizing anywhere else. Twenty-eight paths cross a three by seven grid, and the cheapest route through that cost grid totals seven. A grid one row tall has exactly one path, since there is nowhere to turn.",
    secondTitle: "The boundaries are where the bugs live",
    secondIntro: "The first row and first column have only one predecessor each, and the corner has none.",
    secondCode: `def min_path_explicit(grid):
    rows, cols = len(grid), len(grid[0])
    best = [[0] * cols for _ in range(rows)]
    best[0][0] = grid[0][0]
    for col in range(1, cols):
        best[0][col] = best[0][col - 1] + grid[0][col]
    for row in range(1, rows):
        best[row][0] = best[row - 1][0] + grid[row][0]
    for row in range(1, rows):
        for col in range(1, cols):
            best[row][col] = grid[row][col] + min(best[row - 1][col],
                                                  best[row][col - 1])
    return best[rows - 1][cols - 1]

print(min_path_explicit([[1, 3, 1], [1, 5, 1], [4, 2, 1]]))
print(min_path_explicit([[5]]))`,
    secondTrace: "Three separate loops fill the corner, the top edge and the left edge before the main double loop runs. Writing them out is verbose and it removes every conditional from the inner loop. A one by one grid answers with its only cell, which is the case an over-clever initialization usually breaks.",
    mistake: "Do not seed the whole first row with a single value when the cells carry costs. Each entry along an edge is a running total of everything before it, so a flat seed makes the top and left routes look free and produces answers that are too small.",
    checkpoint: "The row-reduced version keeps one row instead of the whole grid. What does that make impossible?",
    checkpointAnswer: "Recovering the path itself, since the cells the route passed through are overwritten as the sweep advances. Returning the route needs either the full grid kept, or a parallel record of which predecessor won at each cell.",
    remember: "The state is a cell and the transition is its predecessors. Fill the boundaries first, and reduce the grid to one row when only the final value is needed.",
    checks: [
      q("What is the state in a grid dynamic program?", ["A cell, named by its row and column", "The path taken so far", "The remaining distance to the corner"], 0, "Position is what the rest of the problem depends on.", ["Correct. Everything else follows from the transition.", "Storing the path makes every state unique.", "That is derived from the position."]),
      q("Why are the first row and column handled separately?", ["They have only one predecessor each", "They are always cheaper", "They are read more often"], 0, "The corner has none at all.", ["Correct. Filling them first removes conditionals from the inner loop.", "Cost depends on the grid contents.", "Access frequency is not the issue."]),
      q("Reducing the grid to a single row loses what?", ["The ability to reconstruct the route", "The correct final value", "The boundary handling"], 0, "Overwritten cells cannot be walked backward.", ["Correct. A parallel record of winners is needed for that.", "The final value is unaffected.", "Boundaries are still handled, just in the row."]),
    ],
  },
  {
    lessonId: "py.ac.m6_6.l2",
    atomId: "py.atom.algo.grid-obstacles",
    conceptId: "py.algo.grid-obstacles",
    title: "Obstacles, and what an unreachable cell means",
    requires: ["py.algo.grid-paths"],
    vocabulary: [
      ["blocked cell", "a cell no path may pass through"],
      ["unreachable state", "a cell no valid path can arrive at"],
      ["absorbing zero", "a stored zero that correctly contributes nothing to its successors"],
      ["shadowed region", "cells made unreachable by a blockage placed before them"],
    ],
    opening: "Adding obstacles to a grid changes almost nothing about the algorithm and almost everything about the edges. The interesting question is what an unreachable cell should store so that its successors inherit the right answer.",
    outcome: "You will count paths around obstacles, propagate unreachability along an edge, and choose the right sentinel for counting and for minimizing.",
    why: "The obstacle variant is asked immediately after the plain one, and it is where the difference between counting and optimizing sentinels becomes visible. Zero happens to be correct for one and disastrous for the other.",
    mentalModel: "Picture the same terraced field with some terraces sealed. Water arriving at a sealed terrace stops, and every terrace fed only by that one stays dry for the rest of the sweep.",
    firstTitle: "For counting, zero is exactly the right sentinel",
    firstIntro: "Zero ways to reach a cell contributes zero ways to everything it feeds, which is what unreachable should mean.",
    firstCode: `def paths_with_obstacles(grid):
    cols = len(grid[0])
    row = [0] * cols
    row[0] = 1 if grid[0][0] == 0 else 0
    for col in range(1, cols):
        row[col] = row[col - 1] if grid[0][col] == 0 else 0
    for line in grid[1:]:
        row[0] = row[0] if line[0] == 0 else 0
        for col in range(1, cols):
            row[col] = 0 if line[col] else row[col] + row[col - 1]
    return row[cols - 1]

print(paths_with_obstacles([[0, 0, 0], [0, 1, 0], [0, 0, 0]]))
print(paths_with_obstacles([[0, 1], [0, 0]]))
print(paths_with_obstacles([[1, 0], [0, 0]]))`,
    firstTrace: "The blocked middle cell stores zero, so the two routes through it vanish and two paths survive. A blockage on the top edge zeroes that cell, and because the edge only reads leftward, everything beyond it on that edge stays zero as well. A blocked start answers zero without any special case.",
    secondTitle: "For minimizing, zero is the worst possible sentinel",
    secondIntro: "A blocked cell must be impossible to enter, and zero reads as a free cell rather than a forbidden one.",
    secondCode: `def min_path_blocked(grid):
    blocked = float("inf")
    cols = len(grid[0])
    row = [blocked] * cols
    row[0] = grid[0][0] if grid[0][0] >= 0 else blocked
    for col in range(1, cols):
        cost = grid[0][col]
        row[col] = blocked if cost < 0 else row[col - 1] + cost
    for line in grid[1:]:
        row[0] = blocked if line[0] < 0 else row[0] + line[0]
        for col in range(1, cols):
            cost = line[col]
            row[col] = blocked if cost < 0 else cost + min(row[col], row[col - 1])
    return None if row[-1] == blocked else row[-1]

print(min_path_blocked([[1, 3, 1], [1, -1, 1], [4, 2, 1]]))
print(min_path_blocked([[1, -1], [-1, 1]]))`,
    secondTrace: "Infinity marks a cell no route may use, and adding a cost to infinity stays infinite, so the blockage propagates on its own. The detour around the blocked centre costs seven. A grid whose only routes are severed returns nothing at all, which the sentinel detects without any separate reachability pass.",
    mistake: "Do not store zero for a blocked cell in a minimizing problem. Zero is the cheapest value there is, so the route will happily walk straight through the obstacle and report a cost lower than any legal path.",
    checkpoint: "Why does a blocked cell on the top edge make the rest of that edge unreachable?",
    checkpointAnswer: "Because every cell on the top edge has exactly one predecessor, the cell to its left. Once that chain is broken, each following cell inherits the unreachable value and passes it on, so the whole remainder of the edge is shadowed without needing any extra logic.",
    remember: "Blocked cells need a sentinel that is correct under the combining operator. Zero works for counting and infinity for minimizing, and both propagate through the sweep on their own.",
    checks: [
      q("Why is zero the right sentinel for counting paths?", ["Zero ways contributes nothing to the cells it feeds", "Zero is the smallest count", "It marks the cell as visited"], 0, "The sentinel must be neutral under the combining operator.", ["Correct. Addition of zero leaves successors correct.", "Being smallest is not what makes it right.", "Nothing is tracking visits here."]),
      q("What breaks when a blocked cell stores zero in a minimizing problem?", ["The route walks through the obstacle, since zero is the cheapest cost", "The grid boundaries are lost", "The answer becomes infinite"], 0, "The sentinel must be unattractive to a minimum.", ["Correct. Infinity is the correct marker instead.", "Boundaries are handled separately.", "It goes too low, not too high."]),
      q("A blocked cell sits on the first row. What follows?", ["Every cell after it on that row is unreachable", "Only that cell is affected", "The first column is affected too"], 0, "Edge cells have a single predecessor.", ["Correct. The unreachable value propagates along the edge.", "The break cascades to the rest of the edge.", "The first column has its own independent chain."]),
    ],
  },
  {
    lessonId: "py.ac.m6_6.l3",
    atomId: "py.atom.algo.matrix-region-dp",
    conceptId: "py.algo.matrix-region-dp",
    title: "Region problems, and sweeping the grid backward",
    requires: ["py.algo.grid-obstacles"],
    vocabulary: [
      ["region state", "a cell standing for the best shape anchored at that cell"],
      ["three-neighbour minimum", "the limiting square found by taking the smallest of three adjacent answers"],
      ["backward sweep", "filling the grid from the far corner toward the start"],
      ["requirement state", "a value describing what must be true on entering a cell rather than on leaving it"],
    ],
    opening: "Two grid problems break the habit of sweeping from the top-left. One asks about the largest shape ending at a cell, and the other asks a question whose answer depends on the future, so it has to be filled backward.",
    outcome: "You will find the largest square of ones with a three-neighbour minimum, and fill a requirement grid by sweeping from the far corner.",
    why: "Maximal square is the canonical example of a state meaning a shape rather than a route, and the dungeon problem is the standard test of whether you can spot that a forward sweep cannot work.",
    mentalModel: "For the square, imagine each cell asking its three finished neighbours how large a square they can support, and being limited by the smallest of the three. For the dungeon, imagine costing a journey from the destination backward, because what you need now depends on what is still ahead.",
    firstTitle: "Maximal square: limited by the weakest neighbour",
    firstIntro: "A cell can anchor a square one larger than the smallest of the three squares beside and above it.",
    firstCode: `def maximal_square(grid):
    rows, cols = len(grid), len(grid[0])
    best = [[0] * cols for _ in range(rows)]
    side = 0
    for row in range(rows):
        for col in range(cols):
            if grid[row][col] == 0:
                continue
            if row == 0 or col == 0:
                best[row][col] = 1
            else:
                best[row][col] = 1 + min(best[row - 1][col],
                                         best[row][col - 1],
                                         best[row - 1][col - 1])
            side = max(side, best[row][col])
    return side * side

print(maximal_square([[1, 0, 1, 0, 0],
                      [1, 0, 1, 1, 1],
                      [1, 1, 1, 1, 1],
                      [1, 0, 0, 1, 0]]))
print(maximal_square([[0, 0], [0, 0]]))`,
    firstTrace: "Each cell stores the side of the largest square whose bottom-right corner it is. Taking the minimum of three neighbours is what forces the square to be solid, since any hole limits one of the three. That grid contains a square of side two, so the area is four.",
    secondTitle: "The dungeon grid must be filled backward",
    secondIntro: "The health you need at a cell depends on what lies ahead, so the sweep starts at the destination.",
    secondCode: `def minimum_health(dungeon):
    rows, cols = len(dungeon), len(dungeon[0])
    need = [[0] * (cols + 1) for _ in range(rows + 1)]
    huge = float("inf")
    for row in range(rows + 1):
        need[row][cols] = huge
    for col in range(cols + 1):
        need[rows][col] = huge
    need[rows][cols - 1] = 1
    need[rows - 1][cols] = 1
    for row in range(rows - 1, -1, -1):
        for col in range(cols - 1, -1, -1):
            ahead = min(need[row + 1][col], need[row][col + 1])
            need[row][col] = max(1, ahead - dungeon[row][col])
    return need[0][0]

print(minimum_health([[-2, -3, 3], [-5, -10, 1], [10, 30, -5]]))
print(minimum_health([[0]]))`,
    secondTrace: "Filling forward cannot work, because the best health at a cell is not decided until you know which route continues from it. Sweeping from the destination makes each cell ask what the cheaper of its two onward moves demands. The classic dungeon answers seven, and a single harmless room needs one point of health.",
    mistake: "Do not let the required health drop under one during a backward sweep. Picking up a large bonus makes the raw requirement negative, and clamping it at one is what encodes the rule that arriving alive is mandatory.",
    checkpoint: "How do you recognize that a grid problem needs a backward sweep?",
    checkpointAnswer: "The value at a cell depends on choices still to come rather than on how you arrived. If the quantity is a requirement for the remainder of the journey, the destination is the only place with a known answer, so the sweep has to start there.",
    remember: "A state can name a shape rather than a route, and a requirement grid fills backward from the destination. Clamp requirements at their legal minimum as you go.",
    checks: [
      q("Why does maximal square take the minimum of three neighbours?", ["Any hole in one of the three limits the solid square", "It is the cheapest of the three to compute", "The maximum would overflow"], 0, "Solidity is the constraint being enforced.", ["Correct. The weakest neighbour caps the side length.", "All three cost the same to read.", "No overflow is involved."]),
      q("Why must the dungeon problem be filled backward?", ["The requirement at a cell depends on the route still ahead", "The grid may contain negative numbers", "The destination is cheaper to reach"], 0, "Only the destination has a known answer.", ["Correct. A forward sweep has nothing to anchor on.", "Negative values appear in forward problems too.", "Cost is not what decides the direction."]),
      q("Why is the required health clamped at one?", ["Arriving alive is mandatory, whatever bonuses were collected", "It prevents division by zero", "It marks the cell as visited"], 0, "A large bonus would otherwise make the requirement negative.", ["Correct. The clamp encodes the survival rule.", "No division occurs.", "Visits are not tracked."]),
    ],
  },
  {
    lessonId: "py.ac.m6_6.l4",
    atomId: "py.atom.algo.string-dp",
    conceptId: "py.algo.string-dp",
    title: "String grids: interleaving and wildcard matching",
    requires: ["py.algo.matrix-region-dp"],
    vocabulary: [
      ["interleaving", "forming a string by taking characters from two others while keeping each one's order"],
      ["wildcard", "a pattern character standing for one character or for any run of them"],
      ["consume nothing", "a transition where the pattern advances and the text does not"],
      ["pattern state", "a state pairing a position in the text with a position in the pattern"],
    ],
    opening: "String matching problems look like they need cleverness and almost never do. The state is a pair of positions, the transitions are the legal ways to consume a character, and a wildcard is nothing more than a transition that consumes nothing.",
    outcome: "You will decide interleaving with a two-position state, and match a wildcard pattern by allowing a move that advances only the pattern.",
    why: "Wildcard and regular-expression matching are among the hardest problems asked at this level, and both become routine once you see that the star is a transition rather than a special case.",
    mentalModel: "Picture two rulers, one along the text and one along the pattern. Every move slides one ruler, the other, or both, and the question is whether any sequence of legal moves slides both to the end.",
    firstTitle: "Interleaving: a pair of positions is the whole state",
    firstIntro: "How much of each source string has been used determines everything that remains.",
    firstCode: `def is_interleave(a, b, target):
    if len(a) + len(b) != len(target):
        return False
    reachable = [[False] * (len(b) + 1) for _ in range(len(a) + 1)]
    reachable[0][0] = True
    for i in range(len(a) + 1):
        for j in range(len(b) + 1):
            if i and reachable[i - 1][j] and a[i - 1] == target[i + j - 1]:
                reachable[i][j] = True
            if j and reachable[i][j - 1] and b[j - 1] == target[i + j - 1]:
                reachable[i][j] = True
    return reachable[len(a)][len(b)]

print(is_interleave("aabcc", "dbbca", "aadbbcbcac"))
print(is_interleave("aabcc", "dbbca", "aadbbbaccc"))
print(is_interleave("", "", ""))`,
    firstTrace: "The position in the target is not part of the state, because it is always the two positions added together. Each transition takes the next character from one source and checks that it matches. The length check at the top rejects impossible inputs before any table is built.",
    secondTitle: "Wildcards: the star is a transition that consumes nothing",
    secondIntro: "Two moves are available at a star, and allowing both is the entire algorithm.",
    secondCode: `def wildcard_match(text, pattern):
    match = [[False] * (len(pattern) + 1) for _ in range(len(text) + 1)]
    match[0][0] = True
    for j in range(1, len(pattern) + 1):
        if pattern[j - 1] == "*":
            match[0][j] = match[0][j - 1]
    for i in range(1, len(text) + 1):
        for j in range(1, len(pattern) + 1):
            symbol = pattern[j - 1]
            if symbol == "*":
                match[i][j] = match[i - 1][j] or match[i][j - 1]
            elif symbol in ("?", text[i - 1]):
                match[i][j] = match[i - 1][j - 1]
    return match[len(text)][len(pattern)]

for text, pattern in (("aa", "a"), ("aa", "*"), ("cb", "?a"), ("adceb", "*a*b")):
    print(text, pattern, wildcard_match(text, pattern))`,
    secondTrace: "A star either absorbs one more character of the text or steps past without consuming anything, which is what the two-way or expresses. Seeding the first row lets a pattern of stars alone match the empty text. Those four cases answer false, true, false and true.",
    mistake: "Do not treat a star as matching greedily and move on. Absorbing as much as possible commits you to a choice the rest of the pattern may not survive, and the two-way transition is what lets the table consider both options without backtracking.",
    checkpoint: "Why is the position in the target string not part of the interleaving state?",
    checkpointAnswer: "Because it is always the sum of the two source positions. Every move consumes exactly one character from a source and one from the target, so storing it separately would add a dimension whose value is already determined by the other two.",
    remember: "The state is a pair of positions, and a transition consumes from one side, the other, or both. A star is the transition that advances the pattern while consuming nothing.",
    checks: [
      q("What is the state in a two-string matching problem?", ["A position in each string", "The characters currently being compared", "The number of matches so far"], 0, "Prefix positions determine what remains.", ["Correct. Everything else follows from that pair.", "The characters are read from the positions.", "The count is a stored value, not the state."]),
      q("How is a wildcard star handled?", ["As a two-way transition: absorb a character or consume nothing", "By matching as many characters as possible", "By skipping the pattern entirely"], 0, "Both options must remain open.", ["Correct. The table considers both without backtracking.", "Greedy absorption can strand the rest of the pattern.", "Skipping it would ignore the pattern's meaning."]),
      q("Why does interleaving check the combined length first?", ["Every character of the target must come from exactly one source", "It speeds up the table fill", "The table would be the wrong shape"], 0, "A length mismatch makes the answer immediate.", ["Correct. No table is needed to reject it.", "The saving is the whole computation, not a speedup.", "The table shape depends only on the source lengths."]),
    ],
  },
];

export const ALGO_GRID_DP_ATOMS = ALGO_GRID_DP_SPECS.map(guidedMasteryAtom);
export const ALGO_GRID_DP_CONCEPTS = ALGO_GRID_DP_SPECS.map(guidedMasteryConcept);
export const ALGO_GRID_DP_LESSON_CONTENT = guidedLessonContent(ALGO_GRID_DP_SPECS);

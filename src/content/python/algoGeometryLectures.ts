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

const ALGO_GEOMETRY_SPECS: GuidedMasterySpec[] = [
  {
    lessonId: "py.ac.m8_3.l1",
    atomId: "py.atom.algo.cross-product",
    conceptId: "py.algo.cross-product",
    title: "The cross product replaces every slope calculation",
    requires: ["py.algo.xor-properties"],
    vocabulary: [
      ["cross product", "a signed value measuring how two vectors turn relative to each other"],
      ["orientation", "whether three points turn left, turn right, or lie on one line"],
      ["signed area", "twice the area of a triangle, carrying a sign for its winding"],
      ["degenerate case", "an input where a general formula divides by zero or loses meaning"],
    ],
    opening: "Almost every geometry bug comes from slopes. A vertical line divides by zero, and comparing two slopes for equality compares two floating-point numbers. One integer formula avoids both problems and answers more questions.",
    outcome: "You will compute the orientation of three points from a cross product, and use its sign rather than any slope comparison.",
    why: "Convex hulls, segment intersection, point-in-polygon and sweep algorithms are all built from this one test. Using integers keeps it exact, which no slope-based version manages.",
    mentalModel: "Picture walking from the first point to the second, then turning toward the third. The sign of the cross product is which way you turned, and zero means you did not turn at all.",
    firstTitle: "One formula, three answers",
    firstIntro: "The sign tells you the turn direction, and zero means the three points are collinear.",
    firstCode: `def cross(origin, first, second):
    return ((first[0] - origin[0]) * (second[1] - origin[1])
            - (first[1] - origin[1]) * (second[0] - origin[0]))

def orientation(origin, first, second):
    value = cross(origin, first, second)
    if value > 0:
        return "left"
    if value < 0:
        return "right"
    return "straight"

base = (0, 0)
along = (1, 0)
for third in ((0, 1), (1, -1), (2, 0), (5, 0)):
    print(f"{third}: cross {cross(base, along, third):>3}  "
          f"turn {orientation(base, along, third)}")`,
    firstTrace: "A positive value means the third point lies to the left of the first two, and a negative value means the right. Zero means all three lie on one line, however far apart they are. Every input here is an integer, so the comparison is exact and no tolerance is needed.",
    secondTitle: "Slopes fail where the cross product does not",
    secondIntro: "A vertical segment has no slope, and equal slopes are two floating-point numbers being compared.",
    secondCode: `def slope_collinear(a, b, c):
    try:
        first = (b[1] - a[1]) / (b[0] - a[0])
        second = (c[1] - a[1]) / (c[0] - a[0])
        return first == second
    except ZeroDivisionError:
        return "undefined"

def cross_collinear(a, b, c):
    return ((b[0] - a[0]) * (c[1] - a[1])
            - (b[1] - a[1]) * (c[0] - a[0])) == 0

cases = [((0, 0), (0, 1), (0, 2)),
         ((0, 0), (1, 3), (2, 6)),
         ((0, 0), (3, 1), (6, 2))]
for a, b, c in cases:
    print(f"{a} {b} {c}: slope says {slope_collinear(a, b, c)!s:>9}  "
          f"cross says {cross_collinear(a, b, c)}")`,
    secondTrace: "The vertical case makes the slope version raise rather than answer, and the cross product handles it with no special case at all. The other two are genuinely collinear and both methods agree, though only one of them stayed in integers throughout. Removing the division is what removes the whole class of failure.",
    mistake: "Do not compare the cross product against a tolerance when the coordinates are integers. Exact zero is the correct test, and introducing a tolerance makes nearly-collinear points register as collinear, which breaks hull algorithms in ways that are very hard to trace.",
    checkpoint: "Three points give a cross product of zero. What do you know, and what do you not?",
    checkpointAnswer: "They lie on a single line, and nothing about their order along it. The third point may sit between the first two or far beyond either, and deciding that needs a separate comparison of the coordinates rather than another orientation test.",
    remember: "The cross product's sign is the turn direction and zero means collinear. It needs no division, so it has no vertical special case and stays exact on integer coordinates.",
    checks: [
      q("What does a cross product of zero mean?", ["The three points are collinear", "The points form a right angle", "Two points coincide"], 0, "No turn is made at all.", ["Correct. Their order along the line is a separate question.", "A right angle gives a non-zero value.", "Coinciding points are one way to get zero, not the only one."]),
      q("Why is the cross product preferred over comparing slopes?", ["It needs no division, so verticals and rounding are not special cases", "It is faster to type", "It handles three dimensions"], 0, "Division is what introduces both failures.", ["Correct. Integer inputs stay exact.", "Brevity is not the reason.", "This is the two-dimensional version."]),
      q("Coordinates are integers. How should collinearity be tested?", ["Against exact zero", "Against a small tolerance", "By comparing slopes"], 0, "Integer arithmetic is exact.", ["Correct. A tolerance would merge distinct configurations.", "Tolerances belong to floating-point inputs.", "Slopes reintroduce division."]),
    ],
  },
  {
    lessonId: "py.ac.m8_3.l2",
    atomId: "py.atom.algo.line-sweep",
    conceptId: "py.algo.line-sweep",
    title: "A sweep turns a plane problem into a sorted list",
    requires: ["py.algo.cross-product"],
    vocabulary: [
      ["sweep line", "an imaginary line moving across the plane in one direction"],
      ["event", "a coordinate where the set of active objects changes"],
      ["active set", "the objects the sweep line currently crosses"],
      ["event order", "the sorting rule that decides which event is processed first"],
    ],
    opening: "Comparing every pair of objects is quadratic, and almost always unnecessary. Sorting the moments when something starts or stops, then walking them in order, reduces the problem to whatever is active right now.",
    outcome: "You will build an event list, process it in order, and choose the tie-breaking rule that makes the answer correct.",
    why: "Interval merging, meeting rooms, skyline and segment intersection are all this pattern. The tie-break between a start and an end at the same coordinate is where most implementations go wrong.",
    mentalModel: "Picture a vertical line dragged across a page from left to right. Objects appear as it reaches their left edge and disappear at their right, and at any moment you only care about what it is touching.",
    firstTitle: "Events, sorted, then walked",
    firstIntro: "Each interval contributes a start and an end, and the maximum active count is read off the walk.",
    firstCode: `def max_overlap(intervals):
    events = []
    for start, end in intervals:
        events.append((start, 1))
        events.append((end, -1))
    events.sort(key=lambda event: (event[0], -event[1]))
    active = 0
    best = 0
    for position, delta in events:
        active += delta
        best = max(best, active)
    return best

print(max_overlap([(1, 4), (2, 5), (7, 9)]))
print(max_overlap([(1, 2), (2, 3), (3, 4)]))
print(max_overlap([]))`,
    firstTrace: "Two of the first three intervals overlap, so the answer is two. The chained intervals in the second case touch at their endpoints and the sort order decides whether that counts as an overlap. Here starts are processed before ends at the same coordinate, so touching intervals do count, and the answer is two rather than one.",
    secondTitle: "The tie-break is the specification",
    secondIntro: "Flipping which of a start and an end goes first changes the answer at every shared coordinate.",
    secondCode: `def max_overlap(intervals, closed=True):
    events = []
    for start, end in intervals:
        events.append((start, 1))
        events.append((end, -1))
    order = (lambda event: (event[0], -event[1])) if closed else (
        lambda event: (event[0], event[1]))
    events.sort(key=order)
    active = best = 0
    for _, delta in events:
        active += delta
        best = max(best, active)
    return best

touching = [(1, 2), (2, 3), (3, 4)]
print("treating endpoints as shared: ", max_overlap(touching, closed=True))
print("treating endpoints as free:   ", max_overlap(touching, closed=False))
print("meeting rooms usually want the second")`,
    secondTrace: "The same intervals answer two or one depending only on the sort key. Neither is more correct in general; the problem statement decides whether a room freed at three can be booked at three. Writing that choice down before coding is what prevents an off-by-one nobody can find later.",
    mistake: "Do not sort the events by coordinate alone. Ties are then broken arbitrarily by whatever the sort happens to do, so the answer changes with the input order and the bug appears only on inputs where two events share a coordinate.",
    checkpoint: "Meeting rooms are freed the moment a meeting ends. Which tie-break do you need?",
    checkpointAnswer: "Ends before starts at the same coordinate. A meeting finishing at three must release its room before the meeting starting at three claims one, otherwise the count peaks at one higher than it should and an extra room is reported.",
    remember: "Turn objects into start and end events, sort them, and walk. The tie-break between a start and an end at the same coordinate is part of the specification, not a detail.",
    checks: [
      q("What does a sweep replace?", ["Comparing every pair of objects", "Sorting the input", "Recursion"], 0, "Only the currently active objects matter.", ["Correct. That is what removes the quadratic term.", "The sweep depends on sorting.", "Sweeps are usually iterative anyway."]),
      q("Why must events be sorted with an explicit tie-break?", ["Two events at one coordinate would otherwise be ordered arbitrarily", "Sorting is unstable", "Coordinates may be equal"], 0, "The order at a tie changes the answer.", ["Correct. The bug only shows on shared coordinates.", "Stability is a separate property.", "Equal coordinates are exactly when it matters."]),
      q("Rooms are freed the instant a meeting ends. What order do you need?", ["Ends before starts at the same coordinate", "Starts before ends", "Either works"], 0, "The room must be released first.", ["Correct. Otherwise the count peaks one too high.", "That models rooms that stay occupied.", "The two give different answers."]),
    ],
  },
  {
    lessonId: "py.ac.m8_3.l3",
    atomId: "py.atom.algo.convex-hull",
    conceptId: "py.algo.convex-hull",
    title: "The hull falls out of repeated orientation tests",
    requires: ["py.algo.line-sweep"],
    vocabulary: [
      ["convex hull", "the smallest convex shape containing every point"],
      ["monotone chain", "building the hull as a lower and an upper half after sorting"],
      ["non-left turn", "a turn that fails the orientation test and removes a point"],
      ["collinear policy", "whether points on a hull edge are kept or discarded"],
    ],
    opening: "The convex hull looks like a shape problem and is really a stack problem. Sort the points, walk them, and pop anything that would make the boundary turn the wrong way.",
    outcome: "You will build a hull from two monotone chains, and decide what to do with points lying exactly on an edge.",
    why: "Hulls appear in collision detection, optimization and several interview questions, and the monotone-chain version is short enough to write from memory once the orientation test is familiar.",
    mentalModel: "Picture stretching a rubber band around a scatter of pins. It touches only the outermost pins, and any pin that would make it bend inward is simply not touched.",
    firstTitle: "Sort, then pop the wrong turns",
    firstIntro: "The lower and upper halves use the same loop, walked in opposite directions.",
    firstCode: `def cross(o, a, b):
    return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])

def hull(points):
    ordered = sorted(set(points))
    if len(ordered) <= 2:
        return ordered

    def chain(sequence):
        stack = []
        for point in sequence:
            while len(stack) >= 2 and cross(stack[-2], stack[-1], point) <= 0:
                stack.pop()
            stack.append(point)
        return stack

    lower = chain(ordered)
    upper = chain(reversed(ordered))
    return lower[:-1] + upper[:-1]

points = [(0, 0), (1, 1), (2, 2), (2, 0), (0, 2), (1, 0), (3, 1)]
print("hull:", hull(points))
print("interior points were dropped:", len(points), "->", len(hull(points)))`,
    firstTrace: "Seven points reduce to five on the boundary, and the interior ones never survive the popping. Each chain walks the sorted points and removes any point that would bend the boundary inward. Dropping the last element of each chain avoids listing the two shared corners twice.",
    secondTitle: "Collinear points are a policy decision",
    secondIntro: "Whether the comparison is strict decides if points on an edge stay in the answer.",
    secondCode: `def cross(o, a, b):
    return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])

def hull(points, keep_collinear=False):
    ordered = sorted(set(points))
    if len(ordered) <= 2:
        return ordered
    limit = 0 if keep_collinear else -1

    def chain(sequence):
        stack = []
        for point in sequence:
            while len(stack) >= 2 and cross(stack[-2], stack[-1], point) < -limit:
                stack.pop()
            stack.append(point)
        return stack

    return chain(ordered)[:-1] + chain(reversed(ordered))[:-1]

square = [(0, 0), (1, 0), (2, 0), (2, 2), (0, 2)]
print("corners only:   ", hull(square))
print("edge points too:", hull(square, keep_collinear=True))`,
    secondTrace: "The point halfway along the bottom edge is either dropped or kept, and both answers describe the same shape. Which one you want depends on the problem, and an interviewer will usually ask. Making the choice explicit in a parameter is better than burying it in a comparison operator.",
    mistake: "Do not forget to remove duplicate points before building the hull. Two identical points give a cross product of zero against anything, so they survive every test and can appear twice in the output or stall the popping loop.",
    checkpoint: "A hull is built on points that include several duplicates of one corner. What goes wrong?",
    checkpointAnswer: "The duplicates all register as collinear with everything, so they are never popped and the output lists that corner several times. Putting the points through a set before the walk removes them, which is why the input is deduplicated rather than merely sorted.",
    remember: "Sort the points, walk them twice, and pop anything that turns the wrong way. Deduplicate first, and decide explicitly whether points on an edge belong in the answer.",
    checks: [
      q("What does the monotone chain method pop from its stack?", ["Points that would bend the boundary inward", "Points furthest from the centre", "Duplicate points"], 0, "The orientation test decides.", ["Correct. Interior points never survive.", "Distance is not what is tested.", "Duplicates are removed before the walk."]),
      q("Why is the last element of each chain dropped?", ["The two chains share their end corners", "It is always an interior point", "The chains have different lengths"], 0, "Otherwise each corner appears twice.", ["Correct. The halves meet at the extreme points.", "The ends are hull corners.", "Length is not the issue."]),
      q("What decides whether points on a hull edge are kept?", ["Whether the orientation comparison is strict", "The sort order", "The number of points"], 0, "It is a policy, not a correctness question.", ["Correct. Both answers describe the same shape.", "Sorting is the same either way.", "Size does not change the policy."]),
    ],
  },
  {
    lessonId: "py.ac.m8_3.l4",
    atomId: "py.atom.algo.randomized-algorithms",
    conceptId: "py.algo.randomized-algorithms",
    title: "Randomness buys expected time and bounded memory",
    requires: ["py.algo.convex-hull"],
    vocabulary: [
      ["reservoir sampling", "keeping a uniform sample from a stream of unknown length"],
      ["expected running time", "the average cost over the algorithm's own random choices"],
      ["adversarial input", "an input constructed to trigger a specific algorithm's worst case"],
      ["quickselect", "finding the kth smallest value by partitioning without fully sorting"],
    ],
    opening: "Randomness in an algorithm is not about the input being random. It is about the algorithm making its own unpredictable choices, so that no particular input can be constructed to defeat it.",
    outcome: "You will sample uniformly from a stream of unknown length, select the kth smallest value by partitioning, and state what the expected bounds do and do not promise.",
    why: "Reservoir sampling is the standard answer whenever data does not fit in memory, and randomized pivots are what make quickselect and quicksort safe against adversarial inputs.",
    mentalModel: "Picture interviewing candidates one at a time without knowing how many will arrive. Each new arrival replaces your current pick with a probability that keeps every candidate equally likely to be the one you hold.",
    firstTitle: "One pass, bounded memory, uniform sample",
    firstIntro: "The kth item replaces a held item with probability that keeps the sample uniform.",
    firstCode: `import random

def reservoir(stream, size, seed=0):
    rng = random.Random(seed)
    kept = []
    for index, item in enumerate(stream):
        if index < size:
            kept.append(item)
        else:
            spot = rng.randrange(index + 1)
            if spot < size:
                kept[spot] = item
    return kept

print("sample of 5 from 100:", reservoir(range(100), 5))
print("sample of 3 from 10: ", reservoir(range(10), 3))
print("stream shorter than the sample:", reservoir(range(2), 5))
print("memory used is the sample size, not the stream length")`,
    firstTrace: "The whole stream is never stored, so a stream of a billion items costs the same memory as one of ten. The replacement probability shrinks as the stream grows, which is exactly what keeps every item equally likely to survive. A stream shorter than the sample simply returns everything it had.",
    secondTitle: "A random pivot removes the adversarial worst case",
    secondIntro: "Partitioning around a random element finds the kth smallest without sorting the rest.",
    secondCode: `import random

def quickselect(values, k, seed=1):
    rng = random.Random(seed)
    items = list(values)
    low, high = 0, len(items) - 1
    while True:
        pivot = rng.randint(low, high)
        items[pivot], items[high] = items[high], items[pivot]
        store = low
        for i in range(low, high):
            if items[i] < items[high]:
                items[i], items[store] = items[store], items[i]
                store += 1
        items[store], items[high] = items[high], items[store]
        if store == k:
            return items[store]
        if store < k:
            low = store + 1
        else:
            high = store - 1

data = [7, 2, 9, 4, 1, 8, 3]
print("selected in order:", [quickselect(data, k) for k in range(len(data))])
print("sorted for comparison:", sorted(data))`,
    secondTrace: "Selecting every position in turn reproduces the sorted list, which is the check worth writing. Only one side of each partition is explored, so the expected cost is linear rather than the n log n a full sort would spend. The random pivot is what makes that expectation hold on every input rather than on average inputs.",
    mistake: "Do not confuse expected time with a guarantee. A randomized algorithm can still hit its worst case on any run, and the promise is only that repeated bad luck becomes vanishingly unlikely.",
    checkpoint: "Why does a random pivot help when the input is already sorted?",
    checkpointAnswer: "Because a fixed pivot rule, such as always taking the last element, partitions a sorted input into one empty side and one side of everything else, which is the quadratic worst case. A random pivot makes that split unlikely regardless of the input, so no input order can force the bad behaviour.",
    remember: "Reservoir sampling keeps a uniform sample in memory proportional to the sample, not the stream. A random pivot makes the worst case unlikely on every input rather than merely on average ones.",
    checks: [
      q("How much memory does reservoir sampling use?", ["Proportional to the sample size", "Proportional to the stream length", "Constant regardless of the sample"], 0, "The stream is never stored.", ["Correct. A billion-item stream costs the same as ten.", "That is what the method avoids.", "It scales with the sample."]),
      q("What does a random pivot protect against?", ["An input ordered to trigger the worst case", "Rounding errors", "Duplicate values"], 0, "The algorithm's own choices become unpredictable.", ["Correct. A sorted input defeats a fixed pivot rule.", "No floating-point work is involved.", "Duplicates are a separate concern."]),
      q("What does an expected linear bound promise?", ["An average over the algorithm's random choices, not a guarantee", "That the worst case cannot occur", "A bound on memory"], 0, "Any single run can still be unlucky.", ["Correct. Repeated bad luck becomes vanishingly unlikely.", "The worst case remains possible.", "The bound is on time."]),
    ],
  },
];

export const ALGO_GEOMETRY_ATOMS = ALGO_GEOMETRY_SPECS.map(guidedMasteryAtom);
export const ALGO_GEOMETRY_CONCEPTS = ALGO_GEOMETRY_SPECS.map(guidedMasteryConcept);
export const ALGO_GEOMETRY_LESSON_CONTENT = guidedLessonContent(ALGO_GEOMETRY_SPECS);

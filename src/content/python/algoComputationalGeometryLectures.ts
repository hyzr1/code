import {
  guidedLessonContent,
  guidedMasteryAtom,
  guidedMasteryConcept,
  type GuidedMasterySpec,
} from "./guidedMastery";

const ALGO_COMPUTATIONAL_GEOMETRY_SPECS: GuidedMasterySpec[] = [
  {
    lessonId: "py.ac.m12_5.l1",
    atomId: "py.atom.algo.hull-algorithms",
    conceptId: "py.algo.hull-algorithms",
    title: "Convex hull algorithms",
    requires: ["py.algo.convex-hull"],
    vocabulary: [
      ["cross product sign", "whether three points turn left, turn right or lie on a line"],
      ["monotone chain", "building the hull as a lower and an upper chain over sorted points"],
      ["degenerate input", "collinear or duplicated points that break a careless implementation"],
    ],
    opening:
      "The convex hull is the shape a rubber band would take around the points. Building it is a sort plus two passes, and every difficulty is in the degenerate cases.",
    outcome:
      "You will build the hull by monotone chain and decide deliberately what happens to collinear points.",
    why:
      "Diameter, width, and closest-pair-on-a-hull questions all start from the hull, and a hull with stray collinear points breaks the algorithms that follow.",
    mentalModel:
      "Picture sweeping left to right building the bottom edge, then right to left building the top. A point that makes the chain turn the wrong way is popped.",
    firstTitle: "Two chains, one sort",
    firstIntro:
      "Sort by coordinate, then walk forward popping any point that does not turn left. Walking back does the upper chain with the same rule.",
    firstCode: `def cross(o, a, b):
    return ((a[0] - o[0]) * (b[1] - o[1])
            - (a[1] - o[1]) * (b[0] - o[0]))

def convex_hull(points):
    pts = sorted(set(points))
    if len(pts) <= 2:
        return pts
    lower = []
    for p in pts:
        while len(lower) >= 2 and cross(lower[-2], lower[-1], p) <= 0:
            lower.pop()
        lower.append(p)
    upper = []
    for p in reversed(pts):
        while len(upper) >= 2 and cross(upper[-2], upper[-1], p) <= 0:
            upper.pop()
        upper.append(p)
    return lower[:-1] + upper[:-1]

points = [(0, 0), (1, 1), (2, 2), (3, 0), (0, 3), (3, 3), (1, 2)]
print(convex_hull(points))`,
    firstTrace:
      "Four corners, and the points at one-one and two-two are gone. They lie on the diagonal, so the strict comparison dropped them.",
    secondTitle: "Collinear is a choice",
    secondIntro:
      "Comparing against zero or against a strict inequality decides whether points on an edge survive. Neither is right in general; the consumer decides.",
    secondCode: `square = [(0, 0), (0, 1), (1, 0), (1, 1), (0.5, 0.5)]
print(convex_hull(square))
print(convex_hull([(0, 0), (1, 1)]))
print(convex_hull([(2, 2)]))`,
    secondTrace:
      "The interior point is dropped and the four corners remain. Two points return themselves and a single point returns itself, which the guard handles.",
    mistake:
      "Using floating-point coordinates and comparing the cross product against exact zero. With integer input the comparison is exact; with floats it needs a tolerance chosen from the coordinate magnitude.",
    checkpoint:
      "What decides whether a point on an edge stays in the hull?",
    checkpointAnswer:
      "Whether the cross-product test uses a strict or non-strict comparison against zero. It is a deliberate choice, not a detail.",
    remember:
      "Sort, two chains, and decide about collinear on purpose.",
    checks: [
      {
        question: "What does the sign of the cross product tell you?",
        choices: [
          "Whether three points turn left, right or lie on a line",
          "The distance between two points",
          "Which point is furthest from the origin",
        ],
        answer: 0,
        explanation: "It is an orientation test.",
        why: [
          "Correct. That is the whole primitive.",
          "Distance needs a different formula.",
          "It says nothing about the origin.",
        ],
      },
      {
        question: "Why is the input sorted first?",
        choices: [
          "So the two chains can be built in one pass each",
          "To remove duplicates",
          "To find the centroid",
        ],
        answer: 0,
        explanation: "The sweep depends on the order.",
        why: [
          "Correct. Sorting dominates the running time.",
          "Deduplication is a separate step.",
          "No centroid is computed.",
        ],
      },
      {
        question: "Coordinates are floating point. What must change?",
        choices: [
          "The zero comparison needs a tolerance",
          "The sort order",
          "The chain count",
        ],
        answer: 0,
        explanation: "Exact zero is unreliable with floats.",
        why: [
          "Correct, and the tolerance depends on the magnitudes.",
          "Sorting is unaffected.",
          "Two chains are still needed.",
        ],
      },
    ],
  },
  {
    lessonId: "py.ac.m12_5.l2",
    atomId: "py.atom.algo.rotating-calipers",
    conceptId: "py.algo.rotating-calipers",
    title: "Rotating calipers",
    requires: ["py.algo.hull-algorithms"],
    vocabulary: [
      ["antipodal pair", "two hull vertices that can be touched by parallel supporting lines"],
      ["diameter", "the greatest distance between any two points of a set"],
      ["supporting line", "a line touching the hull without crossing it"],
    ],
    opening:
      "The furthest two points of a set are both on its hull, and they are an antipodal pair. That reduces a quadratic search to one walk around the boundary.",
    outcome:
      "You will find the diameter by advancing a second pointer around the hull and confirm it against a full pairwise scan.",
    why:
      "Diameter, width and the smallest enclosing rectangle all fall out of the same walk, and the quadratic version is unusable on large inputs.",
    mentalModel:
      "Picture two parallel lines squeezing the hull. Rotating them together traces every antipodal pair exactly once, and the pointer never goes backward.",
    firstTitle: "One pointer, one lap",
    firstIntro:
      "For each hull vertex, advance the opposite pointer while doing so increases the distance. Because the hull is convex, that pointer only ever moves forward.",
    firstCode: `import math

def cross(o, a, b):
    return ((a[0] - o[0]) * (b[1] - o[1])
            - (a[1] - o[1]) * (b[0] - o[0]))

def convex_hull(points):
    pts = sorted(set(points))
    if len(pts) <= 2:
        return pts
    lower, upper = [], []
    for p in pts:
        while len(lower) >= 2 and cross(lower[-2], lower[-1], p) <= 0:
            lower.pop()
        lower.append(p)
    for p in reversed(pts):
        while len(upper) >= 2 and cross(upper[-2], upper[-1], p) <= 0:
            upper.pop()
        upper.append(p)
    return lower[:-1] + upper[:-1]

def diameter(points):
    hull = convex_hull(points)
    n = len(hull)
    if n < 2:
        return 0.0, 0
    best, checks, j = 0.0, 0, 1
    for i in range(n):
        while True:
            checks += 1
            here = ((hull[i][0] - hull[j][0]) ** 2
                    + (hull[i][1] - hull[j][1]) ** 2)
            k = (j + 1) % n
            there = ((hull[i][0] - hull[k][0]) ** 2
                     + (hull[i][1] - hull[k][1]) ** 2)
            if there > here:
                j = k
            else:
                break
        best = max(best, here)
    return round(math.sqrt(best), 6), checks

points = [(0, 0), (4, 0), (4, 3), (0, 3), (2, 1)]
print(diameter(points))`,
    firstTrace:
      "A diameter of five after eight distance checks. The interior point never entered the walk because it is not on the hull.",
    secondTitle: "Checked against every pair",
    secondIntro:
      "The claim is that the furthest pair is antipodal. Comparing against a full pairwise scan is the way to be sure the walk did not miss it.",
    secondCode: `import math

brute = max(math.dist(a, b) for a in points for b in points)
print(round(brute, 6))
print("pairwise comparisons:", len(points) ** 2)`,
    secondTrace:
      "Five again, from twenty-five comparisons instead of eight. On ten thousand points that ratio is a hundred million against a few tens of thousands.",
    mistake:
      "Running the walk on the raw point set. It only works on the hull in order, so an unsorted or non-convex input makes the pointer wander and the answer is wrong.",
    checkpoint:
      "Why does the second pointer never move backward?",
    checkpointAnswer:
      "Because the hull is convex, so the furthest vertex from each successive vertex also advances around the boundary.",
    remember:
      "Hull first, then one forward-only lap.",
    checks: [
      {
        question: "Where do the two furthest points always lie?",
        choices: ["On the convex hull", "At the centroid", "On the same edge"],
        answer: 0,
        explanation: "An interior point is always dominated.",
        why: [
          "Correct. That is why the hull comes first.",
          "The centroid is usually interior.",
          "They are typically far apart on the boundary.",
        ],
      },
      {
        question: "How many times does the second pointer go round?",
        choices: ["Once, in total", "Once per vertex", "Twice per vertex"],
        answer: 0,
        explanation: "It only ever advances.",
        why: [
          "Correct. That is what makes the walk linear.",
          "That would make it quadratic again.",
          "It never revisits a vertex.",
        ],
      },
      {
        question: "The walk is run on the unsorted point set. What happens?",
        choices: [
          "The pointer wanders and the answer is wrong",
          "It is merely slower",
          "It still works",
        ],
        answer: 0,
        explanation: "Convex order is what the argument relies on.",
        why: [
          "Correct. The hull in order is a precondition.",
          "Correctness fails, not just speed.",
          "The monotonicity argument no longer holds.",
        ],
      },
    ],
  },
  {
    lessonId: "py.ac.m12_5.l3",
    atomId: "py.atom.algo.half-plane-intersection",
    conceptId: "py.algo.half-plane-intersection",
    title: "Half-plane intersection",
    requires: ["py.algo.rotating-calipers"],
    vocabulary: [
      ["half-plane", "everything on one side of a straight line, including the line"],
      ["feasible region", "the intersection of every half-plane, which is always convex"],
      ["clipping", "cutting a polygon down to the part satisfying one more constraint"],
    ],
    opening:
      "Each linear constraint keeps one side of a line. Intersecting them all gives a convex region, and it can perfectly well be empty.",
    outcome:
      "You will clip a polygon by successive half-planes and detect when the constraints contradict each other.",
    why:
      "Feasibility questions, visibility regions and linear programs in two dimensions are all this computation.",
    mentalModel:
      "Picture starting with a large box and slicing a piece off with each constraint. What survives is the feasible region, which shrinks and never grows.",
    firstTitle: "Clip once per constraint",
    firstIntro:
      "Walk the polygon's edges. Keep vertices satisfying the constraint, and where an edge crosses the boundary insert the crossing point.",
    firstCode: `def inside(point, line):
    a, b, c = line
    return a * point[0] + b * point[1] + c <= 1e-12

def clip(polygon, line):
    a, b, c = line
    out = []
    for i in range(len(polygon)):
        cur = polygon[i]
        nxt = polygon[(i + 1) % len(polygon)]
        cur_in, nxt_in = inside(cur, line), inside(nxt, line)
        if cur_in:
            out.append(cur)
        if cur_in != nxt_in:
            dc = a * cur[0] + b * cur[1] + c
            dn = a * nxt[0] + b * nxt[1] + c
            t = dc / (dc - dn)
            out.append((cur[0] + t * (nxt[0] - cur[0]),
                        cur[1] + t * (nxt[1] - cur[1])))
    return out

box = [(0, 0), (10, 0), (10, 10), (0, 10)]
region = box
for line in [(1, 0, -6), (0, 1, -6)]:
    region = clip(region, line)
print([(round(x, 1), round(y, 1)) for x, y in region])`,
    firstTrace:
      "The ten-by-ten box becomes a six-by-six one. Each constraint removed a strip, and the result is still convex.",
    secondTitle: "Contradiction is a normal outcome",
    secondIntro:
      "Two constraints demanding opposite things leave nothing. An empty region is an answer, not a failure, and the code must return it cleanly.",
    secondCode: `region = box
for line in [(1, 0, -2), (-1, 0, 3)]:
    region = clip(region, line)
print("region:", region)
print("feasible:", bool(region))`,
    secondTrace:
      "Nothing survives. One constraint caps the coordinate at two and the other demands at least three, so the region is genuinely empty.",
    mistake:
      "Starting from a box that is too small. Every constraint is applied against that box, so a feasible region extending beyond it is silently truncated and the answer is wrong.",
    checkpoint:
      "Why is the feasible region always convex?",
    checkpointAnswer:
      "Each half-plane is convex, and the intersection of convex sets is convex. That holds however many constraints there are.",
    remember:
      "Start large, clip once per constraint, and accept an empty result.",
    checks: [
      {
        question: "What shape is the intersection of half-planes?",
        choices: ["Always convex", "Sometimes concave", "Always a triangle"],
        answer: 0,
        explanation: "Intersections of convex sets are convex.",
        why: [
          "Correct, and possibly empty or unbounded.",
          "Concavity cannot arise from this operation.",
          "The vertex count depends on the constraints.",
        ],
      },
      {
        question: "The region comes back empty. What does that mean?",
        choices: [
          "The constraints contradict each other",
          "The code failed",
          "The starting box was convex",
        ],
        answer: 0,
        explanation: "It is a meaningful answer.",
        why: [
          "Correct. Infeasibility is a valid outcome.",
          "An empty result is not an error.",
          "Convexity of the box is unrelated.",
        ],
      },
      {
        question: "The starting box is smaller than the true feasible region. What happens?",
        choices: [
          "The result is silently truncated",
          "The clip raises an error",
          "The box expands automatically",
        ],
        answer: 0,
        explanation: "Every constraint is applied against the box.",
        why: [
          "Correct. The box must bound anything of interest.",
          "Nothing detects the truncation.",
          "The box is fixed at the start.",
        ],
      },
    ],
  },
  {
    lessonId: "py.ac.m12_5.l4",
    atomId: "py.atom.algo.segment-sweeps",
    conceptId: "py.algo.segment-sweeps",
    title: "Segment-intersection sweeps",
    requires: ["py.algo.half-plane-intersection"],
    vocabulary: [
      ["event queue", "the sorted list of positions where the sweep must stop"],
      ["active set", "the segments the sweep line currently crosses, ordered by height"],
      ["orientation test", "the cross-product sign deciding which side of a line a point lies on"],
    ],
    opening:
      "Testing every pair of segments is quadratic. A sweep only ever compares segments that are simultaneously crossed by the same vertical line.",
    outcome:
      "You will build the event queue, test crossings with orientations, and see why the active set is what saves the work.",
    why:
      "Map overlays, collision detection and polygon boolean operations are all built on this sweep.",
    mentalModel:
      "Picture a vertical line moving left to right. Segments enter and leave, and only neighbours in the active set can possibly cross.",
    firstTitle: "The crossing test",
    firstIntro:
      "Two segments cross when each separates the other's endpoints. Four orientation tests decide it without computing any intersection point.",
    firstCode: `def orientation(a, b, c):
    value = ((b[0] - a[0]) * (c[1] - a[1])
             - (b[1] - a[1]) * (c[0] - a[0]))
    return (value > 0) - (value < 0)

def crosses(first, second):
    a, b = first
    c, d = second
    signs = (orientation(a, b, c), orientation(a, b, d),
             orientation(c, d, a), orientation(c, d, b))
    if 0 in signs:
        return False
    return signs[0] != signs[1] and signs[2] != signs[3]

segments = [((0, 0), (4, 4)), ((0, 4), (4, 0)),
            ((5, 0), (6, 1)), ((5, 1), (6, 0))]
print([(i, j) for i in range(len(segments))
       for j in range(i + 1, len(segments))
       if crosses(segments[i], segments[j])])`,
    firstTrace:
      "Two crossing pairs, each within its own cluster. A zero sign means an endpoint lies on the other segment, which is a touch rather than a proper crossing.",
    secondTitle: "Events, not pairs",
    secondIntro:
      "Each segment contributes a start and an end event. Sorting them gives the order in which the sweep line changes what it is crossing.",
    secondCode: `def events(segments):
    out = []
    for i, (a, b) in enumerate(segments):
        low, high = sorted([a, b])
        out.append((low[0], "start", i))
        out.append((high[0], "end", i))
    return sorted(out)

print(events(segments)[:4])
print("pairwise tests:", len(segments) * (len(segments) - 1) // 2)
print("events:", 2 * len(segments))`,
    secondTrace:
      "Six pairwise tests against eight events. The events look worse here because four segments is tiny; at ten thousand it is fifty million against twenty thousand.",
    mistake:
      "Assuming the sweep is always faster. It costs the event count plus the number of intersections reported, so on an input where nearly every pair crosses it degenerates to the quadratic form.",
    checkpoint:
      "Which segments can the sweep skip comparing?",
    checkpointAnswer:
      "Any two that are never crossed by the sweep line at the same time — they cannot possibly intersect.",
    remember:
      "Sort the events, keep the active set, compare only neighbours.",
    checks: [
      {
        question: "What does the crossing test compute?",
        choices: [
          "Four orientation signs, with no intersection point",
          "The intersection point itself",
          "The distance between the segments",
        ],
        answer: 0,
        explanation: "Each segment must separate the other's endpoints.",
        why: [
          "Correct, and it stays exact on integer input.",
          "The point is only needed if asked for.",
          "Distance is a different question.",
        ],
      },
      {
        question: "What does the active set contain?",
        choices: [
          "The segments the sweep line currently crosses",
          "Every segment",
          "The segments already processed",
        ],
        answer: 0,
        explanation: "It changes at each event.",
        why: [
          "Correct, and it is kept ordered by height.",
          "That would save nothing.",
          "Finished segments are removed.",
        ],
      },
      {
        question: "Nearly every pair of segments crosses. How does the sweep behave?",
        choices: [
          "It degenerates to the quadratic cost",
          "It stays near linear",
          "It fails",
        ],
        answer: 0,
        explanation: "The cost includes the number of reported intersections.",
        why: [
          "Correct. The output itself is quadratic.",
          "It cannot beat the size of its own output.",
          "It remains correct throughout.",
        ],
      },
    ],
  },
  {
    lessonId: "py.ac.m12_5.l5",
    atomId: "py.atom.algo.delaunay-voronoi",
    conceptId: "py.algo.delaunay-voronoi",
    title: "Delaunay and Voronoi structures",
    requires: ["py.algo.segment-sweeps"],
    vocabulary: [
      ["empty circle property", "no point lies inside the circle through a triangle's three vertices"],
      ["Voronoi cell", "the region closer to one site than to any other"],
      ["dual structure", "two subdivisions where each face of one corresponds to a vertex of the other"],
    ],
    opening:
      "Two structures answer nearest-neighbour questions, and they are the same information written twice. Understanding the duality is most of the lesson.",
    outcome:
      "You will apply the empty-circle test and see how the cell decomposition answers nearest-neighbour queries directly.",
    why:
      "Nearest neighbour, minimum spanning trees on points and mesh generation all rest on these two structures.",
    mentalModel:
      "Picture each site growing a disc at the same rate. Where two discs meet is a cell boundary, and joining sites whose cells touch gives the triangulation.",
    firstTitle: "The empty circle test",
    firstIntro:
      "A triangulation is Delaunay when no point lies inside any triangle's circumcircle. One determinant decides it for a candidate point.",
    firstCode: `def in_circumcircle(a, b, c, d):
    ax, ay = a[0] - d[0], a[1] - d[1]
    bx, by = b[0] - d[0], b[1] - d[1]
    cx, cy = c[0] - d[0], c[1] - d[1]
    return ((ax * ax + ay * ay) * (bx * cy - by * cx)
            - (bx * bx + by * by) * (ax * cy - ay * cx)
            + (cx * cx + cy * cy) * (ax * by - ay * bx)) > 0

a, b, c = (0, 0), (4, 0), (0, 4)
print("far point inside:", in_circumcircle(a, b, c, (10, 10)))
print("near point inside:", in_circumcircle(a, b, c, (1, 1)))`,
    firstTrace:
      "The distant point is outside and the interior point is inside. A point inside means the triangulation is not Delaunay and that edge must be flipped.",
    secondTitle: "Cells answer nearest neighbour",
    secondIntro:
      "Each site owns the region closer to it than to any other. Locating a query in that decomposition is the nearest-neighbour answer, with no distances compared at query time.",
    secondCode: `sites = [(0, 0), (4, 0), (0, 4), (4, 4)]

def nearest(sites, query):
    return min(sites, key=lambda p: (p[0] - query[0]) ** 2
                                    + (p[1] - query[1]) ** 2)

for query in [(1, 1), (3, 1), (1, 3), (3, 3)]:
    print(query, nearest(sites, query))`,
    secondTrace:
      "Each query lands in the cell of its own corner. The direct scan shows what the decomposition encodes; the structure turns that scan into a location query.",
    mistake:
      "Building these structures for a handful of points. Both carry substantial constant factors, and under a few hundred sites a direct distance scan is faster and far easier to get right.",
    checkpoint:
      "What is the relationship between the two structures?",
    checkpointAnswer:
      "They are duals — each cell of one corresponds to a vertex of the other, so either can be derived from the other.",
    remember:
      "Empty circles for the triangulation, nearest cells for the queries.",
    checks: [
      {
        question: "What characterises a Delaunay triangulation?",
        choices: [
          "No point lies inside any triangle's circumcircle",
          "Every triangle is equilateral",
          "Every edge has the same length",
        ],
        answer: 0,
        explanation: "It is the empty circle property.",
        why: [
          "Correct, and a violation calls for an edge flip.",
          "Equilateral triangles are not achievable in general.",
          "Edge lengths vary with the sites.",
        ],
      },
      {
        question: "What does one Voronoi cell contain?",
        choices: [
          "Every location closer to that site than to any other",
          "The site's three nearest neighbours",
          "A fixed-radius disc",
        ],
        answer: 0,
        explanation: "It is defined by a distance comparison.",
        why: [
          "Correct. Locating a query in a cell answers nearest neighbour.",
          "Neighbours come from the dual triangulation.",
          "Cells have varying shapes and sizes.",
        ],
      },
      {
        question: "There are eighty points. Should you build these structures?",
        choices: [
          "No; a direct distance scan is faster and simpler",
          "Yes; they are always faster",
          "Yes, if the points are in general position",
        ],
        answer: 0,
        explanation: "The constant factors are substantial.",
        why: [
          "Correct. They pay off in the hundreds and above.",
          "Construction dominates at small sizes.",
          "General position helps correctness, not the trade-off.",
        ],
      },
    ],
  },
];

export const ALGO_COMPUTATIONAL_GEOMETRY_ATOMS = ALGO_COMPUTATIONAL_GEOMETRY_SPECS.map(guidedMasteryAtom);
export const ALGO_COMPUTATIONAL_GEOMETRY_CONCEPTS = ALGO_COMPUTATIONAL_GEOMETRY_SPECS.map(guidedMasteryConcept);
export const ALGO_COMPUTATIONAL_GEOMETRY_LESSON_CONTENT = guidedLessonContent(ALGO_COMPUTATIONAL_GEOMETRY_SPECS);

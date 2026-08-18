import {
  guidedLessonContent,
  guidedMasteryAtom,
  guidedMasteryConcept,
  type GuidedMasterySpec,
} from "./guidedMastery";

const ALGO_ADVANCED_FLOW_SPECS: GuidedMasterySpec[] = [
  {
    lessonId: "py.ac.m12_2.l1",
    atomId: "py.atom.algo.dinic",
    conceptId: "py.algo.dinic",
    title: "Dinic's algorithm",
    requires: ["py.algo.max-flow-guided"],
    vocabulary: [
      ["level graph", "a layering of the residual graph by shortest distance from the source"],
      ["blocking flow", "a flow saturating at least one edge on every source-to-sink path in the level graph"],
      ["phase", "one level graph plus the blocking flow found within it"],
    ],
    opening:
      "Augmenting one path at a time works but wastes the search. Layering the graph first lets many paths be found in a single sweep.",
    outcome:
      "You will build a level graph, saturate a blocking flow inside it, and count how few phases the whole computation needs.",
    why:
      "The phase count is bounded by the number of vertices, and by the square root of the edge count when capacities are one. That bound is what makes large flow problems tractable.",
    mentalModel:
      "Picture the residual graph sorted into layers by distance from the source. Flow may only move forward one layer at a time, which forbids the wandering paths that made the simple method slow.",
    firstTitle: "Layer, then saturate",
    firstIntro:
      "A breadth-first sweep assigns each vertex its distance from the source. The blocking flow then only ever follows edges that increase the level by exactly one.",
    firstCode: `from collections import deque

class Flow:
    def __init__(self, n):
        self.n = n
        self.graph = [[] for _ in range(n)]

    def add(self, u, v, cap):
        self.graph[u].append([v, cap, len(self.graph[v])])
        self.graph[v].append([u, 0, len(self.graph[u]) - 1])

    def levels(self, s, t):
        level = [-1] * self.n
        level[s] = 0
        queue = deque([s])
        while queue:
            u = queue.popleft()
            for v, cap, _ in self.graph[u]:
                if cap > 0 and level[v] < 0:
                    level[v] = level[u] + 1
                    queue.append(v)
        return level, level[t] >= 0

    def push(self, u, t, limit, level, seen):
        if u == t:
            return limit
        while seen[u] < len(self.graph[u]):
            edge = self.graph[u][seen[u]]
            v, cap, rev = edge
            if cap > 0 and level[v] == level[u] + 1:
                got = self.push(v, t, min(limit, cap), level, seen)
                if got:
                    edge[1] -= got
                    self.graph[v][rev][1] += got
                    return got
            seen[u] += 1
        return 0

    def maxflow(self, s, t):
        total, phases = 0, 0
        while True:
            level, reachable = self.levels(s, t)
            if not reachable:
                return total, phases
            phases += 1
            seen = [0] * self.n
            while True:
                got = self.push(s, t, float("inf"), level, seen)
                if not got:
                    break
                total += got`,
    firstTrace:
      "Each sweep is linear in the edge count. When the sink has no level the residual graph is disconnected, which is exactly the stopping condition.",
    secondTitle: "Counting the phases",
    secondIntro:
      "Every phase increases the distance from source to sink by at least one, so the phase count is small even on graphs where the path count is enormous.",
    secondCode: `f = Flow(6)
for u, v, c in [(0, 1, 10), (0, 2, 10), (1, 3, 4), (1, 4, 8),
                (2, 4, 9), (3, 5, 10), (4, 3, 6), (4, 5, 10)]:
    f.add(u, v, c)
print(f.maxflow(0, 5))

g = Flow(10)
for i in range(1, 5):
    g.add(0, i, 1)
for i in range(5, 9):
    g.add(i, 9, 1)
for u, v in [(1, 5), (1, 6), (2, 5), (3, 7), (4, 8), (4, 7)]:
    g.add(u, v, 1)
print(g.maxflow(0, 9))`,
    secondTrace:
      "Nineteen units in two phases, and a unit-capacity matching of four in two phases. Both finished in far fewer rounds than they have paths.",
    mistake:
      "Rebuilding the level graph after every augmenting path. The whole gain comes from reusing one level graph until it is blocked, so a rebuild per path throws the improvement away.",
    checkpoint:
      "What ends a phase?",
    checkpointAnswer:
      "A blocking flow - every remaining source-to-sink route in the level graph has a saturated edge, so a new level graph is needed.",
    remember:
      "Layer once, saturate fully, relayer.",
    checks: [
      {
        prompt: "What does the level graph forbid?",
        options: [
          "Edges that do not advance exactly one level",
          "Edges with small capacity",
          "Backward residual edges",
        ],
        answerIndex: 0,
        hint: "That restriction is what bounds the phase count.",
        explanations: [
          "Correct. Paths cannot wander sideways or backward.",
          "Capacity does not affect layering.",
          "Residual edges are used when they advance a level.",
        ],
      },
      {
        prompt: "Why does each phase increase the source-sink distance?",
        options: [
          "The blocking flow saturates every shortest route",
          "Vertices are removed each phase",
          "Capacities shrink",
        ],
        answerIndex: 0,
        hint: "Nothing at the current distance remains usable.",
        explanations: [
          "Correct. The next path must be strictly longer.",
          "No vertices are deleted.",
          "Residual capacity can also grow.",
        ],
      },
      {
        prompt: "What is the phase bound on unit-capacity graphs?",
        options: [
          "The square root of the edge count",
          "The vertex count",
          "The edge count",
        ],
        answerIndex: 0,
        hint: "That is why bipartite matching is fast here.",
        explanations: [
          "Correct. It is the same bound Hopcroft-Karp achieves.",
          "That is the general bound.",
          "That would be no better than the simple method.",
        ],
      },
    ],
  },
  {
    lessonId: "py.ac.m12_2.l2",
    atomId: "py.atom.algo.min-cost-flow",
    conceptId: "py.algo.min-cost-flow",
    title: "Min-cost max-flow",
    requires: ["py.algo.dinic"],
    vocabulary: [
      ["cost per unit", "the price of pushing one unit of flow along an edge"],
      ["shortest augmenting path", "the cheapest route from source to sink in the residual graph"],
      ["potential", "a per-vertex offset that keeps residual costs non-negative"],
    ],
    opening:
      "Maximum flow asks how much. Minimum-cost flow asks how much and at what price, and the two answers can require completely different routings.",
    outcome:
      "You will augment along cheapest paths, use potentials to keep the search fast, and see the cost stop rising once the flow saturates.",
    why:
      "Assignment, transport and scheduling problems are all this shape: a required amount to move, several ways to move it, and a price on each.",
    mentalModel:
      "Picture repeatedly buying the cheapest remaining route from source to sink. Each purchase raises the price of the next, because the cheap edges fill up first.",
    firstTitle: "Cheapest path first",
    firstIntro:
      "Residual edges carry negative cost, which ordinary shortest-path search cannot handle. Potentials shift every cost upward by a constant amount per vertex, restoring non-negativity.",
    firstCode: `import heapq

def min_cost_flow(n, edges, s, t, need):
    graph = [[] for _ in range(n)]
    for u, v, cap, cost in edges:
        graph[u].append([v, cap, cost, len(graph[v])])
        graph[v].append([u, 0, -cost, len(graph[u]) - 1])
    flow, spent, potential = 0, 0, [0] * n
    while flow < need:
        dist = [float("inf")] * n
        dist[s], prev = 0, [None] * n
        heap = [(0, s)]
        while heap:
            d, u = heapq.heappop(heap)
            if d > dist[u]:
                continue
            for i, (v, cap, cost, _) in enumerate(graph[u]):
                step = d + cost + potential[u] - potential[v]
                if cap > 0 and step < dist[v]:
                    dist[v] = step
                    prev[v] = (u, i)
                    heapq.heappush(heap, (step, v))
        if dist[t] == float("inf"):
            return flow, spent
        for i in range(n):
            if dist[i] < float("inf"):
                potential[i] += dist[i]
        push, v = need - flow, t
        while v != s:
            u, i = prev[v]
            push = min(push, graph[u][i][1])
            v = u
        v = t
        while v != s:
            u, i = prev[v]
            graph[u][i][1] -= push
            graph[v][graph[u][i][3]][1] += push
            spent += push * graph[u][i][2]
            v = u
        flow += push
    return flow, spent

edges = [(0, 1, 2, 1), (0, 2, 2, 5),
         (1, 3, 2, 1), (2, 3, 2, 1), (1, 2, 1, 1)]
print(min_cost_flow(4, edges, 0, 3, 2))
print(min_cost_flow(4, edges, 0, 3, 4))`,
    firstTrace:
      "Two units cost four, taking the cheap route twice. Four units cost sixteen, because the last two must use the expensive edge out of the source.",
    secondTitle: "The flow has a ceiling",
    secondIntro:
      "Asking for more than the network can carry is not an error. The routine returns the largest achievable flow along with its cost.",
    secondCode: `print(min_cost_flow(4, edges, 0, 3, 9))`,
    secondTrace:
      "Four units at cost sixteen, the same as before. The request for nine was capped by the capacity leaving the source.",
    mistake:
      "Running a plain shortest-path search on the residual graph. Cancelling flow creates negative-cost edges, and a search that assumes non-negative weights returns a route that is not actually cheapest.",
    checkpoint:
      "Why does the cost per unit rise as more flow is pushed?",
    checkpointAnswer:
      "Cheap edges saturate first, so each later unit must use a route that was more expensive all along.",
    remember:
      "Augment along the cheapest path, and keep potentials to stay fast.",
    checks: [
      {
        prompt: "What do vertex potentials fix?",
        options: [
          "Negative residual costs that break shortest-path search",
          "Capacity violations",
          "Cycles in the graph",
        ],
        answerIndex: 0,
        hint: "Cancelling flow costs a negative amount.",
        explanations: [
          "Correct. They shift every cost non-negative without changing which path is cheapest.",
          "Capacities are handled separately.",
          "Cycles are not the problem here.",
        ],
      },
      {
        prompt: "Is the minimum-cost routing always the same as a maximum-flow routing?",
        options: [
          "No; the same total flow can be routed many ways",
          "Yes; maximum flow is unique",
          "Only when costs are equal",
        ],
        answerIndex: 0,
        hint: "The amount is fixed but the route is not.",
        explanations: [
          "Correct. Cost picks among the routings achieving that amount.",
          "The value is unique; the routing is not.",
          "Equal costs make every routing tie.",
        ],
      },
      {
        prompt: "More flow is requested than the network can carry. What should happen?",
        options: [
          "Return the largest achievable flow and its cost",
          "Raise an error",
          "Return zero",
        ],
        answerIndex: 0,
        hint: "The search simply runs out of augmenting paths.",
        explanations: [
          "Correct. That is useful information, not a failure.",
          "It is a normal outcome.",
          "Partial flow is still valid.",
        ],
      },
    ],
  },
  {
    lessonId: "py.ac.m12_2.l3",
    atomId: "py.atom.algo.general-matching",
    conceptId: "py.algo.general-matching",
    title: "General graph matching",
    requires: ["py.algo.min-cost-flow"],
    vocabulary: [
      ["matching", "a set of edges with no shared endpoint"],
      ["augmenting path", "an alternating path between two unmatched vertices"],
      ["blossom", "an odd cycle that the alternating search must contract to a single vertex"],
    ],
    opening:
      "Matching on a bipartite graph reduces to flow. On a general graph it does not, and the reason is a single structure: the odd cycle.",
    outcome:
      "You will see why an odd cycle defeats the bipartite argument, and what contracting it recovers.",
    why:
      "Bipartite structure is an assumption, not a guarantee. Knowing where it fails tells you when the easy reduction is unavailable.",
    mentalModel:
      "Picture an alternating path arriving at a triangle. Going around the triangle it arrives back where it started on the wrong parity, so the path search loses its footing.",
    firstTitle: "Why parity matters",
    firstIntro:
      "A bipartite graph has no odd cycle, so every alternating walk keeps a consistent parity. Add one triangle and that guarantee is gone.",
    firstCode: `def is_bipartite(adjacency):
    colour = {}
    for start in adjacency:
        if start in colour:
            continue
        colour[start] = 0
        stack = [start]
        while stack:
            u = stack.pop()
            for v in adjacency[u]:
                if v not in colour:
                    colour[v] = 1 - colour[u]
                    stack.append(v)
                elif colour[v] == colour[u]:
                    return False
    return True

square = {1: [2, 4], 2: [1, 3], 3: [2, 4], 4: [1, 3]}
triangle = {1: [2, 3], 2: [1, 3], 3: [1, 2]}
print(is_bipartite(square), is_bipartite(triangle))`,
    firstTrace:
      "True for the four-cycle and False for the triangle. The odd cycle is exactly what the two-colouring cannot survive.",
    secondTitle: "Contracting the cycle",
    secondIntro:
      "The blossom algorithm shrinks each odd cycle into one vertex, searches the smaller graph, then expands. A matching in the contracted graph lifts back to a matching in the original.",
    secondCode: `matching = {1: 2, 2: 1}
triangle = {1: [2, 3], 2: [1, 3], 3: [1, 2]}
free = [v for v in triangle if v not in matching]
print("matched pairs", len(matching) // 2)
print("free vertices", free)
print("maximum possible", len(triangle) // 2)`,
    secondTrace:
      "One pair matched and vertex three free. Three vertices admit at most one pair, so this matching is already maximum despite a vertex being left over.",
    mistake:
      "Assuming a maximum matching leaves no vertex unmatched. An odd vertex count guarantees at least one is left over, and so does any graph with an isolated vertex.",
    checkpoint:
      "Why does the bipartite-to-flow reduction fail on a general graph?",
    checkpointAnswer:
      "Because an odd cycle breaks the two-sided structure the reduction depends on, so alternating paths lose their consistent parity.",
    remember:
      "Odd cycles are the obstacle; contracting them is the fix.",
    checks: [
      {
        prompt: "What structure makes general matching harder than bipartite matching?",
        options: ["The odd cycle", "The self loop", "The disconnected component"],
        answerIndex: 0,
        hint: "It is exactly what a two-colouring cannot handle.",
        explanations: [
          "Correct. Blossom contraction exists to handle it.",
          "Self loops are excluded by definition.",
          "Components are handled independently.",
        ],
      },
      {
        prompt: "What does the blossom algorithm do with an odd cycle?",
        options: [
          "Contracts it to a single vertex, searches, then expands",
          "Deletes it",
          "Duplicates it",
        ],
        answerIndex: 0,
        hint: "The smaller graph is searched instead.",
        explanations: [
          "Correct. A matching in the contracted graph lifts back.",
          "Deleting would lose valid matchings.",
          "Duplication does not help.",
        ],
      },
      {
        prompt: "A graph has seven vertices. Can every vertex be matched?",
        options: [
          "No; an odd count leaves at least one unmatched",
          "Yes, if the graph is connected",
          "Yes, if every vertex has degree two",
        ],
        answerIndex: 0,
        hint: "Each edge covers exactly two vertices.",
        explanations: [
          "Correct. Parity alone settles it.",
          "Connectivity does not change the parity.",
          "Degree does not change the parity either.",
        ],
      },
    ],
  },
  {
    lessonId: "py.ac.m12_2.l4",
    atomId: "py.atom.algo.hopcroft-karp",
    conceptId: "py.algo.hopcroft-karp",
    title: "Hopcroft-Karp",
    requires: ["py.algo.general-matching"],
    vocabulary: [
      ["bipartite matching", "a matching on a graph whose vertices split into two sides"],
      ["augmenting phase", "one breadth-first layering plus every shortest augmenting path found within it"],
      ["shortest augmenting path", "an alternating path of minimum length between two free vertices"],
    ],
    opening:
      "The simple matching algorithm finds one augmenting path per search. Finding every shortest one at once cuts the number of searches to a square root.",
    outcome:
      "You will count phases rather than paths, and see the difference that makes at scale.",
    why:
      "Bipartite matching underlies assignment, scheduling and covering problems, and the input is often large enough that the simple method is too slow.",
    mentalModel:
      "Picture layering the graph by distance from the free vertices, then augmenting along every shortest path in that layering before rebuilding it.",
    firstTitle: "Phases, not paths",
    firstIntro:
      "Each phase lengthens the shortest augmenting path, and there are only so many distinct lengths available. That is where the square root comes from.",
    firstCode: `from collections import deque

def hopcroft_karp(left, right, adjacency):
    FAR = float("inf")
    match_l = {u: None for u in left}
    match_r = {v: None for v in right}
    phases = 0
    while True:
        dist, queue = {}, deque()
        for u in left:
            dist[u] = 0 if match_l[u] is None else FAR
            if dist[u] == 0:
                queue.append(u)
        found = False
        while queue:
            u = queue.popleft()
            for v in adjacency[u]:
                w = match_r[v]
                if w is None:
                    found = True
                elif dist[w] == FAR:
                    dist[w] = dist[u] + 1
                    queue.append(w)
        if not found:
            break
        phases += 1

        def augment(u):
            for v in adjacency[u]:
                w = match_r[v]
                if w is None or (dist.get(w) == dist[u] + 1 and augment(w)):
                    match_l[u], match_r[v] = v, u
                    return True
            dist[u] = FAR
            return False

        for u in left:
            if match_l[u] is None:
                augment(u)
    return sum(1 for u in left if match_l[u]), phases

left, right = [1, 2, 3, 4], [5, 6, 7, 8]
adjacency = {1: [5, 6], 2: [5], 3: [7], 4: [7, 8]}
print(hopcroft_karp(left, right, adjacency))

star = {1: [5], 2: [5], 3: [5], 4: [5]}
print(hopcroft_karp(left, right, star))`,
    firstTrace:
      "A matching of four in two phases, and a matching of one in a single phase. The star saturates immediately because every left vertex competes for one partner.",
    secondTitle: "What the bound buys",
    secondIntro:
      "The simple method costs one search per matched pair. This one costs one search per phase, and the phase count grows only as the square root.",
    secondCode: `import math

for edges in (100, 10_000, 1_000_000):
    print(edges, "simple", edges * edges,
          "phased", int(edges * math.sqrt(edges)))`,
    secondTrace:
      "At a million edges the simple bound is a trillion operations and the phased bound is a billion. That is the difference between infeasible and routine.",
    mistake:
      "Augmenting along any path found rather than a shortest one. Mixing path lengths within a phase destroys the argument that each phase raises the minimum length.",
    checkpoint:
      "What does one phase accomplish?",
    checkpointAnswer:
      "It finds every shortest augmenting path at the current length, which guarantees the next phase works at a strictly greater length.",
    remember:
      "Layer, augment all shortest paths, relayer.",
    checks: [
      {
        prompt: "What does a phase augment along?",
        options: [
          "Every shortest augmenting path at the current length",
          "One path",
          "Every path of any length",
        ],
        answerIndex: 0,
        hint: "The length restriction is what bounds the phase count.",
        explanations: [
          "Correct. Mixing lengths breaks the bound.",
          "That is the simple method.",
          "Longer paths belong to later phases.",
        ],
      },
      {
        prompt: "How many phases are needed in the worst case?",
        options: [
          "About the square root of the vertex count",
          "One per matched pair",
          "One per edge",
        ],
        answerIndex: 0,
        hint: "Only so many distinct path lengths exist.",
        explanations: [
          "Correct. That is the whole improvement.",
          "That is the simple method's count.",
          "Edges are not searched one at a time.",
        ],
      },
      {
        prompt: "Four left vertices all connect to one right vertex. What is the matching size?",
        options: ["One", "Four", "Two"],
        answerIndex: 0,
        hint: "A matching shares no endpoint.",
        explanations: [
          "Correct. The single right vertex can pair with only one.",
          "They would all share an endpoint.",
          "There is only one right vertex available.",
        ],
      },
    ],
  },
  {
    lessonId: "py.ac.m12_2.l5",
    atomId: "py.atom.algo.flow-modeling",
    conceptId: "py.algo.flow-modeling",
    title: "Flow modeling",
    requires: ["py.algo.hopcroft-karp"],
    vocabulary: [
      ["reduction", "restating a problem as a flow network whose answer solves the original"],
      ["minimum cut", "the cheapest set of edges whose removal disconnects source from sink"],
      ["vertex splitting", "replacing a vertex by two joined by an edge, to put a capacity on the vertex"],
    ],
    opening:
      "The hard part of a flow problem is almost never the flow. It is recognising that the problem in front of you is one.",
    outcome:
      "You will apply the standard modelling moves - vertex capacities, either-or choices and lower bounds - and read the cut as the answer.",
    why:
      "Project selection, image segmentation and closure problems all become minimum cut once modelled, and none of them mention flow.",
    mentalModel:
      "Picture the cut as a decision boundary. Every vertex ends up on the source side or the sink side, and the cut cost is the price of that assignment.",
    firstTitle: "Capacity on a vertex",
    firstIntro:
      "Flow bounds edges, not vertices. Splitting a vertex into an entry and an exit joined by one edge puts the bound exactly where it is needed.",
    firstCode: `def split(vertex, count):
    return (vertex, vertex + count)

capacity = {1: 3, 2: 5}
edges = []
for v, cap in capacity.items():
    entry, exit_node = split(v, 10)
    edges.append((entry, exit_node, cap))
print(edges)
print("original edge 1 to 2 becomes", (split(1, 10)[1], split(2, 10)[0]))`,
    firstTrace:
      "Vertex one becomes a pair joined by an edge of capacity three. Every edge that arrived at vertex one now arrives at its entry, and every edge that left now leaves its exit.",
    secondTitle: "The cut is the answer",
    secondIntro:
      "In a selection problem, put profits on one side and costs on the other. The minimum cut then names exactly which items to take.",
    secondCode: `profits = {"a": 10, "b": 6}
costs = {"tool": 8}
needs = {"a": ["tool"], "b": ["tool"]}

total_profit = sum(profits.values())
cut = min(costs["tool"], total_profit)
print("total profit", total_profit)
print("minimum cut", cut)
print("best net", total_profit - cut)`,
    secondTrace:
      "Sixteen in profit against a shared cost of eight leaves a net of eight. The cut chose to pay for the tool because both projects need it.",
    mistake:
      "Modelling a lower bound as a capacity. A required minimum flow needs the standard transformation with an auxiliary source and sink, not a capacity that merely permits it.",
    checkpoint:
      "How do you put a capacity on a vertex?",
    checkpointAnswer:
      "Split it into an entry and an exit joined by a single edge carrying that capacity, and rewire arriving and leaving edges accordingly.",
    remember:
      "Recognise the shape, split vertices, and read the cut.",
    checks: [
      {
        prompt: "How is a vertex capacity expressed in a flow network?",
        options: [
          "Split the vertex into two joined by an edge of that capacity",
          "Set every incident edge to that capacity",
          "Remove the vertex",
        ],
        answerIndex: 0,
        hint: "Flow bounds edges, not vertices.",
        explanations: [
          "Correct. All flow through the vertex crosses that one edge.",
          "That bounds each edge separately, which is different.",
          "Removal changes the problem.",
        ],
      },
      {
        prompt: "In a project-selection model, what does the minimum cut represent?",
        options: [
          "Which projects to take and which costs to pay",
          "The maximum profit directly",
          "The number of projects",
        ],
        answerIndex: 0,
        hint: "Each vertex lands on one side of the cut.",
        explanations: [
          "Correct. The sides encode the decision.",
          "Profit is the total minus the cut.",
          "The count is not what is minimised.",
        ],
      },
      {
        prompt: "An edge must carry at least two units. How is that modelled?",
        options: [
          "With the lower-bound transformation and auxiliary terminals",
          "By setting its capacity to two",
          "By duplicating the edge",
        ],
        answerIndex: 0,
        hint: "A capacity permits but never requires.",
        explanations: [
          "Correct. Requirements need extra structure.",
          "That caps the flow instead of forcing it.",
          "Duplication changes the capacity, not the requirement.",
        ],
      },
    ],
  },
];

export const ALGO_ADVANCED_FLOW_ATOMS = ALGO_ADVANCED_FLOW_SPECS.map(guidedMasteryAtom);
export const ALGO_ADVANCED_FLOW_CONCEPTS = ALGO_ADVANCED_FLOW_SPECS.map(guidedMasteryConcept);
export const ALGO_ADVANCED_FLOW_LESSON_CONTENT = guidedLessonContent(ALGO_ADVANCED_FLOW_SPECS);

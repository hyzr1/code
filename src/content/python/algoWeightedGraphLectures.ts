import type { LectureQuestion } from "../../types";
import { guidedLessonContent, guidedMasteryAtom, guidedMasteryConcept, type GuidedMasterySpec } from "./guidedMastery";

const q = (question: string, choices: [string, string, string], answer: 0 | 1 | 2, explanation: string, why: [string, string, string]): LectureQuestion => ({ question, choices, answer, explanation, why });

const SPECS: GuidedMasterySpec[] = [
  {
    lessonId: "py.ac.m5_3.l1", atomId: "py.atom.algo.dijkstra-guided", conceptId: "py.algo.dijkstra-guided",
    title: "Dijkstra finalizes the cheapest unsettled distance", requires: ["py.algo.bridges-articulation"],
    vocabulary: [["weighted graph", "a graph whose edges carry numeric costs"], ["relaxation", "improve a neighbor's best known distance through one edge"], ["tentative distance", "the cheapest route discovered so far"], ["settled vertex", "a vertex whose shortest distance is proven final"], ["stale heap entry", "an older priority that no longer equals the best distance"]],
    opening: "Dijkstra finds shortest paths when every edge weight is non-negative. A min-heap always exposes the unsettled vertex with the cheapest known route.",
    outcome: "You will implement relaxation with a heap, skip stale entries, reconstruct paths, and explain exactly why negative edges break the finalization proof.",
    why: "Dijkstra powers routing, maps, network delay, game movement, and many interview problems where moves have different non-negative costs.",
    mentalModel: "Spread paint from the source, but expensive roads slow the paint. The next fully reached intersection is the smallest distance waiting in the priority queue.",
    firstTitle: "Relax edges from the cheapest heap entry", firstIntro: "Store distance with vertex. If a popped distance differs from the best table, a newer shorter entry already replaced it.",
    firstCode: `import heapq

def dijkstra(graph, start):
    distance = {vertex: float("inf") for vertex in graph}
    previous = {start: None}
    distance[start] = 0
    heap = [(0, start)]
    while heap:
        current_distance, vertex = heapq.heappop(heap)
        if current_distance != distance[vertex]: continue
        for neighbor, weight in graph[vertex]:
            candidate = current_distance + weight
            if candidate < distance[neighbor]:
                distance[neighbor] = candidate
                previous[neighbor] = vertex
                heapq.heappush(heap, (candidate, neighbor))
    return distance, previous

graph = {"A": [("B", 4), ("C", 1)], "B": [("D", 1)], "C": [("B", 2), ("D", 5)], "D": []}
print(dijkstra(graph, "A")[0])`,
    firstTrace: "C settles at one. It improves B from four to three. The old heap entry for B at four later becomes stale. D settles at four through A-C-B-D.",
    secondTitle: "Rebuild one shortest path", secondIntro: "Predecessors change only when relaxation improves a distance. Follow them backward from the target, then reverse.",
    secondCode: `def shortest_route(graph, start, target):
    distance, previous = dijkstra(graph, start)
    if distance[target] == float("inf"): return None
    path, current = [], target
    while current is not None:
        path.append(current)
        current = previous[current]
    return distance[target], path[::-1]

print(shortest_route(graph, "A", "D"))`,
    secondTrace: "D points to B, B to C, and C to A. Reversing gives A-C-B-D with total cost four. Equal-cost paths may produce a different valid predecessor chain.",
    mistake: "Do not use Dijkstra with negative edges. A vertex considered final can later receive a cheaper route through a negative edge from a more expensive unsettled vertex.",
    checkpoint: "Why do non-negative weights make the smallest unsettled distance safe to finalize?",
    checkpointAnswer: "Any alternative route must first reach another unsettled vertex whose distance is no smaller, then add a non-negative edge. It cannot become cheaper.",
    remember: "Pop the cheapest tentative distance, skip stale entries, relax outgoing edges, and require non-negative weights for the finalization proof.",
    checks: [q("What does edge relaxation do?", ["Tries to improve a neighbor distance", "Deletes the edge", "Sorts every vertex"], 0, "It compares the current best with a route through one edge.", ["Correct. Better routes enter the heap.", "The graph stays intact.", "Only priorities are ordered."]), q("Why skip stale heap entries?", ["A shorter entry already updated the distance", "The vertex is negative", "Heaps cannot store duplicates"], 0, "Python heapq has no decrease-key operation.", ["Correct. Old priorities remain harmlessly queued.", "Vertex sign is unrelated.", "Duplicate vertices with different priorities are allowed."])],
  },
  {
    lessonId: "py.ac.m5_3.l2", atomId: "py.atom.algo.zero-one-bfs", conceptId: "py.algo.zero-one-bfs",
    title: "Zero-one BFS replaces a heap with a deque", requires: ["py.algo.dijkstra-guided"],
    vocabulary: [["zero-one BFS", "shortest path specialized to edge weights zero and one"], ["deque", "a queue supporting efficient insertion at both ends"], ["zero-cost edge", "a move that does not increase distance"], ["unit-cost edge", "a move that increases distance by one"], ["monotone frontier", "queued distances remain ordered without a general heap"]],
    opening: "When every edge costs only zero or one, a deque can maintain Dijkstra's distance order without a heap. Zero-cost moves go to the front; unit moves go to the back.",
    outcome: "You will implement zero-one BFS, prove its deque ordering, compare its cost with Dijkstra, and model free-versus-paid transitions.",
    why: "The pattern solves direction changes, free portals, binary penalties, and minimum-modification grid problems in theta vertices plus edges time.",
    mentalModel: "A free move cuts to the front because it stays on the current distance layer. A paid move waits at the back for the next layer.",
    firstTitle: "Place relaxed vertices by edge cost", firstIntro: "A successful zero relaxation belongs at the left end. A successful one relaxation belongs at the right end.",
    firstCode: `from collections import deque

def zero_one_bfs(graph, start):
    distance = {vertex: float("inf") for vertex in graph}
    distance[start] = 0
    queue = deque([start])
    while queue:
        vertex = queue.popleft()
        for neighbor, weight in graph[vertex]:
            candidate = distance[vertex] + weight
            if candidate < distance[neighbor]:
                distance[neighbor] = candidate
                if weight == 0: queue.appendleft(neighbor)
                else: queue.append(neighbor)
    return distance

graph = {0: [(1, 1), (2, 0)], 1: [(3, 0)], 2: [(1, 0), (3, 1)], 3: []}
print(zero_one_bfs(graph, 0))`,
    firstTrace: "Two enters the front at distance zero. Its free edge improves one from distance one to zero. One then reaches three for free, making every vertex except the source reachable at cost zero.",
    secondTitle: "Model a direction-change penalty", secondIntro: "Moving in a cell's arrow direction costs zero; choosing another direction costs one. Grid states become vertices with binary edge weights.",
    secondCode: `def direction_graph(arrows):
    directions = [(0, 1), (1, 0), (0, -1), (-1, 0)]
    graph = {}
    for row in range(len(arrows)):
        for column in range(len(arrows[0])):
            vertex = (row, column); graph[vertex] = []
            for choice, (dr, dc) in enumerate(directions):
                nr, nc = row + dr, column + dc
                if 0 <= nr < len(arrows) and 0 <= nc < len(arrows[0]):
                    graph[vertex].append(((nr, nc), choice != arrows[row][column]))
    return graph

arrows = [[0, 1], [0, 2]]
print(zero_one_bfs(direction_graph(arrows), (0, 0))[(1, 1)])`,
    secondTrace: "Each Boolean weight acts as zero or one in Python. The deque prioritizes moves following arrows and counts only direction changes.",
    mistake: "Do not use zero-one BFS when weights include two or larger values. Front-versus-back placement no longer preserves full cost order; use Dijkstra instead.",
    checkpoint: "Why does a zero-cost relaxation go to the deque's front?",
    checkpointAnswer: "Its new distance equals the current vertex's distance, so it belongs to the same active layer and must be processed before any queued distance-one-larger vertices.",
    remember: "Binary weights need only two priority levels: zero edges go left, one edges go right, giving linear graph time.",
    checks: [q("Which weights permit zero-one BFS?", ["Only zero and one", "Any non-negative integer", "Negative weights"], 0, "The deque represents exactly two relative priority levels.", ["Correct. Larger weights need a heap or buckets.", "A single back insertion cannot encode all sizes.", "Negative edges break the order."]), q("What is zero-one BFS time?", ["Theta(V + E)", "Theta(E log V)", "Theta(V cubed)"], 0, "Deque operations are constant and successful relaxations are bounded.", ["Correct. It improves on general Dijkstra here.", "That is the heap-based bound.", "That resembles Floyd-Warshall."])],
  },
  {
    lessonId: "py.ac.m5_3.l3", atomId: "py.atom.algo.bellman-ford-guided", conceptId: "py.algo.bellman-ford-guided",
    title: "Bellman-Ford handles negative edges by repeated relaxation", requires: ["py.algo.zero-one-bfs"],
    vocabulary: [["Bellman-Ford", "a shortest-path algorithm that repeatedly relaxes every edge"], ["negative edge", "an edge whose cost is less than zero"], ["negative cycle", "a reachable cycle whose total weight is negative"], ["relaxation pass", "one scan across all directed edges"], ["unbounded shortest path", "no finite minimum because a negative cycle can repeat"]],
    opening: "Negative edges destroy Dijkstra's greedy finalization. Bellman-Ford avoids finalizing early and repeatedly lets improvements travel one more edge.",
    outcome: "You will implement V-minus-one relaxation passes, stop early when stable, detect reachable negative cycles, and explain the dynamic-programming invariant.",
    why: "Bellman-Ford supports currency-arbitrage reasoning, constraint systems, routing with credits, and graphs where negative edges are meaningful.",
    mentalModel: "Each full edge scan lets shortest-path news travel one step farther. After V-minus-one scans, every simple path has had enough time to report.",
    firstTitle: "Relax all edges repeatedly", firstIntro: "After pass i, distances cover shortest routes using at most i edges. A simple shortest path uses at most V-minus-one edges.",
    firstCode: `def bellman_ford(vertex_count, edges, start):
    distance = [float("inf")] * vertex_count
    distance[start] = 0
    for _ in range(vertex_count - 1):
        changed = False
        for source, target, weight in edges:
            if distance[source] != float("inf"):
                candidate = distance[source] + weight
                if candidate < distance[target]:
                    distance[target] = candidate
                    changed = True
        if not changed: break
    return distance

edges = [(0, 1, 4), (0, 2, 5), (1, 2, -3), (2, 3, 2)]
print(bellman_ford(4, edges, 0))`,
    firstTrace: "The route zero-one-two costs one, improving the direct cost five despite the negative edge. Another edge reaches three at total three. Stability may end passes early.",
    secondTitle: "Use one extra pass to expose a negative cycle", secondIntro: "If any reachable distance still improves after V-minus-one passes, the improving route repeats a vertex and contains a negative cycle.",
    secondCode: `def has_reachable_negative_cycle(vertex_count, edges, start):
    distance = bellman_ford(vertex_count, edges, start)
    for source, target, weight in edges:
        if distance[source] != float("inf") and distance[source] + weight < distance[target]:
            return True
    return False

cycle_edges = [(0, 1, 1), (1, 2, -2), (2, 1, -1), (2, 3, 2)]
print(has_reachable_negative_cycle(4, cycle_edges, 0))`,
    secondTrace: "The one-two-one loop costs negative three. Repeating it makes distances smaller without limit, so no finite shortest route exists for vertices reachable after that cycle.",
    mistake: "Do not report an unreachable negative cycle as affecting the source. Only relax from finite-distance vertices; a disconnected cycle cannot improve a route starting here.",
    checkpoint: "Why are V-minus-one passes sufficient when no reachable negative cycle affects the answer?",
    checkpointAnswer: "A finite shortest path can be chosen simple, because removing any non-negative repeated cycle does not worsen it. A simple path visits at most V vertices and uses at most V-minus-one edges.",
    remember: "Each pass permits one more path edge, V-minus-one covers simple paths, and a further reachable improvement proves a negative cycle.",
    checks: [q("What can Bellman-Ford handle that Dijkstra cannot?", ["Negative edges", "Only unweighted edges", "No vertices"], 0, "It does not greedily finalize distances.", ["Correct. It also detects negative cycles.", "BFS handles that simpler case.", "Real graphs contain vertices."]), q("What proves a reachable negative cycle?", ["An improvement after V-minus-one passes", "Any negative edge", "An unchanged first pass"], 0, "A simple path cannot require another improvement.", ["Correct. A repeated negative cycle must be involved.", "A negative edge alone may be harmless.", "Unchanged means distances are stable."])],
  },
  {
    lessonId: "py.ac.m5_3.l4", atomId: "py.atom.algo.floyd-warshall-guided", conceptId: "py.algo.floyd-warshall-guided",
    title: "Floyd-Warshall grows the allowed intermediate set", requires: ["py.algo.bellman-ford-guided"],
    vocabulary: [["all-pairs shortest paths", "shortest distances for every ordered source-target pair"], ["intermediate vertex", "a vertex used inside a path rather than as an endpoint"], ["distance matrix", "a table storing one best distance per ordered pair"], ["dynamic programming", "reuse smaller solved states to build larger states"], ["negative diagonal", "a distance from a vertex to itself less than zero, proving a negative cycle"]],
    opening: "Floyd-Warshall computes every source-to-target distance at once. Each outer step allows one additional vertex to appear inside candidate paths.",
    outcome: "You will implement the triple loop, state the intermediate-set invariant, reconstruct paths with next-hop data, and detect negative cycles.",
    why: "The algorithm suits small dense graphs, routing tables, transitive closure, and repeated distance queries where cubic preprocessing is acceptable.",
    mentalModel: "For every trip from i to j, ask whether newly opened hub k makes i-to-k plus k-to-j cheaper than the current route.",
    firstTitle: "Try each vertex as a new allowed hub", firstIntro: "Initialize zero diagonals and direct edges. The k loop must be outermost so each stage uses paths through only already allowed hubs.",
    firstCode: `def floyd_warshall(vertex_count, edges):
    distance = [[float("inf")] * vertex_count for _ in range(vertex_count)]
    for vertex in range(vertex_count): distance[vertex][vertex] = 0
    for source, target, weight in edges:
        distance[source][target] = min(distance[source][target], weight)
    for middle in range(vertex_count):
        for source in range(vertex_count):
            for target in range(vertex_count):
                through = distance[source][middle] + distance[middle][target]
                if through < distance[source][target]: distance[source][target] = through
    return distance

edges = [(0, 1, 3), (1, 2, -2), (0, 2, 8), (2, 3, 2), (3, 1, 4)]
distances = floyd_warshall(4, edges)
print(distances[0])`,
    firstTrace: "Allowing vertex one improves zero-to-two from eight to one. Allowing two then improves zero-to-three to three. Every ordered pair receives the same hub choices.",
    secondTitle: "Use the diagonal to detect negative cycles", secondIntro: "A route from a vertex back to itself normally costs zero by staying put. A negative value means a repeatable negative cycle is reachable on that return route.",
    secondCode: `def negative_cycle_vertices(distance):
    return [vertex for vertex in range(len(distance)) if distance[vertex][vertex] < 0]

cycle_edges = [(0, 1, 1), (1, 2, -3), (2, 0, 1)]
cycle_distances = floyd_warshall(3, cycle_edges)
print(negative_cycle_vertices(cycle_distances))`,
    secondTrace: "The zero-one-two-zero loop costs negative one. Floyd-Warshall lowers diagonal entries for vertices that can travel around that cycle and return.",
    mistake: "Do not use Floyd-Warshall blindly on huge sparse graphs. Theta V cubed time and theta V squared memory can be far worse than running a sparse single-source algorithm when needed.",
    checkpoint: "What does distance[i][j] mean after finishing outer-loop vertex k?",
    checkpointAnswer: "It is the cheapest i-to-j path whose intermediate vertices are chosen only from zero through k. The endpoints may be any vertices.",
    remember: "Initialize direct distances, add one allowed intermediate at a time, compare direct versus through-k routes, and inspect the diagonal for negative cycles.",
    checks: [q("What is Floyd-Warshall time?", ["Theta(V cubed)", "Theta(V + E)", "Theta(log V)"], 0, "It checks every source, target, and intermediate triple.", ["Correct. Dense small graphs are the usual fit.", "That describes traversal.", "All pairs require far more work."]), q("Why must the intermediate loop be outermost?", ["It preserves the staged DP invariant", "It sorts vertices alphabetically", "It removes all edges"], 0, "Each stage must use only previously permitted intermediates.", ["Correct. Loop order carries meaning.", "Labels do not matter.", "Edges remain represented by distances."])],
  },
  {
    lessonId: "py.ac.m5_3.l5", atomId: "py.atom.algo.a-star-guided", conceptId: "py.algo.a-star-guided",
    title: "A-star adds a safe estimate of distance remaining", requires: ["py.algo.floyd-warshall-guided"],
    vocabulary: [["A-star", "best-first shortest-path search ordered by cost-so-far plus estimated remaining cost"], ["heuristic", "an estimate of cost from a state to the goal"], ["admissible", "never overestimates the true remaining cost"], ["consistent", "the estimate obeys a triangle inequality across every edge"], ["f-score", "g cost already paid plus h estimated cost remaining"]],
    opening: "Dijkstra searches equally in every direction. A-star uses a heuristic to favor states that look closer to one chosen goal while preserving optimality under safe conditions.",
    outcome: "You will implement A-star on a grid, separate g and f scores, choose Manhattan distance, and explain admissibility, consistency, and failure from overestimation.",
    why: "A-star powers game navigation, robotics, route planning, puzzles, and any shortest-path search with useful geometric or domain knowledge.",
    mentalModel: "The priority queue asks two questions: how much have I paid, and how much might remain? A safe guess guides attention without pretending to be confirmed cost.",
    firstTitle: "Prioritize g plus h but relax with g", firstIntro: "The distance table stores confirmed cost-so-far candidates. The heap priority adds the heuristic only for exploration order.",
    firstCode: `import heapq

def a_star(blocked, start, goal, height, width):
    def heuristic(cell): return abs(cell[0] - goal[0]) + abs(cell[1] - goal[1])
    best = {start: 0}
    previous = {start: None}
    heap = [(heuristic(start), 0, start)]
    while heap:
        _, cost, cell = heapq.heappop(heap)
        if cost != best[cell]: continue
        if cell == goal: break
        row, column = cell
        for dr, dc in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
            neighbor = row + dr, column + dc
            inside = 0 <= neighbor[0] < height and 0 <= neighbor[1] < width
            if inside and neighbor not in blocked and cost + 1 < best.get(neighbor, float("inf")):
                best[neighbor] = cost + 1
                previous[neighbor] = cell
                heapq.heappush(heap, (best[neighbor] + heuristic(neighbor), best[neighbor], neighbor))
    return best.get(goal), previous

print(a_star({(1, 1)}, (0, 0), (2, 2), 3, 3)[0])`,
    firstTrace: "Manhattan distance counts required row and column changes while ignoring the obstacle, so it never overestimates. The route around the blocked center costs four.",
    secondTitle: "Compare safe and unsafe heuristic values", secondIntro: "Zero heuristic turns A-star into Dijkstra. Multiplying Manhattan distance can overestimate and may make a suboptimal goal look final too early.",
    secondCode: `def heuristic_examples(cell, goal):
    manhattan = abs(cell[0] - goal[0]) + abs(cell[1] - goal[1])
    return {"dijkstra": 0, "admissible": manhattan, "possibly_unsafe": 2 * manhattan}

for cell in [(0, 0), (1, 0), (2, 1), (2, 2)]:
    print(cell, heuristic_examples(cell, (2, 2)))`,
    secondTrace: "The admissible estimate falls by at most one across a unit move, so it is consistent. The doubled estimate can fall by two after paying one and violates that guarantee.",
    mistake: "Do not store f-score as the actual distance. Relaxation compares g costs only. The heuristic guides queue order but is not a paid edge cost.",
    checkpoint: "Why does an admissible heuristic help preserve an optimal goal result?",
    checkpointAnswer: "It never claims the remaining route costs more than reality. A truly cheaper unfinished route cannot be hidden behind an exaggerated lower-bound priority.",
    remember: "Track real g cost separately, prioritize g plus h, and use an admissible—preferably consistent—heuristic for optimal guided search.",
    checks: [q("What heuristic makes A-star behave like Dijkstra?", ["Zero", "Infinity", "A negative cycle"], 0, "Then f equals g for every state.", ["Correct. No goal guidance remains.", "Infinite priorities are unusable.", "A heuristic is not a cycle."]), q("What does admissible mean?", ["Never overestimates remaining cost", "Always equals exact cost", "Never returns zero"], 0, "It is a safe lower bound.", ["Correct. It may underestimate.", "Exact heuristics are rare but valid.", "At the goal it normally returns zero."])],
  },
  {
    lessonId: "py.ac.m5_3.l6", atomId: "py.atom.algo.mst-comparison", conceptId: "py.algo.mst-comparison",
    title: "A minimum spanning tree connects everything at minimum total cost", requires: ["py.algo.a-star-guided"],
    vocabulary: [["minimum spanning tree", "a minimum-total-weight cycle-free connection of all undirected vertices"], ["cut", "a division of vertices into two groups"], ["cut property", "a lightest edge crossing a cut is safe for some MST"], ["Prim's algorithm", "grow one tree by the cheapest edge leaving it"], ["Kruskal's algorithm", "grow a forest by the cheapest edge joining different components"]],
    opening: "Shortest paths minimize routes from a source. A minimum spanning tree, or MST, minimizes the total price of connecting every vertex once as a network.",
    outcome: "You will implement Prim, review Kruskal through the cut property, choose between edge-list and adjacency-list inputs, and reject disconnected graphs.",
    why: "MSTs design cable, road, pipeline, and cluster structures. Comparing them with shortest paths prevents a common objective mismatch.",
    mentalModel: "Kruskal joins cheap islands across the whole map. Prim grows one connected country. Both repeatedly choose a cheapest safe edge crossing a component boundary.",
    firstTitle: "Grow one tree with Prim", firstIntro: "The heap stores edges leaving visited vertices. Skip edges whose destination already joined the tree.",
    firstCode: `import heapq

def prim(graph, start=0):
    visited = {start}
    heap = [(weight, start, neighbor) for neighbor, weight in graph[start]]
    heapq.heapify(heap)
    total, chosen = 0, []
    while heap and len(visited) < len(graph):
        weight, source, target = heapq.heappop(heap)
        if target in visited: continue
        visited.add(target)
        total += weight
        chosen.append((source, target, weight))
        for neighbor, next_weight in graph[target]:
            if neighbor not in visited: heapq.heappush(heap, (next_weight, target, neighbor))
    return (total, chosen) if len(visited) == len(graph) else None

graph = {0: [(1, 4), (2, 1)], 1: [(0, 4), (2, 2), (3, 5)], 2: [(0, 1), (1, 2), (3, 3)], 3: [(1, 5), (2, 3)]}
print(prim(graph))`,
    firstTrace: "Prim takes zero-two at weight one, two-one at two, and two-three at three. These edges connect all four vertices with total six and no cycle.",
    secondTitle: "Choose an MST algorithm from the input", secondIntro: "Kruskal naturally consumes a sorted edge list. Prim naturally consumes adjacency lists and can stop after one connected frontier grows across all vertices.",
    secondCode: `def mst_strategy(vertex_count, edge_count, input_form):
    if input_form == "edge_list":
        return "Kruskal: sort edges and use DSU"
    if edge_count > vertex_count * vertex_count // 4:
        return "Prim: consider a dense-graph implementation"
    return "Prim: heap over adjacency lists"

print(mst_strategy(100, 180, "edge_list"))
print(mst_strategy(100, 180, "adjacency_list"))`,
    secondTrace: "Both algorithms are justified by safe cut-crossing edges. Implementation choice depends on representation and density, not on a universal winner.",
    mistake: "Do not return a partial tree for a disconnected graph. It has a minimum spanning forest, but no spanning tree covering every vertex.",
    checkpoint: "How does an MST objective differ from a shortest-path-tree objective?",
    checkpointAnswer: "An MST minimizes the sum of its selected network edges. A shortest-path tree minimizes routes from one source, even if its total edge weight is larger.",
    remember: "Prim grows one tree, Kruskal merges a forest, the cut property makes light crossing edges safe, and connectivity is required for an MST.",
    checks: [q("What does an MST minimize?", ["Total selected edge weight", "Distance from one fixed source", "Number of graph vertices"], 0, "It optimizes the whole connection network.", ["Correct. Every vertex must be spanned.", "That is shortest-path-tree behavior.", "Vertex count is fixed by input."]), q("What should Prim return on a disconnected graph here?", ["No MST", "A fake zero-cost edge", "A shortest path"], 0, "One tree cannot span separate components.", ["Correct. A forest can be handled separately.", "Inventing edges changes the graph.", "That solves another objective."])],
  },
];

export const ALGO_WEIGHTED_GRAPH_ATOMS = SPECS.map(guidedMasteryAtom);
export const ALGO_WEIGHTED_GRAPH_CONCEPTS = SPECS.map(guidedMasteryConcept);
export const ALGO_WEIGHTED_GRAPH_LESSON_CONTENT = guidedLessonContent(SPECS);

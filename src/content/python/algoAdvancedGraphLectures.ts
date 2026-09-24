import type { LectureQuestion } from "../../types";
import { guidedLessonContent, guidedMasteryAtom, guidedMasteryConcept, type GuidedMasterySpec } from "./guidedMastery";

const q = (question: string, choices: [string, string, string], answer: 0 | 1 | 2, explanation: string, why: [string, string, string]): LectureQuestion => ({ question, choices, answer, explanation, why });

const SPECS: GuidedMasterySpec[] = [
  {
    lessonId: "py.ac.m5_4.l1", atomId: "py.atom.algo.max-flow-guided", conceptId: "py.algo.max-flow-guided",
    title: "Max flow repeatedly augments a residual network", requires: ["py.algo.mst-comparison"],
    vocabulary: [["flow network", "a directed graph with edge capacities, source, and sink"], ["capacity", "the maximum amount allowed through an edge"], ["residual capacity", "additional flow possible after accounting for current choices"], ["augmenting path", "a source-to-sink path with positive residual capacity"], ["minimum cut", "a cheapest-capacity edge boundary separating source from sink"], ["level graph", "Dinic's BFS layers containing only forward residual progress"]],
    opening: "Maximum flow asks how much material can move from one source to one sink without exceeding any edge capacity. Residual reverse edges let the algorithm revise choices.",
    outcome: "You will implement Edmonds-Karp, trace bottleneck augmentation, recover a minimum cut, and understand how Ford-Fulkerson and Dinic organize the same residual idea.",
    why: "Flow models bandwidth, assignment, evacuation, scheduling, image segmentation, and many problems that ask for the largest feasible transfer.",
    mentalModel: "Send water along a pipe route by its narrowest pipe. A reverse residual pipe records how much of that decision can be canceled and rerouted later.",
    firstTitle: "BFS for the shortest augmenting path", firstIntro: "Edmonds-Karp is Ford-Fulkerson with BFS path selection. The residual matrix stores both remaining forward room and cancelable reverse flow.",
    firstCode: `from collections import deque
def edmonds_karp(capacity, source, sink):
    size, residual, total = len(capacity), [row[:] for row in capacity], 0
    while True:
        parent = [-1] * size; parent[source] = source
        queue = deque([source])
        while queue and parent[sink] == -1:
            vertex = queue.popleft()
            for neighbor, room in enumerate(residual[vertex]):
                if room > 0 and parent[neighbor] == -1:
                    parent[neighbor] = vertex; queue.append(neighbor)
        if parent[sink] == -1: return total, residual
        amount, vertex = float("inf"), sink
        while vertex != source:
            amount = min(amount, residual[parent[vertex]][vertex]); vertex = parent[vertex]
        vertex = sink
        while vertex != source:
            previous = parent[vertex]; residual[previous][vertex] -= amount
            residual[vertex][previous] += amount; vertex = previous
        total += amount
capacity = [[0, 3, 2, 0], [0, 0, 1, 2], [0, 0, 0, 3], [0, 0, 0, 0]]
print(edmonds_karp(capacity, 0, 3)[0])`,
    firstTrace: "BFS finds residual source-to-sink paths. Each path adds only its bottleneck room. Reverse capacity preserves the option to undo flow. The final maximum is five.",
    secondTitle: "Read a minimum cut from the final residual graph", secondIntro: "After no augmenting path remains, residual reachability from the source gives one cut side. Original edges leaving that side form a minimum cut.",
    secondCode: `def minimum_cut(capacity, source, sink):
    flow, residual = edmonds_karp(capacity, source, sink)
    reachable, stack = {source}, [source]
    while stack:
        vertex = stack.pop()
        for neighbor, room in enumerate(residual[vertex]):
            if room > 0 and neighbor not in reachable:
                reachable.add(neighbor); stack.append(neighbor)
    cut = [(u, v, capacity[u][v]) for u in reachable for v in range(len(capacity))
           if v not in reachable and capacity[u][v] > 0]
    return flow, cut

print(minimum_cut(capacity, 0, 3))`,
    secondTrace: "The cut capacity equals maximum flow: this is max-flow min-cut. Dinic accelerates augmentation by building BFS levels, then sending blocking flow through those levels before rebuilding them.",
    mistake: "Do not omit reverse residual edges. A locally chosen augmenting path may need partial cancellation so later flow can use capacity in a better arrangement.",
    checkpoint: "Why does the bottleneck edge determine one path's augmentation amount?",
    checkpointAnswer: "Every unit sent along the path must cross every path edge. Sending more than the smallest remaining capacity would violate that edge's limit.",
    remember: "Find a residual path, augment by its bottleneck, add reverse capacity, and stop when source cannot reach sink. The final reachable boundary is a minimum cut.",
    checks: [q("What does a reverse residual edge represent?", ["Flow that can be canceled", "New physical capacity", "A negative cycle"], 0, "It allows earlier choices to be rerouted.", ["Correct. Residual graphs preserve flexibility.", "The original network is unchanged.", "Flow does not require negative cycles."]), q("How does Dinic improve organization?", ["BFS levels plus blocking flows", "It deletes the sink", "It ignores capacities"], 0, "Many augmentations occur inside one level graph.", ["Correct. It remains a residual-flow algorithm.", "The sink is required.", "Capacity is the central constraint."])],
  },
  {
    lessonId: "py.ac.m5_4.l2", atomId: "py.atom.algo.bipartite-matching-guided", conceptId: "py.algo.bipartite-matching-guided",
    title: "Bipartite matching reroutes assignments along alternating paths", requires: ["py.algo.max-flow-guided"],
    vocabulary: [["matching", "edges that share no endpoint"], ["augmenting path", "an alternating path that starts and ends at unmatched vertices"], ["alternating path", "a path switching between unmatched and matched edges"], ["maximum matching", "a matching with the greatest possible number of edges"], ["Hopcroft-Karp", "a layered algorithm that augments many shortest paths per phase"], ["Hungarian algorithm", "an algorithm for minimum-cost perfect assignment"]],
    opening: "Bipartite matching pairs left-side items with right-side items, using each vertex at most once. A new pair may require moving an existing assignment.",
    outcome: "You will implement augmenting-path matching, trace reassignment, distinguish maximum-cardinality from minimum-cost assignment, and understand Hopcroft-Karp's layered speedup.",
    why: "Matching models jobs to workers, students to projects, ads to slots, machines to tasks, and many conflict-free assignment problems.",
    mentalModel: "A candidate asks for a seat. If it is occupied, ask that seated person whether another acceptable seat exists. A chain of moves may free one final seat.",
    firstTitle: "Search for one augmenting reassignment", firstIntro: "For each left vertex, DFS tries right neighbors. A right vertex can switch partners if its current partner finds another route.",
    firstCode: `def maximum_matching(graph):
    right_partner = {}
    def augment(left, seen):
        for right in graph[left]:
            if right in seen: continue
            seen.add(right)
            if right not in right_partner or augment(right_partner[right], seen):
                right_partner[right] = left
                return True
        return False
    size = 0
    for left in graph:
        if augment(left, set()): size += 1
    pairs = [(left, right) for right, left in right_partner.items()]
    return size, sorted(pairs)

choices = {"A": [1, 2], "B": [1], "C": [2, 3]}
print(maximum_matching(choices))`,
    firstTrace: "If A first takes seat one, B can trigger an alternating path that moves A to two and gives B seat one. C then takes three, producing three pairs.",
    secondTitle: "Separate cardinality from assignment cost", secondIntro: "Maximum matching asks for the most pairs. Hungarian-style assignment instead minimizes total cost, usually while pairing every row to a distinct column.",
    secondCode: `def assignment_cost(pairs, costs):
    return sum(costs[left][right] for left, right in pairs)

costs = {"A": {1: 8, 2: 1}, "B": {1: 2, 2: 7}}
matching_one = [("A", 1), ("B", 2)]
matching_two = [("A", 2), ("B", 1)]
print(assignment_cost(matching_one, costs), assignment_cost(matching_two, costs))`,
    secondTrace: "Both matchings have cardinality two, but costs are fifteen and three. Hopcroft-Karp accelerates unweighted cardinality matching; Hungarian solves a different weighted assignment objective.",
    mistake: "Do not greedily lock each left vertex to its first free neighbor. An alternating path may need to reroute an existing pair to create a larger matching.",
    checkpoint: "Why does flipping every edge on an augmenting path increase matching size by exactly one?",
    checkpointAnswer: "The path starts and ends unmatched and alternates. Flipping removes its matched edges and adds one more unmatched edge than it removes.",
    remember: "Augmenting paths reroute pairs and add one match. Hopcroft-Karp batches layered augmentations; Hungarian targets minimum-cost assignment instead.",
    checks: [q("What can an augmenting path do?", ["Increase matching size by one", "Reuse one endpoint twice", "Delete every vertex"], 0, "Alternating-edge flips free and reassign endpoints.", ["Correct. It ends at an unmatched right vertex.", "Matching endpoints remain unique.", "Vertices stay in the graph."]), q("What does Hungarian primarily optimize?", ["Assignment cost", "Unweighted BFS distance", "Graph component count"], 0, "It solves weighted one-to-one assignment.", ["Correct. This differs from cardinality only.", "That is unrelated.", "DSU handles components."])],
  },
  {
    lessonId: "py.ac.m5_4.l3", atomId: "py.atom.algo.euler-hamilton", conceptId: "py.algo.euler-hamilton",
    title: "Eulerian paths cover edges; Hamiltonian paths cover vertices", requires: ["py.algo.bipartite-matching-guided"],
    vocabulary: [["Eulerian path", "a walk using every edge exactly once"], ["Eulerian circuit", "an Eulerian path returning to its start"], ["Hamiltonian path", "a path visiting every vertex exactly once"], ["vertex degree", "the number of incident undirected edges"], ["Hierholzer's algorithm", "splice unused-edge cycles or trails into one Eulerian walk"], ["NP-complete", "a class including problems with quickly checkable answers but no known general fast solution"]],
    opening: "Eulerian and Hamiltonian paths sound similar but solve very different problems. Euler covers every edge once; Hamilton visits every vertex once.",
    outcome: "You will construct an Eulerian trail with Hierholzer, check undirected degree conditions, solve a small Hamiltonian path by backtracking, and compare their difficulty honestly.",
    why: "Eulerian paths model route inspection and itinerary reconstruction. Hamiltonian paths model visit-once tours and lead directly toward traveling-salesperson difficulty.",
    mentalModel: "Euler asks you to use every road once, so intersections may repeat. Hamilton asks you to visit every city once, so roads may be ignored.",
    firstTitle: "Consume every directed edge exactly once", firstIntro: "Hierholzer walks unused edges until stuck, then adds vertices to the answer while backtracking. Reverse that finishing list.",
    firstCode: `def eulerian_trail(graph, start):
    remaining = {vertex: neighbors[:] for vertex, neighbors in graph.items()}
    stack, trail = [start], []
    while stack:
        vertex = stack[-1]
        if remaining[vertex]:
            stack.append(remaining[vertex].pop())
        else:
            trail.append(stack.pop())
    trail.reverse()
    edge_count = sum(len(neighbors) for neighbors in graph.values())
    return trail if len(trail) == edge_count + 1 else None

flights = {"JFK": ["SFO", "ATL"], "SFO": ["ATL"], "ATL": ["JFK", "SFO"]}
print(eulerian_trail(flights, "JFK"))`,
    firstTrace: "Edges are removed as used. Getting stuck completes the end of the trail, so vertices are recorded backward. A valid answer has exactly edge-count plus one vertices.",
    secondTitle: "Backtrack over unused vertices for Hamilton", secondIntro: "No simple degree rule solves general Hamiltonian path. This exponential search tries each unused neighboring vertex and undoes failed choices.",
    secondCode: `def hamiltonian_path(graph):
    def search(path, used):
        if len(path) == len(graph): return path[:]
        for neighbor in graph[path[-1]]:
            if neighbor not in used:
                used.add(neighbor); path.append(neighbor)
                answer = search(path, used)
                if answer: return answer
                path.pop(); used.remove(neighbor)
        return None
    for start in graph:
        answer = search([start], {start})
        if answer: return answer
    return None

graph = {0: [1, 2], 1: [0, 2, 3], 2: [0, 1, 3], 3: [1, 2]}
print(hamiltonian_path(graph))`,
    secondTrace: "The search tracks used vertices rather than used edges. It may explore exponentially many partial paths. General Hamiltonian path is NP-complete, unlike linear-time Eulerian construction.",
    mistake: "Do not apply Euler degree conditions to Hamiltonian path. Edge coverage is governed by degrees; vertex-once coverage has no equivalent simple general characterization.",
    checkpoint: "Can an Eulerian trail revisit a vertex, and can a Hamiltonian path ignore edges?",
    checkpointAnswer: "Yes to both. Euler restricts edge use but may revisit intersections. Hamilton restricts vertex visits but chooses only enough edges to connect its vertex order.",
    remember: "Euler covers edges and has degree/connectivity tests plus Hierholzer. Hamilton covers vertices and generally needs exponential search.",
    checks: [q("What must an Eulerian path use exactly once?", ["Every edge", "Every vertex", "Only the lightest edge"], 0, "Vertices may repeat while edges do not.", ["Correct. That is the defining distinction.", "That describes Hamiltonian paths.", "Weights are irrelevant."]), q("What is the general complexity status of Hamiltonian path?", ["NP-complete", "Always linear", "Constant time"], 0, "No general polynomial-time algorithm is known.", ["Correct. Small cases use pruning or subset DP.", "That applies to Eulerian construction.", "Input must at least be read."])],
  },
  {
    lessonId: "py.ac.m5_4.l4", atomId: "py.atom.algo.two-sat-guided", conceptId: "py.algo.two-sat-guided",
    title: "Two-SAT turns clauses into implication paths", requires: ["py.algo.euler-hamilton"],
    vocabulary: [["Boolean variable", "a value that is either true or false"], ["literal", "a variable or its negation"], ["clause", "an OR of literals that must evaluate true"], ["implication graph", "a graph encoding which literal choices force others"], ["Two-SAT", "satisfiability where every clause contains at most two literals"], ["contradiction SCC", "one strong component containing a literal and its negation"]],
    opening: "Two-SAT asks whether two-literal OR clauses can all be true together. Each clause becomes two implications, turning logic into graph reachability.",
    outcome: "You will encode clauses, find SCC contradictions, construct a satisfying assignment, and distinguish polynomial Two-SAT from general SAT.",
    why: "Two-SAT models feature flags, paired choices, scheduling constraints, compatibility rules, and many problems that appear exponential before implication structure is noticed.",
    mentalModel: "Clause A-or-B says that choosing not-A forces B, and choosing not-B forces A. Follow those forced-choice arrows to find contradictions.",
    firstTitle: "Translate each clause into two edges", firstIntro: "Represent literal x as positive integer x and not-x as negative x. Clause a-or-b adds not-a to b and not-b to a.",
    firstCode: `def implication_graph(variable_count, clauses):
    literals = [value for variable in range(1, variable_count + 1) for value in (variable, -variable)]
    graph = {literal: [] for literal in literals}
    for first, second in clauses:
        graph[-first].append(second)
        graph[-second].append(first)
    return graph

def two_sat(variable_count, clauses):
    graph = implication_graph(variable_count, clauses)
    components = kosaraju(graph)
    component_of = {literal: index for index, group in enumerate(components) for literal in group}
    for variable in range(1, variable_count + 1):
        if component_of[variable] == component_of[-variable]: return None
    return {variable: component_of[variable] < component_of[-variable]
            for variable in range(1, variable_count + 1)}

clauses = [(1, 2), (-1, 3), (-2, -3)]
print(implication_graph(3, clauses))`,
    firstTrace: "Clause one-or-two adds not-one implies two and not-two implies one. Every implication preserves exactly the cases that would otherwise make its clause false.",
    secondTitle: "Reject a variable that meets its negation", secondIntro: "Run Kosaraju SCCs. If x and not-x share one SCC, each forces the other and no truth assignment can separate them.",
    secondCode: `def kosaraju(graph):
    seen, order = set(), []
    def finish(vertex):
        seen.add(vertex)
        for neighbor in graph[vertex]:
            if neighbor not in seen: finish(neighbor)
        order.append(vertex)
    for vertex in graph:
        if vertex not in seen: finish(vertex)
    reverse = {vertex: [] for vertex in graph}
    for vertex in graph:
        for neighbor in graph[vertex]: reverse[neighbor].append(vertex)
    seen.clear(); groups = []
    def collect(vertex, group):
        seen.add(vertex); group.append(vertex)
        for neighbor in reverse[vertex]:
            if neighbor not in seen: collect(neighbor, group)
    for vertex in reversed(order):
        if vertex not in seen: group = []; collect(vertex, group); groups.append(group)
    return groups
print(two_sat(3, [(1, 2), (-1, 3), (-2, -3)]))
print(two_sat(1, [(1, 1), (-1, -1)]))`,
    secondTrace: "The impossible clauses force one true and one false simultaneously, placing both literals in one SCC. SCC reverse order also supplies a valid assignment when no contradiction exists.",
    mistake: "Do not generalize this polynomial method to arbitrary three-literal SAT. Two literals create binary implications; larger clauses do not decompose into the same equivalent pair of edges.",
    checkpoint: "Why does one SCC containing x and not-x prove impossibility?",
    checkpointAnswer: "Paths exist from x to not-x and back. Choosing either truth value forces its opposite, so neither choice can remain consistent.",
    remember: "Clause a-or-b becomes not-a implies b and not-b implies a. Two-SAT fails exactly when a literal shares an SCC with its negation.",
    checks: [q("What edges encode clause a OR b?", ["not-a to b and not-b to a", "a to not-a only", "b to b only"], 0, "If one literal is false, the other must be true.", ["Correct. The pair is logically equivalent.", "That invents a contradiction.", "It ignores a."]), q("What SCC condition makes Two-SAT impossible?", ["A variable and its negation share one SCC", "Every SCC has one vertex", "The graph has any edge"], 0, "Mutual implication forces both opposing values.", ["Correct. This is the contradiction test.", "Singleton SCCs are fine.", "Implication edges are expected."])],
  },
];

export const ALGO_ADVANCED_GRAPH_ATOMS = SPECS.map(guidedMasteryAtom);
export const ALGO_ADVANCED_GRAPH_CONCEPTS = SPECS.map(guidedMasteryConcept);
export const ALGO_ADVANCED_GRAPH_LESSON_CONTENT = guidedLessonContent(SPECS);

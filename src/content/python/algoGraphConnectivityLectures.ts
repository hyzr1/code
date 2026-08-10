import type { LectureQuestion } from "../../types";
import { guidedLessonContent, guidedMasteryAtom, guidedMasteryConcept, type GuidedMasterySpec } from "./guidedMastery";

const q = (question: string, choices: [string, string, string], answer: 0 | 1 | 2, explanation: string, why: [string, string, string]): LectureQuestion => ({ question, choices, answer, explanation, why });

const SPECS: GuidedMasterySpec[] = [
  {
    lessonId: "py.ac.m5_2.l1", atomId: "py.atom.algo.topological-order-guided", conceptId: "py.algo.topological-order-guided",
    title: "Topological order places every prerequisite first", requires: ["py.algo.graph-bipartite"],
    vocabulary: [["directed acyclic graph", "a directed graph containing no directed cycle"], ["topological order", "a sequence where every directed edge points forward"], ["indegree", "the number of incoming edges at a vertex"], ["Kahn's algorithm", "repeatedly remove vertices with zero remaining indegree"], ["postorder", "record a DFS vertex after all outgoing neighbors finish"]],
    opening: "A dependency order must place every prerequisite before the work that needs it. Such an order exists exactly when the directed graph has no cycle.",
    outcome: "You will implement Kahn's algorithm and DFS postorder, detect impossible cyclic dependencies, and explain why several valid orders may exist.",
    why: "Build systems, course schedules, migrations, spreadsheets, compilers, and job pipelines all need dependency-safe ordering.",
    mentalModel: "Place tasks on a conveyor belt. A task can enter only when every incoming prerequisite ticket has been removed. Completing it removes its outgoing tickets.",
    firstTitle: "Remove zero-indegree vertices", firstIntro: "Count incoming edges, queue every initially ready vertex, then decrement neighbors as prerequisites leave the graph.",
    firstCode: `from collections import deque

def kahn_order(graph):
    indegree = {vertex: 0 for vertex in graph}
    for neighbors in graph.values():
        for neighbor in neighbors: indegree[neighbor] += 1
    ready = deque(vertex for vertex in graph if indegree[vertex] == 0)
    order = []
    while ready:
        vertex = ready.popleft()
        order.append(vertex)
        for neighbor in graph[vertex]:
            indegree[neighbor] -= 1
            if indegree[neighbor] == 0: ready.append(neighbor)
    return order if len(order) == len(graph) else None

courses = {"Python": ["Algorithms"], "Algorithms": ["Interviews"], "Git": ["Interviews"], "Interviews": []}
print(kahn_order(courses))`,
    firstTrace: "Python and Git begin ready. Removing Python unlocks Algorithms. Interviews waits until both Algorithms and Git are removed. If vertices remain but no task is ready, a cycle blocks them.",
    secondTitle: "Reverse DFS finishing order", secondIntro: "A gray neighbor exposes a cycle. A safe vertex enters postorder only after every dependent neighbor has finished.",
    secondCode: `def dfs_order(graph):
    color, finished = {}, []
    def visit(vertex):
        color[vertex] = 1
        for neighbor in graph[vertex]:
            if color.get(neighbor) == 1: return False
            if color.get(neighbor, 0) == 0 and not visit(neighbor): return False
        color[vertex] = 2
        finished.append(vertex)
        return True
    for vertex in graph:
        if color.get(vertex, 0) == 0 and not visit(vertex): return None
    return finished[::-1]

cycle = {"A": ["B"], "B": ["C"], "C": ["A"]}
print(dfs_order(courses), dfs_order(cycle))`,
    secondTrace: "A vertex finishes after everything reachable through its outgoing edges, so reversing finish order places it first. The A-B-C back edge reaches gray A and rejects the cyclic graph.",
    mistake: "Do not claim a topological order is unique. Independent ready vertices may appear in either order. Uniqueness requires exactly one available choice at every Kahn step.",
    checkpoint: "Why does Kahn's algorithm detect a cycle when fewer than V vertices are removed?",
    checkpointAnswer: "Every remaining vertex has an incoming edge from another remaining vertex. Following those prerequisites forever in a finite graph must revisit a vertex, forming a cycle.",
    remember: "Kahn removes zero-indegree prerequisites; DFS reverses safe finish order. A directed cycle makes every topological order impossible.",
    checks: [q("What graph can have a topological order?", ["A directed acyclic graph", "Any directed cycle", "Only an undirected tree"], 0, "Every edge must point forward without returning.", ["Correct. DAG is the standard name.", "A cycle demands contradictory precedence.", "Topological order concerns directed edges."]), q("When is a Kahn order unique?", ["Exactly one vertex is ready at each step", "Every vertex starts ready", "The graph has no edges"], 0, "Multiple simultaneous choices create alternate orders.", ["Correct. Each position is then forced.", "That permits many orders.", "An edgeless graph has many orders."])],
  },
  {
    lessonId: "py.ac.m5_2.l2", atomId: "py.atom.algo.dsu-foundations", conceptId: "py.algo.dsu-foundations",
    title: "Disjoint Set Union maintains changing groups", requires: ["py.algo.topological-order-guided"],
    vocabulary: [["Disjoint Set Union", "a structure that merges groups and tests whether items share one group"], ["representative", "the root chosen to name one set"], ["find", "return an item's current representative"], ["union", "merge two sets if they differ"], ["path compression", "make find paths point closer to the root"], ["union by size", "attach the smaller tree under the larger tree"]],
    opening: "Disjoint Set Union, or DSU, answers a narrow dynamic question very quickly: are these items connected after all merges seen so far?",
    outcome: "You will implement find with path compression, union by size, component counting, and explain the nearly constant amortized cost.",
    why: "DSU handles incremental connectivity, redundant edges, account grouping, Kruskal's minimum spanning tree, and offline equivalence problems.",
    mentalModel: "Every group chooses one captain. To merge groups, one captain reports to the other. Path compression lets every member learn the captain's direct phone number.",
    firstTitle: "Store parent and size arrays", firstIntro: "Each item begins as its own representative. Find climbs to the root and rewrites the path while returning.",
    firstCode: `class DSU:
    def __init__(self, size):
        self.parent = list(range(size))
        self.size = [1] * size
        self.components = size
    def find(self, item):
        if self.parent[item] != item:
            self.parent[item] = self.find(self.parent[item])
        return self.parent[item]
    def union(self, first, second):
        root_a, root_b = self.find(first), self.find(second)
        if root_a == root_b: return False
        if self.size[root_a] < self.size[root_b]: root_a, root_b = root_b, root_a
        self.parent[root_b] = root_a
        self.size[root_a] += self.size[root_b]
        self.components -= 1
        return True

groups = DSU(6)
print(groups.union(0, 1), groups.union(1, 2), groups.union(0, 2))
print(groups.find(2), groups.components)`,
    firstTrace: "The first two unions merge zero, one, and two. Union zero-two returns false because both already share a representative. Six starting components minus two successful merges leaves four.",
    secondTitle: "Watch path compression flatten a chain", secondIntro: "This demonstration creates a tall parent chain manually, then one find rewrites every visited parent to the root.",
    secondCode: `demo = DSU(6)
demo.parent = [0, 0, 1, 2, 3, 4]
print(demo.parent)
print(demo.find(5))
print(demo.parent)`,
    secondTrace: "Five initially follows five-four-three-two-one-zero. Recursive find returns zero through every frame and rewrites those parent entries. Later finds on that path become nearly direct.",
    mistake: "Do not compare parent[item] values to test connectivity. A parent may be an intermediate node. Compare find(first) with find(second) so both reach current representatives.",
    checkpoint: "Why should union attach the smaller tree under the larger tree?",
    checkpointAnswer: "The smaller tree's nodes gain at most one level, while the larger tree stays in place. Repeating this rule prevents tall unbalanced parent chains.",
    remember: "Find returns a representative, union merges representatives, path compression flattens searches, and union by size prevents height growth.",
    checks: [q("What does union return false mean here?", ["The items were already connected", "The indexes are sorted", "Find failed"], 0, "Both items had one representative.", ["Correct. No component count changes.", "Ordering is unrelated.", "Find still succeeded."]), q("What is DSU's amortized operation cost?", ["Nearly constant", "Always theta n", "Theta n squared"], 0, "Both heuristics yield inverse-Ackermann amortized time.", ["Correct. It grows slower than practical constants.", "Compression avoids linear repeated paths.", "That is far too large."])],
  },
  {
    lessonId: "py.ac.m5_2.l3", atomId: "py.atom.algo.dsu-applications", conceptId: "py.algo.dsu-applications",
    title: "DSU accepts only edges that join different components", requires: ["py.algo.dsu-foundations"],
    vocabulary: [["redundant edge", "an edge whose endpoints are already connected"], ["minimum spanning tree", "minimum-weight edges connecting all vertices without cycles"], ["Kruskal's algorithm", "scan edges by weight and accept only component-merging edges"], ["spanning", "including every graph vertex"], ["forest", "a collection of disconnected trees"]],
    opening: "DSU turns an edge into one yes-or-no question: does this edge join two different components? That question detects cycles and builds minimum spanning trees.",
    outcome: "You will find a redundant undirected edge, implement Kruskal's algorithm, and explain why rejecting same-component edges preserves an acyclic forest.",
    why: "These patterns appear in network design, clustering, connectivity thresholds, image grouping, and interview problems with edges arriving over time.",
    mentalModel: "Each accepted cable joins two separate islands. A cable whose endpoints already share land only creates a loop, so Kruskal discards it.",
    firstTitle: "Return the edge that closes a cycle", firstIntro: "Union succeeds only across components. The first failed union has an alternate existing path between its endpoints.",
    firstCode: `class DSU:
    def __init__(self, size): self.parent, self.rank = list(range(size)), [0] * size
    def find(self, item):
        while item != self.parent[item]:
            self.parent[item] = self.parent[self.parent[item]]
            item = self.parent[item]
        return item
    def union(self, first, second):
        a, b = self.find(first), self.find(second)
        if a == b: return False
        if self.rank[a] < self.rank[b]: a, b = b, a
        self.parent[b] = a
        if self.rank[a] == self.rank[b]: self.rank[a] += 1
        return True

def redundant_edge(vertex_count, edges):
    groups = DSU(vertex_count)
    for edge in edges:
        if not groups.union(*edge): return edge
    return None

print(redundant_edge(4, [(0, 1), (1, 2), (2, 0), (2, 3)]))`,
    firstTrace: "Zero-one and one-two build one component. Edge two-zero finds the same representative at both endpoints, proving another path already connects them. Adding it would close a cycle.",
    secondTitle: "Choose the cheapest safe edge", secondIntro: "Kruskal sorts edges by weight. Accepting a same-component edge would create a cycle and cannot be needed for connectivity.",
    secondCode: `def kruskal(vertex_count, weighted_edges):
    groups = DSU(vertex_count)
    total, chosen = 0, []
    for weight, first, second in sorted(weighted_edges):
        if groups.union(first, second):
            total += weight
            chosen.append((first, second, weight))
            if len(chosen) == vertex_count - 1: break
    if len(chosen) != vertex_count - 1: return None
    return total, chosen

edges = [(4, 0, 1), (1, 0, 2), (2, 1, 2), (5, 1, 3), (3, 2, 3)]
print(kruskal(4, edges))`,
    secondTrace: "Weight one joins zero-two. Weight two joins vertex one. Weight four would now close a cycle and is skipped. Weight three joins vertex three, completing a tree with total six.",
    mistake: "Do not use Kruskal's output as a shortest path tree. A minimum spanning tree minimizes total selected edge weight, not distance from one source to every vertex.",
    checkpoint: "Why does a connected spanning tree contain exactly V minus one edges?",
    checkpointAnswer: "Starting with V components, each cycle-free accepted edge reduces the component count by one. Reaching one component therefore needs exactly V minus one merges.",
    remember: "A failed union exposes a redundant edge. Kruskal sorts by weight and accepts exactly the cheap edges that merge different components.",
    checks: [q("What does Kruskal reject?", ["Edges whose endpoints already share a component", "Every light edge", "All edges touching vertex zero"], 0, "Such an edge would close a cycle.", ["Correct. DSU detects it quickly.", "Light safe edges are preferred.", "Vertex identity is irrelevant."]), q("What does an MST minimize?", ["Total tree edge weight", "Every source-to-target path", "The number of vertices"], 0, "It is a global connectivity cost.", ["Correct. Shortest paths are a different objective.", "An MST can have longer individual paths.", "All spanning trees include every vertex."])],
  },
  {
    lessonId: "py.ac.m5_2.l4", atomId: "py.atom.algo.strong-components", conceptId: "py.algo.strong-components",
    title: "A strong component is mutually reachable in a directed graph", requires: ["py.algo.dsu-applications"],
    vocabulary: [["strongly connected component", "a maximal directed group where every vertex reaches every other"], ["condensation graph", "the DAG formed by shrinking each strong component to one vertex"], ["finish order", "vertices ordered by when DFS completes them"], ["transpose graph", "a directed graph with every edge reversed"], ["low-link", "the earliest reachable discovery index within an active DFS region"]],
    opening: "Directed reachability is one-way. A strongly connected component, or SCC, groups vertices that can travel to each other in both directions.",
    outcome: "You will compute SCCs with Kosaraju's two-pass algorithm, understand Tarjan's low-link stack idea, and explain why SCC contraction produces a DAG.",
    why: "SCCs reveal dependency cycles, mutually recursive modules, communication regions, state-machine loops, and the acyclic structure hidden inside a directed graph.",
    mentalModel: "Inside one SCC, every street has some return route. Shrink each round-trip neighborhood into one large dot; the remaining map cannot contain a directed cycle.",
    firstTitle: "Use finish order, then reverse every edge", firstIntro: "The first DFS records finish order. The transpose pass starts from the latest finisher and collects one complete SCC at a time.",
    firstCode: `def kosaraju(graph):
    visited, order = set(), []
    def finish(vertex):
        visited.add(vertex)
        for neighbor in graph[vertex]:
            if neighbor not in visited: finish(neighbor)
        order.append(vertex)
    for vertex in graph:
        if vertex not in visited: finish(vertex)
    reverse = {vertex: [] for vertex in graph}
    for vertex, neighbors in graph.items():
        for neighbor in neighbors: reverse[neighbor].append(vertex)
    visited.clear(); components = []
    def collect(vertex, group):
        visited.add(vertex); group.append(vertex)
        for neighbor in reverse[vertex]:
            if neighbor not in visited: collect(neighbor, group)
    for vertex in reversed(order):
        if vertex not in visited:
            group = []; collect(vertex, group); components.append(group)
    return components
print(kosaraju({0: [1], 1: [2, 3], 2: [0], 3: [4], 4: [3]}))`,
    firstTrace: "Zero, one, and two form one mutual loop. Three and four form another. The one-way edge from one to three does not merge them because no path returns from the second group.",
    secondTitle: "Understand Tarjan's one-pass boundary", secondIntro: "Tarjan keeps active vertices on a stack. When a vertex's low-link equals its own discovery index, it is the root of one complete SCC.",
    secondCode: `def tarjan(graph):
    index, stack, on_stack, found = 0, [], set(), []
    discovery, low = {}, {}
    def visit(vertex):
        nonlocal index
        discovery[vertex] = low[vertex] = index; index += 1
        stack.append(vertex); on_stack.add(vertex)
        for neighbor in graph[vertex]:
            if neighbor not in discovery:
                visit(neighbor); low[vertex] = min(low[vertex], low[neighbor])
            elif neighbor in on_stack:
                low[vertex] = min(low[vertex], discovery[neighbor])
        if low[vertex] == discovery[vertex]:
            group = []
            while True:
                node = stack.pop(); on_stack.remove(node); group.append(node)
                if node == vertex: break
            found.append(group)
    for vertex in graph:
        if vertex not in discovery: visit(vertex)
    return found
print(tarjan({0: [1], 1: [2, 3], 2: [0], 3: [4], 4: [3]}))`,
    secondTrace: "Back edges to active vertices lower the reachable discovery boundary. When a root cannot reach an older active vertex, popping through that root produces exactly its mutual-reachability group.",
    mistake: "Do not lower Tarjan low-link through an edge to a vertex already removed from the active stack. That SCC is finished and cannot belong to the current component.",
    checkpoint: "Why must the SCC condensation graph be acyclic?",
    checkpointAnswer: "A directed cycle between contracted components would give return paths among all of them. They would actually be one larger strongly connected component, contradicting maximality.",
    remember: "Kosaraju uses finish order plus reversed edges; Tarjan uses discovery, low-link, and an active stack. Both partition directed vertices into maximal mutual groups.",
    checks: [q("What makes vertices strongly connected?", ["Each reaches every other", "They share one outgoing edge", "They have equal indegree"], 0, "Reachability must work in both directions.", ["Correct. This defines an SCC.", "One-way reachability is insufficient.", "Degrees do not prove paths."]), q("When does Tarjan pop an SCC?", ["At a vertex whose low-link equals its discovery index", "At every leaf only", "When the stack is empty"], 0, "That vertex is the active component root.", ["Correct. Pop through that root.", "SCC roots need not be leaves.", "Several SCCs may be popped during one DFS."])],
  },
  {
    lessonId: "py.ac.m5_2.l5", atomId: "py.atom.algo.bridges-articulation", conceptId: "py.algo.bridges-articulation",
    title: "Low-link values expose single points of failure", requires: ["py.algo.strong-components"],
    vocabulary: [["bridge", "an undirected edge whose removal increases component count"], ["articulation point", "a vertex whose removal increases component count"], ["discovery time", "the DFS order number assigned when a vertex is entered"], ["low-link value", "the oldest discovery reachable through subtree edges plus at most one back edge"], ["back edge", "an undirected edge from a descendant to an already discovered ancestor"]],
    opening: "Some undirected edges or vertices are the only connection between regions. Low-link values reveal whether a child subtree has another route to an ancestor.",
    outcome: "You will find bridges and articulation points, trace discovery and low-link updates, and handle the DFS root's special articulation rule.",
    why: "Single points of failure matter in networks, roads, power grids, social graphs, and any system that must stay connected after one loss.",
    mentalModel: "A DFS branch lowers a rescue rope when it finds a back road. No high rope means the parent connection is its only escape.",
    firstTitle: "A child with no older escape creates a bridge", firstIntro: "Compare a child's low-link with the parent's discovery time. A greater value means the child cannot bypass that edge.",
    firstCode: `def find_bridges(graph):
    time, discovery, low, bridges = 0, {}, {}, []
    def visit(vertex, parent):
        nonlocal time
        discovery[vertex] = low[vertex] = time; time += 1
        for neighbor in graph[vertex]:
            if neighbor == parent: continue
            if neighbor not in discovery:
                visit(neighbor, vertex)
                low[vertex] = min(low[vertex], low[neighbor])
                if low[neighbor] > discovery[vertex]: bridges.append((vertex, neighbor))
            else:
                low[vertex] = min(low[vertex], discovery[neighbor])
    for vertex in graph:
        if vertex not in discovery: visit(vertex, None)
    return bridges

graph = {0: [1, 2], 1: [0, 2], 2: [0, 1, 3], 3: [2, 4], 4: [3]}
print(find_bridges(graph))`,
    firstTrace: "The zero-one-two triangle has back routes, so its edges are safe. Edges two-three and three-four have no bypass, so removing either separates the graph.",
    secondTitle: "A non-root parent may separate a child subtree", secondIntro: "For articulation, child low-link equal to the parent's discovery also counts. The DFS root is special: it needs at least two independent DFS children.",
    secondCode: `def articulation_points(graph):
    time, discovery, low, points = 0, {}, {}, set()
    def visit(vertex, parent):
        nonlocal time
        discovery[vertex] = low[vertex] = time; time += 1
        children = 0
        for neighbor in graph[vertex]:
            if neighbor == parent: continue
            if neighbor not in discovery:
                children += 1; visit(neighbor, vertex)
                low[vertex] = min(low[vertex], low[neighbor])
                if parent is not None and low[neighbor] >= discovery[vertex]: points.add(vertex)
            else:
                low[vertex] = min(low[vertex], discovery[neighbor])
        if parent is None and children > 1: points.add(vertex)
    for vertex in graph:
        if vertex not in discovery: visit(vertex, None)
    return points

print(articulation_points(graph))`,
    secondTrace: "Removing two separates the tail from the triangle. Removing three separates leaf four. Root zero has one DFS child, so it is not an articulation point.",
    mistake: "Do not apply the ordinary inequality to the DFS root. It needs the separate rule of more than one DFS child.",
    checkpoint: "Why is the bridge test strict greater, while the non-root articulation test uses greater than or equal?",
    checkpointAnswer: "If a child subtree reaches the parent but no older ancestor, its low equals the parent's discovery. That alternate edge saves the tree edge, but removing the parent deletes both connections.",
    remember: "Low-link summarizes the oldest reachable ancestor. Child low greater than parent discovery marks a bridge; greater or equal marks a non-root articulation point.",
    checks: [q("What does low[child] greater than discovery[parent] prove?", ["The parent-child edge is a bridge", "The child is a leaf only", "The graph is directed"], 0, "No child-subtree route reaches the parent or an older ancestor.", ["Correct. Removing the edge disconnects that subtree.", "A whole subtree may exist.", "This algorithm is for undirected graphs."]), q("When is a DFS root an articulation point?", ["It has more than one DFS child", "It has any parent", "Its low-link is zero"], 0, "Independent child subtrees connect only through the root.", ["Correct. Removing it separates them.", "A DFS root has no parent.", "That alone is normal for the root."])],
  },
];

export const ALGO_GRAPH_CONNECTIVITY_ATOMS = SPECS.map(guidedMasteryAtom);
export const ALGO_GRAPH_CONNECTIVITY_CONCEPTS = SPECS.map(guidedMasteryConcept);
export const ALGO_GRAPH_CONNECTIVITY_LESSON_CONTENT = guidedLessonContent(SPECS);

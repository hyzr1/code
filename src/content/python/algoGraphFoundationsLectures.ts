import type { LectureQuestion } from "../../types";
import { guidedLessonContent, guidedMasteryAtom, guidedMasteryConcept, type GuidedMasterySpec } from "./guidedMastery";

const q = (question: string, choices: [string, string, string], answer: 0 | 1 | 2, explanation: string, why: [string, string, string]): LectureQuestion => ({ question, choices, answer, explanation, why });

const SPECS: GuidedMasterySpec[] = [
  {
    lessonId: "py.ac.m5_1.l1", atomId: "py.atom.algo.graph-representations", conceptId: "py.algo.graph-representations",
    title: "A graph models objects and their relationships", requires: ["py.algo.trie-applications"],
    vocabulary: [["vertex", "one object or state in a graph"], ["edge", "a relationship or allowed move between two vertices"], ["adjacency list", "a mapping from each vertex to its neighbors"], ["adjacency matrix", "a table whose row-column cell records an edge"], ["implicit graph", "a graph whose neighbors are generated instead of stored"]],
    opening: "A graph is a set of vertices connected by edges. The same abstract relationships can be stored in several ways, and the right representation changes cost.",
    outcome: "You will build edge lists, adjacency lists, and matrices, compare their time and space, and recognize problems whose graph is generated from states.",
    why: "Roads, friendships, dependencies, networks, games, and transformations all become graph problems once you identify states and legal connections.",
    mentalModel: "Vertices are dots and edges are lines. A representation is only a filing system for those lines; it does not change the underlying relationships.",
    firstTitle: "Build two stored representations", firstIntro: "For an undirected edge, add both directions. A list stores existing neighbors; a matrix reserves a cell for every possible pair.",
    firstCode: `def build_graph(vertex_count, edges):
    adjacency = [[] for _ in range(vertex_count)]
    matrix = [[False] * vertex_count for _ in range(vertex_count)]
    for left, right in edges:
        adjacency[left].append(right)
        adjacency[right].append(left)
        matrix[left][right] = matrix[right][left] = True
    return adjacency, matrix

edges = [(0, 1), (0, 3), (1, 2), (2, 3)]
adjacency, matrix = build_graph(4, edges)
print(adjacency)
print(matrix[0][2], matrix[0][3])`,
    firstTrace: "The adjacency list stores two entries per undirected edge, using theta vertices plus edges space. The matrix uses theta vertices squared space but answers whether one exact edge exists in theta one time.",
    secondTitle: "Generate neighbors for an implicit graph", secondIntro: "A four-digit lock state has up to eight neighbors: turn each wheel one step forward or backward. Storing every edge is unnecessary.",
    secondCode: `def lock_neighbors(state):
    neighbors = []
    for index, digit in enumerate(state):
        value = int(digit)
        for change in (-1, 1):
            replacement = str((value + change) % 10)
            neighbors.append(state[:index] + replacement + state[index + 1:])
    return neighbors

print(lock_neighbors("0000"))`,
    secondTrace: "The neighbor function produces eight legal next states when a traversal needs them. The vertices are lock strings, and each legal one-wheel turn is an edge. No giant adjacency list is required.",
    mistake: "Do not automatically allocate a matrix. Sparse graphs with millions of vertices may have only a few edges per vertex, making quadratic storage impossible.",
    checkpoint: "When is an adjacency matrix preferable to an adjacency list?",
    checkpointAnswer: "When the graph is small or dense and constant-time exact edge checks matter enough to justify theta vertices squared space.",
    remember: "Name vertices and edges first, then choose stored lists, a dense matrix, an edge list, or generated neighbors from the operations you need.",
    checks: [q("What is adjacency-list space?", ["Theta(V + E)", "Theta(V squared) always", "Theta one"], 0, "It stores vertices and existing neighbor entries.", ["Correct. Undirected edges appear twice but remain theta E.", "That describes a matrix.", "The graph grows with input."]), q("What defines an implicit graph edge?", ["A legal transition between states", "A required matrix cell", "Only a drawn line"], 0, "Neighbors can be computed when needed.", ["Correct. State rules define connectivity.", "No matrix is required.", "The graph can exist without a drawing."])],
  },
  {
    lessonId: "py.ac.m5_1.l2", atomId: "py.atom.algo.grid-graphs", conceptId: "py.algo.grid-graphs",
    title: "A grid is a graph with coordinates as vertices", requires: ["py.algo.graph-representations"],
    vocabulary: [["cell", "one row-column position treated as a vertex"], ["four-directional", "moves up, down, left, and right"], ["eight-directional", "four straight moves plus four diagonals"], ["boundary check", "a test that a coordinate remains inside the grid"], ["blocked cell", "a position excluded from the graph"]],
    opening: "A grid problem is often a graph problem in disguise. Each usable cell is a vertex, and movement rules define which neighboring cells have edges.",
    outcome: "You will generate four- and eight-directional neighbors safely, separate bounds from passability, and traverse a grid without revisiting cells.",
    why: "Islands, mazes, image regions, chess moves, robot paths, and matrix simulations all depend on precise coordinate and movement modeling.",
    mentalModel: "Lay graph dots at cell centers. Draw a line only when the movement rule allows the destination and the destination is not blocked.",
    firstTitle: "Centralize coordinate validation", firstIntro: "A reusable neighbor function checks both row and column bounds before reading a cell. Direction arrays keep movement rules explicit.",
    firstCode: `FOUR_DIRECTIONS = [(-1, 0), (1, 0), (0, -1), (0, 1)]
EIGHT_DIRECTIONS = FOUR_DIRECTIONS + [(-1, -1), (-1, 1), (1, -1), (1, 1)]

def neighbors(grid, row, column, directions):
    height, width = len(grid), len(grid[0])
    for row_change, column_change in directions:
        next_row = row + row_change
        next_column = column + column_change
        if 0 <= next_row < height and 0 <= next_column < width:
            if grid[next_row][next_column] != "#":
                yield next_row, next_column

grid = ["...", ".#.", "..."]
print(list(neighbors(grid, 0, 0, FOUR_DIRECTIONS)))
print(list(neighbors(grid, 0, 0, EIGHT_DIRECTIONS)))`,
    firstTrace: "From the top-left corner, four-direction movement reaches down and right. Eight-direction movement would add the diagonal center, but that cell is blocked and therefore not a graph vertex.",
    secondTitle: "Traverse reachable cells exactly once", secondIntro: "A stack holds the frontier. Mark a coordinate visited when adding it, preventing the same cell from being scheduled by several neighbors.",
    secondCode: `def reachable_cells(grid, start):
    if grid[start[0]][start[1]] == "#": return set()
    visited = {start}
    stack = [start]
    while stack:
        row, column = stack.pop()
        for next_cell in neighbors(grid, row, column, FOUR_DIRECTIONS):
            if next_cell not in visited:
                visited.add(next_cell)
                stack.append(next_cell)
    return visited

maze = ["..#.", ".##.", "...."]
print(sorted(reachable_cells(maze, (0, 0))))`,
    secondTrace: "The traversal crosses only open four-direction edges. Marking on insertion keeps each usable cell in the stack at most once, giving theta rows times columns worst-case time and space.",
    mistake: "Do not assume diagonals are allowed. Four versus eight directions changes connectivity, path length, and island count. State the movement rule before coding.",
    checkpoint: "Why must bounds be checked before reading grid[next_row][next_column]?",
    checkpointAnswer: "A generated coordinate may lie outside the grid. Reading first can raise an error or, with negative Python indexes, silently access the wrong cell.",
    remember: "Coordinates are vertices, allowed moves are edges, blocked cells are absent, and visited state prevents repeated work.",
    checks: [q("What does eight-directional movement add?", ["Four diagonals", "Knight moves", "Wraparound automatically"], 0, "It extends the four straight directions.", ["Correct. Corners become adjacent.", "That requires a different direction set.", "Wraparound must be stated separately."]), q("When should a grid cell be marked visited?", ["When it enters the frontier", "Only after all traversal ends", "Never"], 0, "Early marking prevents duplicate scheduling.", ["Correct. Each cell is queued once.", "Many copies could accumulate.", "Cycles would repeat forever."])],
  },
  {
    lessonId: "py.ac.m5_1.l3", atomId: "py.atom.algo.graph-bfs", conceptId: "py.algo.graph-bfs",
    title: "BFS discovers unweighted shortest paths by layers", requires: ["py.algo.grid-graphs"],
    vocabulary: [["breadth-first search", "explore all vertices at one edge distance before the next"], ["unweighted shortest path", "a path using the fewest edges when every edge has equal cost"], ["distance", "the number of edges from the start"], ["predecessor", "the vertex used to first discover another vertex"], ["multi-source BFS", "start one BFS from several distance-zero vertices"]],
    opening: "Breadth-first search expands like ripples. In an unweighted graph, the first time it reaches a vertex is through a path with the fewest edges.",
    outcome: "You will compute distances, reconstruct a shortest path, run multi-source BFS, and explain why queue order proves optimality only for equal-cost edges.",
    why: "BFS solves minimum moves, social distance, nearest resource, spreading processes, and many grid paths. It also underlies later graph algorithms.",
    mentalModel: "Drop a pebble at the start. The distance-one ring appears first, then distance two. A farther ring cannot reach a point before a nearer ring.",
    firstTitle: "Record distance and predecessor on discovery", firstIntro: "The queue is first in, first out. Marking when enqueued ensures the first recorded predecessor belongs to a shortest path.",
    firstCode: `from collections import deque

def shortest_path(graph, start, target):
    queue = deque([start])
    distance = {start: 0}
    previous = {start: None}
    while queue:
        vertex = queue.popleft()
        if vertex == target: break
        for neighbor in graph[vertex]:
            if neighbor not in distance:
                distance[neighbor] = distance[vertex] + 1
                previous[neighbor] = vertex
                queue.append(neighbor)
    if target not in distance: return None
    path, current = [], target
    while current is not None:
        path.append(current); current = previous[current]
    return distance[target], path[::-1]

graph = {"A": ["B", "C"], "B": ["D"], "C": ["D", "E"], "D": ["F"], "E": ["F"], "F": []}
print(shortest_path(graph, "A", "F"))`,
    firstTrace: "B and C receive distance one before D and E receive distance two. F first appears from D at distance three. Following predecessors backward reconstructs A-B-D-F.",
    secondTitle: "Start from every nearest-source candidate", secondIntro: "Enqueue all sources with distance zero. One shared BFS lets their waves compete and assigns each vertex its nearest-source distance.",
    secondCode: `def nearest_source_distances(graph, sources):
    queue = deque(sources)
    distance = {source: 0 for source in sources}
    while queue:
        vertex = queue.popleft()
        for neighbor in graph[vertex]:
            if neighbor not in distance:
                distance[neighbor] = distance[vertex] + 1
                queue.append(neighbor)
    return distance

undirected = {0: [1], 1: [0, 2, 3], 2: [1, 4], 3: [1, 4], 4: [2, 3, 5], 5: [4]}
print(nearest_source_distances(undirected, [0, 5]))`,
    secondTrace: "Zero and five begin at distance zero. Their waves expand in the same queue. Every vertex keeps the distance from whichever source reaches it first.",
    mistake: "Do not use ordinary BFS for unequal edge costs. A later route with more edges may cost less. Weighted shortest paths need algorithms such as Dijkstra or Bellman-Ford.",
    checkpoint: "Why is the first BFS discovery of a vertex shortest in edge count?",
    checkpointAnswer: "FIFO processing completes every smaller-distance layer first. Any undiscovered route would have to come from the same or a later layer and cannot use fewer edges.",
    remember: "A queue preserves distance layers, discovery fixes shortest unweighted distance, predecessors rebuild a path, and multiple sources can share distance zero.",
    checks: [q("When does BFS guarantee a shortest path?", ["When every edge has equal cost", "For arbitrary negative weights", "Only on trees"], 0, "Then minimizing edges also minimizes cost.", ["Correct. Graph cycles are fine with visited state.", "Negative weights need different reasoning.", "General unweighted graphs work."]), q("What does multi-source BFS initialize?", ["All sources at distance zero", "One source at distance k", "Every vertex as unreachable forever"], 0, "Their waves compete in one traversal.", ["Correct. This finds nearest-source distances.", "There is no privileged source.", "Reachable vertices will be discovered."])],
  },
  {
    lessonId: "py.ac.m5_1.l4", atomId: "py.atom.algo.graph-dfs", conceptId: "py.algo.graph-dfs",
    title: "DFS follows one graph path before returning", requires: ["py.algo.graph-bfs"],
    vocabulary: [["depth-first search", "follow one neighbor chain before exploring alternatives"], ["visited set", "vertices already scheduled or processed"], ["recursive DFS", "use function calls as the unfinished-work stack"], ["iterative DFS", "store unfinished vertices in an explicit stack"], ["reachability", "whether some path connects a start to a target"]],
    opening: "Depth-first search dives through one route until it cannot continue, then returns to the nearest unfinished choice. A visited set turns cycles into finite work.",
    outcome: "You will implement recursive and iterative DFS, find a path, explain stack order, and compare DFS with BFS without claiming one is universally better.",
    why: "DFS powers components, cycle detection, topological sorting, backtracking, articulation analysis, and many exhaustive state searches.",
    mentalModel: "Walk a maze while leaving chalk at every entered room. Follow one corridor deeply. At a dead end, return to the last room with an unchecked corridor.",
    firstTitle: "Use recursion to answer reachability", firstIntro: "Mark before exploring neighbors. Each call asks whether its vertex or any reachable child path reaches the target.",
    firstCode: `def can_reach(graph, start, target):
    visited = set()
    def visit(vertex):
        if vertex == target: return True
        visited.add(vertex)
        for neighbor in graph[vertex]:
            if neighbor not in visited and visit(neighbor): return True
        return False
    return visit(start)

graph = {0: [1, 2], 1: [2], 2: [0, 3], 3: [3], 4: []}
print(can_reach(graph, 0, 3), can_reach(graph, 0, 4))`,
    firstTrace: "The zero-one-two cycle does not repeat because each entered vertex is marked. Three is reachable and returns true through the call chain. Four belongs to a separate region.",
    secondTitle: "Carry complete paths on an explicit stack", secondIntro: "This teaching version stores a path with each vertex. It is simple but can copy many lists; predecessor maps are cheaper for large graphs.",
    secondCode: `def any_path(graph, start, target):
    stack = [(start, [start])]
    visited = {start}
    while stack:
        vertex, path = stack.pop()
        if vertex == target: return path
        for neighbor in reversed(graph[vertex]):
            if neighbor not in visited:
                visited.add(neighbor)
                stack.append((neighbor, path + [neighbor]))
    return None

print(any_path(graph, 0, 3))`,
    secondTrace: "Reversing neighbors before pushing makes the first listed neighbor pop first. DFS returns a valid path, not necessarily the fewest-edge path. Time remains theta vertices plus edges.",
    mistake: "Do not mark only after popping when duplicate scheduling is expensive. Several parents may push the same vertex. Marking when pushed keeps one frontier entry per vertex.",
    checkpoint: "Why can recursive DFS overflow on a long chain even though its asymptotic space is valid?",
    checkpointAnswer: "Its call stack has one frame per active depth. Python enforces a finite recursion limit, so an explicit stack is safer for very deep graphs.",
    remember: "DFS uses a call stack or explicit stack, visited state prevents cycles, and traversal order finds a path but does not promise an unweighted shortest path.",
    checks: [q("What prevents DFS from looping around a cycle?", ["Visited state", "Sorted vertices", "A priority queue"], 0, "Entered vertices are not expanded again.", ["Correct. Work stays finite.", "Sorting changes order, not repetition.", "DFS uses a stack."]), q("Does DFS always find the fewest-edge path?", ["No", "Yes", "Only if recursive"], 0, "It commits deeply before exploring the whole current layer.", ["Correct. BFS provides that guarantee for unweighted edges.", "A shorter alternative may remain unexplored.", "Implementation style does not change the guarantee."])],
  },
  {
    lessonId: "py.ac.m5_1.l5", atomId: "py.atom.algo.graph-components", conceptId: "py.algo.graph-components",
    title: "One traversal labels one connected region", requires: ["py.algo.graph-dfs"],
    vocabulary: [["connected component", "a maximal group where every pair has an undirected path"], ["flood fill", "relabel every connected cell of one starting value"], ["component label", "an identifier assigned to all vertices in one region"], ["outer scan", "checking every possible starting vertex for an unvisited region"], ["maximal", "unable to add another connected vertex without leaving the property"]],
    opening: "A single DFS or BFS finds one reachable region. An outer scan starts a new traversal whenever it finds a vertex with no component label.",
    outcome: "You will count and label graph components, implement grid flood fill, and prove that each vertex or cell is processed once overall.",
    why: "Components model network groups, islands, account merging, image regions, clusters, and broken connectivity. Flood fill is the same graph idea on coordinates.",
    mentalModel: "Pour a different paint color onto each unpainted region. Paint spreads along edges but cannot cross gaps. Each new pour discovers one component.",
    firstTitle: "Assign one label per graph traversal", firstIntro: "The outer loop sees every vertex. A stack labels the entire region before the loop can start another component.",
    firstCode: `def component_labels(graph):
    labels = {}
    component = 0
    for start in graph:
        if start in labels: continue
        labels[start] = component
        stack = [start]
        while stack:
            vertex = stack.pop()
            for neighbor in graph[vertex]:
                if neighbor not in labels:
                    labels[neighbor] = component
                    stack.append(neighbor)
        component += 1
    return labels, component

graph = {0: [1], 1: [0, 2], 2: [1], 3: [4], 4: [3], 5: []}
print(component_labels(graph))`,
    firstTrace: "Traversal from zero labels zero, one, and two. Start three creates a second label for three and four. Isolated vertex five forms a valid third component by itself.",
    secondTitle: "Flood only the starting color", secondIntro: "Changing a cell when it enters the stack doubles as visited state. Neighbors with another original color form a boundary.",
    secondCode: `def flood_fill(image, start_row, start_column, new_color):
    old_color = image[start_row][start_column]
    if old_color == new_color: return image
    image[start_row][start_column] = new_color
    stack = [(start_row, start_column)]
    directions = [(-1, 0), (1, 0), (0, -1), (0, 1)]
    while stack:
        row, column = stack.pop()
        for row_change, column_change in directions:
            next_row, next_column = row + row_change, column + column_change
            inside = 0 <= next_row < len(image) and 0 <= next_column < len(image[0])
            if inside and image[next_row][next_column] == old_color:
                image[next_row][next_column] = new_color
                stack.append((next_row, next_column))
    return image

picture = [[1, 1, 0], [1, 0, 0], [1, 1, 0]]
print(flood_fill(picture, 0, 0, 2))`,
    secondTrace: "Only four-directionally connected ones change to two. Zeros remain boundaries. The early equal-color return prevents endlessly rediscovering cells without a visible state change.",
    mistake: "Do not restart a traversal from already labeled vertices. Although the outer scan is theta vertices, each adjacency entry is processed only during its component traversal.",
    checkpoint: "Why is counting all components still theta V plus E instead of component-count times V plus E?",
    checkpointAnswer: "Visited labels prevent overlap. Every vertex joins exactly one traversal, and every adjacency entry is scanned only when its owning vertex is processed.",
    remember: "Traverse from each unvisited start, label its entire reachable region, and reuse the same pattern for grid flood fill.",
    checks: [q("Can an isolated vertex be a connected component?", ["Yes", "No", "Only in directed graphs"], 0, "It is a maximal reachable group containing itself.", ["Correct. Its component size is one.", "No other vertex is required.", "Undirected graphs allow isolated components."]), q("Why return early when flood-fill colors match?", ["Recoloring cannot mark progress", "The grid is already empty", "Diagonals become required"], 0, "The color change normally acts as visited state.", ["Correct. Equal color would leave cells rediscoverable.", "The grid may contain many cells.", "Movement rules are unchanged."])],
  },
  {
    lessonId: "py.ac.m5_1.l6", atomId: "py.atom.algo.graph-cycles", conceptId: "py.algo.graph-cycles",
    title: "Cycle detection depends on edge direction", requires: ["py.algo.graph-components"],
    vocabulary: [["cycle", "a path that returns to its starting vertex without reusing an edge"], ["recursion stack", "vertices on the current unfinished directed DFS path"], ["three-color state", "unvisited, active, or fully finished"], ["parent edge", "the undirected edge used to enter the current vertex"], ["back edge", "an edge reaching an active ancestor"]],
    opening: "A visited neighbor means different things in directed and undirected graphs. Correct cycle detection must preserve the context that explains how the neighbor was reached.",
    outcome: "You will detect directed cycles with active-path colors, detect undirected cycles by ignoring the parent edge, and explain why the methods differ.",
    why: "Cycle detection protects dependency systems, build pipelines, schedulers, network models, and graph algorithms whose correctness assumes acyclic structure.",
    mentalModel: "In a directed maze, seeing someone still on your current rope means you looped backward. In an undirected maze, the door you just entered through is expected, not a cycle.",
    firstTitle: "Find a directed edge into the active path", firstIntro: "Gray means the vertex is being explored. Black means every path leaving it has finished safely.",
    firstCode: `def has_directed_cycle(graph):
    color = {vertex: 0 for vertex in graph}
    def visit(vertex):
        color[vertex] = 1
        for neighbor in graph[vertex]:
            if color[neighbor] == 1: return True
            if color[neighbor] == 0 and visit(neighbor): return True
        color[vertex] = 2
        return False
    return any(color[vertex] == 0 and visit(vertex) for vertex in graph)

acyclic = {0: [1, 2], 1: [3], 2: [3], 3: []}
cyclic = {0: [1], 1: [2], 2: [0]}
print(has_directed_cycle(acyclic), has_directed_cycle(cyclic))`,
    firstTrace: "The diamond graph reaches finished vertex three from a second route, which is safe. In the second graph, two points to active vertex zero, exposing a directed cycle.",
    secondTitle: "Ignore only the undirected parent edge", secondIntro: "Every undirected edge appears in both neighbor lists. Reaching any visited neighbor other than the parent proves an alternate route closed a cycle.",
    secondCode: `def has_undirected_cycle(graph):
    visited = set()
    def visit(vertex, parent):
        visited.add(vertex)
        for neighbor in graph[vertex]:
            if neighbor not in visited:
                if visit(neighbor, vertex): return True
            elif neighbor != parent:
                return True
        return False
    for vertex in graph:
        if vertex not in visited and visit(vertex, None): return True
    return False

tree = {0: [1, 2], 1: [0], 2: [0]}
triangle = {0: [1, 2], 1: [0, 2], 2: [0, 1]}
print(has_undirected_cycle(tree), has_undirected_cycle(triangle))`,
    secondTrace: "The tree's visited parent edges are ignored. In the triangle, one reaches two and sees zero already visited through a different edge, proving a closed route.",
    mistake: "Do not use a plain visited set for directed cycles. An edge to a fully finished vertex is safe; only an edge into the current active path proves a directed loop.",
    checkpoint: "Why is an undirected edge back to the parent not evidence of a cycle?",
    checkpointAnswer: "The adjacency representation stores the same physical edge in both directions. Returning across the entry edge does not create a second route or a closed loop.",
    remember: "Directed graphs track active versus finished vertices. Undirected graphs track the parent and treat any other visited neighbor as a cycle.",
    checks: [q("What directed neighbor state proves a cycle?", ["Active on the current path", "Fully finished", "Unvisited"], 0, "The edge returns to an unfinished ancestor.", ["Correct. That is a back edge.", "A finished route is safe.", "An unvisited neighbor starts new exploration."]), q("What must undirected DFS ignore?", ["The edge back to its parent", "Every visited neighbor", "All leaf vertices"], 0, "That reverse adjacency entry is expected.", ["Correct. Other visited neighbors expose cycles.", "That would miss real cycles.", "Leaves are valid graph vertices."])],
  },
  {
    lessonId: "py.ac.m5_1.l7", atomId: "py.atom.algo.graph-bipartite", conceptId: "py.algo.graph-bipartite",
    title: "A bipartite graph can be split into two opposing groups", requires: ["py.algo.graph-cycles"],
    vocabulary: [["bipartite", "vertices can be colored with two colors so every edge crosses colors"], ["two-coloring", "assign one of two opposing labels to every vertex"], ["color conflict", "an edge whose endpoints received the same color"], ["odd cycle", "a cycle containing an odd number of edges"], ["disconnected graph", "a graph containing more than one separate component"]],
    opening: "Some graphs can be divided into two groups so every relationship crosses between groups. BFS or DFS can test this by forcing each neighbor to the opposite color.",
    outcome: "You will two-color every component, detect a conflict, connect conflicts to odd cycles, and return the actual two groups when coloring succeeds.",
    why: "Bipartite structure models matching, assignment, alternating constraints, scheduling conflicts, and whether pairwise opposition rules can all hold simultaneously.",
    mentalModel: "Seat connected people on opposite sides of a table. Each edge forces a side. An odd loop eventually demands that one person sit on both sides.",
    firstTitle: "Color every disconnected component", firstIntro: "Start an uncolored vertex with color zero. Every edge forces the other endpoint to one minus the current color.",
    firstCode: `from collections import deque

def bipartite_colors(graph):
    color = {}
    for start in graph:
        if start in color: continue
        color[start] = 0
        queue = deque([start])
        while queue:
            vertex = queue.popleft()
            for neighbor in graph[vertex]:
                if neighbor not in color:
                    color[neighbor] = 1 - color[vertex]
                    queue.append(neighbor)
                elif color[neighbor] == color[vertex]:
                    return None
    return color

square = {0: [1, 3], 1: [0, 2], 2: [1, 3], 3: [0, 2], 4: []}
print(bipartite_colors(square))`,
    firstTrace: "The square alternates zero-one-zero-one and isolated vertex four starts its own component. Every edge crosses colors, so the assignment succeeds.",
    secondTitle: "Turn a successful coloring into groups", secondIntro: "A triangle has an odd number of flips. Its final edge connects two vertices forced to the same color.",
    secondCode: `def bipartition(graph):
    color = bipartite_colors(graph)
    if color is None: return None
    groups = ([], [])
    for vertex, side in color.items(): groups[side].append(vertex)
    return groups

triangle = {0: [1, 2], 1: [0, 2], 2: [0, 1]}
line = {0: [1], 1: [0, 2], 2: [1, 3], 3: [2]}
print(bipartition(triangle))
print(bipartition(line))`,
    secondTrace: "The triangle forces zero opposite one, one opposite two, and then two opposite zero, an impossible odd flip. The four-vertex line separates cleanly into alternating groups.",
    mistake: "Do not test only the component containing vertex zero. A disconnected graph is bipartite only when every component can be two-colored without conflict.",
    checkpoint: "Why does every odd cycle make two-coloring impossible?",
    checkpointAnswer: "Each edge flips color. After an odd number of flips, returning to the start demands the opposite of its original color, creating a conflict.",
    remember: "Color neighbors oppositely across every component. A same-color edge is a contradiction, and that contradiction corresponds to an odd cycle.",
    checks: [q("Which cycle length prevents bipartiteness?", ["Odd", "Every even length", "Only length two"], 0, "Odd flips return with the wrong color.", ["Correct. Even cycles alternate consistently.", "Even cycles can be bipartite.", "A normal undirected edge is not an odd cycle."]), q("Why scan all start vertices?", ["The graph may be disconnected", "BFS cannot use a queue twice", "Colors expire"], 0, "An unseen component may contain its own conflict.", ["Correct. Every component must pass.", "A new queue can start per component.", "Assignments remain valid."])],
  },
];

export const ALGO_GRAPH_FOUNDATION_ATOMS = SPECS.map(guidedMasteryAtom);
export const ALGO_GRAPH_FOUNDATION_CONCEPTS = SPECS.map(guidedMasteryConcept);
export const ALGO_GRAPH_FOUNDATION_LESSON_CONTENT = guidedLessonContent(SPECS);

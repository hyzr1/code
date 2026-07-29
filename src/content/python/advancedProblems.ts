import type { CareerTrack, Problem, TestSpec } from "../../types";

interface AdvancedSpec {
  id: string;
  title: string;
  pattern: string;
  teaches: string[];
  prompt: string;
  fn: string;
  starter: string;
  solution: string;
  tests: TestSpec[];
  minutes: number;
  difficulty: [number, number, number];
  tracks: CareerTrack[];
  skills: string[];
  hints: [string, string, string];
  walkthrough: string[];
  cost: [string, string];
}

const test = (name: string, code: string, hidden = false): TestSpec => ({ name, code, hidden });

function make(spec: AdvancedSpec): Problem {
  return {
    id: `py.interview.${spec.id}`,
    kind: "problem",
    tier: spec.difficulty[0] >= 5 ? "challenge" : "problem",
    title: spec.title,
    pattern: spec.pattern,
    teaches: spec.teaches,
    requires: ["py.method", "py.complexity"],
    difficulty: {
      concept: spec.difficulty[0],
      implementation: spec.difficulty[1],
      recall: spec.difficulty[2],
    },
    estimatedMinutes: spec.minutes,
    prompt: spec.prompt,
    exportName: spec.fn,
    scaffolds: {
      L1: `${spec.starter}\n\n# Name the brute force, its repeated work, and the invariant first.`,
      L2: spec.starter,
      L3: spec.starter,
      L4: "",
    },
    tests: spec.tests,
    hints: spec.hints.map((text, rung) => ({ rung: rung as 0 | 1 | 2, text })),
    walkthrough: spec.walkthrough,
    solution: spec.solution,
    language: "python",
    tracks: spec.tracks,
    skills: spec.skills,
    analysis: {
      approach: spec.hints[1],
      invariant: spec.hints[2],
      time: spec.cost[0],
      space: spec.cost[1],
    },
  };
}

const ALL_TECH: CareerTrack[] = ["faang", "swe", "ml", "quant"];
const INTERVIEW: CareerTrack[] = ["faang", "swe", "quant"];

export const PYTHON_ADVANCED_PROBLEMS: Problem[] = [
  make({
    id: "target-subarrays", title: "Count target-sum subarrays", pattern: "Prefix sum + hash map", teaches: ["py.hashing", "py.method"],
    prompt: "Given integers `values` and `target`, count contiguous nonempty slices whose sum is exactly `target`. Values may be negative, so a window that only moves forward is not valid. Aim for O(n) expected time.",
    fn: "count_target_subarrays", starter: `def count_target_subarrays(values, target):\n    pass`,
    solution: `def count_target_subarrays(values, target):\n    frequencies = {0: 1}\n    prefix = 0\n    total = 0\n    for value in values:\n        prefix += value\n        total += frequencies.get(prefix - target, 0)\n        frequencies[prefix] = frequencies.get(prefix, 0) + 1\n    return total`,
    tests: [test("ordinary", "assert fn([1, 1, 1], 2) == 2"), test("negatives", "assert fn([1, -1, 0], 0) == 3"), test("empty", "assert fn([], 0) == 0"), test("zero prefix", "assert fn([3], 3) == 1", true)],
    minutes: 24, difficulty: [4, 3, 4], tracks: ALL_TECH, skills: ["hashing", "arrays", "statistics"], cost: ["O(n)", "O(n)"],
    hints: ["Write the equation between two prefix sums.", "Store how often each earlier prefix has occurred, not merely whether it occurred.", "At current prefix P, every earlier prefix P-target creates one valid ending here."],
    walkthrough: ["Why do negative values break a monotonic sliding window?", "What does frequencies[x] mean before each update?", "Why must prefix zero be present once before the loop?"],
  }),
  make({
    id: "product-except-self", title: "Products without division", pattern: "Prefix / suffix", teaches: ["py.lists", "py.method"],
    prompt: "Return a list where position `i` contains the product of every input value except `values[i]`. Do not divide. Use O(n) time and O(1) extra working space beyond the returned list.",
    fn: "products_except_self", starter: `def products_except_self(values):\n    pass`,
    solution: `def products_except_self(values):\n    result = [1] * len(values)\n    prefix = 1\n    for index, value in enumerate(values):\n        result[index] = prefix\n        prefix *= value\n    suffix = 1\n    for index in range(len(values) - 1, -1, -1):\n        result[index] *= suffix\n        suffix *= values[index]\n    return result`,
    tests: [test("ordinary", "assert fn([1, 2, 3, 4]) == [24, 12, 8, 6]"), test("zero", "assert fn([1, 0, 3]) == [0, 3, 0]"), test("two zeros", "assert fn([0, 2, 0]) == [0, 0, 0]"), test("two", "assert fn([-2, 5]) == [5, -2]", true)],
    minutes: 22, difficulty: [3, 3, 3], tracks: ALL_TECH, skills: ["arrays"], cost: ["O(n)", "O(1) beyond the returned list"],
    hints: ["For each index, separate everything before it from everything after it.", "Store prefix products directly in the output, then sweep backward with one suffix variable.", "Before the backward update, suffix is the product strictly to the right."],
    walkthrough: ["What does result[i] contain after the first pass?", "Why do zeros need no special branch?", "Which memory is excluded from the O(1) working-space claim?"],
  }),
  make({
    id: "zero-triplets", title: "Unique zero-sum triplets", pattern: "Sort + two pointers", teaches: ["py.two-pointers", "py.sets"],
    prompt: "Return every unique value triplet whose sum is zero. Triplet order and result order do not matter. Avoid a cubic search and avoid duplicate triplets.",
    fn: "zero_triplets", starter: `def zero_triplets(values):\n    pass`,
    solution: `def zero_triplets(values):\n    numbers = sorted(values)\n    result = []\n    for index in range(len(numbers) - 2):\n        if index and numbers[index] == numbers[index - 1]:\n            continue\n        left, right = index + 1, len(numbers) - 1\n        while left < right:\n            total = numbers[index] + numbers[left] + numbers[right]\n            if total < 0:\n                left += 1\n            elif total > 0:\n                right -= 1\n            else:\n                result.append([numbers[index], numbers[left], numbers[right]])\n                left += 1\n                right -= 1\n                while left < right and numbers[left] == numbers[left - 1]:\n                    left += 1\n    return result`,
    tests: [test("classic", "assert {tuple(x) for x in fn([-1,0,1,2,-1,-4])} == {(-1,-1,2),(-1,0,1)}"), test("duplicates", "assert fn([0,0,0,0]) == [[0,0,0]]"), test("none", "assert fn([1,2,-2,-1]) == []")],
    minutes: 28, difficulty: [4, 4, 4], tracks: INTERVIEW, skills: ["arrays"], cost: ["O(n²)", "O(n) for the sorted copy"],
    hints: ["Sort so pointer movement can discard candidates.", "Fix one value, then solve a two-sum problem in the suffix.", "Skip repeated fixed values and repeated left values after recording a result."],
    walkthrough: ["What pair target remains after fixing one value?", "Which duplicates must be skipped?", "Why does sorting make each pointer move safe?"],
  }),
  make({
    id: "minimum-cover", title: "Smallest covering window", pattern: "Variable sliding window", teaches: ["py.sliding-window", "py.dicts"],
    prompt: "Return the shortest substring of `text` containing every character of `required` with at least the required multiplicity. Return an empty string when impossible.",
    fn: "minimum_cover", starter: `def minimum_cover(text, required):\n    pass`,
    solution: `from collections import Counter\n\ndef minimum_cover(text, required):\n    if not required:\n        return ""\n    need = Counter(required)\n    missing = len(required)\n    left = 0\n    best_start, best_length = 0, float("inf")\n    for right, char in enumerate(text):\n        if need[char] > 0:\n            missing -= 1\n        need[char] -= 1\n        while missing == 0:\n            length = right - left + 1\n            if length < best_length:\n                best_start, best_length = left, length\n            outgoing = text[left]\n            need[outgoing] += 1\n            if need[outgoing] > 0:\n                missing += 1\n            left += 1\n    return "" if best_length == float("inf") else text[best_start:best_start + best_length]`,
    tests: [test("cover", `assert fn("ADOBECODEBANC", "ABC") == "BANC"`), test("multiplicity", `assert fn("aaab", "aab") == "aab"`), test("impossible", `assert fn("a", "aa") == ""`), test("empty need", `assert fn("abc", "") == ""`, true)],
    minutes: 35, difficulty: [5, 5, 5], tracks: INTERVIEW, skills: ["hashing", "arrays"], cost: ["O(n + m)", "O(distinct required characters)"],
    hints: ["Track missing required character instances, not only distinct characters.", "Expand right until valid; then shrink left while validity remains.", "Allow negative need counts: they represent surplus copies inside the window."],
    walkthrough: ["What exactly does missing count?", "Why can need[char] become negative?", "Which event makes the window invalid during shrinking?"],
  }),
  make({
    id: "trapped-water", title: "Water between elevation bars", pattern: "Two pointers", teaches: ["py.two-pointers"],
    prompt: "Each nonnegative height is a unit-width bar. Return the total water retained after rain. Use O(n) time and O(1) additional space.",
    fn: "trapped_water", starter: `def trapped_water(heights):\n    pass`,
    solution: `def trapped_water(heights):\n    left, right = 0, len(heights) - 1\n    left_max = right_max = 0\n    water = 0\n    while left < right:\n        if heights[left] <= heights[right]:\n            left_max = max(left_max, heights[left])\n            water += left_max - heights[left]\n            left += 1\n        else:\n            right_max = max(right_max, heights[right])\n            water += right_max - heights[right]\n            right -= 1\n    return water`,
    tests: [test("basin", "assert fn([0,1,0,2,1,0,1,3,2,1,2,1]) == 6"), test("wide", "assert fn([4,2,0,3,2,5]) == 9"), test("none", "assert fn([1,2,3]) == 0"), test("empty", "assert fn([]) == 0", true)],
    minutes: 32, difficulty: [5, 4, 5], tracks: INTERVIEW, skills: ["arrays"], cost: ["O(n)", "O(1)"],
    hints: ["Water at a position is limited by the smaller boundary maximum.", "Whichever current side is lower can be settled now.", "Maintain maximum height seen from each end; add max minus current height."],
    walkthrough: ["Why is the lower side safe to finalize?", "What invariant do left_max and right_max hold?", "Why is no per-index auxiliary array required?"],
  }),
  make({
    id: "histogram", title: "Largest rectangle in a histogram", pattern: "Monotonic stack", teaches: ["py.stack", "py.method"],
    prompt: "Given adjacent unit-width bar heights, return the largest axis-aligned rectangle area contained in the histogram. Aim for O(n) time.",
    fn: "largest_histogram_rectangle", starter: `def largest_histogram_rectangle(heights):\n    pass`,
    solution: `def largest_histogram_rectangle(heights):\n    stack = []\n    best = 0\n    for index, height in enumerate(heights + [0]):\n        start = index\n        while stack and stack[-1][1] > height:\n            left, previous = stack.pop()\n            best = max(best, previous * (index - left))\n            start = left\n        stack.append((start, height))\n    return best`,
    tests: [test("ordinary", "assert fn([2,1,5,6,2,3]) == 10"), test("two", "assert fn([2,4]) == 4"), test("flat", "assert fn([3,3,3]) == 9"), test("empty", "assert fn([]) == 0")],
    minutes: 38, difficulty: [5, 5, 5], tracks: INTERVIEW, skills: ["arrays", "data-structures"], cost: ["O(n)", "O(n)"],
    hints: ["A bar's maximal rectangle becomes knowable when a shorter bar arrives.", "Keep increasing heights paired with the earliest index they may extend from.", "Append a zero sentinel to force every remaining bar to resolve."],
    walkthrough: ["What unresolved promise does one stack entry represent?", "Why does a popped bar inherit no future width?", "Why does start move left after each pop?"],
  }),
  make({
    id: "course-dependencies", title: "Can every dependency be completed?", pattern: "Topological sort", teaches: ["py.graphs", "py.method"],
    prompt: "There are `count` tasks numbered from zero. Each pair `[task, prerequisite]` is a directed dependency. Return whether all tasks can be completed.",
    fn: "can_complete", starter: `def can_complete(count, dependencies):\n    pass`,
    solution: `from collections import deque\n\ndef can_complete(count, dependencies):\n    graph = [[] for _ in range(count)]\n    indegree = [0] * count\n    for task, prerequisite in dependencies:\n        graph[prerequisite].append(task)\n        indegree[task] += 1\n    queue = deque(i for i, degree in enumerate(indegree) if degree == 0)\n    completed = 0\n    while queue:\n        node = queue.popleft()\n        completed += 1\n        for neighbor in graph[node]:\n            indegree[neighbor] -= 1\n            if indegree[neighbor] == 0:\n                queue.append(neighbor)\n    return completed == count`,
    tests: [test("possible", "assert fn(2, [[1,0]]) is True"), test("cycle", "assert fn(2, [[1,0],[0,1]]) is False"), test("disconnected", "assert fn(4, [[1,0],[3,2]]) is True"), test("none", "assert fn(0, []) is True", true)],
    minutes: 28, difficulty: [4, 4, 4], tracks: ALL_TECH, skills: ["graphs", "data-structures"], cost: ["O(V + E)", "O(V + E)"],
    hints: ["A task with zero remaining prerequisites is ready.", "Track outgoing dependents and an indegree for every task.", "If the ready queue empties before all tasks complete, the remaining subgraph contains a cycle."],
    walkthrough: ["Which direction should each edge point?", "What does indegree mean during the loop?", "How does processed count detect a cycle?"],
  }),
  make({
    id: "islands", title: "Count connected land regions", pattern: "Grid DFS / BFS", teaches: ["py.graphs", "py.recursion"],
    prompt: "A rectangular grid contains `1` for land and `0` for water. Cells connect vertically and horizontally. Return the number of connected land regions without modifying the input.",
    fn: "island_count", starter: `def island_count(grid):\n    pass`,
    solution: `def island_count(grid):\n    if not grid:\n        return 0\n    rows, cols = len(grid), len(grid[0])\n    visited = set()\n    def visit(row, col):\n        if row < 0 or row >= rows or col < 0 or col >= cols:\n            return\n        if grid[row][col] != 1 or (row, col) in visited:\n            return\n        visited.add((row, col))\n        visit(row + 1, col); visit(row - 1, col)\n        visit(row, col + 1); visit(row, col - 1)\n    total = 0\n    for row in range(rows):\n        for col in range(cols):\n            if grid[row][col] == 1 and (row, col) not in visited:\n                total += 1\n                visit(row, col)\n    return total`,
    tests: [test("three", "assert fn([[1,1,0],[0,1,0],[1,0,1]]) == 3"), test("one", "assert fn([[1,1],[1,1]]) == 1"), test("water", "assert fn([[0,0]]) == 0"), test("empty", "assert fn([]) == 0", true)],
    minutes: 24, difficulty: [3, 3, 3], tracks: ALL_TECH, skills: ["graphs", "arrays"], cost: ["O(rows × columns)", "O(rows × columns)"],
    hints: ["Each unvisited land cell begins exactly one new component.", "Flood-fill that component and mark every reached coordinate.", "The outer scan counts starts; the traversal prevents recounting."],
    walkthrough: ["When should the component counter increase?", "What belongs in visited?", "What are the four boundary checks?"],
  }),
  make({
    id: "signal-delay", title: "Slowest shortest signal", pattern: "Dijkstra", teaches: ["py.graphs", "py.heap"],
    prompt: "Directed edges `[source, destination, time]` carry a signal between nodes `1..count`. Starting at `start`, return the time until every node receives the signal, or `-1` when some node is unreachable. Edge times are nonnegative.",
    fn: "signal_delay", starter: `def signal_delay(edges, count, start):\n    pass`,
    solution: `import heapq\n\ndef signal_delay(edges, count, start):\n    graph = [[] for _ in range(count + 1)]\n    for source, destination, time in edges:\n        graph[source].append((time, destination))\n    heap = [(0, start)]\n    settled = {}\n    while heap:\n        time, node = heapq.heappop(heap)\n        if node in settled:\n            continue\n        settled[node] = time\n        for cost, neighbor in graph[node]:\n            if neighbor not in settled:\n                heapq.heappush(heap, (time + cost, neighbor))\n    return max(settled.values()) if len(settled) == count else -1`,
    tests: [test("ordinary", "assert fn([[2,1,1],[2,3,1],[3,4,1]], 4, 2) == 2"), test("unreachable", "assert fn([[1,2,1]], 2, 2) == -1"), test("choose short", "assert fn([[1,2,5],[1,3,1],[3,2,1]], 3, 1) == 2")],
    minutes: 34, difficulty: [5, 4, 5], tracks: ALL_TECH, skills: ["graphs", "data-structures", "optimization"], cost: ["O((V + E) log E)", "O(V + E)"],
    hints: ["The next finalized node must have the smallest known arrival time.", "Use a min-heap of candidate distances; ignore entries for already-settled nodes.", "The answer is the largest finalized shortest distance only if all nodes were finalized."],
    walkthrough: ["Why are nonnegative edge weights required?", "When does a popped distance become final?", "Why can stale heap entries be ignored rather than updated in place?"],
  }),
  make({
    id: "redundant-edge", title: "Find the edge that creates a cycle", pattern: "Union find", teaches: ["py.graphs", "py.sets"],
    prompt: "An undirected graph begins as a tree, then receives one additional edge. Return the first input edge whose addition connects vertices already in the same component.",
    fn: "redundant_edge", starter: `def redundant_edge(edges):\n    pass`,
    solution: `def redundant_edge(edges):\n    parent = {}\n    size = {}\n    def find(node):\n        parent.setdefault(node, node)\n        size.setdefault(node, 1)\n        while node != parent[node]:\n            parent[node] = parent[parent[node]]\n            node = parent[node]\n        return node\n    for left, right in edges:\n        a, b = find(left), find(right)\n        if a == b:\n            return [left, right]\n        if size[a] < size[b]:\n            a, b = b, a\n        parent[b] = a\n        size[a] += size[b]\n    return None`,
    tests: [test("triangle", "assert fn([[1,2],[1,3],[2,3]]) == [2,3]"), test("later", "assert fn([[1,2],[2,3],[3,4],[1,4],[1,5]]) == [1,4]"), test("none", "assert fn([[1,2]]) is None", true)],
    minutes: 30, difficulty: [5, 4, 5], tracks: INTERVIEW, skills: ["graphs", "data-structures"], cost: ["O(E α(V)) amortized", "O(V)"],
    hints: ["You only need to know whether two vertices already share a component.", "Represent each component by a root; compress paths during find.", "Union smaller into larger so trees remain shallow."],
    walkthrough: ["What does find return?", "Why does equal root imply this edge closes a cycle?", "How do path compression and union by size affect complexity?"],
  }),
  make({
    id: "trie", title: "Prefix dictionary", pattern: "Trie", teaches: ["py.classes", "py.dicts"],
    prompt: "Define class `PrefixDictionary` with `insert(word)`, `contains(word)`, and `has_prefix(prefix)`. Words contain ordinary Python string characters.",
    fn: "PrefixDictionary", starter: `class PrefixDictionary:\n    pass`,
    solution: `class PrefixDictionary:\n    def __init__(self):\n        self.root = {}\n\n    def insert(self, word):\n        node = self.root\n        for char in word:\n            node = node.setdefault(char, {})\n        node[None] = True\n\n    def _walk(self, text):\n        node = self.root\n        for char in text:\n            if char not in node:\n                return None\n            node = node[char]\n        return node\n\n    def contains(self, word):\n        node = self._walk(word)\n        return node is not None and None in node\n\n    def has_prefix(self, prefix):\n        return self._walk(prefix) is not None`,
    tests: [test("word and prefix", "trie=fn(); trie.insert('apple'); assert trie.contains('apple') and trie.has_prefix('app')"), test("prefix not word", "trie=fn(); trie.insert('apple'); assert not trie.contains('app')"), test("multiple", "trie=fn(); trie.insert('car'); trie.insert('cat'); assert trie.contains('car') and trie.contains('cat') and not trie.contains('cap')"), test("empty", "trie=fn(); assert trie.has_prefix('')", true)],
    minutes: 30, difficulty: [4, 4, 4], tracks: ["faang", "swe", "ml"], skills: ["data-structures", "strings"], cost: ["O(L) per operation", "O(total inserted characters)"],
    hints: ["Each node maps one next character to another node.", "A path existing is not enough to prove a complete word exists.", "Store a terminal marker at the node reached after the final character."],
    walkthrough: ["What does one node represent?", "How do prefix and complete-word queries differ?", "What are time and space costs in terms of word length?"],
  }),
  make({
    id: "lru", title: "Least-recently-used cache", pattern: "Hash map + ordering", teaches: ["py.classes", "py.dicts"],
    prompt: "Define `LRUCache(capacity)` with `get(key)` returning the value or `-1`, and `put(key, value)`. Both operations should be O(1) average. Inserting beyond capacity evicts the least recently read or written key.",
    fn: "LRUCache", starter: `class LRUCache:\n    pass`,
    solution: `from collections import OrderedDict\n\nclass LRUCache:\n    def __init__(self, capacity):\n        self.capacity = capacity\n        self.items = OrderedDict()\n\n    def get(self, key):\n        if key not in self.items:\n            return -1\n        self.items.move_to_end(key)\n        return self.items[key]\n\n    def put(self, key, value):\n        if key in self.items:\n            self.items.move_to_end(key)\n        self.items[key] = value\n        if len(self.items) > self.capacity:\n            self.items.popitem(last=False)`,
    tests: [test("eviction", "c=fn(2); c.put(1,1); c.put(2,2); assert c.get(1)==1; c.put(3,3); assert c.get(2)==-1"), test("update recent", "c=fn(2); c.put(1,1); c.put(2,2); c.put(1,9); c.put(3,3); assert c.get(1)==9 and c.get(2)==-1"), test("one", "c=fn(1); c.put('a',1); c.put('b',2); assert c.get('a')==-1 and c.get('b')==2", true)],
    minutes: 38, difficulty: [5, 5, 5], tracks: ["faang", "swe"], skills: ["data-structures", "systems"], cost: ["O(1) average per operation", "O(capacity)"],
    hints: ["A hash map gives direct access but not recency order.", "Maintain keys from least to most recent and move a touched key to the end.", "A hand-built version pairs the map with a doubly linked list; Python's OrderedDict provides that protocol."],
    walkthrough: ["Which operation changes recency?", "Why is ordinary sorting too slow?", "What two structures appear in a language-independent implementation?"],
  }),
  make({
    id: "word-search", title: "Find a word through a board", pattern: "Backtracking", teaches: ["py.backtracking", "py.graphs"],
    prompt: "Return whether `word` can be formed by moving vertically or horizontally through a character grid without using a cell more than once in the same path.",
    fn: "word_exists", starter: `def word_exists(board, word):\n    pass`,
    solution: `def word_exists(board, word):\n    if not word:\n        return True\n    if not board:\n        return False\n    rows, cols = len(board), len(board[0])\n    def search(row, col, index):\n        if index == len(word):\n            return True\n        if row < 0 or row >= rows or col < 0 or col >= cols or board[row][col] != word[index]:\n            return False\n        char = board[row][col]\n        board[row][col] = None\n        found = (search(row+1,col,index+1) or search(row-1,col,index+1) or search(row,col+1,index+1) or search(row,col-1,index+1))\n        board[row][col] = char\n        return found\n    return any(search(row, col, 0) for row in range(rows) for col in range(cols))`,
    tests: [test("found", "b=[list('ABCE'),list('SFCS'),list('ADEE')]; assert fn(b,'ABCCED') is True"), test("no reuse", "b=[list('ABCE'),list('SFCS'),list('ADEE')]; assert fn(b,'ABCB') is False"), test("restores", "b=[list('AB')]; fn(b,'AB'); assert b==[list('AB')]", true), test("empty word", "assert fn([], '') is True")],
    minutes: 32, difficulty: [4, 4, 4], tracks: INTERVIEW, skills: ["graphs", "arrays"], cost: ["O(rows × columns × 4^word-length) worst case", "O(word-length) recursion"],
    hints: ["A recursive state is row, column, and next word index.", "Temporarily mark the current cell unavailable before exploring neighbors.", "Restore the cell on every return path so sibling searches see the original board."],
    walkthrough: ["What makes a partial path invalid?", "Why is visited local to one attempted path?", "Where must restoration occur?"],
  }),
  make({
    id: "n-queens", title: "Count nonattacking queen layouts", pattern: "Constraint backtracking", teaches: ["py.backtracking", "py.sets"],
    prompt: "Return the number of ways to place `n` queens on an `n × n` board so no two share a row, column, or diagonal.",
    fn: "n_queens_count", starter: `def n_queens_count(n):\n    pass`,
    solution: `def n_queens_count(n):\n    columns = set()\n    rising = set()\n    falling = set()\n    def search(row):\n        if row == n:\n            return 1\n        total = 0\n        for col in range(n):\n            if col in columns or row + col in rising or row - col in falling:\n                continue\n            columns.add(col); rising.add(row + col); falling.add(row - col)\n            total += search(row + 1)\n            columns.remove(col); rising.remove(row + col); falling.remove(row - col)\n        return total\n    return search(0)`,
    tests: [test("one", "assert fn(1) == 1"), test("four", "assert fn(4) == 2"), test("five", "assert fn(5) == 10"), test("none", "assert fn(2) == 0 and fn(3) == 0", true)],
    minutes: 38, difficulty: [5, 4, 5], tracks: ["faang", "quant"], skills: ["optimization", "graphs"], cost: ["O(n!) upper bound", "O(n) search state"],
    hints: ["Place exactly one queen per row, so row need not be stored.", "Cells share diagonals when row+col or row-col matches.", "Three sets make the validity check O(1); undo all three after recursion."],
    walkthrough: ["Why does one queen per recursive level remove row conflicts?", "How are both diagonal families identified?", "What is the branching factor before pruning?"],
  }),
  make({
    id: "coin-change", title: "Fewest coins for an amount", pattern: "Unbounded dynamic programming", teaches: ["py.dynamic-programming"],
    prompt: "Given positive denomination values and a nonnegative amount, return the fewest coins needed when each denomination may be reused. Return `-1` when impossible.",
    fn: "fewest_coins", starter: `def fewest_coins(coins, amount):\n    pass`,
    solution: `def fewest_coins(coins, amount):\n    dp = [amount + 1] * (amount + 1)\n    dp[0] = 0\n    for value in range(1, amount + 1):\n        for coin in coins:\n            if coin <= value:\n                dp[value] = min(dp[value], dp[value - coin] + 1)\n    return -1 if dp[amount] > amount else dp[amount]`,
    tests: [test("ordinary", "assert fn([1,2,5], 11) == 3"), test("impossible", "assert fn([2], 3) == -1"), test("zero", "assert fn([2], 0) == 0"), test("not greedy", "assert fn([1,3,4], 6) == 2", true)],
    minutes: 28, difficulty: [4, 3, 4], tracks: ALL_TECH, skills: ["dynamic-programming", "optimization"], cost: ["O(amount × denominations)", "O(amount)"],
    hints: ["Define dp[x] as the fewest coins for exactly x.", "The last coin leaves subproblem x-coin.", "Initialize unreachable states above any possible valid answer and set dp[0]=0."],
    walkthrough: ["Why can a greedy largest-coin choice fail?", "What is the recurrence?", "Why is amount+1 a safe sentinel?"],
  }),
  make({
    id: "lis", title: "Longest increasing subsequence", pattern: "Binary-search DP frontier", teaches: ["py.dynamic-programming", "py.binary-search"],
    prompt: "Return the length of the longest strictly increasing subsequence, not necessarily contiguous. Implement O(n log n) time.",
    fn: "lis_length", starter: `def lis_length(values):\n    pass`,
    solution: `from bisect import bisect_left\n\ndef lis_length(values):\n    tails = []\n    for value in values:\n        index = bisect_left(tails, value)\n        if index == len(tails):\n            tails.append(value)\n        else:\n            tails[index] = value\n    return len(tails)`,
    tests: [test("ordinary", "assert fn([10,9,2,5,3,7,101,18]) == 4"), test("duplicates", "assert fn([2,2,2]) == 1"), test("increasing", "assert fn([1,2,3,4]) == 4"), test("empty", "assert fn([]) == 0", true)],
    minutes: 38, difficulty: [5, 4, 5], tracks: ["faang", "quant", "ml"], skills: ["dynamic-programming", "optimization", "arrays"], cost: ["O(n log n)", "O(n)"],
    hints: ["For each possible subsequence length, retain the smallest achievable tail.", "Replace the first tail greater than or equal to the new value.", "Tails is not necessarily an actual subsequence; its length is the invariant that matters."],
    walkthrough: ["Why is a smaller tail always at least as useful?", "Why does bisect_left enforce strict increase?", "What exactly does tails[i] mean?"],
  }),
  make({
    id: "edit-distance", title: "Minimum text edits", pattern: "Two-dimensional DP", teaches: ["py.dynamic-programming", "py.strings"],
    prompt: "Return the minimum number of single-character insertions, deletions, or replacements needed to turn string `source` into `target`.",
    fn: "edit_distance", starter: `def edit_distance(source, target):\n    pass`,
    solution: `def edit_distance(source, target):\n    previous = list(range(len(target) + 1))\n    for i, left in enumerate(source, 1):\n        current = [i]\n        for j, right in enumerate(target, 1):\n            if left == right:\n                current.append(previous[j - 1])\n            else:\n                current.append(1 + min(previous[j], current[j - 1], previous[j - 1]))\n        previous = current\n    return previous[-1]`,
    tests: [test("replace delete", `assert fn("horse", "ros") == 3`), test("long", `assert fn("intention", "execution") == 5`), test("empty", `assert fn("", "abc") == 3`), test("same", `assert fn("same", "same") == 0`, true)],
    minutes: 38, difficulty: [5, 4, 5], tracks: ALL_TECH, skills: ["dynamic-programming", "strings", "ml"], cost: ["O(m × n)", "O(n)"],
    hints: ["State dp[i][j] for prefixes, not indices without meaning.", "A mismatch considers delete, insert, and replace from three neighboring states.", "Only the previous row and current row are needed for the next transition."],
    walkthrough: ["Which table neighbor represents each operation?", "Why does a matching final character cost nothing?", "How do empty-prefix base cases work?"],
  }),
  make({
    id: "median-two-sorted", title: "Median of two sorted arrays", pattern: "Binary-search partition", teaches: ["py.binary-search", "py.method"],
    prompt: "Return the median of two individually sorted numeric lists in O(log(min(m,n))) time. At least one list is nonempty.",
    fn: "median_sorted", starter: `def median_sorted(left, right):\n    pass`,
    solution: `def median_sorted(left, right):\n    if len(left) > len(right):\n        left, right = right, left\n    total = len(left) + len(right)\n    half = (total + 1) // 2\n    low, high = 0, len(left)\n    while low <= high:\n        cut_left = (low + high) // 2\n        cut_right = half - cut_left\n        a_left = float("-inf") if cut_left == 0 else left[cut_left - 1]\n        a_right = float("inf") if cut_left == len(left) else left[cut_left]\n        b_left = float("-inf") if cut_right == 0 else right[cut_right - 1]\n        b_right = float("inf") if cut_right == len(right) else right[cut_right]\n        if a_left <= b_right and b_left <= a_right:\n            if total % 2:\n                return max(a_left, b_left)\n            return (max(a_left, b_left) + min(a_right, b_right)) / 2\n        if a_left > b_right:\n            high = cut_left - 1\n        else:\n            low = cut_left + 1\n    raise ValueError("inputs must be sorted")`,
    tests: [test("odd", "assert fn([1,3], [2]) == 2"), test("even", "assert fn([1,2], [3,4]) == 2.5"), test("empty side", "assert fn([], [1]) == 1"), test("unbalanced", "assert fn([1,2], [3,4,5,6,7]) == 4", true)],
    minutes: 45, difficulty: [6, 5, 6], tracks: ["faang", "quant"], skills: ["arrays", "optimization"], cost: ["O(log min(m,n))", "O(1)"],
    hints: ["Partition both arrays so the combined left half has the required size.", "Search only the smaller array's cut position; the other cut is determined.", "A valid partition has both left maxima no greater than the opposite right minima."],
    walkthrough: ["Why must the search use the smaller array?", "How is the second partition determined?", "How do odd and even totals differ after a valid cut?"],
  }),
  make({
    id: "pattern-match", title: "Full pattern matching with dot and star", pattern: "String DP", teaches: ["py.dynamic-programming", "py.strings"],
    prompt: "Match an entire string against a pattern where dot matches one character and star means zero or more copies of the preceding pattern element. Return a Boolean; partial matches do not count.",
    fn: "pattern_matches", starter: `def pattern_matches(text, pattern):\n    pass`,
    solution: `from functools import lru_cache\n\ndef pattern_matches(text, pattern):\n    @lru_cache(None)\n    def match(i, j):\n        if j == len(pattern):\n            return i == len(text)\n        first = i < len(text) and pattern[j] in (text[i], ".")\n        if j + 1 < len(pattern) and pattern[j + 1] == "*":\n            return match(i, j + 2) or (first and match(i + 1, j))\n        return first and match(i + 1, j + 1)\n    return match(0, 0)`,
    tests: [test("zero copies", `assert fn("aa", "a*") is True`), test("dot star", `assert fn("ab", ".*") is True`), test("complex", `assert fn("aab", "c*a*b") is True`), test("false", `assert fn("mississippi", "mis*is*p*.") is False`, true)],
    minutes: 45, difficulty: [6, 5, 6], tracks: ["faang", "quant"], skills: ["dynamic-programming", "strings"], cost: ["O(m × n)", "O(m × n) memo"],
    hints: ["State is a pair of positions in text and pattern.", "For x*, branch between using zero copies and consuming one matching text character while staying on x*.", "Memoize position pairs so exponential branching becomes O(len(text)·len(pattern))."],
    walkthrough: ["What does match(i,j) promise?", "What are the two meanings of star?", "Why does the one-copy branch keep j unchanged?"],
  }),
  make({
    id: "burst-intervals", title: "Maximum score from bursting intervals", pattern: "Interval DP", teaches: ["py.dynamic-programming", "py.intervals"],
    prompt: "Positive values sit in a row. Removing index `i` earns left-neighbor × value × right-neighbor, treating missing outside neighbors as 1; then neighbors close together. Return the maximum possible total.",
    fn: "maximum_burst_score", starter: `def maximum_burst_score(values):\n    pass`,
    solution: `def maximum_burst_score(values):\n    numbers = [1] + [value for value in values if value > 0] + [1]\n    size = len(numbers)\n    dp = [[0] * size for _ in range(size)]\n    for width in range(2, size):\n        for left in range(size - width):\n            right = left + width\n            dp[left][right] = max((numbers[left] * numbers[last] * numbers[right] + dp[left][last] + dp[last][right] for last in range(left + 1, right)), default=0)\n    return dp[0][-1]`,
    tests: [test("ordinary", "assert fn([3,1,5,8]) == 167"), test("two", "assert fn([1,5]) == 10"), test("one", "assert fn([7]) == 7"), test("empty", "assert fn([]) == 0", true)],
    minutes: 50, difficulty: [6, 6, 6], tracks: ["faang", "quant"], skills: ["dynamic-programming", "optimization"], cost: ["O(n³)", "O(n²)"],
    hints: ["Choosing the first removal leaves unstable neighbors; choose the last removal inside an interval instead.", "If k is last between fixed boundaries left and right, its final gain is boundary-left × k × boundary-right.", "Combine optimal independent open intervals (left,k) and (k,right), growing by interval width."],
    walkthrough: ["Why is 'last removed' easier than 'first removed'?", "What does dp[left][right] exclude and include?", "Why do the two subintervals become independent?"],
  }),
];

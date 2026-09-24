# Algorithms Course — Boilerplate & Ordering

**Goal:** ace any coding interview at an elite level (FAANG, top quant, hard competitive-style rounds). Prerequisite: the Python course.

**Ordering principle:** every structure or technique appears only after everything it depends on. Analysis before structures; structures before the algorithms that use them; simple paradigms before the ones that compose them. Nothing forward-references. The core spine (Parts 1–10) is complete interview preparation; the **Grandmaster tier (Parts 11–12)** stacks the extremely advanced, competitive-style topics at the very end — none needed for a typical interview, all of it there for the person who wants to be untouchable.

**Scope note:** this is the *coding/algorithms* course. System design, concurrency/OS, SQL/databases, and object-oriented/low-level design are their **own separate course** and are deliberately excluded here.

**Status:** structure only — Parts → Modules → Lessons (title — one-line goal). No lesson content yet.

---

## Part 1 — Foundations: complexity & the method
*You cannot choose an algorithm without a language for cost and a procedure for deriving one.*

### Module 1.1 — Measuring work
How to put a number on an algorithm's cost so two solutions can be compared before either is written.
- Why efficiency matters — the same problem, seconds vs hours at scale.
- Counting operations — turn a loop nest into an operation count.
- Big-O, Big-Theta, Big-Omega — upper, tight, and lower bounds.
- Common growth classes — O(1), log n, n, n log n, n², 2ⁿ, n! and where each shows up.
- Dropping constants and lower terms — what asymptotic notation ignores and why.
- Space complexity — auxiliary vs total, the call stack as memory.
- Amortized analysis — why a dynamic array's append is O(1) on average.
- Best, worst, and average case — and which one interviews care about.

### Module 1.2 — Reasoning about recursion
The mental model for self-referential code and how to predict its cost.
- The call stack — how frames are pushed and popped.
- Recurrence relations — express a recursive cost as an equation.
- Recursion trees — visualize repeated subproblems and sum the work by level.
- Recursion vs iteration — converting between them, stack-overflow limits.
- Tail recursion — and why Python does not optimize it.

### Module 1.3 — The problem-solving method
A repeatable procedure that turns an unseen prompt into a justified algorithm.
- Reading constraints — infer the target complexity from n's size.
- Work the examples first — find the pattern by hand before coding.
- Brute force → bottleneck → better — the universal optimization loop.
- Naming the invariant — the property your loop must always preserve.
- Edge cases as a checklist — empty, single, duplicates, overflow, extremes.
- Verifying and dry-running — trace before you run.
- Communicating your approach — think aloud like an interviewer wants.

---

## Part 2 — Linear structures
*The everyday containers and the pointer techniques that make them fast.*

### Module 2.1 — Arrays & strings
The contiguous sequence and the O(1)/O(n) tricks that live on top of it.
- Arrays and dynamic arrays — indexing, growth, cost of insert/delete.
- In-place manipulation — reverse, rotate, partition without extra space.
- Cyclic placement — put bounded values into their own indices to expose missing or duplicate entries.
- Strings as immutable sequences — slicing, building, char codes.
- Prefix sums — range-sum queries in O(1) after O(n) setup.
- Difference arrays — range updates in O(1).
- 2-D prefix sums — submatrix sums.

### Module 2.2 — Hashing
Trading space for time so lookups, counting, and grouping become O(1).
- Hash maps and sets — O(1) average lookup, when it degrades.
- Frequency counting — the counter pattern.
- Grouping by key — bucket related items (anagrams, etc.).
- The read-with-default write-back shape — counting, grouping, indexing.
- Hashing tuples and composite keys — remembering pairs and states.
- Set operations — combine membership, deduplication, union, intersection, and difference deliberately.

### Module 2.3 — Two pointers & sliding window
Replacing an O(n²) scan of pairs or subarrays with a single linear sweep.
- Opposing pointers — converge from both ends on sorted data.
- Same-direction read/write pointers — compact, deduplicate, and partition in place.
- Fixed-size window — running aggregates over a span.
- Variable-size window — grow/shrink to maintain an invariant.
- Window with a hash map — longest/shortest substring problems.

### Module 2.4 — Stacks, queues & deques
Order-of-processing structures, and the monotonic variants that solve range problems.
- Stack — LIFO, matching, undo, expression evaluation.
- Queue and deque — FIFO, both-ends, ring buffers.
- Monotonic stack — next-greater/smaller in O(n).
- Monotonic deque — sliding-window maximum in O(n).
- Stack/queue conversions — implement one access order from two instances of the other.

### Module 2.5 — Linked lists
Pointer-based sequences and the in-place surgery interviews love to test.
- Singly and doubly linked lists — nodes, pointers, tradeoffs vs arrays.
- Traversal and dummy heads — remove head-edge-case branches from list surgery.
- Reversal — iterative and recursive.
- Fast/slow on lists — cycle detection (Floyd), find middle, kth-from-end.
- Merging and partitioning lists — rewire nodes without losing the unprocessed suffix.
- LRU cache — hash map + doubly linked list.

---

## Part 3 — Sorting & searching
*Order enables search; search underlies countless optimizations.*

### Module 3.1 — Sorting
How the standard sorts work, their tradeoffs, and when to sort at all.
- Comparison sorts — bubble/insertion/selection as baselines.
- Merge sort — divide and conquer, stability, external sort.
- Quick sort — partitioning, pivot choice, worst case.
- Non-comparison sorts — counting, radix, bucket.
- Selection with partitioning — find the kth item with quickselect in linear expected time.
- Sorting by keys and comparators — express ordering rules while preserving correctness and stability.
- Stability — when it matters.

### Module 3.2 — Binary search
Halving the search space — over arrays, and over the space of answers.
- Binary search on a sorted array — the exact template.
- Lower/upper bound — first/last position, insertion point.
- Binary search on the answer — monotonic-predicate search.
- Search in rotated and mountain arrays — identify which monotone region can still contain the target.

---

## Part 4 — Trees & heaps
*Hierarchical structure, ordered retrieval, and range queries.*

### Module 4.1 — Binary trees
Recursion made concrete: solve a tree by combining its subtrees' answers.
- Tree anatomy & representations — nodes, edges, height, depth.
- DFS traversals — preorder, inorder, postorder (recursive & iterative).
- BFS and level-order traversal — process a tree one depth at a time with a queue.
- Divide-and-conquer on trees — combine subtree answers.
- Path and depth problems — diameter, max path sum, balanced.
- Serialization and reconstruction — encode enough structure to rebuild the same tree unambiguously.

### Module 4.2 — Binary search trees
The ordering invariant that makes search, insert, and range queries logarithmic.
- BST invariant — ordered structure, search/insert/delete.
- Inorder = sorted — validation and kth smallest.
- Balanced BSTs — AVL and red-black at a conceptual level.
- Successors, predecessors, and ranges — exploit the BST invariant to skip irrelevant subtrees.

### Module 4.3 — Heaps & priority queues
Cheap access to the current extreme — the backbone of top-k and scheduling.
- The binary heap — array layout, sift up/down.
- Push, pop, heapify — costs and `heapq`.
- Heap sort — build a heap and repeatedly extract an extreme in O(n log n) time.
- Top-k and streaming — heap of size k.
- Two-heap patterns — running median.
- k-way merge — keep only the next candidate from each sorted source in a heap.

### Module 4.4 — Tries
Prefix structures for search, autocomplete, and bitwise queries.
- Trie (prefix tree) — insert/search/prefix.
- Trie applications — autocomplete, word search, XOR tries.

---

## Part 5 — Graphs
*The most general structure — most hard problems are graphs in disguise.*

### Module 5.1 — Graph foundations
Modeling relationships and the two traversals every graph algorithm builds on.
- Representations — adjacency list/matrix, edge list, implicit graphs.
- Grids as graphs — 4/8-directional movement.
- BFS — shortest path in unweighted graphs.
- DFS — reachability, paths, recursion vs stack.
- Connected components and flood fill — label every reachable region exactly once.
- Cycle detection — directed and undirected.
- Bipartite checking — two-color a graph and detect an odd-cycle contradiction.

### Module 5.2 — Ordering & connectivity
Sequencing dependencies and grouping what's connected.
- Topological sort — Kahn's and DFS-based.
- Union-Find (DSU) — union by rank, path compression.
- DSU applications — connectivity, Kruskal, cycle detection.
- Strongly connected components — Tarjan / Kosaraju.
- Bridges and articulation points — find single edges or vertices whose removal disconnects a graph.

### Module 5.3 — Shortest paths & spanning trees
Weighted-graph optimization — cheapest route and cheapest network.
- Dijkstra — non-negative weights with a heap.
- 0-1 BFS — deque for 0/1 weights.
- Bellman-Ford — negative edges, negative-cycle detection.
- Floyd-Warshall — all-pairs shortest paths.
- A* search — heuristics for faster pathfinding.
- Minimum spanning tree — Kruskal and Prim.

### Module 5.4 — Advanced graphs
The specialized graph algorithms that separate strong candidates from the rest.
- Max-flow / min-cut — Ford-Fulkerson, Edmonds-Karp, Dinic (intro).
- Bipartite matching — Hungarian / Hopcroft-Karp (intro).
- Eulerian and Hamiltonian paths — distinguish edge-covering from vertex-covering paths and their very different difficulty.
- 2-SAT — implication graphs.

---

## Part 6 — Algorithmic paradigms
*The reusable ways of thinking that generate solutions.*

### Module 6.1 — Recursion & backtracking
Systematically building and pruning the tree of all possibilities.
- Generating subsets — the include/exclude tree.
- Permutations and combinations — generate each arrangement or selection once without accidental duplicates.
- Backtracking template — choose, explore, un-choose.
- Constraint problems — N-queens, Sudoku, word search.
- Pruning — cut dead branches early.

### Module 6.2 — Greedy
Making the locally optimal choice — and proving when that's globally optimal.
- The greedy-choice property — determine when one locally optimal choice can belong to a global optimum.
- Exchange arguments — proving greedy optimal.
- Interval scheduling and merging — sort by the right endpoint or boundary to make a provably safe choice.
- Huffman coding — derive an optimal prefix code by repeatedly merging the two lightest symbols.
- Classic greedy pitfalls — when greedy fails.

### Module 6.3 — Divide & conquer
Splitting a problem into independent halves and merging their results.
- Divide, conquer, combine — separate independent subproblems and account for the merge cost.
- Recurrences and the Master Theorem — derive and solve the cost of common divide-and-conquer algorithms.
- Counting inversions and closest pairs — recover cross-boundary answers during an ordered merge.
- Fast exponentiation and matrix exponentiation — reduce an exponent by half at every recursive step.

### Module 6.4 — Dynamic programming I (foundations)
The core idea — remember overlapping subproblems instead of recomputing them.
- Overlap and optimal substructure — recognize when repeated subproblems can safely be reused.
- Memoization and tabulation — compute each reachable state once in a valid dependency order.
- State and transition design — encode exactly the information the future still needs.
- 1-D DP — Fibonacci, climbing stairs, house robber, decode ways.
- Kadane's — maximum subarray.

### Module 6.5 — Dynamic programming II (classic)
The canonical DP problems every interview draws from.
- Bounded and unbounded knapsack — choose a state order that prevents or permits item reuse.
- Coin change — count and minimum.
- Longest increasing subsequence — O(n²) and O(n log n).
- Longest common subsequence and edit distance — build a two-sequence recurrence from matching and mismatching prefixes.
- Partition and subset sum — turn a selection question into reachable totals.

### Module 6.6 — Dynamic programming III (2-D & grids)
DP over grids and pairs of sequences.
- Grid path counting and minimum path sums — combine answers from valid predecessor cells.
- Paths with obstacles — preserve grid-DP boundaries when some states are unreachable.
- Matrix-region DP — maximal square, dungeon game.
- String DP — interleaving, regex/wildcard matching.

### Module 6.7 — Dynamic programming IV (advanced)
The states and optimizations that crack the hardest DP.
- Interval DP — matrix-chain, burst balloons.
- Bitmask DP — traveling salesman, assignment.
- Digit DP — counting numbers with properties.
- DP on trees — revisited with states.
- DP optimizations — monotonic queue, convex hull trick, Knuth (intro).

---

## Part 7 — Strings (advanced)
*When linear scanning isn't enough.*

### Module 7.1 — Pattern matching
Finding patterns in text in linear time instead of quadratic.
- Rabin-Karp — rolling hash matching.
- KMP — prefix function, failure links.
- Z-algorithm — z-array and its uses.
- String hashing — collisions and double hashing.

### Module 7.2 — String structures
The heavyweight indices for repeated and multi-pattern queries.
- Suffix arrays and LCP arrays — index every suffix so repeated substring queries become ordered searches.
- Suffix automata and suffix trees — understand the compressed state spaces used for substring queries.
- Aho-Corasick — multi-pattern matching.
- Manacher's — all palindromic substrings in O(n).

---

## Part 8 — Math, bits & geometry
*The quantitative toolkit interviews (especially quant) lean on.*

### Module 8.1 — Number theory
The arithmetic of primes, remainders, and counting that underpins math-heavy problems.
- GCD, LCM, and Euclid's algorithm — reduce divisibility questions with repeated remainders.
- Primes and the sieve — preprocess primality and smallest factors across a range efficiently.
- Modular arithmetic — inverse, fast exponentiation.
- Combinatorics — permutations, combinations, Pascal, stars-and-bars.
- Probability and expected value — compute weighted outcomes without enumerating every random history.

### Module 8.2 — Bit manipulation
Treating integers as bit-sets for constant-time set operations and clever tricks.
- Bitwise operators and masks — read, set, clear, and toggle individual flags in an integer.
- Common tricks — lowest set bit, popcount, power-of-two.
- Subset enumeration with bitmasks — map every subset to a unique integer mask.
- XOR properties — single number, pairing.

### Module 8.3 — Geometry & randomization
Coordinate reasoning and the randomized methods that beat worst cases.
- Points, vectors, cross products, and orientation — replace fragile slope arithmetic with signed area tests.
- Line sweeps — order geometric events to maintain only the active intersections or intervals.
- Convex hulls — identify the boundary points with consistent orientation tests.
- Randomized algorithms — reservoir sampling, randomized quickselect.

---

## Part 9 — Advanced & specialized structures
*The heavy machinery for the hardest rounds and competitive-style questions.*

### Module 9.1 — Query decomposition
Answering many range queries fast by splitting the array or the tree.
- Fenwick trees — support prefix aggregates and point updates in logarithmic time.
- Segment trees — combine associative range answers with logarithmic queries and updates.
- Lazy propagation — defer range updates without losing segment-tree correctness.
- Sparse tables — answer immutable idempotent range queries in constant time after preprocessing.
- Lowest common ancestors — combine Euler tours or binary lifting with tree queries.
- Sqrt decomposition — trade block preprocessing for fast updates and range queries.
- Mo's algorithm — offline range queries.
- Heavy-light decomposition foundations — turn tree paths into a logarithmic number of array ranges.
- Persistent data structures — preserve past versions through structural sharing.

### Module 9.2 — Games & specialized DP
Adversarial reasoning and the recurrences behind winning strategies.
- Game theory — Nim, Sprague-Grundy.
- Minimax with memoization — evaluate optimal adversarial play while caching repeated game states.
- Matrix exponentiation for recurrences — turn a linear recurrence into logarithmic-time exponentiation.

---

## Part 10 — Interview mastery
*Turning knowledge into a top-percentile performance.*

### Module 10.1 — Pattern recognition
Mapping an unfamiliar prompt to the technique that solves it.
- Mapping a problem to its pattern — the decision tree.
- Choosing between approaches — use constraints, invariants, and implementation risk to break ties.
- Estimating before coding — predict time and space costs before committing to an implementation.

### Module 10.2 — Execution under pressure
Writing correct code fast, and getting unstuck when you aren't.
- Time budgeting — reserve explicit time for clarification, derivation, coding, and testing.
- Clean first-pass code — choose names and control flow that make invariants visible.
- Live testing — walk ordinary, boundary, and adversarial cases through the code aloud.
- Recovering when stuck — hints you can give yourself.

### Module 10.3 — Communication & the whole loop
The non-coding signals that decide a hire, plus a study plan.
- Narrating trade-offs — expose the alternatives, assumptions, and evidence behind a decision.
- Follow-ups and generalization — adapt a correct solution when constraints or inputs change.
- Coding-adjacent design — define interfaces and scale a small algorithm into a reliable component.
- Company-family patterns — calibrate depth and speed for product, quant, and startup interviews.
- Mock interviews and study planning — turn failure evidence into a targeted practice loop.

---

# ▲ Grandmaster tier (Parts 11–12)
*Extremely advanced, competitive-programming-grade material, stacked at the end. None of it is required for a normal interview; mastering all of it puts you in the top fraction of a percent.*

## Part 11 — Grandmaster structures
*The heavyweight data structures that answer impossible-looking queries in log time.*

### Module 11.1 — Balanced & self-adjusting trees
Ordered structures you build yourself when the standard library isn't enough.
- Treaps — randomized balanced BSTs.
- Splay trees — self-adjusting access.
- Balanced-BST internals — AVL and red-black in full.
- Order-statistics trees — rank and select.

### Module 11.2 — Trees over trees
Decomposing a tree so path and subtree queries become range queries.
- Heavy-light decomposition — path queries in log² time.
- Centroid decomposition — divide and conquer on trees.
- Euler tour + segment tree — subtree queries.
- Link-cut trees — dynamic connectivity on trees.

### Module 11.3 — Persistence & advanced range structures
Querying past versions and multidimensional ranges.
- Persistent segment trees — query any historical version.
- Wavelet trees — kth-smallest in a range.
- Two-dimensional and merge-sort trees — answer orthogonal and order-statistic range queries.
- Sqrt trees and advanced sparse tables — push static associative queries toward constant time.

---

## Part 12 — Grandmaster algorithms
*The advanced math, string, flow, DP, and geometry that crown the hardest problem sets.*

### Module 12.1 — Advanced mathematics
The number-theoretic and algebraic machinery behind math-heavy problems.
- Fast Fourier transform / NTT — polynomial multiplication.
- Chinese Remainder Theorem — reconstruct a value from compatible modular constraints.
- Möbius inversion and sieves — transform divisor sums and count coprime structures efficiently.
- Linear algebra over GF(2) — solve parity systems with bitset Gaussian elimination.
- Generating functions — encode combinatorial sequences as algebraic objects.
- Inclusion-exclusion — count overlapping sets by alternating intersections without double-counting.

### Module 12.2 — Advanced flow & matching
The full flow toolkit for optimization and assignment problems.
- Dinic's algorithm — use level graphs and blocking flows to accelerate maximum flow.
- Min-cost max-flow — optimize total edge cost while satisfying a required flow.
- General graph matching — Blossom algorithm.
- Hopcroft-Karp — fast bipartite matching.
- Flow modeling — reductions to max-flow/min-cut.

### Module 12.3 — Advanced strings
The linear-time indices for the hardest string problems.
- Suffix array construction — build ordered suffix indices with doubling and linear-time methods.
- Suffix automata — maintain all substrings in a minimal state graph.
- Palindromic trees — index every distinct palindrome as text is extended.
- Aho-Corasick automata — match many patterns in one pass with failure links.

### Module 12.4 — DP optimizations
The techniques that drop a DP from quadratic to near-linear.
- Convex hull trick — maintain the best linear transition under ordered queries.
- Divide-and-conquer DP optimization — exploit monotone optima to shrink transition searches.
- Knuth's optimization — reduce interval-DP transitions when quadrangle inequalities hold.
- Lagrangian relaxation — replace a hard count constraint with a tunable penalty.
- SOS and broken-profile DP — aggregate over submasks and compact boundary states.

### Module 12.5 — Computational geometry
The geometry algorithms competitive rounds hide the hardest problems in.
- Convex hull algorithms — implement monotone chain and understand alternative hull constructions.
- Rotating calipers — optimize antipodal-pair measurements around a convex polygon.
- Half-plane intersection — maintain the feasible polygon induced by linear boundaries.
- Segment-intersection sweeps — detect intersections with an ordered event queue and active set.
- Delaunay and Voronoi structures — connect nearest-neighbor geometry through dual subdivisions.

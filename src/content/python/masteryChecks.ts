import type { LectureQuestion } from "../../types";

/**
 * The third retrieval question for each mastery lecture.
 *
 * The authored lectures ship with two checks each. Release target is three, so
 * this map supplies the additional question and `content/index.ts` appends it
 * to the matching atom. Keeping it here means the hand-written lecture files
 * stay untouched, and a lecture that already carries three questions simply is
 * not listed.
 *
 * Each question targets a *distinct* misconception from its own lecture —
 * never a restatement of the two questions already present.
 */
const q = (
  question: string,
  choices: [string, string, string],
  answer: 0 | 1 | 2,
  explanation: string,
  why: [string, string, string],
): LectureQuestion => ({ question, choices, answer, explanation, why });

export const MASTERY_EXTRA_CHECKS: Record<string, LectureQuestion> = {
  // ---------------------------------------------------------------
  // Algo · Module 1.1 — Measuring work
  // (py.atom.algo.scale already carries three questions in its own file)
  // ---------------------------------------------------------------
  "py.atom.algo.operation-count": q(
    "A loop over `n` items is followed by a separate loop over the same `n` items. What is the total step count?",
    ["About 2n, because consecutive regions add", "About n squared, because there are two loops", "About n, because both loops read the same list"],
    0,
    "Consecutive regions add; only truly nested ranges multiply.",
    [
      "Correct. Each loop contributes n steps and they run one after the other.",
      "Multiplication applies when one loop runs inside another, which is not the case here.",
      "Reading the same data twice still costs two passes; the work does not merge.",
    ],
  ),
  "py.atom.algo.asymptotics": q(
    "You prove an algorithm takes at least n steps and at most n steps. Which claim is strongest?",
    ["Theta of n, because upper and lower bounds match", "Big O of n squared, because it is also true", "Omega of 1, because every algorithm does some work"],
    0,
    "Theta states a tight bound — the upper and lower bounds agree.",
    [
      "Correct. When O and Omega coincide, Theta is the precise description.",
      "O(n^2) is technically true but far weaker than what you proved.",
      "Omega(1) is true of almost everything and carries no information here.",
    ],
  ),
  "py.atom.algo.growth-classes": q(
    "An algorithm halves its remaining input on every step but does a full linear pass before each halving. Which class fits?",
    ["n log n, because a linear pass happens at each of the log n levels", "log n, because the input keeps halving", "n squared, because passing and halving compound"],
    0,
    "Derive the work per level, then multiply by the number of levels.",
    [
      "Correct. About log n levels, each doing about n work, gives n log n.",
      "That would be right only if each step did constant work, not a full pass.",
      "Halving prevents the level count from reaching n, so the product is not quadratic.",
    ],
  ),
  "py.atom.algo.dominant-growth": q(
    "Two algorithms are both Theta of n. What does that tell you about which one finishes first on your data?",
    ["Nothing on its own — constants and lower terms decide it", "The one written with fewer lines will finish first", "They will finish in the same amount of time"],
    0,
    "Growth class describes how cost scales, not how long a specific run takes.",
    [
      "Correct. Same class, so you must measure constants and hidden factors to choose.",
      "Line count is unrelated to the work each line performs.",
      "Equal growth class does not imply equal elapsed time — one can be many times slower.",
    ],
  ),
  "py.atom.algo.space-cost": q(
    "A function must return a new list of n results and uses a temporary set of size n while building it. What is its auxiliary space?",
    ["Theta of n, counting the set but not the required output", "Theta of 1, because the output does not count", "Theta of n squared, because both structures hold n items"],
    0,
    "Auxiliary space excludes the output the problem requires, but includes temporary structures.",
    [
      "Correct. The set is genuine working memory; the returned list is required output.",
      "The set is temporary storage the algorithm chose, so it does count.",
      "Two structures of size n add to 2n, which is still Theta of n.",
    ],
  ),
  "py.atom.algo.amortized-cost": q(
    "An append is amortized O(1). What can a caller who needs predictable per-call latency conclude?",
    ["A single append may still be slow, so the guarantee is about the sequence", "Every append will take the same short time", "The total cost of n appends is unbounded"],
    0,
    "An amortized bound guarantees sequence cost, not identical latency for every call.",
    [
      "Correct. The rare resize is genuinely expensive; only the average across the sequence is constant.",
      "That would be a worst-case per-operation guarantee, which amortized analysis does not give.",
      "The sequence total is precisely what is bounded — it stays linear in n.",
    ],
  ),
  // ---------------------------------------------------------------
  // Algo · Part 4 — Trees, BSTs, heaps, tries
  // ---------------------------------------------------------------
  "py.atom.algo.tree-anatomy": q(
    "A single node with no children. What are its depth and its height?",
    ["Depth 0 and height 0", "Depth 1 and height 1", "Depth 0 and height 1"],
    0,
    "Depth looks upward to the root; height looks downward to a farthest leaf.",
    ["Correct. It is the root, so nothing above; it is a leaf, so nothing below.", "Both counts start at zero for a lone node when measured in edges.", "Height counts edges below it, and a leaf has none."],
  ),
  "py.atom.algo.tree-dfs": q(
    "Which traversal must you use to combine results from both children before handling the node?",
    ["Postorder", "Preorder", "Inorder"],
    0,
    "Preorder sends work downward, inorder visits between children, postorder combines finished children.",
    ["Correct. Postorder visits a node only after both subtrees are complete.", "Preorder handles the node before either child has been explored.", "Inorder finishes only the left child before visiting the node."],
  ),
  "py.atom.algo.tree-bfs": q(
    "Why capture the queue's length before reading a BFS level?",
    ["Children enqueued during the round would otherwise join the level being read", "The queue shrinks unpredictably", "It makes the traversal run faster"],
    0,
    "Freezing the size is what preserves level boundaries.",
    ["Correct. Without the frozen count, levels bleed into one another.", "The queue changes predictably; the issue is where the boundary falls.", "It is about correctness of grouping, not speed."],
  ),
  "py.atom.algo.tree-divide-conquer": q(
    "What is the first thing to decide when writing a divide-and-conquer tree function?",
    ["What a single call returns, and what the empty tree returns", "Whether to use recursion or a stack", "How deep the tree will be"],
    0,
    "Write one return-contract sentence, choose the empty answer, then trust both smaller calls.",
    ["Correct. The contract and its base case make the combine step obvious.", "That is an implementation detail chosen after the contract.", "Depth affects cost, not the shape of the recursion."],
  ),
  "py.atom.algo.tree-path-depth": q(
    "Why can a diameter computation not simply return the best path it found?",
    ["A parent can only extend a downward path, not a path that already turned", "The diameter is always through the root", "Returning it would be too slow"],
    0,
    "Return the one fact a parent may extend; track any complete candidate separately.",
    ["Correct. A path bending through a node is finished and cannot be extended upward.", "The longest path often avoids the root entirely.", "Speed is unaffected; correctness is the issue."],
  ),
  "py.atom.algo.tree-serialization": q(
    "Why is a plain preorder list of values not enough to rebuild a tree?",
    ["It records values but not shape, so different trees can share it", "Preorder loses the root", "Values may repeat"],
    0,
    "Preserve shape as well as values — null markers or a second traversal.",
    ["Correct. A left-only and a right-only child produce the same value sequence.", "Preorder starts at the root, so it is never lost.", "Repeats are not the problem; missing structure is."],
  ),
  "py.atom.algo.bst-invariant": q(
    "What actually determines the cost of a BST search?",
    ["The tree's height, which a degenerate tree makes linear", "The number of nodes, always", "The order the values were searched for"],
    0,
    "BST work follows one comparison path, so running time tracks height.",
    ["Correct. Inserting sorted data produces a chain and O(n) searches.", "A balanced tree searches n nodes in log n steps.", "Query order does not change the structure being traversed."],
  ),
  "py.atom.algo.bst-inorder": q(
    "Checking each node against only its immediate children accepts invalid trees. Why?",
    ["A node must respect every ancestor's bound, not just its parent's", "Children may be null", "Duplicate values are allowed"],
    0,
    "Ancestor bounds validate the whole invariant.",
    ["Correct. A value can sit correctly under its parent yet violate a grandparent's range.", "Null children are handled trivially by the base case.", "Duplicates are a separate policy decision."],
  ),
  "py.atom.algo.bst-balancing": q(
    "What does a rotation change, and what must it leave untouched?",
    ["It changes height but preserves the inorder order", "It changes the values but preserves the height", "It changes both the order and the height"],
    0,
    "Rotations preserve inorder order while changing height.",
    ["Correct. That is exactly why rotations can rebalance without breaking the BST property.", "Rotations never alter stored values.", "Altering the order would destroy the search invariant."],
  ),
  "py.atom.algo.bst-ranges": q(
    "During a range query, when is it safe to skip a node's entire left subtree?",
    ["When the node's value is already at or below the range's low bound", "When the node is a leaf", "When the range is empty"],
    0,
    "Prune by the values a subtree can possibly hold.",
    ["Correct. Everything to the left is smaller still, so none of it can qualify.", "Leaves have no subtrees to skip in the first place.", "An empty range is a trivial case, not the pruning rule."],
  ),
  "py.atom.algo.binary-heap": q(
    "Why does a binary heap need no child pointers?",
    ["Completeness means index arithmetic locates the children", "Heaps store only small numbers", "Heaps are always fully balanced binary search trees"],
    0,
    "Completeness gives logarithmic height and lets index formulas replace pointers.",
    ["Correct. The children of i are at 2i+1 and 2i+2 with no gaps to account for.", "Element type is irrelevant to the layout.", "A heap is not a search tree; only the parent-child relation is ordered."],
  ),
  "py.atom.algo.heap-operations": q(
    "Building a heap from n values by sifting down from the last parent is O(n), not O(n log n). Why?",
    ["Most nodes are near the bottom and can sift only a short distance", "Sifting down is a constant-time operation", "It only visits half the array"],
    0,
    "Peek is constant, push and pop are logarithmic, heapify is linear.",
    ["Correct. The many shallow nodes dominate the count, and the sum converges to O(n).", "A single sift can travel the full height.", "Visiting half the nodes would still be linear in count, not the reason for the bound."],
  ),
  "py.atom.algo.heap-sort-guided": q(
    "In heap sort, where does the root go after each extraction?",
    ["Into the last slot of the active region, which then shrinks", "Into a separate output array", "Back to the front after a re-heapify"],
    0,
    "Move the root to the final open slot, shrink the boundary, and repair.",
    ["Correct. That is what makes heap sort in place with O(1) extra space.", "Using a second array would forfeit the in-place property.", "The root is removed from the active region, not reinserted."],
  ),
  "py.atom.algo.heap-top-k": q(
    "For the k largest values, why is a min-heap the right choice?",
    ["Its root is the weakest kept value, so eviction is a constant-time comparison", "It sorts the k values as they arrive", "It uses less memory than a max-heap"],
    0,
    "Keep only k candidates with the weakest kept candidate at the root.",
    ["Correct. Any new value only has to beat the smallest of the survivors.", "The heap is not sorted; only its root is ordered.", "Both heaps of size k use the same memory."],
  ),
  "py.atom.algo.two-heaps": q(
    "What two conditions must a running-median pair of heaps maintain?",
    ["Every lower value at most every upper value, and sizes within one", "Both heaps sorted, and equal sizes", "All values distinct, and the lower heap larger"],
    0,
    "Keep lower values no greater than upper values, and keep sizes within one.",
    ["Correct. Those two invariants put the median at the roots.", "Heaps are not fully sorted, and sizes differ by one for odd counts.", "Duplicates are fine, and neither heap must always be larger."],
  ),
  "py.atom.algo.k-way-merge": q(
    "Merging k sorted lists with a heap — how many entries does the heap hold at once?",
    ["At most one per source, so k", "All values from every source", "Exactly two, the current smallest pair"],
    0,
    "Keep one candidate per sorted source, plus the state that reveals its replacement.",
    ["Correct. That is what makes the cost O(total log k) rather than O(total log total).", "Loading everything discards the benefit of the sources already being sorted.", "Two candidates cannot decide a minimum across k sources."],
  ),
  "py.atom.algo.trie-foundations": q(
    "A trie stores 'car'. Why does querying 'ca' need a terminal marker to answer correctly?",
    ["The path exists, so without a marker a prefix looks like a stored word", "The characters are stored out of order", "Prefixes are stored in a separate structure"],
    0,
    "Terminal markers record complete keys, separately from the paths that reach them.",
    ["Correct. Reaching a node proves a prefix exists, not that a word ends there.", "Trie edges follow the word's character order exactly.", "Prefixes and words share the very same nodes."],
  ),
  "py.atom.algo.trie-applications": q(
    "Why is trie autocomplete faster than filtering a word list?",
    ["Only the requested prefix's subtree is ever visited", "Tries store words in sorted order automatically", "String comparison is faster inside a trie"],
    0,
    "Use stored prefixes to prune search and traverse only the requested subtree.",
    ["Correct. Non-matching branches are never entered, unlike a scan of every word.", "Sorted output still requires collecting and ordering the matches.", "The saving is in what you skip, not in per-comparison cost."],
  ),

  // ---------------------------------------------------------------
  // Algo · Module 2.5 — Linked lists
  // ---------------------------------------------------------------
  "py.atom.algo.linked-list-foundations": q(
    "What does a linked list give up in exchange for cheap local rewiring?",
    ["Direct indexing and compact storage", "The ability to hold duplicate values", "The ability to grow at all"],
    0,
    "Linked lists trade indexing and locality for O(1) splicing when you already hold the node.",
    ["Correct. Reaching index i costs i link-follows, and each node carries pointer overhead.", "Duplicates are fine in either structure.", "Growth is exactly what linked lists do well."],
  ),
  "py.atom.algo.dummy-heads": q(
    "What special case does a dummy head remove?",
    ["Deleting or inserting at the head, which otherwise has no predecessor", "Lists that contain duplicate values", "Lists whose length is unknown"],
    0,
    "A dummy head gives every real node a predecessor so one uniform rewiring works.",
    ["Correct. Without it, head operations need their own branch.", "Duplicates never needed a special case.", "Length is discovered by traversal either way."],
  ),
  "py.atom.algo.linked-list-reversal": q(
    "Why must reversal save the next node before flipping the current link?",
    ["Flipping the link destroys the only reference to the rest of the list", "The next node must be reversed first", "Python forbids reassigning a pointer twice"],
    0,
    "Save the suffix, reverse one link, then advance.",
    ["Correct. Overwrite it first and the remaining nodes are unreachable.", "Reversal proceeds forward one link at a time, not depth-first.", "There is no such restriction; the issue is losing the reference."],
  ),
  "py.atom.algo.fast-slow-lists": q(
    "You need the node k positions from the end in one pass. Which technique fits?",
    ["Two pointers held a fixed gap apart", "Two pointers at different speeds", "A pointer that restarts from the head each step"],
    0,
    "Relative speed finds middles and cycles; a fixed gap measures from the end.",
    ["Correct. Advance the lead k first, then move both until it reaches the end.", "Differing speeds locate the middle, not an offset from the end.", "Restarting each step makes it quadratic."],
  ),
  "py.atom.algo.merge-partition-lists": q(
    "During a merge, why advance only the list that supplied the chosen node?",
    ["The other list's front is still the smallest value it has to offer", "Both lists must stay the same length", "Advancing both would reverse the output"],
    0,
    "Attach exactly one chosen node behind the tail, then advance only its source.",
    ["Correct. That value has not been placed yet, so it must stay a candidate.", "Lengths are unrelated to correctness here.", "It would skip values, not reverse them."],
  ),
  "py.atom.algo.lru-cache-guided": q(
    "Why does an LRU cache pair a hash map with a doubly linked list?",
    ["The map finds a node in O(1) and the list reorders it in O(1)", "The list sorts the keys alphabetically", "The map guarantees the eviction order"],
    0,
    "Map key to node, order nodes by recency, move every accessed node to the recent end.",
    ["Correct. Neither structure alone gives both lookup and cheap reordering.", "The list is ordered by recency, never alphabetically.", "The list holds the order; the map only locates nodes."],
  ),

  // ---------------------------------------------------------------
  // Algo · Module 3.1 — Sorting
  // ---------------------------------------------------------------
  "py.atom.algo.comparison-sorts": q(
    "Insertion sort is O(n^2) in general. When is it genuinely a good choice?",
    ["On nearly sorted input, where it approaches linear time", "On very large random input", "When the values have a small integer range"],
    0,
    "Name the invariant and the data movement: insertion grows a sorted prefix.",
    ["Correct. Few shifts are needed when most values are already in place.", "Large random input is exactly where the quadratic term dominates.", "A small integer range points to counting sort instead."],
  ),
  "py.atom.algo.merge-sort-guided": q(
    "Merge sort's per-level work is linear and there are about log n levels. What does that make its space cost?",
    ["O(n) auxiliary, because merging needs somewhere to write", "O(1), because merging happens in place", "O(n log n), one buffer per level"],
    0,
    "Merge sort's classic tradeoff is guaranteed n log n time paid for with linear extra space.",
    ["Correct. The merge buffer is what quicksort avoids and merge sort accepts.", "The standard merge is not in place.", "Buffers are reused across levels, so it is linear, not n log n."],
  ),
  "py.atom.algo.quick-sort-guided": q(
    "What causes quicksort's O(n^2) worst case?",
    ["Repeated one-sided partitions, so the depth becomes linear", "Too many duplicate values in the input", "Recursion instead of iteration"],
    0,
    "Balanced split depth gives expected n log n; repeated one-sided splits do not.",
    ["Correct. A pivot that is always the extreme value removes one element per level.", "Duplicates are handled well by a three-way partition.", "The shape of the recursion matters, not that it recurses."],
  ),
  "py.atom.algo.noncomparison-sorts": q(
    "Counting sort is O(n + k) for key range k. When does it stop being a win?",
    ["When the range k is large relative to n", "When the input contains duplicates", "When the input is already sorted"],
    0,
    "Extra key structure can beat comparisons, but range and memory are part of the cost.",
    ["Correct. Sorting ten values with keys up to a million allocates a million buckets.", "Duplicates are ideal for counting sort.", "Prior order does not affect its cost."],
  ),
  "py.atom.algo.quickselect-guided": q(
    "Quickselect and quicksort both partition. Why is quickselect expected linear?",
    ["It recurses into only one side, so the work halves each time", "It never needs to partition more than once", "It uses a different pivot rule"],
    0,
    "Compare the pivot index with the target rank, then discard one whole side.",
    ["Correct. n + n/2 + n/4 … sums to about 2n rather than n log n.", "It usually partitions several times, just on shrinking ranges.", "The pivot rule can be identical; the saving is discarding a side."],
  ),
  "py.atom.algo.sort-keys-comparators": q(
    "You must sort by score descending, then by name ascending. What is the cleanest key?",
    ["A tuple of the negated score and the name", "Two separate sorted() calls in either order", "A key of score alone, then manual fixing"],
    0,
    "Translate the contract into one complete key, using tuple fields for tie-breaks.",
    ["Correct. Tuples compare field by field, which is exactly the contract.", "Two passes work only if done in the right order, and it is easy to get backwards.", "Manual fixing after sorting reintroduces the bug the key prevents."],
  ),
  "py.atom.algo.sort-stability-guided": q(
    "Why does a stable sort enable multi-stage sorting?",
    ["An earlier sort's order survives inside ties of a later sort", "It makes each sort faster", "It removes duplicate keys automatically"],
    0,
    "Stability preserves tie order, which is what lets sorts compose.",
    ["Correct. Sort by the secondary key first, then the primary, and both rules hold.", "Stability is a correctness property, not a speed one.", "Sorting never removes duplicates."],
  ),

  // ---------------------------------------------------------------
  // Algo · Module 3.2 — Binary search
  // ---------------------------------------------------------------
  "py.atom.algo.binary-search-exact": q(
    "A binary search loops forever. Which mistake most likely caused it?",
    ["An update that leaves the interval the same size", "Using integer division for the midpoint", "Starting low at 0"],
    0,
    "Every update must genuinely shrink the interval.",
    ["Correct. Setting low = mid when mid is already low makes no progress.", "Integer division is the correct way to pick a midpoint.", "Starting at 0 is standard and harmless."],
  ),
  "py.atom.algo.binary-search-bounds": q(
    "How do lower bound and upper bound differ on a list containing the target?",
    ["Lower bound gives the first equal position, upper bound the position just past the last", "They return the same index", "Upper bound returns the last equal position"],
    0,
    "Lower bound finds the first value at least target; upper bound the first strictly greater.",
    ["Correct. Their difference is exactly how many copies of the target exist.", "They coincide only when the target is absent.", "It returns one past the last copy, not the last copy itself."],
  ),
  "py.atom.algo.binary-search-answer": q(
    "What must be true before you can binary-search an answer space?",
    ["The yes-or-no test must be monotone across that space", "The answers must be stored in a sorted array", "The answer space must be small"],
    0,
    "Define a monotone test, bound the answer, then search for the boundary.",
    ["Correct. Once true, always true — that is what makes halving valid.", "Nothing is stored; the space is conceptual.", "A huge space is fine, since log of it is small."],
  ),
  "py.atom.algo.binary-search-shaped": q(
    "In a mountain array, comparing `values[mid]` with `values[mid + 1]` tells you what?",
    ["Which side of the probe the peak must lie on", "Whether the array is sorted", "The exact index of the peak"],
    0,
    "Use the array's shape as evidence and follow the slope.",
    ["Correct. Rising means the peak is later; falling means mid could be it.", "A mountain array is deliberately not sorted.", "One comparison narrows the range but rarely lands on the peak."],
  ),

  // ---------------------------------------------------------------
  // Algo · Module 2.2 — Hashing
  // ---------------------------------------------------------------
  "py.atom.algo.hash-maps-sets-guided": q(
    "You must report how many times each user logged in. Set or map?",
    ["A map, because each key carries a value", "A set, because user IDs are unique", "Neither — a sorted list is required"],
    0,
    "A set answers membership; a map is for when the key must carry information.",
    ["Correct. The count is the value attached to each user key.", "A set would tell you who logged in, but never how often.", "Sorting is unrelated to attaching counts to keys."],
  ),
  "py.atom.algo.frequency-counting": q(
    "What information does a frequency counter deliberately throw away?",
    ["Where each occurrence appeared", "How many times each value occurred", "Which values are present"],
    0,
    "A counter compresses a sequence into value-to-count facts.",
    ["Correct. Position is lost, which is exactly why counting is cheap.", "That is the one thing it keeps.", "Presence is recoverable from the keys."],
  ),
  "py.atom.algo.grouping-by-key": q(
    "Grouping words so anagrams land together — which signature is correct?",
    ["The word's sorted letters", "The word's first letter", "The word's length"],
    0,
    "The signature must match the exact meaning of belonging to the group.",
    ["Correct. Anagrams differ only in order, so sorting makes them identical.", "Anagrams need not share a first letter.", "Same length does not make two words anagrams."],
  ),
  "py.atom.algo.default-writeback": q(
    "You are collecting a list of items per key. What default belongs in the read step?",
    ["An empty list, matching the state being built", "Zero, because it is the usual default", "None, so a missing key is visible"],
    0,
    "The default must exactly match the state you promise to store.",
    ["Correct. You append to it, so it must already be a list.", "Zero cannot be appended to; the state here is a list, not a sum.", "None would crash on append — the default must be usable immediately."],
  ),
  "py.atom.algo.composite-keys": q(
    "Two board positions are the same only when the row, the column, and whose turn it is all match. What is the correct key?",
    ["A tuple of all three components in a fixed order", "The row and column only", "The sum of the row and column"],
    0,
    "A composite key must include every component that can change the answer.",
    ["Correct. Leaving out the turn would merge genuinely different states.", "Omitting the turn makes two different states collide.", "Summing loses information — (1,2) and (2,1) would collapse together."],
  ),
  "py.atom.algo.set-operations-guided": q(
    "Which operation lists the values in exactly one of two sets, but not both?",
    ["Symmetric difference", "Union", "Intersection"],
    0,
    "Union is either, intersection is both, symmetric difference is exactly one.",
    ["Correct. It keeps what one side has and the other lacks.", "Union keeps everything, including shared values.", "Intersection keeps only the shared values — the opposite."],
  ),

  // ---------------------------------------------------------------
  // Algo · Module 2.3 — Two pointers & sliding window
  // ---------------------------------------------------------------
  "py.atom.algo.opposing-pointers-guided": q(
    "Why do opposing pointers require sorted input for a two-sum search?",
    ["Order makes one comparison eliminate a whole boundary group", "Sorting removes duplicate values", "Unsorted lists cannot be indexed from both ends"],
    0,
    "Opposing pointers work when order turns one comparison into a proof.",
    ["Correct. A sum that is too small proves the smallest value cannot pair with anything remaining.", "Sorting keeps duplicates; that is not the reason.", "Any list can be indexed from both ends — the issue is what the comparison proves."],
  ),
  "py.atom.algo.read-write-pointers": q(
    "During a read/write filter pass, what is guaranteed about everything before the write index?",
    ["It is exactly the correct answer for the part already read", "It is the untouched original input", "It is sorted"],
    0,
    "The prefix before write is always the correct output so far.",
    ["Correct. That invariant is why the final write index is the answer's length.", "It has been overwritten with the kept values.", "Filtering preserves order but does not sort."],
  ),
  "py.atom.algo.fixed-window-guided": q(
    "A fixed window slides one step right. What is the minimum work required?",
    ["Subtract the outgoing value and add the incoming one", "Re-add every value inside the new window", "Sort the new window"],
    0,
    "A fixed window pays once for the first span, then updates by two operations.",
    ["Correct. Two arithmetic operations per step keep the whole pass linear.", "Recomputing makes the pass O(n·k), which is what sliding avoids.", "Sorting is unnecessary for a sum."],
  ),
  "py.atom.algo.variable-window-guided": q(
    "In a variable window, why may the left edge only ever move forward?",
    ["It gives each element at most one entry and one exit, keeping the pass linear", "It keeps the window a constant size", "It guarantees the sum stays positive"],
    0,
    "Each boundary moving only forward is what proves the linear bound.",
    ["Correct. Both pointers traverse the list once, so the total work is O(n).", "The size varies by design — that is what makes it a variable window.", "Sign depends on the data, not on pointer direction."],
  ),
  "py.atom.algo.window-hash-map": q(
    "A character's count in the window map reaches zero. Why delete the key?",
    ["Because the map's size is being used as the distinct-character count", "Because zero values waste memory", "Because the character can never reappear"],
    0,
    "The map summarizes window identity, so stale keys corrupt what it reports.",
    ["Correct. Leaving it behind inflates the distinct count and breaks the shrink condition.", "Memory is not the concern at this scale.", "It can certainly reappear later and be re-added."],
  ),

  // ---------------------------------------------------------------
  // Algo · Module 2.4 — Stacks, queues & deques
  // ---------------------------------------------------------------
  "py.atom.algo.stack-guided": q(
    "Which situation calls for a stack rather than a queue?",
    ["The most recently opened item must close first", "The longest-waiting item must be served first", "Items must be processed in sorted order"],
    0,
    "A stack is right when the newest unfinished item is resolved first.",
    ["Correct. That is nesting, which is inherently last-in-first-out.", "Oldest-first is exactly what a queue provides.", "Neither structure sorts; that needs a heap or a sort."],
  ),
  "py.atom.algo.queue-deque-guided": q(
    "What does a deque provide that a plain queue does not?",
    ["Efficient insertion and removal at both ends", "Automatic sorting of its contents", "Constant-time lookup by value"],
    0,
    "A deque makes both boundaries efficient.",
    ["Correct. That is what lets it expire from the front and dominate from the back.", "A deque preserves insertion order and never sorts.", "Searching a deque by value is still linear."],
  ),
  "py.atom.algo.monotonic-stack-guided": q(
    "Why is a monotonic stack pass O(n) even though it contains an inner loop?",
    ["Each index is pushed once and popped at most once", "The inner loop runs at most twice per element", "The stack never exceeds a constant size"],
    0,
    "Total pops are bounded by total pushes, so the amortized cost is constant.",
    ["Correct. Across the whole pass there are at most n pushes and n pops.", "A single step can pop many entries; the bound is on the total, not per step.", "The stack can hold up to n indices in the worst case."],
  ),
  "py.atom.algo.monotonic-deque-guided": q(
    "The deque stores indices rather than values. Why does that matter?",
    ["Only an index reveals when a candidate has slid out of the window", "Indices compare faster than values", "Values cannot be stored in a deque"],
    0,
    "Expiry is a question about position, which a bare value cannot answer.",
    ["Correct. You must know where a candidate came from to expire it.", "Comparison speed is irrelevant here.", "A deque holds anything; the choice is about what information you need."],
  ),
  "py.atom.algo.stack-queue-conversions": q(
    "Why transfer between the two stacks only when the outbox is empty?",
    ["Pouring early would interleave new values ahead of older ones", "Transferring is impossible while the outbox has items", "It keeps both stacks the same size"],
    0,
    "Lazy transfer is what keeps each value crossing a constant number of times.",
    ["Correct. The outbox already holds older values in order; pouring on top would jump the queue.", "It is possible, just wrong — order would break.", "The sizes are unrelated to correctness."],
  ),

  // ---------------------------------------------------------------
  // Algo · Module 1.2 — Reasoning about recursion
  // ---------------------------------------------------------------
  "py.atom.algo.call-stack": q(
    "A recursive function returns a value. What happens to the frame that produced it?",
    ["It is popped, and the caller resumes at the line that was waiting", "It stays alive until the whole recursion finishes", "It is merged into the caller's frame to save memory"],
    0,
    "A return pops exactly one frame and hands control back to the waiting caller.",
    [
      "Correct. Each return unwinds one level and the caller continues mid-expression.",
      "Frames are released as they return; only the calls still in progress remain.",
      "Frames are not merged — each call keeps its own parameters and locals.",
    ],
  ),
  "py.atom.algo.recurrences": q(
    "In `T(n) = 2 * T(n // 2) + n`, what does the `+ n` term represent?",
    ["The work this frame does itself, outside the child calls", "The number of recursive calls made", "The depth the recursion will reach"],
    0,
    "A recurrence is child-call cost plus this frame's own local work.",
    [
      "Correct. Here it is the merge step performed after the children return.",
      "The call count is the coefficient 2, not the additive term.",
      "Depth comes from how the argument shrinks, which is the `// 2`.",
    ],
  ),
  "py.atom.algo.recursion-trees": q(
    "In the merge-sort tree, each level totals about `n` work and there are about `log n` levels. Why total by level rather than by call?",
    ["Every level sums to the same amount, so the total is levels times that amount", "Calls on the same level always have identical arguments", "Only the root level performs real work"],
    0,
    "Totalling one level at a time turns many different call sizes into one repeated quantity.",
    [
      "Correct. The per-level total is the pattern; multiplying by the level count finishes it.",
      "Sizes differ across a level; it is their sum that is stable.",
      "Every level does work — that is exactly why the levels are added.",
    ],
  ),
  "py.atom.algo.recursion-vs-iteration": q(
    "You rewrite a recursive routine as a loop. What have you actually changed?",
    ["State moves from stack frames into variables you manage yourself", "The algorithm's asymptotic complexity always improves", "The result becomes more accurate"],
    0,
    "Recursion and iteration differ in where state lives, not in what the algorithm computes.",
    [
      "Correct. You now carry explicitly what the call stack was carrying implicitly.",
      "The growth class usually stays the same; only memoization or a better algorithm changes it.",
      "Both forms compute the same values; correctness is unaffected by the shape.",
    ],
  ),
  "py.atom.algo.tail-recursion": q(
    "Your tail-recursive function raises `RecursionError` at depth 1000. What is the correct fix in Python?",
    ["Rewrite it as a loop, because Python does not optimize tail calls", "Add the tail call at the very end so the optimizer can see it", "Nothing — tail recursion cannot overflow the stack"],
    0,
    "Python allocates a frame per call regardless of whether the call is in tail position.",
    [
      "Correct. Only an explicit loop removes the per-call frame.",
      "The call is already in tail position; Python still does not eliminate the frame.",
      "It absolutely can overflow — tail position gives no protection here.",
    ],
  ),

  // ---------------------------------------------------------------
  // Algo · Module 1.3 — The problem-solving method
  // ---------------------------------------------------------------
  "py.atom.algo.constraints": q(
    "A problem states `n` can reach 100,000 and the limit is about 100 million operations. What does that rule out?",
    ["A quadratic approach, which would need about 10 billion operations", "A linear approach, which is too simple for large input", "Any approach that uses extra memory"],
    0,
    "Estimating the implied work turns a constraint into a decision.",
    [
      "Correct. n squared at 100,000 is 10^10 — two orders of magnitude over budget.",
      "Linear is roughly 10^5 operations, comfortably inside the limit.",
      "The stated limit is on operations; memory is a separate constraint.",
    ],
  ),
  "py.atom.algo.examples-first": q(
    "Why work a small example by hand before writing any code?",
    ["It exposes the changing state and the update rule", "It proves the algorithm is optimal", "It replaces the need for edge-case tests"],
    0,
    "Hand-tracing reveals what actually changes each step — the thing your loop must maintain.",
    [
      "Correct. You discover the state and rule you would otherwise guess at.",
      "One example cannot establish optimality; that needs an argument about all inputs.",
      "Examples guide the design; boundary tests are still required afterwards.",
    ],
  ),
  "py.atom.algo.optimize-method": q(
    "You have a correct brute force. What is the next step in the method?",
    ["Name the expensive operation it repeats", "Rewrite it in a faster language", "Guess a data structure and try it"],
    0,
    "Optimization is targeted: find the repeated work, then remove that specific waste.",
    [
      "Correct. The bottleneck names itself once you look for repeated work.",
      "That changes constants, not the growth that makes brute force fail.",
      "Choosing a structure before naming the bottleneck is guessing, not deriving.",
    ],
  ),
  "py.atom.algo.invariants": q(
    "What makes a loop invariant useful rather than decorative?",
    ["It holds before the loop, is preserved each pass, and gives the answer at the end", "It describes what the loop looks like", "It counts how many iterations will run"],
    0,
    "An invariant is a proof obligation: establish it, preserve it, then use it.",
    [
      "Correct. Those three checks are what turn it into an argument for correctness.",
      "A description of the code's shape proves nothing about its state.",
      "Iteration count is about termination, which is a separate concern.",
    ],
  ),
  "py.atom.algo.edge-cases": q(
    "Where does a reliable edge-case checklist come from?",
    ["The contract — its boundaries, absences, duplicates, and extremes", "Whatever inputs happened to break the code before", "The largest input the problem allows"],
    0,
    "Edge cases are derived from what the function promises, not discovered by accident.",
    [
      "Correct. Each clause of the contract suggests a family of inputs to probe.",
      "Past bugs are useful, but they do not systematically cover the contract.",
      "Size is one dimension; empty, duplicate, and absent cases matter just as much.",
    ],
  ),
  "py.atom.algo.dry-running": q(
    "Why record traced state at the same point in every iteration?",
    ["So the values are comparable across iterations", "So the trace runs faster", "So the loop is guaranteed to terminate"],
    0,
    "A trace is only evidence if each row means the same thing.",
    [
      "Correct. Sampling at different moments makes rows incomparable and hides bugs.",
      "Tracing is a reasoning aid; it does not speed up execution.",
      "Termination depends on the loop's progress, not on how you observe it.",
    ],
  ),
  "py.atom.algo.communication": q(
    "You explain your plan before coding. Which ordering matches the lecture?",
    ["Contract, baseline, chosen idea, invariant, complexity, edge cases", "Code first, then explain whatever you wrote", "Complexity first, then the contract"],
    0,
    "Stating the contract first gives every later claim something to be measured against.",
    [
      "Correct. Each step builds on the one before, ending with what could break it.",
      "Explaining after coding makes the reasoning unverifiable and hides wrong assumptions.",
      "A complexity claim is meaningless until the problem and approach are stated.",
    ],
  ),

  // ---------------------------------------------------------------
  // Algo · Module 2.1 — Arrays & strings
  // ---------------------------------------------------------------
  "py.atom.algo.dynamic-arrays": q(
    "Reading `values[500]` is instant, but inserting at index 0 is not. Why?",
    ["Indexing computes one address; inserting must shift every later element", "Indexing is cached but insertion is not", "Insertion has to re-hash the list"],
    0,
    "Contiguous numbered slots make address arithmetic instant and make shifting unavoidable.",
    [
      "Correct. The address is base plus offset; making room moves everything after it.",
      "No cache is involved — the address is computed arithmetically each time.",
      "Lists are not hashed; that is how dictionaries and sets work.",
    ],
  ),
  "py.atom.algo.in-place-arrays": q(
    "What does an in-place algorithm have to protect?",
    ["Information it has not processed yet, before overwriting a slot", "The original length of the list", "The order in which the list was created"],
    0,
    "In-place work survives by never destroying data it still needs.",
    [
      "Correct. Overwriting a slot whose value is still needed is the classic in-place bug.",
      "Many in-place routines are free to change the length.",
      "Creation order is not a property the algorithm can even observe.",
    ],
  ),
  "py.atom.algo.cyclic-placement": q(
    "When is cyclic placement the right tool?",
    ["When every valid value owns one predictable index", "Whenever the list needs sorting", "Whenever values may repeat freely"],
    0,
    "Cyclic placement depends on a direct value-to-index mapping.",
    [
      "Correct. Values 1..n map to indices 0..n-1, so each value has a home.",
      "General sorting has no such mapping and needs comparisons.",
      "Unrestricted duplicates break the one-value-one-slot assumption.",
    ],
  ),
  "py.atom.algo.immutable-strings": q(
    "Why is `text += piece` inside a loop a problem?",
    ["Strings are immutable, so each concatenation builds a whole new string", "It changes the characters of the original string", "It silently converts the text to bytes"],
    0,
    "Immutability turns repeated concatenation into repeated copying.",
    [
      "Correct. Repeating that across n pieces does quadratic copying work.",
      "The original is never modified — that is precisely the point of immutability.",
      "No encoding conversion happens; text and bytes stay distinct types.",
    ],
  ),
  "py.atom.algo.prefix-sums-guided": q(
    "Prefix values are defined at boundaries rather than at elements. What does that buy?",
    ["Every inclusive range becomes one subtraction with no special first case", "It halves the memory the prefix array needs", "It removes the need to scan the input at all"],
    0,
    "Boundary indexing makes the range formula uniform, including a range that starts at 0.",
    [
      "Correct. prefix[end+1] - prefix[start] works even when start is 0.",
      "The boundary array is one entry longer, not shorter.",
      "You still scan once to build it; the saving is on the queries afterwards.",
    ],
  ),
  "py.atom.algo.difference-arrays": q(
    "A difference array adds an amount at `start` and subtracts it at `end + 1`. Why the subtraction?",
    ["To stop the change from leaking past the end of its range", "To undo a mistake made at the start index", "To keep the array's total sum at zero"],
    0,
    "The prefix accumulation carries the change forward until something cancels it.",
    [
      "Correct. Without the cancel, every later index would keep the increment.",
      "The addition at start is correct; the subtraction bounds it, not fixes it.",
      "The totals are not constrained to zero — ranges may legitimately overlap.",
    ],
  ),
  "py.atom.algo.prefix-sums-2d": q(
    "The 2-D formula subtracts two strips and then adds one rectangle back. Why?",
    ["The overlap of the two strips was subtracted twice", "The matrix may contain negative numbers", "Padding adds an extra row and column"],
    0,
    "Inclusion-exclusion: what is removed twice must be restored once.",
    [
      "Correct. The corner region belongs to both strips, so one copy must return.",
      "The formula is identical whatever the signs of the values are.",
      "Padding makes indexing uniform; it is not the reason for the final addition.",
    ],
  ),
  "py.atom.algo.analysis-cases": q(
    "Someone says quicksort is 'O(n log n)'. What must be stated for that claim to be precise?",
    ["Which case it describes — expected, not worst", "The programming language it is written in", "The exact number of elements being sorted"],
    0,
    "Best, worst, expected, and amortized are claims about which input is being analyzed.",
    [
      "Correct. Quicksort's worst case is quadratic; n log n is the expected case under random pivots.",
      "The language affects constants, not the growth class or the case.",
      "A growth claim is about how cost scales, so it does not depend on one specific size.",
    ],
  ),
};

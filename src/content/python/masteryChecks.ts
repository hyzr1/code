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

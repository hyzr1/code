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
  // Algo · Module 6.3 — Divide & conquer
  // ---------------------------------------------------------------
  "py.atom.algo.divide-conquer-shape": q(
    "Merge sort splits in half and merges linearly. Where does its cost actually come from?",
    ["The linear merge repeated at each of the log n levels", "The cost of slicing the input", "The base cases at the bottom"],
    0,
    "The combine step carries the cost in this shape.",
    ["Correct. About n work per level across about log n levels gives n log n.", "Splitting is index arithmetic and is comparatively free.", "Base cases handle single elements and cost almost nothing."],
  ),
  "py.atom.algo.master-theorem": q(
    "An algorithm makes two recursive calls on halves and does constant work per call. What is the cost?",
    ["Linear, because the leaves dominate", "n log n, because the sides tie", "Logarithmic, because the input halves"],
    0,
    "Compare the leaf exponent against the local work.",
    ["Correct. Leaf exponent one beats constant local work, so the leaves win outright.", "A tie needs linear local work, which this does not have.", "Two calls per level means the call count doubles, unlike binary search."],
  ),
  "py.atom.algo.cross-boundary-merge": q(
    "Why can inversions be counted during a merge without extra comparisons?",
    ["The halves are already sorted, so one comparison settles a whole block", "The merge visits every pair anyway", "Inversions only occur inside one half"],
    0,
    "Sortedness converts a single comparison into a group conclusion.",
    ["Correct. Taking from the right proves every waiting left value is inverted with it.", "A merge is linear and never inspects every pair.", "Crossing inversions are exactly the ones the merge must find."],
  ),
  "py.atom.algo.fast-exponentiation": q(
    "Writing the recursive call twice instead of binding it to a name does what?",
    ["Restores the linear cost the halving removed", "Changes the answer", "Uses less memory"],
    0,
    "Two identical calls per level double the work at every depth.",
    ["Correct. The call tree branches instead of forming a single chain.", "The value computed is identical either way.", "It costs more stack, not less."],
  ),

  // ---------------------------------------------------------------
  // Algo · Module 6.2 — Greedy
  // ---------------------------------------------------------------
  "py.atom.algo.greedy-choice": q(
    "Greedy coin change is optimal for 1, 5, 10, 25 but not for 1, 3, 4. What does that tell you?",
    ["Whether greedy is safe is a property of the instance", "The implementation must differ between them", "Coin change is unsolvable for the second set"],
    0,
    "The greedy-choice property belongs to the problem, not the code.",
    ["Correct. The same rule is provably optimal on one set and provably wrong on the other.", "The code is identical; only the input structure changed.", "An optimal answer exists; greedy just fails to find it."],
  ),
  "py.atom.algo.greedy-exchange": q(
    "You swap an adjacent inverted pair and the cost stays the same. What does the argument conclude?",
    ["Greedy is still optimal, since never-worse is enough", "The proof fails and greedy is unproven", "The two schedules must be identical"],
    0,
    "The argument reshapes an optimal answer without losing optimality.",
    ["Correct. Equal cost simply means more than one optimal ordering exists.", "Demanding strict improvement would break on every tie.", "Different orderings can share a cost."],
  ),
  "py.atom.algo.interval-scheduling": q(
    "Why is shortest duration the wrong key for selecting the most compatible tasks?",
    ["A short task can straddle two others and block both", "Short tasks are rare in practice", "Duration cannot be computed from the endpoints"],
    0,
    "What matters is how much of the timeline a choice consumes.",
    ["Correct. Brevity does not measure how much remaining time a task leaves free.", "Frequency in practice is irrelevant to correctness.", "Duration is simply end minus start."],
  ),
  "py.atom.algo.huffman-coding": q(
    "Every symbol in a text occurs exactly the same number of times. What does Huffman produce?",
    ["Codes all of the same length, matching a fixed-width code", "One very short code and the rest long", "It cannot run on a uniform distribution"],
    0,
    "Huffman only wins when frequencies are skewed.",
    ["Correct. With nothing to exploit it degenerates to the fixed-width answer.", "Skewed lengths require skewed frequencies.", "The algorithm runs fine; it just saves nothing."],
  ),
  "py.atom.algo.greedy-pitfalls": q(
    "Which signal most reliably suggests greedy will fail?",
    ["A hard capacity that makes choices compete for the same room", "A large number of items", "Items with equal values"],
    0,
    "Capacity constraints and whole-set dependencies are the classic failure shapes.",
    ["Correct. Committing early can strand room that a later combination needed.", "Size affects runtime, not whether the rule is sound.", "Equal values often make greedy easier, not harder."],
  ),

  // ---------------------------------------------------------------
  // Algo · Module 6.1 — Recursion & backtracking
  // ---------------------------------------------------------------
  "py.atom.algo.subset-generation": q(
    "Adding one element to a set changes the number of subsets how?",
    ["It doubles, because the new element is independently in or out", "It adds one", "It squares"],
    0,
    "Each element contributes an independent binary choice.",
    ["Correct. Every existing subset appears twice: once with the new element and once without.", "That would make the count linear rather than exponential.", "Squaring grows far faster than the true doubling."],
  ),
  "py.atom.algo.permutations-combinations": q(
    "You need every way to choose 3 items from 10 where order is irrelevant. Which shape?",
    ["A start index that only moves forward", "A used array over all ten items", "A start index plus a used array"],
    0,
    "Order-free selection needs one canonical arrangement per choice.",
    ["Correct. Increasing indices generate each selection exactly once.", "That is the permutation shape and would emit every ordering.", "The used array adds nothing once indices only move forward."],
  ),
  "py.atom.algo.backtracking-template": q(
    "Which piece of the template is easiest to forget, and what does forgetting it cost?",
    ["The undo, which silently corrupts every sibling branch", "The goal test, which causes an error", "The candidate loop, which returns nothing"],
    0,
    "Every mutation on the way down needs a matching restore on the way up.",
    ["Correct. Nothing raises; the search just quietly misses answers.", "A missing goal test usually fails loudly or recurses forever.", "Omitting the loop is obvious the first time you run it."],
  ),
  "py.atom.algo.constraint-search": q(
    "Modelling a puzzle so one class of conflict becomes impossible buys you what?",
    ["A smaller search space and one fewer check per node", "A guarantee that a solution exists", "A lower recursion depth"],
    0,
    "A good model removes work rather than deferring it to a check.",
    ["Correct. One queen per row means row conflicts never need testing at all.", "Modelling cannot create solutions that do not exist.", "Depth still equals the number of placements to make."],
  ),
  "py.atom.algo.search-pruning": q(
    "Sorting the candidates before a subset-sum search enables which prune?",
    ["Stopping the loop once a candidate exceeds what remains", "Skipping every second candidate", "Returning as soon as one subset is found"],
    0,
    "Sorted order means every later candidate is at least as large.",
    ["Correct. Nothing further along can fit, so the whole tail is dead.", "Skipping candidates would discard valid solutions.", "Stopping early would undercount unless you only need one answer."],
  ),

  // ---------------------------------------------------------------
  // Algo - Module 8.1 - Number theory
  // ---------------------------------------------------------------
  "py.atom.algo.gcd-euclid": q(
    "The extended algorithm returns a divisor of one for a number and a modulus. What follows?",
    ["That number has a modular inverse, and the coefficient gives it", "The two numbers are equal", "Both numbers are prime"],
    0,
    "Coprimality is exactly the condition for an inverse.",
    ["Correct. Reduce the coefficient by the modulus.", "Equal numbers give a divisor equal to themselves.", "Nine and ten are coprime and neither is prime."],
  ),
  "py.atom.algo.sieve": q(
    "Why does the sieve store the smallest prime factor rather than a boolean?",
    ["It answers primality and gives fast factorization from the same table", "It uses less memory", "Booleans cannot be indexed"],
    0,
    "A number whose factor is itself is prime.",
    ["Correct. Factorizing becomes a short chain of divisions.", "It uses more memory per entry, not less.", "Booleans index fine; they just answer less."],
  ),
  "py.atom.algo.modular-arithmetic": q(
    "A solution divides by a count and then reduces by the modulus. What goes wrong?",
    ["Integer division discards a remainder the modulus would have carried", "The result overflows", "The modulus stops being prime"],
    0,
    "Division has no meaning under a modulus.",
    ["Correct. Multiply by the modular inverse instead.", "Overflow is a separate concern.", "The modulus is unchanged."],
  ),
  "py.atom.algo.combinatorics": q(
    "Ten distinct books, three shelf slots, order matters. Which count applies?",
    ["A permutation, giving 720", "A combination, giving 120", "Stars and bars, giving 220"],
    0,
    "Order on a shelf is what distinguishes them.",
    ["Correct. Ten times nine times eight.", "That answers which three were chosen.", "That formula is for identical items."],
  ),
  "py.atom.algo.expected-value": q(
    "n letters go into n envelopes at random. What is the expected number delivered correctly?",
    ["One, whatever n is", "n over two", "It depends on n"],
    0,
    "Each letter is correct with probability one over n.",
    ["Correct. Linearity holds despite heavy dependence.", "That would need a probability of one half each.", "The n cancels exactly."],
  ),

  // ---------------------------------------------------------------
  // ML - Module 5.4 - Attention foundations
  // ---------------------------------------------------------------
  "py.atom.ml.query-key-value": q(
    "Keys and values are produced by the same projection. What is lost?",
    ["A position's findability is forced to equal what it contributes", "The ability to compute scores", "The softmax normalization"],
    0,
    "The two roles answer different questions.",
    ["Correct. Separate projections keep that degree of freedom.", "Scores still compute fine.", "Normalization is unaffected."],
  ),
  "py.atom.ml.scaled-dot-product": q(
    "The scaling factor is omitted from a wide attention layer. What is the symptom?",
    ["Weights become nearly one-hot and gradients vanish", "The weights stop summing to one", "The output width changes"],
    0,
    "Dot products grow with the key width.",
    ["Correct. Training slows with no visible error.", "Normalization still holds.", "Shapes are unaffected."],
  ),
  "py.atom.ml.multi-head-attention": q(
    "A 512-wide model goes from 8 heads to 32. What changes?",
    ["Each head narrows from 64 to 16, and the parameter count is unchanged", "The parameters quadruple", "The model width quadruples"],
    0,
    "Heads partition an existing width.",
    ["Correct. There is a practical floor on how narrow a head can be.", "No new projections are added.", "The width is fixed by the model."],
  ),
  "py.atom.ml.attention-masks": q(
    "Masking is applied by zeroing weights after the softmax. What breaks?",
    ["The remaining weights no longer sum to one", "Masked positions still contribute", "The causal order reverses"],
    0,
    "Normalization has already happened.",
    ["Correct. The output is scaled down unevenly per position.", "They are zeroed, just too late.", "Ordering is unaffected."],
  ),
  "py.atom.ml.attention-scaling": q(
    "Attention uses more operations than recurrence at realistic lengths. Why did it win?",
    ["Its work is parallel and every position is one step from every other", "It uses fewer parameters", "It uses less memory"],
    0,
    "Hardware could exploit exactly those two properties.",
    ["Correct. Recurrence forces one sequential step per position.", "Parameter counts are comparable.", "Attention uses more memory, not less."],
  ),

  // ---------------------------------------------------------------
  // ML - Module 5.3 - Sequence models
  // ---------------------------------------------------------------
  "py.atom.ml.recurrent-networks": q(
    "A recurrent network is run on sequences of length 200. What does that cost?",
    ["A gradient product with 200 factors, so it vanishes or explodes", "200 times the parameters", "200 times the memory per weight"],
    0,
    "Length becomes effective depth.",
    ["Correct. Gates and attention exist to work around it.", "The weights are shared across every step.", "Parameter storage is unchanged."],
  ),
  "py.atom.ml.gated-units": q(
    "A gated cell's forget-gate bias is initialized at zero. What happens early in training?",
    ["Memory halves at every step, since the gate sits half closed", "Memory is preserved perfectly", "The input gate stops working"],
    0,
    "The sigmoid of zero is one half.",
    ["Correct. A positive initial bias is the standard remedy.", "That needs the gate near one.", "The input gate is independent."],
  ),
  "py.atom.ml.seq2seq": q(
    "A translation model is excellent during training and poor at inference. What is the likely cause?",
    ["Teacher forcing meant it never had to recover from its own mistakes", "The learning rate was too high", "The encoder is too small"],
    0,
    "Training and inference conditions differ.",
    ["Correct. Free generation compounds an early error.", "A high rate would hurt training too.", "Capacity would show up in both."],
  ),
  "py.atom.ml.encoder-decoder-attention": q(
    "What does attention keep that a fixed context vector does not?",
    ["One representation per input position, read afresh at every output step", "A larger summary vector", "The decoder's own history"],
    0,
    "Nothing has to be discarded in advance.",
    ["Correct. Available information grows with the input length.", "A larger fixed vector is still fixed.", "Decoder history is tracked separately."],
  ),

  // ---------------------------------------------------------------
  // Algo - Module 7.2 - String structures
  // ---------------------------------------------------------------
  "py.atom.algo.suffix-array": q(
    "Which single structure answers longest-repeat and distinct-substring questions together?",
    ["The suffix array with its LCP array", "The suffix array alone", "A sorted list of the characters"],
    0,
    "Sorted order plus shared prefixes is what gives the answers.",
    ["Correct. The LCP entries are what turn order into results.", "Order alone does not measure the sharing.", "Characters carry no substring information."],
  ),
  "py.atom.algo.suffix-trees": q(
    "A suffix trie is built for a million-character string with no repeats. What happens?",
    ["It needs about half a trillion nodes and cannot be built", "It needs about two million nodes", "It fails only on a small alphabet"],
    0,
    "Node count is the triangular number of the length.",
    ["Correct. Compression is mandatory, not an optimization.", "That is the compressed count.", "Alphabet size is not what drives it."],
  ),
  "py.atom.algo.aho-corasick": q(
    "Failure links are added by a depth-first walk instead of breadth-first. What breaks?",
    ["A node's link may be computed before the shallower node it depends on", "The trie is built wrong", "Output lists are lost"],
    0,
    "Links always point to strictly shallower nodes.",
    ["Correct. Breadth-first order resolves the dependency.", "The trie is built before any links.", "Outputs merge after the links are set."],
  ),
  "py.atom.algo.manacher": q(
    "Why is the string padded before running Manacher's?",
    ["Every palindrome becomes odd-length, so one case handles both", "It makes the mirror easier to index", "It marks palindrome centres"],
    0,
    "An even palindrome ends up centred on a filler.",
    ["Correct. The duplicated even-case logic disappears.", "Indexing is a consequence, not the reason.", "Centres are found by the algorithm itself."],
  ),

  // ---------------------------------------------------------------
  // ML - Module 5.2 - Computer vision tasks
  // ---------------------------------------------------------------
  "py.atom.ml.image-classification": q(
    "A model scores 99 per cent accuracy on a set that is 99 per cent one class. What does that tell you?",
    ["Almost nothing; a constant prediction scores the same", "It has learned the task well", "The classes are balanced"],
    0,
    "Accuracy weights every example equally.",
    ["Correct. A macro average would separate the two cases.", "A model that ignores the rare class scores identically.", "The imbalance is what makes the number meaningless."],
  ),
  "py.atom.ml.object-detection": q(
    "Suppression is run across all classes at once. What is the symptom?",
    ["Overlapping objects of different classes lose one of two correct detections", "Duplicate boxes survive", "Scores are miscalibrated"],
    0,
    "A person beside a bicycle overlaps heavily.",
    ["Correct. Suppression must be per class.", "Cross-class suppression removes more, not fewer.", "Confidence scores are unaffected."],
  ),
  "py.atom.ml.segmentation": q(
    "A segmentation model is scored with pixel accuracy alone. What does that hide?",
    ["Poor performance on small classes, since background dominates the pixels", "The class count", "The resolution of the output"],
    0,
    "Predicting background everywhere already scores highly.",
    ["Correct. Per-class overlap is the honest measure.", "The class count is known in advance.", "Resolution is fixed by the architecture."],
  ),
  "py.atom.ml.vision-augmentation": q(
    "An image is flipped for a detection task but the boxes are not. What does the model learn?",
    ["To point at the mirror image of where the object actually is", "Nothing; the flip cancels out", "To ignore the augmentation"],
    0,
    "Spatial targets must be transformed with the image.",
    ["Correct. The picture and the target disagree on every flipped example.", "The image changed and the target did not.", "The model has no way to detect the mismatch."],
  ),

  // ---------------------------------------------------------------
  // Algo - Module 7.1 - Pattern matching
  // ---------------------------------------------------------------
  "py.atom.algo.rabin-karp": q(
    "A Rabin-Karp implementation reports matches on hash equality alone. What is the risk?",
    ["A collision reports a position that does not actually match", "It becomes quadratic", "It misses overlapping matches"],
    0,
    "Equal hashes are a hint, not a proof.",
    ["Correct. The character comparison is what keeps it correct.", "Skipping verification makes it faster, not slower.", "Overlaps are found either way."],
  ),
  "py.atom.algo.kmp": q(
    "KMP resets the matched count to zero after reporting a hit. What breaks?",
    ["Overlapping occurrences are silently missed", "The scan becomes quadratic", "The prefix function is wrong"],
    0,
    "A new match can begin inside the one just reported.",
    ["Correct. Falling back through the table finds them.", "The scan stays linear, just incomplete.", "The table is built before matching starts."],
  ),
  "py.atom.algo.z-algorithm": q(
    "Pattern and text are joined with no separator. What can go wrong?",
    ["A prefix match runs off the pattern into the text and inflates Z-values", "The Z-array becomes too short", "Matching becomes quadratic"],
    0,
    "Nothing stops the match crossing the join.",
    ["Correct. Positions get reported that match nothing.", "The array is always the joined length.", "The running time is unchanged."],
  ),
  "py.atom.algo.string-hashing": q(
    "A million substrings are compared against a modulus of one billion. What should you expect?",
    ["Hundreds of collisions, because pairs grow quadratically", "About one collision", "No collisions"],
    0,
    "Half a trillion pairs against a billion values.",
    ["Correct. Use a much larger modulus or two independent hashes.", "That would need far fewer comparisons.", "Collisions are near-certain at this scale."],
  ),

  // ---------------------------------------------------------------
  // ML - Module 5.1 - Convolutional networks
  // ---------------------------------------------------------------
  "py.atom.ml.convolutions": q(
    "A 64 by 64 input meets a 3 by 3 filter with stride 2 and padding 1. What comes out?",
    ["32 by 32", "64 by 64", "62 by 62"],
    0,
    "Input plus twice the padding, minus the filter, over the stride, plus one.",
    ["Correct. Stride two roughly halves the side.", "That needs a stride of one.", "That is the unpadded, unstrided result."],
  ),
  "py.atom.ml.pooling-hierarchies": q(
    "A stack of ten 3 by 3 filters with stride 1 must detect a 40-pixel object. Can it?",
    ["No, one output sees only 21 positions", "Yes, depth alone is enough", "Yes, if the filters are trained well"],
    0,
    "Each layer adds two to the receptive field.",
    ["Correct. Strided layers or pooling are needed for that reach.", "Depth alone grows reach additively.", "Training cannot widen a receptive field."],
  ),
  "py.atom.ml.classic-cnns": q(
    "Why did plain networks get worse as layers were added, even with healthy gradients?",
    ["Learning an identity mapping through a stack is hard for the optimizer", "The parameter count overflowed", "The dataset was too small"],
    0,
    "Representable and learnable are different things.",
    ["Correct. Skip connections make the identity the default instead.", "Parameter count was not the obstacle.", "It showed up on training loss too."],
  ),
  "py.atom.ml.transfer-learning": q(
    "A thousand medical scans, a backbone trained on everyday photographs. What is the plan?",
    ["Freeze most of the backbone and train the head plus the last block or two", "Fine-tune everything at the full rate", "Train from scratch"],
    0,
    "Distant domain, but a small dataset.",
    ["Correct. Early edge and texture features still transfer.", "That destroys the features you adopted the model for.", "Scratch training needs far more data."],
  ),

  // ---------------------------------------------------------------
  // Algo - Module 6.7 - Dynamic programming IV (advanced)
  // ---------------------------------------------------------------
  "py.atom.algo.interval-dp": q(
    "An interval table is filled with the usual left-to-right double loop. What goes wrong?",
    ["Longer ranges read shorter ones that are still zero", "The table is the wrong size", "The split loop never runs"],
    0,
    "Ranges depend on strictly shorter ranges.",
    ["Correct. Iterating by length is what orders the dependencies.", "The dimensions are unaffected.", "It runs, just on unfinished values."],
  ),
  "py.atom.algo.bitmask-dp": q(
    "A subset-state solution is proposed for 40 elements. What is the problem?",
    ["The table would need about a trillion entries", "Bit operations are too slow", "Masks cannot exceed 32 bits"],
    0,
    "The state count doubles with each element.",
    ["Correct. The technique tops out near twenty elements.", "Bit operations are the fast part.", "Python integers have no such limit."],
  ),
  "py.atom.algo.digit-dp": q(
    "A digit-DP cache is keyed on the digits chosen so far. What is the effect?",
    ["Every path becomes a distinct key and nothing is ever reused", "The answer is too small", "The tight flag stops working"],
    0,
    "The tight flag is the sufficient summary of the prefix.",
    ["Correct. The cache degrades to plain enumeration.", "The answer stays correct, just slow.", "The flag itself is unaffected."],
  ),
  "py.atom.algo.tree-dp": q(
    "Each node returns only its best subtree total. Why does the independent-set recurrence break?",
    ["The parent needs to know whether that best used the child itself", "Trees can have many children", "Post-order is the wrong traversal"],
    0,
    "The constraint is between a parent and its children.",
    ["Correct. Both the take and skip values must survive.", "Child count is not the issue.", "Post-order is exactly right."],
  ),
  "py.atom.algo.dp-optimizations": q(
    "Why is a monotonic deque transition linear when its inner loops can be long?",
    ["Each index is pushed once and popped at most once overall", "The inner loops run at most twice each", "The window has constant size"],
    0,
    "The bound is amortized across the whole run.",
    ["Correct. Total work is bounded by the index count.", "One step can pop many entries at once.", "The window size does not bound the pops."],
  ),

  // ---------------------------------------------------------------
  // ML - Module 4.4 - Making training work
  // ---------------------------------------------------------------
  "py.atom.ml.weight-initialization": q(
    "A rectified network is initialized with the Xavier scale. What is the effect?",
    ["The signal shrinks with depth, because half of it is discarded per layer", "The signal explodes", "Nothing, the two rules agree"],
    0,
    "He carries a factor of two that Xavier does not.",
    ["Correct. Xavier under-scales for rectified units.", "Under-scaling collapses rather than explodes.", "They differ by exactly that factor."],
  ),
  "py.atom.ml.normalization-layers": q(
    "A model is evaluated one example at a time with batch normalization left in training mode. What happens?",
    ["Every value normalizes to zero, since a single example has no variance", "The prediction is unchanged", "It raises a shape error"],
    0,
    "Batch statistics need more than one example.",
    ["Correct. Evaluation mode uses the stored running estimates instead.", "The output is destroyed, not preserved.", "The shapes are fine; the statistics are not."],
  ),
  "py.atom.ml.neural-regularization": q(
    "Dropout is left active while scoring the held-out set. What is the symptom?",
    ["The same input scores differently on each run", "Held-out loss becomes zero", "Training slows down"],
    0,
    "The randomness is a training device only.",
    ["Correct. The measurement is meaningless until it is turned off.", "The scores get worse and noisy, not perfect.", "Evaluation speed is not the issue."],
  ),
  "py.atom.ml.gradient-stability": q(
    "Clipping is added to a run whose early layers never move. What changes?",
    ["Nothing, because clipping only bounds updates that are too large", "The early layers begin learning", "The run diverges"],
    0,
    "Vanishing gradients need a structural fix.",
    ["Correct. Residuals, normalization or initialization are the tools here.", "Clipping cannot amplify a small update.", "Clipping is a stabilizer, not a destabilizer."],
  ),
  "py.atom.ml.debugging-training": q(
    "A model drives one batch of five examples to zero loss but never improves on the full set. What is ruled out?",
    ["Bugs in the forward pass, the loss and the update path", "A learning rate that is too high", "Insufficient model capacity"],
    0,
    "All three demonstrably work end to end.",
    ["Correct. What remains is capacity, settings, or the data itself.", "The rate may still be wrong for the full distribution.", "Capacity remains a live possibility."],
  ),

  // ---------------------------------------------------------------
  // Algo - Module 6.6 - Dynamic programming III (2-D and grids)
  // ---------------------------------------------------------------
  "py.atom.algo.grid-paths": q(
    "A grid solution keeps only one row and now needs to report the route. What has to change?",
    ["Keep the full grid, or a parallel record of the winning predecessor", "Sweep the row backward instead", "Store costs as floats"],
    0,
    "Overwritten cells cannot be walked backward.",
    ["Correct. The route needs a record the sweep does not destroy.", "Direction does not restore the discarded cells.", "Precision is unrelated."],
  ),
  "py.atom.algo.grid-obstacles": q(
    "A minimizing grid stores 0 for blocked cells. What is the symptom?",
    ["Routes pass straight through obstacles and report costs that are too low", "The answer becomes infinite", "The first row is wrong"],
    0,
    "Zero is the most attractive value a minimum can find.",
    ["Correct. Infinity is the correct sentinel for minimizing.", "It goes too low, not too high.", "Every cell is affected, not just the edge."],
  ),
  "py.atom.algo.matrix-region-dp": q(
    "What does a cell hold in the maximal-square table?",
    ["The side of the largest solid square ending at that cell", "Whether that cell is a one", "The area of the best square so far"],
    0,
    "The state names a shape anchored at the cell.",
    ["Correct. The area is computed once at the end.", "That is just the input value.", "A running best is tracked separately."],
  ),
  "py.atom.algo.string-dp": q(
    "Why can a wildcard star not be matched greedily?",
    ["Absorbing as much as possible can strand the rest of the pattern", "It would run too slowly", "Stars can only appear at the end"],
    0,
    "The two-way transition keeps both options open.",
    ["Correct. The table considers both without any backtracking.", "Greedy matching is faster and wrong.", "Stars may appear anywhere."],
  ),

  // ---------------------------------------------------------------
  // ML - Module 4.3 - Optimization
  // ---------------------------------------------------------------
  "py.atom.ml.gradient-descent-variants": q(
    "Two runs cover the same data, one at batch 32 and one at batch 512. What differs?",
    ["The small batch takes 16 times as many updates, each noisier", "The small batch sees more data", "The large batch converges to a different line"],
    0,
    "Batch size trades update count against update quality.",
    ["Correct. Both process the same examples; only the step count differs.", "The data covered is identical.", "Both approach the same optimum."],
  ),
  "py.atom.ml.momentum": q(
    "On a narrow ravine, what happens to the sideways gradient inside the velocity?",
    ["Consecutive contributions reverse sign and cancel", "It is amplified by the momentum coefficient", "It is clipped to zero"],
    0,
    "Cancellation is exactly why momentum helps here.",
    ["Correct. The consistent forward component accumulates instead.", "Amplification is what happens along consistent directions.", "Nothing is clipped."],
  ),
  "py.atom.ml.adaptive-optimizers": q(
    "Adam is used with weight decay folded into the gradient. What goes wrong?",
    ["The adaptive denominator rescales the decay differently per parameter", "The decay is applied twice", "The second moment stops updating"],
    0,
    "This is precisely what AdamW decouples.",
    ["Correct. Parameters with small gradients get penalized far more.", "It is applied once, just unevenly.", "Both moments update normally."],
  ),
  "py.atom.ml.learning-rate-schedules": q(
    "Why does warmup matter more with an adaptive optimizer than with plain descent?",
    ["Its second-moment estimates are also unreliable in the first steps", "It uses a larger peak rate", "It has no momentum term"],
    0,
    "Two unreliable quantities compound at the start of a run.",
    ["Correct. Warmup bounds the damage until both settle.", "The peak is chosen independently.", "Adam keeps a momentum term."],
  ),
  "py.atom.ml.second-order-methods": q(
    "Adam keeps one running value per parameter. What is that approximating?",
    ["The diagonal of the curvature matrix", "The full curvature matrix", "The gradient itself"],
    0,
    "A diagonal costs memory linear in the parameter count.",
    ["Correct. All interactions between parameters are discarded.", "The full matrix would be quadratic in size.", "The first moment tracks the gradient; the second tracks scale."],
  ),

  // ---------------------------------------------------------------
  // Algo - Module 6.5 - Dynamic programming II (classic)
  // ---------------------------------------------------------------
  "py.atom.algo.knapsack": q(
    "A one-row knapsack gives answers that are too large. What is the likely cause?",
    ["The capacity loop runs upward when each item may be used once", "The table is one entry too short", "The values and weights are swapped"],
    0,
    "Ascending capacities let an item feed itself within one pass.",
    ["Correct. Descending capacities enforce the single-use rule.", "A short table would raise an index error instead.", "Swapping them changes the answer arbitrarily, not systematically upward."],
  ),
  "py.atom.algo.coin-change": q(
    "You count 9 ways to make 5 from coins 1, 2 and 5, but expected 4. What happened?",
    ["The amount loop was on the outside, so orderings were counted separately", "The table was seeded incorrectly", "A coin was counted twice"],
    0,
    "Loop nesting decides combinations versus permutations.",
    ["Correct. Nine is the permutation count.", "Both versions seed zero with one way.", "Every coin is unlimited in both versions."],
  ),
  "py.atom.algo.longest-increasing-subsequence": q(
    "Why must the actual subsequence be reconstructed separately from the tails array?",
    ["Tails entries are overwritten by later values and no longer form a run", "Tails is sorted in the wrong order", "Tails holds indices, not values"],
    0,
    "Its length is correct; its contents are not.",
    ["Correct. A parallel record of placements is needed.", "Sorted order is exactly what the method maintains.", "Tails holds values in the plain version."],
  ),
  "py.atom.algo.edit-distance": q(
    "Edit distance comes back too small for every pair. What was most likely skipped?",
    ["Seeding the first row and column with the prefix length", "The diagonal transition", "The minimum operator"],
    0,
    "The borders compare a prefix against the empty string.",
    ["Correct. Zeros there make every distance too small silently.", "A missing diagonal would inflate the distance.", "A missing minimum would raise an error or inflate it."],
  ),
  "py.atom.algo.subset-sum": q(
    "Partition is asked, but the actual two groups are required. What does that rule out?",
    ["The integer bit-shift form, which discards which values set each bit", "The descending capacity loop", "Rejecting odd totals early"],
    0,
    "Reconstruction needs a record of what produced each total.",
    ["Correct. The explicit table with a backward walk is required.", "The descending loop is still what enforces single use.", "The parity check remains a valid shortcut."],
  ),

  // ---------------------------------------------------------------
  // ML - Module 4.2 - Training a network
  // ---------------------------------------------------------------
  "py.atom.ml.forward-pass": q(
    "A batch of 32 rows with 64 features meets a weight matrix of shape 64 by 16. What leaves the layer?",
    ["32 rows of 16 features", "64 rows of 16 features", "32 rows of 64 features"],
    0,
    "The batch dimension is carried through; the feature width is rewritten.",
    ["Correct. The second axis of the weight matrix sets the new width.", "The batch count comes from the data, not the weights.", "The width would only survive an identity-shaped layer."],
  ),
  "py.atom.ml.deep-loss-functions": q(
    "A model puts probability 0.01 on the true label. Roughly what does cross-entropy charge?",
    ["About 4.6", "About 0.01", "About 1.0"],
    0,
    "The loss is the negative natural logarithm of that probability.",
    ["Correct. Confident mistakes are punished heavily.", "That is the probability, not its negative logarithm.", "Squared error would report roughly that instead."],
  ),
  "py.atom.ml.backpropagation": q(
    "What makes backpropagation cheap enough to run on every step?",
    ["Each node needs only its own local derivative and the gradient handed to it", "It skips most of the network", "It approximates the derivatives"],
    0,
    "Locality is what keeps the cost linear in the number of operations.",
    ["Correct. No node requires global knowledge of the graph.", "Every node on a path to the loss is visited.", "The derivatives are exact, not approximate."],
  ),
  "py.atom.ml.reverse-mode-autodiff": q(
    "A tensor is reused by three different operations. What does the backward sweep do?",
    ["Adds all three contributions into its gradient", "Keeps only the largest contribution", "Raises an error about reuse"],
    0,
    "Accumulation is exactly what reuse requires.",
    ["Correct. That sum is the reason gradients accumulate.", "Discarding any contribution would give the wrong derivative.", "Reuse is ordinary and fully supported."],
  ),
  "py.atom.ml.training-loop": q(
    "Training loss keeps falling while held-out loss has started to rise. What is happening?",
    ["The model is memorizing the training set", "The learning rate is too small", "The gradients have vanished"],
    0,
    "The gap between the two curves is what measures generalization.",
    ["Correct. Improving on training alone is the warning sign.", "A small rate would slow both curves together.", "Vanishing gradients would stall the training loss too."],
  ),

  // ---------------------------------------------------------------
  // Algo · Module 6.4 — Dynamic programming I (foundations)
  // ---------------------------------------------------------------
  "py.atom.algo.dp-overlap": q(
    "A recursion repeats subproblems heavily but has no optimal substructure. What should you do?",
    ["Change what each state stores until the parts compose", "Add a larger cache", "Switch to tabulation"],
    0,
    "Caching cannot fix a value that the whole answer does not depend on.",
    ["Correct. Storing a richer value per state is the repair.", "A bigger cache stores the same insufficient value.", "Tabulation reaches the same states with the same flaw."],
  ),
  "py.atom.algo.dp-memo-table": q(
    "Why can a memoized recursion fail where the tabulated version succeeds?",
    ["Deep chains exhaust the call stack", "The cache misses more often", "It visits more states"],
    0,
    "Top-down recursion pays a stack frame per nested call.",
    ["Correct. A loop has no such depth limit.", "Both forms compute each state exactly once.", "The reachable state set is identical."],
  ),
  "py.atom.algo.dp-state-design": q(
    "A rule forbids acting on the very next step after a move. How is that usually encoded?",
    ["Either a small extra state dimension or a transition that skips ahead", "By sorting the input first", "By storing the running total in the state"],
    0,
    "Constraints live in the state or in the transitions.",
    ["Correct. Both encodings are valid; the cheaper one wins.", "Order is fixed by the problem here.", "The total is an output and destroys cache reuse."],
  ),
  "py.atom.algo.dp-one-dimension": q(
    "Houses in a circle instead of a line. What is the smallest change to the solution?",
    ["Run the line solution twice, excluding one end each time", "Add a dimension for the wrap", "Sort the houses first"],
    0,
    "The circle adds one constraint between two specific positions.",
    ["Correct. The first and last cannot both be taken.", "A dimension is unnecessary for a single pairwise constraint.", "Sorting destroys the adjacency the rule refers to."],
  ),
  "py.atom.algo.kadane": q(
    "Why does the circular version also track the minimum running sum?",
    ["A wrapping run is the total minus a non-wrapping run", "Negative numbers need a separate pass", "The minimum bounds the answer"],
    0,
    "Wrapping and its complement are the same partition seen twice.",
    ["Correct. Minimising the middle maximises the wrap.", "One pass handles both quantities together.", "The minimum is used to construct the answer, not bound it."],
  ),

  // ---------------------------------------------------------------
  // ML · Module 4.1 — Neural network basics
  // ---------------------------------------------------------------
  "py.atom.ml.perceptron-xor": q(
    "Which of these can a single perceptron represent?",
    ["AND, because its true case sits in one corner", "XOR, given enough training", "Any function of two Boolean inputs"],
    0,
    "One unit draws one straight boundary.",
    ["Correct. A single line separates that corner from the other three.", "XOR is the standard example that no line separates.", "Only the linearly separable ones are representable."],
  ),
  "py.atom.ml.multi-layer-perceptrons": q(
    "What is the hidden layer's real job?",
    ["Re-describing the input so the output can separate it", "Averaging the input features", "Voting on the final answer"],
    0,
    "Hidden units build the representation the output layer needs.",
    ["Correct. In those new coordinates one straight cut suffices.", "Averaging would lose the information the output needs.", "Only the output layer produces the answer."],
  ),
  "py.atom.ml.activation-functions": q(
    "Ten sigmoid layers are stacked. What happens to the gradient reaching the first layer?",
    ["It shrinks by at least a factor of about a million", "It stays roughly constant", "It grows exponentially"],
    0,
    "Backpropagation multiplies each layer's derivative.",
    ["Correct. A quarter raised to the tenth power is about one millionth.", "Only a derivative of one would preserve it.", "Growth would require derivatives above one."],
  ),
  "py.atom.ml.universal-approximation": q(
    "Someone cites universal approximation to justify one very wide layer. What is missing?",
    ["It promises existence, not that training finds the weights or that the width is affordable", "It only applies to classification", "It requires ReLU activations"],
    0,
    "Representability and learnability are different questions.",
    ["Correct. It says nothing about optimization, cost, or generalization.", "It covers continuous functions generally.", "It holds for a broad family of activations."],
  ),

  // ---------------------------------------------------------------
  // ML · Module 3.7 — Evaluation & calibration
  // ---------------------------------------------------------------
  "py.atom.ml.metrics-precision-recall": q(
    "A spam filter is tuned so almost nothing legitimate is ever blocked. Which metric did that favour?",
    ["Precision, because a false positive loses a real message", "Recall, because no spam may escape", "Accuracy, because most mail is legitimate"],
    0,
    "Which error is expensive decides which metric to favour.",
    ["Correct. Blocking a real message costs far more than letting one advert through.", "Maximizing recall would block aggressively and lose real mail.", "Accuracy would be high even for a filter that does nothing."],
  ),
  "py.atom.ml.confusion-thresholds": q(
    "Review capacity halves overnight. What is the cheapest response?",
    ["Raise the threshold so only the strongest cases are flagged", "Retrain the model on more data", "Switch to a different algorithm"],
    0,
    "The threshold is a free lever that needs no retraining.",
    ["Correct. Precision rises, recall falls, and the change is instant.", "Retraining is slow and does not target the capacity constraint.", "A new algorithm is a large change for a scheduling problem."],
  ),
  "py.atom.ml.roc-pr-auc": q(
    "Prevalence drops from ten percent to one percent while the model is unchanged. What happens?",
    ["ROC AUC stays similar while average precision falls", "Both metrics stay identical", "Both metrics fall together"],
    0,
    "The two metrics have different denominators and different baselines.",
    ["Correct. Precision is diluted by the larger negative pile; the ROC rate is not.", "Average precision tracks prevalence closely.", "ROC AUC is largely insensitive to this change."],
  ),
  "py.atom.ml.regression-metrics": q(
    "Delivery-time estimates should optimize which error metric?",
    ["MAE, because typical error is what customers experience", "RMSE, because rare huge misses dominate", "R squared, because it is scale free"],
    0,
    "The metric should match the cost the product actually pays.",
    ["Correct. Every minute late costs roughly the same, so linear error fits.", "RMSE suits cases where a single large failure is catastrophic.", "R squared compares against a baseline rather than measuring lateness."],
  ),
  "py.atom.ml.probability-calibration": q(
    "You stretch every predicted probability toward zero and one. What changes?",
    ["Calibration worsens while ranking metrics stay identical", "Both calibration and ranking worsen", "Nothing measurable changes"],
    0,
    "Order-preserving transforms are invisible to ranking metrics.",
    ["Correct. The Brier score moves; ROC AUC does not.", "Ranking is untouched because the order is preserved.", "The probabilities themselves are now wrong, which is measurable."],
  ),
  "py.atom.ml.imbalanced-data": q(
    "Which of these is safe to apply to the test split?",
    ["None of them, the test split keeps true prevalence", "Upsampling the rare class", "Downsampling the majority class"],
    0,
    "Evaluation must describe the world the model will meet.",
    ["Correct. Any rebalancing makes the reported score unreachable in production.", "Upsampling the test split inflates every rare-class metric.", "Downsampling changes prevalence just as badly."],
  ),
  "py.atom.ml.grouped-time-validation": q(
    "Rows carry both a user id and a timestamp. What does a correct split need?",
    ["Users kept on one side and training strictly before testing", "Only a grouped split", "Only a temporal split"],
    0,
    "The split must respect every dependency the deployment has.",
    ["Correct. Either leak alone is enough to inflate the estimate.", "Grouping alone still allows training on the future.", "Time order alone still lets one user appear on both sides."],
  ),

  // ---------------------------------------------------------------
  // ML · Module 3.6 — Unsupervised learning
  // ---------------------------------------------------------------
  "py.atom.ml.kmeans-guided": q(
    "You must cluster data whose groups are long, curved ribbons. Why is k-means the wrong tool?",
    ["Nearest-centroid assignment can only carve out roughly round regions", "It cannot handle more than three clusters", "It requires labelled data"],
    0,
    "k-means expresses each cluster as one mean, which forces spherical shapes.",
    ["Correct. One mean per cluster cannot describe a curve, so the boundary cuts across it.", "Any k is allowed; the shape is the limitation.", "k-means is unsupervised and uses no labels."],
  ),
  "py.atom.ml.hierarchical-dbscan": q(
    "Which property do hierarchical clustering and DBSCAN share that k-means lacks?",
    ["Neither forces you to commit to a cluster count up front", "Both produce probabilistic memberships", "Both require spherical clusters"],
    0,
    "Hierarchical defers the cut; DBSCAN derives clusters from density.",
    ["Correct. One builds every grouping for later cutting, the other finds however many dense regions exist.", "Both assign hard memberships; mixtures give probabilities.", "Escaping the spherical assumption is exactly their advantage."],
  ),
  "py.atom.ml.gmm-em": q(
    "Why does each round of expectation-maximization never lower the likelihood?",
    ["Both steps optimize the same objective, holding the other quantity fixed", "The data is resampled each round", "The component count grows over time"],
    0,
    "EM alternates two steps that can each only improve the objective.",
    ["Correct. That monotone improvement is what guarantees convergence.", "The data never changes during fitting.", "The number of components is fixed before fitting begins."],
  ),
  "py.atom.ml.pca-guided": q(
    "A feature with tiny variance is dropped by PCA. When is that a mistake?",
    ["When that low-variance direction is what actually predicts the target", "Never — low variance always means no information", "Only when the data was standardized"],
    0,
    "PCA is unsupervised and ranks directions by spread, not by usefulness.",
    ["Correct. PCA never sees the labels, so it cannot know which direction matters.", "Variance measures spread, which is not the same as relevance.", "The risk exists whether or not you standardized."],
  ),
  "py.atom.ml.manifold-visualization": q(
    "How should you verify a claim suggested by a t-SNE plot?",
    ["Check it in the original feature space", "Re-run t-SNE with the same seed", "Increase the perplexity until it looks clearer"],
    0,
    "The embedding is a diagnostic, not evidence.",
    ["Correct. Only the original space carries meaningful distances.", "Repeating the same run reproduces the same artefacts.", "Tuning until the picture agrees with you is not verification."],
  ),
  "py.atom.ml.anomaly-detection": q(
    "You double the contamination setting on an anomaly detector. What changes?",
    ["More points are flagged, raising recall and usually lowering precision", "The model retrains on different data", "The anomaly scores themselves change"],
    0,
    "Contamination converts continuous scores into a decision.",
    ["Correct. It only moves the threshold, which trades precision for recall.", "The training data is unaffected by the threshold.", "The scores are unchanged; only the cut-off moves."],
  ),

  // ---------------------------------------------------------------
  // ML · Part 3 — Classical machine learning
  // ---------------------------------------------------------------
  "py.atom.ml.learning-paradigms": q(
    "You have customer records with no target column and want to find natural groupings. Which paradigm?",
    ["Unsupervised, because there is no feedback signal to learn from", "Supervised, because the records have many columns", "Reinforcement, because you will act on the groups"],
    0,
    "Paradigms are told apart by their feedback signal.",
    ["Correct. Structure must be discovered without any labelled answer.", "Having features is not the same as having a target.", "No reward is observed; acting later does not make it reinforcement learning."],
  ),
  "py.atom.ml.examples-features-labels": q(
    "A churn model uses 'number of support tickets after cancellation'. What is wrong?",
    ["It was not available at prediction time, so it leaks the outcome", "It is not numeric", "It has too many missing values"],
    0,
    "Define prediction time and feature availability before anything else.",
    ["Correct. In production that value does not exist yet when the prediction is needed.", "It is a count, so the type is fine.", "Missingness is a separate concern from availability."],
  ),
  "py.atom.ml.baselines-formulation": q(
    "Your fraud classifier reaches 99% accuracy on data that is 99% legitimate. What should you conclude?",
    ["It may be no better than always predicting the majority class", "It is an excellent model", "Accuracy is the wrong metric to ever compute"],
    0,
    "Define a baseline and select metrics from the real decision.",
    ["Correct. The trivial baseline already scores 99%, so the number proves nothing.", "It has not been shown to beat guessing at all.", "Accuracy is informative when compared against a baseline."],
  ),
  "py.atom.ml.split-discipline": q(
    "Your dataset has several rows per patient. What must the split respect?",
    ["All of a patient's rows belong to the same side", "Each side gets an equal number of rows", "Rows must be split randomly"],
    0,
    "Choose splits from deployment boundaries and keep groups together.",
    ["Correct. Splitting a patient across sides lets the model recognize them rather than generalize.", "Balance is secondary to preventing leakage.", "Random splitting is exactly what breaks the group."],
  ),
  "py.atom.ml.generalization-fit": q(
    "Training error is 1% and validation error is 25%. What does that pattern indicate?",
    ["Overfitting — the model memorized rather than generalized", "Underfitting — the model is too simple", "A bug in the metric"],
    0,
    "Read train and validation errors together.",
    ["Correct. Low train with a large gap is the signature of overfitting.", "Underfitting shows high error on both.", "The pattern is a common and well-understood outcome."],
  ),
  "py.atom.ml.bias-variance-diagnosis": q(
    "Retraining on different samples gives wildly different models. Which term dominates?",
    ["Variance — sensitivity to the particular data sampled", "Bias — a systematic miss", "Neither; that is normal for any model"],
    0,
    "Bias is the average systematic miss; variance is sensitivity to sampled data.",
    ["Correct. Instability across resamples is the definition of high variance.", "Bias would show as a consistent miss in the same direction.", "Well-regularized models stay far more stable than that."],
  ),
  "py.atom.ml.cross-validation-search": q(
    "Why must scaling be fitted inside each cross-validation fold rather than once beforehand?",
    ["Fitting it once lets validation data influence the transformation", "It would run too slowly otherwise", "Scaling is not a learned step"],
    0,
    "Fit all learned steps inside the fold.",
    ["Correct. The held-out fold must stay genuinely unseen, including by the preprocessing.", "Refitting per fold costs more, not less.", "Scaling learns a mean and a standard deviation from data."],
  ),
  "py.atom.ml.linear-regression-guided": q(
    "Least squares always produces a line passing through which point?",
    ["The point at the mean of x and the mean of y", "The origin", "The median of the data"],
    0,
    "Least squares minimizes squared error and centres on the means.",
    ["Correct. That fact is what determines the intercept once the slope is known.", "Only if the data happens to be centred there.", "Squared error is driven by means, not medians."],
  ),
  "py.atom.ml.regression-losses": q(
    "Your target has rare, extreme outliers you do not want dominating the fit. Which loss?",
    ["MAE, which grows linearly and is more robust", "MSE, which grows quadratically", "Neither; the loss makes no difference"],
    0,
    "MSE emphasizes large misses; MAE grows linearly and targets the median.",
    ["Correct. Linear growth stops a single extreme residual dictating the model.", "Squaring is exactly what amplifies the outlier's influence.", "The choice of loss changes which statistic you are estimating."],
  ),
  "py.atom.ml.logistic-regression-guided": q(
    "Where does a logistic regression's decision boundary lie?",
    ["Where the linear logit equals zero, giving probability 0.5", "Where the probability equals 1", "Wherever the training data is densest"],
    0,
    "Logistic regression applies the sigmoid to a linear logit.",
    ["Correct. Sigmoid maps zero to one half, which is the natural threshold.", "Probability one is the extreme, not the boundary.", "The boundary comes from the weights, not from data density."],
  ),
  "py.atom.ml.softmax-regression-guided": q(
    "How does softmax differ from running one sigmoid per class?",
    ["Softmax makes the classes compete, so the probabilities sum to one", "Softmax is faster to compute", "Softmax requires exactly two classes"],
    0,
    "Softmax converts competing logits into one probability distribution.",
    ["Correct. Independent sigmoids can all say 0.9, which softmax cannot.", "Speed is not the distinction.", "Softmax generalizes to any number of classes."],
  ),
  "py.atom.ml.linear-regularization": q(
    "You want the model to select features by zeroing useless weights. Which penalty?",
    ["L1, whose constant pull can reach exactly zero", "L2, which shrinks smoothly", "Neither; regularization cannot zero weights"],
    0,
    "Ridge uses L2 for smooth shrinkage; lasso uses L1 for sparsity.",
    ["Correct. That is precisely why lasso doubles as feature selection.", "L2's pull vanishes as the weight shrinks, so it only approaches zero.", "L1 regularly produces exactly zero coefficients."],
  ),
  "py.atom.ml.feature-pipelines": q(
    "Why is one-hot encoding preferred over mapping categories to 0, 1, 2?",
    ["Integer codes imply an ordering and spacing the categories do not have", "One-hot uses less memory", "Integer codes cannot be stored in a dataframe"],
    0,
    "Build features inside a training-fitted pipeline that respects their meaning.",
    ["Correct. A linear model would treat category 2 as twice category 1.", "One-hot uses more columns, not fewer.", "They store fine; the problem is what the model infers."],
  ),
  "py.atom.ml.knn-guided": q(
    "What happens to kNN as k grows very large?",
    ["Predictions smooth toward the majority class and detail is lost", "It overfits more strongly", "It becomes faster at prediction time"],
    0,
    "kNN selects k neighbors and votes or averages.",
    ["Correct. At k equal to the dataset size every query returns the global majority.", "Small k overfits; large k underfits.", "Prediction cost is driven by the dataset size, not k."],
  ),
  "py.atom.ml.naive-bayes-guided": q(
    "Why does Naive Bayes need smoothing?",
    ["A single zero likelihood would annihilate the whole product", "The prior is usually unknown", "Probabilities must be integers"],
    0,
    "Naive Bayes combines a prior with smoothed feature likelihoods.",
    ["Correct. One unseen feature would otherwise force the posterior to zero regardless of evidence.", "The prior is estimated from class frequencies.", "Probabilities are continuous values."],
  ),
  "py.atom.ml.decision-trees-guided": q(
    "A split leaves both children with the same class mixture as the parent. What is its information gain?",
    ["Zero — the split explains nothing", "Maximum, because both sides are balanced", "Undefined"],
    0,
    "Trees greedily choose impurity-reducing questions.",
    ["Correct. Impurity is unchanged, so the question was useless.", "Balanced mixtures are the most impure, not the most informative.", "The quantity is perfectly well defined and equals zero."],
  ),
  "py.atom.ml.curse-dimensionality": q(
    "Why does kNN degrade badly in very high dimensions?",
    ["Distances between all pairs become nearly equal, so nearness stops meaning anything", "Distance computations overflow", "High-dimensional data is always noisy"],
    0,
    "Volume grows exponentially, data becomes sparse, and distances concentrate.",
    ["Correct. When nearest and farthest are nearly identical, the neighbours are arbitrary.", "The arithmetic is unaffected.", "Noise is a separate problem from concentration of distances."],
  ),
  "py.atom.ml.bagging-random-forests": q(
    "What does a random forest add beyond bagging?",
    ["Random feature subsets at each split, making trees less correlated", "Sequential training of the trees", "A different loss function"],
    0,
    "Bagging averages diverse bootstrap models; forests add feature randomness.",
    ["Correct. Less correlated errors mean averaging cancels more variance.", "Forest trees train independently; boosting is the sequential method.", "The splitting criterion is unchanged."],
  ),
  "py.atom.ml.boosting-guided": q(
    "How does boosting differ fundamentally from bagging?",
    ["Boosting trains models in sequence, each correcting the last", "Boosting trains models independently and averages them", "Boosting uses fewer models"],
    0,
    "Boosting adds targeted corrections in sequence.",
    ["Correct. Each round focuses on what remains wrong, which reduces bias.", "That describes bagging.", "Boosting typically uses many rounds, often hundreds."],
  ),
  "py.atom.ml.gradient-boosted-trees": q(
    "Why does histogram-based boosting bin the features first?",
    ["It caps the number of candidate split points, making the search much faster", "It improves accuracy guarantees", "It removes the need for a learning rate"],
    0,
    "Histogram boosting searches binned splits efficiently.",
    ["Correct. The search cost stops depending on the number of distinct values.", "Binning trades a little precision for speed.", "The learning rate is still essential."],
  ),
  "py.atom.ml.stacking-blending": q(
    "Why must the meta-model be trained on out-of-fold predictions?",
    ["In-fold predictions are optimistic, so the meta-model would over-trust the base models", "Out-of-fold predictions are faster to compute", "It is required for the base models to converge"],
    0,
    "A valid stack uses out-of-fold training predictions.",
    ["Correct. Predictions on rows a model was trained on look far better than production ones.", "They require extra refitting, so they cost more.", "Base model convergence is unrelated."],
  ),
  "py.atom.ml.support-vector-machines": q(
    "You move a training point far from the decision boundary. What happens to the SVM?",
    ["Nothing — only the support vectors define the boundary", "The boundary shifts toward that point", "The margin necessarily shrinks"],
    0,
    "Support vectors determine the boundary; other points do not.",
    ["Correct. That sparsity is one of the SVM's defining properties.", "Non-support vectors exert no influence at all.", "The margin is set by the closest points, which did not move."],
  ),
  "py.atom.ml.kernel-trick": q(
    "What does raising the RBF kernel's gamma do?",
    ["Makes similarity more local, so the model fits tighter and can overfit", "Makes the boundary smoother", "Removes the need for the C parameter"],
    0,
    "RBF gamma controls locality.",
    ["Correct. High gamma means only very nearby points are considered similar.", "That is what a small gamma produces.", "C still governs the penalty for margin violations."],
  ),

  // ---------------------------------------------------------------
  // ML · Part 2 — Scientific Python & the ML toolkit
  // ---------------------------------------------------------------
  "py.atom.ml.numpy-arrays": q(
    "Shapes (3, 1) and (4,) are broadcast together. What is the result?",
    ["(3, 4), because the length-one axis stretches", "An error, because 1 and 4 differ", "(3, 1), because the left operand wins"],
    0,
    "Broadcasting compares axes right to left; a 1 stretches, a missing axis counts as 1.",
    ["Correct. The missing leading axis becomes 1 and the length-one axis expands to 4.", "A length-one axis is exactly the case that is allowed to stretch.", "Neither operand wins; the result takes the larger of each pair."],
  ),
  "py.atom.ml.numpy-vectorization": q(
    "Why replace a Python loop with a vectorized expression?",
    ["The loop runs in the interpreter while the vectorized form runs in compiled code", "Vectorized code is more accurate", "Loops cannot express elementwise work"],
    0,
    "Vectorize regular numerical work with ufuncs, masks, and broadcasting.",
    ["Correct. The per-element interpreter overhead is what disappears.", "Both compute the same values; only speed changes.", "Loops can express it — they are just slow at scale."],
  ),
  "py.atom.ml.numpy-linear-algebra": q(
    "You need to solve `A x = b`. Why prefer a solver over computing `inv(A) @ b`?",
    ["Solving is faster and numerically better conditioned", "The inverse does not exist for square matrices", "The two give different answers mathematically"],
    0,
    "Use solve for linear systems rather than forming an inverse.",
    ["Correct. Explicit inversion costs more and amplifies rounding error.", "Square matrices often have inverses; that is not the issue.", "They agree in exact arithmetic — the difference is numerical."],
  ),
  "py.atom.ml.numpy-stability": q(
    "Subtracting the max before a softmax changes the result how?",
    ["Not at all mathematically, but it prevents overflow", "It makes the outputs sum to less than one", "It reverses the ordering of the outputs"],
    0,
    "Equivalent algebra can behave differently in finite precision.",
    ["Correct. The shift cancels in the ratio, so only the arithmetic safety changes.", "The outputs still sum to exactly one.", "Ordering is preserved because every logit shifts equally."],
  ),
  "py.atom.ml.numpy-random-generators": q(
    "Why pass a generator object explicitly rather than calling a global random function?",
    ["Global state makes runs depend on unrelated call order", "Global functions are slower", "Generator objects produce better randomness"],
    0,
    "Use default_rng, record seeds, and pass generator objects explicitly.",
    ["Correct. Any other code drawing from the same global stream silently changes your results.", "Speed is not the concern.", "Both use the same underlying algorithms; the difference is control."],
  ),
  "py.atom.ml.pandas-foundations": q(
    "What should you settle before writing any dataframe code?",
    ["What one row represents", "Which plotting library you will use", "How many rows there are"],
    0,
    "Define one-row meaning, then index and aggregate deliberately.",
    ["Correct. Joins, grouping, and deduplication are all meaningless without it.", "Plotting comes much later and does not shape the data model.", "Row count is a fact about the data, not its meaning."],
  ),
  "py.atom.ml.data-cleaning": q(
    "Before dropping duplicates, what must you decide?",
    ["Which fields define whether two rows are the same record", "How many rows you are willing to lose", "Whether to sort the data first"],
    0,
    "Define duplicate identity explicitly.",
    ["Correct. The same table yields different results under different identities.", "The loss follows from the identity, not the other way round.", "Order does not affect which rows are duplicates."],
  ),
  "py.atom.ml.tabular-preprocessing": q(
    "You standardize features using statistics computed over the full dataset, then split. What have you done?",
    ["Leaked test information into training, inflating your score", "Nothing wrong, since scaling is not learning", "Made the model slower to train"],
    0,
    "Split first, fit every learned transformation on training data, reuse it unchanged.",
    ["Correct. The mean and standard deviation are learned parameters carrying test information.", "Scaling is fitted from data, so it absolutely is learning.", "Speed is unaffected; the estimate is what breaks."],
  ),
  "py.atom.ml.exploratory-analysis": q(
    "During exploration a column turns out to be 95% missing. What does that mean for modelling?",
    ["The column carries little usable signal and may not be worth imputing", "The column should be filled with zeros", "The rows with missing values must be deleted"],
    0,
    "Explore distributions, missingness, groups, and suspicious patterns first.",
    ["Correct. Imputing 95% of a column mostly invents data.", "Zero is a value with meaning and would distort the distribution.", "Deleting those rows would discard almost the entire dataset."],
  ),
  "py.atom.ml.plotting-guided": q(
    "What should determine the choice of chart?",
    ["The question being asked of the data", "Which chart looks most impressive", "The number of columns available"],
    0,
    "Name the question, then choose the matching mark.",
    ["Correct. Distribution, comparison, and trend each call for a different mark.", "Decoration is not a reason to mislead a reader.", "Column count constrains options but does not choose among them."],
  ),
  "py.atom.ml.torch-tensors-devices": q(
    "A forward pass raises an error about expected device. What is the likely cause?",
    ["The model and the batch live on different devices", "The learning rate is too high", "The dtype is float32 instead of float64"],
    0,
    "Treat shape, dtype, and device as one tensor contract.",
    ["Correct. Model and data must be moved to the same device deliberately.", "Learning rate cannot produce a device error.", "A dtype mismatch raises a dtype error, not a device one."],
  ),
  "py.atom.ml.torch-autograd": q(
    "When does autograd actually compute gradients?",
    ["During the backward pass, replaying the recorded graph in reverse", "During the forward pass, alongside each operation", "When the optimizer steps"],
    0,
    "Forward records a graph; backward applies the chain rule in reverse.",
    ["Correct. Forward only records what was done and the values needed.", "Forward computes values and records structure, not gradients.", "The optimizer consumes gradients that already exist."],
  ),
  "py.atom.ml.torch-shapes": q(
    "Why insert a length-one axis before an operation?",
    ["To control how broadcasting aligns the tensors", "To reduce memory usage", "To convert the dtype"],
    0,
    "Insert length-one axes deliberately rather than letting broadcasting guess.",
    ["Correct. It makes the intended alignment explicit instead of accidental.", "A length-one axis adds no elements either way.", "Axes and dtypes are independent."],
  ),
  "py.atom.ml.torch-dataloaders": q(
    "What is the Dataset responsible for, as opposed to the DataLoader?",
    ["Defining one example; the DataLoader defines delivery", "Defining the batch size", "Shuffling the data"],
    0,
    "Dataset defines one example, DataLoader defines delivery, collate defines batch assembly.",
    ["Correct. That separation lets you change batching without touching the data logic.", "Batch size is a delivery decision.", "Shuffling is also delivery."],
  ),
  "py.atom.ml.torch-reproducibility": q(
    "You seed the model initialization but results still vary between runs. What is the most likely omission?",
    ["The data order is driven by a separate unseeded generator", "The learning rate changes each run", "The loss function is non-deterministic"],
    0,
    "Seed every source and isolate generator streams.",
    ["Correct. Shuffling is its own randomness source and needs its own seed.", "Hyperparameters do not change unless you change them.", "Standard losses are deterministic given the same inputs."],
  ),
  "py.atom.ml.experiment-tracking": q(
    "Why must a run record the code version and data version, not just hyperparameters?",
    ["Otherwise two runs with identical settings cannot be explained when they differ", "To make the run directory larger", "Because hyperparameters are unimportant"],
    0,
    "Record configuration, code, data, and environment against a unique identity.",
    ["Correct. Without them a changed result has no attributable cause.", "Size is irrelevant to the purpose.", "Hyperparameters matter — they are simply not sufficient."],
  ),
  "py.atom.ml.profiling-bottlenecks": q(
    "A stage takes 3% of total runtime. You make it twice as fast. What is the overall gain?",
    ["About 1.5%, which is why you should profile first", "About 50%", "None, because optimization never helps"],
    0,
    "Measure stage time before optimizing anything.",
    ["Correct. The ceiling on any speedup is the share of time that stage occupies.", "Halving 3% cannot halve the whole runtime.", "Optimizing the dominant stage genuinely does help."],
  ),
  "py.atom.ml.gpu-workflow": q(
    "Training with Adam runs out of memory although the parameters fit easily. Why?",
    ["Gradients and optimizer state multiply the per-parameter cost several times over", "The GPU reserves half its memory for the driver", "Parameters are stored twice by default"],
    0,
    "Estimate the whole memory budget, not just the weights.",
    ["Correct. Adam adds two moment buffers on top of parameters and gradients.", "Driver overhead is small and not the explanation here.", "The duplication is gradients and optimizer state, which is more than one extra copy."],
  ),
  "py.atom.ml.notebooks-pipelines": q(
    "When should notebook logic be promoted into a tested function?",
    ["Once it is stable and something else depends on it", "Never — notebooks should hold the whole project", "Immediately, before you know whether it works"],
    0,
    "Explore interactively, promote stable logic into tested functions, then orchestrate.",
    ["Correct. Promotion is what makes a result repeatable by anyone else.", "Notebooks hide execution order and resist testing.", "Promoting too early adds ceremony to code you may discard."],
  ),

  // ---------------------------------------------------------------
  // ML · Module 1.2 — Calculus & optimization math
  // ---------------------------------------------------------------
  "py.atom.ml.exponents-logs-sums": q(
    "Why are likelihoods almost always computed in log space?",
    ["Products of many small probabilities underflow, and logs turn them into sums", "Logs make the model more accurate", "Probabilities cannot be multiplied directly"],
    0,
    "Logs undo powers and turn products into sums.",
    ["Correct. A thousand probabilities multiplied together round to zero in floating point.", "The optimum is unchanged; only the arithmetic is safer.", "They can be multiplied — the problem is what floating point does with the result."],
  ),
  "py.atom.ml.derivatives-rules": q(
    "A function has a large value but a derivative of zero at a point. What does that tell you?",
    ["It is locally flat there, whatever its height", "It is at zero height", "The function is constant everywhere"],
    0,
    "A derivative is local slope, not height.",
    ["Correct. Height and slope are independent pieces of information.", "Value and derivative are unrelated quantities.", "Flat at one point says nothing about the rest."],
  ),
  "py.atom.ml.partials-gradient": q(
    "Why does gradient descent step in the direction of the negative gradient?",
    ["The gradient points toward steepest ascent, so its negative descends fastest", "The negative gradient is always smaller", "Gradients are always negative"],
    0,
    "The gradient collects all partials and points uphill.",
    ["Correct. Minimizing means moving directly against the steepest climb.", "Negating changes direction, not magnitude.", "A gradient can point in any direction."],
  ),
  "py.atom.ml.chain-rule": q(
    "In `f(x) = outer(inner(x))`, where is the outer derivative evaluated?",
    ["At `inner(x)`, the value flowing into it", "At `x`, the original input", "At zero"],
    0,
    "Find each local derivative, then multiply backward along the path.",
    ["Correct. Each stage differentiates at whatever value it actually received.", "Evaluating at x ignores the transformation the inner function performed.", "There is no reason the composition would be centred at zero."],
  ),
  "py.atom.ml.jacobians-hessians": q(
    "A function maps 3 inputs to 2 outputs. What is its Jacobian's shape?",
    ["2 by 3 — one row per output, one column per input", "3 by 2", "3 by 3"],
    0,
    "A Jacobian organizes first derivatives from many inputs to many outputs.",
    ["Correct. Each row is the gradient of one output.", "That is the transpose of the Jacobian.", "Square shapes only arise when the counts happen to match."],
  ),
  "py.atom.ml.matrix-calculus": q(
    "The gradient of `||Ax - b||^2` is `2A^T(Ax - b)`. What does a zero gradient mean?",
    ["The residual is orthogonal to every column of A — the least-squares solution", "The matrix A is zero", "The data contains no noise"],
    0,
    "Expand the compact expression and differentiate coordinate by coordinate.",
    ["Correct. No column can explain any remaining error, so the fit cannot improve.", "A can be anything; it is the product that vanishes.", "Residuals usually remain; they are simply unexplainable by this model."],
  ),
  "py.atom.ml.taylor-approximations": q(
    "Why do second-order optimization methods build a quadratic model of the loss?",
    ["A quadratic captures curvature, so the step size can be chosen sensibly", "Quadratics are always exact", "First derivatives are unavailable"],
    0,
    "Taylor replaces a hard local function with a matching polynomial.",
    ["Correct. Curvature says how far you can move before the slope changes.", "The approximation is only accurate near the expansion point.", "Second-order methods use first derivatives too — plus curvature."],
  ),
  "py.atom.ml.convexity": q(
    "Your loss is convex. What does that guarantee about a local minimum you find?",
    ["It is also the global minimum", "It is unique", "Gradient descent will reach it in one step"],
    0,
    "Convexity turns every local minimum into a global minimum.",
    ["Correct. That is precisely the guarantee convexity buys.", "A flat-bottomed convex function can have many minimizers at the same value.", "Convexity says nothing about how many steps convergence takes."],
  ),
  "py.atom.ml.constrained-optimization": q(
    "What must a constrained optimum satisfy that an unconstrained one need not?",
    ["It must be feasible, and unbeatable only among allowed moves", "Its gradient must be exactly zero", "It must lie at a corner of the feasible region"],
    0,
    "A constrained solution must be feasible and locally unbeatable by allowed moves.",
    ["Correct. The gradient may be non-zero if every improving direction leaves the feasible set.", "That is the unconstrained condition; constraints relax it.", "Corners matter for linear programs, not in general."],
  ),

  // ---------------------------------------------------------------
  // ML · Module 1.3 — Probability
  // ---------------------------------------------------------------
  "py.atom.ml.sample-spaces-events": q(
    "What has to be defined before any probability can be assigned?",
    ["The set of possible outcomes and the event of interest", "The number of experiments you will run", "The mean of the distribution"],
    0,
    "Define outcomes and the event first, then assign weights.",
    ["Correct. Without a sample space there is nothing for probability to be about.", "Repetition is about estimation, not definition.", "A mean presupposes a distribution already defined."],
  ),
  "py.atom.ml.conditional-independence": q(
    "What does independence of A and B actually assert?",
    ["Knowing B occurred leaves the probability of A unchanged", "A and B cannot both occur", "A and B have equal probability"],
    0,
    "Independence means conditioning does not change the probability.",
    ["Correct. The restriction to B's world leaves A's proportion untouched.", "That is mutual exclusivity, which is a different idea entirely.", "Equal probability has nothing to do with independence."],
  ),
  "py.atom.ml.bayes-guided": q(
    "Which quantity most often surprises people in a Bayes calculation?",
    ["The base rate, which can make a positive result mostly false alarms", "The likelihood, which is usually ignored", "The posterior, which always equals the likelihood"],
    0,
    "Normalize by every possible path to the evidence.",
    ["Correct. A rare condition means healthy false positives outnumber true ones.", "The likelihood is exactly what people over-weight.", "They coincide only when the prior is uniform and the evidence balanced."],
  ),
  "py.atom.ml.random-variables-guided": q(
    "What distinguishes a discrete random variable from a continuous one?",
    ["Discrete assigns mass to individual values; continuous assigns density over ranges", "Discrete variables are always integers", "Continuous variables cannot be summarized"],
    0,
    "A random variable maps outcomes to numbers; discrete models assign mass to values.",
    ["Correct. A single point has zero probability under a density.", "The values could be any distinct labels mapped to numbers.", "They have means and variances just like discrete ones."],
  ),
  "py.atom.ml.expectation-variance-covariance": q(
    "Two variables have covariance zero. What can you conclude?",
    ["They have no linear relationship, but may still be dependent", "They are independent", "One of them is constant"],
    0,
    "Covariance measures joint linear movement, not dependence in general.",
    ["Correct. A symmetric non-linear relationship can have exactly zero covariance.", "Independence implies zero covariance, but not the reverse.", "A constant gives zero covariance, but it is not the only cause."],
  ),
  "py.atom.ml.key-distributions": q(
    "You count how many of 100 emails are spam. Which distribution matches?",
    ["Binomial — a fixed number of independent binary trials", "Bernoulli — a single binary result", "Gaussian — an unbounded continuous value"],
    0,
    "Match support and generation to the distribution.",
    ["Correct. Each email is a trial and you are counting successes.", "Bernoulli describes one email, not the count across 100.", "The count is discrete and bounded between 0 and 100."],
  ),
  "py.atom.ml.gaussian-guided": q(
    "Two features are measured in different units. Why do z-scores help?",
    ["They re-express both in standard deviations, making them comparable", "They remove all outliers", "They make both features Gaussian"],
    0,
    "A z-score expresses distance from the mean in units of spread.",
    ["Correct. Scale differences disappear once everything is measured in its own spread.", "Outliers remain; they simply get large z-scores.", "Standardizing shifts and scales but does not change the distribution's shape."],
  ),
  "py.atom.ml.joint-marginal-conditional": q(
    "What is lost when you marginalize a joint distribution?",
    ["The relationship between the variables", "The total probability mass", "The shape of the remaining variable"],
    0,
    "Joint is the full relationship; marginal sums a variable away.",
    ["Correct. Two very different joints can share identical marginals.", "Mass is preserved — the marginal still sums to one.", "The remaining variable's own distribution is exactly what survives."],
  ),
  "py.atom.ml.multivariate-gaussian": q(
    "What does an off-diagonal entry in a covariance matrix control?",
    ["The tilt of the cloud — how the two variables co-vary", "The center of the cloud", "The number of samples"],
    0,
    "A mean vector locates the cloud; the covariance sets spread and tilt.",
    ["Correct. Zero off-diagonals give an axis-aligned cloud.", "Location is entirely the mean vector's job.", "Sample count is not part of the distribution at all."],
  ),
  "py.atom.ml.monte-carlo-guided": q(
    "You quadruple your Monte Carlo samples. What happens to the standard error?",
    ["It halves, because error falls with the square root of n", "It quarters", "It is unchanged"],
    0,
    "Report standard error, and remember Monte Carlo converges slowly.",
    ["Correct. Dividing by sqrt(4) means a factor of two, which is why precision is expensive.", "That would be true if error fell linearly, which it does not.", "More samples genuinely do reduce the error."],
  ),
  "py.atom.ml.mle-map": q(
    "You observe three heads in three flips. What does MLE estimate, and why is MAP often preferred?",
    ["MLE says p = 1; MAP's prior pulls it off that extreme", "MLE says p = 0.5; MAP agrees", "Both refuse to give an estimate"],
    0,
    "MLE chooses the parameter best explaining the data; MAP adds prior preference.",
    ["Correct. MLE overfits tiny samples, and a prior regularizes that away.", "MLE follows the data exactly, which here means one.", "Both produce estimates; they simply differ."],
  ),

  // ---------------------------------------------------------------
  // ML · Module 1.4 — Statistics & information theory
  // ---------------------------------------------------------------
  "py.atom.ml.estimators-guided": q(
    "Why does dividing squared deviations by n underestimate the population variance?",
    ["Deviations are measured from the sample's own mean, which sits closest to the data", "Because n is always too large", "Because outliers are excluded"],
    0,
    "The estimand is the target, the estimator is the rule; bias is a property of the rule.",
    ["Correct. The sample mean minimizes those squared deviations, so they are too small.", "The issue is which centre was used, not the size of n.", "No values are excluded from the calculation."],
  ),
  "py.atom.ml.descriptive-correlation": q(
    "Income data is heavily skewed by a few very high earners. Which summary should you report?",
    ["The median, which outliers cannot drag", "The mean, which uses every value", "The maximum, which shows the range"],
    0,
    "Use summaries that match the data's shape.",
    ["Correct. A handful of extreme values barely move the middle observation.", "The mean is exactly what those earners distort.", "One extreme value is not a summary of the distribution."],
  ),
  "py.atom.ml.large-numbers-clt": q(
    "What does the central limit theorem describe, that the law of large numbers does not?",
    ["The shape of the sampling distribution of the mean", "That averages converge at all", "That data is normally distributed"],
    0,
    "Large numbers explains convergence; the central limit theorem explains the shape.",
    ["Correct. It says the mean's own distribution approaches a Gaussian.", "Convergence is precisely the law of large numbers.", "The underlying data need not be Gaussian at all."],
  ),
  "py.atom.ml.tests-intervals": q(
    "What does a 95% confidence interval actually claim?",
    ["The procedure captures the true value in 95% of repeated experiments", "There is a 95% chance the true value is in this interval", "95% of the data falls inside it"],
    0,
    "Confidence is long-run procedure coverage.",
    ["Correct. The guarantee is about the method, not about this one interval.", "That is the common misreading; the true value is fixed, not random.", "It describes the parameter, not the spread of the data."],
  ),
  "py.atom.ml.bootstrap-sampling": q(
    "Why must a bootstrap resample be drawn *with* replacement?",
    ["Without it every resample would be the original sample reordered", "It makes the computation faster", "It removes outliers automatically"],
    0,
    "Resample observational units with replacement, then recompute the whole statistic.",
    ["Correct. Repetition and omission are what create variation between resamples.", "Speed is unaffected by the sampling scheme.", "Outliers can appear multiple times in a resample."],
  ),
  "py.atom.ml.entropy-guided": q(
    "Which distribution over four outcomes has the highest entropy?",
    ["All four equally likely", "One outcome with probability 0.97", "Two outcomes at 0.5 and two at 0"],
    0,
    "Entropy is probability-weighted average surprise.",
    ["Correct. Maximum uncertainty means every outcome is equally unpredictable.", "Near-certainty carries almost no surprise.", "That collapses to a fair coin, which is one bit rather than two."],
  ),
  "py.atom.ml.cross-entropy-kl": q(
    "Why is minimizing cross-entropy equivalent to minimizing KL divergence during training?",
    ["They differ only by the data's own entropy, which the model cannot change", "They are numerically identical", "KL is undefined for real data"],
    0,
    "Cross-entropy evaluates model probabilities with reality's frequencies.",
    ["Correct. That fixed offset shifts the loss but never moves the optimum.", "They differ by a constant unless the data has zero entropy.", "KL is well defined wherever the model assigns non-zero probability."],
  ),
  "py.atom.ml.mutual-information": q(
    "Two features are related by a perfect U-shape. What do correlation and mutual information report?",
    ["Correlation near zero, mutual information clearly positive", "Both near zero", "Both large and positive"],
    0,
    "Mutual information measures general dependence, not just linear.",
    ["Correct. This is exactly the dependence a correlation coefficient misses.", "The variables are strongly dependent, which MI detects.", "Correlation only captures the linear part, which cancels here."],
  ),
  "py.atom.ml.multiple-testing-power": q(
    "You test 20 hypotheses at alpha 0.05 with nothing real present. What should you expect?",
    ["About one significant result purely by chance", "No significant results", "All twenty significant"],
    0,
    "Define the family, then correct the decision rule.",
    ["Correct. That is precisely why a family-wide correction is needed.", "Each test still has a 5% chance of a false alarm.", "False positives arrive at the alpha rate, not universally."],
  ),

  // ---------------------------------------------------------------
  // ML · Module 1.1 — Linear algebra
  // ---------------------------------------------------------------
  "py.atom.ml.vector-operations": q(
    "A gradient-descent step computes `weights - rate * gradient`. Which vector operations are those?",
    ["Scaling a vector, then subtracting it coordinate by coordinate", "A dot product followed by a norm", "A matrix multiplication"],
    0,
    "Every basic vector operation acts on matching coordinates independently.",
    ["Correct. The entire update is scale-then-add, done per coordinate.", "Both of those collapse a vector to a single number, which an update cannot do.", "No matrix appears; both operands are vectors."],
  ),
  "py.atom.ml.dot-product-geometry": q(
    "Two non-zero vectors have a dot product of zero. What does that say geometrically?",
    ["They are perpendicular", "They point the same way", "One of them has zero length"],
    0,
    "Algebra calls the dot product a weighted sum; geometry calls it aligned length.",
    ["Correct. Zero alignment means a right angle between them.", "Same direction gives the largest possible positive value.", "Both were stated to be non-zero."],
  ),
  "py.atom.ml.norm-families": q(
    "Why does L1 regularization drive weights exactly to zero while L2 usually does not?",
    ["L1's penalty keeps a constant pull toward zero, L2's shrinks as the weight shrinks", "L1 is computed faster", "L2 cannot be differentiated"],
    0,
    "A norm defines what vector size means, and each norm penalizes differently.",
    ["Correct. The constant pull can reach zero exactly; a vanishing pull only approaches it.", "Speed has nothing to do with the shape of the solution.", "L2 is the smoother of the two and is differentiable everywhere."],
  ),
  "py.atom.ml.matrices": q(
    "A matrix has shape (10, 3). What does each dimension mean for a matrix-vector product?",
    ["It maps a 3-feature input to a 10-number output", "It maps a 10-feature input to a 3-number output", "It requires the input to have 10 features"],
    0,
    "Columns match input features; rows produce outputs.",
    ["Correct. Columns pair with the input, and each of the 10 rows gives one output.", "That is the transpose's behaviour.", "Ten is the output count, not the input requirement."],
  ),
  "py.atom.ml.matrix-multiplication": q(
    "You multiply shapes (4, 5) and (5, 2). What is the result's shape?",
    ["(4, 2)", "(5, 5)", "(4, 5)"],
    0,
    "For (m, n) and (n, p), the inner n values pair up and the result is (m, p).",
    ["Correct. The shared 5 is consumed, leaving the outer dimensions.", "The inner dimension disappears; it never becomes the shape.", "That is the left operand unchanged."],
  ),
  "py.atom.ml.transpose-identity-inverse": q(
    "When does a square matrix fail to have an inverse?",
    ["When it collapses space, shown by a zero determinant", "Whenever it is not symmetric", "Whenever it contains a zero entry"],
    0,
    "An inverse exists only when nothing is destroyed by the mapping.",
    ["Correct. Collapsed dimensions cannot be recovered, so no inverse exists.", "Plenty of non-symmetric matrices are invertible.", "The identity contains zeros and inverts perfectly."],
  ),
  "py.atom.ml.span-basis-rank": q(
    "A feature matrix has 5 columns but rank 3. What does that tell you?",
    ["Two columns are redundant combinations of the others", "Two rows contain missing values", "The matrix cannot be used for training"],
    0,
    "Independence removes redundant directions; rank counts what survives.",
    ["Correct. Only three directions are genuinely independent — the rest add no information.", "Rank is about linear dependence, not missing data.", "It trains fine; the redundancy mainly makes the solution non-unique."],
  ),
  "py.atom.ml.eigenvectors": q(
    "What makes a vector an eigenvector of a matrix?",
    ["The matrix leaves its direction line unchanged and only rescales it", "The matrix maps it to the zero vector", "It has unit length"],
    0,
    "An eigenvector keeps its direction line; the eigenvalue records the scaling.",
    ["Correct. Any rotation off that line disqualifies it.", "That is the null space, which is the eigenvalue-zero case only.", "Eigenvectors can be scaled to any length and stay eigenvectors."],
  ),
  "py.atom.ml.determinant-trace": q(
    "A 2x2 matrix has determinant 0. What has it done to the plane?",
    ["Collapsed it onto a line or a point", "Rotated it without distortion", "Doubled every area"],
    0,
    "The determinant measures signed volume scaling and detects collapse.",
    ["Correct. Zero area scaling means a whole dimension was flattened away.", "A pure rotation has determinant 1.", "Doubling areas would give determinant 2."],
  ),
  "py.atom.ml.svd": q(
    "Why does discarding the smallest singular values usually lose little information?",
    ["They correspond to the weakest directions, often noise rather than signal", "They are always exactly zero", "They correspond to the first rows of the data"],
    0,
    "SVD orders directions by stretch strength, so truncation drops the weakest.",
    ["Correct. That is exactly the logic behind PCA and low-rank compression.", "They are usually small but non-zero.", "Singular values describe directions, not particular rows."],
  ),
  "py.atom.ml.matrix-decompositions": q(
    "What is the practical point of factoring a matrix into triangular pieces?",
    ["Triangular systems solve directly by substitution", "It reduces the matrix's memory footprint", "It guarantees the matrix is invertible"],
    0,
    "Decompose to expose structure: LU for solves, QR for least squares.",
    ["Correct. The hard general solve becomes a sequence of one-unknown steps.", "The factors together take at least as much space.", "A zero on the diagonal still signals no unique solution."],
  ),
  "py.atom.ml.orthogonality-least-squares": q(
    "In least squares, what is true of the residual at the best fit?",
    ["It is orthogonal to the model space, so no adjustment can reduce it", "It is exactly zero", "It points in the same direction as the prediction"],
    0,
    "Projection finds the closest reachable vector; the leftover is orthogonal.",
    ["Correct. Any remaining alignment would mean a better fit was still available.", "Zero residual only happens when the target already lies in the model space.", "Alignment with the prediction is precisely what has been removed."],
  ),

  // ---------------------------------------------------------------
  // Algo · Part 5 — Graphs
  // ---------------------------------------------------------------
  "py.atom.algo.graph-representations": q(
    "A graph has 100,000 vertices and 200,000 edges. Which representation fits?",
    ["An adjacency list, sized by edges", "An adjacency matrix, sized by vertices squared", "An edge list scanned for every neighbour query"],
    0,
    "Choose storage from the vertex and edge counts, not out of habit.",
    ["Correct. Lists cost O(V + E); the graph is sparse, so that is tiny.", "A matrix would need 10^10 cells for a graph with only 200,000 edges.", "An edge list makes each neighbour lookup a full scan."],
  ),
  "py.atom.algo.grid-graphs": q(
    "What plays the role of an edge in a grid problem?",
    ["An allowed move between two cells", "A wall between two cells", "A row of the grid"],
    0,
    "Coordinates are vertices and allowed moves are edges.",
    ["Correct. Which moves are legal defines the graph's edges entirely.", "A wall is the absence of an edge, or of a vertex.", "A row is just storage, not a connection."],
  ),
  "py.atom.algo.graph-bfs": q(
    "Why is a vertex's distance final the moment BFS discovers it?",
    ["The queue reaches every vertex at distance d before any at d+1", "Because each vertex is enqueued only once", "Because edges are undirected"],
    0,
    "Discovery fixes the shortest unweighted distance.",
    ["Correct. Layers are exhausted in order, so no shorter route can arrive later.", "Enqueuing once is a consequence of that ordering, not the reason.", "It holds for directed graphs too."],
  ),
  "py.atom.algo.graph-dfs": q(
    "Remove the visited check from a DFS on a cyclic graph. What happens?",
    ["It revisits vertices forever around the cycle", "It misses some vertices", "It becomes breadth-first"],
    0,
    "Visited state is what prevents cycles from looping.",
    ["Correct. Nothing stops the traversal going round and round.", "Non-termination is the problem, not incompleteness.", "The order of expansion is unchanged by the check."],
  ),
  "py.atom.algo.graph-components": q(
    "Why must component counting loop over every vertex rather than traversing once?",
    ["A single traversal only reaches one component", "Vertices may repeat in the edge list", "Traversal order affects the count"],
    0,
    "Traverse from each unvisited start and label its entire reachable region.",
    ["Correct. Anything unreachable from the first start needs its own traversal.", "Duplicate edges do not change reachability.", "The count is the same whichever order you use."],
  ),
  "py.atom.algo.graph-cycles": q(
    "Why do directed cycle checks need three states rather than visited or not?",
    ["An edge to a finished vertex is fine; an edge to an active one is a cycle", "Directed graphs may be disconnected", "Two states cannot represent self-loops"],
    0,
    "Directed graphs track active versus finished vertices.",
    ["Correct. Two paths converging on a finished vertex is not a cycle.", "Disconnection is handled by looping over starts, not by extra states.", "A self-loop is caught by either scheme."],
  ),
  "py.atom.algo.graph-bipartite": q(
    "Which graphs are exactly the non-bipartite ones?",
    ["Those containing an odd-length cycle", "Those containing any cycle", "Those that are disconnected"],
    0,
    "A same-colour edge is a contradiction, and only odd cycles force one.",
    ["Correct. Two-colouring always succeeds unless an odd cycle exists.", "Even cycles two-colour perfectly well.", "Disconnected graphs are coloured component by component."],
  ),
  "py.atom.algo.topological-order-guided": q(
    "Kahn's algorithm stops with vertices left over. What does that prove?",
    ["The remaining vertices contain a directed cycle", "The graph is disconnected", "The starting vertex was chosen badly"],
    0,
    "A directed cycle is exactly what makes a topological order impossible.",
    ["Correct. Every leftover vertex still waits on another, which can only be circular.", "Disconnected DAGs still order fine.", "Kahn considers all zero-indegree vertices, so no single start matters."],
  ),
  "py.atom.algo.dsu-foundations": q(
    "What does path compression actually change?",
    ["It flattens the tree so later finds are nearly constant time", "It merges two groups into one", "It reduces the number of groups"],
    0,
    "Find returns a representative; compression flattens the structure it walked.",
    ["Correct. Repointing nodes at the root shortens every future climb.", "That is union's job, not compression's.", "Compression never changes group membership."],
  ),
  "py.atom.algo.dsu-applications": q(
    "During Kruskal, an edge's endpoints already share a representative. What does that mean?",
    ["The edge would close a cycle, so it is skipped", "The edge must be the lightest so far", "The graph is disconnected"],
    0,
    "A failed union exposes a redundant edge.",
    ["Correct. They are already connected, so adding it creates a cycle.", "Weight is unrelated to whether they are already joined.", "It shows the opposite — those two are connected."],
  ),
  "py.atom.algo.strong-components": q(
    "In Kosaraju, why is the second pass run on the reversed graph?",
    ["It confines each traversal to one component instead of leaking onward", "Reversing is faster to traverse", "The first pass destroys the original edges"],
    0,
    "Kosaraju uses finish order plus reversed edges.",
    ["Correct. Reversal blocks the one-way exits that would otherwise merge components.", "Traversal cost is identical either way.", "The first pass only records finish order."],
  ),
  "py.atom.algo.bridges-articulation": q(
    "What does a vertex's low-link value record?",
    ["The oldest discovery time reachable from its subtree", "Its distance from the root", "How many children it has"],
    0,
    "Low-link summarizes the oldest reachable ancestor.",
    ["Correct. Comparing it with the parent's discovery time reveals bridges.", "Depth is tracked separately by discovery order.", "Child count plays no part in the low-link."],
  ),
  "py.atom.algo.dijkstra-guided": q(
    "Why must Dijkstra skip heap entries for vertices already finalized?",
    ["A vertex can be pushed several times and the later entries are stale", "The heap may contain negative weights", "Otherwise the heap never empties"],
    0,
    "Pop the cheapest tentative distance, then skip stale entries.",
    ["Correct. Each improvement pushes a new entry; the old worse ones must be ignored.", "Dijkstra requires non-negative weights in the first place.", "The heap empties either way; the risk is overwriting a final answer."],
  ),
  "py.atom.algo.zero-one-bfs": q(
    "Why can a deque replace a priority queue when weights are only 0 or 1?",
    ["There are just two possible priorities, so front and back suffice", "Zero-weight edges can be ignored", "The graph is always a tree"],
    0,
    "Binary weights need only two priority levels.",
    ["Correct. Front for same-distance, back for one-greater, keeps the order sorted.", "Zero edges matter — they reach a vertex at no extra cost.", "The graph's shape is irrelevant."],
  ),
  "py.atom.algo.bellman-ford-guided": q(
    "Why exactly V - 1 relaxation passes?",
    ["A simple path can use at most V - 1 edges", "It matches the number of edges", "It is an arbitrary safety margin"],
    0,
    "Each pass permits one more path edge, and V - 1 covers simple paths.",
    ["Correct. Any shortest path without a cycle touches at most V vertices.", "The edge count is unrelated to the number of passes.", "The bound is exact, not arbitrary."],
  ),
  "py.atom.algo.floyd-warshall-guided": q(
    "Why must the intermediate vertex be the outermost of the three loops?",
    ["Each round must finish before its results are used as intermediates", "It makes the loop faster", "The matrix is indexed that way"],
    0,
    "Add one allowed intermediate at a time.",
    ["Correct. Moving it inward breaks the invariant and yields wrong distances.", "The operation count is identical whatever the nesting.", "Indexing does not constrain the loop order."],
  ),
  "py.atom.algo.a-star-guided": q(
    "What goes wrong if the heuristic overestimates the true remaining cost?",
    ["A* may return a path that is not the shortest", "A* will never terminate", "A* degrades into breadth-first search"],
    0,
    "Use an admissible heuristic — one that never overestimates.",
    ["Correct. An inflated estimate can make the optimal route look worse and be discarded.", "It still terminates; it simply may be wrong.", "A zero heuristic gives Dijkstra, which is the opposite extreme."],
  ),
  "py.atom.algo.mst-comparison": q(
    "What does the cut property guarantee?",
    ["The lightest edge crossing any cut is safe to add", "Every MST contains the globally lightest edge only", "All MSTs of a graph have the same edges"],
    0,
    "The cut property is why both Prim and Kruskal are correct.",
    ["Correct. That single fact justifies greedily accepting light crossing edges.", "It applies to every cut, not just the global minimum.", "Weights may tie, so several distinct MSTs can exist."],
  ),
  "py.atom.algo.max-flow-guided": q(
    "Why does augmenting add capacity on the reverse edge?",
    ["So a later path can undo part of an earlier, suboptimal choice", "To double the total flow", "To keep the graph undirected"],
    0,
    "Add reverse capacity so the search can reroute.",
    ["Correct. Without it a greedy first path could lock in a non-maximum flow.", "Reverse capacity carries no flow of its own.", "The graph stays directed; the residual edge is bookkeeping."],
  ),
  "py.atom.algo.bipartite-matching-guided": q(
    "What does one augmenting path accomplish?",
    ["It increases the matching size by exactly one", "It matches every remaining vertex", "It proves the matching is maximum"],
    0,
    "Augmenting paths reroute pairs and add one match.",
    ["Correct. Existing pairs shuffle, and one previously unmatched vertex gets matched.", "Only a single new pair results.", "Maximality is proved when no augmenting path exists at all."],
  ),
  "py.atom.algo.euler-hamilton": q(
    "Why is an Eulerian path easy to test for while a Hamiltonian path is not?",
    ["Euler covers edges and has a degree test; Hamilton covers vertices and is NP-complete", "Eulerian paths only exist in trees", "Hamiltonian paths need weighted edges"],
    0,
    "Euler covers edges with degree and connectivity tests; Hamilton covers vertices.",
    ["Correct. Counting odd degrees is linear; no comparable shortcut exists for Hamilton.", "Trees with more than two leaves have no Eulerian path.", "Weights play no part in either definition."],
  ),
  "py.atom.algo.two-sat-guided": q(
    "When is a 2-SAT formula unsatisfiable?",
    ["When a variable and its negation share a strongly connected component", "When it has more clauses than variables", "When any clause repeats a literal"],
    0,
    "Two-SAT fails exactly when a variable and its negation imply each other.",
    ["Correct. Mutual implication forces the variable to be both true and false.", "Clause count alone says nothing about satisfiability.", "A repeated literal simply forces that literal true."],
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

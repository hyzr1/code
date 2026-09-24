import type { LectureQuestion } from "../../types";
import {
  guidedLessonContent,
  guidedMasteryAtom,
  guidedMasteryConcept,
  type GuidedMasterySpec,
} from "./guidedMastery";

const q = (
  question: string,
  choices: [string, string, string],
  answer: 0 | 1 | 2,
  explanation: string,
  why: [string, string, string],
): LectureQuestion => ({ question, choices, answer, explanation, why });

const ALGO_GREEDY_SPECS: GuidedMasterySpec[] = [
  {
    lessonId: "py.ac.m6_2.l1",
    atomId: "py.atom.algo.greedy-choice",
    conceptId: "py.algo.greedy-choice",
    title: "A greedy choice is only safe when you can prove it",
    requires: ["py.algo.search-pruning"],
    vocabulary: [
      ["greedy choice", "the option that looks best from local information"],
      ["greedy-choice property", "the guarantee that some optimal answer contains that choice"],
      ["optimal substructure", "an optimal answer built from optimal answers to smaller cases"],
      ["counterexample", "one input where the greedy rule provably loses"],
    ],
    opening: "Greedy algorithms take the best-looking option and never reconsider. That is either brilliant or badly wrong, and the code cannot tell you which. The property separating the two cases has a name, and checking it is the whole job.",
    outcome: "You will state the greedy-choice property, test a rule against a counterexample, and say why search is the fallback when it fails.",
    why: "Greedy solutions are short, fast, and easy to believe. Interviewers probe them because a confident wrong greedy answer is the most common failure on optimization problems.",
    mentalModel: "Picture climbing a mountain in fog by always stepping uphill. On one smooth peak that works. On a range it strands you on the first bump, with the taller summit hidden behind.",
    firstTitle: "One rule wins on one coin set and loses on another",
    firstIntro: "Take the largest coin that fits, repeatedly. Whether that is optimal depends on the coin set, not on the code.",
    firstCode: `def greedy_coins(coins, amount):
    used = 0
    for coin in sorted(coins, reverse=True):
        used += amount // coin
        amount %= coin
    return used if amount == 0 else None

print("coins 1, 5, 10 making 30:", greedy_coins([1, 5, 10], 30))
print("coins 1, 3, 4 making 6:", greedy_coins([1, 3, 4], 6))
print("but 3 + 3 needs only two coins")`,
    firstTrace: "On the first coin set the greedy count is genuinely minimal. On the second it takes a four, then two ones, for three coins. Two threes would do it in two. The rule never changed, so the property belongs to the instance.",
    secondTitle: "State the property, then hunt a counterexample",
    secondIntro: "The property claims some optimal solution begins with the greedy choice. Testing against brute force on small inputs is the fastest way to find out.",
    secondCode: `from itertools import combinations_with_replacement

def best_count(coins, amount):
    for size in range(1, amount + 1):
        for pick in combinations_with_replacement(coins, size):
            if sum(pick) == amount:
                return size
    return None

for coins in ([1, 5, 10], [1, 3, 4]):
    gaps = [n for n in range(1, 20)
            if greedy_coins(coins, n) != best_count(coins, n)]
    print(coins, "greedy disagrees at", gaps)`,
    secondTrace: "The first coin set produces an empty list, which is evidence the property holds. The second disagrees at six and beyond. One disagreement proves failure, while an empty list is only encouragement.",
    mistake: "Do not accept a greedy rule because it passes the examples in the prompt. Sample cases are chosen to be readable, not adversarial. Search small inputs against brute force, and if you cannot argue the property, use dynamic programming instead.",
    checkpoint: "Your greedy rule agrees with brute force on every input up to size twenty. Is the rule proved correct?",
    checkpointAnswer: "No. Testing shows the absence of a small counterexample, not correctness. A proof needs an argument that some optimal solution always contains the greedy choice, and that what remains is the same problem on a smaller input.",
    remember: "Greedy needs the greedy-choice property and optimal substructure. One counterexample disproves a rule; passing tests never proves it.",
    checks: [
      q("What does the greedy-choice property claim?", ["Some optimal solution contains the greedy choice", "The greedy choice is the only optimal one", "Every choice leads to an optimal solution"], 0, "The property is about existence, not uniqueness.", ["Correct. That is what lets the algorithm commit without regret.", "Several optima may exist; greedy needs only one to agree.", "Most choices lead nowhere near optimal."]),
      q("Greedy coin change fails on the set one, three, four. What does that prove?", ["Safety depends on the instance, not the code", "The algorithm is implemented incorrectly", "Coin change has no optimal solution"], 0, "The same rule succeeds on other coin sets.", ["Correct. Whether greedy is safe is a fact about the input structure.", "The code is fine; the rule is unjustified for that set.", "An optimal answer exists; greedy simply misses it."]),
      q("What is the right fallback when the property cannot be argued?", ["Dynamic programming or exhaustive search", "A larger set of test cases", "Sorting the input differently"], 0, "Without the property, committing early is unsound.", ["Correct. Those methods reconsider choices instead of committing.", "More tests still cannot establish correctness.", "Reordering does not create a property that is absent."]),
    ],
  },
  {
    lessonId: "py.ac.m6_2.l2",
    atomId: "py.atom.algo.greedy-exchange",
    conceptId: "py.algo.greedy-exchange",
    title: "An exchange argument turns a hunch into a proof",
    requires: ["py.algo.greedy-choice"],
    vocabulary: [
      ["exchange argument", "reshaping any optimal answer toward the greedy one"],
      ["inversion", "an adjacent pair ordered against the greedy rule"],
      ["swap", "exchanging that pair without making the answer worse"],
      ["schedule", "an ordering of jobs whose cost depends on that order"],
    ],
    opening: "Proving a greedy rule sounds harder than it is. The standard technique takes any optimal answer, finds one place where it disagrees with greedy, and swaps that pair. If the swap never hurts, greedy is optimal.",
    outcome: "You will run an exchange argument on a scheduling rule, identify an inversion, and explain why a never-worse swap finishes the proof.",
    why: "Exchange arguments are the expected justification when an interviewer asks why your rule works. They are short, which makes them practical to give out loud.",
    mentalModel: "Think of straightening a necklace one twist at a time. Each twist you undo leaves it no worse, and there are finitely many twists, so you always reach the untwisted version.",
    firstTitle: "Shortest job first minimizes total waiting",
    firstIntro: "Jobs run one at a time. Each job waits for everything queued in front, so a long job at the front delays everybody behind it.",
    firstCode: `def total_wait(durations):
    elapsed = 0
    waiting = 0
    for duration in durations:
        waiting += elapsed
        elapsed += duration
    return waiting

print("longest first:", total_wait([10, 5, 1]))
print("shortest first:", total_wait([1, 5, 10]))
print("mixed order:", total_wait([5, 1, 10]))`,
    firstTrace: "Sorting by shortest duration gives the smallest total. Putting the ten-unit job in front charges its full length to both jobs behind it. A job costs the schedule not its own length, but how much it delays everyone else.",
    secondTitle: "Swap one inversion and watch the cost fall",
    secondIntro: "The proof needs only adjacent pairs. If a longer job sits directly in front of a shorter one, swapping them changes nothing else.",
    secondCode: `def swap_at(order, index):
    swapped = list(order)
    swapped[index], swapped[index + 1] = swapped[index + 1], swapped[index]
    return swapped

order = [5, 1, 10]
better = swap_at(order, 0)
print(order, "costs", total_wait(order))
print(better, "costs", total_wait(better))
print("improvement:", total_wait(order) - total_wait(better))`,
    secondTrace: "Only the two swapped jobs move, so every other job keeps its wait. The saving is exactly the difference in their durations. Any schedule holding an inversion can be improved, so an optimal schedule holds none.",
    mistake: "Do not argue by swapping distant elements. Moving a job across others changes their waits too, and the bookkeeping usually hides an error. Restrict the argument to adjacent pairs, where everything except those two positions provably stays fixed.",
    checkpoint: "An exchange argument shows a swap makes the answer no worse, rather than strictly better. Is that enough?",
    checkpointAnswer: "Yes. The goal is to reshape some optimal solution into the greedy one without losing optimality. A never-worse swap preserves optimality at every step. Requiring strict improvement would wrongly rule out ties.",
    remember: "Take an optimal answer, find an adjacent pair disagreeing with the greedy rule, and swap it. If the swap is never worse, greedy is optimal.",
    checks: [
      q("Why does an exchange argument use adjacent pairs?", ["Swapping neighbours leaves every other position untouched", "Adjacent elements are easier to find", "Distant swaps are forbidden by the problem"], 0, "The proof needs everything else to stay fixed.", ["Correct. That isolation makes the cost change calculable.", "Ease of location is not the reason.", "Distant swaps are legal but much harder to reason about."]),
      q("A swap leaves the cost unchanged. Does the argument still work?", ["Yes, never-worse is sufficient", "No, it must strictly improve", "Only if no ties exist"], 0, "The proof preserves optimality rather than improving it.", ["Correct. Ties simply mean several optimal orderings exist.", "Strict improvement would fail whenever two options are equal.", "Ties are common and cause no problem."]),
      q("In shortest-job-first, what does a job actually cost the schedule?", ["The delay it adds to every job behind it", "Its own duration", "The time it spends waiting"], 0, "Total waiting sums how long each job sits queued.", ["Correct. That is why short jobs belong at the front.", "Its own duration is paid regardless of position.", "Its own wait is only one term of the total."]),
    ],
  },
  {
    lessonId: "py.ac.m6_2.l3",
    atomId: "py.atom.algo.interval-scheduling",
    conceptId: "py.algo.interval-scheduling",
    title: "Sorting by the right boundary makes the choice safe",
    requires: ["py.algo.greedy-exchange", "py.algo.sort-keys-comparators"],
    vocabulary: [
      ["interval", "a task with a start and an end"],
      ["compatible", "two intervals that do not overlap"],
      ["earliest finish", "taking whichever compatible task ends soonest"],
      ["merge", "combining overlapping intervals into one span"],
    ],
    opening: "Interval problems are where greedy earns its reputation. The trap is that several sort orders look reasonable and only one is provably correct, so the whole difficulty sits in choosing the key.",
    outcome: "You will select the earliest-finishing compatible interval, explain why start time and duration fail, and merge overlapping spans in one pass.",
    why: "Scheduling, calendars, resource allocation, and range consolidation are the same two algorithms. They appear constantly in interviews because a wrong sort key produces plausible, wrong output.",
    mentalModel: "Picture booking a meeting room for one day. Whenever you pick the meeting that frees the room soonest, you leave the largest possible block of the day still open.",
    firstTitle: "Earliest finish keeps the most room free",
    firstIntro: "Sort by end time, then walk forward taking any task starting at or after the last one taken finished.",
    firstCode: `def most_tasks(intervals):
    chosen = []
    finish = float("-inf")
    for start, end in sorted(intervals, key=lambda pair: pair[1]):
        if start >= finish:
            chosen.append((start, end))
            finish = end
    return chosen

tasks = [(0, 6), (1, 2), (3, 4), (5, 7)]
print("by earliest finish:", most_tasks(tasks))
print("count:", len(most_tasks(tasks)))`,
    firstTrace: "The long task from zero to six starts first but ends last, so it is considered last and rejected. Three short tasks fit instead. Sorting by start time would take that long task immediately and settle for one.",
    secondTitle: "Merging asks a different question, so it sorts differently",
    secondIntro: "Selection maximizes a count and sorts by end. Merging consolidates coverage and sorts by start, extending the current span whenever the next one touches it.",
    secondCode: `def merge(intervals):
    merged = []
    for start, end in sorted(intervals, key=lambda pair: pair[0]):
        if merged and start <= merged[-1][1]:
            merged[-1] = (merged[-1][0], max(merged[-1][1], end))
        else:
            merged.append((start, end))
    return merged

print(merge([(1, 3), (2, 6), (8, 10)]))
print(merge([(1, 4), (4, 5)]))`,
    secondTrace: "Sorting by start means an overlap can only involve the span most recently kept. Taking the larger end matters because one interval may sit entirely inside another. The touching pair merges, since an end equal to the next start still counts as contact.",
    mistake: "Do not reuse the selection sort key for merging, or the merge key for selection. Sorting by duration is wrong for both: a short task placed awkwardly can block more than a long one, and duration says nothing about where spans overlap.",
    checkpoint: "Why does sorting by earliest finish beat sorting by shortest duration when selecting the most tasks?",
    checkpointAnswer: "Finishing soonest leaves the maximum remaining time for everything unscheduled, which is exactly the resource being competed for. A short task can sit across the boundary of two others and block both, so brevity does not measure how much of the day a task consumes.",
    remember: "Select the most tasks by sorting on end time and taking each compatible one. Merge coverage by sorting on start time and extending the current span.",
    checks: [
      q("Which sort key maximizes the number of compatible tasks?", ["Earliest finishing time", "Earliest starting time", "Shortest duration"], 0, "Finishing soonest preserves the most remaining time.", ["Correct. It is the only one of the three with a valid exchange argument.", "An early start can run very long and block everything.", "A short task can straddle two others and block both."]),
      q("When merging, why compare against only the most recently kept interval?", ["Sorting by start means any overlap must involve it", "Everything before it was discarded", "The input is guaranteed disjoint"], 0, "Start-order makes the last kept span the only candidate.", ["Correct. Anything before it ends no later and cannot reach the new start.", "Those spans were kept, not discarded.", "The input may overlap heavily; that is the point."]),
      q("Merging the spans one to four and four to five produces what?", ["A single span from one to five", "Two separate spans", "A span from one to four"], 0, "Touching intervals count as overlapping here.", ["Correct. An end equal to the next start is contact, so they combine.", "They are not disjoint under this convention.", "The later end must be carried into the merged span."]),
    ],
  },
  {
    lessonId: "py.ac.m6_2.l4",
    atomId: "py.atom.algo.huffman-coding",
    conceptId: "py.algo.huffman-coding",
    title: "Huffman merges the two lightest symbols, repeatedly",
    requires: ["py.algo.interval-scheduling", "py.algo.binary-heap"],
    vocabulary: [
      ["prefix code", "a code where no word starts another word"],
      ["frequency", "how often a symbol occurs in the text"],
      ["merge step", "combining two nodes into one carrying their total weight"],
      ["weighted length", "the average bits per symbol under a given code"],
    ],
    opening: "Fixed-width codes spend the same bits on a symbol appearing once and one appearing a thousand times. Huffman fixes that with a single greedy rule applied until one tree remains, and the result is provably optimal.",
    outcome: "You will run the merge loop, explain why the rarest symbols end up deepest, and compute the weighted length of a code.",
    why: "Huffman is the clearest greedy proof in common use and appears in compression everywhere. It also shows a greedy rule driven by a heap rather than a sort, which is a distinct shape worth recognizing.",
    mentalModel: "Picture building a tree upward from the leaves. The two lightest nodes join, and their combined weight rejoins the pool. Rare symbols join early, which pushes them furthest from the root and gives them the longest codes.",
    firstTitle: "Merge the two lightest until one node remains",
    firstIntro: "A heap keeps the two lightest available in log time, and each merge reduces the pool by exactly one node.",
    firstCode: `import heapq

def huffman_lengths(frequencies):
    if len(frequencies) == 1:
        return {symbol: 1 for symbol in frequencies}
    heap = [(weight, index, {symbol})
            for index, (symbol, weight) in enumerate(frequencies.items())]
    heapq.heapify(heap)
    depth = {symbol: 0 for symbol in frequencies}
    counter = len(heap)
    while len(heap) > 1:
        left_weight, _, left = heapq.heappop(heap)
        right_weight, _, right = heapq.heappop(heap)
        for symbol in left | right:
            depth[symbol] += 1
        heapq.heappush(heap, (left_weight + right_weight, counter, left | right))
        counter += 1
    return depth

print(huffman_lengths({"a": 45, "b": 13, "c": 12, "d": 16, "e": 9, "f": 5}))`,
    firstTrace: "Every merge adds one bit to each symbol underneath it, so a symbol merged early collects the most bits. The two rarest join first and end up longest, while the most frequent joins last and receives a single bit. The counter only breaks ties so equal weights never compare sets.",
    secondTitle: "Compare the weighted length against fixed width",
    secondIntro: "The payoff is average bits per symbol, weighted by how often each symbol actually appears.",
    secondCode: `import math

frequencies = {"a": 45, "b": 13, "c": 12, "d": 16, "e": 9, "f": 5}
lengths = huffman_lengths(frequencies)
total = sum(frequencies.values())

huffman_bits = sum(frequencies[s] * lengths[s] for s in frequencies)
fixed_width = math.ceil(math.log2(len(frequencies)))
fixed_bits = total * fixed_width

print("huffman bits:", huffman_bits)
print("fixed width bits:", fixed_bits)
print("saving:", round(100 * (1 - huffman_bits / fixed_bits)), "percent")`,
    secondTrace: "Six symbols need three bits each under a fixed code. Huffman spends one bit on the symbol covering nearly half the text and four on the rarest, cutting the total by roughly a quarter. The saving grows as the distribution becomes more skewed.",
    mistake: "Do not merge by symbol count or alphabetical order. Only total weight makes the greedy choice safe, because the exchange argument depends on the two lightest nodes being placeable deepest at no cost. Ties may be broken arbitrarily, but weight decides the pairing.",
    checkpoint: "Why does the most frequent symbol always end up with the shortest code?",
    checkpointAnswer: "Because it is the last to be merged. Each merge adds one bit to every symbol beneath it, so a symbol that avoids merging until the end collects the fewest bits. Its high weight keeps it out of the two-lightest pair for as long as possible.",
    remember: "Repeatedly merge the two lightest nodes and push their combined weight back. Rare symbols merge early and sit deepest, giving a provably optimal prefix code.",
    checks: [
      q("Which two nodes does each Huffman step merge?", ["The two with the smallest weights", "The two with the longest codes", "The first two alphabetically"], 0, "Weight is the only thing making the choice safe.", ["Correct. That pairing is what the exchange argument justifies.", "Code lengths are an output, not an input to the choice.", "Alphabetical order carries no information about frequency."]),
      q("Why do rare symbols receive the longest codes?", ["They merge earliest, so more merges sit above them", "They are alphabetically last", "Their codes are padded to equal length"], 0, "Every merge above a symbol adds one bit.", ["Correct. Merging early means collecting the most bits.", "Ordering by name is irrelevant.", "Huffman codes are deliberately variable length."]),
      q("What makes a Huffman code decodable without separators?", ["No code word is a prefix of another", "Every code word has the same length", "Symbols are stored alongside the text"], 0, "The tree structure guarantees the prefix property.", ["Correct. Only leaves carry symbols, so no path stops halfway.", "Lengths deliberately differ.", "The code table is separate from the encoded stream."]),
    ],
  },
  {
    lessonId: "py.ac.m6_2.l5",
    atomId: "py.atom.algo.greedy-pitfalls",
    conceptId: "py.algo.greedy-pitfalls",
    title: "Know the shapes where greedy reliably fails",
    requires: ["py.algo.huffman-coding"],
    vocabulary: [
      ["capacity constraint", "a limit that makes choices compete for room"],
      ["ratio heuristic", "ranking items by value per unit of cost"],
      ["fractional relaxation", "the easier version where items may be split"],
      ["global dependency", "a cost that depends on the whole chosen set"],
    ],
    opening: "Greedy fails in recognizable ways. Two shapes cover most cases: a hard capacity that makes choices compete for room, and a cost depending on the whole set rather than one item. Recognizing the shape is faster than rediscovering the failure.",
    outcome: "You will explain why the ratio rule breaks under a hard capacity, identify when a problem needs dynamic programming, and say what fractional relaxation changes.",
    why: "Knowing where greedy fails is what stops a confident wrong answer under pressure. It is also the moment to switch approach, and the switch is usually to dynamic programming.",
    mentalModel: "Picture filling a rucksack with a strict weight limit. The best value per kilogram guides you well until one heavy item would have filled the bag perfectly. Greedy already spent the room and cannot give it back.",
    firstTitle: "Value per weight loses when the bag must fill exactly",
    firstIntro: "Ranking by ratio is the natural greedy rule for knapsack. One capacity constraint is enough to break it.",
    firstCode: `def greedy_knapsack(items, capacity):
    taken = 0
    for value, weight in sorted(items, key=lambda i: i[0] / i[1], reverse=True):
        if weight <= capacity:
            taken += value
            capacity -= weight
    return taken

items = [(60, 10), (100, 20), (120, 30)]
print("greedy value:", greedy_knapsack(items, 50))
print("best is 100 + 120 = 220 using weight 50")`,
    firstTrace: "The first item has the best ratio, so greedy takes it and spends ten units of room. That leaves forty units, enough for only one of the rest. Committing to the best ratio cost access to the pair that exactly fills the bag.",
    secondTitle: "Reconsidering choices recovers the optimum",
    secondIntro: "Dynamic programming keeps every capacity open rather than committing, which is precisely what greedy refused to do.",
    secondCode: `def best_knapsack(items, capacity):
    best = [0] * (capacity + 1)
    for value, weight in items:
        for room in range(capacity, weight - 1, -1):
            best[room] = max(best[room], best[room - weight] + value)
    return best[capacity]

items = [(60, 10), (100, 20), (120, 30)]
print("greedy:", greedy_knapsack(items, 50))
print("dynamic programming:", best_knapsack(items, 50))`,
    secondTrace: "The table records the best value for every capacity, so no decision is final until the last item is considered. That is the cost of correctness: greedy runs in sorting time, while the table costs capacity times item count.",
    mistake: "Do not assume the fractional version's rule carries over. Allowing items to be split makes the ratio rule provably optimal, and that success is often mistaken for a proof about the whole-item problem. Indivisibility is exactly what breaks it.",
    checkpoint: "Greedy solves fractional knapsack optimally but fails the whole-item version. What single difference explains that?",
    checkpointAnswer: "Splitting items means leftover capacity is never wasted, so taking the best ratio first can always be topped up with a fraction of the next item. When items are indivisible, committing to a high ratio can strand capacity that nothing remaining fits, and greedy cannot reclaim it.",
    remember: "Greedy fails under hard capacity constraints and whenever a cost depends on the whole chosen set. Recognize the shape and switch to dynamic programming.",
    checks: [
      q("Why does the ratio rule fail on whole-item knapsack?", ["Committing early can strand capacity nothing else fits", "The ratio is expensive to compute", "Sorting is unstable"], 0, "Indivisibility is what breaks the rule.", ["Correct. The bag cannot be topped up with a fraction of an item.", "Computing a ratio is trivial.", "Stability has no bearing on the outcome."]),
      q("What does allowing fractional items change?", ["Leftover capacity can always be filled, so greedy becomes optimal", "The problem becomes harder", "The ratio rule stops applying"], 0, "Fractional relaxation restores the greedy-choice property.", ["Correct. That is why the two versions have different answers.", "It is strictly easier than the whole-item version.", "The ratio rule is exactly what works there."]),
      q("Greedy fails on a problem. What is the usual next approach?", ["Dynamic programming, which reconsiders choices", "A different sort key", "More aggressive pruning"], 0, "The failure is committing too early.", ["Correct. Keeping options open is what greedy would not do.", "No key restores a property the problem lacks.", "Pruning speeds a search; it does not fix an unsound rule."]),
    ],
  },
];

export const ALGO_GREEDY_ATOMS = ALGO_GREEDY_SPECS.map(guidedMasteryAtom);
export const ALGO_GREEDY_CONCEPTS = ALGO_GREEDY_SPECS.map(guidedMasteryConcept);
export const ALGO_GREEDY_LESSON_CONTENT = guidedLessonContent(ALGO_GREEDY_SPECS);

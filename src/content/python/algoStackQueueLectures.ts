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

const ALGO_STACK_QUEUE_SPECS: GuidedMasterySpec[] = [
  {
    lessonId: "py.ac.m2_4.l1",
    atomId: "py.atom.algo.stack-guided",
    conceptId: "py.algo.stack-guided",
    title: "A stack exposes the newest unfinished item",
    requires: ["py.algo.window-hash-map", "py.stack"],
    vocabulary: [
      ["stack", "a structure that removes the most recently added item first"],
      ["LIFO", "last in, first out"],
      ["push", "add one item to the top"],
      ["pop", "remove and return the top item"],
    ],
    opening: "A stack is useful when the newest unfinished job must be handled first. Python lists implement this order with `append` and `pop` at the end.",
    outcome: "You will be able to recognize LIFO problems, validate nested brackets, and evaluate an expression whose operators follow their operands.",
    why: "Stacks power function calls, undo history, parsing, depth-first search, expression evaluation, and monotonic algorithms. The important choice is processing order.",
    mentalModel: "Picture a pile of cafeteria trays. You place a tray on top and take a tray from the top. Reaching a deeper tray requires removing the newer trays first.",
    firstTitle: "Match nested brackets",
    firstIntro: "An opening bracket becomes unfinished work. A closing bracket must match the newest unfinished opening bracket.",
    firstCode: `def valid_brackets(text):
    openings = []
    expected_opening = {")": "(", "]": "[", "}": "{"}

    for character in text:
        if character in "([{":
            openings.append(character)
        elif not openings or openings.pop() != expected_opening[character]:
            return False
    return not openings

print(valid_brackets("([]{})"))
print(valid_brackets("([)]"))`,
    firstTrace: "Each opening bracket is pushed. A closing bracket pops and checks the newest opening. `([)]` fails when the closing parenthesis meets the square opening. The final empty-stack check catches unclosed brackets.",
    secondTitle: "Evaluate reverse Polish notation",
    secondIntro: "Numbers are pushed. An operator pops its right operand, then its left operand, computes one result, and pushes that result.",
    secondCode: `def evaluate_rpn(tokens):
    stack = []
    for token in tokens:
        if token not in {"+", "-", "*"}:
            stack.append(int(token))
            continue
        right = stack.pop()
        left = stack.pop()
        if token == "+":
            stack.append(left + right)
        elif token == "-":
            stack.append(left - right)
        else:
            stack.append(left * right)
    return stack.pop()

print(evaluate_rpn(["3", "4", "+", "2", "*"]))`,
    secondTrace: "Push three and four. Plus pops four then three and pushes seven. Push two. Multiply pops two and seven, then pushes fourteen. Operand order matters for subtraction.",
    mistake: "Do not pop before checking that the stack contains what the operation needs. Also do not reverse left and right operands for subtraction or division.",
    checkpoint: "Why does bracket matching compare a closing bracket with the stack top rather than searching the whole stack?",
    checkpointAnswer: "Nesting requires the newest unmatched opening to close first. Any older opening is still wrapped around it. A match deeper in the stack would cross bracket boundaries and be invalid.",
    remember: "Choose a stack when the newest unfinished item must be resolved first. Push creates work; pop resolves the top work item.",
    checks: [
      q("What access order does a stack provide?", ["Last in, first out", "First in, first out", "Smallest value first"], 0, "The top is the newest item.", ["Correct. Push and pop use one end.", "That is queue order.", "A heap exposes an extreme value."]),
      q("Why pop right before left in RPN?", ["The top value was written most recently", "Addition requires it", "Stacks sort operands"], 0, "The later operand sits on top.", ["Correct. Then noncommutative order remains left operator right.", "Subtraction also needs this order.", "Stacks preserve insertion order, not sorted order."]),
    ],
  },
  {
    lessonId: "py.ac.m2_4.l2",
    atomId: "py.atom.algo.queue-deque-guided",
    conceptId: "py.algo.queue-deque-guided",
    title: "Queues and deques control both ends",
    requires: ["py.algo.stack-guided"],
    vocabulary: [
      ["queue", "a structure that removes the oldest added item first"],
      ["FIFO", "first in, first out"],
      ["deque", "a double-ended queue with efficient operations at both ends"],
      ["ring buffer", "bounded queue storage that wraps indices around a fixed array"],
    ],
    opening: "A queue is fair to arrival order: the oldest waiting item leaves first. Python's `deque` supports that order without shifting every remaining item.",
    outcome: "You will be able to use a deque as a queue, choose the correct end operation, and explain how a bounded ring buffer reuses storage.",
    why: "Queues power breadth-first search, task scheduling, message processing, rate limits, and streaming buffers. End-operation cost matters when n is large.",
    mentalModel: "Picture a checkout line. New people join the right end and the oldest person leaves the left end. A deque also allows controlled entry or exit at either door.",
    firstTitle: "Process jobs in arrival order",
    firstIntro: "Append new work on the right and use `popleft` for the oldest work. Both operations are expected constant time.",
    firstCode: `from collections import deque

jobs = deque(["compile", "test"])
jobs.append("deploy")

while jobs:
    current = jobs.popleft()
    print("running", current)`,
    firstTrace: "Compile leaves first, then test, then deploy. Using `list.pop(0)` would shift every remaining reference. `deque.popleft()` is designed for this boundary operation.",
    secondTitle: "Build a tiny bounded ring buffer",
    secondIntro: "A deque with `maxlen` drops the oldest item when a new item arrives after capacity is full.",
    secondCode: `from collections import deque

recent = deque(maxlen=3)
for event in ["A", "B", "C", "D", "E"]:
    recent.append(event)
    print(event, list(recent))`,
    secondTrace: "After A, B, and C, the buffer is full. Adding D drops A. Adding E drops B. The deque keeps exactly the three most recent events without growing memory.",
    mistake: "Do not use a Python list as a high-volume FIFO queue with `pop(0)`. Front removal is theta n because all remaining items shift. Use `collections.deque`.",
    checkpoint: "Which deque operations implement a normal FIFO queue if new tasks arrive on the right?",
    checkpointAnswer: "Use `append` to add at the right and `popleft` to remove from the left. The oldest task remains closest to the left boundary.",
    remember: "A queue serves the oldest item. A deque makes both boundaries efficient, and a bounded deque can act like a fixed recent-history buffer.",
    checks: [
      q("Which operation removes the oldest item from a right-appended deque?", ["popleft", "pop", "appendleft"], 0, "The oldest item waits on the left.", ["Correct. This gives FIFO order.", "Pop removes the newest right item.", "Appendleft adds an item."]),
      q("Why avoid list.pop(0) for a large queue?", ["It shifts the remaining values", "Lists cannot store tasks", "It removes the newest item"], 0, "Front removal changes every later index.", ["Correct. The operation is linear.", "Lists store arbitrary objects.", "It removes the oldest but does so inefficiently."]),
    ],
  },
  {
    lessonId: "py.ac.m2_4.l3",
    atomId: "py.atom.algo.monotonic-stack-guided",
    conceptId: "py.algo.monotonic-stack-guided",
    title: "A monotonic stack keeps only unresolved candidates",
    requires: ["py.algo.queue-deque-guided", "py.monotonic-stack"],
    vocabulary: [
      ["monotonic stack", "a stack whose stored values follow one increasing or decreasing order"],
      ["next greater", "the first later value larger than the current value"],
      ["unresolved candidate", "an index still waiting for a future value that answers its question"],
      ["amortized", "an average cost across a sequence of operations"],
    ],
    opening: "Scanning right for every next-greater answer repeats work. A monotonic stack keeps unresolved indices. A new larger value resolves them from the top.",
    outcome: "You will be able to compute next-greater positions in linear time, state the stack order, and prove why the inner pop loop is not quadratic.",
    why: "Monotonic stacks solve temperatures, spans, histogram rectangles, visible buildings, and boundary problems. Their power comes from permanently removing dominated candidates.",
    mentalModel: "Picture people waiting to see the first taller person who arrives. Shorter people at the top leave when a taller person appears. Anyone still waiting remains in decreasing height order.",
    firstTitle: "Find the next greater value",
    firstIntro: "Store indices in decreasing value order. The current value answers every smaller index exposed at the top.",
    firstCode: `def next_greater(values):
    answer = [-1] * len(values)
    stack = []

    for index, value in enumerate(values):
        while stack and values[stack[-1]] < value:
            smaller_index = stack.pop()
            answer[smaller_index] = value
        stack.append(index)
    return answer

print(next_greater([2, 1, 2, 4, 3]))`,
    firstTrace: "Two waits. One waits above it. The next two resolves one but not equal two. Four resolves both twos. Three never finds a larger later value. The answer is `[4,2,4,-1,-1]`.",
    secondTitle: "Return distance instead of value",
    secondIntro: "Daily temperatures asks how many positions until a warmer value. Store indices so subtraction gives distance.",
    secondCode: `def days_until_warmer(temperatures):
    waits = [0] * len(temperatures)
    stack = []
    for day, temperature in enumerate(temperatures):
        while stack and temperatures[stack[-1]] < temperature:
            cold_day = stack.pop()
            waits[cold_day] = day - cold_day
        stack.append(day)
    return waits

print(days_until_warmer([73, 74, 75, 71, 69, 72, 76]))`,
    secondTrace: "Each stored day waits unresolved. A warmer day pops colder days and records the index difference. Days with no warmer future keep zero.",
    mistake: "Do not store values when the answer needs positions or distances. Also choose strict or non-strict popping carefully; equal values count as greater only if the prompt says so.",
    checkpoint: "Why can the while loop pop many items at one index without making total time theta n squared?",
    checkpointAnswer: "Each index is pushed once and popped at most once across the entire run. A burst of pops spends work that cannot happen again for those indices, so total stack operations are theta n.",
    remember: "The monotonic stack holds unresolved indices in a useful order. Each new value resolves dominated top candidates exactly once.",
    checks: [
      q("What does the stack contain in next-greater processing?", ["Unresolved indices", "Every answer already finished", "Values in original order forever"], 0, "Only candidates waiting for a larger future value remain.", ["Correct. Resolved indices are popped permanently.", "Finished candidates leave the stack.", "Popping changes which indices remain."]),
      q("Why is total time theta n?", ["Each index is pushed and popped at most once", "The while loop runs once", "Values are hash keys"], 0, "Charge each pop to its unique index.", ["Correct. Total stack operations are linear.", "One iteration may pop several indices.", "Hashing is not used."]),
    ],
  },
  {
    lessonId: "py.ac.m2_4.l4",
    atomId: "py.atom.algo.monotonic-deque-guided",
    conceptId: "py.algo.monotonic-deque-guided",
    title: "A monotonic deque tracks a moving maximum",
    requires: ["py.algo.monotonic-stack-guided", "py.algo.fixed-window-guided"],
    vocabulary: [
      ["monotonic deque", "a deque whose candidate values stay ordered"],
      ["dominated candidate", "a value that cannot win any future relevant comparison"],
      ["expired index", "an index that has moved outside the active window"],
      ["window maximum", "the greatest value inside one active window"],
    ],
    opening: "A fixed window sum can subtract its outgoing value. A maximum cannot be repaired that simply. A monotonic deque keeps the few values still capable of becoming a window maximum.",
    outcome: "You will be able to compute every sliding-window maximum in linear time and explain both kinds of removal: dominated and expired.",
    why: "This pattern handles streaming extremes, signal peaks, scheduling bounds, and range optimization. It combines window boundaries with monotonic candidate elimination.",
    mentalModel: "Picture a line of championship contenders ordered from strongest to weakest. A stronger newcomer removes weaker people behind it. The oldest contender leaves when the moving eligibility window passes them.",
    firstTitle: "Maintain decreasing candidate values",
    firstIntro: "Store indices. Remove expired indices from the left and dominated smaller values from the right. The left index is always the maximum.",
    firstCode: `from collections import deque

def sliding_maximum(values, k):
    candidates = deque()
    result = []

    for right, value in enumerate(values):
        while candidates and candidates[0] <= right - k:
            candidates.popleft()
        while candidates and values[candidates[-1]] <= value:
            candidates.pop()
        candidates.append(right)
        if right >= k - 1:
            result.append(values[candidates[0]])
    return result

print(sliding_maximum([1, 3, -1, -3, 5, 3, 6, 7], 3))`,
    firstTrace: "Three removes one because three is newer and larger. Later, five removes all smaller candidates behind it. The leftmost candidate always holds the greatest active value. Results are `[3,3,5,5,6,7]`.",
    secondTitle: "Inspect candidate indices step by step",
    secondIntro: "Printing the deque reveals that it stores neither every window value nor every historical maximum.",
    secondCode: `from collections import deque

values = [4, 2, 12, 3]
candidates = deque()
for right, value in enumerate(values):
    while candidates and values[candidates[-1]] <= value:
        candidates.pop()
    candidates.append(right)
    print(right, list(candidates), [values[i] for i in candidates])`,
    secondTrace: "Four remains when two arrives. Twelve removes both because neither can beat a newer twelve in a future shared window. Three stays behind twelve as a possible maximum after twelve expires.",
    mistake: "Do not store only values when expiry depends on position. Duplicate values at different indices expire at different times. Indices provide both value lookup and boundary checks.",
    checkpoint: "Why may a new value remove smaller values from the deque's right end permanently?",
    checkpointAnswer: "The new value is both larger and newer. In every future window containing an older smaller candidate, the new value is also present and wins. The older candidate can never become maximum again.",
    remember: "Remove expired candidates from the left, dominated candidates from the right, and read the active maximum from the left.",
    checks: [
      q("Where is the current maximum stored?", ["At the deque's left end", "At the deque's right end", "Outside the deque"], 0, "Candidate values decrease from left to right.", ["Correct. The strongest active candidate leads.", "The right end holds newer, smaller candidates.", "The deque explicitly tracks it."]),
      q("Why store indices instead of only values?", ["Indices reveal expiry", "Indices make values sorted", "Deque cannot store numbers"], 0, "Window membership depends on position.", ["Correct. An index can be compared with the left boundary.", "Ordering comes from the maintenance rule.", "A deque stores arbitrary objects."]),
    ],
  },
  {
    lessonId: "py.ac.m2_4.l5",
    atomId: "py.atom.algo.stack-queue-conversions",
    conceptId: "py.algo.stack-queue-conversions",
    title: "Two structures can simulate another access order",
    requires: ["py.algo.monotonic-deque-guided"],
    vocabulary: [
      ["simulation", "recreating one structure's behavior with different allowed operations"],
      ["input stack", "the stack receiving newly enqueued values"],
      ["output stack", "the stack serving the oldest queued values"],
      ["lazy transfer", "moving values only when the serving structure is empty"],
    ],
    opening: "A queue and a stack differ only in removal order. Two reversals can turn newest-first stack order into oldest-first queue order. The efficient version transfers values lazily.",
    outcome: "You will be able to implement a queue with two stacks, explain amortized constant-time operations, and contrast it with a stack built from queues.",
    why: "Conversion problems test whether you understand access guarantees instead of memorizing method names. The same lazy-transfer idea appears in buffering and batching systems.",
    mentalModel: "Picture pouring a stack of plates into a second pile. The order reverses. The oldest plate reaches the top of the serving pile and can leave first.",
    firstTitle: "Build a queue from two stacks",
    firstIntro: "Push into the input stack. Before serving, transfer only when the output stack is empty.",
    firstCode: `class TwoStackQueue:
    def __init__(self):
        self.input = []
        self.output = []

    def push(self, value):
        self.input.append(value)

    def pop(self):
        if not self.output:
            while self.input:
                self.output.append(self.input.pop())
        if not self.output:
            raise IndexError("pop from empty queue")
        return self.output.pop()

queue = TwoStackQueue()
for value in ["A", "B", "C"]:
    queue.push(value)
print(queue.pop(), queue.pop())`,
    firstTrace: "A, B, and C enter the input stack. The first pop transfers them, reversing order so A is on the output top. A leaves, then B. No second transfer is needed while output still has values.",
    secondTitle: "Build a stack from one queue",
    secondIntro: "After pushing a new value, rotate all older values behind it. The newest value then waits at the queue front.",
    secondCode: `from collections import deque

class OneQueueStack:
    def __init__(self):
        self.items = deque()

    def push(self, value):
        self.items.append(value)
        for _ in range(len(self.items) - 1):
            self.items.append(self.items.popleft())

    def pop(self):
        if not self.items:
            raise IndexError("pop from empty stack")
        return self.items.popleft()

stack = OneQueueStack()
for value in ["A", "B", "C"]:
    stack.push(value)
print(stack.pop(), stack.pop())`,
    secondTrace: "Each push rotates the newcomer to the front. After A, B, C, the queue order is C, B, A. Pops therefore return C then B, matching LIFO behavior.",
    mistake: "Do not transfer the two-stack queue on every pop or push. Lazy transfer prevents repeated reversal. Also define empty behavior instead of allowing a confusing low-level error.",
    checkpoint: "Why is a two-stack queue pop amortized O(1) even though one pop may transfer theta n items?",
    checkpointAnswer: "Each value moves into the input stack once, transfers to the output stack once, and leaves once. Across many operations, each item pays only constant total stack work.",
    remember: "Reversal changes access order. Transfer lazily so each value crosses structures only a constant number of times.",
    checks: [
      q("When should a two-stack queue transfer input to output?", ["Only when output is empty and service is needed", "After every push", "After every pop even when output has values"], 0, "Lazy transfer avoids repeated reversals.", ["Correct. Existing output order remains valid.", "That wastes work and can disturb service order.", "No transfer is needed while output can serve."]),
      q("Why is queue pop amortized O(1)?", ["Each item transfers at most once", "Transfer never loops", "The stacks are sorted"], 0, "Spread transfer cost across the items moved.", ["Correct. Total work over many items is linear.", "One transfer can loop through many items.", "Sorting is not involved."]),
    ],
  },
];

export const ALGO_STACK_QUEUE_ATOMS = ALGO_STACK_QUEUE_SPECS.map(guidedMasteryAtom);
export const ALGO_STACK_QUEUE_CONCEPTS = ALGO_STACK_QUEUE_SPECS.map(guidedMasteryConcept);
export const ALGO_STACK_QUEUE_LESSON_CONTENT = guidedLessonContent(ALGO_STACK_QUEUE_SPECS);

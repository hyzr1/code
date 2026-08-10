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

const ALGO_FOUNDATION_SPECS: GuidedMasterySpec[] = [
  {
    lessonId: "py.ac.m1_2.l1",
    atomId: "py.atom.algo.call-stack",
    conceptId: "py.algo.call-stack",
    title: "The call stack, one frame at a time",
    requires: ["py.algo.analysis-cases", "py.recursion"],
    vocabulary: [
      ["call stack", "the ordered pile of function calls that have started but not finished"],
      ["frame", "one call's private parameters, local names, and return location"],
      ["push", "place a new frame on top when a function is called"],
      ["pop", "remove the top frame when that call returns"],
    ],
    opening: "Recursion is ordinary function calling. The only unusual part is that a function calls another copy of itself. We will slow the process down until every call has a visible place to wait.",
    outcome: "You will be able to draw the frames for a recursive call, say which frame runs next, and explain why local variables from different calls do not collide.",
    why: "A recursive function can look as if several lines run at once. They do not. Python runs only the top frame. Every older frame waits with its own unfinished work. This model explains returned values, recursion depth, and stack-overflow errors.",
    mentalModel: "Picture a stack of cafeteria trays. A new function call places a tray on top. Only the top tray is usable. Returning removes that tray, reveals the tray underneath, and gives the waiting call its answer.",
    firstTitle: "Watch three factorial calls",
    firstIntro: "Factorial multiplies a number by the factorial below it. The base case stops at one. Use the tiny input three so every frame fits in your head.",
    firstCode: `def factorial(n):
    if n == 1:
        return 1
    smaller = factorial(n - 1)
    return n * smaller

print(factorial(3))`,
    firstTrace: "The first frame has `n = 3` and pauses at `factorial(2)`. A second frame has `n = 2` and pauses at `factorial(1)`. The top frame has `n = 1`, returns `1`, and is popped. The `n = 2` frame resumes, returns `2 * 1`, and is popped. The first frame resumes and returns `3 * 2`, so the output is `6`.",
    secondTitle: "Prove that local names belong to frames",
    secondIntro: "Each call below has a local name called `label`. The names match, but they live in separate frames.",
    secondCode: `def countdown(number):
    label = f"frame {number}"
    print("enter", label)
    if number > 1:
        countdown(number - 1)
    print("leave", label)

countdown(3)`,
    secondTrace: "The enter lines print `3, 2, 1` while frames are pushed. The leave lines print `1, 2, 3` while frames are popped. When frame one changes or reads `label`, it cannot touch the `label` stored in frame two or three.",
    mistake: "Do not imagine that the recursive call restarts the older frame. It creates a new frame. The older frame stays paused on the exact line that requested the call.",
    checkpoint: "When `factorial(4)` reaches its base case, how many factorial frames exist, and which value returns first?",
    checkpointAnswer: "Four frames exist for `n = 4, 3, 2, 1`. The `n = 1` frame is on top, so it returns `1` first. The other results are built while the stack unwinds.",
    remember: "A recursive call pushes a separate frame. A return pops one frame and resumes the caller exactly where it was waiting.",
    checks: [
      q("Which frame is Python actively executing?", ["The oldest frame", "The frame on top", "Every frame at once"], 1, "Only the top frame runs; the rest wait.", ["The oldest frame is usually waiting below newer calls.", "Correct. The call stack follows last in, first out order.", "Python does not execute all ordinary frames simultaneously."]),
      q("Why can two recursive calls both have a local name `n`?", ["Each call owns a separate frame", "Python renames one variable", "They share one changing global"], 0, "Every call has private parameter and local bindings.", ["Correct. Matching names in different frames are separate bindings.", "Python does not secretly rename the source code.", "Parameters are local unless the program explicitly uses shared state."]),
    ],
  },
  {
    lessonId: "py.ac.m1_2.l2",
    atomId: "py.atom.algo.recurrences",
    conceptId: "py.algo.recurrences",
    title: "Recurrence relations without scary symbols",
    requires: ["py.algo.call-stack"],
    vocabulary: [
      ["recurrence", "an equation that describes a problem using smaller copies of itself"],
      ["base cost", "the work done by the smallest case"],
      ["recursive cost", "the work delegated to smaller calls"],
      ["non-recursive work", "the work one frame performs outside its recursive calls"],
    ],
    opening: "A recurrence is a receipt for recursive work. It says how many smaller calls we buy and how much extra work this frame performs. We will translate code into English before writing any symbols.",
    outcome: "You will be able to read a recursive function, separate its own work from its child calls, and write a recurrence that counts the total.",
    why: "Loop counting stops being enough when work branches into function calls. A recurrence keeps us honest. It prevents guesses such as “recursion is exponential” when a function actually makes only one smaller call.",
    mentalModel: "Imagine a family bill. One parent pays a small local charge and also pays the bills of its children. The recurrence records the local charge plus each child bill. The base case is the family member with no children.",
    firstTitle: "One smaller call means a chain",
    firstIntro: "This function visits one shorter prefix each time. Printing and subtracting take constant work in our model.",
    firstCode: `def count_down(n):
    if n == 0:
        return
    print(n)
    count_down(n - 1)

count_down(4)`,
    firstTrace: "For a positive `n`, one frame does constant local work and asks for `T(n - 1)`. We write `T(n) = T(n - 1) + constant`. The base is `T(0) = constant`. Expanding gives one frame per number, so the total grows linearly: Θ(n).",
    secondTitle: "Two half-size calls form a tree",
    secondIntro: "Now one frame creates two children. Slicing also copies values, so the frame performs work proportional to its current input length.",
    secondCode: `def recursive_sum(values):
    if len(values) <= 1:
        return sum(values)
    middle = len(values) // 2
    left = recursive_sum(values[:middle])
    right = recursive_sum(values[middle:])
    return left + right

print(recursive_sum([1, 2, 3, 4]))`,
    secondTrace: "A size-`n` call creates two calls of size `n / 2`. Its slicing work is Θ(n). The receipt is `T(n) = 2T(n / 2) + Θ(n)`. There are logarithmically many levels, and each level handles Θ(n) values, giving Θ(n log n) with these copying slices.",
    mistake: "Do not count only the number of recursive calls. Include the work each frame does. Slicing, loops, sorting, and copying can dominate an otherwise small-looking recurrence.",
    checkpoint: "A function makes one call on `n - 1` and runs a loop of length `n` in every frame. What recurrence describes it?",
    checkpointAnswer: "It is `T(n) = T(n - 1) + Θ(n)`. Expanding adds `n + (n - 1) + ... + 1`, so the total is Θ(n²), not Θ(n).",
    remember: "Write a recurrence as child-call cost plus this frame's own work. Count both parts before solving anything.",
    checks: [
      q("What does the `2` mean in `T(n) = 2T(n/2) + n`?", ["Two calls of half size", "A loop that runs twice", "Two base cases"], 0, "The coefficient counts recursive children.", ["Correct. This frame delegates to two half-size calls.", "A constant-size loop would belong in the non-recursive term.", "Base cases are described separately."]),
      q("Which recurrence matches one smaller call plus a length-n loop?", ["T(n)=T(n-1)+n", "T(n)=2T(n/2)+1", "T(n)=T(n-1)+1"], 0, "The child costs T(n-1), and the loop costs n.", ["Correct. Both the child and local loop appear.", "That describes two half-size calls.", "That forgets the length-n loop."]),
    ],
  },
  {
    lessonId: "py.ac.m1_2.l3",
    atomId: "py.atom.algo.recursion-trees",
    conceptId: "py.algo.recursion-trees",
    title: "Recursion trees: draw the work",
    requires: ["py.algo.recurrences"],
    vocabulary: [
      ["recursion tree", "a drawing with one node for every recursive call"],
      ["level", "calls that are the same number of edges away from the first call"],
      ["branching factor", "how many child calls one non-base call creates"],
      ["depth", "how many call levels exist before reaching a base case"],
    ],
    opening: "A recurrence can feel like compressed code. A recursion tree opens it up. Every call becomes a box, every child call becomes an arrow, and every box receives a label for its local work.",
    outcome: "You will be able to draw the first levels, count the work on each level, and add the levels to estimate total time.",
    why: "The drawing reveals repeated subproblems and expensive levels. It explains why naive Fibonacci explodes, why merge sort stays controlled, and where memoization saves work.",
    mentalModel: "Picture a company org chart. The first call is the manager. Child calls are direct reports. A level is one row of employees. Total work is the sum of every employee's local task.",
    firstTitle: "See repeated Fibonacci calls",
    firstIntro: "Naive Fibonacci asks for two overlapping smaller answers. The tiny input five already repeats the same questions.",
    firstCode: `def fib(n):
    if n <= 1:
        return n
    return fib(n - 1) + fib(n - 2)

print(fib(5))`,
    firstTrace: "The root `fib(5)` creates `fib(4)` and `fib(3)`. The `fib(4)` branch also creates another `fib(3)`. Farther down, `fib(2)` appears several times. The number of calls grows roughly like a branching tree, so the running time is exponential.",
    secondTitle: "Count merge-style work by level",
    secondIntro: "This version passes boundaries instead of copying slices. Each call combines two half-size answers with constant local work.",
    secondCode: `def range_sum(values, start, stop):
    if stop - start <= 1:
        return values[start] if start < stop else 0
    middle = (start + stop) // 2
    left = range_sum(values, start, middle)
    right = range_sum(values, middle, stop)
    return left + right

print(range_sum([1, 2, 3, 4], 0, 4))`,
    secondTrace: "The tree has one root, then two calls, then four base calls. The number of nodes doubles while each range halves. Every value reaches one leaf, and the tree contains fewer than `2n` total nodes. Constant work per node gives Θ(n) time.",
    mistake: "Do not multiply depth by the root's work without checking other levels. The number of nodes and work per node can change from one level to the next.",
    checkpoint: "If every call creates two children until the input size reaches one, how deep is the tree when the input size is eight?",
    checkpointAnswer: "The sizes are `8, 4, 2, 1`, so there are four rows of calls and three splits. The split count is `log₂(8) = 3`.",
    remember: "Draw calls as nodes, label local work, total one level at a time, and then add the levels.",
    checks: [
      q("What does one node in a recursion tree represent?", ["One function call", "One line of source code", "One input value only"], 0, "A node represents one active or completed call.", ["Correct. Child nodes are the calls it creates.", "A call can execute several source lines.", "One call may handle many values."]),
      q("What warning sign appears in naive Fibonacci's tree?", ["The same inputs appear repeatedly", "Every node has one child", "The tree has constant depth"], 0, "Repeated identical subproblems create wasted work.", ["Correct. Memoization can reuse those answers.", "Most non-base nodes have two children.", "Depth grows with n."]),
    ],
  },
  {
    lessonId: "py.ac.m1_2.l4",
    atomId: "py.atom.algo.recursion-vs-iteration",
    conceptId: "py.algo.recursion-vs-iteration",
    title: "Recursion and iteration are two ways to store unfinished work",
    requires: ["py.algo.recursion-trees"],
    vocabulary: [
      ["iteration", "repetition controlled by a loop"],
      ["implicit stack", "frames Python manages automatically for recursive calls"],
      ["explicit stack", "a list or deque your code manages itself"],
      ["stack overflow", "failure caused by creating more nested frames than the runtime allows"],
    ],
    opening: "Recursion is not automatically slow. Both methods remember unfinished work. The difference is who manages that memory: Python's call stack or your variables and containers.",
    outcome: "You will be able to convert a simple recursive process into a loop and choose the clearer safe form for a problem.",
    why: "Interview solutions often begin recursively because the idea is clear, then become iterative to avoid deep call stacks. Tree and graph traversals make this tradeoff especially visible.",
    mentalModel: "Recursion hands sticky notes to Python. Iteration keeps the sticky notes on your own desk. The notes contain the work that must happen later.",
    firstTitle: "The same factorial in two forms",
    firstIntro: "Both functions multiply the numbers from one through `n`. One stores pending multiplication in frames. The other stores the running product in a variable.",
    firstCode: `def factorial_recursive(n):
    if n <= 1:
        return 1
    return n * factorial_recursive(n - 1)

def factorial_iterative(n):
    product = 1
    for value in range(2, n + 1):
        product *= value
    return product

print(factorial_recursive(5), factorial_iterative(5))`,
    firstTrace: "Recursion creates five frames for input five. Iteration keeps one frame and changes `product` through `2, 6, 24, 120`. Both take Θ(n) time. The loop uses constant extra space; recursion uses Θ(n) frames.",
    secondTitle: "Replace recursive DFS with your own stack",
    secondIntro: "A stack lets a loop remember which graph nodes still need processing. Reversing neighbors preserves the left-to-right order used by the recursive version.",
    secondCode: `def depth_first(graph, start):
    stack = [start]
    visited = set()
    order = []
    while stack:
        node = stack.pop()
        if node in visited:
            continue
        visited.add(node)
        order.append(node)
        stack.extend(reversed(graph[node]))
    return order

graph = {"A": ["B", "C"], "B": [], "C": []}
print(depth_first(graph, "A"))`,
    secondTrace: "The stack begins with `A`. Popping `A` records it and pushes `C` then `B`. Because a stack removes the most recent item, `B` is processed next. The result is `['A', 'B', 'C']`. The explicit stack can grow with the frontier but does not consume recursive call depth.",
    mistake: "Do not claim iteration always uses constant space. An iterative graph traversal can still store Θ(n) nodes. Only the factorial loop reduced the remembered state to one running value.",
    checkpoint: "Why might an iterative DFS succeed on a very deep chain when recursive DFS raises `RecursionError`?",
    checkpointAnswer: "The iterative version stores pending nodes in a heap-allocated Python list. It keeps one function frame. Recursive DFS creates one nested frame per node and can exceed Python's recursion limit.",
    remember: "Choose recursion for a naturally recursive explanation and iteration when explicit state is clearer, safer, or easier to control.",
    checks: [
      q("Where does recursive factorial store unfinished multiplications?", ["In call frames", "In a queue", "Nowhere"], 0, "Each waiting frame remembers its n value and return point.", ["Correct. The call stack holds the pending work.", "Factorial does not need FIFO order.", "The work must be stored somewhere."]),
      q("Does iterative code always use O(1) extra space?", ["Yes", "No", "Only in Python"], 1, "Explicit stacks, queues, and result containers may grow with input.", ["A loop can manage a large container.", "Correct. Iteration changes who stores state, not whether state exists.", "This principle is language-independent."]),
    ],
  },
  {
    lessonId: "py.ac.m1_2.l5",
    atomId: "py.atom.algo.tail-recursion",
    conceptId: "py.algo.tail-recursion",
    title: "Tail recursion and Python's deliberate limit",
    requires: ["py.algo.recursion-vs-iteration"],
    vocabulary: [
      ["tail call", "a function call that is the final action before returning"],
      ["accumulator", "a parameter carrying the result built so far"],
      ["tail-call optimization", "reusing one frame for a final recursive call"],
      ["traceback", "the chain of frames Python reports when an error occurs"],
    ],
    opening: "Some languages can turn a special recursive shape into a loop. Python intentionally does not. We will recognize the shape, understand the design choice, and write the safe Python version.",
    outcome: "You will be able to identify a tail call, explain why Python still grows the stack, and replace tail recursion with a loop.",
    why: "A learner may rewrite recursion into tail-recursive form and expect constant space. That expectation is wrong in Python. Knowing this prevents production crashes on large inputs.",
    mentalModel: "A tail call is a relay runner handing off the baton with no work left to do. An optimizing language lets the next runner reuse the same lane marker. Python keeps every runner's frame so tracebacks remain simple and predictable.",
    firstTitle: "Move factorial's work into an accumulator",
    firstIntro: "The recursive call is the final expression. Nothing remains to multiply after it returns, so this is tail-recursive code.",
    firstCode: `def factorial_tail(n, product=1):
    if n <= 1:
        return product
    return factorial_tail(n - 1, product * n)

print(factorial_tail(5))`,
    firstTrace: "The states are `(5,1)`, `(4,5)`, `(3,20)`, `(2,60)`, and `(1,120)`. The accumulator holds the answer-so-far. Python still creates a frame for every call. The result is `120`, but extra space remains Θ(n).",
    secondTitle: "Write the frame-reusing loop yourself",
    secondIntro: "The loop updates the same two names instead of asking Python to create another frame.",
    secondCode: `def factorial_loop(n):
    product = 1
    while n > 1:
        product *= n
        n -= 1
    return product

print(factorial_loop(5))`,
    secondTrace: "One frame changes `(n, product)` through the same states as the tail-recursive function. Time is Θ(n), and extra space is Θ(1). This is the direct Python translation of tail recursion.",
    mistake: "Do not increase Python's recursion limit as the normal fix for an iterative job. A higher limit postpones failure and can risk the native stack. Use a loop or explicit container.",
    checkpoint: "Is `return n * factorial(n - 1)` a tail call? Explain the work that remains.",
    checkpointAnswer: "No. After `factorial(n - 1)` returns, the current frame must still multiply that answer by `n`. The recursive call is not the final action.",
    remember: "Python does not optimize tail calls. Tail-recursive code still uses one frame per call, so use a loop when depth can grow.",
    checks: [
      q("Which line is tail-recursive?", ["return visit(next_node)", "return 1 + visit(next_node)", "value = visit(next_node)"], 0, "The call itself is the final returned action.", ["Correct. No work remains after the child returns.", "The addition still has to happen afterward.", "Assignment means the caller resumes after the call."]),
      q("What is tail-recursive factorial's extra-space cost in Python?", ["Θ(1)", "Θ(log n)", "Θ(n)"], 2, "Python keeps one frame per recursive call.", ["That would require tail-call optimization.", "The input shrinks by one, not by half.", "Correct. There are n nested frames."]),
    ],
  },
  {
    lessonId: "py.ac.m1_3.l1",
    atomId: "py.atom.algo.constraints",
    conceptId: "py.algo.constraints-method",
    title: "Read constraints before choosing an algorithm",
    requires: ["py.algo.analysis-cases"],
    vocabulary: [
      ["constraint", "a stated limit on input size, values, time, or memory"],
      ["budget", "the rough number of operations or bytes a solution may spend"],
      ["feasible", "small enough to finish within the budget"],
      ["target complexity", "the growth class a solution probably needs"],
    ],
    opening: "The input limit is a clue from the problem author. It tells you which solution families can finish. Read it before falling in love with an approach.",
    outcome: "You will be able to turn a maximum `n` into a rough work budget and reject approaches that cannot scale.",
    why: "Two correct algorithms can behave very differently. For `n = 30`, trying all subsets might be intended. For `n = 100,000`, even checking every pair is usually impossible.",
    mentalModel: "Treat time like a backpack with limited space. An O(n) solution packs one item per input. An O(n²) solution packs every pair. The constraint tells you how large the backpack is.",
    firstTitle: "See why pair checking breaks",
    firstIntro: "This brute-force duplicate check compares every pair. Count the comparisons before judging the short code.",
    firstCode: `def has_duplicate_slow(values):
    for left in range(len(values)):
        for right in range(left + 1, len(values)):
            if values[left] == values[right]:
                return True
    return False

print(has_duplicate_slow([4, 1, 8, 4]))`,
    firstTrace: "With `n` values, the worst case checks about `n(n - 1) / 2` pairs. At `n = 10,000`, that is almost fifty million comparisons. At `n = 100,000`, it is almost five billion. The quadratic shape is the problem, not Python syntax.",
    secondTitle: "Trade memory for a linear scan",
    secondIntro: "A set remembers values already visited. Each new value needs one expected constant-time membership check.",
    secondCode: `def has_duplicate(values):
    seen = set()
    for value in values:
        if value in seen:
            return True
        seen.add(value)
    return False

print(has_duplicate([4, 1, 8, 4]))`,
    secondTrace: "The scan visits four values and stops on the second `4`. Expected time is Θ(n), and extra space is Θ(n). For a large unconstrained list, this is normally the feasible tradeoff.",
    mistake: "Do not use rigid cutoffs as laws. Hardware, language, constants, and time limits matter. Complexity gives a first filter; measurement confirms close decisions.",
    checkpoint: "If `n` can reach one million, which is the safer starting target: O(n), O(n²), or O(2ⁿ)? Why?",
    checkpointAnswer: "O(n) is the safe target because it performs work proportional to one million. Squaring gives one trillion pair positions, and exponential work is far larger.",
    remember: "Constraints are design information. Estimate the work before coding and let the maximum input eliminate impossible approaches.",
    checks: [
      q("About how many pairs exist among 100,000 values?", ["100,000", "About 5 billion", "About 17"], 1, "Pair count is n(n-1)/2.", ["That is linear work, not all pairs.", "Correct. Quadratic work becomes huge quickly.", "Seventeen is near log base two of 100,000."]),
      q("What does an O(n) set solution trade for speed?", ["Extra memory", "Correctness", "A larger exponent"], 0, "The set may store up to n values.", ["Correct. Space often replaces repeated searching.", "The algorithm must remain correct.", "Its time growth is smaller, not larger."]),
    ],
  },
  {
    lessonId: "py.ac.m1_3.l2",
    atomId: "py.atom.algo.examples-first",
    conceptId: "py.algo.examples-first",
    title: "Solve a tiny example before writing code",
    requires: ["py.algo.constraints-method"],
    vocabulary: [
      ["instance", "one concrete input to a general problem"],
      ["state", "the information that matters at one point in the process"],
      ["transition", "the rule that moves from one state to the next"],
      ["counterexample", "an input that proves a proposed rule is wrong"],
    ],
    opening: "Strong problem solvers do not stare at an empty editor and wait for code. They perform the task by hand on a tiny input. Their hand movements expose the state and rules the program needs.",
    outcome: "You will be able to choose useful examples, narrate a manual solution, and turn that narration into variables and updates.",
    why: "Code written before understanding often stores the wrong information. A careful example reveals what changes, what stays true, and where edge cases hide.",
    mentalModel: "Pretend you are a very literal robot. Write down every fact your hand uses. If the robot cannot see a fact, it must be stored in the program's state.",
    firstTitle: "Find the longest run by hand",
    firstIntro: "We want the longest number of equal neighboring values. Watch only what is needed while moving left to right.",
    firstCode: `def longest_run(values):
    if not values:
        return 0
    best = 1
    current = 1
    for index in range(1, len(values)):
        if values[index] == values[index - 1]:
            current += 1
        else:
            current = 1
        best = max(best, current)
    return best

print(longest_run([2, 2, 1, 1, 1, 3]))`,
    firstTrace: "Start with `best = 1` and `current = 1`. The second `2` extends the current run to two. The first `1` breaks it, so current returns to one. The next two ones extend it to three, and best becomes three. The final `3` starts a new run. The answer is `3`.",
    secondTitle: "Use examples that try to break the rule",
    secondIntro: "A single friendly example is not enough. Try an empty input, one value, all equal values, and no equal neighbors.",
    secondCode: `cases = [
    [],
    [7],
    [5, 5, 5],
    [1, 2, 3],
]

for case in cases:
    print(case, longest_run(case))`,
    secondTrace: "The outputs should be `0, 1, 3, 1`. The empty case forces an explicit rule before initialization. The all-equal case tests repeated extension. The no-match case proves `current` resets correctly.",
    mistake: "Do not pick only the example shown in the prompt. It was chosen to explain the goal, not to challenge every assumption in your solution.",
    checkpoint: "For `[4, 4, 2, 2, 2, 2]`, list `(current, best)` after reading each value.",
    checkpointAnswer: "The pairs are `(1,1), (2,2), (1,2), (2,2), (3,3), (4,4)`. The reset at the first `2` is the important transition.",
    remember: "Work a small example as a robot. Name the changing state, the update rule, and examples that could disprove your idea.",
    checks: [
      q("What is a counterexample for a proposed algorithm?", ["An input where it fails", "The largest allowed input only", "A second implementation"], 0, "One failing valid input disproves a universal correctness claim.", ["Correct. It exposes a broken assumption.", "Small inputs can also be counterexamples.", "Another implementation is not itself an input."]),
      q("Why test the empty list before coding is finished?", ["It may change initialization and return rules", "It makes loops faster", "Python requires empty tests"], 0, "Boundary cases influence the algorithm's structure.", ["Correct. Empty input often needs an explicit contract.", "Testing does not change loop speed.", "Python does not require every function to test emptiness."]),
    ],
  },
  {
    lessonId: "py.ac.m1_3.l3",
    atomId: "py.atom.algo.optimize-method",
    conceptId: "py.algo.optimize-method",
    title: "Brute force, bottleneck, better",
    requires: ["py.algo.examples-first"],
    vocabulary: [
      ["brute force", "the simplest correct method that directly checks possibilities"],
      ["bottleneck", "the repeated work responsible for most of the cost"],
      ["precomputation", "work done once so later questions become cheaper"],
      ["tradeoff", "giving up one resource or property to improve another"],
    ],
    opening: "A brute-force solution is not embarrassing. It is a correctness anchor. The improvement comes from pointing to the exact repeated work and replacing it deliberately.",
    outcome: "You will be able to state a brute-force method, calculate its bottleneck, and derive a faster solution instead of guessing a pattern name.",
    why: "Interviewers care about reasoning, not memorized tricks. The path from slow to fast proves that you understand why the final data structure belongs there.",
    mentalModel: "Imagine looking for a phone number. Brute force rereads the whole phone book for every question. The bottleneck is repeated scanning. A lookup table spends memory once so each later question jumps to the answer.",
    firstTitle: "Start with the correct pair search",
    firstIntro: "The direct two-sum method checks every pair. It is easy to explain and easy to verify.",
    firstCode: `def has_pair_slow(values, target):
    for left in range(len(values)):
        for right in range(left + 1, len(values)):
            if values[left] + values[right] == target:
                return True
    return False

print(has_pair_slow([4, 1, 8], 9))`,
    firstTrace: "The code checks `(4,1)`, then `(4,8)`, then `(1,8)`. The final pair succeeds. The bottleneck is searching many possible partners again for every left value. Worst-case time is Θ(n²).",
    secondTitle: "Ask for the one partner you need",
    secondIntro: "For each number, compute its complement. A set answers whether that exact partner appeared already.",
    secondCode: `def has_pair(values, target):
    seen = set()
    for number in values:
        needed = target - number
        if needed in seen:
            return True
        seen.add(number)
    return False

print(has_pair([4, 1, 8], 9))`,
    secondTrace: "At `4`, needed `5` is absent, so store `4`. At `1`, needed `8` is absent, so store `1`. At `8`, needed `1` is present, so return `True`. Expected time becomes Θ(n), while extra space becomes Θ(n).",
    mistake: "Do not optimize before you can state the slow method's cost and bottleneck. A faster-looking rewrite may preserve the same repeated work or silently change the problem.",
    checkpoint: "What exact repeated work does the set remove from the nested-loop solution?",
    checkpointAnswer: "It removes the scan through possible partners. Instead of comparing the current number with many positions, one expected O(1) membership check asks for its exact complement.",
    remember: "Build the simplest correct solution, name the expensive repeated operation, and replace that operation with a justified data structure or precomputation.",
    checks: [
      q("Why write down brute force first?", ["It anchors correctness and exposes the bottleneck", "It must be submitted", "It is always fastest for small inputs"], 0, "The slow method clarifies the search space and comparison point.", ["Correct. It gives the optimization a reason.", "You may replace it before submission.", "It may be acceptable for small inputs, but not always fastest."]),
      q("What resource does the faster two-sum method add?", ["Extra set memory", "More nested loops", "Recursive depth"], 0, "It stores values already visited.", ["Correct. The time improvement costs up to Θ(n) space.", "It removes the nested scan.", "The method is iterative."]),
    ],
  },
  {
    lessonId: "py.ac.m1_3.l4",
    atomId: "py.atom.algo.invariants",
    conceptId: "py.algo.invariants-method",
    title: "An invariant is the promise your loop keeps",
    requires: ["py.algo.optimize-method"],
    vocabulary: [
      ["invariant", "a statement that is true before and after every loop iteration"],
      ["initialization", "showing the invariant is true before the loop starts"],
      ["maintenance", "showing one iteration preserves the invariant"],
      ["termination", "using the invariant when the loop ends to prove the result"],
    ],
    opening: "A loop changes values repeatedly, but one important fact should stay true. Naming that fact turns “the code seems right” into a short correctness proof.",
    outcome: "You will be able to write an invariant in a full sentence and use initialization, maintenance, and termination to justify an algorithm.",
    why: "Invariants guide pointer movement and prevent off-by-one errors. They are especially useful in binary search, partitioning, sliding windows, and graph traversal.",
    mentalModel: "Imagine cleaning a room from left to right. The messy boundary moves, but the promise “everything left of this boundary is clean” remains true. That promise is the invariant.",
    firstTitle: "Keep a sorted pair-search invariant",
    firstIntro: "Two pointers search a sorted list. The invariant says no discarded position can belong to a valid answer.",
    firstCode: `def pair_sum_sorted(values, target):
    left = 0
    right = len(values) - 1
    while left < right:
        total = values[left] + values[right]
        if total == target:
            return (left, right)
        if total < target:
            left += 1
        else:
            right -= 1
    return None

print(pair_sum_sorted([1, 3, 4, 7, 9], 11))`,
    firstTrace: "Start with the entire candidate range. If the sum is too small, pairing the smallest value with anything no larger cannot reach the target, so discarding `left` is safe. If the sum is too large, discarding `right` is safe. The output is `(2, 3)` for `4 + 7`.",
    secondTitle: "State an invariant for a running maximum",
    secondIntro: "After each processed item, `best` should equal the largest value in the processed prefix.",
    secondCode: `def maximum(values):
    if not values:
        raise ValueError("values cannot be empty")
    best = values[0]
    for value in values[1:]:
        if value > best:
            best = value
    return best

print(maximum([4, 9, 2, 7]))`,
    secondTrace: "Initialization is true because the first prefix contains only `4`. Each iteration compares the new value with the old prefix maximum, so `best` becomes the maximum of the larger prefix. At termination the processed prefix is the entire list, so `best` is the answer.",
    mistake: "Do not write an invariant such as “the algorithm is correct.” It must name concrete state and a precise region, set, prefix, or range that the state describes.",
    checkpoint: "For binary search with a half-open range `[low, high)`, what useful invariant can describe the target?",
    checkpointAnswer: "A useful invariant is: if the target exists, its index remains inside `[low, high)`. Every boundary update must preserve that statement.",
    remember: "A good invariant says exactly what the current state means. Prove it before the loop, preserve it once, and use it when the loop ends.",
    checks: [
      q("When must a loop invariant be true?", ["Before and after every iteration", "Only after the final iteration", "Only when the input is sorted"], 0, "The loop relies on the promise at every step.", ["Correct. Initialization and maintenance establish this.", "That is too late to guide intermediate steps.", "Unsorted algorithms also use invariants."]),
      q("Why may two pointers discard the smallest value when the sum is too small?", ["Its best possible current partner is already too small", "The smallest value is always negative", "The target must be even"], 0, "Sorted order proves no smaller partner choice can help that left value.", ["Correct. The right pointer is its largest available partner.", "Values need not be negative.", "Target parity is unrelated."]),
    ],
  },
  {
    lessonId: "py.ac.m1_3.l5",
    atomId: "py.atom.algo.edge-cases",
    conceptId: "py.algo.edge-cases-method",
    title: "Edge cases are input families, not surprises",
    requires: ["py.algo.invariants-method"],
    vocabulary: [
      ["edge case", "a valid input near a boundary where ordinary assumptions may fail"],
      ["input partition", "a family of inputs expected to behave for the same reason"],
      ["contract", "the promised valid inputs, result, and failure behavior"],
      ["sentinel", "a special value used to represent a boundary or missing state"],
    ],
    opening: "Edge cases are not random tricks an interviewer throws at you. Most belong to a small checklist: empty, one item, duplicates, extremes, missing answers, and boundary positions.",
    outcome: "You will be able to partition the input space and choose one test from each family before submitting code.",
    why: "Most interview bugs are not failures of the main idea. They are missing contracts, bad initialization, wrong loop boundaries, or duplicate handling.",
    mentalModel: "Testing one ordinary input is like checking one tile in a bridge. Input partitions identify the different support beams. Test at least one tile resting on each beam.",
    firstTitle: "Make an empty-input contract explicit",
    firstIntro: "A maximum does not exist for an empty list. Returning zero would silently invent a value, so the function raises a clear error.",
    firstCode: `def maximum(values):
    if not values:
        raise ValueError("maximum needs at least one value")
    best = values[0]
    for value in values[1:]:
        best = max(best, value)
    return best

print(maximum([-8, -3, -10]))`,
    firstTrace: "Initializing with zero would incorrectly return zero for all-negative input. Initializing from the first real value respects the contract. The example returns `-3`.",
    secondTitle: "Test boundary positions and duplicates",
    secondIntro: "Binary membership should work when the target is first, last, repeated, absent, or the list is empty.",
    secondCode: `def contains_sorted(values, target):
    low, high = 0, len(values)
    while low < high:
        middle = (low + high) // 2
        if values[middle] < target:
            low = middle + 1
        else:
            high = middle
    return low < len(values) and values[low] == target

for target in [1, 2, 9, 5]:
    print(target, contains_sorted([1, 2, 2, 9], target))`,
    secondTrace: "The checks cover the first value, a duplicate value, the last value, and an absent interior value. A separate empty-list call would return `False` because `low < len(values)` fails safely.",
    mistake: "Do not add patches after each failed example without revisiting the invariant. Many special-case branches are a sign that the chosen boundaries or state meaning is inconsistent.",
    checkpoint: "Name six input partitions you would test for a function that removes duplicates from a sorted list.",
    checkpointAnswer: "Use empty, one item, no duplicates, all duplicates, duplicates at the start or end, and several duplicate groups. Also test negative or extreme values if the contract allows them.",
    remember: "Write the contract, divide inputs into behavior families, and test boundaries, duplicates, absence, and extreme values deliberately.",
    checks: [
      q("Why is zero a bad default maximum?", ["All valid values might be negative", "Zero is not an integer", "It makes the loop quadratic"], 0, "A sentinel must not beat real values incorrectly.", ["Correct. The function could invent a result not in the input.", "Zero is an integer.", "Initialization does not change loop growth."]),
      q("What is an input partition?", ["A family expected to behave for the same reason", "A random test value", "A sorting algorithm"], 0, "Partitions organize coverage by behavior.", ["Correct. One representative can probe each distinct rule.", "Random tests can help but do not define the behavior families.", "Partitioning inputs here is a testing idea."]),
    ],
  },
  {
    lessonId: "py.ac.m1_3.l6",
    atomId: "py.atom.algo.dry-running",
    conceptId: "py.algo.dry-running",
    title: "Dry-run code with a state table",
    requires: ["py.algo.edge-cases-method"],
    vocabulary: [
      ["dry run", "executing code by hand without asking the computer"],
      ["state table", "rows that record important variables at chosen moments"],
      ["iteration boundary", "a consistent point before or after one loop pass"],
      ["expected result", "the answer independently computed from the problem statement"],
    ],
    opening: "Reading code is not the same as executing it. A dry run forces every assignment and branch to happen in order. A small state table keeps the trace from turning into a cloud of crossed-out numbers.",
    outcome: "You will be able to choose trace columns, update them at one consistent boundary, and compare the final state with an independently known answer.",
    why: "Dry running catches off-by-one errors before tests. It also gives you a calm recovery tool when an interviewer says the solution fails on one input.",
    mentalModel: "Pretend you are Python's accountant. Every row is a receipt after one unit of work. Never update a value in your head without recording the new receipt.",
    firstTitle: "Trace lower-bound binary search",
    firstIntro: "Record `(low, high, middle, value)` before changing a boundary. Use target four in a list where four is absent.",
    firstCode: `def lower_bound(values, target):
    low, high = 0, len(values)
    while low < high:
        middle = (low + high) // 2
        if values[middle] < target:
            low = middle + 1
        else:
            high = middle
    return low

print(lower_bound([1, 3, 5, 7], 4))`,
    firstTrace: "First row: `(0, 4, 2, 5)`, so set `high = 2`. Second row: `(0, 2, 1, 3)`, so set `low = 2`. Now `low == high`, and the function returns `2`, the insertion position before value five.",
    secondTitle: "Trace a sliding sum at one boundary",
    secondIntro: "Record state after adding each value and after removing any value that falls outside the width-three window.",
    secondCode: `def window_sums(values, width):
    total = 0
    answers = []
    for index, value in enumerate(values):
        total += value
        if index >= width:
            total -= values[index - width]
        if index + 1 >= width:
            answers.append(total)
    return answers

print(window_sums([2, 1, 4, 3], 3))`,
    secondTrace: "After indices zero and one, the window is not full. At index two, append total seven. At index three, add three and remove index zero's value, leaving eight. The result is `[7, 8]`.",
    mistake: "Do not switch between recording before and after an update. Pick one iteration boundary and label it. Mixed boundaries create apparent contradictions that the code never produced.",
    checkpoint: "Dry-run `lower_bound([2, 4, 6], 7)`. What rows appear, and what boundary returns?",
    checkpointAnswer: "The rows are `(0,3,1,4)` then `(2,3,2,6)`. Both values are less than seven, so `low` becomes three. The returned insertion boundary is `3`.",
    remember: "Trace only important state, record it at the same moment each iteration, and compare against an answer found independently from the code.",
    checks: [
      q("Why choose one iteration boundary for a state table?", ["So every row has the same meaning", "So the loop runs faster", "So fewer variables exist"], 0, "Consistent rows make state comparable.", ["Correct. Before-state and after-state should not be mixed.", "A paper trace does not change runtime.", "The code's variables do not disappear."]),
      q("What should you do before trusting the traced final result?", ["Compare it with a manually expected answer", "Add more print statements only", "Assume no exceptions means correct"], 0, "Independent expectation prevents circular reasoning.", ["Correct. The problem statement, not the code, defines correctness.", "Prints can expose state but still need an expected answer.", "Incorrect code can finish normally."]),
    ],
  },
  {
    lessonId: "py.ac.m1_3.l7",
    atomId: "py.atom.algo.communication",
    conceptId: "py.algo.communication-method",
    title: "Explain an algorithm before typing it",
    requires: ["py.algo.dry-running"],
    vocabulary: [
      ["clarification", "a question that removes ambiguity from the contract"],
      ["approach", "the ordered plan and data structures used to solve the problem"],
      ["correctness argument", "the reason the approach always returns the promised result"],
      ["complexity statement", "time and extra-space costs with the variables they depend on"],
    ],
    opening: "An interview is collaborative problem solving, not silent typing. A clear explanation lets the interviewer correct a misunderstanding early and shows that your final code came from reasoning.",
    outcome: "You will be able to give a compact pre-code explanation covering contract, brute force, chosen structure, invariant, complexity, and edge cases.",
    why: "Correct code with confused communication is hard to trust. Clear reasoning also reduces your own mistakes because every variable has a job before it appears in the editor.",
    mentalModel: "Give the interviewer a map before driving. Name the destination, route, safety rule, travel cost, and unusual road conditions. Then write code that follows the map.",
    firstTitle: "A complete explanation for duplicate detection",
    firstIntro: "The explanation can be short because each sentence has one job. Then the code should match it directly.",
    firstCode: `def contains_duplicate(values):
    seen = set()
    for value in values:
        if value in seen:
            return True
        seen.add(value)
    return False

print(contains_duplicate([3, 1, 3]))`,
    firstTrace: "Say: “I assume equality decides duplicates. Brute force compares every pair in O(n²). I will scan once and store visited values in a set. Before each iteration, `seen` contains exactly the processed values. A membership hit proves a duplicate. Expected time is O(n), extra space is O(n), and empty input returns false.”",
    secondTitle: "Narrate a safe failure path",
    secondIntro: "When the target may be absent, say what the function returns before coding. This removes a common last-minute ambiguity.",
    secondCode: `def first_index(values, target):
    for index, value in enumerate(values):
        if value == target:
            return index
    return None

print(first_index([8, 5, 2], 7))`,
    secondTrace: "The contract says `None` means no position exists. The invariant says every position before `index` has been checked and did not match. The loop is O(n) time and O(1) extra space. Empty input naturally returns `None`.",
    mistake: "Do not narrate every keystroke. Explain decisions and state meaning. Long silence is risky, but constant low-level chatter hides the important reasoning too.",
    checkpoint: "Give a six-sentence plan for finding whether a sorted list contains a target with binary search.",
    checkpointAnswer: "Clarify sorted ascending input and the absent result. Mention linear search as O(n). Choose a half-open candidate range. State that any existing target stays inside it. Halve the range by comparing the middle value. Finish with O(log n) time, O(1) space, plus empty and boundary tests.",
    remember: "Before coding, state the contract, slow baseline, chosen idea, invariant, complexity, and edge cases. Then make the code mirror those sentences.",
    checks: [
      q("What should an approach explanation emphasize?", ["Decisions, invariant, and costs", "Every character you type", "Only the final complexity"], 0, "The interviewer needs the reasoning that makes the code trustworthy.", ["Correct. These facts expose understanding.", "Keystroke narration hides the design.", "Complexity alone does not establish correctness."]),
      q("Why clarify the absent-result contract?", ["Several reasonable return choices exist", "Python cannot return None", "It changes Big O"], 0, "The caller must know whether absence means None, -1, false, or an error.", ["Correct. Agreement prevents a technically correct mismatch.", "Python can return `None`.", "The chosen sentinel usually does not change growth."]),
    ],
  },
];

export const ALGO_FOUNDATION_ATOMS = ALGO_FOUNDATION_SPECS.map(guidedMasteryAtom);
export const ALGO_FOUNDATION_CONCEPTS = ALGO_FOUNDATION_SPECS.map(guidedMasteryConcept);
export const ALGO_FOUNDATION_LESSON_CONTENT = guidedLessonContent(ALGO_FOUNDATION_SPECS);

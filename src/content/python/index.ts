import type { Atom, CareerTrack, Concept, CourseModule, Lesson, LectureQuestion, Problem, TestSpec } from "../../types";

interface ModuleSpec {
  id: string;
  part: number;
  partTitle: string;
  title: string;
  summary: string;
  tracks?: CareerTrack[];
}

interface UnitSpec {
  id: string;
  module: string;
  title: string;
  goal: string;
  kind?: Concept["kind"];
  requires?: string[];
  model: string;
  example: string;
  trace: string;
  trap: string;
  rule: string;
  recall: string;
  check?: LectureQuestion;
  /** A bank of retrieval questions shown after the lecture (preferred). */
  checks?: LectureQuestion[];
  prompt: string;
  fn: string;
  starter: string;
  solution: string;
  tests: TestSpec[];
  minutes?: number;
  tier?: Problem["tier"];
  pattern?: string;
  difficulty?: [number, number, number];
  hints?: [string, string, string];
  tracks?: CareerTrack[];
  skills?: string[];
  /** Some foundation lessons end with retrieval rather than code because the
   * function-based runner has not been taught yet. */
  practice?: boolean;
}

const MODULES: ModuleSpec[] = [
  { id: "py.m0", part: 1, partTitle: "Python from first principles", title: "Your first Python programs", summary: "Start with source code, values, calls, variables, and functions—one new idea at a time." },
  { id: "py.m1", part: 1, partTitle: "Python from first principles", title: "Decisions, lists, and repetition", summary: "Add comparisons, branches, collections, loops, everyday iteration tools, mutation, and small function design in dependency order." },
  { id: "py.m2", part: 1, partTitle: "Python from first principles", title: "Collections, ordering, and cost", summary: "Choose core collections, sort data deliberately, and explain how work grows before using complexity notation elsewhere." },
  { id: "py.m3", part: 2, partTitle: "Fluent Python", title: "Imports, functions, and errors", summary: "Use libraries, design flexible signatures, trace scope, and handle expected failures." },
  { id: "py.m4", part: 2, partTitle: "Fluent Python", title: "Objects and protocols", summary: "Build useful types without turning every program into a class hierarchy." },
  { id: "py.m5", part: 2, partTitle: "Fluent Python", title: "Iteration and reliable I/O", summary: "Stream data, manage resources, and make failure explicit." },
  { id: "py.m6", part: 3, partTitle: "Production Python", title: "Types, tests, and performance", summary: "Use the tools that make a Python codebase maintainable and observable." },
  { id: "py.m7", part: 3, partTitle: "Production Python", title: "Concurrency and architecture", summary: "Know when async, threads, processes, modules, and packages actually help." },
  { id: "py.m8", part: 4, partTitle: "Interview method", title: "Recursive reasoning and problem solving", summary: "Derive solutions from constraints, invariants, smaller subproblems, and repeated work." },
  { id: "py.m9", part: 5, partTitle: "Interview patterns", title: "Linear data patterns", summary: "Build fast recognition for hashing, pointers, windows, stacks, and intervals." },
  { id: "py.m10", part: 5, partTitle: "Interview patterns", title: "Trees, graphs, and heaps", summary: "Traverse structured search spaces with the right frontier." },
  { id: "py.m11", part: 5, partTitle: "Interview patterns", title: "Search and dynamic programming", summary: "Explore choices without repeating the same subproblem." },
  { id: "py.m12", part: 6, partTitle: "Role preparation", title: "Production and systems reasoning", summary: "Reason about contracts, retries, caches, and capacity before a system reaches production.", tracks: ["faang", "swe"] },
  { id: "py.m13", part: 6, partTitle: "Role preparation", title: "Machine-learning engineering foundations", summary: "Protect experiments from shape errors, leakage, misleading metrics, and irreproducible training.", tracks: ["ml"] },
  { id: "py.m14", part: 6, partTitle: "Role preparation", title: "Quantitative reasoning in Python", summary: "Turn probability, counting, simulation, and compounding into checked computational models.", tracks: ["quant"] },
];

const t = (name: string, code: string, hidden = false): TestSpec => ({ name, code, hidden });

const UNITS: UnitSpec[] = [
  {
    id: "programs", module: "py.m0", title: "What a Python program is", goal: "Know what source code is, how Python reads it, and how to run one line deliberately.", kind: "mental-model", practice: false,
    model: "A program is a sequence of precise instructions written as source code. Python is both the language whose grammar you write and the interpreter that reads that source. A source file is plain text, usually ending in `.py`. Python reads its statements from top to bottom unless a later control-flow feature tells it to move elsewhere.\n\nA statement is a complete instruction. An expression is code that produces a value. A literal writes a value directly, such as `7` or `\"hello\"`. A comment starts with `#`; Python ignores the comment text, so comments are explanations for people rather than instructions for the machine.",
    example: `# These are expressions.\n2 + 3\n"hello"\n\n# In a file, bare expressions produce values but do not display them.`,
    trace: "Line 1 is a comment, so the interpreter does nothing with it. Line 2 evaluates the integer expression `2 + 3` and produces the integer object `5`. Line 3 evaluates a string literal and produces the string object `\"hello\"`. Because neither result is sent anywhere, a normal script displays nothing. That is not failure: evaluation happened, but no output instruction was given.",
    trap: "Do not judge a program only by whether text appeared. A line can run and produce a value without displaying it. Also distinguish an error from ordinary silence: an error includes a traceback explaining where Python could not continue.",
    rule: "For every line, ask: is this a comment, a statement, or an expression—and if it produces a value, where does that value go?",
    recall: "What is the difference between source code, a statement, an expression, and the value an expression produces?",
    check: {
      question: "A script contains just the line `2 + 3`, with no `print`. What happens when it runs?",
      choices: ["Python evaluates it to `5` but displays nothing, because no output instruction was given", "Python automatically displays `5`"],
      answer: 0,
      explanation: "Evaluation and display are separate. A bare expression produces a value; without `print` nothing is shown — and that silence is not an error.",
    },
    prompt: "", fn: "", starter: "", solution: "", tests: [],
  },
  {
    id: "values", module: "py.m0", title: "Values, objects, and types", goal: "Recognize Python's basic values and explain what a type tells you.", kind: "mental-model", requires: ["programs"], practice: false,
    model: "A value is a piece of information a program can work with. At runtime, Python represents every value as an object. Each object has a type, and that type determines which operations make sense. `12` is an integer (`int`), `3.5` is a floating-point number (`float`), `\"Ada\"` is text (`str`), `True` and `False` are Booleans (`bool`), and `None` is the special absence value (`NoneType`).\n\nThe quotes are syntax that create a string; they are not characters stored inside that string. Likewise, `False` is not the text `\"False\"`. Those values have different types and behave differently. Python is dynamically typed: values have types, while a name may later be rebound to a value of another type.",
    example: `12          # int\n3.5         # float\n"Ada"       # str\nTrue        # bool\nNone        # the absence value`,
    trace: "Python parses each literal according to its spelling. Digits without a decimal point create an integer. A decimal point creates a float. Matching quotes create a string. `True`, `False`, and `None` are keywords with exact capitalization. The comment on each line is ignored by Python.",
    trap: "Values that look similar on screen are not interchangeable. `3` is a number; `\"3\"` is one character of text. Adding numbers performs arithmetic, while adding strings joins text. Conversion must be explicit when meanings cross that boundary.",
    rule: "Before choosing an operation, name the value's meaning and type; do not infer meaning only from how it is displayed.",
    recall: "Why are `3`, `3.0`, and `\"3\"` three different values even though a person may read all three as ‘three’?",
    check: {
      question: "A person reads both `3` and `\"3\"` as ‘three.’ How does Python treat them?",
      choices: ["As the same value", "As different values — `3` is a number you can do arithmetic on, `\"3\"` is one character of text"],
      answer: 1,
      explanation: "Type determines meaning. Adding numbers computes; adding strings joins text. Crossing that boundary requires an explicit conversion.",
    },
    prompt: "", fn: "", starter: "", solution: "", tests: [],
  },
  {
    id: "calls", module: "py.m0", title: "Calling functions and seeing output", goal: "Read a function call as a named operation receiving arguments and producing an effect or result.", requires: ["values"], practice: false,
    model: "A function is reusable behavior. To call one, write its name followed by parentheses. Values placed inside the parentheses are arguments: information supplied to that call. `print(\"Hello\")` calls the built-in function named `print` with one string argument. Its visible effect is writing text to the output.\n\nSome functions return a value for later use; some mainly perform an effect. `type(12)` returns the type object `int`. `print(type(12))` nests two calls: the inner call runs first and its result becomes the outer call's argument. Parentheses therefore describe both grouping and the flow of values between operations.",
    example: `print("Hello, Python")\nprint(2 + 3)\nprint(type("Ada"))`,
    trace: "The first call sends one string to `print`. On the second line, Python evaluates `2 + 3` first, producing `5`, then passes `5` to `print`. On the third line, `type(\"Ada\")` runs first and returns `str`; the outer `print` displays that result. Each comma-separated argument is evaluated before the function begins.",
    trap: "Displaying a value is not the same as returning it. `print` is useful at the boundary where a person needs output, but later functions should usually return results so other code can keep working with them.",
    rule: "Read a call from the innermost parentheses outward: evaluate each argument, call the function, then follow its returned value or visible effect.",
    recall: "In `print(type(12))`, which call happens first, what does it return, and what does the outer call receive?",
    check: {
      question: "In `print(type(12))`, which call runs first?",
      choices: ["`type(12)` runs first and returns `int`; then `print` displays that result", "`print` runs first and hands its output to `type`"],
      answer: 0,
      explanation: "Read a call from the innermost parentheses outward: each argument is fully evaluated before the outer function begins.",
    },
    prompt: "", fn: "", starter: "", solution: "", tests: [],
  },
  {
    id: "variables", module: "py.m0", title: "Variables and assignment", goal: "Bind, read, and reassign names without confusing assignment with equality.", requires: ["calls"], practice: false,
    model: "A variable is a name your program binds to a value. Assignment uses one equals sign: Python evaluates the expression on the right, then binds the name on the left to the resulting object. After `age = 18`, reading `age` produces the integer object `18`.\n\nReassignment makes the name point to a new value; it does not rewrite history or alter results that were already computed. In `age = age + 1`, Python first reads the old value of `age`, adds one, and only then rebinds `age` to the new integer. The old integer still exists if another name or data structure refers to it. Choose names that state meaning—`remaining_minutes`—rather than storage trivia—`x`.",
    example: `student = "Maya"\ncredits = 12\ncredits = credits + 3\nprint(student, credits)`,
    trace: "Line 1 creates the string and binds it to `student`. Line 2 binds the integer `12` to `credits`. Line 3 reads the current `credits`, evaluates `12 + 3`, then rebinds the same name to `15`. Line 4 reads both names and supplies their values to `print`. Assignment flows right to left: evaluate first, bind second.",
    trap: "One equals sign does not ask a question; it performs assignment. A later lesson introduces `==` for comparing values. Also, using a name before it has been assigned raises `NameError` because Python has no object to retrieve for that name.",
    rule: "Trace assignment in two steps: evaluate the complete right-hand expression, then bind the left-hand name to that result.",
    recall: "When Python runs `total = total + price`, why must the right side use the old binding before the left side changes?",
    check: {
      question: "When Python runs `age = age + 1`, what does it do first?",
      choices: ["Reads the current `age`, adds 1, then rebinds `age` to the new result", "Changes `age` first, then adds 1 to it"],
      answer: 0,
      explanation: "Assignment flows right to left: evaluate the whole right-hand side using the old binding, then bind the name on the left to that result.",
    },
    prompt: "", fn: "", starter: "", solution: "", tests: [],
  },
  {
    id: "first-function", module: "py.m0", title: "Defining and calling your first function", goal: "Define a function, distinguish parameters from arguments, and return a value to the caller.", requires: ["variables"],
    model: "You have already called built-in functions. `def` lets you define your own. A function definition has a name, parentheses containing parameter names, a colon, and an indented body. A parameter is a local name written in the definition. An argument is the actual value supplied by a particular call.\n\nWhen Python reaches `def`, it creates the function but does not run the indented body. A later call starts a new function frame, binds each parameter to its argument, and runs the body. `return` ends that call and sends one result back to the caller. If execution reaches the end with no `return`, Python returns `None`.",
    example: `def identity(value):\n    return value\n\nanswer = identity("ready")\nprint(answer)`,
    trace: "First, Python creates the function and binds it to `identity`; the body waits. The call `identity(\"ready\")` creates a local frame and binds the parameter `value` to the string argument. `return value` reads that local name, ends the call, and produces the same string. Assignment binds that returned object to `answer`, and the final call displays it.",
    trap: "Printing inside a function does not return a result. Indentation is also syntax: every line belonging to the function body must be indented consistently, while code after the function returns to the outer indentation level.",
    rule: "Read every call as a four-step sequence: evaluate arguments, bind parameters, run the indented body, and replace the call expression with the returned value.",
    recall: "What happens at definition time, what happens at call time, and how are a parameter, an argument, and a return value different?",
    check: {
      question: "A function `print`s a value inside its body but has no `return`. What does calling it produce?",
      choices: ["`None` — printing displays text but does not send a value back", "The value that was printed"],
      answer: 0,
      explanation: "Displaying is not returning. A caller can only reuse a returned result; reaching the end with no `return` yields `None`.",
    },
    prompt: "Define `identity(value)` and return the value it receives.", fn: "identity", starter: `def identity(value):\n    pass`, solution: `def identity(value):\n    return value`,
    tests: [t("integer", "assert fn(6) == 6"), t("string", `assert fn("ready") == "ready"`), t("none", "assert fn(None) is None", true)],
  },
  {
    id: "names", module: "py.m1", title: "Mutation, aliasing, and copying", goal: "Predict when two variables share one mutable object and copy deliberately.", kind: "mental-model", requires: ["variables", "lists"],
    model: "This is one of the trickiest ideas for new programmers, so we will go slowly. When you write `a = [1, 2]`, two separate things exist: the **list itself** (think of it as a box holding `1` and `2`), and the **name** `a` (a label that points at that box). The name is not the box — it is an arrow to it.\n\nNow the surprising part. When you write `b = a`, Python does **not** make a second box. It sticks a second label, `b`, on the *same* box. Both `a` and `b` are arrows pointing at one shared list. This is called **aliasing** — two names for one object.\n\n```python\na = [1, 2]\nb = a          # b is a second label on the SAME list\nb.append(3)    # change the shared box through b\nprint(a)       # [1, 2, 3]  <- a sees it too!\n```\n\nThis catches everyone at first. You changed the list through `b`, and `a` shows the change — because there was only ever one list. Changing the contents of an object is called **mutating** it, and lists can be mutated, which is exactly why sharing them matters.\n\n**Why doesn't this happen with numbers?** Because numbers and strings cannot be changed in place — they are **immutable**. When you do `x = 5`, then `y = x`, then `y = y + 1`, you are not changing the number `5`; you are making a new number `6` and pointing `y` at it. `x` still points at `5`. With a list, `append` changes the one box everyone shares, so the difference shows.\n\n**When you want a real, separate copy,** ask for one on purpose: `b = a.copy()` — or the slice `b = a[:]`, which you met in the slicing lesson. Now `b` points at a brand-new box with the same items, and changing one does not touch the other.\n\n```python\na = [1, 2]\nb = a.copy()   # b is a NEW list with the same items\nb.append(3)\nprint(a)       # [1, 2]      <- unchanged\nprint(b)       # [1, 2, 3]\n```\n\nSo before you change a list, ask one question: **am I changing the shared box, or do I want my own copy first?**",
    example: `a = [1, 2]\nb = a\nb.append(3)\nprint(a)        # [1, 2, 3] — same box, a sees it\n\nc = a.copy()\nc.append(9)\nprint(a)        # [1, 2, 3] — unchanged, c is separate\nprint(c)        # [1, 2, 3, 9]`,
    trace: "Line by line. `a = [1, 2]` makes one list and points `a` at it. `b = a` does not copy — it points `b` at the *same* list, so now two arrows meet one box. `b.append(3)` changes that shared box to `[1, 2, 3]`, and because `a` points at the same box, `print(a)` shows `[1, 2, 3]` too.\n\nThen `c = a.copy()` makes a brand-new box with the same items and points `c` at it — a second, independent list. `c.append(9)` changes only `c`'s box, so `c` becomes `[1, 2, 3, 9]` while `a` stays `[1, 2, 3]`. The copy is what made them independent.",
    trap: "`b = a` is not a copy — it is a second name for the same list, so mutating through either name shows through both. Reach for `a.copy()` (or `a[:]`) when you need a separate list. One caution for later: `.copy()` duplicates the outer list only, so if a list contains other lists, those inner lists are still shared.",
    rule: "Before changing a list, decide whether you mean to change the shared object or a private copy. `=` shares one object under two names; `.copy()` or a full slice `[:]` gives you your own.",
    recall: "After `b = a` where `a` is a list, does changing the list through `b` affect `a`, and what would you write instead to keep them separate?",
    checks: [
      {
        question: "After `a = [1, 2]` and `b = a`, you run `b.append(3)`. What is `a` now?",
        choices: [
          "`[1, 2, 3]` — `b` is a second name for the same list, so `a` sees the change",
          "`[1, 2]` — `b` is a separate copy, so `a` is untouched",
          "It raises an error because two names cannot share a list",
        ],
        answer: 0,
        why: [
          "Correct. `b = a` does not copy; it points `b` at the same list `a` points at. `append` changes that one shared list, so `a` is `[1, 2, 3]` too.",
          "`b = a` is not a copy — that is the whole trap. To get a separate list you must write `b = a.copy()`.",
          "Sharing a list between names is completely normal in Python; it does not raise. It just means changes show through both names.",
        ],
        explanation: "`=` makes another name for the same object; mutating through one name shows through the other.",
      },
      {
        question: "Why does `y = x`, then `y = y + 1` leave `x` unchanged when `x` is a number, but the list version can change the original?",
        choices: [
          "Numbers can't be changed in place, so `y + 1` makes a new number; a list's `append` changes the one shared list",
          "Numbers are always copied but lists are always shared, for no real reason",
          "It doesn't — `x` changes too in the number case",
        ],
        answer: 0,
        why: [
          "Correct. Numbers and strings are immutable, so `y + 1` builds a new value and re-points `y`, leaving `x` alone. `list.append` mutates the shared object, so both names see it.",
          "It is not arbitrary: the difference is *mutability*. Immutable values cannot be changed in place, so you always get a new one; mutable ones can be changed where they sit.",
          "`x` does not change in the number case — `y = y + 1` rebinds only `y`. `x` keeps its original value.",
        ],
        explanation: "Immutable values (numbers, strings) are replaced, not changed; mutable ones (lists) can be changed in place and shared.",
      },
      {
        question: "You want `b` to start with the same items as list `a` but change independently. What do you write?",
        choices: [
          "`b = a.copy()` (or `b = a[:]`)",
          "`b = a`",
          "`b == a`",
        ],
        answer: 0,
        why: [
          "Correct. `.copy()` (or a full slice `a[:]`) makes a new list with the same items, so changing `b` never touches `a`.",
          "`b = a` shares the same list — the opposite of what you want. Changes to `b` would show in `a`.",
          "`b == a` is a comparison that returns `True` or `False`; it does not create a list at all.",
        ],
        explanation: "Use `.copy()` or `a[:]` for an independent list; `=` only adds another name to the same one.",
      },
    ],
    prompt: "Return a shallow copy of `items` with `value` appended. Do not change the caller's list.", fn: "with_item", starter: `def with_item(items, value):\n    pass`, solution: `def with_item(items, value):\n    result = items.copy()\n    result.append(value)\n    return result`,
    tests: [t("adds value", "assert fn([1, 2], 3) == [1, 2, 3]"), t("does not mutate", "data = [1]; result = fn(data, 2); assert data == [1] and result is not data", true)],
  },
  {
    id: "numbers", module: "py.m0", title: "Integers, floats, and arithmetic", goal: "Read basic arithmetic and choose the right kind of division for an exact answer, complete groups, or leftovers.", requires: ["values", "first-function"],
    model: "Python starts with two everyday kinds of numbers. An **integer**, whose type is written `int`, is a whole number with no decimal part: `8`, `0`, and `-3` are integers. A **float**, whose type is written `float`, is a number that can include a fractional part: `2.5`, `0.0`, and `-1.25` are floats. The decimal point is the visible clue in a numeric literal: `3` is an integer, while `3.0` is a float.\n\nAn **operator** is a symbol that asks Python to perform a calculation. The values on its left and right are the inputs to that calculation. `+` adds, `-` subtracts, `*` multiplies, and `**` raises a number to a power. For example, `4 * 3` produces `12`, while `4 ** 3` means 4 multiplied by itself 3 times and produces `64`. Parentheses make the intended order explicit: `(2 + 3) * 4` produces `20`.\n\nDivision has three symbols because one group of numbers can answer three different questions. With 17 items and boxes that hold 5 items, `17 / 5` produces `3.4`: the exact quotient as a float. `17 // 5` produces `3`: the number of completely full boxes. `17 % 5` produces `2`: the number of items left after filling those boxes. The `%` symbol means remainder here; it does not mean percentage.\n\nFor now, use `//` and `%` with nonnegative counts such as items, people, and minutes. Negative-number division has an extra rounding rule and is deliberately saved for later, after the three ordinary meanings are secure. Dividing by zero with any division operator is an error because no numeric answer exists.",
    example: `items = 17\ncapacity = 5\n\nexact_quotient = items / capacity   # 3.4\nfull_boxes = items // capacity      # 3\nleft_over = items % capacity        # 2\n\ntotal_cost = 3 * 4.50               # 13.5`,
    trace: "The first two lines bind names to integer values. On the fourth line, `/` answers how many groups of 5 fit mathematically, including the partial group, so the result is the float `3.4`. On the fifth line, `//` keeps only the 3 complete groups. On the sixth line, `%` returns the 2 items that did not enter a complete group. The final line multiplies an integer quantity by a float price, so Python produces the float `13.5`.",
    trap: "Do not choose a division symbol because it looks familiar. Choose it from the question being asked.\n\nUse `/` when a partial group belongs in the answer. Use `//` when only complete groups count. Use `%` when you want only the leftover amount. Also remember: exponentiation uses two star symbols, while multiplication uses one.",
    rule: "Translate the question before writing the operator: use `/` for the exact quotient, `//` for the number of complete equal groups, and `%` for what remains after those groups are removed.",
    recall: "With 17 items and 5 items per box, what do `17 / 5`, `17 // 5`, and `17 % 5` each return, and what does each result mean?",
    check: {
      question: "You have 17 items and each complete box must contain 5. Which expression returns the number of complete boxes?",
      choices: ["`17 // 5`, which returns `3` complete boxes", "`17 / 5`, which returns the exact quotient `3.4`"],
      answer: 0,
      explanation: "A partial box does not count, so the question asks for complete equal groups. `//` returns 3; `%` would separately report the 2 leftover items.",
    },
    prompt: "`items` is a nonnegative integer. `capacity` is a positive integer telling you how many items a complete box must contain. Return the number of completely full boxes. Ignore any leftover items.\n\nFor example, `full_boxes(14, 4)` returns `3`: three boxes use 12 items, and the remaining 2 items cannot fill another box.", fn: "full_boxes", starter: `def full_boxes(items, capacity):\n    pass`, solution: `def full_boxes(items, capacity):\n    return items // capacity`,
    tests: [t("exact", "assert fn(12, 4) == 3"), t("remainder", "assert fn(14, 4) == 3"), t("small", "assert fn(2, 5) == 0", true), t("none fit", "assert fn(0, 3) == 0", true)],
    hints: [
      "Say the required result in words: the number of complete groups of `capacity` items.",
      "Use the division operator that returns complete equal groups and ignores a partial group.",
      "For 14 items with capacity 4, trace 3 complete groups, using 12 items, with 2 left over.",
    ],
  },
  {
    id: "strings", module: "py.m0", title: "Strings and Unicode", goal: "Read pieces of text, clean them with string methods, and build new strings without expecting the original to change.", requires: ["calls", "variables", "first-function"],
    model: "A **string** is Python's value for text. Its type name is `str`. Write a string by placing text inside matching quotes, as in `\"Ada\"` or `'Ada'`. The quotes tell Python where the text begins and ends; they are not part of the stored text.\n\nA string is an ordered sequence of characters. Python numbers their positions starting at zero. In `\"Ada\"`, position `0` contains `\"A\"`, position `1` contains `\"d\"`, and position `2` contains `\"a\"`. `text[0]` reads one position. `text[1:3]` is a **slice**: it creates the text from position 1 up to, but not including, position 3.\n\nA **method** is a function attached to a value. `text.strip()` returns text without whitespace at the beginning or end. `text.casefold()` returns a version suitable for matching text without caring about letter case. `text.replace(\" \", \"-\")` returns a version in which spaces have become hyphens. Each method call returns a new string. Strings are **immutable**, which simply means an existing string cannot be edited in place. You can bind a name to the new result, while the original value stays unchanged.\n\nPython strings support Unicode, so they can hold text from many writing systems rather than only English letters. Some human-visible symbols are made from more than one stored piece. That detail matters in specialized text processing, but it does not change the ordinary indexing and method calls practiced here.",
    example: `original = "  Ada Lovelace  "\nwithout_edges = original.strip()\nnormalized = without_edges.casefold()\nusername = normalized.replace(" ", "-")\nlabel = f"user:{username}"\n\n# original is still "  Ada Lovelace  "`,
    trace: "Line 1 binds `original` to a string that includes spaces at both ends. Line 2 calls `strip` and binds the returned string `\"Ada Lovelace\"` to a new name. Line 3 returns `\"ada lovelace\"`. Line 4 replaces the internal space and returns `\"ada-lovelace\"`. The f-string on line 5 evaluates the name inside braces and produces `\"user:ada-lovelace\"`. None of these calls changes the string bound to `original`.",
    trap: "Calling a string method is not enough if you need the result later. `name.strip()` creates cleaned text and then discards it unless you return it, pass it to another call, or assign it to a name. Also remember that an index outside the string raises `IndexError`.",
    rule: "Treat every string operation as creating a result: read or slice the characters you need, call a method, and keep the returned string in a name or return it from your function.",
    recall: "After `clean = original.strip()`, which name holds the cleaned text, why is `original` unchanged, and what would `clean[0]` return?",
    check: {
      question: "You write `name.strip()` on its own line, with no assignment. What happens to the cleaned text?",
      choices: ["`name` is permanently trimmed in place", "A new cleaned string is created and then discarded, because nothing kept the return value"],
      answer: 1,
      explanation: "Strings are immutable, so a method returns a new string and never edits the original. Keep the result in a name or return it, or it is lost.",
    },
    prompt: "Return a cleaned username. Remove whitespace from the beginning and end, make letter case consistent with `casefold`, and replace each internal space with a hyphen.\n\nFor example, `normalize_username(\"  Ada Lovelace \" )` returns `\"ada-lovelace\"`. Each string method returns a new string, so return the final result.", fn: "normalize_username", starter: `def normalize_username(text):\n    pass`, solution: `def normalize_username(text):\n    return text.strip().casefold().replace(" ", "-")`,
    tests: [t("normalizes", `assert fn("  Ada Lovelace ") == "ada-lovelace"`), t("unicode case", `assert fn(" STRASSE ") == "strasse"`), t("blank", `assert fn("   ") == ""`, true)],
  },
  {
    id: "booleans", module: "py.m1", title: "Comparisons, truth, and identity", goal: "Ask clear yes-or-no questions with comparison operators and understand the Boolean value each question produces.", requires: ["numbers", "strings"],
    model: "A **Boolean** is a value with only two possibilities: `True` or `False`. Its type is `bool`. A **comparison** asks a yes-or-no question and produces one of those two values. `==` asks whether two values are equal. `!=` asks whether they are different. `<`, `<=`, `>`, and `>=` compare order.\n\nDo not confuse `=` with `==`. One equals sign performs assignment: `score = 10` binds a name. Two equals signs ask a question: `score == 10` produces `True` or `False` and does not change `score`. Values with different types may compare differently: `3 == 3.0` is `True` because those numeric values are equal, while `3 == \"3\"` is `False` because a number is not the same value as text.\n\nPython can also treat a value as true or false when a condition needs an answer. Zero, an empty string, an empty collection, `None`, and `False` act as false; most other values act as true. This shortcut is called **truthiness**. The word `not` reverses the answer, so `not \"\"` is `True`.\n\nHere are a few in action:\n\n```python\nscore = 10          # one =  : assignment (store 10)\nprint(score == 10)  # two == : a question -> True\nprint(score != 7)   # -> True\nprint(score >= 12)  # -> False\nprint(not \"\")       # -> True  (empty text acts as false)\n```\n\n`is` asks a different and less common question: whether two names refer to the exact same object. At this stage, the practical rule is simple. Use `value is None` to check for Python's one special absence value. Use `==` when you care whether ordinary values are equal.",
    example: `score = 10\nscore == 10       # True\nscore != 7        # True\nscore >= 12       # False\n3 == "3"          # False: number versus text\nmissing is None   # True when missing holds None\nnot ""            # True because empty text acts as false`,
    trace: "The assignment on line 1 stores 10 in `score`. The next three lines ask separate questions and produce Boolean results without changing that value. The number 3 and the string `\"3\"` display similarly but are not equal values. `missing is None` checks for the special absence object. On the final line, the empty string acts as false and `not` reverses it to `True`.",
    trap: "Using one `=` inside a comparison does not mean equal; it is assignment syntax and often causes an error in a condition. Also avoid `value is 0` and `name is \"Ada\"`. Use `is` for `None` and use `==` for ordinary value comparisons.",
    rule: "Use comparison operators to produce `True` or `False`: `==` for equal values, `!=` for different values, order operators for size, and `is None` only for the special absence value.",
    recall: "What does each expression ask: `score = 10`, `score == 10`, and `score is None`? Which ones produce a Boolean result?",
    checks: [
      {
        question: "What does `score == 10` do?",
        choices: [
          "Asks whether `score` equals 10, producing `True` or `False`, without changing `score`",
          "Stores `10` into `score`",
          "Rounds `score` to 10",
        ],
        answer: 0,
        why: [
          "Correct. Two equals signs make a comparison — a question that yields a Boolean and leaves `score` untouched.",
          "Storing a value is what a single `=` does (`score = 10`). Two `==` ask a question instead.",
          "`==` does not change the value at all; it only compares and returns `True` or `False`.",
        ],
        explanation: "One `=` assigns; two `==` compare and return a Boolean without changing anything.",
      },
      {
        question: "What is `not \"\"` (that is, `not` an empty string)?",
        choices: [
          "`True` — an empty string counts as false, and `not` flips it",
          "`False` — a string is always true",
          "An error — you cannot use `not` on text",
        ],
        answer: 0,
        why: [
          "Correct. An empty string is one of Python's 'falsy' values, so it acts as false; `not` reverses that to `True`.",
          "A non-empty string is truthy, but an empty one is falsy — so it is not always true.",
          "`not` works on any value by looking at its truthiness; there is no error.",
        ],
        explanation: "Empty string, 0, empty collections, None, and False are falsy; `not` reverses truthiness.",
      },
      {
        question: "When should you use `is` instead of `==`?",
        choices: [
          "Use `is None` to check for the special absence value; use `==` to compare ordinary values",
          "Always use `is` — it is faster than `==`",
          "Use `is` for numbers and `==` for strings",
        ],
        answer: 0,
        why: [
          "Correct. `is` asks whether two names are the exact same object; in everyday code the one solid use is `value is None`. For equal values, use `==`.",
          "`is` is not a faster `==`; it asks a different question and can give surprising answers for ordinary values like numbers or strings.",
          "The number-vs-string split is not the rule. Use `==` for value equality of both; reserve `is` for `None`.",
        ],
        explanation: "Use `is` only for `None`; use `==` to compare ordinary values.",
      },
    ],
    prompt: "Return whether `left` and `right` have equal values. Do not compare their printed text.", fn: "same_value", starter: `def same_value(left, right):\n    pass`, solution: `def same_value(left, right):\n    return left == right`,
    tests: [t("equal numbers", "assert fn(3, 3.0) is True"), t("different types and values", `assert fn(3, "3") is False`), t("equal strings", `assert fn("Ada", "Ada") is True`)],
  },
  {
    id: "branching", module: "py.m1", title: "Branching with invariants", goal: "Run different code for different inputs by tracing an `if`, `elif`, and `else` chain from top to bottom.", requires: ["booleans"],
    model: "Programs often need to choose between actions. An `if` statement evaluates a condition. When that condition is `True`, Python runs the indented block beneath it. When it is `False`, Python skips that block. Indentation is part of Python's syntax: it marks which lines belong to each choice.\n\n`elif` means ‘otherwise, if.’ Python checks it only when every preceding condition in the same chain was false. `else` means ‘if none of the `if` or `elif` conditions matched.’ An `else` has no condition because it catches everything remaining. In one `if`/`elif`/`else` chain, Python runs at most one branch.\n\nThe order matters. Put a more demanding threshold before a less demanding one. If `score >= 80` came before `score >= 90`, a score of 95 would enter the first branch and Python would never reach the A branch. Reading from top to bottom shows both the condition that is true and the conditions Python has already found false.\n\nContrast a chain with separate `if`s:\n\n```python\n# a chain: at most ONE branch runs\nif score >= 90:\n    grade = \"A\"\nelif score >= 80:\n    grade = \"B\"\n\n# separate ifs: EACH is checked, so more than one can run\nif score >= 90:\n    print(\"top marks\")\nif score >= 80:\n    print(\"solid\")     # a 95 prints BOTH lines\n```",
    example: `if score >= 90:\n    grade = "A"\nelif score >= 80:\n    grade = "B"\nelse:\n    grade = "C or below"`,
    trace: "For a score of 95, the first condition is true, so `grade` becomes `\"A\"` and the rest of the chain is skipped. For 85, the first condition is false and the `elif` is true, so the result is `\"B\"`. For 72, both conditions are false, so the `else` block runs. The second condition does not need to say ‘and below 90’ because reaching it already proves the first condition failed.",
    trap: "Several separate `if` statements are not one chain. Python checks every separate `if`, so several blocks may run. Use an `if`/`elif`/`else` chain when the choices are alternatives and exactly one result should win.",
    rule: "Read a decision chain from top to bottom. Put the highest-priority or most specific condition first, indent each branch body, and use `else` for the remaining case when every valid input needs an answer.",
    recall: "For scores 95, 85, and 72, which branch runs in the example, and why can only one branch run for each score?",
    checks: [
      {
        question: "In one `if`/`elif` chain, `score >= 80` is checked before `score >= 90`. What happens to a score of 95?",
        choices: [
          "It takes the `>= 80` branch, and the `>= 90` branch is never reached",
          "It correctly lands in the `>= 90` branch",
          "It runs both branches",
        ],
        answer: 0,
        why: [
          "Correct. A chain runs the first true branch and skips the rest, so the looser `>= 80` placed first grabs the 95. Put the highest threshold first.",
          "It does not reach `>= 90`: the earlier `>= 80` was already true, and a chain stops at the first match.",
          "A single `if`/`elif` chain runs at most one branch, never both.",
        ],
        explanation: "A chain runs the first true branch; order your conditions most-specific first.",
      },
      {
        question: "What is the difference between an `if`/`elif`/`else` chain and several separate `if` statements?",
        choices: [
          "A chain runs at most one branch; separate `if`s are each checked, so several can run",
          "They behave identically",
          "Separate `if`s run at most one; a chain runs all matching",
        ],
        answer: 0,
        why: [
          "Correct. A chain stops at the first true condition. Separate `if`s are independent, so a value can trigger more than one.",
          "They differ: chaining is 'pick one', separate `if`s are 'check each'.",
          "It is the reverse: the chain runs at most one; the separate `if`s can each run.",
        ],
        explanation: "Chain = at most one branch; separate `if`s = each is checked independently.",
      },
      {
        question: "What does the `else` block do?",
        choices: [
          "Runs only when every `if`/`elif` condition above it was false",
          "Runs in addition to whichever branch matched",
          "Needs its own condition to run",
        ],
        answer: 0,
        why: [
          "Correct. `else` is the catch-all: it runs exactly when none of the earlier conditions in the chain matched.",
          "Only one branch of a chain runs; `else` does not run alongside a matched branch.",
          "`else` has no condition — that is the point; it catches everything the earlier conditions missed.",
        ],
        explanation: "`else` runs only when all preceding conditions were false; it takes no condition.",
      },
    ],
    prompt: "Return one text label for `number`. Return `\"negative\"` when it is below zero, `\"zero\"` when it equals zero, and `\"positive\"` when it is above zero.\n\nCheck the cases in an order that makes exactly one return run for every number.", fn: "sign_label", starter: `def sign_label(number):\n    pass`, solution: `def sign_label(number):\n    if number < 0:\n        return "negative"\n    if number == 0:\n        return "zero"\n    return "positive"`,
    tests: [t("negative", `assert fn(-3) == "negative"`), t("zero", `assert fn(0) == "zero"`), t("positive", `assert fn(2.5) == "positive"`)],
  },
  {
    id: "loops", module: "py.m1", title: "Loops and loop invariants", goal: "Use a `for` loop to process values one at a time and trace how a running result changes.", kind: "mental-model", requires: ["branching", "lists"],
    model: "A **loop** repeats a block of code. A `for` loop is the clearest choice when you want to visit each value in a collection. In `for number in numbers:`, `numbers` is the collection being visited and `number` is a name that receives one value for the current pass. The indented lines beneath it are the **body**, and they run once for every value. One full pass through the body is called an **iteration**. A `for` loop stops on its own when the collection runs out, so you never track the count yourself — that is why it is the right tool when you want to touch each item exactly once.\n\nMany loops build a result gradually. A variable such as `total` that keeps that running result is often called an **accumulator**. The pattern is always three steps: give it a starting value *before* the loop, update it *inside* the loop, and read it *after* the loop ends. That starting value must be the one that leaves the result unchanged — `0` for a sum, `1` for a product, an empty string for joined text — so the answer stays correct even when the collection is empty and the body never runs. `total += number` is shorter spelling for `total = total + number`; it reads the old total, adds the current number, and stores the new total.\n\nA `while` loop repeats for as long as a condition stays true, and it re-checks that condition before every pass. Reach for it when the number of repetitions is not a fixed collection but depends on something you test each time — counting down, retrying until something works, or stopping when a running value crosses a limit. The catch is that *you* are responsible for stopping it: at least one line in the body must change the condition so it eventually becomes false. If nothing does, the condition stays true forever and the loop never ends — an **infinite loop**. As a concrete case, a countdown starts a variable at three and subtracts one on each pass; that subtracting step is what finally makes the condition false, and leaving it out makes the program run forever.\n\nLater algorithm lessons use the term **loop invariant** for a fact that remains true after every iteration. In the sum example, that fact is simple: `total` equals the sum of the values visited so far. Saying that sentence makes the update easier to understand and check.",
    example: `# for: visit each value in a collection, once\ntotal = 0\nfor number in numbers:\n    total += number      # invariant: total = sum of values seen so far\n\n# while: repeat until a condition changes\ncountdown = 3\nwhile countdown > 0:\n    print(countdown)\n    countdown -= 1       # this line is what eventually stops the loop\nprint("liftoff")`,
    trace: "Take the `for` loop over `[2, 4, 6]`. Before it starts, `total` is 0 because nothing has been visited. Pass one: `number` is 2, so `total` becomes 2. Pass two: `number` is 4, so `total` becomes 6. Pass three: `number` is 6, so `total` becomes 12. The collection is now empty, the loop ends, and `total` is 12 — the full sum.\n\nNow the `while` loop. `countdown` starts at 3. Python checks `3 > 0` (true), prints 3, then `countdown -= 1` makes it 2. It checks `2 > 0` (true), prints 2, drops to 1. It checks `1 > 0` (true), prints 1, drops to 0. It checks `0 > 0` — false — so the loop stops without running the body again, and the line after it prints `liftoff` once. That decrement is what guarantees the loop ends: without it, `countdown` would stay 3, `3 > 0` would be true forever, and nothing after the loop would ever run.",
    trap: "Two classic loop bugs. First, do not change the size of a list while a `for` loop is walking it — removing an item shifts every later position, so the loop can skip a value; build a separate result list for transformed or filtered output. Second, a `while` loop whose body never changes its condition runs forever, so make sure exactly one line moves that condition toward false and that the line actually runs on every pass, not only inside an `if` that sometimes skips it.",
    rule: "Use a `for` loop to visit every item in a collection and a `while` loop when repetition is driven by a condition you must eventually make false. For a running result, name what the accumulator means, start it at the value that changes nothing, update it once per relevant item, and read it only after the loop ends.",
    recall: "When the example has visited the first two values of `[2, 4, 6]`, what are `number` and `total`, and what does `total` mean at that moment?",
    checks: [
      {
        question: "You want `total` to hold the sum of a list. What should it be on the line just before the `for` loop, and why?",
        choices: [
          "`0` — the value that leaves a sum unchanged, so an empty list still gives the right answer",
          "The list's first value, so it is not added twice",
          "`None`, so you can tell the loop has not run yet",
        ],
        answer: 0,
        why: [
          "Correct. `0` is the identity for addition: adding it changes nothing, so an empty list correctly totals `0` and no real value is ever skipped.",
          "Seeding with the first value double-counts it once the loop reaches it, and it crashes on an empty list, which has no first value.",
          "You cannot compute `None + number` — adding a number to `None` raises `TypeError` on the very first iteration.",
        ],
        explanation: "An accumulator starts at its operation's identity: `0` for a sum, `1` for a product, an empty string for joined text — so it is correct even when the loop body never runs.",
      },
      {
        question: "This loop never stops: `n = 5`, then `while n > 0:` with a body of only `print(n)`. Why?",
        choices: [
          "Nothing in the body changes `n`, so `n > 0` stays true on every pass",
          "A `while` loop must contain a `for` loop in order to stop",
          "`n > 0` is not a valid condition for a `while` loop",
        ],
        answer: 0,
        why: [
          "Correct. A `while` loop stops only when its condition becomes false. Nothing here ever lowers `n`, so the condition never changes. Adding `n -= 1` to the body fixes it.",
          "Untrue — a `while` needs no `for` inside it. It just needs its own condition to eventually become false.",
          "`n > 0` is a perfectly valid Boolean condition; the bug is that it is never made false, not that it is invalid.",
        ],
        explanation: "Every `while` loop needs a body line that moves its condition toward false. Without one, it is an infinite loop.",
      },
      {
        question: "You have a list of prices and want their total. Which loop fits best?",
        choices: [
          "A `for` loop over the list, because you visit each price exactly once",
          "A `while` loop, because you do not know how many prices there are",
          "Neither — a loop cannot build a total",
        ],
        answer: 0,
        why: [
          "Correct. When you have a collection and want to touch every element once, `for price in prices` is the direct, hard-to-get-wrong tool, and it handles any length automatically.",
          "A `for` loop already works for any length without you tracking a count; a `while` here would make you manage an index by hand for no benefit and more risk of an off-by-one or an infinite loop.",
          "A running accumulator — start `total = 0`, then add each price — is exactly how loops build totals.",
        ],
        explanation: "Use `for` to walk a collection; use `while` when the number of repeats depends on a condition you re-check each pass.",
      },
    ],
    prompt: "Return the total of only the even numbers in `numbers` without using Python's `sum` function.\n\nStart a running total at zero. Visit one number at a time. A number is even when dividing it by 2 leaves a remainder of zero, written `number % 2 == 0`. Add only those values, then return the total after the loop.", fn: "sum_evens", starter: `def sum_evens(numbers):\n    pass`, solution: `def sum_evens(numbers):\n    total = 0\n    for number in numbers:\n        if number % 2 == 0:\n            total += number\n    return total`,
    tests: [t("mixed", "assert fn([1, 2, 3, 4]) == 6"), t("empty", "assert fn([]) == 0"), t("negative", "assert fn([-4, -3, 2]) == -2", true), t("all even", "assert fn([2, 4, 6]) == 12", true)],
  },
  {
    id: "iteration-tools", module: "py.m1", title: "Counting positions with range and enumerate", goal: "Use `range` for a deliberate count and `enumerate` when a loop needs both position and value.", requires: ["loops", "lists", "numbers"],
    model: "So far, every loop you have written walked through a list you already had, like `for name in names`. But two very common needs do not fit that shape: doing something a fixed number of times, and knowing an item's position while you loop. `range` and `enumerate` are the two small tools that cover exactly those needs. We will take them one at a time.\n\n**`range` makes numbers for you.** Think of it as a tiny machine that hands you one number at a time. `range(5)` gives you `0, 1, 2, 3, 4`. Two things surprise people at first: it starts at `0`, and it stops *before* the number you gave it. So `range(5)` is five numbers, `0` through `4`, and the `5` itself never appears. That 'stop before' rule shows up all over Python, and it matches list positions, which also start at `0`.\n\n```python\nfor i in range(5):\n    print(i)\n# 0\n# 1\n# 2\n# 3\n# 4\n```\n\nYou can give `range` more detail. `range(2, 6)` starts at `2` and stops before `6`, so you get `2, 3, 4, 5`. A third number is the **step** — how far to jump each time. `range(0, 10, 2)` counts `0, 2, 4, 6, 8`. A negative step counts *down*: `range(3, 0, -1)` gives `3, 2, 1`, still stopping before `0`. One more comfort: `range` never builds the whole list of numbers in memory. It just remembers the start, the stop, and the step, and hands you one value at a time — so even `range(1000000)` costs almost nothing.\n\n**`enumerate` gives you the position and the value together.** Often you loop over a list and want the item *and* its position number — say, to print a numbered list. Rather than track a counter by hand, `enumerate(names)` does it for you: each time through, it hands you two things at once — the position number first, then the value at that position.\n\nBecause it hands you two things, you catch them in two names separated by a comma: `for position, value in enumerate(names):`. On the first pass, `position` is `0` and `value` is the first item; on the next pass `position` is `1` and `value` is the second item, and so on. Writing two names to catch two values at once is a small, handy Python move you will meet again later.\n\n```python\nnames = [\"Ada\", \"Grace\"]\nfor position, name in enumerate(names):\n    print(position, name)\n# 0 Ada\n# 1 Grace\n```\n\n**Which one do you reach for?** If you only need each value, keep it simple with `for value in values`. If you also need the position, use `enumerate`. If you just want to count, or make a run of numbers, use `range`.",
    example: `scores = [90, 55, 80]\n\n# range: just the numbers 0, 1, 2 (stops before 3)\nfor i in range(3):\n    print(i)\n\n# enumerate: the position and the value together\nfor position, score in enumerate(scores):\n    print(position, score)\n\n# range counting down: 3, 2, 1 (stops before 0)\nfor n in range(3, 0, -1):\n    print(n)`,
    trace: "Start with `scores = [90, 55, 80]`. The first loop uses `range(3)`, which hands out `0`, then `1`, then `2` — three numbers, stopping before `3`. So it prints `0`, then `1`, then `2`, each on its own line.\n\nThe second loop uses `enumerate(scores)`. First pass: it hands over the position `0` and the value `90`, so `position` is `0` and `score` is `90`, and it prints `0 90`. Second pass: position `1`, value `55`, printing `1 55`. Third pass: position `2`, value `80`, printing `2 80`. The position numbers came from `enumerate`, not from the scores themselves.\n\nThe third loop uses `range(3, 0, -1)`: start at `3`, step by `-1` each time, stop before `0`. So it hands out `3`, then `2`, then `1`, and stops — `0` never appears because the range stops *before* its stop value. It prints `3`, then `2`, then `1`.",
    trap: "Two easy slips. First, `range` and list positions both start at `0`, and `range` stops *before* its stop number — so `range(3)` is `0, 1, 2`, not `1, 2, 3`. Only add one to a position when a human reader needs 'first, second, third' numbering. Second, a step of `0` is not allowed: with no movement the loop could never end, so Python refuses it.",
    rule: "Reach for `range` to make a run of numbers or repeat a fixed number of times, and for `enumerate` when a loop needs both the position and the value. Remember that both count from `0` and stop before the stop value.",
    recall: "What numbers does `range(1, 5)` produce, and what two things does `enumerate` hand you on each pass?",
    checks: [
      {
        question: "What does `range(4)` give you, one number at a time?",
        choices: [
          "`0, 1, 2, 3` — it starts at 0 and stops *before* 4",
          "`1, 2, 3, 4` — it counts from 1 up to 4",
          "`0, 1, 2, 3, 4` — every number from 0 through 4",
        ],
        answer: 0,
        why: [
          "Correct. `range` starts at `0` and stops before the number you give it, so `range(4)` is four numbers: `0, 1, 2, 3`.",
          "`range` starts at `0`, not `1`, unless you give it a start value like `range(1, 5)`.",
          "The stop value is excluded, so `4` itself never appears — that would be five numbers, not four.",
        ],
        explanation: "`range(n)` gives `0` up to but not including `n` — exactly `n` numbers, starting at `0`.",
      },
      {
        question: "In `for position, value in enumerate(colors):`, what are `position` and `value` on the very first pass?",
        choices: [
          "`position` is `0` and `value` is the first item in `colors`",
          "`position` is `1` and `value` is the first item in `colors`",
          "`position` is the first item and `value` is how many items there are",
        ],
        answer: 0,
        why: [
          "Correct. `enumerate` hands over the position first and the value second, and positions start at `0`, so the first pass gives `0` and the first item.",
          "Positions start at `0`, not `1`. You would only see `1` on the second pass.",
          "`enumerate` gives a position number and the item — not the item and a count. The two names catch those two values in order.",
        ],
        explanation: "`enumerate` yields `(position, value)` pairs starting at position `0`; the two names catch them in that order.",
      },
      {
        question: "You want to print each name with its place number, like `1. Ada`. Which tool fits best?",
        choices: [
          "`enumerate`, because it gives you the position and the value together",
          "`range` alone, because you only need numbers",
          "A plain `for name in names`, because position never matters",
        ],
        answer: 0,
        why: [
          "Correct. You need both the value (the name) and its position, and `enumerate` hands you both at once — add `1` to the position for human numbering.",
          "`range` gives numbers but not the names, so you would still have to reach back into the list — the clumsy path `enumerate` exists to replace.",
          "A plain `for name in names` never gives you the position, so you could not print the place number.",
        ],
        explanation: "When you need the value and where it sits, `enumerate` is the direct tool.",
      },
    ],
    prompt: "Return labels like `\"0: Ada\"` for every item in `names`, using `enumerate`.", fn: "index_labels", starter: `def index_labels(names):\n    pass`, solution: `def index_labels(names):\n    labels = []\n    for index, name in enumerate(names):\n        labels.append(f"{index}: {name}")\n    return labels`,
    tests: [t("several", `assert fn(["Ada", "Grace"]) == ["0: Ada", "1: Grace"]`), t("empty", "assert fn([]) == []"), t("one", `assert fn(["Linus"]) == ["0: Linus"]`, true)],
  },
  {
    id: "aggregation-tools", module: "py.m1", title: "Asking collection-wide questions", goal: "Use `len`, `sum`, `min`, `max`, `any`, `all`, and `zip` only when their collection-wide meaning matches the problem.", requires: ["iteration-tools", "booleans"],
    model: "Some questions are about a *whole* collection at once: how many items are there? what do they add up to? which is biggest? Python gives you a small family of built-in functions for exactly these whole-collection questions, so you do not have to hand-write a loop each time.\n\n**Counting and adding.** `len(values)` tells you how many items there are: `len([4, 9, 2])` is `3`, and it works on text too — `len(\"cat\")` is `3`. `sum(values)` adds numbers up, starting from `0`, so `sum([4, 9, 2])` is `15` and `sum([])` is `0`.\n\n```python\nscores = [4, 9, 2]\nprint(len(scores))   # 3\nprint(sum(scores))   # 15\n```\n\n**Finding the biggest or smallest.** `max(values)` returns the largest item and `min(values)` the smallest:\n\n```python\nscores = [4, 9, 2]\nprint(max(scores))   # 9\nprint(min(scores))   # 2\n```\n\nThese need at least one item — `max([])` raises an error, because nothing has no biggest. If an empty collection is possible, either check for it first or pass a fallback with `max([], default=0)`.\n\n**Yes/no across the whole collection.** `any(tests)` asks 'is at least one of these true?' and `all(tests)` asks 'are they all true?', where each test is `True` or `False`:\n\n```python\nprint(any([False, True, False]))  # True  (one was true)\nprint(all([True, True, False]))   # False (one was not)\nprint(any([]))                    # False\nprint(all([]))                    # True\n```\n\nThose last two are worth memorising: for an empty list, `any([])` is `False` and `all([])` is `True`.\n\n**Walking two lists side by side.** `zip(a, b)` pairs the first item of `a` with the first of `b`, the second with the second, and so on. It stops as soon as the shorter list runs out, so extra items on the longer side are quietly dropped.\n\n```python\nnames = [\"Ada\", \"Grace\"]\nscores = [90, 55, 80]\nfor name, score in zip(names, scores):\n    print(name, score)\n# Ada 90\n# Grace 55\n# the third score, 80, is dropped because names ran out\n```\n\nEach of these is really a common loop, pre-written for you. Reach for them when the whole-collection meaning fits the question — and always know what each one does with an empty collection.",
    example: `scores = [80, 95, 72]\nprint(len(scores))     # 3\nprint(sum(scores))     # 247\nprint(max(scores))     # 95\nprint(min(scores))     # 72\n\nnames = ["Ada", "Grace"]\nfor name, score in zip(names, scores):\n    print(name, score)`,
    trace: "With `scores = [80, 95, 72]`: `len(scores)` counts the items and returns `3`. `sum(scores)` adds `80 + 95 + 72` and returns `247`. `max(scores)` looks for the largest and returns `95`; `min(scores)` returns `72`.\n\nThen `zip(names, scores)` with `names = [\"Ada\", \"Grace\"]` pairs them up: first `\"Ada\"` with `80`, printing `Ada 80`; then `\"Grace\"` with `95`, printing `Grace 95`. Now `names` is out of items, so `zip` stops — the third score `72` is never paired, because there is no third name to go with it.",
    trap: "`min([])` and `max([])` on an empty collection raise `ValueError`, so handle the empty case first or pass a `default`. And do not lean on `zip` to check that two lists are the same length: it silently drops the extra items on the longer side, so if a mismatch would be a bug, compare the lengths yourself first.",
    rule: "Name the whole-collection question first — how many, total, biggest, smallest, any, all, paired — then reach for the built-in that means exactly that, and decide on purpose what should happen when the collection is empty.",
    recall: "What do `len`, `sum`, `max`, and `min` return for `[80, 95, 72]`, and what does `zip` do when its two lists are different lengths?",
    checks: [
      {
        question: "For an empty list, what do `any([])` and `all([])` return?",
        choices: [
          "`any([])` is `False` and `all([])` is `True`",
          "Both are `False`",
          "Both raise an error because the list is empty",
        ],
        answer: 0,
        why: [
          "Correct. `any` needs at least one true item to be true, and there are none, so it is `False`. `all` is true unless it finds a false item, and there are none to find, so it is `True`.",
          "`all([])` is `True`, not `False` — with no items, nothing fails the 'all' test.",
          "`any` and `all` accept an empty list happily; it is `min([])`/`max([])` that raise, not these.",
        ],
        explanation: "Empty-collection rule: `any([])` is `False` (found no true item) and `all([])` is `True` (found no false item).",
      },
      {
        question: "`prices` might be an empty list. What is the risk in writing `max(prices)`?",
        choices: [
          "It raises `ValueError` when `prices` is empty, because nothing has no maximum",
          "It returns `0` when `prices` is empty",
          "It returns `None` when `prices` is empty",
        ],
        answer: 0,
        why: [
          "Correct. `max` and `min` need at least one item; on an empty list they raise `ValueError`. Guard with an `if` first, or pass `max(prices, default=0)`.",
          "`max` does not invent a `0`; it raises instead. You can ask for that behaviour explicitly with `default=0`.",
          "`max` does not return `None` either; it raises `ValueError` unless you supply a `default`.",
        ],
        explanation: "`min`/`max` on an empty collection raise `ValueError`; handle empty first or pass a `default`.",
      },
      {
        question: "How many pairs does `zip([1, 2, 3], [\"a\", \"b\"])` produce?",
        choices: [
          "Two — `(1, \"a\")` and `(2, \"b\")`, because it stops at the shorter list",
          "Three, filling the missing one with `None`",
          "It raises an error because the lists are different lengths",
        ],
        answer: 0,
        why: [
          "Correct. `zip` stops as soon as the shortest input runs out, so the trailing `3` is dropped and you get two pairs.",
          "`zip` does not pad with `None`; it simply stops early, and the `3` is silently discarded.",
          "`zip` does not complain about mismatched lengths — which is exactly why you check lengths yourself when a mismatch would be a bug.",
        ],
        explanation: "`zip` stops at the shortest input and drops the rest, without raising.",
      },
    ],
    prompt: "Return the arithmetic mean of `numbers` using `sum` and `len`, or `None` for an empty list.", fn: "average_or_none", starter: `def average_or_none(numbers):\n    pass`, solution: `def average_or_none(numbers):\n    if not numbers:\n        return None\n    return sum(numbers) / len(numbers)`,
    tests: [t("integers", "assert fn([2, 4, 6]) == 4"), t("fraction", "assert fn([1, 2]) == 1.5"), t("empty", "assert fn([]) is None", true), t("single", "assert fn([5]) == 5", true)],
  },
  {
    id: "functions", module: "py.m1", title: "Designing small functions", goal: "Design a function around inputs, outputs, and observable side effects.", requires: ["first-function", "branching", "loops"],
    model: "You have written functions already. This lesson is about writing *good* ones — small, clear, and easy to trust. A helpful function is like a little machine: some things go **in** (its inputs, called **parameters**), one thing comes **out** (its **return value**), and ideally nothing surprising happens on the side.\n\n**Inputs and one output.** A function's parameters are the values it needs to do its job. `return` hands back the result and *ends the call right there* — any lines after a `return` that runs are skipped. A function can have several `return` lines for different cases; whichever one runs first wins.\n\n```python\ndef clamp(value, low, high):\n    if value < low:\n        return low      # too small -> give back the floor, and stop\n    if value > high:\n        return high     # too big -> give back the ceiling, and stop\n    return value        # already in range -> give it back unchanged\n```\n\n**Return is not the same as print.** This trips up a lot of beginners. `print` puts text on the screen for a *human* to read. `return` hands a value back to the *code that called the function*, so that code can keep working with it. If a function only prints, the caller gets nothing to use:\n\n```python\ndef double_wrong(n):\n    print(n * 2)        # shows it, but hands back nothing\n\ndef double_right(n):\n    return n * 2        # hands the value back to be used\n\nresult = double_right(5) + 1   # works: result is 11\n# double_wrong(5) + 1 would fail — there is nothing to add to\n```\n\n**Side effects.** A 'side effect' is anything a function does besides returning a value — printing, or changing a list that was passed in. Side effects are sometimes needed, but they should be *obvious*, ideally hinted by the name: a function called `save_file` clearly has an effect, while a function called `total` should probably just return a number and change nothing.\n\n**One job.** The best small functions do a single, nameable thing. If you find yourself wanting an 'and' in the name — `clean_and_save` — that is usually two functions. A good habit is to start a function with a one-line description in triple quotes (a **docstring**) saying what it returns, so a reader knows the deal without reading the body.",
    example: `def clamp(value, low, high):\n    """Return value limited to the range low..high (inclusive)."""\n    if value < low:\n        return low\n    if value > high:\n        return high\n    return value\n\nprint(clamp(5, 0, 10))    # 5  (already inside)\nprint(clamp(-2, 0, 10))   # 0  (raised up to the floor)\nprint(clamp(12, 0, 10))   # 10 (lowered to the ceiling)`,
    trace: "`clamp` takes a `value` and a `low`/`high` range and returns the value pushed inside that range. Call `clamp(5, 0, 10)`: is `5 < 0`? No. Is `5 > 10`? No. So it falls through to `return value` and gives back `5` unchanged.\n\nCall `clamp(-2, 0, 10)`: is `-2 < 0`? Yes — so `return low` runs, handing back `0`, and the call ends immediately; the later lines never run. Call `clamp(12, 0, 10)`: is `12 < 0`? No. Is `12 > 10`? Yes — `return high` hands back `10`. Each call takes exactly one path out, and `return` stops the function the moment it runs. The function changes nothing outside itself — it only returns a number.",
    trap: "Printing a value is not returning it. `print(x)` shows `x` to a human but hands the caller nothing, so `double_wrong(5) + 1` fails — there is no value to add to. If other code needs the result, `return` it. Use `print` only when a human, not more code, is the audience.",
    rule: "Give a function one clear job and a name that states it, take its inputs as parameters, hand back the result with `return`, and keep side effects rare and obvious. When in doubt, return a value rather than printing or quietly changing something.",
    recall: "What is the difference between `return` and `print` in a function, and why can a caller reuse one but not the other?",
    checks: [
      {
        question: "A function ends with `print(n * 2)` instead of `return n * 2`. Why can't the caller usefully write `answer = double(5)`?",
        choices: [
          "`print` shows the value but hands nothing back, so `double(5)` is `None` — there is no returned value to store",
          "`print` is too slow, so the assignment times out",
          "You cannot call a function that contains `print`",
        ],
        answer: 0,
        why: [
          "Correct. `print` is a side effect for humans; it does not return the number. A function with no `return` hands back `None`, so `answer` would be `None`, not `10`. Use `return` to give the caller a value.",
          "Speed has nothing to do with it — even an instant `print` hands back no value. The issue is that `print` shows while `return` gives back.",
          "Functions can absolutely contain `print`; the only problem is that printing is not the same as returning a usable value.",
        ],
        explanation: "`print` displays; `return` hands a value back. A function without `return` gives back `None`.",
      },
      {
        question: "In `clamp`, when `clamp(-2, 0, 10)` reaches `return low`, what happens to the lines below it?",
        choices: [
          "They are skipped — `return` ends the call immediately",
          "They run too, and the last `return` wins",
          "They run only if `low` is negative",
        ],
        answer: 0,
        why: [
          "Correct. The moment a `return` runs, the function stops and hands its value back; no later line in that call executes.",
          "Only one `return` runs per call — the first one reached. Later lines do not run after it.",
          "The value of `low` does not decide whether later lines run; reaching any `return` ends the call outright.",
        ],
        explanation: "`return` exits the function immediately; code after the executed return is skipped for that call.",
      },
      {
        question: "Which is the better-designed small function?",
        choices: [
          "One that takes inputs, returns a result, and changes nothing outside itself",
          "One that prints its result and also edits a shared list, all at once",
          "One named `do_stuff` that handles several unrelated tasks",
        ],
        answer: 0,
        why: [
          "Correct. A function that maps inputs to a returned result with no hidden side effects is easy to test, reuse, and trust.",
          "Doing two side-effecty things at once (printing AND editing shared state) makes a function hard to reuse and hard to predict; prefer returning a value.",
          "A vague name like `do_stuff` doing several things is the opposite of a small function — aim for one clear job and one clear name.",
        ],
        explanation: "Prefer small functions with one job, clear inputs, a returned result, and few, obvious side effects.",
      },
    ],
    prompt: "Implement inclusive `clamp(value, low, high)` using explicit branches.", fn: "clamp", starter: `def clamp(value, low, high):\n    pass`, solution: `def clamp(value, low, high):\n    if value < low:\n        return low\n    if value > high:\n        return high\n    return value`,
    tests: [t("inside", "assert fn(5, 0, 10) == 5"), t("low", "assert fn(-2, 0, 10) == 0"), t("high", "assert fn(12, 0, 10) == 10")],
  },
  {
    id: "lists", module: "py.m1", title: "Lists: your first collection", goal: "Create a list, read values by position, take a slice, and add or replace an item.", requires: ["branching"],
    model: "A **list** keeps several values together in a specific order. Write square brackets around comma-separated values: `[\"a\", \"b\", \"c\"]`. The values inside are called **elements** or items. A list may be empty, may hold repeated values, and may even mix types, although lists are usually clearest when their items share one meaning.\n\nEach item has an **index**, or numbered position, starting at zero. `values[0]` reads the first item. `values[1]` reads the second. `values[-1]` reads the last item. Asking for a position that does not exist raises `IndexError`, so an empty list must be handled before reading its first or last item.\n\nA **slice** reads a range and creates a new list. `values[1:3]` starts at index 1 and stops before index 3. The stop is excluded. Lists are mutable, meaning the existing list can change: `values[0] = \"new\"` replaces one item, and `values.append(\"d\")` adds an item at the end.\n\nSeeing it all at once:\n\n```python\nletters = [\"a\", \"b\", \"c\"]\nprint(letters[0])    # a   (first item, position 0)\nprint(letters[-1])   # c   (last item)\nprint(letters[1:])   # ['b', 'c']   (a NEW list)\nletters.append(\"d\")\nprint(letters)       # ['a', 'b', 'c', 'd']   (original changed)\n```\n\nThere is also a performance reason to favor the end of a list. Appending at the end is normally quick. Inserting or removing at the beginning makes Python shift every later item by one position. You do not need complexity notation yet; just remember that repeated work at the front becomes expensive as a list grows.",
    example: `queue = ["a", "b", "c"]\nfirst = queue[0]       # read the item at position zero\ntail = queue[1:]       # copy items from position one onward\nqueue.append("d")      # change the existing list at its end`,
    trace: "The list begins with three items at indexes 0, 1, and 2. `queue[0]` reads `\"a\"`. The slice `queue[1:]` starts at index 1 and continues to the end, creating the separate list `[\"b\", \"c\"]`. `append` changes the original `queue` by adding `\"d\"` at its end. The earlier slice remains `[\"b\", \"c\"]` because it is a different outer list.",
    trap: "Do not read `values[-1]` before checking whether the list contains an item. An empty list has no last position and raises `IndexError`. Also remember that a slice creates a new list while `append` changes the existing list.",
    rule: "Use a list when order and positions matter. Check that a requested position exists, use a slice when you want a new range, and use `append` when you intend to change the original list.",
    recall: "For `queue = [\"a\", \"b\", \"c\"]`, what do `queue[0]`, `queue[-1]`, and `queue[1:]` return, and which one creates a new list?",
    checks: [
      {
        question: "What does the slice `queue[1:]` produce?",
        choices: [
          "A new list of the items from index 1 onward; the original `queue` is unchanged",
          "It removes the first item from `queue`",
          "The single item at index 1",
        ],
        answer: 0,
        why: [
          "Correct. Slicing reads a range into a brand-new list and never changes the original.",
          "Slicing does not remove anything; the original `queue` keeps all its items.",
          "`queue[1:]` is a range from index 1 to the end, not a single item — that would be `queue[1]`.",
        ],
        explanation: "A slice creates a new list; the original is untouched. `append` is what changes the original.",
      },
      {
        question: "For `values = [\"a\", \"b\", \"c\"]`, what is `values[0]`, and what does `values[9]` do?",
        choices: [
          "`values[0]` is `\"a\"` (positions start at 0); `values[9]` raises `IndexError`",
          "`values[0]` is `\"b\"`; `values[9]` returns `None`",
          "`values[0]` is the whole list; `values[9]` returns the last item",
        ],
        answer: 0,
        why: [
          "Correct. Positions start at `0`, so `values[0]` is the first item `\"a\"`. Asking for a position that does not exist raises `IndexError`.",
          "Positions start at `0`, so index `0` is the first item `\"a\"`, not `\"b\"`; and a missing position raises rather than returning `None`.",
          "`values[0]` is one item, not the whole list; and `values[9]` does not clamp to the last item — it errors.",
        ],
        explanation: "Lists are zero-indexed; an out-of-range index raises `IndexError`.",
      },
      {
        question: "Which changes the original list: `queue.append(\"d\")` or `queue[1:]`?",
        choices: [
          "`append` changes the original; `queue[1:]` reads a new list and leaves the original alone",
          "Both change the original",
          "Neither changes the original",
        ],
        answer: 0,
        why: [
          "Correct. `append` mutates the existing list in place; a slice builds a separate new list without touching the original.",
          "A slice does not change the original — it only reads a range into a new list.",
          "`append` definitely changes the original by adding an item at the end.",
        ],
        explanation: "`append` mutates in place; slicing creates a new list.",
      },
    ],
    prompt: "Return the last item in `values`. When `values` is empty, return `None` instead.\n\nAn empty list acts as false in a condition. After handling that case, index `-1` reads the last item.", fn: "last_or_none", starter: `def last_or_none(values):\n    pass`, solution: `def last_or_none(values):\n    if not values:\n        return None\n    return values[-1]`,
    tests: [t("normal", "assert fn([1, 2, 3]) == 3"), t("single", `assert fn(["a"]) == "a"`), t("empty", "assert fn([]) is None", true)],
  },
  {
    id: "fstrings", module: "py.m1", title: "Building strings with f-strings", goal: "Insert values into text with f-strings instead of gluing pieces together by hand.", requires: ["strings", "numbers"],
    model: "An **f-string** is a string with the letter `f` written just before the opening quote. Inside it, each `{...}` is a **placeholder**: Python evaluates the expression inside the braces and drops its value into the text. `f\"Hi {name}\"` inserts the current value of `name`. This is called **interpolation**.\n\nAn f-string turns each value into text for you, so numbers and strings mix freely: `f\"score {points}\"` works even though `points` is a number. Building the same text by adding pieces would force a manual conversion of the number first and is easy to get wrong.\n\nThe braces can hold a small expression, and a colon inside them begins a format spec that controls display—rounding a number, padding a column—which you will reach for more once you have met dictionaries. The result is always a new string; the variables named inside stay exactly as they were.",
    example: `name = "Ada"\nscore = 91\n\ngreeting = f"Hi {name}, your score is {score}"   # "Hi Ada, your score is 91"\nrow = f"{name}: {score}"                         # "Ada: 91"`,
    trace: "Each `{...}` is evaluated and converted to text, then spliced into the surrounding characters. `{score}` inserts the number as `\"91\"` with no manual conversion. The literal colon and space in `\"{name}: {score}\"` sit outside the braces, so they appear verbatim. The f-string is a brand-new string, and `name` and `score` keep their values.",
    trap: "The `f` prefix is required. Without it, `\"{name}\"` is the literal six characters `{name}`, not the value. And an f-string builds text: `f\"{score}\"` produces the string `\"91\"`, which is not the same value as the number `91`.",
    rule: "Prefer an f-string to build text from values: write each value inside `{}` and let the f-string convert it.",
    recall: "Why does `f\"count: {n}\"` insert the value of `n`, while `\"count: {n}\"` keeps the braces as literal text?",
    check: {
      question: "With `name` = `\"Ada\"` and `age` = `30`, what does `f\"{name} is {age}\"` produce?",
      choices: ["\"Ada is 30\" — each `{}` is replaced by its value, converted to text", "\"{name} is {age}\" — the braces stay literal"],
      answer: 0,
      explanation: "The `f` prefix turns each `{...}` into the value of the expression inside, converting numbers to text automatically. Without the `f`, the braces would be literal characters.",
    },
    prompt: "Return the line `\"<name>: <score>\"` built with a single f-string.\n\nFor example, `score_line(\"Ada\", 91)` returns `\"Ada: 91\"`.", fn: "score_line", starter: `def score_line(name, score):\n    pass`, solution: `def score_line(name, score):\n    return f"{name}: {score}"`,
    tests: [t("pair", `assert fn("Ada", 91) == "Ada: 91"`), t("number", `assert fn("Bo", 0) == "Bo: 0"`), t("empty name", `assert fn("", 5) == ": 5"`)],
  },
  {
    id: "text-split", module: "py.m1", title: "Splitting and joining text", goal: "Turn a string into a list of words and a list of strings back into text.", requires: ["strings", "lists"],
    model: "Two string methods move between text and a list of pieces. `text.split()` breaks a string into a list. With no argument it splits on runs of whitespace and drops empty pieces, so `\"  a  b \".split()` is `[\"a\", \"b\"]`. Given a **separator** string, it splits on that exact separator instead: `\"a,b,,c\".split(\",\")` is `[\"a\", \"b\", \"\", \"c\"]`.\n\n`separator.join(pieces)` is the inverse. The separator is the string you call `join` on, and it is placed *between* the items: `\" \".join([\"a\", \"b\", \"c\"])` is `\"a b c\"`. The separator owns the operation, not the list.\n\nBoth return new values and leave the original untouched. `join` requires every item to already be a string.",
    example: `sentence = "  the quick   brown fox  "\nwords = sentence.split()      # ["the", "quick", "brown", "fox"]\nspaced = " ".join(words)      # "the quick brown fox"\ncsv = ",".join(words)         # "the,quick,brown,fox"`,
    trace: "`split()` with no argument ignores the leading, trailing, and repeated spaces and returns four words. `join` places one separator between items, so four words need three separators. The separator string, not the list, is what `join` is called on.",
    trap: "`\",\".join([1, 2])` raises `TypeError`: `join` only accepts strings, so convert numbers first with `str`. And `\"a  b\".split()` collapses repeated whitespace, while `\"a  b\".split(\" \")` keeps an empty string between the two spaces—choose the one whose rule you actually want.",
    rule: "Use `text.split()` to turn text into a list of words, and `separator.join(pieces)` to turn a list of strings back into text.",
    recall: "What does `\" \".join([\"a\", \"b\", \"c\"])` produce, and why does `\",\".join([1, 2])` raise an error?",
    check: {
      question: "What does `\" \".join([\"a\", \"b\", \"c\"])` produce?",
      choices: ["\"a b c\" — the separator is placed between the items", "\"abc\" — the separator is ignored"],
      answer: 0,
      explanation: "`join` puts the separator string between each pair of items, so three items joined by a space become one string with two spaces inside it.",
    },
    prompt: "Return the first whitespace-separated word in `text`, or `\"\"` when there are none.\n\nFor example, `first_word(\"  the quick brown  \")` returns `\"the\"`.", fn: "first_word", starter: `def first_word(text):\n    pass`, solution: `def first_word(text):\n    words = text.split()\n    if not words:\n        return ""\n    return words[0]`,
    tests: [t("first", `assert fn("the quick brown") == "the"`), t("trims", `assert fn("   solo  ") == "solo"`), t("empty", `assert fn("   ") == ""`, true)],
  },
  {
    id: "dict-iteration", module: "py.m2", title: "Looping over dictionaries", goal: "Walk a dictionary's keys, values, or pairs, and change it safely.", requires: ["dicts", "loops"],
    model: "Looping over a dictionary is easy once you know one surprising default: **looping over a dict directly gives you its keys**, not its values.\n\n```python\nprices = {\"pen\": 2, \"mug\": 7}\nfor name in prices:\n    print(name)\n# pen\n# mug\n```\n\nThe keys come out in the order they were added. To get the values instead, ask for `.values()`; to get **both the key and the value together**, ask for `.items()`, which hands you a `(key, value)` pair each time — unpack it into two names:\n\n```python\nfor name, price in prices.items():\n    print(name, price)\n# pen 2\n# mug 7\n```\n\nYou *could* loop the keys and write `prices[name]` to fetch each value, but `.items()` hands you the value directly — cleaner, and it skips a second lookup. Reach for `.items()` whenever you need both parts.\n\n**One safety rule:** do not add or remove keys while you are looping over a dictionary. Changing its size mid-loop makes Python raise a `RuntimeError`. If you need to change it, collect the keys to change in a list first, then apply the changes after the loop ends.",
    example: `prices = {"pen": 2, "mug": 7}\n\nfor name in prices:                 # keys, in insertion order\n    print(name)                     # pen, then mug\n\nfor price in prices.values():       # values only\n    print(price)                    # 2, then 7\n\nfor name, price in prices.items():  # key and value together\n    print(name, price)              # pen 2, then mug 7`,
    trace: "`for name in prices` binds `name` to each key in turn — `\"pen\"`, then `\"mug\"` — in the order they were added, printing the names only. `for price in prices.values()` walks the stored values instead: `2`, then `7`. `for name, price in prices.items()` asks for one `(key, value)` pair each pass and unpacks it, so `name` is `\"pen\"` and `price` is `2`, then `\"mug\"` and `7` — giving both parts at once.",
    trap: "Two things to remember. First, `for x in my_dict` gives *keys*, not values — a common surprise. Second, do not add or delete keys while looping the dictionary: changing its size mid-loop raises `RuntimeError`. Collect the keys you want to change into a list first, then change the dict after the loop.",
    rule: "Loop `.items()` when you need the key and the value together, `.values()` for values alone, and the bare dictionary when you only need keys — and never resize a dictionary while looping over it.",
    recall: "What does `for x in my_dict` bind `x` to, and how do you get the key and value together in one loop?",
    checks: [
      {
        question: "What does `x` become on each pass of `for x in {\"a\": 1, \"b\": 2}`?",
        choices: [
          "The keys: `\"a\"`, then `\"b\"`",
          "The values: `1`, then `2`",
          "The pairs: `(\"a\", 1)`, then `(\"b\", 2)`",
        ],
        answer: 0,
        why: [
          "Correct. Looping a dict directly yields its keys, in insertion order. Use `.values()` for values or `.items()` for pairs.",
          "Values come from `.values()`, not from looping the dict directly.",
          "Pairs come from `.items()`. The bare loop gives keys only.",
        ],
        explanation: "`for x in d` yields keys; `.values()` gives values, `.items()` gives (key, value) pairs.",
      },
      {
        question: "You need each name AND its price in one loop. What do you write?",
        choices: [
          "`for name, price in prices.items():`",
          "`for name in prices.values():`",
          "`for name, price in prices:`",
        ],
        answer: 0,
        why: [
          "Correct. `.items()` yields a `(key, value)` pair each pass, which you unpack into `name` and `price` — both parts, no extra lookup.",
          "`.values()` gives only the prices; you would lose the names.",
          "Looping the bare dict gives keys, so unpacking into two names fails — a key is a single value, not a pair.",
        ],
        explanation: "Use `.items()` and unpack into two names to get key and value together.",
      },
      {
        question: "Why can adding keys to a dict inside a `for key in d:` loop crash?",
        choices: [
          "Changing the dict's size mid-loop raises `RuntimeError`; collect changes first, apply after",
          "You can never add to a dict once it is created",
          "Adding keys is fine and never causes a problem",
        ],
        answer: 0,
        why: [
          "Correct. Resizing a dictionary while iterating it makes Python raise `RuntimeError`. Gather the keys to change in a list first, then modify the dict after the loop.",
          "Dicts can be added to freely — just not while you are looping over that same dict.",
          "It is not always fine: changing the size during iteration is exactly what triggers the error.",
        ],
        explanation: "Do not resize a dict during iteration; collect changes and apply them after the loop.",
      },
    ],
    prompt: "Given a dictionary `scores` mapping names to numbers, return a list of `\"name: score\"` strings, one per entry, in insertion order.\n\nFor example, `score_lines({\"Ada\": 91, \"Bo\": 88})` returns `[\"Ada: 91\", \"Bo: 88\"]`.", fn: "score_lines", starter: `def score_lines(scores):\n    pass`, solution: `def score_lines(scores):\n    lines = []\n    for name, score in scores.items():\n        lines.append(f"{name}: {score}")\n    return lines`,
    tests: [t("pairs", `assert fn({"Ada": 91, "Bo": 88}) == ["Ada: 91", "Bo: 88"]`), t("empty", `assert fn({}) == []`), t("one", `assert fn({"x": 5}) == ["x: 5"]`)],
  },
  {
    id: "collections", module: "py.m3", title: "Handy containers from collections", goal: "Reach for Counter, defaultdict, and deque instead of rebuilding them by hand.", requires: ["dicts", "imports"],
    model: "The standard library's `collections` module ships containers that make everyday patterns shorter than a plain dictionary.\n\n`Counter(iterable)` tallies how often each item appears and returns a dict-like count, with `.most_common(n)` for the top entries. `defaultdict(list)` creates a missing value the first time a key is used, so grouping needs no 'is this key here yet?' check. `deque` is a double-ended queue with fast appends and pops at *both* ends, where a list is slow to pop from the front.",
    example: `from collections import Counter, defaultdict\n\ntally = Counter("mississippi")      # counts each letter\ntop = tally.most_common(1)          # [("i", 4)]\n\ngroups = defaultdict(list)\nfor word in ["ant", "bee", "at"]:\n    groups[word[0]].append(word)    # grouped by first letter`,
    trace: "`Counter` walks the text once and tallies each letter, so `most_common(1)` returns the single highest count. `defaultdict(list)` makes an empty list the first time each new first-letter key is touched, so `.append` always has a list to add to—no missing-key guard.",
    trap: "A `defaultdict` inserts a key the moment you *read* a missing one, which can quietly grow the dictionary; use a plain dict with `.get` when a lookup must not insert. And use a `deque` for a queue—calling `pop(0)` on a list repeatedly is slow because every later item shifts down.",
    rule: "Reach for `Counter` to tally, `defaultdict` to group without guard clauses, and `deque` when you add and remove at both ends.",
    recall: "What does `defaultdict(list)` do the first time you access a key that is not already present?",
    check: {
      question: "You need to count how often each word appears in a list. Which is cleanest?",
      choices: ["`Counter(words)`", "A plain dict with a manual `if key in counts` check on every word"],
      answer: 0,
      explanation: "`Counter` tallies an iterable in one call and supports `.most_common`. The manual version just reimplements it by hand.",
    },
    prompt: "Return the `n` most common items in `values` as a list of `(item, count)` pairs, most frequent first. Use `collections.Counter`.\n\nFor example, `top_n([\"a\", \"b\", \"a\", \"c\", \"a\", \"b\"], 2)` returns `[(\"a\", 3), (\"b\", 2)]`.", fn: "top_n", starter: `from collections import Counter\n\ndef top_n(values, n):\n    pass`, solution: `from collections import Counter\n\ndef top_n(values, n):\n    return Counter(values).most_common(n)`,
    tests: [t("top", `assert fn(["a", "b", "a", "c", "a", "b"], 2) == [("a", 3), ("b", 2)]`), t("empty", `assert fn([], 3) == []`), t("one", `assert fn(["x", "x"], 1) == [("x", 2)]`)],
  },
  {
    id: "slicing", module: "py.m1", title: "Slicing with a step", goal: "Select ranges with a step, reverse with a slice, and copy without mutating.", requires: ["lists", "strings"],
    model: "You have used the two-part slice `values[start:stop]`. A slice takes an optional third number, the **step**: `values[::2]` selects every second item. A negative step walks backward, so `values[::-1]` is the whole sequence reversed—the standard way to reverse a list or string.\n\nOmitting `start` or `stop` means \"from the beginning\" or \"to the end,\" and the stop is always excluded. A slice builds a new sequence, so `values[:]` is a quick shallow copy. Slice bounds are also forgiving: an out-of-range stop is clamped rather than raising, unlike a single index.",
    example: `letters = ["a", "b", "c", "d", "e"]\nevery_other = letters[::2]    # ["a", "c", "e"]\nbackward = letters[::-1]      # ["e", "d", "c", "b", "a"]\nmiddle = letters[1:4]         # ["b", "c", "d"]`,
    trace: "`[::2]` starts at the beginning and steps by two. `[::-1]` uses a step of -1, starting at the end and walking to the front, which produces a reversed copy. `[1:4]` takes indices 1, 2, and 3 because the stop is excluded. Each slice is a new list, and `letters` is unchanged.",
    trap: "A slice never raises for out-of-range bounds—`letters[1:99]` simply stops at the end—so it will not catch a bad range the way `letters[99]` catches a bad index. And `letters[::-1]` reverses into a new list; reversing in place is `letters.reverse()`.",
    rule: "Use the third slice number for a step, `[::-1]` to reverse, and `[:]` for a shallow copy; a slice never mutates the original.",
    recall: "What does `values[::-1]` produce, and does it change `values`?",
    check: {
      question: "What does `\"hello\"[::-1]` produce?",
      choices: ["\"olleh\" — a reversed copy", "\"hello\" — the step is ignored"],
      answer: 0,
      explanation: "A step of -1 walks the sequence backward into a new copy. The original string is unchanged, since strings are immutable.",
    },
    prompt: "Return `text` reversed, using a slice.\n\nFor example, `reverse(\"abc\")` returns `\"cba\"`.", fn: "reverse", starter: `def reverse(text):\n    pass`, solution: `def reverse(text):\n    return text[::-1]`,
    tests: [t("word", `assert fn("abc") == "cba"`), t("empty", `assert fn("") == ""`, true), t("single", `assert fn("a") == "a"`, true)],
  },
  {
    id: "format-specs", module: "py.m2", title: "Formatting numbers and columns", goal: "Control how a value is displayed with an f-string format spec.", requires: ["fstrings", "dicts"],
    model: "An f-string can do more than drop a value in — it can control *how* the value looks, using a **format spec** written after a colon: `{value:spec}`. It changes the displayed text only; the value itself is never changed.\n\nHere are the ones you will use most, each with an example:\n\n```python\nprice = 3.5\ncount = 1234567\n\nprint(f\"{price:.2f}\")    # 3.50      — a float with exactly 2 decimals\nprint(f\"{count:,}\")      # 1,234,567 — group thousands with commas\nprint(f\"{0.75:.1%}\")     # 75.0%     — show a fraction as a percentage\nprint(f\"{7:03d}\")        # 007       — pad an integer to width 3 with zeros\n```\n\n**Lining things up (alignment).** A number after `>`, `<`, or `^` sets a column width and how the value sits in it: `>` right, `<` left, `^` center.\n\n```python\nprint(f\"{'a':>6}\")   # '     a'  (right-aligned in 6 spaces)\nprint(f\"{'a':<6}\")   # 'a     '  (left-aligned)\nprint(f\"{'a':^6}\")   # '  a   '  (centered)\n```\n\nAligning to a fixed width is what makes columns of numbers or a little table line up neatly.\n\n**The key idea:** the spec formats the *text*, not the number. `f\"{price:.2f}\"` builds the string `\"3.50\"` — `price` is still exactly `3.5`. The type letter matters: `f` for floats, `d` for whole numbers, `%` for percentages; pairing the wrong letter with a value raises an error.",
    example: `price = 3.5\ncount = 1234567\n\nprint(f"{price:.2f}")     # 3.50\nprint(f"{count:,}")       # 1,234,567\nprint(f"{0.75:.1%}")      # 75.0%\nprint(f"{7:03d}")         # 007\nprint(f"{'hi':>6}")       # '    hi'`,
    trace: "Each colon starts a format spec that shapes the text. `{price:.2f}` rounds `3.5` to two decimals *for display*, producing `\"3.50\"` — but `price` is still `3.5`. `{count:,}` inserts thousands separators, giving `\"1,234,567\"`. `{0.75:.1%}` multiplies by 100 and adds a percent sign to one decimal: `\"75.0%\"`. `{7:03d}` pads the integer `7` to width three with leading zeros: `\"007\"`. `{'hi':>6}` places `hi` into a six-wide column, right-aligned: four spaces then `hi`. In every case a new string is built and the original value is untouched.",
    trap: "A format spec changes only the text, never the value: `f\"{price:.2f}\"` gives the string `\"3.50\"`, not a rounded number — `price` stays `3.5`. And the type letter must match the value: `f` for floats, `d` for integers, `%` for percentages. Pairing a spec with the wrong kind of value (like `d` on a float) raises `ValueError`.",
    rule: "Put presentation — decimal places, thousands commas, percentage, width, alignment — in the format spec after the colon, so the value itself stays exact and only its displayed text changes.",
    recall: "In `f\"{price:.2f}\"`, what does `.2f` change and what does it leave unchanged, and what do `>8`, `<8`, and `^8` do?",
    checks: [
      {
        question: "What does `f\"{1/3:.2f}\"` produce, and what is `1/3` afterward?",
        choices: [
          "The string `\"0.33\"`, while `1/3` is still the full unrounded number",
          "The rounded number `0.33`",
          "An error, because you cannot format a division",
        ],
        answer: 0,
        why: [
          "Correct. `.2f` shapes the displayed text to two decimals, building `\"0.33\"`. The underlying value is untouched — only the string is shorter.",
          "The result is a string, not a rounded number; format specs change how a value is shown, not the value.",
          "`1/3` is computed first, then formatted — there is no error; you get `\"0.33\"`.",
        ],
        explanation: "A format spec builds a formatted string; the original number keeps its exact value.",
      },
      {
        question: "What does `f\"{n:>8}\"` do?",
        choices: [
          "Right-aligns `n` in a column 8 characters wide",
          "Rounds `n` to 8 decimal places",
          "Repeats `n` eight times",
        ],
        answer: 0,
        why: [
          "Correct. `>` means right-align and `8` is the column width, so short values get padded on the left to fill eight characters — handy for lining up columns.",
          "Decimal places are set with `.8f`, not `>8`; `>` is about alignment and width.",
          "`>8` does not repeat the value; it pads it into an 8-wide field.",
        ],
        explanation: "`>`, `<`, `^` set alignment and the number sets the field width, for lining up columns.",
      },
      {
        question: "You have `ratio = 0.5` and want to show `50%`. Which spec?",
        choices: [
          "`f\"{ratio:.0%}\"`",
          "`f\"{ratio:.2f}\"`",
          "`f\"{ratio:,}\"`",
        ],
        answer: 0,
        why: [
          "Correct. The `%` type multiplies by 100 and adds a percent sign; `.0` means zero decimals, so `0.5` shows as `50%`.",
          "`.2f` would show `0.50` — a two-decimal float, not a percentage.",
          "`,` adds thousands separators to big numbers; it does not turn a fraction into a percentage.",
        ],
        explanation: "The `%` type shows a fraction as a percentage (×100 with a % sign); `.0` sets zero decimals.",
      },
    ],
    prompt: "Return `amount` formatted as a dollar string with exactly two decimals.\n\nFor example, `money(3.5)` returns `\"$3.50\"`.", fn: "money", starter: `def money(amount):\n    pass`, solution: `def money(amount):\n    return f"\${amount:.2f}"`,
    tests: [t("cents", `assert fn(3.5) == "$3.50"`), t("rounds", `assert fn(3.14159) == "$3.14"`), t("whole", `assert fn(1) == "$1.00"`, true)],
  },
  {
    id: "unpacking", module: "py.m2", title: "Unpacking and spreading", goal: "Split sequences apart and spread them into new collections and calls.", requires: ["tuples", "dicts"],
    model: "You have already unpacked a tuple: `x, y = point` splits it into two names. This lesson collects the family of star (`*`) tricks for splitting sequences apart and joining them back together.\n\n**A starred name grabs 'the rest.'** When you unpack, one name can wear a star, and it scoops up all the leftover items into a list:\n\n```python\nfirst, *rest = [10, 20, 30, 40]\nprint(first)   # 10\nprint(rest)    # [20, 30, 40]   — everything else, as a list\n```\n\nYou may have only one starred name in an unpacking — two would be ambiguous about where the middle ends.\n\n**A star also spreads a sequence into a new one.** Putting a starred list inside a new list drops its items in place — a clean way to join lists:\n\n```python\na = [1, 2]\nb = [3, 4]\njoined = [*a, *b]      # [1, 2, 3, 4]\nwith_extra = [*a, 99]  # [1, 2, 99]\n```\n\n**Dictionaries use a double star to merge.**\n\n```python\ndefaults = {\"color\": \"red\", \"size\": \"M\"}\nchosen = {**defaults, \"size\": \"L\"}\nprint(chosen)   # {'color': 'red', 'size': 'L'}\n```\n\nWhen the same key appears twice, the later one wins — here the chosen size overrides the default. Merging copies left to right, so order matters.\n\n(There is one more use — spreading a list or dict into a function *call* as its arguments — which makes more sense after the parameters lesson; you can file it away for now.)",
    example: `first, *rest = [10, 20, 30, 40]\nprint(first, rest)          # 10 [20, 30, 40]\n\na = [1, 2]\nb = [3, 4]\nprint([*a, *b])             # [1, 2, 3, 4]\n\ndefaults = {"size": "M", "color": "red"}\nprint({**defaults, "size": "L"})  # {'size': 'L', 'color': 'red'}`,
    trace: "Unpacking `[10, 20, 30, 40]` with a starred name for the rest gives the first name the value `10`, and the starred name gathers everything left over into a list, `[20, 30, 40]`.\n\nSpreading two lists into a new one drops each list's items inline: from `[1, 2]` and `[3, 4]` you get `[1, 2, 3, 4]` — a tidy way to join them.\n\nMerging two dictionaries copies the first, then applies the second, so a repeated key keeps the later value: starting from a default size of `M` and then setting `L` leaves the size as `L`, while the untouched color stays `red`.",
    trap: "An unpacking may have only one starred name — two would be ambiguous about where the middle ends. And when merging two dictionaries, a key that appears in both keeps the value from the later one, so the second dictionary overrides the first. Order matters.",
    rule: "Use a single starred name to peel the front or ends off a sequence into a list, and a star or double star to spread lists and dictionaries into new ones — remembering that a repeated dictionary key keeps its last value.",
    recall: "After unpacking `[10, 20, 30, 40]` with a starred name for the rest, what do the first name and the starred name hold, and when two dicts are merged and share a key, whose value wins?",
    checks: [
      {
        question: "What is `{**{\"a\": 1}, **{\"a\": 9}}`?",
        choices: [
          "`{\"a\": 9}` — when a key repeats, the later value wins",
          "`{\"a\": 1}` — the first value wins",
          "`{\"a\": [1, 9]}` — both values are kept in a list",
        ],
        answer: 0,
        why: [
          "Correct. Merging copies left to right, so the second `\"a\": 9` overrides the first `\"a\": 1`.",
          "The first value does not win — later entries override earlier ones in a merge.",
          "A dict keeps one value per key; it does not collect both into a list. The last one replaces the earlier.",
        ],
        explanation: "In `{**a, **b}`, a shared key keeps `b`'s value — later wins.",
      },
      {
        question: "After `head, *tail = [1, 2, 3, 4]`, what is `tail`?",
        choices: [
          "`[2, 3, 4]` — the starred name gathers the rest into a list",
          "`2` — just the next value",
          "`(2, 3, 4)` — a tuple of the rest",
        ],
        answer: 0,
        why: [
          "Correct. `head` takes `1`, and the starred `tail` collects all remaining items into a list, `[2, 3, 4]`.",
          "A starred name does not take a single value; it gathers all the leftovers.",
          "The gathered leftovers come back as a list, not a tuple, even if the source was a tuple.",
        ],
        explanation: "A starred target collects the remaining items into a list.",
      },
      {
        question: "How do you join `a = [1, 2]` and `b = [3, 4]` into `[1, 2, 3, 4]` with spreading?",
        choices: [
          "`[*a, *b]`",
          "`[a, b]`",
          "`{**a, **b}`",
        ],
        answer: 0,
        why: [
          "Correct. `*a` and `*b` drop each list's items inline into the new list, producing `[1, 2, 3, 4]`.",
          "`[a, b]` makes a list containing two lists: `[[1, 2], [3, 4]]`, not their items joined.",
          "`**` is for merging dictionaries, not lists — using it on lists is not how you join them.",
        ],
        explanation: "`[*a, *b]` spreads both lists' items into one new list; `**` is for dicts.",
      },
    ],
    prompt: "Merge two dictionaries into a new one; when a key appears in both, the value from `override` wins. Do not mutate either input.\n\nFor example, `merge({\"a\": 1, \"b\": 2}, {\"b\": 9})` returns `{\"a\": 1, \"b\": 9}`.", fn: "merge", starter: `def merge(base, override):\n    pass`, solution: `def merge(base, override):\n    return {**base, **override}`,
    tests: [t("override", `assert fn({"a": 1, "b": 2}, {"b": 9}) == {"a": 1, "b": 9}`), t("empty", `assert fn({}, {}) == {}`), t("disjoint", `assert fn({"x": 1}, {"y": 2}) == {"x": 1, "y": 2}`, true)],
  },
  {
    id: "itertools", module: "py.m5", title: "Combining and grouping with itertools", goal: "Enumerate choices and collapse runs with lazy iterator tools.", requires: ["iterators", "imports"],
    model: "The `itertools` module builds and combines iterators lazily, so you describe the sequence without first materializing it.\n\n`combinations(items, k)` yields each unordered group of `k` items once. `permutations(items, k)` yields ordered arrangements. `product(a, b)` yields every pairing across two iterables—the same shape as a nested loop. `groupby(items, key=...)` yields runs of *consecutive* items that share a key, so you sort by that key first. `chain(a, b)` streams several iterables as one.\n\nEach returns a one-shot iterator; wrap it in `list` when you need a concrete, reusable result.",
    example: `from itertools import combinations, product\n\npairs = list(combinations([1, 2, 3], 2))   # [(1, 2), (1, 3), (2, 3)]\ngrid = list(product("ab", [1, 2]))         # [('a',1),('a',2),('b',1),('b',2)]`,
    trace: "`combinations` yields each unordered pair once, in input order, never repeating a chosen index. `product` walks the second iterable fastest, exactly like a nested loop, producing every combination across the inputs. Both are lazy, so `list(...)` is what turns them into a concrete list.",
    trap: "`groupby` only groups *adjacent* equal-key items, so sort by the same key first or one logical group comes back fragmented. And because these are one-shot iterators, iterating a second time yields nothing—store `list(...)` if you need to reuse it.",
    rule: "Reach for `combinations` and `permutations` to enumerate choices, `product` for nested loops over inputs, and `groupby` (after sorting) to collapse runs.",
    recall: "Why must you sort a sequence before grouping it with `itertools.groupby`?",
    check: {
      question: "Before calling `itertools.groupby(items, key=f)`, what do you need to do?",
      choices: ["Sort `items` by the same key `f` — groupby only groups adjacent equal-key items", "Nothing — it gathers all matching items automatically"],
      answer: 0,
      explanation: "`groupby` only collapses consecutive equal-key items. Sort by the key first, or one group comes back split into pieces.",
    },
    prompt: "Return every unordered pair `(i, j)` with `i` before `j` from `values`, using `itertools.combinations`.\n\nFor example, `pairs([1, 2, 3])` returns `[(1, 2), (1, 3), (2, 3)]`.", fn: "pairs", starter: `from itertools import combinations\n\ndef pairs(values):\n    pass`, solution: `from itertools import combinations\n\ndef pairs(values):\n    return list(combinations(values, 2))`,
    tests: [t("three", `assert fn([1, 2, 3]) == [(1, 2), (1, 3), (2, 3)]`), t("one", `assert fn([1]) == []`), t("empty", `assert fn([]) == []`, true)],
  },
  {
    id: "caching", module: "py.m6", title: "Memoizing with functools.lru_cache", goal: "Turn repeated work into cache hits, and know when it is safe.", requires: ["decorators", "dicts"],
    model: "When a function is called repeatedly with the same arguments, storing each result lets later calls reuse it instead of recomputing. `functools.lru_cache` is a decorator that does exactly this: it remembers each argument tuple's return value, so the second call with the same arguments is instant.\n\nThat single line turns exponential repeated work—like naive recursive Fibonacci, which recomputes the same subproblems over and over—into linear time. The cache is a dictionary underneath, so the arguments must be **hashable**. `maxsize` bounds how many results are kept, evicting the least recently used; `maxsize=None` keeps them all.",
    example: `from functools import lru_cache\n\n@lru_cache(maxsize=None)\ndef fib(n):\n    if n < 2:\n        return n\n    return fib(n - 1) + fib(n - 2)`,
    trace: "The first `fib(30)` fills the cache as it recurses, and every later subproblem is a cache hit, so the whole call is O(n) instead of exponential. `maxsize=None` retains every result; a finite size would cap the cache and drop the least recently used entry.",
    trap: "The decorated function's arguments must be hashable, so a `list` argument fails—pass a `tuple` instead. And caching a function with side effects, or one whose result depends on outside state that changes, hands back stale answers.",
    rule: "Add `@lru_cache` to a pure function whose repeated calls with identical arguments are the bottleneck.",
    recall: "Why must the arguments to an `lru_cache`-decorated function be hashable?",
    check: {
      question: "What does `@lru_cache` do to a naive recursive `fib(n)`?",
      choices: ["Turns exponential repeated work into linear time by reusing stored results", "Makes every call slower because of caching overhead"],
      answer: 0,
      explanation: "Each subproblem is computed once and then reused, so the repeated recomputation that made naive recursion exponential disappears.",
    },
    prompt: "Return the nth Fibonacci number (`fib(0) = 0`, `fib(1) = 1`) using `functools.lru_cache` so repeated subproblems are not recomputed.\n\nFor example, `fib(10)` returns `55`.", fn: "fib", starter: `from functools import lru_cache\n\n@lru_cache(maxsize=None)\ndef fib(n):\n    pass`, solution: `from functools import lru_cache\n\n@lru_cache(maxsize=None)\ndef fib(n):\n    if n < 2:\n        return n\n    return fib(n - 1) + fib(n - 2)`,
    tests: [t("base", `assert fn(0) == 0 and fn(1) == 1`), t("tenth", `assert fn(10) == 55`), t("twentieth", `assert fn(20) == 6765`, true)],
  },
  {
    id: "tuples", module: "py.m2", title: "Tuples and unpacking", goal: "Use fixed-shape records and unpack them safely.", requires: ["lists"],
    model: "A **tuple** is like a list, but with one big difference: once you make it, you cannot change it — it is **immutable**. You write one with parentheses instead of square brackets: `point = (4, 7)`. Reach for a tuple when a group of values forms one fixed little record whose shape never changes — an (x, y) coordinate, or a (name, age) pair. Reach for a list when you plan to add, remove, or change items.\n\n```python\npoint = (4, 7)\nprint(point[0])   # 4  — you read by position, just like a list\n# point[0] = 9    # ERROR — a tuple cannot be changed\n```\n\n**Unpacking** is the handy trick of pulling a tuple (or list) apart into separate names in one line:\n\n```python\npoint = (4, 7)\nx, y = point      # x becomes 4, y becomes 7\nprint(x, y)       # 4 7\n```\n\nThe number of names on the left must match the number of values, or Python complains. There is also a *starred* name that scoops up 'the rest' into a list:\n\n```python\nfirst, *middle, last = [1, 2, 3, 4]\nprint(first)      # 1\nprint(middle)     # [2, 3]   — everything in between\nprint(last)       # 4\n```\n\n**One gotcha to remember:** a tuple with a single item needs a trailing comma. `(5)` is just the number `5` in parentheses; `(5,)` is a one-item tuple. The comma — not the parentheses — is what makes a tuple.\n\nWhy do tuples exist if lists can do more? Because 'cannot change' is sometimes exactly what you want: it signals 'this is a fixed record', and it lets tuples be used in places lists cannot — such as dictionary keys, which you will meet very soon.",
    example: `point = (4, 7)\nx, y = point\nprint(x, y)          # 4 7\n\nfirst, *middle, last = [1, 2, 3, 4]\nprint(first, last)   # 1 4\nprint(middle)        # [2, 3]\n\nsolo = (5,)          # one-item tuple needs the comma\nprint(len(solo))     # 1`,
    trace: "`point = (4, 7)` makes a fixed two-item record. `x, y = point` is unpacking: Python matches the two names to the two values, so `x` is `4` and `y` is `7`, and it prints `4 7`.\n\n`first, *middle, last = [1, 2, 3, 4]` gives the first value to `first` (`1`), the last to `last` (`4`), and the starred `middle` scoops up everything in between into a list, `[2, 3]`. Python checks the whole shape fits before binding any name.\n\n`solo = (5,)` — the trailing comma makes this a one-item tuple, so `len(solo)` is `1`. Without the comma, `(5)` would just be the integer `5`.",
    trap: "A one-item tuple needs the trailing comma: `(5,)`, not `(5)` — parentheses alone only group, so `(5)` is just the number `5`. And remember a tuple cannot be changed after you make it: trying `point[0] = 9` raises an error. When you need to change items, use a list.",
    rule: "Use a tuple for a small, fixed record whose shape never changes; use a list when items will be added, removed, or changed. Unpack with matching names on the left, and remember the trailing comma for a one-item tuple.",
    recall: "What is the difference between `(5)` and `(5,)`, and what does the starred name collect in `first, *middle, last = [1, 2, 3, 4]`?",
    checks: [
      {
        question: "What is the difference between `(5)` and `(5,)`?",
        choices: [
          "`(5)` is just the integer `5`; `(5,)` is a one-item tuple",
          "They are the same — both one-item tuples",
          "`(5)` is a tuple; `(5,)` is a syntax error",
        ],
        answer: 0,
        why: [
          "Correct. The comma makes a tuple, not the parentheses. So `(5)` is the number `5` grouped in parentheses, while `(5,)` is a tuple with one item.",
          "They are not the same: without the comma, `(5)` is a plain integer. Only `(5,)` is a tuple.",
          "`(5,)` is valid, not an error — the trailing comma is exactly how you write a one-item tuple.",
        ],
        explanation: "A comma makes a tuple; a one-item tuple needs a trailing comma, as in `(5,)`.",
      },
      {
        question: "What happens with `a, b = (1, 2, 3)`?",
        choices: [
          "It raises an error — three values but only two names",
          "`a` is `1` and `b` is `[2, 3]`",
          "`a` is `(1, 2)` and `b` is `3`",
        ],
        answer: 0,
        why: [
          "Correct. Plain unpacking needs the number of names to match the number of values exactly. Three values into two names is a mismatch, so Python raises `ValueError`.",
          "`b` would only scoop up the rest as a list if it were *starred*, like `a, *b`. Without the star, the counts must match exactly.",
          "Unpacking does not silently group values; two plain names cannot hold three values, so it errors.",
        ],
        explanation: "Plain unpacking requires equal counts; use a starred name like `a, *rest` to absorb extras.",
      },
      {
        question: "You want to store an (x, y) point that should never change. List or tuple?",
        choices: [
          "A tuple — it is a small fixed record and cannot be changed by accident",
          "A list — always use lists for pairs of numbers",
          "It makes no difference at all",
        ],
        answer: 0,
        why: [
          "Correct. A tuple signals 'fixed record' and prevents accidental edits, which is exactly right for a coordinate.",
          "Lists are for collections you will grow or edit. For a fixed pair, a tuple communicates intent and protects the values.",
          "It does matter: a tuple's immutability documents that the point is fixed and lets it be used where lists cannot, like a dict key.",
        ],
        explanation: "Use a tuple for a small, fixed-shape record; use a list when items will change.",
      },
    ],
    prompt: "Return a two-item tuple containing the first and last value. Return `(None, None)` for an empty sequence.", fn: "endpoints", starter: `def endpoints(values):\n    pass`, solution: `def endpoints(values):\n    if not values:\n        return (None, None)\n    return (values[0], values[-1])`,
    tests: [t("normal", "assert fn([3, 5, 8]) == (3, 8)"), t("single", "assert fn([4]) == (4, 4)"), t("empty", "assert fn([]) == (None, None)")],
  },
  {
    id: "dicts", module: "py.m2", title: "Dictionaries and counting", goal: "Turn repeated search into direct key lookup.", requires: ["lists"],
    model: "A **dictionary** stores pairs: a **key** and the **value** it points to. Think of a real dictionary — you look up a word (the key) and get its definition (the value). You write one with curly braces and `key: value` pairs:\n\n```python\nages = {\"Ada\": 36, \"Grace\": 45}\nprint(ages[\"Ada\"])     # 36 — look up by key\nages[\"Linus\"] = 22       # add a new pair\nages[\"Ada\"] = 37         # change an existing value\n```\n\nWhy use one? Because looking something up by key is **fast and direct** — you do not scan the whole collection. If you had a list of names and wanted 'what is Ada's age?', you would have to walk the list checking each one. A dictionary jumps straight to the answer.\n\n**Missing keys.** Reading a key that is not there raises a `KeyError` and stops your program. When a key might be missing, use `.get`, which returns a fallback instead of crashing:\n\n```python\nprint(ages.get(\"Nobody\"))       # None  — no crash\nprint(ages.get(\"Nobody\", 0))    # 0     — your chosen fallback\n```\n\n**The counting pattern** is one of the most useful things you will do with a dict. To count how many times each item appears, start each key at `0` the first time you see it, then add one:\n\n```python\ncounts = {}\nfor word in words:\n    counts[word] = counts.get(word, 0) + 1\n# counts now maps each word to how many times it appeared\n```\n\n`counts.get(word, 0)` reads the current count (or `0` if the word is new), adds `1`, and stores it back. That is the whole trick.\n\nOne rule about keys: a key must be something unchangeable — a string, number, or tuple — not a list. (A list can change, and a dict needs its keys to stay put.) Values can be anything.",
    example: `counts = {}\nfor word in ["a", "b", "a"]:\n    counts[word] = counts.get(word, 0) + 1\nprint(counts)              # {'a': 2, 'b': 1}\nprint(counts["a"])         # 2\nprint(counts.get("z", 0))  # 0 — missing key, safe fallback`,
    trace: "Start with `counts = {}` — an empty dict. First word is `\"a\"`: `counts.get(\"a\", 0)` is `0` (not seen yet), add `1`, store — `counts` is `{'a': 1}`. Next word `\"b\"`: `get` returns `0`, becomes `1` — `{'a': 1, 'b': 1}`. Next word `\"a\"` again: `get` now returns `1`, add `1`, store `2` — `{'a': 2, 'b': 1}`.\n\nThen `counts[\"a\"]` looks up the key `\"a\"` directly and returns `2`. `counts.get(\"z\", 0)` — the key `\"z\"` is not there, so instead of crashing, `get` returns the fallback `0`.",
    trap: "Reading a missing key with square brackets — `counts[\"z\"]` when `\"z\"` is not present — raises `KeyError` and stops the program. When a key might be absent, use `.get(key, fallback)`. Also, keys must be unchangeable values (strings, numbers, tuples); a list cannot be a key.",
    rule: "Reach for a dictionary when you keep looking things up by the same kind of key — build the lookup once, then read it directly. Use `.get(key, fallback)` whenever a key might be missing.",
    recall: "What does `counts.get(word, 0) + 1` do on each pass of a counting loop, and what happens if you read a missing key with `counts[word]` instead?",
    checks: [
      {
        question: "`ages` has no key `\"Zed\"`. What does `ages[\"Zed\"]` do?",
        choices: [
          "Raises `KeyError` and stops the program",
          "Returns `None`",
          "Adds `\"Zed\"` with an empty value",
        ],
        answer: 0,
        why: [
          "Correct. Reading an absent key with square brackets raises `KeyError`. To read safely, use `ages.get(\"Zed\")` (returns `None`) or `ages.get(\"Zed\", 0)` (returns your fallback).",
          "Square-bracket reading does not return `None` for a missing key — that is what `.get` does. Bare `[]` raises.",
          "Reading a key never creates it. Only assigning, like `ages[\"Zed\"] = 1`, adds a key.",
        ],
        explanation: "`dict[key]` raises `KeyError` when the key is absent; `.get(key, fallback)` reads safely.",
      },
      {
        question: "In `counts[word] = counts.get(word, 0) + 1`, why the `, 0`?",
        choices: [
          "It is the starting count for a word seen for the first time, so the first `+ 1` makes it 1",
          "It deletes the word if it is already there",
          "It limits each word's count to a maximum of 0",
        ],
        answer: 0,
        why: [
          "Correct. The first time a word appears it is not in the dict, so `get` returns the fallback `0`; adding `1` makes its count `1`. After that, `get` returns the real running count.",
          "`get` never deletes anything — it only reads, returning the fallback when the key is missing.",
          "`0` is a fallback, not a cap. Counts grow past `0` freely as words repeat.",
        ],
        explanation: "`.get(key, 0)` supplies a starting value for new keys so the counter works from the first sighting.",
      },
      {
        question: "You repeatedly need 'what is this user's score?' by their name. Best tool?",
        choices: [
          "A dictionary mapping name -> score, so each lookup is direct",
          "A list of scores, scanned from the start each time",
          "Two separate lists you search in parallel",
        ],
        answer: 0,
        why: [
          "Correct. A dict maps the key (name) straight to the value (score), so you jump to the answer instead of scanning.",
          "Scanning a list from the start for every lookup repeats work; a dict replaces that repeated search with a direct one.",
          "Parallel lists force you to find the name's position, then index the other list — clumsier and slower than a single dict.",
        ],
        explanation: "When you keep looking up by the same kind of key, a dictionary turns repeated scanning into a direct lookup.",
      },
    ],
    prompt: "Return a dictionary mapping each item to its frequency.", fn: "frequencies", starter: `def frequencies(items):\n    pass`, solution: `def frequencies(items):\n    counts = {}\n    for item in items:\n        counts[item] = counts.get(item, 0) + 1\n    return counts`,
    tests: [t("counts", `assert fn(["a", "b", "a"]) == {"a": 2, "b": 1}`), t("empty", "assert fn([]) == {}"), t("numbers", "assert fn([1, 1, 2]) == {1: 2, 2: 1}", true)],
  },
  {
    id: "sets", module: "py.m2", title: "Sets and membership", goal: "Use sets for uniqueness and fast membership tests.", requires: ["dicts"],
    model: "A **set** is a collection with two special traits: every item is **unique** (duplicates are dropped automatically), and it has no positions or order. You write one with curly braces: `colors = {\"red\", \"blue\"}`. Its two main jobs are removing duplicates and quickly answering 'is this in here?'\n\n```python\nnumbers = [1, 2, 2, 3, 3, 3]\nunique = set(numbers)\nprint(unique)          # {1, 2, 3} — duplicates gone\nprint(3 in unique)     # True  — fast 'is it here?' check\n```\n\nBecause a set has no positions, you cannot ask for `unique[0]` — there is no 'first' item. What you gain is speed: checking whether something is in a set stays fast no matter how big the set is, while checking a long list means scanning it.\n\n**Set math.** Sets answer whole-group questions directly:\n- `a | b` — **union**: everything in either set.\n- `a & b` — **intersection**: only what is in both.\n- `a - b` — **difference**: what is in `a` but not `b`.\n\n```python\nrequired = {\"id\", \"name\", \"email\"}\nprovided = {\"id\", \"name\"}\nmissing = required - provided\nprint(missing)         # {'email'} — required but not provided\n```\n\n**One gotcha:** `{}` is an empty *dictionary*, not an empty set. To make an empty set, call `set()`.",
    example: `numbers = [1, 2, 2, 3, 3, 3]\nunique = set(numbers)\nprint(unique)          # {1, 2, 3}\nprint(2 in unique)     # True\n\nrequired = {"id", "name", "email"}\nprovided = {"id", "name"}\nprint(required - provided)   # {'email'}\nprint(required & provided)   # {'id', 'name'}`,
    trace: "`set(numbers)` on `[1, 2, 2, 3, 3, 3]` throws away duplicates and keeps one of each, giving `{1, 2, 3}` — with no particular order and no positions. `2 in unique` asks 'is 2 in here?' and answers `True` quickly, without scanning every item.\n\n`required - provided` is the difference: it keeps only items in `required` that are missing from `provided`, so `{\"id\", \"name\", \"email\"} - {\"id\", \"name\"}` is `{'email'}`. `required & provided` is the intersection: only items in both, so `{'id', 'name'}`.",
    trap: "`{}` makes an empty **dictionary**, not an empty set — there is no empty-set literal, so use `set()` for an empty set. And remember a set has no order or positions: you cannot index it with `unique[0]`. If order or duplicates matter, use a list instead.",
    rule: "Reach for a set when the question is 'have I seen this?' or 'what is unique?', not 'where is it?' Use `|`, `&`, and `-` for union, intersection, and difference, and `set()` for an empty set.",
    recall: "What two things does turning a list into a set throw away, and what does `{}` create instead of an empty set?",
    checks: [
      {
        question: "How do you make an empty set?",
        choices: [
          "`set()` — because `{}` makes an empty dictionary",
          "`{}`",
          "`[]`",
        ],
        answer: 0,
        why: [
          "Correct. `{}` is reserved for an empty dictionary, so the way to make an empty set is to call `set()`.",
          "`{}` looks set-like, but Python treats it as an empty dict. Use `set()` instead.",
          "`[]` makes an empty list, which keeps order and duplicates — not a set.",
        ],
        explanation: "`{}` is an empty dict; call `set()` for an empty set.",
      },
      {
        question: "You write `set([1, 2, 2, 3])`. What do you get?",
        choices: [
          "`{1, 2, 3}` — duplicates are dropped and order is not kept",
          "`[1, 2, 2, 3]` unchanged",
          "`{1, 2, 2, 3}` — sets keep duplicates",
        ],
        answer: 0,
        why: [
          "Correct. A set stores each value at most once, so the extra `2` is dropped, and a set has no positional order.",
          "Converting to a set does change the data: it removes duplicates and drops ordering.",
          "Sets never keep duplicates — that is their whole point. Each value appears once.",
        ],
        explanation: "A set keeps unique values only and has no order or positions.",
      },
      {
        question: "You have a huge list and keep asking 'is this value present?' What speeds it up?",
        choices: [
          "Convert it to a set once, then use `in` — set membership stays fast regardless of size",
          "Keep the list and scan it from the start every time",
          "Sort the list alphabetically first",
        ],
        answer: 0,
        why: [
          "Correct. A set is built for fast 'is it here?' checks, so repeated membership tests become cheap after a one-time conversion.",
          "Scanning a list from the start for every check repeats work and gets slower as the list grows — exactly what a set avoids.",
          "Sorting helps some searches, but a set's membership check is simpler and fast without needing order.",
        ],
        explanation: "For repeated 'is it present?' questions, a set gives fast membership; a list must be scanned.",
      },
    ],
    prompt: "Return the distinct values appearing in both inputs.", fn: "shared", starter: `def shared(left, right):\n    pass`, solution: `def shared(left, right):\n    return set(left) & set(right)`,
    tests: [t("overlap", "assert fn([1, 2, 2, 3], [2, 3, 4]) == {2, 3}"), t("none", "assert fn([1], [2]) == set()")],
  },
  {
    id: "comprehensions", module: "py.m2", title: "Comprehensions without cleverness", goal: "Translate simple map/filter loops into readable comprehensions.", requires: ["lists", "dicts", "sets"],
    model: "A **comprehension** is a short way to build a new list (or dict, or set) from an existing one, in a single line. The clearest way to understand it is to see the loop it replaces. Suppose you want a list of the squares of some numbers:\n\n```python\n# the long way\nsquares = []\nfor n in numbers:\n    squares.append(n * n)\n```\n\nThe comprehension says the same thing in one line:\n\n```python\nsquares = [n * n for n in numbers]\n```\n\nRead it left to right in plain English: *'`n * n`, for each `n` in `numbers`.'* The part before `for` is what you want to collect; the `for` part is the loop. You can add a filter with `if` to keep only some items:\n\n```python\neven_squares = [n * n for n in numbers if n % 2 == 0]\n# 'n * n, for each n in numbers, if n is even'\n```\n\nThe order things happen for each item: Python first checks the `if` (if there is one); only if it passes does it run `n * n` and add it to the new list.\n\nYou can build a **dict** the same way, giving a `key: value` pair:\n\n```python\nlengths = {word: len(word) for word in words}\n# maps each word to its length\n```\n\n**When to use one.** A comprehension is great when its plain-English version fits in one short sentence. If you would need to say 'and then... and also...', or you are nesting comprehensions inside comprehensions, stop and write a normal loop — shorter is not the same as clearer.",
    example: `numbers = [1, 2, 3, 4]\n\nsquares = [n * n for n in numbers]\nprint(squares)                       # [1, 4, 9, 16]\n\nevens = [n for n in numbers if n % 2 == 0]\nprint(evens)                         # [2, 4]\n\nwords = ["hi", "bye"]\nlengths = {word: len(word) for word in words}\nprint(lengths)                       # {'hi': 2, 'bye': 3}`,
    trace: "Take `numbers = [1, 2, 3, 4]`. For `[n * n for n in numbers]`, Python walks the list: `n` is `1` -> collect `1`; `n` is `2` -> collect `4`; `n` is `3` -> collect `9`; `n` is `4` -> collect `16`. The new list is `[1, 4, 9, 16]`.\n\nFor `[n for n in numbers if n % 2 == 0]`, each `n` is checked by the `if` first: `1` is odd -> skipped; `2` is even -> kept; `3` -> skipped; `4` -> kept. Result: `[2, 4]`. The filter runs before the value is collected.\n\nFor the dict `{word: len(word) for word in words}` with `words = [\"hi\", \"bye\"]`, each word becomes a key and its length the value: `{'hi': 2, 'bye': 3}`.",
    trap: "A comprehension should describe one clear transformation. Once you start nesting comprehensions inside each other, or adding side effects like `print` inside them, an ordinary loop is easier to read and debug. Compact is not the same as clear — reach for a comprehension only when its spoken version is one short sentence.",
    rule: "Use a comprehension to build one collection from another when you can say what it does in a single short sentence — 'this expression, for each item, optionally if a condition.' Otherwise write the plain loop.",
    recall: "How would you write `[n * n for n in numbers if n % 2 == 0]` as an ordinary loop, and in what order does Python check the `if` and run the output expression?",
    checks: [
      {
        question: "In `[n * n for n in nums if n > 0]`, what happens first for each item?",
        choices: [
          "`for` binds `n`, then `if` filters, then `n * n` runs only for items that pass",
          "`n * n` runs first, then the `if` decides whether to keep it",
          "The `if` runs once for the whole list, not per item",
        ],
        answer: 0,
        why: [
          "Correct. For each item, Python binds the loop name, checks the condition, and only then computes the output expression for the ones that pass.",
          "The output expression runs after the filter passes, not before — so work is skipped for filtered-out items.",
          "The `if` is checked once per item, inside the loop — not once for the whole list.",
        ],
        explanation: "Per item: bind the loop variable, apply the `if`, then run the output expression for those that pass.",
      },
      {
        question: "Which loop is the same as `doubles = [x * 2 for x in items]`?",
        choices: [
          "Start `doubles = []`, then `for x in items: doubles.append(x * 2)`",
          "Start `doubles = items`, then multiply the list by 2",
          "`doubles = items * 2`",
        ],
        answer: 0,
        why: [
          "Correct. A comprehension is exactly a 'make an empty list, loop, append the expression' pattern written in one line.",
          "There is no 'multiply a list of items' step; the comprehension applies `x * 2` to each item, one at a time.",
          "`items * 2` repeats the whole list twice (`[a, b, a, b]`); it does not double each element.",
        ],
        explanation: "A list comprehension = empty list + loop + append the expression, condensed to one line.",
      },
      {
        question: "When should you write a normal loop instead of a comprehension?",
        choices: [
          "When the logic needs more than one short sentence, has side effects, or nests deeply",
          "Whenever you build a list — comprehensions should be avoided",
          "Only when the list is empty",
        ],
        answer: 0,
        why: [
          "Correct. Comprehensions shine for one simple transformation. Complex logic, side effects, or nesting read more clearly as an ordinary loop.",
          "Comprehensions are great for simple builds; the guidance is about clarity, not avoiding them entirely.",
          "Emptiness is not the deciding factor — clarity of the transformation is.",
        ],
        explanation: "Prefer a comprehension for one simple transformation; use a loop when the logic gets long, nested, or side-effecting.",
      },
    ],
    prompt: "Return a dictionary mapping each even number to its square.", fn: "even_squares", starter: `def even_squares(numbers):\n    pass`, solution: `def even_squares(numbers):\n    return {n: n * n for n in numbers if n % 2 == 0}`,
    tests: [t("mixed", "assert fn([1, 2, 3, 4]) == {2: 4, 4: 16}"), t("duplicates", "assert fn([2, 2]) == {2: 4}"), t("empty", "assert fn([]) == {}")],
  },
  {
    id: "sorting", module: "py.m2", title: "Sorting data with explicit keys", goal: "Sort without mutating the caller's list and state exactly which value determines order.", requires: ["lists", "tuples", "functions", "comprehensions"],
    model: "Sorting puts items in order. There are two ways, and the difference matters.\n\n**`sorted(things)` returns a NEW sorted list** and leaves the original alone:\n\n```python\nnums = [3, 1, 2]\nordered = sorted(nums)\nprint(ordered)   # [1, 2, 3]\nprint(nums)      # [3, 1, 2]  — unchanged\n```\n\n**`things.sort()` sorts the list in place** (changing it) and returns `None`:\n\n```python\nnums = [3, 1, 2]\nnums.sort()\nprint(nums)      # [1, 2, 3]  — the original changed\n```\n\nA very common mistake is `result = nums.sort()`: it puts `None` in `result`, because `.sort()` changes the list but hands back nothing. If you want a value to keep, use `sorted`.\n\n**Sorting by a rule: the `key`.** By default Python sorts by natural order — numbers low to high, strings alphabetically. Often you want to sort by *part* of each item, say a list of (name, score) pairs by score. You give `sorted` a `key`: a small function that, for each item, returns the value to sort by.\n\n```python\npeople = [(\"Maya\", 3), (\"Ada\", 1), (\"Linus\", 2)]\nby_score = sorted(people, key=lambda person: person[1])\n# by_score is [('Ada', 1), ('Linus', 2), ('Maya', 3)]\n```\n\n`lambda person: person[1]` is a tiny one-line function: it takes a `person` and returns `person[1]`, the score. `sorted` calls it on each item to decide the order, but the sorted list still holds the original whole items. Pass the function itself, `key=rule`, not `key=rule()` — you are handing over the function, not calling it yourself. Use a `lambda` when the rule is a tiny one-liner, and a named function when it needs a name or explanation.",
    example: `people = [("Maya", 3), ("Ada", 1), ("Linus", 2)]\n\nby_score = sorted(people, key=lambda person: person[1])\nprint(by_score)   # [('Ada', 1), ('Linus', 2), ('Maya', 3)]\nprint(people)     # unchanged\n\nnums = [3, 1, 2]\nnums.sort()\nprint(nums)       # [1, 2, 3]  — sorted in place`,
    trace: "`sorted(people, key=lambda person: person[1])`: for each pair, the key function returns item `[1]` — the score. So it compares `3` (Maya), `1` (Ada), `2` (Linus). Sorting those scores low to high gives Ada (1), Linus (2), Maya (3), and the output keeps the whole original pairs, just reordered. `people` itself is untouched because `sorted` builds a new list.\n\nThen `nums.sort()` on `[3, 1, 2]` reorders that very same list in place to `[1, 2, 3]` and returns `None` — which is why you never write `x = nums.sort()`.",
    trap: "Do not write `result = values.sort()`: the list is sorted, but `result` becomes `None`, because `.sort()` changes the list in place and returns nothing. Use `sorted(values)` when you want a new sorted list as a value. Also pass the key *function*, `key=rule`, not `key=rule()` — the parentheses would call it too early.",
    rule: "Use `sorted(...)` when the caller's original order must survive, and `.sort()` only when you truly want to reorder the list in place. To sort by part of each item, pass a `key` function that returns the value to compare — a `lambda` for a tiny rule, a named function otherwise.",
    recall: "How do `sorted(values)` and `values.sort()` differ in what they return and whether they change the original, and what does the `key` function receive and return?",
    checks: [
      {
        question: "What is `result` after `result = names.sort()`?",
        choices: [
          "`None` — `.sort()` reorders the list in place and returns nothing",
          "The new sorted list",
          "The original unsorted list",
        ],
        answer: 0,
        why: [
          "Correct. `.sort()` changes the list itself and hands back `None`, so `result` is `None`. Use `sorted(names)` to get a sorted list as a value.",
          "`.sort()` does not return the list — it returns `None`. It is `sorted(names)` that returns a new list.",
          "The list is not left unsorted — `.sort()` does reorder it in place; it just returns `None` rather than the list.",
        ],
        explanation: "`.sort()` sorts in place and returns `None`; `sorted(x)` returns a new sorted list.",
      },
      {
        question: "After `ordered = sorted(nums)`, what is `nums`?",
        choices: [
          "Unchanged — `sorted` builds a new list and leaves the original alone",
          "Now sorted too, because `sorted` changes it",
          "Empty, because its items moved into `ordered`",
        ],
        answer: 0,
        why: [
          "Correct. `sorted` reads the values and returns a brand-new sorted list; the original `nums` keeps its order.",
          "`sorted` does not modify its input — that is the difference from `.sort()`, which does.",
          "Items are copied into the new list, not moved out; `nums` still holds them in the original order.",
        ],
        explanation: "`sorted(x)` returns a new list and does not change `x`; `.sort()` changes `x` in place.",
      },
      {
        question: "To sort `(name, score)` pairs by score, what do you pass as `key`?",
        choices: [
          "`key=lambda pair: pair[1]` — return the part to sort by (the score)",
          "`key=lambda pair: pair` — the whole pair",
          "`key=pair[1]` — the score value directly",
        ],
        answer: 0,
        why: [
          "Correct. `key` is a function called on each item; returning `pair[1]` tells `sorted` to order by the score while keeping the whole pairs.",
          "Returning the whole pair sorts by name first (index 0), then score — not what 'by score' means.",
          "`key` needs a function, not a single value. `pair[1]` on its own is not defined outside the function; wrap it in a `lambda`.",
        ],
        explanation: "`key` is a function returning the value to compare; `lambda pair: pair[1]` sorts by the second item.",
      },
    ],
    prompt: "Return a new list of `(name, score)` records ordered by score from lowest to highest. Do not mutate `records`.", fn: "by_score", starter: `def by_score(records):\n    pass`, solution: `def by_score(records):\n    return sorted(records, key=lambda record: record[1])`,
    tests: [t("orders", `assert fn([("a", 3), ("b", 1)]) == [("b", 1), ("a", 3)]`), t("stable", `assert fn([("a", 2), ("b", 2)]) == [("a", 2), ("b", 2)]`), t("no mutation", `data = [("a", 2), ("b", 1)]; fn(data); assert data == [("a", 2), ("b", 1)]`, true)],
  },
  {
    id: "imports", module: "py.m3", title: "Imports and the standard library", goal: "Import a module, qualify its names, and distinguish your code from library code.", requires: ["functions", "numbers"],
    model: "Nobody writes everything from scratch. A **module** is a file full of ready-made, tested tools, and **importing** one lets you use those tools in your program. Python comes with a big collection of these called the **standard library** — math helpers, date tools, random numbers, and more — all free and already installed.\n\nThe simplest form loads a whole module and gives you its name:\n\n```python\nimport math\n\nprint(math.sqrt(9))   # 3.0\nprint(math.pi)        # 3.141592653589793\n```\n\nAfter `import math`, the name `math` stands for the whole module, and you reach inside it with a dot: `math.sqrt`, `math.pi`. Writing `math.sqrt` is nice because anyone reading the code can see *where* `sqrt` came from.\n\nYou can also pull one name out directly:\n\n```python\nfrom math import sqrt\nprint(sqrt(9))   # 3.0  — no 'math.' needed\n```\n\nThat is shorter, but it hides the origin — a lone `sqrt` does not say it came from `math`. Prefer the `import math` then `math.sqrt` style unless a name is used constantly.\n\n**Two habits.** Put your imports at the top of the file, so a reader sees the dependencies first. And never name your own file the same as a module you import — a file called `math.py` would shadow the real `math` and cause confusing errors.",
    example: `import math\n\nradius = 3\narea = math.pi * radius ** 2\nprint(area)          # 28.274333882308138\nprint(math.sqrt(16)) # 4.0`,
    trace: "`import math` finds the math module, sets it up, and binds the name `math` to it. `math.pi` reaches into the module and reads the value of pi. In the area formula, raising `radius` to the power of `2` runs first (exponent before multiply), giving `9`, then multiplies by pi, and `area` is bound to about `28.27`. `math.sqrt(16)` calls the module's square-root tool and returns `4.0`. Writing the module name before each tool keeps it obvious that these came from `math`, not from your own code.",
    trap: "Do not name your own file `math.py`, `json.py`, or anything else you plan to import — your file would shadow the real library and break the import in a confusing way. And avoid a wildcard import like `from math import *`: it dumps every name in without saying where any of them came from, so readers cannot tell which module supplied a name.",
    rule: "Import modules at the top of the file, and prefer the qualified `module.tool` form (like `math.sqrt`) so every reader can see where a tool comes from. Reach for a name-only import only when a tool is used so often that the prefix becomes noise.",
    recall: "After `import math`, what does the name `math` refer to, and why is `math.sqrt(x)` clearer than a wildcard import?",
    checks: [
      {
        question: "Why prefer `import math; math.sqrt(x)` over `from math import *`?",
        choices: [
          "`math.sqrt` shows where `sqrt` comes from; a wildcard hides each name's origin",
          "Wildcard imports run faster",
          "`math.sqrt` uses less memory",
        ],
        answer: 0,
        why: [
          "Correct. The `math.` prefix makes the dependency visible right at the call site. A wildcard pulls in many names with no hint of where they came from.",
          "Speed is not the point — and a wildcard is not faster. The issue is readability and knowing each name's source.",
          "Memory is not the difference either; it is about a reader being able to see where a name originates.",
        ],
        explanation: "Qualified names (`math.sqrt`) reveal the source; wildcard imports hide it.",
      },
      {
        question: "You save your file as `math.py` and write `import math`. What is the danger?",
        choices: [
          "Your file can shadow the real `math` module, causing confusing errors",
          "Nothing — Python renames your file automatically",
          "It makes `math` run twice as fast",
        ],
        answer: 0,
        why: [
          "Correct. Python may find your `math.py` first, so `import math` grabs your file instead of the library — and `math.sqrt` will not exist.",
          "Python does not rename your file; the name clash is real and must be avoided.",
          "There is no speed benefit — only the risk of importing the wrong thing.",
        ],
        explanation: "Never name a file after a module you import; it shadows the real one.",
      },
      {
        question: "Where do imports normally belong, and why?",
        choices: [
          "At the top of the file, so a reader sees the dependencies first",
          "At the very bottom, after all the code",
          "Inside every function that uses them",
        ],
        answer: 0,
        why: [
          "Correct. Top-of-file imports make a program's outside dependencies obvious at a glance.",
          "Bottom-of-file imports hide what the program relies on and can cause name errors for code above them.",
          "Re-importing inside every function is repetitive and unusual; import once at the top.",
        ],
        explanation: "Put imports at the top so dependencies are visible up front.",
      },
    ],
    prompt: "Return the area of a circle with `radius` using `math.pi`.", fn: "circle_area", starter: `import math\n\ndef circle_area(radius):\n    pass`, solution: `import math\n\ndef circle_area(radius):\n    return math.pi * radius ** 2`,
    tests: [t("unit", "import math; assert fn(1) == math.pi"), t("three", "import math; assert fn(3) == 9 * math.pi"), t("zero", "assert fn(0) == 0", true)],
  },
  {
    id: "arguments", module: "py.m3", title: "Parameters and arguments", goal: "Design positional, keyword, variadic, and keyword-only parameters.", requires: ["functions"],
    model: "When you define a function, its **parameters** are the inputs it accepts. Python gives you a few kinds, so an interface can be exactly as flexible as it needs to be. Let us build them up.\n\n**Positional and keyword.** By default, an argument can be passed by position or by name:\n\n```python\ndef greet(name, greeting):\n    return f\"{greeting}, {name}!\"\n\ngreet(\"Ada\", \"Hi\")                # by position\ngreet(name=\"Ada\", greeting=\"Hi\")  # by name (clearer)\n```\n\n**Defaults** make a parameter optional by giving it a fallback value:\n\n```python\ndef greet(name, greeting=\"Hello\"):\n    return f\"{greeting}, {name}!\"\n\ngreet(\"Ada\")   # 'Hello, Ada!'  — greeting used its default\n```\n\n**Collecting extras.** Sometimes you want a function to accept any number of arguments. A parameter written with one star collects all the extra positional arguments into a tuple; a parameter written with two stars collects all the extra named arguments into a dictionary. By strong convention these are named `args` and `kwargs`:\n\n```python\ndef total(*numbers):        # one star: gather extra positional args\n    return sum(numbers)\n\ntotal(1, 2, 3)              # numbers is (1, 2, 3) -> 6\n\ndef tag(**attrs):           # two stars: gather extra named args\n    return attrs\n\ntag(id=1, cls=\"btn\")        # attrs is {'id': 1, 'cls': 'btn'}\n```\n\n**The one trap that bites everyone: a mutable default.** A default value is created *once*, when the `def` line runs — not fresh on each call. So a default that can change, like an empty list, is *shared* across every call, and edits pile up:\n\n```python\ndef add(item, box=[]):   # DON'T — the list is shared!\n    box.append(item)\n    return box\n\nadd(1)   # [1]\nadd(2)   # [1, 2]   <- same list, surprise!\n```\n\nThe fix is to default to `None` and make a fresh list inside:\n\n```python\ndef add(item, box=None):\n    if box is None:\n        box = []\n    box.append(item)\n    return box\n```\n\nWith `None` as the default, each call now starts with its own fresh, empty list.",
    example: `def greet(name, greeting="Hello"):\n    return f"{greeting}, {name}!"\n\nprint(greet("Ada"))                 # Hello, Ada!\nprint(greet("Ada", greeting="Hi"))  # Hi, Ada!\n\ndef total(*numbers):\n    return sum(numbers)\n\nprint(total(1, 2, 3))               # 6`,
    trace: "`greet` has a default greeting. Calling `greet(\"Ada\")` leaves `greeting` at its default `\"Hello\"`, giving `\"Hello, Ada!\"`. Calling `greet(\"Ada\", greeting=\"Hi\")` names the second argument, so it reads clearly and gives `\"Hi, Ada!\"`.\n\n`total` uses a starred parameter to gather any number of positional arguments into a tuple named `numbers`. `total(1, 2, 3)` makes `numbers` the tuple `(1, 2, 3)`, and `sum` adds them to `6`. The same idea with two stars would gather named arguments into a dictionary instead.",
    trap: "A default value is created once, when the `def` line runs — not fresh on each call. So a default that can change, like an empty list, is shared across every call, and changes pile up between calls. The fix: default to `None`, then build a new list inside the function when the value is `None`.",
    rule: "Pass arguments by name when it makes a call clearer, give optional parameters sensible defaults, and use a starred parameter to accept a flexible number of arguments. Never use a value that can change, like a list, as a default — default to `None` and create it inside.",
    recall: "When is a default argument value created — once or on every call — and why does that make a list default dangerous?",
    checks: [
      {
        question: "A parameter written `items=[]` gives each call…",
        choices: [
          "The same shared list — the default is created once when `def` runs",
          "A fresh empty list every call",
          "An error, because lists cannot be defaults",
        ],
        answer: 0,
        why: [
          "Correct. Defaults are made once at definition time, so a list default is shared by every call and accumulates changes. Use `items=None` and build the list inside.",
          "It is not fresh each call — that is the surprising part. The one list is reused, so edits carry over.",
          "A list is allowed as a default syntactically; the problem is that it is shared, not that it is forbidden.",
        ],
        explanation: "Defaults evaluate once at definition; a mutable default is shared. Use `None` then create it inside.",
      },
      {
        question: "A parameter written with one star, like `def f(*nums):`, collects the extra positional arguments into what?",
        choices: [
          "A tuple",
          "A dictionary",
          "A single number",
        ],
        answer: 0,
        why: [
          "Correct. One star gathers any leftover positional arguments into a tuple. (Two stars gather named arguments into a dictionary.)",
          "A dictionary is what two stars collect (named arguments), not one.",
          "It does not collapse them into one value; it keeps them all, as a tuple.",
        ],
        explanation: "One star collects extra positional args into a tuple; two stars collect named args into a dict.",
      },
      {
        question: "Why call `connect(host, timeout=5)` instead of `connect(host, 5)`?",
        choices: [
          "Naming the argument makes the call self-explanatory about what `5` means",
          "It runs faster",
          "Positional arguments are not allowed alongside defaults",
        ],
        answer: 0,
        why: [
          "Correct. `timeout=5` tells the reader what the `5` is for; a bare `5` is a mystery number at the call site.",
          "Speed is unaffected; the benefit is readability.",
          "Positional arguments are perfectly allowed; naming is a clarity choice, not a requirement.",
        ],
        explanation: "Passing by name documents what a value means at the call site.",
      },
    ],
    prompt: "Return a label joining any number of parts with a keyword-only `separator` whose default is `\" / \"`.", fn: "label", starter: `def label(*parts, separator=" / "):\n    pass`, solution: `def label(*parts, separator=" / "):\n    return separator.join(str(part) for part in parts)`,
    tests: [t("default", `assert fn("a", "b") == "a / b"`), t("keyword", `assert fn(1, 2, separator="-") == "1-2"`), t("empty", `assert fn() == ""`, true)],
  },
  {
    id: "scope", module: "py.m3", title: "Scope, closures, and state", goal: "Trace name lookup and build a closure without hidden global state.", kind: "mental-model", requires: ["arguments"],
    model: "When you use a name like `count`, how does Python know which one you mean? It searches in a fixed order, remembered as **LEGB**:\n- **L**ocal — names inside the current function.\n- **E**nclosing — names in a function that wraps this one.\n- **G**lobal — names at the top level of the file.\n- **B**uilt-in — names Python always provides, like `print` and `len`.\n\nPython uses the first match it finds, searching Local, then Enclosing, then Global, then Built-in.\n\n**Closures.** Here is the interesting part. A function defined *inside* another function can remember the outer function's variables — even after the outer function has finished. That bundle of an inner function plus the remembered variables is called a **closure**.\n\n```python\ndef make_multiplier(factor):\n    def multiply(number):\n        return number * factor   # 'factor' comes from the enclosing scope\n    return multiply\n\ntriple = make_multiplier(3)\nprint(triple(10))   # 30  — it still remembers factor = 3\ndouble = make_multiplier(2)\nprint(double(10))   # 20  — a separate remembered factor = 2\n```\n\nEach call to `make_multiplier` makes its own `factor`, and the returned function keeps that particular one alive. That is why `triple` and `double` remember different values.\n\n**Changing an outer name.** Assigning to a name inside a function normally makes a new *local* name. If you truly need to change an enclosing or global one, you say so with `nonlocal` (for an enclosing function's variable) or `global` (for a module-level one) — but it is usually cleaner to pass values in and return results out rather than reach across scopes.",
    example: `def make_multiplier(factor):\n    def multiply(number):\n        return number * factor\n    return multiply\n\ntriple = make_multiplier(3)\ndouble = make_multiplier(2)\nprint(triple(10))   # 30\nprint(double(10))   # 20`,
    trace: "`make_multiplier(3)` runs with `factor` set to `3`, defines the inner `multiply` (which refers to `factor`), and returns it. That returned function, now called `triple`, keeps this particular `factor` of `3` alive — so `triple(10)` computes `10 * 3`, which is `30`. A second call, `make_multiplier(2)`, makes a separate `factor` of `2`, so `double(10)` is `20`. Even though `make_multiplier` has already returned both times, each returned function still remembers its own enclosing `factor` — that is the closure.",
    trap: "Closures made inside a loop all capture the same loop variable, not a frozen copy of its value — so they can all end up seeing its final value. When you need each to remember a different value, capture it deliberately (for example, as a default argument of the inner function) rather than relying on the shared loop variable.",
    rule: "Remember name lookup as LEGB — local, enclosing, global, built-in. Prefer passing values in and returning results out; reach for a closure only when a function genuinely needs to remember a small piece of private state.",
    recall: "What are the four scopes in LEGB, and why can a returned inner function still read its enclosing function's variable after that function has returned?",
    checks: [
      {
        question: "A returned inner function still reads its enclosing function's local variable after that function returned. Why?",
        choices: [
          "The closure keeps a live reference to that variable",
          "Python re-runs the outer function each time you call the inner one",
          "The variable was secretly made global",
        ],
        answer: 0,
        why: [
          "Correct. The inner function captured a reference to the enclosing variable, so it stays alive as long as the inner function does — that is a closure.",
          "Python does not re-run the outer function; the value was captured once and remembered.",
          "It is not made global — it stays in the enclosing scope, reachable only through the closure.",
        ],
        explanation: "A closure captures a live reference to the enclosing scope's variable.",
      },
      {
        question: "When you use a name inside a function, in what order does Python look for it?",
        choices: [
          "Local, then Enclosing, then Global, then Built-in (LEGB)",
          "Built-in first, then Global, Enclosing, Local",
          "It checks all scopes at once and picks at random",
        ],
        answer: 0,
        why: [
          "Correct. Python searches Local first, then any Enclosing function, then Global (module) scope, then Built-ins — the first match wins.",
          "It is the reverse: local names are found first, and built-ins last as a fallback.",
          "The search is a fixed order (LEGB), not random — the nearest matching name wins.",
        ],
        explanation: "Name lookup goes Local, Enclosing, Global, Built-in; the first match is used.",
      },
      {
        question: "`triple = make_multiplier(3)` and `double = make_multiplier(2)`. Why does `triple(10)` give 30 and `double(10)` give 20?",
        choices: [
          "Each call made its own `factor`, and each returned function remembers its own",
          "They share one `factor`, so both give the same answer",
          "`factor` is always the last value passed, so both use 2",
        ],
        answer: 0,
        why: [
          "Correct. Every call to `make_multiplier` creates a fresh `factor`, and the function it returns closes over that specific one.",
          "They do not share a `factor`; each closure has its own captured value.",
          "It is not overwritten to the last value — each returned function kept its own `factor` from its own call.",
        ],
        explanation: "Each call creates a separate enclosing variable that its returned closure remembers independently.",
      },
    ],
    prompt: "Return a function that adds `offset` to whatever number it receives.", fn: "make_adder", starter: `def make_adder(offset):\n    pass`, solution: `def make_adder(offset):\n    def add(number):\n        return number + offset\n    return add`,
    tests: [t("captures", "add5 = fn(5); assert add5(3) == 8"), t("independent", "assert fn(2)(10) == 12 and fn(-1)(10) == 9")],
  },
  {
    id: "decorators", module: "py.m3", title: "Decorators are function transformation", goal: "Write a transparent decorator and explain decoration time.", requires: ["scope", "imports"],
    model: "A **decorator** is a way to wrap a function to add behavior around it — like logging, timing, or caching — without changing the function's own code. The `@name` line written just before a function's `def` is the shorthand.\n\nStart with the plain idea. A decorator is just a function that takes a function and returns a new one:\n\n```python\ndef shouty(func):\n    def wrapper():\n        result = func()\n        return result.upper()   # add behavior: shout the result\n    return wrapper\n\ndef greet():\n    return \"hello\"\n\ngreet = shouty(greet)   # wrap it by hand\nprint(greet())          # HELLO\n```\n\nThe `@` syntax is exactly that assignment, written more neatly:\n\n```python\n@shouty          # same as: greet = shouty(greet)\ndef greet():\n    return \"hello\"\n```\n\nSo `@shouty` written on `greet` means 'replace `greet` with `shouty(greet)`.' It runs once, when the function is defined.\n\n**Wrapping any function.** Real decorators wrap functions that take arguments, so the inner `wrapper` accepts and forwards whatever arguments come in (using the starred parameters from the arguments lesson) and — importantly — *returns* the result:\n\n```python\nfrom functools import wraps\n\ndef traced(func):\n    @wraps(func)                 # keeps func's name for tools and debugging\n    def wrapper(*args, **kwargs):\n        print(\"calling\", func.__name__)\n        return func(*args, **kwargs)   # forward the args, return the result\n    return wrapper\n```\n\n**Two easy mistakes:** a `wrapper` that forgets to `return` the inner result quietly turns every call into `None`; and forgetting `@wraps(func)` hides the original function's name from error messages and tools.",
    example: `from functools import wraps\n\ndef traced(func):\n    @wraps(func)\n    def wrapper(*args, **kwargs):\n        print("calling", func.__name__)\n        return func(*args, **kwargs)\n    return wrapper\n\n@traced\ndef add(a, b):\n    return a + b\n\nprint(add(2, 3))   # prints "calling add", then 5`,
    trace: "`@traced` written on `add` means `add = traced(add)`, which runs once when the function is defined. `traced` builds a `wrapper` that, when called, prints a line and then calls the original `add` and returns its result. So `add(2, 3)` really runs the wrapper: it prints `calling add`, then computes `2 + 3` and returns `5`. The wrapper forwards whatever arguments it receives to the real function, and `@wraps(func)` copies the original name across so `add.__name__` still says `add` — helpful when reading errors and using tools.",
    trap: "Two easy mistakes. First, if the wrapper forgets to `return` the inner function's result, every decorated call quietly becomes `None`. Second, leaving out `@wraps(func)` throws away the original function's name and docstring, which makes error messages and debugging tools confusing. Include both.",
    rule: "Use a decorator to add the same wrapping behavior — logging, timing, caching — around many functions without editing each one. Make the wrapper forward its arguments, return the inner result, and use `@wraps` to keep the original function's identity.",
    recall: "What plain assignment is `@logged` above `def work()` equivalent to, and what two things must a wrapper remember to do?",
    checks: [
      {
        question: "`@logged` written above `def work(): ...` is equivalent to…",
        choices: [
          "`work = logged(work)`",
          "`work = logged`",
          "`logged = work`",
        ],
        answer: 0,
        why: [
          "Correct. A decorator replaces the function with whatever the decorator returns: `work = logged(work)`, run once at definition time.",
          "`work = logged` would throw away your function and point `work` at the decorator itself — not what happens.",
          "It is not reversed; the decorator wraps `work`, so `work` is reassigned to `logged(work)`.",
        ],
        explanation: "`@d` above `def f` means `f = d(f)`, evaluated when the function is defined.",
      },
      {
        question: "A decorator's `wrapper` calls the original function but forgets to `return` its result. What happens?",
        choices: [
          "Every decorated call quietly returns `None`",
          "The decorator raises an error at definition time",
          "The original function runs twice",
        ],
        answer: 0,
        why: [
          "Correct. If the wrapper does not return the inner result, the decorated function hands back `None` — a silent, confusing bug.",
          "It does not error at definition; the problem shows up only when you use the returned value and find it is `None`.",
          "The function runs once; the issue is that its result is discarded rather than returned.",
        ],
        explanation: "A wrapper must return the inner function's result, or every call yields `None`.",
      },
      {
        question: "When does `@shouty` above `def greet` actually run the wrapping?",
        choices: [
          "Once, when `greet` is defined",
          "Every time `greet` is called",
          "Never — decorators are only documentation",
        ],
        answer: 0,
        why: [
          "Correct. Decoration happens once, at definition time: Python evaluates `greet = shouty(greet)` right after the `def`.",
          "The wrapper runs on each call, but the decorating step (replacing `greet`) happens just once when it is defined.",
          "Decorators are real code that transforms the function, not a comment.",
        ],
        explanation: "Decoration runs once at definition; the wrapper it installs runs on each call.",
      },
    ],
    prompt: "Implement `twice(function)`: its wrapper calls the function twice and returns the second result.", fn: "twice", starter: `def twice(function):\n    pass`, solution: `from functools import wraps\n\ndef twice(function):\n    @wraps(function)\n    def wrapper(*args, **kwargs):\n        function(*args, **kwargs)\n        return function(*args, **kwargs)\n    return wrapper`,
    tests: [t("twice", "calls = []; wrapped = fn(lambda x: calls.append(x) or len(calls)); assert wrapped(7) == 2 and calls == [7, 7]"), t("metadata", "def work(): pass\nassert fn(work).__name__ == 'work'", true)],
  },
  {
    id: "classes", module: "py.m4", title: "Classes and instance state", goal: "Build a class with valid state and a narrow public interface.", requires: ["functions", "dicts", "exceptions"],
    model: "A class creates a new type. Calling it allocates an instance and initializes it through `__init__`. Methods are functions retrieved through an instance; Python binds that instance as the first argument, conventionally named `self`.",
    example: `class Counter:\n    def __init__(self, start=0):\n        self.value = start\n\n    def increment(self):\n        self.value += 1\n        return self.value`,
    trace: "`Counter(4)` creates an object, then calls `Counter.__init__(object, 4)`. `counter.increment()` resolves the class function and binds `counter` to `self`.",
    trap: "A mutable class attribute is shared by all instances. Put per-instance state on `self` inside `__init__`.",
    rule: "Create a class when state and behavior form a durable concept; use a function for a one-off transformation.",
    recall: "What does Python effectively pass when you call `counter.increment()`?",
    check: {
      question: "When you call `counter.increment()`, what does Python pass as `self`?",
      choices: ["The `counter` instance itself", "Nothing — `self` is empty"],
      answer: 0,
      explanation: "The instance is bound as the first argument: `counter.increment()` runs as `Counter.increment(counter)`.",
    },
    prompt: "Define `BankAccount` with a zero default balance, `deposit(amount)`, and `withdraw(amount)` that raises `ValueError` for insufficient funds.", fn: "BankAccount", starter: `class BankAccount:\n    pass`, solution: `class BankAccount:\n    def __init__(self, balance=0):\n        self.balance = balance\n\n    def deposit(self, amount):\n        self.balance += amount\n        return self.balance\n\n    def withdraw(self, amount):\n        if amount > self.balance:\n            raise ValueError("insufficient funds")\n        self.balance -= amount\n        return self.balance`,
    tests: [t("state", "account = fn(10); assert account.deposit(5) == 15 and account.withdraw(4) == 11"), t("guard", "account = fn();\ntry: account.withdraw(1); assert False\nexcept ValueError: pass", true)],
  },
  {
    id: "dataclasses", module: "py.m4", title: "Dataclasses and value objects", goal: "Represent structured data without boilerplate or behaviorless dictionaries.", requires: ["classes", "tuples", "imports"],
    model: "`@dataclass` generates initialization, representation, and value equality from annotated fields. It is ideal for records that have named parts and modest behavior.",
    example: `from dataclasses import dataclass\n\n@dataclass(frozen=True, slots=True)\nclass Point:\n    x: float\n    y: float`,
    trace: "`frozen=True` prevents ordinary field reassignment and can make instances hashable. `slots=True` stores declared fields compactly and rejects accidental new attributes.",
    trap: "Mutable field defaults still need `field(default_factory=list)` so each instance receives its own list.",
    rule: "Begin with a dataclass for a value-shaped domain concept; add hand-written methods only when invariants demand them.",
    recall: "Why does a list field use `default_factory` rather than `=[]`?",
    check: {
      question: "A dataclass field that should default to an empty list must use…",
      choices: ["`field(default_factory=list)`", "`= []`"],
      answer: 0,
      explanation: "`=[]` would share one list across every instance. `default_factory=list` gives each instance its own fresh list.",
    },
    prompt: "Define a frozen dataclass `Point(x, y)` with a `manhattan()` method returning `abs(x) + abs(y)`.", fn: "Point", starter: `from dataclasses import dataclass\n\n# define Point`, solution: `from dataclasses import dataclass\n\n@dataclass(frozen=True)\nclass Point:\n    x: float\n    y: float\n\n    def manhattan(self):\n        return abs(self.x) + abs(self.y)`,
    tests: [t("value", "p = fn(-3, 4); assert p.manhattan() == 7"), t("equality", "assert fn(1, 2) == fn(1, 2)"), t("frozen", "p = fn(1, 2)\ntry: p.x = 9; assert False\nexcept Exception: pass", true)],
  },
  {
    id: "composition", module: "py.m4", title: "Composition before inheritance", goal: "Separate changing behaviors behind small object boundaries.", kind: "pattern", requires: ["classes"],
    model: "Composition gives an object collaborators that do focused jobs. Inheritance declares an is-a substitutability relationship. Composition is usually easier to change because it avoids coupling behavior to a deep class tree.",
    example: `class ReportService:\n    def __init__(self, repository, formatter):\n        self.repository = repository\n        self.formatter = formatter\n\n    def build(self, report_id):\n        data = self.repository.get(report_id)\n        return self.formatter.format(data)`,
    trace: "The service coordinates two contracts. Tests can supply tiny fakes, and formatters can vary without subclassing the whole service.",
    trap: "Inheritance for code reuse alone creates fragile base classes. A subclass can accidentally depend on internal steps its parent never promised.",
    rule: "Inherit when callers should safely substitute the child for the parent; compose when you merely need another behavior.",
    recall: "What promise does inheritance make beyond sharing code?",
    check: {
      question: "Beyond reusing code, what does inheritance promise?",
      choices: ["Substitutability — a child can stand in wherever the parent is expected", "Faster method calls"],
      answer: 0,
      explanation: "Inherit for an is-a substitution relationship; compose when you only need to reuse another object's behavior.",
    },
    prompt: "Define `Pipeline(transformer)` whose `run(values)` returns a list produced by calling `transformer` on each value.", fn: "Pipeline", starter: `class Pipeline:\n    pass`, solution: `class Pipeline:\n    def __init__(self, transformer):\n        self.transformer = transformer\n\n    def run(self, values):\n        return [self.transformer(value) for value in values]`,
    tests: [t("composes", "pipe = fn(lambda x: x * 3); assert pipe.run([1, 2]) == [3, 6]"), t("independent", "assert fn(str).run([1, 2]) == ['1', '2']")],
  },
  {
    id: "protocols", module: "py.m4", title: "Data model and protocols", goal: "Make a custom type participate in Python's ordinary syntax.", requires: ["classes"],
    model: "Python syntax delegates to protocols: `len(x)` calls `x.__len__()`, iteration asks for `iter(x)`, equality may call `__eq__`, and `repr(x)` calls `__repr__`. Implement the smallest protocol your type truly supports.",
    example: `class Playlist:\n    def __init__(self, songs):\n        self._songs = list(songs)\n\n    def __len__(self):\n        return len(self._songs)\n\n    def __iter__(self):\n        return iter(self._songs)`,
    trace: "The object now works with `len`, `for`, `list`, and any consumer that accepts an iterable, without inheriting from a special base class.",
    trap: "Do not call dunder methods directly when normal syntax exists. `len(x)` allows Python to validate and optimize the protocol.",
    rule: "Integration through a standard protocol is more reusable than inventing a custom method name.",
    recall: "Why can an unrelated custom class work in a `for` loop without inheriting from `list`?",
    check: {
      question: "How can a custom class work in a `for` loop without inheriting from `list`?",
      choices: ["By implementing the iteration protocol (`__iter__`)", "It cannot — you must subclass `list`"],
      answer: 0,
      explanation: "Python syntax delegates to protocols. Implement `__iter__` and any iterable consumer accepts your type.",
    },
    prompt: "Define `Countdown(start)` as an iterable yielding `start` down through `1`; `len(countdown)` returns `start`.", fn: "Countdown", starter: `class Countdown:\n    pass`, solution: `class Countdown:\n    def __init__(self, start):\n        self.start = start\n\n    def __len__(self):\n        return self.start\n\n    def __iter__(self):\n        return iter(range(self.start, 0, -1))`,
    tests: [t("iteration", "assert list(fn(4)) == [4, 3, 2, 1]"), t("length", "assert len(fn(7)) == 7"), t("empty", "assert list(fn(0)) == []", true)],
  },
  {
    id: "iterators", module: "py.m5", title: "Iterable, iterator, generator", goal: "Explain lazy iteration and consume an iterator safely.", kind: "mental-model", requires: ["loops", "protocols"],
    model: "An iterable can create an iterator. An iterator is a stateful one-way stream implementing `__next__`; exhaustion raises `StopIteration`. A generator function builds that state machine automatically around `yield`.",
    example: `def take(limit, iterable):\n    iterator = iter(iterable)\n    for _ in range(limit):\n        try:\n            yield next(iterator)\n        except StopIteration:\n            return`,
    trace: "Calling the generator function does not run its body. Each `next` resumes after the previous `yield`, preserving local variables until it yields again or returns.",
    trap: "An iterator is consumed. Iterating it a second time produces nothing unless you create a new iterator.",
    rule: "Use lazy iteration when the source is large, infinite, expensive, or naturally streamed.",
    recall: "What is the difference between an iterable and the iterator it creates?",
    check: {
      question: "You loop an iterator to the end, then loop the same iterator again. What is produced the second time?",
      choices: ["Nothing — an iterator is consumed once", "It restarts from the beginning"],
      answer: 0,
      explanation: "An iterator is a one-way, stateful stream. Create a fresh iterator from the iterable to walk it again.",
    },
    prompt: "Write generator `take(limit, iterable)` that yields at most the first `limit` values without converting the input to a list.", fn: "take", starter: `def take(limit, iterable):\n    pass`, solution: `def take(limit, iterable):\n    for index, value in enumerate(iterable):\n        if index >= limit:\n            return\n        yield value`,
    tests: [t("takes", "assert list(fn(3, range(10))) == [0, 1, 2]"), t("short", "assert list(fn(5, [1, 2])) == [1, 2]"), t("zero", "assert list(fn(0, [1])) == []")],
  },
  {
    id: "exceptions", module: "py.m3", title: "Exceptions and error boundaries", goal: "Catch only errors you can handle and preserve useful failure context.", requires: ["functions", "imports"],
    model: "An **exception** is Python's way of saying 'something went wrong.' When code hits an error — dividing by zero, converting bad text to a number — Python raises an exception, and unless you catch it, your program stops and prints the error. **Handling** an exception lets you respond instead of crashing.\n\nThe tool is `try` / `except`:\n\n```python\ntry:\n    age = int(text)          # this might fail\nexcept ValueError:\n    print(\"that was not a number\")\n```\n\nPython runs the `try` block. If a line raises a `ValueError` (which `int(\"hello\")` does), it jumps to the matching `except` block instead of crashing. If nothing goes wrong, the `except` is skipped.\n\n**Catch narrowly.** Name the *specific* error you expect (`ValueError`, `KeyError`, and so on), not a blanket catch-all. A bare `except Exception: pass` swallows *every* error — including bugs you did not anticipate — and throws away the message you would need to fix them. That is one of the most dangerous habits in Python.\n\n**Raising your own.** You can raise an exception on purpose to reject bad input, using `raise`:\n\n```python\ndef set_age(age):\n    if age < 0:\n        raise ValueError(\"age cannot be negative\")\n    return age\n```\n\nRaising a clear error early — right where the problem is — beats letting a bad value flow deeper and blow up somewhere confusing later.\n\n**The rule of thumb:** catch an error only where you can actually *do* something about it (recover, give a friendly message, or add context). Everywhere else, let it stay loud, because a loud failure is far easier to fix than a silent one.",
    example: `def parse_age(text):\n    try:\n        age = int(text)\n    except ValueError:\n        return None            # not a number -> say so, don't crash\n    if age < 0:\n        raise ValueError("age cannot be negative")\n    return age\n\nprint(parse_age("42"))   # 42\nprint(parse_age("hi"))   # None`,
    trace: "Call `parse_age(\"42\")`: the `try` runs `int(\"42\")`, which succeeds and gives `42`, so the `except` is skipped. `42` is not negative, so it returns `42`.\n\nCall `parse_age(\"hi\")`: `int(\"hi\")` cannot make a number, so it raises `ValueError`. Python jumps to the matching `except`, which returns `None` instead of crashing. Because we caught only `ValueError` — the one error we expected — any other, unexpected error would still be allowed to surface loudly rather than being hidden.",
    trap: "`except Exception: pass` is dangerous: it catches every error, including bugs you never anticipated, and silently throws away the message you would need to diagnose them. Catch the narrowest, specific exception you actually expect (like `ValueError`), and let unexpected failures stay loud so you can see and fix them.",
    rule: "Wrap only the code that might fail in `try`, catch the specific exception you can actually handle, and either recover or give a clear message. Raise your own exception to reject bad input early. Never silence errors you do not understand.",
    recall: "What does a `try`/`except ValueError` block do when `int(text)` fails versus when it succeeds, and why is `except Exception: pass` dangerous?",
    checks: [
      {
        question: "What is wrong with `except Exception: pass`?",
        choices: [
          "It hides every error — including real bugs — and throws away the message needed to fix them",
          "Nothing — it is good defensive code",
          "It is a syntax error",
        ],
        answer: 0,
        why: [
          "Correct. Catching everything and doing nothing silences bugs you never expected and discards the evidence, making problems very hard to find.",
          "It is the opposite of good defensive code — it defends against nothing and hides real failures.",
          "It is valid syntax, unfortunately — which is why it is a trap rather than an obvious mistake.",
        ],
        explanation: "Catch the narrowest exception you can actually handle; let unexpected failures stay loud.",
      },
      {
        question: "In `try: age = int(text)` with `except ValueError:`, what happens when `text` is `\"hi\"`?",
        choices: [
          "`int(\"hi\")` raises `ValueError`, so Python jumps to the `except` block instead of crashing",
          "`age` becomes `0`",
          "The whole program stops immediately",
        ],
        answer: 0,
        why: [
          "Correct. Converting `\"hi\"` to an int fails with `ValueError`; the matching `except` catches it, so the program keeps running down that branch.",
          "Python does not default a failed conversion to `0`; it raises, and the `except` decides what happens next.",
          "It does not stop the program because you caught the error — that is the point of `try`/`except`.",
        ],
        explanation: "A raised exception jumps to the matching `except`; without one it would crash.",
      },
      {
        question: "Why `raise ValueError(\"age cannot be negative\")` instead of letting a bad age flow on?",
        choices: [
          "A clear error at the source is easier to fix than a confusing crash deeper in the program",
          "Raising makes the program run faster",
          "You must raise an error in every function",
        ],
        answer: 0,
        why: [
          "Correct. Rejecting bad input where you detect it, with a clear message, stops it from causing a puzzling failure somewhere far away later.",
          "Speed is not the reason; clarity and early detection are.",
          "Not every function needs to raise — only raise when you have detected something genuinely invalid.",
        ],
        explanation: "Raise a clear error at the point you detect bad input, so failures are easy to trace.",
      },
    ],
    prompt: "Return `int(text)` or `default` when and only when conversion raises `ValueError`.", fn: "parse_int", starter: `def parse_int(text, default=None):\n    pass`, solution: `def parse_int(text, default=None):\n    try:\n        return int(text)\n    except ValueError:\n        return default`,
    tests: [t("valid", `assert fn("42") == 42`), t("fallback", `assert fn("no", -1) == -1`), t("does not swallow type error", `try: fn(None); assert False\nexcept TypeError: pass`, true)],
  },
  {
    id: "contexts", module: "py.m5", title: "Context managers and resources", goal: "Guarantee cleanup across success and failure paths.", requires: ["exceptions", "imports"],
    model: "A context manager brackets a region with setup and cleanup. `with` calls `__enter__`, executes the body, then calls `__exit__` even if the body raises. Files, locks, transactions, and temporary state all fit this protocol.",
    example: `with open(path, encoding="utf-8") as file:\n    text = file.read()\n# file is closed here, including after an exception`,
    trace: "The resource lifetime is visible from indentation. Cleanup belongs to the provider rather than being duplicated in every caller's `finally` block.",
    trap: "Returning a file handle created inside `with` returns a closed resource. Return the data or let the caller own the context.",
    rule: "If an operation has an acquire/release pair, expose it as a context manager.",
    recall: "Which special method runs when the body raises, and what cleanup guarantee does that enable?",
    check: {
      question: "If the body of a `with` block raises, does the context manager's cleanup still run?",
      choices: ["Yes — `__exit__` runs on both success and failure", "No — an exception skips cleanup"],
      answer: 0,
      explanation: "`with` guarantees `__exit__` runs even when the body raises. That reliable cleanup is the whole point.",
    },
    prompt: "Use `contextlib.contextmanager` to implement `temporarily(mapping, key, value)`: set a value inside the context, then restore the old state afterward.", fn: "temporarily", starter: `from contextlib import contextmanager\n\n@contextmanager\ndef temporarily(mapping, key, value):\n    pass`, solution: `from contextlib import contextmanager\n\n@contextmanager\ndef temporarily(mapping, key, value):\n    missing = object()\n    old = mapping.get(key, missing)\n    mapping[key] = value\n    try:\n        yield\n    finally:\n        if old is missing:\n            mapping.pop(key, None)\n        else:\n            mapping[key] = old`,
    tests: [t("restores", `data = {"x": 1}\nwith fn(data, "x", 9): assert data["x"] == 9\nassert data["x"] == 1`), t("removes new", `data = {}\nwith fn(data, "x", 9): pass\nassert "x" not in data`, true)],
  },
  {
    id: "files-json", module: "py.m5", title: "Paths, files, JSON, and boundaries", goal: "Read external data with explicit encoding and validation.", requires: ["contexts", "dicts"],
    model: "`pathlib.Path` represents filesystem paths without manual separator logic. Text must be decoded with an encoding. JSON converts a narrow data model—objects, arrays, strings, numbers, booleans, null—not arbitrary Python objects.",
    example: `import json\nfrom pathlib import Path\n\ndata = json.loads(Path("config.json").read_text(encoding="utf-8"))\ntimeout = data["timeout"]`,
    trace: "Parsing proves only that the text is valid JSON. Indexing and validation still need to establish the application's expected shape and types.",
    trap: "Never use `eval` to parse data. It executes code. JSON is data-only and should still be size-limited and validated at trust boundaries.",
    rule: "Decode, parse, validate, then convert to domain objects—four separate steps.",
    recall: "What does successful JSON parsing prove, and what does it not prove?",
    check: {
      question: "A successful `json.loads(text)` proves what?",
      choices: ["Only that the text is valid JSON — not that it has the shape or types you expect", "That the data matches your schema"],
      answer: 0,
      explanation: "Parsing checks syntax only. You still must validate the shape and types at the trust boundary.",
    },
    prompt: "Return compact, key-sorted JSON for a dictionary so equivalent inputs produce stable text.", fn: "stable_json", starter: `import json\n\ndef stable_json(data):\n    pass`, solution: `import json\n\ndef stable_json(data):\n    return json.dumps(data, sort_keys=True, separators=(",", ":"))`,
    tests: [t("stable", `assert fn({"b": 2, "a": 1}) == '{"a":1,"b":2}'`), t("nested", `assert fn({"x": [2, 1]}) == '{"x":[2,1]}'`)],
  },
  {
    id: "typing", module: "py.m6", title: "Type hints as executable design", goal: "Use annotations to expose contracts without confusing them for runtime checks.", kind: "mental-model", requires: ["functions", "classes", "imports"],
    model: "Type hints describe intended values for static tools, editors, and readers. Python normally does not enforce annotations at runtime. Unions model alternatives; protocols model required behavior; generics preserve relationships between input and output types.",
    example: `from collections.abc import Iterable\nfrom typing import TypeVar\n\nT = TypeVar("T")\n\ndef first(items: Iterable[T]) -> T:\n    return next(iter(items))`,
    trace: "`T` means the result has the same type as members of the input, information that `object` would erase. A checker can flag mismatched calls before tests run.",
    trap: "`Any` disables checking and spreads uncertainty. Use `object` for an unknown value that callers must narrow safely.",
    rule: "Annotate public boundaries and tricky invariants first; let inference handle obvious local variables.",
    recall: "What relationship does `T` preserve in the `first` example?",
    check: {
      question: "Do Python type hints enforce types at runtime?",
      choices: ["No — they guide tools and readers; Python normally does not check them while running", "Yes — a wrong type raises immediately"],
      answer: 0,
      explanation: "Annotations document contracts for static checkers and editors. They are not runtime checks unless you add them.",
    },
    prompt: "Implement annotated `only_strings(values: list[object]) -> list[str]` using `isinstance`.", fn: "only_strings", starter: `def only_strings(values: list[object]) -> list[str]:\n    pass`, solution: `def only_strings(values: list[object]) -> list[str]:\n    return [value for value in values if isinstance(value, str)]`,
    tests: [t("narrows", `assert fn(["a", 2, "b", None]) == ["a", "b"]`), t("empty", "assert fn([]) == []")],
  },
  {
    id: "testing", module: "py.m6", title: "Tests that explain behavior", goal: "Partition inputs and test contracts rather than implementation trivia.", kind: "pattern", requires: ["typing", "exceptions"],
    model: "A useful test names one behavior, arranges the smallest meaningful state, performs one action, and checks an observable result. Partitions—empty, singleton, ordinary, boundary, invalid—find more bugs than many random happy examples.",
    example: `def test_clamp_caps_above_upper_bound():\n    assert clamp(12, 0, 10) == 10\n\ndef test_clamp_preserves_interior_value():\n    assert clamp(4, 0, 10) == 4`,
    trace: "The names document the contract. If implementation changes from nested conditions to `min`/`max`, these tests remain valid because behavior did not change.",
    trap: "A test that reproduces the implementation can make the same mistake. Derive expected values independently from the specification.",
    rule: "Test boundaries, invariants, and failures; avoid asserting private call order unless that order is the contract.",
    recall: "Name five useful input partitions for a collection-processing function.",
    check: {
      question: "Why derive a test's expected value from the spec rather than by copying the implementation?",
      choices: ["A test that mirrors the code can repeat the same mistake", "It runs faster"],
      answer: 0,
      explanation: "Independently derived expected values catch bugs; a test that reproduces the implementation validates nothing new.",
    },
    prompt: "Implement `median(values)` for a nonempty numeric list. Do not mutate the input.", fn: "median", starter: `def median(values):\n    pass`, solution: `def median(values):\n    ordered = sorted(values)\n    middle = len(ordered) // 2\n    if len(ordered) % 2:\n        return ordered[middle]\n    return (ordered[middle - 1] + ordered[middle]) / 2`,
    tests: [t("odd", "assert fn([9, 1, 4]) == 4"), t("even", "assert fn([1, 4, 2, 3]) == 2.5"), t("does not mutate", "data = [3, 1, 2]; fn(data); assert data == [3, 1, 2]", true)],
  },
  {
    id: "debugging", module: "py.m6", title: "Debugging by reducing uncertainty", goal: "Turn a vague failure into the first incorrect state transition.", kind: "mental-model", requires: ["testing"],
    model: "Debugging is controlled search. Reproduce the failure, shrink the input, state expected and actual behavior, then find the earliest point where state diverges. A stack trace is a path of calls, read from the exception upward.",
    example: `def normalize(records):\n    assert all("id" in record for record in records)\n    ...`,
    trace: "A breakpoint or focused log should test a hypothesis: which invariant first became false? Logging everything increases data while reducing signal.",
    trap: "Changing several lines before rerunning destroys evidence. You no longer know which hypothesis was correct or which change caused a regression.",
    rule: "One hypothesis, one discriminating observation, one change.",
    recall: "What exact location are you seeking when you walk backward from a failure?",
    check: {
      question: "You change five lines at once, rerun, and the test passes. What is the problem?",
      choices: ["You do not know which change fixed it — change one thing per hypothesis", "Nothing, it passed"],
      answer: 0,
      explanation: "Debugging is controlled search: one hypothesis, one discriminating observation, one change at a time.",
    },
    prompt: "Implement `first_difference(left, right)`, returning the first unequal index or the shorter length when only lengths differ; return `None` when equal.", fn: "first_difference", starter: `def first_difference(left, right):\n    pass`, solution: `def first_difference(left, right):\n    for index, (a, b) in enumerate(zip(left, right)):\n        if a != b:\n            return index\n    if len(left) != len(right):\n        return min(len(left), len(right))\n    return None`,
    tests: [t("value", "assert fn([1, 9], [1, 3]) == 1"), t("length", "assert fn([1], [1, 2]) == 1"), t("equal", "assert fn('abc', 'abc') is None")],
  },
  {
    id: "modules", module: "py.m7", title: "Modules, packages, and import boundaries", goal: "Organize code so imports reveal dependencies instead of triggering surprises.", kind: "pattern", requires: ["imports", "functions", "classes"],
    model: "A module is one executed Python file with its own global namespace. A package groups importable modules. The import system caches modules in `sys.modules`, so top-level code normally runs once per process.",
    example: `# prices.py\ndef total(items):\n    return sum(item.price for item in items)\n\n# checkout.py\nfrom .prices import total`,
    trace: "Import locates the module, creates its namespace, executes its top level, caches it, then binds the requested name. Functions should do work when called; import time should mostly define objects.",
    trap: "Circular imports mean two modules need each other before either has finished initializing. Move shared abstractions downward or pass dependencies inward rather than hiding the cycle inside a local import.",
    rule: "Dependencies should point from policy toward stable lower-level mechanisms, with side effects behind explicit entry-point functions.",
    recall: "Why can a module's top-level side effect happen merely because another module imports one function from it?",
    check: {
      question: "Importing one function from a module can trigger the module's top-level code. Why?",
      choices: ["Import runs the whole module body once, then caches it", "It does not — only that one function is loaded"],
      answer: 0,
      explanation: "Import executes the module's top level once (cached in `sys.modules`). Keep side effects inside functions, not at import time.",
    },
    prompt: "Implement `public_names(namespace)`, returning sorted keys that do not begin with an underscore.", fn: "public_names", starter: `def public_names(namespace):\n    pass`, solution: `def public_names(namespace):\n    return sorted(name for name in namespace if not name.startswith("_"))`,
    tests: [t("filters", `assert fn({"run": 1, "_cache": 2, "Model": 3}) == ["Model", "run"]`), t("empty", "assert fn({}) == []")],
  },
  {
    id: "performance", module: "py.m6", title: "Measure before optimizing", goal: "Separate algorithmic cost from Python-level overhead using evidence.", kind: "mental-model", requires: ["testing", "complexity"],
    model: "Performance work begins with a representative workload and a profiler. Complexity predicts growth; profiling identifies where this program spends time. Improve the algorithm before micro-optimizing syntax.",
    example: `from collections import Counter\n\ndef most_common(values):\n    return Counter(values).most_common(1)[0][0]`,
    trace: "Built-ins and standard-library containers often run their inner loops in optimized native code, but the larger win is still choosing one count pass instead of repeated scans.",
    trap: "Timing one tiny call with a wall clock mostly measures noise. Use `timeit` for microbenchmarks and profile the real end-to-end path before deciding what matters.",
    rule: "Set a target, capture a baseline, change one bottleneck, then measure again while keeping correctness tests green.",
    recall: "What different questions do asymptotic analysis, profiling, and microbenchmarking answer?",
    check: {
      question: "Before optimizing a slow program, you should first…",
      choices: ["Profile a representative workload to see where time is actually spent", "Rewrite whichever syntax looks slowest"],
      answer: 0,
      explanation: "Complexity predicts growth; profiling shows where this program spends time. Fix the algorithm before micro-tuning syntax.",
    },
    prompt: "Return the most frequent value; break ties by whichever appears first. Make one counting pass and one selection pass.", fn: "mode_first", starter: `def mode_first(values):\n    pass`, solution: `def mode_first(values):\n    counts = {}\n    for value in values:\n        counts[value] = counts.get(value, 0) + 1\n    best = values[0]\n    for value in values:\n        if counts[value] > counts[best]:\n            best = value\n    return best`,
    tests: [t("mode", `assert fn([2, 1, 2, 3]) == 2`), t("first tie", `assert fn(["b", "a", "a", "b"]) == "b"`), t("one", "assert fn([9]) == 9")],
  },
  {
    id: "asyncio", module: "py.m7", title: "Asyncio and cooperative concurrency", goal: "Explain when `await` yields control and prevent accidental serial I/O.", kind: "mental-model", requires: ["exceptions", "contexts"],
    model: "An `async def` call creates a coroutine. An event loop advances ready tasks until they reach an `await` that cannot complete, then runs other ready work. This helps with many waiting I/O operations; it does not make CPU work faster.",
    example: `import asyncio\n\nasync def load_all(urls):\n    async with asyncio.TaskGroup() as group:\n        tasks = [group.create_task(fetch(url)) for url in urls]\n    return [task.result() for task in tasks]`,
    trace: "The task group starts siblings before waiting for completion and provides structured lifetime: leaving the block waits for every child, and a failure cancels remaining siblings.",
    trap: "`await fetch(a); await fetch(b)` is deliberately serial. Also, blocking file or CPU work inside the event loop freezes every task sharing that thread.",
    rule: "Use async when concurrency is high and waiting dominates; keep task ownership structured and cancellation-safe.",
    recall: "At what kind of point can another asyncio task run, and why does CPU-bound work block the loop?",
    check: {
      question: "`await fetch(a); await fetch(b)` runs the two fetches how?",
      choices: ["Serially — the second waits for the first to finish", "Concurrently, at the same time"],
      answer: 0,
      explanation: "Two sequential `await`s run one after another. Use a task group or `gather` to overlap the waiting.",
    },
    prompt: "Implement async `gather_ordered(functions)` that calls zero-argument async functions concurrently and returns results in input order.", fn: "gather_ordered", starter: `import asyncio\n\nasync def gather_ordered(functions):\n    pass`, solution: `import asyncio\n\nasync def gather_ordered(functions):\n    return await asyncio.gather(*(function() for function in functions))`,
    tests: [t("ordered", `import asyncio\nasync def a(): await asyncio.sleep(0.01); return "a"\nasync def b(): return "b"\nassert await fn([a, b]) == ["a", "b"]`), t("empty", "assert await fn([]) == []", true)],
  },
  {
    id: "parallelism", module: "py.m7", title: "Threads, processes, and the GIL", goal: "Choose a concurrency model from the workload and sharing cost.", kind: "mental-model", requires: ["asyncio", "performance"],
    model: "In standard CPython, the global interpreter lock allows one thread at a time to execute Python bytecode. Threads still help when calls release the lock while waiting on I/O. Processes provide separate interpreters for CPU parallelism but require serialization and explicit coordination.",
    example: `# waiting-heavy: ThreadPoolExecutor\n# CPU-heavy pure Python: ProcessPoolExecutor\n# many async sockets: asyncio\n# vectorized numerical kernels: often release the GIL`,
    trace: "The choice is a cost model. Threads share memory cheaply but need synchronization. Processes isolate memory and can use cores, but copying tasks and results can dominate small jobs.",
    trap: "Concurrency is not automatically parallelism, and parallelism is not automatically faster. Shared mutable state adds races; tiny tasks add more scheduling overhead than useful work.",
    rule: "First classify the bottleneck as CPU, waiting I/O, or external service capacity; then measure task size and data-transfer cost.",
    recall: "Why can threads improve network throughput even though the GIL limits Python bytecode execution?",
    check: {
      question: "Why can threads still speed up network-heavy work despite the GIL?",
      choices: ["Threads release the GIL while waiting on I/O, so other threads run", "The GIL does not apply to threads"],
      answer: 0,
      explanation: "Threads help when calls release the lock while waiting on I/O. CPU-bound Python needs separate processes.",
    },
    prompt: "Implement `execution_model(cpu_bound, many_connections)` returning `\"processes\"` for CPU work, `\"asyncio\"` for many waiting connections, and `\"threads\"` otherwise.", fn: "execution_model", starter: `def execution_model(cpu_bound, many_connections):\n    pass`, solution: `def execution_model(cpu_bound, many_connections):\n    if cpu_bound:\n        return "processes"\n    if many_connections:\n        return "asyncio"\n    return "threads"`,
    tests: [t("cpu", `assert fn(True, True) == "processes"`), t("many io", `assert fn(False, True) == "asyncio"`), t("ordinary io", `assert fn(False, False) == "threads"`)],
  },
  {
    id: "complexity", module: "py.m2", title: "Time and space complexity", goal: "Derive Big-O from operations and input growth rather than memorized labels.", kind: "mental-model", requires: ["lists", "dicts", "loops", "aggregation-tools"], tracks: ["faang", "swe", "ml", "quant"],
    model: "**Complexity** answers one practical question: *as the input gets bigger, how fast does the work grow?* You do not need heavy math — you need to count how many steps happen as the input size (call it `n`) grows.\n\nA few common shapes, from best to worst:\n- **Constant, written O(1):** the work does not grow with `n`. Looking up a dict key, or reading `list[0]`, takes about the same time whether the collection has 10 items or 10 million.\n- **Linear, O(n):** the work grows in step with `n`. A single loop that touches each item once — like summing a list — does about `n` steps.\n- **Quadratic, O(n²):** a loop inside a loop, where for each item you look at every item, does about `n × n` steps. This gets slow fast: doubling `n` roughly quadruples the work.\n\n```python\n# O(n): one pass over the list\ntotal = 0\nfor value in values:      # n steps\n    total += value\n\n# O(n squared): for each item, scan them all\nfor a in values:          # n times...\n    for b in values:      # ...n each -> about n*n steps\n        print(a, b)\n```\n\n**The trick that saves you the most** is replacing a scan with a lookup. Checking `if x in my_list` may scan the whole list — that is O(n). Checking `if x in my_set` (or a dict) is about O(1). So building a set once and then checking membership turns a slow repeated scan into fast lookups. That is a big reason sets and dicts matter.\n\nTwo habits: keep only the biggest term (a program that does `n + n²` steps is called O(n²), because for large `n` the square dwarfs the rest), and remember that built-in operations have costs too — sorting is more than one pass, and slicing or joining strings copies data.",
    example: `# O(n): one loop, one pass\ntotal = 0\nfor value in values:\n    total += value\n\n# O(1) average: set membership is a fast lookup, not a scan\nseen = set()\nfor value in values:      # n times\n    if value in seen:     # fast lookup, not a scan\n        return True\n    seen.add(value)`,
    trace: "The first loop runs its body once per item — `n` items means about `n` steps, so it is O(n) time. The second loop also runs `n` times, and each pass does a set membership check and a set add, both fast (about O(1) on average) — so the whole thing is still about `n` steps, O(n) time. It also stores up to `n` values in the set, so it uses O(n) extra space. The win: using a set turns 'have I seen this before?' into a fast lookup instead of re-scanning the list each time, which would have been O(n) per check and O(n²) overall.",
    trap: "Some operations hide their cost. `x in a_list` scans the list (O(n)); slicing a list or joining strings copies data; sorting is more than a single pass. When you count steps, count these built-in operations too — one innocent-looking line can be the expensive part. And a nested loop is not automatically O(n²): count how many times the inner body actually runs.",
    rule: "To judge speed, count how the number of steps grows with the input size `n`: no growth is O(1), one pass is O(n), a loop inside a loop over the same data is about O(n²). Keep the biggest term, and prefer a set or dict lookup over scanning a list.",
    recall: "Roughly how many steps does a single loop over `n` items take, and why is `x in a_set` faster than `x in a_list` for large collections?",
    checks: [
      {
        question: "Roughly what does `x in my_list` cost for a list of `n` items?",
        choices: [
          "O(n) — it may have to scan every element",
          "O(1) — lists have instant membership",
          "O(n²) — it checks every pair",
        ],
        answer: 0,
        why: [
          "Correct. A list has no shortcut for 'is x here?', so it may check each item in turn — up to `n` steps. A set or dict makes this about O(1).",
          "Lists do not have instant membership; that is what sets and dicts are for. A list must scan.",
          "It checks each item once, not every pair — that is `n` steps, O(n), not O(n²).",
        ],
        explanation: "List membership scans (O(n)); set/dict membership is about O(1) average.",
      },
      {
        question: "A loop over `n` items, with another loop over the same `n` items inside it, is about…",
        choices: [
          "O(n²) — the inner body runs about n × n times",
          "O(n) — there are still only n items",
          "O(1) — loops do not affect complexity",
        ],
        answer: 0,
        why: [
          "Correct. For each of the `n` outer passes, the inner loop runs `n` times, so the body runs about `n × n` times — O(n²).",
          "Even though there are `n` items, the body runs `n` times per outer pass, so the total is `n × n`, not `n`.",
          "Loops are exactly what drive complexity — a loop inside a loop multiplies the step count.",
        ],
        explanation: "A loop nested inside a loop over the same data runs about n² times — O(n²).",
      },
      {
        question: "You repeatedly check 'have I seen this value?' while looping. How do you keep it fast?",
        choices: [
          "Keep a set of seen values and check membership in it — about O(1) per check",
          "Re-scan the list of seen values each time",
          "Sort the seen values before each check",
        ],
        answer: 0,
        why: [
          "Correct. A set gives about O(1) membership, so `n` checks stay around O(n) total instead of O(n²).",
          "Re-scanning a growing list each time is O(n) per check and O(n²) overall — exactly the slow path a set avoids.",
          "Sorting before every check adds work rather than removing it; a set's direct lookup is simpler and faster.",
        ],
        explanation: "A set turns repeated 'seen it?' checks into O(1) lookups, avoiding an O(n²) rescan.",
      },
    ],
    prompt: "Return whether `values` contains a duplicate in O(n) expected time.", fn: "has_duplicate", starter: `def has_duplicate(values):\n    pass`, solution: `def has_duplicate(values):\n    seen = set()\n    for value in values:\n        if value in seen:\n            return True\n        seen.add(value)\n    return False`,
    tests: [t("yes", "assert fn([3, 1, 3]) is True"), t("no", "assert fn([1, 2, 3]) is False"), t("empty", "assert fn([]) is False")],
  },
  {
    id: "recursion", module: "py.m8", title: "Recursion and call frames", goal: "Prove a recursive solution terminates and returns the right value.", kind: "mental-model", requires: ["functions", "complexity"],
    model: "A recursive function solves a smaller instance of the same problem. Correctness needs a base case, progress toward it, and a combination step. Every unfinished call occupies a frame; Python does not optimize tail calls.",
    example: `def factorial(n):\n    if n <= 1:\n        return 1\n    return n * factorial(n - 1)`,
    trace: "`factorial(3)` waits for `factorial(2)`, which waits for `factorial(1)`. The base returns 1; frames then resolve outward as 2 and 6.",
    trap: "Recursion over a long linear list risks `RecursionError`. Prefer a loop when the structure is naturally flat.",
    rule: "Before coding, name the smaller input and the measure that strictly decreases.",
    recall: "What three proof obligations make a recursive function safe?",
    check: {
      question: "What guarantees a recursive function terminates?",
      choices: ["A base case plus strict progress toward it on every call", "Python's tail-call optimization"],
      answer: 0,
      explanation: "You need a base case, progress toward it, and a combination step. Python does NOT optimize tail calls, so deep recursion can raise `RecursionError`.",
    },
    prompt: "Recursively return the sum of all integers in a nested list, where members are integers or nested lists.", fn: "nested_sum", starter: `def nested_sum(values):\n    pass`, solution: `def nested_sum(values):\n    total = 0\n    for value in values:\n        if isinstance(value, list):\n            total += nested_sum(value)\n        else:\n            total += value\n    return total`,
    tests: [t("nested", "assert fn([1, [2, [3]], 4]) == 10"), t("empty", "assert fn([]) == 0"), t("deep", "assert fn([[[5]]]) == 5", true), t("negatives", "assert fn([1, [-2, 3]]) == 2", true)],
  },
  {
    id: "method", module: "py.m8", title: "The interview derivation loop", goal: "Move from examples to a justified algorithm before touching syntax.", kind: "pattern", requires: ["complexity"],
    model: "Restate the problem, work tiny examples, identify brute force, locate its repeated work, let constraints name the target complexity, choose a data structure that removes the bottleneck, then state an invariant before coding.",
    example: `# Pair sum brute force: compare every pair -> O(n²)\n# Repeated work: searching earlier values\n# Replacement: set membership -> O(1) expected\n# Invariant: seen contains exactly the values before this index`,
    trace: "The optimized solution is derived rather than guessed. Each step explains why the next tool exists and gives you language to use with an interviewer.",
    trap: "Pattern matching from keywords alone is brittle. 'Contiguous' suggests a window, but negative values may invalidate the monotonic movement that window needs.",
    rule: "Do not announce a pattern until you can state the repeated work it removes and the invariant that makes it correct.",
    recall: "What two statements should justify a chosen data structure?",
    check: {
      question: "Before announcing \"this is a sliding window,\" you should be able to state…",
      choices: ["The repeated work it removes and the invariant that makes it correct", "How many lines of code it saves"],
      answer: 0,
      explanation: "Derive the pattern from the repeated work it eliminates and the invariant it maintains; keyword-matching alone is brittle.",
    },
    prompt: "Return indices of two distinct values summing to `target`, or `None`. Use one pass and a lookup table.", fn: "pair_sum", starter: `def pair_sum(numbers, target):\n    pass`, solution: `def pair_sum(numbers, target):\n    seen = {}\n    for index, number in enumerate(numbers):\n        needed = target - number\n        if needed in seen:\n            return [seen[needed], index]\n        seen[number] = index\n    return None`,
    tests: [t("pair", "assert fn([2, 7, 11, 15], 9) == [0, 1]"), t("distinct", "assert fn([3, 3], 6) == [0, 1]"), t("none", "assert fn([1, 2], 8) is None", true)],
  },
  {
    id: "hashing", module: "py.m9", title: "Hash maps: remember the past", goal: "Replace repeated lookup with a one-pass table.", kind: "pattern", requires: ["method", "dicts"],
    model: "Hashing is the pattern for remembering facts about values already seen: index by complement, count by value, group by signature, or store the best state for a prefix.",
    example: `counts = {}\nfor value in values:\n    counts[value] = counts.get(value, 0) + 1`,
    trace: "The table turns a question about all prior elements into one expected O(1) lookup. The key must encode exactly the equivalence relation the problem cares about.",
    trap: "Storing the wrong fact gives fast access to useless information. Define the lookup question in words before choosing key and value.",
    rule: "State: key means ___; value means ___; after index i the table contains ___.",
    recall: "What three meanings should you define before implementing a hash table solution?",
    prompt: "Return the first character that occurs exactly once, or `None`.", fn: "first_unique", starter: `def first_unique(text):\n    pass`, solution: `from collections import Counter\n\ndef first_unique(text):\n    counts = Counter(text)\n    return next((char for char in text if counts[char] == 1), None)`,
    tests: [t("first", `assert fn("swiss") == "w"`), t("none", `assert fn("aabb") is None`), t("empty", `assert fn("") is None`)], pattern: "Hash map", tier: "problem", minutes: 12, difficulty: [2, 2, 2],
  },
  {
    id: "two-pointers", module: "py.m9", title: "Two pointers: shrink the search", goal: "Prove which candidates a pointer movement safely discards.", kind: "pattern", requires: ["method", "lists"],
    model: "Two pointers exploit an ordered or symmetric search space. A movement must eliminate candidates using a monotonic fact; otherwise it is only two variables, not the pattern.",
    example: `left, right = 0, len(numbers) - 1\nwhile left < right:\n    total = numbers[left] + numbers[right]\n    if total < target:\n        left += 1\n    elif total > target:\n        right -= 1\n    else:\n        return (left, right)`,
    trace: "In sorted order, a sum that is too small cannot be fixed by pairing the same smallest value with any earlier right value. Advancing left discards only impossible pairs.",
    trap: "Without ordering or another monotonic property, moving a pointer may skip the answer.",
    rule: "For every pointer move, say which region becomes impossible and why.",
    recall: "Why is increasing `left` safe when the sorted pair sum is too small?",
    prompt: "Given a sorted list, return whether two distinct values sum to `target` in O(n) time and O(1) extra space.", fn: "has_pair_sum", starter: `def has_pair_sum(numbers, target):\n    pass`, solution: `def has_pair_sum(numbers, target):\n    left, right = 0, len(numbers) - 1\n    while left < right:\n        total = numbers[left] + numbers[right]\n        if total == target:\n            return True\n        if total < target:\n            left += 1\n        else:\n            right -= 1\n    return False`,
    tests: [t("yes", "assert fn([1, 2, 4, 7], 6) is True"), t("no", "assert fn([1, 2, 4, 7], 20) is False"), t("distinct", "assert fn([3], 6) is False", true)], pattern: "Two pointers", tier: "problem", minutes: 14, difficulty: [2, 2, 2],
  },
  {
    id: "sliding-window", module: "py.m9", title: "Sliding windows", goal: "Maintain a valid contiguous region without recomputing it.", kind: "pattern", requires: ["two-pointers", "hashing"],
    model: "A sliding window keeps state for a contiguous range. The right edge adds information; the left edge removes information until an invariant is restored. Each edge moves at most n times.",
    example: `left = 0\nseen = {}\nfor right, char in enumerate(text):\n    if char in seen and seen[char] >= left:\n        left = seen[char] + 1\n    seen[char] = right`,
    trace: "The left edge never moves backward. `seen` stores latest positions, and the active window contains no duplicate character after each iteration.",
    trap: "Windows need a condition that can be repaired monotonically. With arbitrary negative numbers, enlarging a sum can decrease it, so the standard positive-sum window logic fails.",
    rule: "Define what makes the window valid, what state represents it, and exactly when the left edge advances.",
    recall: "Why does a two-edge window remain O(n) even though one loop is nested inside another?",
    prompt: "Return the length of the longest substring containing no repeated character.", fn: "longest_unique", starter: `def longest_unique(text):\n    pass`, solution: `def longest_unique(text):\n    left = 0\n    best = 0\n    latest = {}\n    for right, char in enumerate(text):\n        if char in latest and latest[char] >= left:\n            left = latest[char] + 1\n        latest[char] = right\n        best = max(best, right - left + 1)\n    return best`,
    tests: [t("ordinary", `assert fn("abcabcbb") == 3`), t("same", `assert fn("bbbb") == 1`), t("empty", `assert fn("") == 0`)], pattern: "Sliding window", tier: "problem", minutes: 20, difficulty: [3, 3, 3],
  },
  {
    id: "stack", module: "py.m9", title: "Stacks and unmatched work", goal: "Use LIFO order to resolve the most recent unfinished item.", kind: "pattern", requires: ["method", "lists"],
    model: "A stack handles nested or nearest-unmatched structure. Push when work opens; inspect or pop the most recent item when it closes. Python lists provide O(1) amortized `append` and O(1) `pop()` at the end.",
    example: `pairs = {")": "(", "]": "[", "}": "{"}\nstack = []`,
    trace: "For a closer, the only legal match is the most recently unmatched opener. Any earlier opener is blocked by what sits above it.",
    trap: "Check that the stack is nonempty before reading `stack[-1]` or popping.",
    rule: "If the next answer depends on the most recent unresolved item, test a stack.",
    recall: "Why can a closing bracket only match the top opener?",
    prompt: "Return whether a string containing only `()[]{}` is properly balanced.", fn: "balanced", starter: `def balanced(text):\n    pass`, solution: `def balanced(text):\n    pairs = {")": "(", "]": "[", "}": "{"}\n    stack = []\n    for char in text:\n        if char in "([{":\n            stack.append(char)\n        elif not stack or stack.pop() != pairs[char]:\n            return False\n    return not stack`,
    tests: [t("valid", `assert fn("([]{})") is True`), t("crossed", `assert fn("([)]") is False`), t("open", `assert fn("((") is False`), t("empty", `assert fn("") is True`, true)], pattern: "Stack", tier: "problem", minutes: 14, difficulty: [2, 2, 2],
  },
  {
    id: "intervals", module: "py.m9", title: "Intervals and sorted frontiers", goal: "Merge overlapping ranges with one maintained frontier.", kind: "pattern", requires: ["method", "lists", "sorting"],
    model: "Sorting intervals by start converts global overlap into a local question: does the next start lie beyond the end of the merged frontier? The last output interval represents the union of everything processed so far.",
    example: `intervals.sort(key=lambda pair: pair[0])\nmerged = [intervals[0][:]]`,
    trace: "After sorting, an interval cannot overlap any earlier output interval without also touching the last one, because that last interval reaches farthest to the right.",
    trap: "Decide whether touching endpoints overlap. `[1, 3]` and `[3, 5]` merge for closed intervals but not necessarily for half-open ranges.",
    rule: "Sort by the coordinate that makes the future comparable to one frontier.",
    recall: "Why is comparing only with the last merged interval sufficient after sorting by start?",
    prompt: "Merge overlapping closed intervals and return them sorted. Do not mutate the input.", fn: "merge_intervals", starter: `def merge_intervals(intervals):\n    pass`, solution: `def merge_intervals(intervals):\n    if not intervals:\n        return []\n    ordered = sorted(intervals)\n    merged = [list(ordered[0])]\n    for start, end in ordered[1:]:\n        if start <= merged[-1][1]:\n            merged[-1][1] = max(merged[-1][1], end)\n        else:\n            merged.append([start, end])\n    return merged`,
    tests: [t("overlap", "assert fn([[1, 3], [2, 6], [8, 10]]) == [[1, 6], [8, 10]]"), t("touch", "assert fn([[1, 2], [2, 3]]) == [[1, 3]]"), t("empty", "assert fn([]) == []"), t("no mutation", "data=[[2,3],[1,2]]; fn(data); assert data==[[2,3],[1,2]]", true)], pattern: "Intervals", tier: "problem", minutes: 20, difficulty: [3, 3, 3],
  },
  {
    id: "binary-search", module: "py.m9", title: "Binary search as boundary finding", goal: "Write binary search from a loop invariant instead of memorizing a template.", kind: "pattern", requires: ["method"],
    model: "Binary search works when a predicate changes monotonically across an ordered search space. Maintain a half-open interval `[low, high)` that still contains the first true position.",
    example: `low, high = 0, len(values)\nwhile low < high:\n    mid = (low + high) // 2\n    if values[mid] < target:\n        low = mid + 1\n    else:\n        high = mid`,
    trace: "Indices below `low` are proven too small; indices at or above `high` are outside the remaining candidate region. Each update removes `mid`, guaranteeing progress.",
    trap: "Mixing inclusive and exclusive bounds creates off-by-one loops. Pick one invariant and make every update preserve it.",
    rule: "Phrase the task as 'find the first position where predicate P becomes true.'",
    recall: "What do `low` and `high` mean in the half-open lower-bound search?",
    prompt: "Return the first index where `values[index] >= target`, or `len(values)` if none.", fn: "lower_bound", starter: `def lower_bound(values, target):\n    pass`, solution: `def lower_bound(values, target):\n    low, high = 0, len(values)\n    while low < high:\n        mid = (low + high) // 2\n        if values[mid] < target:\n            low = mid + 1\n        else:\n            high = mid\n    return low`,
    tests: [t("found", "assert fn([1, 3, 3, 7], 3) == 1"), t("between", "assert fn([1, 3, 7], 5) == 2"), t("past", "assert fn([1, 3], 9) == 2"), t("empty", "assert fn([], 1) == 0", true)], pattern: "Binary search", tier: "problem", minutes: 18, difficulty: [3, 3, 3],
  },
  {
    id: "prefix-sums", module: "py.m9", title: "Prefix sums and range algebra", goal: "Turn repeated range work into subtraction between two cumulative states.", kind: "pattern", requires: ["method", "lists"],
    model: "A prefix array stores the aggregate before each boundary. If prefix[i] is the sum of values before index i, then any half-open range [left, right) is prefix[right] minus prefix[left]. The same algebra extends to counts, parity, and two-dimensional regions.",
    example: `values = [3, -1, 4, 2]\nprefix = [0]\nfor value in values:\n    prefix.append(prefix[-1] + value)\n\n# sum from index 1 through 2\nprefix[3] - prefix[1]  # 3`,
    trace: "Both prefixes contain the contribution before `left`; subtraction cancels it, leaving exactly the range. Building costs O(n), then each range query costs O(1).",
    trap: "Define whether boundaries are inclusive or exclusive before writing indexes. Mixing a length-n prefix with a length-(n+1) formula is the usual off-by-one failure.",
    rule: "Use an initial zero and half-open ranges; the algebra then matches Python slicing.",
    recall: "If prefix[i] sums values before i, what expression sums [left, right)?",
    prompt: "Given `[left, right]` inclusive queries, return every range sum after one preprocessing pass.", fn: "range_sums", starter: `def range_sums(values, queries):\n    pass`, solution: `def range_sums(values, queries):\n    prefix = [0]\n    for value in values:\n        prefix.append(prefix[-1] + value)\n    return [prefix[right + 1] - prefix[left] for left, right in queries]`,
    tests: [t("ranges", "assert fn([3,-1,4,2], [[0,1],[1,3],[2,2]]) == [2,5,4]"), t("none", "assert fn([1,2], []) == []"), t("single", "assert fn([7], [[0,0]]) == [7]")], pattern: "Prefix sum", tier: "problem", minutes: 15, difficulty: [3, 2, 3],
  },
  {
    id: "monotonic-stack", module: "py.m9", title: "Monotonic stacks and next boundaries", goal: "Resolve each item when the first stronger future value appears.", kind: "pattern", requires: ["stack"],
    model: "A monotonic stack stores unresolved candidates in sorted value order. When a new value violates that order, it resolves one or more candidates. Each index is pushed once and popped once, so the total work is linear despite a nested while loop.",
    example: `result = [-1] * len(values)\nstack = []  # unresolved indices, values decreasing\nfor index, value in enumerate(values):\n    while stack and values[stack[-1]] < value:\n        result[stack.pop()] = value\n    stack.append(index)`,
    trace: "The stack holds indices whose next greater value has not appeared. The current value is the first greater one for every smaller index popped because all values between were no greater.",
    trap: "Store indices when distance or position matters. Storing only values loses where the answer belongs.",
    rule: "Define the unresolved promise of one stack entry and the event that finally resolves it.",
    recall: "Why can the inner while loop pop O(n) items without making the whole algorithm O(n²)?",
    prompt: "Return the next strictly greater value to the right for each position, or `-1` when none exists.", fn: "next_greater", starter: `def next_greater(values):\n    pass`, solution: `def next_greater(values):\n    result = [-1] * len(values)\n    stack = []\n    for index, value in enumerate(values):\n        while stack and values[stack[-1]] < value:\n            result[stack.pop()] = value\n        stack.append(index)\n    return result`,
    tests: [t("ordinary", "assert fn([2,1,2,4,3]) == [4,2,4,-1,-1]"), t("decreasing", "assert fn([3,2,1]) == [-1,-1,-1]"), t("duplicates", "assert fn([2,2,3]) == [3,3,-1]")], pattern: "Monotonic stack", tier: "problem", minutes: 18, difficulty: [4, 3, 4],
  },
  {
    id: "topological-sort", module: "py.m10", title: "Topological order and dependency graphs", goal: "Produce a valid dependency order or prove a directed cycle exists.", kind: "pattern", requires: ["graphs", "iteration-tools", "aggregation-tools"],
    model: "A topological order exists exactly for directed acyclic graphs. Kahn's algorithm repeatedly removes a zero-indegree node—the work whose prerequisites are all finished—and exposes newly ready nodes.",
    example: `indegree = [0] * count\nfor before, after in edges:\n    graph[before].append(after)\n    indegree[after] += 1\n\nready = deque(i for i, degree in enumerate(indegree) if degree == 0)`,
    trace: "Indegree is the number of unfinished incoming prerequisites. Removing a ready node decrements each dependent. If fewer than all nodes are removed, the remaining nodes depend cyclically on one another.",
    trap: "Edge direction is semantic. Decide whether `[a,b]` means a before b or a depends on b, then build graph and indegree consistently.",
    rule: "Ready means zero remaining prerequisites; processed count proves whether the ordering covered the whole graph.",
    recall: "What does a nonempty unprocessed remainder mean after the ready queue becomes empty?",
    prompt: "Edges `[before, after]` describe dependencies. Return one valid order of `0..count-1`, or `[]` if impossible.", fn: "dependency_order", starter: `def dependency_order(count, edges):\n    pass`, solution: `from collections import deque\n\ndef dependency_order(count, edges):\n    graph = [[] for _ in range(count)]\n    indegree = [0] * count\n    for before, after in edges:\n        graph[before].append(after)\n        indegree[after] += 1\n    ready = deque(i for i, degree in enumerate(indegree) if degree == 0)\n    order = []\n    while ready:\n        node = ready.popleft()\n        order.append(node)\n        for neighbor in graph[node]:\n            indegree[neighbor] -= 1\n            if indegree[neighbor] == 0:\n                ready.append(neighbor)\n    return order if len(order) == count else []`,
    tests: [t("chain", "assert fn(3, [[0,1],[1,2]]) == [0,1,2]"), t("cycle", "assert fn(2, [[0,1],[1,0]]) == []"), t("valid branching", "r=fn(4, [[0,2],[1,2],[2,3]]); assert set(r)=={0,1,2,3} and r.index(2)>r.index(0) and r.index(2)>r.index(1)", true)], pattern: "Topological sort", tier: "problem", minutes: 22, difficulty: [4, 4, 4],
  },
  {
    id: "union-find", module: "py.m10", title: "Union-find and dynamic connectivity", goal: "Merge components and answer connectivity without traversing the graph again.", kind: "pattern", requires: ["graphs", "iteration-tools"],
    model: "Disjoint-set union represents each connected component by a root. `find` follows parent links; `union` attaches one root under another. Path compression and union by size make long sequences of operations effectively constant time.",
    example: `def find(node):\n    while node != parent[node]:\n        parent[node] = parent[parent[node]]\n        node = parent[node]\n    return node`,
    trace: "Path halving rewrites each visited node toward its grandparent. Future finds reuse the shorter route. Union changes only roots, so every member keeps reaching the new representative.",
    trap: "Never attach an arbitrary node directly. Find both roots first or a union can split the representation's meaning.",
    rule: "A root identifies a component; only roots are merged; size chooses the attachment direction.",
    recall: "What two optimizations keep the parent trees shallow?",
    prompt: "Return the number of connected components among `count` numbered vertices after adding all undirected edges.", fn: "component_count", starter: `def component_count(count, edges):\n    pass`, solution: `def component_count(count, edges):\n    parent = list(range(count))\n    size = [1] * count\n    def find(node):\n        while node != parent[node]:\n            parent[node] = parent[parent[node]]\n            node = parent[node]\n        return node\n    components = count\n    for left, right in edges:\n        a, b = find(left), find(right)\n        if a == b:\n            continue\n        if size[a] < size[b]:\n            a, b = b, a\n        parent[b] = a\n        size[a] += size[b]\n        components -= 1\n    return components`,
    tests: [t("two", "assert fn(5, [[0,1],[1,2],[3,4]]) == 2"), t("all", "assert fn(3, [[0,1],[1,2],[0,2]]) == 1"), t("none", "assert fn(4, []) == 4")], pattern: "Union find", tier: "problem", minutes: 22, difficulty: [4, 4, 4],
  },
  {
    id: "shortest-paths", module: "py.m11", title: "Shortest paths and frontier choice", goal: "Choose BFS, Dijkstra, or another shortest-path method from edge costs.", kind: "pattern", requires: ["graphs", "heap"],
    model: "The frontier determines which path becomes final next. BFS is Dijkstra specialized to equal edge cost: a queue processes nodes by edge count. Dijkstra uses a min-heap for nonnegative varying costs. Negative edges require a different argument.",
    example: `distance = {start: 0}\nqueue = deque([start])\nwhile queue:\n    node = queue.popleft()\n    for neighbor in graph.get(node, []):\n        if neighbor not in distance:\n            distance[neighbor] = distance[node] + 1\n            queue.append(neighbor)`,
    trace: "The first discovery is shortest because every earlier queue layer uses fewer edges. Marking at enqueue prevents a vertex from being scheduled multiple times.",
    trap: "BFS is not a shortest weighted-path algorithm merely because it visits everything. It optimizes edge count, which matches cost only when edges are equal.",
    rule: "Equal costs: queue. Nonnegative varying costs: min-heap. Negative costs: do not use Dijkstra.",
    recall: "What property makes first discovery final in BFS?",
    prompt: "Return a dictionary of shortest unweighted distances from `start` in an adjacency dictionary.", fn: "unweighted_distances", starter: `def unweighted_distances(graph, start):\n    pass`, solution: `from collections import deque\n\ndef unweighted_distances(graph, start):\n    distance = {start: 0}\n    queue = deque([start])\n    while queue:\n        node = queue.popleft()\n        for neighbor in graph.get(node, []):\n            if neighbor not in distance:\n                distance[neighbor] = distance[node] + 1\n                queue.append(neighbor)\n    return distance`,
    tests: [t("layers", "g={'a':['b','c'],'b':['d'],'c':['d'],'d':[]}; assert fn(g,'a') == {'a':0,'b':1,'c':1,'d':2}"), t("unreachable omitted", "assert fn({'a':[],'z':[]}, 'a') == {'a':0}"), t("missing start", "assert fn({}, 'x') == {'x':0}")], pattern: "Shortest path", tier: "problem", minutes: 18, difficulty: [3, 3, 3],
  },
  {
    id: "grid-dp", module: "py.m11", title: "Two-dimensional dynamic programming", goal: "Compress a grid recurrence after proving which neighboring states it needs.", kind: "pattern", requires: ["recursion", "complexity", "iteration-tools"],
    model: "Two-dimensional DP handles states with two independent coordinates, such as two string positions or a grid cell. The table direction must ensure every dependency is already solved. Memory can be compressed only after the recurrence is correct.",
    example: `dp = [1] * columns\nfor _ in range(1, rows):\n    for col in range(1, columns):\n        dp[col] += dp[col - 1]`,
    trace: "Before updating, `dp[col]` is the number of paths from above. After `dp[col - 1]` has been updated for this row, it is the number from the left. Their sum solves the current cell.",
    trap: "Loop direction is part of the algorithm. Reversing the inner loop may read stale or prematurely updated states from the wrong row.",
    rule: "Write the full state and recurrence first; compress dimensions only when you can name what each slot means before and after update.",
    recall: "In the one-row version, what do dp[col] and dp[col-1] mean at update time?",
    prompt: "A robot moves only right or down. Return the number of paths through a `rows × columns` empty grid.", fn: "grid_paths", starter: `def grid_paths(rows, columns):\n    pass`, solution: `def grid_paths(rows, columns):\n    if rows <= 0 or columns <= 0:\n        return 0\n    dp = [1] * columns\n    for _ in range(1, rows):\n        for col in range(1, columns):\n            dp[col] += dp[col - 1]\n    return dp[-1]`,
    tests: [t("three by seven", "assert fn(3,7) == 28"), t("one row", "assert fn(1,5) == 1"), t("square", "assert fn(3,3) == 6"), t("empty", "assert fn(0,4) == 0")], pattern: "2D dynamic programming", tier: "problem", minutes: 18, difficulty: [3, 3, 3],
  },
  {
    id: "heap", module: "py.m10", title: "Heaps and top-k", goal: "Maintain the smallest or largest frontier without sorting everything.", kind: "pattern", requires: ["method", "lists"],
    model: "A binary heap keeps the smallest item at index zero and repairs order in O(log n) after push or pop. It does not fully sort its contents. A size-k min-heap retains the k largest values seen so far.",
    example: `import heapq\nheap = []\nfor value in values:\n    heapq.heappush(heap, value)\n    if len(heap) > k:\n        heapq.heappop(heap)`,
    trace: "After each iteration the heap contains the largest k values from the processed prefix. Its root is the weakest retained candidate, so a new stronger value can evict it.",
    trap: "Reading arbitrary heap positions as sorted order is wrong. Only the root has a global ordering guarantee.",
    rule: "Use a heap when you repeatedly need the next extreme or a bounded best frontier.",
    recall: "Why does a min-heap—not a max-heap—naturally maintain the k largest items?",
    prompt: "Return the kth largest value using O(k) additional space.", fn: "kth_largest", starter: `def kth_largest(values, k):\n    pass`, solution: `import heapq\n\ndef kth_largest(values, k):\n    heap = []\n    for value in values:\n        heapq.heappush(heap, value)\n        if len(heap) > k:\n            heapq.heappop(heap)\n    return heap[0]`,
    tests: [t("third", "assert fn([3, 2, 1, 5, 6, 4], 2) == 5"), t("duplicates", "assert fn([3, 2, 3, 1, 2, 4, 5, 5, 6], 4) == 4"), t("one", "assert fn([-2], 1) == -2")], pattern: "Heap / top-k", tier: "problem", minutes: 18, difficulty: [3, 2, 3],
  },
  {
    id: "trees", module: "py.m10", title: "Trees and recursive structure", goal: "Choose DFS or BFS and state what each call or queue entry represents.", kind: "pattern", requires: ["recursion", "iterators"],
    model: "Trees encode nested subproblems. DFS follows one branch using recursion or a stack; BFS visits by distance using a queue. A recursive tree function should define exactly what value it returns for one subtree.",
    example: `def depth(node):\n    if node is None:\n        return 0\n    return 1 + max(depth(node.left), depth(node.right))`,
    trace: "Each call returns the maximum number of nodes on a path beginning at its subtree root. An empty subtree contributes zero; the current node contributes one.",
    trap: "Do not share a mutable accumulator across recursive branches unless backtracking restores it precisely.",
    rule: "Write the meaning of `solve(node)` in one sentence before the base case.",
    recall: "What does the recursive `depth(node)` promise to its caller?",
    prompt: "Nodes are dictionaries with optional `left` and `right` keys. Return the maximum root-to-leaf depth; `None` has depth 0.", fn: "tree_depth", starter: `def tree_depth(node):\n    pass`, solution: `def tree_depth(node):\n    if node is None:\n        return 0\n    return 1 + max(tree_depth(node.get("left")), tree_depth(node.get("right")))`,
    tests: [t("empty", "assert fn(None) == 0"), t("one", "assert fn({}) == 1"), t("deep", `tree={"left":{"left":{}},"right":{}}\nassert fn(tree)==3`)], pattern: "Tree DFS", tier: "problem", minutes: 18, difficulty: [3, 2, 3],
  },
  {
    id: "graphs", module: "py.m10", title: "Graph traversal and visited state", goal: "Traverse a graph once without cycles or duplicate work.", kind: "pattern", requires: ["trees", "sets"],
    model: "A graph traversal maintains a frontier and a visited set. DFS and BFS are both O(V + E) with adjacency lists because each vertex is processed once and each edge is examined a constant number of times.",
    example: `from collections import deque\nqueue = deque([start])\nvisited = {start}\nwhile queue:\n    node = queue.popleft()\n    for neighbor in graph[node]:\n        if neighbor not in visited:\n            visited.add(neighbor)\n            queue.append(neighbor)`,
    trace: "Mark on enqueue, not dequeue. Then a node can enter the queue only once even when several parents discover it before its turn.",
    trap: "Recursive DFS can exceed Python's recursion limit on a deep graph; an explicit stack is safer for untrusted depth.",
    rule: "Define what one frontier item represents and mark it visited at the moment it is scheduled.",
    recall: "Why should BFS mark a node visited when enqueuing rather than when dequeuing?",
    prompt: "Given an adjacency dictionary, return whether a path exists from `start` to `target`.", fn: "path_exists", starter: `def path_exists(graph, start, target):\n    pass`, solution: `from collections import deque\n\ndef path_exists(graph, start, target):\n    queue = deque([start])\n    visited = {start}\n    while queue:\n        node = queue.popleft()\n        if node == target:\n            return True\n        for neighbor in graph.get(node, []):\n            if neighbor not in visited:\n                visited.add(neighbor)\n                queue.append(neighbor)\n    return False`,
    tests: [t("path", `g={"a":["b"],"b":["c"],"c":[]}\nassert fn(g,"a","c") is True`), t("cycle no path", `g={"a":["b"],"b":["a"]}\nassert fn(g,"a","z") is False`), t("self", "assert fn({}, 'a', 'a') is True")], pattern: "Graph BFS", tier: "problem", minutes: 20, difficulty: [3, 3, 3],
  },
  {
    id: "backtracking", module: "py.m11", title: "Backtracking and reversible choices", goal: "Enumerate a decision tree while restoring shared state exactly.", kind: "pattern", requires: ["recursion", "trees"],
    model: "Backtracking explores choices depth-first. Choose, recurse, then undo. The path represents the decisions on the current root-to-node route; pruning rejects partial choices that cannot lead to a valid answer.",
    example: `def search(index, path):\n    if index == len(values):\n        answers.append(path.copy())\n        return\n    search(index + 1, path)\n    path.append(values[index])\n    search(index + 1, path)\n    path.pop()`,
    trace: "Each level decides whether to include one value. Copy only when recording an answer; otherwise every recorded result would reference the same later-mutated list.",
    trap: "Forgetting the undo step leaks a choice into sibling branches. Copying at every recursive call is correct but can obscure and increase the cost.",
    rule: "State the choice set, completion condition, invalid-prefix rule, and undo operation.",
    recall: "Why is `path.copy()` needed when an answer is recorded?",
    prompt: "Return every subset of `values`; order of subsets does not matter.", fn: "subsets", starter: `def subsets(values):\n    pass`, solution: `def subsets(values):\n    result = []\n    path = []\n    def search(index):\n        if index == len(values):\n            result.append(path.copy())\n            return\n        search(index + 1)\n        path.append(values[index])\n        search(index + 1)\n        path.pop()\n    search(0)\n    return result`,
    tests: [t("three", "result=fn([1,2,3]); assert len(result)==8 and [] in result and [1,2,3] in result"), t("empty", "assert fn([]) == [[]]"), t("independent lists", "r=fn([1]); r[0].append(9); assert r[0] is not r[1]", true)], pattern: "Backtracking", tier: "problem", minutes: 24, difficulty: [4, 3, 4],
  },
  {
    id: "dynamic-programming", module: "py.m11", title: "Dynamic programming from repeated states", goal: "Define a state and recurrence before building a table.", kind: "pattern", requires: ["recursion", "complexity"],
    model: "Dynamic programming applies when different choice paths reach the same subproblem. Define a state containing all information the future needs, write a recurrence, identify base cases, then memoize top-down or tabulate bottom-up.",
    example: `# dp[i] = maximum money using houses before index i\nprevious_two = 0\nprevious_one = 0\nfor money in houses:\n    current = max(previous_one, previous_two + money)\n    previous_two, previous_one = previous_one, current`,
    trace: "At each house the optimal solution either skips it and keeps the previous optimum, or takes it and combines with the optimum ending two positions earlier.",
    trap: "A table without a state definition is memorized code. It breaks as soon as the output or constraint changes.",
    rule: "Write: `state means ___`; `transition considers ___`; `base case is ___`; `answer lives at ___`.",
    recall: "Why are the only choices for the final house 'skip it' or 'take it plus i-2'?",
    prompt: "Return the maximum sum of non-adjacent nonnegative values.", fn: "max_non_adjacent", starter: `def max_non_adjacent(values):\n    pass`, solution: `def max_non_adjacent(values):\n    previous_two = 0\n    previous_one = 0\n    for value in values:\n        current = max(previous_one, previous_two + value)\n        previous_two, previous_one = previous_one, current\n    return previous_one`,
    tests: [t("ordinary", "assert fn([2, 7, 9, 3, 1]) == 12"), t("pair", "assert fn([5, 1, 1, 5]) == 10"), t("empty", "assert fn([]) == 0"), t("one", "assert fn([8]) == 8", true)], pattern: "Dynamic programming", tier: "problem", minutes: 24, difficulty: [4, 3, 4],
  },
  {
    id: "api-contracts", module: "py.m12", title: "API contracts and boundary validation", goal: "Translate an endpoint contract into explicit, testable boundary behavior.", kind: "mental-model", requires: ["exceptions", "testing"], tracks: ["faang", "swe"], skills: ["systems", "api-design"],
    model: "An API contract defines accepted inputs, returned outputs, and failure behavior. Validation belongs at the boundary: once data enters the core, the rest of the program should be able to rely on its invariants. A useful contract distinguishes a missing value from a malformed value and a valid empty result.",
    example: `def page_window(page, size):\n    if page < 1 or not 1 <= size <= 100:\n        raise ValueError("invalid pagination")\n    return (page - 1) * size, size`,
    trace: "For page 3 and size 20, the boundary establishes both values are valid, then converts the public one-based page into the zero-based offset 40. Code below this boundary never has to defend against page zero.",
    trap: "Silently clamping invalid inputs hides client defects and makes retries appear successful with the wrong data. Returning several unrelated error shapes makes callers branch on accidents instead of a stable contract.",
    rule: "Validate once at the boundary, state the invariant that becomes true, and keep success and failure shapes stable.",
    recall: "What may core code safely assume after a boundary validator accepts page and size?",
    prompt: "Implement `page_window(page, size)`. Page starts at 1, size must be 1 through 100, and invalid input raises ValueError. Return `(offset, size)`.", fn: "page_window", starter: `def page_window(page, size):\n    pass`, solution: `def page_window(page, size):\n    if page < 1 or size < 1 or size > 100:\n        raise ValueError("invalid pagination")\n    return ((page - 1) * size, size)`,
    tests: [t("first", "assert fn(1, 25) == (0, 25)"), t("later", "assert fn(3, 20) == (40, 20)"), t("bad page", "\ntry:\n fn(0, 10); assert False\nexcept ValueError: pass", true), t("bad size", "\ntry:\n fn(1, 101); assert False\nexcept ValueError: pass", true)], tier: "problem", minutes: 12, difficulty: [3, 2, 3],
  },
  {
    id: "idempotency", module: "py.m12", title: "Retries and idempotency", goal: "Design a state transition that is safe when the same request arrives twice.", kind: "mental-model", requires: ["api-contracts", "sets"], tracks: ["faang", "swe"], skills: ["systems", "reliability"],
    model: "Networks can lose a response after the server committed a write. The client then cannot know whether retrying repeats the effect. An idempotency key turns an at-least-once delivery into one logical transition: record the key and result atomically with the state change, then return the recorded result on a duplicate.",
    example: `def apply_credit(balance, seen, key, amount):\n    if key in seen:\n        return balance, seen\n    return balance + amount, seen | {key}`,
    trace: "The first request with key `r7` moves 100 to 125 and records `r7`. A retry sees the key and returns 125 unchanged. The set and balance are returned as new values so the caller controls when the transition commits.",
    trap: "Checking whether a key exists and updating the balance in separate database transactions leaves a race: two workers can both observe absence. The conceptual operation must be atomic.",
    rule: "For every retried write, identify the stable request identity, the durable result, and the atomic boundary that joins deduplication to mutation.",
    recall: "Why is deduplication insufficient if recording the key and changing the balance are not atomic?",
    prompt: "Return `(new_balance, new_seen)` after applying a credit once per key. Do not mutate the caller's set.", fn: "apply_credit", starter: `def apply_credit(balance, seen, key, amount):\n    pass`, solution: `def apply_credit(balance, seen, key, amount):\n    if key in seen:\n        return balance, seen.copy()\n    return balance + amount, seen | {key}`,
    tests: [t("first", "assert fn(10, set(), 'a', 5) == (15, {'a'})"), t("duplicate", "assert fn(15, {'a'}, 'a', 5) == (15, {'a'})"), t("does not mutate", "s={'x'}; fn(4,s,'y',2); assert s == {'x'}", true)], tier: "problem", minutes: 14, difficulty: [4, 2, 4],
  },
  {
    id: "cache-reasoning", module: "py.m12", title: "Cache policy and locality", goal: "Simulate an LRU cache and explain when caching helps or lies.", kind: "pattern", requires: ["dicts", "complexity"], tracks: ["faang", "swe"], skills: ["systems", "caching"],
    model: "A cache exchanges memory and invalidation complexity for lower repeated-work latency. LRU evicts the least recently used key, approximating temporal locality. Its hit rate depends on the workload; capacity alone guarantees nothing. Correctness also requires a policy for stale values.",
    example: `# capacity 2, accesses A B A C A\n# misses:  A B   C    = 3\n# C evicts B because A was refreshed`,
    trace: "Maintain keys from least to most recent. A hit moves its key to the recent end. A miss inserts the key; if capacity is exceeded, remove exactly the oldest key.",
    trap: "Caching a mutable answer forever can make a fast system consistently wrong. A cache key that omits a relevant input can also leak one user's result into another request.",
    rule: "Before adding a cache, name the repeated computation, complete cache key, eviction rule, and acceptable staleness.",
    recall: "In LRU, what state changes on a hit even though no value is fetched from the backing store?",
    prompt: "Return the number of misses produced by an LRU cache of `capacity` for a sequence of keys. Assume only key presence matters.", fn: "lru_misses", starter: `def lru_misses(capacity, keys):\n    pass`, solution: `def lru_misses(capacity, keys):\n    recent = []\n    misses = 0\n    for key in keys:\n        if key in recent:\n            recent.remove(key)\n        else:\n            misses += 1\n            if len(recent) == capacity:\n                recent.pop(0)\n        recent.append(key)\n    return misses`,
    tests: [t("locality", "assert fn(2, ['A','B','A','C','A']) == 3"), t("thrash", "assert fn(2, ['A','B','C','A']) == 4"), t("empty", "assert fn(3, []) == 0")], pattern: "LRU cache", tier: "problem", minutes: 18, difficulty: [4, 3, 4],
  },
  {
    id: "capacity-estimation", module: "py.m12", title: "Capacity estimation and bottlenecks", goal: "Convert product traffic into rough throughput and resource bounds.", kind: "mental-model", requires: ["numbers", "performance"], tracks: ["faang", "swe"], skills: ["systems", "capacity-planning"],
    model: "Back-of-the-envelope estimation is a bounds exercise, not fortune telling. Convert every quantity to compatible units, state peak and replication assumptions, and preserve enough significant figures to reveal the bottleneck. Throughput, payload size, retention, and latency usually form the first useful model.",
    example: `# 8.64 million requests/day = 100 requests/second average\n# a 4x peak assumption gives 400 requests/second`,
    trace: "A day has 86,400 seconds. Dividing daily requests by that value gives the average. Multiplying afterward by a stated peak factor exposes the capacity target; rounding upward prevents planning below the estimate.",
    trap: "A single precise-looking answer without assumptions is false confidence. Average throughput alone hides bursts, retries, fan-out, replication, and headroom.",
    rule: "Write units beside every number, calculate an average, apply explicit peak and safety factors, then identify which assumption dominates.",
    recall: "Why should an interview estimate keep average load and peak factor as separate steps?",
    prompt: "Return the ceiling of peak requests per second from `daily_requests` and a positive `peak_factor`.", fn: "peak_rps", starter: `def peak_rps(daily_requests, peak_factor):\n    pass`, solution: `def peak_rps(daily_requests, peak_factor):\n    import math\n    if daily_requests < 0 or peak_factor <= 0:\n        raise ValueError("invalid estimate")\n    return math.ceil(daily_requests / 86_400 * peak_factor)`,
    tests: [t("round", "assert fn(8_640_000, 4) == 400"), t("ceil", "assert fn(1, 1) == 1"), t("invalid", "\ntry:\n fn(10,0); assert False\nexcept ValueError: pass", true)], tier: "problem", minutes: 12, difficulty: [3, 2, 3],
  },
  {
    id: "ml-shapes", module: "py.m13", title: "Shapes, features, and vectorized reasoning", goal: "Track tensor shapes before writing numerical code.", kind: "mental-model", requires: ["lists", "functions", "aggregation-tools"], tracks: ["ml"], skills: ["ml-systems", "linear-algebra"],
    model: "Most ML shape failures are contract failures. Write the meaning of each axis: a feature matrix is often `(examples, features)`, weights are `(features,)`, and one matrix-vector product returns one score per example. Vectorization expresses the same independent arithmetic with fewer interpreter-level loops.",
    example: `# X: 2 examples x 3 features\nX = [[1, 0, 2], [0, 3, 1]]\nw = [0.5, 1.0, -1.0]\n# scores: [-1.5, 2.0]`,
    trace: "Each row and the weight vector must share the feature dimension. Pair corresponding features, multiply, then sum. Two input rows produce exactly two output scores.",
    trap: "A broadcast that runs is not necessarily meaningful. Accidental alignment can duplicate values along the wrong axis without raising an error.",
    rule: "Annotate every axis with its domain meaning and predict the output shape before performing an operation.",
    recall: "If X has shape `(n, d)` and weights has shape `(d,)`, what must the score shape mean?",
    prompt: "Return one dot-product score per row. Raise ValueError if any row length differs from `weights`.", fn: "linear_scores", starter: `def linear_scores(rows, weights):\n    pass`, solution: `def linear_scores(rows, weights):\n    scores = []\n    for row in rows:\n        if len(row) != len(weights):\n            raise ValueError("shape mismatch")\n        scores.append(sum(value * weight for value, weight in zip(row, weights)))\n    return scores`,
    tests: [t("scores", "assert fn([[1,0,2],[0,3,1]],[.5,1,-1]) == [-1.5,2]"), t("empty batch", "assert fn([], [1,2]) == []"), t("mismatch", "\ntry:\n fn([[1]], [1,2]); assert False\nexcept ValueError: pass", true)], tier: "problem", minutes: 14, difficulty: [3, 2, 3],
  },
  {
    id: "data-leakage", module: "py.m13", title: "Splits, leakage, and honest evaluation", goal: "Construct a time-aware split without letting future information reach training.", kind: "mental-model", requires: ["ml-shapes", "lists", "sorting"], tracks: ["ml"], skills: ["ml-systems", "data"],
    model: "Evaluation estimates behavior on unseen deployment data. Leakage occurs when training features, preprocessing, selection, or labels use information unavailable at prediction time. Random splitting is inappropriate when deployment predicts the future from the past or when related entities cross both sides.",
    example: `# events are (timestamp, value)\n# train timestamps < cutoff\n# validation timestamps >= cutoff`,
    trace: "Sort by time, then place each complete event on one side of the cutoff. Any normalization statistics must later be fitted only on the training partition and applied unchanged to validation.",
    trap: "Splitting first does not save a pipeline if feature engineering was already computed over the full dataset. Leakage can happen before the split code appears.",
    rule: "Recreate the information boundary and grouping structure of deployment; fit every learned preprocessing step on training only.",
    recall: "Why can global normalization leak validation information even when labels were never copied into training?",
    prompt: "Given `(timestamp, value)` rows, return `(train, validation)` sorted by time, using `timestamp < cutoff` for training. Do not mutate input.", fn: "time_split", starter: `def time_split(rows, cutoff):\n    pass`, solution: `def time_split(rows, cutoff):\n    ordered = sorted(rows, key=lambda row: row[0])\n    train = [row for row in ordered if row[0] < cutoff]\n    validation = [row for row in ordered if row[0] >= cutoff]\n    return train, validation`,
    tests: [t("split", "assert fn([(3,'c'),(1,'a'),(2,'b')], 3) == ([(1,'a'),(2,'b')],[(3,'c')])"), t("boundary", "assert fn([(5,'x')],5) == ([],[(5,'x')])"), t("immutable", "r=[(2,'b'),(1,'a')]; fn(r,2); assert r == [(2,'b'),(1,'a')]", true)], tier: "problem", minutes: 14, difficulty: [4, 2, 4],
  },
  {
    id: "classification-metrics", module: "py.m13", title: "Metrics, thresholds, and class imbalance", goal: "Compute precision and recall and connect each to a deployment cost.", kind: "mental-model", requires: ["data-leakage", "numbers"], tracks: ["ml"], skills: ["ml-systems", "statistics"],
    model: "Accuracy hides failure on a rare class. Precision asks: among predicted positives, how many were correct? Recall asks: among actual positives, how many were found? A threshold trades false positives against false negatives; the correct operating point depends on their real cost.",
    example: `# tp=8, fp=2, fn=4\n# precision = 8/(8+2) = .8\n# recall = 8/(8+4) = 2/3`,
    trace: "Precision's denominator follows positive predictions. Recall's denominator follows positive reality. F1 is their harmonic mean and becomes zero if either essential denominator vanishes under the chosen convention.",
    trap: "Optimizing one aggregate metric before defining the decision and its costs can improve a dashboard while harming users. Always inspect slices and the confusion matrix.",
    rule: "Choose metrics from the cost of each error, report the threshold, and inspect performance across important data slices.",
    recall: "Which denominator changes when a model produces more false-positive alerts?",
    prompt: "Return `(precision, recall, f1)` from nonnegative tp, fp, fn. Use 0.0 when a denominator is zero.", fn: "classification_metrics", starter: `def classification_metrics(tp, fp, fn):\n    pass`, solution: `def classification_metrics(tp, fp, fn):\n    if min(tp, fp, fn) < 0:\n        raise ValueError("counts must be nonnegative")\n    precision = tp / (tp + fp) if tp + fp else 0.0\n    recall = tp / (tp + fn) if tp + fn else 0.0\n    f1 = 2 * precision * recall / (precision + recall) if precision + recall else 0.0\n    return precision, recall, f1`,
    tests: [t("ordinary", "p,r,f=fn(8,2,4); assert abs(p-.8)<1e-9 and abs(r-2/3)<1e-9 and abs(f-8/11)<1e-9"), t("none", "assert fn(0,0,0) == (0.0,0.0,0.0)"), t("bad", "\ntry:\n fn(-1,0,0); assert False\nexcept ValueError: pass", true)], tier: "problem", minutes: 16, difficulty: [4, 2, 4],
  },
  {
    id: "gradient-descent", module: "py.m13", title: "Optimization and gradient descent", goal: "Trace a gradient update and recognize divergence or stalled learning.", kind: "mental-model", requires: ["classification-metrics", "loops"], tracks: ["ml"], skills: ["ml-systems", "optimization"],
    model: "Gradient descent repeatedly moves parameters opposite the local slope of the loss. The learning rate controls step size: too large can overshoot or diverge; too small can make progress impractical. A training loop needs a loss, gradient, update, and evidence that generalization—not only training loss—is improving.",
    example: `# loss(w) = (w - target) ** 2\n# gradient = 2 * (w - target)\nw -= rate * gradient`,
    trace: "Starting at 0 with target 10 and rate .25 gives gradient -20 and new w 5. The next values 7.5, 8.75, and 9.375 halve the remaining error each step.",
    trap: "A decreasing training loss does not prove the model learned a transferable relationship. Data leakage, overfitting, or a broken validation path can create the same curve.",
    rule: "Log the objective and validation evidence, inspect gradient scale, and treat optimization behavior separately from generalization.",
    recall: "What does a consistently decreasing training loss establish, and what does it not establish?",
    prompt: "Starting at `weight`, perform `steps` gradient updates for `(weight-target)^2` and return the final weight.", fn: "fit_scalar", starter: `def fit_scalar(weight, target, rate, steps):\n    pass`, solution: `def fit_scalar(weight, target, rate, steps):\n    for _ in range(steps):\n        gradient = 2 * (weight - target)\n        weight -= rate * gradient\n    return weight`,
    tests: [t("one", "assert fn(0,10,.25,1) == 5"), t("converges", "assert abs(fn(0,10,.25,20)-10) < .001"), t("zero steps", "assert fn(3,9,.1,0) == 3")], tier: "problem", minutes: 15, difficulty: [4, 2, 4],
  },
  {
    id: "expected-value", module: "py.m14", title: "Expected value as a weighted sum", goal: "Compute expectation and use linearity before enumerating complicated outcomes.", kind: "mental-model", requires: ["numbers", "loops", "aggregation-tools"], tracks: ["quant"], skills: ["probability", "statistics"],
    model: "Expected value is the probability-weighted average over possible outcomes. It is not the most likely outcome and may be impossible in one trial. Linearity of expectation holds even when variables are dependent, making it a powerful way to decompose totals.",
    example: `# payoff -2 with probability .75, +10 with probability .25\n# E = -2*.75 + 10*.25 = 1`,
    trace: "Multiply each payoff by its probability, then sum. The probabilities define a distribution only if they are nonnegative and total one within numerical tolerance.",
    trap: "A positive expectation does not determine risk, drawdown, or geometric growth. Two bets with the same mean can have radically different distributions.",
    rule: "Define the random variable and full distribution first; compute its expectation, then analyze dispersion and constraints separately.",
    recall: "Why can an expected payoff of one dollar describe a game that never pays exactly one dollar?",
    prompt: "Given `(value, probability)` outcomes, validate the distribution and return expected value. Accept total probability within 1e-9 of one.", fn: "expected_value", starter: `def expected_value(outcomes):\n    pass`, solution: `def expected_value(outcomes):\n    if any(probability < 0 for _, probability in outcomes):\n        raise ValueError("negative probability")\n    total = sum(probability for _, probability in outcomes)\n    if abs(total - 1.0) > 1e-9:\n        raise ValueError("probabilities must sum to one")\n    return sum(value * probability for value, probability in outcomes)`,
    tests: [t("game", "assert abs(fn([(-2,.75),(10,.25)])-1) < 1e-9"), t("certain", "assert fn([(7,1.0)]) == 7"), t("invalid", "\ntry:\n fn([(1,.2)]); assert False\nexcept ValueError: pass", true)], tier: "problem", minutes: 13, difficulty: [3, 2, 3],
  },
  {
    id: "bayes-rule", module: "py.m14", title: "Conditional probability and Bayes' rule", goal: "Update a prior using evidence without confusing inverse conditionals.", kind: "mental-model", requires: ["expected-value"], tracks: ["quant"], skills: ["probability", "statistics"],
    model: "Bayes' rule reverses a conditional by combining a prior with a likelihood. For two hypotheses, the evidence probability is the weighted sum of how likely the evidence is under each hypothesis. Base rates matter: a strong signal can still have a modest posterior when the event is rare.",
    example: `# P(H)=.01, P(+|H)=.9, P(+|not H)=.05\n# P(H|+) = .009 / (.009 + .0495)`,
    trace: "Imagine 10,000 cases: 100 have H and 90 test positive; 9,900 do not and about 495 test positive. Only 90 of 585 positives have H, so the posterior is about 15.4 percent.",
    trap: "`P(evidence | hypothesis)` is not `P(hypothesis | evidence)`. Swapping them discards the prior and is one of the most common probability errors.",
    rule: "Write each conditional in words, expand the evidence denominator across mutually exclusive hypotheses, then sanity-check against the prior.",
    recall: "Where does the base rate enter the posterior calculation?",
    prompt: "Return `P(H|E)` from prior `P(H)`, true-positive likelihood `P(E|H)`, and false-positive likelihood `P(E|not H)`.", fn: "bayes_update", starter: `def bayes_update(prior, likelihood, false_positive):\n    pass`, solution: `def bayes_update(prior, likelihood, false_positive):\n    if any(value < 0 or value > 1 for value in (prior, likelihood, false_positive)):\n        raise ValueError("probabilities must be in [0, 1]")\n    evidence = prior * likelihood + (1 - prior) * false_positive\n    if evidence == 0:\n        raise ValueError("evidence has zero probability")\n    return prior * likelihood / evidence`,
    tests: [t("base rate", "assert abs(fn(.01,.9,.05)-(.009/.0585)) < 1e-9"), t("certain", "assert fn(1, .4, .8) == 1"), t("impossible", "\ntry:\n fn(.5,0,0); assert False\nexcept ValueError: pass", true)], tier: "problem", minutes: 16, difficulty: [4, 2, 4],
  },
  {
    id: "combinatorics", module: "py.m14", title: "Counting without enumeration", goal: "Recognize when order matters and compute combinations safely.", kind: "mental-model", requires: ["bayes-rule", "loops"], tracks: ["quant"], skills: ["probability", "combinatorics"],
    model: "Counting converts a probability space into ratios. Permutations count ordered arrangements; combinations count unordered selections. For `n choose k`, symmetry lets you use the smaller of k and n-k, and multiplying before exact division avoids floating-point error and enormous factorial intermediates.",
    example: `# choose 3 from 5\n# (5*4*3) / (1*2*3) = 10`,
    trace: "At step i, multiply by `n-k+i` and divide by i. Each partial result is an integer. Choosing two excluded elements is equivalent to choosing three included ones, so `C(5,3)=C(5,2)`.",
    trap: "Enumerating every subset to count them turns a polynomial arithmetic question into exponential work. Using `/` also converts exact integers into floats.",
    rule: "Decide whether order and replacement matter before choosing a formula; preserve exact integer arithmetic throughout.",
    recall: "Why is replacing k with `min(k, n-k)` valid and useful?",
    prompt: "Return the exact binomial coefficient `n choose k`, or 0 when k is outside 0..n, without factorials.", fn: "choose", starter: `def choose(n, k):\n    pass`, solution: `def choose(n, k):\n    if k < 0 or k > n:\n        return 0\n    k = min(k, n - k)\n    result = 1\n    for i in range(1, k + 1):\n        result = result * (n - k + i) // i\n    return result`,
    tests: [t("five", "assert fn(5,3) == 10"), t("edges", "assert fn(8,0) == 1 and fn(8,8) == 1"), t("outside", "assert fn(4,5) == 0"), t("large exact", "assert fn(50,6) == 15890700", true)], tier: "problem", minutes: 15, difficulty: [4, 2, 4],
  },
  {
    id: "monte-carlo", module: "py.m14", title: "Simulation, uncertainty, and reproducibility", goal: "Build a seeded Monte Carlo estimator and report what its error means.", kind: "mental-model", requires: ["combinatorics", "modules"], tracks: ["quant"], skills: ["probability", "simulation"],
    model: "Monte Carlo replaces a difficult expectation with an average of sampled outcomes. Independent sampling error usually shrinks proportionally to one over the square root of sample count: ten times more precision can require roughly one hundred times more samples. A seed makes debugging reproducible, not statistically valid by itself.",
    example: `# sample x,y uniformly from the unit square\n# fraction where x*x + y*y <= 1 estimates pi/4`,
    trace: "Generate pairs from one local random-number generator, count points inside the quarter circle, divide by sample count, and multiply by four. Reusing the same seed reproduces exactly the same estimate.",
    trap: "Reporting a simulated number without sample size, uncertainty, or convergence checks gives precision theater. Re-seeding inside the loop can repeat the same draw.",
    rule: "Use a local seeded generator, validate the sampling model, measure convergence, and report uncertainty with the estimate.",
    recall: "If standard error scales as `1/sqrt(n)`, about how much more sampling buys ten times smaller error?",
    prompt: "Estimate pi with `samples` unit-square draws from a local `random.Random(seed)`. Raise ValueError unless samples is positive.", fn: "estimate_pi", starter: `def estimate_pi(samples, seed=0):\n    pass`, solution: `def estimate_pi(samples, seed=0):\n    import random\n    if samples <= 0:\n        raise ValueError("samples must be positive")\n    rng = random.Random(seed)\n    inside = 0\n    for _ in range(samples):\n        x, y = rng.random(), rng.random()\n        inside += x * x + y * y <= 1\n    return 4 * inside / samples`,
    tests: [t("reproducible", "assert fn(1000,7) == fn(1000,7)"), t("reasonable", "assert abs(fn(20000,3)-3.14159) < .06"), t("invalid", "\ntry:\n fn(0); assert False\nexcept ValueError: pass", true)], tier: "problem", minutes: 18, difficulty: [4, 3, 4],
  },
];

const moduleById = new Map(MODULES.map((module) => [module.id, module]));
const unitById = new Map(UNITS.map((unit) => [unit.id, unit]));

/**
 * Every lesson owns the vocabulary it is allowed to introduce. Keeping this
 * explicit prevents a polished explanation from quietly assuming that a new
 * learner already knows the jargon. The quality gate below the content layer
 * requires at least three plain-English definitions for every Python lesson.
 */
const VOCABULARY: Record<string, Array<[term: string, meaning: string]>> = {
  programs: [["source code", "the human-readable text that contains a program"], ["statement", "a complete instruction Python can execute"], ["expression", "code that produces a value"]],
  values: [["value", "information a program can work with, such as 12 or \"Ada\""], ["object", "Python's runtime representation of a value"], ["type", "the category that determines which operations an object supports"]],
  calls: [["function", "named, reusable behavior"], ["call", "an instruction to run a function by writing parentheses after its name"], ["argument", "a value supplied to one particular function call"]],
  variables: [["variable", "a meaningful name bound to an object"], ["assignment", "evaluating the right side of `=` and binding its result to the name on the left"], ["reassignment", "binding an existing name to a different result"]],
  "first-function": [["definition", "code beginning with `def` that creates a function"], ["parameter", "a local input name written in a function definition"], ["return value", "the result a completed function call sends back to its caller"]],
  numbers: [["integer", "a whole number with no decimal part, such as `8`, `0`, or `-3`"], ["float", "a number that can include a fractional part, such as `2.5`"], ["operator", "a symbol such as `+`, `*`, or `//` that asks Python to perform a calculation"]],
  strings: [["string", "Python's value for text, written inside quotes"], ["index", "a numbered position that starts at zero"], ["slice", "a selected range that creates a new string"]],
  fstrings: [["f-string", "a string written with an `f` before the quote, whose `{}` placeholders are replaced by values"], ["interpolation", "inserting a value into the middle of surrounding text"], ["placeholder", "a `{}` hole in an f-string that Python fills with a value"]],
  "text-split": [["split", "a string method that breaks text into a list of pieces"], ["separator", "the string that marks where to split, or that is placed between joined pieces"], ["join", "a string method that builds one string from a list of strings"]],
  slicing: [["step", "the third slice number, the distance between selected items"], ["reverse slice", "`[::-1]`, which walks a sequence backward into a new copy"], ["shallow copy", "a new outer sequence sharing the same inner elements, such as from `[:]`"]],
  "format-specs": [["format spec", "the part after a colon in a placeholder that controls how a value is shown"], ["field width", "the minimum number of columns a formatted value occupies"], ["alignment", "whether a value sits left, right, or centered within its width"]],
  unpacking: [["unpacking", "binding several names from the parts of one sequence"], ["starred target", "a name written with a leading star that gathers the remaining items into a list"], ["spread", "expanding a sequence or mapping into a new one with a star operator"]],
  booleans: [["Boolean", "one of the two truth values `True` and `False`"], ["comparison", "an operation such as `<` or `==` that produces a Boolean"], ["truthiness", "Python's rule for treating a value as true or false in a condition"], ["identity", "the question of whether two references designate the exact same object"]],
  branching: [["condition", "a yes-or-no expression that decides whether code runs"], ["branch", "one possible path through `if`, `elif`, and `else`"], ["indentation", "the spaces at the start of a line that mark a Python code block"]],
  lists: [["list", "several values kept together in a specific order"], ["element", "one value stored inside a collection"], ["mutable", "able to change after it has been created"]],
  loops: [["iteration", "one complete pass through a loop body"], ["loop", "code that repeats a block of work"], ["accumulator", "a variable that keeps a running result"]],
  "iteration-tools": [["range", "a lazy sequence of integers with an excluded stop boundary"], ["enumerate", "an iterable that pairs each value with its zero-based position"], ["unpacking", "binding separate names from the parts of one produced pair"]],
  "aggregation-tools": [["aggregate", "a summary computed from a whole collection"], ["extreme", "the smallest or largest item under a comparison rule"], ["zip", "an iterable that pairs items from several inputs until the shortest ends"]],
  names: [["alias", "a second name referring to the same object"], ["shallow copy", "a new outer collection that still refers to the same nested elements"], ["identity", "the fact that two references point to the exact same object"]],
  functions: [["contract", "the promised inputs, result, errors, and effects of a function"], ["side effect", "an observable change outside the returned value"], ["local frame", "the private set of parameter and local-name bindings for one call"]],
  tuples: [["tuple", "an immutable ordered collection, often used for a fixed-shape record"], ["unpacking", "binding several names from the positions of one collection"], ["hashable", "stable enough to participate in hash-based lookup"]],
  dicts: [["dictionary", "a collection mapping unique keys to values"], ["key", "the hashable lookup label used to find a dictionary value"], ["hash table", "a structure that uses a hash to locate a likely storage slot"]],
  "dict-iteration": [["items", "a dictionary method that yields each key-and-value pair together"], ["values", "the stored data a dictionary maps its keys to"], ["insertion order", "the order in which keys were first added to a dictionary"]],
  collections: [["Counter", "a dictionary subclass that tallies how often each value appears"], ["defaultdict", "a dictionary that builds a default value the first time a missing key is used"], ["deque", "a double-ended queue with fast appends and pops at both ends"]],
  sets: [["set", "an unordered collection of unique hashable values"], ["membership", "the question of whether a collection contains a value"], ["intersection", "the values that appear in both sets"]],
  comprehensions: [["comprehension", "compact syntax that constructs a collection from an iterable"], ["mapping step", "the expression that creates each output value"], ["filter", "an optional condition that decides which inputs are accepted"]],
  sorting: [["stable sort", "an ordering that preserves the prior order of items with equal keys"], ["key function", "a function producing the comparison value for one item"], ["lambda", "a small unnamed function containing one returned expression"]],
  imports: [["module", "a Python file that groups related names"], ["standard library", "modules installed as part of Python itself"], ["qualified name", "a member name prefixed by its module, such as `math.pi`"]],
  arguments: [["signature", "the part of a function definition that describes accepted arguments"], ["keyword argument", "an argument supplied by writing its parameter name"], ["variadic parameter", "a parameter that collects an open-ended number of arguments"]],
  scope: [["scope", "the region in which a name can be found"], ["closure", "a function that remembers bindings from an enclosing function"], ["nonlocal", "a declaration that assignment targets an enclosing function's binding"]],
  exceptions: [["exception", "an object representing a failure that interrupts normal control flow"], ["raise", "to create or propagate an exception"], ["handler", "an `except` block that responds to a specific failure"]],
  decorators: [["decorator", "a callable that replaces a function with a transformed function"], ["wrapper", "the replacement function that adds behavior around another call"], ["metadata", "descriptive details such as a function's name and documentation"]],
  classes: [["class", "a definition that creates a new kind of object"], ["instance", "one object created from a class"], ["method", "a function reached through an object or class"]],
  dataclasses: [["dataclass", "a class whose routine data-handling methods are generated for you"], ["field", "one named piece of an instance's stored data"], ["value object", "an object whose meaning comes primarily from its field values"]],
  composition: [["composition", "building behavior by storing and coordinating smaller objects"], ["inheritance", "creating a class by extending another class"], ["dependency", "an object or service another component needs to do its work"]],
  protocols: [["protocol", "a set of operations an object supports, regardless of its class name"], ["data model", "Python's rules connecting special methods to ordinary syntax"], ["special method", "a double-underscore method such as `__len__` used by Python syntax"]],
  iterators: [["iterator", "a stateful one-way source that returns the next value on request"], ["generator", "an iterator produced by a function containing `yield`"], ["lazy", "producing values only when they are requested"]],
  itertools: [["itertools", "a standard-library module of lazy iterator building blocks"], ["combinations", "the unordered selections of a fixed size from an iterable"], ["groupby", "an itertools tool that collapses adjacent equal-key items into groups"]],
  contexts: [["resource", "something that must be acquired and reliably released, such as a file"], ["context manager", "an object that defines setup and cleanup around a `with` block"], ["cleanup", "work that releases a resource on both success and failure"]],
  "files-json": [["path", "a filesystem location represented deliberately rather than as an accidental string"], ["encoding", "the rule translating text characters to and from bytes"], ["JSON", "a text format for arrays, objects, numbers, strings, Booleans, and null"]],
  typing: [["type hint", "an annotation that documents an expected kind of value"], ["static checker", "a tool that finds type inconsistencies without running the program"], ["generic", "a reusable type relationship parameterized by another type"]],
  testing: [["test case", "one input situation paired with an expected observation"], ["assertion", "a claim that must be true for a test to pass"], ["boundary case", "an input at the edge of the function's valid or invalid domain"]],
  debugging: [["symptom", "the visible evidence that behavior differs from the contract"], ["hypothesis", "a specific, testable explanation for a failure"], ["state transition", "one step that changes the program's tracked values"]],
  modules: [["package", "a directory structure that groups importable Python modules"], ["import boundary", "the point where one module begins depending on another"], ["entry point", "the deliberately chosen place where an application starts"]],
  performance: [["benchmark", "a repeatable measurement of a representative workload"], ["profile", "evidence showing where running time or memory is spent"], ["bottleneck", "the part that currently limits the whole workload"]],
  caching: [["memoization", "caching a function's results so repeated calls with the same arguments reuse them"], ["lru_cache", "a functools decorator that memoizes a function and evicts the least recently used entries"], ["hashable", "stable enough to be used as a dictionary key or cache key"]],
  asyncio: [["concurrency", "making progress on multiple tasks during overlapping time"], ["coroutine", "a suspendable computation declared with `async def`"], ["await", "a suspension point where a coroutine lets other work run"]],
  parallelism: [["thread", "an execution path sharing memory with other threads in one process"], ["process", "an isolated running program with its own memory space"], ["GIL", "the CPython lock that permits one thread at a time to execute Python bytecode"]],
  complexity: [["input size", "the quantity, usually called `n`, whose growth you are analyzing"], ["time complexity", "how the number of operations grows with input size"], ["space complexity", "how additional memory use grows with input size"]],
  recursion: [["recursion", "solving a problem by calling the same function on a smaller version"], ["base case", "an input solved directly without another recursive call"], ["call stack", "the ordered collection of active function frames"]],
  method: [["constraint", "a limit on inputs or resources that rules solutions in or out"], ["invariant", "the fact an algorithm preserves while making progress"], ["edge case", "an unusual but valid input that stresses a boundary"]],
  hashing: [["hash map", "a key-to-value table used for fast average lookup"], ["complement", "the value needed to complete a target relationship"], ["one pass", "processing each input element once in sequence"]],
  "two-pointers": [["pointer", "an index marking one meaningful position in a sequence"], ["search space", "the candidate answers not yet ruled out"], ["discard proof", "the reason moving a pointer cannot remove a valid answer"]],
  "sliding-window": [["window", "a contiguous range tracked by left and right boundaries"], ["window state", "the summary needed to know whether the current range is valid"], ["monotonic movement", "a boundary moving only forward, which limits total work"]],
  stack: [["stack", "a last-in, first-out collection"], ["push", "add an item to the top of a stack"], ["pop", "remove and return the most recently pushed item"]],
  intervals: [["interval", "a range described by a start and an end"], ["overlap", "the condition that two ranges share at least one point under chosen boundary rules"], ["frontier", "the furthest merged endpoint established so far"]],
  "binary-search": [["binary search", "repeatedly halving an ordered search space"], ["boundary", "the first or last position where a monotonic condition changes"], ["half-open range", "a range including its left endpoint but excluding its right endpoint"]],
  "prefix-sums": [["prefix sum", "the cumulative total of values before a chosen boundary"], ["preprocessing", "one up-front pass that makes later queries cheaper"], ["range query", "a request for information about one subrange"]],
  "monotonic-stack": [["monotonic stack", "a stack whose represented values stay consistently increasing or decreasing"], ["unresolved candidate", "an item waiting for a future value to determine its answer"], ["amortized analysis", "bounding total work across all operations rather than one worst operation"]],
  heap: [["heap", "a partially ordered structure that exposes its smallest item efficiently"], ["root", "the heap element at index zero with the global minimum guarantee"], ["top-k", "the k largest or smallest items under a ranking rule"]],
  trees: [["tree", "a connected hierarchy with one path between nodes"], ["depth-first search", "fully exploring one branch before returning to alternatives"], ["breadth-first search", "exploring nodes in increasing distance layers"]],
  graphs: [["graph", "vertices connected by edges"], ["adjacency list", "a mapping from each vertex to its neighboring vertices"], ["visited set", "the vertices already scheduled or processed"]],
  "topological-sort": [["directed graph", "a graph whose edges have a from-side and a to-side"], ["indegree", "the number of incoming prerequisites a vertex still has"], ["topological order", "an ordering that places every prerequisite before its dependent"]],
  "union-find": [["component", "a group of vertices connected to one another"], ["representative", "the root chosen to identify one component"], ["path compression", "rewiring searches toward the representative to speed later operations"]],
  "shortest-paths": [["path", "a sequence of adjacent vertices"], ["distance", "the minimum total cost found from the start to a vertex"], ["relaxation", "improving a recorded distance through a newly considered edge"]],
  "grid-dp": [["state", "the smallest information that uniquely identifies a subproblem"], ["recurrence", "an equation expressing one state using already solved states"], ["memory compression", "discarding table data after proving it will never be needed again"]],
  backtracking: [["decision tree", "the branching set of choices an exhaustive search could make"], ["backtracking", "choose, explore, then undo before trying the next choice"], ["restoration", "returning shared state to exactly what it was before a choice"]],
  "dynamic-programming": [["overlapping subproblems", "the same smaller question being solved repeatedly"], ["memoization", "caching recursive state results"], ["tabulation", "filling stored states in dependency order"]],
  "api-contracts": [["API", "a defined interface through which software components communicate"], ["boundary validation", "checking untrusted input before core logic uses it"], ["pagination", "dividing a large result set into numbered portions"]],
  idempotency: [["retry", "sending an operation again because the first outcome is uncertain"], ["idempotent", "safe to repeat without applying the logical effect more than once"], ["atomic", "committed completely as one transition or not committed at all"]],
  "cache-reasoning": [["cache", "a faster copy of data kept to avoid repeated work"], ["LRU", "least recently used, an eviction rule removing the stalest access"], ["cache miss", "a request whose value is not currently cached"]],
  "capacity-estimation": [["throughput", "work completed per unit of time"], ["peak factor", "a multiplier estimating how much peak load exceeds the average"], ["headroom", "unused capacity reserved for bursts and uncertainty"]],
  "ml-shapes": [["feature", "one measured input variable used by a model"], ["shape", "the length of every axis in an array or tensor"], ["dot product", "the sum of pairwise products between two equal-length vectors"]],
  "data-leakage": [["training set", "examples used to fit model parameters"], ["validation set", "held-out examples used to estimate performance while developing"], ["leakage", "information entering training that would be unavailable at prediction time"]],
  "classification-metrics": [["precision", "the fraction of predicted positives that are truly positive"], ["recall", "the fraction of actual positives the model finds"], ["threshold", "the score boundary used to convert a score into a class decision"]],
  "gradient-descent": [["objective", "the quantity an optimization procedure tries to minimize or maximize"], ["gradient", "the direction and rate of steepest local increase"], ["learning rate", "the step-size multiplier applied to a gradient update"]],
  "expected-value": [["outcome", "one possible result of a random process"], ["probability distribution", "outcomes paired with nonnegative probabilities totaling one"], ["expected value", "the probability-weighted average of possible outcomes"]],
  "bayes-rule": [["prior", "the probability assigned before the new evidence"], ["likelihood", "the probability of seeing the evidence under a hypothesis"], ["posterior", "the updated probability after accounting for evidence"]],
  combinatorics: [["permutation", "an ordered arrangement"], ["combination", "an unordered selection"], ["binomial coefficient", "the number of ways to choose k items from n without order"]],
  "monte-carlo": [["Monte Carlo", "estimating a quantity by averaging simulated random outcomes"], ["seed", "a value that makes a pseudo-random sequence reproducible"], ["standard error", "the typical sampling variation of an estimate"]],
};
const conceptId = (unit: UnitSpec) => `py.${unit.id}`;
const lessonId = (unit: UnitSpec) => `py.lesson.${unit.id}`;
const atomId = (unit: UnitSpec) => `py.atom.${unit.id}`;
const problemId = (unit: UnitSpec) => `py.problem.${unit.id}`;

function stageFor(moduleId: string): Concept["stage"] {
  const part = moduleById.get(moduleId)?.part ?? 1;
  return (part <= 1 ? 0 : part === 2 ? 2 : part === 3 ? 4 : part === 4 ? 5 : 6) as Concept["stage"];
}

function body(unit: UnitSpec): string {
  const prerequisites = (unit.requires ?? [])
    .map((id) => unitById.get(id)?.title ?? id)
    .join(", ");
  const vocabulary = (VOCABULARY[unit.id] ?? [])
    .map(([term, meaning]) => `- **${term}** — ${meaning}.`)
    .join("\n");
  return `## What this builds on

${prerequisites ? `**${prerequisites}**` : "This is the starting point. You do not need any Python knowledge yet."}

## Words you will use

${vocabulary}

## The idea, step by step

${unit.model}

## Walk through an example

\`\`\`python
${unit.example}
\`\`\`

${unit.trace}

## A mistake to avoid

${unit.trap}

## What to remember

${unit.rule}`;
}

function tracksFor(unit: UnitSpec): Problem["tracks"] {
  if (unit.tracks?.length) return unit.tracks;
  if (["py.m8", "py.m9", "py.m10", "py.m11"].includes(unit.module)) {
    return unit.id === "graphs" || unit.id === "dynamic-programming"
      ? ["faang", "swe", "ml", "quant"]
      : ["faang", "swe", "quant"];
  }
  if (unit.module === "py.m6" || unit.module === "py.m7") {
    return unit.id === "performance" ? ["swe", "ml", "quant"] : ["swe", "ml"];
  }
  return undefined;
}

function skillsFor(unit: UnitSpec): string[] {
  const skills = new Set<string>(unit.skills ?? []);
  if (unit.pattern) skills.add(unit.pattern.toLowerCase().replace(/\s+\/\s+|\s+/g, "-"));
  if (["hashing", "dicts", "sets"].includes(unit.id)) skills.add("hashing");
  if (["lists", "two-pointers", "sliding-window", "intervals", "binary-search"].includes(unit.id)) skills.add("arrays");
  if (["trees", "graphs", "backtracking"].includes(unit.id)) skills.add("graphs");
  if (unit.id === "dynamic-programming") skills.add("dynamic-programming");
  if (["testing", "debugging", "modules", "parallelism", "asyncio"].includes(unit.id)) skills.add("systems");
  if (unit.id === "performance") skills.add("performance");
  return [...skills];
}

export const PYTHON_CONCEPTS: Concept[] = UNITS.map((unit) => ({
  id: conceptId(unit),
  title: unit.title,
  stage: stageFor(unit.module),
  kind: unit.kind ?? "syntax",
  requires: (unit.requires ?? []).map((id) => `py.${id}`),
  atom: atomId(unit),
  language: "python",
}));

export const PYTHON_ATOMS: Atom[] = UNITS.map((unit) => ({
  id: atomId(unit),
  title: unit.title,
  teaches: [conceptId(unit)],
  requires: (unit.requires ?? []).map((id) => `py.${id}`),
  readingSeconds: Math.max(90, Math.round(body(unit).split(/\s+/).length / 2.7)),
  body: body(unit),
  recall: unit.recall,
  language: "python",
  check: unit.check,
  checks: unit.checks,
}));

export const PYTHON_PROBLEMS: Problem[] = UNITS.filter(
  (unit) => unit.practice !== false,
).map((unit) => {
  const [concept = 2, implementation = 2, recall = 2] = unit.difficulty ?? [];
  const hints = unit.hints ?? [
    `Say what ${unit.fn} receives and what it must return in one plain sentence.`,
    unit.rule,
    `Walk through the smallest example from the lesson. Write down each value before you code.`,
  ];
  return {
    id: problemId(unit),
    kind: "problem",
    tier: unit.tier ?? "rep",
    lesson: lessonId(unit),
    title: unit.title,
    pattern: unit.pattern,
    teaches: [conceptId(unit)],
    requires: (unit.requires ?? []).map((id) => `py.${id}`),
    difficulty: { concept, implementation, recall },
    estimatedMinutes: unit.minutes ?? 3,
    prompt: unit.prompt,
    exportName: unit.fn,
    scaffolds: {
      L1: `${unit.starter}\n\n# 1. Write down what must be returned.\n# 2. Work through one tiny example.\n# 3. Turn those steps into code.`,
      L2: unit.starter,
      L3: unit.starter,
      L4: "",
    },
    tests: unit.tests,
    hints: hints.map((text, rung) => ({ rung: rung as 0 | 1 | 2, text })),
    walkthrough: [
      "What values go into the function?",
      "For one tiny example, what exact value must come back out?",
      "Which step from the lesson turns the input into that output?",
    ],
    solution: unit.solution,
    language: "python",
    tracks: tracksFor(unit),
    skills: skillsFor(unit),
  };
});

const ORDER_WITHIN_MODULE: Record<string, string[]> = {
  "py.m0": ["programs", "values", "calls", "variables", "first-function", "numbers", "strings"],
  "py.m1": ["fstrings", "booleans", "branching", "lists", "text-split", "slicing", "loops", "iteration-tools", "aggregation-tools", "names", "functions"],
  "py.m2": ["tuples", "dicts", "dict-iteration", "format-specs", "sets", "unpacking", "comprehensions", "sorting", "complexity"],
  "py.m3": ["imports", "collections", "arguments", "scope", "exceptions", "decorators"],
  "py.m5": ["iterators", "itertools", "contexts", "files-json"],
  "py.m6": ["typing", "testing", "debugging", "performance", "caching"],
  "py.m10": ["heap", "trees", "graphs", "topological-sort", "union-find"],
};

const sourceOrder = new Map(UNITS.map((unit, index) => [unit.id, index]));
const ORDERED_UNITS = [...UNITS].sort((left, right) => {
  const moduleDifference =
    MODULES.findIndex((module) => module.id === left.module) -
    MODULES.findIndex((module) => module.id === right.module);
  if (moduleDifference) return moduleDifference;
  const explicit = ORDER_WITHIN_MODULE[left.module];
  if (explicit) return explicit.indexOf(left.id) - explicit.indexOf(right.id);
  return sourceOrder.get(left.id)! - sourceOrder.get(right.id)!;
});

export const PYTHON_LESSONS: Lesson[] = ORDERED_UNITS.map((unit) => ({
  id: lessonId(unit),
  moduleId: unit.module,
  title: unit.title,
  goal: unit.goal,
  atomId: atomId(unit),
  repIds: unit.practice === false || unit.tier === "problem" ? [] : [problemId(unit)],
  problemIds: unit.practice !== false && unit.tier === "problem" ? [problemId(unit)] : [],
  language: "python",
  tracks: unit.tracks ?? moduleById.get(unit.module)?.tracks,
}));

export const PYTHON_MODULES: CourseModule[] = MODULES.map((module) => ({
  ...module,
  lessonIds: ORDERED_UNITS.filter((unit) => unit.module === module.id).map(lessonId),
  language: "python" as const,
  tracks: module.tracks,
})).filter((module) => module.lessonIds.length > 0);

export const PYTHON_DRILLS = [];

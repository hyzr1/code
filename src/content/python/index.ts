import type { Atom, CareerTrack, Concept, CourseModule, Lesson, Problem, TestSpec } from "../../types";

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
  check?: NonNullable<Atom["check"]>;
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
    model: "Assignment binds a name to an object; you learned that with numbers and strings. Lists add one important possibility: the object itself can change. Two names can point to the same mutable list, so a mutation through either name is visible through both. This relationship is called aliasing. Assignment creates another reference; it does not copy the list.",
    example: `scores = [10, 20]\nalias = scores\nalias.append(30)\n# scores is [10, 20, 30]`,
    trace: "The first line creates one list. The second line creates a second arrow to that same list. `append` changes the shared object; it does not rebind either name.",
    trap: "`alias = scores` is not a copy. Use `scores.copy()` for a shallow list copy, and understand that nested objects may still be shared.",
    rule: "Ask whether an operation mutates an existing object or rebinds a name to a different object.",
    recall: "After `b = a`, what fact must you know before deciding whether a change through `b` affects `a`?",
    check: {
      question: "After `alias = scores`, you run `alias.append(30)`. What is now true of `scores`?",
      choices: ["`scores` is unchanged, because `alias` is a copy", "`scores` also ends with 30 — both names point at the same list"],
      answer: 1,
      explanation: "Assignment creates another reference, not a copy, so a mutation through either name shows through both. Use `scores.copy()` when you need independence.",
    },
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
    tests: [t("exact", "assert fn(12, 4) == 3"), t("remainder", "assert fn(14, 4) == 3"), t("small", "assert fn(2, 5) == 0", true)],
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
    tests: [t("normalizes", `assert fn("  Ada Lovelace ") == "ada-lovelace"`), t("unicode case", `assert fn(" STRASSE ") == "strasse"`)],
  },
  {
    id: "booleans", module: "py.m1", title: "Comparisons, truth, and identity", goal: "Ask clear yes-or-no questions with comparison operators and understand the Boolean value each question produces.", requires: ["numbers", "strings"],
    model: "A **Boolean** is a value with only two possibilities: `True` or `False`. Its type is `bool`. A **comparison** asks a yes-or-no question and produces one of those two values. `==` asks whether two values are equal. `!=` asks whether they are different. `<`, `<=`, `>`, and `>=` compare order.\n\nDo not confuse `=` with `==`. One equals sign performs assignment: `score = 10` binds a name. Two equals signs ask a question: `score == 10` produces `True` or `False` and does not change `score`. Values with different types may compare differently: `3 == 3.0` is `True` because those numeric values are equal, while `3 == \"3\"` is `False` because a number is not the same value as text.\n\nPython can also treat a value as true or false when a condition needs an answer. Zero, an empty string, an empty collection, `None`, and `False` act as false; most other values act as true. This shortcut is called **truthiness**. The word `not` reverses the answer, so `not \"\"` is `True`.\n\n`is` asks a different and less common question: whether two names refer to the exact same object. At this stage, the practical rule is simple. Use `value is None` to check for Python's one special absence value. Use `==` when you care whether ordinary values are equal.",
    example: `score = 10\nscore == 10       # True\nscore != 7        # True\nscore >= 12       # False\n3 == "3"          # False: number versus text\nmissing is None   # True when missing holds None\nnot ""            # True because empty text acts as false`,
    trace: "The assignment on line 1 stores 10 in `score`. The next three lines ask separate questions and produce Boolean results without changing that value. The number 3 and the string `\"3\"` display similarly but are not equal values. `missing is None` checks for the special absence object. On the final line, the empty string acts as false and `not` reverses it to `True`.",
    trap: "Using one `=` inside a comparison does not mean equal; it is assignment syntax and often causes an error in a condition. Also avoid `value is 0` and `name is \"Ada\"`. Use `is` for `None` and use `==` for ordinary value comparisons.",
    rule: "Use comparison operators to produce `True` or `False`: `==` for equal values, `!=` for different values, order operators for size, and `is None` only for the special absence value.",
    recall: "What does each expression ask: `score = 10`, `score == 10`, and `score is None`? Which ones produce a Boolean result?",
    check: {
      question: "What does `score == 10` do?",
      choices: ["Binds `10` to `score`", "Asks whether `score` equals 10, producing `True` or `False` without changing `score`"],
      answer: 1,
      explanation: "One `=` assigns; two `==` compare. A comparison is a question that yields a Boolean and leaves its operands untouched.",
    },
    prompt: "Return whether `left` and `right` have equal values. Do not compare their printed text.", fn: "same_value", starter: `def same_value(left, right):\n    pass`, solution: `def same_value(left, right):\n    return left == right`,
    tests: [t("equal numbers", "assert fn(3, 3.0) is True"), t("different types and values", `assert fn(3, "3") is False`), t("equal strings", `assert fn("Ada", "Ada") is True`)],
  },
  {
    id: "branching", module: "py.m1", title: "Branching with invariants", goal: "Run different code for different inputs by tracing an `if`, `elif`, and `else` chain from top to bottom.", requires: ["booleans"],
    model: "Programs often need to choose between actions. An `if` statement evaluates a condition. When that condition is `True`, Python runs the indented block beneath it. When it is `False`, Python skips that block. Indentation is part of Python's syntax: it marks which lines belong to each choice.\n\n`elif` means ‘otherwise, if.’ Python checks it only when every preceding condition in the same chain was false. `else` means ‘if none of the `if` or `elif` conditions matched.’ An `else` has no condition because it catches everything remaining. In one `if`/`elif`/`else` chain, Python runs at most one branch.\n\nThe order matters. Put a more demanding threshold before a less demanding one. If `score >= 80` came before `score >= 90`, a score of 95 would enter the first branch and Python would never reach the A branch. Reading from top to bottom shows both the condition that is true and the conditions Python has already found false.",
    example: `if score >= 90:\n    grade = "A"\nelif score >= 80:\n    grade = "B"\nelse:\n    grade = "C or below"`,
    trace: "For a score of 95, the first condition is true, so `grade` becomes `\"A\"` and the rest of the chain is skipped. For 85, the first condition is false and the `elif` is true, so the result is `\"B\"`. For 72, both conditions are false, so the `else` block runs. The second condition does not need to say ‘and below 90’ because reaching it already proves the first condition failed.",
    trap: "Several separate `if` statements are not one chain. Python checks every separate `if`, so several blocks may run. Use an `if`/`elif`/`else` chain when the choices are alternatives and exactly one result should win.",
    rule: "Read a decision chain from top to bottom. Put the highest-priority or most specific condition first, indent each branch body, and use `else` for the remaining case when every valid input needs an answer.",
    recall: "For scores 95, 85, and 72, which branch runs in the example, and why can only one branch run for each score?",
    check: {
      question: "In one `if`/`elif` chain, `score >= 80` is checked before `score >= 90`. What happens to a score of 95?",
      choices: ["It takes the `>= 80` branch, and the `>= 90` branch is never reached", "It correctly lands in the `>= 90` branch"],
      answer: 0,
      explanation: "A chain runs the first true branch and skips the rest, so a looser threshold placed first captures the value. Put the most specific condition first.",
    },
    prompt: "Return one text label for `number`. Return `\"negative\"` when it is below zero, `\"zero\"` when it equals zero, and `\"positive\"` when it is above zero.\n\nCheck the cases in an order that makes exactly one return run for every number.", fn: "sign_label", starter: `def sign_label(number):\n    pass`, solution: `def sign_label(number):\n    if number < 0:\n        return "negative"\n    if number == 0:\n        return "zero"\n    return "positive"`,
    tests: [t("negative", `assert fn(-3) == "negative"`), t("zero", `assert fn(0) == "zero"`), t("positive", `assert fn(2.5) == "positive"`)],
  },
  {
    id: "loops", module: "py.m1", title: "Loops and loop invariants", goal: "Use a `for` loop to process values one at a time and trace how a running result changes.", kind: "mental-model", requires: ["branching", "lists"],
    model: "A **loop** repeats a block of code. A `for` loop is the clearest choice when you want to visit each value in a collection. In `for number in numbers:`, `numbers` is the collection being visited and `number` is a name that receives one value for the current pass. The indented body runs once for each value. One pass through the body is called an **iteration**.\n\nMany loops build a result gradually. A variable such as `total` that keeps that running result is often called an **accumulator**. Give it a starting value before the loop, update it inside the loop, and return or use it after the loop ends. `total += number` is shorter spelling for `total = total + number`; it reads the old total, adds the current number, and stores the new total.\n\nA `while` loop repeats for as long as its condition is true. It is useful when you do not know the number of repetitions in advance, but something in its body must eventually make the condition false. Otherwise the loop never ends.\n\nLater algorithm lessons use the term **loop invariant** for a fact that remains true after every iteration. In the sum example, that fact is simple: `total` equals the sum of the values visited so far. Saying that sentence makes the update easier to understand and check.",
    example: `total = 0\nfor number in numbers:\n    total += number\n# invariant: total is the sum of values already visited`,
    trace: "Before the loop begins, `total` is 0 because no values have been visited. On each iteration, `number` receives the next value. The body adds that one value to the previous total. When there are no values left, the loop ends and `total` contains the sum of the entire collection. For `[2, 4, 6]`, the running totals are 0, then 2, then 6, then 12.",
    trap: "Do not change the size of a list while a `for` loop is walking through that same list. Removing an item shifts later positions and can make the loop skip a value. Build a separate result list when you need transformed or filtered output.",
    rule: "For a running result, say what the accumulator means, choose its correct empty starting value, update it once per relevant item, and use the completed value only after the loop ends.",
    recall: "When the example has visited the first two values of `[2, 4, 6]`, what are `number` and `total`, and what does `total` mean at that moment?",
    check: {
      question: "To add up a list's values with a loop, what should `total` be before the loop begins?",
      choices: ["`0`, the starting value that stays correct even for an empty list", "The first value in the list"],
      answer: 0,
      explanation: "An accumulator starts at the identity for its operation — `0` for a sum. Starting at the first value breaks on an empty list and mis-counts otherwise.",
    },
    prompt: "Return the total of only the even numbers in `numbers` without using Python's `sum` function.\n\nStart a running total at zero. Visit one number at a time. A number is even when dividing it by 2 leaves a remainder of zero, written `number % 2 == 0`. Add only those values, then return the total after the loop.", fn: "sum_evens", starter: `def sum_evens(numbers):\n    pass`, solution: `def sum_evens(numbers):\n    total = 0\n    for number in numbers:\n        if number % 2 == 0:\n            total += number\n    return total`,
    tests: [t("mixed", "assert fn([1, 2, 3, 4]) == 6"), t("empty", "assert fn([]) == 0"), t("negative", "assert fn([-4, -3, 2]) == -2", true)],
  },
  {
    id: "iteration-tools", module: "py.m1", title: "Counting positions with range and enumerate", goal: "Use `range` for a deliberate count and `enumerate` when a loop needs both position and value.", requires: ["loops", "lists", "numbers"],
    model: "A plain `for value in values` loop is best when only each value matters. Sometimes position also matters. `enumerate(values)` produces one pair at a time: first `(0, values[0])`, then `(1, values[1])`, and so on. Unpacking in the loop header gives those two pieces meaningful names.\n\n`range(stop)` represents the integers from zero up to, but not including, `stop`. `range(start, stop)` begins elsewhere, and an optional third argument is the step. A range is lazy: it describes the count instead of first building a list of every integer. Prefer direct iteration or `enumerate` over `range(len(values))` unless you genuinely need to index or update by position.",
    example: `names = ["Ada", "Grace", "Linus"]\nfor position, name in enumerate(names):\n    print(position, name)\n\nfor countdown in range(3, 0, -1):\n    print(countdown)`,
    trace: "The first loop asks `enumerate` for pairs. On its first iteration, unpacking binds `position` to `0` and `name` to `\"Ada\"`; later iterations use 1 and 2. The second loop receives 3, then 2, then 1. Its stop value 0 is excluded. The negative step is what makes the sequence decrease.",
    trap: "Do not add one to every index automatically. Python indexes begin at zero; convert to one-based numbering only when the user-facing meaning requires it. A step of zero is invalid because the range could never make progress.",
    rule: "Loop directly over values by default, add `enumerate` when position has meaning, and use `range` when the integers themselves are the intended sequence.",
    recall: "When should a loop use direct iteration, `enumerate(values)`, or `range(...)`, and why is a range's stop excluded?",
    check: {
      question: "A loop needs both each item and its position. What is the clearest tool?",
      choices: ["`enumerate(values)`, which hands you the position and the value together", "`range(len(values))`, indexing back into the list each time"],
      answer: 0,
      explanation: "Prefer direct iteration, and reach for `enumerate` when position has meaning. `range(len(...))` is noisier and easy to get wrong by one.",
    },
    prompt: "Return labels like `\"0: Ada\"` for every item in `names`, using `enumerate`.", fn: "index_labels", starter: `def index_labels(names):\n    pass`, solution: `def index_labels(names):\n    labels = []\n    for index, name in enumerate(names):\n        labels.append(f"{index}: {name}")\n    return labels`,
    tests: [t("several", `assert fn(["Ada", "Grace"]) == ["0: Ada", "1: Grace"]`), t("empty", "assert fn([]) == []"), t("one", `assert fn(["Linus"]) == ["0: Linus"]`, true)],
  },
  {
    id: "aggregation-tools", module: "py.m1", title: "Asking collection-wide questions", goal: "Use `len`, `sum`, `min`, `max`, `any`, `all`, and `zip` only when their collection-wide meaning matches the problem.", requires: ["iteration-tools", "booleans"],
    model: "Python includes small functions for common whole-collection questions. `len(values)` counts elements. `sum(values)` adds numeric elements starting from zero. `min` and `max` select an extreme and therefore need at least one item unless a `default` is supplied. `any(booleans)` asks whether at least one input is truthy; `all(booleans)` asks whether every input is truthy. Their empty-input results are deliberately `False` for `any` and `True` for `all`.\n\n`zip(left, right)` walks collections in parallel and produces pairs. It stops when the shortest input ends, so unequal lengths can silently discard trailing values. These built-ins replace routine loops, but they do not replace understanding the loop they summarize.",
    example: `scores = [80, 95, 72]\ncount = len(scores)\ntotal = sum(scores)\nhighest = max(scores)\n\nnames = ["Ada", "Grace"]\nfor name, score in zip(names, scores):\n    print(name, score)`,
    trace: "`len` returns 3, `sum` returns 247, and `max` returns 95. The `zip` call pairs `\"Ada\"` with 80 and `\"Grace\"` with 95. It then stops because `names` is exhausted, so the trailing score 72 is not produced. Each returned or paired value can be traced with an ordinary loop.",
    trap: "Calling `min([])` or `max([])` raises `ValueError`. Also do not use `zip` as a length check: validate equal lengths first when dropped data would be a bug.",
    rule: "Name the whole-collection question first, handle its empty-input meaning explicitly, then choose the built-in whose contract says exactly that.",
    recall: "What do `any([])` and `all([])` return, why can `max([])` fail, and when can `zip` lose data?",
    check: {
      question: "What does `all([])` return for an empty list?",
      choices: ["`True` — with nothing to check, no item violates the condition", "`False`"],
      answer: 0,
      explanation: "`all([])` is `True` and `any([])` is `False` by definition. Handle the empty case deliberately, and note that `max([])` raises rather than returning a default.",
    },
    prompt: "Return the arithmetic mean of `numbers` using `sum` and `len`, or `None` for an empty list.", fn: "average_or_none", starter: `def average_or_none(numbers):\n    pass`, solution: `def average_or_none(numbers):\n    if not numbers:\n        return None\n    return sum(numbers) / len(numbers)`,
    tests: [t("integers", "assert fn([2, 4, 6]) == 4"), t("fraction", "assert fn([1, 2]) == 1.5"), t("empty", "assert fn([]) is None", true)],
  },
  {
    id: "functions", module: "py.m1", title: "Designing small functions", goal: "Design a function around inputs, outputs, and observable side effects.", requires: ["first-function", "branching", "loops"],
    model: "A function boundary is a contract: accepted inputs, returned result, possible exceptions, and side effects. Parameters are local names. Each call gets a new local frame, and `return` ends that call immediately.",
    example: `def clamp(value, low, high):\n    """Return value limited to the inclusive range."""\n    if value < low:\n        return low\n    if value > high:\n        return high\n    return value`,
    trace: "The first branch returns the lower boundary when the input is too small, so the call ends immediately. The second handles an input above the upper boundary. Reaching the final return proves neither condition was true, so the original value is already inside the inclusive range. The function changes no external object.",
    trap: "Printing a value is not returning it. A caller cannot compose with text that was only written to standard output.",
    rule: "Prefer a small returned value over a hidden mutation; make side effects obvious in the function's name and documentation.",
    recall: "What four things belong in a function contract?",
    check: {
      question: "Why prefer returning a value over printing it inside a function?",
      choices: ["A caller can keep working with a returned value; text only printed to output cannot be reused", "Printing is always slower than returning"],
      answer: 0,
      explanation: "A function's contract is its return value and effects. Printing is a side effect at the boundary; returning lets other code compose with the result.",
    },
    prompt: "Implement inclusive `clamp(value, low, high)` using explicit branches.", fn: "clamp", starter: `def clamp(value, low, high):\n    pass`, solution: `def clamp(value, low, high):\n    if value < low:\n        return low\n    if value > high:\n        return high\n    return value`,
    tests: [t("inside", "assert fn(5, 0, 10) == 5"), t("low", "assert fn(-2, 0, 10) == 0"), t("high", "assert fn(12, 0, 10) == 10")],
  },
  {
    id: "lists", module: "py.m1", title: "Lists: your first collection", goal: "Create a list, read values by position, take a slice, and add or replace an item.", requires: ["branching"],
    model: "A **list** keeps several values together in a specific order. Write square brackets around comma-separated values: `[\"a\", \"b\", \"c\"]`. The values inside are called **elements** or items. A list may be empty, may hold repeated values, and may even mix types, although lists are usually clearest when their items share one meaning.\n\nEach item has an **index**, or numbered position, starting at zero. `values[0]` reads the first item. `values[1]` reads the second. `values[-1]` reads the last item. Asking for a position that does not exist raises `IndexError`, so an empty list must be handled before reading its first or last item.\n\nA **slice** reads a range and creates a new list. `values[1:3]` starts at index 1 and stops before index 3. The stop is excluded. Lists are mutable, meaning the existing list can change: `values[0] = \"new\"` replaces one item, and `values.append(\"d\")` adds an item at the end.\n\nThere is also a performance reason to favor the end of a list. Appending at the end is normally quick. Inserting or removing at the beginning makes Python shift every later item by one position. You do not need complexity notation yet; just remember that repeated work at the front becomes expensive as a list grows.",
    example: `queue = ["a", "b", "c"]\nfirst = queue[0]       # read the item at position zero\ntail = queue[1:]       # copy items from position one onward\nqueue.append("d")      # change the existing list at its end`,
    trace: "The list begins with three items at indexes 0, 1, and 2. `queue[0]` reads `\"a\"`. The slice `queue[1:]` starts at index 1 and continues to the end, creating the separate list `[\"b\", \"c\"]`. `append` changes the original `queue` by adding `\"d\"` at its end. The earlier slice remains `[\"b\", \"c\"]` because it is a different outer list.",
    trap: "Do not read `values[-1]` before checking whether the list contains an item. An empty list has no last position and raises `IndexError`. Also remember that a slice creates a new list while `append` changes the existing list.",
    rule: "Use a list when order and positions matter. Check that a requested position exists, use a slice when you want a new range, and use `append` when you intend to change the original list.",
    recall: "For `queue = [\"a\", \"b\", \"c\"]`, what do `queue[0]`, `queue[-1]`, and `queue[1:]` return, and which one creates a new list?",
    check: {
      question: "What does the slice `queue[1:]` produce?",
      choices: ["It removes the first item from `queue`", "A new list of the items from index 1 onward; the original `queue` is unchanged"],
      answer: 1,
      explanation: "A slice creates a separate list. `append` changes the existing list; slicing reads a range into a new one.",
    },
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
    model: "Iterating a dictionary directly yields its **keys**, in the order they were inserted: `for name in prices` binds `name` to each key. To visit the stored data, call `.values()`. To visit both at once, call `.items()`, which yields a `(key, value)` pair each pass—unpack it into two names.\n\nLooking up `prices[name]` inside a key loop works, but it repeats the hash lookup you already did to reach the key. `.items()` hands you the value directly, so it is both clearer and cheaper whenever you need both parts.",
    example: `prices = {"pen": 2, "mug": 7}\n\nfor name in prices:                 # keys, in insertion order\n    print(name)\n\nfor name, price in prices.items():  # key and value together\n    print(name, price)`,
    trace: "The first loop binds `name` to each key, `\"pen\"` then `\"mug\"`, in the order they were added. The second loop asks `.items()` for one `(key, value)` tuple per pass and unpacks it into `name` and `price`. Using `.values()` instead would give the prices alone and lose the names.",
    trap: "Do not add or delete keys while iterating a dictionary—Python raises `RuntimeError` because the size changed mid-loop. Collect the keys to change in a list first, then apply the changes after the loop. And remember that `for x in d` gives keys, not values.",
    rule: "Iterate `.items()` when you need both key and value, `.values()` for values alone, and the bare dictionary when you only need keys.",
    recall: "What does `for x in my_dict` bind `x` to, and how do you get the matching value alongside it?",
    check: {
      question: "What does `x` become on each pass of `for x in {\"a\": 1, \"b\": 2}`?",
      choices: ["The keys: `\"a\"`, then `\"b\"`", "The values: `1`, then `2`"],
      answer: 0,
      explanation: "Iterating a dictionary directly yields its keys. Use `.values()` for the values, or `.items()` for both key and value together.",
    },
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
    id: "tuples", module: "py.m2", title: "Tuples and unpacking", goal: "Use fixed-shape records and unpack them safely.", requires: ["lists"],
    model: "A tuple is an immutable sequence. It communicates that positions form one fixed-shape record rather than a collection you plan to grow. Unpacking checks that shape as it binds names. A tuple whose members all have stable hashes is itself hashable; the next lessons explain why hash-based collections care about that property.",
    example: `point = (4, 7)\nx, y = point\nfirst, *middle, last = [1, 2, 3, 4]`,
    trace: "Exact unpacking requires exactly as many values as targets. One starred target absorbs any middle values into a new list. Read unpacking as simultaneous assignment: Python validates the complete shape before it binds the target names.",
    trap: "A one-item tuple needs a comma: `(5,)`. Parentheses alone only group the expression.",
    rule: "Use tuples for fixed positions with shared meaning; use a dataclass when those positions need names.",
    recall: "What makes `(5)` an integer but `(5,)` a tuple?",
    check: {
      question: "What is `(5)` versus `(5,)`?",
      choices: ["`(5)` is just the integer 5; `(5,)` is a one-item tuple", "Both are one-item tuples"],
      answer: 0,
      explanation: "Parentheses only group an expression. The comma is what makes a tuple, so a one-item tuple needs the trailing comma: `(5,)`.",
    },
    prompt: "Return a two-item tuple containing the first and last value. Return `(None, None)` for an empty sequence.", fn: "endpoints", starter: `def endpoints(values):\n    pass`, solution: `def endpoints(values):\n    if not values:\n        return (None, None)\n    return (values[0], values[-1])`,
    tests: [t("normal", "assert fn([3, 5, 8]) == (3, 8)"), t("single", "assert fn([4]) == (4, 4)"), t("empty", "assert fn([]) == (None, None)")],
  },
  {
    id: "dicts", module: "py.m2", title: "Dictionaries and counting", goal: "Turn repeated search into direct key lookup.", requires: ["lists"],
    model: "A dictionary maps hashable keys to values using a hash table. A key's hash usually lets Python jump near the matching entry instead of scanning every stored pair. As a result, lookup, insertion, and deletion usually take roughly the same amount of work as the dictionary grows. Iteration preserves insertion order, but direct key lookup—not automatic sorting—is the reason to choose it.",
    example: `counts = {}\nfor word in words:\n    counts[word] = counts.get(word, 0) + 1`,
    trace: "The key's hash selects a likely slot, then equality confirms the match. Hash and equality must remain stable while a key is stored, so mutable lists cannot be keys.",
    trap: "`counts[key]` raises `KeyError` when absent. Use `get`, `defaultdict`, or an explicit membership check according to whether absence is expected.",
    rule: "When a loop repeatedly scans for the same kind of lookup, build an index once.",
    recall: "Why must dictionary keys be hashable, and what can go wrong if a key changes?",
    check: {
      question: "Reading `counts[key]` for a key that is not present does what?",
      choices: ["Raises `KeyError`", "Returns `None`"],
      answer: 0,
      explanation: "An absent key raises `KeyError`. Use `.get(key, default)` or a membership check when absence is expected.",
    },
    prompt: "Return a dictionary mapping each item to its frequency.", fn: "frequencies", starter: `def frequencies(items):\n    pass`, solution: `def frequencies(items):\n    counts = {}\n    for item in items:\n        counts[item] = counts.get(item, 0) + 1\n    return counts`,
    tests: [t("counts", `assert fn(["a", "b", "a"]) == {"a": 2, "b": 1}`), t("empty", "assert fn([]) == {}"), t("numbers", "assert fn([1, 1, 2]) == {1: 2, 2: 1}", true)],
  },
  {
    id: "sets", module: "py.m2", title: "Sets and membership", goal: "Use sets for uniqueness and fast membership tests.", requires: ["dicts"],
    model: "A set is a hash table that stores keys without associated values. Its hash-based membership check usually avoids scanning every element. Union, intersection, and difference describe whole collection operations directly.",
    example: `required = {"id", "name"}\nprovided = set(record)\nmissing = required - provided`,
    trace: "Converting to a set discards duplicates and does not preserve a meaningful positional order. The difference retains only elements in `required` that are absent from `provided`. Membership asks whether a value exists, never which position it occupied in the original input.",
    trap: "Use `set()`, not `{}`, for an empty set; `{}` creates an empty dictionary.",
    rule: "If the question is 'have I seen this?' rather than 'where was it?', reach for a set.",
    recall: "What information is intentionally lost when a list becomes a set?",
    check: {
      question: "What does `{}` create?",
      choices: ["An empty dictionary — use `set()` for an empty set", "An empty set"],
      answer: 0,
      explanation: "`{}` is an empty dict. There is no empty-set literal, so call `set()`.",
    },
    prompt: "Return the distinct values appearing in both inputs.", fn: "shared", starter: `def shared(left, right):\n    pass`, solution: `def shared(left, right):\n    return set(left) & set(right)`,
    tests: [t("overlap", "assert fn([1, 2, 2, 3], [2, 3, 4]) == {2, 3}"), t("none", "assert fn([1], [2]) == set()")],
  },
  {
    id: "comprehensions", module: "py.m2", title: "Comprehensions without cleverness", goal: "Translate simple map/filter loops into readable comprehensions.", requires: ["lists", "dicts", "sets"],
    model: "A comprehension constructs one collection from an iterable. Read it as: produce the expression for each item that passes the optional condition. It should describe one transformation, not hide a workflow.",
    example: `squares = [n * n for n in numbers if n % 2 == 0]\nby_id = {user["id"]: user for user in users}`,
    trace: "The loop variable is assigned first, the condition is checked second, and the output expression runs only for accepted items.",
    trap: "Nested comprehensions and side effects become harder to debug than an ordinary loop. Compact is not the same as clear.",
    rule: "Use a comprehension when its spoken version fits one short sentence; otherwise write the loop.",
    recall: "In what order are the `for`, optional `if`, and output expression evaluated?",
    check: {
      question: "In `[n*n for n in nums if n > 0]`, what happens first for each item?",
      choices: ["The `for` binds `n`, then the `if` filters, then the output expression runs", "The output expression runs first"],
      answer: 0,
      explanation: "Loop variable first, condition second, and the output expression only for items that pass the filter.",
    },
    prompt: "Return a dictionary mapping each even number to its square.", fn: "even_squares", starter: `def even_squares(numbers):\n    pass`, solution: `def even_squares(numbers):\n    return {n: n * n for n in numbers if n % 2 == 0}`,
    tests: [t("mixed", "assert fn([1, 2, 3, 4]) == {2: 4, 4: 16}"), t("duplicates", "assert fn([2, 2]) == {2: 4}"), t("empty", "assert fn([]) == {}")],
  },
  {
    id: "sorting", module: "py.m2", title: "Sorting data with explicit keys", goal: "Sort without mutating the caller's list and state exactly which value determines order.", requires: ["lists", "tuples", "functions", "comprehensions"],
    model: "`sorted(iterable)` reads an iterable and returns a new list in ascending order. The original collection is unchanged. A list's `.sort()` method instead mutates that list and returns `None`. Both are stable: items with equal sorting keys keep their original relative order.\n\nThe optional `key` argument is a function called once per item to produce the value used for comparison. A `lambda` is a small unnamed function written as `lambda parameters: expression`; it automatically returns that one expression. Use it only when the rule is short. A named function is clearer when the rule needs explanation or reuse.",
    example: `users = [("Maya", 3), ("Ada", 1), ("Linus", 2)]\nby_number = sorted(users, key=lambda user: user[1])\n# by_number is [("Ada", 1), ("Linus", 2), ("Maya", 3)]\n# users is unchanged`,
    trace: "`sorted` visits each tuple. The key function receives that tuple as `user` and returns its item at index 1: first 3, then 1, then 2. Sorting compares those returned numbers, but the output contains the original tuples. Because `sorted` constructs a new list, `users` keeps its original order.",
    trap: "Do not write `result = values.sort()`: the mutation happens, but `result` becomes `None`. Also distinguish a key function from its result—pass `key=rule`, not `key=rule()`.",
    rule: "Choose `sorted` when the caller's order must survive, define the comparison key in one sentence, and use a lambda only when that sentence is genuinely tiny.",
    recall: "How do `sorted(values)` and `values.sort()` differ, and what does the function passed as `key` receive and return?",
    check: {
      question: "What is `result` after `result = names.sort()`?",
      choices: ["`None` — `.sort()` sorts in place and returns `None`", "The sorted list"],
      answer: 0,
      explanation: "`.sort()` mutates the list in place and returns `None`. Use `sorted(names)` to get a new sorted list as a value.",
    },
    prompt: "Return a new list of `(name, score)` records ordered by score from lowest to highest. Do not mutate `records`.", fn: "by_score", starter: `def by_score(records):\n    pass`, solution: `def by_score(records):\n    return sorted(records, key=lambda record: record[1])`,
    tests: [t("orders", `assert fn([("a", 3), ("b", 1)]) == [("b", 1), ("a", 3)]`), t("stable", `assert fn([("a", 2), ("b", 2)]) == [("a", 2), ("b", 2)]`), t("no mutation", `data = [("a", 2), ("b", 1)]; fn(data); assert data == [("a", 2), ("b", 1)]`, true)],
  },
  {
    id: "imports", module: "py.m3", title: "Imports and the standard library", goal: "Import a module, qualify its names, and distinguish your code from library code.", requires: ["functions", "numbers"],
    model: "A module is a Python file that groups related names. An `import` statement loads a module and binds a name for it in your program. Python ships with a standard library, so you can reuse tested tools without copying their implementations. `import math` binds the module name; `math.sqrt(9)` then makes the dependency visible at the call site.\n\nImports normally belong at the top of a file. `from math import sqrt` binds one member directly, which can be convenient but hides where a common name came from. Third-party packages are separate dependencies that must be installed; the standard library arrives with Python.",
    example: `import math\n\nradius = 3\narea = math.pi * radius ** 2\nprint(area)`,
    trace: "Python locates and initializes `math`, then binds that module object to the name `math`. Reading `math.pi` retrieves a value from that module. The exponent runs before multiplication, assignment binds the result to `area`, and the final call displays it. The qualified name makes the external dependency explicit.",
    trap: "Do not name your own file `math.py`, `json.py`, or another module you intend to import; your file can shadow the library. Avoid wildcard imports because readers cannot tell which module supplied a name.",
    rule: "Import modules at the top, prefer explicit qualified names, and add a dependency only when it removes more complexity than it creates.",
    recall: "After `import math`, what exactly is bound to the name `math`, and why does `math.sqrt` read more clearly than a wildcard import?",
    check: {
      question: "Why prefer `import math; math.sqrt(x)` over `from math import *`?",
      choices: ["The qualified name shows where `sqrt` comes from; a wildcard hides each name's origin", "Wildcard imports run faster"],
      answer: 0,
      explanation: "Qualified names make dependencies visible at the call site. Wildcard imports obscure which module supplied a name.",
    },
    prompt: "Return the area of a circle with `radius` using `math.pi`.", fn: "circle_area", starter: `import math\n\ndef circle_area(radius):\n    pass`, solution: `import math\n\ndef circle_area(radius):\n    return math.pi * radius ** 2`,
    tests: [t("unit", "import math; assert fn(1) == math.pi"), t("three", "import math; assert fn(3) == 9 * math.pi"), t("zero", "assert fn(0) == 0", true)],
  },
  {
    id: "arguments", module: "py.m3", title: "Parameters and arguments", goal: "Design positional, keyword, variadic, and keyword-only parameters.", requires: ["functions"],
    model: "A signature is an interface. It tells callers which choices are positional and which must be named.\n\nA slash marks positional-only parameters. A bare star begins keyword-only parameters. Star args collects extra positional arguments. Double-star kwargs collects extra named arguments.",
    example: `def connect(host, /, port=443, *, timeout=5):\n    ...\n\ndef collect(*values):\n    return values`,
    trace: "The separators let an API promise which parameter names callers may rely on. Defaults are evaluated once when `def` executes, not once per call.",
    trap: "A mutable default such as `items=[]` is shared by every call. Use `None`, then create the list inside.",
    rule: "Make optional policy choices keyword-only; they read better at every call site.",
    recall: "When is a default argument expression evaluated, and why does that matter for a list default?",
    check: {
      question: "A parameter written `items=[]` gives each call…",
      choices: ["The same shared list — the default is created once when `def` runs", "A fresh empty list every call"],
      answer: 0,
      explanation: "Defaults evaluate once at definition time, so a mutable default is shared across calls. Use `items=None` and build the list inside.",
    },
    prompt: "Return a label joining any number of parts with a keyword-only `separator` whose default is `\" / \"`.", fn: "label", starter: `def label(*parts, separator=" / "):\n    pass`, solution: `def label(*parts, separator=" / "):\n    return separator.join(str(part) for part in parts)`,
    tests: [t("default", `assert fn("a", "b") == "a / b"`), t("keyword", `assert fn(1, 2, separator="-") == "1-2"`), t("empty", `assert fn() == ""`, true)],
  },
  {
    id: "scope", module: "py.m3", title: "Scope, closures, and state", goal: "Trace name lookup and build a closure without hidden global state.", kind: "mental-model", requires: ["arguments"],
    model: "Python resolves a name through local, enclosing, global, then built-in scope—LEGB. A closure is a function bundled with references to names from an enclosing call that has already returned.",
    example: `def make_multiplier(factor):\n    def multiply(number):\n        return number * factor\n    return multiply\n\ntriple = make_multiplier(3)`,
    trace: "Each call to `make_multiplier` creates a new local `factor`. The returned function keeps that particular cell alive. `nonlocal` rebinds an enclosing name; `global` rebinds a module name.",
    trap: "Closures created in a loop capture the variable, not a frozen snapshot of its value. Bind a current value as a default or use a factory call.",
    rule: "Prefer explicit arguments; use closures when behavior genuinely needs a small private configuration or state.",
    recall: "What does the E in LEGB mean, and why is it still available after the outer call returns?",
    check: {
      question: "A returned inner function still reads its enclosing function's local variable after that function returned. Why?",
      choices: ["The closure keeps a live reference to that binding", "Python re-runs the outer function each time"],
      answer: 0,
      explanation: "The E in LEGB — the enclosing scope — stays reachable through the references the returned function captured.",
    },
    prompt: "Return a function that adds `offset` to whatever number it receives.", fn: "make_adder", starter: `def make_adder(offset):\n    pass`, solution: `def make_adder(offset):\n    def add(number):\n        return number + offset\n    return add`,
    tests: [t("captures", "add5 = fn(5); assert add5(3) == 8"), t("independent", "assert fn(2)(10) == 12 and fn(-1)(10) == 9")],
  },
  {
    id: "decorators", module: "py.m3", title: "Decorators are function transformation", goal: "Write a transparent decorator and explain decoration time.", requires: ["scope", "imports"],
    model: "Decorator syntax is function transformation. After creating the function, Python effectively evaluates `function = decorate(function)`. A wrapper can add behavior before and after delegating to the original callable.",
    example: `from functools import wraps\n\ndef traced(function):\n    @wraps(function)\n    def wrapper(*args, **kwargs):\n        print(function.__name__)\n        return function(*args, **kwargs)\n    return wrapper`,
    trace: "Decoration occurs when the containing module or class body executes, usually import time. `wraps` copies metadata and exposes the wrapped function for introspection.",
    trap: "A wrapper that forgets `return` silently turns every result into `None`; one that omits `wraps` damages debugging and tooling.",
    rule: "Use decorators for cross-cutting call behavior, not to conceal the main control flow.",
    recall: "Rewrite `@logged` on `work` as the equivalent assignment statement.",
    check: {
      question: "`@logged` written above `def work(): ...` is equivalent to…",
      choices: ["`work = logged(work)`", "`work = logged`"],
      answer: 0,
      explanation: "A decorator replaces the function with what the decorator returns: `work = logged(work)`, evaluated at definition time.",
    },
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
    model: "An exception unwinds call frames until a matching handler is found. Catch where you can add recovery, translation, or context—not merely where an error becomes inconvenient.",
    example: `def parse_age(text):\n    try:\n        age = int(text)\n    except ValueError as error:\n        raise ValueError("age must be an integer") from error\n    if age < 0:\n        raise ValueError("age cannot be negative")\n    return age`,
    trace: "The first failure is translated for the domain while `from error` preserves the original cause. Validation then rejects a syntactically valid but impossible age.",
    trap: "`except Exception: pass` hides bugs, corrupts control flow, and removes the evidence needed to diagnose them.",
    rule: "Catch the narrowest expected exception; let unexpected failures remain loud.",
    recall: "What information does `raise NewError(...) from error` preserve?",
    check: {
      question: "What is wrong with `except Exception: pass`?",
      choices: ["It hides bugs and throws away the evidence needed to diagnose them", "Nothing — it is good defensive code"],
      answer: 0,
      explanation: "Catch the narrowest exception you can actually handle, and let unexpected failures stay loud.",
    },
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
    model: "Complexity describes how resource use grows with input size. Keep the dominant term and distinguish worst, average, and amortized bounds. A nested loop is not automatically O(n²): count how many times its body can run across the whole algorithm.",
    example: `seen = set()\nfor value in values:       # n iterations\n    if value in seen:      # O(1) average\n        return True\n    seen.add(value)         # O(1) average`,
    trace: "The loop performs constant average work at most n times: O(n) time. The set can hold n values: O(n) extra space. The trade exchanges memory for removing repeated scans.",
    trap: "Slicing, string concatenation, sorting, and membership in a list hide work. Count library operations too.",
    rule: "Write a cost beside every operation that depends on input size, then sum across paths and multiply across nesting.",
    recall: "Why is the example O(n) average time and O(n) space?",
    check: {
      question: "Roughly what does `x in my_list` cost for a list of n items?",
      choices: ["O(n) — it may scan every element", "O(1) always"],
      answer: 0,
      explanation: "List membership scans the list. A set or dict gives O(1) average membership. Count the cost of library operations too.",
    },
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
    tests: [t("nested", "assert fn([1, [2, [3]], 4]) == 10"), t("empty", "assert fn([]) == 0"), t("deep", "assert fn([[[5]]]) == 5", true)],
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
  contexts: [["resource", "something that must be acquired and reliably released, such as a file"], ["context manager", "an object that defines setup and cleanup around a `with` block"], ["cleanup", "work that releases a resource on both success and failure"]],
  "files-json": [["path", "a filesystem location represented deliberately rather than as an accidental string"], ["encoding", "the rule translating text characters to and from bytes"], ["JSON", "a text format for arrays, objects, numbers, strings, Booleans, and null"]],
  typing: [["type hint", "an annotation that documents an expected kind of value"], ["static checker", "a tool that finds type inconsistencies without running the program"], ["generic", "a reusable type relationship parameterized by another type"]],
  testing: [["test case", "one input situation paired with an expected observation"], ["assertion", "a claim that must be true for a test to pass"], ["boundary case", "an input at the edge of the function's valid or invalid domain"]],
  debugging: [["symptom", "the visible evidence that behavior differs from the contract"], ["hypothesis", "a specific, testable explanation for a failure"], ["state transition", "one step that changes the program's tracked values"]],
  modules: [["package", "a directory structure that groups importable Python modules"], ["import boundary", "the point where one module begins depending on another"], ["entry point", "the deliberately chosen place where an application starts"]],
  performance: [["benchmark", "a repeatable measurement of a representative workload"], ["profile", "evidence showing where running time or memory is spent"], ["bottleneck", "the part that currently limits the whole workload"]],
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
  "py.m1": ["fstrings", "booleans", "branching", "lists", "text-split", "loops", "iteration-tools", "aggregation-tools", "names", "functions"],
  "py.m2": ["tuples", "dicts", "dict-iteration", "sets", "comprehensions", "sorting", "complexity"],
  "py.m3": ["imports", "collections", "arguments", "scope", "exceptions", "decorators"],
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

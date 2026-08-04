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
    model: "Before you write any code, it helps to know what a program actually *is*. A **program** is just a list of precise instructions, written as text, that the computer follows in order — top to bottom, one line at a time. That text is called **source code**, and Python files end in `.py`.\n\nA few words you will hear a lot:\n- A **statement** is one complete instruction (like 'show this').\n- An **expression** is a bit of code that *produces a value*. `2 + 3` is an expression; it produces `5`.\n- A **literal** is a value written directly, like `7` or `\"hello\"`.\n- A **comment** starts with `#`. Python ignores the rest of the line after it — comments are notes for humans, not instructions for the computer.\n\nHere is the part that surprises beginners: a line can run and produce a value **without showing you anything**. Only certain instructions, like `print`, actually display something.\n\n```python\n# this line is a comment — Python skips it\n2 + 3          # this produces 5, but shows nothing\nprint(2 + 3)   # this shows 5\n```\n\nSo if you run a file and see no output, it does not mean the program failed — it means nothing *asked* to be shown. A real failure looks different: it prints an **error** with a traceback telling you exactly where Python got stuck.",
    example: `# a comment — Python skips this line\n2 + 3           # produces 5, but displays nothing\nprint(2 + 3)    # displays 5`,
    trace: "The first line is a comment, so Python does nothing with it. `2 + 3` on the second line is evaluated to the value `5`, but because nothing was told to show it, a script displays nothing here — that is normal, not an error. `print(2 + 3)` on the third line evaluates `2 + 3` to `5` and then, because it is a `print`, actually displays `5` on the screen.",
    trap: "Do not judge a program only by whether text appeared. A line can run and produce a value without displaying it — only `print` (and a few others) actually show output. And tell an error apart from ordinary silence: an error prints a traceback explaining exactly where Python could not continue.",
    rule: "For every line, ask three things: is it a comment (skipped), a statement (an instruction), or an expression (produces a value) — and if it produces a value, did anything ask to display it?",
    recall: "What is the difference between a comment, an expression, and the value an expression produces, and why might a line run but show nothing?",
    checks: [
      {
        question: "A script contains just the line `2 + 3`, with no `print`. What happens when it runs?",
        choices: [
          "Python evaluates it to `5` but displays nothing, because no output instruction was given",
          "Python automatically displays `5`",
          "Python raises an error because the value is unused",
        ],
        answer: 0,
        why: [
          "Correct. The expression is evaluated to `5`, but showing something requires `print`. No `print`, no output — and that silence is not a failure.",
          "Python does not automatically display the result of an expression in a script; you must ask with `print`.",
          "An unused value is not an error; the line simply runs and produces a value that nothing displays.",
        ],
        explanation: "Evaluation and display are separate: a bare expression produces a value, but only `print` shows it.",
      },
      {
        question: "What does Python do with the text after a `#` on a line?",
        choices: [
          "Ignores it — it is a comment for humans, not an instruction",
          "Runs it as code",
          "Displays it on the screen",
        ],
        answer: 0,
        why: [
          "Correct. Everything after `#` on a line is a comment; Python skips it entirely.",
          "Comments are never executed — they exist only to explain code to people.",
          "A comment is not printed; `print` is what displays text.",
        ],
        explanation: "`#` starts a comment; Python ignores the rest of that line.",
      },
      {
        question: "Which of these is an *expression* (something that produces a value)?",
        choices: [
          "`2 + 3`",
          "`# add two numbers`",
          "A blank line",
        ],
        answer: 0,
        why: [
          "Correct. `2 + 3` is evaluated and produces the value `5` — that is what makes it an expression.",
          "That is a comment; it produces no value and is skipped by Python.",
          "A blank line does nothing and produces no value.",
        ],
        explanation: "An expression produces a value; `2 + 3` produces `5`.",
      },
    ],
    prompt: "", fn: "", starter: "", solution: "", tests: [],
  },
  {
    id: "values", module: "py.m0", title: "Values, objects, and types", goal: "Recognize Python's basic values and explain what a type tells you.", kind: "mental-model", requires: ["programs"], practice: false,
    model: "A **value** is a piece of information your program works with — a number, some text, a yes/no. Every value has a **type**, and the type decides what you can do with it. Here are the basic ones:\n- `12` is an **integer** (`int`) — a whole number.\n- `3.5` is a **float** — a number with a decimal point.\n- `\"Ada\"` is a **string** (`str`) — text, always written inside quotes.\n- `True` and `False` are **Booleans** (`bool`) — yes/no values.\n- `None` is the special 'nothing here' value.\n\n```python\nprint(type(12))      # <class 'int'>\nprint(type(3.5))     # <class 'float'>\nprint(type(\"Ada\"))   # <class 'str'>\nprint(type(True))    # <class 'bool'>\n```\n\nThe most important idea: **things that look alike can be different types.** `3` is a number, but `\"3\"` (in quotes) is *text* — one character. You can do math on the number `3`, but `\"3\"` is just a symbol. The quotes are what make something a string; they are not part of the text stored inside.\n\nWhen you need to cross that line — say, turn the text `\"3\"` into the number `3` — you convert it on purpose with `int(\"3\")`. Python will not silently guess for you.",
    example: `print(3 + 3)        # 6   — math on numbers\nprint("3" + "3")    # 33  — text joined, not added\nprint(type("Ada"))  # <class 'str'>`,
    trace: "The two `print` lines show why type matters. `3 + 3` does arithmetic and gives `6`, but `\"3\" + \"3\"` joins two pieces of text and gives `\"33\"` — same-looking `3`, completely different results, because one is a number and the other is text. The last line, `type(\"Ada\")`, reports `str`, since anything inside quotes is a string.",
    trap: "Values that look similar on screen are not interchangeable. `3` is a number you can do math on; `\"3\"` is one character of text. Adding numbers computes a sum, while adding strings glues them together. To cross that boundary you must convert on purpose, like `int(\"3\")` — Python never guesses.",
    rule: "Before choosing an operation, name the value's type: number, text, Boolean, or None. What you can do — and what an operation like `+` means — depends entirely on the type, not on how the value looks.",
    recall: "Why are `3`, `3.0`, and `\"3\"` three different values, and what does `\"3\" + \"3\"` produce compared with `3 + 3`?",
    checks: [
      {
        question: "A person reads both `3` and `\"3\"` as 'three'. How does Python treat them?",
        choices: [
          "As different values — `3` is a number you can do math on, `\"3\"` is one character of text",
          "As the same value",
          "`\"3\"` is automatically turned into the number `3`",
        ],
        answer: 0,
        why: [
          "Correct. The quotes make `\"3\"` a string (text); `3` is a number. They have different types and behave differently.",
          "They are not the same — one is a number, the other is text, even though they look alike.",
          "Python does not auto-convert `\"3\"` to a number; you must do it on purpose with `int(\"3\")`.",
        ],
        explanation: "`3` is a number, `\"3\"` is text; the quotes decide the type.",
      },
      {
        question: "What does `\"3\" + \"3\"` produce?",
        choices: [
          "`\"33\"` — the two strings are joined",
          "`6` — they are added",
          "An error",
        ],
        answer: 0,
        why: [
          "Correct. `+` on strings joins them end to end, so two text `\"3\"`s become `\"33\"`.",
          "Adding happens for numbers. These are strings, so `+` joins instead of adds.",
          "It is valid — joining strings with `+` is allowed and gives `\"33\"`.",
        ],
        explanation: "`+` adds numbers but joins strings; `\"3\" + \"3\"` is `\"33\"`.",
      },
      {
        question: "What is the type of `\"Ada\"`?",
        choices: [
          "`str` — it is text, written inside quotes",
          "`int` — it is a value",
          "`bool` — it is either true or false",
        ],
        answer: 0,
        why: [
          "Correct. Anything inside matching quotes is a string (`str`), Python's type for text.",
          "`int` is for whole numbers; `\"Ada\"` is text, not a number.",
          "`bool` is only for `True`/`False`; `\"Ada\"` is a string.",
        ],
        explanation: "Text in quotes is a `str`.",
      },
    ],
    prompt: "", fn: "", starter: "", solution: "", tests: [],
  },
  {
    id: "calls", module: "py.m0", title: "Calling functions and seeing output", goal: "Read a function call as a named operation receiving arguments and producing an effect or result.", requires: ["values"], practice: false,
    model: "A **function** is a reusable piece of behavior with a name. To **call** it — to make it run — you write its name followed by parentheses. Anything you put inside the parentheses is an **argument**: information you hand to the function.\n\nYou have already met one: `print`. `print(\"Hello\")` calls the function named `print` and hands it the string `\"Hello\"`; its job is to show that text.\n\n```python\nprint(\"Hello, Python\")   # Hello, Python\nprint(2 + 3)             # 5\n```\n\nSome functions **return** a value you can use; others mainly *do* something (like `print`, which shows text). `type(12)` returns the type `int`. And calls can be **nested** — one inside another. When they are, the inner call runs first, and its result becomes the outer call's argument:\n\n```python\nprint(type(\"Ada\"))   # <class 'str'>\n```\n\nHere `type(\"Ada\")` runs first and hands back `str`, then `print` shows it. So you read a nested call from the **inside out**: work out the innermost parentheses first, then move outward.",
    example: `print("Hello, Python")   # Hello, Python\nprint(2 + 3)             # 5\nprint(type("Ada"))       # <class 'str'>`,
    trace: "`print(\"Hello, Python\")` hands one string to `print`, which shows `Hello, Python`. On the next line, `2 + 3` is evaluated first to `5`, and then `print(2 + 3)` shows `5`. On the last line, `type(\"Ada\")` runs first and returns `str`; that result becomes the argument to the outer `print`, which displays it. Every argument is fully worked out before the function around it runs.",
    trap: "Showing a value is not the same as returning it. `print` is great when a *person* needs to see output, but it hands nothing back to your code. When later code needs a result, the function should `return` it, not just `print` it.",
    rule: "Read a call from the innermost parentheses outward: fully evaluate each argument, then run the function, then follow its returned value or its visible effect.",
    recall: "In `print(type(12))`, which call runs first, what does it return, and what does the outer `print` receive?",
    checks: [
      {
        question: "In `print(type(12))`, which call runs first?",
        choices: [
          "`type(12)` runs first and returns `int`; then `print` displays that result",
          "`print` runs first and hands its output to `type`",
          "They run at the same time",
        ],
        answer: 0,
        why: [
          "Correct. The inner call runs first: `type(12)` returns `int`, which becomes the argument to `print`. Read nested calls inside-out.",
          "The outer `print` cannot run until it has its argument, and that argument is what `type(12)` produces.",
          "They do not run simultaneously; the inner call must finish so the outer one has something to receive.",
        ],
        explanation: "Nested calls run inside-out: the inner call's result becomes the outer call's argument.",
      },
      {
        question: "In `print(\"Hello\")`, what is `\"Hello\"` called?",
        choices: [
          "An argument — information handed to the function",
          "A function",
          "A comment",
        ],
        answer: 0,
        why: [
          "Correct. A value placed inside the call's parentheses is an argument; it is what you give the function to work with.",
          "The function is `print`; `\"Hello\"` is the value you pass to it.",
          "It is not a comment (there is no `#`); it is a string argument.",
        ],
        explanation: "Values inside a call's parentheses are its arguments.",
      },
      {
        question: "You need to keep working with a function's result in more code. Should the function `print` it or `return` it?",
        choices: [
          "`return` it — so the calling code receives a usable value",
          "`print` it — printing hands the value to your code",
          "Either works exactly the same",
        ],
        answer: 0,
        why: [
          "Correct. `return` gives the value back to the code that called the function. `print` only shows it to a person and hands your code nothing.",
          "`print` does not hand a value to your code; it just displays text on screen.",
          "They are not the same: `return` produces a usable value, `print` produces only visible output.",
        ],
        explanation: "`return` gives a value back to code; `print` only shows it to a person.",
      },
    ],
    prompt: "", fn: "", starter: "", solution: "", tests: [],
  },
  {
    id: "variables", module: "py.m0", title: "Variables and assignment", goal: "Bind, read, and reassign names without confusing assignment with equality.", requires: ["calls"], practice: false,
    model: "A **variable** is a name that points to a value. You create one with a single equals sign, `=`, called **assignment**. Python works out the value on the right, then makes the name on the left point to it:\n\n```python\nage = 18\nprint(age)   # 18\n```\n\nAfter `age = 18`, the name `age` stands for the number `18`, so `print(age)` shows `18`.\n\n**Reassignment** just points the name at a new value. The line that confuses beginners is `age = age + 1`. Read it right-to-left: Python first works out the *right* side using the *current* value of `age`, and only then points `age` at the new result.\n\n```python\nage = 18\nage = age + 1   # reads 18, adds 1, then age becomes 19\nprint(age)      # 19\n```\n\nSo `=` is not asking 'are these equal?' — it is an instruction: 'make this name point to this value.' (A later lesson introduces `==` for actually comparing.) Two habits: give names that say what they mean — `remaining_minutes`, not `x` — and remember that using a name before you have assigned it raises a `NameError`, because there is no value to fetch.",
    example: `student = "Maya"\ncredits = 12\ncredits = credits + 3   # reads 12, adds 3, then rebinds to 15\nprint(student, credits) # Maya 15`,
    trace: "`student = \"Maya\"` makes the name `student` point to the string `\"Maya\"`. `credits = 12` points `credits` at `12`. Then `credits = credits + 3` reads the current value of `credits` (`12`), works out `12 + 3`, which is `15`, and only then points `credits` at `15`. Finally `print(student, credits)` reads both names and shows `Maya 15`. Assignment always evaluates the right side first, then binds the left.",
    trap: "One equals sign `=` does not ask a question; it performs assignment. (Comparing values uses `==`, coming later.) And using a name before you have assigned it raises `NameError`, because Python has no value stored under that name yet.",
    rule: "Trace assignment in two steps: first fully evaluate the right-hand side (using any current values), then point the left-hand name at that result.",
    recall: "When Python runs `total = total + price`, why must it read the old `total` before the name changes, and what does `=` do that `==` does not?",
    checks: [
      {
        question: "When Python runs `age = age + 1`, what does it do first?",
        choices: [
          "Reads the current `age`, adds 1, then points `age` at the new result",
          "Changes `age` first, then adds 1 to it",
          "Raises an error because `age` is on both sides",
        ],
        answer: 0,
        why: [
          "Correct. The right side is evaluated first using the current value, then the name is rebound. `age` on both sides is fine.",
          "The name does not change until the right side is fully computed; it reads the old value first.",
          "Having the same name on both sides is normal and valid — it is how you update a value.",
        ],
        explanation: "Assignment evaluates the right side first (old value), then rebinds the name.",
      },
      {
        question: "What is the difference between `=` and `==`?",
        choices: [
          "`=` assigns a value to a name; `==` asks whether two values are equal",
          "They are the same",
          "`=` compares, `==` assigns",
        ],
        answer: 0,
        why: [
          "Correct. `=` is an instruction that binds a name to a value. `==` is a question that produces `True` or `False`.",
          "They are different: one stores a value, the other compares values.",
          "It is the other way around: `=` assigns and `==` compares.",
        ],
        explanation: "`=` assigns; `==` compares.",
      },
      {
        question: "You use a name you never assigned, like `print(score)` with no earlier `score = ...`. What happens?",
        choices: [
          "A `NameError` — there is no value stored under that name",
          "It prints an empty line",
          "It prints `0`",
        ],
        answer: 0,
        why: [
          "Correct. Python has nothing bound to `score`, so it raises `NameError` when you try to read it.",
          "There is no value to print, so Python does not print a blank — it raises an error.",
          "Python does not default unknown names to `0`; it raises `NameError`.",
        ],
        explanation: "Reading an unassigned name raises `NameError`.",
      },
    ],
    prompt: "", fn: "", starter: "", solution: "", tests: [],
  },
  {
    id: "first-function", module: "py.m0", title: "Defining and calling your first function", goal: "Define a function, distinguish parameters from arguments, and return a value to the caller.", requires: ["variables"],
    model: "You have been calling functions that already exist, like `print`. Now you will make your own. You define a function with `def`, and it has four parts: the keyword `def`, a name, parentheses holding **parameters** (input names), a colon, and an indented **body**.\n\n```python\ndef greet(name):        # 'name' is a parameter\n    return \"Hi, \" + name\n\nprint(greet(\"Ada\"))     # Hi, Ada\n```\n\nTwo words that sound similar but differ: a **parameter** is the input *name* written in the definition (`name` here); an **argument** is the actual *value* you pass in a call (`\"Ada\"` here).\n\nHere is the timing that trips people up. When Python reaches the `def` line, it *creates* the function but does **not** run the body yet — the body waits. The body only runs when you *call* the function. At that point Python binds each parameter to its argument, runs the body, and `return` sends one value back to whoever called it. If the body finishes with no `return`, the function hands back `None`.",
    example: `def identity(value):\n    return value\n\nanswer = identity("ready")\nprint(answer)`,
    trace: "First, Python creates the function and binds it to `identity`; the body waits. The call `identity(\"ready\")` creates a local frame and binds the parameter `value` to the string argument. `return value` reads that local name, ends the call, and produces the same string. Assignment binds that returned object to `answer`, and the final call displays it.",
    trap: "Printing inside a function does not return a result. Indentation is also syntax: every line belonging to the function body must be indented consistently, while code after the function returns to the outer indentation level.",
    rule: "Read every call as a four-step sequence: evaluate arguments, bind parameters, run the indented body, and replace the call expression with the returned value.",
    recall: "What happens at definition time, what happens at call time, and how are a parameter, an argument, and a return value different?",
    checks: [
      {
        question: "A function `print`s a value inside its body but has no `return`. What does calling it produce?",
        choices: [
          "`None` — printing displays text but does not send a value back",
          "The value that was printed",
          "An error",
        ],
        answer: 0,
        why: [
          "Correct. Displaying is not returning. With no `return`, the function hands back `None`, even though it printed something.",
          "The printed text goes to the screen, not back to your code; the call itself produces `None`.",
          "It is not an error to omit `return`; the function just returns `None`.",
        ],
        explanation: "No `return` means the function returns `None`; printing is not returning.",
      },
      {
        question: "In `def greet(name):` called as `greet(\"Ada\")`, which is the parameter and which is the argument?",
        choices: [
          "`name` is the parameter (the input name); `\"Ada\"` is the argument (the value passed)",
          "`name` is the argument; `\"Ada\"` is the parameter",
          "They are the same thing",
        ],
        answer: 0,
        why: [
          "Correct. The parameter is the name in the definition; the argument is the actual value handed over at the call.",
          "It is the other way around: the value you pass (`\"Ada\"`) is the argument.",
          "They are related but different: one is the placeholder name, the other is the real value.",
        ],
        explanation: "Parameter = input name in the definition; argument = value passed in a call.",
      },
      {
        question: "When does the code inside a function's body actually run?",
        choices: [
          "When the function is called, not when it is defined",
          "As soon as Python reaches the `def` line",
          "Once, automatically, at the end of the file",
        ],
        answer: 0,
        why: [
          "Correct. `def` creates the function but does not run its body; the body runs each time you call the function.",
          "Reaching `def` only defines the function — it does not execute the body.",
          "The body does not run on its own; it runs when (and each time) the function is called.",
        ],
        explanation: "`def` defines; the body runs on each call.",
      },
    ],
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
    checks: [
      {
        question: "You have 17 items and each complete box must contain 5. Which expression returns the number of complete boxes?",
        choices: [
          "`17 // 5`, which returns `3` complete boxes",
          "`17 / 5`, which returns the exact quotient `3.4`",
          "`17 % 5`, which returns `2`",
        ],
        answer: 0,
        why: [
          "Correct. A partial box does not count, so you want complete equal groups: `//` gives `3`.",
          "`/` gives the exact `3.4`, which counts the partial box — not what 'complete boxes' asks.",
          "`%` gives the `2` leftover items, not the number of boxes.",
        ],
        explanation: "`//` gives complete groups; `/` includes the partial one; `%` gives the remainder.",
      },
      {
        question: "What does `17 % 5` return, and what does it mean?",
        choices: [
          "`2` — the leftover items after filling complete boxes of 5",
          "`3.4` — the exact division",
          "`3` — the number of full boxes",
        ],
        answer: 0,
        why: [
          "Correct. `%` is the remainder: after three full boxes use 15 items, `2` are left over.",
          "That is `17 / 5` (the exact quotient), not the remainder.",
          "That is `17 // 5` (full boxes); `%` gives what remains, `2`.",
        ],
        explanation: "`%` is the remainder — what is left after the complete groups.",
      },
      {
        question: "What is the difference between `17 / 5` and `17 // 5`?",
        choices: [
          "`/` gives the exact answer `3.4` (a float); `//` gives `3` (whole groups only)",
          "They both give `3.4`",
          "They both give `3`",
        ],
        answer: 0,
        why: [
          "Correct. `/` keeps the fractional part as a float; `//` throws it away, keeping only complete groups.",
          "`//` does not keep the fraction — it gives `3`, not `3.4`.",
          "`/` keeps the fraction, so it gives `3.4`, not `3`.",
        ],
        explanation: "`/` is exact (float); `//` keeps only whole groups.",
      },
    ],
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
    checks: [
      {
        question: "You write `name.strip()` on its own line, with no assignment. What happens to the cleaned text?",
        choices: [
          "A new cleaned string is created and then discarded, because nothing kept the return value",
          "`name` is permanently trimmed in place",
          "It raises an error",
        ],
        answer: 0,
        why: [
          "Correct. `strip` returns a new string; without assigning or using it, that result is thrown away and `name` is unchanged.",
          "Strings are immutable — `strip` never edits the original; it returns a new one.",
          "It is not an error; the result is simply computed and then discarded.",
        ],
        explanation: "String methods return a new string; keep the result or it is lost. The original never changes.",
      },
      {
        question: "What does it mean that strings are *immutable*?",
        choices: [
          "An existing string cannot be changed in place; methods return a new string instead",
          "Strings cannot be copied",
          "Strings cannot be compared",
        ],
        answer: 0,
        why: [
          "Correct. You cannot edit a string's characters in place; operations like `.replace()` build and return a new string, leaving the original alone.",
          "Strings can be copied and shared freely; immutability is about not changing them in place.",
          "Strings can be compared with `==`; immutability is unrelated to comparison.",
        ],
        explanation: "Immutable = cannot be changed in place; string methods return new strings.",
      },
      {
        question: "For `text = \"Ada\"`, what does `text[0]` return?",
        choices: [
          "`\"A\"` — positions start at 0, so index 0 is the first character",
          "`\"d\"` — index 0 is the second character",
          "`\"Ada\"` — the whole string",
        ],
        answer: 0,
        why: [
          "Correct. String positions start at `0`, so `text[0]` is the first character, `\"A\"`.",
          "Index `0` is the first character, not the second; `\"d\"` is at index `1`.",
          "`text[0]` is one character, not the whole string.",
        ],
        explanation: "Strings are indexed from 0; `text[0]` is the first character.",
      },
    ],
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
    checks: [
      {
        question: "With `name` = `\"Ada\"` and `age` = `30`, what does `f\"{name} is {age}\"` produce?",
        choices: [
          "\"Ada is 30\" — each `{}` is replaced by its value, converted to text",
          "\"{name} is {age}\" — the braces stay literal",
          "An error, because `age` is a number",
        ],
        answer: 0,
        why: [
          "Correct. The `f` turns each `{...}` into the value inside, and it converts the number `30` to text automatically.",
          "The braces stay literal only WITHOUT the `f` prefix. With `f`, they are replaced.",
          "Mixing numbers and strings in an f-string is fine — it converts the number for you.",
        ],
        explanation: "An f-string replaces each `{...}` with its value, converting numbers to text.",
      },
      {
        question: "What happens if you forget the `f` and write `\"Hi {name}\"`?",
        choices: [
          "You get the literal text `Hi {name}`, not the value of `name`",
          "It still inserts the value of `name`",
          "It raises an error",
        ],
        answer: 0,
        why: [
          "Correct. Without the `f` prefix, the braces are just ordinary characters, so `{name}` stays as literal text.",
          "The `f` is what enables the replacement; without it, nothing is inserted.",
          "It is not an error — you simply get the braces as literal characters.",
        ],
        explanation: "The `f` prefix is required; without it, `{name}` is literal text.",
      },
      {
        question: "What does `f\"{score}\"` produce when `score` is the number `91`?",
        choices: [
          "The string `\"91\"` — an f-string always builds text",
          "The number `91`",
          "An error",
        ],
        answer: 0,
        why: [
          "Correct. An f-string always produces a string, so the number is converted to the text `\"91\"`.",
          "The result is text, not a number; `\"91\"` is not the same value as `91`.",
          "No error — it converts the number to text.",
        ],
        explanation: "An f-string always produces a string; `f\"{91}\"` is the text `\"91\"`.",
      },
    ],
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
    checks: [
      {
        question: "What does `\" \".join([\"a\", \"b\", \"c\"])` produce?",
        choices: [
          "\"a b c\" — the separator is placed between the items",
          "\"abc\" — the separator is ignored",
          "[\"a\", \"b\", \"c\"] — a list",
        ],
        answer: 0,
        why: [
          "Correct. `join` puts the separator (a space) between each pair of items, giving one string `\"a b c\"`.",
          "The separator is not ignored; it goes between the items.",
          "`join` returns a single string, not a list — it is the opposite of `split`.",
        ],
        explanation: "`join` puts the separator between items and returns one string.",
      },
      {
        question: "What does `\"  the  quick  \".split()` return (no argument)?",
        choices: [
          "`[\"the\", \"quick\"]` — it splits on whitespace and drops the empty pieces",
          "`[\"\", \"the\", \"\", \"quick\", \"\"]` — it keeps every gap",
          "`\"the quick\"` — a cleaned string",
        ],
        answer: 0,
        why: [
          "Correct. With no argument, `split` breaks on runs of whitespace and ignores leading, trailing, and repeated spaces.",
          "That would happen with `split(\" \")` (a specific separator), which keeps empty pieces. Plain `split()` drops them.",
          "`split` returns a list, not a string.",
        ],
        explanation: "`split()` with no argument splits on whitespace and drops empty pieces.",
      },
      {
        question: "Why does `\",\".join([1, 2])` raise an error?",
        choices: [
          "`join` only accepts strings; convert the numbers first with `str`",
          "You cannot join a list of two items",
          "The separator cannot be a comma",
        ],
        answer: 0,
        why: [
          "Correct. `join` requires every item to already be a string, so numbers must be converted (e.g. `str(1)`) first.",
          "Any number of items is fine; the problem is that the items are numbers, not strings.",
          "A comma is a perfectly valid separator; the error is about the numeric items.",
        ],
        explanation: "`join` needs string items; convert numbers with `str` first.",
      },
    ],
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
    checks: [
      {
        question: "What does `\"hello\"[::-1]` produce?",
        choices: [
          "\"olleh\" — a reversed copy",
          "\"hello\" — the step is ignored",
          "An error",
        ],
        answer: 0,
        why: [
          "Correct. A step of `-1` walks the sequence backward, building a reversed copy. The original is unchanged.",
          "The step is not ignored; `-1` reverses the order.",
          "It is valid — negative steps are allowed and reverse the sequence.",
        ],
        explanation: "`[::-1]` reverses into a new copy.",
      },
      {
        question: "For `nums = [0, 1, 2, 3, 4]`, what is `nums[::2]`?",
        choices: [
          "`[0, 2, 4]` — every second item, starting at the first",
          "`[1, 3]` — every second item, starting at the second",
          "`[0, 1, 2, 3, 4]` — the step is ignored",
        ],
        answer: 0,
        why: [
          "Correct. A step of `2` takes every second item starting from index 0: `0, 2, 4`.",
          "It starts at the beginning (index 0), not index 1, unless you give a start.",
          "The step is applied, so you do not get the whole list back.",
        ],
        explanation: "`[::2]` takes every second item starting at the first.",
      },
      {
        question: "You want a separate copy of a list so changes don't affect the original. Which slice does that?",
        choices: [
          "`values[:]` — a full slice makes a new (shallow) copy",
          "`values` — same list, not a copy",
          "`values[0]` — the first item",
        ],
        answer: 0,
        why: [
          "Correct. A slice always builds a new sequence, so `values[:]` copies the whole list into a fresh one.",
          "`values` is just another name for the same list — changes would show through both.",
          "`values[0]` is a single item, not a copy of the list.",
        ],
        explanation: "`values[:]` makes a new shallow copy; a slice never changes the original.",
      },
    ],
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
    model: "A **class** is a blueprint for making your own kind of object — a new type that bundles together some **data** and the **actions** that go with it. For example, a `Counter` bundles a number with the ability to increase it.\n\n```python\nclass Counter:\n    def __init__(self, start=0):   # runs when you create one\n        self.value = start         # per-counter data\n\n    def increment(self):           # an action\n        self.value += 1\n        return self.value\n\nc = Counter()          # make one (an 'instance')\nprint(c.increment())   # 1\nprint(c.increment())   # 2\n```\n\nThree ideas to hold onto:\n- **`__init__`** is a special method that runs automatically when you create an instance (`Counter()`). Its job is to set up the starting data.\n- **`self`** is the particular instance the method is working on. When you call `c.increment()`, Python quietly passes `c` in as `self`, so `self.value` means 'this counter's value'. You write `self` as the first parameter of every method, but you never pass it yourself.\n- Data stored on `self` (like `self.value`) is **per-instance** — each `Counter` you make carries its own `value`.\n\nSo a class lets you stamp out many objects that each hold their own data and share the same behavior.",
    example: `class Counter:\n    def __init__(self, start=0):\n        self.value = start\n\n    def increment(self):\n        self.value += 1\n        return self.value\n\nc = Counter(4)\nprint(c.increment())   # 5\nprint(c.increment())   # 6`,
    trace: "`Counter(4)` creates a new counter object and runs `__init__` with `start` set to `4`, so `self.value` becomes `4`. Calling `c.increment()` runs the `increment` method with `self` set to `c`: it does `self.value += 1` (now `5`) and returns `5`. A second `c.increment()` makes it `6`. The key move is that `self` is `c`, so `self.value` is this particular counter's own value — a different `Counter` would have its own separate `value`.",
    trap: "Set per-instance data on `self` inside `__init__`, not as a value shared on the class itself. A changeable value placed directly on the class (outside `__init__`) is shared by every instance, so one object's change would show up in all of them. And never forget `self` as the first parameter of each method.",
    rule: "Reach for a class when some data and the actions on it form one lasting thing (a counter, a bank account, a playlist). Set each instance's own data on `self` in `__init__`, and write `self` as the first parameter of every method.",
    recall: "When you call `c.increment()`, what does Python pass as `self`, and why does each `Counter` have its own separate `value`?",
    checks: [
      {
        question: "When you call `counter.increment()`, what does Python pass as `self`?",
        choices: [
          "The `counter` instance itself",
          "Nothing — `self` is empty",
          "The `Counter` class",
        ],
        answer: 0,
        why: [
          "Correct. `counter.increment()` quietly passes `counter` in as `self`, so `self.value` refers to this counter's own value.",
          "`self` is not empty; it is the specific instance the method was called on.",
          "It passes the instance, not the class — `self` is one particular object.",
        ],
        explanation: "Calling a method passes the instance as `self` automatically.",
      },
      {
        question: "What is the `__init__` method for?",
        choices: [
          "It runs automatically when you create an instance, to set up its starting data",
          "It runs every time any method is called",
          "It deletes the object",
        ],
        answer: 0,
        why: [
          "Correct. `__init__` is called once, right when you create the object (`Counter()`), to give it its initial data on `self`.",
          "It runs only at creation, not on every method call.",
          "It sets up the object; it does not delete it.",
        ],
        explanation: "`__init__` initializes a new instance's data at creation time.",
      },
      {
        question: "You make two counters: `a = Counter()` and `b = Counter()`. Does changing `a.value` affect `b.value`?",
        choices: [
          "No — each instance has its own `value` stored on its own `self`",
          "Yes — they share one `value`",
          "Only if they were made at the same time",
        ],
        answer: 0,
        why: [
          "Correct. `self.value` is per-instance: `a` and `b` each got their own `value` in `__init__`, so they are independent.",
          "They do not share it, because the value lives on each instance's `self`, not on the class.",
          "Creation time is irrelevant; each instance always has its own `self` data.",
        ],
        explanation: "Data on `self` is per-instance; each object has its own.",
      },
    ],
    prompt: "Define `BankAccount` with a zero default balance, `deposit(amount)`, and `withdraw(amount)` that raises `ValueError` for insufficient funds.", fn: "BankAccount", starter: `class BankAccount:\n    pass`, solution: `class BankAccount:\n    def __init__(self, balance=0):\n        self.balance = balance\n\n    def deposit(self, amount):\n        self.balance += amount\n        return self.balance\n\n    def withdraw(self, amount):\n        if amount > self.balance:\n            raise ValueError("insufficient funds")\n        self.balance -= amount\n        return self.balance`,
    tests: [t("state", "account = fn(10); assert account.deposit(5) == 15 and account.withdraw(4) == 11"), t("guard", "account = fn();\ntry: account.withdraw(1); assert False\nexcept ValueError: pass", true)],
  },
  {
    id: "dataclasses", module: "py.m4", title: "Dataclasses and value objects", goal: "Represent structured data without boilerplate or behaviorless dictionaries.", requires: ["classes", "tuples", "imports"],
    model: "Very often you just want an object to *hold some named data* — a point with an `x` and a `y`, a user with a `name` and an `email` — without writing a lot of setup code. A **dataclass** does that boilerplate for you.\n\nYou write `@dataclass` just before the class and list the fields with their types. Python then automatically writes the `__init__` (so you can create one easily), a readable printout, and value-based equality (two points with the same `x` and `y` count as equal).\n\n```python\nfrom dataclasses import dataclass\n\n@dataclass\nclass Point:\n    x: float\n    y: float\n\np = Point(3, 4)\nprint(p)                 # Point(x=3, y=4)\nprint(p == Point(3, 4))  # True  — same values, equal\n```\n\nWithout `@dataclass` you would hand-write the `__init__`, the printout, and the equality check yourself — the dataclass saves all of that.\n\n**One gotcha:** if a field should default to a list (or another changeable value), you cannot write `= []`. That one list would be shared by every instance — the same shared-mutable-default trap from the arguments lesson. Use `field(default_factory=list)` so each instance gets its own fresh list.",
    example: `from dataclasses import dataclass\n\n@dataclass\nclass Point:\n    x: float\n    y: float\n\np = Point(3, 4)\nprint(p)                 # Point(x=3, y=4)\nprint(p == Point(3, 4))  # True`,
    trace: "`@dataclass` reads the two annotated fields `x` and `y` and writes the setup code for you. `Point(3, 4)` creates an instance with `x` set to `3` and `y` set to `4`. `print(p)` shows the auto-generated readable form `Point(x=3, y=4)`. And `p == Point(3, 4)` is `True` because a dataclass compares by *value* — same `x` and `y` means equal — rather than by identity.",
    trap: "A field that should default to a list (or any changeable value) must use `field(default_factory=list)`, not `= []`. Writing `= []` would make a single list shared across every instance — the same shared-mutable-default trap you saw with function arguments.",
    rule: "Reach for a `@dataclass` whenever a class is mostly named data with little behavior — it writes the constructor, printing, and value equality for you. Add hand-written methods only when the data needs real rules.",
    recall: "What three things does `@dataclass` write for you, and why must a list field use `default_factory` instead of `= []`?",
    checks: [
      {
        question: "A dataclass field that should default to an empty list must use…",
        choices: [
          "`field(default_factory=list)`",
          "`= []`",
          "`= None` and nothing else",
        ],
        answer: 0,
        why: [
          "Correct. `default_factory=list` makes a new list for each instance, avoiding the shared-mutable-default trap.",
          "`= []` would share one list across every instance — the same bug as a mutable function default.",
          "`= None` dodges the trap but leaves the field `None`, not an empty list; `default_factory=list` gives each instance its own `[]`.",
        ],
        explanation: "Use `field(default_factory=list)` so each instance gets its own list.",
      },
      {
        question: "What does `@dataclass` write for you automatically?",
        choices: [
          "The `__init__`, a readable printout, and value-based equality",
          "Only the `__init__`",
          "Nothing — it is just a comment",
        ],
        answer: 0,
        why: [
          "Correct. From the annotated fields it generates the constructor, a nice printout, and equality that compares by value.",
          "It generates more than just `__init__` — also the printout and equality.",
          "`@dataclass` is a real decorator that transforms the class, not a comment.",
        ],
        explanation: "`@dataclass` generates init, printout, and value equality from the fields.",
      },
      {
        question: "For a dataclass `Point`, is `Point(3, 4) == Point(3, 4)` True or False?",
        choices: [
          "True — dataclasses compare by value (same fields means equal)",
          "False — they are two different objects",
          "It raises an error",
        ],
        answer: 0,
        why: [
          "Correct. A dataclass generates value-based equality, so two points with the same `x` and `y` are equal.",
          "Plain classes compare by identity, but a dataclass compares by value, so these are equal.",
          "Comparing dataclasses with `==` is valid and returns a Boolean, not an error.",
        ],
        explanation: "Dataclasses compare by value: same field values means equal.",
      },
    ],
    prompt: "Define a frozen dataclass `Point(x, y)` with a `manhattan()` method returning `abs(x) + abs(y)`.", fn: "Point", starter: `from dataclasses import dataclass\n\n# define Point`, solution: `from dataclasses import dataclass\n\n@dataclass(frozen=True)\nclass Point:\n    x: float\n    y: float\n\n    def manhattan(self):\n        return abs(self.x) + abs(self.y)`,
    tests: [t("value", "p = fn(-3, 4); assert p.manhattan() == 7"), t("equality", "assert fn(1, 2) == fn(1, 2)"), t("frozen", "p = fn(1, 2)\ntry: p.x = 9; assert False\nexcept Exception: pass", true)],
  },
  {
    id: "composition", module: "py.m4", title: "Composition before inheritance", goal: "Separate changing behaviors behind small object boundaries.", kind: "pattern", requires: ["classes"],
    model: "When you build bigger programs, you often need one object to use others. There are two ways to relate classes, and picking the right one matters.\n\n**Composition** means an object *has* other objects that do focused jobs, and it hands work off to them. **Inheritance** means one class *is a* kind of another and can stand in for it.\n\n```python\nclass ReportService:\n    def __init__(self, repository, formatter):\n        self.repository = repository   # 'has a' repository\n        self.formatter = formatter     # 'has a' formatter\n\n    def build(self, report_id):\n        data = self.repository.get(report_id)\n        return self.formatter.format(data)\n```\n\nHere `ReportService` does not *do* the storage or formatting itself — it *holds* a `repository` and a `formatter` and asks them. This is composition. The big advantage: you can swap in a different formatter, or a fake repository for testing, without changing `ReportService` at all.\n\n**The guideline: prefer composition over inheritance.** Inheritance ties a child tightly to its parent's internals, which becomes fragile as things change. Only inherit when a child should be safely *substitutable* for the parent everywhere the parent is used. If you just want to reuse some behavior, compose — give your object a collaborator and delegate to it.",
    example: `class ReportService:\n    def __init__(self, repository, formatter):\n        self.repository = repository\n        self.formatter = formatter\n\n    def build(self, report_id):\n        data = self.repository.get(report_id)\n        return self.formatter.format(data)`,
    trace: "`ReportService` is created with two collaborators, a `repository` and a `formatter`, stored on `self`. When `build` runs, it asks `self.repository.get(report_id)` for the data, then asks `self.formatter.format(data)` to turn it into output. `ReportService` coordinates but does neither job itself — so a test can pass in tiny fake objects, and a new formatter can be swapped in, without touching `ReportService`.",
    trap: "Using inheritance just to reuse code creates fragile base classes: a child can accidentally rely on internal steps the parent never promised to keep. Inherit only when a child is meant to substitute for the parent everywhere; otherwise, compose.",
    rule: "Inherit when callers should be able to use the child anywhere the parent is expected (a true is-a relationship). Compose — hold a collaborator and delegate to it — when you simply need another behavior.",
    recall: "What does inheritance promise beyond sharing code, and why is composition usually easier to change?",
    checks: [
      {
        question: "Beyond reusing code, what does inheritance promise?",
        choices: [
          "Substitutability — a child can stand in wherever the parent is expected",
          "Faster method calls",
          "Automatic tests",
        ],
        answer: 0,
        why: [
          "Correct. Inheritance declares an is-a relationship: the child should be usable anywhere the parent is. That is a real promise, not just code sharing.",
          "Inheritance is not about speed; it is about the is-a substitution relationship.",
          "Inheritance does not generate tests; it declares substitutability.",
        ],
        explanation: "Inheritance promises the child can substitute for the parent (is-a).",
      },
      {
        question: "In `ReportService` holding a `repository` and a `formatter`, what relationship is that?",
        choices: [
          "Composition — it *has* collaborators and delegates work to them",
          "Inheritance — it *is a* repository",
          "Neither — it copies their code",
        ],
        answer: 0,
        why: [
          "Correct. Holding other objects and asking them to do jobs is composition (a has-a relationship).",
          "It does not inherit from them; it holds them as collaborators.",
          "It does not copy their code; it delegates to the objects at runtime.",
        ],
        explanation: "Holding collaborators and delegating is composition (has-a).",
      },
      {
        question: "You want to reuse some behavior in a new class. What is usually the safer choice?",
        choices: [
          "Composition — hold a collaborator and delegate to it",
          "Inheritance — subclass to grab the behavior",
          "Copy the code by hand",
        ],
        answer: 0,
        why: [
          "Correct. Composition keeps classes loosely coupled and easy to change; you swap collaborators freely.",
          "Inheriting just for reuse couples you to the parent's internals and gets fragile — reserve it for true is-a substitution.",
          "Copying code duplicates bugs and work; delegate to a collaborator instead.",
        ],
        explanation: "Prefer composition for reuse; inherit only for true substitutability.",
      },
    ],
    prompt: "Define `Pipeline(transformer)` whose `run(values)` returns a list produced by calling `transformer` on each value.", fn: "Pipeline", starter: `class Pipeline:\n    pass`, solution: `class Pipeline:\n    def __init__(self, transformer):\n        self.transformer = transformer\n\n    def run(self, values):\n        return [self.transformer(value) for value in values]`,
    tests: [t("composes", "pipe = fn(lambda x: x * 3); assert pipe.run([1, 2]) == [3, 6]"), t("independent", "assert fn(str).run([1, 2]) == ['1', '2']")],
  },
  {
    id: "protocols", module: "py.m4", title: "Data model and protocols", goal: "Make a custom type participate in Python's ordinary syntax.", requires: ["classes"],
    model: "Python's built-in syntax secretly calls special methods whose names start and end with double underscores — people call them **dunder** methods (for 'double underscore'). If your class provides the right ones, it works with ordinary Python syntax, with no special base class needed.\n\nA few examples:\n- `len(x)` calls `x.__len__()`.\n- looping with `for` calls `x.__iter__()`.\n- `print(x)` uses `x.__repr__()` for how it looks.\n- `x == y` may call `x.__eq__(y)`.\n\nSo to make a `Playlist` that works with `len()` and `for`, you just add `__len__` and `__iter__`:\n\n```python\nclass Playlist:\n    def __init__(self, songs):\n        self._songs = list(songs)\n\n    def __len__(self):\n        return len(self._songs)\n\n    def __iter__(self):\n        return iter(self._songs)\n\np = Playlist([\"a\", \"b\", \"c\"])\nprint(len(p))          # 3\nfor song in p:\n    print(song)        # a, then b, then c\n```\n\nNow `len(p)` and `for song in p` just work, because `p` implements the methods those built-ins look for. Implement only the ones your type genuinely supports — the smallest set that makes sense.",
    example: `class Playlist:\n    def __init__(self, songs):\n        self._songs = list(songs)\n\n    def __len__(self):\n        return len(self._songs)\n\n    def __iter__(self):\n        return iter(self._songs)\n\np = Playlist(["a", "b", "c"])\nprint(len(p))     # 3`,
    trace: "When you write `len(p)`, Python calls `p.__len__()`, which returns `len(self._songs)`, so you get `3`. When you write `for song in p`, Python calls `p.__iter__()`, which hands back an iterator over the songs, so the loop visits `\"a\"`, `\"b\"`, and `\"c\"`. The `Playlist` works with `len` and `for` even though it does not inherit from `list` — it just implements the same methods those built-ins look for.",
    trap: "Do not call dunder methods yourself when normal syntax exists — write `len(x)`, not `x.__len__()`. The built-in form lets Python validate and optimize, and it reads far better. And implement only the protocols your type really supports, not every dunder you can think of.",
    rule: "To make your type work with Python's ordinary syntax (`len`, `for`, `==`, printing), implement the matching special methods — the smallest set your type truly supports. That is more reusable than inventing your own method names.",
    recall: "Why can a custom class work in a `for` loop without inheriting from `list`, and why call `len(x)` rather than `x.__len__()`?",
    checks: [
      {
        question: "How can a custom class work in a `for` loop without inheriting from `list`?",
        choices: [
          "By implementing the iteration protocol (`__iter__`)",
          "It cannot — you must subclass `list`",
          "By naming a method `loop`",
        ],
        answer: 0,
        why: [
          "Correct. `for` calls `__iter__`; any class that defines it becomes iterable, no inheritance required.",
          "You do not need to subclass `list`; implementing `__iter__` is enough.",
          "Python looks for `__iter__`, not a method called `loop`.",
        ],
        explanation: "Implementing `__iter__` makes any class work in a `for` loop.",
      },
      {
        question: "When you write `len(p)` for your object, what does Python actually call?",
        choices: [
          "`p.__len__()`",
          "`p.length`",
          "`p.count()`",
        ],
        answer: 0,
        why: [
          "Correct. The built-in `len` delegates to the object's `__len__` method.",
          "There is no automatic `length` attribute; `len` uses `__len__`.",
          "`len` does not call `count`; it calls the `__len__` protocol method.",
        ],
        explanation: "`len(x)` calls `x.__len__()`.",
      },
      {
        question: "Should you call `x.__len__()` directly in your code?",
        choices: [
          "No — use `len(x)`; it is clearer and lets Python validate and optimize",
          "Yes — always call the dunder directly",
          "It makes no difference",
        ],
        answer: 0,
        why: [
          "Correct. Prefer the normal syntax `len(x)`; calling the dunder directly is noisier and skips Python's checks.",
          "You generally should not call dunders directly when a built-in or operator exists.",
          "It does matter: `len(x)` is the intended, safer, clearer form.",
        ],
        explanation: "Use `len(x)`, not `x.__len__()` directly.",
      },
    ],
    prompt: "Define `Countdown(start)` as an iterable yielding `start` down through `1`; `len(countdown)` returns `start`.", fn: "Countdown", starter: `class Countdown:\n    pass`, solution: `class Countdown:\n    def __init__(self, start):\n        self.start = start\n\n    def __len__(self):\n        return self.start\n\n    def __iter__(self):\n        return iter(range(self.start, 0, -1))`,
    tests: [t("iteration", "assert list(fn(4)) == [4, 3, 2, 1]"), t("length", "assert len(fn(7)) == 7"), t("empty", "assert list(fn(0)) == []", true)],
  },
  {
    id: "iterators", module: "py.m5", title: "Iterable, iterator, generator", goal: "Explain lazy iteration and consume an iterator safely.", kind: "mental-model", requires: ["loops", "protocols"],
    model: "When you write `for x in something`, what actually happens under the hood? Python asks the collection for an **iterator** — a little bookmark that hands out one item at a time and remembers where it left off.\n\nTwo words to keep straight:\n- An **iterable** is anything you *can* loop over — a list, a string, a set. It can make fresh iterators on demand.\n- An **iterator** is the *one-way stream itself*. You advance it with `next()`, and it remembers its position. When it runs out, it signals `StopIteration`.\n\n```python\nnums = [10, 20, 30]      # a list is an ITERABLE\nit = iter(nums)          # ask it for an ITERATOR\nprint(next(it))          # 10\nprint(next(it))          # 20\nprint(next(it))          # 30\n# next(it) now would raise StopIteration — the stream is used up\n```\n\nA **generator** is the easy way to build your own iterator. Instead of a class, you write a normal-looking function that uses `yield` instead of `return`. Each `yield` hands back one value and *pauses* the function, remembering all its variables; the next `next()` resumes right where it left off.\n\n```python\ndef count_up_to(n):\n    i = 1\n    while i <= n:\n        yield i          # hand back i, then pause here\n        i += 1\n\nfor x in count_up_to(3):\n    print(x)             # 1, then 2, then 3\n```\n\nThe magic is **laziness**: `count_up_to(1000000)` does not build a million-item list — it produces one number at a time, only when asked. That is why iterators suit huge, endless, or expensive-to-produce data: you never hold it all at once.",
    example: `def count_up_to(n):\n    i = 1\n    while i <= n:\n        yield i\n        i += 1\n\ngen = count_up_to(3)\nprint(next(gen))              # 1\nprint(next(gen))              # 2\nprint(list(count_up_to(3)))   # [1, 2, 3]`,
    trace: "Calling `count_up_to(3)` does **not** run the body — it hands back a paused generator. The first `next(gen)` runs until `yield i` with `i` at `1`, so it returns `1` and freezes there. The second `next(gen)` resumes right after that `yield`, does `i += 1` (now `2`), loops, and `yield i` returns `2`. Because the function remembers `i` between calls, it picks up exactly where it paused. `list(count_up_to(3))` just drives a fresh generator to exhaustion, collecting `1`, `2`, `3`.",
    trap: "An iterator is *consumed* as you go — once you reach the end, it is empty. Looping the **same** iterator a second time produces nothing; you must ask the iterable for a **fresh** iterator to walk it again. (A list can be looped many times because each `for` quietly makes a new iterator; a bare generator cannot.)",
    rule: "Reach for lazy iteration — a generator with `yield` — when the data is large, endless, expensive, or naturally streamed, so you produce items one at a time instead of building a giant list. Remember an iterator is single-use.",
    recall: "What is the difference between an iterable and the iterator it creates, and what does calling a generator function (with `yield`) actually return?",
    checks: [
      {
        question: "You loop an iterator to the end, then loop the same iterator again. What is produced the second time?",
        choices: [
          "Nothing — an iterator is consumed once",
          "It restarts from the beginning",
          "An error",
        ],
        answer: 0,
        why: [
          "Correct. An iterator is a one-way, stateful stream; once exhausted it yields nothing. Make a fresh iterator from the iterable to walk it again.",
          "It does not restart — iterators do not rewind. The iterable can make a new iterator, but the old one is spent.",
          "It is not an error; looping an exhausted iterator simply produces no items.",
        ],
        explanation: "An iterator is consumed once; create a new one to iterate again.",
      },
      {
        question: "What happens when you *call* a generator function (one with `yield`)?",
        choices: [
          "It returns a generator without running the body yet; the body advances on each `next`",
          "It runs the whole body immediately and returns a list",
          "It raises `StopIteration`",
        ],
        answer: 0,
        why: [
          "Correct. Calling a generator function creates a generator object; the body runs lazily, pausing at each `yield` and resuming on the next `next`.",
          "It does not run eagerly or build a list — that laziness is the point of a generator.",
          "`StopIteration` is raised only when the generator is exhausted, not when you first call it.",
        ],
        explanation: "Calling a generator function returns a lazy generator; the body advances on each `next`.",
      },
      {
        question: "What is the difference between an *iterable* and an *iterator*?",
        choices: [
          "An iterable can produce iterators; an iterator is the one-way stream you actually advance",
          "They are the same thing",
          "An iterator can be looped many times; an iterable only once",
        ],
        answer: 0,
        why: [
          "Correct. An iterable (like a list) can hand out fresh iterators; an iterator holds the position and is consumed as you advance it.",
          "They are different roles: one makes streams, the other is the stream.",
          "It is the reverse — an iterator is consumed once, while an iterable can produce a new iterator each time you loop it.",
        ],
        explanation: "An iterable produces iterators; the iterator is the consumable stream.",
      },
    ],
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
    model: "Some things must be *cleaned up* after you use them — a file must be closed, a lock released, a network connection shut. The danger is forgetting, especially when an error happens partway through. A **context manager** guarantees the cleanup for you.\n\nYou use one with the `with` statement:\n\n```python\nwith open(\"data.txt\", encoding=\"utf-8\") as file:\n    text = file.read()\n# the moment this block ends, the file is closed for you —\n# even if an error was raised inside the block\n```\n\nHere is what `with` does: it runs the setup (opening the file), runs your indented block, and then **always** runs the cleanup (closing the file) at the end — whether the block finished normally *or* blew up with an error. That 'always, even on failure' guarantee is the whole point.\n\nWithout `with`, you would have to write this by hand every time:\n\n```python\nfile = open(\"data.txt\", encoding=\"utf-8\")\ntry:\n    text = file.read()\nfinally:\n    file.close()   # only this guarantees closing on an error\n```\n\nThe `with` version does exactly that, but shorter and impossible to forget. Files, locks, database transactions, and temporary settings all work this way. Under the hood, a context manager provides `__enter__` (setup) and `__exit__` (cleanup, which runs even when the body raises).",
    example: `with open("data.txt", encoding="utf-8") as file:\n    text = file.read()\n# file is now closed automatically, even if read() had raised`,
    trace: "`with open(\"data.txt\", ...) as file:` calls the file's setup, which opens it and gives you `file`. Your block runs `text = file.read()`. When the block ends, `with` runs the file's cleanup, which closes it — and this happens even if `file.read()` had raised an error partway through. So you never leak an open file, and you never have to write a `finally` block yourself.",
    trap: "Do not open a file inside a `with` block and then `return` the file object — the block closes it on the way out, so the caller receives a *closed*, useless file. Return the data you read, or let the caller own the `with` block instead.",
    rule: "Whenever an operation has an acquire/release pair — open/close, lock/unlock, begin/commit — use it with `with` so the release is guaranteed, on both success and failure. If you build such a thing yourself, expose it as a context manager.",
    recall: "What does `with` guarantee that a plain `open(...)` does not, and why should you not return a file object created inside a `with` block?",
    checks: [
      {
        question: "If the body of a `with` block raises, does the context manager's cleanup still run?",
        choices: [
          "Yes — `__exit__` runs on both success and failure",
          "No — an exception skips cleanup",
          "Only if you add a `finally`",
        ],
        answer: 0,
        why: [
          "Correct. `with` guarantees `__exit__` runs even when the body raises — that reliable cleanup is the whole point.",
          "An exception does not skip it; `with` is designed to clean up on the error path too.",
          "No extra `finally` is needed — the context manager already guarantees cleanup.",
        ],
        explanation: "`with` runs `__exit__` on both success and failure.",
      },
      {
        question: "What problem does `with open(...) as f:` solve compared to `f = open(...)`?",
        choices: [
          "It automatically closes the file afterward, even if an error happens",
          "It reads the file faster",
          "It makes the file editable",
        ],
        answer: 0,
        why: [
          "Correct. The `with` block guarantees the file is closed when the block ends, success or failure — no manual close or `finally` needed.",
          "It is about guaranteed cleanup, not speed.",
          "`with` does not change whether a file is editable; it manages the open/close lifecycle.",
        ],
        explanation: "`with` guarantees the resource is cleaned up (the file closed) when the block ends.",
      },
      {
        question: "You `open` a file inside a `with` block and `return` the file object. What is wrong?",
        choices: [
          "The file is already closed when the caller gets it — return the data instead",
          "Nothing — the file stays open",
          "It raises immediately",
        ],
        answer: 0,
        why: [
          "Correct. Leaving the `with` block closes the file, so the returned handle is closed and useless. Return the read data, or let the caller own the `with`.",
          "It does not stay open — the `with` closes it as soon as the block ends.",
          "It does not raise on return; the bug shows up later when the caller tries to use the closed file.",
        ],
        explanation: "The `with` closes the file on exit, so return the data, not the handle.",
      },
    ],
    prompt: "Use `contextlib.contextmanager` to implement `temporarily(mapping, key, value)`: set a value inside the context, then restore the old state afterward.", fn: "temporarily", starter: `from contextlib import contextmanager\n\n@contextmanager\ndef temporarily(mapping, key, value):\n    pass`, solution: `from contextlib import contextmanager\n\n@contextmanager\ndef temporarily(mapping, key, value):\n    missing = object()\n    old = mapping.get(key, missing)\n    mapping[key] = value\n    try:\n        yield\n    finally:\n        if old is missing:\n            mapping.pop(key, None)\n        else:\n            mapping[key] = old`,
    tests: [t("restores", `data = {"x": 1}\nwith fn(data, "x", 9): assert data["x"] == 9\nassert data["x"] == 1`), t("removes new", `data = {}\nwith fn(data, "x", 9): pass\nassert "x" not in data`, true)],
  },
  {
    id: "files-json", module: "py.m5", title: "Paths, files, JSON, and boundaries", goal: "Read external data with explicit encoding and validation.", requires: ["contexts", "dicts"],
    model: "Reading data from outside your program — a file on disk, a config, an API response — has a few reliable steps. This lesson covers the tools and the one big safety rule.\n\n**Paths.** `pathlib.Path` represents a file location and handles the messy differences between operating systems (slashes, separators) for you:\n\n```python\nfrom pathlib import Path\n\ntext = Path(\"config.json\").read_text(encoding=\"utf-8\")\n```\n\n**Encoding.** A file on disk is really just *bytes*. To turn bytes into text you must say which **encoding** to use — almost always `\"utf-8\"`. Pass it explicitly (as above) so your program behaves the same on every machine, instead of relying on a default that varies.\n\n**JSON.** JSON is a common text format for data. `json.loads` turns a JSON *string* into Python values — dicts, lists, strings, numbers, `True`/`False`, `None`:\n\n```python\nimport json\n\ndata = json.loads('{\"timeout\": 30, \"debug\": true}')\nprint(data[\"timeout\"])   # 30\nprint(type(data))        # <class 'dict'>\n```\n\n**The safety rule — validate at the boundary.** A successful parse only proves the text was *valid JSON*. It does **not** prove the data has the keys and types your program expects, so check the shape before trusting it. And never use `eval` to parse data — `eval` runs code, so a malicious string could do anything. `json.loads` only reads data, which is exactly what you want.",
    example: `import json\nfrom pathlib import Path\n\ntext = Path("config.json").read_text(encoding="utf-8")\ndata = json.loads(text)\nprint(data["timeout"])   # e.g. 30`,
    trace: "`Path(\"config.json\").read_text(encoding=\"utf-8\")` opens the file, reads its bytes, and decodes them into a string using UTF-8. `json.loads(text)` turns that JSON string into Python values — here a dict. `data[\"timeout\"]` then reads a key from it. Important: the parse only confirmed the text was valid JSON; it did **not** confirm that a `\"timeout\"` key exists or that it is a number — you still validate that yourself before relying on it.",
    trap: "Never use `eval` to parse incoming data — it executes whatever code is in the string, which is a serious security hole. Use `json.loads`, which only reads data. And remember: successful parsing proves *syntax*, not that the data has the shape and types you expect — validate at the trust boundary.",
    rule: "Read external data in clear steps: decode bytes to text with an explicit encoding, parse (e.g. `json.loads`), then validate the shape and types before converting it into the values your program relies on.",
    recall: "What does a successful `json.loads(text)` prove and not prove, and why pass `encoding=\"utf-8\"` when reading a file?",
    checks: [
      {
        question: "A successful `json.loads(text)` proves what?",
        choices: [
          "Only that the text is valid JSON — not that it has the shape or types you expect",
          "That the data matches your schema",
          "That the file exists",
        ],
        answer: 0,
        why: [
          "Correct. Parsing checks syntax only. You still must validate the shape and types yourself at the trust boundary.",
          "It does not check your schema — valid JSON can still be missing keys or have the wrong types.",
          "`loads` parses a string you already have; it says nothing about files on disk.",
        ],
        explanation: "Parsing checks JSON syntax only; validate shape and types separately.",
      },
      {
        question: "Why should you never use `eval` to parse incoming data?",
        choices: [
          "`eval` executes arbitrary code, which is a serious security hole — use `json.loads` for data",
          "`eval` is slower than `json.loads`",
          "`eval` cannot read numbers",
        ],
        answer: 0,
        why: [
          "Correct. `eval` runs whatever code is in the text, so untrusted input could do anything. `json.loads` only reads data.",
          "Speed is not the concern; the concern is that `eval` runs code.",
          "`eval` can read numbers — the real problem is that it executes code.",
        ],
        explanation: "`eval` runs code; use `json.loads` to safely parse data.",
      },
      {
        question: "Why pass `encoding=\"utf-8\"` when reading a text file?",
        choices: [
          "To decode the bytes into text correctly and predictably, regardless of the machine's default",
          "To make the file smaller",
          "It is optional and never matters",
        ],
        answer: 0,
        why: [
          "Correct. Files are bytes; an explicit encoding turns them into text the same way everywhere, avoiding surprises from a machine's default.",
          "Encoding is about how bytes map to characters, not file size.",
          "It does matter — relying on the default encoding causes bugs across different systems.",
        ],
        explanation: "An explicit encoding decodes bytes to text reliably across machines.",
      },
    ],
    prompt: "Return compact, key-sorted JSON for a dictionary so equivalent inputs produce stable text.", fn: "stable_json", starter: `import json\n\ndef stable_json(data):\n    pass`, solution: `import json\n\ndef stable_json(data):\n    return json.dumps(data, sort_keys=True, separators=(",", ":"))`,
    tests: [t("stable", `assert fn({"b": 2, "a": 1}) == '{"a":1,"b":2}'`), t("nested", `assert fn({"x": [2, 1]}) == '{"x":[2,1]}'`)],
  },
  {
    id: "typing", module: "py.m6", title: "Type hints as executable design", goal: "Use annotations to expose contracts without confusing them for runtime checks.", kind: "mental-model", requires: ["functions", "classes", "imports"],
    model: "You have already added type hints like `def count(text: str) -> int:`. This lesson explains what they are really *for*. A type hint **describes** the kind of value you expect — for a parameter, a return, or a variable. Their audience is your **editor, static checkers, and other readers** — not the Python runtime.\n\nThe surprising part: **Python does not enforce hints while running.** A hint is documentation that tools can check; passing the wrong type does not raise just because of a hint.\n\n```python\ndef greet(name: str) -> str:\n    return \"Hi, \" + name\n\ngreet(42)   # Python still RUNS this — the hint is not a runtime check,\n            # but an editor or mypy will warn you *before* you run it\n```\n\nA few useful shapes:\n- **Union** — `str | None` means 'a string or None'. Callers must handle both.\n- **Container** — `list[int]` means 'a list of ints'.\n- A **type variable** like `T` says 'whatever type goes in comes out': `def first(items: list[T]) -> T` means a list of `T` returns a `T`, so `first([1, 2])` is known to be an `int` and `first([\"a\"])` a `str`. A vague `object` would throw that information away.\n\n**Where to spend effort:** annotate the *boundaries* — function parameters and returns — and any tricky value. Let the editor infer obvious local variables. And avoid `Any`, which switches checking *off* and lets mistakes spread.",
    example: `def greet(name: str) -> str:\n    return f"Hi, {name}!"\n\nprint(greet("Ada"))   # Hi, Ada!\n# greet(42) would still run, but your editor/mypy flags it first`,
    trace: "`greet` is annotated to take a `str` and return a `str`. `greet(\"Ada\")` matches, returning `\"Hi, Ada!\"`. If you wrote `greet(42)`, Python would still *run* it — hints are not runtime checks — but a static checker or your editor would flag the mismatch first, catching the bug before you even run the program. That early warning, plus better autocomplete, is the whole value of hints.",
    trap: "`Any` turns type-checking *off* for a value and lets uncertainty spread through your code — avoid it. If a value is genuinely unknown, prefer `object`, which forces callers to check the type before using it. And remember hints do not run: they guide tools and readers, not the interpreter.",
    rule: "Annotate the boundaries first — function parameters and return types — plus any tricky value. Let your editor infer obvious local variables, and avoid `Any`.",
    recall: "Who are type hints for, does Python enforce them at runtime, and what does a type variable like `T` preserve in `def first(items: list[T]) -> T`?",
    checks: [
      {
        question: "Do Python type hints enforce types at runtime?",
        choices: [
          "No — they guide tools and readers; Python normally does not check them while running",
          "Yes — a wrong type raises immediately",
          "Only for function return values",
        ],
        answer: 0,
        why: [
          "Correct. Annotations document intent for editors and static checkers; Python does not verify them at runtime unless you add explicit checks.",
          "A wrong type does not raise just because of a hint — Python runs the code regardless.",
          "Neither parameters nor returns are runtime-checked from hints alone.",
        ],
        explanation: "Hints guide tools and readers; they are not runtime checks by default.",
      },
      {
        question: "What is the main value of adding type hints?",
        choices: [
          "Better editor autocomplete and static checkers catching mismatches before you run",
          "Making the program run faster",
          "Automatically converting values to the right type",
        ],
        answer: 0,
        why: [
          "Correct. Hints power autocomplete and let tools like mypy flag mismatches early, and they document a function's contract for readers.",
          "Hints do not change runtime speed.",
          "Hints do not convert values; a wrong type is not fixed automatically.",
        ],
        explanation: "Hints improve tooling, catch mismatches early, and document intent.",
      },
      {
        question: "What does the return type `str | None` mean?",
        choices: [
          "The function returns either a string or `None`",
          "The function returns a string named None",
          "The function must return both",
        ],
        answer: 0,
        why: [
          "Correct. The `|` forms a union: the value is a `str` on some paths and `None` on others, so callers should handle the `None` case.",
          "It is not a named string; `None` is the separate absence value the function may return.",
          "It returns one or the other on a given call, not both.",
        ],
        explanation: "`str | None` is a union: a string or None.",
      },
    ],
    prompt: "Implement annotated `only_strings(values: list[object]) -> list[str]` using `isinstance`.", fn: "only_strings", starter: `def only_strings(values: list[object]) -> list[str]:\n    pass`, solution: `def only_strings(values: list[object]) -> list[str]:\n    return [value for value in values if isinstance(value, str)]`,
    tests: [t("narrows", `assert fn(["a", 2, "b", None]) == ["a", "b"]`), t("empty", "assert fn([]) == []")],
  },
  {
    id: "testing", module: "py.m6", title: "Tests that explain behavior", goal: "Partition inputs and test contracts rather than implementation trivia.", kind: "pattern", requires: ["typing", "exceptions"],
    model: "A good test is a tiny, readable story: it names one behavior, sets up the smallest state that shows it, does one action, and checks one visible result. When it fails, the name alone should tell you what broke.\n\n```python\ndef test_clamp_caps_a_value_above_the_range():\n    assert clamp(12, 0, 10) == 10\n\ndef test_clamp_leaves_an_in_range_value_alone():\n    assert clamp(4, 0, 10) == 4\n```\n\nThe function *names* describe the contract, so a failure reads like a sentence. And notice these test *behavior*, not *how* it is coded — if you later rewrite `clamp` using `min`/`max`, the tests still pass because the behavior is unchanged.\n\n**The real skill is choosing inputs.** A handful of well-chosen cases finds far more bugs than dozens of similar happy examples. Cover the **partitions** where bugs hide:\n- **empty** (an empty list, `\"\"`)\n- **single** item\n- **ordinary** case\n- **boundary** (the exact edge — `0`, the max, off-by-one)\n- **invalid** input\n\n**One trap:** do not compute a test's expected answer the same way the code does — if the code is wrong, your test repeats the mistake and 'passes' for the wrong reason. Work out the expected value *independently* from the specification.",
    example: `def test_clamp_caps_a_value_above_the_range():\n    assert clamp(12, 0, 10) == 10\n\ndef test_clamp_leaves_an_in_range_value_alone():\n    assert clamp(4, 0, 10) == 4`,
    trace: "Each test name states one behavior, so a failure reads like a sentence — 'clamp caps a value above the range' broke. The first asserts `clamp(12, 0, 10)` is `10` (capped at the top); the second asserts `clamp(4, 0, 10)` is `4` (left alone). Both check an *observable result*, the return value, not the internal code — so rewriting `clamp` with `min`/`max` keeps them green.",
    trap: "Do not derive a test's expected value by copying what the implementation does — if the code has a bug, the test repeats it and passes for the wrong reason. Compute the expected answer independently from the spec. Also avoid asserting private details like call order unless that order *is* the contract.",
    rule: "Write focused tests that each check one behavior via an observable result, name them so a failure reads like a sentence, and cover the partitions — empty, single, ordinary, boundary, invalid — where bugs hide.",
    recall: "What five input partitions should you cover, and why derive a test's expected value from the spec rather than from the implementation?",
    checks: [
      {
        question: "Why derive a test's expected value from the spec rather than by copying the implementation?",
        choices: [
          "A test that mirrors the code can repeat the same mistake and validate nothing",
          "It runs faster",
          "It uses less memory",
        ],
        answer: 0,
        why: [
          "Correct. If the test computes the expected value the same way the code does, a bug in the code hides in the test too. Derive it independently from the spec.",
          "Speed is not the point; independence is.",
          "Memory is irrelevant; the issue is whether the test can actually catch a bug.",
        ],
        explanation: "Independently-derived expected values catch bugs; copying the implementation does not.",
      },
      {
        question: "Which set of inputs tends to find the most bugs?",
        choices: [
          "Partitions: empty, single, ordinary, boundary, and invalid cases",
          "Many random ordinary (happy-path) examples",
          "One example that you know works",
        ],
        answer: 0,
        why: [
          "Correct. Bugs cluster at edges — empty, one item, boundaries, invalid input. Covering those partitions finds far more than repeated happy cases.",
          "Many similar happy-path examples exercise the same path repeatedly and miss edges.",
          "A single passing example proves very little about the rest of the input space.",
        ],
        explanation: "Test partitions (empty/single/ordinary/boundary/invalid) to find edge-case bugs.",
      },
      {
        question: "What should a single good test do?",
        choices: [
          "Name one behavior, set up the smallest state, do one action, and check one observable result",
          "Exercise as many behaviors as possible at once",
          "Check the function's internal variables",
        ],
        answer: 0,
        why: [
          "Correct. A focused test that checks one behavior makes failures easy to read and diagnose.",
          "Bundling many behaviors into one test makes a failure ambiguous and hard to localize.",
          "Tests should check observable results (return values, effects), not internal implementation details.",
        ],
        explanation: "A good test checks one behavior via an observable result.",
      },
    ],
    prompt: "Implement `median(values)` for a nonempty numeric list. Do not mutate the input.", fn: "median", starter: `def median(values):\n    pass`, solution: `def median(values):\n    ordered = sorted(values)\n    middle = len(ordered) // 2\n    if len(ordered) % 2:\n        return ordered[middle]\n    return (ordered[middle - 1] + ordered[middle]) / 2`,
    tests: [t("odd", "assert fn([9, 1, 4]) == 4"), t("even", "assert fn([1, 4, 2, 3]) == 2.5"), t("does not mutate", "data = [3, 1, 2]; fn(data); assert data == [3, 1, 2]", true)],
  },
  {
    id: "debugging", module: "py.m6", title: "Debugging by reducing uncertainty", goal: "Turn a vague failure into the first incorrect state transition.", kind: "mental-model", requires: ["testing"],
    model: "Debugging is not random poking — it is a **controlled search** for the first place your program's state goes wrong. A reliable routine:\n1. **Reproduce** the failure consistently — you cannot fix what you cannot trigger on demand.\n2. **Shrink** the input to the smallest case that still fails, so there is less to reason about.\n3. **State expected vs actual** in plain words — what *should* happen here, and what *does*?\n4. **Find the first divergence** — walk from the start toward the failure and pinpoint the earliest moment the state stops matching what you expected.\n\nA **stack trace** is your map: it lists the chain of calls that led to the error. The actual error and its line are at the **bottom**; read **upward** to see how execution got there.\n\n**The golden rule: change one thing at a time.** Each step should test one hypothesis with one observation. If you change five lines and rerun, and it passes, you have learned nothing — you do not know which change mattered or whether you introduced a new bug.",
    example: `def normalize(records):\n    # a targeted check: which assumption breaks first?\n    assert all("id" in record for record in records)\n    ...`,
    trace: "A focused check or log should test one *hypothesis*: for example, `assert all(\"id\" in record ...)` pins down whether every record really has an `id` before the code that assumes it. If that assertion fires, you have found the first broken assumption. Logging everything instead just buries the signal in noise — aim each probe at a specific question.",
    trap: "Changing several lines before you rerun destroys your evidence: if it now works, you cannot tell which change fixed it, and you may have added a new bug. One hypothesis, one observation, one change.",
    rule: "Reproduce, shrink the input, state expected vs actual, then find the first point where the state diverges — changing exactly one thing per step so every result teaches you something.",
    recall: "What are the steps of controlled-search debugging, and where in a stack trace is the actual error — the top or the bottom?",
    checks: [
      {
        question: "You change five lines at once, rerun, and the test passes. What is the problem?",
        choices: [
          "You do not know which change fixed it — change one thing per hypothesis",
          "Nothing, it passed",
          "You should have changed ten lines",
        ],
        answer: 0,
        why: [
          "Correct. With five changes at once, you cannot tell which one mattered (or whether others introduced new bugs). Change one thing, then observe.",
          "It passing is not enough — you learned nothing reliable about the cause.",
          "More changes make it worse, not better; isolate one hypothesis at a time.",
        ],
        explanation: "Debugging is controlled search: one change per hypothesis.",
      },
      {
        question: "What is a good first step when debugging a vague failure?",
        choices: [
          "Reproduce it reliably and shrink the input to the smallest case that still fails",
          "Rewrite the whole function from scratch",
          "Add print statements to every line at once",
        ],
        answer: 0,
        why: [
          "Correct. A reliable, minimal reproduction removes noise and points straight at where state first goes wrong.",
          "Rewriting blindly may hide the bug without teaching you the cause, and can add new ones.",
          "Logging everything increases data while reducing signal; probe specific hypotheses instead.",
        ],
        explanation: "Reproduce reliably and shrink the input to isolate the failure.",
      },
      {
        question: "How do you read a Python stack trace?",
        choices: [
          "It is the path of calls; the exception is at the bottom, and you read upward to see how you got there",
          "The top line is always the real bug",
          "It is random and not useful",
        ],
        answer: 0,
        why: [
          "Correct. The trace lists the call path; the actual error and its location are at the bottom, and the frames above show how execution reached it.",
          "The top frame is the outermost call, not necessarily where the error is; the bottom shows the failing line.",
          "A stack trace is precise and one of the most useful debugging tools.",
        ],
        explanation: "A stack trace is the call path; read from the exception (bottom) upward.",
      },
    ],
    prompt: "Implement `first_difference(left, right)`, returning the first unequal index or the shorter length when only lengths differ; return `None` when equal.", fn: "first_difference", starter: `def first_difference(left, right):\n    pass`, solution: `def first_difference(left, right):\n    for index, (a, b) in enumerate(zip(left, right)):\n        if a != b:\n            return index\n    if len(left) != len(right):\n        return min(len(left), len(right))\n    return None`,
    tests: [t("value", "assert fn([1, 9], [1, 3]) == 1"), t("length", "assert fn([1], [1, 2]) == 1"), t("equal", "assert fn('abc', 'abc') is None")],
  },
  {
    id: "modules", module: "py.m7", title: "Modules, packages, and import boundaries", goal: "Organize code so imports reveal dependencies instead of triggering surprises.", kind: "pattern", requires: ["imports", "functions", "classes"],
    model: "As programs grow, you split them into multiple files. Each `.py` file is a **module** with its own namespace (its own set of top-level names). A **package** is a folder of related modules. This lesson is about organizing them so `import` reveals your dependencies clearly instead of causing surprises.\n\nThe key fact: when you import a module, Python **runs the whole file top to bottom, once**, then caches it. Later imports of the same module reuse that cached copy without re-running it.\n\n```python\n# prices.py\nprint(\"loading prices\")     # runs ONCE, the first time prices is imported\n\ndef total(items):\n    return sum(item.price for item in items)\n\n# checkout.py\nfrom prices import total    # importing runs prices.py's top level -> prints 'loading prices'\n```\n\nBecause the whole file runs on import, keep real *work* inside functions (which run when *called*), and let import time mostly *define* things. A top-level `print`, network call, or file read fires the instant anyone imports the module — usually a surprise.\n\n**Circular imports** are the classic trap: module A imports B while B imports A, and neither has finished setting up. The fix is to restructure — move the shared piece into a lower-level module both can import, or pass the dependency in — rather than hiding the cycle inside a function.",
    example: `# prices.py\ndef total(items):\n    return sum(item.price for item in items)\n\n# checkout.py\nfrom prices import total`,
    trace: "Importing `prices` makes Python find the file, create its namespace, run its top level (defining `total`), cache it in `sys.modules`, and bind the name. In `checkout.py`, `from prices import total` triggers all of that — including any top-level code in `prices.py` — then gives `checkout` the `total` name. Because the whole module body runs on that first import, put work inside functions like `total`, which only run when called, and keep import time to definitions.",
    trap: "Circular imports — module A needs B while B needs A, before either finishes initializing — cause confusing errors. Do not paper over it with an import hidden inside a function; instead move the shared abstraction into a lower-level module both can import, or pass the dependency in.",
    rule: "Keep side effects behind explicit entry-point functions, not at module top level, and let dependencies point from high-level policy down toward stable low-level pieces — so imports reveal structure instead of surprising you.",
    recall: "Why can a module's top-level code run merely because another module imports one function from it, and where should side effects live instead?",
    checks: [
      {
        question: "Importing one function from a module can trigger the module's top-level code. Why?",
        choices: [
          "Import runs the whole module body once, then caches it",
          "It does not — only that one function is loaded",
          "Because functions always print when imported",
        ],
        answer: 0,
        why: [
          "Correct. An import executes the entire module top-to-bottom (once), then caches it, so any top-level code runs even if you imported just one name.",
          "Python cannot run only one function in isolation; it executes the whole module body to define everything first.",
          "Functions do not print on import; the top-level code runs because the module body executes.",
        ],
        explanation: "Import runs the whole module body once (then caches it in `sys.modules`).",
      },
      {
        question: "You import the same module in three files. How many times does its top-level code run?",
        choices: [
          "Once per process — after the first import it is cached and reused",
          "Three times, once per import",
          "Never",
        ],
        answer: 0,
        why: [
          "Correct. The first import runs and caches the module in `sys.modules`; later imports reuse the cached module without re-running it.",
          "It does not re-run per import; the cache prevents that.",
          "It runs on the first import — just not again after.",
        ],
        explanation: "A module's top level runs once per process; later imports reuse the cache.",
      },
      {
        question: "Where should a module put code with side effects (like reading a file)?",
        choices: [
          "Inside a function, so it runs only when called — not at import time",
          "At the top level, so it runs on import",
          "In a comment",
        ],
        answer: 0,
        why: [
          "Correct. Top-level side effects fire the moment anyone imports the module, often surprisingly. Put them in functions the caller invokes deliberately.",
          "Top-level side effects run on import, which is exactly the surprise to avoid.",
          "A comment does not run at all; the goal is to run the effect deliberately, via a function.",
        ],
        explanation: "Keep side effects inside functions, not at import-time top level.",
      },
    ],
    prompt: "Implement `public_names(namespace)`, returning sorted keys that do not begin with an underscore.", fn: "public_names", starter: `def public_names(namespace):\n    pass`, solution: `def public_names(namespace):\n    return sorted(name for name in namespace if not name.startswith("_"))`,
    tests: [t("filters", `assert fn({"run": 1, "_cache": 2, "Model": 3}) == ["Model", "run"]`), t("empty", "assert fn({}) == []")],
  },
  {
    id: "performance", module: "py.m6", title: "Measure before optimizing", goal: "Separate algorithmic cost from Python-level overhead using evidence.", kind: "mental-model", requires: ["testing", "complexity"],
    model: "The first rule of making code faster is: **do not guess — measure.** Your intuition about what is slow is usually wrong. Two different tools answer two different questions:\n- **Complexity (Big-O)** predicts how the cost *grows* as the input gets bigger.\n- **A profiler** shows where *this* program actually spends its time on a real workload.\n\nSo the routine is: run a representative workload through a profiler, find the real hotspot, and fix **that**. And almost always, the biggest win is a **better algorithm**, not tweaking syntax:\n\n```python\nfrom collections import Counter\n\ndef most_common(values):\n    # one counting pass, not a rescan for every distinct value\n    return Counter(values).most_common(1)[0][0]\n```\n\nReplacing repeated scans with a single count pass changes how the cost *scales* — that dwarfs any line-level micro-optimization. Fix the algorithm first; polish syntax last, and only if a measurement says it matters.",
    example: `from collections import Counter\n\ndef most_common(values):\n    return Counter(values).most_common(1)[0][0]\n\nprint(most_common(["a", "b", "a", "a"]))   # a`,
    trace: "`Counter(values)` makes one pass, tallying how many times each value appears. `.most_common(1)` returns the single highest-count pair, and `[0][0]` pulls out just the value. The point is the *single* counting pass: a naive version that rescanned the whole list for each distinct value would be O(n²); this is O(n). The algorithm choice is the real win, not the syntax.",
    trap: "Timing one tiny call with a wall clock mostly measures noise, not the code. Use `timeit` for microbenchmarks, and profile the real end-to-end path before deciding what to optimize. Optimizing a part that is not the bottleneck wastes effort.",
    rule: "Set a target, capture a baseline measurement, change one bottleneck (usually the algorithm), then measure again — all while keeping your correctness tests green.",
    recall: "What different questions do Big-O analysis and a profiler answer, and why fix the algorithm before micro-optimizing syntax?",
    checks: [
      {
        question: "Before optimizing a slow program, you should first…",
        choices: [
          "Profile a representative workload to see where time is actually spent",
          "Rewrite whichever syntax looks slowest",
          "Add caching everywhere",
        ],
        answer: 0,
        why: [
          "Correct. Measure first — a profiler shows where the time really goes, which is often not where you would guess.",
          "Guessing from how code looks wastes effort on parts that may not matter.",
          "Caching blindly adds complexity and bugs; find the real hotspot first.",
        ],
        explanation: "Profile a real workload before optimizing — measure, don't guess.",
      },
      {
        question: "What is the difference between complexity analysis and profiling?",
        choices: [
          "Complexity predicts how cost grows with input size; profiling shows where *this* program spends time now",
          "They are the same",
          "Profiling predicts growth; complexity measures the current run",
        ],
        answer: 0,
        why: [
          "Correct. Big-O tells you scaling; a profiler tells you which functions dominate the actual runtime today.",
          "They answer different questions — one is theoretical scaling, the other is measured hotspots.",
          "It is the reverse: complexity is the theory of growth, profiling is the measurement.",
        ],
        explanation: "Complexity predicts growth; profiling measures where time is spent.",
      },
      {
        question: "You found the slow part. What usually gives the biggest win?",
        choices: [
          "Improving the algorithm (e.g. O(n²) to O(n)) before micro-tuning syntax",
          "Renaming variables to be shorter",
          "Removing all comments",
        ],
        answer: 0,
        why: [
          "Correct. A better algorithm changes how cost scales, which dwarfs line-level tweaks on large inputs.",
          "Variable names have no effect on runtime.",
          "Comments are ignored at runtime and have no performance impact.",
        ],
        explanation: "Fix the algorithm first; it beats micro-optimizing syntax.",
      },
    ],
    prompt: "Return the most frequent value; break ties by whichever appears first. Make one counting pass and one selection pass.", fn: "mode_first", starter: `def mode_first(values):\n    pass`, solution: `def mode_first(values):\n    counts = {}\n    for value in values:\n        counts[value] = counts.get(value, 0) + 1\n    best = values[0]\n    for value in values:\n        if counts[value] > counts[best]:\n            best = value\n    return best`,
    tests: [t("mode", `assert fn([2, 1, 2, 3]) == 2`), t("first tie", `assert fn(["b", "a", "a", "b"]) == "b"`), t("one", "assert fn([9]) == 9")],
  },
  {
    id: "asyncio", module: "py.m7", title: "Asyncio and cooperative concurrency", goal: "Explain when `await` yields control and prevent accidental serial I/O.", kind: "mental-model", requires: ["exceptions", "contexts"],
    model: "**Asyncio** lets one program juggle many *waiting* jobs — like downloading 100 web pages — without threads. The idea: while one job waits (for the network, say), the program runs other ready jobs instead of sitting idle.\n\nAn `async def` function is a **coroutine**. Inside it, `await` marks a point where the job might have to *wait*; at that moment, the **event loop** can go run other ready jobs, returning when this one is ready again.\n\nThe catch that surprises everyone: writing two `await`s in a row runs them **one after the other**, not together:\n\n```python\nasync def slow():\n    await fetch(a)     # waits for a to finish...\n    await fetch(b)     # ...only THEN starts b — serial!\n```\n\nTo overlap the waiting, you must *start* both jobs before awaiting them — e.g. with a task group or `asyncio.gather`:\n\n```python\nasync def fast(urls):\n    async with asyncio.TaskGroup() as group:\n        tasks = [group.create_task(fetch(url)) for url in urls]  # all start now\n    return [t.result() for t in tasks]                            # overlap the waiting\n```\n\nTwo things to remember: asyncio only helps when **waiting dominates** — it does **not** speed up heavy CPU math. And doing slow CPU or blocking work *inside* the loop freezes every other task sharing that thread, because nothing yields control.",
    example: `import asyncio\n\nasync def load_all(urls):\n    async with asyncio.TaskGroup() as group:\n        tasks = [group.create_task(fetch(url)) for url in urls]\n    return [task.result() for task in tasks]`,
    trace: "The task group *starts* every `fetch` before waiting — `group.create_task(fetch(url))` launches each one — so their waiting overlaps. Leaving the `async with` block waits for all of them to finish (structured lifetime), and if one fails, the rest are cancelled. Contrast this with `await fetch(a)` then `await fetch(b)`, which finishes `a` completely before even starting `b`.",
    trap: "`await fetch(a); await fetch(b)` is deliberately *serial* — the second only starts after the first finishes. And running blocking file or CPU work directly inside the event loop freezes every task on that thread, because it never hands control back.",
    rule: "Reach for asyncio when you have many jobs that mostly *wait* (network, disk). Start tasks together (a task group or `gather`) to overlap the waiting, and keep heavy CPU work off the event loop.",
    recall: "At what kind of point can another asyncio task run, and why do two `await`s in a row run serially rather than together?",
    checks: [
      {
        question: "`await fetch(a); await fetch(b)` runs the two fetches how?",
        choices: [
          "Serially — the second waits for the first to finish",
          "Concurrently, at the same time",
          "In separate processes",
        ],
        answer: 0,
        why: [
          "Correct. Each `await` pauses until that call completes before the next line runs, so the two fetches happen one after another.",
          "They do not overlap just because they are async; you must explicitly start both (e.g. `gather`) to overlap the waiting.",
          "asyncio uses one process and one thread; it does not spawn processes.",
        ],
        explanation: "Sequential `await`s run one after another; use `gather` to overlap.",
      },
      {
        question: "What kind of work does asyncio actually speed up?",
        choices: [
          "Many operations that spend time *waiting* (network, disk) — it overlaps the waiting",
          "Heavy CPU number-crunching",
          "Everything, automatically",
        ],
        answer: 0,
        why: [
          "Correct. While one task waits on I/O, the event loop runs other ready tasks, so lots of waiting overlaps instead of stacking up.",
          "asyncio does not make CPU-bound code faster — the work still runs on one thread.",
          "It only helps when there is waiting to overlap; pure computation sees no benefit.",
        ],
        explanation: "asyncio overlaps I/O waiting; it does not speed up CPU work.",
      },
      {
        question: "How do you actually run two async fetches concurrently?",
        choices: [
          "Start both together, e.g. `await asyncio.gather(fetch(a), fetch(b))`",
          "Put each on its own line with `await`",
          "Wrap them in a `for` loop",
        ],
        answer: 0,
        why: [
          "Correct. `gather` (or a task group) launches both coroutines so their waiting overlaps, then awaits both.",
          "Two separate `await` lines run serially — the second only starts after the first finishes.",
          "A loop of `await`s still runs them one at a time; you must start them together.",
        ],
        explanation: "Use `gather` (or a task group) to overlap awaited work.",
      },
    ],
    prompt: "Implement async `gather_ordered(functions)` that calls zero-argument async functions concurrently and returns results in input order.", fn: "gather_ordered", starter: `import asyncio\n\nasync def gather_ordered(functions):\n    pass`, solution: `import asyncio\n\nasync def gather_ordered(functions):\n    return await asyncio.gather(*(function() for function in functions))`,
    tests: [t("ordered", `import asyncio\nasync def a(): await asyncio.sleep(0.01); return "a"\nasync def b(): return "b"\nassert await fn([a, b]) == ["a", "b"]`), t("empty", "assert await fn([]) == []", true)],
  },
  {
    id: "parallelism", module: "py.m7", title: "Threads, processes, and the GIL", goal: "Choose a concurrency model from the workload and sharing cost.", kind: "mental-model", requires: ["asyncio", "performance"],
    model: "How do you make Python use several CPU cores? The answer hinges on the **GIL** (global interpreter lock). In standard Python, the GIL lets **only one thread run Python code at a time**. So spawning threads does **not** make pure-Python CPU work run in parallel.\n\nBut there are two exceptions and a clear decision:\n- **Threads still help waiting-heavy (I/O) work**, because a thread *releases* the GIL while it waits on the network or disk, letting another thread run.\n- **For CPU-heavy Python work, use separate processes.** Each process has its own interpreter and GIL, so they truly run on different cores — but you pay to copy data in and results out.\n\n```python\n# waiting-heavy (network, disk)  -> threads (ThreadPoolExecutor)\n# CPU-heavy pure Python          -> processes (ProcessPoolExecutor)\n# many network sockets           -> asyncio\n```\n\nThe rule of thumb: first figure out what your bottleneck actually *is*. If it is **waiting**, use threads or asyncio. If it is **CPU**, use processes. And remember concurrency is not automatically *faster* — shared data between threads invites race bugs, and tiny tasks spread across processes can cost more in copying and scheduling than they save.",
    example: `# waiting-heavy: ThreadPoolExecutor\n# CPU-heavy pure Python: ProcessPoolExecutor\n# many async sockets: asyncio\n# vectorized numerical kernels: often release the GIL`,
    trace: "This is a decision, not a formula. Threads share memory cheaply but need synchronization and cannot run Python bytecode in parallel (the GIL). Processes each get their own interpreter, so they *can* use multiple cores for CPU work — but copying the task in and the result out can dominate small jobs. So you match the tool to the bottleneck: waiting means threads or asyncio, CPU means processes.",
    trap: "Concurrency is not automatically parallelism, and parallelism is not automatically faster. Shared mutable state between threads causes race bugs, and splitting tiny tasks across processes can cost more in copying and scheduling than the work itself.",
    rule: "First classify the bottleneck — CPU, waiting on I/O, or an external service's capacity — then pick: processes for CPU-bound Python, threads or asyncio for waiting-bound. Measure task size and data-transfer cost before parallelizing.",
    recall: "Why can threads improve network throughput even though the GIL limits Python bytecode, and what should you use for CPU-bound Python work?",
    checks: [
      {
        question: "Why can threads still speed up network-heavy work despite the GIL?",
        choices: [
          "Threads release the GIL while waiting on I/O, so other threads run",
          "The GIL does not apply to threads",
          "Network calls run without Python",
        ],
        answer: 0,
        why: [
          "Correct. While a thread waits on I/O, it lets go of the GIL, so other threads can make progress — overlapping the waiting.",
          "The GIL very much applies to threads; the point is that it is released during I/O waits.",
          "The network call is still driven by Python; the benefit is the released lock during the wait.",
        ],
        explanation: "Threads release the GIL during I/O waits, so I/O-bound work overlaps.",
      },
      {
        question: "You have CPU-heavy Python work to parallelize. What actually helps?",
        choices: [
          "Separate processes — each has its own interpreter and can use another core",
          "More threads — the GIL lets them run Python in parallel",
          "Nothing can help",
        ],
        answer: 0,
        why: [
          "Correct. The GIL blocks threads from running Python bytecode in parallel, so CPU work needs separate processes for real parallelism.",
          "Threads cannot run Python bytecode simultaneously because of the GIL; they do not speed up CPU-bound code.",
          "Processes do help CPU-bound work; the limitation is only on threads.",
        ],
        explanation: "CPU-bound Python needs separate processes; threads are blocked by the GIL.",
      },
      {
        question: "What does the GIL (global interpreter lock) do?",
        choices: [
          "It lets only one thread execute Python bytecode at a time",
          "It speeds up all Python code",
          "It prevents you from using threads at all",
        ],
        answer: 0,
        why: [
          "Correct. In standard CPython, the GIL serializes Python bytecode execution, so only one thread runs Python at once.",
          "The GIL is a lock, not a speedup; it constrains threaded parallelism.",
          "You can still use threads — they just cannot run Python bytecode simultaneously (though they help during I/O waits).",
        ],
        explanation: "The GIL allows one thread to run Python bytecode at a time.",
      },
    ],
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
    model: "A **recursive** function solves a problem by calling *itself* on a smaller version of the same problem. The classic example is factorial: `n! = n × (n-1)!`.\n\n```python\ndef factorial(n):\n    if n <= 1:        # base case: stop here\n        return 1\n    return n * factorial(n - 1)   # smaller version of the same problem\n\nprint(factorial(4))   # 24\n```\n\nEvery correct recursion needs three parts:\n1. A **base case** — the smallest input, answered directly, that stops the recursion (`n <= 1` returns `1`).\n2. **Progress** toward the base case — each call uses a strictly smaller input (`n - 1`), so you always head toward stopping.\n3. A **combination step** — how to build this answer from the smaller one (`n * factorial(n - 1)`).\n\nWithout a base case, or without shrinking the input, it recurses forever.\n\n**One Python-specific warning:** every call that has not finished sits on the **call stack**, taking a frame, and Python does **not** reuse frames for tail calls. So recursion that goes very deep — like recursing down a long flat list — can hit `RecursionError`. When the structure is naturally flat, prefer a loop; save recursion for naturally nested things like trees.",
    example: `def factorial(n):\n    if n <= 1:\n        return 1\n    return n * factorial(n - 1)\n\nprint(factorial(4))   # 24`,
    trace: "`factorial(4)` is not `<= 1`, so it needs `4 * factorial(3)` and pauses, waiting. `factorial(3)` waits for `3 * factorial(2)`; `factorial(2)` waits for `2 * factorial(1)`. Now `factorial(1)` hits the base case and returns `1`. The paused calls resolve outward: `factorial(2)` is `2 * 1`, which is `2`; `factorial(3)` is `3 * 2`, which is `6`; `factorial(4)` is `4 * 6`, which is `24`. Each waiting call held a stack frame until its smaller call came back.",
    trap: "Recursing over a long, flat list can pile up thousands of unfinished frames and raise `RecursionError`, because Python does not optimize tail calls. When the structure is naturally flat, use a loop; reserve recursion for naturally nested data like trees.",
    rule: "Before coding a recursion, name three things: the base case that stops it, the smaller input each call uses (so it strictly shrinks), and how to combine the smaller answer into this one.",
    recall: "What three parts make a recursive function correct, and why can very deep recursion raise `RecursionError` in Python?",
    checks: [
      {
        question: "What guarantees a recursive function terminates?",
        choices: [
          "A base case plus strict progress toward it on every call",
          "Python's tail-call optimization",
          "Being written with `def`",
        ],
        answer: 0,
        why: [
          "Correct. You need a base case (a smallest case that stops) and each call must move closer to it; otherwise it recurses forever.",
          "Python does NOT optimize tail calls, so you cannot rely on that; deep recursion can raise `RecursionError`.",
          "Using `def` does not make recursion terminate; the base case and progress do.",
        ],
        explanation: "Termination needs a base case and progress toward it every call.",
      },
      {
        question: "Very deep recursion in Python can raise `RecursionError`. Why?",
        choices: [
          "Each unfinished call takes a stack frame, and Python does not optimize tail calls",
          "Python forbids recursion beyond 10 levels",
          "Recursion is not allowed in Python",
        ],
        answer: 0,
        why: [
          "Correct. Every pending call keeps a frame on the call stack, and since Python does not reuse frames for tail calls, deep recursion can exceed the limit.",
          "The default limit is around a thousand, not ten, and it is about stack depth, not a fixed rule.",
          "Recursion is fully allowed; it just costs stack frames.",
        ],
        explanation: "Each call uses a stack frame; no tail-call optimization means deep recursion can overflow.",
      },
      {
        question: "What is the *base case* of a recursive function?",
        choices: [
          "The smallest case that is answered directly, without recursing further",
          "The first line of the function",
          "The largest possible input",
        ],
        answer: 0,
        why: [
          "Correct. The base case stops the recursion by returning an answer directly, so the chain of calls can unwind.",
          "It is not about line position; it is the condition that returns without another recursive call.",
          "The base case is the *smallest*/simplest case, not the largest.",
        ],
        explanation: "The base case answers the simplest input directly and stops the recursion.",
      },
    ],
    prompt: "Recursively return the sum of all integers in a nested list, where members are integers or nested lists.", fn: "nested_sum", starter: `def nested_sum(values):\n    pass`, solution: `def nested_sum(values):\n    total = 0\n    for value in values:\n        if isinstance(value, list):\n            total += nested_sum(value)\n        else:\n            total += value\n    return total`,
    tests: [t("nested", "assert fn([1, [2, [3]], 4]) == 10"), t("empty", "assert fn([]) == 0"), t("deep", "assert fn([[[5]]]) == 5", true), t("negatives", "assert fn([1, [-2, 3]]) == 2", true)],
  },
  {
    id: "method", module: "py.m8", title: "The interview derivation loop", goal: "Move from examples to a justified algorithm before touching syntax.", kind: "pattern", requires: ["complexity"],
    model: "In an interview, jumping straight to a clever trick usually backfires. This is a repeatable **derivation loop** that turns any problem into a justified solution — and gives you words to explain your thinking out loud:\n1. **Restate** the problem in your own words.\n2. **Work tiny examples** by hand to really understand it.\n3. **Find the brute force** — the obvious, slow solution.\n4. **Locate its repeated work** — what is it recomputing?\n5. **Let the constraints name the target** — input size hints at the complexity you need (n up to 100000 suggests about O(n log n)).\n6. **Choose a data structure that removes the bottleneck** — the repeated work points to it.\n7. **State an invariant** — one fact that stays true each step — before you write code.\n\n```python\n# Pair sum, target t:\n# 1-4  brute force: check every pair          -> O(n^2)\n#      repeated work: re-searching earlier values\n# 6    replacement: a set of seen values       -> O(1) lookup\n# 7    invariant: 'seen' holds exactly the values before this index\n```\n\nThe optimized solution is *derived*, not guessed — every step explains why the next tool exists. That is far more reliable than trying to keyword-match a problem to a memorized pattern.",
    example: `# Pair sum brute force: compare every pair -> O(n^2)\n# Repeated work: searching earlier values\n# Replacement: set membership -> O(1) expected\n# Invariant: seen contains exactly the values before this index`,
    trace: "Walk the pair-sum example through the loop. Brute force compares every pair — O(n^2). The repeated work is re-searching the earlier values each time. That points to a data structure with instant lookup: a **set** of values seen so far, turning each search into O(1). The invariant — 'seen holds exactly the values before the current index' — is what makes the one-pass version provably correct. Nothing here was guessed; each step justified the next.",
    trap: "Matching a pattern from keywords alone is brittle. 'Contiguous subarray' *suggests* a sliding window, but if values can be negative, the window's monotonic-movement assumption breaks. Derive the approach; do not keyword-match it.",
    rule: "Do not announce a pattern until you can say two things: the repeated work it removes, and the invariant that makes it correct.",
    recall: "What are the steps of the derivation loop, and what two statements should justify a chosen data structure?",
    checks: [
      {
        question: "Before announcing \"this is a sliding window,\" you should be able to state…",
        choices: [
          "The repeated work it removes and the invariant that makes it correct",
          "How many lines of code it saves",
          "Which famous problem it came from",
        ],
        answer: 0,
        why: [
          "Correct. A pattern is justified by the repeated work it eliminates and the invariant it maintains — not by keyword-matching the problem.",
          "Line count is irrelevant to whether the approach is correct.",
          "The source problem does not justify the approach; the repeated work and invariant do.",
        ],
        explanation: "Justify a pattern by the repeated work it removes and the invariant it keeps.",
      },
      {
        question: "In the interview derivation method, what comes early — before choosing a clever data structure?",
        choices: [
          "Work tiny examples and find the brute-force solution and its repeated work",
          "Immediately pick a hash map",
          "Start coding the optimized version",
        ],
        answer: 0,
        why: [
          "Correct. Understand the problem on small examples and get a brute force first; its repeated work is what a data structure is chosen to remove.",
          "Jumping to a data structure before understanding the bottleneck is guesswork.",
          "Coding the optimized version before deriving it leads to bugs and dead ends.",
        ],
        explanation: "Examples, then brute force, then find its repeated work, then choose a structure.",
      },
      {
        question: "What role do the problem's constraints (like input size) play?",
        choices: [
          "They hint at the target complexity you need (e.g. n up to 100000 suggests about O(n log n))",
          "They are decoration and can be ignored",
          "They tell you the exact code to write",
        ],
        answer: 0,
        why: [
          "Correct. Input bounds imply how fast your solution must be, which points you toward the right complexity class and approach.",
          "Constraints are a strong signal, not decoration — they often reveal the intended approach.",
          "They suggest the complexity target, not literal code.",
        ],
        explanation: "Constraints imply the target complexity, guiding the approach.",
      },
    ],
    prompt: "Return indices of two distinct values summing to `target`, or `None`. Use one pass and a lookup table.", fn: "pair_sum", starter: `def pair_sum(numbers, target):\n    pass`, solution: `def pair_sum(numbers, target):\n    seen = {}\n    for index, number in enumerate(numbers):\n        needed = target - number\n        if needed in seen:\n            return [seen[needed], index]\n        seen[number] = index\n    return None`,
    tests: [t("pair", "assert fn([2, 7, 11, 15], 9) == [0, 1]"), t("distinct", "assert fn([3, 3], 6) == [0, 1]"), t("none", "assert fn([1, 2], 8) is None", true)],
  },
  {
    id: "hashing", module: "py.m9", title: "Hash maps: remember the past", goal: "Replace repeated lookup with a one-pass table.", kind: "pattern", requires: ["method", "dicts"],
    model: "The **hash-map pattern** is the most common interview trick: instead of re-scanning the same values again and again (slow), you *remember* what you have seen in a dictionary and look it up instantly. A dictionary lookup is about O(1), so this often turns an O(n²) scan into a single O(n) pass.\n\nThe usual moves:\n- **Count by value** — how many times each thing appears.\n- **Index by complement** — for two-sum, store each number so you can instantly ask 'have I seen `target - x`?'\n- **Group by signature** — bucket items that share a key (e.g. sorted letters for anagrams).\n\n```python\n# count how many times each value appears\ncounts = {}\nfor value in [1, 2, 2, 3]:\n    counts[value] = counts.get(value, 0) + 1\nprint(counts)   # {1: 1, 2: 2, 3: 1}\n```\n\nThe skill is choosing **what to store**. Before coding, say it in words: what does a *key* mean, what does a *value* mean, and after visiting index `i`, what does the table contain? Store the wrong fact and you get fast access to useless information.",
    example: `counts = {}\nfor value in [1, 2, 2, 3]:\n    counts[value] = counts.get(value, 0) + 1\nprint(counts)   # {1: 1, 2: 2, 3: 1}`,
    trace: "Starting from an empty `counts`, each value's tally starts at `0` (via `.get(value, 0)`) and goes up by one. For `[1, 2, 2, 3]`: `1` gives `{1: 1}`; `2` gives `{1: 1, 2: 1}`; `2` again gives `{1: 1, 2: 2}`; `3` gives `{1: 1, 2: 2, 3: 1}`. Each lookup and update is about O(1), so the whole count is one O(n) pass instead of rescanning the list for every value.",
    trap: "Storing the wrong fact gives you fast access to useless information. Define the lookup question in words first — what the key means and what the value means — before choosing them.",
    rule: "Before coding a hash-map solution, state three things: the key means ___, the value means ___, and after visiting index `i` the table contains ___.",
    recall: "What three meanings should you define before writing a hash-map solution, and why does it turn repeated scanning into a single pass?",
    checks: [
      {
        question: "What does the hash-map pattern replace?",
        choices: [
          "Repeatedly scanning earlier elements — with one-pass table lookups of about O(1)",
          "Sorting the whole input first",
          "Recursion",
        ],
        answer: 0,
        why: [
          "Correct. Instead of re-scanning prior values, you record what you've seen in a dict and look it up directly, turning O(n²) scanning into about O(n).",
          "Hashing does not require sorting; it trades memory for fast lookups.",
          "It is a table lookup, not recursion.",
        ],
        explanation: "A hash map turns repeated scans for prior values into direct O(1) lookups.",
      },
      {
        question: "Across a loop, what does `counts[value] = counts.get(value, 0) + 1` build?",
        choices: [
          "A count of how many times each value has appeared",
          "A sorted list of the values",
          "The sum of the values",
        ],
        answer: 0,
        why: [
          "Correct. Each value's running count starts at `0` (via `.get`) and increases by one each time it is seen.",
          "It counts occurrences; it does not sort anything.",
          "It counts occurrences per key, not a single total sum.",
        ],
        explanation: "It counts occurrences of each value in one pass.",
      },
      {
        question: "Before coding a hash-map solution, what should you pin down?",
        choices: [
          "What the key means and what the value means (the exact lookup question)",
          "How many lines it will take",
          "The variable names",
        ],
        answer: 0,
        why: [
          "Correct. Storing the wrong fact gives fast access to useless data — define the key/value meaning (the question you'll ask the table) first.",
          "Line count is irrelevant to correctness.",
          "Naming matters least; the lookup question is what determines success.",
        ],
        explanation: "Define what the key and value mean — the lookup question — before coding.",
      },
    ],
    prompt: "Return the first character that occurs exactly once, or `None`.", fn: "first_unique", starter: `def first_unique(text):\n    pass`, solution: `from collections import Counter\n\ndef first_unique(text):\n    counts = Counter(text)\n    return next((char for char in text if counts[char] == 1), None)`,
    tests: [t("first", `assert fn("swiss") == "w"`), t("none", `assert fn("aabb") is None`), t("empty", `assert fn("") is None`)], pattern: "Hash map", tier: "problem", minutes: 12, difficulty: [2, 2, 2],
  },
  {
    id: "two-pointers", module: "py.m9", title: "Two pointers: shrink the search", goal: "Prove which candidates a pointer movement safely discards.", kind: "pattern", requires: ["method", "lists"],
    model: "The **two-pointers pattern** walks a *sorted* (or symmetric) sequence from both ends, moving one pointer at a time to zero in on an answer — provably skipping candidates it can rule out. That elimination is what makes it the pattern, not just two variables.\n\nClassic example: find a pair that sums to a target in a sorted array.\n\n```python\ndef two_sum_sorted(numbers, target):\n    left, right = 0, len(numbers) - 1\n    while left < right:\n        total = numbers[left] + numbers[right]\n        if total < target:\n            left += 1        # too small -> need a bigger value\n        elif total > target:\n            right -= 1       # too big -> need a smaller value\n        else:\n            return (left, right)\n    return None\n\nprint(two_sum_sorted([1, 3, 4, 7], 10))   # (1, 3)  -> 3 + 7\n```\n\nWhy each move is safe: the array is sorted. If the current sum is *too small*, the smallest value (`numbers[left]`) paired with *anything* to its right is still too small — so `left` can never be part of the answer, and advancing it discards only impossible pairs. Symmetrically for too big. It is O(n) because the two pointers together move at most `n` steps.",
    example: `def two_sum_sorted(numbers, target):\n    left, right = 0, len(numbers) - 1\n    while left < right:\n        total = numbers[left] + numbers[right]\n        if total < target:\n            left += 1\n        elif total > target:\n            right -= 1\n        else:\n            return (left, right)\n    return None\n\nprint(two_sum_sorted([1, 3, 4, 7], 10))   # (1, 3)`,
    trace: "For `[1, 3, 4, 7]`, target `10`: `left=0` points at `1`, `right=3` at `7`; total `8` is too small, so `left` advances to index `1` (value `3`). Now `3 + 7 = 10` matches the target, so it returns `(1, 3)`. Each step either advanced `left` or retreated `right`, and because the array is sorted, every skipped pointer position was provably impossible.",
    trap: "Two pointers rely on order (or another monotonic property). On an *unsorted* array, moving a pointer can skip right past the answer, because 'too small, so advance' no longer holds.",
    rule: "For every pointer move, be able to say which candidates it just made impossible, and why the sorted order guarantees that.",
    recall: "Why is advancing `left` safe when the sorted pair sum is too small, and why does the pattern fail on unsorted input?",
    checks: [
      {
        question: "When do two pointers form the actual pattern rather than just two variables?",
        choices: [
          "When each move provably discards candidates using an ordered or monotonic fact",
          "Whenever you have two index variables",
          "Only on unsorted input",
        ],
        answer: 0,
        why: [
          "Correct. The pattern's power comes from a movement rule that safely eliminates possibilities; without that, they are just two loops.",
          "Two index variables alone are not the pattern — the elimination guarantee is.",
          "It usually needs sorted or symmetric input, not unsorted.",
        ],
        explanation: "Two pointers work when a move provably eliminates candidates via an ordered fact.",
      },
      {
        question: "In two-sum on a *sorted* array, the pair sum is too big. Which pointer moves?",
        choices: [
          "Move the right pointer left, to decrease the sum",
          "Move the left pointer right, to increase the sum",
          "Move both toward the middle",
        ],
        answer: 0,
        why: [
          "Correct. Since the array is sorted, moving the right pointer left picks a smaller value, lowering the sum toward the target.",
          "Moving left right would increase the sum, the wrong direction when it is already too big.",
          "You move exactly one pointer, guided by whether the sum is too big or too small.",
        ],
        explanation: "Sorted two-sum: too big means move right pointer left (smaller value).",
      },
      {
        question: "Two pointers usually require the input to be…",
        choices: [
          "Sorted or otherwise ordered/symmetric",
          "Completely random",
          "Stored in a dictionary",
        ],
        answer: 0,
        why: [
          "Correct. The elimination argument relies on order or symmetry, so the input is typically sorted first.",
          "Random order gives no monotonic fact to exploit.",
          "Two pointers walk a sequence by index, not a dictionary.",
        ],
        explanation: "The pattern needs an ordered/symmetric space for its elimination to hold.",
      },
    ],
    prompt: "Given a sorted list, return whether two distinct values sum to `target` in O(n) time and O(1) extra space.", fn: "has_pair_sum", starter: `def has_pair_sum(numbers, target):\n    pass`, solution: `def has_pair_sum(numbers, target):\n    left, right = 0, len(numbers) - 1\n    while left < right:\n        total = numbers[left] + numbers[right]\n        if total == target:\n            return True\n        if total < target:\n            left += 1\n        else:\n            right -= 1\n    return False`,
    tests: [t("yes", "assert fn([1, 2, 4, 7], 6) is True"), t("no", "assert fn([1, 2, 4, 7], 20) is False"), t("distinct", "assert fn([3], 6) is False", true)], pattern: "Two pointers", tier: "problem", minutes: 14, difficulty: [2, 2, 2],
  },
  {
    id: "sliding-window", module: "py.m9", title: "Sliding windows", goal: "Maintain a valid contiguous region without recomputing it.", kind: "pattern", requires: ["two-pointers", "hashing"],
    model: "A **sliding window** tracks a *contiguous* stretch of a list or string and slides it along, keeping some running state. The **right edge** adds a new item; the **left edge** shrinks the window until it is 'valid' again. Because each edge only ever moves *forward*, at most `n` times, the whole thing is O(n) even though it looks like a loop inside a loop.\n\nExample: length of the longest substring with no repeated character.\n\n```python\ndef longest_unique(text):\n    left = 0\n    seen = {}          # char -> its latest index\n    best = 0\n    for right, char in enumerate(text):\n        if char in seen and seen[char] >= left:\n            left = seen[char] + 1     # jump left past the duplicate\n        seen[char] = right\n        best = max(best, right - left + 1)\n    return best\n\nprint(longest_unique(\"abcabcbb\"))   # 3   (\"abc\")\n```\n\nThe key idea: whenever the new character was already inside the current window, move `left` just past its previous position so there is no duplicate again. The window always satisfies its rule — 'no repeated character' — after each step. That maintained fact is the **invariant**.",
    example: `def longest_unique(text):\n    left = 0\n    seen = {}\n    best = 0\n    for right, char in enumerate(text):\n        if char in seen and seen[char] >= left:\n            left = seen[char] + 1\n        seen[char] = right\n        best = max(best, right - left + 1)\n    return best\n\nprint(longest_unique("abcabcbb"))   # 3`,
    trace: "Walk `\"abcabcbb\"`. The window grows `a`, `ab`, `abc` (best `3`). At the next `a` (index 3), `a` was seen at index 0, which is `>= left`, so `left` jumps to `1` and the window becomes `bca`. Each repeat pushes `left` forward, never backward, so the window always holds distinct characters, and `best` records the largest size seen, `3`. Because `left` and `right` each only advance, total work is O(n).",
    trap: "A window needs a validity condition you can *repair by moving one edge*. With arbitrary negative numbers, growing a subarray's sum can *decrease* it, so the usual 'shrink from the left until the sum is small enough' logic breaks — the window pattern does not apply.",
    rule: "Before coding a window, define three things: what makes the window valid, what state you keep to check it, and exactly when the left edge advances.",
    recall: "Why does a sliding window stay O(n) even though it looks like nested loops, and what does the left edge do when the window becomes invalid?",
    checks: [
      {
        question: "What is the total work of a sliding window over n items?",
        choices: [
          "O(n) — each edge advances at most n times overall",
          "O(n²) — the inner loop reruns fully each step",
          "O(log n)",
        ],
        answer: 0,
        why: [
          "Correct. The left and right edges each move forward at most n times across the whole run, so the total is linear even though one loop is nested.",
          "It is not O(n²): the inner edge never resets to the start; it only advances.",
          "It is linear, not logarithmic — there is no halving.",
        ],
        explanation: "Each edge moves at most n times total, so a sliding window is O(n).",
      },
      {
        question: "What is the job of the left edge of the window?",
        choices: [
          "Shrink the window until the invariant holds again",
          "Always move with the right edge in lockstep",
          "Reset to zero each step",
        ],
        answer: 0,
        why: [
          "Correct. The right edge adds new information; the left edge removes from the back until the window is valid again.",
          "The edges move independently, not in lockstep.",
          "Resetting the left edge each step would make it O(n²); it only advances.",
        ],
        explanation: "The left edge contracts the window until the invariant is restored.",
      },
      {
        question: "A sliding window fits problems about…",
        choices: [
          "A contiguous range — a subarray or substring",
          "Any subset of elements, in any order",
          "Sorting the input",
        ],
        answer: 0,
        why: [
          "Correct. The window represents a contiguous stretch, so it fits 'best/valid subarray or substring' questions.",
          "Non-contiguous subsets are not what a window models.",
          "A window does not sort; it slides over a sequence.",
        ],
        explanation: "Sliding windows model a contiguous range (subarray/substring).",
      },
    ],
    prompt: "Return the length of the longest substring containing no repeated character.", fn: "longest_unique", starter: `def longest_unique(text):\n    pass`, solution: `def longest_unique(text):\n    left = 0\n    best = 0\n    latest = {}\n    for right, char in enumerate(text):\n        if char in latest and latest[char] >= left:\n            left = latest[char] + 1\n        latest[char] = right\n        best = max(best, right - left + 1)\n    return best`,
    tests: [t("ordinary", `assert fn("abcabcbb") == 3`), t("same", `assert fn("bbbb") == 1`), t("empty", `assert fn("") == 0`)], pattern: "Sliding window", tier: "problem", minutes: 20, difficulty: [3, 3, 3],
  },
  {
    id: "stack", module: "py.m9", title: "Stacks and unmatched work", goal: "Use LIFO order to resolve the most recent unfinished item.", kind: "pattern", requires: ["method", "lists"],
    model: "A **stack** (last-in, first-out) is the tool when a problem is about **nesting** or the **most-recently-unmatched** thing — like matching brackets. You **push** when something opens, and **pop or inspect the top** when something closes.\n\nExample: are the brackets balanced?\n\n```python\ndef balanced(text):\n    pairs = {\")\": \"(\", \"]\": \"[\", \"}\": \"{\"}\n    stack = []\n    for char in text:\n        if char in \"([{\":\n            stack.append(char)          # an opener waits on the stack\n        elif char in pairs:\n            if not stack or stack[-1] != pairs[char]:\n                return False            # closer doesn't match the most recent opener\n            stack.pop()\n    return not stack                    # valid only if nothing is left open\n\nprint(balanced(\"([]{})\"))   # True\nprint(balanced(\"([)]\"))     # False\n```\n\nWhy the *top* opener is the only legal match: a closer must pair with the most recently opened bracket, because anything opened earlier is blocked by what sits above it. Python lists are perfect stacks — `append` and `pop()` from the end are both O(1).",
    example: `def balanced(text):\n    pairs = {")": "(", "]": "[", "}": "{"}\n    stack = []\n    for char in text:\n        if char in "([{":\n            stack.append(char)\n        elif char in pairs:\n            if not stack or stack[-1] != pairs[char]:\n                return False\n            stack.pop()\n    return not stack\n\nprint(balanced("([]{})"))   # True\nprint(balanced("([)]"))     # False`,
    trace: "For `\"([)]\"`: `(` and `[` are pushed, so `stack` is `['(', '[']`. Then `)` arrives; its match is `(`, but the top of the stack is `[` — mismatch — so it returns `False`. That is correct: `)` should have closed the most recent opener, which was `[`. For `\"([]{})\"`, every closer matches the current top, each pop succeeds, and the stack ends empty, so it returns `True`.",
    trap: "Always check the stack is *nonempty* before reading `stack[-1]` or calling `pop()` — a closing bracket with nothing open should be rejected, not crash.",
    rule: "If the next answer depends on the most-recently-unresolved item, reach for a stack: push on open, match and pop on close.",
    recall: "Why can a closing bracket only match the top (most recent) opener, and what must you check before popping?",
    checks: [
      {
        question: "A stack is the right tool when a problem is about…",
        choices: [
          "Nested structure or the most-recent-unmatched item (last in, first out)",
          "Finding the smallest item quickly",
          "Random access by index",
        ],
        answer: 0,
        why: [
          "Correct. A stack resolves the most recently opened, still-unfinished item first — exactly nesting/matching problems.",
          "That is a heap's job, not a stack's.",
          "A stack only exposes the top; for random access use a list index.",
        ],
        explanation: "Use a stack for nested / nearest-unmatched (LIFO) structure.",
      },
      {
        question: "Matching brackets: what do you push, and when do you pop?",
        choices: [
          "Push each opening bracket; pop when a closing bracket matches the most recent opener",
          "Push closers; pop openers",
          "Push everything and never pop",
        ],
        answer: 0,
        why: [
          "Correct. Openers wait on the stack; a closer must match the top (most recent) opener, which you then pop.",
          "It is the reverse: openers are pushed and matched by closers.",
          "You must pop on each match, or the stack never resolves.",
        ],
        explanation: "Push openers; a closer matches and pops the most recent opener.",
      },
      {
        question: "Using a Python list as a stack, what is the cost of `append` and `pop()` from the end?",
        choices: [
          "O(1) amortized each",
          "O(n) each",
          "O(log n) each",
        ],
        answer: 0,
        why: [
          "Correct. Appending and popping the end of a list are constant-time (amortized), which is why lists make good stacks.",
          "Those end operations are constant, not linear; `pop(0)` from the front is the slow one.",
          "There is no log factor for end operations on a list.",
        ],
        explanation: "List `append` and end-`pop()` are O(1) amortized — ideal for a stack.",
      },
    ],
    prompt: "Return whether a string containing only `()[]{}` is properly balanced.", fn: "balanced", starter: `def balanced(text):\n    pass`, solution: `def balanced(text):\n    pairs = {")": "(", "]": "[", "}": "{"}\n    stack = []\n    for char in text:\n        if char in "([{":\n            stack.append(char)\n        elif not stack or stack.pop() != pairs[char]:\n            return False\n    return not stack`,
    tests: [t("valid", `assert fn("([]{})") is True`), t("crossed", `assert fn("([)]") is False`), t("open", `assert fn("((") is False`), t("empty", `assert fn("") is True`, true)], pattern: "Stack", tier: "problem", minutes: 14, difficulty: [2, 2, 2],
  },
  {
    id: "intervals", module: "py.m9", title: "Intervals and sorted frontiers", goal: "Merge overlapping ranges with one maintained frontier.", kind: "pattern", requires: ["method", "lists", "sorting"],
    model: "The **merge-intervals pattern** combines overlapping ranges. The trick is one line: **sort by start**. Once sorted, an interval can only overlap the *most recent* merged one — so you never compare against everything, just the last output.\n\n```python\ndef merge(intervals):\n    intervals.sort(key=lambda pair: pair[0])   # sort by start\n    merged = [intervals[0]]\n    for start, end in intervals[1:]:\n        last_start, last_end = merged[-1]\n        if start <= last_end:                  # overlaps the current frontier\n            merged[-1] = [last_start, max(last_end, end)]   # extend it\n        else:\n            merged.append([start, end])         # gap -> start a new interval\n    return merged\n\nprint(merge([[1, 3], [2, 6], [8, 10]]))   # [[1, 6], [8, 10]]\n```\n\nWhy comparing with only the last merged interval is enough: after sorting by start, the last merged interval reaches farthest to the right, so if the new one does not touch *it*, it cannot touch any earlier one either.",
    example: `def merge(intervals):\n    intervals.sort(key=lambda pair: pair[0])\n    merged = [intervals[0]]\n    for start, end in intervals[1:]:\n        last_start, last_end = merged[-1]\n        if start <= last_end:\n            merged[-1] = [last_start, max(last_end, end)]\n        else:\n            merged.append([start, end])\n    return merged\n\nprint(merge([[1, 3], [2, 6], [8, 10]]))   # [[1, 6], [8, 10]]`,
    trace: "Sort by start (already sorted here). Start with `merged = [[1, 3]]`. Next is `[2, 6]`: `2 <= 3`, so it overlaps — extend the frontier to `[1, max(3, 6)]`, which is `[1, 6]`. Next is `[8, 10]`: `8 > 6`, a gap, so start a new interval. Result: `[[1, 6], [8, 10]]`. Each interval was compared only against the last merged one, which reaches farthest right.",
    trap: "Decide whether *touching* endpoints count as overlapping. `[1, 3]` and `[3, 5]` merge if intervals are closed (they share `3`), but may not if they are half-open. Pick the rule and make the comparison (`<` vs `<=`) match it.",
    rule: "Sort by the coordinate that makes each new item comparable to a single frontier (usually the start), then merge or extend against just the last output interval.",
    recall: "Why is comparing only with the last merged interval enough after sorting by start, and how do touching endpoints affect the merge test?",
    checks: [
      {
        question: "Why sort intervals by start before merging?",
        choices: [
          "It turns global overlap into a local check against the current merged end",
          "It makes the intervals shorter",
          "It removes duplicates",
        ],
        answer: 0,
        why: [
          "Correct. Once sorted by start, any interval can only overlap the running merged one, so you compare against just the last output.",
          "Sorting reorders intervals; it does not change their lengths.",
          "Sorting does not deduplicate; it enables the single-pass merge.",
        ],
        explanation: "Sorting by start makes overlap a local check against the merged frontier.",
      },
      {
        question: "After sorting by start, two intervals overlap when…",
        choices: [
          "The next interval's start is at or before the current merged end",
          "Their lengths are equal",
          "They have the same start",
        ],
        answer: 0,
        why: [
          "Correct. If the next start is not beyond the current end, the ranges touch and should merge.",
          "Length is irrelevant to overlap.",
          "They need not share a start — only that the next start falls within the current range.",
        ],
        explanation: "Overlap: the next start is ≤ the current merged end.",
      },
      {
        question: "In the single merge pass, each interval either…",
        choices: [
          "Extends the current merged interval's end, or starts a new merged interval",
          "Gets deleted",
          "Splits into two",
        ],
        answer: 0,
        why: [
          "Correct. If it overlaps, extend the current end; otherwise, close the current interval and begin a new one.",
          "Nothing is deleted; every interval joins a merged group.",
          "Intervals merge or start fresh; they are not split.",
        ],
        explanation: "Each interval extends the frontier or opens a new merged interval.",
      },
    ],
    prompt: "Merge overlapping closed intervals and return them sorted. Do not mutate the input.", fn: "merge_intervals", starter: `def merge_intervals(intervals):\n    pass`, solution: `def merge_intervals(intervals):\n    if not intervals:\n        return []\n    ordered = sorted(intervals)\n    merged = [list(ordered[0])]\n    for start, end in ordered[1:]:\n        if start <= merged[-1][1]:\n            merged[-1][1] = max(merged[-1][1], end)\n        else:\n            merged.append([start, end])\n    return merged`,
    tests: [t("overlap", "assert fn([[1, 3], [2, 6], [8, 10]]) == [[1, 6], [8, 10]]"), t("touch", "assert fn([[1, 2], [2, 3]]) == [[1, 3]]"), t("empty", "assert fn([]) == []"), t("no mutation", "data=[[2,3],[1,2]]; fn(data); assert data==[[2,3],[1,2]]", true)], pattern: "Intervals", tier: "problem", minutes: 20, difficulty: [3, 3, 3],
  },
  {
    id: "binary-search", module: "py.m9", title: "Binary search as boundary finding", goal: "Write binary search from a loop invariant instead of memorizing a template.", kind: "pattern", requires: ["method"],
    model: "**Binary search** finds a boundary in a *sorted* space by repeatedly halving it — about O(log n) instead of O(n). The most robust way to think about it: 'find the **first** position where some condition becomes true', using a half-open interval `[low, high)`.\n\n```python\ndef lower_bound(values, target):\n    # first index whose value is >= target\n    low, high = 0, len(values)\n    while low < high:\n        mid = (low + high) // 2\n        if values[mid] < target:\n            low = mid + 1     # mid too small -> answer is to the right\n        else:\n            high = mid        # mid might be the answer -> keep it in range\n    return low\n\nprint(lower_bound([1, 3, 5, 7], 5))   # 2\nprint(lower_bound([1, 3, 5, 7], 4))   # 2  (where 4 would go)\n```\n\nThe interval `[low, high)` always holds the answer. Everything below `low` is proven too small; everything at or above `high` is outside the candidates. Each step drops `mid` from consideration, so the range shrinks and the loop must end. Keeping one clear invariant is what makes binary search bug-free.",
    example: `def lower_bound(values, target):\n    low, high = 0, len(values)\n    while low < high:\n        mid = (low + high) // 2\n        if values[mid] < target:\n            low = mid + 1\n        else:\n            high = mid\n    return low\n\nprint(lower_bound([1, 3, 5, 7], 5))   # 2\nprint(lower_bound([1, 3, 5, 7], 4))   # 2`,
    trace: "Search `[1, 3, 5, 7]` for the first value `>= 5`. `low=0, high=4`, `mid=2` (`5`): not `< 5`, so `high=2`. `low=0, high=2`, `mid=1` (`3`): `3 < 5`, so `low=2`. Now `low == high == 2`, the loop ends, and it returns `2`, the index of `5`. Each step halved the range, giving about log₂(n) steps.",
    trap: "Mixing inclusive and exclusive bounds creates off-by-one loops that never end or skip the answer. Pick one invariant — here, half-open `[low, high)` — and make every update preserve it.",
    rule: "Phrase the task as 'find the first position where condition P becomes true', keep a half-open `[low, high)` that always contains that position, and shrink it each step.",
    recall: "What do `low` and `high` mean in a half-open binary search, and why does each step guarantee progress?",
    checks: [
      {
        question: "Binary search works when the search space has what property?",
        choices: [
          "A predicate that flips false-to-true monotonically across an ordered space",
          "Randomly ordered values",
          "Exactly two elements",
        ],
        answer: 0,
        why: [
          "Correct. If 'is this position good?' turns from false to true just once across a sorted/monotonic space, you can binary-search the boundary.",
          "Random order has no monotonic boundary to find.",
          "It works on any size, not just two elements.",
        ],
        explanation: "Binary search needs a monotonic predicate over an ordered space.",
      },
      {
        question: "Each step of binary search does what to the search space?",
        choices: [
          "Halves it, giving about O(log n) steps",
          "Removes one element, giving O(n) steps",
          "Doubles it",
        ],
        answer: 0,
        why: [
          "Correct. Discarding half each step means only about log₂(n) steps to pin down the boundary.",
          "It discards half, not one element — that is what makes it logarithmic.",
          "It shrinks, never grows, the interval.",
        ],
        explanation: "Halving each step gives O(log n).",
      },
      {
        question: "Why maintain a half-open interval `[low, high)`?",
        choices: [
          "It keeps the invariant clear — the first true position always stays inside — and avoids off-by-one bugs",
          "It is faster than a closed interval",
          "It only works for even-length inputs",
        ],
        answer: 0,
        why: [
          "Correct. A consistent half-open range makes the loop's invariant precise, so you update `low`/`high` without off-by-one mistakes.",
          "Speed is identical; the benefit is correctness/clarity.",
          "It works for any length; parity is irrelevant.",
        ],
        explanation: "A half-open `[low, high)` keeps the invariant clean and avoids off-by-one errors.",
      },
    ],
    prompt: "Return the first index where `values[index] >= target`, or `len(values)` if none.", fn: "lower_bound", starter: `def lower_bound(values, target):\n    pass`, solution: `def lower_bound(values, target):\n    low, high = 0, len(values)\n    while low < high:\n        mid = (low + high) // 2\n        if values[mid] < target:\n            low = mid + 1\n        else:\n            high = mid\n    return low`,
    tests: [t("found", "assert fn([1, 3, 3, 7], 3) == 1"), t("between", "assert fn([1, 3, 7], 5) == 2"), t("past", "assert fn([1, 3], 9) == 2"), t("empty", "assert fn([], 1) == 0", true)], pattern: "Binary search", tier: "problem", minutes: 18, difficulty: [3, 3, 3],
  },
  {
    id: "prefix-sums", module: "py.m9", title: "Prefix sums and range algebra", goal: "Turn repeated range work into subtraction between two cumulative states.", kind: "pattern", requires: ["method", "lists"],
    model: "A **prefix-sum** array lets you get the sum of *any range* in O(1), after an O(n) setup. The idea: `prefix[i]` holds the sum of everything *before* index `i`. Then the sum of a range is just a subtraction.\n\n```python\nvalues = [3, -1, 4, 2]\nprefix = [0]                       # prefix[0] = sum of nothing = 0\nfor value in values:\n    prefix.append(prefix[-1] + value)\n# prefix is now [0, 3, 2, 6, 8]\n\n# sum of values[1:3]  (indices 1 and 2)\nprint(prefix[3] - prefix[1])       # 6 - 3 = 3\n```\n\nWhy it works: `prefix[right]` includes everything up to `right`, and `prefix[left]` includes everything up to `left`. Subtracting cancels the shared front part, leaving exactly the range `[left, right)`. Building the array is one O(n) pass; after that, each range query is a single subtraction. The same idea extends to counts, parity, and 2-D regions.",
    example: `values = [3, -1, 4, 2]\nprefix = [0]\nfor value in values:\n    prefix.append(prefix[-1] + value)\n\nprint(prefix)                # [0, 3, 2, 6, 8]\nprint(prefix[3] - prefix[1]) # 3  (sum of values[1:3])`,
    trace: "Build `prefix` starting at `[0]`: add `3` gives `[0, 3]`; add `-1` gives `[0, 3, 2]`; add `4` gives `[0, 3, 2, 6]`; add `2` gives `[0, 3, 2, 6, 8]`. Now the sum of `values[1:3]` (the `-1` and `4`) is `prefix[3] - prefix[1]`, which is `6 - 3`, which is `3`. Both prefixes included the first element `3`; subtracting cancels it, leaving exactly the range.",
    trap: "Decide whether your range boundaries are inclusive or exclusive *before* writing the indexes. A length-`n` list needs a length-`(n+1)` prefix (with the leading `0`); mixing the two is the classic off-by-one failure.",
    rule: "Start the prefix array with a `0` and use half-open ranges `[left, right)` — then `prefix[right] - prefix[left]` matches Python slicing exactly.",
    recall: "If `prefix[i]` is the sum before index `i`, what expression gives the sum of `[left, right)`, and why start the array with a `0`?",
    checks: [
      {
        question: "With a prefix-sum array built, how fast is any range-sum query?",
        choices: [
          "O(1) — one subtraction of two prefix values",
          "O(n) — you re-add the range each time",
          "O(log n)",
        ],
        answer: 0,
        why: [
          "Correct. After an O(n) setup, each range sum is a single subtraction, so queries are constant time.",
          "Re-adding each range would be the slow approach prefix sums exist to replace.",
          "There is no log factor — it is a direct subtraction.",
        ],
        explanation: "Prefix sums answer any range sum in O(1) after O(n) setup.",
      },
      {
        question: "If `prefix[i]` is the sum of values before index `i`, the sum of `[left, right)` is…",
        choices: [
          "`prefix[right] - prefix[left]`",
          "`prefix[right] + prefix[left]`",
          "`prefix[right - left]`",
        ],
        answer: 0,
        why: [
          "Correct. Subtracting the sum-before-left from the sum-before-right leaves exactly the values in the range.",
          "Adding them double-counts; you must subtract.",
          "Indexing by the difference has no meaning here — subtract the two prefixes.",
        ],
        explanation: "Range `[left, right)` = `prefix[right] - prefix[left]`.",
      },
      {
        question: "When is a prefix-sum array most worth building?",
        choices: [
          "When you make many range-sum queries over a fixed array",
          "For a single sum of the whole array",
          "When the array changes on every query",
        ],
        answer: 0,
        why: [
          "Correct. The O(n) setup pays off across many O(1) queries; that is the whole point.",
          "For one total sum, a plain `sum()` is simpler — no prefix array needed.",
          "If the array keeps changing, a plain prefix array goes stale; that needs a different structure.",
        ],
        explanation: "Prefix sums shine for many range queries over a fixed array.",
      },
    ],
    prompt: "Given `[left, right]` inclusive queries, return every range sum after one preprocessing pass.", fn: "range_sums", starter: `def range_sums(values, queries):\n    pass`, solution: `def range_sums(values, queries):\n    prefix = [0]\n    for value in values:\n        prefix.append(prefix[-1] + value)\n    return [prefix[right + 1] - prefix[left] for left, right in queries]`,
    tests: [t("ranges", "assert fn([3,-1,4,2], [[0,1],[1,3],[2,2]]) == [2,5,4]"), t("none", "assert fn([1,2], []) == []"), t("single", "assert fn([7], [[0,0]]) == [7]")], pattern: "Prefix sum", tier: "problem", minutes: 15, difficulty: [3, 2, 3],
  },
  {
    id: "monotonic-stack", module: "py.m9", title: "Monotonic stacks and next boundaries", goal: "Resolve each item when the first stronger future value appears.", kind: "pattern", requires: ["stack"],
    model: "A **monotonic stack** keeps a stack of *unresolved* items in sorted order, and resolves them the moment a new value breaks that order. It is the go-to for 'next greater element' style problems, and it is O(n) because each index is pushed and popped exactly once.\n\n```python\ndef next_greater(values):\n    result = [-1] * len(values)\n    stack = []          # indices whose 'next greater' is still unknown\n    for index, value in enumerate(values):\n        while stack and values[stack[-1]] < value:\n            result[stack.pop()] = value   # this value is their answer\n        stack.append(index)\n    return result\n\nprint(next_greater([2, 1, 3]))   # [3, 3, -1]\n```\n\nThe stack holds indices still waiting for a bigger value to appear. When the current `value` is bigger than what a waiting index points to, it *is* that index's answer, so you pop and record it. Every index enters and leaves the stack once, so even with the inner `while`, total work is linear — not O(n²).",
    example: `def next_greater(values):\n    result = [-1] * len(values)\n    stack = []\n    for index, value in enumerate(values):\n        while stack and values[stack[-1]] < value:\n            result[stack.pop()] = value\n        stack.append(index)\n    return result\n\nprint(next_greater([2, 1, 3]))   # [3, 3, -1]`,
    trace: "For `[2, 1, 3]`: push index 0 (`2`). Next value `1` is not greater than `2`, so push index 1 (`1`); the stack is `[0, 1]`. Next value `3`: it is greater than `values[1]=1`, so pop index 1 and set `result[1]=3`; still greater than `values[0]=2`, so pop index 0 and set `result[0]=3`. Push index 2. Index 2 (`3`) never gets a greater value, so `result[2]` stays `-1`. Result: `[3, 3, -1]`. Each index was pushed once and popped once — O(n).",
    trap: "Store *indices* on the stack, not just values, when you need to know *where* each answer belongs (or the distance to it). Storing only the values loses the positions you need to fill in.",
    rule: "Define exactly what an item on the stack is *waiting for* (e.g. 'a greater value to its right') and the event that resolves it — then each item is pushed and popped once for O(n).",
    recall: "Why can the inner `while` loop pop many items without making the algorithm O(n²), and why store indices rather than values?",
    checks: [
      {
        question: "What does a monotonic stack keep?",
        choices: [
          "Unresolved candidates in sorted (monotonic) order",
          "Every element ever seen, in input order",
          "Only the maximum element",
        ],
        answer: 0,
        why: [
          "Correct. It holds items still waiting for their answer, maintained in increasing or decreasing order.",
          "It discards items that can no longer be the answer, so it does not keep everything.",
          "It keeps a monotonic run of candidates, not just one value.",
        ],
        explanation: "A monotonic stack holds unresolved candidates in sorted order.",
      },
      {
        question: "When a new value breaks the stack's order, what happens?",
        choices: [
          "It resolves (pops) one or more waiting candidates whose answer is now known",
          "The whole stack is cleared",
          "The new value is discarded",
        ],
        answer: 0,
        why: [
          "Correct. The new value is the answer those popped candidates were waiting for (e.g. next greater element), so they are resolved and removed.",
          "Only the items that violate the order are popped, not the entire stack.",
          "The new value is usually pushed after resolving others, not discarded.",
        ],
        explanation: "A violating value pops and resolves the candidates it answers.",
      },
      {
        question: "Why is a monotonic stack O(n) despite its inner while loop?",
        choices: [
          "Each index is pushed once and popped once, so total pops are at most n",
          "The inner loop never runs",
          "It sorts first in O(n log n)",
        ],
        answer: 0,
        why: [
          "Correct. Across the whole run every index enters and leaves the stack a single time, bounding total work at O(n).",
          "The inner loop does run; it just cannot pop more than n items in total.",
          "No sorting happens; the linear bound comes from the once-in, once-out accounting.",
        ],
        explanation: "Each index is pushed and popped once, so the total is O(n).",
      },
    ],
    prompt: "Return the next strictly greater value to the right for each position, or `-1` when none exists.", fn: "next_greater", starter: `def next_greater(values):\n    pass`, solution: `def next_greater(values):\n    result = [-1] * len(values)\n    stack = []\n    for index, value in enumerate(values):\n        while stack and values[stack[-1]] < value:\n            result[stack.pop()] = value\n        stack.append(index)\n    return result`,
    tests: [t("ordinary", "assert fn([2,1,2,4,3]) == [4,2,4,-1,-1]"), t("decreasing", "assert fn([3,2,1]) == [-1,-1,-1]"), t("duplicates", "assert fn([2,2,3]) == [3,3,-1]")], pattern: "Monotonic stack", tier: "problem", minutes: 18, difficulty: [4, 3, 4],
  },
  {
    id: "topological-sort", module: "py.m10", title: "Topological order and dependency graphs", goal: "Produce a valid dependency order or prove a directed cycle exists.", kind: "pattern", requires: ["graphs", "iteration-tools", "aggregation-tools"],
    model: "Some tasks must happen before others: you can't take Algebra 2 before Algebra 1. A **topological order** is a lineup of all the tasks where every prerequisite comes before the thing that needs it. It only exists if there are no circular dependencies — if A needs B and B needs A, no lineup can satisfy both.\n\nThe cleanest way to build one is **Kahn's algorithm**, built on a single idea: *indegree* = how many unfinished prerequisites a task still has. A task with indegree 0 is *ready* — nothing is blocking it.\n\n```python\nfrom collections import deque\n\ndef order(count, edges):        # edges are [before, after]\n    graph = [[] for _ in range(count)]\n    indegree = [0] * count\n    for before, after in edges:\n        graph[before].append(after)   # before unlocks after\n        indegree[after] += 1          # after has one more prereq\n\n    ready = deque(i for i in range(count) if indegree[i] == 0)\n    result = []\n    while ready:\n        node = ready.popleft()        # a task with no blockers\n        result.append(node)\n        for nxt in graph[node]:       # finishing it unblocks others\n            indegree[nxt] -= 1\n            if indegree[nxt] == 0:    # now nothing blocks nxt\n                ready.append(nxt)\n    return result if len(result) == count else []\n\nprint(order(3, [[0, 1], [1, 2]]))   # [0, 1, 2]\nprint(order(2, [[0, 1], [1, 0]]))   # []  (they need each other)\n```\n\nYou repeatedly take a ready task, finish it, and lower the indegree of everything it unlocked — which may make *those* ready. The genius is cycle detection for free: if you finish fewer than all `count` tasks, the leftovers are trapped in a loop, so you return `[]`.",
    example: `from collections import deque\n\ndef order(count, edges):\n    graph = [[] for _ in range(count)]\n    indegree = [0] * count\n    for before, after in edges:\n        graph[before].append(after)\n        indegree[after] += 1\n    ready = deque(i for i in range(count) if indegree[i] == 0)\n    result = []\n    while ready:\n        node = ready.popleft()\n        result.append(node)\n        for nxt in graph[node]:\n            indegree[nxt] -= 1\n            if indegree[nxt] == 0:\n                ready.append(nxt)\n    return result if len(result) == count else []\n\nprint(order(3, [[0, 1], [1, 2]]))   # [0, 1, 2]`,
    trace: "For `count=3`, edges `[[0,1],[1,2]]`: indegree is `[0, 1, 1]` — only task 0 has no prerequisites, so `ready = [0]`. Pop 0, append to result; it unlocks task 1, whose indegree drops to 0, so push 1. Pop 1, append; it unlocks task 2, indegree drops to 0, push 2. Pop 2, append. Result is `[0, 1, 2]` and its length equals `count`, so it is valid. For the cycle `[[0,1],[1,0]]`, indegree is `[1, 1]` — nothing starts ready, the queue is empty immediately, result length 0 is less than count, so we return `[]`.",
    trap: "Edge direction carries meaning. Decide up front whether `[a, b]` means 'a before b' or 'a depends on b', then build both `graph` and `indegree` to match. Getting this backwards produces a reversed or empty order.",
    rule: "'Ready' means zero remaining prerequisites (indegree 0). Comparing how many tasks you processed against the total is what proves the order covered everything — a shortfall means a cycle.",
    recall: "After the ready queue empties, some tasks are still unprocessed. What does that leftover tell you about the graph, and what should the function return?",
    checks: [
      {
        question: "A topological order exists for which graphs?",
        choices: [
          "Directed acyclic graphs (no cycle)",
          "Any graph at all",
          "Only fully connected graphs",
        ],
        answer: 0,
        why: [
          "Correct. If there is a cycle, no ordering can put every prerequisite before its dependent, so a topo order needs a DAG.",
          "A graph with a cycle has no valid topological order.",
          "Connectivity is irrelevant; acyclicity is the requirement.",
        ],
        explanation: "Topological order exists exactly for directed acyclic graphs.",
      },
      {
        question: "In Kahn's algorithm, which node do you remove next?",
        choices: [
          "A node with zero indegree — all its prerequisites are done",
          "The node with the most edges",
          "A random unvisited node",
        ],
        answer: 0,
        why: [
          "Correct. A zero-indegree node has nothing left blocking it, so it is ready; removing it exposes newly ready nodes.",
          "Edge count does not determine readiness; indegree zero does.",
          "It must be a ready (indegree-zero) node, not an arbitrary one.",
        ],
        explanation: "Kahn repeatedly removes a zero-indegree (ready) node.",
      },
      {
        question: "The ready queue empties but some nodes remain unprocessed. What does that mean?",
        choices: [
          "There is a cycle — those nodes can never all become ready, so no topo order exists",
          "The algorithm has a bug",
          "The graph is empty",
        ],
        answer: 0,
        why: [
          "Correct. Leftover nodes are stuck waiting on each other in a cycle, which is exactly how Kahn detects a cycle.",
          "It is not a bug; it is the cycle-detection result.",
          "Leftover nodes mean the graph was non-empty and cyclic.",
        ],
        explanation: "Leftover nodes after the queue empties signal a cycle (no valid order).",
      },
    ],
    prompt: "Edges `[before, after]` describe dependencies. Return one valid order of `0..count-1`, or `[]` if impossible.", fn: "dependency_order", starter: `def dependency_order(count, edges):\n    pass`, solution: `from collections import deque\n\ndef dependency_order(count, edges):\n    graph = [[] for _ in range(count)]\n    indegree = [0] * count\n    for before, after in edges:\n        graph[before].append(after)\n        indegree[after] += 1\n    ready = deque(i for i, degree in enumerate(indegree) if degree == 0)\n    order = []\n    while ready:\n        node = ready.popleft()\n        order.append(node)\n        for neighbor in graph[node]:\n            indegree[neighbor] -= 1\n            if indegree[neighbor] == 0:\n                ready.append(neighbor)\n    return order if len(order) == count else []`,
    tests: [t("chain", "assert fn(3, [[0,1],[1,2]]) == [0,1,2]"), t("cycle", "assert fn(2, [[0,1],[1,0]]) == []"), t("valid branching", "r=fn(4, [[0,2],[1,2],[2,3]]); assert set(r)=={0,1,2,3} and r.index(2)>r.index(0) and r.index(2)>r.index(1)", true)], pattern: "Topological sort", tier: "problem", minutes: 22, difficulty: [4, 4, 4],
  },
  {
    id: "union-find", module: "py.m10", title: "Union-find and dynamic connectivity", goal: "Merge components and answer connectivity without traversing the graph again.", kind: "pattern", requires: ["graphs", "iteration-tools"],
    model: "**Union-find** (also called disjoint-set) answers one question fast: *are these two things in the same group?* Picture people forming friend-circles. Every circle picks one person as its *leader* (the **root**). To check if two people are in the same circle, you find each one's leader and see if it is the same person.\n\nYou store this as a `parent` list: `parent[x]` is who x points to on the way up to the leader. A leader points to itself.\n\n```python\nparent = list(range(5))   # [0, 1, 2, 3, 4] — everyone is their own leader\n\ndef find(x):              # climb to the leader of x's group\n    while x != parent[x]:\n        parent[x] = parent[parent[x]]   # shortcut: point to grandparent\n        x = parent[x]\n    return x\n\ndef union(a, b):          # merge a's group with b's group\n    parent[find(a)] = find(b)   # point one leader at the other\n\nunion(0, 1)\nunion(1, 2)\nprint(find(0) == find(2))   # True  — 0 and 2 share a leader now\nprint(find(0) == find(4))   # False — 4 is still alone\n```\n\nTwo cheap tricks make this almost instant even over millions of operations. **Path compression** — the `parent[x] = parent[parent[x]]` line — flattens the chain as you climb, so next time is shorter. **Union by size** attaches the smaller group under the bigger one so the tree never gets tall. Together, each operation is effectively O(1).",
    example: `parent = list(range(5))\n\ndef find(x):\n    while x != parent[x]:\n        parent[x] = parent[parent[x]]\n        x = parent[x]\n    return x\n\ndef union(a, b):\n    parent[find(a)] = find(b)\n\nunion(0, 1)\nunion(1, 2)\nprint(find(0) == find(2))   # True\nprint(find(0) == find(4))   # False`,
    trace: "Start `parent = [0,1,2,3,4]`, everyone their own leader. `union(0, 1)`: `find(0)`=0, `find(1)`=1, set `parent[0]=1` → `[1,1,2,3,4]`, so 1 leads {0,1}. `union(1, 2)`: `find(1)`=1, `find(2)`=2, set `parent[1]=2` → `[1,2,2,3,4]`, so 2 leads {0,1,2}. Now `find(0)`: 0 points to 1, 1 points to 2, 2 is its own leader → returns 2. `find(2)`=2, equal, so `find(0)==find(2)` is True. But `find(4)`=4, different, so `find(0)==find(4)` is False.",
    trap: "Never attach a raw node directly — always attach one *root* under another. Writing `parent[a] = b` instead of `parent[find(a)] = find(b)` can silently break which group a whole subtree belongs to.",
    rule: "A root is the identity of a group; only roots get merged; use group size to decide which root attaches under which so the trees stay shallow.",
    recall: "What are the two optimizations that keep the parent trees flat, and which line of `find` performs the flattening?",
    checks: [
      {
        question: "What question does union-find (disjoint-set) answer efficiently?",
        choices: [
          "Are these two items in the same connected group? (and merge groups)",
          "What is the shortest path between two nodes?",
          "What is the sorted order of the items?",
        ],
        answer: 0,
        why: [
          "Correct. It tracks which component each item belongs to, answering connectivity and merging groups near-instantly.",
          "Shortest paths need BFS/Dijkstra; union-find only tracks membership.",
          "It does not sort; it groups.",
        ],
        explanation: "Union-find answers connectivity and merges components fast.",
      },
      {
        question: "What do `find` and `union` do?",
        choices: [
          "`find` follows parent links to the root; `union` attaches one root under another",
          "`find` sorts; `union` deletes",
          "`find` prints; `union` copies",
        ],
        answer: 0,
        why: [
          "Correct. Each set is identified by a root; `find` walks up to it, and `union` joins two sets by linking roots.",
          "Neither sorts nor deletes; they navigate and merge trees.",
          "They manipulate the parent structure, not print or copy.",
        ],
        explanation: "`find` walks to the root; `union` links two roots.",
      },
      {
        question: "Which two optimizations keep union-find nearly O(1) per operation?",
        choices: [
          "Path compression and union by size (or rank)",
          "Sorting and binary search",
          "Caching and recursion",
        ],
        answer: 0,
        why: [
          "Correct. Path compression flattens trees during `find`, and union by size keeps them shallow, giving near-constant amortized operations.",
          "Sorting/binary search are unrelated to union-find's structure.",
          "Those are general techniques, not the two that flatten disjoint-set trees.",
        ],
        explanation: "Path compression + union by size make operations effectively constant.",
      },
    ],
    prompt: "Return the number of connected components among `count` numbered vertices after adding all undirected edges.", fn: "component_count", starter: `def component_count(count, edges):\n    pass`, solution: `def component_count(count, edges):\n    parent = list(range(count))\n    size = [1] * count\n    def find(node):\n        while node != parent[node]:\n            parent[node] = parent[parent[node]]\n            node = parent[node]\n        return node\n    components = count\n    for left, right in edges:\n        a, b = find(left), find(right)\n        if a == b:\n            continue\n        if size[a] < size[b]:\n            a, b = b, a\n        parent[b] = a\n        size[a] += size[b]\n        components -= 1\n    return components`,
    tests: [t("two", "assert fn(5, [[0,1],[1,2],[3,4]]) == 2"), t("all", "assert fn(3, [[0,1],[1,2],[0,2]]) == 1"), t("none", "assert fn(4, []) == 4")], pattern: "Union find", tier: "problem", minutes: 22, difficulty: [4, 4, 4],
  },
  {
    id: "shortest-paths", module: "py.m11", title: "Shortest paths and frontier choice", goal: "Choose BFS, Dijkstra, or another shortest-path method from edge costs.", kind: "pattern", requires: ["graphs", "heap"],
    model: "'Shortest path' means the cheapest way from a start node to the others. Which tool you reach for depends entirely on **what the edges cost**.\n\nWhen every edge costs the same (say, one step each), plain **BFS** already gives shortest paths for free. Because BFS spreads outward one ring at a time, the *first* time it reaches a node is guaranteed to be along the fewest edges — and fewest edges means cheapest when all edges are equal.\n\n```python\nfrom collections import deque\n\ndef distances(graph, start):\n    distance = {start: 0}          # start is 0 steps from itself\n    queue = deque([start])\n    while queue:\n        node = queue.popleft()\n        for neighbor in graph.get(node, []):\n            if neighbor not in distance:        # first time reached = shortest\n                distance[neighbor] = distance[node] + 1\n                queue.append(neighbor)\n    return distance\n\ngraph = {\"a\": [\"b\", \"c\"], \"b\": [\"d\"], \"c\": [\"d\"], \"d\": []}\nprint(distances(graph, \"a\"))   # {'a': 0, 'b': 1, 'c': 1, 'd': 2}\n```\n\nWhen edges have *different* costs (roads of different lengths), BFS is wrong — going through more edges can be cheaper. Then you use **Dijkstra**, which is BFS with a min-heap instead of a plain queue: it always finalizes the closest unfinished node next, which is provably correct as long as no edge is negative. If some edge cost is *negative*, even Dijkstra breaks (a later cheap edge could improve a node you already 'finished'), and you need Bellman-Ford instead.",
    example: `from collections import deque\n\ndef distances(graph, start):\n    distance = {start: 0}\n    queue = deque([start])\n    while queue:\n        node = queue.popleft()\n        for neighbor in graph.get(node, []):\n            if neighbor not in distance:\n                distance[neighbor] = distance[node] + 1\n                queue.append(neighbor)\n    return distance\n\ngraph = {"a": ["b", "c"], "b": ["d"], "c": ["d"], "d": []}\nprint(distances(graph, "a"))   # {'a': 0, 'b': 1, 'c': 1, 'd': 2}`,
    trace: "For the graph above from `a`: `distance = {a: 0}`, queue `[a]`. Pop `a`; reach `b` and `c` for the first time, set both to `0 + 1` = 1, queue `[b, c]`. Pop `b`; reach `d`, set it to `1 + 1` = 2, queue `[c, d]`. Pop `c`; its neighbor `d` is already in `distance`, so skip — `d` keeps its shortest 2, not a second longer value. Pop `d`; no neighbors. Result `{a: 0, b: 1, c: 1, d: 2}`. Each node's first discovery stuck because every ring of the queue uses fewer edges than the next.",
    trap: "BFS finding shortest paths is NOT because it visits everything — it is because it processes nodes in order of edge count. That only equals cheapest cost when every edge costs the same. The moment edge costs vary, switch to Dijkstra.",
    rule: "Equal edge costs → a plain queue (BFS). Nonnegative but varying costs → a min-heap (Dijkstra). Any negative edge → neither; use Bellman-Ford.",
    recall: "Why is the very first time BFS reaches a node guaranteed to be along the shortest path, and why does that guarantee fail once edge costs differ?",
    checks: [
      {
        question: "When does plain BFS find shortest paths?",
        choices: [
          "When every edge has the same cost — distance equals edge count",
          "For any edge costs, including negative",
          "Only on trees",
        ],
        answer: 0,
        why: [
          "Correct. With equal edge weights, processing by number of edges is exactly processing by distance, so first discovery is shortest.",
          "Varying or negative costs break the equal-cost assumption BFS relies on.",
          "BFS shortest paths work on general graphs with equal weights, not just trees.",
        ],
        explanation: "BFS gives shortest paths when all edges cost the same.",
      },
      {
        question: "For nonnegative but *varying* edge costs, which algorithm fits?",
        choices: [
          "Dijkstra, using a min-heap to always finalize the nearest unfinished node",
          "Plain BFS",
          "Depth-first search",
        ],
        answer: 0,
        why: [
          "Correct. Dijkstra pops the closest node from a min-heap, which is provably final when costs are nonnegative.",
          "Plain BFS assumes equal weights, so it fails with varying costs.",
          "DFS does not find shortest paths by cost.",
        ],
        explanation: "Dijkstra (min-heap) handles nonnegative varying edge costs.",
      },
      {
        question: "What breaks Dijkstra?",
        choices: [
          "Negative edge weights — they need a different algorithm",
          "Too many nodes",
          "Undirected edges",
        ],
        answer: 0,
        why: [
          "Correct. A negative edge can improve an already-finalized node, violating Dijkstra's core assumption; use Bellman-Ford instead.",
          "Node count affects speed, not correctness.",
          "Dijkstra handles undirected graphs fine.",
        ],
        explanation: "Negative edges break Dijkstra; they need a different algorithm.",
      },
    ],
    prompt: "Return a dictionary of shortest unweighted distances from `start` in an adjacency dictionary.", fn: "unweighted_distances", starter: `def unweighted_distances(graph, start):\n    pass`, solution: `from collections import deque\n\ndef unweighted_distances(graph, start):\n    distance = {start: 0}\n    queue = deque([start])\n    while queue:\n        node = queue.popleft()\n        for neighbor in graph.get(node, []):\n            if neighbor not in distance:\n                distance[neighbor] = distance[node] + 1\n                queue.append(neighbor)\n    return distance`,
    tests: [t("layers", "g={'a':['b','c'],'b':['d'],'c':['d'],'d':[]}; assert fn(g,'a') == {'a':0,'b':1,'c':1,'d':2}"), t("unreachable omitted", "assert fn({'a':[],'z':[]}, 'a') == {'a':0}"), t("missing start", "assert fn({}, 'x') == {'x':0}")], pattern: "Shortest path", tier: "problem", minutes: 18, difficulty: [3, 3, 3],
  },
  {
    id: "grid-dp", module: "py.m11", title: "Two-dimensional dynamic programming", goal: "Compress a grid recurrence after proving which neighboring states it needs.", kind: "pattern", requires: ["recursion", "complexity", "iteration-tools"],
    model: "**Two-dimensional dynamic programming** solves problems where an answer depends on *two* coordinates — a cell `(row, col)` in a grid, or a pair of positions in two strings. You fill a table so that when you compute a cell, the cells it depends on are already done.\n\nClassic example: how many ways can a robot walk from the top-left to the bottom-right of a grid, moving only right or down? A cell can only be entered from *above* or from the *left*, so the number of paths to it is the sum of those two neighbors:\n\n```python\ndef grid_paths(rows, cols):\n    # dp[r][c] = number of ways to reach cell (r, c)\n    dp = [[1] * cols for _ in range(rows)]   # top row & left col = 1 way\n    for r in range(1, rows):\n        for c in range(1, cols):\n            dp[r][c] = dp[r - 1][c] + dp[r][c - 1]   # from above + from left\n    return dp[rows - 1][cols - 1]\n\nprint(grid_paths(3, 3))   # 6\n```\n\nOnce that full table is correct, you can often **compress** it. Notice each cell only needs the row above and the cell to its left — so a single row you overwrite left-to-right is enough:\n\n```python\ndef grid_paths_1d(rows, cols):\n    dp = [1] * cols\n    for _ in range(1, rows):\n        for c in range(1, cols):\n            dp[c] += dp[c - 1]   # old dp[c]=from above, new dp[c-1]=from left\n    return dp[cols - 1]\n\nprint(grid_paths_1d(3, 3))   # 6\n```\n\nBut compress only *after* the recurrence is proven correct — the loop direction is now load-bearing.",
    example: `def grid_paths_1d(rows, cols):\n    dp = [1] * cols\n    for _ in range(1, rows):\n        for c in range(1, cols):\n            dp[c] += dp[c - 1]\n    return dp[cols - 1]\n\nprint(grid_paths_1d(3, 3))   # 6`,
    trace: "For a 3x3 grid, start `dp = [1, 1, 1]` (the top row: one way to reach each). First inner pass (second grid row), `c=1`: `dp[1] += dp[0]` → `1 + 1` = 2; `c=2`: `dp[2] += dp[1]` → `1 + 2` = 3, giving `[1, 2, 3]`. At the moment of update, `dp[c]` still holds the count from the row above and `dp[c-1]` already holds this row's count from the left — their sum is correct. Second inner pass (third row): `dp[1] = 2 + 1` = 3, `dp[2] = 3 + 3` = 6, giving `[1, 3, 6]`. Answer `dp[2]` = 6.",
    trap: "In the compressed version the loop direction is part of the algorithm. Running the inner loop the wrong way reads a slot that has already been overwritten for the current row, mixing states and giving wrong counts.",
    rule: "Write the full two-dimensional state and recurrence first and get it correct. Only compress a dimension once you can name exactly what each slot means right before and right after the update.",
    recall: "In the compressed one-row version, at the moment `dp[c] += dp[c - 1]` runs, what does `dp[c]` still represent and what does `dp[c - 1]` already represent?",
    checks: [
      {
        question: "Two-dimensional DP fits problems whose state is…",
        choices: [
          "Two independent coordinates — like two string positions or a grid cell",
          "Always a single number",
          "Unrelated to position",
        ],
        answer: 0,
        why: [
          "Correct. A 2D table indexes by two coordinates, one per dimension of the state.",
          "A single number is 1D DP; this is for two-coordinate states.",
          "The state is exactly the two positions/coordinates.",
        ],
        explanation: "2D DP handles states with two independent coordinates.",
      },
      {
        question: "Why does the fill order of the DP table matter?",
        choices: [
          "Every cell must be computed only after the cells it depends on are already done",
          "It changes the answer randomly",
          "It only affects variable names",
        ],
        answer: 0,
        why: [
          "Correct. A recurrence reads neighboring cells, so you must fill in an order that has those dependencies ready first.",
          "A correct order gives a deterministic answer, not a random one.",
          "It affects correctness, not naming.",
        ],
        explanation: "Fill the table so each cell's dependencies are already computed.",
      },
      {
        question: "In the one-row (space-compressed) version, before you overwrite it, what is `dp[col]`?",
        choices: [
          "The value from the *previous* row at this column (the update reuses it as the 'up' neighbor)",
          "Always zero",
          "The final answer",
        ],
        answer: 0,
        why: [
          "Correct. `dp[col]` still holds last row's value until you overwrite it, so it serves as the up-neighbor while `dp[col-1]` is the already-updated left neighbor.",
          "It is not reset to zero between rows; it carries the prior row's value.",
          "It is an intermediate value, not the final answer, until the last row.",
        ],
        explanation: "In one-row DP, `dp[col]` is the previous row's value until overwritten.",
      },
    ],
    prompt: "A robot moves only right or down. Return the number of paths through a `rows × columns` empty grid.", fn: "grid_paths", starter: `def grid_paths(rows, columns):\n    pass`, solution: `def grid_paths(rows, columns):\n    if rows <= 0 or columns <= 0:\n        return 0\n    dp = [1] * columns\n    for _ in range(1, rows):\n        for col in range(1, columns):\n            dp[col] += dp[col - 1]\n    return dp[-1]`,
    tests: [t("three by seven", "assert fn(3,7) == 28"), t("one row", "assert fn(1,5) == 1"), t("square", "assert fn(3,3) == 6"), t("empty", "assert fn(0,4) == 0")], pattern: "2D dynamic programming", tier: "problem", minutes: 18, difficulty: [3, 3, 3],
  },
  {
    id: "heap", module: "py.m10", title: "Heaps and top-k", goal: "Maintain the smallest or largest frontier without sorting everything.", kind: "pattern", requires: ["method", "lists"],
    model: "A **heap** is a clever list that always keeps its *smallest* item at the front, position 0, and quietly rearranges itself in O(log n) whenever you add or remove something. It is NOT fully sorted — only the front is guaranteed to be the minimum. Think of it as a bucket that will always hand you the smallest thing on demand, cheaply.\n\nPython's `heapq` module turns a plain list into a heap:\n\n```python\nimport heapq\n\nheap = []\nheapq.heappush(heap, 5)\nheapq.heappush(heap, 1)\nheapq.heappush(heap, 3)\nprint(heap[0])           # 1  <- always the smallest\nprint(heapq.heappop(heap))  # 1  <- remove and return the smallest\nprint(heap[0])           # 3  <- next smallest bubbles up\n```\n\nHere is the trick that trips people up but is worth learning cold. To keep the **k largest** values from a stream, you use a **min-heap of size k**. Why the *min*-heap? Because its front holds the *smallest of your current winners* — exactly the one to kick out when a bigger value shows up:\n\n```python\nimport heapq\n\ndef k_largest(values, k):\n    heap = []\n    for value in values:\n        heapq.heappush(heap, value)\n        if len(heap) > k:        # too many winners\n            heapq.heappop(heap)  # drop the weakest (the front)\n    return heap                  # the k biggest, in no special order\n\nprint(sorted(k_largest([3, 2, 1, 5, 6, 4], 3)))   # [4, 5, 6]\n```\n\nEach push or pop costs O(log k), so scanning n items to keep the top k is O(n log k) — far cheaper than sorting all n when k is small.",
    example: `import heapq\n\ndef k_largest(values, k):\n    heap = []\n    for value in values:\n        heapq.heappush(heap, value)\n        if len(heap) > k:\n            heapq.heappop(heap)\n    return heap\n\nprint(sorted(k_largest([3, 2, 1, 5, 6, 4], 3)))   # [4, 5, 6]`,
    trace: "Keep the 3 largest of `[3, 2, 1, 5, 6, 4]`. Push 3, 2, 1 — heap holds `{1, 2, 3}`, front is `1`. Push 5: heap has 4 items, too many, so pop the front `1`; heap is `{2, 3, 5}`. Push 6: pop front `2`; heap is `{3, 5, 6}`. Push 4: pop front `3`; heap is `{4, 5, 6}`. Every time the pile grew past 3, we removed its smallest — so the survivors are always the biggest values seen so far.",
    trap: "Do not read `heap[1]`, `heap[2]`, and so on expecting sorted order. Only `heap[0]` (the front) is guaranteed to be the minimum; the rest are only loosely arranged.",
    rule: "Reach for a heap whenever you repeatedly need the next smallest or largest item, or want to hold a bounded 'best k' frontier without sorting everything.",
    recall: "Why does a size-k *min*-heap (not a max-heap) naturally keep the k largest items — what is special about the value sitting at its front?",
    checks: [
      {
        question: "What does a binary heap give you?",
        choices: [
          "The smallest item at the top, with O(log n) push and pop — but not a fully sorted order",
          "A fully sorted list at all times",
          "O(1) access to any element by index",
        ],
        answer: 0,
        why: [
          "Correct. A heap only guarantees the min at the top and repairs order in O(log n); the rest is partially ordered.",
          "It is not fully sorted — only the top is guaranteed.",
          "Only the top is directly accessible; arbitrary indexing is not the point.",
        ],
        explanation: "A heap gives the min at top with O(log n) push/pop; it is not fully sorted.",
      },
      {
        question: "To keep the k *largest* items seen, which heap do you use?",
        choices: [
          "A size-k min-heap — its top is the smallest of the k, so a bigger new value evicts it",
          "A size-k max-heap",
          "A sorted list rebuilt each time",
        ],
        answer: 0,
        why: [
          "Correct. The min-heap's top is the weakest of your current top-k, so you compare and replace it in O(log k).",
          "A max-heap puts the biggest on top, which does not help you evict the weakest of the k.",
          "Rebuilding a sorted list each step is O(n log n) — the heap avoids that.",
        ],
        explanation: "A size-k min-heap keeps the k largest: evict its (smallest) top when a bigger value arrives.",
      },
      {
        question: "Cost of one push or pop on a heap of n items?",
        choices: [
          "O(log n)",
          "O(1)",
          "O(n)",
        ],
        answer: 0,
        why: [
          "Correct. Restoring the heap order after a push or pop takes about log n swaps.",
          "Peeking the top is O(1), but push/pop must repair order in O(log n).",
          "It is logarithmic, not linear.",
        ],
        explanation: "Heap push/pop are O(log n).",
      },
    ],
    prompt: "Return the kth largest value using O(k) additional space.", fn: "kth_largest", starter: `def kth_largest(values, k):\n    pass`, solution: `import heapq\n\ndef kth_largest(values, k):\n    heap = []\n    for value in values:\n        heapq.heappush(heap, value)\n        if len(heap) > k:\n            heapq.heappop(heap)\n    return heap[0]`,
    tests: [t("third", "assert fn([3, 2, 1, 5, 6, 4], 2) == 5"), t("duplicates", "assert fn([3, 2, 3, 1, 2, 4, 5, 5, 6], 4) == 4"), t("one", "assert fn([-2], 1) == -2")], pattern: "Heap / top-k", tier: "problem", minutes: 18, difficulty: [3, 2, 3],
  },
  {
    id: "trees", module: "py.m10", title: "Trees and recursive structure", goal: "Choose DFS or BFS and state what each call or queue entry represents.", kind: "pattern", requires: ["recursion", "iterators"],
    model: "A **tree** is data shaped like a family tree: one node at the top (the *root*), and every node can point down to a `left` child and a `right` child. A node with no children is a *leaf*. The magic of a tree is that every child is itself the top of a smaller tree — so the same function that solves the whole tree also solves each piece.\n\n```python\n#        3          <- root\n#       / \\\n#      9   20       <- 20 has children too\n#         /  \\\n#        15   7     <- leaves\ntree = {\"val\": 3,\n        \"left\": {\"val\": 9},\n        \"right\": {\"val\": 20,\n                  \"left\": {\"val\": 15},\n                  \"right\": {\"val\": 7}}}\n```\n\nThere are two ways to walk a tree. **DFS** (depth-first) dives all the way down one branch before backing up — the natural fit for recursion, because a function calling itself *is* diving deeper. **BFS** (breadth-first) visits everything one level at a time, using a queue.\n\nThe key habit: before writing a recursive tree function, finish this sentence — *'for one node, I return ___.'* Here we compute depth (how many levels tall):\n\n```python\ndef depth(node):\n    if node is None:      # an empty spot is 0 levels tall\n        return 0\n    left = depth(node.get(\"left\"))\n    right = depth(node.get(\"right\"))\n    return 1 + max(left, right)   # my level, plus my taller child\n\nprint(depth(tree))   # 3\n```\n\nEach call asks its two children how tall *they* are, takes the taller answer, and adds one for itself. Because the function trusts itself on the smaller pieces, you only write the rule for a single node.",
    example: `def depth(node):\n    if node is None:\n        return 0\n    left = depth(node.get("left"))\n    right = depth(node.get("right"))\n    return 1 + max(left, right)\n\ntree = {"val": 3, "left": {"val": 9},\n        "right": {"val": 20, "left": {"val": 15}, "right": {"val": 7}}}\nprint(depth(tree))   # 3`,
    trace: "Start with `depth(tree)` on the root `3`. It calls `depth` on child `9`, which has no children, so both its child calls hit `if node is None: return 0`; node `9` returns `1 + max(0, 0)` = 1. Then the root calls `depth` on child `20`: node `20` asks children `15` and `7`, each returns 1, so `20` returns `1 + max(1, 1)` = 2. Back at the root, `return 1 + max(left, right)` = `1 + max(1, 2)` = 3. Every node did the same tiny job; recursion stitched them together.",
    trap: "Do not share one mutable list or counter across the recursive branches unless you carefully undo each change on the way back up. Prefer returning a value from each call and combining the returned values, like `max(left, right)` does.",
    rule: "Before the base case, write one sentence: 'for one node, `solve(node)` returns ___.' Once that promise is clear, the base case and the combine step almost write themselves.",
    recall: "In one sentence, what does `depth(node)` promise to return for a single node, and why does that let it trust the recursive calls on its children?",
    checks: [
      {
        question: "How do DFS and BFS differ on a tree?",
        choices: [
          "DFS follows one branch deep (recursion/stack); BFS visits level by level (a queue)",
          "DFS uses a queue; BFS uses recursion",
          "They visit nodes in the same order",
        ],
        answer: 0,
        why: [
          "Correct. DFS dives down one path using recursion or a stack; BFS spreads outward by distance using a queue.",
          "It is reversed: a queue drives BFS, recursion/stack drives DFS.",
          "They produce different visit orders — depth-first versus breadth-first.",
        ],
        explanation: "DFS goes deep (stack/recursion); BFS goes by level (queue).",
      },
      {
        question: "When writing a recursive tree function, what should you nail down first?",
        choices: [
          "Exactly what value it returns for one subtree",
          "How many nodes the tree has",
          "The variable names",
        ],
        answer: 0,
        why: [
          "Correct. A clear contract — 'for this subtree, I return ___' — lets you combine children's results correctly.",
          "You rarely need the total node count; you need the per-subtree contract.",
          "Naming is minor; the return contract is what makes recursion correct.",
        ],
        explanation: "Define exactly what the function returns for one subtree.",
      },
      {
        question: "BFS visits nodes in order of…",
        choices: [
          "Distance (number of edges) from the start",
          "Alphabetical value",
          "Random order",
        ],
        answer: 0,
        why: [
          "Correct. A queue processes all nodes at distance 1, then 2, and so on — breadth first.",
          "BFS ignores values; it goes by distance.",
          "The order is fully determined by distance, not random.",
        ],
        explanation: "BFS visits by increasing distance from the start.",
      },
    ],
    prompt: "Nodes are dictionaries with optional `left` and `right` keys. Return the maximum root-to-leaf depth; `None` has depth 0.", fn: "tree_depth", starter: `def tree_depth(node):\n    pass`, solution: `def tree_depth(node):\n    if node is None:\n        return 0\n    return 1 + max(tree_depth(node.get("left")), tree_depth(node.get("right")))`,
    tests: [t("empty", "assert fn(None) == 0"), t("one", "assert fn({}) == 1"), t("deep", `tree={"left":{"left":{}},"right":{}}\nassert fn(tree)==3`)], pattern: "Tree DFS", tier: "problem", minutes: 18, difficulty: [3, 2, 3],
  },
  {
    id: "graphs", module: "py.m10", title: "Graph traversal and visited state", goal: "Traverse a graph once without cycles or duplicate work.", kind: "pattern", requires: ["trees", "sets"],
    model: "A **graph** is just dots (*nodes*) joined by lines (*edges*) — cities linked by roads, friends linked by follows. Unlike a tree it can have loops: A points to B, B points back to A. If you walk it naively you will go around that loop forever. The one tool that saves you is a **visited set**: a memory of every node you have already reached, so you never process one twice.\n\nWe usually store a graph as a dictionary mapping each node to its list of neighbors:\n\n```python\ngraph = {\"a\": [\"b\", \"c\"],\n         \"b\": [\"a\", \"d\"],   # note: b points back to a (a loop)\n         \"c\": [],\n         \"d\": []}\n```\n\nTo explore it, keep a **frontier** (the nodes waiting to be visited) and the visited set. A queue for the frontier gives BFS — it spreads outward level by level:\n\n```python\nfrom collections import deque\n\ndef reachable(graph, start):\n    queue = deque([start])\n    visited = {start}\n    order = []\n    while queue:\n        node = queue.popleft()      # take the oldest waiting node\n        order.append(node)\n        for neighbor in graph[node]:\n            if neighbor not in visited:\n                visited.add(neighbor)    # mark the moment we schedule it\n                queue.append(neighbor)\n    return order\n\nprint(reachable(graph, \"a\"))   # ['a', 'b', 'c', 'd']\n```\n\nThe critical line is `visited.add(neighbor)` happening as soon as we push a node, not when we later pop it. That guarantees each node enters the queue exactly once, even if two different nodes both point to it. Because each node is handled once and each edge is looked at a constant number of times, the whole walk costs O(V + E) — V nodes plus E edges.",
    example: `from collections import deque\n\ndef reachable(graph, start):\n    queue = deque([start])\n    visited = {start}\n    order = []\n    while queue:\n        node = queue.popleft()\n        order.append(node)\n        for neighbor in graph[node]:\n            if neighbor not in visited:\n                visited.add(neighbor)\n                queue.append(neighbor)\n    return order\n\ngraph = {"a": ["b", "c"], "b": ["a", "d"], "c": [], "d": []}\nprint(reachable(graph, "a"))   # ['a', 'b', 'c', 'd']`,
    trace: "Start: `queue = ['a']`, `visited = {a}`. Pop `a`; its neighbors are `b` and `c`, neither visited, so add both — `queue = ['b', 'c']`, `visited = {a, b, c}`. Pop `b`; its neighbors are `a` (already visited, skip — this is what stops the loop) and `d` (new, add it) — `queue = ['c', 'd']`. Pop `c`; no neighbors. Pop `d`; no neighbors. Queue empty, done: order `['a', 'b', 'c', 'd']`. Node `a` was never re-queued even though `b` pointed back to it.",
    trap: "Recursive DFS can blow past Python's recursion limit on a very deep or long graph. When depth might be large or untrusted, use an explicit stack (`stack.pop()` / `stack.append()`) instead of recursion.",
    rule: "Say in one sentence what a frontier item represents, and mark a node visited the instant you schedule it (add to the queue) — never wait until you pop it, or duplicates sneak in.",
    recall: "Why does marking a node visited when you enqueue it (not when you dequeue it) prevent the same node from ever sitting in the queue twice?",
    checks: [
      {
        question: "What must a graph traversal keep to avoid running forever?",
        choices: [
          "A visited set, so each node is processed only once",
          "A sorted copy of the graph",
          "The total number of edges",
        ],
        answer: 0,
        why: [
          "Correct. Graphs can have cycles, so a visited set stops you from revisiting nodes and looping endlessly.",
          "No sorting is needed; the visited set is what prevents repeats.",
          "Counting edges does not prevent cycles; tracking visited nodes does.",
        ],
        explanation: "A visited set keeps each node processed once, avoiding cycles.",
      },
      {
        question: "With an adjacency list, DFS and BFS both run in…",
        choices: [
          "O(V + E) — each vertex once, each edge a constant number of times",
          "O(V × E)",
          "O(V²) always",
        ],
        answer: 0,
        why: [
          "Correct. Every vertex is handled once and every edge is looked at a constant number of times, giving O(V + E).",
          "It is additive, not multiplicative, with an adjacency list.",
          "O(V²) is the adjacency-*matrix* cost, not adjacency-list traversal.",
        ],
        explanation: "Adjacency-list traversal is O(V + E).",
      },
      {
        question: "Why mark a node visited when you *enqueue* it in BFS (not when you dequeue)?",
        choices: [
          "So the same node is never added to the queue twice",
          "It makes the queue shorter to type",
          "It changes the traversal to DFS",
        ],
        answer: 0,
        why: [
          "Correct. Marking on enqueue prevents a node reachable by several edges from being queued multiple times.",
          "It is about correctness/efficiency, not typing.",
          "It does not change BFS into DFS; the queue still drives level order.",
        ],
        explanation: "Mark on enqueue so a node is never queued twice.",
      },
    ],
    prompt: "Given an adjacency dictionary, return whether a path exists from `start` to `target`.", fn: "path_exists", starter: `def path_exists(graph, start, target):\n    pass`, solution: `from collections import deque\n\ndef path_exists(graph, start, target):\n    queue = deque([start])\n    visited = {start}\n    while queue:\n        node = queue.popleft()\n        if node == target:\n            return True\n        for neighbor in graph.get(node, []):\n            if neighbor not in visited:\n                visited.add(neighbor)\n                queue.append(neighbor)\n    return False`,
    tests: [t("path", `g={"a":["b"],"b":["c"],"c":[]}\nassert fn(g,"a","c") is True`), t("cycle no path", `g={"a":["b"],"b":["a"]}\nassert fn(g,"a","z") is False`), t("self", "assert fn({}, 'a', 'a') is True")], pattern: "Graph BFS", tier: "problem", minutes: 20, difficulty: [3, 3, 3],
  },
  {
    id: "backtracking", module: "py.m11", title: "Backtracking and reversible choices", goal: "Enumerate a decision tree while restoring shared state exactly.", kind: "pattern", requires: ["recursion", "trees"],
    model: "**Backtracking** is how you explore every possibility by trying one choice, going deeper, then *undoing* it to try the next — like walking a maze, and every time you hit a dead end, walking back to the last fork and taking a different turn.\n\nThe rhythm is always three beats: **choose → recurse → undo**. You keep a running `path` of the choices made so far; when the path is complete you record a *copy* of it, then unwind.\n\nHere we generate every subset of a list (each item is either in or out):\n\n```python\ndef subsets(values):\n    answers = []\n    path = []\n    def search(index):\n        if index == len(values):     # decided every item\n            answers.append(path.copy())   # snapshot this subset\n            return\n        search(index + 1)            # branch 1: leave item out\n        path.append(values[index])   # choose: put item in\n        search(index + 1)            # branch 2: with it in\n        path.pop()                   # undo, so siblings start clean\n    search(0)\n    return answers\n\nprint(subsets([1, 2]))   # [[], [2], [1], [1, 2]]\n```\n\nThe `path.pop()` is the whole trick: it restores `path` to exactly what it was before this call, so the next branch is not polluted by a choice that belonged to a different route. And `path.copy()` matters because `path` keeps changing — without the copy, every recorded answer would point at the *same* list and all show its final state.",
    example: `def subsets(values):\n    answers = []\n    path = []\n    def search(index):\n        if index == len(values):\n            answers.append(path.copy())\n            return\n        search(index + 1)\n        path.append(values[index])\n        search(index + 1)\n        path.pop()\n    search(0)\n    return answers\n\nprint(subsets([1, 2]))   # [[], [2], [1], [1, 2]]`,
    trace: "Call `search(0)` with `path=[]`. It first recurses `search(1)` without choosing item `1`. `search(1)` recurses `search(2)` without item `2`: index equals length, record a copy of `path` → `[]`. Back in `search(1)`, append `2`, `path=[2]`, recurse `search(2)`: record `[2]`, then `pop` → `path=[]`. Return to `search(0)`: append `1`, `path=[1]`, recurse `search(1)` again — records `[1]`, then appends `2` for `[1, 2]`, records it, pops back to `[1]`. Finally `search(0)` pops `1`, leaving `path=[]`. Answers: `[[], [2], [1], [1, 2]]`. Every `pop` handed the next branch a clean path.",
    trap: "Forgetting the undo (`path.pop()`) leaks a choice into the sibling branches, corrupting every later answer. Copying the path at *every* call also works but is slower and hides the choose/undo structure — snapshot only when you actually record an answer.",
    rule: "Before coding, name four things: the set of choices at each step, the completion condition, the rule that rejects a hopeless prefix (pruning), and the exact undo that reverses each choice.",
    recall: "Why must you record `path.copy()` rather than `path` itself when an answer is complete, and what does `path.pop()` guarantee for the next branch?",
    checks: [
      {
        question: "What is the core loop of backtracking?",
        choices: [
          "Choose, recurse, then undo the choice before trying the next",
          "Choose and never undo",
          "Try every combination at random",
        ],
        answer: 0,
        why: [
          "Correct. You make a choice, explore deeper, then reverse it so the shared state is clean for the next choice.",
          "Without undoing, the shared path would carry stale choices into other branches.",
          "It is a systematic depth-first search, not random.",
        ],
        explanation: "Backtracking = choose, recurse, undo.",
      },
      {
        question: "Why call `path.copy()` when you record a completed answer?",
        choices: [
          "The `path` list keeps mutating as you backtrack; you must store a snapshot",
          "Copying makes it run faster",
          "It is never needed",
        ],
        answer: 0,
        why: [
          "Correct. `path` is one shared, changing list; appending it directly would store a reference that later gets undone. A copy freezes the current answer.",
          "It is about correctness, not speed.",
          "Without the copy, every stored answer would end up mutated (often empty).",
        ],
        explanation: "`path` mutates as you backtrack, so store a copy of a found answer.",
      },
      {
        question: "What is pruning in backtracking?",
        choices: [
          "Rejecting a partial choice early when it cannot lead to a valid answer",
          "Deleting the final answer",
          "Sorting the choices",
        ],
        answer: 0,
        why: [
          "Correct. Cutting off dead branches before fully exploring them saves huge amounts of work.",
          "Pruning removes hopeless partial paths, not final answers.",
          "Sorting is a separate concern from pruning.",
        ],
        explanation: "Pruning cuts partial paths that cannot reach a valid answer.",
      },
    ],
    prompt: "Return every subset of `values`; order of subsets does not matter.", fn: "subsets", starter: `def subsets(values):\n    pass`, solution: `def subsets(values):\n    result = []\n    path = []\n    def search(index):\n        if index == len(values):\n            result.append(path.copy())\n            return\n        search(index + 1)\n        path.append(values[index])\n        search(index + 1)\n        path.pop()\n    search(0)\n    return result`,
    tests: [t("three", "result=fn([1,2,3]); assert len(result)==8 and [] in result and [1,2,3] in result"), t("empty", "assert fn([]) == [[]]"), t("independent lists", "r=fn([1]); r[0].append(9); assert r[0] is not r[1]", true)], pattern: "Backtracking", tier: "problem", minutes: 24, difficulty: [4, 3, 4],
  },
  {
    id: "dynamic-programming", module: "py.m11", title: "Dynamic programming from repeated states", goal: "Define a state and recurrence before building a table.", kind: "pattern", requires: ["recursion", "complexity"],
    model: "**Dynamic programming** (DP) is for problems where the naive recursion solves the *same smaller problem* over and over. Instead of recomputing, you solve each unique subproblem once and reuse the answer. The whole skill is naming a **state** (all the information the rest of the problem needs) and a **recurrence** (how bigger states are built from smaller ones).\n\nThe classic 'house robber': houses in a row each hold some money, but you cannot rob two *adjacent* houses. What is the most you can take?\n\n```python\ndef rob(houses):\n    # state: best[i] = most money robbing among the first i houses\n    take, skip = 0, 0   # best if we just took / just skipped previous\n    for money in houses:\n        # rob this house: money + best where we did NOT take the last one\n        # skip this house: keep the best so far\n        take, skip = skip + money, max(skip, take)\n    return max(take, skip)\n\nprint(rob([2, 7, 9, 3, 1]))   # 12  (7 + 9? no -> 2 + 9 + 1)\n```\n\nAt every house you have exactly two choices: **skip it** (keep the best total you already had) or **take it** (its money plus the best total from *before the previous house*, since adjacent is banned). Keeping just those two running numbers is all the memory you need.\n\nThe honest example there is `2 + 9 + 1 = 12` — you cannot take 7 and 9 because they are adjacent.",
    example: `def rob(houses):\n    take, skip = 0, 0\n    for money in houses:\n        take, skip = skip + money, max(skip, take)\n    return max(take, skip)\n\nprint(rob([2, 7, 9, 3, 1]))   # 12`,
    trace: "Track `take` (best ending in robbing this house) and `skip` (best if we don't). Start `take=0, skip=0`. House `2`: new take = `skip + 2` = 2, new skip = `max(0, 0)` = 0 → `(2, 0)`. House `7`: take = `0 + 7` = 7, skip = `max(0, 2)` = 2 → `(7, 2)`. House `9`: take = `2 + 9` = 11, skip = `max(2, 7)` = 7 → `(11, 7)`. House `3`: take = `7 + 3` = 10, skip = `max(7, 11)` = 11 → `(10, 11)`. House `1`: take = `11 + 1` = 12, skip = `max(11, 10)` = 11 → `(12, 11)`. Answer `max(12, 11)` = 12.",
    trap: "A DP table you built by pattern-matching without a written state definition is memorized code — it collapses the moment the output or a constraint changes. Always be able to say what one slot *means*.",
    rule: "Before coding, fill four blanks: 'the state means ___', 'the transition considers ___', 'the base case is ___', 'the final answer lives at ___.'",
    recall: "At the final house, why are the only two options 'skip it and keep the best so far' or 'take its money plus the best total from before the previous house'?",
    checks: [
      {
        question: "When does dynamic programming apply?",
        choices: [
          "When different choice paths reach the same subproblem (overlapping subproblems)",
          "Only when the input is sorted",
          "Whenever recursion is used at all",
        ],
        answer: 0,
        why: [
          "Correct. DP pays off when the same subproblem recurs, so caching its answer avoids redoing exponential work.",
          "Sorting is unrelated to whether subproblems overlap.",
          "Recursion without overlapping subproblems does not need DP.",
        ],
        explanation: "DP fits when the same subproblem is reached many ways.",
      },
      {
        question: "What must a DP *state* contain?",
        choices: [
          "Everything the future needs — enough that the answer is independent of how you got there",
          "The entire input, copied",
          "Only the current index",
        ],
        answer: 0,
        why: [
          "Correct. A good state captures all the information later decisions depend on, so the subproblem is self-contained.",
          "Copying the whole input is wasteful; capture only what the future needs.",
          "Sometimes an index is enough, but only if that is truly all the future depends on.",
        ],
        explanation: "A state holds all information future decisions depend on.",
      },
      {
        question: "What is the difference between top-down and bottom-up DP?",
        choices: [
          "Top-down memoizes a recursion; bottom-up fills a table in dependency order",
          "They give different answers",
          "Top-down is always wrong",
        ],
        answer: 0,
        why: [
          "Correct. Both compute the same recurrence — one caches recursive calls, the other iterates a table from base cases up.",
          "They compute the same values; only the mechanism differs.",
          "Top-down memoization is a perfectly valid, correct approach.",
        ],
        explanation: "Top-down = memoized recursion; bottom-up = table in dependency order.",
      },
    ],
    prompt: "Return the maximum sum of non-adjacent nonnegative values.", fn: "max_non_adjacent", starter: `def max_non_adjacent(values):\n    pass`, solution: `def max_non_adjacent(values):\n    previous_two = 0\n    previous_one = 0\n    for value in values:\n        current = max(previous_one, previous_two + value)\n        previous_two, previous_one = previous_one, current\n    return previous_one`,
    tests: [t("ordinary", "assert fn([2, 7, 9, 3, 1]) == 12"), t("pair", "assert fn([5, 1, 1, 5]) == 10"), t("empty", "assert fn([]) == 0"), t("one", "assert fn([8]) == 8", true)], pattern: "Dynamic programming", tier: "problem", minutes: 24, difficulty: [4, 3, 4],
  },
  {
    id: "api-contracts", module: "py.m12", title: "API contracts and boundary validation", goal: "Translate an endpoint contract into explicit, testable boundary behavior.", kind: "mental-model", requires: ["exceptions", "testing"], tracks: ["faang", "swe"], skills: ["systems", "api-design"],
    model: "An **API contract** is a promise a piece of code makes to whoever calls it: *these* inputs are allowed, *this* is what you get back, and *this* is how I fail. The most important habit that follows from it is **validate at the boundary** — check inputs once, right where they enter your system, so everything deeper can simply *trust* the data.\n\nThink of a bouncer at a door. They check IDs once at the entrance; inside, nobody has to check again. Here, a paging endpoint validates `page` and `size` before doing any work:\n\n```python\ndef page_window(page, size):\n    # the boundary: reject bad input loudly, right away\n    if page < 1 or not (1 <= size <= 100):\n        raise ValueError(\"invalid pagination\")\n    # past here, page and size are guaranteed sane\n    offset = (page - 1) * size   # public 1-based page -> 0-based offset\n    return offset, size\n\nprint(page_window(3, 20))   # (40, 20)\n```\n\nA good contract also draws clear lines between three different situations that beginners often blur: a **missing** value (you sent nothing), a **malformed** value (you sent garbage like `page = -5`), and a **valid empty result** (a legitimate search that simply found nothing). These are not the same, and callers need to tell them apart.",
    example: `def page_window(page, size):\n    if page < 1 or not (1 <= size <= 100):\n        raise ValueError("invalid pagination")\n    offset = (page - 1) * size\n    return offset, size\n\nprint(page_window(3, 20))   # (40, 20)\nprint(page_window(1, 20))   # (0, 20)`,
    trace: "Call `page_window(3, 20)`. The guard checks `page < 1` — `3 < 1` is False — and `not (1 <= 20 <= 100)` — `20` is in range, so `not True` is False; the whole condition is False, so no error is raised. Then `offset = (3 - 1) * 20` = 40, and it returns `(40, 20)`. The one-based page 3 became the zero-based offset 40. Every function below this boundary can now assume a positive page and a sane size — it never has to defend against `page = 0` again.",
    trap: "Silently 'fixing' bad input (clamping `page = -5` up to 1) hides the caller's bug and makes a broken retry look like it succeeded — with the wrong data. And returning a different error shape for each failure forces callers to branch on accidents instead of one stable contract.",
    rule: "Validate once at the boundary, name the invariant that becomes true afterward, and keep your success shape and failure shape stable so callers can rely on them.",
    recall: "After the boundary validator in `page_window` accepts `page` and `size`, what exactly is the core code below it allowed to assume without re-checking?",
    checks: [
      {
        question: "Where should input validation live?",
        choices: [
          "At the boundary — once data enters the core, the rest of the program can trust it",
          "Scattered throughout every function",
          "Only in the database",
        ],
        answer: 0,
        why: [
          "Correct. Validate once at the edge; then core logic can rely on the data's shape instead of re-checking everywhere.",
          "Re-validating everywhere is repetitive and error-prone; concentrate it at the boundary.",
          "The database is too late and too far; reject bad input at the entry point.",
        ],
        explanation: "Validate at the boundary so the core can trust its inputs.",
      },
      {
        question: "What does an API contract define?",
        choices: [
          "Accepted inputs, returned outputs, and failure behavior",
          "The programming language used",
          "The server's hardware",
        ],
        answer: 0,
        why: [
          "Correct. A contract is the promise about inputs, outputs, and how failures are reported — the testable interface.",
          "Language is an implementation detail, not the contract.",
          "Hardware is irrelevant to the interface contract.",
        ],
        explanation: "A contract specifies inputs, outputs, and failure behavior.",
      },
      {
        question: "After a boundary validator accepts the request, core code may…",
        choices: [
          "Assume the inputs are valid and skip re-checking them",
          "Re-validate everything again to be safe",
          "Ignore the inputs",
        ],
        answer: 0,
        why: [
          "Correct. That is the payoff of boundary validation — the core is freed from defensive re-checks.",
          "Re-checking defeats the purpose and clutters the core with boundary logic.",
          "The core uses the inputs; it just does not need to re-validate them.",
        ],
        explanation: "Validated-at-the-boundary means the core can trust the data.",
      },
    ],
    prompt: "Implement `page_window(page, size)`. Page starts at 1, size must be 1 through 100, and invalid input raises ValueError. Return `(offset, size)`.", fn: "page_window", starter: `def page_window(page, size):\n    pass`, solution: `def page_window(page, size):\n    if page < 1 or size < 1 or size > 100:\n        raise ValueError("invalid pagination")\n    return ((page - 1) * size, size)`,
    tests: [t("first", "assert fn(1, 25) == (0, 25)"), t("later", "assert fn(3, 20) == (40, 20)"), t("bad page", "\ntry:\n fn(0, 10); assert False\nexcept ValueError: pass", true), t("bad size", "\ntry:\n fn(1, 101); assert False\nexcept ValueError: pass", true)], tier: "problem", minutes: 12, difficulty: [3, 2, 3],
  },
  {
    id: "idempotency", module: "py.m12", title: "Retries and idempotency", goal: "Design a state transition that is safe when the same request arrives twice.", kind: "mental-model", requires: ["api-contracts", "sets"], tracks: ["faang", "swe"], skills: ["systems", "reliability"],
    model: "Here is a real headache. Your app sends 'add 25 dollars to my balance' to a server. The server does it — but the *reply* gets lost on the network. Your app never heard back, so it retries. Now the server might add 25 dollars *twice*. **Idempotency** is the property that doing something once or ten times lands on the same result.\n\nThe fix is an **idempotency key**: the client tags the request with a unique id (like `r7`). The server remembers keys it has already handled, and if the same key comes back, it returns the old result instead of doing the work again.\n\n```python\ndef apply_credit(balance, seen, key, amount):\n    if key in seen:            # we already handled this exact request\n        return balance, seen   # return the prior result, do nothing new\n    return balance + amount, seen | {key}   # apply once, remember the key\n\nbalance, seen = 100, set()\nbalance, seen = apply_credit(balance, seen, \"r7\", 25)\nprint(balance)   # 125  (applied)\nbalance, seen = apply_credit(balance, seen, \"r7\", 25)   # the retry\nprint(balance)   # 125  (ignored — same key)\n```\n\nThe subtle, career-defining detail: recording the key and changing the balance must happen **together, atomically**. If they are two separate steps, two retries running at once could both check 'is `r7` seen?', both see no, and both apply the credit — the exact double-charge you were trying to prevent.",
    example: `def apply_credit(balance, seen, key, amount):\n    if key in seen:\n        return balance, seen\n    return balance + amount, seen | {key}\n\nbalance, seen = 100, set()\nbalance, seen = apply_credit(balance, seen, "r7", 25)\nprint(balance)   # 125\nbalance, seen = apply_credit(balance, seen, "r7", 25)\nprint(balance)   # 125`,
    trace: "Start `balance = 100`, `seen = {}` (empty). First call with key `r7`: `r7` is not in `seen`, so return `100 + 25` = 125 and `seen | {r7}` = `{r7}`. Now `balance = 125`. Second call — the retry — with the same key `r7`: this time `r7 in seen` is True, so it returns `balance, seen` unchanged: still 125, still `{r7}`. The duplicate delivery had no extra effect.",
    trap: "Checking 'is this key seen?' and updating the balance in two separate database transactions leaves a race window: two workers can both read 'not seen' before either writes, and both apply the change. The check and the mutation must be one atomic operation.",
    rule: "For every write that might be retried, pin down three things: the stable request identity (the key), the durable result to replay, and the atomic boundary that binds 'remember the key' to 'change the state' as one step.",
    recall: "Why does remembering the idempotency key fail to prevent a double-charge if recording the key and changing the balance are not done atomically together?",
    checks: [
      {
        question: "What does an idempotency key achieve?",
        choices: [
          "A retried request applies its effect at most once, even if delivered several times",
          "It encrypts the request",
          "It makes requests faster",
        ],
        answer: 0,
        why: [
          "Correct. The server remembers the key and skips the effect on a duplicate, turning at-least-once delivery into effectively once.",
          "It is about deduplicating effects, not encryption.",
          "It is about correctness under retries, not speed.",
        ],
        explanation: "An idempotency key makes a repeated request apply its effect once.",
      },
      {
        question: "Why is retrying a write dangerous without idempotency?",
        choices: [
          "A lost response means the client cannot tell if the write already happened, so a retry may double it",
          "Retries are always rejected",
          "The server forgets all state",
        ],
        answer: 0,
        why: [
          "Correct. The server may have committed before the response was lost; a blind retry then applies the effect twice.",
          "Retries are not automatically rejected — that is the problem.",
          "The server keeps its state; the ambiguity is on the client side.",
        ],
        explanation: "A lost response hides whether the write committed, so a retry can duplicate it.",
      },
      {
        question: "Why must recording the key and applying the effect be atomic (all-or-nothing)?",
        choices: [
          "A crash between them could apply the effect without recording the key, breaking dedup on retry",
          "Atomicity makes it faster",
          "It is never required",
        ],
        answer: 0,
        why: [
          "Correct. If they can partially complete, a retry might reapply the effect because the key was never recorded — so they must commit together.",
          "This is about correctness, not speed.",
          "Without atomicity the whole guarantee falls apart, so it is required.",
        ],
        explanation: "Record the key and apply the effect atomically, or dedup can fail on retry.",
      },
    ],
    prompt: "Return `(new_balance, new_seen)` after applying a credit once per key. Do not mutate the caller's set.", fn: "apply_credit", starter: `def apply_credit(balance, seen, key, amount):\n    pass`, solution: `def apply_credit(balance, seen, key, amount):\n    if key in seen:\n        return balance, seen.copy()\n    return balance + amount, seen | {key}`,
    tests: [t("first", "assert fn(10, set(), 'a', 5) == (15, {'a'})"), t("duplicate", "assert fn(15, {'a'}, 'a', 5) == (15, {'a'})"), t("does not mutate", "s={'x'}; fn(4,s,'y',2); assert s == {'x'}", true)], tier: "problem", minutes: 14, difficulty: [4, 2, 4],
  },
  {
    id: "cache-reasoning", module: "py.m12", title: "Cache policy and locality", goal: "Simulate an LRU cache and explain when caching helps or lies.", kind: "pattern", requires: ["dicts", "complexity"], tracks: ["faang", "swe"], skills: ["systems", "caching"],
    model: "A **cache** stores the answer to expensive work so the next identical request is instant. The deal you strike: you spend extra *memory*, and you take on the hardest problem in computing — knowing when a stored answer has gone *stale*. A cache is not a free win; it is a trade.\n\nBecause memory is limited, a cache must **evict** old entries. The most common rule is **LRU** — *Least Recently Used* — kick out whichever key you touched longest ago, betting that recently used things will be used again soon.\n\n```python\nfrom collections import OrderedDict\n\ndef simulate_lru(capacity, accesses):\n    cache = OrderedDict()   # remembers insertion/use order\n    misses = 0\n    for key in accesses:\n        if key in cache:\n            cache.move_to_end(key)   # a hit: mark it most-recently-used\n        else:\n            misses += 1              # a miss: we had to fetch it\n            cache[key] = True\n            if len(cache) > capacity:\n                cache.popitem(last=False)   # evict the oldest key\n    return misses\n\nprint(simulate_lru(2, [\"A\", \"B\", \"A\", \"C\", \"A\"]))   # 3\n```\n\nNotice something important: even a *hit* changes state. When we find `A`, we fetch nothing, but we still move `A` to the 'most recent' end — that is what keeps it from being evicted next. Whether a cache actually helps depends entirely on the workload; a big cache guarantees nothing if requests never repeat.",
    example: `from collections import OrderedDict\n\ndef simulate_lru(capacity, accesses):\n    cache = OrderedDict()\n    misses = 0\n    for key in accesses:\n        if key in cache:\n            cache.move_to_end(key)\n        else:\n            misses += 1\n            cache[key] = True\n            if len(cache) > capacity:\n                cache.popitem(last=False)\n    return misses\n\nprint(simulate_lru(2, ["A", "B", "A", "C", "A"]))   # 3`,
    trace: "Capacity 2, accesses `A B A C A`. `A`: miss (1), cache order `[A]`. `B`: miss (2), cache `[A, B]`. `A`: hit — move `A` to the recent end, cache `[B, A]`. `C`: miss (3), insert → `[B, A, C]`, now over capacity, so evict the oldest `B` → cache `[A, C]`. `A`: hit — `A` is still there precisely because that earlier hit refreshed it — cache `[C, A]`. Total misses: 3. Had the hit *not* refreshed `A`, `A` would have been evicted instead of `B`, and the final `A` would have missed.",
    trap: "Caching a value that can change, and never refreshing it, makes a fast system reliably *wrong*. And a cache key that leaves out a relevant input (say, the user id) can hand one user another user's cached result.",
    rule: "Before adding any cache, write down four things: the repeated computation worth saving, the *complete* cache key, the eviction rule, and how stale an answer you can tolerate.",
    recall: "In an LRU cache, what state changes on a hit even though no value is fetched from the backing store, and why does that change matter for the next eviction?",
    checks: [
      {
        question: "What does a cache trade away for lower latency?",
        choices: [
          "Extra memory and the complexity of keeping entries fresh (invalidation)",
          "Nothing — caches are free wins",
          "Correctness of results",
        ],
        answer: 0,
        why: [
          "Correct. A cache spends memory and adds invalidation/staleness concerns in exchange for avoiding repeated work.",
          "Caches are not free — memory and staleness are the costs.",
          "A correct cache returns correct values; the cost is memory and invalidation, not correctness.",
        ],
        explanation: "A cache trades memory + invalidation complexity for lower repeated-work latency.",
      },
      {
        question: "What does an LRU cache evict when it is full?",
        choices: [
          "The least recently used key",
          "The most recently used key",
          "A random key",
        ],
        answer: 0,
        why: [
          "Correct. LRU assumes recently used items are likely to be used again, so it drops the one used longest ago.",
          "Evicting the most recent would throw away what you likely need next.",
          "Random eviction ignores locality; LRU uses recency.",
        ],
        explanation: "LRU evicts the least recently used key.",
      },
      {
        question: "On a cache *hit*, what changes even though no value is fetched from the store?",
        choices: [
          "That key becomes the most recently used — the recency order updates",
          "Nothing changes",
          "The value is deleted",
        ],
        answer: 0,
        why: [
          "Correct. LRU must record that the key was just touched, moving it to most-recently-used so it is evicted last.",
          "Recency state must update, or eviction order would be wrong.",
          "A hit returns the value; it does not delete it.",
        ],
        explanation: "A hit marks the key most-recently-used (updates recency order).",
      },
    ],
    prompt: "Return the number of misses produced by an LRU cache of `capacity` for a sequence of keys. Assume only key presence matters.", fn: "lru_misses", starter: `def lru_misses(capacity, keys):\n    pass`, solution: `def lru_misses(capacity, keys):\n    recent = []\n    misses = 0\n    for key in keys:\n        if key in recent:\n            recent.remove(key)\n        else:\n            misses += 1\n            if len(recent) == capacity:\n                recent.pop(0)\n        recent.append(key)\n    return misses`,
    tests: [t("locality", "assert fn(2, ['A','B','A','C','A']) == 3"), t("thrash", "assert fn(2, ['A','B','C','A']) == 4"), t("empty", "assert fn(3, []) == 0")], pattern: "LRU cache", tier: "problem", minutes: 18, difficulty: [4, 3, 4],
  },
  {
    id: "capacity-estimation", module: "py.m12", title: "Capacity estimation and bottlenecks", goal: "Convert product traffic into rough throughput and resource bounds.", kind: "mental-model", requires: ["numbers", "performance"], tracks: ["faang", "swe"], skills: ["systems", "capacity-planning"],
    model: "**Capacity estimation** (the 'back-of-the-envelope' math you do in a system-design interview) answers a rough question: *will this survive the traffic?* You are not predicting the future to the decimal — you are bounding the answer to the right *order of magnitude* so you can spot the bottleneck.\n\nThe one number worth memorizing: a day has about **86,400 seconds** (round to ~100,000 to make the mental math easy). So daily traffic divided by that gives requests per second.\n\n```python\ndef requests_per_second(daily_requests, peak_factor):\n    seconds_per_day = 86_400\n    average = daily_requests / seconds_per_day   # steady-state rate\n    peak = average * peak_factor                 # busiest moment\n    return average, peak\n\navg, peak = requests_per_second(8_640_000, 4)\nprint(avg)    # 100.0   requests/second on average\nprint(peak)   # 400.0   requests/second at a 4x peak\n```\n\nThe move that separates a good answer from a dangerous one is keeping **average** and **peak** as *separate, stated* steps. Systems do not fail at the average — they fail at the lunchtime spike. A single confident-looking number with no assumptions written down hides bursts, retries, and fan-out, and plans you straight into an outage.",
    example: `def requests_per_second(daily_requests, peak_factor):\n    seconds_per_day = 86_400\n    average = daily_requests / seconds_per_day\n    peak = average * peak_factor\n    return average, peak\n\navg, peak = requests_per_second(8_640_000, 4)\nprint(avg)    # 100.0\nprint(peak)   # 400.0`,
    trace: "Take 8,640,000 requests per day. A day has 86,400 seconds, so `average = 8_640_000 / 86_400` = 100 requests per second — the steady rate. But traffic is bumpy, so we assume a peak that is 4 times the average: `peak = 100 * 4` = 400 requests per second. You size the system for 400, not 100. Keeping the two as separate lines makes the peak assumption visible and easy to challenge — 'why 4x and not 10x?' — instead of buried in one figure.",
    trap: "A single precise-looking number with no assumptions written beside it is false confidence. Average throughput alone hides bursts, retries, request fan-out, replication overhead, and safety headroom — all of which decide whether you stay up.",
    rule: "Write the units next to every number, compute an average first, then apply explicit peak and safety factors as their own steps, and finally point to which assumption dominates the result.",
    recall: "Why should a capacity estimate keep the average load and the peak factor as two separate, stated steps instead of collapsing them into one number?",
    checks: [
      {
        question: "What is back-of-the-envelope capacity estimation really doing?",
        choices: [
          "Bounding the answer to the right order of magnitude — a sanity check, not a prediction",
          "Computing an exact future value",
          "Guessing randomly",
        ],
        answer: 0,
        why: [
          "Correct. The goal is a defensible order-of-magnitude bound to catch designs that cannot possibly work.",
          "It is deliberately approximate, not exact.",
          "It is structured reasoning from stated assumptions, not a random guess.",
        ],
        explanation: "Capacity estimation bounds the order of magnitude; it is a sanity check.",
      },
      {
        question: "Why keep average load and the peak factor as separate steps?",
        choices: [
          "You must size for peak, and separating them makes the peak assumption explicit and checkable",
          "It looks more impressive",
          "Averages are useless",
        ],
        answer: 0,
        why: [
          "Correct. Systems fail at peak, not average; stating the peak multiplier separately keeps the assumption visible and easy to revise.",
          "It is about correctness of the estimate, not appearance.",
          "The average is a needed baseline; the peak factor scales it.",
        ],
        explanation: "Separate average and peak so you can size for peak with an explicit factor.",
      },
      {
        question: "What is an essential early step in any estimate?",
        choices: [
          "Convert every quantity to compatible units before combining them",
          "Pick the largest number you can think of",
          "Skip units to save time",
        ],
        answer: 0,
        why: [
          "Correct. Mismatched units (per-second vs per-day, bits vs bytes) are the most common estimation error; normalize first.",
          "Numbers must come from assumptions, not from picking a big one.",
          "Ignoring units is exactly how these estimates go wrong.",
        ],
        explanation: "Convert to compatible units before combining quantities.",
      },
    ],
    prompt: "Return the ceiling of peak requests per second from `daily_requests` and a positive `peak_factor`.", fn: "peak_rps", starter: `def peak_rps(daily_requests, peak_factor):\n    pass`, solution: `def peak_rps(daily_requests, peak_factor):\n    import math\n    if daily_requests < 0 or peak_factor <= 0:\n        raise ValueError("invalid estimate")\n    return math.ceil(daily_requests / 86_400 * peak_factor)`,
    tests: [t("round", "assert fn(8_640_000, 4) == 400"), t("ceil", "assert fn(1, 1) == 1"), t("invalid", "\ntry:\n fn(10,0); assert False\nexcept ValueError: pass", true)], tier: "problem", minutes: 12, difficulty: [3, 2, 3],
  },
  {
    id: "ml-shapes", module: "py.m13", title: "Shapes, features, and vectorized reasoning", goal: "Track tensor shapes before writing numerical code.", kind: "mental-model", requires: ["lists", "functions", "aggregation-tools"], tracks: ["ml"], skills: ["ml-systems", "linear-algebra"],
    model: "In machine learning, your data lives in rectangular grids of numbers, and the single most common bug is getting the **shape** wrong — mixing up which direction is which. Almost every 'shape mismatch' error is really a *meaning* mismatch: an axis did not hold what you assumed.\n\nSo the habit that saves you: label every axis with what it means before you compute. A feature matrix `X` is usually `(examples, features)` — one row per data point. A weight vector `w` is `(features,)` — one number per feature. Multiplying them gives one score per example.\n\n```python\n# X: 2 examples, each with 3 features\nX = [[1, 0, 2],\n     [0, 3, 1]]\nw = [0.5, 1.0, -1.0]   # one weight per feature\n\ndef scores(X, w):\n    # for each row: pair features with weights, multiply, sum\n    return [sum(f * wi for f, wi in zip(row, w)) for row in X]\n\nprint(scores(X, w))   # [-1.5, 2.0]\n```\n\nThe shapes have to line up: each row of `X` and the vector `w` share the *feature* dimension (3 here), so they can be paired term by term. Two input rows must produce exactly two output scores — if you ever get a different count, an axis meant something other than you thought. Writing the sum as one expression over each row is *vectorization*: the same arithmetic, expressed without hand-written index loops.",
    example: `X = [[1, 0, 2],\n     [0, 3, 1]]\nw = [0.5, 1.0, -1.0]\n\ndef scores(X, w):\n    return [sum(f * wi for f, wi in zip(row, w)) for row in X]\n\nprint(scores(X, w))   # [-1.5, 2.0]`,
    trace: "`X` has 2 rows (examples) and 3 columns (features); `w` has 3 numbers, one per feature — the feature dimension matches, so they can be paired. Row one `[1, 0, 2]` with `w`: `1*0.5 + 0*1.0 + 2*(-1.0)` = `0.5 + 0 - 2.0` = -1.5. Row two `[0, 3, 1]`: `0*0.5 + 3*1.0 + 1*(-1.0)` = `0 + 3.0 - 1.0` = 2.0. Two examples in, two scores out: `[-1.5, 2.0]`. The output count equals the example count, confirming the axes meant what we intended.",
    trap: "An operation that runs without error is not automatically correct. Numbers can line up by accident and get combined along the wrong axis — duplicating or mixing values — with no exception raised. Only a shape you predicted in advance tells you it did the right thing.",
    rule: "Label every axis with its real-world meaning and predict the output shape before you run an operation — then check the result matches that prediction.",
    recall: "If `X` has shape `(n, d)` (n examples, d features) and `w` has shape `(d,)`, how many scores must come out, and what does each one represent?",
    checks: [
      {
        question: "Most ML shape errors are really…",
        choices: [
          "Contract failures — the axes did not mean what you assumed",
          "Hardware failures",
          "Random",
        ],
        answer: 0,
        why: [
          "Correct. Writing what each axis means (examples? features?) turns cryptic shape errors into a clear mismatch you can fix.",
          "They are logic/contract errors, not hardware.",
          "They are deterministic consequences of mismatched axis meanings.",
        ],
        explanation: "Shape errors are axis-meaning (contract) failures; label each axis.",
      },
      {
        question: "`X` has shape `(n, d)` (n examples, d features) and `weights` has shape `(d,)`. What is `X @ weights`?",
        choices: [
          "Shape `(n,)` — one score per example",
          "Shape `(d,)`",
          "A single number",
        ],
        answer: 0,
        why: [
          "Correct. Multiplying each example's d features by the d weights collapses the feature axis, leaving one score per example.",
          "`(d,)` is the weights' shape, not the output; the feature axis is consumed.",
          "It is a vector of n scores, not one scalar.",
        ],
        explanation: "`(n, d) @ (d,)` gives `(n,)` — one score per example.",
      },
      {
        question: "A feature matrix is usually which shape?",
        choices: [
          "`(examples, features)` — rows are examples, columns are features",
          "`(features, examples)` always",
          "A 1-D list",
        ],
        answer: 0,
        why: [
          "Correct. The common convention is one row per example, one column per feature.",
          "That transposed layout exists but is not the usual default; be explicit when you use it.",
          "A feature matrix is 2-D (examples × features), not 1-D.",
        ],
        explanation: "Feature matrices are typically `(examples, features)`.",
      },
    ],
    prompt: "Return one dot-product score per row. Raise ValueError if any row length differs from `weights`.", fn: "linear_scores", starter: `def linear_scores(rows, weights):\n    pass`, solution: `def linear_scores(rows, weights):\n    scores = []\n    for row in rows:\n        if len(row) != len(weights):\n            raise ValueError("shape mismatch")\n        scores.append(sum(value * weight for value, weight in zip(row, weights)))\n    return scores`,
    tests: [t("scores", "assert fn([[1,0,2],[0,3,1]],[.5,1,-1]) == [-1.5,2]"), t("empty batch", "assert fn([], [1,2]) == []"), t("mismatch", "\ntry:\n fn([[1]], [1,2]); assert False\nexcept ValueError: pass", true)], tier: "problem", minutes: 14, difficulty: [3, 2, 3],
  },
  {
    id: "data-leakage", module: "py.m13", title: "Splits, leakage, and honest evaluation", goal: "Construct a time-aware split without letting future information reach training.", kind: "mental-model", requires: ["ml-shapes", "lists", "sorting"], tracks: ["ml"], skills: ["ml-systems", "data"],
    model: "When you build a model you hold out some data to *test* it, so you can estimate how it will do on real, unseen data later. **Data leakage** is the silent killer here: it is when a sneaky bit of information the model should not have at prediction time bleeds into training. The model looks brilliant in testing and then fails in the real world.\n\nThe most common leak is **time**. If your job is to predict the future from the past, you must split by *time*, not randomly — everything before a cutoff trains, everything after validates:\n\n```python\ndef time_split(events, cutoff):\n    events = sorted(events)                    # (timestamp, value), by time\n    train = [e for e in events if e[0] < cutoff]\n    valid = [e for e in events if e[0] >= cutoff]\n    return train, valid\n\ndata = [(1, \"a\"), (5, \"b\"), (3, \"c\"), (8, \"d\")]\ntrain, valid = time_split(data, cutoff=5)\nprint(train)   # [(1, 'a'), (3, 'c')]\nprint(valid)   # [(5, 'b'), (8, 'd')]\n```\n\nA random split would put some *future* events into training — the model would essentially peek at the answers. Leakage also hides in preprocessing: if you compute an average to normalize your data using the *whole* dataset before splitting, the training set has secretly absorbed information from the validation set. The rule of thumb: any statistic the model learns must be computed on training data *only*, then applied unchanged to validation.",
    example: `def time_split(events, cutoff):\n    events = sorted(events)\n    train = [e for e in events if e[0] < cutoff]\n    valid = [e for e in events if e[0] >= cutoff]\n    return train, valid\n\ndata = [(1, "a"), (5, "b"), (3, "c"), (8, "d")]\ntrain, valid = time_split(data, cutoff=5)\nprint(train)   # [(1, 'a'), (3, 'c')]\nprint(valid)   # [(5, 'b'), (8, 'd')]`,
    trace: "Events `[(1,a), (5,b), (3,c), (8,d)]` sort by timestamp to `[(1,a), (3,c), (5,b), (8,d)]`. With `cutoff=5`, training keeps events whose time is strictly less than 5: `(1,a)` and `(3,c)`. Validation keeps time greater than or equal to 5: `(5,b)` and `(8,d)`. Now training only ever saw the past relative to the cutoff, exactly like deployment, where you predict tomorrow using only what happened up to today.",
    trap: "Splitting the data does not save you if you already did feature engineering — like computing a normalization average — over the *entire* dataset first. The leak can happen in code that runs before the split line ever appears.",
    rule: "Recreate deployment's information boundary: split so training never sees future or related-entity data, and fit every learned preprocessing step on the training partition only.",
    recall: "Why does normalizing with a global average (computed over all the data before splitting) leak validation information into training, even though no labels were ever copied across?",
    checks: [
      {
        question: "What is data leakage?",
        choices: [
          "Using information at training time that would not be available at prediction time",
          "Losing rows of data",
          "A memory leak in the program",
        ],
        answer: 0,
        why: [
          "Correct. If training sees anything the deployed model would not have, your evaluation is optimistic and misleading.",
          "It is about information, not lost rows.",
          "It is a statistical/evaluation flaw, not a memory leak.",
        ],
        explanation: "Leakage = training uses info unavailable at prediction time.",
      },
      {
        question: "Why can normalizing with statistics computed over ALL data leak, even without touching labels?",
        choices: [
          "The mean/std include the validation rows, so training indirectly 'sees' them",
          "It cannot leak without labels",
          "Normalization is always safe",
        ],
        answer: 0,
        why: [
          "Correct. Fitting the scaler on the whole dataset bakes validation-set information into the training features.",
          "Leakage does not require labels — shared preprocessing statistics are enough.",
          "Normalization is safe only when fit on training data alone.",
        ],
        explanation: "Global normalization leaks because its stats include validation data.",
      },
      {
        question: "How do you avoid preprocessing leakage?",
        choices: [
          "Fit preprocessing on the training split only, then apply it to validation/test",
          "Fit it on everything for consistency",
          "Skip preprocessing entirely",
        ],
        answer: 0,
        why: [
          "Correct. Learn the transform's parameters from training data, then apply (not re-fit) them to held-out data.",
          "Fitting on everything is exactly the leak.",
          "Preprocessing is fine; it just must be fit on training only.",
        ],
        explanation: "Fit preprocessing on training only, then apply to held-out data.",
      },
    ],
    prompt: "Given `(timestamp, value)` rows, return `(train, validation)` sorted by time, using `timestamp < cutoff` for training. Do not mutate input.", fn: "time_split", starter: `def time_split(rows, cutoff):\n    pass`, solution: `def time_split(rows, cutoff):\n    ordered = sorted(rows, key=lambda row: row[0])\n    train = [row for row in ordered if row[0] < cutoff]\n    validation = [row for row in ordered if row[0] >= cutoff]\n    return train, validation`,
    tests: [t("split", "assert fn([(3,'c'),(1,'a'),(2,'b')], 3) == ([(1,'a'),(2,'b')],[(3,'c')])"), t("boundary", "assert fn([(5,'x')],5) == ([],[(5,'x')])"), t("immutable", "r=[(2,'b'),(1,'a')]; fn(r,2); assert r == [(2,'b'),(1,'a')]", true)], tier: "problem", minutes: 14, difficulty: [4, 2, 4],
  },
  {
    id: "classification-metrics", module: "py.m13", title: "Metrics, thresholds, and class imbalance", goal: "Compute precision and recall and connect each to a deployment cost.", kind: "mental-model", requires: ["data-leakage", "numbers"], tracks: ["ml"], skills: ["ml-systems", "statistics"],
    model: "Suppose 1 in 1000 emails is spam. A lazy model that says 'never spam' is 99.9% *accurate* — and utterly useless. That is why **accuracy hides failure on rare classes**, and why you need two sharper numbers.\n\nStart with the four outcomes: a **true positive** (flagged spam, really spam), a **false positive** (flagged spam, actually fine), a **false negative** (missed spam), and a true negative. From these:\n\n- **Precision** = of everything you *flagged*, how much was right? `tp / (tp + fp)`\n- **Recall** = of everything that *was* positive, how much did you *catch*? `tp / (tp + fn)`\n\n```python\ndef precision_recall(tp, fp, fn):\n    precision = tp / (tp + fp)   # correctness of your alarms\n    recall = tp / (tp + fn)      # coverage of real positives\n    return precision, recall\n\nprint(precision_recall(8, 2, 4))   # (0.8, 0.6666666666666666)\n```\n\nThey pull against each other. Lowering your alarm **threshold** flags more things — you catch more real positives (recall up) but raise more false alarms (precision down). Which way to lean is not a math question, it is a *cost* question: missing cancer (a false negative) is far worse than a false alarm, so medicine favors recall; a spam filter that eats real mail favors precision.",
    example: `def precision_recall(tp, fp, fn):\n    precision = tp / (tp + fp)\n    recall = tp / (tp + fn)\n    return precision, recall\n\nprint(precision_recall(8, 2, 4))   # (0.8, 0.6666666666666666)`,
    trace: "With `tp=8` (caught correctly), `fp=2` (false alarms), `fn=4` (missed): precision = `8 / (8 + 2)` = `8 / 10` = 0.8 — 80% of your alarms were right. Recall = `8 / (8 + 4)` = `8 / 12` = 0.667 — you caught two thirds of the real positives. Notice precision's bottom is 'everything I flagged' while recall's bottom is 'everything that was truly positive' — different denominators, different questions.",
    trap: "Chasing a single aggregate score before you have defined the actual decision and the cost of each error can make a dashboard look better while real users get hurt. Always look at the confusion matrix and at important data slices, not just one number.",
    rule: "Pick your metric from the real-world cost of each kind of error, always report the threshold you used, and check performance across the slices of data you care about.",
    recall: "When a model raises more false-positive alerts, which of the two formulas' denominators grows, and does that push precision or recall down?",
    checks: [
      {
        question: "Why can accuracy be misleading on a rare class?",
        choices: [
          "A model that always predicts the majority class scores high accuracy while missing every rare case",
          "Accuracy is always wrong",
          "Accuracy needs more than two classes",
        ],
        answer: 0,
        why: [
          "Correct. If 99% of cases are negative, predicting 'negative' always is 99% accurate but catches no positives.",
          "Accuracy is fine for balanced problems; it just hides rare-class failure.",
          "The issue is class imbalance, not the number of classes.",
        ],
        explanation: "Accuracy hides failure on a rare class under imbalance.",
      },
      {
        question: "What do precision and recall each ask?",
        choices: [
          "Precision: of predicted positives, how many were correct? Recall: of actual positives, how many were found?",
          "They are the same question",
          "Precision counts negatives; recall counts totals",
        ],
        answer: 0,
        why: [
          "Correct. Precision measures the quality of positive predictions; recall measures coverage of the real positives.",
          "They measure different things and often trade off.",
          "Both are about the positive class, framed by different denominators.",
        ],
        explanation: "Precision = correct among predicted positives; recall = found among actual positives.",
      },
      {
        question: "The model raises more false-positive alerts. Which metric drops, and why?",
        choices: [
          "Precision — its denominator (predicted positives) grows with wrong positives",
          "Recall — it depends on false positives",
          "Neither is affected",
        ],
        answer: 0,
        why: [
          "Correct. More false positives inflate 'predicted positives' without adding correct ones, so precision falls; recall (over actual positives) is unaffected by them.",
          "Recall's denominator is actual positives, which false positives do not change.",
          "Precision is directly affected by false positives.",
        ],
        explanation: "More false positives lower precision (predicted-positive denominator grows).",
      },
    ],
    prompt: "Return `(precision, recall, f1)` from nonnegative tp, fp, fn. Use 0.0 when a denominator is zero.", fn: "classification_metrics", starter: `def classification_metrics(tp, fp, fn):\n    pass`, solution: `def classification_metrics(tp, fp, fn):\n    if min(tp, fp, fn) < 0:\n        raise ValueError("counts must be nonnegative")\n    precision = tp / (tp + fp) if tp + fp else 0.0\n    recall = tp / (tp + fn) if tp + fn else 0.0\n    f1 = 2 * precision * recall / (precision + recall) if precision + recall else 0.0\n    return precision, recall, f1`,
    tests: [t("ordinary", "p,r,f=fn(8,2,4); assert abs(p-.8)<1e-9 and abs(r-2/3)<1e-9 and abs(f-8/11)<1e-9"), t("none", "assert fn(0,0,0) == (0.0,0.0,0.0)"), t("bad", "\ntry:\n fn(-1,0,0); assert False\nexcept ValueError: pass", true)], tier: "problem", minutes: 16, difficulty: [4, 2, 4],
  },
  {
    id: "gradient-descent", module: "py.m13", title: "Optimization and gradient descent", goal: "Trace a gradient update and recognize divergence or stalled learning.", kind: "mental-model", requires: ["classification-metrics", "loops"], tracks: ["ml"], skills: ["ml-systems", "optimization"],
    model: "**Gradient descent** is how models *learn*. Picture standing on a foggy hill wanting to reach the bottom: you feel which way the ground slopes down and take a small step that way, over and over. The 'hill' is the **loss** (how wrong the model is), and the *gradient* is the slope telling you which direction makes it worse — so you step the opposite way.\n\nHere we tune one number `w` toward a target of 10. The loss is the squared error, and its slope (gradient) is `2 * (w - target)`:\n\n```python\ndef descend(w, target, rate, steps):\n    for _ in range(steps):\n        gradient = 2 * (w - target)   # slope of (w - target) squared\n        w -= rate * gradient          # step downhill\n        print(round(w, 3))\n    return w\n\ndescend(w=0, target=10, rate=0.25, steps=4)\n# 5.0\n# 7.5\n# 8.75\n# 9.375\n```\n\nThe **learning rate** is your step size, and it is a delicate dial. Too small and you crawl for thousands of steps; too large and you overshoot the valley and bounce *further* away each time (divergence). Watching the numbers climb smoothly toward 10 tells you the rate is healthy.",
    example: `def descend(w, target, rate, steps):\n    for _ in range(steps):\n        gradient = 2 * (w - target)\n        w -= rate * gradient\n        print(round(w, 3))\n    return w\n\ndescend(w=0, target=10, rate=0.25, steps=4)\n# 5.0\n# 7.5\n# 8.75\n# 9.375`,
    trace: "Start `w=0`, `target=10`, `rate=0.25`. Step 1: gradient = `2 * (0 - 10)` = -20; `w -= 0.25 * (-20)` means `w = 0 + 5` = 5.0. Step 2: gradient = `2 * (5 - 10)` = -10; `w = 5 + 2.5` = 7.5. Step 3: gradient = `2 * (7.5 - 10)` = -5; `w = 7.5 + 1.25` = 8.75. Step 4: `w = 8.75 + 0.625` = 9.375. The distance to 10 halved every step — 10, then 5, 2.5, 1.25, 0.625 — the signature of a well-chosen learning rate closing in on the target.",
    trap: "A training loss that keeps dropping does NOT prove the model learned anything useful. Data leakage, overfitting, or a broken validation path all produce the same pretty downward curve while the model fails on real data.",
    rule: "Log both the training loss and separate validation evidence, watch the size of the gradient, and always judge 'is it optimizing?' apart from 'is it generalizing?'",
    recall: "A training loss that steadily decreases proves the optimizer is working — but what important thing does it fail to prove on its own?",
    checks: [
      {
        question: "What does gradient descent do each step?",
        choices: [
          "Moves the parameters a small step opposite the loss's local slope",
          "Jumps to the exact minimum in one step",
          "Moves parameters in a random direction",
        ],
        answer: 0,
        why: [
          "Correct. The gradient points uphill, so stepping against it reduces the loss a little at a time.",
          "It is iterative; a single jump to the minimum is not how it works.",
          "The direction is set by the gradient, not randomness.",
        ],
        explanation: "Gradient descent steps downhill, opposite the loss gradient.",
      },
      {
        question: "What happens if the learning rate is too large?",
        choices: [
          "Steps overshoot and the loss can bounce or diverge",
          "Training is always more accurate",
          "Nothing changes",
        ],
        answer: 0,
        why: [
          "Correct. Too-big steps jump past the minimum and can grow the loss instead of shrinking it. Too small, and progress is painfully slow.",
          "A large rate risks divergence, not guaranteed accuracy.",
          "Step size strongly affects convergence.",
        ],
        explanation: "Too-large a learning rate overshoots/diverges; too-small is slow.",
      },
      {
        question: "A steadily *decreasing training loss* proves what?",
        choices: [
          "That the model is fitting the training data — NOT that it will generalize to new data",
          "That the model is ready to deploy",
          "That there is no bug",
        ],
        answer: 0,
        why: [
          "Correct. Falling training loss only shows learning on seen data; generalization must be checked on held-out data (it may be overfitting).",
          "Low training loss can mean overfitting, not readiness.",
          "It says nothing about bugs elsewhere.",
        ],
        explanation: "Decreasing training loss shows fitting the training set, not generalization.",
      },
    ],
    prompt: "Starting at `weight`, perform `steps` gradient updates for `(weight-target)^2` and return the final weight.", fn: "fit_scalar", starter: `def fit_scalar(weight, target, rate, steps):\n    pass`, solution: `def fit_scalar(weight, target, rate, steps):\n    for _ in range(steps):\n        gradient = 2 * (weight - target)\n        weight -= rate * gradient\n    return weight`,
    tests: [t("one", "assert fn(0,10,.25,1) == 5"), t("converges", "assert abs(fn(0,10,.25,20)-10) < .001"), t("zero steps", "assert fn(3,9,.1,0) == 3")], tier: "problem", minutes: 15, difficulty: [4, 2, 4],
  },
  {
    id: "expected-value", module: "py.m14", title: "Expected value as a weighted sum", goal: "Compute expectation and use linearity before enumerating complicated outcomes.", kind: "mental-model", requires: ["numbers", "loops", "aggregation-tools"], tracks: ["quant"], skills: ["probability", "statistics"],
    model: "**Expected value** is the long-run average of a random outcome — what you would get *per try* if you repeated a bet thousands of times. You compute it by weighting each possible outcome by its probability and adding them up. It is the single most important number in quant reasoning.\n\nSay a game loses 2 dollars 75% of the time and wins 10 dollars 25% of the time:\n\n```python\ndef expected_value(outcomes):\n    # outcomes: list of (payoff, probability)\n    return sum(payoff * prob for payoff, prob in outcomes)\n\ngame = [(-2, 0.75), (10, 0.25)]\nprint(expected_value(game))   # 1.0\n```\n\nThe expected value is 1 dollar — yet the game *never* pays exactly 1 dollar. That is the mind-bending part beginners must absorb: expected value is not the most likely outcome and may be impossible in a single trial. It is the average you converge to over many trials.\n\nIts superpower is **linearity**: the expected value of a sum equals the sum of the expected values, *even when the pieces depend on each other*. That lets you break a scary total (like the expected number of matching birthdays in a room) into tiny, easy per-item expectations and just add them.",
    example: `def expected_value(outcomes):\n    return sum(payoff * prob for payoff, prob in outcomes)\n\ngame = [(-2, 0.75), (10, 0.25)]\nprint(expected_value(game))   # 1.0`,
    trace: "Each outcome is a `(payoff, probability)` pair. For `(-2, 0.75)` the contribution is `-2 * 0.75` = -1.5. For `(10, 0.25)` it is `10 * 0.25` = 2.5. Summing: `-1.5 + 2.5` = 1.0. So the game is worth 1 dollar on average per play, even though any single play returns either -2 or +10 and never 1. The probabilities are valid because they are non-negative and add to `0.75 + 0.25` = 1.",
    trap: "A positive expected value tells you nothing about risk. Two bets with the same average can have wildly different swings — one steady, one that can wipe you out — so never judge a bet on its mean alone.",
    rule: "Define the random variable and its full list of outcomes and probabilities first; compute the expectation, then study the spread and any constraints as separate questions.",
    recall: "How can a game have an expected payoff of exactly one dollar while never paying out one dollar on any single play?",
    checks: [
      {
        question: "What is expected value?",
        choices: [
          "The probability-weighted average of all possible outcomes",
          "The single most likely outcome",
          "The largest possible outcome",
        ],
        answer: 0,
        why: [
          "Correct. Each outcome is weighted by its probability and summed — a long-run average.",
          "The most likely outcome is the mode, not the expectation.",
          "The maximum is one outcome, not the weighted average.",
        ],
        explanation: "Expected value is the probability-weighted average of outcomes.",
      },
      {
        question: "Can the expected value be an outcome that never actually happens in one trial?",
        choices: [
          "Yes — it is a long-run average, not a single result (e.g. an EV of $1 in a game paying only $0 or $5)",
          "No — the EV must be a possible outcome",
          "Only for dice",
        ],
        answer: 0,
        why: [
          "Correct. The average of the possible payoffs need not equal any single payoff.",
          "The EV often is not among the possible single results.",
          "This is general, not specific to dice.",
        ],
        explanation: "EV is a long-run average and need not be a possible single outcome.",
      },
      {
        question: "What is special about linearity of expectation?",
        choices: [
          "`E[A + B] = E[A] + E[B]` holds even when A and B are dependent",
          "It only works for independent variables",
          "It only works for two variables",
        ],
        answer: 0,
        why: [
          "Correct. Expectation adds across sums regardless of dependence, which makes many hard counts easy.",
          "Unlike variance, it does NOT require independence.",
          "It extends to any number of terms.",
        ],
        explanation: "Linearity of expectation adds across sums even under dependence.",
      },
    ],
    prompt: "Given `(value, probability)` outcomes, validate the distribution and return expected value. Accept total probability within 1e-9 of one.", fn: "expected_value", starter: `def expected_value(outcomes):\n    pass`, solution: `def expected_value(outcomes):\n    if any(probability < 0 for _, probability in outcomes):\n        raise ValueError("negative probability")\n    total = sum(probability for _, probability in outcomes)\n    if abs(total - 1.0) > 1e-9:\n        raise ValueError("probabilities must sum to one")\n    return sum(value * probability for value, probability in outcomes)`,
    tests: [t("game", "assert abs(fn([(-2,.75),(10,.25)])-1) < 1e-9"), t("certain", "assert fn([(7,1.0)]) == 7"), t("invalid", "\ntry:\n fn([(1,.2)]); assert False\nexcept ValueError: pass", true)], tier: "problem", minutes: 13, difficulty: [3, 2, 3],
  },
  {
    id: "bayes-rule", module: "py.m14", title: "Conditional probability and Bayes' rule", goal: "Update a prior using evidence without confusing inverse conditionals.", kind: "mental-model", requires: ["expected-value"], tracks: ["quant"], skills: ["probability", "statistics"],
    model: "**Bayes' rule** tells you how to update a belief when new evidence arrives. The famous trap it fixes: a test being 90% accurate does NOT mean a positive result is 90% likely to be real — because if the thing is *rare*, most positives are false alarms.\n\nThe clearest way to see it is with real headcounts. Say a disease affects 1% of people, the test catches 90% of sick people, but also flags 5% of healthy people. Out of 10,000 people:\n\n```python\ndef posterior(prior, hit_rate, false_alarm):\n    population = 10_000\n    sick = population * prior                 # 100 people are sick\n    healthy = population - sick               # 9,900 are healthy\n    true_positives = sick * hit_rate          # 90 sick test positive\n    false_positives = healthy * false_alarm   # 495 healthy test positive\n    return true_positives / (true_positives + false_positives)\n\nprint(round(posterior(0.01, 0.90, 0.05), 3))   # 0.154\n```\n\nEven with a positive test from a good test, the chance you are actually sick is only about **15%** — because the 90 real cases are swamped by 495 false alarms. That is the **base rate** at work: when an event is rare, its rarity dominates, and a strong signal still yields a modest answer. The evidence denominator is the *total* of positives from both groups.",
    example: `def posterior(prior, hit_rate, false_alarm):\n    population = 10_000\n    sick = population * prior\n    healthy = population - sick\n    true_positives = sick * hit_rate\n    false_positives = healthy * false_alarm\n    return true_positives / (true_positives + false_positives)\n\nprint(round(posterior(0.01, 0.90, 0.05), 3))   # 0.154`,
    trace: "Imagine 10,000 people. With a prior of 0.01, `sick = 10000 * 0.01` = 100 and `healthy` = 9,900. Of the sick, 90% test positive: `true_positives = 100 * 0.90` = 90. Of the healthy, 5% test positive: `false_positives = 9900 * 0.05` = 495. Among all `90 + 495` = 585 positive tests, only 90 are truly sick, so the answer is `90 / 585` = 0.154, about 15%. The false alarms outnumber the real cases five to one because healthy people vastly outnumber sick ones.",
    trap: "The probability of the evidence given the hypothesis is NOT the probability of the hypothesis given the evidence. Swapping those two throws away the base rate, and it is one of the most common — and most expensive — mistakes in probability.",
    rule: "Write each conditional out in plain words, expand the evidence into the total across every mutually exclusive group, and sanity-check the answer against how rare the thing was to begin with.",
    recall: "In the headcount version, where exactly does the base rate (how rare the event is) enter and pull the final answer down?",
    checks: [
      {
        question: "What does Bayes' rule do?",
        choices: [
          "Combines a prior with a likelihood to produce an updated (posterior) probability",
          "Sorts probabilities",
          "Proves a hypothesis true",
        ],
        answer: 0,
        why: [
          "Correct. It updates a belief (prior) using how well the evidence fits each hypothesis (likelihood).",
          "It updates beliefs, it does not sort.",
          "It yields a probability, never certainty.",
        ],
        explanation: "Bayes' rule updates a prior with a likelihood into a posterior.",
      },
      {
        question: "Where does the base rate enter the calculation?",
        choices: [
          "As the prior — it weights how likely each hypothesis was before the evidence",
          "It does not; only the test result matters",
          "As the final answer",
        ],
        answer: 0,
        why: [
          "Correct. The base rate is the prior probability, and ignoring it causes the base-rate fallacy.",
          "The base rate is essential — a positive test on a rare condition is often still probably a false positive.",
          "It is an input (the prior), not the output.",
        ],
        explanation: "The base rate is the prior in Bayes' rule.",
      },
      {
        question: "A test is quite accurate but the condition is very rare. A positive result means…",
        choices: [
          "It may well still be a false positive — the low base rate keeps the posterior low",
          "The person almost certainly has the condition",
          "The test is broken",
        ],
        answer: 0,
        why: [
          "Correct. When positives are dominated by the huge healthy population's false positives, a positive test often still means low probability of the condition.",
          "Ignoring the base rate here is the classic base-rate fallacy.",
          "The test is fine; the rarity is what drives the counterintuitive result.",
        ],
        explanation: "With a rare condition, a positive test can still be probably false — the base rate dominates.",
      },
    ],
    prompt: "Return `P(H|E)` from prior `P(H)`, true-positive likelihood `P(E|H)`, and false-positive likelihood `P(E|not H)`.", fn: "bayes_update", starter: `def bayes_update(prior, likelihood, false_positive):\n    pass`, solution: `def bayes_update(prior, likelihood, false_positive):\n    if any(value < 0 or value > 1 for value in (prior, likelihood, false_positive)):\n        raise ValueError("probabilities must be in [0, 1]")\n    evidence = prior * likelihood + (1 - prior) * false_positive\n    if evidence == 0:\n        raise ValueError("evidence has zero probability")\n    return prior * likelihood / evidence`,
    tests: [t("base rate", "assert abs(fn(.01,.9,.05)-(.009/.0585)) < 1e-9"), t("certain", "assert fn(1, .4, .8) == 1"), t("impossible", "\ntry:\n fn(.5,0,0); assert False\nexcept ValueError: pass", true)], tier: "problem", minutes: 16, difficulty: [4, 2, 4],
  },
  {
    id: "combinatorics", module: "py.m14", title: "Counting without enumeration", goal: "Recognize when order matters and compute combinations safely.", kind: "mental-model", requires: ["bayes-rule", "loops"], tracks: ["quant"], skills: ["probability", "combinatorics"],
    model: "**Combinatorics** is counting possibilities without listing them one by one. The first question to ask is always: *does order matter?* If yes, you are counting **permutations** (ordered arrangements — a race podium: gold, silver, bronze). If no, you are counting **combinations** (unordered selections — which 3 friends you invite, order irrelevant).\n\nThe workhorse is 'n choose k', written `C(n, k)` — the number of ways to pick k items from n when order does not matter. The safe way to compute it keeps everything as exact integers instead of dividing giant factorials:\n\n```python\ndef choose(n, k):\n    k = min(k, n - k)          # symmetry: picking k in = leaving n-k out\n    result = 1\n    for i in range(1, k + 1):\n        result = result * (n - k + i) // i   # stays a whole number each step\n    return result\n\nprint(choose(5, 3))   # 10\n```\n\nTwo tricks matter. First, **symmetry**: choosing which 3 of 5 to include is the same as choosing which 2 to leave out, so `C(5, 3)` equals `C(5, 2)` — always compute with the smaller count for speed. Second, use integer division `//` and multiply-then-divide so each partial result stays an exact whole number, dodging both floating-point error and huge factorial intermediates.",
    example: `def choose(n, k):\n    k = min(k, n - k)\n    result = 1\n    for i in range(1, k + 1):\n        result = result * (n - k + i) // i\n    return result\n\nprint(choose(5, 3))   # 10`,
    trace: "Call `choose(5, 3)`. Symmetry sets `k = min(3, 5 - 3)` = 2, so we do less work. Start `result = 1`. Step `i=1`: `result = 1 * (5 - 2 + 1) // 1` = `4 // 1` = 4. Step `i=2`: `result = 4 * (5 - 2 + 2) // 2` = `20 // 2` = 10. Loop ends, return 10. Each partial value (4, then 10) was a whole number, so no rounding error ever crept in. And `choose(5, 3)` came out equal to `choose(5, 2)`, exactly as symmetry promised.",
    trap: "Listing every subset just to count them turns a quick arithmetic question into exponential work — there are far too many subsets to enumerate for large n. And using plain `/` division turns exact integers into floats, introducing rounding error in what should be an exact count.",
    rule: "Before picking a formula, decide whether order matters and whether items can repeat; then keep every step in exact integer arithmetic.",
    recall: "Why is it always valid — and worth doing — to replace k with the smaller of k and n minus k before computing a combination?",
    checks: [
      {
        question: "What is the difference between permutations and combinations?",
        choices: [
          "Permutations count ordered arrangements; combinations count unordered selections",
          "They are the same",
          "Permutations are always smaller",
        ],
        answer: 0,
        why: [
          "Correct. If order matters it is a permutation; if only the chosen set matters it is a combination.",
          "They differ by whether order counts.",
          "Permutations are larger (they count each ordering separately).",
        ],
        explanation: "Permutations = ordered; combinations = unordered.",
      },
      {
        question: "Why is `C(n, k) = C(n, n-k)`?",
        choices: [
          "Choosing k to include is the same as choosing the n-k to leave out",
          "It is a coincidence",
          "Only when k = 0",
        ],
        answer: 0,
        why: [
          "Correct. Every selection of k items uniquely determines the n-k left behind, so the counts match.",
          "It is a real symmetry, not coincidence.",
          "It holds for all k, not just k = 0.",
        ],
        explanation: "Choosing k to keep = choosing n-k to drop, so `C(n,k)=C(n,n-k)`.",
      },
      {
        question: "Why compute `n choose k` using `min(k, n-k)`?",
        choices: [
          "By symmetry the answer is the same, but the smaller value means fewer multiplications and less overflow risk",
          "It gives a different, larger answer",
          "It only works when k is even",
        ],
        answer: 0,
        why: [
          "Correct. `C(n,k)=C(n,n-k)`, so using the smaller of the two keeps the computation cheaper and safer.",
          "The answer is identical; only the work changes.",
          "Parity of k is irrelevant.",
        ],
        explanation: "Symmetry lets you use the smaller of k and n-k for a cheaper computation.",
      },
    ],
    prompt: "Return the exact binomial coefficient `n choose k`, or 0 when k is outside 0..n, without factorials.", fn: "choose", starter: `def choose(n, k):\n    pass`, solution: `def choose(n, k):\n    if k < 0 or k > n:\n        return 0\n    k = min(k, n - k)\n    result = 1\n    for i in range(1, k + 1):\n        result = result * (n - k + i) // i\n    return result`,
    tests: [t("five", "assert fn(5,3) == 10"), t("edges", "assert fn(8,0) == 1 and fn(8,8) == 1"), t("outside", "assert fn(4,5) == 0"), t("large exact", "assert fn(50,6) == 15890700", true)], tier: "problem", minutes: 15, difficulty: [4, 2, 4],
  },
  {
    id: "monte-carlo", module: "py.m14", title: "Simulation, uncertainty, and reproducibility", goal: "Build a seeded Monte Carlo estimator and report what its error means.", kind: "mental-model", requires: ["combinatorics", "modules"], tracks: ["quant"], skills: ["probability", "simulation"],
    model: "**Monte Carlo** simulation answers a hard question by *rolling dice many times and averaging*. When the math is too tangled to solve directly, you sample random outcomes, average them, and the average converges on the true answer.\n\nThe classic demo: estimate pi. Throw random darts at a 1-by-1 square; the fraction that land inside a quarter circle equals the quarter circle's area, which is pi over 4. A point `(x, y)` is inside when `x*x + y*y <= 1`:\n\n```python\nimport random\n\ndef estimate_pi(samples, seed):\n    rng = random.Random(seed)   # a local, seeded generator\n    inside = 0\n    for _ in range(samples):\n        x, y = rng.random(), rng.random()\n        if x * x + y * y <= 1:  # inside the quarter circle\n            inside += 1\n    return 4 * inside / samples\n\nprint(estimate_pi(100_000, seed=42))   # approximately 3.14\n```\n\nTwo ideas make this trustworthy. First, the **accuracy scales as one over the square root of the sample count** — so to make your error 10 times smaller you need about *100 times* more samples. Precision is expensive. Second, the **seed** (`random.Random(seed)`) makes the run reproducible so you can debug it — but a fixed seed does not make the estimate *correct*; only enough samples does that.",
    example: `import random\n\ndef estimate_pi(samples, seed):\n    rng = random.Random(seed)\n    inside = 0\n    for _ in range(samples):\n        x, y = rng.random(), rng.random()\n        if x * x + y * y <= 1:\n            inside += 1\n    return 4 * inside / samples\n\nprint(estimate_pi(100_000, seed=42))   # approximately 3.14`,
    trace: "Make one local generator `rng = random.Random(42)` so results repeat. For each of the 100,000 samples, draw `x` and `y` between 0 and 1 and test `x * x + y * y <= 1` — is the dart inside the quarter circle? Count how many land inside; say about 78,540 do. The inside fraction is `78540 / 100000` = 0.7854, which estimates pi over 4, so `4 * 0.7854` is about 3.1416. More samples tighten that estimate, but only slowly — a hundredfold more darts for a tenfold better answer.",
    trap: "Reporting a simulated number with no sample size, uncertainty, or convergence check is precision theater — it looks exact but isn't. And re-seeding *inside* the loop resets the generator every iteration, drawing the same value over and over instead of independent samples.",
    rule: "Use one local seeded generator, sanity-check that your sampling model matches the real problem, watch the estimate converge, and always report its uncertainty alongside the number.",
    recall: "If the error shrinks like one over the square root of the sample count, roughly how many more samples do you need to cut the error to a tenth?",
    checks: [
      {
        question: "What does a Monte Carlo estimate do?",
        choices: [
          "Approximates a hard expectation by averaging many random sampled outcomes",
          "Computes the exact answer with algebra",
          "Sorts the outcomes",
        ],
        answer: 0,
        why: [
          "Correct. When an expectation is hard to derive, you simulate outcomes and average them.",
          "It is an approximation from samples, not an exact derivation.",
          "It averages samples; it does not sort.",
        ],
        explanation: "Monte Carlo estimates an expectation by averaging sampled outcomes.",
      },
      {
        question: "How does the sampling error typically shrink with sample count n?",
        choices: [
          "Proportional to `1/sqrt(n)`",
          "Proportional to `1/n`",
          "It does not shrink",
        ],
        answer: 0,
        why: [
          "Correct. Independent-sample error falls like one over the square root of n — diminishing returns.",
          "It falls slower than `1/n`; the square root makes extra samples less valuable.",
          "More samples do reduce error, just slowly.",
        ],
        explanation: "Monte Carlo error scales like `1/sqrt(n)`.",
      },
      {
        question: "To make the error 10 times smaller, about how many more samples do you need?",
        choices: [
          "About 100 times as many (because error ∝ 1/sqrt(n))",
          "About 10 times as many",
          "Twice as many",
        ],
        answer: 0,
        why: [
          "Correct. Since error scales as 1/sqrt(n), cutting it by 10 needs 10² = 100 times the samples.",
          "10x more samples only cuts error by about sqrt(10) ≈ 3.2x.",
          "Doubling barely helps — error drops by only about 1.4x.",
        ],
        explanation: "10x less error needs ~100x more samples (1/sqrt(n) scaling).",
      },
    ],
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

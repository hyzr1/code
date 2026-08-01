/**
 * Optional DIY project checkpoints, sprinkled through the course roughly every
 * couple of lessons. After a keyed lesson, the learner is offered three cool
 * projects and picks one to build on their own — no submission, no grading.
 *
 * The hard rule: a checkpoint may only rely on concepts taught at or before its
 * lesson, so nothing here ever needs a tool the learner has not met yet.
 * Anything that points forward is flagged as an optional stretch, never a
 * requirement. Checkpoints sit at points with enough cumulative power for a
 * project that is actually fun, not a warm-up.
 */
export interface ProjectIdea {
  title: string;
  /** One line on why it is worth building. */
  hook: string;
  /** What to build, in two or three sentences. */
  build: string;
  /** Concepts it applies — all already taught by this point. */
  uses: string[];
  /** An optional harder extension. */
  stretch?: string;
}

/** Keyed by full lesson id (`py.lesson.<id>`): the gallery shows after it. */
export const LESSON_PROJECTS: Record<string, ProjectIdea[]> = {
  "py.lesson.strings": [
    {
      title: "Cosmic Profile Card",
      hook: "See yourself in cosmic units.",
      build: "Ask for a name, birth year, and weight, then print a profile card showing your age, your weight on the Moon (about 16.6% of Earth's), and a rough count of the heartbeats you've lived so far.",
      uses: ["variables", "arithmetic", "f-strings", "functions"],
      stretch: "Add your age on Mars, where a year is about 687 Earth days.",
    },
    {
      title: "Diner Bill Splitter",
      hook: "Never fumble the check again.",
      build: "Take a bill total, a tip percentage, and a headcount, then print each person's exact share including the tip. Keep the math in small, named functions.",
      uses: ["arithmetic", "f-strings", "functions"],
      stretch: "Add a tax rate and print subtotal, tax, and tip as separate lines.",
    },
    {
      title: "Time Machine",
      hook: "Turn a pile of seconds into human time.",
      build: "Read a number of seconds and print it as days, hours, minutes, and seconds, using integer division and remainder to peel off each unit.",
      uses: ["`//` and `%`", "f-strings", "functions"],
      stretch: "Also report how many whole weeks that span covers.",
    },
  ],
  "py.lesson.loops": [
    {
      title: "Hangman",
      hook: "The classic word game, built from scratch.",
      build: "One player sets a secret word; the other guesses letters. Loop until they win or run out of lives, revealing correct letters in place and tracking the wrong ones.",
      uses: ["lists", "loops", "branching", "slicing"],
      stretch: "Draw the ASCII gallows filling in as the lives run out.",
    },
    {
      title: "Choose-Your-Own Adventure",
      hook: "A story that bends to the reader's choices.",
      build: "Write a short branching adventure: a while loop reads the player's choice each scene and an if/elif chain sends them toward different endings.",
      uses: ["branching", "while loops", "input"],
      stretch: "Give the player an inventory list they collect items into.",
    },
    {
      title: "The Mind Reader",
      hook: "The program guesses YOUR number in seven tries.",
      build: "Think of a number from 1 to 100. The program guesses, you answer higher or lower, and it narrows the range by halving each time until it nails your number.",
      uses: ["while loops", "branching", "arithmetic"],
      stretch: "Count the guesses and prove it never needs more than seven.",
    },
  ],
  "py.lesson.functions": [
    {
      title: "Text X-Ray",
      hook: "Analyze any block of text at a glance.",
      build: "Paste in text and report the word count, the longest word, the average word length, and a little ASCII bar chart of how many words have each length.",
      uses: ["split", "loops", "len / max / sum", "slicing"],
      stretch: "Estimate reading time assuming 200 words per minute.",
    },
    {
      title: "Bar Chart Studio",
      hook: "Turn numbers into a picture.",
      build: "Given a list of labelled numbers, draw a horizontal ASCII bar chart, scaling the longest bar to fit and lining up the labels with enumerate.",
      uses: ["loops", "enumerate", "max", "string building"],
      stretch: "Add a marker line for the average across all the bars.",
    },
    {
      title: "Grade Book Lite",
      hook: "Crunch a whole class in one pass.",
      build: "Feed in a list of scores and report the average, the highest and lowest, and how many students passed, all with the collection tools you now know.",
      uses: ["lists", "sum / len / max / min", "branching", "functions"],
      stretch: "Assign letter grades and print a tiny distribution.",
    },
  ],
  "py.lesson.sets": [
    {
      title: "Contact Book",
      hook: "A phone book that actually looks things up.",
      build: "Store contacts as a dictionary of name to number, then add, look up, and list them from a small menu. Direct key lookup beats scanning a list every time.",
      uses: ["dicts", "dict iteration", "branching", "loops"],
      stretch: "Refuse to overwrite an existing name unless the user confirms.",
    },
    {
      title: "Common Ground",
      hook: "Who do two people both know?",
      build: "Given two lists of friends, use sets to find the friends they share, the ones unique to each person, and everyone combined — the exact math behind 'mutual friends'.",
      uses: ["sets", "intersection / difference / union"],
      stretch: "Read the two friend lists from the user at runtime.",
    },
    {
      title: "Tally Counter",
      hook: "Count anything — votes, dice, letters.",
      build: "Tally how many times each item appears in a list using a dictionary, then print the counts in neat aligned columns.",
      uses: ["dicts", "loops", "format specs"],
      stretch: "Use a set to also report which items appeared exactly once.",
    },
  ],
  "py.lesson.complexity": [
    {
      title: "Word Cloud, Text Edition",
      hook: "Find what a piece of writing is really about.",
      build: "Count how often each word appears, then print the top ten as a clean, right-aligned bar chart, sorted so the loudest words rise to the top.",
      uses: ["dicts", "sorted with a key", "format specs", "comprehensions"],
      stretch: "Ignore filler words by keeping a set of stop words.",
    },
    {
      title: "Expense Tracker",
      hook: "Where did the money actually go?",
      build: "Store a list of (category, amount) expenses, total them by category, and print a tidy report with aligned columns sorted from biggest spend to smallest.",
      uses: ["dicts", "tuples", "sorting", "format specs"],
      stretch: "Flag any category that blows past a budget you set.",
    },
    {
      title: "Anagram Machine",
      hook: "Untangle the scrambled words.",
      build: "Group every set of anagrams together by using each word's sorted letters as a dictionary key, so 'listen', 'silent', and 'enlist' all land in one bucket.",
      uses: ["dicts", "sorted", "comprehensions"],
      stretch: "Load a big word list and find the largest anagram family.",
    },
  ],
  "py.lesson.decorators": [
    {
      title: "Dice Lab",
      hook: "Watch probability appear before your eyes.",
      build: "Roll two dice thousands of times, tally every total with a Counter, and print the counts as a bar chart. The bell curve emerges on its own.",
      uses: ["random", "collections.Counter", "loops", "format specs"],
      stretch: "Add a `@timer` decorator that reports how long the run took.",
    },
    {
      title: "Real Hangman",
      hook: "Now the computer picks the word.",
      build: "Upgrade Hangman so the program chooses a random secret from a word list, and wrap the input in try/except so a stray keypress never crashes the game.",
      uses: ["random", "exceptions", "lists", "loops"],
      stretch: "Group words into categories and let the player pick a theme.",
    },
    {
      title: "Quiz Show",
      hook: "A game-show quiz in your terminal.",
      build: "Ask a shuffled set of questions, score the answers, and time the whole run, then print a punchy results screen.",
      uses: ["random", "exceptions", "dicts", "a timing decorator"],
      stretch: "Keep a high score between runs (persist it for real in Module 5).",
    },
  ],
  "py.lesson.protocols": [
    {
      title: "Card Table",
      hook: "Build a real deck and deal a real game.",
      build: "Model Card and Deck classes, shuffle and deal, then implement a round of War or blackjack. The deck knows how to deal itself; the game just asks.",
      uses: ["classes", "dataclasses", "random", "lists"],
      stretch: "Make cards comparable so you can sort and rank a hand.",
    },
    {
      title: "The Vault",
      hook: "An account that enforces its own rules.",
      build: "Build an Account class that guards its balance — deposits, withdrawals, and a clear error on overdraft — behind a small menu loop.",
      uses: ["classes", "exceptions", "branching", "loops"],
      stretch: "Support several accounts and transfers between them.",
    },
    {
      title: "Dungeon Duel",
      hook: "Turn-based combat with real objects.",
      build: "Give a Hero and a Monster health, attack, and defense, then run a turn-based battle to the death with a bit of randomness in each swing.",
      uses: ["classes", "composition", "random", "loops"],
      stretch: "Add items and spells as small composed objects.",
    },
  ],
  "py.lesson.files-json": [
    {
      title: "Pocket Journal",
      hook: "Notes that survive a restart.",
      build: "Build a note or to-do app that saves entries to a JSON file and loads them again on startup, so your data outlives the program.",
      uses: ["files", "json", "context managers", "dicts"],
      stretch: "Add tags and let the user filter entries by tag.",
    },
    {
      title: "Log Detective",
      hook: "Make sense of a messy log file.",
      build: "Read a real log file line by line, count events by type, find the busiest time window, and report the top errors.",
      uses: ["file I/O", "generators", "Counter", "sorting"],
      stretch: "Stream a file too big to fit in memory without loading it all.",
    },
    {
      title: "Sudoku Referee",
      hook: "Judge any Sudoku board instantly.",
      build: "Given a 9x9 grid, verify that every row, column, and 3x3 box has no repeats, using sets to spot duplicates and itertools to walk the boxes.",
      uses: ["itertools", "sets", "files / json"],
      stretch: "Turn the referee into a solver with backtracking (Module 8).",
    },
  ],
  "py.lesson.caching": [
    {
      title: "The Tested Toolkit",
      hook: "Ship a small library you actually trust.",
      build: "Build a focused utility library — a text or stats toolkit — then cover it with a real pytest suite and get it clean under a type checker.",
      uses: ["type hints", "testing", "functions"],
      stretch: "Add a property-style test that throws many random inputs at it.",
    },
    {
      title: "Speed Lab",
      hook: "Feel the difference caching makes.",
      build: "Implement a naive recursive solution — Fibonacci, grid paths, coin change — and an lru_cache version, then measure how exponential becomes instant.",
      uses: ["lru_cache", "recursion", "performance measurement"],
      stretch: "Chart the runtime as the input size grows.",
    },
    {
      title: "Bug Hunt",
      hook: "Practice the debugging method itself.",
      build: "Take a deliberately broken program and use one-hypothesis-at-a-time debugging plus tests to find the first point where the state goes wrong.",
      uses: ["debugging", "testing", "everything so far"],
      stretch: "Add assertions that would have caught the bug immediately.",
    },
  ],
  "py.lesson.parallelism": [
    {
      title: "Weather Wall",
      hook: "Fetch many things at once.",
      build: "Poll several public APIs (or read several files) concurrently with asyncio and show a combined dashboard, then compare it to doing them one at a time.",
      uses: ["asyncio", "exceptions", "dicts"],
      stretch: "Add a refresh loop that updates the wall every few seconds.",
    },
    {
      title: "Batch Cruncher",
      hook: "Use every core you have.",
      build: "Process a big batch of files or numbers across a process pool and measure the speedup over the single-threaded version.",
      uses: ["processes / threads", "performance"],
      stretch: "Choose threads or processes based on whether the work waits or computes.",
    },
    {
      title: "Ship It as a Package",
      hook: "Turn a script into a real project.",
      build: "Take one of your earlier projects and restructure it into a proper package with modules, clean imports, and a single obvious entry point.",
      uses: ["modules", "packages", "imports"],
      stretch: "Give it a command-line interface with a few options.",
    },
  ],
  "py.lesson.method": [
    {
      title: "Maze Runner",
      hook: "Generate a maze, then solve it.",
      build: "Use recursive backtracking to carve a random maze, then recursively find the path from start to finish and draw it on the grid.",
      uses: ["recursion", "lists", "random"],
      stretch: "Animate the solver as it explores and abandons dead ends.",
    },
    {
      title: "Fractal Forest",
      hook: "Draw something infinite from a few lines.",
      build: "Recursively generate fractal art — a Sierpinski triangle or a branching tree — as ASCII or with the turtle module. Small rules, endless detail.",
      uses: ["recursion", "functions"],
      stretch: "Make the depth and branch angle inputs and watch the shape morph.",
    },
    {
      title: "Little Calculator",
      hook: "Evaluate expressions the way a language does.",
      build: "Parse and evaluate nested arithmetic expressions with parentheses using recursion — the shape of a real interpreter, in miniature.",
      uses: ["recursion", "strings", "the derivation method"],
      stretch: "Support variables and named functions in your expressions.",
    },
  ],
};

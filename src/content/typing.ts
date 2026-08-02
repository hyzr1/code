/**
 * Typing curriculum + generators.
 *
 * The course is built the way the evidence says works: home row first as an
 * anchor, then new keys added a pair at a time by reach (not alphabetically),
 * every drill made of real-word-shaped text rather than random letters, and
 * the learner's weakest keys continuously over-sampled. Text is *generated*
 * per attempt from an allowed alphabet, so you never memorise a fixed passage —
 * you train the keys.
 */

import { type Char, type TypingProgress, weakestKeys } from "../engine/typing";

export type { Char };

// --------------------------------------------------------------- fingers

export type Hand = "left" | "right";
export type FingerId =
  | "l-pinky"
  | "l-ring"
  | "l-middle"
  | "l-index"
  | "thumb"
  | "r-index"
  | "r-middle"
  | "r-ring"
  | "r-pinky";

export interface Finger {
  id: FingerId;
  hand: Hand;
  label: string;
  /** CSS colour token used for the on-screen keyboard zones + legend. */
  color: string;
}

export const FINGERS: Finger[] = [
  { id: "l-pinky", hand: "left", label: "Left pinky", color: "#d9736a" },
  { id: "l-ring", hand: "left", label: "Left ring", color: "#d99a4e" },
  { id: "l-middle", hand: "left", label: "Left middle", color: "#c7b23e" },
  { id: "l-index", hand: "left", label: "Left index", color: "#5fa86f" },
  { id: "thumb", hand: "left", label: "Thumbs", color: "#8a8f98" },
  { id: "r-index", hand: "right", label: "Right index", color: "#4aa3b5" },
  { id: "r-middle", hand: "right", label: "Right middle", color: "#5b8fd6" },
  { id: "r-ring", hand: "right", label: "Right ring", color: "#8a72d6" },
  { id: "r-pinky", hand: "right", label: "Right pinky", color: "#c264a6" },
];

export const FINGER_BY_ID: Record<FingerId, Finger> = Object.fromEntries(
  FINGERS.map((f) => [f.id, f]),
) as Record<FingerId, Finger>;

// --------------------------------------------------------------- key → finger

/** Which finger owns each base key, per standard touch-typing assignment. */
export const KEY_FINGER: Record<Char, FingerId> = {
  "`": "l-pinky", "1": "l-pinky", q: "l-pinky", a: "l-pinky", z: "l-pinky",
  "2": "l-ring", w: "l-ring", s: "l-ring", x: "l-ring",
  "3": "l-middle", e: "l-middle", d: "l-middle", c: "l-middle",
  "4": "l-index", "5": "l-index", r: "l-index", t: "l-index",
  f: "l-index", g: "l-index", v: "l-index", b: "l-index",
  "6": "r-index", "7": "r-index", y: "r-index", u: "r-index",
  h: "r-index", j: "r-index", n: "r-index", m: "r-index",
  "8": "r-middle", i: "r-middle", k: "r-middle", ",": "r-middle",
  "9": "r-middle", // placeholder overwritten below for clarity
  o: "r-ring", l: "r-ring", ".": "r-ring",
  "0": "r-pinky", p: "r-pinky", ";": "r-pinky", "/": "r-pinky",
  "-": "r-pinky", "=": "r-pinky", "[": "r-pinky", "]": "r-pinky",
  "\\": "r-pinky", "'": "r-pinky",
  " ": "thumb",
};
// Fix the two keys that share a finger with a neighbour above.
KEY_FINGER["9"] = "r-ring";
KEY_FINGER["8"] = "r-middle";

/** Shifted symbol → the base key you actually press (plus a shift). */
export const SHIFT_BASE: Record<Char, Char> = {
  "!": "1", "@": "2", "#": "3", $: "4", "%": "5", "^": "6", "&": "7",
  "*": "8", "(": "9", ")": "0", _: "-", "+": "=", "{": "[", "}": "]",
  "|": "\\", ":": ";", '"': "'", "<": ",", ">": ".", "?": "/", "~": "`",
};

/** Finger for any character, resolving shifted symbols and capitals. */
export function fingerFor(ch: Char): FingerId | null {
  if (ch === " ") return "thumb";
  const lower = ch.toLowerCase();
  if (KEY_FINGER[lower]) return KEY_FINGER[lower];
  if (SHIFT_BASE[ch]) return KEY_FINGER[SHIFT_BASE[ch]] ?? null;
  return null;
}

/** Rows of the visual keyboard, left → right, as base (unshifted) keys. */
export const KEYBOARD_ROWS: Char[][] = [
  ["`", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "="],
  ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "[", "]", "\\"],
  ["a", "s", "d", "f", "g", "h", "j", "k", "l", ";", "'"],
  ["z", "x", "c", "v", "b", "n", "m", ",", ".", "/"],
];

export const HOME_KEYS = new Set(["a", "s", "d", "f", "j", "k", "l", ";"]);

// --------------------------------------------------------------- word banks

/**
 * Common English words, lowercase and letters-only. Generators filter this to
 * the lesson's allowed alphabet, so the same bank feeds every stage — a
 * home-row lesson draws "add, ask, flask" while a later one draws freely.
 */
export const WORDS: string[] = [
  "a", "as", "ask", "add", "all", "dad", "sad", "fad", "gas", "has", "had",
  "hall", "shall", "flask", "glass", "salad", "flag", "half", "lash", "dash",
  "gash", "slash", "gall", "fall", "lad", "gala", "aha", "adds", "asks",
  "the", "and", "for", "are", "but", "not", "you", "all", "any", "can", "her",
  "was", "one", "our", "out", "day", "get", "has", "him", "his", "how", "man",
  "new", "now", "old", "see", "two", "way", "who", "boy", "did", "its", "let",
  "put", "say", "she", "too", "use", "that", "with", "have", "this", "will",
  "your", "from", "they", "know", "want", "been", "good", "much", "some",
  "time", "very", "when", "come", "here", "just", "like", "long", "make",
  "many", "more", "over", "such", "take", "than", "them", "well", "were",
  "what", "work", "life", "only", "then", "find", "give", "look", "most",
  "code", "type", "data", "list", "loop", "test", "call", "func", "name",
  "file", "line", "read", "write", "class", "value", "input", "print", "range",
  "return", "string", "number", "object", "method", "import", "define",
  "learn", "focus", "speed", "reach", "steady", "rhythm", "muscle", "memory",
  "practice", "accuracy", "keyboard", "fingers", "letter", "words", "sentence",
  "quick", "brown", "jumps", "lazy", "over", "under", "again", "steady",
  "hands", "wrist", "level", "solid", "clean", "clear", "small", "large",
  "first", "start", "finish", "target", "master", "repeat", "review", "build",
];

/** Practice sentences for the sentence stage — plain, punctuated, everyday. */
export const SENTENCES: string[] = [
  "The quick brown fox jumps over the lazy dog.",
  "Keep your fingers on the home row and let them return.",
  "Accuracy comes first, and speed follows on its own.",
  "Do not look down; trust that your hands know the way.",
  "A steady rhythm beats a fast burst every single time.",
  "Small, honest reps each day build a real, lasting habit.",
  "Sit up straight, relax your wrists, and breathe slowly.",
  "Every letter you master makes the next word feel easier.",
  "Push for clean lines now, and the pace will arrive later.",
  "The best way to get faster is to stop making mistakes.",
];

// --------------------------------------------------------------- code + quotes

/** Short code lines for the symbol/code stages and the code test mode. */
export const CODE_SNIPPETS: Record<"python" | "javascript", string[]> = {
  python: [
    "def add(a, b):",
    "    return a + b",
    "nums = [1, 2, 3, 4, 5]",
    "total = sum(nums)",
    "for i in range(len(nums)):",
    "    print(nums[i])",
    "seen = {}",
    "if key not in seen:",
    "    seen[key] = 0",
    "result = [x * 2 for x in nums]",
    "def solve(grid, i, j):",
    "    return i >= 0 and j >= 0",
    "counts = {c: s.count(c) for c in s}",
    "left, right = 0, len(a) - 1",
    "while left < right:",
    "    left += 1",
  ],
  javascript: [
    "function add(a, b) {",
    "  return a + b;",
    "const nums = [1, 2, 3, 4, 5];",
    "const total = nums.reduce((a, b) => a + b, 0);",
    "for (let i = 0; i < nums.length; i++) {",
    "  console.log(nums[i]);",
    "const seen = new Map();",
    "if (!seen.has(key)) {",
    "  seen.set(key, 0);",
    "const doubled = nums.map((x) => x * 2);",
    "let left = 0, right = a.length - 1;",
    "while (left < right) {",
    "  left++;",
    "const counts = {};",
    "arr.filter((x) => x > 0);",
  ],
};

/** Attributed lines for the quote mode — kept short and generic. */
export const QUOTES: string[] = [
  "Simplicity is the soul of efficiency.",
  "First, solve the problem. Then, write the code.",
  "Programs must be written for people to read.",
  "Make it work, make it right, make it fast.",
  "The only way to go fast is to go well.",
  "Talk is cheap. Show me the code.",
  "Weeks of coding can save you hours of planning.",
  "Any fool can write code that a computer understands.",
];

// --------------------------------------------------------------- curriculum

export type LessonKind = "keys" | "words" | "sentence" | "caps" | "symbols" | "code";

export interface TypeLesson {
  id: string;
  stageId: string;
  title: string;
  /** One line: what this drill trains. */
  goal: string;
  /** Keys introduced here, highlighted as "new". */
  newKeys: Char[];
  kind: LessonKind;
  /** Clear these to earn stars (accuracy is the gate; wpm earns extra stars). */
  targetWpm: number;
  targetAccuracy: number;
  tip: string;
  /** Number of generated lines in the drill. */
  lines: number;
  codeLang?: "python" | "javascript";
}

export interface TypeStage {
  id: string;
  title: string;
  blurb: string;
  lessonIds: string[];
}

export const LESSONS: TypeLesson[] = [
  // ---- Stage 1: Home row — the anchor every other key returns to.
  { id: "t-fj", stageId: "home", title: "F and J — the anchors", goal: "Find home without looking, using the bumps on F and J.", newKeys: ["f", "j"], kind: "keys", targetWpm: 18, targetAccuracy: 0.95, lines: 4, tip: "Both index fingers rest on F and J. Feel the raised bumps — that is how you find home with your eyes closed." },
  { id: "t-dk", stageId: "home", title: "D and K", goal: "Add the middle fingers to the home row.", newKeys: ["d", "k"], kind: "keys", targetWpm: 18, targetAccuracy: 0.95, lines: 4, tip: "Reach nothing — D and K sit right under your middle fingers. Return to F and J after every press." },
  { id: "t-sl", stageId: "home", title: "S and L", goal: "Add the ring fingers.", newKeys: ["s", "l"], kind: "keys", targetWpm: 18, targetAccuracy: 0.95, lines: 4, tip: "Ring fingers are the weakest — go slow and keep them curled, not flat." },
  { id: "t-asemi", stageId: "home", title: "A and semicolon", goal: "Complete the home row with the pinkies.", newKeys: ["a", ";"], kind: "keys", targetWpm: 18, targetAccuracy: 0.95, lines: 4, tip: "Pinkies are clumsy at first. Keep the other three fingers anchored while they reach." },
  { id: "t-gh", stageId: "home", title: "G and H", goal: "The index reaches inward.", newKeys: ["g", "h"], kind: "keys", targetWpm: 18, targetAccuracy: 0.95, lines: 4, tip: "Index fingers stretch one key inward for G and H, then snap straight back to F and J." },
  { id: "t-home-words", stageId: "home", title: "Home-row words", goal: "String the home row into real words.", newKeys: [], kind: "words", targetWpm: 22, targetAccuracy: 0.96, lines: 5, tip: "Real words now: add, ask, flask, salad. Keep your eyes on the text, never the keys." },

  // ---- Stage 2: Top row.
  { id: "t-ei", stageId: "top", title: "E and I", goal: "Middle fingers reach up.", newKeys: ["e", "i"], kind: "keys", targetWpm: 20, targetAccuracy: 0.95, lines: 4, tip: "E is the most common letter in English — worth getting smooth. Reach up from D and K, then come home." },
  { id: "t-ru", stageId: "top", title: "R and U", goal: "Index fingers reach up.", newKeys: ["r", "u"], kind: "keys", targetWpm: 20, targetAccuracy: 0.95, lines: 4, tip: "R sits above F, U sits above J. Same finger, one row up." },
  { id: "t-ty", stageId: "top", title: "T and Y", goal: "The inner top reaches.", newKeys: ["t", "y"], kind: "keys", targetWpm: 20, targetAccuracy: 0.95, lines: 4, tip: "T and Y are the longest index stretches. Let the finger travel; keep the wrist still." },
  { id: "t-wo", stageId: "top", title: "W and O", goal: "Ring fingers reach up.", newKeys: ["w", "o"], kind: "keys", targetWpm: 20, targetAccuracy: 0.95, lines: 4, tip: "Ring fingers again — the reach up is easier than the home key. Stay relaxed." },
  { id: "t-qp", stageId: "top", title: "Q and P", goal: "Pinkies reach up.", newKeys: ["q", "p"], kind: "keys", targetWpm: 20, targetAccuracy: 0.95, lines: 4, tip: "The hardest reach so far. Keep A and semicolon anchored in your mind even as the pinky leaves." },
  { id: "t-top-words", stageId: "top", title: "Top and home words", goal: "Two rows, real words.", newKeys: [], kind: "words", targetWpm: 26, targetAccuracy: 0.96, lines: 5, tip: "You now have most of the alphabet. Read a whole word before you type it, not letter by letter." },

  // ---- Stage 3: Bottom row.
  { id: "t-vm", stageId: "bottom", title: "V and M", goal: "Index fingers reach down.", newKeys: ["v", "m"], kind: "keys", targetWpm: 22, targetAccuracy: 0.95, lines: 4, tip: "Curl the index finger down and in. Your palm should barely move." },
  { id: "t-ccomma", stageId: "bottom", title: "C and comma", goal: "Middle fingers reach down.", newKeys: ["c", ","], kind: "keys", targetWpm: 22, targetAccuracy: 0.95, lines: 4, tip: "The comma lives under the K middle finger. A tiny downward flick." },
  { id: "t-xdot", stageId: "bottom", title: "X and period", goal: "Ring fingers reach down.", newKeys: ["x", "."], kind: "keys", targetWpm: 22, targetAccuracy: 0.95, lines: 4, tip: "Bottom-row ring reaches are awkward. Slow is smooth; smooth is fast." },
  { id: "t-zslash", stageId: "bottom", title: "Z and slash", goal: "Pinkies reach down.", newKeys: ["z", "/"], kind: "keys", targetWpm: 22, targetAccuracy: 0.95, lines: 4, tip: "The last corners of the letter block. You are almost at the full alphabet." },
  { id: "t-bn", stageId: "bottom", title: "B and N", goal: "The inner bottom reaches.", newKeys: ["b", "n"], kind: "keys", targetWpm: 22, targetAccuracy: 0.95, lines: 4, tip: "B is a long left-index stretch; N sits under the right index. Full alphabet unlocked after this." },
  { id: "t-all-words", stageId: "bottom", title: "The whole alphabet", goal: "Every letter, real words.", newKeys: [], kind: "words", targetWpm: 30, targetAccuracy: 0.96, lines: 6, tip: "All 26 letters are yours now. From here it is repetition, rhythm, and never looking down." },
  // ---- Stage 4: Capitals and punctuation.
  { id: "t-caps", stageId: "polish", title: "Capitals and Shift", goal: "Hold the opposite Shift for clean capitals.", newKeys: [], kind: "caps", targetWpm: 28, targetAccuracy: 0.95, lines: 5, tip: "Capital on the left hand? Hold the RIGHT shift with your right pinky, and vice versa. Never shift with the same hand that types the letter." },
  { id: "t-punct", stageId: "polish", title: "Everyday punctuation", goal: "Apostrophes, question marks, and more.", newKeys: ["'", "?", "!"], kind: "symbols", targetWpm: 26, targetAccuracy: 0.95, lines: 5, tip: "Question mark and the exclamation are shifted keys — right pinky and left pinky reaches. The apostrophe is a soft right-pinky tap." },
  { id: "t-sentences", stageId: "polish", title: "Real sentences", goal: "Words, spaces, capitals, and punctuation together.", newKeys: [], kind: "sentence", targetWpm: 32, targetAccuracy: 0.96, lines: 5, tip: "This is real typing. Aim for one smooth, even flow — the space bar with the thumb keeps the rhythm." },

  // ---- Stage 5: Number row.
  { id: "t-4567", stageId: "numbers", title: "4 5 6 7", goal: "The inner number reaches.", newKeys: ["4", "5", "6", "7"], kind: "keys", targetWpm: 20, targetAccuracy: 0.94, lines: 4, tip: "Numbers are a long reach up. Look once to place your hand, then trust it — the index fingers cover 4, 5, 6, 7." },
  { id: "t-38", stageId: "numbers", title: "3 and 8", goal: "Middle fingers to the number row.", newKeys: ["3", "8"], kind: "keys", targetWpm: 20, targetAccuracy: 0.94, lines: 4, tip: "3 is above E, 8 is above I. Same finger, all the way up." },
  { id: "t-2910", stageId: "numbers", title: "2 9 1 0", goal: "Ring and pinky numbers.", newKeys: ["2", "9", "1", "0"], kind: "keys", targetWpm: 20, targetAccuracy: 0.94, lines: 4, tip: "The outer numbers are pinky and ring reaches — the longest of all. Accuracy over speed here." },
  { id: "t-numbers", stageId: "numbers", title: "Numbers in the mix", goal: "Digits woven into words.", newKeys: [], kind: "words", targetWpm: 26, targetAccuracy: 0.95, lines: 5, tip: "Real writing mixes numbers and words. Reach, hit, return home — do not let your hand drift." },

  // ---- Stage 6: Programmer symbols.
  { id: "t-sym-core", stageId: "symbols", title: "= ; : +", goal: "The assignment and statement symbols.", newKeys: ["=", ":", "+"], kind: "symbols", targetWpm: 22, targetAccuracy: 0.94, lines: 5, tip: "These live off the right pinky. Colon and plus are shifted; keep the reach small and the wrist quiet." },
  { id: "t-sym-brackets", stageId: "symbols", title: "Brackets and braces", goal: "( ) [ ] { } — the shapes code is made of.", newKeys: ["(", ")", "[", "]", "{", "}"], kind: "symbols", targetWpm: 20, targetAccuracy: 0.93, lines: 6, tip: "Parentheses and braces are shifted 9, 0 and [, ]. This is the single most valuable drill for a programmer — pairs, pairs, pairs." },
  { id: "t-sym-ops", stageId: "symbols", title: "Operators and slashes", goal: "- _ / \\ * & the working symbols.", newKeys: ["-", "_", "*", "&", "\\"], kind: "symbols", targetWpm: 20, targetAccuracy: 0.93, lines: 5, tip: "Underscore is a shifted hyphen; star is a shifted 8; ampersand is a shifted 7. Let the pinky and index share the load." },
  { id: "t-sym-angle", stageId: "symbols", title: "Comparisons and the rest", goal: "< > | ! and the remaining symbols.", newKeys: ["<", ">", "|"], kind: "symbols", targetWpm: 20, targetAccuracy: 0.93, lines: 5, tip: "Angle brackets are shifted comma and period. You now have every key a keyboard offers." },

  // ---- Stage 7: Real code.
  { id: "t-code-py", stageId: "code", title: "Python, for real", goal: "Type actual Python with correct fingers.", newKeys: [], kind: "code", codeLang: "python", targetWpm: 28, targetAccuracy: 0.95, lines: 6, tip: "Indentation, colons, brackets, names. This is the typing your day job is made of — go for clean, not fast." },
  { id: "t-code-js", stageId: "code", title: "JavaScript, for real", goal: "Type actual JavaScript with correct fingers.", newKeys: [], kind: "code", codeLang: "javascript", targetWpm: 28, targetAccuracy: 0.95, lines: 6, tip: "Semicolons, arrows, braces. Symbol fluency is what separates a fast coder from a fast typist." },
];

export const STAGES: TypeStage[] = [
  { id: "home", title: "Home row", blurb: "The eight keys your fingers live on. Everything starts and returns here.", lessonIds: ["t-fj", "t-dk", "t-sl", "t-asemi", "t-gh", "t-home-words"] },
  { id: "top", title: "Top row", blurb: "Reach up and come back. Most of the alphabet arrives here.", lessonIds: ["t-ei", "t-ru", "t-ty", "t-wo", "t-qp", "t-top-words"] },
  { id: "bottom", title: "Bottom row", blurb: "The last reaches. After this you can type any word.", lessonIds: ["t-vm", "t-ccomma", "t-xdot", "t-zslash", "t-bn", "t-all-words"] },
  { id: "polish", title: "Capitals & punctuation", blurb: "Shift, sentences, and the marks that make text readable.", lessonIds: ["t-caps", "t-punct", "t-sentences"] },
  { id: "numbers", title: "Number row", blurb: "The long reach up top. Placed by feel, not by sight.", lessonIds: ["t-4567", "t-38", "t-2910", "t-numbers"] },
  { id: "symbols", title: "Programmer symbols", blurb: "Brackets, operators, and everything code is built from.", lessonIds: ["t-sym-core", "t-sym-brackets", "t-sym-ops", "t-sym-angle"] },
  { id: "code", title: "Real code", blurb: "Put it together on genuine Python and JavaScript.", lessonIds: ["t-code-py", "t-code-js"] },
];

export const LESSON_BY_ID = new Map(LESSONS.map((l) => [l.id, l]));

/**
 * Cumulative allowed alphabet for a lesson: every key introduced up to and
 * including it, plus space. This is what the generators draw from.
 */
export function allowedKeysFor(lessonId: string): Char[] {
  const allowed = new Set<Char>([" "]);
  for (const lesson of LESSONS) {
    for (const k of lesson.newKeys) allowed.add(k);
    if (lesson.id === lessonId) break;
  }
  return [...allowed];
}

/** Position of a lesson in the flat course order (for lock/continue logic). */
export function lessonIndex(lessonId: string): number {
  return LESSONS.findIndex((l) => l.id === lessonId);
}

// --------------------------------------------------------------- generators

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** A pool where `boost` members appear extra times, for weighted sampling. */
function weightedPool(base: Char[], boost: Char[], factor = 3): Char[] {
  const pool = base.slice();
  const boostSet = new Set(boost);
  for (const b of base) if (boostSet.has(b)) for (let i = 1; i < factor; i++) pool.push(b);
  return pool.length ? pool : base;
}

/** Random letter clusters — the drill for the earliest key lessons. */
function clusterLine(letters: Char[], boost: Char[], targetLen = 30): string {
  if (letters.length === 0) return "";
  const pool = weightedPool(letters, boost);
  const words: string[] = [];
  let len = 0;
  while (len < targetLen) {
    const wl = 2 + Math.floor(Math.random() * 3);
    let w = "";
    for (let i = 0; i < wl; i++) w += pick(pool);
    words.push(w);
    len += w.length + 1;
  }
  return words.join(" ");
}

/** Real words filtered to the allowed alphabet, weighted toward weak/new keys. */
function wordLine(allowedLetters: Set<Char>, boost: Char[], targetLen = 38): string {
  const usable = WORDS.filter((w) => [...w].every((c) => allowedLetters.has(c)));
  if (usable.length < 4) return clusterLine([...allowedLetters], boost, targetLen);
  const boosted = usable.filter((w) => boost.some((b) => w.includes(b)));
  const words: string[] = [];
  let len = 0;
  while (len < targetLen) {
    // 55% of picks favour a word containing a weak/new key, when one exists.
    const w = boosted.length && Math.random() < 0.55 ? pick(boosted) : pick(usable);
    words.push(w);
    len += w.length + 1;
  }
  return words.join(" ");
}

/** Words with sentence-style capitalisation for the Shift lesson. */
function capsLine(allowedLetters: Set<Char>, boost: Char[]): string {
  const line = wordLine(allowedLetters, boost, 34).split(" ");
  return line
    .map((w, i) => (i === 0 || Math.random() < 0.4 ? w.charAt(0).toUpperCase() + w.slice(1) : w))
    .join(" ");
}

/** Symbol-forward line: short tokens interleaved with the lesson's symbols. */
function symbolLine(lesson: TypeLesson, allowedLetters: Set<Char>): string {
  const syms = lesson.newKeys;
  const shortWords = WORDS.filter(
    (w) => w.length <= 5 && [...w].every((c) => allowedLetters.has(c)),
  );
  const bracketPairs: Record<string, string> = { "(": "()", "[": "[]", "{": "{}", "<": "<>" };
  const tokens: string[] = [];
  for (let i = 0; i < 7; i++) {
    if (Math.random() < 0.6 && syms.length) {
      const s = pick(syms);
      if (bracketPairs[s]) tokens.push(bracketPairs[s]);
      else if (["=", "+", "-", "*", "&", "|", ":"].includes(s)) {
        const w = shortWords.length ? pick(shortWords) : "x";
        tokens.push(`${w} ${s} ${shortWords.length ? pick(shortWords) : "y"}`);
      } else tokens.push((shortWords.length ? pick(shortWords) : "x") + s);
    } else {
      tokens.push(shortWords.length ? pick(shortWords) : "code");
    }
  }
  return tokens.join(" ");
}

/** One drill line for a lesson, tuned by the learner's weak keys. */
export function generateLine(lesson: TypeLesson, weak: Char[]): string {
  const allowed = allowedKeysFor(lesson.id);
  const allowedLetters = new Set(allowed.filter((k) => /[a-z]/.test(k)));
  const letters = [...allowedLetters];
  const boost = [...new Set([...lesson.newKeys.filter((k) => /[a-z]/.test(k)), ...weak])];

  switch (lesson.kind) {
    case "keys":
      // Digit-only key lessons still want cluster practice of the digits.
      if (letters.length === 0) {
        const digits = allowed.filter((k) => /[0-9]/.test(k));
        return clusterLine(digits.length ? digits : lesson.newKeys, lesson.newKeys, 24);
      }
      // Number lessons mix fresh digits into letter clusters.
      if (lesson.newKeys.some((k) => /[0-9]/.test(k))) {
        return clusterLine([...letters, ...lesson.newKeys, ...lesson.newKeys], lesson.newKeys, 28);
      }
      return clusterLine(letters, boost, 28);
    case "words":
      return wordLine(allowedLetters, boost);
    case "caps":
      return capsLine(allowedLetters, boost);
    case "sentence":
      return pick(SENTENCES);
    case "symbols":
      return symbolLine(lesson, allowedLetters);
    case "code":
      return pick(CODE_SNIPPETS[lesson.codeLang ?? "python"]);
  }
}

/** A full drill: `count` independent lines (defaults to the lesson's target). */
export function generateDrill(lesson: TypeLesson, progress: TypingProgress): string[] {
  const allowed = allowedKeysFor(lesson.id);
  const weak = weakestKeys(progress, allowed, 4);
  return Array.from({ length: lesson.lines }, () => generateLine(lesson, weak));
}

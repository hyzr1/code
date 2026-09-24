/**
 * Vocabulary gate — CONTENT-STYLE.md rule 12.
 *
 * A lesson may only require syntax that has already been taught. This is the
 * check that would have caught `let and const` asking for a `while` loop eight
 * lessons before loops exist.
 *
 * Prose may *mention* anything ("`if (items)` is not the check you want") —
 * the gate is on what you're expected to WRITE. So starters, solutions and
 * tests are checked whole, while prompts and hints are checked only inside
 * their `backtick spans`, which is where code actually lives.
 *
 * Run: npm run check:vocab
 */
import { ATOMS, COURSE_LESSONS, PROBLEM_BY_ID } from "../.check/content.mjs";

/** token pattern → the lesson that unlocks it */
const UNLOCKS = [
  { re: /\$\{/, name: "template literal", lesson: "l0.3" },
  { re: /\.push\(|\.at\(|\.\.\.\w/, name: "arrays / spread", lesson: "l0.4" },
  { re: /\bif\s*\(|\belse\b/, name: "if / else", lesson: "l2.1" },
  { re: /\bfor\s*\(|\bwhile\s*\(/, name: "loops", lesson: "l2.2" },
  { re: /Object\.(entries|keys|values)\(/, name: "Object.entries/keys/values", lesson: "l2.3" },
  { re: /=>/, name: "arrow function", lesson: "l3.3" },
  { re: /\.indexOf\(|\.includes\(|\.find\(|\.findIndex\(/, name: "array search", lesson: "l4.3" },
  { re: /\.slice\(/, name: ".slice", lesson: "l4.4" },
  { re: /\.splice\(|\.reverse\(/, name: ".splice / .reverse", lesson: "l4.5" },
  { re: /\.map\(/, name: ".map", lesson: "l5.1" },
  { re: /\.filter\(/, name: ".filter", lesson: "l5.2" },
  { re: /\.reduce\(/, name: ".reduce", lesson: "l5.3" },
  { re: /\.some\(|\.every\(/, name: ".some / .every", lesson: "l5.4" },
  { re: /\.sort\(|localeCompare/, name: ".sort", lesson: "l5.5" },
];

/** Pull just the `code spans` out of prose. */
const codeSpans = (text) =>
  [...String(text).matchAll(/`([^`]+)`/g)].map((m) => m[1]).join("\n");

const order = new Map(COURSE_LESSONS.map((l, i) => [l.id, i]));
const violations = [];

for (const lesson of COURSE_LESSONS) {
  const here = order.get(lesson.id);

  for (const id of [...lesson.repIds, ...lesson.problemIds]) {
    const unit = PROBLEM_BY_ID.get(id);
    if (!unit) continue;

    const surfaces = [
      ["starter", unit.scaffolds?.L3 ?? ""],
      ["solution", unit.solution],
      ...unit.tests.map((t) => [`test "${t.name}"`, t.code]),
      ["prompt", codeSpans(unit.prompt)],
      ...unit.hints.map((h, i) => [`hint ${i}`, codeSpans(h.text)]),
    ];

    for (const rule of UNLOCKS) {
      const unlockedAt = order.get(rule.lesson);
      if (unlockedAt === undefined || unlockedAt <= here) continue;

      for (const [where, text] of surfaces) {
        if (rule.re.test(text)) {
          violations.push(
            `${lesson.id} · ${unit.id} · ${where}\n    requires ${rule.name}, not taught until ${rule.lesson}`,
          );
          break;
        }
      }
    }
  }
}

// Python prerequisite gate. The original checker above only recognized a
// handful of JavaScript tokens; it could truthfully say "vocabulary clean"
// while the second Python lesson required lists, mutation, methods, copying,
// functions, and return values. Walk every role-specific path and prove that
// each declared requirement has actually appeared in an earlier lesson.
const atomById = new Map(ATOMS.map((atom) => [atom.id, atom]));
const pythonLessons = COURSE_LESSONS.filter((lesson) => lesson.language === "python");
const tracks = ["faang", "swe", "ml", "quant"];
const graphViolations = new Set();

for (const track of tracks) {
  const path = pythonLessons.filter(
    (lesson) => !lesson.tracks?.length || lesson.tracks.includes(track),
  );
  const taught = new Set();
  for (const lesson of path) {
    const atom = atomById.get(lesson.atomId);
    if (!atom) continue;
    for (const requirement of atom.requires ?? []) {
      if (!taught.has(requirement)) {
        graphViolations.add(
          `${lesson.id} · ${track} path\n    requires ${requirement}, but it has not been taught earlier`,
        );
      }
    }
    for (const concept of atom.teaches ?? []) taught.add(concept);
  }
}

for (const message of graphViolations) violations.push(message);

// Syntax gate for code the learner is shown or expected to write. A lesson may
// use the feature it is currently teaching, never one from a future lesson.
const PYTHON_UNLOCKS = [
  { re: /\bdef\s+\w+\s*\(/, name: "function definitions", lesson: "py.lesson.first-function" },
  { re: /\breturn\b/, name: "return", lesson: "py.lesson.first-function" },
  { re: /(?:\/\/|\%|\*\*)/, name: "numeric operators", lesson: "py.lesson.numbers" },
  { re: /(?:\.strip\(|\.casefold\(|\.replace\(|f[\"'])/, name: "string operations", lesson: "py.lesson.strings" },
  { re: /(?:==|!=|<=|>=|\bis\s+(?:not\s+)?None\b|\bnot\b)/, name: "Boolean comparison", lesson: "py.lesson.booleans" },
  { re: /\b(?:if|elif|else)\b/, name: "branching", lesson: "py.lesson.branching" },
  { re: /(?:\[[^\]\n]*\]|\.append\(|\[-?\d+\])/, name: "lists and indexing", lesson: "py.lesson.lists" },
  { re: /\b(?:for|while)\b/, name: "loops", lesson: "py.lesson.loops" },
  { re: /\b(?:range|enumerate)\s*\(/, name: "range and enumerate", lesson: "py.lesson.iteration-tools" },
  { re: /\b(?:len|sum|min|max|any|all|zip)\s*\(/, name: "collection-wide built-ins", lesson: "py.lesson.aggregation-tools" },
  { re: /(?:\.copy\(|\bis\s+not\s+\w+)/, name: "copying and aliasing", lesson: "py.lesson.names" },
  { re: /\{[^}\n]*:/, name: "dictionary literals", lesson: "py.lesson.dicts" },
  { re: /(?:\bset\(|\{[^}:{}\n]+,\s*[^}:{}\n]+\}|\s[&|]\s)/, name: "sets", lesson: "py.lesson.sets" },
  { re: /[\[{][^\]}\n]+\bfor\b[^\]}\n]+[\]}]/, name: "comprehensions", lesson: "py.lesson.comprehensions" },
  { re: /(?:\bsorted\s*\(|\.sort\s*\(|\blambda\b|\bkey\s*=)/, name: "sorting and key functions", lesson: "py.lesson.sorting" },
  { re: /^\s*(?:from|import)\s+/m, name: "imports", lesson: "py.lesson.imports" },
  { re: /(?:\bdef\s+\w+\([^)]*\*\*?\w+|,\s*\/\s*,|,\s*\*\s*,)/, name: "advanced arguments", lesson: "py.lesson.arguments" },
  { re: /\b(?:nonlocal|global)\b/, name: "scope rebinding", lesson: "py.lesson.scope" },
  { re: /\b(?:try|except|raise|finally)\b/, name: "exceptions", lesson: "py.lesson.exceptions" },
  { re: /^\s*@\w+/m, name: "decorators", lesson: "py.lesson.decorators" },
  { re: /\bclass\s+\w+/, name: "classes", lesson: "py.lesson.classes" },
  { re: /\b(?:yield|next)\b\s*\(?/, name: "iterators and generators", lesson: "py.lesson.iterators" },
  { re: /\bwith\s+.+:/, name: "context managers", lesson: "py.lesson.contexts" },
  { re: /(?:->\s*[\w[\], |]+|\bdef\s+\w+\([^)]*\w+\s*:\s*[\w[])/, name: "type annotations", lesson: "py.lesson.typing" },
  { re: /\b(?:async\s+def|await|async\s+with)\b/, name: "async syntax", lesson: "py.lesson.asyncio" },
];

const pythonOrder = new Map(pythonLessons.map((lesson, index) => [lesson.id, index]));
const CURRICULUM_TERM_UNLOCKS = [
  {
    re: /\b(?:Big[- ]O|O\([^)]+\))/i,
    name: "Big-O notation",
    lesson: "py.lesson.complexity",
  },
];
const fencedCode = (text) =>
  [...String(text).matchAll(/```(?:python)?\s*\n([\s\S]*?)```/g)]
    .map((match) => match[1].replace(/#.*$/gm, ""))
    .join("\n");

// Syntax-looking characters inside a Python string are data, not syntax. Without
// masking strings, an f-string such as `f"{total:.2f}"` looks like a dictionary,
// `" | "` looks like set union, and the literal `"next"` looks like next().
// Keep newlines so line-oriented expressions still behave as expected.
const pythonSyntaxOnly = (text) =>
  String(text).replace(
    /(?:[rubf]{0,2})(?:'''[\s\S]*?'''|"""[\s\S]*?"""|'(?:\\.|[^'\\\n])*'|"(?:\\.|[^"\\\n])*")/gi,
    (literal) => literal.replace(/[^\n]/g, " "),
  );

for (const lesson of pythonLessons) {
  const here = pythonOrder.get(lesson.id);
  const atom = atomById.get(lesson.atomId);
  for (const term of CURRICULUM_TERM_UNLOCKS) {
    const unlockedAt = pythonOrder.get(term.lesson);
    if (unlockedAt !== undefined && unlockedAt > here && term.re.test(atom?.body ?? "")) {
      violations.push(
        `${lesson.id} · lecture prose\n    uses ${term.name}, not taught until ${term.lesson}`,
      );
    }
  }
  const ids = [...lesson.repIds, ...lesson.problemIds];
  const surfaces = [["lecture example", fencedCode(atom?.body ?? "")]];
  for (const id of ids) {
    const unit = PROBLEM_BY_ID.get(id);
    if (!unit) continue;
    surfaces.push(
      [`${id} starter`, unit.scaffolds?.L3 ?? ""],
      [`${id} solution`, unit.solution],
      [`${id} prompt`, codeSpans(unit.prompt)],
    );
  }
  for (const feature of PYTHON_UNLOCKS) {
    const unlockedAt = pythonOrder.get(feature.lesson);
    if (unlockedAt === undefined || unlockedAt <= here) continue;
    for (const [where, text] of surfaces) {
      if (feature.re.test(pythonSyntaxOnly(text))) {
        violations.push(
          `${lesson.id} · ${where}\n    uses ${feature.name}, not taught until ${feature.lesson}`,
        );
        break;
      }
    }
  }
}

const reps = COURSE_LESSONS.reduce((n, l) => n + l.repIds.length, 0);
const problems = COURSE_LESSONS.reduce((n, l) => n + l.problemIds.length, 0);

if (violations.length) {
  console.log(`\n${violations.length} vocabulary violations\n`);
  for (const v of violations) console.log("  " + v + "\n");
  process.exit(1);
}

console.log(
  `\nvocabulary clean - ${COURSE_LESSONS.length} lessons, ${reps} reps, ${problems} problems, nothing required before it is taught\n`,
);

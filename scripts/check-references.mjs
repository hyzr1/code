/**
 * Dangling-reference check.
 *
 * Lecture prose is written to be read continuously, so it says things like
 * "the first statement above calculates 4". In Watch mode each scene shows one
 * idea, so "above" only means something if the thing being referred to is
 * still on the stage.
 *
 * Sticky code (see engine/scenes.ts) makes most of these valid. This catches
 * the ones it can't: a backward reference on a scene with nothing on screen.
 *
 * Run: npm run check:refs
 */
import { ATOMS, buildScenes } from "../.check/content.mjs";

const BACKREF =
  /\b(above|below|earlier|previously|the previous|as we saw|that example|this example|the first statement|the second statement|the last line|that line|this code|the code above|the snippet)\b/i;

/** Phrases that read as backward references but aren't spatial. */
const BENIGN = /\b(above all|above zero|above some|above the threshold|above it)\b/i;

const violations = [];

for (const atom of ATOMS) {
  const scenes = buildScenes(atom);

  scenes.forEach((scene, i) => {
    if (scene.kind !== "text") return;
    if (!BACKREF.test(scene.caption)) return;
    if (BENIGN.test(scene.caption)) return;
    if (scene.code) return; // the thing it points at is on screen

    const phrase = BACKREF.exec(scene.caption)?.[0];
    violations.push(
      `${atom.id} · scene ${i + 1}/${scenes.length}\n    says "${phrase}" with nothing on the stage\n    "${scene.caption.slice(0, 110)}${scene.caption.length > 110 ? "…" : ""}"`,
    );
  });
}

const sceneTotal = ATOMS.reduce((n, a) => n + buildScenes(a).length, 0);

// Eye guidance must be a real timeline, not a static wash over several lines.
// Every code scene starts with one valid, visible line and moves forward
// through monotonically ordered narration cues.
const focusViolations = [];
let focusCueTotal = 0;
for (const atom of ATOMS) {
  buildScenes(atom).forEach((scene, sceneIndex) => {
    if (!scene.code) return;
    const lines = scene.code.split("\n");
    const steps = scene.focusSteps ?? [];
    focusCueTotal += steps.length;
    if (!steps.length || steps[0].at !== 0) {
      focusViolations.push(`${atom.id} · scene ${sceneIndex + 1} has no opening focus cue`);
      return;
    }
    let previous = -1;
    for (const step of steps) {
      const line = step.lines[0];
      if (
        step.lines.length !== 1 ||
        step.at < previous || step.at < 0 || step.at > 1 ||
        !Number.isInteger(line) || !lines[line - 1]?.trim()
      ) {
        focusViolations.push(`${atom.id} · scene ${sceneIndex + 1} has an invalid focus cue`);
        break;
      }
      previous = step.at;
    }
  });
}

// A scene showing code with nothing said about it is dead air — the complaint
// that started all of this. Caught here so it can't come back.
const silent = [];
for (const atom of ATOMS) {
  buildScenes(atom).forEach((scene, i) => {
    if (scene.kind === "text" && !scene.narration.trim()) {
      silent.push(`${atom.id} · scene ${i + 1} is silent`);
    }
  });
}

// Repeating a sentence on consecutive slides feels like the lecture is stuck,
// even when both scenes are technically valid. Compare meaningful word sets so
// punctuation or Markdown cannot hide an accidental near-duplicate.
const STOP_WORDS = new Set([
  "a", "an", "and", "are", "as", "at", "be", "by", "for", "from", "in",
  "is", "it", "of", "on", "or", "that", "the", "this", "to", "was", "what",
  "when", "which", "why", "with", "you", "your",
]);
const meaningfulWords = (value) =>
  new Set(
    value
      .toLocaleLowerCase()
      .replace(/[^\p{L}\p{N}]+/gu, " ")
      .split(/\s+/)
      .filter((word) => word.length > 2 && !STOP_WORDS.has(word)),
  );
const repeated = [];
for (const atom of ATOMS) {
  const scenes = buildScenes(atom);
  for (let i = 1; i < scenes.length; i += 1) {
    const left = meaningfulWords(scenes[i - 1].caption);
    const right = meaningfulWords(scenes[i].caption);
    if (left.size < 5 || right.size < 5) continue;
    const shared = [...left].filter((word) => right.has(word)).length;
    const similarity = shared / new Set([...left, ...right]).size;
    if (similarity >= 0.82) {
      repeated.push(
        `${atom.id} · scenes ${i}/${i + 1} repeat ${Math.round(similarity * 100)}% of their meaningful words`,
      );
    }
  }
}
if (repeated.length) {
  console.log(`\n${repeated.length} repeated adjacent scenes\n`);
  for (const item of repeated) console.log("  " + item);
  console.log("");
  process.exit(1);
}

// One boilerplate slide copied into every lecture is still filler even when it
// is not adjacent to another copy. Long, code-free narration may appear in at
// most three Python lectures before this gate asks for lesson-specific prose.
const phraseOwners = new Map();
for (const atom of ATOMS.filter((item) => item.id.startsWith("py.atom."))) {
  for (const scene of buildScenes(atom)) {
    if (scene.kind !== "text" || scene.code) continue;
    const words = scene.narration
      .toLocaleLowerCase()
      .replace(/[^\p{L}\p{N}]+/gu, " ")
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    if (words.length < 10) continue;
    const key = words.join(" ");
    const owners = phraseOwners.get(key) ?? new Set();
    owners.add(atom.id);
    phraseOwners.set(key, owners);
  }
}
const globalFiller = [...phraseOwners.entries()].filter(([, owners]) => owners.size > 3);
if (globalFiller.length) {
  console.log(`\n${globalFiller.length} repeated boilerplate scenes\n`);
  for (const [phrase, owners] of globalFiller) {
    console.log(`  ${owners.size} Python lectures repeat: "${phrase.slice(0, 120)}"`);
  }
  console.log("");
  process.exit(1);
}
if (silent.length) {
  console.log(`\n${silent.length} silent scenes\n`);
  for (const s of silent) console.log("  " + s);
  console.log("");
  process.exit(1);
}

// An emphasis span split across two scenes leaves its markers orphaned: the
// reader shows a literal `**` and the narrator reads it as "star times". The
// splitter avoids it now, and this is what stops it coming back.
const orphaned = [];
const balanced = (text, pattern) => (text.match(pattern) ?? []).length % 2 === 0;
for (const atom of ATOMS) {
  buildScenes(atom).forEach((scene, i) => {
    if (!balanced(scene.caption, /\*\*/g) || !balanced(scene.caption, /`/g)) {
      orphaned.push(
        `${atom.id} · scene ${i + 1} splits an emphasis or code span\n    "${scene.caption.slice(0, 110)}"`,
      );
    }
  });
}
if (orphaned.length) {
  console.log(`\n${orphaned.length} orphaned markers\n`);
  for (const o of orphaned) console.log("  " + o + "\n");
  process.exit(1);
}

if (violations.length) {
  console.log(`\n${violations.length} dangling references\n`);
  for (const v of violations) console.log("  " + v + "\n");
  process.exit(1);
}
if (focusViolations.length) {
  console.log(`\n${focusViolations.length} invalid narration focus timelines\n`);
  for (const item of focusViolations) console.log("  " + item);
  console.log("");
  process.exit(1);
}

console.log(
  `\nreferences clean - ${ATOMS.length} lectures, ${sceneTotal} scenes, ${focusCueTotal} timed code cues, every backward reference has its subject on screen\n`,
);

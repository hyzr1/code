/** Keep hidden mastery courses honest: authored lessons must be deep and contiguous. */
import { ATOMS, COURSE_LESSONS, COURSE_MODULES } from "../.check/content.mjs";

const atomById = new Map(ATOMS.map((atom) => [atom.id, atom]));
const lessonById = new Map(COURSE_LESSONS.map((lesson) => [lesson.id, lesson]));
const failures = [];

for (const course of ["algo", "ml"]) {
  const modules = COURSE_MODULES
    .filter((module) => module.course === course)
    .sort((left, right) => left.part - right.part);
  let reachedEmptyModule = false;
  let authoredLessons = 0;
  let totalLessons = 0;

  for (const module of modules) {
    const lessons = module.lessonIds.map((id) => lessonById.get(id)).filter(Boolean);
    const authored = lessons.filter((lesson) => lesson.atomId && atomById.has(lesson.atomId));
    totalLessons += lessons.length;
    authoredLessons += authored.length;

    if (authored.length > 0 && authored.length < lessons.length) {
      failures.push(
        `${course}: ${module.id} is only ${authored.length}/${lessons.length} authored; finish the prerequisite module as one unit`,
      );
    }
    if (reachedEmptyModule && authored.length > 0) {
      failures.push(`${course}: ${module.id} is authored after an unfinished earlier module`);
    }
    if (authored.length === 0) reachedEmptyModule = true;

    // A released lesson teaches and tests. Its atom must also carry the three
    // retrieval questions; a typo in the masteryChecks key is otherwise silent
    // -- the extra question simply never merges and nothing complains.
    for (const lesson of lessons) {
      const units =
        (lesson.repIds?.length ?? 0) +
        (lesson.problemIds?.length ?? 0) +
        (lesson.drillIds?.length ?? 0);
      if (units === 0) continue;
      const atom = lesson.atomId ? atomById.get(lesson.atomId) : null;
      if (!atom) continue;
      if ((atom.checks?.length ?? 0) < 3) {
        failures.push(
          `${course}: ${lesson.id} is released but its lecture ${atom.id} has only ${atom.checks?.length ?? 0} retrieval questions`,
        );
      }
    }

    for (const lesson of authored) {
      const atom = atomById.get(lesson.atomId);
      const words = atom.body.trim().split(/\s+/).filter(Boolean).length;
      const headings = (atom.body.match(/^## /gm) ?? []).length;
      const codeBlocks = (atom.body.match(/```python\n/g) ?? []).length;
      const definitions = atom.body.match(/^- \*\*.+\*\* — .+$/gm) ?? [];
      if (words < 380) failures.push(`${atom.id}: only ${words}/380 teaching words`);
      if (headings < 7) failures.push(`${atom.id}: only ${headings}/7 teaching sections`);
      if (codeBlocks < 1) failures.push(`${atom.id}: has no visible Python example`);
      if (definitions.length < 3) failures.push(`${atom.id}: defines only ${definitions.length}/3 terms`);
      if ((atom.checks?.length ?? 0) < 2) failures.push(`${atom.id}: needs two retrieval checks`);

      if (atom.body.includes("## What you will be able to explain")) {
        if (codeBlocks < 2) failures.push(`${atom.id}: guided lesson needs two runnable examples`);
        for (const section of [
          "## Why this matters",
          "## A picture to keep in your head",
          "## A mistake to avoid",
          "## Pause and predict",
          "## Check your thinking",
          "## What to remember",
        ]) {
          if (!atom.body.includes(section)) failures.push(`${atom.id}: missing ${section}`);
        }
      }
    }
  }

  console.log(`${course} mastery readiness - ${authoredLessons}/${totalLessons} lessons authored as a contiguous prefix`);
}

if (failures.length) {
  console.error(`\n${failures.length} mastery readiness failures`);
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}

console.log("mastery readiness clean - no partial module, prerequisite gap, or shallow authored lesson");

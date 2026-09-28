/** Keep the published mathematics path fully authored and reviewable. */
import { ATOMS, COURSE_LESSONS, COURSE_MODULES, buildScenes } from "../.check/content.mjs";

const modules = COURSE_MODULES.filter((module) => module.course === "math");
const lessons = COURSE_LESSONS.filter((lesson) => lesson.id.startsWith("math."));
const atoms = new Map(ATOMS.filter((atom) => atom.id.startsWith("math.atom.")).map((atom) => [atom.id, atom]));
const failures = [];

if (modules.length !== 36) failures.push(`expected 36 modules, found ${modules.length}`);
if (lessons.length !== 292) failures.push(`expected 292 lessons, found ${lessons.length}`);
if (atoms.size !== lessons.length) failures.push(`${atoms.size} atoms for ${lessons.length} lessons`);

const headings = [
  "## The idea, step by step",
  "## Worked example",
  "## Interpret the result",
  "## Common mistake",
  "## Try it yourself",
  "## Full solution",
];

for (const [index, lesson] of lessons.entries()) {
  const expectedAtomId = `math.atom.${index + 1}`;
  const atom = atoms.get(expectedAtomId);
  if (lesson.atomId !== expectedAtomId || !atom) {
    failures.push(`${lesson.id}: missing ordered atom ${expectedAtomId}`);
    continue;
  }
  if (atom.title !== lesson.title) failures.push(`${lesson.id}: atom title differs from curriculum`);
  if ((atom.checks?.length ?? 0) < 3) failures.push(`${lesson.id}: fewer than three retrieval checks`);
  for (const heading of headings) {
    if (!atom.body.includes(heading)) failures.push(`${lesson.id}: missing ${heading}`);
  }
  if (atom.body.trim().split(/\s+/).length < 170) failures.push(`${lesson.id}: lesson is too brief`);
  if (buildScenes(atom).length < 8) failures.push(`${lesson.id}: too few narrated scenes`);
}

if (failures.length) {
  console.error(`math course has ${failures.length} incomplete lessons or modules`);
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}

console.log(`math course clean - ${modules.length} modules, ${lessons.length} ordered authored lessons`);

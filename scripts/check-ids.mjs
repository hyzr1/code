/**
 * Integrity gate — ids are unique, and every reference resolves.
 *
 * Written after `teach.map` (the array method) and `teach.map` (the data
 * structure) both existed for a while: the later definition silently won the
 * lookup, so one lesson quietly displayed another lesson's lecture. Nothing
 * else caught it — it typechecks, it renders, it's just wrong.
 *
 * Run: npm run check:ids
 */
import {
  ATOMS,
  CONCEPTS,
  COURSE_LESSONS,
  COURSE_MODULES,
  DRILLS,
  PROBLEMS,
} from "../.check/content.mjs";

const problems = [];

/** Every id in a collection must appear exactly once. */
const unique = (label, items) => {
  const seen = new Map();
  for (const item of items) {
    seen.set(item.id, (seen.get(item.id) ?? 0) + 1);
  }
  for (const [id, count] of seen) {
    if (count > 1) problems.push(`${label} id "${id}" is defined ${count} times`);
  }
};

unique("atom", ATOMS);
unique("concept", CONCEPTS);
unique("lesson", COURSE_LESSONS);
unique("module", COURSE_MODULES);
unique("drill", DRILLS);
unique("problem", PROBLEMS);

const atomIds = new Set(ATOMS.map((a) => a.id));
const conceptIds = new Set(CONCEPTS.map((c) => c.id));
const drillIds = new Set(DRILLS.map((d) => d.id));
const problemIds = new Set(PROBLEMS.map((p) => p.id));
const lessonIds = new Set(COURSE_LESSONS.map((l) => l.id));

const resolves = (where, kind, set, ids) => {
  for (const id of ids) {
    if (!set.has(id)) problems.push(`${where} points at missing ${kind} "${id}"`);
  }
};

for (const concept of CONCEPTS) {
  resolves(`concept ${concept.id}`, "concept", conceptIds, concept.requires);
  if (concept.atom) resolves(`concept ${concept.id}`, "atom", atomIds, [concept.atom]);
}

for (const atom of ATOMS) {
  resolves(`atom ${atom.id}`, "concept", conceptIds, atom.teaches);
  resolves(`atom ${atom.id}`, "concept", conceptIds, atom.requires);
}

for (const unit of PROBLEMS) {
  resolves(`problem ${unit.id}`, "concept", conceptIds, unit.teaches);
  resolves(`problem ${unit.id}`, "concept", conceptIds, unit.requires);
  if (unit.lesson) resolves(`problem ${unit.id}`, "lesson", lessonIds, [unit.lesson]);
}

for (const drill of DRILLS) {
  resolves(`drill ${drill.id}`, "concept", conceptIds, drill.teaches);
}

for (const lesson of COURSE_LESSONS) {
  if (lesson.atomId) resolves(`lesson ${lesson.id}`, "atom", atomIds, [lesson.atomId]);
  resolves(`lesson ${lesson.id}`, "rep", problemIds, lesson.repIds);
  resolves(`lesson ${lesson.id}`, "problem", problemIds, lesson.problemIds);
  resolves(`lesson ${lesson.id}`, "drill", drillIds, lesson.drillIds ?? []);
}

for (const mod of COURSE_MODULES) {
  resolves(`module ${mod.id}`, "lesson", lessonIds, mod.lessonIds);
}

// A lesson nobody lists is unreachable from the roadmap.
const listed = new Set(COURSE_MODULES.flatMap((m) => m.lessonIds));
for (const lesson of COURSE_LESSONS) {
  if (!listed.has(lesson.id)) {
    problems.push(`lesson ${lesson.id} is in no module`);
  }
}

// A graded unit claimed by two lessons is the same silent-overwrite bug.
const owner = new Map();
for (const lesson of COURSE_LESSONS) {
  for (const id of [...lesson.repIds, ...lesson.problemIds, ...(lesson.drillIds ?? [])]) {
    if (owner.has(id)) {
      problems.push(`unit "${id}" is claimed by both ${owner.get(id)} and ${lesson.id}`);
    }
    owner.set(id, lesson.id);
  }
}

if (problems.length) {
  console.log(`\n${problems.length} integrity problems\n`);
  for (const p of problems) console.log("  " + p);
  console.log();
  process.exit(1);
}

console.log(
  `\nids clean - ${CONCEPTS.length} concepts, ${ATOMS.length} atoms, ` +
    `${COURSE_LESSONS.length} lessons, ${PROBLEMS.length} problems, ` +
    `${DRILLS.length} drills, every reference resolves\n`,
);

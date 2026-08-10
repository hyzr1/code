/** Compile every Python block displayed in the active 73-lesson course. */
import { spawnSync } from "node:child_process";
import { ATOMS, COURSE_LESSONS } from "../.check/content.mjs";

const activeAtomIds = new Set(
  COURSE_LESSONS
    .filter((lesson) =>
      lesson.id.startsWith("py.lesson.") && /^py\.m(?:[0-9]|1[0-2])$/.test(lesson.moduleId)
    )
    .map((lesson) => lesson.atomId),
);
const moduleByAtomId = new Map(
  COURSE_LESSONS.map((lesson) => [lesson.atomId, lesson.moduleId]),
);

const failures = [];
let blockCount = 0;
let executedCount = 0;
for (const atom of ATOMS.filter((candidate) => activeAtomIds.has(candidate.id))) {
  const blocks = [...atom.body.matchAll(/```python\n([\s\S]*?)```/g)];
  for (const [index, match] of blocks.entries()) {
    blockCount += 1;
    const result = spawnSync(
      "python",
      [
        "-c",
        "import ast,sys; compile(sys.stdin.read(), sys.argv[1], 'exec', ast.PyCF_ALLOW_TOP_LEVEL_AWAIT)",
        `${atom.id} block ${index + 1}`,
      ],
      { input: match[1], encoding: "utf8" },
    );
    if (result.status !== 0) {
      failures.push(`${atom.id} block ${index + 1}: ${result.stderr.trim()}`);
    }
  }

  // The beginner walkthrough is presented as the first copyable program, so
  // it must not merely parse: it must run from a blank process with no hidden
  // notebook state or name defined on an earlier slide.
  if (["py.m0", "py.m1", "py.m2"].includes(moduleByAtomId.get(atom.id))) {
    const walkthrough = atom.body.match(
      /## Walk through an example\n\n```python\n([\s\S]*?)```/,
    )?.[1];
    if (walkthrough) {
      executedCount += 1;
      const result = spawnSync("python", ["-c", walkthrough], {
        encoding: "utf8",
        timeout: 5_000,
      });
      if (result.status !== 0 || result.error) {
        failures.push(
          `${atom.id} beginner walkthrough does not run alone: ` +
          (result.error?.message ?? result.stderr.trim()),
        );
      }
    }
  }
}

if (failures.length) {
  console.error(`lecture Python compile failures (${failures.length})`);
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}

console.log(
  `lecture Python clean - ${blockCount} displayed blocks compile; ` +
  `${executedCount} beginner walkthroughs run from a blank process`,
);

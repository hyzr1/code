/** Keep the guided MATH 19A/19B path complete as curriculum changes. */
import { build } from "esbuild";
import { COURSE_MODULES } from "../.check/content.mjs";

await build({
  entryPoints: ["src/content/math/study-guides.ts"],
  bundle: true,
  platform: "node",
  format: "esm",
  outfile: ".check/math-study-guides.mjs",
  logLevel: "silent",
});

const { MATH_STUDY_GUIDES } = await import("../.check/math-study-guides.mjs");
const guidedModules = COURSE_MODULES.filter((module) => module.course === "math" && module.part <= 2);
const failures = [];
const expectedIds = new Set(guidedModules.flatMap((module) => module.lessonIds));

if (guidedModules.length !== 10) failures.push(`expected 10 calculus modules, found ${guidedModules.length}`);
if (expectedIds.size !== 78) failures.push(`expected 78 calculus lessons, found ${expectedIds.size}`);

for (const id of expectedIds) {
  const guide = MATH_STUDY_GUIDES[id];
  if (!guide) { failures.push(`${id}: missing guide`); continue; }
  if (guide.opening.length < 1 || guide.examples.length < 2 || guide.practice.length < 2) {
    failures.push(`${id}: needs an explanation, two worked examples, and two practice problems`);
  }
  const sections = [
    ...guide.opening,
    ...guide.examples.flatMap(({ question, approach, steps, check }) => [question, approach, ...steps, check]),
    ...guide.practice.flatMap(({ question, hint, solution }) => [question, hint, ...solution]),
    guide.takeaway,
  ];
  if (sections.join(" ").trim().split(/\s+/).length < 200) failures.push(`${id}: study guide is too brief`);
  for (const [index, example] of guide.examples.entries()) {
    if (!example.approach || !example.check || example.steps.length < 2) failures.push(`${id}: worked example ${index + 1} lacks reasoning or a check`);
  }
  for (const [index, problem] of guide.practice.entries()) {
    if (!problem.hint || problem.solution.length < 1) failures.push(`${id}: practice ${index + 1} lacks a hint or solution`);
  }
}

for (const id of Object.keys(MATH_STUDY_GUIDES)) {
  if (!expectedIds.has(id)) failures.push(`${id}: guide does not map to a calculus lesson`);
}

if (failures.length) {
  console.error(`math study guides have ${failures.length} problems`);
  failures.forEach((failure) => console.error(`  - ${failure}`));
  process.exit(1);
}

console.log(`math study guides clean - ${guidedModules.length} modules, ${expectedIds.size} fully guided lessons`);

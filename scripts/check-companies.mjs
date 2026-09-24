import {
  COMPANY_TARGETS,
  PREPARATION_BANDS,
  PROBLEMS,
  lessonsForCourse,
  problemFitsPreparation,
} from "../.check/content.mjs";
import { readFileSync, statSync } from "node:fs";
import path from "node:path";

const failures = [];
const fail = (message) => failures.push(message);

if (COMPANY_TARGETS.length !== 200) {
  fail(`expected exactly 200 company targets, found ${COMPANY_TARGETS.length}`);
}

for (const field of ["id", "name", "domain"]) {
  const values = COMPANY_TARGETS.map((company) => company[field]);
  if (new Set(values).size !== values.length) fail(`company ${field}s must be unique`);
}

for (const company of COMPANY_TARGETS) {
  if (!/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(company.domain)) {
    fail(`${company.name} has an invalid logo domain: ${company.domain}`);
  }
  if (!PREPARATION_BANDS.some((band) => band.level === company.level)) {
    fail(`${company.name} points at missing preparation level ${company.level}`);
  }
  try {
    const logo = path.resolve("public/company-logos", `${company.id}.ico`);
    if (statSync(logo).size <= 100) fail(`${company.name} has an empty bundled logo`);
    const bytes = readFileSync(logo);
    const recognized =
      (bytes[0] === 0x00 && bytes[1] === 0x00 && bytes[2] === 0x01 && bytes[3] === 0x00) ||
      (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) ||
      (bytes[0] === 0xff && bytes[1] === 0xd8) ||
      bytes.subarray(0, 4).toString("ascii") === "GIF8" ||
      bytes.subarray(8, 12).toString("ascii") === "WEBP";
    if (!recognized) fail(`${company.name} logo is not a recognized browser image`);
  } catch {
    fail(`${company.name} is missing its bundled logo`);
  }
}

for (const band of PREPARATION_BANDS) {
  const count = COMPANY_TARGETS.filter((company) => company.level === band.level).length;
  if (count !== 40) fail(`${band.label} must contain 40 companies, found ${count}`);
}

const expectedCounts = new Map([[1, 59], [2, 64], [3, 69], [4, 73], [5, 73]]);
let previousPracticeCount = 0;
for (const [level, expected] of expectedCounts) {
  const lessons = lessonsForCourse("swe", level);
  const pythonCore = lessons.filter((lesson) => /^py\.m[0-7]$/.test(lesson.moduleId)).length;
  if (lessons.length !== expected) {
    fail(`level ${level} should contain ${expected} lessons, found ${lessons.length}`);
  }
  if (pythonCore !== 50) {
    fail(`level ${level} weakened the shared Python core (${pythonCore}/50 lessons)`);
  }
  const practiceCount = PROBLEMS.filter(
    (problem) => problem.language === "python" && problem.tier !== "rep" && problemFitsPreparation(problem, level),
  ).length;
  if (practiceCount <= previousPracticeCount) {
    fail(`level ${level} practice pool (${practiceCount}) must be larger than level ${level - 1} (${previousPracticeCount})`);
  }
  previousPracticeCount = practiceCount;
}

if (failures.length) {
  console.error(`\n${failures.length} company-map failures\n`);
  failures.forEach((failure) => console.error(`  ${failure}`));
  process.exit(1);
}

console.log("company map clean - 200 unique targets, 40 per band, shared 50-lesson Python core");

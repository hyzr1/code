/**
 * Learning-design quality gate for the Python path.
 *
 * This deliberately measures observable proxies rather than claiming to
 * measure a learner's eventual interview result. A passing score means the
 * path consistently explains, retrieves, visualizes, verifies, and adapts.
 */
import {
  ATOMS,
  COURSE_LESSONS,
  COURSE_MODULES,
  PROBLEMS,
  PROJECT_CHECKPOINTS,
  PROJECT_SHIPPING_REQUIREMENTS,
  buildScenes,
} from "../.check/content.mjs";

const pythonAtoms = ATOMS.filter((atom) => atom.language === "python");
const atomById = new Map(pythonAtoms.map((atom) => [atom.id, atom]));
// Roadmap entries are promises, not lectures. Quality metrics must never let
// hundreds of intentionally disabled placeholders dilute or inflate the score.
const pythonLessons = COURSE_LESSONS.filter(
  (lesson) => lesson.language === "python" && lesson.atomId && atomById.has(lesson.atomId),
);
const pythonProblems = PROBLEMS.filter((problem) => problem.language === "python");
const interviewProblems = pythonProblems.filter(
  (problem) => problem.tier === "problem" || problem.tier === "challenge",
);
const patternAtoms = pythonAtoms.filter((atom) =>
  /hash|pointer|window|stack|interval|binary|heap|tree|graph|backtrack|dynamic|prefix|topological|union|shortest|grid/i.test(atom.id),
);

const ratio = (items, predicate) =>
  items.length ? items.filter(predicate).length / items.length : 0;
const points = (value, maximum) => Math.round(value * maximum * 10) / 10;

const structured = ratio(
  pythonAtoms,
  (atom) => (atom.body.match(/^## /gm) ?? []).length >= 3 && atom.body.includes("```python"),
);
const conciseScenes = ratio(
  pythonAtoms.flatMap(buildScenes).filter((scene) => scene.kind === "text"),
  (scene) => scene.narration.split(/\s+/).length <= 38,
);
const clarity = points(structured, 9) + points(conciseScenes, 6);

const hasRecall = ratio(pythonAtoms, (atom) => atom.recall?.trim().length > 20);
const hasPracticeAfterFoundations = ratio(
  pythonLessons.slice(4),
  (lesson) =>
    lesson.repIds.length > 0 ||
    lesson.problemIds.length > 0 ||
    (lesson.drillIds?.length ?? 0) > 0,
);
// Open recall is harder to fake than the old generated multiple choice, whose
// two options were often both true. Practice follows once functions exist.
const retrieval = points(hasRecall, 8) + points(hasPracticeAfterFoundations, 7);

const patternScenes = patternAtoms.flatMap(buildScenes);
const visualCoverage = ratio(patternAtoms, (atom) =>
  buildScenes(atom).some((scene) => scene.visualKind),
);
const synchronizedCode = ratio(
  patternScenes.filter((scene) => scene.code),
  // A calm code panel is preferable to a false highlight. Count a scene as
  // guided when every authored highlight has a real timeline, or when the
  // composer deliberately found no honest line to point at.
  (scene) =>
    Boolean(scene.focusLabel) &&
    (!scene.focusLines?.length || Boolean(scene.focusSteps?.length)),
);

const projectIds = PROJECT_CHECKPOINTS.flatMap((checkpoint) =>
  checkpoint.projects.map((project) => project.id),
);
const projectSpecsComplete =
  PROJECT_CHECKPOINTS.length === 5 &&
  new Set(PROJECT_CHECKPOINTS.map((checkpoint) => checkpoint.afterModuleId)).size === 5 &&
  new Set(projectIds).size === 15 &&
  PROJECT_SHIPPING_REQUIREMENTS.length >= 8 &&
  PROJECT_CHECKPOINTS.every((checkpoint) =>
    checkpoint.projects.length === 3 && checkpoint.projects.every((project) =>
      project.stack.length >= 6 &&
      project.architecture.length >= 4 &&
      project.milestones.length >= 4 &&
      project.milestones.every((milestone) => milestone.tasks.length >= 3) &&
      project.acceptanceTests.length >= 4 &&
      project.stretchGoals.length >= 2 &&
      project.resumeBullet.length >= 80
    )
  );

if (!projectSpecsComplete) {
  console.error("portfolio project gate failed: expected five checkpoints with three complete specifications each");
  process.exit(1);
}
console.log("portfolio projects clean - 5 checkpoints, 15 complete specifications, shared shipping rubric");
const visibleState = ratio(patternAtoms, (atom) =>
  buildScenes(atom).some((scene) => scene.traceItems?.length || scene.keyTerms?.length),
);
const visual = points(visualCoverage, 7) + points(synchronizedCode, 5) + points(visibleState, 3);

const tested = ratio(interviewProblems, (problem) => problem.tests.length >= 3);
const scaffolded = ratio(
  interviewProblems,
  (problem) => problem.hints.length >= 3 && (problem.walkthrough?.length ?? 0) >= 3,
);
const analyzedHard = ratio(
  interviewProblems.filter((problem) => problem.difficulty.concept >= 5),
  (problem) => problem.analysis?.time && problem.analysis?.space && problem.analysis?.invariant,
);
const hasDifficultyLadder = new Set(
  interviewProblems.map((problem) => problem.difficulty.concept),
).size >= 4;
const algorithms =
  points(tested, 7) +
  points(scaffolded, 7) +
  points(analyzedHard, 7) +
  (hasDifficultyLadder ? 4 : 0);

const tracks = ["faang", "swe", "ml", "quant"];
const moduleCoverage = ratio(tracks, (track) =>
  COURSE_MODULES.some(
    (module) => module.language === "python" && module.tracks?.includes(track),
  ),
);
const lessonCoverage = ratio(tracks, (track) =>
  COURSE_LESSONS.filter(
    (lesson) => lesson.language === "python" && lesson.tracks?.includes(track),
  ).length >= 4,
);
const problemCoverage = ratio(tracks, (track) =>
  pythonProblems.filter((problem) => problem.tracks?.includes(track)).length >= 12,
);
const personalization =
  points(moduleCoverage, 4) + points(lessonCoverage, 3) + points(problemCoverage, 3);

// A polished lecture is still a bad beginner course when it silently assumes
// future knowledge. Score ordering directly so the old 99/100 cannot return
// while lesson two is already discussing mutation.
const lessonIndexByConcept = new Map(
  pythonLessons.flatMap((lesson, index) =>
    (atomById.get(lesson.atomId)?.teaches ?? []).map((concept) => [concept, index]),
  ),
);
const dependencySafe = ratio(pythonLessons, (lesson, index) =>
  (atomById.get(lesson.atomId)?.requires ?? []).every(
    (requirement) => (lessonIndexByConcept.get(requirement) ?? Infinity) < index,
  ),
);
const expectedFoundation = [
  "programs", "values", "calls", "variables", "first-function", "numbers", "strings",
  "fstrings", "booleans", "branching", "lists", "text-split", "slicing", "loops", "iteration-tools",
  "aggregation-tools", "loop-control", "names", "functions", "tuples", "dicts", "dict-iteration", "format-specs", "sets", "unpacking",
  "comprehensions", "sorting", "complexity",
].map((id) => `py.lesson.${id}`);
const foundationOrdered = expectedFoundation.every(
  (id, index) => pythonLessons[index]?.id === id,
);
const codingStartsAfterBasics = pythonLessons.slice(0, 4).every(
  (lesson) => lesson.repIds.length === 0 && lesson.problemIds.length === 0,
) && pythonLessons[4]?.repIds.length === 1;
const sectionText = (body, heading) => {
  const marker = `## ${heading}\n\n`;
  const start = body.indexOf(marker);
  if (start < 0) return "";
  const rest = body.slice(start + marker.length);
  const next = rest.indexOf("\n## ");
  return next < 0 ? rest : rest.slice(0, next);
};
const wordCount = (text) => (text.match(/\b[\w’'-]+\b/g) ?? []).length;
const detailedEnough = ratio(pythonAtoms, (atom) =>
  (atom.body.match(/^## /gm) ?? []).length >= 6 &&
  atom.body.includes("## Words you will use") &&
  (atom.body.match(/^- \*\*.+\*\* — .+/gm) ?? []).length >= 3 &&
  wordCount(sectionText(atom.body, "The idea, step by step")) >= 30 &&
  wordCount(sectionText(atom.body, "Walk through an example")) >= 25 &&
  wordCount(sectionText(atom.body, "A mistake to avoid")) >= 12 &&
  wordCount(sectionText(atom.body, "What to remember")) >= 8,
);
const progression =
  points(dependencySafe, 6) +
  (foundationOrdered ? 6 : 0) +
  (codingStartsAfterBasics ? 3 : 0) +
  points(detailedEnough, 5);

const dimensions = [
  ["beginner progression", progression, 20],
  ["explanation clarity", clarity, 15],
  ["active retrieval", retrieval, 15],
  ["guided visualization", visual, 15],
  ["algorithm rigor", algorithms, 25],
  ["role personalization", personalization, 10],
];
const total = Math.round(dimensions.reduce((sum, [, score]) => sum + score, 0));

console.log("\nPython learning-design score");
for (const [label, score, maximum] of dimensions) {
  console.log(`  ${label.padEnd(22)} ${String(score).padStart(4)} / ${maximum}`);
}
console.log(`  ${"total".padEnd(22)} ${String(total).padStart(4)} / 100\n`);

if (total < 85 || dimensions.some(([, score, maximum]) => score / maximum < 0.7)) {
  console.error("course quality gate failed: total must be 85+ and every dimension 70%+");
  process.exit(1);
}

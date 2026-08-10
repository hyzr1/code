/** Quality gate for newly authored Algo and ML lectures. */
import { ATOMS, buildScenes, forSpeech } from "../.check/content.mjs";

const lectures = ATOMS.filter((atom) => /^py\.atom\.(?:algo|ml)\./.test(atom.id));
const failures = [];

for (const atom of lectures) {
  const codeBlocks = (atom.body.match(/```python\n/g) ?? []).length;
  const definitions = atom.body.match(/^- \*\*.+\*\* — .+$/gm) ?? [];
  const scenes = buildScenes(atom).filter((scene) => scene.kind === "text");
  const wordCounts = scenes.map((scene) => forSpeech(scene.narration).split(/\s+/).filter(Boolean).length);
  const averageWords = wordCounts.reduce((sum, count) => sum + count, 0) / Math.max(1, wordCounts.length);

  if (!atom.body.includes("## Words you will use")) failures.push(`${atom.id}: missing plain-language vocabulary section`);
  if (definitions.length < 3) failures.push(`${atom.id}: defines ${definitions.length}/3 required terms`);
  if (codeBlocks < 1) failures.push(`${atom.id}: needs a visible Python example`);
  if ((atom.checks?.length ?? 0) < 2) failures.push(`${atom.id}: needs at least two retrieval checks`);
  if (averageWords > 24) failures.push(`${atom.id}: average slide is ${averageWords.toFixed(1)} words; simplify the wording`);
  if (wordCounts.some((count) => count > 36)) failures.push(`${atom.id}: contains a slide longer than 36 spoken words`);
  if (/\b(?:obviously|trivially|clearly|as you know)\b/i.test(atom.body)) {
    failures.push(`${atom.id}: uses dismissive assumed-knowledge wording`);
  }
}

if (failures.length) {
  console.error(`\n${failures.length} roadmap lecture quality failures\n`);
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}

console.log(`roadmap lectures clean - ${lectures.length} lectures use defined vocabulary, short slides, visible code, and retrieval`);

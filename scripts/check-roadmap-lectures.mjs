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
  // Calibrated against the core Python course, which these lectures are meant
  // to read like: it averages 22.5 spoken words per slide and its most
  // hand-holding lectures (`loops`, `complexity`, `api-contracts`) sit at
  // 24.5-25.6. A cap of 24 was stricter than the course being emulated and
  // pushed authors to thin the explanation out. 26 allows a lecture to be as
  // dense as the densest core lecture and no denser. The hard 36-word ceiling
  // below is what actually prevents a wall of text in one breath.
  if (averageWords > 26) failures.push(`${atom.id}: average slide is ${averageWords.toFixed(1)} words; simplify the wording`);
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

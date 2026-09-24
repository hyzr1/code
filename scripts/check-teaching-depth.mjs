/**
 * Tracks how many mastery lectures still teach in the terse style rather than
 * the core course's hand-holding style, and stops that number from growing.
 *
 * The core Python course explains a mechanic before showing it, defines each
 * term at the moment it is first used, comments its code, and walks a trace
 * through concrete values. Many Algo and ML lectures were authored to a
 * shorter template that states the mechanic and moves on. Rewriting all of
 * them is a long job, so this is a ratchet rather than a pass/fail gate: the
 * backlog may shrink freely and may never grow.
 *
 * Lower BASELINE whenever the reported count drops. That is the only
 * maintenance this file needs.
 */
import { ATOMS } from "../.check/content.mjs";

/** Update this downward as lectures are deepened. Never raise it. */
const BASELINE = 471;

const lectures = ATOMS.filter((atom) => /^py\.atom\.(?:algo|ml)\./.test(atom.id));
const shallow = [];

for (const atom of lectures) {
  const reasons = [];
  const body = atom.body;
  const prose = body.replace(/```[\s\S]*?```/g, " ");
  const code = [...body.matchAll(/```python\n([\s\S]*?)```/g)].map((m) => m[1]);

  // The core course explains the idea in prose before the first code block.
  if (!body.includes("## The idea, step by step")) reasons.push("no explanation section");

  // Code that carries no comment makes the reader infer intent from syntax.
  if (!code.some((block) => block.includes("#"))) reasons.push("no commented code");

  // A term defined in the vocabulary list and never used again was not taught.
  const defined = [...body.matchAll(/^- \*\*(.+?)\*\* — /gm)].map((m) => m[1].toLowerCase());
  const afterVocabulary = prose.slice(prose.indexOf("## Words you will use") + 1);
  const unused = defined.filter((term) => {
    const rest = afterVocabulary.slice(afterVocabulary.indexOf("\n##", 1));
    return !rest.toLowerCase().includes(term.split(/\s+/)[0]);
  });
  if (unused.length > 1) reasons.push(`${unused.length} terms defined but never used`);

  if (reasons.length) shallow.push(`${atom.id}: ${reasons.join(", ")}`);
}

const count = shallow.length;
console.log(
  `mastery teaching depth - ${lectures.length - count}/${lectures.length} mastery lectures explain before they show`,
);

if (count > BASELINE) {
  console.error(
    `\nteaching depth regressed: ${count} shallow lectures, baseline is ${BASELINE}\n`,
  );
  for (const entry of shallow.slice(0, 20)) console.error(`  - ${entry}`);
  process.exit(1);
}

if (count < BASELINE) {
  console.log(`  backlog is ${count}; lower BASELINE in this file from ${BASELINE} to ${count}`);
}

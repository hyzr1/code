/**
 * A prose dash written as " - " is read aloud as the word "minus".
 *
 * `forSpeech` maps a standalone hyphen to "minus" so that arithmetic such as
 * `n - 1` narrates correctly. The cost is that an em dash typed as a hyphen
 * turns a sentence into nonsense: "one call, one frame - always" is spoken as
 * "one call, one frame minus always". Use a real em dash (—) in prose; it
 * narrates as a pause. Keep the hyphen only for arithmetic.
 */
import { ATOMS } from "../.check/content.mjs";

const failures = [];

for (const atom of ATOMS) {
  // Fenced blocks are code; a hyphen there is an operator, not punctuation.
  const prose = atom.body
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " CODE ");
  for (const match of prose.matchAll(/(\w{2,}) - ([a-zA-Z]\w+)/g)) {
    // Digits on either side mean arithmetic, which narrates correctly.
    if (/^\d+$/.test(match[1])) continue;
    failures.push(`${atom.id}: "${match[0]}" narrates as "${match[1]} minus ${match[2]}"; use an em dash`);
  }
}

if (failures.length) {
  console.error(`\n${failures.length} prose dashes that narrate as "minus"\n`);
  for (const failure of failures.slice(0, 40)) console.error(`  - ${failure}`);
  if (failures.length > 40) console.error(`  ... and ${failures.length - 40} more`);
  process.exit(1);
}

console.log(`narration dashes clean - ${ATOMS.length} lectures, every prose dash narrates as a pause`);

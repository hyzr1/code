/**
 * Prints exactly what the synthesiser will be handed, scene by scene.
 *
 * Reading the source tells you nothing about how it sounds — `10 * 5` and
 * `scores[0]` look fine on the page and are gibberish out loud.
 *
 * Run: node scripts/narration-report.mjs teach.collections
 */
import { ATOMS, buildScenes, forSpeech } from "../.check/content.mjs";

const wanted = process.argv[2] ?? "teach.collections";
const only = process.argv[3] ? Number(process.argv[3]) : null;
const atom = ATOMS.find((a) => a.id === wanted);

if (!atom) {
  console.log(`No such lecture. Try:\n${ATOMS.map((a) => "  " + a.id).join("\n")}`);
  process.exit(1);
}

const scenes = buildScenes(atom);
console.log(`\n${atom.title} — spoken text\n`);

scenes.forEach((scene, i) => {
  if (only && i + 1 !== only) return;
  const spoken = forSpeech(scene.narration);
  const marker = scene.code ? "▐" : " ";
  console.log(`  ${String(i + 1).padStart(2)} ${marker} ${spoken || "(silent)"}`);
});

console.log("");

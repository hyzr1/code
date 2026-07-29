/**
 * Prints the timing of one lecture, scene by scene, so pacing can be tuned
 * without sitting through it in real time.
 *
 * Run: node scripts/pacing-report.mjs teach.program
 */
import {
  ATOMS,
  buildScenes,
  holdSeconds,
  revealSeconds,
  sceneSeconds,
  speechSeconds,
} from "../.check/content.mjs";

const wanted = process.argv[2] ?? "teach.program";
const rate = Number(process.argv[3] ?? 1);
const atom = ATOMS.find((a) => a.id === wanted);

if (!atom) {
  console.log(`No such lecture. Try one of:\n${ATOMS.map((a) => "  " + a.id).join("\n")}`);
  process.exit(1);
}

const scenes = buildScenes(atom);
let total = 0;

console.log(`\n${atom.title}  —  ${scenes.length} scenes at ${rate}x\n`);
console.log("  #   speak  hold   total   content");
console.log("  " + "-".repeat(74));

scenes.forEach((scene, i) => {
  const speak = speechSeconds(scene.narration, rate);
  const hold = holdSeconds(scene, rate);
  const seconds = Math.max(speak, revealSeconds(scene)) + hold;
  total += seconds;

  const label =
    scene.kind === "section"
      ? `§ ${scene.caption}`
      : scene.caption || `[code only] ${scene.narration || "SILENT"}`;

  console.log(
    `  ${String(i + 1).padStart(2)}  ${speak.toFixed(1).padStart(5)}s ${hold
      .toFixed(1)
      .padStart(5)}s ${seconds.toFixed(1).padStart(6)}s   ${
      scene.code ? "▐ " : "  "
    }${label.replace(/\s+/g, " ").slice(0, 52)}`,
  );
});

const silent = scenes.filter((s) => !s.narration && s.kind === "text").length;

console.log("  " + "-".repeat(74));
console.log(
  `  total ${Math.floor(total / 60)}m ${Math.round(total % 60)}s` +
    `   ·   ${(total / scenes.length).toFixed(1)}s average per scene` +
    `   ·   ${silent} silent scenes\n`,
);

import { createHash } from "node:crypto";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = process.cwd();
const { PYTHON_REELS, COURSE_LESSONS } = await import(pathToFileURL(path.join(ROOT, ".check", "content.mjs")));
const manifest = JSON.parse(await readFile(path.join(ROOT, "public", "reels", "audio", "manifest.json"), "utf8"));
const errors = [];
const unique = (values) => new Set(values).size;
const lessonIds = new Set(COURSE_LESSONS.map((lesson) => lesson.id));

if (PYTHON_REELS.length < 30) errors.push(`Only ${PYTHON_REELS.length} reels; expected at least 30`);
if (unique(PYTHON_REELS.map((reel) => reel.id)) !== PYTHON_REELS.length) errors.push("Duplicate reel IDs");
if (unique(PYTHON_REELS.map((reel) => reel.format)) < 8) errors.push("Not all reel formats are represented");
if (unique(PYTHON_REELS.map((reel) => reel.palette)) < 8) errors.push("Not all reel palettes are represented");
if (unique(PYTHON_REELS.map((reel) => reel.voice)) < 5) errors.push("Fewer than five voices are represented");

for (const reel of PYTHON_REELS) {
  if (reel.beats.length < 4 || reel.beats.length > 7) errors.push(`${reel.id}: expected 4–7 beats`);
  if (reel.lessonId && !lessonIds.has(reel.lessonId)) errors.push(`${reel.id}: bad lesson ${reel.lessonId}`);
  reel.beats.forEach((beat, index) => {
    if (!beat.narration.trim() || !beat.caption?.trim()) errors.push(`${reel.id}:${index}: missing narration or caption`);
    const lineCount = beat.code?.split("\n").length ?? 0;
    if (beat.focusLines?.some((line) => line < 1 || line > lineCount)) errors.push(`${reel.id}:${index}: invalid focus line`);
  });
  const asset = manifest.reels[reel.id];
  if (!asset) { errors.push(`${reel.id}: missing audio asset`); continue; }
  const expectedHash = createHash("sha256").update(JSON.stringify({ voice: reel.voice, pace: reel.pace, beats: reel.beats.map((beat) => beat.narration) })).digest("hex");
  if (asset.contentHash !== expectedHash) errors.push(`${reel.id}: stale audio`);
  if (asset.beats.length !== reel.beats.length) errors.push(`${reel.id}: audio beat mismatch`);
  if (asset.beats.some((beat, index) => beat.duration <= .25 || (index && beat.start <= asset.beats[index - 1].start))) errors.push(`${reel.id}: invalid cue timing`);
  try {
    const info = await stat(path.join(ROOT, "public", "reels", "audio", asset.file));
    if (info.size < 2_000) errors.push(`${reel.id}: audio file is suspiciously small`);
  } catch { errors.push(`${reel.id}: audio file missing`); }
  try {
    const fallback = await stat(path.join(ROOT, "public", "reels", "audio", asset.fallbackFile));
    if (fallback.size < 2_000) errors.push(`${reel.id}: Safari audio file is suspiciously small`);
  } catch { errors.push(`${reel.id}: Safari audio file missing`); }
}

const extra = Object.keys(manifest.reels).filter((id) => !PYTHON_REELS.some((reel) => reel.id === id));
if (extra.length) errors.push(`Manifest has unknown reels: ${extra.join(", ")}`);
if (errors.length) {
  console.error(errors.map((error) => `- ${error}`).join("\n"));
  process.exit(1);
}
console.log(`[reels] ${PYTHON_REELS.length} reels, ${unique(PYTHON_REELS.map((reel) => reel.voice))} voices, ${unique(PYTHON_REELS.map((reel) => reel.format))} formats, all audio synchronized`);

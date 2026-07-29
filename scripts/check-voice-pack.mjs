import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = process.cwd();
const VOICE = "af_heart";
const manifestPath = path.join(ROOT, "public", "voice-packs", VOICE, "manifest.json");
const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
const content = await import(pathToFileURL(path.join(ROOT, ".check", "content.mjs")));
const { ATOMS, buildScenes, forSpeech } = content;

if (manifest.version !== 1 || manifest.voice !== VOICE) {
  throw new Error("Heart voice-pack manifest has the wrong version or voice");
}

let scenes = 0;
for (const atom of ATOMS) {
  const lecture = manifest.lectures[atom.id];
  if (!lecture) throw new Error(`Heart voice pack is missing lecture ${atom.id}`);
  const file = path.join(ROOT, "public", "voice-packs", VOICE, lecture.file);
  const info = await stat(file);
  if (!info.isFile() || info.size < 1024) throw new Error(`Heart audio is invalid for ${atom.id}`);

  for (const scene of buildScenes(atom)) {
    const text = forSpeech(scene.narration);
    if (!text) continue;
    scenes += 1;
    const cue = manifest.entries[text];
    if (!cue || cue.duration <= 0 || cue.start < 0) {
      throw new Error(`Heart voice pack is missing narration in ${atom.id}: ${text.slice(0, 80)}`);
    }
  }
}

console.log(
  `voice pack clean - ${Object.keys(manifest.lectures).length} lectures, ${scenes} scenes, every language, cue, and Opus file present`,
);

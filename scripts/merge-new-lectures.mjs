// One-off: merge deferred-manifest lecture builds into the existing voice-pack
// manifest without regenerating the whole pack. Reads the per-atom cache
// metadata written by build-voice-pack.mjs (--defer-manifest) for the atoms
// named on the command line and splices their lectures + cues into
// public/voice-packs/af_heart/manifest.json in place.
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const VOICE = "af_heart";
const ROOT = process.cwd();
const MANIFEST = path.join(ROOT, "public", "voice-packs", VOICE, "manifest.json");
const CACHE = path.join(ROOT, ".voice-pack-cache", VOICE);

const atomIds = process.argv.slice(2);
if (!atomIds.length) throw new Error("usage: node scripts/merge-new-lectures.mjs <atom.id> [<atom.id> ...]");

const manifest = JSON.parse(await readFile(MANIFEST, "utf8"));
let addedLectures = 0;
let addedCues = 0;

for (const atomId of atomIds) {
  const meta = JSON.parse(await readFile(path.join(CACHE, `${atomId}.json`), "utf8"));
  manifest.lectures[meta.lecture] = {
    file: meta.file,
    duration: meta.duration,
    contentHash: meta.contentHash,
  };
  addedLectures += 1;
  for (const cue of meta.cues) {
    manifest.entries[cue.text] = {
      lecture: meta.lecture,
      start: cue.start,
      duration: cue.duration,
    };
    addedCues += 1;
  }
}

await writeFile(MANIFEST, JSON.stringify(manifest));
console.log(
  `merged ${addedLectures} lectures, ${addedCues} cues -> ` +
  `${Object.keys(manifest.lectures).length} lectures, ${Object.keys(manifest.entries).length} entries total`,
);

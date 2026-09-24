import { createHash } from "node:crypto";
import { spawn } from "node:child_process";
import { createWriteStream } from "node:fs";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { once } from "node:events";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { performance } from "node:perf_hooks";
import ffmpegPath from "ffmpeg-static";
import { env } from "@huggingface/transformers";
import { KokoroTTS } from "kokoro-js";

const VOICE = process.argv.includes("--voice")
  ? process.argv[process.argv.indexOf("--voice") + 1]
  : "af_heart";
const onlyIndex = process.argv.indexOf("--only");
const ONLY = onlyIndex >= 0 ? process.argv[onlyIndex + 1] : null;
const languageIndex = process.argv.indexOf("--language");
const LANGUAGE = languageIndex >= 0 ? process.argv[languageIndex + 1] : null;
const shardIndexArg = process.argv.indexOf("--shard-index");
const shardCountArg = process.argv.indexOf("--shard-count");
const SHARD_INDEX = shardIndexArg >= 0 ? Number(process.argv[shardIndexArg + 1]) : 0;
const SHARD_COUNT = shardCountArg >= 0 ? Number(process.argv[shardCountArg + 1]) : 1;
const DEFER_MANIFEST = process.argv.includes("--defer-manifest");
const PUBLISH_ONLY = process.argv.includes("--publish-only");
const SAMPLE_RATE = 24_000;
const GAP_SAMPLES = Math.round(SAMPLE_RATE * 0.08);
const ROOT = process.cwd();
const PACK_ROOT = path.join(ROOT, "public", "voice-packs", VOICE);
const LECTURES_ROOT = path.join(PACK_ROOT, "lectures");
const CACHE_ROOT = path.join(ROOT, ".voice-pack-cache", VOICE);

if (!ffmpegPath) throw new Error("ffmpeg-static did not provide a binary");
await mkdir(LECTURES_ROOT, { recursive: true });
await mkdir(CACHE_ROOT, { recursive: true });
env.cacheDir = path.join(ROOT, ".check", "huggingface-cache");

const content = await import(pathToFileURL(path.join(ROOT, ".check", "content.mjs")));
const { ATOMS, buildScenes, forSpeech } = content;
let lectures = ONLY
  ? ATOMS.filter((atom) => atom.id === ONLY)
  : LANGUAGE
    ? ATOMS.filter((atom) => (atom.language ?? "javascript") === LANGUAGE)
    : ATOMS;
if (ONLY && !lectures.length) throw new Error(`Unknown lecture id: ${ONLY}`);
if (LANGUAGE && !lectures.length) throw new Error(`No lectures found for language: ${LANGUAGE}`);
if (!Number.isInteger(SHARD_INDEX) || !Number.isInteger(SHARD_COUNT) || SHARD_COUNT < 1 || SHARD_INDEX < 0 || SHARD_INDEX >= SHARD_COUNT) {
  throw new Error(`Invalid shard ${SHARD_INDEX}/${SHARD_COUNT}`);
}
if (SHARD_COUNT > 1) {
  lectures = lectures.filter((_, index) => index % SHARD_COUNT === SHARD_INDEX);
}
if (PUBLISH_ONLY) lectures = [];

const hash = (value) => createHash("sha256").update(value).digest("hex");
const textsFor = (atom) =>
  buildScenes(atom).map((scene) => forSpeech(scene.narration)).filter(Boolean);

async function existingMeta(atom, contentHash) {
  try {
    const meta = JSON.parse(await readFile(path.join(CACHE_ROOT, `${atom.id}.json`), "utf8"));
    await readFile(path.join(LECTURES_ROOT, `${atom.id}.ogg`));
    return meta.contentHash === contentHash && meta.voice === VOICE ? meta : null;
  } catch {
    return null;
  }
}

const plans = [];
for (const atom of lectures) {
  const texts = textsFor(atom);
  const contentHash = hash(JSON.stringify(texts));
  plans.push({ atom, texts, contentHash, meta: await existingMeta(atom, contentHash) });
}

const pending = plans.filter((plan) => !plan.meta);
let tts = null;
if (pending.length) {
  const started = performance.now();
  console.log(`[voice-pack] loading ${VOICE} (${pending.length} lectures need rendering)`);
  tts = await KokoroTTS.from_pretrained(
    "onnx-community/Kokoro-82M-v1.0-ONNX",
    { dtype: "q8", device: "cpu" },
  );
  console.log(`[voice-pack] model ready in ${((performance.now() - started) / 1000).toFixed(1)}s`);
}

function pcm16(samples) {
  const output = Buffer.allocUnsafe(samples.length * 2);
  for (let i = 0; i < samples.length; i += 1) {
    const value = Math.max(-1, Math.min(1, samples[i]));
    output.writeInt16LE(value < 0 ? Math.round(value * 32768) : Math.round(value * 32767), i * 2);
  }
  return output;
}

async function writeChunk(stream, chunk) {
  if (!stream.write(chunk)) await once(stream, "drain");
}

async function encode(input, output) {
  await new Promise((resolve, reject) => {
    const child = spawn(ffmpegPath, [
      "-hide_banner", "-loglevel", "error", "-y",
      "-f", "s16le", "-ar", String(SAMPLE_RATE), "-ac", "1", "-i", input,
      "-c:a", "libopus", "-b:a", "32k", "-vbr", "on",
      "-application", "audio", "-compression_level", "10", output,
    ], { stdio: ["ignore", "ignore", "pipe"] });
    let stderr = "";
    child.stderr.on("data", (chunk) => { stderr += chunk; });
    child.on("error", reject);
    child.on("exit", (code) => code === 0 ? resolve() : reject(new Error(stderr || `ffmpeg exited ${code}`)));
  });
}

let completedScenes = plans.filter((plan) => plan.meta).reduce((n, plan) => n + plan.texts.length, 0);
const totalScenes = plans.reduce((n, plan) => n + plan.texts.length, 0);
const buildStart = performance.now();

for (let lectureIndex = 0; lectureIndex < plans.length; lectureIndex += 1) {
  const plan = plans[lectureIndex];
  if (plan.meta) {
    console.log(`[voice-pack] ${lectureIndex + 1}/${plans.length} ${plan.atom.id} cached`);
    continue;
  }

  const pcmPath = path.join(CACHE_ROOT, `${plan.atom.id}.pcm`);
  const outputPath = path.join(LECTURES_ROOT, `${plan.atom.id}.ogg`);
  const stream = createWriteStream(pcmPath);
  const cues = [];
  let cursor = 0;

  for (let sceneIndex = 0; sceneIndex < plan.texts.length; sceneIndex += 1) {
    const text = plan.texts[sceneIndex];
    const audio = await tts.generate(text, { voice: VOICE, speed: 1 });
    if (audio.sampling_rate !== SAMPLE_RATE) throw new Error(`Unexpected sample rate ${audio.sampling_rate}`);
    let peak = 0;
    for (const sample of audio.audio) {
      if (!Number.isFinite(sample)) throw new Error(`Invalid audio in ${plan.atom.id}:${sceneIndex}`);
      peak = Math.max(peak, Math.abs(sample));
    }
    if (peak < 1e-6 || peak > 8) throw new Error(`Bad audio in ${plan.atom.id}:${sceneIndex}`);

    cues.push({ text, start: cursor / SAMPLE_RATE, duration: audio.audio.length / SAMPLE_RATE });
    await writeChunk(stream, pcm16(audio.audio));
    await writeChunk(stream, Buffer.alloc(GAP_SAMPLES * 2));
    cursor += audio.audio.length + GAP_SAMPLES;
    completedScenes += 1;
    console.log(
      `[voice-pack] ${lectureIndex + 1}/${plans.length} ${plan.atom.id} ` +
      `scene ${sceneIndex + 1}/${plan.texts.length} (${completedScenes}/${totalScenes})`,
    );
  }

  stream.end();
  await once(stream, "close");
  await encode(pcmPath, outputPath);
  await rm(pcmPath, { force: true });
  plan.meta = {
    version: 1,
    voice: VOICE,
    lecture: plan.atom.id,
    file: `lectures/${plan.atom.id}.ogg`,
    contentHash: plan.contentHash,
    duration: cursor / SAMPLE_RATE,
    cues,
  };
  await writeFile(path.join(CACHE_ROOT, `${plan.atom.id}.json`), JSON.stringify(plan.meta));
}

if (DEFER_MANIFEST) {
  console.log(
    `[voice-pack] shard ${SHARD_INDEX + 1}/${SHARD_COUNT} complete: ` +
    `${plans.length} lectures rendered or cached; manifest deferred`,
  );
  process.exit(0);
}

// A partial build still publishes one complete manifest. Existing metadata for
// the other language is preserved while the selected language is rendered in
// one model session.
const allAtoms = ONLY || LANGUAGE || PUBLISH_ONLY || SHARD_COUNT > 1 ? ATOMS : lectures;
const metas = [];
for (const atom of allAtoms) {
  try {
    metas.push(JSON.parse(await readFile(path.join(CACHE_ROOT, `${atom.id}.json`), "utf8")));
  } catch {
    if (!ONLY) throw new Error(`Missing generated metadata for ${atom.id}`);
  }
}
const entries = {};
const lectureManifest = {};
for (const meta of metas) {
  lectureManifest[meta.lecture] = {
    file: meta.file,
    duration: meta.duration,
    contentHash: meta.contentHash,
  };
  for (const cue of meta.cues) {
    entries[cue.text] = { lecture: meta.lecture, start: cue.start, duration: cue.duration };
  }
}
const manifest = {
  version: 1,
  voice: VOICE,
  codec: "opus",
  sampleRate: SAMPLE_RATE,
  generatedAt: new Date().toISOString(),
  lectures: lectureManifest,
  entries,
};
await writeFile(path.join(PACK_ROOT, "manifest.json"), JSON.stringify(manifest));
await writeFile(
  path.join(ROOT, "public", "voice-packs", "index.json"),
  JSON.stringify({ version: 1, voices: [VOICE] }),
);
console.log(
  `[voice-pack] complete: ${metas.length} lectures, ${Object.keys(entries).length} unique lines, ` +
  `${((performance.now() - buildStart) / 60000).toFixed(1)} minutes this run`,
);

import { createHash } from "node:crypto";
import { spawn } from "node:child_process";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import ffmpegPath from "ffmpeg-static";
import { env } from "@huggingface/transformers";
import { KokoroTTS } from "kokoro-js";

const ROOT = process.cwd();
const SAMPLE_RATE = 24_000;
const GAP_SECONDS = 0.075;
const GAP = Math.round(SAMPLE_RATE * GAP_SECONDS);
const OUTPUT = path.join(ROOT, "public", "reels", "audio");
const CACHE = path.join(ROOT, ".reel-audio-cache");
const ONLY = process.argv.includes("--only") ? process.argv[process.argv.indexOf("--only") + 1] : null;
const hash = (value) => createHash("sha256").update(value).digest("hex");

if (!ffmpegPath) throw new Error("ffmpeg-static did not provide a binary");
await mkdir(OUTPUT, { recursive: true });
await mkdir(CACHE, { recursive: true });
env.cacheDir = path.join(ROOT, ".check", "huggingface-cache");

const { PYTHON_REELS } = await import(pathToFileURL(path.join(ROOT, ".check", "content.mjs")));
const reels = ONLY ? PYTHON_REELS.filter((reel) => reel.id === ONLY) : PYTHON_REELS;
if (!reels.length) throw new Error(`Unknown reel: ${ONLY}`);

function pcm16(samples) {
  const output = Buffer.allocUnsafe(samples.length * 2);
  for (let index = 0; index < samples.length; index += 1) {
    const value = Math.max(-1, Math.min(1, samples[index]));
    output.writeInt16LE(value < 0 ? Math.round(value * 32768) : Math.round(value * 32767), index * 2);
  }
  return output;
}

async function encode(input, output) {
  await new Promise((resolve, reject) => {
    const child = spawn(ffmpegPath, [
      "-hide_banner", "-loglevel", "error", "-y",
      "-f", "s16le", "-ar", String(SAMPLE_RATE), "-ac", "1", "-i", input,
      "-c:a", "libopus", "-b:a", "40k", "-vbr", "on", "-application", "audio",
      "-compression_level", "10", output,
    ], { stdio: ["ignore", "ignore", "pipe"] });
    let stderr = "";
    child.stderr.on("data", (chunk) => { stderr += chunk; });
    child.on("error", reject);
    child.on("exit", (code) => code === 0 ? resolve() : reject(new Error(stderr || `ffmpeg exited ${code}`)));
  });
}

async function encodeAac(input, output, rawPcm = false) {
  await new Promise((resolve, reject) => {
    const inputArgs = rawPcm
      ? ["-f", "s16le", "-ar", String(SAMPLE_RATE), "-ac", "1", "-i", input]
      : ["-i", input];
    const child = spawn(ffmpegPath, [
      "-hide_banner", "-loglevel", "error", "-y", ...inputArgs,
      "-c:a", "aac", "-b:a", "64k", "-movflags", "+faststart", output,
    ], { stdio: ["ignore", "ignore", "pipe"] });
    let stderr = "";
    child.stderr.on("data", (chunk) => { stderr += chunk; });
    child.on("error", reject);
    child.on("exit", (code) => code === 0 ? resolve() : reject(new Error(stderr || `ffmpeg exited ${code}`)));
  });
}

async function cached(reel, contentHash) {
  try {
    const metadata = JSON.parse(await readFile(path.join(CACHE, `${reel.id}.json`), "utf8"));
    const opusPath = path.join(OUTPUT, `${reel.id}.ogg`);
    await readFile(opusPath);
    if (metadata.contentHash !== contentHash) return null;
    const fallbackFile = `${reel.id}.m4a`;
    const fallbackPath = path.join(OUTPUT, fallbackFile);
    try {
      await readFile(fallbackPath);
    } catch {
      console.log(`[reels] ${reel.id} creating Safari audio fallback`);
      await encodeAac(opusPath, fallbackPath);
    }
    if (metadata.fallbackFile !== fallbackFile) {
      metadata.fallbackFile = fallbackFile;
      await writeFile(path.join(CACHE, `${reel.id}.json`), JSON.stringify(metadata));
    }
    return metadata;
  } catch {
    return null;
  }
}

const plans = [];
for (const reel of reels) {
  const contentHash = hash(JSON.stringify({ voice: reel.voice, pace: reel.pace, beats: reel.beats.map((beat) => beat.narration) }));
  plans.push({ reel, contentHash, metadata: await cached(reel, contentHash) });
}

let tts;
if (plans.some((plan) => !plan.metadata)) {
  console.log(`[reels] loading voice model for ${plans.filter((plan) => !plan.metadata).length} reels`);
  tts = await KokoroTTS.from_pretrained("onnx-community/Kokoro-82M-v1.0-ONNX", { dtype: "q8", device: "cpu" });
}

for (let reelIndex = 0; reelIndex < plans.length; reelIndex += 1) {
  const plan = plans[reelIndex];
  if (plan.metadata) {
    console.log(`[reels] ${reelIndex + 1}/${plans.length} ${plan.reel.id} cached`);
    continue;
  }
  const chunks = [];
  const beats = [];
  let cursor = 0;
  for (let beatIndex = 0; beatIndex < plan.reel.beats.length; beatIndex += 1) {
    const beat = plan.reel.beats[beatIndex];
    const audio = await tts.generate(beat.narration, { voice: plan.reel.voice, speed: plan.reel.pace });
    if (audio.sampling_rate !== SAMPLE_RATE) throw new Error(`Unexpected sample rate in ${plan.reel.id}`);
    if (!audio.audio.length || audio.audio.some((value) => !Number.isFinite(value))) throw new Error(`Invalid audio in ${plan.reel.id}:${beatIndex}`);
    beats.push({ start: cursor / SAMPLE_RATE, duration: audio.audio.length / SAMPLE_RATE });
    chunks.push(pcm16(audio.audio), Buffer.alloc(GAP * 2));
    cursor += audio.audio.length + GAP;
    console.log(`[reels] ${reelIndex + 1}/${plans.length} ${plan.reel.id} beat ${beatIndex + 1}/${plan.reel.beats.length}`);
  }
  const pcmPath = path.join(CACHE, `${plan.reel.id}.pcm`);
  await writeFile(pcmPath, Buffer.concat(chunks));
  await encode(pcmPath, path.join(OUTPUT, `${plan.reel.id}.ogg`));
  await encodeAac(pcmPath, path.join(OUTPUT, `${plan.reel.id}.m4a`), true);
  await rm(pcmPath, { force: true });
  plan.metadata = {
    file: `${plan.reel.id}.ogg`,
    fallbackFile: `${plan.reel.id}.m4a`,
    duration: cursor / SAMPLE_RATE,
    contentHash: plan.contentHash,
    voice: plan.reel.voice,
    beats,
  };
  await writeFile(path.join(CACHE, `${plan.reel.id}.json`), JSON.stringify(plan.metadata));
}

// A one-reel repair still republishes a complete manifest from the cache.
const entries = {};
for (const reel of PYTHON_REELS) {
  try {
    entries[reel.id] = JSON.parse(await readFile(path.join(CACHE, `${reel.id}.json`), "utf8"));
  } catch {
    if (!ONLY) throw new Error(`Missing generated audio metadata for ${reel.id}`);
  }
}
await writeFile(path.join(OUTPUT, "manifest.json"), JSON.stringify({
  version: 1,
  generatedAt: new Date().toISOString(),
  codec: "opus",
  sampleRate: SAMPLE_RATE,
  reels: entries,
}));
console.log(`[reels] complete: ${Object.keys(entries).length} reels`);

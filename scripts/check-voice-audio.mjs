/** Decode and acoustically inspect every prerecorded lecture asset. */
import { spawn } from "node:child_process";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import ffmpegPath from "ffmpeg-static";

if (!ffmpegPath) throw new Error("ffmpeg-static did not provide a binary");

const ROOT = process.cwd();
const VOICE = "af_heart";
const manifest = JSON.parse(await readFile(
  path.join(ROOT, "public", "voice-packs", VOICE, "manifest.json"),
  "utf8",
));
const failures = [];
let cueCount = 0;

const inspect = (file) => new Promise((resolve, reject) => {
  const child = spawn(ffmpegPath, [
    "-hide_banner", "-i", file,
    "-af", "silencedetect=noise=-50dB:d=2,astats=metadata=1:reset=0",
    "-f", "null", "-",
  ], { stdio: ["ignore", "ignore", "pipe"] });
  let output = "";
  child.stderr.on("data", (chunk) => { output += chunk; });
  child.on("error", reject);
  child.on("exit", (code) => code === 0
    ? resolve(output)
    : reject(new Error(`ffmpeg exited ${code}: ${output.slice(-500)}`)));
});

const numberMatches = (text, pattern) => [...text.matchAll(pattern)]
  .map((match) => Number(match[1]))
  .filter(Number.isFinite);

for (const [lecture, asset] of Object.entries(manifest.lectures)) {
  const file = path.join(ROOT, "public", "voice-packs", VOICE, asset.file);
  const info = await stat(file);
  if (info.size < 1024) failures.push(`${lecture}: encoded file is only ${info.size} bytes`);

  const meta = JSON.parse(await readFile(
    path.join(ROOT, ".voice-pack-cache", VOICE, `${lecture}.json`),
    "utf8",
  ));
  let previousEnd = 0;
  for (const [index, cue] of meta.cues.entries()) {
    cueCount += 1;
    if (!(cue.duration > 0) || cue.start < previousEnd - 0.002) {
      failures.push(`${lecture}: invalid or overlapping cue ${index + 1}`);
    }
    if (cue.start + cue.duration > meta.duration + 0.002) {
      failures.push(`${lecture}: cue ${index + 1} exceeds its lecture duration`);
    }
    previousEnd = cue.start + cue.duration;
  }

  let analysis;
  try {
    analysis = await inspect(file);
  } catch (error) {
    failures.push(`${lecture}: cannot decode (${error.message})`);
    continue;
  }

  const durationMatch = /Duration:\s*(\d+):(\d+):([\d.]+)/.exec(analysis);
  const duration = durationMatch
    ? Number(durationMatch[1]) * 3600 + Number(durationMatch[2]) * 60 + Number(durationMatch[3])
    : NaN;
  if (!Number.isFinite(duration) || Math.abs(duration - meta.duration) > 0.35) {
    failures.push(`${lecture}: encoded duration ${duration} disagrees with cues ${meta.duration}`);
  }

  const peaks = numberMatches(analysis, /Peak level dB:\s*([-\d.]+)/g);
  const rms = numberMatches(analysis, /RMS level dB:\s*([-\d.]+)/g);
  const longestSilence = Math.max(0, ...numberMatches(analysis, /silence_duration:\s*([\d.]+)/g));
  const peak = Math.max(-Infinity, ...peaks);
  const average = Math.max(-Infinity, ...rms);
  // Opus decoding can create a tiny floating-point/intersample overshoot even
  // when the source PCM never clipped. Treat only > +0.5 dB as implausible;
  // the released pack's maximum is +0.15 dB and contains no hard plateau.
  if (!Number.isFinite(peak) || peak < -35 || peak > 0.5) {
    failures.push(`${lecture}: implausible peak level ${peak} dB`);
  }
  if (!Number.isFinite(average) || average < -45 || average > -3) {
    failures.push(`${lecture}: implausible RMS level ${average} dB`);
  }
  if (longestSilence > 3) {
    failures.push(`${lecture}: contains ${longestSilence.toFixed(2)} seconds of continuous silence`);
  }
}

if (failures.length) {
  console.error(`voice audio failures (${failures.length})`);
  failures.slice(0, 100).forEach((failure) => console.error(`  - ${failure}`));
  process.exit(1);
}

console.log(
  `voice audio clean - ${Object.keys(manifest.lectures).length} Opus lectures, ` +
  `${cueCount} ordered cues, every file decodes with healthy levels and no long silence`,
);

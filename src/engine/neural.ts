import {
  isPackedBuffer as voicePackBuffer,
  isPackedVoice,
  packedAudioFor,
} from "./voicePack";

/**
 * Neural narration — Kokoro-82M, running entirely in the browser.
 *
 * The system voices are formant synthesisers from the 2000s, and no amount of
 * text massaging makes Microsoft David pleasant to listen to for an hour. This
 * is the alternative: an 82M-parameter model, fetched once (~88 MB), cached by
 * the browser, and run locally from then on. No API key, no per-use cost, no
 * network after the first load.
 *
 * It is strictly opt-in. Nothing here is imported until the listener asks for
 * it, which is why the import is dynamic — bundling 3 MB of ONNX runtime into
 * the initial load for a feature most sessions never touch would be a bad
 * trade.
 */

export type NeuralStatus = "idle" | "loading" | "ready" | "failed";

export interface LoadProgress {
  /** 0..1 across every file the model needs. */
  percent: number;
  loadedMB: number;
  totalMB: number;
  phase: "checking" | "downloading" | "initializing" | "ready" | "failed";
}

export interface VoiceOption {
  id: string;
  name: string;
  accent: "American" | "British";
  gender: "Female" | "Male";
  /** The model card's own grade. A- is the best on offer. */
  grade: string;
}

/**
 * The default. Kokoro's model card grades `af_heart` highest, and it is the
 * one voice with no audible artefacts on technical text — which is most of
 * what this app reads aloud.
 */
export const DEFAULT_VOICE = "af_heart";

let loading: Promise<unknown> | null = null;
let status: NeuralStatus = "idle";
let error: string | null = null;
let progress: LoadProgress = {
  percent: 0,
  loadedMB: 0,
  totalMB: 0,
  phase: "checking",
};

const listeners = new Set<() => void>();
const announce = () => listeners.forEach((fn) => fn());

export function subscribe(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export const getStatus = (): NeuralStatus => status;
export const getError = (): string | null => error;
export const getProgress = (): LoadProgress => progress;
export const isPackedBuffer = voicePackBuffer;
export const hasPackedVoice = isPackedVoice;

type WorkerRequest =
  | { type: "load" }
  | { type: "generate"; text: string; voice: string; speed: number };
type WorkerReply =
  | { type: "progress"; progress: LoadProgress }
  | { id: number; type: "ready" }
  | { id: number; type: "audio"; samples: ArrayBuffer; samplingRate: number }
  | { id: number; type: "error"; error: string };

let voiceWorker: Worker | null = null;
let requestId = 0;
const pending = new Map<
  number,
  { resolve: (value: WorkerReply) => void; reject: (reason: Error) => void }
>();

function worker(): Worker {
  if (voiceWorker) return voiceWorker;
  const instance = new Worker(new URL("./neural.worker.ts", import.meta.url), {
    type: "module",
    name: "unwashed-natural-voice",
  });
  instance.onmessage = (event: MessageEvent<WorkerReply>) => {
    const reply = event.data;
    if (reply.type === "progress") {
      progress = reply.progress;
      announce();
      return;
    }
    const request = pending.get(reply.id);
    if (!request) return;
    pending.delete(reply.id);
    if (reply.type === "error") request.reject(new Error(reply.error));
    else request.resolve(reply);
  };
  instance.onerror = (event) => {
    const failure = new Error(event.message || "Natural voice worker failed");
    for (const request of pending.values()) request.reject(failure);
    pending.clear();
    voiceWorker = null;
  };
  return (voiceWorker = instance);
}

function askWorker<T extends WorkerReply>(request: WorkerRequest): Promise<T> {
  const id = ++requestId;
  return new Promise<T>((resolve, reject) => {
    pending.set(id, {
      resolve: (reply) => resolve(reply as T),
      reject,
    });
    worker().postMessage({ id, ...request });
  });
}

/**
 * Measured on a 16-core machine with an RDNA-3 GPU, generating real lecture
 * sentences — the ratio is audio-seconds produced per second of compute:
 *
 *   q8   / webgpu   88 MB   0.12–0.63x   quantised ops fall back per-node
 *   fp32 / webgpu  310 MB   2.17–2.46x
 *   fp16 / webgpu  156 MB   2.57–2.91x, but produces NaNs on some AMD GPUs
 *
 * On the Radeon 860M, fp16 completes with all-NaN audio and fp32 sometimes
 * returns enormous finite values instead of a waveform. ONNX reports both as
 * successful inference. Until that WebGPU path is dependable, q8/WASM is the
 * compatibility default: smaller, slower, and consistently valid.
 */
export type Device = "webgpu" | "wasm";

/**
 * Sizes are what actually crosses the network: the weights, plus roughly 5 MB
 * of gzipped ONNX runtime that the progress callback never sees because it is
 * fetched separately. Quoting only the weights would understate it.
 */
const WEIGHTS: Record<Device, { dtype: "fp32" | "q8"; megabytes: number; bytes?: number }> = {
  webgpu: { dtype: "fp32", megabytes: 315 },
  // Exact ONNX byte length. The displayed 93 MB also includes the WASM runtime.
  wasm: { dtype: "q8", megabytes: 93, bytes: 92_361_116 },
};

let device: Device | null = null;

/**
 * Which device will be used, resolved once and cached.
 *
 * WebGPU remains in the type/weight table so it can be restored after the
 * upstream Radeon issue is fixed. Selecting it today produces silent or
 * corrupt audio on the hardware this app is running on.
 */
export async function detectDevice(): Promise<Device> {
  if (device) return device;
  return (device = "wasm");
}

export const getDevice = (): Device | null => device;
export const weightsFor = (d: Device) => WEIGHTS[d];

// Versioned because the earlier GPU weights could successfully load yet return
// silent or corrupt audio on this Radeon hardware. Do not treat those cached
// files as the working q8 compatibility model.
const INSTALLED_KEY = "unwashed.neural.installed.q8-wasm-v3";
const MODEL_ID = "onnx-community/Kokoro-82M-v1.0-ONNX";

const modelFileFor = (d: Device) =>
  d === "webgpu" ? "model.onnx" : "model_quantized.onnx";

const modelURLFor = (d: Device) =>
  `https://huggingface.co/${MODEL_ID}/resolve/main/onnx/${modelFileFor(d)}`;

const cacheForModels = () => caches.open("transformers-cache");

function rememberInstalled(): void {
  try {
    localStorage.setItem(INSTALLED_KEY, "1");
  } catch {
    // Private mode. Cache detection still works during this session.
  }
}

/**
 * The browser cache is the source of truth. A localStorage flag can be missed
 * when the user closes the page during ONNX session compilation, even though
 * the model file finished downloading successfully.
 */
export async function hasCachedWeights(d?: Device): Promise<boolean> {
  if (typeof caches === "undefined") return hasBeenInstalled();
  try {
    const on = d ?? (await detectDevice());
    const cache = await cacheForModels();
    const hit = await cache.match(modelURLFor(on));
    if (!hit) return false;

    // A response without Content-Length sends Transformers into a repeated
    // grow-and-copy loop while it reads the ONNX file. On an 88 MB model that
    // can freeze or kill the tab. Entries written by older versions are not
    // safe to reuse; delete this one model file and stream a clean copy.
    const expected = WEIGHTS[on].bytes;
    const declared = Number(hit.headers.get("Content-Length"));
    if (expected && declared !== expected) {
      await cache.delete(modelURLFor(on));
      try {
        localStorage.removeItem(INSTALLED_KEY);
      } catch {}
      return false;
    }
    rememberInstalled();
    return true;
  } catch {
    // A marker is not enough to prove that a readable model body exists.
    return false;
  }
}

/**
 * Whether the weights have been fetched before on this machine.
 *
 * The difference matters: re-initialising an already-downloaded model reads
 * from the browser's HTTP cache and is quick and free, so a lecture can start
 * it automatically. A first model download must stay behind an explicit click
 * — nobody should meet a large transfer after the fact.
 */
export function hasBeenInstalled(): boolean {
  try {
    return localStorage.getItem(INSTALLED_KEY) === "1";
  } catch {
    return false;
  }
}

/** Kicks off the one-time download. Safe to call repeatedly. */
export function load(): Promise<unknown> {
  if (loading) return loading;

  status = "loading";
  error = null;
  progress = {
    percent: 0,
    loadedMB: 0,
    totalMB: 0,
    phase: "checking",
  };
  announce();

  // Ask Chrome not to evict the model under storage pressure. Browsers that
  // do not support persistent storage simply ignore this.
  void navigator.storage?.persist?.().catch(() => false);

  loading = askWorker({ type: "load" }).then(() => {
    rememberInstalled();
    status = "ready";
    progress = {
      ...progress,
      percent: 1,
      loadedMB: WEIGHTS.wasm.megabytes,
      totalMB: WEIGHTS.wasm.megabytes,
      phase: "ready",
    };
    announce();
  }).catch((err: unknown) => {
    status = "failed";
    error = err instanceof Error ? err.message : String(err);
    progress = { ...progress, phase: "failed" };
    // Cleared so a later attempt can retry rather than resolving the old
    // rejection forever — a flaky first download shouldn't be permanent.
    loading = null;
    announce();
    throw err;
  });

  return loading;
}

// ------------------------------------------------------------------ cache

/**
 * The output is played through Web Audio rather than an `<audio>` element.
 *
 * The obvious route — `RawAudio.toBlob()`, an object URL, `new Audio(url)` —
 * measured 1.76 seconds to start playing audio that was **already cached**,
 * because the element re-fetches and re-decodes the WAV every time. Kokoro
 * hands back raw samples, so encoding them to WAV only to decode them again is
 * pure loss. Decoding once at generation time makes playback a synchronous
 * `start()`.
 */
let ctx: AudioContext | null = null;

export function audioContext(): AudioContext {
  ctx ??= new AudioContext();
  return ctx;
}

/**
 * Decoded audio, kept so replaying a scene — or stepping back one — is instant
 * rather than a second synthesis. Bounded by bytes rather than count: at
 * 24 kHz mono float, a scene runs roughly 100 KB per second of speech.
 */
const CACHE_BUDGET = 24 * 1048576;
const cache = new Map<string, AudioBuffer>();
let cached = 0;

const sizeOf = (buffer: AudioBuffer) => buffer.length * 4;

const keyFor = (text: string, voice: string, speed: number) =>
  `${voice}|${speed}|${text}`;

function remember(key: string, buffer: AudioBuffer): void {
  cache.set(key, buffer);
  cached += sizeOf(buffer);
  // Map iterates in insertion order, so the first key is the oldest.
  while (cached > CACHE_BUDGET && cache.size > 1) {
    const oldest = cache.keys().next().value as string;
    const evicted = cache.get(oldest);
    if (evicted) cached -= sizeOf(evicted);
    cache.delete(oldest);
  }
}

/** One generation at a time — the model is not reentrant. */
interface SynthesisJob {
  key: string;
  text: string;
  voice: string;
  speed: number;
  priority: number;
  order: number;
  promise: Promise<AudioBuffer>;
  resolve: (buffer: AudioBuffer) => void;
  reject: (reason: unknown) => void;
}

const jobs = new Map<string, SynthesisJob>();
let jobOrder = 0;
let synthesizing = false;

/**
 * Audio for one passage. Cached, so the prefetch of a scene and the playback
 * of it are the same single synthesis.
 */
/**
 * Prefetching is the whole reason playback feels instant, and a silent cache
 * miss looks exactly like "the model is a bit slow". Counted so it can be
 * asserted on rather than assumed.
 */
export const stats = { hits: 0, misses: 0, lastMissKey: "" };

function schedule(
  text: string,
  voice: string,
  speed: number,
  priority: number,
): Promise<AudioBuffer> {
  const key = keyFor(text, voice, speed);
  const hit = cache.get(key);
  if (hit) {
    stats.hits += 1;
    return Promise.resolve(hit);
  }
  const active = jobs.get(key);
  if (active) {
    active.priority = Math.min(active.priority, priority);
    stats.hits += 1;
    return active.promise;
  }
  stats.misses += 1;
  stats.lastMissKey = key;

  let resolve!: (buffer: AudioBuffer) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<AudioBuffer>((yes, no) => {
    resolve = yes;
    reject = no;
  });
  jobs.set(key, {
    key,
    text,
    voice,
    speed,
    priority,
    order: jobOrder++,
    promise,
    resolve,
    reject,
  });
  void pumpJobs();
  return promise;
}

async function pumpJobs(): Promise<void> {
  if (synthesizing) return;
  synthesizing = true;
  try {
    while (jobs.size) {
      const job = [...jobs.values()].sort(
        (a, b) => a.priority - b.priority || a.order - b.order,
      )[0];
      try {
        const existing = cache.get(job.key);
        if (existing) {
          job.resolve(existing);
          continue;
        }
        const packed = await packedAudioFor(
          job.text,
          job.voice,
          audioContext(),
        );
        if (packed) {
          remember(job.key, packed);
          announce();
          job.resolve(packed);
          continue;
        }
        await load();
        const raw = await askWorker<{
          id: number;
          type: "audio";
          samples: ArrayBuffer;
          samplingRate: number;
        }>({
          type: "generate",
          text: job.text,
          voice: job.voice,
          speed: job.speed,
        });
        const samples = new Float32Array(raw.samples);
        const audio = audioContext();
        const buffer = audio.createBuffer(1, samples.length, raw.samplingRate);
        buffer.copyToChannel(samples, 0);
        remember(job.key, buffer);
        announce();
        job.resolve(buffer);
      } catch (cause) {
        job.reject(cause);
      } finally {
        jobs.delete(job.key);
      }
    }
  } finally {
    synthesizing = false;
  }
}

export function generate(
  text: string,
  voice: string = DEFAULT_VOICE,
  speed = 1,
): Promise<AudioBuffer> {
  return schedule(text, voice, speed, 0);
}

/** Warm the cache for a passage that is about to be needed. Never throws. */
export function prefetch(
  text: string,
  voice: string = DEFAULT_VOICE,
  speed = 1,
  priority = 1,
): void {
  if ((!isPackedVoice(voice) && status !== "ready") || !text.trim()) return;
  void schedule(text, voice, speed, Math.max(0, priority)).catch(() => undefined);
}

export function isCached(text: string, voice = DEFAULT_VOICE, speed = 1): boolean {
  return cache.has(keyFor(text, voice, speed));
}

// ------------------------------------------------------------------ voices

/**
 * The subset worth offering. Kokoro ships more, but the lower-graded ones have
 * audible artefacts on long passages and a list of thirty is a worse choice
 * than a list of ten.
 */
export const VOICES: VoiceOption[] = [
  { id: "af_heart", name: "Heart", accent: "American", gender: "Female", grade: "A" },
  { id: "af_bella", name: "Bella", accent: "American", gender: "Female", grade: "A-" },
  { id: "af_nicole", name: "Nicole", accent: "American", gender: "Female", grade: "B-" },
  { id: "af_aoede", name: "Aoede", accent: "American", gender: "Female", grade: "C+" },
  { id: "af_kore", name: "Kore", accent: "American", gender: "Female", grade: "C+" },
  { id: "af_sarah", name: "Sarah", accent: "American", gender: "Female", grade: "C+" },
  { id: "am_michael", name: "Michael", accent: "American", gender: "Male", grade: "C+" },
  { id: "am_fenrir", name: "Fenrir", accent: "American", gender: "Male", grade: "C+" },
  { id: "am_puck", name: "Puck", accent: "American", gender: "Male", grade: "C+" },
  { id: "am_echo", name: "Echo", accent: "American", gender: "Male", grade: "D" },
  { id: "bf_emma", name: "Emma", accent: "British", gender: "Female", grade: "B-" },
  { id: "bf_isabella", name: "Isabella", accent: "British", gender: "Female", grade: "C" },
  { id: "bm_george", name: "George", accent: "British", gender: "Male", grade: "C" },
  { id: "bm_fable", name: "Fable", accent: "British", gender: "Male", grade: "C" },
  { id: "bm_daniel", name: "Daniel", accent: "British", gender: "Male", grade: "D" },
];

export const VOICE_BY_ID = new Map(VOICES.map((v) => [v.id, v]));

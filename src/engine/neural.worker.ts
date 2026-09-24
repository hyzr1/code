/// <reference lib="webworker" />

import { KokoroTTS, type GenerateOptions } from "kokoro-js";

const MODEL_ID = "onnx-community/Kokoro-82M-v1.0-ONNX";
const MODEL_FILE = "model_quantized.onnx";
const MODEL_BYTES = 92_361_116;
const MODEL_MB = 93;
const MODEL_URL = `https://huggingface.co/${MODEL_ID}/resolve/main/onnx/${MODEL_FILE}`;

type Phase = "checking" | "downloading" | "initializing" | "ready" | "failed";
interface Progress {
  percent: number;
  loadedMB: number;
  totalMB: number;
  phase: Phase;
}
type Request =
  | { id: number; type: "load" }
  | { id: number; type: "generate"; text: string; voice: string; speed: number };

const sendProgress = (progress: Progress) =>
  postMessage({ type: "progress", progress });

async function weightsAreSafe(): Promise<boolean> {
  const cache = await caches.open("transformers-cache");
  const hit = await cache.match(MODEL_URL);
  if (!hit) return false;
  if (Number(hit.headers.get("Content-Length")) === MODEL_BYTES) return true;
  await cache.delete(MODEL_URL);
  return false;
}

async function cacheLocalWeights(): Promise<void> {
  const cache = await caches.open("transformers-cache");
  if (await weightsAreSafe()) return;

  const response = await fetch("/models/model_quantized.onnx", { cache: "no-store" });
  if (!response.ok || !response.body) {
    throw new Error(`Local voice model unavailable (${response.status})`);
  }

  let loaded = 0;
  let lastPercent = -1;
  const tracking = new TransformStream<Uint8Array, Uint8Array>({
    transform(chunk, controller) {
      loaded += chunk.byteLength;
      const percent = Math.min(Math.floor((loaded / MODEL_BYTES) * 100), 99);
      if (percent !== lastPercent) {
        lastPercent = percent;
        sendProgress({
          percent: percent / 100,
          loadedMB: loaded / 1048576,
          totalMB: MODEL_BYTES / 1048576,
          phase: "downloading",
        });
      }
      controller.enqueue(chunk);
    },
  });

  const headers = new Headers(response.headers);
  headers.set("Content-Length", String(MODEL_BYTES));
  headers.delete("Content-Encoding");
  await cache.put(
    MODEL_URL,
    new Response(response.body.pipeThrough(tracking), { status: 200, headers }),
  );
  if (loaded !== MODEL_BYTES) {
    await cache.delete(MODEL_URL);
    throw new Error(`Local voice model is incomplete (${loaded} of ${MODEL_BYTES} bytes)`);
  }
}

let modelPromise: Promise<KokoroTTS> | null = null;

function model(): Promise<KokoroTTS> {
  if (modelPromise) return modelPromise;
  modelPromise = (async () => {
    sendProgress({ percent: 0, loadedMB: 0, totalMB: MODEL_MB, phase: "checking" });
    const cached = await weightsAreSafe();
    if (!cached) {
      sendProgress({ percent: 0, loadedMB: 0, totalMB: MODEL_MB, phase: "downloading" });
      await cacheLocalWeights();
    }
    sendProgress({ percent: 1, loadedMB: MODEL_MB, totalMB: MODEL_MB, phase: "initializing" });
    const loaded = await KokoroTTS.from_pretrained(MODEL_ID, {
      dtype: "q8",
      device: "wasm",
      // Cache reads replay byte progress. The body is already complete, so the
      // UI remains in the honest local-initialization phase.
      progress_callback: () => undefined,
    });
    sendProgress({ percent: 1, loadedMB: MODEL_MB, totalMB: MODEL_MB, phase: "ready" });
    return loaded;
  })().catch((cause: unknown) => {
    modelPromise = null;
    throw cause;
  });
  return modelPromise;
}

async function handle(request: Request): Promise<void> {
  try {
    const tts = await model();
    if (request.type === "load") {
      postMessage({ id: request.id, type: "ready" });
      return;
    }

    const raw = await tts.generate(request.text, {
      voice: request.voice as NonNullable<GenerateOptions["voice"]>,
      speed: request.speed,
    });
    const samples = new Float32Array(raw.audio);
    let peak = 0;
    for (const sample of samples) {
      if (!Number.isFinite(sample)) throw new Error("Kokoro generated invalid audio samples");
      peak = Math.max(peak, Math.abs(sample));
    }
    if (!samples.length || peak < 1e-6) throw new Error("Kokoro generated silent audio");
    if (peak > 8) throw new Error("Kokoro generated corrupt audio");

    postMessage(
      {
        id: request.id,
        type: "audio",
        samples: samples.buffer,
        samplingRate: raw.sampling_rate,
      },
      { transfer: [samples.buffer] },
    );
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : String(cause);
    postMessage({ id: request.id, type: "error", error: message });
  }
}

self.onmessage = (event: MessageEvent<Request>) => void handle(event.data);

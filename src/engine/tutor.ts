/**
 * The in-lesson AI tutor — a small language model that runs entirely in the
 * browser via WebLLM (WebGPU). No API key, no server, no per-question cost:
 * the model downloads once (a few hundred MB to ~1 GB depending on the device),
 * the browser caches it, and every answer after that is generated locally.
 *
 * Same philosophy as the Kokoro voice in `./neural`: strictly opt-in and behind
 * a dynamic import, so nothing here — nor the multi-megabyte runtime — loads
 * until the learner actually asks their first question.
 */
import type {
  ChatCompletionMessageParam,
  InitProgressReport,
  MLCEngineInterface,
} from "@mlc-ai/web-llm";

export type TutorStatus = "idle" | "loading" | "ready" | "failed" | "unsupported";

export interface TutorProgress {
  /** 0..1 across the download and compile. */
  percent: number;
  text: string;
}

let engine: MLCEngineInterface | null = null;
let loadPromise: Promise<MLCEngineInterface> | null = null;
let status: TutorStatus = "idle";
let progress: TutorProgress = { percent: 0, text: "" };
let error: string | null = null;
let model: string | null = null;

const listeners = new Set<() => void>();
const announce = () => listeners.forEach((fn) => fn());

export function subscribe(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export const getStatus = (): TutorStatus => status;
export const getProgress = (): TutorProgress => progress;
export const getError = (): string | null => error;
export const getModel = (): string | null => model;

export type TutorTier = "auto" | "fast" | "smart";

/**
 * The requested model size. Set from settings before the first load. Once the
 * engine has loaded a model, changing this has no effect until a reload — the
 * UI surfaces that ("takes effect next time").
 */
let tier: TutorTier = "auto";
export function setTier(next: TutorTier): void {
  if (next === tier) return;
  tier = next;
  announce();
}
export const getTier = (): TutorTier => tier;
/** Whether switching to `next` would require reloading a different model. */
export function tierNeedsReload(next: TutorTier): boolean {
  return Boolean(engine) && next !== tier;
}

/**
 * On-device generation needs WebGPU. There is no WASM fallback for a language
 * model this size, so where WebGPU is missing the feature declines cleanly
 * rather than pretending to work.
 */
export function isSupported(): boolean {
  return typeof navigator !== "undefined" && "gpu" in navigator;
}

interface GPUish {
  requestAdapter(): Promise<{ features?: { has?: (name: string) => boolean } } | null>;
}

/**
 * A model sized to the machine.
 *
 * A roomy desktop with the WebGPU `shader-f16` feature gets a sharper 3B; a
 * phone or a low-memory laptop gets a 1.5B that actually fits in GPU memory.
 * GPUs without f16 fall back to the (larger, slower) f32 build of the same
 * model. One constant to change when we want to trade size for quality later.
 */
async function pickModel(): Promise<string> {
  let f16 = false;
  try {
    const gpu = (navigator as unknown as { gpu?: GPUish }).gpu;
    const adapter = gpu ? await gpu.requestAdapter() : null;
    f16 = Boolean(adapter?.features?.has?.("shader-f16"));
  } catch {
    // Adapter probe failed; assume no f16 and take the safe f32 path.
  }
  // Qwen2.5-Coder is fine-tuned on programming, so it is markedly more accurate
  // on code questions than a generic model of the same size — the right family
  // for a coding tutor. Sizes trade quality against download and GPU memory.
  const q = f16 ? "q4f16_1" : "q4f32_1";
  const coder = (size: string) => `Qwen2.5-Coder-${size}-Instruct-${q}-MLC`;

  const ua = navigator.userAgent;
  const mobile = /Mobi|Android|iPhone|iPad|iPod/i.test(ua);

  // Phones (iOS Safari especially) enforce a hard ~1–1.5 GB per-tab memory
  // budget; anything past the 0.5B OOM-crashes the tab. So mobile is capped at
  // the 0.5B for every tier — the good tutor is a desktop experience.
  if (mobile) return coder("0.5B");

  // Desktop: a strong 7B when asked (needs a real GPU), a solid 3B by default,
  // a lighter 1.5B for speed.
  if (tier === "smart") return coder("7B");
  if (tier === "fast") return coder("1.5B");
  return coder("3B");
}

/**
 * Load the model, once. Safe to call repeatedly — concurrent callers share the
 * same in-flight promise, and a completed load returns instantly.
 */
export function ensureLoaded(): Promise<MLCEngineInterface> {
  if (engine) return Promise.resolve(engine);
  if (loadPromise) return loadPromise;
  if (!isSupported()) {
    status = "unsupported";
    announce();
    return Promise.reject(new Error("WebGPU is not available in this browser"));
  }

  status = "loading";
  error = null;
  progress = { percent: 0, text: "Preparing…" };
  announce();

  // Ask the browser not to evict the cached weights under storage pressure.
  void navigator.storage?.persist?.().catch(() => false);

  loadPromise = (async () => {
    const webllm = await import("@mlc-ai/web-llm");
    model = await pickModel();
    const worker = new Worker(new URL("./tutor.worker.ts", import.meta.url), {
      type: "module",
      name: "hyzr-tutor",
    });
    const created = await webllm.CreateWebWorkerMLCEngine(worker, model, {
      initProgressCallback: (report: InitProgressReport) => {
        progress = { percent: report.progress ?? 0, text: report.text ?? "" };
        announce();
      },
    });
    engine = created;
    status = "ready";
    progress = { percent: 1, text: "Ready" };
    announce();
    return created;
  })().catch((cause: unknown) => {
    status = "failed";
    error = cause instanceof Error ? cause.message : String(cause);
    // Cleared so a later attempt retries rather than resolving the old
    // rejection forever — a flaky first download should not be permanent.
    loadPromise = null;
    announce();
    throw cause;
  });

  return loadPromise;
}

export interface AskHandlers {
  /** Called with the full answer so far every time new text arrives. */
  onToken: (full: string) => void;
  signal?: AbortSignal;
}

/**
 * Stream an answer for a grounded conversation. Returns the complete text.
 * Aborting the signal stops generation and returns what was produced so far.
 */
export async function ask(
  messages: ChatCompletionMessageParam[],
  { onToken, signal }: AskHandlers,
): Promise<string> {
  const active = await ensureLoaded();
  const stream = await active.chat.completions.create({
    messages,
    stream: true,
    temperature: 0.3,
    max_tokens: 480,
  });

  let full = "";
  for await (const chunk of stream) {
    if (signal?.aborted) {
      try {
        await active.interruptGenerate();
      } catch {
        // Already stopped; nothing to interrupt.
      }
      break;
    }
    const delta = chunk.choices[0]?.delta?.content ?? "";
    if (delta) {
      full += delta;
      onToken(full);
    }
  }
  return full;
}

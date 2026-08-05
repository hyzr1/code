import { WebWorkerMLCEngineHandler } from "@mlc-ai/web-llm";

/**
 * The tutor's language model runs here, in a worker, so generating an answer
 * never blocks the main thread — the lecture keeps rendering, the code panel
 * stays interactive, and typing the next question does not stutter.
 *
 * WebLLM ships both halves of this: the handler below owns the WebGPU engine
 * and answers messages posted by `CreateWebWorkerMLCEngine` on the page side.
 * Mirrors the pattern already used for the Kokoro voice in `neural.worker.ts`.
 */
const handler = new WebWorkerMLCEngineHandler();

self.onmessage = (event: MessageEvent) => {
  handler.onmessage(event);
};

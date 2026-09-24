/**
 * Cloud tutor endpoint — a thin proxy to Groq's (OpenAI-compatible) chat API.
 *
 * Why this exists: the on-device model is free and private but only strong
 * enough on a desktop with a real GPU, and it can't run on a phone at all.
 * This lets the tutor call a hosted model instead, so a phone (or a laptop that
 * doesn't want a multi-GB download) gets good answers instantly.
 *
 * The API key never reaches the browser — it lives in a Vercel env var and is
 * used only here. Set in the Vercel project:
 *   GROQ_API_KEY   — your key from console.groq.com
 *   TUTOR_MODEL    — optional; a current Groq model id (default below). Groq
 *                    rotates its catalog, so if this 404s, set it to whatever
 *                    Groq currently lists (e.g. a Qwen coder or Llama model).
 */
export const config = { runtime: "edge" };

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
// Verified on the account's catalog: gpt-oss-120b answers Python questions
// correctly and concisely with no reasoning-trace leakage. Groq rotates models,
// so override with TUTOR_MODEL if this ever 404s (e.g. llama-3.3-70b-versatile,
// openai/gpt-oss-20b, or llama-3.1-8b-instant for higher free-tier limits).
const DEFAULT_MODEL = "openai/gpt-oss-120b";

// Best-effort per-IP rate limit. In-memory per edge instance — not a hard
// guarantee, just enough to stop one client hammering the key. Groq's own tier
// limits are the real backstop.
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 20;
const hits = new Map<string, { count: number; start: number }>();

function limited(ip: string): boolean {
  const now = Date.now();
  const rec = hits.get(ip);
  if (!rec || now - rec.start >= WINDOW_MS) {
    hits.set(ip, { count: 1, start: now });
    return false;
  }
  rec.count += 1;
  return rec.count > MAX_PER_WINDOW;
}

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const key = process.env.GROQ_API_KEY;
  if (!key) return json({ error: "The cloud tutor isn't set up yet." }, 503);

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (limited(ip)) return json({ error: "Too many questions — give it a minute." }, 429);

  let messages: unknown;
  try {
    messages = (await req.json())?.messages;
  } catch {
    return json({ error: "Bad request" }, 400);
  }
  if (!Array.isArray(messages) || messages.length === 0) {
    return json({ error: "Bad request" }, 400);
  }

  let upstream: Response;
  try {
    upstream = await fetch(GROQ_URL, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: process.env.TUTOR_MODEL || DEFAULT_MODEL,
        messages,
        stream: true,
        temperature: 0.3,
        max_tokens: 600,
      }),
    });
  } catch {
    return json({ error: "Couldn't reach the tutor service." }, 502);
  }

  if (!upstream.ok || !upstream.body) {
    const detail = await upstream.text().catch(() => "");
    return json({ error: "The tutor is unavailable right now.", detail: detail.slice(0, 300) }, 502);
  }

  // Transform Groq's Server-Sent-Events into a plain text delta stream so the
  // browser just reads text — no SSE parsing on the client.
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const reader = upstream.body!.getReader();
      let buffer = "";
      try {
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";
          for (const raw of lines) {
            const line = raw.trim();
            if (!line.startsWith("data:")) continue;
            const data = line.slice(5).trim();
            if (data === "[DONE]") {
              controller.close();
              return;
            }
            try {
              const parsed = JSON.parse(data);
              const delta = parsed?.choices?.[0]?.delta?.content;
              if (delta) controller.enqueue(encoder.encode(delta));
            } catch {
              // A partial or non-JSON keep-alive line; skip it.
            }
          }
        }
      } catch {
        // Upstream dropped; end the stream with whatever we sent.
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "no-cache, no-transform",
    },
  });
}

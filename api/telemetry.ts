import { put } from "@vercel/blob";
import { randomUUID } from "node:crypto";

export const runtime = "nodejs";
export const maxDuration = 10;

const hits = new Map<string, { start: number; count: number }>();
function limited(ip: string) {
  const now = Date.now();
  const current = hits.get(ip);
  if (!current || now - current.start > 60_000) {
    hits.set(ip, { start: now, count: 1 });
    return false;
  }
  current.count += 1;
  return current.count > 90;
}

export async function POST(request: Request): Promise<Response> {
  if (request.method !== "POST") return new Response(null, { status: 405 });
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (limited(ip)) return new Response(null, { status: 429 });
  const length = Number(request.headers.get("content-length") ?? 0);
  if (length > 32_000) return new Response(null, { status: 413 });
  try {
    const event = await request.json();
    if (!["error", "page", "vital"].includes(event?.kind)) return new Response(null, { status: 400 });
    const safe = {
      kind: event.kind,
      name: String(event.name ?? "").slice(0, 80),
      value: Number.isFinite(event.value) ? event.value : undefined,
      path: String(event.path ?? "/").slice(0, 300),
      message: String(event.message ?? "").slice(0, 1000),
      stack: String(event.stack ?? "").slice(0, 4000),
      session: String(event.session ?? "").slice(0, 80),
      viewport: String(event.viewport ?? "").slice(0, 40),
      release: String(event.release ?? "").slice(0, 64),
      at: Date.now(),
    };
    const day = new Date().toISOString().slice(0, 10);
    await put(`telemetry/v1/${day}/${randomUUID()}.json`, JSON.stringify(safe), {
      access: "private",
      contentType: "application/json",
      addRandomSuffix: false,
      cacheControlMaxAge: 60,
    });
    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("Telemetry write failed", error);
    return new Response(null, { status: 400 });
  }
}

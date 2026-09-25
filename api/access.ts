import { get, put } from "@vercel/blob";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";

export const runtime = "nodejs";
export const maxDuration = 10;

const COOKIE = "hyzr_beta_access";
const MAX_BODY = 2_000;
const attempts = new Map<string, { start: number; count: number }>();

interface InviteRecord {
  version: 1;
  createdAt: number;
  label?: string;
  redeemedAt?: number;
}

const json = (body: unknown, status = 200, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "private, no-store", ...headers },
  });

const normalize = (value: unknown) => String(value ?? "").trim().toUpperCase().replace(/\s+/g, "");
const codeId = (code: string) => createHash("sha256").update(`hyzr-beta:${code}`).digest("hex");
const pathname = (id: string) => `beta-access/v1/codes/${id}.json`;

function secret(): string {
  const value = process.env.ACCESS_SESSION_SECRET || process.env.SYNC_SESSION_SECRET || process.env.BLOB_READ_WRITE_TOKEN;
  if (!value) throw new Error("Beta access is not configured");
  return value;
}

function accessToken(id: string): string {
  const payload = Buffer.from(JSON.stringify({ id, exp: Date.now() + 100 * 365 * 86_400_000 })).toString("base64url");
  const signature = createHmac("sha256", secret()).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

function hasAccess(request: Request): boolean {
  const cookie = request.headers.get("cookie") ?? "";
  const token = cookie.split(";").map(part => part.trim()).find(part => part.startsWith(`${COOKIE}=`))?.slice(COOKIE.length + 1);
  if (!token) return false;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;
  const expected = createHmac("sha256", secret()).update(payload).digest();
  const received = Buffer.from(signature, "base64url");
  if (received.length !== expected.length || !timingSafeEqual(received, expected)) return false;
  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    return typeof parsed.id === "string" && parsed.exp > Date.now();
  } catch { return false; }
}

function limited(request: Request): boolean {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const now = Date.now();
  const entry = attempts.get(ip);
  if (!entry || now - entry.start > 15 * 60_000) {
    attempts.set(ip, { start: now, count: 1 });
    return false;
  }
  entry.count += 1;
  return entry.count > 20;
}

function sameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try { return new URL(origin).host === new URL(request.url).host; } catch { return false; }
}

export async function GET(request: Request): Promise<Response> {
  try { return json({ access: hasAccess(request) }); }
  catch { return json({ access: false }, 503); }
}

export async function POST(request: Request): Promise<Response> {
  if (!sameOrigin(request)) return json({ error: "Origin rejected" }, 403);
  if (limited(request)) return json({ error: "Too many attempts. Try again later." }, 429);
  if (Number(request.headers.get("content-length") ?? 0) > MAX_BODY) return json({ error: "Request is too large" }, 413);
  try {
    const body = await request.json() as { code?: unknown };
    const code = normalize(body.code);
    if (!/^HYZR-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(code)) return json({ error: "That access code is not valid" }, 401);
    const id = codeId(code);
    const result = await get(pathname(id), { access: "private", useCache: false });
    if (!result || result.statusCode !== 200 || !result.stream) return json({ error: "That access code is not valid" }, 401);
    const invite = await new Response(result.stream).json() as InviteRecord;
    if (invite.redeemedAt) return json({ error: "That access code has already been used" }, 409);
    invite.redeemedAt = Date.now();
    await put(pathname(id), JSON.stringify(invite), {
      access: "private", allowOverwrite: true, contentType: "application/json", cacheControlMaxAge: 60,
    });
    return json({ access: true }, 200, {
      "set-cookie": `${COOKIE}=${accessToken(id)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${100 * 365 * 86_400}`,
    });
  } catch (error) {
    console.error("Beta access redemption failed", error);
    return json({ error: "Access verification is temporarily unavailable" }, 503);
  }
}

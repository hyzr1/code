import { get, put } from "@vercel/blob";
import { createHash, createHmac, randomBytes, timingSafeEqual, pbkdf2Sync } from "node:crypto";

export const runtime = "nodejs";
export const maxDuration = 15;

const COOKIE = "hyzr_session";
const ITERATIONS = 210_000;
const MAX_BODY = 2_000_000;
const authHits = new Map<string, { start: number; count: number }>();

interface Snapshot {
  progress: unknown;
  settings: unknown;
  updatedAt: number;
}

interface AccountRecord {
  version: 1;
  id: string;
  email: string;
  passwordSalt: string;
  passwordHash: string;
  createdAt: number;
  snapshot: Snapshot | null;
}

const json = (body: unknown, status = 200, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "private, no-store",
      ...headers,
    },
  });

const normalizeEmail = (value: unknown) => String(value ?? "").trim().toLowerCase();
const accountId = (email: string) => createHash("sha256").update(email).digest("hex");
const pathname = (id: string) => `accounts/v1/${id}.json`;
const passwordHash = (password: string, salt: string) =>
  pbkdf2Sync(password, Buffer.from(salt, "base64url"), ITERATIONS, 32, "sha256").toString("base64url");

function secret(): string {
  const value = process.env.SYNC_SESSION_SECRET || process.env.BLOB_READ_WRITE_TOKEN;
  if (!value) throw new Error("Cloud sync storage is not configured");
  return value;
}

function tokenFor(id: string): string {
  const payload = Buffer.from(JSON.stringify({ id, exp: Date.now() + 30 * 86_400_000 })).toString("base64url");
  const signature = createHmac("sha256", secret()).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

function sessionId(request: Request): string | null {
  const cookie = request.headers.get("cookie") ?? "";
  const token = cookie.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${COOKIE}=`))?.slice(COOKIE.length + 1);
  if (!token) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;
  const expected = createHmac("sha256", secret()).update(payload).digest();
  const received = Buffer.from(signature, "base64url");
  if (received.length !== expected.length || !timingSafeEqual(received, expected)) return null;
  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    return typeof parsed.id === "string" && parsed.exp > Date.now() ? parsed.id : null;
  } catch { return null; }
}

const sessionCookie = (token: string) =>
  `${COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${30 * 86_400}`;
const clearCookie = `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;

async function readAccount(id: string): Promise<AccountRecord | null> {
  const result = await get(pathname(id), { access: "private", useCache: false });
  if (!result || result.statusCode !== 200 || !result.stream) return null;
  return await new Response(result.stream).json() as AccountRecord;
}

async function writeAccount(record: AccountRecord, overwrite: boolean) {
  await put(pathname(record.id), JSON.stringify(record), {
    access: "private",
    allowOverwrite: overwrite,
    contentType: "application/json",
    cacheControlMaxAge: 60,
  });
}

function sameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try { return new URL(origin).host === new URL(request.url).host; } catch { return false; }
}

function authLimited(request: Request): boolean {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const now = Date.now();
  const entry = authHits.get(ip);
  if (!entry || now - entry.start > 15 * 60_000) {
    authHits.set(ip, { start: now, count: 1 });
    return false;
  }
  entry.count += 1;
  return entry.count > 12;
}

async function bodyOf(request: Request): Promise<Record<string, unknown>> {
  const length = Number(request.headers.get("content-length") ?? 0);
  if (length > MAX_BODY) throw new Error("Request is too large");
  return await request.json() as Record<string, unknown>;
}

export async function POST(request: Request): Promise<Response> {
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);
  if (!sameOrigin(request)) return json({ error: "Origin rejected" }, 403);
  if (!process.env.BLOB_READ_WRITE_TOKEN && !process.env.VERCEL) {
    return json({ error: "Cloud sync is not configured" }, 503);
  }

  let body: Record<string, unknown>;
  try { body = await bodyOf(request); } catch (error) {
    return json({ error: error instanceof Error ? error.message : "Bad request" }, 400);
  }
  const action = String(body.action ?? "status");

  try {
    if (action === "signup" || action === "login") {
      if (authLimited(request)) return json({ error: "Too many sign-in attempts. Try again later." }, 429);
      const email = normalizeEmail(body.email);
      const password = String(body.password ?? "");
      if (!/^\S+@\S+\.\S+$/.test(email)) return json({ error: "Enter a valid email address" }, 400);
      if (password.length < 10 || password.length > 200) return json({ error: "Use at least 10 characters" }, 400);
      const id = accountId(email);
      let account = await readAccount(id);
      if (action === "signup") {
        if (account) return json({ error: "An account already exists for this email" }, 409);
        const salt = randomBytes(18).toString("base64url");
        account = {
          version: 1,
          id,
          email,
          passwordSalt: salt,
          passwordHash: passwordHash(password, salt),
          createdAt: Date.now(),
          snapshot: null,
        };
        await writeAccount(account, false);
      } else {
        if (!account) return json({ error: "Email or password is incorrect" }, 401);
        const actual = Buffer.from(passwordHash(password, account.passwordSalt), "base64url");
        const expected = Buffer.from(account.passwordHash, "base64url");
        if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) {
          return json({ error: "Email or password is incorrect" }, 401);
        }
      }
      return json(
        { user: { email: account.email }, snapshot: account.snapshot },
        200,
        { "set-cookie": sessionCookie(tokenFor(account.id)) },
      );
    }

    if (action === "logout") return json({ ok: true }, 200, { "set-cookie": clearCookie });
    const id = sessionId(request);
    if (!id) return json({ user: null }, 401);
    const account = await readAccount(id);
    if (!account) return json({ user: null }, 401, { "set-cookie": clearCookie });

    if (action === "status" || action === "pull") {
      return json({ user: { email: account.email }, snapshot: action === "pull" ? account.snapshot : undefined });
    }
    if (action === "sync") {
      if (!body.progress || typeof body.progress !== "object" || !body.settings || typeof body.settings !== "object") {
        return json({ error: "Sync data is invalid" }, 400);
      }
      const serialized = JSON.stringify({ progress: body.progress, settings: body.settings });
      if (serialized.length > MAX_BODY) return json({ error: "Sync data is too large" }, 413);
      account.snapshot = { progress: body.progress, settings: body.settings, updatedAt: Date.now() };
      await writeAccount(account, true);
      return json({ ok: true, updatedAt: account.snapshot.updatedAt });
    }
    return json({ error: "Unknown action" }, 400);
  } catch (error) {
    console.error("Account API failed", error);
    return json({ error: "Cloud sync is temporarily unavailable" }, 503);
  }
}

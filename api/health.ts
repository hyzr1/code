export const runtime = "nodejs";
export const maxDuration = 5;

export function GET(request: Request): Response {
  if (request.method !== "GET" && request.method !== "HEAD") {
    return new Response(null, { status: 405, headers: { allow: "GET, HEAD" } });
  }
  const body = JSON.stringify({
    ok: true,
    service: "hyzr-code",
    revision: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 12) || "local",
    cloudSync: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
    checkedAt: new Date().toISOString(),
  });
  return new Response(request.method === "HEAD" ? null : body, {
    status: 200,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

export function HEAD(request: Request): Response {
  return GET(new Request(request.url, { method: "HEAD", headers: request.headers }));
}

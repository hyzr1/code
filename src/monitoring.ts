type EventKind = "error" | "page" | "vital";

const SAMPLE_RATE = 0.15;
let session = "";
let sampled = false;

function allowed() {
  return navigator.doNotTrack !== "1" && location.hostname !== "localhost" && location.hostname !== "127.0.0.1";
}

function identify() {
  try {
    session = sessionStorage.getItem("hyzr.monitor.session") || crypto.randomUUID();
    sessionStorage.setItem("hyzr.monitor.session", session);
  } catch { session = crypto.randomUUID(); }
  sampled = Math.random() < SAMPLE_RATE;
}

function send(kind: EventKind, detail: Record<string, unknown>, force = false) {
  if (!allowed() || (!force && !sampled)) return;
  const body = JSON.stringify({
    kind,
    ...detail,
    session,
    path: location.pathname,
    viewport: `${innerWidth}x${innerHeight}`,
    release: document.querySelector('meta[name="hyzr-release"]')?.getAttribute("content") ?? "web",
  });
  if (navigator.sendBeacon) navigator.sendBeacon("/api/telemetry", new Blob([body], { type: "application/json" }));
  else void fetch("/api/telemetry", { method: "POST", headers: { "content-type": "application/json" }, body, keepalive: true });
}

export function captureException(error: unknown, source = "ui") {
  const value = error instanceof Error ? error : new Error(String(error));
  send("error", { name: source, message: value.message, stack: value.stack }, true);
}

export function trackPageView(name: string) {
  send("page", { name });
}

export function initMonitoring() {
  identify();
  addEventListener("error", event => captureException(event.error ?? event.message, "window"));
  addEventListener("unhandledrejection", event => captureException(event.reason, "promise"));
  if (!("PerformanceObserver" in window) || !sampled) return;
  const observe = (type: string, callback: (entry: PerformanceEntry) => void) => {
    try {
      const observer = new PerformanceObserver(list => list.getEntries().forEach(callback));
      observer.observe({ type, buffered: true });
    } catch { /* unsupported metric */ }
  };
  observe("largest-contentful-paint", entry => send("vital", { name: "LCP", value: entry.startTime }));
  observe("first-input", entry => send("vital", { name: "FID", value: (entry as PerformanceEventTiming).processingStart - entry.startTime }));
  let cls = 0;
  observe("layout-shift", entry => {
    const shift = entry as PerformanceEntry & { value: number; hadRecentInput: boolean };
    if (!shift.hadRecentInput) cls += shift.value;
  });
  addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden" && cls) send("vital", { name: "CLS", value: cls });
  });
}

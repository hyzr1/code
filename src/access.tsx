import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import Icon from "./components/Icon";

type State = "checking" | "locked" | "allowed";

export default function BetaAccessGate({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>("checking");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    fetch("/api/access", { credentials: "same-origin", cache: "no-store" })
      .then(async response => {
        const data = await response.json().catch(() => ({}));
        if (!active) return;
        if (typeof data.access === "boolean") setState(data.access ? "allowed" : "locked");
        else setState(location.hostname === "localhost" || location.hostname === "127.0.0.1" ? "allowed" : "locked");
      })
      .catch(() => {
        // Local preview and offline development do not run Vercel functions.
        if (active) setState(location.hostname === "localhost" || location.hostname === "127.0.0.1" ? "allowed" : "locked");
      });
    return () => { active = false; };
  }, []);

  const redeem = async (event: FormEvent) => {
    event.preventDefault();
    if (!code.trim() || submitting) return;
    setSubmitting(true);
    setError("");
    try {
      const response = await fetch("/api/access", {
        method: "POST",
        credentials: "same-origin",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Could not verify that code");
      setState("allowed");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not verify that code");
    } finally { setSubmitting(false); }
  };

  if (state === "checking") return <main className="access-check" aria-label="Checking beta access" />;
  if (state === "allowed") return children;

  return (
    <main className="access-gate">
      <section className="access-card" aria-labelledby="access-title">
        <div className="access-brand"><span className="brand-bars" aria-hidden="true"><i /><i /><i /><i /></span><strong>Hyzr Code</strong></div>
        <div className="access-icon"><Icon name="lock" size={21} /></div>
        <span className="access-kicker">Private beta</span>
        <h1 id="access-title">Your path starts here.</h1>
        <p>Hyzr Code is currently open to a limited group of learners. Enter your invite code to unlock the complete platform.</p>
        <form onSubmit={redeem}>
          <label htmlFor="beta-code">Access code</label>
          <div className="access-field">
            <input id="beta-code" value={code} onChange={event => setCode(event.target.value.toUpperCase())} placeholder="HYZR-XXXX-XXXX" autoComplete="one-time-code" autoFocus spellCheck={false} />
            <button className="primary" disabled={submitting || !code.trim()}>{submitting ? "Checking…" : "Enter beta"}<Icon name="arrowRight" size={15} /></button>
          </div>
          {error ? <div className="access-error" role="alert">{error}</div> : null}
        </form>
        <small>Access is saved securely on this device for future visits.</small>
      </section>
    </main>
  );
}

import { useEffect, useState, type FormEvent } from "react";
import Icon from "./components/Icon";

interface Props { open: boolean; onClose: () => void; }

/** Optional beta upgrade. The platform remains usable without a code. */
export default function BetaAccessPrompt({ open, onClose }: Props) {
  const [code, setCode] = useState("");
  const [active, setActive] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setCode("");
    setError("");
    fetch("/api/access", { credentials: "same-origin", cache: "no-store" })
      .then(async response => setActive((await response.json().catch(() => ({}))).access === true))
      .catch(() => setActive(false));
  }, [open]);

  const redeem = async (event: FormEvent) => {
    event.preventDefault();
    if (!code.trim() || submitting) return;
    setSubmitting(true);
    setError("");
    try {
      const response = await fetch("/api/access", { method: "POST", credentials: "same-origin", headers: { "content-type": "application/json" }, body: JSON.stringify({ code }) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Could not verify that code");
      setActive(true);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Could not verify that code"); }
    finally { setSubmitting(false); }
  };

  if (!open) return null;
  return (
    <div className="tour-layer beta-access-layer" role="presentation">
      <div className="tour-dimmer" onClick={onClose} />
      <section className="tour-card centered" role="dialog" aria-modal="true" aria-labelledby="beta-access-title">
        <div className="tour-topline"><div className="tour-mark"><img src="/hyzr-mark.png" alt="" /></div><span>Hyzr Code beta</span><button className="ghost tiny" onClick={onClose}>Close</button></div>
        {active ? <>
          <h2 id="beta-access-title">You’re beta certified.</h2>
          <p>Your lifetime free access is active on this device. Keep learning while we build the next chapters.</p>
          <div className="tour-footer beta-access-footer"><span className="beta-certified"><Icon name="checkCircle" size={15} /> Lifetime access active</span><button className="primary small" onClick={onClose}>Continue learning</button></div>
        </> : <>
          <h2 id="beta-access-title">Lock in lifetime free access.</h2>
          <p>Have a beta invite code? Redeem it once to become a certified beta learner and keep free access for the life of the platform.</p>
          <form onSubmit={redeem} className="beta-access-form"><label htmlFor="beta-code">Beta access code</label><div className="access-field"><input id="beta-code" value={code} onChange={event => setCode(event.target.value.toUpperCase())} placeholder="HYZR-XXXX-XXXX" autoComplete="one-time-code" spellCheck={false} /><button className="primary small" disabled={submitting || !code.trim()}>{submitting ? "Checking…" : "Redeem code"}<Icon name="arrowRight" size={14} /></button></div>{error ? <div className="access-error" role="alert">{error}</div> : null}</form>
          <div className="tour-footer beta-access-footer"><span>Already have access? Close this and keep learning.</span><button className="small" onClick={onClose}>Maybe later</button></div>
        </>}
      </section>
    </div>
  );
}

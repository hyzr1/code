import { useEffect, useRef, useState } from "react";

// A projected network with signals travelling from input to output.
export default function Network({ paused }: { paused: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const clock = useRef(0);
  const [fallback, setFallback] = useState(false);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setFallback(true);
      return;
    }
    let frame = 0,
      last = 0,
      visible = true,
      mx = 0,
      my = 0;
    const move = (e: PointerEvent) => {
      mx = e.clientX / innerWidth - 0.5;
      my = e.clientY / innerHeight - 0.5;
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    observer.observe(canvas);
    const draw = (now: number) => {
      frame = requestAnimationFrame(draw);
      if (!visible || document.hidden || now - last < 32) return;
      if (!paused) clock.current += Math.min(now - (last || now), 70) / 1000;
      last = now;
      const { width: w, height: h } = canvas.getBoundingClientRect();
      const ratio = Math.min(devicePixelRatio, 1.5);
      if (
        canvas.width !== Math.round(w * ratio) ||
        canvas.height !== Math.round(h * ratio)
      ) {
        canvas.width = Math.round(w * ratio);
        canvas.height = Math.round(h * ratio);
      }
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      ctx.clearRect(0, 0, w, h);
      const t = clock.current,
        scroll = Math.min(scrollY / innerHeight, 1);
      const angle = -0.32 + Math.sin(t * 0.12) * 0.055 + mx * 0.06;
      const project = (x: number, y: number, z: number) => {
        const a = x * Math.cos(angle) + z * Math.sin(angle),
          b = -x * Math.sin(angle) + z * Math.cos(angle);
        const s = 740 / (850 + b);
        return {
          x: w * 0.5 + a * s,
          y: h * 0.46 + (y + my * 10 + b * 0.22) * s,
          scale: s,
        };
      };
      const layers = [7, 11, 14, 11, 7];
      const spread = Math.min(w * 0.19, 215);
      const nodes = layers.map((count, l) =>
        Array.from({ length: count }, (_, i) => {
          const phase = (i / count) * Math.PI * 2;
          const r = 115 + (l % 2) * 25;
          return project(
            (l - 2) * spread,
            Math.sin(phase + t * 0.07) * r,
            Math.cos(phase + t * 0.07) * r * (1 - scroll * 0.3),
          );
        }),
      );
      ctx.lineWidth = 0.5;
      ctx.strokeStyle = "rgba(255,255,255,.055)";
      for (let i = -10; i <= 10; i++) {
        const a = project(i * 75, 190, -400),
          b = project(i * 75, 190, 400);
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
      for (let i = -6; i <= 6; i++) {
        const a = project(-850, 190, i * 70),
          b = project(850, 190, i * 70);
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
      for (let l = 0; l < 4; l++)
        for (let i = 0; i < nodes[l].length; i++)
          for (let j = 0; j < nodes[l + 1].length; j++) {
            if ((i + j) % 3 !== 0) continue;
            const a = nodes[l][i],
              b = nodes[l + 1][j];
            ctx.strokeStyle = "rgba(230,230,230,.105)";
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
            const p = (t * 0.22 + l * 0.19 + i * 0.13 + j * 0.07) % 1;
            if ((i + j) % 4 === 0) {
              const x = a.x + (b.x - a.x) * p,
                y = a.y + (b.y - a.y) * p;
              ctx.fillStyle = "rgba(255,255,255,.8)";
              ctx.beginPath();
              ctx.arc(x, y, 1.4, 0, Math.PI * 2);
              ctx.fill();
            }
          }
      nodes.forEach((layer, l) =>
        layer.forEach((p, i) => {
          const pulse =
            0.4 + 0.6 * Math.max(0, Math.sin(t * 1.2 - i * 0.5 - l * 0.8));
          ctx.fillStyle = `rgba(240,240,240,${0.35 + pulse * 0.65})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 2.1 * p.scale, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = `rgba(255,255,255,${0.08 + pulse * 0.15})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 7 * p.scale, 0, Math.PI * 2);
          ctx.stroke();
        }),
      );
      ctx.font = "9px monospace";
      ctx.textAlign = "center";
      ctx.fillStyle = "#777";
      [
        "INPUT",
        "REPRESENTATION",
        "REASONING",
        "CONNECTION",
        "UNDERSTANDING",
      ].forEach((label, i) => {
        const p = project((i - 2) * spread, 205, 0);
        if (w > 650 || i % 2 === 0) ctx.fillText(label, p.x, p.y);
      });
    };
    frame = requestAnimationFrame(draw);
    window.addEventListener("pointermove", move, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("pointermove", move);
    };
  }, [paused]);
  return (
    <div className="knowledge-field" aria-hidden="true">
      <canvas ref={ref} />
      {fallback && (
        <div className="network-fallback">
          {Array.from({ length: 5 }, (_, i) => (
            <span key={i}>
              ◉<br />│<br />◉<br />│<br />◉
            </span>
          ))}
        </div>
      )}
      <div className="field-topline">
        <span>NEURAL NETWORK / FORWARD PASS</span>
        <span>
          {paused ? "MOTION PAUSED" : "LIVE VISUALIZATION"} <i />
        </span>
      </div>
      <span className="field-coordinate">
        FIG 01 — CONNECTIONS BECOME UNDERSTANDING
      </span>
    </div>
  );
}

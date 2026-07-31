import type { VisualKind } from "../engine/scenes";

const BOXES = [2, 7, 1, 8, 3, 6];

export default function GuidedVisual({ kind }: { kind: VisualKind }) {
  if (kind === "hash") {
    return <div className="guided-visual hash"><span>value</span><i>hash</i><b>bucket</b><em>O(1) avg</em></div>;
  }
  if (kind === "stack") {
    return <div className="guided-visual stack"><small>top</small>{["}", "]", ")"].map((value) => <b key={value}>{value}</b>)}</div>;
  }
  if (kind === "heap") {
    return <div className="guided-visual nodes heap"><b className="n1">1</b><b className="n2">3</b><b className="n3">5</b><b className="n4">8</b><i className="e1"/><i className="e2"/><i className="e3"/></div>;
  }
  if (kind === "tree" || kind === "recursion") {
    return <div className={`guided-visual nodes ${kind}`}><b className="n1">root</b><b className="n2">L</b><b className="n3">R</b><b className="n4">base</b><i className="e1"/><i className="e2"/><i className="e3"/></div>;
  }
  if (kind === "graph" || kind === "backtracking") {
    return <div className={`guided-visual nodes ${kind}`}><b className="n1">A</b><b className="n2">B</b><b className="n3">C</b><b className="n4">D</b><i className="e1"/><i className="e2"/><i className="e3"/><span>frontier →</span></div>;
  }
  if (kind === "dp") {
    return <div className="guided-visual dp">{Array.from({ length: 12 }, (_, i) => <i key={i} className={i < 7 ? "known" : i === 7 ? "now" : ""}>{i < 8 ? i : "?"}</i>)}</div>;
  }
  if (kind === "intervals") {
    return <div className="guided-visual intervals"><i style={{ left: "5%", width: "42%" }}/><i style={{ left: "30%", width: "38%" }}/><b style={{ left: "5%", width: "63%" }}>merged frontier</b></div>;
  }

  // ---- Foundational-concept visuals -------------------------------------
  if (kind === "variable") {
    return <div className="guided-visual variable"><b>name</b><span>=</span><b className="val">value</b></div>;
  }
  if (kind === "function") {
    return <div className="guided-visual function"><b>in</b><span>→</span><b className="fn">f( )</b><span>→</span><b className="out">out</b></div>;
  }
  if (kind === "list") {
    return <div className="guided-visual list">{["a", "b", "c", "d"].map((value, index) => <i key={index} data-i={index} className={index === 1 ? "active" : ""}>{value}</i>)}</div>;
  }
  if (kind === "string") {
    return <div className="guided-visual string">{["H", "e", "l", "l", "o"].map((value, index) => <i key={index} data-i={index} className={index === 0 ? "active" : ""}>{value}</i>)}</div>;
  }
  if (kind === "loop") {
    return <div className="guided-visual loop">{[2, 4, 6].map((value, index) => <i key={index} className={index === 1 ? "active" : ""}>{value}</i>)}<b>total 6</b></div>;
  }
  if (kind === "boolean") {
    return <div className="guided-visual boolean"><b className="t">True</b><b className="f">False</b></div>;
  }

  return (
    <div className={`guided-visual array ${kind}`}>
      {BOXES.map((value, index) => <i key={index} className={(kind === "window" && index >= 1 && index <= 3) || (kind === "binary" && index >= 2 && index <= 4) ? "active" : ""}>{value}</i>)}
      {kind === "pointers" ? <><b className="left">L ↑</b><b className="right">↑ R</b></> : null}
      {kind === "window" ? <b className="window-label">valid window</b> : null}
      {kind === "binary" ? <b className="window-label">remaining search space</b> : null}
    </div>
  );
}

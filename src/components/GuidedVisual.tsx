import type { VisualKind } from "../engine/scenes";

const BOXES = [2, 7, 1, 8, 3, 6];

type Variant = "model" | "trap";

function LimitPlot({ topic, variant }: { topic: string; variant: Variant }) {
  const hole = topic === "math.atom.7" || topic === "math.atom.10";
  const jump = topic === "math.atom.8";
  const vertical = topic === "math.atom.11";
  const title = hole ? "A removable hole: nearby values approach L even when f(a) is missing"
    : jump ? "A jump: left and right approaches disagree"
    : vertical ? "A vertical asymptote: the two sides grow in opposite directions"
    : "A horizontal asymptote: far-right values approach L";
  return (
    <div className={`guided-visual math-plot ${variant}`}>
      <svg viewBox="0 0 280 120" role="img" aria-label={title}>
        <line className="axis" x1="18" y1="100" x2="264" y2="100" />
        <line className="axis" x1="30" y1="10" x2="30" y2="109" />
        {hole ? <>
          <path className="curve" d="M34 92 L250 22" />
          <circle className="hole" cx="142" cy="57" r="5" />
          <line className="guide" x1="142" y1="57" x2="142" y2="100" />
          <text x="147" y="109">a</text><text x="151" y="53">L</text>
        </> : null}
        {jump ? <>
          <path className="curve" d="M35 78 L139 57" />
          <path className="curve" d="M141 35 L252 22" />
          <circle className="hole" cx="140" cy="57" r="5" />
          <circle className="point" cx="140" cy="35" r="4" />
          <line className="guide" x1="140" y1="35" x2="140" y2="100" />
          <text x="145" y="109">a</text>
        </> : null}
        {vertical ? <>
          <line className="guide" x1="140" y1="10" x2="140" y2="110" />
          <path className="curve" d="M38 59 C84 67 114 91 129 116" />
          <path className="curve" d="M151 5 C165 40 201 52 253 58" />
          <text x="145" y="109">a</text>
        </> : null}
        {!hole && !jump && !vertical ? <>
          <line className="guide" x1="33" y1="43" x2="258" y2="43" />
          <path className="curve" d="M35 86 C85 69 116 57 151 51 S214 45 256 43" />
          <text x="251" y="38">L</text>
        </> : null}
      </svg>
      <span>{variant === "trap" ? "Check both sides and the point separately" : title}</span>
    </div>
  );
}

function Flow({
  kind,
  variant,
  labels,
}: {
  kind: VisualKind;
  variant: Variant;
  labels: [string, string, string];
}) {
  return (
    <div className={`guided-visual concept-flow ${kind} ${variant}`}>
      <b>{labels[0]}</b><span>→</span><b>{labels[1]}</b><span>→</span><b>{labels[2]}</b>
    </div>
  );
}

const FLOWS: Partial<Record<VisualKind, { model: [string, string, string]; trap: [string, string, string] }>> = {
  program: {
    model: ["source", "Python", "result"],
    trap: ["expression", "value", "no display"],
  },
  decision: {
    model: ["condition", "one branch", "continue"],
    trap: ["wrong order", "early match", "missed branch"],
  },
  pipeline: {
    model: ["input", "transform", "new output"],
    trap: ["too many passes", "extra work", "slow result"],
  },
  modules: {
    model: ["module.py", "import", "caller.py"],
    trap: ["top-level work", "import", "side effect"],
  },
  object: {
    model: ["data", "object", "behavior"],
    trap: ["deep hierarchy", "tight coupling", "fragile change"],
  },
  resource: {
    model: ["open", "use safely", "close"],
    trap: ["open", "error", "leaked resource"],
  },
  testing: {
    model: ["input", "behavior", "evidence"],
    trap: ["assumption", "no check", "silent bug"],
  },
  concurrency: {
    model: ["task A + B", "overlap", "both done"],
    trap: ["task A then B", "idle wait", "slow total"],
  },
  complexity: {
    model: ["input n", "work grows", "measure"],
    trap: ["guess", "micro-tweak", "same bottleneck"],
  },
  system: {
    model: ["request", "guarded state", "stable result"],
    trap: ["retry / load", "unchecked", "duplicate / overload"],
  },
  ml: {
    model: ["clean data", "model", "held-out evidence"],
    trap: ["leaked data", "pretty metric", "false confidence"],
  },
  probability: {
    model: ["outcomes", "weight each", "checked estimate"],
    trap: ["one sample", "ignore base rate", "bad conclusion"],
  },
};

type FlowPair = { model: [string, string, string]; trap: [string, string, string] };

/** Topic-specific stories keep a shared diagram grammar without teaching every
 * lesson with the same three generic boxes. */
const TOPIC_FLOWS: Record<string, FlowPair> = {
  "math.atom.1": { model: ["allowed x", "function rule", "attained y"], trap: ["forbidden x", "undefined rule", "no output"] },
  "math.atom.2": { model: ["parent graph", "shift / reflect", "new graph"], trap: ["many x", "same y", "no inverse"] },
  "math.atom.3": { model: ["inner g(x)", "outer f", "f(g(x))"], trap: ["set h = 0", "divide by h", "undefined"] },
  "math.atom.4": { model: ["angle in radians", "unit circle", "sin / cos"], trap: ["radian input", "degree mode", "wrong value"] },
  "math.atom.5": { model: ["exponential", "apply log", "solve exponent"], trap: ["log of sum", "split terms", "false rule"] },
  "math.atom.6": { model: ["original domain", "valid factor", "same nearby values"], trap: ["cancel factor", "forget hole", "wrong domain"] },
  "math.atom.7": { model: ["x near a", "outputs settle", "limit L"], trap: ["sample points", "guess only", "not a proof"] },
  "math.atom.8": { model: ["left approach", "compare right", "same limit"], trap: ["different sides", "average them", "false limit"] },
  "math.atom.9": { model: ["known limits", "check denominator", "combine"], trap: ["zero over zero", "substitute anyway", "invalid result"] },
  "math.atom.10": { model: ["factor or conjugate", "simplify nearby", "take limit"], trap: ["cancel at hole", "fill point silently", "wrong domain"] },
  "math.atom.11": { model: ["near forbidden x", "check each sign", "unbounded output"], trap: ["zero denominator", "ignore side", "false finite limit"] },
  "math.atom.12": { model: ["largest power", "divide each term", "long-run ratio"], trap: ["horizontal line", "treat as barrier", "wrong conclusion"] },
  "math.atom.13": { model: ["lower bound", "trapped expression", "upper bound"], trap: ["oscillation", "guess a value", "no proof"] },
  "math.atom.14": { model: ["defined value", "nearby limit", "equal at point"], trap: ["opposite signs", "skip continuity", "false root"] },
  "math.atom.15": { model: ["choose ε", "construct δ", "prove implication"], trap: ["one example", "claim every ε", "incomplete proof"] },
  "math.atom.16": { model: ["classify obstacle", "use valid method", "state behavior"], trap: ["see 0/0", "stop early", "wrong answer"] },
  "algo.scale": { model: ["10 inputs", "45 comparisons", "fine"], trap: ["1M inputs", "500B comparisons", "not viable"] },
  "algo.operation-count": { model: ["mark operation", "count repeats", "derive total"], trap: ["count lines", "miss hidden scan", "wrong cost"] },
  "algo.asymptotics": { model: ["exact count", "dominant term", "growth class"], trap: ["loose bound", "no case", "weak claim"] },
  "algo.growth-classes": { model: ["code structure", "state progress", "growth class"], trap: ["spot one loop", "guess a label", "wrong bound"] },
  "algo.dominant-growth": { model: ["growth first", "benchmark constants", "real choice"], trap: ["same Big O", "ignore constants", "slower system"] },
  "algo.space-cost": { model: ["input + output", "temporary peak", "state both"], trap: ["hidden copy", "stack + buffers", "memory spike"] },
  "algo.amortized-cost": { model: ["many cheap ops", "rare rebuild", "bounded sequence"], trap: ["one resize", "worst latency", "call it always O(1)"] },
  "algo.analysis-cases": { model: ["name assumptions", "choose case", "defensible bound"], trap: ["say average", "no distribution", "empty claim"] },
  "ml.vector-operations": { model: ["ordered features", "shape + meaning", "valid vector"], trap: ["same length", "swapped meaning", "silent bug"] },
  "ml.dot-product-geometry": { model: ["feature × weight", "sum evidence", "one score"], trap: ["raw magnitudes", "large dot", "false similarity"] },
  "ml.norm-families": { model: ["vector difference", "chosen norm", "distance"], trap: ["mixed units", "one axis dominates", "bad geometry"] },
  "loop-control": { model: ["condition", "body + progress", "next check"], trap: ["continue early", "skip progress", "same state forever"] },
  calls: { model: ["arguments", "function call", "return value"], trap: ["function name", "no call", "no result"] },
  "first-function": { model: ["input", "double", "output"], trap: ["hard-coded value", "one case", "not reusable"] },
  functions: { model: ["parameters", "function body", "return"], trap: ["hidden side effect", "surprise change", "fragile caller"] },
  arguments: { model: ["positional + named", "bind parameters", "run body"], trap: ["shared default", "later calls", "leaked state"] },
  scope: { model: ["local", "enclosing", "global"], trap: ["reach outward", "mutate state", "hard to reason"] },
  decorators: { model: ["function", "wrapper", "enhanced call"], trap: ["drop metadata", "opaque wrapper", "poor debugging"] },
  branching: { model: ["condition", "matching branch", "continue"], trap: ["broad check first", "early match", "specific case lost"] },
  method: { model: ["constraints", "brute force", "better invariant"], trap: ["keyword guess", "memorized trick", "no proof"] },
  comprehensions: { model: ["source items", "map / filter", "new collection"], trap: ["nested puzzle", "hidden logic", "hard to review"] },
  sorting: { model: ["items", "key function", "ordered copy"], trap: ["in-place sort", "returns None", "lost result"] },
  iterators: { model: ["iterable", "next", "one value"], trap: ["consume stream", "ask again", "already exhausted"] },
  itertools: { model: ["lazy inputs", "combine", "lazy output"], trap: ["infinite source", "materialize all", "never finishes"] },
  imports: { model: ["module", "import name", "use here"], trap: ["top-level work", "import", "surprise effect"] },
  modules: { model: ["public API", "module boundary", "caller"], trap: ["A imports B", "B imports A", "half-built module"] },
  classes: { model: ["constructor input", "instance", "method call"], trap: ["class for everything", "extra ceremony", "less clarity"] },
  dataclasses: { model: ["field values", "dataclass", "record object"], trap: ["shared list default", "many instances", "same list"] },
  composition: { model: ["small objects", "compose", "flexible behavior"], trap: ["deep inheritance", "tight coupling", "fragile override"] },
  protocols: { model: ["needed behavior", "protocol", "many types"], trap: ["concrete class", "unneeded methods", "tight coupling"] },
  exceptions: { model: ["risky operation", "specific except", "recovery"], trap: ["bare except", "swallow bug", "no evidence"] },
  contexts: { model: ["acquire", "with block", "always release"], trap: ["open resource", "exception", "leak"] },
  "files-json": { model: ["bytes / JSON", "parse + validate", "trusted value"], trap: ["valid syntax", "wrong shape", "late crash"] },
  typing: { model: ["boundary", "type contract", "editor check"], trap: ["Any", "check disabled", "mistake spreads"] },
  testing: { model: ["input", "assert behavior", "regression proof"], trap: ["implementation detail", "brittle test", "false alarm"] },
  debugging: { model: ["reproduce", "inspect evidence", "smallest cause"], trap: ["random edits", "new variables", "worse mystery"] },
  performance: { model: ["measure", "find bottleneck", "change algorithm"], trap: ["guess", "micro-tweak", "same bottleneck"] },
  asyncio: { model: ["I/O task A + B", "await overlap", "both done"], trap: ["CPU work", "blocked loop", "all tasks freeze"] },
  parallelism: { model: ["CPU jobs", "process workers", "parallel result"], trap: ["tiny jobs", "copy overhead", "slower total"] },
  idempotency: { model: ["request + key", "atomic check", "apply once"], trap: ["retry race", "check then write", "double effect"] },
  "cache-reasoning": { model: ["request", "cache policy", "hit / miss"], trap: ["no reuse", "large cache", "still misses"] },
  "capacity-estimation": { model: ["traffic", "peak assumption", "safe capacity"], trap: ["average only", "hidden burst", "outage"] },
  "api-contracts": { model: ["untrusted input", "validate boundary", "trusted core"], trap: ["late validation", "mixed failures", "unclear caller"] },
  "ml-shapes": { model: ["rows x features", "weights", "one score / row"], trap: ["shape mismatch", "wrong axis", "invalid output"] },
  "data-leakage": { model: ["train only", "fit transform", "validate later"], trap: ["all data", "fit first", "leaked metric"] },
  "classification-metrics": { model: ["predictions", "confusion counts", "precision / recall"], trap: ["accuracy only", "rare class", "misleading score"] },
  "gradient-descent": { model: ["current weight", "gradient step", "lower loss"], trap: ["huge step", "overshoot", "diverge"] },
  "expected-value": { model: ["outcomes", "probability weights", "long-run average"], trap: ["best outcome", "ignore odds", "bad decision"] },
  "bayes-rule": { model: ["prior", "new evidence", "updated belief"], trap: ["test accuracy", "ignore base rate", "false certainty"] },
  combinatorics: { model: ["available choices", "count structure", "total ways"], trap: ["list every case", "explosion", "never finish"] },
  "monte-carlo": { model: ["random samples", "average", "uncertainty"], trap: ["few samples", "precise digits", "false confidence"] },
};

const STRING_VALUES: Record<string, string[]> = {
  strings: ["H", "e", "l", "l", "o"],
  fstrings: ["Hi", "{name}", "!"],
  "text-split": ["a", "b", "empty", "c"],
  "format-specs": ["3.5", ".2f", "3.50"],
};

const LIST_VALUES: Record<string, string[]> = {
  lists: ["a", "b", "c", "d"],
  slicing: ["0", "1", "2", "3"],
  tuples: ["x", "y"],
  unpacking: ["first", "*rest", "last"],
};

export default function GuidedVisual({
  kind,
  variant = "model",
  topic,
}: {
  kind: VisualKind;
  variant?: Variant;
  topic?: string;
}) {
  if (topic && ["math.atom.7", "math.atom.8", "math.atom.10", "math.atom.11", "math.atom.12"].includes(topic)) {
    return <LimitPlot topic={topic} variant={variant} />;
  }
  const flow = (topic && TOPIC_FLOWS[topic]) || FLOWS[kind];
  if (flow) return <Flow kind={kind} variant={variant} labels={flow[variant]} />;

  if (kind === "types") {
    return (
      <div className={`guided-visual types ${variant}`}>
        <b><code>3</code><small>int</small></b>
        <b><code>3.0</code><small>float</small></b>
        <b className={variant === "trap" ? "warn" : "active"}><code>"3"</code><small>str</small></b>
      </div>
    );
  }
  if (kind === "reference") {
    return (
      <div className={`guided-visual reference ${variant}`}>
        <b>a</b><b>b</b><span>→</span><em>{variant === "trap" ? "shared mutation" : "one list object"}</em>
      </div>
    );
  }
  if (kind === "hash") {
    return <div className={`guided-visual hash ${variant}`}><span>{variant === "trap" ? "two keys" : "key"}</span><i>hash</i><b>{variant === "trap" ? "collision" : "bucket"}</b><em>{variant === "trap" ? "resolve" : "O(1) avg"}</em></div>;
  }
  if (kind === "stack") {
    const values = variant === "trap" ? ["(", "[", ") ✕"] : ["}", "]", ")"];
    return <div className={`guided-visual stack ${variant}`}><small>top</small>{values.map((value) => <b key={value}>{value}</b>)}</div>;
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
  if (kind === "prefix") {
    const values = variant === "trap" ? [0, 3, 2, "?", 8] : [0, 3, 2, 6, 8];
    return <div className={`guided-visual dp prefix ${variant}`}>{values.map((value, index) => <i key={index} className={index < 3 ? "known" : index === 3 ? "now" : ""}>{value}</i>)}</div>;
  }
  if (kind === "intervals") {
    return <div className="guided-visual intervals"><i style={{ left: "5%", width: "42%" }}/><i style={{ left: "30%", width: "38%" }}/><b style={{ left: "5%", width: "63%" }}>merged frontier</b></div>;
  }

  // ---- Foundational-concept visuals -------------------------------------
  if (kind === "variable") {
    return <div className={`guided-visual variable ${variant}`}><b>{variant === "trap" ? "old name" : "name"}</b><span>=</span><b className="val">{variant === "trap" ? "wrong type" : "value"}</b></div>;
  }
  if (kind === "function") {
    return <div className="guided-visual function"><b>in</b><span>→</span><b className="fn">f( )</b><span>→</span><b className="out">out</b></div>;
  }
  if (kind === "list") {
    const values = LIST_VALUES[topic ?? ""] ?? LIST_VALUES.lists;
    return <div className="guided-visual list">{values.map((value, index) => <i key={index} data-i={index} className={index === 1 ? "active" : ""}>{value}</i>)}</div>;
  }
  if (kind === "string") {
    const values = STRING_VALUES[topic ?? ""] ?? STRING_VALUES.strings;
    return <div className="guided-visual string">{values.map((value, index) => <i key={index} data-i={index} className={index === 1 ? "active" : ""}>{value}</i>)}</div>;
  }
  if (kind === "loop") {
    const values = topic === "iteration-tools" ? [0, 1, 2] : [2, 4, 6];
    const result = topic === "iteration-tools" ? "index 1" : topic === "aggregation-tools" ? "total 12" : "total 6";
    return <div className="guided-visual loop">{values.map((value, index) => <i key={index} className={index === 1 ? "active" : ""}>{value}</i>)}<b>{result}</b></div>;
  }
  if (kind === "boolean") {
    return <div className={`guided-visual boolean ${variant}`}><b className="t">True</b><b className="f">False</b>{variant === "trap" ? <small>truthy ≠ literally True</small> : null}</div>;
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

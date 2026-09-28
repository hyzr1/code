import type { VisualKind } from "../engine/scenes";

const BOXES = [2, 7, 1, 8, 3, 6];

type Variant = "model" | "trap";

function LimitPlot({ topic, variant }: { topic: string; variant: Variant }) {
  const hole = topic === "math.atom.7" || topic === "math.atom.10";
  const jump = topic === "math.atom.8";
  const vertical = topic === "math.atom.11";
  const title = hole
    ? "A removable hole: nearby values approach L even when f(a) is missing"
    : jump
      ? "A jump: left and right approaches disagree"
      : vertical
        ? "A vertical asymptote: the two sides grow in opposite directions"
        : "A horizontal asymptote: far-right values approach L";
  return (
    <div className={`guided-visual math-plot ${variant}`}>
      <svg viewBox="0 0 280 120" role="img" aria-label={title}>
        <line className="axis" x1="18" y1="100" x2="264" y2="100" />
        <line className="axis" x1="30" y1="10" x2="30" y2="109" />
        {hole ? (
          <>
            <path className="curve" d="M34 92 L250 22" />
            <circle className="hole" cx="142" cy="57" r="5" />
            <line className="guide" x1="142" y1="57" x2="142" y2="100" />
            <text x="147" y="109">
              a
            </text>
            <text x="151" y="53">
              L
            </text>
          </>
        ) : null}
        {jump ? (
          <>
            <path className="curve" d="M35 78 L139 57" />
            <path className="curve" d="M141 35 L252 22" />
            <circle className="hole" cx="140" cy="57" r="5" />
            <circle className="point" cx="140" cy="35" r="4" />
            <line className="guide" x1="140" y1="35" x2="140" y2="100" />
            <text x="145" y="109">
              a
            </text>
          </>
        ) : null}
        {vertical ? (
          <>
            <line className="guide" x1="140" y1="10" x2="140" y2="110" />
            <path className="curve" d="M38 59 C84 67 114 91 129 116" />
            <path className="curve" d="M151 5 C165 40 201 52 253 58" />
            <text x="145" y="109">
              a
            </text>
          </>
        ) : null}
        {!hole && !jump && !vertical ? (
          <>
            <line className="guide" x1="33" y1="43" x2="258" y2="43" />
            <path
              className="curve"
              d="M35 86 C85 69 116 57 151 51 S214 45 256 43"
            />
            <text x="251" y="38">
              L
            </text>
          </>
        ) : null}
      </svg>
      <span>
        {variant === "trap"
          ? "Check both sides and the point separately"
          : title}
      </span>
    </div>
  );
}

function DerivativePlot({
  topic,
  variant,
}: {
  topic: string;
  variant: Variant;
}) {
  const cusp = topic === "math.atom.20";
  const normal = topic === "math.atom.21";
  const title = cusp
    ? "A continuous corner has different slopes from the left and right"
    : normal
      ? "The tangent follows the local slope; the normal is perpendicular"
      : "Secant slopes approach the tangent slope as the second point moves closer";
  return (
    <div className={`guided-visual math-plot ${variant}`}>
      <svg viewBox="0 0 280 120" role="img" aria-label={title}>
        <line className="axis" x1="18" y1="104" x2="264" y2="104" />
        <line className="axis" x1="30" y1="10" x2="30" y2="109" />
        {cusp ? (
          <>
            <path className="curve" d="M42 24 L140 94 L238 24" />
            <circle className="point" cx="140" cy="94" r="4" />
            <path className="guide" d="M72 45 L140 94 L208 45" />
            <text x="137" y="116">
              a
            </text>
          </>
        ) : (
          <>
            <path className="curve" d="M35 94 Q108 96 160 66 Q203 41 250 12" />
            <line className="guide" x1="160" y1="66" x2="160" y2="104" />
            <circle className="point" cx="160" cy="66" r="4" />
            <text x="165" y="116">
              a
            </text>
            <path className="curve" d="M76 106 L245 18" />
            {normal ? (
              <path className="guide" d="M137 22 L184 111" />
            ) : (
              <>
                <path className="guide" d="M57 93 L228 28" />
                <circle className="hole" cx="228" cy="28" r="4" />
              </>
            )}
          </>
        )}
      </svg>
      <span>
        {variant === "trap"
          ? cusp
            ? "Continuity does not force one tangent slope"
            : "A secant is not yet the tangent"
          : title}
      </span>
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
      <b>{labels[0]}</b>
      <span>→</span>
      <b>{labels[1]}</b>
      <span>→</span>
      <b>{labels[2]}</b>
    </div>
  );
}

const FLOWS: Partial<
  Record<
    VisualKind,
    { model: [string, string, string]; trap: [string, string, string] }
  >
> = {
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

type FlowPair = {
  model: [string, string, string];
  trap: [string, string, string];
};

/** Topic-specific stories keep a shared diagram grammar without teaching every
 * lesson with the same three generic boxes. */
const TOPIC_FLOWS: Record<string, FlowPair> = {
  "math.atom.1": {
    model: ["allowed x", "function rule", "attained y"],
    trap: ["forbidden x", "undefined rule", "no output"],
  },
  "math.atom.2": {
    model: ["parent graph", "shift / reflect", "new graph"],
    trap: ["many x", "same y", "no inverse"],
  },
  "math.atom.3": {
    model: ["inner g(x)", "outer f", "f(g(x))"],
    trap: ["set h = 0", "divide by h", "undefined"],
  },
  "math.atom.4": {
    model: ["angle in radians", "unit circle", "sin / cos"],
    trap: ["radian input", "degree mode", "wrong value"],
  },
  "math.atom.5": {
    model: ["exponential", "apply log", "solve exponent"],
    trap: ["log of sum", "split terms", "false rule"],
  },
  "math.atom.6": {
    model: ["original domain", "valid factor", "same nearby values"],
    trap: ["cancel factor", "forget hole", "wrong domain"],
  },
  "math.atom.7": {
    model: ["x near a", "outputs settle", "limit L"],
    trap: ["sample points", "guess only", "not a proof"],
  },
  "math.atom.8": {
    model: ["left approach", "compare right", "same limit"],
    trap: ["different sides", "average them", "false limit"],
  },
  "math.atom.9": {
    model: ["known limits", "check denominator", "combine"],
    trap: ["zero over zero", "substitute anyway", "invalid result"],
  },
  "math.atom.10": {
    model: ["factor or conjugate", "simplify nearby", "take limit"],
    trap: ["cancel at hole", "fill point silently", "wrong domain"],
  },
  "math.atom.11": {
    model: ["near forbidden x", "check each sign", "unbounded output"],
    trap: ["zero denominator", "ignore side", "false finite limit"],
  },
  "math.atom.12": {
    model: ["largest power", "divide each term", "long-run ratio"],
    trap: ["horizontal line", "treat as barrier", "wrong conclusion"],
  },
  "math.atom.13": {
    model: ["lower bound", "trapped expression", "upper bound"],
    trap: ["oscillation", "guess a value", "no proof"],
  },
  "math.atom.14": {
    model: ["defined value", "nearby limit", "equal at point"],
    trap: ["opposite signs", "skip continuity", "false root"],
  },
  "math.atom.15": {
    model: ["choose ε", "construct δ", "prove implication"],
    trap: ["one example", "claim every ε", "incomplete proof"],
  },
  "math.atom.16": {
    model: ["classify obstacle", "use valid method", "state behavior"],
    trap: ["see 0/0", "stop early", "wrong answer"],
  },
  "math.atom.17": {
    model: ["two positions", "secant rate", "shrink interval"],
    trap: ["one interval", "call it instant", "wrong rate"],
  },
  "math.atom.18": {
    model: ["form quotient", "simplify for h ≠ 0", "take limit"],
    trap: ["set h = 0", "divide by zero", "no proof"],
  },
  "math.atom.19": {
    model: ["variable input x", "derivative f′(x)", "evaluate at a"],
    trap: ["one slope", "use everywhere", "wrong function"],
  },
  "math.atom.20": {
    model: ["left slope", "compare right", "one derivative?"],
    trap: ["continuous corner", "average slopes", "false derivative"],
  },
  "math.atom.21": {
    model: ["point (a,f(a))", "tangent slope", "line equation"],
    trap: ["point (a,f′(a))", "wrong location", "wrong line"],
  },
  "math.atom.22": {
    model: ["position", "velocity + units", "acceleration"],
    trap: ["v < 0", "call speed negative", "wrong meaning"],
  },
  "math.atom.23": {
    model: ["nonzero h", "simplify", "check both sides"],
    trap: ["use rule first", "skip domain", "false result"],
  },
  "math.atom.24": {
    model: ["split terms", "power rule", "sum results"],
    trap: ["keep constant", "miss exponent", "wrong slope"],
  },
  "math.atom.25": {
    model: ["two changing factors", "differentiate each", "add contributions"],
    trap: ["multiply derivatives", "omit a term", "wrong product"],
  },
  "math.atom.26": {
    model: ["outer function", "inner rate", "multiply"],
    trap: ["outer only", "miss inner rate", "wrong slope"],
  },
  "math.atom.27": {
    model: ["radian angle", "sin to cos", "inner rate"],
    trap: ["degree formula", "drop minus sign", "wrong rate"],
  },
  "math.atom.28": {
    model: ["exp or log", "check domain", "chain rate"],
    trap: ["wrong base", "invalid log", "wrong derivative"],
  },
  "math.atom.29": {
    model: ["equation in x,y", "differentiate both", "solve for y′"],
    trap: ["omit y′", "ignore branch", "wrong tangent"],
  },
  "math.atom.30": {
    model: ["find preimage", "evaluate f′ there", "take reciprocal"],
    trap: ["use output", "reciprocate wrong slope", "wrong inverse"],
  },
  "math.atom.31": {
    model: ["differentiate twice", "check sign intervals", "interpret"],
    trap: ["see f″ = 0", "skip sign test", "false inflection"],
  },
  "math.atom.32": {
    model: ["identify structure", "combine rules", "verify domain"],
    trap: ["rush algebra", "lose factor", "wrong result"],
  },
  "math.atom.33": {
    model: ["check hypotheses", "find secant slope", "match f′(c)"],
    trap: ["corner or gap", "invoke theorem", "false guarantee"],
  },
  "math.atom.34": {
    model: ["critical inputs", "test f′ signs", "classify behavior"],
    trap: ["f′=0", "assume maximum", "miss sign chart"],
  },
  "math.atom.35": {
    model: ["test f″ intervals", "compare signs", "confirm inflection"],
    trap: ["f″=0", "skip sign change", "false inflection"],
  },
  "math.atom.36": {
    model: ["stationary point", "choose valid test", "classify"],
    trap: ["f″=0", "declare none", "inconclusive"],
  },
  "math.atom.37": {
    model: ["objective + units", "feasible domain", "compare values"],
    trap: ["differentiate early", "ignore boundary", "wrong optimum"],
  },
  "math.atom.38": {
    model: ["changing relation", "differentiate in time", "substitute moment"],
    trap: ["freeze snapshot", "omit chain rate", "zero change"],
  },
  "math.atom.39": {
    model: ["nearby anchor", "tangent slope", "local estimate"],
    trap: ["far from anchor", "claim exactness", "large error"],
  },
  "math.atom.40": {
    model: ["domain + limits", "f′ and f″ signs", "consistent sketch"],
    trap: ["ignore gap", "connect branches", "false graph"],
  },
  "math.atom.41": {
    model: ["define model", "solve + compare", "interpret units"],
    trap: ["one derivative", "skip feasibility", "wrong decision"],
  },
  "math.atom.42": {
    model: ["given derivative", "find family F+C", "apply initial value"],
    trap: ["integrate", "omit C", "wrong function"],
  },
  "math.atom.43": {
    model: ["partition interval", "signed rectangles", "take limit"],
    trap: ["finite sum", "call it exact", "wrong integral"],
  },
  "math.atom.44": {
    model: ["split bounds", "keep signs", "add pieces"],
    trap: ["reverse bounds", "forget minus", "wrong total"],
  },
  "math.atom.45": {
    model: ["moving bound", "boundary value", "chain factor"],
    trap: ["change bound", "skip chain rule", "wrong rate"],
  },
  "math.atom.46": {
    model: ["find F′=f", "evaluate F(b)-F(a)", "signed result"],
    trap: ["use F(b) only", "ignore negative", "wrong area"],
  },
  "math.atom.47": {
    model: ["choose u", "convert du + bounds", "integrate"],
    trap: ["change integrand", "keep x-bounds", "wrong value"],
  },
  "math.atom.48": {
    model: ["velocity sign", "net displacement", "total distance"],
    trap: ["net equals zero", "assume no motion", "lost distance"],
  },
  "math.atom.49": {
    model: ["rate + units", "integrate change", "add initial stock"],
    trap: ["net rate negative", "call stock negative", "wrong meaning"],
  },
  "math.atom.50": {
    model: ["find crossings", "top minus bottom", "sum positive parts"],
    trap: ["curves cross", "keep one order", "area cancels"],
  },
  "math.atom.51": {
    model: ["thin cross-section", "derive its area", "integrate volume"],
    trap: ["use radius", "forget square", "wrong units"],
  },
  "math.atom.52": {
    model: ["label axis", "choose strip", "washer or shell"],
    trap: ["copy formula", "misread radius", "wrong solid"],
  },
  "math.atom.53": {
    model: ["integrate total", "divide by length", "average value"],
    trap: ["density rate", "omit interval", "wrong unit"],
  },
  "math.atom.54": {
    model: ["varying force", "small displacement", "integrate work"],
    trap: ["final force", "multiply whole path", "overestimate"],
  },
  "math.atom.55": {
    model: ["representative slice", "units + distance", "bounded integral"],
    trap: ["fixed travel", "ignore layer", "wrong work"],
  },
  "math.atom.56": {
    model: ["choose u,dv", "compute du,v", "simpler integral"],
    trap: ["bad factor choice", "new integral harder", "no progress"],
  },
  "math.atom.57": {
    model: ["inspect powers", "expose identity", "match derivative"],
    trap: ["wrong identity", "lost square", "wrong integral"],
  },
  "math.atom.58": {
    model: ["quadratic radical", "select trig branch", "return to x"],
    trap: ["sqrt of square", "drop absolute", "wrong sign"],
  },
  "math.atom.59": {
    model: ["factor denominator", "solve coefficients", "integrate pieces"],
    trap: ["miss repeated term", "false identity", "wrong answer"],
  },
  "math.atom.60": {
    model: ["choose rule", "sample interval", "bound error"],
    trap: ["smoothness fails", "claim bound", "false precision"],
  },
  "math.atom.61": {
    model: ["simplify", "choose method", "differentiate check"],
    trap: ["force a method", "skip verification", "wrong primitive"],
  },
  "math.atom.62": {
    model: ["finite bound b", "integrate", "take b to infinity"],
    trap: ["f tends to zero", "assume area finite", "wrong tail"],
  },
  "math.atom.63": {
    model: ["locate singularity", "split sides", "test each limit"],
    trap: ["opposite infinities", "cancel them", "false convergence"],
  },
  "math.atom.64": {
    model: ["positive functions", "valid inequality", "known benchmark"],
    trap: ["wrong direction", "cite comparison", "no conclusion"],
  },
  "math.atom.65": {
    model: ["candidate limit", "choose tolerance", "control all late n"],
    trap: ["early values", "guess stability", "miss oscillation"],
  },
  "math.atom.66": {
    model: ["invariant bound", "monotone proof", "solve limit"],
    trap: ["fixed point", "assume convergence", "false limit"],
  },
  "math.atom.67": {
    model: ["find endpoints", "split integral", "justify each test"],
    trap: ["one good piece", "ignore other", "false convergence"],
  },
  "math.atom.68": {
    model: ["finite partial sums", "take N limit", "series value"],
    trap: ["terms go to zero", "claim convergence", "harmonic counterexample"],
  },
  "math.atom.69": {
    model: ["finite pattern", "boundary terms", "take limit"],
    trap: ["formula memorized", "wrong starting index", "wrong sum"],
  },
  "math.atom.70": {
    model: ["positive decreasing", "known integral", "classify series"],
    trap: ["integral value", "call exact sum", "false equality"],
  },
  "math.atom.71": {
    model: ["dominant benchmark", "positive ratio", "same behavior"],
    trap: ["ratio zero", "claim equivalence", "invalid test"],
  },
  "math.atom.72": {
    model: ["adjacent ratio", "find limit", "compare with one"],
    trap: ["limit is one", "declare convergence", "inconclusive"],
  },
  "math.atom.73": {
    model: ["alternating signs", "decreasing sizes", "next-term error"],
    trap: ["signs alternate", "skip zero limit", "false result"],
  },
  "math.atom.74": {
    model: ["test magnitudes", "test signed sum", "classify"],
    trap: ["alternates", "assume conditional", "miss absolute"],
  },
  "math.atom.75": {
    model: ["center and radius", "open interval", "test endpoints"],
    trap: ["ratio is one", "include both ends", "wrong interval"],
  },
  "math.atom.76": {
    model: ["derivatives at center", "divide by factorial", "local polynomial"],
    trap: ["match at center", "claim global equality", "wrong model"],
  },
  "math.atom.77": {
    model: ["Taylor polynomial", "bound derivative", "certify error"],
    trap: ["decimal looks close", "skip remainder", "no guarantee"],
  },
  "math.atom.78": {
    model: ["inspect structure", "choose valid tests", "separate conclusions"],
    trap: ["one test fails", "force conclusion", "wrong series"],
  },
  "math.atom.79": {
    model: ["point + direction", "dot / cross", "line or plane"],
    trap: ["plane normal", "treat as tangent", "wrong geometry"],
  },
  "math.atom.80": {
    model: ["position r(t)", "velocity r′(t)", "length from speed"],
    trap: ["endpoints only", "call path length", "miss curve"],
  },
  "math.atom.81": {
    model: ["approach paths", "compare results", "uniform bound"],
    trap: ["two paths agree", "declare limit", "miss others"],
  },
  "math.atom.82": {
    model: ["hold other inputs", "find partials", "gradient"],
    trap: ["move every variable", "wrong partial", "wrong normal"],
  },
  "math.atom.83": {
    model: ["normalize direction", "dot gradient", "tangent plane"],
    trap: ["raw direction", "wrong scale", "wrong rate"],
  },
  "math.atom.84": {
    model: ["dependency graph", "each path rate", "sum contributions"],
    trap: ["drop one input", "missing term", "wrong total"],
  },
  "math.atom.85": {
    model: ["base value", "gradient term", "Hessian correction"],
    trap: ["omit cross term", "wrong curvature", "poor model"],
  },
  "math.atom.86": {
    model: ["solve gradient zero", "test Hessian", "check boundaries"],
    trap: ["determinant zero", "force classification", "false claim"],
  },
  "math.atom.87": {
    model: ["constraint normal", "parallel gradients", "compare values"],
    trap: ["ignore constraint", "solve ∇f=0", "miss optimum"],
  },
  "math.atom.88": {
    model: ["F=0", "check F_y", "local y branch"],
    trap: ["F_y=0", "divide anyway", "invalid slope"],
  },
  "math.atom.89": { model: ["sketch region", "choose slices", "integrate density"], trap: ["triangle", "constant bounds", "wrong region"] },
  "math.atom.90": { model: ["circular region", "polar bounds", "multiply by r"], trap: ["convert x,y", "omit Jacobian", "wrong area"] },
  "math.atom.91": { model: ["solid footprint", "vertical bounds", "integrate r dz dr dθ"], trap: ["cylinder", "omit radial factor", "wrong volume"] },
  "math.atom.92": { model: ["coordinate map", "absolute determinant", "scaled area"], trap: ["orientation flips", "signed determinant", "negative area"] },
  "math.atom.93": { model: ["remove singularity", "polar power", "limit test"], trap: ["one excluded point", "assume harmless", "divergent mass"] },
  "math.atom.94": { model: ["parametrize path", "dot with velocity", "directed work"], trap: ["reverse path", "ignore orientation", "wrong sign"] },
  "math.atom.95": { model: ["find potential", "check gradient", "endpoint difference"], trap: ["cross-partials", "ignore hole", "false potential"] },
  "math.atom.96": { model: ["positive boundary", "local curl", "total circulation"], trap: ["inner boundary", "wrong direction", "wrong sign"] },
  "math.atom.97": { model: ["parametrize sheet", "cross product", "normal flux"], trap: ["normalize once", "multiply twice", "wrong flux"] },
  "math.atom.98": { model: ["oriented edge", "normal curl", "Stokes equality"], trap: ["reverse edge", "same normal", "sign mismatch"] },
  "math.atom.99": { model: ["closed boundary", "volume divergence", "outward flux"], trap: ["open surface", "omit cap", "missing flow"] },
  "math.atom.100": { model: ["differential form", "exterior derivative", "boundary integral"], trap: ["ignore orientation", "wrong sign", "false theorem"] },
  "math.atom.101": { model: ["augmented system", "pivot rows", "solution set"], trap: ["drop right side", "wrong row step", "false solution"] },
  "math.atom.102": { model: ["linear combinations", "span", "independence"], trap: ["nonzero vectors", "assume independent", "redundant list"] },
  "math.atom.103": { model: ["span + independence", "basis", "unique coordinates"], trap: ["spanning list", "ignore redundancy", "not a basis"] },
  "math.atom.104": { model: ["linear map", "zero inputs", "reachable outputs"], trap: ["kernel", "place in output", "wrong space"] },
  "math.atom.105": { model: ["domain dimension", "nullity + rank", "dimension balance"], trap: ["row count", "use as domain", "wrong sum"] },
  "math.atom.106": { model: ["apply B", "then A", "composite AB"], trap: ["swap order", "assume commute", "different map"] },
  "math.atom.107": { model: ["linear map", "signed determinant", "area scale"], trap: ["negative sign", "negative area", "wrong geometry"] },
  "math.atom.108": { model: ["inner product", "norm + angle", "orthogonality"], trap: ["zero vector", "assign angle", "undefined"] },
  "math.atom.109": { model: ["column space", "orthogonal projection", "least-squares fit"], trap: ["residual", "assume zero", "false exact fit"] },
  "math.atom.110": { model: ["input columns", "orthonormal Q", "triangular R"], trap: ["dependent column", "normalize zero", "invalid QR"] },
  "math.atom.111": { model: ["square map", "invariant direction", "eigenvalue"], trap: ["zero vector", "call eigenvector", "invalid"] },
  "math.atom.112": { model: ["eigenvectors", "basis P", "diagonal D"], trap: ["repeated root", "assume basis", "not diagonalizable"] },
  "math.atom.113": { model: ["symmetric A", "orthogonal Q", "real spectrum"], trap: ["arbitrary P", "set inverse to transpose", "wrong factor"] },
  "math.atom.114": { model: ["input rotation", "nonnegative stretch", "output rotation"], trap: ["negative eigenvalue", "negative singular value", "wrong SVD"] },
  "math.atom.115": { model: ["quadratic form", "positive spectrum", "unique minimum"], trap: ["positive diagonal", "assume definite", "miss cross term"] },
  "math.atom.116": { model: ["singular values", "ratio", "sensitivity"], trap: ["unique solution", "assume stable answer", "large error"] },
  "math.atom.117": { model: ["center training data", "SVD directions", "project scores"], trap: ["fit on test set", "leak information", "biased result"] },
  "math.atom.118": { model: ["separate variables", "integrate", "apply initial state"], trap: ["divide by h(y)", "lose equilibrium", "missing solution"] },
  "math.atom.119": { model: ["linear ODE", "integrating factor", "product derivative"], trap: ["multiply left only", "unbalanced equation", "wrong answer"] },
  "math.atom.120": { model: ["characteristic roots", "independent modes", "initial conditions"], trap: ["repeated root", "duplicate mode", "missing constant"] },
  "math.atom.121": { model: ["homogeneous pair", "forced response", "complete solution"], trap: ["resonant trial", "same mode", "zero forcing"] },
  "math.atom.122": { model: ["matrix A", "exponential eᴬᵗ", "state trajectory"], trap: ["entrywise exp", "wrong matrix", "false solution"] },
  "math.atom.123": { model: ["equilibrium", "nearby arrows", "local stability"], trap: ["zero eigenvalue", "force conclusion", "miss nonlinear term"] },
  "math.atom.124": { model: ["current state", "slope step", "error check"], trap: ["local error", "call global", "wrong order"] },
  "math.atom.125": { model: ["initial value", "uniqueness condition", "valid interval"], trap: ["local result", "assume global", "miss blow-up"] },
  "math.atom.126": { model: ["read quantifiers", "choose witness", "test claim"], trap: ["reverse order", "same meaning", "false claim"] },
  "math.atom.127": { model: ["define relation", "verify properties", "equivalence classes"], trap: ["injective", "assume onto", "wrong function"] },
  "math.atom.128": { model: ["state hypotheses", "derive form", "conclude theorem"], trap: ["test examples", "declare universal", "unproved"] },
  "math.atom.129": { model: ["negate conclusion", "derive conflict", "recover claim"], trap: ["prove converse", "claim original", "logical gap"] },
  "math.atom.130": { model: ["base case", "arbitrary step", "all indices"], trap: ["missing base", "step alone", "no theorem"] },
  "math.atom.131": { model: ["equivalent inputs", "same output class", "well-defined map"], trap: ["choose one rep", "ignore another", "ambiguous result"] },
  "math.atom.132": { model: ["proposed listing", "diagonal change", "missing element"], trap: ["huge finite set", "call uncountable", "wrong size"] },
  "math.atom.133": { model: ["precise claim", "justified steps", "adversarial review"], trap: ["one example", "claim uniqueness", "miss counterexample"] },
  "math.atom.134": { model: ["choice stages", "product count", "bijection check"], trap: ["sequential choices", "add counts", "undercount"] },
  "math.atom.135": { model: ["decide order", "count arrangements", "remove repeats"], trap: ["distinct roles", "use committee count", "undercount"] },
  "math.atom.136": { model: ["choose k positions", "binomial term", "subset identity"], trap: ["b choices k", "give a exponent k", "wrong term"] },
  "math.atom.137": { model: ["sum set counts", "subtract overlap", "correct union"], trap: ["shared cases", "count twice", "inflated total"] },
  "math.atom.138": { model: ["recurrence", "generating series", "coefficient formula"], trap: ["shift sum", "lose initial term", "wrong series"] },
  "math.atom.139": { model: ["vertices + edges", "degree sum", "tree structure"], trap: ["n−1 edges", "ignore connection", "false tree"] },
  "math.atom.140": { model: ["sample space", "outcome weights", "event probability"], trap: ["biased outcomes", "divide by count", "wrong chance"] },
  "math.atom.141": { model: ["define outcomes", "identify event", "sum mass"], trap: ["event labels", "assume equal", "wrong chance"] },
  "math.atom.142": { model: ["prior", "evidence likelihood", "posterior"], trap: ["test sensitivity", "call posterior", "base-rate error"] },
  "math.atom.143": { model: ["outcome map", "mass or density", "cumulative law"], trap: ["density height", "call point chance", "wrong probability"] },
  "math.atom.144": { model: ["weighted mean", "centered square", "variance"], trap: ["second moment", "forget mean square", "inflated variance"] },
  "math.atom.145": { model: ["joint table", "sum marginal", "condition"], trap: ["condition on Y", "divide by X mass", "wrong law"] },
  "math.atom.146": { model: ["experiment", "check assumptions", "distribution family"], trap: ["familiar histogram", "ignore dependence", "wrong model"] },
  "math.atom.147": { model: ["independent data", "sample average", "concentration"], trap: ["finite sample", "demand exact mean", "false certainty"] },
  "math.atom.148": { model: ["sample average", "divide by error scale", "normal limit"], trap: ["biased sample", "apply CLT", "still biased"] },
  "math.atom.149": { model: ["sampling process", "bias + variance", "MSE"], trap: ["more biased data", "smaller variance", "same bias"] },
  "math.atom.150": { model: ["model likelihood", "log sum", "maximize parameter"], trap: ["differentiate interior", "ignore boundary", "wrong MLE"] },
  "math.atom.151": { model: ["estimator spread", "standard error", "coverage interval"], trap: ["one interval", "posterior interpretation", "wrong claim"] },
  "math.atom.152": { model: ["null model", "test statistic", "tail probability"], trap: ["p-value", "call P(null|data)", "wrong inference"] },
  "math.atom.153": { model: ["design matrix", "least-squares fit", "residual check"], trap: ["association", "claim cause", "confounding"] },
  "math.atom.154": { model: ["observed sample", "resample with replacement", "statistic spread"], trap: ["dependent rows", "iid shuffle", "wrong uncertainty"] },
  "math.atom.155": { model: ["split units", "fit inside fold", "held-out score"], trap: ["preprocess all data", "leak validation", "inflated score"] },
  "math.atom.156": { model: ["prior", "likelihood", "posterior"], trap: ["misspecified model", "overconfident claim", "false certainty"] },
  "math.atom.157": { model: ["base objective", "gradient change", "Hessian correction"], trap: ["large step", "trust linear term", "miss curvature"] },
  "math.atom.158": { model: ["current point", "negative gradient", "step-size check"], trap: ["too-large rate", "overshoot", "diverge"] },
  "math.atom.159": { model: ["segment in domain", "convex inequality", "global minimum"], trap: ["one curved region", "claim convex", "hidden counterexample"] },
  "math.atom.160": { model: ["feasible tangent", "parallel gradients", "candidate compare"], trap: ["unconstrained minimum", "ignore line", "infeasible"] },
  "math.atom.161": { model: ["primal feasibility", "stationarity + dual", "slackness"], trap: ["inactive constraint", "positive multiplier", "KKT violation"] },
  "math.atom.162": { model: ["true P", "predicted Q", "KL mismatch"], trap: ["swap P and Q", "assume symmetric", "wrong divergence"] },
  "math.atom.163": { model: ["large logits", "subtract max", "stable softmax"], trap: ["direct exponentials", "overflow", "invalid output"] },
  "math.atom.164": { model: ["derive objective", "fit training", "held-out evaluation"], trap: ["tune on test", "leak labels", "inflated score"] },
  "math.atom.165": { model: ["upper bound", "elements approach", "supremum"], trap: ["bounded set", "assume maximum", "missing endpoint"] },
  "math.atom.166": { model: ["choose ε", "find N", "all later terms"], trap: ["one subsequence", "claim full limit", "miss oscillation"] },
  "math.atom.167": { model: ["output ε", "input δ", "uniform nearby x"], trap: ["δ depends on x", "quantifier error", "invalid proof"] },
  "math.atom.168": { model: ["compact domain", "continuous image", "attained extrema"], trap: ["open interval", "assume maximum", "escapes boundary"] },
  "math.atom.169": { model: ["check hypotheses", "apply MVT", "interior slope"], trap: ["jump or corner", "invoke theorem", "false claim"] },
  "math.atom.170": { model: ["partition", "upper + lower sums", "common integral"], trap: ["bounded function", "assume integrable", "persistent gap"] },
  "math.atom.171": { model: ["pointwise limit", "sup error", "uniform verdict"], trap: ["each x works", "single N", "false uniformity"] },
  "math.atom.172": { model: ["interior radius", "uniform bound", "exchange operations"], trap: ["endpoint", "substitute anyway", "divergence"] },
  "math.atom.173": { model: ["group operation", "preserving map", "kernel + image"], trap: ["product closure", "forget inverse", "not a group"] },
  "math.atom.174": { model: ["subgroup cosets", "normality", "quotient group"], trap: ["arbitrary subgroup", "multiply cosets", "not well-defined"] },
  "math.atom.175": { model: ["homomorphism", "collapse kernel", "image isomorphism"], trap: ["partial image", "claim codomain", "false theorem"] },
  "math.atom.176": { model: ["group action", "orbit", "stabilizer"], trap: ["one point", "assume transitive", "miss orbit"] },
  "math.atom.177": { model: ["ring ideal", "quotient classes", "well-defined product"], trap: ["additive subgroup", "assume ideal", "invalid quotient"] },
  "math.atom.178": { model: ["coefficient field", "factor or divide", "polynomial structure"], trap: ["change field", "same irreducibility", "wrong factor"] },
  "math.atom.179": { model: ["minimal polynomial", "power basis", "extension degree"], trap: ["any polynomial", "call minimal", "wrong degree"] },
  "math.atom.180": { model: ["prime field", "irreducible q", "finite quotient field"], trap: ["six elements", "assume field", "zero divisors"] },
  "math.atom.181": { model: ["complex increment", "all directions", "derivative limit"], trap: ["real path", "claim derivative", "imaginary conflict"] },
  "math.atom.182": { model: ["real + imag parts", "compare partials", "holomorphic test"], trap: ["one point", "ignore regularity", "false converse"] },
  "math.atom.183": { model: ["oriented path", "complex dz", "contour integral"], trap: ["replace dz by length", "lose direction", "wrong value"] },
  "math.atom.184": { model: ["closed contour", "check interior", "zero integral"], trap: ["path avoids pole", "ignore enclosed pole", "wrong zero"] },
  "math.atom.185": { model: ["boundary values", "Cauchy kernel", "interior derivative"], trap: ["a outside", "apply formula", "wrong answer"] },
  "math.atom.186": { model: ["Laurent expansion", "principal part", "singularity type"], trap: ["nonisolated point", "classify anyway", "invalid"] },
  "math.atom.187": { model: ["enclosed poles", "residue sum", "contour value"], trap: ["extra arc", "ignore limit", "incomplete proof"] },
  "math.atom.188": { model: ["nonzero derivative", "rotation + scale", "local angles"], trap: ["local one-to-one", "claim global", "folding"] },
    "math.atom.189": { model: ["input perturbation", "condition number", "output error"], trap: ["rounding", "blame algorithm", "miss sensitivity"] },
    "math.atom.190": { model: ["bracket or tangent", "iterate", "certify root"], trap: ["tiny residual", "assume tiny error", "flat function"] },
    "math.atom.191": { model: ["distinct nodes", "interpolating polynomial", "between-node error"], trap: ["perfect at nodes", "assume everywhere", "oscillation"] },
    "math.atom.192": { model: ["Taylor stencil", "truncation order", "rounding limit"], trap: ["shrink h forever", "cancellation", "larger error"] },
    "math.atom.193": { model: ["sparse system", "iteration matrix", "residual check"], trap: ["small residual", "ill-conditioned A", "large solution error"] },
    "math.atom.194": { model: ["starting vector", "dominant eigendirection", "convergence ratio"], trap: ["missing component", "iterate", "never discover"] },
    "math.atom.195": { model: ["fast decay", "explicit multiplier", "stable step range"], trap: ["stable update", "assume accurate", "miss transient"] },
    "math.atom.196": { model: ["analytic benchmark", "halve grid", "measure order"], trap: ["one plausible plot", "declare correct", "undetected bug"] },
    "math.atom.197": { model: ["principal coefficients", "discriminant", "PDE type"], trap: ["mixed coefficient", "wrong B", "wrong class"] },
    "math.atom.198": { model: ["initial profile", "sine modes", "frequency decay"], trap: ["arbitrary mode", "ignore endpoints", "invalid solution"] },
    "math.atom.199": { model: ["displacement + velocity", "traveling waves", "energy balance"], trap: ["boundary flux", "ignore work", "false conservation"] },
    "math.atom.200": { model: ["source + boundary", "Poisson equation", "selected field"], trap: ["Neumann derivative", "ignore constant", "false uniqueness"] },
    "math.atom.201": { model: ["spatial derivative", "frequency multiplier", "mode evolution"], trap: ["mix conventions", "wrong 2π", "wrong transform"] },
    "math.atom.202": { model: ["multiply by test", "integrate by parts", "weak equation"], trap: ["boundary term", "discard blindly", "wrong form"] },
    "math.atom.203": { model: ["grid points", "centered stencil", "sparse system"], trap: ["edge node", "omit data", "wrong RHS"] },
    "math.atom.204": { model: ["local consistency", "stability bound", "global convergence"], trap: ["good stencil", "unstable step", "divergent solve"] },
    "math.atom.205": { model: ["primal constraint", "Lagrangian bound", "duality gap"], trap: ["nonconvex", "assume strong dual", "false certificate"] },
    "math.atom.206": { model: ["smooth gradient", "proximal map", "sparse update"], trap: ["nonsmooth kink", "differentiate", "undefined step"] },
    "math.atom.207": { model: ["smooth convex", "look-ahead momentum", "rate bound"], trap: ["any momentum", "claim fast rate", "missing assumptions"] },
    "math.atom.208": { model: ["gradient + Hessian", "Newton direction", "damped update"], trap: ["indefinite Hessian", "full step", "saddle"] },
    "math.atom.209": { model: ["sampled gradient", "unbiased expectation", "noisy update"], trap: ["one sample", "claim guaranteed descent", "variance"] },
    "math.atom.210": { model: ["stationary candidates", "boundary values", "global comparison"], trap: ["KKT point", "claim global", "other minima"] },
    "math.atom.211": { model: ["min player", "max player", "saddle dynamics"], trap: ["simultaneous steps", "rotation", "divergence"] },
    "math.atom.212": { model: ["theorem metric", "assumptions", "reproduction"], trap: ["headline rate", "ignore cost", "false comparison"] },
    "math.atom.213": { model: ["measurable target", "inverse image", "source sigma-algebra"], trap: ["continuity", "assume necessary", "miss indicators"] },
    "math.atom.214": { model: ["disjoint sets", "countable union", "sum of sizes"], trap: ["outer measure", "assume additive", "nonmeasurable set"] },
    "math.atom.215": { model: ["simple functions", "supremum integral", "signed parts"], trap: ["infinite positive", "infinite negative", "undefined difference"] },
    "math.atom.216": { model: ["pointwise limit", "uniform dominator", "integral limit"], trap: ["moving spike", "pointwise zero", "area remains"] },
    "math.atom.217": { model: ["product measure", "Tonelli / Fubini", "iterated integral"], trap: ["signed unbounded", "swap blindly", "false equality"] },
    "math.atom.218": { model: ["p-power integral", "L-p norm", "function class"], trap: ["pointwise spike", "essential norm", "wrong maximum"] },
    "math.atom.219": { model: ["absolute continuity", "density", "integrated measure"], trap: ["point mass", "force density", "null-set conflict"] },
    "math.atom.220": { model: ["signed measure", "positive / negative parts", "total variation"], trap: ["net zero", "claim no mass", "miss cancellation"] },
    "math.atom.221": { model: ["norm", "Cauchy sequence", "limit in space"], trap: ["smooth sequence", "nonsmooth limit", "incomplete"] },
    "math.atom.222": { model: ["closed subspace", "orthogonal projection", "nearest point"], trap: ["L2 convergence", "claim pointwise", "false mode"] },
    "math.atom.223": { model: ["linear map", "unit-ball bound", "continuous operator"], trap: ["formula alone", "omit norms", "wrong boundedness"] },
    "math.atom.224": { model: ["subspace functional", "extension", "same norm"], trap: ["existence", "claim uniqueness", "unsupported"] },
    "math.atom.225": { model: ["pointwise bounds", "Banach domain", "uniform norm bound"], trap: ["incomplete domain", "swap quantifiers", "counterexample"] },
    "math.atom.226": { model: ["bounded sequence", "operator images", "convergent subsequence"], trap: ["bounded identity", "assume compact", "unit vectors"] },
    "math.atom.227": { model: ["T minus lambda I", "inverse test", "spectrum"], trap: ["no eigenvector", "claim resolvent", "unbounded inverse"] },
    "math.atom.228": { model: ["rough function", "test pairing", "weak derivative"], trap: ["Dirac delta", "ordinary function", "invalid point value"] },
    "math.atom.229": { model: ["basis neighborhoods", "open unions", "continuous preimages"], trap: ["arbitrary intersection", "assume open", "false topology"] },
    "math.atom.230": { model: ["open cover", "finite subcover", "compactness"], trap: ["closed + bounded", "apply anywhere", "wrong theorem"] },
    "math.atom.231": { model: ["product rectangles", "quotient preimages", "new topology"], trap: ["picture alone", "guess openness", "wrong quotient"] },
    "math.atom.232": { model: ["based loop", "homotopy", "winding class"], trap: ["leave space", "contract loop", "invalid path"] },
    "math.atom.233": { model: ["local chart", "smooth overlap", "global manifold"], trap: ["single angle", "cross seam", "coordinate failure"] },
    "math.atom.234": { model: ["curve velocity", "tangent vector", "covector reading"], trap: ["no metric", "call gradient intrinsic", "missing structure"] },
    "math.atom.235": { model: ["oriented form", "exterior derivative", "boundary integral"], trap: ["swap wedge", "forget sign", "wrong orientation"] },
    "math.atom.236": { model: ["oriented region", "d omega", "oriented boundary"], trap: ["hole boundary", "omit component", "wrong total"] },
  "algo.scale": {
    model: ["10 inputs", "45 comparisons", "fine"],
    trap: ["1M inputs", "500B comparisons", "not viable"],
  },
  "algo.operation-count": {
    model: ["mark operation", "count repeats", "derive total"],
    trap: ["count lines", "miss hidden scan", "wrong cost"],
  },
  "algo.asymptotics": {
    model: ["exact count", "dominant term", "growth class"],
    trap: ["loose bound", "no case", "weak claim"],
  },
  "algo.growth-classes": {
    model: ["code structure", "state progress", "growth class"],
    trap: ["spot one loop", "guess a label", "wrong bound"],
  },
  "algo.dominant-growth": {
    model: ["growth first", "benchmark constants", "real choice"],
    trap: ["same Big O", "ignore constants", "slower system"],
  },
  "algo.space-cost": {
    model: ["input + output", "temporary peak", "state both"],
    trap: ["hidden copy", "stack + buffers", "memory spike"],
  },
  "algo.amortized-cost": {
    model: ["many cheap ops", "rare rebuild", "bounded sequence"],
    trap: ["one resize", "worst latency", "call it always O(1)"],
  },
  "algo.analysis-cases": {
    model: ["name assumptions", "choose case", "defensible bound"],
    trap: ["say average", "no distribution", "empty claim"],
  },
  "ml.vector-operations": {
    model: ["ordered features", "shape + meaning", "valid vector"],
    trap: ["same length", "swapped meaning", "silent bug"],
  },
  "ml.dot-product-geometry": {
    model: ["feature × weight", "sum evidence", "one score"],
    trap: ["raw magnitudes", "large dot", "false similarity"],
  },
  "ml.norm-families": {
    model: ["vector difference", "chosen norm", "distance"],
    trap: ["mixed units", "one axis dominates", "bad geometry"],
  },
  "loop-control": {
    model: ["condition", "body + progress", "next check"],
    trap: ["continue early", "skip progress", "same state forever"],
  },
  calls: {
    model: ["arguments", "function call", "return value"],
    trap: ["function name", "no call", "no result"],
  },
  "first-function": {
    model: ["input", "double", "output"],
    trap: ["hard-coded value", "one case", "not reusable"],
  },
  functions: {
    model: ["parameters", "function body", "return"],
    trap: ["hidden side effect", "surprise change", "fragile caller"],
  },
  arguments: {
    model: ["positional + named", "bind parameters", "run body"],
    trap: ["shared default", "later calls", "leaked state"],
  },
  scope: {
    model: ["local", "enclosing", "global"],
    trap: ["reach outward", "mutate state", "hard to reason"],
  },
  decorators: {
    model: ["function", "wrapper", "enhanced call"],
    trap: ["drop metadata", "opaque wrapper", "poor debugging"],
  },
  branching: {
    model: ["condition", "matching branch", "continue"],
    trap: ["broad check first", "early match", "specific case lost"],
  },
  method: {
    model: ["constraints", "brute force", "better invariant"],
    trap: ["keyword guess", "memorized trick", "no proof"],
  },
  comprehensions: {
    model: ["source items", "map / filter", "new collection"],
    trap: ["nested puzzle", "hidden logic", "hard to review"],
  },
  sorting: {
    model: ["items", "key function", "ordered copy"],
    trap: ["in-place sort", "returns None", "lost result"],
  },
  iterators: {
    model: ["iterable", "next", "one value"],
    trap: ["consume stream", "ask again", "already exhausted"],
  },
  itertools: {
    model: ["lazy inputs", "combine", "lazy output"],
    trap: ["infinite source", "materialize all", "never finishes"],
  },
  imports: {
    model: ["module", "import name", "use here"],
    trap: ["top-level work", "import", "surprise effect"],
  },
  modules: {
    model: ["public API", "module boundary", "caller"],
    trap: ["A imports B", "B imports A", "half-built module"],
  },
  classes: {
    model: ["constructor input", "instance", "method call"],
    trap: ["class for everything", "extra ceremony", "less clarity"],
  },
  dataclasses: {
    model: ["field values", "dataclass", "record object"],
    trap: ["shared list default", "many instances", "same list"],
  },
  composition: {
    model: ["small objects", "compose", "flexible behavior"],
    trap: ["deep inheritance", "tight coupling", "fragile override"],
  },
  protocols: {
    model: ["needed behavior", "protocol", "many types"],
    trap: ["concrete class", "unneeded methods", "tight coupling"],
  },
  exceptions: {
    model: ["risky operation", "specific except", "recovery"],
    trap: ["bare except", "swallow bug", "no evidence"],
  },
  contexts: {
    model: ["acquire", "with block", "always release"],
    trap: ["open resource", "exception", "leak"],
  },
  "files-json": {
    model: ["bytes / JSON", "parse + validate", "trusted value"],
    trap: ["valid syntax", "wrong shape", "late crash"],
  },
  typing: {
    model: ["boundary", "type contract", "editor check"],
    trap: ["Any", "check disabled", "mistake spreads"],
  },
  testing: {
    model: ["input", "assert behavior", "regression proof"],
    trap: ["implementation detail", "brittle test", "false alarm"],
  },
  debugging: {
    model: ["reproduce", "inspect evidence", "smallest cause"],
    trap: ["random edits", "new variables", "worse mystery"],
  },
  performance: {
    model: ["measure", "find bottleneck", "change algorithm"],
    trap: ["guess", "micro-tweak", "same bottleneck"],
  },
  asyncio: {
    model: ["I/O task A + B", "await overlap", "both done"],
    trap: ["CPU work", "blocked loop", "all tasks freeze"],
  },
  parallelism: {
    model: ["CPU jobs", "process workers", "parallel result"],
    trap: ["tiny jobs", "copy overhead", "slower total"],
  },
  idempotency: {
    model: ["request + key", "atomic check", "apply once"],
    trap: ["retry race", "check then write", "double effect"],
  },
  "cache-reasoning": {
    model: ["request", "cache policy", "hit / miss"],
    trap: ["no reuse", "large cache", "still misses"],
  },
  "capacity-estimation": {
    model: ["traffic", "peak assumption", "safe capacity"],
    trap: ["average only", "hidden burst", "outage"],
  },
  "api-contracts": {
    model: ["untrusted input", "validate boundary", "trusted core"],
    trap: ["late validation", "mixed failures", "unclear caller"],
  },
  "ml-shapes": {
    model: ["rows x features", "weights", "one score / row"],
    trap: ["shape mismatch", "wrong axis", "invalid output"],
  },
  "data-leakage": {
    model: ["train only", "fit transform", "validate later"],
    trap: ["all data", "fit first", "leaked metric"],
  },
  "classification-metrics": {
    model: ["predictions", "confusion counts", "precision / recall"],
    trap: ["accuracy only", "rare class", "misleading score"],
  },
  "gradient-descent": {
    model: ["current weight", "gradient step", "lower loss"],
    trap: ["huge step", "overshoot", "diverge"],
  },
  "expected-value": {
    model: ["outcomes", "probability weights", "long-run average"],
    trap: ["best outcome", "ignore odds", "bad decision"],
  },
  "bayes-rule": {
    model: ["prior", "new evidence", "updated belief"],
    trap: ["test accuracy", "ignore base rate", "false certainty"],
  },
  combinatorics: {
    model: ["available choices", "count structure", "total ways"],
    trap: ["list every case", "explosion", "never finish"],
  },
  "monte-carlo": {
    model: ["random samples", "average", "uncertainty"],
    trap: ["few samples", "precise digits", "false confidence"],
  },
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
  if (
    topic &&
    [
      "math.atom.7",
      "math.atom.8",
      "math.atom.10",
      "math.atom.11",
      "math.atom.12",
    ].includes(topic)
  ) {
    return <LimitPlot topic={topic} variant={variant} />;
  }
  if (
    topic &&
    ["math.atom.17", "math.atom.18", "math.atom.20", "math.atom.21"].includes(
      topic,
    )
  ) {
    return <DerivativePlot topic={topic} variant={variant} />;
  }
  const flow = (topic && TOPIC_FLOWS[topic]) || FLOWS[kind];
  if (flow)
    return <Flow kind={kind} variant={variant} labels={flow[variant]} />;

  if (kind === "types") {
    return (
      <div className={`guided-visual types ${variant}`}>
        <b>
          <code>3</code>
          <small>int</small>
        </b>
        <b>
          <code>3.0</code>
          <small>float</small>
        </b>
        <b className={variant === "trap" ? "warn" : "active"}>
          <code>"3"</code>
          <small>str</small>
        </b>
      </div>
    );
  }
  if (kind === "reference") {
    return (
      <div className={`guided-visual reference ${variant}`}>
        <b>a</b>
        <b>b</b>
        <span>→</span>
        <em>{variant === "trap" ? "shared mutation" : "one list object"}</em>
      </div>
    );
  }
  if (kind === "hash") {
    return (
      <div className={`guided-visual hash ${variant}`}>
        <span>{variant === "trap" ? "two keys" : "key"}</span>
        <i>hash</i>
        <b>{variant === "trap" ? "collision" : "bucket"}</b>
        <em>{variant === "trap" ? "resolve" : "O(1) avg"}</em>
      </div>
    );
  }
  if (kind === "stack") {
    const values = variant === "trap" ? ["(", "[", ") ✕"] : ["}", "]", ")"];
    return (
      <div className={`guided-visual stack ${variant}`}>
        <small>top</small>
        {values.map((value) => (
          <b key={value}>{value}</b>
        ))}
      </div>
    );
  }
  if (kind === "heap") {
    return (
      <div className="guided-visual nodes heap">
        <b className="n1">1</b>
        <b className="n2">3</b>
        <b className="n3">5</b>
        <b className="n4">8</b>
        <i className="e1" />
        <i className="e2" />
        <i className="e3" />
      </div>
    );
  }
  if (kind === "tree" || kind === "recursion") {
    return (
      <div className={`guided-visual nodes ${kind}`}>
        <b className="n1">root</b>
        <b className="n2">L</b>
        <b className="n3">R</b>
        <b className="n4">base</b>
        <i className="e1" />
        <i className="e2" />
        <i className="e3" />
      </div>
    );
  }
  if (kind === "graph" || kind === "backtracking") {
    return (
      <div className={`guided-visual nodes ${kind}`}>
        <b className="n1">A</b>
        <b className="n2">B</b>
        <b className="n3">C</b>
        <b className="n4">D</b>
        <i className="e1" />
        <i className="e2" />
        <i className="e3" />
        <span>frontier →</span>
      </div>
    );
  }
  if (kind === "dp") {
    return (
      <div className="guided-visual dp">
        {Array.from({ length: 12 }, (_, i) => (
          <i key={i} className={i < 7 ? "known" : i === 7 ? "now" : ""}>
            {i < 8 ? i : "?"}
          </i>
        ))}
      </div>
    );
  }
  if (kind === "prefix") {
    const values = variant === "trap" ? [0, 3, 2, "?", 8] : [0, 3, 2, 6, 8];
    return (
      <div className={`guided-visual dp prefix ${variant}`}>
        {values.map((value, index) => (
          <i
            key={index}
            className={index < 3 ? "known" : index === 3 ? "now" : ""}
          >
            {value}
          </i>
        ))}
      </div>
    );
  }
  if (kind === "intervals") {
    return (
      <div className="guided-visual intervals">
        <i style={{ left: "5%", width: "42%" }} />
        <i style={{ left: "30%", width: "38%" }} />
        <b style={{ left: "5%", width: "63%" }}>merged frontier</b>
      </div>
    );
  }

  // ---- Foundational-concept visuals -------------------------------------
  if (kind === "variable") {
    return (
      <div className={`guided-visual variable ${variant}`}>
        <b>{variant === "trap" ? "old name" : "name"}</b>
        <span>=</span>
        <b className="val">{variant === "trap" ? "wrong type" : "value"}</b>
      </div>
    );
  }
  if (kind === "function") {
    return (
      <div className="guided-visual function">
        <b>in</b>
        <span>→</span>
        <b className="fn">f( )</b>
        <span>→</span>
        <b className="out">out</b>
      </div>
    );
  }
  if (kind === "list") {
    const values = LIST_VALUES[topic ?? ""] ?? LIST_VALUES.lists;
    return (
      <div className="guided-visual list">
        {values.map((value, index) => (
          <i key={index} data-i={index} className={index === 1 ? "active" : ""}>
            {value}
          </i>
        ))}
      </div>
    );
  }
  if (kind === "string") {
    const values = STRING_VALUES[topic ?? ""] ?? STRING_VALUES.strings;
    return (
      <div className="guided-visual string">
        {values.map((value, index) => (
          <i key={index} data-i={index} className={index === 1 ? "active" : ""}>
            {value}
          </i>
        ))}
      </div>
    );
  }
  if (kind === "loop") {
    const values = topic === "iteration-tools" ? [0, 1, 2] : [2, 4, 6];
    const result =
      topic === "iteration-tools"
        ? "index 1"
        : topic === "aggregation-tools"
          ? "total 12"
          : "total 6";
    return (
      <div className="guided-visual loop">
        {values.map((value, index) => (
          <i key={index} className={index === 1 ? "active" : ""}>
            {value}
          </i>
        ))}
        <b>{result}</b>
      </div>
    );
  }
  if (kind === "boolean") {
    return (
      <div className={`guided-visual boolean ${variant}`}>
        <b className="t">True</b>
        <b className="f">False</b>
        {variant === "trap" ? <small>truthy ≠ literally True</small> : null}
      </div>
    );
  }

  return (
    <div className={`guided-visual array ${kind}`}>
      {BOXES.map((value, index) => (
        <i
          key={index}
          className={
            (kind === "window" && index >= 1 && index <= 3) ||
            (kind === "binary" && index >= 2 && index <= 4)
              ? "active"
              : ""
          }
        >
          {value}
        </i>
      ))}
      {kind === "pointers" ? (
        <>
          <b className="left">L ↑</b>
          <b className="right">↑ R</b>
        </>
      ) : null}
      {kind === "window" ? <b className="window-label">valid window</b> : null}
      {kind === "binary" ? (
        <b className="window-label">remaining search space</b>
      ) : null}
    </div>
  );
}

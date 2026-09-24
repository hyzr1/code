import {
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import {
  BAND_BY_LEVEL,
  COMPANY_TARGETS,
  PREPARATION_BANDS,
  targetFor,
  type PreparationLevel,
} from "../content/companies";

interface GraphPoint {
  x: number;
  y: number;
}

interface GraphEdge {
  from: string;
  to: string;
  kind: "cluster" | "bridge";
}

interface GraphDimensions {
  width: number;
  height: number;
}

type LayoutMode = "wide" | "medium" | "phone";

const GRAPH_LAYOUTS: Record<LayoutMode, {
  dimensions: GraphDimensions;
  centers: Record<PreparationLevel, GraphPoint>;
  radii: ReadonlyArray<readonly [number, number]>;
  orbit: readonly [number, number];
  labelOffset: number;
}> = {
  wide: {
    dimensions: { width: 2500, height: 1500 },
    centers: {
      5: { x: 450, y: 430 },
      4: { x: 1250, y: 380 },
      3: { x: 2050, y: 430 },
      2: { x: 1650, y: 1120 },
      1: { x: 850, y: 1120 },
    },
    radii: [[110, 76], [200, 138], [290, 202], [380, 270]],
    orbit: [420, 310],
    labelOffset: 340,
  },
  medium: {
    dimensions: { width: 1700, height: 2600 },
    centers: {
      5: { x: 450, y: 430 },
      4: { x: 1250, y: 430 },
      3: { x: 450, y: 1300 },
      2: { x: 1250, y: 1300 },
      1: { x: 850, y: 2170 },
    },
    radii: [[110, 82], [200, 150], [290, 220], [380, 290]],
    orbit: [420, 330],
    labelOffset: 360,
  },
  phone: {
    dimensions: { width: 1000, height: 5000 },
    centers: {
      5: { x: 500, y: 500 },
      4: { x: 500, y: 1500 },
      3: { x: 500, y: 2500 },
      2: { x: 500, y: 3500 },
      1: { x: 500, y: 4500 },
    },
    radii: [[120, 88], [220, 165], [325, 250], [430, 340]],
    orbit: [468, 390],
    labelOffset: 425,
  },
};

function initialsFor(name: string) {
  return name
    .split(/\s+/)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function CompanyLogo({ id, name }: { id: string; name: string }) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  return (
    <span className={`company-logo ${loaded ? "has-logo" : ""}`} aria-hidden="true">
      <span>{initialsFor(name)}</span>
      {!failed ? (
        <img
          className={loaded ? "loaded" : ""}
          src={`/company-logos/${id}.ico`}
          alt=""
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
        />
      ) : null}
    </span>
  );
}

function createPoints(mode: LayoutMode) {
  const points = new Map<string, GraphPoint>();
  const layout = GRAPH_LAYOUTS[mode];

  for (const band of PREPARATION_BANDS) {
    const companies = COMPANY_TARGETS.filter((company) => company.level === band.level);
    const center = layout.centers[band.level];
    companies.forEach((company, index) => {
      const rings = [
        { start: 0, count: 8 },
        { start: 8, count: 10 },
        { start: 18, count: 10 },
        { start: 28, count: 12 },
      ] as const;
      const ring = rings.find(({ start, count }) => index >= start && index < start + count)!;
      const ringIndex = index - ring.start;
      const [radiusX, radiusY] = layout.radii[rings.indexOf(ring)];
      const offset = band.level * 0.31 + ring.start * 0.013;
      const angle = (ringIndex / ring.count) * Math.PI * 2 + offset;
      points.set(company.id, {
        x: center.x + Math.cos(angle) * radiusX,
        y: center.y + Math.sin(angle) * radiusY,
      });
    });
  }

  return points;
}

function createEdges() {
  const edges: GraphEdge[] = [];
  for (const band of PREPARATION_BANDS) {
    const companies = COMPANY_TARGETS.filter((company) => company.level === band.level);
    for (const ring of [
      { start: 0, count: 8 },
      { start: 8, count: 10 },
      { start: 18, count: 10 },
      { start: 28, count: 12 },
    ]) {
      for (let offset = 0; offset < ring.count; offset += 1) {
        const index = ring.start + offset;
        const next = ring.start + ((offset + 1) % ring.count);
        edges.push({ from: companies[index].id, to: companies[next].id, kind: "cluster" });
      }
    }
    for (let index = 0; index < 8; index += 1) {
      edges.push({ from: companies[index].id, to: companies[8 + index].id, kind: "cluster" });
      edges.push({ from: companies[8 + index].id, to: companies[18 + index].id, kind: "cluster" });
      edges.push({ from: companies[18 + index].id, to: companies[28 + index].id, kind: "cluster" });
    }
  }

  const levels: PreparationLevel[] = [5, 4, 3, 2, 1];
  for (let levelIndex = 0; levelIndex < levels.length - 1; levelIndex += 1) {
    const current = COMPANY_TARGETS.filter((company) => company.level === levels[levelIndex]);
    const next = COMPANY_TARGETS.filter((company) => company.level === levels[levelIndex + 1]);
    for (const index of [0, 8, 18, 28, 36]) {
      edges.push({ from: current[index].id, to: next[index].id, kind: "bridge" });
    }
  }
  return edges;
}

const GRAPH_EDGES = createEdges();

export default function CompanyMap({
  selectedId,
  onSelect,
}: {
  selectedId: string;
  onSelect: (companyId: string) => void;
}) {
  const [viewport, setViewport] = useState({ width: 0, height: 0 });
  const graphRef = useRef<HTMLDivElement>(null);
  const selected = targetFor(selectedId);
  const mode: LayoutMode = viewport.width > 0 && viewport.width < 480
    ? "phone"
    : viewport.width > 0 && viewport.width < 1000
      ? "medium"
      : "wide";
  const layout = GRAPH_LAYOUTS[mode];
  const { dimensions, centers } = layout;
  const points = useMemo(() => createPoints(mode), [mode]);

  useLayoutEffect(() => {
    const element = graphRef.current;
    if (!element) return undefined;
    const measure = () => {
      const rect = element.getBoundingClientRect();
      setViewport({ width: rect.width, height: rect.height });
    };
    const observer = new ResizeObserver(([entry]) => {
      setViewport({
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      });
    });
    observer.observe(element);
    measure();
    return () => observer.disconnect();
  }, []);

  const activeId = selected.id;
  const scale = viewport.width
    ? (viewport.width - 20) / dimensions.width
    : 1;
  const graphStyle = {
    width: dimensions.width,
    height: dimensions.height,
    opacity: viewport.width ? 1 : 0,
    transform: `translate3d(10px, 10px, 0) scale(${scale})`,
  } as CSSProperties;
  const graphHeight = viewport.width
    ? Math.round((viewport.width - 20) * dimensions.height / dimensions.width + 20)
    : 660;

  return (
    <section
      className="company-map card"
      aria-label="Choose a target company from the preparation graph"
    >
      <div
        ref={graphRef}
        className={`company-graph layout-${mode}`}
        style={{ height: graphHeight }}
      >
        <div className="company-graph-world" style={graphStyle} aria-live="polite">
          <svg
            className="company-graph-lines"
            viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
            width={dimensions.width}
            height={dimensions.height}
            aria-hidden="true"
          >
            <defs>
              <filter id="company-edge-glow" x="-40%" y="-40%" width="180%" height="180%">
                <feGaussianBlur stdDeviation="2.4" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>
            {PREPARATION_BANDS.map((band) => {
              const center = centers[band.level];
              return (
                <g
                  className="company-cluster-orbit"
                  key={band.level}
                  style={{ "--band-color": band.accent } as CSSProperties}
                >
                  <ellipse
                    cx={center.x}
                    cy={center.y}
                    rx={layout.orbit[0]}
                    ry={layout.orbit[1]}
                  />
                  <text x={center.x} y={center.y - layout.labelOffset}>
                    0{band.level} · {band.shortLabel}
                  </text>
                </g>
              );
            })}
            {GRAPH_EDGES.map((edge, index) => {
              const from = points.get(edge.from)!;
              const to = points.get(edge.to)!;
              const active = edge.from === activeId || edge.to === activeId;
              return (
                <line
                  key={`${edge.from}-${edge.to}-${index}`}
                  className={`company-edge ${edge.kind} ${active ? "active" : ""}`}
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                />
              );
            })}
          </svg>

          {COMPANY_TARGETS.map((company, index) => {
            const point = points.get(company.id)!;
            const band = BAND_BY_LEVEL.get(company.level)!;
            const active = company.id === selected.id;
            return (
              <button
                type="button"
                className={`company-graph-node ${active ? "active" : ""}`}
                key={company.id}
                aria-label={company.name}
                aria-pressed={active}
                style={{
                  left: point.x,
                  top: point.y,
                  "--band-color": band.accent,
                  "--float-delay": `${-(index % 13) * 0.31}s`,
                } as CSSProperties}
                onClick={() => {
                  onSelect(company.id);
                  localStorage.setItem("forge.company-map.chosen.v1", "yes");
                }}
              >
                <span className="company-node-core">
                  <CompanyLogo id={company.id} name={company.name} />
                  <span className="company-node-pulse" />
                </span>
                <span className="company-node-label">
                  <strong>{company.name}</strong>
                  <small>{band.shortLabel}</small>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

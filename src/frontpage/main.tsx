import { StrictMode, useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import Sculpture from "./Sculpture";
import "@fontsource-variable/inter/wght.css";
import "./frontpage.css";

function Arrow({ diagonal = false }: { diagonal?: boolean }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
    >
      {diagonal ? (
        <path d="M6 18 18 6M6 6h12v12" />
      ) : (
        <path d="M4 12h15m-6-6 6 6-6 6" />
      )}
    </svg>
  );
}
const chapters = [
  {
    tag: "01 / SEE IT",
    title: "An idea.\nMade visible.",
    body: "Some things click when you see them. Follow narrated, animated lectures that turn abstract concepts into something you can actually picture.",
    link: "Explore the lectures",
    href: "/courses/python",
  },
  {
    tag: "02 / BUILD IT",
    title: "Understanding\nis hands-on.",
    body: "Move from the explanation to the editor. Write real Python, run your code, and get feedback while the idea is still fresh.",
    link: "Try a coding problem",
    href: "/problems",
  },
  {
    tag: "03 / KEEP IT",
    title: "Make progress\nthat stays.",
    body: "Bring yesterday’s ideas into today’s practice. Quick checks and spaced reviews help you find the gaps and keep building on what you know.",
    link: "Start a daily session",
    href: "/practice/daily",
  },
];
const paths = [
  {
    n: "01",
    name: "Python engineering",
    desc: "Your first program to software you can stand behind.",
    tags: "FUNDAMENTALS / PROJECTS / ENGINEERING",
    href: "/courses/python",
    art: "python",
  },
  {
    n: "02",
    name: "Algorithms & interviews",
    desc: "Recognize the pattern. Reason through the problem.",
    tags: "DATA STRUCTURES / DSA / SYSTEMS DESIGN",
    href: "/courses/dsa",
    art: "algo",
  },
  {
    n: "03",
    name: "Machine learning",
    desc: "Understand the mathematics. Build the intelligence.",
    tags: "FOUNDATIONS / NEURAL NETWORKS / MODELS",
    href: "/courses/machine-learning",
    art: "ml",
  },
];

function Demo({ chapter }: { chapter: number }) {
  const [mode, setMode] = useState<"visual" | "code">("visual");
  const [answer, setAnswer] = useState<number | null>(null);
  const [ran, setRan] = useState(false);
  useEffect(() => {
    setMode(chapter === 1 ? "code" : "visual");
  }, [chapter]);
  return (
    <div className="demo-window">
      <div className="demo-top">
        <span className="window-dots">
          <i />
          <i />
          <i />
        </span>
        <span>YOUR LEARNING WORKSPACE</span>
        <span>↗</span>
      </div>
      <div className="demo-body">
        <div className="demo-breadcrumb">
          PYTHON / THE FOUNDATIONS <span>04</span>
        </div>
        <div className="demo-heading">
          <h3>
            {chapter === 2
              ? "A little recall. A lot of progress."
              : "Small steps. Powerful ideas."}
          </h3>
          <span className="demo-pill">
            {chapter === 2 ? "REVIEW" : "INTERACTIVE LESSON"}
          </span>
        </div>
        {chapter === 2 ? (
          <div className="review-demo">
            <p className="mono">A QUICK CHECK</p>
            <h4>Which operation adds an item to the end of a Python list?</h4>
            <div className="answers">
              {["items.append(value)", "items.pop()", "items.clear()"].map(
                (text, i) => (
                  <button
                    key={text}
                    className={answer === i ? "selected" : ""}
                    onClick={() => setAnswer(i)}
                  >
                    <span>{String.fromCharCode(65 + i)}</span>
                    {text}
                    <span>{answer === i ? "←" : ""}</span>
                  </button>
                ),
              )}
            </div>
            <p className="answer-feedback" aria-live="polite">
              {answer === null
                ? "A moment of effort makes the idea stick."
                : answer === 0
                  ? "Exactly. append() adds one item to the end of the list."
                  : "Try again. This operation removes items from the list."}
            </p>
          </div>
        ) : (
          <>
            <div className="demo-tabs" role="group" aria-label="Lesson view">
              <button
                aria-pressed={mode === "visual"}
                onClick={() => setMode("visual")}
              >
                Visualize
              </button>
              <button
                aria-pressed={mode === "code"}
                onClick={() => setMode("code")}
              >
                Read the code
              </button>
            </div>
            {mode === "visual" ? (
              <div className="visual-demo">
                <div className="array-caption">
                  <span>ONE LIST. MANY POSSIBILITIES.</span>
                  <span>list[int]</span>
                </div>
                <div className="array">
                  {[2, 4, 8, 16].map((v, i) => (
                    <div key={v} style={{ animationDelay: `${i * 180}ms` }}>
                      <b>{v}</b>
                      <span>{i}</span>
                    </div>
                  ))}
                  <span className="array-arrow">→</span>
                  <div className="array-new">
                    <b>32</b>
                    <span>4</span>
                  </div>
                </div>
                <div className="code-line">
                  numbers<span>.</span>append<span>(</span>32<span>)</span>
                </div>
                <p>Grow the sequence, one element at a time.</p>
                <div className="lesson-timeline">
                  <span />
                  <i />
                </div>
                <div className="timeline-caption">
                  <span>02:14</span>
                  <span>LISTS & SEQUENCES</span>
                  <span>06:30</span>
                </div>
              </div>
            ) : (
              <div className="code-demo">
                <div className="code-file">
                  sequence.py <span>PYTHON 3</span>
                </div>
                <pre>
                  <code>
                    <span className="code-muted">
                      # Build a sequence. See what happens.
                    </span>
                    {
                      "\nnumbers = [2, 4, 8, 16]\nnumbers.append(32)\n\nfor number in numbers:\n    print(number)"
                    }
                  </code>
                </pre>
                <div className="run-row">
                  <span aria-live="polite">
                    {ran ? "2  4  8  16  32" : "Output appears here"}
                  </span>
                  <button onClick={() => setRan(true)}>
                    Run example <span>▷</span>
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      <div className="demo-bottom">
        <span>
          <i /> LEARN AT YOUR OWN PACE
        </span>
        <span>{chapter + 1} / 3</span>
      </div>
    </div>
  );
}

function Frontpage() {
  const [menu, setMenu] = useState(false);
  const [paused, setPaused] = useState(
    () => matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const [chapter, setChapter] = useState(0);
  const story = useRef<HTMLElement>(null);
  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const change = () => setPaused(media.matches);
    media.addEventListener("change", change);
    const reveals = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            reveals.unobserve(e.target);
          }
        }),
      { threshold: 0.12 },
    );
    document
      .querySelectorAll("[data-reveal]")
      .forEach((el) => reveals.observe(el));
    let raf = 0;
    const update = () => {
      raf = 0;
      const section = story.current;
      if (!section) return;
      const rect = section.getBoundingClientRect();
      const p = Math.max(
        0,
        Math.min(1, -rect.top / (rect.height - innerHeight)),
      );
      setChapter(Math.min(2, Math.floor(p * 3)));
      document.documentElement.style.setProperty(
        "--page-progress",
        String(
          scrollY /
            Math.max(1, document.documentElement.scrollHeight - innerHeight),
        ),
      );
    };
    const scroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    addEventListener("scroll", scroll, { passive: true });
    addEventListener("resize", scroll);
    update();
    const escape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenu(false);
    };
    addEventListener("keydown", escape);
    return () => {
      reveals.disconnect();
      media.removeEventListener("change", change);
      removeEventListener("scroll", scroll);
      removeEventListener("resize", scroll);
      removeEventListener("keydown", escape);
      cancelAnimationFrame(raf);
    };
  }, []);
  return (
    <div className={`frontpage ${paused ? "motion-paused" : ""}`}>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <div className="page-progress" />
      <header className="front-nav">
        <a className="brand" href="/frontpage" aria-label="Hyzr Code home">
          <img src="/hyzr-mark.png" alt="" />
          <span className="beta-label">BETA</span>
        </a>
        <nav
          aria-label="Main navigation"
          className={menu ? "nav-links open" : "nav-links"}
        >
          <a href="#experience" onClick={() => setMenu(false)}>
            The experience
          </a>
          <a href="#paths" onClick={() => setMenu(false)}>
            Learning paths
          </a>
          <a
            href="https://github.com/hyzr1/code"
            target="_blank"
            rel="noreferrer"
          >
            Open source <Arrow diagonal />
          </a>
        </nav>
        <a className="nav-launch" href="/courses/python">
          Enter the platform <Arrow />
        </a>
        <button
          className="menu-toggle"
          aria-label={menu ? "Close menu" : "Open menu"}
          aria-expanded={menu}
          onClick={() => setMenu(!menu)}
        >
          {menu ? "−" : "+"}
        </button>
      </header>
      <main id="main">
        <section className="hero">
          <div className="hero-grid" />
          <Sculpture paused={paused} />
          <div className="hero-content">
            <div className="eyebrow">
              <span className="status-dot" /> A NEW WAY TO LEARN TO CODE
            </div>
            <h1>
              Don’t just know.
              <br />
              <span>Understand.</span>
            </h1>
            <p>
              Make the leap from following along
              <br className="desktop-break" /> to figuring it out.
            </p>
            <div className="hero-actions">
              <a className="button button-light" href="/courses/python">
                Start learning <Arrow />
              </a>
              <a className="text-link" href="#experience">
                Explore the experience <span>↓</span>
              </a>
            </div>
            <div className="hero-footnote">
              FREE TO EXPLORE. BUILT FOR YOUR CURIOSITY.
            </div>
          </div>
          <div className="hero-floor">
            <a href="#experience">
              <span className="scroll-mark">↓</span> SCROLL TO DISCOVER
            </a>
            <button onClick={() => setPaused(!paused)} aria-pressed={paused}>
              {paused ? "▷ Play motion" : "Ⅱ Pause motion"}
            </button>
            <span>CODE. CONNECT. CREATE.</span>
          </div>
        </section>
        <div className="discipline-strip">
          <span>
            ONE PLATFORM.
            <br />A WORLD TO UNDERSTAND.
          </span>
          <div>
            Python <i>+</i> Algorithms <i>+</i> Machine learning <i>+</i>{" "}
            Systems design
          </div>
        </div>
        <section className="intro section-shell" id="experience">
          <div className="eyebrow" data-reveal>
            01 — THE EXPERIENCE
          </div>
          <h2 data-reveal>
            Less passive watching.
            <br />
            <span>More lightbulb moments.</span>
          </h2>
          <div className="intro-bottom" data-reveal>
            <span className="intro-symbol">↳</span>
            <p>
              A concept isn’t yours because you’ve seen it.
              <br />
              It becomes yours when you can use it.
              <br />
              Everything here is built around that moment.
            </p>
          </div>
        </section>
        <section
          className="story"
          ref={story}
          aria-label="Three ways to build understanding"
        >
          <div className="story-sticky">
            <div className="story-copy">
              <div className="chapter-track">
                {chapters.map((c, i) => (
                  <button
                    key={c.tag}
                    aria-label={`Explore ${c.tag.slice(5).toLowerCase()}`}
                    aria-pressed={chapter === i}
                    onClick={() => {
                      const el = story.current!;
                      window.scrollTo({
                        top:
                          el.offsetTop +
                          (el.offsetHeight - innerHeight) * (i / 3 + 0.055),
                        behavior: paused ? "instant" : "smooth",
                      });
                    }}
                  >
                    <span className={chapter === i ? "active" : ""} />
                    {String(i + 1).padStart(2, "0")}
                  </button>
                ))}
              </div>
              <div className="chapter-copy" key={chapter}>
                <div className="eyebrow">{chapters[chapter].tag}</div>
                <h2>{chapters[chapter].title}</h2>
                <p>{chapters[chapter].body}</p>
                <a className="text-link" href={chapters[chapter].href}>
                  {chapters[chapter].link}
                  <Arrow />
                </a>
              </div>
            </div>
            <div className="story-display">
              <div className="display-orbit" />
              <Demo chapter={chapter} />
            </div>
          </div>
        </section>
        <section className="personal section-shell">
          <div className="personal-copy" data-reveal>
            <div className="eyebrow">YOUR MIND. YOUR SETTINGS.</div>
            <h2>
              Learning isn’t
              <br />
              one-size-fits-all.
            </h2>
            <p>
              Watch it. Read it. Hear it. Change the voice, the pace, the
              typography. Build a learning environment that feels like yours.
            </p>
            <a className="text-link" href="/courses/python">
              Find your way in <Arrow />
            </a>
          </div>
          <div className="personal-art" aria-hidden="true" data-reveal>
            <div className="orbital orbital-one" />
            <div className="orbital orbital-two" />
            <div className="orbital orbital-three" />
            <div className="personal-core">you</div>
            <span className="orbit-label label-a">
              Aa <small>TYPOGRAPHY</small>
            </span>
            <span className="orbit-label label-b">
              ▥ <small>VOICE</small>
            </span>
            <span className="orbit-label label-c">
              1.0× <small>PACE</small>
            </span>
            <span className="orbit-label label-d">
              ◐ <small>APPEARANCE</small>
            </span>
          </div>
        </section>
        <section className="paths section-shell" id="paths">
          <div className="paths-heading" data-reveal>
            <div>
              <div className="eyebrow">02 — FOLLOW YOUR CURIOSITY</div>
              <h2>
                Start somewhere.
                <br />
                <span>Go somewhere else entirely.</span>
              </h2>
            </div>
            <p>
              A clear path through the fundamentals.
              <br />
              Room to go much, much further.
            </p>
          </div>
          <div className="path-list">
            {paths.map((p) => (
              <a href={p.href} className="path-row" key={p.n} data-reveal>
                <span className="path-number">{p.n}</span>
                <div className={`path-art ${p.art}`} aria-hidden="true">
                  {Array.from({ length: 7 }, (_, i) => (
                    <i key={i} style={{ "--i": i } as React.CSSProperties} />
                  ))}
                </div>
                <div className="path-copy">
                  <h3>{p.name}</h3>
                  <p>{p.desc}</p>
                  <span>{p.tags}</span>
                </div>
                <span className="path-arrow">
                  <Arrow diagonal />
                </span>
              </a>
            ))}
          </div>
        </section>
        <section className="closing section-shell">
          <div className="closing-grid" />
          <div className="eyebrow" data-reveal>
            LESS FRICTION. MORE POSSIBILITY.
          </div>
          <h2 data-reveal>
            Your next
            <br />
            “I get it.”
            <br />
            <span>Starts here.</span>
          </h2>
          <a className="button button-light" href="/courses/python" data-reveal>
            Build your understanding <Arrow />
          </a>
          <p data-reveal>Open to curious minds. Free during beta.</p>
        </section>
      </main>
      <footer className="front-footer">
        <a className="brand" href="/frontpage" aria-label="Hyzr Code home">
          <img src="/hyzr-mark.png" alt="" />
          <span>Built for the way you think.</span>
        </a>
        <div>
          <a
            href="https://github.com/hyzr1/code"
            target="_blank"
            rel="noreferrer"
          >
            GitHub <Arrow diagonal />
          </a>
          <a href="https://hyzr.ai" target="_blank" rel="noreferrer">
            Made by Hyzr <Arrow diagonal />
          </a>
          <span>© {new Date().getFullYear()} HYZR CODE</span>
        </div>
      </footer>
    </div>
  );
}
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Frontpage />
  </StrictMode>,
);

# Hyzr Code

**An offline-first programming course built for genuine fluency, retrieval, and technical interviews.**

Hyzr Code teaches JavaScript and Python from first principles through advanced language mechanics and interview algorithms. Lessons combine narrated visual explanations, browser-based execution, deliberate practice, retrieval checks, scheduling, and progress tracking.

Part of the Hyzr product family. Repository: `code`. Reserved address: `code.hyzr.ai`.

## Highlights

- Ordered beginner-to-advanced JavaScript and Python curricula
- Visual, narrated lectures with ahead-of-time offline voice packs
- JavaScript and Python execution directly in the browser
- Retrieval practice, confidence calibration, and spaced scheduling
- Interview algorithms with guided traces and executable exercises
- Role-specific preparation for software, ML, quantitative, and FAANG-style interviews
- Responsive desktop and mobile interfaces with fullscreen lessons
- Local-first progress and settings

## Learning system

The course is organized around prerequisites rather than a loose list of topics. Every lesson declares the vocabulary and concepts it introduces, and automated checks verify that exercises never require knowledge before it has been taught.

| Layer | Purpose |
| --- | --- |
| Visual lectures | Explain one idea at a time with synchronized narration and code cues |
| Guided practice | Turn the explanation into a small executable task |
| Retrieval checks | Measure recall without encouraging passive rereading |
| Algorithm drills | Build pattern recognition from fundamentals through interview-level problems |
| Scheduler | Revisit weak material using local progress and confidence data |
| Role tracks | Adjust recommendations for software, ML, quantitative, and FAANG-style preparation |

The checked-in curriculum currently contains 145 lectures, 2,122 scenes, 1,315 timed code cues, and 281 executable problem units. The solution suite evaluates 868 assertions.

## Offline architecture

Hyzr Code keeps the learning loop in the browser:

- Vite, React 19, and TypeScript power the application shell.
- Pyodide runs Python exercises in a web worker.
- A sandboxed JavaScript harness evaluates JavaScript exercises.
- Kokoro voice assets and pre-generated Opus lectures remove per-slide synthesis waits.
- Progress, preferences, scheduling, and downloaded assets remain local.

The Python runtime, voice pack, and speech model are versioned with the application so a fresh clone can reproduce the offline experience.

## Run locally

```bash
npm install
npm run dev
```

## Validation

```bash
npm run typecheck
npm run check
npm run build
npm audit --omit=dev
```

The content checker validates IDs, prerequisite vocabulary, backward references, published solutions, voice coverage, and course-design quality. The current Python learning-design score is **99/100**.

## Repository map

```text
src/content/               JavaScript, Python, algorithm, and role-track curricula
src/components/            lessons, editor, practice, settings, and navigation
src/engine/                runners, scheduling, narration, storage, and workers
public/voice-packs/         pre-generated lecture narration
public/pyodide/             local Python runtime
scripts/check-*.mjs         curriculum and solution integrity checks
```

## Legacy compatibility

The former internal product name remains in a small number of browser storage and voice-pack identifiers so existing progress and downloaded assets continue to work. New customer-facing copy uses Hyzr Code.

---

A project by [Kaylem](https://github.com/hyzr1).

# Hyzr Code

[Hyzr Code](https://code.hyzr.ai) is an interactive learning platform for
Python, data structures and algorithms, machine learning, and coding interview
preparation. It pairs clear instruction with deliberate practice so learners
can build fluency, recognize patterns, and solve problems under pressure.

Built and maintained by Hyzr.

## Learning paths

| Path | What it covers |
| --- | --- |
| **Python** | Language fundamentals through practical, production-ready software engineering. |
| **Data Structures & Algorithms** | An ordered interview-prep path, including NeetCode 250, NeetCode 150, and Blind 75 study plans. |
| **Machine Learning** | The mathematics, models, and systems needed to build practical ML projects. |

The DSA workspace includes a fast local Python runner for examples, a hardened
server-side judge for hidden submission checks, progressive hints, reference
solutions, saved drafts, and a full-screen whiteboard for working through an
approach. Optional Hyzr accounts synchronize progress and preferences across
devices while the course remains usable offline.

## Run locally

Requires Node.js 20 or later.

```bash
npm install
npm run dev
```

Open the local address printed by Vite. The Python execution runtime is prepared
automatically before development and production builds.

## Content and quality checks

Regenerate the interview catalog from the MIT-licensed NeetCode source and
current LeetCode metadata:

```bash
npm run content:interview
```

Run the full validation suite and production build before deploying:

```bash
npm run check
npm run build
```

The server judge reads its hidden catalog from the project's private Vercel
Blob store. Publish a refreshed catalog after changing problem tests:

```bash
npm run judge:publish
```

This command requires the project's `BLOB_READ_WRITE_TOKEN`. Production also
uses the private store for account sync and sampled reliability telemetry.

## Technology

Hyzr Code is built with React, TypeScript, Vite, CodeMirror, and Pyodide. The
learning and execution experience is designed around Python.

import type { Atom } from "../types";
import { parseBlocks, plainText } from "./markdown";
import { forSpeech } from "./narrator";

export interface Scene {
  kind: "title" | "section" | "text";
  /** Shown on screen, with markup intact. */
  caption: string;
  /** Section this scene sits under, for the progress rail. */
  section: string;
  code?: string;
  /** False when the same code was already on screen — don't re-animate it. */
  codeIsNew?: boolean;
  /** What gets spoken. Markup stripped, symbols expanded. */
  narration: string;
  /** Lines the caption is currently explaining, 1-based. */
  focusLines?: number[];
  /**
   * One active code line at a time, keyed to normalized narration progress.
   * Unlike `focusLines` (the complete set used by audits and fallbacks), these
   * cues tell the player when the learner's eye should move.
   */
  focusSteps?: FocusStep[];
  /** Short instruction that tells the learner where to look. */
  focusLabel?: string;
  /** Compact state changes extracted from annotated code. */
  traceItems?: string[];
  /** Important terms kept visible while narration moves on. */
  keyTerms?: string[];
  /** Small code-native diagram for algorithm mental models. */
  visualKind?: VisualKind;
  /** Short lesson id used to vary a shared visual family by actual topic. */
  visualTopic?: string;
  /** The same concept shown in its normal or failure state. */
  visualVariant?: "model" | "trap";
}

export interface FocusStep {
  /** A value from 0 to 1 representing progress through the spoken passage. */
  at: number;
  /** Usually one line; kept as an array for expressions spanning two lines. */
  lines: number[];
}

export type VisualKind =
  | "hash"
  | "pointers"
  | "window"
  | "stack"
  | "intervals"
  | "binary"
  | "heap"
  | "tree"
  | "graph"
  | "backtracking"
  | "dp"
  | "recursion"
  | "program"
  | "types"
  | "reference"
  | "decision"
  | "pipeline"
  | "modules"
  | "object"
  | "resource"
  | "testing"
  | "concurrency"
  | "complexity"
  | "system"
  | "ml"
  | "probability"
  | "prefix"
  // Foundational-concept visuals, so the early lessons are never all-text.
  | "variable"
  | "list"
  | "string"
  | "loop"
  | "boolean"
  | "function";

/** Roughly 11 seconds of speech. Longer than this and attention drifts. */
const MAX_WORDS = 34;

export function splitLong(text: string): string[] {
  const spokenWords = (value: string) =>
    forSpeech(plainText(value)).split(/\s+/).filter(Boolean).length;
  if (spokenWords(text) <= MAX_WORDS) return [text];

  // An ellipsis inside a quoted thought ("and then... and also...") is a
  // pause, not a slide boundary. Protect it so the sentence splitter never
  // strands half a quotation on the next scene.
  const protectedMarks: string[] = [];
  const protectedCode: string[] = [];
  // Commas and colons inside inline code describe syntax, not narration
  // cadence. Keep each span atomic while locating prose boundaries.
  const codeProtectedText = text.replace(/`[^`]*`/g, (value) => {
    const index = protectedCode.push(value) - 1;
    return `\u0000c${index}\u0000`;
  });
  const protectedText = codeProtectedText.replace(/\b(?:e\.g\.|i\.e\.)|\.{3}/gi, (value) => {
    const index = protectedMarks.push(value) - 1;
    return `\u0000e${index}\u0000`;
  });
  // Full stops are not the only natural slide boundary. Long explanations
  // often use a semicolon, colon, or comma to introduce the next beat. Treat
  // each of those as a candidate, then pack candidates back together up to
  // the target. This keeps the cadence conversational without marooning a
  // two-word tail on its own slide.
  const parts = protectedText
    .split(/(?<=[.!?;:,])\s+/)
    .map((part) => part
      .replace(
        /\u0000e(\d+)\u0000/g,
        (_all, index) => protectedMarks[Number(index)],
      )
      .replace(
        /\u0000c(\d+)\u0000/g,
        (_all, index) => protectedCode[Number(index)],
      ));
  const chunks: string[] = [];
  let current: string[] = [];
  let count = 0;

  for (const part of parts) {
    const length = spokenWords(part);
    // A bold span may hold two sentences — "**Default to the chain. Reach for
    // the loop when you've measured.**" — and cutting between them orphans the
    // markers, so the reader shows a literal `**` and the narrator says
    // "star times". Only break where every span is closed.
    if (count + length > MAX_WORDS && current.length && closed(current.join(" "))) {
      chunks.push(current.join(" "));
      current = [];
      count = 0;
    }
    current.push(part);
    count += length;
  }
  if (current.length) chunks.push(current.join(" "));

  // A threshold should never create a robotic fragment such as "use sorted"
  // or "then unwind". Borrow it back into the preceding beat when the result
  // remains comfortably narratable.
  for (let index = chunks.length - 1; index > 0; index -= 1) {
    if (
      spokenWords(chunks[index]) < 6 &&
      spokenWords(`${chunks[index - 1]} ${chunks[index]}`) <= MAX_WORDS + 8
    ) {
      chunks[index - 1] = `${chunks[index - 1]} ${chunks[index]}`;
      chunks.splice(index, 1);
    }
  }
  return chunks;
}

/** True when no emphasis or code span is left hanging open. */
function closed(text: string): boolean {
  const pairs = (pattern: RegExp) => (text.match(pattern) ?? []).length % 2 === 0;
  // Asterisks inside complete inline-code spans are multiplication or unpacking,
  // not Markdown emphasis. Counting them as markup can suppress every later
  // pacing boundary in a worked trace such as `offset = (page - 1) * size`.
  const prose = text.replace(/`[^`]*`/g, "");
  return (
    pairs(/`/g) &&
    (prose.match(/\*\*/g) ?? []).length % 2 === 0 &&
    // Single `*` italics, ignoring the `**` already counted.
    (prose.match(/(?<!\*)\*(?!\*)/g) ?? []).length % 2 === 0
  );
}

/**
 * Turns a lecture into a sequence of narrated scenes.
 *
 * Derived from the same markdown the reader renders, rather than authored
 * separately — so every atom becomes watchable for free, and editing the
 * lesson updates the video with it.
 *
 * Two rules make the prose work as narration:
 *
 * 1. **Pairing** — a code block attaches to the paragraph before it, so you
 *    hear the set-up while looking at the code.
 * 2. **Stickiness** — that code then *stays on the stage* for every following
 *    paragraph until a new block or a section heading replaces it.
 *
 * Rule 2 is not a nicety. The prose was written to be read continuously, so it
 * says things like "the first statement above calculates 4". With one idea per
 * scene and no persistence, "above" points at a blank screen and the sentence
 * becomes nonsense. Keeping the code up is what makes a backward reference true
 * again — the same reason a screencast leaves the editor on screen while the
 * narrator talks.
 */
export function buildScenes(atom: Atom): Scene[] {
  const blocks = parseBlocks(atom.body);
  const scenes: Scene[] = [];
  let section = atom.title;
  /** What's currently on the stage. */
  let stage: string | null = null;
  /** A recently hidden stage can return for an explicit backward reference
   * without remaining on unrelated slides as visual wallpaper. */
  let parkedStage: string | null = null;
  /** True until the scene that first displays `stage` has been emitted. */
  let stageFresh = false;

  scenes.push({
    kind: "title",
    caption: atom.title,
    section: atom.title,
    narration: atom.title,
  });

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];

    if (block.kind === "h2") {
      section = block.text;
      stage = null; // new section, clear the stage
      parkedStage = null;
      stageFresh = false;
      // The heading labels the content scene that follows it. It is navigation,
      // not a fact worth spending a separate narrated slide on.
      continue;
    }

    if (block.kind === "code") {
      // Adjacent fences usually show two files or two sides of one example.
      // Treat them as one stage; otherwise the second fence replaces the first
      // before any narration appears, leaving a silent slide and an incomplete
      // visual comparison (for example export + import in the modules lesson).
      let codeText = block.text;
      while (blocks[i + 1]?.kind === "code") {
        i += 1;
        const adjacent = blocks[i];
        if (adjacent.kind === "code") codeText += `\n\n${adjacent.text}`;
      }
      stage = codeText;
      parkedStage = null;
      stageFresh = true;
      const previous = scenes[scenes.length - 1];

      // Attach to the paragraph that introduced it, if there is one.
      if (
        previous &&
        previous.kind === "text" &&
        !previous.code &&
        previous.section === section
      ) {
        previous.code = codeText;
        previous.codeIsNew = true;
        stageFresh = false;

        // The paragraph is the instructor's introduction. Do not append terse
        // source annotations (`# True`, `# a`, `# result`) to it: those notes
        // are useful on screen but become robotic fragments when read aloud.
        // The following prose walks through the example in complete sentences.
        continue;
      }

      const described = describeCode(codeText);
      const upcoming = blocks[i + 1];
      const nextWillShowIt =
        upcoming && (upcoming.kind === "p" || upcoming.kind === "list");

      // If the next paragraph walks through this block, let that explanation
      // introduce the code. Emitting a separate result-only scene first makes
      // the learner see the whole answer before the instructor explains it,
      // and short annotations such as `# True` become abrupt utterances like
      // "True. False." The sticky stage still gives the next paragraph the
      // same block, marked fresh so it reveals there for the first time.
      if (nextWillShowIt) continue;

      scenes.push({
        kind: "text",
        caption: "",
        section,
        code: codeText,
        codeIsNew: true,
        narration: described,
      });
      stageFresh = false;
      continue;
    }

    // Code is sticky only while it still supports the words on screen. Keeping
    // an old block merely because the section has not ended leaves unrelated
    // examples dominating the slide (for example, a `type(...)` block while
    // the narration has moved on to `int("3")`). Walkthrough sections are
    // intentionally line-by-line and retain their example throughout; other
    // prose must share an explicit code span, identifier, or reference cue.
    const blockText = block.kind === "p"
      ? block.text
      : block.kind === "list"
        ? block.items.join(" ")
        : block.kind === "table"
          ? [...block.headers, ...block.rows.flat()].join(" ")
          : "";
    const nextBlock = blocks[i + 1];
    const nextBlockText = nextBlock?.kind === "p"
      ? nextBlock.text
      : nextBlock?.kind === "list"
        ? nextBlock.items.join(" ")
        : nextBlock?.kind === "table"
          ? [...nextBlock.headers, ...nextBlock.rows.flat()].join(" ")
          : "";
    const upcomingSupportsStage = Boolean(
      stage && nextBlockText && stageSupports(nextBlockText, stage, section),
    );
    if (!stage && parkedStage && stageSupports(blockText, parkedStage, section)) {
      stage = parkedStage;
      stageFresh = false;
    } else if (
      stage &&
      !stageSupports(blockText, stage, section) &&
      !upcomingSupportsStage
    ) {
      parkedStage = stage;
      stage = null;
      stageFresh = false;
    }

    if (block.kind === "table") {
      // Rebuild the source so the reader still gets a real table on screen,
      // and speak it as sentences — "all must succeed, use all" — because the
      // pipes and dashes carry no meaning at all out loud.
      const line = (row: string[]) => `| ${row.join(" | ")} |`;
      const caption = [
        line(block.headers),
        line(block.headers.map(() => "---")),
        ...block.rows.map(line),
      ].join("\n");

      const spoken = block.rows
        .map((row) =>
          row
            // Lower-cased and un-punctuated, because the header is now part
            // of a sentence: "all must succeed, use all".
            .map((cell, j) =>
              j === 0 ? cell : `${block.headers[j].toLowerCase()} ${cell}`,
            )
            .join(", "),
        )
        .join(". ");

      scenes.push({
        kind: "text",
        caption,
        section,
        code: stage ?? undefined,
        codeIsNew: stageFresh,
        narration: plainText(spoken),
      });
      stageFresh = false;
      continue;
    }

    if (block.kind === "list") {
      // Long lists get broken up, but never *through* an item — half a bullet
      // read across two scenes is worse than a long one.
      const groups: string[][] = [];
      let current: string[] = [];
      let count = 0;

      for (const item of block.items) {
        const length = item.split(/\s+/).length;
        if (count + length > MAX_WORDS && current.length) {
          groups.push(current);
          current = [];
          count = 0;
        }
        current.push(item);
        count += length;
      }
      if (current.length) groups.push(current);

      let number = 0;
      for (const group of groups) {
        const markdown = group
          .map((item) => {
            number += 1;
            return block.ordered ? `${number}. ${item}` : `- ${item}`;
          })
          .join("\n");

        scenes.push({
          kind: "text",
          caption: markdown,
          section,
          code: stage ?? undefined,
          codeIsNew: stageFresh,
          narration: plainText(group.join(". ")),
        });
        stageFresh = false;
      }
      continue;
    }

    const chunks = splitLong(block.text);
    for (const chunk of chunks) {
      // A long paragraph can change subjects at the slide boundary. Re-check
      // each resulting beat instead of copying the same stage onto every
      // chunk merely because an earlier sentence referenced it.
      const showStage = Boolean(stage && stageSupports(chunk, stage, section));
      scenes.push({
        kind: "text",
        caption: chunk,
        section,
        code: showStage ? stage ?? undefined : undefined,
        codeIsNew: showStage ? stageFresh : false,
        narration: plainText(chunk),
      });
      if (showStage) stageFresh = false;
    }
  }

  // A few hand-authored lectures historically ended their prose with the
  // exact recall question. Do not show that sentence twice in a row. New
  // content keeps preparation and retrieval separate, but this guard protects
  // every existing and future lecture from the same visible repetition.
  const normalizeForDuplicateCheck = (value: string) =>
    plainText(value).toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
  const recallKey = normalizeForDuplicateCheck(atom.recall);
  const previousKey = normalizeForDuplicateCheck(scenes.at(-1)?.caption ?? "");
  if (recallKey !== previousKey) {
    scenes.push({
      kind: "section",
      caption: atom.recall,
      section: "Your turn",
      narration: plainText(atom.recall),
    });
  }

  const enriched = scenes
    .filter((s) => s.caption || s.code)
    .map((scene) => enrichScene(scene, atom));
  return placeVisuals(enriched, atom);
}

const STAGE_REFERENCE =
  /\b(?:above|below|example|output|result)\b|\b(?:first|second|third|fourth|final|next)\s+(?:line|statement|expression|call|step)\b/i;
const STAGE_STOP_WORDS = new Set([
  "class", "false", "none", "print", "python", "return", "true", "value", "values",
]);

function stageSupports(text: string, code: string, section: string): boolean {
  if (section.toLocaleLowerCase().includes("walk through an example")) return true;
  const normalizedCode = code.replace(/\s+/g, " ");
  const spans = [...text.matchAll(/`([^`]+)`/g)]
    .map((match) => match[1].replace(/\s+/g, " ").trim())
    .filter((span) => span.length > 1);
  if (spans.some((span) => normalizedCode.includes(span))) return true;
  if (STAGE_REFERENCE.test(plainText(text))) return true;

  const codeWords = new Set(
    (code.match(/[A-Za-z_]\w*/g) ?? [])
      .map((word) => word.toLocaleLowerCase())
      .filter((word) => word.length > 3 && !STAGE_STOP_WORDS.has(word)),
  );
  return (plainText(text).match(/[A-Za-z_]\w*/g) ?? [])
    .map((word) => word.toLocaleLowerCase())
    .some((word) => codeWords.has(word));
}

const VISUALS: [RegExp, VisualKind][] = [
  [/algo\.(?:scale|operation-count|asymptotics|growth-classes|dominant-growth|space-cost|amortized-cost|analysis-cases)/, "complexity"],
  [/ml\.(?:vector-operations|dot-product-geometry|norm-families)/, "ml"],
  [/algo\.(?:call-stack|recurrences|recursion-trees|recursion-vs-iteration|tail-recursion)/, "recursion"],
  [/algo\.constraints/, "complexity"],
  [/algo\.(?:examples-first|optimize-method|invariants|edge-cases|dry-running|communication)/, "decision"],
  [/algo\.(?:dynamic-arrays|in-place-arrays|cyclic-placement|immutable-strings)/, "list"],
  [/algo\.(?:prefix-sums-guided|difference-arrays|prefix-sums-2d)/, "prefix"],
  [/algo\.(?:hash-maps-sets-guided|frequency-counting|grouping-by-key|default-writeback|composite-keys|set-operations-guided)/, "hash"],
  [/algo\.(?:opposing-pointers-guided|read-write-pointers)/, "pointers"],
  [/algo\.(?:fixed-window-guided|variable-window-guided|window-hash-map)/, "window"],
  [/algo\.(?:stack-guided|queue-deque-guided|monotonic-stack-guided|stack-queue-conversions)/, "stack"],
  [/algo\.monotonic-deque-guided/, "window"],
  [/algo\.(?:linked-list-foundations|dummy-heads|linked-list-reversal|fast-slow-lists|merge-partition-lists)/, "pointers"],
  [/algo\.lru-cache-guided/, "hash"],
  [/algo\.(?:comparison-sorts|merge-sort-guided|quick-sort-guided|noncomparison-sorts)/, "pipeline"],
  [/algo\.quickselect-guided/, "pointers"],
  [/algo\.(?:sort-keys-comparators|sort-stability-guided)/, "decision"],
  [/algo\.(?:binary-search-exact|binary-search-bounds|binary-search-answer)/, "decision"],
  [/algo\.binary-search-shaped/, "pointers"],
  [/algo\.(?:tree-anatomy|tree-dfs|tree-bfs|tree-divide-conquer|tree-path-depth|tree-serialization)/, "tree"],
  [/algo\.(?:bst-invariant|bst-inorder|bst-balancing|bst-ranges)/, "tree"],
  [/algo\.(?:binary-heap|heap-operations|heap-sort-guided|heap-top-k|two-heaps|k-way-merge)/, "heap"],
  [/algo\.(?:trie-foundations|trie-applications)/, "tree"],
  [/algo\.(?:graph-representations|grid-graphs|graph-bfs|graph-dfs|graph-components|graph-cycles|graph-bipartite)/, "graph"],
  [/algo\.(?:topological-order-guided|dsu-foundations|dsu-applications|strong-components|bridges-articulation)/, "graph"],
  [/algo\.(?:dijkstra-guided|zero-one-bfs|bellman-ford-guided|floyd-warshall-guided|a-star-guided|mst-comparison)/, "graph"],
  [/algo\.(?:max-flow-guided|bipartite-matching-guided|euler-hamilton|two-sat-guided)/, "graph"],
  // Backtracking is a decision tree: subsets and arrangements are recursion,
  // while the template, constraint checks, and pruning are choices.
  [/algo\.(?:subset-generation|permutations-combinations)/, "recursion"],
  [/algo\.(?:backtracking-template|constraint-search|search-pruning)/, "decision"],
  // Greedy is a sequence of committed choices; intervals and Huffman have
  // their own natural pictures.
  [/algo\.(?:greedy-choice|greedy-exchange|greedy-pitfalls)/, "decision"],
  [/algo\.interval-scheduling/, "intervals"],
  [/algo\.huffman-coding/, "tree"],
  // Divide and conquer: the shape and the halving are recursion, the
  // recurrence analysis is complexity, and the merge is a pipeline.
  [/algo\.(?:divide-conquer-shape|fast-exponentiation)/, "recursion"],
  [/algo\.master-theorem/, "complexity"],
  [/algo\.cross-boundary-merge/, "pipeline"],
  [/ml\.(?:matrices|matrix-multiplication|transpose-identity-inverse|span-basis-rank|eigenvectors|determinant-trace|svd|matrix-decompositions|orthogonality-least-squares)/, "ml"],
  [/ml\.exponents-logs-sums/, "complexity"],
  [/ml\.(?:derivatives-rules|taylor-approximations)/, "function"],
  [/ml\.(?:partials-gradient|convexity|constrained-optimization)/, "decision"],
  [/ml\.chain-rule/, "pipeline"],
  [/ml\.(?:jacobians-hessians|matrix-calculus)/, "ml"],
  [/ml\.(?:sample-spaces-events|mle-map)/, "decision"],
  [/ml\.(?:conditional-independence|bayes-guided|key-distributions|joint-marginal-conditional|monte-carlo-guided)/, "probability"],
  [/ml\.random-variables-guided/, "function"],
  [/ml\.(?:expectation-variance-covariance|gaussian-guided|multivariate-gaussian)/, "ml"],
  // Unsupervised learning. Clustering is a grouping decision, the mixture and
  // anomaly lessons reason about density, and the projection lessons are
  // geometric transformations of the feature space.
  [/ml\.(?:kmeans-guided|hierarchical-dbscan)/, "decision"],
  [/ml\.(?:gmm-em|anomaly-detection)/, "probability"],
  [/ml\.(?:pca-guided|manifold-visualization)/, "ml"],
  // Evaluation. Metric choice and thresholds are decisions, curves and
  // calibration are probabilistic, and split design is a pipeline concern.
  [/ml\.(?:metrics-precision-recall|confusion-thresholds|imbalanced-data)/, "decision"],
  [/ml\.(?:roc-pr-auc|probability-calibration)/, "probability"],
  [/ml\.regression-metrics/, "ml"],
  [/ml\.grouped-time-validation/, "pipeline"],
  // Neural basics: separability and approximation are decisions about what a
  // model can express, while layers and activations are the network itself.
  [/ml\.(?:perceptron-xor|universal-approximation)/, "decision"],
  [/ml\.(?:multi-layer-perceptrons|activation-functions)/, "ml"],
  // Dynamic programming: the shape lessons are about deciding what to store,
  // while the concrete recurrences fill a table of states.
  [/algo\.(?:dp-overlap|dp-state-design)/, "dp"],
  [/algo\.(?:dp-memo-table|dp-one-dimension|kadane)/, "dp"],
  // Training: autodiff is a graph walk, the rest is the network itself.
  [/ml\.reverse-mode-autodiff/, "graph"],
  [/ml\.(?:forward-pass|deep-loss-functions|backpropagation|training-loop)/, "ml"],
  // The classic recurrences are all table fills over one or two sequences.
  [/algo\.(?:knapsack|coin-change|longest-increasing-subsequence|edit-distance|subset-sum)/, "dp"],
  // Optimizers are decisions about step size; the rest is training machinery.
  [/ml\.(?:gradient-descent-variants|learning-rate-schedules|second-order-methods)/, "decision"],
  [/ml\.(?:momentum|adaptive-optimizers)/, "ml"],
  // Grid and string tables are still table fills, two dimensions wide.
  [/algo\.(?:grid-paths|grid-obstacles|matrix-region-dp|string-dp)/, "dp"],
  // Stability lessons are diagnostic decisions; the rest is network machinery.
  [/ml\.(?:gradient-stability|debugging-training)/, "decision"],
  [/ml\.(?:weight-initialization|normalization-layers|neural-regularization)/, "ml"],
  // Advanced DP: tree states are tree-shaped, the rest are table fills.
  [/algo\.tree-dp/, "tree"],
  [/algo\.(?:interval-dp|bitmask-dp|digit-dp|dp-optimizations)/, "dp"],
  // Convolutional lessons are network machinery; transfer is a decision.
  [/ml\.transfer-learning/, "decision"],
  [/ml\.(?:convolutions|pooling-hierarchies|classic-cnns)/, "ml"],
  // Pattern matching walks a text with a pointer and a precomputed table.
  [/algo\.(?:rabin-karp|kmp|z-algorithm|string-hashing)/, "pointers"],
  // Vision tasks: the pipeline lesson is a pipeline, the rest are decisions.
  [/ml\.image-classification/, "pipeline"],
  [/ml\.(?:object-detection|segmentation|vision-augmentation)/, "decision"],
  // String structures: tries and automata are trees, the rest walk with pointers.
  [/algo\.(?:suffix-trees|aho-corasick)/, "tree"],
  [/algo\.(?:suffix-array|manacher)/, "pointers"],
  // Sequence models are network machinery; attention is a retrieval decision.
  [/ml\.encoder-decoder-attention/, "decision"],
  [/ml\.(?:recurrent-networks|gated-units|seq2seq)/, "ml"],
  // Foundational lessons first, matched on their exact unit ids so they never
  // collide with a pattern lesson. These keep the early modules from being a
  // wall of text with nothing to look at.
  [/^programs$/, "program"],
  [/^(values|numbers)$/, "types"],
  [/^variables$/, "variable"],
  [/^names$/, "reference"],
  [/^lists$/, "list"],
  [/^(strings|fstrings|text-split|format-specs)$/, "string"],
  [/^(loops|loop-control|iteration-tools|aggregation-tools)$/, "loop"],
  [/^(comprehensions|itertools|sorting|iterators)$/, "pipeline"],
  [/^booleans$/, "boolean"],
  [/^branching$/, "decision"],
  [/^(calls|first-function|functions|arguments|scope|decorators)$/, "function"],
  [/^(slicing|tuples|unpacking)$/, "list"],
  [/^(imports|modules)$/, "modules"],
  [/^(classes|dataclasses|composition|protocols)$/, "object"],
  [/^(exceptions|contexts|files-json)$/, "resource"],
  [/^(typing|testing|debugging)$/, "testing"],
  [/^(performance|complexity)$/, "complexity"],
  [/^(asyncio|parallelism)$/, "concurrency"],
  [/^(method)$/, "decision"],
  [/^(api-contracts|idempotency|cache-reasoning|capacity-estimation|caching)$/, "system"],
  [/^(ml-shapes|data-leakage|classification-metrics|gradient-descent)$/, "ml"],
  [/^(expected-value|bayes-rule|combinatorics|monte-carlo)$/, "probability"],
  [/ml\.(?:estimators|descriptive|large-numbers|tests|bootstrap|entropy|cross-entropy|mutual-information)/, "probability"],
  [/ml\.multiple-testing/, "decision"],
  [/ml\.numpy-(?:arrays|vectorization|linear-algebra|stability|random-generators)/, "ml"],
  [/ml\.(?:pandas|data-cleaning|tabular-preprocessing|exploratory-analysis|plotting)/, "pipeline"],
  [/ml\.torch-(?:tensors|autograd|shapes|dataloaders|reproducibility)/, "ml"],
  [/ml\.(?:experiment-tracking|profiling-bottlenecks|gpu-workflow|notebooks-pipelines)/, "pipeline"],
  [/ml\.(?:learning-paradigms|examples-features-labels|baselines-formulation|split-discipline|generalization-fit|bias-variance-diagnosis|cross-validation-search)/, "ml"],
  [/ml\.(?:linear-regression|regression-losses|logistic-regression|softmax-regression|linear-regularization|feature-pipelines)/, "function"],
  [/ml\.(?:knn-guided|naive-bayes-guided|curse-dimensionality)/, "ml"],
  [/ml\.decision-trees-guided/, "tree"],
  [/ml\.(?:bagging-random-forests|boosting-guided|gradient-boosted-trees|stacking-blending)/, "tree"],
  [/ml\.(?:support-vector-machines|kernel-trick)/, "ml"],
  [/^(dict-iteration|collections)$/, "hash"],
  [/hashing|dicts|sets/, "hash"],
  [/prefix-sums/, "prefix"],
  [/two-pointers/, "pointers"],
  [/sliding-window/, "window"],
  [/stack/, "stack"],
  [/monotonic-stack/, "stack"],
  [/intervals/, "intervals"],
  [/binary-search/, "binary"],
  [/heap/, "heap"],
  [/trees/, "tree"],
  [/graphs/, "graph"],
  [/topological-sort|union-find|shortest-paths/, "graph"],
  [/backtracking/, "backtracking"],
  [/dynamic-programming/, "dp"],
  [/grid-dp/, "dp"],
  [/recursion/, "recursion"],
];

function visualFor(atom: Atom): VisualKind | undefined {
  const unit = atom.id.replace(/^(?:py\.)?atom\./, "");
  return VISUALS.find(([pattern]) => pattern.test(unit))?.[1];
}

const VISUAL_REFERENCE =
  /\b(?:picture|imagine|diagram|visuali[sz]e|mental model|standing on (?:a )?hill|throw random darts|frontier moves)\b/i;

/** Put a diagram where it teaches something, not as wallpaper on every slide.
 * Each lesson gets one model view, its mistake section gets a contrasting
 * failure state, and prose that explicitly asks the learner to picture
 * something always receives the visual on that exact scene. */
function placeVisuals(scenes: Scene[], atom: Atom): Scene[] {
  const kind = visualFor(atom);
  if (!kind) return scenes;
  const topic = atom.id.replace(/^(?:py\.)?atom\./, "");
  let modelPlaced = false;
  let trapPlaced = false;
  let lastVisualIndex = -2;
  let lastVisualVariant: "model" | "trap" = "model";
  let visualCount = 0;

  return scenes.map((scene, index) => {
    if (scene.kind !== "text") return scene;
    if (
      visualCount < 4 &&
      index === lastVisualIndex + 1 &&
      /^[a-z]/.test(scene.caption) &&
      !VISUAL_REFERENCE.test(scenes[index + 1]?.caption ?? "")
    ) {
      lastVisualIndex = index;
      visualCount += 1;
      return {
        ...scene,
        visualKind: kind,
        visualVariant: lastVisualVariant,
        visualTopic: topic,
      };
    }
    const section = scene.section.toLocaleLowerCase();
    const explicitlyReferenced = VISUAL_REFERENCE.test(scene.caption);
    const nextExplicitlyReferencesVisual = VISUAL_REFERENCE.test(scenes[index + 1]?.caption ?? "");
    const modelCandidate =
      !modelPlaced &&
      !scene.code &&
      !nextExplicitlyReferencesVisual &&
      section.includes("idea, step by step");
    const trapCandidate =
      !trapPlaced && !scene.code && section.includes("mistake to avoid");
    if (!explicitlyReferenced && !modelCandidate && !trapCandidate) return scene;

    const visualVariant = trapCandidate ? "trap" as const : "model" as const;
    if (visualVariant === "trap") trapPlaced = true;
    else modelPlaced = true;
    lastVisualIndex = index;
    lastVisualVariant = visualVariant;
    visualCount += 1;
    return { ...scene, visualKind: kind, visualVariant, visualTopic: topic };
  });
}

function inlineTerms(caption: string): string[] {
  const terms = [...caption.matchAll(/`([^`]+)`|\*\*([^*]+)\*\*/g)]
    .map((match) => (match[1] ?? match[2]).trim())
    .filter((term) => term.length > 1 && term.length < 38);
  return [...new Set(terms)].slice(0, 4);
}

function focusLines(scene: Scene): number[] | undefined {
  if (!scene.code) return undefined;
  const lines = scene.code.split("\n");
  const terms = inlineTerms(scene.caption)
    .flatMap((term) => term.split(/\s+/))
    .filter((term) => /^[A-Za-z_]\w*$/.test(term) || /[()[\].]/.test(term));
  const matches = lines
    .map((line, index) =>
      !isCommentLine(line) && terms.some((term) => line.includes(term)) ? index + 1 : 0,
    )
    .filter(Boolean);
  if (matches.length) return [...new Set(matches)].slice(0, 3);

  const ordinal = /\b(first|second|third|fourth)\b/i.exec(scene.caption)?.[1].toLowerCase();
  const ordinalIndex = ordinal ? ["first", "second", "third", "fourth"].indexOf(ordinal) : -1;
  if (ordinalIndex >= 0) {
    // Authored references use the line numbers visible in the code panel, so
    // preserve physical numbering (including blank lines). If that exact line
    // is only an annotation, advance to the next executable line instead of
    // highlighting prose masquerading as code.
    if (lines[ordinalIndex]?.trim() && !isCommentLine(lines[ordinalIndex])) {
      return [ordinalIndex + 1];
    }
    const nextCode = lines.findIndex(
      (line, index) => index >= ordinalIndex && line.trim() && !isCommentLine(line),
    );
    if (nextCode >= 0) return [nextCode + 1];
  }

  const keyword = ["return", "if ", "for ", "while ", "yield", "raise"]
    .find((word) => scene.caption.toLowerCase().includes(word.trim()));
  if (keyword) {
    const index = lines.findIndex(
      (line) => !isCommentLine(line) && line.includes(keyword.trim()),
    );
    if (index >= 0) return [index + 1];
  }
  if (scene.codeIsNew) {
    const first = lines.findIndex((line) => line.trim() && !isCommentLine(line));
    if (first >= 0) return [first + 1];
  }
  // Sticky code can remain visible while the narration discusses a broader
  // idea. No highlight is more honest than an arbitrary one: lighting the
  // last statement when it is not being discussed is exactly the kind of
  // false eye guidance a learner notices immediately.
  return undefined;
}

const FOCUS_STOP_WORDS = new Set([
  "about", "after", "again", "also", "and", "because", "before", "being",
  "does", "each", "from", "into", "line", "local", "object", "same", "that",
  "their", "then", "there", "these", "this", "through", "value", "what",
  "when", "where", "which", "while", "with", "would",
]);

/**
 * Prose uses conceptual words while code uses punctuation. These pairs bridge
 * that gap so “assignment” can point at `=` and “displays” can point at
 * `print(...)`, even though the literal words do not appear in the code.
 */
const FOCUS_SIGNALS: Array<{ prose: RegExp; code: RegExp }> = [
  { prose: /\b(?:define|defines|definition|function)\b/i, code: /\b(?:def|function|class)\b|=>/ },
  { prose: /\b(?:return|returns|returned)\b/i, code: /\breturn\b/ },
  { prose: /\b(?:assign|assigns|assigned|assignment|bind|binds|bound)\b/i, code: /(?<![=!<>])=(?!=)/ },
  { prose: /\b(?:display|displays|print|prints|output|outputs)\b/i, code: /\bprint\s*\(|console\.log\s*\(/ },
  { prose: /\b(?:compare|compares|comparison|equal|equals)\b/i, code: /===|==|!=|<=|>=|<|>/ },
  { prose: /\b(?:condition|branch|check|checks)\b/i, code: /\bif\b|\belse\b|\belif\b|\bswitch\b/ },
  { prose: /\b(?:loop|loops|iterate|iterates|iteration)\b/i, code: /\bfor\b|\bwhile\b/ },
  { prose: /\b(?:append|appends|add|adds|insert|inserts)\b/i, code: /\.append\s*\(|\.push\s*\(|\.add\s*\(|\.insert\s*\(/ },
  { prose: /\b(?:raise|raises|throw|throws|error)\b/i, code: /\braise\b|\bthrow\b/ },
  { prose: /\b(?:import|imports)\b/i, code: /\bimport\b|\brequire\s*\(/ },
];

/**
 * Split raw markdown prose into sentence-ish fragments *without* breaking
 * inside an inline-code span. Splitting on a bare `.` would tear `a.copy()`
 * into pieces; a backtick span is treated as atomic so code survives intact.
 * Each fragment keeps its start offset in the raw string, for cue timing.
 */
function splitFragments(raw: string): { text: string; start: number }[] {
  const out: { text: string; start: number }[] = [];
  let buf = "";
  let start = 0;
  let inCode = false;
  for (let i = 0; i < raw.length; i += 1) {
    const ch = raw[i];
    if (buf === "") start = i;
    if (ch === "`") inCode = !inCode;
    buf += ch;
    if (!inCode && /[.!?;,]/.test(ch)) {
      out.push({ text: buf, start });
      buf = "";
    }
  }
  if (buf.trim()) out.push({ text: buf, start });
  return out;
}

/** A code line with any trailing `# comment` removed, for matching quoted code. */
function codeOf(line: string): string {
  return line.replace(/\s*#.*$/, "");
}

/** A pure comment line — never a valid thing to highlight, since the narration
 * is discussing real code, not the annotation. */
function isCommentLine(line: string): boolean {
  const trimmed = line.trim();
  return trimmed.startsWith("#") || trimmed.startsWith("//");
}

/** Build eye-guidance cues from the same explanation the learner hears. */
function timedFocusSteps(scene: Scene, fallback: number[] = []): FocusStep[] | undefined {
  if (!scene.code) return undefined;
  const caption = scene.caption ?? "";
  const captionSpeech = plainText(caption).replace(/\s+/g, " ").trim();
  // Usually the caption is the narration and retains useful inline-code
  // backticks. A genuinely code-only scene, however, is narrated by
  // `describeCode`; use that generated explanation so its cues can still
  // follow the lines it names.
  const raw = captionSpeech ? caption : scene.narration;
  const prose = plainText(raw).replace(/\s+/g, " ").trim();
  const lines = scene.code.split("\n");
  if (!prose || !lines.some((line) => line.trim())) {
    return fallback.length
      ? fallback.map((line, index) => ({ at: index / fallback.length, lines: [line] }))
      : undefined;
  }

  // Split on the raw caption (backtick-aware) so quoted code stays whole, and
  // commas still separate "explains the assignment, then the call" into two cues.
  const fragments = splitFragments(raw);
  const steps: FocusStep[] = [];

  // A cue's `at` must live on the same axis as playback progress: a fraction of
  // *spoken audio*. Position each cue by how much speech time elapses before its
  // phrase, using the same `forSpeech` + WPM model the pacing uses.
  const spokenTotal = Math.max(0.001, speechSeconds(prose, 1));

  for (const frag of fragments) {
    const fragment = plainText(frag.text).trim();
    if (!fragment) continue;

    // The strongest signal by far: the sentence literally quotes a line of code
    // in backticks, e.g. "`b = a` does not copy". Honour that exact code over
    // any loose keyword overlap — this is what stops "copy" in the prose from
    // jumping to an unrelated `a.copy()` line.
    const spans = [...frag.text.matchAll(/`([^`]+)`/g)]
      .map((m) => m[1].trim())
      .filter((s) => s.length >= 2);

    const words = (fragment.match(/[A-Za-z_]\w*/g) ?? [])
      .map((word) => word.toLocaleLowerCase())
      .filter((word) => word.length > 2 && !FOCUS_STOP_WORDS.has(word));

    const scores = lines.map((line) => {
      if (!line.trim() || isCommentLine(line)) return -1;
      const code = codeOf(line);
      let score = 0;
      // Exact quoted-code match dominates everything else.
      for (const span of spans) {
        if (code.includes(span)) score += 100;
        // An authored result often lives in the annotation beside the
        // expression that produced it (`total / 5  # 3.4`). Pointing at that
        // executable line is correct; pointing at an unrelated fallback line
        // because the value only appears after `#` is not.
        else if (line.includes(span)) score += 80;
      }
      const lower = line.toLocaleLowerCase();
      for (const word of words) {
        if (new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(lower)) {
          score += 2;
        }
      }
      for (const signal of FOCUS_SIGNALS) {
        if (signal.prose.test(fragment) && signal.code.test(line)) score += 7;
      }
      // “call” is intentionally weak: many lines contain parentheses. It
      // breaks ties only after a name or a stronger conceptual signal matches.
      if (/\b(?:call|calls|invoke|invokes)\b/i.test(fragment) && /[A-Za-z_]\w*\s*\(/.test(line)) {
        score += 1;
      }
      return score;
    });

    const best = Math.max(...scores);
    // One generic shared word is not enough evidence to move the learner's
    // eye. Require either a strong conceptual signal, an exact quoted span,
    // or at least two meaningful identifier overlaps. A missing cue is calm;
    // a confident highlight on the wrong line actively teaches the wrong
    // relationship.
    if (best < 4) continue;
    const candidates = scores
      .map((score, index) => score === best ? index : -1)
      .filter((index) => index >= 0);
    // “final/next/then” normally describes the later of two otherwise equal
    // lines; ordinary prose keeps reading order and takes the earlier one.
    const chosen = /\b(?:final|next|then|after|result|output)\b/i.test(fragment)
      ? candidates[candidates.length - 1]
      : candidates[0];
    const previous = steps.at(-1);
    if (previous?.lines[0] === chosen + 1) continue;
    steps.push({
      // Speech time elapsed before this phrase, as a fraction of the whole —
      // the same axis playback progress reports, so the highlight lands on the
      // line at the moment the voice reaches it.
      at: speechSeconds(plainText(raw.slice(0, frag.start)), 1) / spokenTotal,
      lines: [chosen + 1],
    });
  }

  if (!steps.length && fallback.length) {
    return fallback.map((line, index) => ({ at: index / fallback.length, lines: [line] }));
  }
  if (!steps.length) return undefined;
  return steps;
}

/** The single focus cue active at this instant of narration. */
export function focusedLinesAt(scene: Scene, progress: number): number[] {
  const steps = scene.focusSteps;
  if (!steps?.length) return scene.focusLines ?? [];
  const bounded = Math.max(0, Math.min(1, progress));
  // Do not light a line before the voice reaches the phrase that names it.
  // The earlier implementation forced the first cue to zero, which made the
  // player look synchronized while actually teaching the eye to arrive early.
  if (bounded < steps[0].at) return [];
  let active = steps[0];
  for (const step of steps) {
    if (step.at > bounded) break;
    active = step;
  }
  return active.lines;
}

/**
 * Focus timeline for an ad-hoc (narration, code) pair — no full Atom needed.
 * Lets the tutor sync a generated slide's code to its spoken prose exactly the
 * way a lecture scene does.
 */
export function focusStepsFor(narration: string, code: string): FocusStep[] | undefined {
  // Fallback = every non-blank line, so when the prose doesn't explicitly quote
  // a line the highlight still walks top-to-bottom through the code as the voice
  // reads — a gentle "reading through it" sync rather than no motion at all.
  const everyLine = code
    .split("\n")
    .map((line, index) => (line.trim() && !isCommentLine(line) ? index + 1 : 0))
    .filter((n): n is number => n > 0);
  return timedFocusSteps({ caption: narration, code } as Scene, everyLine);
}

function traceItems(code?: string): string[] | undefined {
  if (!code) return undefined;
  const out: string[] = [];
  code.split("\n").forEach((line, index) => {
    const comment = /(?:\/\/|#)\s*(.+)$/.exec(line)?.[1]?.trim();
    if (comment && !/^define|import/i.test(comment)) out.push(`Line ${index + 1}: ${comment}`);
  });
  return out.length ? out.slice(0, 3) : undefined;
}

function guideFor(scene: Scene): string {
  const section = scene.section.toLowerCase();
  if (section.includes("failure") || section.includes("trap")) return "Spot the failure";
  if (section.includes("rule")) return "Keep this rule";
  if (section.includes("turn")) return "Retrieve, don't reread";
  if (scene.code) return scene.codeIsNew ? "Read in execution order" : "Follow the highlighted line";
  if (scene.kind === "section") return "New mental step";
  return "Hold the key relationship";
}

function enrichScene(scene: Scene, _atom: Atom): Scene {
  const fallbackFocus = focusLines(scene) ?? [];
  const focusSteps = timedFocusSteps(scene, fallbackFocus);
  const allFocusLines = focusSteps?.length
    ? [...new Set(focusSteps.flatMap((step) => step.lines))]
    : fallbackFocus;
  return {
    ...scene,
    focusLines: allFocusLines.length ? allFocusLines : undefined,
    focusSteps,
    focusLabel: guideFor(scene),
    traceItems: traceItems(scene.code),
    keyTerms: inlineTerms(scene.caption),
  };
}

// ------------------------------------------------------------- pacing

const WORDS_PER_MINUTE = 165;

/** How long one line takes to appear during the reveal animation. */
export const LINE_REVEAL_MS = 200;

export function speechSeconds(text: string, rate: number): number {
  // Count the words that are actually *said*. `charCodeAt` is one word on the
  // page and three out loud, and `===` is none on the page and two out loud —
  // measuring the source under-counts every technical sentence.
  const words = forSpeech(text).split(/\s+/).filter(Boolean).length;
  if (!words) return 0;
  return ((words / WORDS_PER_MINUTE) * 60) / rate;
}

export function revealSeconds(scene: Scene): number {
  if (!scene.code || scene.codeIsNew === false) return 0;
  return (scene.code.split("\n").length * LINE_REVEAL_MS) / 1000;
}

/**
 * The beat *after* the words stop.
 *
 * Advancing the instant narration ends is the single thing that made this feel
 * rushed: your eyes have not reached the code yet, and there's no moment to let
 * a sentence settle. Reading code is much slower than hearing prose, so new
 * code buys real time on screen — and a section heading gets an extra pause,
 * the way a person naturally stops before changing subject.
 */
export function holdSeconds(scene: Scene, rate: number): number {
  let hold = 1.1;
  // Tiny bridge sentences and prerequisite labels otherwise flash by in about
  // two seconds. A human instructor naturally leaves a beat after saying
  // "Two tricks matter"; give short scenes that same breathing room.
  const spokenWords = forSpeech(scene.narration).split(/\s+/).filter(Boolean).length;
  if (spokenWords > 0 && spokenWords < 6) hold += 1;
  if (scene.kind === "section") hold += 0.7;
  if (scene.kind === "title") hold += 0.4;

  if (scene.code) {
    const lines = scene.code.split("\n").filter((l) => l.trim()).length;
    // New code has to be read. Code carried over from the last scene has
    // already been read, so it only needs a glance.
    hold += scene.codeIsNew === false ? lines * 0.14 : lines * 0.5;
  }
  if (scene.visualKind) hold += 0.8;
  if (scene.traceItems?.length) hold += Math.min(1.2, scene.traceItems.length * 0.35);

  return Math.min(Math.max(hold / rate, 0.7), 8);
}

/** Total wall-clock for a scene — used for the silent slideshow. */
export function sceneSeconds(scene: Scene, rate: number): number {
  const speaking = speechSeconds(scene.narration, rate);
  return Math.max(speaking, revealSeconds(scene)) + holdSeconds(scene, rate);
}

// --------------------------------------------------- narrating raw code

const ORDINAL = /^\d+[.)]\s+\S/;
const VALUE_LIKE =
  /^(-?\d|["'`[{(]|true\b|false\b|null\b|undefined\b|NaN\b|Infinity\b|Promise\b|Map\b|Set\b|Date\b|\w*Error\b)/;

/**
 * Speech for a code block that has no paragraph explaining it.
 *
 * Without this, a block that follows a heading sits in silence while the timer
 * runs — code on screen and nobody saying anything about it. The lectures
 * annotate results heavily (`next(); // 1`), so those annotations are the
 * explanation; they just need reading out.
 */
export function describeCode(code: string): string {
  const parts: string[] = [];

  for (const line of code.split("\n")) {
    if (!line.trim()) continue;
    const found = annotationIn(line);
    if (!found) continue;

    const expression = found[1].replace(/;$/, "").trim();
    const note = found[2].trim();

    if (!expression) {
      parts.push(note.replace(/\s{2,}/g, ", "));
      continue;
    }

    // `// 1. state` is a numbered label, not a result. It starts with a digit,
    // so the value test says yes and it comes out as "let hidden equals 0
    // gives 1. state" — and the full stop makes the voice land on the number.
    if (ORDINAL.test(note) || !VALUE_LIKE.test(note)) {
      parts.push(`${expression}, ${note.replace(/\s{2,}/g, ", ")}`);
      continue;
    }

    // Annotations are often a result *and* a label, separated by padding:
    //   scores[0];   // 90   the first
    // Read as one run-on that's "gives 90 the first". The comma is the pause
    // a person would put there.
    const columns = /^(\S+)\s{2,}(.+)$/.exec(note);
    if (columns) {
      parts.push(`${expression} gives ${columns[1]}, ${columns[2].trim()}`);
    } else {
      parts.push(`${expression} gives ${note}`);
    }
  }

  if (parts.length) return parts.slice(0, 4).join(". ") + ".";
  return speakableCode(code);
}

/** Number of source lines that should be visible at this point in narration.
 * New code unfolds across the spoken explanation instead of flashing in at
 * 200 ms per line before the instructor has reached it. A focus cue can reveal
 * its target early, and the final tenth of speech completes the block so the
 * hold begins with the whole example available to inspect. */
export function revealedLineCount(scene: Scene, progress: number): number {
  if (!scene.code) return 0;
  const total = scene.code.split("\n").length;
  if (scene.codeIsNew === false) return total;
  const bounded = Math.max(0, Math.min(1, progress));
  if (bounded >= 0.9) return total;

  if (scene.focusSteps?.length) {
    const reached = scene.focusSteps
      .filter((step) => step.at <= bounded)
      .flatMap((step) => step.lines);
    return Math.min(total, Math.max(0, ...reached));
  }

  // A rare code-only scene without any semantic cues still unfolds steadily,
  // but starts blank rather than flashing line one before a word is spoken.
  return Math.min(total, Math.ceil(total * (bounded / 0.9)));
}

/** Split a code line from its teaching annotation without confusing Python's
 * floor-division operator (`a // b`) for a JavaScript comment. A real `#`
 * annotation wins when both symbols appear on the same Python line. */
function annotationIn(line: string): RegExpExecArray | null {
  const hash = /^(.*?)\s+#\s*(.+?)\s*$/.exec(line);
  if (hash) return hash;
  const slash = /^(.*?)\s+\/\/\s+(.+?)\s*$/.exec(line);
  if (!slash) return null;
  // `items // capacity` is an operator expression, not an annotation. JS
  // examples normally put comments after a completed expression (`;`, `)`,
  // `]`, `}`) or use prose containing spaces.
  const left = slash[1].trim();
  const right = slash[2].trim();
  if (!/[;)}\]]$/.test(left) && /^[A-Za-z_]\w*$/.test(right)) return null;
  return slash;
}

const CODE_SPEECH: [RegExp, string][] = [
  // Before the `=` rule, and the reason the `=` rule excludes `>`: without
  // both, `n => n * 2` was read as "n equals greater than n times 2".
  [/=>/g, " arrow "],
  [/[();{}]/g, " "],
  [/\+/g, " plus "],
  [/\*/g, " times "],
  [/([^=!<>])=([^=>])/g, "$1 equals $2"],
];

/**
 * Last resort for a code block with nothing to say about it: read it out.
 *
 * Only for short blocks — reading eight lines aloud is worse than silence.
 * Longer ones just get their reading time on screen instead.
 */
function speakableCode(code: string): string {
  const lines = code
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  if (!lines.length || lines.length > 3) return "";

  let text = lines.join(". ").replace(/;/g, "");
  for (const [pattern, replacement] of CODE_SPEECH) {
    text = text.replace(pattern, replacement);
  }
  return text.replace(/\s+/g, " ").trim() + ".";
}

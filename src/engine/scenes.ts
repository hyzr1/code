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
  | "recursion";

/** Roughly 11 seconds of speech. Longer than this and attention drifts. */
const MAX_WORDS = 34;

function splitLong(text: string): string[] {
  const words = text.split(/\s+/);
  if (words.length <= MAX_WORDS) return [text];

  const sentences = text.split(/(?<=[.!?])\s+/);
  const chunks: string[] = [];
  let current: string[] = [];
  let count = 0;

  for (const sentence of sentences) {
    const length = sentence.split(/\s+/).length;
    // A bold span may hold two sentences — "**Default to the chain. Reach for
    // the loop when you've measured.**" — and cutting between them orphans the
    // markers, so the reader shows a literal `**` and the narrator says
    // "star times". Only break where every span is closed.
    if (count + length > MAX_WORDS && current.length && closed(current.join(" "))) {
      chunks.push(current.join(" "));
      current = [];
      count = 0;
    }
    current.push(sentence);
    count += length;
  }
  if (current.length) chunks.push(current.join(" "));
  return chunks;
}

/** True when no emphasis or code span is left hanging open. */
function closed(text: string): boolean {
  const pairs = (pattern: RegExp) => (text.match(pattern) ?? []).length % 2 === 0;
  return (
    pairs(/\*\*/g) &&
    pairs(/`/g) &&
    // Single `*` italics, ignoring the `**` already counted.
    pairs(/(?<!\*)\*(?!\*)/g)
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
      stageFresh = false;
      // The heading labels the content scene that follows it. It is navigation,
      // not a fact worth spending a separate narrated slide on.
      continue;
    }

    if (block.kind === "code") {
      stage = block.text;
      stageFresh = true;
      const previous = scenes[scenes.length - 1];

      // Attach to the paragraph that introduced it, if there is one.
      if (
        previous &&
        previous.kind === "text" &&
        !previous.code &&
        previous.section === section
      ) {
        previous.code = block.text;
        previous.codeIsNew = true;
        stageFresh = false;

        // A short lead-in like "Here are three:" doesn't explain anything, so
        // the block's own annotations get read out after it.
        const words = previous.narration.split(/\s+/).filter(Boolean).length;
        if (words < 16) {
          const described = describeCode(block.text);
          if (described) previous.narration = `${previous.narration} ${described}`;
        }
        continue;
      }

      const described = describeCode(block.text);
      const upcoming = blocks[i + 1];
      const nextWillShowIt =
        upcoming && (upcoming.kind === "p" || upcoming.kind === "list");

      // A scene with code and nothing to say about it is dead air. If the very
      // next paragraph is going to display this same block anyway (the stage is
      // sticky), let that paragraph introduce it instead.
      if (!described && nextWillShowIt) continue;

      scenes.push({
        kind: "text",
        caption: "",
        section,
        code: block.text,
        codeIsNew: true,
        narration: described,
      });
      stageFresh = false;
      continue;
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
      scenes.push({
        kind: "text",
        caption: chunk,
        section,
        code: stage ?? undefined,
        codeIsNew: stageFresh,
        narration: plainText(chunk),
      });
      stageFresh = false;
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

  return scenes
    .filter((s) => s.caption || s.code)
    .map((scene) => enrichScene(scene, atom));
}

const VISUALS: [RegExp, VisualKind][] = [
  [/hashing|dicts|sets/, "hash"],
  [/prefix-sums/, "hash"],
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
  return VISUALS.find(([pattern]) => pattern.test(atom.id))?.[1];
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
    .map((line, index) => (terms.some((term) => line.includes(term)) ? index + 1 : 0))
    .filter(Boolean);
  if (matches.length) return [...new Set(matches)].slice(0, 3);

  const ordinal = /\b(first|second|third|fourth)\b/i.exec(scene.caption)?.[1].toLowerCase();
  const ordinalIndex = ordinal ? ["first", "second", "third", "fourth"].indexOf(ordinal) : -1;
  if (ordinalIndex >= 0 && lines[ordinalIndex]) return [ordinalIndex + 1];

  const keyword = ["return", "if ", "for ", "while ", "yield", "raise"]
    .find((word) => scene.caption.toLowerCase().includes(word.trim()));
  if (keyword) {
    const index = lines.findIndex((line) => line.includes(keyword.trim()));
    if (index >= 0) return [index + 1];
  }
  if (scene.codeIsNew) {
    const first = lines.findIndex((line) => line.trim());
    if (first >= 0) return [first + 1];
  }
  // Sticky code often remains while the following paragraph explains the
  // effect rather than repeating an identifier. In that case, direct the eye
  // to the final state-changing line instead of promising a highlight that
  // does not exist.
  for (let index = lines.length - 1; index >= 0; index -= 1) {
    if (lines[index].trim()) return [index + 1];
  }
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

/** Build eye-guidance cues from the same explanation the learner hears. */
function timedFocusSteps(scene: Scene, fallback: number[] = []): FocusStep[] | undefined {
  if (!scene.code) return undefined;
  const prose = plainText(scene.caption).replace(/\s+/g, " ").trim();
  const lines = scene.code.split("\n");
  if (!prose || !lines.some((line) => line.trim())) {
    return fallback.length
      ? fallback.map((line, index) => ({ at: index / fallback.length, lines: [line] }))
      : undefined;
  }

  // Commas matter here: teaching prose often explains an assignment, then the
  // final call, inside one sentence. Treating the sentence as one unit would
  // leave both lines lit together—the exact behavior this timeline replaces.
  const fragments = [...prose.matchAll(/[^.!?;,]+(?:[.!?;,]|$)/g)];
  const steps: FocusStep[] = [];

  for (const match of fragments) {
    const fragment = match[0].trim();
    if (!fragment) continue;
    const words = (fragment.match(/[A-Za-z_]\w*/g) ?? [])
      .map((word) => word.toLocaleLowerCase())
      .filter((word) => word.length > 2 && !FOCUS_STOP_WORDS.has(word));

    const scores = lines.map((line) => {
      if (!line.trim()) return -1;
      let score = 0;
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
    if (best < 2) continue;
    const candidates = scores
      .map((score, index) => score === best ? index : -1)
      .filter((index) => index >= 0);
    // “final/next/then” normally describes the later of two otherwise equal
    // lines; ordinary prose keeps reading order and takes the earlier one.
    const chosen = /\b(?:final|next|then|after)\b/i.test(fragment)
      ? candidates[candidates.length - 1]
      : candidates[0];
    const previous = steps.at(-1);
    if (previous?.lines[0] === chosen + 1) continue;
    steps.push({
      at: (match.index ?? 0) / Math.max(1, prose.length),
      lines: [chosen + 1],
    });
  }

  if (!steps.length && fallback.length) {
    return fallback.map((line, index) => ({ at: index / fallback.length, lines: [line] }));
  }
  if (!steps.length) return undefined;
  // There should always be somewhere to look when speech begins. Later cue
  // positions remain proportional to where their phrase starts in the prose.
  steps[0].at = 0;
  return steps;
}

/** The single focus cue active at this instant of narration. */
export function focusedLinesAt(scene: Scene, progress: number): number[] {
  const steps = scene.focusSteps;
  if (!steps?.length) return scene.focusLines ?? [];
  const bounded = Math.max(0, Math.min(1, progress));
  let active = steps[0];
  for (const step of steps) {
    if (step.at > bounded) break;
    active = step;
  }
  return active.lines;
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

function enrichScene(scene: Scene, atom: Atom): Scene {
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
    visualKind: visualFor(atom),
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

const ANNOTATION = /^\s*(.*?)\s*\/\/\s*(.+?)\s*$/;
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
    const found = ANNOTATION.exec(line);
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
      parts.push(note.replace(/\s{2,}/g, ", "));
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

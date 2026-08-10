/**
 * Release gate for the viewer-facing Python lecture player.
 *
 * This checks the derived scenes learners actually watch, rather than only the
 * source markdown. It intentionally treats false focus, malformed speech,
 * absent/repeated visuals, rushed pacing, and invalid reveal state as errors.
 */
import assert from "node:assert/strict";
import {
  ATOMS,
  buildScenes,
  focusStepsFor,
  focusedLinesAt,
  forSpeech,
  revealedLineCount,
  sceneSeconds,
} from "../.check/content.mjs";

const lectures = ATOMS.filter((atom) => atom.language === "python");
const failures = [];
const warnings = [];
const fail = (where, message) => failures.push(`${where}: ${message}`);
const warn = (where, message) => warnings.push(`${where}: ${message}`);
const isComment = (line) => {
  const value = line.trim();
  return value.startsWith("#") || value.startsWith("//");
};
const visualReference =
  /\b(?:picture|imagine|diagram|visuali[sz]e|mental model|standing on (?:a )?hill|throw random darts|frontier moves)\b/i;
const visibleCodeReference =
  /\b(?:line|example|block)\s+(?:above|below)\b|\b(?:first|second|third|fourth|final)\s+line\b/i;

// Speech regressions found by listening to the generated course.
const speechCases = [
  ["# explain this", "explain this"],
  ["value # result", "value, result"],
  ["4 ** 3", "4 to the power of 3"],
  ["items // capacity", "items floor divided by capacity"],
  ["x != 3", "x not equal to 3"],
  ["def f() -> int", "def f call arrow int"],
  ["<class 'str'>", "class str"],
  ["4 * 3", "4 times 3"],
  ["first, *rest", "first, star rest"],
  ['"a,b,,c"', '"a,b,,c"'],
  ["They check IDs once", "They check I D's once"],
  ["integer division //", "floor division"],
  ['f"{score}"', "an f-string containing score"],
  ['f"{price:.2f}"', "an f-string formatting price to 2 decimal places"],
  ["{total:.2f}", "total formatted to 2 decimal places"],
  ["items = []", "items equals empty list"],
  ["FIFO queue", "first in, first out queue"],
  ["an LRU cache", "an L R U cache"],
  ["an API boundary", "an A P I boundary"],
  ["a DP table", "a dynamic programming table"],
  ["$13.50", "13 dollars and 50 cents"],
  ["what does `.2f` change", "what does .2f change"],
  ["O(V + E)", "O of V plus E"],
  ["O(n + m)", "O of n plus m"],
  ["^8", "caret 8"],
  ["@shouty written on greet", "the shouty decorator on greet"],
  ["modulo for percentages", "percent format for percentages"],
  ["enumerate(names):.", "enumerate(names):"],
];
for (const [source, expected] of speechCases) {
  assert.equal(forSpeech(source), expected, `speech normalization: ${source}`);
}

assert.deepEqual(
  focusStepsFor("Read this example in order.", "# setup\nvalue = 1\nprint(value)")
    ?.flatMap((step) => step.lines),
  [2, 3],
  "generated tutor slides must never focus comment-only lines",
);

let sceneCount = 0;
let visualCount = 0;
let codeSceneCount = 0;
let focusStepCount = 0;

for (const atom of lectures) {
  const scenes = buildScenes(atom);
  const visualScenes = scenes.filter((scene) => scene.visualKind);
  if (!visualScenes.length) fail(atom.id, "lesson has no guided visual");
  if (visualScenes.length > 4) {
    fail(atom.id, `repeats guided visuals on ${visualScenes.length} scenes (maximum 4)`);
  }
  for (let index = 1; index < scenes.length; index += 1) {
    if (
      scenes[index].visualKind &&
      scenes[index - 1].visualKind === scenes[index].visualKind &&
      !/^[a-z]/.test(scenes[index].caption)
    ) {
      fail(`${atom.id} scene ${index + 1}`, "repeats the same visual on consecutive slides");
    }
  }

  scenes.forEach((scene, index) => {
    sceneCount += 1;
    if (scene.visualKind) visualCount += 1;
    const where = `${atom.id} scene ${index + 1}/${scenes.length}`;
    const spoken = forSpeech(scene.narration);
    const words = spoken.split(/\s+/).filter(Boolean);

    if (!spoken) fail(where, "silent scene");
    if (scene.kind !== "title" && words.length < 3) {
      fail(where, `abrupt narration (${JSON.stringify(spoken)})`);
    }
    if (/minus greater than|star times|less than class|\.!=|#|`|\*\*/i.test(spoken)) {
      fail(where, `malformed speech: ${spoken.slice(0, 140)}`);
    }
    if (/\b(?:hashtag|number sign|slash slash)\b/i.test(spoken)) {
      fail(where, `voice names comment punctuation: ${spoken.slice(0, 140)}`);
    }
    if (visualReference.test(scene.caption) && !scene.visualKind) {
      fail(where, "narration references a visual that is not displayed");
    }
    if (visibleCodeReference.test(scene.caption) && !scene.code) {
      fail(where, "narration references code that is not displayed");
    }
    if (/[�]|(?:Ã.|â€|â†)/.test(scene.caption + scene.narration)) {
      fail(where, "contains mojibake or replacement characters");
    }

    const seconds = sceneSeconds(scene, 1);
    if (scene.kind !== "title" && seconds < 3) {
      fail(where, `rushes past in ${seconds.toFixed(1)} seconds`);
    }
    if (seconds > 24) {
      fail(where, `overlong scene lasts ${seconds.toFixed(1)} seconds`);
    } else if (seconds > 20) {
      warn(where, `long scene lasts ${seconds.toFixed(1)} seconds`);
    }

    if (!scene.code) return;
    codeSceneCount += 1;
    const lines = scene.code.split("\n");
    if (lines.length > 22) warn(where, `dense code block has ${lines.length} lines`);

    const steps = scene.focusSteps ?? [];
    focusStepCount += steps.length;
    let previousAt = -1;
    for (const step of steps) {
      if (step.at < 0 || step.at > 1 || step.at < previousAt) {
        fail(where, `invalid focus timing ${step.at}`);
      }
      previousAt = step.at;
      for (const lineNumber of step.lines) {
        if (!lines[lineNumber - 1]) fail(where, `focus points outside code at line ${lineNumber}`);
        else if (isComment(lines[lineNumber - 1])) {
          fail(where, `focus points at comment line ${lineNumber}`);
        }
      }
      assert.deepEqual(
        focusedLinesAt(scene, step.at),
        step.lines,
        `${where}: focus should switch on its authored speech cue`,
      );
      if (revealedLineCount(scene, step.at) < Math.max(...step.lines)) {
        fail(where, `focus cue reveals a hidden target at ${step.at}`);
      }
    }
    if (steps[0]?.at > 0 && focusedLinesAt(scene, Math.max(0, steps[0].at - 0.001)).length) {
      fail(where, "highlight appears before the narration reaches its first cue");
    }
    const exactSpans = [...scene.caption.matchAll(/`([^`]+)`/g)]
      .map((match) => match[1].trim())
      .filter((span) =>
        span.length >= 2 && lines.some((line) => !isComment(line) && line.includes(span)),
      );
    if (exactSpans.length) {
      const focusedSource = (scene.focusLines ?? [])
        .map((lineNumber) => lines[lineNumber - 1] ?? "")
        .join("\n");
      if (!exactSpans.some((span) => focusedSource.includes(span))) {
        fail(where, "highlight misses the exact code named by the narration");
      }
    }

    for (const progress of [0, 0.25, 0.5, 0.75, 1]) {
      const shown = revealedLineCount(scene, progress);
      const focus = focusedLinesAt(scene, progress);
      if (shown < 0 || shown > lines.length) fail(where, `invalid reveal count ${shown}`);
      if (focus.some((line) => line > shown)) {
        fail(where, `focus targets hidden code at progress ${progress}`);
      }
    }
  });
}

console.log(
  `watch-course audit: ${lectures.length} lectures, ${sceneCount} scenes, ` +
  `${codeSceneCount} code scenes, ${focusStepCount} timed focus cues, ${visualCount} contextual visuals`,
);
if (warnings.length) {
  console.log(`\nWarnings (${warnings.length})`);
  for (const item of warnings.slice(0, 40)) console.log(`  - ${item}`);
}
if (failures.length) {
  console.error(`\nFailures (${failures.length})`);
  for (const item of failures.slice(0, 100)) console.error(`  - ${item}`);
  process.exit(1);
}
console.log("watch-course audit clean");

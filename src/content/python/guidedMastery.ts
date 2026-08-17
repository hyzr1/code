import type { Atom, Concept, LectureQuestion } from "../../types";

export interface GuidedMasterySpec {
  lessonId: string;
  atomId: string;
  conceptId: string;
  title: string;
  requires: string[];
  vocabulary: Array<[term: string, meaning: string]>;
  opening: string;
  outcome: string;
  why: string;
  mentalModel: string;
  firstTitle: string;
  firstIntro: string;
  firstCode: string;
  firstTrace: string;
  secondTitle: string;
  secondIntro: string;
  secondCode: string;
  secondTrace: string;
  mistake: string;
  checkpoint: string;
  checkpointAnswer: string;
  remember: string;
  /** Retrieval questions shown after the lecture. Three is the release target. */
  checks: LectureQuestion[];
}

const words = (value: string) => value.trim().split(/\s+/).filter(Boolean).length;

export function guidedMasteryAtom(spec: GuidedMasterySpec): Atom {
  const vocabulary = spec.vocabulary
    .map(([term, meaning]) => `- **${term}** — ${meaning}`)
    .join("\n");
  const body = `${spec.opening}

## What you will be able to explain

${spec.outcome}

## Words you will use

${vocabulary}

## Why this matters

${spec.why}

## A picture to keep in your head

${spec.mentalModel}

## ${spec.firstTitle}

${spec.firstIntro}

\`\`\`python
${spec.firstCode}
\`\`\`

## Walk through it one small step at a time

${spec.firstTrace}

## ${spec.secondTitle}

${spec.secondIntro}

\`\`\`python
${spec.secondCode}
\`\`\`

## Trace the second example

${spec.secondTrace}

## A mistake to avoid

${spec.mistake}

## Pause and predict

${spec.checkpoint}

## Check your thinking

${spec.checkpointAnswer}

## What to remember

**${spec.remember}**`;

  return {
    id: spec.atomId,
    title: spec.title,
    teaches: [spec.conceptId],
    requires: spec.requires,
    readingSeconds: Math.max(180, Math.ceil(words(body) / 2.35)),
    body,
    recall: spec.checkpoint,
    language: "python",
    checks: spec.checks,
  };
}

export function guidedMasteryConcept(spec: GuidedMasterySpec): Concept {
  return {
    id: spec.conceptId,
    title: spec.title,
    stage: 6,
    kind: "mental-model",
    requires: spec.requires,
    atom: spec.atomId,
    language: "python",
  };
}

export const guidedLessonContent = (specs: GuidedMasterySpec[]) =>
  Object.fromEntries(specs.map((spec) => [
    spec.lessonId,
    { atomId: spec.atomId, repIds: [], problemIds: [], drillIds: [] },
  ]));

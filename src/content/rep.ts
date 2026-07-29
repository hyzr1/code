import type { ConceptId, Problem, TestSpec } from "../types";

export interface RepSpec {
  id: string;
  lesson: string;
  teaches: ConceptId[];
  title: string;
  /** Markdown. Keep it to two sentences — a rep is one idea. */
  prompt: string;
  exportName: string;
  starter: string;
  /** `expect(fn(args)).toEqual(is)` — both sides are JS source. */
  cases?: { args: string; is: string }[];
  /** For reps that need a custom assertion (identity, mutation, throwing). */
  tests?: TestSpec[];
  /** Reps get exactly one hint. If you need two, it should be a problem. */
  hint: string;
  solution: string;
  seconds?: number;
  mistakes?: { match: string; hint: string }[];
}

/**
 * Expands a terse spec into a full Problem so reps reuse the entire existing
 * machinery — worker, harness, editor, mastery model. A rep is just a very
 * small problem, and modelling it as anything else would have meant a second
 * of everything.
 */
export function rep(spec: RepSpec): Problem {
  const generated: TestSpec[] = (spec.cases ?? []).map((c) => ({
    name: `${spec.exportName}(${c.args}) → ${c.is}`,
    code: `expect(fn(${c.args})).toEqual(${c.is});`,
  }));

  return {
    id: spec.id,
    kind: "problem",
    tier: "rep",
    lesson: spec.lesson,
    title: spec.title,
    teaches: spec.teaches,
    requires: [],
    difficulty: { concept: 1, implementation: 1, recall: 2 },
    estimatedMinutes: (spec.seconds ?? 60) / 60,
    exportName: spec.exportName,
    prompt: spec.prompt,
    scaffolds: {
      L1: spec.starter,
      L2: spec.starter,
      L3: spec.starter,
      L4: spec.starter,
    },
    tests: [...generated, ...(spec.tests ?? [])],
    hints: [{ rung: 0, text: spec.hint }],
    commonMistakes: spec.mistakes,
    solution: spec.solution,
  };
}

/** Sugar for the common `function name(args) {\n\n}` starter. */
export function stub(name: string, params: string): string {
  return `function ${name}(${params}) {\n  \n}`;
}

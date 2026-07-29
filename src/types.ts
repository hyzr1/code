export type ConceptId = string;
export type CourseLanguage = "javascript" | "python";
export type CareerTrack = "faang" | "swe" | "ml" | "quant";
export type ExperienceLevel = "restarting" | "beginner" | "intermediate" | "advanced";
export type CareerStage = "internship" | "new-grad" | "experienced";

export type ConceptKind =
  | "syntax"
  | "api"
  | "mental-model"
  | "pattern"
  | "algorithm";

export interface Concept {
  id: ConceptId;
  title: string;
  stage: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  kind: ConceptKind;
  requires: ConceptId[];
  atom?: string;
  /** Existing content predates language tracks, so omitted means JavaScript. */
  language?: CourseLanguage;
}

/**
 * Six ways to fail a problem. Each routes to different remediation — that
 * routing is the deliberate-practice engine, see EFFICIENCY-DESIGN.md §4.
 */
export type FailureMode =
  | "pattern"
  | "algorithm"
  | "syntax"
  | "edge"
  | "complexity"
  | "clock";

export const FAILURE_MODES: {
  id: FailureMode;
  label: string;
  detail: string;
}[] = [
  {
    id: "pattern",
    label: "Didn't see the approach",
    detail: "Told the pattern, you'd have solved it.",
  },
  {
    id: "algorithm",
    label: "Saw it, forgot how it works",
    detail: "Knew it wanted a heap. Forgot how heaps work.",
  },
  {
    id: "syntax",
    label: "Knew it, couldn't write it",
    detail: "The idea was clear. The JavaScript wasn't.",
  },
  {
    id: "edge",
    label: "Failed edge cases",
    detail: "Off-by-one, empty input, single element.",
  },
  {
    id: "complexity",
    label: "Worked but too slow",
    detail: "Brute force where something better existed.",
  },
  { id: "clock", label: "Ran out of time", detail: "Knew it all. Too slow." },
];

/** Scaffolding ladder. A concept isn't mastered until you clear L4 cold. */
export type ScaffoldLevel = "L1" | "L2" | "L3" | "L4";

export const SCAFFOLD_INFO: Record<
  ScaffoldLevel,
  { label: string; detail: string }
> = {
  L1: { label: "Guided", detail: "Skeleton given, hints inline, docs open." },
  L2: { label: "Scaffolded", detail: "Signature and comments given." },
  L3: { label: "Assisted", detail: "Blank file. Hints on request." },
  L4: { label: "Cold", detail: "Blank file. No hints, no autocomplete." },
};

export interface TestSpec {
  name: string;
  /** Hidden tests still run; you just don't see the body until you pass. */
  hidden?: boolean;
  /** Body has `fn`, `expect`, `assert`, `deepEqual` in scope. May use await. */
  code: string;
}

export interface HintRung {
  /** 0 = nudge, 1 = name the tool, 2 = full strategy. Never code. */
  rung: 0 | 1 | 2;
  text: string;
}

/**
 * Reps are the rung between a lecture and a problem: one idea, one or two
 * lines, graded instantly. Six of them fit in the time one problem takes, and
 * each fails in a way you can name. Most of a lesson is reps.
 */
export type Tier = "rep" | "problem" | "challenge";

export interface Problem {
  id: string;
  kind: "problem";
  tier: Tier;
  /** Lesson this belongs to, if it's part of the course spine. */
  lesson?: string;
  title: string;
  pattern?: string;
  teaches: ConceptId[];
  requires: ConceptId[];
  difficulty: { concept: number; implementation: number; recall: number };
  estimatedMinutes: number;
  prompt: string;
  exportName: string;
  scaffolds: Partial<Record<ScaffoldLevel, string>>;
  tests: TestSpec[];
  hints: HintRung[];
  /** Rung 3: Socratic checkpoints. Questions, never code. */
  walkthrough?: string[];
  solution: string;
  /** Matched against submitted source to surface a targeted nudge. */
  commonMistakes?: { match: string; hint: string }[];
  language?: CourseLanguage;
  /** Roles this unit is especially valuable for. Omitted means broadly useful. */
  tracks?: CareerTrack[];
  /** Searchable capabilities such as prefix-sum, probability, or systems. */
  skills?: string[];
  analysis?: {
    approach: string;
    invariant: string;
    time: string;
    space: string;
  };
}

export interface DrillBase {
  id: string;
  teaches: ConceptId[];
  estimatedSeconds: number;
  explanation: string;
  language?: CourseLanguage;
}

export interface ChoiceDrill extends DrillBase {
  kind: "predict-output" | "complexity" | "pattern-id";
  prompt: string;
  code?: string;
  choices: string[];
  answer: number;
}

export interface RecallDrill extends DrillBase {
  kind: "api-recall";
  prompt: string;
  code?: string;
  answer: string;
  accept: string[];
}

export interface TypeItOutDrill extends DrillBase {
  kind: "type-it-out";
  prompt: string;
  target: string;
}

/**
 * Approach drills train the step that actually fails under pressure: deciding
 * what to do before writing anything. No editor, no code — read a statement,
 * then answer brute force / bottleneck / tool / target. Two minutes each, so
 * fifteen fit in the time one implementation takes.
 */
export interface ApproachDrill extends DrillBase {
  kind: "approach";
  title: string;
  statement: string;
  steps: {
    question: string;
    choices: string[];
    answer: number;
    explanation: string;
  }[];
}

export type Drill =
  | ChoiceDrill
  | RecallDrill
  | TypeItOutDrill
  | ApproachDrill;

export interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  /** One line, second person: what you can do after this. */
  goal: string;
  atomId?: string;
  repIds: string[];
  problemIds: string[];
  /** Lessons that teach method rather than syntax use drills instead of reps. */
  drillIds?: string[];
  language?: CourseLanguage;
  tracks?: CareerTrack[];
}

export interface CourseModule {
  id: string;
  part: number;
  partTitle: string;
  title: string;
  summary: string;
  lessonIds: string[];
  language?: CourseLanguage;
  tracks?: CareerTrack[];
}

export interface Atom {
  id: string;
  title: string;
  teaches: ConceptId[];
  requires: ConceptId[];
  readingSeconds: number;
  /** Unwashed-flavoured markdown. See CONTENT-STYLE.md. */
  body: string;
  recall: string;
  language?: CourseLanguage;
  check?: {
    question: string;
    choices: string[];
    answer: number;
    explanation: string;
  };
}

// ---------------------------------------------------------------- runner

export interface TestResult {
  name: string;
  hidden: boolean;
  passed: boolean;
  message?: string;
  logs: string[];
}

export interface RunResult {
  ok: boolean;
  /** Set when user code itself threw before any test ran. */
  fatal?: string;
  timedOut?: boolean;
  results: TestResult[];
  logs: string[];
  ms: number;
}

// ---------------------------------------------------------------- progress

export interface ConceptState {
  /** 0..1, decays with time. */
  strength: number;
  /** epoch ms */
  lastSeen: number;
  due: number;
  /** consecutive successful cold retrievals */
  streak: number;
  reps: number;
  lapses: number;
}

export interface AttemptLog {
  at: number;
  unitId: string;
  unitKind: "problem" | "drill";
  passed: boolean;
  level?: ScaffoldLevel;
  hintsUsed: number;
  docsOpened: number;
  seconds: number;
  timeToFirstKeystroke?: number;
  failureMode?: FailureMode;
  /** Calibration: what you predicted before starting. */
  predicted?: "yes" | "maybe" | "no";
}

export interface LectureReview {
  at: number;
  atomId: string;
  score: number;
  confidence: "low" | "medium" | "high";
  correct?: boolean;
}

export interface Progress {
  concepts: Record<ConceptId, ConceptState>;
  /** Highest scaffold level cleared per problem. */
  cleared: Record<string, ScaffoldLevel>;
  attempts: AttemptLog[];
  sessions: { date: string; seconds: number; units: number }[];
  lectureReviews: LectureReview[];
}

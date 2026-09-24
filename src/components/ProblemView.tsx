import type { FailureMode, Problem, ScaffoldLevel } from "../types";
import PracticeWorkspace from "./PracticeWorkspace";
export interface ProblemOutcome {
  passed: boolean;
  level: ScaffoldLevel;
  hintsUsed: number;
  seconds: number;
  timeToFirstKeystroke?: number;
  failureMode?: FailureMode;
  predicted?: "yes" | "maybe" | "no";
}


export default function ProblemView({problem, level, onDone, onReviewLesson}: {problem: Problem; level: ScaffoldLevel; onDone: (outcome: ProblemOutcome) => void; onReviewLesson?: () => void}) {
 return <PracticeWorkspace key={problem.id} problem={problem} starter={problem.scaffolds[level]} onReviewLesson={onReviewLesson} onComplete={(outcome, passed) => onDone({...outcome, passed, level: level === "L4" ? "L3" : level})} />;
}

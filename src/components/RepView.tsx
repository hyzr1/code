import type { Problem } from "../types";
import PracticeWorkspace from "./PracticeWorkspace";
export interface RepOutcome { passed: boolean; hintsUsed: number; seconds: number; attempts: number }
export default function RepView({problem,index,total,onDone,onReviewLesson}: {problem: Problem; index: number; total: number; onDone: (outcome: RepOutcome) => void; onReviewLesson?: () => void}) { return <PracticeWorkspace key={problem.id} problem={problem} starter={problem.scaffolds.L3} label={`Exercise ${index+1} of ${total}`} onReviewLesson={onReviewLesson} onComplete={(outcome,passed)=>onDone({...outcome,passed})} />; }

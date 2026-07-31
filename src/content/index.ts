import type { Atom, CareerTrack, Concept, CourseLanguage, Drill, Lesson, Problem, Progress } from "../types";
import { ATOMS as CORE_ATOMS } from "./atoms";
import { DRILLS as CORE_DRILLS } from "./drills";
import { FLUENCY_PROBLEMS } from "./problems-fluency";
import { PATTERN_PROBLEMS } from "./problems-patterns";
import {
  COURSE_ATOMS as JS_COURSE_ATOMS,
  COURSE_DRILLS as JS_COURSE_DRILLS,
  COURSE_LESSONS as JS_COURSE_LESSONS,
  COURSE_MODULES as JS_COURSE_MODULES,
  COURSE_REPS as JS_COURSE_REPS,
} from "./course";
import { CONCEPTS as JS_CONCEPTS, STAGE_NAMES } from "./concepts";
import {
  PYTHON_ATOMS,
  PYTHON_CONCEPTS,
  PYTHON_DRILLS,
  PYTHON_LESSONS,
  PYTHON_MODULES,
  PYTHON_PROBLEMS,
} from "./python";
import { forLanguage } from "./language";
import { PYTHON_ADVANCED_PROBLEMS } from "./python/advancedProblems";

export { STAGE_NAMES };
export const CONCEPTS: Concept[] = [...JS_CONCEPTS, ...PYTHON_CONCEPTS];
export const CONCEPT_BY_ID = new Map(CONCEPTS.map((concept) => [concept.id, concept]));
export const COURSE_MODULES = [...JS_COURSE_MODULES, ...PYTHON_MODULES];
export const COURSE_LESSONS = [...JS_COURSE_LESSONS, ...PYTHON_LESSONS];

export const modulesFor = (language: CourseLanguage, track?: CareerTrack) =>
  forLanguage(COURSE_MODULES, language).filter((item) => !track || !item.tracks?.length || item.tracks.includes(track));
export const lessonsFor = (language: CourseLanguage, track?: CareerTrack) =>
  forLanguage(COURSE_LESSONS, language).filter((item) => !track || !item.tracks?.length || item.tracks.includes(track));

export const DRILLS: Drill[] = [...CORE_DRILLS, ...JS_COURSE_DRILLS, ...PYTHON_DRILLS];
export const DRILL_BY_ID = new Map(DRILLS.map((d) => [d.id, d]));

export const ATOMS: Atom[] = [...CORE_ATOMS, ...JS_COURSE_ATOMS, ...PYTHON_ATOMS];
export const ATOM_BY_ID = new Map(ATOMS.map((a) => [a.id, a]));
export const ATOM_BY_CONCEPT = new Map(
  ATOMS.flatMap((atom) => atom.teaches.map((id) => [id, atom] as const)),
);

export const PROBLEMS: Problem[] = [
  ...JS_COURSE_REPS,
  ...FLUENCY_PROBLEMS,
  ...PATTERN_PROBLEMS,
  ...PYTHON_PROBLEMS,
  ...PYTHON_ADVANCED_PROBLEMS,
];
export const PROBLEM_BY_ID = new Map(PROBLEMS.map((p) => [p.id, p]));

export const LESSON_BY_ID = new Map(COURSE_LESSONS.map((l) => [l.id, l]));
export const MODULE_BY_ID = new Map(COURSE_MODULES.map((m) => [m.id, m]));

/** Every graded unit in a lesson, in the order you meet them. */
export function lessonUnitIds(lesson: Lesson): string[] {
  return [
    ...(lesson.drillIds ?? []),
    ...lesson.repIds,
    ...lesson.problemIds,
  ];
}

export interface LessonProgress {
  done: number;
  total: number;
  complete: boolean;
}

export function lessonProgress(
  lesson: Lesson,
  progress: Progress,
): LessonProgress {
  const ids = lessonUnitIds(lesson);
  const manual = progress.manualComplete?.[lesson.id] === true;
  const done = ids.filter((id) => progress.cleared[id]).length;

  // A lesson with only a lecture (no graded units) counts as done once the
  // lecture's concepts have been touched — or when marked complete by hand.
  if (ids.length === 0) {
    const atom = lesson.atomId ? ATOM_BY_ID.get(lesson.atomId) : undefined;
    const seen = atom
      ? atom.teaches.every((c) => (progress.concepts[c]?.reps ?? 0) > 0)
      : false;
    const complete = seen || manual;
    return { done: complete ? 1 : 0, total: 1, complete };
  }

  // An explicit mark overrides the exercise-cleared count so the whole lesson
  // reads as finished everywhere the derived state is shown.
  const complete = done === ids.length || manual;
  return { done: manual ? ids.length : done, total: ids.length, complete };
}

/** The next lesson you haven't finished — where "Continue course" goes. */
export function currentLesson(
  progress: Progress,
  language: CourseLanguage = "javascript",
  track?: CareerTrack,
): Lesson | null {
  for (const lesson of lessonsFor(language, track)) {
    if (!lessonProgress(lesson, progress).complete) return lesson;
  }
  return null;
}

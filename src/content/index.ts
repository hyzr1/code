import type { Atom, CareerTrack, Concept, Course, CourseLanguage, Drill, Lesson, Problem, Progress } from "../types";
import { moduleCourse } from "./courses";
import { minimumPreparationLevel, type PreparationLevel } from "./companies";
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
import { PYTHON_LEETCODE_PROBLEMS } from "./python/leetcode";
import { PYTHON_ML_PROBLEMS } from "./python/mlProblems";
import { PYTHON_ML_CONCEPTS, PYTHON_ML_DRILLS } from "./python/ml";
import { ROADMAP_ATOMS, ROADMAP_CONCEPTS, ROADMAP_LESSON_CONTENT } from "./python/roadmapLectures";
import {
  ALGO_FOUNDATION_ATOMS,
  ALGO_FOUNDATION_CONCEPTS,
  ALGO_FOUNDATION_LESSON_CONTENT,
} from "./python/algoFoundationsLectures";
import {
  ALGO_LINEAR_STRUCTURE_ATOMS,
  ALGO_LINEAR_STRUCTURE_CONCEPTS,
  ALGO_LINEAR_STRUCTURE_LESSON_CONTENT,
} from "./python/algoLinearStructuresLectures";
import {
  ALGO_HASHING_ATOMS,
  ALGO_HASHING_CONCEPTS,
  ALGO_HASHING_LESSON_CONTENT,
} from "./python/algoHashingLectures";
import {
  ALGO_POINTER_WINDOW_ATOMS,
  ALGO_POINTER_WINDOW_CONCEPTS,
  ALGO_POINTER_WINDOW_LESSON_CONTENT,
} from "./python/algoPointerWindowLectures";
import {
  ALGO_STACK_QUEUE_ATOMS,
  ALGO_STACK_QUEUE_CONCEPTS,
  ALGO_STACK_QUEUE_LESSON_CONTENT,
} from "./python/algoStackQueueLectures";
import {
  ALGO_LINKED_LIST_ATOMS,
  ALGO_LINKED_LIST_CONCEPTS,
  ALGO_LINKED_LIST_LESSON_CONTENT,
} from "./python/algoLinkedListLectures";
import {
  ML_LINEAR_ALGEBRA_ATOMS,
  ML_LINEAR_ALGEBRA_CONCEPTS,
  ML_LINEAR_ALGEBRA_LESSON_CONTENT,
} from "./python/mlLinearAlgebraLectures";
import {
  ML_CALCULUS_ATOMS,
  ML_CALCULUS_CONCEPTS,
  ML_CALCULUS_LESSON_CONTENT,
} from "./python/mlCalculusLectures";
import {
  ML_PROBABILITY_ATOMS,
  ML_PROBABILITY_CONCEPTS,
  ML_PROBABILITY_LESSON_CONTENT,
} from "./python/mlProbabilityAdvancedLectures";
import {
  ALGO_ROADMAP_LESSONS,
  ALGO_ROADMAP_MODULES,
  ML_ROADMAP_LESSONS,
  ML_ROADMAP_MODULES,
  PYTHON_ROADMAP_LESSONS,
  PYTHON_ROADMAP_MODULES,
} from "./python/roadmap";

export { STAGE_NAMES };
export const CONCEPTS: Concept[] = [...JS_CONCEPTS, ...PYTHON_CONCEPTS, ...PYTHON_ML_CONCEPTS, ...ROADMAP_CONCEPTS, ...ALGO_FOUNDATION_CONCEPTS, ...ALGO_LINEAR_STRUCTURE_CONCEPTS, ...ALGO_HASHING_CONCEPTS, ...ALGO_POINTER_WINDOW_CONCEPTS, ...ALGO_STACK_QUEUE_CONCEPTS, ...ALGO_LINKED_LIST_CONCEPTS, ...ML_LINEAR_ALGEBRA_CONCEPTS, ...ML_CALCULUS_CONCEPTS, ...ML_PROBABILITY_CONCEPTS];
export const CONCEPT_BY_ID = new Map(CONCEPTS.map((concept) => [concept.id, concept]));
export const COURSE_MODULES = [...JS_COURSE_MODULES, ...PYTHON_MODULES, ...PYTHON_ROADMAP_MODULES, ...ALGO_ROADMAP_MODULES, ...ML_ROADMAP_MODULES];
const authoredRoadmapLessons = (lessons: Lesson[]) => lessons.map((lesson) => ({
  ...lesson,
  ...(ROADMAP_LESSON_CONTENT[lesson.id] ?? {}),
  ...(ALGO_FOUNDATION_LESSON_CONTENT[lesson.id] ?? {}),
  ...(ALGO_LINEAR_STRUCTURE_LESSON_CONTENT[lesson.id] ?? {}),
  ...(ALGO_HASHING_LESSON_CONTENT[lesson.id] ?? {}),
  ...(ALGO_POINTER_WINDOW_LESSON_CONTENT[lesson.id] ?? {}),
  ...(ALGO_STACK_QUEUE_LESSON_CONTENT[lesson.id] ?? {}),
  ...(ALGO_LINKED_LIST_LESSON_CONTENT[lesson.id] ?? {}),
  ...(ML_LINEAR_ALGEBRA_LESSON_CONTENT[lesson.id] ?? {}),
  ...(ML_CALCULUS_LESSON_CONTENT[lesson.id] ?? {}),
  ...(ML_PROBABILITY_LESSON_CONTENT[lesson.id] ?? {}),
}));
export const COURSE_LESSONS = [
  ...JS_COURSE_LESSONS,
  ...PYTHON_LESSONS,
  ...authoredRoadmapLessons(PYTHON_ROADMAP_LESSONS),
  ...authoredRoadmapLessons(ALGO_ROADMAP_LESSONS),
  ...authoredRoadmapLessons(ML_ROADMAP_LESSONS),
];

export const modulesFor = (language: CourseLanguage, track?: CareerTrack) =>
  forLanguage(COURSE_MODULES, language).filter((item) => !track || !item.tracks?.length || item.tracks.includes(track));
export const lessonsFor = (language: CourseLanguage, track?: CareerTrack) =>
  forLanguage(COURSE_LESSONS, language).filter((item) => !track || !item.tracks?.length || item.tracks.includes(track));

export const DRILLS: Drill[] = [...CORE_DRILLS, ...JS_COURSE_DRILLS, ...PYTHON_DRILLS, ...PYTHON_ML_DRILLS];
export const DRILL_BY_ID = new Map(DRILLS.map((d) => [d.id, d]));

export const ATOMS: Atom[] = [...CORE_ATOMS, ...JS_COURSE_ATOMS, ...PYTHON_ATOMS, ...ROADMAP_ATOMS, ...ALGO_FOUNDATION_ATOMS, ...ALGO_LINEAR_STRUCTURE_ATOMS, ...ALGO_HASHING_ATOMS, ...ALGO_POINTER_WINDOW_ATOMS, ...ALGO_STACK_QUEUE_ATOMS, ...ALGO_LINKED_LIST_ATOMS, ...ML_LINEAR_ALGEBRA_ATOMS, ...ML_CALCULUS_ATOMS, ...ML_PROBABILITY_ATOMS];
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
  ...PYTHON_LEETCODE_PROBLEMS,
  ...PYTHON_ML_PROBLEMS,
];
export const PROBLEM_BY_ID = new Map(PROBLEMS.map((p) => [p.id, p]));

export const LESSON_BY_ID = new Map(COURSE_LESSONS.map((l) => [l.id, l]));
export const MODULE_BY_ID = new Map(COURSE_MODULES.map((m) => [m.id, m]));

/** Modules belonging to a course, in roadmap order (part, then source order). */
export const modulesForCourse = (course: Course, level?: PreparationLevel) =>
  COURSE_MODULES.filter((module) => {
    if (moduleCourse(module) !== course) return false;
    if (course !== "swe" || level === undefined) return true;
    return module.lessonIds.some((id) => {
      const lesson = LESSON_BY_ID.get(id);
      return lesson && minimumPreparationLevel(lesson) <= level;
    });
  }).sort((a, b) => a.part - b.part);

/** Lessons of a course, grouped by their module in roadmap order. */
export const lessonsForCourse = (course: Course, level?: PreparationLevel): Lesson[] =>
  modulesForCourse(course, level).flatMap(
    (module) =>
      module.lessonIds
        .map((id) => LESSON_BY_ID.get(id))
        .filter((lesson): lesson is Lesson => Boolean(
          lesson && (course !== "swe" || level === undefined || minimumPreparationLevel(lesson) <= level),
        )),
  );

/** The next unfinished lesson in a course — where "Continue" goes. */
export function currentLessonForCourse(
  progress: Progress,
  course: Course,
  level?: PreparationLevel,
): Lesson | null {
  for (const lesson of lessonsForCourse(course, level)) {
    if (!lessonIsReady(lesson)) continue;
    if (!lessonProgress(lesson, progress).complete) return lesson;
  }
  return null;
}

/** Every graded unit in a lesson, in the order you meet them. */
export function lessonUnitIds(lesson: Lesson): string[] {
  return [
    ...(lesson.drillIds ?? []),
    ...lesson.repIds,
    ...lesson.problemIds,
  ];
}

/** A roadmap entry is not a playable lesson until real teaching content exists. */
export function lessonIsReady(lesson: Lesson): boolean {
  const hasLecture = Boolean(lesson.atomId && ATOM_BY_ID.has(lesson.atomId));
  return hasLecture || lessonUnitIds(lesson).length > 0;
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

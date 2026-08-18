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
import {
  MASTERY_EXERCISES,
  MASTERY_EXERCISE_LESSON_CONTENT,
} from "./python/masteryExercises";
import { MASTERY_EXTRA_CHECKS } from "./python/masteryChecks";
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
  ALGO_SORTING_ATOMS,
  ALGO_SORTING_CONCEPTS,
  ALGO_SORTING_LESSON_CONTENT,
} from "./python/algoSortingLectures";
import {
  ALGO_BINARY_SEARCH_ATOMS,
  ALGO_BINARY_SEARCH_CONCEPTS,
  ALGO_BINARY_SEARCH_LESSON_CONTENT,
} from "./python/algoBinarySearchLectures";
import {
  ALGO_BINARY_TREE_ATOMS,
  ALGO_BINARY_TREE_CONCEPTS,
  ALGO_BINARY_TREE_LESSON_CONTENT,
} from "./python/algoBinaryTreeLectures";
import {
  ALGO_BST_ATOMS,
  ALGO_BST_CONCEPTS,
  ALGO_BST_LESSON_CONTENT,
} from "./python/algoBstLectures";
import {
  ALGO_HEAP_ATOMS,
  ALGO_HEAP_CONCEPTS,
  ALGO_HEAP_LESSON_CONTENT,
} from "./python/algoHeapLectures";
import {
  ALGO_TRIE_ATOMS,
  ALGO_TRIE_CONCEPTS,
  ALGO_TRIE_LESSON_CONTENT,
} from "./python/algoTrieLectures";
import {
  ALGO_GRAPH_FOUNDATION_ATOMS,
  ALGO_GRAPH_FOUNDATION_CONCEPTS,
  ALGO_GRAPH_FOUNDATION_LESSON_CONTENT,
} from "./python/algoGraphFoundationsLectures";
import {
  ALGO_GRAPH_CONNECTIVITY_ATOMS,
  ALGO_GRAPH_CONNECTIVITY_CONCEPTS,
  ALGO_GRAPH_CONNECTIVITY_LESSON_CONTENT,
} from "./python/algoGraphConnectivityLectures";
import {
  ALGO_WEIGHTED_GRAPH_ATOMS,
  ALGO_WEIGHTED_GRAPH_CONCEPTS,
  ALGO_WEIGHTED_GRAPH_LESSON_CONTENT,
} from "./python/algoWeightedGraphLectures";
import {
  ALGO_ADVANCED_GRAPH_ATOMS,
  ALGO_ADVANCED_GRAPH_CONCEPTS,
  ALGO_ADVANCED_GRAPH_LESSON_CONTENT,
} from "./python/algoAdvancedGraphLectures";
import {
  ALGO_BACKTRACKING_ATOMS,
  ALGO_BACKTRACKING_CONCEPTS,
  ALGO_BACKTRACKING_LESSON_CONTENT,
} from "./python/algoBacktrackingLectures";
import {
  ALGO_GREEDY_ATOMS,
  ALGO_GREEDY_CONCEPTS,
  ALGO_GREEDY_LESSON_CONTENT,
} from "./python/algoGreedyLectures";
import {
  ALGO_DIVIDE_CONQUER_ATOMS,
  ALGO_DIVIDE_CONQUER_CONCEPTS,
  ALGO_DIVIDE_CONQUER_LESSON_CONTENT,
} from "./python/algoDivideConquerLectures";
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
  ML_STATISTICS_ATOMS,
  ML_STATISTICS_CONCEPTS,
  ML_STATISTICS_LESSON_CONTENT,
} from "./python/mlStatisticsAdvancedLectures";
import {
  ML_NUMERICAL_PYTHON_ATOMS,
  ML_NUMERICAL_PYTHON_CONCEPTS,
  ML_NUMERICAL_PYTHON_LESSON_CONTENT,
} from "./python/mlNumericalPythonLectures";
import {
  ML_DATA_HANDLING_ATOMS,
  ML_DATA_HANDLING_CONCEPTS,
  ML_DATA_HANDLING_LESSON_CONTENT,
} from "./python/mlDataHandlingLectures";
import {
  ML_TORCH_FOUNDATION_ATOMS,
  ML_TORCH_FOUNDATION_CONCEPTS,
  ML_TORCH_FOUNDATION_LESSON_CONTENT,
} from "./python/mlTorchFoundationsLectures";
import {
  ML_WORKFLOW_ATOMS,
  ML_WORKFLOW_CONCEPTS,
  ML_WORKFLOW_LESSON_CONTENT,
} from "./python/mlWorkflowLectures";
import {
  ML_FRAMING_ATOMS,
  ML_FRAMING_CONCEPTS,
  ML_FRAMING_LESSON_CONTENT,
} from "./python/mlFramingAdvancedLectures";
import {
  ML_LINEAR_MODELS_ATOMS,
  ML_LINEAR_MODELS_CONCEPTS,
  ML_LINEAR_MODELS_LESSON_CONTENT,
} from "./python/mlLinearModelsAdvancedLectures";
import {
  ML_CLASSICAL_MODEL_ATOMS,
  ML_CLASSICAL_MODEL_CONCEPTS,
  ML_CLASSICAL_MODEL_LESSON_CONTENT,
} from "./python/mlClassicalModelsLectures";
import {
  ML_ENSEMBLE_ATOMS,
  ML_ENSEMBLE_CONCEPTS,
  ML_ENSEMBLE_LESSON_CONTENT,
} from "./python/mlEnsembleLectures";
import {
  ML_KERNEL_MARGIN_ATOMS,
  ML_KERNEL_MARGIN_CONCEPTS,
  ML_KERNEL_MARGIN_LESSON_CONTENT,
} from "./python/mlKernelMarginLectures";
import {
  ML_UNSUPERVISED_ATOMS,
  ML_UNSUPERVISED_CONCEPTS,
  ML_UNSUPERVISED_LESSON_CONTENT,
} from "./python/mlUnsupervisedLectures";
import {
  ML_EVALUATION_ATOMS,
  ML_EVALUATION_CONCEPTS,
  ML_EVALUATION_LESSON_CONTENT,
} from "./python/mlEvaluationLectures";
import {
  ML_NEURAL_BASICS_ATOMS,
  ML_NEURAL_BASICS_CONCEPTS,
  ML_NEURAL_BASICS_LESSON_CONTENT,
} from "./python/mlNeuralBasicsLectures";
import {
  ALGO_DYNAMIC_PROGRAMMING_ATOMS,
  ALGO_DYNAMIC_PROGRAMMING_CONCEPTS,
  ALGO_DYNAMIC_PROGRAMMING_LESSON_CONTENT,
} from "./python/algoDynamicProgrammingLectures";
import {
  ML_TRAINING_ATOMS,
  ML_TRAINING_CONCEPTS,
  ML_TRAINING_LESSON_CONTENT,
} from "./python/mlTrainingLectures";
import {
  ALGO_DP_CLASSIC_ATOMS,
  ALGO_DP_CLASSIC_CONCEPTS,
  ALGO_DP_CLASSIC_LESSON_CONTENT,
} from "./python/algoDpClassicLectures";
import {
  ML_OPTIMIZATION_ATOMS,
  ML_OPTIMIZATION_CONCEPTS,
  ML_OPTIMIZATION_LESSON_CONTENT,
} from "./python/mlOptimizationLectures";
import {
  ALGO_GRID_DP_ATOMS,
  ALGO_GRID_DP_CONCEPTS,
  ALGO_GRID_DP_LESSON_CONTENT,
} from "./python/algoGridDpLectures";
import {
  ML_TRAINING_STABILITY_ATOMS,
  ML_TRAINING_STABILITY_CONCEPTS,
  ML_TRAINING_STABILITY_LESSON_CONTENT,
} from "./python/mlTrainingStabilityLectures";
import {
  ALGO_ADVANCED_DP_ATOMS,
  ALGO_ADVANCED_DP_CONCEPTS,
  ALGO_ADVANCED_DP_LESSON_CONTENT,
} from "./python/algoAdvancedDpLectures";
import {
  ML_CONVOLUTIONAL_ATOMS,
  ML_CONVOLUTIONAL_CONCEPTS,
  ML_CONVOLUTIONAL_LESSON_CONTENT,
} from "./python/mlConvolutionalLectures";
import {
  ALGO_PATTERN_MATCHING_ATOMS,
  ALGO_PATTERN_MATCHING_CONCEPTS,
  ALGO_PATTERN_MATCHING_LESSON_CONTENT,
} from "./python/algoPatternMatchingLectures";
import {
  ML_VISION_TASKS_ATOMS,
  ML_VISION_TASKS_CONCEPTS,
  ML_VISION_TASKS_LESSON_CONTENT,
} from "./python/mlVisionTasksLectures";
import {
  ALGO_STRING_STRUCTURES_ATOMS,
  ALGO_STRING_STRUCTURES_CONCEPTS,
  ALGO_STRING_STRUCTURES_LESSON_CONTENT,
} from "./python/algoStringStructuresLectures";
import {
  ML_SEQUENCE_ATOMS,
  ML_SEQUENCE_CONCEPTS,
  ML_SEQUENCE_LESSON_CONTENT,
} from "./python/mlSequenceLectures";
import {
  ML_ATTENTION_ATOMS,
  ML_ATTENTION_CONCEPTS,
  ML_ATTENTION_LESSON_CONTENT,
} from "./python/mlAttentionLectures";
import {
  ALGO_NUMBER_THEORY_ATOMS,
  ALGO_NUMBER_THEORY_CONCEPTS,
  ALGO_NUMBER_THEORY_LESSON_CONTENT,
} from "./python/algoNumberTheoryLectures";
import {
  ALGO_BIT_MANIPULATION_ATOMS,
  ALGO_BIT_MANIPULATION_CONCEPTS,
  ALGO_BIT_MANIPULATION_LESSON_CONTENT,
} from "./python/algoBitManipulationLectures";
import {
  ML_TEXT_REPRESENTATION_ATOMS,
  ML_TEXT_REPRESENTATION_CONCEPTS,
  ML_TEXT_REPRESENTATION_LESSON_CONTENT,
} from "./python/mlTextRepresentationLectures";
import {
  ALGO_GEOMETRY_ATOMS,
  ALGO_GEOMETRY_CONCEPTS,
  ALGO_GEOMETRY_LESSON_CONTENT,
} from "./python/algoGeometryLectures";
import {
  ML_TRANSFORMER_ATOMS,
  ML_TRANSFORMER_CONCEPTS,
  ML_TRANSFORMER_LESSON_CONTENT,
} from "./python/mlTransformerLectures";
import {
  ML_LANGUAGE_MODELING_ATOMS,
  ML_LANGUAGE_MODELING_CONCEPTS,
  ML_LANGUAGE_MODELING_LESSON_CONTENT,
} from "./python/mlLanguageModelingLectures";
import {
  ALGO_QUERY_DECOMPOSITION_ATOMS,
  ALGO_QUERY_DECOMPOSITION_CONCEPTS,
  ALGO_QUERY_DECOMPOSITION_LESSON_CONTENT,
} from "./python/algoQueryDecompositionLectures";
import {
  ALGO_ROADMAP_LESSONS,
  ALGO_ROADMAP_MODULES,
  ML_ROADMAP_LESSONS,
  ML_ROADMAP_MODULES,
  PYTHON_ROADMAP_LESSONS,
  PYTHON_ROADMAP_MODULES,
} from "./python/roadmap";

export { STAGE_NAMES };
export const CONCEPTS: Concept[] = [...JS_CONCEPTS, ...PYTHON_CONCEPTS, ...PYTHON_ML_CONCEPTS, ...ROADMAP_CONCEPTS, ...ALGO_FOUNDATION_CONCEPTS, ...ALGO_LINEAR_STRUCTURE_CONCEPTS, ...ALGO_HASHING_CONCEPTS, ...ALGO_POINTER_WINDOW_CONCEPTS, ...ALGO_STACK_QUEUE_CONCEPTS, ...ALGO_LINKED_LIST_CONCEPTS, ...ALGO_SORTING_CONCEPTS, ...ALGO_BINARY_SEARCH_CONCEPTS, ...ALGO_BINARY_TREE_CONCEPTS, ...ALGO_BST_CONCEPTS, ...ALGO_HEAP_CONCEPTS, ...ALGO_TRIE_CONCEPTS, ...ALGO_GRAPH_FOUNDATION_CONCEPTS, ...ALGO_GRAPH_CONNECTIVITY_CONCEPTS, ...ALGO_WEIGHTED_GRAPH_CONCEPTS, ...ALGO_ADVANCED_GRAPH_CONCEPTS, ...ALGO_BACKTRACKING_CONCEPTS, ...ALGO_GREEDY_CONCEPTS, ...ALGO_DIVIDE_CONQUER_CONCEPTS, ...ML_LINEAR_ALGEBRA_CONCEPTS, ...ML_CALCULUS_CONCEPTS, ...ML_PROBABILITY_CONCEPTS, ...ML_STATISTICS_CONCEPTS, ...ML_NUMERICAL_PYTHON_CONCEPTS, ...ML_DATA_HANDLING_CONCEPTS, ...ML_TORCH_FOUNDATION_CONCEPTS, ...ML_WORKFLOW_CONCEPTS, ...ML_FRAMING_CONCEPTS, ...ML_LINEAR_MODELS_CONCEPTS, ...ML_CLASSICAL_MODEL_CONCEPTS, ...ML_ENSEMBLE_CONCEPTS, ...ML_KERNEL_MARGIN_CONCEPTS, ...ML_UNSUPERVISED_CONCEPTS, ...ML_EVALUATION_CONCEPTS, ...ML_NEURAL_BASICS_CONCEPTS, ...ALGO_DYNAMIC_PROGRAMMING_CONCEPTS, ...ML_TRAINING_CONCEPTS, ...ALGO_DP_CLASSIC_CONCEPTS, ...ML_OPTIMIZATION_CONCEPTS, ...ALGO_GRID_DP_CONCEPTS, ...ML_TRAINING_STABILITY_CONCEPTS, ...ALGO_ADVANCED_DP_CONCEPTS, ...ML_CONVOLUTIONAL_CONCEPTS, ...ALGO_PATTERN_MATCHING_CONCEPTS, ...ML_VISION_TASKS_CONCEPTS, ...ALGO_STRING_STRUCTURES_CONCEPTS, ...ML_SEQUENCE_CONCEPTS, ...ML_ATTENTION_CONCEPTS, ...ALGO_NUMBER_THEORY_CONCEPTS, ...ALGO_BIT_MANIPULATION_CONCEPTS, ...ML_TEXT_REPRESENTATION_CONCEPTS, ...ALGO_GEOMETRY_CONCEPTS, ...ML_TRANSFORMER_CONCEPTS, ...ML_LANGUAGE_MODELING_CONCEPTS, ...ALGO_QUERY_DECOMPOSITION_CONCEPTS];
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
  ...(ALGO_SORTING_LESSON_CONTENT[lesson.id] ?? {}),
  ...(ALGO_BINARY_SEARCH_LESSON_CONTENT[lesson.id] ?? {}),
  ...(ALGO_BINARY_TREE_LESSON_CONTENT[lesson.id] ?? {}),
  ...(ALGO_BST_LESSON_CONTENT[lesson.id] ?? {}),
  ...(ALGO_HEAP_LESSON_CONTENT[lesson.id] ?? {}),
  ...(ALGO_TRIE_LESSON_CONTENT[lesson.id] ?? {}),
  ...(ALGO_GRAPH_FOUNDATION_LESSON_CONTENT[lesson.id] ?? {}),
  ...(ALGO_GRAPH_CONNECTIVITY_LESSON_CONTENT[lesson.id] ?? {}),
  ...(ALGO_WEIGHTED_GRAPH_LESSON_CONTENT[lesson.id] ?? {}),
  ...(ALGO_ADVANCED_GRAPH_LESSON_CONTENT[lesson.id] ?? {}),
  ...(ALGO_BACKTRACKING_LESSON_CONTENT[lesson.id] ?? {}),
  ...(ALGO_GREEDY_LESSON_CONTENT[lesson.id] ?? {}),
  ...(ALGO_DIVIDE_CONQUER_LESSON_CONTENT[lesson.id] ?? {}),
  ...(ML_LINEAR_ALGEBRA_LESSON_CONTENT[lesson.id] ?? {}),
  ...(ML_CALCULUS_LESSON_CONTENT[lesson.id] ?? {}),
  ...(ML_PROBABILITY_LESSON_CONTENT[lesson.id] ?? {}),
  ...(ML_STATISTICS_LESSON_CONTENT[lesson.id] ?? {}),
  ...(ML_NUMERICAL_PYTHON_LESSON_CONTENT[lesson.id] ?? {}),
  ...(ML_DATA_HANDLING_LESSON_CONTENT[lesson.id] ?? {}),
  ...(ML_TORCH_FOUNDATION_LESSON_CONTENT[lesson.id] ?? {}),
  ...(ML_WORKFLOW_LESSON_CONTENT[lesson.id] ?? {}),
  ...(ML_FRAMING_LESSON_CONTENT[lesson.id] ?? {}),
  ...(ML_LINEAR_MODELS_LESSON_CONTENT[lesson.id] ?? {}),
  ...(ML_CLASSICAL_MODEL_LESSON_CONTENT[lesson.id] ?? {}),
  ...(ML_ENSEMBLE_LESSON_CONTENT[lesson.id] ?? {}),
  ...(ML_KERNEL_MARGIN_LESSON_CONTENT[lesson.id] ?? {}),
  ...(ML_UNSUPERVISED_LESSON_CONTENT[lesson.id] ?? {}),
  ...(ML_EVALUATION_LESSON_CONTENT[lesson.id] ?? {}),
  ...(ML_NEURAL_BASICS_LESSON_CONTENT[lesson.id] ?? {}),
  ...(ALGO_DYNAMIC_PROGRAMMING_LESSON_CONTENT[lesson.id] ?? {}),
  ...(ML_TRAINING_LESSON_CONTENT[lesson.id] ?? {}),
  ...(ALGO_DP_CLASSIC_LESSON_CONTENT[lesson.id] ?? {}),
  ...(ML_OPTIMIZATION_LESSON_CONTENT[lesson.id] ?? {}),
  ...(ALGO_GRID_DP_LESSON_CONTENT[lesson.id] ?? {}),
  ...(ML_TRAINING_STABILITY_LESSON_CONTENT[lesson.id] ?? {}),
  ...(ALGO_ADVANCED_DP_LESSON_CONTENT[lesson.id] ?? {}),
  ...(ML_CONVOLUTIONAL_LESSON_CONTENT[lesson.id] ?? {}),
  ...(ALGO_PATTERN_MATCHING_LESSON_CONTENT[lesson.id] ?? {}),
  ...(ML_VISION_TASKS_LESSON_CONTENT[lesson.id] ?? {}),
  ...(ALGO_STRING_STRUCTURES_LESSON_CONTENT[lesson.id] ?? {}),
  ...(ML_SEQUENCE_LESSON_CONTENT[lesson.id] ?? {}),
  ...(ML_ATTENTION_LESSON_CONTENT[lesson.id] ?? {}),
  ...(ALGO_NUMBER_THEORY_LESSON_CONTENT[lesson.id] ?? {}),
  ...(ALGO_BIT_MANIPULATION_LESSON_CONTENT[lesson.id] ?? {}),
  ...(ML_TEXT_REPRESENTATION_LESSON_CONTENT[lesson.id] ?? {}),
  ...(ALGO_GEOMETRY_LESSON_CONTENT[lesson.id] ?? {}),
  ...(ML_TRANSFORMER_LESSON_CONTENT[lesson.id] ?? {}),
  ...(ML_LANGUAGE_MODELING_LESSON_CONTENT[lesson.id] ?? {}),
  ...(ALGO_QUERY_DECOMPOSITION_LESSON_CONTENT[lesson.id] ?? {}),
  // Practice is attached last so it fills the empty repIds the lecture
  // content declares, turning each lesson into watch-then-do.
  ...(MASTERY_EXERCISE_LESSON_CONTENT[lesson.id] ?? {}),
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

const AUTHORED_ATOMS: Atom[] = [...CORE_ATOMS, ...JS_COURSE_ATOMS, ...PYTHON_ATOMS, ...ROADMAP_ATOMS, ...ALGO_FOUNDATION_ATOMS, ...ALGO_LINEAR_STRUCTURE_ATOMS, ...ALGO_HASHING_ATOMS, ...ALGO_POINTER_WINDOW_ATOMS, ...ALGO_STACK_QUEUE_ATOMS, ...ALGO_LINKED_LIST_ATOMS, ...ALGO_SORTING_ATOMS, ...ALGO_BINARY_SEARCH_ATOMS, ...ALGO_BINARY_TREE_ATOMS, ...ALGO_BST_ATOMS, ...ALGO_HEAP_ATOMS, ...ALGO_TRIE_ATOMS, ...ALGO_GRAPH_FOUNDATION_ATOMS, ...ALGO_GRAPH_CONNECTIVITY_ATOMS, ...ALGO_WEIGHTED_GRAPH_ATOMS, ...ALGO_ADVANCED_GRAPH_ATOMS, ...ALGO_BACKTRACKING_ATOMS, ...ALGO_GREEDY_ATOMS, ...ALGO_DIVIDE_CONQUER_ATOMS, ...ML_LINEAR_ALGEBRA_ATOMS, ...ML_CALCULUS_ATOMS, ...ML_PROBABILITY_ATOMS, ...ML_STATISTICS_ATOMS, ...ML_NUMERICAL_PYTHON_ATOMS, ...ML_DATA_HANDLING_ATOMS, ...ML_TORCH_FOUNDATION_ATOMS, ...ML_WORKFLOW_ATOMS, ...ML_FRAMING_ATOMS, ...ML_LINEAR_MODELS_ATOMS, ...ML_CLASSICAL_MODEL_ATOMS, ...ML_ENSEMBLE_ATOMS, ...ML_KERNEL_MARGIN_ATOMS, ...ML_UNSUPERVISED_ATOMS, ...ML_EVALUATION_ATOMS, ...ML_NEURAL_BASICS_ATOMS, ...ALGO_DYNAMIC_PROGRAMMING_ATOMS, ...ML_TRAINING_ATOMS, ...ALGO_DP_CLASSIC_ATOMS, ...ML_OPTIMIZATION_ATOMS, ...ALGO_GRID_DP_ATOMS, ...ML_TRAINING_STABILITY_ATOMS, ...ALGO_ADVANCED_DP_ATOMS, ...ML_CONVOLUTIONAL_ATOMS, ...ALGO_PATTERN_MATCHING_ATOMS, ...ML_VISION_TASKS_ATOMS, ...ALGO_STRING_STRUCTURES_ATOMS, ...ML_SEQUENCE_ATOMS, ...ML_ATTENTION_ATOMS, ...ALGO_NUMBER_THEORY_ATOMS, ...ALGO_BIT_MANIPULATION_ATOMS, ...ML_TEXT_REPRESENTATION_ATOMS, ...ALGO_GEOMETRY_ATOMS, ...ML_TRANSFORMER_ATOMS, ...ML_LANGUAGE_MODELING_ATOMS, ...ALGO_QUERY_DECOMPOSITION_ATOMS];

/** Release target is three retrieval questions per mastery lecture; the
 *  authored files ship two, so the third is appended here. */
export const ATOMS: Atom[] = AUTHORED_ATOMS.map((atom) => {
  const extra = MASTERY_EXTRA_CHECKS[atom.id];
  if (!extra) return atom;
  return { ...atom, checks: [...(atom.checks ?? []), extra] };
});

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
  ...MASTERY_EXERCISES,
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
  const hasPractice = lessonUnitIds(lesson).length > 0;
  // Mastery-roadmap lessons ship only once they teach *and* test. A lecture
  // with no exercise is still being produced, so it stays "planned" rather
  // than being released as a playable lesson.
  if (/^py\.(ac|mc|pc)\./.test(lesson.id)) return hasLecture && hasPractice;
  return hasLecture || hasPractice;
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

import type { CareerTrack, Course, CourseModule } from "../types";
import type { PreparationLevel } from "./companies";

/** The live SWE course is one maximum-depth path. The company graph remains
 * preserved for a later release, but it does not change today's curriculum. */
export const ACTIVE_SWE_PREPARATION_LEVEL: PreparationLevel = 5;

/**
 * The released adaptive SWE path plus three visible, unreleased mastery
 * catalogs. Empty catalogs are never presented as playable courses.
 */
export interface CourseOption {
  id: Course;
  label: string;
  shortLabel: string;
  detail: string;
  accent: string;
  /** Shown as a one-line "assumes you already know Python" note. */
  assumesPython: boolean;
  comingSoon?: boolean;
  /** Kept in the content graph but not offered in the picker. */
  hidden?: boolean;
}

export const COURSES: CourseOption[] = [
  {
    id: "swe",
    label: "Frontier + FAANG SWE",
    shortLabel: "Frontier SWE",
    detail: "The complete path through practical Python, hard technical interviews, and production systems reasoning.",
    accent: "#8d6ae8",
    assumesPython: false,
  },
  // Python Mastery is authored but not on the release path, so it is hidden
  // from the picker entirely rather than advertised as coming soon. Its
  // modules stay in the content graph; nothing references them until it ships.
  {
    id: "python",
    label: "Python Mastery",
    shortLabel: "PY",
    detail: "Learn to program from zero — the foundation every other course builds on.",
    accent: "#3776ab",
    assumesPython: false,
    comingSoon: true,
    hidden: true,
  },
  {
    id: "algo",
    label: "Algo Mastery",
    shortLabel: "DSA",
    detail: "Data structures, algorithms, and interview mastery. Assumes Python.",
    accent: "#c96442",
    assumesPython: true,
    comingSoon: true,
  },
  {
    id: "ml",
    label: "ML Mastery",
    shortLabel: "ML",
    detail: "Bridge from Python into building ML — the math and the models. Assumes Python.",
    accent: "#2f9668",
    assumesPython: true,
    comingSoon: true,
  },
];

export const COURSE_BY_ID = new Map(COURSES.map((course) => [course.id, course]));

/** Courses offered in the picker. */
export const VISIBLE_COURSES = COURSES.filter((course) => !course.hidden);

/**
 * Which product owns a module. Explicit roadmap modules stay in their future
 * mastery catalogs; the fully authored original sequence forms the SWE path.
 */
export function moduleCourse(module: CourseModule): Course | null {
  // A module may declare its course explicitly (the full Algo/ML roadmaps do).
  if (module.course) return module.course;
  if ((module.language ?? "javascript") !== "python") return null;
  // The original, fully authored sequence is the adaptive SWE spine: practical
  // Python (m0-m7), interview reasoning (m8-m11), and systems (m12).
  if (/^py\.m(?:[0-9]|1[0-2])$/.test(module.id)) return "swe";
  return null;
}

/**
 * The recommendation and daily-session engines still reason in career tracks.
 * The user no longer picks one, so we derive a representative track from the
 * selected course.
 */
export function trackForCourse(course: Course, level?: PreparationLevel): CareerTrack {
  if (course === "ml") return "ml";
  if (course === "algo") return "faang";
  if (course === "swe" && (level ?? 1) >= 4) return "faang";
  return "swe";
}

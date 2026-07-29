import type { Atom, CourseModule, Drill, Lesson, Problem } from "../../types";
import { M0_ATOMS, M0_LESSONS, M0_REPS } from "./m0-first-steps";
import { M13_ATOMS, M13_DRILLS, M13_LESSONS } from "./m13-method";
import { M10_ATOMS, M10_LESSONS, M10_REPS } from "./m10-this-classes";
import { M11_ATOMS, M11_LESSONS, M11_REPS } from "./m11-async";
import {
  M12_ATOMS,
  M12_DRILLS,
  M12_LESSONS,
  M12_REPS,
} from "./m12-errors-modules";
import { M1_ATOMS, M1_LESSONS, M1_REPS } from "./m1-values";
import { M2_ATOMS, M2_LESSONS, M2_REPS } from "./m2-flow";
import { M3_ATOMS, M3_LESSONS, M3_REPS } from "./m3-functions";
import { M4_ATOMS, M4_LESSONS, M4_REPS } from "./m4-arrays";
import { M5_ATOMS, M5_LESSONS, M5_REPS } from "./m5-transform";
import { M6_ATOMS, M6_LESSONS, M6_REPS } from "./m6-objects";
import { M7_ATOMS, M7_LESSONS, M7_REPS } from "./m7-strings";
import { M8_ATOMS, M8_LESSONS, M8_REPS } from "./m8-mapset";
import { M9_ATOMS, M9_LESSONS, M9_REPS } from "./m9-closures";

/**
 * The course spine. See COURSE.md for the full 0→master map; what's built here
 * is Part 1 modules 1-5, the on-ramp.
 *
 * Order is meaningful — a lesson unlocks when everything before it is done.
 */
export const COURSE_MODULES: CourseModule[] = [
  {
    id: "m0",
    part: 1,
    partTitle: "The Language",
    title: "First Steps",
    summary:
      "Assumes you have never written a line of code. Statements, functions, numbers, text, arrays, objects, and how to read an error — everything the rest of the course builds on.",
    lessonIds: M0_LESSONS.map((l) => l.id),
  },
  {
    id: "m1",
    part: 1,
    partTitle: "The Language",
    title: "Values & Variables",
    summary:
      "What a value is, how to name one, and the four rules that cause most beginner bugs.",
    lessonIds: M1_LESSONS.map((l) => l.id),
  },
  {
    id: "m2",
    part: 1,
    partTitle: "The Language",
    title: "Control Flow",
    summary: "Branching and looping, and how to keep the important line unindented.",
    lessonIds: M2_LESSONS.map((l) => l.id),
  },
  {
    id: "m3",
    part: 1,
    partTitle: "The Language",
    title: "Functions",
    summary:
      "Taking input, handing back a value, and passing behaviour around as data.",
    lessonIds: M3_LESSONS.map((l) => l.id),
  },
  {
    id: "m4",
    part: 1,
    partTitle: "The Language",
    title: "Arrays I — the basics",
    summary: "Reaching into arrays, changing them, and searching them.",
    lessonIds: M4_LESSONS.map((l) => l.id),
  },
  {
    id: "m5",
    part: 1,
    partTitle: "The Language",
    title: "Arrays II — transformation",
    summary:
      "map, filter, reduce, sort — the five methods most working JavaScript is made of.",
    lessonIds: M5_LESSONS.map((l) => l.id),
  },
  {
    id: "m6",
    part: 1,
    partTitle: "The Language",
    title: "Objects",
    summary:
      "Named values: reading them, walking them, unpacking them, copying them without mutating, and using one as a lookup table instead of a chain of ifs.",
    lessonIds: M6_LESSONS.map((l) => l.id),
  },
  {
    id: "m7",
    part: 1,
    partTitle: "The Language",
    title: "Strings",
    summary:
      "Text you can slice but never edit: indexing, searching without the -1 trap, the split/join round trip, and characters as the numbers that make a frequency array work.",
    lessonIds: M7_LESSONS.map((l) => l.id),
  },
  {
    id: "m8",
    part: 1,
    partTitle: "The Language",
    title: "Map & Set",
    summary:
      "Instant membership, keys that keep their type, and the read-with-a-default write-back shape that solves counting, grouping and indexing.",
    lessonIds: M8_LESSONS.map((l) => l.id),
  },
  {
    id: "m9",
    part: 1,
    partTitle: "The Language",
    title: "Closures & higher-order functions",
    summary:
      "Why a variable outlives the function that made it, and the four things that buys you: private state, factories, callbacks and wrappers.",
    lessonIds: M9_LESSONS.map((l) => l.id),
  },
  {
    id: "m10",
    part: 1,
    partTitle: "The Language",
    title: "`this`, classes, prototypes",
    summary:
      "The one rule decided by the call site rather than the source: what `this` will be, how to pin it, what `new` really does, and the single sharing mechanism underneath every class.",
    lessonIds: M10_LESSONS.map((l) => l.id),
  },
  {
    id: "m11",
    part: 1,
    partTitle: "The Language",
    title: "Async",
    summary:
      "One thread, two queues, and everything that follows: promises, await, error handling that actually catches, the four combinators, and a worker pool for when all-at-once is the wrong answer.",
    lessonIds: M11_LESSONS.map((l) => l.id),
  },
  {
    id: "m12",
    part: 1,
    partTitle: "The Language",
    title: "Errors, modules, odds & ends",
    summary:
      "Failing on purpose and catching precisely, how one file becomes a module, and the JSON and Date behaviours that quietly eat your data.",
    lessonIds: M12_LESSONS.map((l) => l.id),
  },
  {
    id: "m13",
    part: 2,
    partTitle: "Thinking in Code",
    title: "The Method",
    summary:
      "What to do when you don't recognise the problem. The procedure that turns an unseen statement into a plan — no coding, all decision-making.",
    lessonIds: M13_LESSONS.map((l) => l.id),
  },
];

export const COURSE_LESSONS: Lesson[] = [
  ...M0_LESSONS,
  ...M1_LESSONS,
  ...M2_LESSONS,
  ...M3_LESSONS,
  ...M4_LESSONS,
  ...M5_LESSONS,
  ...M6_LESSONS,
  ...M7_LESSONS,
  ...M8_LESSONS,
  ...M9_LESSONS,
  ...M10_LESSONS,
  ...M11_LESSONS,
  ...M12_LESSONS,
  ...M13_LESSONS,
];

export const COURSE_DRILLS: Drill[] = [...M12_DRILLS, ...M13_DRILLS];

export const COURSE_REPS: Problem[] = [
  ...M0_REPS,
  ...M1_REPS,
  ...M2_REPS,
  ...M3_REPS,
  ...M4_REPS,
  ...M5_REPS,
  ...M6_REPS,
  ...M7_REPS,
  ...M8_REPS,
  ...M9_REPS,
  ...M10_REPS,
  ...M11_REPS,
  ...M12_REPS,
];

export const COURSE_ATOMS: Atom[] = [
  ...M0_ATOMS,
  ...M1_ATOMS,
  ...M2_ATOMS,
  ...M3_ATOMS,
  ...M4_ATOMS,
  ...M5_ATOMS,
  ...M6_ATOMS,
  ...M7_ATOMS,
  ...M8_ATOMS,
  ...M9_ATOMS,
  ...M10_ATOMS,
  ...M11_ATOMS,
  ...M12_ATOMS,
  ...M13_ATOMS,
];

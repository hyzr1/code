import type { Course } from "./types";

export type Route =
  | { name: "course" }
  | { name: "lesson"; id: string }
  | { name: "problems" }
  | { name: "problem"; id: string }
  | { name: "session" }
  | { name: "progress" }
  | { name: "concept"; id: string }
  | { name: "type" }
  | { name: "typeCourse" }
  | { name: "typeLesson"; id: string }
  | { name: "typeTest" };

const COURSE_SLUGS: Record<Course, string> = {
  swe: "python",
  python: "python",
  algo: "dsa",
  ml: "machine-learning",
};

const SLUG_COURSES: Record<string, Course> = {
  python: "swe",
  dsa: "algo",
  algorithms: "algo",
  ml: "ml",
  "machine-learning": "ml",
};

const segment = (value: string) => encodeURIComponent(value);
const decoded = (value?: string) => {
  if (!value) return "";
  try { return decodeURIComponent(value); } catch { return value; }
};

export function courseFromPath(pathname = location.pathname): Course | null {
  const match = /^\/courses\/([^/]+)/.exec(pathname);
  return match ? SLUG_COURSES[match[1].toLowerCase()] ?? null : null;
}

export function routeFromPath(pathname = location.pathname): Route {
  const clean = pathname.replace(/\/+$/, "") || "/";
  let match: RegExpExecArray | null;
  if ((match = /^\/courses\/[^/]+\/lessons\/(.+)$/.exec(clean))) {
    return { name: "lesson", id: decoded(match[1]) };
  }
  if (/^\/courses(?:\/[^/]+)?$/.test(clean) || clean === "/") return { name: "course" };
  if ((match = /^\/problems\/(.+)$/.exec(clean))) return { name: "problem", id: decoded(match[1]) };
  if (clean === "/problems") return { name: "problems" };
  if (clean === "/practice/daily") return { name: "session" };
  if (clean === "/progress") return { name: "progress" };
  if ((match = /^\/concepts\/(.+)$/.exec(clean))) return { name: "concept", id: decoded(match[1]) };
  if ((match = /^\/typing\/lessons\/(.+)$/.exec(clean))) return { name: "typeLesson", id: decoded(match[1]) };
  if (clean === "/typing/course") return { name: "typeCourse" };
  if (clean === "/typing/test") return { name: "typeTest" };
  if (clean === "/typing") return { name: "type" };
  return { name: "course" };
}

export function pathForRoute(route: Route, course: Course): string {
  const coursePath = `/courses/${COURSE_SLUGS[course]}`;
  switch (route.name) {
    case "course": return coursePath;
    case "lesson": return `${coursePath}/lessons/${segment(route.id)}`;
    case "problems": return "/problems";
    case "problem": return `/problems/${segment(route.id)}`;
    case "session": return "/practice/daily";
    case "progress": return "/progress";
    case "concept": return `/concepts/${segment(route.id)}`;
    case "type": return "/typing";
    case "typeCourse": return "/typing/course";
    case "typeLesson": return `/typing/lessons/${segment(route.id)}`;
    case "typeTest": return "/typing/test";
  }
}

export function routeTitle(route: Route, detail?: string): string {
  const base = "Hyzr Code";
  if (detail) return `${detail} | ${base}`;
  const section = {
    course: "Courses",
    problems: "DSA Problems",
    session: "Daily Practice",
    progress: "Progress",
    type: "Typing",
    typeCourse: "Typing Course",
    typeTest: "Speed Test",
    lesson: "Lesson",
    problem: "Problem",
    concept: "Concept",
    typeLesson: "Typing Lesson",
  }[route.name];
  return `${section} | ${base}`;
}

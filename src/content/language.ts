import type {
  Atom,
  Concept,
  CourseLanguage,
  CourseModule,
  Drill,
  Lesson,
  Problem,
} from "../types";

export interface LanguageOption {
  id: CourseLanguage;
  label: string;
  shortLabel: string;
  detail: string;
  accent: string;
}
export const LANGUAGES: LanguageOption[] = [
  {
    id: "python",
    label: "Python",
    shortLabel: "PY",
    detail: "Language fundamentals, software fluency, and interview algorithms.",
    accent: "#3776ab",
  },
  {
    id: "javascript",
    label: "JavaScript",
    shortLabel: "JS",
    detail: "The original complete JavaScript language course.",
    accent: "#c99b12",
  },
];

type LanguageContent = Atom | Concept | CourseModule | Drill | Lesson | Problem;

/** Content written before multi-language support is the JavaScript course. */
export function contentLanguage(item: LanguageContent): CourseLanguage {
  return item.language ?? "javascript";
}

export function forLanguage<T extends LanguageContent>(
  items: readonly T[],
  language: CourseLanguage,
): T[] {
  return items.filter((item) => contentLanguage(item) === language);
}

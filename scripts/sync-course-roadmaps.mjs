import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const DEFINITIONS = [
  { course: "python", prefix: "py.pc", exportName: "PYTHON_ROADMAP", file: "python-course.md", masteryFrom: 7 },
  { course: "algo", prefix: "py.ac", exportName: "ALGO_ROADMAP", file: "algo-course.md", masteryFrom: 11 },
  { course: "ml", prefix: "py.mc", exportName: "ML_ROADMAP", file: "ml-course.md", masteryFrom: 11 },
];

const quote = (value) => JSON.stringify(value);

function canonicalizePartOrder(source) {
  const matches = [...source.matchAll(/^## Part (\d+)\s+[—-]\s+.+$/gmu)];
  if (matches.length < 2) return source;
  const prefix = source.slice(0, matches[0].index);
  const blocks = matches.map((match, index) => ({
    number: Number(match[1]),
    text: source.slice(match.index, matches[index + 1]?.index ?? source.length).trimEnd(),
  }));
  blocks.sort((left, right) => left.number - right.number);
  return `${prefix.trimEnd()}\n\n${blocks.map((block) => block.text).join("\n\n")}\n`;
}

function parseOutline(source, definition) {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const parts = new Map();
  const modules = [];
  const errors = [];
  let part = null;
  let module = null;

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index].trim();
    const partMatch = line.match(/^## Part (\d+)\s+[—-]\s+(.+)$/u);
    if (partMatch) {
      part = { number: Number(partMatch[1]), title: partMatch[2].trim() };
      parts.set(part.number, part);
      module = null;
      continue;
    }

    const moduleMatch = line.match(/^### Module (\d+)\.(\d+)\s+[—-]\s+(.+)$/u);
    if (moduleMatch) {
      const partNumber = Number(moduleMatch[1]);
      const moduleNumber = Number(moduleMatch[2]);
      if (!parts.has(partNumber)) {
        errors.push(`line ${index + 1}: module ${partNumber}.${moduleNumber} appears before its Part heading`);
      }
      module = {
        part: partNumber,
        number: moduleNumber,
        title: moduleMatch[3].trim(),
        summary: "",
        lessons: [],
        sourceLine: index + 1,
      };
      modules.push(module);
      continue;
    }

    if (!module || !line || line === "---" || line.startsWith("*")) continue;

    if (line.startsWith("- ")) {
      const lessonText = line.slice(2).trim();
      const separator = lessonText.indexOf(" — ");
      if (separator < 1 || separator === lessonText.length - 3) {
        errors.push(`line ${index + 1}: lesson must be \"title — measurable goal\": ${lessonText}`);
        continue;
      }
      const title = lessonText.slice(0, separator).trim().replace(/[.]$/, "");
      const goal = lessonText.slice(separator + 3).trim().replace(/^[a-z]/, (letter) => letter.toUpperCase());
      if (title.length < 3 || goal.length < 8) {
        errors.push(`line ${index + 1}: lesson title or goal is too vague: ${lessonText}`);
        continue;
      }
      module.lessons.push({ title, goal });
      continue;
    }

    if (!module.summary) module.summary = line;
  }

  for (const item of modules) {
    if (!item.summary) errors.push(`line ${item.sourceLine}: module ${item.part}.${item.number} has no summary`);
    if (!item.lessons.length) errors.push(`line ${item.sourceLine}: module ${item.part}.${item.number} has no lessons`);
  }

  if (errors.length) {
    throw new Error(`${definition.file} failed roadmap validation:\n- ${errors.join("\n- ")}`);
  }

  modules.sort((left, right) => left.part - right.part || left.number - right.number);
  return { parts, modules };
}

function renderCourse(definition, parsed) {
  const moduleRows = [];
  const lessonRows = [];

  for (const module of parsed.modules) {
    const moduleId = `${definition.prefix}.m${module.part}_${module.number}`;
    const lessonIds = module.lessons.map((_, index) => `${moduleId}.l${index + 1}`);
    const mastery = module.part >= definition.masteryFrom ? ", mastery: true" : "";
    moduleRows.push(
      `  { id: ${quote(moduleId)}, part: ${module.part}, partTitle: ${quote(parsed.parts.get(module.part).title)}, title: ${quote(module.title)}, summary: ${quote(module.summary)}, lessonIds: [${lessonIds.map(quote).join(", ")}], language: "python", course: ${quote(definition.course)}${mastery} },`,
    );
    module.lessons.forEach((lesson, index) => {
      lessonRows.push(
        `  { id: ${quote(lessonIds[index])}, moduleId: ${quote(moduleId)}, title: ${quote(lesson.title)}, goal: ${quote(lesson.goal)}, repIds: [], problemIds: [], language: "python" },`,
      );
    });
  }

  return `export const ${definition.exportName}_MODULES: CourseModule[] = [\n${moduleRows.join("\n")}\n];\n\nexport const ${definition.exportName}_LESSONS: Lesson[] = [\n${lessonRows.join("\n")}\n];`;
}

const sections = [];
for (const definition of DEFINITIONS) {
  const outlinePath = path.join(ROOT, "course-outlines", definition.file);
  const original = await readFile(outlinePath, "utf8");
  const source = canonicalizePartOrder(original);
  if (source !== original) await writeFile(outlinePath, source, "utf8");
  sections.push(renderCourse(definition, parseOutline(source, definition)));
}

const output = `import type { CourseModule, Lesson } from "../../types";\n\n/**\n * Dependency-ordered course roadmaps generated from course-outlines/*.md.\n+ *\n+ * A roadmap lesson is intentionally only a promise: it is not a completed\n+ * lecture until it has an atom, retrieval checks, practice, and rendered audio.\n+ * Edit the outlines, then run: npm run sync:roadmaps\n+ */\n\n${sections.join("\n\n")}\n`;

await writeFile(path.join(ROOT, "src", "content", "python", "roadmap.ts"), output, "utf8");
console.log("Synced validated Python, Algo, and ML roadmaps from course-outlines/*.md");

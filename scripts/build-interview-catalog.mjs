import fs from "node:fs";
import path from "node:path";
import { execFileSync, spawnSync } from "node:child_process";

const work = path.resolve("../work");
const catalog = JSON.parse(fs.readFileSync("scripts/interview-catalog.json", "utf8"));
const statements = JSON.parse(fs.readFileSync("scripts/interview-statements.json", "utf8"));
const sourceRoot = path.join(work, "neetcode-source");
if (!fs.existsSync(sourceRoot)) {
  execFileSync("git", ["clone", "--depth", "1", "https://github.com/neetcode-gh/leetcode.git", sourceRoot], { stdio: "inherit" });
}
const casesRoot = path.join(work, "cases");
fs.mkdirSync(casesRoot, { recursive: true });
const questionQuery = `query questionData($titleSlug: String!) { question(titleSlug: $titleSlug) { title difficulty metaData exampleTestcases sampleTestCase content codeSnippets { langSlug code } } }`;
for (const item of catalog) {
  const caseFile = path.join(casesRoot, `${item.slug}.json`);
  if (fs.existsSync(caseFile)) continue;
  const response = await fetch("https://leetcode.com/graphql/", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ query: questionQuery, variables: { titleSlug: item.slug } }) });
  const body = await response.json();
  if (!body.data?.question) throw new Error(`Could not download metadata for ${item.slug}`);
  fs.writeFileSync(caseFile, JSON.stringify(body.data.question, null, 2));
}
const manualOutputs = {
  "encode-and-decode-strings": [["Hello", "World"], [""]],
  "alien-dictionary": ["wertf", "zx", ""],
  "graph-valid-tree": [true, false],
  "meeting-rooms": [false, true],
  "meeting-rooms-ii": [2, 1],
  "number-of-connected-components-in-an-undirected-graph": [2, 1],
  "walls-and-gates": [
    [[3,-1,0,1],[2,2,1,-1],[1,-1,2,-1],[0,-1,3,4]],
    [[-1]]
  ]
};

const entities = { "&nbsp;": " ", "&lt;": "<", "&gt;": ">", "&amp;": "&", "&quot;": '"', "&#39;": "'" };
function cleanHtml(value) {
  return (value ?? "").replace(/<sup>(.*?)<\/sup>/gi, "^$1").replace(/<br\s*\/?>/gi, "\n").replace(/<\/(?:p|div|pre|li)>/gi, "\n").replace(/<[^>]+>/g, "").replace(/&(nbsp|lt|gt|amp|quot|#39);/g, token => entities[token] ?? token).replace(/\r/g, "").replace(/[ \t]+\n/g, "\n").trim();
}
function parseJson(value) {
  try { return JSON.parse(value); } catch { return value; }
}
function examples(question, meta, slug) {
  const lines = question.exampleTestcases.split(/\r?\n/).filter(line => line.trim() !== "");
  const count = meta.systemdesign ? 2 : meta.params?.length ?? 1;
  const inputs = [];
  for (let index = 0; index + count <= lines.length; index += count) inputs.push(lines.slice(index, index + count).map(parseJson));
  const plainContent = cleanHtml(question.content);
  const parsedOutputs = [...plainContent.matchAll(/^Output:?[ \t]*(?:\n[ \t]*)?(.+)$/gmi)].map(match => parseJson(match[1].trim().replace(/\bTrue\b/g,"true").replace(/\bFalse\b/g,"false").replace(/\bNone\b/g,"null")));
  const outputs = parsedOutputs.length ? parsedOutputs : (manualOutputs[slug] ?? []);
  return inputs.slice(0, outputs.length).map((input, index) => ({ input, output: outputs[index] }));
}
function articleFor(item) {
  const candidates = [item.ncSlug, item.slug, item.code?.replace(/^\d+-/, "")].filter(Boolean);
  for (const name of candidates) {
    const file = path.join(sourceRoot, "articles", `${name}.md`);
    if (fs.existsSync(file)) return fs.readFileSync(file, "utf8");
  }
  return "";
}
function validPython(code, exportName) {
  if (!new RegExp(`^class\\s+${exportName}\\s*[:(]`, "m").test(code)) return false;
  return spawnSync("python", ["-c", "import sys; compile(sys.stdin.read(), 'solution.py', 'exec')"], { input: code }).status === 0;
}
function hintsFor(item, article) {
  const candidates = [item.ncSlug, item.slug, item.code?.replace(/^\d+-/, "")].filter(Boolean);
  let text = "";
  for (const name of candidates) {
    const file = path.join(sourceRoot, "hints", `${name}.md`);
    if (fs.existsSync(file)) { text = fs.readFileSync(file, "utf8"); break; }
  }
  const hints = [...text.matchAll(/<summary>(?:Hint \d+|Recommended Time & Space Complexity)<\/summary>[\s\S]*?<p>([\s\S]*?)<\/p>/gi)].map(match => cleanHtml(match[1]));
  if (hints.length >= 3) return hints.slice(-3);
  const intuitions = [...article.matchAll(/### Intuition\s*([\s\S]*?)(?=###|---|::tabs-start)/gi)].map(match => cleanHtml(match[1])).filter(Boolean);
  const algorithms = [...article.matchAll(/### Algorithm\s*([\s\S]*?)(?=###|---|::tabs-start)/gi)].map(match => cleanHtml(match[1])).filter(Boolean);
  const intuition = intuitions.at(-1) ?? `Think about the information the ${item.category} pattern needs to retain.`;
  const firstSentence = intuition.match(/^.{1,280}?(?:[.!?](?=\s|$)|$)/)?.[0] ?? intuition.slice(0, 280);
  const strategy = algorithms.at(-1) ?? intuition;
  return [
    firstSentence,
    `The core pattern is **${item.category}**. ${intuition}`.slice(0, 1200),
    `Turn the idea into these steps:\n\n${strategy}`.slice(0, 1600),
  ];
}
function solutionFor(item, article, exportName) {
  const file = path.join(sourceRoot, "python", `${item.code}.py`);
  const blocks = [...article.matchAll(/```python\s*([\s\S]*?)```/gi)].map(match => match[1].trim()).filter(code => /class\s+(?:Solution|\w+):/.test(code));
  const source = fs.existsSync(file) ? fs.readFileSync(file, "utf8").trim() : "";
  if (validPython(source, exportName)) return source;
  return blocks.reverse().find(code => validPython(code, exportName)) ?? "";
}
function complexity(article) {
  const chunks = [...article.matchAll(/(?:### \d+\. .*?|## \d+\. .*?)([\s\S]*?)(?=\n##? \d+\.|$)/g)].map(match => match[1]);
  const chunk = chunks.at(-1) ?? article;
  const text = cleanHtml(chunk);
  const time = text.match(/Time (?:complexity)?\s*[:\-]\s*([^\n]+)/i)?.[1]?.trim() ?? "See analysis";
  const space = text.match(/Space (?:complexity)?\s*[:\-]\s*([^\n]+)/i)?.[1]?.trim() ?? "See analysis";
  const intuition = cleanHtml(chunk.match(/### Intuition\s*([\s\S]*?)(?:###|---|::tabs-start)/i)?.[1] ?? "").split("\n").filter(Boolean).slice(0,3).join(" ");
  return { approach: intuition || "Apply the standard pattern while maintaining the required invariant.", invariant: "Each completed step preserves the conditions stated in the problem.", time, space };
}
function scaffold(question, meta) {
  const code = question.codeSnippets?.find(snippet => snippet.langSlug === "python3")?.code ?? question.codeSnippets?.find(snippet => snippet.langSlug === "python")?.code;
  if (code) return code.replace(/^#.*\n(?:(?:#.*|\s*)\n)*/g, "").trimEnd();
  if (meta.classname) return `class ${meta.classname}:\n    def __init__(self, *args):\n        pass`;
  return `class Solution:\n    def ${meta.name || "solve"}(self, *args):\n        pass`;
}
function displayInput(meta, values) {
  if (meta.systemdesign) return `Operations: ${JSON.stringify(values[0])}\nArguments: ${JSON.stringify(values[1])}`;
  const names = meta.params?.map(param => param.name) ?? [];
  return values.map((value,index) => `${names[index] ?? `arg${index + 1}`} = ${JSON.stringify(value)}`).join("\n");
}

const built = [];
const supportModule = fs.readFileSync("src/engine/interviewSupport.ts", "utf8");
const support = supportModule.slice(supportModule.indexOf("String.raw`") + 11, supportModule.lastIndexOf("`;"));
for (const item of catalog) {
  const question = JSON.parse(fs.readFileSync(path.join(casesRoot, `${item.slug}.json`), "utf8"));
  const meta = JSON.parse(question.metaData);
  const cases = examples(question, meta, item.slug);
  const article = articleFor(item);
  const exportName = meta.systemdesign ? meta.classname : (item.slug === "serialize-and-deserialize-binary-tree" ? "Codec" : "Solution");
  const solution = solutionFor(item, article, exportName);
  if (!solution || !cases.length || !(item.slug in statements)) throw new Error(`Incomplete ${item.slug}: solution=${!!solution}, cases=${cases.length}, statement=${item.slug in statements}`);
  const inputs = cases.map(test => test.input);
  let expected;
  try {
    expected = JSON.parse(execFileSync("python", ["scripts/compute-interview-expected.py"], { input: JSON.stringify({ support, solution, exportName, slug: item.slug, meta, inputs }), maxBuffer: 8_000_000 }).toString());
  } catch (error) {
    throw new Error(`Reference solution failed for ${item.slug}: ${error.stderr?.toString() || error.message}`);
  }
  const starter = scaffold(question, meta);
  const hints = hintsFor(item, article);
  const analysis = complexity(article);
  built.push({
    id: `py.nc.${item.slug}`, kind: "problem", tier: "problem", title: item.title, pattern: item.category,
    teaches: ["py.method"], requires: [], difficulty: { concept: item.difficulty === "Easy" ? 2 : item.difficulty === "Medium" ? 3 : 5, implementation: item.difficulty === "Easy" ? 2 : item.difficulty === "Medium" ? 3 : 5, recall: 3 },
    displayDifficulty: item.difficulty, lists: item.lists, estimatedMinutes: item.difficulty === "Easy" ? 15 : item.difficulty === "Medium" ? 30 : 45,
    prompt: statements[item.slug], exportName, scaffolds: { L1: starter, L2: starter, L3: starter, L4: starter },
    examples: cases.map((test,index) => ({ input: displayInput(meta, test.input), output: JSON.stringify(expected[index]) })),
    tests: cases.map((test,index) => ({ name: `Example ${index + 1}`, hidden: index > 0, code: `_hyzr_check(fn, ${JSON.stringify(item.slug)}, json.loads(${JSON.stringify(JSON.stringify(meta))}), json.loads(${JSON.stringify(JSON.stringify(test.input))}), json.loads(${JSON.stringify(JSON.stringify(expected[index]))}))` })),
    hints: hints.map((text,index) => ({ rung: index, text })), walkthrough: hints,
    solution, language: "python", tracks: ["faang", "swe"], skills: [item.category.toLowerCase()], analysis,
    source: `https://neetcode.io/problems/${item.ncSlug || item.slug}`
  });
}

const banner = `import type { Problem } from "../../types";\n\n/** Generated from the MIT-licensed NeetCode study-list metadata, explanations, hints, and Python solutions.\n * Problem statements are independently written for Hyzr Code. Rebuild with scripts/build-interview-catalog.mjs. */\nexport const INTERVIEW_PROBLEMS: Problem[] = `;
fs.writeFileSync("src/content/python/interviewProblems.ts", banner + JSON.stringify(built,null,2) + ";\n");
fs.copyFileSync(path.join(sourceRoot,"LICENSE"), "public/NEETCODE-LICENSE.txt");
console.log(`Built ${built.length} problems with ${built.reduce((sum,item)=>sum+item.tests.length,0)} official examples.`);

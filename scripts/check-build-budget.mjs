import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const manifestPath = path.join(root, "dist", ".vite", "manifest.json");
if (!fs.existsSync(manifestPath)) {
  console.error("Build manifest missing. Run npm run build first.");
  process.exit(1);
}
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const entry = Object.values(manifest).find((item) => item.isEntry);
if (!entry) throw new Error("Could not find the browser entry in the Vite manifest");

const size = (file) => fs.statSync(path.join(root, "dist", file)).size;
const failures = [];
const check = (label, bytes, max) => {
  if (bytes > max) failures.push(`${label} is ${(bytes / 1024).toFixed(1)} KiB; budget is ${(max / 1024).toFixed(0)} KiB`);
};

check("startup JavaScript", size(entry.file), 240 * 1024);
for (const css of entry.css ?? []) check("startup CSS", size(css), 220 * 1024);

const problem = Object.values(manifest).find((item) => item.src === "src/components/ProblemView.tsx");
if (!problem?.isDynamicEntry) failures.push("Problem workspace is no longer route-split");
const lesson = Object.values(manifest).find((item) => item.src === "src/components/LessonView.tsx");
if (!lesson?.isDynamicEntry) failures.push("Lesson player is no longer route-split");

console.log(`performance budget: ${(size(entry.file) / 1024).toFixed(1)} KiB startup JS; ${problem ? "workspace split" : "workspace missing"}; ${lesson ? "lesson split" : "lesson missing"}`);
if (failures.length) {
  failures.forEach((failure) => console.error(`  - ${failure}`));
  process.exit(1);
}

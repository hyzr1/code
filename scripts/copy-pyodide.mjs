import { copyFile, mkdir, stat } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const source = join(root, "node_modules", "pyodide");
const target = join(root, "public", "pyodide");
const files = [
  "pyodide.mjs",
  "pyodide.asm.mjs",
  "pyodide.asm.wasm",
  "python_stdlib.zip",
  "pyodide-lock.json",
];

await mkdir(target, { recursive: true });
for (const file of files) {
  const from = join(source, file);
  const to = join(target, file);
  const [fromInfo, toInfo] = await Promise.all([
    stat(from),
    stat(to).catch(() => null),
  ]);
  if (!toInfo || toInfo.size !== fromInfo.size) await copyFile(from, to);
}

console.log(`Python runtime ready (${files.length} local files).`);

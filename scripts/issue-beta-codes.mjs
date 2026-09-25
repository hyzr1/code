import { randomBytes, createHash } from "node:crypto";
import { writeFile } from "node:fs/promises";
import { put } from "@vercel/blob";

const countArg = process.argv.indexOf("--count");
const count = Math.max(1, Math.min(500, Number(countArg >= 0 ? process.argv[countArg + 1] : 25) || 25));
const labelArg = process.argv.indexOf("--label");
const label = labelArg >= 0 ? process.argv[labelArg + 1] : `batch-${new Date().toISOString().slice(0, 10)}`;
const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const part = () => [...randomBytes(4)].map(byte => alphabet[byte % alphabet.length]).join("");
const codes = Array.from({ length: count }, () => `HYZR-${part()}-${part()}`);

for (const code of codes) {
  const id = createHash("sha256").update(`hyzr-beta:${code}`).digest("hex");
  await put(`beta-access/v1/codes/${id}.json`, JSON.stringify({ version: 1, createdAt: Date.now(), label }), {
    access: "private", allowOverwrite: false, contentType: "application/json", cacheControlMaxAge: 60,
  });
}

const file = `beta-access-codes-${Date.now()}.txt`;
await writeFile(file, `${codes.join("\n")}\n`, { flag: "wx" });
console.log(`Issued ${count} one-time beta codes to ${file}`);

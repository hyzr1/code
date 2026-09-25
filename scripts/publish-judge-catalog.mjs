import { put } from "@vercel/blob";
import { interviewCases, PROBLEMS } from "../.check/content.mjs";

if (!process.env.BLOB_READ_WRITE_TOKEN) {
  console.error("BLOB_READ_WRITE_TOKEN is required to publish the private judge catalog.");
  process.exit(1);
}

const catalog = Object.fromEntries(
  PROBLEMS
    .filter(problem => problem.language === "python")
    .map(problem => [problem.id, {
      exportName: problem.exportName,
      language: "python",
      tests: [...problem.tests, ...interviewCases(problem)],
    }]),
);
const body = JSON.stringify(catalog);
await put("judge/v1/catalog.json", body, {
  access: "private",
  allowOverwrite: true,
  contentType: "application/json",
  cacheControlMaxAge: 60,
});
console.log(`private judge catalog published: ${Object.keys(catalog).length} problems, ${(body.length / 1024 / 1024).toFixed(2)} MiB`);

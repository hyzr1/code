import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const source = await readFile("src/content/companies.ts", "utf8");
const targets = [...source.matchAll(/company\("([^"]+)",\s*"[^"]+",\s*"([^"]+)"/g)]
  .map((match) => ({ id: match[1], domain: match[2] }));

if (targets.length !== 200) throw new Error(`Expected 200 company targets, found ${targets.length}`);

const output = path.resolve("public/company-logos");
await mkdir(output, { recursive: true });
const force = process.argv.includes("--force");
let cursor = 0;
let downloaded = 0;
let reused = 0;

async function removeEdgeWhite(bytes) {
  try {
    const { data, info } = await sharp(bytes, { failOn: "none" })
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    const { width, height, channels } = info;
    const visited = new Uint8Array(width * height);
    const queue = new Int32Array(width * height);
    let head = 0;
    let tail = 0;
    const isEdgeWhite = (pixel) => {
      const offset = pixel * channels;
      return data[offset + 3] > 0 && data[offset] >= 246 && data[offset + 1] >= 246 && data[offset + 2] >= 246;
    };
    const enqueue = (pixel) => {
      if (visited[pixel] || !isEdgeWhite(pixel)) return;
      visited[pixel] = 1;
      queue[tail++] = pixel;
    };
    for (let x = 0; x < width; x += 1) {
      enqueue(x);
      enqueue((height - 1) * width + x);
    }
    for (let y = 0; y < height; y += 1) {
      enqueue(y * width);
      enqueue(y * width + width - 1);
    }
    while (head < tail) {
      const pixel = queue[head++];
      const x = pixel % width;
      const y = Math.floor(pixel / width);
      data[pixel * channels + 3] = 0;
      if (x > 0) enqueue(pixel - 1);
      if (x + 1 < width) enqueue(pixel + 1);
      if (y > 0) enqueue(pixel - width);
      if (y + 1 < height) enqueue(pixel + width);
    }
    return sharp(data, { raw: { width, height, channels } })
      .resize(128, 128, {
        fit: "contain",
        withoutEnlargement: false,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .png()
      .toBuffer();
  } catch {
    return bytes;
  }
}

async function worker() {
  while (cursor < targets.length) {
    const target = targets[cursor++];
    const destination = path.join(output, `${target.id}.ico`);
    if (!force) {
      try {
        if ((await stat(destination)).size > 100) {
          reused += 1;
          continue;
        }
      } catch {
        // Missing assets are downloaded below.
      }
    }
    const firstUrl = `https://www.google.com/s2/favicons?domain=${target.domain}&sz=128`;
    const secondUrl = `https://icons.duckduckgo.com/ip3/${target.domain}.ico`;
    let response = await fetch(firstUrl);
    let bytes = response.ok ? new Uint8Array(await response.arrayBuffer()) : new Uint8Array();
    if (bytes.length <= 100) {
      response = await fetch(secondUrl);
      bytes = response.ok ? new Uint8Array(await response.arrayBuffer()) : new Uint8Array();
    }
    if (bytes.length <= 100) throw new Error(`${target.id}: logo response was empty`);
    await writeFile(destination, await removeEdgeWhite(bytes));
    downloaded += 1;
  }
}

await Promise.all(Array.from({ length: 8 }, () => worker()));
console.log(`Company logos ready: ${downloaded} downloaded, ${reused} reused.`);

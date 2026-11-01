// Renders one small frame every N frames of the film, for a quick visual review before a full render.
// Uses one still per frame: renderFrames with everyNthFrame breaks Remotion's audio mixing (EINVAL in addAsset).
// Usage: node scripts/contact-sheet.mjs [every=60] [scale=0.3] [from=0] [to=end]
import { bundle } from "@remotion/bundler";
import { openBrowser, renderStill, selectComposition } from "@remotion/renderer";
import path from "node:path";
import fs from "node:fs";

const [every = "60", scale = "0.3", from = "0", to] = process.argv.slice(2);
const outDir = path.resolve("out/contact");
fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
const composition = await selectComposition({ serveUrl, id: "AsliHaiFilm" });
const browser = await openBrowser("chrome");
const last = to ? Number(to) : composition.durationInFrames - 1;
let i = 0;
for (let frame = Number(from); frame <= last; frame += Number(every), i++) {
  await renderStill({
    composition,
    serveUrl,
    frame,
    puppeteerInstance: browser,
    imageFormat: "jpeg",
    jpegQuality: 80,
    scale: Number(scale),
    output: path.join(outDir, `element-${String(i).padStart(3, "0")}.jpeg`),
  });
}
await browser.close({ silent: true });
console.log(`${i} frames in ${outDir}`);

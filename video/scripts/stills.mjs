// Renders chosen frames of the film as PNG stills, sharing one bundle.
// Usage: node scripts/stills.mjs <scale> <frame> [frame...]
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import path from "node:path";

const [scale, ...frames] = process.argv.slice(2);
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
const composition = await selectComposition({ serveUrl, id: "AsliHaiFilm" });
for (const f of frames) {
  const output = path.resolve(`out/still-${f}.png`);
  await renderStill({ composition, serveUrl, frame: Number(f), output, scale: Number(scale) });
  console.log(output);
}

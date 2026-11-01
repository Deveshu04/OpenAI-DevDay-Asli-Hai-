import { loadFont as loadMukta } from "@remotion/google-fonts/Mukta";
import { loadFont as loadTiro } from "@remotion/google-fonts/TiroDevanagariHindi";
import { loadFont as loadPlex } from "@remotion/google-fonts/IBMPlexMono";
import { loadFont as loadTamil } from "@remotion/google-fonts/NotoSansTamil";
import { loadFont as loadBengali } from "@remotion/google-fonts/NotoSansBengali";
import { loadFont as loadGurmukhi } from "@remotion/google-fonts/NotoSansGurmukhi";
import { loadFont as loadTelugu } from "@remotion/google-fonts/NotoSansTelugu";
import { loadFont as loadGujarati } from "@remotion/google-fonts/NotoSansGujarati";
import { loadFont as loadKannada } from "@remotion/google-fonts/NotoSansKannada";
import { loadFont as loadMalayalam } from "@remotion/google-fonts/NotoSansMalayalam";
import { loadFont as loadOriya } from "@remotion/google-fonts/NotoSansOriya";

// The site's own palette from web/style.css, plus a deep stage colour for the dark opening.
export const C = {
  paper: "#e4edf5",
  paperDeep: "#d3e0ec",
  ink: "#18225c",
  inkSoft: "#46527f",
  rule: "#a9bbd0",
  seal: "#f2a900",
  sealTint: "#fff3cc",
  ok: "#1d6a4c",
  okTint: "#dcefe6",
  warn: "#9c2a1f",
  warnTint: "#f6e1dd",
  field: "#ffffff",
  phone: "#101a4a",
  stage: "#0c1233",
};

const mukta = loadMukta("normal", { weights: ["400", "600", "700", "800"], subsets: ["latin", "devanagari"] });
const tiro = loadTiro("normal", { weights: ["400"], subsets: ["latin", "devanagari"] });
const plex = loadPlex("normal", { weights: ["500", "600"], subsets: ["latin"] });
const tamil = loadTamil("normal", { weights: ["400", "600", "700"], subsets: ["tamil"] });
const bengali = loadBengali("normal", { weights: ["400", "600", "700"], subsets: ["bengali"] });
const gurmukhi = loadGurmukhi("normal", { weights: ["400", "600", "700"], subsets: ["gurmukhi"] });

const others = [
  loadTelugu("normal", { weights: ["600"], subsets: ["telugu"] }),
  loadGujarati("normal", { weights: ["600"], subsets: ["gujarati"] }),
  loadKannada("normal", { weights: ["600"], subsets: ["kannada"] }),
  loadMalayalam("normal", { weights: ["600"], subsets: ["malayalam"] }),
  loadOriya("normal", { weights: ["600"], subsets: ["oriya"] }),
];

const scripts = [tamil, bengali, gurmukhi, ...others].map((f) => f.fontFamily).join(", ");

export const F = {
  ui: `${mukta.fontFamily}, ${scripts}, sans-serif`,
  display: `${tiro.fontFamily}, ${mukta.fontFamily}, serif`,
  mono: `${plex.fontFamily}, monospace`,
};

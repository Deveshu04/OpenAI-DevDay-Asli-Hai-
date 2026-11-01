import data from "./copy.json";

// Generated from web/tap.html, web/i18n, agents/*.json and backend/languages.py, so every line on screen is the product's own.
export const COPY = data;

export type TapLang = "hi" | "en" | "ta" | "bn" | "pa" | "hi-Latn";

export const PICKER: { code: string; native: string }[] = [
  { code: "hi", native: "हिंदी" },
  { code: "en", native: "English" },
  { code: "hi-Latn", native: "Hinglish" },
  { code: "bn", native: "বাংলা" },
  { code: "mr", native: "मराठी" },
  { code: "te", native: "తెలుగు" },
  { code: "ta", native: "தமிழ்" },
  { code: "gu", native: "ગુજરાતી" },
  { code: "kn", native: "ಕನ್ನಡ" },
  { code: "ml", native: "മലയാളം" },
  { code: "pa", native: "ਪੰਜਾਬੀ" },
  { code: "od", native: "ଓଡ଼ିଆ" },
  { code: "as", native: "অসমীয়া" },
];

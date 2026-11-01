import type React from "react";
import { COPY, PICKER } from "../data/copy";
import { C, F } from "../lib/theme";
import { SCREEN_H, SCREEN_W } from "./Phone";

const APPS = [
  ["फ़ोन", "#3f6fb5"], ["संदेश", "#4e9a6b"], ["कैमरा", "#5b6474"], ["गैलरी", "#c46a4a"],
  ["घड़ी", "#2f3a66"], ["मौसम", "#4c8fc9"], ["असली है?", C.seal], ["कैलेंडर", "#b34a5a"],
  ["संगीत", "#8a5bb0"], ["नक्शा", "#4f8a83"], ["बैंक", "#6b7a99"], ["सेटिंग", "#6d7280"],
];

/** Sunita's home screen; the yellow shortcut is the one her son added. */
export const HomeScreen: React.FC<{ readonly highlight?: number }> = ({ highlight = 0 }) => (
  <div style={{ position: "absolute", width: SCREEN_W, height: SCREEN_H, background: "#2b3a6b", fontFamily: F.ui }}>
    <div style={{ position: "absolute", top: 50, left: 0, right: 0, textAlign: "center", color: C.field }}>
      <div style={{ fontSize: 84, fontWeight: 600, lineHeight: 1 }}>4:12</div>
      <div style={{ fontSize: 22, opacity: 0.85, marginTop: 6 }}>गुरुवार, 30 अक्टूबर</div>
    </div>
    <div style={{ position: "absolute", top: 250, left: 26, right: 26, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", rowGap: 30 }}>
      {APPS.map(([name, color]) => {
        const ours = name === "असली है?";
        return (
          <div key={name} style={{ display: "grid", justifyItems: "center", gap: 8 }}>
            <div
              style={{
                width: 74,
                height: 74,
                borderRadius: 22,
                background: color,
                display: "grid",
                placeItems: "center",
                boxShadow: ours ? `0 0 0 ${4 + highlight * 6}px rgba(242,169,0,${0.35 * highlight})` : "none",
              }}
            >
              {ours ? <div style={{ width: 40, height: 40, borderRadius: "50%", background: C.field, boxShadow: `inset 0 0 0 4px ${C.ink}` }} /> : null}
            </div>
            <div style={{ color: C.field, fontSize: 17, fontWeight: ours ? 700 : 400 }}>{name}</div>
          </div>
        );
      })}
    </div>
  </div>
);

export type SignupStep = "intro" | "parentName" | "parentPhone" | "language" | "first" | "word" | "review" | "done";
const STEP_NO: Record<SignupStep, number> = { intro: 0, parentName: 1, parentPhone: 2, language: 3, first: 4, word: 7, review: 9, done: 9 };

const t = (key: keyof typeof COPY.i18n.en, vars: Record<string, string> = {}) =>
  COPY.i18n.en[key].replace(/\{(\w+)\}/g, (_, k: string) => vars[k] ?? "");

/** The family's signup questionnaire, one question per screen, as on web/signup.html. */
export const SignupScreen: React.FC<{
  readonly step: SignupStep;
  /** 0 to 1: how much of the answer has been typed. */
  readonly typed?: number;
  readonly profiles?: readonly string[];
}> = ({ step, typed = 1, profiles = [] }) => {
  const vars = { name: "Sunita", first: "Rahul" };
  const type = (s: string) => s.slice(0, Math.round(s.length * typed));
  const question: Record<SignupStep, string> = {
    intro: t("ob.title"),
    parentName: t("ob.q.parentName"),
    parentPhone: t("ob.q.parentPhone", vars),
    language: t("ob.q.language", vars),
    first: t("ob.q.first"),
    word: t("ob.q.word"),
    review: t("ob.q.review"),
    done: t("signup.done"),
  };
  const n = STEP_NO[step];

  const field = (value: string, lang?: string) => (
    <div lang={lang} style={{ height: 66, border: `2px solid ${C.ink}`, borderRadius: 12, background: C.field, display: "flex", alignItems: "center", padding: "0 18px", fontSize: 28, fontWeight: 600 }}>
      {value}
      <span style={{ width: 2, height: 32, background: C.ink, marginLeft: 2, opacity: typed < 1 ? 1 : 0 }} />
    </div>
  );

  return (
    <div lang="en" style={{ position: "absolute", width: SCREEN_W, height: SCREEN_H, background: C.paper, fontFamily: F.ui, color: C.ink }}>
      {step !== "intro" && step !== "done" ? (
        <div style={{ position: "absolute", top: 18, left: 24, right: 24 }}>
          <div style={{ height: 8, borderRadius: 4, background: C.paperDeep }}>
            <div style={{ height: 8, borderRadius: 4, width: `${(n / 9) * 100}%`, background: C.ink }} />
          </div>
          <div style={{ fontSize: 16, color: C.inkSoft, marginTop: 8 }}>{t("ob.step", { n: String(n), total: "9" })}</div>
        </div>
      ) : null}

      <div style={{ position: "absolute", top: 90, left: 24, right: 24, display: "grid", gap: 18 }}>
        <div style={{ width: 64, height: 64, borderRadius: 18, background: step === "done" ? C.okTint : C.paperDeep, display: "grid", placeItems: "center", fontSize: 32, color: step === "done" ? C.ok : C.ink }}>
          {step === "done" ? "✓" : "?"}
        </div>
        <div style={{ fontFamily: F.display, fontSize: 36, lineHeight: 1.15, textWrap: "balance" }}>{question[step]}</div>

        {step === "intro" ? <div style={{ fontSize: 22, color: C.inkSoft, lineHeight: 1.4 }}>{t("ob.intro")}</div> : null}
        {step === "parentName" ? field(type("Sunita")) : null}
        {step === "parentPhone" ? field(type("98100 12345")) : null}
        {step === "first" ? field(type("Rahul")) : null}
        {step === "word" ? (
          <>
            <div style={{ fontSize: 18, color: C.inkSoft, lineHeight: 1.4 }}>{t("ob.h.word", vars)}</div>
            {field(type("neela tota"))}
            {field(type("नीला तोता"), "hi")}
          </>
        ) : null}
        {step === "language" ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
            {PICKER.filter((p) => p.code !== "hi-Latn").map((p) => (
              <div
                key={p.code}
                lang={p.code === "od" ? "or" : p.code}
                style={{
                  height: 56,
                  borderRadius: 10,
                  display: "grid",
                  placeItems: "center",
                  fontSize: 20,
                  fontWeight: 700,
                  border: `2px solid ${p.code === "hi" ? C.ink : C.rule}`,
                  background: p.code === "hi" ? C.sealTint : C.field,
                }}
              >
                {p.native}
              </div>
            ))}
          </div>
        ) : null}
        {step === "review" ? (
          <div style={{ display: "grid", gap: 10, fontSize: 20 }}>
            {[
              ["Parent", "Sunita · 98100 12345"],
              ["Language", "हिंदी"],
              ["Calls first", "Rahul · 98200 54321"],
              ["Family word", "neela tota · नीला तोता"],
            ].map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", gap: 12, borderBottom: `1px solid ${C.rule}`, paddingBottom: 8 }}>
                <span style={{ color: C.inkSoft }}>{k}</span>
                <span style={{ fontWeight: 600 }}>{v}</span>
              </div>
            ))}
          </div>
        ) : null}
        {step === "done" ? (
          <>
            <div style={{ fontSize: 20, color: C.inkSoft, lineHeight: 1.4 }}>{t("signup.doneBody")}</div>
            <div style={{ fontSize: 18, fontWeight: 700, marginTop: 6 }}>{t("signup.profiles")}</div>
            <div style={{ display: "grid", gap: 8 }}>
              {profiles.map((p) => (
                <div key={p} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: C.field, border: `1px solid ${C.rule}`, borderRadius: 10, padding: "10px 14px", fontSize: 22, fontWeight: 600 }}>
                  <span style={{ textDecoration: "underline" }}>{p}</span>
                  <span style={{ fontSize: 16, border: `2px solid ${C.ink}`, borderRadius: 8, padding: "2px 10px" }}>{t("signup.copy")}</span>
                </div>
              ))}
            </div>
          </>
        ) : null}
      </div>

      <div
        style={{
          position: "absolute",
          bottom: 30,
          left: 24,
          right: 24,
          height: 64,
          borderRadius: 12,
          background: step === "done" ? "transparent" : C.seal,
          border: step === "done" ? `2px solid ${C.ink}` : "none",
          display: "grid",
          placeItems: "center",
          fontSize: 24,
          fontWeight: 700,
        }}
      >
        {step === "done" ? t("signup.addAnother") : step === "review" ? "Register" : step === "intro" ? "Start" : t("ob.next")}
      </div>
    </div>
  );
};

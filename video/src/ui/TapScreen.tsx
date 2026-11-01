import type React from "react";
import { COPY, PICKER, type TapLang } from "../data/copy";
import { C, F } from "../lib/theme";
import { SCREEN_H, SCREEN_W } from "./Phone";

export type TapState = {
  readonly lang: TapLang;
  readonly calling?: boolean;
  /** 0 to 1: how far the button is pushed in. */
  readonly press?: number;
  /** 0 to 1: the yellow ring that spreads out after a press. */
  readonly ripple?: number;
  /** 1 is normal; 1.25 is the larger-text setting. */
  readonly textScale?: number;
  readonly largeOn?: boolean;
  /** 0 to 1: the language list opening under the picker. */
  readonly pickerOpen?: number;
  readonly pickerActive?: number;
  readonly focus?: "picker" | "size" | "seal" | null;
};

const SEAL = 280;
const SEAL_Y = 405;

const focusRing = (on: boolean, radius: number | string): React.CSSProperties =>
  on ? { boxShadow: `0 0 0 4px ${C.paper}, 0 0 0 9px ${C.seal}`, borderRadius: radius } : {};

export const TapScreen: React.FC<TapState> = ({
  lang,
  calling = false,
  press = 0,
  ripple = 0,
  textScale = 1,
  largeOn = false,
  pickerOpen = 0,
  pickerActive = 0,
  focus = null,
}) => {
  const text = COPY.tap[lang];
  const brand = (COPY.brand as Record<string, string>)[lang] ?? COPY.brand.hi;
  const native = PICKER.find((p) => p.code === lang)?.native ?? lang;
  const htmlLang = lang === "hi-Latn" ? "en" : lang;

  return (
    <div lang={htmlLang} style={{ position: "absolute", width: SCREEN_W, height: SCREEN_H, background: C.paper, fontFamily: F.ui, color: C.ink }}>
      <div style={{ position: "absolute", top: 14, left: 20, right: 18, display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontFamily: F.display, fontSize: 31, marginRight: "auto", whiteSpace: "nowrap" }}>{brand}</span>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 7,
            height: 50,
            padding: "0 12px",
            background: C.field,
            border: `2px solid ${C.ink}`,
            borderRadius: 10,
            fontWeight: 700,
            fontSize: 19,
            whiteSpace: "nowrap",
            ...focusRing(focus === "picker", 10),
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={C.ink} strokeWidth="2" strokeLinecap="round" aria-hidden>
            <circle cx="12" cy="12" r="9" />
            <path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z" />
          </svg>
          <span>{native}</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.ink} strokeWidth="2.4" strokeLinecap="round" style={{ rotate: `${pickerOpen * 180}deg` }} aria-hidden>
            <path d="m6 9 6 6 6-6" />
          </svg>
        </div>
        <div
          style={{
            width: 50,
            height: 50,
            display: "grid",
            placeItems: "center",
            border: `2px solid ${C.ink}`,
            borderRadius: 10,
            fontWeight: 700,
            fontSize: 19,
            background: largeOn ? C.ink : "transparent",
            color: largeOn ? C.field : C.ink,
            ...focusRing(focus === "size", 10),
          }}
        >
          A+
        </div>
      </div>

      <h1
        style={{
          position: "absolute",
          top: 120,
          left: 26,
          right: 26,
          margin: 0,
          textAlign: "center",
          fontWeight: 700,
          fontSize: 30 * textScale,
          lineHeight: 1.25,
          textWrap: "balance",
        }}
      >
        {text.question}
      </h1>

      <div
        style={{
          position: "absolute",
          left: SCREEN_W / 2 - SEAL / 2,
          top: SEAL_Y - SEAL / 2 + 20 * (textScale - 1) * 4,
          width: SEAL,
          height: SEAL,
          borderRadius: "50%",
          border: `8px solid ${C.seal}`,
          opacity: ripple > 0 && ripple < 1 ? 1 - ripple : 0,
          scale: 1 + ripple * 0.7,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: SCREEN_W / 2 - SEAL / 2,
          top: SEAL_Y - SEAL / 2 + 20 * (textScale - 1) * 4,
          width: SEAL,
          height: SEAL,
          borderRadius: "50%",
          background: C.seal,
          boxShadow:
            focus === "seal"
              ? `0 0 0 10px ${C.paper}, 0 0 0 14px ${C.ink}, 0 0 0 20px ${C.paper}, 0 0 0 26px ${C.seal}`
              : `0 0 0 10px ${C.paper}, 0 0 0 14px ${C.ink}, 0 ${18 - press * 14}px 30px -10px rgba(16,26,74,0.45)`,
          scale: 1 - press * 0.07,
          display: "grid",
          placeItems: "center",
          textAlign: "center",
          fontWeight: 800,
          // Long labels such as Tamil's அழுத்துங்கள் shrink to stay inside the circle.
          fontSize: Math.min(calling ? 40 : 56, 390 / Math.max(1, (calling ? text.calling : text.press).length)) * textScale,
          lineHeight: 1.1,
          padding: 20,
        }}
      >
        {calling ? text.calling : text.press}
      </div>

      <p
        style={{
          position: "absolute",
          top: 600 + 20 * (textScale - 1) * 6,
          left: 26,
          right: 26,
          margin: 0,
          textAlign: "center",
          fontSize: 21 * textScale,
          lineHeight: 1.4,
          textWrap: "balance",
        }}
      >
        {calling ? text.ringing : text.idle}
      </p>

      <p style={{ position: "absolute", bottom: 24, left: 0, right: 0, margin: 0, textAlign: "center", fontSize: 17 * Math.min(textScale, 1.15), color: C.inkSoft }}>
        {text.helpline} <span style={{ color: C.ink, fontWeight: 700, textDecoration: "underline" }}>1930</span>
      </p>

      {pickerOpen > 0 ? (
        <div
          style={{
            position: "absolute",
            top: 74,
            right: 76,
            width: 250,
            padding: 6,
            background: C.field,
            border: `2px solid ${C.ink}`,
            borderRadius: 14,
            boxShadow: "0 18px 40px rgba(24,34,92,0.25)",
            opacity: pickerOpen,
            translate: `0 ${(1 - pickerOpen) * -12}px`,
          }}
        >
          {PICKER.map((item, i) => (
            <div
              key={item.code}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                height: 45,
                padding: "0 12px",
                borderRadius: 8,
                fontSize: 20,
                fontWeight: 700,
                background: i === pickerActive ? C.sealTint : "transparent",
                boxShadow: i === pickerActive ? `inset 0 0 0 2px ${C.ink}` : "none",
              }}
            >
              <span style={{ width: 18 }}>{item.code === lang ? "✓" : ""}</span>
              <span lang={item.code === "od" ? "or" : item.code}>{item.native}</span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
};

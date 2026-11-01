import type React from "react";
import { C, F } from "../lib/theme";

export const PHONE_W = 430;
export const PHONE_H = 880;
const BEZEL = 14;
const STATUS_H = 54;

/** Usable screen area inside the bezel and below the status bar. */
export const SCREEN_W = PHONE_W - BEZEL * 2;
export const SCREEN_H = PHONE_H - BEZEL * 2 - STATUS_H;

type Props = {
  readonly children?: React.ReactNode;
  readonly style?: React.CSSProperties;
  readonly time?: string;
  readonly screen?: string;
};

export const Phone: React.FC<Props> = ({ children, style, time = "4:12", screen = C.paper }) => (
  <div
    style={{
      position: "absolute",
      width: PHONE_W,
      height: PHONE_H,
      borderRadius: 64,
      background: C.phone,
      padding: BEZEL,
      boxShadow: "0 50px 90px -40px rgba(16,26,74,0.6), 0 0 0 2px rgba(255,255,255,0.06) inset",
      ...style,
    }}
  >
    <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: 52, overflow: "hidden", background: screen }}>
      <div
        style={{
          height: STATUS_H,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 34px",
          fontFamily: F.ui,
          fontWeight: 700,
          fontSize: 20,
          color: C.ink,
        }}
      >
        <span>{time}</span>
        <span style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <svg width="22" height="14" viewBox="0 0 22 14" aria-hidden>
            <rect x="0" y="9" width="4" height="5" rx="1" fill={C.ink} />
            <rect x="6" y="6" width="4" height="8" rx="1" fill={C.ink} />
            <rect x="12" y="3" width="4" height="11" rx="1" fill={C.ink} />
            <rect x="18" y="0" width="4" height="14" rx="1" fill={C.ink} />
          </svg>
          <svg width="30" height="14" viewBox="0 0 30 14" aria-hidden>
            <rect x="0.5" y="0.5" width="25" height="13" rx="3.5" fill="none" stroke={C.ink} />
            <rect x="2.5" y="2.5" width="17" height="9" rx="2" fill={C.ink} />
            <rect x="27" y="4.5" width="2.5" height="5" rx="1" fill={C.ink} />
          </svg>
        </span>
      </div>
      <div
        style={{
          position: "absolute",
          top: 14,
          left: "50%",
          translate: "-50% 0",
          width: 120,
          height: 32,
          borderRadius: 16,
          background: C.phone,
        }}
      />
      <div style={{ position: "absolute", top: STATUS_H, left: 0, width: SCREEN_W, height: SCREEN_H }}>{children}</div>
    </div>
  </div>
);

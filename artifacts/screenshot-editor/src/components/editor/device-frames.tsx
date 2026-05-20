"use client";
import * as React from "react";
import { img } from "@/lib/image-cache";

type FrameProps = {
  src: string;
  alt?: string;
  style?: React.CSSProperties;
  hideEmpty?: boolean;
  frameColor?: string;
};

// ─── CSS-drawn modern iPhone (11–17 style) ───────────────────────────────────
// Uses pure CSS — no PNG, no blend modes. frameColor is applied as a border
// ring on the outer edge only — the body stays dark/realistic.
export function Phone({ src, alt = "", style, hideEmpty, frameColor }: FrameProps) {
  const resolved = img(src);

  const bodyBg = "linear-gradient(160deg, #3A3A3C 0%, #1C1C1E 55%, #2C2C2E 100%)";
  const btnBg  = "linear-gradient(90deg, #252527 0%, #1A1A1C 100%)";

  const bodyShadow = [
    frameColor ? `0 0 0 3px ${frameColor}` : null,
    "inset 0 0 0 0.8px rgba(255,255,255,0.20)",
    "inset 0 1px 0 rgba(255,255,255,0.10)",
    "0 0 0 0.5px rgba(0,0,0,0.65)",
    "0 22px 80px rgba(0,0,0,0.72)",
  ].filter(Boolean).join(", ");

  const sideBtn = (pos: React.CSSProperties): React.CSSProperties => ({
    position: "absolute",
    width: "1.4%",
    borderRadius: pos.left != null ? "1.5px 0 0 1.5px" : "0 1.5px 1.5px 0",
    background: frameColor ?? btnBg,
    boxShadow: pos.left != null
      ? "-1px 0 3px rgba(0,0,0,0.55), inset 1px 0 0 rgba(255,255,255,0.13)"
      : "1px 0 3px rgba(0,0,0,0.55), inset -1px 0 0 rgba(255,255,255,0.13)",
    ...pos,
  });

  return (
    <div style={{ position: "relative", aspectRatio: "9 / 19.5", ...style }}>

      {/* ── Frame body ──────────────────────────────────────── */}
      <div style={{
        position: "absolute", inset: 0,
        borderRadius: "11.5% / 5.3%",
        background: bodyBg,
        boxShadow: bodyShadow,
      }} />

      {/* ── Left side: silent toggle + vol up + vol down ─── */}
      <div style={sideBtn({ left: "-1.2%", top: "13.2%", height: "3.6%" })} />
      <div style={sideBtn({ left: "-1.2%", top: "19.0%", height: "7.0%" })} />
      <div style={sideBtn({ left: "-1.2%", top: "27.5%", height: "7.0%" })} />

      {/* ── Right side: power button ────────────────────── */}
      <div style={sideBtn({ right: "-1.2%", top: "21.5%", height: "11.0%" })} />

      {/* ── Screen (display area) ───────────────────────── */}
      <div style={{
        position: "absolute",
        left: "3.6%", top: "1.8%",
        width: "92.8%", height: "96.4%",
        borderRadius: "9.2% / 4.4%",
        overflow: "hidden",
        background: "#0d0d0d",
        zIndex: 5,
      }}>
        {resolved ? (
          <img
            src={resolved}
            alt={alt}
            style={{ display: "block", width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }}
            draggable={false}
          />
        ) : hideEmpty ? null : (
          <EmptySlot />
        )}
      </div>

      {/* ── Dynamic Island ──────────────────────────────── */}
      <div style={{
        position: "absolute",
        top: "3.8%", left: "50%",
        transform: "translateX(-50%)",
        width: "23%", height: "2.3%",
        background: "#000",
        borderRadius: "100px",
        zIndex: 10,
      }} />

      {/* ── Frame edge glare ────────────────────────────── */}
      <div style={{
        position: "absolute", inset: 0,
        borderRadius: "11.5% / 5.3%",
        background: "linear-gradient(145deg, rgba(255,255,255,0.11) 0%, transparent 32%)",
        pointerEvents: "none",
        zIndex: 20,
      }} />
    </div>
  );
}

export function AndroidPhone({ src, alt = "", style, hideEmpty, frameColor }: FrameProps) {
  const resolved = img(src);
  const bodyBg = "linear-gradient(160deg, #2a2a2e 0%, #18181b 100%)";
  const borderShadow = frameColor ? `0 0 0 3px ${frameColor}, ` : "";
  return (
    <div style={{ position: "relative", aspectRatio: "9 / 19.5", ...style }}>
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: "8% / 4%",
          background: bodyBg,
          boxShadow: `${borderShadow}inset 0 0 0 1px rgba(255,255,255,0.12), 0 8px 40px rgba(0,0,0,0.55)`,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "1.5%",
            left: "50%",
            transform: "translateX(-50%)",
            width: "3%",
            height: "1.4%",
            borderRadius: "50%",
            background: "#0d0d0f",
            border: "1px solid rgba(255,255,255,0.06)",
            zIndex: 20,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: "3.5%",
            top: "2%",
            width: "93%",
            height: "96%",
            borderRadius: "5.5% / 2.6%",
            overflow: "hidden",
            background: "#000",
          }}
        >
          {resolved ? (
            <img
              src={resolved}
              alt={alt}
              style={{ display: "block", width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }}
              draggable={false}
            />
          ) : hideEmpty ? null : (
            <EmptySlot />
          )}
        </div>
      </div>
    </div>
  );
}

export function AndroidTabletP({ src, alt = "", style, hideEmpty, frameColor }: FrameProps) {
  const resolved = img(src);
  const bodyBg = "linear-gradient(160deg, #2a2a2e 0%, #18181b 100%)";
  const borderShadow = frameColor ? `0 0 0 3px ${frameColor}, ` : "";
  return (
    <div style={{ position: "relative", aspectRatio: "5 / 8", ...style }}>
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: "4.5% / 2.8%",
          background: bodyBg,
          boxShadow: `${borderShadow}inset 0 0 0 1px rgba(255,255,255,0.08), 0 8px 48px rgba(0,0,0,0.6)`,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "1.2%",
            left: "50%",
            transform: "translateX(-50%)",
            width: "1.4%",
            height: "0.88%",
            borderRadius: "50%",
            background: "#0d0d0f",
            zIndex: 20,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: "3.5%",
            top: "2.2%",
            width: "93%",
            height: "95.6%",
            borderRadius: "2.5% / 1.6%",
            overflow: "hidden",
            background: "#000",
          }}
        >
          {resolved ? (
            <img
              src={resolved}
              alt={alt}
              style={{ display: "block", width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }}
              draggable={false}
            />
          ) : hideEmpty ? null : (
            <EmptySlot />
          )}
        </div>
      </div>
    </div>
  );
}

export function AndroidTabletL({ src, alt = "", style, hideEmpty, frameColor }: FrameProps) {
  const resolved = img(src);
  const bodyBg = "linear-gradient(160deg, #2a2a2e 0%, #18181b 100%)";
  const borderShadow = frameColor ? `0 0 0 3px ${frameColor}, ` : "";
  return (
    <div style={{ position: "relative", aspectRatio: "8 / 5", ...style }}>
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: "2.8% / 4.5%",
          background: bodyBg,
          boxShadow: `${borderShadow}inset 0 0 0 1px rgba(255,255,255,0.08), 0 8px 48px rgba(0,0,0,0.6)`,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: "1.2%",
            top: "50%",
            transform: "translateY(-50%)",
            width: "0.88%",
            height: "1.4%",
            borderRadius: "50%",
            background: "#0d0d0f",
            zIndex: 20,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: "2.2%",
            top: "3.5%",
            width: "95.6%",
            height: "93%",
            borderRadius: "1.6% / 2.5%",
            overflow: "hidden",
            background: "#000",
          }}
        >
          {resolved ? (
            <img
              src={resolved}
              alt={alt}
              style={{ display: "block", width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }}
              draggable={false}
            />
          ) : hideEmpty ? null : (
            <EmptySlot />
          )}
        </div>
      </div>
    </div>
  );
}

export function IPad({ src, alt = "", style, hideEmpty, frameColor }: FrameProps) {
  const resolved = img(src);
  const bodyBg = "linear-gradient(180deg, #2C2C2E 0%, #1C1C1E 100%)";
  const borderShadow = frameColor ? `0 0 0 3px ${frameColor}, ` : "";
  return (
    <div style={{ position: "relative", aspectRatio: "770 / 1000", ...style }}>
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: "5% / 3.6%",
          background: bodyBg,
          position: "relative",
          overflow: "hidden",
          boxShadow: `${borderShadow}inset 0 0 0 1px rgba(255,255,255,0.1), 0 8px 40px rgba(0,0,0,0.6)`,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "1.2%",
            left: "50%",
            transform: "translateX(-50%)",
            width: "0.9%",
            height: "0.65%",
            borderRadius: "50%",
            background: "#111113",
            zIndex: 20,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: "4%",
            top: "2.8%",
            width: "92%",
            height: "94.4%",
            borderRadius: "2.2% / 1.6%",
            overflow: "hidden",
            background: "#000",
          }}
        >
          {resolved ? (
            <img
              src={resolved}
              alt={alt}
              style={{ display: "block", width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }}
              draggable={false}
            />
          ) : hideEmpty ? null : (
            <EmptySlot />
          )}
        </div>
      </div>
    </div>
  );
}

function EmptySlot() {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "rgba(255,255,255,0.4)",
        fontSize: "min(2vw, 14px)",
        background: "linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)",
        textAlign: "center",
        padding: "4%",
      }}
    >
      Drop a screenshot here
    </div>
  );
}

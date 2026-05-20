"use client";
import * as React from "react";
import { RotateCw, X } from "lucide-react";
import { Rnd } from "react-rnd";
import type {
  Callout,
  Device,
  ElementId,
  ElementTransform,
  Orientation,
  PatternId,
  Slide,
  Sticker,
  Theme,
} from "@/lib/types";
import { nid } from "@/lib/defaults";
import {
  CANVAS,
  IPAD_RATIO,
  MK_RATIO,
  ipadW,
  phoneW,
  phoneWSmall,
  tabletLW,
  tabletPW,
} from "@/lib/constants";
import { img } from "@/lib/image-cache";
import { pickText, resolveScreenshot } from "@/lib/locale";
import {
  AndroidPhone,
  AndroidTabletL,
  AndroidTabletP,
  IPad,
  Phone,
} from "./device-frames";

type FrameComp = React.ComponentType<{
  src: string;
  alt?: string;
  style?: React.CSSProperties;
  hideEmpty?: boolean;
  frameColor?: string;
}>;

export function getCanvas(device: Device, orientation: Orientation) {
  const c = CANVAS[device];
  if ((device === "android-7" || device === "android-10") && orientation === "landscape") {
    return { cW: c.wL!, cH: c.hL! };
  }
  return { cW: c.w, cH: c.h };
}

// Aspect ratio (w/h) of each device frame — must match device-frames.tsx
function getFrameAspect(device: Device, orientation: Orientation) {
  switch (device) {
    case "iphone":      return MK_RATIO;
    case "android":     return 9 / 19.5;
    case "ipad":        return IPAD_RATIO;
    case "android-7":
    case "android-10":  return orientation === "landscape" ? 8 / 5 : 5 / 8;
    default:            return 1;
  }
}

export function getFrameForDevice(device: Device, orientation: Orientation): {
  Comp: FrameComp;
  widthFn: (cW: number, cH: number) => number;
  smallWidthFn: (cW: number, cH: number) => number;
} {
  switch (device) {
    case "iphone":
      return { Comp: Phone, widthFn: phoneW, smallWidthFn: phoneWSmall };
    case "ipad":
      return { Comp: IPad, widthFn: ipadW, smallWidthFn: (cW, cH) => ipadW(cW, cH, 0.6) };
    case "android":
      return { Comp: AndroidPhone, widthFn: phoneW, smallWidthFn: phoneWSmall };
    case "android-7":
    case "android-10":
      if (orientation === "landscape") {
        return { Comp: AndroidTabletL, widthFn: tabletLW, smallWidthFn: (cW, cH) => tabletLW(cW, cH, 0.5) };
      }
      return { Comp: AndroidTabletP, widthFn: tabletPW, smallWidthFn: (cW, cH) => tabletPW(cW, cH, 0.62) };
    default:
      return { Comp: Phone, widthFn: phoneW, smallWidthFn: phoneWSmall };
  }
}

type EditHandlers = {
  onLabelChange?: (v: string) => void;
  onHeadlineChange?: (v: string) => void;
  onElementChange?: (id: ElementId, t: ElementTransform) => void;
  onSelectElement?: (id: ElementId | null) => void;
};

type Props = {
  slide: Slide;
  device: Device;
  orientation: Orientation;
  theme: Theme;
  locale: string;
  appName?: string;
  appIcon?: string;
  fontFamily?: string;
  editable?: boolean;
  edit?: EditHandlers;
  selectedElementId?: ElementId | null;
  // Preview scale (1.0 = full size). Used so react-rnd maps drag deltas correctly
  // when the canvas is rendered inside a CSS-transformed container.
  previewScale?: number;
  /** When true, suppress the "Drop a screenshot here" placeholder. Used for export. */
  hideEmpty?: boolean;
  /** Callout mode: overlay captures mouse to draw a new callout selection. */
  calloutMode?: boolean;
  selectedCalloutId?: string | null;
  onAddCallout?: (c: Callout) => void;
  onUpdateCallout?: (c: Callout) => void;
  onSelectCallout?: (id: string | null) => void;
  selectedStickerId?: string | null;
  onUpdateSticker?: (s: Sticker) => void;
  onDeleteSticker?: (id: string) => void;
  onSelectSticker?: (id: string | null) => void;
};

// ---------- Editable text helpers ----------

function EditableText({
  value,
  editable,
  onChange,
  style,
  multiline = false,
  placeholder,
  onFocus,
}: {
  value: string;
  editable?: boolean;
  onChange?: (v: string) => void;
  style?: React.CSSProperties;
  multiline?: boolean;
  placeholder?: string;
  onFocus?: () => void;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const incoming = multiline ? value.replace(/\n/g, "<br/>") : value;
    if (el.innerHTML !== incoming && document.activeElement !== el) {
      el.innerHTML = incoming || "";
    }
  }, [value, multiline]);

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    if (!onChange) return;
    const html = (e.currentTarget.innerHTML || "")
      .replace(/<div>/gi, "\n")
      .replace(/<\/div>/gi, "")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<[^>]+>/g, "")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">");
    onChange(multiline ? html : html.replace(/\n/g, ""));
  };

  return (
    <div
      ref={ref}
      contentEditable={editable}
      suppressContentEditableWarning
      data-placeholder={placeholder}
      onInput={handleInput}
      onFocus={() => onFocus?.()}
      onMouseDown={(e) => {
        // Allow text editing without starting an Rnd drag.
        if (editable) {
          e.stopPropagation();
          onFocus?.();
        }
      }}
      onPointerDown={(e) => {
        if (editable) e.stopPropagation();
      }}
      style={{
        outline: "none",
        whiteSpace: multiline ? "pre-wrap" : "nowrap",
        cursor: editable ? "text" : "default",
        ...style,
      }}
    />
  );
}

// ---------- Caption (label + headline) ----------

function Caption({
  cW,
  cH,
  slide,
  theme,
  locale,
  editable,
  edit,
  align = "center",
  inverted,
  fontFamily,
  onFocus,
}: {
  cW: number;
  cH: number;
  slide: Slide;
  theme: Theme;
  locale: string;
  editable?: boolean;
  edit?: EditHandlers;
  align?: "center" | "left";
  inverted?: boolean;
  fontFamily?: string;
  onFocus?: () => void;
}) {
  const fg = inverted ? theme.fgAlt : theme.fg;
  const accent = theme.accent;
  // Scale typography off the *shorter* dimension so landscape layouts don't
  // produce headlines so tall they overlap the device frame.
  const unit = Math.min(cW, cH);
  const ff = fontFamily || "Inter";
  return (
    <div style={{ textAlign: align, position: "relative", width: "100%", fontFamily: ff }}>
      <EditableText
        value={pickText(slide.label, locale)}
        editable={editable}
        onChange={edit?.onLabelChange}
        onFocus={onFocus}
        placeholder="LABEL"
        style={{
          fontSize: unit * 0.028,
          fontWeight: 600,
          letterSpacing: unit * 0.0015,
          color: accent,
          textTransform: "uppercase",
          marginBottom: unit * 0.018,
          minHeight: unit * 0.03,
          fontFamily: ff,
        }}
      />
      <EditableText
        value={pickText(slide.headline, locale)}
        editable={editable}
        multiline
        onChange={edit?.onHeadlineChange}
        onFocus={onFocus}
        placeholder="Headline goes here"
        style={{
          fontSize: unit * 0.092,
          fontWeight: 700,
          lineHeight: 0.96,
          letterSpacing: -unit * 0.001,
          color: fg,
          fontFamily: ff,
        }}
      />
    </div>
  );
}

// ---------- Background ----------

function backgroundFor(
  theme: Theme,
  inverted?: boolean,
  gradient?: { color1: string; color2: string; angle: number },
) {
  if (gradient) {
    return `linear-gradient(${gradient.angle}deg, ${gradient.color1} 0%, ${gradient.color2} 100%)`;
  }
  if (inverted) {
    return `linear-gradient(160deg, ${theme.bgAlt} 0%, ${shade(theme.bgAlt, -8)} 100%)`;
  }
  return `linear-gradient(160deg, ${theme.bg} 0%, ${shade(theme.bg, -6)} 100%)`;
}

// ---------- Pattern overlay ----------

function toHexAlpha(alpha: number): string {
  return Math.round(Math.min(1, Math.max(0, alpha)) * 255)
    .toString(16)
    .padStart(2, "0");
}

function PatternLayer({
  pattern,
  intensity,
  accent,
}: {
  pattern: PatternId | undefined;
  intensity: number;
  accent: string;
}) {
  if (!pattern || pattern === "none") return null;
  const a = Math.min(1, Math.max(0, intensity / 100));

  const base: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    pointerEvents: "none",
    zIndex: 1,
  };

  if (pattern === "mesh") {
    return (
      <div
        aria-hidden
        style={{
          ...base,
          background: `
            radial-gradient(circle at 20% 30%, ${accent}${toHexAlpha(a * 0.85)} 0%, transparent 55%),
            radial-gradient(circle at 80% 70%, ${accent}${toHexAlpha(a * 0.65)} 0%, transparent 55%)
          `,
          filter: `blur(${50 + a * 30}px)`,
        }}
      />
    );
  }
  if (pattern === "grain") {
    const url = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='256' height='256'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='256' height='256' filter='url(%23n)'/%3E%3C/svg%3E")`;
    return (
      <div
        aria-hidden
        style={{ ...base, backgroundImage: url, backgroundSize: "256px 256px", opacity: a * 0.38, mixBlendMode: "overlay" }}
      />
    );
  }
  if (pattern === "glass") {
    return (
      <div
        aria-hidden
        style={{
          ...base,
          background: `linear-gradient(135deg, rgba(255,255,255,${a * 0.22}) 0%, rgba(255,255,255,0) 55%, rgba(255,255,255,${a * 0.1}) 100%)`,
        }}
      />
    );
  }
  if (pattern === "blobs") {
    return (
      <div
        aria-hidden
        style={{
          ...base,
          background: `
            radial-gradient(ellipse 65% 55% at 10% 20%, ${accent}${toHexAlpha(a * 0.60)} 0%, transparent 70%),
            radial-gradient(ellipse 50% 60% at 88% 80%, ${accent}${toHexAlpha(a * 0.50)} 0%, transparent 70%),
            radial-gradient(ellipse 42% 38% at 52% 52%, ${accent}${toHexAlpha(a * 0.28)} 0%, transparent 70%)
          `,
          filter: `blur(${28 + a * 18}px)`,
        }}
      />
    );
  }
  if (pattern === "grid") {
    const la = a * 0.28;
    return (
      <div
        aria-hidden
        style={{
          ...base,
          backgroundImage: `
            repeating-linear-gradient(0deg,   rgba(255,255,255,${la}) 0px, rgba(255,255,255,${la}) 1px, transparent 1px, transparent 52px),
            repeating-linear-gradient(90deg, rgba(255,255,255,${la}) 0px, rgba(255,255,255,${la}) 1px, transparent 1px, transparent 52px)
          `,
        }}
      />
    );
  }
  if (pattern === "glow") {
    return (
      <div
        aria-hidden
        style={{
          ...base,
          background: `
            radial-gradient(circle at 50% 45%, ${accent}${toHexAlpha(a * 0.55)} 0%, transparent 65%),
            radial-gradient(circle at 5%  95%, ${accent}${toHexAlpha(a * 0.35)} 0%, transparent 50%)
          `,
        }}
      />
    );
  }
  if (pattern === "paper") {
    const url = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='p'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.5' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23p)'/%3E%3C/svg%3E")`;
    return (
      <div
        aria-hidden
        style={{ ...base, backgroundImage: url, backgroundSize: "200px 200px", opacity: a * 0.22, mixBlendMode: "soft-light" }}
      />
    );
  }
  if (pattern === "depth") {
    return (
      <div
        aria-hidden
        style={{
          ...base,
          background: `
            radial-gradient(ellipse 130% 75% at 50% 115%, rgba(0,0,0,${a * 0.72}) 0%, transparent 60%),
            radial-gradient(ellipse 110% 45% at 50% -15%, rgba(0,0,0,${a * 0.32}) 0%, transparent 58%)
          `,
        }}
      />
    );
  }
  return null;
}

function shade(hex: string, percent: number) {
  const c = hex.replace("#", "");
  const num = parseInt(c.length === 3 ? c.split("").map((x) => x + x).join("") : c, 16);
  let r = (num >> 16) & 0xff;
  let g = (num >> 8) & 0xff;
  let b = num & 0xff;
  const amt = Math.round((255 * percent) / 100);
  r = Math.max(0, Math.min(255, r + amt));
  g = Math.max(0, Math.min(255, g + amt));
  b = Math.max(0, Math.min(255, b + amt));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

// ---------- Decorative blob ----------

function Blob({
  cW,
  color,
  x,
  y,
  size,
  opacity = 0.4,
}: {
  cW: number;
  color: string;
  x: number;
  y: number;
  size: number;
  opacity?: number;
}) {
  return (
    <div
      style={{
        position: "absolute",
        left: `${x}%`,
        top: `${y}%`,
        width: `${size}%`,
        aspectRatio: "1 / 1",
        background: color,
        borderRadius: "50%",
        filter: `blur(${cW * 0.06}px)`,
        opacity,
        pointerEvents: "none",
      }}
    />
  );
}

// ---------- Default element rects per layout ----------

type Rect = { x: number; y: number; width: number; height: number };
type LayoutRects = {
  caption?: Rect & { align?: "center" | "left" };
  device?: Rect;
  deviceSecondary?: Rect;
};

function getDefaultRects(
  layout: Slide["layout"],
  cW: number,
  cH: number,
  frameAspect: number,
  fwFrac: number,
  fwSmallFrac: number,
): LayoutRects {
  const deviceW = fwFrac * cW;
  const deviceH = deviceW / frameAspect;
  const smallW = fwSmallFrac * cW;
  const smallH = smallW / frameAspect;
  const capW = cW * 0.84;
  const capH = cH * 0.28;

  switch (layout) {
    case "hero":
      return {
        caption: { x: cW * 0.08, y: cH * 0.09, width: capW, height: capH, align: "center" },
        device: {
          x: (cW - deviceW) / 2,
          y: cH - deviceH + deviceH * 0.15,
          width: deviceW,
          height: deviceH,
        },
      };
    case "device-bottom":
      return {
        caption: { x: cW * 0.08, y: cH * 0.08, width: capW, height: capH, align: "center" },
        device: {
          x: (cW - deviceW) / 2,
          y: cH - deviceH - cH * 0.02,
          width: deviceW,
          height: deviceH,
        },
      };
    case "device-top":
      return {
        caption: { x: cW * 0.08, y: cH * 0.65, width: capW, height: capH, align: "center" },
        device: {
          x: (cW - deviceW) / 2,
          y: -cH * 0.1,
          width: deviceW,
          height: deviceH,
        },
      };
    case "two-devices":
      return {
        caption: { x: cW * 0.08, y: cH * 0.08, width: capW, height: capH, align: "center" },
        deviceSecondary: {
          x: -cW * 0.06,
          y: cH - smallH - cH * 0.05,
          width: smallW,
          height: smallH,
        },
        device: {
          x: cW - deviceW * 0.9 + cW * 0.06,
          y: cH - deviceH * 0.9 - cH * 0.02,
          width: deviceW * 0.9,
          height: (deviceW * 0.9) / frameAspect,
        },
      };
    case "no-device":
      return {
        caption: {
          x: cW * 0.1,
          y: cH * 0.35,
          width: cW * 0.8,
          height: cH * 0.3,
          align: "center",
        },
      };
    case "split-landscape":
      return {
        caption: {
          x: cW * 0.05,
          y: cH * 0.25,
          width: cW * 0.38,
          height: cH * 0.5,
          align: "left",
        },
        device: {
          x: cW - deviceW + cW * 0.03,
          y: (cH - deviceH) / 2,
          width: deviceW,
          height: deviceH,
        },
      };
    default:
      return {};
  }
}

function rectFor(
  id: ElementId,
  slide: Slide,
  defaults: LayoutRects,
): (Rect & { align?: "center" | "left" }) | undefined {
  const saved = slide.transforms?.[id];
  const def = defaults[id];
  if (!def && !saved) return undefined;
  if (!saved) return def;
  return {
    x: saved.x,
    y: saved.y,
    width: saved.width,
    height: saved.height,
    align: (def as { align?: "center" | "left" } | undefined)?.align,
  };
}

// ---------- Main canvas ----------

export function SlideCanvas({
  slide,
  device,
  orientation,
  theme,
  locale,
  appName,
  appIcon,
  fontFamily,
  editable,
  edit,
  selectedElementId = null,
  previewScale = 1,
  hideEmpty,
  calloutMode,
  selectedCalloutId,
  onAddCallout,
  onUpdateCallout,
  onSelectCallout,
}: Props) {
  const { cW, cH } = getCanvas(device, orientation);
  const screenshot = resolveScreenshot(slide.screenshot, locale);
  const screenshotSecondary = resolveScreenshot(slide.screenshotSecondary, locale);
  const { Comp: Frame, widthFn, smallWidthFn } = getFrameForDevice(device, orientation);
  const inverted = !!slide.inverted;
  const bg = backgroundFor(theme, inverted, slide.gradient);
  const frameAspect = getFrameAspect(device, orientation);
  const fwFrac = widthFn(cW, cH);
  const fwSmallFrac = smallWidthFn(cW, cH);
  const defaults = getDefaultRects(slide.layout, cW, cH, frameAspect, fwFrac, fwSmallFrac);

  // Special: feature-graphic layout — its own composition (not draggable for now)
  if (slide.layout === "feature-graphic" || device === "feature-graphic") {
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          position: "relative",
          overflow: "hidden",
          background: `linear-gradient(135deg, ${theme.bgAlt} 0%, ${shade(theme.bgAlt, -10)} 50%, ${theme.accent} 200%)`,
          display: "flex",
          alignItems: "center",
          padding: `0 ${cW * 0.06}px`,
          color: theme.fgAlt,
        }}
      >
        <Blob cW={cW} color={theme.accent} x={70} y={20} size={50} opacity={0.45} />
        <div style={{ display: "flex", alignItems: "center", gap: cW * 0.03, zIndex: 2 }}>
          {appIcon && img(appIcon) ? (
            <img
              src={img(appIcon)}
              alt=""
              style={{
                width: cW * 0.13,
                height: cW * 0.13,
                borderRadius: cW * 0.022,
                boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
              }}
              draggable={false}
            />
          ) : (
            <div
              aria-hidden
              style={{
                width: cW * 0.13,
                height: cW * 0.13,
                borderRadius: cW * 0.022,
                background: `linear-gradient(135deg, ${theme.accent}55, ${theme.accent})`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: theme.fgAlt,
                fontWeight: 800,
                fontSize: cW * 0.07,
                boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
              }}
            >
              {(appName || "A").slice(0, 1).toUpperCase()}
            </div>
          )}
          <div>
            <div style={{ fontSize: cW * 0.06, fontWeight: 800, lineHeight: 1.05 }}>{appName || "App"}</div>
            <EditableText
              value={pickText(slide.headline, locale)}
              editable={editable}
              multiline
              onChange={edit?.onHeadlineChange}
              style={{
                fontSize: cW * 0.028,
                color: "rgba(255,255,255,0.85)",
                marginTop: cW * 0.012,
                lineHeight: 1.25,
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  const captionRect = rectFor("caption", slide, defaults);
  const deviceRect = rectFor("device", slide, defaults);
  const secondaryRect = rectFor("deviceSecondary", slide, defaults);

  function renderCaption() {
    if (!captionRect) return null;
    const saved = slide.transforms?.caption;
    const rotation = saved?.rotation ?? 0;
    const zIndex = saved?.zIndex ?? 4;
    const inner = (
      <Caption
        cW={cW}
        cH={cH}
        slide={slide}
        theme={theme}
        locale={locale}
        editable={editable}
        edit={edit}
        align={captionRect.align || "center"}
        inverted={inverted}
        fontFamily={fontFamily}
        onFocus={() => edit?.onSelectElement?.("caption")}
      />
    );
    return (
      <Movable
        rect={captionRect}
        cW={cW}
        cH={cH}
        editable={editable}
        previewScale={previewScale}
        rotation={rotation}
        onChange={(t) =>
          edit?.onElementChange?.("caption", {
            ...t,
            rotation,
            zIndex,
          })
        }
        onRotate={(deg) =>
          edit?.onElementChange?.("caption", {
            ...captionRect,
            rotation: deg,
            zIndex,
          })
        }
        zIndex={zIndex}
        selected={selectedElementId === "caption"}
        onSelect={() => edit?.onSelectElement?.("caption")}
      >
        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "flex-start" }}>
          {inner}
        </div>
      </Movable>
    );
  }

  function renderDevice(id: "device" | "deviceSecondary", rect: Rect, src: string, extraStyle?: React.CSSProperties) {
    const saved = slide.transforms?.[id];
    const rotation = saved?.rotation ?? 0;
    const zIndex = saved?.zIndex ?? (id === "deviceSecondary" ? 2 : 3);
    return (
      <Movable
        rect={rect}
        cW={cW}
        cH={cH}
        editable={editable}
        previewScale={previewScale}
        rotation={rotation}
        onChange={(t) =>
          edit?.onElementChange?.(id, {
            ...t,
            rotation,
            zIndex,
          })
        }
        onRotate={(deg) =>
          edit?.onElementChange?.(id, {
            ...rect,
            rotation: deg,
            zIndex,
          })
        }
        lockAspectRatio={frameAspect}
        zIndex={zIndex}
        allowOverflow
        selected={selectedElementId === id}
        onSelect={() => edit?.onSelectElement?.(id)}
      >
        <Frame
          src={src}
          hideEmpty={hideEmpty}
          frameColor={slide.frameColor}
          style={{ width: "100%", height: "100%", ...extraStyle }}
        />
      </Movable>
    );
  }

  // Click on empty background area deselects any active element. Movable
  // children sit absolutely-positioned inside this root; checking that the
  // event landed directly on the root (not bubbled up from a child) keeps
  // device/caption clicks from accidentally deselecting.
  const handleBackgroundMouseDown = editable
    ? (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
          edit?.onSelectElement?.(null);
          onSelectSticker?.(null);
        }
      }
    : undefined;

  return (
    <div
      onMouseDown={handleBackgroundMouseDown}
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        overflow: "hidden",
        background: bg,
        color: inverted ? theme.fgAlt : theme.fg,
      }}
    >
      <Blob cW={cW} color={theme.accent} x={-15} y={-10} size={55} opacity={inverted ? 0.25 : 0.32} />
      <Blob cW={cW} color={theme.accent} x={70} y={75} size={45} opacity={inverted ? 0.18 : 0.25} />

      <PatternLayer
        pattern={slide.pattern}
        intensity={slide.patternIntensity ?? 50}
        accent={theme.accent}
      />

      {secondaryRect &&
        renderDevice(
          "deviceSecondary",
          secondaryRect,
          screenshotSecondary || screenshot,
          { opacity: 0.85 },
        )}
      {deviceRect &&
        renderDevice("device", deviceRect, screenshot)}
      {renderCaption()}

      {/* SVG overlay — source rect highlights + connector lines */}
      {(slide.callouts || []).length > 0 && (
        <svg
          style={{
            position: "absolute",
            inset: 0,
            width: cW,
            height: cH,
            pointerEvents: "none",
            zIndex: 18,
            overflow: "visible",
          }}
        >
          {(slide.callouts || []).map((callout) => {
            const bW = Math.round(callout.width * callout.zoom);
            const bH = Math.round(callout.height * callout.zoom);
            const isSel = selectedCalloutId === callout.id;
            const color = isSel ? "#6366f1" : "rgba(255,255,255,0.75)";
            const strokeW = isSel ? 2 : 1.5;
            // Centers
            const scx = callout.x + callout.width / 2;
            const scy = callout.y + callout.height / 2;
            const bcx = callout.posX + bW / 2;
            const bcy = callout.posY + bH / 2;
            const dx = bcx - scx;
            const dy = bcy - scy;
            const len = Math.sqrt(dx * dx + dy * dy) || 1;
            const ndx = dx / len;
            const ndy = dy / len;
            // Exit point on source rect edge
            const ts = Math.min(
              (callout.width / 2) / (Math.abs(ndx) || 0.001),
              (callout.height / 2) / (Math.abs(ndy) || 0.001),
            );
            const spx = scx + ndx * ts;
            const spy = scy + ndy * ts;
            // Entry point on bubble rect edge
            const tb = Math.min(
              (bW / 2) / (Math.abs(ndx) || 0.001),
              (bH / 2) / (Math.abs(ndy) || 0.001),
            );
            const bpx = bcx - ndx * tb;
            const bpy = bcy - ndy * tb;
            // Bezier control offset (perpendicular-ish bulge)
            const cpOff = Math.min(len * 0.35, 80);
            const cp1x = spx + ndx * cpOff;
            const cp1y = spy + ndy * cpOff;
            const cp2x = bpx - ndx * cpOff;
            const cp2y = bpy - ndy * cpOff;
            return (
              <g key={callout.id}>
                {/* Source selection rectangle */}
                <rect
                  x={callout.x}
                  y={callout.y}
                  width={callout.width}
                  height={callout.height}
                  fill={isSel ? "rgba(99,102,241,0.10)" : "rgba(255,255,255,0.05)"}
                  stroke={color}
                  strokeWidth={strokeW}
                  strokeDasharray="5 3"
                  rx={4}
                />
                {/* Connector bezier */}
                <path
                  d={`M ${spx} ${spy} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${bpx} ${bpy}`}
                  fill="none"
                  stroke={color}
                  strokeWidth={strokeW}
                  strokeDasharray="6 3"
                  strokeLinecap="round"
                />
                {/* Dot at source exit */}
                <circle cx={spx} cy={spy} r={3} fill={color} />
                {/* Dot at bubble entry */}
                <circle cx={bpx} cy={bpy} r={3} fill={color} />
              </g>
            );
          })}
        </svg>
      )}

      {/* Callout bubbles */}
      {(slide.callouts || []).map((callout) => (
        <CalloutBubble
          key={callout.id}
          callout={callout}
          slide={slide}
          device={device}
          orientation={orientation}
          theme={theme}
          locale={locale}
          appName={appName}
          appIcon={appIcon}
          cW={cW}
          cH={cH}
          previewScale={previewScale}
          editable={editable}
          selected={selectedCalloutId === callout.id}
          onSelect={onSelectCallout}
          onUpdate={onUpdateCallout}
        />
      ))}

      {/* Stickers */}
      {(slide.stickers || []).map((sticker) => (
        <Movable
          key={sticker.id}
          rect={{ x: sticker.x, y: sticker.y, width: sticker.width, height: sticker.height }}
          cW={cW}
          cH={cH}
          editable={editable}
          previewScale={previewScale ?? 1}
          rotation={sticker.rotation ?? 0}
          onChange={(t) => onUpdateSticker?.({ ...sticker, ...t })}
          onRotate={(deg) => onUpdateSticker?.({ ...sticker, rotation: deg })}
          onDelete={() => onDeleteSticker?.(sticker.id)}
          zIndex={sticker.zIndex ?? 20}
          allowOverflow
          selected={selectedStickerId === sticker.id}
          onSelect={() => onSelectSticker?.(sticker.id)}
        >
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "min(80%, 140px)",
              userSelect: "none",
              lineHeight: 1,
            }}
          >
            {sticker.emoji}
          </div>
        </Movable>
      ))}

      {/* Callout draw overlay — captures mouse for new callout creation */}
      {editable && calloutMode && (
        <CalloutDrawOverlay
          cW={cW}
          cH={cH}
          previewScale={previewScale}
          onAdd={(c) => {
            onAddCallout?.(c);
          }}
        />
      )}
    </div>
  );
}

// ---------- Callout draw overlay ----------

function CalloutDrawOverlay({
  cW,
  cH,
  previewScale,
  onAdd,
}: {
  cW: number;
  cH: number;
  previewScale: number;
  onAdd?: (c: Callout) => void;
}) {
  const overlayRef = React.useRef<HTMLDivElement>(null);
  const selRef = React.useRef<HTMLDivElement>(null);
  const drawing = React.useRef(false);
  const startPos = React.useRef({ x: 0, y: 0 });

  function canvasCoords(e: React.MouseEvent): { x: number; y: number } {
    const el = overlayRef.current;
    if (!el) return { x: 0, y: 0 };
    const r = el.getBoundingClientRect();
    return {
      x: (e.clientX - r.left) / previewScale,
      y: (e.clientY - r.top) / previewScale,
    };
  }

  function onMouseDown(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const pos = canvasCoords(e);
    drawing.current = true;
    startPos.current = pos;
    const s = selRef.current;
    if (s) {
      s.style.display = "block";
      s.style.left = `${pos.x}px`;
      s.style.top = `${pos.y}px`;
      s.style.width = "0px";
      s.style.height = "0px";
    }
  }

  function onMouseMove(e: React.MouseEvent) {
    if (!drawing.current) return;
    const pos = canvasCoords(e);
    const x = Math.min(pos.x, startPos.current.x);
    const y = Math.min(pos.y, startPos.current.y);
    const w = Math.abs(pos.x - startPos.current.x);
    const h = Math.abs(pos.y - startPos.current.y);
    const s = selRef.current;
    if (s) {
      s.style.left = `${x}px`;
      s.style.top = `${y}px`;
      s.style.width = `${w}px`;
      s.style.height = `${h}px`;
    }
  }

  function finalize(e: React.MouseEvent) {
    if (!drawing.current) return;
    drawing.current = false;
    const s = selRef.current;
    if (s) s.style.display = "none";

    const pos = canvasCoords(e);
    const x = Math.min(pos.x, startPos.current.x);
    const y = Math.min(pos.y, startPos.current.y);
    const w = Math.abs(pos.x - startPos.current.x);
    const h = Math.abs(pos.y - startPos.current.y);

    if (w < 20 || h < 20) return;

    const zoom = 4;
    const bubbleW = w * zoom;
    const bubbleH = h * zoom;
    let posX = x + w + 30;
    let posY = y;
    if (posX + bubbleW > cW) posX = Math.max(0, x - bubbleW - 30);
    if (posY + bubbleH > cH) posY = Math.max(0, cH - bubbleH);

    onAdd?.({
      id: nid(),
      x: Math.round(x),
      y: Math.round(y),
      width: Math.round(w),
      height: Math.round(h),
      zoom,
      posX: Math.round(posX),
      posY: Math.round(posY),
    });
  }

  return (
    <div
      ref={overlayRef}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={finalize}
      onMouseLeave={finalize}
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 30,
        cursor: "crosshair",
      }}
    >
      <div
        ref={selRef}
        style={{
          display: "none",
          position: "absolute",
          border: "2px dashed rgba(255,255,255,0.95)",
          background: "rgba(255,255,255,0.08)",
          boxShadow: "0 0 0 1px rgba(0,0,0,0.25)",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}

// ---------- Callout bubble ----------

/** Small circular dot shown at each corner of a selected callout bubble. */
function ResizeDot() {
  return (
    <div
      style={{
        width: 12,
        height: 12,
        borderRadius: "50%",
        background: "white",
        border: "2.5px solid #6366f1",
        boxShadow: "0 2px 6px rgba(0,0,0,0.45)",
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%,-50%)",
        cursor: "pointer",
      }}
    />
  );
}

const CORNER_HANDLES = {
  topLeft: <ResizeDot />,
  topRight: <ResizeDot />,
  bottomLeft: <ResizeDot />,
  bottomRight: <ResizeDot />,
};

const CORNER_ENABLE = {
  top: false, bottom: false, left: false, right: false,
  topLeft: true, topRight: true, bottomLeft: true, bottomRight: true,
};

function CalloutBubble({
  callout,
  slide,
  device,
  orientation,
  theme,
  locale,
  appName,
  appIcon,
  cW,
  cH,
  previewScale = 1,
  editable,
  selected,
  onSelect,
  onUpdate,
}: {
  callout: Callout;
  slide: Slide;
  device: Device;
  orientation: Orientation;
  theme: Theme;
  locale: string;
  appName?: string;
  appIcon?: string;
  cW: number;
  cH: number;
  previewScale?: number;
  editable?: boolean;
  selected: boolean;
  onSelect?: (id: string | null) => void;
  onUpdate?: (c: Callout) => void;
}) {
  const zoom = callout.zoom;
  const bubbleW = Math.round(callout.width * zoom);
  const bubbleH = Math.round(callout.height * zoom);
  const borderPx = Math.max(1, Math.round(2 / previewScale));
  const radiusPx = Math.round(16 / previewScale);

  // Render inner canvas without callouts to avoid infinite recursion
  const baseSlide: Slide = React.useMemo(
    () => ({ ...slide, callouts: [] }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [slide.id, slide.layout, slide.screenshot, slide.inverted, slide.pattern,
     slide.patternIntensity, slide.label, slide.headline, slide.transforms],
  );

  const borderColor = selected ? "#6366f1" : "rgba(255,255,255,0.92)";
  const shadow = selected
    ? `0 0 0 ${borderPx * 2}px #6366f133, 0 8px 28px rgba(0,0,0,0.45)`
    : "0 8px 28px rgba(0,0,0,0.38)";

  // The inner transform: translate the canvas so the selected region starts at (0,0),
  // then scale it up by zoom. CSS applies right-to-left: translate first, then scale.
  const innerTransform = `scale(${zoom}) translate(${-callout.x}px, ${-callout.y}px)`;

  const viewport = (
    <div
      style={{
        width: "100%",
        height: "100%",
        overflow: "hidden",
        borderRadius: radiusPx,
        border: `${borderPx}px solid ${borderColor}`,
        boxShadow: shadow,
        position: "relative",
        cursor: editable ? "grab" : "default",
      }}
    >
      <div
        style={{
          width: cW,
          height: cH,
          position: "absolute",
          top: 0,
          left: 0,
          transform: innerTransform,
          transformOrigin: "top left",
          pointerEvents: "none",
        }}
      >
        <SlideCanvas
          slide={baseSlide}
          device={device}
          orientation={orientation}
          theme={theme}
          locale={locale}
          appName={appName}
          appIcon={appIcon}
          editable={false}
          hideEmpty
        />
      </div>
    </div>
  );

  if (!editable) {
    return (
      <div
        style={{
          position: "absolute",
          left: callout.posX,
          top: callout.posY,
          width: bubbleW,
          height: bubbleH,
          zIndex: 20,
          pointerEvents: "none",
        }}
      >
        {viewport}
      </div>
    );
  }

  return (
    <Rnd
      position={{ x: callout.posX, y: callout.posY }}
      size={{ width: bubbleW, height: bubbleH }}
      onDragStop={(_, d) =>
        onUpdate?.({ ...callout, posX: Math.round(d.x), posY: Math.round(d.y) })
      }
      onResizeStop={(_, __, ref, ___, pos) => {
        const newZoom = Math.max(1, Math.min(8, ref.offsetWidth / callout.width));
        onUpdate?.({
          ...callout,
          zoom: Math.round(newZoom * 4) / 4,
          posX: Math.round(pos.x),
          posY: Math.round(pos.y),
        });
      }}
      lockAspectRatio={callout.width / (callout.height || 1)}
      enableResizing={selected ? CORNER_ENABLE : false}
      resizeHandleComponent={selected ? CORNER_HANDLES : undefined}
      scale={previewScale}
      bounds="parent"
      style={{ zIndex: 20 }}
      onMouseDown={() => onSelect?.(callout.id)}
    >
      {viewport}
    </Rnd>
  );
}

// ---------- Movable wrapper ----------

// Fraction of an element's width/height that must remain inside the canvas
// when overflow is allowed. Keeps a graspable handle visible so the user can
// always drag the element back onto the canvas.
const MIN_VISIBLE_FRAC = 0.1;

function clampRect(
  r: { x: number; y: number; width: number; height: number },
  cW: number,
  cH: number,
  allowOverflow = false,
) {
  if (allowOverflow) {
    const width = r.width;
    const height = r.height;
    const minVisX = Math.max(8, width * MIN_VISIBLE_FRAC);
    const minVisY = Math.max(8, height * MIN_VISIBLE_FRAC);
    const x = Math.max(-(width - minVisX), Math.min(r.x, cW - minVisX));
    const y = Math.max(-(height - minVisY), Math.min(r.y, cH - minVisY));
    return { x, y, width, height };
  }
  const width = Math.min(r.width, cW);
  const height = Math.min(r.height, cH);
  const x = Math.max(0, Math.min(r.x, cW - width));
  const y = Math.max(0, Math.min(r.y, cH - height));
  return { x, y, width, height };
}

function Movable({
  rect,
  cW,
  cH,
  editable,
  previewScale,
  onChange,
  onRotate,
  onDelete,
  children,
  lockAspectRatio,
  zIndex,
  rotation = 0,
  allowOverflow = false,
  selected = false,
  onSelect,
}: {
  rect: Rect;
  cW: number;
  cH: number;
  editable?: boolean;
  previewScale: number;
  onChange: (t: ElementTransform) => void;
  onRotate?: (deg: number) => void;
  onDelete?: () => void;
  children: React.ReactNode;
  lockAspectRatio?: number | boolean;
  zIndex?: number;
  rotation?: number;
  allowOverflow?: boolean;
  selected?: boolean;
  onSelect?: () => void;
}) {
  const innerRef = React.useRef<HTMLDivElement>(null);

  function startRotate(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!onRotate) return;

    function onMove(ev: MouseEvent) {
      const el = innerRef.current;
      if (!el) return;
      const box = el.getBoundingClientRect();
      const cx = box.left + box.width / 2;
      const cy = box.top + box.height / 2;
      const angle = Math.atan2(ev.clientY - cy, ev.clientX - cx) * (180 / Math.PI) + 90;
      onRotate(Math.round(angle));
    }

    function onUp() {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    }

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }

  // Rotation lives on the inner wrapper so the Rnd's axis-aligned rect remains
  // the authoritative bounding box for drag/resize math. A bare mousedown
  // listener (no stopPropagation — that would prevent react-rnd from starting
  // a drag) marks the element as the current selection.
  const rotated = (
    <div
      ref={innerRef}
      onMouseDown={() => {
        if (editable) onSelect?.();
      }}
      style={{
        width: "100%",
        height: "100%",
        transform: rotation ? `rotate(${rotation}deg)` : undefined,
        transformOrigin: "center center",
        position: "relative",
      }}
    >
      {children}
    </div>
  );

  // Non-editable (export) path: plain absolute-positioned div, no Rnd.
  if (!editable) {
    return (
      <div
        style={{
          position: "absolute",
          left: rect.x,
          top: rect.y,
          width: rect.width,
          height: rect.height,
          zIndex,
        }}
      >
        {rotated}
      </div>
    );
  }

  const display = clampRect(rect, cW, cH, allowOverflow);

  const rotateHandle = selected && onRotate ? (
    <div
      onMouseDown={startRotate}
      style={{
        position: "absolute",
        top: -38,
        left: "50%",
        transform: "translateX(-50%)",
        width: 28,
        height: 28,
        borderRadius: "50%",
        background: "rgba(255,255,255,0.95)",
        border: "1.5px solid rgba(91,124,250,0.85)",
        boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "grab",
        zIndex: 9999,
        pointerEvents: "all",
      }}
      title="Drag to rotate"
    >
      <RotateCw size={14} color="#5b7cfa" strokeWidth={2.2} />
    </div>
  ) : null;

  const deleteHandle = selected && onDelete ? (
    <div
      onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(); }}
      style={{
        position: "absolute",
        top: -10,
        right: -10,
        width: 24,
        height: 24,
        borderRadius: "50%",
        background: "#ef4444",
        border: "2px solid white",
        boxShadow: "0 2px 6px rgba(0,0,0,0.25)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        zIndex: 9999,
        pointerEvents: "all",
      }}
      title="Delete sticker"
    >
      <X size={12} color="white" strokeWidth={2.5} />
    </div>
  ) : null;

  return (
    <Rnd
      bounds={allowOverflow ? undefined : "parent"}
      scale={previewScale}
      lockAspectRatio={lockAspectRatio}
      position={{ x: display.x, y: display.y }}
      size={{ width: display.width, height: display.height }}
      onDragStart={() => onSelect?.()}
      onResizeStart={() => onSelect?.()}
      onDragStop={(_e, d) => {
        const next = clampRect(
          { x: d.x, y: d.y, width: display.width, height: display.height },
          cW,
          cH,
          allowOverflow,
        );
        onChange(next);
      }}
      onResizeStop={(_e, _dir, ref, _delta, position) => {
        const next = clampRect(
          {
            x: position.x,
            y: position.y,
            width: parseFloat(ref.style.width),
            height: parseFloat(ref.style.height),
          },
          cW,
          cH,
          allowOverflow,
        );
        onChange(next);
      }}
      style={{ zIndex, overflow: "visible" }}
      resizeHandleStyles={handleStyle}
      className={selected ? "rnd-editable rnd-selected" : "rnd-editable"}
    >
      {rotateHandle}
      {deleteHandle}
      {rotated}
    </Rnd>
  );
}

// Subtle resize handles (visible only on hover via globals.css).
const handleSize = 14;
const handleStyle: Record<string, React.CSSProperties> = {
  top: { height: handleSize },
  right: { width: handleSize },
  bottom: { height: handleSize },
  left: { width: handleSize },
  topRight: { width: handleSize, height: handleSize },
  bottomRight: { width: handleSize, height: handleSize },
  bottomLeft: { width: handleSize, height: handleSize },
  topLeft: { width: handleSize, height: handleSize },
};

export type Device =
  | "iphone"
  | "ipad"
  | "android"
  | "android-7"
  | "android-10"
  | "feature-graphic";

export type Orientation = "portrait" | "landscape";

export type Platform = "ios" | "android";

// Layouts the editor can render. Vary across slides for visual rhythm.
export type SlideLayout =
  | "hero"             // centered device, headline above
  | "device-bottom"    // headline top, device bottom-center
  | "device-top"       // device top, headline bottom (contrast)
  | "two-devices"      // back + front phones, headline above
  | "no-device"        // big headline + decorative blob, no device
  | "split-landscape"  // landscape tablets only: caption left + device right
  | "feature-graphic"; // 1024×500 banner with icon + name + tagline

// Per-element rect in canvas pixel space. Optional rotation in degrees and zIndex.
export type ElementTransform = {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  zIndex?: number;
};

export type ElementId = "caption" | "device" | "deviceSecondary";

// Per-locale text keyed by locale code (e.g. "en", "de"). A locale is absent
// if the user hasn't typed anything for it; renderers fall back to en (see
// lib/locale.ts). The set of locales a project targets lives on
// ProjectState.locales.
export type LocalizedText = Partial<Record<string, string>>;

export type PatternId =
  | "none"
  | "mesh"
  | "grain"
  | "glass"
  | "blobs"
  | "grid"
  | "glow"
  | "paper"
  | "depth";

export type Slide = {
  id: string;
  layout: SlideLayout;
  label: LocalizedText;       // tiny uppercase caption above headline, per locale
  headline: LocalizedText;    // multi-line; newlines are intentional, per locale
  screenshot: string;         // path under /screenshots/ — may contain {locale}
  screenshotSecondary?: string; // for two-devices layout — may contain {locale}
  inverted?: boolean;         // dark background variant
  pattern?: PatternId;        // texture/style overlay above bg, below content
  patternIntensity?: number;  // 0–100, default 50
  // Per-element overrides; when present, replaces layout default placement.
  transforms?: Partial<Record<ElementId, ElementTransform>>;
  callouts?: Callout[];       // zoom callout bubbles
  frameColor?: string;        // device frame tint (CSS color); undefined = device default
  gradient?: {               // custom background gradient; undefined = use theme colors
    color1: string;
    color2: string;
    angle: number;           // 0–360 degrees
  };
};

export type ThemeId =
  | "clean-light"
  | "dark-bold"
  | "warm-editorial"
  | "ocean-fresh"
  | "midnight"
  | "rose"
  | "forest"
  | "sunset"
  | "arctic"
  | "neon";

export type Theme = {
  id: ThemeId;
  name: string;
  bg: string;          // primary background
  bgAlt: string;       // inverted background
  fg: string;          // text on bg
  fgAlt: string;       // text on bgAlt
  accent: string;
  muted: string;
};

export type Callout = {
  id: string;
  x: number;       // selection top-left in canvas px
  y: number;
  width: number;   // selection size in canvas px
  height: number;
  zoom: number;    // magnification 1–6
  posX: number;    // bubble top-left in canvas px
  posY: number;
};

export type ProjectState = {
  appName: string;
  themeId: ThemeId;
  // Locales this project targets. Drives the toolbar dropdown and bulk export.
  // Single-locale projects ship as ["en"] and hide the locale UI.
  locales: string[];
  locale: string;
  device: Device;
  orientation: Orientation;
  // Per-device slide decks so platform switching preserves work
  slidesByDevice: Record<Device, Slide[]>;
  appIcon?: string;    // path under /public (e.g. /app-icon.png)
  fontFamily?: string; // CSS font-family name, defaults to Inter
};

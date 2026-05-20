import type { Device, Orientation, SlideLayout, Theme, ThemeId } from "./types";

// ---------- Canvas dimensions (design at largest required resolution) ----------
export const CANVAS: Record<Device, { w: number; h: number; wL?: number; hL?: number }> = {
  iphone:        { w: 1320, h: 2868 },
  ipad:          { w: 2064, h: 2752 },
  android:       { w: 1080, h: 1920 },
  "android-7":   { w: 1200, h: 1920, wL: 1920, hL: 1200 },
  "android-10":  { w: 1600, h: 2560, wL: 2560, hL: 1600 },
  "feature-graphic": { w: 1024, h: 500 },
};

// ---------- Export sizes per device ----------
export type ExportSize = { label: string; w: number; h: number };

export const EXPORT_SIZES: Record<Device, ExportSize[]> = {
  iphone: [
    { label: '6.9"', w: 1320, h: 2868 },
    { label: '6.5"', w: 1284, h: 2778 },
    { label: '6.3"', w: 1206, h: 2622 },
    { label: '6.1"', w: 1125, h: 2436 },
  ],
  ipad: [
    { label: '13" iPad',       w: 2064, h: 2752 },
    { label: '12.9" iPad Pro', w: 2048, h: 2732 },
  ],
  android:       [{ label: "Phone",          w: 1080, h: 1920 }],
  "android-7":   [{ label: '7" Portrait',    w: 1200, h: 1920 }],
  "android-10":  [{ label: '10" Portrait',   w: 1600, h: 2560 }],
  "feature-graphic": [{ label: "Feature Graphic", w: 1024, h: 500 }],
};

// Landscape sizes (tablets only)
export const EXPORT_SIZES_LANDSCAPE: Partial<Record<Device, ExportSize[]>> = {
  "android-7":  [{ label: '7" Landscape',  w: 1920, h: 1200 }],
  "android-10": [{ label: '10" Landscape', w: 2560, h: 1600 }],
};

export function supportsLandscape(device: Device): boolean {
  return device in EXPORT_SIZES_LANDSCAPE;
}

export function getExportSizes(device: Device, orientation: Orientation): ExportSize[] {
  if (orientation === "landscape") {
    return EXPORT_SIZES_LANDSCAPE[device] || EXPORT_SIZES[device];
  }
  return EXPORT_SIZES[device];
}

// ---------- Frame aspect ratios ----------
export const MK_RATIO    = 9 / 19.5;    // iPhone CSS frame (modern iPhone proportions)
export const TAB_P_RATIO = 0.667;        // tablet portrait
export const TAB_L_RATIO = 1.5;          // tablet landscape
export const IPAD_RATIO  = 0.770;        // iPad

// ---------- Width formula helpers ----------
export function phoneW(cW: number, cH: number, clamp = 0.84) {
  return Math.min(clamp, 0.72 * (cH / cW) * MK_RATIO);
}
export function phoneWSmall(cW: number, cH: number) {
  return phoneW(cW, cH, 0.66);
}
export function tabletPW(cW: number, cH: number, clamp = 0.80) {
  return Math.min(clamp, 0.72 * (cH / cW) * TAB_P_RATIO);
}
export function tabletLW(cW: number, cH: number, clamp = 0.62) {
  return Math.min(clamp, 0.75 * (cH / cW) * TAB_L_RATIO);
}
export function ipadW(cW: number, cH: number, clamp = 0.75) {
  return Math.min(clamp, 0.72 * (cH / cW) * IPAD_RATIO);
}

// ---------- Themes ----------
export const THEMES: Record<ThemeId, Theme> = {
  "clean-light": {
    id: "clean-light",
    name: "Clean Light",
    bg: "#F6F1EA",
    bgAlt: "#171717",
    fg: "#171717",
    fgAlt: "#F6F1EA",
    accent: "#5B7CFA",
    muted: "#6B7280",
  },
  "dark-bold": {
    id: "dark-bold",
    name: "Dark Bold",
    bg: "#0B1020",
    bgAlt: "#F8FAFC",
    fg: "#F8FAFC",
    fgAlt: "#0B1020",
    accent: "#8B5CF6",
    muted: "#94A3B8",
  },
  "warm-editorial": {
    id: "warm-editorial",
    name: "Warm Editorial",
    bg: "#F7E8DA",
    bgAlt: "#2B1D17",
    fg: "#2B1D17",
    fgAlt: "#F7E8DA",
    accent: "#D97706",
    muted: "#7C5A47",
  },
  "ocean-fresh": {
    id: "ocean-fresh",
    name: "Ocean Fresh",
    bg: "#E0F2FE",
    bgAlt: "#0C4A6E",
    fg: "#0C4A6E",
    fgAlt: "#E0F2FE",
    accent: "#0284C7",
    muted: "#475569",
  },
  "midnight": {
    id: "midnight",
    name: "Midnight",
    bg: "#0D0820",
    bgAlt: "#E8E0FF",
    fg: "#E8E0FF",
    fgAlt: "#0D0820",
    accent: "#A855F7",
    muted: "#7C6FA0",
  },
  "rose": {
    id: "rose",
    name: "Rose",
    bg: "#16050C",
    bgAlt: "#FFE4EC",
    fg: "#FFE4EC",
    fgAlt: "#16050C",
    accent: "#F43F5E",
    muted: "#9D6575",
  },
  "forest": {
    id: "forest",
    name: "Forest",
    bg: "#060F09",
    bgAlt: "#DCFCE7",
    fg: "#DCFCE7",
    fgAlt: "#060F09",
    accent: "#22C55E",
    muted: "#5A8268",
  },
  "sunset": {
    id: "sunset",
    name: "Sunset",
    bg: "#120800",
    bgAlt: "#FFF3E0",
    fg: "#FFF3E0",
    fgAlt: "#120800",
    accent: "#F97316",
    muted: "#9A6040",
  },
  "arctic": {
    id: "arctic",
    name: "Arctic",
    bg: "#F0F9FF",
    bgAlt: "#082F49",
    fg: "#082F49",
    fgAlt: "#F0F9FF",
    accent: "#0EA5E9",
    muted: "#4A7A95",
  },
  "neon": {
    id: "neon",
    name: "Neon",
    bg: "#060606",
    bgAlt: "#F0FFF6",
    fg: "#F0FFF6",
    fgAlt: "#060606",
    accent: "#00D97E",
    muted: "#3D8C65",
  },
};

export type Combination = {
  name: string;
  emoji: string;
  themeId: ThemeId;
  pattern: string;
  patternIntensity: number;
  description: string;
};

export const COMBINATIONS: Combination[] = [
  { name: "Midnight Glow",    emoji: "🌌", themeId: "midnight",       pattern: "glow",  patternIntensity: 70, description: "Deep purple + aurora glow" },
  { name: "Arctic Grid",      emoji: "❄️", themeId: "arctic",         pattern: "grid",  patternIntensity: 55, description: "Icy clean + structure" },
  { name: "Sunset Mesh",      emoji: "🌅", themeId: "sunset",         pattern: "mesh",  patternIntensity: 60, description: "Warm amber + soft gradient" },
  { name: "Forest Depth",     emoji: "🌲", themeId: "forest",         pattern: "depth", patternIntensity: 65, description: "Dark green + cinematic vignette" },
  { name: "Rose Blobs",       emoji: "🌸", themeId: "rose",           pattern: "blobs", patternIntensity: 55, description: "Dark rose + organic shapes" },
  { name: "Neon Paper",       emoji: "⚡", themeId: "neon",           pattern: "paper", patternIntensity: 45, description: "Pure black + tactile grain" },
  { name: "Clean Grain",      emoji: "🤍", themeId: "clean-light",    pattern: "grain", patternIntensity: 40, description: "Light + editorial texture" },
  { name: "Ocean Glass",      emoji: "🌊", themeId: "ocean-fresh",    pattern: "glass", patternIntensity: 55, description: "Sky blue + frosted overlay" },
];

export const PATTERN_LABEL: Record<string, string> = {
  none:  "None",
  mesh:  "Mesh",
  grain: "Grain",
  glass: "Glass",
  blobs: "Blobs",
  grid:  "Grid",
  glow:  "Glow",
  paper: "Paper",
  depth: "Depth",
};

export const STORAGE_KEY = "app-store-screenshots:project:v1";

export type FontOption = {
  id: string;
  name: string;
  css: string;
  googleName?: string;
  category: "modern" | "display" | "multilingual";
  script?: string; // e.g. "arabic", "japanese", "korean", "chinese", "devanagari"
};

export const FONT_OPTIONS: FontOption[] = [
  // ── Modern / Clean ────────────────────────────────────────────────
  { id: "inter",           name: "Inter",             css: "Inter",             category: "modern" },
  { id: "plus-jakarta",    name: "Plus Jakarta Sans",  css: "Plus Jakarta Sans", category: "modern",   googleName: "Plus+Jakarta+Sans" },
  { id: "dm-sans",         name: "DM Sans",            css: "DM Sans",           category: "modern",   googleName: "DM+Sans" },
  { id: "outfit",          name: "Outfit",             css: "Outfit",            category: "modern",   googleName: "Outfit" },
  { id: "nunito",          name: "Nunito",             css: "Nunito",            category: "modern",   googleName: "Nunito" },
  { id: "sora",            name: "Sora",               css: "Sora",              category: "modern",   googleName: "Sora" },
  { id: "space-grotesk",   name: "Space Grotesk",      css: "Space Grotesk",     category: "modern",   googleName: "Space+Grotesk" },
  { id: "geist",           name: "Geist",              css: "Geist",             category: "modern",   googleName: "Geist" },
  // ── Display / Expressive ──────────────────────────────────────────
  { id: "playfair",        name: "Playfair Display",   css: "Playfair Display",  category: "display",  googleName: "Playfair+Display" },
  { id: "raleway",         name: "Raleway",            css: "Raleway",           category: "display",  googleName: "Raleway" },
  { id: "instrument",      name: "Instrument Serif",   css: "Instrument Serif",  category: "display",  googleName: "Instrument+Serif" },
  { id: "unbounded",       name: "Unbounded",          css: "Unbounded",         category: "display",  googleName: "Unbounded" },
  { id: "montserrat",      name: "Montserrat",         css: "Montserrat",        category: "display",  googleName: "Montserrat" },
  { id: "poppins",         name: "Poppins",            css: "Poppins",           category: "display",  googleName: "Poppins" },
  // ── Multilingual / Script ─────────────────────────────────────────
  { id: "noto-sans",       name: "Noto Sans",          css: "Noto Sans",         category: "multilingual", googleName: "Noto+Sans" },
  { id: "noto-arabic",     name: "Noto Kufi Arabic",   css: "Noto Kufi Arabic",  category: "multilingual", googleName: "Noto+Kufi+Arabic",     script: "arabic" },
  { id: "cairo",           name: "Cairo (Arabic)",     css: "Cairo",             category: "multilingual", googleName: "Cairo",                script: "arabic" },
  { id: "noto-jp",         name: "Noto Sans JP",       css: "Noto Sans JP",      category: "multilingual", googleName: "Noto+Sans+JP",          script: "japanese" },
  { id: "noto-kr",         name: "Noto Sans KR",       css: "Noto Sans KR",      category: "multilingual", googleName: "Noto+Sans+KR",          script: "korean" },
  { id: "noto-sc",         name: "Noto Sans SC",       css: "Noto Sans SC",      category: "multilingual", googleName: "Noto+Sans+SC",          script: "chinese" },
  { id: "noto-devanagari", name: "Noto Sans (Hindi)",  css: "Noto Sans Devanagari", category: "multilingual", googleName: "Noto+Sans+Devanagari", script: "devanagari" },
];

export type LanguageOption = { code: string; name: string; nativeName: string; fontId?: string };

export const TRANSLATE_LANGUAGES: LanguageOption[] = [
  { code: "es",    name: "Spanish",             nativeName: "Español" },
  { code: "fr",    name: "French",              nativeName: "Français" },
  { code: "de",    name: "German",              nativeName: "Deutsch" },
  { code: "it",    name: "Italian",             nativeName: "Italiano" },
  { code: "pt",    name: "Portuguese",          nativeName: "Português" },
  { code: "nl",    name: "Dutch",               nativeName: "Nederlands" },
  { code: "ru",    name: "Russian",             nativeName: "Русский" },
  { code: "pl",    name: "Polish",              nativeName: "Polski" },
  { code: "sv",    name: "Swedish",             nativeName: "Svenska" },
  { code: "tr",    name: "Turkish",             nativeName: "Türkçe" },
  { code: "ja",    name: "Japanese",            nativeName: "日本語",   fontId: "noto-jp" },
  { code: "ko",    name: "Korean",              nativeName: "한국어",   fontId: "noto-kr" },
  { code: "zh",    name: "Chinese (Simplified)",nativeName: "简体中文", fontId: "noto-sc" },
  { code: "zh-TW", name: "Chinese (Traditional)",nativeName: "繁體中文",fontId: "noto-sc" },
  { code: "hi",    name: "Hindi",               nativeName: "हिन्दी",  fontId: "noto-devanagari" },
  { code: "ar",    name: "Arabic",              nativeName: "العربية",  fontId: "noto-arabic" },
  { code: "id",    name: "Indonesian",          nativeName: "Bahasa Indonesia" },
  { code: "th",    name: "Thai",                nativeName: "ภาษาไทย" },
  { code: "vi",    name: "Vietnamese",          nativeName: "Tiếng Việt" },
  { code: "da",    name: "Danish",              nativeName: "Dansk" },
];

export const DEVICE_LABEL: Record<Device, string> = {
  iphone: "iPhone",
  ipad: "iPad",
  android: "Android Phone",
  "android-7": 'Android 7" Tablet',
  "android-10": 'Android 10" Tablet',
  "feature-graphic": "Feature Graphic",
};

// Friendly labels for slide layouts (used in dropdowns)
export const LAYOUT_LABEL: Record<SlideLayout, string> = {
  hero: "Hero",
  "device-bottom": "Device bottom",
  "device-top": "Device top",
  "two-devices": "Two devices",
  "no-device": "No device",
  "split-landscape": "Split (landscape)",
  "feature-graphic": "Feature graphic",
};

// Short description shown under each layout name
export const LAYOUT_HINT: Record<SlideLayout, string> = {
  hero: "Headline above, device at bottom",
  "device-bottom": "Headline top, device anchored below",
  "device-top": "Flipped — device on top",
  "two-devices": "Layered back + front phones",
  "no-device": "Big standalone headline",
  "split-landscape": "Caption left, device right",
  "feature-graphic": "1024×500 Play Store banner",
};

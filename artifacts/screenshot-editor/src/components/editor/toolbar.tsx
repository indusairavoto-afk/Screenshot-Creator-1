"use client";
import * as React from "react";
import {
  AlertTriangle, Check, Cloud, Crosshair, Download,
  Image as ImageIcon, Languages, Loader2, Palette, RotateCcw, ScanSearch, Type, Trash2, ZoomIn,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  COMBINATIONS, DEVICE_LABEL, FONT_OPTIONS, LAYOUT_LABEL, PATTERN_LABEL, THEMES, TRANSLATE_LANGUAGES, supportsLandscape,
} from "@/lib/constants";
import { detectPlatform } from "@/lib/defaults";
import { pickText, writeLocalized } from "@/lib/locale";
import type { Callout, Device, Orientation, PatternId, Slide, SlideLayout, Theme, ThemeId } from "@/lib/types";
import { ScreenshotPicker } from "./screenshot-picker";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

// ─── types ───────────────────────────────────────────────────────────────────

type Panel = "style" | "content" | "media" | "callouts" | "translate" | null;

type Props = {
  // device / export controls
  appName: string;
  setAppName: (v: string) => void;
  locale: string;
  setLocale: (v: string) => void;
  locales: string[];
  device: Device;
  setDevice: (v: Device) => void;
  orientation: Orientation;
  setOrientation: (v: Orientation) => void;
  onExport: () => void;
  onResetAll: () => void;
  onResetDevice: () => void;
  exporting: string | null;
  savedAt: number | null;
  saveError: string | null;
  busy: boolean;
  // slide editing (optional — toolbar works without a slide)
  slide: Slide | null;
  theme: Theme;
  themeId: ThemeId;
  setThemeId: (v: ThemeId) => void;
  onSlideChange: (patch: Partial<Slide>) => void;
  calloutMode: boolean;
  setCalloutMode: (v: boolean) => void;
  selectedCalloutId: string | null;
  onSelectCallout: (id: string | null) => void;
  onDeleteCallout: (id: string) => void;
  onUpdateCallout: (c: Callout) => void;
  fontFamily?: string;
  onFontChange: (v: string) => void;
  onTranslate: (langCode: string, langName: string) => Promise<void>;
  onLocaleAdd: (code: string) => void;
};

// ─── main component ───────────────────────────────────────────────────────────

export function Toolbar(props: Props) {
  const platform = detectPlatform(props.device);
  const hasLandscape = supportsLandscape(props.device);
  const [openPanel, setOpenPanel] = React.useState<Panel>(null);
  const [resetOpen, setResetOpen] = React.useState(false);
  const barRef = React.useRef<HTMLDivElement>(null);

  const lastByPlatform = React.useRef<{ ios: Device; android: Device }>({
    ios: platform === "ios" ? props.device : "iphone",
    android: platform === "android" ? props.device : "android",
  });
  React.useEffect(() => { lastByPlatform.current[platform] = props.device; }, [platform, props.device]);

  // Close panel on outside click
  React.useEffect(() => {
    if (!openPanel) return;
    function onDown(e: MouseEvent) {
      if (barRef.current && !barRef.current.contains(e.target as Node)) {
        setOpenPanel(null);
      }
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [openPanel]);

  function toggle(p: Panel) { setOpenPanel((cur) => (cur === p ? null : p)); }

  const showLocale = props.locales.length > 1;
  const deviceLabel = DEVICE_LABEL[props.device];
  const { slide } = props;

  return (
    <>
      {/* ── Floating pill bar ──────────────────────────────────────── */}
      <div className="pointer-events-none fixed bottom-5 left-0 right-0 z-50 flex justify-center">
        <div ref={barRef} className="pointer-events-auto relative">

          {/* ── Panel popover — floats above bar ───────────────────── */}
          {openPanel && slide && openPanel !== "translate" && (
            <Panel
              which={openPanel}
              slide={slide}
              locale={props.locale}
              theme={props.theme}
              themeId={props.themeId}
              setThemeId={props.setThemeId}
              onSlideChange={props.onSlideChange}
              calloutMode={props.calloutMode}
              setCalloutMode={props.setCalloutMode}
              selectedCalloutId={props.selectedCalloutId}
              onSelectCallout={props.onSelectCallout}
              onDeleteCallout={props.onDeleteCallout}
              onUpdateCallout={props.onUpdateCallout}
              fontFamily={props.fontFamily}
              onFontChange={props.onFontChange}
              appName={props.appName}
            />
          )}
          {openPanel === "translate" && (
            <TranslatePanel
              onTranslate={props.onTranslate}
              onLocaleAdd={props.onLocaleAdd}
              onClose={() => setOpenPanel(null)}
            />
          )}

          {/* ── Bottom pill ─────────────────────────────────────────── */}
          <div className="flex items-center gap-1 rounded-2xl border border-border/50 bg-card/90 px-2.5 py-1.5 shadow-2xl shadow-black/20 backdrop-blur-xl">

            {/* App name */}
            <Input
              value={props.appName}
              onChange={(e) => props.setAppName(e.target.value)}
              className="h-7 w-28 border-none bg-transparent text-[13px] font-semibold shadow-none focus-visible:bg-muted/50 focus-visible:ring-0"
              placeholder="App name"
              aria-label="App name"
              disabled={props.busy}
            />

            <Pip />

            {/* Slide setting panels */}
            <PanelButton icon={<Palette className="h-3.5 w-3.5" />} label="Style"    active={openPanel === "style"}    disabled={!slide} onClick={() => toggle("style")} />
            <PanelButton icon={<Type className="h-3.5 w-3.5" />}    label="Content"  active={openPanel === "content"}  disabled={!slide} onClick={() => toggle("content")} />
            <PanelButton icon={<ImageIcon className="h-3.5 w-3.5" />} label="Media"  active={openPanel === "media"}    disabled={!slide} onClick={() => toggle("media")} />
            <PanelButton icon={<ScanSearch className="h-3.5 w-3.5" />} label="Callouts" active={openPanel === "callouts" || props.calloutMode} disabled={!slide} onClick={() => toggle("callouts")} accent={props.calloutMode} />
            <PanelButton icon={<Languages className="h-3.5 w-3.5" />} label="Translate" active={openPanel === "translate"} onClick={() => toggle("translate")} />

            <Pip />

            {/* Platform + device */}
            <Tabs value={platform} onValueChange={(p) => {
              if (props.busy) return;
              props.setDevice(p === "ios" ? lastByPlatform.current.ios : lastByPlatform.current.android);
            }}>
              <TabsList className="h-7 p-0.5">
                <TabsTrigger value="ios" className="h-6 px-2.5 text-[11px]" disabled={props.busy}>iOS</TabsTrigger>
                <TabsTrigger value="android" className="h-6 px-2.5 text-[11px]" disabled={props.busy}>Android</TabsTrigger>
              </TabsList>
            </Tabs>

            <Select value={props.device} onValueChange={(v) => props.setDevice(v as Device)} disabled={props.busy}>
              <SelectTrigger className="h-7 w-36 border-none bg-transparent text-[11px] shadow-none focus:ring-0">
                <SelectValue>{deviceLabel}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {platform === "ios" ? (
                  <>
                    <SelectItem value="iphone">{DEVICE_LABEL.iphone}</SelectItem>
                    <SelectItem value="ipad">{DEVICE_LABEL.ipad}</SelectItem>
                  </>
                ) : (
                  <>
                    <SelectItem value="android">{DEVICE_LABEL.android}</SelectItem>
                    <SelectItem value="android-7">{DEVICE_LABEL["android-7"]}</SelectItem>
                    <SelectItem value="android-10">{DEVICE_LABEL["android-10"]}</SelectItem>
                    <SelectItem value="feature-graphic">{DEVICE_LABEL["feature-graphic"]}</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>

            {hasLandscape && (
              <Select value={props.orientation} onValueChange={(v) => props.setOrientation(v as Orientation)} disabled={props.busy}>
                <SelectTrigger className="h-7 w-24 border-none bg-transparent text-[11px] shadow-none focus:ring-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="portrait">Portrait</SelectItem>
                  <SelectItem value="landscape">Landscape</SelectItem>
                </SelectContent>
              </Select>
            )}

            {showLocale && (
              <Select value={props.locale} onValueChange={props.setLocale} disabled={props.busy}>
                <SelectTrigger className="h-7 w-16 border-none bg-transparent text-[11px] shadow-none focus:ring-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {props.locales.map((l) => (
                    <SelectItem key={l} value={l}>{l.toUpperCase()}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <Pip />

            {/* Actions */}
            <SaveStatus savedAt={props.savedAt} saveError={props.saveError} />
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setResetOpen(true)} title="Reset" disabled={props.busy}>
              <RotateCcw className="h-3.5 w-3.5" />
            </Button>
            <Button onClick={props.onExport} disabled={!!props.exporting || props.busy} size="sm" className="h-7 gap-1.5 rounded-xl px-3 text-[11px] font-semibold">
              <Download className="h-3 w-3" />
              {props.exporting ? "Exporting…" : "Export"}
            </Button>
          </div>
        </div>
      </div>

      {/* Reset dialog */}
      <Dialog open={resetOpen} onOpenChange={setResetOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reset to defaults?</DialogTitle>
            <DialogDescription>
              Choose whether to reset just <span className="font-medium">{deviceLabel}</span> or every device. Your edits will be lost.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setResetOpen(false)}>Cancel</Button>
            <Button variant="outline" size="sm" onClick={() => { setResetOpen(false); props.onResetDevice(); }}>
              Reset {deviceLabel} only
            </Button>
            <Button variant="destructive" size="sm" onClick={() => { setResetOpen(false); props.onResetAll(); }}>
              Reset all devices
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ─── TranslatePanel ───────────────────────────────────────────────────────────

function TranslatePanel({
  onTranslate,
  onLocaleAdd,
  onClose,
}: {
  onTranslate: (code: string, name: string) => Promise<void>;
  onLocaleAdd: (code: string) => void;
  onClose: () => void;
}) {
  const [selected, setSelected] = React.useState<string | null>(null);
  const [translating, setTranslating] = React.useState(false);
  const [done, setDone] = React.useState<string | null>(null);

  async function handleTranslate() {
    if (!selected) return;
    const lang = TRANSLATE_LANGUAGES.find((l) => l.code === selected);
    if (!lang) return;
    setTranslating(true);
    setDone(null);
    try {
      await onTranslate(lang.code, lang.name);
      onLocaleAdd(lang.code);
      setDone(lang.name);
      onClose();
    } catch {
      /* errors toasted in parent */
    } finally {
      setTranslating(false);
    }
  }

  return (
    <div className="absolute bottom-[calc(100%+10px)] left-1/2 -translate-x-1/2 w-96 max-h-[75vh] overflow-y-auto rounded-2xl border border-border/50 bg-card/95 shadow-2xl shadow-black/25 backdrop-blur-xl">
      <div className="space-y-3 p-4">
        <PanelTitle>Quick Translate</PanelTitle>
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          Translate all slide headlines &amp; labels into another language. Adds a new locale you can switch between.
        </p>

        <div className="grid grid-cols-2 gap-1.5">
          {TRANSLATE_LANGUAGES.map((lang) => {
            const active = selected === lang.code;
            return (
              <button
                key={lang.code}
                type="button"
                disabled={translating}
                onClick={() => setSelected(lang.code)}
                className="flex flex-col rounded-xl border px-2.5 py-2 text-left transition-all"
                style={{
                  borderColor: active ? "hsl(var(--primary))" : "hsl(var(--border))",
                  backgroundColor: active ? "hsl(var(--primary) / 0.1)" : "hsl(var(--card))",
                }}
              >
                <span className="text-[13px] font-semibold leading-tight" style={{ color: active ? "hsl(var(--primary))" : "hsl(var(--foreground))" }}>{lang.nativeName}</span>
                <span className="text-[10px] text-muted-foreground">{lang.name}</span>
              </button>
            );
          })}
        </div>

        <Button
          size="sm"
          className="w-full gap-2"
          disabled={!selected || translating}
          onClick={handleTranslate}
        >
          {translating ? (
            <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Translating all slides…</>
          ) : (
            <><Languages className="h-3.5 w-3.5" /> Translate all slides</>
          )}
        </Button>
        {done && (
          <p className="text-center text-[11px] text-emerald-600 font-semibold">✓ Translated to {done}!</p>
        )}
      </div>
    </div>
  );
}

// ─── Panel (floating card above bar) ─────────────────────────────────────────

function Panel({
  which, slide, locale, theme, themeId, setThemeId, onSlideChange,
  calloutMode, setCalloutMode, selectedCalloutId, onSelectCallout, onDeleteCallout, onUpdateCallout,
  fontFamily, onFontChange, appName,
}: {
  which: NonNullable<Panel>;
  slide: Slide;
  locale: string;
  theme: Theme;
  themeId: ThemeId;
  setThemeId: (v: ThemeId) => void;
  onSlideChange: (patch: Partial<Slide>) => void;
  calloutMode: boolean;
  setCalloutMode: (v: boolean) => void;
  selectedCalloutId: string | null;
  onSelectCallout: (id: string | null) => void;
  onDeleteCallout: (id: string) => void;
  onUpdateCallout: (c: Callout) => void;
  fontFamily?: string;
  onFontChange: (v: string) => void;
  appName?: string;
}) {
  const [suggesting, setSuggesting] = React.useState(false);
  const [suggestions, setSuggestions] = React.useState<string[]>([]);
  const activePattern = slide.pattern ?? "none";
  const activeIntensity = slide.patternIntensity ?? 40;
  const localeLabel = slide.label?.[locale] ?? "";
  const localeHeadline = slide.headline?.[locale] ?? "";
  const callouts = slide.callouts || [];
  const isFeatureGraphic = slide.layout === "feature-graphic";
  const hasMedia = slide.layout !== "no-device" && slide.layout !== "feature-graphic";

  function setLocaleField(key: "label" | "headline", value: string) {
    onSlideChange({ [key]: writeLocalized(slide[key], locale, value) } as Partial<Slide>);
  }

  const headlineDefault = pickText(slide.headline, locale) || (isFeatureGraphic ? "Your tagline" : "Your headline\ngoes here.");
  const headlinePlaceholder = localeHeadline ? headlineDefault : headlineDefault;
  const labelDefault = pickText(slide.label, locale) || "FEATURE 01";

  return (
    <div className="absolute bottom-[calc(100%+10px)] left-1/2 -translate-x-1/2 w-80 max-h-[70vh] overflow-y-auto rounded-2xl border border-border/50 bg-card/95 shadow-2xl shadow-black/25 backdrop-blur-xl">

      {/* ── Style panel ──────────────────────────────── */}
      {which === "style" && (
        <div className="space-y-4 p-4">
          <PanelTitle>Style</PanelTitle>

          {/* Quick combos */}
          <div>
            <FieldLabel>Quick start</FieldLabel>
            <div className="flex gap-2 overflow-x-auto pb-1 pt-1" style={{ scrollbarWidth: "none" } as React.CSSProperties}>
              {COMBINATIONS.map((combo) => {
                const t = THEMES[combo.themeId];
                const isActive = themeId === combo.themeId && activePattern === combo.pattern && activeIntensity === combo.patternIntensity;
                return (
                  <button
                    key={combo.name}
                    type="button"
                    title={combo.description}
                    onClick={() => { setThemeId(combo.themeId); onSlideChange({ pattern: combo.pattern as PatternId, patternIntensity: combo.patternIntensity }); }}
                    className="flex w-[68px] shrink-0 flex-col overflow-hidden rounded-xl transition-all"
                    style={{ boxShadow: isActive ? `0 0 0 2px ${t.accent}, 0 0 0 4px ${t.accent}28` : "0 0 0 1px hsl(var(--border))" }}
                  >
                    <span className="block h-8 w-full" style={{ background: `linear-gradient(120deg, ${t.bg} 0%,${t.bg} 42%,${t.accent} 42%,${t.accent} 68%,${t.bgAlt} 68%)` }} />
                    <span className="flex items-center gap-1 px-1.5 py-1" style={{ backgroundColor: isActive ? t.accent + "18" : "hsl(var(--card))" }}>
                      <span className="text-[10px]">{combo.emoji}</span>
                      <span className="truncate text-[9px] font-semibold" style={{ color: isActive ? t.accent : "hsl(var(--foreground))" }}>{combo.name}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Theme swatches */}
          <div>
            <FieldLabel>Theme</FieldLabel>
            <div className="grid grid-cols-5 gap-1.5 pt-1">
              {(Object.values(THEMES) as Theme[]).map((t) => {
                const active = themeId === t.id;
                return (
                  <button key={t.id} type="button" onClick={() => setThemeId(t.id)} title={t.name}
                    className="flex flex-col overflow-hidden rounded-lg transition-all"
                    style={{ boxShadow: active ? `0 0 0 2px ${t.accent}, 0 0 0 4px ${t.accent}28` : "0 0 0 1px hsl(var(--border))" }}>
                    <span className="block h-7 w-full" style={{ background: `linear-gradient(135deg, ${t.bg} 50%, ${t.accent} 50%)` }} />
                    <span className="block truncate px-0.5 pb-1 pt-0.5 text-center text-[8px] font-semibold leading-none"
                      style={{ backgroundColor: active ? t.accent + "18" : "hsl(var(--card))", color: active ? t.accent : "hsl(var(--muted-foreground))" }}>
                      {t.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Pattern */}
          <div>
            <FieldLabel>Pattern</FieldLabel>
            <div className="grid grid-cols-4 gap-1 pt-1">
              {Object.entries(PATTERN_LABEL).map(([id, label]) => {
                const active = activePattern === id;
                return (
                  <button key={id} type="button" onClick={() => onSlideChange({ pattern: id as PatternId })}
                    className="rounded-lg border py-1.5 text-center text-[10px] font-semibold transition-all"
                    style={active
                      ? { borderColor: theme.accent, backgroundColor: theme.accent + "20", color: theme.accent }
                      : { borderColor: "hsl(var(--border))", backgroundColor: "hsl(var(--card))", color: "hsl(var(--muted-foreground))" }}>
                    {label}
                  </button>
                );
              })}
            </div>
            {activePattern !== "none" && (
              <div className="mt-2 flex items-center gap-3 rounded-lg border border-border/60 bg-muted/30 px-3 py-2">
                <FieldLabel className="shrink-0">Intensity</FieldLabel>
                <input type="range" min={0} max={100} step={1} value={activeIntensity}
                  onChange={(e) => onSlideChange({ patternIntensity: Number(e.target.value) })}
                  className="flex-1" style={{ accentColor: theme.accent }} />
                <span className="w-7 text-right text-[10px] tabular-nums text-muted-foreground">{activeIntensity}%</span>
              </div>
            )}
          </div>

          {/* Inverted */}
          <button type="button" onClick={() => onSlideChange({ inverted: !slide.inverted })}
            className="flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-all"
            style={slide.inverted
              ? { borderColor: theme.accent, backgroundColor: theme.bgAlt, color: theme.fgAlt }
              : { borderColor: "hsl(var(--border))", backgroundColor: "hsl(var(--background))" }}>
            <span className="h-7 w-7 shrink-0 rounded-lg"
              style={{ background: slide.inverted ? `linear-gradient(135deg,${theme.bgAlt} 50%,${theme.accent} 50%)` : `linear-gradient(135deg,${theme.bg} 50%,${theme.accent} 50%)` }} />
            <span className="flex-1 text-xs font-semibold">{slide.inverted ? "Inverted" : "Normal"}</span>
            <span className="rounded-full px-2 py-0.5 text-[10px] font-bold"
              style={slide.inverted ? { backgroundColor: theme.accent + "33", color: theme.accent } : { backgroundColor: "hsl(var(--muted))", color: "hsl(var(--muted-foreground))" }}>
              {slide.inverted ? "on" : "off"}
            </span>
          </button>

          {/* Frame color */}
          <ToolbarFrameColorPicker
            value={slide.frameColor}
            onChange={(c) => onSlideChange({ frameColor: c })}
            accent={theme.accent}
          />

          {/* Custom background gradient */}
          <div>
            <div className="flex items-center justify-between">
              <FieldLabel>Background Gradient</FieldLabel>
              <button
                type="button"
                onClick={() => {
                  if (slide.gradient) {
                    onSlideChange({ gradient: undefined });
                  } else {
                    onSlideChange({ gradient: { color1: theme.bg, color2: theme.accent, angle: 135 } });
                  }
                }}
                className="rounded-md px-2 py-0.5 text-[10px] font-semibold transition-all"
                style={slide.gradient
                  ? { background: theme.accent + "22", color: theme.accent }
                  : { background: "hsl(var(--muted))", color: "hsl(var(--muted-foreground))" }}>
                {slide.gradient ? "Reset to theme" : "Customize"}
              </button>
            </div>

            {slide.gradient && (
              <div className="mt-2 space-y-3">
                {/* Live preview */}
                <div
                  className="h-10 w-full rounded-xl border border-border/40"
                  style={{ background: `linear-gradient(${slide.gradient.angle}deg, ${slide.gradient.color1} 0%, ${slide.gradient.color2} 100%)` }}
                />

                {/* Color pickers */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <p className="text-[10px] text-muted-foreground">Color 1</p>
                    <label className="flex h-9 cursor-pointer items-center gap-2 rounded-lg border border-border/60 bg-muted/30 px-2 transition-all hover:bg-muted/60">
                      <input
                        type="color"
                        value={slide.gradient.color1}
                        onChange={(e) => onSlideChange({ gradient: { ...slide.gradient!, color1: e.target.value } })}
                        className="h-5 w-5 cursor-pointer rounded border-0 bg-transparent p-0"
                      />
                      <span className="font-mono text-[10px] uppercase">{slide.gradient.color1}</span>
                    </label>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-muted-foreground">Color 2</p>
                    <label className="flex h-9 cursor-pointer items-center gap-2 rounded-lg border border-border/60 bg-muted/30 px-2 transition-all hover:bg-muted/60">
                      <input
                        type="color"
                        value={slide.gradient.color2}
                        onChange={(e) => onSlideChange({ gradient: { ...slide.gradient!, color2: e.target.value } })}
                        className="h-5 w-5 cursor-pointer rounded border-0 bg-transparent p-0"
                      />
                      <span className="font-mono text-[10px] uppercase">{slide.gradient.color2}</span>
                    </label>
                  </div>
                </div>

                {/* Angle */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] text-muted-foreground">Angle</p>
                    <span className="tabular-nums text-[10px] font-semibold">{slide.gradient.angle}°</span>
                  </div>
                  <input
                    type="range" min={0} max={360} step={1}
                    value={slide.gradient.angle}
                    onChange={(e) => onSlideChange({ gradient: { ...slide.gradient!, angle: Number(e.target.value) } })}
                    className="w-full"
                    style={{ accentColor: theme.accent }}
                  />
                  {/* Preset angle buttons */}
                  <div className="grid grid-cols-6 gap-1">
                    {[0, 45, 90, 135, 180, 225].map((a) => {
                      const active = slide.gradient!.angle === a;
                      return (
                        <button key={a} type="button"
                          onClick={() => onSlideChange({ gradient: { ...slide.gradient!, angle: a } })}
                          className="rounded-lg border py-1 text-center text-[9px] font-bold transition-all"
                          style={active
                            ? { borderColor: theme.accent, backgroundColor: theme.accent + "20", color: theme.accent }
                            : { borderColor: "hsl(var(--border))", color: "hsl(var(--muted-foreground))" }}>
                          {a}°
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Quick presets */}
                <div>
                  <p className="mb-1.5 text-[10px] text-muted-foreground">Presets</p>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[
                      { c1: "#0f0c29", c2: "#302b63", a: 135, label: "Cosmos" },
                      { c1: "#f7971e", c2: "#ffd200", a: 135, label: "Sunrise" },
                      { c1: "#11998e", c2: "#38ef7d", a: 135, label: "Mint" },
                      { c1: "#fc4a1a", c2: "#f7b733", a: 135, label: "Fire" },
                      { c1: "#4776e6", c2: "#8e54e9", a: 135, label: "Violet" },
                      { c1: "#f953c6", c2: "#b91d73", a: 135, label: "Candy" },
                      { c1: "#43cea2", c2: "#185a9d", a: 160, label: "Ocean" },
                      { c1: "#1a1a2e", c2: "#16213e", a: 180, label: "Midnight" },
                    ].map(({ c1, c2, a, label }) => (
                      <button
                        key={label}
                        type="button"
                        title={label}
                        onClick={() => onSlideChange({ gradient: { color1: c1, color2: c2, angle: a } })}
                        className="flex flex-col overflow-hidden rounded-lg border border-border/40 transition-all hover:scale-105"
                      >
                        <span className="block h-7 w-full" style={{ background: `linear-gradient(${a}deg, ${c1}, ${c2})` }} />
                        <span className="block truncate px-0.5 pb-1 pt-0.5 text-center text-[8px] font-semibold text-muted-foreground">{label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Font family - categorized */}
          <div className="space-y-3">
            <FieldLabel>Font</FieldLabel>
            {(["modern", "display", "multilingual"] as const).map((cat) => {
              const catLabel = cat === "modern" ? "Modern / Clean" : cat === "display" ? "Display / Expressive" : "Multilingual / Script";
              const fonts = FONT_OPTIONS.filter((f) => f.category === cat);
              return (
                <div key={cat}>
                  <p className="mb-1 text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60">{catLabel}</p>
                  <div className="grid grid-cols-2 gap-1">
                    {fonts.map((f) => {
                      const active = (fontFamily || "Inter") === f.css;
                      return (
                        <button key={f.id} type="button"
                          onClick={() => onFontChange(f.css)}
                          className="truncate rounded-lg border px-2 py-1.5 text-left text-[11px] font-semibold transition-all"
                          style={{
                            fontFamily: f.css,
                            borderColor: active ? theme.accent : "hsl(var(--border))",
                            backgroundColor: active ? theme.accent + "20" : "hsl(var(--card))",
                            color: active ? theme.accent : "hsl(var(--foreground))",
                          }}>
                          {f.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Content panel ────────────────────────────── */}
      {which === "content" && (
        <div className="space-y-3 p-4">
          <PanelTitle>Content</PanelTitle>

          <div className="space-y-1.5">
            <FieldLabel>Layout</FieldLabel>
            <Select value={slide.layout} onValueChange={(layout) => {
              const next = layout as SlideLayout;
              onSlideChange({ layout: next, transforms: undefined, screenshotSecondary: next === "two-devices" ? slide.screenshotSecondary || slide.screenshot : undefined });
            }}>
              <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(LAYOUT_LABEL).map(([l, label]) => (
                  <SelectItem key={l} value={l} className="text-xs">{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {!isFeatureGraphic && (
            <div className="space-y-1.5">
              <FieldLabel>Label</FieldLabel>
              <Input value={localeLabel} onChange={(e) => setLocaleField("label", e.target.value)} placeholder={labelDefault} className="h-8 text-xs" />
            </div>
          )}

          <div className="space-y-1.5">
            <div className="flex items-baseline justify-between">
              <FieldLabel>{isFeatureGraphic ? "Tagline" : "Headline"}</FieldLabel>
              <span className="text-[9px] text-muted-foreground/60">newline = break</span>
            </div>
            <Textarea value={localeHeadline} onChange={(e) => setLocaleField("headline", e.target.value)}
              rows={3} placeholder={headlinePlaceholder} className="resize-none text-xs" />
          </div>

          {/* AI headline suggestions */}
          <div className="space-y-1.5">
            <button
              type="button"
              disabled={suggesting}
              onClick={async () => {
                setSuggesting(true);
                setSuggestions([]);
                try {
                  const resp = await fetch("/api/suggest", {
                    method: "POST",
                    headers: { "content-type": "application/json" },
                    body: JSON.stringify({
                      appName: appName || "My App",
                      layout: slide.layout,
                      label: localeLabel,
                    }),
                  });
                  const json = (await resp.json()) as { ok: boolean; suggestions?: string[] };
                  if (json.ok && json.suggestions) setSuggestions(json.suggestions);
                } catch {
                  /* ignore */
                } finally {
                  setSuggesting(false);
                }
              }}
              className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-border/60 bg-muted/30 py-1.5 text-[11px] font-semibold transition-all hover:bg-muted/60 disabled:opacity-50"
              style={{ color: theme.accent }}
            >
              {suggesting ? (
                <><span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" /> Generating…</>
              ) : (
                <>✨ Suggest headlines</>
              )}
            </button>
            {suggestions.length > 0 && (
              <div className="space-y-1">
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => { setLocaleField("headline", s); setSuggestions([]); }}
                    className="w-full rounded-lg border border-border/60 bg-card px-3 py-2 text-left text-[11px] leading-snug transition-all hover:border-primary/50 hover:bg-muted/50"
                  >
                    {s.replace(/\\n/g, " · ")}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Media panel ──────────────────────────────── */}
      {which === "media" && (
        <div className="space-y-3 p-4">
          <PanelTitle>Media</PanelTitle>
          {hasMedia ? (
            <>
              <div className="space-y-1.5">
                <FieldLabel>{slide.layout === "two-devices" ? "Front screenshot" : "Screenshot"}</FieldLabel>
                <ScreenshotPicker label="Primary" value={slide.screenshot} onChange={(v) => onSlideChange({ screenshot: v })} />
              </div>
              {slide.layout === "two-devices" && (
                <div className="space-y-1.5">
                  <FieldLabel>Back screenshot</FieldLabel>
                  <ScreenshotPicker label="Secondary (back layer)" value={slide.screenshotSecondary || ""} onChange={(v) => onSlideChange({ screenshotSecondary: v })} />
                </div>
              )}
            </>
          ) : (
            <p className="rounded-xl border bg-muted/40 p-3 text-[11px] leading-relaxed text-muted-foreground">
              This layout doesn't use a screenshot.
            </p>
          )}
        </div>
      )}

      {/* ── Callouts panel ───────────────────────────── */}
      {which === "callouts" && (
        <div className="space-y-3 p-4">
          <PanelTitle>Callouts</PanelTitle>

          {/* Mode toggle */}
          <button type="button" onClick={() => setCalloutMode(!calloutMode)}
            className="flex w-full items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left text-xs font-semibold transition-all"
            style={calloutMode
              ? { borderColor: theme.accent, backgroundColor: theme.accent + "18", color: theme.accent }
              : { borderColor: "hsl(var(--border))", backgroundColor: "hsl(var(--card))", color: "hsl(var(--foreground))" }}>
            <Crosshair className="h-4 w-4 shrink-0" />
            <span className="flex-1">{calloutMode ? "Drawing — drag on canvas" : "Draw Callout"}</span>
            {calloutMode && (
              <span className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                style={{ backgroundColor: theme.accent + "33", color: theme.accent }}>active</span>
            )}
          </button>

          {calloutMode && (
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              Drag over any region of the canvas to create a magnified callout bubble.
            </p>
          )}

          {/* Callout list */}
          {callouts.length > 0 ? (
            <div className="space-y-2">
              {callouts.map((c, i) => {
                const isSel = c.id === selectedCalloutId;
                return (
                  <div key={c.id} className="rounded-xl border transition-all"
                    style={isSel
                      ? { borderColor: theme.accent, backgroundColor: theme.accent + "10" }
                      : { borderColor: "hsl(var(--border))", backgroundColor: "hsl(var(--card))" }}>
                    <div role="button" tabIndex={0}
                      onClick={() => onSelectCallout(isSel ? null : c.id)}
                      onKeyDown={(e) => e.key === "Enter" && onSelectCallout(isSel ? null : c.id)}
                      className="flex w-full cursor-pointer items-center gap-2 px-3 py-2">
                      <ZoomIn className="h-3.5 w-3.5 shrink-0" style={{ color: isSel ? theme.accent : "hsl(var(--muted-foreground))" }} />
                      <span className="flex-1 text-left text-[11px] font-semibold" style={{ color: isSel ? theme.accent : "hsl(var(--foreground))" }}>
                        Callout {i + 1}
                      </span>
                      <span className="text-[10px] tabular-nums text-muted-foreground">{c.zoom}×</span>
                      <button type="button" onClick={(e) => { e.stopPropagation(); onDeleteCallout(c.id); }}
                        className="ml-1 rounded p-0.5 text-muted-foreground/60 transition-colors hover:bg-destructive/10 hover:text-destructive">
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                    {isSel && (
                      <div className="border-t px-3 pb-3 pt-2">
                        <div className="flex items-center gap-3">
                          <Label className="shrink-0 text-[10px] text-muted-foreground">Zoom</Label>
                          <input type="range" min={1} max={6} step={0.5} value={c.zoom}
                            onChange={(e) => onUpdateCallout({ ...c, zoom: Number(e.target.value) })}
                            className="flex-1" style={{ accentColor: theme.accent }} />
                          <span className="w-7 text-right text-[10px] tabular-nums text-muted-foreground">{c.zoom}×</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            !calloutMode && (
              <p className="text-center text-[11px] text-muted-foreground">No callouts yet. Click "Draw Callout" then drag over the canvas.</p>
            )
          )}
        </div>
      )}
    </div>
  );
}

// ─── Small helpers ────────────────────────────────────────────────────────────

function PanelTitle({ children }: { children: React.ReactNode }) {
  return <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">{children}</p>;
}

function FieldLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  return <Label className={`text-[10px] text-muted-foreground ${className ?? ""}`}>{children}</Label>;
}

function PanelButton({ icon, label, active, disabled, onClick, accent }: {
  icon: React.ReactNode; label: string; active: boolean; disabled?: boolean; onClick: () => void; accent?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      className="flex h-7 items-center gap-1.5 rounded-lg px-2.5 text-[11px] font-medium transition-all disabled:opacity-40"
      style={active || accent
        ? { backgroundColor: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }
        : { color: "hsl(var(--foreground))" }}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

function Pip() {
  return <span aria-hidden className="mx-0.5 h-4 w-px shrink-0 rounded-full bg-border/70" />;
}

function SaveStatus({ savedAt, saveError }: { savedAt: number | null; saveError: string | null }) {
  const [, setTick] = React.useState(0);
  React.useEffect(() => {
    const t = setInterval(() => setTick((x) => x + 1), 60_000);
    return () => clearInterval(t);
  }, []);
  if (saveError) return <span className="flex items-center text-[11px] text-destructive" title={saveError}><AlertTriangle className="h-3 w-3" /></span>;
  if (!savedAt) return <span className="text-muted-foreground"><Cloud className="h-3 w-3" /></span>;
  const seconds = Math.max(0, Math.round((Date.now() - savedAt) / 1000));
  return <span className="text-muted-foreground" title={`Saved ${seconds}s ago`}><Check className={`h-3 w-3 ${seconds < 5 ? "text-green-500" : ""}`} /></span>;
}

const TOOLBAR_FRAME_PRESETS = [
  { label: "Default", color: undefined },
  { label: "Graphite", color: "#3d3d3f" },
  { label: "Silver", color: "#b8b8c0" },
  { label: "Starlight", color: "#e8e4db" },
  { label: "Midnight", color: "#1a1e2a" },
  { label: "Gold", color: "#c5a46e" },
  { label: "Rose Gold", color: "#c78b82" },
  { label: "Blue", color: "#2e5287" },
  { label: "Green", color: "#3d6b4a" },
  { label: "Purple", color: "#6e4f8c" },
  { label: "Red", color: "#8b2020" },
] as const;

function ToolbarFrameColorPicker({
  value,
  onChange,
  accent,
}: {
  value?: string;
  onChange: (color: string | undefined) => void;
  accent: string;
}) {
  const isDefault = !value;
  const colorInputRef = React.useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <FieldLabel>Frame color</FieldLabel>
        {!isDefault && (
          <button
            type="button"
            onClick={() => onChange(undefined)}
            className="text-[9px] text-muted-foreground/60 underline-offset-2 hover:text-muted-foreground hover:underline"
          >
            Reset
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {TOOLBAR_FRAME_PRESETS.map((preset) => {
          const isActive = preset.color === undefined ? isDefault : value === preset.color;
          return (
            <button
              key={preset.label}
              type="button"
              title={preset.label}
              onClick={() => onChange(preset.color)}
              aria-pressed={isActive}
              className="relative h-6 w-6 rounded-full transition-transform hover:scale-110 focus-visible:outline-none"
              style={{
                background: preset.color ?? "linear-gradient(135deg, #2a2a2e 50%, #b8b8c0 50%)",
                boxShadow: isActive
                  ? `0 0 0 2px hsl(var(--background)), 0 0 0 4px ${accent}`
                  : "0 0 0 1px hsl(var(--border))",
              }}
            >
              {preset.color === undefined && (
                <span className="absolute inset-0 flex items-center justify-center text-[8px] font-bold text-white/80 mix-blend-difference">
                  —
                </span>
              )}
            </button>
          );
        })}
        <button
          type="button"
          title="Custom color"
          onClick={() => colorInputRef.current?.click()}
          className="relative h-6 w-6 overflow-hidden rounded-full transition-transform hover:scale-110"
          style={{
            background: "conic-gradient(red, yellow, lime, aqua, blue, magenta, red)",
            boxShadow:
              value && !TOOLBAR_FRAME_PRESETS.some((p) => p.color === value)
                ? `0 0 0 2px hsl(var(--background)), 0 0 0 4px ${accent}`
                : "0 0 0 1px hsl(var(--border))",
          }}
        >
          <input
            ref={colorInputRef}
            type="color"
            value={value && value.startsWith("#") ? value : "#3d3d3f"}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            aria-label="Custom frame color"
          />
        </button>
      </div>
      {!isDefault && (
        <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-muted/30 px-2.5 py-1.5">
          <span className="h-4 w-4 shrink-0 rounded-full border border-white/10" style={{ background: value }} />
          <span className="flex-1 font-mono text-[10px] text-muted-foreground">{value}</span>
        </div>
      )}
    </div>
  );
}

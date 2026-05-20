"use client";
import * as React from "react";
import { ArrowDownToLine, ArrowUpToLine, ChevronDown, ChevronUp, Crosshair, RotateCw, Trash2, ZoomIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { COMBINATIONS, LAYOUT_HINT, LAYOUT_LABEL, PATTERN_LABEL, THEMES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { pickText, writeLocalized } from "@/lib/locale";
import type { Callout, ElementId, ElementTransform, PatternId, Slide, SlideLayout, Theme, ThemeId } from "@/lib/types";
import { ScreenshotPicker } from "./screenshot-picker";

type Props = {
  slide: Slide;
  locale: string;
  theme: Theme;
  themeId: ThemeId;
  setThemeId: (v: ThemeId) => void;
  selectedElementId: ElementId | null;
  onChange: (patch: Partial<Slide>) => void;
  calloutMode?: boolean;
  setCalloutMode?: (v: boolean) => void;
  selectedCalloutId?: string | null;
  onSelectCallout?: (id: string | null) => void;
  onDeleteCallout?: (id: string) => void;
  onUpdateCallout?: (c: Callout) => void;
};

const ELEMENT_LABEL: Record<ElementId, string> = {
  caption: "Headline",
  device: "Device",
  deviceSecondary: "Back device",
};

function SectionHeader({
  title,
  open,
  onToggle,
  hint,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  hint?: string;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex w-full items-center justify-between px-4 py-2.5 transition-colors hover:bg-muted/40"
    >
      <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
        {title}
      </span>
      <div className="flex items-center gap-2">
        {hint && !open && (
          <span className="text-[10px] text-muted-foreground">{hint}</span>
        )}
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 text-muted-foreground/60 transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </div>
    </button>
  );
}

export function Inspector({
  slide, locale, theme, themeId, setThemeId, selectedElementId, onChange,
  calloutMode, setCalloutMode, selectedCalloutId, onSelectCallout, onDeleteCallout, onUpdateCallout,
}: Props) {
  const isFeatureGraphic = slide.layout === "feature-graphic";
  const isNoDevice = slide.layout === "no-device";
  const localeLabel = slide.label?.[locale] ?? "";
  const localeHeadline = slide.headline?.[locale] ?? "";
  const headlineDefault = isFeatureGraphic ? "Your tagline." : "One idea\nper slide.";
  const labelPlaceholder = localeLabel ? "FEATURE 01" : pickText(slide.label, locale) || "FEATURE 01";
  const headlinePlaceholder = localeHeadline
    ? headlineDefault
    : pickText(slide.headline, locale) || headlineDefault;

  const [openAppearance, setOpenAppearance] = React.useState(true);
  const [openContent, setOpenContent] = React.useState(true);
  const [openMedia, setOpenMedia] = React.useState(true);
  const [openElements, setOpenElements] = React.useState(false);
  const [openCallouts, setOpenCallouts] = React.useState(true);

  const callouts = slide.callouts || [];
  const selectedCallout = callouts.find((c) => c.id === selectedCalloutId) ?? null;

  function setLocaleField(key: "label" | "headline", value: string) {
    onChange({ [key]: writeLocalized(slide[key], locale, value) } as Partial<Slide>);
  }

  const hasMedia = !isFeatureGraphic && !isNoDevice;
  const activePattern = slide.pattern ?? "none";
  const activeIntensity = slide.patternIntensity ?? 50;

  return (
    <div className="flex h-full flex-col bg-background">

      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex shrink-0 items-center justify-between border-b px-4 py-3">
        <div>
          <h2 className="text-[13px] font-semibold leading-none">Slide settings</h2>
          <p className="mt-1 text-[11px] leading-none text-muted-foreground">
            {LAYOUT_HINT[slide.layout]}
          </p>
        </div>
        <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {locale}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto">

        {/* ── Quick Start ─────────────────────────────────── */}
        <div className="border-b px-4 pb-3 pt-3">
          <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Quick Start
          </p>
          <div
            className="flex gap-2 overflow-x-auto pb-1"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" } as React.CSSProperties}
          >
            {COMBINATIONS.map((combo) => {
              const t = THEMES[combo.themeId];
              const isActive =
                themeId === combo.themeId &&
                activePattern === combo.pattern &&
                activeIntensity === combo.patternIntensity;
              return (
                <button
                  key={combo.name}
                  type="button"
                  title={combo.description}
                  aria-pressed={isActive}
                  onClick={() => {
                    setThemeId(combo.themeId);
                    onChange({ pattern: combo.pattern as PatternId, patternIntensity: combo.patternIntensity });
                  }}
                  className="flex w-[78px] shrink-0 flex-col overflow-hidden rounded-xl transition-all"
                  style={{
                    boxShadow: isActive
                      ? `0 0 0 2px ${t.accent}, 0 0 0 5px ${t.accent}28`
                      : "0 0 0 1px hsl(var(--border))",
                  }}
                >
                  <span
                    className="block h-9 w-full"
                    style={{
                      background: `linear-gradient(120deg, ${t.bg} 0%, ${t.bg} 42%, ${t.accent} 42%, ${t.accent} 68%, ${t.bgAlt} 68%)`,
                    }}
                  />
                  <span
                    className="flex items-center gap-1 px-1.5 py-1"
                    style={{ backgroundColor: isActive ? t.accent + "18" : "hsl(var(--card))" }}
                  >
                    <span className="text-[11px] leading-none">{combo.emoji}</span>
                    <span
                      className="truncate text-[9px] font-semibold leading-none"
                      style={{ color: isActive ? t.accent : "hsl(var(--foreground))" }}
                    >
                      {combo.name}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Appearance section ───────────────────────────── */}
        <SectionHeader
          title="Appearance"
          open={openAppearance}
          onToggle={() => setOpenAppearance((v) => !v)}
          hint="theme · pattern · scheme"
        />
        {openAppearance && (
          <div className="space-y-4 border-b px-4 pb-4 pt-1">

            {/* Theme — compact 5-col swatches */}
            <div className="space-y-1.5">
              <Label className="text-[10px] text-muted-foreground">Theme</Label>
              <div className="grid grid-cols-5 gap-1.5">
                {(Object.values(THEMES) as Theme[]).map((t) => {
                  const active = themeId === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setThemeId(t.id)}
                      aria-pressed={active}
                      title={t.name}
                      className="flex flex-col overflow-hidden rounded-lg transition-all"
                      style={{
                        boxShadow: active
                          ? `0 0 0 2px ${t.accent}, 0 0 0 4px ${t.accent}28`
                          : "0 0 0 1px hsl(var(--border))",
                      }}
                    >
                      <span
                        className="block h-7 w-full"
                        style={{
                          background: `linear-gradient(135deg, ${t.bg} 0%, ${t.bg} 50%, ${t.accent} 50%)`,
                        }}
                      />
                      <span
                        className="block truncate px-0.5 pb-1 pt-0.5 text-center text-[8px] font-semibold leading-none"
                        style={{
                          backgroundColor: active ? t.accent + "18" : "hsl(var(--card))",
                          color: active ? t.accent : "hsl(var(--muted-foreground))",
                        }}
                      >
                        {t.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Pattern — 3-col pill grid */}
            <div className="space-y-2">
              <Label className="text-[10px] text-muted-foreground">Pattern</Label>
              <div className="grid grid-cols-3 gap-1">
                {Object.entries(PATTERN_LABEL).map(([id, label]) => {
                  const active = activePattern === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => onChange({ pattern: id as PatternId })}
                      aria-pressed={active}
                      className="rounded-lg border py-1.5 text-center text-[10px] font-semibold transition-all"
                      style={
                        active
                          ? { borderColor: theme.accent, backgroundColor: theme.accent + "20", color: theme.accent }
                          : { borderColor: "hsl(var(--border))", backgroundColor: "hsl(var(--card))", color: "hsl(var(--muted-foreground))" }
                      }
                    >
                      {label}
                    </button>
                  );
                })}
              </div>

              {/* Intensity slider — only when a pattern is active */}
              {activePattern !== "none" && (
                <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-muted/30 px-3 py-2">
                  <Label className="shrink-0 text-[10px] text-muted-foreground">Intensity</Label>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={1}
                    value={activeIntensity}
                    onChange={(e) => onChange({ patternIntensity: Number(e.target.value) })}
                    className="flex-1"
                    style={{ accentColor: theme.accent }}
                    aria-label="Pattern intensity"
                  />
                  <span className="w-7 shrink-0 text-right text-[10px] tabular-nums text-muted-foreground">
                    {activeIntensity}%
                  </span>
                </div>
              )}
            </div>

            {/* Color scheme toggle */}
            <div className="space-y-1.5">
              <Label className="text-[10px] text-muted-foreground">Color scheme</Label>
              <button
                type="button"
                onClick={() => onChange({ inverted: !slide.inverted })}
                className="flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-all"
                style={
                  slide.inverted
                    ? { borderColor: theme.accent, backgroundColor: theme.bgAlt, color: theme.fgAlt }
                    : { borderColor: "hsl(var(--border))", backgroundColor: "hsl(var(--background))" }
                }
                aria-pressed={!!slide.inverted}
              >
                <span
                  className="h-8 w-8 shrink-0 rounded-lg border border-white/10 shadow-sm"
                  style={{
                    background: slide.inverted
                      ? `linear-gradient(135deg, ${theme.bgAlt} 50%, ${theme.accent} 50%)`
                      : `linear-gradient(135deg, ${theme.bg} 50%, ${theme.accent} 50%)`,
                  }}
                />
                <span className="min-w-0 flex-1">
                  <span className="block text-xs font-semibold leading-snug">
                    {slide.inverted ? "Inverted" : "Normal"}
                  </span>
                  <span
                    className="block text-[11px] leading-snug"
                    style={{ color: slide.inverted ? theme.fgAlt + "99" : "hsl(var(--muted-foreground))" }}
                  >
                    {slide.inverted ? "Alt background" : "Default background"}
                  </span>
                </span>
                <span
                  className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold"
                  style={
                    slide.inverted
                      ? { backgroundColor: theme.accent + "33", color: theme.accent }
                      : { backgroundColor: "hsl(var(--muted))", color: "hsl(var(--muted-foreground))" }
                  }
                >
                  {slide.inverted ? "on" : "off"}
                </span>
              </button>
            </div>

            {/* Frame color */}
            <FrameColorPicker
              value={slide.frameColor}
              onChange={(c) => onChange({ frameColor: c })}
              accent={theme.accent}
            />
          </div>
        )}

        {/* ── Content section ──────────────────────────────── */}
        <SectionHeader
          title="Content"
          open={openContent}
          onToggle={() => setOpenContent((v) => !v)}
          hint="layout · text"
        />
        {openContent && (
          <div className="space-y-3 border-b px-4 pb-4 pt-1">
            {/* Layout */}
            <div className="space-y-1.5">
              <Label className="text-[10px] text-muted-foreground">Layout</Label>
              <Select
                value={slide.layout}
                onValueChange={(layout) => {
                  const next = layout as SlideLayout;
                  onChange({
                    layout: next,
                    transforms: undefined,
                    screenshotSecondary:
                      next === "two-devices" ? slide.screenshotSecondary || slide.screenshot : undefined,
                  });
                }}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(LAYOUT_LABEL).map(([layout, label]) => (
                    <SelectItem key={layout} value={layout} className="text-xs">
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Label */}
            {!isFeatureGraphic && (
              <div className="space-y-1.5">
                <Label className="text-[10px] text-muted-foreground">Label</Label>
                <Input
                  value={localeLabel}
                  onChange={(e) => setLocaleField("label", e.target.value)}
                  placeholder={labelPlaceholder}
                  className="h-8 text-xs"
                />
              </div>
            )}

            {/* Headline */}
            <div className="space-y-1.5">
              <div className="flex items-baseline justify-between">
                <Label className="text-[10px] text-muted-foreground">
                  {isFeatureGraphic ? "Tagline" : "Headline"}
                </Label>
                <span className="text-[9px] text-muted-foreground/60">newline = break</span>
              </div>
              <Textarea
                value={localeHeadline}
                onChange={(e) => setLocaleField("headline", e.target.value)}
                rows={3}
                placeholder={headlinePlaceholder}
                className="resize-none text-xs"
              />
            </div>
          </div>
        )}

        {/* ── Media section ────────────────────────────────── */}
        {hasMedia && (
          <>
            <SectionHeader
              title="Media"
              open={openMedia}
              onToggle={() => setOpenMedia((v) => !v)}
              hint="screenshots"
            />
            {openMedia && (
              <div className="space-y-3 border-b px-4 pb-4 pt-1">
                <div className="space-y-1.5">
                  <Label className="text-[10px] text-muted-foreground">
                    {slide.layout === "two-devices" ? "Front screenshot" : "Screenshot"}
                  </Label>
                  <ScreenshotPicker
                    label="Primary"
                    value={slide.screenshot}
                    onChange={(v) => onChange({ screenshot: v })}
                  />
                </div>
                {slide.layout === "two-devices" && (
                  <div className="space-y-1.5">
                    <Label className="text-[10px] text-muted-foreground">Back screenshot</Label>
                    <ScreenshotPicker
                      label="Secondary (back layer)"
                      value={slide.screenshotSecondary || ""}
                      onChange={(v) => onChange({ screenshotSecondary: v })}
                    />
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* ── Elements section ─────────────────────────────── */}
        {!isFeatureGraphic && (
          <>
            <SectionHeader
              title="Elements"
              open={openElements}
              onToggle={() => setOpenElements((v) => !v)}
              hint="rotation · layers"
            />
            {openElements && (
              <div className="border-b px-4 pb-4 pt-1">
                <ElementTransformControls
                  slide={slide}
                  selectedElementId={selectedElementId}
                  onChange={onChange}
                />
              </div>
            )}
          </>
        )}

        {/* Feature-graphic note */}
        {isFeatureGraphic && (
          <div className="px-4 py-3">
            <p className="rounded-xl border bg-muted/40 p-3 text-[11px] leading-relaxed text-muted-foreground">
              Shows app icon + name + tagline. Drop an icon at{" "}
              <span className="rounded bg-background px-1 py-0.5 font-mono text-[10px] text-foreground">
                /public/app-icon.png
              </span>{" "}
              (or leave blank — the app initial will be used). Name is set in the toolbar.
            </p>
          </div>
        )}

        {/* ── Callouts section ─────────────────────────────── */}
        <>
          <SectionHeader
            title="Callouts"
            open={openCallouts}
            onToggle={() => setOpenCallouts((v) => !v)}
            hint={callouts.length > 0 ? `${callouts.length} callout${callouts.length === 1 ? "" : "s"}` : undefined}
          />
          {openCallouts && (
            <div className="space-y-3 border-b px-4 pb-4 pt-2">
              {/* Mode toggle */}
              <button
                type="button"
                onClick={() => setCalloutMode?.(!calloutMode)}
                className="flex w-full items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left text-xs font-semibold transition-all"
                style={
                  calloutMode
                    ? { borderColor: theme.accent, backgroundColor: theme.accent + "18", color: theme.accent }
                    : { borderColor: "hsl(var(--border))", backgroundColor: "hsl(var(--card))", color: "hsl(var(--foreground))" }
                }
                aria-pressed={calloutMode}
              >
                <Crosshair className="h-4 w-4 shrink-0" />
                <span className="flex-1">
                  {calloutMode ? "Drawing callout — drag to select area" : "Draw Callout"}
                </span>
                {calloutMode && (
                  <span
                    className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold"
                    style={{ backgroundColor: theme.accent + "33", color: theme.accent }}
                  >
                    active
                  </span>
                )}
              </button>

              {calloutMode && (
                <p className="text-[11px] leading-relaxed text-muted-foreground">
                  Click and drag on the canvas to mark a region. A magnified bubble will appear automatically.
                </p>
              )}

              {/* Callout list */}
              {callouts.length > 0 && (
                <div className="space-y-2">
                  {callouts.map((c, i) => {
                    const isSel = c.id === selectedCalloutId;
                    return (
                      <div
                        key={c.id}
                        className="rounded-xl border transition-all"
                        style={
                          isSel
                            ? { borderColor: theme.accent, backgroundColor: theme.accent + "10" }
                            : { borderColor: "hsl(var(--border))", backgroundColor: "hsl(var(--card))" }
                        }
                      >
                        {/* Row header — div to avoid nested-button HTML violation */}
                        <div
                          role="button"
                          tabIndex={0}
                          onClick={() => onSelectCallout?.(isSel ? null : c.id)}
                          onKeyDown={(e) => e.key === "Enter" && onSelectCallout?.(isSel ? null : c.id)}
                          className="flex w-full cursor-pointer items-center gap-2 px-3 py-2"
                        >
                          <ZoomIn
                            className="h-3.5 w-3.5 shrink-0"
                            style={{ color: isSel ? theme.accent : "hsl(var(--muted-foreground))" }}
                          />
                          <span className="flex-1 text-left text-[11px] font-semibold" style={{ color: isSel ? theme.accent : "hsl(var(--foreground))" }}>
                            Callout {i + 1}
                          </span>
                          <span className="text-[10px] tabular-nums text-muted-foreground">{c.zoom}×</span>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); onDeleteCallout?.(c.id); }}
                            className="ml-1 rounded p-0.5 text-muted-foreground/60 transition-colors hover:bg-destructive/10 hover:text-destructive"
                            aria-label="Delete callout"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>

                        {/* Zoom slider (expanded when selected) */}
                        {isSel && (
                          <div className="border-t px-3 pb-3 pt-2">
                            <div className="flex items-center gap-3">
                              <Label className="shrink-0 text-[10px] text-muted-foreground">Zoom</Label>
                              <input
                                type="range"
                                min={1}
                                max={6}
                                step={0.5}
                                value={c.zoom}
                                onChange={(e) =>
                                  onUpdateCallout?.({ ...c, zoom: Number(e.target.value) })
                                }
                                className="flex-1"
                                style={{ accentColor: theme.accent }}
                                aria-label="Callout magnification"
                              />
                              <span className="w-7 shrink-0 text-right text-[10px] tabular-nums text-muted-foreground">
                                {c.zoom}×
                              </span>
                            </div>
                            <div className="mt-2 grid grid-cols-3 gap-1 text-[10px] text-muted-foreground">
                              <span>Area: {c.width}×{c.height}px</span>
                              <span className="text-center">→</span>
                              <span className="text-right">{Math.round(c.width * c.zoom)}×{Math.round(c.height * c.zoom)}px</span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {callouts.length === 0 && !calloutMode && (
                <p className="text-center text-[11px] text-muted-foreground">
                  No callouts yet. Click "Draw Callout" and drag over any area to highlight it.
                </p>
              )}
            </div>
          )}
        </>

      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Helper components (unchanged)
// ─────────────────────────────────────────────────────────

function ElementTransformControls({
  slide,
  selectedElementId,
  onChange,
}: {
  slide: Slide;
  selectedElementId: ElementId | null;
  onChange: (patch: Partial<Slide>) => void;
}) {
  const present: ElementId[] = ["caption"];
  if (slide.layout !== "no-device") present.push("device");
  if (slide.layout === "two-devices") present.push("deviceSecondary");

  const transforms = slide.transforms || {};
  const activeId =
    selectedElementId && present.includes(selectedElementId) ? selectedElementId : null;

  function patchElement(id: ElementId, patch: Partial<ElementTransform>) {
    const cur = transforms[id];
    if (!cur) return;
    onChange({
      transforms: { ...transforms, [id]: { ...cur, ...patch } },
    });
  }

  function reorder(id: ElementId, dir: "front" | "back" | "up" | "down") {
    const ranked = [...present].sort((a, b) => {
      const za = transforms[a]?.zIndex ?? defaultZ(a);
      const zb = transforms[b]?.zIndex ?? defaultZ(b);
      return za - zb;
    });
    const idx = ranked.indexOf(id);
    if (idx === -1) return;
    let target = idx;
    if (dir === "front") target = ranked.length - 1;
    else if (dir === "back") target = 0;
    else if (dir === "up") target = Math.min(ranked.length - 1, idx + 1);
    else if (dir === "down") target = Math.max(0, idx - 1);
    if (target === idx) return;
    ranked.splice(idx, 1);
    ranked.splice(target, 0, id);
    const next = { ...transforms };
    ranked.forEach((eid, i) => {
      const cur = next[eid];
      if (!cur) return;
      next[eid] = { ...cur, zIndex: i + 1 };
    });
    onChange({ transforms: next });
  }

  return (
    <div className="space-y-3 rounded-xl border bg-muted/20 p-3">
      <p className="text-[11px] text-muted-foreground">
        {activeId
          ? "Fine-tune the selected element's rotation and stacking."
          : "Click an element on the canvas to fine-tune its rotation and stacking."}
      </p>

      {activeId ? (
        <ActiveElementPanel
          activeId={activeId}
          transform={transforms[activeId]}
          onRotate={(rotation) => patchElement(activeId, { rotation })}
          onReorder={(dir) => reorder(activeId, dir)}
        />
      ) : (
        <div className="rounded-lg border border-dashed bg-background/40 p-4 text-center text-[11px] text-muted-foreground">
          No element selected
        </div>
      )}
    </div>
  );
}

function ActiveElementPanel({
  activeId,
  transform,
  onRotate,
  onReorder,
}: {
  activeId: ElementId;
  transform: ElementTransform | undefined;
  onRotate: (rotation: number) => void;
  onReorder: (dir: "front" | "back" | "up" | "down") => void;
}) {
  const engaged = !!transform;
  const rotation = transform?.rotation ?? 0;
  const label = ELEMENT_LABEL[activeId];
  return (
    <div className="space-y-3 rounded-lg border bg-background/60 p-2.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium">{label}</span>
        {!engaged && (
          <span className="text-[10px] text-muted-foreground">drag to enable</span>
        )}
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <Label className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <RotateCw className="h-3 w-3" /> Rotation
          </Label>
          <span className="text-[11px] tabular-nums text-muted-foreground">{rotation}°</span>
        </div>
        <input
          type="range"
          min={-180}
          max={180}
          step={1}
          value={rotation}
          disabled={!engaged}
          onChange={(e) => onRotate(Number(e.target.value))}
          className="w-full disabled:opacity-50"
          aria-label={`${label} rotation`}
        />
      </div>

      <div className="space-y-1">
        <Label className="text-[11px] text-muted-foreground">Layer order</Label>
        <div className="grid grid-cols-4 gap-1">
          <LayerButton disabled={!engaged} onClick={() => onReorder("back")} label="Send to back">
            <ArrowDownToLine className="h-3.5 w-3.5" />
          </LayerButton>
          <LayerButton disabled={!engaged} onClick={() => onReorder("down")} label="Send backward">
            <ChevronDown className="h-3.5 w-3.5" />
          </LayerButton>
          <LayerButton disabled={!engaged} onClick={() => onReorder("up")} label="Bring forward">
            <ChevronUp className="h-3.5 w-3.5" />
          </LayerButton>
          <LayerButton disabled={!engaged} onClick={() => onReorder("front")} label="Bring to front">
            <ArrowUpToLine className="h-3.5 w-3.5" />
          </LayerButton>
        </div>
      </div>
    </div>
  );
}

function LayerButton({
  disabled,
  onClick,
  label,
  children,
}: {
  disabled: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="h-7 px-0"
      disabled={disabled}
      onClick={onClick}
      title={label}
      aria-label={label}
    >
      {children}
    </Button>
  );
}

function defaultZ(id: ElementId): number {
  if (id === "deviceSecondary") return 2;
  if (id === "device") return 3;
  return 4;
}

const FRAME_PRESETS = [
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

function FrameColorPicker({
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
        <Label className="text-[10px] text-muted-foreground">Frame color</Label>
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
        {FRAME_PRESETS.map((preset) => {
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

        {/* Custom color via native picker */}
        <button
          type="button"
          title="Custom color"
          onClick={() => colorInputRef.current?.click()}
          className="relative h-6 w-6 overflow-hidden rounded-full transition-transform hover:scale-110"
          style={{
            background: "conic-gradient(red, yellow, lime, aqua, blue, magenta, red)",
            boxShadow:
              value && !FRAME_PRESETS.some((p) => p.color === value)
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
          <span
            className="h-4 w-4 shrink-0 rounded-full border border-white/10"
            style={{ background: value }}
          />
          <span className="flex-1 font-mono text-[10px] text-muted-foreground">{value}</span>
        </div>
      )}
    </div>
  );
}

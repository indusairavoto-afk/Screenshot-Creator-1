"use client";
import * as React from "react";
import JSZip from "jszip";
import { toPng } from "html-to-image";
import { Toaster, toast } from "sonner";
import {
  FONT_OPTIONS,
  TRANSLATE_LANGUAGES,
  getExportSizes,
  supportsLandscape,
  THEMES,
} from "@/lib/constants";
import { detectPlatform, nid } from "@/lib/defaults";
import { preloadImages, setImage } from "@/lib/image-cache";
import { resolveScreenshot, writeLocalized } from "@/lib/locale";
import { useProject } from "@/lib/storage";
import type { Callout, Device, ElementId, Slide, Sticker, ThemeId } from "@/lib/types";
import { PreviewStage } from "./preview-stage";
import { Sidebar } from "./sidebar";
import { SlideCanvas, getCanvas } from "./slide-canvas";
import { Toolbar } from "./toolbar";

export function ScreenshotEditor() {
  const { state, setState, hydrated, savedAt, saveError, reset, resetDevice, undo, redo } = useProject();
  const [activeSlideId, setActiveSlideId] = React.useState<string | null>(null);
  const [selectedElementId, setSelectedElementId] = React.useState<ElementId | null>(null);
  const [calloutMode, setCalloutMode] = React.useState(false);
  const [selectedCalloutId, setSelectedCalloutId] = React.useState<string | null>(null);
  const [selectedStickerId, setSelectedStickerId] = React.useState<string | null>(null);
  const [exporting, setExporting] = React.useState<string | null>(null);
  const [ready, setReady] = React.useState(false);
  const [exportLocaleOverride, setExportLocaleOverride] = React.useState<string | null>(null);
  const exportRefs = React.useRef<Record<string, HTMLDivElement | null>>({});

  const currentSlides = state.slidesByDevice[state.device] || [];
  const activeSlide =
    currentSlides.find((s) => s.id === activeSlideId) || currentSlides[0] || null;
  const theme = THEMES[state.themeId];

  React.useEffect(() => {
    setSelectedElementId(null);
    setSelectedCalloutId(null);
    setCalloutMode(false);
  }, [activeSlide?.id]);

  React.useEffect(() => {
    if (!hydrated) return;
    if (!activeSlide && currentSlides.length > 0) {
      setActiveSlideId(currentSlides[0].id);
    }
  }, [hydrated, currentSlides, activeSlide]);

  React.useEffect(() => {
    if (!supportsLandscape(state.device) && state.orientation !== "portrait") {
      setState((p) => ({ ...p, orientation: "portrait" }));
    }
  }, [state.device, state.orientation, setState]);

  const assetPaths = React.useMemo(() => {
    const paths = new Set<string>();
    paths.add("/mockup.png");
    if (state.appIcon) paths.add(state.appIcon);
    // Preload every locale variant so bulk export doesn't race image loads.
    const allSlides: Slide[] = Object.values(state.slidesByDevice).flat();
    for (const s of allSlides) {
      for (const raw of [s.screenshot, s.screenshotSecondary]) {
        if (!raw || raw.startsWith("data:")) continue;
        if (raw.includes("{locale}")) {
          for (const loc of state.locales) paths.add(resolveScreenshot(raw, loc));
        } else {
          paths.add(raw);
        }
      }
    }
    return Array.from(paths).sort();
  }, [state.slidesByDevice, state.appIcon, state.locales]);
  const assetSig = assetPaths.join("|");

  React.useEffect(() => {
    if (!hydrated) return;
    preloadImages(assetPaths).finally(() => setReady(true));
    // assetPaths is derived from assetSig; depending on the string keeps the
    // effect from re-firing when slidesByDevice churns without path changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, assetSig]);

  // Surface storage failures (quota exceeded etc.) so the user knows their work isn't safe.
  React.useEffect(() => {
    if (saveError) {
      toast.error("Couldn't save changes locally", {
        description: saveError,
        duration: 8000,
      });
    }
  }, [saveError]);

  // Load Google Fonts when fontFamily changes
  React.useEffect(() => {
    const ff = state.fontFamily;
    if (!ff || ff === "Inter") return;
    const fontOpt = FONT_OPTIONS.find((f) => f.css === ff);
    if (!fontOpt?.googleName) return;
    const linkId = `gfont-${fontOpt.id}`;
    if (document.getElementById(linkId)) return;
    const link = document.createElement("link");
    link.id = linkId;
    link.rel = "stylesheet";
    link.href = `https://fonts.googleapis.com/css2?family=${fontOpt.googleName}:wght@400;600;700;800&display=swap`;
    document.head.appendChild(link);
  }, [state.fontFamily]);

  // ---------- Mutations ----------

  const patchSlide = React.useCallback(
    (id: string, patch: Partial<Slide>) => {
      setState((prev) => ({
        ...prev,
        slidesByDevice: {
          ...prev.slidesByDevice,
          [prev.device]: (prev.slidesByDevice[prev.device] || []).map((s) =>
            s.id === id ? { ...s, ...patch } : s,
          ),
        },
      }));
    },
    [setState],
  );

  const reorderSlides = React.useCallback(
    (next: Slide[]) => {
      setState((prev) => ({
        ...prev,
        slidesByDevice: { ...prev.slidesByDevice, [prev.device]: next },
      }));
    },
    [setState],
  );

  const deleteSlide = React.useCallback(
    (id: string) => {
      const dev = state.device;
      const slides = state.slidesByDevice[dev] || [];
      const idx = slides.findIndex((s) => s.id === id);
      if (idx === -1) return;
      const snap = slides[idx];
      const fallback = slides[idx + 1] || slides[idx - 1] || null;

      setState((prev) => {
        const cur = prev.slidesByDevice[dev] || [];
        return {
          ...prev,
          slidesByDevice: { ...prev.slidesByDevice, [dev]: cur.filter((s) => s.id !== id) },
        };
      });
      setActiveSlideId((cur) => (cur === id ? fallback?.id || null : cur));
      delete exportRefs.current[id];

      toast("Slide deleted", {
        action: {
          label: "Undo",
          onClick: () => {
            setState((prev) => {
              const cur = prev.slidesByDevice[dev] || [];
              if (cur.some((s) => s.id === snap.id)) return prev;
              const restored = [...cur.slice(0, idx), snap, ...cur.slice(idx)];
              return {
                ...prev,
                slidesByDevice: { ...prev.slidesByDevice, [dev]: restored },
              };
            });
            setActiveSlideId(snap.id);
          },
        },
        duration: 6000,
      });
    },
    [setState, state.device, state.slidesByDevice],
  );

  const addSlide = React.useCallback(
    (slide: Slide) => {
      setState((prev) => ({
        ...prev,
        slidesByDevice: {
          ...prev.slidesByDevice,
          [prev.device]: [...(prev.slidesByDevice[prev.device] || []), slide],
        },
      }));
      setActiveSlideId(slide.id);
    },
    [setState],
  );

  const addCallout = React.useCallback(
    (id: string, callout: Callout) => {
      patchSlide(id, {
        callouts: [...((state.slidesByDevice[state.device] || []).find((s) => s.id === id)?.callouts || []), callout],
      });
      setSelectedCalloutId(callout.id);
    },
    [patchSlide, state.slidesByDevice, state.device],
  );

  const updateCallout = React.useCallback(
    (id: string, callout: Callout) => {
      patchSlide(id, {
        callouts: (state.slidesByDevice[state.device] || [])
          .find((s) => s.id === id)
          ?.callouts?.map((c) => (c.id === callout.id ? callout : c)) || [],
      });
    },
    [patchSlide, state.slidesByDevice, state.device],
  );

  const deleteCallout = React.useCallback(
    (slideId: string, calloutId: string) => {
      patchSlide(slideId, {
        callouts: (state.slidesByDevice[state.device] || [])
          .find((s) => s.id === slideId)
          ?.callouts?.filter((c) => c.id !== calloutId) || [],
      });
      setSelectedCalloutId(null);
    },
    [patchSlide, state.slidesByDevice, state.device],
  );

  const addSticker = React.useCallback(
    (slideId: string, emoji: string) => {
      const { cW, cH } = getCanvas(state.device, state.orientation);
      const sticker: Sticker = {
        id: nid(),
        emoji,
        x: Math.round(cW / 2 - 100),
        y: Math.round(cH / 2 - 100),
        width: 200,
        height: 200,
        zIndex: 20,
      };
      patchSlide(slideId, {
        stickers: [
          ...((state.slidesByDevice[state.device] || []).find((s) => s.id === slideId)?.stickers || []),
          sticker,
        ],
      });
      setSelectedStickerId(sticker.id);
    },
    [patchSlide, state.slidesByDevice, state.device, state.orientation],
  );

  const updateSticker = React.useCallback(
    (slideId: string, sticker: Sticker) => {
      patchSlide(slideId, {
        stickers: (state.slidesByDevice[state.device] || [])
          .find((s) => s.id === slideId)
          ?.stickers?.map((sk) => (sk.id === sticker.id ? sticker : sk)) || [],
      });
    },
    [patchSlide, state.slidesByDevice, state.device],
  );

  const deleteSticker = React.useCallback(
    (slideId: string, stickerId: string) => {
      patchSlide(slideId, {
        stickers: (state.slidesByDevice[state.device] || [])
          .find((s) => s.id === slideId)
          ?.stickers?.filter((sk) => sk.id !== stickerId) || [],
      });
      setSelectedStickerId(null);
    },
    [patchSlide, state.slidesByDevice, state.device],
  );

  const patchLocalized = React.useCallback(
    (slide: Slide, key: "label" | "headline", value: string) => {
      patchSlide(slide.id, {
        [key]: writeLocalized(slide[key], state.locale, value),
      } as Partial<Slide>);
    },
    [patchSlide, state.locale],
  );

  const applyTemplate = React.useCallback(
    (slides: Slide[], themeId: ThemeId) => {
      setState((prev) => ({
        ...prev,
        themeId,
        slidesByDevice: { ...prev.slidesByDevice, [prev.device]: slides },
      }));
      setActiveSlideId(slides[0]?.id || null);
      toast.success("Template applied");
    },
    [setState],
  );

  const handleTranslate = React.useCallback(
    async (langCode: string, langName: string) => {
      const slides = state.slidesByDevice[state.device] || [];
      if (!slides.length) {
        toast.error("No slides to translate");
        return;
      }
      const slideTexts = slides.map((s) => ({
        id: s.id,
        headline: Object.values(s.headline || {}).find(Boolean) || "",
        label: Object.values(s.label || {}).find(Boolean) || "",
      }));
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ slides: slideTexts, targetLanguage: langName, targetCode: langCode }),
      });
      if (!res.ok) throw new Error("Translation request failed");
      const data = (await res.json()) as { ok: boolean; translations?: { id: string; headline: string; label: string }[] };
      if (!data.ok || !data.translations) throw new Error("Translation failed");
      data.translations.forEach(({ id, headline, label }) => {
        const slide = slides.find((s) => s.id === id);
        if (!slide) return;
        patchSlide(id, {
          headline: writeLocalized(slide.headline, langCode, headline),
          label: writeLocalized(slide.label, langCode, label),
        });
      });
      setState((prev) => ({
        ...prev,
        locales: prev.locales.includes(langCode) ? prev.locales : [...prev.locales, langCode],
        locale: langCode,
      }));

      const langFont = TRANSLATE_LANGUAGES.find((l) => l.code === langCode)?.fontId;
      if (langFont) {
        const fontCss = FONT_OPTIONS.find((f) => f.id === langFont)?.css;
        if (fontCss) setState((prev) => ({ ...prev, fontFamily: fontCss }));
      }
      toast.success(`Translated to ${langName}! Locale switched to ${langCode.toUpperCase()}.`);
    },
    [state.slidesByDevice, state.device, patchSlide, setState],
  );

  const handleLocaleAdd = React.useCallback(
    (code: string) => {
      setState((prev) => ({
        ...prev,
        locales: prev.locales.includes(code) ? prev.locales : [...prev.locales, code],
      }));
    },
    [setState],
  );

  const handleScreenshotDrop = React.useCallback(
    async (file: File) => {
      if (!activeSlide) return;
      const layout = activeSlide.layout;
      if (layout === "no-device" || layout === "feature-graphic") return;
      try {
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        const resp = await fetch("/api/upload", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ dataUrl }),
        });
        const json = (await resp.json()) as { ok: boolean; path?: string };
        if (json.ok && json.path) {
          setImage(json.path, dataUrl);
          patchSlide(activeSlide.id, { screenshot: json.path });
        } else {
          setImage(dataUrl, dataUrl);
          patchSlide(activeSlide.id, { screenshot: dataUrl });
        }
        toast.success("Screenshot uploaded");
      } catch {
        toast.error("Failed to upload screenshot");
      }
    },
    [activeSlide, patchSlide],
  );

  const duplicateSlide = React.useCallback(
    (id: string) => {
      let newId: string | null = null;
      setState((prev) => {
        const slides = prev.slidesByDevice[prev.device] || [];
        const idx = slides.findIndex((s) => s.id === id);
        if (idx === -1) return prev;
        const src = slides[idx];
        newId = nid();
        const copy: Slide = { ...src, id: newId };
        const next = [...slides.slice(0, idx + 1), copy, ...slides.slice(idx + 1)];
        return {
          ...prev,
          slidesByDevice: { ...prev.slidesByDevice, [prev.device]: next },
        };
      });
      if (newId) setActiveSlideId(newId);
    },
    [setState],
  );

  // ---------- Keyboard shortcuts ----------

  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      const inEditable =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          (target as HTMLElement).isContentEditable);
      if (exporting) return;

      // Undo / redo and deselect work everywhere (including inside text
      // fields) so the shortcuts feel native.
      if ((e.metaKey || e.ctrlKey) && (e.key === "z" || e.key === "Z")) {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
        return;
      }
      if ((e.metaKey || e.ctrlKey) && (e.key === "y" || e.key === "Y")) {
        e.preventDefault();
        redo();
        return;
      }
      if (e.key === "Escape") {
        setSelectedElementId(null);
        if (target && "blur" in target && typeof target.blur === "function") target.blur();
        return;
      }

      if (inEditable) return;
      if (!currentSlides.length) return;
      const idx = activeSlide ? currentSlides.findIndex((s) => s.id === activeSlide.id) : -1;
      if (e.key === "ArrowDown" || (e.key === "j" && !e.metaKey && !e.ctrlKey)) {
        e.preventDefault();
        const next = currentSlides[Math.min(currentSlides.length - 1, idx + 1)];
        if (next) setActiveSlideId(next.id);
      } else if (e.key === "ArrowUp" || (e.key === "k" && !e.metaKey && !e.ctrlKey)) {
        e.preventDefault();
        const next = currentSlides[Math.max(0, idx - 1)];
        if (next) setActiveSlideId(next.id);
      } else if ((e.key === "d" || e.key === "D") && (e.metaKey || e.ctrlKey)) {
        if (activeSlide) {
          e.preventDefault();
          duplicateSlide(activeSlide.id);
        }
      } else if ((e.key === "Backspace" || e.key === "Delete") && (e.metaKey || e.ctrlKey)) {
        if (activeSlide) {
          e.preventDefault();
          deleteSlide(activeSlide.id);
        }
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeSlide, currentSlides, duplicateSlide, deleteSlide, exporting, undo, redo]);

  // ---------- Export ----------

  // Wait two animation frames so React's render → browser layout/paint of the
  // off-screen container settles before html-to-image snapshots it. One frame
  // is occasionally not enough on slower machines.
  const waitForPaint = () =>
    new Promise<void>((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
    });

  async function exportAll() {
    if (!currentSlides.length) {
      toast.error("No slides to export");
      return;
    }

    const sizes = getExportSizes(state.device, state.orientation);
    if (!sizes.length) {
      toast.error("Nothing to export");
      return;
    }
    const locales = state.locales;

    // Make sure custom fonts are loaded before snapshot so typography in PNG
    // matches what's on screen.
    if (typeof document !== "undefined" && document.fonts && document.fonts.ready) {
      try {
        await document.fonts.ready;
      } catch {
        /* ignore */
      }
    }

    const { cW, cH } = getCanvas(state.device, state.orientation);
    const platform = detectPlatform(state.device);
    const zip = new JSZip();
    const totalUnits = sizes.length * locales.length * currentSlides.length;
    let unit = 0;
    let okCount = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const locale of locales) {
      setExportLocaleOverride(locale);
      await waitForPaint();

      for (const size of sizes) {
        // Uniform downscale so smaller sizes shrink instead of getting cropped
        // by html-to-image.
        const scale = Math.min(size.w / cW, size.h / cH);

        for (let i = 0; i < currentSlides.length; i++) {
          const slide = currentSlides[i];
          unit += 1;
          setExporting(`${unit}/${totalUnits}`);
          const el = exportRefs.current[slide.id];
          if (!el) {
            failed += 1;
            errors.push(`${locale} ${size.w}×${size.h} slide ${i + 1}: render target missing`);
            continue;
          }
          try {
            const dataUrl = await captureSlide(el, size.w, size.h, scale);
            const base64 = dataUrl.split(",")[1] || "";
            const filename = `${String(i + 1).padStart(2, "0")}-${slide.layout}.png`;
            const path = `${platform}/${state.device}/${size.w}x${size.h}/${locale}/${filename}`;
            zip.file(path, base64, { base64: true });
            okCount += 1;
          } catch (e) {
            failed += 1;
            const msg = e instanceof Error ? e.message : String(e);
            errors.push(`${locale} ${size.w}×${size.h} slide ${i + 1}: ${msg}`);
            console.error("Export failed", { slideId: slide.id, locale, size }, e);
          }
        }
      }
    }

    setExportLocaleOverride(null);
    setExporting(null);

    if (okCount > 0) {
      try {
        const blob = await zip.generateAsync({ type: "blob" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${slugify(state.appName)}-${platform}-${state.device}-${stamp()}.zip`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 5000);
      } catch (e) {
        toast.error("Couldn't bundle export");
        console.error(e);
        return;
      }
    }

    const summary = `${locales.length} locale${locales.length === 1 ? "" : "s"} × ${sizes.length} size${sizes.length === 1 ? "" : "s"}`;
    if (failed === 0) {
      toast.success(`Exported ${okCount} PNGs (${summary})`);
    } else if (okCount === 0) {
      toast.error(`All ${failed} renders failed`, {
        description: errors.slice(0, 3).join("\n"),
      });
    } else {
      toast.error(`${failed} of ${totalUnits} renders failed`, {
        description: errors.slice(0, 3).join("\n"),
      });
    }
  }

  async function captureSlide(el: HTMLElement, w: number, h: number, scale: number) {
    // html-to-image needs the node at (0,0) and uniformly scaled so the
    // captured pixel buffer matches the requested export size. Snapshot the
    // styles we touch so we can restore them after capture.
    const prev = {
      left: el.style.left,
      top: el.style.top,
      position: el.style.position,
      transform: el.style.transform,
      transformOrigin: el.style.transformOrigin,
      zIndex: el.style.zIndex,
    };
    el.style.left = "0px";
    el.style.top = "0px";
    el.style.position = "absolute";
    el.style.transform = `scale(${scale})`;
    el.style.transformOrigin = "top left";
    el.style.zIndex = "-1";
    try {
      const dataUrl = await toPng(el, {
        width: w,
        height: h,
        pixelRatio: 1,
        cacheBust: false,
      });
      return dataUrl;
    } finally {
      el.style.left = prev.left || "-99999px";
      el.style.top = prev.top || "0px";
      el.style.position = prev.position || "absolute";
      el.style.transform = prev.transform;
      el.style.transformOrigin = prev.transformOrigin;
      el.style.zIndex = prev.zIndex;
    }
  }

  // ---------- Render ----------

  if (!hydrated || !ready) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-current border-t-transparent" />
          <p className="text-sm">Loading editor…</p>
        </div>
      </div>
    );
  }

  const { cW, cH } = getCanvas(state.device, state.orientation);
  const busy = !!exporting;

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <Toaster position="top-center" richColors closeButton />

      {/* Floating bottom toolbar — fixed positioned, self-contained */}
      <Toolbar
        appName={state.appName}
        setAppName={(v) => setState((p) => ({ ...p, appName: v }))}
        locale={state.locale}
        setLocale={(v) => setState((p) => ({ ...p, locale: v }))}
        locales={state.locales}
        device={state.device}
        setDevice={(v) => setState((p) => ({ ...p, device: v }))}
        orientation={state.orientation}
        setOrientation={(v) => setState((p) => ({ ...p, orientation: v }))}
        onExport={exportAll}
        onResetAll={() => { reset(); setActiveSlideId(null); toast.success("Reset all devices to defaults"); }}
        onResetDevice={() => { resetDevice(state.device); setActiveSlideId(null); toast.success(`Reset ${state.device} to defaults`); }}
        exporting={exporting}
        savedAt={savedAt}
        saveError={saveError}
        busy={busy}
        slide={activeSlide ?? null}
        theme={theme}
        themeId={state.themeId}
        setThemeId={(v) => setState((p) => ({ ...p, themeId: v }))}
        onSlideChange={(patch) => activeSlide && patchSlide(activeSlide.id, patch)}
        fontFamily={state.fontFamily}
        onFontChange={(v) => setState((p) => ({ ...p, fontFamily: v }))}
        onTranslate={handleTranslate}
        onLocaleAdd={handleLocaleAdd}
        calloutMode={calloutMode}
        setCalloutMode={setCalloutMode}
        selectedCalloutId={selectedCalloutId}
        onSelectCallout={setSelectedCalloutId}
        onDeleteCallout={(cid) => activeSlide && deleteCallout(activeSlide.id, cid)}
        onUpdateCallout={(c) => activeSlide && updateCallout(activeSlide.id, c)}
        onAddSticker={(emoji) => activeSlide && addSticker(activeSlide.id, emoji)}
      />

      {/* Main 2-column layout: Canvas | Slides */}
      <div className="flex flex-1 overflow-hidden md:flex-row flex-col">

        {/* CENTER — Canvas preview, padded bottom for floating bar */}
        <main className="flex flex-1 items-stretch overflow-hidden min-h-0 pb-20">
          {activeSlide ? (
            <PreviewStage
              slide={activeSlide}
              device={state.device}
              orientation={state.orientation}
              theme={theme}
              locale={state.locale}
              appName={state.appName}
              appIcon={state.appIcon}
              fontFamily={state.fontFamily}
              selectedElementId={selectedElementId}
              onScreenshotDrop={handleScreenshotDrop}
              onLabelChange={(v) => patchLocalized(activeSlide, "label", v)}
              onHeadlineChange={(v) => patchLocalized(activeSlide, "headline", v)}
              onElementChange={(id, t) =>
                patchSlide(activeSlide.id, {
                  transforms: { ...(activeSlide.transforms || {}), [id]: t },
                })
              }
              onSelectElement={setSelectedElementId}
              calloutMode={calloutMode}
              selectedCalloutId={selectedCalloutId}
              onAddCallout={(c) => addCallout(activeSlide.id, c)}
              onUpdateCallout={(c) => updateCallout(activeSlide.id, c)}
              onSelectCallout={setSelectedCalloutId}
              selectedStickerId={selectedStickerId}
              onUpdateSticker={(s) => updateSticker(activeSlide.id, s)}
              onDeleteSticker={(id) => deleteSticker(activeSlide.id, id)}
              onSelectSticker={setSelectedStickerId}
            />
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 p-8 text-center text-sm text-muted-foreground">
              <p className="font-medium text-foreground">No slide selected</p>
              <p>Add a slide on the right to get started.</p>
            </div>
          )}
        </main>

        {/* RIGHT — Slides panel */}
        <aside className="md:w-64 w-full shrink-0 border-l bg-card/60 md:max-h-none max-h-64 overflow-hidden">
          <Sidebar
            slides={currentSlides}
            activeId={activeSlide?.id || null}
            device={state.device}
            orientation={state.orientation}
            theme={theme}
            locale={state.locale}
            appName={state.appName}
            appIcon={state.appIcon}
            disabled={busy}
            onReorder={reorderSlides}
            onSelect={setActiveSlideId}
            onDelete={deleteSlide}
            onDuplicate={duplicateSlide}
            onAdd={addSlide}
            onApplyTemplate={applyTemplate}
          />
        </aside>
      </div>

      {/* Off-screen export container — full-resolution canvases for html-to-image. */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          left: -99999,
          top: 0,
          pointerEvents: "none",
        }}
      >
        {currentSlides.map((slide) => (
          <div
            key={slide.id}
            ref={(el) => {
              if (el) exportRefs.current[slide.id] = el;
              else delete exportRefs.current[slide.id];
            }}
            style={{ width: cW, height: cH, position: "absolute", left: -99999, top: 0 }}
          >
            <SlideCanvas
              slide={slide}
              device={state.device}
              orientation={state.orientation}
              theme={theme}
              locale={exportLocaleOverride ?? state.locale}
              appName={state.appName}
              appIcon={state.appIcon}
              fontFamily={state.fontFamily}
              hideEmpty
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function slugify(s: string) {
  return (
    s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "screenshots"
  );
}

function stamp() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}`;
}

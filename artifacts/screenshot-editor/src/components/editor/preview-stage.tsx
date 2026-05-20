"use client";
import * as React from "react";
import { Upload } from "lucide-react";
import { DEVICE_LABEL, LAYOUT_LABEL } from "@/lib/constants";
import type {
  Callout,
  Device,
  ElementId,
  ElementTransform,
  Orientation,
  Slide,
  Theme,
} from "@/lib/types";
import { getCanvas, SlideCanvas } from "./slide-canvas";

type Props = {
  slide: Slide;
  device: Device;
  orientation: Orientation;
  theme: Theme;
  locale: string;
  appName?: string;
  appIcon?: string;
  fontFamily?: string;
  selectedElementId: ElementId | null;
  onLabelChange: (v: string) => void;
  onHeadlineChange: (v: string) => void;
  onElementChange: (id: ElementId, t: ElementTransform) => void;
  onSelectElement: (id: ElementId | null) => void;
  calloutMode?: boolean;
  selectedCalloutId?: string | null;
  onAddCallout?: (c: Callout) => void;
  onUpdateCallout?: (c: Callout) => void;
  onSelectCallout?: (id: string | null) => void;
  onScreenshotDrop?: (file: File) => void;
};

const ACCEPTED = ["image/png", "image/jpeg"];

export function PreviewStage({
  slide,
  device,
  orientation,
  theme,
  locale,
  appName,
  appIcon,
  fontFamily,
  selectedElementId,
  onLabelChange,
  onHeadlineChange,
  onElementChange,
  onSelectElement,
  calloutMode,
  selectedCalloutId,
  onAddCallout,
  onUpdateCallout,
  onSelectCallout,
  onScreenshotDrop,
}: Props) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [scale, setScale] = React.useState(0.2);
  const [dragOver, setDragOver] = React.useState(false);
  const { cW, cH } = getCanvas(device, orientation);

  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      const rect = el.getBoundingClientRect();
      const sx = (rect.width - 48) / cW;
      const sy = (rect.height - 48) / cH;
      setScale(Math.max(0.05, Math.min(sx, sy)));
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [cW, cH]);

  const hasMedia = slide.layout !== "no-device" && slide.layout !== "feature-graphic";

  function handleDragOver(e: React.DragEvent) {
    if (!onScreenshotDrop || !hasMedia) return;
    const hasFile = Array.from(e.dataTransfer.types).includes("Files");
    if (!hasFile) return;
    e.preventDefault();
    setDragOver(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    if (e.currentTarget === e.target || !e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragOver(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    if (!onScreenshotDrop) return;
    const file = e.dataTransfer.files?.[0];
    if (!file || !ACCEPTED.includes(file.type)) return;
    onScreenshotDrop(file);
  }

  return (
    <div
      ref={containerRef}
      className="relative flex h-full w-full items-center justify-center overflow-hidden bg-[radial-gradient(60%_60%_at_50%_40%,_hsl(var(--background))_0%,_hsl(var(--muted))_100%)]"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div
        style={{
          width: cW,
          height: cH,
          transform: `scale(${scale})`,
          transformOrigin: "center center",
          flexShrink: 0,
          boxShadow: "0 40px 80px -30px rgba(0,0,0,0.32), 0 10px 24px -12px rgba(0,0,0,0.18)",
          background: "white",
          borderRadius: 12 / scale,
          overflow: "hidden",
        }}
      >
        <SlideCanvas
          slide={slide}
          device={device}
          orientation={orientation}
          theme={theme}
          locale={locale}
          appName={appName}
          appIcon={appIcon}
          fontFamily={fontFamily}
          editable
          previewScale={scale}
          selectedElementId={selectedElementId}
          edit={{ onLabelChange, onHeadlineChange, onElementChange, onSelectElement }}
          calloutMode={calloutMode}
          selectedCalloutId={selectedCalloutId}
          onAddCallout={onAddCallout}
          onUpdateCallout={onUpdateCallout}
          onSelectCallout={onSelectCallout}
        />
      </div>

      {/* Drop overlay */}
      {dragOver && hasMedia && (
        <div className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-primary/10 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-primary bg-card/90 px-8 py-6 shadow-lg">
            <Upload className="h-8 w-8 text-primary" />
            <p className="text-sm font-semibold text-primary">Drop to set screenshot</p>
            <p className="text-xs text-muted-foreground">PNG or JPG</p>
          </div>
        </div>
      )}

      <div className="pointer-events-none absolute left-4 top-4 flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <span className="font-medium text-foreground">{DEVICE_LABEL[device]}</span>
        <span aria-hidden>·</span>
        <span>{LAYOUT_LABEL[slide.layout]}</span>
        {orientation === "landscape" && (
          <>
            <span aria-hidden>·</span>
            <span>landscape</span>
          </>
        )}
      </div>

      {!dragOver && hasMedia && onScreenshotDrop && (
        <div className="pointer-events-none absolute right-4 top-4 rounded-lg border border-border/50 bg-card/70 px-2 py-1 text-[10px] text-muted-foreground backdrop-blur-sm">
          Drop image to upload
        </div>
      )}

      <div className="pointer-events-none absolute bottom-4 right-4 flex items-center gap-1.5 text-[10px] tabular-nums text-muted-foreground">
        <span>{cW}×{cH}</span>
        <span aria-hidden>·</span>
        <span>{(scale * 100).toFixed(0)}%</span>
      </div>
    </div>
  );
}

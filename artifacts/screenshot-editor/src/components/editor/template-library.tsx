"use client";
import * as React from "react";
import { LayoutTemplate } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import type { Slide, ThemeId } from "@/lib/types";
import { nid } from "@/lib/defaults";

const en = (s: string) => ({ en: s });

export type Template = {
  id: string;
  name: string;
  emoji: string;
  description: string;
  themeId: ThemeId;
  slides: Omit<Slide, "id">[];
};

export const TEMPLATES: Template[] = [
  {
    id: "productivity",
    name: "Productivity",
    emoji: "⚡",
    description: "Clean, minimal — great for task managers and focus apps",
    themeId: "arctic",
    slides: [
      { layout: "hero",          label: en("MEET THE APP"),  headline: en("Focus on what\nmatters most."),        screenshot: "" },
      { layout: "device-bottom", label: en("TASK MANAGER"),  headline: en("Capture every\ntask instantly."),       screenshot: "" },
      { layout: "two-devices",   label: en("SYNC"),          headline: en("All your devices,\none workspace."),    screenshot: "", screenshotSecondary: "" },
      { layout: "device-top",    label: en("REMINDERS"),     headline: en("Never miss\na deadline."),              screenshot: "", inverted: true },
      { layout: "no-device",     label: en("MORE"),          headline: en("Built for\nreal focus."),               screenshot: "" },
    ],
  },
  {
    id: "fitness",
    name: "Fitness & Health",
    emoji: "💪",
    description: "Energetic, bold — ideal for workout and wellness apps",
    themeId: "neon",
    slides: [
      { layout: "hero",          label: en("YOUR FITNESS"),  headline: en("Train smarter,\nnot harder."),          screenshot: "" },
      { layout: "device-bottom", label: en("WORKOUTS"),      headline: en("500+ guided\nworkouts."),               screenshot: "" },
      { layout: "device-top",    label: en("TRACKING"),      headline: en("Every rep.\nEvery set."),               screenshot: "", inverted: true },
      { layout: "two-devices",   label: en("PROGRESS"),      headline: en("Watch yourself\ngrow stronger."),       screenshot: "", screenshotSecondary: "" },
      { layout: "no-device",     label: en("START TODAY"),   headline: en("Your best\nself awaits."),              screenshot: "" },
    ],
  },
  {
    id: "social",
    name: "Social & Community",
    emoji: "🌐",
    description: "Warm, inviting — perfect for chat and community platforms",
    themeId: "warm-editorial",
    slides: [
      { layout: "hero",          label: en("JOIN US"),       headline: en("Find your\ntribe."),                    screenshot: "" },
      { layout: "device-bottom", label: en("MESSAGING"),     headline: en("Stay close\nto the people\nyou love."), screenshot: "" },
      { layout: "two-devices",   label: en("GROUPS"),        headline: en("Better together."),                     screenshot: "", screenshotSecondary: "" },
      { layout: "device-top",    label: en("DISCOVER"),      headline: en("New friends\naround every corner."),    screenshot: "", inverted: true },
      { layout: "no-device",     label: en("MORE"),          headline: en("Real connections,\nnot just likes."),   screenshot: "" },
    ],
  },
  {
    id: "finance",
    name: "Finance",
    emoji: "💰",
    description: "Clean and trustworthy — for banking and money management apps",
    themeId: "dark-bold",
    slides: [
      { layout: "hero",          label: en("YOUR MONEY"),    headline: en("Take control\nof your finances."),      screenshot: "" },
      { layout: "device-bottom", label: en("SPENDING"),      headline: en("Know where\nevery dollar goes."),       screenshot: "" },
      { layout: "device-top",    label: en("SAVINGS"),       headline: en("Grow your\nwealth effortlessly."),      screenshot: "", inverted: true },
      { layout: "two-devices",   label: en("INSIGHTS"),      headline: en("Smart insights,\nbetter decisions."),   screenshot: "", screenshotSecondary: "" },
      { layout: "no-device",     label: en("TRUSTED"),       headline: en("Bank-grade\nsecurity."),                screenshot: "" },
    ],
  },
  {
    id: "photo",
    name: "Photo & Creative",
    emoji: "🎨",
    description: "Artistic, editorial — showcase creative or photography tools",
    themeId: "midnight",
    slides: [
      { layout: "hero",          label: en("CREATE"),        headline: en("Your vision,\nunleashed."),              screenshot: "" },
      { layout: "device-bottom", label: en("EDIT"),          headline: en("Pro-quality edits\nin seconds."),        screenshot: "" },
      { layout: "two-devices",   label: en("FILTERS"),       headline: en("Hundreds of\nstyles to explore."),      screenshot: "", screenshotSecondary: "" },
      { layout: "device-top",    label: en("SHARE"),         headline: en("Share beauty\nwith the world."),         screenshot: "", inverted: true },
      { layout: "no-device",     label: en("YOUR STORY"),    headline: en("Every picture\ntells one."),             screenshot: "" },
    ],
  },
  {
    id: "gaming",
    name: "Gaming",
    emoji: "🎮",
    description: "Bold and exciting — for casual and competitive games",
    themeId: "rose",
    slides: [
      { layout: "hero",          label: en("PLAY NOW"),      headline: en("Epic battles\nawait."),                  screenshot: "" },
      { layout: "device-bottom", label: en("GAMEPLAY"),      headline: en("100 levels\nof pure fun."),              screenshot: "" },
      { layout: "two-devices",   label: en("MULTIPLAYER"),   headline: en("Challenge\nyour friends."),              screenshot: "", screenshotSecondary: "" },
      { layout: "device-top",    label: en("REWARDS"),       headline: en("Unlock epic\ngear & skins."),            screenshot: "", inverted: true },
      { layout: "no-device",     label: en("JOIN"),          headline: en("Millions of\nplayers online."),          screenshot: "" },
    ],
  },
];

type Props = {
  open: boolean;
  onClose: () => void;
  onApply: (slides: Slide[], themeId: ThemeId) => void;
};

export function TemplateLibrary({ open, onClose, onApply }: Props) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LayoutTemplate className="h-4 w-4" /> Template Library
          </DialogTitle>
          <DialogDescription>
            Pick a starter deck to instantly replace your current slides. You can edit everything after.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {TEMPLATES.map((t) => (
            <TemplateCard key={t.id} template={t} onApply={() => {
              const slides: Slide[] = t.slides.map((s) => ({ ...s, id: nid() }));
              onApply(slides, t.themeId);
              onClose();
            }} />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function TemplateCard({ template: t, onApply }: { template: Template; onApply: () => void }) {
  const slideLayouts = t.slides.map((s) => s.layout);
  return (
    <div className="flex flex-col gap-3 rounded-xl border bg-card p-4 transition-all hover:border-primary/50 hover:shadow-sm">
      <div className="flex items-center gap-2">
        <span className="text-2xl">{t.emoji}</span>
        <div>
          <p className="font-semibold text-sm">{t.name}</p>
          <p className="text-[11px] text-muted-foreground leading-snug">{t.description}</p>
        </div>
      </div>

      <div className="flex gap-1 flex-wrap">
        {slideLayouts.map((layout, i) => (
          <span key={i} className="rounded-md border border-border/60 bg-muted/50 px-1.5 py-0.5 text-[9px] font-medium text-muted-foreground">
            {layout}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground">{t.slides.length} slides</span>
        <Button size="sm" className="h-7 text-xs" onClick={onApply}>
          Use template
        </Button>
      </div>
    </div>
  );
}

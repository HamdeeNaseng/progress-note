"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type StatItem = {
  label: string;
  value: number | string;
  highlight?: "positive" | "warning" | "neutral";
};

export type StatGroup = {
  id: string;
  title: string;
  summary: string;
  icon: React.ComponentType<{ className?: string }>;
  stats: StatItem[];
};

type StatsAccordionProps = {
  groups: StatGroup[];
  defaultOpenId?: string;
};

function AccordionItem({
  group,
  defaultOpen = false,
}: Readonly<{
  group: StatGroup;
  defaultOpen?: boolean;
}>) {
  const [open, setOpen] = useState(defaultOpen);
  const Icon = group.icon;

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={`accordion-panel-${group.id}`}
        id={`accordion-trigger-${group.id}`}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-card"
      >
        <Icon className="size-4 shrink-0 text-primary" />
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-foreground">{group.title}</div>
          <div className="text-xs text-muted-foreground truncate">{group.summary}</div>
        </div>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-muted-foreground transition-transform duration-300",
            open && "rotate-180",
          )}
          aria-hidden="true"
        />
      </button>

      {/*
       * .accordion-panel drives the height animation.
       * data-open controls the expanded/collapsed CSS state.
       * See globals.css for the two-strategy animation approach:
       *   1. grid-template-rows fallback (Firefox / Safari)
       *   2. interpolate-size + block-size: auto (Chrome / Edge 129+)
       */}
      <section
        className="accordion-panel"
        data-open={String(open)}
        id={`accordion-panel-${group.id}`}
        aria-labelledby={`accordion-trigger-${group.id}`}
      >
        <div className="accordion-panel-inner">
          <div className="px-4 pb-4 pt-1 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {group.stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-md bg-muted/30 border border-border/50 px-3 py-2"
              >
                <div
                  className={cn(
                    "text-lg font-semibold tabular-nums leading-none",
                    stat.highlight === "positive" && "text-emerald-400",
                    stat.highlight === "warning" && "text-amber-400",
                    (!stat.highlight || stat.highlight === "neutral") && "text-foreground",
                  )}
                >
                  {stat.value}
                </div>
                <div className="text-[11px] text-muted-foreground mt-1 leading-tight">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export function StatsAccordion({ groups, defaultOpenId }: Readonly<StatsAccordionProps>) {
  return (
    <div className="flex flex-col gap-2">
      {groups.map((group) => (
        <AccordionItem
          key={group.id}
          group={group}
          defaultOpen={defaultOpenId ? group.id === defaultOpenId : false}
        />
      ))}
    </div>
  );
}

"use client";

/**
 * Tooltip â€” native Popover API + CSS Anchor Positioning
 *
 * Uses `popover="hint"` (Chrome 133+/Edge 133+/FF 149+) with JS-driven
 * show/hide for universal hover/focus support. CSS Anchor Positioning
 * (Chrome 125+) is applied imperatively via `style.setProperty()` inside
 * a `useEffect`; browsers without support get browser-default popover
 * centering as a graceful fallback.
 *
 * Polyfills (optional, for full cross-browser parity):
 *   npm install @oddbird/css-anchor-positioning @oddbird/popover-polyfill
 *
 * API surface is identical to the previous Radix UI-based implementation
 * so all existing call-sites continue to work without changes.
 */

import * as React from "react";
import { cn } from "@/lib/utils";

// â”€â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

type Side = "top" | "right" | "bottom" | "left";
type Align = "start" | "center" | "end";

type TooltipContextValue = {
  uid: string;
  show(): void;
  scheduleHide(): void;
  cancelHide(): void;
};

type PopoverElement = HTMLElement & {
  showPopover?(): void;
  hidePopover?(): void;
};

// Anchor positioning config for a given {side, align} combination.
type AnchorConfig = {
  readonly set: ReadonlyArray<readonly [string, string]>;
  readonly remove: ReadonlyArray<string>;
  readonly translate: (off: string) => string;
};

// â”€â”€â”€ Anchor positioning config table â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Data-driven: eliminates a deeply-nested switch statement in the effect
// and keeps cognitive complexity well below the configured ceiling.

const ANCHOR_CONFIGS: Readonly<Record<Side, Readonly<Record<Align, AnchorConfig>>>> = {
  top: {
    center: {
      set: [
        ["bottom", "anchor(top)"],
        ["left", "anchor(center)"],
      ],
      remove: ["top", "right"],
      translate: (o) => `-50% calc(-1 * ${o})`,
    },
    start: {
      set: [
        ["bottom", "anchor(top)"],
        ["left", "anchor(left)"],
      ],
      remove: ["top", "right"],
      translate: (o) => `0 calc(-1 * ${o})`,
    },
    end: {
      set: [
        ["bottom", "anchor(top)"],
        ["right", "anchor(right)"],
      ],
      remove: ["top", "left"],
      translate: (o) => `0 calc(-1 * ${o})`,
    },
  },
  bottom: {
    center: {
      set: [
        ["top", "anchor(bottom)"],
        ["left", "anchor(center)"],
      ],
      remove: ["bottom", "right"],
      translate: (o) => `-50% ${o}`,
    },
    start: {
      set: [
        ["top", "anchor(bottom)"],
        ["left", "anchor(left)"],
      ],
      remove: ["bottom", "right"],
      translate: (o) => `0 ${o}`,
    },
    end: {
      set: [
        ["top", "anchor(bottom)"],
        ["right", "anchor(right)"],
      ],
      remove: ["bottom", "left"],
      translate: (o) => `0 ${o}`,
    },
  },
  right: {
    center: {
      set: [
        ["left", "anchor(right)"],
        ["top", "anchor(center)"],
      ],
      remove: ["right", "bottom"],
      translate: (o) => `${o} -50%`,
    },
    start: {
      set: [
        ["left", "anchor(right)"],
        ["top", "anchor(top)"],
      ],
      remove: ["right", "bottom"],
      translate: (o) => `${o} 0`,
    },
    end: {
      set: [
        ["left", "anchor(right)"],
        ["bottom", "anchor(bottom)"],
      ],
      remove: ["right", "top"],
      translate: (o) => `${o} 0`,
    },
  },
  left: {
    center: {
      set: [
        ["right", "anchor(left)"],
        ["top", "anchor(center)"],
      ],
      remove: ["left", "bottom"],
      translate: (o) => `calc(-1 * ${o}) -50%`,
    },
    start: {
      set: [
        ["right", "anchor(left)"],
        ["top", "anchor(top)"],
      ],
      remove: ["left", "bottom"],
      translate: (o) => `calc(-1 * ${o}) 0`,
    },
    end: {
      set: [
        ["right", "anchor(left)"],
        ["bottom", "anchor(bottom)"],
      ],
      remove: ["left", "top"],
      translate: (o) => `calc(-1 * ${o}) 0`,
    },
  },
} as const;

// â”€â”€â”€ Ref merge helper â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Module-level so the React Compiler's "no mutation of props" rule doesn't
// apply â€” refs are designed to be mutated externally by React.

function assignRef<T>(ref: React.Ref<T> | null | undefined, value: T | null): void {
  if (typeof ref === "function") {
    ref(value);
  } else if (ref != null) {
    (ref as { current: T | null }).current = value;
  }
}

// â”€â”€â”€ Context â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const TooltipContext = React.createContext<TooltipContextValue>({
  uid: "",
  show: () => {},
  scheduleHide: () => {},
  cancelHide: () => {},
});

// â”€â”€â”€ TooltipProvider â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/**
 * No-op wrapper kept for API compatibility with call-sites that wrap the
 * component tree in `<TooltipProvider>`. The Popover API does not need a
 * global provider; all state is scoped to individual `<Tooltip>` instances.
 */
function TooltipProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}

// â”€â”€â”€ Tooltip â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function Tooltip({ children }: Readonly<{ children: React.ReactNode }>) {
  // Strip the colons from React's generated id (":r0:") so it's safe for CSS
  // idents and HTML id attributes.
  const uid = React.useId().replaceAll(":", "");
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const getPopover = React.useCallback((): PopoverElement | null => {
    if (typeof document === "undefined") return null;
    return document.getElementById(`tt-${uid}`);
  }, [uid]);

  const cancelHide = React.useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // 80 ms delay lets the pointer travel from trigger to tooltip (WCAG 1.4.13).
  const scheduleHide = React.useCallback(() => {
    timerRef.current = setTimeout(() => {
      try {
        getPopover()?.hidePopover?.();
      } catch {
        /* ignore â€” popover may already be closed */
      }
    }, 80);
  }, [getPopover]);

  const show = React.useCallback(() => {
    cancelHide();
    const p = getPopover();
    try {
      if (p && !p.matches(":popover-open")) p.showPopover?.();
    } catch {
      /* ignore â€” e.g. popover not yet in DOM */
    }
  }, [cancelHide, getPopover]);

  const contextValue = React.useMemo(
    () => ({ uid, show, scheduleHide, cancelHide }),
    [uid, show, scheduleHide, cancelHide],
  );

  return <TooltipContext.Provider value={contextValue}>{children}</TooltipContext.Provider>;
}

// â”€â”€â”€ TooltipTrigger â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

type TooltipTriggerProps = {
  /** Forward event handlers onto the child element (Radix Slot pattern). */
  asChild?: boolean;
  children: React.ReactNode;
};

const TooltipTrigger = React.forwardRef<HTMLElement, TooltipTriggerProps>(function TooltipTrigger(
  { asChild, children },
  externalRef,
) {
  const { uid, show, scheduleHide } = React.useContext(TooltipContext);

  // Set `anchor-name` via setProperty to avoid TypeScript errors for this
  // new CSS property (not yet in React.CSSProperties / csstype).
  const setAnchorRef = React.useCallback(
    (el: HTMLElement | null) => {
      if (el) el.style.setProperty("anchor-name", `--tt-${uid}`);
      assignRef(externalRef, el);
    },
    [uid, externalRef],
  );

  const handlers: React.HTMLAttributes<HTMLElement> = {
    onPointerEnter: show,
    onFocus: show,
    onPointerLeave: scheduleHide,
    onBlur: scheduleHide,
  };

  if (asChild && React.isValidElement(children)) {
    const child = children as React.ReactElement<Record<string, unknown>>;
    // Merge refs: anchor-name setter + external forwarded ref + child's own ref.
    const childRef = (child as unknown as { ref?: React.Ref<HTMLElement> }).ref;
    const mergedRef = (el: HTMLElement | null) => {
      if (el) el.style.setProperty("anchor-name", `--tt-${uid}`);
      assignRef(externalRef, el);
      assignRef(childRef, el);
    };
    return React.cloneElement(child, { ...handlers, ref: mergedRef });
  }

  return (
    <span ref={setAnchorRef} {...handlers}>
      {children}
    </span>
  );
});
TooltipTrigger.displayName = "TooltipTrigger";

// â”€â”€â”€ TooltipContent â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

type TooltipContentProps = React.HTMLAttributes<HTMLDivElement> & {
  side?: Side;
  align?: Align;
  /**
   * When `true` the content is removed from the DOM entirely.
   * Used by `SidebarMenuButton` to suppress tooltips when the sidebar is open.
   */
  hidden?: boolean;
  sideOffset?: number;
};

const TooltipContent = React.forwardRef<HTMLDivElement, TooltipContentProps>(
  function TooltipContent(
    {
      children,
      className,
      side = "top",
      align = "center",
      hidden = false,
      sideOffset = 4,
      ...rest
    },
    externalRef,
  ) {
    const { uid, cancelHide, scheduleHide } = React.useContext(TooltipContext);
    const innerRef = React.useRef<HTMLDivElement | null>(null);

    const setRef = React.useCallback(
      (el: HTMLDivElement | null) => {
        innerRef.current = el;
        assignRef(externalRef, el);
      },
      [externalRef],
    );

    // Apply CSS Anchor Positioning properties imperatively.
    // Browsers that don't support anchor positioning fall back to the default
    // `popover` centering behaviour (centred in the viewport).
    // ANCHOR_CONFIGS lookup keeps cognitive complexity below the allowed ceiling.
    React.useEffect(() => {
      const el = innerRef.current;
      if (!el || typeof document === "undefined") return;
      if (!("anchorName" in document.documentElement.style)) return;

      const off = `${sideOffset}px`;
      el.style.setProperty("position", "fixed");
      el.style.setProperty("inset", "auto");
      el.style.setProperty("margin", "unset");
      el.style.setProperty("position-anchor", `--tt-${uid}`);
      el.style.setProperty("position-try-fallbacks", "flip-block flip-inline");

      const cfg = ANCHOR_CONFIGS[side][align];
      for (const [prop, val] of cfg.set) el.style.setProperty(prop, val);
      for (const prop of cfg.remove) el.style.removeProperty(prop);
      el.style.setProperty("translate", cfg.translate(off));
    }, [uid, side, align, sideOffset]);

    if (hidden) return null;

    return (
      // popover="hint" keeps the tooltip out of the auto-dismiss stack so
      // opening it won't close other popovers (e.g. dropdowns / dialogs).
      <div
        ref={setRef}
        id={`tt-${uid}`}
        popover="hint"
        role="tooltip"
        className={cn("tt-content", className)}
        onPointerEnter={cancelHide}
        onPointerLeave={scheduleHide}
        {...rest}
      >
        {children}
      </div>
    );
  },
);
TooltipContent.displayName = "TooltipContent";

export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger };

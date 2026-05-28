"use client";

export type Tab = {
  id: string;
  label: string;
  count?: number;
};

type TabBarProps = Readonly<{
  tabs: Tab[];
  value: string;
  onChange: (id: string) => void;
  /** Accessible name for the tablist. */
  label?: string;
}>;

/**
 * Tab bar with a sliding pill highlight that tracks the active tab.
 *
 * Primary: CSS Anchor Positioning — the `::before` pseudo-element on `.tab-bar`
 * is tethered to the active `<li>` via `anchor-name: --tab-active` and animates
 * smoothly on tab change.
 *
 * Fallback: when anchor positioning is unsupported the active button receives a
 * direct background (see `.tab-bar` styles in globals.css).
 */
export function TabBar({ tabs, value, onChange, label = "Tabs" }: TabBarProps) {
  return (
    <div role="tablist" aria-label={label} className="tab-bar">
      {tabs.map((tab) => (
        <div key={tab.id} data-active={String(tab.id === value)}>
          <button
            type="button"
            role="tab"
            aria-selected={tab.id === value}
            id={`tab-${tab.id}`}
            onClick={() => onChange(tab.id)}
            className="tab-bar-btn"
          >
            {tab.label}
            {tab.count != null && (
              <span className="tab-bar-count" aria-label={`${tab.count} items`}>
                {tab.count}
              </span>
            )}
          </button>
        </div>
      ))}
    </div>
  );
}

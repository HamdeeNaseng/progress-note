import type { ReactNode } from "react";

export type CardTrend = {
  direction: "up" | "down" | "neutral";
  label: string;
};

export type CardStat = {
  label: string;
  value: string | number;
};

type DashboardCardProps = Readonly<{
  /** Short label rendered in small-caps above the value. */
  label: string;
  /** Primary metric value. */
  value: string | number;
  /** Icon rendered at medium+ widths (≥ 240 px). */
  icon: ReactNode;
  /** Optional trend badge shown below the value. */
  trend?: CardTrend;
  /** Optional description revealed only at wide widths (≥ 460 px). */
  description?: string;
  /** Secondary stats rendered in the aside column at wide widths (≥ 460 px). */
  stats?: CardStat[];
}>;

const TREND_ARROW: Record<CardTrend["direction"], string> = {
  up: "↑",
  down: "↓",
  neutral: "→",
};

export function DashboardCard({
  label,
  value,
  icon,
  trend,
  description,
  stats,
}: DashboardCardProps) {
  return (
    /* .dash-card-wrap establishes the container context that @container rules measure */
    <div className="dash-card-wrap">
      <article className="dash-card">
        {/* Icon — hidden in narrow layout, shown at ≥ 240 px */}
        <div className="dash-card-icon" aria-hidden="true">
          {icon}
        </div>

        {/* Primary body: label → value → trend → description */}
        <div className="dash-card-body">
          <p className="dash-card-label">{label}</p>
          <p className="dash-card-value">{value}</p>

          {trend && (
            <span className="dash-card-trend" data-dir={trend.direction}>
              <span aria-hidden="true">{TREND_ARROW[trend.direction]}</span>
              {trend.label}
            </span>
          )}

          {description && (
            /* Only visible at wide layout (≥ 460 px) */
            <p className="dash-card-desc">{description}</p>
          )}
        </div>

        {/* Aside stats column — only rendered when stats are provided;
            only visible at wide layout (≥ 460 px) */}
        {stats && stats.length > 0 && (
          <div className="dash-card-aside" aria-label="Additional statistics">
            {stats.map((s) => (
              <div key={s.label} className="dash-card-aside-item">
                <span className="dash-card-aside-value">{s.value}</span>
                <span className="dash-card-aside-label">{s.label}</span>
              </div>
            ))}
          </div>
        )}
      </article>
    </div>
  );
}

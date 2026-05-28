import type { ReactElement, ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  milestones,
  projects,
  templateSpecs,
  type Note,
  type NoteImpact,
  type NoteState,
} from "@/data/progress-data";
import { CheckCircle2, AlertTriangle, ShieldAlert, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

const IMPACT: Record<NoteImpact, string> = {
  critical: "bg-rose-500/15 text-rose-300 border-rose-500/40",
  high: "bg-amber-500/15 text-amber-300 border-amber-500/40",
  medium: "bg-sky-500/15 text-sky-300 border-sky-500/40",
  low: "bg-muted text-muted-foreground border-border",
};

const STATE: Record<NoteState, string> = {
  draft: "bg-muted text-muted-foreground border-border",
  "in-review": "bg-violet-500/15 text-violet-300 border-violet-500/40",
  deployed: "bg-emerald-500/15 text-emerald-300 border-emerald-500/40",
  monitoring: "bg-sky-500/15 text-sky-300 border-sky-500/40",
  "rolled-back": "bg-rose-500/15 text-rose-300 border-rose-500/40",
};

export function impactBadge(impact: NoteImpact) {
  const icon = impact === "critical" ? ShieldAlert : impact === "high" ? AlertTriangle : Circle;
  const Icon = icon;
  return (
    <Badge className={cn("border gap-1 capitalize", IMPACT[impact])}>
      <Icon className="h-3 w-3" />
      {impact}
    </Badge>
  );
}

export function stateBadge(state: NoteState) {
  return <Badge className={cn("border capitalize", STATE[state])}>{state.replace("-", " ")}</Badge>;
}

// Renders quoted backtick code tokens with executive styling.
function RichText({ text }: { text: string }) {
  const parts = text.split(/(`[^`]+`)/g);
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith("`") && p.endsWith("`") ? (
          <code
            key={i}
            className="px-1.5 py-0.5 rounded bg-primary/12 text-primary font-mono text-[0.85em] border border-primary/25"
          >
            {p.slice(1, -1)}
          </code>
        ) : (
          <span key={i}>{autoTokenize(p)}</span>
        ),
      )}
    </>
  );
}

// Auto-highlights well-known technical tokens even without backticks.
const TOKEN_RE =
  /\b(Redlock|PostgreSQL|MIG|cgroup v2|Wasm|ARM64|Strategy Pattern|Event-Driven|Idempotency-Key|O\(N\^?2?\)|O\(N\)|p99|p95|GPU|MIG|zod|LaunchDarkly)\b/g;
function autoTokenize(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = TOKEN_RE.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    out.push(
      (
        <code
          key={`t${i++}`}
          className="px-1 py-0.5 rounded bg-foreground/[0.06] text-foreground font-mono text-[0.85em]"
        >
          {m[0]}
        </code>
      ) as ReactElement,
    );
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export function CEONotePreview({ note }: { note: Note }) {
  const spec = templateSpecs[note.template];
  const linked = milestones.filter((m) => note.linkedMilestones.includes(m.id));

  return (
    <Card className="bg-gradient-to-b from-card to-card/60 border-border/80">
      <div className="p-8 space-y-7">
        <div className="space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] uppercase tracking-[0.22em] text-primary">
              Executive Briefing
            </span>
            <span className="text-[10px] text-muted-foreground">· {note.date}</span>
            <div className="ml-auto flex items-center gap-2">
              {impactBadge(note.impact)}
              {stateBadge(note.state)}
            </div>
          </div>
          <h2 className="text-2xl font-semibold tracking-tight leading-tight">{note.title}</h2>
          <div className="text-xs text-muted-foreground">{spec.label}</div>
        </div>

        {note.summary.filter(Boolean).length > 0 && (
          <section>
            <SectionHead>Executive Summary</SectionHead>
            <ul className="mt-3 space-y-2">
              {note.summary.filter(Boolean).map((s, i) => (
                <li key={i} className="flex gap-3 text-[14px] leading-relaxed">
                  <CheckCircle2 className="h-4 w-4 text-primary mt-1 shrink-0" />
                  <span>
                    <RichText text={s} />
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {note.metrics && (note.metrics.baselineMs != null || note.metrics.coveragePct != null) && (
          <section className="grid grid-cols-3 gap-3">
            <MetricTile
              label="Baseline"
              value={note.metrics.baselineMs != null ? `${note.metrics.baselineMs} ms` : "—"}
            />
            <MetricTile
              label="Optimized"
              value={note.metrics.postMs != null ? `${note.metrics.postMs} ms` : "—"}
              accent
            />
            <MetricTile
              label="Test Coverage"
              value={note.metrics.coveragePct != null ? `${note.metrics.coveragePct}%` : "—"}
            />
          </section>
        )}

        {spec.sections.map((s) => {
          const value = note.fields[s.key];
          if (!value) return null;
          return (
            <section key={s.key}>
              <SectionHead>{s.label}</SectionHead>
              <p className="mt-2 text-[14px] leading-relaxed text-foreground/90">
                <RichText text={value} />
              </p>
            </section>
          );
        })}

        {note.research && (
          <section>
            <SectionHead>Research Insight</SectionHead>
            <p className="mt-2 text-[14px] leading-relaxed text-foreground/90">
              <RichText text={note.research} />
            </p>
          </section>
        )}

        {linked.length > 0 && (
          <section>
            <SectionHead>Roadmap Items</SectionHead>
            <ul className="mt-2 space-y-1.5">
              {linked.map((m) => {
                const proj = projects.find((p) => p.id === m.projectId)?.name;
                const done = m.status === "done" || m.progress >= 100;
                return (
                  <li key={m.id} className="flex items-center gap-3 text-sm">
                    <span
                      className={cn(
                        "h-4 w-4 rounded border grid place-items-center",
                        done
                          ? "bg-primary border-primary text-primary-foreground"
                          : "border-border",
                      )}
                    >
                      {done && <CheckCircle2 className="h-3 w-3" />}
                    </span>
                    <span className="font-medium">{m.title}</span>
                    <span className="text-xs text-muted-foreground">
                      · {proj} · {m.progress}%
                    </span>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        {note.skills.length > 0 && (
          <section>
            <SectionHead>Technical Vectors Applied</SectionHead>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {note.skills.map((s) => (
                <span
                  key={s}
                  className="text-xs rounded-full px-2.5 py-1 border border-primary/30 bg-primary/10 text-primary"
                >
                  {s}
                </span>
              ))}
            </div>
          </section>
        )}
      </div>
    </Card>
  );
}

function SectionHead({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground border-b border-border/60 pb-2">
      {children}
    </div>
  );
}

function MetricTile({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-lg border p-4",
        accent ? "border-primary/40 bg-primary/[0.06]" : "border-border bg-muted/30",
      )}
    >
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div
        className={cn(
          "mt-1 text-2xl font-semibold tabular-nums",
          accent ? "text-primary" : "text-foreground",
        )}
      >
        {value}
      </div>
    </div>
  );
}

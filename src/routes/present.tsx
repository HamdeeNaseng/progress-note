import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  focusAllocation,
  issueResolution,
  milestones,
  performanceTrend,
  projects,
  skillRadar,
  velocityData,
} from "@/data/progress-data";
import { useNotes } from "@/lib/notes-store";
import { CEONotePreview } from "@/components/note-preview";
import { X, ArrowUpRight, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/present")({ component: PresentPage });

const colors = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)"];

function PresentPage() {
  const notes = useNotes();
  const note = notes[0];
  const atRisk = milestones.filter((m) => m.status === "at-risk" || m.status === "delayed");

  const latestV = velocityData.at(-1)!;
  const prevV = velocityData.at(-2)!;
  const velChangePct = Math.round(((latestV.completed - prevV.completed) / prevV.completed) * 100);
  const velChangeStr = velChangePct >= 0 ? `+${velChangePct}%` : `${velChangePct}%`;

  const firstP99 = performanceTrend[0].p99;
  const lastP99 = performanceTrend.at(-1)!.p99;
  const latencyPct = Math.round(((firstP99 - lastP99) / firstP99) * 100);

  const latestCycle = issueResolution.at(-1)!.avgHours;

  const totalClosed = projects.reduce((s, p) => s + p.closedIssues, 0);
  const totalOpen = projects.reduce((s, p) => s + p.openIssues, 0);
  const resRate = Math.round((totalClosed / (totalClosed + totalOpen)) * 100);

  const kpiBoxes = [
    { k: velChangeStr, l: `Velocity W/W (${latestV.week})` },
    { k: `${latencyPct}%`, l: "Latency reduction" },
    { k: `${latestCycle}h`, l: "Avg. issue close" },
    { k: `${resRate}%`, l: "Issue resolution" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="fixed top-5 right-5 z-50 flex items-center gap-2">
        <button
          onClick={() => window.print()}
          className="rounded-md border border-border bg-card px-3 py-1.5 text-xs hover:bg-accent transition-colors"
        >
          Export PDF
        </button>
        <Link
          to="/"
          className="grid place-items-center h-8 w-8 rounded-md border border-border bg-card hover:bg-accent transition-colors"
        >
          <X className="h-4 w-4" />
        </Link>
      </div>

      <div className="max-w-[1100px] mx-auto px-10 py-16 space-y-12">
        <header className="text-center space-y-3 border-b border-border pb-10">
          <div className="text-[11px] uppercase tracking-[0.3em] text-primary">
            R&D Executive Briefing
          </div>
          <h1 className="text-5xl font-semibold tracking-tight">
            {latestV.week} — Engineering Pulse
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            A 90-second view of velocity, quality, and the technical bets making product faster and
            more reliable this quarter.
          </p>
        </header>

        <section className="grid grid-cols-4 gap-5">
          {kpiBoxes.map((s) => (
            <div key={s.l} className="rounded-xl border border-border p-5 bg-card">
              <div className="text-4xl font-semibold tracking-tight text-primary">{s.k}</div>
              <div className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">
                {s.l}
              </div>
            </div>
          ))}
        </section>

        <CEONotePreview note={note} />

        <section className="grid grid-cols-2 gap-5">
          <div className="rounded-xl border border-border p-6 bg-card">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">
              Sprint Velocity
            </div>
            <div className="h-[220px] mt-3">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={velocityData}>
                  <defs>
                    <linearGradient id="pv" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="week" stroke="var(--muted-foreground)" fontSize={11} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      background: "var(--popover)",
                      border: "1px solid var(--border)",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="completed"
                    stroke="var(--chart-1)"
                    strokeWidth={2}
                    fill="url(#pv)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="rounded-xl border border-border p-6 bg-card">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">
              Focus Allocation
            </div>
            <div className="h-[220px] mt-3">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={focusAllocation}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    stroke="var(--background)"
                  >
                    {focusAllocation.map((_, i) => (
                      <Cell key={i} fill={colors[i % colors.length]} />
                    ))}
                  </Pie>
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    wrapperStyle={{ fontSize: 11, color: "var(--muted-foreground)" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-2 gap-5">
          <div className="rounded-xl border border-border p-6 bg-card">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">
              Technical Growth
            </div>
            <div className="h-[260px] mt-3">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={skillRadar}>
                  <PolarGrid stroke="var(--border)" />
                  <PolarAngleAxis
                    dataKey="skill"
                    tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                  />
                  <Radar
                    name="Q2"
                    dataKey="q2"
                    stroke="var(--chart-1)"
                    fill="var(--chart-1)"
                    fillOpacity={0.4}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="rounded-xl border border-border p-6 bg-card">
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-4">
              Attention Needed
            </div>
            <ul className="space-y-3">
              {atRisk.map((m) => (
                <li key={m.id} className="flex items-start gap-3">
                  <AlertTriangle className="h-4 w-4 text-amber-400 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium">{m.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {projects.find((p) => p.id === m.projectId)?.name} · {m.progress}% · due{" "}
                      {new Date(m.dueDate).toLocaleDateString()}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <footer className="text-center text-xs text-muted-foreground pt-6 flex items-center justify-center gap-1">
          rd-agent-imed-transform · Prepared for executive review
          <ArrowUpRight className="h-3 w-3" />
        </footer>
      </div>
    </div>
  );
}

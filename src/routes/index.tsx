import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Activity, CheckCircle2, GitCommit, GitPullRequest, TrendingUp, Zap } from "lucide-react";
import {
  focusAllocation,
  issueResolution,
  milestones,
  projects,
  velocityData,
} from "@/data/progress-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({ component: DashboardPage });

const chartColors = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)"];

function statusBadge(status: string) {
  const map: Record<string, string> = {
    "on-track": "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    "at-risk": "bg-amber-500/15 text-amber-400 border-amber-500/30",
    delayed: "bg-rose-500/15 text-rose-400 border-rose-500/30",
    done: "bg-sky-500/15 text-sky-400 border-sky-500/30",
  };
  const label: Record<string, string> = {
    "on-track": "On Track",
    "at-risk": "At Risk",
    delayed: "Delayed",
    done: "Done",
  };
  return (
    <Badge variant="outline" className={cn("border", map[status])}>
      {label[status] ?? status}
    </Badge>
  );
}

function DashboardPage() {
  const totalOpen = projects.reduce((s, p) => s + p.openIssues, 0);
  const totalClosed = projects.reduce((s, p) => s + p.closedIssues, 0);
  const resolutionRate = Math.round((totalClosed / (totalClosed + totalOpen)) * 100);

  const latestV = velocityData[velocityData.length - 1];
  const prevV = velocityData[velocityData.length - 2];
  const velChangePct = Math.round(((latestV.completed - prevV.completed) / prevV.completed) * 100);
  const velChangeStr = velChangePct >= 0 ? `+${velChangePct}%` : `${velChangePct}%`;

  const latestCycle = issueResolution[issueResolution.length - 1].avgHours;
  const firstCycle = issueResolution[0].avgHours;
  const cycleReduction = Math.round(((firstCycle - latestCycle) / firstCycle) * 100);

  const kpis = [
    {
      label: `Velocity (${latestV.week})`,
      value: String(latestV.completed),
      sub: `${velChangeStr} vs. ${prevV.week}`,
      icon: Zap,
      tone: "text-emerald-400",
    },
    {
      label: "Issue Resolution",
      value: `${resolutionRate}%`,
      sub: `${totalClosed} closed / ${totalOpen} open`,
      icon: CheckCircle2,
      tone: "text-sky-400",
    },
    {
      label: "Avg. Cycle Time",
      value: `${latestCycle}h`,
      sub: `-${cycleReduction}% over ${issueResolution.length - 1} weeks`,
      icon: Activity,
      tone: "text-primary",
    },
    {
      label: "Active Milestones",
      value: String(milestones.filter((m) => m.status !== "done").length),
      sub: `${milestones.filter((m) => m.status === "at-risk").length} at risk`,
      icon: TrendingUp,
      tone: "text-amber-400",
    },
  ];

  return (
    <div className="p-8 max-w-[1400px] mx-auto space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
            R&D Executive Pulse
          </p>
          <h1 className="text-3xl font-semibold tracking-tight mt-1">Engineering Overview</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Week {latestV.week} · 2026 — focused, data-backed view of velocity, quality, and growth.
          </p>
        </div>
        <Link
          to="/present"
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Open CEO Presentation →
        </Link>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k) => {
          const Icon = k.icon;
          return (
            <Card key={k.label} className="bg-gradient-to-b from-card to-card/60">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">
                    {k.label}
                  </div>
                  <Icon className={cn("h-4 w-4", k.tone)} />
                </div>
                <div className="mt-3 text-3xl font-semibold tracking-tight">{k.value}</div>
                <div className="mt-1 text-xs text-muted-foreground">{k.sub}</div>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Sprint Velocity</CardTitle>
            <CardDescription>Planned vs. completed story points (7 weeks)</CardDescription>
          </CardHeader>
          <CardContent className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={velocityData}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--chart-2)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--chart-2)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--border)" vertical={false} />
                <XAxis dataKey="week" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} />
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
                  dataKey="planned"
                  stroke="var(--chart-2)"
                  strokeWidth={2}
                  fill="url(#g2)"
                />
                <Area
                  type="monotone"
                  dataKey="completed"
                  stroke="var(--chart-1)"
                  strokeWidth={2}
                  fill="url(#g1)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>R&D Focus Allocation</CardTitle>
            <CardDescription>Where the week was spent</CardDescription>
          </CardHeader>
          <CardContent className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={focusAllocation}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  stroke="var(--background)"
                >
                  {focusAllocation.map((_, i) => (
                    <Cell key={i} fill={chartColors[i % chartColors.length]} />
                  ))}
                </Pie>
                <Legend
                  verticalAlign="bottom"
                  iconType="circle"
                  wrapperStyle={{ fontSize: 12, color: "var(--muted-foreground)" }}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Active Milestones</CardTitle>
              <CardDescription>Across {projects.length} repositories</CardDescription>
            </div>
            <Link to="/git" className="text-xs text-primary hover:underline">
              View all →
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {milestones.map((m) => {
              const project = projects.find((p) => p.id === m.projectId);
              return (
                <div key={m.id} className="space-y-1.5">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <div className="min-w-0">
                      <div className="truncate font-medium">{m.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {project?.name} · due {new Date(m.dueDate).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {statusBadge(m.status)}
                      <span className="text-xs tabular-nums text-muted-foreground w-9 text-right">
                        {m.progress}%
                      </span>
                    </div>
                  </div>
                  <Progress value={m.progress} className="h-1.5" />
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Issue Resolution Trend</CardTitle>
            <CardDescription>Avg. hours to close</CardDescription>
          </CardHeader>
          <CardContent className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={issueResolution}>
                <CartesianGrid stroke="var(--border)" vertical={false} />
                <XAxis dataKey="week" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="avgHours"
                  stroke="var(--chart-1)"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: "var(--chart-1)" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {projects.map((p) => (
          <Card key={p.id} className="hover:border-primary/40 transition-colors">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="uppercase text-[10px] tracking-wider">
                  {p.platform}
                </Badge>
                <span className="text-xs text-muted-foreground">{p.org}</span>
              </div>
              <CardTitle className="mt-2 text-base">{p.name}</CardTitle>
              <CardDescription>{p.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3 text-sm">
                <Stat icon={GitPullRequest} label="Open" value={p.openIssues} />
                <Stat icon={CheckCircle2} label="Closed" value={p.closedIssues} />
                <Stat icon={GitCommit} label="Branches" value={p.branches} />
              </div>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-md bg-muted/40 px-2.5 py-2">
      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Icon className="h-3 w-3" />
        {label}
      </div>
      <div className="mt-1 text-base font-semibold tabular-nums">{value}</div>
    </div>
  );
}

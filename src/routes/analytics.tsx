import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
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
  ComposedChart,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";
import {
  commitActivity,
  focusAllocation,
  issueResolution,
  performanceTrend,
  velocityData,
} from "@/data/progress-data";
import { usePerformanceSeries } from "@/lib/notes-store";

export const Route = createFileRoute("/analytics")({ component: AnalyticsPage });

const colors = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)"];

const totalPlanned = velocityData.reduce((s, v) => s + v.planned, 0);
const burndown = velocityData.map((v, i, arr) => ({
  week: v.week,
  remaining: totalPlanned - arr.slice(0, i + 1).reduce((s, x) => s + x.completed, 0),
  ideal: totalPlanned - ((i + 1) * totalPlanned) / arr.length,
}));

function AnalyticsPage() {
  const noteSeries = usePerformanceSeries();
  const blended = performanceTrend.map((p) => ({
    label: p.week,
    p99: p.p99,
    coverage: p.coverage,
  }));
  noteSeries.forEach((n) => {
    blended.push({ label: n.label, p99: n.optimized, coverage: n.coverage });
  });
  const qualityVector = [
    { axis: "Latency", value: 92 },
    {
      axis: "Coverage",
      value: noteSeries.length
        ? Math.round(noteSeries.reduce((s, n) => s + n.coverage, 0) / noteSeries.length)
        : 85,
    },
    { axis: "Reliability", value: 88 },
    { axis: "Throughput", value: 81 },
    { axis: "Security", value: 78 },
    { axis: "Maintainability", value: 84 },
  ];
  return (
    <div className="p-8 max-w-[1400px] mx-auto space-y-6">
      <header>
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Analytics</p>
        <h1 className="text-3xl font-semibold tracking-tight mt-1">Data Science Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Quantitative view of engineering output, focus, and quality signals. Performance metrics
          stream directly from Progress Notes.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard
          title="System Performance Improvement Trendline"
          description="p99 latency (ms) — lower is better · sourced from performance notes"
        >
          <ComposedChart data={blended}>
            <defs>
              <linearGradient id="pl" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.45} />
                <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="var(--border)" vertical={false} />
            <XAxis dataKey="label" stroke="var(--muted-foreground)" fontSize={11} />
            <YAxis stroke="var(--muted-foreground)" fontSize={11} />
            <Tip />
            <Area
              type="monotone"
              dataKey="p99"
              stroke="var(--chart-1)"
              strokeWidth={2}
              fill="url(#pl)"
            />
            <Line
              type="monotone"
              dataKey="coverage"
              stroke="var(--chart-3)"
              strokeWidth={2}
              dot={{ r: 2 }}
            />
          </ComposedChart>
        </ChartCard>

        <ChartCard
          title="Code Quality Vector"
          description="Composite engineering quality signals · auto-updates from notes"
        >
          <RadarChart data={qualityVector}>
            <PolarGrid stroke="var(--border)" />
            <PolarAngleAxis
              dataKey="axis"
              tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
            />
            <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
            <Radar
              dataKey="value"
              stroke="var(--chart-2)"
              fill="var(--chart-2)"
              fillOpacity={0.35}
            />
            <Tip />
          </RadarChart>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Sprint Burndown" description="Story points remaining vs. ideal">
          <AreaChart data={burndown}>
            <defs>
              <linearGradient id="bd" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.45} />
                <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="var(--border)" vertical={false} />
            <XAxis dataKey="week" stroke="var(--muted-foreground)" fontSize={12} />
            <YAxis stroke="var(--muted-foreground)" fontSize={12} />
            <Tip />
            <Area
              type="monotone"
              dataKey="remaining"
              stroke="var(--chart-1)"
              strokeWidth={2}
              fill="url(#bd)"
            />
            <Line
              type="monotone"
              dataKey="ideal"
              stroke="var(--muted-foreground)"
              strokeDasharray="4 4"
              dot={false}
            />
          </AreaChart>
        </ChartCard>

        <ChartCard title="Issue Resolution Rate" description="Avg. hours-to-close trend">
          <LineChart data={issueResolution}>
            <CartesianGrid stroke="var(--border)" vertical={false} />
            <XAxis dataKey="week" stroke="var(--muted-foreground)" fontSize={12} />
            <YAxis stroke="var(--muted-foreground)" fontSize={12} />
            <Tip />
            <Line
              type="monotone"
              dataKey="avgHours"
              stroke="var(--chart-2)"
              strokeWidth={2.5}
              dot={{ r: 3 }}
            />
          </LineChart>
        </ChartCard>

        <ChartCard title="R&D Focus Allocation" description="Time/effort split (W24)">
          <PieChart>
            <Pie
              data={focusAllocation}
              dataKey="value"
              nameKey="name"
              innerRadius={60}
              outerRadius={95}
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
              wrapperStyle={{ fontSize: 12, color: "var(--muted-foreground)" }}
            />
            <Tip />
          </PieChart>
        </ChartCard>

        <ChartCard title="Commit Cadence" description="Daily commits, last 28 days">
          <BarChart data={commitActivity}>
            <CartesianGrid stroke="var(--border)" vertical={false} />
            <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={11} />
            <YAxis stroke="var(--muted-foreground)" fontSize={11} />
            <Tip />
            <Bar dataKey="commits" fill="var(--chart-3)" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ChartCard>
      </div>
    </div>
  );
}

function Tip() {
  return (
    <Tooltip
      contentStyle={{
        background: "var(--popover)",
        border: "1px solid var(--border)",
        borderRadius: 8,
        fontSize: 12,
      }}
    />
  );
}

function ChartCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactElement;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { commitActivity, milestones, projects } from "@/data/progress-data";
import { GitBranch, GitMerge, Github, Gitlab, Star } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/git")({ component: GitPage });

function statusTone(s: string) {
  return {
    "on-track": "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    "at-risk": "bg-amber-500/15 text-amber-400 border-amber-500/30",
    delayed: "bg-rose-500/15 text-rose-400 border-rose-500/30",
    done: "bg-sky-500/15 text-sky-400 border-sky-500/30",
  }[s];
}

function GitPage() {
  return (
    <div className="p-8 max-w-[1400px] mx-auto space-y-6">
      <header>
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Git Sync</p>
        <h1 className="text-3xl font-semibold tracking-tight mt-1">Repositories & Milestones</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Live mirror of GitHub & GitLab — issues, milestones and commit activity.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Commit Activity</CardTitle>
          <CardDescription>Last 28 days, across all repositories</CardDescription>
        </CardHeader>
        <CardContent className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={commitActivity}>
              <CartesianGrid stroke="var(--border)" vertical={false} />
              <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={11} />
              <YAxis stroke="var(--muted-foreground)" fontSize={11} />
              <Tooltip
                contentStyle={{
                  background: "var(--popover)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Bar dataKey="commits" fill="var(--chart-1)" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {projects.map((p) => {
          const projMilestones = milestones.filter((m) => m.projectId === p.id);
          const Logo = p.platform === "github" ? Github : Gitlab;
          return (
            <Card key={p.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Logo className="h-4 w-4" />
                    <Badge variant="outline" className="uppercase text-[10px] tracking-wider">
                      {p.platform}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Star className="h-3 w-3" /> {p.stars}
                  </div>
                </div>
                <CardTitle className="mt-2 text-base">{p.name}</CardTitle>
                <CardDescription>{p.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <Pill label="Open" value={p.openIssues} />
                  <Pill label="Closed" value={p.closedIssues} />
                  <Pill label="Branches" value={p.branches} icon={GitBranch} />
                </div>
                <div className="space-y-2.5 pt-1">
                  {projMilestones.map((m) => (
                    <div key={m.id}>
                      <div className="flex items-center justify-between text-xs">
                        <span className="truncate flex items-center gap-1.5">
                          <GitMerge className="h-3 w-3 text-muted-foreground" />
                          {m.title}
                        </span>
                        <span
                          className={cn(
                            "rounded-full border px-2 py-[1px] text-[10px]",
                            statusTone(m.status),
                          )}
                        >
                          {m.progress}%
                        </span>
                      </div>
                      <Progress value={m.progress} className="h-1 mt-1" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </section>
    </div>
  );
}

function Pill({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-md bg-muted/40 px-2 py-1.5">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1">
        {Icon ? <Icon className="h-2.5 w-2.5" /> : null}
        {label}
      </div>
      <div className="text-sm font-semibold tabular-nums">{value}</div>
    </div>
  );
}

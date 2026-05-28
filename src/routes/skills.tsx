import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { proficiencies, skillRadar } from "@/data/progress-data";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/skills")({ component: SkillsPage });

function SkillsPage() {
  const grouped = proficiencies.reduce<Record<string, typeof proficiencies>>((acc, p) => {
    (acc[p.category] ||= []).push(p);
    return acc;
  }, {});

  return (
    <div className="p-8 max-w-[1400px] mx-auto space-y-6">
      <header>
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Skill Matrix</p>
        <h1 className="text-3xl font-semibold tracking-tight mt-1">Technical Growth Curve</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Quarter-over-quarter proficiency expansion across core engineering domains.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Proficiency Radar</CardTitle>
            <CardDescription>Q1 → Q2 2026</CardDescription>
          </CardHeader>
          <CardContent className="h-[360px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={skillRadar}>
                <PolarGrid stroke="var(--border)" />
                <PolarAngleAxis
                  dataKey="skill"
                  tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                />
                <PolarRadiusAxis
                  angle={30}
                  domain={[0, 10]}
                  tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
                  stroke="var(--border)"
                />
                <Radar
                  name="Q1"
                  dataKey="q1"
                  stroke="var(--chart-2)"
                  fill="var(--chart-2)"
                  fillOpacity={0.18}
                />
                <Radar
                  name="Q2"
                  dataKey="q2"
                  stroke="var(--chart-1)"
                  fill="var(--chart-1)"
                  fillOpacity={0.35}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Proficiencies</CardTitle>
            <CardDescription>By demonstrated level (0–10)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {Object.entries(grouped).map(([cat, items]) => (
              <div key={cat}>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">
                    {cat}
                  </div>
                  <Badge variant="secondary" className="text-[10px]">
                    {items.length} skills
                  </Badge>
                </div>
                <div className="space-y-2.5">
                  {items
                    .sort((a, b) => b.level - a.level)
                    .map((p) => (
                      <div key={p.skill}>
                        <div className="flex justify-between text-sm">
                          <span>{p.skill}</span>
                          <span className="tabular-nums text-muted-foreground">{p.level}/10</span>
                        </div>
                        <Progress value={p.level * 10} className="h-1.5 mt-1" />
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  milestones,
  projects,
  skillBank,
  templateSpecs,
  type Note,
  type NoteImpact,
  type NoteState,
  type NoteTemplate,
} from "@/data/progress-data";
import { notesStore, useNotes } from "@/lib/notes-store";
import {
  FileText,
  Link2,
  Plus,
  Sparkles,
  Wand2,
  ShieldCheck,
  Lightbulb,
  Gauge,
  ArrowRight,
} from "lucide-react";
import { impactBadge, stateBadge, CEONotePreview } from "@/components/note-preview";

export const Route = createFileRoute("/notes")({ component: NotesPage });

const templateChoices: { value: NoteTemplate; label: string }[] = [
  { value: "feature", label: "Core Feature / Architecture" },
  { value: "performance", label: "Performance Optimization" },
  { value: "incident", label: "Incident & Hotfix" },
];

function NotesPage() {
  const notes = useNotes();
  const [activeId, setActiveId] = useState(notes[0]?.id);
  const active = notes.find((n) => n.id === activeId) ?? notes[0];

  const update = (patch: Partial<Note>) => notesStore.update(active.id, patch);
  const setField = (key: string, value: string) =>
    update({ fields: { ...active.fields, [key]: value } });
  const setMetric = (key: "baselineMs" | "postMs" | "coveragePct", value: string) => {
    const n = value === "" ? undefined : Number(value);
    update({ metrics: { ...active.metrics, [key]: Number.isFinite(n!) ? n : undefined } });
  };

  const toggleSkill = (skill: string) => {
    const has = active.skills.includes(skill);
    update({ skills: has ? active.skills.filter((s) => s !== skill) : [...active.skills, skill] });
  };

  const toggleMilestone = (id: string) => {
    const has = active.linkedMilestones.includes(id);
    update({
      linkedMilestones: has
        ? active.linkedMilestones.filter((m) => m !== id)
        : [...active.linkedMilestones, id],
    });
  };

  const spec = templateSpecs[active.template];

  return (
    <div className="p-8 max-w-[1600px] mx-auto">
      <header className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Expert Progress Note Engine
          </p>
          <h1 className="text-3xl font-semibold tracking-tight mt-1">Structured Note Builder</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Templates enforce precision · live CEO preview · metrics flow into Analytics.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select
            onValueChange={(v) => {
              const id = notesStore.add(v as NoteTemplate);
              setActiveId(id);
            }}
          >
            <SelectTrigger className="w-[230px]">
              <Plus className="h-4 w-4 mr-1" />
              <SelectValue placeholder="New from template…" />
            </SelectTrigger>
            <SelectContent>
              {templateChoices.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-[240px_1fr_360px] gap-5">
        {/* LEFT: notes list */}
        <Card className="h-fit">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">All Notes</CardTitle>
          </CardHeader>
          <CardContent className="p-2">
            <ScrollArea className="max-h-[70vh]">
              <ul className="space-y-1">
                {notes.map((n) => (
                  <li key={n.id}>
                    <button
                      onClick={() => setActiveId(n.id)}
                      className={`w-full text-left rounded-md px-3 py-2 transition-colors ${
                        n.id === active.id
                          ? "bg-accent text-accent-foreground"
                          : "hover:bg-accent/50"
                      }`}
                    >
                      <div className="text-sm font-medium truncate flex items-center gap-2">
                        <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                        {n.title}
                      </div>
                      <div className="text-[11px] text-muted-foreground ml-5 flex items-center gap-1.5 mt-0.5">
                        <span>{n.date}</span>
                        <span>·</span>
                        <span className="capitalize">{n.template}</span>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* CENTER: editor + preview tabs */}
        <Tabs defaultValue="editor" className="space-y-4">
          <TabsList>
            <TabsTrigger value="editor">
              <Wand2 className="h-3.5 w-3.5 mr-1.5" />
              Editor
            </TabsTrigger>
            <TabsTrigger value="preview">
              <Sparkles className="h-3.5 w-3.5 mr-1.5" />
              CEO Preview
            </TabsTrigger>
          </TabsList>

          <TabsContent value="editor" className="space-y-4 mt-0">
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-1">
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                      Title
                    </Label>
                    <Input
                      value={active.title}
                      onChange={(e) => update({ title: e.target.value })}
                      className="text-lg font-semibold h-11"
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-5">
                    {impactBadge(active.impact)}
                    {stateBadge(active.state)}
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <FieldShell label="Date">
                    <Input
                      type="date"
                      value={active.date}
                      onChange={(e) => update({ date: e.target.value })}
                    />
                  </FieldShell>
                  <FieldShell label="Template">
                    <Select
                      value={active.template}
                      onValueChange={(v) => update({ template: v as NoteTemplate })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {templateChoices.map((t) => (
                          <SelectItem key={t.value} value={t.value}>
                            {t.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FieldShell>
                  <FieldShell label="Impact">
                    <Select
                      value={active.impact}
                      onValueChange={(v) => update({ impact: v as NoteImpact })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(["critical", "high", "medium", "low"] as NoteImpact[]).map((i) => (
                          <SelectItem key={i} value={i} className="capitalize">
                            {i}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FieldShell>
                  <FieldShell label="System State">
                    <Select
                      value={active.state}
                      onValueChange={(v) => update({ state: v as NoteState })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(
                          [
                            "draft",
                            "in-review",
                            "deployed",
                            "monitoring",
                            "rolled-back",
                          ] as NoteState[]
                        ).map((s) => (
                          <SelectItem key={s} value={s} className="capitalize">
                            {s.replace("-", " ")}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FieldShell>
                </div>
                <div className="rounded-md bg-muted/40 border border-border/60 p-3 text-xs text-muted-foreground flex items-start gap-2">
                  <Lightbulb className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                  <span>
                    <span className="font-medium text-foreground">{spec.label}</span> — {spec.blurb}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Executive Summary
                </CardTitle>
                <CardDescription>
                  ≤ 12 words each. Lead with the metric or the system change, not the activity.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {active.summary.map((s, i) => (
                  <div key={i} className="flex gap-2">
                    <span className="text-primary mt-2">•</span>
                    <Input
                      value={s}
                      onChange={(e) =>
                        update({
                          summary: active.summary.map((x, j) => (i === j ? e.target.value : x)),
                        })
                      }
                      placeholder="e.g. p99 inference latency 184ms → 114ms via adaptive batching"
                    />
                  </div>
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => update({ summary: [...active.summary, ""] })}
                >
                  <Plus className="h-3.5 w-3.5" /> Add bullet
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">{spec.label} — Structured Fields</CardTitle>
                <CardDescription>
                  Each section maps directly to a heading in the CEO preview.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {spec.sections.map((s) => (
                  <div key={s.key} className="space-y-1.5">
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                      {s.label}
                    </Label>
                    <Textarea
                      rows={s.rows ?? 2}
                      placeholder={s.placeholder}
                      value={active.fields[s.key] ?? ""}
                      onChange={(e) => setField(s.key, e.target.value)}
                      className="resize-none text-sm leading-relaxed"
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            {active.template === "performance" && (
              <Card className="border-primary/30 bg-primary/[0.03]">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Gauge className="h-4 w-4 text-primary" />
                    Parsable Performance Metrics
                  </CardTitle>
                  <CardDescription>
                    Auto-syncs into the Analytics performance trendline and Code Quality Vector.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-3 gap-3">
                  <FieldShell label="Baseline (ms)">
                    <Input
                      type="number"
                      placeholder="120"
                      value={active.metrics?.baselineMs ?? ""}
                      onChange={(e) => setMetric("baselineMs", e.target.value)}
                    />
                  </FieldShell>
                  <FieldShell label="Post-Opt (ms)">
                    <Input
                      type="number"
                      placeholder="70"
                      value={active.metrics?.postMs ?? ""}
                      onChange={(e) => setMetric("postMs", e.target.value)}
                    />
                  </FieldShell>
                  <FieldShell label="Test Coverage (%)">
                    <Input
                      type="number"
                      placeholder="92"
                      value={active.metrics?.coveragePct ?? ""}
                      onChange={(e) => setMetric("coveragePct", e.target.value)}
                    />
                  </FieldShell>
                  {active.metrics?.baselineMs != null && active.metrics?.postMs != null && (
                    <div className="col-span-3 text-xs text-muted-foreground">
                      Δ ={" "}
                      <span className="text-primary font-semibold tabular-nums">
                        {Math.round(
                          ((active.metrics.baselineMs - active.metrics.postMs) /
                            active.metrics.baselineMs) *
                            100,
                        )}
                        %
                      </span>{" "}
                      latency reduction
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Research & R&D Insights</CardTitle>
                <CardDescription>What was discovered, tested, or validated.</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={active.research}
                  onChange={(e) => update({ research: e.target.value })}
                  rows={5}
                  className="resize-none text-sm leading-relaxed"
                />
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Link2 className="h-4 w-4 text-primary" />
                    Linked Git Milestones
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {milestones.map((m) => {
                    const proj = projects.find((p) => p.id === m.projectId)?.name;
                    return (
                      <label
                        key={m.id}
                        className="flex items-start gap-3 p-2.5 rounded-md hover:bg-accent/40 cursor-pointer"
                      >
                        <Checkbox
                          checked={active.linkedMilestones.includes(m.id)}
                          onCheckedChange={() => toggleMilestone(m.id)}
                        />
                        <div className="min-w-0">
                          <div className="text-sm font-medium truncate">{m.title}</div>
                          <div className="text-[11px] text-muted-foreground">
                            {proj} · {m.progress}%
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Technical Proficiency</CardTitle>
                  <CardDescription>Tag expert-level concepts applied.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {skillBank.map((group) => (
                    <div key={group.category}>
                      <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">
                        {group.category}
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {group.skills.map((s) => {
                          const on = active.skills.includes(s);
                          return (
                            <button
                              key={s}
                              onClick={() => toggleSkill(s)}
                              className={`text-xs rounded-full px-2.5 py-1 border transition-colors ${
                                on
                                  ? "bg-primary/15 text-primary border-primary/40"
                                  : "border-border text-muted-foreground hover:bg-accent/40"
                              }`}
                            >
                              {s}
                            </button>
                          );
                        })}
                      </div>
                      <Separator className="mt-3" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="preview" className="mt-0">
            <CEONotePreview note={active} />
          </TabsContent>
        </Tabs>

        {/* RIGHT: expert language guide */}
        <ExpertGuide />
      </div>
    </div>
  );
}

function FieldShell({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

const guardrails: { junior: string; expert: string }[] = [
  {
    junior: "แก้ compile error แล้ว",
    expert:
      "Resolved OutOfMemoryError (GC overhead) in :persistence:compileJava by enabling options.fork=true + forkOptions.jvmArgs=['-Xmx2g']; BUILD SUCCESSFUL confirmed in poc_doctor.",
  },
  {
    junior: "ทำให้ pipeline เร็วขึ้น",
    expert:
      "Reduced LangGraph fix-loop p99 5 200 ms → 2 900 ms (−44%) by routing reviewer and fix_agent nodes in parallel via Send(); validated across 5 poc_dental iterations.",
  },
  {
    junior: "ย้าย EJB เสร็จแล้ว",
    expert:
      "Migrated MedEJBBean CMP entity → Spring Data JPA @Entity + JpaRepository<Med, Long>; eliminated 14 JNDI lookup references and removed ejb-jar.xml descriptor.",
  },
  {
    junior: "เพิ่ม tracing เข้าไป",
    expert:
      "Instrumented LangGraph pipeline with OTel OTLP HTTP exporter; fan-out to Phoenix session spans and ELK APM Server — agent execution p99 now queryable per run_id in Kibana.",
  },
];

function ExpertGuide() {
  const [draft, setDraft] = useState("");
  const translated = useMemo(() => translateToExpert(draft), [draft]);

  return (
    <div className="space-y-4 xl:sticky xl:top-6 xl:self-start">
      <Card className="border-primary/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" />
            Expert Language Guide
          </CardTitle>
          <CardDescription className="text-xs">
            Two non-negotiables for executive-grade notes.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-xs">
          <Principle
            title="Precision over vagueness"
            body="Name the system, the pattern, the data structure. Avoid &ldquo;stuff,&rdquo; &ldquo;things,&rdquo; &ldquo;made better.&rdquo;"
          />
          <Principle
            title="Quantifiable metrics"
            body="Every claim ships with a number — % delta, latency in ms, memory in MB, coverage %."
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Junior → Expert</CardTitle>
          <CardDescription className="text-xs">Live phrasing reference.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {guardrails.map((g) => (
            <div key={g.junior} className="space-y-1.5 text-xs">
              <div className="flex items-start gap-2 text-muted-foreground">
                <span className="text-rose-400 font-semibold">JR</span>
                <span className="italic">&ldquo;{g.junior}&rdquo;</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-emerald-400 font-semibold">EX</span>
                <span className="text-foreground/90 leading-relaxed">{g.expert}</span>
              </div>
              <Separator />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-primary/30 bg-primary/[0.03]">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Wand2 className="h-4 w-4 text-primary" />
            Translate Junior → Expert
          </CardTitle>
          <CardDescription className="text-xs">
            Paste a rough thought. Get a structural template back.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="e.g. ย้าย EJBBean ไป JPA แล้ว compile ผ่าน"
            rows={3}
            className="text-xs resize-none"
          />
          {translated && (
            <div className="rounded-md border border-primary/30 bg-background p-3 text-xs leading-relaxed">
              <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-primary mb-2">
                <ArrowRight className="h-3 w-3" /> Expert structure
              </div>
              <pre className="whitespace-pre-wrap font-mono text-[11px]">{translated}</pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Principle({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-md border border-border/60 bg-muted/30 p-3">
      <div className="text-xs font-semibold text-foreground">{title}</div>
      <div
        className="text-[11px] text-muted-foreground mt-1 leading-relaxed"
        dangerouslySetInnerHTML={{ __html: body }}
      />
    </div>
  );
}

function translateToExpert(input: string): string {
  const t = input.trim();
  if (!t) return "";
  return [
    `Problem    → ${t.split(/[.;]/)[0] || t} (quantify: % / ms / MB)`,
    `Approach   → name the pattern (Strategy / Event-Driven / Redlock / Composite Index)`,
    `Mechanism  → O(?) complexity, data structure, or contract change`,
    `Result     → before → after with delta and unit`,
    `Risk       → trade-off + mitigation + rollback trigger`,
  ].join("\n");
}

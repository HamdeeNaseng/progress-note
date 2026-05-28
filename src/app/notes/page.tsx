"use client";

import { useMemo, useState } from "react";
import {
  milestones,
  skillBank,
  templateSpecs,
  type Note,
  type NoteTemplate,
} from "@/data/progress-data";
import { notesStore, useNotes } from "@/lib/notes-store";

const templateChoices: Array<{ value: NoteTemplate; label: string }> = [
  { value: "feature", label: "Feature / Architecture" },
  { value: "performance", label: "Performance" },
  { value: "incident", label: "Incident / Hotfix" },
];

export default function NotesCrudPage() {
  const notes = useNotes();
  const [activeId, setActiveId] = useState(notes[0]?.id ?? "");
  const active = useMemo(() => notes.find((n) => n.id === activeId) ?? notes[0], [activeId, notes]);

  if (!active) {
    return (
      <div className="p-8">
        <p className="text-sm text-muted-foreground">No notes available.</p>
      </div>
    );
  }

  const update = (patch: Partial<Note>) => notesStore.update(active.id, patch);
  const setField = (key: string, value: string) => update({ fields: { ...active.fields, [key]: value } });
  const setMetric = (key: "baselineMs" | "postMs" | "coveragePct", value: string) => {
    const parsed = value === "" ? undefined : Number(value);
    update({ metrics: { ...active.metrics, [key]: Number.isFinite(parsed) ? parsed : undefined } });
  };

  const allSkills = skillBank.flatMap((s) => s.skills);

  return (
    <div className="p-6 md:p-8 max-w-[1500px] mx-auto space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Progress Notes</p>
          <h1 className="text-3xl font-semibold tracking-tight">Notes CRUD</h1>
          <p className="text-sm text-muted-foreground mt-1">Create, read, update, and delete structured engineering progress notes.</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            className="h-10 rounded-md border border-border bg-background px-3 text-sm"
            defaultValue=""
            onChange={(e) => {
              const template = e.target.value as NoteTemplate;
              if (!template) {
                return;
              }
              const id = notesStore.add(template);
              setActiveId(id);
              e.currentTarget.value = "";
            }}
          >
            <option value="" disabled>
              New note from template
            </option>
            {templateChoices.map((choice) => (
              <option key={choice.value} value={choice.value}>
                {choice.label}
              </option>
            ))}
          </select>
          <button
            onClick={() => {
              notesStore.remove(active.id);
              const next = notesStore.get()[0];
              setActiveId(next?.id ?? "");
            }}
            className="h-10 rounded-md border border-rose-300 bg-rose-50 px-3 text-sm text-rose-700 hover:bg-rose-100"
          >
            Delete
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-[280px_1fr] gap-5">
        <aside className="rounded-lg border border-border bg-card p-3 h-fit">
          <h2 className="px-2 py-1 text-xs uppercase tracking-wider text-muted-foreground">All Notes</h2>
          <ul className="mt-1 space-y-1">
            {notes.map((note) => (
              <li key={note.id}>
                <button
                  onClick={() => setActiveId(note.id)}
                  className={`w-full rounded-md px-3 py-2 text-left transition-colors ${
                    note.id === active.id ? "bg-primary text-primary-foreground" : "hover:bg-accent"
                  }`}
                >
                  <p className="truncate text-sm font-medium">{note.title}</p>
                  <p className={`text-xs ${note.id === active.id ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                    {note.date} · {note.template}
                  </p>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <section className="space-y-5">
          <article className="rounded-lg border border-border bg-card p-5 space-y-4">
            <h2 className="text-base font-semibold">Core Fields</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <LabeledField label="Title">
                <input
                  className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
                  value={active.title}
                  onChange={(e) => update({ title: e.target.value })}
                />
              </LabeledField>
              <LabeledField label="Date">
                <input
                  className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
                  type="date"
                  value={active.date}
                  onChange={(e) => update({ date: e.target.value })}
                />
              </LabeledField>
              <LabeledField label="Template">
                <select
                  className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
                  value={active.template}
                  onChange={(e) => update({ template: e.target.value as NoteTemplate })}
                >
                  {templateChoices.map((choice) => (
                    <option key={choice.value} value={choice.value}>
                      {choice.label}
                    </option>
                  ))}
                </select>
              </LabeledField>
              <LabeledField label="Impact">
                <select
                  className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
                  value={active.impact}
                  onChange={(e) => update({ impact: e.target.value as Note["impact"] })}
                >
                  {["critical", "high", "medium", "low"].map((impact) => (
                    <option key={impact} value={impact}>
                      {impact}
                    </option>
                  ))}
                </select>
              </LabeledField>
              <LabeledField label="State">
                <select
                  className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
                  value={active.state}
                  onChange={(e) => update({ state: e.target.value as Note["state"] })}
                >
                  {["draft", "in-review", "deployed", "monitoring", "rolled-back"].map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
              </LabeledField>
            </div>

            <LabeledField label="Executive Summary Bullets">
              <div className="space-y-2">
                {active.summary.map((line, i) => (
                  <input
                    key={i}
                    className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
                    value={line}
                    onChange={(e) =>
                      update({
                        summary: active.summary.map((current, idx) => (idx === i ? e.target.value : current)),
                      })
                    }
                    placeholder="Short bullet"
                  />
                ))}
                <button
                  onClick={() => update({ summary: [...active.summary, ""] })}
                  className="h-9 rounded-md border border-border px-3 text-sm hover:bg-accent"
                >
                  Add bullet
                </button>
              </div>
            </LabeledField>

            <LabeledField label="Research Note">
              <textarea
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                rows={4}
                value={active.research}
                onChange={(e) => update({ research: e.target.value })}
              />
            </LabeledField>
          </article>

          <article className="rounded-lg border border-border bg-card p-5 space-y-4">
            <h2 className="text-base font-semibold">Template Sections</h2>
            <p className="text-sm text-muted-foreground">{templateSpecs[active.template].blurb}</p>
            {templateSpecs[active.template].sections.map((section) => (
              <LabeledField key={section.key} label={section.label}>
                <textarea
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                  rows={section.rows ?? 2}
                  placeholder={section.placeholder}
                  value={active.fields[section.key] ?? ""}
                  onChange={(e) => setField(section.key, e.target.value)}
                />
              </LabeledField>
            ))}
          </article>

          {active.template === "performance" && (
            <article className="rounded-lg border border-border bg-card p-5 space-y-4">
              <h2 className="text-base font-semibold">Performance Metrics</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <LabeledField label="Baseline (ms)">
                  <input
                    type="number"
                    className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
                    value={active.metrics?.baselineMs ?? ""}
                    onChange={(e) => setMetric("baselineMs", e.target.value)}
                  />
                </LabeledField>
                <LabeledField label="Post Optimization (ms)">
                  <input
                    type="number"
                    className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
                    value={active.metrics?.postMs ?? ""}
                    onChange={(e) => setMetric("postMs", e.target.value)}
                  />
                </LabeledField>
                <LabeledField label="Coverage (%)">
                  <input
                    type="number"
                    className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
                    value={active.metrics?.coveragePct ?? ""}
                    onChange={(e) => setMetric("coveragePct", e.target.value)}
                  />
                </LabeledField>
              </div>
            </article>
          )}

          <article className="rounded-lg border border-border bg-card p-5 space-y-3">
            <h2 className="text-base font-semibold">Skills and Milestones</h2>

            <LabeledField label="Skills">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {allSkills.map((skill) => {
                  const checked = active.skills.includes(skill);
                  return (
                    <label key={skill} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => {
                          update({
                            skills: checked
                              ? active.skills.filter((s) => s !== skill)
                              : [...active.skills, skill],
                          });
                        }}
                      />
                      {skill}
                    </label>
                  );
                })}
              </div>
            </LabeledField>

            <LabeledField label="Linked Milestones">
              <div className="space-y-2">
                {milestones.map((milestone) => {
                  const checked = active.linkedMilestones.includes(milestone.id);
                  return (
                    <label key={milestone.id} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => {
                          update({
                            linkedMilestones: checked
                              ? active.linkedMilestones.filter((m) => m !== milestone.id)
                              : [...active.linkedMilestones, milestone.id],
                          });
                        }}
                      />
                      {milestone.title}
                    </label>
                  );
                })}
              </div>
            </LabeledField>
          </article>
        </section>
      </div>
    </div>
  );
}

function LabeledField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

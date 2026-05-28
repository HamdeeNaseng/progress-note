"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Archive, CircleDot, GitBranch, LayoutDashboard } from "lucide-react";
import { DashboardCard } from "@/components/dashboard-card";
import { StatsAccordion, type StatGroup } from "@/components/stats-accordion";
import { TabBar, type Tab } from "@/components/tab-bar";

type ProjectPlatform = "github" | "gitlab" | "local";
type ProjectStatus = "active" | "paused" | "archived";

type Project = {
  id: string;
  name: string;
  description: string;
  platform: ProjectPlatform;
  org: string;
  status: ProjectStatus;
  openIssues: number;
  closedIssues: number;
  stars: number;
  branches: number;
  createdAt: string;
  updatedAt: string;
};

type ProjectForm = {
  name: string;
  description: string;
  platform: ProjectPlatform;
  org: string;
  status: ProjectStatus;
};

const EMPTY_FORM: ProjectForm = {
  name: "",
  description: "",
  platform: "github",
  org: "",
  status: "active",
};

const PLATFORM_BADGES: Record<ProjectPlatform, string> = {
  github: "bg-muted text-muted-foreground border-border",
  gitlab: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  local: "bg-sky-500/15 text-sky-400 border-sky-500/30",
};

const STATUS_BADGES: Record<ProjectStatus, string> = {
  active: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  paused: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  archived: "bg-muted text-muted-foreground border-border",
};

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // form state
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<ProjectForm>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // confirm delete
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | "all">("all");

  // Stats accordion groups — derived from live project data
  const statusTabs = useMemo<Tab[]>(
    () => [
      { id: "all", label: "All", count: projects.length },
      {
        id: "active",
        label: "Active",
        count: projects.filter((p) => p.status === "active").length,
      },
      {
        id: "paused",
        label: "Paused",
        count: projects.filter((p) => p.status === "paused").length,
      },
      {
        id: "archived",
        label: "Archived",
        count: projects.filter((p) => p.status === "archived").length,
      },
    ],
    [projects],
  );

  const filteredProjects = useMemo(
    () => (statusFilter === "all" ? projects : projects.filter((p) => p.status === statusFilter)),
    [projects, statusFilter],
  );

  const statGroups = useMemo<StatGroup[]>(() => {
    const total = projects.length;
    const active = projects.filter((p) => p.status === "active").length;
    const paused = projects.filter((p) => p.status === "paused").length;
    const archived = projects.filter((p) => p.status === "archived").length;

    const totalOpen = projects.reduce((s, p) => s + p.openIssues, 0);
    const totalClosed = projects.reduce((s, p) => s + p.closedIssues, 0);
    const totalIssues = totalOpen + totalClosed;
    const completionRate = totalIssues > 0 ? Math.round((totalClosed / totalIssues) * 100) : 0;

    const totalStars = projects.reduce((s, p) => s + p.stars, 0);
    const totalBranches = projects.reduce((s, p) => s + p.branches, 0);
    const githubCount = projects.filter((p) => p.platform === "github").length;
    const gitlabCount = projects.filter((p) => p.platform === "gitlab").length;

    return [
      {
        id: "overview",
        title: "Project Overview",
        summary: `${total} total · ${active} active`,
        icon: LayoutDashboard,
        stats: [
          { label: "Total", value: total, highlight: "neutral" },
          { label: "Active", value: active, highlight: "positive" },
          { label: "Paused", value: paused, highlight: "warning" },
          { label: "Archived", value: archived, highlight: "neutral" },
        ],
      },
      {
        id: "issues",
        title: "Issue Tracking",
        summary: `${totalOpen} open · ${completionRate}% resolved`,
        icon: CircleDot,
        stats: [
          {
            label: "Open Issues",
            value: totalOpen,
            highlight: totalOpen > 0 ? "warning" : "positive",
          },
          { label: "Closed Issues", value: totalClosed, highlight: "positive" },
          {
            label: "Completion Rate",
            value: `${completionRate}%`,
            highlight: completionRate >= 75 ? "positive" : "warning",
          },
        ],
      },
      {
        id: "repos",
        title: "Repository Health",
        summary: `${totalStars} stars · ${totalBranches} branches`,
        icon: GitBranch,
        stats: [
          { label: "Total Stars", value: totalStars, highlight: "positive" },
          { label: "Branches", value: totalBranches, highlight: "neutral" },
          { label: "GitHub", value: githubCount, highlight: "neutral" },
          { label: "GitLab", value: gitlabCount, highlight: "neutral" },
        ],
      },
    ];
  }, [projects]);

  async function fetchProjects() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/projects");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setProjects(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load projects");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (deleteId && confirmRef.current) {
      confirmRef.current.focus();
    }
  }, [deleteId]);

  function openNew() {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setFormError(null);
    setShowForm(true);
  }

  function openEdit(p: Project) {
    setForm({
      name: p.name,
      description: p.description,
      platform: p.platform,
      org: p.org,
      status: p.status,
    });
    setEditingId(p.id);
    setFormError(null);
    setShowForm(true);
  }

  async function handleSave() {
    if (!form.name.trim()) {
      setFormError("Name is required");
      return;
    }
    if (!form.org.trim()) {
      setFormError("Org / owner is required");
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      const isNew = editingId === null;
      const res = await fetch(isNew ? "/api/projects" : `/api/projects/item?id=${editingId}`, {
        method: isNew ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }
      const saved: Project = await res.json();
      setProjects((prev) =>
        isNew ? [saved, ...prev] : prev.map((p) => (p.id === saved.id ? saved : p)),
      );
      setShowForm(false);
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/projects/item?id=${id}`, { method: "DELETE" });
      if (!res.ok && res.status !== 404) throw new Error(`HTTP ${res.status}`);
      setProjects((prev) => prev.filter((p) => p.id !== id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setDeleteId(null);
    }
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <header className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
            R&D Insight Hub
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">Projects</h1>
        </div>
        <button
          onClick={openNew}
          className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          + New Project
        </button>
      </header>

      {/* Quick-stat cards — demonstrate container query layout at 2-col (wide) and 4-col (medium) */}
      {!loading && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <DashboardCard
            label="Total Projects"
            value={projects.length}
            icon={<LayoutDashboard size={18} />}
            stats={[
              { label: "Open Issues", value: projects.reduce((s, p) => s + p.openIssues, 0) },
              { label: "Stars", value: projects.reduce((s, p) => s + p.stars, 0) },
            ]}
          />
          <DashboardCard
            label="Active"
            value={projects.filter((p) => p.status === "active").length}
            icon={<CircleDot size={18} />}
            trend={{ direction: "up", label: "Running" }}
            description="Projects currently in progress"
          />
          <DashboardCard
            label="Open Issues"
            value={projects.reduce((s, p) => s + p.openIssues, 0)}
            icon={<GitBranch size={18} />}
            description="Across all repositories"
            stats={[{ label: "Closed", value: projects.reduce((s, p) => s + p.closedIssues, 0) }]}
          />
          <DashboardCard
            label="Archived"
            value={projects.filter((p) => p.status === "archived").length}
            icon={<Archive size={18} />}
            trend={{ direction: "neutral", label: "Inactive" }}
            description="No longer actively maintained"
          />
        </div>
      )}

      {/* Stats accordion — visible once projects load */}
      {!loading && projects.length > 0 && (
        <StatsAccordion groups={statGroups} defaultOpenId="overview" />
      )}

      {/* Status filter tab bar */}
      {!loading && projects.length > 0 && (
        <TabBar
          tabs={statusTabs}
          value={statusFilter}
          onChange={(id) => setStatusFilter(id as ProjectStatus | "all")}
          label="Filter projects by status"
        />
      )}

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-xl space-y-4">
            <h2 className="text-lg font-semibold">{editingId ? "Edit Project" : "New Project"}</h2>

            {formError && <p className="text-sm text-destructive">{formError}</p>}

            <div className="space-y-3">
              <Field label="Name">
                <input
                  className="input-base"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="my-app"
                />
              </Field>
              <Field label="Description">
                <textarea
                  className="input-base min-h-[72px] resize-y"
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Short description…"
                />
              </Field>
              <Field label="Platform">
                <select
                  className="input-base"
                  value={form.platform}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, platform: e.target.value as ProjectPlatform }))
                  }
                >
                  <option value="github">GitHub</option>
                  <option value="gitlab">GitLab</option>
                  <option value="local">Local</option>
                </select>
              </Field>
              <Field label="Org / Owner">
                <input
                  className="input-base"
                  value={form.org}
                  onChange={(e) => setForm((f) => ({ ...f, org: e.target.value }))}
                  placeholder="acme-corp"
                />
              </Field>
              <Field label="Status">
                <select
                  className="input-base"
                  value={form.status}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, status: e.target.value as ProjectStatus }))
                  }
                >
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                  <option value="archived">Archived</option>
                </select>
              </Field>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                onClick={() => setShowForm(false)}
                className="rounded-md border border-border px-3 py-1.5 text-sm hover:bg-muted"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-sm rounded-lg border border-border bg-card p-6 shadow-xl space-y-4">
            <h2 className="text-base font-semibold">Delete project?</h2>
            <p className="text-sm text-muted-foreground">
              This will also disassociate all its notes. This action cannot be undone.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setDeleteId(null)}
                className="rounded-md border border-border px-3 py-1.5 text-sm hover:bg-muted"
              >
                Cancel
              </button>
              <button
                ref={confirmRef}
                onClick={() => handleDelete(deleteId)}
                className="rounded-md bg-destructive px-3 py-1.5 text-sm font-medium text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
      {error && <p className="text-sm text-destructive">{error}</p>}

      {!loading && !error && projects.length === 0 && (
        <div className="rounded-lg border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          No projects yet.{" "}
          <button onClick={openNew} className="underline hover:text-foreground">
            Create your first project
          </button>
        </div>
      )}

      {!loading && projects.length > 0 && filteredProjects.length === 0 && (
        <div className="rounded-lg border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          No {statusFilter} projects.
        </div>
      )}

      {!loading && filteredProjects.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((p) => (
            <article
              key={p.id}
              className="rounded-lg border border-border bg-card p-5 flex flex-col gap-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex flex-wrap gap-1.5">
                  <span
                    className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded border ${PLATFORM_BADGES[p.platform]}`}
                  >
                    {p.platform}
                  </span>
                  <span
                    className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded border ${STATUS_BADGES[p.status]}`}
                  >
                    {p.status}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEdit(p)}
                    aria-label={`Edit ${p.name}`}
                    className="rounded p-1 text-muted-foreground hover:text-foreground hover:bg-muted text-xs"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setDeleteId(p.id)}
                    aria-label={`Delete ${p.name}`}
                    className="rounded p-1 text-muted-foreground hover:text-destructive hover:bg-muted text-xs"
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div>
                <h2 className="font-semibold text-base leading-tight">{p.name}</h2>
                <p className="text-xs text-muted-foreground">{p.org}</p>
                {p.description && (
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{p.description}</p>
                )}
              </div>

              <div className="flex gap-4 text-xs text-muted-foreground">
                <span>{p.openIssues} open</span>
                <span>{p.stars} ★</span>
                <span>{p.branches} branches</span>
              </div>

              <Link
                href={`/projects/${p.id}/notes`}
                className="mt-auto inline-flex items-center justify-center rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                View Notes →
              </Link>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: Readonly<{ label: string; children: React.ReactNode }>) {
  return (
    <label className="block space-y-1">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

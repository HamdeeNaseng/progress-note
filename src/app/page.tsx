import Link from "next/link";
import { milestones, notes, projects } from "@/data/progress-data";

export default function Home() {
  const activeMilestones = milestones.filter((m) => m.status !== "done").length;
  const highImpactNotes = notes.filter(
    (n) => n.impact === "high" || n.impact === "critical",
  ).length;

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">R&D Insight Hub</p>
        <h1 className="text-3xl font-semibold tracking-tight">Next.js Migration Workspace</h1>
        <p className="text-sm text-muted-foreground">
          Legacy router UI has been rehomed into Next.js. Use Progress Notes for full CRUD.
        </p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Projects" value={projects.length} />
        <StatCard label="Active Milestones" value={activeMilestones} />
        <StatCard label="High Impact Notes" value={highImpactNotes} />
      </section>

      <section className="rounded-lg border border-border bg-card p-6">
        <h2 className="text-lg font-semibold">Start Here</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Open the Notes page to create, read, update, and delete structured progress notes.
        </p>
        <div className="mt-4">
          <Link
            href="/notes"
            className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Open Notes CRUD
          </Link>
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <article className="rounded-lg border border-border bg-card p-4">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-2 text-3xl font-semibold tabular-nums">{value}</p>
    </article>
  );
}

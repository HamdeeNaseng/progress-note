import { Pool } from "pg";
import { randomUUID } from "node:crypto";
import type { Note as AppNote, NoteTemplate as AppNoteTemplate } from "@/data/progress-data";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required");
}

const pool = new Pool({ connectionString });

type NoteRow = {
  id: string;
  projectId: string | null;
  template: AppNote["template"];
  impact: AppNote["impact"];
  state: string;
  title: string;
  date: string | Date;
  research: string;
};

function toUiState(state: string): AppNote["state"] {
  if (state === "in_review") return "in-review";
  if (state === "rolled_back") return "rolled-back";
  return state as AppNote["state"];
}

function toDbState(state: AppNote["state"]): string {
  if (state === "in-review") return "in_review";
  if (state === "rolled-back") return "rolled_back";
  return state;
}

function dateToString(value: string | Date): string {
  const date = value instanceof Date ? value : new Date(value);
  return date.toISOString().slice(0, 10);
}

function toUiNote(
  row: NoteRow,
  summary: string[],
  fields: Record<string, string>,
  metrics: AppNote["metrics"],
  skills: string[],
  linkedMilestones: string[],
): AppNote {
  return {
    id: row.id,
    projectId: row.projectId ?? undefined,
    template: row.template,
    impact: row.impact,
    state: toUiState(row.state),
    title: row.title,
    date: dateToString(row.date),
    research: row.research,
    summary,
    fields,
    metrics,
    skills,
    linkedMilestones,
  };
}

async function getNoteById(id: string): Promise<AppNote | null> {
  const client = await pool.connect();
  try {
    const noteResult = await client.query<NoteRow>(
      'SELECT id, "projectId", template, impact, state, title, date, research FROM "Note" WHERE id = $1',
      [id],
    );

    const row = noteResult.rows[0];
    if (!row) {
      return null;
    }

    const summaryResult = await client.query<{ text: string }>(
      'SELECT text FROM "NoteSummaryBullet" WHERE "noteId" = $1 ORDER BY position ASC',
      [id],
    );
    const fieldsResult = await client.query<{ key: string; value: string }>(
      'SELECT key, value FROM "NoteField" WHERE "noteId" = $1',
      [id],
    );
    const metricsResult = await client.query<{
      baselineMs: number | null;
      postMs: number | null;
      coveragePct: number | null;
    }>('SELECT "baselineMs", "postMs", "coveragePct" FROM "NoteMetric" WHERE "noteId" = $1', [id]);
    const skillsResult = await client.query<{ name: string }>(
      'SELECT s.name FROM "NoteSkill" ns JOIN "Skill" s ON s.id = ns."skillId" WHERE ns."noteId" = $1',
      [id],
    );
    const milestonesResult = await client.query<{ milestoneId: string }>(
      'SELECT "milestoneId" FROM "NoteMilestone" WHERE "noteId" = $1',
      [id],
    );

    const metricsRow = metricsResult.rows[0];

    return toUiNote(
      row,
      summaryResult.rows.map((item) => item.text),
      Object.fromEntries(fieldsResult.rows.map((item) => [item.key, item.value])),
      {
        baselineMs: metricsRow?.baselineMs ?? undefined,
        postMs: metricsRow?.postMs ?? undefined,
        coveragePct: metricsRow?.coveragePct ?? undefined,
      },
      skillsResult.rows.map((item) => item.name),
      milestonesResult.rows.map((item) => item.milestoneId),
    );
  } finally {
    client.release();
  }
}

export async function listNotes(projectId?: string): Promise<AppNote[]> {
  const client = await pool.connect();
  try {
    const result = projectId
      ? await client.query<NoteRow>(
          'SELECT id, "projectId", template, impact, state, title, date, research FROM "Note" WHERE "projectId" = $1 ORDER BY date DESC, "createdAt" DESC',
          [projectId],
        )
      : await client.query<NoteRow>(
          'SELECT id, "projectId", template, impact, state, title, date, research FROM "Note" ORDER BY date DESC, "createdAt" DESC',
        );

    const notes: AppNote[] = [];
    for (const row of result.rows) {
      const full = await getNoteById(row.id);
      if (full) notes.push(full);
    }

    return notes;
  } finally {
    client.release();
  }
}

export async function createNote(payload: { id?: string; template: AppNoteTemplate; projectId?: string }): Promise<AppNote> {
  const id = payload.id ?? `n${Date.now()}`;
  const now = new Date();
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    await client.query(
      'INSERT INTO "Note" (id, "projectId", template, impact, state, title, date, research, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $9)',
      [id, payload.projectId ?? null, payload.template, "medium", "draft", "Untitled progress note", now, "", now],
    );
    await client.query(
      'INSERT INTO "NoteSummaryBullet" (id, "noteId", position, text) VALUES ($1, $2, $3, $4)',
      [randomUUID(), id, 0, ""],
    );
    await client.query(
      'INSERT INTO "NoteMetric" ("noteId", "baselineMs", "postMs", "coveragePct") VALUES ($1, NULL, NULL, NULL)',
      [id],
    );
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }

  const created = await getNoteById(id);
  if (!created) {
    throw new Error("Failed to fetch created note");
  }
  return created;
}

export async function updateNote(id: string, patch: Partial<AppNote>): Promise<AppNote | null> {
  const client = await pool.connect();
  try {
    const existing = await client.query<{ id: string }>('SELECT id FROM "Note" WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return null;
    }

    await client.query("BEGIN");

    const fields: string[] = [];
    const values: unknown[] = [];

    const pushField = (key: string, value: unknown) => {
      values.push(value);
      fields.push(`${key} = $${values.length}`);
    };

    if (patch.template) pushField("template", patch.template);
    if (patch.impact) pushField("impact", patch.impact);
    if (patch.state) pushField("state", toDbState(patch.state));
    if (typeof patch.title === "string") pushField("title", patch.title);
    if (typeof patch.date === "string") pushField("date", patch.date);
    if (typeof patch.research === "string") pushField("research", patch.research);

    if (fields.length > 0) {
      values.push(id);
      await client.query(
        `UPDATE "Note" SET ${fields.join(", ")}, "updatedAt" = NOW() WHERE id = $${values.length}`,
        values,
      );
    }

    if (patch.summary) {
      await client.query('DELETE FROM "NoteSummaryBullet" WHERE "noteId" = $1', [id]);
      for (const [position, text] of patch.summary.entries()) {
        await client.query(
          'INSERT INTO "NoteSummaryBullet" (id, "noteId", position, text) VALUES ($1, $2, $3, $4)',
          [randomUUID(), id, position, text],
        );
      }
    }

    if (patch.fields) {
      await client.query('DELETE FROM "NoteField" WHERE "noteId" = $1', [id]);
      for (const [key, value] of Object.entries(patch.fields)) {
        await client.query(
          'INSERT INTO "NoteField" (id, "noteId", key, value) VALUES ($1, $2, $3, $4)',
          [randomUUID(), id, key, value],
        );
      }
    }

    if (patch.metrics !== undefined) {
      if (!patch.metrics) {
        await client.query('DELETE FROM "NoteMetric" WHERE "noteId" = $1', [id]);
      } else {
        await client.query(
          'INSERT INTO "NoteMetric" ("noteId", "baselineMs", "postMs", "coveragePct") VALUES ($1, $2, $3, $4) ON CONFLICT ("noteId") DO UPDATE SET "baselineMs" = EXCLUDED."baselineMs", "postMs" = EXCLUDED."postMs", "coveragePct" = EXCLUDED."coveragePct"',
          [
            id,
            patch.metrics.baselineMs ?? null,
            patch.metrics.postMs ?? null,
            patch.metrics.coveragePct ?? null,
          ],
        );
      }
    }

    if (patch.skills) {
      await client.query('DELETE FROM "NoteSkill" WHERE "noteId" = $1', [id]);
      const categoryRes = await client.query<{ id: string }>(
        'SELECT id FROM "SkillCategory" WHERE name = $1',
        ["Uncategorized"],
      );

      let categoryId = categoryRes.rows[0]?.id;
      if (!categoryId) {
        categoryId = randomUUID();
        await client.query(
          'INSERT INTO "SkillCategory" (id, name, "createdAt", "updatedAt") VALUES ($1, $2, NOW(), NOW())',
          [categoryId, "Uncategorized"],
        );
      }

      for (const skillName of patch.skills) {
        const skillRes = await client.query<{ id: string }>('SELECT id FROM "Skill" WHERE name = $1', [
          skillName,
        ]);

        let skillId = skillRes.rows[0]?.id;
        if (!skillId) {
          skillId = randomUUID();
          await client.query(
            'INSERT INTO "Skill" (id, "categoryId", name, "createdAt", "updatedAt") VALUES ($1, $2, $3, NOW(), NOW())',
            [skillId, categoryId, skillName],
          );
        }

        await client.query(
          'INSERT INTO "NoteSkill" ("noteId", "skillId") VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [id, skillId],
        );
      }
    }

    if (patch.linkedMilestones) {
      await client.query('DELETE FROM "NoteMilestone" WHERE "noteId" = $1', [id]);
      for (const milestoneId of patch.linkedMilestones) {
        const milestoneRes = await client.query<{ id: string }>('SELECT id FROM "Milestone" WHERE id = $1', [
          milestoneId,
        ]);
        if (milestoneRes.rows.length > 0) {
          await client.query(
            'INSERT INTO "NoteMilestone" ("noteId", "milestoneId") VALUES ($1, $2) ON CONFLICT DO NOTHING',
            [id, milestoneId],
          );
        }
      }
    }

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }

  return getNoteById(id);
}

export async function deleteNote(id: string): Promise<boolean> {
  const result = await pool.query('DELETE FROM "Note" WHERE id = $1', [id]);
  return (result.rowCount ?? 0) > 0;
}

import { Pool } from "pg";
import { randomUUID } from "node:crypto";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required");
}

const pool = new Pool({ connectionString });

export type ProjectPlatform = "github" | "gitlab" | "local";
export type ProjectStatus = "active" | "paused" | "archived";

export type Project = {
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

type ProjectRow = {
  id: string;
  name: string;
  description: string;
  platform: string;
  org: string;
  status: string;
  openIssues: number;
  closedIssues: number;
  stars: number;
  branches: number;
  createdAt: Date;
  updatedAt: Date;
};

function toProject(row: ProjectRow): Project {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    platform: row.platform as ProjectPlatform,
    org: row.org,
    status: row.status as ProjectStatus,
    openIssues: row.openIssues,
    closedIssues: row.closedIssues,
    stars: row.stars,
    branches: row.branches,
    createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : String(row.createdAt),
    updatedAt: row.updatedAt instanceof Date ? row.updatedAt.toISOString() : String(row.updatedAt),
  };
}

export async function listProjects(): Promise<Project[]> {
  const client = await pool.connect();
  try {
    const result = await client.query<ProjectRow>(
      `SELECT id, name, description, platform, org, status,
              "openIssues", "closedIssues", stars, branches,
              "createdAt", "updatedAt"
       FROM "Project"
       ORDER BY "createdAt" DESC`,
    );
    return result.rows.map(toProject);
  } finally {
    client.release();
  }
}

export async function getProjectById(id: string): Promise<Project | null> {
  const client = await pool.connect();
  try {
    const result = await client.query<ProjectRow>(
      `SELECT id, name, description, platform, org, status,
              "openIssues", "closedIssues", stars, branches,
              "createdAt", "updatedAt"
       FROM "Project" WHERE id = $1`,
      [id],
    );
    const row = result.rows[0];
    return row ? toProject(row) : null;
  } finally {
    client.release();
  }
}

export type CreateProjectInput = {
  name: string;
  description: string;
  platform: ProjectPlatform;
  org: string;
  status?: ProjectStatus;
};

export async function createProject(input: CreateProjectInput): Promise<Project> {
  const id = randomUUID();
  const now = new Date();
  const client = await pool.connect();
  try {
    await client.query(
      `INSERT INTO "Project" (id, name, description, platform, org, status,
                              "openIssues", "closedIssues", stars, branches,
                              "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, 0, 0, 0, 0, $7, $7)`,
      [id, input.name, input.description, input.platform, input.org, input.status ?? "active", now],
    );
  } finally {
    client.release();
  }

  const created = await getProjectById(id);
  if (!created) throw new Error("Failed to fetch created project");
  return created;
}

export type UpdateProjectInput = Partial<Omit<Project, "id" | "createdAt" | "updatedAt">>;

export async function updateProject(id: string, patch: UpdateProjectInput): Promise<Project | null> {
  const client = await pool.connect();
  try {
    const existing = await client.query<{ id: string }>('SELECT id FROM "Project" WHERE id = $1', [id]);
    if (existing.rows.length === 0) return null;

    const fields: string[] = [];
    const values: unknown[] = [];

    const set = (col: string, val: unknown) => {
      values.push(val);
      fields.push(`"${col}" = $${values.length}`);
    };

    if (patch.name !== undefined) set("name", patch.name);
    if (patch.description !== undefined) set("description", patch.description);
    if (patch.platform !== undefined) set("platform", patch.platform);
    if (patch.org !== undefined) set("org", patch.org);
    if (patch.status !== undefined) set("status", patch.status);
    if (patch.openIssues !== undefined) set("openIssues", patch.openIssues);
    if (patch.closedIssues !== undefined) set("closedIssues", patch.closedIssues);
    if (patch.stars !== undefined) set("stars", patch.stars);
    if (patch.branches !== undefined) set("branches", patch.branches);

    if (fields.length > 0) {
      values.push(id);
      await client.query(
        `UPDATE "Project" SET ${fields.join(", ")}, "updatedAt" = NOW() WHERE id = $${values.length}`,
        values,
      );
    }
  } finally {
    client.release();
  }

  return getProjectById(id);
}

export async function deleteProject(id: string): Promise<boolean> {
  const client = await pool.connect();
  try {
    const result = await client.query('DELETE FROM "Project" WHERE id = $1', [id]);
    return (result.rowCount ?? 0) > 0;
  } finally {
    client.release();
  }
}

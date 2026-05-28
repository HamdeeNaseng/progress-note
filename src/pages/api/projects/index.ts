import type { NextApiRequest, NextApiResponse } from "next";
import { createProject, listProjects, type CreateProjectInput, type ProjectPlatform, type ProjectStatus } from "@/lib/projects-api-server";

const PLATFORMS: ProjectPlatform[] = ["github", "gitlab", "local"];
const STATUSES: ProjectStatus[] = ["active", "paused", "archived"];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    try {
      const projects = await listProjects();
      res.status(200).json(projects);
      return;
    } catch (error) {
      console.error("GET /api/projects failed", error);
      res.status(500).json({ error: "Failed to fetch projects" });
      return;
    }
  }

  if (req.method === "POST") {
    try {
      const body = req.body as Partial<CreateProjectInput>;

      if (!body.name || typeof body.name !== "string" || body.name.trim() === "") {
        res.status(400).json({ error: "name is required" });
        return;
      }
      if (!body.description || typeof body.description !== "string") {
        res.status(400).json({ error: "description is required" });
        return;
      }
      if (!body.platform || !PLATFORMS.includes(body.platform)) {
        res.status(400).json({ error: `platform must be one of: ${PLATFORMS.join(", ")}` });
        return;
      }
      if (!body.org || typeof body.org !== "string" || body.org.trim() === "") {
        res.status(400).json({ error: "org is required" });
        return;
      }
      if (body.status && !STATUSES.includes(body.status)) {
        res.status(400).json({ error: `status must be one of: ${STATUSES.join(", ")}` });
        return;
      }

      const project = await createProject({
        name: body.name.trim(),
        description: body.description,
        platform: body.platform,
        org: body.org.trim(),
        status: body.status,
      });
      res.status(201).json(project);
      return;
    } catch (error: unknown) {
      console.error("POST /api/projects failed", error);
      // Unique constraint on name
      if (error instanceof Error && error.message.includes("unique")) {
        res.status(409).json({ error: "A project with that name already exists" });
        return;
      }
      res.status(500).json({ error: "Failed to create project" });
      return;
    }
  }

  res.setHeader("Allow", ["GET", "POST"]);
  res.status(405).json({ error: "Method not allowed" });
}

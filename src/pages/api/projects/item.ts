import type { NextApiRequest, NextApiResponse } from "next";
import { deleteProject, updateProject, type UpdateProjectInput, type ProjectPlatform, type ProjectStatus } from "@/lib/projects-api-server";

const PLATFORMS: ProjectPlatform[] = ["github", "gitlab", "local"];
const STATUSES: ProjectStatus[] = ["active", "paused", "archived"];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const id = typeof req.query.id === "string" ? req.query.id : null;

  if (!id) {
    res.status(400).json({ error: "Missing project id" });
    return;
  }

  if (req.method === "PATCH") {
    try {
      const body = req.body as Partial<UpdateProjectInput>;
      const patch: UpdateProjectInput = {};

      if (body.name !== undefined) {
        if (typeof body.name !== "string" || body.name.trim() === "") {
          res.status(400).json({ error: "name must be a non-empty string" });
          return;
        }
        patch.name = body.name.trim();
      }
      if (body.description !== undefined) patch.description = String(body.description);
      if (body.platform !== undefined) {
        if (!PLATFORMS.includes(body.platform as ProjectPlatform)) {
          res.status(400).json({ error: `platform must be one of: ${PLATFORMS.join(", ")}` });
          return;
        }
        patch.platform = body.platform as ProjectPlatform;
      }
      if (body.org !== undefined) {
        if (typeof body.org !== "string" || body.org.trim() === "") {
          res.status(400).json({ error: "org must be a non-empty string" });
          return;
        }
        patch.org = body.org.trim();
      }
      if (body.status !== undefined) {
        if (!STATUSES.includes(body.status as ProjectStatus)) {
          res.status(400).json({ error: `status must be one of: ${STATUSES.join(", ")}` });
          return;
        }
        patch.status = body.status as ProjectStatus;
      }
      if (body.openIssues !== undefined) patch.openIssues = Number(body.openIssues);
      if (body.closedIssues !== undefined) patch.closedIssues = Number(body.closedIssues);
      if (body.stars !== undefined) patch.stars = Number(body.stars);
      if (body.branches !== undefined) patch.branches = Number(body.branches);

      const updated = await updateProject(id, patch);
      if (!updated) {
        res.status(404).json({ error: "Project not found" });
        return;
      }

      res.status(200).json(updated);
      return;
    } catch (error) {
      console.error("PATCH /api/projects/item failed", error);
      res.status(500).json({ error: "Failed to update project" });
      return;
    }
  }

  if (req.method === "DELETE") {
    try {
      const deleted = await deleteProject(id);
      if (!deleted) {
        res.status(404).json({ error: "Project not found" });
        return;
      }
      res.status(204).end();
      return;
    } catch (error) {
      console.error("DELETE /api/projects/item failed", error);
      res.status(500).json({ error: "Failed to delete project" });
      return;
    }
  }

  res.setHeader("Allow", ["PATCH", "DELETE"]);
  res.status(405).json({ error: "Method not allowed" });
}

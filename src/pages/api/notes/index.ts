import type { NextApiRequest, NextApiResponse } from "next";
import { createNote, listNotes } from "@/lib/notes-api-server";
import type { NoteTemplate } from "@/data/progress-data";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    try {
      const notes = await listNotes();
      res.status(200).json(notes);
      return;
    } catch (error) {
      console.error("GET /api/notes failed", error);
      res.status(500).json({ error: "Failed to fetch notes" });
      return;
    }
  }

  if (req.method === "POST") {
    try {
      const body = req.body as { id?: string; template?: NoteTemplate };
      if (!body?.template || !["feature", "performance", "incident"].includes(body.template)) {
        res.status(400).json({ error: "Invalid template" });
        return;
      }

      const note = await createNote({ id: body.id, template: body.template });
      res.status(201).json(note);
      return;
    } catch (error) {
      console.error("POST /api/notes failed", error);
      res.status(500).json({ error: "Failed to create note" });
      return;
    }
  }

  res.setHeader("Allow", ["GET", "POST"]);
  res.status(405).json({ error: "Method not allowed" });
}

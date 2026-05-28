import type { NextApiRequest, NextApiResponse } from "next";
import { deleteNote, updateNote } from "@/lib/notes-api-server";
import type { Note } from "@/data/progress-data";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const id = typeof req.query.id === "string" ? req.query.id : undefined;
  if (!id) {
    res.status(400).json({ error: "Missing id" });
    return;
  }

  if (req.method === "PATCH") {
    try {
      const patch = req.body as Partial<Note>;
      const note = await updateNote(id, patch);

      if (!note) {
        res.status(404).json({ error: "Note not found" });
        return;
      }

      res.status(200).json(note);
      return;
    } catch (error) {
      console.error("PATCH /api/notes/item failed", error);
      res.status(500).json({ error: "Failed to update note" });
      return;
    }
  }

  if (req.method === "DELETE") {
    try {
      const removed = await deleteNote(id);
      if (!removed) {
        res.status(404).json({ error: "Note not found" });
        return;
      }
      res.status(204).end();
      return;
    } catch (error) {
      console.error("DELETE /api/notes/item failed", error);
      res.status(500).json({ error: "Failed to delete note" });
      return;
    }
  }

  res.setHeader("Allow", ["PATCH", "DELETE"]);
  res.status(405).json({ error: "Method not allowed" });
}

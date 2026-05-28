import { useEffect, useSyncExternalStore } from "react";
import type { Note, NoteTemplate } from "@/data/progress-data";

let state: Note[] = [];
let loaded = false;
let loadingPromise: Promise<void> | null = null;
const listeners = new Set<() => void>();

const emit = () => listeners.forEach((listener) => listener());

async function request<T>(input: string, init?: RequestInit): Promise<T> {
  const response = await fetch(input, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

async function reloadNotes() {
  const notes = await request<Note[]>("/api/notes");
  state = notes;
  loaded = true;
  emit();
}

function ensureLoaded() {
  if (loaded) {
    return;
  }
  if (!loadingPromise) {
    loadingPromise = reloadNotes().finally(() => {
      loadingPromise = null;
    });
  }
}

export const notesStore = {
  get: () => state,
  subscribe(fn: () => void) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
  update(id: string, patch: Partial<Note>) {
    const previous = state;
    state = state.map((note) => (note.id === id ? { ...note, ...patch } : note));
    emit();

    void request<Note>(`/api/notes/item?id=${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    })
      .then((updated) => {
        state = state.map((note) => (note.id === id ? updated : note));
        emit();
      })
      .catch(() => {
        state = previous;
        emit();
      });
  },
  add(template: NoteTemplate) {
    const id = `n${Date.now()}`;
    const draft: Note = {
      id,
      template,
      impact: "medium",
      state: "draft",
      title: "Untitled progress note",
      date: new Date().toISOString().slice(0, 10),
      summary: [""],
      research: "",
      skills: [],
      linkedMilestones: [],
      fields: {},
      metrics: {},
    };

    state = [draft, ...state];
    emit();

    void request<Note>("/api/notes", {
      method: "POST",
      body: JSON.stringify({ id, template }),
    })
      .then((created) => {
        state = state.map((note) => (note.id === id ? created : note));
        emit();
      })
      .catch(() => {
        state = state.filter((note) => note.id !== id);
        emit();
      });

    return id;
  },
  remove(id: string) {
    const previous = state;
    state = state.filter((note) => note.id !== id);
    emit();

    void request<void>(`/api/notes/item?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: {},
    }).catch(() => {
      state = previous;
      emit();
    });
  },
};

export function useNotes() {
  useEffect(() => {
    ensureLoaded();
  }, []);

  return useSyncExternalStore(notesStore.subscribe, notesStore.get, notesStore.get);
}

// Aggregated performance series derived from notes that have metrics.
export function usePerformanceSeries() {
  const all = useNotes();
  return all
    .filter((n) => n.metrics?.baselineMs != null && n.metrics?.postMs != null)
    .map((n) => ({
      label: n.date.slice(5),
      title: n.title,
      baseline: n.metrics!.baselineMs!,
      optimized: n.metrics!.postMs!,
      delta: Math.round(
        ((n.metrics!.baselineMs! - n.metrics!.postMs!) / n.metrics!.baselineMs!) * 100,
      ),
      coverage: n.metrics?.coveragePct ?? 0,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

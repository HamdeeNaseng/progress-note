import { useEffect, useSyncExternalStore } from "react";
import type { Note, NoteTemplate } from "@/data/progress-data";

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

// ─── Per-project store factory ────────────────────────────────────────────────

function createProjectStore(projectId: string) {
  let state: Note[] = [];
  let loaded = false;
  let loadingPromise: Promise<void> | null = null;
  const listeners = new Set<() => void>();

  const emit = () => listeners.forEach((l) => l());

  async function reloadNotes() {
    const notes = await request<Note[]>(`/api/notes?projectId=${encodeURIComponent(projectId)}`);
    state = notes;
    loaded = true;
    emit();
  }

  function ensureLoaded() {
    if (loaded) return;
    if (!loadingPromise) {
      loadingPromise = reloadNotes().finally(() => {
        loadingPromise = null;
      });
    }
  }

  const store = {
    get: () => state,
    subscribe(fn: () => void) {
      listeners.add(fn);
      ensureLoaded();
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
        projectId,
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
        body: JSON.stringify({ id, template, projectId }),
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
    reload() {
      loaded = false;
      ensureLoaded();
    },
  };

  return store;
}

const storeCache = new Map<string, ReturnType<typeof createProjectStore>>();

export function getProjectStore(projectId: string) {
  if (!storeCache.has(projectId)) {
    storeCache.set(projectId, createProjectStore(projectId));
  }
  return storeCache.get(projectId)!;
}

export function useProjectNotes(projectId: string) {
  const store = getProjectStore(projectId);

  useEffect(() => {
    // subscribe triggers ensureLoaded; nothing else needed
  }, [projectId]);

  return useSyncExternalStore(store.subscribe, store.get, store.get);
}

// ─── Legacy global store (for non-project pages / analytics) ─────────────────

let globalState: Note[] = [];
let globalLoaded = false;
let globalLoadingPromise: Promise<void> | null = null;
const globalListeners = new Set<() => void>();

const globalEmit = () => globalListeners.forEach((l) => l());

async function reloadGlobal() {
  const notes = await request<Note[]>("/api/notes");
  globalState = notes;
  globalLoaded = true;
  globalEmit();
}

function ensureGlobalLoaded() {
  if (globalLoaded) return;
  if (!globalLoadingPromise) {
    globalLoadingPromise = reloadGlobal().finally(() => {
      globalLoadingPromise = null;
    });
  }
}

export const notesStore = {
  get: () => globalState,
  subscribe(fn: () => void) {
    globalListeners.add(fn);
    return () => globalListeners.delete(fn);
  },
  update(id: string, patch: Partial<Note>) {
    const previous = globalState;
    globalState = globalState.map((note) => (note.id === id ? { ...note, ...patch } : note));
    globalEmit();

    void request<Note>(`/api/notes/item?id=${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    })
      .then((updated) => {
        globalState = globalState.map((note) => (note.id === id ? updated : note));
        globalEmit();
      })
      .catch(() => {
        globalState = previous;
        globalEmit();
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

    globalState = [draft, ...globalState];
    globalEmit();

    void request<Note>("/api/notes", {
      method: "POST",
      body: JSON.stringify({ id, template }),
    })
      .then((created) => {
        globalState = globalState.map((note) => (note.id === id ? created : note));
        globalEmit();
      })
      .catch(() => {
        globalState = globalState.filter((note) => note.id !== id);
        globalEmit();
      });

    return id;
  },
  remove(id: string) {
    const previous = globalState;
    globalState = globalState.filter((note) => note.id !== id);
    globalEmit();

    void request<void>(`/api/notes/item?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: {},
    }).catch(() => {
      globalState = previous;
      globalEmit();
    });
  },
};

export function useNotes() {
  useEffect(() => {
    ensureGlobalLoaded();
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

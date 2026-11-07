import type { OutboxItem, QueueDb } from './types';

/** Cola en memoria: respaldo si SQLite falla y implementación para la web de revisión. */
export function createMemoryQueueDb(): QueueDb {
  const rows = new Map<string, OutboxItem>();
  const meta = new Map<string, string>();
  return {
    persistent: false,
    loadAll: () => [...rows.values()],
    insert: (item) => {
      rows.set(item.id, item);
    },
    update: (id, patch) => {
      const row = rows.get(id);
      if (row) rows.set(id, { ...row, ...patch });
    },
    remove: (id) => {
      rows.delete(id);
    },
    getMeta: (key) => meta.get(key) ?? null,
    setMeta: (key, value) => {
      meta.set(key, value);
    },
  };
}

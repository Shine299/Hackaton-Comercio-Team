import * as SQLite from 'expo-sqlite';

import type { SyncStatus } from '@/shared/sync/status';

import { createMemoryQueueDb } from './memoryQueueDb';
import type { OutboxItem, OutboxPriority, OutboxType, QueueDb } from './types';

type Row = {
  id: string;
  type: string;
  payload: string;
  createdAt: number;
  deviceId: string;
  syncStatus: string;
  priority: string;
  attempts: number;
  lastAttemptAt: number | null;
  lastError: string | null;
};

function toItem(row: Row): OutboxItem {
  let payload: Record<string, unknown> = {};
  try {
    payload = JSON.parse(row.payload) as Record<string, unknown>;
  } catch {
    // Un payload dañado no debe tumbar la app: la fila se conserva con payload vacío.
  }
  return {
    id: row.id,
    type: row.type as OutboxType,
    payload,
    createdAt: row.createdAt,
    deviceId: row.deviceId,
    syncStatus: row.syncStatus as SyncStatus,
    priority: row.priority as OutboxPriority,
    attempts: row.attempts,
    lastAttemptAt: row.lastAttemptAt ?? undefined,
    lastError: row.lastError ?? undefined,
  };
}

/** Abre `sync_queue` en SQLite. Si algo falla, cae a memoria en vez de romper el guardado local. */
function open(): QueueDb {
  try {
    const db = SQLite.openDatabaseSync('sync_queue.db');
    db.execSync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS sync_queue (
        id TEXT PRIMARY KEY NOT NULL,
        type TEXT NOT NULL,
        payload TEXT NOT NULL,
        createdAt INTEGER NOT NULL,
        deviceId TEXT NOT NULL,
        syncStatus TEXT NOT NULL,
        priority TEXT NOT NULL,
        attempts INTEGER NOT NULL DEFAULT 0,
        lastAttemptAt INTEGER,
        lastError TEXT
      );
      CREATE INDEX IF NOT EXISTS sync_queue_outgoing ON sync_queue (syncStatus, priority, createdAt);
      CREATE TABLE IF NOT EXISTS sync_meta (key TEXT PRIMARY KEY NOT NULL, value TEXT NOT NULL);
    `);

    return {
      persistent: true,
      loadAll: () => db.getAllSync<Row>('SELECT * FROM sync_queue').map(toItem),
      insert: (item) => {
        db.runSync(
          'INSERT OR IGNORE INTO sync_queue (id, type, payload, createdAt, deviceId, syncStatus, priority, attempts, lastAttemptAt, lastError) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          item.id,
          item.type,
          JSON.stringify(item.payload),
          item.createdAt,
          item.deviceId,
          item.syncStatus,
          item.priority,
          item.attempts,
          item.lastAttemptAt ?? null,
          item.lastError ?? null,
        );
      },
      update: (id, patch) => {
        const current = db.getFirstSync<Row>('SELECT * FROM sync_queue WHERE id = ?', id);
        if (!current) return;
        db.runSync(
          'UPDATE sync_queue SET syncStatus = ?, attempts = ?, lastAttemptAt = ?, lastError = ? WHERE id = ?',
          patch.syncStatus ?? current.syncStatus,
          patch.attempts ?? current.attempts,
          'lastAttemptAt' in patch ? (patch.lastAttemptAt ?? null) : current.lastAttemptAt,
          'lastError' in patch ? (patch.lastError ?? null) : current.lastError,
          id,
        );
      },
      remove: (id) => {
        db.runSync('DELETE FROM sync_queue WHERE id = ?', id);
      },
      getMeta: (key) => db.getFirstSync<{ value: string }>('SELECT value FROM sync_meta WHERE key = ?', key)?.value ?? null,
      setMeta: (key, value) => {
        db.runSync('INSERT OR REPLACE INTO sync_meta (key, value) VALUES (?, ?)', key, value);
      },
    };
  } catch {
    return createMemoryQueueDb();
  }
}

export const queueDb: QueueDb = open();

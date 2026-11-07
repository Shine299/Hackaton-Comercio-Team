import * as Crypto from 'expo-crypto';
import * as Network from 'expo-network';
import { create } from 'zustand';

import { useSessionStore } from '@/features/session';
import { kvStorage } from '@/shared/storage/kv';

import { queueDb } from './queueDb';
import { getTransport } from './transport';
import { isUnsent, PRIORITY_RANK, type OutboxItem, type OutboxPriority, type OutboxType } from './types';

export type { OutboxItem, OutboxPriority, OutboxType } from './types';

/**
 * Cola de acciones locales sobre SQLite (`sync_queue`). La API es la misma de la versión 0
 * (`items`, `enqueue`), así que el resto de la app no cambió.
 *
 * Sin servidor, el tope honesto es `local` (nunca se intentó) o `pending` (se intentó y sigue en el
 * teléfono). `received` solo lo puede poner un transporte real tras una respuesta real.
 */

const LEGACY_KEY = 'rvs.outbox.v1';
const META_LAST_ATTEMPT = 'lastAttemptAt';

/** Migra una sola vez la cola antigua (JSON en el almacén clave-valor) a `sync_queue`. */
function migrateLegacyQueue() {
  try {
    const raw = kvStorage.getItem(LEGACY_KEY);
    if (typeof raw !== 'string') return;
    const parsed = JSON.parse(raw) as { state?: { items?: OutboxItem[] } };
    for (const item of parsed.state?.items ?? []) {
      if (item?.id && item.type && item.priority) queueDb.insert({ ...item, attempts: item.attempts ?? 0 });
    }
    kvStorage.removeItem(LEGACY_KEY);
  } catch {
    // Si la cola antigua está dañada la dejamos como está: nunca borramos lo que no pudimos leer.
  }
}

const newestFirst = (items: OutboxItem[]) => [...items].sort((a, b) => b.createdAt - a.createdAt);

/** Orden de salida: emergencia → urgente → normal; dentro de cada una, lo más antiguo primero. */
export function sortOutgoing(items: OutboxItem[]): OutboxItem[] {
  return items
    .filter(isUnsent)
    .sort((a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority] || a.createdAt - b.createdAt);
}

export type FlushResult = {
  at: number;
  attempted: number;
  sent: number;
  failed: number;
  offline: boolean;
  error?: string;
};

export type DiscardResult = 'discarded' | 'needs-confirmation' | 'missing';

type OutboxState = {
  items: OutboxItem[];
  lastAttemptAt: number | null;
  flushing: boolean;
  enqueue: (type: OutboxType, payload: Record<string, unknown>, priority?: OutboxPriority) => OutboxItem;
  /** Intenta enviar lo pendiente en orden de prioridad. Cada intento queda registrado. */
  flush: () => Promise<FlushResult>;
  /** Quita un elemento de la cola. Los críticos exigen confirmación explícita: nunca en silencio. */
  discard: (id: string, confirmed?: boolean) => DiscardResult;
};

async function isOnline(): Promise<boolean> {
  try {
    const state = await Network.getNetworkStateAsync();
    return state.isConnected !== false && state.isInternetReachable !== false;
  } catch {
    return true; // si no podemos saberlo, dejamos que el transporte lo intente y falle con su mensaje
  }
}

migrateLegacyQueue();

export const useOutboxStore = create<OutboxState>()((set, get) => ({
  items: newestFirst(queueDb.loadAll()),
  lastAttemptAt: Number(queueDb.getMeta(META_LAST_ATTEMPT)) || null,
  flushing: false,

  enqueue: (type, payload, priority = 'normal') => {
    const item: OutboxItem = {
      id: Crypto.randomUUID(),
      type,
      payload,
      createdAt: Date.now(),
      deviceId: useSessionStore.getState().deviceId,
      syncStatus: 'local',
      priority,
      attempts: 0,
    };
    queueDb.insert(item); // primero a disco: si la app se cierra ahora, no se pierde
    set((state) => ({ items: [item, ...state.items] }));
    return item;
  },

  flush: async () => {
    if (get().flushing) return { at: Date.now(), attempted: 0, sent: 0, failed: 0, offline: false, error: 'Ya hay un intento en curso' };
    set({ flushing: true });

    const at = Date.now();
    const outgoing = sortOutgoing(get().items);
    const online = await isOnline();
    const transport = getTransport();
    const result: FlushResult = { at, attempted: outgoing.length, sent: 0, failed: 0, offline: !online };

    for (const item of outgoing) {
      const attempts = item.attempts + 1;
      let patch: Partial<OutboxItem>;

      if (!online) {
        patch = { attempts, lastAttemptAt: at, syncStatus: 'pending', lastError: 'Sin conexión' };
        result.error = 'Sin conexión';
        result.failed += 1;
      } else {
        const sent = await transport.send(item).catch(() => ({ ok: false as const, error: 'Error al enviar' }));
        if (sent.ok) {
          patch = { attempts, lastAttemptAt: at, syncStatus: sent.status, lastError: undefined };
          result.sent += 1;
        } else {
          patch = { attempts, lastAttemptAt: at, syncStatus: 'pending', lastError: sent.error };
          result.error = sent.error;
          result.failed += 1;
        }
      }

      queueDb.update(item.id, patch);
      set((state) => ({ items: state.items.map((i) => (i.id === item.id ? { ...i, ...patch } : i)) }));
    }

    queueDb.setMeta(META_LAST_ATTEMPT, String(at));
    set({ lastAttemptAt: at, flushing: false });
    return result;
  },

  discard: (id, confirmed = false) => {
    const item = get().items.find((i) => i.id === id);
    if (!item) return 'missing';
    if (item.priority === 'emergency' && !confirmed) return 'needs-confirmation';
    queueDb.remove(id);
    set((state) => ({ items: state.items.filter((i) => i.id !== id) }));
    return 'discarded';
  },
}));

export const isQueuePersistent = queueDb.persistent;

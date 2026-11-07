import * as Crypto from 'expo-crypto';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { SyncStatus } from '@/shared/sync/status';
import { kvStorage } from '@/shared/storage/kv';

export type ContactRequest = {
  id: string;
  postId: string;
  message: string;
  createdAt: number;
  syncStatus: SyncStatus;
};

type ContactState = {
  requests: ContactRequest[];
  getByPostId: (postId: string) => ContactRequest | undefined;
  add: (postId: string, message: string) => ContactRequest;
  /** Estado de envío por publicación, según la cola o el servidor. */
  setSyncStatus: (statuses: Record<string, SyncStatus>) => void;
};

/** Solicitudes de contacto locales. El chat no se abre hasta que exista servidor (etapa 10). */
export const useContactStore = create<ContactState>()(
  persist(
    (set, get) => ({
      requests: [],
      getByPostId: (postId) => get().requests.find((r) => r.postId === postId),
      add: (postId, message) => {
        const existing = get().requests.find((r) => r.postId === postId);
        if (existing) return existing;
        const item: ContactRequest = {
          id: Crypto.randomUUID(),
          postId,
          message: message.trim(),
          createdAt: Date.now(),
          syncStatus: 'local',
        };
        set((state) => ({ requests: [item, ...state.requests] }));
        return item;
      },
      setSyncStatus: (statuses) =>
        set((state) => ({
          requests: state.requests.map((r) => (statuses[r.postId] ? { ...r, syncStatus: statuses[r.postId] } : r)),
        })),
    }),
    { name: 'rvs.contact-requests.v1', storage: createJSONStorage(() => kvStorage) },
  ),
);

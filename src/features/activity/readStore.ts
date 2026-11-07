import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { kvStorage } from '@/shared/storage/kv';

/** Leído / no leído de la bandeja. Solo existe en este teléfono. */
type ReadState = {
  readIds: Record<string, true>;
  markRead: (id: string) => void;
  markAllRead: (ids: string[]) => void;
};

export const useActivityReadStore = create<ReadState>()(
  persist(
    (set) => ({
      readIds: {},
      markRead: (id) => set((state) => (state.readIds[id] ? state : { readIds: { ...state.readIds, [id]: true } })),
      markAllRead: (ids) =>
        set((state) => {
          const next = { ...state.readIds };
          for (const id of ids) next[id] = true;
          return { readIds: next };
        }),
    }),
    { name: 'rvs.activity-read.v1', storage: createJSONStorage(() => kvStorage) },
  ),
);

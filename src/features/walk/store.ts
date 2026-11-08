import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { kvStorage } from '@/shared/storage/kv';

import type { WalkSession } from './types';

type WalkState = {
  session: WalkSession | null;
  start: (session: WalkSession) => void;
  arrive: () => void;
  clear: () => void;
};

/** Trayecto en curso. Se guarda en el teléfono para que siga si se cierra la app. */
export const useWalkStore = create<WalkState>()(
  persist(
    (set) => ({
      session: null,
      start: (session) => set({ session }),
      arrive: () => set((s) => (s.session ? { session: { ...s.session, arrivedAt: Date.now() } } : s)),
      clear: () => set({ session: null }),
    }),
    { name: 'rvs.walk.v1', storage: createJSONStorage(() => kvStorage) },
  ),
);

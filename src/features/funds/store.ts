import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { kvStorage } from '@/shared/storage/kv';

import type { LocalContribution } from './types';

type ContributionsState = {
  contributions: LocalContribution[];
  /** Solo se llama con un pago ya confirmado por el proveedor. Ignora claves repetidas. */
  addConfirmed: (c: LocalContribution) => void;
};

/**
 * Aportes confirmados desde este teléfono. No guarda el número de Yape ni el código.
 * Con la pasarela real (SPEC-036) el total vendrá del servidor y esto quedará como historial propio.
 */
export const useContributionsStore = create<ContributionsState>()(
  persist(
    (set) => ({
      contributions: [],
      addConfirmed: (c) =>
        set((s) => (s.contributions.some((x) => x.id === c.id) ? s : { contributions: [c, ...s.contributions] })),
    }),
    { name: 'rvs.funds.v1', storage: createJSONStorage(() => kvStorage) },
  ),
);

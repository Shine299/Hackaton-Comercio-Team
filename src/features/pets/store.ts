import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { kvStorage } from '@/shared/storage/kv';

import type { PetSighting } from './types';

type PetsState = {
  sightings: PetSighting[];
  /** Guarda el avistamiento con la hora actual. */
  add: (s: Omit<PetSighting, 'createdAt'>) => void;
};

/**
 * Avistamientos marcados en este teléfono («Lo vi», «Necesita ayuda»). Todavía no se comparten con el
 * servidor: la app lo dice con «Guardado en tu teléfono».
 */
export const usePetsStore = create<PetsState>()(
  persist(
    (set) => ({
      sightings: [],
      add: (s) => set((st) => ({ sightings: [{ ...s, createdAt: Date.now() }, ...st.sightings].slice(0, 50) })),
    }),
    { name: 'rvs.pets.v1', storage: createJSONStorage(() => kvStorage) },
  ),
);

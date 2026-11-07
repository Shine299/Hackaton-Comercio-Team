import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { kvStorage } from '@/shared/storage/kv';

import { DEFAULT_SECTOR, SECTORS } from './data';
import type { Sector } from './types';

/**
 * Sector del vecino (Zustand + persistencia local).
 * Solo se guarda el sector elegido, nunca coordenadas del dispositivo.
 */
type SectorState = {
  sector: Sector;
  /** `true` si el sector lo eligió la persona (manual) o se confirmó con GPS. */
  sectorConfirmed: boolean;
  setSector: (sector: Sector) => void;
};

export const useSectorStore = create<SectorState>()(
  persist(
    (set) => ({
      sector: DEFAULT_SECTOR,
      sectorConfirmed: false,
      setSector: (sector) => set({ sector, sectorConfirmed: true }),
    }),
    {
      name: 'rvs.sector.v1',
      storage: createJSONStorage(() => kvStorage),
      partialize: (state) => ({ sector: state.sector, sectorConfirmed: state.sectorConfirmed }),
      // Si el catálogo cambia, nos quedamos con la versión vigente del sector guardado.
      merge: (persisted, current) => {
        const saved = (persisted as Partial<SectorState> | undefined)?.sector;
        const sector = SECTORS.find((s) => s.id === saved?.id) ?? current.sector;
        return {
          ...current,
          sector,
          sectorConfirmed: (persisted as Partial<SectorState> | undefined)?.sectorConfirmed ?? false,
        };
      },
    },
  ),
);

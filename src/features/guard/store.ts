import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { kvStorage } from '@/shared/storage/kv';

/**
 * Preferencias del Modo guardia (SPEC-052). Todo queda SOLO en este teléfono: el consentimiento, si está activa y el
 * contacto de confianza (nombre y teléfono) nunca se envían a un servidor.
 */
type GuardStore = {
  consented: boolean;
  /** Activa: escucha mientras se usa la app y se acuerda al volver a abrirla. Solo la persona la enciende y la apaga. */
  enabled: boolean;
  contactName: string;
  contactPhone: string;
  accept: () => void;
  setEnabled: (enabled: boolean) => void;
  setContact: (contact: { name?: string; phone?: string }) => void;
};

export const useGuardStore = create<GuardStore>()(
  persist(
    (set) => ({
      consented: false,
      enabled: false,
      contactName: '',
      contactPhone: '',
      accept: () => set({ consented: true }),
      setEnabled: (enabled) => set({ enabled }),
      setContact: ({ name, phone }) =>
        set((state) => ({ contactName: name ?? state.contactName, contactPhone: phone ?? state.contactPhone })),
    }),
    { name: 'rvs.guard.v1', storage: createJSONStorage(() => kvStorage) },
  ),
);

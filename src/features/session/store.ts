import * as Crypto from 'expo-crypto';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { kvStorage } from '@/shared/storage/kv';

/**
 * Sesión SIMULADA de la demo. Aún no hay servidor de cuentas (Supabase Auth llega en la etapa 10):
 * «registrarse» solo guarda un nombre público en el teléfono para poder probar los flujos que
 * exigen registro (publicar, contactar, guardar, reportar). Nada se envía a ningún servidor.
 */
type SessionState = {
  registered: boolean;
  /** Nombre corto público (nombre + inicial). Nunca teléfono ni correo. */
  displayName: string;
  /** Identifica este dispositivo en la cola de sincronización. */
  deviceId: string;
  register: (displayName: string) => void;
  updateDisplayName: (displayName: string) => void;
  signOut: () => void;
};

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      registered: false,
      displayName: '',
      deviceId: Crypto.randomUUID(),
      register: (displayName) => set({ registered: true, displayName: displayName.trim() }),
      updateDisplayName: (displayName) => set({ displayName: displayName.trim() }),
      signOut: () => set({ registered: false, displayName: '' }),
    }),
    {
      name: 'rvs.session.v1',
      storage: createJSONStorage(() => kvStorage),
    },
  ),
);

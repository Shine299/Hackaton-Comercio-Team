import Storage from 'expo-sqlite/kv-store';
import type { StateStorage } from 'zustand/middleware';

/**
 * Almacén clave-valor síncrono respaldado por SQLite (nativo).
 * Úsalo para preferencias no secretas (tutorial visto, sector elegido…).
 * Los secretos y tokens van en `expo-secure-store`, nunca aquí.
 */
export const kvStorage: StateStorage = {
  getItem: (key) => Storage.getItemSync(key),
  setItem: (key, value) => Storage.setItemSync(key, value),
  removeItem: (key) => {
    Storage.removeItemSync(key);
  },
};

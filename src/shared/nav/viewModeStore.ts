import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { kvStorage } from '@/shared/storage/kv';

export type ViewMode = 'standard' | 'easy';

type ViewModeState = {
  /** «Estándar» o «Fácil» (letra grande, botones enormes y una sola columna). Se guarda en el teléfono. */
  mode: ViewMode;
  setMode: (mode: ViewMode) => void;
};

export const useViewModeStore = create<ViewModeState>()(
  persist(
    (set) => ({
      mode: 'standard',
      setMode: (mode) => set({ mode }),
    }),
    { name: 'yunta.view-mode.v1', storage: createJSONStorage(() => kvStorage) },
  ),
);

/** `true` cuando la persona eligió el Modo fácil. */
export const useEasyMode = () => useViewModeStore((s) => s.mode === 'easy');

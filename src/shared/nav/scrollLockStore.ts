import { create } from 'zustand';

type ScrollLockState = {
  /** ¿Algo con gestos propios (un mapa) está siendo tocado? Entonces `Screen` no debe hacer scroll. */
  locked: boolean;
  lock: () => void;
  unlock: () => void;
};

export const useScrollLockStore = create<ScrollLockState>((set) => ({
  locked: false,
  lock: () => set((s) => (s.locked ? s : { locked: true })),
  unlock: () => set((s) => (s.locked ? { locked: false } : s)),
}));

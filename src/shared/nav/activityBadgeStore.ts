import { create } from 'zustand';

type ActivityBadgeState = {
  /** Avisos de Actividad sin leer (lo calcula `ActivityBadgeSync` y lo lee la campana de la cabecera). */
  unread: number;
  setUnread: (unread: number) => void;
};

export const useActivityBadgeStore = create<ActivityBadgeState>((set) => ({
  unread: 0,
  setUnread: (unread) => set((state) => (state.unread === unread ? state : { unread })),
}));

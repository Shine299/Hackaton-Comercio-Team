import { create } from 'zustand';

export type TourRect = { x: number; y: number; width: number; height: number };

type TourState = {
  active: boolean;
  step: number;
  /** Id del botón que el paso actual pide tocar (lo fija el recorrido). */
  expected: string | null;
  /** Posición en pantalla de cada botón marcado con `TourTarget`. */
  rects: Record<string, TourRect>;
  start: () => void;
  finish: () => void;
  setExpected: (id: string | null) => void;
  setRect: (id: string, rect: TourRect) => void;
  /** Lo llama `TourTarget` al tocarse: avanza solo si es el botón que se esperaba. */
  hit: (id: string) => void;
};

/**
 * Estado del recorrido guiado. Vive en `shared/` porque los botones marcados están en varias features
 * (barra, cabecera, chat) y ninguna debe depender de la feature del recorrido.
 */
export const useTourStore = create<TourState>((set, get) => ({
  active: false,
  step: 0,
  expected: null,
  rects: {},
  start: () => set({ active: true, step: 0, expected: null }),
  finish: () => set({ active: false, step: 0, expected: null }),
  setExpected: (id) => set((s) => (s.expected === id ? s : { expected: id })),
  setRect: (id, rect) => {
    const prev = get().rects[id];
    if (prev && prev.x === rect.x && prev.y === rect.y && prev.width === rect.width && prev.height === rect.height) return;
    set((s) => ({ rects: { ...s.rects, [id]: rect } }));
  },
  hit: (id) => {
    const s = get();
    if (s.active && s.expected === id) set({ step: s.step + 1, expected: null });
  },
}));

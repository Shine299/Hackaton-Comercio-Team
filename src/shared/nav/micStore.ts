import { create } from 'zustand';

type MicState = {
  /** Quién está grabando ahora (por ejemplo `asistente` o `nota-de-voz`). Mientras haya alguien, el Modo guardia se aparta. */
  holders: string[];
  hold: (owner: string) => void;
  release: (owner: string) => void;
};

/** Reparte el micrófono: dos grabadoras a la vez se pisan, así que quien graba lo avisa aquí (SPEC-052). */
export const useMicStore = create<MicState>((set) => ({
  holders: [],
  hold: (owner) => set((state) => (state.holders.includes(owner) ? state : { holders: [...state.holders, owner] })),
  release: (owner) => set((state) => (state.holders.includes(owner) ? { holders: state.holders.filter((h) => h !== owner) } : state)),
}));

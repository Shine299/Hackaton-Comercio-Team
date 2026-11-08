import { create } from 'zustand';

type GuardStatusState = {
  /** ¿El Modo guardia está escuchando ahora? Lo publica `features/guard`; lo lee la cabecera de `shell` para mostrar el indicador. */
  listening: boolean;
  setListening: (listening: boolean) => void;
};

export const useGuardStatusStore = create<GuardStatusState>((set) => ({
  listening: false,
  setListening: (listening) => set((state) => (state.listening === listening ? state : { listening })),
}));

import { create } from 'zustand';

/** Panel lateral del perfil: se abre tocando el ícono de Red Vecinal en la barra superior. */
export const useDrawerStore = create<{ open: boolean; setOpen: (open: boolean) => void }>((set) => ({
  open: false,
  setOpen: (open) => set((state) => (state.open === open ? state : { open })),
}));

import { create } from 'zustand';

type BarState = {
  /** ¿Hay una barra inferior de sección visible? La barra ya respeta el área segura de abajo,
   * así que `Screen` no debe sumar otro margen inferior cuando está visible. */
  visible: boolean;
  setVisible: (visible: boolean) => void;
  /** Sección desde la que se llegó a «Mapa» o «Solicitudes», que existen en dos secciones. */
  lastSection: 'dia' | 'emprendimientos';
  setLastSection: (section: 'dia' | 'emprendimientos') => void;
};

export const useBarStore = create<BarState>((set) => ({
  visible: false,
  setVisible: (visible) => set((state) => (state.visible === visible ? state : { visible })),
  lastSection: 'dia',
  setLastSection: (lastSection) => set((state) => (state.lastSection === lastSection ? state : { lastSection })),
}));

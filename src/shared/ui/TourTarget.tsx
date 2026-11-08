import { useEffect, useRef, type ComponentRef, type ReactNode } from 'react';
import { View } from 'react-native';

import { useTourStore } from '@/shared/nav/tourStore';

/** Vuelve a medir tras las transiciones de pantalla (el botón puede estar todavía entrando). */
const REMEASURE_MS = [0, 120, 420, 800];

/**
 * Marca un botón real para el recorrido guiado. No cambia cómo se ve ni cómo funciona: mide su posición
 * cuando el recorrido lo pide y avisa cuando se toca (el toque llega igual al botón de adentro).
 */
export function TourTarget({ id, children, className }: { id: string; children: ReactNode; className?: string }) {
  const ref = useRef<ComponentRef<typeof View>>(null);
  const expected = useTourStore((s) => s.active && s.expected === id);
  const setRect = useTourStore((s) => s.setRect);
  const hit = useTourStore((s) => s.hit);

  useEffect(() => {
    if (!expected) return;
    const measure = () =>
      ref.current?.measureInWindow((x, y, width, height) => {
        if (width > 0 && height > 0) setRect(id, { x, y, width, height });
      });
    const timers = REMEASURE_MS.map((ms) => setTimeout(measure, ms));
    return () => timers.forEach(clearTimeout);
  }, [expected, id, setRect]);

  return (
    <View ref={ref} collapsable={false} className={className} onTouchEnd={() => hit(id)}>
      {children}
    </View>
  );
}

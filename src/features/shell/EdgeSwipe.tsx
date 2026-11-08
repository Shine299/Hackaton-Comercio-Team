import { usePathname } from 'expo-router';
import { useMemo } from 'react';
import { PanResponder, View } from 'react-native';

import { useOnboardingStore } from '@/features/onboarding';
import { useDrawerStore } from '@/shared/nav/drawerStore';

/** Pantallas raíz (las que tienen cabecera con menú): ahí el borde izquierdo abre el menú lateral. */
const ROOTS = new Set(['/', '/comunidad', '/negocios', '/emergencias', '/ayuda', '/explorar', '/publicar']);

/**
 * Franja invisible en el borde izquierdo: al arrastrarla hacia la derecha se abre el menú lateral.
 * Solo existe en las pantallas raíz, para no pelear con el gesto de «volver» de las demás.
 */
export function EdgeSwipe() {
  const pathname = usePathname();
  const completed = useOnboardingStore((s) => s.completed);
  const setOpen = useDrawerStore((s) => s.setOpen);

  const responder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, g) => g.dx > 10 && Math.abs(g.dx) > Math.abs(g.dy) * 1.5,
        onPanResponderRelease: (_, g) => {
          if (g.dx > 40) setOpen(true);
        },
      }),
    [setOpen],
  );

  if (!completed || !ROOTS.has(pathname)) return null;

  return <View {...responder.panHandlers} style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 18 }} />;
}

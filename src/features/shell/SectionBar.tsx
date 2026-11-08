import { usePathname, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useOnboardingStore } from '@/features/onboarding';
import { useBarStore } from '@/shared/nav/barStore';
import { cn, Icon, Text, TourTarget } from '@/shared/ui';

import { BAR_ITEMS, resolveBar } from './sections';

/**
 * Barra inferior fija (SPEC-051): Inicio · Comunidad · Negocios · Ayuda.
 * Se muestra en las pantallas raíz; en la bandeja de mensajes y en Emergencia aparece sin pestaña resaltada para que siempre haya salida.
 * El chat vive en la burbuja flotante (`ChatFab`), no aquí.
 */
export function SectionBar() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const onboardingCompleted = useOnboardingStore((s) => s.completed);
  const setVisible = useBarStore((s) => s.setVisible);

  const bar = onboardingCompleted ? resolveBar(pathname) : null;
  const active = bar?.active ?? null;
  const visible = Boolean(bar);

  useEffect(() => {
    setVisible(visible);
  }, [visible, setVisible]);

  if (!bar) return null;

  return (
    <View
      accessibilityRole="tablist"
      className="flex-row items-end justify-around border-t border-outline-variant bg-surface px-1 pt-2"
      style={{ paddingBottom: Math.max(insets.bottom, 8) }}>
      {BAR_ITEMS.map((item) => {
        const focused = item.key === active;
        // Los 4 accesos se ven igual (Emergencia ya no va aparte): el activo se marca con fondo, ícono relleno y texto.
        const iconTone = focused ? 'primary' : 'onSurfaceVariant';
        return (
          <TourTarget key={item.key} id={`tab-${item.key}`} className="flex-1">
          <Pressable
            accessibilityRole="tab"
            accessibilityLabel={item.a11y}
            accessibilityState={{ selected: focused }}
            onPress={() => {
              if (!focused) router.navigate(item.href);
            }}
            className="min-h-14 items-center justify-end gap-1 active:opacity-70">
            <View
              className={cn(
                'h-8 w-14 items-center justify-center rounded-full',
                focused && 'bg-primary-fixed',
              )}>
              <Icon name={focused ? item.iconActive : item.icon} size={24} color={iconTone} />
            </View>
            <Text
              variant="label-sm"
              // La barra tiene ancho fijo: limitamos el escalado para que las 4 etiquetas quepan.
              maxFontSizeMultiplier={1.2}
              numberOfLines={1}
              tone={focused ? 'primary' : 'muted'}>
              {item.label}
            </Text>
          </Pressable>
          </TourTarget>
        );
      })}
    </View>
  );
}

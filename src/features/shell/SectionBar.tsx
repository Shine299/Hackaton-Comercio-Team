import { usePathname, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useOnboardingStore } from '@/features/onboarding';
import { useBarStore } from '@/shared/nav/barStore';
import { cn, Icon, Text, TourTarget } from '@/shared/ui';

import { BAR_ITEMS, resolveBar } from './sections';

/**
 * Barra inferior fija (SPEC-051): Inicio y los 4 servicios — Comunidad · Negocios · Emergencia · Marketplace.
 * Se muestra en las pantallas raíz; en la bandeja de mensajes aparece sin pestaña resaltada para que siempre haya salida.
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
        // Emergencia es la única en rojo: un color = un significado.
        const iconTone = item.danger ? 'error' : focused ? 'primary' : 'onSurfaceVariant';
        const labelTone = item.danger ? 'error' : focused ? 'primary' : 'muted';
        return (
          <TourTarget key={item.key} id={`tab-${item.key}`} className={item.key === 'marketplace' ? 'flex-[1.2]' : 'flex-1'}>
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
                focused && (item.danger ? 'bg-error-container' : 'bg-primary-fixed'),
              )}>
              <Icon name={focused ? item.iconActive : item.icon} size={24} color={iconTone} />
            </View>
            <Text
              variant="label-sm"
              // La barra tiene ancho fijo: limitamos el escalado para que las 5 etiquetas quepan.
              maxFontSizeMultiplier={1.2}
              numberOfLines={1}
              tone={labelTone}>
              {item.label}
            </Text>
          </Pressable>
          </TourTarget>
        );
      })}
    </View>
  );
}

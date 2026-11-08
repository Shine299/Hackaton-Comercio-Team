import { usePathname, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useOnboardingStore } from '@/features/onboarding';
import { useBarStore } from '@/shared/nav/barStore';
import { useChatBadgeStore } from '@/shared/nav/chatBadgeStore';
import { cn, Icon, Text, TourTarget } from '@/shared/ui';

import { BAR_ITEMS, resolveBar } from './sections';

/**
 * Barra inferior fija (SPEC-051): Inicio · Comunidad · Negocios · Ayuda · Chat.
 * Se muestra en las pantallas raíz (no en el Inicio); en Emergencia aparece sin pestaña resaltada para que siempre haya salida.
 * La pestaña Chat lleva el número de conversaciones sin leer. La burbuja flotante es el asistente (`AssistantFab`), no esta barra.
 */
export function SectionBar() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const onboardingCompleted = useOnboardingStore((s) => s.completed);
  const setVisible = useBarStore((s) => s.setVisible);
  const unreadChats = useChatBadgeStore((s) => s.unread);

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
        // Todos los accesos se ven igual: el activo se marca con fondo, ícono relleno y texto.
        const iconTone = focused ? 'primary' : 'onSurfaceVariant';
        const unread = item.key === 'chat' ? unreadChats : 0;
        return (
          <TourTarget key={item.key} id={`tab-${item.key}`} className="flex-1">
          <Pressable
            accessibilityRole="tab"
            accessibilityLabel={unread > 0 ? `${item.a11y}. ${unread} sin leer` : item.a11y}
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
              {unread > 0 ? (
                <View className="absolute right-1 top-0 h-5 min-w-5 items-center justify-center rounded-full bg-secondary px-1">
                  <Text variant="label-sm" tone="onSecondary">
                    {unread > 9 ? '9+' : unread}
                  </Text>
                </View>
              ) : null}
            </View>
            <Text
              variant="label-sm"
              // La barra tiene ancho fijo: limitamos el escalado para que las 5 etiquetas quepan.
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

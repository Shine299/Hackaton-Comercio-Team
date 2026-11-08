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
 * Barra inferior fija de 5 (SPEC-043): Inicio · Eventos · Explorar · Marketplace · Chat.
 * Se muestra en las pantallas raíz; en Emergencia aparece sin pestaña resaltada para que siempre haya salida.
 */
export function SectionBar() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const onboardingCompleted = useOnboardingStore((s) => s.completed);
  const setVisible = useBarStore((s) => s.setVisible);
  const chatUnread = useChatBadgeStore((s) => s.unread);

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
        const iconTone = focused ? 'primary' : 'onSurfaceVariant';
        // SPEC-048: conversaciones sin leer en la pestaña Chat (número + texto para el lector, no solo color).
        const badge = item.key === 'chat' && chatUnread > 0 ? chatUnread : 0;
        return (
          <TourTarget key={item.key} id={`tab-${item.key}`} className={item.key === 'marketplace' ? 'flex-[1.4]' : 'flex-1'}>
          <Pressable
            accessibilityRole="tab"
            accessibilityLabel={badge > 0 ? `${item.a11y}, ${badge} sin leer` : item.a11y}
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
              {badge > 0 ? (
                <View className="absolute -top-1 right-1.5 min-w-5 items-center justify-center rounded-full bg-secondary px-1">
                  <Text variant="label-sm" tone="onSecondary" maxFontSizeMultiplier={1.2}>
                    {badge > 9 ? '9+' : badge}
                  </Text>
                </View>
              ) : null}
            </View>
            <Text
              variant="label-sm"
              // La barra tiene ancho fijo: limitamos el escalado para que 5 etiquetas quepan.
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

import { usePathname, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useOnboardingStore } from '@/features/onboarding';
import { useBarStore } from '@/shared/nav/barStore';
import { cn, Icon, Text } from '@/shared/ui';

import { BAR_ITEMS, resolveSection } from './sections';

/**
 * Barra inferior fija de 5: Inicio · Comunidad · Emprendimientos · Emergencia · Ayuda.
 * Solo se muestra en la pantalla raíz de cada sección. Emergencia conserva su acento rojo.
 */
export function SectionBar() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const onboardingCompleted = useOnboardingStore((s) => s.completed);
  const setVisible = useBarStore((s) => s.setVisible);

  const active = onboardingCompleted ? resolveSection(pathname) : null;

  useEffect(() => {
    setVisible(Boolean(active));
  }, [active, setVisible]);

  if (!active) return null;

  return (
    <View
      accessibilityRole="tablist"
      className="flex-row items-end justify-around border-t border-outline-variant bg-surface px-1 pt-2"
      style={{ paddingBottom: Math.max(insets.bottom, 8) }}>
      {BAR_ITEMS.map((item) => {
        const focused = item.key === active;
        const danger = item.key === 'emergencia';
        const iconTone = danger ? 'error' : focused ? 'primary' : 'onSurfaceVariant';
        return (
          <Pressable
            key={item.key}
            accessibilityRole="tab"
            accessibilityLabel={item.a11y}
            accessibilityState={{ selected: focused }}
            onPress={() => {
              if (!focused) router.navigate(item.href);
            }}
            className={cn('min-h-14 items-center justify-end gap-1 active:opacity-70', item.key === 'emprendimientos' ? 'flex-[1.5]' : 'flex-1')}>
            <View
              className={cn(
                'h-8 w-14 items-center justify-center rounded-full',
                focused && (danger ? 'bg-error-container' : 'bg-primary-fixed'),
              )}>
              <Icon name={focused ? item.iconActive : item.icon} size={24} color={iconTone} />
            </View>
            <Text
              variant="label-sm"
              // La barra tiene ancho fijo: limitamos el escalado para que 5 etiquetas quepan.
              maxFontSizeMultiplier={1.2}
              numberOfLines={1}
              tone={focused ? (danger ? 'error' : 'primary') : 'muted'}>
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

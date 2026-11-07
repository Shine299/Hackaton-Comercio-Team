import { useGlobalSearchParams, usePathname, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useOnboardingStore } from '@/features/onboarding';
import { useBarStore } from '@/shared/nav/barStore';
import { cn, Icon, Text } from '@/shared/ui';

import { resolveSection, SECTION_ITEMS } from './sections';

/**
 * Barra inferior de la sección actual. Cambia según dónde estés: Inicio muestra las 4 secciones y cada
 * sección tiene la suya. Emergencia usa el acento rojo. En formularios y detalles no aparece.
 */
export function SectionBar() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useGlobalSearchParams<{ layer?: string; tab?: string }>();
  const insets = useSafeAreaInsets();
  const onboardingCompleted = useOnboardingStore((s) => s.completed);
  const setVisible = useBarStore((s) => s.setVisible);
  // «Mapa» y «Solicitudes» están en dos secciones: se recuerda desde cuál llegaste.
  const last = useBarStore((s) => s.lastSection);
  const setLast = useBarStore((s) => s.setLastSection);

  const resolved = onboardingCompleted ? resolveSection(pathname, params, last) : null;
  const section = resolved?.section;
  const active = resolved?.active;

  useEffect(() => {
    setVisible(Boolean(section));
    if ((section === 'dia' || section === 'emprendimientos') && pathname !== '/actividad') setLast(section);
  }, [section, pathname, setVisible, setLast]);

  if (!section || !active) return null;
  const danger = section === 'emergencia';

  return (
    <View
      accessibilityRole="tablist"
      className={cn(
        'flex-row items-end justify-around border-t bg-surface px-2 pt-1',
        danger ? 'border-error-container' : 'border-outline-variant',
      )}
      style={{ paddingBottom: Math.max(insets.bottom, 8) }}>
      {SECTION_ITEMS[section].map((item) => {
        const focused = item.key === active;
        const tone = focused ? (danger ? 'error' : 'primary') : 'onSurfaceVariant';
        return (
          <Pressable
            key={item.key}
            accessibilityRole="tab"
            accessibilityLabel={item.a11y}
            accessibilityState={{ selected: focused }}
            onPress={() => {
              if (!focused) router.navigate(item.href);
            }}
            className="min-h-14 min-w-16 flex-1 items-center justify-center gap-0.5 active:opacity-70">
            {item.pill ? (
              <View
                className={cn(
                  'h-9 w-14 items-center justify-center rounded-xl',
                  item.pill === 'danger' ? 'bg-error' : 'bg-primary',
                )}>
                <Icon name={item.icon} size={26} color={item.pill === 'danger' ? 'onError' : 'onPrimary'} />
              </View>
            ) : (
              <Icon name={focused && item.iconActive ? item.iconActive : item.icon} size={24} color={tone} />
            )}
            <Text
              variant="label-sm"
              // La barra tiene ancho fijo: limitamos el escalado para que 5 etiquetas quepan.
              maxFontSizeMultiplier={1.3}
              numberOfLines={1}
              tone={focused ? (danger ? 'error' : 'primary') : item.pill ? 'default' : 'muted'}
              className={cn(focused && 'underline')}>
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

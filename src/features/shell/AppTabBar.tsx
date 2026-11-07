import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { cn, Icon, Text, type IconName } from '@/shared/ui';

type TabConfig = {
  label: string;
  icon: IconName;
  iconActive: IconName;
  a11yLabel: string;
  /** Acción central destacada (Publicar). */
  primary?: boolean;
};

/** Cinco destinos definidos en 02_ux_ui/arquitectura_y_flujos.md §1. */
const TABS: Record<string, TabConfig> = {
  index: { label: 'Inicio', icon: 'home-outline', iconActive: 'home', a11yLabel: 'Inicio' },
  explorar: {
    label: 'Explorar',
    icon: 'compass-outline',
    iconActive: 'compass',
    a11yLabel: 'Explorar publicaciones',
  },
  publicar: {
    label: 'Publicar',
    icon: 'plus',
    iconActive: 'plus',
    a11yLabel: 'Publicar: ofrecer o solicitar ayuda',
    primary: true,
  },
  // Emprendimientos tiene su propia pestaña. Actividad sigue existiendo, pero se abre desde la campana del Inicio.
  negocios: {
    label: 'Negocios',
    icon: 'storefront-outline',
    iconActive: 'storefront',
    a11yLabel: 'Emprendimientos del barrio',
  },
  perfil: {
    label: 'Perfil',
    icon: 'account-outline',
    iconActive: 'account',
    a11yLabel: 'Perfil',
  },
};

/** Barra inferior con acción central «Publicar» (referencia: Stitch). */
export function AppTabBar({ state, emitter, navigateToTab }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="flex-row items-end justify-around border-t border-outline-variant bg-surface px-2 pt-1"
      style={{ paddingBottom: Math.max(insets.bottom, 8) }}>
      {state.routes.map((route, index) => {
        const config = TABS[route.name];
        if (!config) return null;
        const focused = state.index === index;

        const onPress = () => {
          const event = emitter.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!focused && !event.defaultPrevented) {
            navigateToTab(route.key);
          }
        };

        return (
          <Pressable
            key={route.key}
            accessibilityRole="tab"
            accessibilityLabel={config.a11yLabel}
            accessibilityState={{ selected: focused }}
            onPress={onPress}
            onLongPress={() => emitter.emit({ type: 'tabLongPress', target: route.key })}
            className="min-h-14 min-w-16 flex-1 items-center justify-center gap-0.5 active:opacity-70">
            {config.primary ? (
              <View className="h-11 w-11 items-center justify-center rounded-full bg-primary shadow-md elevation-md">
                <Icon name={config.icon} size={26} color="onPrimary" />
              </View>
            ) : (
              <Icon
                name={focused ? config.iconActive : config.icon}
                size={24}
                color={focused ? 'primary' : 'onSurfaceVariant'}
              />
            )}
            <Text
              variant="label-sm"
              // La barra tiene ancho fijo: limitamos más el escalado para que 5 etiquetas quepan.
              maxFontSizeMultiplier={1.3}
              numberOfLines={1}
              tone={focused || config.primary ? 'primary' : 'muted'}
              className={cn(focused && 'underline')}>
              {config.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

import { useRouter, type Href } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Modal, Pressable, ScrollView, useWindowDimensions, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TRUST_LABEL } from '@/features/posts';
import { useSectorStore } from '@/features/sector';
import { useSessionStore } from '@/features/session';
import { useDrawerStore } from '@/shared/nav/drawerStore';
import { Button, colors, Icon, Text, type IconName } from '@/shared/ui';

type DrawerLink = { label: string; icon: IconName; href: Href };

/** Duración de entrada y de salida del panel (ms). */
const OPEN_MS = 240;
const CLOSE_MS = 200;

const LINKS: DrawerLink[] = [
  { label: 'Mi perfil', icon: 'account-outline', href: '/perfil' },
  { label: 'Guardados', icon: 'bookmark-outline', href: { pathname: '/perfil', params: { tab: 'saved' } } },
  { label: 'Privacidad y disponibilidad', icon: 'lock-outline', href: { pathname: '/perfil', params: { tab: 'privacy' } } },
  { label: 'Ajustes de la cuenta', icon: 'cog-outline', href: { pathname: '/perfil', params: { tab: 'settings' } } },
  { label: 'Mensajes', icon: 'message-text-outline', href: '/mensajes' },
  { label: 'Solicitudes y avisos', icon: 'inbox-outline', href: '/actividad' },
  { label: 'Ver el tutorial', icon: 'school-outline', href: '/onboarding' },
];

/**
 * Barra lateral con tu perfil. Se abre con el ícono de menú o deslizando desde el borde izquierdo; toca fuera o usa «Atrás» para
 * cerrarla. Cada acceso lleva a algo que ya existe en la app.
 */
export function ProfileDrawer() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const open = useDrawerStore((s) => s.open);
  const setOpen = useDrawerStore((s) => s.setOpen);
  const registered = useSessionStore((s) => s.registered);
  const displayName = useSessionStore((s) => s.displayName);
  const sector = useSectorStore((s) => s.sector);

  const panelWidth = Math.min(320, Math.round(width * 0.86));
  const reduceMotion = useReducedMotion();

  // El panel entra desde la izquierda y, al cerrar, se recoge hacia la izquierda antes de desaparecer.
  const offset = useSharedValue(-panelWidth);
  const backdrop = useSharedValue(0);
  const closing = useRef(false);
  const panelStyle = useAnimatedStyle(() => ({ transform: [{ translateX: offset.get() }] }));
  const backdropStyle = useAnimatedStyle(() => ({ opacity: backdrop.get() }));

  useEffect(() => {
    if (!open) return;
    closing.current = false;
    offset.set(-panelWidth);
    backdrop.set(0);
    offset.set(withTiming(0, { duration: reduceMotion ? 0 : OPEN_MS, easing: Easing.out(Easing.cubic) }));
    backdrop.set(withTiming(1, { duration: reduceMotion ? 0 : OPEN_MS }));
  }, [open, panelWidth, reduceMotion, offset, backdrop]);

  /** Recoge el panel y, cuando terminó, cierra el menú y ejecuta `after` (por ejemplo, navegar). */
  const close = (after?: () => void) => {
    if (closing.current) return;
    closing.current = true;
    const ms = reduceMotion ? 0 : CLOSE_MS;
    offset.set(withTiming(-panelWidth, { duration: ms, easing: Easing.in(Easing.cubic) }));
    backdrop.set(withTiming(0, { duration: ms }));
    setTimeout(() => {
      setOpen(false);
      after?.();
    }, ms);
  };
  const go = (href: Href) => close(() => router.navigate(href));

  return (
    <Modal visible={open} transparent animationType="none" onRequestClose={() => close()} statusBarTranslucent>
      <View className="flex-1 flex-row" accessibilityViewIsModal>
        <Animated.View pointerEvents="none" className="absolute inset-0 bg-black/40" style={backdropStyle} />
        <Animated.View style={[{ width: panelWidth, backgroundColor: colors.surface }, panelStyle]}>
          <ScrollView
            contentContainerClassName="gap-4 px-4 pb-6"
            contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: Math.max(insets.bottom, 16) }}
            showsVerticalScrollIndicator={false}>
            <View className="gap-3 rounded-3xl bg-primary-container p-4">
              <View className="flex-row items-center gap-3">
                <View className="h-14 w-14 items-center justify-center rounded-full bg-surface-container-lowest">
                  <Text variant="headline-md" tone="primary">
                    {registered ? displayName.charAt(0).toUpperCase() || '?' : '?'}
                  </Text>
                </View>
                <View className="min-w-0 flex-1">
                  <Text variant="headline-sm" tone="onPrimary" numberOfLines={1}>
                    {registered ? displayName : 'Aún sin perfil'}
                  </Text>
                  <View className="flex-row items-center gap-1">
                    <Icon name="sprout-outline" size={16} color="onPrimaryContainer" />
                    <Text variant="label-md" tone="onPrimary">
                      {TRUST_LABEL.new}
                    </Text>
                  </View>
                </View>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Sector actual: ${sector.name}, radio de ${sector.radiusKm} kilómetros. Toca para cambiarlo`}
                onPress={() => go('/sector')}
                className="min-h-11 flex-row items-center gap-2 rounded-xl bg-surface-container-lowest px-3 active:opacity-80">
                <Icon name="map-marker-radius-outline" size={20} color="primary" />
                <Text variant="body-md-medium" className="flex-1" numberOfLines={1}>
                  {sector.name} · {sector.radiusKm} km
                </Text>
                <Text variant="label-md" tone="primary">
                  Cambiar
                </Text>
              </Pressable>
            </View>

            {!registered ? (
              <Button label="Crear mi perfil" icon="account-plus-outline" onPress={() => go('/perfil')} />
            ) : null}

            <View className="gap-1">
              {LINKS.map((link) => (
                <Pressable
                  key={link.label}
                  accessibilityRole="button"
                  accessibilityLabel={link.label}
                  onPress={() => go(link.href)}
                  className="min-h-14 flex-row items-center gap-3 rounded-2xl px-3 active:bg-surface-container">
                  <View className="h-10 w-10 items-center justify-center rounded-xl bg-primary-fixed">
                    <Icon name={link.icon} size={22} color="primary" />
                  </View>
                  <Text variant="body-lg" className="flex-1">
                    {link.label}
                  </Text>
                  <Icon name="chevron-right" size={22} color="onSurfaceVariant" />
                </Pressable>
              ))}
            </View>

            <Text variant="label-md" tone="muted">
              Yunta · Tu comunidad, más cerca. Tu perfil se guarda en este teléfono.
            </Text>
          </ScrollView>
        </Animated.View>
        <Pressable accessibilityRole="button" accessibilityLabel="Cerrar el menú" className="flex-1" onPress={() => close()} />
      </View>
    </Modal>
  );
}

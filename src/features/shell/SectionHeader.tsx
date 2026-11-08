import { useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';

import { useSectorStore } from '@/features/sector';
import { useSessionStore } from '@/features/session';
import { useActivityBadgeStore } from '@/shared/nav/activityBadgeStore';
import { useDrawerStore } from '@/shared/nav/drawerStore';
import { BrandLogo, Icon, Text } from '@/shared/ui';

/** Mismo tamaño de logo en todas las secciones y en Inicio, para que la parte de arriba se vea pareja. */
const BRAND_HEIGHT = 34;

type SectionHeaderProps = {
  title?: string;
  /** Emergencia pinta el título en rojo oscuro. */
  danger?: boolean;
  /** Reemplaza la línea del sector (por ejemplo, el saludo del Inicio). */
  eyebrow?: ReactNode;
};

/**
 * Cabecera común de las pantallas raíz. Fila de arriba: menú ☰, logo de Yunta, notificaciones y tu foto.
 * Debajo: tu sector y el título de la sección. El resto de accesos secundarios viven en el menú.
 */
export function SectionHeader({ title, danger = false, eyebrow }: SectionHeaderProps) {
  const router = useRouter();
  const sector = useSectorStore((s) => s.sector);
  const unread = useActivityBadgeStore((s) => s.unread);
  const setDrawerOpen = useDrawerStore((s) => s.setOpen);
  const registered = useSessionStore((s) => s.registered);
  const displayName = useSessionStore((s) => s.displayName);

  return (
    <View className="gap-3">
      <View className="flex-row items-center justify-between gap-3">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Abrir el menú"
          accessibilityHint="También puedes deslizar desde el borde izquierdo"
          onPress={() => setDrawerOpen(true)}
          className="h-11 w-11 items-center justify-center rounded-full bg-surface-container-lowest shadow-sm elevation-xs active:opacity-80">
          <Icon name="menu" size={24} color="primary" />
        </Pressable>

        <View className="min-w-0 flex-1 items-center">
          <BrandLogo variant="lockup" height={BRAND_HEIGHT} />
        </View>

        <View className="flex-row gap-2">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={unread > 0 ? `Notificaciones, ${unread} nuevas` : 'Notificaciones'}
            onPress={() => router.push('/actividad')}
            className="h-11 w-11 items-center justify-center rounded-full bg-surface-container-lowest shadow-sm elevation-xs active:opacity-80">
            <Icon name="bell-outline" size={22} color="primary" />
            {unread > 0 ? (
              <View className="absolute -right-1 -top-1 h-5 min-w-5 items-center justify-center rounded-full bg-secondary px-1">
                <Text variant="label-sm" tone="onSecondary">
                  {unread > 9 ? '9+' : unread}
                </Text>
              </View>
            ) : null}
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Tu perfil y configuración"
            onPress={() => setDrawerOpen(true)}
            className="h-11 w-11 items-center justify-center rounded-full bg-primary-container active:opacity-80">
            <Text variant="body-lg-bold" tone="onPrimary">
              {registered ? displayName.charAt(0).toUpperCase() || '?' : '?'}
            </Text>
          </Pressable>
        </View>
      </View>

      <View className="min-w-0">
        {eyebrow ?? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Tu sector: ${sector.name}, ${sector.radiusKm} kilómetros. Cambiar`}
            onPress={() => router.push('/sector')}
            className="min-h-7 flex-row items-center gap-0.5 self-start">
            <Icon name="map-marker" size={17} color="primary" />
            <Text variant="label-md" tone="muted" numberOfLines={1}>
              {sector.name} · {sector.radiusKm} km
            </Text>
            <Icon name="chevron-down" size={20} color="primary" />
          </Pressable>
        )}
        {title ? (
          <Text variant="headline-lg" tone={danger ? 'error' : 'default'} accessibilityRole="header">
            {title}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

import { useRouter } from 'expo-router';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useSectorStore } from '@/features/sector';
import { useDrawerStore } from '@/shared/nav/drawerStore';
import { Icon, Text } from '@/shared/ui';

/**
 * Barra superior del modo Día a Día (referencia: Stitch «Inicio inteligente»).
 * Incluye el acceso persistente al Modo Emergencia (SOS) en todas las pestañas.
 */
export function TopBar() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const sector = useSectorStore((s) => s.sector);
  const setDrawerOpen = useDrawerStore((s) => s.setOpen);

  return (
    <View
      className="border-b border-outline-variant bg-surface px-4 pb-2"
      style={{ paddingTop: insets.top + 8 }}>
      <View className="flex-row items-center justify-between gap-2">
        <View className="min-w-0 flex-1 flex-row items-center gap-2">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Abrir el menú con tu perfil"
            onPress={() => setDrawerOpen(true)}
            hitSlop={6}
            className="h-12 w-12 items-center justify-center rounded-xl bg-primary-container active:opacity-80">
            <Icon name="account-group" size={24} color="onPrimary" />
          </Pressable>
          <View className="min-w-0 flex-1">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Abrir el menú con tu perfil"
              onPress={() => setDrawerOpen(true)}
              className="self-start">
              <Text variant="headline-sm" numberOfLines={1}>
                Yunta
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Sector actual: ${sector.name}, radio de ${sector.radiusKm} kilómetros. Toca para cambiar`}
              onPress={() => router.push('/sector')}
              hitSlop={8}
              className="flex-row items-center gap-1">
              <Icon name="near-me" size={14} color="primary" />
              <Text variant="label-sm" tone="muted" numberOfLines={1}>
                {sector.name} · {sector.radiusKm} km
              </Text>
            </Pressable>
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Abrir Modo Emergencia"
          onPress={() => router.push('/emergencias')}
          className="min-h-12 flex-row items-center justify-center gap-1.5 rounded-full bg-error-container px-4 active:opacity-80">
          <Icon name="alarm-light-outline" size={20} color="error" />
          <Text variant="body-lg-bold" tone="error">
            SOS
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

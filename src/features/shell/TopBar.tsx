import { useRouter } from 'expo-router';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useSectorStore } from '@/features/sector';
import { Icon, Text } from '@/shared/ui';

/**
 * Barra superior del modo Día a Día (referencia: Stitch «Inicio inteligente»).
 * Incluye el acceso persistente al Modo Emergencia (SOS) en todas las pestañas.
 */
export function TopBar() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const sector = useSectorStore((s) => s.sector);

  return (
    <View
      className="border-b border-outline-variant bg-surface px-4 pb-2"
      style={{ paddingTop: insets.top + 8 }}>
      <View className="flex-row items-center justify-between gap-2">
        <View className="min-w-0 flex-1 flex-row items-center gap-2">
          <View className="h-10 w-10 items-center justify-center rounded-xl bg-primary-container">
            <Icon name="account-group" size={22} color="onPrimary" />
          </View>
          <View className="min-w-0 flex-1">
            <Text variant="headline-sm" numberOfLines={1}>
              Red Vecinal
            </Text>
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

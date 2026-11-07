import { useRouter } from 'expo-router';
import { View } from 'react-native';

import { Button, Screen, Text } from '@/shared/ui';

import { SectorPicker } from './components/SectorPicker';
import { useSectorStore } from './store';

/** Pantalla modal para cambiar de sector (GPS opcional o selección manual). */
export function SectorScreen() {
  const router = useRouter();
  const radiusKm = useSectorStore((s) => s.sector.radiusKm);

  return (
    <Screen safeBottom footer={<Button label="Listo" onPress={() => router.back()} />}>
      <View className="gap-1">
        <Text variant="headline-md" accessibilityRole="header">
          Elige tu sector
        </Text>
        <Text tone="muted">
          Verás publicaciones y alertas a unos {radiusKm} km a la redonda. No necesitamos tu
          ubicación exacta.
        </Text>
      </View>
      <SectorPicker />
    </Screen>
  );
}

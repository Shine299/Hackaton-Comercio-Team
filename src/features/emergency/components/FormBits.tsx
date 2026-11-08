import { useRouter } from 'expo-router';
import { View } from 'react-native';

import { useSectorStore } from '@/features/sector';
import { Button, Card, Icon, Text } from '@/shared/ui';

/** Zona aproximada = sector. No se pide ni guarda GPS. */
export function ApproxZoneCard() {
  const router = useRouter();
  const sector = useSectorStore((s) => s.sector);
  return (
    <Card tone="low">
      <View className="flex-row items-center gap-2">
        <Icon name="map-marker-radius-outline" size={22} color="primary" />
        <View className="flex-1">
          <Text variant="label-md" tone="muted">
            Zona aproximada
          </Text>
          <Text variant="body-lg-bold">{sector.name}</Text>
        </View>
      </View>
      <Text variant="label-md" tone="muted">
        Solo se usa tu sector, nunca tu ubicación exacta.
      </Text>
      <Button label="Cambiar sector" variant="ghost" icon="pencil-outline" fullWidth={false} onPress={() => router.push('/sector')} />
    </Card>
  );
}

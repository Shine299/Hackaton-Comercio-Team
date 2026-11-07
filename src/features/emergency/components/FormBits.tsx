import { Image } from 'expo-image';
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

type PhotoFieldProps = {
  photoUri?: string;
  hint?: string;
  onPick: () => void;
  onClear: () => void;
};

export function PhotoField({ photoUri, hint, onPick, onClear }: PhotoFieldProps) {
  return (
    <View className="gap-2">
      <Text variant="label-md" tone="muted">
        Foto (opcional)
      </Text>
      {photoUri ? (
        <View className="gap-2">
          <Image
            source={{ uri: photoUri }}
            style={{ width: '100%', height: 180, borderRadius: 16 }}
            contentFit="cover"
            accessibilityLabel="Foto adjunta"
          />
          <Button label="Quitar foto" variant="ghost" icon="close" onPress={onClear} />
        </View>
      ) : (
        <Button label="Añadir foto" variant="outline" icon="camera-outline" onPress={onPick} />
      )}
      {hint ? (
        <Text variant="label-md" tone="muted">
          {hint}
        </Text>
      ) : null}
    </View>
  );
}

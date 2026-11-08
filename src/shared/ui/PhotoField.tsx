import { Image } from 'expo-image';
import { View } from 'react-native';

import { Button } from './Button';
import { Text } from './Text';

type PhotoFieldProps = {
  photoUri?: string;
  hint?: string;
  onPick: () => void;
  onClear: () => void;
};

/** Campo de foto opcional (añadir, ver y quitar). Lo usan los formularios de emergencia y de negocios. */
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

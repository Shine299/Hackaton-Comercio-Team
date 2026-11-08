import { Image } from 'expo-image';
import { useState } from 'react';
import { View } from 'react-native';

import { avatarColor, initialsOf } from './avatarColors';
import { Text } from './Text';

type AvatarProps = {
  /** Nombre público: de ahí salen las iniciales. */
  name: string;
  /** Id estable (vecino o sesión): fija el color. */
  id: string;
  size?: 32 | 40 | 56;
  /** Foto opcional (SPEC-048). Sin foto, iniciales. */
  uri?: string;
  /** Foto empaquetada en la app (módulo de `require`), p. ej. la de un vecino de demo. Si hay `uri`, gana `uri`. */
  photo?: number;
  /** Si se da, el avatar se anuncia solo; si no, es decorativo (lo lee la tarjeta que lo contiene). */
  accessibilityLabel?: string;
};

const TEXT_VARIANT = { 32: 'label-sm', 40: 'label-md', 56: 'headline-sm' } as const;

/** Avatar con iniciales sobre un color estable (SPEC-044). Nunca exige una foto real. */
export function Avatar({ name, id, size = 40, uri, photo, accessibilityLabel }: AvatarProps) {
  // Si la foto ya no existe (el sistema puede borrar la copia de la galería), vuelve a las iniciales: nunca un hueco.
  const [failedUri, setFailedUri] = useState<string | undefined>();
  const [photoFailed, setPhotoFailed] = useState(false);
  const showUri = Boolean(uri) && uri !== failedUri;
  const source = showUri ? { uri } : photo != null && !photoFailed ? photo : undefined;
  const a11y = accessibilityLabel
    ? { accessible: true, accessibilityRole: 'image' as const, accessibilityLabel }
    : { accessible: false, importantForAccessibility: 'no-hide-descendants' as const };

  return (
    <View
      {...a11y}
      style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: avatarColor(id) }}
      className="items-center justify-center overflow-hidden">
      {source != null ? (
        <Image
          source={source}
          style={{ width: size, height: size }}
          contentFit="cover"
          onError={() => (showUri ? setFailedUri(uri) : setPhotoFailed(true))}
        />
      ) : (
        <Text variant={TEXT_VARIANT[size]} maxFontSizeMultiplier={1.2} style={{ color: '#ffffff' }}>
          {initialsOf(name)}
        </Text>
      )}
    </View>
  );
}

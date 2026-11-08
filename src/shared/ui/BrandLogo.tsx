import { Image } from 'expo-image';
import { View } from 'react-native';

const MARK = require('../../../assets/images/logo-yunta.png');
const WORDMARK = require('../../../assets/images/texto-yunta.png');

// Proporciones reales de las imágenes recortadas (ancho / alto).
const MARK_RATIO = 274 / 226;
const WORDMARK_RATIO = 509 / 196;

type BrandLogoProps = {
  /** `mark` = emblema; `wordmark` = el nombre escrito; `lockup` = emblema + nombre. */
  variant: 'mark' | 'wordmark' | 'lockup';
  /** Alto en dp. */
  height?: number;
};

/** Logo de Yunta. Una sola fuente para la bienvenida, el Inicio y las cabeceras de sección. */
export function BrandLogo({ variant, height = 32 }: BrandLogoProps) {
  if (variant === 'mark') {
    return (
      <Image
        source={MARK}
        style={{ width: height * MARK_RATIO, height }}
        contentFit="contain"
        accessibilityLabel="Logo de Yunta"
        accessibilityIgnoresInvertColors
      />
    );
  }
  if (variant === 'wordmark') {
    return (
      <Image
        source={WORDMARK}
        style={{ width: height * WORDMARK_RATIO, height }}
        contentFit="contain"
        accessibilityLabel="Yunta"
        accessibilityIgnoresInvertColors
      />
    );
  }
  // El nombre se ve un poco más bajo que el emblema para que los dos pesen parecido.
  const textHeight = height * 0.78;
  return (
    <View
      accessible
      accessibilityLabel="Yunta"
      style={{ flexDirection: 'row', alignItems: 'center', gap: height * 0.12 }}>
      <Image source={MARK} style={{ width: height * MARK_RATIO, height }} contentFit="contain" accessibilityIgnoresInvertColors />
      <Image source={WORDMARK} style={{ width: textHeight * WORDMARK_RATIO, height: textHeight }} contentFit="contain" accessibilityIgnoresInvertColors />
    </View>
  );
}

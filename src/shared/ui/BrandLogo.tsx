import { Image } from 'expo-image';

const MARK = require('../../../assets/images/logo-yunta.png');
const WORDMARK = require('../../../assets/images/texto-yunta.png');

// Proporciones reales de las imágenes recortadas (ancho / alto).
const MARK_RATIO = 791 / 685;
const WORDMARK_RATIO = 1456 / 406;

type BrandLogoProps = {
  /** `mark` = emblema (la mano del ícono); `wordmark` y `lockup` = el logo «Yunta» con sus destellos. */
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
  // El logo nuevo ya incluye nombre y destellos: `lockup` y `wordmark` muestran la misma imagen.
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

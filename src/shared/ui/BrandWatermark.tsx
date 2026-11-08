import { View } from 'react-native';

import { BrandLogo } from './BrandLogo';
import { Text } from './Text';

/** Opacidad máxima de la marca de agua (SPEC-056: ≤ 10 %): se nota, pero no estorba al leer. */
const WATERMARK_OPACITY = 0.07;

/**
 * Marca de agua de la marca **Yunta Perú**: el emblema y el nombre, muy tenues, detrás del contenido de un panel.
 * Es decorativa: no recibe toques y los lectores de pantalla la ignoran. Se coloca como primer hijo del panel.
 */
export function BrandWatermark() {
  return (
    <View
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      className="absolute inset-0 items-center justify-center overflow-hidden">
      <View style={{ opacity: WATERMARK_OPACITY, transform: [{ rotate: '-12deg' }], alignItems: 'center', gap: 10 }}>
        <BrandLogo variant="mark" height={190} />
        <Text variant="headline-lg" tone="primary" style={{ letterSpacing: 6 }}>
          YUNTA PERÚ
        </Text>
      </View>
    </View>
  );
}

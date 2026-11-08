import { Image } from 'expo-image';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeOut, ZoomIn } from 'react-native-reanimated';

import { Text } from '@/shared/ui';

const LOGO = require('../../../assets/images/splash-yunta.png');
const SHOW_MS = 1900;

/**
 * Pantalla de bienvenida con el logo y el nombre de Yunta. Entra con un pequeño zoom, se queda un instante
 * y se desvanece sola. Toma el relevo de la pantalla nativa de arranque (mismo fondo blanco y mismo logo),
 * así que el paso de una a otra no parpadea.
 */
export function BrandSplash({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onDone, SHOW_MS);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <Animated.View
      exiting={FadeOut.duration(450)}
      accessibilityLabel="Yunta. Tu comunidad, más cerca"
      accessibilityRole="image"
      pointerEvents="auto"
      style={[StyleSheet.absoluteFill, { zIndex: 100, backgroundColor: '#ffffff' }]}>
      <View className="flex-1 items-center justify-center gap-5 px-10">
        <Animated.View entering={ZoomIn.duration(650)}>
          <Image source={LOGO} style={{ width: 260, height: 236 }} contentFit="contain" accessibilityIgnoresInvertColors />
        </Animated.View>
        <Animated.View entering={FadeIn.delay(500).duration(600)}>
          <Text variant="body-lg" tone="primary" className="text-center">
            Tu comunidad, más cerca.
          </Text>
        </Animated.View>
      </View>
    </Animated.View>
  );
}

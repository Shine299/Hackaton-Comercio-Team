import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { BrandLogo } from '@/shared/ui';

const HOLD_MS = 950;
const LEAVE_MS = 650;
const TOTAL_MS = HOLD_MS + LEAVE_MS;

/**
 * Entrada de la app: solo el nombre «Yunta». Parte exactamente donde lo deja la pantalla nativa de arranque
 * (mismo fondo, mismo tamaño y posición), respira apenas y luego «entra» en la app: el nombre crece mientras se
 * desvanece y el fondo se abre hacia el Inicio. Una sola curva continua, sin saltos ni rebotes.
 */
export function BrandSplash({ onDone }: { onDone: () => void }) {
  const t = useSharedValue(0);

  useEffect(() => {
    t.value = withSequence(
      withTiming(0.5, { duration: HOLD_MS, easing: Easing.inOut(Easing.sin) }),
      withTiming(1, { duration: LEAVE_MS, easing: Easing.bezier(0.4, 0, 0.2, 1) }),
    );
    const timer = setTimeout(onDone, TOTAL_MS + 60);
    return () => clearTimeout(timer);
  }, [onDone, t]);

  const wordmark = useAnimatedStyle(() => ({
    opacity: interpolate(t.value, [0, 0.55, 1], [1, 1, 0]),
    transform: [{ scale: interpolate(t.value, [0, 0.5, 1], [1, 1.04, 1.45]) }],
  }));
  const backdrop = useAnimatedStyle(() => ({ opacity: interpolate(t.value, [0, 0.6, 1], [1, 1, 0]) }));

  return (
    <View
      pointerEvents="auto"
      accessibilityLabel="Yunta"
      accessibilityRole="image"
      style={[StyleSheet.absoluteFill, { zIndex: 100 }]}>
      <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: '#ffffff' }, backdrop]} />
      <View style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center' }]}>
        <Animated.View style={wordmark}>
          <BrandLogo variant="wordmark" height={96} />
        </Animated.View>
      </View>
    </View>
  );
}

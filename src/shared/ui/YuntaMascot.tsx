import { Image } from 'expo-image';
import { View } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';

import { resolvePose, YUNTA_POSE_LABELS, type YuntaPose } from './yuntaPoses';

// Rutas estáticas (Metro necesita `require` literal). Mismo orden que `YUNTA_POSES`.
const SOURCES: Record<YuntaPose, number> = {
  wave: require('../../../assets/images/yunta/wave.png'),
  point: require('../../../assets/images/yunta/point.png'),
  curious: require('../../../assets/images/yunta/curious.png'),
  shield: require('../../../assets/images/yunta/shield.png'),
  lock: require('../../../assets/images/yunta/lock.png'),
  phone: require('../../../assets/images/yunta/phone.png'),
  'thumbs-up': require('../../../assets/images/yunta/thumbs-up.png'),
  'map-pin': require('../../../assets/images/yunta/map-pin.png'),
  celebrate: require('../../../assets/images/yunta/celebrate.png'),
  assistant: require('../../../assets/images/yunta/assistant.png'),
};

type YuntaMascotProps = {
  pose: YuntaPose | string;
  /** Alto en dp; el ancho se ajusta solo (la imagen se contiene en un cuadro). */
  size?: number;
  /** Entra con un pequeño «salto». Se desactiva para listas o cuando ya hay otra animación. */
  animated?: boolean;
};

/** Yunta con un gesto. Una sola fuente para el tutorial, el recorrido y futuras pantallas. */
export function YuntaMascot({ pose, size = 160, animated = true }: YuntaMascotProps) {
  const safe = resolvePose(pose);
  const image = (
    <Image
      source={SOURCES[safe]}
      style={{ width: size, height: size }}
      contentFit="contain"
      accessibilityLabel={YUNTA_POSE_LABELS[safe]}
      accessibilityIgnoresInvertColors
    />
  );
  if (!animated) return <View>{image}</View>;
  return <Animated.View entering={ZoomIn.delay(120).duration(420)}>{image}</Animated.View>;
}

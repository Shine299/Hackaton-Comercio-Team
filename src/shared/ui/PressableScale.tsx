import { Pressable, type GestureResponderEvent, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export type PressableScaleProps = Omit<PressableProps, 'style'> & {
  className?: string;
  style?: StyleProp<ViewStyle>;
  /** Cuánto se encoge al presionar (1 = nada). Las tarjetas grandes usan menos que los botones. */
  scaleTo?: number;
};

/**
 * `Pressable` que se encoge suavemente al tocarlo y vuelve con un pequeño rebote: el toque se siente
 * sin cambios bruscos. Respeta «Reducir movimiento» del sistema (entonces no anima).
 */
export function PressableScale({ scaleTo = 0.96, onPressIn, onPressOut, style, ...rest }: PressableScaleProps) {
  const reduceMotion = useReducedMotion();
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.get() }] }));

  const pressIn = (e: GestureResponderEvent) => {
    if (!reduceMotion) scale.set(withTiming(scaleTo, { duration: 110 }));
    onPressIn?.(e);
  };
  const pressOut = (e: GestureResponderEvent) => {
    if (!reduceMotion) scale.set(withSpring(1, { damping: 14, stiffness: 260, mass: 0.6 }));
    onPressOut?.(e);
  };

  return <AnimatedPressable {...rest} onPressIn={pressIn} onPressOut={pressOut} style={[style, animatedStyle]} />;
}

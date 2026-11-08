import { usePathname, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { useWindowDimensions, View } from 'react-native';
import Animated, {
  FadeIn,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTourStore, type TourRect } from '@/shared/nav/tourStore';
import { Button, Icon, Text } from '@/shared/ui';

import { isOnStepScreen, spotlightRect, stepHref, TOUR_STEPS, tooltipPlacement, type TourStep } from './steps';

const DIM = 'rgba(8, 20, 28, 0.62)';
const TOTAL = TOUR_STEPS.length;

/** Anillo que late alrededor del botón: «toca aquí». */
function PulseRing({ rect }: { rect: TourRect }) {
  const reduceMotion = useReducedMotion();
  const pulse = useSharedValue(1);
  useEffect(() => {
    if (reduceMotion) return;
    pulse.set(withRepeat(withSequence(withTiming(1.08, { duration: 650 }), withTiming(1, { duration: 650 })), -1));
  }, [pulse, reduceMotion]);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: pulse.get() }] }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: 'absolute',
          left: rect.x,
          top: rect.y,
          width: rect.width,
          height: rect.height,
          borderRadius: 18,
          borderWidth: 3,
          borderColor: '#aceeef',
        },
        style,
      ]}
    />
  );
}

/** Cuatro bloques oscuros alrededor del hueco: tapan el resto y dejan tocar solo el botón. */
function Dim({ hole, screen }: { hole: TourRect; screen: { width: number; height: number } }) {
  const block = { position: 'absolute' as const, backgroundColor: DIM };
  return (
    <>
      <View style={[block, { left: 0, top: 0, width: screen.width, height: hole.y }]} />
      <View style={[block, { left: 0, top: hole.y + hole.height, width: screen.width, height: screen.height - hole.y - hole.height }]} />
      <View style={[block, { left: 0, top: hole.y, width: hole.x, height: hole.height }]} />
      <View style={[block, { left: hole.x + hole.width, top: hole.y, width: screen.width - hole.x - hole.width, height: hole.height }]} />
    </>
  );
}

function Bubble({ step, index, children }: { step: TourStep; index: number; children?: React.ReactNode }) {
  return (
    <Animated.View
      key={index}
      entering={FadeIn.duration(220)}
      accessibilityLiveRegion="polite"
      className="gap-2 rounded-3xl bg-surface-container-lowest p-4 shadow-lg elevation-md">
      <View className="flex-row items-center gap-2">
        <View className="h-8 w-8 items-center justify-center rounded-full bg-primary">
          <Icon name={step.target ? 'gesture-tap' : 'party-popper'} size={18} color="onPrimary" />
        </View>
        <Text variant="body-lg-bold" className="flex-1" accessibilityRole="header">
          {step.title}
        </Text>
        <Text variant="label-md" tone="muted">
          {Math.min(index + 1, TOTAL)} de {TOTAL}
        </Text>
      </View>
      <Text>{step.body}</Text>
      {children}
    </Animated.View>
  );
}

/**
 * Recorrido guiado sobre la app real. Ilumina un botón de verdad y solo avanza cuando la persona lo toca.
 * Si se va a otra pantalla, ofrece volver; siempre se puede salir.
 */
export function TourOverlay() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const screen = useWindowDimensions();
  const active = useTourStore((s) => s.active);
  const index = useTourStore((s) => s.step);
  const rects = useTourStore((s) => s.rects);
  const setExpected = useTourStore((s) => s.setExpected);
  const finish = useTourStore((s) => s.finish);

  const step = TOUR_STEPS[index];

  useEffect(() => {
    if (active) setExpected(step?.target ?? null);
  }, [active, step, setExpected]);

  useEffect(() => {
    if (active && !step) finish();
  }, [active, step, finish]);

  if (!active || !step) return null;

  const skip = (
    <Button label="Salir del recorrido" variant="ghost" onPress={finish} accessibilityHint="Puedes repetirlo desde el menú" />
  );

  // Cierre: sin botón que tocar.
  if (!step.target) {
    return (
      <View className="absolute inset-0 justify-center px-5" style={{ backgroundColor: DIM }}>
        <Bubble step={step} index={index}>
          <Button label="Empezar a usar Yunta" size="lg" icon="check" onPress={finish} />
        </Bubble>
      </View>
    );
  }

  const onScreen = isOnStepScreen(pathname, step);
  const rect = rects[step.target];

  // Se fue a otra pantalla, o el botón todavía se está acomodando: no bloquea nada.
  if (!onScreen || !rect) {
    const href = stepHref(step);
    return (
      <View pointerEvents="box-none" className="absolute inset-0 px-5" style={{ paddingTop: insets.top + 72 }}>
        <Bubble step={step} index={index}>
          {!onScreen && href ? (
            <Button label="Llévame a ese paso" icon="arrow-right" onPress={() => router.navigate(href)} />
          ) : null}
          {skip}
        </Bubble>
      </View>
    );
  }

  const hole = spotlightRect(rect, screen);
  const above = tooltipPlacement(hole, screen.height) === 'above';

  return (
    <View pointerEvents="box-none" className="absolute inset-0">
      <Dim hole={hole} screen={screen} />
      <PulseRing rect={hole} />
      <View
        pointerEvents="box-none"
        className="absolute left-0 right-0 px-5"
        style={above ? { bottom: screen.height - hole.y + 12 } : { top: hole.y + hole.height + 12 }}>
        <Bubble step={step} index={index}>
          <View className="flex-row items-center gap-1.5">
            <Icon name={above ? 'arrow-down' : 'arrow-up'} size={18} color="primary" />
            <Text variant="label-md" tone="primary" className="flex-1">
              Toca el botón iluminado
            </Text>
          </View>
          {skip}
        </Bubble>
      </View>
    </View>
  );
}

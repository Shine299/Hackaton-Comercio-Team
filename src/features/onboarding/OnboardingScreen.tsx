import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { PanResponder, Pressable, View } from 'react-native';
import Animated, { FadeIn, SlideInLeft, SlideInRight, ZoomIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SectorPicker } from '@/features/sector';
import { BrandLogo, Button, Card, GRADIENTS, Icon, Screen, Text, ViewModePicker } from '@/shared/ui';

import { InterestsDemo, OfflineDemo, SosDemo, StepsDemo } from './StepDemos';
import { ONBOARDING_STEPS, TOTAL_ONBOARDING_STEPS } from './steps';
import { useOnboardingStore } from './store';

function ProgressDots({ current }: { current: number }) {
  return (
    <View className="flex-row items-center gap-1.5" accessibilityElementsHidden>
      {Array.from({ length: TOTAL_ONBOARDING_STEPS }, (_, i) => (
        <View
          key={i}
          className={i === current ? 'h-2 w-6 rounded-full bg-primary' : i < current ? 'h-2 w-2 rounded-full bg-primary' : 'h-2 w-2 rounded-full bg-outline-variant'}
        />
      ))}
    </View>
  );
}

/**
 * Tutorial inicial interactivo: se avanza con «Siguiente» o deslizando; cada paso tiene un encabezado de color
 * y, cuando sirve, algo para tocar (intereses, pasos, SOS de prueba, modo avión de prueba). Se puede omitir en
 * cualquier momento y nunca bloquea el SOS. Cierra con la selección de sector (GPS opcional o manual).
 */
export function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const complete = useOnboardingStore((s) => s.complete);
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);

  const isSectorStep = index === ONBOARDING_STEPS.length;
  const step = isSectorStep ? null : ONBOARDING_STEPS[index];
  const isFirst = index === 0;

  const go = (delta: 1 | -1) => {
    const next = index + delta;
    if (next < 0 || next > ONBOARDING_STEPS.length) return;
    setDirection(delta);
    setIndex(next);
  };

  const finish = () => {
    complete();
    router.replace('/');
  };

  // Deslizar a los lados cambia de paso (además de los botones).
  const swipe = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 24 && Math.abs(g.dx) > Math.abs(g.dy) * 1.8,
        onPanResponderRelease: (_, g) => {
          if (g.dx < -50) go(1);
          else if (g.dx > 50) go(-1);
        },
      }),
    // `go` depende de `index`; se recrea con cada paso.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [index],
  );

  const header = (
    <View className="gap-3 px-4 pb-2" style={{ paddingTop: insets.top + 8 }}>
      <View className="flex-row items-center justify-between gap-2">
        <BrandLogo variant="lockup" height={30} />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Abrir Modo Emergencia"
          onPress={() => router.push('/emergencias')}
          className="min-h-12 flex-row items-center justify-center gap-1.5 rounded-full bg-error-container px-4 active:opacity-80">
          <Icon name="alarm-light-outline" size={20} color="error" />
          <Text variant="body-lg-bold" tone="error">
            SOS
          </Text>
        </Pressable>
      </View>
      <View className="flex-row items-center justify-between">
        <ProgressDots current={index} />
        <Text variant="label-md" tone="muted">
          {index + 1} de {TOTAL_ONBOARDING_STEPS}
        </Text>
      </View>
    </View>
  );

  const footer = (
    <View className="gap-2">
      <View className="flex-row gap-2">
        {!isFirst ? (
          <Button label="Atrás" variant="tonal" icon="arrow-left" fullWidth={false} className="flex-1" onPress={() => go(-1)} />
        ) : null}
        <Button
          label={isSectorStep ? 'Empezar' : 'Siguiente'}
          icon={isSectorStep ? 'check' : 'arrow-right'}
          fullWidth={false}
          className="flex-[2]"
          size="lg"
          onPress={isSectorStep ? finish : () => go(1)}
        />
      </View>
      {!isSectorStep ? (
        <Button
          label="Saltar tutorial"
          variant="ghost"
          onPress={finish}
          accessibilityHint="Podrás volver a verlo después desde el menú"
        />
      ) : null}
    </View>
  );

  return (
    <Screen header={header} footer={footer} contentClassName="gap-5 pt-2">
      <Animated.View
        // La clave cambia con el paso: el contenido entra desde el lado hacia donde vas.
        key={index}
        entering={direction === 1 ? SlideInRight.duration(260) : SlideInLeft.duration(260)}
        {...swipe.panHandlers}
        className="gap-5">
        {step ? (
          <>
            <LinearGradient
              colors={step.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ borderRadius: 28, height: 150, alignItems: 'center', justifyContent: 'center' }}>
              <Animated.View entering={ZoomIn.delay(120).duration(420)} className="h-24 w-24 items-center justify-center rounded-full bg-white/25">
                <Icon name={step.icon} size={52} color="onPrimary" />
              </Animated.View>
            </LinearGradient>

            <View className="gap-2">
              <Text variant="headline-lg" accessibilityRole="header">
                {step.title}
              </Text>
              <Text variant="body-lg" tone="muted">
                {step.body}
              </Text>
            </View>

            {step.demo === 'interests' ? <InterestsDemo /> : null}
            {step.demo === 'steps' ? <StepsDemo /> : null}
            {step.demo === 'sos' ? <SosDemo /> : null}
            {step.demo === 'offline' ? <OfflineDemo /> : null}
            {step.demo === 'viewmode' ? <ViewModePicker /> : null}

            {step.points ? (
              <Card tone="low" className="gap-2">
                {step.points.map((point) => (
                  <View key={point} className="flex-row items-center gap-2">
                    <Icon name="check-circle-outline" size={20} color="primary" />
                    <Text variant="body-lg" className="flex-1">
                      {point}
                    </Text>
                  </View>
                ))}
              </Card>
            ) : null}
            {step.notice ? (
              <Card tone="warning">
                <View className="flex-row items-start gap-2">
                  <Icon name="information-outline" size={22} color="warning" />
                  <Text className="flex-1" variant="body-md-medium">
                    {step.notice}
                  </Text>
                </View>
              </Card>
            ) : null}
          </>
        ) : (
          <>
            <LinearGradient
              colors={GRADIENTS.comunidad}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ borderRadius: 28, height: 120, alignItems: 'center', justifyContent: 'center' }}>
              <Animated.View entering={ZoomIn.delay(120).duration(420)} className="h-20 w-20 items-center justify-center rounded-full bg-white/25">
                <Icon name="map-marker-outline" size={44} color="onPrimary" />
              </Animated.View>
            </LinearGradient>
            <View className="gap-2">
              <Text variant="headline-lg" accessibilityRole="header">
                Elige tu sector
              </Text>
              <Text variant="body-lg" tone="muted">
                Así te mostramos lo que pasa cerca. Puedes cambiarlo cuando quieras.
              </Text>
            </View>
            <Animated.View entering={FadeIn.delay(150).duration(300)}>
              <SectorPicker />
            </Animated.View>
          </>
        )}
      </Animated.View>
    </Screen>
  );
}

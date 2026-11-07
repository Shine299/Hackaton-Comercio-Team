import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SectorPicker } from '@/features/sector';
import { Button, Card, Icon, Screen, Text } from '@/shared/ui';

import { ONBOARDING_STEPS, TOTAL_ONBOARDING_STEPS } from './steps';
import { useOnboardingStore } from './store';

function ProgressDots({ current }: { current: number }) {
  return (
    <View className="flex-row items-center gap-1.5" accessibilityElementsHidden>
      {Array.from({ length: TOTAL_ONBOARDING_STEPS }, (_, i) => (
        <View
          key={i}
          className={i === current ? 'h-2 w-6 rounded-full bg-primary' : 'h-2 w-2 rounded-full bg-outline-variant'}
        />
      ))}
    </View>
  );
}

/**
 * Tutorial inicial accesible: se puede omitir en cualquier momento y nunca bloquea el SOS.
 * Cierra con la selección de sector (GPS opcional o manual).
 */
export function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const complete = useOnboardingStore((s) => s.complete);
  const [index, setIndex] = useState(0);

  const isSectorStep = index === ONBOARDING_STEPS.length;
  const step = isSectorStep ? null : ONBOARDING_STEPS[index];
  const isFirst = index === 0;

  const finish = () => {
    complete();
    router.replace('/');
  };

  const header = (
    <View
      className="flex-row items-center justify-between gap-2 px-4 pb-2"
      style={{ paddingTop: insets.top + 8 }}>
      <View className="gap-1">
        <Text variant="label-md" tone="muted">
          Paso {index + 1} de {TOTAL_ONBOARDING_STEPS}
        </Text>
        <ProgressDots current={index} />
      </View>
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
  );

  const footer = (
    <View className="gap-2">
      <View className="flex-row gap-2">
        {!isFirst ? (
          <Button
            label="Atrás"
            variant="tonal"
            icon="arrow-left"
            fullWidth={false}
            className="flex-1"
            onPress={() => setIndex((i) => i - 1)}
          />
        ) : null}
        <Button
          label={isSectorStep ? 'Empezar' : 'Siguiente'}
          icon={isSectorStep ? 'check' : 'arrow-right'}
          fullWidth={false}
          className="flex-[2]"
          size="lg"
          onPress={isSectorStep ? finish : () => setIndex((i) => i + 1)}
        />
      </View>
      {!isSectorStep ? (
        <Button
          label="Saltar tutorial"
          variant="ghost"
          onPress={finish}
          accessibilityHint="Podrás volver a verlo después desde tu perfil"
        />
      ) : null}
    </View>
  );

  return (
    <Screen header={header} footer={footer} contentClassName="gap-5 pt-4">
      {step ? (
        <View className="gap-4">
          <View className="h-16 w-16 items-center justify-center rounded-2xl bg-primary-container">
            <Icon name={step.icon} size={34} color="onPrimary" />
          </View>
          <Text variant="headline-lg" accessibilityRole="header">
            {step.title}
          </Text>
          <Text variant="body-lg" tone="muted">
            {step.body}
          </Text>
          {step.points ? (
            <Card tone="low" className="gap-2">
              {step.points.map((point) => (
                <Text key={point} variant="body-lg">
                  {point}
                </Text>
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
        </View>
      ) : (
        <View className="gap-4">
          <View className="h-16 w-16 items-center justify-center rounded-2xl bg-primary-container">
            <Icon name="map-marker-outline" size={34} color="onPrimary" />
          </View>
          <Text variant="headline-lg" accessibilityRole="header">
            Elige tu sector
          </Text>
          <Text variant="body-lg" tone="muted">
            Así te mostramos lo que pasa cerca de ti. Puedes cambiarlo cuando quieras desde la barra
            superior.
          </Text>
          <SectorPicker />
        </View>
      )}
    </Screen>
  );
}

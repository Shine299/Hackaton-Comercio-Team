import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { Button, Card, cn, Icon, Screen, Text, TextField, type IconName } from '@/shared/ui';

import { EmergencyNumbersCard } from './components/EmergencyNumbersCard';
import { ApproxZoneCard, PhotoField } from './components/FormBits';
import { IncidentStatusBadge } from './components/IncidentStatus';
import { VulnerableLayers } from './components/VulnerableLayers';
import { useEmergencyStore } from './store';
import {
  getReportBasis,
  getVulnerableNeed,
  publicSummary,
  REPORT_BASES,
  VULNERABLE_NEEDS,
  type ReportBasis,
  type VulnerableAlert,
  type VulnerableNeed,
} from './types';
import { usePickPhoto } from './usePickPhoto';

type Step = 1 | 2 | 3;

const VOICE_MOCK = 'Nota de voz (simulada): la persona vive sola y hoy no pudo salir de su casa.';

function Steps({ step }: { step: Step }) {
  const items: { n: Step; label: string }[] = [
    { n: 1, label: 'Acción' },
    { n: 2, label: 'Necesidad' },
    { n: 3, label: 'Revisar' },
  ];
  return (
    <View className="flex-row gap-2" accessibilityRole="text" accessibilityLabel={`Paso ${step} de 3`}>
      {items.map((item) => (
        <View key={item.n} className="flex-1 items-center gap-1">
          <View className={cn('h-1.5 w-full rounded-full', item.n <= step ? 'bg-error' : 'bg-surface-container')} />
          <Text variant="label-sm" tone={item.n === step ? 'error' : 'muted'}>
            {item.label}
          </Text>
        </View>
      ))}
    </View>
  );
}

type OptionCardProps = {
  selected: boolean;
  icon: IconName;
  title: string;
  hint?: string;
  onPress: () => void;
};

function OptionCard({ selected, icon, title, hint, onPress }: OptionCardProps) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityLabel={hint ? `${title}. ${hint}` : title}
      accessibilityState={{ selected, checked: selected }}
      onPress={onPress}
      className={cn(
        'min-h-16 flex-row items-center gap-3 rounded-2xl border-2 p-3 active:opacity-80',
        selected ? 'border-error bg-error-container' : 'border-outline-variant bg-surface-container-lowest',
      )}>
      <Icon name={selected ? 'check-circle' : icon} size={26} color={selected ? 'error' : 'onSurface'} />
      <View className="flex-1">
        <Text variant="body-md-medium">{title}</Text>
        {hint ? (
          <Text variant="label-md" tone="muted">
            {hint}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

/**
 * «Ayudar a un vecino vulnerable» en 3 pasos. No pide nombre, teléfono ni diagnóstico:
 * lo único indispensable es cómo te enteraste y qué necesita la persona.
 */
export function VulnerableNeighborScreen() {
  const router = useRouter();
  const addVulnerable = useEmergencyStore((s) => s.addVulnerable);
  const [step, setStep] = useState<Step>(1);
  const [basis, setBasis] = useState<ReportBasis | undefined>();
  const [need, setNeed] = useState<VulnerableNeed | undefined>();
  const [detail, setDetail] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [voiceUsed, setVoiceUsed] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [saved, setSaved] = useState<VulnerableAlert | undefined>();
  const photo = usePickPhoto();

  if (saved) {
    return (
      <Screen safeBottom>
        <Card tone="warning" accessibilityLiveRegion="polite">
          <Text variant="headline-sm">Alerta guardada en tu teléfono</Text>
          <Text>
            Aún no se envió a nadie y nadie la ha revisado. Si hay riesgo para la vida, llama ahora a
            los servicios oficiales.
          </Text>
          <IncidentStatusBadge status={saved.status} />
        </Card>
        <VulnerableLayers need={saved.need} basis={saved.basis} />
        <Card tone="low">
          <Text variant="label-md" tone="muted">
            Lo que vería el público
          </Text>
          <Text>{publicSummary(saved)}</Text>
        </Card>
        <EmergencyNumbersCard />
        <Button
          label="Ver tablero del sector"
          variant="tonal"
          icon="view-dashboard-outline"
          onPress={() => router.replace('/emergencias/tablero')}
        />
        <Button label="Volver al Centro de emergencias" variant="outline" onPress={() => router.dismissTo('/emergencias')} />
      </Screen>
    );
  }

  const next = () => {
    if (step === 1 && !basis) {
      setError('Elige cómo te enteraste. Si dudas, toca «Es una observación urgente».');
      return;
    }
    if (step === 2 && !need) {
      setError('Elige qué necesita la persona. Si no encaja, toca «Otra necesidad».');
      return;
    }
    setError(undefined);
    setStep((s) => (s === 1 ? 2 : 3));
  };

  const save = () => {
    if (!basis || !need) return;
    setSaved(addVulnerable({ need, basis, detail, diagnosis, photoUri: photo.photoUri, voiceUsed }));
  };

  return (
    <Screen
      footer={
        <View className="gap-2">
          <Button
            label={step === 3 ? 'Guardar alerta en mi teléfono' : 'Continuar'}
            size="lg"
            icon={step === 3 ? 'check' : 'arrow-right'}
            variant={step === 3 ? 'danger' : 'primary'}
            onPress={step === 3 ? save : next}
          />
          {step > 1 ? <Button label="Atrás" variant="ghost" onPress={() => setStep((s) => (s === 3 ? 2 : 1))} /> : null}
        </View>
      }>
      <Steps step={step} />

      {step === 1 ? (
        <>
          <View className="gap-1">
            <Text variant="headline-md">Reporto por otra persona</Text>
            <Text tone="muted">No necesitas su nombre, teléfono ni diagnóstico. ¿Cómo te enteraste?</Text>
          </View>
          <View className="gap-2" accessibilityRole="radiogroup">
            {REPORT_BASES.map((item) => (
              <OptionCard
                key={item.id}
                selected={basis === item.id}
                icon={item.icon}
                title={item.label}
                hint={item.hint}
                onPress={() => {
                  setBasis(item.id);
                  setError(undefined);
                }}
              />
            ))}
          </View>
        </>
      ) : null}

      {step === 2 ? (
        <>
          <View className="gap-1">
            <Text variant="headline-md">¿Qué necesita?</Text>
            <Text tone="muted">Elige una tarjeta. Es solo el tipo general de apoyo.</Text>
          </View>
          <View className="gap-2" accessibilityRole="radiogroup">
            {VULNERABLE_NEEDS.map((item) => (
              <OptionCard
                key={item.id}
                selected={need === item.id}
                icon={item.icon}
                title={item.label}
                onPress={() => {
                  setNeed(item.id);
                  setError(undefined);
                }}
              />
            ))}
          </View>
          <ApproxZoneCard />
        </>
      ) : null}

      {step === 3 ? (
        <>
          <View className="gap-1">
            <Text variant="headline-md">Revisa y guarda</Text>
            <Text tone="muted">Esto es lo único indispensable. Lo demás es opcional.</Text>
          </View>
          {basis && need ? <VulnerableLayers need={need} basis={basis} /> : null}
          <Card tone="low">
            <Text variant="label-md" tone="muted">
              Lo que vería el público
            </Text>
            <Text>
              {need ? publicSummary({ need, sectorName: 'tu sector' }) : ''} Sin nombre y sin dirección exacta.
            </Text>
          </Card>

          <Text variant="overline" tone="muted">
            Opcional · solo se queda en tu teléfono
          </Text>
          <TextField
            label="Detalle (opcional)"
            placeholder="Ej.: vive en un segundo piso sin ascensor"
            value={detail}
            onChangeText={setDetail}
            multiline
          />
          <Button
            label={voiceUsed ? 'Nota de voz simulada añadida' : 'Añadir nota de voz (simulada)'}
            variant="outline"
            icon="microphone-outline"
            onPress={() => {
              setVoiceUsed(true);
              setDetail((d) => (d ? `${d}\n${VOICE_MOCK}` : VOICE_MOCK));
            }}
          />
          <TextField
            label="Diagnóstico conocido (opcional)"
            placeholder="Déjalo vacío si no lo sabes"
            value={diagnosis}
            onChangeText={setDiagnosis}
            hint="No se publica ni va en la cola. No hace falta para guardar."
          />
          <PhotoField photoUri={photo.photoUri} hint={photo.hint} onPick={() => void photo.pick()} onClear={photo.clear} />
          {basis && need ? (
            <Text variant="label-md" tone="muted">
              {getReportBasis(basis).label} · {getVulnerableNeed(need).label}
            </Text>
          ) : null}
        </>
      ) : null}

      {error ? (
        <Text variant="label-md" tone="error" accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : null}
    </Screen>
  );
}

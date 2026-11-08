import { useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Button, Card, PhotoField, Screen, Text, TextField } from '@/shared/ui';

import { ChoiceTile } from './components/ChoiceTile';
import { EmergencyNumbersCard } from './components/EmergencyNumbersCard';
import { ApproxZoneCard } from './components/FormBits';
import { VoiceNoteField } from './components/VoiceNoteField';
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
import { usePickPhoto } from '@/shared/hooks/usePickPhoto';

type Step = 1 | 2 | 3;

function Steps({ step }: { step: Step }) {
  const labels = ['Acción', 'Necesidad', 'Revisar'];
  return (
    <View className="gap-1.5" accessibilityRole="text" accessibilityLabel={`Paso ${step} de 3`}>
      <View className="flex-row items-center justify-between">
        <Text variant="body-md-medium" tone="primary">
          Paso {step} de 3
        </Text>
        <Text variant="label-md" tone="muted">
          {labels[step - 1]}
        </Text>
      </View>
      <View className="flex-row gap-1.5">
        {labels.map((label, i) => (
          <View key={label} className={`h-1.5 flex-1 rounded-full ${i < step ? 'bg-primary' : 'bg-surface-container-highest'}`} />
        ))}
      </View>
    </View>
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
  const [voiceUri, setVoiceUri] = useState<string | undefined>();
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
    setSaved(addVulnerable({ need, basis, detail, diagnosis, photoUri: photo.photoUri, voiceUri }));
  };

  return (
    <Screen
      footer={
        <View className="gap-2">
          <Button
            label={step === 3 ? 'Guardar alerta en mi teléfono' : 'Continuar'}
            size="lg"
            icon={step === 3 ? 'check' : 'arrow-right'}
            onPress={step === 3 ? save : next}
          />
          {step > 1 ? <Button label="Atrás" variant="ghost" onPress={() => setStep((s) => (s === 3 ? 2 : 1))} /> : null}
        </View>
      }>
      <Steps step={step} />

      {step === 1 ? (
        <>
          <View className="gap-1">
            <Text variant="headline-lg" accessibilityRole="header">Reporto por otra persona</Text>
            <Text tone="muted">No necesitas su nombre, teléfono ni diagnóstico. ¿Cómo te enteraste?</Text>
          </View>
          <View className="gap-2" accessibilityRole="radiogroup">
            {REPORT_BASES.map((item) => (
              <ChoiceTile
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
          <View className="flex-row flex-wrap gap-2.5" accessibilityRole="radiogroup">
            {VULNERABLE_NEEDS.map((item) => (
              <ChoiceTile
                key={item.id}
                selected={need === item.id}
                icon={item.icon}
                title={item.label}
                className="basis-[47%] grow"
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
          <VoiceNoteField uri={voiceUri} onChange={setVoiceUri} />
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

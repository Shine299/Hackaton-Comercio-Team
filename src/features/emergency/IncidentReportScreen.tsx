import { useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Button, PhotoField, Screen, Text, TextField } from '@/shared/ui';

import { ChoiceTile } from './components/ChoiceTile';
import { ApproxZoneCard } from './components/FormBits';
import { useEmergencyStore } from './store';
import { INCIDENT_CATEGORIES, type IncidentCategory } from './types';
import { usePickPhoto } from '@/shared/hooks/usePickPhoto';

/** «Reportar incidente»: no requiere cuenta. Categoría + zona aproximada; lo demás es opcional. */
export function IncidentReportScreen() {
  const router = useRouter();
  const addIncident = useEmergencyStore((s) => s.addIncident);
  const [category, setCategory] = useState<IncidentCategory | undefined>();
  const [detail, setDetail] = useState('');
  const [error, setError] = useState<string | undefined>();
  const photo = usePickPhoto();

  const send = () => {
    if (!category) {
      setError('Elige qué está pasando. Si no encaja, toca «Otro peligro».');
      return;
    }
    const report = addIncident({ category, detail, photoUri: photo.photoUri });
    router.replace({ pathname: '/emergencias/estado/[id]', params: { id: report.id } });
  };

  return (
    <Screen footer={<Button label="Guardar reporte" size="lg" icon="check" onPress={send} />}>
      <View className="gap-1">
        <Text variant="headline-lg" accessibilityRole="header">¿Qué pasa?</Text>
        <Text tone="muted">Si hay personas en riesgo, llama primero a los servicios oficiales.</Text>
      </View>

      <View className="flex-row flex-wrap gap-2.5" accessibilityRole="radiogroup">
        {INCIDENT_CATEGORIES.map((item) => (
          <ChoiceTile
            key={item.id}
            layout="stack"
            icon={item.icon}
            title={item.label}
            selected={category === item.id}
            className="basis-[30%] grow"
            onPress={() => {
              setCategory(item.id);
              setError(undefined);
            }}
          />
        ))}
      </View>
      {error ? (
        <Text variant="label-md" tone="error" accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : null}

      <ApproxZoneCard />

      <TextField
        label="Descripción (opcional)"
        placeholder="Ej.: humo saliendo de un poste en la esquina del parque"
        value={detail}
        onChangeText={setDetail}
        multiline
        hint="Describe el hecho, no a las personas. Sin nombres ni direcciones exactas."
      />

      <PhotoField photoUri={photo.photoUri} hint={photo.hint} onPick={() => void photo.pick()} onClear={photo.clear} />
    </Screen>
  );
}

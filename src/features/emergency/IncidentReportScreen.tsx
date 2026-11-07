import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { Button, cn, Icon, Screen, Text, TextField } from '@/shared/ui';

import { ApproxZoneCard, PhotoField } from './components/FormBits';
import { useEmergencyStore } from './store';
import { INCIDENT_CATEGORIES, type IncidentCategory } from './types';
import { usePickPhoto } from './usePickPhoto';

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
    <Screen footer={<Button label="Guardar reporte" size="lg" icon="check" variant="danger" onPress={send} />}>
      <View className="gap-1">
        <Text variant="headline-md">¿Qué está pasando?</Text>
        <Text tone="muted">Si hay personas en riesgo, llama primero a los servicios oficiales.</Text>
      </View>

      <View className="flex-row flex-wrap gap-3" accessibilityRole="radiogroup">
        {INCIDENT_CATEGORIES.map((item) => {
          const selected = category === item.id;
          return (
            <Pressable
              key={item.id}
              accessibilityRole="radio"
              accessibilityLabel={item.label}
              accessibilityState={{ selected, checked: selected }}
              onPress={() => {
                setCategory(item.id);
                setError(undefined);
              }}
              className={cn(
                'min-h-24 basis-[47%] grow items-center justify-center gap-2 rounded-2xl border-2 p-3 active:opacity-80',
                selected ? 'border-error bg-error-container' : 'border-outline-variant bg-surface-container-lowest',
              )}>
              <Icon name={selected ? 'check-circle' : item.icon} size={30} color={selected ? 'error' : 'onSurface'} />
              <Text variant="body-md-medium" className="text-center">
                {item.label}
              </Text>
            </Pressable>
          );
        })}
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

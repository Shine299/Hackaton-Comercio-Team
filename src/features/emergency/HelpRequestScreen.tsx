import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { Button, Chip, Icon, Screen, Text, TextField } from '@/shared/ui';

import { ApproxZoneCard, PhotoField } from './components/FormBits';
import { useEmergencyStore } from './store';
import { HELP_TYPES, type HelpType } from './types';
import { usePickPhoto } from './usePickPhoto';

/** «Necesito ayuda»: no requiere cuenta. Peligro inmediato guarda una alerta mínima al instante. */
export function HelpRequestScreen() {
  const router = useRouter();
  const addHelp = useEmergencyStore((s) => s.addHelp);
  const [type, setType] = useState<HelpType | undefined>();
  const [detail, setDetail] = useState('');
  const [error, setError] = useState<string | undefined>();
  const photo = usePickPhoto();

  const goToStatus = (id: string) => router.replace({ pathname: '/emergencias/estado/[id]', params: { id } });

  const sendImmediate = () => {
    const report = addHelp({ type: type ?? 'other', immediateDanger: true, detail, photoUri: photo.photoUri });
    goToStatus(report.id);
  };

  const send = () => {
    if (!type) {
      setError('Elige qué tipo de ayuda necesitas. Si no estás seguro, toca «Otro».');
      return;
    }
    const report = addHelp({ type, immediateDanger: false, detail, photoUri: photo.photoUri });
    goToStatus(report.id);
  };

  return (
    <Screen footer={<Button label="Guardar solicitud" size="lg" icon="check" onPress={send} />}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Estoy en peligro inmediato. Guardar alerta ahora sin completar el formulario"
        onPress={sendImmediate}
        className="min-h-16 flex-row items-center gap-3 rounded-2xl bg-error p-4 active:opacity-80">
        <Icon name="alarm-light-outline" size={28} color="onError" />
        <View className="flex-1">
          <Text variant="body-lg-bold" tone="onError">
            Estoy en peligro inmediato
          </Text>
          <Text variant="label-md" tone="onError">
            Guarda la alerta ya y muestra los números oficiales.
          </Text>
        </View>
      </Pressable>

      <View className="gap-2">
        <Text variant="headline-sm">¿Qué ayuda necesitas?</Text>
        <View className="flex-row flex-wrap gap-2" accessibilityRole="radiogroup">
          {HELP_TYPES.map((item) => (
            <Chip
              key={item.id}
              label={item.label}
              icon={item.icon}
              role="radio"
              selected={type === item.id}
              onPress={() => {
                setType(item.id);
                setError(undefined);
              }}
            />
          ))}
        </View>
        {error ? (
          <Text variant="label-md" tone="error" accessibilityLiveRegion="polite" className="mt-1">
            {error}
          </Text>
        ) : null}
      </View>

      <ApproxZoneCard />

      <TextField
        label="Detalle (opcional)"
        placeholder="Ej.: somos dos personas, una no puede caminar"
        value={detail}
        onChangeText={setDetail}
        multiline
        hint="No escribas nombres, teléfonos ni direcciones exactas."
      />

      <PhotoField photoUri={photo.photoUri} hint={photo.hint} onPick={() => void photo.pick()} onClear={photo.clear} />
    </Screen>
  );
}

import * as Crypto from 'expo-crypto';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { useSectorStore } from '@/features/sector';
import { useRegistrationGate } from '@/features/session';
import { Button, Card, Icon, Screen, ScreenHeader, Text, TextField } from '@/shared/ui';

import { CameraStream } from './CameraStream';
import { useCamerasStore } from './store';
import { parseCameraAddress } from './streamUrl';
import type { Camera } from './types';

const STEPS = [
  'En un celular Android viejo, instala la app «IP Webcam».',
  'Conéctalo al mismo Wi-Fi o hotspot que los celulares que lo verán.',
  'Abre IP Webcam y toca «Iniciar servidor». Apunta la cámara a la calle.',
  'Copia aquí la dirección que aparece abajo en la pantalla (ej.: http://192.168.1.20:8080).',
];

const PROMISES = [
  { id: 'common', label: 'Apunta solo a la calle o espacios comunes, nunca dentro de una casa.' },
  { id: 'sign', label: 'Hay un aviso visible de «Zona videovigilada».' },
  { id: 'norec', label: 'No se graba: solo se ve en vivo.' },
] as const;

/** Sumar una cámara vecinal: pasos simples, prueba de conexión y compromiso de privacidad. */
export function RegisterCameraScreen() {
  const router = useRouter();
  const sector = useSectorStore((s) => s.sector);
  const add = useCamerasStore((s) => s.add);
  const { requireRegistration, sheet } = useRegistrationGate();

  const [name, setName] = useState('');
  const [place, setPlace] = useState('');
  const [address, setAddress] = useState('');
  const [testing, setTesting] = useState(false);
  const [accepted, setAccepted] = useState<Record<string, boolean>>({});

  const host = parseCameraAddress(address);
  const allAccepted = PROMISES.every((p) => accepted[p.id]);
  const problem = !name.trim()
    ? 'Ponle un nombre a la cámara.'
    : !place.trim()
      ? 'Escribe la zona aproximada (calle y cuadra).'
      : !host
        ? 'Escribe la dirección que muestra IP Webcam (empieza con 192.168, 10. o 172.).'
        : !allAccepted
          ? 'Confirma las tres reglas de privacidad.'
          : null;

  const draft: Camera | null = host
    ? {
        id: 'preview',
        sectorId: sector.id,
        name: name.trim() || 'Cámara nueva',
        placeLabel: place.trim() || sector.name,
        host,
        fundId: null,
        active: true,
        isDemo: false,
        isLocal: true,
      }
    : null;

  const save = () => {
    if (problem || !draft) return;
    requireRegistration('Para sumar una cámara, crea tu cuenta vecinal.', () => {
      const id = Crypto.randomUUID();
      add({ ...draft, id });
      router.replace({ pathname: '/camaras/[id]', params: { id } });
    });
  };

  return (
    <Screen
      header={<ScreenHeader title="Sumar una cámara" backLabel="Cancelar" />}
      safeBottom
      footer={
        <View className="gap-1.5">
          <Button label="Guardar cámara" size="lg" icon="check" disabled={Boolean(problem)} onPress={save} />
          {problem ? (
            <Text variant="label-md" tone="muted" className="text-center" accessibilityLiveRegion="polite">
              {problem}
            </Text>
          ) : null}
        </View>
      }>
      <Card tone="low">
        <Text variant="body-lg-bold">Cómo convertir un celular en cámara</Text>
        {STEPS.map((step, i) => (
          <View key={step} className="flex-row items-start gap-3">
            <View className="h-7 w-7 items-center justify-center rounded-full bg-primary">
              <Text variant="label-md" tone="onPrimary">
                {i + 1}
              </Text>
            </View>
            <Text className="flex-1">{step}</Text>
          </View>
        ))}
      </Card>

      <TextField label="Nombre de la cámara" placeholder="Ej.: Cámara de la esquina" value={name} onChangeText={setName} maxLength={60} />
      <TextField
        label="Zona aproximada"
        placeholder="Ej.: Jr. Pachacútec, cuadra 4"
        hint="Calle y cuadra. Nunca el número de una casa."
        value={place}
        onChangeText={setPlace}
        maxLength={80}
      />
      <TextField
        label="Dirección de IP Webcam"
        placeholder="http://192.168.1.20:8080"
        keyboardType="url"
        autoCapitalize="none"
        autoCorrect={false}
        value={address}
        onChangeText={(t) => {
          setAddress(t);
          setTesting(false);
        }}
        error={address.trim() && !host ? 'Esa dirección no parece de tu red local. Cópiala tal cual de IP Webcam.' : undefined}
      />

      {draft ? (
        testing ? (
          <CameraStream camera={draft} height={200} />
        ) : (
          <Button label="Probar conexión" variant="tonal" icon="lan-connect" onPress={() => setTesting(true)} />
        )
      ) : null}

      <View className="gap-1" accessibilityLabel="Reglas de privacidad">
        <Text variant="body-lg-bold">Antes de guardar, confirma</Text>
        {PROMISES.map((p) => {
          const checked = Boolean(accepted[p.id]);
          return (
            <Pressable
              key={p.id}
              accessibilityRole="checkbox"
              accessibilityState={{ checked }}
              accessibilityLabel={p.label}
              onPress={() => setAccepted((a) => ({ ...a, [p.id]: !checked }))}
              className="min-h-12 flex-row items-center gap-3 py-1 active:opacity-80">
              <Icon name={checked ? 'checkbox-marked' : 'checkbox-blank-outline'} size={26} color="primary" />
              <Text className="flex-1">{p.label}</Text>
            </Pressable>
          );
        })}
      </View>
      {sheet}
    </Screen>
  );
}

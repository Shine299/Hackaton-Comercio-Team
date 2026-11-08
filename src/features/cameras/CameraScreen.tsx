import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, View } from 'react-native';

import { useFundProgress } from '@/features/funds';
import { Badge, Button, Card, DemoTag, Icon, type IconName, Screen, ScreenHeader, Text } from '@/shared/ui';

import { CameraRow } from './CameraRow';
import { CameraStream } from './CameraStream';
import { useSectorCameras } from './hooks';
import { useCamerasStore } from './store';

const FACTS: { icon: IconName; text: string }[] = [
  { icon: 'video-off-outline', text: 'Sin grabación: solo se ve en vivo' },
  { icon: 'account-group-outline', text: 'Solo la ven vecinos del sector' },
  { icon: 'sign-direction', text: 'Apunta a espacios comunes, con aviso de zona videovigilada' },
];

/** Una cámara en vivo, quién la financió y las otras cámaras del sector. */
export function CameraScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const cameraId = String(id ?? '');
  const router = useRouter();
  const cameras = useSectorCameras();
  const camera = cameras.find((c) => c.id === cameraId);
  const remove = useCamerasStore((s) => s.remove);
  const funding = useFundProgress(camera?.fundId ?? null);

  if (!camera) {
    return (
      <Screen header={<ScreenHeader title="Cámara" />} safeBottom>
        <Card>
          <Text variant="headline-sm">No encontramos esta cámara</Text>
          <Text tone="muted">Puede que ya no esté activa. Vuelve a la lista para ver las demás.</Text>
        </Card>
      </Screen>
    );
  }

  const others = cameras.filter((c) => c.id !== camera.id);

  return (
    <Screen header={<ScreenHeader title="Cámaras del barrio" />} safeBottom>
      <CameraStream camera={camera} />

      <View className="gap-1">
        <View className="flex-row flex-wrap gap-2">
          {camera.isLocal ? <Badge label="Solo en este teléfono" tone="neutral" icon="cellphone" /> : null}
          {camera.isDemo ? <DemoTag /> : null}
        </View>
        <Text variant="headline-md">{camera.name}</Text>
        <Text tone="muted">{camera.placeLabel} · zona aproximada</Text>
      </View>

      {funding ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Financiada por ${funding.progress.contributors} vecinos. Ver el fondo y sus boletas`}
          onPress={() => router.push({ pathname: '/fondos/[id]', params: { id: funding.fund.id } })}
          className="overflow-hidden rounded-2xl active:opacity-90">
          <LinearGradient colors={['#0f5b5c', '#2a8f9a']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 }}>
            <View className="h-11 w-11 items-center justify-center rounded-xl bg-white/20">
              <Icon name="piggy-bank-outline" size={24} color="onPrimary" />
            </View>
            <View className="flex-1">
              <Text variant="body-lg-bold" tone="onPrimary">
                Financiada por {funding.progress.contributors} vecinos
              </Text>
              <Text variant="label-md" tone="onPrimary" className="opacity-90">
                Ver el fondo y sus boletas
              </Text>
            </View>
            <Icon name="chevron-right" size={24} color="onPrimary" />
          </LinearGradient>
        </Pressable>
      ) : null}

      <View className="gap-2.5">
        {FACTS.map((f) => (
          <View key={f.icon} className="flex-row items-center gap-3">
            <View className="h-11 w-11 items-center justify-center rounded-xl bg-primary-fixed">
              <Icon name={f.icon} size={22} color="primary" />
            </View>
            <Text variant="body-md-medium" className="flex-1">
              {f.text}
            </Text>
          </View>
        ))}
      </View>

      {camera.host ? (
        <Card tone="low">
          <Text variant="label-md" tone="muted">
            Se ve solo si estás conectado al mismo Wi-Fi o hotspot que la cámara ({camera.host}).
          </Text>
        </Card>
      ) : null}

      {others.length > 0 ? (
        <View className="gap-2.5">
          <Text variant="headline-sm">Otras cámaras</Text>
          {others.map((c) => (
            <CameraRow key={c.id} camera={c} />
          ))}
        </View>
      ) : null}

      {camera.isLocal ? (
        <Button
          label="Quitar esta cámara de mi teléfono"
          variant="outline"
          icon="delete-outline"
          onPress={() => {
            remove(camera.id);
            router.back();
          }}
        />
      ) : null}
    </Screen>
  );
}

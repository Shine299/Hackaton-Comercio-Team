import { useRouter } from 'expo-router';
import { View } from 'react-native';

import { Button, Card, Icon, type IconName, Screen, ScreenHeader, Text } from '@/shared/ui';

import { CameraRow } from './CameraRow';
import { useSectorCameras } from './hooks';

const RULES: { icon: IconName; text: string }[] = [
  { icon: 'video-off-outline', text: 'Sin grabación: solo se ve en vivo.' },
  { icon: 'account-group-outline', text: 'Solo la ven vecinos del sector.' },
  { icon: 'sign-direction', text: 'Apuntan solo a espacios comunes, con aviso de zona videovigilada.' },
];

/** Cámaras del sector y cómo sumar una con un celular viejo. */
export function CamerasScreen() {
  const router = useRouter();
  const cameras = useSectorCameras();

  return (
    <Screen
      header={<ScreenHeader title="Cámaras del barrio" />}
      safeBottom
      footer={<Button label="Sumar una cámara" size="lg" icon="cctv" onPress={() => router.push('/camaras/registrar')} />}>
      <View className="gap-1">
        <Text variant="headline-lg">Ojos de vecinos, no de extraños</Text>
        <Text tone="muted">Celulares viejos convertidos en cámaras que todo el sector puede ver desde Yunta.</Text>
      </View>

      <View className="gap-2.5">
        {cameras.map((camera) => (
          <CameraRow key={camera.id} camera={camera} />
        ))}
      </View>

      <Card tone="low">
        <Text variant="body-lg-bold">Reglas de las cámaras</Text>
        {RULES.map((rule) => (
          <View key={rule.icon} className="flex-row items-center gap-3">
            <Icon name={rule.icon} size={22} color="primary" />
            <Text className="flex-1">{rule.text}</Text>
          </View>
        ))}
      </Card>
    </Screen>
  );
}

import { useRouter } from 'expo-router';
import { View } from 'react-native';

import { Badge, DemoTag, Icon, Text, PressableScale } from '@/shared/ui';

import type { Camera } from './types';

/** Fila de una cámara en una lista: nombre, zona y estado (texto + icono). */
export function CameraRow({ camera }: { camera: Camera }) {
  const router = useRouter();
  const state = camera.host ? 'Directo desde la red local' : camera.active ? 'En vivo' : 'Sin señal';
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={`${camera.name}, ${camera.placeLabel}. ${state}${camera.isDemo ? '. Dato de demostración' : ''}. Ver cámara`}
      onPress={() => router.push({ pathname: '/camaras/[id]', params: { id: camera.id } })}
      className="flex-row items-center gap-3 rounded-2xl bg-surface-container-lowest p-3 shadow-sm elevation-xs">
      <View className={`h-12 w-12 items-center justify-center rounded-2xl ${camera.active ? 'bg-primary-fixed' : 'bg-warning-container'}`}>
        <Icon name={camera.active ? 'cctv' : 'cctv-off'} size={26} color={camera.active ? 'primary' : 'warning'} />
      </View>
      <View className="min-w-0 flex-1 gap-0.5">
        <Text variant="body-lg-bold" numberOfLines={1}>
          {camera.name}
        </Text>
        <Text variant="label-md" tone="muted" numberOfLines={1}>
          {camera.placeLabel}
        </Text>
        <View className="flex-row flex-wrap gap-1.5">
          <Badge
            label={camera.active ? (camera.host ? 'Red local' : 'En vivo') : 'Sin señal'}
            tone={camera.active ? 'success' : 'warning'}
            icon={camera.active ? 'circle' : 'clock-outline'}
          />
          {camera.isLocal ? <Badge label="Solo en este teléfono" tone="neutral" icon="cellphone" /> : null}
          {camera.isDemo ? <DemoTag /> : null}
        </View>
      </View>
      <Icon name="chevron-right" size={24} color="onSurfaceVariant" />
    </PressableScale>
  );
}

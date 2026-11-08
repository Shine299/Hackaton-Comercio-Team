import { useRouter } from 'expo-router';
import { View } from 'react-native';

import { Icon, Text, PressableScale } from '@/shared/ui';

import { useSectorCameras } from './hooks';

/** Acceso destacado a las cámaras del barrio (Inicio, Comunidad). */
export function CamerasTeaser() {
  const router = useRouter();
  const cameras = useSectorCameras();
  const live = cameras.filter((c) => c.active).length;
  const funded = cameras.some((c) => c.fundId);

  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={`Cámaras del barrio. ${live} de ${cameras.length} en vivo.${funded ? ' Financiadas por los vecinos.' : ''} Ver cámaras`}
      onPress={() => router.push('/camaras')}
      className="flex-row items-center gap-3.5 rounded-3xl bg-surface-container-lowest p-3.5 shadow-sm elevation-xs">
      <View className="h-14 w-14 items-center justify-center rounded-2xl bg-primary-fixed">
        <Icon name="cctv" size={30} color="primary" />
      </View>
      <View className="min-w-0 flex-1 gap-0.5">
        <Text variant="body-lg-bold">Cámaras del barrio</Text>
        <View className="flex-row items-center gap-1.5">
          <View style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: '#1B6B3A' }} />
          <Text variant="label-md" tone="muted" numberOfLines={1}>
            {live} en vivo{funded ? ' · financiadas por vecinos' : ''}
          </Text>
        </View>
      </View>
      <Icon name="chevron-right" size={24} color="onSurfaceVariant" />
    </PressableScale>
  );
}

import { LinearGradient } from 'expo-linear-gradient';
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
      className="overflow-hidden rounded-3xl shadow-sm elevation-xs">
      <LinearGradient colors={['#123c3d', '#1f6466']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16 }}>
        <View className="h-14 w-14 items-center justify-center rounded-2xl bg-white/15">
          <Icon name="cctv" size={30} color="onPrimary" />
        </View>
        <View className="min-w-0 flex-1 gap-1">
          <Text variant="body-lg-bold" tone="onPrimary">
            Cámaras del barrio
          </Text>
          <View className="flex-row items-center gap-1.5">
            <View style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: '#7ee0a0' }} />
            <Text variant="label-md" tone="onPrimary">
              {live} en vivo{funded ? ' · financiadas por vecinos' : ''}
            </Text>
          </View>
        </View>
        <Icon name="chevron-right" size={26} color="onPrimary" />
      </LinearGradient>
    </PressableScale>
  );
}

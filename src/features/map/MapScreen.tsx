import { useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

import { useSectorStore } from '@/features/sector';
import { useNearbyPosts } from '@/features/posts';
import { BackHeader } from '@/features/shell';
import { Screen, Text } from '@/shared/ui';

import { CommunityMap } from './CommunityMap';
import type { MapLayerId } from './types';

/**
 * Mapa del barrio: pantalla propia (antes vivía dentro de Explorar). Muestra todas las capas; si llega
 * `layer=business` abre solo los emprendimientos.
 */
export function MapScreen() {
  const params = useLocalSearchParams<{ layer?: string }>();
  const sector = useSectorStore((s) => s.sector);
  const { data, isLoading } = useNearbyPosts(sector.id);
  const radiusKm = sector.radiusKm;

  const posts = (data?.posts ?? []).filter((p) => p.distanceM / 1000 <= radiusKm);
  const initialLayers: MapLayerId[] | undefined = params.layer === 'business' ? ['business'] : undefined;

  return (
    <Screen header={<BackHeader />} safeBottom contentClassName="gap-4">
      <View className="gap-0.5">
        <Text variant="headline-lg" accessibilityRole="header">
          Mapa del barrio
        </Text>
        <Text tone="muted">{sector.name} · toca un punto para ver qué es. Todo es zona aproximada.</Text>
      </View>
      {isLoading ? (
        <View className="items-center py-10" accessibilityLabel="Cargando el mapa">
          <ActivityIndicator />
        </View>
      ) : (
        <CommunityMap key={params.layer ?? 'all'} posts={posts} initialLayers={initialLayers} />
      )}
    </Screen>
  );
}

import { useMemo } from 'react';
import MapView, { Circle, Marker } from 'react-native-maps';

import { getLayer } from './layers';
import type { LatLng, MapPoint } from './types';

type Props = {
  center: LatLng;
  radiusKm: number;
  points: MapPoint[];
  selectedId?: string;
  onSelect: (id: string) => void;
};

/**
 * Mapa nativo con react-native-maps. No pide ni muestra la ubicación del dispositivo
 * (`showsUserLocation` apagado): todo lo que se ve es zona aproximada del sector.
 */
export default function NativeLayerMap({ center, radiusKm, points, selectedId, onSelect }: Props) {
  const region = useMemo(() => {
    const latDelta = (radiusKm * 2.4) / 111;
    return {
      ...center,
      latitudeDelta: latDelta,
      longitudeDelta: latDelta / Math.cos((center.latitude * Math.PI) / 180),
    };
  }, [center, radiusKm]);

  return (
    <MapView
      style={{ width: '100%', height: 340, borderRadius: 16 }}
      initialRegion={region}
      showsUserLocation={false}
      toolbarEnabled={false}
      accessibilityLabel="Mapa barrial con capas. Debajo hay una lista con la misma información">
      {points.map((p) => {
        const color = getLayer(p.layer).color;
        if (p.radiusM) {
          return <Circle key={p.id} center={p.coord} radius={p.radiusM} strokeColor={color} fillColor={`${color}33`} strokeWidth={2} />;
        }
        return (
          <Marker
            key={p.id}
            coordinate={p.coord}
            pinColor={color}
            title={p.title}
            description={p.detail}
            opacity={selectedId && selectedId !== p.id ? 0.7 : 1}
            onPress={() => onSelect(p.id)}
          />
        );
      })}
      {points
        .filter((p) => p.radiusM)
        .map((p) => (
          <Marker key={`${p.id}-pin`} coordinate={p.coord} pinColor={getLayer(p.layer).color} title={p.title} description={p.detail} onPress={() => onSelect(p.id)} />
        ))}
    </MapView>
  );
}

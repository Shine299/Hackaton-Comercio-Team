import { useEffect, useMemo, useRef } from 'react';
import { View } from 'react-native';
import MapView, { Circle, Marker } from 'react-native-maps';

import { Icon } from '@/shared/ui';

import { getLayer } from './layers';
import type { LatLng, MapPoint } from './types';

type Props = {
  center: LatLng;
  radiusKm: number;
  points: MapPoint[];
  selectedId?: string;
  height?: number;
  /** Cambia para volver a centrar el mapa en el sector. */
  recenterSignal?: number;
  onSelect: (id: string | undefined) => void;
};

const ZOOM_ON_SELECT = 0.006;

/**
 * Mapa nativo con react-native-maps. No pide ni muestra la ubicación del dispositivo
 * (`showsUserLocation` apagado): todo lo que se ve es zona aproximada del sector.
 * Interactivo: marcadores con ícono por capa, la cámara sigue a lo seleccionado, tocar el fondo
 * deselecciona y el círculo muestra el alcance del sector.
 */
export default function NativeLayerMap({
  center,
  radiusKm,
  points,
  selectedId,
  height = 360,
  recenterSignal = 0,
  onSelect,
}: Props) {
  const mapRef = useRef<MapView>(null);

  const region = useMemo(() => {
    const latDelta = (radiusKm * 2.4) / 111;
    return {
      ...center,
      latitudeDelta: latDelta,
      longitudeDelta: latDelta / Math.cos((center.latitude * Math.PI) / 180),
    };
  }, [center, radiusKm]);

  // La cámara sigue a lo seleccionado (listas, tarjeta o marcador).
  useEffect(() => {
    const target = points.find((p) => p.id === selectedId);
    if (!target) return;
    mapRef.current?.animateToRegion(
      {
        ...target.coord,
        latitudeDelta: ZOOM_ON_SELECT,
        longitudeDelta: ZOOM_ON_SELECT / Math.cos((target.coord.latitude * Math.PI) / 180),
      },
      350,
    );
    // Solo cuando cambia la selección: no al mover los puntos.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  useEffect(() => {
    if (recenterSignal > 0) mapRef.current?.animateToRegion(region, 400);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recenterSignal]);

  const zones = points.filter((p) => p.radiusM);
  const dots = points.filter((p) => !p.radiusM);

  return (
    <View style={{ height, borderRadius: 16, overflow: 'hidden' }}>
      <MapView
        ref={mapRef}
        style={{ width: '100%', height: '100%' }}
        initialRegion={region}
        showsUserLocation={false}
        toolbarEnabled={false}
        rotateEnabled={false}
        onPress={() => onSelect(undefined)}
        accessibilityLabel="Mapa barrial con capas. Debajo hay una lista con la misma información">
        <Circle
          center={center}
          radius={radiusKm * 1000}
          strokeColor="#0f5b5c"
          strokeWidth={2}
          fillColor="#0f5b5c14"
        />
        {zones.map((p) => {
          const color = getLayer(p.layer).color;
          return (
            <Circle key={p.id} center={p.coord} radius={p.radiusM as number} strokeColor={color} fillColor={`${color}33`} strokeWidth={2} />
          );
        })}
        {dots.map((p) => {
          const layer = getLayer(p.layer);
          const selected = p.id === selectedId;
          // Los lugares de referencia son cientos: pin simple. El resto, marcador con ícono de su capa.
          if (p.layer === 'places') {
            return (
              <Marker
                key={p.id}
                coordinate={p.coord}
                pinColor={layer.color}
                opacity={selectedId && !selected ? 0.6 : 1}
                onPress={(e) => {
                  e.stopPropagation();
                  onSelect(p.id);
                }}
              />
            );
          }
          const size = selected ? 44 : 34;
          return (
            <Marker
              // El `key` cambia con la selección para que Android vuelva a dibujar el marcador.
              key={`${p.id}-${selected ? 's' : 'n'}`}
              coordinate={p.coord}
              anchor={{ x: 0.5, y: 0.5 }}
              zIndex={selected ? 10 : 1}
              tracksViewChanges={false}
              onPress={(e) => {
                e.stopPropagation();
                onSelect(p.id);
              }}>
              <View
                style={{
                  width: size,
                  height: size,
                  borderRadius: size / 2,
                  backgroundColor: layer.color,
                  borderWidth: selected ? 3 : 2,
                  borderColor: '#ffffff',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: selectedId && !selected ? 0.75 : 1,
                }}>
                <Icon name={layer.icon} size={selected ? 24 : 18} color="onPrimary" />
              </View>
            </Marker>
          );
        })}
      </MapView>
    </View>
  );
}

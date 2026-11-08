import { useEffect, useMemo, useRef } from 'react';
import { View } from 'react-native';
import {
  Camera,
  GeoJSONSource,
  Layer,
  Map,
  ViewAnnotation,
  type CameraRef,
} from '@maplibre/maplibre-react-native';

import { Icon } from '@/shared/ui';

import { getLayer } from './layers';
import { circlePolygon, OSM_STYLE, zoomForRadiusKm } from './maplibre';
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

const ZOOM_ON_SELECT_KM = 0.28;
/** Tras tocar un punto, el toque «de fondo» que MapLibre también emite se ignora este rato. */
const PRESS_GUARD_MS = 350;

/**
 * Mapa nativo con MapLibre + teselas de OpenStreetMap (gratis, sin clave de Google).
 * No pide ni muestra la ubicación del dispositivo: todo lo que se ve es zona aproximada del sector.
 * Interactivo: marcadores con ícono por capa, la cámara sigue a lo seleccionado, tocar el fondo
 * deselecciona y el círculo muestra el alcance del sector. Solo módulo nativo: no corre en Expo Go.
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
  const cameraRef = useRef<CameraRef>(null);
  const lastPointPress = useRef(0);

  const sectorZoom = useMemo(() => zoomForRadiusKm(radiusKm, center.latitude), [radiusKm, center.latitude]);

  // La cámara sigue a lo seleccionado (listas, tarjeta o marcador).
  useEffect(() => {
    const target = points.find((p) => p.id === selectedId);
    if (!target) return;
    cameraRef.current?.easeTo({
      center: [target.coord.longitude, target.coord.latitude],
      zoom: zoomForRadiusKm(ZOOM_ON_SELECT_KM, target.coord.latitude),
      duration: 350,
    });
    // Solo cuando cambia la selección: no al mover los puntos.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  useEffect(() => {
    if (recenterSignal > 0) {
      cameraRef.current?.easeTo({
        center: [center.longitude, center.latitude],
        zoom: sectorZoom,
        duration: 400,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recenterSignal]);

  const select = (id: string) => {
    lastPointPress.current = Date.now();
    onSelect(id);
  };

  const sectorShape = useMemo(() => circlePolygon(center, radiusKm * 1000), [center, radiusKm]);

  const zones = useMemo(
    () => ({
      type: 'FeatureCollection' as const,
      features: points
        .filter((p) => p.radiusM)
        .map((p) => ({
          ...circlePolygon(p.coord, p.radiusM as number),
          properties: { color: getLayer(p.layer).color },
        })),
    }),
    [points],
  );

  // Lugares de referencia y comercios son cientos: puntos simples en una capa, no vistas nativas.
  const referencePoints = useMemo(
    () => ({
      type: 'FeatureCollection' as const,
      features: points
        .filter((p) => !p.radiusM && (p.layer === 'places' || p.layer === 'shops'))
        .map((p) => ({
          type: 'Feature' as const,
          properties: { id: p.id, color: getLayer(p.layer).color },
          geometry: { type: 'Point' as const, coordinates: [p.coord.longitude, p.coord.latitude] },
        })),
    }),
    [points],
  );

  const pins = points.filter((p) => !p.radiusM && p.layer !== 'places' && p.layer !== 'shops');

  return (
    <View style={{ height, borderRadius: 16, overflow: 'hidden' }}>
      <Map
        style={{ width: '100%', height: '100%' }}
        mapStyle={OSM_STYLE}
        attribution
        attributionPosition={{ bottom: 4, right: 4 }}
        logo={false}
        compass={false}
        touchRotate={false}
        touchPitch={false}
        onPress={() => {
          if (Date.now() - lastPointPress.current < PRESS_GUARD_MS) return;
          onSelect(undefined);
        }}
        accessibilityLabel="Mapa barrial con capas. Debajo hay una lista con la misma información">
        <Camera
          ref={cameraRef}
          initialViewState={{ center: [center.longitude, center.latitude], zoom: sectorZoom }}
        />

        <GeoJSONSource id="sector" data={sectorShape}>
          <Layer id="sector-fill" type="fill" paint={{ 'fill-color': '#6A2BD9', 'fill-opacity': 0.08 }} />
          <Layer id="sector-line" type="line" paint={{ 'line-color': '#6A2BD9', 'line-width': 2 }} />
        </GeoJSONSource>

        <GeoJSONSource id="zones" data={zones}>
          <Layer id="zones-fill" type="fill" paint={{ 'fill-color': ['get', 'color'], 'fill-opacity': 0.2 }} />
          <Layer id="zones-line" type="line" paint={{ 'line-color': ['get', 'color'], 'line-width': 2 }} />
        </GeoJSONSource>

        <GeoJSONSource
          id="reference"
          data={referencePoints}
          hitbox={{ top: 12, right: 12, bottom: 12, left: 12 }}
          onPress={(e) => {
            const id = e.nativeEvent.features[0]?.properties?.id;
            if (typeof id === 'string') select(id);
          }}>
          <Layer
            id="reference-dots"
            type="circle"
            paint={{
              'circle-color': ['get', 'color'],
              'circle-radius': ['case', ['==', ['get', 'id'], selectedId ?? ''], 9, 6],
              'circle-stroke-color': '#ffffff',
              'circle-stroke-width': 2,
              'circle-opacity': selectedId ? 0.85 : 1,
            }}
          />
        </GeoJSONSource>

        {pins.map((p) => {
          const layer = getLayer(p.layer);
          const selected = p.id === selectedId;
          const size = selected ? 40 : 32;
          return (
            <ViewAnnotation
              key={p.id}
              id={`pin-${p.id}`}
              lngLat={[p.coord.longitude, p.coord.latitude]}
              anchor="bottom"
              onPress={() => select(p.id)}>
              {/* Pin de gota: cuadrado con una esquina recta, girado 45° para que apunte abajo. */}
              <View style={{ width: size * 1.45, height: size * 1.45, alignItems: 'center', justifyContent: 'flex-start', opacity: selectedId && !selected ? 0.8 : 1 }}>
                <View
                  style={{
                    width: size,
                    height: size,
                    marginTop: size * 0.1,
                    borderRadius: size / 2,
                    borderBottomRightRadius: 0,
                    transform: [{ rotate: '45deg' }],
                    backgroundColor: layer.color,
                    borderWidth: selected ? 3 : 2,
                    borderColor: '#ffffff',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <View style={{ transform: [{ rotate: '-45deg' }] }}>
                    <Icon name={layer.icon} size={selected ? 20 : 16} color="onPrimary" />
                  </View>
                </View>
              </View>
            </ViewAnnotation>
          );
        })}
      </Map>
    </View>
  );
}

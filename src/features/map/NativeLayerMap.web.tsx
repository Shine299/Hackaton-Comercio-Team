import L from 'leaflet';
import { useEffect, useRef } from 'react';
import { View } from 'react-native';

import { getLayer } from './layers';
import type { LatLng, MapPoint } from './types';

type Props = {
  center: LatLng;
  radiusKm: number;
  points: MapPoint[];
  selectedId?: string;
  height?: number;
  recenterSignal?: number;
  onSelect: (id: string | undefined) => void;
};

const LEAFLET_CSS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';

function ensureCss() {
  if (document.getElementById('leaflet-css')) return;
  const link = document.createElement('link');
  link.id = 'leaflet-css';
  link.rel = 'stylesheet';
  link.href = LEAFLET_CSS;
  document.head.appendChild(link);
}

/**
 * Mapa web con Leaflet + OpenStreetMap (gratis, sin clave). Misma interfaz que la versión nativa:
 * zonas como círculos, el resto como puntos de color por capa. Todo es zona aproximada.
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
  const hostRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);
  const onSelectRef = useRef(onSelect);
  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  // Crear el mapa una sola vez.
  useEffect(() => {
    ensureCss();
    const host = hostRef.current;
    if (!host) return;
    const map = L.map(host, { zoomControl: true, attributionControl: true }).setView(
      [center.latitude, center.longitude],
      14,
    );
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap',
    }).addTo(map);
    map.on('click', () => onSelectRef.current(undefined));
    layerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;
    map.fitBounds(L.latLng(center.latitude, center.longitude).toBounds(radiusKm * 2400));
    return () => {
      map.remove();
      mapRef.current = null;
      layerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Redibujar capas, zonas y puntos.
  useEffect(() => {
    const group = layerRef.current;
    if (!group) return;
    group.clearLayers();
    L.circle([center.latitude, center.longitude], {
      radius: radiusKm * 1000,
      color: '#6A2BD9',
      weight: 2,
      fillColor: '#6A2BD9',
      fillOpacity: 0.08,
      interactive: false,
    }).addTo(group);
    for (const p of points) {
      const color = getLayer(p.layer).color;
      const selected = p.id === selectedId;
      if (p.radiusM) {
        L.circle([p.coord.latitude, p.coord.longitude], {
          radius: p.radiusM,
          color,
          weight: 2,
          fillColor: color,
          fillOpacity: 0.2,
        })
          .on('click', (e) => {
            L.DomEvent.stopPropagation(e);
            onSelectRef.current(p.id);
          })
          .addTo(group);
        continue;
      }
      // Pin de gota (como Google Maps): la punta marca la coordenada.
      const w = selected ? 36 : p.layer === 'places' || p.layer === 'shops' ? 20 : 28;
      const h = Math.round(w * 1.3);
      const icon = L.divIcon({
        className: '',
        iconSize: [w, h],
        iconAnchor: [w / 2, h],
        html: `<svg width="${w}" height="${h}" viewBox="0 0 24 31" style="filter:drop-shadow(0 2px 3px rgba(0,0,0,.4));display:block"><path d="M12 1C5.9 1 1 5.9 1 12c0 8.2 11 18 11 18s11-9.8 11-18C23 5.9 18.1 1 12 1z" fill="${color}" stroke="#fff" stroke-width="${selected ? 2.5 : 1.8}"/><circle cx="12" cy="12" r="4.5" fill="#fff"/></svg>`,
      });
      L.marker([p.coord.latitude, p.coord.longitude], {
        icon,
        title: p.title,
        zIndexOffset: selected ? 1000 : 0,
      })
        .on('click', (e) => {
          L.DomEvent.stopPropagation(e);
          onSelectRef.current(p.id);
        })
        .addTo(group);
    }
  }, [points, selectedId, center, radiusKm]);

  // La cámara sigue a lo seleccionado.
  useEffect(() => {
    const target = points.find((p) => p.id === selectedId);
    if (target) mapRef.current?.flyTo([target.coord.latitude, target.coord.longitude], 17, { duration: 0.35 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  useEffect(() => {
    if (recenterSignal > 0) {
      mapRef.current?.flyToBounds(L.latLng(center.latitude, center.longitude).toBounds(radiusKm * 2400), {
        duration: 0.4,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recenterSignal]);

  // El contenedor cambia de alto al ampliar: avisar a Leaflet.
  useEffect(() => {
    mapRef.current?.invalidateSize();
  }, [height]);

  return (
    <View style={{ height, borderRadius: 16, overflow: 'hidden' }}>
      <div
        ref={hostRef}
        role="application"
        aria-label="Mapa barrial con capas. Debajo hay una lista con la misma información"
        style={{ width: '100%', height: '100%' }}
      />
    </View>
  );
}

import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { useSectorCameras } from '@/features/cameras';
import { buildBoard, useEmergencyStore, useSharedBoard } from '@/features/emergency';
import type { Post } from '@/features/posts';
import { useProfilePrefsStore } from '@/features/profile';
import { useSectorStore } from '@/features/sector';
import { Badge, Button, Card, Chip, DemoTag, Icon, Text, TextField } from '@/shared/ui';

import { buildMapPoints } from './buildMapPoints';
import { DEFAULT_LAYERS, getLayer, MAP_LAYERS } from './layers';
import { MapFab } from './MapFab';
import NativeLayerMap from './NativeLayerMap';
import { PLACES_ATTRIBUTION } from './places';
import type { MapLayerId, MapPoint } from './types';

const LIST_CAP = 8;

function PointRow({ point, selected, onPress }: { point: MapPoint; selected: boolean; onPress: () => void }) {
  const layer = getLayer(point.layer);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${layer.label}: ${point.title}`}
      accessibilityState={{ selected }}
      onPress={onPress}
      className={
        selected
          ? 'flex-row items-start gap-3 rounded-xl border-2 border-primary bg-surface-container-lowest p-3 active:opacity-80'
          : 'flex-row items-start gap-3 rounded-xl bg-surface-container-lowest p-3 active:opacity-80'
      }>
      <Icon name={layer.icon} size={22} color="primary" />
      <View className="min-w-0 flex-1 gap-0.5">
        <Text variant="body-md-medium" numberOfLines={2}>
          {point.title}
        </Text>
        {point.detail ? (
          <Text variant="label-md" tone="muted" numberOfLines={2}>
            {point.detail}
          </Text>
        ) : null}
        {point.isDemo ? <DemoTag /> : null}
      </View>
    </Pressable>
  );
}

/**
 * Mapa barrial por capas (Explorar → Mapa). En iOS y Android muestra react-native-maps; en la vista web de desarrollo,
 * la misma información en lista y un aviso claro. Los puntos son siempre zona aproximada.
 */
export function CommunityMap({
  posts,
  initialLayers,
  layers,
  embedded = false,
  height,
}: {
  posts: Post[];
  initialLayers?: MapLayerId[];
  /** Capas fijas de la sección donde vive el mapa (oculta los chips de capas). */
  layers?: MapLayerId[];
  /** Versión para incrustar en una sección: solo mapa, tarjeta del punto y nota de privacidad. */
  embedded?: boolean;
  height?: number;
}) {
  const router = useRouter();
  const sector = useSectorStore((s) => s.sector);
  const reports = useEmergencyStore((s) => s.reports);
  const vulnerable = useEmergencyStore((s) => s.vulnerable);
  const offers = useEmergencyStore((s) => s.offers);
  const volunteerAvailable = useProfilePrefsStore((s) => s.volunteerAvailable);
  const showSector = useProfilePrefsStore((s) => s.showSector);
  const [now] = useState(() => Date.now());
  const [active, setActive] = useState<MapLayerId[]>(layers ?? initialLayers ?? DEFAULT_LAYERS);
  const [selectedId, setSelectedId] = useState<string | undefined>();
  const [showList, setShowList] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [recenter, setRecenter] = useState(0);
  const [search, setSearch] = useState('');
  const { data: shared = [] } = useSharedBoard(sector.id);
  const cameras = useSectorCameras();

  // En Expo Go el mapa funciona sin clave; la clave de Google solo hace falta en builds de producción.
  // La app es solo móvil; la vista web de desarrollo usa Leaflet (NativeLayerMap.web.tsx) únicamente para revisar.
  const nativeMap = true;

  const all = useMemo(() => {
    // Lo que el servidor ya muestra en vivo no se repite desde el teléfono.
    const sharedIds = new Set(shared.map((s) => s.id));
    const board = buildBoard({
      sectorId: sector.id,
      sectorName: sector.name,
      reports: reports.filter((r) => !sharedIds.has(r.id)),
      vulnerable: vulnerable.filter((v) => !sharedIds.has(v.id)),
      offers,
      now,
    });
    return buildMapPoints({ sector, posts, board, shared, volunteer: { available: volunteerAvailable, showSector }, cameras });
  }, [sector, posts, reports, vulnerable, offers, now, shared, volunteerAvailable, showSector, cameras]);

  const needle = search.trim().toLowerCase();
  const visible = all.filter(
    (p) =>
      active.includes(p.layer) &&
      (!needle || p.title.toLowerCase().includes(needle) || (p.detail ?? '').toLowerCase().includes(needle)),
  );
  const selected = visible.find((p) => p.id === selectedId);
  const counts = useMemo(() => {
    const map = new Map<MapLayerId, number>();
    for (const p of all) map.set(p.layer, (map.get(p.layer) ?? 0) + 1);
    return map;
  }, [all]);

  const toggle = (id: MapLayerId) =>
    setActive((cur) => (cur.includes(id) ? cur.filter((l) => l !== id) : [...cur, id]));

  const open = (point: MapPoint) => {
    const t = point.target;
    if (t.kind === 'post') router.push({ pathname: '/publicacion/[id]', params: { id: t.id } });
    else if (t.kind === 'report') router.push({ pathname: '/emergencias/estado/[id]', params: { id: t.id } });
    else if (t.kind === 'board' || t.kind === 'shared') router.push('/emergencias/tablero');
    else if (t.kind === 'camera') router.push({ pathname: '/camaras/[id]', params: { id: t.id } });
  };

  const listVisible = !embedded && (!nativeMap || showList);

  return (
    <View className="gap-3">
      {!layers ? (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2 pr-4">
        {MAP_LAYERS.map((layer) => (
          <Chip
            key={layer.id}
            label={`${layer.label} · ${counts.get(layer.id) ?? 0}`}
            icon={layer.icon}
            selected={active.includes(layer.id)}
            onPress={() => toggle(layer.id)}
          />
        ))}
      </ScrollView>
      ) : null}

      {!embedded ? (
      <TextField
        label="Buscar en el mapa"
        hideLabel
        leadingIcon="magnify"
        placeholder="Buscar bodega, ayuda, herramienta…"
        value={search}
        onChangeText={setSearch}
        onClear={() => setSearch('')}
        returnKeyType="search"
      />
      ) : null}

      {!nativeMap ? (
        <Card tone="warning">
          <View className="flex-row items-center gap-2">
            <Icon name="map-marker-off-outline" size={22} color="warning" />
            <Text variant="body-lg-bold">Mapa no disponible</Text>
          </View>
          <Text>
            El mapa nativo no funciona en la versión web. Te mostramos la misma información en lista.
          </Text>
        </Card>
      ) : (
        <View>
          <NativeLayerMap
            center={sector.center}
            radiusKm={sector.radiusKm}
            points={visible}
            selectedId={selectedId}
            height={expanded ? 560 : (height ?? 360)}
            recenterSignal={recenter}
            onSelect={setSelectedId}
          />
          <View className="absolute right-3 top-3 gap-2">
            <MapFab
              icon={expanded ? 'arrow-collapse' : 'arrow-expand'}
              label={expanded ? 'Reducir el mapa' : 'Ampliar el mapa'}
              onPress={() => setExpanded((v) => !v)}
            />
            <MapFab
              icon="target"
              label="Volver a centrar el mapa en tu sector"
              onPress={() => {
                setSelectedId(undefined);
                setRecenter((n) => n + 1);
              }}
            />
          </View>
          <View className="absolute bottom-3 left-3 rounded-full bg-surface-container-lowest px-3 py-1.5 shadow-sm elevation-xs">
            <Text variant="label-md">
              {visible.length} {visible.length === 1 ? 'punto' : 'puntos'} en el mapa
            </Text>
          </View>
        </View>
      )}

      {selected ? (
        <Card tone="low" accessibilityLiveRegion="polite">
          <View className="flex-row items-start gap-2">
            <Icon name={getLayer(selected.layer).icon} size={22} color="primary" />
            <Text variant="body-lg-bold" className="flex-1">
              {selected.title}
            </Text>
          </View>
          {selected.detail ? <Text tone="muted">{selected.detail}</Text> : null}
          <View className="flex-row flex-wrap gap-2">
            {selected.isDemo ? <DemoTag /> : null}
            <Badge label={`Fuente: ${selected.source}`} tone="neutral" />
          </View>
          {selected.target.kind !== 'none' ? (
            <Button
              label={
                selected.target.kind === 'shared'
                  ? 'Abrir en el tablero y ayudar'
                  : selected.target.kind === 'camera'
                    ? 'Ver la cámara'
                    : 'Ver detalle'
              }
              icon={selected.target.kind === 'shared' ? 'hand-heart-outline' : 'arrow-right'}
              onPress={() => open(selected)}
            />
          ) : null}
        </Card>
      ) : nativeMap ? (
        <Text variant="label-md" tone="muted">
          Toca un punto para ver qué es y abrir su detalle.
        </Text>
      ) : null}

      {nativeMap && !embedded ? (
        <Button
          label={showList ? 'Ocultar lista de puntos' : 'Ver lista de puntos'}
          variant="tonal"
          icon="format-list-bulleted"
          onPress={() => setShowList((v) => !v)}
        />
      ) : null}

      {listVisible ? (
        <View className="gap-3">
          {MAP_LAYERS.filter((l) => active.includes(l.id)).map((layer) => {
            const rows = visible.filter((p) => p.layer === layer.id);
            const shown = layer.id === 'places' ? rows.slice(0, LIST_CAP) : rows;
            return (
              <View key={layer.id} className="gap-2">
                <Text variant="overline" tone="muted">
                  {layer.label}
                </Text>
                {rows.length === 0 ? <Text tone="muted">Nada en esta capa para tu sector.</Text> : null}
                {shown.map((p) => (
                  <PointRow
                    key={p.id}
                    point={p}
                    selected={p.id === selectedId}
                    onPress={() => (nativeMap || p.target.kind === 'none' ? setSelectedId(p.id) : open(p))}
                  />
                ))}
                {rows.length > shown.length ? (
                  <Text variant="label-md" tone="muted">
                    +{rows.length - shown.length} más en el mapa.
                  </Text>
                ) : null}
              </View>
            );
          })}
        </View>
      ) : null}

      <View className="flex-row items-start gap-2 rounded-xl bg-surface-container-low p-3">
        <Icon name="shield-lock-outline" size={20} color="primary" />
        <Text variant="label-md" tone="muted" className="flex-1">
          Todos los puntos son zona aproximada de tu sector; nunca usamos tu ubicación exacta. Lo marcado
          como demo es ficticio.
          {active.includes('places') ? ` ${PLACES_ATTRIBUTION}` : ''}
        </Text>
      </View>
    </View>
  );
}

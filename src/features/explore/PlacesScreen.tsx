import { useEffect, useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';

import { BusinessDirectory } from '@/features/business';
import {
  CommunityMap,
  getNeighborhoodPlaces,
  type MapPoint,
  type NeighborhoodPlace,
  PLACES_ATTRIBUTION,
} from '@/features/map';
import { useSectorStore } from '@/features/sector';
import { SectionHeader } from '@/features/shell';
import { formatApproxDistance } from '@/shared/format';
import { Card, Chip, Icon, type IconName, Screen, SegmentedControl, Text } from '@/shared/ui';

import type { OpenState } from './openingHours';
import { explorePlaces, PLACE_GROUPS, PLACE_KIND_LABEL, PLACES_LIMIT, type PlaceGroup, type PlaceRow } from './places';

const STATE_UI: Record<OpenState, { label: string; icon: IconName; tone: 'primary' | 'muted' }> = {
  open: {
    label: 'Abierto ahora',
    icon: 'clock-check-outline',
    tone: 'primary',
  },
  closed: {
    label: 'Cerrado ahora',
    icon: 'clock-remove-outline',
    tone: 'muted',
  },
  unknown: {
    label: 'Horario no confirmado',
    icon: 'clock-alert-outline',
    tone: 'muted',
  },
};

const GROUP_ICON = Object.fromEntries(PLACE_GROUPS.map((g) => [g.id, g.icon])) as Record<PlaceGroup, IconName>;

/** SPEC-054: ícono por tipo de lugar (solo presentación); si un tipo no está aquí se usa el del grupo. */
const KIND_ICON: Partial<Record<string, IconName>> = {
  restaurant: 'silverware-fork-knife',
  cafe: 'coffee-outline',
  bakery: 'bread-slice-outline',
  supermarket: 'cart-outline',
  convenience: 'store-24-hour',
  marketplace: 'fruit-watermelon',
  pharmacy: 'pill',
  hospital: 'hospital-building',
  clinic: 'hospital-box-outline',
  bank: 'bank-outline',
};

function PlaceCard({ row }: { row: PlaceRow<NeighborhoodPlace> }) {
  const { place, state, todayLabel } = row;
  const ui = STATE_UI[state];
  const kind = PLACE_KIND_LABEL[place.amenity] ?? 'Lugar';
  const distance = formatApproxDistance(place.distanceM);
  return (
    <View
      accessible
      accessibilityLabel={[place.name, kind, `${distance} del centro del sector`, ui.label, todayLabel]
        .filter(Boolean)
        .join('. ')}
      className="min-h-16 flex-row items-center gap-3 rounded-2xl bg-surface-container-lowest p-3.5 shadow-sm elevation-xs"
    >
      <View className="h-12 w-12 items-center justify-center rounded-2xl bg-primary-fixed">
        <Icon name={KIND_ICON[place.amenity] ?? GROUP_ICON[row.group]} size={24} color="primary" />
      </View>
      <View className="min-w-0 flex-1 gap-0.5">
        <Text variant="body-lg-bold" numberOfLines={2}>
          {place.name}
        </Text>
        <Text variant="label-md" tone="muted" numberOfLines={1}>
          {kind} · {distance}
        </Text>
        <View className="flex-row flex-wrap items-center gap-x-2 gap-y-0.5">
          <View className="flex-row items-center gap-1">
            <Icon name={ui.icon} size={16} color={ui.tone === 'primary' ? 'primary' : 'onSurfaceVariant'} />
            <Text variant="label-md" tone={ui.tone}>
              {ui.label}
            </Text>
          </View>
          {todayLabel && state !== 'unknown' ? (
            <Text variant="label-md" tone="muted">
              · {todayLabel}
            </Text>
          ) : null}
        </View>
      </View>
    </View>
  );
}

/**
 * Explorar → Lugares (SPEC-047, simplificado): solo los lugares relevantes del barrio (comida, tiendas, salud y
 * servicios), los 12 más cercanos, en lista o en mapa. «Abierto ahora» solo se muestra si el lugar publica un
 * horario que se entiende; si no, «Horario no confirmado». Nunca se inventa un estado.
 */
export function PlacesScreen() {
  const sector = useSectorStore((s) => s.sector);
  const [tab, setTab] = useState<'places' | 'business'>('places');
  const [group, setGroup] = useState<PlaceGroup | 'all'>('all');
  const [view, setView] = useState<'list' | 'map'>('list');
  // La hora de referencia se actualiza cada minuto para que «Abierto ahora» no quede viejo.
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  const places = useMemo(() => getNeighborhoodPlaces(sector.center, sector.radiusKm), [sector.center, sector.radiusKm]);
  const rows = useMemo(
    () =>
      explorePlaces(places, {
        group,
        openNow: false,
        query: '',
        date: now,
      }).slice(0, PLACES_LIMIT),
    [places, group, now],
  );
  // El mapa dibuja exactamente lo que muestra la lista.
  const pins = useMemo<MapPoint[]>(
    () =>
      rows.map(({ place }) => ({
        id: place.id,
        layer: 'shops',
        title: place.name,
        detail: PLACE_KIND_LABEL[place.amenity] ?? 'Lugar del barrio',
        coord: { latitude: place.latitude, longitude: place.longitude },
        isDemo: false,
        source: 'OpenStreetMap',
        target: { kind: 'none' },
      })),
    [rows],
  );

  return (
    <Screen contentClassName="gap-4 px-5 pb-6 pt-4">
      <SectionHeader title="Negocios" />

      <SegmentedControl
        accessibilityLabel="Qué explorar"
        value={tab}
        onChange={setTab}
        options={[
          { value: 'places', label: 'Lugares', icon: 'map-marker-outline' },
          { value: 'business', label: 'Negocios', icon: 'storefront-outline' },
        ]}
      />

      {tab === 'business' ? (
        <BusinessDirectory />
      ) : (
        <>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2 pr-4">
            <Chip role="radio" label="Todo" icon="apps" selected={group === 'all'} onPress={() => setGroup('all')} />
            {PLACE_GROUPS.map((g) => (
              <Chip
                key={g.id}
                role="radio"
                label={g.label}
                icon={g.icon}
                selected={group === g.id}
                onPress={() => setGroup(g.id)}
              />
            ))}
          </ScrollView>

          <SegmentedControl
            accessibilityLabel="Ver lugares como"
            value={view}
            onChange={setView}
            options={[
              { value: 'list', label: 'Lista', icon: 'format-list-bulleted' },
              { value: 'map', label: 'Mapa', icon: 'map-outline' },
            ]}
          />

          {view === 'map' ? (
            <CommunityMap posts={[]} pins={pins} layers={['shops']} embedded height={400} />
          ) : rows.length === 0 ? (
            <Card className="items-center gap-2 py-8">
              <Icon name="map-search-outline" size={34} color="primary" />
              <Text variant="headline-sm" className="text-center">
                No encontramos lugares
              </Text>
              <Text tone="muted" className="text-center">
                Prueba con otro tipo de lugar.
              </Text>
            </Card>
          ) : (
            <View className="gap-3">
              <Text variant="label-md" tone="muted" accessibilityLiveRegion="polite">
                Los {rows.length} más cercanos a tu sector
              </Text>
              {rows.map((row) => (
                <PlaceCard key={row.place.id} row={row} />
              ))}
            </View>
          )}

          <View className="flex-row items-start gap-2 px-1">
            <Icon name="information-outline" size={18} color="primary" />
            <Text variant="label-md" tone="muted" className="flex-1">
              Las distancias son al centro de tu sector. {PLACES_ATTRIBUTION}
            </Text>
          </View>
        </>
      )}
    </Screen>
  );
}

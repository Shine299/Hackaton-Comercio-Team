import type { IconName } from '@/shared/ui';

import { type OpenState, openStateAt, todayHoursLabel } from './openingHours';

/** Grupos de Explorar (SPEC-047). Los lugares de Emergencia (comisaría, bomberos, colegios…) no entran aquí. */
export type PlaceGroup = 'food' | 'shops' | 'health' | 'services';

export const PLACE_GROUPS: { id: PlaceGroup; label: string; icon: IconName }[] = [
  { id: 'food', label: 'Comida', icon: 'silverware-fork-knife' },
  { id: 'shops', label: 'Tiendas', icon: 'cart-outline' },
  { id: 'health', label: 'Salud', icon: 'medical-bag' },
  { id: 'services', label: 'Servicios', icon: 'room-service-outline' },
];

const GROUP_BY_KIND: Record<string, PlaceGroup> = {
  restaurant: 'food',
  cafe: 'food',
  fast_food: 'food',
  bakery: 'food',
  supermarket: 'shops',
  convenience: 'shops',
  marketplace: 'shops',
  mall: 'shops',
  hardware: 'shops',
  butcher: 'shops',
  greengrocer: 'shops',
  stationery: 'shops',
  pet: 'shops',
  pharmacy: 'health',
  hospital: 'health',
  clinic: 'health',
  optician: 'health',
  bank: 'services',
  hairdresser: 'services',
  laundry: 'services',
};

export const PLACE_KIND_LABEL: Record<string, string> = {
  restaurant: 'Restaurante',
  cafe: 'Café',
  fast_food: 'Comida rápida',
  bakery: 'Panadería',
  supermarket: 'Supermercado',
  convenience: 'Bodega',
  marketplace: 'Mercado',
  mall: 'Centro comercial',
  hardware: 'Ferretería',
  butcher: 'Carnicería',
  greengrocer: 'Verdulería',
  stationery: 'Librería',
  pet: 'Tienda de mascotas',
  pharmacy: 'Farmacia',
  hospital: 'Hospital',
  clinic: 'Clínica o posta',
  optician: 'Óptica',
  bank: 'Banco',
  hairdresser: 'Peluquería',
  laundry: 'Lavandería',
};

export function placeGroupOf(kind: string): PlaceGroup | null {
  return GROUP_BY_KIND[kind] ?? null;
}

/** Lo mínimo de un lugar (estructural, para no depender de `features/map` en la lógica pura). */
export type PlaceInput = { id: string; name: string; amenity: string; distanceM: number; openingHours?: string };

export type PlaceRow<P extends PlaceInput = PlaceInput> = {
  place: P;
  group: PlaceGroup;
  state: OpenState;
  /** «Hoy 8:00–22:00», «Hoy cerrado»… o `undefined` si el horario no se entiende. */
  todayLabel?: string;
};

type ExploreFilters = { group: PlaceGroup | 'all'; openNow: boolean; query: string; date: Date };

const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim();

/**
 * Lugares para Explorar, del más cercano al más lejano. «Abierto ahora» solo deja los que tienen horario entendido
 * y abierto: un lugar sin horario nunca cuenta como abierto (D3).
 */
export function explorePlaces<P extends PlaceInput>(places: P[], { group, openNow, query, date }: ExploreFilters): PlaceRow<P>[] {
  const words = normalize(query).split(/\s+/).filter(Boolean);
  const rows: PlaceRow<P>[] = [];
  for (const place of places) {
    const placeGroup = placeGroupOf(place.amenity);
    if (!placeGroup) continue;
    if (group !== 'all' && placeGroup !== group) continue;
    if (words.length > 0) {
      const text = normalize(`${place.name} ${PLACE_KIND_LABEL[place.amenity] ?? ''}`);
      if (!words.every((w) => text.includes(w))) continue;
    }
    const state = openStateAt(place.openingHours, date);
    if (openNow && state !== 'open') continue;
    rows.push({ place, group: placeGroup, state, todayLabel: todayHoursLabel(place.openingHours, date) });
  }
  return rows.sort((a, b) => a.place.distanceM - b.place.distanceM);
}

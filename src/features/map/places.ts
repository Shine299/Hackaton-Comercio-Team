import { distanceKm } from '@/shared/geo/distance';

import placesData from './data/places.json';
import type { MapPoint } from './types';

type RawPlace = {
  id: string;
  name: string;
  /** Tipo de OSM: amenity de referencia o del comercio (restaurant, supermarket…). */
  amenity: string;
  /** health | pharmacy | safety | shelter (referencia de Emergencia) | commerce (Explorar, SPEC-047). */
  category: string;
  latitude: number;
  longitude: number;
  /** `opening_hours` de OSM tal cual, si existe. */
  openingHours?: string;
};

/** Lugar del barrio con su distancia aproximada al centro del sector (nunca al GPS del teléfono). */
export type NeighborhoodPlace = RawPlace & { distanceM: number };

const ALL_PLACES = placesData.places as RawPlace[];

const AMENITY_LABEL: Record<string, string> = {
  hospital: 'Hospital',
  clinic: 'Clínica o posta',
  pharmacy: 'Farmacia',
  police: 'Comisaría',
  fire_station: 'Bomberos',
  school: 'Colegio (posible punto de reunión)',
  community_centre: 'Centro comunal',
  townhall: 'Municipalidad',
};

export const PLACES_ATTRIBUTION = `${placesData.license}. Datos del ${placesData.fetchedAt}; confirma siempre antes de ir.`;

/**
 * Lugares de referencia (OSM) versionados en el repo: se leen de un JSON, no hay llamadas de red
 * al renderizar. Cubren los sectores del demo y se filtran por cercanía al centro del sector.
 */
export function getPlacePoints(center: { latitude: number; longitude: number }, radiusKm: number): MapPoint[] {
  return ALL_PLACES.filter((p) => p.category !== 'commerce' && distanceKm(center, p) <= radiusKm)
    .map<MapPoint>((p) => ({
      id: p.id,
      layer: 'places',
      title: p.name,
      detail: AMENITY_LABEL[p.amenity] ?? 'Lugar de referencia',
      coord: { latitude: p.latitude, longitude: p.longitude },
      isDemo: false,
      source: 'OpenStreetMap',
      target: { kind: 'none' },
    }));
}

/** Lugares del barrio (referencia y comercios) dentro del radio, del más cercano al más lejano. */
export function getNeighborhoodPlaces(center: { latitude: number; longitude: number }, radiusKm: number): NeighborhoodPlace[] {
  return ALL_PLACES.map((p) => ({ ...p, distanceM: Math.round(distanceKm(center, p) * 1000) }))
    .filter((p) => p.distanceM <= radiusKm * 1000)
    .sort((a, b) => a.distanceM - b.distanceM);
}

/** Capa «Comercios» (SPEC-047): tiendas, restaurantes y servicios de OSM. */
export function getShopPoints(center: { latitude: number; longitude: number }, radiusKm: number): MapPoint[] {
  return ALL_PLACES.filter((p) => p.category === 'commerce' && distanceKm(center, p) <= radiusKm).map<MapPoint>((p) => ({
    id: p.id,
    layer: 'shops',
    title: p.name,
    detail: 'Comercio del barrio',
    coord: { latitude: p.latitude, longitude: p.longitude },
    isDemo: false,
    source: 'OpenStreetMap',
    target: { kind: 'none' },
  }));
}

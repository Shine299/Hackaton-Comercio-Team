import { distanceKm } from '@/shared/geo/distance';

import placesData from './data/places.json';
import type { MapPoint } from './types';

type RawPlace = {
  id: string;
  name: string;
  amenity: string;
  category: string;
  latitude: number;
  longitude: number;
};

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
  return (placesData.places as RawPlace[])
    .filter((p) => distanceKm(center, p) <= radiusKm)
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

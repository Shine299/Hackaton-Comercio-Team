import { DEFAULT_RADIUS_KM, type Sector } from './types';

/**
 * Sectores disponibles en el demo. Coordenadas aproximadas del centro del distrito.
 * Lince es el distrito de demo; los vecinos pueden añadirse sin tocar la UI.
 */
export const SECTORS: Sector[] = [
  {
    id: 'lince',
    name: 'Lince',
    city: 'Lima',
    center: { latitude: -12.0847, longitude: -77.0343 },
    radiusKm: DEFAULT_RADIUS_KM,
  },
  {
    id: 'jesus-maria',
    name: 'Jesús María',
    city: 'Lima',
    center: { latitude: -12.0701, longitude: -77.0509 },
    radiusKm: DEFAULT_RADIUS_KM,
  },
  {
    id: 'san-isidro',
    name: 'San Isidro',
    city: 'Lima',
    center: { latitude: -12.1005, longitude: -77.0364 },
    radiusKm: DEFAULT_RADIUS_KM,
  },
  {
    id: 'la-victoria',
    name: 'La Victoria',
    city: 'Lima',
    center: { latitude: -12.0654, longitude: -77.0156 },
    radiusKm: DEFAULT_RADIUS_KM,
  },
];

export const DEFAULT_SECTOR: Sector = SECTORS[0];

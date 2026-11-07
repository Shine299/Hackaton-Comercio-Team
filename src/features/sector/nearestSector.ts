import { distanceKm, type LatLng } from '@/shared/geo/distance';

import { SECTORS } from './data';
import type { Sector } from './types';

/** Distancia máxima al centro de un sector para considerar que la persona está "dentro". */
export const MAX_SECTOR_MATCH_KM = 3;

export type NearestSector = { sector: Sector; distanceKm: number };

/** Devuelve el sector cuyo centro está más cerca de un punto. */
export function findNearestSector(point: LatLng, sectors: Sector[] = SECTORS): NearestSector {
  let best: NearestSector | null = null;
  for (const sector of sectors) {
    const d = distanceKm(point, sector.center);
    if (!best || d < best.distanceKm) best = { sector, distanceKm: d };
  }
  // `sectors` nunca está vacío en la app; el fallback evita un null inalcanzable.
  return best ?? { sector: SECTORS[0], distanceKm: Infinity };
}

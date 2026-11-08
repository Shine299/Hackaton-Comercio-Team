import { demoCamerasFundId } from '@/features/funds';

import type { Camera } from './types';

/** Cámaras ficticias (sin video real): muestran una vista ilustrada y siempre llevan `DemoTag`. */
export function demoCameras(sectorId: string, sectorName: string): Camera[] {
  const base = { sectorId, host: null, isDemo: true, isLocal: false };
  return [
    {
      ...base,
      id: `demo-cam-1-${sectorId}`,
      name: 'Cámara 1 · Jr. Pachacútec',
      placeLabel: 'Jr. Pachacútec, cuadra 4',
      fundId: demoCamerasFundId(sectorId),
      active: true,
    },
    {
      ...base,
      id: `demo-cam-2-${sectorId}`,
      name: 'Cámara 2 · Parque',
      placeLabel: `Parque de ${sectorName}`,
      fundId: null,
      active: true,
    },
    {
      ...base,
      id: `demo-cam-3-${sectorId}`,
      name: 'Cámara 3 · Jr. Risso',
      placeLabel: 'Jr. Risso, cuadra 2',
      fundId: null,
      active: false,
    },
  ];
}

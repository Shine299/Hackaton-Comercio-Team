import { useMemo } from 'react';

import { useSectorStore } from '@/features/sector';

import { demoCameras } from './demoCameras';
import { useCamerasStore } from './store';
import type { Camera } from './types';

/** Cámaras del sector: las registradas en este teléfono primero, luego las de demostración. */
export function useSectorCameras(): Camera[] {
  const sector = useSectorStore((s) => s.sector);
  const local = useCamerasStore((s) => s.cameras);
  return useMemo(
    () => [...local.filter((c) => c.sectorId === sector.id), ...demoCameras(sector.id, sector.name)],
    [local, sector.id, sector.name],
  );
}

export function useCamera(id: string): Camera | undefined {
  return useSectorCameras().find((c) => c.id === id);
}

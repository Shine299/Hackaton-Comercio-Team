import { useState } from 'react';

import { useSectorStore } from '@/features/sector';

import { demoPets } from './demoPets';
import type { Pet } from './types';

/** Perritos comunitarios del sector (por ahora, de demostración). */
export function useSectorPets(): { pets: Pet[]; now: number } {
  const sector = useSectorStore((s) => s.sector);
  const [now] = useState(() => Date.now());
  return { pets: demoPets(sector.id, sector.name, now), now };
}

/** Busca por `slug` (lo que trae el QR del collar) o por id. */
export function usePet(slugOrId: string) {
  const { pets, now } = useSectorPets();
  return { pet: pets.find((p) => p.slug === slugOrId || p.id === slugOrId), now };
}

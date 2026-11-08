import { demoPetFundId } from '@/features/funds';

import type { Pet } from './types';

const HOUR = 3_600_000;

/** Perritos comunitarios ficticios. Siempre con `DemoTag`. */
export function demoPets(sectorId: string, sectorName: string, now: number): Pet[] {
  return [
    {
      id: `demo-pet-negrito-${sectorId}`,
      slug: 'negrito',
      sectorId,
      name: 'Negrito',
      description: 'Mediano, negro con pecho blanco. Muy amigable con los niños. Lo cuidan los vecinos de las cuadras 3 a 5.',
      homeZone: `Parque de ${sectorName}`,
      health: 'Vacunado en marzo · esterilizado',
      fundId: demoPetFundId(sectorId),
      lastSeenAt: now - 2 * HOUR,
      lastSeenZone: 'cerca del parque',
      isDemo: true,
    },
  ];
}

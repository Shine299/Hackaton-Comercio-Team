import type { Fund } from './types';

const DAY = 86_400_000;

/** Id del fondo demo de cámaras: las cámaras demo lo enlazan («Financiada por N vecinos»). */
export const demoCamerasFundId = (sectorId: string) => `demo-fund-camaras-${sectorId}`;
/** Id del fondo demo del perrito comunitario (lo enlaza su perfil). */
export const demoPetFundId = (sectorId: string) => `demo-fund-negrito-${sectorId}`;

/** Fondos ficticios para la demostración (sin servidor). Siempre con `isDemo` y `DemoTag`. */
export function demoFunds(sectorId: string, sectorName: string, now: number): Fund[] {
  return [
    {
      id: demoCamerasFundId(sectorId),
      sectorId,
      kind: 'iniciativa',
      title: 'Cámaras para el Jr. Pachacútec',
      description:
        'Tres cámaras hacia la calle en las cuadras 3, 4 y 5. Las verán en vivo solo los vecinos registrados del sector. Sin grabación.',
      organizer: `Junta vecinal de ${sectorName} (demo)`,
      goalCents: 120_000,
      raisedCents: 84_000,
      contributors: 23,
      deadline: now + 9 * DAY,
      expenses: [{ id: 'demo-exp-1', label: 'Cámara 1', amountCents: 38_000, hasReceipt: true }],
      isDemo: true,
    },
    {
      id: demoPetFundId(sectorId),
      sectorId,
      kind: 'animal',
      title: 'Fondo del Negrito',
      description: 'Veterinaria y comida para el perrito comunitario del parque. Es un fondo permanente.',
      organizer: 'Rosa M., vecina (demo)',
      goalCents: null,
      raisedCents: 26_000,
      contributors: 14,
      deadline: null,
      expenses: [{ id: 'demo-exp-2', label: 'Vacuna anual', amountCents: 4_500, hasReceipt: true }],
      isDemo: true,
    },
  ];
}

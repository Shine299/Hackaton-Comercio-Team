/**
 * Números de emergencia CONFIGURABLES por territorio de despliegue.
 * No están verificados por la app: el equipo que despliega debe confirmarlos y actualizar
 * `reviewedAt`. La interfaz siempre muestra el aviso de confirmación.
 */
export type EmergencyNumber = { id: string; label: string; number: string };

export type EmergencyNumbersConfig = {
  territory: string;
  /** Fecha de la última revisión manual (ISO). */
  reviewedAt: string;
  entries: EmergencyNumber[];
};

export const EMERGENCY_NUMBERS: EmergencyNumbersConfig = {
  territory: 'Lima, Perú',
  reviewedAt: '2026-11-07',
  entries: [
    { id: 'police', label: 'Policía', number: '105' },
    { id: 'firefighters', label: 'Bomberos', number: '116' },
    { id: 'ambulance', label: 'Ambulancia (SAMU)', number: '106' },
  ],
};

export function formatReviewDate(iso: string): string {
  const [y, m, d] = iso.split('-');
  return d && m && y ? `${d}/${m}/${y}` : iso;
}

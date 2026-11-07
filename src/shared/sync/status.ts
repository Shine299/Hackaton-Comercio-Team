/**
 * Estados de sincronización (docs: 03_accesibilidad_emergencias §9).
 * Regla de oro: nunca mostrar "recibido" si solo existe en el dispositivo.
 */
export const SYNC_STATUSES = [
  'local', // Guardado en el dispositivo
  'pending', // Pendiente de sincronización
  'sending', // Enviando
  'received', // Recibido por el servidor (NO implica validado)
  'in_review', // En revisión humana
  'validated', // Validado por una persona autorizada
  'resolved', // Resuelto
] as const;

export type SyncStatus = (typeof SYNC_STATUSES)[number];

export const SYNC_STATUS_LABEL: Record<SyncStatus, string> = {
  local: 'Guardado en tu teléfono',
  pending: 'Pendiente de enviar',
  sending: 'Enviando…',
  received: 'Recibido por el servidor',
  in_review: 'En revisión',
  validated: 'Validado',
  resolved: 'Resuelto',
};

/** Estados que confirman que el servidor tiene el dato. */
export function isServerConfirmed(status: SyncStatus): boolean {
  return status === 'received' || status === 'in_review' || status === 'validated' || status === 'resolved';
}

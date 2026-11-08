import type { SyncStatus } from '@/shared/sync/status';

export type OutboxType =
  | 'post.create'
  | 'interaction.request'
  | 'moderation.report'
  | 'emergency.help'
  | 'emergency.incident'
  | 'emergency.vulnerable'
  | 'resource.offer'
  | 'resource.update'
  | 'chat.message'
  | 'chat.block'
  | 'chat.report'
  | 'event.create'
  | 'event.rsvp'
  | 'event.cancel';

export type OutboxPriority = 'emergency' | 'urgent' | 'normal';

/**
 * Fila de `sync_queue`. Cada acción lleva un UUID generado en el cliente (idempotencia),
 * `deviceId`, fecha y estado de sincronización. Sin servidor, el tope honesto es `local`/`pending`.
 */
export type OutboxItem = {
  id: string;
  type: OutboxType;
  payload: Record<string, unknown>;
  createdAt: number;
  deviceId: string;
  syncStatus: SyncStatus;
  priority: OutboxPriority;
  attempts: number;
  lastAttemptAt?: number;
  lastError?: string;
};

/** Orden de salida: emergencia, urgente, normal (menor número sale antes). */
export const PRIORITY_RANK: Record<OutboxPriority, number> = { emergency: 0, urgent: 1, normal: 2 };

export const PRIORITY_LABEL: Record<OutboxPriority, string> = {
  emergency: 'Emergencia',
  urgent: 'Urgente',
  normal: 'Normal',
};

export const OUTBOX_TYPE_LABEL: Record<OutboxType, string> = {
  'post.create': 'Publicación',
  'interaction.request': 'Solicitud de contacto',
  'moderation.report': 'Reporte de publicación',
  'emergency.help': 'Pedido de ayuda',
  'emergency.incident': 'Incidente',
  'emergency.vulnerable': 'Alerta por un vecino',
  'resource.offer': 'Oferta de recurso',
  'resource.update': 'Cambio en una oferta',
  'chat.message': 'Mensaje de chat',
  'chat.block': 'Bloqueo de un vecino',
  'chat.report': 'Reporte de mensaje',
  'event.create': 'Evento nuevo',
  'event.rsvp': 'Asistencia a un evento',
  'event.cancel': 'Cancelación de un evento',
};

/** Estados desde los que todavía hay algo por enviar. */
export const isUnsent = (item: OutboxItem) => item.syncStatus === 'local' || item.syncStatus === 'pending';

/** Persistencia de la cola. Síncrona para que `enqueue` nunca espere ni falle por I/O. */
export interface QueueDb {
  /** `false` si no se pudo abrir SQLite y la cola vive solo en memoria (se pierde al cerrar). */
  readonly persistent: boolean;
  loadAll(): OutboxItem[];
  insert(item: OutboxItem): void;
  update(id: string, patch: Partial<Pick<OutboxItem, 'syncStatus' | 'attempts' | 'lastAttemptAt' | 'lastError'>>): void;
  remove(id: string): void;
  getMeta(key: string): string | null;
  setMeta(key: string, value: string): void;
}

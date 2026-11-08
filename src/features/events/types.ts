import type { SyncStatus } from '@/shared/sync/status';

/** De dónde viene un evento: oficial (`sector_events`, sin registro) o creado por un vecino (con «Voy»). */
export type EventOrigin = 'official' | 'neighbor';

/** Lugar público (se muestra su nombre) o una casa (solo zona aproximada, nunca la dirección). */
export type VenueKind = 'public_place' | 'approx_zone';

/**
 * Evento o aviso del barrio. Sin ubicación exacta: `placeLabel` es un texto de lugar o zona.
 * Nunca trae quién va: solo `goingCount` y si yo voy.
 */
export type SectorEvent = {
  id: string;
  kind: 'event' | 'notice';
  title: string;
  body: string;
  /** Cuándo empieza (ms desde 1970). */
  startsAt: number;
  placeLabel: string;
  /** Quién lo organiza (nombre público o institución). Siempre visible. */
  source: string;
  isDemo: boolean;
  origin: EventOrigin;
  venueKind?: VenueKind;
  /** Cuántos vecinos van, según el servidor. Nunca se suma lo que solo está en el teléfono. */
  goingCount: number;
  iAmGoing: boolean;
  isMine: boolean;
  /** Solo en eventos creados en este teléfono que el servidor aún no confirmó. */
  syncStatus?: SyncStatus;
  /** Mi «Voy» / «Ya no voy» que aún no confirma el servidor. */
  myRsvp?: LocalRsvp;
};

export type LocalRsvp = { going: boolean; syncStatus: SyncStatus };

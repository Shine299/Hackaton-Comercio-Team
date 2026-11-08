/**
 * Estela de audio (SPEC-053). Código puro: convierte el volumen del micrófono (dBFS) en la altura de una barra y guarda
 * las últimas para dibujar una estela que sube desde abajo. Sirve de comprobación visual de que el teléfono SÍ está
 * recibiendo la voz.
 */

/** Por debajo de este nivel (dBFS) se considera silencio. */
export const FLOOR_DB = -60;
/** Por encima de este nivel la barra está al tope. */
export const CEIL_DB = -10;
/** Cuántas barras tiene la estela. */
export const TRAIL_LENGTH = 28;
/** Altura (0–1) a partir de la cual se considera que hay voz. */
const HEARING_UNIT = 0.2;
/** Cuántas de las últimas barras se miran para decir «te oigo». */
const HEARING_WINDOW = 6;

/** dB → 0..1. Sin medición, o un valor que no es número, es 0. */
export function levelToUnit(db: number | null | undefined): number {
  if (typeof db !== 'number' || !Number.isFinite(db)) return 0;
  return Math.min(1, Math.max(0, (db - FLOOR_DB) / (CEIL_DB - FLOOR_DB)));
}

/** Agrega una barra a la derecha y conserva solo las últimas `max`. No modifica el arreglo original. */
export function pushLevel(history: readonly number[], unit: number, max = TRAIL_LENGTH): number[] {
  return [...history, unit].slice(-max);
}

/** ¿Se está recibiendo voz ahora mismo? Mira solo las últimas barras. */
export function isHearing(history: readonly number[]): boolean {
  return history.slice(-HEARING_WINDOW).some((unit) => unit >= HEARING_UNIT);
}

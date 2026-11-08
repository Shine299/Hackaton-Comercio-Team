/**
 * Puerta de audio del Modo guardia (SPEC-052): decide si un clip se sube a transcribir.
 * La voz a texto gratuita tiene cupo, así que el silencio y el ruido bajo NUNCA se suben, y cada sesión tiene un tope.
 */

/** Nivel mínimo (dBFS) para considerar que hubo voz. Valor inicial: se afina probando en un celular real. */
export const SPEECH_DB = -42;
/** Un clip más corto que esto no alcanza a decir la frase. */
export const MIN_CLIP_MS = 700;
/** Tope de clips subidos por sesión de guardia, para no agotar el cupo gratuito compartido. */
export const MAX_UPLOADS_PER_SESSION = 60;

/** Nivel más alto de un clip. Sin mediciones válidas es silencio (`-Infinity`). */
export function peakLevel(levels: readonly number[]): number {
  let peak = Number.NEGATIVE_INFINITY;
  for (const level of levels) {
    if (Number.isFinite(level) && level > peak) peak = level;
  }
  return peak;
}

export type ClipDecision = { upload: true } | { upload: false; reason: 'quiet' | 'short' | 'cap' };

export function shouldUploadClip({
  peakDb,
  durationMs,
  uploadsThisSession,
  hasMetering = true,
}: {
  peakDb: number;
  durationMs: number;
  uploadsThisSession: number;
  /** Si el teléfono no entrega medición de volumen no se puede juzgar el «silencio»: se deja pasar. */
  hasMetering?: boolean;
}): ClipDecision {
  if (uploadsThisSession >= MAX_UPLOADS_PER_SESSION) return { upload: false, reason: 'cap' };
  if (durationMs < MIN_CLIP_MS) return { upload: false, reason: 'short' };
  if (hasMetering && !(peakDb >= SPEECH_DB)) return { upload: false, reason: 'quiet' };
  return { upload: true };
}

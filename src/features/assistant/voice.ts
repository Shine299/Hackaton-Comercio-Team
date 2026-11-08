/** Voz al asistente (SPEC-050). Lógica pura: validar la grabación y preparar el texto transcrito. */

export const MIN_RECORDING_MS = 700;
export const MAX_RECORDING_MS = 30_000;
const MAX_TRANSCRIPT = 500;

export type RecordingCheck = { ok: true } | { ok: false; error: string };

export function checkRecording(durationMs: number): RecordingCheck {
  if (durationMs < MIN_RECORDING_MS) return { ok: false, error: 'Fue muy corto. Toca 🎤 y habla un poco más.' };
  return { ok: true };
}

/** Texto listo para editar en la caja. `null` si no se entendió nada. */
export function cleanTranscript(raw: string): string | null {
  const text = raw.replace(/\s+/g, ' ').trim();
  if (!/[\p{L}\p{N}]/u.test(text)) return null;
  return text.slice(0, MAX_TRANSCRIPT);
}

/** Formatos que acepta Whisper. `null` = no se envía (por ejemplo `.3gp`). */
const MIME_BY_EXT: Record<string, string> = {
  m4a: 'audio/mp4',
  mp4: 'audio/mp4',
  mp3: 'audio/mpeg',
  wav: 'audio/wav',
  webm: 'audio/webm',
  ogg: 'audio/ogg',
  flac: 'audio/flac',
};

export function audioMimeFromUri(uri: string): { type: string; name: string } | null {
  const ext = /\.([a-z0-9]+)(?:\?|$)/i.exec(uri)?.[1]?.toLowerCase();
  const type = ext ? MIME_BY_EXT[ext] : undefined;
  return ext && type ? { type, name: `voz.${ext}` } : null;
}

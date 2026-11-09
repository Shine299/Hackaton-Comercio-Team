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

export type ClipOutcome = 'ok' | 'empty' | 'limit' | 'unavailable' | 'format' | 'offline';

const OUTCOME_TEXT: Record<ClipOutcome, string> = {
  ok: 'se entendió',
  empty: 'el servidor no oyó voz',
  limit: 'se acabó el cupo de hoy',
  unavailable: 'el servidor no está disponible',
  format: 'formato de audio no válido',
  offline: 'sin conexión',
};

/** Debajo de este nivel (dBFS) el micrófono casi no está captando nada. */
const VERY_QUIET_DB = -50;

/** Una línea para ver qué pasó con el último audio: cuánto duró, qué tan fuerte se oyó y qué dijo el servidor (diagnóstico). */
export function clipSummary({ seconds, peakDb, outcome }: { seconds: number; peakDb: number | null; outcome: ClipOutcome }): string {
  const volume =
    peakDb === null
      ? 'sin medición de volumen'
      : `volumen máximo ${Math.round(peakDb)} dB${peakDb < VERY_QUIET_DB ? ' (muy bajo: el micrófono casi no capta nada)' : ''}`;
  return `Último audio: ${seconds} s · ${volume} · ${OUTCOME_TEXT[outcome]}.`;
}

/** Un archivo de menos de esto (KB) casi no tiene audio: el teléfono no está grabando. */
const EMPTY_FILE_KB = 4;

/** Qué hacer según el resultado de la prueba de micrófono (de lo más básico a lo más fino). */
export function micTestAdvice({ peakDb, kb, outcome }: { peakDb: number | null; kb: number; outcome: ClipOutcome }): string {
  if (kb < EMPTY_FILE_KB) return 'El archivo salió casi vacío: el teléfono no está grabando. Revisa el permiso de micrófono de Expo Go y que no haya otra app usándolo.';
  if (outcome === 'limit') return 'Se acabó el cupo de voz de hoy: el micrófono puede estar bien, pero el servidor ya no transcribe.';
  if (outcome === 'unavailable') return 'El servidor de voz no está disponible ahora. Inténtalo en un rato.';
  if (outcome === 'offline') return 'Sin conexión: no se pudo enviar el audio. Revisa tu internet.';
  if (outcome === 'format') return 'El teléfono grabó en un formato de audio no válido para el servidor.';
  if (outcome === 'ok') return 'Todo bien: el teléfono te oye y el servidor te entiende.';
  if (peakDb === null) return 'Este teléfono no entrega medición de volumen. Escucha la grabación para comprobar si se oye tu voz.';
  if (peakDb < VERY_QUIET_DB) {
    return 'El micrófono casi no capta nada. Revisa el permiso de micrófono de Expo Go, que no esté tapado ni silenciado, y habla más cerca.';
  }
  return 'El volumen es bueno, pero el servidor no oyó voz. Escucha la grabación: ¿se oye tu voz o solo ruido?';
}

const FILE_BY_MIME: Record<string, string> = {
  'audio/webm': 'webm',
  'audio/ogg': 'ogg',
  'audio/mp4': 'm4a',
  'audio/mpeg': 'mp3',
  'audio/wav': 'wav',
  'audio/x-wav': 'wav',
  'audio/flac': 'flac',
};

/**
 * Nombre y tipo para subir un audio cuando solo se conoce su tipo MIME (en el navegador la grabación es una dirección
 * `blob:` sin extensión). `null` = formato que Whisper no acepta.
 */
export function fileFromMime(mime: string): { type: string; name: string } | null {
  const type = mime.split(';')[0].trim().toLowerCase();
  const ext = FILE_BY_MIME[type];
  return ext ? { type, name: `voz.${ext}` } : null;
}

/**
 * Cuerpo `multipart/form-data` armado a mano con el audio en bytes. En el APK, el `FormData` de React Native con
 * `{ uri, name, type }` puede fallar antes de salir del teléfono («Failed to send a request»); mandar los bytes
 * directamente evita esa vía. El servidor lo lee igual (`req.formData()`).
 */
export function buildAudioMultipart(
  audio: ArrayBuffer,
  file: { name: string; type: string },
  boundary = `----yunta${Date.now().toString(16)}`,
): { body: ArrayBuffer; contentType: string } {
  const enc = new TextEncoder();
  const head = enc.encode(
    `--${boundary}\r\nContent-Disposition: form-data; name="audio"; filename="${file.name}"\r\nContent-Type: ${file.type}\r\n\r\n`,
  );
  const tail = enc.encode(`\r\n--${boundary}--\r\n`);
  const out = new Uint8Array(head.length + audio.byteLength + tail.length);
  out.set(head, 0);
  out.set(new Uint8Array(audio), head.length);
  out.set(tail, head.length + audio.byteLength);
  return { body: out.buffer, contentType: `multipart/form-data; boundary=${boundary}` };
}

const DEFAULT_PORT = 8080;

function isPrivateIPv4(parts: number[]): boolean {
  const [a, b] = parts;
  return a === 10 || (a === 192 && b === 168) || (a === 172 && b >= 16 && b <= 31);
}

/**
 * Normaliza la dirección que muestra la app IP Webcam («http://192.168.1.20:8080») a `host:puerto`.
 * Solo acepta IPs de red local (Wi-Fi de casa o hotspot): la cámara nunca se expone a internet.
 * Devuelve `null` si no es válida.
 */
export function parseCameraAddress(text: string): string | null {
  const cleaned = text.trim().replace(/^https?:\/\//i, '').replace(/\/.*$/, '');
  const match = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})(?::(\d{1,5}))?$/.exec(cleaned);
  if (!match) return null;
  const parts = match.slice(1, 5).map(Number);
  if (parts.some((n) => n > 255)) return null;
  if (!isPrivateIPv4(parts)) return null;
  const port = match[5] ? Number(match[5]) : DEFAULT_PORT;
  if (port < 1 || port > 65535) return null;
  return `${parts.join('.')}:${port}`;
}

/** Foto fija actual de la cámara. `t` evita que se muestre una foto vieja guardada en caché. */
export function snapshotUrl(host: string, t: number): string {
  return `http://${host}/shot.jpg?t=${t}`;
}

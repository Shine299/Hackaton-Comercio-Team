import * as Location from 'expo-location';

import type { Coords } from './dispatch';

/**
 * Ubicación EXACTA de una sola vez (SPEC-052 / ADR 0008). Excepción acotada a «ubicación siempre aproximada»:
 * solo se usa en una emergencia confirmada, va al marcador y al contacto de confianza, y NO se guarda ni se publica.
 * Nunca lanza: sin permiso, sin señal o sin tiempo devuelve `null` y el despacho sigue con «solo el sector».
 */

const withTimeout = <T>(promise: Promise<T>, ms: number): Promise<T> =>
  Promise.race([promise, new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), ms))]);

/** Se pide al activar la guardia (no en plena emergencia). Si la niegan, la guardia funciona igual con solo el sector. */
export async function ensureLocationPermission(): Promise<boolean> {
  try {
    const permission = await Location.requestForegroundPermissionsAsync();
    return permission.status === Location.PermissionStatus.GRANTED;
  } catch {
    return false;
  }
}

export async function getExactLocationOnce(timeoutMs = 8000): Promise<Coords | null> {
  try {
    const permission = await Location.getForegroundPermissionsAsync();
    if (permission.status !== Location.PermissionStatus.GRANTED) return null;
    try {
      const position = await withTimeout(Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High }), timeoutMs);
      return { latitude: position.coords.latitude, longitude: position.coords.longitude };
    } catch {
      // Sin fijación a tiempo: la última posición conocida es mejor que nada.
      const last = await Location.getLastKnownPositionAsync();
      return last ? { latitude: last.coords.latitude, longitude: last.coords.longitude } : null;
    }
  } catch {
    return null;
  }
}

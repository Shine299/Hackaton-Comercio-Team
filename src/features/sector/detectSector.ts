import * as Location from 'expo-location';

import type { Sector } from './types';
import { findNearestSector, MAX_SECTOR_MATCH_KM } from './nearestSector';

export type DetectResult =
  | { status: 'ok'; sector: Sector; distanceKm: number }
  /** Permiso denegado. `canAskAgain=false` => solo desde Ajustes del teléfono. */
  | { status: 'denied'; canAskAgain: boolean }
  /** La persona está lejos de todos los sectores disponibles. */
  | { status: 'outside'; nearest: Sector; distanceKm: number }
  /** GPS apagado, sin señal o tiempo agotado. */
  | { status: 'unavailable' };

/** Tiempo máximo para obtener una posición una vez concedido el permiso. */
const POSITION_TIMEOUT_MS = 10_000;
/** Tope de toda la detección (incluye el diálogo de permiso) para no dejar la UI cargando. */
const DETECTION_TIMEOUT_MS = 25_000;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('timeout')), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

/**
 * Sugiere el sector a partir del GPS. Privacidad: pide precisión baja (basta con barrio),
 * usa las coordenadas solo en memoria para elegir un sector y no las guarda.
 * Nunca lanza: todo fallo se traduce a un estado que la UI resuelve con selección manual.
 */
export async function detectSector(): Promise<DetectResult> {
  try {
    return await withTimeout(runDetection(), DETECTION_TIMEOUT_MS);
  } catch {
    return { status: 'unavailable' };
  }
}

async function runDetection(): Promise<DetectResult> {
  try {
    const permission = await Location.requestForegroundPermissionsAsync();
    if (permission.status !== Location.PermissionStatus.GRANTED) {
      return { status: 'denied', canAskAgain: permission.canAskAgain };
    }

    if (!(await Location.hasServicesEnabledAsync())) {
      return { status: 'unavailable' };
    }

    const position = await withTimeout(
      Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Low }),
      POSITION_TIMEOUT_MS,
    );

    const nearest = findNearestSector(position.coords);
    if (nearest.distanceKm <= MAX_SECTOR_MATCH_KM) {
      return { status: 'ok', sector: nearest.sector, distanceKm: nearest.distanceKm };
    }
    return { status: 'outside', nearest: nearest.sector, distanceKm: nearest.distanceKm };
  } catch {
    return { status: 'unavailable' };
  }
}

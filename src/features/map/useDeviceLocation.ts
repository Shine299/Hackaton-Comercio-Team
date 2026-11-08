import * as Location from 'expo-location';
import { useEffect, useState } from 'react';

import type { LatLng } from './types';

export type DeviceLocationStatus = 'loading' | 'granted' | 'denied' | 'unavailable';

/**
 * Dónde está la persona, para dibujarla en el mapa (siempre visible, solo para ella). La posición vive solo en
 * memoria de este teléfono: no se guarda, no se publica y no se manda a ningún servidor. Nunca lanza: sin permiso o
 * sin señal el mapa funciona igual, con un aviso.
 */
export function useDeviceLocation(): {
  coord: LatLng | null;
  status: DeviceLocationStatus;
} {
  const [coord, setCoord] = useState<LatLng | null>(null);
  const [status, setStatus] = useState<DeviceLocationStatus>('loading');

  useEffect(() => {
    let cancelled = false;
    let subscription: Location.LocationSubscription | undefined;

    (async () => {
      try {
        const permission = await Location.requestForegroundPermissionsAsync();
        if (cancelled) return;
        if (permission.status !== Location.PermissionStatus.GRANTED) {
          setStatus('denied');
          return;
        }
        setStatus('granted');
        // Una posición rápida para que el punto aparezca ya; luego se actualiza al moverse.
        const last = await Location.getLastKnownPositionAsync().catch(() => null);
        if (cancelled) return;
        if (last)
          setCoord({
            latitude: last.coords.latitude,
            longitude: last.coords.longitude,
          });
        subscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Balanced,
            distanceInterval: 15,
            timeInterval: 5000,
          },
          (position) => {
            if (!cancelled)
              setCoord({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
              });
          },
        );
        if (cancelled) subscription.remove();
      } catch {
        if (!cancelled) setStatus('unavailable');
      }
    })();

    return () => {
      cancelled = true;
      subscription?.remove();
    };
  }, []);

  return { coord, status };
}

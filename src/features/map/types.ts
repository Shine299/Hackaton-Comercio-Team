import type { IconName } from '@/shared/ui';

export type MapLayerId =
  | 'incidents'
  | 'needs'
  | 'resources'
  | 'volunteers'
  | 'zones'
  | 'business'
  | 'posts'
  | 'places'
  | 'shops'
  | 'cameras';

export type MapLayerMeta = {
  id: MapLayerId;
  label: string;
  icon: IconName;
  /** Color literal del marcador (los mapas necesitan hex, no clases). */
  color: string;
  defaultOn: boolean;
};

export type MapTarget =
  | { kind: 'post'; id: string }
  | { kind: 'report'; id: string }
  | { kind: 'board' }
  /** Aviso real de un vecino del sector (tablero compartido): se abre en el tablero para «Voy a ayudar». */
  | { kind: 'shared'; id: string }
  /** Cámara vecinal: se abre su visor. */
  | { kind: 'camera'; id: string }
  | { kind: 'none' };

export type LatLng = { latitude: number; longitude: number };

/** Punto en el mapa. Siempre en zona aproximada: nunca la coordenada del dispositivo. */
export type MapPoint = {
  id: string;
  layer: MapLayerId;
  title: string;
  detail?: string;
  coord: LatLng;
  /** Solo para zonas afectadas. */
  radiusM?: number;
  isDemo: boolean;
  source: string;
  target: MapTarget;
};

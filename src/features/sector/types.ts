export type Sector = {
  id: string;
  name: string;
  city: string;
  /** Centro aproximado del sector (no es una dirección exacta de nadie). */
  center: { latitude: number; longitude: number };
  /** Radio inicial de cobertura en km (decisión de producto: 2 km). */
  radiusKm: number;
};

export const DEFAULT_RADIUS_KM = 2;

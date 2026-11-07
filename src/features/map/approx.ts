import type { LatLng } from './types';

/** Hash FNV-1a: estable para que un mismo id caiga siempre en el mismo sitio. */
function hash(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

const round3 = (n: number) => Math.round(n * 1000) / 1000; // ≈ 110 m

/**
 * Zona aproximada de un punto: el centro del SECTOR desplazado de forma determinista dentro de un
 * anillo y redondeado (~110 m). No se lee ni usa jamás la ubicación del dispositivo.
 */
export function approxPoint(center: LatLng, seed: string, minKm = 0.15, maxKm = 0.9): LatLng {
  const angle = ((hash(seed) % 3600) / 3600) * 2 * Math.PI;
  const frac = (hash(`${seed}#r`) % 1000) / 1000;
  const r = minKm + frac * (maxKm - minKm);
  const dLat = (r * Math.cos(angle)) / 111;
  const dLng = (r * Math.sin(angle)) / (111 * Math.cos((center.latitude * Math.PI) / 180));
  return { latitude: round3(center.latitude + dLat), longitude: round3(center.longitude + dLng) };
}

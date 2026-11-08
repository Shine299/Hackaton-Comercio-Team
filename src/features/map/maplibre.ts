import type { LatLng } from './types';

/**
 * Estilo de mapa con teselas públicas de OpenStreetMap: gratis y sin clave.
 * Uso moderado (demo); para producción, un proveedor de teselas propio. La atribución es obligatoria.
 */
export const OSM_STYLE = {
  version: 8 as const,
  sources: {
    osm: {
      type: 'raster' as const,
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      maxzoom: 19,
      attribution: '© OpenStreetMap contributors',
    },
  },
  layers: [{ id: 'osm', type: 'raster' as const, source: 'osm' }],
};

const METERS_PER_DEGREE = 111_320;

/** Círculo geográfico (radio en metros) como polígono GeoJSON, con coordenadas [lng, lat]. */
export function circlePolygon(center: LatLng, radiusM: number, steps = 48) {
  const dLat = radiusM / METERS_PER_DEGREE;
  const dLng = dLat / Math.cos((center.latitude * Math.PI) / 180);
  const ring: [number, number][] = [];
  for (let i = 0; i < steps; i++) {
    const a = (i / steps) * 2 * Math.PI;
    ring.push([center.longitude + dLng * Math.sin(a), center.latitude + dLat * Math.cos(a)]);
  }
  ring.push(ring[0]);
  return {
    type: 'Feature' as const,
    properties: {},
    geometry: { type: 'Polygon' as const, coordinates: [ring] },
  };
}

/** Zoom de MapLibre (teselas de 512 px) para que el sector (radio × 2.4) quepa en ~360 dp de ancho. */
export function zoomForRadiusKm(radiusKm: number, latitude: number, widthDp = 360): number {
  const metersAcross = radiusKm * 1000 * 2.4;
  const metersPerPixel = metersAcross / widthDp;
  return Math.log2((78_271.517 * Math.cos((latitude * Math.PI) / 180)) / metersPerPixel);
}

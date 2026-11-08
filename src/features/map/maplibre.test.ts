import { circlePolygon, OSM_STYLE, zoomForRadiusKm } from './maplibre';

const CENTER = { latitude: -12.0464, longitude: -77.0428 };

describe('circlePolygon', () => {
  it('cierra el anillo y usa [lng, lat]', () => {
    const f = circlePolygon(CENTER, 500, 32);
    const ring = f.geometry.coordinates[0];
    expect(ring).toHaveLength(33);
    expect(ring[0]).toEqual(ring[32]);
    // Primer punto: al norte del centro (misma longitud, mayor latitud).
    expect(ring[0][0]).toBeCloseTo(CENTER.longitude, 6);
    expect(ring[0][1]).toBeGreaterThan(CENTER.latitude);
  });

  it('el radio en metros es el pedido (≈ 111 320 m por grado de latitud)', () => {
    const f = circlePolygon(CENTER, 1000, 32);
    const north = f.geometry.coordinates[0][0][1];
    const metros = (north - CENTER.latitude) * 111_320;
    expect(metros).toBeGreaterThan(990);
    expect(metros).toBeLessThan(1010);
  });
});

describe('zoomForRadiusKm', () => {
  it('un radio mayor da menos zoom', () => {
    expect(zoomForRadiusKm(2, CENTER.latitude)).toBeLessThan(zoomForRadiusKm(0.5, CENTER.latitude));
  });
  it('queda en un rango razonable de calle a ciudad', () => {
    const z = zoomForRadiusKm(1, CENTER.latitude);
    expect(z).toBeGreaterThan(11);
    expect(z).toBeLessThan(17);
  });
});

describe('OSM_STYLE', () => {
  it('declara la atribución de OpenStreetMap', () => {
    const src = OSM_STYLE.sources.osm;
    expect(src.attribution).toContain('OpenStreetMap');
    expect(src.tiles[0]).toContain('tile.openstreetmap.org');
  });
});

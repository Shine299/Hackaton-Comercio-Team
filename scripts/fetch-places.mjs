// Descarga lugares de referencia de OpenStreetMap (Overpass API) para todos los sectores y los guarda
// versionados en el repo. NO se ejecuta en la app ni en cada render: solo a mano.
//
//   node scripts/fetch-places.mjs
//
// Datos © colaboradores de OpenStreetMap, licencia ODbL (https://www.openstreetmap.org/copyright).
// Solo se guardan lugares públicos (salud, seguridad, refugio posible). Nunca personas.
// No se scrapea Google Maps (sus términos lo prohíben): la fuente es OSM.
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// Mantener alineado con src/features/sector/data.ts
const SECTORS = [
  { id: 'lince', latitude: -12.0847, longitude: -77.0343 },
  { id: 'jesus-maria', latitude: -12.0701, longitude: -77.0509 },
  { id: 'san-isidro', latitude: -12.1005, longitude: -77.0364 },
  { id: 'la-victoria', latitude: -12.0654, longitude: -77.0156 },
];
const RADIUS_M = 2500; // un poco más que el radio de cobertura (2 km) para cubrir el borde
const ENDPOINT = 'https://overpass-api.de/api/interpreter';

// amenity → categoría de la app
const CATEGORY_BY_AMENITY = {
  hospital: 'health',
  clinic: 'health',
  pharmacy: 'pharmacy',
  police: 'safety',
  fire_station: 'safety',
  school: 'shelter',
  community_centre: 'shelter',
  townhall: 'shelter',
};

const amenities = Object.keys(CATEGORY_BY_AMENITY).join('|');
const parts = SECTORS.flatMap((s) => {
  const around = `around:${RADIUS_M},${s.latitude},${s.longitude}`;
  return [`node["amenity"~"^(${amenities})$"](${around});`, `way["amenity"~"^(${amenities})$"](${around});`];
});
const query = `[out:json][timeout:90];(${parts.join('')});out center tags;`;

const response = await fetch(ENDPOINT, {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': 'red-vecinal-solidaria-hackathon/0.1' },
  body: new URLSearchParams({ data: query }),
});
if (!response.ok) throw new Error(`Overpass respondió ${response.status}`);
const json = await response.json();

const round = (n) => Math.round(n * 1e5) / 1e5;
const seen = new Set();
const places = [];
for (const el of json.elements ?? []) {
  const tags = el.tags ?? {};
  const name = (tags.name ?? '').trim();
  const lat = el.lat ?? el.center?.lat;
  const lon = el.lon ?? el.center?.lon;
  if (!name || lat == null || lon == null) continue; // sin nombre no sirve como referencia
  const key = `${tags.amenity}|${name.toLowerCase()}`;
  if (seen.has(key)) continue;
  seen.add(key);
  places.push({
    id: `osm-${el.type}-${el.id}`,
    name,
    amenity: tags.amenity,
    category: CATEGORY_BY_AMENITY[tags.amenity],
    latitude: round(lat),
    longitude: round(lon),
  });
}
places.sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name, 'es'));

const out = {
  sectors: SECTORS.map((s) => s.id),
  source: 'OpenStreetMap (Overpass API)',
  license: 'ODbL — © colaboradores de OpenStreetMap',
  fetchedAt: new Date().toISOString().slice(0, 10),
  radiusM: RADIUS_M,
  places,
};

const file = resolve(dirname(fileURLToPath(import.meta.url)), '../src/features/map/data/places.json');
mkdirSync(dirname(file), { recursive: true });
writeFileSync(file, `${JSON.stringify(out, null, 2)}\n`);
console.log(`${places.length} lugares guardados en ${file}`);

// Descarga lugares de referencia de OpenStreetMap (Overpass API) para todos los sectores y los guarda
// versionados en el repo. NO se ejecuta en la app ni en cada render: solo a mano.
//
//   node scripts/fetch-places.mjs
//
// Datos © colaboradores de OpenStreetMap, licencia ODbL (https://www.openstreetmap.org/copyright).
// Solo se guardan lugares públicos (salud, seguridad, refugio posible y comercios con nombre). Nunca personas.
// SPEC-047: los comercios llevan categoría `commerce` (el mapa de Emergencia no los muestra como referencia) y su
// `opening_hours` tal cual, para mostrar «Abierto ahora» solo cuando el horario se entiende.
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

// Comercios del barrio para Explorar (SPEC-047). Radio de cobertura del sector (2 km) para no inflar el JSON.
const COMMERCE_RADIUS_M = 2000;
const COMMERCE_AMENITIES = ['restaurant', 'cafe', 'fast_food', 'marketplace', 'bank'];
const COMMERCE_SHOPS = [
  'supermarket',
  'convenience',
  'bakery',
  'hardware',
  'greengrocer',
  'butcher',
  'hairdresser',
  'laundry',
  'mall',
  'optician',
  'stationery',
  'pet',
];

const amenities = Object.keys(CATEGORY_BY_AMENITY).join('|');
const parts = SECTORS.flatMap((s) => {
  const around = `around:${RADIUS_M},${s.latitude},${s.longitude}`;
  const near = `around:${COMMERCE_RADIUS_M},${s.latitude},${s.longitude}`;
  return [
    `node["amenity"~"^(${amenities})$"](${around});`,
    `way["amenity"~"^(${amenities})$"](${around});`,
    `nwr["amenity"~"^(${COMMERCE_AMENITIES.join('|')})$"]["name"](${near});`,
    `nwr["shop"~"^(${COMMERCE_SHOPS.join('|')})$"]["name"](${near});`,
  ];
});
const query = `[out:json][timeout:180];(${parts.join('')});out center tags;`;

const response = await fetch(ENDPOINT, {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': 'yunta-hackathon/0.1' },
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
  // Tipo: el amenity de referencia (misma categoría de siempre) o el del comercio.
  const reference = CATEGORY_BY_AMENITY[tags.amenity];
  const kind = reference ? tags.amenity : COMMERCE_SHOPS.includes(tags.shop) ? tags.shop : tags.amenity;
  if (!reference && !COMMERCE_AMENITIES.includes(kind) && !COMMERCE_SHOPS.includes(kind)) continue;
  const key = `${kind}|${name.toLowerCase()}`;
  if (seen.has(key)) continue;
  seen.add(key);
  const place = {
    id: `osm-${el.type}-${el.id}`,
    name,
    amenity: kind,
    category: reference ?? 'commerce',
    latitude: round(lat),
    longitude: round(lon),
  };
  const hours = (tags.opening_hours ?? '').trim();
  if (hours) place.openingHours = hours;
  places.push(place);
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
// Una línea por lugar: el archivo pesa menos y el diff se lee.
const { places: list, ...meta } = out;
const head = JSON.stringify(meta, null, 2).replace(/\n}$/, ',\n  "places": [\n');
writeFileSync(file, `${head}${list.map((p) => `    ${JSON.stringify(p)}`).join(',\n')}\n  ]\n}\n`);
console.log(`${places.length} lugares guardados en ${file}`);

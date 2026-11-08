# SPEC-047 — Explorar: lugares del barrio con horario honesto

- **Estado:** implementada (8 nov 2026); `npm run check` en verde. **Falta** verificar en Expo Go (criterios 4, 7 y 8).
  Datos: 2424 lugares (975 de referencia sin cambios + 1449 comercios); 210 con horario, 202 entendidos por el lector (los 8 restantes, «Horario no confirmado»)
- **Dueño / revisor:** … / …
- **Sprint:** Etapa 13 — historia S13-5 (13e). Plan: `docs/04_tecnico/plan_etapa13_comunidad_primero.md` §4
- **Decisión:** D3 — «Abierto ahora» **solo** si el lugar trae `opening_hours` de OSM y se puede interpretar.

## Qué y por qué
Audio 3 del feedback: «Explorar… para ver las tiendas, los restaurantes, qué está abierto, qué está cerrado». Hoy la
pestaña Explorar muestra solo los emprendimientos de vecinos. Ahora suma un **directorio de lugares** (OpenStreetMap)
con su estado de apertura, **sin inventar nunca un horario**.

## Datos (`scripts/fetch-places.mjs` → `src/features/map/data/places.json`)
- Se mantienen los lugares de referencia de Emergencia (salud, farmacia, seguridad, refugio) **con la misma categoría**:
  la capa «Lugares de referencia» del mapa de Emergencia no cambia.
- Se agregan comercios con nombre (radio 2 km): `amenity` = restaurant, cafe, fast_food, marketplace, bank y `shop` =
  supermarket, convenience, bakery, hardware, greengrocer, butcher, hairdresser, laundry, mall, optician, stationery,
  pet. Categoría de mapa `commerce` y su tipo en `kind`.
- Se guarda `opening_hours` **tal cual** (solo si existe). Una línea por lugar en el JSON para que el diff sea legible.

## Horario (`explore/openingHours.ts`, función pura)
- `openStateAt(spec, date)` → `'open' | 'closed' | 'unknown'`.
- Entiende: `24/7`; `off`; reglas separadas por `;`; días `Mo`–`Su` sueltos, en lista (`Sa,Su`) o rango (`Mo-Fr`,
  `Fr-Sa`, `Sa-Mo` que da la vuelta); varios tramos (`12:30-16:00,19:00-23:00`, con o sin espacio); `Mo off`;
  horas sin días (todos los días); `24:00`; tramos que pasan la medianoche (`18:00-02:00`).
- Una regla posterior **reemplaza** a las anteriores para los días que menciona (como en OSM).
- Cualquier otra cosa (feriados `PH`, meses, semanas, `sunrise`, `+`, comentarios…) → `'unknown'`. **Nunca** se
  adivina.
- `todayHoursLabel(spec, date)` → texto «Hoy 8:00–22:00» / «Hoy cerrado» o `undefined` si no se entiende.

## Pantalla (`explore/PlacesScreen.tsx`, ruta `/explorar`)
- Selector arriba: **«Lugares»** | **«Emprendimientos»** (este último = el directorio de negocios vecinos de siempre,
  ahora como componente `BusinessDirectory`).
- Lugares: búsqueda, chips **Comida · Tiendas · Salud · Servicios**, chip **«Abierto ahora»**, Lista / Mapa.
- Cada lugar: nombre, tipo, distancia aproximada al centro del sector y estado: **«Abierto ahora»** (ícono reloj +
  texto), **«Cerrado ahora»**, o **«Horario no confirmado»**; si se entiende, el horario de hoy.
- Lista paginada de 30 en 30 («Ver más»). Atribución OSM visible al pie y en el mapa.
- Mapa: capa nueva **«Comercios»** (`shops`) — apagada por defecto en los mapas de Emergencia/Comunidad.

## Criterios de aceptación
1. **Dado** un lugar sin `opening_hours`, **entonces** dice «Horario no confirmado» y **nunca** «Abierto».
2. **Dado** «Mo-Fr 08:00-17:30; Sa 09:00-13:00», **entonces** está abierto un martes 10:00, cerrado un sábado
   14:00 y cerrado un domingo.
3. **Dado** un horario que no se entiende (p. ej. con `PH`), **entonces** es «Horario no confirmado».
4. **Dado** el chip «Abierto ahora», **entonces** solo quedan lugares con horario entendido y abiertos; los demás no se
   cuentan como abiertos.
5. **Dado** Emprendimientos, **entonces** el estado sigue siendo «Disponible ahora» (lo declara el negocio) y la
   estadística dice «disponibles ahora», no «abiertos ahora».
6. **Dado** el mapa de Emergencia, **entonces** la capa «Lugares de referencia» sigue mostrando solo salud, farmacia,
   seguridad y refugio.
7. **Dado** sin internet, **entonces** la lista funciona igual (datos versionados en el repo).
8. **Dado** letra al máximo y TalkBack, **entonces** cada lugar se lee completo (nombre, tipo, distancia, estado).

## Pruebas
- **Automáticas (primero):** `explore/openingHours.test.ts` (formatos reales del JSON), `explore/places.test.ts`
  (agrupación por tipo, filtro «Abierto ahora», orden por distancia), `map/places.test.ts` (la capa de referencia no
  incluye comercios).
- **Manuales:** Expo Go, criterios 4, 7 y 8.

## Privacidad
Solo lugares públicos de OSM (nunca personas). Distancia al **centro del sector**, nunca al GPS del teléfono.

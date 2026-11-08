# SPEC-057 — Mapa nativo sin clave (MapLibre + OpenStreetMap)

- **Estado:** borrador
- **Dueño / revisor:** Carlos / (otra persona del equipo)
- **Sprint:** entrega final

## Qué y por qué
En Android, `react-native-maps` usa Google Maps y exige una clave (con tarjeta en Google Cloud). Sin ella el mapa
sale en blanco. Cambiamos el mapa nativo a MapLibre con teselas de OpenStreetMap: gratis y sin clave.

## Criterios de aceptación
1. **Dado** un APK sin clave de Google **cuando** abro el mapa **entonces** veo calles de OpenStreetMap, el círculo del sector y los puntos.
2. **Dado** el mapa **cuando** toco un marcador **entonces** se selecciona ese punto y la cámara se acerca a él.
3. **Dado** un punto seleccionado **cuando** toco el fondo del mapa **entonces** se deselecciona.
4. **Dado** el mapa **cuando** lo miro **entonces** muestra la atribución «© OpenStreetMap contributors».
5. **Dado** una zona con radio **cuando** se dibuja **entonces** es un círculo geográfico del radio en metros (no de píxeles).
6. **Dado** el mapa **cuando** se muestra **entonces** nunca se pide ni se dibuja la ubicación del dispositivo.

## Alcance
- **Toca:** `src/features/map/NativeLayerMap.tsx`, `src/features/map/maplibre.ts` (+ prueba), `app.json` (plugin), dependencia `@maplibre/maplibre-react-native`.
- **No debe cambiar:** `CommunityMap.tsx`, `NativeLayerMap.web.tsx` (vista previa con Leaflet), capas, datos y tipos.
- **Reglas de arquitectura:** import solo por `index.ts`, sin ciclos.

## Pruebas
- Automáticas: `maplibre.test.ts` (polígono de círculo, zoom por radio, estilo OSM con atribución).
- Manuales: APK en el celular (**no corre en Expo Go**: módulo nativo), con y sin señal.

## Notas de accesibilidad y privacidad
- Se mantienen `accessibilityLabel` del mapa y la lista equivalente debajo.
- Las teselas se piden a `tile.openstreetmap.org`: ese servidor ve la IP y la zona vista (no la posición exacta). Solo para demo y uso moderado; para producción, un proveedor con plan propio.

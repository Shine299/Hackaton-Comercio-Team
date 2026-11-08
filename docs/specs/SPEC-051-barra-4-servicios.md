# SPEC-051 — Barra de 5 pestañas + burbuja del asistente

- **Estado:** implementada en la rama `shay-4-espacios` (8 nov 2026); pruebas, compilador y lint en verde. **Falta** verificar en Expo Go.
- **Sprint:** Etapa 13 (ajuste de navegación). **Reemplaza** la barra de SPEC-043 (Inicio · Eventos · Explorar · Marketplace · Chat).
- **Decisión:** ADR 0007. (El nombre del archivo es histórico: nació como «barra de 4 servicios».)

## Qué y por qué
La barra muestra cinco pestañas claras: Inicio, Comunidad, Negocios, Ayuda y **Chat** (la conversación entre vecinos).
Emergencia se abre con el SOS de la cabecera. La **burbuja flotante es el asistente virtual de Yunta** (con su mascota), no el
chat. Solo cambia la navegación y el nombre «Marketplace», que vuelve a ser «Ayuda»: el contenido de las pantallas no se toca.

## Barra y rutas

| Pestaña | Ruta raíz |
|---|---|
| Inicio | `/` (**sin barra**: ahí van 4 botones grandes; la pestaña sirve para volver desde las demás) |
| Comunidad | `/eventos` |
| Negocios | `/explorar` |
| Ayuda (antes «Marketplace») | `/ayuda`: pedir y ofrecer ayuda entre vecinos |
| Chat | `/mensajes`: tus conversaciones con vecinos, con el número de **sin leer** en la pestaña |

- **Emergencia no es pestaña.** Se abre con el SOS rojo de la cabecera (`/emergencias`). En `/emergencias` y sus pantallas hermanas
  (tablero, recursos, mis reportes, guardia) la barra se ve **sin pestaña resaltada**, para que siempre haya salida.
- **Burbuja del asistente:** abajo a la derecha, lleva la mascota y abre la conversación por voz (`/conversacion`, SPEC-053). Se ve en el Inicio y en las 5 pestañas;
  **no** en Emergencia, en el propio asistente, formularios ni detalles.
- Desde el Inicio (sin barra) los mensajes siguen a un toque desde el menú ☰ → «Mensajes».
- Redirecciones: `/marketplace` → `/ayuda`, `/comunidad` → `/eventos`, `/negocios` → `/explorar`.

## Criterios de aceptación
1. **Dado** Comunidad, Negocios, Ayuda o Chat, **entonces** la barra muestra Inicio · Comunidad · Negocios · Ayuda · Chat y resalta la actual.
2. **Dado** el Inicio, **entonces** no hay barra; se ven 4 botones grandes (Comunidad, Negocios, Emergencia, Ayuda) que abren `/eventos`, `/explorar`, `/emergencias` y `/ayuda`.
3. **Dado** el centro de Emergencia y sus pantallas hermanas, **entonces** la barra sigue visible y ninguna pestaña está resaltada.
4. **Dado** conversaciones sin leer, **entonces** la pestaña Chat muestra el número y el lector de pantalla lo anuncia.
5. **Dado** el Inicio o una pestaña, **entonces** se ve la burbuja del asistente sobre la barra; **dado** Emergencia o el propio asistente, **entonces** no.
6. **Dado** la burbuja, **cuando** la toco, **entonces** abre la conversación por voz (`/conversacion`), no los mensajes.
7. **Dado** cualquier raíz, **cuando** toco **SOS**, **entonces** se abre `/emergencias` en un toque, sin cuenta.
8. **Dado** un enlace viejo a `/marketplace`, `/comunidad` o `/negocios`, **entonces** llega a `/ayuda`, `/eventos` o `/explorar`, sin pantalla en blanco.
9. **Dado** el recorrido guiado, **entonces** cada paso apunta a un botón que existe (incluidos el SOS y la burbuja del asistente) y termina sin quedarse esperando.
10. **Dado** letra al máximo, **entonces** las 5 etiquetas se leen (o se recortan sin romper) y cada pestaña mide ≥ 48 dp.
11. **Dado** cualquier texto de la interfaz, **entonces** ya no dice «Marketplace» para referirse a Ayuda.

## Alcance
- **Toca:** `shell/sections.ts` (+ test), `shell/SectionBar.tsx`, `assistant/AssistantFab.tsx` (reemplaza a `chat/ChatFab`),
  `app/_layout.tsx`, `tour/steps.ts` (+ test), `app/(tabs)/ayuda.tsx` y `marketplace.tsx`, y los textos que decían «Marketplace».
- **No debe cambiar:** contenido de pantallas, SOS, datos. La categoría de mapa `marketplace` (OSM, «Mercado») es otra cosa.
- **Reglas de arquitectura:** `shell` no importa `assistant` ni `guard`; `assistant` puede importar `shell`. Sin ciclos.

## Pruebas
- **Automáticas:** `sections.test.ts` (barra, `assistantFabVisible`, rutas) y `tour/steps.test.ts`.
- **Manuales (Expo Go):** recorrer las 5 pestañas; burbuja en cada pantalla; contador de Chat; salir de Emergencia por la barra;
  recorrido guiado completo; letra al máximo y TalkBack.

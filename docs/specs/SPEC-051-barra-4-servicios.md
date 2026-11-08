# SPEC-051 — Barra de 4 pestañas + burbuja de chat

- **Estado:** implementada en la rama `shay-4-espacios` (8 nov 2026); `npm run check` en verde. **Falta** verificar en Expo Go.
- **Sprint:** Etapa 13 (ajuste de navegación). **Reemplaza** la barra de SPEC-043 (Inicio · Eventos · Explorar · Marketplace · Chat).
- **Decisión:** ADR 0007.

## Qué y por qué
La barra muestra siempre cuatro pestañas claras: Inicio, Comunidad, Negocios y Ayuda. Emergencia se abre con el SOS
de la cabecera y el chat es una burbuja flotante. **Solo cambia la parte de abajo** y el nombre «Marketplace», que
vuelve a ser «Ayuda»: el contenido de las pantallas no se toca.

## Barra y rutas

| Pestaña | Ruta raíz |
|---|---|
| Inicio | `/` (**sin barra**: ahí van 4 botones grandes; la pestaña sirve para volver desde las demás) |
| Comunidad | `/eventos` |
| Negocios | `/explorar` |
| Ayuda (antes «Marketplace») | `/ayuda`: pedir y ofrecer ayuda entre vecinos |

- **Emergencia no es pestaña.** Se abre con el SOS rojo de la cabecera (`/emergencias`). En `/emergencias` y sus
  pantallas hermanas (tablero, recursos, mis reportes) y en `/mensajes`, la barra se ve **sin pestaña resaltada**.
- Burbuja de chat: abajo a la derecha, abre `/mensajes`, con el número de conversaciones sin leer.
  Se ve en el Inicio y en las 3 pestañas con barra; **no** en Emergencia, mensajes, formularios ni detalles.
- Redirecciones: `/marketplace` → `/ayuda`, `/comunidad` → `/eventos`, `/negocios` → `/explorar`.

## Criterios de aceptación
1. **Dado** Comunidad, Negocios o Ayuda, **entonces** la barra muestra Inicio · Comunidad · Negocios · Ayuda y resalta la actual.
1b. **Dado** el Inicio, **entonces** no hay barra; se ven 4 botones grandes (Comunidad, Negocios, Emergencia, Ayuda) que abren `/eventos`, `/explorar`, `/emergencias` y `/ayuda`, y la burbuja de chat queda por encima del área segura.
2. **Dado** el centro de Emergencia y sus pantallas hermanas, **entonces** la barra sigue visible y ninguna pestaña está resaltada.
3. **Dado** cualquier raíz, **cuando** toco **SOS**, **entonces** se abre `/emergencias` en un toque, sin cuenta.
4. **Dado** el Inicio o una de las pestañas, **entonces** se ve la burbuja de chat sobre la barra; **dado** Emergencia, **entonces** no.
5. **Dado** conversaciones sin leer, **entonces** la burbuja muestra el número y el lector de pantalla lo anuncia.
6. **Dado** la burbuja, **cuando** la toco, **entonces** abre Mensajes, y ahí la barra permite salir.
7. **Dado** un enlace viejo a `/marketplace`, `/comunidad` o `/negocios`, **entonces** llega a `/ayuda`, `/eventos` o
   `/explorar`, sin pantalla en blanco.
8. **Dado** el recorrido guiado, **entonces** cada paso apunta a un botón que existe (incluido el SOS) y termina sin quedarse esperando.
9. **Dado** letra al máximo, **entonces** las 4 etiquetas se leen y cada pestaña mide ≥ 48 dp.
10. **Dado** cualquier texto de la interfaz, **entonces** ya no dice «Marketplace» para referirse a Ayuda.

## Alcance
- **Toca:** `shell/sections.ts` (+ test), `shell/SectionBar.tsx`, `chat/ChatFab.tsx`, `app/(tabs)/ayuda.tsx` y
  `marketplace.tsx` (se intercambian), `app/(tabs)/_layout.tsx`, `home/HomeScreen.tsx` + `home/ActionTile.tsx` (los 4 botones), `tour/steps.ts`, y los textos que decían «Marketplace».
- **No debe cambiar:** contenido de pantallas, SOS, datos. La categoría de mapa `marketplace` (OSM, «Mercado») es otra cosa y se queda.

## Pruebas
- **Automáticas:** `sections.test.ts` (barra, `chatFabVisible`, rutas) y `tour/steps.test.ts`.
- **Manuales (Expo Go):** recorrer las 4 pestañas; burbuja en cada pantalla; entrar a Emergencia con el SOS y salir por la
  barra; recorrido guiado completo; letra al máximo y TalkBack.

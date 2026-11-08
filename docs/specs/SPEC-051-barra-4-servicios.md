# SPEC-051 — Barra de los 4 servicios + burbuja de chat

- **Estado:** implementada en la rama `shay-4-espacios` (8 nov 2026); `npm run check` en verde. **Falta** verificar en Expo Go.
- **Sprint:** Etapa 13 (ajuste de navegación). **Reemplaza** la barra de SPEC-043 (Inicio · Eventos · Explorar · Marketplace · Chat).
- **Decisión:** ADR 0007.

## Qué y por qué
Yunta tiene 4 servicios (Comunidad, Negocios, Emergencia, Marketplace). La barra los muestra siempre, junto a
Inicio, y el chat deja de ser una pestaña: vuelve a ser una burbuja flotante. **Solo cambia la parte de abajo**: las
cabeceras, el contenido de las pantallas y las rutas no se tocan.

## Barra y rutas

| Pestaña | Ruta raíz (sin cambios) |
|---|---|
| Inicio | `/` |
| Comunidad | `/eventos` |
| Negocios | `/explorar` |
| Emergencia (en rojo) | `/emergencias` (y tablero, recursos, mis reportes) |
| Marketplace (antes «Ayuda») | `/marketplace`: pedir y ofrecer ayuda entre vecinos |

- Burbuja de chat: abajo a la derecha, abre `/mensajes`, con el número de conversaciones sin leer.
  Se ve en Inicio, Comunidad, Negocios y Marketplace; **no** en Emergencia, mensajes, formularios ni detalles.
- `/mensajes` muestra la barra sin pestaña resaltada (para tener salida).
- Redirecciones: `/ayuda` → `/marketplace`, `/comunidad` → `/eventos`, `/negocios` → `/explorar`.

## Criterios de aceptación
1. **Dado** cualquiera de las 5 raíces, **entonces** la barra muestra Inicio · Comunidad · Negocios · Emergencia · Marketplace y resalta la actual.
2. **Dado** el centro de Emergencia y sus pantallas hermanas, **entonces** la pestaña Emergencia está resaltada y la barra sigue visible.
3. **Dado** Inicio, Comunidad, Negocios o Marketplace, **entonces** se ve la burbuja de chat sobre la barra; **dado** Emergencia, **entonces** no.
4. **Dado** conversaciones sin leer, **entonces** la burbuja muestra el número y el lector de pantalla lo anuncia.
5. **Dado** la burbuja, **cuando** la toco, **entonces** abre Mensajes, y ahí la barra permite salir.
6. **Dado** el recorrido guiado, **entonces** cada paso apunta a un botón que existe y termina sin quedarse esperando.
7. **Dado** letra al máximo, **entonces** las 5 etiquetas se leen (o se recortan sin romper) y cada pestaña mide ≥ 48 dp.

## Alcance
- **Toca:** `shell/sections.ts` (+ test), `shell/SectionBar.tsx`, `shell/index.ts`, `chat/ChatFab.tsx` (+ export),
  `app/_layout.tsx`, `tour/steps.ts` (+ test), redirecciones y textos del asistente.
- **No debe cambiar:** `SectionHeader` (solo el texto del título de dos pantallas), contenido de pantallas, SOS, rutas, datos.
- **Cabeceras alineadas con la barra:** `/eventos` dice «Comunidad» y `/explorar` dice «Negocios» (antes «Eventos» y
  «Explorar»). «Marketplace» ya coincidía. «Emprendimientos» pasó a llamarse **Negocios** en toda la interfaz.

## Pruebas
- **Automáticas:** `sections.test.ts` (barra, `chatFabVisible`, rutas) y `tour/steps.test.ts`.
- **Manuales (Expo Go):** recorrer las 5 pestañas; burbuja en cada pantalla; salir de Emergencia y de Mensajes;
  recorrido guiado completo; letra al máximo y TalkBack.

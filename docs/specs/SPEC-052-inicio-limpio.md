# SPEC-052 — Inicio más limpio

- **Estado:** implementada en la rama `shay/SPEC-052-inicio-limpio` (8 nov 2026); `npm run check` en verde. **Falta**
  revisión de otra persona y verificar en Expo Go.
- **Dueño / revisor:** Shay / _(pendiente: Carlos u otra persona del equipo)_
- **Sprint:** Etapa 13 (pulido de Inicio, junto a SPEC-048). Regla del Sprint 2: **solo cambia lo visual y el orden**;
  las pruebas existentes siguen en verde sin modificarse.

## Qué y por qué
En el Inicio todo compite por atención: un saludo que ocupa mucho, cuatro botones altos con texto largo, lo pendiente
debajo del pliegue y tarjetas del feed con un bloque de color grande. Queremos una pantalla que se lea de un vistazo,
con lo importante arriba y el feed visible antes.

Sale de un análisis de UI del equipo. Esta spec toma **solo lo que no choca con decisiones vigentes** (SPEC-051 /
ADR 0007) y **no cambia colores ni la paleta**. Quedan fuera y pendientes de decisión del equipo: quitar el botón de
Emergencia del Inicio, la barra «¿Qué necesitas hoy?» que reemplazaría a la burbuja de chat, y una barra inferior con
«＋» (requieren un ADR nuevo).

## Criterios de aceptación
1. **Dado** el Inicio, **entonces** el saludo es una sola línea («Buenas tardes, Rosa», o «vecino» sin sesión) y debajo,
   en texto pequeño, «N vecinos activos en <sector>» (con `DemoTag` si el número sale de datos de demostración). Ya no
   hay recuadro de degradado.
2. **Dado** el modo fácil, **entonces** el saludo conserva el botón «Escuchar».
3. **Dado** reportes propios sin resolver, **entonces** «Tienes pendiente» aparece **antes** de los botones de sección
   (solo la alerta oficial del sector va más arriba).
4. **Dado** un reporte pendiente en el Inicio, **entonces** su tarjeta muestra **un solo chip** (el estado real, p. ej.
   «Guardado en tu teléfono» o «Recibido») y las personas en riesgo como texto («1 persona en riesgo»). En «Mis
   reportes» y en Ayuda la tarjeta no cambia.
5. **Dado** los botones de sección, **entonces** miden cerca de la mitad que antes (≥ 72 dp, nunca < 48 dp) y tienen
   título corto y una línea de apoyo: «Cerca de ti» (Comunidad), «Comercios» (Negocios), «Pide auxilio» (Emergencia) y
   «Ayuda vecinal» (Ayuda). Abren las mismas rutas que antes y el recorrido guiado los sigue encontrando (`tile-*`).
6. **Dado** el lector de pantalla, **entonces** cada botón anuncia su título, su línea de apoyo y la sección a la que
   lleva.
7. **Dado** una publicación sin foto en el feed, **entonces** la tarjeta no muestra el bloque de color con ícono grande:
   queda persona → etiquetas → título y descripción → «Ver detalle». Con foto, la foto se ve igual que antes.
8. **Dado** letra del sistema al máximo, **entonces** ningún texto de los botones de sección se corta sin poder leerse
   (el título puede ir en 2 líneas) y todo sigue siendo tocable.

## Alcance
- **Toca:** `src/features/home/HomeScreen.tsx`, `src/features/home/ActionTile.tsx`, `src/features/home/FeedCard.tsx`,
  `src/features/home/feed.ts` (+ `feed.test.ts`: `neighborsLabel`), `src/features/emergency/components/ReportCard.tsx`
  (prop opcional `compact`, por defecto igual que antes).
- **No debe cambiar:** colores y degradados (`gradients.ts`, `global.css`), SOS de la cabecera, burbuja de chat, barra
  de pestañas, rutas, recorrido guiado, datos, «Mis reportes» y Ayuda.
- **Reglas de arquitectura:** Inicio usa `ReportCard` por `@/features/emergency`; sin ciclos (`npm run arch:check`).

## Pruebas
- **Automáticas:** `feed.test.ts` → `neighborsLabel` (singular/plural, con sector). Las pruebas existentes no se tocan.
- **Manuales (Expo Go):** Inicio con y sin sesión; con un reporte pendiente (un solo chip); modo fácil (botones uno
  debajo del otro y «Escuchar»); letra al máximo; TalkBack en los 4 botones; recorrido guiado completo; feed con y sin
  fotos.

## Notas de accesibilidad y privacidad
- Estados con texto + ícono (el chip de estado no se quita). Las personas en riesgo se dicen con texto.
- Botones de sección ≥ 48 dp con `accessibilityRole="button"` y etiqueta completa aunque el texto visible sea corto.
- «Guardado en tu teléfono» nunca se presenta como «Recibido»: se reutiliza `IncidentStatusBadge` sin cambios.
- Sin datos nuevos: el conteo de vecinos sigue siendo solo un número agregado.

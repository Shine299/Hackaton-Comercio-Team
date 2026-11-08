# SPEC-027 — Modo fácil y «Elige cómo ver la app»

- **Estado:** hecha
- **Sprint:** 2 (S2-9)

## Qué y por qué
Que personas mayores o con dificultad para leer usen Yunta sin ayuda: letra grande, botones enormes y una sola columna, con la opción de que la app les lea.

## Criterios de aceptación
1. **Dado** el paso «Elige cómo ver la app» del tutorial (o Ajustes del perfil → «Cómo ver la app»), **cuando** elijo «Fácil», **entonces** toda la app cambia al instante y la elección se conserva al reabrir.
2. **Dado** el Modo fácil, **entonces** el texto crece ×1,25 (con interlineado proporcional), los botones y chips miden al menos 64 dp y Inicio, Ayuda y Negocios muestran una sola columna.
3. **Dado** el Modo fácil en Inicio, **entonces** hay un botón «Escuchar» que lee el saludo.
4. **Dado** el modo «Estándar», **entonces** nada cambia respecto a antes (sin estilos extra).
5. **Dado** que cambio de modo, **entonces** puedo volver al otro sin perder datos.

## Alcance
- **Toca:** `shared/nav/viewModeStore`, `shared/ui` (`Text`, `Button`, `Chip`, `easyMode`, `ViewModePicker`), Inicio, Ayuda, Negocios, tutorial y Ajustes.
- **No cambia:** el escalado de fuente del sistema (sigue respetándose, con techo `MAX_FONT_SCALE`).

## Pruebas
- Automáticas: `scaledSize` y `easyTextStyle` (`shared/ui/easyMode.test.ts`).
- Manuales: con letra del sistema al máximo no se corta ningún texto; áreas táctiles ≥ 64 dp; el cambio se ve al instante en el tutorial.

## Pendiente conocido
Otras pantallas con filas de dos columnas (p. ej. tarjetas de Comunidad, formularios) conservan su diseño; el texto y los botones sí crecen en todas.

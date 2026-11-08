# SPEC-054 — Pulido visual (solo estilo)

- **Estado:** implementada en la rama `shay-spec-054-pulido-visual` (8 nov 2026); `npm run check` en verde (39 suites, 304
  pruebas, sin modificar ninguna). **Falta** probarla en Expo Go y la revisión de otra persona.
- **Dueño / revisor:** Shay / _(pendiente: otra persona del equipo; quien revisa no es quien escribe)_
- **Sprint:** Etapa 13 (pulido de interfaz), historia **S13-8**. Regla del Sprint 2: **solo cambia lo visual; las pruebas
  existentes siguen en verde sin modificarse.**
- **Reemplaza:** el PR #4 (rama `shay-spec-052-inicio-limpio`), cuyo número chocaba con SPEC-052 (Modo guardia).

## Qué y por qué
Las pantallas principales gastan mucho espacio antes del contenido real: un banner con «3 pasos» en cada pestaña, un saludo
en un recuadro grande, cuatro botones altos con textos largos, lo pendiente al final del Inicio y tarjetas con bloques de
color. Esta spec hace la interfaz más ligera y fácil de leer **sin cambiar cómo funciona la app**.

Sale de un análisis de UI del equipo. De él se toma solo lo que es **puramente visual**; lo que cambia funcionamiento,
navegación o decisiones vigentes (SPEC-051, ADR 0007, `CLAUDE.md`) queda registrado más abajo como «fuera de alcance».

## Regla de la rama
Solo cambia **estilo, tamaño, orden de bloques y textos de títulos**. No cambia:
rutas, `onPress`/handlers, hooks, stores, datos, lógica (`feed.ts`, `places.ts`, `logic.ts`), `src/app/` ni ningún
`*.test.ts`. No se quita ningún `TourTarget` (el recorrido guiado sigue encontrando `tile-*`, `tab-*`, `header-sos`,
`assistant-fab`).

## Criterios de aceptación
Cada criterio se comprueba mirando la pantalla (Expo Go) y, para «no cambia el funcionamiento», con el diff.

1. **Dado** Comunidad, Negocios, Ayuda o Chat, **entonces** no hay banner de color con «3 pasos»; el título de la sección
   está en la cabecera y el contenido empieza más arriba.
2. **Dado** el Inicio, **entonces** el saludo es una línea («Buenas tardes, Rosa» o «vecino» sin sesión) y debajo, en pequeño,
   «N vecinos activos esta semana en <sector>» con su `DemoTag` si son datos de demo; en modo fácil sigue el botón «Escuchar».
3. **Dado** reportes propios sin resolver, **entonces** «Tienes pendiente» aparece justo después de la alerta oficial (antes
   de los accesos), y su tarjeta muestra **un solo chip** (el estado real) y «N personas en riesgo» como texto. «Mis reportes»
   y Ayuda muestran la tarjeta como antes.
4. **Dado** los accesos del Inicio, **entonces** son filas compactas (≥ 72 dp) con título corto y una línea de apoyo: «Cerca de
   ti», «Comercios», «Pide auxilio» y «Ayuda vecinal». Abren las mismas rutas que antes y conservan sus degradados.
5. **Dado** una publicación sin foto en el feed, **entonces** no se ve el bloque de color con ícono grande ni el renglón «Ver
   detalle»; con foto, la foto se ve igual. Toda la parte de arriba sigue abriendo el detalle y «Escribir» sigue aparte.
6. **Dado** un evento o un aviso, **entonces** su recuadro de fecha usa un degradado de la marca: ya no hay rojo en avisos
   informativos ni marrón en fechas. «Aviso» y «Evento» se distinguen por su ícono y etiqueta.
7. **Dado** Comunidad, **entonces** «Crear evento» es un botón compacto junto al título «Lo que se viene en tu barrio» (misma
   ruta), no un botón de ancho completo.
8. **Dado** Negocios (Lugares), **entonces** «Abierto ahora» está en la misma fila de chips que los grupos; cada lugar muestra un
   ícono de su tipo (panadería, peluquería…) y el botón final dice «Ver más lugares», sin el número de restantes.
9. **Dado** Ayuda, **entonces** «Necesito ayuda» y «Quiero ayudar» van primero; los conteos «piden/ofrecen cerca» están en su
   texto de apoyo, no en tres cuadros aparte, y se lee «¿Es una emergencia? Usa el SOS de arriba.».
10. **Dado** letra del sistema al máximo y el modo fácil, **entonces** nada se corta sin poder leerse y todo mide ≥ 48 dp.
11. **Dado** el diff de la rama, **entonces** no incluye ningún `*.test.ts`, `src/app/`, `feed.ts`, `places.ts`, `logic.ts`,
    stores ni hooks, y `npm run check` pasa sin modificar pruebas.

## Alcance
- **Toca:** `home/HomeScreen.tsx`, `home/ActionTile.tsx`, `home/FeedCard.tsx`, `emergency/components/ReportCard.tsx`
  (prop opcional `compact`, por defecto igual que antes), `events/EventCard.tsx`, `events/EventsScreen.tsx`,
  `explore/PlacesScreen.tsx`, `help/HelpHomeScreen.tsx`, `chat/ChatInboxScreen.tsx`.
- **No debe cambiar:** `GuardHomeCard`, `AssistantHomeCard`, la burbuja del asistente, la barra de pestañas, el SOS, las
  rutas, los datos, los colores propios de cada sección (`gradients.ts`) y el componente `SectionHero` (Emergencia lo sigue
  usando).
- **Reglas de arquitectura:** import solo por `index.ts`, sin ciclos (`npm run arch:check`).

## Registro de cambios

| Pantalla | Antes | Después | Archivo |
|---|---|---|---|
| Inicio · saludo | Recuadro degradado con saludo grande, frase y chip | Saludo de una línea y «N vecinos activos» pequeño | `HomeScreen.tsx` |
| Inicio · pendiente | Después del feed, con 3 chips | Bajo la alerta, con 1 chip | `HomeScreen.tsx`, `ReportCard.tsx` |
| Inicio · accesos | Cuatro botones altos con textos largos | Cuatro filas compactas con título corto | `HomeScreen.tsx`, `ActionTile.tsx` |
| Inicio · feed | Bloque de degradado de 112 px sin foto y «Ver detalle» | Sin bloque ni «Ver detalle» | `FeedCard.tsx` |
| Comunidad | Banner de 3 pasos y botón ancho | Sin banner; «Crear» compacto | `EventsScreen.tsx` |
| Comunidad · eventos | Avisos en rojo y fechas en marrón | Degradados de la marca | `EventCard.tsx` |
| Negocios | Banner de 3 pasos, dos filas de chips, ícono por grupo, «526 restantes» | Sin banner, una fila, ícono por tipo, «Ver más lugares» | `PlacesScreen.tsx` |
| Ayuda | Banner, tres cuadros de estadística, botones de 176 px | Botones primero con conteos en el texto, línea del SOS | `HelpHomeScreen.tsx` |
| Chat | Banner «Mensajes» con 3 pasos (repite el título) | Sin banner | `ChatInboxScreen.tsx` |

## Fuera de alcance y por qué
Estas sugerencias del análisis **no** se hacen aquí porque cambian funcionamiento, navegación o una decisión vigente.

| Sugerencia | Por qué queda fuera | Dónde sigue |
|---|---|---|
| Llevar la tarjeta «Modo guardia» a Ajustes | El Inicio es donde se enciende y apaga la escucha; el indicador «Guardia activa» ya está en la cabecera (SPEC-052) | Equipo de guardia |
| Fusionar o quitar la burbuja flotante | Es el asistente (ADR 0007, SPEC-053) | ADR nuevo |
| Barra inferior en el Inicio | Contradice SPEC-051 y ADR 0007 | ADR nuevo |
| Un solo acceso de emergencia (quitar «Pide auxilio») | Contradice SPEC-051 y el recorrido guiado | ADR nuevo |
| Feed único con chips, carrusel, máx. 3 eventos | Lógica nueva del feed | Spec futura |
| «Voy» en la tarjeta, agrupar por día, filtros de eventos | Lógica de asistencia y de agrupación | Spec futura |
| Quitar el selector Lugares/Negocios, insignia «Verificado» | No existe ninguna verificación; «un estado nunca miente» | Spec futura |
| Mapa flotante, ordenar lugares, Llamar/WhatsApp, atribución en ⓘ | Funcionalidad nueva o datos que no existen | Spec futura |
| Etiqueta de demo una sola vez | `CLAUDE.md`: todo dato ficticio lleva `DemoTag` | Decisión del equipo |
| «Mis solicitudes» solo si hay, vecino vulnerable dentro del flujo, aviso legal al pulsar SOS | Cambian qué se muestra o el flujo | Spec futura |
| Quitar el tope de letra de la barra (`maxFontSizeMultiplier`) | Hay que probarlo en teléfono con 5 pestañas | Spec futura |
| Rehacer el degradado rojizo de Negocios y toda la paleta | «Cada sección tiene su color»; necesita decisión | Decisión del equipo |

**Hallazgos de texto sin tocar:** Actividad dice «El chat todavía no existe» (el chat ya existe, SPEC-045); la lista de ayuda
se titula «Día a día» mientras la pestaña dice «Ayuda».

## Pruebas
- **Automáticas:** ninguna prueba nueva ni modificada (la spec es solo visual). Sirven de red de seguridad las 30+ suites
  existentes: `npm run check` debe quedar igual de verde.
- **Comprobación de «solo visual»** (hecha): el diff contra `origin/main` no incluye pruebas, `src/app/`, `feed.ts`,
  `places.ts`, `logic.ts`, stores ni hooks. Los conteos de `onPress`, `router.*` y `tourId/TourTarget` por archivo son
  idénticos a antes; la única diferencia es `ReportCard` (2 → 4 `onPress`), porque la variante `compact` reutiliza el mismo
  manejador que recibe por prop.
- **Manuales (Expo Go, datos de demo):**
  - [ ] Inicio: saludo de una línea; con un reporte creado, «Tienes pendiente» arriba con un solo chip; los 4 accesos abren
    Comunidad, Negocios, Emergencia y Ayuda; el feed no tiene bloques de color.
  - [ ] Comunidad: sin banner; «Crear» abre el formulario; fechas y avisos sin rojo ni marrón.
  - [ ] Negocios: una fila de chips; íconos correctos; «Ver más lugares».
  - [ ] Ayuda: botones primero; conteos en su texto; línea del SOS.
  - [ ] Chat: sin banner; aviso de seguridad visible.
  - [ ] Modo fácil, letra al máximo, TalkBack y recorrido guiado completo.

## Notas de accesibilidad y privacidad
- Estados con texto + ícono (el chip de estado del reporte no se quita; las personas en riesgo se dicen con texto).
- Cada acceso conserva su etiqueta accesible completa y añade a qué sección lleva.
- Sin datos nuevos ni permisos nuevos. «Guardado en el teléfono» sigue sin mostrarse como «recibido».

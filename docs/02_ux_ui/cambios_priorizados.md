# Cambios priorizados de UI (5 pestañas) y su evaluación

- **Fecha:** 8 de noviembre de 2026 (actualizado con el estado real de las ramas)
- **Origen:** lista priorizada de cambios (P0 globales, P1 por pantalla, P2 pulido) revisada contra el código y las
  decisiones vigentes (SPEC-051, ADR 0007, `CLAUDE.md`).
- **Complementa a:** `docs/02_ux_ui/mejoras_inicio.md` y `docs/specs/SPEC-054-pulido-visual.md` (lo ya implementado).
- **Resultado:** de 33 puntos, 21 eran viables, 8 viables con un ajuste y 4 chocaban con decisiones vigentes o no tenían base.
  Lo puramente visual ya está hecho en SPEC-054; lo demás espera spec o decisión.

**Leyenda**

- ☑️ **Hecho**: implementado en **SPEC-054** (PR #6, solo estilo) u otra spec indicada. Falta probar en Expo Go y revisión.
- ✅ **Viable**: se puede hacer sin chocar con nada, pero cambia funcionamiento: necesita su propia spec.
- 🟡 **Con ajuste**: viable cambiando un detalle (se explica cuál).
- ⚖️ **Decisión**: choca con SPEC-051, ADR 0007 o `CLAUDE.md`; necesita acuerdo del equipo y un ADR nuevo (0010 o posterior).
- ❌ **No viable ahora**: falta un dato, una función o la premisa es falsa según el código.

> Regla del proyecto: ningún cambio se programa sin una spec aprobada (`docs/specs/SPEC-NNN-*.md`), con su fila en
> `sprints.md`, prueba primero (TDD) y `npm run check` en verde. Los cambios de interfaz se verifican en Expo Go.

> **Numeración:** SPEC-052 (Modo guardia), SPEC-053 (conversación por voz) y ADR 0008 (Modo guardia) son del equipo.
> Esta línea de trabajo usa SPEC-054 (pulido visual), SPEC-055 / ADR 0009 («Atrás» a la sección) y SPEC-056 (políticas).

## Estado real de la app (lo que cambió desde el análisis)
- **5 pestañas** (Inicio · Comunidad · Negocios · Ayuda · Chat); el Inicio no muestra la barra (ADR 0007 actualizado).
- La **burbuja flotante es el asistente** de Yunta, no el chat. Hay **cuatro puertas** al asistente: tarjeta «Habla con
  Yunta», botón «Pregunta a Yunta», la burbuja y la frase «Hola Yunta» del Modo guardia.
- El **Modo guardia existe** (tarjeta en el Inicio, ajustes en `/emergencias/guardia`) y su **indicador ya está en la cabecera**.

---

## 1. Banner de «3 pasos» (P0.1)
Era el componente `SectionHero` (con pasos tipo «Mira · Marca Voy · Organiza») en Comunidad, Negocios, Ayuda, Emergencia y
Mensajes. **Quitado en Comunidad, Negocios, Ayuda y Chat** (☑️ SPEC-054); Emergencia conserva su versión compacta (título y
una línea). El Inicio ya no lo tiene.

## 2. P0: cambios globales

| # | Cambio pedido | Veredicto | Detalle |
|---|---|---|---|
| 1 | Quitar el banner de «3 pasos» | ☑️ | SPEC-054. |
| 2 | Chip «Guardia activa» como indicador pequeño; tarjeta «Modo guardia» a Ajustes | ⚖️ | El indicador **ya existe** en la cabecera. Mover la tarjeta cambia el funcionamiento (ahí se enciende y apaga la escucha). |
| 3 | Fusionar el botón flotante con «Pregunta a Yunta» (✨) o eliminarlo | ⚖️ | La burbuja es el asistente (ADR 0007, SPEC-053). Unificar las cuatro puertas es decisión del equipo. |
| 4 | Paleta: rojo solo para emergencias; sacar marrón/mostaza y los degradados rojizos | 🟡 | ☑️ avisos y fechas de eventos (SPEC-054). El degradado rojizo de «Comercios» y toda la paleta quedan para decisión («cada sección tiene su color»). |
| 5 | Barra inferior también en Inicio | ⚖️ | Contradice SPEC-051 (criterio 1b) y ADR 0007. |
| 6 | «DATO DE DEMO» una sola vez | 🟡 | `CLAUDE.md` exige un `DemoTag` por cada dato ficticio. Propuesta: una etiqueta por lista cuando todos sus elementos son de demo, y por tarjeta cuando se mezclan. |

## 3. P1: por pantalla

### Inicio

| Cambio pedido | Veredicto | Detalle |
|---|---|---|
| Un solo acceso de emergencia (SOS) | ⚖️ | Choca con SPEC-051 y el recorrido guiado (`tile-emergencia`). Recomendado: hacerlo, conservando un enlace secundario. |
| «Tienes pendiente» arriba, con 1 chip | ☑️ | SPEC-054. |
| Saludo en una línea y accesos compactos | ☑️ | SPEC-054 (cajas de 90 dp: arriba «Pide auxilio» y «Cerca de ti»; abajo «Ayuda vecinal» y «Comercios»). |
| Feed único con chips, carrusel, máx. 3 eventos | ✅ | Spec futura: `filterHomeFeed` pura con prueba; en modo fácil el carrusel pasa a una columna. |
| Tarjeta sin bloque morado y con una sola acción | ☑️ | SPEC-054 (sin bloque ni «Ver detalle»). |
| Sección inferior (fondo, cámaras, perrito) | ☑️ | Ahora se titula «Nuevas funcionalidades» (SPEC-054). |

### Comunidad (`events/EventsScreen.tsx`)

| Cambio pedido | Veredicto | Detalle |
|---|---|---|
| Cabecera «Comunidad + Crear»; quitar el botón ancho | ☑️ | SPEC-054 («Crear» compacto junto al título). |
| Botón «Voy» dentro de cada tarjeta | 🟡 | Spec futura: hay que sacar la lógica de «Voy» del detalle (`setRsvp`) a un hook compartido; solo eventos de vecinos (`canRsvp`). |
| Hora en destaque | ✅ | Spec futura (presentación en `EventCard`). |
| Categoría como chip (Charla, Feria) | ❌ | `SectorEvent` no tiene `category`: requiere tipo, esquema, formulario y migración en Supabase. |
| Agrupar por día y chips de filtro | ✅ | Spec futura: funciones puras con prueba en `logic.ts`. |

### Negocios (`explore/PlacesScreen.tsx`)

| Cambio pedido | Veredicto | Detalle |
|---|---|---|
| Buscador primero y una sola fila de chips (con «Abierto ahora») | ☑️ | SPEC-054 (una fila; el buscador conserva su lugar). |
| Quitar el selector Lugares/Negocios y usar «Verificado» | ❌ | Son datos distintos y **no existe ninguna verificación**; decirlo violaría «un estado nunca miente». |
| Mapa como botón flotante | 🟡 | Spec futura; ya existe `MapFab`. ≥ 48 dp y etiqueta accesible. |
| Ocultar «Horario no confirmado» y «A 350 m» cuando no informan | 🟡 | Spec futura: el horario no confirmado se diría una vez por lista, sin dejar de ser honesto. |
| Ordenar por los que tienen datos | ✅ | Spec futura: función pura con prueba. |
| Corregir íconos (peluquería, panadería) | ☑️ | SPEC-054 (ícono por tipo de lugar). |
| Añadir Llamar / WhatsApp | ❌ | Ni los lugares ni los negocios guardan teléfono (privacidad: un negocio publica solo su sector). |
| Quitar «526 restantes» | ☑️ | SPEC-054 («Ver más lugares»). |
| Atribución de OpenStreetMap en un ⓘ | 🟡 | Spec futura; la licencia obliga a mostrarla y el ⓘ debe ser tocable (≥ 48 dp). |

### Ayuda (`help/HelpHomeScreen.tsx`)

| Cambio pedido | Veredicto | Detalle |
|---|---|---|
| «Necesito ayuda / Quiero ayudar» primero, con contador integrado | ☑️ | SPEC-054. «Necesito ayuda» dice «N ofrecen cerca» y «Quiero ayudar» dice «N piden ayuda cerca». |
| Línea «¿Es una emergencia? Usa SOS» | ☑️ | SPEC-054 (texto fijo, sin enlace). |
| Quitar los 3 cuadros de estadísticas | ☑️ | SPEC-054. |
| Categorías como chips | ✅ | Spec futura (hoy son 2 grupos con conteo). |
| «Mis solicitudes» solo si hay alguna | ✅ | Spec futura (cambia qué se muestra). |
| «Vecino vulnerable» como opción dentro del flujo | ⚖️ | Hoy es un flujo propio con prioridad; cambia el modelo del reporte. |

## 4. P2: pulido

| Cambio pedido | Veredicto | Detalle |
|---|---|---|
| Mejor contraste de subtítulos sobre degradados | 🟡 | Es un cambio de color; va con la decisión de paleta. |
| Evitar palabras huérfanas | ✅ | Títulos cortos (hecho en los accesos del Inicio, SPEC-054). |
| Una sola ilustración por concepto | ✅ | Revisar los `SECCION_*_XML` repetidos. |
| «Sin crear cuenta» solo sin sesión; acortar textos vacíos | ✅ | Spec futura (`useSessionStore`). |
| Aviso «no reemplaza servicios de emergencia» al pulsar SOS | 🟡 | La política «Emergencias y Modo guardia» (SPEC-056) ya lo dice; falta una línea dentro del centro de Emergencia, sin pantalla intermedia. |

## 5. Lo que se hizo además (fuera de la lista)

| Spec | Qué | Estado |
|---|---|---|
| SPEC-055 · ADR 0009 | **«Atrás» sin historial cae al inicio de la sección** (Ayuda, Negocios, Comunidad, Chat, Emergencia); con historial no cambia | Implementada en la rama `shay-spec-055-atras-a-la-seccion`, sin subir |
| SPEC-056 | **Políticas de servicios** en el menú lateral (4 accesos, pantalla `/politicas`) y **marca de agua «Yunta Perú»**. Textos en borrador, **pendientes de revisión legal** | Implementada en la rama `shay-spec-056-politicas-de-servicio`, sin subir |

## 6. Plan de trabajo

| Entrega | Contenido | Estado |
|---|---|---|
| SPEC-054 | Pulido visual (Inicio, Comunidad, Negocios, Ayuda, Chat) | ☑️ PR #6 (borrador): falta Expo Go y revisión |
| SPEC-055 | «Atrás» a la sección | ☑️ Local: falta subir, PR, Expo Go y revisión |
| SPEC-056 | Políticas y marca de agua | ☑️ Local: falta subir, PR, Expo Go, revisión y **revisión legal** |
| SPEC-057 (futura) | Feed único con chips, carrusel y máx. 3 eventos; «Mis solicitudes» condicional | Por redactar |
| SPEC-058 (futura) | Comunidad: «Voy» en la tarjeta, hora en destaque, agrupar por día y filtros | Por redactar |
| SPEC-059 (futura) | Negocios: mapa flotante, orden, horario por lista y atribución en ⓘ | Por redactar |
| ADR 0010 | Barra en Inicio, acceso único de emergencia, asistente (4 puertas), «Publicar», etiqueta de demo, vecino vulnerable, paleta | Para decidir con el equipo |
| Futuras | Categoría de evento (migración) y teléfono de negocios (privacidad) | Fuera de esta tanda |

## 7. Preguntas abiertas
1. ¿Se aprueba la etiqueta de demo por lista (cuando todo es demo) y por tarjeta (cuando se mezclan)?
2. ¿Qué se hace con las cuatro puertas al asistente y con la tarjeta del Modo guardia en el Inicio?
3. ¿Quién revisa el texto legal de las políticas antes de publicar?

## 8. Cómo se verifica cada entrega
- **Automático:** `npm run check` (typecheck, lint, ciclos de dependencia y pruebas). Las reglas de lógica llevan prueba
  `*.test.ts` escrita antes del código.
- **Manual, en un celular con Expo Go** (el navegador no es referencia): cada pestaña con y sin sesión, modo fácil, letra al
  máximo, TalkBack, recorrido guiado y poca señal.
- **Accesibilidad mínima:** áreas táctiles ≥ 48 dp, estados con texto además de color, contraste ≥ 4,5:1.
- **Reglas de producto:** «Guardado en el teléfono» nunca se muestra como «recibido»; ubicación siempre aproximada; todo dato
  ficticio lleva `DemoTag`.

## 9. Referencias
- `docs/02_ux_ui/mejoras_inicio.md` — revisiones del Inicio.
- `docs/specs/SPEC-054-pulido-visual.md`, `SPEC-055-atras-a-la-seccion.md`, `SPEC-056-politicas-de-servicio.md` y `docs/adr/0009-atras-cae-a-la-seccion.md`.
- `docs/specs/SPEC-051-barra-4-servicios.md` y `docs/adr/0007-barra-4-servicios-chat-flotante.md` — navegación vigente (nombres históricos: hoy son 5 pestañas).
- `docs/specs/SPEC-052-modo-guardia-por-voz.md` y `docs/adr/0008-modo-guardia-ubicacion-exacta-consentida.md` — Modo guardia.
- `docs/specs/SPEC-047-explorar-lugares.md` y `docs/specs/SPEC-046-eventos-de-vecinos.md` — lugares y eventos.
- `sprints.md`, Etapa 13 (filas S13-8, S13-9 y S13-10).
- PR #6: https://github.com/Shine299/Hackaton-Comercio-Team/pull/6

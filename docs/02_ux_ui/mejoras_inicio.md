# Mejoras sugeridas para el Inicio

- **Fecha:** 8 de noviembre de 2026 (actualizado con el estado real de las ramas)
- **Origen:** revisiones de la pantalla de Inicio hechas por el equipo (cajas del feed y dos análisis de UI).
- **Objetivo:** que el Inicio sea más sencillo de usar: menos ruido visual, lo importante arriba y el feed visible antes.
- **Cómo leer el estado de cada mejora:**
  - ✅ **Hecha**: implementada en **SPEC-054** (PR #6, rama `shay-spec-054-pulido-visual`; solo estilo). Falta probarla en Expo Go y la revisión del equipo.
  - 🗓️ **Planificada**: propuesta para una spec futura (SPEC-057 o posterior). No choca con decisiones vigentes.
  - ⚖️ **Requiere decisión**: choca con SPEC-051, ADR 0007 o `CLAUDE.md`. Necesita acuerdo del equipo y un ADR nuevo (0010 o posterior).

> Regla del proyecto: todo cambio tiene su spec aprobada, su lugar en `sprints.md` y se documenta. Este archivo resume las
> ideas; la fuente de verdad de lo implementado es `docs/specs/SPEC-054-pulido-visual.md`.

> **Numeración (corregida):** SPEC-052 es el Modo guardia por voz, SPEC-053 la conversación por voz y ADR 0008 el Modo guardia
> (del equipo). Mi primer intento de «Inicio limpio» usaba SPEC-052 y se reemplazó por SPEC-054 (PR #4 cerrado). «Atrás a la
> sección» es SPEC-055 / ADR 0009 y las políticas de servicios son SPEC-056.

## Cómo está hoy la navegación (ADR 0007 vigente)
- **5 pestañas:** Inicio · Comunidad · Negocios · Ayuda · Chat. El **Inicio no muestra la barra**.
- La **burbuja flotante es el asistente de Yunta** (con la mascota), no el chat; el chat con vecinos es la pestaña Chat.
- Emergencia no es pestaña: se abre con el **SOS** de la cabecera.
- El **Modo guardia** existe: tarjeta en el Inicio (activar/apagar y Ajustes), pantalla `/emergencias/guardia` e **indicador
  «Guardia activa · escuchando» en la cabecera** mientras escucha.

---

## 1. Cajas del feed (el punto de partida)

El feed pintaba cada publicación sin foto con un bloque de degradado de 112 px y un ícono blanco de 52 px, más hasta tres
badges de colores distintos. Con varias tarjetas seguidas saturaba la vista.

| Mejora | Estado |
|---|---|
| Quitar el bloque de degradado cuando la publicación no tiene foto (con foto se ve igual que antes). | ✅ SPEC-054 |
| Dejar la categoría en su etiqueta con ícono pequeño, sin bloque grande. | ✅ SPEC-054 |
| Quitar el renglón «Ver detalle» (la parte de arriba de la tarjeta ya es el botón). | ✅ SPEC-054 |
| Reducir los badges por tarjeta (dejar «Urgente» solo cuando lo es). | 🗓️ Spec futura (hoy siguen hasta 3) |
| Dejar de pintar de rojo la categoría `care` (rojo = urgencia real). | ⚖️ Decisión: toca la paleta |

## 2. Primer análisis: lo que compite por atención

| # | Mejora | Estado |
|---|---|---|
| 1 | **Una sola entrada de emergencia**: dejar el SOS y quitar (o volver enlace) la tarjeta «Pide auxilio». | ⚖️ Choca con el criterio 1b de SPEC-051 y con el recorrido guiado. Recomendado: hacerlo, conservando un enlace «Reporta sin crear cuenta». |
| 2 | **Reservar el rojo para emergencias** (morado de marca para el resto). | 🟡 Solo se corrigió el mal uso en eventos y avisos (SPEC-054). Rehacer el degradado rojizo de «Comercios» queda para decisión del equipo («cada sección tiene su color»). |
| 3 | **Subir lo pendiente** y mostrar un solo chip de estado más «N personas en riesgo» como texto. | ✅ SPEC-054 |
| 4 | **Encoger el banner** a una línea: «Buenas tardes, [nombre]» y «N vecinos activos» en pequeño. | ✅ SPEC-054 |
| 5a | **Botones de sección más ligeros**, con título corto y una línea de apoyo («Cerca de ti», «Comercios», «Pide auxilio», «Ayuda vecinal»). | ✅ SPEC-054 (cajas de 90 dp: arriba «Pide auxilio» y «Cerca de ti», abajo a todo el ancho «Ayuda vecinal» y «Comercios») |
| 5b | Fondo lila suave o blanco en los botones; subtítulos con mejor contraste. | ⚖️ Decisión: es un cambio de colores |
| 6 | **Unificar acciones**: una barra «¿Qué necesitas hoy?» que reemplace a «Pregunta a Yunta» y a la burbuja; «Publicar» al centro de una barra inferior. | ⚖️ Choca con ADR 0007 (la burbuja es el asistente) y, sin barra en Inicio, «Publicar» no tiene dónde ir |
| 7 | **Barra inferior** Inicio · Explorar · ＋ · Negocios · Perfil en lugar del menú. | ⚖️ Contradice ADR 0007 (5 pestañas y Inicio sin barra) |

## 3. Segundo análisis: demasiado scroll antes del contenido real

Lo mejor de la pantalla, según la revisión: la **fila compacta** (ícono + título + estado + flecha) de «Cámaras del barrio» y la
**barra de progreso** del Fondo vecinal. Se propone usarlas como modelo para el resto.

| # | Mejora | Estado |
|---|---|---|
| 1 | **Modo guardia duplicado**: dejar solo el chip «Guardia activa · escuchando» y llevar la tarjeta a Ajustes. | ⚖️ El indicador **ya existe** en la cabecera. Mover la tarjeta cambia el funcionamiento (ahí se enciende y apaga la escucha), así que no entra en un pulido visual. |
| 2 | **Reducir el bloque superior** (saludo en una línea y accesos compactos); un solo acceso de emergencia. | ✅ saludo y accesos (SPEC-054) · ⚖️ acceso único de emergencia |
| 3a | **Un solo feed con chips de filtro**: Todo · Eventos · Ofrezco · Necesito. | 🗓️ Spec futura (`filterHomeFeed`, función pura con prueba) |
| 3b | **Máximo 3 eventos en el feed**, con «Ver todos los eventos» hacia `/eventos`. | 🗓️ Spec futura |
| 3c | **Fondo vecinal, Cámaras y Perrito en un carrusel horizontal corto.** En modo fácil, una columna. | 🗓️ Spec futura. Esa sección ya se titula **«Nuevas funcionalidades»** (SPEC-054). |
| 4 | **Tarjeta del feed**: sin bloque vacío y «Escribir» como botón. | ✅ SPEC-054 (sin bloque ni «Ver detalle») |
| 5 | **«DATO DE DEMO» una sola vez**, como cinta en la cabecera. | ⚖️ Choca con `CLAUDE.md` («todo dato ficticio lleva `DemoTag`»): en el feed se mezclan datos reales y de demo. Alternativa a discutir: un `DemoTag` más pequeño. |
| 6 | **Aviso informativo en rojo** y **fechas marrones**: usar morado o ámbar suave. | ✅ SPEC-054 (`EventCard` usa degradados de la marca) |
| 7 | **Burbuja flotante** que tapa contenido y ícono ambiguo: fusionarla con «Pregunta a Yunta» o quitarla. | ⚖️ La burbuja es el asistente (ADR 0007, SPEC-053). Hoy hay **cuatro puertas** a Yunta (tarjeta «Habla con Yunta», botón «Pregunta a Yunta», burbuja y la frase «Hola Yunta»): unificarlas es una decisión del equipo. |
| 8 | **Barra de navegación inferior en el Inicio**. | ⚖️ Contradice SPEC-051 (criterio 1b) y ADR 0007 |
| 9 | **Aviso legal** («no reemplaza a servicios oficiales») visible también al pulsar SOS o la primera vez. | 🟡 La nueva política «Emergencias y Modo guardia» (SPEC-056, menú lateral) ya lo dice. Una línea dentro del centro de Emergencia sigue pendiente, **sin pantalla intermedia**, para no romper «el SOS funciona sin cuenta, a un toque». |

## 4. Orden actual de la pantalla (tras SPEC-054)

1. Cabecera (menú/avatar, avisos, SOS) con el indicador de guardia si está escuchando.
2. Saludo en una línea con «N vecinos activos».
3. Alerta oficial del sector (si hay).
4. **Tienes pendiente** (si hay), con un solo chip por reporte.
5. Los 4 accesos: arriba «Pide auxilio» y «Cerca de ti»; abajo «Ayuda vecinal» y «Comercios».
6. Tarjeta del Modo guardia y tarjeta «Habla con Yunta».
7. «Lo nuevo en tu barrio»: feed y botón «Ver todas las publicaciones».
8. Botones «Publicar» y «Pregunta a Yunta».
9. **Nuevas funcionalidades**: fondo vecinal, cámaras y perrito.
10. Aviso legal.

La barra inferior en el Inicio sigue sujeta a decisión.

## 5. Paquete de decisión para el equipo (ADR 0010 o posterior)

Estos puntos dependen entre sí y conviene decidirlos juntos:

- **Barra inferior en el Inicio.** Con barra, los 4 botones grandes sobran. Sin barra, se quedan.
- **Un solo acceso de emergencia** (SOS en la cabecera) y qué hacer con «Pide auxilio».
- **Cuatro puertas al asistente:** cuántas dejar y cómo se llaman.
- **Dónde va «Publicar»** si cambia la barra.
- **Tarjeta del Modo guardia:** dejarla en el Inicio o llevarla a Ajustes (el indicador ya está en la cabecera).
- **`DemoTag`:** por tarjeta (regla vigente), por lista cuando todo es demo o una cinta única.
- **Colores:** aplicar «rojo = urgencia real» a «Comercios» y a la categoría `care`.

## 6. Cómo verificar cada mejora

- Automático: `npm run check` (typecheck, lint, ciclos y pruebas). Las reglas de lógica llevan prueba `*.test.ts` al lado.
- Manual, en un celular con Expo Go (el navegador no es referencia): Inicio con y sin sesión, con un reporte pendiente, modo
  fácil, letra al máximo, TalkBack y recorrido guiado.
- Accesibilidad mínima: áreas táctiles ≥ 48 dp, estados con texto además de color, contraste ≥ 4,5:1.

## 7. Referencias

- `docs/specs/SPEC-054-pulido-visual.md` — lo implementado (solo estilo).
- `docs/specs/SPEC-055-atras-a-la-seccion.md` y `docs/adr/0009-atras-cae-a-la-seccion.md` — «Atrás» cae a la sección.
- `docs/specs/SPEC-056-politicas-de-servicio.md` — políticas de servicios y marca de agua en el menú lateral.
- `docs/specs/SPEC-051-barra-4-servicios.md` y `docs/adr/0007-barra-4-servicios-chat-flotante.md` — navegación vigente (los nombres de archivo son históricos: hoy son 5 pestañas).
- `docs/specs/SPEC-052-modo-guardia-por-voz.md`, `docs/adr/0008-modo-guardia-ubicacion-exacta-consentida.md` — Modo guardia.
- `sprints.md`, Etapa 13 (filas S13-8, S13-9 y S13-10).
- PR #6: https://github.com/Shine299/Hackaton-Comercio-Team/pull/6

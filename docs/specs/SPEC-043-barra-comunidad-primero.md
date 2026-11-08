# SPEC-043 — Barra «comunidad primero»: Inicio · Eventos · Explorar · Marketplace · Chat

> **Nota (8 nov):** la barra de este documento fue reemplazada por **Inicio · Comunidad · Negocios · Ayuda** (SPEC-051 / ADR 0007). Se conserva como registro de la decisión.

- **Estado:** hecha (8 nov 2026). `npm run check` en verde, probada en Expo Go y aprobada (incluye D4–D6)
- **Dueño / revisor:** … / … (quien revisa no es quien escribe)
- **Sprint:** Etapa 13 — historia S13-1 (13a). Plan: `docs/04_tecnico/plan_etapa13_comunidad_primero.md`
- **Reemplaza:** los criterios de navegación de SPEC-014 (barra por sección, Inicio sin barra)

## Qué y por qué
Quien probó la app pide que se sienta como **una comunidad**: una barra fija con Inicio, Eventos, Explorar,
Marketplace y Chat. Hoy la barra es Inicio · Comunidad · Negocios · Emergencia · Ayuda, el Inicio no la muestra y
el chat solo se abre con un botón flotante. Esta historia **solo reorganiza la navegación**: no cambia el contenido
de ninguna pantalla ni toca el servidor. Las pestañas nuevas muestran contenido real que ya existe (ver «Rutas»).

## Decisiones que asume (plan §2)
- **D4:** Emergencia sale de la barra. Se llega con el botón **SOS** de la cabecera (ya está en todas las raíces).
  Mientras se está en Emergencia, la barra principal se sigue viendo **sin pestaña resaltada**, para que siempre haya
  salida.
- **D5:** Perfil sigue en el menú lateral (☰). El avatar en la cabecera llega en 13b (SPEC-044).
- **D6:** Ayuda pasa a llamarse **Marketplace**; Comunidad deja de ser pestaña (su feed se mueve al Inicio en 13b).

## Rutas

| Pestaña | Ruta | Muestra en 13a | Muestra después |
|---|---|---|---|
| Inicio | `/` | `HomeScreen` actual | Feed comunitario (13b) |
| Eventos | `/eventos` *(nueva)* | `EventsScreen` provisional: los eventos del sector que ya existen (`useSectorEvents` + `EventCard`), solo lectura, con `DemoTag` cuando son de demo | Crear y «Voy» (13d) |
| Explorar | `/explorar` *(cambia de contenido)* | `BusinessesScreen` (negocios vecinos) | Lugares + negocios con horario (13e) |
| Marketplace | `/marketplace` *(nueva)* | `HelpHomeScreen` con título «Marketplace» | — |
| Chat | `/mensajes` | `ChatInboxScreen` | Chat directo (13c) |

- La lista de publicaciones (hoy `ExploreScreen` en `/explorar`, «Quiero ayudar») se mueve a **`/publicaciones`**,
  sin barra y con encabezado de regreso, y conserva sus parámetros (`kind`, `group`, `view`, `layer`, `t`).
- `/publicar` sigue igual (sin barra: es un formulario).
- **Redirecciones** (para deep links, notificaciones programadas y el tour): `/ayuda` → `/marketplace`,
  `/comunidad` → `/`, `/negocios` → `/explorar`.

## Criterios de aceptación
1. **Dado** el Inicio (con el tutorial terminado), **entonces** se ve la barra con 5 pestañas en este orden:
   Inicio · Eventos · Explorar · Marketplace · Chat, y la pestaña Inicio está resaltada.
2. **Dado** cualquiera de las 5 raíces, **cuando** toco otra pestaña, **entonces** llego a su pantalla y esa pestaña
   queda resaltada (`accessibilityState.selected`); tocar la pestaña activa no hace nada.
3. **Dado** cualquiera de las 5 raíces, **cuando** toco **SOS**, **entonces** se abre `/emergencias` en un toque, sin
   cuenta.
4. **Dado** `/emergencias`, `/emergencias/tablero`, `/emergencias/recursos` o `/emergencias/mis-reportes`,
   **entonces** se ve la barra principal **sin pestaña resaltada** y tocar cualquiera sale de Emergencia.
5. **Dado** un formulario o un detalle (`/publicar`, `/publicaciones`, `/publicacion/<id>`, `/chat/<id>`,
   `/emergencias/reportar`, `/perfil`, `/actividad`, `/negocios/registrar`), **entonces** no hay barra.
6. **Dado** un enlace viejo a `/ayuda`, `/comunidad` o `/negocios`, **cuando** se abre, **entonces** llega a
   `/marketplace`, `/` o `/explorar` respectivamente, sin pantalla en blanco.
7. **Dado** Marketplace, **cuando** toco «Necesito algo», «Objetos y favores» o «Animales», **entonces** se abre
   `/publicaciones` con el mismo filtro que antes abría `/explorar`.
8. **Dado** el Inicio, **cuando** toco los accesos que hoy llevan a Comunidad, Negocios, Ayuda o «Ver todo»,
   **entonces** llevan a la ruta nueva equivalente (`/`, `/explorar`, `/marketplace`, `/publicaciones`).
9. **Dado** que ya no existe el botón flotante de chat, **entonces** no aparece en ninguna pantalla y Mensajes se abre
   desde la pestaña Chat (y sigue en el menú ☰).
10. **Dado** el menú ☰, **entonces** incluye «Mi negocio / Registrar negocio» (antes estaba en la pestaña Negocios).
11. **Dado** el recorrido guiado (`features/tour`), **entonces** cada paso apunta a un botón que existe en la
    navegación nueva y el recorrido termina sin quedarse esperando un botón que ya no está.
12. **Dado** la letra del sistema al máximo, **entonces** las 5 etiquetas se leen completas (sin «…») y cada
    pestaña mide al menos 48 dp de alto.
13. **Dado** el lector de pantalla, **entonces** cada pestaña se anuncia como «pestaña», con su nombre y su
    descripción (`a11y`), y su estado seleccionado.

## Alcance
- **Toca:**
  - `src/features/shell/sections.ts`: `SectionId = 'inicio' | 'eventos' | 'explorar' | 'marketplace' | 'chat'`,
    `BAR_ITEMS`, `ROOT_PATHS` y una función nueva `resolveBar(pathname): { active: SectionId | null } | null`
    (`null` = sin barra; `{ active: null }` = barra sin resaltar, solo en Emergencia). `resolveSection` se elimina o
    pasa a envolver a `resolveBar`.
  - `src/features/shell/sections.test.ts` (se reescribe **primero**, en rojo).
  - `src/features/shell/SectionBar.tsx`: usar `resolveBar`; quitar el caso `danger`/`emprendimientos`
    (`flex-[1.5]`); comentario actualizado.
  - `src/features/shell/ProfileDrawer.tsx`: entrada de negocio.
  - `src/app/(tabs)/_layout.tsx`, nuevos `eventos.tsx`, `marketplace.tsx`, `publicaciones.tsx`; `explorar.tsx` pasa
    a `BusinessesScreen`; `ayuda.tsx`, `comunidad.tsx`, `negocios.tsx` pasan a `<Redirect>`; `mensajes.tsx` como
    raíz (cabecera de sección, sin `BackHeader`).
  - `src/app/_layout.tsx`: quitar `<ChatFab />`. `features/chat/ChatFab.tsx` se borra si no quedan referencias.
  - `src/features/home/EventsScreen.tsx` (provisional; se muda a `features/events` en 13d) y su export.
  - Rutas internas: `features/help/HelpHomeScreen.tsx` (3 enlaces), `features/home/HomeScreen.tsx` (7 enlaces),
    `features/explore/ExploreScreen.tsx` (enlace a `/negocios`).
  - `src/features/tour/steps.ts` y `steps.test.ts`: pasos sobre `tab-eventos`, `tab-explorar`,
    `tab-marketplace`, `header-sos` y `tab-chat` (en vez de `chat-fab`).
- **No debe cambiar:** el contenido y la lógica de las pantallas (solo títulos y destinos de enlaces), el stack
  `/emergencias` y su `EmergencyHeader`, el SOS de la cabecera, el outbox, el servidor, el chat y sus estados.
- **Reglas de arquitectura:** import solo por `index.ts`; `shared/` no importa `features/`; sin ciclos
  (`npm run arch:check`). Si `EventsScreen` necesita algo de `home`, vive en `home` hasta 13d.
- **Antes de `typecheck`:** correr `npx expo start` una vez para regenerar los tipos de rutas.

## Pruebas
- **Automáticas (se escriben primero):**
  - `sections.test.ts`:
    - `resolveBar('/')` → `{ active: 'inicio' }`; `/eventos` → `eventos`; `/explorar` → `explorar`;
      `/marketplace` → `marketplace`; `/mensajes` → `chat`.
    - `/emergencias`, `/emergencias/tablero`, `/emergencias/recursos`, `/emergencias/mis-reportes` →
      `{ active: null }`.
    - `/publicar`, `/publicaciones`, `/publicacion/demo-p1`, `/chat/x`, `/emergencias/reportar`, `/perfil`,
      `/actividad`, `/negocios/registrar` → `null`.
    - Rutas viejas (`/ayuda`, `/comunidad`, `/negocios`) → `null` (redirigen antes de pintar).
    - `BAR_ITEMS`: 5 claves únicas, en el orden `inicio, eventos, explorar, marketplace, chat`, cada una con `href`
      igual a su ruta raíz y `a11y` no vacío; ninguna es `emergencia`.
    - `ROOT_PATHS` contiene las 5 raíces y `/emergencias`, y no contiene rutas viejas.
  - `tour/steps.test.ts`: cada `target` de un paso es `tab-<key>` de una pestaña existente, `header-sos` o `null`;
    cada `path` es una raíz de `ROOT_PATHS` o `null`.
- **Manuales (Expo Go, celular Android):**
  - Recorrer las 5 pestañas y volver; SOS desde cada una; salir de Emergencia por la barra.
  - Abrir con `npx uri-scheme open yunta://ayuda --android` (y `comunidad`, `negocios`): debe redirigir.
  - Marketplace → «Objetos y favores» y «Animales» → filtro correcto en `/publicaciones`.
  - Recorrido guiado completo desde el menú ☰.
  - Letra al máximo + TalkBack sobre la barra.
  - Flujo de Rosa (SPEC-010) sin cambios: la navegación nueva no debe afectarlo.

## Notas de accesibilidad y privacidad
- Las pestañas usan ícono + texto; la activa se marca con fondo, ícono relleno **y** `selected` (no solo color).
- Emergencia nunca queda a más de un toque (SOS) y su barra de salida no se bloquea.
- No se guarda ni sube ningún dato nuevo. `lastSection` / `useBarStore` siguen igual salvo por la visibilidad.

# SPEC-055 — «Atrás» cae al inicio de su sección

- **Estado:** borrador (rama `shay-spec-055-atras-a-la-seccion`, 8 nov 2026). Pasa a «implementada» con `npm run check` en
  verde y probada en Expo Go.
- **Dueño / revisor:** Shay / _(pendiente: otra persona del equipo)_
- **Sprint:** Etapa 13 (navegación), historia **S13-9**. Decisión: ADR 0009.
- **Depende de:** SPEC-054 (la rama se apila sobre `shay-spec-054-pulido-visual`; no comparten archivos).

## Qué y por qué
Hoy el botón «Atrás» (y la flecha de las cabeceras) hace `router.back()` y, si **no hay pantalla anterior** (la app se abrió
desde una notificación o un enlace, o se recargó), lleva siempre al **Inicio general** (`/`). Quien estaba en una publicación,
un evento o un chat se queda sin ubicación. El centro de Emergencia ya resuelve esto con su propia cabecera (cae a
`/emergencias`); esta spec lo generaliza: sin historial, «Atrás» lleva al **inicio de la sección** a la que pertenece la
pantalla.

**No cambia** el caso normal: con historial, «Atrás» vuelve a la pantalla anterior (de donde venías), como siempre.

## Sección de cada pantalla (a dónde cae «Atrás» sin historial)

| Pantalla | Cae a | Sección |
|---|---|---|
| `/publicacion/[id]`, `/publicaciones`, `/publicar` | `/ayuda` | Ayuda |
| `/negocios/registrar` | `/explorar` | Negocios |
| `/evento/[id]`, `/eventos/crear` | `/eventos` | Comunidad |
| `/chat/[id]` | `/mensajes` | Chat |
| `/emergencias/…` (todas) | `/emergencias` | Emergencia |
| `/fondos/…`, `/camaras…`, `/perrito/[slug]`, `/vecino/[id]`, `/asistente`, `/conversacion`, `/actividad`, `/perfil` y cualquier otra | `/` | Inicio (no pertenecen a una pestaña) |

## Criterios de aceptación
1. **Dado** una pantalla con historial, **cuando** toco «Atrás» o la flecha, **entonces** vuelvo a la pantalla anterior (sin cambios).
2. **Dado** una pantalla de la tabla **sin historial**, **cuando** toco «Atrás» o la flecha, **entonces** llego al inicio de su
   sección (p. ej. desde un evento a Comunidad), no al Inicio general.
3. **Dado** una pantalla que no pertenece a una pestaña (p. ej. un fondo o el asistente) sin historial, **entonces** «Atrás» va
   al Inicio, como hoy.
4. **Dado** cualquier ruta, **entonces** la sección se calcula con una función pura (`backFallbackFor`) con prueba; los tres
   encabezados con botón de volver usan el mismo hook (`useGoBack`) y ya no repiten la regla.
5. **Dado** el centro de Emergencia, **entonces** su «Atrás» se comporta igual que antes (`/emergencias`).
6. **Dado** el lector de pantalla, **entonces** la etiqueta del botón no cambia.

## Alcance
- **Toca:** `src/shared/nav/backFallback.ts` (+ `backFallback.test.ts`), `src/shared/nav/useGoBack.ts`,
  `src/shared/ui/ScreenHeader.tsx`, `src/features/shell/BackHeader.tsx`,
  `src/features/emergency/components/EmergencyHeader.tsx`.
- **No debe cambiar:** el caso con historial, los botones «Listo»/«Volver al fondo»/«Volver» que cierran flujos
  (`router.back()` directo), el botón «atrás» de Android y el gesto del sistema, las rutas, la barra de pestañas y el SOS.
- **Reglas de arquitectura:** `shared/` no importa de `features/` (la tabla vive en `shared/nav`); sin ciclos.

## Pruebas
- **Automáticas (primero, en rojo):** `src/shared/nav/backFallback.test.ts` — una prueba por fila de la tabla, rutas
  anidadas (`/fondos/aportar/x`, `/emergencias/estado/x`), raíz `/` y ruta desconocida → `/`.
- **Manuales (Expo Go):** abrir el enlace directo `exp://<host>/--/eventos/crear` (sin historial) y tocar «Atrás» → Comunidad;
  abrir una pantalla desde el Inicio y volver → regresa al Inicio (con historial); en Emergencia, «Atrás» sigue igual.

## Notas de accesibilidad y privacidad
Sin cambios en etiquetas, tamaños ni datos. No agrega permisos.

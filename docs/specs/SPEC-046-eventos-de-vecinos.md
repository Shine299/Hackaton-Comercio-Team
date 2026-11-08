# SPEC-046 — Eventos creados por vecinos con «Voy»

- **Estado:** implementada en la app (8 nov 2026); `npm run check` en verde. **Falta:** aplicar
  `20261110000009_neighbor_events.sql` en Supabase (no se ha ejecutado contra ninguna base), las pruebas de base de datos
  y probar con 2 celulares
- **Dueño / revisor:** … / …
- **Sprint:** Etapa 13 — historia S13-4 (13d). Plan: `docs/04_tecnico/plan_etapa13_comunidad_primero.md` §4
- **Amplía:** SPEC-028 (eventos oficiales de solo lectura). Decisión D7: cualquier vecino con cuenta crea eventos.

## Qué y por qué
Audio 2 del feedback: «eventos que la gente va creando… puedes hacer RSVP, registrarte… todo ahí dentro». Hoy la
pestaña Eventos solo lista los eventos oficiales (`sector_events`). Ahora un vecino crea un evento en 2 pasos y los
demás marcan **«Voy»**. Nadie ve quién va: solo el número.

## Criterios de aceptación
1. **Dado** la pestaña Eventos, **entonces** los eventos se agrupan en **Hoy**, **Esta semana** y **Más adelante**,
   con un botón «Crear evento».
2. **Dado** «Crear evento» (con cuenta), **cuando** completo título (3–120), descripción (≤ 400), día (hoy a 30 días),
   hora y lugar, **entonces** el evento aparece al instante en la lista con «Guardado en tu teléfono» y sale por la cola;
   cuando el servidor lo confirma, lo ven los demás.
3. **Dado** el tipo de lugar **«Lugar público»** (parque, local comunal, bodega), **entonces** se muestra su nombre;
   **dado «En una casa»**, solo se pide y se muestra una **zona aproximada** («Cuadra 5 de Arequipa») y se avisa que
   no ponga la dirección exacta.
4. **Dado** un evento de otro vecino, **cuando** toco «Voy» (con cuenta), **entonces** veo «Vas · guardado en tu
   teléfono» al instante; el **conteo** solo sube cuando responde el servidor (nunca se simula).
5. **Dado** que ya marqué «Voy», **cuando** toco «Ya no voy», **entonces** se retira mi asistencia (mismo flujo).
6. **Dado** 2 cuentas, **cuando** A crea un evento y B marca «Voy», **entonces** A ve el conteo subir en ≤ 10 s.
7. **Dado** cualquier evento, **entonces** nadie ve la lista de asistentes, ni el organizador: solo «N vecinos van».
8. **Dado** mi evento, **entonces** no tengo «Voy» sino «Cancelar evento» (con confirmación); al cancelarse deja de
   verse para los demás.
9. **Dado** un evento oficial (`sector_events`), **entonces** se ve con su organizador y sin «Voy» («Evento abierto,
   no necesitas registrarte»).
10. **Dado** que no hay servidor, **entonces** se ven los eventos de demostración (con «DATO DE DEMO») y «Voy» queda
    solo en el teléfono; los eventos que creo quedan «Guardado en tu teléfono».

## Servidor — `supabase/migrations/20261110000009_neighbor_events.sql`
- `events (id uuid pk —del cliente—, organizer_id, sector_id, title, body, starts_at, venue_kind
  ('public_place'|'approx_zone'), venue_name, status ('active'|'cancelled'), created_at)` y
  `event_rsvps (event_id, user_id, created_at, pk (event_id, user_id))`. RLS activado **sin políticas**: todo por funciones.
- `sector_events_v2(p_sector)` (anon y authenticated): oficiales + de vecinos activos y vigentes (hasta 2 h después de
  empezar), con `going_count`, `i_am_going`, `is_mine` y el **nombre público** del organizador. Nunca `user_id`.
- `create_event(...)` idempotente por id; fecha entre ahora − 1 h y + 60 días; máx. 5 eventos por persona por día.
- `rsvp_event(p_event_id, p_going)` (upsert/borrado; no en eventos cancelados ni propios) y `cancel_my_event(p_event_id)`.

## Cliente
- Feature nueva **`features/events`**: se mudan `EventCard`, `sectorEvents` (+ prueba) y `EventsScreen` desde `home`.
- Lógica pura (`events/logic.ts`): `groupEventsByWhen`, `mergeEvents` (servidor + creados en el teléfono + mi intención
  de «Voy»), `canRsvp`, `startsAtFrom(día, hora, now)`; esquema Zod `createEventSchema(now)`.
- `events/localStore.ts`: eventos creados y «Voy» pendientes, con su estado de envío.
- Outbox: `event.create`, `event.rsvp`, `event.cancel` (prioridad `normal`) + transporte + conciliación.
- Pantallas: `EventsScreen`, `EventDetailScreen` (`/evento/[id]`), `CreateEventScreen` (`/eventos/crear`, 2 pasos,
  RHF + Zod; día y hora con chips, sin dependencias nuevas).
- Si la migración aún no está aplicada, la lista sigue leyendo `sector_events` (como en SPEC-028).

## Pruebas
- **Automáticas (primero):** `events/logic.test.ts` y `events/schema.test.ts` (criterios 1–5, 7–10 en lo puro).
- **Base de datos (transacción que se deshace):** B ve el evento de A sin `organizer_id`; `rsvp_event` dos veces no
  duplica; A no puede marcar «Voy» en el suyo; un evento cancelado no aparece; el 6.º evento del día falla.
- **Manuales (2 celulares):** criterios 2, 4, 6, 8; letra al máximo en el formulario.

## Fuera de alcance (13f o después)
Reportar un evento, «Escribir al organizador», editar un evento, foto del evento.

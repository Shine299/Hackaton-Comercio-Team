# SPEC-045 — Chat directo desde Ayuda

- **Estado:** implementada en la app (8 nov 2026); `npm run check` en verde. **Falta:** aplicar la migración
  `20261110000008_open_chat.sql` en Supabase (no se ha ejecutado contra ninguna base), las pruebas de base de datos y
  probar con 2 celulares
- **Dueño / revisor:** … / …
- **Sprint:** Etapa 13 — historia S13-3 (13c). Plan: `docs/04_tecnico/plan_etapa13_comunidad_primero.md` §4
- **Reemplaza:** criterios 1–3 de SPEC-025 (el chat ya no espera a que acepten una solicitud). Decisión D1.

## Qué y por qué
El feedback (audio 4): en Ayuda (antes «Marketplace») «no se maneja como un request aparte: si estás interesado, vas al chat».
Hoy hay que pedir contacto y esperar que el dueño acepte. Ahora **«Escribir» abre la conversación al instante**.
Para compensar el riesgo de mensajes no deseados: cuenta vecinal obligatoria, **bloquear**, **reportar mensaje** y
un **límite de mensajes por minuto**.

## Criterios de aceptación
1. **Dado** una publicación activa de otra persona, **cuando** toco «Escribir» (con cuenta), **entonces** se abre el
   chat de esa publicación; sin cuenta, primero se pide crear la cuenta vecinal (solo nombre público).
2. **Dado** que ya escribí sobre esa publicación, **cuando** toco «Escribir» otra vez, **entonces** se abre la
   **misma** conversación (nunca dos por persona y publicación).
3. **Dado** mi propia publicación, o una pausada, cerrada o vencida, **entonces** no aparece «Escribir».
4. **Dado** una publicación de demostración (o la app sin servidor), **cuando** toco «Escribir», **entonces** se abre
   un chat **de demostración** local con esa persona ficticia, marcado «DATO DE DEMO», con respuestas guionadas;
   nunca se simula «recibido».
5. **Dado** el servidor, **cuando** abro un chat real, **entonces** el otro vecino lo ve en su pestaña Chat y los
   mensajes llegan en ≤ 8 s (sondeo de 4 s, sin cambios de SPEC-025).
6. **Dado** un mensaje que envío, **entonces** se ve «Guardado en tu teléfono» hasta que el servidor responde
   (sin cambios: SPEC-025 criterio 4).
7. **Dado** un chat, **cuando** toco «Bloquear» y confirmo, **entonces** desaparece la caja para escribir, se ve
   «Bloqueaste a este vecino» y el servidor rechaza los mensajes de cualquiera de los dos en esa relación; no se
   puede abrir otro chat entre los dos.
8. **Dado** un mensaje de la otra persona, **cuando** lo mantengo presionado y confirmo «Reportar», **entonces** el
   reporte sale por la cola (estado honesto) y el mensaje queda marcado «Reportado». No puedo reportar mis mensajes.
9. **Dado** más de 30 mensajes en un minuto de la misma persona, **entonces** el servidor rechaza el resto (la cola
   reintenta después).
10. **Dado** la pestaña Chat, **entonces** no hay sección «Por responder»; se ve el aviso «Yunta conecta vecinos; no
    verifica a las personas ni reemplaza al 105» y, en cada chat, «No compartas teléfono, dirección exacta ni datos
    sensibles».
11. **Dado** el Inicio, **entonces** cada tarjeta del feed (que no sea mía) tiene un botón «Escribir» aparte de
    «Ver detalle».

## Servidor — `supabase/migrations/20261110000008_open_chat.sql`
- `conversations.request_id` pasa a ser opcional (las conversaciones viejas, creadas al aceptar, se conservan).
- `start_conversation(p_post_id uuid) returns uuid` (security definer, solo `authenticated`): busca la conversación de
  quien llama con ese post; si no existe la crea. Falla si la publicación no existe, no está activa, es de demo (sin
  dueño real), es propia, o hay bloqueo entre los dos. Usa un candado por (post, persona) para no duplicar.
- `blocks (blocker_id, blocked_id, created_at)` sin políticas (solo funciones). `block_in_conversation(p_conversation_id)`.
- `message_reports (id, message_id, reporter_id, reason, created_at)` sin políticas. `report_message(p_id, p_message_id,
  p_reason)`: solo participantes, nunca el propio mensaje; idempotente por `p_id` (id del cliente).
- `messages_insert`: además exige que no haya bloqueo entre los participantes.
- Disparador `messages_rate_limit`: máximo 30 mensajes por persona por minuto.
- `my_conversations()` agrega `blocked boolean` (hay bloqueo en cualquier sentido). Nunca devuelve ids de usuarios.
- `accept_request`, `decline_request` y `pending_requests` **se mantienen** (clientes viejos), pero la app deja de usarlas.

## Cliente
- `chat/logic.ts`: `canStartChat(post)` (activa y no propia) y `chatModeFor(post, serverConfigured)` →
  `'server' | 'demo'` (demo si no hay servidor, si la publicación es de demo o su id no es UUID);
  `demoConversationIdFor(postId)`. Se retira `canOpenChat`.
- `chat/localMessages.ts`: conversaciones de demo abiertas, bloqueos y mensajes reportados (en el teléfono).
- `chat/hooks.ts`: `useStartChat()`; se retiran `usePendingRequests` y `useRespondToRequest`.
- Outbox: tipos nuevos `chat.block` y `chat.report` (prioridad `normal`) en `outbox/types.ts` y
  `sync/supabaseTransport.ts`.
- `chat/StartChatButton.tsx` (exportado). **Inyección:** `posts` no puede importar `chat` (ciclo
  `posts → chat → shell → posts`), así que la ruta `src/app/publicacion/[id].tsx` le pasa a `PostDetailScreen` la prop
  `renderContact(post)`. `home/FeedCard` sí importa `chat` (no hay ciclo).
- `PostDetailScreen`: se quitan `ContactRequestSheet`, la tarjeta «Solicitud enviada» y el texto «el contacto se abre
  cuando el negocio acepta». `ContactRequestSheet.tsx` se borra. `useContactStore` se queda (historial en Actividad y
  elementos viejos de la cola `interaction.request`).

## Pruebas
- **Automáticas (primero):** `chat/logic.test.ts` → `canStartChat`, `chatModeFor`, `demoConversationIdFor`
  (+ las de `checkMessageBody`, `mergeMessages`, `demoReply` siguen).
- **Base de datos:** transacción que se deshace (igual que SPEC-025): A publica; B `start_conversation` dos veces →
  mismo id; A no puede `start_conversation` en su post; B bloquea → A no puede insertar mensajes; 31 mensajes en un
  minuto → el 31.º falla; `report_message` del propio mensaje falla.
- **Manuales (2 celulares):** criterios 1, 2, 5, 7, 8; modo avión con un mensaje en cola.

## Límites
Abrir una conversación real necesita conexión (la crea el servidor); sin red se muestra un error claro y nada se
pierde. Notificación local de mensaje nuevo y contador de no leídos en la pestaña Chat quedan para 13f.

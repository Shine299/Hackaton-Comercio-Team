# SPEC-048 — Pulido de la Etapa 13: chat sin leer, foto de perfil y documentación

- **Estado:** implementada (8 nov 2026); `npm run check` en verde. **Falta:** aplicar `20261110000010_chat_last_from_me.sql`
  y verificar con 2 celulares (criterios 2, 4, 6 y 7)
- **Dueño / revisor:** … / …
- **Sprint:** Etapa 13 — historia S13-6 (13f). Plan: `docs/04_tecnico/plan_etapa13_comunidad_primero.md` §4

## Qué y por qué
Cerrar lo que quedó pendiente de 13a–13e: saber que llegó un mensaje sin entrar al Chat, poder poner una foto propia
(opcional) y dejar documentada la navegación nueva.

## Criterios de aceptación
### Chat sin leer (SPEC-045, pendiente)
1. **Dado** una conversación cuyo último mensaje es **de la otra persona** y es posterior a la última vez que la abrí,
   **entonces** cuenta como «sin leer»; mis propios mensajes nunca cuentan.
2. **Dado** conversaciones sin leer, **entonces** la pestaña **Chat** muestra un número (máx. «9+») y lo anuncia el
   lector («Chat, 2 sin leer»); en la bandeja, la conversación se marca con un punto y el texto «Nuevo».
3. **Dado** que abro la conversación, **entonces** deja de contar como sin leer.
4. **Dado** que llega un mensaje nuevo de otra persona mientras la app está abierta y **no** estoy en ese chat,
   **entonces** llega una **notificación local**; al tocarla se abre ese chat. Lo que ya estaba sin leer al abrir la
   app no notifica. Sin permiso, la app sigue igual.
5. **Dado** la primera vez con esta versión, **entonces** las conversaciones viejas no aparecen como sin leer.

### Foto de perfil (D2)
6. **Dado** Perfil, **cuando** elijo «Poner foto» (opcional), **entonces** mi avatar la muestra en la cabecera y en el
   perfil; se quita con «Quitar foto». Se elige sin EXIF.
7. **Dado** la foto, **entonces** se queda **solo en este teléfono**: los vecinos siguen viendo mis iniciales, y la
   pantalla lo dice. Si el sistema borra el archivo, el avatar vuelve a las iniciales (sin hueco).

### Documentación
8. ADR `docs/adr/0006-navegacion-comunidad-primero.md`; `README.md` y `context.md` con la navegación nueva; notas en
   SPEC-014, SPEC-025 y SPEC-028; `sprints.md` con el estado de la Etapa 13.

## Servidor — `supabase/migrations/20261110000010_chat_last_from_me.sql`
`my_conversations()` agrega `last_from_me boolean` (si el último mensaje lo escribió quien consulta). Migración nueva
(no se edita la 08 por si ya está aplicada). Sigue sin devolver ids de usuarios.

## Cliente
- `chat/unread.ts` (puro): `unreadConversationIds(conversations, lastReadAt, since)` y `freshUnread(prev, next)`.
- `chat/localMessages.ts`: `lastReadAt`, `readSince`, `openConversationId`, `markRead`.
- `chat/ChatBadgeSync.tsx`: copia el contador a `shared/nav/chatBadgeStore` (la barra está en `shell`, que no puede
  importar `chat`) y dispara la notificación con `notifyLocal` de `features/notifications`.
- `session`: `photoUri` + `setPhoto`; `Avatar` vuelve a iniciales si la imagen falla.

## Pruebas
- **Automáticas (primero):** `chat/unread.test.ts` (criterios 1, 3, 5 y qué es «nuevo» para notificar).
- **Manuales:** 2 celulares (criterios 2 y 4); foto con y sin permiso de galería (6 y 7); TalkBack en la barra.

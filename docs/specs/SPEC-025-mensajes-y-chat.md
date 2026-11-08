# SPEC-025 — Mensajes y Chat

- **Estado:** hecha. Migración `20261109000006_chat.sql` aplicada en el proyecto (9-nov-2026) y RLS comprobada con una transacción de prueba que se deshace (no hay plan Pro para ramas); falta probar con 2 teléfonos
- **Sprint:** 2 (S2-7)
- **Actualización:** los criterios 1–3 (aceptar la solicitud antes del chat) los reemplaza SPEC-045 (chat directo).

## Qué y por qué
Que dos vecinos coordinen un préstamo o ayuda por mensajes, sin intercambiar teléfono ni dirección, y solo cuando el dueño de la publicación aceptó la solicitud de contacto.

## Criterios de aceptación
1. **Dado** que alguien pidió contacto en mi publicación, **cuando** abro Mensajes, **entonces** veo «Por responder» con su nombre público y su mensaje, y puedo **Aceptar** o **Rechazar**.
2. **Dado** que acepto, **entonces** se abre la conversación para los dos (una sola por solicitud) y me lleva al chat; quien pidió la ve en su bandeja.
3. **Dado** que la solicitud no está aceptada, **entonces** no existe chat ni se puede escribir (`canOpenChat`).
4. **Dado** un mensaje, **cuando** lo envío, **entonces** aparece al instante con «Guardado en tu teléfono» y sale por la cola de envío; cuando el servidor lo confirma, deja de mostrarse como guardado. Sin red, queda en la cola.
5. **Dado** el mismo mensaje reenviado, **entonces** no se duplica (el id lo genera el cliente).
6. **Dado** un mensaje vacío o de más de 500 caracteres, **entonces** se rechaza con un texto claro.
7. **Dado** que no hay servidor, **entonces** Mensajes ofrece una conversación de **demostración** con respuestas guionadas, marcada «DATO DE DEMO», y nunca se simula «recibido».
8. **Dado** el chat, **entonces** se ve siempre el aviso «No compartas teléfono, dirección exacta ni datos sensibles».

## Privacidad y seguridad
- Solo nombre público; nada de teléfono/correo. RLS: solo los dos participantes leen y escriben; nadie puede escribir como otra persona.
- Las conversaciones solo se crean con `accept_request` (security definer); las funciones solo las ejecuta `authenticated`.

## Pruebas
- Automáticas: `canOpenChat`, `checkMessageBody`, `mergeMessages`, `demoReply` (`chat/logic.test.ts`).
- Manuales (2 dispositivos): pedir contacto → aceptar → intercambiar mensajes → modo avión → reconectar.
- Base de datos: scripts SQL de RLS contra una **rama** de Supabase (nunca producción) y `get_advisors`.

## Límites conocidos
Actualización por consulta cada 4 s (no tiempo real). Sin reporte/bloqueo de mensajes todavía. El nombre de quien pidió contacto depende de que tenga perfil público.

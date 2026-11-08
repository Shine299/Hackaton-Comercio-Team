# ADR 0006 — Navegación «comunidad primero» y Emergencia fuera de la barra

- **Estado:** aceptada
- **Fecha:** 2026-11-08
- **Relacionada con:** ADR 0001 (features verticales y Expo Router), SPEC-043 a SPEC-048 (Etapa 13)

## Contexto

El feedback de UX (4 notas de voz) pidió que Yunta se sienta como una comunidad, con una barra de 5 pestañas:
**Inicio (feed) · Eventos · Explorar · Marketplace · Chat**. La barra anterior era Inicio · Comunidad · Negocios ·
Emergencia · Ayuda, y el Inicio no la mostraba. Con 5 pestañas nuevas, **Emergencia ya no cabe en la barra**, y
Emergencia es la función que nunca puede quedar escondida.

## Decisión

1. Una sola barra de 5, visible en las 5 raíces, también en el Inicio (`shell/sections.ts`, `resolveBar`).
2. **Emergencia sale de la barra** y queda siempre a un toque:
   - botón **SOS** en la cabecera de todas las raíces (`SectionHeader`), sin cuenta;
   - tarjeta fija **«¿Emergencia?»** en el Inicio, arriba del feed;
   - el stack `/emergencias` no cambia, y en sus raíces la barra principal se ve **sin pestaña resaltada** para que
     siempre haya salida (el centro de emergencia no tiene otro botón para volver).
3. Ayuda pasa a llamarse **Marketplace**; Comunidad deja de ser pestaña (su feed se mueve al Inicio) y Negocios pasa a
   Explorar. Las rutas viejas (`/ayuda`, `/comunidad`, `/negocios`) **redirigen**, para no romper enlaces ni
   notificaciones ya programadas.
4. Perfil, Guardados y Ajustes siguen en el menú lateral; la cabecera muestra el avatar del usuario.
5. El chat se abre con «Escribir», sin solicitud previa (SPEC-045), con bloqueo, reporte y límite de envío.

## Consecuencias

- Emergencia pierde una entrada visible abajo. Se compensa con el SOS y la tarjeta del Inicio; hay que verificarlo
  con TalkBack y letra grande (SPEC-013) antes de la final.
- `lastSection` deja de hacer falta: con una barra única no hay que adivinar de qué sección se llegó.
- `posts` no puede importar `chat` (ciclo `posts → chat → shell → posts`): el botón «Escribir» se **inyecta** desde la
  ruta (`renderContact`), igual que el mapa en Emergencia.
- El contador de la pestaña Chat vive en `shared/nav/chatBadgeStore`, porque `shell` no puede importar `chat`.

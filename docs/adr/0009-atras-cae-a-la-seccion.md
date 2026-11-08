# ADR 0009 — «Atrás» sin historial cae al inicio de la sección

- **Estado:** propuesta (rama `shay-spec-055-atras-a-la-seccion`)
- **Fecha:** 2026-11-08
- **Spec:** SPEC-055

## Contexto
Tres cabeceras (`ScreenHeader`, `BackHeader`, `EmergencyHeader`) repetían la misma regla: si hay pantalla anterior, volver;
si no, ir al Inicio (`/`), salvo Emergencia, que iba a `/emergencias`. Quien entra por una notificación o un enlace y toca
«Atrás» pierde el contexto.

## Decisión
1. Con historial, «Atrás» **sigue volviendo a la pantalla anterior**.
2. Sin historial, cae al **inicio de la sección** de la pantalla (Ayuda, Negocios, Comunidad, Chat o Emergencia); lo que no
   pertenece a una pestaña cae al Inicio. La tabla vive en una función pura `backFallbackFor(pathname)` en `shared/nav`.
3. Las cabeceras usan un solo hook, `useGoBack()`.
4. **Fuera de esta decisión:** el botón «atrás» de Android y el gesto del sistema (comportamiento nativo) y los botones que
   cierran flujos con `router.back()` directo.

## Alternativas descartadas
- **Siempre a la sección, aunque haya historial:** rompe «volver a donde estaba» (publicación abierta desde el Inicio).
- **Interceptar el botón de Android en cada pantalla:** más código y riesgo de dejar al usuario sin poder salir.

## Consecuencias
- Cada pantalla nueva con botón de volver hereda la regla; si pertenece a una sección, se agrega una fila a la tabla.
- Una sola fuente de verdad para el fallback; `EmergencyHeader` deja de tener su copia.

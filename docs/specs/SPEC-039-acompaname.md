# SPEC-039 — Acompáñame / Llegué bien

- **Estado:** implementada, fase 1 (sin servidor) · plan `docs/plan_integraciones_definitivo.md` §3.6
- **Dueño / revisor:** … / …

## Qué y por qué
Volver de noche, la vecina mayor que sale sola, el chico que regresa del colegio. Eliges vecinos de confianza y
cuánto tardas; si no marcas «Llegué bien» a tiempo, la app te pregunta y te deja avisarles con un toque.
**Sin ubicación en vivo** (regla del proyecto: ubicación siempre aproximada).

## Criterios de aceptación
1. **Dado** Emergencia, **entonces** veo «Acompáñame: llegué bien» con la etiqueta «Nuevo».
2. **Dado** que elijo 1 a 3 vecinos y 10/15/30 min, **cuando** toco «Empezar trayecto», **entonces** veo la cuenta regresiva y la hora de llegada prevista.
3. **Dado** que no elegí a nadie, **entonces** «Empezar trayecto» queda deshabilitado.
4. **Dado** que se cumple el tiempo, **entonces** llega una notificación local «¿Llegaste bien?» (aunque la app esté en segundo plano) y la pantalla muestra «Se cumplió tu tiempo» con «Avisar a mis vecinos».
5. **Dado** «Avisar a mis vecinos», **entonces** se abre compartir (WhatsApp, SMS…) con un mensaje que solo dice el sector, nunca la ubicación.
6. **Dado** «Llegué bien», **entonces** se cancela la notificación y veo «¡Qué bueno que llegaste!».
7. **Dado** que cierro la app a mitad del trayecto, **cuando** la vuelvo a abrir, **entonces** el trayecto sigue.

## Alcance
- **Toca:** `src/features/walk/` (nueva), `src/app/emergencias/acompaname.tsx`, `src/app/emergencias/_layout.tsx`, `EmergencyCenterScreen` (acceso).
- **Fuera de esta fase:** aviso automático a los guardianes por el servidor (push), contactos de confianza reales en el perfil
  (hoy los vecinos son de demostración, con `DemoTag`).

## Pruebas
- Automáticas: `walkState` (en camino / vencido / llegó) y `formatCountdown`.
- Manuales (Expo Go): trayecto de 10 min con la app en segundo plano; aceptar el permiso de notificaciones.

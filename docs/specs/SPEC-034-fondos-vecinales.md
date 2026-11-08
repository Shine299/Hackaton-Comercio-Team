# SPEC-034 — Fondos vecinales con pago simulado

- **Estado:** implementada (fase F1 del plan `docs/plan_integraciones_definitivo.md`)
- **Dueño / revisor:** … / …
- **Sprint:** integraciones

## Qué y por qué
Los vecinos juntan dinero para algo común (cámaras, el perrito del barrio) y hoy lo llevan en un cuaderno.
Yunta muestra cada fondo del sector con su meta, una barra de avance y la rendición de cuentas (gastos con
boleta), y deja aportar. En esta fase el pago es **simulado** y siempre se dice así; la pasarela real llega en SPEC-036.

## Criterios de aceptación

1. **Dado** el fondo «Cámaras para el Jr. Pachacútec» con meta S/ 1 200 y S/ 840 aportados, **cuando** lo veo,
   **entonces** leo «S/ 840 de S/ 1 200 · 70 %» y una barra al 70 % con su texto para lector de pantalla.
2. **Dado** que no tengo cuenta, **cuando** toco «Aportar», **entonces** se abre el registro y no se cobra nada.
3. **Dado** que estoy sin red, **cuando** aporto, **entonces** veo «No se pudo procesar. No se cobró nada.» y la barra no cambia.
4. **Dado** el proveedor simulado, **cuando** aporto S/ 20, **entonces** veo «Procesando…», luego «Aporte confirmado»
   con la etiqueta «Pago simulado», y la barra sube a 71,7 %.
5. **Dado** un monto menor a S/ 1 o mayor a S/ 500, o un número de Yape o código inválido, **cuando** lo ingreso,
   **entonces** el botón queda deshabilitado y el motivo está escrito.
6. **Dado** que toco «Aportar» dos veces o la llamada se repite con la misma clave, **entonces** se registra un solo aporte.
7. **Dado** Comunidad con el filtro «Todo», **cuando** hay un fondo abierto en mi sector, **entonces** veo su tarjeta con la barra.

## Alcance
- **Toca:** `src/features/funds/` (nueva), `src/features/payments/` (nueva), `src/shared/format` (`formatSoles`,
  `formatPercent`), `src/features/home/CommunityScreen.tsx` (tarjeta), rutas `src/app/fondos/…`, `src/app/_layout.tsx`.
- **No debe cambiar:** outbox (los pagos no pasan por él, ADR 0005), `SyncStatusBadge`, SOS sin cuenta.
- **Fuera de esta fase:** tablas en Supabase y pasarela real (SPEC-036), tarjeta de crédito, crear fondos desde la app.
- **Reglas de arquitectura:** `home → funds → payments`, solo por `index.ts`, sin ciclos (`npm run arch:check`).

## Pruebas
- Automáticas: `formatSoles`/`formatPercent`, `fundProgress`, validación del aporte, idempotencia y modo sin red del
  proveedor simulado.
- Manuales (Expo Go): aportar con y sin cuenta, en modo avión, con letra grande y con TalkBack/VoiceOver en la barra.

## Notas de accesibilidad y privacidad
- Estados con texto + icono; la barra tiene `accessibilityRole="progressbar"` y su valor en texto.
- Áreas táctiles ≥ 48 dp. Todo fondo de demostración lleva `DemoTag`.
- El aporte es anónimo por defecto. El número de Yape y el código no se guardan en el teléfono.
- Yunta no guarda dinero: se dice en la pantalla del fondo.

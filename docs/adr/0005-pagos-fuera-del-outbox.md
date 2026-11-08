# ADR 0005 — Los pagos no pasan por el outbox

- **Estado:** aceptada
- **Fecha:** 2026-11-08
- **Relacionada con:** ADR 0002 (offline-first con outbox), SPEC-034 (fondos vecinales)

## Contexto

Todo lo que la persona crea en Yunta (publicaciones, reportes, mensajes) se guarda primero en el teléfono
y el outbox lo reenvía solo cuando vuelve la señal (ADR 0002). Con los aportes a un fondo eso es peligroso:

- Un reintento automático puede **cobrar dos veces**.
- El código de aprobación de Yape **vence en unos 2 minutos**: reenviarlo más tarde siempre fallaría.
- Un pago «guardado en el teléfono» se confundiría con un pago hecho.

## Decisión

1. Los pagos se hacen **solo en línea**, en una sola llamada al proveedor (`PaymentsProvider.charge`).
2. Cada intento lleva una `idempotencyKey` (UUID del cliente). Repetir la llamada con la misma clave devuelve
   el mismo resultado y nunca cobra dos veces; en el servidor será la clave primaria de `fund_contributions`.
3. Sin red o sin respuesta en 20 s, el resultado es `failed` y la app dice **«No se pudo procesar. No se cobró
   nada.»** No se encola nada.
4. Estados propios (`processing | confirmed | failed`), separados de `SyncStatus`. El modo (`mock`, `sandbox`,
   `live`) se muestra aparte como etiqueta: «Pago simulado» / «Pago de prueba».
5. La app nunca muestra «confirmado» sin la respuesta del proveedor. Solo el servidor (Edge Function con la
   llave secreta) puede registrar un aporte confirmado.

## Consecuencias

- Aportar requiere conexión. Ver los fondos no.
- El outbox no tiene tipos de pago; los fondos sí pueden usarlo para acciones sin dinero (crear fondo, gasto).
- Sin pasarela configurada se usa un proveedor simulado (`mock`), marcado siempre como tal.

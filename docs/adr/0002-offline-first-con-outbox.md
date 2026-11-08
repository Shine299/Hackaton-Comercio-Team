# ADR-0002 — Offline-first con cola de salida (outbox)

- **Estado:** aceptada

## Contexto
La app se usa en emergencias y con poca señal. Perder un reporte o prometer «recibido» sin serlo es inaceptable.

## Decisión
- Todo lo que la persona crea se guarda **primero en el teléfono** (Zustand persistido en SQLite kv).
- Las acciones que deben llegar al servidor entran en `outbox` con un id UUID generado en el cliente
  (reintentar nunca duplica) y una prioridad.
- `SyncTransport` es una interfaz; `sync/supabaseTransport` la implementa con Supabase. Sin servidor
  configurado se usa `noServerTransport`, que **no simula éxito**.
- El estado «recibido» solo se muestra tras una respuesta real del servidor (`SyncStatusBadge`); `reconcile`
  trae de vuelta los estados confirmados.

## Consecuencias
- La UI siempre responde, con o sin red; el usuario ve la verdad (guardado vs recibido).
- Más piezas (cola, reconciliación) que probar; se cubren con pruebas de lógica pura y guion manual en modo avión.

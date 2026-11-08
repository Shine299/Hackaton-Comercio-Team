# ADR-0003 — Supabase con autenticación anónima y RLS

- **Estado:** aceptada

## Contexto
Necesitamos backend sin operar servidores y sin pedir datos personales para participar.

## Decisión
- Supabase (Postgres + Auth anónima). El cliente usa solo la clave **anónima** (`EXPO_PUBLIC_SUPABASE_ANON_KEY`);
  nunca la `service_role`.
- **RLS activado en todas las tablas**; la seguridad real vive en políticas SQL, no en el cliente.
- Sin columnas de ubicación precisa: solo `sector_id`. Texto privado, fotos y datos de «vecino vulnerable»
  se quedan en el teléfono.
- Cambios de esquema solo por migraciones versionadas en `supabase/migrations/`.

## Consecuencias
- Cualquier tabla nueva debe nacer con RLS y políticas; revisar con los advisors de Supabase.
- Sin cuenta se puede explorar y reportar una emergencia; participar (publicar, contactar) pide un nombre público.

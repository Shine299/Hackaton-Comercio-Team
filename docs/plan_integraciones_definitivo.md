# Yunta — Plan definitivo de integraciones y diferenciadores

> **Estado:** aprobado para implementar por fases · **Fecha:** 8 nov 2026 · **Final:** 17 nov 2026
> **Reemplaza a:** `plan_integraciones_y_diferenciadores.md` y `plan_integraciones_y_diferenciadores2.md`
> (ambos archivos son **idénticos byte a byte**; este documento es la versión única).
> **Manda sobre este doc:** `CLAUDE.md` (reglas de dependencia y convenciones no negociables) y `AGENTS.md`.

---

## 0. Qué cambia respecto al borrador

El borrador estaba escrito antes de que la app se llamara **Yunta** y antes de varias etapas ya construidas.
Lo contrastamos con el código actual (`main`, commit `cc4625b`) y corregimos lo que habría roto la app o
las reglas del proyecto:

| # | El borrador decía | Problema real en el código | Decisión definitiva |
|---|---|---|---|
| 1 | Nombre «Red Vecinal Solidaria» | La app es **Yunta** (`app.json`) | Todo texto de interfaz dice Yunta. Las claves `rvs.<x>.v1` se mantienen (renombrarlas borraría datos guardados). |
| 2 | Encolar `fund.contribution.intent` en el outbox | El outbox **reintenta** solo. Un pago reintentado = riesgo de doble cobro, y el código de Yape vence en ~2 min | **Los pagos NO pasan por el outbox.** Solo en línea, una sola llamada, con `idempotencyKey` (UUID del cliente). Sin red: «No se pudo procesar. No se cobró nada.» |
| 3 | Estado de pago `sandbox` junto a `confirmed`/`failed` | «Prueba» no es un estado, es un **modo** | `PaymentStatus` = `processing \| confirmed \| failed`; aparte, `mode: 'mock' \| 'sandbox' \| 'live'` → etiqueta visible «Pago de prueba» / «Pago simulado». |
| 4 | Reusar los estados de `SyncStatusBadge` | `SyncStatus` es de la cola offline; mezclarlo con pagos confunde | Tipo y badge propios: `PaymentStatusBadge` (texto + icono), misma regla de oro: **nunca «pagado» sin respuesta del servidor**. |
| 5 | «Llegué bien» comparte **ubicación precisa** con guardianes | Choca con la regla no negociable *«Ubicación siempre aproximada (sector), nunca exacta»* | **v1 sin ubicación en vivo:** temporizador + guardianes + sector aproximado. Si algún día se quiere ubicación precisa, primero un ADR que lo justifique. |
| 6 | Edge Functions en `supabase/functions/` | No existe esa carpeta, y `tsconfig.json` incluye `**/*.ts`: el código Deno **rompería `npm run typecheck`** | Agregar `supabase/functions` al `exclude` de `tsconfig.json` y a los ignores de ESLint/Jest **antes** de crear la primera función. |
| 7 | WhatsApp inserta en `emergency_reports` | `user_id` es `not null` (no hay usuario en WhatsApp), no hay columna de texto ni de origen, y `id` no tiene `default` | Migración nueva: `user_id` nullable, `source text default 'app' check (source in ('app','whatsapp'))`, `summary text`. Inserta solo la Edge Function (service role), siempre con `status='received'`. |
| 8 | Cámara con `react-native-webview` | No está instalada; WebView no existe en la vista web; Android bloquea `http://` en el APK | **Empieza sin dependencias nuevas:** foto fija `/shot.jpg` refrescada con `expo-image` (§3.2). WebView solo como mejora, con `*.web.tsx` de respaldo. |
| 9 | «Supabase Realtime» para la barra | La app aún **no usa Realtime** (no hay `.channel(` en `src/`) | v1: React Query con `refetchInterval` (5 s) en la pantalla del fondo. Realtime es mejora opcional, no bloqueante. |
| 10 | Rutas `src/features/emergency/walk-home/` | Las features son carpetas planas con un `index.ts` | Feature propia `src/features/walk/`; la ruta vive en `src/app/emergencias/acompaname.tsx` (no es pestaña nueva). |
| 11 | Pitch, guion de demo y referentes *Smart Cities* | El foco es **100 % la app** | Fuera de este doc: solo se planifica lo que se construye en la app. |
| 12 | Juntas (pozo rotativo) | Regulación SBS + mucha lógica | **Fuera de alcance.** Solo `iniciativa` y `animal`. |

---

## 1. Qué construimos (y en qué orden)

Regla: **mejor 2 cosas funcionando en el celular que 6 a medias.** Cada fase deja la app en verde
(`npm run check`) y usable aunque la siguiente no llegue.

| Fase | Funcionalidad | Spec | Depende de | Sin `.env` / sin servidor funciona como… |
|---|---|---|---|---|
| **F0** | Preparación segura (tsconfig, lint, migraciones base) | — | — | Nada cambia para la persona usuaria |
| **F1** | **Fondos vecinales** con barra de avance + pago **simulado** | SPEC-034 | F0 | Fondos demo locales con `DemoTag`, pago «simulado» |
| **F2** | **Cámaras vecinales** (celular → cámara) + capa en el mapa | SPEC-035 | F0 | Cámara demo con imagen fija y `DemoTag` |
| **F3** | **Pago real en sandbox** (Culqi, plan B Mercado Pago) | SPEC-036 | F1 | Sigue usando el proveedor `mock` |
| **F4** | **Reporte por WhatsApp + IA** | SPEC-037 | F0 | No aplica (solo servidor); la app solo muestra la etiqueta «vía WhatsApp» |
| **F5** | **Perrito comunitario** (perfil + fondo `animal` + «Lo vi») | SPEC-038 | F1 | Perfil demo local |
| **F6** | **«Acompáñame / Llegué bien»** (sin ubicación en vivo) | SPEC-039 | — | Temporizador local + notificación local |

> SPEC-030 a SPEC-033 ya están reservadas en `sprints.md` (APK, datos demo, regresión, ensayo). Las nuevas
> empiezan en **SPEC-034**. Cada una se escribe con `docs/specs/_plantilla.md` antes de codificar.

**Recomendación de orden:** F0 → F1 → F2 (las dos más visibles y sin dependencias externas) → F3 → F4.
F5 y F6 solo si sobra tiempo después de la regresión del APK (SPEC-032).

---

## 2. F0 — Preparación para no romper nada

Antes de cualquier funcionalidad, en un solo commit:

1. **`tsconfig.json`** → `"exclude": ["node_modules", "scripts", "supabase/functions"]`.
2. **`eslint.config.js`** → ignorar `supabase/functions/**`.
3. **Jest** → `testPathIgnorePatterns` con `/supabase/functions/` (las funciones Deno se prueban aparte).
4. **ADR 0005** `docs/adr/0005-pagos-fuera-del-outbox.md`: por qué los pagos son solo en línea e idempotentes.
5. Verificar: `npm run check` en verde **sin** haber agregado código nuevo.

Reglas que aplican a todo lo demás:

- Rutas en `src/app/…` **delgadas**: solo re-exportan la pantalla de `@/features/<x>`.
- Entre features **solo por `index.ts`**. `sync/` sigue siendo el único que conoce Supabase + outbox + features.
- Dinero siempre en **céntimos enteros** (`amountCents: number`), formateo en `src/shared/format`
  (`formatSoles(cents)` → «S/ 20,00»), con prueba.
- Paquetes nuevos **solo** con `npx expo install`. Nada de NativeWind se toca.
- Todo dato ficticio con `DemoTag`. Áreas táctiles ≥ 48 dp, `accessibilityLabel`/`Role`, estado con texto + icono.
- Sin secretos en el cliente: `sk_test`, token de WhatsApp y llaves de IA viven **solo** como secretos de Edge Functions.

---

## 3. Diseño de cada funcionalidad

### 3.1 F1 — Fondos vecinales (SPEC-034)

**Qué es:** una «chanchita» del sector con meta, barra de avance y rendición de cuentas (gastos con boleta).
Ver no requiere cuenta; **aportar sí** (`useRegistrationGate`).

**Código**

```
src/features/funds/
  types.ts            Fund, FundKind ('iniciativa' | 'animal'), Contribution, Expense
  progress.ts         fundProgress(fund, contributions) → { raisedCents, pct, contributors, daysLeft }  (+ test)
  demoFunds.ts        «Cámaras Jr. Pachacútec» etc., isDemo: true
  FundCard.tsx        barra con texto («S/ 840 de S/ 1 200 · 70 %»), no solo color
  FundDetailScreen.tsx
  ContributeSheet.tsx montos rápidos (S/ 10, 20, 50) + otro; llama a PaymentsProvider
  index.ts
src/features/payments/
  types.ts            PaymentsProvider, PaymentStatus, PaymentMode, ChargeRequest
  mockProvider.ts     aprueba tras ~1,5 s, mode: 'mock'  (+ test)
  culqiProvider.ts    (F3) llama a la Edge Function create-charge
  provider.ts         elige: hay EXPO_PUBLIC_PAYMENTS=culqi + Supabase → culqi; si no → mock
  PaymentStatusBadge.tsx
  index.ts
src/app/fondos/[id].tsx   re-exporta FundDetailScreen
```

**Contrato del proveedor**

```ts
type PaymentMode = 'mock' | 'sandbox' | 'live';
type PaymentStatus = 'processing' | 'confirmed' | 'failed';

interface PaymentsProvider {
  readonly mode: PaymentMode;
  charge(req: {
    idempotencyKey: string;   // UUID del cliente: reintentar nunca cobra dos veces
    fundId: string;
    amountCents: number;      // 100..50_000 (tope Yape S/ 500)
    method: 'yape' | 'card';
    yape?: { phone: string; otp: string };
  }): Promise<{ status: 'confirmed' | 'failed'; chargeId?: string; reason?: string }>;
}
```

**Estados honestos (texto + icono)**

| Estado | Texto | Cuándo |
|---|---|---|
| `processing` | «Procesando tu aporte…» | Desde que se toca «Aportar» hasta la respuesta |
| `confirmed` | «Aporte confirmado por la pasarela» + etiqueta «Pago de prueba» / «Pago simulado» | Solo con respuesta del servidor (o del mock, marcado como simulado) |
| `failed` | «No se pudo procesar. **No se cobró nada.**» | Error, timeout (20 s) o sin red |

**Dónde aparece:** tarjeta en Inicio («Fondos de tu sector») y en Comunidad. Sin pestaña nueva.

**Criterios clave (Dado/Cuando/Entonces) para la spec**
1. Dado un fondo con meta S/ 1 200 y S/ 840 aportados, cuando lo veo, entonces leo «S/ 840 de S/ 1 200 · 70 %» y una barra al 70 %.
2. Dado que no tengo cuenta, cuando toco «Aportar», entonces se abre el registro y no se cobra nada.
3. Dado que estoy sin red, cuando aporto, entonces veo «No se pudo procesar. No se cobró nada.» y la barra no cambia.
4. Dado el proveedor mock, cuando aporto S/ 20, entonces la barra sube y se ve «Pago simulado» con `DemoTag`.
5. Dado un monto mayor a S/ 500 con Yape, cuando lo ingreso, entonces el botón queda deshabilitado con el motivo escrito.

### 3.2 F2 — Cámaras vecinales (SPEC-035)

**Qué es:** un celular viejo con la app **IP Webcam** (Android) apuntando a la calle; los vecinos del sector
lo ven desde Yunta. Cámaras solo hacia espacios comunes, sin grabación.

**Estrategia sin romper la app (dos niveles)**

| Nivel | Cómo | Dependencias nuevas | Funciona en |
|---|---|---|---|
| **A (primero)** | `expo-image` mostrando `http://IP:8080/shot.jpg?t=<timestamp>`, refrescado cada ~700 ms mientras la pantalla está enfocada (`useFocusEffect`); se detiene al salir | **Ninguna** | Expo Go, APK, vista web |
| B (mejora) | `react-native-webview` con `<img src="http://IP:8080/video">` (MJPEG fluido) | `npx expo install react-native-webview` (confirmar en la doc de SDK 58 que viene en Expo Go) | Expo Go, APK; `CameraStream.web.tsx` cae al nivel A |

**Ojo con el APK (SPEC-030):** Android bloquea `http://` en compilaciones release. Hay que habilitar tráfico
en claro (`expo-build-properties` → `android.usesCleartextTraffic`) **o** limitarlo a la red local. Verificar
en la doc de Expo SDK 58 antes de tocar `app.json`, y probar en el APK real, no solo en Expo Go.

**Código**

```
src/features/cameras/
  types.ts            Camera { id, sectorId, name, streamUrl, fundId?, isDemo, active }
  streamUrl.ts        normaliza «192.168.1.20:8080» → snapshotUrl / mjpegUrl, valida IP privada (+ test)
  CameraStream.tsx    nivel A (o B); estado «Conectando… / En vivo / Sin señal» con texto + icono
  CamerasScreen.tsx   lista del sector
  RegisterCameraScreen.tsx  nombre + dirección que muestra IP Webcam; aviso de privacidad obligatorio
  demoCameras.ts      cámara demo con imagen fija y DemoTag
  index.ts
```

- **Mapa:** agregar `'cameras'` a `MapLayerId` y a `MAP_LAYERS` (icono `cctv`, `defaultOn: false`), y sus
  puntos en `buildMapPoints` en la posición **aproximada** del sector. `map` no importa `cameras`: la ruta le
  pasa los puntos como prop (mismo patrón que Emergencia ↔ mapa) para no crear ciclos.
- **Vínculo con fondos:** si `fundId` existe, la tarjeta dice «Financiada por 23 vecinos · Ver fondo».
  `cameras` importa de `@/features/funds` (una sola dirección).
- **Privacidad:** `streamUrl` solo visible para cuentas del mismo sector (RLS); aviso «Zona videovigilada · sin grabación» en la pantalla.

### 3.3 F3 — Pago en sandbox con Culqi (SPEC-036)

- **Plan A: Culqi** (Yape + tarjeta, llaves `pk_test`/`sk_test`). Plan B: Mercado Pago Checkout Pro con
  `expo-web-browser` (ya instalado) y cuentas de prueba.
- **Flujo**
  ```
  App ──(1) token Yape/tarjeta con pk_test──▶ Culqi
  App ──(2) {idempotencyKey, fundId, amountCents, token}──▶ Edge Function create-charge
                                       (3) cargo con sk_test ──▶ Culqi
                                       (4) si aprueba: insert fund_contributions status='confirmed'
  App ◀─(5) {status, chargeId}── Edge Function     (la barra se refresca por React Query)
  ```
- **A verificar en la doc oficial de Culqi antes de codificar:** cómo se genera el token de Yape desde una
  app móvil (API directa con `pk_test` vs. Checkout en WebView). No asumirlo de memoria.
- La Edge Function usa `idempotencyKey` como `id` de `fund_contributions` (PK): un reintento choca y devuelve el resultado anterior.
- La app **no guarda dinero**: organiza, registra y transparenta. El dinero va de la pasarela a la cuenta del organizador.

### 3.4 F4 — Reporte por WhatsApp + IA (SPEC-037)

- **WhatsApp Cloud API** (número de prueba gratis, hasta 5 destinatarios registrados).
- Edge Function `whatsapp-webhook`: verificar token → (si es audio) transcribir → LLM con salida JSON
  `{ kind, category, sectorId, immediateDanger, summary }` validada con un esquema → insert en
  `emergency_reports` con `source='whatsapp'`, `status='received'` (**nunca** `validated`) → responder:
  *«Entendí: Incidente – Cables caídos – Sector Lince. Lo verán tus vecinos. Si hay peligro inmediato, llama al 105. ¿Es correcto? (Sí / No)»*.
- LLM sugerido: `claude-haiku-5-5` (clasificación rápida y barata). Proveedor de voz a texto: **decisión abierta**.
- **En la app:** el tablero del sector muestra la etiqueta **«vía WhatsApp · sin validar»** (texto + icono) para `source='whatsapp'`.
  Es el único cambio en `src/`.

### 3.5 F5 — Perrito comunitario (SPEC-038)

- `src/features/pets/`: perfil (nombre, foto, descripción, sector), fondo `animal` (reusa F1) y botón
  **«Lo vi / Necesita ayuda»** que guarda una **zona aproximada**, nunca coordenadas.
- QR impreso en el collar → deep link `yunta://perrito/<qr_slug>` (`expo-linking` ya instalado) → ruta `src/app/perrito/[slug].tsx`.
- Avistamientos por outbox: tipo nuevo `pet.sighting` (prioridad `normal`).

### 3.6 F6 — «Acompáñame / Llegué bien» (SPEC-039)

- Dentro de Emergencias: ruta `src/app/emergencias/acompaname.tsx` → `@/features/walk`.
- Elijo 1 a 3 vecinos de confianza y un tiempo (10/15/30 min). **No se comparte ubicación en vivo**; solo el
  sector (aproximado) que ya conocen.
- Si no toco «Llegué bien» a tiempo: notificación local a mí («¿Llegaste bien?») y, con servidor, aviso a los guardianes.
- Outbox: `walk.start` y `walk.arrived` con prioridad `urgent`.
- Lógica pura en `walk/timer.ts` (vencido / en curso / cerrado) con prueba.
- Recordatorio visible: «Yunta no reemplaza al 105 ni al serenazgo».

---

## 4. Cambios en piezas existentes (lista cerrada)

| Archivo | Cambio | Riesgo |
|---|---|---|
| `tsconfig.json`, `eslint.config.js`, config de Jest | Excluir `supabase/functions` | Bajo; verificar con `npm run check` |
| `src/features/outbox/types.ts` | Agregar `fund.create`, `fund.expense`, `camera.register`, `pet.sighting`, `walk.start`, `walk.arrived` a `OutboxType` **y** a `OUTBOX_TYPE_LABEL` (el `Record` obliga a ambos; si falta uno, `tsc` falla) | Bajo |
| `src/features/sync/supabaseTransport.ts` | Mapear cada tipo nuevo a su tabla. **Ningún tipo de pago.** | Medio: probar con modo avión |
| `src/features/map/types.ts`, `layers.ts`, `buildMapPoints.ts` | Capa `cameras` | Bajo |
| `src/features/emergency` (tablero) | Etiqueta «vía WhatsApp · sin validar» | Bajo |
| `src/shared/format` | `formatSoles` + test | Bajo |
| Inicio / Comunidad | Tarjeta de fondos del sector | Bajo |

**No se tocan:** NativeWind y su configuración, `SyncStatusBadge`/`SyncStatus`, las claves `rvs.*`, el flujo SOS sin cuenta.

---

## 5. Supabase — migraciones nuevas

Archivos nuevos en `supabase/migrations/` (fecha + número correlativo, siguiendo `…000006_chat.sql`).

```sql
-- 000007_funds.sql
create table public.funds (
  id uuid primary key, sector_id text not null references public.sectors (id),
  kind text not null check (kind in ('iniciativa','animal')),
  title text not null check (char_length(title) <= 120),
  goal_cents integer check (goal_cents > 0),         -- null en 'animal' (fondo permanente)
  deadline date, organizer_id uuid not null references auth.users (id),
  status text not null default 'open' check (status in ('open','closed')),
  is_demo boolean not null default false, created_at timestamptz not null default now());

create table public.fund_contributions (
  id uuid primary key,                                -- = idempotencyKey del cliente
  fund_id uuid not null references public.funds (id), user_id uuid not null references auth.users (id),
  amount_cents integer not null check (amount_cents between 100 and 50000),
  provider text not null check (provider in ('culqi','mercadopago','mock')),
  provider_charge_id text, anonymous boolean not null default true,
  status text not null check (status in ('confirmed','failed')),
  created_at timestamptz not null default now());

create table public.fund_expenses (
  id uuid primary key, fund_id uuid not null references public.funds (id),
  amount_cents integer not null check (amount_cents > 0),
  description text not null, receipt_url text, created_at timestamptz not null default now());

-- 000008_cameras.sql
create table public.cameras (
  id uuid primary key, sector_id text not null references public.sectors (id),
  owner_id uuid not null references auth.users (id), name text not null,
  stream_url text not null, fund_id uuid references public.funds (id),
  is_demo boolean not null default false, active boolean not null default true,
  created_at timestamptz not null default now());

-- 000009_whatsapp_reports.sql
alter table public.emergency_reports
  alter column user_id drop not null,
  add column source text not null default 'app' check (source in ('app','whatsapp')),
  add column summary text check (char_length(summary) <= 500),
  add constraint emergency_reports_owner check (source = 'whatsapp' or user_id is not null);

-- 000010_pets.sql / 000011_walk.sql: solo si llegan F5/F6 (pets, pet_sightings con sector_zone; walk_sessions sin coordenadas)
```

**RLS (resumen)**
- `funds`, `fund_expenses`: lectura para `anon` y `authenticated`; insert solo el organizador autenticado.
- `fund_contributions`: **sin política de insert para clientes** (solo la Edge Function con service role
  inserta `confirmed`). Lectura del total vía vista `fund_totals` (suma por fondo, pública); quién aportó
  cuánto solo si `anonymous = false`.
- `cameras`: `stream_url` visible solo para perfiles del mismo `sector_id` (vista o política por columna).
- `emergency_reports`: el insert `source='whatsapp'` solo lo hace la Edge Function; la política actual de clientes no cambia.

Después de aplicar: actualizar `supabase/seed.sql` con fondos y una cámara **demo** (`is_demo = true`) y correr
los *advisors* de seguridad de Supabase.

---

## 6. Cómo verificamos que no rompimos nada

Por cada fase, antes de decir «listo»:

1. Prueba que falla → código mínimo → refactor (TDD, ver `sprints.md`).
2. `npm run check` en verde (typecheck + lint + ciclos + tests).
3. **Sin `.env`:** la app abre, los fondos y la cámara salen como demo con `DemoTag`, nada se cuelga.
4. **Modo avión:** el SOS y el reporte siguen funcionando; aportar muestra «No se cobró nada».
5. **Expo Go en celular** (no el navegador): letra grande, áreas táctiles, lector de pantalla en la barra y los estados.
6. Regresión rápida de lo que ya existe: publicar, chat, tablero, mapa, modo fácil.
7. Un cambio = un commit, mensaje en español, **solo cuando el equipo lo pida**.

---

## 7. Checklist de integraciones (cuentas y secretos)

- [ ] Culqi: cuenta → `pk_test` (puede ir como `EXPO_PUBLIC_CULQI_PK`) y `sk_test` **solo** como secreto de la Edge Function.
- [ ] (Plan B) Mercado Pago: aplicación + cuentas de prueba de vendedor y comprador.
- [ ] Supabase CLI para desplegar `create-charge` y `whatsapp-webhook`.
- [ ] Android con IP Webcam + hotspot compartido para la prueba de cámaras.
- [ ] Meta for Developers → WhatsApp → número de prueba + hasta 5 destinatarios.
- [ ] Llave del LLM y de voz a texto solo en el servidor.
- [ ] Ninguna persona real en datos de demo; todo con `DemoTag`.

## 8. Decisiones abiertas

| Tema | Opciones | Quién decide |
|---|---|---|
| Token Yape desde la app | API directa con `pk_test` vs. Checkout en WebView | Integraciones, tras leer la doc de Culqi |
| Voz a texto para WhatsApp | Proveedor por definir | Integraciones |
| Cámara nivel B (WebView) | Sí, si el nivel A se ve muy entrecortado | Equipo, tras probar en el celular |
| Tráfico `http://` en el APK | `usesCleartextTraffic` global vs. solo red local | Junto con SPEC-030 |

---

## Referencias técnicas

- Culqi, pagos con Yape: https://docs.culqi.com/es/documentacion/pagos-online/cargo-unico/tokens-yape/
- Culqi, librería oficial y llaves de prueba: https://github.com/culqi/culqi-python
- Mercado Pago, pruebas con Checkout Pro: https://mercadopago.com.mx/developers/es/docs/adobe-commerce/sales-processing/integration-test
- WhatsApp Cloud API, número de prueba: https://www.wati.io/en/blog/test-whatsapp-message-sends-safely/
- Celular como cámara IP (MJPEG): https://github.com/BalioFVFX/IP-Camera

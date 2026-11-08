# Plan técnico — integraciones y diferenciadores

> **Fecha:** 7 nov 2026 · **Responsable de integraciones:** Shay
> **Origen:** feedback de los ganadores de la Hackathon El Comercio 2025, contrastado con el código actual de Yunta
> y con la documentación oficial de cada proveedor.
> **Reglas que ganan si algo choca:** los principios no negociables de
> [`brief_producto_y_decisiones.md`](../01_producto/brief_producto_y_decisiones.md) §7 y las reglas de
> [`CLAUDE.md`](../../CLAUDE.md) (capas, `index.ts`, `DemoTag`, estados honestos, sin secretos en el cliente).

---

## 0. Resumen

| # | Funcionalidad | Veredicto | Cómo se construye | Riesgo principal |
|---|---|---|---|---|
| 1 | **Cámaras vecinales** (celular → cámara) | ✅ Viable en Expo Go | `react-native-webview` (incluido en Expo Go SDK 58) muestra el MJPEG de *IP Webcam* en la misma red | HTTP sin TLS en la LAN: probar iOS temprano |
| 2 | **Fondos vecinales + pago sandbox** | ✅ Viable, **mock primero** | `PaymentsProvider` (`mock` → `culqi` o `mercadopago`) + Edge Function `create-charge` + Realtime | Culqi pide **RUC** para abrir cuenta; Mercado Pago es el plan B real |
| 3 | **WhatsApp + IA → reporte** | ⚠️ Viable con reservas | Edge Function `whatsapp-webhook` → STT (proveedor aparte) → Claude (salida estructurada) → `emergency_reports` | Descarga de audio con el número de prueba de Meta (reportes de error) |
| 4 | **«Llegué bien»** | ⚠️ Viable con alcance reducido | Sesión de trayecto en Supabase + aviso local con el patrón de `BoardNotifier` | **Expo Go en Android no recibe push remoto** |
| 5 | **Perrito comunitario + QR** | ✅ Viable | Perfil + fondo `animal` + avistamientos por zona aproximada | El QR solo abre la app con un enlace profundo |

**Orden de trabajo (sin cambios respecto del feedback, con un ajuste):**
cámara (P0) → fondos con **mock** (P0) → pasarela real en sandbox (P0b) → WhatsApp + IA (P1) → QR del perrito / «Llegué bien» (P2).

---

## 1. Validación del feedback (qué se confirmó y qué se corrige)

| Afirmación del feedback | Verificación | Fuente |
|---|---|---|
| «Yape con Culqi: tope S/ 500 por pago» | ❌ **Es S/ 2 000** por pago, solo soles. El código de aprobación dura **2 min** y el token `ype_test_…` dura **5 min** y es de un solo uso | [Culqi – Tokens Yape](https://docs.culqi.com/es/documentacion/pagos-online/cargo-unico/tokens-yape/), [Culqi – Tokens](https://docs.culqi.com/es/documentacion/pagos-online/cargo-unico/tokens) |
| «Culqi tiene llaves de prueba» | ✅ `pk_test_…` / `sk_test_…`. **Pero** el registro de comercio pide RUC activo y cuenta bancaria (según tutoriales de terceros; confirmarlo con Culqi). Integrar directo por API (sin Checkout) exige PCI DSS / SAQ-D | [Culqi – Tokens Yape](https://docs.culqi.com/es/documentacion/pagos-online/cargo-unico/tokens-yape/), [KOM – Culqi + WooCommerce](https://kom.pe/como-integrar-culqi-woocommerce-peru/) |
| Datos de prueba de Yape en Culqi | ✅ Número de prueba **900 000 001**, código de aprobación: cualquier número de 6 dígitos (verificarlo en el panel) | [Culqi – Tarjetas de prueba](https://docs.culqi.com/es/documentacion/pagos-online/tarjetas-de-prueba) |
| «Plan B: Mercado Pago Checkout Pro» | ✅ Y mejor aún: **Mercado Pago Perú acepta Yape** en Checkout API (`mp.yape.create({otp, phoneNumber})` → token → `/v1/payments`), con usuarios de prueba sin RUC | [MP Perú – Yape](https://www.mercadopago.com.pe/developers/en/docs/checkout-api/integration-configuration/yape) |
| «Spacehive: 9 de cada 10 proyectos llegan a la meta» | ⚠️ El **85 %** lo declara la propia plataforma (y dentro de sus programas con socios). Otras cifras históricas: 49–56 %. En el pitch hay que decir *«según Spacehive»* | [Spacehive – About](https://spacehive.com/about), [Wikipedia](https://en.wikipedia.org/wiki/Spacehive) |
| «La WebView funciona en Expo Go» | ✅ `react-native-webview` viene en Expo Go SDK 58. Se instala con `npx expo install react-native-webview` | [Expo SDK 58 – WebView](https://docs.expo.dev/versions/v58.0.0/sdk/webview/) |
| «WhatsApp: número de prueba gratis, hasta 5 destinatarios» | ✅ Hasta 5 números en la lista de permitidos (error 131030 si no están). El token temporal **vence** (≈24 h): usar un token de *System User*. La firma `X-Hub-Signature-256` es un HMAC-SHA256 con el *App Secret*. Las respuestas libres solo se permiten dentro de la ventana de 24 h | [Meta – Get started](https://developers.facebook.com/docs/whatsapp/cloud-api/get-started), [Webhook Relay – guía](https://webhookrelay.com/blog/whatsapp-cloud-api-webhooks/) |
| «Transcribir el audio y pasarlo a un LLM» | ⚠️ La API de Claude **no recibe audio**: la transcripción necesita un proveedor de voz a texto aparte. Claude hace la **clasificación** con salida estructurada (`output_config.format`) | Documentación de la API de Claude |
| «Supabase Realtime para que suba la barra» | ✅ Hay que agregar la tabla a la publicación `supabase_realtime`. Respeta RLS. **Hoy el repo no usa Realtime** (el chat consulta cada 4–15 s con TanStack Query) | [Supabase – Postgres Changes](https://supabase.com/docs/guides/realtime/postgres-changes) |
| «Alerta a otro celular» («Llegué bien») | ❌ en Expo Go/Android: **el push remoto no está disponible desde SDK 53**. Las notificaciones **locales** sí funcionan (es lo que ya hace `BoardNotifier`) | [Expo SDK 58 – Notifications](https://docs.expo.dev/versions/v58.0.0/sdk/notifications/) |
| «La app no guarda dinero» | ⚠️ **Con Culqi, el dinero cae en la cuenta del comercio integrador (nosotros)**, lo que contradice el argumento. El modelo correcto en producción es *marketplace*: cada organizador o junta directiva cobra en **su** cuenta (Mercado Pago Marketplace / OAuth) | Análisis propio; validarlo con un abogado (SBS) |

---

## 2. Punto de partida en el código (lo que se reutiliza)

| Pieza existente | Dónde | Cómo la usamos |
|---|---|---|
| Cola offline con prioridad e idempotencia | `src/features/outbox` (`OutboxType`, `OutboxPriority`) | Tipos nuevos para fondos, avistamientos y trayectos |
| Transporte a Supabase con `received` honesto | `src/features/sync/supabaseTransport.ts` | Agregar `case` por tipo nuevo (no toca el pago, que va aparte) |
| Auth anónima + RLS | `src/shared/supabase/client.ts` (`ensureAnonymousUser`) | `user_id = auth.uid()` en aportes y trayectos |
| Puerta de registro | `@/features/session` → `useRegistrationGate` | «Para aportar hay que registrarse» |
| Mapa por capas | `src/features/map/layers.ts` (`MAP_LAYERS`) | Capas nuevas `cameras` y `pets` |
| Notificación local + polling | `src/features/notifications/BoardNotifier.tsx` | Modelo para avisar a los guardianes de «Llegué bien» |
| Tablero del sector (RPC `security definer`) | `supabase/migrations/…_shared_board.sql` → `sector_board()` | Mostrar los reportes que llegan por WhatsApp |
| Nota de voz real (`expo-audio`) | `emergency/components/VoiceNoteField.tsx` | Fase 2: reutilizar el pipeline de voz a texto en *Publicar* |
| Claves de almacenamiento `rvs.<x>.v1` | stores con `persist` + `kvStorage` | `rvs.funds.v1`, `rvs.walk.v1`, … |

**Lo que no existe todavía y hay que crear:** la carpeta `supabase/functions/` (Edge Functions, con Supabase CLI), el
uso de Realtime y la dependencia `react-native-webview`.

---

## 3. Diseño por funcionalidad

### 3.1 Cámaras vecinales (P0)

**Flujo de la demo:** un Android con *IP Webcam* → `http://192.168.x.x:8080/video` (MJPEG) → 3 celulares en el mismo
hotspot ven la cámara dentro de Yunta.

**Feature:** `src/features/cameras/`

```
cameras/
├── index.ts                 # CamerasListScreen, CameraViewerScreen, useCameras, CameraLayerPoints
├── types.ts                 # Camera { id, sectorId, name, streamUrl, snapshotUrl?, isDemo, fundId? }
├── streamUrl.ts             # buildViewerHtml(url), isPrivateLanUrl(url)  ← funciones puras
├── streamUrl.test.ts
├── repository.ts            # Supabase (tabla cameras) | demo local
├── CameraViewerScreen.tsx   # WebView + estados: conectando / en vivo / sin señal (texto + icono)
└── components/CameraCard.tsx   # «Financiada por 23 vecinos — ver fondo»
```

Ruta delgada: `src/app/camaras/[id].tsx` → `export { CameraViewerScreen as default } from '@/features/cameras'`.

**Visor:** el MJPEG no lo reproduce `expo-video`, así que se usa una WebView con HTML en línea:

```tsx
<WebView
  originWhitelist={['*']}
  source={{ html: buildViewerHtml(camera.streamUrl) }}   // <img src="…/video" style="width:100%"> + onerror → postMessage('offline')
  onMessage={(e) => setState(e.nativeEvent.data === 'offline' ? 'offline' : 'live')}
  mixedContentMode="always"                               // Android: http dentro de un origen sin TLS
  accessibilityLabel={`Cámara en vivo: ${camera.name}`}
/>
```

**Plan B, si la WebView falla en iOS:** pedir `snapshotUrl` (`/shot.jpg` de IP Webcam) cada 1 s con `expo-image`
(con `cachePolicy="none"` y `?t=${Date.now()}`). Se ven ~1 fps, suficiente para el video.

**Riesgos técnicos que hay que probar el primer día:**
- **Android:** Expo Go ya permite HTTP sin TLS (carga Metro por `http://`). En un build de EAS hará falta `expo-build-properties`
  con `android.usesCleartextTraffic: true`.
- **iOS:** ATS y el permiso de *Red local* (iOS 14+). Si se complica, **grabar la demo con Android**.
- **Privacidad (principio 5):** activar usuario y contraseña en IP Webcam; ver la cámara exige estar registrado
  (`useRegistrationGate`); sin grabación; aviso «zona videovigilada» en la tarjeta. La `stream_url` solo la leen
  usuarios autenticados (RLS).

**Producción (solo en el pitch):** RTSP → servidor de *media* (WebRTC/HLS) con tokens de corta duración. No se construye.

### 3.2 Fondos vecinales + pagos (P0)

**Features:** `src/features/funds/` (UI y reglas) y `src/features/payments/` (proveedores). `funds` usa `payments` a través de su `index.ts`;
`payments` no conoce a `funds` (sin ciclos).

```
payments/
├── index.ts            # getPaymentsProvider(), PaymentStatus, PAYMENT_STATUS_LABEL
├── types.ts            # PaymentsProvider, PaymentIntent, PaymentResult
├── status.ts           # máquina de estados pura + etiquetas
├── status.test.ts
├── mockProvider.ts     # aprueba tras 1,5 s; montos terminados en ,13 → 'failed' (para grabar el error)
└── serverProvider.ts   # tokeniza Yape (pk) y llama a la Edge Function create-charge

funds/
├── index.ts
├── types.ts            # Fund { kind: 'initiative'|'animal'|'junta', goalCents, raisedCents, … }
├── progress.ts         # progressPct, remainingCents, daysLeft, formatSoles  ← puras
├── progress.test.ts
├── FundDetailScreen.tsx · ContributeSheet.tsx · FundCard.tsx (Inicio y Comunidad)
└── useFundRealtime.ts  # canal Realtime filtrado por fund_id + polling de respaldo cada 10 s
```

**Interfaz del proveedor:**

```ts
export type PaymentMethod = { kind: 'yape'; phone: string; otp: string };
export type PaymentResult =
  | { status: 'confirmed'; chargeId: string; sandbox: boolean }
  | { status: 'failed'; reason: string };          // siempre «No se cobró nada»

export interface PaymentsProvider {
  readonly name: 'mock' | 'culqi' | 'mercadopago';
  readonly sandbox: boolean;
  contribute(input: { fundId: string; amountCents: number; method: PaymentMethod; idempotencyKey: string }): Promise<PaymentResult>;
}
```

Elección del proveedor: si no hay `EXPO_PUBLIC_PAYMENTS_PROVIDER` ni Supabase → `mock` con `DemoTag`.

**Estados honestos (igual que `SyncStatusBadge`, texto + icono):**

```
draft ──(Aportar)──▶ processing ──(respuesta del servidor)──▶ confirmed  «Aporte confirmado por la pasarela (prueba)»
                         │                                  └▶ failed     «No se pudo procesar. No se cobró nada.»
                         └─(sin red / timeout)──────────────▶ unknown     «No sabemos si se procesó. Revisa en unos minutos.»
```

- **El aporte NO entra al outbox.** Un pago no se puede reintentar a ciegas sin red: el OTP vence en 2 min. Sin conexión, el botón
  *Aportar* queda deshabilitado con el texto «Necesitas conexión para aportar».
- `unknown` existe porque un timeout **no** significa que el pago falló. Se resuelve consultando `fund_contributions` por `idempotency_key`.
- La etiqueta «Pago de prueba» se ve siempre que `sandbox === true`.

**Edge Function `supabase/functions/create-charge/index.ts` (Deno):**
1. Verificar el JWT del usuario (anónimo vale) → `auth.uid()`.
2. Validar con Zod: `fundId` (uuid), `amountCents` (entero, 100–200 000 = S/ 1–2 000), `token`, `idempotencyKey`.
3. Comprobar que el fondo existe y está `active`.
4. Crear el cargo con la llave secreta (`CULQI_SECRET_KEY` o `MP_ACCESS_TOKEN`, en `supabase secrets set`, **nunca** en `.env` del cliente).
5. Si se aprueba, insertar en `fund_contributions` con `status='confirmed'` **usando la service role** (el cliente no puede insertar
   `confirmed`: la RLS solo permite leer). La clave única en `idempotency_key` evita los dobles cobros al reintentar.
6. Responder `{ status, chargeId }`. Realtime avisa a los demás celulares.

**Tokenización de Yape en el cliente** (llave pública, sin PCI de tarjetas):
- **Culqi:** `POST https://secure.culqi.com/v2/tokens/yape` con `{ amount, otp, number_phone }` y `Authorization: Bearer pk_test_…`.
  La ruta está en un espejo de su OpenAPI: **confirmarla en `apidocs.culqi.com`** antes de escribir el código.
- **Mercado Pago:** `mp.yape.create({ otp, phoneNumber })` con su SDK JS. En React Native se carga en una WebView o se usa su
  API REST equivalente: confirmarlo en la doc de MP.

**Decisión de pasarela (recomendación):**

| | Culqi | Mercado Pago |
|---|---|---|
| Yape en sandbox | ✅ (900 000 001) | ✅ (usuarios de prueba) |
| Alta sin RUC | ❓ probablemente no | ✅ usuarios de prueba |
| Conocido por el jurado local | ✅✅ | ✅ |
| «No guardamos dinero» en producción | ❌ cobra el integrador | ✅ Marketplace (cada organizador cobra en su cuenta) |

**→ Intentar abrir Culqi hoy. Si pide RUC o tarda más de 1 h, ir directo con Mercado Pago.** El `mock` cubre la demo mientras tanto.

**Rendición de cuentas:** `fund_expenses` con foto de la boleta (`PhotoField` + Supabase Storage, bucket `receipts`, lectura pública
de la miniatura). El fondo muestra «Gastado: S/ 1 150 — Boleta adjunta».

### 3.3 WhatsApp + IA → reporte (P1)

```
WhatsApp ──▶ Meta Cloud API ──webhook──▶ Edge Function whatsapp-webhook
                                           1. GET: verificar hub.mode / hub.verify_token → devolver hub.challenge
                                           2. POST: verificar X-Hub-Signature-256 (HMAC-SHA256 del body crudo con WHATSAPP_APP_SECRET)
                                           3. Responder 200 de inmediato; seguir el trabajo con EdgeRuntime.waitUntil()
                                           4. Deduplicar por message.id (tabla whatsapp_inbox, PK = wamid)
                                           5. Audio: GET /{media-id} → URL → descargar con Bearer → voz a texto
                                           6. Texto → Claude (salida estructurada) → JSON validado con Zod
                                           7. INSERT emergency_reports (source='whatsapp', status='received')
                                           8. Responder por WhatsApp: resumen + «Si hay peligro inmediato llama al 105» + «¿Es correcto? Sí/No»
```

**Clasificación con Claude** (en la Edge Function, con `npm:@anthropic-ai/sdk`):

```ts
import Anthropic from 'npm:@anthropic-ai/sdk';
import { zodOutputFormat } from 'npm:@anthropic-ai/sdk/helpers/zod';

const Report = z.object({
  kind: z.enum(['incident', 'help', 'not_emergency']),
  category: z.enum([/* las mismas categorías de IncidentReportScreen */]),
  immediateDanger: z.boolean(),
  sectorHint: z.string().nullable(),   // «Lince», nunca una dirección exacta
  summary: z.string().max(140),
});

const res = await new Anthropic().messages.parse({
  model: 'claude-opus-5-5',
  max_tokens: 1024,
  output_config: { effort: 'low', format: zodOutputFormat(Report) },
  system: SYSTEM_PROMPT,               // fijo → se puede cachear
  messages: [{ role: 'user', content: transcript }],
});
```

- **Modelo:** `claude-opus-5-5` con `effort: 'low'`. Si se quiere bajar el costo por mensaje, `claude-haiku-5-5` también sirve para esta tarea; **decide el equipo**.
- **Voz a texto:** Claude no recibe audio. Elegir un proveedor de STT con buen español (por ejemplo, uno basado en Whisper); la llave va solo en `supabase secrets`.
- **Cambio de esquema necesario:** hoy `emergency_reports.user_id` es `not null references auth.users`. Un mensaje de WhatsApp no tiene
  usuario de la app → migración: `user_id` *nullable* + columna `source text not null default 'app' check (source in ('app','whatsapp'))`
  + `check (source = 'app' or user_id is null)`. Al número de teléfono **no se lo guarda en claro** (solo `sha256(phone)` para deduplicar).
- El reporte aparece en el tablero a través de `sector_board()` con la etiqueta **«vía WhatsApp — sin validar»**.
- **Sector:** con un solo sector en la demo, por defecto es el del número registrado. Con varios, el bot pregunta «¿En qué sector?» (botones).

**Riesgos:** (a) hay reportes de comunidad de que la descarga de *media* falla con el número de prueba (código 100/33). Probarlo el
primer día y, si falla, grabar la demo con un **mensaje de texto** y dejar el audio para el pitch. (b) El token temporal vence: generar
el token de *System User* desde el inicio.

### 3.4 «Llegué bien» (P2)

**Alcance realista en Expo Go:** no hay push remoto en Android → el aviso a los guardianes funciona **si tienen Yunta abierta o en
segundo plano reciente**, con el mismo patrón de `BoardNotifier` (polling/Realtime + notificación local). Para producción: development build + push.

- Vive en `src/features/emergency/` (no es una pestaña nueva): `WalkHomeScreen`, `walk.ts` (puro: `isOverdue`, `remainingSeconds`) + test.
- `walk_sessions (id, user_id, guardian_ids uuid[], sector_id, expires_at, status ['active','arrived','overdue','cancelled'])`.
- **Ubicación:** solo `sector_id` y, opcionalmente, una **zona aproximada** (reutilizar `map/approx.ts`). Sin rastreo continuo en la versión hackathon:
  el valor está en el temporizador, no en el GPS. Esto refuerza el principio 5.
- `walk.start` / `walk.arrived` van al outbox con prioridad `urgent`. El estado `overdue` lo calcula el **servidor** (`pg_cron` cada minuto
  o una vista con `now() > expires_at`), no el teléfono que quizás se quedó sin batería.

### 3.5 Perrito comunitario + QR (P2)

- `src/features/pets/`: perfil (nombre, foto, zona aproximada, vacunas en texto libre), botón «Lo vi / Necesita ayuda», enlace a su fondo `animal`.
- `pet_sightings` guarda **zona aproximada** (celda de `approx.ts`), nunca coordenadas.
- **QR:** contiene la ruta `mascota/<qr_slug>`. Con Expo Go el enlace es `exp://<IP>:8081/--/mascota/<slug>`; con un build propio, `yunta://mascota/<slug>`
  (el `scheme` ya está en `app.json`). Para quien no tiene la app, en producción se usaría una página web pública: queda para el pitch.

---

## 4. Modelo de datos (migración `20261110000007_funds_cameras_pets_walks.sql`)

Mismas convenciones del esquema actual: `sector_id text references sectors`, `auth.users`, RLS en todas las tablas, `is_demo`.

```sql
create table public.funds (
  id uuid primary key default gen_random_uuid(),
  sector_id text not null references public.sectors (id),
  kind text not null check (kind in ('initiative','animal','junta')),
  title text not null check (char_length(title) between 3 and 80),
  description text not null default '' check (char_length(description) <= 600),
  goal_cents integer check (goal_cents > 0),                 -- null para 'animal' (permanente)
  deadline timestamptz,
  organizer_id uuid not null references public.profiles (id),
  status text not null default 'active' check (status in ('active','funded','closed')),
  is_demo boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.fund_contributions (
  id uuid primary key default gen_random_uuid(),
  fund_id uuid not null references public.funds (id) on delete cascade,
  user_id uuid not null references auth.users (id),
  amount_cents integer not null check (amount_cents between 100 and 200000),
  provider text not null check (provider in ('culqi','mercadopago','mock')),
  provider_charge_id text,
  idempotency_key uuid not null unique,
  anonymous boolean not null default true,
  sandbox boolean not null,
  status text not null check (status in ('confirmed','refunded')),
  created_at timestamptz not null default now()
);
-- Sin política de INSERT para authenticated: solo la Edge Function (service role) inserta.

-- Totales públicos sin exponer quién aportó: RPC security definer (mismo patrón que sector_board).
create function public.fund_totals(p_sector_id text)
returns table (fund_id uuid, raised_cents int, contributors int)
language sql stable security definer set search_path = '' as $$
  select c.fund_id, sum(c.amount_cents)::int, count(distinct c.user_id)::int
  from public.fund_contributions c join public.funds f on f.id = c.fund_id
  where c.status = 'confirmed' and f.sector_id = p_sector_id
  group by c.fund_id
$$;
grant execute on function public.fund_totals(text) to anon, authenticated;

create table public.fund_expenses (
  id uuid primary key default gen_random_uuid(),
  fund_id uuid not null references public.funds (id) on delete cascade,
  amount_cents integer not null check (amount_cents > 0),
  description text not null check (char_length(description) <= 200),
  receipt_path text,                                         -- Storage, bucket 'receipts'
  created_at timestamptz not null default now()
);

create table public.cameras (
  id uuid primary key default gen_random_uuid(),
  sector_id text not null references public.sectors (id),
  name text not null,
  stream_url text not null,
  fund_id uuid references public.funds (id),
  active boolean not null default true,
  is_demo boolean not null default false
);

create table public.pets (…);            -- id, sector_id, name, description, photo_path, approx_zone, qr_slug unique, fund_id, is_demo
create table public.pet_sightings (…);   -- id, pet_id, user_id, approx_zone, note, kind ['seen','needs_help'], created_at
create table public.walk_sessions (…);   -- ver 3.4

alter publication supabase_realtime add table public.fund_contributions;

alter table public.emergency_reports alter column user_id drop not null;
alter table public.emergency_reports add column source text not null default 'app' check (source in ('app','whatsapp'));
```

**RLS (resumen):**

| Tabla | Lectura | Escritura |
|---|---|---|
| `funds` | todos (`anon`, `authenticated`) | el organizador (`authenticated`, `is_demo = false`) |
| `fund_contributions` | `authenticated`; **los montos de cada persona solo se ven si `anonymous = false`**. Para totales públicos, `fund_totals` vía RPC `security definer` | **nadie desde el cliente** (service role) |
| `fund_expenses` | todos | el organizador del fondo |
| `cameras` | `authenticated` (la `stream_url` no se expone a `anon`) | el dueño |
| `walk_sessions` | el dueño y quien esté en `guardian_ids` | el dueño |

> Realtime respeta RLS: como `fund_contributions` no se lee para `anon`, el canal se abre después de `ensureAnonymousUser()`.
> Otra opción más simple: escuchar un `broadcast` que emita la Edge Function con el total nuevo.

---

## 5. Outbox: tipos nuevos

```ts
| 'fund.create'        // normal
| 'fund.expense'       // normal (la foto se sube aparte, como ya ocurre con las fotos)
| 'pet.sighting'       // normal; 'needs_help' → urgent
| 'walk.start'         // urgent
| 'walk.arrived'       // urgent
| 'camera.register'    // normal
```

**Fuera del outbox, a propósito:** el aporte (`fund.contribution`) ver 3.2. Cada tipo nuevo necesita su `OUTBOX_TYPE_LABEL` y su
`case` en `supabaseTransport.ts`. Al ser un *union* de TypeScript, si falta alguno, `npm run typecheck` lo marca.

---

## 6. Configuración y secretos

| Variable | Dónde | Pública |
|---|---|---|
| `EXPO_PUBLIC_PAYMENTS_PROVIDER` (`mock`\|`culqi`\|`mercadopago`) | `.env` | sí |
| `EXPO_PUBLIC_CULQI_PUBLIC_KEY` / `EXPO_PUBLIC_MP_PUBLIC_KEY` | `.env` | sí (llave pública) |
| `CULQI_SECRET_KEY` / `MP_ACCESS_TOKEN` | `supabase secrets set` | **no** |
| `WHATSAPP_TOKEN`, `WHATSAPP_APP_SECRET`, `WHATSAPP_VERIFY_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID` | `supabase secrets set` | **no** |
| `ANTHROPIC_API_KEY`, `STT_API_KEY` | `supabase secrets set` | **no** |

Actualizar `.env.example` solo con las variables `EXPO_PUBLIC_*`.

**Dependencias nuevas:** `npx expo install react-native-webview` (y `expo-build-properties` solo si se hace build de EAS).
Herramienta: Supabase CLI (`npx supabase functions new|serve|deploy`). La función `whatsapp-webhook` se despliega con
`--no-verify-jwt`, porque Meta no envía JWT y la autenticidad se comprueba con la firma.

---

## 7. Specs, ADR y pruebas (SDD + TDD)

| Spec | Criterio principal (Dado / Cuando / Entonces) | Pruebas puras |
|---|---|---|
| `SPEC-030-camaras-vecinales` | Dada una cámara registrada, cuando la abro sin red, entonces veo «Sin señal» con icono, nunca una pantalla negra | `streamUrl.test.ts` |
| `SPEC-031-fondos-vecinales` | Dado un fondo de S/ 1 200 con S/ 840, entonces veo 70 %, faltan S/ 360 y los días restantes | `progress.test.ts` |
| `SPEC-032-aportes-con-pasarela` | Cuando la pasarela no responde, entonces veo «No sabemos si se procesó», nunca «Pagado» | `status.test.ts` (transiciones válidas e inválidas) |
| `SPEC-033-whatsapp-ia` | Dado un texto «se cayó un poste…», entonces se crea un incidente `source='whatsapp'`, `status='received'` | prueba de `parseClassification` (JSON inválido → «no entendí», no se inserta nada) |
| `SPEC-034-llegue-bien` | Dado un trayecto de 15 min sin «Llegué», entonces el servidor lo marca `overdue` | `walk.test.ts` |
| `SPEC-035-perrito-comunitario` | Al escanear el QR se abre el perfil; el avistamiento guarda solo la zona | `petSlug.test.ts` |

**ADR nuevos:** `0005-pagos-via-edge-function-y-proveedor-intercambiable.md` (por qué el aporte no va al outbox y por qué
Marketplace en producción) y `0006-edge-functions-para-integraciones-externas.md`.

**Definición de terminado por funcionalidad:** `npm run check` en verde + probado en **Expo Go en un celular** + video de 20–40 s grabado.

---

## 8. Plan de ejecución (horas estimadas)

| Bloque | Tareas | Est. |
|---|---|---|
| **Día 1 · mañana** | Abrir cuentas en paralelo: Culqi, Mercado Pago (usuarios de prueba), Meta (WhatsApp) y proveedor de STT. Probar IP Webcam + WebView en Android **e** iOS | 1,5 h |
| | `cameras` (spec, pruebas, visor, capa del mapa, datos demo) | 3 h |
| **Día 1 · tarde** | `funds` + `payments` con `mock` + barra en Inicio y Comunidad + migración y RLS | 4 h |
| **Día 2 · mañana** | Edge Function `create-charge` + pasarela real en sandbox + Realtime | 3–4 h |
| **Día 2 · tarde** | `whatsapp-webhook` (texto primero, audio después) + migración `source` | 4 h |
| **Si sobra tiempo** | Perrito con QR · «Llegué bien» | 2 h c/u |
| **Cierre** | Grabar los 4 videos, ADR, actualizar `README.md` y `.env.example` | 2 h |

**Puntos de corte (no negociables):** si a las 2 h la pasarela real no tokeniza Yape, la demo se graba con `mock` + `DemoTag`
y en el pitch se muestra el código de la Edge Function. Si el audio de WhatsApp no descarga, se graba con texto.

---

## 9. Riesgos y mitigaciones

| Riesgo | Prob. | Impacto | Mitigación |
|---|---|---|---|
| Culqi exige RUC | Alta | Medio | Mercado Pago (Yape en Checkout API) o `mock` |
| La WebView no muestra el MJPEG por HTTP en iOS | Media | Medio | Plan B con `/shot.jpg`, o demo grabada con Android |
| Falla la descarga de audio con el número de prueba de Meta | Media | Bajo | Demo con texto |
| Sin push en Expo Go (Android) | Segura | Medio | Notificación local + app abierta; push en un development build (roadmap) |
| Doble cobro al reintentar | Baja | Alto | `idempotency_key unique` + estado `unknown` |
| Reportes falsos por WhatsApp | Media | Medio | Siempre `received` («sin validar»), confirmación Sí/No, número con hash |
| Regulación (captación de fondos, SBS) | — | Alto (post-hackathon) | Modelo Marketplace: Yunta organiza y transparenta, no custodia. Validarlo con un abogado |
| Privacidad de cámaras | — | Alto | Solo espacios comunes, sin grabación, acceso para registrados, contraseña en el stream |

---

## 10. Para el pitch (con cifras verificadas)

- **Seúl (Ansimi):** acompañamiento al volver a casa + CCTV → *«Llegué bien» + cámaras hechas con celulares.*
- **Londres (Spacehive):** crowdfunding cívico; *«según Spacehive, el 85 % de los proyectos llega a su meta»* → *Fondos vecinales.*
- **Barcelona (Decidim):** presupuesto participativo → *votar qué fondo va primero* (roadmap).
- **Ámsterdam (Smart Citizen Kit):** sensores ciudadanos → *roadmap.*
- **Perú (Guerreras Juntas, Caja Los Andes):** juntas digitales → *fondo tipo `junta`* (roadmap).
- **Mensaje legal:** *«Yunta no guarda dinero: organiza, registra y transparenta. En producción, cada junta cobra en su propia cuenta.»*

## Fuentes

- Culqi: [Tokens Yape](https://docs.culqi.com/es/documentacion/pagos-online/cargo-unico/tokens-yape/) ·
  [Tokens](https://docs.culqi.com/es/documentacion/pagos-online/cargo-unico/tokens) ·
  [Tarjetas de prueba](https://docs.culqi.com/es/documentacion/pagos-online/tarjetas-de-prueba) ·
  [Espejo OpenAPI (no oficial)](https://apis.io/apis/culqi/culqi-tokens-api/)
- Mercado Pago Perú: [Yape en Checkout API](https://www.mercadopago.com.pe/developers/en/docs/checkout-api/integration-configuration/yape) ·
  [Anuncio](https://www.mercadopago.com.pe/developers/en/news/2024/07/19/Integrate-Yape-into-Checkout-API-with-the-support-of-the-new-documentation)
- Expo SDK 58: [WebView](https://docs.expo.dev/versions/v58.0.0/sdk/webview/) · [Notifications](https://docs.expo.dev/versions/v58.0.0/sdk/notifications/)
- Supabase: [Realtime – Postgres Changes](https://supabase.com/docs/guides/realtime/postgres-changes)
- WhatsApp Cloud API: [Get started (Meta)](https://developers.facebook.com/docs/whatsapp/cloud-api/get-started) ·
  [Webhooks (Webhook Relay)](https://webhookrelay.com/blog/whatsapp-cloud-api-webhooks/) ·
  [Problema de descarga de media en el número de prueba](https://community.make.com/t/whatsapp-cloud-api-media-download-fails-code-100-subcode-33-despite-correct-token-and-permissions/113293)
- Spacehive: [About](https://spacehive.com/about) · [Wikipedia](https://en.wikipedia.org/wiki/Spacehive)
- Lo demás (Ansimi, Decidim, Smart Citizen Kit, Guerreras Juntas, juntas en Perú): fuentes del documento de feedback original.

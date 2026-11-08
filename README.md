# Yunta

**Tu comunidad, más cerca.** Aplicación **solo para celular** (Android e iOS) que conecta a vecinos para resolver
necesidades del día a día — prestar y pedir herramientas, comprar a emprendimientos del barrio, enterarse de lo
que pasa cerca — y para coordinar ayuda cuando hay una emergencia. Construida con Expo + React Native + TypeScript.

> Yunta coordina ayuda entre vecinos. **No reemplaza a los servicios oficiales de emergencia** ni garantiza que
> un reporte haya sido recibido. No publiques ubicaciones exactas ni datos médicos sensibles.

- [Qué hace](#qué-hace) · [Ejecutar](#ejecutar) · [Stack](#stack) · [Arquitectura](#arquitectura) ·
  [Diagramas](#diagramas) · [Estado y datos](#estado-y-persistencia) · [Pruebas y CI](#pruebas-y-ci) ·
  [Trabajar con IA](#trabajar-con-ia) · [Deuda técnica](#deuda-técnica-y-próximos-pasos)

## Qué hace

La app tiene una **barra inferior de 5 pestañas** («comunidad primero», ver ADR 0006) y **Emergencia** siempre a un
toque con el botón **SOS** de la cabecera:

| Pestaña | Para qué sirve | Ruta |
|---|---|---|
| **Inicio** | Feed del barrio: personas y lo que ofrecen, necesitan u organizan; alerta del sector, «¿Emergencia?» y «Juntos por el barrio» | `/` |
| **Eventos** | Eventos del barrio: los crean los vecinos y los demás marcan «Voy» (solo se ve cuántos van) | `/eventos`, `/evento/[id]`, `/eventos/crear` |
| **Explorar** | Lugares del barrio (OpenStreetMap) con «Abierto ahora» solo si hay horario, y emprendimientos de vecinos | `/explorar` |
| **Marketplace** | Ofrecer, pedir, prestar o vender; «Escribir» abre el chat con quien publicó | `/marketplace`, `/publicaciones`, `/publicar` |
| **Chat** | Conversaciones 1 a 1 por publicación, con bloqueo, reporte y aviso de mensajes sin leer | `/mensajes`, `/chat/[id]` |
| **Emergencia** (SOS) | Reportar un incidente o pedir auxilio **sin cuenta**, números oficiales, tablero y mapa | `/emergencias/*` |

Transversales: menú lateral con perfil (tu avatar o ☰, o deslizar desde el borde izquierdo), campana de actividad,
cambio de sector, tutorial inicial y **recomendaciones** según lo que cada persona mira y guarda.

**Asistente «Pregúntale a Yunta»** (`/asistente`, desde el Inicio): responde dudas sobre la app y el barrio con IA
gratuita en cadena (**Mistral → Groq → respuestas fijas**). Se le puede **hablar** (grabación transcrita
con Groq Whisper, el texto queda editable antes de enviar) y **escuchar** las respuestas (`expo-speech`). Reglas:

- Un mensaje que suena a emergencia **nunca pasa por la IA**: muestra al instante el SOS y el 105.
- Teléfonos, correos y DNI se reemplazan por «[dato oculto]» **antes** de salir del teléfono.
- Límite de 20 mensajes por persona y 400 en total al día; al agotarse, o sin red ni servidor, contestan las
  respuestas fijas marcadas como tales (nunca se simula una respuesta de IA).
- La conversación se guarda solo en el teléfono. Ver SPEC-049 y SPEC-050.

Principios de producto: accesibilidad por defecto, ubicación siempre **aproximada** (por sector), datos
ficticios marcados con `DemoTag`, y honestidad de estado: «guardado en tu teléfono» nunca se presenta como «recibido».

## Ejecutar

```bash
npm install
cp .env.example .env     # opcional: sin variables la app funciona con datos de demostración
npx expo start           # escanea el QR con Expo Go en tu celular (Android/iOS)
```

| Variable (`.env`) | Para qué | Obligatoria |
|---|---|---|
| `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Backend real (clave **anónima**; la seguridad es RLS) | No |
| `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` | Mapas en builds nativas (en Expo Go no hace falta) | No |

**Servidor (Supabase), lo hace el equipo una vez.** Las claves de IA son secretas: van como *secrets* de Supabase,
**nunca** en `.env` ni en una variable `EXPO_PUBLIC_*`.

```bash
npx supabase db push                          # aplica las migraciones de supabase/migrations/
npx supabase secrets set MISTRAL_API_KEY=… GROQ_API_KEY=…
npx supabase functions deploy asistente       # Edge Function del asistente (IA + voz)
```

Opcionales: `MISTRAL_MODEL`, `GROQ_MODEL`, `GROQ_STT_MODEL`. Un proveedor sin clave se salta; sin ninguna, el
asistente usa las respuestas fijas. La clave de Groq además activa la voz a texto: sin ella no hay entrada por voz. En la consola de Mistral, **desactiva el uso de datos para entrenamiento**.

Comandos útiles: `npm run check` (todo junto), `npm test`, `npm run typecheck`, `npm run lint`,
`npm run arch:check`, `npx expo-doctor`. Builds: `npx eas-cli@latest build` (ver `eas.json`).

## Stack

| Capa | Tecnología | Por qué |
|---|---|---|
| App | Expo SDK 58, React Native 0.88, React 19, TypeScript estricto | Un código para Android e iOS |
| Rutas | Expo Router (typed routes) | Rutas por archivos, `app/` delgado |
| Estilos | NativeWind v5 (Tailwind v4) + tokens en `src/global.css` | Clases + tema compartido (versiones **fijadas**, ver ADR-0004) |
| Estado local | Zustand (+ `persist`) | Stores pequeños por feature |
| Datos remotos | TanStack Query | Caché y refresco de lecturas |
| Persistencia | `expo-sqlite` (kv), `expo-secure-store` | Offline-first; secretos fuera del kv |
| Backend | Supabase (Postgres + Auth anónima + RLS) | Sin servidores propios ni datos personales |
| Funciones de servidor | Supabase Edge Functions (Deno) | Claves de IA fuera del cliente, límite de uso |
| Asistente con IA | Mistral → Groq (planes gratuitos), Groq Whisper para voz | Sin costo, con respaldo en cadena |
| Voz | `expo-audio` (grabar), `expo-speech` (leer en voz alta) | Más fácil para quien escribe con dificultad |
| Mapas | `react-native-maps` (nativo) · Leaflet + OpenStreetMap (web) | Mapa nativo en el celular |
| Formularios | React Hook Form + Zod | Validación tipada |
| Pruebas | Jest (`jest-expo`) | Lógica pura rápida |

## Arquitectura

```
src/
├── app/            Rutas (Expo Router). Delgadas: re-exportan una pantalla desde `@/features/<x>`
├── features/       Una carpeta por funcionalidad: UI + estado + datos, con un `index.ts` público
│   ├── Pestañas:       home (feed) · events · explore (lugares) · help (Marketplace) · chat · emergency (SOS)
│   ├── Apoyo:          assistant (IA y voz) · business · publish · map · funds · cameras · pets · walk · payments
│   ├── Contenido:      posts (publicaciones, relevancia, recomendaciones) · activity · profile
│   ├── Contexto:       sector · session · onboarding · shell (cabecera, barra, menú) · notifications
│   ├── Datos offline:  outbox (cola de salida) · sync (transporte Supabase + reconciliación)
│   └── dev             Galería del sistema de diseño (solo revisión)
├── shared/         Sin dependencias de features: ui (design system, degradados, ilustraciones),
│                   hooks, nav (stores de UI), storage (kv), supabase (cliente), sync (estados), geo, format
└── global.css      Tokens de diseño (Tailwind v4 @theme)
supabase/           Migraciones SQL (esquema, RLS, tablero, chat, eventos de vecinos, uso del asistente), semillas
                    y functions/ (Edge Functions: `asistente`, y `_shared` con la lógica pura de la cadena de IA)
docs/               Producto, UX, accesibilidad, técnico, specs (SDD) y ADR (decisiones)
scripts/            Ingesta de lugares y comercios con horario (OpenStreetMap) y chequeos
```

### Reglas de dependencia (automatizadas)

1. `app/` → `features/` → `shared/`. **`shared/` nunca importa de `features/`.**
2. Entre features, **solo por `index.ts`**: `@/features/posts` sí, `@/features/posts/algo` no
   (ESLint `no-restricted-imports`).
3. **Sin ciclos** entre módulos (`npm run arch:check`, con `madge`).
4. `sync/` es la capa de orquestación: conoce `outbox`, `posts`, `emergency` y Supabase; solo `app/` depende de ella.

Cómo se resuelven los acoplamientos típicos sin romper las reglas: lo común sube a `shared/` (p. ej.
`gradients`, `illustrations`, `PhotoField`, `usePickPhoto`); un dato que una feature necesita de otra se
inyecta (la campana lee `shared/nav/activityBadgeStore`, que llena `ActivityBadgeSync`; la ruta de Emergencia
pasa el mapa a la pantalla como `nearbyMap`).

## Diagramas

### 1. Capas y módulos

```mermaid
flowchart TD
  subgraph APP["app/ — rutas (Expo Router)"]
    R1["/ · /eventos · /explorar · /marketplace · /mensajes"]
    R2["/emergencias/*"]
    R3["/publicacion/[id] · /evento/[id] · /chat/[id] · /asistente · /vecino/[id] · /perfil · /sector"]
  end

  subgraph FEATURES["features/ — verticales (solo por index.ts)"]
    direction TB
    subgraph SEC["Pestañas y SOS"]
      home & events & explore & help & chat & emergency
    end
    subgraph SUP["Apoyo"]
      assistant & business & publish & map
    end
    subgraph CON["Contenido y contexto"]
      posts & activity & profile & sector & session & onboarding & shell & notifications
    end
    subgraph DATA["Datos offline"]
      outbox --> sync
    end
  end

  subgraph SHARED["shared/ — sin dependencias de features"]
    ui["ui (design system, gradients, illustrations)"]
    hooks & nav["nav (stores de UI)"] & storage["storage (SQLite kv)"] & supabase["supabase (cliente)"] & geo & format
  end

  EF["supabase/functions/asistente (Edge Function)"]

  APP --> FEATURES
  FEATURES --> SHARED
  sync --> supabase
  assistant -->|pregunta / audio| EF
  EF -->|Mistral → Groq| IA["IA gratuita"]
  chat -.contador sin leer.-> nav
  storage -.persiste.-> posts & outbox & sector & session & assistant
```

### 2. Flujo offline-first (de la acción al «recibido»)

```mermaid
sequenceDiagram
  actor U as Vecino
  participant UI as Pantalla (feature)
  participant S as Store local (Zustand + SQLite kv)
  participant O as outbox (cola con UUID)
  participant T as SyncTransport (sync/supabaseTransport)
  participant DB as Supabase (RLS)
  participant R as reconcile

  U->>UI: Reporta / publica / pide ayuda
  UI->>S: Guarda en el teléfono (estado: "guardado")
  UI->>O: Encola la acción (UUID del cliente, prioridad)
  Note over UI: Muestra "Guardado en tu teléfono" (nunca "recibido")
  O->>T: Envía al abrir la app, al volver a primer plano o manualmente
  alt Hay red y servidor
    T->>DB: upsert (reintentar no duplica)
    DB-->>T: OK real
    T-->>O: received
    R->>DB: Lee estados confirmados
    R->>S: Actualiza estado a "recibido"
    UI-->>U: "Recibido por el servidor"
  else Sin red / sin servidor
    T-->>O: error (se queda en cola)
    UI-->>U: Sigue "Guardado en tu teléfono"
  end
```

### 3. Modelo de datos (Supabase, RLS en todas las tablas)

```mermaid
erDiagram
  sectors ||--o{ posts : sector_id
  sectors ||--o{ sector_alerts : sector_id
  sectors ||--o{ emergency_reports : sector_id
  sectors ||--o{ vulnerable_alerts : sector_id
  sectors ||--o{ resource_offers : sector_id
  profiles ||--o{ posts : author_id
  posts ||--o{ post_requests : post_id
  posts ||--o{ post_reports : post_id
  emergency_reports ||--o{ board_responses : target_id
  vulnerable_alerts ||--o{ board_responses : target_id
  posts ||--o{ conversations : post_id
  post_requests |o--o| conversations : request_id
  conversations ||--o{ messages : conversation_id
  messages ||--o{ message_reports : message_id
  sectors ||--o{ events : sector_id
  events ||--o{ event_rsvps : event_id
  sectors ||--o{ sector_events : sector_id

  sectors { text id PK  text name  float center_lat  float center_lng  numeric radius_km }
  profiles { uuid id PK  uuid user_id  text display_name  text trust  int recommendations }
  posts { uuid id PK  uuid author_id FK  text kind  text category  text title  text sector_id FK  jsonb details  text status  timestamptz expires_at }
  post_requests { uuid id PK  uuid post_id FK  uuid requester_id  text status }
  post_reports { uuid id PK  uuid post_id FK  uuid reporter_id  text reason  text status }
  emergency_reports { uuid id PK  uuid user_id  text kind  text category  bool immediate_danger  text sector_id FK  text status }
  vulnerable_alerts { uuid id PK  uuid user_id  text need  text basis  text sector_id FK  text status }
  resource_offers { uuid id PK  uuid user_id  text resource  text sector_id FK  text stage }
  sector_alerts { uuid id PK  text sector_id FK  text title  text severity  text source  bool active }
  board_responses { uuid id PK  uuid target_id  uuid responder_id  text status }
  conversations { uuid id PK  uuid post_id FK  uuid request_id FK  uuid owner_id  uuid requester_id }
  messages { uuid id PK  uuid conversation_id FK  uuid sender_id  text body }
  blocks { uuid blocker_id PK  uuid blocked_id PK }
  message_reports { uuid id PK  uuid message_id FK  uuid reporter_id  text reason }
  events { uuid id PK  uuid organizer_id  text sector_id FK  text title  timestamptz starts_at  text venue_kind  text venue_name  text status }
  event_rsvps { uuid event_id PK  uuid user_id PK }
  sector_events { uuid id PK  text sector_id FK  text kind  text title  timestamptz starts_at  text place_label  text source  bool is_demo }
  assistant_usage { uuid user_id PK  date day PK  int count }
```

> Sin columnas de ubicación precisa: solo `sector_id` (los eventos usan un lugar público o una zona aproximada).
> Texto privado, fotos y diagnóstico de «vecino vulnerable» se quedan en el teléfono. `request_id` de
> `conversations` es opcional desde el chat directo (SPEC-045). `assistant_usage` no tiene políticas: solo la toca
> la Edge Function con `service_role`, y guarda cuántos mensajes hubo, nunca su contenido. El detalle exacto de
> columnas y políticas está en `supabase/migrations/`.

### 4. Navegación

```mermaid
flowchart LR
  OB["/onboarding (1.ª vez)"] --> HOME

  BAR["Barra inferior de 5 (todas las raíces)"] --- HOME["Inicio / (feed)"] & EVE["Eventos"] & EXP["Explorar"] & MKT["Marketplace"] & CHAT["Chat"]
  SOS["SOS en la cabecera: siempre, sin cuenta"] --> EME["Emergencia (stack propio)"]
  HOME -->|«¿Emergencia?»| EME
  HOME -->|«Pregúntale a Yunta»| ASI["/asistente"]
  ASI -->|emergencia detectada| EME
  MENU["Avatar / ☰ menú lateral"] --> PER["Perfil · Guardados · Privacidad · Ajustes · Registrar negocio"]

  HOME --> DET["/publicacion/[id]"]
  HOME --> EVD["/evento/[id]"]
  EVE --> EVD
  EVE --> EVC["/eventos/crear"]
  EXP -->|Lugares · Emprendimientos| REG["/negocios/registrar"]
  MKT --> LIST["/publicaciones"] --> DET
  MKT --> PUB["/publicar"]
  DET -->|Escribir| CHT["/chat/[id]"]
  CHAT --> CHT
  EME --> REP["Reportar · Pedir ayuda · Tablero · Recursos · Mis reportes · Acompáñame"]
  OLD["/ayuda · /comunidad · /negocios"] -.->|redirigen| MKT & HOME & EXP
```

## Estado y persistencia

| Qué | Dónde | Notas |
|---|---|---|
| Preferencias, sector, tutorial, intereses, guardados, publicaciones propias, reportes | Zustand `persist` sobre `shared/storage/kv` (SQLite en el celular; `localStorage` solo en la vista web de desarrollo) | No secretos |
| Sesión anónima de Supabase | Mismo kv (sin datos personales) | Se crea al primer envío |
| Cola de envío | `outbox` (store persistido) | UUID del cliente = idempotencia |
| Lecturas remotas (publicaciones, tablero, alertas) | TanStack Query, `staleTime` corto | Con respaldo de datos de demo |
| Conversación con el asistente | Store persistido en el teléfono (`features/assistant/store.ts`) | El servidor no guarda mensajes, solo el conteo diario en `assistant_usage` |
| Secretos/tokens | `expo-secure-store` | Nunca en el kv |
| Claves de IA (Mistral, Groq) | Secrets de Supabase, solo en la Edge Function | Nunca en el cliente |

## Mapas

`CommunityMap` es **un solo componente reutilizable** que se incrusta en cada sección (`layers`, `embedded`, `height`):
Explorar (capa «Comercios» de OSM y emprendimientos) y Publicaciones con alternador Lista ⇄ Mapa, y Emergencia
para incidentes, recursos y la capa «Lugares de referencia» (salud, farmacia, seguridad, refugio: sin comercios). Se dibuja con `react-native-maps` (la vista web de desarrollo usa Leaflet, solo para revisar en el computador). Los marcadores son
**pines** con la punta sobre la coordenada y el icono de su capa; todos los puntos son zona aproximada.

## Recomendaciones

`recommendPosts` (`features/posts/recommend.ts`) parte de la relevancia general (`rankPosts`: cercanía,
frescura, confianza, urgencia) y suma peso a las categorías que la persona más abre o guarda
(`interestStore`, solo en su teléfono); baja lo ya visto, nunca recomienda lo propio y explica el motivo
(«Porque miras herramientas»).

## Pruebas y CI

- `npm test` — Jest (`jest-expo`), pruebas de lógica pura junto al código (`*.test.ts`): relevancia,
  recomendaciones, filtros, rubros, barra (`resolveBar`), feed del Inicio, chat (inicio, sin leer), eventos
  (agrupación, «Voy», esquema), horarios de OSM (`openingHours`), lugares de Explorar y asistente (detección de
  emergencias, ocultar datos personales, respuestas fijas, cadena de proveedores en `assistantCore`, voz).
- La Edge Function se revisa con `deno check supabase/functions/asistente/index.ts`.
- `npm run check` — typecheck + lint (incluye límites entre features) + ciclos (`madge`) + pruebas.
- GitHub Actions (`.github/workflows/ci.yml`) corre `npm run check` en cada push a `main` y en cada PR.
- Lo que no cubre una prueba (pantallas, dos dispositivos, modo avión, letra grande) se verifica a mano en Expo Go.

## Trabajar con IA

El repo está preparado para trabajar con asistentes de IA sin romper la arquitectura:

- [`CLAUDE.md`](CLAUDE.md): comandos, dónde va cada cosa, reglas de dependencia, convenciones y trampas conocidas.
- [`AGENTS.md`](AGENTS.md): reglas de Expo (las APIs cambian por SDK; consultar la doc versionada).
- **SDD + TDD** ([`sprints.md`](sprints.md)): spec corta con criterios Dado/Cuando/Entonces
  ([plantilla](docs/specs/_plantilla.md)) → prueba que falla → código mínimo → refactor → `npm run check`.
- [`docs/adr/`](docs/adr): decisiones de arquitectura (features verticales, offline-first, Supabase+RLS, NativeWind
  fijado, pagos fuera del outbox y navegación «comunidad primero», ADR 0006).
- Las reglas son **ejecutables** (lint, madge, Jest, CI): si la IA se salta una, el chequeo falla.

## Convenciones de producto

- Accesibilidad: áreas táctiles ≥ 48 dp, `accessibilityLabel`/`Role`, estado con texto + icono, escalado de fuente.
- Todo dato ficticio muestra `DemoTag`; los estados de envío usan `SyncStatusBadge`.
- Código en inglés; textos de interfaz y documentación en español.
- Tokens de color en `src/global.css`, espejados en `src/shared/ui/theme.ts`.

## Documentación

[`PRODUCT.md`](PRODUCT.md) (producto) · [`context.md`](context.md) (contexto de la app) · [`sprints.md`](sprints.md)
(plan de sprints) · [`docs/`](docs) (brief, UX, accesibilidad, técnico) · `design/stitch/` (referencias visuales).

## Deuda técnica y próximos pasos

- Partir `features/emergency` (~3 000 líneas, 29 archivos) y `publish/PublishScreen.tsx` (~570 líneas) en subfeatures.
- Más pruebas: `buildMapPoints`, orden de la cola `outbox`, y pruebas de RLS contra una rama de Supabase (nunca producción).
- Pruebas de pantallas con React Native Testing Library para Inicio, barra y formularios.
- Notificaciones push remotas (hoy son locales) y tablero con tiempo real.
- Asistente: cargar las claves, desplegar la función y probarlo con los proveedores reales. Hasta ahora nunca se
  llamó a Mistral, Groq ni Whisper desde este repo; falta también probar la voz en un celular (SPEC-049/050).
- Verificar el SOS de la cabecera y la tarjeta «¿Emergencia?» con TalkBack y letra grande (ADR 0006, SPEC-013).
- Normalizar saltos de línea a LF en todo el repo (`.gitattributes` + `.editorconfig` ya definidos).

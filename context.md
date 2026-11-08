# Yunta — Contexto de la app

Documento de traspaso para retomar el trabajo (personas o IA). Resume qué es la app, cómo está
construida, qué está hecho y qué falta. **Fuente de verdad del producto: `docs/`.**
`design/stitch/` es solo referencia visual. Última actualización: 2026-11-08 (rama `shay-4-espacios`: barra de 4
pestañas, integraciones, asistente con IA y APK por EAS). Plazo de la app: 8 nov · final de la hackatón: **17 nov 2026, 6:00 p. m.**
(20 min: 5 de presentación + 15 con la app funcionando).

## 0. Resumen rápido (qué hay hoy)

- **Navegación:** barra de 5 pestañas **Inicio · Comunidad · Negocios · Ayuda · Chat**; SOS rojo en la cabecera (abre Emergencia);
  burbuja flotante = asistente virtual con la mascota. El Inicio no tiene barra: 4 botones grandes. (ADR 0007 / SPEC-051)
- **Comunidad:** feed de vecinos, eventos con «Voy», chat directo 1 a 1, lugares del barrio (OSM), **fondos vecinales**,
  **cámaras vecinales**, **perrito comunitario**, **Acompáñame / Llegué bien**.
- **Emergencia:** necesito ayuda, reportar, ofrecer recurso, vecino vulnerable, tablero compartido en vivo, mapa por capas.
- **Asistente de Yunta con IA gratuita** (Mistral → Groq → respuestas fijas) y por voz (Groq Whisper).
- **Accesibilidad:** Modo fácil (letra ×1,25, botones ≥ 64 dp, una columna, «Escuchar») y tutorial interactivo.
- **Offline-first:** cola local (outbox en SQLite) que sincroniza con Supabase; «Guardado en tu teléfono» ≠ «Recibido».
- **Distribución:** APK de Android + actualizaciones por aire con EAS gratis (`docs/04_tecnico/guia_apk_y_actualizaciones.md`).
- **Todo es gratis** (regla del proyecto): si un servicio empieza a costar, se avisa antes de usarlo.

---

## 1. Qué es

App móvil (Android/iOS) para una hackatón de 48 h. **«Tu comunidad, más cerca.»**
Conecta vecinos para el día a día (préstamos, trueques, servicios, cuidados) y para coordinar
apoyo durante emergencias.

**Límite clave:** la app coordina vecinos. No reemplaza a servicios oficiales, no promete tiempos de
respuesta y nunca dice que un reporte fue «recibido» si solo está en el teléfono.

## 2. Verdades de producto (cerradas)

- Explorar sin registro. Registro (solo nombre público) para publicar, contactar, guardar y
  reportar publicaciones. Reportar una emergencia **no** exige cuenta.
- Ubicación pública **aproximada** (sector). Nunca se persisten coordenadas del dispositivo.
- Mock primero; Supabase desde la etapa 10. Sin `.env`, la app funciona con mocks.
- Los pagos (fondos vecinales) son **simulados** y siempre se dice así; van solo en línea, nunca por el outbox (ADR 0005).
- Sin ubicación en vivo en ninguna función (Acompáñame avisa por tiempo, no por GPS).
- Todo dato ficticio lleva `DemoTag` («DATO DE DEMO»). Sin personas reales en demos de vulnerabilidad.
- `SyncStatusBadge`: «Guardado en tu teléfono» nunca se muestra como «recibido».
  «Recibido» ≠ «validado».
- Números de emergencia configurables (territorio + fecha de revisión) con aviso de confirmarlos.
- «Ayudar a un vecino vulnerable» vive dentro de Emergencias: sin pestaña ni módulo aparte.
- SOS visible en `TopBar` y en el onboarding; abre `/emergencias`.
- Mapas: `react-native-maps`. Lugares: OSM/Overpass (Lince por defecto). No scrapear Google Maps.
- Un solo tema claro. UI en español, código en inglés.

## 3. Stack

Expo SDK 58 · React Native 0.88 · React 19.3 · TypeScript 6 · Expo Router (typed routes, React
Compiler) · NativeWind v5 RC + Tailwind v4 (**versiones fijadas, no actualizar**) · Zustand
(persist) · TanStack Query · React Hook Form + Zod · expo-sqlite (almacén KV) · expo-crypto (UUID) ·
expo-image / expo-image-picker · expo-location · react-native-maps · expo-audio (nota de voz y dictado) ·
expo-speech («Escuchar») · expo-notifications (locales) · expo-updates (actualizaciones por aire) ·
Supabase (`@supabase/supabase-js`, Postgres + RLS + Edge Functions) · Leaflet (solo vista previa web) ·
@react-native-community/netinfo · expo-network.

Comandos:

```bash
npm run check          # typecheck + lint + arch:check (ciclos) + tests. Correr antes de decir «listo».
npx expo start         # verificación real: Expo Go en el celular (no la web)
npx expo install <pkg> # nunca npm/yarn add directo
```

Reglas de flujo de trabajo (ver `CLAUDE.md` y `sprints.md`): SDD + TDD (spec corta en `docs/specs/SPEC-NNN-*.md`,
prueba que falla, código mínimo, `npm run check`); decisiones de arquitectura en `docs/adr/`; **no hacer commit ni push sin
que se pida**, un cambio por commit, mensajes en español. Antes de usar una API de Expo, leer la doc de SDK 58 (`AGENTS.md`).
Reglas de arquitectura (las hace cumplir el lint y `arch:check`): `app/ → features/ → shared/`; entre features solo por `index.ts`; sin ciclos.

## 4. Arquitectura y convenciones

```
src/
├── app/                 Rutas finas de Expo Router (solo re-exportan pantallas)
├── features/<nombre>/   UI + dominio + datos, con index.ts público
├── shared/              ui/, sync/, storage/, geo/, format/  (no importa features)
└── global.css           Tokens Tailwind v4 (@theme), espejados en shared/ui/theme.ts
```

- Features se importan entre sí **solo por su `index.ts`**. `shared/` no importa `features/`.
- Alias `@/*` → `src/*`.
- Persistencia: Zustand `persist` + `kvStorage` (`shared/storage/kv.ts`, SQLite; `kv.web.ts` usa
  localStorage). Claves `rvs.<nombre>.v1`.
- Accesibilidad: táctiles ≥ 48 dp, `accessibilityRole/Label`, estados con texto + icono (nunca solo
  color), escalado de fuente (máx. 1.8).

### Design system (`src/shared/ui`)
`Text` (variantes display…overline, tonos), `Button` (primary/secondary/tonal/danger/outline/ghost),
`Card` (default/low/error/warning), `Badge`, `Chip` (radio/checkbox), `TextField`, `BottomSheet`,
`SegmentedControl`, `SyncStatusBadge`, `DemoTag`, `Icon` (MaterialCommunityIcons), `Screen`
(safe areas, footer fijo), `ScreenHeader`, `ComingSoon` (marcador honesto de etapa), `cn`, `colors`, `Avatar`.
Paleta (8 nov 2026): morado `#6A2BD9` (primario), lavanda `#B78CFF`, amarillo Yunta `#F7C948` (acento, texto oscuro
encima), blanco cálido `#F8F5FF` (fondo); los degradados con texto blanco tienen ≥ 4,5:1 en ambos extremos.

### Estado global reutilizable
| Store | Dónde | Clave | Qué guarda |
|---|---|---|---|
| `useSessionStore` | features/session | rvs.session.v1 | registro simulado, nombre público, `deviceId` |
| `useRegistrationGate` | features/session | — | hook que abre `RegistrationSheet` solo cuando hace falta |
| `useSectorStore` | features/sector | rvs.sector.v1 | sector elegido (nunca coordenadas) |
| `useOnboardingStore` | features/onboarding | rvs.onboarding.v1 | tutorial completado |
| `useOutboxStore` | features/outbox | rvs.outbox.v1 | cola local de acciones |
| `useLocalPostsStore` | features/posts | rvs.local-posts.v1 | publicaciones propias |
| `useSavedStore` | features/posts | rvs.saved.v1 | guardados y colecciones |
| `useContactStore` | features/posts (contactStore.ts) | rvs.contact-requests.v1 | solicitudes de contacto |
| `useReportStore` | features/posts (reportStore.ts) | rvs.post-reports.v1 | reportes de moderación |
| `usePublishDraftStore` | features/publish | rvs.publish-draft.v1 | borrador de publicación |
| `useProfilePrefsStore` | features/profile | rvs.profile.v1 | bio, privacidad, voluntariado declarado |
| `useEmergencyStore` | features/emergency | rvs.emergency.v1 | reportes de emergencia y ofertas de recursos |

### Cola local (outbox)
`OutboxItem = { id (UUID), type, payload, createdAt, deviceId, syncStatus, priority, attempts }`.
Tipos: `post.create`, `interaction.request`, `moderation.report`, `emergency.vulnerable`, `emergency.help`,
`emergency.incident`, `resource.offer`. Prioridades: `emergency` > `urgent` > `normal`.
Hoy todo queda en `syncStatus: 'local'` (no hay servidor).

### Estados de sincronización (`shared/sync/status.ts`)
`local` (Guardado en tu teléfono) → `pending` → `sending` → `received` (no implica validado) →
`in_review` → `validated` → `resolved`.
Emergencias usa además su propio `IncidentStatus` (`features/emergency/types.ts`): añade
`coordinated` (atención coordinada) y los alternos `duplicate`, `unverifiable`, `dismissed`.

## 5. Navegación (rutas)

| Ruta | Pantalla | Feature |
|---|---|---|
| `/onboarding` | Tutorial de 7 pasos (omitible, con SOS) | onboarding |
| `/sector` (modal) | Elegir sector por GPS o manual | sector |
| `/(tabs)/` Inicio | **Feed comunitario** (SPEC-044): alerta, 4 botones grandes (sin barra inferior), «Juntos por el barrio», publicaciones y eventos | home |
| `/(tabs)/eventos` | Eventos del sector por fecha + «Crear evento» (SPEC-046) | events |
| `/(tabs)/explorar` | **Lugares del barrio** (OSM, «Abierto ahora» honesto) + Emprendimientos (SPEC-047) | explore, business |
| `/(tabs)/ayuda` | Ayuda (antes «Marketplace»): ofrecer, pedir, objetos y animales | help |
| `/(tabs)/publicaciones` | Lista de publicaciones con filtros y relevancia; Lista ⇄ Mapa (antes `/explorar`) | explore |
| `/(tabs)/mensajes` | Pestaña Chat: conversaciones, sin leer (SPEC-045/048) | chat |
| `/(tabs)/publicar` | Publicar en 3 pasos con borrador local | publish |
| `/(tabs)/marketplace`, `/comunidad`, `/negocios` | Rutas viejas: redirigen a Ayuda, Comunidad (`/eventos`) y Negocios (`/explorar`) | — |
| `/evento/[id]`, `/eventos/crear` | Detalle con «Voy» / cancelar; crear en 2 pasos | events |
| `/chat/[id]` | Hilo 1 a 1: bloquear, reportar mensaje | chat |
| `/(tabs)/actividad` | Bandeja: cola local + solicitudes, filtros, leído/no leído | activity |
| `/(tabs)/perfil` | Perfil / Guardados / Ajustes | profile |
| `/publicacion/[id]` | Detalle: guardar, «Escribir» (chat directo, inyectado desde la ruta), reportar | posts |
| `/vecino/[id]` | Perfil público de un vecino | profile |
| `/emergencias` | Centro de emergencias (stack propio, cabecera roja) | emergency |
| `/emergencias/necesito-ayuda` | Tipo, zona, detalle/foto opcionales, peligro inmediato | emergency |
| `/emergencias/reportar` | Reportar incidente (6 categorías) | emergency |
| `/emergencias/estado/[id]` | Estado real + línea de seguimiento + números | emergency |
| `/emergencias/ofrecer` | Ofrecer recurso + ciclo Ofrecido→Confirmado (requiere registro) | emergency |
| `/emergencias/recursos` | Necesidades y recursos (demo + mis ofertas) | emergency |
| `/emergencias/guardia` | **Modo guardia por voz** (SPEC-052, ADR 0008): escucha en toda la app (con la app a la vista), confirma por voz, abre el marcador y prepara el aviso con ubicación exacta (una vez, sin guardar) | guard |
| `/emergencias/vecino-vulnerable` | Flujo de 3 pasos (acción → necesidad + zona → revisar), sin nombre ni diagnóstico | emergency |
| `/emergencias/tablero` | Tablero del sector: vulnerabilidad (prioridad, no validada), incidentes, necesidades, recursos | emergency |
| `/emergencias/acompaname` | Acompáñame / Llegué bien: 1–3 vecinos, 10/15/30 min, cuenta regresiva, sin ubicación en vivo (SPEC-039) | walk |
| `/fondos/[id]`, `/fondos/aportar/[id]` | Fondo vecinal: meta, barra de avance, rendición de cuentas; aportar con pago **simulado** (SPEC-034) | funds |
| `/camaras`, `/camaras/[id]`, `/camaras/registrar` | Cámaras vecinales (celular con IP Webcam → cámara del sector), «Financiada por N vecinos» (SPEC-035) | cameras |
| `/perrito/[slug]` | Perfil del perrito comunitario: «Lo vi» / «Necesita ayuda»; el QR del collar abre `yunta://perrito/negrito` (SPEC-038) | pets |
| `/asistente` | Asistente de Yunta con IA, por texto o voz (SPEC-049/050) | assistant |
| `/galeria` | Galería del design system (solo revisión) | dev |

Las tabs redirigen a `/onboarding` si no se completó; `/emergencias` nunca se bloquea.
**Barra (Etapa 13, ADR 0007 / SPEC-051):** Inicio · Comunidad · Negocios · Ayuda · Chat, en las raíces; la burbuja flotante es el asistente. Emergencia se abre
con el SOS de la cabecera; el Inicio no muestra la barra (tiene 4 botones grandes); en Emergencia y Mensajes la barra se ve sin pestaña resaltada (`shell/sections.ts` → `resolveBar`).

## 6. Features en detalle

- **shell** — `TopBar` (marca, sector actual, botón SOS) y `AppTabBar`.
- **onboarding** — 7 pasos en `steps.ts`; se puede omitir; SOS siempre accesible.
- **sector** — catálogo: Lince (por defecto), Jesús María, San Isidro, La Victoria. GPS opcional
  (`detectSector` → `findNearestSector`), solo se guarda el sector.
- **posts** — tipos, 6 categorías (herramientas, servicios, productos, trueque, movilidad, cuidados),
  `demoPosts` (con `isDemo`), filtros, relevancia (`relevance.ts`, no invisibiliza vecinos nuevos),
  `PostsRepository` (interfaz; hoy `demoPostsRepository`, Supabase en la etapa 10), hooks de TanStack
  Query, `PostCard`, `ContactRequestSheet`, `ReportSheet`, `PostDetailScreen`.
- **home / explore** — Inicio con relevancia y alerta de sector simulada; Explorar con búsqueda,
  `FiltersSheet`, Lista/Mapa (Mapa pendiente).
- **publish** — 3 pasos (Tipo → Detalles → Confirmar), Zod, plantillas por categoría, voz simulada,
  foto opcional, vigencia; guarda en `useLocalPostsStore` + outbox.
- **profile** — perfil propio, guardados/colecciones, ajustes de privacidad, voluntariado declarado
  (sin verificación real hasta la etapa 10), `NeighborScreen`.
- **session** — registro simulado (nombre público + consentimiento), `useRegistrationGate`.
- **outbox** — cola local descrita arriba.
- **emergency** (etapa 6) — `EmergencyCenterScreen` con aviso oficial, botón «Peligro inmediato»
  (un toque, sin formulario), `EmergencyNumbersCard` (105 / 116 / 106 para Lima, configurables en
  `emergencyNumbers.ts`, con fecha y aviso), seis accesos y «Mis reportes en este teléfono».
  Fotos sin EXIF. Zona = sector.
- **activity** — `feed.ts` (cola + contactos, alertas arriba), `readStore.ts` (rvs.activity-read.v1), filtros Todo/Solicitudes/Mensajes (vacío honesto)/Comunidad/Alertas.
- **map** (etapa 8) — `CommunityMap` (chips de 7 capas, mapa nativo o lista), `buildMapPoints` (publicaciones + tablero + perfil), `approx.ts` (zona aproximada determinista desde el centro del sector; nunca GPS), `places.ts` + `data/places.json` (2424 lugares OSM de los 4 sectores, ODbL: 975 de referencia de Emergencia + 1449 comercios con `opening_hours` cuando existe, capa «Comercios»; se regenera con `node scripts/fetch-places.mjs`), `NativeLayerMap` (`.web` devuelve null). `app.config.js` inyecta la clave a las builds nativas.
- **dev** — galería del design system.
- **chat / events / explore** (etapa 13) — chat directo 1 a 1 con bloqueo y reporte, bandeja con sin leer (pestaña Chat)
  (`ChatFab`); eventos de vecinos con «Voy»; lugares OSM con «Abierto ahora» honesto. Migraciones `…06_chat`, `…08_open_chat`,
  `…09_neighbor_events`, `…10_chat_last_from_me`.
- **funds + payments** (SPEC-034, ADR 0005) — fondos vecinales con meta, avance y gastos con boleta. `PaymentsProvider` con
  `mockProvider` (pago simulado e idempotente, `idempotencyKey`); los pagos nunca pasan por el outbox. Pasarela real: pendiente (SPEC-036).
- **cameras** (SPEC-035) — cámaras vecinales por URL de stream (`streamUrl.ts`), estado en texto («En vivo» / «Sin señal»),
  vínculo con el fondo que las financió. Hoy sin servidor (datos demo + locales).
- **pets** (SPEC-038) — perrito comunitario, avistamientos y aviso de ayuda; enlace profundo `yunta://perrito/<slug>`.
- **walk** (SPEC-039) — Acompáñame: temporizador y aviso local si no marcas «Llegué bien».
- **assistant** (SPEC-049/050) — pantalla de chat con IA. El cliente llama a la Edge Function `supabase/functions/asistente`,
  que prueba **Mistral → Groq → respuestas fijas**; límite de 20 mensajes/persona/día (migración `…11_assistant_usage`).
  Si el mensaje suena a emergencia **no se llama a la IA** (se muestra la guía del SOS/105); teléfonos, correos y DNI se
  ocultan antes de salir. Voz: grabación → Groq Whisper → texto editable; respuestas con «Escuchar» (expo-speech).
- **tour** — recorrido guiado interactivo sobre los botones reales (`TourOverlay`, `steps.ts`). **Modo fácil** (SPEC-027): ajuste
  global de letra grande, botones ≥ 64 dp y una columna, elegible en el tutorial o en Ajustes → «Cómo ver la app».
- **shell** (hoy) — además de `TopBar`/`SectionBar`: `BrandSplash` (entrada con el nombre animado), `ProfileDrawer`, `EdgeSwipe`,
  `SectionHeader`, `BackHeader`; `sections.ts` decide qué barra se ve en cada ruta (`resolveBar`).

## 7. Estado por etapas

| Etapa | Estado |
|---|---|
| 0. Scaffold | Hecho |
| 1. Design system y navegación | Hecho |
| 2. Onboarding y sector | Hecho |
| 3. Inicio y Explorar | Hecho (mapa en etapa 8) |
| 4. Detalle y publicar | Hecho |
| 5. Perfil y confianza | Hecho |
| 6. Centro de emergencias | Hecho (pendiente verificación visual en Expo Go) |
| 7. Seguimiento y tablero | Hecho (pendiente verificación visual en Expo Go) |
| 8. Mapa por capas | Hecho (pendiente verificación visual en Expo Go) |
| 9. Cola offline en SQLite | Hecho (pendiente verificación en modo avión en Expo Go) |
| 10. Supabase | Hecho (rama `etapa-10-supabase`, ya en `main`) |
| 11. Tablero compartido y emprendimientos | Hecho (rama `etapa-11-tablero-emprendimientos`; pendiente probar con dos dispositivos) |
| 13. Comunidad primero (SPEC-043 a 048) | Hecho en la app (rama `shay`); pendiente aplicar migraciones 08–10 y probar con dos dispositivos |
| 13b. Barra de 5 pestañas + burbuja del asistente (SPEC-051, ADR 0007) | Hecho en la rama `shay-4-espacios`; falta verificar en Expo Go |
| Integraciones F1: fondos, cámaras, perrito, Acompáñame (SPEC-034/035/038/039) | Hecho sin servidor (datos demo + locales); `docs/plan_integraciones_definitivo.md` |
| 14. Asistente con IA y voz (SPEC-049/050) | Hecho en código; faltan claves, desplegar la función y probar con IA real |
| Modo fácil, tutorial interactivo, favoritos de negocios, «¿cuántas personas?» (SPEC-026/027/029) | Hecho |
| Distribución: APK + actualizaciones por EAS | Preparada (`eas.json`, `app.json`); falta `eas login` y el primer build |

## 8. Lo que falta

### Pendientes principales (de cara a la final del 17 nov)
1. **Verificar todo en Expo Go** en un celular real (barra de 5 pestañas, Inicio, chat, mapa, modo avión) y con 2 dispositivos
   para el tablero y el chat.
2. **Supabase:** aplicar migraciones 08–11 (`open_chat`, `neighbor_events`, `chat_last_from_me`, `assistant_usage`) y sus pruebas de RLS.
3. **Asistente:** crear claves de Mistral y Groq (gratis), cargarlas como secretos, desplegar `asistente` y probar con IA real.
4. **APK:** `eas login` → `update:configure` → subir variables `EXPO_PUBLIC_*` → `eas build -p android --profile preview`
   (guía en `docs/04_tecnico/guia_apk_y_actualizaciones.md`; plan gratis: ~15 builds, `eas update` ilimitado).
5. **Integraciones fase 2** (según `docs/plan_integraciones_definitivo.md`): pasarela de pago real (SPEC-036, solo si es gratis),
   servidor para fondos, cámaras y perrito.
6. Imágenes definitivas (portadas, fotos de negocios) en `assets/images/`; hoy hay bloques de color con ícono.
7. **Sin pitch ni guion de demo por ahora:** el foco es que la app funcione de punta a punta.

### Etapa 13 — Comunidad primero — HECHA en la app (plan: `docs/04_tecnico/plan_etapa13_comunidad_primero.md`)
- 13a barra de 5 + redirecciones (SPEC-043) · 13b Inicio como feed + `Avatar` (SPEC-044) · 13c chat directo con
  bloqueo/reporte (SPEC-045) · 13d eventos de vecinos con «Voy» (SPEC-046) · 13e Explorar lugares con horario honesto
  (SPEC-047) · 13f sin leer + notificación del chat, foto de perfil local, ADR 0006 (SPEC-048).
- **Falta:** aplicar en Supabase `20261110000008_open_chat.sql`, `…09_neighbor_events.sql` y `…10_chat_last_from_me.sql`
  (ninguna se ha ejecutado contra una base), sus pruebas de RLS y la verificación con dos celulares.

### Etapa 7 — HECHA (referencia de lo implementado)
- «Ayudar a un vecino vulnerable» en 3 pasos: acción → tarjeta de necesidad + zona → revisar y
  guardar. Diagnóstico, nota de voz y foto opcionales. **No pedir nombre, teléfono ni diagnóstico.**
  Separar en la UI: condición de vulnerabilidad reportada / necesidad / emergencia validada.
  Indicar reportado por tercero, si la persona está presente o lo autorizó.
- Tablero del sector: incidentes, necesidades y recursos (locales + demo), prioridad visual para
  vulnerabilidad reportada con la leyenda «no validada»; registrar motivo, fuente, hora y estado.
- Bandeja Actividad: lista cronológica de outbox + solicitudes de contacto. Filtros Todo,
  Solicitudes, Mensajes (vacío y honesto: no hay chat), Comunidad, Alertas. Alertas arriba.
  Leído/no leído en el teléfono.

### Etapa 8 — HECHA (referencia de lo implementado)
- Segmento Mapa de Explorar con `react-native-maps` en iOS/Android (Expo Go no necesita clave; la clave de
  Google solo hace falta en builds de producción). En web, lista equivalente con aviso.
- Capas: incidentes, necesidades, recursos, voluntarios, zonas afectadas, publicaciones.
  Puntos en zona aproximada (jitter / centro del sector). Tocar un punto abre el detalle existente.
- Script OSM/Overpass para lugares de Lince, datos versionados en el repo (`scripts/`).
- El acceso «Mapa comunitario» del Centro de emergencias debe apuntar a esta vista.

### Etapa 9 — HECHA (referencia: `features/outbox`, `SyncTransport` enchufable para la etapa 10)
- Mover outbox a una tabla `sync_queue` en expo-sqlite (mismos campos). Orden por prioridad,
  reintento visible, no pisar reportes críticos en conflicto.
- Sin servidor el tope es «local» o «pendiente». Bloque en Ajustes con la cola y el último intento.
- Probar en modo avión.

### Etapa 10 — Supabase — HECHA (rama `etapa-10-supabase`)
- Esquema/RLS/semillas en `supabase/`; transporte `features/outbox/supabaseTransport.ts`; estados desde servidor en
  `features/sync`; alertas reales en `sector_alerts` (sin demoAlert); ofertas con cantidad y entregas parciales.
- Requiere `Allow anonymous sign-ins` activado en el proyecto de Supabase.

#### Plan original de la etapa 10
- `supabase/` está vacío: esquema SQL, RLS y semillas ficticias.
- Auth anónima solo con `EXPO_PUBLIC_SUPABASE_URL` + `EXPO_PUBLIC_SUPABASE_ANON_KEY`; sin service role.
- Implementación Supabase detrás de `PostsRepository` (y emergencias). Sin env → mock.
- RLS: público aproximado y no identificable; ubicación precisa nunca sale al cliente.
- Pasar a «recibido» solo tras respuesta real del servidor.

### Etapa 11 — Tablero compartido, emprendimientos, Inicio y mapa — HECHA (rama `etapa-11-tablero-emprendimientos`)
- Supabase (`20261108000003_shared_board.sql`): `board_responses` (sin políticas, solo vía funciones) y las funciones
  `sector_board`, `respond_to_board_item`, `resolve_my_board_item`, `sector_impact`. Solo exponen tipo, sector, estado,
  hora y conteos; nunca `user_id`, detalle, diagnóstico ni foto. La categoría `business` ya cabe en `posts`.
- Cliente: `features/emergency/sharedBoard.ts` (consulta cada 8 s). El tablero muestra «Avisos de vecinos de tu sector (en vivo)»
  con «Voy a ayudar» → «Ya llegué»; quien avisó ve cuántos vienen y cierra con «Ya fue atendido». Lo que el servidor ya muestra no se repite desde el teléfono.
- Emprendimientos: categoría `business` (plantillas, 3 demos, capa propia en el mapa, tarjeta grande y carrusel en el Inicio).
- Inicio estilo «super app» (`features/home`). Mapa interactivo: marcadores con ícono, cámara que sigue la selección, buscador, recentrar, ampliar, avisos en vivo (`MapFab`, `NativeLayerMap`).
- Voz real: `VoiceNoteField` (expo-audio) graba/escucha/borra; la nota se queda en el teléfono. «Escuchar» (`ListenButton`, expo-speech).
  El dictado a texto de Publicar sigue simulado (Expo no trae reconocimiento de voz).
- Notificaciones LOCALES (`features/notifications`) al aparecer un aviso nuevo en el sector. No es push remoto (Expo Go no lo permite en Android).
- **Emprendimientos como sección propia** (`features/business`): pestaña «Negocios» (`(tabs)/negocios.tsx`), registro en `negocios/registrar.tsx`,
  detalle reutilizando `/publicacion/[id]` (variante de negocio en `PostDetailScreen`). Rubro, horario y entrega viajan en `details` (`rubros.ts`); sin migración nueva.
  Explorar y Publicar usan `HELP_CATEGORIES` (sin `business`); el mapa sí muestra los negocios en su capa (`?view=map&layer=business`).
  Barra inferior: Inicio · Explorar · Publicar (+) · Negocios · Perfil. Actividad se abre desde la campana del Inicio (contador: `useUnreadActivityCount`).
  El filtro «Abierto ahora» del diseño es «Disponible ahora» en la app (no hay horarios estructurados). Sin micrófono en el registro (no hay dictado real).
- **Navegación por sección (etapa 11c)**: la barra inferior vive en el diseño raíz (`features/shell/SectionBar.tsx` + `sections.ts`) y cambia según la pantalla.
  El Inicio NO tiene barra: se entra a cada sección desde sus 4 tarjetas grandes (y se vuelve con la pestaña Inicio). Día a día: Vecinos · Publicar (+) · Mapa · Solicitudes. Emprendimientos: Negocios · Mapa · Mi negocio · Solicitudes.
  Confianza: Perfil · Guardados · Privacidad · Ajustes (parámetro `tab` de `/perfil`). Emergencia (acento rojo): Ayuda · Tablero · Recursos · Mis reportes (`/emergencias/mis-reportes`).
  Solo las pantallas raíz muestran barra; formularios y detalles quedan limpios. `Mapa` y `Solicitudes` se resuelven por la sección de origen (`useBarStore.lastSection`).
  `Screen` no suma margen inferior si hay barra (`useBarStore.visible`). Las pestañas de `(tabs)` ya no dibujan barra propia.
- **Inicio = novedades del barrio** (`features/home`): alerta del sector, tarjeta «hoy» con la ilustración del barrio (react-native-svg), filtros y tarjetas de las 4 secciones.
  Las imágenes definitivas (portadas, fotos de negocios) aún no están: hoy son bloques de color con ícono. Irán en `assets/images/inicio/` y `assets/images/negocios/`.
- Para probar el tablero hacen falta dos dispositivos (cuentas anónimas distintas): nadie puede responder a su propio aviso.

### Pendientes menores conocidos
- Verificar la etapa 6 en Expo Go (no se probó en dispositivo).
- Dictado a texto en Publicar sigue simulado (la nota de voz de Emergencia sí graba de verdad; el asistente usa Groq Whisper).
- `*.web.tsx` (`BoardNotifier`, `NativeLayerMap`, `kv`, `queueDb`, `ChatNotifier`) son solo vista previa en el navegador; no es objetivo de producto.

## 9. Documentos a leer antes de programar

1. `docs/01_producto/brief_producto_y_decisiones.md`
2. `docs/02_ux_ui/arquitectura_y_flujos.md` (§6–11)
3. `docs/03_accesibilidad_emergencias/requisitos_inclusion_y_crisis.md`
4. `docs/04_tecnico/stack_y_mvp_48h.md`
5. `docs/05_prompts_ia/prompt_implementacion_react_native.md`
6. `AGENTS.md` (Expo SDK 58: no usar APIs de memoria)
7. `CLAUDE.md` (comandos, reglas de dependencia y trampas conocidas) y `sprints.md` (plan y metodología SDD + TDD)
8. `docs/adr/` (decisiones de arquitectura: 0001–0007) y `docs/specs/` (una spec por funcionalidad)
9. `docs/plan_integraciones_definitivo.md` y `docs/04_tecnico/guia_apk_y_actualizaciones.md`

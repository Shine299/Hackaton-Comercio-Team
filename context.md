# Red Vecinal Solidaria — Contexto de la app

Documento de traspaso para retomar el trabajo (personas o IA). Resume qué es la app, cómo está
construida, qué está hecho y qué falta. **Fuente de verdad del producto: `docs/`.**
`design/stitch/` es solo referencia visual. Última actualización: 2026-11-07 (tras la etapa 6).

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
- Mock primero. Supabase solo en la etapa 10. Sin `.env`, la app funciona con mocks.
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
expo-image / expo-image-picker · expo-location · react-native-maps (aún sin usar) ·
@react-native-community/netinfo · expo-network.

Comandos:

```bash
npx expo start        # verificación real: Expo Go en el celular (no la web)
npx tsc --noEmit      # typecheck  (obligatorio en verde)
npx expo lint         # lint       (obligatorio en verde)
npx expo install <pkg># nunca npm/yarn add directo
```

Reglas de flujo de trabajo: una etapa por sesión; al terminar tsc + lint en verde, actualizar la
tabla del README y parar. **No hacer commit.** Antes de usar una API de Expo, leer la doc de SDK 58
(`AGENTS.md`).

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
(safe areas, footer fijo), `ScreenHeader`, `ComingSoon` (marcador honesto de etapa), `cn`, `colors`.

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
| `/(tabs)/` Inicio | Inicio inteligente + aviso de sector (demo) + accesos SOS | home |
| `/(tabs)/explorar` | Lista con filtros y relevancia; segmento Mapa = mapa por capas (`?view=map` lo abre directo) | explore |
| `/(tabs)/publicar` | Publicar en 3 pasos con borrador local | publish |
| `/(tabs)/actividad` | Bandeja: cola local + solicitudes, filtros, leído/no leído | activity |
| `/(tabs)/perfil` | Perfil / Guardados / Ajustes | profile |
| `/publicacion/[id]` | Detalle: guardar, solicitar contacto, reportar | posts |
| `/vecino/[id]` | Perfil público de un vecino | profile |
| `/emergencias` | Centro de emergencias (stack propio, cabecera roja) | emergency |
| `/emergencias/necesito-ayuda` | Tipo, zona, detalle/foto opcionales, peligro inmediato | emergency |
| `/emergencias/reportar` | Reportar incidente (6 categorías) | emergency |
| `/emergencias/estado/[id]` | Estado real + línea de seguimiento + números | emergency |
| `/emergencias/ofrecer` | Ofrecer recurso + ciclo Ofrecido→Confirmado (requiere registro) | emergency |
| `/emergencias/recursos` | Necesidades y recursos (demo + mis ofertas) | emergency |
| `/emergencias/vecino-vulnerable` | Flujo de 3 pasos (acción → necesidad + zona → revisar), sin nombre ni diagnóstico | emergency |
| `/emergencias/tablero` | Tablero del sector: vulnerabilidad (prioridad, no validada), incidentes, necesidades, recursos | emergency |
| `/galeria` | Galería del design system (solo revisión) | dev |

Las tabs redirigen a `/onboarding` si no se completó; `/emergencias` nunca se bloquea.

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
- **map** (etapa 8) — `CommunityMap` (chips de 7 capas, mapa nativo o lista), `buildMapPoints` (publicaciones + tablero + perfil), `approx.ts` (zona aproximada determinista desde el centro del sector; nunca GPS), `places.ts` + `data/places.json` (975 lugares OSM de los 4 sectores, ODbL; se regenera con `node scripts/fetch-places.mjs`), `NativeLayerMap` (`.web` devuelve null). `app.config.js` inyecta la clave a las builds nativas.
- **dev** — galería del design system.

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

## 8. Lo que falta

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
- Para probar el tablero hacen falta dos dispositivos (cuentas anónimas distintas): nadie puede responder a su propio aviso.

### Pendientes menores conocidos
- Verificar la etapa 6 en Expo Go (no se probó en dispositivo).
- `demoAlert.ts` (alerta de sector simulada en Inicio) se retira al haber activación real.
- Nota de voz: hoy simulada en Publicar; no hay grabación real.
- Ofertas de recursos no admiten aún «ofertas duplicadas» ni «entregas parciales» (docs §10).

## 9. Documentos a leer antes de programar

1. `docs/01_producto/brief_producto_y_decisiones.md`
2. `docs/02_ux_ui/arquitectura_y_flujos.md` (§6–11)
3. `docs/03_accesibilidad_emergencias/requisitos_inclusion_y_crisis.md`
4. `docs/04_tecnico/stack_y_mvp_48h.md`
5. `docs/05_prompts_ia/prompt_implementacion_react_native.md`
6. `AGENTS.md` (Expo SDK 58: no usar APIs de memoria)

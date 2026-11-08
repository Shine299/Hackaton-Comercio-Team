# Plan de implementación — Etapa 13 «comunidad primero»

- **Estado:** propuesta (8 nov 2026), rama `shay`. Pendiente de aprobar las decisiones de la sección 2.
- **Fuente:** feedback de UX (4 notas de voz) traducido en «Feedback de UX — navegación comunidad primero».
- **Restricción de calendario:** congelamos el código el 16 nov a las 12:00 y el Sprint 1 (validar en dispositivos)
  va del 10 al 12 nov. Este plan cabe en ~4 días si se respeta el orden de la sección 4 y se recorta lo marcado como
  *opcional*.

---

## 1. Corrección importante: el feedback describe una app más vieja que la del repo

El documento de feedback se escribió sobre `context.md` de las etapas 0–11. Desde entonces (Sprint 2 / 2b) ya hay
varias piezas que **reducen mucho el trabajo**:

| El feedback dice… | En el repo hoy (verificado) | Consecuencia |
|---|---|---|
| «No hay chat; Mensajes está vacía» | **Chat hecho** (SPEC-025): `features/chat` (bandeja, hilo, `ChatFab`, demo, outbox `chat.message`), migración `20261109000006_chat.sql` aplicada con `conversations`, `messages`, RLS de 2 participantes. Sondeo cada 4 s | No hay que construir el chat: hay que **quitar el paso de aceptar** y darle pestaña propia |
| «Barra distinta por sección; el Inicio no tiene barra» | Ya hay **una sola barra de 5** (`shell/sections.ts`): Inicio · Comunidad · Negocios · Emergencia · Ayuda. El Inicio sigue sin barra (`resolveSection('/') → null`) | Cambiar 5 entradas de `BAR_ITEMS` y `resolveSection`, no rehacer la navegación |
| «Eventos no existe» | **Eventos de solo lectura** (SPEC-028): tabla `sector_events` (sin escritura desde la app), `EventCard`, `sectorEvents.ts` con demo | Falta **crear evento** y **RSVP**; la lectura y la tarjeta ya existen |
| «Inicio = menú de 4 tarjetas» | `CommunityScreen` ya es un **feed mezclado** (publicaciones, negocios, emergencia, eventos) con un `FeedCard` interno; `HomeScreen` es de novedades con carruseles | El feed del Inicio se arma **moviendo** el feed de Comunidad, no desde cero |
| «`places.json` sirve para tiendas» | `scripts/fetch-places.mjs` solo baja **salud, farmacia, seguridad y refugio**; **no** guarda `opening_hours` | Para Explorar hay que **ampliar la consulta** (tiendas, restaurantes, mercados…) y guardar el horario |
| «Hay utilidad sin EXIF» | `shared/hooks/usePickPhoto.ts` (se usa en Publicar) | Sirve para la foto de perfil |
| «Avatar» | No existe ningún componente de avatar | Nuevo `shared/ui/Avatar.tsx` |

---

## 2. Decisiones a cerrar antes de programar

Recomendación en **negrita**; el resto son alternativas.

| # | Decisión | Recomendación | Por qué |
|---|---|---|---|
| D1 | ¿El chat reemplaza la solicitud de contacto? | **Sí: «Escribir» abre (o reutiliza) la conversación sin aceptar.** El dueño puede **bloquear** y **reportar** desde el hilo | Es lo central del audio 4. Hoy SPEC-025 exige aceptar: hay que reescribir ese criterio (SPEC-043) |
| D2 | Foto de perfil | **Avatar con iniciales y color por defecto; foto opcional *después* (13f, opcional)** | El feed se ve «con gente» solo con iniciales; la foto abre moderación y almacenamiento |
| D3 | «Abierto ahora» | **Solo con `opening_hours` de OSM interpretable; si no, «Horario no confirmado».** Negocios vecinos siguen con «Disponible ahora» | Regla de producto: un estado nunca miente |
| D4 | ¿Dónde queda **Emergencia** si sale de la barra? | **Botón SOS de la cabecera (ya existe en todas las raíces) + tarjeta fija «¿Emergencia?» arriba del feed del Inicio.** El stack `/emergencias` y su barra roja no cambian | Las 5 pestañas pedidas no incluyen Emergencia; no puede quedar a más de 1 toque |
| D5 | ¿Dónde va **Perfil**? | **Se queda en el menú lateral (☰)** que ya existe; el ícono de la cabecera pasa a ser el avatar del usuario | Cero rutas nuevas; el audio no lo pide en la barra |
| D6 | ¿Qué pasa con **Ayuda** (Objetos / Animales) y **Comunidad**? | **Ayuda se convierte en Marketplace** (mismas categorías, mismos `/explorar` y `/publicar`). **Comunidad desaparece como pestaña**: su feed pasa al Inicio y sus teasers (fondo, cámaras, perrito) también | Evita 2 feeds parecidos; se conservan todas las integraciones del Sprint 2b |
| D7 | ¿Los eventos los crean solo vecinos o también comercios? | **Cualquier vecino registrado**, con `venue_kind` (`public_place` / `approx_zone`); los de personal autorizado siguen en `sector_events` | Pregunta 3 abierta del feedback; esto cubre ambos sin bloquear |
| D8 | ¿Feed con «posts sociales» libres? | **No en esta etapa**: solo contenido de la app (Ofrezco/Necesito, eventos, negocios, alertas) | Evita un frente nuevo de moderación a 8 días de la final |

> Confirmar con quien dio el feedback: si hubo un 5.º audio (asumimos que «la siguiente parte» es el Chat).

---

## 3. Navegación final

```
Barra (todas las raíces, también el Inicio):
  Inicio · Eventos · Explorar · Marketplace · Chat
Cabecera:  [avatar → menú lateral con Perfil, Guardados, Mi negocio, Ajustes]  Yunta / sector   [SOS]
Fuera de la barra: /emergencias (stack rojo propio), /actividad (campana), /perfil, detalles y formularios
```

| Pestaña | Ruta | Pantalla | Viene de |
|---|---|---|---|
| Inicio | `/` | `HomeScreen` = feed comunitario | `CommunityScreen` (feed) + `HomeScreen` (saludo, alerta, «Juntos por el barrio») |
| Eventos | `/eventos` *(nueva)* | `EventsScreen` | `home/EventCard`, `sectorEvents` → feature `events` |
| Explorar | `/explorar` | `PlacesScreen` (lugares + negocios vecinos) | `business/BusinessesScreen`, `map/places` |
| Marketplace | `/marketplace` *(nueva, reemplaza `/ayuda`)* | `HelpHomeScreen` renombrada + lista de publicaciones | `help`, `explore/ExploreScreen` (publicaciones), `publish` |
| Chat | `/mensajes` | `ChatInboxScreen` | `chat` |

**Choque de nombres:** hoy `/explorar` es la lista de publicaciones («Quiero ayudar»). Esa lista pasa a
`/marketplace` y `/explorar` queda para lugares. Hay que actualizar todos los `router.push('/explorar…')`,
`?view=map&layer=` y `ROOT_PATHS` (hoy hay **30 referencias** en `src`). Se busca con `grep -rn "'/explorar\|'/ayuda\|'/comunidad\|'/negocios" src`.
Mantener `/ayuda`, `/comunidad` y `/negocios` como **redirecciones** (`<Redirect>`) para no romper deep links ni
notificaciones ya programadas.

---

## 4. Etapas (una por sesión; cada una deja `npm run check` en verde y se prueba en Expo Go)

Orden por valor para la demo: **13a → 13b → 13c (chat) → 13d (eventos) → 13e (explorar) → 13f (pulido)**.
Si falta tiempo, 13e se queda con datos demo y 13f se recorta.

### 13a — Barra nueva y rutas (S, ~½ día) · SPEC-043

Archivos:
- `src/features/shell/sections.ts`: `SectionId = 'inicio' | 'eventos' | 'explorar' | 'marketplace' | 'chat'`,
  nuevos `BAR_ITEMS` (íconos: `home`, `calendar-star`, `compass`, `storefront`, `chat`), `ROOT_PATHS`,
  `resolveSection('/') → 'inicio'` (**el Inicio ahora sí tiene barra**), `/publicar` y `/publicacion/*` sin barra.
- `src/features/shell/sections.test.ts`: reescribir primero (rojo) con la tabla nueva de rutas.
- `src/app/(tabs)/`: nuevos `eventos.tsx`, `marketplace.tsx`; `ayuda.tsx`, `comunidad.tsx`, `negocios.tsx` →
  `<Redirect>`; actualizar `_layout.tsx`.
- `src/features/shell/SectionBar.tsx`: badge de no leídos en la pestaña Chat (reutilizar el patrón de
  `shared/nav/activityBadgeStore`, sin importar `features/chat` desde `shared`).
- `src/app/_layout.tsx`: quitar `<ChatFab />` (la pestaña lo reemplaza).
- `src/features/shell/TopBar.tsx` / `SectionHeader.tsx`: el botón de la izquierda muestra el `Avatar` (13b) y sigue
  abriendo el menú lateral. SOS sin cambios.
- `ProfileDrawer.tsx`: agregar «Mi negocio» y «Registrar negocio» (antes vivían en la pestaña Negocios).
- Eventos y Explorar empiezan con contenido real que ya existe: Eventos = lista de solo lectura de los eventos del
  sector; Explorar = `BusinessesScreen`. La lista de publicaciones se mueve a `/publicaciones` (detalle en SPEC-043).
- En Emergencia, la barra principal se ve sin pestaña resaltada (`resolveBar` → `{ active: null }`) para que
  siempre haya salida: el centro de emergencia no tiene otro botón para volver.
- Regenerar tipos de rutas (`npx expo start` una vez) antes de `npm run typecheck`.

Criterios: las 5 pestañas navegan; SOS abre Emergencias desde cualquier raíz; `/ayuda`, `/comunidad`, `/negocios`
redirigen; la barra de Emergencias (roja) no cambia; las etiquetas no se cortan con letra al máximo.

### 13b — Inicio como feed comunitario + Avatar (M, ~1 día) · SPEC-044

- **Nuevo `shared/ui/Avatar.tsx`**: iniciales + color estable por id (función pura `avatarColor(id)` +
  `initialsOf(name)` con prueba), tamaños 32/40/56, `accessibilityLabel` con el nombre. Acepta `uri` opcional
  para 13f.
- **Extraer el feed** de `CommunityScreen.tsx` a `home/feed.ts` (función pura `buildHomeFeed({posts, events,
  businesses, alerts})` que ordena con `rankPosts` y la regla de SPEC-041: reales antes que demo, urgente solo con
  su etiqueta). Prueba `home/feed.test.ts` primero.
- **`home/FeedCard.tsx`** exportable: avatar + nombre público + sector + hora relativa · bloque de color/foto ·
  texto · etiqueta de tipo (Ofrezco / Necesito / Evento / Negocio) con ícono y texto · acción principal
  («Escribir» → 13c, «Voy» → 13d, «Ver»). Delegar en `PostCard` / `EventCard` donde ya existen.
- **`HomeScreen`** nuevo orden: saludo con sector y dato agregado («N vecinos activos esta semana en Lince»,
  solo conteo) → alerta del sector fija → tarjeta «¿Emergencia?» (D4) → acciones rápidas (Publicar, Crear evento)
  → «Juntos por el barrio» (fondo, cámaras, perrito, un carrusel) → feed infinito (`FlatList`, no `ScrollView`).
- Borrar `CommunityScreen` cuando su contenido esté en el Inicio (o dejarlo detrás de la redirección).
- Conteo «vecinos activos»: en demo, constante etiquetada; con servidor, función `sector_active_count(sector)`
  *(opcional, se puede dejar para 13f)*.

Criterios: el Inicio muestra publicaciones, eventos, negocios y la alerta con datos demo etiquetados (`DemoTag`);
ningún feed muestra listas de personas; scroll fluido con 50 ítems en un Android de gama baja.

### 13c — Chat directo desde el Marketplace (M, ~1 día) · SPEC-045 (reemplaza criterios 1–3 de SPEC-025)

Servidor — migración `supabase/migrations/20261110000008_open_chat.sql`:
- `start_conversation(p_post_id uuid) returns uuid` (security definer, solo `authenticated`): si existe una
  conversación entre el autor del post y quien llama para ese post, la devuelve; si no, la crea. Falla si el que
  llama es el autor o si alguno bloqueó al otro.
- Tabla `blocks (blocker_id, blocked_id, created_at, primary key)` sin políticas de lectura directa;
  `block_user(p_conversation_id)`; la política `messages_insert` agrega «y no hay bloqueo entre los dos».
- `report_message(p_message_id)` → reutilizar la tabla de reportes de moderación existente.
- Tasa: máximo 30 mensajes/min por usuario (trigger `before insert` que cuenta los mensajes del último minuto; no
  hay un patrón previo en el repo: `node_ingest`, citado en el feedback, no existe). El límite de 500 caracteres ya existe.
- `accept_request`, `decline_request` y `pending_requests` **se dejan** (no romper clientes viejos), pero la app
  deja de usarlas.

Cliente:
- `chat/chatRepository.ts`: `startConversation(postId)`; con demo (sin `.env`), crea una conversación local con
  el vecino de demo (`chat/demo.ts` ya tiene respuestas guionadas).
- `chat/logic.ts`: `canOpenChat` pasa a «registrado y no es tu propia publicación» (actualizar `logic.test.ts`
  primero).
- `posts/PostCard`, `PostDetailScreen`, `FeedCard`: el botón «Pedir contacto» → **«Escribir»** que usa
  `useRegistrationGate` y luego `router.push('/chat/<id>')`. Estado de la tarjeta «Solicitado» →
  «Conversación abierta».
- Retirar `ContactRequestSheet` y `useContactStore` del flujo (borrarlos cuando no queden referencias; el tipo
  `interaction.request` del outbox se mantiene por los elementos que ya estén en cola).
- `ChatInboxScreen`: quitar la sección «Por responder»; agregar el aviso fijo «Yunta conecta vecinos; no verifica
  a las personas ni reemplaza al 105» y «No compartas teléfono, dirección exacta ni datos sensibles» (ya existe).
- `ChatScreen`: menú «Reportar mensaje» (pulsación larga) y «Bloquear a este vecino». Notificación local al llegar
  un mensaje con la app abierta, reutilizando `features/notifications`.
- Estados: el mensaje propio muestra «Guardado en tu teléfono» hasta que el servidor responde (ya es así; no
  tocar `SyncStatusBadge`).

Criterios: con 2 cuentas, «Escribir» en una publicación → hilo → mensaje visible en el otro teléfono en ≤ 8 s;
tocar «Escribir» dos veces no crea 2 conversaciones; el autor no puede escribirse a sí mismo; tras bloquear, el
otro no puede enviar; modo avión: el mensaje queda en la cola y sale al reconectar.

### 13d — Eventos creados por vecinos con «Voy» (L, ~1 día) · SPEC-046

Servidor — `supabase/migrations/20261110000009_neighbor_events.sql`:
- `events (id, organizer_id, sector_id, title, description, starts_at, ends_at, venue_kind
  ('public_place'|'approx_zone'), venue_name, status ('active'|'cancelled'), is_demo, created_at)` y
  `event_rsvps (event_id, user_id, status ('going'|'not_going'), created_at, unique(event_id,user_id))`.
- RLS sin lectura directa; funciones `sector_events_v2(p_sector)` que unen `sector_events` (oficiales) +
  `events` con **conteo** de asistentes y `i_am_going` (nunca la lista ni `organizer_id` ajeno),
  `create_event(...)`, `rsvp_event(p_event_id, p_status)`, `cancel_my_event(p_event_id)`.
- `venue_kind = 'approx_zone'` → solo se guarda texto de zona («Cuadra 5 de Arequipa»), nunca dirección.

Cliente — mover a **feature nueva `features/events`** (`EventCard`, `sectorEvents.ts` y su prueba salen de
`home`; `home` importa desde `@/features/events`):
- `EventsScreen`: secciones Hoy / Esta semana / Más adelante (función pura `groupEventsByWhen` + prueba), botón
  «Crear evento».
- `EventDetailScreen` (`src/app/evento/[id].tsx`): «Voy» / «Ya no voy» (requiere registro), conteo, «Escuchar»,
  reportar (reutilizar `ReportSheet`), «Escribir al organizador» (abre chat, si 13c está).
- `CreateEventScreen` (`src/app/eventos/crear.tsx`): 2 pasos, Zod + RHF (título 3–120, descripción ≤ 400, fecha
  futura, tipo de lugar). Esquema con prueba.
- Outbox: tipos `event.create` y `event.rsvp` (prioridad `normal`) en `outbox/types.ts` y en el transporte de
  `features/sync`. «Voy» se ve al instante como «Guardado en tu teléfono» y el conteo real sube cuando el servidor
  responde.
- Demo sin `.env`: eventos ficticios con organizador ficticio y `DemoTag`; RSVP local.

Criterios: con 2 cuentas, A crea un evento y B lo ve; B toca «Voy» y A ve el conteo subir en ≤ 10 s; nadie ve
quiénes van; un evento en casa solo muestra la zona.

### 13e — Explorar: lugares del barrio con horario honesto (M, ~1 día) · SPEC-047

- `scripts/fetch-places.mjs`: agregar `shop` (`supermarket`, `convenience`, `bakery`, `hardware`, …) y `amenity`
  (`restaurant`, `cafe`, `fast_food`, `marketplace`, `bank`) con categorías nuevas (`food`, `shop`, `services`), y
  **guardar `opening_hours` crudo**. Regenerar `places.json` y vigilar el peso (si pasa de ~400 KB, guardar solo
  los campos usados y separar por sector).
- `npx expo install opening_hours` **no**: es pesado. Escribir un **parser mínimo propio**
  `explore/openingHours.ts` que entienda los formatos comunes (`Mo-Fr 08:00-20:00; Sa 09:00-13:00`, `24/7`,
  `off`) y devuelva `'open' | 'closed' | 'unknown'`; cualquier cosa que no entienda → `unknown`. Prueba con casos
  reales sacados del JSON (rojo primero).
- `PlacesScreen` (en `features/explore`): chips de categoría, «Abierto ahora», sector; Lista / Mapa (reutilizar
  `CommunityMap` con capa de lugares + capa `business`). Los negocios vecinos aparecen con «Disponible ahora»
  (dato que el negocio declara), nunca con «Abierto».
- Etiquetas: «Abierto ahora» (verde + ícono), «Cerrado ahora» (gris + ícono), «Horario no confirmado».
- Atribución «© colaboradores de OpenStreetMap» visible al pie de la lista y en el mapa.

Criterios: el filtro «Abierto ahora» solo devuelve lugares con horario interpretable; nunca se dice «abierto» sin
`opening_hours`; la lista funciona sin internet (datos versionados).

### 13f — Pulido (S–M, lo que quepa) · SPEC-048

- Foto de perfil **opcional** con `usePickPhoto` (sin EXIF) — *opcional*; si se hace, solo local o en Storage con
  RLS de dueño; en demos, solo ilustraciones.
- Textos de las pestañas y estados vacíos con ilustración.
- Actualizar SPEC-014 (navegación), SPEC-025 (chat), SPEC-028 (eventos), `README.md` (tabla y diagrama de
  navegación), `context.md`, `sprints.md` y la tabla de accesibilidad de SPEC-013 («Barras inferiores»).
- ADR corto `docs/adr/0006-navegacion-comunidad-primero.md`: por qué Emergencia sale de la barra y queda en SOS.

---

## 5. Riesgos

| Riesgo | Mitigación |
|---|---|
| Emergencia pierde visibilidad al salir de la barra | SOS en todas las cabeceras + tarjeta fija en el Inicio (D4); probarlo en SPEC-013 con lector de pantalla |
| Romper deep links, notificaciones o el tour (`features/tour`, `TourTarget`) que apuntan a `/ayuda`, `/comunidad`, `/negocios` | Redirecciones en 13a; revisar los pasos del tour con `grep` |
| Chat sin aceptar = más spam/acoso | Registro obligatorio, bloqueo, reporte, límite de tasa (13c) |
| Choca con el Sprint 1 (10–12 nov) | 13a y 13c tocan el flujo de Rosa solo en la navegación; hacer 13a antes del 10 y correr SPEC-010 sobre la barra nueva |
| `places.json` crece mucho | Recortar campos y radio; medir en el PR |
| Migraciones sin rama de pruebas (no hay plan Pro) | Igual que SPEC-025: probar RLS en una transacción que se deshace |

## 6. Checklist por etapa

- [ ] Spec escrita y prueba en rojo antes del código; `npm run check` en verde.
- [ ] Guardado en el teléfono ≠ recibido ≠ enviado.
- [ ] Todo dato ficticio con `DemoTag`; sin personas reales.
- [ ] Ninguna función devuelve `user_id` ajeno, lista de asistentes ni mensajes de terceros.
- [ ] Ubicación solo por sector o texto de zona.
- [ ] Táctiles ≥ 48 dp, `accessibilityRole/Label`, estados con texto + ícono, letra al máximo sin cortes.
- [ ] Explorar nunca afirma «abierto» sin horario.
- [ ] Features solo por `index.ts`; `shared/` no importa `features/`; sin ciclos.
- [ ] Probado en Expo Go en un celular; sin commit hasta que se pida.

# Sprints — Yunta

Plan de lo que falta para cerrar la app, pensado para que cada integrante pueda tomar una historia y avanzar sin preguntar.
Metodología: **SDD (Spec-Driven Development) + TDD (Test-Driven Development)**, en sprints cortos.

- **Última actualización:** 8 de noviembre de 2026 (integraciones nuevas, ver Sprint 2b; navegación «comunidad primero», ver Etapa 13). **Entrega final (sustentación de finalistas): 17 de noviembre de 2026, 6:00 p. m.**
- **Formato de la final** (según las bases): 20 min como máximo = 5 de presentación + **15 de la aplicación funcionando**. Gana lo que funciona de punta a punta.
- **Criterios del jurado:** aspectos funcionales, aspectos técnicos, valor de la solución, innovación y originalidad.
- **Alcance de este documento:** solo la app. Sin deck ni guion de demo (decisión del equipo).

---

## 1. Cómo trabajamos (SDD + TDD)

### Ciclo de cada historia

```
 SPEC  ->  RED  ->  GREEN  ->  REFACTOR  ->  VERIFICAR
 (qué)    (test     (código    (limpiar,     (en Expo Go,
          falla)    mínimo)    sin romper)   2 dispositivos)
```

1. **Spec primero.** Nadie escribe código sin una spec aprobada en `docs/specs/SPEC-NNN-nombre.md` (plantilla en la sección 6). La spec dice *qué* se espera, con criterios de aceptación en formato «Dado / Cuando / Entonces». Una persona distinta a quien la escribió la revisa.
2. **Rojo.** Se escriben las pruebas a partir de los criterios y se ve que **fallan** por la razón correcta. Commit: `test(SPEC-NNN): ...`.
3. **Verde.** Se escribe el código mínimo para que pasen. Commit: `feat(SPEC-NNN): ...` o `fix(SPEC-NNN): ...`.
4. **Refactor.** Se limpia sin cambiar el comportamiento y con las pruebas en verde. Commit: `refactor(SPEC-NNN): ...`.
5. **Verificar a mano** lo que una prueba automática no cubre (pantalla real, dos teléfonos, modo avión, letra grande).

> Si un criterio no se puede probar, la spec está mal escrita: se reescribe hasta que sea comprobable.

### Qué se prueba con qué

| Capa | Herramienta | Ejemplos en este repo |
|---|---|---|
| Lógica pura (sin pantalla) | Jest | `resolveSection`, `applyFilters`, `rankPosts`, `buildBoard`, `buildMapPoints`, `buildActivityFeed`, `rubroOf`, orden de la cola |
| Componentes y pantallas | Jest + React Native Testing Library | `HomeScreen`, `SectionBar`, `BusinessesScreen`, formularios |
| Base de datos y RLS | SQL (pgTAP o scripts) contra una **rama o proyecto de pruebas de Supabase**, nunca producción | `sector_board`, `respond_to_board_item`, políticas de `board_responses` |
| Extremo a extremo | Guion manual en Expo Go (2 dispositivos) | Flujo de Rosa, modo avión |

### Definición de «listo para empezar» (DoR)
- Tiene spec aprobada con criterios «Dado / Cuando / Entonces».
- Dice qué archivos toca y qué **no** debe cambiar.
- Tiene dueño, estimación y dependencias claras.

### Definición de «terminado» (DoD)
- Las pruebas se escribieron **antes** (hay un commit en rojo) y ahora pasan.
- Pasan en verde: `npm run typecheck`, `npm run lint`, `npm test`, `npx expo-doctor` y `npx expo export --platform android --platform web`.
- Sin regresiones: no se rompió ninguna prueba existente.
- Probado en Expo Go; si toca datos del servidor, probado con 2 dispositivos.
- Cumple las reglas de producto (ver 1.1) y accesibilidad (ver 1.2).
- `context.md` actualizado si cambia la estructura. Revisado por otra persona (PR).

### 1.1 Reglas de producto que no se negocian
(de `docs/01_producto/brief_producto_y_decisiones.md` y `context.md`)
- Un estado nunca miente: **«Guardado en tu teléfono» ≠ «Recibido» ≠ «Validado»**. «Recibido» solo tras respuesta real del servidor.
- Privacidad por diseño: solo sector aproximado, nunca GPS ni dirección exacta; el diagnóstico, el detalle, la foto y la nota de voz de un aviso **nunca** salen del teléfono.
- Todo dato ficticio lleva la etiqueta **«DATO DE DEMO»**.
- La app **no reemplaza** a los servicios oficiales de emergencia.
- Un color = un significado: rojo = urgencia real, **morado `#6A2BD9` = acciones y marca** (lavanda `#B78CFF` para seleccionado; amarillo Yunta `#F7C948` solo como acento, con texto oscuro), azul = «Pide», verde = solo completado, terracota = solo prioridad, ámbar = pendiente. Fondo: blanco cálido `#F8F5FF`. Tokens en `src/global.css`.

### 1.2 Accesibilidad mínima (se revisa en cada historia de pantalla)
- Botones de al menos 48 dp, ícono siempre con texto, estados con texto además de color.
- Funciona con letra del sistema al máximo y con lector de pantalla (TalkBack / VoiceOver).
- Contraste mínimo 4,5:1 en texto de lectura.

### 1.3 Ramas y commits
- Rama de integración: `main`. La etapa 11 vive en `etapa-11-tablero-emprendimientos` y se fusiona en el Sprint 0.
- Una rama por historia: `sprint-N/SPEC-NNN-nombre-corto`. Pull Request pequeño, con la lista de verificación del DoD.
- Commits en español, con prefijo `test:`, `feat:`, `fix:`, `refactor:` o `docs:` y el número de spec.
- Antes de programar con Expo, leer la versión **SDK 58** de la documentación (ver `AGENTS.md`). Instalar paquetes siempre con `npx expo install`.

---

## 2. Estado actual

### Hecho (etapas 0 a 11)
Design system y navegación · onboarding y sector · Día a día (Explorar, publicar, detalle, solicitud antes del contacto) · perfil y confianza · centro de emergencias (peligro inmediato, necesito ayuda, reportar, vecino vulnerable, ofrecer, recursos) · tablero del sector y seguimiento · mapa por capas · cola offline en SQLite · Supabase (esquema, RLS, transporte, estados) · **tablero compartido con «Voy a ayudar»** · **Emprendimientos como sección propia** (Negocios, registro, detalle) · nota de voz real, «Escuchar» y notificaciones locales · **Inicio de novedades con 4 entradas grandes** · **menú lateral con el perfil** · **barra inferior propia por sección** · pantalla «Mis reportes».

Mapa de código para quien empieza:

| Qué | Dónde |
|---|---|
| Barra por sección y rutas | `src/features/shell/sections.ts`, `SectionBar.tsx`, `ProfileDrawer.tsx` |
| Inicio de novedades | `src/features/home/HomeScreen.tsx` |
| Día a día (Explorar, filtros, relevancia) | `src/features/explore`, `src/features/posts` |
| Emprendimientos | `src/features/business` |
| Emergencia y tablero | `src/features/emergency` (`board.ts`, `sharedBoard.ts`) |
| Mapa | `src/features/map` (`buildMapPoints.ts`, `approx.ts`) |
| Cola offline y sincronización | `src/features/outbox`, `src/features/sync` |
| Perfil y confianza | `src/features/profile` |
| Actividad | `src/features/activity` |
| Notificaciones locales | `src/features/notifications` |
| Fondos vecinales y pagos (simulados) | `src/features/funds`, `src/features/payments` |
| Cámaras vecinales | `src/features/cameras` |
| Perrito comunitario | `src/features/pets` |
| Acompáñame / Llegué bien | `src/features/walk` |
| Botón animado (toque suave) | `src/shared/ui/PressableScale.tsx` |
| Servidor | `supabase/migrations`, `supabase/seed.sql` |

### Hecho después (7–8 nov)
- **Sprint 2 (funciones del lienzo):** Mensajes y Chat (SPEC-025), Favoritos de negocios (SPEC-026), Modo fácil (SPEC-027), eventos en Comunidad (SPEC-028), «¿Cuántas personas?» y «¿Hay personas en riesgo?» (SPEC-029).
- **Pruebas:** Jest corre con `npm test` (18 suites, 89 pruebas de lógica pura). `npm run check` = typecheck + lint + ciclos + tests.
- **Integraciones (Sprint 2b):** fondos vecinales con pago simulado, cámaras vecinales, perrito comunitario, «Acompáñame», Ayuda separada en Objetos y Animales, SOS en la cabecera, animaciones suaves. Detalle y pendientes en el Sprint 2b.

### Lo que falta (resumen)
1. ~~No hay pruebas automáticas.~~ Hecho: hay pruebas de lógica pura. Faltan pruebas de componentes (RNTL).
2. **Nada está probado en un dispositivo real.** Todo pasó `npm run check`, pero no se vio en Expo Go. Incluye las animaciones y las integraciones nuevas.
3. ~~La rama de la etapa 11 no está en `main`.~~ Hecho.
4. **Imágenes definitivas:** hoy son bloques de color con ícono (lista en el Sprint 2).
5. **Pantallas sin rediseño individual:** Detalle, Perfil, Actividad, Tablero, Publicar, formularios de Emergencia, Estado del reporte y Onboarding solo reciben el estilo compartido.
6. **APK instalable:** `eas.json` existe, falta ejecutar `eas init`, cargar las variables y compilar. El mapa necesita clave de Google Maps en Android.
7. **Seguridad en Supabase:** revisar el aviso de `rls_auto_enable()` (ejecutable sin cuenta; no lo creamos nosotros) y confirmar `Allow anonymous sign-ins`.
8. **Límites conocidos:** dictado a texto simulado en Publicar; notificaciones solo locales (no push remoto); la nota de voz no se reproduce en la pantalla de estado del reporte; iPhone solo con Expo Go. Fondos, cámaras registradas, avistamientos del perrito y trayectos de «Acompáñame» se guardan **solo en el teléfono** (faltan sus tablas en Supabase).
9. **Deuda técnica:** el filtro «Delivery» busca la palabra en un texto libre de `details`; la «confianza» de vecinos es solo de demostración (no hay verificación real).
10. **Lienzo:** 15 tableros conservan la barra inferior anterior.
11. ~~Funciones del lienzo que aún no existen en el código.~~ Hechas (SPEC-025 a SPEC-029).
12. **Migración sin aplicar:** `supabase/migrations/20261109000007_pets_category.sql` (categoría «Animales y mascotas»). Hasta aplicarla, una publicación de animales no sube al servidor.

---

## 3. Calendario

| Sprint | Fechas | Objetivo | Resultado esperado |
|---|---|---|---|
| **0 — Cimientos** | 8–9 nov | Pruebas, specs y `main` al día | `npm test` corre y cubre la lógica actual; etapa 11 fusionada |
| **1 — Validar el flujo central** | 10–12 nov | Que lo que ya existe funcione de verdad | Flujo de Rosa, modo avión, privacidad y accesibilidad verificados en 2 dispositivos |
| **2 — Visual y pantallas** | 13–15 nov | Terminar el rediseño con las imágenes | Todas las pantallas con el estilo final; sin bloques vacíos |
| **2b — Integraciones** | 8 nov (hecho) y lo que quede, en paralelo | Diferenciadores: fondos, cámaras, perrito, «Acompáñame» | Funcionando sin servidor y con `DemoTag`; servidor y pasarela gratis, después |
| **13 — Comunidad primero** | 9–14 nov, en paralelo con 1 y 2 | Barra Inicio · Comunidad · Negocios · Ayuda (chat en burbuja), feed en el Inicio, chat directo, eventos con «Voy», lugares con horario | Las 4 pestañas funcionan en Expo Go; 13a lista **antes del 10** para validar el Sprint 1 sobre la barra nueva |
| **3 — Release y ensayo** | 16–17 nov | App instalable y congelada | APK instalado, regresión completa, **congelar código el 16 a las 12:00** |

Estimaciones: **S** ≤ 2 h · **M** ≤ medio día · **L** ≤ 1 día. «Dueño» queda en blanco para asignar en la planificación.

---

## 4. Sprints

### Sprint 0 — Cimientos (8–9 nov)

**Meta:** poder escribir pruebas y trabajar en paralelo sin pisarse.

| ID | Historia | Spec | Estim. | Dueño | Depende de |
|---|---|---|---|---|---|
| S0-1 | Fusionar `etapa-11-tablero-emprendimientos` en `main` mediante PR revisado | — | S | | — |
| S0-2 | Montar el entorno de pruebas: Jest + RNTL, scripts `test` y `test:watch`, y un flujo de CI que corra typecheck, lint y test | SPEC-001 | M | | S0-1 |
| S0-3 | Crear `docs/specs/` con la plantilla (sección 6) y un `README` índice de specs | SPEC-000 | S | | — |
| S0-4 | Pruebas de caracterización de la lógica pura que ya existe (se escriben ahora aunque el código esté hecho) | SPEC-002 | L | | S0-2 |
| S0-5 | Pruebas de base de datos: `sector_board`, `respond_to_board_item`, `resolve_my_board_item`, `sector_impact` y RLS | SPEC-003 | M | | S0-3 |
| S0-6 | Revisión de seguridad de Supabase (`rls_auto_enable()`, anónimos, claves, `.env`) | SPEC-004 | S | | — |

**SPEC-001 — Entorno de pruebas** (criterios)
- *Dado* un clon limpio, *cuando* se ejecuta `npm install && npm test`, *entonces* Jest corre sin errores de configuración y reporta al menos una prueba en verde.
- *Dado* un PR, *cuando* se abre, *entonces* la CI ejecuta `typecheck`, `lint` y `test` y bloquea la fusión si alguno falla.
- Riesgo a resolver aquí: NativeWind v5 (candidata) y Reanimated con Jest. Seguir la guía de Expo para pruebas de la versión SDK 58 y dejar anotada la configuración en `docs/04_tecnico/`.

**SPEC-002 — Caracterización de la lógica pura** (pruebas que se escriben primero)

| Módulo | Casos mínimos |
|---|---|
| `shell/sections.ts` → `resolveSection` | cada ruta devuelve su sección y pestaña activa · `/` no tiene barra · formularios y detalles devuelven `null` · `/mapa` con `layer=business` es Emprendimientos y sin `layer` es Día a día · `/actividad` toma la sección de origen · `/perfil?tab=saved|privacy|settings` activa la pestaña correcta |
| `posts/filters.ts` → `applyFilters` | por tipo, categoría y distancia · «disponible ahora» · solo verificados · publicado hoy o esta semana · ampliar a sectores contiguos |
| `posts/relevance.ts` → `rankPosts` | cercanía y novedad suman · un vecino nuevo no queda invisible · urgente **no** equivale a validado |
| `emergency/board.ts` → `buildBoard` | lo propio va primero por peso · lo de demo se etiqueta · otro sector se excluye · estado «No validada» en vecino vulnerable |
| `map/buildMapPoints.ts` y `approx.ts` | los puntos caen dentro del radio del sector · un mismo id da siempre el mismo punto · nunca se usa GPS · `business` va a su capa |
| `activity/feed.ts` → `buildActivityFeed` | alertas arriba · filtros por categoría · lo leído no cuenta |
| `business/rubros.ts` | `rubroOf` con y sin «Rubro» (cae en «Otro») · `hasDelivery` |
| `outbox` (cola) | orden emergencia → urgente → normal · reintento no duplica · descartar un reporte crítico pide confirmación |
| `emergency/store.ts` | el estado del servidor solo avanza, nunca vuelve a «local» · una entrega parcial nunca supera la cantidad ofrecida |

**SPEC-003 — Pruebas de base de datos** (criterios)
- *Dado* un usuario anónimo sin sesión, *cuando* llama a `respond_to_board_item`, *entonces* falla (sin permiso).
- *Dado* un aviso creado por A, *cuando* A intenta responderlo, *entonces* falla con «cannot respond to own item».
- *Dado* un aviso de A, *cuando* B consulta `sector_board`, *entonces* ve tipo, sector, estado, hora y conteo, y **no** ve `user_id`, detalle, diagnóstico ni nombres de quienes responden.
- *Dado* un aviso de A con respuestas, *cuando* A consulta, *entonces* ve los nombres públicos de quienes van en camino.
- *Dado* cualquier usuario, *cuando* intenta leer o escribir `board_responses` directamente, *entonces* se rechaza (sin políticas).
- *Dado* un aviso de A, *cuando* A llama a `resolve_my_board_item`, *entonces* pasa a «resolved» y sube `resolved_today`; si lo llama otro usuario, falla.

**SPEC-004 — Seguridad:** decidir y registrar qué hacer con `rls_auto_enable()` (revocar `EXECUTE` a `anon` y `authenticated`, o documentar por qué se queda), confirmar `Allow anonymous sign-ins`, revisar que ninguna clave secreta esté en el repo y que `.env` siga ignorado.

---

### Sprint 1 — Validar el flujo central (10–12 nov)

**Meta:** que lo construido funcione de punta a punta en dispositivos reales. Cada historia produce una spec, sus pruebas y un **registro de resultado** (✅ / ❌ / ⚠️ con foto o nota) en `docs/specs/resultados/`.

| ID | Historia | Spec | Estim. | Dueño |
|---|---|---|---|---|
| S1-1 | **Flujo de Rosa** de punta a punta con dos dispositivos | SPEC-010 | M | |
| S1-2 | **Sin internet:** crear reportes en modo avión y verlos sincronizar | SPEC-011 | M | |
| S1-3 | **Privacidad:** ningún dato privado sale del teléfono | SPEC-012 | M | |
| S1-4 | **Accesibilidad** por pantalla con letra máxima y lector | SPEC-013 | L | |
| S1-5 | **Navegación por sección:** barra, menú lateral y volver a Inicio | SPEC-014 | M | |
| S1-6 | **Emprendimientos** de punta a punta | SPEC-015 | M | |
| S1-7 | **Notificaciones locales** y «Escuchar» | SPEC-016 | S | |
| S1-8 | **Sesión de errores (bug bash)** con todo el equipo y corrección de P0 y P1 | — | L | |

**SPEC-010 — Flujo de Rosa** (criterios)
- *Dado* A y B en el mismo sector, *cuando* A envía «Ayudar a un vecino vulnerable» sin nombre ni diagnóstico, *entonces* A ve «Guardado en tu teléfono» y luego «Recibido».
- *Dado* ese aviso recibido, *cuando* B abre el Tablero, *entonces* lo ve en 8 s o menos, marcado «No validada», sin datos privados.
- *Cuando* B toca «Voy a ayudar», *entonces* A ve «1 vecino va en camino» con el nombre público de B en 8 s o menos.
- *Cuando* B toca «Ya llegué», *entonces* A ve que ya llegó.
- *Cuando* A toca «Ya fue atendido», *entonces* el estado pasa a «Resuelto» y suben «avisos atendidos hoy» y «vecinos respondieron».
- *Casos borde:* B retira su ayuda («Ya no puedo ir»); dos vecinos responden; A no puede responder a su propio aviso; sin conexión el aviso no aparece como recibido.
- *Pruebas:* integración con transporte simulado (cola → estado) + guion manual de 2 dispositivos.

**SPEC-011 — Modo avión** (criterios)
- *Dado* un teléfono sin conexión, *cuando* se envía un reporte, *entonces* queda «Guardado en tu teléfono» y se ve en «Mis reportes».
- *Cuando* vuelve la conexión, *entonces* pasa a «Pendiente» → «Enviando…» → «Recibido» y se ve en el tablero de otro dispositivo.
- *Dado* varios elementos en cola, *entonces* salen en orden emergencia → urgente → normal.
- *Dado* un envío fallido, *entonces* se muestra el reintento y nunca se pierde un reporte crítico.

**SPEC-012 — Privacidad** (criterios)
- *Dado* un aviso de vecino con detalle, diagnóstico, foto y nota de voz, *cuando* se sincroniza, *entonces* en el servidor solo existen tipo, base, sector y estado (revisar la fila real y el contenido de `sync_queue`).
- *Dado* cualquier punto del mapa, *entonces* es zona aproximada del sector y cambiar de teléfono no lo mueve a una ubicación exacta.
- *Dado* un negocio, *entonces* nunca se muestra su dirección exacta.
- *Dado* el repo, *entonces* no hay claves secretas y `.env` está ignorado.

**SPEC-013 — Accesibilidad** (se llena una tabla por pantalla)

| Pantalla | Letra al máximo | Lector de pantalla | Objetivos ≥ 48 dp | Estado con texto | Resultado |
|---|---|---|---|---|---|
| Inicio y menú lateral | | | | | |
| Día a día, Mapa, Detalle | | | | | |
| Emergencia (centro, formularios, tablero, mis reportes) | | | | | |
| Negocios y registro | | | | | |
| Confianza (perfil, guardados, privacidad, ajustes) | | | | | |
| Barras inferiores (5 etiquetas sin cortes) | | | | | |

**SPEC-014 — Navegación por sección** (criterios) — **reemplazada por SPEC-043** (barra única de 5, ADR 0006). Se conserva como historia.

- *Dado* el Inicio, *entonces* no hay barra inferior y hay 4 tarjetas grandes que abren cada sección.
- *Dado* cada sección, *entonces* su barra muestra exactamente las pestañas definidas en `sections.ts` y la primera vuelve al Inicio.
- *Dado* un formulario o un detalle, *entonces* no hay barra.
- *Dado* «Mapa» o «Solicitudes», *entonces* la barra es la de la sección desde la que se llegó.
- *Cuando* se toca el ícono o el nombre de «Red Vecinal», *entonces* se abre el menú lateral con el perfil y cada acceso lleva a su pantalla; tocar fuera lo cierra.
- *Pruebas:* `resolveSection` (ya en SPEC-002) + prueba de componente de `SectionBar` + recorrido manual.

**SPEC-015 — Emprendimientos** (criterios)
- *Cuando* se registra un emprendimiento con nombre, rubro y descripción válidos, *entonces* queda «Guardado en tu teléfono» y aparece en **Negocios** y en la capa del mapa, y **no** en Día a día.
- *Cuando* se filtra por rubro, «Disponible ahora» o «Delivery», *entonces* la lista cambia y el conteo coincide.
- *Dado* un nombre de menos de 3 letras o una descripción de menos de 10, *entonces* se explica el error y no se guarda.
- *Cuando* otro vecino envía una solicitud al negocio, *entonces* queda guardada y no se abre contacto hasta que se acepte.

**SPEC-016 — Notificaciones y voz** (criterios)
- *Dado* la app abierta, *cuando* aparece un aviso nuevo de otro vecino en el sector, *entonces* llega una notificación local; los avisos propios y los que ya estaban al abrir la app **no** notifican.
- *Dado* el permiso denegado, *entonces* la app sigue funcionando sin errores.
- *Dado* un aviso, *cuando* se toca «Escuchar», *entonces* se lee en español y se puede detener.

---

### Sprint 2 — Visual y pantallas (13–15 nov)

**Meta:** que toda la app se vea como el lienzo y que no queden bloques vacíos. Regla: **solo cambia lo visual**; las pruebas existentes deben seguir en verde sin modificarse.

| ID | Historia | Spec | Estim. | Dueño | Depende de |
|---|---|---|---|---|---|
| S2-1 | Integrar las 12 imágenes definitivas | SPEC-020 | M | | imágenes descargadas |
| S2-2 | Rediseñar, una por una, las pantallas pendientes (ver lista) | SPEC-021 | L | | S1-4 |
| S2-3 | Estados vacíos y de error con ilustración | SPEC-022 | M | | S2-1 |
| S2-4 | Reproducir la nota de voz en la pantalla de estado del reporte | SPEC-023 | S | | — |
| S2-5 | Tablero del sector con la misma lista de avisos en vivo que el Inicio (revisión de consistencia) | SPEC-024 | S | | S1-1 |
| S2-6 | Actualizar en el lienzo la barra de las 15 pantallas restantes (documentación visual) | — | M | | — |
| S2-7 | **Mensajes y Chat** (bandeja central y chat que se abre solo tras aceptar una solicitud) | SPEC-025 | L | | decisión del equipo |
| S2-8 | **Favoritos de negocios** (corazón en la tarjeta y pantalla de favoritos) | SPEC-026 | M | | — |
| S2-9 | **Modo fácil** y pantalla «Elige cómo ver la app» (letra grande, botones de 112 px, «Escuchar», una columna; se cambia en Perfil) | SPEC-027 | L | | — |
| S2-10 | **Avisos y eventos reales en Comunidad** (hoy el feed usa publicaciones, tablero y confianza) | SPEC-028 | L | | — |
| S2-11 | **«¿Cuántas personas?» y «¿Hay personas en riesgo?»** en Necesito ayuda y Reportar (dato nuevo en la alerta, sin romper la privacidad) | SPEC-029 | M | | S1-3 |

**Imágenes que hay que conseguir** (con licencia libre, por ejemplo Unsplash o Pexels; personas ficticias o de espaldas, sin rostros reconocibles, sobre todo en Emergencia):

| # | Imagen | Formato | Nombre de archivo | Carpeta |
|---|---|---|---|---|
| 1–4 | Portada de cada sección (Día a día, Confianza, Emergencia, Emprendimientos) | PNG o JPG, 800×500 | `portada-dia-a-dia`, `portada-confianza`, `portada-emergencia`, `portada-emprendimientos` | `assets/images/inicio/` |
| 5–9 | Fotos de negocios: bodega, comida casera, costura, belleza, mascotas | JPG, 800×500 | `negocio-bodega`, `negocio-comida`, `negocio-costura`, `negocio-belleza`, `negocio-mascotas` | `assets/images/negocios/` |
| 10 | Alerta de lluvia | PNG sin fondo, 400×400 | `alerta-lluvia` | `assets/images/inicio/` |
| 11 | Estado vacío | PNG sin fondo, 400×400 | `vacio` | `assets/images/inicio/` |
| 12 | Vista previa del mapa | PNG o JPG, 800×400 | `mapa-vista` | `assets/images/inicio/` |

**SPEC-020 — Imágenes** (criterios)
- *Dado* una imagen disponible, *cuando* se muestra una tarjeta, *entonces* se usa la imagen con texto alternativo descriptivo.
- *Dado* una imagen ausente o que falla, *entonces* se muestra el bloque de color con ícono de siempre (nunca un hueco).
- Cada imagen pesa 150 KB o menos y se carga con `expo-image`.
- *Pruebas:* la tarjeta con y sin imagen (componente) y revisión de peso en el PR.

**SPEC-021 — Rediseño pantalla por pantalla.** Referencia: el lienzo (https://claude.ai/artifact/Y19oyYK3zMX5j8ir5UikDv). Una historia por pantalla, todas con el mismo criterio: *mismo comportamiento, solo estilo*.

| Pantalla | Código | Tablero del lienzo |
|---|---|---|
| Detalle de publicación | `posts/PostDetailScreen.tsx` | 06 |
| Perfil (vista, guardados, ajustes) | `profile/*` | 14 |
| Actividad | `activity/ActivityScreen.tsx` | 15 |
| Tablero del sector | `emergency/SectorDashboardScreen.tsx` | 11 |
| Publicar (3 pasos) | `publish/PublishScreen.tsx` | 05 |
| Necesito ayuda, Reportar, Vecino vulnerable (3 pasos) | `emergency/*Screen.tsx` | 08b, 09, 10a–10c |
| Ofrecer y Recursos | `emergency/OfferHelpScreen.tsx`, `ResourcesScreen.tsx` | 12 |
| Estado del reporte | `emergency/ReportStatusScreen.tsx` | 13 |
| Onboarding | `onboarding/*` | 01 |

**Pendientes del rediseño (funciones nuevas, no solo estilo).** El rediseño visual de las pantallas con función ya está en la rama `etapa-11-tablero-emprendimientos` (barra de 5 secciones, Inicio, Comunidad, Ayuda, Emergencia, Emprendimientos, formularios, Tablero, Mis reportes y estado del reporte). Lo siguiente se vio en el lienzo pero **no existe en el código**, así que es trabajo por hacer con spec y pruebas:

- [ ] Mensajes y Chat (S2-7).
- [ ] Favoritos de negocios (S2-8).
- [ ] Modo fácil y «Elige cómo ver la app». Hoy no hay ninguna opción de modo fácil ni letra grande en el código; es una función nueva, no un cambio visual (S2-9).
- [ ] Avisos y eventos reales en Comunidad (S2-10).
- [ ] «¿Cuántas personas?» y «¿Hay personas en riesgo?» en los formularios (S2-11).

**Decisiones abiertas:** ~~el chat del lienzo~~ — decidido y hecho (SPEC-025).

#### Ahora: visual y ordenamiento de datos (dueño: compañero de visual)

Mientras las integraciones esperan, el siguiente trabajo es **visual y de orden de datos**. Misma regla del Sprint 2: no se cambia el comportamiento y `npm run check` sigue en verde.

| ID | Historia | Spec | Estim. | Dueño | Depende de |
|---|---|---|---|---|---|
| S2-12 | **Orden de Inicio:** saludo → «¿En qué te ayudamos hoy?» (destacado, sin cuadro) → alerta → «Juntos por el barrio» (fondo, cámaras, perrito) → próximo evento → novedades → negocios → «Pensado para ti» → pendientes. Revisar que no sobre nada y que lo nuevo se vea | SPEC-040 | M | Visual | — |
| S2-13 | **Orden de los feeds:** Comunidad, Ayuda y Explorar con un criterio claro y el mismo en todas (urgente y cercano primero, luego lo reciente; los datos de demo nunca encima de los reales) | SPEC-041 | M | Visual | — |
| S2-14 | **Ayuda: Objetos y favores / Animales.** Pulir las tarjetas «¿De qué se trata?», el selector de Explorar y los colores (animales en ámbar, objetos en morado) | SPEC-042 | S | Visual | — |
| S2-15 | **Pantallas nuevas con el estilo del lienzo:** Fondo (N1), Aportar (N2), Cámara (N3), Perrito (N4), Acompáñame (N5). El lienzo ya tiene la fila «5 · Integraciones nuevas» | SPEC-021 | L | Visual | — |
| S2-16 | **Datos de demostración coherentes entre secciones:** mismos nombres, sector y fechas en publicaciones, fondos, cámaras, perrito y eventos (base para SPEC-031) | SPEC-031 | M | Visual | — |
| S2-17 | **Animaciones en el celular:** revisar en Expo Go el toque de botones y tarjetas, las transiciones entre pantallas, el fundido entre secciones y el menú lateral que se recoge. Ajustar duraciones si algo se ve brusco o lento | — | S | Visual | — |

**SPEC-040 / SPEC-041 — Orden** (criterios, se escriben como spec antes de tocar código)
- *Dado* el Inicio, *entonces* el orden de los bloques es el de S2-12 y la sección «Juntos por el barrio» se ve sin hacer scroll largo.
- *Dado* un feed con datos reales y de demo, *entonces* los reales van primero y los de demo siempre llevan `DemoTag`.
- *Dado* dos publicaciones igual de cercanas, *entonces* va primero la más reciente. Lo urgente va arriba solo con su etiqueta «Urgente · sin validar».
- *Pruebas:* funciones puras de orden (`rankPosts` y una nueva para el Inicio, si hace falta) con su `*.test.ts`.

---

### Sprint 2b — Integraciones (plan: `docs/plan_integraciones_definitivo.md`)

**Regla:** toda integración externa debe ser **gratis** (modo prueba, capa gratuita o alternativa sin costo). Por defecto se usa el modo simulado con `DemoTag`.

**Hecho el 8 de noviembre** (pasa `npm run check`; **falta verlo en Expo Go**):

| ID | Qué | Spec | Dónde se ve |
|---|---|---|---|
| S2b-0 | Preparación: `tsconfig`/ESLint ignoran `supabase/functions`; ADR 0005 (pagos fuera del outbox) | — | — |
| S2b-1 | **Fondos vecinales** con barra de avance, rendición de cuentas y aporte con Yape **simulado** (procesando → confirmado / «No se cobró nada») | SPEC-034 | Inicio, Comunidad |
| S2b-2 | **Cámaras vecinales** (celular con IP Webcam → foto refrescada), registro con reglas de privacidad y capa en el mapa | SPEC-035 | Inicio, Comunidad, Emergencia |
| S2b-3 | **Perrito comunitario** con «Lo vi», «Necesita ayuda», su fondo y QR (`yunta://perrito/negrito`) | SPEC-038 | Inicio, Comunidad, Ayuda |
| S2b-4 | **Acompáñame / Llegué bien:** vecinos de confianza, cuenta regresiva, notificación local y aviso por WhatsApp/SMS. Sin ubicación en vivo | SPEC-039 | Emergencia |
| S2b-5 | **Ayuda separada** en «Objetos y favores» y «Animales» (categoría `pets`) | — | Ayuda, Explorar, Publicar |
| S2b-6 | **SOS en la cabecera** (en lugar del círculo del perfil; el perfil sigue en ☰). Se quitó el buscador de Inicio | — | Todas las secciones |
| S2b-7 | **Animaciones:** toque suave en botones y tarjetas (`PressableScale`), transición deslizante entre pantallas, fundido entre secciones, menú lateral que se recoge | — | Toda la app |

**Siguiente (en espera; se retoma cuando el equipo lo decida):**

| ID | Historia | Spec | Estim. | Dueño | Costo |
|---|---|---|---|---|---|
| S2b-8 | Aplicar la migración `20261109000007_pets_category.sql` en Supabase | — | S | Integraciones | Gratis |
| S2b-9 | Tablas y RLS en Supabase para `funds`, `fund_contributions`, `fund_expenses`, `cameras`, `pets`, `pet_sightings` (plan §5), y leerlas desde la app en vez de solo la demo | SPEC-036 | L | Integraciones | Gratis (plan gratuito de Supabase) |
| S2b-10 | **Pago de prueba con Culqi** (sandbox) vía Edge Function `create-charge`. Solo si la cuenta y el modo de prueba son gratis; si no, se queda el simulado | SPEC-036 | L | Integraciones | Confirmar que es gratis antes de crear la cuenta |
| S2b-11 | **Reporte por WhatsApp, solo texto y sin IA:** número de prueba de Meta + clasificación por palabras clave → tablero con «vía WhatsApp · sin validar». La IA y los audios **no** entran (son de pago) | SPEC-037 | L | Integraciones | Gratis (número de prueba, hasta 5 destinatarios) |
| S2b-12 | Contactos de confianza reales en el perfil para «Acompáñame» (hoy son de demostración) | SPEC-039 | M | Integraciones | Gratis |
| S2b-13 | Cámaras en el APK: permitir `http://` de la red local (`usesCleartextTraffic`) y probar con 2 celulares en el mismo hotspot | SPEC-030 | S | Integraciones | Gratis |

---

### Etapa 13 — Comunidad primero (9–14 nov; plan: `docs/04_tecnico/plan_etapa13_comunidad_primero.md`)

**Origen:** feedback de UX en 4 notas de voz: que la app se sienta como una comunidad, con una barra
**Inicio · Eventos · Explorar · Marketplace · Chat** y el contacto por chat en lugar de solicitudes. _(Ajustada el 8 nov por SPEC-051 / ADR 0007: la barra final es **Inicio · Comunidad · Negocios · Ayuda**, con el chat en burbuja y Emergencia por el SOS.)_
**Meta:** reorganizar la navegación y completar las piezas que faltan, reutilizando lo que ya existe (chat de
SPEC-025, eventos de SPEC-028, feed de Comunidad, Negocios).

**Decisiones que asume** (plan §2, a confirmar con el equipo): Emergencia sale de la barra y se llega con el **SOS**
de la cabecera (D4) · Perfil sigue en ☰ (D5) · Ayuda pasa a ser **Marketplace** y Comunidad deja de ser pestaña (D6; revertida por ADR 0007: vuelve «Ayuda» y Comunidad)
· el chat se abre **sin aceptar solicitud**, con bloqueo y reporte (D1) · avatar con iniciales, foto opcional
después (D2) · «Abierto ahora» solo con horario de OSM (D3).

Orden: **S13-1 → S13-2 → S13-3 → S13-4 → S13-5 → S13-6**. Si falta tiempo, S13-5 se queda con datos demo y S13-6 se recorta.

| ID | Historia | Spec | Estim. | Dueño | Depende de |
|---|---|---|---|---|---|
| S13-1 ✅ | **13a — Barra nueva y rutas:** 5 pestañas, `resolveBar`, redirecciones desde `/ayuda`, `/comunidad`, `/negocios`; la lista de publicaciones pasa a `/publicaciones`; se quita `ChatFab`; tour actualizado | SPEC-043 | M | | decisiones D4–D6 |
| S13-2 ✅ | **13b — Inicio como feed + `Avatar`:** `buildHomeFeed` (puro, con prueba), `FeedCard` exportable, tarjeta «¿Emergencia?», «Juntos por el barrio» y dato agregado de vecinos activos (solo conteo) | SPEC-044 | L | | S13-1 |
| S13-3 ✅ | **13c — Chat directo:** «Escribir» abre o reutiliza la conversación (`start_conversation`), bloquear y reportar, límite de mensajes por minuto; se retira `ContactRequestSheet` | SPEC-045 | L | | S13-1 |
| S13-4 ✅ | **13d — Eventos de vecinos:** feature `events`, crear (2 pasos, Zod + RHF), «Voy» con conteo (nunca la lista), `event.create` y `event.rsvp` en el outbox | SPEC-046 | L | | S13-1 |
| S13-5 ✅ | **13e — Explorar lugares:** ampliar `fetch-places.mjs` (tiendas, restaurantes, mercados) con `opening_hours`, parser propio `abierto / cerrado / no confirmado`, filtros y mapa | SPEC-047 | M | | S13-1 |
| S13-6 ✅ | **13f — Pulido:** foto de perfil opcional, estados vacíos, ADR 0006 (Emergencia fuera de la barra), actualizar SPEC-014/025/028, `README.md` y `context.md` | SPEC-048 | M | | S13-2 a S13-5 |

**Criterios clave** (detalle en cada spec):
- S13-1: las 4 pestañas (Inicio · Comunidad · Negocios · Ayuda) navegan; SOS abre Emergencia en un toque desde cualquier raíz; en Emergencia la barra se ve
  sin pestaña resaltada; los enlaces viejos redirigen; etiquetas completas con letra al máximo.
- S13-3: con 2 cuentas, «Escribir» → hilo → mensaje visible en el otro teléfono en ≤ 8 s; dos toques no crean dos
  conversaciones; tras bloquear no se puede enviar; sin red el mensaje queda en la cola.
- S13-4: con 2 cuentas, A crea un evento, B marca «Voy» y A ve el conteo subir en ≤ 10 s; nadie ve quiénes van.
- S13-5: nunca se dice «Abierto» sin `opening_hours` interpretable.

**Migraciones nuevas:** `20261110000008_open_chat.sql` (S13-3), `20261110000009_neighbor_events.sql` (S13-4) y
`20261110000010_chat_last_from_me.sql` (S13-6).

**Estado (8 nov):** las 6 historias están hechas en la app (✅ = `npm run check` en verde, 165 pruebas). **Falta:**
aplicar las 3 migraciones en Supabase (ninguna se ha ejecutado contra una base), sus pruebas de RLS y verificar en
Expo Go con dos celulares. Decisiones D1–D7 aprobadas; ADR 0006.

---

### Sprint 3 — Release y ensayo (16–17 nov)

**Meta:** una app instalable, congelada y verificada.

| ID | Historia | Spec | Estim. | Dueño |
|---|---|---|---|---|
| S3-1 | **APK instalable:** `eas init`, variables, perfil `preview`, instalación en un celular limpio | SPEC-030 | L | |
| S3-2 | **Clave de Google Maps** para Android, o decidir el plan B (lista sin mapa) | SPEC-030 | S | |
| S3-3 | **Datos de demostración coherentes:** semilla de Supabase y forma de reiniciarla | SPEC-031 | M | |
| S3-4 | **Regresión completa** (SPEC-010 a SPEC-016) sobre el APK | SPEC-032 | L | |
| S3-5 | **Congelar el código** (16 nov, 12:00) y etiquetar la versión | — | S | |
| S3-6 | **Ensayo con la app funcionando** (15 min) en el dispositivo de la final, con plan de respaldo si falla el internet o el servidor | SPEC-033 | M | |
| S3-7 | Documentación final (`README.md`, `context.md`) | — | S | |

**SPEC-030 — APK** (criterios)
- *Dado* un celular Android limpio, *cuando* se abre el enlace del build, *entonces* la app se instala y abre sin cuenta de desarrollo.
- *Dado* el APK instalado, *entonces* funciona con Supabase (las variables se cargaron al build) y las claves no están en el repo.
- Comandos de referencia (en la terminal): `npx eas-cli login` → `npx eas-cli init` → `npx eas-cli env:create --name EXPO_PUBLIC_SUPABASE_URL --value <url> --environment preview --visibility plaintext` (y lo mismo con `EXPO_PUBLIC_SUPABASE_ANON_KEY`) → `npx eas-cli build --platform android --profile preview`. Las variables solo se leen al compilar: si cambian, hay que compilar de nuevo.
- Sin clave de Google Maps el mapa se ve gris en el APK; el resto de la app funciona.

**SPEC-031 — Datos de demo:** la semilla deja el sector de la final con avisos, negocios y recomendaciones creíbles, todos marcados como demostración, y existe un script para dejarlo en ese estado antes de cada ensayo.

**SPEC-033 — Ensayo (solo la parte de la app):** el flujo completo sale en 15 minutos o menos, hay un segundo dispositivo cargado, y existe un **video de respaldo** de la app funcionando por si falla la conexión.

---

## 5. Trazabilidad con los criterios del jurado

| Criterio | Qué lo demuestra | Historias |
|---|---|---|
| **Funcional** | Flujo de Rosa de punta a punta, modo avión, Emprendimientos | S1-1, S1-2, S1-6, S3-4 |
| **Técnico** | Cola offline con prioridad, RLS, estados honestos, pruebas automáticas, CI | S0-2 a S0-6, S1-3 |
| **Valor** | Un solo lugar para el día a día y la emergencia; sirve a adultos mayores (voz, letra grande, 3 toques) | S1-4, S1-7, S2-2 |
| **Innovación y originalidad** | Ayudar por un vecino sin dar nombre ni diagnóstico; tablero con privacidad por sector | S1-1, S1-3 |

---

## 6. Plantilla de spec (copiar a `docs/specs/SPEC-NNN-nombre.md`)

```markdown
# SPEC-NNN — Título corto

- **Estado:** borrador | aprobada | en curso | hecha
- **Sprint:** N · **Historia:** SN-X · **Dueño:** nombre · **Revisor:** nombre
- **Criterio del jurado que apoya:** funcional | técnico | valor | innovación

## Contexto
Qué problema resuelve y para quién (una o dos frases).

## Alcance
- Incluye: …
- No incluye: …

## Criterios de aceptación
1. Dado …, cuando …, entonces …
2. …

## Casos borde y errores
- Sin conexión: …
- Permiso denegado: …
- Datos vacíos: …

## Privacidad y accesibilidad
- Qué dato no debe salir del teléfono.
- Letra grande, lector de pantalla, estados con texto.

## Pruebas (se escriben primero)
| Criterio | Tipo | Archivo |
|---|---|---|
| 1 | unitaria / componente / SQL / manual | `src/.../x.test.ts` |

## Archivos que toca / que NO debe tocar
- Toca: …
- No toca: …

## Verificación manual
Pasos en Expo Go (y con 2 dispositivos si aplica) y resultado.
```

### Lista de verificación de cada Pull Request
- [ ] La spec está aprobada y enlazada.
- [ ] Hay un commit de pruebas en rojo antes del código.
- [ ] `typecheck`, `lint`, `test`, `expo-doctor` y `expo export` en verde.
- [ ] Sin regresiones en pruebas existentes.
- [ ] Probado en Expo Go (y con 2 dispositivos si toca el servidor).
- [ ] Sin datos privados en logs, cola ni servidor; lo ficticio dice «DATO DE DEMO».
- [ ] Accesibilidad revisada (letra grande, lector, 48 dp, texto además de color).
- [ ] `context.md` actualizado si cambió la estructura.

---

## 7. Riesgos y decisiones abiertas

| Riesgo o decisión | Impacto | Qué hacer |
|---|---|---|
| Configurar Jest con NativeWind v5 y Reanimated puede costar tiempo | Bloquea TDD | Empezar el Sprint 0 por aquí; si en medio día no corre, probar solo lógica pura primero y los componentes después |
| Nada se probó en dispositivo | Fallos visibles en la final | Programar la sesión de errores (S1-8) el 12 de nov y no más tarde |
| Mapa gris en el APK sin clave de Google | Mapa inútil en la demo | Resolver en S3-2 o usar Expo Go con mapa nativo como plan B |
| Depender de internet y de Supabase en la final | La demo falla | Datos de demo, video de respaldo y modo sin conexión verificado (SPEC-011) |
| Notificaciones solo locales | No avisan con la app cerrada | Declararlo como límite; push remoto queda fuera de alcance |
| Cambios de estilo que rompan comportamiento | Regresiones | Regla de S2: las pruebas existentes no se tocan |
| ~~¿Se construye el chat?~~ | — | Decidido y hecho (SPEC-025) |
| Integraciones con costo (IA, transcripción, pasarela) | Gasto no previsto | Regla: solo gratis. Si no hay opción gratuita, se queda el modo simulado con `DemoTag` |
| Migración de animales sin aplicar | Publicaciones de animales no suben | S2b-8 antes de la regresión del APK |
| Cámaras por `http://` bloqueadas en el APK | Cámaras sin imagen en la final | S2b-13 o mostrar las cámaras desde Expo Go |
| Animaciones no vistas en un celular | Pueden verse lentas o bruscas | S2-17 en Expo Go antes del 13 de nov |
| ¿Hay verificación real de vecinos (confianza)? | Hoy es solo demostración | Declararlo como límite; no inventar métricas |
| Emergencia sale de la barra (Etapa 13, D4) | Menos visible en la demo | SOS en todas las cabeceras y tarjeta fija en el Inicio; validarlo con TalkBack en SPEC-013 |
| La Etapa 13 se cruza con el Sprint 1 | Validar dos veces la navegación | Terminar S13-1 antes del 10 de nov y correr SPEC-010 sobre la barra nueva |
| Chat sin aceptar solicitud (Etapa 13, D1) | Más riesgo de mensajes no deseados | Registro obligatorio, bloqueo, reporte y límite de mensajes por minuto (S13-3) |

## 8. Fuera de alcance (backlog posterior)
Push remoto · verificación de identidad real · panel para coordinadores y moderadores · pagos reales y convenios con comercios (solo simulado o sandbox gratis) · juntas de ahorro · ubicación en vivo en «Acompáñame» · IA y audios por WhatsApp · versión para iPhone instalable · reconocimiento de voz (dictado a texto).

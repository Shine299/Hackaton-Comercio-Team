# Sprints — Red Vecinal Solidaria

Plan de lo que falta para cerrar la app, pensado para que cada integrante pueda tomar una historia y avanzar sin preguntar.
Metodología: **SDD (Spec-Driven Development) + TDD (Test-Driven Development)**, en sprints cortos.

- **Hoy:** 7–8 de noviembre de 2026. **Entrega final (sustentación de finalistas): 17 de noviembre de 2026, 6:00 p. m.**
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
- Un color = un significado: rojo = urgencia real, teal = acciones, azul = «Pide», verde = solo completado, terracota = solo prioridad, ámbar = pendiente.

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
| Servidor | `supabase/migrations`, `supabase/seed.sql` |

### Lo que falta (resumen)
1. **No hay pruebas automáticas.** Ni framework ni un test. Es lo primero.
2. **Nada está probado en un dispositivo real.** Todo pasó `tsc`, lint y empaquetado, pero no se vio en Expo Go.
3. **La rama de la etapa 11 no está en `main`.**
4. **Imágenes definitivas:** hoy son bloques de color con ícono (lista en el Sprint 2).
5. **Pantallas sin rediseño individual:** Detalle, Perfil, Actividad, Tablero, Publicar, formularios de Emergencia, Estado del reporte y Onboarding solo reciben el estilo compartido.
6. **APK instalable:** `eas.json` existe, falta ejecutar `eas init`, cargar las variables y compilar. El mapa necesita clave de Google Maps en Android.
7. **Seguridad en Supabase:** revisar el aviso de `rls_auto_enable()` (ejecutable sin cuenta; no lo creamos nosotros) y confirmar `Allow anonymous sign-ins`.
8. **Límites conocidos:** dictado a texto simulado en Publicar; notificaciones solo locales (no push remoto); la nota de voz no se reproduce en la pantalla de estado del reporte; iPhone solo con Expo Go; el chat del lienzo no existe en la app.
9. **Deuda técnica:** el filtro «Delivery» busca la palabra en un texto libre de `details`; la «confianza» de vecinos es solo de demostración (no hay verificación real).
10. **Lienzo:** 15 tableros conservan la barra inferior anterior.

---

## 3. Calendario

| Sprint | Fechas | Objetivo | Resultado esperado |
|---|---|---|---|
| **0 — Cimientos** | 8–9 nov | Pruebas, specs y `main` al día | `npm test` corre y cubre la lógica actual; etapa 11 fusionada |
| **1 — Validar el flujo central** | 10–12 nov | Que lo que ya existe funcione de verdad | Flujo de Rosa, modo avión, privacidad y accesibilidad verificados en 2 dispositivos |
| **2 — Visual y pantallas** | 13–15 nov | Terminar el rediseño con las imágenes | Todas las pantallas con el estilo final; sin bloques vacíos |
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

**SPEC-014 — Navegación por sección** (criterios)
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

**Decisiones abiertas:** el **chat** del lienzo (tablero 07) no existe en la app, que hoy usa «solicitud antes del contacto». Se deja fuera de alcance salvo que el equipo decida lo contrario.

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
| ¿Se construye el chat? | +1 a 2 días | Decisión del equipo antes del 13 de nov; por defecto, no |
| ¿Hay verificación real de vecinos (confianza)? | Hoy es solo demostración | Declararlo como límite; no inventar métricas |

## 8. Fuera de alcance (backlog posterior)
Push remoto · chat en tiempo real · verificación de identidad real · panel para coordinadores y moderadores · pagos o convenios con comercios · versión para iPhone instalable · reconocimiento de voz (dictado a texto).

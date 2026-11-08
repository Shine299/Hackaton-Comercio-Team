# SPEC-044 — Inicio como feed comunitario + Avatar

- **Estado:** implementada (8 nov 2026); `npm run check` en verde. **Falta** verificar en Expo Go (criterios 7–10)
- **Dueño / revisor:** … / …
- **Sprint:** Etapa 13 — historia S13-2 (13b). Plan: `docs/04_tecnico/plan_etapa13_comunidad_primero.md` §4
- **Depende de:** SPEC-043 (barra nueva). **Reemplaza:** el orden de Inicio de S2-12 / SPEC-040 y la pantalla Comunidad

## Qué y por qué
El feedback pide que el Inicio se sienta como una comunidad: **personas** (avatar, nombre) y lo que publican, no un
menú de 4 tarjetas. Hoy el Inicio es un menú con carruseles y el feed vive en Comunidad, que ya no tiene pestaña.
Esta historia junta todo en un solo feed en el Inicio y agrega un avatar con iniciales. No toca el servidor.

## Orden del Inicio
1. Cabecera (`SectionHeader`): el botón del menú muestra **tu avatar** si estás registrado (si no, ☰).
2. Saludo + dato agregado: «N vecinos activos esta semana en {sector}» (solo un número; `DemoTag` si sale de datos demo).
3. Alerta del sector (si hay), fija.
4. **Los 4 botones grandes** (SPEC-051, devueltos al Inicio): Comunidad → `/eventos`, Negocios → `/explorar`, Emergencia → `/emergencias`, Ayuda → `/ayuda`. Reemplazan a la tarjeta «¿Emergencia?». **El Inicio no muestra la barra inferior.**
5. Acción rápida: **Publicar** (`/publicar`), a todo el ancho. Ya no hay «Ver eventos»: lo cubre el botón grande de Comunidad.
6. «Tienes pendiente» (tus reportes sin resolver), si hay.
7. «Juntos por el barrio»: fondo, cámaras, perrito (sin cambios).
8. **«Lo nuevo en tu barrio»**: el feed (máx. 30) + botón «Ver todas las publicaciones».
9. Aviso «no reemplaza a los servicios oficiales».

Se retiran del Inicio: los carruseles (`HomeCarousels`), «Presta hoy» y «Pensado para ti»
(todo eso aparece ahora dentro del feed). Se borra `CommunityScreen`.

## Reglas del feed (`home/feed.ts`, función pura `buildHomeFeed`)
- Entran publicaciones **activas, no vencidas, dentro del radio y que no son tuyas**, ordenadas con `rankPosts`
  (no invisibiliza a vecinos nuevos), y eventos vigentes de los **próximos 7 días** (en curso incluidos, SPEC-028).
- **Lo real va antes que lo de demostración** (SPEC-041).
- Dentro de cada grupo se intercala: **un evento después de cada 2 publicaciones** (`P P E P P E…`); si se acaban
  unos, siguen los otros.
- Máximo 30 elementos.
- `activeNeighbors(posts, now)`: número de **autores distintos** con publicaciones de los últimos 7 días, más si
  todos son de demo. Nunca devuelve nombres.

## Avatar (`shared/ui`)
- `initialsOf(name)`: hasta 2 letras en mayúscula (primera letra de las 2 primeras palabras; «Rosa M.» → «RM»;
  vacío → «?»).
- `avatarColor(id)`: color estable para el mismo id, de una paleta fija con contraste ≥ 4,5:1 contra texto blanco.
- `<Avatar name id size uri? />`: círculo con iniciales o foto (foto opcional, 13f). Tamaños 32 / 40 / 56. Si no
  tiene `accessibilityLabel` propio, es decorativo (lo lee la tarjeta que lo contiene).

## Tarjeta de feed (`home/FeedCard.tsx`)
Avatar + nombre público + distancia aproximada + hora relativa · etiqueta de tipo con ícono y texto (**Ofrezco /
Necesito / Negocio**) · «Urgente · sin validar» si aplica · bloque de color de la categoría (o la foto) · título y
2 líneas de descripción · «Ver detalle ›». Toda la tarjeta es un solo botón accesible que abre la publicación. En
13c la acción pasa a «Escribir». Los eventos usan `EventCard` (ya existente) y abren `/eventos`.

## Criterios de aceptación
1. **Dado** publicaciones reales y de demo, **cuando** abro el Inicio, **entonces** todas las reales aparecen antes
   que cualquiera de demo, y las de demo llevan «DATO DE DEMO».
2. **Dado** 4 publicaciones y 2 eventos del mismo grupo, **entonces** el orden es P P E P P E.
3. **Dado** una publicación mía, vencida, pausada o fuera del radio, **entonces** no aparece en el feed.
4. **Dado** un evento que empieza en más de 7 días, **entonces** no aparece en el feed (sí en Eventos).
5. **Dado** más de 30 elementos, **entonces** se muestran 30 y el botón «Ver todas las publicaciones».
6. **Dado** 3 publicaciones de 2 autores en la última semana y 1 de hace 10 días de un tercero, **entonces** el saludo
   dice «2 vecinos activos esta semana».
7. **Dado** una tarjeta de publicación, **entonces** muestra avatar con iniciales, nombre público, tipo con texto e
   ícono, y al tocarla abre el detalle.
8. **Dado** que estoy registrado como «Rosa M.», **entonces** la cabecera muestra «RM» en lugar de ☰ y al tocarla se
   abre el menú.
9. **Dado** el Inicio, **cuando** toco el botón grande «Pide auxilio al instante», **entonces** se abre Emergencia sin cuenta.
10. **Dado** el Inicio, **entonces** no se ve la barra inferior; **cuando** toco un botón grande, **entonces** llego a su sección y ahí sí hay barra, con «Inicio» para volver.
10. **Dado** letra al máximo y TalkBack, **entonces** cada tarjeta se lee completa (tipo, título, autor, distancia,
    hora, demo) y mide ≥ 48 dp.

## Alcance
- **Toca:** `src/shared/ui/avatarColors.ts` (+ `avatarColors.test.ts`), `src/shared/ui/Avatar.tsx`, `src/shared/ui/index.ts`,
  `src/features/home/feed.ts` (+ `feed.test.ts`), `src/features/home/FeedCard.tsx`,
  `src/features/home/HomeScreen.tsx`, `src/features/home/index.ts`, `src/features/shell/SectionHeader.tsx`.
  Se borran `home/CommunityScreen.tsx` y `home/HomeCarousels.tsx`.
- **No debe cambiar:** `PostCard`, `EventCard`, `rankPosts`, datos y hooks de posts/eventos/fondos, Emergencia, la
  barra (SPEC-043).
- **Reglas:** `shared/ui` no importa `features`; imports por `index.ts`; sin ciclos.

## Pruebas
- **Automáticas (primero, en rojo):** `shared/ui/avatarColors.test.ts` (iniciales, color estable, paleta), `home/feed.test.ts`
  (criterios 1–6).
- **Manuales (Expo Go):** criterios 7–10; scroll con el feed lleno en un Android de gama baja; modo fácil.

## Privacidad y accesibilidad
- Solo nombre público y distancia aproximada; el conteo de vecinos activos es un número, nunca una lista.
- Tipo con texto + ícono (no solo color). Avatar decorativo dentro de la tarjeta para no repetir el nombre.

# SPEC-056 — Políticas de servicios y marca de agua «Yunta Perú» en el menú lateral

- **Estado:** borrador (rama `shay-spec-056-politicas-de-servicio`, 8 nov 2026). Pasa a «implementada» con `npm run check`
  en verde y probada en Expo Go.
- **Dueño / revisor:** Shay / _(pendiente: otra persona del equipo)_
- **Sprint:** Etapa 13 (menú lateral), historia **S13-10**.
- **Depende de:** SPEC-055 (la rama se apila sobre `shay-spec-055-atras-a-la-seccion`; no comparten archivos de la pantalla).
- **⚠ Contenido pendiente de revisión legal.** Los textos son un **borrador escrito a partir de lo que la app ya hace** (código,
  specs y ADR 0005 y 0008). No son términos legales revisados por un abogado; antes de publicar la app hay que revisarlos.

## Qué y por qué
El menú lateral (☰) no dice cómo usa Yunta los datos, qué pasa con el micrófono del Modo guardia, que la IA es externa ni que
la app no reemplaza a los servicios oficiales. Esta spec agrega una **sección «Políticas de servicios»** con 4 accesos y una
**marca de agua** tenue de la marca **Yunta Perú** detrás del contenido del menú.

## Políticas (resumen; el texto completo vive en `features/policies/policies.ts`)

| Id | Título | De dónde sale lo que dice |
|---|---|---|
| `terminos` | Términos de uso | Qué es Yunta, cuenta mínima (nombre público), convivencia, publicaciones «urgentes sin validar», datos de demo (SPEC-045, `CLAUDE.md`) |
| `privacidad` | Privacidad y datos | Lo que se guarda en el teléfono, sector aproximado, estados honestos, «nadie ve quién va» (SPEC-046), lo que nunca sale del teléfono |
| `emergencias` | Emergencias y Modo guardia | No reemplaza a los servicios oficiales, SOS sin cuenta, micrófono y ubicación consentidos del Modo guardia (ADR 0008), Acompáñame (SPEC-039) |
| `ia-pagos` | Asistente con IA y pagos | IA externa y gratuita que puede equivocarse (SPEC-049), voz solo para pasarla a texto, «Yunta no guarda dinero» y pagos solo en línea (ADR 0005) |

## Criterios de aceptación
1. **Dado** el menú lateral, **entonces** debajo de los accesos actuales hay un bloque con el encabezado «Políticas de servicios» y
   4 accesos (Términos de uso, Privacidad y datos, Emergencias y Modo guardia, Asistente con IA y pagos), cada uno de ≥ 56 dp.
2. **Dado** uno de esos accesos, **cuando** lo toco, **entonces** el menú se cierra y se abre `/politicas` con **esa** política
   desplegada y las demás cerradas.
3. **Dado** `/politicas`, **entonces** veo las 4 políticas como tarjetas desplegables (título, resumen de una línea, ícono);
   tocar una alterna abrir/cerrar y su estado (`expanded`) lo lee el lector de pantalla; arriba se ve la versión y la fecha.
4. **Dado** que ya estoy en `/politicas` y toco otro acceso del menú, **entonces** se abre la política elegida.
5. **Dado** el contenido, **entonces** no promete nada que la app no haga: lo comprueba una prueba de contenido (p. ej.
   Emergencias dice que no reemplaza a los servicios oficiales y que el Modo guardia es opcional y solo escucha con la app a
   la vista; IA y pagos dice «Yunta no guarda dinero»; Privacidad dice que lo público es solo el sector aproximado).
6. **Dado** el menú abierto, **entonces** se ve, muy tenue (≤ 10 % de opacidad), el emblema de Yunta y el texto «Yunta Perú»
   detrás del contenido; no recibe toques, no cambia el contraste del texto (≥ 4,5:1) y los lectores de pantalla lo ignoran.
7. **Dado** «Atrás» en `/politicas`, **entonces** vuelve a donde estaba; sin historial cae al Inicio (SPEC-055).
8. **Dado** letra del sistema al máximo, **entonces** los títulos y el texto de las políticas se leen completos (la tarjeta crece).

## Alcance
- **Toca:** nueva feature `src/features/policies/` (`policies.ts` + `policies.test.ts`, `PoliciesScreen.tsx`, `index.ts`),
  ruta `src/app/politicas.tsx` (solo re-exporta) y su `Stack.Screen` en `src/app/_layout.tsx`,
  `src/features/shell/ProfileDrawer.tsx` (sección y marca de agua), `src/shared/ui/BrandWatermark.tsx` (+ export en
  `src/shared/ui/index.ts`), `context.md` (feature y ruta nuevas).
- **No debe cambiar:** los accesos actuales del menú, la apertura/cierre y animación del panel, la barra inferior, el SOS,
  las demás rutas y la lógica de datos. El menú no importa nada de `policies` salvo su `index.ts`.
- **Reglas de arquitectura:** `shared/` no importa de `features/` (la marca de agua es genérica); entre features solo por
  `index.ts`; sin ciclos (`npm run arch:check`).

## Pruebas
- **Automáticas (primero, en rojo):** `features/policies/policies.test.ts` — 4 políticas con ids únicos y orden fijo; cada
  una con título, resumen e ≥ 1 sección con texto; `getPolicy` / `isPolicyId`; contrato de contenido del criterio 5.
- **Manuales (Expo Go):**
  - [ ] ☰ → bloque «Políticas de servicios» con 4 accesos; cada uno abre su política desplegada.
  - [ ] Con `/politicas` abierta, volver al menú y tocar otra política: cambia la desplegada.
  - [ ] Marca de agua visible pero tenue, sin tapar ni dificultar leer el menú; el panel sigue deslizando y cerrando bien.
  - [ ] Letra al máximo, modo fácil y TalkBack (tarjetas «expandida/contraída»; la marca de agua no se anuncia).

## Notas de accesibilidad y privacidad
- Áreas táctiles ≥ 48 dp, ícono con texto y estado con texto (no solo color).
- No se recopila ningún dato nuevo ni se piden permisos nuevos; las políticas describen lo que la app ya hace.
- La marca de agua es decorativa: `accessibilityElementsHidden` / `importantForAccessibility="no-hide-descendants"`.

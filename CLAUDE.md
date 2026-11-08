# Yunta — guía para trabajar con IA

App móvil (Expo SDK 58 + React Native + TypeScript) que coordina ayuda entre vecinos. Lee primero
[`AGENTS.md`](AGENTS.md) (reglas de Expo: **no confíes en tu memoria de las APIs**, consulta la doc de la versión)
y el [`README.md`](README.md) (arquitectura y diagramas).

## Comandos

```bash
npm run check        # typecheck + lint + arch:check (ciclos) + tests. Corre esto antes de decir «listo».
npm run typecheck    # tsc --noEmit
npm run lint         # expo lint (incluye las reglas de límites entre features)
npm run arch:check   # madge: falla si hay ciclos de dependencia
npm test             # jest (lógica pura, junto al código: *.test.ts)
npx expo start       # dev server (Expo Go / "w" para web)
npx expo install <paquete>   # SIEMPRE así (versiones compatibles con el SDK), nunca npm/yarn add
```

## Dónde va cada cosa

| Quiero… | Lo pongo en… |
|---|---|
| Una ruta/pantalla nueva | `src/app/<ruta>.tsx` delgada: solo re-exporta la pantalla desde `@/features/<x>` |
| UI + lógica de una funcionalidad | `src/features/<x>/` y se expone en su `index.ts` |
| Un componente/hook/estilo que usan 2+ features | `src/shared/` (`ui`, `hooks`, `nav`, `storage`…) |
| Color/degradado/ilustración de marca | `src/shared/ui` (`gradients.ts`, `illustrations.ts`), tokens en `src/global.css` |
| Texto de interfaz | Español, directo y cálido. El código (nombres) va en inglés |
| Una regla de negocio pura | Función pura en la feature + prueba `*.test.ts` al lado |

## Reglas de dependencia (las hace cumplir el lint y `arch:check`)

1. `app/` → `features/` → `shared/`. **`shared/` nunca importa de `features/`.**
2. Entre features: **solo por `index.ts`** (`@/features/posts`, nunca `@/features/posts/algo`).
   Si necesitas algo que no está exportado, expórtalo desde el `index.ts` de esa feature.
3. **Sin ciclos.** Si dos features se necesitan, mueve lo común a `shared/` o inyéntalo (ejemplo: la
   campana usa `shared/nav/activityBadgeStore`; Emergencia recibe el mapa como prop desde la ruta).
4. `sync/` es la capa de orquestación (conoce `outbox`, `posts`, `emergency`, Supabase); nadie depende de ella salvo `app/`.

## Convenciones de producto (no negociables)

- Accesibilidad: áreas táctiles ≥ 48 dp, `accessibilityLabel`/`Role`, estado con texto + icono (no solo color).
- Todo dato ficticio lleva `DemoTag`. «Guardado en el teléfono» **nunca** se muestra como «recibido»
  (`SyncStatusBadge`). Ubicación siempre aproximada (sector), nunca exacta.
- La app **no reemplaza** a los servicios oficiales de emergencia; el SOS y el reporte funcionan sin cuenta.
- Sin secretos en el cliente: solo `EXPO_PUBLIC_*` (clave anónima de Supabase; la protección real es RLS).

## Trampas conocidas

- **Saltos de línea CRLF/LF**: muchos archivos del repo tienen CRLF. Un script `node`/`sed` que busque texto
  multilínea falla **en silencio**. Para editar usa la herramienta Edit y verifica con `git diff`.
- **Git Bash en Windows** convierte argumentos que empiezan con `/` o `@/` en rutas: usa `MSYS_NO_PATHCONV=1`.
- NativeWind v5 (`nativewind`, `react-native-css`, `tailwindcss`, `lightningcss`) está **fijado**: no actualizar sin probar.
- `expo-notifications` no existe en web: hay un `BoardNotifier.web.tsx` que no hace nada. Mantén los archivos
  `*.web.tsx` al agregar módulos nativos.
- Mapas: `react-native-maps` en nativo, Leaflet/OpenStreetMap en web (`NativeLayerMap.web.tsx`).

## Cómo trabajamos (SDD + TDD, ver `sprints.md`)

1. **Spec** corta en `docs/specs/SPEC-NNN-nombre.md` (plantilla en `docs/specs/_plantilla.md`) con criterios
   Dado/Cuando/Entonces.
2. **Prueba** que falla, **código** mínimo, **refactor**, y `npm run check`.
3. Decisiones de arquitectura nuevas → un ADR corto en `docs/adr/`.
4. No hagas commit ni push sin que el usuario lo pida. Un cambio, un commit; mensajes en español.
5. Antes de afirmar que algo funciona: corre `npm run check`; para UI, ábrelo en Expo Go o web.

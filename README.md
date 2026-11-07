# Red Vecinal Solidaria

Prototipo Android/iOS (Expo + React Native + TypeScript) para una hackatón de 48 horas.
**Tu comunidad, más cerca.**

> La app coordina ayuda entre vecinos. **No reemplaza a los servicios oficiales de emergencia**
> ni garantiza que un reporte haya sido recibido. No publicar ubicaciones exactas ni datos médicos
> sensibles.

## Ejecutar

```bash
npm install
cp .env.example .env     # opcional por ahora (Supabase y Google Maps llegan en etapas 8 y 10)
npx expo start           # QR con Expo Go, o "w" para web
```

Comandos útiles: `npm run typecheck`, `npx eslint src`, `npx expo-doctor`.

## Estructura del repo

```
.
├── docs/                     Especificación de producto y UX (fuente de verdad)
│   ├── 01_producto/          Brief y decisiones confirmadas
│   ├── 02_ux_ui/             Arquitectura de información y flujos
│   ├── 03_accesibilidad_emergencias/   Inclusión, crisis y offline
│   ├── 04_tecnico/           Stack y alcance MVP de 48 h
│   └── 05_prompts_ia/        Prompts de implementación y diseño
├── design/
│   └── stitch/               Pantallas de referencia visual (HTML + PNG) y DESIGN.md
├── src/
│   ├── app/                  Rutas de Expo Router (delgadas: solo importan pantallas)
│   ├── features/             Una carpeta por funcionalidad (UI + dominio + datos)
│   │   ├── shell/            TopBar y barra de pestañas
│   │   ├── onboarding/       Tutorial inicial (pasos, store, pantalla)
│   │   ├── sector/           Sector del vecino (GPS opcional/manual, store, pantallas)
│   │   ├── posts/            Publicaciones: tipos, categorías, relevancia, filtros, repositorio (mock)
│   │   ├── home/  explore/  publish/  activity/  profile/
│   │   ├── emergency/        Centro de emergencias y su cabecera
│   │   └── dev/              Galería del sistema de diseño (solo revisión)
│   ├── shared/
│   │   ├── ui/               Design system: Text, Button, Card, Badge, Screen…
│   │   ├── sync/             Estados de sincronización (dominio compartido)
│   │   ├── storage/          Almacén clave-valor local (SQLite; localStorage en web)
│   │   └── geo/              Utilidades geográficas (distancia)
│   └── global.css            Tokens de diseño (Tailwind v4 @theme)
├── scripts/                  Scripts de ingesta (p. ej. lugares de OpenStreetMap, etapa 7b)
├── supabase/                 Esquema SQL, RLS y datos semilla (etapa 10)
├── assets/                   Iconos y splash
├── app.json  package.json  metro.config.js  postcss.config.mjs  tsconfig.json
└── AGENTS.md                 Guía para agentes de IA sobre Expo
```

### Reglas de organización

- Una funcionalidad nueva = una carpeta en `src/features/<nombre>/` con `components/`, `data/`,
  `hooks/` y `types.ts` según haga falta, y un `index.ts` público.
- `src/app/` solo contiene rutas; la lógica y la UI viven en `features/`.
- `shared/` no puede importar de `features/`. Una feature puede importar de `shared/` y, solo a
  través de su `index.ts`, de otras features.
- Alias de importación: `@/*` apunta a `src/*`.

## Stack

Expo SDK 58 · Expo Router · NativeWind v5 (Tailwind v4) · TanStack Query · Zustand ·
React Hook Form + Zod · expo-sqlite · expo-secure-store · expo-location · react-native-maps.

NativeWind v5 está en release candidate: `nativewind`, `react-native-css`, `tailwindcss` y
`lightningcss` están **fijados** en `package.json`. No los actualices sin probar.

## Convenciones de producto

- Accesibilidad por defecto: áreas táctiles >= 48 dp, `accessibilityLabel`/`accessibilityRole`,
  estados con texto + icono (nunca solo color), escalado de fuente del sistema.
- Todo dato ficticio se muestra con `DemoTag` («DATO DE DEMO»).
- Los estados de sincronización usan `SyncStatusBadge`; «guardado en el teléfono» nunca se
  presenta como «recibido».
- Tokens de color en `src/global.css`, espejados en `src/shared/ui/theme.ts`.
- Código en inglés, textos de interfaz y documentación en español.

## Leer antes de programar

1. `docs/01_producto/brief_producto_y_decisiones.md`
2. `docs/02_ux_ui/arquitectura_y_flujos.md`
3. `docs/03_accesibilidad_emergencias/requisitos_inclusion_y_crisis.md`
4. `docs/04_tecnico/stack_y_mvp_48h.md`
5. `docs/05_prompts_ia/prompt_implementacion_react_native.md`

Las pantallas de `design/stitch/` son **referencia visual**; ante cualquier diferencia, mandan los
documentos de `docs/`. El mapa de rutas de Stitch está en
`design/stitch/arquitectura_de_rutas_y_enlaces_html_red_vecinal_solidaria.md`.

## Estado de implementación

| Etapa | Estado |
|---|---|
| 0. Scaffold | Hecho |
| 1. Design system y navegación | Hecho |
| 2. Onboarding y sector | Hecho (tutorial de 7 pasos, sector por GPS o manual, persistencia local) |
| 3. Inicio y Explorar | Hecho (datos de demo, filtros, relevancia inteligente; el mapa llega en la etapa 8) |
| 4. Detalle y publicar | Hecho (solicitud antes del chat, guardar, reportar, flujo en 3 pasos, borrador local) |
| 5. Perfil y confianza | Hecho (perfil público, colecciones, privacidad y disponibilidad voluntaria; verificación real en la etapa 10) |
| 6. Centro de emergencias | Hecho (peligro inmediato en un toque, necesito ayuda, reportar incidente, ofrecer ayuda con ciclo de recursos, necesidades y recursos de demo, números configurables con aviso; todo queda «Guardado en tu teléfono» en la cola local con prioridad emergencia/urgente) |
| 7. Seguimiento y tablero | Hecho (vecino vulnerable en 3 pasos sin nombre ni diagnóstico, tablero del sector con motivo/fuente/hora/validación, bandeja de Actividad con filtros y leído/no leído local) |
| 8. Mapa por capas | Hecho (Explorar → Mapa: 7 capas, react-native-maps con `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY`, lista equivalente sin clave, puntos en zona aproximada, lugares OSM de Lince versionados con `scripts/fetch-places.mjs`) |
| 9. Cola offline | Hecho (`sync_queue` en expo-sqlite, salida emergencia→urgente→normal, reintento visible, descarte crítico con confirmación, bloque «Cola de envío» en Ajustes; sin servidor el tope es «local»/«pendiente») |
| 10 | Pendiente |

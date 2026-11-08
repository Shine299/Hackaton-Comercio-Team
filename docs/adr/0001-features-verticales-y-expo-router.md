# ADR-0001 — Features verticales con Expo Router

- **Estado:** aceptada

## Contexto
Una app con muchas pantallas (Inicio, Comunidad, Emprendimientos, Ayuda, Emergencia…) trabajada por varias
personas y por IA. Sin límites claros, las carpetas por tipo (`components/`, `screens/`) se enredan.

## Decisión
- Rutas en `src/app/` (Expo Router), **delgadas**: solo re-exportan una pantalla.
- Una carpeta por funcionalidad en `src/features/<x>/` con UI, estado y datos, y un `index.ts` público.
- Lo compartido vive en `src/shared/`, que no conoce a las features.
- Las reglas se **automatizan**: ESLint `no-restricted-imports` + `madge --circular` (`npm run check`).

## Consecuencias
- Cambios acotados a una feature; la IA recibe un mapa claro de dónde tocar.
- Hay que exportar explícitamente lo que otra feature necesita; a cambio, no hay imports profundos ni ciclos.
- Deuda conocida: `emergency` (~3 000 líneas) y `publish` (~570 en un archivo) conviene partirlas.

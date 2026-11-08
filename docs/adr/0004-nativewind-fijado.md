# ADR-0004 — NativeWind v5 (Tailwind v4) con versiones fijadas

- **Estado:** aceptada

## Contexto
Queremos estilos con clases y tokens de diseño compartidos en la app móvil. NativeWind v5 está en
release candidate y sus piezas (`nativewind`, `react-native-css`, `tailwindcss`, `lightningcss`) deben coincidir.

## Decisión
- Tokens de color en `src/global.css` (`@theme`), espejados en `src/shared/ui/theme.ts` para APIs que piden hex
  (mapas, degradados).
- Esas cuatro dependencias están **fijadas** (sin `^`) y `lightningcss` además en `overrides`.
- Actualizar solo en una rama aparte, con prueba en Android e iOS.

## Consecuencias
- Estilos consistentes y rápidos de escribir; riesgo controlado de regresiones por RC.
- Degradados y SVG usan valores literales (`shared/ui/gradients.ts`) porque `LinearGradient` no lee clases.

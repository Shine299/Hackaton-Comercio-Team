/**
 * Espejo en TypeScript de los tokens definidos en `src/global.css`.
 * Solo se usa donde RN necesita un valor de color literal (iconos, tab bar, mapas).
 * Para estilos de componentes usa clases NativeWind (`bg-primary`, `text-on-surface`...).
 */
export const colors = {
  background: '#f9f9ff',
  surface: '#f9f9ff',
  surfaceContainerLowest: '#ffffff',
  surfaceContainerLow: '#f0f3ff',
  surfaceContainer: '#e7eeff',
  surfaceContainerHigh: '#dee8ff',
  onSurface: '#111c2c',
  onSurfaceVariant: '#3f4948',
  outline: '#6f7979',
  outlineVariant: '#bfc8c8',
  primary: '#004243',
  onPrimary: '#ffffff',
  primaryContainer: '#0f5b5c',
  onPrimaryContainer: '#8fd0d1',
  secondary: '#a0401c',
  onSecondary: '#ffffff',
  secondaryContainer: '#fe875d',
  tertiary: '#003b71',
  error: '#ba1a1a',
  onError: '#ffffff',
  errorContainer: '#ffdad6',
  onErrorContainer: '#93000a',
  success: '#1b6b3a',
  warning: '#8a5300',
} as const;

export type ColorToken = keyof typeof colors;

/** Tamaño mínimo recomendado para áreas táctiles (dp). */
export const MIN_TOUCH_TARGET = 48;

/** Techo del escalado de fuente del sistema para no romper layouts críticos. */
export const MAX_FONT_SCALE = 1.8;

/**
 * Espejo en TypeScript de los tokens definidos en `src/global.css`.
 * Solo se usa donde RN necesita un valor de color literal (iconos, tab bar, mapas).
 * Para estilos de componentes usa clases NativeWind (`bg-primary`, `text-on-surface`...).
 */
export const colors = {
  background: '#F8F5FF',
  surface: '#F8F5FF',
  surfaceContainerLowest: '#ffffff',
  surfaceContainerLow: '#F3EEFF',
  surfaceContainer: '#ECE5FB',
  surfaceContainerHigh: '#E5DCF8',
  onSurface: '#1D1530',
  onSurfaceVariant: '#4A4458',
  outline: '#7A7289',
  outlineVariant: '#CBC3DA',
  primary: '#6A2BD9',
  onPrimary: '#ffffff',
  primaryContainer: '#5520B8',
  onPrimaryContainer: '#EADDFF',
  secondary: '#a0401c',
  onSecondary: '#ffffff',
  secondaryContainer: '#fe875d',
  tertiary: '#7A5A00',
  /** Amarillo Yunta: solo como fondo o acento, con texto oscuro encima. */
  accent: '#F7C948',
  /** Lavanda de marca. */
  lavender: '#B78CFF',
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

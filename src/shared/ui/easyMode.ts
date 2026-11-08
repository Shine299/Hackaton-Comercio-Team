import type { ViewMode } from '@/shared/nav/viewModeStore';

/** Cuánto crece el texto en Modo fácil. */
export const EASY_TEXT_SCALE = 1.25;

/** Alto mínimo de botones y áreas táctiles en Modo fácil (dp). */
export const EASY_MIN_TOUCH = 64;

/** Tamaños base de cada variante de texto (espejo de `src/global.css`) y su interlineado relativo. */
export const TEXT_BASE: Record<string, { size: number; line: number }> = {
  display: { size: 26, line: 1.3077 },
  'headline-lg': { size: 24, line: 1.3333 },
  'headline-md': { size: 20, line: 1.4 },
  'headline-sm': { size: 18, line: 1.3333 },
  'body-lg': { size: 16, line: 1.5 },
  'body-lg-bold': { size: 16, line: 1.5 },
  'body-md': { size: 14, line: 1.4286 },
  'body-md-medium': { size: 14, line: 1.4286 },
  'label-md': { size: 13, line: 1.3846 },
  'label-sm': { size: 12, line: 1.3333 },
  overline: { size: 12, line: 1.3333 },
};

/** Tamaño ajustado al modo de vista (entero, para evitar medias líneas borrosas). */
export function scaledSize(base: number, mode: ViewMode): number {
  return mode === 'easy' ? Math.round(base * EASY_TEXT_SCALE) : base;
}

/** Estilo de texto para el Modo fácil; `undefined` en modo estándar (no se toca nada). */
export function easyTextStyle(variant: string, mode: ViewMode): { fontSize: number; lineHeight: number } | undefined {
  if (mode !== 'easy') return undefined;
  const base = TEXT_BASE[variant];
  if (!base) return undefined;
  const fontSize = scaledSize(base.size, mode);
  return { fontSize, lineHeight: Math.round(fontSize * base.line) };
}

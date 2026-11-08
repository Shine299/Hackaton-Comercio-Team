/**
 * Avatar por defecto (SPEC-044): iniciales sobre un color estable. Nunca hace falta una foto real.
 * La paleta tiene contraste ≥ 4,5:1 con texto blanco (lo verifica `avatar.test.ts`).
 */
export const AVATAR_PALETTE = ['#6A2BD9', '#4a3bc4', '#a3361a', '#1f6b3d', '#7d3a8a', '#2b5797', '#8a4b00', '#b0284f'] as const;

/** Hasta 2 letras: la primera de cada una de las 2 primeras palabras. Sin nombre → «?». */
export function initialsOf(name: string): string {
  const words = name
    .trim()
    .split(/\s+/)
    .map((w) => w.replace(/[^\p{L}\p{N}]/gu, ''))
    .filter(Boolean);
  if (words.length === 0) return '?';
  return words
    .slice(0, 2)
    .map((w) => w[0].toLocaleUpperCase('es'))
    .join('');
}

/** El mismo id siempre da el mismo color (hash simple y estable). */
export function avatarColor(id: string): (typeof AVATAR_PALETTE)[number] {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) | 0;
  return AVATAR_PALETTE[Math.abs(hash) % AVATAR_PALETTE.length];
}

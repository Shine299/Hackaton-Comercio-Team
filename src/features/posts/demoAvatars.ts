/**
 * FOTOS FICTICIAS DE DEMOSTRACIÓN para los autores de demo (no son vecinos reales). Cada valor es el módulo de
 * `require` de una imagen local, empaquetada en la app para que se vea sin señal. Sin foto aquí, se ven iniciales.
 */
const JORGE_R = require('../../../assets/images/avatars/jorge-r.jpg');

/**
 * Cada autor de demo tiene dos ids: el de `demoPosts.ts` (sin Supabase) y el de `supabase/seed.sql` (con Supabase).
 * Mapea ambos para que la foto salga venga de donde venga el feed.
 */
const DEMO_AUTHOR_PHOTOS: Record<string, number> = {
  'demo-a3': JORGE_R,
  '00000000-0000-4000-8000-0000000000a3': JORGE_R,
};

/** Foto de demo del autor, si tiene. */
export function demoAuthorPhoto(authorId: string): number | undefined {
  return DEMO_AUTHOR_PHOTOS[authorId];
}

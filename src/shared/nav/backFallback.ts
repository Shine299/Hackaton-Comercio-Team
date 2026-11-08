import type { Href } from 'expo-router';

/**
 * Dónde cae «Atrás» cuando no hay pantalla anterior (SPEC-055, ADR 0009): el inicio de la sección de la pantalla, no el
 * Inicio general. Con historial, «Atrás» sigue volviendo a la pantalla anterior; esto solo decide el caso sin historial.
 *
 * Pura y sin importar de `features/` (regla de dependencias): el mapa se escribe aquí por rutas. Si una pantalla nueva
 * pertenece a una pestaña, se agrega una fila.
 */
const SECTION_ROOTS: { prefixes: string[]; root: Href }[] = [
  { prefixes: ['/publicacion', '/publicaciones', '/publicar'], root: '/ayuda' }, // Ayuda
  { prefixes: ['/negocios'], root: '/explorar' }, // Negocios
  { prefixes: ['/evento', '/eventos'], root: '/eventos' }, // Comunidad
  { prefixes: ['/chat'], root: '/mensajes' }, // Chat
  { prefixes: ['/emergencias'], root: '/emergencias' }, // Emergencia
];

/** `/evento` y `/evento/x` coinciden; `/eventos-otra` no. */
function matches(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

/** Pantallas raíz de cada sección: no tienen botón de volver, así que no se mapean a sí mismas. */
const ROOTS = new Set(['/', '/eventos', '/explorar', '/ayuda', '/mensajes', '/emergencias']);

export function backFallbackFor(pathname: string): Href {
  if (ROOTS.has(pathname)) return '/';
  const section = SECTION_ROOTS.find((s) => s.prefixes.some((p) => matches(pathname, p)));
  return section?.root ?? '/';
}

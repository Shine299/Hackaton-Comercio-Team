import type { Href } from 'expo-router';

import type { IconName } from '@/shared/ui';

/**
 * Barra de 4 pestañas (SPEC-051): Inicio · Comunidad · Negocios · Ayuda.
 * El chat no es una pestaña: es una burbuja flotante (`ChatFab`) que se ve sobre estas pantallas.
 * Emergencia tampoco: se abre con el SOS de la cabecera y, estando ahí, la barra sigue visible sin resaltar nada.
 * El Inicio (/) **no muestra la barra**: ahí van los 4 botones grandes; la pestaña «Inicio» sirve para volver desde las demás.
 *
 * Cada pestaña abre una pantalla raíz:
 * Comunidad → /eventos · Negocios → /explorar · Ayuda → /ayuda (antes «Marketplace», que ahora redirige).
 */
export type SectionId = 'inicio' | 'comunidad' | 'negocios' | 'ayuda';

export type BarItem = {
  key: SectionId;
  label: string;
  icon: IconName;
  iconActive: IconName;
  href: Href;
  a11y: string;
};

export const BAR_ITEMS: BarItem[] = [
  { key: 'inicio', label: 'Inicio', icon: 'home-outline', iconActive: 'home', href: '/', a11y: 'Inicio: lo que pasa en tu barrio' },
  { key: 'comunidad', label: 'Comunidad', icon: 'account-group-outline', iconActive: 'account-group', href: '/eventos', a11y: 'Comunidad: eventos y novedades del barrio' },
  { key: 'negocios', label: 'Negocios', icon: 'storefront-outline', iconActive: 'storefront', href: '/explorar', a11y: 'Negocios: tiendas, comida y servicios del barrio' },
  { key: 'ayuda', label: 'Ayuda', icon: 'hand-heart-outline', iconActive: 'hand-heart', href: '/ayuda', a11y: 'Ayuda: pedir u ofrecer una mano entre vecinos' },
];

/** Pantallas raíz (con cabecera de sección): ahí viven la barra y el gesto del borde. */
export const ROOT_PATHS = new Set(['/', '/eventos', '/explorar', '/ayuda', '/emergencias']);

const ACTIVE_BY_PATH: Record<string, SectionId> = {
  '/eventos': 'comunidad',
  '/explorar': 'negocios',
  '/ayuda': 'ayuda',
};

/** Pantallas que muestran la barra sin resaltar ninguna pestaña: siempre hay salida. */
const BAR_WITHOUT_ACTIVE = new Set(['/mensajes', '/emergencias', '/emergencias/tablero', '/emergencias/recursos', '/emergencias/mis-reportes']);

export type BarState = { active: SectionId | null };

/**
 * Cómo se ve la barra en cada pantalla. `null` = sin barra (formularios, detalles, perfil, rutas viejas que
 * redirigen); `{ active: null }` = barra sin pestaña resaltada (Emergencia y la bandeja de mensajes).
 */
export function resolveBar(pathname: string): BarState | null {
  const active = ACTIVE_BY_PATH[pathname];
  if (active) return { active };
  if (BAR_WITHOUT_ACTIVE.has(pathname)) return { active: null };
  return null;
}

/** La burbuja de chat se ve en el Inicio y en las raíces de las pestañas (en Emergencia nada debe distraer). */
export function chatFabVisible(pathname: string): boolean {
  const bar = resolveBar(pathname);
  return pathname === '/' || Boolean(bar && bar.active !== null);
}

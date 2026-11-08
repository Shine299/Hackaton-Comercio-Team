import type { Href } from 'expo-router';

import type { IconName } from '@/shared/ui';

/**
 * Barra de los 4 servicios (SPEC-051): Inicio · Comunidad · Negocios · Emergencia · Marketplace.
 * El chat no es una pestaña: es una burbuja flotante (`ChatFab`) que se ve sobre estas pantallas.
 *
 * Cada servicio abre la pantalla raíz que ya existía (las rutas no cambian):
 * Comunidad → /eventos · Negocios → /explorar · Emergencia → /emergencias · Marketplace → /marketplace.
 */
export type SectionId = 'inicio' | 'comunidad' | 'negocios' | 'emergencia' | 'marketplace';

export type BarItem = {
  key: SectionId;
  label: string;
  icon: IconName;
  iconActive: IconName;
  href: Href;
  a11y: string;
  /** Emergencia se pinta en rojo (un color = un significado). */
  danger?: boolean;
};

export const BAR_ITEMS: BarItem[] = [
  { key: 'inicio', label: 'Inicio', icon: 'home-outline', iconActive: 'home', href: '/', a11y: 'Inicio: lo que pasa en tu barrio' },
  { key: 'comunidad', label: 'Comunidad', icon: 'account-group-outline', iconActive: 'account-group', href: '/eventos', a11y: 'Comunidad: eventos y novedades del barrio' },
  { key: 'negocios', label: 'Negocios', icon: 'storefront-outline', iconActive: 'storefront', href: '/explorar', a11y: 'Negocios: tiendas, comida y servicios del barrio' },
  { key: 'emergencia', label: 'Emergencia', icon: 'alarm-light-outline', iconActive: 'alarm-light', href: '/emergencias', a11y: 'Emergencia: reportar o pedir auxilio, sin cuenta', danger: true },
  { key: 'marketplace', label: 'Marketplace', icon: 'hand-heart-outline', iconActive: 'hand-heart', href: '/marketplace', a11y: 'Marketplace: pedir u ofrecer ayuda entre vecinos' },
];

/** Pantallas raíz (con cabecera de sección): ahí viven la barra y el gesto del borde. */
export const ROOT_PATHS = new Set(['/', '/eventos', '/explorar', '/marketplace', '/emergencias']);

const ACTIVE_BY_PATH: Record<string, SectionId> = {
  '/': 'inicio',
  '/eventos': 'comunidad',
  '/explorar': 'negocios',
  '/marketplace': 'marketplace',
  '/emergencias': 'emergencia',
  '/emergencias/tablero': 'emergencia',
  '/emergencias/recursos': 'emergencia',
  '/emergencias/mis-reportes': 'emergencia',
};

export type BarState = { active: SectionId | null };

/**
 * Cómo se ve la barra en cada pantalla. `null` = sin barra (formularios, detalles, perfil, rutas viejas que
 * redirigen); `{ active: null }` = barra sin pestaña resaltada (la bandeja de mensajes, que se abre desde la burbuja).
 */
export function resolveBar(pathname: string): BarState | null {
  const active = ACTIVE_BY_PATH[pathname];
  if (active) return { active };
  if (pathname === '/mensajes') return { active: null };
  return null;
}

/** La burbuja de chat se ve en las raíces de la barra, menos en Emergencia (ahí nada debe distraer). */
export function chatFabVisible(pathname: string): boolean {
  const bar = resolveBar(pathname);
  return Boolean(bar && bar.active !== null && bar.active !== 'emergencia');
}

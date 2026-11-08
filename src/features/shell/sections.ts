import type { Href } from 'expo-router';

import type { IconName } from '@/shared/ui';

/**
 * Barra «comunidad primero» (SPEC-043): una sola barra fija de 5
 * Inicio · Eventos · Explorar · Marketplace · Chat.
 * Emergencia no es una pestaña: se abre con el SOS de la cabecera y nunca queda a más de un toque.
 */
export type SectionId = 'inicio' | 'eventos' | 'explorar' | 'marketplace' | 'chat';

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
  { key: 'eventos', label: 'Eventos', icon: 'calendar-star', iconActive: 'calendar-star', href: '/eventos', a11y: 'Eventos del barrio' },
  { key: 'explorar', label: 'Explorar', icon: 'compass-outline', iconActive: 'compass', href: '/explorar', a11y: 'Explorar: negocios y lugares del barrio' },
  { key: 'marketplace', label: 'Marketplace', icon: 'storefront-outline', iconActive: 'storefront', href: '/marketplace', a11y: 'Marketplace: ofrecer, pedir, vender o buscar un servicio' },
  { key: 'chat', label: 'Chat', icon: 'message-text-outline', iconActive: 'message-text', href: '/mensajes', a11y: 'Chat con tus vecinos' },
];

/** Pantallas raíz (con cabecera de sección): ahí viven la barra y el gesto del borde. */
export const ROOT_PATHS = new Set(['/', '/eventos', '/explorar', '/marketplace', '/mensajes', '/emergencias']);

/** Raíces de Emergencia: se ve la barra, sin pestaña resaltada, para que siempre haya salida. */
const EMERGENCY_ROOTS = new Set(['/emergencias', '/emergencias/tablero', '/emergencias/recursos', '/emergencias/mis-reportes']);

const ACTIVE_BY_PATH: Record<string, SectionId> = {
  '/': 'inicio',
  '/eventos': 'eventos',
  '/explorar': 'explorar',
  '/marketplace': 'marketplace',
  '/mensajes': 'chat',
};

export type BarState = { active: SectionId | null };

/**
 * Cómo se ve la barra en cada pantalla. `null` = sin barra (formularios, detalles, perfil, rutas viejas que
 * redirigen); `{ active: null }` = barra sin pestaña resaltada (Emergencia).
 */
export function resolveBar(pathname: string): BarState | null {
  const active = ACTIVE_BY_PATH[pathname];
  if (active) return { active };
  if (EMERGENCY_ROOTS.has(pathname)) return { active: null };
  return null;
}

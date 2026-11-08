import type { Href } from 'expo-router';

import type { IconName } from '@/shared/ui';

/**
 * Barra de 5 pestañas (SPEC-051): Inicio · Comunidad · Negocios · Ayuda · Chat.
 * La burbuja flotante NO es el chat: es el asistente virtual de Yunta (`AssistantFab`). El chat entre vecinos es la pestaña «Chat».
 * Emergencia no es pestaña: se abre con el SOS de la cabecera y, estando ahí, la barra sigue visible sin resaltar nada.
 * El Inicio (/) **no muestra la barra**: ahí van los 4 botones grandes; la pestaña «Inicio» sirve para volver desde las demás.
 *
 * Cada pestaña abre una pantalla raíz:
 * Comunidad → /eventos · Negocios → /explorar · Ayuda → /ayuda (antes «Marketplace», que ahora redirige) · Chat → /mensajes.
 */
export type SectionId = 'inicio' | 'comunidad' | 'negocios' | 'ayuda' | 'chat';

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
  { key: 'chat', label: 'Chat', icon: 'message-text-outline', iconActive: 'message-text', href: '/mensajes', a11y: 'Chat: tus conversaciones con vecinos' },
];

/** Pantallas raíz (con cabecera de sección): ahí viven la barra y el gesto del borde. */
export const ROOT_PATHS = new Set(['/', '/eventos', '/explorar', '/ayuda', '/mensajes', '/emergencias']);

const ACTIVE_BY_PATH: Record<string, SectionId> = {
  '/eventos': 'comunidad',
  '/explorar': 'negocios',
  '/ayuda': 'ayuda',
  '/mensajes': 'chat',
};

/** Pantallas que muestran la barra sin resaltar ninguna pestaña: siempre hay salida. */
const BAR_WITHOUT_ACTIVE = new Set(['/emergencias', '/emergencias/tablero', '/emergencias/recursos', '/emergencias/mis-reportes', '/emergencias/guardia']);

export type BarState = { active: SectionId | null };

/**
 * Cómo se ve la barra en cada pantalla. `null` = sin barra (Inicio, formularios, detalles, perfil, rutas viejas que
 * redirigen); `{ active: null }` = barra sin pestaña resaltada (el centro de Emergencia y sus pantallas hermanas).
 */
export function resolveBar(pathname: string): BarState | null {
  const active = ACTIVE_BY_PATH[pathname];
  if (active) return { active };
  if (BAR_WITHOUT_ACTIVE.has(pathname)) return { active: null };
  return null;
}

/** La burbuja del asistente se ve en el Inicio y en las raíces de las pestañas (en Emergencia nada debe distraer). */
export function assistantFabVisible(pathname: string): boolean {
  const bar = resolveBar(pathname);
  return pathname === '/' || Boolean(bar && bar.active !== null);
}

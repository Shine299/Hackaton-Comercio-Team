import type { Href } from 'expo-router';

import type { IconName } from '@/shared/ui';

/**
 * Las 4 secciones de la app. Cada una tiene su propia barra inferior; la primera pestaña de cada
 * sección siempre vuelve a Inicio. El Inicio en sí no tiene barra: se entra a cada sección desde sus tarjetas.
 */
export type SectionId = 'dia' | 'emprendimientos' | 'confianza' | 'emergencia';

export type BarItem = {
  key: string;
  label: string;
  icon: IconName;
  iconActive?: IconName;
  href: Href;
  a11y: string;
  /** Botón destacado en forma de píldora (Publicar o Emergencia). */
  pill?: 'primary' | 'danger';
};

const HOME: BarItem = { key: 'inicio', label: 'Inicio', icon: 'home-outline', iconActive: 'home', href: '/', a11y: 'Inicio' };

export const SECTION_ITEMS: Record<SectionId, BarItem[]> = {
  dia: [
    HOME,
    { key: 'vecinos', label: 'Vecinos', icon: 'account-group-outline', iconActive: 'account-group', href: '/explorar', a11y: 'Vecinos: ayuda cercana' },
    { key: 'publicar', label: 'Publicar', icon: 'plus', href: '/publicar', a11y: 'Publicar: ofrecer o solicitar ayuda', pill: 'primary' },
    { key: 'mapa', label: 'Mapa', icon: 'map-outline', iconActive: 'map', href: '/mapa', a11y: 'Mapa del barrio' },
    { key: 'solicitudes', label: 'Solicitudes', icon: 'inbox-outline', iconActive: 'inbox', href: '/actividad', a11y: 'Solicitudes y avisos' },
  ],
  emprendimientos: [
    HOME,
    { key: 'negocios', label: 'Negocios', icon: 'storefront-outline', iconActive: 'storefront', href: '/negocios', a11y: 'Negocios del barrio' },
    { key: 'mapa', label: 'Mapa', icon: 'map-outline', iconActive: 'map', href: { pathname: '/mapa', params: { layer: 'business' } }, a11y: 'Negocios en el mapa' },
    { key: 'mi-negocio', label: 'Mi negocio', icon: 'store-plus-outline', iconActive: 'store-plus', href: '/negocios/registrar', a11y: 'Registrar mi emprendimiento' },
    { key: 'solicitudes', label: 'Solicitudes', icon: 'inbox-outline', iconActive: 'inbox', href: '/actividad', a11y: 'Solicitudes y avisos' },
  ],
  confianza: [
    HOME,
    { key: 'perfil', label: 'Perfil', icon: 'account-outline', iconActive: 'account', href: '/perfil', a11y: 'Mi perfil' },
    { key: 'guardados', label: 'Guardados', icon: 'bookmark-outline', iconActive: 'bookmark', href: { pathname: '/perfil', params: { tab: 'saved' } }, a11y: 'Guardados' },
    { key: 'privacidad', label: 'Privacidad', icon: 'lock-outline', iconActive: 'lock', href: { pathname: '/perfil', params: { tab: 'privacy' } }, a11y: 'Privacidad y disponibilidad' },
    { key: 'ajustes', label: 'Ajustes', icon: 'cog-outline', iconActive: 'cog', href: { pathname: '/perfil', params: { tab: 'settings' } }, a11y: 'Ajustes de la cuenta' },
  ],
  emergencia: [
    HOME,
    { key: 'ayuda', label: 'Ayuda', icon: 'lifebuoy', href: '/emergencias', a11y: 'Ayuda: centro de emergencias' },
    { key: 'tablero', label: 'Tablero', icon: 'view-dashboard-outline', iconActive: 'view-dashboard', href: '/emergencias/tablero', a11y: 'Tablero del sector' },
    { key: 'recursos', label: 'Recursos', icon: 'package-variant', href: '/emergencias/recursos', a11y: 'Necesidades y recursos' },
    { key: 'reportes', label: 'Mis reportes', icon: 'clipboard-text-outline', iconActive: 'clipboard-text', href: '/emergencias/mis-reportes', a11y: 'Mis reportes en este teléfono' },
  ],
};

export type ResolvedSection = { section: SectionId; active: string };

type Params = { layer?: string; tab?: string };

/**
 * Qué barra mostrar según la pantalla. Solo las pantallas «raíz» de cada sección tienen barra:
 * los formularios y los detalles quedan limpios, sin distracciones (sobre todo en emergencias).
 * `Mapa` y `Solicitudes` existen en dos secciones: se resuelven por contexto.
 */
export function resolveSection(pathname: string, params: Params, last: 'dia' | 'emprendimientos'): ResolvedSection | null {
  switch (pathname) {
    case '/explorar':
      return { section: 'dia', active: 'vecinos' };
    case '/publicar':
      return { section: 'dia', active: 'publicar' };
    case '/mapa':
      return params.layer === 'business'
        ? { section: 'emprendimientos', active: 'mapa' }
        : { section: 'dia', active: 'mapa' };
    case '/actividad':
      return { section: last, active: 'solicitudes' };
    case '/negocios':
      return { section: 'emprendimientos', active: 'negocios' };
    case '/negocios/registrar':
      return { section: 'emprendimientos', active: 'mi-negocio' };
    case '/perfil':
      return {
        section: 'confianza',
        active: params.tab === 'saved' ? 'guardados' : params.tab === 'privacy' ? 'privacidad' : params.tab === 'settings' ? 'ajustes' : 'perfil',
      };
    case '/emergencias':
      return { section: 'emergencia', active: 'ayuda' };
    case '/emergencias/tablero':
      return { section: 'emergencia', active: 'tablero' };
    case '/emergencias/recursos':
      return { section: 'emergencia', active: 'recursos' };
    case '/emergencias/mis-reportes':
      return { section: 'emergencia', active: 'reportes' };
    default:
      return null;
  }
}

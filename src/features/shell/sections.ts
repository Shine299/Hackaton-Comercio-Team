import type { Href } from 'expo-router';

import type { IconName } from '@/shared/ui';

/**
 * Las 4 secciones de la app más el Inicio (referencia: lienzo de rediseño).
 * Hay una sola barra fija de 5: Inicio · Comunidad · Emprendimientos · Emergencia · Ayuda.
 * Aparece solo en la pantalla raíz de cada sección; formularios y detalles se abren sin barra.
 */
export type SectionId = 'inicio' | 'comunidad' | 'emprendimientos' | 'emergencia' | 'ayuda';

export type BarItem = {
  key: SectionId;
  label: string;
  icon: IconName;
  iconActive: IconName;
  href: Href;
  a11y: string;
};

export const BAR_ITEMS: BarItem[] = [
  { key: 'inicio', label: 'Inicio', icon: 'home-outline', iconActive: 'home', href: '/', a11y: 'Inicio' },
  { key: 'comunidad', label: 'Comunidad', icon: 'account-group-outline', iconActive: 'account-group', href: '/comunidad', a11y: 'Comunidad: novedades del barrio' },
  { key: 'emprendimientos', label: 'Emprendimientos', icon: 'storefront-outline', iconActive: 'storefront', href: '/negocios', a11y: 'Emprendimientos del barrio' },
  { key: 'emergencia', label: 'Emergencia', icon: 'alarm-light-outline', iconActive: 'alarm-light', href: '/emergencias', a11y: 'Emergencia: reportar o pedir auxilio' },
  { key: 'ayuda', label: 'Ayuda', icon: 'hand-heart-outline', iconActive: 'hand-heart', href: '/ayuda', a11y: 'Ayuda entre vecinos' },
];

/**
 * Qué pestaña resaltar según la pantalla. Solo las raíces de cada sección tienen barra;
 * `null` = sin barra (formularios, detalles, mapa, perfil, notificaciones).
 * «Vecinos» (explorar) y «Publicar» forman parte de Ayuda: Quiero ayudar / Necesito ayuda.
 */
export function resolveSection(pathname: string): SectionId | null {
  switch (pathname) {
    case '/':
      return 'inicio';
    case '/comunidad':
      return 'comunidad';
    case '/negocios':
      return 'emprendimientos';
    case '/emergencias':
    case '/emergencias/tablero':
    case '/emergencias/recursos':
    case '/emergencias/mis-reportes':
      return 'emergencia';
    case '/ayuda':
    case '/explorar':
    case '/publicar':
      return 'ayuda';
    default:
      return null;
  }
}

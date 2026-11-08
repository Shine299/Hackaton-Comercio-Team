import type { Href } from 'expo-router';

import type { TourRect } from '@/shared/nav/tourStore';
import type { YuntaPose } from '@/shared/ui';

export type TourStep = {
  /** Gesto de Yunta que acompaña el paso (SPEC-057). */
  pose: YuntaPose;
  /** Botón real que hay que tocar (id de su `TourTarget`), o `null` en el paso de cierre. */
  target: string | null;
  /** Pantalla donde está ese botón; `null` = cualquiera. */
  path: string | null;
  title: string;
  body: string;
};

/**
 * Recorrido guiado sobre la app real: cada paso ilumina un botón de verdad y solo avanza cuando la persona
 * lo toca. Nada de lo que se toca envía datos: son navegaciones entre secciones.
 */
export const TOUR_STEPS: TourStep[] = [
  {
    pose: 'point',
    target: 'tile-comunidad',
    path: '/',
    title: 'Esta es tu casa en Yunta',
    body: 'Estos botones grandes te llevan a cada parte. Toca «Comunidad» para ver qué se organiza cerca de ti.',
  },
  {
    pose: 'curious',
    target: 'tab-negocios',
    path: '/eventos',
    title: '¡Mira lo que se viene!',
    body: 'Charlas, ferias y reuniones de tu barrio. Ahora toca «Negocios».',
  },
  {
    pose: 'thumbs-up',
    target: 'tab-ayuda',
    path: '/explorar',
    title: 'Compra a tus vecinos',
    body: 'Negocios del barrio, a pasos de tu casa. Toca «Ayuda» para pedir u ofrecer una mano.',
  },
  {
    pose: 'shield',
    target: 'header-sos',
    path: '/ayuda',
    title: 'Si hay una emergencia',
    body: 'El botón SOS siempre está arriba y funciona sin cuenta. Tócalo para ver la pantalla de Emergencia.',
  },
  {
    pose: 'point',
    target: 'tab-inicio',
    path: '/emergencias',
    title: 'Siempre puedes volver',
    body: 'Aquí avisas o pides auxilio. La barra de abajo sigue ahí: toca «Inicio» para regresar.',
  },
  {
    pose: 'assistant',
    target: 'assistant-fab',
    path: '/',
    title: 'Aquí me tienes a mí',
    body: 'Esta burbuja soy yo, Yunta. Te cuento lo que pasa en tu barrio y resuelvo tus dudas, escribiendo o hablando. Tócala. Tus charlas con vecinos están en «Chat».',
  },
  {
    pose: 'celebrate',
    target: null,
    path: null,
    title: '¡Listo, ya sabes moverte!',
    body: 'Tu perfil, tus guardados y este recorrido están en el menú ☰. Recuerda: Yunta no reemplaza a los servicios oficiales de emergencia.',
  },
];

/** Para el botón «Llévame» cuando la persona se fue a otra pantalla. */
export const stepHref = (step: TourStep): Href | null => (step.path ? (step.path as Href) : null);

export function isOnStepScreen(pathname: string, step: Pick<TourStep, 'path'>): boolean {
  return step.path === null || pathname === step.path;
}

/** Hueco iluminado: el botón con un margen, recortado al tamaño de la pantalla. */
export function spotlightRect(rect: TourRect, screen: { width: number; height: number }, pad = 8): TourRect {
  const x = Math.max(0, rect.x - pad);
  const y = Math.max(0, rect.y - pad);
  const right = Math.min(screen.width, rect.x + rect.width + pad);
  const bottom = Math.min(screen.height, rect.y + rect.height + pad);
  return { x, y, width: right - x, height: bottom - y };
}

/** El globo va donde hay más espacio: arriba si el botón está en la mitad inferior. */
export function tooltipPlacement(rect: TourRect, screenHeight: number): 'above' | 'below' {
  return rect.y + rect.height / 2 > screenHeight / 2 ? 'above' : 'below';
}

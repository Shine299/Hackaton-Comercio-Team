import type { Href } from 'expo-router';

import type { TourRect } from '@/shared/nav/tourStore';

export type TourStep = {
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
    target: 'tab-eventos',
    path: '/',
    title: 'Tu barrio, en vivo',
    body: 'Este es el Inicio. Abajo están las 5 pestañas. Toca «Eventos» para ver qué se organiza cerca.',
  },
  {
    target: 'tab-explorar',
    path: '/eventos',
    title: 'Lo que se viene',
    body: 'Charlas, ferias y reuniones del barrio. Ahora toca «Explorar».',
  },
  {
    target: 'tab-marketplace',
    path: '/explorar',
    title: 'Compra local',
    body: 'Negocios del barrio, a pasos de tu casa. Toca «Marketplace» para ofrecer, pedir o prestar.',
  },
  {
    target: 'header-sos',
    path: '/marketplace',
    title: 'Si hay una emergencia',
    body: 'El botón SOS está arriba en todas las pestañas y funciona sin cuenta. Tócalo para ver Emergencia.',
  },
  {
    target: 'tab-chat',
    path: '/emergencias',
    title: 'Habla con tus vecinos',
    body: 'Aquí reportas o pides auxilio. Abajo sigue la barra para salir. Toca «Chat» para ver tus mensajes.',
  },
  {
    target: null,
    path: null,
    title: '¡Listo, ya sabes moverte!',
    body: 'Tu perfil, guardados y este recorrido están en el menú ☰. Yunta no reemplaza a los servicios oficiales de emergencia.',
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

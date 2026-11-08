import { BAR_ITEMS, ROOT_PATHS } from '@/features/shell/sections';
import { isYuntaPose } from '@/shared/ui/yuntaPoses';

import { isOnStepScreen, spotlightRect, TOUR_STEPS, tooltipPlacement } from './steps';

describe('TOUR_STEPS', () => {
  it('cada paso tiene una pose válida de Yunta y un texto (SPEC-057)', () => {
    for (const step of TOUR_STEPS) {
      expect(isYuntaPose(step.pose)).toBe(true);
      expect(step.body.length).toBeGreaterThan(0);
    }
  });

  it('cada paso con botón dice en qué pantalla está y qué tocar', () => {
    for (const step of TOUR_STEPS) {
      if (step.target) expect(step.path).toMatch(/^\//);
      expect(step.title.length).toBeGreaterThan(0);
    }
  });

  it('termina con un paso sin botón (cierre)', () => {
    expect(TOUR_STEPS[TOUR_STEPS.length - 1].target).toBeNull();
  });

  it('cada botón existe en la navegación nueva y cada pantalla es una raíz (SPEC-051)', () => {
    const tabs = new Set(BAR_ITEMS.map((i) => `tab-${i.key}`));
    for (const step of TOUR_STEPS) {
      if (step.target) expect(tabs.has(step.target) || step.target.startsWith('tile-') || step.target === 'header-sos' || step.target === 'assistant-fab').toBe(true);
      if (step.path) expect(ROOT_PATHS.has(step.path)).toBe(true);
    }
  });

  it('en el Inicio (sin barra) el paso apunta a un botón grande, no a una pestaña', () => {
    for (const step of TOUR_STEPS) if (step.path === '/' && step.target) expect(step.target).not.toMatch(/^tab-/);
  });

  it('nunca pide tocar dos veces el mismo botón seguido', () => {
    for (let i = 1; i < TOUR_STEPS.length; i++) {
      if (TOUR_STEPS[i].target) expect(TOUR_STEPS[i].target).not.toBe(TOUR_STEPS[i - 1].target);
    }
  });
});

describe('isOnStepScreen', () => {
  it('compara la ruta exacta', () => {
    expect(isOnStepScreen('/comunidad', { path: '/comunidad' })).toBe(true);
    expect(isOnStepScreen('/comunidad/algo', { path: '/comunidad' })).toBe(false);
  });

  it('un paso sin ruta vale en cualquier pantalla', () => {
    expect(isOnStepScreen('/asistente', { path: null })).toBe(true);
  });
});

describe('spotlightRect', () => {
  it('agranda el hueco alrededor del botón sin salirse de la pantalla', () => {
    expect(spotlightRect({ x: 2, y: 100, width: 50, height: 40 }, { width: 390, height: 844 }, 8)).toEqual({
      x: 0,
      y: 92,
      width: 60,
      height: 56,
    });
  });
});

describe('tooltipPlacement', () => {
  it('pone el globo arriba si el botón está en la mitad de abajo', () => {
    expect(tooltipPlacement({ x: 0, y: 760, width: 80, height: 60 }, 844)).toBe('above');
  });

  it('y abajo si el botón está arriba', () => {
    expect(tooltipPlacement({ x: 300, y: 50, width: 80, height: 44 }, 844)).toBe('below');
  });
});

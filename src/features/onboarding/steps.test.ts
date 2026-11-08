import { isYuntaPose } from '@/shared/ui/yuntaPoses';

import { ONBOARDING_STEPS, SECTOR_STEP, TOTAL_ONBOARDING_STEPS } from './steps';

describe('ONBOARDING_STEPS', () => {
  it('cada paso tiene una pose válida de Yunta, título y cuerpo', () => {
    for (const step of [...ONBOARDING_STEPS, SECTOR_STEP]) {
      expect(isYuntaPose(step.pose)).toBe(true);
      expect(step.title.length).toBeGreaterThan(0);
      expect(step.body.length).toBeGreaterThan(0);
    }
  });

  it('los ids son únicos y el total cuenta el paso de sector', () => {
    const ids = ONBOARDING_STEPS.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(TOTAL_ONBOARDING_STEPS).toBe(ONBOARDING_STEPS.length + 1);
  });

  it('el paso de emergencia conserva el aviso de que no reemplaza a los servicios oficiales', () => {
    const emergency = ONBOARDING_STEPS.find((s) => s.id === 'emergency');
    expect(emergency?.notice).toMatch(/no reemplaza a los servicios oficiales/);
  });

  it('el paso de modo avión distingue «ya llegó» de «guardado en tu teléfono»', () => {
    const offline = ONBOARDING_STEPS.find((s) => s.id === 'offline');
    expect(offline?.body).toMatch(/ya llegó/);
    expect(offline?.body).toMatch(/guardado en tu teléfono/);
  });
});

import { formatCountdown, walkState } from './timer';
import type { WalkSession } from './types';

const MIN = 60_000;
const T0 = new Date('2026-11-08T21:30:00Z').getTime();

const session: WalkSession = {
  id: 'w1',
  guardians: ['Rosa M.', 'Julio P.'],
  minutes: 15,
  startedAt: T0,
  arrivedAt: null,
};

describe('walkState', () => {
  it('en camino: cuenta lo que falta', () => {
    expect(walkState(session, T0 + 2 * MIN)).toEqual({ phase: 'walking', remainingMs: 13 * MIN, dueAt: T0 + 15 * MIN });
  });

  it('pasado el tiempo sin marcar, queda vencido', () => {
    expect(walkState(session, T0 + 16 * MIN).phase).toBe('overdue');
    expect(walkState(session, T0 + 16 * MIN).remainingMs).toBe(0);
  });

  it('con «Llegué bien» termina, aunque haya vencido', () => {
    expect(walkState({ ...session, arrivedAt: T0 + 20 * MIN }, T0 + 30 * MIN).phase).toBe('arrived');
  });
});

describe('formatCountdown', () => {
  it('muestra minutos y segundos', () => {
    expect(formatCountdown(12 * MIN + 40_000)).toBe('12:40');
    expect(formatCountdown(5_000)).toBe('0:05');
    expect(formatCountdown(0)).toBe('0:00');
  });

  it('redondea hacia arriba para no mostrar 0:00 antes de tiempo', () => {
    expect(formatCountdown(400)).toBe('0:01');
  });
});

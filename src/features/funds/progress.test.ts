import { fundProgress } from './progress';
import type { Fund, LocalContribution } from './types';

const DAY = 86_400_000;
const NOW = new Date('2026-11-08T12:00:00Z').getTime();

const fund: Fund = {
  id: 'f1',
  sectorId: 'lince',
  kind: 'iniciativa',
  title: 'Cámaras',
  description: '',
  organizer: 'Junta vecinal',
  goalCents: 120000,
  raisedCents: 84000,
  contributors: 23,
  deadline: NOW + 9 * DAY,
  expenses: [],
  isDemo: true,
};

const local = (amountCents: number, fundId = 'f1'): LocalContribution => ({
  id: `c-${amountCents}-${fundId}`,
  fundId,
  amountCents,
  anonymous: true,
  mode: 'mock',
  chargeId: 'x',
  createdAt: NOW,
});

describe('fundProgress', () => {
  it('calcula lo reunido, el porcentaje, lo que falta y los días', () => {
    const p = fundProgress(fund, [], NOW);
    expect(p.raisedCents).toBe(84000);
    expect(p.pct).toBeCloseTo(70);
    expect(p.remainingCents).toBe(36000);
    expect(p.contributors).toBe(23);
    expect(p.daysLeft).toBe(9);
  });

  it('suma solo los aportes confirmados de este fondo', () => {
    const p = fundProgress(fund, [local(2000), local(5000, 'otro')], NOW);
    expect(p.raisedCents).toBe(86000);
    expect(p.contributors).toBe(24);
    expect(p.pct).toBeCloseTo(71.67, 1);
  });

  it('no pasa del 100 % ni deja montos negativos', () => {
    const p = fundProgress(fund, [local(100000)], NOW);
    expect(p.pct).toBe(100);
    expect(p.remainingCents).toBe(0);
  });

  it('un fondo sin meta (perrito) no tiene porcentaje ni plazo', () => {
    const p = fundProgress({ ...fund, kind: 'animal', goalCents: null, deadline: null }, [], NOW);
    expect(p.pct).toBeNull();
    expect(p.remainingCents).toBeNull();
    expect(p.daysLeft).toBeNull();
  });

  it('un plazo vencido queda en 0 días', () => {
    expect(fundProgress({ ...fund, deadline: NOW - DAY }, [], NOW).daysLeft).toBe(0);
  });
});

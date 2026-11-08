import type { Fund, LocalContribution } from './types';

const DAY = 86_400_000;

export type FundProgress = {
  raisedCents: number;
  contributors: number;
  /** 0–100, o `null` si el fondo no tiene meta. */
  pct: number | null;
  remainingCents: number | null;
  /** Días que quedan (0 si venció), o `null` si no tiene fecha límite. */
  daysLeft: number | null;
};

/** Avance de un fondo: lo del servidor más los aportes confirmados en este teléfono. */
export function fundProgress(fund: Fund, local: LocalContribution[], now: number): FundProgress {
  const mine = local.filter((c) => c.fundId === fund.id);
  const raisedCents = fund.raisedCents + mine.reduce((sum, c) => sum + c.amountCents, 0);
  const goal = fund.goalCents;
  return {
    raisedCents,
    contributors: fund.contributors + mine.length,
    pct: goal ? Math.min(100, (raisedCents / goal) * 100) : null,
    remainingCents: goal ? Math.max(0, goal - raisedCents) : null,
    daysLeft: fund.deadline == null ? null : Math.max(0, Math.ceil((fund.deadline - now) / DAY)),
  };
}

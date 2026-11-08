import type { WalkPhase, WalkSession } from './types';

/** En qué va el trayecto y cuánto falta para la hora de llegada. */
export function walkState(session: WalkSession, now: number): { phase: WalkPhase; remainingMs: number; dueAt: number } {
  const dueAt = session.startedAt + session.minutes * 60_000;
  if (session.arrivedAt != null) return { phase: 'arrived', remainingMs: 0, dueAt };
  const remainingMs = Math.max(0, dueAt - now);
  return { phase: remainingMs > 0 ? 'walking' : 'overdue', remainingMs, dueAt };
}

/** «12:40». Redondea hacia arriba: no muestra 0:00 mientras queda tiempo. */
export function formatCountdown(ms: number): string {
  const total = Math.ceil(Math.max(0, ms) / 1000);
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

import { isUnsent, type OutboxItem } from './types';

const WINDOW_MS = 15 * 60_000;

/**
 * Posibles duplicados entre reportes críticos aún sin enviar: mismo tipo y mismo sector en una
 * ventana corta. NUNCA se descarta ni se fusiona nada solo: solo se avisa para que una persona decida
 * (docs: no pisar un reporte crítico en silencio).
 */
export function findPossibleDuplicates(items: OutboxItem[]): Set<string> {
  const critical = items.filter((i) => i.priority === 'emergency' && isUnsent(i));
  const flagged = new Set<string>();
  for (let a = 0; a < critical.length; a++) {
    for (let b = a + 1; b < critical.length; b++) {
      const x = critical[a];
      const y = critical[b];
      if (x.type === y.type && x.payload.sectorId === y.payload.sectorId && Math.abs(x.createdAt - y.createdAt) <= WINDOW_MS) {
        flagged.add(x.id);
        flagged.add(y.id);
      }
    }
  }
  return flagged;
}

import { AT_RISK_OPTIONS, PEOPLE_COUNTS, type AtRisk, type PeopleCount } from './types';

type PeopleFields = { peopleCount?: PeopleCount; peopleAtRisk?: AtRisk };

/** Cuánto sube un aviso en el tablero si hay personas en riesgo (se suma al peso base). */
export function atRiskWeightBonus(atRisk?: AtRisk): number {
  return atRisk === 'yes' ? 2 : 0;
}

/** Texto corto para tarjetas y estado del reporte, p. ej. «2 a 5 personas · Hay personas en riesgo». */
export function peopleSummary({ peopleCount, peopleAtRisk }: PeopleFields): string | undefined {
  const parts: string[] = [];
  if (peopleCount) {
    const label = PEOPLE_COUNTS.find((c) => c.id === peopleCount)?.label;
    if (label) parts.push(peopleCount === 'one' ? label : `${label} personas`);
  }
  if (peopleAtRisk === 'yes') parts.push('Hay personas en riesgo');
  else if (peopleAtRisk === 'no') parts.push('Sin personas en riesgo');
  else if (peopleAtRisk === 'unknown') parts.push('Riesgo sin confirmar');
  return parts.length > 0 ? parts.join(' · ') : undefined;
}

/** Valores válidos para el servidor; cualquier otra cosa se descarta (nunca se envía texto libre). */
export function sanitizePeople(input: { peopleCount?: unknown; peopleAtRisk?: unknown }): PeopleFields {
  const count = PEOPLE_COUNTS.find((c) => c.id === input.peopleCount)?.id;
  const risk = AT_RISK_OPTIONS.find((r) => r.id === input.peopleAtRisk)?.id;
  return { ...(count ? { peopleCount: count } : {}), ...(risk ? { peopleAtRisk: risk } : {}) };
}

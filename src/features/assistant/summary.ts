/**
 * Resumen que Yunta dice primero al abrir la conversación (SPEC-053). Código puro: se arma en el teléfono con datos que
 * ya hay (alerta del sector, eventos, publicaciones, reportes tuyos). No inventa nada: solo habla de lo que existe.
 */

export type SummaryInput = {
  now: number;
  /** Hora local (0–23) para el saludo. Si falta se usa la de `now`. */
  hour?: number;
  name?: string;
  sectorName: string;
  alert?: { title: string; source: string };
  /** Eventos próximos, del más cercano al más lejano. */
  events: { title: string; startsAt: number; isDemo?: boolean }[];
  posts: { kind: 'offer' | 'request'; urgent?: boolean; isDemo?: boolean }[];
  pendingReports: number;
};

const DAY_NAMES = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

const startOfDay = (ms: number) => {
  const d = new Date(ms);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
};

/** «hoy», «mañana» o «el martes», contando días de calendario (no horas). */
export function describeWhen(startsAt: number, now: number): string {
  const days = Math.round((startOfDay(startsAt) - startOfDay(now)) / (24 * 60 * 60 * 1000));
  if (days <= 0) return 'hoy';
  if (days === 1) return 'mañana';
  return `el ${DAY_NAMES[new Date(startsAt).getDay()]}`;
}

const greeting = (hour: number) => (hour >= 5 && hour < 12 ? 'Buenos días' : hour >= 12 && hour < 19 ? 'Buenas tardes' : 'Buenas noches');

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

export function buildSummary(input: SummaryInput): string {
  const { now, sectorName, alert, events, posts, pendingReports } = input;
  const hour = input.hour ?? new Date(now).getHours();
  const name = input.name?.trim();
  const parts: string[] = [`${greeting(hour)}${name ? `, ${name}` : ''}.`];

  if (alert) parts.push(`Hay una alerta en ${sectorName}: ${alert.title}, avisada por ${alert.source}.`);

  if (events.length === 1) {
    parts.push(`Hay un evento: ${events[0].title}, ${describeWhen(events[0].startsAt, now)}.`);
  } else if (events.length > 1) {
    parts.push(`Hay ${events.length} eventos; el próximo es ${events[0].title}, ${describeWhen(events[0].startsAt, now)}.`);
  }

  const offers = posts.filter((p) => p.kind === 'offer').length;
  const requests = posts.filter((p) => p.kind === 'request').length;
  const urgent = posts.filter((p) => p.urgent).length;
  if (offers + requests > 0) {
    const pieces: string[] = [];
    if (offers > 0) pieces.push(plural(offers, 'oferta', 'ofertas'));
    if (requests > 0) pieces.push(`${plural(requests, 'pedido', 'pedidos')} de ayuda`);
    const urgentText = urgent > 0 ? ` (${plural(urgent, 'urgente', 'urgentes')})` : '';
    parts.push(`Tus vecinos tienen ${pieces.join(' y ')}${urgentText}.`);
  }

  if (pendingReports > 0) parts.push(`Tienes ${plural(pendingReports, 'reporte pendiente', 'reportes pendientes')}.`);

  const shown = [...events, ...posts];
  if (!alert && shown.length === 0 && pendingReports === 0) parts.push(`${sectorName} está tranquilo por ahora.`);
  if (shown.length > 0 && shown.every((item) => item.isDemo)) parts.push('Ojo: estos son datos de demostración.');

  parts.push('¿En qué te ayudo?');
  return parts.join(' ');
}

/**
 * Lo primero que dice Yunta al abrir la conversación por voz (SPEC-053): corto, para que la charla sea fluida. El resumen
 * completo del barrio lo cuenta cuando se lo pides («cuéntame qué pasa hoy»); la IA lo recibe como contexto.
 */
export function buildGreeting({ hour, name }: { hour: number; name?: string }): string {
  const who = name?.trim() ? `, ${name.trim()}` : '';
  return `${greeting(hour)}${who}. Soy Yunta. Puedo contarte lo que pasa hoy en tu barrio o ayudarte con lo que necesites. ¿Qué quieres?`;
}

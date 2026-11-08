/**
 * Lector mínimo de `opening_hours` de OpenStreetMap (SPEC-047, decisión D3).
 * Entiende los formatos comunes del barrio y, ante cualquier duda, responde `unknown`: un estado nunca se inventa.
 */
export type OpenState = 'open' | 'closed' | 'unknown';

/** Día de OSM en el orden de `Date.getDay()` (0 = domingo). */
const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'] as const;
const MINUTES_PER_DAY = 24 * 60;

/** Tramo en minutos desde la medianoche. `end > 1440` = pasa la medianoche. */
type Span = { start: number; end: number };
/** Para cada día (0–6): sus tramos, o `[]` si está cerrado. `undefined` = la regla no lo menciona. */
type Week = (Span[] | undefined)[];

const TIME = /^(\d{1,2}):(\d{2})$/;

function parseTime(raw: string): number | null {
  const m = TIME.exec(raw);
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h > 24 || min > 59 || (h === 24 && min > 0)) return null;
  return h * 60 + min;
}

function parseSpans(raw: string): Span[] | null {
  const spans: Span[] = [];
  for (const part of raw.split(',').map((s) => s.trim())) {
    const [a, b, extra] = part.split('-').map((t) => t.trim());
    if (extra !== undefined || a === undefined || b === undefined) return null;
    const start = parseTime(a);
    const end = parseTime(b);
    if (start === null || end === null || start === end) return null;
    spans.push({ start, end: end > start ? end : end + MINUTES_PER_DAY });
  }
  return spans;
}

function dayIndex(raw: string): number | null {
  const i = DAYS.indexOf(raw as (typeof DAYS)[number]);
  return i === -1 ? null : i;
}

/** «Mo-Fr», «Sa,Su», «Sa-Mo» (da la vuelta) → índices de día. */
function parseDays(raw: string): number[] | null {
  const days: number[] = [];
  for (const part of raw.split(',')) {
    const [a, b, extra] = part.split('-');
    if (extra !== undefined) return null;
    const from = dayIndex(a);
    if (from === null) return null;
    if (b === undefined) {
      days.push(from);
      continue;
    }
    const to = dayIndex(b);
    if (to === null) return null;
    for (let d = from; ; d = (d + 1) % 7) {
      days.push(d);
      if (d === to) break;
    }
  }
  return days;
}

/** Semana completa según las reglas, o `null` si algo no se entiende. Las reglas posteriores mandan. */
function parseWeek(spec: string): Week | null {
  const week: Week = Array.from({ length: 7 }, () => undefined);
  const rules = spec
    .split(';')
    .map((r) => r.trim())
    .filter(Boolean);
  if (rules.length === 0) return null;

  for (const rule of rules) {
    // «Mo-Fr 08:00-12:00, 14:00-18:00»: separar días de horas por el primer espacio que sigue a los días.
    const m = /^([A-Za-z,-]+)\s+(.+)$/.exec(rule);
    const [daysRaw, rest] = m && /^[A-Z][a-z]/.test(rule) ? [m[1], m[2]] : [null, rule];
    const days = daysRaw === null ? [0, 1, 2, 3, 4, 5, 6] : parseDays(daysRaw);
    if (!days) return null;

    let spans: Span[];
    if (rest === 'off' || rest === 'closed') spans = [];
    else {
      const parsed = parseSpans(rest);
      if (!parsed) return null;
      spans = parsed;
    }
    for (const d of days) week[d] = spans;
  }
  return week;
}

function normalize(spec: string | undefined): string | null {
  const s = spec?.trim();
  return s ? s : null;
}

/** ¿Está abierto en `date` (hora local)? `unknown` si no hay horario o no se entiende. */
export function openStateAt(spec: string | undefined, date: Date): OpenState {
  const s = normalize(spec);
  if (!s) return 'unknown';
  if (s === '24/7') return 'open';
  if (s === 'off' || s === 'closed') return 'closed';

  const week = parseWeek(s);
  if (!week) return 'unknown';

  const day = date.getDay();
  const minute = date.getHours() * 60 + date.getMinutes();
  const today = week[day] ?? [];
  const yesterday = week[(day + 6) % 7] ?? [];

  if (today.some((span) => minute >= span.start && minute < span.end)) return 'open';
  // Lo que empezó ayer y pasa la medianoche.
  if (yesterday.some((span) => span.end > MINUTES_PER_DAY && minute < span.end - MINUTES_PER_DAY)) return 'open';
  return 'closed';
}

const clock = (minutes: number) => {
  const m = minutes % MINUTES_PER_DAY;
  return `${Math.floor(m / 60)}:${String(m % 60).padStart(2, '0')}`;
};

/** «Hoy 8:00–22:00», «Hoy cerrado», «Abierto las 24 horas», o `undefined` si el horario no se entiende. */
export function todayHoursLabel(spec: string | undefined, date: Date): string | undefined {
  const s = normalize(spec);
  if (!s) return undefined;
  if (s === '24/7') return 'Abierto las 24 horas';
  if (s === 'off' || s === 'closed') return 'Hoy cerrado';
  const week = parseWeek(s);
  if (!week) return undefined;
  const spans = week[date.getDay()] ?? [];
  if (spans.length === 0) return 'Hoy cerrado';
  return `Hoy ${spans.map((span) => `${clock(span.start)}–${span.end === MINUTES_PER_DAY ? '24:00' : clock(span.end)}`).join(' y ')}`;
}

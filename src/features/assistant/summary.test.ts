import { buildGreeting, buildSummary, describeWhen, type SummaryInput } from './summary';

const DAY = 24 * 60 * 60 * 1000;
// Domingo 8 nov 2026, 10:00 (hora local del teléfono: lo que importa es el día calendario).
const NOW = new Date(2026, 10, 8, 10, 0, 0).getTime();

const base: SummaryInput = {
  now: NOW,
  sectorName: 'Miraflores',
  events: [],
  posts: [],
  pendingReports: 0,
};

describe('describeWhen', () => {
  it('dice hoy, mañana o el día de la semana', () => {
    expect(describeWhen(NOW + 3 * 60 * 60 * 1000, NOW)).toBe('hoy');
    expect(describeWhen(NOW + DAY, NOW)).toBe('mañana');
    expect(describeWhen(NOW + 3 * DAY, NOW)).toBe('el miércoles');
  });

  it('un evento más tarde esta misma noche sigue siendo hoy', () => {
    expect(describeWhen(new Date(2026, 10, 8, 23, 30).getTime(), NOW)).toBe('hoy');
  });
});

describe('buildSummary', () => {
  it('saluda según la hora y menciona tu nombre si lo hay', () => {
    expect(buildSummary({ ...base, hour: 9, name: 'Rosa' })).toMatch(/^Buenos días, Rosa\./);
    expect(buildSummary({ ...base, hour: 15 })).toMatch(/^Buenas tardes\./);
    expect(buildSummary({ ...base, hour: 22 })).toMatch(/^Buenas noches\./);
  });

  it('siempre termina invitando a hablar', () => {
    expect(buildSummary({ ...base, hour: 9 })).toMatch(/¿En qué te ayudo\?$/);
  });

  it('con el barrio sin novedades dice que está tranquilo', () => {
    expect(buildSummary({ ...base, hour: 9 })).toContain('Miraflores está tranquilo');
  });

  it('menciona la alerta activa primero y con su origen', () => {
    const text = buildSummary({ ...base, hour: 9, alert: { title: 'Lluvia fuerte', source: 'Defensa civil' } });
    expect(text).toContain('Hay una alerta en Miraflores: Lluvia fuerte, avisada por Defensa civil.');
    expect(text.indexOf('alerta')).toBeLessThan(text.indexOf('¿En qué te ayudo?'));
  });

  it('un solo evento y varios eventos, con el próximo', () => {
    const one = buildSummary({ ...base, hour: 9, events: [{ title: 'Feria del barrio', startsAt: NOW + DAY }] });
    expect(one).toContain('Hay un evento: Feria del barrio, mañana.');
    const many = buildSummary({
      ...base,
      hour: 9,
      events: [
        { title: 'Charla de seguridad', startsAt: NOW + 3 * 60 * 60 * 1000 },
        { title: 'Feria del barrio', startsAt: NOW + DAY },
        { title: 'Bingo', startsAt: NOW + 3 * DAY },
      ],
    });
    expect(many).toContain('Hay 3 eventos; el próximo es Charla de seguridad, hoy.');
  });

  it('cuenta ofertas y pedidos con singular y plural, y los urgentes', () => {
    const text = buildSummary({
      ...base,
      hour: 9,
      posts: [
        { kind: 'offer' },
        { kind: 'offer' },
        { kind: 'request', urgent: true },
        { kind: 'request' },
        { kind: 'request' },
      ],
    });
    expect(text).toContain('2 ofertas y 3 pedidos de ayuda');
    expect(text).toContain('1 urgente');
    const single = buildSummary({ ...base, hour: 9, posts: [{ kind: 'offer' }] });
    expect(single).toContain('1 oferta');
    expect(single).not.toContain('pedido');
  });

  it('avisa de tus reportes pendientes', () => {
    expect(buildSummary({ ...base, hour: 9, pendingReports: 1 })).toContain('Tienes 1 reporte pendiente.');
    expect(buildSummary({ ...base, hour: 9, pendingReports: 2 })).toContain('Tienes 2 reportes pendientes.');
  });

  it('si todo lo mostrado es de demostración, lo dice', () => {
    const demo = buildSummary({
      ...base,
      hour: 9,
      events: [{ title: 'Feria', startsAt: NOW + DAY, isDemo: true }],
      posts: [{ kind: 'offer', isDemo: true }],
    });
    expect(demo).toContain('datos de demostración');
    const real = buildSummary({ ...base, hour: 9, events: [{ title: 'Feria', startsAt: NOW + DAY, isDemo: false }] });
    expect(real).not.toContain('demostración');
  });

  it('no inventa nada: sin eventos no habla de eventos', () => {
    const text = buildSummary({ ...base, hour: 9, posts: [{ kind: 'offer' }] });
    expect(text).not.toMatch(/evento/);
  });
});

describe('buildGreeting (saludo corto de la conversación por voz)', () => {
  it('saluda según la hora, con tu nombre si lo hay, se presenta y pregunta', () => {
    expect(buildGreeting({ hour: 9, name: 'Rosa' })).toBe(
      'Buenos días, Rosa. Soy Yunta. Puedo contarte lo que pasa hoy en tu barrio o ayudarte con lo que necesites. ¿Qué quieres?',
    );
    expect(buildGreeting({ hour: 15 })).toMatch(/^Buenas tardes\. Soy Yunta\./);
    expect(buildGreeting({ hour: 22 })).toMatch(/^Buenas noches\./);
  });

  it('es corto: se dice en pocos segundos', () => {
    expect(buildGreeting({ hour: 9 }).length).toBeLessThan(140);
  });
});

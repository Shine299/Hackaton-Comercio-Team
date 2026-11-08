import { createEventSchema } from './schema';

const NOW = new Date(2026, 10, 8, 10, 0, 0).getTime();
const valid = {
  title: 'Feria de la cuadra',
  body: '',
  dayOffset: 1,
  hour: 16,
  venueKind: 'public_place',
  venueName: 'Parque de Lince',
} as const;
const errorsOf = (values: object) => {
  const result = createEventSchema(NOW).safeParse(values);
  return result.success ? [] : result.error.issues.map((i) => i.path.join('.'));
};

describe('createEventSchema', () => {
  it('acepta un evento completo', () => {
    expect(errorsOf(valid)).toEqual([]);
  });

  it('pide título de 3 a 120 caracteres y descripción de hasta 400', () => {
    expect(errorsOf({ ...valid, title: ' ab ' })).toContain('title');
    expect(errorsOf({ ...valid, title: 'a'.repeat(121) })).toContain('title');
    expect(errorsOf({ ...valid, body: 'a'.repeat(401) })).toContain('body');
  });

  it('pide el lugar (2 a 80 caracteres)', () => {
    expect(errorsOf({ ...valid, venueName: ' ' })).toContain('venueName');
  });

  it('no deja crear un evento en una hora que ya pasó, ni a más de 30 días', () => {
    expect(errorsOf({ ...valid, dayOffset: 0, hour: 9 })).toContain('hour');
    expect(errorsOf({ ...valid, dayOffset: 0, hour: 11 })).toEqual([]);
    expect(errorsOf({ ...valid, dayOffset: 31 })).toContain('dayOffset');
  });
});

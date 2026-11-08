import { getPolicy, isPolicyId, POLICIES, POLICIES_VERSION, type PolicyId } from './policies';

/** Todo el texto de una política en minúsculas, para comprobar que dice lo que la app realmente hace. */
const textOf = (id: PolicyId) =>
  getPolicy(id)
    .sections.flatMap((s) => [s.heading, ...s.body])
    .join(' ')
    .toLowerCase();

// SPEC-056: políticas de servicios en el menú lateral (borrador a partir de lo que la app ya hace).
describe('POLICIES', () => {
  it('son 4, en orden fijo y con ids únicos', () => {
    expect(POLICIES.map((p) => p.id)).toEqual(['terminos', 'privacidad', 'emergencias', 'ia-pagos']);
    expect(new Set(POLICIES.map((p) => p.id)).size).toBe(POLICIES.length);
  });

  it('cada una tiene título, resumen de una línea y secciones con texto', () => {
    for (const policy of POLICIES) {
      expect(policy.title.trim()).not.toBe('');
      expect(policy.summary.trim()).not.toBe('');
      expect(policy.summary).not.toContain('\n');
      expect(policy.sections.length).toBeGreaterThan(0);
      for (const section of policy.sections) {
        expect(section.heading.trim()).not.toBe('');
        expect(section.body.length).toBeGreaterThan(0);
        for (const paragraph of section.body) expect(paragraph.trim()).not.toBe('');
      }
    }
  });

  it('muestra una versión con fecha', () => {
    expect(POLICIES_VERSION.label).toMatch(/versión/i);
    expect(POLICIES_VERSION.label).toMatch(/2026/);
  });
});

describe('getPolicy / isPolicyId', () => {
  it('encuentra cada política por su id', () => {
    for (const policy of POLICIES) expect(getPolicy(policy.id)).toBe(policy);
  });

  it('isPolicyId acepta solo ids conocidos', () => {
    expect(isPolicyId('privacidad')).toBe(true);
    expect(isPolicyId('ia-pagos')).toBe(true);
    expect(isPolicyId('otra')).toBe(false);
    expect(isPolicyId(undefined)).toBe(false);
    expect(isPolicyId('')).toBe(false);
  });
});

// Criterio 5: el texto no promete nada que la app no haga (fuentes: ADR 0005, ADR 0008, SPEC-045, SPEC-046, SPEC-049).
describe('contenido fiel a la app', () => {
  it('Términos de uso: no verifica personas, pide solo un nombre público y marca los datos de demostración', () => {
    const text = textOf('terminos');
    expect(text).toContain('no verifica');
    expect(text).toContain('nombre público');
    expect(text).toContain('dato de demo');
  });

  it('Privacidad: lo público es el sector aproximado y lo guardado está en el teléfono', () => {
    const text = textOf('privacidad');
    expect(text).toContain('sector aproximado');
    expect(text).toContain('nunca');
    expect(text).toContain('en tu teléfono');
  });

  it('Emergencias: no reemplaza a los servicios oficiales; el Modo guardia es opcional, solo con la app a la vista y usa la ubicación exacta una sola vez', () => {
    const text = textOf('emergencias');
    expect(text).toContain('no reemplaza');
    expect(text).toContain('servicios oficiales');
    expect(text).toContain('opcional');
    expect(text).toContain('a la vista');
    expect(text).toContain('una sola vez');
  });

  it('IA y pagos: la IA es externa y puede equivocarse; Yunta no guarda dinero', () => {
    const text = textOf('ia-pagos');
    expect(text).toContain('puede equivocarse');
    expect(text).toContain('externos');
    expect(text).toContain('yunta no guarda dinero');
  });
});

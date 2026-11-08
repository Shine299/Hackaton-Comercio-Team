import { atRiskWeightBonus, peopleSummary, sanitizePeople } from './people';

describe('atRiskWeightBonus', () => {
  it('solo «sí» sube el aviso', () => {
    expect(atRiskWeightBonus('yes')).toBeGreaterThan(0);
    expect(atRiskWeightBonus('no')).toBe(0);
    expect(atRiskWeightBonus('unknown')).toBe(0);
    expect(atRiskWeightBonus(undefined)).toBe(0);
  });
});

describe('peopleSummary', () => {
  it('sin datos no muestra nada', () => {
    expect(peopleSummary({})).toBeUndefined();
  });

  it('combina cantidad y riesgo', () => {
    expect(peopleSummary({ peopleCount: 'few', peopleAtRisk: 'yes' })).toBe('2 a 5 personas · Hay personas en riesgo');
    expect(peopleSummary({ peopleCount: 'one' })).toBe('1 persona');
    expect(peopleSummary({ peopleAtRisk: 'unknown' })).toBe('Riesgo sin confirmar');
  });
});

describe('sanitizePeople', () => {
  it('deja solo valores válidos', () => {
    expect(sanitizePeople({ peopleCount: 'many', peopleAtRisk: 'no' })).toEqual({ peopleCount: 'many', peopleAtRisk: 'no' });
  });

  it('descarta texto libre o valores inventados', () => {
    expect(sanitizePeople({ peopleCount: 'Juan y Ana', peopleAtRisk: 'quizás' })).toEqual({});
    expect(sanitizePeople({})).toEqual({});
  });
});

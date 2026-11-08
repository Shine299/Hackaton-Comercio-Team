import { isHearing, levelToUnit, pushLevel, TRAIL_LENGTH } from './levels';

describe('levelToUnit (volumen en dB → altura de la barra de 0 a 1)', () => {
  it('el silencio es 0 y un volumen fuerte es 1', () => {
    expect(levelToUnit(-60)).toBe(0);
    expect(levelToUnit(-10)).toBe(1);
    expect(levelToUnit(-35)).toBeCloseTo(0.5, 5);
  });

  it('no se sale del rango', () => {
    expect(levelToUnit(-160)).toBe(0);
    expect(levelToUnit(0)).toBe(1);
  });

  it('sin medición o con un valor raro es 0', () => {
    expect(levelToUnit(undefined)).toBe(0);
    expect(levelToUnit(null)).toBe(0);
    expect(levelToUnit(Number.NaN)).toBe(0);
    expect(levelToUnit(Number.NEGATIVE_INFINITY)).toBe(0);
  });
});

describe('pushLevel (la estela: lo nuevo entra por la derecha y lo viejo se va)', () => {
  it('agrega al final sin modificar el original', () => {
    const before = [0.1, 0.2];
    const after = pushLevel(before, 0.9);
    expect(after).toEqual([0.1, 0.2, 0.9]);
    expect(before).toEqual([0.1, 0.2]);
  });

  it('conserva solo las últimas TRAIL_LENGTH', () => {
    let trail: number[] = [];
    for (let i = 0; i < TRAIL_LENGTH + 10; i++) trail = pushLevel(trail, i / 100);
    expect(trail).toHaveLength(TRAIL_LENGTH);
    expect(trail[trail.length - 1]).toBeCloseTo((TRAIL_LENGTH + 9) / 100, 5);
  });
});

describe('isHearing (comprobación: ¿se está recibiendo voz ahora?)', () => {
  it('sí si alguna de las últimas barras sube del umbral', () => {
    expect(isHearing([0.02, 0.05, 0.4, 0.1])).toBe(true);
  });

  it('no si todo está bajo, o si lo único fuerte quedó atrás', () => {
    expect(isHearing([0.02, 0.05, 0.03])).toBe(false);
    expect(isHearing([0.9, 0.02, 0.02, 0.02, 0.02, 0.02, 0.02, 0.02, 0.02, 0.02])).toBe(false);
    expect(isHearing([])).toBe(false);
  });
});

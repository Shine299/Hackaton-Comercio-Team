import { EASY_TEXT_SCALE, easyTextStyle, scaledSize } from './easyMode';

describe('scaledSize', () => {
  it('no cambia nada en modo estándar', () => {
    expect(scaledSize(16, 'standard')).toBe(16);
  });

  it('agranda el texto en modo fácil', () => {
    expect(scaledSize(16, 'easy')).toBe(Math.round(16 * EASY_TEXT_SCALE));
    expect(scaledSize(16, 'easy')).toBeGreaterThan(16);
  });
});

describe('easyTextStyle', () => {
  it('en estándar no devuelve estilo', () => {
    expect(easyTextStyle('body-lg', 'standard')).toBeUndefined();
  });

  it('en fácil devuelve tamaño e interlineado enteros y mayores', () => {
    const style = easyTextStyle('body-lg', 'easy')!;
    expect(Number.isInteger(style.fontSize)).toBe(true);
    expect(style.fontSize).toBe(20);
    expect(style.lineHeight).toBeGreaterThan(style.fontSize);
  });

  it('una variante desconocida no rompe nada', () => {
    expect(easyTextStyle('no-existe', 'easy')).toBeUndefined();
  });
});

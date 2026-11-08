import { formatPercent, formatSoles } from './index';

describe('formatSoles', () => {
  it('muestra soles enteros sin decimales', () => {
    expect(formatSoles(2000)).toBe('S/ 20');
    expect(formatSoles(0)).toBe('S/ 0');
  });

  it('separa los miles con espacio', () => {
    expect(formatSoles(120000)).toBe('S/ 1 200');
    expect(formatSoles(123456700)).toBe('S/ 1 234 567');
  });

  it('muestra céntimos con coma cuando los hay', () => {
    expect(formatSoles(2050)).toBe('S/ 20,50');
    expect(formatSoles(120005)).toBe('S/ 1 200,05');
  });
});

describe('formatPercent', () => {
  it('redondea a un decimal con coma', () => {
    expect(formatPercent(71.666)).toBe('71,7 %');
  });

  it('omite el decimal si es exacto', () => {
    expect(formatPercent(70)).toBe('70 %');
    expect(formatPercent(69.96)).toBe('70 %');
  });
});

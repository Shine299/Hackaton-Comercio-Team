import { AVATAR_PALETTE, avatarColor, initialsOf } from './avatarColors';

// SPEC-044: avatar con iniciales y color estable.
describe('initialsOf', () => {
  it('toma la primera letra de las 2 primeras palabras, en mayúscula', () => {
    expect(initialsOf('Rosa M.')).toBe('RM');
    expect(initialsOf('josé luis pérez')).toBe('JL');
  });

  it('con una sola palabra usa una letra', () => {
    expect(initialsOf('Lucho')).toBe('L');
  });

  it('ignora espacios de más y signos sueltos', () => {
    expect(initialsOf('  ana   . torres ')).toBe('AT');
  });

  it('sin nombre devuelve «?»', () => {
    expect(initialsOf('')).toBe('?');
    expect(initialsOf('   ')).toBe('?');
  });

  it('respeta letras con tilde y ñ', () => {
    expect(initialsOf('Ñato Úrsula')).toBe('ÑÚ');
  });
});

describe('avatarColor', () => {
  it('el mismo id da siempre el mismo color', () => {
    expect(avatarColor('vecino-1')).toBe(avatarColor('vecino-1'));
  });

  it('siempre sale de la paleta', () => {
    for (const id of ['a', 'b', 'demo-rosa', 'x'.repeat(50), '']) expect(AVATAR_PALETTE).toContain(avatarColor(id));
  });

  it('reparte ids distintos en más de un color', () => {
    const colors = new Set(Array.from({ length: 30 }, (_, i) => avatarColor(`vecino-${i}`)));
    expect(colors.size).toBeGreaterThan(3);
  });
});

/** Contraste WCAG contra blanco: la paleta debe dar ≥ 4,5:1 (texto de las iniciales). */
function contrastWithWhite(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const lin = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  const lum = 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  return 1.05 / (lum + 0.05);
}

describe('AVATAR_PALETTE', () => {
  it('cada color contrasta ≥ 4,5:1 con texto blanco', () => {
    for (const hex of AVATAR_PALETTE) expect(contrastWithWhite(hex)).toBeGreaterThanOrEqual(4.5);
  });
});

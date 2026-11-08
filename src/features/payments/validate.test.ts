import { MAX_YAPE_CENTS, parseSolesInput, validateYapeCharge } from './validate';

const ok = { amountCents: 2000, phone: '987654321', otp: '123456' };

describe('validateYapeCharge', () => {
  it('acepta un aporte válido', () => {
    expect(validateYapeCharge(ok)).toBeNull();
  });

  it('acepta el número con espacios', () => {
    expect(validateYapeCharge({ ...ok, phone: '987 654 321' })).toBeNull();
  });

  it('rechaza montos menores a S/ 1 o mayores al tope de Yape', () => {
    expect(validateYapeCharge({ ...ok, amountCents: 50 })).toMatch(/mínimo/);
    expect(validateYapeCharge({ ...ok, amountCents: MAX_YAPE_CENTS + 100 })).toMatch(/S\/ 500/);
  });

  it('pide un celular de 9 dígitos que empiece con 9', () => {
    expect(validateYapeCharge({ ...ok, phone: '12345' })).toMatch(/celular/);
    expect(validateYapeCharge({ ...ok, phone: '887654321' })).toMatch(/celular/);
  });

  it('pide un código de 6 dígitos', () => {
    expect(validateYapeCharge({ ...ok, otp: '12a' })).toMatch(/código/);
  });
});

describe('parseSolesInput', () => {
  it('convierte soles escritos a céntimos', () => {
    expect(parseSolesInput('20')).toBe(2000);
    expect(parseSolesInput('15,50')).toBe(1550);
    expect(parseSolesInput('15.5')).toBe(1550);
  });

  it('devuelve null si no es un número', () => {
    expect(parseSolesInput('')).toBeNull();
    expect(parseSolesInput('abc')).toBeNull();
  });
});

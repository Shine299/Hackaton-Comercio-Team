import { demoAuthorPhoto } from './demoAvatars';

describe('demoAuthorPhoto', () => {
  it('da la foto de demo de Jorge R. con los datos locales', () => {
    expect(demoAuthorPhoto('demo-a3')).toBeDefined();
  });

  it('da la misma foto de Jorge R. cuando el feed viene de Supabase (id del seed)', () => {
    expect(demoAuthorPhoto('00000000-0000-4000-8000-0000000000a3')).toBe(demoAuthorPhoto('demo-a3'));
  });

  it('sin foto de demo, devuelve undefined (el avatar muestra iniciales)', () => {
    expect(demoAuthorPhoto('demo-a1')).toBeUndefined();
    expect(demoAuthorPhoto('00000000-0000-4000-8000-0000000000a1')).toBeUndefined();
    expect(demoAuthorPhoto('uuid-real-de-un-vecino')).toBeUndefined();
  });
});

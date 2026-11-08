import { BAR_ITEMS, resolveSection } from './sections';

describe('resolveSection', () => {
  it('no muestra la barra en Inicio', () => {
    expect(resolveSection('/')).toBeNull();
  });

  it('resalta la sección en cada pantalla raíz', () => {
    expect(resolveSection('/comunidad')).toBe('comunidad');
    expect(resolveSection('/negocios')).toBe('emprendimientos');
    expect(resolveSection('/emergencias')).toBe('emergencia');
    expect(resolveSection('/ayuda')).toBe('ayuda');
  });

  it('Explorar y Publicar pertenecen a Ayuda; el tablero, a Emergencia', () => {
    expect(resolveSection('/explorar')).toBe('ayuda');
    expect(resolveSection('/publicar')).toBe('ayuda');
    expect(resolveSection('/emergencias/tablero')).toBe('emergencia');
  });

  it('formularios y detalles no tienen barra', () => {
    expect(resolveSection('/publicacion/demo-p1')).toBeNull();
    expect(resolveSection('/emergencias/reportar')).toBeNull();
    expect(resolveSection('/perfil')).toBeNull();
  });
});

describe('BAR_ITEMS', () => {
  it('son 5 secciones con claves únicas', () => {
    expect(BAR_ITEMS).toHaveLength(5);
    expect(new Set(BAR_ITEMS.map((i) => i.key)).size).toBe(5);
  });
});

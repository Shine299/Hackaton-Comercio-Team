import { BAR_ITEMS, resolveBar, ROOT_PATHS } from './sections';

// SPEC-043: barra «comunidad primero».
describe('resolveBar', () => {
  it('resalta cada pestaña en su pantalla raíz, también en el Inicio', () => {
    expect(resolveBar('/')).toEqual({ active: 'inicio' });
    expect(resolveBar('/eventos')).toEqual({ active: 'eventos' });
    expect(resolveBar('/explorar')).toEqual({ active: 'explorar' });
    expect(resolveBar('/marketplace')).toEqual({ active: 'marketplace' });
    expect(resolveBar('/mensajes')).toEqual({ active: 'chat' });
  });

  it('en Emergencia muestra la barra sin pestaña resaltada (siempre hay salida)', () => {
    for (const path of ['/emergencias', '/emergencias/tablero', '/emergencias/recursos', '/emergencias/mis-reportes']) {
      expect(resolveBar(path)).toEqual({ active: null });
    }
  });

  it('formularios y detalles no tienen barra', () => {
    for (const path of [
      '/publicar',
      '/publicaciones',
      '/publicacion/demo-p1',
      '/chat/x',
      '/emergencias/reportar',
      '/perfil',
      '/actividad',
      '/negocios/registrar',
    ]) {
      expect(resolveBar(path)).toBeNull();
    }
  });

  it('las rutas viejas no tienen barra (redirigen antes de pintar)', () => {
    expect(resolveBar('/ayuda')).toBeNull();
    expect(resolveBar('/comunidad')).toBeNull();
    expect(resolveBar('/negocios')).toBeNull();
  });
});

describe('BAR_ITEMS', () => {
  it('son 5 pestañas en orden: Inicio · Eventos · Explorar · Marketplace · Chat', () => {
    expect(BAR_ITEMS.map((i) => i.key)).toEqual(['inicio', 'eventos', 'explorar', 'marketplace', 'chat']);
  });

  it('cada pestaña apunta a su raíz y tiene descripción para el lector', () => {
    for (const item of BAR_ITEMS) {
      expect(resolveBar(String(item.href))).toEqual({ active: item.key });
      expect(item.a11y.length).toBeGreaterThan(0);
      expect(item.label.length).toBeGreaterThan(0);
    }
  });
});

describe('ROOT_PATHS', () => {
  it('incluye las 5 raíces y Emergencia, y no las rutas viejas', () => {
    for (const item of BAR_ITEMS) expect(ROOT_PATHS.has(String(item.href))).toBe(true);
    expect(ROOT_PATHS.has('/emergencias')).toBe(true);
    for (const old of ['/ayuda', '/comunidad', '/negocios', '/publicar']) expect(ROOT_PATHS.has(old)).toBe(false);
  });
});

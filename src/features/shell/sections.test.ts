import { BAR_ITEMS, chatFabVisible, resolveBar, ROOT_PATHS } from './sections';

// SPEC-051: barra de los 4 servicios + Inicio; el chat es una burbuja flotante.
describe('resolveBar', () => {
  it('resalta cada pestaña en su pantalla raíz', () => {
    expect(resolveBar('/')).toEqual({ active: 'inicio' });
    expect(resolveBar('/eventos')).toEqual({ active: 'comunidad' });
    expect(resolveBar('/explorar')).toEqual({ active: 'negocios' });
    expect(resolveBar('/emergencias')).toEqual({ active: 'emergencia' });
    expect(resolveBar('/marketplace')).toEqual({ active: 'marketplace' });
  });

  it('todo el centro de Emergencia resalta la pestaña Emergencia', () => {
    for (const path of ['/emergencias', '/emergencias/tablero', '/emergencias/recursos', '/emergencias/mis-reportes']) {
      expect(resolveBar(path)).toEqual({ active: 'emergencia' });
    }
  });

  it('la bandeja de mensajes muestra la barra sin pestaña resaltada (siempre hay salida)', () => {
    expect(resolveBar('/mensajes')).toEqual({ active: null });
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
  it('son Inicio + los 4 servicios, en orden, y el chat NO es una pestaña', () => {
    expect(BAR_ITEMS.map((i) => i.key)).toEqual(['inicio', 'comunidad', 'negocios', 'emergencia', 'marketplace']);
    expect(BAR_ITEMS.map((i) => i.label)).toEqual(['Inicio', 'Comunidad', 'Negocios', 'Emergencia', 'Marketplace']);
  });

  it('cada pestaña apunta a su raíz y tiene descripción para el lector', () => {
    for (const item of BAR_ITEMS) {
      expect(resolveBar(String(item.href))).toEqual({ active: item.key });
      expect(item.a11y.length).toBeGreaterThan(0);
    }
  });
});

describe('chatFabVisible', () => {
  it('la burbuja se ve en las raíces de Inicio, Comunidad, Negocios y Marketplace', () => {
    for (const path of ['/', '/eventos', '/explorar', '/marketplace']) expect(chatFabVisible(path)).toBe(true);
  });

  it('no estorba en Emergencia, en los mensajes ni en formularios o detalles', () => {
    for (const path of ['/emergencias', '/emergencias/tablero', '/mensajes', '/publicar', '/chat/x', '/perfil']) {
      expect(chatFabVisible(path)).toBe(false);
    }
  });
});

describe('ROOT_PATHS', () => {
  it('incluye las raíces de la barra, y no las rutas viejas', () => {
    for (const item of BAR_ITEMS) expect(ROOT_PATHS.has(String(item.href))).toBe(true);
    for (const old of ['/ayuda', '/comunidad', '/negocios', '/publicar']) expect(ROOT_PATHS.has(old)).toBe(false);
  });
});

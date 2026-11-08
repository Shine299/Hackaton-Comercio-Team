import { BAR_ITEMS, chatFabVisible, resolveBar, ROOT_PATHS } from './sections';

// SPEC-051: barra de 4 pestañas (Inicio · Comunidad · Negocios · Ayuda), oculta en el Inicio (ahí van los 4 botones grandes); el chat es una burbuja flotante y
// Emergencia se abre con el SOS de la cabecera.
describe('resolveBar', () => {
  it('resalta cada pestaña en su pantalla raíz', () => {
    expect(resolveBar('/')).toBeNull(); // el Inicio no muestra la barra
    expect(resolveBar('/eventos')).toEqual({ active: 'comunidad' });
    expect(resolveBar('/explorar')).toEqual({ active: 'negocios' });
    expect(resolveBar('/ayuda')).toEqual({ active: 'ayuda' });
  });

  it('Emergencia no es pestaña: su centro muestra la barra sin resaltar nada (siempre hay salida)', () => {
    for (const path of ['/emergencias', '/emergencias/tablero', '/emergencias/recursos', '/emergencias/mis-reportes']) {
      expect(resolveBar(path)).toEqual({ active: null });
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
    expect(resolveBar('/marketplace')).toBeNull();
    expect(resolveBar('/comunidad')).toBeNull();
    expect(resolveBar('/negocios')).toBeNull();
  });
});

describe('BAR_ITEMS', () => {
  it('son 4 pestañas, en orden, y ni el chat ni Emergencia ni Marketplace son pestañas', () => {
    expect(BAR_ITEMS.map((i) => i.key)).toEqual(['inicio', 'comunidad', 'negocios', 'ayuda']);
    expect(BAR_ITEMS.map((i) => i.label)).toEqual(['Inicio', 'Comunidad', 'Negocios', 'Ayuda']);
  });

  it('cada pestaña apunta a su raíz y tiene descripción para el lector', () => {
    for (const item of BAR_ITEMS) {
      // Inicio es la única pestaña que no se resalta: en su pantalla la barra está oculta.
      expect(resolveBar(String(item.href))).toEqual(item.key === 'inicio' ? null : { active: item.key });
      expect(item.a11y.length).toBeGreaterThan(0);
    }
  });
});

describe('chatFabVisible', () => {
  it('la burbuja se ve en las raíces de las 4 pestañas y en el Inicio (aunque ahí no haya barra)', () => {
    for (const path of ['/', '/eventos', '/explorar', '/ayuda']) expect(chatFabVisible(path)).toBe(true);
  });

  it('no estorba en Emergencia, en los mensajes ni en formularios o detalles', () => {
    for (const path of ['/emergencias', '/emergencias/tablero', '/mensajes', '/publicar', '/chat/x', '/perfil']) {
      expect(chatFabVisible(path)).toBe(false);
    }
  });
});

describe('ROOT_PATHS', () => {
  it('incluye las raíces de la barra y Emergencia, y no las rutas viejas', () => {
    for (const item of BAR_ITEMS) expect(ROOT_PATHS.has(String(item.href))).toBe(true);
    expect(ROOT_PATHS.has('/emergencias')).toBe(true);
    for (const old of ['/marketplace', '/comunidad', '/negocios', '/publicar']) expect(ROOT_PATHS.has(old)).toBe(false);
  });
});

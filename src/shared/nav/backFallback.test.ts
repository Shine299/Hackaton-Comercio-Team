import { backFallbackFor } from './backFallback';

// SPEC-055: sin pantalla anterior, «Atrás» cae al inicio de la sección de la pantalla, no al Inicio general.
describe('backFallbackFor', () => {
  it('Ayuda: publicaciones, detalle y publicar', () => {
    for (const path of ['/publicacion/demo-p1', '/publicaciones', '/publicar']) {
      expect(backFallbackFor(path)).toBe('/ayuda');
    }
  });

  it('Negocios: registrar un negocio', () => {
    expect(backFallbackFor('/negocios/registrar')).toBe('/explorar');
  });

  it('Comunidad: detalle de evento y crear evento', () => {
    expect(backFallbackFor('/evento/demo-e1')).toBe('/eventos');
    expect(backFallbackFor('/eventos/crear')).toBe('/eventos');
  });

  it('Chat: una conversación', () => {
    expect(backFallbackFor('/chat/abc')).toBe('/mensajes');
  });

  it('Emergencia: todas sus pantallas, también las anidadas', () => {
    for (const path of ['/emergencias/tablero', '/emergencias/guardia', '/emergencias/estado/r1', '/emergencias/vecino-vulnerable']) {
      expect(backFallbackFor(path)).toBe('/emergencias');
    }
  });

  it('lo que no pertenece a una pestaña cae al Inicio, como hasta ahora', () => {
    for (const path of ['/fondos/f1', '/fondos/aportar/f1', '/camaras', '/camaras/c1', '/perrito/negrito', '/vecino/v1', '/asistente', '/conversacion', '/actividad', '/perfil']) {
      expect(backFallbackFor(path)).toBe('/');
    }
  });

  it('las raíces y las rutas desconocidas caen al Inicio', () => {
    for (const path of ['/', '/eventos', '/explorar', '/ayuda', '/mensajes', '/emergencias', '/no-existe']) {
      expect(backFallbackFor(path)).toBe('/');
    }
  });
});

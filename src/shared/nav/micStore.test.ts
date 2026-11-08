import { useMicStore } from './micStore';

const reset = () => useMicStore.setState({ holders: [] });

describe('micStore (quién está usando el micrófono)', () => {
  beforeEach(reset);

  it('empieza libre', () => {
    expect(useMicStore.getState().holders).toEqual([]);
  });

  it('«hold» lo ocupa y «release» lo libera', () => {
    useMicStore.getState().hold('asistente');
    expect(useMicStore.getState().holders).toEqual(['asistente']);
    useMicStore.getState().release('asistente');
    expect(useMicStore.getState().holders).toEqual([]);
  });

  it('el mismo dueño no se cuenta dos veces', () => {
    useMicStore.getState().hold('asistente');
    useMicStore.getState().hold('asistente');
    expect(useMicStore.getState().holders).toEqual(['asistente']);
  });

  it('sigue ocupado mientras quede algún dueño', () => {
    useMicStore.getState().hold('asistente');
    useMicStore.getState().hold('nota');
    useMicStore.getState().release('asistente');
    expect(useMicStore.getState().holders).toEqual(['nota']);
  });

  it('soltar algo que no se tenía no rompe nada', () => {
    useMicStore.getState().release('nada');
    expect(useMicStore.getState().holders).toEqual([]);
  });
});

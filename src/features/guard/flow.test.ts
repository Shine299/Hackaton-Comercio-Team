import { CONFIRM_SECONDS, guardReducer, initialGuardState, type GuardState } from './flow';

const listening = (): GuardState => guardReducer(initialGuardState, { type: 'start' });
const confirming = (text = 'hola yunta ayúdame me pasó algo'): GuardState => guardReducer(listening(), { type: 'heard', text });

describe('guardReducer', () => {
  it('empieza apagado y «start» pasa a escuchar', () => {
    expect(initialGuardState.phase).toBe('idle');
    expect(listening().phase).toBe('listening');
  });

  it('ignora lo que no es la frase de ayuda', () => {
    const state = guardReducer(listening(), { type: 'heard', text: 'hola yunta' });
    expect(state.phase).toBe('listening');
  });

  it('la frase de ayuda abre la confirmación con 10 s y el servicio elegido', () => {
    const state = confirming();
    expect(state).toMatchObject({ phase: 'confirming', need: 'ambulance', secondsLeft: CONFIRM_SECONDS });
    expect(CONFIRM_SECONDS).toBe(10);
    expect(confirming('yunta auxilio hay fuego')).toMatchObject({ need: 'fire' });
  });

  it('cada segundo baja la cuenta y al llegar a 0 se despacha (el silencio confirma)', () => {
    let state = confirming();
    for (let i = 0; i < CONFIRM_SECONDS - 1; i++) state = guardReducer(state, { type: 'tick' });
    expect(state).toMatchObject({ phase: 'confirming', secondsLeft: 1 });
    state = guardReducer(state, { type: 'tick' });
    expect(state.phase).toBe('dispatching');
  });

  it('«sí» despacha y «no, estoy bien» cancela', () => {
    expect(guardReducer(confirming(), { type: 'answer', text: 'sí' }).phase).toBe('dispatching');
    expect(guardReducer(confirming(), { type: 'answer', text: 'no, estoy bien' }).phase).toBe('listening');
  });

  it('una respuesta que no se entiende no cambia nada', () => {
    const before = confirming();
    expect(guardReducer(before, { type: 'answer', text: 'mmm' })).toEqual(before);
  });

  it('si en la respuesta aparece fuego o robo, cambia el servicio', () => {
    const state = guardReducer(confirming(), { type: 'answer', text: 'sí, hay un incendio' });
    expect(state).toMatchObject({ phase: 'dispatching', need: 'fire' });
  });

  it('«cancel» (botón Estoy bien) vuelve a escuchar', () => {
    expect(guardReducer(confirming(), { type: 'cancel' }).phase).toBe('listening');
  });

  it('«helped» (Ya me ayudan) vuelve a escuchar y «stop» apaga todo', () => {
    const dispatching = guardReducer(confirming(), { type: 'answer', text: 'sí' });
    expect(guardReducer(dispatching, { type: 'helped' }).phase).toBe('listening');
    expect(guardReducer(confirming(), { type: 'stop' }).phase).toBe('idle');
    expect(guardReducer(dispatching, { type: 'stop' }).phase).toBe('idle');
  });

  it('apagado, no reacciona a nada salvo «start»', () => {
    expect(guardReducer(initialGuardState, { type: 'heard', text: 'yunta ayuda' }).phase).toBe('idle');
    expect(guardReducer(initialGuardState, { type: 'tick' }).phase).toBe('idle');
  });

  it('mientras se despacha, ni la frase ni los ticks lo reinician', () => {
    const dispatching = guardReducer(confirming(), { type: 'answer', text: 'sí' });
    expect(guardReducer(dispatching, { type: 'heard', text: 'yunta ayuda' })).toEqual(dispatching);
    expect(guardReducer(dispatching, { type: 'tick' })).toEqual(dispatching);
  });
});

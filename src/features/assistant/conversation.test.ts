import {
  BLIND_STOP_MS,
  conversationReducer,
  createEndpointer,
  initialConversation,
  isGoodbye,
  MAX_SILENT_TURNS,
  NO_SPEECH_MS,
  SILENCE_MS,
  SPEECH_DB,
  type ConversationState,
} from './conversation';

describe('isGoodbye', () => {
  it('reconoce despedidas claras', () => {
    for (const text of ['adiós', 'Chau Yunta', 'chao', 'hasta luego', 'eso es todo', 'Gracias, eso es todo', 'nada más', 'nos vemos']) {
      expect(isGoodbye(text)).toBe(true);
    }
  });

  it('no corta una pregunta que solo contiene una palabra parecida', () => {
    for (const text of ['¿cómo puedo terminar mi publicación?', '¿para qué sirve el evento?', 'quiero salir al parque este sábado', '']) {
      expect(isGoodbye(text)).toBe(false);
    }
  });
});

describe('createEndpointer (cuándo termina de hablar la persona)', () => {
  const loud = SPEECH_DB + 10;
  const quiet = SPEECH_DB - 20;

  it('espera mientras no haya voz ni se acabe el tiempo', () => {
    const ep = createEndpointer();
    expect(ep.update(quiet, 500)).toBe('wait');
    expect(ep.update(quiet, 3000)).toBe('wait');
  });

  it('sin voz en NO_SPEECH_MS, es un turno en silencio', () => {
    const ep = createEndpointer();
    expect(ep.update(quiet, NO_SPEECH_MS)).toBe('nospeech');
  });

  it('termina cuando la persona habló y se calló SILENCE_MS', () => {
    const ep = createEndpointer();
    expect(ep.update(loud, 500)).toBe('wait');
    expect(ep.update(loud, 1200)).toBe('wait');
    expect(ep.update(quiet, 1200 + SILENCE_MS - 100)).toBe('wait');
    expect(ep.update(quiet, 1200 + SILENCE_MS)).toBe('speech');
  });

  it('un ruidito suelto de menos de 300 ms no cuenta como voz', () => {
    const ep = createEndpointer();
    expect(ep.update(loud, 400)).toBe('wait');
    expect(ep.update(quiet, 400 + SILENCE_MS)).toBe('wait');
    expect(ep.update(quiet, NO_SPEECH_MS)).toBe('nospeech');
  });

  it('se corta al máximo aunque siga hablando', () => {
    const ep = createEndpointer();
    expect(ep.update(loud, 0)).toBe('wait');
    expect(ep.update(loud, 14_000)).toBe('wait');
    expect(ep.update(loud, 15_000)).toBe('speech');
  });

  it('sin medición de volumen no se queda sin escuchar: corta por tiempo fijo', () => {
    const ep = createEndpointer();
    expect(ep.update(undefined, 500)).toBe('wait');
    expect(ep.update(undefined, BLIND_STOP_MS - 1)).toBe('wait');
    expect(ep.update(undefined, BLIND_STOP_MS)).toBe('speech');
  });
});

const run = (events: Parameters<typeof conversationReducer>[1][], from: ConversationState = initialConversation) =>
  events.reduce(conversationReducer, from);

describe('conversationReducer', () => {
  it('empieza apagada; «start» hace que Yunta hable primero', () => {
    expect(initialConversation.phase).toBe('off');
    expect(run([{ type: 'start' }]).phase).toBe('greeting');
  });

  it('solo escucha cuando Yunta termina de hablar', () => {
    expect(run([{ type: 'start' }, { type: 'spoken' }]).phase).toBe('listening');
  });

  it('lo que oye pasa a «pensando» y luego a «hablando», y vuelve a escuchar', () => {
    let s = run([{ type: 'start' }, { type: 'spoken' }]);
    s = conversationReducer(s, { type: 'heard', text: '¿qué eventos hay?' });
    expect(s.phase).toBe('thinking');
    s = conversationReducer(s, { type: 'answered' });
    expect(s.phase).toBe('speaking');
    s = conversationReducer(s, { type: 'spoken' });
    expect(s.phase).toBe('listening');
  });

  it('una despedida cierra la conversación', () => {
    const s = run([{ type: 'start' }, { type: 'spoken' }, { type: 'heard', text: 'gracias, eso es todo' }]);
    expect(s).toMatchObject({ phase: 'closing', reason: 'goodbye' });
    expect(conversationReducer(s, { type: 'spoken' }).phase).toBe('off');
  });

  it('dos turnos seguidos en silencio la cierran; hablar reinicia la cuenta', () => {
    expect(MAX_SILENT_TURNS).toBe(2);
    let s = run([{ type: 'start' }, { type: 'spoken' }, { type: 'silence' }]);
    expect(s).toMatchObject({ phase: 'listening', silentTurns: 1 });
    s = conversationReducer(s, { type: 'heard', text: 'hola' });
    s = run([{ type: 'answered' }, { type: 'spoken' }], s);
    expect(s).toMatchObject({ phase: 'listening', silentTurns: 0 });
    s = run([{ type: 'silence' }, { type: 'silence' }], s);
    expect(s).toMatchObject({ phase: 'closing', reason: 'idle' });
  });

  it('«stop» la apaga desde cualquier fase', () => {
    for (const events of [[{ type: 'start' }], [{ type: 'start' }, { type: 'spoken' }]] as const) {
      expect(run([...events, { type: 'stop' }]).phase).toBe('off');
    }
  });

  it('apagada, ignora todo salvo «start»', () => {
    expect(run([{ type: 'heard', text: 'hola' }, { type: 'spoken' }, { type: 'silence' }]).phase).toBe('off');
  });

  it('un fallo mientras piensa deja responder igual (con la respuesta fija)', () => {
    let s = run([{ type: 'start' }, { type: 'spoken' }, { type: 'heard', text: 'hola' }]);
    s = conversationReducer(s, { type: 'answered' });
    expect(s.phase).toBe('speaking');
  });
});

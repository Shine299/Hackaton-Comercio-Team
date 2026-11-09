import { audioMimeFromUri, buildAudioMultipart, checkRecording, cleanTranscript, clipSummary, fileFromMime, MAX_RECORDING_MS, micTestAdvice } from './voice';

// SPEC-050: voz al asistente.
describe('checkRecording', () => {
  it('rechaza grabaciones demasiado cortas', () => {
    expect(checkRecording(300).ok).toBe(false);
    expect(checkRecording(1500).ok).toBe(true);
  });

  it('acepta hasta el máximo (la app la corta ahí)', () => {
    expect(checkRecording(MAX_RECORDING_MS).ok).toBe(true);
    expect(MAX_RECORDING_MS).toBe(30_000);
  });
});

describe('cleanTranscript', () => {
  it('limpia espacios y deja el texto listo para editar', () => {
    expect(cleanTranscript('  ¿cómo   publico\n algo?  ')).toBe('¿cómo publico algo?');
  });

  it('vacío o solo puntuación = no se entendió', () => {
    expect(cleanTranscript('   ')).toBeNull();
    expect(cleanTranscript(' . ')).toBeNull();
  });

  it('corta en 500 caracteres (el máximo de una pregunta)', () => {
    expect(cleanTranscript('a'.repeat(600))?.length).toBe(500);
  });
});

describe('audioMimeFromUri', () => {
  it('reconoce los formatos que acepta Whisper', () => {
    expect(audioMimeFromUri('file:///x/voz.m4a')).toEqual({ type: 'audio/mp4', name: 'voz.m4a' });
    expect(audioMimeFromUri('file:///x/voz.webm')).toEqual({ type: 'audio/webm', name: 'voz.webm' });
    expect(audioMimeFromUri('file:///x/voz.wav')).toEqual({ type: 'audio/wav', name: 'voz.wav' });
  });

  it('un formato que Whisper no acepta (3gp) no se envía', () => {
    expect(audioMimeFromUri('file:///x/voz.3gp')).toBeNull();
  });
});

describe('clipSummary (diagnóstico: qué pasó con el último audio)', () => {
  it('cuenta duración, volumen y qué dijo el servidor', () => {
    expect(clipSummary({ seconds: 3, peakDb: -18, outcome: 'ok' })).toBe('Último audio: 3 s · volumen máximo -18 dB · se entendió.');
  });

  it('avisa cuando el micrófono casi no capta nada', () => {
    expect(clipSummary({ seconds: 4, peakDb: -62, outcome: 'empty' })).toBe(
      'Último audio: 4 s · volumen máximo -62 dB (muy bajo: el micrófono casi no capta nada) · el servidor no oyó voz.',
    );
  });

  it('sin medición de volumen lo dice', () => {
    expect(clipSummary({ seconds: 2, peakDb: null, outcome: 'unavailable' })).toBe(
      'Último audio: 2 s · sin medición de volumen · el servidor no está disponible.',
    );
  });

  it('nombra cada resultado en palabras simples', () => {
    expect(clipSummary({ seconds: 1, peakDb: -20, outcome: 'limit' })).toContain('se acabó el cupo de hoy');
    expect(clipSummary({ seconds: 1, peakDb: -20, outcome: 'format' })).toContain('formato de audio no válido');
    expect(clipSummary({ seconds: 1, peakDb: -20, outcome: 'offline' })).toContain('sin conexión');
  });
});

describe('micTestAdvice (prueba de micrófono: qué hacer según lo que pasó)', () => {
  it('todo bien', () => {
    expect(micTestAdvice({ peakDb: -18, kb: 40, outcome: 'ok' })).toBe('Todo bien: el teléfono te oye y el servidor te entiende.');
  });

  it('archivo casi vacío: el teléfono no está grabando', () => {
    expect(micTestAdvice({ peakDb: -18, kb: 1, outcome: 'empty' })).toContain('casi vacío');
  });

  it('sin medición de volumen pide escuchar la grabación', () => {
    expect(micTestAdvice({ peakDb: null, kb: 30, outcome: 'empty' })).toContain('Escucha la grabación');
  });

  it('volumen muy bajo: el micrófono no capta', () => {
    expect(micTestAdvice({ peakDb: -70, kb: 30, outcome: 'empty' })).toContain('casi no capta nada');
  });

  it('volumen bueno pero el servidor no oyó voz', () => {
    expect(micTestAdvice({ peakDb: -20, kb: 30, outcome: 'empty' })).toContain('el servidor no oyó voz');
  });

  it('fallos del servidor o de la red', () => {
    expect(micTestAdvice({ peakDb: -20, kb: 30, outcome: 'limit' })).toContain('cupo');
    expect(micTestAdvice({ peakDb: -20, kb: 30, outcome: 'unavailable' })).toContain('no está disponible');
    expect(micTestAdvice({ peakDb: -20, kb: 30, outcome: 'offline' })).toContain('conexión');
    expect(micTestAdvice({ peakDb: -20, kb: 30, outcome: 'format' })).toContain('formato');
  });
});

describe('fileFromMime (audio del navegador: llega como blob sin extensión)', () => {
  it('reconoce los formatos que graba el navegador y los que acepta Whisper', () => {
    expect(fileFromMime('audio/webm')).toEqual({ type: 'audio/webm', name: 'voz.webm' });
    expect(fileFromMime('audio/ogg')).toEqual({ type: 'audio/ogg', name: 'voz.ogg' });
    expect(fileFromMime('audio/mp4')).toEqual({ type: 'audio/mp4', name: 'voz.m4a' });
    expect(fileFromMime('audio/wav')).toEqual({ type: 'audio/wav', name: 'voz.wav' });
  });

  it('ignora los parámetros del tipo («audio/webm;codecs=opus»)', () => {
    expect(fileFromMime('audio/webm;codecs=opus')).toEqual({ type: 'audio/webm', name: 'voz.webm' });
  });

  it('un tipo desconocido o vacío no se envía', () => {
    expect(fileFromMime('')).toBeNull();
    expect(fileFromMime('video/mp4')).toBeNull();
    expect(fileFromMime('application/octet-stream')).toBeNull();
  });
});

describe('buildAudioMultipart', () => {
  it('arma un multipart con el audio en bytes entre el encabezado y el cierre', () => {
    const audio = new Uint8Array([1, 2, 3]).buffer;
    const { body, contentType } = buildAudioMultipart(audio, { name: 'voz.m4a', type: 'audio/mp4' }, 'XX');
    const text = String.fromCharCode(...new Uint8Array(body));
    expect(contentType).toBe('multipart/form-data; boundary=XX');
    expect(text.startsWith('--XX\r\nContent-Disposition: form-data; name="audio"; filename="voz.m4a"\r\nContent-Type: audio/mp4\r\n\r\n')).toBe(true);
    expect(text.endsWith('\x01\x02\x03\r\n--XX--\r\n')).toBe(true);
  });
});

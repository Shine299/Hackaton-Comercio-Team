import { MAX_UPLOADS_PER_SESSION, peakLevel, shouldUploadClip, SPEECH_DB } from './audioGate';

describe('peakLevel', () => {
  it('toma el nivel más alto e ignora lo que no es un número', () => {
    expect(peakLevel([-60, -22, -40])).toBe(-22);
    expect(peakLevel([Number.NaN, -50, Number.NEGATIVE_INFINITY])).toBe(-50);
  });

  it('sin mediciones devuelve -Infinity (silencio)', () => {
    expect(peakLevel([])).toBe(Number.NEGATIVE_INFINITY);
  });
});

describe('shouldUploadClip (el audio sin sonido nunca se sube)', () => {
  const ok = { peakDb: SPEECH_DB + 5, durationMs: 4000, uploadsThisSession: 0 };

  it('sube un clip con voz y duración suficiente', () => {
    expect(shouldUploadClip(ok)).toEqual({ upload: true });
  });

  it('descarta el silencio y el ruido bajo', () => {
    expect(shouldUploadClip({ ...ok, peakDb: SPEECH_DB - 5 })).toEqual({ upload: false, reason: 'quiet' });
    expect(shouldUploadClip({ ...ok, peakDb: Number.NEGATIVE_INFINITY })).toEqual({ upload: false, reason: 'quiet' });
  });

  it('descarta los clips demasiado cortos', () => {
    expect(shouldUploadClip({ ...ok, durationMs: 300 })).toEqual({ upload: false, reason: 'short' });
  });

  it('para al llegar al tope de la sesión, para cuidar el cupo gratuito', () => {
    expect(shouldUploadClip({ ...ok, uploadsThisSession: MAX_UPLOADS_PER_SESSION })).toEqual({ upload: false, reason: 'cap' });
    expect(shouldUploadClip({ ...ok, uploadsThisSession: MAX_UPLOADS_PER_SESSION - 1 })).toEqual({ upload: true });
  });
});

describe('shouldUploadClip sin medición de volumen', () => {
  const clip = { peakDb: Number.NEGATIVE_INFINITY, durationMs: 4000, uploadsThisSession: 0 };

  it('si el teléfono no mide el volumen, no descarta el clip por «silencio» (si no, nunca oiría nada)', () => {
    expect(shouldUploadClip({ ...clip, hasMetering: false })).toEqual({ upload: true });
  });

  it('con medición, el silencio sigue descartándose', () => {
    expect(shouldUploadClip({ ...clip, hasMetering: true })).toEqual({ upload: false, reason: 'quiet' });
  });

  it('el tope y la duración mínima siguen valiendo sin medición', () => {
    expect(shouldUploadClip({ ...clip, hasMetering: false, durationMs: 100 })).toEqual({ upload: false, reason: 'short' });
    expect(shouldUploadClip({ ...clip, hasMetering: false, uploadsThisSession: MAX_UPLOADS_PER_SESSION })).toEqual({
      upload: false,
      reason: 'cap',
    });
  });
});

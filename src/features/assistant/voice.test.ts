import { audioMimeFromUri, checkRecording, cleanTranscript, MAX_RECORDING_MS } from './voice';

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

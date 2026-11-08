import { AudioModule, RecordingPresets, setAudioModeAsync, useAudioRecorder, useAudioRecorderState } from 'expo-audio';
import { useEffect, useRef, useState } from 'react';

import { isSupabaseConfigured } from '@/shared/supabase/client';

import { transcribeAudio } from './repository';
import { checkRecording, cleanTranscript, MAX_RECORDING_MS } from './voice';

/**
 * Grabación liviana para transcribir (SPEC-050): `.m4a` AAC mono 16 kHz 32 kbps (~120 KB cada 30 s).
 * No se usa `LOW_QUALITY`: en Android graba `.3gp`, que Whisper no acepta.
 */
const VOICE_PRESET = { ...RecordingPresets.HIGH_QUALITY, sampleRate: 16_000, numberOfChannels: 1, bitRate: 32_000 };

export type VoiceStatus = 'idle' | 'recording' | 'transcribing';

const KEYBOARD_HINT = 'Puedes escribir o dictar con el micrófono de tu teclado.';
const REASON_TEXT = {
  limit: `Se acabó el cupo del asistente por hoy. ${KEYBOARD_HINT}`,
  unavailable: `No se pudo pasar tu voz a texto ahora. ${KEYBOARD_HINT}`,
  empty: 'No te entendí. Intenta de nuevo, más cerca del teléfono.',
  format: `Este formato de audio no se puede enviar. ${KEYBOARD_HINT}`,
} as const;

/**
 * Voz a texto para el asistente. Tocar para empezar y tocar para terminar (no hace falta mantener presionado).
 * El texto llega por `onTranscript` para que la persona lo revise: nada se envía solo.
 */
export function useVoiceInput({ onTranscript, onError }: { onTranscript: (text: string) => void; onError: (message: string) => void }) {
  const recorder = useAudioRecorder(VOICE_PRESET);
  const recorderState = useAudioRecorderState(recorder, 250);
  const [status, setStatus] = useState<VoiceStatus>('idle');
  const stopping = useRef(false);
  const autoStop = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Si se sale de la pantalla grabando, se cancela el corte automático.
  useEffect(() => () => {
    if (autoStop.current) clearTimeout(autoStop.current);
  }, []);

  const start = async () => {
    if (status !== 'idle') return;
    if (!isSupabaseConfigured) {
      onError(`La voz a texto necesita conexión con el servidor de Yunta. ${KEYBOARD_HINT}`);
      return;
    }
    try {
      const permission = await AudioModule.requestRecordingPermissionsAsync();
      if (!permission.granted) {
        onError(`Sin permiso de micrófono no se puede grabar. ${KEYBOARD_HINT}`);
        return;
      }
      await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: true });
      await recorder.prepareToRecordAsync();
      recorder.record();
      stopping.current = false;
      // Corte automático a los 30 s.
      autoStop.current = setTimeout(() => void finish(), MAX_RECORDING_MS);
      setStatus('recording');
    } catch {
      onError(`No se pudo empezar a grabar. ${KEYBOARD_HINT}`);
    }
  };

  const finish = async () => {
    if (stopping.current) return;
    stopping.current = true;
    if (autoStop.current) clearTimeout(autoStop.current);
    autoStop.current = null;
    // Duración real según el grabador (antes de detenerlo).
    const durationMs = recorder.getStatus().durationMillis;
    try {
      await recorder.stop();
      await setAudioModeAsync({ allowsRecording: false });
    } catch {
      // Si falló al detener, se informa abajo.
    }
    const check = checkRecording(durationMs);
    const uri = recorder.uri;
    if (!check.ok || !uri) {
      setStatus('idle');
      onError(check.ok ? 'No se pudo guardar la grabación. Inténtalo de nuevo.' : check.error);
      return;
    }
    setStatus('transcribing');
    try {
      const result = await transcribeAudio(uri);
      if (result.text === null) {
        onError(REASON_TEXT[result.reason]);
        return;
      }
      const text = cleanTranscript(result.text);
      if (text) onTranscript(text);
      else onError(REASON_TEXT.empty);
    } catch {
      onError(`Sin conexión: no se pudo pasar tu voz a texto. ${KEYBOARD_HINT}`);
    } finally {
      setStatus('idle');
    }
  };

  return {
    status,
    seconds: Math.floor(recorderState.durationMillis / 1000),
    toggle: () => void (status === 'recording' ? finish() : start()),
  };
}

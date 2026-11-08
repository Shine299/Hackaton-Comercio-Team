import { AudioModule, RecordingPresets, setAudioModeAsync, useAudioRecorder, useAudioRecorderState } from 'expo-audio';
import { useEffect, useRef, useState } from 'react';

import { useMicStore } from '@/shared/nav/micStore';
import { isSupabaseConfigured } from '@/shared/supabase/client';

import { levelToUnit, pushLevel } from './levels';
import { transcribeAudio } from './repository';
import { checkRecording, type ClipOutcome, cleanTranscript, clipSummary, MAX_RECORDING_MS } from './voice';

/**
 * Grabación liviana para transcribir (SPEC-050): `.m4a` AAC mono 16 kHz 32 kbps (~120 KB cada 30 s).
 * No se usa `LOW_QUALITY`: en Android graba `.3gp`, que Whisper no acepta.
 */
const VOICE_PRESET = { ...RecordingPresets.HIGH_QUALITY, sampleRate: 16_000, numberOfChannels: 1, bitRate: 32_000, isMeteringEnabled: true };

export type VoiceStatus = 'idle' | 'recording' | 'transcribing';

/** Mientras graba, el Modo guardia se aparta del micrófono (SPEC-052). */
const MIC_OWNER = 'asistente';

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
  // Diagnóstico (SPEC-053): volumen máximo del audio y una línea que dice qué pasó con el último.
  const peak = useRef(Number.NEGATIVE_INFINITY);
  const [lastClip, setLastClip] = useState<string | null>(null);
  // Estela de audio mientras grabas: comprobación visual de que el teléfono te oye (SPEC-053).
  const [levels, setLevels] = useState<number[]>([]);
  useEffect(() => {
    if (status !== 'recording') return;
    const timer = setInterval(() => setLevels((prev) => pushLevel(prev, levelToUnit(recorder.getStatus().metering))), 150);
    return () => clearInterval(timer);
  }, [status, recorder]);
  useEffect(() => {
    const level = recorderState.metering;
    if (typeof level === 'number' && level > peak.current) peak.current = level;
  }, [recorderState.metering]);

  // Si se sale de la pantalla grabando, se cancela el corte automático.
  useEffect(() => () => {
    useMicStore.getState().release(MIC_OWNER);
    if (autoStop.current) clearTimeout(autoStop.current);
  }, []);

  const start = async () => {
    if (status !== 'idle') return;
    if (!isSupabaseConfigured) {
      onError(`La voz a texto necesita conexión con el servidor de Yunta. ${KEYBOARD_HINT}`);
      return;
    }
    // Avisa antes de grabar: así el Modo guardia suelta el micrófono primero.
    useMicStore.getState().hold(MIC_OWNER);
    try {
      const permission = await AudioModule.requestRecordingPermissionsAsync();
      if (!permission.granted) {
        useMicStore.getState().release(MIC_OWNER);
        onError(`Sin permiso de micrófono no se puede grabar. ${KEYBOARD_HINT}`);
        return;
      }
      await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: true });
      await recorder.prepareToRecordAsync();
      recorder.record();
      peak.current = Number.NEGATIVE_INFINITY;
      setLevels([]);
      stopping.current = false;
      // Corte automático a los 30 s.
      autoStop.current = setTimeout(() => void finish(), MAX_RECORDING_MS);
      setStatus('recording');
    } catch {
      useMicStore.getState().release(MIC_OWNER);
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
    const report = (outcome: ClipOutcome) =>
      setLastClip(clipSummary({ seconds: Math.round(durationMs / 1000), peakDb: Number.isFinite(peak.current) ? peak.current : null, outcome }));
    try {
      await recorder.stop();
      await setAudioModeAsync({ allowsRecording: false });
    } catch {
      // Si falló al detener, se informa abajo.
    }
    // Ya no graba: el Modo guardia puede volver a escuchar mientras se transcribe.
    useMicStore.getState().release(MIC_OWNER);
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
        report(result.reason);
        onError(REASON_TEXT[result.reason]);
        return;
      }
      const text = cleanTranscript(result.text);
      report(text ? 'ok' : 'empty');
      if (text) onTranscript(text);
      else onError(REASON_TEXT.empty);
    } catch {
      report('offline');
      onError(`Sin conexión: no se pudo pasar tu voz a texto. ${KEYBOARD_HINT}`);
    } finally {
      setStatus('idle');
    }
  };

  return {
    status,
    seconds: Math.floor(recorderState.durationMillis / 1000),
    lastClip,
    levels,
    toggle: () => void (status === 'recording' ? finish() : start()),
  };
}

import { AudioModule, RecordingPresets, setAudioModeAsync, useAudioRecorder } from 'expo-audio';
import * as Speech from 'expo-speech';
import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { AppState } from 'react-native';

import { useMicStore } from '@/shared/nav/micStore';
import { isSupabaseConfigured } from '@/shared/supabase/client';

import { conversationReducer, createEndpointer, initialConversation, type TurnEnd } from './conversation';
import { levelToUnit, pushLevel } from './levels';
import { redactPersonalData, resolveAnswer } from './logic';
import { askAssistant, transcribeAudio } from './repository';
import { useAssistantStore } from './store';
import { cleanTranscript } from './voice';

/** Turnos de la conversación: mono 16 kHz con medición de volumen para saber cuándo te callas (SPEC-053). */
const TURN_PRESET = { ...RecordingPresets.HIGH_QUALITY, sampleRate: 16_000, numberOfChannels: 1, bitRate: 32_000, isMeteringEnabled: true };
const METER_EVERY_MS = 120;
const MIC_OWNER = 'conversacion';

const FAREWELL = {
  goodbye: 'Hasta luego. Aquí estaré cuando me necesites.',
  idle: 'Como no te escucho, me quedo en silencio. Aquí estaré si me necesitas.',
} as const;

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/** Habla y espera a que termine. Mientras habla NO se graba: el teléfono no debe escucharse a sí mismo. */
function speak(text: string): Promise<void> {
  return new Promise((resolve) => {
    const safety = setTimeout(resolve, Math.max(15_000, text.length * 90));
    const done = () => {
      clearTimeout(safety);
      resolve();
    };
    Speech.speak(text, { language: 'es-PE', rate: 0.95, onDone: done, onStopped: done, onError: done });
  });
}

type Recorder = ReturnType<typeof useAudioRecorder>;

/** Graba un turno y lo corta cuando te callas (o por tiempo, si el teléfono no mide el volumen). */
async function recordTurn(
  recorder: Recorder,
  isCancelled: () => boolean,
  onLevel: (db: number | undefined) => void,
): Promise<{ uri: string | null; end: TurnEnd }> {
  await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: true });
  await recorder.prepareToRecordAsync();
  recorder.record();
  const endpointer = createEndpointer();
  const startedAt = Date.now();
  let end: TurnEnd = 'wait';
  while (!isCancelled() && end === 'wait') {
    await sleep(METER_EVERY_MS);
    const db = recorder.getStatus().metering;
    onLevel(db); // alimenta la estela de audio: comprobación visual de que te está oyendo
    end = endpointer.update(db, Date.now() - startedAt);
  }
  await recorder.stop();
  return { uri: recorder.uri, end };
}

/**
 * Conversación por voz con Yunta (SPEC-053). Yunta habla primero (resumen del barrio), después escucha un turno, responde
 * —con IA o con respuestas fijas— y lo lee en voz alta, y así hasta que te despidas, te calles dos turnos o la termines.
 * La emergencia no pasa por la IA (lo decide `resolveAnswer`). Todo se ve también como texto en la pantalla.
 */
export function useVoiceConversation({ getGreeting, getContext }: { getGreeting: () => string; getContext?: () => string }) {
  const [state, dispatch] = useReducer(conversationReducer, initialConversation);
  const [error, setError] = useState<string | null>(null);
  const add = useAssistantStore((s) => s.add);
  const recorder = useAudioRecorder(TURN_PRESET);

  // Estela de audio: las últimas barras y a qué fase pertenecen (al cambiar de fase empieza vacía).
  const [trail, setTrail] = useState<{ phase: string; levels: number[] }>({ phase: 'off', levels: [] });
  const pushUnit = useCallback((phase: string, unit: number) => {
    setTrail((prev) => ({ phase, levels: pushLevel(prev.phase === phase ? prev.levels : [], unit) }));
  }, []);

  const heard = useRef('');
  const reply = useRef('');
  const greeting = useRef(getGreeting);
  const context = useRef(getContext);
  const [muted, setMuted] = useState(false);
  useEffect(() => {
    greeting.current = getGreeting;
    context.current = getContext;
  });

  const active = state.phase !== 'off';

  // Mientras dura la conversación el micrófono es de Yunta: el Modo guardia se aparta (micStore).
  useEffect(() => {
    if (!active) return;
    useMicStore.getState().hold(MIC_OWNER);
    return () => useMicStore.getState().release(MIC_OWNER);
  }, [active]);

  // En segundo plano o con el teléfono bloqueado, se corta.
  useEffect(() => {
    if (!active) return;
    const sub = AppState.addEventListener('change', (next) => {
      if (next !== 'active') {
        void Speech.stop();
        dispatch({ type: 'stop' });
      }
    });
    return () => sub.remove();
  }, [active]);

  useEffect(() => () => void Speech.stop(), []);

  // Mientras Yunta habla, la estela se anima (no mide nada: la voz del teléfono no entrega su volumen).
  const phase = state.phase;
  const yuntaTalking = phase === 'greeting' || phase === 'speaking' || phase === 'closing';
  useEffect(() => {
    if (!yuntaTalking) return;
    let tick = 0;
    const timer = setInterval(() => {
      tick += 1;
      pushUnit(phase, 0.25 + 0.55 * Math.abs(Math.sin(tick / 2.2)) * (0.6 + 0.4 * Math.random()));
    }, METER_EVERY_MS);
    return () => clearInterval(timer);
  }, [yuntaTalking, phase, pushUnit]);

  const start = useCallback(async () => {
    setError(null);
    if (!isSupabaseConfigured) {
      setError('La conversación por voz necesita conexión con el servidor de Yunta. Mientras tanto puedes escribirme.');
      return;
    }
    const permission = await AudioModule.requestRecordingPermissionsAsync();
    if (!permission.granted) {
      setError('Sin permiso de micrófono no puedo escucharte. Actívalo en los ajustes del teléfono.');
      return;
    }
    dispatch({ type: 'start' });
  }, []);

  const stop = useCallback(() => {
    void Speech.stop();
    setMuted(false);
    dispatch({ type: 'stop' });
  }, []);

  // 1) Yunta habla primero: el resumen del barrio.
  useEffect(() => {
    if (state.phase !== 'greeting') return;
    let cancelled = false;
    const text = greeting.current();
    add({ role: 'assistant', text });
    void speak(text).then(() => !cancelled && dispatch({ type: 'spoken' }));
    return () => {
      cancelled = true;
      void Speech.stop();
    };
  }, [state.phase, add]);

  // 2) Escucha un turno (se corta cuando te callas) y lo pasa a texto.
  useEffect(() => {
    if (state.phase !== 'listening' || muted) return;
    let cancelled = false;
    void (async () => {
      try {
        const clip = await recordTurn(recorder, () => cancelled, (db) => pushUnit('listening', levelToUnit(db)));
        if (cancelled) return;
        if (clip.end !== 'speech' || !clip.uri) return void dispatch({ type: 'silence' });
        const result = await transcribeAudio(clip.uri);
        if (cancelled) return;
        if (result.text === null) {
          if (result.reason === 'empty') return void dispatch({ type: 'silence' });
          setError(
            result.reason === 'limit'
              ? 'Se acabó el cupo de voz de hoy. Puedes seguir escribiéndome.'
              : 'Ahora no puedo pasar tu voz a texto. Puedes seguir escribiéndome.',
          );
          return void dispatch({ type: 'stop' });
        }
        const text = cleanTranscript(result.text);
        if (!text) return void dispatch({ type: 'silence' });
        heard.current = text;
        dispatch({ type: 'heard', text });
      } catch {
        if (cancelled) return;
        setError('Sin conexión: no puedo escucharte ahora. Puedes seguir escribiéndome.');
        dispatch({ type: 'stop' });
      }
    })();
    return () => {
      cancelled = true;
      void recorder.stop().catch(() => undefined);
    };
  }, [state.phase, state.silentTurns, muted, recorder, pushUnit]);

  // 3) Piensa la respuesta: emergencia sin IA, IA por el servidor o respuestas fijas.
  useEffect(() => {
    if (state.phase !== 'thinking') return;
    let cancelled = false;
    void (async () => {
      const question = heard.current;
      const safe = redactPersonalData(question);
      const past = useAssistantStore.getState().messages.map((m) => ({ role: m.role, text: m.text }));
      // Los datos reales del barrio van justo antes de la pregunta (así nunca quedan fuera de las últimas 10 vueltas).
      const facts = context.current?.().slice(0, 440);
      const history = facts
        ? [...past, { role: 'user' as const, text: `Datos actuales del barrio, solo para responder: ${facts}` }, { role: 'assistant' as const, text: 'Entendido.' }]
        : past;
      add({ role: 'user', text: safe.text });
      const answer = await resolveAnswer(question, history, { serverConfigured: isSupabaseConfigured, ask: askAssistant });
      if (cancelled) return;
      const { text, ...meta } = answer;
      add({ role: 'assistant', text, answer: meta });
      reply.current = text;
      dispatch({ type: 'answered' });
    })();
    return () => {
      cancelled = true;
    };
  }, [state.phase, add]);

  // 4) Lee la respuesta en voz alta y vuelve a escuchar.
  useEffect(() => {
    if (state.phase !== 'speaking') return;
    let cancelled = false;
    void speak(reply.current).then(() => !cancelled && dispatch({ type: 'spoken' }));
    return () => {
      cancelled = true;
      void Speech.stop();
    };
  }, [state.phase]);

  // 5) Se despide y se apaga.
  const closingReason = state.phase === 'closing' ? state.reason : null;
  useEffect(() => {
    if (!closingReason) return;
    let cancelled = false;
    void speak(FAREWELL[closingReason]).then(() => !cancelled && dispatch({ type: 'spoken' }));
    return () => {
      cancelled = true;
      void Speech.stop();
    };
  }, [closingReason]);

  const talking = state.phase === 'greeting' || state.phase === 'speaking' || state.phase === 'closing';
  const levels = trail.phase === state.phase ? trail.levels : [];
  const toggleMute = useCallback(() => setMuted((value) => !value), []);
  return { phase: state.phase, active, talking, levels, muted, toggleMute, error, start, stop };
}

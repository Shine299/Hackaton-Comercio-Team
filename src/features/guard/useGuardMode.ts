import { AudioModule, RecordingPresets, setAudioModeAsync, useAudioRecorder } from 'expo-audio';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import * as Speech from 'expo-speech';
import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { AppState, Linking, Platform, Vibration } from 'react-native';

import { EMERGENCY_NUMBERS, type EmergencyNumber, useEmergencyStore } from '@/features/emergency';
import { createEndpointer } from '@/features/assistant';
import { useOnboardingStore } from '@/features/onboarding';
import { useSectorStore } from '@/features/sector';
import { useSessionStore } from '@/features/session';
import { useGuardStatusStore } from '@/shared/nav/guardStatusStore';
import { useMicStore } from '@/shared/nav/micStore';
import { isSupabaseConfigured } from '@/shared/supabase/client';

import { peakLevel, shouldUploadClip, SPEECH_DB } from './audioGate';
import { type Coords, helpMessage, numberForNeed, smsUrl, spokenAlert, telUrl } from './dispatch';
import { CONFIRM_SECONDS, guardReducer, initialGuardState } from './flow';
import { ensureLocationPermission, getExactLocationOnce } from './location';
import { pauseReason, shouldListen } from './listening';
import { matchName, matchWakePhrase, type Need } from './phrases';
import { transcribeClip } from './repository';
import { useGuardStore } from './store';

/** Frases cortadas al callarte, mono 16 kHz, con medición de volumen para no subir el silencio (SPEC-052 / SPEC-053). */
const GUARD_PRESET = { ...RecordingPresets.HIGH_QUALITY, sampleRate: 16_000, numberOfChannels: 1, bitRate: 32_000, isMeteringEnabled: true };
const METER_EVERY_MS = 150;
const REPEAT_ALERT_MS = 15_000;
const KEEP_AWAKE_TAG = 'yunta-guardia';

/** Lo que muestra el panel de diagnóstico del Modo guardia (SPEC-053). */
export type GuardDebug = {
  /** Volumen máximo del último clip (dBFS); `null` si no hubo medición. */
  peakDb: number | null;
  /** Clips enviados a transcribir en esta sesión. */
  uploads: number;
  lastHeard: string | null;
  lastError: string | null;
  /** Por qué no se envió el último clip. */
  lastSkip: 'quiet' | 'short' | null;
};

const CONFIRM_PROMPT = 'Te escuché. ¿Necesitas ayuda? Di sí o no. Si no respondes, pediré ayuda.';

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/** Habla y espera a que termine. Mientras habla NO se graba: el teléfono no debe escucharse a sí mismo. */
function speak(text: string): Promise<void> {
  return new Promise((resolve) => {
    const safety = setTimeout(resolve, 20_000);
    const done = () => {
      clearTimeout(safety);
      resolve();
    };
    Speech.speak(text, { language: 'es-PE', rate: 0.95, onDone: done, onStopped: done, onError: done });
  });
}

type Recorder = ReturnType<typeof useAudioRecorder>;

/**
 * Graba UNA frase: empieza a grabar y corta cuando la persona habló y se calló (o a los 10 s, o a los 6 s sin voz).
 * Así cada archivo trae la frase completa —no partida entre dos clips— y se vuelve a grabar enseguida (SPEC-053).
 */
async function recordUtterance(recorder: Recorder, isCancelled: () => boolean) {
  await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: true });
  await recorder.prepareToRecordAsync();
  recorder.record();
  const endpointer = createEndpointer({ speechDb: SPEECH_DB, silenceMs: 900, noSpeechMs: 6000, maxMs: 10_000, minSpeechMs: 250, blindStopMs: 5000 });
  const levels: number[] = [];
  const startedAt = Date.now();
  let end: 'wait' | 'speech' | 'nospeech' = 'wait';
  while (!isCancelled() && end === 'wait') {
    await sleep(METER_EVERY_MS);
    const level = recorder.getStatus().metering;
    if (typeof level === 'number') levels.push(level);
    end = endpointer.update(level, Date.now() - startedAt);
  }
  const durationMs = recorder.getStatus().durationMillis;
  await recorder.stop();
  return { uri: recorder.uri, end: end === 'wait' ? ('nospeech' as const) : end, levels, durationMs };
}

/** Lo que se muestra después de pedir ayuda. Vive solo en memoria: la ubicación exacta no se guarda (ADR 0008). */
export type Dispatched = {
  need: Need;
  number: EmergencyNumber | null;
  telHref: string | null;
  smsHref: string | null;
  contactName: string;
  coords: Coords | null;
  locating: boolean;
};

/** Pedido al sector con la ubicación aproximada de siempre (solo sector), por el flujo normal de Emergencia. */
function queueSectorReport(need: Need) {
  const store = useEmergencyStore.getState();
  if (need === 'fire') {
    store.addIncident({ category: 'fire', detail: 'Pedido por voz (Modo guardia)' });
  } else {
    store.addHelp({
      type: need === 'ambulance' ? 'health' : 'other',
      immediateDanger: true,
      detail: need === 'police' ? 'Pedido por voz: ayuda de la policía' : 'Pedido por voz (Modo guardia)',
    });
  }
}

/**
 * Motor del Modo guardia por voz (SPEC-052). Escucha mientras se usa la app (no solo en su pantalla): sube solo los clips con sonido,
 * detecta «Yunta, ayúdame…», pregunta por voz, y si dices «sí» —o no respondes en 10 s— abre el marcador, prepara
 * el aviso con la ubicación exacta (una vez, sin guardarla) y avisa al sector.
 */
export function useGuardMode({ onWake }: { onWake?: () => void } = {}) {
  const [state, dispatch] = useReducer(guardReducer, initialGuardState);
  const stateRef = useRef(state);
  const wakeRef = useRef(onWake);
  useEffect(() => {
    stateRef.current = state;
    wakeRef.current = onWake;
  });
  // Lo que ve el panel de diagnóstico de los Ajustes (SPEC-053): qué mide, qué sube y qué entiende.
  const [debug, setDebug] = useState<GuardDebug>({ peakDb: null, uploads: 0, lastHeard: null, lastError: null, lastSkip: null });

  const [speaking, setSpeaking] = useState(false);
  const [voiceOk, setVoiceOk] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState<Dispatched | null>(null);
  const uploads = useRef(0);
  const speakingRef = useRef(false);
  const recorder = useAudioRecorder(GUARD_PRESET);

  const enabled = useGuardStore((s) => s.enabled);
  const consented = useGuardStore((s) => s.consented);
  const setEnabled = useGuardStore((s) => s.setEnabled);
  const onboarded = useOnboardingStore((s) => s.completed);
  const micBusy = useMicStore((s) => s.holders.length > 0);
  const [appActive, setAppActive] = useState(AppState.currentState === 'active');

  // Solo se escucha con la app a la vista: en segundo plano o con el teléfono bloqueado se pausa (ADR 0008).
  useEffect(() => {
    const sub = AppState.addEventListener('change', (next) => setAppActive(next === 'active'));
    return () => sub.remove();
  }, []);

  const active = state.phase === 'listening' || state.phase === 'confirming';
  const listen = shouldListen({ enabled, consented, appActive, micBusy, onboarded });
  const recordingNow = active && listen && !speaking;

  // Lo lee la cabecera para mostrar el indicador «Guardia activa» (el micrófono nunca escucha a escondidas).
  useEffect(() => {
    useGuardStatusStore.getState().setListening(recordingNow);
    return () => useGuardStatusStore.getState().setListening(false);
  }, [recordingNow]);

  const say = useCallback(async (text: string) => {
    speakingRef.current = true;
    setSpeaking(true);
    try {
      await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: false });
      await speak(text);
    } finally {
      speakingRef.current = false;
      setSpeaking(false);
    }
  }, []);

  const start = useCallback(async () => {
    setError(null);
    if (!isSupabaseConfigured) {
      setError('La escucha por voz necesita conexión con el servidor de Yunta. Mientras tanto, usa el botón SOS.');
      return;
    }
    const permission = await AudioModule.requestRecordingPermissionsAsync();
    if (!permission.granted) {
      setError('Sin permiso de micrófono no puedo escucharte. Actívalo en los ajustes del teléfono.');
      return;
    }
    // Se pide ahora, no en plena emergencia. Si la niegan, se sigue con solo el sector.
    await ensureLocationPermission();
    uploads.current = 0;
    setVoiceOk(true);
    setSent(null);
    setEnabled(true);
    dispatch({ type: 'start' });
  }, [setEnabled]);

  const stop = useCallback(() => {
    void Speech.stop();
    setSent(null);
    setEnabled(false);
    dispatch({ type: 'stop' });
  }, [setEnabled]);

  // Al volver a abrir la app, si estaba activa se reanuda sola (sin pedir permisos: si ya no los hay, se apaga).
  const resumed = useRef(false);
  useEffect(() => {
    if (resumed.current || !enabled || !consented || !onboarded) return;
    resumed.current = true;
    void (async () => {
      const permission = await AudioModule.getRecordingPermissionsAsync().catch(() => null);
      if (isSupabaseConfigured && permission?.granted) {
        dispatch({ type: 'start' });
      } else {
        setEnabled(false);
        setError('La guardia se apagó porque ya no tengo permiso de micrófono o conexión con el servidor. Puedes volver a activarla.');
      }
    })();
  }, [enabled, consented, onboarded, setEnabled]);

  // Pantalla encendida mientras la guardia escucha, para que un teléfono dejado sobre la mesa siga atento.
  const keepAwake = state.phase !== 'idle' && appActive;
  useEffect(() => {
    if (!keepAwake) return;
    void activateKeepAwakeAsync(KEEP_AWAKE_TAG);
    return () => void deactivateKeepAwake(KEEP_AWAKE_TAG);
  }, [keepAwake]);

  // Al salir de la pantalla se corta todo.
  useEffect(() => () => void Speech.stop(), []);

  // Entra la confirmación: vibra y pregunta en voz alta.
  const confirmingEntered = state.phase === 'confirming' && state.secondsLeft === CONFIRM_SECONDS;
  useEffect(() => {
    if (!confirmingEntered) return;
    Vibration.vibrate([0, 300, 150, 300]);
    // Fuera del efecto síncrono: `say` actualiza el estado de «hablando».
    const timer = setTimeout(() => void say(CONFIRM_PROMPT), 0);
    return () => clearTimeout(timer);
  }, [confirmingEntered, say]);

  // Cuenta regresiva: corre solo cuando el teléfono terminó de hablar.
  useEffect(() => {
    if (state.phase !== 'confirming' || speaking) return;
    const timer = setInterval(() => dispatch({ type: 'tick' }), 1000);
    return () => clearInterval(timer);
  }, [state.phase, speaking]);

  // Escucha: clips cortos; solo los que tienen sonido se suben a transcribir.
  useEffect(() => {
    if (!recordingNow) return;
    let cancelled = false;
    const isCancelled = () => cancelled;

    // Transcribe una frase en segundo plano: la grabación NO se detiene mientras tanto (sin huecos sordos).
    const handleUtterance = async (uri: string, sentCount: number) => {
      const result = await transcribeClip(uri).catch((e: unknown) => {
        setDebug((d) => ({ ...d, lastError: e instanceof Error ? e.message : 'No se pudo enviar el clip' }));
        return null;
      });
      if (cancelled) return;
      if (!result || result.text === null) {
        setVoiceOk(false);
        if (result) setDebug((d) => ({ ...d, uploads: sentCount, lastError: `El servidor no entendió la frase (${result.reason})` }));
        else setDebug((d) => ({ ...d, uploads: sentCount }));
        return;
      }
      setVoiceOk(true);
      setDebug((d) => ({ ...d, uploads: sentCount, lastHeard: result.text, lastError: null }));
      const phase = stateRef.current.phase;
      // Emergencia («Yunta, ayúdame…») tiene prioridad; «Hola Yunta» solo abre la conversación (SPEC-053).
      if (phase === 'listening' && !matchWakePhrase(result.text) && matchName(result.text)) {
        wakeRef.current?.();
      } else {
        dispatch({ type: phase === 'confirming' ? 'answer' : 'heard', text: result.text });
      }
    };

    void (async () => {
      while (!cancelled) {
        try {
          const clip = await recordUtterance(recorder, isCancelled);
          if (cancelled) return;
          const peakDb = peakLevel(clip.levels);
          setDebug((d) => ({ ...d, peakDb: Number.isFinite(peakDb) ? Math.round(peakDb) : null }));
          // Nadie habló en este tramo: se vuelve a grabar enseguida, sin subir nada.
          if (clip.end === 'nospeech' || !clip.uri) {
            setDebug((d) => ({ ...d, lastSkip: 'quiet' }));
            continue;
          }
          const decision = shouldUploadClip({
            peakDb,
            durationMs: clip.durationMs,
            uploadsThisSession: uploads.current,
            hasMetering: clip.levels.length > 0,
          });
          setDebug((d) => ({ ...d, lastSkip: decision.upload ? null : decision.reason === 'cap' ? null : decision.reason }));
          if (!decision.upload) {
            if (decision.reason === 'cap') {
              setError('Llegué al tope de escucha de esta sesión para cuidar el cupo gratuito. Vuelve a activar la guardia si la necesitas.');
              stop();
              return;
            }
            continue;
          }
          uploads.current += 1;
          void handleUtterance(clip.uri, uploads.current);
        } catch (e) {
          setDebug((d) => ({ ...d, lastError: e instanceof Error ? e.message : 'Error al escuchar' }));
          await sleep(1000);
        }
      }
    })();

    return () => {
      cancelled = true;
      void recorder.stop().catch(() => undefined);
    };
  }, [recordingNow, recorder, stop]);

  // Despacho: marcador + aviso al sector + ubicación exacta (una vez) + mensaje al contacto.
  const dispatchingNeed = state.phase === 'dispatching' ? state.need : null;
  useEffect(() => {
    if (!dispatchingNeed) return;
    const need = dispatchingNeed;
    const sectorName = useSectorStore.getState().sector.name;
    const { contactName, contactPhone } = useGuardStore.getState();
    const session = useSessionStore.getState();
    const name = session.registered ? session.displayName : undefined;
    const number = numberForNeed(need, EMERGENCY_NUMBERS);
    const platform = Platform.OS === 'ios' ? 'ios' : 'android';
    const smsFor = (message: string) => (contactPhone.trim() ? smsUrl(contactPhone, message, platform) : null);

    // Fuera del efecto síncrono (y cancelable): corre una sola vez por pedido de ayuda.
    const timer = setTimeout(() => {
      queueSectorReport(need);
      const telHref = number ? telUrl(number.number) : null;
      setSent({
        need,
        number,
        telHref,
        smsHref: smsFor(helpMessage({ need, sectorName, coords: null, name })),
        contactName,
        coords: null,
        locating: true,
      });
      // Lo primero y más importante: el marcador, ya marcado. Alguien debe tocar «Llamar».
      if (telHref) {
        void Linking.openURL(telHref).catch(() => setError('No pude abrir el marcador. Marca el número a mano.'));
      }
      // La ubicación exacta se busca en paralelo y NO se guarda en ningún lado.
      void getExactLocationOnce().then((coords) => {
        setSent((prev) =>
          prev ? { ...prev, coords, locating: false, smsHref: smsFor(helpMessage({ need, sectorName, coords, name })) } : prev,
        );
      });
    }, 0);
    return () => clearTimeout(timer);
  }, [dispatchingNeed]);

  // Mientras se pide ayuda, el teléfono repite el aviso en voz alta para quien esté cerca.
  useEffect(() => {
    if (!dispatchingNeed) return;
    const sectorName = useSectorStore.getState().sector.name;
    const number = numberForNeed(dispatchingNeed, EMERGENCY_NUMBERS);
    if (!number) return;
    const text = spokenAlert({ need: dispatchingNeed, number: number.number, sectorName });
    const repeat = () => {
      if (!speakingRef.current) void say(text);
    };
    repeat();
    const timer = setInterval(repeat, REPEAT_ALERT_MS);
    return () => clearInterval(timer);
  }, [dispatchingNeed, say]);

  const cancel = useCallback(() => {
    void Speech.stop();
    dispatch({ type: 'cancel' });
  }, []);

  /** Botón «Necesito ayuda ahora»: salta la cuenta regresiva. */
  const confirmNow = useCallback(() => {
    void Speech.stop();
    dispatch({ type: 'answer', text: 'sí' });
  }, []);

  const helped = useCallback(() => {
    void Speech.stop();
    setSent(null);
    dispatch({ type: 'helped' });
  }, []);

  const paused = pauseReason({ enabled, consented, appActive, micBusy, onboarded });
  return {
    state,
    speaking,
    voiceOk,
    error,
    sent,
    enabled,
    listening: recordingNow,
    debug: { ...debug, pausedBecause: paused ?? (speaking ? 'Yunta está hablando.' : null) },
    start,
    stop,
    cancel,
    confirmNow,
    helped,
  };
}

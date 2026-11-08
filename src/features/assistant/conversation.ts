/**
 * Conversación por voz con Yunta (SPEC-053). Código puro: cuándo termina de hablar la persona, cómo se despide y el orden de
 * los turnos (Yunta habla primero; nunca graba mientras habla).
 */

const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const GOODBYE = /\b(adios|chau|chao|hasta luego|nos vemos|eso es todo|nada mas|ya no necesito nada|terminar la conversacion|deja de escuchar)\b/;

/** Despedidas claras. No corta una pregunta que solo contiene una palabra parecida («terminar mi publicación»). */
export function isGoodbye(text: string): boolean {
  return GOODBYE.test(normalize(text));
}

/** Nivel mínimo (dBFS) para considerar que la persona habla. Valor inicial: se afina en un celular real. */
export const SPEECH_DB = -38;
/** Silencio después de hablar que cierra el turno. */
export const SILENCE_MS = 1000;
/** Sin voz en este tiempo, el turno cuenta como silencio. */
export const NO_SPEECH_MS = 7000;
/** Un turno nunca dura más que esto. */
export const MAX_TURN_MS = 15_000;
/** Un ruidito más corto que esto no cuenta como voz. */
export const MIN_SPEECH_MS = 300;
/** Si el teléfono no entrega medición de volumen, se corta a este tiempo para no quedarse sin escuchar. */
export const BLIND_STOP_MS = 6000;
const BLIND_DETECT_MS = 1500;

export type TurnEnd = 'wait' | 'speech' | 'nospeech';

/** Decide, muestra a muestra, si el turno de la persona ya terminó. `levelDb` es `undefined` si no hay medición. */
export function createEndpointer({
  speechDb = SPEECH_DB,
  silenceMs = SILENCE_MS,
  noSpeechMs = NO_SPEECH_MS,
  maxMs = MAX_TURN_MS,
  minSpeechMs = MIN_SPEECH_MS,
  blindStopMs = BLIND_STOP_MS,
}: {
  speechDb?: number;
  silenceMs?: number;
  noSpeechMs?: number;
  maxMs?: number;
  minSpeechMs?: number;
  blindStopMs?: number;
} = {}) {
  let firstLoud: number | undefined;
  let lastLoud = 0;
  let sawLevel = false;

  return {
    update(levelDb: number | undefined, elapsedMs: number): TurnEnd {
      if (typeof levelDb === 'number' && Number.isFinite(levelDb)) {
        sawLevel = true;
        if (levelDb >= speechDb) {
          if (firstLoud === undefined) firstLoud = elapsedMs;
          lastLoud = elapsedMs;
        }
      }

      // Sin medición de volumen: corta por tiempo fijo (criterio 12).
      if (!sawLevel && elapsedMs >= Math.max(blindStopMs, BLIND_DETECT_MS)) return 'speech';

      // Un ruidito corto seguido de silencio se descarta: no era voz.
      if (firstLoud !== undefined && elapsedMs - lastLoud >= silenceMs && lastLoud - firstLoud < minSpeechMs) firstLoud = undefined;

      if (elapsedMs >= maxMs) return firstLoud !== undefined ? 'speech' : 'nospeech';
      if (firstLoud === undefined) return elapsedMs >= noSpeechMs ? 'nospeech' : 'wait';
      return elapsedMs - lastLoud >= silenceMs ? 'speech' : 'wait';
    },
  };
}

export const MAX_SILENT_TURNS = 2;

export type ConversationState =
  | { phase: 'off'; silentTurns: 0 }
  | { phase: 'greeting' | 'listening' | 'thinking' | 'speaking'; silentTurns: number }
  | { phase: 'closing'; silentTurns: number; reason: 'goodbye' | 'idle' };

export type ConversationEvent =
  | { type: 'start' }
  | { type: 'stop' }
  /** Yunta terminó de hablar. */
  | { type: 'spoken' }
  /** La persona dijo algo (ya transcrito). */
  | { type: 'heard'; text: string }
  /** La persona no habló en el turno. */
  | { type: 'silence' }
  /** Ya hay respuesta (de la IA o fija) y se va a leer. */
  | { type: 'answered' };

export const initialConversation: ConversationState = { phase: 'off', silentTurns: 0 };

/** Máquina de estados: off → greeting → listening → thinking → speaking → listening… → closing → off. */
export function conversationReducer(state: ConversationState, event: ConversationEvent): ConversationState {
  if (event.type === 'start') return state.phase === 'off' ? { phase: 'greeting', silentTurns: 0 } : state;
  if (event.type === 'stop') return initialConversation;

  switch (state.phase) {
    case 'greeting':
      return event.type === 'spoken' ? { phase: 'listening', silentTurns: 0 } : state;

    case 'listening':
      if (event.type === 'heard') {
        return isGoodbye(event.text) ? { phase: 'closing', silentTurns: 0, reason: 'goodbye' } : { phase: 'thinking', silentTurns: 0 };
      }
      if (event.type === 'silence') {
        const silentTurns = state.silentTurns + 1;
        return silentTurns >= MAX_SILENT_TURNS ? { phase: 'closing', silentTurns, reason: 'idle' } : { phase: 'listening', silentTurns };
      }
      return state;

    case 'thinking':
      return event.type === 'answered' ? { phase: 'speaking', silentTurns: 0 } : state;

    case 'speaking':
      return event.type === 'spoken' ? { phase: 'listening', silentTurns: 0 } : state;

    case 'closing':
      return event.type === 'spoken' ? initialConversation : state;

    default:
      return state;
  }
}

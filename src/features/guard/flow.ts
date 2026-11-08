import { classifyNeed, matchWakePhrase, type Need, parseConfirmation } from './phrases';

/** Segundos para responder antes de pedir ayuda (SPEC-052). El silencio confirma: la persona puede estar inconsciente. */
export const CONFIRM_SECONDS = 10;

export type GuardState =
  | { phase: 'idle' }
  | { phase: 'listening' }
  | { phase: 'confirming'; need: Need; secondsLeft: number }
  | { phase: 'dispatching'; need: Need };

export type GuardEvent =
  | { type: 'start' }
  | { type: 'stop' }
  /** Texto transcrito mientras se escucha. */
  | { type: 'heard'; text: string }
  /** Texto transcrito como respuesta a la confirmación. */
  | { type: 'answer'; text: string }
  /** Pasó un segundo. */
  | { type: 'tick' }
  /** Botón «Estoy bien». */
  | { type: 'cancel' }
  /** Botón «Ya me ayudan». */
  | { type: 'helped' };

export const initialGuardState: GuardState = { phase: 'idle' };

/** Máquina de estados pura del Modo guardia: idle → listening → confirming → dispatching → listening. */
export function guardReducer(state: GuardState, event: GuardEvent): GuardState {
  if (event.type === 'start') return state.phase === 'idle' ? { phase: 'listening' } : state;
  if (event.type === 'stop') return { phase: 'idle' };

  switch (state.phase) {
    case 'listening':
      if (event.type === 'heard' && matchWakePhrase(event.text)) {
        return { phase: 'confirming', need: classifyNeed(event.text), secondsLeft: CONFIRM_SECONDS };
      }
      return state;

    case 'confirming':
      if (event.type === 'tick') {
        return state.secondsLeft <= 1 ? { phase: 'dispatching', need: state.need } : { ...state, secondsLeft: state.secondsLeft - 1 };
      }
      if (event.type === 'cancel') return { phase: 'listening' };
      if (event.type === 'answer') {
        const answer = parseConfirmation(event.text);
        if (answer === 'no') return { phase: 'listening' };
        if (answer === 'yes') {
          // Si en la respuesta aparece fuego o robo, manda esa pista sobre la primera.
          const said = classifyNeed(event.text);
          return { phase: 'dispatching', need: said === 'ambulance' ? state.need : said };
        }
      }
      return state;

    case 'dispatching':
      return event.type === 'helped' ? { phase: 'listening' } : state;

    default:
      return state;
  }
}

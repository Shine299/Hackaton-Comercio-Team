/**
 * Modo guardia por voz (SPEC-052). Lógica pura sobre el texto que devuelve la voz a texto:
 * detectar la frase de ayuda, elegir el servicio y entender la respuesta («sí» / «no»).
 * Aquí NO hay IA: solo reglas de palabras, para que una emergencia nunca dependa de un modelo.
 */

/** A quién se llama: ambulancia (SAMU), bomberos o policía. */
export type Need = 'ambulance' | 'fire' | 'police';

/** Minúsculas, sin tildes ni signos: «¡Ayúdame!» → «ayudame». */
export function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Whisper suele escribir «Yunta» como junta, yunda, yuta… Se aceptan porque la cuenta regresiva permite cancelar.
const NAME = /\b(yunta|junta|yunda|yuta|llunta|iunta)\b/;
const HELP = /\b(ayuda|ayudame|ayudenme|ayudeme|ayudanos|auxilio|socorro|emergencia)\b|\bme cai\b|\bme paso algo\b|\bme siento mal\b|\bme duele\b/;

const STRONG_NAME = /\b(yunta|yunda|yuta|llunta|iunta)\b/;
const GREETED_JUNTA = /\b(hola|oye|ey|hey|buenas)\s+junta\b/;

/**
 * ¿Dijeron el nombre de Yunta? (SPEC-053: «Hola Yunta» abre la conversación). «junta» sola NO cuenta, porque es una palabra
 * normal del barrio («la junta vecinal»); solo vale si la saludan («hola junta»).
 */
export function matchName(text: string): boolean {
  const t = normalize(text);
  return STRONG_NAME.test(t) || GREETED_JUNTA.test(t);
}

/** «Yunta» **y** una palabra de ayuda. Una sola cosa no basta: evita avisos falsos por una conversación cualquiera. */
export function matchWakePhrase(text: string): boolean {
  const t = normalize(text);
  return NAME.test(t) && HELP.test(t);
}

const FIRE = /\b(fuego|incendio|incendia\w*|humo|gas|quema\w*|llamas)\b/;
const POLICE = /\b(robo|robando|robar|robaron|ladron|ladrones|asalto|asaltando|persigue|persiguen|persiguiendo|secuestro|golpea|golpeando|violencia)\b/;

/** Fuego, humo o gas → bomberos; robo o violencia → policía; todo lo demás (caídas, dolor) → ambulancia. */
export function classifyNeed(text: string): Need {
  const t = normalize(text);
  if (FIRE.test(t)) return 'fire';
  if (POLICE.test(t)) return 'police';
  return 'ambulance';
}

export type Confirmation = 'yes' | 'no' | 'unknown';

const NEEDS_HELP = /\bno puedo\b|\bme duele\b/;
const CANCEL = /\b(no necesito|no hace falta|estoy bien|todo bien|falsa alarma|cancel\w*|ya paso)\b/;
const AFFIRM = /\b(si|ayuda|ayudame|ayudenme|auxilio|necesito|llamen|llama|socorro|por favor)\b/;

/**
 * Entiende la respuesta a «¿Necesitas ayuda?». Lo que no se entiende queda en `unknown` (el silencio lo decide el reloj).
 * «No estoy bien» pide ayuda; «No, estoy bien» (con coma) cancela. Si la coma no llega, se prefiere pedir ayuda.
 */
export function parseConfirmation(text: string): Confirmation {
  const t = normalize(text);
  if (!t) return 'unknown';
  // Se mira antes de quitar los signos: la coma es lo que distingue «no, estoy bien» de «no estoy bien».
  if (/\bno estoy bien\b/.test(text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''))) return 'yes';
  if (NEEDS_HELP.test(t)) return 'yes';
  if (CANCEL.test(t)) return 'no';
  if (/^no\b/.test(t)) return 'no';
  if (AFFIRM.test(t)) return 'yes';
  return 'unknown';
}

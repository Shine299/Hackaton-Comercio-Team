/**
 * Lógica pura del asistente (SPEC-049). Todo esto corre en el teléfono, ANTES de enviar nada:
 * una emergencia nunca pasa por la IA y los datos personales no salen del teléfono.
 */

export const MAX_QUESTION_LENGTH = 500;

const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');

/** Frases que indican peligro inmediato: se responde con el SOS y el 105 sin llamar a la IA. */
const EMERGENCY_PATTERNS = [
  /\bincendio\b/,
  /\bse (esta )?quemando\b/,
  /\bfuego\b/,
  /\bno respira\b/,
  /\binconsciente\b/,
  /\bdesmay/,
  /\binfarto\b/,
  /\bconvulsi/,
  /\bherid[oa]s?\b/,
  /\bsangr(a|ando|e mucho)\b/,
  /\b(me|nos|le|les) (esta|estan) (robando|asaltando|atacando|golpeando)\b/,
  /\b(robo|asalto) (en curso|ahora)\b/,
  /\bauxilio\b/,
  /\bsocorro\b/,
  /\bsismo\b/,
  /\bterremoto\b/,
  /\bfuga de gas\b/,
  /\bme quiero (matar|morir)\b/,
];

export function looksLikeEmergency(text: string): boolean {
  const t = normalize(text);
  return EMERGENCY_PATTERNS.some((re) => re.test(t));
}

const REDACTED = '[dato oculto]';
const PERSONAL_DATA = [
  /[\w.+-]+@[\w-]+\.[\w.-]+/g, // correos
  /(?:\+?51[\s-]?)?9\d{2}[\s-]?\d{3}[\s-]?\d{3}\b/g, // celulares de Perú
  /\b\d{8}\b/g, // DNI (8 dígitos)
];

/** Reemplaza teléfonos, correos y DNI por «[dato oculto]» antes de enviar la pregunta. */
export function redactPersonalData(text: string): { text: string; redacted: boolean } {
  let out = text;
  for (const re of PERSONAL_DATA) out = out.replace(re, REDACTED);
  return { text: out, redacted: out !== text };
}

export type QuestionCheck = { ok: true; text: string } | { ok: false; error: string };

export function checkQuestion(raw: string): QuestionCheck {
  const text = raw.replace(/\s+/g, ' ').trim();
  if (text.length === 0) return { ok: false, error: 'Escribe tu pregunta.' };
  if (text.length > MAX_QUESTION_LENGTH) return { ok: false, error: `Máximo ${MAX_QUESTION_LENGTH} caracteres.` };
  return { ok: true, text };
}

/** Respuesta para una emergencia: no pasa por la IA. */
export const EMERGENCY_REPLY =
  'Esto suena a una emergencia. Toca el botón SOS de arriba o llama ya al 105 (Policía), 116 (Bomberos) o 106 (SAMU). ' +
  'Yunta avisa a tus vecinos, pero no reemplaza a los servicios oficiales.';

/** Respuestas fijas (sin IA): respaldo cuando no hay red, servidor ni cupo. */
const FAQ: { keys: RegExp; answer: string }[] = [
  {
    keys: /\b(sos|emergencia|105|auxilio)\b/,
    answer:
      'El botón SOS (arriba, en todas las pantallas) abre Emergencia: puedes reportar o pedir auxilio sin crear cuenta. ' +
      'En peligro inmediato llama al 105 (Policía), 116 (Bomberos) o 106 (SAMU).',
  },
  {
    keys: /\bevento/,
    answer: 'Ve a Comunidad (Eventos) y toca «Crear evento». Tus vecinos podrán marcar «Voy»; solo se ve cuántos van, no quiénes.',
  },
  {
    keys: /\b(publica|publico|publicar|vender|vendo|prestar|presto|ofrecer|ofrezco|necesito|pedir)\b/,
    answer: 'En Ayuda toca «Publicar»: eliges si ofreces o necesitas algo, la categoría y un título claro.',
  },
  {
    keys: /\b(chat|escribir|mensaje|contactar|bloquear|reportar)\b/,
    answer:
      'En cualquier publicación toca «Escribir» y se abre un chat con esa persona. Desde el chat puedes bloquear o ' +
      'reportar un mensaje. No compartas tu teléfono ni tu dirección exacta.',
  },
  {
    keys: /\b(abierto|abre|cierra|tienda|restaurante|farmacia|bodega|lugar)/,
    answer:
      'En Negocios (Explorar) → Lugares ves tiendas, restaurantes y farmacias cerca. «Abierto ahora» solo aparece si el lugar ' +
      'publica su horario; si no, dice «Horario no confirmado».',
  },
  {
    keys: /\b(negocio|negocio)/,
    answer: 'Puedes registrar tu negocio gratis desde el menú (tu avatar o ☰) → «Registrar mi negocio». Aparecerá en Negocios.',
  },
  {
    keys: /\b(perfil|foto|nombre|cuenta)\b/,
    answer: 'Tu perfil está en el menú (tu avatar o ☰). Solo pedimos un nombre público; la foto es opcional y se queda en tu teléfono.',
  },
];

export function faqAnswer(question: string): string {
  const t = normalize(question);
  const hit = FAQ.find((f) => f.keys.test(t));
  return (
    hit?.answer ??
    'Por ahora no tengo una respuesta para eso. Puedes revisar Ayuda, Comunidad (Eventos) y Negocios (Explorar), o abrir el ' +
      'tutorial desde el menú.'
  );
}

/**
 * La IA suele responder con formato (negritas, viñetas, enlaces). La pantalla muestra texto simple, así que se
 * convierte antes de mostrarlo o leerlo en voz alta: sin asteriscos, con viñetas «•».
 */
export function plainText(raw: string): string {
  return raw
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1') // [texto](enlace) → texto
    .replace(/^#{1,6}\s+/gm, '') // encabezados
    .replace(/^\s*[-*]\s+/gm, '• ') // viñetas
    .replace(/(\*\*|__)(.+?)\1/g, '$2') // negritas
    .replace(/(?<![\w*])\*(?!\s)([^*\n]+?)(?<!\s)\*(?![\w*])/g, '$1') // cursivas con *
    .replace(/`([^`]+)`/g, '$1') // código
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export type AssistantTurn = { role: 'user' | 'assistant'; text: string };

/** Lo que devuelve el servidor: texto de la IA, o `null` con el motivo. */
export type ServerReply = { text: string; provider: string } | { text: null; reason: 'limit' | 'unavailable' };

export type AnswerSource = 'ai' | 'faq' | 'demo' | 'emergency';

export type Answer = {
  text: string;
  source: AnswerSource;
  /** Proveedor que respondió (solo `ai`). */
  provider?: string;
  /** Por qué no respondió la IA (solo `faq`). */
  reason?: 'limit' | 'unavailable' | 'offline';
  /** Se ocultaron datos personales de la pregunta. */
  redacted: boolean;
};

/**
 * Decide cómo contestar (SPEC-049): 1) emergencia → SOS y 105, sin IA; 2) se ocultan datos personales;
 * 3) sin servidor → respuestas fijas de demostración; 4) IA por el servidor; si no hay cupo, IA o red → respuestas fijas.
 * `ask` es la llamada al servidor (inyectada para probar).
 */
export async function resolveAnswer(
  question: string,
  history: AssistantTurn[],
  { serverConfigured, ask }: { serverConfigured: boolean; ask: (history: AssistantTurn[]) => Promise<ServerReply> },
): Promise<Answer> {
  if (looksLikeEmergency(question)) return { text: EMERGENCY_REPLY, source: 'emergency', redacted: false };

  const { text, redacted } = redactPersonalData(question);
  if (!serverConfigured) return { text: faqAnswer(text), source: 'demo', redacted };

  try {
    const reply = await ask([...history, { role: 'user', text }]);
    if (reply.text === null) return { text: faqAnswer(text), source: 'faq', reason: reply.reason, redacted };
    return { text: plainText(reply.text), source: 'ai', provider: reply.provider, redacted };
  } catch (e) {
    console.warn('[asistente]', e instanceof Error ? e.message : e);
    return { text: faqAnswer(text), source: 'faq', reason: 'offline', redacted };
  }
}

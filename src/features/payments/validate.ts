/** Aporte mínimo: S/ 1. */
export const MIN_CHARGE_CENTS = 100;
/** Tope por pago con Yape: S/ 500. */
export const MAX_YAPE_CENTS = 50_000;

const onlyDigits = (s: string) => s.replace(/\D/g, '');

/**
 * Revisa un aporte con Yape antes de enviarlo. Devuelve el motivo en lenguaje simple (para mostrarlo
 * junto al botón deshabilitado) o `null` si está todo bien.
 */
export function validateYapeCharge(input: { amountCents: number | null; phone: string; otp: string }): string | null {
  const { amountCents } = input;
  if (amountCents == null || !Number.isFinite(amountCents)) return 'Elige cuánto quieres aportar.';
  if (amountCents < MIN_CHARGE_CENTS) return 'El aporte mínimo es S/ 1.';
  if (amountCents > MAX_YAPE_CENTS) return 'Con Yape puedes aportar hasta S/ 500 por vez.';
  const phone = onlyDigits(input.phone);
  if (phone.length !== 9 || !phone.startsWith('9')) return 'Escribe tu celular de Yape: 9 dígitos, empieza con 9.';
  if (!/^\d{6}$/.test(input.otp.trim())) return 'Escribe el código de aprobación de 6 dígitos que ves en Yape.';
  return null;
}

/** «20», «15,50» o «15.5» → céntimos. `null` si no es un número. */
export function parseSolesInput(text: string): number | null {
  const normalized = text.trim().replace(',', '.');
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return null;
  return Math.round(Number(normalized) * 100);
}

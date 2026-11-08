/**
 * ¿Debe estar escuchando el Modo guardia ahora mismo? (SPEC-052 / ADR 0008). Escucha mientras se usa la app:
 * solo si la persona la activó y dio su consentimiento, la app está a la vista (no en segundo plano ni bloqueada),
 * terminó el tutorial y ninguna otra función está grabando.
 */
export function shouldListen({
  enabled,
  consented,
  appActive,
  micBusy,
  onboarded,
}: {
  enabled: boolean;
  consented: boolean;
  appActive: boolean;
  micBusy: boolean;
  onboarded: boolean;
}): boolean {
  return enabled && consented && appActive && !micBusy && onboarded;
}

/** Por qué NO está escuchando ahora, en palabras de la persona (panel de diagnóstico). `null` = sí escucha. */
export function pauseReason(input: {
  enabled: boolean;
  consented: boolean;
  appActive: boolean;
  micBusy: boolean;
  onboarded: boolean;
}): string | null {
  if (!input.enabled) return 'La guardia está apagada.';
  if (!input.consented) return 'Falta tu consentimiento.';
  if (!input.onboarded) return 'Estás en el tutorial inicial.';
  if (!input.appActive) return 'La app está en segundo plano.';
  if (input.micBusy) return 'Otra función está usando el micrófono (nota de voz, asistente o conversación).';
  return null;
}

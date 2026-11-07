/**
 * Distancia aproximada para mostrar al público.
 * Se redondea (50 m / 0,1 km) para no revelar posiciones exactas.
 */
export function formatApproxDistance(meters: number): string {
  if (meters <= 0) return 'En tu sector';
  if (meters < 1000) {
    const rounded = Math.max(50, Math.round(meters / 50) * 50);
    return `A ${rounded} m`;
  }
  const km = Math.round(meters / 100) / 10;
  return `A ${km.toString().replace('.', ',')} km`;
}

/** Tiempo transcurrido en lenguaje cotidiano: «Hace 25 min», «Hace 3 h», «Ayer», «Hace 4 días». */
export function formatRelativeTime(from: Date | number, now: Date | number = Date.now()): string {
  const diffMin = Math.max(0, Math.round((+now - +from) / 60_000));
  if (diffMin < 1) return 'Ahora';
  if (diffMin < 60) return `Hace ${diffMin} min`;
  const hours = Math.round(diffMin / 60);
  if (hours < 24) return `Hace ${hours} h`;
  const days = Math.round(hours / 24);
  if (days === 1) return 'Ayer';
  return `Hace ${days} días`;
}

/** Vigencia restante: «Vence en 3 días», «Vence hoy». */
export function formatExpiry(expiresAt: Date | number, now: Date | number = Date.now()): string {
  const hours = Math.round((+expiresAt - +now) / 3_600_000);
  if (hours <= 0) return 'Vencida';
  if (hours < 24) return 'Vence hoy';
  const days = Math.round(hours / 24);
  return days === 1 ? 'Vence mañana' : `Vence en ${days} días`;
}

/**
 * Trayecto acompañado: un temporizador y unos vecinos de confianza. Sin ubicación en vivo (regla del
 * proyecto: ubicación siempre aproximada); solo se comparte el sector.
 */
export type WalkSession = {
  id: string;
  /** Nombres de los vecinos de confianza elegidos (1 a 3). */
  guardians: string[];
  minutes: number;
  startedAt: number;
  arrivedAt: number | null;
  /** Notificación local programada para la hora de llegada. */
  notificationId?: string;
};

export type WalkPhase = 'walking' | 'overdue' | 'arrived';

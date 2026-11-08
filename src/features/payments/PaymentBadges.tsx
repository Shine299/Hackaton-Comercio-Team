import { Badge, type BadgeTone, type IconName } from '@/shared/ui';

import type { FailureReason, PaymentMode, PaymentStatus } from './types';

const STATUS: Record<PaymentStatus, { label: string; tone: BadgeTone; icon: IconName }> = {
  processing: { label: 'Procesando…', tone: 'neutral', icon: 'progress-clock' },
  confirmed: { label: 'Aporte confirmado', tone: 'success', icon: 'check-circle' },
  failed: { label: 'No se cobró nada', tone: 'warning', icon: 'close-circle-outline' },
};

/** Estado de un pago, siempre con texto e icono. «Confirmado» solo con respuesta del proveedor. */
export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const s = STATUS[status];
  return <Badge label={s.label} tone={s.tone} icon={s.icon} />;
}

export const PAYMENT_MODE_LABEL: Record<PaymentMode, string> = {
  mock: 'Pago simulado',
  sandbox: 'Pago de prueba',
  live: 'Pago real',
};

/** Etiqueta visible del modo: en simulado y prueba nunca se mueve dinero real. */
export function PaymentModeTag({ mode }: { mode: PaymentMode }) {
  if (mode === 'live') return null;
  return <Badge label={PAYMENT_MODE_LABEL[mode]} tone="warning" icon="flask-outline" />;
}

/** Explicación de un fallo en lenguaje simple. Todas dejan claro que no se cobró. */
export const FAILURE_TEXT: Record<FailureReason, string> = {
  offline: 'Parece que no hay conexión. Cuando vuelva la señal, inténtalo otra vez con un código de Yape nuevo.',
  invalid: 'Revisa tu número de Yape y el código de aprobación.',
  declined: 'Yape no aprobó el pago. Revisa el código o pide uno nuevo.',
  timeout: 'La pasarela no respondió a tiempo. Inténtalo otra vez con un código de Yape nuevo.',
  error: 'Algo salió mal al procesar. Inténtalo otra vez en un momento.',
};

/**
 * Pagos (ADR 0005): solo en línea, una llamada, idempotente. Nunca pasan por el outbox.
 * `mode` no es un estado: dice si el dinero es simulado, de prueba (sandbox) o real.
 */
export type PaymentMode = 'mock' | 'sandbox' | 'live';

/** Estado visible de un intento de pago. «confirmed» solo con respuesta del proveedor. */
export type PaymentStatus = 'processing' | 'confirmed' | 'failed';

export type PaymentMethod = 'yape';

export type FailureReason = 'offline' | 'invalid' | 'declined' | 'timeout' | 'error';

export type ChargeRequest = {
  /** UUID del cliente: repetir con la misma clave nunca cobra dos veces. */
  idempotencyKey: string;
  fundId: string;
  /** Céntimos enteros. */
  amountCents: number;
  method: PaymentMethod;
  yape: { phone: string; otp: string };
};

export type ChargeResult =
  | { status: 'confirmed'; chargeId: string; mode: PaymentMode }
  | { status: 'failed'; reason: FailureReason; mode: PaymentMode; chargeId?: undefined };

export interface PaymentsProvider {
  readonly mode: PaymentMode;
  charge(req: ChargeRequest): Promise<ChargeResult>;
}

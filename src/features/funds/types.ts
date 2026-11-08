import type { PaymentMode } from '@/features/payments';

/** `iniciativa`: meta y fecha límite (cámaras, luminarias). `animal`: fondo permanente del perrito comunitario. */
export type FundKind = 'iniciativa' | 'animal';

/** Gasto rendido por quien organiza. La boleta es lo que genera confianza. */
export type FundExpense = {
  id: string;
  label: string;
  amountCents: number;
  hasReceipt: boolean;
};

export type Fund = {
  id: string;
  sectorId: string;
  kind: FundKind;
  title: string;
  description: string;
  /** Quién organiza y recibe el dinero (junta vecinal, vecina responsable). Siempre visible. */
  organizer: string;
  /** Meta en céntimos; `null` en fondos permanentes. */
  goalCents: number | null;
  /** Lo reunido según el servidor (o la demo), en céntimos. */
  raisedCents: number;
  contributors: number;
  /** Fecha límite (ms) o `null` si no tiene. */
  deadline: number | null;
  expenses: FundExpense[];
  isDemo: boolean;
};

/** Aporte confirmado por el proveedor y guardado en este teléfono (para que la barra lo refleje). */
export type LocalContribution = {
  /** = idempotencyKey del pago. */
  id: string;
  fundId: string;
  amountCents: number;
  anonymous: boolean;
  mode: PaymentMode;
  chargeId: string;
  createdAt: number;
};

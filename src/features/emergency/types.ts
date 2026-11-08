import type { IconName } from '@/shared/ui';

/** Tipos de ayuda para «Necesito ayuda». */
export const HELP_TYPES = [
  { id: 'health', label: 'Salud o herida', icon: 'medical-bag' },
  { id: 'trapped', label: 'Estoy atrapado/a', icon: 'home-alert-outline' },
  { id: 'evacuation', label: 'Necesito evacuar', icon: 'exit-run' },
  { id: 'water_food', label: 'Agua o alimentos', icon: 'water-outline' },
  { id: 'shelter', label: 'Refugio', icon: 'home-heart' },
  { id: 'other', label: 'Otro', icon: 'help-circle-outline' },
] as const satisfies readonly { id: string; label: string; icon: IconName }[];

export type HelpType = (typeof HELP_TYPES)[number]['id'];

/** Categorías de incidente (docs 02_ux_ui §10). */
export const INCIDENT_CATEGORIES = [
  { id: 'fire', label: 'Incendio', icon: 'fire' },
  { id: 'flood', label: 'Inundación', icon: 'home-flood' },
  { id: 'collapse', label: 'Derrumbe', icon: 'home-remove-outline' },
  { id: 'electrical', label: 'Riesgo eléctrico', icon: 'flash-alert-outline' },
  { id: 'blocked_road', label: 'Vía bloqueada', icon: 'road-variant' },
  { id: 'other', label: 'Otro peligro', icon: 'alert-outline' },
] as const satisfies readonly { id: string; label: string; icon: IconName }[];

export type IncidentCategory = (typeof INCIDENT_CATEGORIES)[number]['id'];

/**
 * Estado de seguimiento de un reporte de emergencia. Es más amplio que `SyncStatus` porque incluye
 * la coordinación humana. Regla: «recibido» nunca significa «validado».
 * En esta etapa no hay servidor: el estado real siempre es `local`.
 */
export const INCIDENT_FLOW = [
  'local',
  'pending',
  'received',
  'in_review',
  'validated',
  'coordinated',
  'resolved',
] as const;
export const INCIDENT_ALT = ['duplicate', 'unverifiable', 'dismissed'] as const;

export type IncidentStatus = (typeof INCIDENT_FLOW)[number] | (typeof INCIDENT_ALT)[number];

export const INCIDENT_STATUS_INFO: Record<
  IncidentStatus,
  { label: string; description: string; icon: IconName; tone: 'warning' | 'primary' | 'secondary' | 'success' | 'neutral' }
> = {
  local: {
    label: 'Guardado en tu teléfono',
    description: 'Solo existe en este dispositivo. Todavía no se envió a nadie.',
    icon: 'cellphone-check',
    tone: 'warning',
  },
  pending: {
    label: 'Pendiente de enviar',
    description: 'Se enviará cuando haya conexión.',
    icon: 'clock-outline',
    tone: 'warning',
  },
  received: {
    label: 'Recibido',
    description: 'El servidor lo tiene. Aún no está validado por nadie.',
    icon: 'cloud-check-outline',
    tone: 'primary',
  },
  in_review: {
    label: 'En revisión',
    description: 'Una persona lo está revisando.',
    icon: 'eye-outline',
    tone: 'secondary',
  },
  validated: {
    label: 'Validado',
    description: 'Una persona autorizada lo confirmó.',
    icon: 'check-decagram-outline',
    tone: 'success',
  },
  coordinated: {
    label: 'Atención coordinada',
    description: 'Vecinos o brigadas coordinan la respuesta.',
    icon: 'account-group-outline',
    tone: 'success',
  },
  resolved: {
    label: 'Resuelto',
    description: 'La situación quedó atendida.',
    icon: 'check-circle-outline',
    tone: 'success',
  },
  duplicate: {
    label: 'Duplicado',
    description: 'Ya existía otro reporte del mismo hecho; se agrupan.',
    icon: 'content-duplicate',
    tone: 'neutral',
  },
  unverifiable: {
    label: 'No verificable',
    description: 'No se pudo confirmar con la información disponible.',
    icon: 'help-circle-outline',
    tone: 'neutral',
  },
  dismissed: {
    label: 'Descartado',
    description: 'Se revisó y no requiere atención.',
    icon: 'close-circle-outline',
    tone: 'neutral',
  },
};

/** ¿Cuántas personas necesitan ayuda? Solo un rango: nunca nombres ni datos de las personas. */
export const PEOPLE_COUNTS = [
  { id: 'one', label: '1 persona', icon: 'account-outline' },
  { id: 'few', label: '2 a 5', icon: 'account-multiple-outline' },
  { id: 'many', label: '6 o más', icon: 'account-group-outline' },
] as const satisfies readonly { id: string; label: string; icon: IconName }[];
export type PeopleCount = (typeof PEOPLE_COUNTS)[number]['id'];

/** ¿Hay personas en riesgo? «No sé» es una respuesta válida: nadie está obligado a adivinar. */
export const AT_RISK_OPTIONS = [
  { id: 'yes', label: 'Sí', icon: 'alert-octagon-outline' },
  { id: 'no', label: 'No', icon: 'shield-check-outline' },
  { id: 'unknown', label: 'No sé', icon: 'help-circle-outline' },
] as const satisfies readonly { id: string; label: string; icon: IconName }[];
export type AtRisk = (typeof AT_RISK_OPTIONS)[number]['id'];

export type EmergencyReport = {
  id: string;
  kind: 'help' | 'incident';
  /** Para `help`: HelpType. Para `incident`: IncidentCategory. */
  category: HelpType | IncidentCategory;
  immediateDanger: boolean;
  detail: string;
  photoUri?: string;
  peopleCount?: PeopleCount;
  peopleAtRisk?: AtRisk;
  /** Zona aproximada: solo el sector. Nunca coordenadas del dispositivo. */
  sectorId: string;
  sectorName: string;
  createdAt: number;
  status: IncidentStatus;
  outboxId: string;
};

/** Ciclo de recursos (docs 02_ux_ui §10 «Recursos»). */
export const RESOURCE_STAGES = ['offered', 'reserved', 'assigned', 'delivered', 'confirmed'] as const;
export type ResourceStage = (typeof RESOURCE_STAGES)[number] | 'cancelled';

export const RESOURCE_STAGE_LABEL: Record<ResourceStage, string> = {
  offered: 'Ofrecido',
  reserved: 'Reservado',
  assigned: 'Asignado',
  delivered: 'Entregado',
  confirmed: 'Confirmado',
  cancelled: 'Cancelado',
};

export const RESOURCE_KINDS = [
  { id: 'water', label: 'Agua', icon: 'water-outline' },
  { id: 'food', label: 'Alimentos', icon: 'food-apple-outline' },
  { id: 'shelter', label: 'Alojamiento', icon: 'home-heart' },
  { id: 'transport', label: 'Transporte', icon: 'car-outline' },
  { id: 'first_aid', label: 'Primeros auxilios', icon: 'medical-bag' },
  { id: 'tools', label: 'Herramientas', icon: 'hammer-wrench' },
  { id: 'hands', label: 'Mano de obra', icon: 'hand-heart-outline' },
] as const satisfies readonly { id: string; label: string; icon: IconName }[];

export type ResourceKind = (typeof RESOURCE_KINDS)[number]['id'];

export type ResourceOffer = {
  id: string;
  resource: ResourceKind;
  note: string;
  sectorId: string;
  sectorName: string;
  createdAt: number;
  stage: ResourceStage;
  outboxId: string;
  isDemo: boolean;
  /** Cantidad total ofrecida (opcional). */
  quantity?: number;
  /** Unidades ya entregadas (entregas parciales). Nunca supera `quantity`. */
  delivered?: number;
  /** `true` solo cuando el servidor confirmó que tiene la oferta. */
  synced?: boolean;
};

export function getHelpType(id: string) {
  return HELP_TYPES.find((h) => h.id === id) ?? HELP_TYPES[HELP_TYPES.length - 1];
}

export function getIncidentCategory(id: string) {
  return INCIDENT_CATEGORIES.find((c) => c.id === id) ?? INCIDENT_CATEGORIES[INCIDENT_CATEGORIES.length - 1];
}

export function getResourceKind(id: string) {
  return RESOURCE_KINDS.find((r) => r.id === id) ?? RESOURCE_KINDS[0];
}

/** «Ayudar a un vecino vulnerable»: tarjetas de necesidad preconfiguradas (sin diagnóstico). */
export const VULNERABLE_NEEDS = [
  { id: 'company', label: 'Ver cómo está y acompañar', icon: 'account-heart-outline' },
  { id: 'mobility', label: 'Ayuda para moverse o evacuar', icon: 'wheelchair-accessibility' },
  { id: 'medical', label: 'Atención médica o medicinas', icon: 'medical-bag' },
  { id: 'communication', label: 'Apoyo para comunicarse', icon: 'message-text-outline' },
  { id: 'supplies', label: 'Agua, comida o abrigo', icon: 'water-outline' },
  { id: 'other', label: 'Otra necesidad', icon: 'help-circle-outline' },
] as const satisfies readonly { id: string; label: string; icon: IconName }[];

export type VulnerableNeed = (typeof VULNERABLE_NEEDS)[number]['id'];

/** Cómo se enteró quien reporta (docs 03 §5). Diferencia «reportado por un tercero» de «confirmado por el afectado». */
export const REPORT_BASES = [
  { id: 'present', label: 'La persona está conmigo', hint: 'Estoy con ella ahora mismo.', icon: 'account-check-outline' },
  { id: 'authorized', label: 'La persona me autorizó', hint: 'Me pidió o aceptó que avise.', icon: 'handshake-outline' },
  { id: 'observed', label: 'Es una observación urgente', hint: 'La vi o me enteré, sin hablar con ella.', icon: 'eye-outline' },
] as const satisfies readonly { id: string; label: string; hint: string; icon: IconName }[];

export type ReportBasis = (typeof REPORT_BASES)[number]['id'];

export type VulnerableAlert = {
  id: string;
  need: VulnerableNeed;
  basis: ReportBasis;
  /** Privados: se quedan en el teléfono y nunca se publican. */
  detail: string;
  diagnosis: string;
  photoUri?: string;
  voiceUsed: boolean;
  /** Ruta local de la nota de voz grabada. Privada: nunca se envía. */
  voiceUri?: string;
  sectorId: string;
  sectorName: string;
  createdAt: number;
  /** Estado de la emergencia (no de la condición). `local` hasta que exista servidor y validación humana. */
  status: IncidentStatus;
  outboxId: string;
};

export function getVulnerableNeed(id: string) {
  return VULNERABLE_NEEDS.find((n) => n.id === id) ?? VULNERABLE_NEEDS[VULNERABLE_NEEDS.length - 1];
}

export function getReportBasis(id: string) {
  return REPORT_BASES.find((b) => b.id === id) ?? REPORT_BASES[REPORT_BASES.length - 1];
}

/** Descripción pública: zona aproximada y tipo general de necesidad. Nunca identifica a la persona. */
export function publicSummary(alert: Pick<VulnerableAlert, 'need' | 'sectorName'>): string {
  return `Una persona en ${alert.sectorName} podría necesitar: ${getVulnerableNeed(alert.need).label.toLowerCase()}.`;
}

import type { IconName } from '@/shared/ui';

import { getDemoResources } from './demoResources';
import {
  getHelpType,
  getIncidentCategory,
  getResourceKind,
  getVulnerableNeed,
  INCIDENT_STATUS_INFO,
  publicSummary,
  RESOURCE_STAGE_LABEL,
  type EmergencyReport,
  type ResourceOffer,
  type VulnerableAlert,
} from './types';

export type BoardSection = 'vulnerable' | 'incident' | 'need' | 'resource';

/**
 * Un renglón del tablero. La prioridad no es una decisión opaca: cada elemento declara motivo,
 * fuente, hora y estado de validación (docs 03 §7).
 */
export type BoardItem = {
  id: string;
  section: BoardSection;
  title: string;
  zone: string;
  /** Por qué aparece con esta prioridad. */
  reason: string;
  /** De dónde viene el dato. */
  source: string;
  at: number;
  /** Estado de validación en lenguaje claro. */
  validation: string;
  icon: IconName;
  isDemo: boolean;
  /** Mayor número = más arriba dentro de la sección. */
  weight: number;
  /** Ruta a la que lleva el renglón, si existe detalle. */
  reportId?: string;
};

const MIN = 60_000;
const SOURCE_OWN = 'Reporte hecho en este teléfono';
const SOURCE_DEMO = 'Dato de demostración (ficticio)';

type BoardInput = {
  sectorId: string;
  sectorName: string;
  reports: EmergencyReport[];
  vulnerable: VulnerableAlert[];
  offers: ResourceOffer[];
  now: number;
};

function demoItems(sectorName: string, now: number): BoardItem[] {
  const resources = getDemoResources(sectorName).map<BoardItem>((r, i) => ({
    id: r.id,
    section: r.kind,
    title: r.title,
    zone: sectorName,
    reason: r.kind === 'need' ? 'Necesidad comunicada por un vecino de demo' : 'Recurso ofrecido por un vecino de demo',
    source: SOURCE_DEMO,
    at: now - (30 + i * 45) * MIN,
    validation: r.stageLabel,
    icon: r.icon,
    isDemo: true,
    weight: 0,
  }));

  const incident: BoardItem = {
    id: 'demo-incident-1',
    section: 'incident',
    title: 'Poste con cables sueltos (simulado)',
    zone: sectorName,
    reason: 'Riesgo eléctrico reportado por dos vecinos de demo',
    source: SOURCE_DEMO,
    at: now - 55 * MIN,
    validation: 'En revisión (simulado)',
    icon: 'flash-alert-outline',
    isDemo: true,
    weight: 1,
  };

  const vulnerable: BoardItem = {
    id: 'demo-vulnerable-1',
    section: 'vulnerable',
    title: `Una persona en ${sectorName} podría necesitar: ver cómo está y acompañar.`,
    zone: sectorName,
    reason: 'Vulnerabilidad reportada por un tercero de demo',
    source: SOURCE_DEMO,
    at: now - 20 * MIN,
    validation: 'No validada',
    icon: 'account-heart-outline',
    isDemo: true,
    weight: 0,
  };

  return [vulnerable, incident, ...resources];
}

/** Arma el tablero del sector: lo propio (guardado en el teléfono) más datos de demo etiquetados. */
export function buildBoard({ sectorId, sectorName, reports, vulnerable, offers, now }: BoardInput): BoardItem[] {
  const items: BoardItem[] = [];

  for (const alert of vulnerable) {
    if (alert.sectorId !== sectorId) continue;
    const urgentNeed = alert.need === 'medical' || alert.need === 'mobility';
    items.push({
      id: alert.id,
      section: 'vulnerable',
      title: publicSummary(alert),
      zone: alert.sectorName,
      reason: `Vulnerabilidad reportada por un tercero · necesidad: ${getVulnerableNeed(alert.need).label.toLowerCase()}`,
      source: SOURCE_OWN,
      at: alert.createdAt,
      validation: `No validada · ${INCIDENT_STATUS_INFO[alert.status].label}`,
      icon: getVulnerableNeed(alert.need).icon,
      isDemo: false,
      weight: urgentNeed ? 2 : 1,
    });
  }

  for (const report of reports) {
    if (report.sectorId !== sectorId) continue;
    const status = INCIDENT_STATUS_INFO[report.status].label;
    if (report.kind === 'incident') {
      const category = getIncidentCategory(report.category);
      items.push({
        id: report.id,
        section: 'incident',
        title: category.label,
        zone: report.sectorName,
        reason: 'Incidente reportado por un vecino',
        source: SOURCE_OWN,
        at: report.createdAt,
        validation: status,
        icon: category.icon,
        isDemo: false,
        weight: 2,
        reportId: report.id,
      });
    } else {
      const help = getHelpType(report.category);
      items.push({
        id: report.id,
        section: 'need',
        title: report.immediateDanger ? 'Alerta de peligro inmediato' : `Necesito ayuda: ${help.label.toLowerCase()}`,
        zone: report.sectorName,
        reason: report.immediateDanger ? 'Marcada como peligro inmediato por quien la envía' : 'Solicitud de ayuda de un vecino',
        source: SOURCE_OWN,
        at: report.createdAt,
        validation: status,
        icon: report.immediateDanger ? 'alarm-light-outline' : help.icon,
        isDemo: false,
        weight: report.immediateDanger ? 2 : 1,
        reportId: report.id,
      });
    }
  }

  for (const offer of offers) {
    if (offer.sectorId !== sectorId || offer.stage === 'cancelled') continue;
    const kind = getResourceKind(offer.resource);
    items.push({
      id: offer.id,
      section: 'resource',
      title: `${kind.label}${offer.note ? ` · ${offer.note}` : ''}`,
      zone: offer.sectorName,
      reason: 'Recurso ofrecido por un vecino',
      source: SOURCE_OWN,
      at: offer.createdAt,
      validation: `${RESOURCE_STAGE_LABEL[offer.stage]} (solo en tu teléfono)`,
      icon: kind.icon,
      isDemo: false,
      weight: 1,
    });
  }

  items.push(...demoItems(sectorName, now));

  return items.sort((a, b) => b.weight - a.weight || b.at - a.at);
}

export const BOARD_SECTIONS: { id: BoardSection; title: string; empty: string }[] = [
  { id: 'vulnerable', title: 'Vulnerabilidad reportada (prioridad)', empty: 'Sin alertas por vecinos.' },
  { id: 'incident', title: 'Incidentes', empty: 'Sin incidentes.' },
  { id: 'need', title: 'Necesidades', empty: 'Sin necesidades.' },
  { id: 'resource', title: 'Recursos', empty: 'Sin recursos.' },
];

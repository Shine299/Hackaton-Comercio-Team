import type { IconName } from '@/shared/ui';

/**
 * Necesidades y recursos FICTICIOS para la demo. No describen personas ni hechos reales.
 * Se muestran siempre con DemoTag.
 */
export type DemoResourceItem = {
  id: string;
  kind: 'need' | 'resource';
  title: string;
  detail: string;
  icon: IconName;
  stageLabel: string;
  isDemo: true;
};

export function getDemoResources(sectorName: string): DemoResourceItem[] {
  return [
    {
      id: 'demo-need-1',
      kind: 'need',
      title: 'Agua embotellada para un pasaje',
      detail: `Zona aproximada: ${sectorName}. Unas 10 familias sin agua por corte simulado.`,
      icon: 'water-outline',
      stageLabel: 'Necesidad comunicada',
      isDemo: true,
    },
    {
      id: 'demo-need-2',
      kind: 'need',
      title: 'Linternas y pilas',
      detail: `Zona aproximada: ${sectorName}. Para un local comunal durante el simulacro.`,
      icon: 'flashlight',
      stageLabel: 'Necesidad comunicada',
      isDemo: true,
    },
    {
      id: 'demo-res-1',
      kind: 'resource',
      title: 'Botiquín de primeros auxilios',
      detail: `Zona aproximada: ${sectorName}. Ofrecido por un vecino de demo.`,
      icon: 'medical-bag',
      stageLabel: 'Ofrecido',
      isDemo: true,
    },
    {
      id: 'demo-res-2',
      kind: 'resource',
      title: 'Camioneta para traslados cortos',
      detail: `Zona aproximada: ${sectorName}. Disponible por la tarde.`,
      icon: 'car-outline',
      stageLabel: 'Reservado',
      isDemo: true,
    },
  ];
}

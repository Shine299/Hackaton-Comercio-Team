import { View } from 'react-native';

import { Badge, cn, Icon, Text } from '@/shared/ui';

import { INCIDENT_ALT, INCIDENT_FLOW, INCIDENT_STATUS_INFO, type IncidentStatus } from '../types';

/** Estado con icono + texto. `local` se muestra como «Guardado en tu teléfono», nunca como recibido. */
export function IncidentStatusBadge({ status }: { status: IncidentStatus }) {
  const info = INCIDENT_STATUS_INFO[status];
  return <Badge label={info.label} tone={info.tone} icon={info.icon} />;
}

/** Línea de seguimiento completa, con el estado actual marcado y los estados alternativos explicados. */
export function IncidentStatusTimeline({ status }: { status: IncidentStatus }) {
  const currentIndex = (INCIDENT_FLOW as readonly string[]).indexOf(status);

  return (
    <View className="gap-3">
      <View className="gap-0">
        {INCIDENT_FLOW.map((step, index) => {
          const info = INCIDENT_STATUS_INFO[step];
          const done = currentIndex >= 0 && index < currentIndex;
          const current = step === status;
          return (
            <View
              key={step}
              className="flex-row gap-3"
              accessibilityLabel={`${info.label}${current ? ', estado actual' : done ? ', completado' : ', todavía no'}`}>
              <View className="items-center">
                <View
                  className={cn(
                    'h-8 w-8 items-center justify-center rounded-full',
                    current ? 'bg-warning-container' : done ? 'bg-success-container' : 'bg-surface-container',
                  )}>
                  <Icon
                    name={current ? info.icon : done ? 'check' : 'circle-outline'}
                    size={18}
                    color={current ? 'warning' : done ? 'success' : 'outline'}
                  />
                </View>
                {index < INCIDENT_FLOW.length - 1 ? <View className="w-0.5 flex-1 bg-outline-variant" /> : null}
              </View>
              <View className="flex-1 pb-3">
                <Text variant={current ? 'body-lg-bold' : 'body-md-medium'} tone={current ? 'default' : 'muted'}>
                  {info.label}
                  {current ? ' · ahora' : ''}
                </Text>
                <Text variant="label-md" tone="muted">
                  {info.description}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
      <Text variant="label-md" tone="muted">
        «Recibido» no significa «validado». Otros resultados posibles tras la revisión:{' '}
        {INCIDENT_ALT.map((s) => INCIDENT_STATUS_INFO[s].label.toLowerCase()).join(', ')}.
      </Text>
    </View>
  );
}

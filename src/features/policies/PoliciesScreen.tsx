import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { Card, Icon, Screen, ScreenHeader, Text } from '@/shared/ui';

import { isPolicyId, type Policy, type PolicyId, POLICIES, POLICIES_VERSION } from './policies';

type PolicyCardProps = { policy: Policy; open: boolean; onToggle: () => void };

/** Una política: la tarjeta cerrada muestra título y resumen; abierta, todas sus secciones. */
function PolicyCard({ policy, open, onToggle }: PolicyCardProps) {
  return (
    <Card>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${policy.title}. ${policy.summary}`}
        accessibilityState={{ expanded: open }}
        onPress={onToggle}
        className="min-h-14 flex-row items-center gap-3 active:opacity-80">
        <View className="h-11 w-11 items-center justify-center rounded-xl bg-primary-fixed">
          <Icon name={policy.icon} size={24} color="primary" />
        </View>
        <View className="min-w-0 flex-1 gap-0.5">
          <Text variant="body-lg-bold">{policy.title}</Text>
          <Text variant="label-md" tone="muted">
            {policy.summary}
          </Text>
        </View>
        <Icon name={open ? 'chevron-up' : 'chevron-down'} size={24} color="onSurfaceVariant" />
      </Pressable>

      {open
        ? policy.sections.map((section) => (
            <View key={section.heading} className="gap-1.5">
              <Text variant="body-lg-bold" tone="primary" accessibilityRole="header">
                {section.heading}
              </Text>
              {section.body.map((paragraph) => (
                <Text key={paragraph} variant="body-md">
                  {paragraph}
                </Text>
              ))}
            </View>
          ))
        : null}
    </Card>
  );
}

/**
 * Políticas de servicios (SPEC-056): se abre desde el menú lateral con un tema (`?tema=privacidad`) y ese tema llega
 * desplegado. Los textos son un borrador de lo que la app ya hace, pendiente de revisión legal.
 */
export function PoliciesScreen() {
  const { tema } = useLocalSearchParams<{ tema?: string }>();
  const [openId, setOpenId] = useState<PolicyId | null>(isPolicyId(tema) ? tema : null);

  // Si ya estás aquí y eliges otro tema desde el menú, cambia la política abierta (ajuste de estado durante el render).
  const [appliedTema, setAppliedTema] = useState(tema);
  if (appliedTema !== tema) {
    setAppliedTema(tema);
    setOpenId(isPolicyId(tema) ? tema : null);
  }

  return (
    <Screen header={<ScreenHeader title="Políticas de servicios" />} safeBottom contentClassName="gap-3 px-5 pb-8 pt-4">
      <View className="gap-1 px-1">
        <Text variant="label-md" tone="muted">
          {POLICIES_VERSION.label}
        </Text>
        <Text variant="body-md" tone="muted">
          Un resumen, en palabras sencillas, de cómo funciona Yunta hoy. Puede cambiar.
        </Text>
      </View>

      {POLICIES.map((policy) => (
        <PolicyCard
          key={policy.id}
          policy={policy}
          open={openId === policy.id}
          onToggle={() => setOpenId((current) => (current === policy.id ? null : policy.id))}
        />
      ))}
    </Screen>
  );
}

import { useState } from 'react';
import { Pressable, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, LinearTransition } from 'react-native-reanimated';

import { HELP_CATEGORIES, useInterestStore, type PostCategoryId } from '@/features/posts';
import { Badge, Chip, Icon, SyncStatusBadge, Text, type IconName } from '@/shared/ui';

/** Elige intereses: alimentan las recomendaciones de Inicio desde el primer día (solo en este teléfono). */
export function InterestsDemo() {
  const seed = useInterestStore((s) => s.seed);
  const [picked, setPicked] = useState<PostCategoryId[]>([]);

  const toggle = (id: PostCategoryId) => {
    const next = picked.includes(id) ? picked.filter((c) => c !== id) : [...picked, id];
    setPicked(next);
    seed(next);
  };

  return (
    <View className="gap-3">
      <View className="flex-row flex-wrap gap-2" accessibilityLabel="Tus intereses">
        {HELP_CATEGORIES.map((c) => (
          <Chip key={c.id} label={c.label} icon={c.icon} selected={picked.includes(c.id)} onPress={() => toggle(c.id)} />
        ))}
      </View>
      {picked.length > 0 ? (
        <Animated.View entering={FadeIn.duration(250)} className="flex-row items-center gap-2">
          <Icon name="check-circle-outline" size={22} color="primary" />
          <Text variant="body-lg" tone="primary" className="flex-1">
            ¡Listo! Eso es lo primero que verás en Inicio.
          </Text>
        </Animated.View>
      ) : (
        <Text variant="body-lg" tone="muted">
          Toca las que quieras. Si prefieres, sáltate este paso.
        </Text>
      )}
    </View>
  );
}

const PUBLISH_STEPS: { icon: IconName; title: string; detail: string }[] = [
  { icon: 'swap-horizontal', title: 'Elige Pedir u Ofrecer', detail: 'Me dices si necesitas algo o si tú puedes ayudar.' },
  { icon: 'shape-outline', title: 'Escoge una categoría', detail: 'Herramientas, favores, trueque… y llenas una tarjeta cortita.' },
  { icon: 'send-outline', title: 'Toca Publicar', detail: 'Tus vecinos lo ven y te escriben por la app.' },
];

/** Tres pasos tocables: cada uno se abre y explica en una línea. */
export function StepsDemo() {
  const [open, setOpen] = useState(0);
  return (
    <View className="gap-2" accessibilityRole="list">
      {PUBLISH_STEPS.map((step, i) => {
        const active = open === i;
        return (
          <Animated.View key={step.title} layout={LinearTransition.duration(220)}>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ expanded: active }}
              accessibilityLabel={`Paso ${i + 1}: ${step.title}`}
              onPress={() => setOpen(i)}
              className={
                active
                  ? 'gap-1 rounded-2xl border-2 border-primary bg-surface-container-lowest p-3'
                  : 'rounded-2xl bg-surface-container-lowest p-3 active:opacity-80'
              }>
              <View className="flex-row items-center gap-3">
                <View className={active ? 'h-11 w-11 items-center justify-center rounded-full bg-primary' : 'h-11 w-11 items-center justify-center rounded-full bg-primary-fixed'}>
                  <Icon name={step.icon} size={24} color={active ? 'onPrimary' : 'primary'} />
                </View>
                <Text variant="headline-sm" className="flex-1">
                  {i + 1}. {step.title}
                </Text>
                <Icon name={active ? 'chevron-up' : 'chevron-down'} size={20} color="onSurfaceVariant" />
              </View>
              {active ? (
                <Animated.View entering={FadeIn.duration(200)}>
                  <Text variant="body-xl" tone="muted" className="pl-14">
                    {step.detail}
                  </Text>
                </Animated.View>
              ) : null}
            </Pressable>
          </Animated.View>
        );
      })}
    </View>
  );
}

/** Botón SOS de práctica. No envía nada: lo dice claro para no confundir con una emergencia real. */
export function SosDemo() {
  const [pressed, setPressed] = useState(false);
  return (
    <View className="gap-3">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Botón de prueba del SOS. No envía nada"
        onPress={() => setPressed(true)}
        className="min-h-20 flex-row items-center justify-center gap-3 rounded-3xl bg-error px-5 active:opacity-90">
        <Icon name="alarm-light-outline" size={32} color="onError" />
        <Text variant="headline-lg" tone="onError">
          SOS (prueba)
        </Text>
      </Pressable>
      {pressed ? (
        <Animated.View entering={FadeInDown.duration(300)} className="gap-2 rounded-2xl bg-success-container p-3">
          <View className="flex-row items-center gap-2">
            <Icon name="check-circle-outline" size={22} color="success" />
            <Text variant="headline-sm">¡Así de rápido!</Text>
          </View>
          <Text variant="body-lg">
            En una emergencia de verdad, tu aviso queda guardado y te muestro los números oficiales. Esto fue solo una prueba: no se envió nada.
          </Text>
          <Badge label="Simulación" tone="warning" icon="flask-outline" />
        </Animated.View>
      ) : (
        <Text variant="body-lg" tone="muted">
          Tócalo y mira qué pasa. No se envía nada.
        </Text>
      )}
    </View>
  );
}

/** Modo avión de mentira: muestra cómo cambia el estado entre «guardado en tu teléfono» y «recibido». */
export function OfflineDemo() {
  const [airplane, setAirplane] = useState(false);
  return (
    <View className="gap-3">
      <Pressable
        accessibilityRole="switch"
        accessibilityState={{ checked: airplane }}
        accessibilityLabel="Modo avión de prueba"
        onPress={() => setAirplane((v) => !v)}
        className="min-h-14 flex-row items-center gap-3 rounded-2xl bg-surface-container-lowest px-4 active:opacity-80">
        <Icon name={airplane ? 'airplane' : 'airplane-off'} size={26} color="primary" />
        <Text variant="headline-sm" className="flex-1">
          Modo avión
        </Text>
        <View className={airplane ? 'h-8 w-14 items-end justify-center rounded-full bg-primary px-1' : 'h-8 w-14 items-start justify-center rounded-full bg-outline-variant px-1'}>
          <View className="h-6 w-6 rounded-full bg-white" />
        </View>
      </Pressable>
      <View className="gap-2 rounded-2xl bg-surface-container-lowest p-3">
        <Text variant="body-lg" tone="muted">
          Tu reporte de ejemplo:
        </Text>
        <SyncStatusBadge status={airplane ? 'local' : 'received'} />
        <Text variant="body-lg" tone="muted">
          {airplane
            ? 'Sin señal, queda guardado en tu teléfono. Se enviará solo cuando vuelva la conexión.'
            : 'Con señal, el servidor lo recibe y yo te lo confirmo.'}
        </Text>
      </View>
    </View>
  );
}

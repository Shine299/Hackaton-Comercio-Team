import { useRouter } from 'expo-router';
import { View } from 'react-native';

import { Badge, Button, Card, Icon, Text } from '@/shared/ui';

import { useGuard } from './guardContext';
import { useGuardStore } from './store';

/**
 * Botón del Modo guardia en el Inicio (SPEC-052): enciende y apaga la escucha con un toque.
 * La primera vez lleva a la pantalla de Modo guardia para leer el aviso y dar el consentimiento.
 */
export function GuardHomeCard() {
  const router = useRouter();
  const { enabled, listening, error, start, stop } = useGuard();
  const consented = useGuardStore((s) => s.consented);

  const turnOn = () => {
    if (!consented) router.push('/emergencias/guardia');
    else void start();
  };

  return (
    <Card tone={enabled ? 'default' : 'low'} className="gap-3" accessibilityLabel="Modo guardia: pide ayuda con tu voz">
      <View className="flex-row items-center gap-3">
        <View className="h-12 w-12 items-center justify-center rounded-2xl bg-primary-fixed">
          <Icon name={enabled ? 'ear-hearing' : 'ear-hearing-off'} size={28} color="primary" />
        </View>
        <View className="min-w-0 flex-1 gap-1">
          <Text variant="body-lg-bold" accessibilityRole="header">
            Modo guardia
          </Text>
          <Text variant="body-md" tone="muted">
            {enabled
              ? listening
                ? 'Escuchando mientras usas la app. Di «Hola Yunta, ayúdame».'
                : 'Activa. Escucho cuando la app está a la vista.'
              : 'Pide ayuda con tu voz: «Hola Yunta, ayúdame, me pasó algo».'}
          </Text>
        </View>
        {enabled ? <Badge label="Activa" tone="success" icon="check-circle-outline" /> : null}
      </View>

      {error ? (
        <Text variant="body-md-medium" tone="error" accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : null}

      <View className="flex-row gap-3">
        {enabled ? (
          <Button label="Apagar" variant="outline" icon="stop-circle-outline" className="flex-1" onPress={stop} />
        ) : (
          <Button label="Activar" icon="shield-check-outline" className="flex-1" onPress={turnOn} />
        )}
        <Button
          label="Ajustes"
          variant="tonal"
          icon="cog-outline"
          className="flex-1"
          onPress={() => router.push('/emergencias/guardia')}
        />
      </View>
    </Card>
  );
}

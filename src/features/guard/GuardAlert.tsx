import { Linking, View } from 'react-native';

import { Button, Card, Icon, Screen, Text } from '@/shared/ui';

import { useGuard } from './guardContext';

export const NEED_LABEL = { ambulance: 'ambulancia', fire: 'bomberos', police: 'policía' } as const;

/**
 * Lo que se ve sobre CUALQUIER pantalla cuando el Modo guardia oyó una petición de ayuda (SPEC-052):
 * primero la pregunta con su cuenta regresiva, y después el pedido de ayuda con el marcador y el aviso.
 */
export function GuardAlert() {
  const { state, speaking, sent, cancel, confirmNow, helped, stop } = useGuard();

  if (state.phase === 'confirming') {
    return (
      <Screen contentClassName="gap-4 px-5 pb-8 pt-8">
        <Card tone="warning" className="items-center gap-3 py-6" accessibilityLiveRegion="assertive">
          <Text variant="headline-md" accessibilityRole="header">
            ¿Necesitas ayuda?
          </Text>
          <Text variant="display" accessibilityLabel={`${state.secondsLeft} segundos`}>
            {state.secondsLeft}
          </Text>
          <Text variant="body-lg" className="text-center">
            {speaking ? 'Escucha la pregunta…' : `Di «sí» o «no». Si no respondes, pido ayuda (${NEED_LABEL[state.need]}).`}
          </Text>
        </Card>
        <Button label="Necesito ayuda ahora" variant="danger" size="lg" icon="alarm-light" onPress={confirmNow} />
        <Button label="Estoy bien" variant="tonal" size="lg" icon="check-circle-outline" onPress={cancel} />
        <Text variant="label-md" tone="muted" className="text-center">
          Yunta no reemplaza a los servicios oficiales de emergencia.
        </Text>
      </Screen>
    );
  }

  if (state.phase !== 'dispatching') return null;

  return (
    <Screen contentClassName="gap-4 px-5 pb-8 pt-8">
      <Card tone="error" className="gap-2" accessibilityLiveRegion="assertive">
        <View className="flex-row items-center gap-3">
          <Icon name="alarm-light" size={32} color="error" />
          <Text variant="headline-sm" tone="error" className="flex-1" accessibilityRole="header">
            Pidiendo ayuda: {NEED_LABEL[state.need]}
          </Text>
        </View>
        <Text variant="body-lg">
          Abrí el marcador con el {sent?.number?.number ?? 'número'}. Si no estás cerca, quien te vea que toque «Llamar».
        </Text>
        <Text variant="body-md" tone="muted">
          Avisé a tu sector. Mientras tanto, el teléfono repite que necesitas ayuda.
        </Text>
      </Card>

      {sent?.telHref && sent.number ? (
        <Button
          label={`Llamar al ${sent.number.number} (${sent.number.label})`}
          variant="danger"
          size="lg"
          icon="phone"
          onPress={() => void Linking.openURL(sent.telHref as string)}
        />
      ) : null}

      {sent?.smsHref ? (
        <Button
          label={sent.locating ? 'Buscando tu ubicación…' : `Enviar mi ubicación a ${sent.contactName || 'mi contacto'}`}
          variant="tonal"
          size="lg"
          icon="message-text-outline"
          disabled={sent.locating}
          onPress={() => void Linking.openURL(sent.smsHref as string)}
        />
      ) : (
        <Text variant="body-md" tone="muted">
          No guardaste un contacto de confianza. Puedes añadirlo en Modo guardia.
        </Text>
      )}
      {sent && !sent.locating && !sent.coords ? (
        <Text variant="body-md" tone="muted">
          No pude obtener tu ubicación exacta: el aviso lleva solo tu sector.
        </Text>
      ) : null}

      <Button label="Ya me ayudan" variant="outline" icon="check-circle-outline" onPress={helped} />
      <Button label="Apagar la guardia" variant="ghost" onPress={stop} />
      <Text variant="label-md" tone="muted" className="text-center">
        Yunta no reemplaza a los servicios oficiales de emergencia.
      </Text>
    </Screen>
  );
}

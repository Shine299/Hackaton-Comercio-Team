import { View } from 'react-native';

import { Badge, Button, Card, Icon, Screen, Text, TextField } from '@/shared/ui';

import { SPEECH_DB } from './audioGate';
import { CONFIRM_SECONDS } from './flow';
import { useGuard } from './guardContext';
import { useGuardStore } from './store';

/**
 * Modo guardia por voz (SPEC-052): ajustes y estado. Dices «Hola Yunta, ayúdame, me pasó algo» y la app pregunta por voz,
 * abre el marcador con el servicio que toca, prepara tu ubicación para tu contacto de confianza y avisa a tu sector.
 * Mientras está activa escucha en toda la app (con la app a la vista). Alguien debe tocar «Llamar».
 */
export function GuardScreen() {
  const { enabled, listening, error, debug, start, stop } = useGuard();
  const consented = useGuardStore((s) => s.consented);
  const accept = useGuardStore((s) => s.accept);
  const contactName = useGuardStore((s) => s.contactName);
  const contactPhone = useGuardStore((s) => s.contactPhone);
  const setContact = useGuardStore((s) => s.setContact);

  const activate = () => {
    if (!consented) accept();
    void start();
  };

  return (
    <Screen contentClassName="gap-4 px-5 pb-8 pt-4">
      <Card className="gap-3">
        <View className="flex-row items-center gap-3">
          <View className="h-12 w-12 items-center justify-center rounded-2xl bg-primary-fixed">
            <Icon name={enabled ? 'ear-hearing' : 'ear-hearing-off'} size={28} color="primary" />
          </View>
          <Text variant="headline-sm" className="flex-1" accessibilityRole="header">
            Pide ayuda con tu voz
          </Text>
          {enabled ? <Badge label="Activa" tone="success" icon="check-circle-outline" /> : null}
        </View>
        <Text variant="body-lg">
          Si dices «Hola Yunta» abro la conversación con el asistente. Si dices «Yunta, ayúdame, me pasó algo», te pregunto por voz si necesitas ayuda. Si dices que sí, o no respondes en{' '}
          {CONFIRM_SECONDS} segundos, pido ayuda.
        </Text>
        {enabled ? (
          <Text variant="body-md-medium" accessibilityLiveRegion="polite">
            {listening ? 'Escuchando mientras usas la app.' : 'Activa. Escucho cuando la app está a la vista y nada más graba.'}
          </Text>
        ) : null}
      </Card>

      <Card tone="warning" className="gap-2">
        <Text variant="body-lg-bold">Lo que tienes que saber</Text>
        <Text variant="body-md">
          • Escucho mientras usas la app y la pantalla está encendida. No escucho con el teléfono bloqueado ni con la app cerrada.
        </Text>
        <Text variant="body-md">
          • Abro el marcador con el número, pero alguien tiene que tocar «Llamar». Por eso repito el aviso en voz alta.
        </Text>
        <Text variant="body-md">
          • Solo se envían a transcribir los clips cortos donde hay sonido, y se descartan. Tu ubicación exacta se usa una vez, solo si
          se confirma la emergencia, y no se guarda.
        </Text>
        <Text variant="body-md">• Cuando grabas una nota de voz o hablas con el asistente, me aparto un momento.</Text>
        <Text variant="body-md-medium">Yunta no reemplaza a los servicios oficiales de emergencia.</Text>
      </Card>

      <Card className="gap-3">
        <Text variant="body-lg-bold">Contacto de confianza (opcional)</Text>
        <Text variant="body-md" tone="muted">
          Le preparo un mensaje con tu ubicación. Se guarda solo en este teléfono.
        </Text>
        <TextField label="Nombre" value={contactName} onChangeText={(name) => setContact({ name })} autoComplete="name" />
        <TextField
          label="Teléfono"
          value={contactPhone}
          onChangeText={(phone) => setContact({ phone })}
          keyboardType="phone-pad"
          autoComplete="tel"
        />
      </Card>

      {error ? (
        <Card tone="error" accessibilityLiveRegion="polite">
          <Text variant="body-md-medium" tone="error">
            {error}
          </Text>
        </Card>
      ) : null}

      {/* SPEC-053: diagnóstico. Si no te oye, aquí se ve por qué: qué mide, qué envía y qué entiende. */}
      <Card tone="low" className="gap-1.5" accessibilityLabel="Diagnóstico del Modo guardia">
        <Text variant="body-lg-bold">Diagnóstico</Text>
        <Text variant="body-md">
          Estado: {listening ? 'escuchando' : debug.pausedBecause ? `en pausa. ${debug.pausedBecause}` : 'sin escuchar'}
        </Text>
        <Text variant="body-md">
          Volumen del último clip: {debug.peakDb === null ? 'sin medición' : `${debug.peakDb} dB`} (hace falta {SPEECH_DB} dB o más para
          enviarlo)
          {debug.lastSkip === 'quiet' ? ' · no se envió: muy bajo' : debug.lastSkip === 'short' ? ' · no se envió: muy corto' : ''}
        </Text>
        <Text variant="body-md">Clips enviados: {debug.uploads}</Text>
        <Text variant="body-md">Último texto entendido: {debug.lastHeard ? `«${debug.lastHeard}»` : 'ninguno todavía'}</Text>
        {debug.lastError ? (
          <Text variant="body-md" tone="error">
            Último error: {debug.lastError}
          </Text>
        ) : null}
        <Text variant="label-md" tone="muted">
          Di «Hola Yunta» para hablar con el asistente, o «Yunta, ayúdame» para pedir ayuda.
        </Text>
      </Card>

      {enabled ? (
        <Button label="Apagar la guardia" variant="outline" icon="stop-circle-outline" size="lg" onPress={stop} />
      ) : (
        <Button
          label={consented ? 'Activar guardia' : 'Entiendo y activo la guardia'}
          icon="shield-check-outline"
          size="lg"
          onPress={activate}
          accessibilityHint="Empieza a escuchar con el micrófono mientras usas la app"
        />
      )}

      <Text variant="label-md" tone="muted" className="text-center">
        Yunta no reemplaza a los servicios oficiales de emergencia.
      </Text>
    </Screen>
  );
}

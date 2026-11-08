import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Animated, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useSessionStore } from '@/features/session';
import { BrandLogo, Button, GRADIENTS, Icon, type IconName, PressableScale, Text } from '@/shared/ui';

import { isHearing } from './levels';
import { useAssistantStore } from './store';
import { buildGreeting } from './summary';
import { useConversationSummary } from './useConversationSummary';
import { useVoiceConversation } from './useVoiceConversation';
import { VoiceWaves } from './VoiceWaves';

function RoundButton({
  icon,
  label,
  onPress,
  danger = false,
  active = false,
}: {
  icon: IconName;
  label: string;
  onPress: () => void;
  danger?: boolean;
  active?: boolean;
}) {
  return (
    <View className="items-center gap-1.5">
      <PressableScale
        accessibilityRole="button"
        accessibilityLabel={label}
        onPress={onPress}
        className={`h-16 w-16 items-center justify-center rounded-full ${danger ? 'bg-error' : active ? 'bg-white' : 'bg-white/20'}`}>
        <Icon name={icon} size={28} color={danger ? 'onError' : active ? 'primary' : 'onPrimary'} />
      </PressableScale>
      <Text variant="label-md" tone="onPrimary">
        {label}
      </Text>
    </View>
  );
}

/**
 * Conversación por voz con Yunta, a pantalla completa (SPEC-053), como una charla en vivo: la mascota al centro, una estela
 * que sube desde abajo con tu voz, subtítulos de lo que dices y de lo que responde Yunta, y un botón para terminar.
 * Todo es automático: hablas, se envía solo, Yunta responde en voz alta y vuelve a escucharte. La emergencia no pasa por la IA.
 */
export function ConversationScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const name = useSessionStore((s) => (s.registered ? s.displayName : undefined));
  const getSummary = useConversationSummary();
  const messages = useAssistantStore((s) => s.messages);
  const { t: wakeStamp } = useLocalSearchParams<{ t?: string }>();

  const convo = useVoiceConversation({
    getGreeting: () => buildGreeting({ hour: new Date().getHours(), name }),
    getContext: getSummary,
  });
  const { start, stop } = convo;

  // Empieza sola al abrir la pantalla (y otra vez si dicen «Hola Yunta» estando aquí); al salir, se apaga.
  useEffect(() => {
    void start();
  }, [start, wakeStamp]);
  useEffect(() => () => stop(), [stop]);

  const [pulse] = useState(() => new Animated.Value(1));
  useEffect(() => {
    if (!convo.talking) {
      pulse.setValue(1);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.1, duration: 420, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 420, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [convo.talking, pulse]);

  const lastYunta = [...messages].reverse().find((m) => m.role === 'assistant');
  const lastYou = [...messages].reverse().find((m) => m.role === 'user');
  const emergency = lastYunta?.answer?.source === 'emergency' && convo.phase !== 'off';

  const status =
    convo.phase === 'off'
      ? 'Toca el micrófono para hablar con Yunta'
      : convo.talking
        ? 'Yunta está hablando'
        : convo.phase === 'thinking'
          ? 'Pensando…'
          : convo.muted
            ? 'Micrófono en silencio'
            : isHearing(convo.levels)
              ? 'Te estoy oyendo'
              : 'Te escucho… habla cuando quieras';

  const close = () => {
    stop();
    if (router.canGoBack()) router.back();
    else router.replace('/');
  };

  return (
    <LinearGradient colors={GRADIENTS.hero} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={{ flex: 1 }}>
      {/* La estela sube desde el borde de abajo, detrás de los botones. */}
      <View pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, bottom: 0 }}>
        <VoiceWaves levels={convo.levels} mode={convo.talking ? 'speaking' : convo.phase === 'listening' && !convo.muted ? 'listening' : 'quiet'} />
      </View>

      <View style={{ flex: 1, paddingTop: insets.top + 8, paddingBottom: insets.bottom + 16 }} className="px-5">
        <View className="flex-row items-center justify-between">
          <PressableScale
            accessibilityRole="button"
            accessibilityLabel="Cerrar la conversación"
            onPress={close}
            className="h-12 w-12 items-center justify-center rounded-full bg-white/20">
            <Icon name="close" size={26} color="onPrimary" />
          </PressableScale>
          <Text variant="headline-sm" tone="onPrimary" accessibilityRole="header">
            Yunta
          </Text>
          <PressableScale
            accessibilityRole="button"
            accessibilityLabel="Escribir en vez de hablar"
            onPress={() => {
              stop();
              router.replace('/asistente');
            }}
            className="h-12 w-12 items-center justify-center rounded-full bg-white/20">
            <Icon name="keyboard-outline" size={24} color="onPrimary" />
          </PressableScale>
        </View>

        <View className="flex-1 items-center justify-center gap-5">
          <Animated.View style={{ transform: [{ scale: pulse }] }}>
            <BrandLogo variant="mark" height={140} />
          </Animated.View>
          <Text variant="headline-sm" tone="onPrimary" className="text-center" accessibilityLiveRegion="polite">
            {status}
          </Text>

          <View className="w-full gap-3" accessibilityLiveRegion="polite">
            {lastYou && convo.phase !== 'off' ? (
              <Text variant="body-lg" tone="onPrimary" className="text-center opacity-80">
                Tú: {lastYou.text}
              </Text>
            ) : null}
            {lastYunta && convo.phase !== 'off' ? (
              <Text variant="headline-sm" tone="onPrimary" className="text-center" numberOfLines={7}>
                {lastYunta.text}
              </Text>
            ) : null}
          </View>

          {emergency ? (
            <Button label="Abrir Emergencia" variant="danger" icon="alarm-light-outline" onPress={() => router.push('/emergencias')} />
          ) : null}
          {convo.error ? (
            <Text variant="body-md-medium" tone="onPrimary" className="rounded-2xl bg-error px-4 py-2 text-center">
              {convo.error}
            </Text>
          ) : null}
        </View>

        <View className="flex-row items-end justify-center gap-8">
          {convo.phase === 'off' ? (
            <RoundButton icon="microphone" label="Hablar" active onPress={() => void start()} />
          ) : (
            <RoundButton
              icon={convo.muted ? 'microphone-off' : 'microphone-outline'}
              label={convo.muted ? 'Activar' : 'Silenciar'}
              active={convo.muted}
              onPress={convo.toggleMute}
            />
          )}
          <RoundButton icon="phone-hangup" label="Terminar" danger onPress={close} />
        </View>
      </View>
    </LinearGradient>
  );
}

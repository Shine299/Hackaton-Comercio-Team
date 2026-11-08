import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  View,
  type ScrollViewInstance,
} from 'react-native';

import { isSupabaseConfigured } from '@/shared/supabase/client';
import { Button, Card, Chip, DemoTag, Icon, type IconName, ListenButton, Screen, ScreenHeader, Text } from '@/shared/ui';

import { checkQuestion, looksLikeEmergency, MAX_QUESTION_LENGTH, redactPersonalData, resolveAnswer } from './logic';
import { askAssistant } from './repository';
import { type AssistantMessage, useAssistantStore } from './store';
import { useVoiceInput } from './useVoiceInput';

const SUGGESTIONS = ['¿Cómo publico algo?', '¿Cómo creo un evento?', '¿Para qué sirve el SOS?', '¿Cómo sé si una tienda está abierta?'];

const REASON_TEXT = {
  limit: 'Se acabó el cupo del asistente con IA por hoy. Te respondo con una respuesta guardada:',
  unavailable: 'El asistente con IA no está disponible ahora. Te respondo con una respuesta guardada:',
  offline: 'Sin conexión. Te respondo con una respuesta guardada:',
} as const;

/** Etiqueta honesta de cada respuesta: siempre texto + ícono. */
function SourceLabel({ message }: { message: AssistantMessage }) {
  const answer = message.answer;
  if (!answer) return null;
  const label: { icon: IconName; text: string } =
    answer.source === 'ai'
      ? { icon: 'creation-outline', text: 'Asistente con IA · puede equivocarse' }
      : answer.source === 'emergency'
        ? { icon: 'alarm-light-outline', text: 'Aviso de emergencia (sin IA)' }
        : { icon: 'book-open-variant', text: 'Respuesta guardada (sin IA)' };
  return (
    <View className="mt-1 flex-row flex-wrap items-center gap-1.5 px-1">
      <Icon name={label.icon} size={14} color="onSurfaceVariant" />
      <Text variant="label-sm" tone="muted">
        {label.text}
      </Text>
      {answer.source === 'demo' ? <DemoTag /> : null}
    </View>
  );
}

function Bubble({ message }: { message: AssistantMessage }) {
  const router = useRouter();
  const mine = message.role === 'user';
  const answer = message.answer;
  const emergency = answer?.source === 'emergency';
  return (
    <View className={mine ? 'items-end' : 'items-start'}>
      {answer?.reason ? (
        <Text variant="label-md" tone="muted" className="mb-1 px-1">
          {REASON_TEXT[answer.reason]}
        </Text>
      ) : null}
      <View
        accessible
        accessibilityLabel={`${mine ? 'Tú' : 'Asistente'}: ${message.text}`}
        className={
          mine
            ? 'max-w-[85%] rounded-2xl rounded-br-md bg-primary px-3.5 py-2.5'
            : emergency
              ? 'max-w-[90%] gap-2 rounded-2xl rounded-bl-md bg-error-container px-3.5 py-2.5'
              : 'max-w-[85%] rounded-2xl rounded-bl-md bg-surface-container-lowest px-3.5 py-2.5 shadow-sm elevation-xs'
        }>
        <Text variant="body-lg" tone={mine ? 'onPrimary' : emergency ? 'error' : 'default'}>
          {message.text}
        </Text>
        {emergency ? (
          <Button label="Abrir Emergencia" variant="danger" icon="alarm-light-outline" onPress={() => router.push('/emergencias')} />
        ) : null}
      </View>
      {/* SPEC-050: las respuestas se pueden escuchar (voz del teléfono, sin internet). */}
      {!mine ? (
        <View className="mt-1 self-start">
          <ListenButton text={message.text} />
        </View>
      ) : null}
      <SourceLabel message={message} />
    </View>
  );
}

/**
 * «Pregúntale a Yunta» (SPEC-049): dudas sobre la app y el barrio con IA gratuita (Mistral → Groq) y
 * respuestas guardadas de respaldo. Las emergencias nunca pasan por la IA y los datos personales no salen del teléfono.
 */
export function AssistantScreen() {
  const messages = useAssistantStore((s) => s.messages);
  const add = useAssistantStore((s) => s.add);
  const clear = useAssistantStore((s) => s.clear);
  const [text, setText] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [notice, setNotice] = useState<string | undefined>();
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<ScrollViewInstance>(null);
  const router = useRouter();
  const [emergencyHint, setEmergencyHint] = useState(false);

  // SPEC-050: el texto transcrito llega a la caja para revisarlo; nada se envía solo.
  const voice = useVoiceInput({
    onTranscript: (transcript) => {
      setError(undefined);
      setText(transcript);
      setEmergencyHint(looksLikeEmergency(transcript));
      setNotice('Revisa el texto y toca Enviar. Puedes corregirlo antes.');
    },
    onError: (message) => {
      setNotice(undefined);
      setError(message);
    },
  });

  const send = async (raw: string) => {
    if (busy) return;
    const check = checkQuestion(raw);
    if (!check.ok) {
      setError(check.error);
      return;
    }
    setError(undefined);
    setText('');
    setEmergencyHint(false);
    // Se guarda (y se reenvía después como historial) la pregunta ya sin datos personales.
    const safe = redactPersonalData(check.text);
    const history = messages.map((m) => ({ role: m.role, text: m.text }));
    add({ role: 'user', text: safe.text });
    setNotice(safe.redacted ? 'Ocultamos un teléfono, correo o DNI de tu mensaje antes de enviarlo.' : undefined);
    setBusy(true);
    try {
      const answer = await resolveAnswer(check.text, history, { serverConfigured: isSupabaseConfigured, ask: askAssistant });
      const { text: reply, ...meta } = answer;
      add({ role: 'assistant', text: reply, answer: meta });
    } finally {
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
      <Screen
        header={
          <ScreenHeader
            title="Pregúntale a Yunta"
            backLabel="Volver"
            trailing={
              messages.length > 0 ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Borrar la conversación de este teléfono"
                  onPress={clear}
                  className="h-12 w-12 items-center justify-center rounded-full active:bg-surface-container">
                  <Icon name="delete-outline" size={22} color="primary" />
                </Pressable>
              ) : undefined
            }
          />
        }
        scroll={false}
        contentClassName="flex-1"
        footer={
          <View className="gap-2">
            {error ? (
              <Text variant="label-md" tone="error" accessibilityLiveRegion="polite">
                {error}
              </Text>
            ) : null}
            {notice ? (
              <Text variant="label-md" tone="muted" accessibilityLiveRegion="polite">
                {notice}
              </Text>
            ) : null}
            {emergencyHint ? (
              <View className="gap-2 rounded-2xl bg-error-container p-3" accessibilityLiveRegion="assertive">
                <Text variant="body-md-medium" tone="error">
                  Si es una emergencia, no esperes: usa el SOS o llama al 105.
                </Text>
                <Button label="Abrir Emergencia" variant="danger" icon="alarm-light-outline" onPress={() => router.push('/emergencias')} />
              </View>
            ) : null}
            {voice.status !== 'idle' ? (
              <View className="flex-row items-center gap-2" accessibilityLiveRegion="polite">
                {voice.status === 'recording' ? (
                  <Icon name="record-circle-outline" size={18} color="error" />
                ) : (
                  <ActivityIndicator />
                )}
                <Text variant="body-md-medium">
                  {voice.status === 'recording'
                    ? `Grabando… 0:${String(voice.seconds).padStart(2, '0')} · toca 🎤 para terminar (máx. 30 s)`
                    : 'Pasando tu voz a texto…'}
                </Text>
              </View>
            ) : null}
            <View className="flex-row items-end gap-2">
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={voice.status === 'recording' ? 'Terminar de grabar' : 'Hablar: grabar tu pregunta con la voz'}
                accessibilityState={{ disabled: voice.status === 'transcribing' || busy, busy: voice.status === 'transcribing' }}
                disabled={voice.status === 'transcribing' || busy}
                onPress={voice.toggle}
                className={
                  voice.status === 'recording'
                    ? 'h-12 w-12 items-center justify-center rounded-full bg-error active:opacity-80'
                    : 'h-12 w-12 items-center justify-center rounded-full bg-primary-fixed active:opacity-80'
                }>
                <Icon
                  name={voice.status === 'recording' ? 'stop' : 'microphone-outline'}
                  size={24}
                  color={voice.status === 'recording' ? 'onError' : 'primary'}
                />
              </Pressable>
              <TextInput
                accessibilityLabel="Escribe tu pregunta"
                placeholder="Escribe tu pregunta…"
                value={text}
                onChangeText={(value) => {
                  setText(value.slice(0, MAX_QUESTION_LENGTH));
                  if (error) setError(undefined);
                }}
                multiline
                className="max-h-28 min-h-12 flex-1 rounded-2xl bg-surface-container-low px-4 py-3 font-inter text-body-lg text-on-surface"
              />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Enviar pregunta"
                accessibilityState={{ disabled: busy, busy }}
                onPress={() => void send(text)}
                className="h-12 w-12 items-center justify-center rounded-full bg-primary active:opacity-80">
                {busy ? <ActivityIndicator color="#ffffff" /> : <Icon name="send" size={22} color="onPrimary" />}
              </Pressable>
            </View>
          </View>
        }>
        <ScrollView
          ref={scrollRef}
          className="flex-1"
          contentContainerClassName="gap-3 px-4 py-3"
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
          keyboardShouldPersistTaps="handled">
          <Card tone="low" className="gap-1.5">
            <View className="flex-row items-center gap-2">
              <Icon name="creation-outline" size={18} color="primary" />
              <Text variant="label-md" tone="primary" className="flex-1">
                Asistente con IA gratuita: puede equivocarse
              </Text>
              {!isSupabaseConfigured ? <DemoTag /> : null}
            </View>
            <Text variant="label-md" tone="muted">
              No compartas datos personales: tus preguntas pasan por servicios de IA externos. En una emergencia usa el
              botón SOS o llama al 105.
            </Text>
            <View className="flex-row items-start gap-1.5">
              <Icon name="microphone-outline" size={16} color="primary" />
              <Text variant="label-md" tone="muted" className="flex-1">
                Toca 🎤 para hablar: tu voz se envía a un servicio externo solo para pasarla a texto y no la guardamos.
                También puedes dictar con el micrófono de tu teclado.
              </Text>
            </View>
          </Card>

          {messages.length === 0 ? (
            <View className="gap-2">
              <Text variant="body-md-medium">Puedes preguntarme, por ejemplo:</Text>
              <View className="flex-row flex-wrap gap-2">
                {SUGGESTIONS.map((s) => (
                  <Chip key={s} label={s} onPress={() => void send(s)} />
                ))}
              </View>
            </View>
          ) : (
            messages.map((m) => <Bubble key={m.id} message={m} />)
          )}
          {busy ? (
            <View className="flex-row items-center gap-2 px-1" accessibilityLabel="El asistente está escribiendo">
              <ActivityIndicator />
              <Text variant="label-md" tone="muted">
                Pensando…
              </Text>
            </View>
          ) : null}
        </ScrollView>
      </Screen>
    </KeyboardAvoidingView>
  );
}

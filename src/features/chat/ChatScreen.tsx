import { useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
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

import { BackHeader } from '@/features/shell';
import { formatRelativeTime } from '@/shared/format';
import { Card, DemoTag, Icon, Screen, SyncStatusBadge, Text } from '@/shared/ui';

import { DEMO_CONVERSATION_ID, useConversations, useMessages } from './hooks';
import { useLocalMessagesStore } from './localMessages';
import { checkMessageBody, demoReply } from './logic';
import { MAX_MESSAGE_LENGTH, type ChatMessage } from './types';

function Bubble({ message }: { message: ChatMessage }) {
  const mine = message.mine;
  return (
    <View className={mine ? 'items-end' : 'items-start'}>
      <View
        accessible
        accessibilityLabel={`${mine ? 'Tú' : 'Ellos'}: ${message.body}`}
        className={
          mine
            ? 'max-w-[82%] rounded-2xl rounded-br-md bg-primary px-3.5 py-2.5'
            : 'max-w-[82%] rounded-2xl rounded-bl-md bg-surface-container-lowest px-3.5 py-2.5 shadow-sm elevation-xs'
        }>
        <Text variant="body-lg" tone={mine ? 'onPrimary' : 'default'}>
          {message.body}
        </Text>
      </View>
      <View className="mt-1 flex-row items-center gap-2 px-1">
        <Text variant="label-sm" tone="muted">
          {formatRelativeTime(message.createdAt)}
        </Text>
        {message.syncStatus ? <SyncStatusBadge status={message.syncStatus} /> : null}
      </View>
    </View>
  );
}

/**
 * Chat entre dos vecinos. Lo que escribes se guarda primero en tu teléfono (y lo dice) y sale por la cola de
 * envío; cuando el servidor lo recibe deja de aparecer como «guardado». En la demostración, las respuestas son
 * guionadas y están marcadas como tales.
 */
export function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const conversationId = String(id ?? '');
  const { conversations } = useConversations();
  const conversation = conversations.find((c) => c.id === conversationId);
  const { messages, isLoading, isError, isDemo } = useMessages(conversationId);
  const send = useLocalMessagesStore((s) => s.send);
  const addDemoReply = useLocalMessagesStore((s) => s.addDemoReply);

  const [text, setText] = useState('');
  const [error, setError] = useState<string | undefined>();
  const scrollRef = useRef<ScrollViewInstance>(null);
  const sentCount = messages.filter((m) => m.mine).length;
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
  }, []);

  const onSend = () => {
    const check = checkMessageBody(text);
    if (!check.ok) {
      setError(check.error);
      return;
    }
    setError(undefined);
    send(conversationId, check.body, { demo: isDemo });
    setText('');
    if (isDemo || conversationId === DEMO_CONVERSATION_ID) {
      const reply = demoReply(sentCount + 1);
      if (reply) timers.current.push(setTimeout(() => addDemoReply(conversationId, reply), 1300));
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
      <Screen
        header={<BackHeader label={conversation?.otherName ?? 'Chat'} />}
        scroll={false}
        contentClassName="flex-1"
        footer={
          <View className="gap-2">
            {error ? (
              <Text variant="label-md" tone="error" accessibilityLiveRegion="polite">
                {error}
              </Text>
            ) : null}
            <View className="flex-row items-end gap-2">
              <TextInput
                accessibilityLabel="Escribe tu mensaje"
                placeholder="Escribe un mensaje…"
                value={text}
                onChangeText={(value) => {
                  setText(value.slice(0, MAX_MESSAGE_LENGTH));
                  if (error) setError(undefined);
                }}
                multiline
                className="max-h-28 min-h-12 flex-1 rounded-2xl bg-surface-container-low px-4 py-3 font-inter text-body-lg text-on-surface"
              />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Enviar mensaje"
                onPress={onSend}
                className="h-12 w-12 items-center justify-center rounded-full bg-primary active:opacity-80">
                <Icon name="send" size={22} color="onPrimary" />
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
          <Card tone="low" className="gap-1">
            <View className="flex-row items-center gap-2">
              <Icon name="shield-lock-outline" size={18} color="primary" />
              <Text variant="label-md" tone="primary" className="flex-1">
                {conversation ? `Sobre: ${conversation.postTitle}` : 'Conversación'}
              </Text>
              {isDemo ? <DemoTag /> : null}
            </View>
            <Text variant="label-md" tone="muted">
              No compartas teléfono, dirección exacta ni datos sensibles. Coordinen en un lugar público del barrio.
            </Text>
          </Card>

          {isLoading ? (
            <View className="items-center py-6" accessibilityLabel="Cargando mensajes">
              <ActivityIndicator />
            </View>
          ) : isError && messages.length === 0 ? (
            <Text tone="muted" className="text-center">
              No pudimos cargar los mensajes. Se intentará de nuevo solo.
            </Text>
          ) : messages.length === 0 ? (
            <Text tone="muted" className="py-6 text-center">
              Aún no hay mensajes. Saluda primero.
            </Text>
          ) : (
            messages.map((message) => <Bubble key={message.id} message={message} />)
          )}
        </ScrollView>
      </Screen>
    </KeyboardAvoidingView>
  );
}

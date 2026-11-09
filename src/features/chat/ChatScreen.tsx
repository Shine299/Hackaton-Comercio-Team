import { useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  TextInput,
  View,
  type ScrollViewInstance,
} from 'react-native';

import { BackHeader } from '@/features/shell';
import { formatRelativeTime } from '@/shared/format';
import { Button, Card, DemoTag, Icon, Screen, SyncStatusBadge, Text } from '@/shared/ui';
import type { SyncStatus } from '@/shared/sync/status';

import { isDemoConversation, useConversations, useMessages } from './hooks';
import { useLocalMessagesStore } from './localMessages';
import { checkMessageBody, demoReply } from './logic';
import { MAX_MESSAGE_LENGTH, type ChatMessage } from './types';

const REPORT_LABEL: Partial<Record<SyncStatus, string>> = {
  local: 'Reportado · guardado en tu teléfono',
  pending: 'Reportado · pendiente de envío',
  sending: 'Reportado · enviando…',
  received: 'Reportado · recibido',
};

/** Burbuja. Los mensajes de la otra persona se reportan con pulsación larga (o con la acción del lector). */
function Bubble({
  message,
  reportStatus,
  hideSyncStatus,
  onReport,
}: {
  message: ChatMessage;
  reportStatus?: SyncStatus;
  /** En la conversación de demostración el mensaje nunca sale del teléfono: la etiqueta «Demo» ya lo dice. */
  hideSyncStatus?: boolean;
  onReport?: () => void;
}) {
  const mine = message.mine;
  return (
    <View className={mine ? 'items-end' : 'items-start'}>
      <Pressable
        accessible
        accessibilityLabel={`${mine ? 'Tú' : 'Ellos'}: ${message.body}${reportStatus ? '. Reportado' : ''}`}
        accessibilityHint={onReport ? 'Mantén presionado para reportar este mensaje' : undefined}
        accessibilityActions={onReport ? [{ name: 'report', label: 'Reportar mensaje' }] : undefined}
        onAccessibilityAction={(event) => {
          if (event.nativeEvent.actionName === 'report') onReport?.();
        }}
        onLongPress={onReport}
        delayLongPress={450}
        className={
          mine
            ? 'max-w-[82%] rounded-2xl rounded-br-md bg-primary px-3.5 py-2.5'
            : 'max-w-[82%] rounded-2xl rounded-bl-md bg-surface-container-lowest px-3.5 py-2.5 shadow-sm elevation-xs'
        }>
        <Text variant="body-lg" tone={mine ? 'onPrimary' : 'default'}>
          {message.body}
        </Text>
      </Pressable>
      <View className="mt-1 flex-row items-center gap-2 px-1">
        <Text variant="label-sm" tone="muted">
          {formatRelativeTime(message.createdAt)}
        </Text>
        {message.syncStatus && !hideSyncStatus ? <SyncStatusBadge status={message.syncStatus} /> : null}
        {reportStatus ? (
          <View className="flex-row items-center gap-1">
            <Icon name="flag-outline" size={14} color="onSurfaceVariant" />
            <Text variant="label-sm" tone="muted">
              {REPORT_LABEL[reportStatus] ?? 'Reportado'}
            </Text>
          </View>
        ) : null}
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
  const block = useLocalMessagesStore((s) => s.block);
  const reportMessage = useLocalMessagesStore((s) => s.reportMessage);
  const reported = useLocalMessagesStore((s) => s.reportedMessages);
  const blockedLocally = useLocalMessagesStore((s) => s.blockedConversationIds.includes(conversationId));
  const blocked = blockedLocally || Boolean(conversation?.blocked);
  const otherName = conversation?.otherName ?? 'este vecino';

  const [text, setText] = useState('');
  const [error, setError] = useState<string | undefined>();
  const scrollRef = useRef<ScrollViewInstance>(null);
  const sentCount = messages.filter((m) => m.mine).length;
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
  }, []);

  // SPEC-048: mientras el chat está abierto, lo que llega se da por leído y no notifica.
  const markRead = useLocalMessagesStore((s) => s.markRead);
  const setOpenConversation = useLocalMessagesStore((s) => s.setOpenConversation);
  const lastMessageAt = messages.at(-1)?.createdAt ?? 0;
  useEffect(() => {
    setOpenConversation(conversationId);
    return () => {
      markRead(conversationId);
      setOpenConversation(null);
    };
  }, [conversationId, markRead, setOpenConversation]);
  useEffect(() => {
    markRead(conversationId);
  }, [conversationId, lastMessageAt, conversation?.lastAt, markRead]);

  const onSend = () => {
    const check = checkMessageBody(text);
    if (!check.ok) {
      setError(check.error);
      return;
    }
    setError(undefined);
    send(conversationId, check.body, { demo: isDemo });
    setText('');
    if (isDemo || isDemoConversation(conversationId)) {
      const reply = demoReply(sentCount + 1);
      if (reply) timers.current.push(setTimeout(() => addDemoReply(conversationId, reply), 1300));
    }
  };

  const confirmBlock = () =>
    Alert.alert(
      `¿Bloquear a ${otherName}?`,
      'Ninguno de los dos podrá escribir en esta conversación ni abrir otra. No se le avisa.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Bloquear',
          style: 'destructive',
          onPress: () => block(conversationId, { demo: isDemo }),
        },
      ],
    );

  const confirmReport = (message: ChatMessage) =>
    Alert.alert('¿Reportar este mensaje?', `«${message.body.slice(0, 80)}»\n\nLo revisa el equipo de moderación.`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Reportar',
        style: 'destructive',
        onPress: () => reportMessage(message.id, { demo: isDemo }),
      },
    ]);

  return (
    // Android con edge-to-edge (SDK 58) ya no reduce la ventana al abrir el teclado: hay que dar el relleno a mano.
    <KeyboardAvoidingView behavior="padding" className="flex-1">
      <Screen
        header={<BackHeader label={conversation?.otherName ?? 'Chat'} />}
        scroll={false}
        contentClassName="flex-1"
        footer={
          blocked ? (
            <View className="flex-row items-center gap-2 py-2" accessibilityLiveRegion="polite">
              <Icon name="block-helper" size={18} color="onSurfaceVariant" />
              <Text tone="muted" className="flex-1">
                {blockedLocally
                  ? `Bloqueaste a ${otherName}. Ya no pueden escribirse.`
                  : 'Esta conversación está cerrada. Ya no se pueden enviar mensajes.'}
              </Text>
            </View>
          ) : (
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
          )
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
            <Text variant="label-md" tone="muted">
              Yunta no verifica a las personas. Mantén presionado un mensaje para reportarlo.
            </Text>
            {!blocked ? (
              <Button label={`Bloquear a ${otherName}`} variant="ghost" icon="block-helper" onPress={confirmBlock} />
            ) : null}
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
            messages.map((message) => (
              <Bubble
                key={message.id}
                message={message}
                reportStatus={reported[message.id]}
                hideSyncStatus={isDemo}
                onReport={!message.mine && !reported[message.id] ? () => confirmReport(message) : undefined}
              />
            ))
          )}
        </ScrollView>
      </Screen>
    </KeyboardAvoidingView>
  );
}

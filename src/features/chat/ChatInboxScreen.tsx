import { useRouter } from 'expo-router';
import { ActivityIndicator, Pressable, View } from 'react-native';

import { formatRelativeTime } from '@/shared/format';
import { Button, Card, DemoTag, GRADIENTS, Icon, Screen, SectionHero, Text } from '@/shared/ui';

import { DEMO_CONVERSATION_ID, useConversations, usePendingRequests, useRespondToRequest } from './hooks';
import { useLocalMessagesStore } from './localMessages';
import { DEMO_REQUEST_ID } from './demo';
import type { Conversation, PendingRequest } from './types';

function RequestRow({ request }: { request: PendingRequest }) {
  const router = useRouter();
  const { accept, decline } = useRespondToRequest();
  const handleDemo = useLocalMessagesStore((s) => s.handleDemoRequest);
  const isDemo = request.id === DEMO_REQUEST_ID;
  const busy = accept.isPending || decline.isPending;

  return (
    <Card className="gap-3">
      <View className="gap-1">
        <Text variant="body-lg-bold">{request.requesterName} quiere contactarte</Text>
        <Text variant="label-md" tone="muted" numberOfLines={1}>
          Sobre: {request.postTitle} · {formatRelativeTime(request.createdAt)}
        </Text>
        {request.message ? <Text>«{request.message}»</Text> : null}
        {isDemo ? <DemoTag /> : null}
      </View>
      {accept.isError || decline.isError ? (
        <Text variant="label-md" tone="error" accessibilityLiveRegion="polite">
          No se pudo responder. Revisa tu conexión e inténtalo de nuevo.
        </Text>
      ) : null}
      <View className="flex-row gap-2">
        <Button
          label="Rechazar"
          variant="tonal"
          fullWidth={false}
          className="flex-1"
          disabled={busy}
          onPress={() => (isDemo ? handleDemo() : decline.mutate(request.id))}
        />
        <Button
          label="Aceptar y chatear"
          icon="message-text-outline"
          fullWidth={false}
          className="flex-[1.6]"
          loading={accept.isPending}
          disabled={busy}
          onPress={() => {
            if (isDemo) {
              handleDemo();
              router.push({ pathname: '/chat/[id]', params: { id: DEMO_CONVERSATION_ID } });
              return;
            }
            accept.mutate(request.id, {
              onSuccess: (conversationId) => router.push({ pathname: '/chat/[id]', params: { id: conversationId } }),
            });
          }}
        />
      </View>
    </Card>
  );
}

function ConversationRow({ conversation, onPress }: { conversation: Conversation; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Chat con ${conversation.otherName}, sobre ${conversation.postTitle}. ${conversation.lastBody}`}
      onPress={onPress}
      className="flex-row items-center gap-3 rounded-2xl bg-surface-container-lowest p-3.5 shadow-sm elevation-xs active:opacity-90">
      <View className="h-12 w-12 items-center justify-center rounded-full bg-primary-container">
        <Text variant="body-lg-bold" tone="onPrimary">
          {conversation.otherName.charAt(0).toUpperCase()}
        </Text>
      </View>
      <View className="min-w-0 flex-1 gap-0.5">
        <View className="flex-row items-center justify-between gap-2">
          <Text variant="body-lg-bold" numberOfLines={1} className="flex-1">
            {conversation.otherName}
          </Text>
          {conversation.lastAt > 0 ? (
            <Text variant="label-sm" tone="muted">
              {formatRelativeTime(conversation.lastAt)}
            </Text>
          ) : null}
        </View>
        <Text variant="label-md" tone="primary" numberOfLines={1}>
          {conversation.postTitle}
        </Text>
        <Text variant="body-md" tone="muted" numberOfLines={1}>
          {conversation.lastBody || 'Aún no hay mensajes. Saluda primero.'}
        </Text>
        {conversation.isDemo ? <DemoTag /> : null}
      </View>
      <Icon name="chevron-right" size={22} color="onSurfaceVariant" />
    </Pressable>
  );
}

/**
 * Mensajes: solicitudes por responder (si publicaste algo) y tus conversaciones. Un chat solo se abre cuando
 * el dueño acepta la solicitud de contacto.
 */
export function ChatInboxScreen() {
  const router = useRouter();
  const { conversations, isLoading } = useConversations();
  const { data: pending = [] } = usePendingRequests();

  return (
    <Screen contentClassName="gap-4 px-5 pb-8">
      <SectionHero
        gradient={GRADIENTS.comunidad}
        title="Mensajes"
        description="Habla con tus vecinos cuando acepten tu solicitud."
        steps={[
          { icon: 'send-outline', label: 'Pides contacto' },
          { icon: 'check-circle-outline', label: 'Aceptan' },
          { icon: 'message-text-outline', label: 'Chatean' },
        ]}
      />

      {pending.length > 0 ? (
        <View className="gap-3">
          <Text variant="headline-sm" accessibilityRole="header">
            Por responder · {pending.length}
          </Text>
          {pending.map((request) => (
            <RequestRow key={request.id} request={request} />
          ))}
        </View>
      ) : null}

      <View className="gap-3">
        <Text variant="headline-sm" accessibilityRole="header">
          Conversaciones
        </Text>
        {isLoading ? (
          <View className="items-center py-6" accessibilityLabel="Cargando conversaciones">
            <ActivityIndicator />
          </View>
        ) : conversations.length === 0 ? (
          <Card className="items-center gap-2 py-8">
            <Icon name="message-text-outline" size={34} color="primary" />
            <Text variant="headline-sm" className="text-center">
              Aún no tienes conversaciones
            </Text>
            <Text tone="muted" className="text-center">
              Pide contacto en una publicación. Cuando te acepten, el chat aparece aquí.
            </Text>
          </Card>
        ) : (
          conversations.map((conversation) => (
            <ConversationRow
              key={conversation.id}
              conversation={conversation}
              onPress={() => router.push({ pathname: '/chat/[id]', params: { id: conversation.id } })}
            />
          ))
        )}
      </View>
    </Screen>
  );
}

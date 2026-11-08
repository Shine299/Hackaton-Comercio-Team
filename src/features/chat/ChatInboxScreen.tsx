import { useRouter } from 'expo-router';
import { ActivityIndicator, Pressable, View } from 'react-native';

import { SectionHeader } from '@/features/shell';
import { formatRelativeTime } from '@/shared/format';
import { Avatar, Card, DemoTag, GRADIENTS, Icon, Screen, SectionHero, Text } from '@/shared/ui';

import { useConversations } from './hooks';
import { useChatUnread } from './useChatUnread';
import type { Conversation } from './types';

function ConversationRow({
  conversation,
  unread,
  onPress,
}: {
  conversation: Conversation;
  unread: boolean;
  onPress: () => void;
}) {
  const preview = conversation.blocked
    ? 'Conversación bloqueada'
    : conversation.lastBody || 'Aún no hay mensajes. Saluda primero.';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${unread ? 'Nuevo mensaje. ' : ''}Chat con ${conversation.otherName}, sobre ${conversation.postTitle}. ${preview}${conversation.isDemo ? '. Dato de demostración' : ''}`}
      onPress={onPress}
      className="min-h-16 flex-row items-center gap-3 rounded-2xl bg-surface-container-lowest p-3.5 shadow-sm elevation-xs active:opacity-90">
      <Avatar name={conversation.otherName} id={conversation.id} size={40} />
      <View className="min-w-0 flex-1 gap-0.5">
        <View className="flex-row items-center justify-between gap-2">
          <Text variant="body-lg-bold" numberOfLines={1} className="flex-1">
            {conversation.otherName}
          </Text>
          {unread ? (
            <View className="flex-row items-center gap-1 rounded-full bg-secondary-fixed px-2 py-0.5">
              <View className="h-2 w-2 rounded-full bg-secondary" />
              <Text variant="label-sm" tone="secondary">
                Nuevo
              </Text>
            </View>
          ) : null}
          {conversation.lastAt > 0 ? (
            <Text variant="label-sm" tone="muted">
              {formatRelativeTime(conversation.lastAt)}
            </Text>
          ) : null}
        </View>
        <Text variant="label-md" tone="primary" numberOfLines={1}>
          {conversation.postTitle}
        </Text>
        <View className="flex-row items-center gap-1">
          {conversation.blocked ? <Icon name="block-helper" size={14} color="onSurfaceVariant" /> : null}
          <Text variant="body-md" tone="muted" numberOfLines={1} className="flex-1">
            {preview}
          </Text>
        </View>
        {conversation.isDemo ? <DemoTag /> : null}
      </View>
      <Icon name="chevron-right" size={22} color="onSurfaceVariant" />
    </Pressable>
  );
}

/**
 * Pestaña Chat (SPEC-045): tus conversaciones. Se abren con «Escribir» en cualquier publicación de Ayuda,
 * sin solicitud previa.
 */
export function ChatInboxScreen() {
  const router = useRouter();
  const { conversations, isLoading } = useConversations();
  const unreadIds = new Set(useChatUnread().map((c) => c.id));

  return (
    <Screen contentClassName="gap-4 px-5 pb-8 pt-4">
      <SectionHeader title="Chat" />

      <SectionHero
        gradient={GRADIENTS.comunidad}
        title="Mensajes"
        description="Habla con tus vecinos sobre lo que ofrecen o necesitan."
        steps={[
          { icon: 'storefront-outline', label: 'Ves algo' },
          { icon: 'message-text-outline', label: 'Escribes' },
          { icon: 'handshake-outline', label: 'Coordinan' },
        ]}
      />

      <Card tone="low" className="flex-row items-start gap-2">
        <Icon name="shield-account-outline" size={20} color="primary" />
        <Text variant="label-md" tone="muted" className="flex-1">
          Yunta conecta vecinos; no verifica a las personas ni reemplaza al 105. Si algo te incomoda, bloquea o reporta
          desde el chat.
        </Text>
      </Card>

      <View className="gap-3">
        <Text variant="headline-sm" accessibilityRole="header">
          Conversaciones
        </Text>
        {isLoading ? (
          <View className="items-center py-6" accessibilityLabel="Cargando conversaciones">
            <ActivityIndicator />
          </View>
        ) : (
          conversations.map((conversation) => (
            <ConversationRow
              key={conversation.id}
              conversation={conversation}
              unread={unreadIds.has(conversation.id)}
              onPress={() => router.push({ pathname: '/chat/[id]', params: { id: conversation.id } })}
            />
          ))
        )}
        <Text variant="label-md" tone="muted" className="text-center">
          Para empezar una conversación, toca «Escribir» en una publicación de Ayuda.
        </Text>
      </View>
    </Screen>
  );
}

import { useRouter } from 'expo-router';
import { View } from 'react-native';

import { useRegistrationGate } from '@/features/session';
import { Button, Text, type ButtonProps } from '@/shared/ui';

import { type StartChatTarget, useStartChat } from './hooks';
import { canStartChat, startChatErrorText } from './logic';

type StartChatButtonProps = {
  post: StartChatTarget;
  size?: ButtonProps['size'];
  variant?: ButtonProps['variant'];
  fullWidth?: boolean;
  className?: string;
};

/**
 * «Escribir» (SPEC-045): abre o reutiliza el chat de una publicación, sin solicitud previa. Pide la cuenta vecinal
 * (solo nombre público) si aún no existe. No aparece en publicaciones propias ni inactivas.
 */
export function StartChatButton({ post, size, variant, fullWidth = true, className }: StartChatButtonProps) {
  const router = useRouter();
  const { requireRegistration, sheet } = useRegistrationGate();
  const start = useStartChat();

  if (!canStartChat(post)) return null;

  const onPress = () =>
    requireRegistration('Para escribir a un vecino, crea tu cuenta vecinal. No pedimos teléfono ni dirección.', () =>
      start.mutate(post, {
        onSuccess: (conversationId) => router.push({ pathname: '/chat/[id]', params: { id: conversationId } }),
      }),
    );

  return (
    <View className={fullWidth ? 'gap-1' : className}>
      <Button
        label="Escribir"
        icon="message-text-outline"
        size={size}
        variant={variant}
        fullWidth={fullWidth}
        className={fullWidth ? className : undefined}
        loading={start.isPending}
        accessibilityLabel={`Escribir a ${post.author.displayName} sobre ${post.title}`}
        onPress={onPress}
      />
      {start.isError ? (
        <Text variant="label-md" tone="error" accessibilityLiveRegion="polite">
          {startChatErrorText(start.error.message)}
        </Text>
      ) : null}
      {sheet}
    </View>
  );
}

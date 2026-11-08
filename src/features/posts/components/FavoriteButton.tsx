import { Pressable, View } from 'react-native';

import { useRegistrationGate } from '@/features/session';
import { Icon } from '@/shared/ui';

import { useSavedStore } from '../savedStore';

/**
 * Corazón para guardar un negocio o publicación como favorito. Guardar pide cuenta (como en el detalle);
 * quitar un favorito no. Tamaño táctil de 48 dp y estado también para el lector de pantalla.
 */
export function FavoriteButton({ postId, title }: { postId: string; title: string }) {
  const saved = useSavedStore((s) => s.postIds.includes(postId));
  const toggle = useSavedStore((s) => s.toggle);
  const { requireRegistration, sheet } = useRegistrationGate();

  const onPress = () => {
    if (saved) toggle(postId);
    else requireRegistration('Para guardar tus favoritos, crea tu cuenta vecinal (solo un nombre público).', () => toggle(postId));
  };

  return (
    <View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={saved ? `Quitar de favoritos: ${title}` : `Guardar en favoritos: ${title}`}
        accessibilityState={{ selected: saved }}
        onPress={onPress}
        hitSlop={4}
        className="h-12 w-12 items-center justify-center rounded-full bg-white/90 shadow-sm elevation-xs active:opacity-80">
        <Icon name={saved ? 'heart' : 'heart-outline'} size={26} color={saved ? 'error' : 'primary'} />
      </Pressable>
      {sheet}
    </View>
  );
}

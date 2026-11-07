import type { ReactNode } from 'react';
import { Modal, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from './Text';

type BottomSheetProps = {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  /** Acción fija al pie (botón principal). */
  footer?: ReactNode;
  /** Elemento a la derecha del título (por ejemplo, «Limpiar»). */
  headerAction?: ReactNode;
};

/**
 * Panel inferior accesible: toca fuera para cerrar, `onRequestClose` para el botón atrás de Android
 * y contenido desplazable con teclado compatible.
 */
export function BottomSheet({
  visible,
  title,
  onClose,
  children,
  footer,
  headerAction,
}: BottomSheetProps) {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-black/40" accessibilityViewIsModal>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Cerrar: ${title}`}
          className="flex-1"
          onPress={onClose}
        />
        <View
          className="max-h-[90%] rounded-t-3xl bg-surface px-4 pt-4"
          style={{ paddingBottom: Math.max(insets.bottom, 16) }}>
          <View className="mb-3 flex-row items-center justify-between gap-2">
            <Text variant="headline-md" className="flex-1" accessibilityRole="header">
              {title}
            </Text>
            {headerAction}
          </View>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerClassName="gap-4 pb-4">
            {children}
          </ScrollView>
          {footer ? <View className="gap-2 pt-2">{footer}</View> : null}
        </View>
      </View>
    </Modal>
  );
}

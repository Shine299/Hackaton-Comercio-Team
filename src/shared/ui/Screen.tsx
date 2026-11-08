import type { ReactNode } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useBarStore } from '../nav/barStore';
import { useScrollLockStore } from '../nav/scrollLockStore';
import { cn } from './cn';

type ScreenProps = {
  children: ReactNode;
  /** Barra superior fija (TopBar, EmergencyHeader…). Si existe, se encarga del inset superior. */
  header?: ReactNode;
  /** Pie fijo (por ejemplo, botón principal de un formulario). */
  footer?: ReactNode;
  scroll?: boolean;
  /** Clases del contenedor interno (padding, gap…). */
  contentClassName?: string;
  /** Aplica el inset inferior (úsalo en pantallas sin tab bar). */
  safeBottom?: boolean;
  /** Desactiva el inset superior cuando el navegador ya pinta un header (p. ej. TopBar en tabs). */
  noTopInset?: boolean;
};

/** Contenedor base de pantalla: fondo, safe areas y scroll opcional. */
export function Screen({
  children,
  header,
  footer,
  scroll = true,
  contentClassName,
  safeBottom = false,
  noTopInset = false,
}: ScreenProps) {
  const insets = useSafeAreaInsets();
  const barVisible = useBarStore((s) => s.visible);
  const scrollLocked = useScrollLockStore((s) => s.locked);
  const bottomPad = !barVisible && (safeBottom || footer) ? insets.bottom : 0;

  return (
    <View className="flex-1 bg-surface-container-low" style={{ paddingTop: header || noTopInset ? 0 : insets.top }}>
      {header}
      {scroll ? (
        <ScrollView
          className="flex-1"
          contentContainerClassName={cn('gap-4 p-4', contentClassName)}
          scrollEnabled={!scrollLocked}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          {children}
        </ScrollView>
      ) : (
        <View className={cn('flex-1', contentClassName)}>{children}</View>
      )}
      {footer ? (
        <View className="border-t border-outline-variant bg-surface px-4 pt-3" style={{ paddingBottom: bottomPad + 12 }}>
          {footer}
        </View>
      ) : bottomPad ? (
        <View style={{ height: bottomPad }} />
      ) : null}
    </View>
  );
}

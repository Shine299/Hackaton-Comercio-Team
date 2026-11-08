import { LinearGradient } from 'expo-linear-gradient';
import { View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { type Gradient, PressableScale, Text, TourTarget } from '@/shared/ui';

type ActionTileProps = {
  /** Id para el recorrido guiado (`tile-<sección>`). */
  tourId: string;
  /** Título corto (1 o 2 palabras). */
  title: string;
  /** Una sola línea de apoyo. */
  detail: string;
  /** Sección a la que lleva, para que el lector de pantalla la anuncie. */
  section: string;
  xml: string;
  gradient: Gradient;
  onPress: () => void;
  /** Modo fácil: los botones van uno debajo del otro, a todo el ancho. */
  stacked?: boolean;
};

/**
 * Acceso a una sección del Inicio (SPEC-054): fila compacta con su degradado, una ilustración pequeña, un título
 * corto y una línea de apoyo. Mide ≥ 72 dp de alto (más con letra grande).
 */
export function ActionTile({ tourId, title, detail, section, xml, gradient, onPress, stacked = false }: ActionTileProps) {
  return (
    <TourTarget id={tourId} className={stacked ? undefined : 'flex-1'}>
      <PressableScale
        accessibilityRole="button"
        accessibilityLabel={`${title}. ${detail}`}
        accessibilityHint={`Abre ${section}`}
        onPress={onPress}
        className="min-h-[72px] flex-1 overflow-hidden rounded-2xl shadow-sm elevation-xs">
        <LinearGradient
          colors={gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ flex: 1, paddingHorizontal: 12, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <View className="h-11 w-11 items-center justify-end overflow-hidden rounded-xl bg-white/25">
            <SvgXml xml={xml} width={48} height={38} />
          </View>
          <View className="min-w-0 flex-1">
            <Text variant="body-lg-bold" tone="onPrimary" numberOfLines={2}>
              {title}
            </Text>
            <Text variant="label-md" tone="onPrimary" numberOfLines={1}>
              {detail}
            </Text>
          </View>
        </LinearGradient>
      </PressableScale>
    </TourTarget>
  );
}

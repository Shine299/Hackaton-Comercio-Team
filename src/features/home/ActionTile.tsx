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
 * Acceso a una sección del Inicio (SPEC-054): caja con su degradado, una ilustración grande (76 dp), un título
 * corto y una línea de apoyo. En fila si va a todo ancho; icono arriba si es de medio ancho. Mide ≥ 112 dp de alto (más con letra grande); la letra no se escala.
 */
export function ActionTile({ tourId, title, detail, section, xml, gradient, onPress, stacked = false }: ActionTileProps) {
  return (
    <TourTarget id={tourId} className={stacked ? undefined : 'flex-1'}>
      <PressableScale
        accessibilityRole="button"
        accessibilityLabel={`${title}. ${detail}`}
        accessibilityHint={`Abre ${section}`}
        onPress={onPress}
        className="min-h-[112px] flex-1 overflow-hidden rounded-2xl shadow-sm elevation-xs">
        <LinearGradient
          colors={gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            flex: 1,
            paddingHorizontal: 15,
            paddingVertical: 14,
            flexDirection: stacked ? 'row' : 'column',
            alignItems: stacked ? 'center' : 'flex-start',
            gap: stacked ? 14 : 10,
          }}>
          <View className="h-[76px] w-[76px] items-center justify-center overflow-hidden rounded-2xl bg-white/25">
            <SvgXml xml={xml} width={66} height={61} />
          </View>
          <View className={stacked ? 'min-w-0 flex-1' : 'w-full'}>
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

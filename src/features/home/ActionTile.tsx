import { LinearGradient } from 'expo-linear-gradient';
import { View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { type Gradient, PressableScale, Text, TourTarget } from '@/shared/ui';

type ActionTileProps = {
  /** Id para el recorrido guiado (`tile-<sección>`). */
  tourId: string;
  verb: string;
  detail: string;
  xml: string;
  gradient: Gradient;
  onPress: () => void;
  /** Modo fácil: los botones van uno debajo del otro, a todo el ancho. */
  stacked?: boolean;
};

/** Botón grande del Inicio: una sección, con su degradado, su ilustración y un verbo claro. Mide ≥ 144 dp de alto. */
export function ActionTile({ tourId, verb, detail, xml, gradient, onPress, stacked = false }: ActionTileProps) {
  return (
    <TourTarget id={tourId} className={stacked ? undefined : "flex-1"}>
      <PressableScale
        accessibilityRole="button"
        accessibilityLabel={`${verb}. ${detail}`}
        onPress={onPress}
        className="min-h-36 flex-1 overflow-hidden rounded-3xl shadow-md elevation-sm">
        <LinearGradient
          colors={gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ flex: 1, padding: 14, justifyContent: 'space-between' }}>
          <View className="items-end">
            <View className="h-16 w-20 items-center justify-end overflow-hidden rounded-2xl bg-white/25">
              <SvgXml xml={xml} width={84} height={64} />
            </View>
          </View>
          <View className="gap-0.5">
            <Text variant="headline-sm" tone="onPrimary" numberOfLines={2}>
              {verb}
            </Text>
            <Text variant="label-md" tone="onPrimary" numberOfLines={2} className="opacity-90">
              {detail}
            </Text>
          </View>
        </LinearGradient>
      </PressableScale>
    </TourTarget>
  );
}

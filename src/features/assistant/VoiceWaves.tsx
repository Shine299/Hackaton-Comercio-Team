import { View } from 'react-native';

import { TRAIL_LENGTH } from './levels';

const COLOR = { listening: '#E9D5FF', speaking: '#FFD166', quiet: '#C4B5FD' } as const;

/**
 * Estela de ancho completo (SPEC-053): barras que suben desde el borde de abajo de la pantalla, como en una charla de voz.
 * Al escuchar sigue el volumen REAL del micrófono; mientras Yunta habla se anima (la voz del teléfono no entrega su volumen);
 * al pensar queda quieta. Es decorativa: el estado también se dice con texto en la pantalla.
 */
export function VoiceWaves({ levels, mode, height = 240 }: { levels: readonly number[]; mode: 'listening' | 'speaking' | 'quiet'; height?: number }) {
  const bars = [...Array<number>(Math.max(0, TRAIL_LENGTH - levels.length)).fill(0), ...levels].slice(-TRAIL_LENGTH);
  return (
    <View
      pointerEvents="none"
      importantForAccessibility="no-hide-descendants"
      accessibilityElementsHidden
      style={{ height, flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 10, gap: 4 }}>
      {bars.map((unit, index) => (
        <View
          key={index}
          style={{
            flex: 1,
            height: 8 + unit * (height - 16),
            borderTopLeftRadius: 14,
            borderTopRightRadius: 14,
            backgroundColor: COLOR[mode],
            opacity: 0.2 + 0.8 * (index / (TRAIL_LENGTH - 1)),
          }}
        />
      ))}
    </View>
  );
}

import { View } from 'react-native';

import { cn, Text } from '@/shared/ui';

import { isHearing, TRAIL_LENGTH } from './levels';

/**
 * Estela de audio (SPEC-053): barras que suben desde abajo y se desplazan hacia la izquierda, como una estela.
 * - `listening`: sigue el volumen REAL del micrófono; es la comprobación de que el teléfono te está oyendo.
 * - `speaking`: animación mientras Yunta habla (no mide nada: la voz del teléfono no entrega su volumen).
 * El mensaje de texto dice lo mismo que el dibujo, para quien no lo ve.
 */
export function VoiceTrail({ levels, mode }: { levels: readonly number[]; mode: 'listening' | 'speaking' | 'idle' }) {
  const bars = [...Array<number>(Math.max(0, TRAIL_LENGTH - levels.length)).fill(0), ...levels].slice(-TRAIL_LENGTH);
  const color = mode === 'speaking' ? 'bg-secondary' : 'bg-primary';
  const label =
    mode === 'speaking'
      ? 'Yunta está hablando'
      : mode === 'listening'
        ? isHearing(levels)
          ? 'Te estoy oyendo'
          : 'Esperando tu voz… si no se mueve, habla más cerca del teléfono'
        : '';

  return (
    <View className="items-center gap-2" accessible={label.length > 0} accessibilityLabel={label || undefined} accessibilityLiveRegion="polite">
      <View
        // El dibujo es decorativo: lo que dice se lee en el texto de abajo.
        importantForAccessibility="no-hide-descendants"
        accessibilityElementsHidden
        style={{ height: 72, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', gap: 3 }}>
        {bars.map((unit, index) => (
          <View
            key={index}
            className={cn('rounded-full', color)}
            style={{ width: 6, height: 4 + unit * 64, opacity: 0.2 + 0.8 * (index / (TRAIL_LENGTH - 1)) }}
          />
        ))}
      </View>
      {label ? (
        <Text variant="label-md" tone={mode === 'listening' && !isHearing(levels) ? 'muted' : 'primary'}>
          {label}
        </Text>
      ) : null}
    </View>
  );
}

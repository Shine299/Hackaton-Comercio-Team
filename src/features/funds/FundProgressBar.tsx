import { View } from 'react-native';

import { cn } from '@/shared/ui';

type Props = {
  /** 0–100. */
  pct: number;
  /** Texto que lee el lector de pantalla, p. ej. «S/ 840 de S/ 1 200, 70 %». */
  label: string;
  thick?: boolean;
};

/** Barra de avance de un fondo. El valor también va en texto al lado (nunca solo color). */
export function FundProgressBar({ pct, label, thick = false }: Props) {
  const value = Math.max(0, Math.min(100, pct));
  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(value) }}
      className={cn('w-full overflow-hidden rounded-full bg-primary-fixed', thick ? 'h-3.5' : 'h-2.5')}>
      <View className="h-full rounded-full bg-primary" style={{ width: `${value}%` }} />
    </View>
  );
}

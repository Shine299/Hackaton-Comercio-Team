import { LinearGradient } from 'expo-linear-gradient';
import { View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { Icon, type IconName } from './Icon';
import { Text } from './Text';

type SectionHeroProps = {
  gradient: readonly [string, string];
  /** Frase muy corta (3 a 5 palabras). */
  title: string;
  /** Una sola línea: qué hace la sección. */
  description: string;
  /** Ilustración de la sección (texto SVG). */
  xml?: string;
  /** «Cómo funciona»: 3 pasos con icono y 1 o 2 palabras. */
  steps?: { icon: IconName; label: string }[];
  /** Versión baja: solo título y línea (para pantallas donde la acción va primero). */
  compact?: boolean;
};

/** Banner de color con degradado: lo esencial de la sección de un vistazo, con poco texto. */
export function SectionHero({ gradient, title, description, xml, steps, compact = false }: SectionHeroProps) {
  return (
    <LinearGradient
      colors={gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ borderRadius: 28, padding: compact ? 16 : 18, gap: 14, overflow: 'hidden' }}>
      <View className="flex-row items-center gap-3">
        <View className="flex-1 gap-1">
          <Text variant={compact ? 'body-lg-bold' : 'headline-md'} tone="onPrimary" accessibilityRole="header">
            {title}
          </Text>
          <Text variant="body-md" tone="onPrimary" className="opacity-95">
            {description}
          </Text>
        </View>
        {xml && !compact ? (
          <View className="h-20 w-24 items-center justify-end overflow-hidden rounded-2xl bg-white/25">
            <SvgXml xml={xml} width={96} height={72} />
          </View>
        ) : null}
      </View>
      {steps && steps.length > 0 && !compact ? (
        <View className="flex-row gap-2" accessibilityLabel="Cómo funciona">
          {steps.map((step) => (
            <View key={step.label} className="flex-1 items-center gap-1.5 rounded-2xl bg-white/20 px-1.5 py-2.5">
              <View className="h-10 w-10 items-center justify-center rounded-full bg-white">
                <Icon name={step.icon} size={22} color="primary" />
              </View>
              <Text variant="label-md" tone="onPrimary" className="text-center" numberOfLines={2}>
                {step.label}
              </Text>
            </View>
          ))}
        </View>
      ) : null}
    </LinearGradient>
  );
}

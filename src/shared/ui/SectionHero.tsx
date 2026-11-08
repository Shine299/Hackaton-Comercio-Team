import { LinearGradient } from 'expo-linear-gradient';
import { View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { Icon, type IconName } from './Icon';
import { Text } from './Text';

type SectionHeroProps = {
  gradient: readonly [string, string];
  /** Frase corta y con gancho. */
  title: string;
  /** Qué hace esta sección, en lenguaje cotidiano. */
  description: string;
  /** Ilustración de la sección (texto SVG). */
  xml?: string;
  /** «Cómo funciona»: 2 o 3 verbos cortos con icono. */
  steps?: { icon: IconName; label: string }[];
  /** Versión baja: solo título y descripción (para pantallas donde la acción va primero). */
  compact?: boolean;
};

/** Banner de color con degradado que explica de qué trata la sección y cómo se usa. */
export function SectionHero({ gradient, title, description, xml, steps, compact = false }: SectionHeroProps) {
  return (
    <LinearGradient
      colors={gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ borderRadius: 28, padding: compact ? 16 : 20, gap: 10, overflow: 'hidden' }}>
      <View className="flex-row items-center gap-3">
        <View className="flex-1 gap-1.5">
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
          {steps.map((step, i) => (
            <View key={step.label} className="flex-1 flex-row items-center gap-1.5 rounded-2xl bg-white/20 px-2.5 py-2">
              <Icon name={step.icon} size={18} color="onPrimary" />
              <Text variant="label-md" tone="onPrimary" className="flex-1" numberOfLines={2}>
                {i + 1}. {step.label}
              </Text>
            </View>
          ))}
        </View>
      ) : null}
    </LinearGradient>
  );
}

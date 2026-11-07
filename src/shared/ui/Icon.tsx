import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import type { ComponentProps } from 'react';

import { colors, type ColorToken } from './theme';

export type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

type IconProps = {
  name: IconName;
  size?: number;
  color?: ColorToken;
};

/**
 * Icono decorativo. Los iconos nunca van solos: siempre acompañan a un texto
 * o el contenedor padre define `accessibilityLabel`.
 */
export function Icon({ name, size = 22, color = 'onSurface' }: IconProps) {
  return (
    <MaterialCommunityIcons
      name={name}
      size={size}
      color={colors[color]}
      accessibilityElementsHidden
      importantForAccessibility="no"
    />
  );
}
